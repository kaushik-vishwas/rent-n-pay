import Vendor from '../../models/vendorAuthModel.js';
import bcrypt from 'bcryptjs';
import {
  sendVendorOtpEmail,
  sendVendorForgotPasswordOtp,
  sendVendorCancelledOrderEmail,
} from '../../utils/sendMail.js';
import jwt from 'jsonwebtoken';
import Product from '../../models/Product.js';
import Offer from '../../models/Offer.js';
import VendorKyc from '../../models/VendorKyc.js';
import crypto from 'crypto';
import Order from '../../models/Order.js';

const normalizeMobileDigits = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.length > 10 ? digits.slice(-10) : digits;
  }
  return digits;
};

/** Same as brevo-test + forgot-password: one canonical email per account. */
const normalizeEmail = (raw) =>
  String(raw || '')
    .trim()
    .toLowerCase();

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isTruthy = (value) =>
  ['1', 'true', 'yes', 'on'].includes(
    String(value || '')
      .trim()
      .toLowerCase(),
  );

const isVendorOtpBypassEnabled = () =>
  isTruthy(
    process.env.VENDOR_OTP_BYPASS_ENABLED || process.env.OTP_BYPASS_ENABLED,
  );

const getVendorDummyOtp = () => {
  const envOtp = String(
    process.env.VENDOR_DUMMY_OTP || process.env.DUMMY_OTP || '',
  ).trim();
  return /^\d{6}$/.test(envOtp) ? envOtp : '123456';
};

const shouldExposeSignupOtp = () =>
  isTruthy(
    process.env.VENDOR_SIGNUP_EXPOSE_OTP || process.env.EXPOSE_SIGNUP_OTP,
  );

const shouldSkipVendorOtpEmail = () =>
  isTruthy(
    process.env.VENDOR_SKIP_OTP_EMAIL || process.env.SKIP_VENDOR_OTP_EMAIL,
  );

const shouldExposeResetOtp = () =>
  isTruthy(process.env.VENDOR_RESET_EXPOSE_OTP || process.env.EXPOSE_RESET_OTP);

/** Finds vendor by normalized email, with case-insensitive fallback for legacy rows. */
const findVendorByEmail = async (raw) => {
  const email = normalizeEmail(raw);
  if (!email) return null;
  let v = await Vendor.findOne({ emailAddress: email });
  if (v) return v;
  return Vendor.findOne({
    emailAddress: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') },
  });
};

