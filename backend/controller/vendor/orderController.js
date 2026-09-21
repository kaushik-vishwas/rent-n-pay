import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import VendorKyc from '../../models/VendorKyc.js';
import UserKyc from '../../models/UserKyc.js';
import { uploadMediaToCloudinary } from '../../config/cloudinaryUpload.js';
import {
  sendDeliveryOtpEmail,
  sendServiceCompletionOtpEmail,
  sendReturnCompletedEmail,
} from '../../utils/sendMail.js';
import ServiceBooking from '../../models/ServiceBooking.js';
import { enrichOrderProductsWithListingTemplateVendorRents } from '../../utils/listingTemplateVendorRent.js';

const vendorOrderPopulate = [
  { path: 'user', select: 'fullName emailAddress mobileNumber' },
  {
    path: 'products.product',
    select:
      'productName image images variants vendorId brand logisticsVerification category subCategory stock rentalConfigurations createdVia salesConfiguration type refundableDeposit',
  },
];

const packOrderPopulate = [
  { path: 'user', select: 'fullName emailAddress' },
  {
    path: 'products.product',
    select:
      'productName image images variants vendorId stock logisticsVerification category subCategory rentalConfigurations createdVia salesConfiguration type refundableDeposit',
  },
];

/** Orders that include at least one line for this vendor's products. */
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const productIds = await Product.find({ vendorId }).distinct('_id');
    if (!productIds.length) {
      return res.json([]);
    }
    const orders = await Order.find({ 'products.product': { $in: productIds } })
      .populate(vendorOrderPopulate)
      .sort({ createdAt: -1 })
      .lean();
    await enrichOrderProductsWithListingTemplateVendorRents(orders);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const confirmVendorRelocation = async (req, res) => {
  try {
    const { productId } = req.body || {};
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const targetLine = (order.products || []).find(
      (line) => String(line?.product || '') === String(productId || ''),
    );
    if (!targetLine || !targetLine.relocationRequest?.requestedAt) {
      return res
        .status(400)
        .json({ message: 'Relocation request not found for this product.' });
    }

    targetLine.relocationRequest.status = 'confirmed';
    targetLine.relocationRequest.scheduledAt = new Date();

    await order.save();

    const populated = await Order.findById(order._id).populate(
      vendorOrderPopulate,
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendorOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate(vendorOrderPopulate)
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vid = String(req.vendor._id);
    const owns = (order.products || []).some((line) => {
      const p = line.product;
      if (!p || typeof p === 'string') return false;
      return String(p.vendorId) === vid;
    });
    if (!owns) {
      return res
        .status(403)
        .json({ message: 'This order does not include your products' });
    }

    await enrichOrderProductsWithListingTemplateVendorRents([order]);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendorOrderPackDetail = async (req, res) => {
  try {
    const { productId } = req.query; // ← read from query string

    const order = await Order.findById(req.params.id).populate(
      packOrderPopulate,
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vid = String(req.vendor._id);

    // Find the specific line for this vendor + productId
    const targetLine = (order.products || []).find((line) => {
      const p = line.product;
      if (!p || typeof p === 'string') return false;
      if (String(p.vendorId) !== vid) return false;
      if (productId && String(p._id) !== String(productId)) return false;
      return true;
    });

    if (!targetLine) {
      return res
        .status(403)
        .json({ message: 'This order does not include your products' });
    }

    // ── Check THIS line's status only ──
    const effectiveStatus = targetLine.lineStatus || order.status;
    if (!['pending', 'confirmed'].includes(effectiveStatus)) {
      return res.status(400).json({
        message: 'This order is not in packing (pending or confirmed).',
        code: 'INVALID_STATUS',
        status: effectiveStatus,
      });
    }

    // const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id })
    //   .select('businessDetails.gstin')
    //   .lean();
    // const vendorGstin = kyc?.businessDetails?.gstin || '';

    // res.json({ order, vendorGstin });
    // const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id })
    //   .select('businessDetails.gstin')
    //   .lean();
    // const vendorGstin = kyc?.businessDetails?.gstin || '';

    // // Same KYC check used in sendVendorDeliveryOtp — surfaced here so the
    // // pack page can show "Delivery Blocked" before the vendor even reaches
    // // the ship/OTP step, without duplicating or changing that logic.
    // const userKyc = await UserKyc.findOne({ userId: order.user?._id }).lean();
    // const kycStatus = String(userKyc?.status || 'not_submitted');
    // const kycBlocked = kycStatus !== 'approved';
    // const kycBlockedMessage = kycBlocked
    //   ? kycStatus === 'pending' || kycStatus === 'in_review'
    //     ? "Customer's KYC has been submitted and is awaiting admin approval. Delivery cannot proceed until it is approved."
    //     : kycStatus === 'rejected'
    //       ? "Customer's KYC was rejected. Please ask the customer to resubmit their documents before delivery."
    //       : 'Customer KYC has not been completed. Please ask the customer to complete KYC before delivery.'
    //   : '';

    // res.json({ order, vendorGstin, kycBlocked, kycBlockedMessage, kycStatus });

    // const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id })
    //   .select('businessDetails.gstin')
    //   .lean();
    // const vendorGstin = kyc?.businessDetails?.gstin || '';

    // // Same KYC check used in sendVendorDeliveryOtp — surfaced here so the

    const kyc = await VendorKyc.findOne({ vendorId: req.vendor._id })
      .select(
        'businessDetails.gstin businessDetails.shopName storeManagement.stores',
      )
      .lean();
    const vendorGstin = kyc?.businessDetails?.gstin || '';
    const vendorName = kyc?.businessDetails?.shopName || '';
    const vendorStore =
      (kyc?.storeManagement?.stores || []).find((s) => s.isDefault) ||
      (kyc?.storeManagement?.stores || [])[0] ||
      null;
    const vendorStoreName = vendorStore?.storeName || '';
    const vendorAddress = vendorStore
      ? [vendorStore.completeAddress, vendorStore.city, vendorStore.pincode]
          .filter(Boolean)
          .join(', ')
      : '';

    // Same KYC check used in sendVendorDeliveryOtp — surfaced here so the
    // pack page can show "Delivery Blocked" before the vendor even reaches
    // the ship/OTP step, without duplicating or changing that logic.
    const userKyc = await UserKyc.findOne({ userId: order.user?._id }).lean();
    const kycStatus = String(userKyc?.status || 'not_submitted');
    const kycBlocked = kycStatus !== 'approved';
    const kycBlockedMessage = kycBlocked
      ? kycStatus === 'pending' || kycStatus === 'in_review'
        ? "Customer's KYC has been submitted and is awaiting admin approval. Delivery cannot proceed until it is approved."
        : kycStatus === 'rejected'
          ? "Customer's KYC was rejected. Please ask the customer to resubmit their documents before delivery."
          : 'Customer KYC has not been completed. Please ask the customer to complete KYC before delivery.'
      : '';

    // Flag this line the moment the vendor views the pack page (same moment
    // the "Delivery Blocked" banner shows) so the customer's notification
    // list picks it up immediately — only write when the flag actually
    // changes, to avoid an extra save on every page view.
    if (Boolean(targetLine.deliveryBlockedByKyc) !== kycBlocked) {
      targetLine.deliveryBlockedByKyc = kycBlocked;
      await order.save();
    }

    //     res.json({ order, vendorGstin, kycBlocked, kycBlockedMessage, kycStatus });
    //   } catch (err) {
    //     res.status(500).json({ message: err.message });
    //   }
    // };
    res.json({
      order,
      vendorGstin,
      vendorName,
      vendorStoreName,
      vendorAddress,
      kycBlocked,
      kycBlockedMessage,
      kycStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const vendorMarkOrderShipped = async (req, res) => {
  try {
    const { packingChecklist, delivery, productId } = req.body || {};

    if (!productId) {
      return res.status(400).json({
        message: 'productId is required to mark a specific item shipped.',
      });
    }

    const chk = packingChecklist || {};
    if (!chk.verifyQuality || !chk.packSecurely || !chk.labelPasted) {
      return res
        .status(400)
        .json({ message: 'Complete all packing checklist items first.' });
    }

    const method = delivery?.method === 'third_party' ? 'third_party' : 'self';
    const driverName = String(delivery?.driverName || '').trim();
    const driverPhone = String(delivery?.driverPhone || '').trim();
    if (method === 'self' && (!driverName || !driverPhone)) {
      return res.status(400).json({
        message:
          'Driver name and phone are required for self / staff delivery.',
      });
    }

    const order = await Order.findById(req.params.id).populate(
      'products.product',
      'vendorId',
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vid = String(req.vendor._id);

    // ── Find ONLY the specific line ──
    const targetLine = order.products.find((line) => {
      const p = line.product;
      if (!p || typeof p === 'string') return false;
      return String(p.vendorId) === vid && String(p._id) === String(productId);
    });

    if (!targetLine) {
      return res
        .status(404)
        .json({ message: 'Product line not found for this vendor.' });
    }

    const effectiveStatus = targetLine.lineStatus || order.status;
    if (!['pending', 'confirmed'].includes(effectiveStatus)) {
      return res.status(400).json({
        message: 'This item cannot be marked shipped from its current state.',
      });
    }

    // // ── Update ONLY this line's status ──
    // targetLine.lineStatus = 'shipped';
    // ── Update ONLY this line's status ──
    targetLine.lineStatus = 'shipped';

    // Flag delivery-blocking KYC status right when the item is packed &
    // shipped, so the customer gets notified immediately (not only when
    // the vendor later attempts to send the delivery OTP).
    const userKycAtShip = await UserKyc.findOne({ userId: order.user }).lean();
    const kycStatusAtShip = String(userKycAtShip?.status || 'not_submitted');
    targetLine.deliveryBlockedByKyc = kycStatusAtShip !== 'approved';

    // Recalculate order-level status from ALL lines
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

    order.vendorFulfillment = {
      packingChecklist: {
        verifyQuality: true,
        packSecurely: true,
        labelPasted: true,
      },
      markedPackedAt: new Date(),
      delivery: {
        method,
        driverName,
        driverPhone,
        vehicleNumber: String(delivery?.vehicleNumber || '').trim(),
        markedShippedAt: new Date(),
      },
    };

    await order.save();

    const populated = await Order.findById(order._id).populate(
      vendorOrderPopulate,
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateVendorLineStatus = async (req, res) => {
  try {
    const { productId, lineStatus } = req.body || {};
    const allowed = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
    ];

    if (!productId || !allowed.includes(lineStatus)) {
      return res
        .status(400)
        .json({ message: 'productId and valid lineStatus are required' });
    }

    const order = await Order.findById(req.params.id).populate(
      'products.product',
      'vendorId',
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vid = String(req.vendor._id);
    const line = order.products.find((l) => {
      const p = l.product;
      if (!p || typeof p === 'string') return false;
      return String(p.vendorId) === vid && String(p._id) === String(productId);
    });

    if (!line)
      return res
        .status(404)
        .json({ message: 'Product line not found for this vendor' });

    line.lineStatus = lineStatus;

    // Recalculate order-level status from all lines
    const statusRank = {
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
      completed: 4,
      cancelled: 5,
    };
    const allStatuses = order.products.map((l) => l.lineStatus || order.status);
    const nonCancelled = allStatuses.filter((s) => s !== 'cancelled');
    if (nonCancelled.length) {
      const minRank = Math.min(...nonCancelled.map((s) => statusRank[s] ?? 0));
      order.status =
        Object.keys(statusRank).find((k) => statusRank[k] === minRank) ||
        order.status;
    } else {
      order.status = 'cancelled';
    }

    await order.save();

    const populated = await Order.findById(order._id).populate(
      vendorOrderPopulate,
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { status, productId, reason } = req.body || {}; // ← also accept productId, reason

    const order = await Order.findById(req.params.id).populate(
      'products.product',
      'vendorId',
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vid = String(req.vendor._id);

    if (productId) {
      // ── Update ONLY the specific line ──
      const targetLine = order.products.find((line) => {
        const p = line.product;
        if (!p || typeof p === 'string') return false;
        return (
          String(p.vendorId) === vid && String(p._id) === String(productId)
        );
      });

      if (!targetLine) {
        return res
          .status(404)
          .json({ message: 'Product line not found for this vendor.' });
      }

      targetLine.lineStatus = status;
      if (status === 'cancelled') {
        targetLine.cancelledBy = 'vendor';
        targetLine.cancelReason = String(reason || '').slice(0, 300);
      }
      // When vendor confirms, mark order as acknowledged so it appears in table
      if (status === 'confirmed' || status === 'cancelled') {
        order.vendorAcknowledged = true;
        order.vendorAcknowledgedAt = new Date();
      }

      // Recalculate order-level status
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
        const minRank = Math.min(
          ...nonCancelled.map((s) => statusRank[s] ?? 0),
        );
        order.status =
          Object.keys(statusRank).find((k) => statusRank[k] === minRank) ||
          order.status;
      } else {
        order.status = 'cancelled';
      }
    } else {
      if (status) order.status = status;
      if (status === 'confirmed' || status === 'cancelled') {
        order.vendorAcknowledged = true;
        order.vendorAcknowledgedAt = new Date();
        // Sync ALL this vendor's line statuses so lineStatus matches
        for (const line of order.products) {
          const p = line.product;
          if (!p || typeof p === 'string') continue;
          if (String(p.vendorId) !== vid) continue;
          line.lineStatus = status;
          // ← ADD THIS:
          if (status === 'cancelled') {
            line.cancelledBy = 'vendor';
            line.cancelReason = String(reason || '').slice(0, 300);
          }
        }
      }
    }

    await order.save();

    const populated = await Order.findById(order._id).populate(
      vendorOrderPopulate,
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const scheduleVendorReturnPickup = async (req, res) => {
  try {
    const { productId, pickupDate, pickupTime, driverName, pickupAddress } =
      req.body || {};

    const parsedPickupDate = new Date(pickupDate);
    if (!pickupDate || Number.isNaN(parsedPickupDate.getTime())) {
      return res
        .status(400)
        .json({ message: 'Valid pickup date is required.' });
    }

    const timeSlot = ['Morning', 'Afternoon', 'Evening'].includes(
      String(pickupTime || ''),
    )
      ? String(pickupTime)
      : null;
    if (!timeSlot) {
      return res
        .status(400)
        .json({ message: 'Valid pickup time is required.' });
    }

    const safeDriverName = String(driverName || '').trim();
    if (!safeDriverName) {
      return res.status(400).json({ message: 'Driver name is required.' });
    }

    const order = await Order.findById(req.params.id).populate(
      'products.product',
      'vendorId type',
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vid = String(req.vendor._id);
    const targetLine = (order.products || []).find((line) => {
      const p = line?.product;
      if (!p || typeof p === 'string') return false;
      if (String(p.vendorId || '') !== vid) return false;
      if (String(p.type || '').toLowerCase() === 'sell') return false;
      if (productId && String(p._id || '') !== String(productId)) return false;
      const rr = line?.returnRequest;
      return Boolean(rr?.requestedAt);
    });

    if (!targetLine) {
      return res.status(404).json({
        message: 'Return request line not found for this vendor.',
      });
    }

    const resolvedPickupAddress =
      String(pickupAddress || '').trim() || String(order.address || '').trim();
    if (
      !targetLine.returnRequest ||
      typeof targetLine.returnRequest !== 'object'
    ) {
      targetLine.returnRequest = {};
    }
    if (
      !targetLine.returnRequest.refundDetails ||
      typeof targetLine.returnRequest.refundDetails !== 'object'
    ) {
      targetLine.returnRequest.refundDetails = {};
    }
    targetLine.returnRequest.vendorPickupDate = parsedPickupDate;
    targetLine.returnRequest.vendorPickupTime = timeSlot;
    targetLine.returnRequest.vendorPickupAddress = resolvedPickupAddress;
    targetLine.returnRequest.vendorDriverName = safeDriverName;
    targetLine.returnRequest.pickupScheduledAt = new Date();

    await order.save();

    const populated = await Order.findById(order._id).populate(
      vendorOrderPopulate,
    );
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeVendorReturnInspection = async (req, res) => {
  try {
    const {
      productId,
      inspectionChecklist,
      pickupPhotoName,
      damageDeduction,
      cleaningFees,
      authorizeRefund,
    } = req.body || {};

    if (!authorizeRefund) {
      return res.status(400).json({
        message: 'Authorization is required to initiate refund.',
      });
    }

    const order = await Order.findById(req.params.id).populate(
      'products.product',
      'vendorId type',
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vid = String(req.vendor._id);
    const targetLine = (order.products || []).find((line) => {
      const p = line?.product;
      if (!p || typeof p === 'string') return false;
      if (String(p.vendorId || '') !== vid) return false;
      if (String(p.type || '').toLowerCase() === 'sell') return false;
      if (productId && String(p._id || '') !== String(productId)) return false;
      return Boolean(line?.returnRequest?.pickupScheduledAt);
    });

    if (!targetLine) {
      return res.status(404).json({
        message: 'Pickup-scheduled return line not found for this vendor.',
      });
    }

    // const safeDamage = Math.max(0, Number(damageDeduction || 0));
    let uploadedPhotoUrl = '';
    if (req.file) {
      const mime = String(req.file?.mimetype || '').toLowerCase();
      if (!mime.startsWith('image/')) {
        return res.status(400).json({
          message: 'Only image files are allowed for pickup photo.',
        });
      }
      const mediaRes = await uploadMediaToCloudinary(
        req.file.buffer,
        'return-reviews',
      );
      uploadedPhotoUrl = String(mediaRes?.secure_url || '');
    }

    const safeDamage = Math.max(0, Number(damageDeduction || 0));
    const safeCleaning = Math.max(0, Number(cleaningFees || 0));
    const totalDeduction = safeDamage + safeCleaning;
    const depositHeld = Math.max(0, Number(targetLine?.refundableDeposit || 0));
    const finalRefundAmount = Math.max(0, depositHeld - totalDeduction);

    if (
      !targetLine.returnRequest ||
      typeof targetLine.returnRequest !== 'object'
    ) {
      targetLine.returnRequest = {};
    }
    if (
      !targetLine.returnRequest.refundDetails ||
      typeof targetLine.returnRequest.refundDetails !== 'object'
    ) {
      targetLine.returnRequest.refundDetails = {};
    }

    // const checklist = inspectionChecklist || {};
    let checklist = inspectionChecklist || {};
    if (typeof checklist === 'string') {
      try {
        checklist = JSON.parse(checklist);
      } catch {
        checklist = {};
      }
    }
    targetLine.returnRequest.inspectionChecklist = {
      powerFunctionCheck: Boolean(checklist.powerFunctionCheck),
      surfaceScratches: Boolean(checklist.surfaceScratches),
      structuralIntegrity: Boolean(checklist.structuralIntegrity),
      accessoriesAccountedFor: Boolean(checklist.accessoriesAccountedFor),
      cleanlinessCheck: Boolean(checklist.cleanlinessCheck),
    };
    // targetLine.returnRequest.pickupPhotoName = String(
    //   pickupPhotoName || '',
    // ).trim();
    // targetLine.returnRequest.damageDeduction = safeDamage;
    targetLine.returnRequest.pickupPhotoName = String(
      pickupPhotoName || '',
    ).trim();
    if (uploadedPhotoUrl) {
      targetLine.returnRequest.pickupPhotoUrl = uploadedPhotoUrl;
    }
    targetLine.returnRequest.damageDeduction = safeDamage;
    targetLine.returnRequest.cleaningFees = safeCleaning;
    targetLine.returnRequest.totalDeduction = totalDeduction;
    targetLine.returnRequest.finalRefundAmount = finalRefundAmount;
    // targetLine.returnRequest.qcCompletedAt = new Date();
    // targetLine.returnRequest.refundInitiatedAt = new Date();
    // order.status = 'completed';

    // await order.save();

    // const populated = await Order.findById(order._id).populate(
    //   vendorOrderPopulate,
    // );
    // res.json(populated);
    targetLine.returnRequest.qcCompletedAt = new Date();
    targetLine.returnRequest.refundInitiatedAt = new Date();
    order.status = 'completed';

    await order.save();

    const populated = await Order.findById(order._id).populate(
      vendorOrderPopulate,
    );

    try {
      const emailOrder = await Order.findById(order._id)
        .populate('user', 'fullName emailAddress')
        .populate('products.product', 'productName');

      const emailLine = (emailOrder.products || []).find(
        (l) => String(l._id) === String(targetLine._id),
      );

      if (emailOrder.user?.emailAddress && emailLine) {
        await sendReturnCompletedEmail(
          emailOrder.user.emailAddress,
          emailOrder.user.fullName,
          emailOrder,
          emailLine,
        );
      }
    } catch (mailErr) {
      console.error(
        'Return-completed email failed for order',
        order._id,
        ':',
        mailErr?.message || mailErr,
      );
    }

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendVendorDeliveryOtp = async (req, res) => {
  try {
    const { productId } = req.body || {};
    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'fullName emailAddress')
      .populate('products.product', 'vendorId productName');

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const vid = String(req.vendor._id);
    const targetLine = (order.products || []).find((line) => {
      const p = line?.product;
      if (!p || typeof p === 'string') return false;
      return String(p.vendorId) === vid && String(p._id) === String(productId);
    });

    if (!targetLine) {
      return res
        .status(404)
        .json({ message: 'Product line not found for this vendor.' });
    }

    if (targetLine.lineStatus !== 'shipped') {
      return res
        .status(400)
        .json({ message: 'OTP can only be sent for shipped items.' });
    }

    // Block delivery until the customer's KYC has been approved. Flag the
    // line so the customer sees a "Complete KYC" notification/prompt.
    const kyc = await UserKyc.findOne({ userId: order.user?._id }).lean();
    const kycStatus = String(kyc?.status || 'not_submitted');
    if (kycStatus !== 'approved') {
      targetLine.deliveryBlockedByKyc = true;
      await order.save();

      const blockMessage =
        kycStatus === 'pending' || kycStatus === 'in_review'
          ? "Customer's KYC has been submitted and is awaiting admin approval. Delivery cannot proceed until it is approved."
          : kycStatus === 'rejected'
            ? "Customer's KYC was rejected. Please ask the customer to resubmit their documents before delivery."
            : 'Customer KYC has not been completed. Please ask the customer to complete KYC before delivery.';

      return res.status(403).json({
        message: blockMessage,
        kycBlocked: true,
        kycStatus,
      });
    }

    // KYC is approved — clear any earlier block flag before proceeding.
    if (targetLine.deliveryBlockedByKyc) {
      targetLine.deliveryBlockedByKyc = false;
    }

    // Generate fresh 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    // const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const otpExpire = new Date(Date.now() + 30 * 60 * 1000);

    targetLine.deliveryOtp = otp;
    targetLine.deliveryOtpExpire = otpExpire;
    await order.save();

    // Send to customer
    const customerEmail = order.user?.emailAddress;
    const customerName = order.user?.fullName;
    const productName = targetLine.product?.productName || 'your item';

    if (!customerEmail) {
      return res.status(400).json({ message: 'Customer email not found.' });
    }

    await sendDeliveryOtpEmail(customerEmail, otp, productName, customerName);

    res.json({ success: true, message: 'OTP sent to customer email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendServiceCompletionOtp = async (req, res) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id).populate(
      'user',
      'fullName emailAddress',
    );

    if (!booking) {
      return res.status(404).json({ message: 'Service booking not found.' });
    }

    if (String(booking.vendor) !== String(req.vendor._id)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!['confirmed', 'in_progress'].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: 'OTP can only be sent for active bookings.' });
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const otpExpire = new Date(Date.now() + 30 * 60 * 1000);

    booking.completionOtp = otp;
    booking.completionOtpExpire = otpExpire;
    await booking.save();

    const customerEmail = booking.user?.emailAddress;
    const customerName = booking.user?.fullName;
    const serviceName = booking.serviceSnapshot?.productName || 'your service';

    if (!customerEmail) {
      return res.status(400).json({ message: 'Customer email not found.' });
    }

    await sendServiceCompletionOtpEmail(
      customerEmail,
      otp,
      serviceName,
      customerName,
    );

    res.json({ success: true, message: 'OTP sent to customer email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendorServiceBookingById = async (req, res) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id)
      .populate('user', 'fullName emailAddress')
      .populate('serviceProduct', 'productName image');

    if (!booking) {
      return res.status(404).json({ message: 'Service booking not found.' });
    }
    if (String(booking.vendor) !== String(req.vendor._id)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelVendorServiceBookingByVendor = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const booking = await ServiceBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Service booking not found.' });
    }
    if (String(booking.vendor) !== String(req.vendor._id)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: 'This booking cannot be cancelled anymore.' });
    }

    // booking.status = 'cancelled';
    // booking.cancelledBy = 'vendor';
    // booking.cancelledAt = new Date();
    // booking.cancelReason = String(reason || 'Vendor unavailable').slice(0, 300);
    // await booking.save();

    // booking.status = 'cancelled';
    // booking.cancelledBy = 'vendor';
    // booking.cancelledAt = new Date();
    // booking.cancelReason = String(reason || 'Vendor unavailable').slice(0, 300);
    // // Vendor-initiated cancellations are never the customer's fault —
    // // always issue a full refund, no late fee deduction.
    // booking.refundAmount = Number(booking.totalAmount || 0);
    // booking.lateFee = 0;
    // await booking.save();
    booking.status = 'cancelled';
    booking.cancelledBy = 'vendor';
    booking.cancelledAt = new Date();
    booking.cancelReason = String(reason || 'Vendor unavailable').slice(0, 300);
    // Vendor-initiated cancellations are never the customer's fault —
    // always issue a full refund, no late fee deduction.
    // Exception: "Pay After Service" bookings were never actually paid for,
    // so there is nothing to refund.
    const isPayAfterService = booking.paymentMethod === 'pay_after_service';
    booking.refundAmount = isPayAfterService
      ? 0
      : Number(booking.totalAmount || 0);
    booking.lateFee = 0;
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled.', data: booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyServiceCompletionOtp = async (req, res) => {
  try {
    const { otp } = req.body || {};
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }

    const booking = await ServiceBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Service booking not found.' });
    }

    if (String(booking.vendor) !== String(req.vendor._id)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (
      !booking.completionOtp ||
      !booking.completionOtpExpire ||
      booking.completionOtpExpire < new Date()
    ) {
      return res
        .status(400)
        .json({ message: 'OTP expired. Please resend OTP.' });
    }

    if (String(booking.completionOtp) !== String(otp)) {
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    booking.completionOtp = null;
    booking.completionOtpExpire = null;
    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Service marked as completed.',
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyVendorDeliveryOtp = async (req, res) => {
  try {
    const { productId, otp } = req.body || {};
    if (!productId || !otp) {
      return res
        .status(400)
        .json({ message: 'productId and otp are required.' });
    }

    const order = await Order.findById(req.params.id).populate(
      'products.product',
      'vendorId',
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const vid = String(req.vendor._id);
    const targetLine = (order.products || []).find((line) => {
      const p = line?.product;
      if (!p || typeof p === 'string') return false;
      return String(p.vendorId) === vid && String(p._id) === String(productId);
    });

    if (!targetLine) {
      return res.status(404).json({ message: 'Product line not found.' });
    }
    if (!targetLine.deliveryOtp || !targetLine.deliveryOtpExpire) {
      return res
        .status(400)
        .json({ message: 'No OTP found. Please send OTP first.' });
    }
    if (new Date() > new Date(targetLine.deliveryOtpExpire)) {
      return res
        .status(400)
        .json({ message: 'OTP has expired. Please resend.' });
    }
    if (targetLine.deliveryOtp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    // Clear OTP after successful verify
    targetLine.deliveryOtp = null;
    targetLine.deliveryOtpExpire = null;
    await order.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