export const signupVendor = async (req, res) => {
  try {
    const { fullName, emailAddress, password, mobileNumber, referralCode } =
      req.body;

    const email = normalizeEmail(emailAddress);
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const mobile = normalizeMobileDigits(mobileNumber);
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({
        message: 'Valid mobile number is required (at least 10 digits)',
      });
    }

    const existing = await findVendorByEmail(emailAddress);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingMobile = await Vendor.findOne({ mobileNumber: mobile });
    if (existingMobile) {
      return res
        .status(400)
        .json({ message: 'Mobile number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const bypassEnabled = isVendorOtpBypassEnabled();
    const otp = bypassEnabled
      ? getVendorDummyOtp()
      : Math.floor(100000 + Math.random() * 900000).toString();

    const ref = String(referralCode || '')
      .trim()
      .slice(0, 64);

    const vendor = new Vendor({
      fullName: String(fullName || '').trim(),
      emailAddress: email,
      password: hashedPassword,
      mobileNumber: mobile,
      referralCode: ref,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000, // 5 mins
    });

    await vendor.save();

    const skipOtpEmail = shouldSkipVendorOtpEmail();
    if (!bypassEnabled && !skipOtpEmail) {
      await sendVendorOtpEmail(email, otp);
    }

    const exposeOtp = bypassEnabled || shouldExposeSignupOtp();
    const payload = {
      message:
        bypassEnabled || skipOtpEmail
          ? 'Signup successful, use test OTP to verify account'
          : 'Signup successful, OTP sent to email',
    };
    if (exposeOtp) {
      payload.testOtp = otp;
    }

    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;
    const email = normalizeEmail(emailAddress);
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const vendor = await findVendorByEmail(emailAddress);

    if (!vendor) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enteredOtp = String(otp || '').trim();
    const bypassEnabled = isVendorOtpBypassEnabled();
    const bypassOtp = getVendorDummyOtp();
    const isBypassMatch = bypassEnabled && enteredOtp === bypassOtp;
    const isStoredOtpMatch =
      String(vendor.otp || '') === enteredOtp &&
      vendor.otpExpire &&
      vendor.otpExpire >= Date.now();

    if (!isBypassMatch && !isStoredOtpMatch) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    vendor.isVerified = true;
    vendor.otp = null;
    vendor.otpExpire = null;
    vendor.emailAddress = email;

    await vendor.save();

    const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Account verified successfully',
      token,
      vendor: {
        id: vendor._id,
        fullName: vendor.fullName,
        emailAddress: vendor.emailAddress,
        mobileNumber: vendor.mobileNumber || '',
        referralCode: vendor.referralCode || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    const email = normalizeEmail(emailAddress);
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const vendor = await findVendorByEmail(emailAddress);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!vendor.isVerified) {
      return res.status(400).json({ message: 'Please verify your account' });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    //  IMPORTANT CHANGE HERE
    const token = jwt.sign(
      { vendorId: vendor._id }, //  must match middleware
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.json({
      message: 'Login successful',
      token,
      vendor: {
        id: vendor._id,
        fullName: vendor.fullName,
        emailAddress: vendor.emailAddress,
        mobileNumber: vendor.mobileNumber || '',
        referralCode: vendor.referralCode || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotVendorPassword = async (req, res) => {
  try {
    const { emailAddress } = req.body;
    if (!emailAddress) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const email = normalizeEmail(emailAddress);
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const vendor = await findVendorByEmail(emailAddress);

    // Keep response generic to avoid email enumeration.
    if (!vendor) {
      return res.json({
        message: 'If this email exists, an OTP has been sent.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    vendor.otp = otp;
    vendor.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await vendor.save();

    const skipOtpEmail = shouldSkipVendorOtpEmail();
    if (!skipOtpEmail) {
      // await sendVendorOtpEmail(vendor.emailAddress, otp);
      await sendVendorForgotPasswordOtp(vendor.emailAddress, otp);
    }

    const payload = {
      message: skipOtpEmail
        ? 'OTP generated for testing.'
        : 'If this email exists, an OTP has been sent.',
    };
    if (shouldExposeResetOtp()) {
      payload.testOtp = otp;
    }
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyVendorResetOtp = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;
    if (!emailAddress || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const vendor = await findVendorByEmail(emailAddress);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    if (
      String(vendor.otp) !== String(otp).trim() ||
      !vendor.otpExpire ||
      vendor.otpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    return res.json({ message: 'OTP verified' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetVendorPassword = async (req, res) => {
  try {
    const { emailAddress, otp, newPassword } = req.body;
    if (!emailAddress || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Email, OTP and newPassword are required' });
    }
    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }

    const vendor = await findVendorByEmail(emailAddress);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    if (
      String(vendor.otp) !== String(otp).trim() ||
      !vendor.otpExpire ||
      vendor.otpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    vendor.emailAddress = normalizeEmail(vendor.emailAddress);
    vendor.password = await bcrypt.hash(String(newPassword), 10);
    vendor.otp = null;
    vendor.otpExpire = null;
    await vendor.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const vendorLogout = async (req, res) => {
  try {
    console.log('Vendor Logout API Hit');

    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    return res.status(200).json({
      message: 'Vendor logged out successfully',
    });
  } catch (error) {
    console.error('Vendor logout error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ✅ Get All Vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select('-password -otp -otpExpire');

    res.status(200).json({
      message: 'All vendors fetched successfully',
      vendors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Vendor
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Cascade delete vendor-owned resources so products/offers won't show as "Unknown Vendor"
    await Promise.all([
      Product.deleteMany({ vendorId: id }),
      Offer.deleteMany({ vendorId: id }),
      VendorKyc.deleteMany({ vendorId: id }),
    ]);

    await Vendor.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkVendorEmailStartSelling = async (req, res) => {
  try {
    const { emailAddress } = req.body;
    const email = normalizeEmail(emailAddress);
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const vendor = await findVendorByEmail(emailAddress);

    if (!vendor) {
      return res.json({ exists: false });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    vendor.otp = otp;
    vendor.otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await vendor.save();

    await sendVendorOtpEmail(vendor.emailAddress, otp);

    return res.json({ exists: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify the "Start Selling" login OTP and issue a token
export const verifyStartSellingOtp = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;
    const vendor = await findVendorByEmail(emailAddress);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    if (!vendor.otp || !vendor.otpExpire || vendor.otpExpire < new Date()) {
      return res.status(400).json({ message: 'OTP expired, please try again' });
    }
    if (String(vendor.otp) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    vendor.otp = null;
    vendor.otpExpire = null;
    await vendor.save();

    const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      vendor: {
        id: vendor._id,
        fullName: vendor.fullName,
        emailAddress: vendor.emailAddress,
        mobileNumber: vendor.mobileNumber || '',
        referralCode: vendor.referralCode || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorRefundApprovals = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor not authenticated.' });
    }

    const orders = await Order.find({
      'products.returnRequest.refundInitiatedAt': { $ne: null },
    })
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        select: 'productName vendorId',
        populate: {
          path: 'vendorId',
          select: 'fullName shopName emailAddress',
        },
      });

    const rows = [];
    for (const order of orders) {
      for (const line of order.products || []) {
        const rr = line?.returnRequest;
        if (!rr?.refundInitiatedAt) continue;

        const product = line?.product;
        const lineVendorId = product?.vendorId?._id || product?.vendorId;
        if (String(lineVendorId) !== String(vendorId)) continue;

        rows.push({
          orderId: order._id,
          orderNumber: order.orderNumber || 0,
          lineId: line._id,
          productId: product?._id || null,
          customerName: order.user?.fullName || order.name || '-',
          productName: product?.productName || 'Product',
          refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
          damageDeduction: Math.max(0, Number(rr.damageDeduction || 0)),
          cleaningFees: Math.max(0, Number(rr.cleaningFees || 0)),
          totalDeduction: Math.max(0, Number(rr.totalDeduction || 0)),
          finalRefundAmount: Math.max(0, Number(rr.finalRefundAmount || 0)),
          qcCompletedAt: rr.qcCompletedAt || null,
          refundInitiatedAt: rr.refundInitiatedAt || null,
          refundApprovedAt: rr.refundApprovedAt || null,
          refundRejectedAt: rr.refundRejectedAt || null,
          refundPaidAt: rr.refundPaidAt || null,
          pickupDate: rr.pickupDate || rr.vendorPickupDate || null,
          refundTransactionId: rr.refundTransactionId || '',
          refundStatus: rr.refundApprovedAt
            ? 'approved'
            : rr.refundRejectedAt
              ? 'rejected'
              : 'pending',
          payoutStatus: rr.refundPaidAt ? 'paid' : 'pending',
        });
      }
    }

    rows.sort(
      (a, b) => new Date(b.refundInitiatedAt) - new Date(a.refundInitiatedAt),
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendorCancellations = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor not authenticated.' });
    }

    // const orders = await Order.find({
    //   'products.cancelledBy': 'user',
    //   'products.lineStatus': 'cancelled',
    // })
    const orders = await Order.find({
      'products.cancelledBy': { $in: ['user', 'vendor'] },
      'products.lineStatus': 'cancelled',
    })
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        select: 'productName vendorId',
        populate: { path: 'vendorId', select: '_id' },
      });

    const rows = [];
    for (const order of orders) {
      for (const line of order.products || []) {
        // if (line.cancelledBy !== 'user') continue;
        // if (line.lineStatus !== 'cancelled') continue;
        if (!['user', 'vendor'].includes(line.cancelledBy)) continue;
        if (line.lineStatus !== 'cancelled') continue;
        if (line?.returnRequest?.requestedAt) continue;

        const product = line?.product;
        const lineVendorId = product?.vendorId?._id || product?.vendorId;
        if (String(lineVendorId) !== String(vendorId)) continue;

        const rb = line?.refundBreakdown || {};

        // rows.push({
        //   orderId: order._id,
        //   orderNumber: order.orderNumber || 0,
        //   lineId: line._id,
        //   customerName: order.user?.fullName || order.name || '-',
        //   productName: product?.productName || 'Product',
        //   orderAmount: Number(rb.productPrice || 0),
        //   deduction: Number(rb.feeAmount || 0),
        //   refundAmount: Number(rb.refundAmount || 0),
        //   refundableDeposit: Number(rb.deposit || 0),
        //   cancelledAt: order.updatedAt || order.createdAt,
        //   refundStatus: line.cancelRefundStatus || 'pending',
        //   refundTransactionId: line.cancelRefundTransactionId || '',
        //   refundPaidAt: line.cancelRefundPaidAt || null,
        // });
        // Other taxes/fees — sum of order-level fee fields, same set
        // used on the customer-facing track/cancel pages. These are
        // stored on the order, not inside refundBreakdown.
        const otherTaxes =
          Number(order.gst || 0) +
          Number(order.careProtection || 0) +
          Number(order.repairWarranty || 0) +
          Number(order.relocationWarranty || 0) +
          Number(order.deliveryPackaging || 0) +
          Number(order.installationFee || 0) +
          Number(order.platformFee || 0) +
          Number(order.deliveryFee || 0);

        // rows.push({
        //   orderId: order._id,
        //   orderNumber: order.orderNumber || 0,
        //   lineId: line._id,
        //   customerName: order.user?.fullName || order.name || '-',
        //   productName: product?.productName || 'Product',
        //   orderAmount: Number(rb.productPrice || 0),
        //   deduction: Number(rb.feeAmount || 0),
        //   refundAmount: Number(rb.refundAmount || 0),
        //   refundableDeposit: Number(rb.deposit || 0),
        //   otherTaxes,
        //   cancelledAt: order.updatedAt || order.createdAt,
        //   refundStatus: line.cancelRefundStatus || 'pending',
        //   refundTransactionId: line.cancelRefundTransactionId || '',
        //   refundPaidAt: line.cancelRefundPaidAt || null,
        // });

        console.log(
          'DEBUG otherTaxes for order',
          order.orderNumber,
          otherTaxes,
          {
            gst: order.gst,
            careProtection: order.careProtection,
            repairWarranty: order.repairWarranty,
            relocationWarranty: order.relocationWarranty,
            deliveryPackaging: order.deliveryPackaging,
            installationFee: order.installationFee,
            platformFee: order.platformFee,
            deliveryFee: order.deliveryFee,
          },
        );

        //     rows.push({
        //       orderId: order._id,
        //       orderNumber: order.orderNumber || 0,
        //       lineId: line._id,
        //       customerName: order.user?.fullName || order.name || '-',
        //       productName: product?.productName || 'Product',
        //       orderAmount: Number(rb.productPrice || 0),
        //       deduction: Number(rb.feeAmount || 0),
        //       refundAmount: Number(rb.refundAmount || 0),
        //       refundableDeposit: Number(rb.deposit || 0),
        //       otherTaxes,
        //       cancelledAt: order.updatedAt || order.createdAt,
        //       refundStatus: line.cancelRefundStatus || 'pending',
        //       refundTransactionId: line.cancelRefundTransactionId || '',
        //       refundPaidAt: line.cancelRefundPaidAt || null,
        //     });
        //   }
        // }

        // rows.push({
        //   orderId: order._id,
        //   orderNumber: order.orderNumber || 0,
        //   lineId: line._id,
        //   customerName: order.user?.fullName || order.name || '-',
        //   productName: product?.productName || 'Product',
        //   orderAmount: Number(rb.productPrice || 0),
        //   deduction: Number(rb.feeAmount || 0),
        //   refundAmount: Number(rb.refundAmount || 0),
        //   refundableDeposit: Number(rb.deposit || 0),
        //   otherTaxes,
        //   cancelledAt: line.cancelledAt || order.updatedAt || order.createdAt,
        //   refundStatus: line.cancelRefundStatus || 'pending',
        //   refundTransactionId: line.cancelRefundTransactionId || '',
        //   refundPaidAt: line.cancelRefundPaidAt || null,
        // });
        // rows.push({
        //   orderId: order._id,
        //   orderNumber: order.orderNumber || 0,
        //   lineId: line._id,
        //   customerName: order.user?.fullName || order.name || '-',
        //   productName: product?.productName || 'Product',
        //   orderAmount:
        //     Number(rb.productPrice || 0) + Number(rb.deposit || 0) + otherTaxes,
        //   deduction: Number(rb.feeAmount || 0),
        //   refundAmount: Number(rb.refundAmount || 0) + otherTaxes,
        //   refundableDeposit: Number(rb.deposit || 0),
        //   otherTaxes,
        //   cancelledAt: line.cancelledAt || order.updatedAt || order.createdAt,
        //   refundStatus: line.cancelRefundStatus || 'pending',
        //   refundTransactionId: line.cancelRefundTransactionId || '',
        //   refundPaidAt: line.cancelRefundPaidAt || null,
        // });
        // Recompute deduction/refund the same way the customer-facing
        // cancel page does: the cancellation % is applied to the FULL
        // paid amount (product price + deposit + other taxes), not just
        // the product price. rb.feeAmount/refundAmount were stored using
        // the old (product-price-only) calculation, so they're not used
        // here directly — only rb.feePct (the % itself) is trusted.
        // const totalPaidAmount =
        //   Number(rb.productPrice || 0) + Number(rb.deposit || 0) + otherTaxes;
        // const feePct = Number(rb.feePct || 10);
        // const recomputedDeduction =
        //   totalPaidAmount > 0
        //     ? Math.round((totalPaidAmount * feePct) / 100)
        //     : 0;
        // const recomputedRefund = Math.max(
        //   0,
        //   totalPaidAmount - recomputedDeduction,
        // );

        // rows.push({
        //   orderId: order._id,
        //   orderNumber: order.orderNumber || 0,
        //   lineId: line._id,
        //   customerName: order.user?.fullName || order.name || '-',
        //   productName: product?.productName || 'Product',
        //   orderAmount: totalPaidAmount,
        //   deduction: recomputedDeduction,
        //   refundAmount: recomputedRefund,
        //   refundableDeposit: Number(rb.deposit || 0),
        //   otherTaxes,
        //   cancelledAt: line.cancelledAt || order.updatedAt || order.createdAt,
        //   refundStatus: line.cancelRefundStatus || 'pending',
        //   refundTransactionId: line.cancelRefundTransactionId || '',
        //   refundPaidAt: line.cancelRefundPaidAt || null,
        // });

        const totalPaidAmount =
          Number(rb.productPrice || 0) + Number(rb.deposit || 0) + otherTaxes;

        // Vendor-initiated cancellations are always a 0% fee, full refund
        // — vendor is at fault, so the customer isn't charged.
        const isVendorCancelled = line.cancelledBy === 'vendor';
        const feePct = isVendorCancelled ? 0 : Number(rb.feePct || 10);
        const recomputedDeduction = isVendorCancelled
          ? 0
          : totalPaidAmount > 0
            ? Math.round((totalPaidAmount * feePct) / 100)
            : 0;
        const recomputedRefund = isVendorCancelled
          ? totalPaidAmount
          : Math.max(0, totalPaidAmount - recomputedDeduction);

        rows.push({
          orderId: order._id,
          orderNumber: order.orderNumber || 0,
          lineId: line._id,
          customerName: order.user?.fullName || order.name || '-',
          productName: product?.productName || 'Product',
          orderAmount: totalPaidAmount,
          deduction: recomputedDeduction,
          refundAmount: recomputedRefund,
          refundableDeposit: Number(rb.deposit || 0),
          otherTaxes,
          cancelledAt: line.cancelledAt || order.updatedAt || order.createdAt,
          refundStatus: line.cancelRefundStatus || 'pending',
          refundTransactionId: line.cancelRefundTransactionId || '',
          refundPaidAt: line.cancelRefundPaidAt || null,
          cancelledBy: line.cancelledBy || 'user',
        });
      }
    }

    rows.sort((a, b) => new Date(b.cancelledAt) - new Date(a.cancelledAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelVendorOrderLine = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.vendor?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Vendor not authenticated.' });
    }

    const { productId } = req.body || {};
    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    const order = await Order.findById(req.params.id).populate({
      path: 'products.product',
      select: 'productName vendorId',
      populate: { path: 'vendorId', select: '_id' },
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const targetLine = order.products.find(
      (l) =>
        String(l._id) === String(productId) ||
        String(l.product?._id || l.product) === String(productId),
    );
    if (!targetLine) {
      return res.status(404).json({ message: 'Product line not found.' });
    }

    const lineVendorId =
      targetLine.product?.vendorId?._id || targetLine.product?.vendorId;
    if (String(lineVendorId) !== String(vendorId)) {
      return res
        .status(403)
        .json({ message: 'This item does not belong to your account.' });
    }

    const st = String(order.status || '');
    const lineEffectiveStatus = targetLine.lineStatus || st;
    if (!['pending', 'confirmed', 'shipped'].includes(lineEffectiveStatus)) {
      return res
        .status(400)
        .json({ message: 'This item cannot be cancelled.' });
    }

    // Restore stock, same as user-cancel
    if (['pending', 'confirmed'].includes(lineEffectiveStatus)) {
      const product = await Product.findById(
        targetLine.product?._id || targetLine.product,
      );
      if (product) {
        const q = Math.max(1, Number(targetLine.quantity || 1));
        const next = Number(product.stock || 0) + q;
        product.stock = next;
        product.status =
          next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
        await product.save();
      }
    }

    // // Vendor-fault cancellation: 0% fee, full refund of product price + deposit
    // const isPurchase =
    //   String(targetLine.productType || '').toLowerCase() === 'sell';
    // const productPrice =
    //   Number(targetLine.pricePerDay || targetLine.price || 0) *
    //   Math.max(1, Number(targetLine.quantity || 1));
    // const deposit = isPurchase ? 0 : Number(targetLine.refundableDeposit || 0);
    // targetLine.refundBreakdown = {
    //   productPrice,
    //   deposit,
    //   feePct: 0,
    //   feeAmount: 0,
    //   refundAmount: productPrice + deposit,
    // };

    // Vendor-fault cancellation: 0% fee, full refund of product price + deposit + taxes
    const isPurchase =
      String(targetLine.productType || '').toLowerCase() === 'sell';
    const productPrice =
      Number(targetLine.pricePerDay || targetLine.price || 0) *
      Math.max(1, Number(targetLine.quantity || 1));
    const deposit = isPurchase ? 0 : Number(targetLine.refundableDeposit || 0);

    // Match the same "other taxes" the vendor table/order-details modal shows
    // (gst + careProtection + repairWarranty + relocationWarranty +
    // deliveryPackaging + installationFee), so the email total lines up
    // with the Amount column vendor already sees in Processing/Dispatched tabs.
    const otherTaxes =
      Number(order?.gst || 0) +
      Number(order?.careProtection || 0) +
      Number(order?.repairWarranty || 0) +
      Number(order?.relocationWarranty || 0) +
      Number(order?.deliveryPackaging || 0) +
      Number(order?.installationFee || 0);

    const fullTotalAmount = productPrice + deposit + otherTaxes;

    targetLine.refundBreakdown = {
      productPrice,
      deposit,
      otherTaxes,
      feePct: 0,
      feeAmount: 0,
      refundAmount: fullTotalAmount,
    };

    targetLine.lineStatus = 'cancelled';
    targetLine.cancelledBy = 'vendor';
    targetLine.cancelledAt = new Date();

    // Recalculate order-level status from all lines (same as user-cancel)
    const statusRank = {
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
      completed: 4,
      cancelled: 5,
    };
    const allStatuses = order.products.map((l) => l.lineStatus || 'pending');
    const nonCancelled = allStatuses.filter((s) => s !== 'cancelled');
    if (nonCancelled.length) {
      const minRank = Math.min(...nonCancelled.map((s) => statusRank[s] ?? 0));
      order.status =
        Object.keys(statusRank).find((k) => statusRank[k] === minRank) ||
        order.status;
    } else {
      order.status = 'cancelled';
    }

    // await order.save();

    // const populated = await Order.findById(order._id)
    //   .populate('user', 'fullName emailAddress')
    //   .populate({
    //     path: 'products.product',
    //     populate: { path: 'vendorId', select: 'fullName emailAddress' },
    //   });
    // res.json(populated);
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });

    // Notify the customer via email that the vendor cancelled this item
    try {
      const customerEmail = populated?.user?.emailAddress;
      if (customerEmail) {
        // await sendVendorCancelledOrderEmail(customerEmail, {
        //   customerName: populated?.user?.fullName || order.name || 'Customer',
        //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
        //   productName: targetLine.product?.productName || 'Product',
        //   productAmount: targetLine.refundBreakdown.productPrice,
        //   refundableDeposit: targetLine.refundBreakdown.deposit,
        //   otherTaxes: 0,
        //   deduction: targetLine.refundBreakdown.feeAmount,
        //   fullRefundAmount: targetLine.refundBreakdown.refundAmount,
        // });

        await sendVendorCancelledOrderEmail(customerEmail, {
          customerName: populated?.user?.fullName || order.name || 'Customer',
          displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
          productName: targetLine.product?.productName || 'Product',
          // Show ONE total amount (matches the table's Amount column),
          // instead of separate product/deposit/tax rows.
          totalAmount: targetLine.refundBreakdown.refundAmount,
          deduction: targetLine.refundBreakdown.feeAmount,
          fullRefundAmount: targetLine.refundBreakdown.refundAmount,
        });
      }
    } catch (emailErr) {
      // Don't fail the cancellation if the email fails to send
      console.error('Failed to send vendor-cancellation email:', emailErr);
    }

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
