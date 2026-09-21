import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Vendor from '../../models/vendorAuthModel.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import ServiceProduct from '../../models/ServiceProduct.js';
import User from '../../models/userAuthModel.js';
import Order from '../../models/Order.js';
import ServiceBooking from '../../models/ServiceBooking.js';
import VendorKyc from '../../models/VendorKyc.js';
import UserKyc from '../../models/UserKyc.js';
import Address from '../../models/Address.js';
import { buildMyRentalsStyleActiveRows } from '../../utils/userRentalHubActiveRows.js';
import { buildIssueTicketsFromOrders } from './ticketAdminController.js';
import Admin from '../../models/Admin.js';
import { sendProductApprovedEmail } from '../../utils/sendMail.js';
import {
  sendAdminForgotPasswordOtp,
  sendAdminEmailChangeOtp,
} from '../../utils/sendMail.js';
import {
  buildGlobalInvoiceNumberMap,
  formatDisplayInvoiceNo,
} from '../../utils/invoiceNumbering.js';
// import City from '../../models/City.js';
// import Settlement from '../../models/Settlement.js';
// import { runSettlementPayoutBatch } from '../../services/settlementPayoutService.js';

import City from '../../models/City.js';
import Settlement from '../../models/Settlement.js';
import { runSettlementPayoutBatch } from '../../services/settlementPayoutService.js';
import {
  runRefundPayoutBatch,
  runCancelRefundPayoutBatch,
} from '../../services/refundPayoutService.js';
import LocationSourceSettings from '../../models/LocationSourceSettings.js';
import { getCityProductIds } from '../../utils/cityScope.js';
import {
  resolveStateFromCoords,
  resolveCityFromCoords,
} from '../../utils/geocode.js';
const PLATFORM_FEE_RATE = 0.1;

//test
//test1
function toRad(v) {
  return (Number(v) * Math.PI) / 180;
}

function distanceKm(aLat, aLon, bLat, bLon) {
  const R = 6371;
  const dLat = toRad(Number(bLat) - Number(aLat));
  const dLon = toRad(Number(bLon) - Number(aLon));
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const x = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/** Public storefront: hide if admin or vendor turned listing off. */
function storefrontListingVisibilityMatch() {
  return {
    adminListingEnabled: { $ne: false },
    vendorListingEnabled: { $ne: false },
  };
}

function pickPrimaryStore(stores = []) {
  if (!Array.isArray(stores) || stores.length === 0) return null;
  // IMPORTANT: return null when no active store exists.
  return (
    stores.find((s) => s?.isDefault && s?.isActive !== false) ||
    stores.find((s) => s?.isActive !== false) ||
    null
  );
}

function vendorServesLocation(store, userLat, userLng) {
  if (!store) return false;
  // Prefer explicit service-mode booleans. Some vendors may not sync the
  // `deliveryZoneType` field when toggling service mode in UI.
  if (store?.serviceModePanIndia === true) return true;

  const isLocal =
    store?.serviceModeLocalDelivery === true ||
    store?.deliveryZoneType === 'hyper-local';
  if (!isLocal) {
    // If we only know pan-india via the enum value.
    if (store?.deliveryZoneType === 'pan-india') return true;
    return false;
  }
  if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) return false;

  const sLat = Number(store?.mapLat);
  const sLng = Number(store?.mapLng);
  if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) return false;

  const radius = Number(store?.serviceRadiusKm);
  const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : 50;
  return distanceKm(userLat, userLng, sLat, sLng) <= safeRadius;
}

// export const adminLogin = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;

//     // ✅ Validation — same as before
//     if (!identifier || !password) {
//       return res.status(400).json({
//         message: 'Email and password required',
//       });
//     }

//     // ✅ DB se fetch karo — password explicitly select karo (schema mein select: false hai)
//     const admin = await Admin.findOne({ email: identifier }).select(
//       '+password',
//     );

//     if (!admin) {
//       return res.status(401).json({
//         message: 'Invalid admin credentials',
//       });
//     }

//     if (!admin.isActive) {
//       return res.status(403).json({
//         message: 'Admin account is deactivated',
//       });
//     }

//     // ✅ Password compare — bcrypt se
//     const isPasswordValid = await admin.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         message: 'Invalid admin credentials',
//       });
//     }

//     // ✅ lastLogin update
//     admin.lastLogin = new Date();
//     await admin.save({ validateBeforeSave: false });

//     // ✅ Token — payload mein _id rakho (email nahi)
//     const token = jwt.sign(
//       { adminId: admin._id, role: 'admin' },
//       process.env.JWT_SECRET,
//       { expiresIn: '30d' },
//     );

//     // ✅ Response format exactly same — frontend ko kuch touch nahi karna
//     return res.status(200).json({
//       message: 'Admin login successful',
//       token,
//       user: {
//         email: admin.email, // frontend ko email chahiye display ke liye — de do
//         role: 'admin',
//       },
//     });
//   } catch (error) {
//     console.error('Admin login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const adminLogin = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;

//     if (!identifier || !password) {
//       return res.status(400).json({ message: 'Email and password required' });
//     }

//     const admin = await Admin.findOne({ email: identifier }).select(
//       '+password',
//     );

//     if (!admin) {
//       return res.status(401).json({ message: 'Invalid admin credentials' });
//     }

//     if (!admin.isActive) {
//       return res.status(403).json({ message: 'Admin account is deactivated' });
//     }

export const adminLogin = async (req, res) => {
  try {
    const { identifier, password, expectedRole } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const loginId = String(identifier).trim().toLowerCase();
    const admin = await Admin.findOne({ email: loginId }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is deactivated' });
    }

    // ---- NEW: enforce that the login tab matches the account's actual role ----
    // if (expectedRole && admin.role !== expectedRole) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }
    // ---- END NEW ----

    // // ---- NEW: block unapproved/rejected subadmins ----
    // if (admin.role === 'subadmin') {
    //   if (admin.approvalStatus === 'pending') {
    //     return res
    //       .status(403)
    //       .json({ message: 'Your account is pending admin approval' });
    //   }
    //   if (admin.approvalStatus === 'rejected') {
    //     return res
    //       .status(403)
    //       .json({ message: 'Your registration was rejected by admin' });
    //   }
    // }
    // // ---- END NEW ----

    // const isPasswordValid = await admin.comparePassword(password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ message: 'Invalid admin credentials' });
    // }

    let isPasswordValid = await admin.comparePassword(password);

    // ---- Fallback: allow old password for 24hr after password change ----
    if (
      !isPasswordValid &&
      admin.oldPassword &&
      admin.oldPasswordExpire &&
      admin.oldPasswordExpire > Date.now()
    ) {
      isPasswordValid = await bcrypt.compare(password, admin.oldPassword);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ---- NEW: block unapproved/rejected subadmins ----
    if (admin.role === 'subadmin') {
      if (admin.approvalStatus === 'pending') {
        return res
          .status(403)
          .json({ message: 'Your account is pending admin approval' });
      }
      if (admin.approvalStatus === 'rejected') {
        return res
          .status(403)
          .json({ message: 'Your registration was rejected by admin' });
      }
    }
    // ---- END NEW ----

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role }, // role is now dynamic
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
    );

    return res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        email: admin.email,
        role: admin.role, // 'admin' or 'subadmin'
        location: admin.location || null, // frontend uses this to filter category toggle
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: forgot password - step 1: send OTP ----
export const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // // Generic response to avoid email enumeration
    // if (!admin) {
    //   return res.json({
    //     message: 'If this email exists, an OTP has been sent.',
    //   });
    // }

    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // admin.otp = otp;
    // admin.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    // await admin.save({ validateBeforeSave: false });

    // await sendAdminForgotPasswordOtp(admin.email, otp);

    // return res.json({ message: 'If this email exists, an OTP has been sent.' });
    const normalizedEmail = email.toLowerCase().trim();

    // Check if it's the hardcoded env admin
    const isEnvAdmin =
      normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });

    // Generic response to avoid email enumeration
    if (!admin && !isEnvAdmin) {
      return res.json({
        message: 'If this email exists, an OTP has been sent.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (admin) {
      admin.otp = otp;
      admin.otpExpire = Date.now() + 10 * 60 * 1000;
      await admin.save({ validateBeforeSave: false });
      await sendAdminForgotPasswordOtp(admin.email, otp);
    } else {
      // Env-based admin: store OTP temporarily in memory/cache
      // since there's no DB record, use a simple in-memory store
      if (!global._envAdminOtpStore) global._envAdminOtpStore = {};
      global._envAdminOtpStore[normalizedEmail] = {
        otp,
        expiry: Date.now() + 10 * 60 * 1000,
      };
      await sendAdminForgotPasswordOtp(normalizedEmail, otp);
    }

    return res.json({ message: 'If this email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('forgotAdminPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: forgot password - step 2: verify OTP ----
export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // const admin = await Admin.findOne({
    //   email: email.toLowerCase().trim(),
    // }).select('+otp +otpExpire');

    // if (
    //   !admin ||
    //   !admin.otp ||
    //   admin.otp !== otp ||
    //   !admin.otpExpire ||
    //   admin.otpExpire < Date.now()
    // ) {
    //   return res.status(400).json({ message: 'Invalid or expired OTP' });
    // }

    // return res.json({ message: 'OTP verified successfully' });
    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail }).select(
      '+otp +otpExpire',
    );

    // Check DB admin OTP
    if (admin) {
      if (
        !admin.otp ||
        admin.otp !== otp ||
        !admin.otpExpire ||
        admin.otpExpire < Date.now()
      ) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
      return res.json({ message: 'OTP verified successfully' });
    }

    // Check env admin OTP from in-memory store
    const stored = global._envAdminOtpStore?.[normalizedEmail];
    if (!stored || stored.otp !== otp || stored.expiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('verifyAdminOtp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: forgot password - step 3: reset password ----
export const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Email, OTP and new password are required' });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    // const admin = await Admin.findOne({
    //   email: email.toLowerCase().trim(),
    // }).select('+otp +otpExpire +password');

    // if (
    //   !admin ||
    //   !admin.otp ||
    //   admin.otp !== otp ||
    //   !admin.otpExpire ||
    //   admin.otpExpire < Date.now()
    // ) {
    //   return res.status(400).json({ message: 'Invalid or expired OTP' });
    // }

    // admin.password = newPassword; // pre-save hook hashes + sets plainPassword
    // admin.otp = null;
    // admin.otpExpire = null;
    // await admin.save();

    // return res.json({ message: 'Password reset successful. Please log in.' });

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail }).select(
      '+otp +otpExpire +password',
    );

    // if (admin) {
    //   if (
    //     !admin.otp ||
    //     admin.otp !== otp ||
    //     !admin.otpExpire ||
    //     admin.otpExpire < Date.now()
    //   ) {
    //     return res.status(400).json({ message: 'Invalid or expired OTP' });
    //   }
    //   admin.password = newPassword;
    //   admin.otp = null;
    //   admin.otpExpire = null;
    //   await admin.save();
    //   return res.json({ message: 'Password reset successful. Please log in.' });
    // }
    if (admin) {
      if (
        !admin.otp ||
        admin.otp !== otp ||
        !admin.otpExpire ||
        admin.otpExpire < Date.now()
      ) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
      admin.oldPassword = admin.password; // save current hashed password as 24hr fallback
      admin.oldPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24hr
      admin.password = newPassword;
      admin.otp = null;
      admin.otpExpire = null;
      await admin.save();
      return res.json({ message: 'Password reset successful. Please log in.' });
    }

    // Env admin: verify OTP from in-memory store
    const stored = global._envAdminOtpStore?.[normalizedEmail];
    if (!stored || stored.otp !== otp || stored.expiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update the env admin's password in DB, or just clear the OTP store
    // Since env admin has no DB record, we clear the store and update .env is not feasible at runtime.
    // Best practice: create a DB record for env admin on first password reset.
    delete global._envAdminOtpStore[normalizedEmail];

    // Upsert a real DB admin record so future logins use DB password
    await Admin.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        password: newPassword, // pre-save hook will hash it
        role: 'admin',
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    console.error('resetAdminPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: send OTP to new email for email change ----
export const sendEmailChangeOtp = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { newEmail } = req.body;

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({ message: 'Valid new email is required' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if new email already in use
    const existing = await Admin.findOne({
      email: newEmail.toLowerCase().trim(),
    });
    if (existing) {
      return res.status(400).json({ message: 'This email is already in use' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await admin.save({ validateBeforeSave: false });

    // Send OTP to the NEW email
    await sendAdminEmailChangeOtp(newEmail.trim(), otp);

    return res.json({ message: 'OTP sent to your new email address' });
  } catch (error) {
    console.error('sendEmailChangeOtp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: verify OTP and update email ----
export const verifyEmailChangeOtp = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { newEmail, otp } = req.body;

    if (!newEmail || !otp) {
      return res
        .status(400)
        .json({ message: 'New email and OTP are required' });
    }

    const admin = await Admin.findById(adminId).select('+otp +otpExpire');
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (
      !admin.otp ||
      admin.otp !== otp ||
      !admin.otpExpire ||
      admin.otpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    admin.email = newEmail.toLowerCase().trim();
    admin.otp = null;
    admin.otpExpire = null;
    await admin.save({ validateBeforeSave: false });

    return res.json({
      message: 'Email updated successfully',
      email: admin.email,
    });
  } catch (error) {
    console.error('verifyEmailChangeOtp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const changeAdminSettingsPassword = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const admin = await Admin.findById(adminId).select(
      '+password +plainPassword +oldPassword +oldPasswordExpire',
    );
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Save current password as oldPassword before changing (valid for 24hr)
    admin.oldPassword = admin.password; // already hashed
    admin.oldPlainPassword = admin.plainPassword || null;
    admin.oldPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    admin.password = newPassword; // pre-save hook will hash it
    admin.plainPassword = newPassword; // store plain for settings display
    await admin.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('changeAdminSettingsPassword error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---- NEW: admin settings - view current email & password (admin role only) ----
export const getAdminSettings = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    const admin = await Admin.findById(adminId).select('+plainPassword');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.json({
      email: admin.email,
      password: admin.plainPassword || null,
    });
  } catch (error) {
    console.error('getAdminSettings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const adminLogout = async (req, res) => {
  try {
    // Token stateless hai — client-side clear hoga
    // Future mein blacklist/refresh token add kar sakte ho yahan
    return res.status(200).json({
      message: 'Admin logged out successfully',
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    // req.admin middleware se aa raha hai — _id se data fetch ho chuka
    return res.status(200).json({
      success: true,
      data: { admin: req.admin },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// ─── CHANGE PASSWORD ───────────────────────────────────
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');

    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    admin.password = newPassword; // pre-save hook hash kar dega
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// ─── UPDATE PROFILE ────────────────────────────────────
// Future enhancement ke liye ready
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin._id,
      { name, email },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { admin: updatedAdmin },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// export const getAllVendors = async (req, res) => {
//   try {
//     const vendors = await Vendor.find()
//       .select('-password -otp -otpExpire') // 🔥 hide sensitive data
//       .sort({ createdAt: -1 });

//     const vendorIds = vendors.map((v) => v._id);

//     const kycRecords = await VendorKyc.find({
//       vendorId: { $in: vendorIds },
//     }).select('vendorId status');
//     const kycStatusMap = new Map(
//       (kycRecords || []).map((x) => [String(x.vendorId), x.status]),
//     );

//     const productCounts = await Product.aggregate([
//       { $match: { vendorId: { $in: vendorIds } } },
//       { $group: { _id: '$vendorId', count: { $sum: 1 } } },
//     ]);
//     const countMap = new Map(
//       productCounts.map((x) => [String(x._id), x.count]),
//     );

//     const withCounts = vendors.map((v) => ({
//       ...v.toObject(),
//       productsCount: countMap.get(String(v._id)) || 0,
//       // Primary source of truth: VendorKyc.status
//       // If no KYC document exists yet, keep it pending.
//       kycStatus: kycStatusMap.get(String(v._id)) || 'pending',
//     }));

//     res.json({
//       vendors: withCounts,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getAllVendors = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    let cityVendorIds = null;
    if (cityProductIds) {
      const cityProducts = await Product.find(
        { _id: { $in: cityProductIds } },
        { vendorId: 1 },
      ).lean();
      cityVendorIds = [...new Set(cityProducts.map((p) => String(p.vendorId)))];
    }

    const vendorFilter = cityVendorIds ? { _id: { $in: cityVendorIds } } : {};

    const vendors = await Vendor.find(vendorFilter)
      .select('-password -otp -otpExpire')
      .sort({ createdAt: -1 });

    const vendorIds = vendors.map((v) => v._id);

    const kycRecords = await VendorKyc.find({
      vendorId: { $in: vendorIds },
    }).select('vendorId status');
    const kycStatusMap = new Map(
      (kycRecords || []).map((x) => [String(x.vendorId), x.status]),
    );

    const productCounts = await Product.aggregate([
      { $match: { vendorId: { $in: vendorIds } } },
      { $group: { _id: '$vendorId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      productCounts.map((x) => [String(x._id), x.count]),
    );

    const withCounts = vendors.map((v) => ({
      ...v.toObject(),
      productsCount: countMap.get(String(v._id)) || 0,
      // Primary source of truth: VendorKyc.status
      // If no KYC document exists yet, keep it pending.
      kycStatus: kycStatusMap.get(String(v._id)) || 'pending',
    }));

    res.json({
      vendors: withCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const extractCityFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => String(x || '').trim())
//       .filter(Boolean);
//     if (parts.length >= 3) return parts[parts.length - 3];
//     if (parts.length >= 2) return parts[parts.length - 2];
//     return parts[0] || 'Unknown';
//   }

//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   const tokens = address
//     .split(',')
//     .map((x) => String(x || '').trim())
//     .filter(Boolean);
//   if (tokens.length >= 2) return tokens[tokens.length - 2];
//   return tokens[0] || 'Unknown';
// // };

// const extractCityFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => String(x || '').trim())
//       .filter(Boolean);
//     if (parts.length >= 3) return parts[parts.length - 3];
//     if (parts.length >= 2) return parts[parts.length - 2];
//     return parts[0] || 'Unknown';
//   }

//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   const tokens = address
//     .split(',')
//     .map((x) => String(x || '').trim())
//     .filter(Boolean);
//   if (tokens.length >= 2) return tokens[tokens.length - 2];
//   return tokens[0] || 'Unknown';
// };

// // const extractStateFromStore = (store = {}) => {

const INDIAN_STATE_NAMES = [
  'andhra pradesh',
  'arunachal pradesh',
  'assam',
  'bihar',
  'chhattisgarh',
  'goa',
  'gujarat',
  'haryana',
  'himachal pradesh',
  'jharkhand',
  'karnataka',
  'kerala',
  'madhya pradesh',
  'maharashtra',
  'manipur',
  'meghalaya',
  'mizoram',
  'nagaland',
  'odisha',
  'punjab',
  'rajasthan',
  'sikkim',
  'tamil nadu',
  'telangana',
  'tripura',
  'uttar pradesh',
  'uttarakhand',
  'west bengal',
  'delhi',
  'jammu and kashmir',
  'ladakh',
  'puducherry',
  'chandigarh',
  'andaman and nicobar islands',
  'dadra and nagar haveli',
  'daman and diu',
  'lakshadweep',
];

const extractCityFromStore = (store = {}, knownCityNames = []) => {
  const mapAddress = String(store.mapAddress || '').trim();
  const completeAddressRaw = String(store.completeAddress || '').trim();
  const combined = `${mapAddress} ${completeAddressRaw}`.toLowerCase();
  if (knownCityNames.length) {
    const matches = knownCityNames.filter((name) => {
      const lower = String(name).toLowerCase();
      if (INDIAN_STATE_NAMES.includes(lower)) return false; // never treat a state as a city
      return combined.includes(lower);
    });
    if (matches.length) {
      const best = matches.sort((a, b) => b.length - a.length)[0];
      return best;
    }
  }
  //   if (mapAddress) {
  //     const parts = mapAddress
  //       .split(',')
  //       .map((x) => String(x || '').trim())
  //       .filter(Boolean);
  //     if (parts.length >= 3) return parts[parts.length - 3];
  //     if (parts.length >= 2) return parts[parts.length - 2];
  //     return parts[0] || 'Unknown';
  //   }

  //   const address = String(store.completeAddress || '').trim();
  //   if (!address) return 'Unknown';
  //   const tokens = address
  //     .split(',')
  //     .map((x) => String(x || '').trim())
  //     .filter(Boolean);
  //   if (tokens.length >= 2) return tokens[tokens.length - 2];
  //   return tokens[0] || 'Unknown';
  // };

  const ADMIN_SUFFIX_REGEX =
    /\s+(city subdistrict|subdistrict|district|taluk|tehsil|mandal|division)$/i;
  const stripAdminSuffix = (s) =>
    String(s || '')
      .replace(ADMIN_SUFFIX_REGEX, '')
      .trim();
  const isPincode = (s) => /^\d{5,6}$/.test(String(s || '').trim());
  const isCountry = (s) =>
    String(s || '')
      .trim()
      .toLowerCase() === 'india';
  const isStateName = (s) =>
    INDIAN_STATE_NAMES.includes(
      String(s || '')
        .trim()
        .toLowerCase(),
    );

  // Robust fallback: strip pincode/country/state/admin-layer segments
  // (subdistrict, district, etc.) from the comma list, then take the
  // last remaining segment — this is the actual city regardless of how
  // many extra segments (pincode, "X District", "X Subdistrict") the
  // geocoded address has.
  const pickCityFromParts = (parts) => {
    const cleaned = parts
      .map((p) => stripAdminSuffix(p))
      .filter((p) => p && !isPincode(p) && !isCountry(p) && !isStateName(p));
    return cleaned.length ? cleaned[cleaned.length - 1] : parts[0] || 'Unknown';
  };

  if (mapAddress) {
    const parts = mapAddress
      .split(',')
      .map((x) => String(x || '').trim())
      .filter(Boolean);
    return pickCityFromParts(parts);
  }

  const address = String(store.completeAddress || '').trim();
  if (!address) return 'Unknown';
  const tokens = address
    .split(',')
    .map((x) => String(x || '').trim())
    .filter(Boolean);
  return pickCityFromParts(tokens);
};

// const extractStateFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => String(x || '').trim())
//       .filter(Boolean);
//     if (parts.length >= 2) return parts[parts.length - 2];
//     return parts[0] || 'Unknown';
//   }

//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   const tokens = address
//     .split(',')
//     .map((x) => String(x || '').trim())
//     .filter(Boolean);
//   if (tokens.length >= 1) return tokens[tokens.length - 1];
//   return tokens[0] || 'Unknown';
// };
// const extractStateFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => String(x || '').trim())
//       .filter(Boolean);
//     if (parts.length >= 2) return parts[parts.length - 2];
//   }
//   return '';
// };

// const extractStateFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => String(x || '').trim())
//       .filter(Boolean);
//     if (parts.length >= 2) return parts[parts.length - 2];
//     return parts[0] || 'Unknown';
//   }

//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   const tokens = address
//     .split(',')
//     .map((x) => String(x || '').trim())
//     .filter(Boolean);
//   if (tokens.length >= 1) return tokens[tokens.length - 1];
//   return tokens[0] || 'Unknown';
// };

const INDIAN_STATES = [
  'andhra pradesh',
  'arunachal pradesh',
  'assam',
  'bihar',
  'chhattisgarh',
  'goa',
  'gujarat',
  'haryana',
  'himachal pradesh',
  'jharkhand',
  'karnataka',
  'kerala',
  'madhya pradesh',
  'maharashtra',
  'manipur',
  'meghalaya',
  'mizoram',
  'nagaland',
  'odisha',
  'punjab',
  'rajasthan',
  'sikkim',
  'tamil nadu',
  'telangana',
  'tripura',
  'uttar pradesh',
  'uttarakhand',
  'west bengal',
  'delhi',
  'jammu and kashmir',
  'ladakh',
  'puducherry',
  'chandigarh',
  'andaman and nicobar islands',
  'dadra and nagar haveli',
  'daman and diu',
  'lakshadweep',
];

const findStateInTokens = (tokens = []) => {
  for (const token of tokens) {
    const normalized = String(token || '')
      .trim()
      .toLowerCase();
    if (INDIAN_STATES.includes(normalized)) return normalized;
  }
  return '';
};

const extractStateFromStore = (store = {}) => {
  const mapAddress = String(store.mapAddress || '').trim();
  if (mapAddress) {
    const parts = mapAddress
      .split(',')
      .map((x) => String(x || '').trim())
      .filter(Boolean);
    const found = findStateInTokens(parts);
    if (found) return found;
  }

  const address = String(store.completeAddress || '').trim();
  if (address) {
    const tokens = address
      .split(/[,.]/)
      .map((x) => String(x || '').trim())
      .filter(Boolean);
    const found = findStateInTokens(tokens);
    if (found) return found;
  }

  return 'Unknown';
};

const storeRadiusLabel = (store = {}) => {
  if (store.serviceModePanIndia || store.deliveryZoneType === 'pan-india') {
    return 'Pan-India';
  }
  const km = Number(store.serviceRadiusKm || 0);
  const safeKm = Number.isFinite(km) && km > 0 ? Math.round(km) : 15;
  return `${safeKm} km (Local)`;
};

// export const getAdminStores = async (req, res) => {
//   try {
//     const rows = await VendorKyc.find({})
//       .populate('vendorId', 'fullName')
//       .select('vendorId storeManagement.stores')
//       .lean();

//     let seq = 1;
//     const stores = [];
//     for (const kyc of rows || []) {
//       const vendorObjId = kyc?.vendorId?._id ? String(kyc.vendorId._id) : '';
//       if (!vendorObjId) continue;
//       const vendorName = String(kyc?.vendorId?.fullName || 'Vendor').trim();
//       const vendorCode = `VEN-${vendorObjId.slice(-3).toUpperCase()}`;
//       const list = Array.isArray(kyc?.storeManagement?.stores)
//         ? kyc.storeManagement.stores
//         : [];
//       for (let i = 0; i < list.length; i += 1) {
//         const s = list[i] || {};
//         stores.push({
//           _id: `${vendorObjId}_${i}`,
//           id: `STR-${String(seq).padStart(3, '0')}`,
//           vendorObjectId: vendorObjId,
//           storeIndex: i,
//           name: String(s.storeName || `Store ${i + 1}`).trim(),
//           vendor: vendorName,
//           vendorId: vendorCode,
//           city: extractCityFromStore(s),
//           pin: String(s.pincode || '').trim() || '—',
//           radius: storeRadiusLabel(s),
//           status: s.isActive === false ? 'disabled' : 'enabled',
//           disabledAt: s.disabledAt || null,
//         });
//         seq += 1;
//       }
//     }

//     res.json({ stores });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getAdminStores = async (req, res) => {
//   try {
//     const rows = await VendorKyc.find({})
//       .populate('vendorId', 'fullName')
//       .select('vendorId storeManagement.stores')
//       .lean();

//     let seq = 1;
//     const stores = [];
//     for (const kyc of rows || []) {
//       const vendorObjId = kyc?.vendorId?._id ? String(kyc.vendorId._id) : '';
//       if (!vendorObjId) continue;
//       const vendorName = String(kyc?.vendorId?.fullName || 'Vendor').trim();
//       const vendorCode = `VEN-${vendorObjId.slice(-3).toUpperCase()}`;
//       const list = Array.isArray(kyc?.storeManagement?.stores)
//         ? kyc.storeManagement.stores
//         : [];
//       for (let i = 0; i < list.length; i += 1) {
//         const s = list[i] || {};
//         // stores.push({
//         //   _id: `${vendorObjId}_${i}`,
//         //   id: `STR-${String(seq).padStart(3, '0')}`,
//         //   vendorObjectId: vendorObjId,
//         //   storeIndex: i,
//         //   name: String(s.storeName || `Store ${i + 1}`).trim(),
//         //   vendor: vendorName,
//         //   vendorId: vendorCode,
//         //   city: extractCityFromStore(s),
//         //   state: extractStateFromStore(s), // ← new field
//         //   pin: String(s.pincode || '').trim() || '—',
//         //   radius: storeRadiusLabel(s),
//         //   status: s.isActive === false ? 'disabled' : 'enabled',
//         //   disabledAt: s.disabledAt || null,
//         // });

//         stores.push({
//           _id: `${vendorObjId}_${i}`,
//           storeId: String(s._id || ''),
//           id: `STR-${String(seq).padStart(3, '0')}`,
//           vendorObjectId: vendorObjId,
//           storeIndex: i,
//           name: String(s.storeName || `Store ${i + 1}`).trim(),
//           vendor: vendorName,
//           vendorId: vendorCode,
//           city: extractCityFromStore(s),
//           state: extractStateFromStore(s), // ← new field
//           pin: String(s.pincode || '').trim() || '—',
//           radius: storeRadiusLabel(s),
//           status: s.isActive === false ? 'disabled' : 'enabled',
//           disabledAt: s.disabledAt || null,
//         });
//         seq += 1;
//       }
//     }

//     res.json({ stores });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getAdminStores = async (req, res) => {
  try {
    const isSubadmin = req.admin?.role === 'subadmin';
    const subadminCity = isSubadmin
      ? String(req.admin.location || '')
          .trim()
          .toLowerCase()
      : null;

    const rows = await VendorKyc.find({})
      .populate('vendorId', 'fullName')
      .select('vendorId storeManagement.stores')
      .lean();

    let seq = 1;
    const stores = [];
    for (const kyc of rows || []) {
      const vendorObjId = kyc?.vendorId?._id ? String(kyc.vendorId._id) : '';
      if (!vendorObjId) continue;
      const vendorName = String(kyc?.vendorId?.fullName || 'Vendor').trim();
      const vendorCode = `VEN-${vendorObjId.slice(-3).toUpperCase()}`;
      const list = Array.isArray(kyc?.storeManagement?.stores)
        ? kyc.storeManagement.stores
        : [];
      for (let i = 0; i < list.length; i += 1) {
        const s = list[i] || {};

        if (subadminCity) {
          const storeCity = String(extractCityFromStore(s) || '')
            .trim()
            .toLowerCase();
          if (storeCity !== subadminCity) continue;
        }

        // stores.push({
        //   _id: `${vendorObjId}_${i}`,
        //   id: `STR-${String(seq).padStart(3, '0')}`,
        //   vendorObjectId: vendorObjId,
        //   storeIndex: i,
        //   name: String(s.storeName || `Store ${i + 1}`).trim(),
        //   vendor: vendorName,
        //   vendorId: vendorCode,
        //   city: extractCityFromStore(s),
        //   state: extractStateFromStore(s), // ← new field
        //   pin: String(s.pincode || '').trim() || '—',
        //   radius: storeRadiusLabel(s),
        //   status: s.isActive === false ? 'disabled' : 'enabled',
        //   disabledAt: s.disabledAt || null,
        // });

        stores.push({
          _id: `${vendorObjId}_${i}`,
          storeId: String(s._id || ''),
          id: `STR-${String(seq).padStart(3, '0')}`,
          vendorObjectId: vendorObjId,
          storeIndex: i,
          name: String(s.storeName || `Store ${i + 1}`).trim(),
          vendor: vendorName,
          vendorId: vendorCode,
          city: extractCityFromStore(s),
          state: extractStateFromStore(s), // ← new field
          pin: String(s.pincode || '').trim() || '—',
          radius: storeRadiusLabel(s),
          status: s.isActive === false ? 'disabled' : 'enabled',
          disabledAt: s.disabledAt || null,
        });
        seq += 1;
      }
    }

    res.json({ stores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const patchAdminStoreStatus = async (req, res) => {
  try {
    const { vendorId, storeIndex } = req.params;
    const raw = req.body?.isActive;
    const isActive = raw === true || raw === 'true';
    const idx = Number(storeIndex);
    if (!Number.isInteger(idx) || idx < 0) {
      return res.status(400).json({ message: 'Invalid store index.' });
    }

    const kyc = await VendorKyc.findOne({ vendorId });
    if (!kyc) {
      return res.status(404).json({ message: 'Vendor KYC not found.' });
    }
    const stores = kyc?.storeManagement?.stores;
    if (!Array.isArray(stores) || !stores[idx]) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const store = stores[idx];
    store.isActive = isActive;
    if (isActive) {
      store.disabledAt = null;
      store.disabledBy = '';
    } else {
      store.disabledAt = new Date();
      store.disabledBy = String(req?.admin?.email || 'admin').trim();
    }

    await kyc.save();

    //     return res.json({
    //       message: 'Store status updated.',
    //       store: {
    //         vendorId: String(vendorId),
    //         storeIndex: idx,
    //         isActive: store.isActive !== false,
    //         disabledAt: store.disabledAt || null,
    //         disabledBy: store.disabledBy || '',
    //       },
    //     });
    //   } catch (error) {
    //     return res.status(500).json({ message: error.message });
    //   }
    // };

    // export const createVendorProfile = async (req, res) => {

    return res.json({
      message: 'Store status updated.',
      store: {
        vendorId: String(vendorId),
        storeIndex: idx,
        isActive: store.isActive !== false,
        disabledAt: store.disabledAt || null,
        disabledBy: store.disabledBy || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const normalizeStateName = (raw) =>
  String(raw || '')
    .trim()
    .toLowerCase();

// ---- Sub-admin: get their own state's Rent/Buy/Service toggle settings ----
export const getMyLocationSettings = async (req, res) => {
  try {
    if (req.admin?.role !== 'subadmin') {
      return res
        .status(403)
        .json({ message: 'Only sub-admins can access this.' });
    }
    if (req.admin?.approvalStatus !== 'approved') {
      return res
        .status(403)
        .json({ message: 'Your account is not yet approved.' });
    }
    const state = normalizeStateName(req.admin?.location);
    if (!state) {
      return res
        .status(400)
        .json({ message: 'No location assigned to this account.' });
    }

    const doc = await LocationSourceSettings.findOne({ state }).lean();
    return res.status(200).json({
      state,
      rentEnabled: doc ? doc.rentEnabled !== false : true,
      buyEnabled: doc ? doc.buyEnabled !== false : true,
      serviceEnabled: doc ? doc.serviceEnabled !== false : true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---- Public: resolve toggle state for a given lat/lng (storefront use) ----
export const getPublicLocationSettings = async (req, res) => {
  try {
    const { userLat, userLng } = req.query;
    const hasCoords =
      Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng));

    // Default: everything enabled when we can't resolve a location or
    // there's no configured doc for that state.
    const defaults = {
      rentEnabled: true,
      buyEnabled: true,
      serviceEnabled: true,
    };

    if (!hasCoords) {
      return res.status(200).json(defaults);
    }

    const resolvedCity = await resolveCityFromCoords(
      Number(userLat),
      Number(userLng),
    );
    if (!resolvedCity) {
      return res.status(200).json(defaults);
    }

    const normalizedState = String(resolvedCity).trim().toLowerCase();
    const doc = await LocationSourceSettings.findOne({
      state: normalizedState,
    }).lean();

    if (!doc) {
      return res.status(200).json(defaults);
    }

    return res.status(200).json({
      rentEnabled: doc.rentEnabled !== false,
      buyEnabled: doc.buyEnabled !== false,
      serviceEnabled: doc.serviceEnabled !== false,
    });
  } catch (error) {
    // Fail open — never let a geocode/DB hiccup hide the storefront.
    return res.status(200).json({
      rentEnabled: true,
      buyEnabled: true,
      serviceEnabled: true,
    });
  }
};

// ---- Sub-admin: update their own state's Rent/Buy/Service toggle settings ----
export const updateMyLocationSettings = async (req, res) => {
  try {
    if (req.admin?.role !== 'subadmin') {
      return res
        .status(403)
        .json({ message: 'Only sub-admins can access this.' });
    }
    if (req.admin?.approvalStatus !== 'approved') {
      return res
        .status(403)
        .json({ message: 'Your account is not yet approved.' });
    }
    const state = normalizeStateName(req.admin?.location);
    if (!state) {
      return res
        .status(400)
        .json({ message: 'No location assigned to this account.' });
    }

    const { rentEnabled, buyEnabled, serviceEnabled } = req.body || {};
    const update = { updatedBy: req.admin?.email || 'subadmin' };
    if (typeof rentEnabled === 'boolean') update.rentEnabled = rentEnabled;
    if (typeof buyEnabled === 'boolean') update.buyEnabled = buyEnabled;
    if (typeof serviceEnabled === 'boolean')
      update.serviceEnabled = serviceEnabled;

    const doc = await LocationSourceSettings.findOneAndUpdate(
      { state },
      { $set: update, $setOnInsert: { state } },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      message: 'Location settings updated.',
      state: doc.state,
      rentEnabled: doc.rentEnabled,
      buyEnabled: doc.buyEnabled,
      serviceEnabled: doc.serviceEnabled,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createVendorProfile = async (req, res) => {
  try {
    const { fullName, emailAddress, password } = req.body;

    if (!fullName || !emailAddress) {
      return res
        .status(400)
        .json({ message: 'fullName and emailAddress are required' });
    }

    const existing = await Vendor.findOne({ emailAddress });
    if (existing) {
      return res.status(400).json({ message: 'Vendor email already exists' });
    }

    const tempPassword =
      String(password || '').trim() ||
      `Rent@${Math.random().toString(36).slice(-6)}${Date.now().toString().slice(-2)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const vendor = await Vendor.create({
      fullName,
      emailAddress: String(emailAddress).trim().toLowerCase(),
      password: hashedPassword,
      // Admin-created profiles should be able to login directly.
      isVerified: true,
      otp: null,
      otpExpire: null,
    });

    return res.status(201).json({
      message: 'Vendor profile created successfully',
      vendor: {
        _id: vendor._id,
        fullName: vendor.fullName,
        emailAddress: vendor.emailAddress,
        isVerified: vendor.isVerified,
        createdAt: vendor.createdAt,
      },
      tempPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getVendorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id).select(
      'fullName emailAddress isVerified createdAt mobileNumber referralCode',
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const products = await Product.find({ vendorId: id }).sort({
      createdAt: -1,
    });
    const productIds = products.map((p) => p._id);

    const orders = await Order.find({
      'products.product': { $in: productIds },
    })
      .populate('products.product', 'productName vendorId category type')
      .sort({ createdAt: -1 });

    let totalEarnings = 0;
    let pendingSettlement = 0;
    const transactions = [];

    orders.forEach((order) => {
      const rentalDuration = Number(order.rentalDuration || 0);
      let orderVendorAmount = 0;

      (order.products || []).forEach((item) => {
        const p = item.product;
        if (!p || String(p.vendorId) !== String(id)) return;
        orderVendorAmount +=
          Number(item.pricePerDay || 0) *
          Number(item.quantity || 0) *
          rentalDuration;
      });

      if (orderVendorAmount > 0) {
        totalEarnings += orderVendorAmount;
        if (!['delivered', 'cancelled'].includes(String(order.status || ''))) {
          pendingSettlement += orderVendorAmount;
        }
        transactions.push({
          _id: order._id,
          date: order.createdAt,
          amount: order.baseRentalCost,
          status: order.status,
          description: 'Rental order payout',
        });
      }
    });

    const activeProducts = products.filter(
      (p) => Number(p.stock || 0) > 0,
    ).length;
    const activeOrders = orders.filter(
      (o) => !['cancelled'].includes(String(o.status || '').toLowerCase()),
    ).length;
    const summary = {
      totalEarnings,
      activeProducts,
      activeOrders,
      pendingSettlement,
      totalProducts: products.length,
    };

    const vendorIdStr = String(id || '').trim();
    let kycRecord = null;
    if (mongoose.Types.ObjectId.isValid(vendorIdStr)) {
      const oid = new mongoose.Types.ObjectId(vendorIdStr);
      kycRecord = await VendorKyc.findOne({ vendorId: oid }).lean();
    }
    if (!kycRecord) {
      kycRecord = await VendorKyc.findOne({ vendorId: vendorIdStr }).lean();
    }
    const kycDocuments = [];
    if (kycRecord) {
      const gstUrl = kycRecord.businessDetails?.gstCertificate || '';
      const panUrl = kycRecord.panPhoto || '';
      const stores = kycRecord.storeManagement?.stores || [];
      const shopUrl =
        stores.find((s) => String(s.shopFrontPhotoUrl || '').trim())
          ?.shopFrontPhotoUrl || '';
      const doc = (docId, title, url) => ({
        id: docId,
        title,
        url: String(url || '').trim(),
        status: String(url || '').trim() ? 'Uploaded' : 'Not Uploaded',
      });
      kycDocuments.push(
        doc('gst', 'GST Certificate', gstUrl),
        doc('pan', 'Business PAN', panUrl),
        doc('shop', 'Shop Photo', shopUrl),
      );
    } else {
      kycDocuments.push(
        {
          id: 'gst',
          title: 'GST Certificate',
          url: '',
          status: 'Not Uploaded',
        },
        { id: 'pan', title: 'Business PAN', url: '', status: 'Not Uploaded' },
        { id: 'shop', title: 'Shop Photo', url: '', status: 'Not Uploaded' },
      );
    }

    const storesForAddr = kycRecord?.storeManagement?.stores || [];
    const defaultStore =
      storesForAddr.find((s) => s.isDefault) || storesForAddr[0] || null;
    const businessAddress =
      String(defaultStore?.completeAddress || '').trim() ||
      String(kycRecord?.permanentAddress || '').trim() ||
      '';

    // const productRentPerMonth = (p) => {
    //   const tiers = p.rentalConfigurations || [];
    //   const t = tiers[0];
    //   if (!t) return 0;
    //   const cr = Number(t.customerRent || 0);
    //   if (cr > 0) return Math.round(cr);
    //   const ppd = Number(t.pricePerDay || 0);
    //   return ppd > 0 ? Math.round(ppd * 30) : 0;
    // };

    const productRentPerMonth = (p) => {
      const allTiers = [
        ...(Array.isArray(p.rentalConfigurations)
          ? p.rentalConfigurations
          : []),
        ...(Array.isArray(p.variants)
          ? p.variants.flatMap((v) =>
              Array.isArray(v?.rentalConfigurations)
                ? v.rentalConfigurations
                : [],
            )
          : []),
      ];
      const validTiers = allTiers.filter(
        (t) => Number(t?.customerRent || t?.pricePerDay || 0) > 0,
      );
      if (!validTiers.length) return 0;
      const lowest = validTiers.sort((a, b) => {
        const perUnitA =
          a.periodUnit === 'day' && Number(a.days) > 0
            ? Number(a.customerRent || a.pricePerDay) / Number(a.days)
            : Number(a.customerRent || a.pricePerDay);
        const perUnitB =
          b.periodUnit === 'day' && Number(b.days) > 0
            ? Number(b.customerRent || b.pricePerDay) / Number(b.days)
            : Number(b.customerRent || b.pricePerDay);
        return perUnitA - perUnitB;
      })[0];
      const cr = Number(lowest.customerRent || 0);
      if (cr > 0) return Math.round(cr);
      const ppd = Number(lowest.pricePerDay || 0);
      return ppd > 0 ? Math.round(ppd * 30) : 0;
    };

    const lastTx = transactions[0];
    const lastSettlementDate = lastTx?.date || null;

    res.json({
      vendor: {
        _id: vendor._id,
        fullName: vendor.fullName,
        emailAddress: vendor.emailAddress,
        mobileNumber: vendor.mobileNumber || '',
        referralCode: vendor.referralCode || '',
        isVerified: vendor.isVerified,
        createdAt: vendor.createdAt,
        vendorCode: `VEN-${String(vendor._id).slice(-4).toUpperCase()}`,
      },
      kycApplicationStatus: kycRecord?.status || null,
      businessAddress,
      summary,
      products: products.map((p) => {
        const isSellType = String(p.type || '').toLowerCase() === 'sell';
        // return {
        //   _id: p._id,
        //   productName: p.productName,
        //   category: p.category,
        //   type: p.type,
        //   price: isSellType ? p.price : 0,
        //   stock: p.stock,
        //   status: p.status,
        //   image: p.image,
        //   rentPerMonth: isSellType ? 0 : productRentPerMonth(p),
        //   submissionStatus: p.submissionStatus,
        //   isAdminApproved: p.isAdminApproved,
        //   adminListingEnabled: p.adminListingEnabled,
        //   vendorListingEnabled: p.vendorListingEnabled,
        // };

        const rentPerMonth = isSellType ? 0 : productRentPerMonth(p);
        return {
          _id: p._id,
          productName: p.productName,
          category: p.category,
          type: p.type,
          price: isSellType ? p.price : rentPerMonth,
          stock: p.stock,
          status: p.status,
          image: p.image,
          rentPerMonth,
          submissionStatus: p.submissionStatus,
          isAdminApproved: p.isAdminApproved,
          adminListingEnabled: p.adminListingEnabled,
          vendorListingEnabled: p.vendorListingEnabled,
        };
      }),
      kycDocuments,
      financials: {
        totalEarnings,
        pendingSettlement,
        lastSettlement: Math.round(totalEarnings * 0.03),
        lastSettlementDate,
      },
      // recentTransactions: transactions.slice(0, 8),
      recentTransactions: transactions,
      loanHistory: [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Sell vs rental from line snapshot and/or populated catalog product. */
function lineIsSell(line) {
  const t = String(line?.productType || '')
    .trim()
    .toLowerCase();
  if (t === 'sell') return true;
  const p = line?.product;
  if (p && typeof p === 'object') {
    const pt = String(p.type || '')
      .trim()
      .toLowerCase();
    if (pt === 'sell') return true;
  }
  return false;
}

/** Brand-new sell purchases only; everything else (Refurbished, Like New, …) → used bucket. */
function sellSpendIsBrandNew(conditionRaw) {
  const c = String(conditionRaw || '')
    .trim()
    .toLowerCase();
  return c === 'brand new' || c === 'brandnew';
}

/**
 * Per line: checkout stores the customer line total in `pricePerDay` × `quantity`
 * (full-tenure rent for rentals, sale price × qty for buys).
 */
function lineGoodsTotal(line) {
  const qty = Math.max(1, Number(line?.quantity || 1));
  return Number(line?.pricePerDay || 0) * qty;
}

function summarizeUserOrders(orders = []) {
  let ordersCount = 0;
  let itemsCount = 0;
  let newBuy = 0;
  let usedBuy = 0;
  let rent = 0;
  let deposit = 0;
  let shipping = 0;

  for (const order of orders) {
    const lines = order.products || [];
    if (!lines.length) continue;
    ordersCount += 1;

    for (const line of lines) {
      itemsCount += Math.max(1, Number(line?.quantity || 1));
      const amt = lineGoodsTotal(line);

      if (lineIsSell(line)) {
        const p = line.product;
        const cond =
          p && typeof p === 'object' ? String(p.condition || '').trim() : '';
        if (sellSpendIsBrandNew(cond)) newBuy += amt;
        else usedBuy += amt;
      } else {
        rent += amt;
        deposit += Number(line.refundableDeposit || 0);
      }
    }

    shipping += 99;
  }

  // At-home product service (AC/fridge visits): not implemented — always 0 for API/UI.
  const lifetimeValue =
    rent + newBuy + usedBuy + deposit + shipping + service + otherCharges;
  return {
    ordersCount,
    itemsCount,
    service,
    newBuy,
    usedBuy,
    rent,
    deposit,
    shipping,
    lifetimeValue,
  };
}

// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({})
//       .select('fullName emailAddress createdAt customerNumber')
//       .sort({ createdAt: -1 });

//     const userIds = users.map((u) => u._id);
//     const [kycRows, orders, addressPhones, orderPhones] = await Promise.all([
//       UserKyc.find({ userId: { $in: userIds } })
//         .select('userId contactNumber')
//         .lean(),
//       // Order.find({ user: { $in: userIds } })
//       //   .populate('products.product', 'type condition')
//       //   .lean(),
//       Order.find({ user: { $in: userIds } })
//         .populate('products.product', 'type category condition')
//         .lean(),
//       Address.aggregate([
//         { $match: { user: { $in: userIds } } },
//         { $sort: { createdAt: -1 } },
//         { $group: { _id: '$user', phone: { $first: '$phone' } } },
//       ]),
//       Order.aggregate([
//         { $match: { user: { $in: userIds } } },
//         { $sort: { createdAt: -1 } },
//         { $group: { _id: '$user', phone: { $first: '$phone' } } },
//       ]),
//     ]);

//     const kycByUser = new Map(
//       kycRows.map((k) => [
//         String(k.userId),
//         String(k.contactNumber || '').trim(),
//       ]),
//     );
//     const addressPhoneByUser = new Map(
//       addressPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );
//     const orderPhoneByUser = new Map(
//       orderPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );

//     const ordersByUser = new Map();
//     for (const id of userIds) {
//       ordersByUser.set(String(id), []);
//     }
//     for (const o of orders) {
//       const key = String(o.user);
//       if (!ordersByUser.has(key)) ordersByUser.set(key, []);
//       ordersByUser.get(key).push(o);
//     }

//     // const result = users.map((u) => {
//     //   const uid = String(u._id);
//     //   const userOrders = ordersByUser.get(uid) || [];
//     //   const fin = summarizeUserOrders(userOrders);
//     //   const lifetimeValue =
//     //     fin.rent + fin.newBuy + fin.usedBuy + fin.deposit + fin.shipping;
//     //   return {
//     //     _id: u._id,
//     //     fullName: u.fullName,
//     //     emailAddress: u.emailAddress,
//     //     createdAt: u.createdAt,
//     //     customerNumber: u.customerNumber,
//     //     kycMobile:
//     //       kycByUser.get(uid) ||
//     //       addressPhoneByUser.get(uid) ||
//     //       orderPhoneByUser.get(uid) ||
//     //       '',
//     //     ordersCount: fin.ordersCount,
//     //     itemsCount: fin.itemsCount,
//     //     service: 0,
//     //     newBuy: fin.newBuy,
//     //     usedBuy: fin.usedBuy,
//     //     rent: fin.rent,
//     //     deposit: fin.deposit,
//     //     shipping: fin.shipping,
//     //     lifetimeValue,
//     //   };
//     // });

//     const result = users.map((u) => {
//       const uid = String(u._id);
//       const userOrders = ordersByUser.get(uid) || [];

//       let ordersCount = 0;
//       let itemsCount = 0;
//       let service = 0;
//       let newBuy = 0;
//       let usedBuy = 0;
//       let rent = 0;
//       let deposit = 0;
//       let shipping = 0;

//       userOrders.forEach((order) => {
//         const items = order.products || [];
//         if (!items.length) return;
//         ordersCount += 1;

//         items.forEach((it) => {
//           const p = it.product || {};
//           const qty = Number(it.quantity || 0);
//           const lineBase = Number(it.pricePerDay || 0) * qty;

//           const category = String(p.category || '').toLowerCase();
//           const type = String(p.type || '').toLowerCase();
//           const condition = String(p.condition || '').toLowerCase();

//           itemsCount += qty;

//           if (category.includes('service')) {
//             service += lineBase;
//           } else if (type === 'sell') {
//             if (condition.includes('new')) {
//               newBuy += lineBase;
//             } else {
//               usedBuy += lineBase;
//             }
//           } else {
//             rent += lineBase;
//           }

//           deposit += Math.round(lineBase * 0.3);
//           shipping += Math.round(lineBase * 0.05);
//         });
//       });

//       const lifetimeValue = rent + newBuy + usedBuy + deposit + shipping;

//       return {
//         _id: u._id,
//         fullName: u.fullName,
//         emailAddress: u.emailAddress,
//         createdAt: u.createdAt,
//         customerNumber: u.customerNumber,
//         kycMobile:
//           kycByUser.get(uid) ||
//           addressPhoneByUser.get(uid) ||
//           orderPhoneByUser.get(uid) ||
//           '',
//         ordersCount,
//         itemsCount,
//         service,
//         newBuy,
//         usedBuy,
//         rent,
//         deposit,
//         shipping,
//         lifetimeValue,
//       };
//     });
//     res.json({ users: result });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getAllUsers = async (req, res) => {
//   try {
//     // const users = await User.find({})
//     //   .select('fullName emailAddress createdAt customerNumber')
//     //   .sort({ createdAt: -1 });
//     const users = await User.find({})
//       .select('fullName emailAddress mobileNumber createdAt customerNumber')
//       .sort({ createdAt: -1 });

//     const userIds = users.map((u) => u._id);
//     const [kycRows, orders, serviceBookings, addressPhones, orderPhones] =
//       await Promise.all([
//         UserKyc.find({ userId: { $in: userIds } })
//           .select('userId contactNumber')
//           .lean(),
//         Order.find({ user: { $in: userIds } })
//           .populate('products.product', 'type category condition')
//           .lean(),
//         ServiceBooking.find({ user: { $in: userIds } })
//           .select('user totalAmount status')
//           .lean(),
//         Address.aggregate([
//           { $match: { user: { $in: userIds } } },
//           { $sort: { createdAt: -1 } },
//           { $group: { _id: '$user', phone: { $first: '$phone' } } },
//         ]),
//         Order.aggregate([
//           { $match: { user: { $in: userIds } } },
//           { $sort: { createdAt: -1 } },
//           { $group: { _id: '$user', phone: { $first: '$phone' } } },
//         ]),
//       ]);

//     const kycByUser = new Map(
//       kycRows.map((k) => [
//         String(k.userId),
//         String(k.contactNumber || '').trim(),
//       ]),
//     );
//     const addressPhoneByUser = new Map(
//       addressPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );
//     const orderPhoneByUser = new Map(
//       orderPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );

//     const ordersByUser = new Map();
//     for (const id of userIds) {
//       ordersByUser.set(String(id), []);
//     }
//     for (const o of orders) {
//       const key = String(o.user);
//       if (!ordersByUser.has(key)) ordersByUser.set(key, []);
//       ordersByUser.get(key).push(o);
//     }

//     // Group service bookings per user (exclude cancelled from revenue total)
//     // const serviceByUser = new Map();
//     // for (const id of userIds) {
//     //   serviceByUser.set(String(id), 0);
//     // }
//     // for (const b of serviceBookings) {
//     //   if (String(b.status).toLowerCase() === 'cancelled') continue;
//     //   const key = String(b.user);
//     //   const prev = serviceByUser.get(key) || 0;
//     //   serviceByUser.set(key, prev + Number(b.totalAmount || 0));
//     // }
//     // Group service bookings per user (exclude cancelled from revenue total)
//     const serviceByUser = new Map();
//     const serviceBookingsByUser = new Map();
//     for (const id of userIds) {
//       serviceByUser.set(String(id), 0);
//       serviceBookingsByUser.set(String(id), []);
//     }
//     for (const b of serviceBookings) {
//       const key = String(b.user);
//       if (!serviceBookingsByUser.has(key)) serviceBookingsByUser.set(key, []);
//       serviceBookingsByUser.get(key).push(b);
//       if (String(b.status).toLowerCase() === 'cancelled') continue;
//       const prev = serviceByUser.get(key) || 0;
//       serviceByUser.set(key, prev + Number(b.totalAmount || 0));
//     }

//     // const result = users.map((u) => {
//     //   const uid = String(u._id);
//     //   const userOrders = ordersByUser.get(uid) || [];
//     //   const fin = summarizeUserOrders(userOrders);
//     //   const lifetimeValue =
//     //     fin.rent + fin.newBuy + fin.usedBuy + fin.deposit + fin.shipping;
//     //   return {
//     //     _id: u._id,
//     //     fullName: u.fullName,
//     //     emailAddress: u.emailAddress,
//     //     createdAt: u.createdAt,
//     //     customerNumber: u.customerNumber,
//     //     kycMobile:
//     //       kycByUser.get(uid) ||
//     //       addressPhoneByUser.get(uid) ||
//     //       orderPhoneByUser.get(uid) ||
//     //       '',
//     //     ordersCount: fin.ordersCount,
//     //     itemsCount: fin.itemsCount,
//     //     service: 0,
//     //     newBuy: fin.newBuy,
//     //     usedBuy: fin.usedBuy,
//     //     rent: fin.rent,
//     //     deposit: fin.deposit,
//     //     shipping: fin.shipping,
//     //     lifetimeValue,
//     //   };
//     // });

//     const result = users.map((u) => {
//       const uid = String(u._id);
//       const userOrders = ordersByUser.get(uid) || [];

//       let ordersCount = 0;
//       let itemsCount = 0;
//       let newBuy = 0;
//       let usedBuy = 0;
//       let rent = 0;
//       let deposit = 0;
//       let shipping = 0;
//       let otherCharges = 0;

//       // userOrders.forEach((order) => {
//       //   const items = order.products || [];
//       //   if (!items.length) return;
//       //   ordersCount += 1;
//       // let lastOrderAt = null;

//       // userOrders.forEach((order) => {
//       //   const items = order.products || [];
//       //   if (!items.length) return;
//       //   ordersCount += 1;

//       //   if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
//       //     lastOrderAt = order.createdAt;
//       //   }
//       let lastOrderAt = null;
//       let totalTenureMonths = 0;

//       userOrders.forEach((order) => {
//         const items = order.products || [];
//         if (!items.length) return;
//         ordersCount += 1;
//         totalTenureMonths += Number(order.rentalDuration || 0);

//         if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
//           lastOrderAt = order.createdAt;
//         }

//         otherCharges +=
//           Number(order.gst || 0) +
//           Number(order.careProtection || 0) +
//           Number(order.repairWarranty || 0) +
//           Number(order.relocationWarranty || 0) +
//           Number(order.deliveryPackaging || 0) +
//           Number(order.installationFee || 0) +
//           Number(order.platformFee || 0);
//         items.forEach((it) => {
//           const p = it.product || {};
//           const qty = Number(it.quantity || 0);
//           const lineBase = Number(it.pricePerDay || 0) * qty;

//           const type = String(p.type || '').toLowerCase();
//           const condition = String(p.condition || '').toLowerCase();

//           itemsCount += qty;

//           if (type === 'sell') {
//             if (condition.includes('new')) {
//               newBuy += lineBase;
//             } else {
//               usedBuy += lineBase;
//             }
//           } else {
//             rent += lineBase;
//           }

//           // deposit += Math.round(lineBase * 0.3);
//           deposit += Number(it.refundableDeposit || 0);
//           shipping += Math.round(lineBase * 0.05);
//         });
//       });

//       // Service revenue now comes from real ServiceBooking totals, not Order.products
//       // const service = serviceByUser.get(uid) || 0;

//       // const lifetimeValue =
//       //   rent + newBuy + usedBuy + deposit + shipping + service;
//       // Service revenue now comes from real ServiceBooking totals, not Order.products
//       const service = serviceByUser.get(uid) || 0;

//       const userServiceBookings = serviceBookingsByUser.get(uid) || [];
//       userServiceBookings.forEach((b) => {
//         if (String(b.status).toLowerCase() === 'cancelled') return;
//         if (!lastOrderAt || new Date(b.createdAt) > new Date(lastOrderAt)) {
//           lastOrderAt = b.createdAt;
//         }
//       });

//       const lifetimeValue =
//         rent + newBuy + usedBuy + deposit + shipping + service;

//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   customerNumber: u.customerNumber,
//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   lastOrderAt,
//       //   customerNumber: u.customerNumber,
//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   lastOrderAt,
//       //   avgTenureMonths: ordersCount
//       //     ? Number((totalTenureMonths / ordersCount).toFixed(1))
//       //     : 0,
//       //   customerNumber: u.customerNumber,
//       //   kycMobile:
//       //     kycByUser.get(uid) ||
//       //     addressPhoneByUser.get(uid) ||
//       //     orderPhoneByUser.get(uid) ||
//       //     '',
//       return {
//         _id: u._id,
//         fullName: u.fullName,
//         emailAddress: u.emailAddress,
//         mobileNumber: u.mobileNumber || '',
//         createdAt: u.createdAt,
//         lastOrderAt,
//         avgTenureMonths: ordersCount
//           ? Number((totalTenureMonths / ordersCount).toFixed(1))
//           : 0,
//         customerNumber: u.customerNumber,
//         kycMobile:
//           kycByUser.get(uid) ||
//           addressPhoneByUser.get(uid) ||
//           orderPhoneByUser.get(uid) ||
//           '',
//         ordersCount,
//         itemsCount,
//         service,
//         newBuy,
//         usedBuy,
//         rent,
//         deposit,
//         shipping,
//         otherCharges,
//         lifetimeValue,
//       };
//     });
//     res.json({ users: result });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getAllUsers = async (req, res) => {
//   try {
//     // const users = await User.find({})
//     //   .select('fullName emailAddress createdAt customerNumber')
//     //   .sort({ createdAt: -1 });
//     const users = await User.find({})
//       .select('fullName emailAddress mobileNumber createdAt customerNumber')
//       .sort({ createdAt: -1 });

//     const userIds = users.map((u) => u._id);
//     const [kycRows, orders, serviceBookings, addressPhones, orderPhones] =
//       await Promise.all([
//         UserKyc.find({ userId: { $in: userIds } })
//           .select('userId contactNumber')
//           .lean(),
//         Order.find({ user: { $in: userIds } })
//           .populate('products.product', 'type category condition')
//           .lean(),
//         ServiceBooking.find({ user: { $in: userIds } })
//           .select('user totalAmount status')
//           .lean(),
//         Address.aggregate([
//           { $match: { user: { $in: userIds } } },
//           { $sort: { createdAt: -1 } },
//           { $group: { _id: '$user', phone: { $first: '$phone' } } },
//         ]),
//         Order.aggregate([
//           { $match: { user: { $in: userIds } } },
//           { $sort: { createdAt: -1 } },
//           { $group: { _id: '$user', phone: { $first: '$phone' } } },
//         ]),
//       ]);

//     const kycByUser = new Map(
//       kycRows.map((k) => [
//         String(k.userId),
//         String(k.contactNumber || '').trim(),
//       ]),
//     );
//     const addressPhoneByUser = new Map(
//       addressPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );
//     const orderPhoneByUser = new Map(
//       orderPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );

//     const ordersByUser = new Map();
//     for (const id of userIds) {
//       ordersByUser.set(String(id), []);
//     }
//     for (const o of orders) {
//       const key = String(o.user);
//       if (!ordersByUser.has(key)) ordersByUser.set(key, []);
//       ordersByUser.get(key).push(o);
//     }

//     // Group service bookings per user (exclude cancelled from revenue total)
//     // const serviceByUser = new Map();
//     // for (const id of userIds) {
//     //   serviceByUser.set(String(id), 0);
//     // }
//     // for (const b of serviceBookings) {
//     //   if (String(b.status).toLowerCase() === 'cancelled') continue;
//     //   const key = String(b.user);
//     //   const prev = serviceByUser.get(key) || 0;
//     //   serviceByUser.set(key, prev + Number(b.totalAmount || 0));
//     // }
//     // Group service bookings per user (exclude cancelled from revenue total)
//     const serviceByUser = new Map();
//     const serviceBookingsByUser = new Map();
//     for (const id of userIds) {
//       serviceByUser.set(String(id), 0);
//       serviceBookingsByUser.set(String(id), []);
//     }
//     for (const b of serviceBookings) {
//       const key = String(b.user);
//       if (!serviceBookingsByUser.has(key)) serviceBookingsByUser.set(key, []);
//       serviceBookingsByUser.get(key).push(b);
//       if (String(b.status).toLowerCase() === 'cancelled') continue;
//       const prev = serviceByUser.get(key) || 0;
//       serviceByUser.set(key, prev + Number(b.totalAmount || 0));
//     }

//     // const result = users.map((u) => {
//     //   const uid = String(u._id);
//     //   const userOrders = ordersByUser.get(uid) || [];
//     //   const fin = summarizeUserOrders(userOrders);
//     //   const lifetimeValue =
//     //     fin.rent + fin.newBuy + fin.usedBuy + fin.deposit + fin.shipping;
//     //   return {
//     //     _id: u._id,
//     //     fullName: u.fullName,
//     //     emailAddress: u.emailAddress,
//     //     createdAt: u.createdAt,
//     //     customerNumber: u.customerNumber,
//     //     kycMobile:
//     //       kycByUser.get(uid) ||
//     //       addressPhoneByUser.get(uid) ||
//     //       orderPhoneByUser.get(uid) ||
//     //       '',
//     //     ordersCount: fin.ordersCount,
//     //     itemsCount: fin.itemsCount,
//     //     service: 0,
//     //     newBuy: fin.newBuy,
//     //     usedBuy: fin.usedBuy,
//     //     rent: fin.rent,
//     //     deposit: fin.deposit,
//     //     shipping: fin.shipping,
//     //     lifetimeValue,
//     //   };
//     // });

//     const result = users.map((u) => {
//       const uid = String(u._id);
//       const userOrders = ordersByUser.get(uid) || [];

//       let ordersCount = 0;
//       let itemsCount = 0;
//       let newBuy = 0;
//       let usedBuy = 0;
//       let rent = 0;
//       let deposit = 0;
//       let shipping = 0;
//       let otherCharges = 0;

//       // userOrders.forEach((order) => {
//       //   const items = order.products || [];
//       //   if (!items.length) return;
//       //   ordersCount += 1;
//       // let lastOrderAt = null;

//       // userOrders.forEach((order) => {
//       //   const items = order.products || [];
//       //   if (!items.length) return;
//       //   ordersCount += 1;

//       //   if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
//       //     lastOrderAt = order.createdAt;
//       //   }
//       let lastOrderAt = null;
//       let totalTenureMonths = 0;

//       userOrders.forEach((order) => {
//         const items = order.products || [];
//         if (!items.length) return;
//         ordersCount += 1;
//         totalTenureMonths += Number(order.rentalDuration || 0);

//         if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
//           lastOrderAt = order.createdAt;
//         }

//         otherCharges +=
//           Number(order.gst || 0) +
//           Number(order.careProtection || 0) +
//           Number(order.repairWarranty || 0) +
//           Number(order.relocationWarranty || 0) +
//           Number(order.deliveryPackaging || 0) +
//           Number(order.installationFee || 0) +
//           Number(order.platformFee || 0);
//         items.forEach((it) => {
//           const p = it.product || {};
//           const qty = Number(it.quantity || 0);
//           const lineBase = Number(it.pricePerDay || 0) * qty;

//           const type = String(p.type || '').toLowerCase();
//           const condition = String(p.condition || '').toLowerCase();

//           itemsCount += qty;

//           if (type === 'sell') {
//             if (condition.includes('new')) {
//               newBuy += lineBase;
//             } else {
//               usedBuy += lineBase;
//             }
//           } else {
//             rent += lineBase;
//           }

//           // deposit += Math.round(lineBase * 0.3);
//           deposit += Number(it.refundableDeposit || 0);
//           shipping += Math.round(lineBase * 0.05);
//         });
//       });

//       // Service revenue now comes from real ServiceBooking totals, not Order.products
//       // const service = serviceByUser.get(uid) || 0;

//       // const lifetimeValue =
//       //   rent + newBuy + usedBuy + deposit + shipping + service;
//       // Service revenue now comes from real ServiceBooking totals, not Order.products
//       const service = serviceByUser.get(uid) || 0;

//       const userServiceBookings = serviceBookingsByUser.get(uid) || [];
//       userServiceBookings.forEach((b) => {
//         if (String(b.status).toLowerCase() === 'cancelled') return;
//         if (!lastOrderAt || new Date(b.createdAt) > new Date(lastOrderAt)) {
//           lastOrderAt = b.createdAt;
//         }
//       });

//       const lifetimeValue =
//         rent + newBuy + usedBuy + deposit + shipping + service;

//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   customerNumber: u.customerNumber,
//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   lastOrderAt,
//       //   customerNumber: u.customerNumber,
//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   lastOrderAt,
//       //   avgTenureMonths: ordersCount
//       //     ? Number((totalTenureMonths / ordersCount).toFixed(1))
//       //     : 0,
//       //   customerNumber: u.customerNumber,
//       //   kycMobile:
//       //     kycByUser.get(uid) ||
//       //     addressPhoneByUser.get(uid) ||
//       //     orderPhoneByUser.get(uid) ||
//       //     '',
//       return {
//         _id: u._id,
//         fullName: u.fullName,
//         emailAddress: u.emailAddress,
//         mobileNumber: u.mobileNumber || '',
//         createdAt: u.createdAt,
//         lastOrderAt,
//         avgTenureMonths: ordersCount
//           ? Number((totalTenureMonths / ordersCount).toFixed(1))
//           : 0,
//         customerNumber: u.customerNumber,
//         kycMobile:
//           kycByUser.get(uid) ||
//           addressPhoneByUser.get(uid) ||
//           orderPhoneByUser.get(uid) ||
//           '',
//         ordersCount,
//         itemsCount,
//         service,
//         newBuy,
//         usedBuy,
//         rent,
//         deposit,
//         shipping,
//         otherCharges,
//         lifetimeValue,
//       };
//     });
//     res.json({ users: result });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getAllUsers = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);

    // const users = await User.find({})
    //   .select('fullName emailAddress createdAt customerNumber')
    //   .sort({ createdAt: -1 });
    let userIdsInScope = null;
    if (cityProductIds) {
      const cityOrders = await Order.find(
        { 'products.product': { $in: cityProductIds } },
        { user: 1 },
      ).lean();
      userIdsInScope = [...new Set(cityOrders.map((o) => String(o.user)))];
    }

    const userFilter = userIdsInScope ? { _id: { $in: userIdsInScope } } : {};

    const users = await User.find(userFilter)
      .select('fullName emailAddress mobileNumber createdAt customerNumber')
      .sort({ createdAt: -1 });

    const userIds = users.map((u) => u._id);
    const [kycRows, orders, serviceBookings, addressPhones, orderPhones] =
      await Promise.all([
        UserKyc.find({ userId: { $in: userIds } })
          .select('userId contactNumber')
          .lean(),
        Order.find({ user: { $in: userIds } })
          .populate('products.product', 'type category condition')
          .lean(),
        ServiceBooking.find({ user: { $in: userIds } })
          .select('user totalAmount status')
          .lean(),
        Address.aggregate([
          { $match: { user: { $in: userIds } } },
          { $sort: { createdAt: -1 } },
          { $group: { _id: '$user', phone: { $first: '$phone' } } },
        ]),
        Order.aggregate([
          { $match: { user: { $in: userIds } } },
          { $sort: { createdAt: -1 } },
          { $group: { _id: '$user', phone: { $first: '$phone' } } },
        ]),
      ]);

    const kycByUser = new Map(
      kycRows.map((k) => [
        String(k.userId),
        String(k.contactNumber || '').trim(),
      ]),
    );
    const addressPhoneByUser = new Map(
      addressPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
    );
    const orderPhoneByUser = new Map(
      orderPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
    );

    const ordersByUser = new Map();
    for (const id of userIds) {
      ordersByUser.set(String(id), []);
    }
    for (const o of orders) {
      const key = String(o.user);
      if (!ordersByUser.has(key)) ordersByUser.set(key, []);
      ordersByUser.get(key).push(o);
    }

    // Group service bookings per user (exclude cancelled from revenue total)
    // const serviceByUser = new Map();
    // for (const id of userIds) {
    //   serviceByUser.set(String(id), 0);
    // }
    // for (const b of serviceBookings) {
    //   if (String(b.status).toLowerCase() === 'cancelled') continue;
    //   const key = String(b.user);
    //   const prev = serviceByUser.get(key) || 0;
    //   serviceByUser.set(key, prev + Number(b.totalAmount || 0));
    // }
    // Group service bookings per user (exclude cancelled from revenue total)
    const serviceByUser = new Map();
    const serviceBookingsByUser = new Map();
    for (const id of userIds) {
      serviceByUser.set(String(id), 0);
      serviceBookingsByUser.set(String(id), []);
    }
    for (const b of serviceBookings) {
      const key = String(b.user);
      if (!serviceBookingsByUser.has(key)) serviceBookingsByUser.set(key, []);
      serviceBookingsByUser.get(key).push(b);
      if (String(b.status).toLowerCase() === 'cancelled') continue;
      const prev = serviceByUser.get(key) || 0;
      serviceByUser.set(key, prev + Number(b.totalAmount || 0));
    }

    // const result = users.map((u) => {
    //   const uid = String(u._id);
    //   const userOrders = ordersByUser.get(uid) || [];
    //   const fin = summarizeUserOrders(userOrders);
    //   const lifetimeValue =
    //     fin.rent + fin.newBuy + fin.usedBuy + fin.deposit + fin.shipping;
    //   return {
    //     _id: u._id,
    //     fullName: u.fullName,
    //     emailAddress: u.emailAddress,
    //     createdAt: u.createdAt,
    //     customerNumber: u.customerNumber,
    //     kycMobile:
    //       kycByUser.get(uid) ||
    //       addressPhoneByUser.get(uid) ||
    //       orderPhoneByUser.get(uid) ||
    //       '',
    //     ordersCount: fin.ordersCount,
    //     itemsCount: fin.itemsCount,
    //     service: 0,
    //     newBuy: fin.newBuy,
    //     usedBuy: fin.usedBuy,
    //     rent: fin.rent,
    //     deposit: fin.deposit,
    //     shipping: fin.shipping,
    //     lifetimeValue,
    //   };
    // });

    const result = users.map((u) => {
      const uid = String(u._id);
      const userOrders = ordersByUser.get(uid) || [];

      let ordersCount = 0;
      let itemsCount = 0;
      let newBuy = 0;
      let usedBuy = 0;
      let mintBuy = 0;
      let rent = 0;
      let deposit = 0;
      let shipping = 0;
      let otherCharges = 0;

      // userOrders.forEach((order) => {
      //   const items = order.products || [];
      //   if (!items.length) return;
      //   ordersCount += 1;
      // let lastOrderAt = null;

      // userOrders.forEach((order) => {
      //   const items = order.products || [];
      //   if (!items.length) return;
      //   ordersCount += 1;

      //   if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
      //     lastOrderAt = order.createdAt;
      //   }
      let lastOrderAt = null;
      let totalTenureMonths = 0;

      userOrders.forEach((order) => {
        const items = order.products || [];
        if (!items.length) return;
        ordersCount += 1;
        totalTenureMonths += Number(order.rentalDuration || 0);

        if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
          lastOrderAt = order.createdAt;
        }

        otherCharges +=
          Number(order.gst || 0) +
          Number(order.careProtection || 0) +
          Number(order.repairWarranty || 0) +
          Number(order.relocationWarranty || 0) +
          Number(order.deliveryPackaging || 0) +
          Number(order.installationFee || 0) +
          Number(order.platformFee || 0);
        items.forEach((it) => {
          const p = it.product || {};
          const qty = Number(it.quantity || 0);
          const lineBase = Number(it.pricePerDay || 0) * qty;

          const type = String(p.type || '').toLowerCase();
          const condition = String(p.condition || '').toLowerCase();

          itemsCount += qty;

          if (type === 'sell') {
            if (condition.includes('new')) {
              newBuy += lineBase;
            } else if (condition.includes('mint')) {
              mintBuy += lineBase;
            } else {
              usedBuy += lineBase;
            }
          } else {
            rent += lineBase;
          }

          // deposit += Math.round(lineBase * 0.3);
          deposit += Number(it.refundableDeposit || 0);
          shipping += Math.round(lineBase * 0.05);
        });
      });

      // Service revenue now comes from real ServiceBooking totals, not Order.products
      // const service = serviceByUser.get(uid) || 0;

      // const lifetimeValue =
      //   rent + newBuy + usedBuy + deposit + shipping + service;
      // Service revenue now comes from real ServiceBooking totals, not Order.products
      const service = serviceByUser.get(uid) || 0;

      const userServiceBookings = serviceBookingsByUser.get(uid) || [];
      userServiceBookings.forEach((b) => {
        if (String(b.status).toLowerCase() === 'cancelled') return;
        if (!lastOrderAt || new Date(b.createdAt) > new Date(lastOrderAt)) {
          lastOrderAt = b.createdAt;
        }
      });

      const lifetimeValue =
        rent + newBuy + usedBuy + mintBuy + deposit + shipping + service;

      // return {
      //   _id: u._id,
      //   fullName: u.fullName,
      //   emailAddress: u.emailAddress,
      //   createdAt: u.createdAt,
      //   customerNumber: u.customerNumber,
      // return {
      //   _id: u._id,
      //   fullName: u.fullName,
      //   emailAddress: u.emailAddress,
      //   createdAt: u.createdAt,
      //   lastOrderAt,
      //   customerNumber: u.customerNumber,
      // return {
      //   _id: u._id,
      //   fullName: u.fullName,
      //   emailAddress: u.emailAddress,
      //   createdAt: u.createdAt,
      //   lastOrderAt,
      //   avgTenureMonths: ordersCount
      //     ? Number((totalTenureMonths / ordersCount).toFixed(1))
      //     : 0,
      //   customerNumber: u.customerNumber,
      //   kycMobile:
      //     kycByUser.get(uid) ||
      //     addressPhoneByUser.get(uid) ||
      //     orderPhoneByUser.get(uid) ||
      //     '',
      return {
        _id: u._id,
        fullName: u.fullName,
        emailAddress: u.emailAddress,
        mobileNumber: u.mobileNumber || '',
        createdAt: u.createdAt,
        lastOrderAt,
        avgTenureMonths: ordersCount
          ? Number((totalTenureMonths / ordersCount).toFixed(1))
          : 0,
        customerNumber: u.customerNumber,
        kycMobile:
          kycByUser.get(uid) ||
          addressPhoneByUser.get(uid) ||
          orderPhoneByUser.get(uid) ||
          '',
        ordersCount,
        itemsCount,
        service,
        newBuy,
        usedBuy,
        mintBuy,
        rent,
        deposit,
        shipping,
        otherCharges,
        lifetimeValue,
      };
    });
    res.json({ users: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getAllUsers = async (req, res) => {
//   try {
//     // const users = await User.find({})
//     //   .select('fullName emailAddress createdAt customerNumber')
//     //   .sort({ createdAt: -1 });
//     const users = await User.find({})
//       .select('fullName emailAddress mobileNumber createdAt customerNumber')
//       .sort({ createdAt: -1 });

//     const userIds = users.map((u) => u._id);
//     const [kycRows, orders, serviceBookings, addressPhones, orderPhones] =
//       await Promise.all([
//         UserKyc.find({ userId: { $in: userIds } })
//           .select('userId contactNumber')
//           .lean(),
//         Order.find({ user: { $in: userIds } })
//           .populate('products.product', 'type category condition')
//           .lean(),
//         ServiceBooking.find({ user: { $in: userIds } })
//           .select('user totalAmount status')
//           .lean(),
//         Address.aggregate([
//           { $match: { user: { $in: userIds } } },
//           { $sort: { createdAt: -1 } },
//           { $group: { _id: '$user', phone: { $first: '$phone' } } },
//         ]),
//         Order.aggregate([
//           { $match: { user: { $in: userIds } } },
//           { $sort: { createdAt: -1 } },
//           { $group: { _id: '$user', phone: { $first: '$phone' } } },
//         ]),
//       ]);

//     const kycByUser = new Map(
//       kycRows.map((k) => [
//         String(k.userId),
//         String(k.contactNumber || '').trim(),
//       ]),
//     );
//     const addressPhoneByUser = new Map(
//       addressPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );
//     const orderPhoneByUser = new Map(
//       orderPhones.map((r) => [String(r._id), String(r.phone || '').trim()]),
//     );

//     const ordersByUser = new Map();
//     for (const id of userIds) {
//       ordersByUser.set(String(id), []);
//     }
//     for (const o of orders) {
//       const key = String(o.user);
//       if (!ordersByUser.has(key)) ordersByUser.set(key, []);
//       ordersByUser.get(key).push(o);
//     }

//     // Group service bookings per user (exclude cancelled from revenue total)
//     // const serviceByUser = new Map();
//     // for (const id of userIds) {
//     //   serviceByUser.set(String(id), 0);
//     // }
//     // for (const b of serviceBookings) {
//     //   if (String(b.status).toLowerCase() === 'cancelled') continue;
//     //   const key = String(b.user);
//     //   const prev = serviceByUser.get(key) || 0;
//     //   serviceByUser.set(key, prev + Number(b.totalAmount || 0));
//     // }
//     // Group service bookings per user (exclude cancelled from revenue total)
//     const serviceByUser = new Map();
//     const serviceBookingsByUser = new Map();
//     for (const id of userIds) {
//       serviceByUser.set(String(id), 0);
//       serviceBookingsByUser.set(String(id), []);
//     }
//     for (const b of serviceBookings) {
//       const key = String(b.user);
//       if (!serviceBookingsByUser.has(key)) serviceBookingsByUser.set(key, []);
//       serviceBookingsByUser.get(key).push(b);
//       if (String(b.status).toLowerCase() === 'cancelled') continue;
//       const prev = serviceByUser.get(key) || 0;
//       serviceByUser.set(key, prev + Number(b.totalAmount || 0));
//     }

//     // const result = users.map((u) => {
//     //   const uid = String(u._id);
//     //   const userOrders = ordersByUser.get(uid) || [];
//     //   const fin = summarizeUserOrders(userOrders);
//     //   const lifetimeValue =
//     //     fin.rent + fin.newBuy + fin.usedBuy + fin.deposit + fin.shipping;
//     //   return {
//     //     _id: u._id,
//     //     fullName: u.fullName,
//     //     emailAddress: u.emailAddress,
//     //     createdAt: u.createdAt,
//     //     customerNumber: u.customerNumber,
//     //     kycMobile:
//     //       kycByUser.get(uid) ||
//     //       addressPhoneByUser.get(uid) ||
//     //       orderPhoneByUser.get(uid) ||
//     //       '',
//     //     ordersCount: fin.ordersCount,
//     //     itemsCount: fin.itemsCount,
//     //     service: 0,
//     //     newBuy: fin.newBuy,
//     //     usedBuy: fin.usedBuy,
//     //     rent: fin.rent,
//     //     deposit: fin.deposit,
//     //     shipping: fin.shipping,
//     //     lifetimeValue,
//     //   };
//     // });

//     const result = users.map((u) => {
//       const uid = String(u._id);
//       const userOrders = ordersByUser.get(uid) || [];

//       let ordersCount = 0;
//       let itemsCount = 0;
//       let newBuy = 0;
//       let usedBuy = 0;
//       let rent = 0;
//       let deposit = 0;
//       // let shipping = 0;
//       // let otherCharges = 0;
//       let shipping = 0;
//       let otherCharges = 0;
//       let orderRevenueTotal = 0;

//       // userOrders.forEach((order) => {
//       //   const items = order.products || [];
//       //   if (!items.length) return;
//       //   ordersCount += 1;
//       // let lastOrderAt = null;

//       // userOrders.forEach((order) => {
//       //   const items = order.products || [];
//       //   if (!items.length) return;
//       //   ordersCount += 1;

//       //   if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
//       //     lastOrderAt = order.createdAt;
//       //   }
//       let lastOrderAt = null;
//       let totalTenureMonths = 0;

//       userOrders.forEach((order) => {
//         const items = order.products || [];
//         if (!items.length) return;
//         ordersCount += 1;
//         totalTenureMonths += Number(order.rentalDuration || 0);

//         if (!lastOrderAt || new Date(order.createdAt) > new Date(lastOrderAt)) {
//           lastOrderAt = order.createdAt;
//         }

//         //   otherCharges +=
//         //     Number(order.gst || 0) +
//         //     Number(order.careProtection || 0) +
//         //     Number(order.repairWarranty || 0) +
//         //     Number(order.relocationWarranty || 0) +
//         //     Number(order.deliveryPackaging || 0) +
//         //     Number(order.installationFee || 0) +
//         //     Number(order.platformFee || 0);
//         //   items.forEach((it) => {
//         //     const p = it.product || {};
//         //     const qty = Number(it.quantity || 0);
//         //     const lineBase = Number(it.pricePerDay || 0) * qty;

//         //     const type = String(p.type || '').toLowerCase();
//         //     const condition = String(p.condition || '').toLowerCase();

//         //     itemsCount += qty;

//         //     if (type === 'sell') {
//         //       if (condition.includes('new')) {
//         //         newBuy += lineBase;
//         //       } else {
//         //         usedBuy += lineBase;
//         //       }
//         //     } else {
//         //       rent += lineBase;
//         //     }

//         //     // deposit += Math.round(lineBase * 0.3);
//         //     deposit += Number(it.refundableDeposit || 0);
//         //     shipping += Math.round(lineBase * 0.05);
//         //   });
//         // });

//         otherCharges +=
//           Number(order.gst || 0) +
//           Number(order.careProtection || 0) +
//           Number(order.repairWarranty || 0) +
//           Number(order.relocationWarranty || 0) +
//           Number(order.deliveryPackaging || 0) +
//           Number(order.installationFee || 0);

//         let orderProductTotal = 0;
//         let orderDepositTotal = 0;

//         items.forEach((it) => {
//           const p = it.product || {};
//           const qty = Number(it.quantity || 0);
//           const lineBase = Number(it.pricePerDay || 0) * qty;

//           const type = String(p.type || '').toLowerCase();
//           const condition = String(p.condition || '').toLowerCase();

//           itemsCount += qty;
//           orderProductTotal += lineBase;
//           orderDepositTotal += Number(it.refundableDeposit || 0);

//           if (type === 'sell') {
//             if (condition.includes('new')) {
//               newBuy += lineBase;
//             } else {
//               usedBuy += lineBase;
//             }
//           } else {
//             rent += lineBase;
//           }

//           // deposit += Math.round(lineBase * 0.3);
//           deposit += Number(it.refundableDeposit || 0);
//           shipping += Math.round(lineBase * 0.05);
//         });

//         // Matches computeAdminLineBreakdown().payout on the Orders page,
//         // applied once per order so the Users page revenue total stays
//         // in sync with the Orders page total.
//         const orderPlatformFee = Number(order.platformFee || 0);
//         const orderDiscount = Number(order.discountAmount || 0);
//         const orderOtherTaxes =
//           Number(order.gst || 0) +
//           Number(order.careProtection || 0) +
//           Number(order.repairWarranty || 0) +
//           Number(order.relocationWarranty || 0) +
//           Number(order.deliveryPackaging || 0) +
//           Number(order.installationFee || 0);
//         const fullPayout =
//           Math.max(0, orderProductTotal - orderPlatformFee - orderDiscount) +
//           orderDepositTotal +
//           orderOtherTaxes;

//         console.log('[getAllUsers] order', String(order._id), {
//           orderProductTotal,
//           orderPlatformFee,
//           orderDiscount,
//           orderDepositTotal,
//           orderOtherTaxes,
//           fullPayout,
//         });

//         orderRevenueTotal += fullPayout;
//       });

//       // Service revenue now comes from real ServiceBooking totals, not Order.products
//       // const service = serviceByUser.get(uid) || 0;

//       // const lifetimeValue =
//       //   rent + newBuy + usedBuy + deposit + shipping + service;
//       // Service revenue now comes from real ServiceBooking totals, not Order.products
//       const service = serviceByUser.get(uid) || 0;

//       const userServiceBookings = serviceBookingsByUser.get(uid) || [];
//       userServiceBookings.forEach((b) => {
//         if (String(b.status).toLowerCase() === 'cancelled') return;
//         if (!lastOrderAt || new Date(b.createdAt) > new Date(lastOrderAt)) {
//           lastOrderAt = b.createdAt;
//         }
//       });

//       // const lifetimeValue =
//       //   rent + newBuy + usedBuy + deposit + shipping + service;
//       const lifetimeValue = orderRevenueTotal + service;

//       console.log('[getAllUsers] user', uid, {
//         orderRevenueTotal,
//         service,
//         lifetimeValue,
//       });

//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   customerNumber: u.customerNumber,
//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   lastOrderAt,
//       //   customerNumber: u.customerNumber,
//       // return {
//       //   _id: u._id,
//       //   fullName: u.fullName,
//       //   emailAddress: u.emailAddress,
//       //   createdAt: u.createdAt,
//       //   lastOrderAt,
//       //   avgTenureMonths: ordersCount
//       //     ? Number((totalTenureMonths / ordersCount).toFixed(1))
//       //     : 0,
//       //   customerNumber: u.customerNumber,
//       //   kycMobile:
//       //     kycByUser.get(uid) ||
//       //     addressPhoneByUser.get(uid) ||
//       //     orderPhoneByUser.get(uid) ||
//       //     '',
//       return {
//         _id: u._id,
//         fullName: u.fullName,
//         emailAddress: u.emailAddress,
//         mobileNumber: u.mobileNumber || '',
//         createdAt: u.createdAt,
//         lastOrderAt,
//         avgTenureMonths: ordersCount
//           ? Number((totalTenureMonths / ordersCount).toFixed(1))
//           : 0,
//         customerNumber: u.customerNumber,
//         kycMobile:
//           kycByUser.get(uid) ||
//           addressPhoneByUser.get(uid) ||
//           orderPhoneByUser.get(uid) ||
//           '',
//         ordersCount,
//         itemsCount,
//         service,
//         newBuy,
//         usedBuy,
//         rent,
//         deposit,
//         shipping,
//         otherCharges,
//         lifetimeValue,
//       };
//     });
//     const grandTotalLifetimeValue = result.reduce(
//       (s, u) => s + Number(u.lifetimeValue || 0),
//       0,
//     );
//     console.log(
//       '[getAllUsers] GRAND TOTAL lifetimeValue across all users:',
//       grandTotalLifetimeValue,
//     );

//     res.json({ users: result });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      'fullName emailAddress mobileNumber createdAt customerNumber',
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(String(id))
      ? new mongoose.Types.ObjectId(String(id))
      : null;
    const userOrderFilter = userObjectId
      ? { user: userObjectId }
      : { user: id };

    const populateOrderPaths = [
      { path: 'user', select: 'fullName emailAddress' },
      {
        path: 'products.product',
        select:
          'productName image category type rentalConfigurations refundableDeposit vendorId logisticsVerification',
      },
    ];

    const [orders, kycLean, issueOrders, addressDoc] = await Promise.all([
      Order.find(userOrderFilter)
        .populate(populateOrderPaths)
        .sort({ createdAt: -1 })
        .lean(),
      UserKyc.findOne({ userId: userObjectId || id }).lean(),
      Order.find({
        ...userOrderFilter,
        'products.issueReports.0': { $exists: true },
      })
        .populate(populateOrderPaths)
        .sort({ createdAt: -1 })
        .lean(),
      Address.findOne({ user: userObjectId || id })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // const orderPhone = orders.length
    //   ? String(orders[0].phone || '').trim()
    //   : '';
    // const resolvedProfilePhone =
    //   String(kycLean?.contactNumber || '').trim() ||
    //   String(addressDoc?.phone || '').trim() ||
    //   orderPhone;
    const orderPhone = orders.length
      ? String(orders[0].phone || '').trim()
      : '';
    const resolvedProfilePhone =
      String(user.mobileNumber || '').trim() ||
      String(kycLean?.contactNumber || '').trim() ||
      String(addressDoc?.phone || '').trim() ||
      orderPhone;

    const activeRentals = buildMyRentalsStyleActiveRows(orders);
    const supportTickets = await buildIssueTicketsFromOrders(issueOrders);

    const orderHistory = [];
    let totalAmount = 0;
    let totalRentAmount = 0;
    let totalDeposit = 0;
    let totalShipping = 0;

    orders.forEach((order) => {
      const orderAmount = (order.products || []).reduce((sum, item) => {
        const qty = Number(item.quantity || 0);
        return sum + Number(item.pricePerDay || 0) * qty;
      }, 0);

      totalAmount += orderAmount;
      totalRentAmount += orderAmount;
      totalDeposit += (order.products || []).reduce(
        (s, item) =>
          s +
          Math.round(
            Number(item.pricePerDay || 0) * Number(item.quantity || 0) * 0.3,
          ),
        0,
      );
      totalShipping += (order.products || []).reduce(
        (s, item) =>
          s +
          Math.round(
            Number(item.pricePerDay || 0) * Number(item.quantity || 0) * 0.05,
          ),
        0,
      );

      const firstLine = (order.products || [])[0];
      const firstProd = firstLine?.product;
      const isSell =
        String(firstLine?.productType || '').toLowerCase() === 'sell' ||
        (firstProd &&
          typeof firstProd === 'object' &&
          String(firstProd.type || '').toLowerCase() === 'sell');

      orderHistory.push({
        _id: order._id,
        date: order.createdAt,
        amount: orderAmount,
        status: order.status,
        type: isSell ? 'Buy' : 'Rent',
        description:
          order.products
            ?.map((p) => p.product?.productName)
            .filter(Boolean)
            .join(', ') || 'Rental order',
      });
    });

    const tenureMonths = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) /
          (30 * 24 * 60 * 60 * 1000),
      ),
    );

    const customerNumber = user.customerNumber;
    const customerCode =
      customerNumber != null && customerNumber > 0
        ? `CUST-${String(customerNumber).padStart(3, '0')}`
        : `CUST-${String(user._id).slice(-6).toUpperCase()}`;

    const customerKyc = kycLean
      ? {
          status: kycLean.status,
          submittedAt: kycLean.submittedAt,
          reviewedAt: kycLean.reviewedAt,
          contactNumber: resolvedProfilePhone,
          aadhaarFront: kycLean.aadhaarFront || '',
          aadhaarBack: kycLean.aadhaarBack || '',
          panCard: kycLean.panCard || '',
          selfie: kycLean.selfie || '',
        }
      : null;

    res.json({
      profilePhone: resolvedProfilePhone,
      // user: {
      //   _id: user._id,
      //   fullName: user.fullName,
      //   emailAddress: user.emailAddress,
      //   createdAt: user.createdAt,
      //   customerCode,
      //   customerNumber: customerNumber ?? null,
      // },
      user: {
        _id: user._id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        mobileNumber: user.mobileNumber || '',
        createdAt: user.createdAt,
        customerCode,
        customerNumber: customerNumber ?? null,
      },
      summary: {
        tenureMonths,
        totalOrders: orders.length,
        totalAmount,
        activeRentals: activeRentals.length,
      },
      financials: {
        rent: totalRentAmount,
        deposit: totalDeposit,
        shipping: totalShipping,
      },
      activeRentals,
      orderHistory,
      customerKyc,
      kycDocuments: [],
      supportTickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const patchAdminProductListingVisibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const raw = req.body?.adminListingEnabled;
    const adminListingEnabled = raw === true || raw === 'true';

    let item = await Product.findById(productId);
    if (!item) {
      item = await ServiceProduct.findById(productId);
    }
    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (adminListingEnabled && item.isAdminApproved === false) {
      return res.status(400).json({
        message: 'Approve the product before enabling it on the storefront.',
      });
    }

    item.adminListingEnabled = adminListingEnabled;
    await item.save();

    return res.json({
      message: 'Listing visibility updated.',
      product: item,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      storefront,
      sellStats,
      userLat,
      userLng,
    } = req.query;

    /** Storefront buy page: counts for all sell listings + by condition (no pagination). */
    if ((storefront === '1' || storefront === 'true') && sellStats === '1') {
      // const match = {
      //   type: 'Sell',
      //   vendorId: { $exists: true, $ne: null },
      //   submissionStatus: 'published',
      //   isAdminApproved: { $ne: false },
      //   ...storefrontListingVisibilityMatch(),
      // };
      const match = {
        type: 'Sell',
        vendorId: { $exists: true, $ne: null },
        submissionStatus: 'published',
        isAdminApproved: { $ne: false },
        isDeleted: { $ne: true },
        ...storefrontListingVisibilityMatch(),
      };
      const rows = await Product.find(match)
        .populate('vendorId', '_id')
        .select('condition variants.condition')
        .lean();

      const vendorIds = [
        ...new Set(
          (rows || [])
            .map((p) => String(p.vendorId?._id || ''))
            .filter(Boolean),
        ),
      ];
      const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
        .select('vendorId storeManagement.stores')
        .lean();
      const activeVendors = new Set(
        (kycRows || [])
          .filter((r) => pickPrimaryStore(r?.storeManagement?.stores || []))
          .map((r) => String(r.vendorId)),
      );

      const visible = (rows || []).filter(
        (p) => p.vendorId && activeVendors.has(String(p.vendorId?._id || '')),
      );

      const norm = (raw) =>
        String(raw ?? '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ');

      let brandNew = 0;
      let refurbished = 0;
      for (const p of visible) {
        let c = norm(p.condition);
        if (!c && Array.isArray(p.variants) && p.variants.length) {
          c = norm(p.variants[0]?.condition);
        }
        if (c === 'brand new') brandNew += 1;
        else if (c === 'refurbished') refurbished += 1;
      }

      return res.status(200).json({
        total: visible.length,
        brandNew,
        refurbished,
      });
    }

    // const query = {};
    // if (search) query.productName = { $regex: search, $options: 'i' };
    // if (category) query.category = category;
    // const query = {};
    // if (search) {
    //   query.$or = [
    //     { productName: { $regex: search, $options: 'i' } },
    //     { category: { $regex: search, $options: 'i' } },
    //     { subCategory: { $regex: search, $options: 'i' } },
    //   ];
    // }
    // if (category) query.category = category;

    const query = {};
    // Soft-deleted products (vendor deleted them) must never show up in any
    // product listing — storefront or admin — but the document itself is
    // kept intact so existing orders can still resolve/populate it.
    query.isDeleted = { $ne: true };
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    /** Public website: show only admin-approved published listings. */
    if (storefront === '1' || storefront === 'true') {
      query.vendorId = { $exists: true, $ne: null };
      query.submissionStatus = 'published';
      query.isAdminApproved = { $ne: false };
      Object.assign(query, storefrontListingVisibilityMatch());
    }

    // const total = await Product.countDocuments(query);

    // console.log('Query:', query);
    // Sub-admin city restriction: only applies when this request is
    // authenticated as a subadmin. Storefront/public requests (no req.admin)
    // and full admins are completely unaffected.
    if (req.admin && req.admin.role === 'subadmin' && req.admin.location) {
      const cityProductIds = await getCityProductIds(req);
      if (cityProductIds) {
        query._id = { $in: cityProductIds };
      }
    }

    const total = await Product.countDocuments(query);

    console.log('Query:', query);

    console.log(
      'All Service products in DB:',
      await Product.find({ type: 'Service' }).select('productName type'),
    );

    const products = await Product.find(query)
      .populate('vendorId', 'fullName emailAddress')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const serviceCount = await ServiceProduct.countDocuments({
      submissionStatus: 'published',
      isAdminApproved: true,
      adminListingEnabled: true,
      vendorListingEnabled: true,
    });

    console.log(
      'Service products returned by API:',
      products.filter((p) => p.type === 'Service'),
    );

    // console.log(
    //   products.map((p) => ({
    //     name: p.productName,
    //     type: p.type,
    //     vendorId: p.vendorId,
    //   })),
    // );

    // If a vendor was deleted, populate(vendorId) becomes null; hide such products.
    let visibleProducts = (products || []).filter((p) => p.vendorId);

    // Storefront: hide vendors that have no active stores (admin-disabled store should hide all listings).
    const storefrontMode = storefront === '1' || storefront === 'true';
    if (storefrontMode && visibleProducts.length) {
      const vendorIds = [
        ...new Set(
          visibleProducts
            .map((p) => String(p.vendorId?._id || ''))
            .filter(Boolean),
        ),
      ];
      const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
        .select('vendorId storeManagement.stores')
        .lean();
      const activeVendors = new Set(
        (kycRows || [])
          .filter((r) => pickPrimaryStore(r?.storeManagement?.stores || []))
          .map((r) => String(r.vendorId)),
      );
      visibleProducts = visibleProducts.filter((p) =>
        activeVendors.has(String(p.vendorId?._id || '')),
      );
    }

    // Storefront location filtering: if user location is selected, only show
    // vendors that serve that location based on their store service mode.
    const hasUserLocation =
      Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng));
    if (storefrontMode && hasUserLocation && visibleProducts.length) {
      const userLatNum = Number(userLat);
      const userLngNum = Number(userLng);
      const vendorIds = [
        ...new Set(
          visibleProducts
            .map((p) => String(p.vendorId?._id || ''))
            .filter(Boolean),
        ),
      ];
      const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
        .select('vendorId storeManagement.stores')
        .lean();
      // const storeMap = new Map();
      // for (const row of kycRows || []) {
      //   const store = pickPrimaryStore(row?.storeManagement?.stores || []);
      //   storeMap.set(String(row?.vendorId || ''), store || null);
      // }
      // visibleProducts = visibleProducts.filter((p) => {
      //   const vid = String(p.vendorId?._id || '');
      //   const store = storeMap.get(vid);
      //   return vendorServesLocation(store, userLatNum, userLngNum);
      // });

      // Map storeId -> store subdocument, across ALL vendors in this batch,
      // so each product can be checked against its OWN linked store —
      // not just "some" active store belonging to the same vendor.
      const storeByIdMap = new Map();
      // Fallback: vendor's primary store, only used for legacy products
      // that don't have a storeId yet.
      const vendorPrimaryStoreMap = new Map();
      for (const row of kycRows || []) {
        const stores = row?.storeManagement?.stores || [];
        stores.forEach((s) => {
          if (s?._id) storeByIdMap.set(String(s._id), s);
        });
        vendorPrimaryStoreMap.set(
          String(row?.vendorId || ''),
          pickPrimaryStore(stores) || null,
        );
      }
      visibleProducts = visibleProducts.filter((p) => {
        const vid = String(p.vendorId?._id || '');
        const linkedStore = p.storeId
          ? storeByIdMap.get(String(p.storeId))
          : null;
        // Legacy product with no storeId yet: fall back to old behaviour
        // (vendor's primary store) so it doesn't just disappear.
        const store = linkedStore || vendorPrimaryStoreMap.get(vid);
        if (!store) return false;
        // A product's own linked store must itself be active — a vendor
        // having some OTHER active store elsewhere must not let this
        // product through.
        if (store.isActive === false) return false;
        return vendorServesLocation(store, userLatNum, userLngNum);
      });
    }

    // Sub-admin state-level Rent/Buy/Service toggle filtering.
    // Only runs when we have coordinates to resolve a state from; if
    // LocationSourceSettings has no doc for that state, nothing is hidden.
    if (storefrontMode && visibleProducts.length && hasUserLocation) {
      const resolvedCity = await resolveCityFromCoords(
        Number(userLat),
        Number(userLng),
      );
      if (resolvedCity) {
        const normalizedState = String(resolvedCity).trim().toLowerCase();
        const stateSettings = await LocationSourceSettings.findOne({
          state: normalizedState,
        }).lean();

        if (stateSettings) {
          const vendorIdsForState = [
            ...new Set(
              visibleProducts
                .map((p) => String(p.vendorId?._id || ''))
                .filter(Boolean),
            ),
          ];
          const kycForState = await VendorKyc.find({
            vendorId: { $in: vendorIdsForState },
          })
            .select('vendorId storeManagement.stores')
            .lean();

          // const vendorStateMap = new Map();
          // for (const kyc of kycForState) {
          //   const store = pickPrimaryStore(kyc?.storeManagement?.stores || []);
          //   if (!store) continue;
          //   vendorStateMap.set(
          //     String(kyc.vendorId),
          //     String(extractStateFromStore(store) || '').toLowerCase(),
          //   );
          // }

          // visibleProducts = visibleProducts.filter((p) => {
          //   const vid = String(p.vendorId?._id || '');
          //   const vendorState = vendorStateMap.get(vid);
          //   if (vendorState !== normalizedState) return true; // only gate this state's vendors

          //   if (p.type === 'Rental' && stateSettings.rentEnabled === false) {
          //     return false;
          //   }
          //   if (p.type === 'Sell' && stateSettings.buyEnabled === false) {
          //     return false;
          //   }
          //   if (
          //     p.type === 'Service' &&
          //     stateSettings.serviceEnabled === false
          //   ) {
          //     return false;
          //   }
          //   return true;
          // });

          // Build storeId -> store map (all stores across these vendors),
          // plus a per-vendor primary-store fallback for legacy products
          // that don't have a storeId yet.
          const storeByIdMapForState = new Map();
          const vendorPrimaryStoreMapForState = new Map();
          for (const kyc of kycForState) {
            const stores = kyc?.storeManagement?.stores || [];
            stores.forEach((s) => {
              if (s?._id) storeByIdMapForState.set(String(s._id), s);
            });
            vendorPrimaryStoreMapForState.set(
              String(kyc.vendorId),
              pickPrimaryStore(stores) || null,
            );
          }

          visibleProducts = visibleProducts.filter((p) => {
            const vid = String(p.vendorId?._id || '');
            const linkedStore = p.storeId
              ? storeByIdMapForState.get(String(p.storeId))
              : null;
            const store = linkedStore || vendorPrimaryStoreMapForState.get(vid);
            if (!store) return true; // no store info → don't gate this product

            const productState = String(
              extractCityFromStore(store) || '',
            ).toLowerCase();
            if (productState !== normalizedState) return true; // only gate this state's stores

            if (p.type === 'Rental' && stateSettings.rentEnabled === false) {
              return false;
            }
            if (p.type === 'Sell' && stateSettings.buyEnabled === false) {
              return false;
            }
            if (
              p.type === 'Service' &&
              stateSettings.serviceEnabled === false
            ) {
              return false;
            }
            return true;
          });
        }
      }
    }

    if (storefrontMode && visibleProducts.length) {
      // Get all disabled cities
      const disabledCities = await City.find({ serviceEnabled: false })
        .select('cityKey')
        .lean();

      // if (storefrontMode && visibleProducts.length) {
      //   // Get all disabled cities
      //   const disabledCities = await City.find({ serviceEnabled: false })
      //     .select('cityKey')
      //     .lean();

      if (disabledCities.length > 0) {
        const disabledCityKeys = new Set(disabledCities.map((c) => c.cityKey));

        // Get vendor city mapping from VendorKyc
        const vendorIds = [
          ...new Set(
            visibleProducts
              .filter(
                (p) =>
                  p.type === 'Service' || p.collection === 'ServiceProduct',
              )
              .map((p) => String(p.vendorId?._id || p.vendorId || ''))
              .filter(Boolean),
          ),
        ];

        if (vendorIds.length > 0) {
          const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
            .select('vendorId storeManagement.stores')
            .lean();

          // Map vendorId → city key
          const vendorCityMap = new Map();
          for (const kyc of kycRows) {
            const stores = kyc?.storeManagement?.stores ?? [];
            const primaryStore =
              stores.find((s) => s.isDefault && s.isActive !== false) ||
              stores.find((s) => s.isActive !== false) ||
              stores[0];
            if (!primaryStore) continue;
            const cityName = extractCityFromStore(primaryStore);
            vendorCityMap.set(String(kyc.vendorId), cityName.toLowerCase());
          }

          // Filter out service products from disabled cities
          visibleProducts = visibleProducts.filter((p) => {
            const isService =
              p.type === 'Service' ||
              String(p.collection || '').toLowerCase() === 'serviceproduct';
            if (!isService) return true; // rent/sell always visible
            const vid = String(p.vendorId?._id || p.vendorId || '');
            const cityKey = vendorCityMap.get(vid);
            if (!cityKey) return true; // no city info → show
            return !disabledCityKeys.has(cityKey); // hide if city disabled
          });
        }
      }
    }

    res.status(200).json({
      products: visibleProducts,
      pages: Math.ceil(total / limit),
      total,
      serviceCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function resolveApprovalStatusLabel(product) {
  if (product?.submissionStatus === 'published' && product?.isAdminApproved) {
    return 'approved';
  }
  if (product?.submissionStatus === 'draft') return 'draft';
  return 'pending_approval';
}

// export const getProductApprovalQueue = async (req, res) => {
//   try {
//     const search = String(req.query.search || '').trim();
//     const status = String(req.query.status || 'pending')
//       .trim()
//       .toLowerCase();

//     const query = { vendorId: { $exists: true, $ne: null } };
//     if (search) {
//       query.$or = [
//         { productName: { $regex: search, $options: 'i' } },
//         { category: { $regex: search, $options: 'i' } },
//         { subCategory: { $regex: search, $options: 'i' } },
//       ];
//     }
//     if (status === 'approved') {
//       query.submissionStatus = 'published';
//       query.isAdminApproved = { $ne: false };
//     } else if (status === 'draft') {
//       query.submissionStatus = 'draft';
//     } else {
//       query.submissionStatus = 'pending_approval';
//     }

//     const [products, serviceProducts] = await Promise.all([
//       Product.find(query)
//         .populate('vendorId', 'fullName emailAddress')
//         .sort({ createdAt: -1 })
//         .lean(),
//       ServiceProduct.find(query)
//         .populate('vendorId', 'fullName emailAddress')
//         .sort({ createdAt: -1 })
//         .lean(),
//     ]);

//     const allQueueRows = [...(products || []), ...(serviceProducts || [])].sort(
//       (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
//     );

//     const vendorIds = [
//       ...new Set(
//         (allQueueRows || [])
//           .map((p) => String(p?.vendorId?._id || p?.vendorId || ''))
//           .filter(Boolean),
//       ),
//     ];
//     const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
//       .select('vendorId businessDetails.shopName storeManagement.stores')
//       .lean();
//     const kycMap = new Map(kycRows.map((x) => [String(x.vendorId), x]));
//     const pickPrimaryStore = (stores = []) =>
//       stores.find((s) => s?.isDefault && s?.isActive !== false) ||
//       stores.find((s) => s?.isActive !== false) ||
//       stores[0] ||
//       null;

//     const queue = (allQueueRows || [])
//       .filter((p) => p.vendorId)
//       .map((p) => {
//         const vid = String(p?.vendorId?._id || p?.vendorId || '');
//         const kyc = kycMap.get(vid);
//         const store = pickPrimaryStore(kyc?.storeManagement?.stores || []);
//         const vendorLabel =
//           String(store?.storeName || '').trim() ||
//           String(kyc?.businessDetails?.shopName || '').trim() ||
//           String(p?.vendorId?.fullName || '').trim() ||
//           'Vendor';
//         return {
//           _id: String(p._id),
//           productName: p.productName || 'Product',
//           image:
//             (Array.isArray(p.images) && p.images[0]) ||
//             p.image ||
//             'https://placehold.co/120x80/e5e7eb/6b7280?text=IMG',
//           images:
//             Array.isArray(p.images) && p.images.length
//               ? p.images
//               : p.image
//                 ? [p.image]
//                 : [],
//           category: p.category || '',
//           subCategory: p.subCategory || '',
//           type: p.type || '',
//           createdAt: p.createdAt,
//           submissionStatus: p.submissionStatus || 'draft',
//           approvalStatus: resolveApprovalStatusLabel(p),
//           vendor: {
//             _id: vid,
//             fullName: p?.vendorId?.fullName || '',
//             emailAddress: p?.vendorId?.emailAddress || '',
//             label: vendorLabel,
//           },
//           stock: Number(p.stock || 0),
//           condition: p.condition || '',
//           brand: p.brand || '',
//           description: p.description || p.shortDescription || '',
//           shortDescription: p.shortDescription || '',
//           specifications: p.specifications || {},
//           rentalConfigurations: Array.isArray(p.rentalConfigurations)
//             ? p.rentalConfigurations
//             : [],
//           // refundableDeposit: Number(p.refundableDeposit || 0),
//           // salesConfiguration: p.salesConfiguration || {},
//           refundableDeposit: Number(p.refundableDeposit || 0),
//           salesConfiguration: p.salesConfiguration || {},
//           variants: Array.isArray(p.variants) ? p.variants : [],
//           serviceMeta: p.serviceMeta || {},
//           availabilitySchedule: Array.isArray(p.availabilitySchedule)
//             ? p.availabilitySchedule
//             : [],
//           adminApprovedAt: p.adminApprovedAt || null,
//         };
//       });

//     const counts = {
//       pending: queue.filter((x) => x.approvalStatus === 'pending_approval')
//         .length,
//       approved: queue.filter((x) => x.approvalStatus === 'approved').length,
//       draft: queue.filter((x) => x.approvalStatus === 'draft').length,
//     };

//     return res.json({ queue, counts });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const getAdminInvoices = async (req, res) => {
//   try {
//     const { month, type, status, search } = req.query;

//     const orderFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       orderFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }

//     const orders = await Order.find(orderFilter)
//       .populate('user', 'fullName')
//       .populate('products.product', 'productName vendorId images')
//       .populate({
//         path: 'products.product',
//         populate: { path: 'vendorId', select: 'fullName' },
//       })
//       .sort({ createdAt: -1 })
//       .lean();

// export const getAdminInvoices = async (req, res) => {
//   try {
//     const { month, type, status, search } = req.query;

//     const orderFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       orderFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }

//     const orders = await Order.find(orderFilter)
//       .populate('user', 'fullName')
//       .populate('products.product', 'productName vendorId images')
//       .populate({
//         path: 'products.product',
//         populate: { path: 'vendorId', select: 'fullName' },
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     // Service bookings use the same month filter, but on their own
//     // createdAt (booking creation date, not bookingDate — matches how
//     // Order invoices use order.createdAt as the invoice date).
//     const bookingFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       bookingFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }

//     const bookings = await ServiceBooking.find(bookingFilter)
//       .populate('user', 'fullName')
//       .populate('serviceProduct', 'productName image')
//       .sort({ createdAt: -1 })
//       .lean();

//     const invoices = [];
//     // let pendingAmount = 0,
//     //   paidAmount = 0,
//     //   commissions = 0,
//     //   gst = 0,
//     //   careTax = 0,
//     //   lateFees = 0;
//     let pendingAmount = 0,
//       paidAmount = 0,
//       commissions = 0,
//       gst = 0,
//       careTax = 0,
//       lateFees = 0,
//       repairWarranty = 0,
//       relocationWarranty = 0,
//       deliveryPackaging = 0,
//       installationFee = 0,
//       platformFee = 0;

//     // Late fees are collected and stored on the order itself (see
//     // payNextMonth), independent of month/type/status filters below —
//     // sum them across ALL orders so the summary card reflects the true
//     // platform-wide total regardless of what the table is currently filtered to.
//     lateFees = orders.reduce(
//       (sum, o) => sum + Number(o.lateFeesCollected || 0),
//       0,
//     );

//     orders.forEach((o) => {
//       // const orderGst = Number(o.gst || 0);
//       // const orderCareTax = Number(o.careProtection || 0);
//       const orderGst = Number(o.gst || 0);
//       const orderCareTax = Number(o.careProtection || 0);
//       const orderRepairWarranty = Number(o.repairWarranty || 0);
//       const orderRelocationWarranty = Number(o.relocationWarranty || 0);
//       const orderDeliveryPackaging = Number(o.deliveryPackaging || 0);
//       const orderInstallationFee = Number(o.installationFee || 0);
//       const orderPlatformFee = Number(o.platformFee || 0);
//       const isPaid = ['delivered', 'confirmed'].includes(
//         String(o.status || '').toLowerCase(),
//       );
//       const shortId = String(o._id).slice(-6).toUpperCase();
//       const orderRef = `ORD-${shortId}`;

//       // Rent Receipt — customer side.
//       // Each product line in the order gets its own invoice(s): Rental lines
//       // that span multiple months generate one invoice per month (month 1
//       // follows the order's current status, later months are Pending);
//       // Sell (one-time purchase) lines always generate a single invoice.
//       (o.products || []).forEach((productEntry, productIdx) => {
//         const lineProductType = productEntry.productType || 'Rental';
//         const isRentalLine = String(lineProductType).toLowerCase() === 'rental';
//         const isMonthlyRental =
//           isRentalLine &&
//           String(o.tenureUnit || '').toLowerCase() === 'month' &&
//           Number(o.rentalDuration || 1) > 1;
//         const totalMonths = isMonthlyRental ? Number(o.rentalDuration) : 1;

//         const productName =
//           productEntry.product?.productName || 'Unknown Product';
//         const variantName = productEntry.variantName || '';
//         const productImage = (productEntry.product?.images || [])[0] || '';

//         // const lineTotal =
//         //   Number(productEntry.pricePerDay || 0) *
//         //   Number(productEntry.quantity || 1);
//         // const lineAmount = isMonthlyRental
//         //   ? lineTotal / totalMonths
//         //   : lineTotal;
//         const lineTotal =
//           Number(productEntry.pricePerDay || 0) *
//           Number(productEntry.quantity || 1);
//         // pricePerDay already represents the per-month rent for monthly
//         // rentals, so each month's invoice uses it directly (no dividing
//         // by totalMonths).
//         const lineAmount = lineTotal;

//         for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
//           const dueDate = new Date(o.createdAt);
//           dueDate.setMonth(dueDate.getMonth() + monthIdx);

//           const monthInvoiceNo =
//             monthIdx === 0
//               ? `INV-${shortId}${productIdx > 0 ? `-P${productIdx + 1}` : ''}`
//               : `INV-${shortId}${
//                   productIdx > 0 ? `-P${productIdx + 1}` : ''
//                 }-M${monthIdx + 1}`;

//           // const monthsPaidSoFar = Number(o.monthsPaid ?? 1);
//           // const monthStatus = isMonthlyRental
//           //   ? monthIdx < monthsPaidSoFar
//           //     ? 'Paid'
//           //     : 'Pending'
//           //   : isPaid
//           //     ? 'Paid'
//           //     : 'Pending';

//           // // Look up the actual late fee charged for this specific month, if
//           // // any, from the order's stored payment history (never recomputed —
//           // // this is the exact amount that was collected).
//           // const paymentRecord = (o.monthlyPayments || []).find(
//           //   (p) => Number(p.month) === monthIdx + 1,
//           // );

//           // Per-line tracking (new) — falls back to order-level fields for
//           // pre-existing orders saved before per-line tracking existed.
//           const monthsPaidSoFar = Number(
//             productEntry.monthsPaid ?? o.monthsPaid ?? 1,
//           );
//           const monthStatus = isMonthlyRental
//             ? monthIdx < monthsPaidSoFar
//               ? 'Paid'
//               : 'Pending'
//             : isPaid
//               ? 'Paid'
//               : 'Pending';

//           // Look up the actual late fee charged for this specific month, if
//           // any, from this line's own stored payment history (never
//           // recomputed — this is the exact amount that was collected).
//           const paymentRecord = (
//             productEntry.monthlyPayments ||
//             o.monthlyPayments ||
//             []
//           ).find((p) => Number(p.month) === monthIdx + 1);
//           const lateFeeAmount = Number(paymentRecord?.lateFeeAmount || 0);
//           const daysLate = Number(paymentRecord?.daysLate || 0);

//           invoices.push({
//             _id: `rent-${o._id}-${productIdx}-${monthIdx}`,
//             invoiceNo: monthInvoiceNo,
//             entityName: o.user?.fullName || o.name || 'Unknown Customer',
//             entityType: 'Customer',
//             entityPhone: o.phone || '',
//             productName,
//             variantName,
//             productImage,
//             productType: lineProductType,
//             tenure: isMonthlyRental
//               ? `${totalMonths} month${totalMonths > 1 ? 's' : ''}`
//               : '',
//             type: 'Rent Receipt',
//             orderRef,
//             amount: lineAmount,
//             lateFeeAmount,
//             daysLate,
//             gst: orderGst,
//             careTax: orderCareTax,
//             repairWarranty: orderRepairWarranty,
//             relocationWarranty: orderRelocationWarranty,
//             deliveryPackaging: orderDeliveryPackaging,
//             installationFee: orderInstallationFee,
//             platformFee: orderPlatformFee,
//             date: dueDate,
//             status: monthStatus,
//             note: isMonthlyRental
//               ? `Month ${monthIdx + 1} of ${totalMonths}`
//               : null,
//           });
//         }
//       });

//       gst += orderGst;
//       careTax += orderCareTax;
//       repairWarranty += orderRepairWarranty;
//       relocationWarranty += orderRelocationWarranty;
//       deliveryPackaging += orderDeliveryPackaging;
//       installationFee += orderInstallationFee;
//       platformFee += orderPlatformFee;

//       const orderLineTotal = (o.products || []).reduce(
//         (sum, p) => sum + Number(p.pricePerDay || 0) * Number(p.quantity || 1),
//         0,
//       );
//       if (isPaid) {
//         paidAmount += orderLineTotal;
//       } else {
//         pendingAmount += orderLineTotal;
//       }
//     });
//     // gst and careTax already summed above per order

//     // Service Invoice — one row per booking, no monthly split (services are
//     // one-time bookings, not recurring like rentals).
//     bookings.forEach((b) => {
//       const isPaid = b.paymentStatus === 'paid';
//       const shortId = String(b._id).slice(-6).toUpperCase();

//       invoices.push({
//         _id: `svc-${b._id}`,
//         invoiceNo: `INV-SVC-${shortId}`,
//         entityName: b.user?.fullName || b.name || 'Unknown Customer',
//         entityType: 'Customer',
//         entityPhone: b.phone || '',
//         productName:
//           b.serviceSnapshot?.productName ||
//           b.serviceProduct?.productName ||
//           'Service',
//         variantName: '',
//         productImage: b.serviceSnapshot?.image || b.serviceProduct?.image || '',
//         productType: 'Service',
//         tenure: '',
//         type: 'Service Invoice',
//         orderRef: `SRV-${shortId}`,
//         amount: Number(b.totalAmount || 0),
//         gst: Number(b.taxBreakdown?.gst || 0),
//         careTax: Number(b.taxBreakdown?.care_tax || 0),
//         date: b.createdAt,
//         status:
//           b.paymentMethod === 'pay_after_service'
//             ? isPaid
//               ? 'Paid'
//               : 'Pending'
//             : isPaid
//               ? 'Paid'
//               : 'Pending',
//         note: b.isUrgent ? 'Urgent booking' : null,
//         lateFeeAmount: 0,
//         daysLate: 0,
//       });

//       if (isPaid) {
//         paidAmount += Number(b.totalAmount || 0);
//       } else {
//         pendingAmount += Number(b.totalAmount || 0);
//       }
//       gst += Number(b.taxBreakdown?.gst || 0);
//       careTax += Number(b.taxBreakdown?.care_tax || 0);
//     });

//     let result = invoices;
//     if (type) result = result.filter((r) => r.productType === type);
//     if (status) result = result.filter((r) => r.status === status);
//     if (search) {
//       const q = search.toLowerCase();
//       result = result.filter(
//         (r) =>
//           r.invoiceNo.toLowerCase().includes(q) ||
//           r.entityName.toLowerCase().includes(q) ||
//           r.orderRef.toLowerCase().includes(q) ||
//           String(r.entityPhone || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(r.productName || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(r.amount || '').includes(q),
//       );
//     }

//     // return res.json({
//     //   invoices: result,
//     //   summary: {
//     //     pendingAmount,
//     //     paidAmount,
//     //     commissions,
//     //     gst,
//     //     careTax,
//     //     lateFees,
//     //   },
//     // });
//     return res.json({
//       invoices: result,
//       summary: {
//         pendingAmount,
//         paidAmount,
//         commissions,
//         gst,
//         careTax,
//         lateFees,
//         repairWarranty,
//         relocationWarranty,
//         deliveryPackaging,
//         installationFee,
//         platformFee,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const getProductApprovalQueue = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    let cityVendorIds = null;
    if (cityProductIds) {
      const cityProducts = await Product.find(
        { _id: { $in: cityProductIds } },
        { vendorId: 1 },
      ).lean();
      cityVendorIds = [...new Set(cityProducts.map((p) => String(p.vendorId)))];
    }

    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || 'pending')
      .trim()
      .toLowerCase();

    // const query = { vendorId: { $exists: true, $ne: null } };
    // if (cityVendorIds) {
    //   query.vendorId = { $in: cityVendorIds };
    // }
    const query = {
      vendorId: { $exists: true, $ne: null },
      isDeleted: { $ne: true },
    };
    if (cityVendorIds) {
      query.vendorId = { $in: cityVendorIds };
    }
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'approved') {
      query.submissionStatus = 'published';
      query.isAdminApproved = { $ne: false };
    } else if (status === 'draft') {
      query.submissionStatus = 'draft';
    } else {
      query.submissionStatus = 'pending_approval';
    }

    const [products, serviceProducts] = await Promise.all([
      Product.find(query)
        .populate('vendorId', 'fullName emailAddress')
        .sort({ createdAt: -1 })
        .lean(),
      ServiceProduct.find(query)
        .populate('vendorId', 'fullName emailAddress')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const allQueueRows = [...(products || []), ...(serviceProducts || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

    const vendorIds = [
      ...new Set(
        (allQueueRows || [])
          .map((p) => String(p?.vendorId?._id || p?.vendorId || ''))
          .filter(Boolean),
      ),
    ];
    const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
      .select('vendorId businessDetails.shopName storeManagement.stores')
      .lean();
    const kycMap = new Map(kycRows.map((x) => [String(x.vendorId), x]));
    const pickPrimaryStore = (stores = []) =>
      stores.find((s) => s?.isDefault && s?.isActive !== false) ||
      stores.find((s) => s?.isActive !== false) ||
      stores[0] ||
      null;

    const queue = (allQueueRows || [])
      .filter((p) => p.vendorId)
      .map((p) => {
        const vid = String(p?.vendorId?._id || p?.vendorId || '');
        const kyc = kycMap.get(vid);
        const store = pickPrimaryStore(kyc?.storeManagement?.stores || []);
        const vendorLabel =
          String(store?.storeName || '').trim() ||
          String(kyc?.businessDetails?.shopName || '').trim() ||
          String(p?.vendorId?.fullName || '').trim() ||
          'Vendor';
        return {
          _id: String(p._id),
          productName: p.productName || 'Product',
          image:
            (Array.isArray(p.images) && p.images[0]) ||
            p.image ||
            'https://placehold.co/120x80/e5e7eb/6b7280?text=IMG',
          images:
            Array.isArray(p.images) && p.images.length
              ? p.images
              : p.image
                ? [p.image]
                : [],
          category: p.category || '',
          subCategory: p.subCategory || '',
          type: p.type || '',
          createdAt: p.createdAt,
          submissionStatus: p.submissionStatus || 'draft',
          approvalStatus: resolveApprovalStatusLabel(p),
          vendor: {
            _id: vid,
            fullName: p?.vendorId?.fullName || '',
            emailAddress: p?.vendorId?.emailAddress || '',
            label: vendorLabel,
          },
          stock: Number(p.stock || 0),
          condition: p.condition || '',
          brand: p.brand || '',
          description: p.description || p.shortDescription || '',
          shortDescription: p.shortDescription || '',
          specifications: p.specifications || {},
          rentalConfigurations: Array.isArray(p.rentalConfigurations)
            ? p.rentalConfigurations
            : [],
          // refundableDeposit: Number(p.refundableDeposit || 0),
          // salesConfiguration: p.salesConfiguration || {},
          refundableDeposit: Number(p.refundableDeposit || 0),
          salesConfiguration: p.salesConfiguration || {},
          variants: Array.isArray(p.variants) ? p.variants : [],
          serviceMeta: p.serviceMeta || {},
          availabilitySchedule: Array.isArray(p.availabilitySchedule)
            ? p.availabilitySchedule
            : [],
          adminApprovedAt: p.adminApprovedAt || null,
        };
      });

    const counts = {
      pending: queue.filter((x) => x.approvalStatus === 'pending_approval')
        .length,
      approved: queue.filter((x) => x.approvalStatus === 'approved').length,
      draft: queue.filter((x) => x.approvalStatus === 'draft').length,
    };

    return res.json({ queue, counts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateInvoiceLateFee = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { waiverAmount, reason } = req.body;

    // invoiceId format: rent-{orderId}-{productIdx}-{monthIdx}
    // (service bookings have no late fees, so only "rent-" ids are valid here)
    const parts = String(invoiceId || '').split('-');
    if (parts[0] !== 'rent' || parts.length < 4) {
      return res
        .status(400)
        .json({ message: 'Invalid invoice id for late fee adjustment' });
    }
    const monthIdx = Number(parts[parts.length - 1]);
    const productIdx = Number(parts[parts.length - 2]);
    const orderId = parts.slice(1, parts.length - 2).join('-');

    if (!Number.isInteger(monthIdx) || !Number.isInteger(productIdx)) {
      return res
        .status(400)
        .json({ message: 'Invalid invoice id for late fee adjustment' });
    }

    const waiver = Number(waiverAmount);
    if (!waiver || waiver <= 0) {
      return res
        .status(400)
        .json({ message: 'Waiver amount must be greater than 0' });
    }
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const productEntry = order.products?.[productIdx];
    if (!productEntry) {
      return res
        .status(404)
        .json({ message: 'Product line not found on order' });
    }

    // Use per-line monthlyPayments if present, otherwise fall back to the
    // order-level array (matches the same fallback used in getAdminInvoices).
    const usesPerLinePayments =
      Array.isArray(productEntry.monthlyPayments) &&
      productEntry.monthlyPayments.length > 0;
    const paymentsArray = usesPerLinePayments
      ? productEntry.monthlyPayments
      : order.monthlyPayments;

    if (!Array.isArray(paymentsArray)) {
      return res
        .status(404)
        .json({ message: 'No payment record found for this month' });
    }

    const paymentRecord = paymentsArray.find(
      (p) => Number(p.month) === monthIdx + 1,
    );
    if (!paymentRecord) {
      return res
        .status(404)
        .json({ message: 'No payment record found for this month' });
    }

    const originalLateFee = Number(paymentRecord.lateFeeAmount || 0);
    if (waiver > originalLateFee) {
      return res.status(400).json({
        message: `Waiver amount cannot exceed current late fee of ${originalLateFee}`,
      });
    }

    // Keep the original late fee the first time this record is adjusted,
    // so repeated waivers don't lose the true original amount.
    if (
      paymentRecord.originalLateFeeAmount === undefined ||
      paymentRecord.originalLateFeeAmount === null
    ) {
      paymentRecord.originalLateFeeAmount = originalLateFee;
    }
    paymentRecord.lateFeeAmount = originalLateFee - waiver;
    paymentRecord.lateFeeWaiverAmount =
      Number(paymentRecord.lateFeeWaiverAmount || 0) + waiver;
    paymentRecord.lateFeeWaiverReason = String(reason).trim();
    paymentRecord.lateFeeWaiverApprovedBy =
      req.admin?._id || req.admin?.id || undefined;
    paymentRecord.lateFeeWaiverApprovedAt = new Date();

    if (usesPerLinePayments) {
      order.markModified(`products.${productIdx}.monthlyPayments`);
    } else {
      order.markModified('monthlyPayments');
    }

    // lateFeesCollected is used for the platform-wide summary card total —
    // reduce it by the waived amount so the dashboard stays accurate.
    order.lateFeesCollected = Math.max(
      Number(order.lateFeesCollected || 0) - waiver,
      0,
    );

    await order.save();

    return res.json({
      message: 'Late fee updated successfully',
      finalLateFee: paymentRecord.lateFeeAmount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Waives part/all of a LIVE-computed late fee on a still-PENDING (unpaid)
// month — separate from updateInvoiceLateFee, which only handles months
// that already have a monthlyPayments record (i.e. already paid).
export const updatePendingLateFeeWaiver = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { waiverAmount, reason } = req.body;

    const parts = String(invoiceId || '').split('-');
    if (parts[0] !== 'rent' || parts.length < 4) {
      return res
        .status(400)
        .json({ message: 'Invalid invoice id for late fee adjustment' });
    }
    const monthIdx = Number(parts[parts.length - 1]);
    const productIdx = Number(parts[parts.length - 2]);
    const orderId = parts.slice(1, parts.length - 2).join('-');

    if (!Number.isInteger(monthIdx) || !Number.isInteger(productIdx)) {
      return res
        .status(400)
        .json({ message: 'Invalid invoice id for late fee adjustment' });
    }

    const waiver = Number(waiverAmount);
    if (!waiver || waiver <= 0) {
      return res
        .status(400)
        .json({ message: 'Waiver amount must be greater than 0' });
    }
    // if (!reason || !String(reason).trim()) {
    //   return res.status(400).json({ message: 'Reason is required' });
    // }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const productEntry = order.products?.[productIdx];
    if (!productEntry) {
      return res
        .status(404)
        .json({ message: 'Product line not found on order' });
    }

    const month = monthIdx + 1;

    // Recompute the CURRENT live late fee for this month the same way
    // getAdminInvoices / computeNextMonthDue do, so we can validate the
    // waiver doesn't exceed what's actually owed right now.
    const dueDate = new Date(order.createdAt);
    dueDate.setMonth(dueDate.getMonth() + monthIdx);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLate = Math.max(
      0,
      Math.round((today - dueDate) / (1000 * 60 * 60 * 24)),
    );
    const grossLateFee = daysLate * LATE_FEE_PER_DAY;
    const alreadyWaived = (productEntry.pendingLateFeeWaivers || [])
      .filter((w) => Number(w.month) === month)
      .reduce((sum, w) => sum + Number(w.waiverAmount || 0), 0);
    const currentLateFee = Math.max(0, grossLateFee - alreadyWaived);

    if (waiver > currentLateFee) {
      return res.status(400).json({
        message: `Waiver amount cannot exceed current late fee of ${currentLateFee}`,
      });
    }

    productEntry.pendingLateFeeWaivers =
      productEntry.pendingLateFeeWaivers || [];
    productEntry.pendingLateFeeWaivers.push({
      month,
      waiverAmount: waiver,
      reason: String(reason).trim(),
      approvedBy: req.admin?._id || req.admin?.id || undefined,
      approvedAt: new Date(),
    });
    order.markModified(`products.${productIdx}.pendingLateFeeWaivers`);

    await order.save();

    return res.json({
      message: 'Late fee updated successfully',
      finalLateFee: Math.max(0, currentLateFee - waiver),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const approveProductAndGoLive = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     let item = await Product.findById(productId);
//     if (!item) {
//       item = await ServiceProduct.findById(productId);
//     }
//     if (!item) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     item.isAdminApproved = true;
//     item.submissionStatus = 'published';
//     item.adminApprovedAt = new Date();
//     item.adminApprovedBy = req?.admin?._id;
//     item.adminListingEnabled = true;
//     item.vendorListingEnabled = true;
//     await item.save();

//     return res.json({
//       message: 'Product approved and published to storefront.',
//       productId: String(item._id),
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const approveProductAndGoLive = async (req, res) => {
  try {
    const { productId } = req.params;
    let item = await Product.findById(productId);
    if (!item) {
      item = await ServiceProduct.findById(productId);
    }
    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }

    item.isAdminApproved = true;
    item.submissionStatus = 'published';
    item.adminApprovedAt = new Date();
    item.adminApprovedBy = req?.admin?._id;
    item.adminListingEnabled = true;
    item.vendorListingEnabled = true;
    await item.save();

    // try {
    //   const vendor = await Vendor.findById(item.vendorId);
    //   if (vendor?.email) {
    //     await sendProductApprovedEmail(
    //       vendor.email,
    //       vendor.businessName || vendor.fullName || 'Partner',
    //       item,
    //     );
    //   }
    // } catch (mailErr) {
    //   console.error('Failed to send product approval email:', mailErr.message);
    // }

    try {
      const vendor = await Vendor.findById(item.vendorId);
      if (vendor?.emailAddress) {
        await sendProductApprovedEmail(
          vendor.emailAddress,
          vendor.fullName || 'Partner',
          item,
        );
      }
    } catch (mailErr) {
      console.error('Failed to send product approval email:', mailErr.message);
    }

    return res.json({
      message: 'Product approved and published to storefront.',
      productId: String(item._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const getCityDashboard = async (req, res) => {
// Mirrors the Orders/Order Analytics page's computeAdminLineBreakdown — real payout math
// (line value - platform fee + deposit + taxes) instead of raw order totalAmount.
function computeAdminLineBreakdown(order, line) {
  const qty = Number(line?.quantity || 1);
  const rate = Number(line?.pricePerDay || 0);
  const lineValue = rate * qty;

  const allLines = (order?.products || []).filter(
    (l) => l?.product && typeof l.product === 'object',
  );
  const orderTotalValue =
    allLines.reduce(
      (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
      0,
    ) || 1;
  const share = lineValue / orderTotalValue;

  const orderPlatformFee = Number(order?.platformFee || 0);
  const otherTaxes =
    Number(order?.gst || 0) +
    Number(order?.careProtection || 0) +
    Number(order?.repairWarranty || 0) +
    Number(order?.relocationWarranty || 0) +
    Number(order?.deliveryPackaging || 0) +
    Number(order?.installationFee || 0);

  const lineFee = orderPlatformFee * share;
  const lineTaxes = otherTaxes * share;
  const lineDeposit = Number(line?.refundableDeposit || 0);

  return {
    productAmount: lineValue,
    lineFee,
    lineTaxes,
    lineDeposit,
    payout: Math.max(0, lineValue - lineFee) + lineDeposit + lineTaxes,
  };
}

// Sums the real payout across every populated product line in an order —
// same total the Orders / Order Analytics page shows per order.
function orderPayoutTotal(order) {
  const lines = (order.products || []).filter(
    (l) => l?.product && typeof l.product === 'object',
  );
  return lines.reduce(
    (sum, line) => sum + computeAdminLineBreakdown(order, line).payout,
    0,
  );
}

export const getCityDashboard = async (req, res) => {
  try {
    const { city, period } = req.query;

    // Build vendorId -> cityName map using existing helper
    // const kycRows = await VendorKyc.find({ status: 'approved' })
    //   .select('vendorId storeManagement.stores')
    //   .lean();

    // const vendorToCity = new Map();
    // for (const kyc of kycRows || []) {
    //   const stores = kyc?.storeManagement?.stores || [];
    //   const store =
    //     stores.find((s) => s?.isDefault && s?.isActive !== false) ||
    //     stores.find((s) => s?.isActive !== false) ||
    //     stores[0];
    //   if (!store) continue;
    //   const cityName = extractCityFromStore(store);
    //   vendorToCity.set(String(kyc.vendorId), cityName);
    // }

    // const kycRows = await VendorKyc.find({ status: 'approved' })
    //   .select('vendorId storeManagement.stores')
    //   .lean();

    // const vendorToCity = new Map();
    // for (const kyc of kycRows || []) {
    //   const stores = kyc?.storeManagement?.stores || [];
    //   const store =
    //     stores.find((s) => s?.isDefault && s?.isActive !== false) ||
    //     stores.find((s) => s?.isActive !== false) ||
    //     stores[0];
    //   if (!store) continue;
    //   const cityName = extractCityFromStore(store);
    //   vendorToCity.set(String(kyc.vendorId), cityName);
    // }

    // // Separate map covering ALL vendor KYC docs regardless of status —
    // // needed so pending KYC approvals can be filtered by city even though
    // // the vendor isn't "approved" yet (vendorToCity above only has approved ones).
    // const allKycRows = await VendorKyc.find({})
    //   .select('vendorId storeManagement.stores')
    //   .lean();
    // const vendorToCityAll = new Map();
    // for (const kyc of allKycRows || []) {
    //   const stores = kyc?.storeManagement?.stores || [];
    //   const store =
    //     stores.find((s) => s?.isDefault && s?.isActive !== false) ||
    //     stores.find((s) => s?.isActive !== false) ||
    //     stores[0];
    //   if (!store) continue;
    //   const cityName = extractCityFromStore(store);
    //   vendorToCityAll.set(String(kyc.vendorId), cityName);
    // }

    const knownCities = await City.find({ isDeleted: { $ne: true } })
      .select('cityName')
      .lean();
    const knownCityNames = knownCities
      .map((c) => String(c.cityName || '').trim())
      .filter(Boolean);
    console.log(
      '[getCityDashboard] knownCityNames=',
      JSON.stringify(knownCityNames),
    );

    // const kycRows = await VendorKyc.find({ status: 'approved' })
    //   .select('vendorId storeManagement.stores')
    //   .lean();

    // const vendorToCity = new Map();
    // for (const kyc of kycRows || []) {
    //   const stores = kyc?.storeManagement?.stores || [];
    //   const store =
    //     stores.find((s) => s?.isDefault && s?.isActive !== false) ||
    //     stores.find((s) => s?.isActive !== false) ||
    //     stores[0];
    //   if (!store) continue;
    //   const cityName = (
    //     String(store.city || '').trim() ||
    //     extractCityFromStore(store, knownCityNames)
    //   ).trim();
    //   console.log(
    //     '[getCityDashboard] vendor=',
    //     kyc.vendorId,
    //     'store.city=',
    //     store.city,
    //     'mapAddress=',
    //     store.mapAddress,
    //     'completeAddress=',
    //     store.completeAddress,
    //     'status=',
    //     kyc.status,
    //     'resolved cityName=',
    //     cityName,
    //   );
    //   vendorToCity.set(String(kyc.vendorId), cityName);
    // }

    const isSubadminEarly = req.admin?.role === 'subadmin';
    // Target city to directly match against: the subadmin's own location,
    // OR (for a super-admin) whatever city they selected in the dropdown —
    // as long as it isn't "all". Using this same direct-match approach for
    // both roles means neither path depends on the fragile
    // knownCityNames/extractCityFromStore resolution, which can be thrown
    // off by legacy bad City documents.
    const targetCityEarly = isSubadminEarly
      ? String(req.admin.location || '').trim()
      : city && city !== 'all'
        ? String(city).trim()
        : null;

    // Direct address-match helper: instead of resolving a single "city name"
    // for a store and comparing strings (fragile — breaks if a bad city
    // name got saved previously), just check whether the subadmin's own
    // city appears anywhere in the store's address. This bypasses
    // knownCityNames entirely for subadmins, so it can't be thrown off by
    // any bad/legacy City documents.
    const ADMIN_SUFFIX_REGEX_DASH =
      /\s+(city subdistrict|subdistrict|district|taluk|tehsil|mandal|division)$/i;
    const normalizeForMatch = (s) =>
      String(s || '')
        .replace(ADMIN_SUFFIX_REGEX_DASH, '')
        .trim()
        .toLowerCase();
    const storeMatchesSubadminCity = (store, targetCity) => {
      const target = normalizeForMatch(targetCity);
      if (!target) return false;
      if (normalizeForMatch(store.city) === target) return true;
      const parts = String(store.mapAddress || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      return parts.some((p) => normalizeForMatch(p) === target);
    };

    // const kycRows = await VendorKyc.find({ status: 'approved' })
    //   .select('vendorId storeManagement.stores')
    //   .lean();
    const kycRows = await VendorKyc.find({ status: 'approved' })
      .select('vendorId storeManagement.stores createdAt')
      .lean();

    const vendorToCity = new Map();
    for (const kyc of kycRows || []) {
      const stores = kyc?.storeManagement?.stores || [];
      const store =
        stores.find((s) => s?.isDefault && s?.isActive !== false) ||
        stores.find((s) => s?.isActive !== false) ||
        stores[0];
      if (!store) continue;

      let cityName;
      if (targetCityEarly) {
        // Direct match against the target city (subadmin's own location,
        // or the super-admin's dropdown selection) — no dependency on
        // knownCityNames or extractCityFromStore's guesswork.
        cityName = storeMatchesSubadminCity(store, targetCityEarly)
          ? targetCityEarly
          : '__not_this_city__';
      } else {
        // No specific target (super-admin viewing "All Cities") — use the
        // normal resolution so every vendor gets a real city label for
        // grouping/display purposes.
        cityName = (
          String(store.city || '').trim() ||
          extractCityFromStore(store, knownCityNames)
        ).trim();
      }

      console.log(
        '[getCityDashboard] vendor=',
        kyc.vendorId,
        'store.city=',
        store.city,
        'mapAddress=',
        store.mapAddress,
        'completeAddress=',
        store.completeAddress,
        'status=',
        kyc.status,
        'resolved cityName=',
        cityName,
      );
      vendorToCity.set(String(kyc.vendorId), cityName);
    }

    // Separate map covering ALL vendor KYC docs regardless of status —
    // needed so pending KYC approvals can be filtered by city even though
    // the vendor isn't "approved" yet (vendorToCity above only has approved ones).
    // const allKycRows = await VendorKyc.find({})
    //   .select('vendorId storeManagement.stores')
    //   .lean();
    // const vendorToCityAll = new Map();
    // for (const kyc of allKycRows || []) {
    //   const stores = kyc?.storeManagement?.stores || [];
    //   const store =
    //     stores.find((s) => s?.isDefault && s?.isActive !== false) ||
    //     stores.find((s) => s?.isActive !== false) ||
    //     stores[0];
    //   if (!store) continue;
    //   const cityName = (
    //     String(store.city || '').trim() ||
    //     extractCityFromStore(store, knownCityNames)
    //   ).trim();
    //   vendorToCityAll.set(String(kyc.vendorId), cityName);
    // }

    const allKycRows = await VendorKyc.find({})
      .select('vendorId storeManagement.stores')
      .lean();
    const vendorToCityAll = new Map();
    for (const kyc of allKycRows || []) {
      const stores = kyc?.storeManagement?.stores || [];
      const store =
        stores.find((s) => s?.isDefault && s?.isActive !== false) ||
        stores.find((s) => s?.isActive !== false) ||
        stores[0];
      if (!store) continue;

      let cityName;
      if (targetCityEarly) {
        cityName = storeMatchesSubadminCity(store, targetCityEarly)
          ? targetCityEarly
          : '__not_this_city__';
      } else {
        cityName = (
          String(store.city || '').trim() ||
          extractCityFromStore(store, knownCityNames)
        ).trim();
      }

      vendorToCityAll.set(String(kyc.vendorId), cityName);
    }

    // const wantCity = city && city !== 'all' ? String(city).toLowerCase() : null;
    // const wantCity = city && city !== 'all' ? String(city).toLowerCase() : null;
    // const wantCity = city && city !== 'all' ? String(city).toLowerCase() : null;
    const isSubadmin = req.admin?.role === 'subadmin';
    const wantCity = isSubadmin
      ? String(req.admin.location || '').toLowerCase() || null
      : city && city !== 'all'
        ? String(city).toLowerCase()
        : null;
    console.log(
      '[getCityDashboard] wantCity=',
      wantCity,
      'vendorToCity=',
      JSON.stringify([...vendorToCity.entries()]),
    );
    const vendorIds = wantCity
      ? [...vendorToCity.entries()]
          .filter(([, c]) => String(c).toLowerCase() === wantCity)
          .map(([vId]) => vId)
      : null;

    // Date range for period filter
    const now = new Date();
    let fromDate = null;
    if (period === 'today') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === 'year') {
      fromDate = new Date(now.getFullYear(), 0, 1);
    }

    // const productFilter = vendorIds ? { vendorId: { $in: vendorIds } } : {};
    // const products = await Product.find(productFilter).lean();
    // const activeProducts = products.filter((p) => p.status === 'Active');
    const productFilter = vendorIds ? { vendorId: { $in: vendorIds } } : {};
    const products = await Product.find(productFilter).lean();
    // const activeProducts = products.filter(
    //   (p) =>
    //     p.isAdminApproved !== false &&
    //     String(p.submissionStatus || '').trim() === 'published' &&
    //     p.adminListingEnabled !== false &&
    //     p.vendorListingEnabled !== false &&
    //     Number(p.stock || 0) > 0,
    // );
    const activeProducts = products.filter(
      (p) =>
        p.isAdminApproved !== false &&
        String(p.submissionStatus || '').trim() === 'published' &&
        p.adminListingEnabled !== false &&
        p.vendorListingEnabled !== false,
    );

    const orderMatch = fromDate ? { createdAt: { $gte: fromDate } } : {};
    // const orders = await Order.find(orderMatch)
    //   .populate('products.product', 'vendorId')
    //   .lean();
    const orders = await Order.find(orderMatch)
      .populate('products.product', 'vendorId category')
      .lean();

    // Late fees are a running total collected on the order (see
    // payNextMonth) and should reflect the true amount regardless of the
    // period filter — same approach as the System Invoice summary.
    const lateFeeOrderMatch = {};
    const lateFeeOrders = await Order.find(lateFeeOrderMatch)
      .populate('products.product', 'vendorId')
      .lean();
    const filteredLateFeeOrders = vendorIds
      ? lateFeeOrders.filter((o) =>
          (o.products || []).some((p) =>
            vendorIds.includes(String(p?.product?.vendorId)),
          ),
        )
      : lateFeeOrders;

    const filteredOrders = vendorIds
      ? orders.filter((o) =>
          (o.products || []).some((p) =>
            vendorIds.includes(String(p?.product?.vendorId)),
          ),
        )
      : orders;

    // Service bookings, filtered the same way as orders (city + period),
    // so GST/Care Tax include the same sources as the System Invoice page.
    const bookingMatch = fromDate ? { createdAt: { $gte: fromDate } } : {};
    const bookings = await ServiceBooking.find(bookingMatch).lean();
    const filteredBookings = vendorIds
      ? bookings.filter((b) => vendorIds.includes(String(b.vendor)))
      : bookings;

    const uniqueCustomers = new Set(filteredOrders.map((o) => String(o.user)))
      .size;

    // const grossRevenue = filteredOrders.reduce(
    //   (sum, o) => sum + (Number(o.totalAmount) || 0),
    //   0,
    // );
    // const grossRevenue = filteredOrders.reduce(
    //   (sum, o) => sum + orderPayoutTotal(o),
    //   0,
    // );
    const orderRevenue = filteredOrders.reduce(
      (sum, o) => sum + orderPayoutTotal(o),
      0,
    );
    const serviceRevenue = filteredBookings
      .filter((b) => String(b.status || '').toLowerCase() !== 'cancelled')
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    const grossRevenue = orderRevenue + serviceRevenue;
    const orderGstTax = filteredOrders.reduce(
      (sum, o) => sum + (Number(o.gst) || 0),
      0,
    );
    const orderCareTax = filteredOrders.reduce(
      (sum, o) => sum + (Number(o.careProtection) || 0),
      0,
    );
    const bookingGstTax = filteredBookings.reduce(
      (sum, b) => sum + (Number(b.taxBreakdown?.gst) || 0),
      0,
    );
    const bookingCareTax = filteredBookings.reduce(
      (sum, b) => sum + (Number(b.taxBreakdown?.care_tax) || 0),
      0,
    );
    const gstTax = orderGstTax + bookingGstTax;
    const careTax = orderCareTax + bookingCareTax;
    const lateFees = filteredLateFeeOrders.reduce(
      (sum, o) => sum + (Number(o.lateFeesCollected) || 0),
      0,
    );
    // let pendingRefunds = 0;
    // for (const order of filteredOrders) {
    //   for (const line of order.products || []) {
    //     const rr = line?.returnRequest;
    //     if (!rr) continue;
    //     if (rr.status === 'requested' || rr.status === 'review_submitted') {
    //       pendingRefunds += Number(rr.finalRefundAmount) || 0;
    //     }
    //   }
    // }

    // let pendingRefunds = 0;
    // let refundApprovals = 0; // NEW: count of pending refund requests
    // for (const order of filteredOrders) {
    //   for (const line of order.products || []) {
    //     const rr = line?.returnRequest;
    //     if (!rr) continue;
    //     const isResolved = Boolean(rr.refundApprovedAt || rr.refundRejectedAt);
    //     if (
    //       !isResolved &&
    //       (rr.status === 'requested' || rr.status === 'review_submitted')
    //     ) {
    //       pendingRefunds += Number(rr.finalRefundAmount) || 0;
    //       refundApprovals += 1; // NEW
    //     }
    //   }
    // }
    let pendingRefunds = 0;
    let refundApprovals = 0; // count of pending refund requests (approval queue)
    for (const order of filteredOrders) {
      for (const line of order.products || []) {
        const rr = line?.returnRequest;
        if (!rr) continue;
        const isResolved = Boolean(rr.refundApprovedAt || rr.refundRejectedAt);

        // Approval-queue pending count (unchanged business logic)
        if (
          !isResolved &&
          (rr.status === 'requested' || rr.status === 'review_submitted')
        ) {
          refundApprovals += 1;
        }

        // Pending Refunds amount: same definition as the Refund Tracking
        // table's "Pending Refunds" stat — refunds already decided
        // (approved or rejected) but not yet paid out.
        const isPaidOut = Boolean(rr.refundPaidAt);
        if (isResolved && !isPaidOut) {
          if (rr.refundRejectedAt) {
            // Rejected refunds display the full deposit as the payable
            // amount (same override Refunds.js applies on the frontend).
            pendingRefunds += Number(line?.refundableDeposit) || 0;
          } else {
            pendingRefunds += Number(rr.finalRefundAmount) || 0;
          }
        }
      }
    }
    // Live Partners: vendors whose KYC was approved/created within the
    // selected period (Today/Week/Month/Quarter/Year), scoped to city
    // using the existing vendorToCity map — same city-matching logic as
    // before, just now also period-aware via kyc.createdAt.
    const livePartners = kycRows.filter((k) => {
      const inPeriod = !fromDate || new Date(k.createdAt) >= fromDate;
      if (!inPeriod) return false;
      if (!wantCity) return true;
      const kycCity = vendorToCity.get(String(k.vendorId));
      return String(kycCity || '').toLowerCase() === wantCity;
    }).length;

    // const kycPendingFilter = wantCity
    //   ? { status: 'pending' }
    //   : { status: 'pending' };
    // const vendorKycApprovals = await VendorKyc.countDocuments(kycPendingFilter);
    // const kycPendingFilter = { status: 'pending' };
    // if (wantCity && vendorIds) {
    //   kycPendingFilter.vendorId = { $in: vendorIds };
    // }
    // const vendorKycApprovals = await VendorKyc.countDocuments(kycPendingFilter);

    const kycPendingFilter = { status: 'pending' };
    if (wantCity) {
      const cityVendorIdsAll = [...vendorToCityAll.entries()]
        .filter(([, c]) => String(c).toLowerCase() === wantCity)
        .map(([vId]) => vId);
      kycPendingFilter.vendorId = { $in: cityVendorIdsAll };
    }
    const vendorKycApprovals = await VendorKyc.countDocuments(kycPendingFilter);

    // Pending Product Approvals (vendor-submitted products/services awaiting
    // admin review) — same submissionStatus used by the Product Approval
    // queue page, filtered to this city's vendors via vendorToCityAll.
    const productApprovalFilter = { submissionStatus: 'pending_approval' };
    if (wantCity) {
      const cityVendorIdsForProducts = [...vendorToCityAll.entries()]
        .filter(([, c]) => String(c).toLowerCase() === wantCity)
        .map(([vId]) => vId);
      productApprovalFilter.vendorId = { $in: cityVendorIdsForProducts };
    }
    const [pendingProductCount, pendingServiceCount] = await Promise.all([
      Product.countDocuments(productApprovalFilter),
      ServiceProduct.countDocuments(productApprovalFilter),
    ]);
    const productApprovals = pendingProductCount + pendingServiceCount;

    // // Tickets: count issueReports on the same filteredOrders set
    // let tickets = 0;
    // Sold Products: total quantity sold across order line items
    // (same city + period filtered set as the rest of this dashboard)
    // let soldProducts = 0;
    // for (const order of filteredOrders) {
    //   for (const line of order.products || []) {
    //     soldProducts += Number(line.quantity) || 0;
    //   }
    // }
    let soldProducts = 0;
    for (const order of filteredOrders) {
      for (const line of order.products || []) {
        soldProducts += Number(line.quantity) || 0;
      }
    }

    // "Sold Products" / "Sold Customers" — client-facing concept: only
    // orders that were actually PAID for (paymentId present) and not
    // cancelled. Kept as a separate set from filteredOrders so existing
    // revenue/commission/GST/ticket calculations remain untouched.
    const paidOrdersForSold = filteredOrders.filter(
      (o) =>
        Boolean(o.paymentId) &&
        String(o.status || '').toLowerCase() !== 'cancelled',
    );
    let soldProductsCount = 0;
    for (const order of paidOrdersForSold) {
      for (const line of order.products || []) {
        soldProductsCount += Number(line.quantity) || 0;
      }
    }
    const soldCustomers = new Set(paidOrdersForSold.map((o) => String(o.user)))
      .size;

    // Tickets: count issueReports on the same filteredOrders set
    let tickets = 0;
    for (const order of filteredOrders) {
      for (const line of order.products || []) {
        tickets += (line.issueReports || []).length;
      }
    }

    // Commission: platform fee on gross revenue (same rate as settlements)
    // const commission = Math.round(grossRevenue * PLATFORM_FEE_RATE);

    // // Pending settlements: sum netPayout for this city's vendors + period
    // const settlementMatch = { status: 'Pending' };
    // if (fromDate) settlementMatch.createdAt = { $gte: fromDate };
    // if (vendorIds) settlementMatch.vendorId = { $in: vendorIds };
    // const pendingSettlementDocs = await Settlement.find(settlementMatch)
    //   .select('netPayout')
    //   .lean();
    // const pendingSettlements = pendingSettlementDocs.reduce(
    //   (sum, s) => sum + (Number(s.netPayout) || 0),
    //   0,
    // );

    // Commission: real platform fee, computed the same way as
    // FinancialPerformance's orderPlatformFee — stored platformFee first,
    // else per-line commission using the product's Category.commissionRate,
    // else flat 10% fallback. Sourced from filteredOrders (same city+period
    // filter already applied above) instead of Settlement records, so this
    // matches the Financial Performance page regardless of settlement lag.
    const categoryDocs = await Category.find({})
      .select('name slug commissionRate')
      .lean();
    const commissionRateByCategoryKey = new Map();
    for (const c of categoryDocs) {
      const rate = Number(c.commissionRate || 0);
      if (c.slug)
        commissionRateByCategoryKey.set(String(c.slug).toLowerCase(), rate);
      if (c.name)
        commissionRateByCategoryKey.set(
          String(c.name).trim().toLowerCase(),
          rate,
        );
    }
    const FLAT_COMMISSION_RATE = 0.1;
    const commission = filteredOrders.reduce((sum, o) => {
      if (String(o.status || '').toLowerCase() === 'cancelled') return sum;
      const stored = Number(o.platformFee || 0);
      if (stored > 0) return sum + stored;
      const orderFee = (o.products || []).reduce((lineSum, line) => {
        const lineValue =
          Number(line?.pricePerDay || 0) * Number(line?.quantity || 0);
        const catRaw = line?.product?.category || line?.category || '';
        const catKey = String(catRaw).trim().toLowerCase();
        const catRate = commissionRateByCategoryKey.get(catKey);
        const rate_pct =
          catRate !== undefined && catRate > 0
            ? catRate / 100
            : FLAT_COMMISSION_RATE;
        return lineSum + lineValue * rate_pct;
      }, 0);
      return sum + orderFee;
    }, 0);

    // // Pending settlements: sum netPayout for this city's vendors + period
    // const settlementMatch = { status: 'Pending' };
    // if (fromDate) settlementMatch.createdAt = { $gte: fromDate };
    // if (vendorIds) settlementMatch.vendorId = { $in: vendorIds };
    // const pendingSettlementDocs = await Settlement.find(settlementMatch)
    //   .select('netPayout')
    //   .lean();
    // const pendingSettlements = pendingSettlementDocs.reduce(
    //   (sum, s) => sum + (Number(s.netPayout) || 0),
    //   0,
    // );

    const settlementMatch = { status: 'Pending' };
    if (fromDate) settlementMatch.createdAt = { $gte: fromDate };
    if (vendorIds) settlementMatch.vendorId = { $in: vendorIds };
    const pendingSettlementDocs = await Settlement.find(settlementMatch)
      .select('netPayout depositAmount')
      .lean();
    const pendingSettlements = pendingSettlementDocs.reduce(
      (sum, s) =>
        sum + (Number(s.netPayout) || 0) + (Number(s.depositAmount) || 0),
      0,
    );

    // Customer KYC approvals pending (not city-scoped — customers aren't tied to a store city)
    // console.log('UserKyc statuses in DB:', await UserKyc.distinct('status'));
    // const customerKycApprovals = await UserKyc.countDocuments({
    //   status: 'pending',
    // });
    const customerKycApprovals = await UserKyc.countDocuments({
      status: { $in: ['pending', 'in_review'] },
    });

    return res.json({
      city: city || 'all',
      period: period || 'month',
      // activeProducts: activeProducts.length,
      // totalProducts: products.length,
      // activeProducts: activeProducts.length,
      // soldProducts,
      // totalProducts: products.length,
      // uniqueCustomers,
      activeProducts: activeProducts.length,
      soldProducts: soldProductsCount,
      totalProducts: products.length,
      uniqueCustomers,
      soldCustomers,
      livePartners,
      grossRevenue,
      gstTax,
      careTax,
      pendingRefunds,
      vendorKycApprovals,
      refundApprovals,
      tickets,
      commission,
      pendingSettlements,
      customerKycApprovals,
      lateFees,
      productApprovals,
      // Not yet backed by a model — share where this lives and I'll wire it
      adApprovals: 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getVendorsPublicCount = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    res.json({ totalVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerSettlementPayoutNow = async (req, res) => {
  try {
    const results = await runSettlementPayoutBatch();
    res.json({ message: 'Payout batch run complete', results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const triggerRefundPayoutNow = async (req, res) => {
  try {
    const results = await runRefundPayoutBatch();
    res.json({ message: 'Refund payout batch run complete', results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const triggerCancelRefundPayoutNow = async (req, res) => {
  try {
    const results = await runCancelRefundPayoutBatch();
    res.json({ message: 'Cancel refund payout batch run complete', results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const getAdminInvoices = async (req, res) => {
//   try {
//     const { month, type, status, search } = req.query;

//     const orderFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       orderFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }
//     // const orders = await Order.find(orderFilter)
//     //   .populate('user', 'fullName')
//     //   .populate('products.product', 'productName vendorId images')
//     //   // .populate({
//     //   //   path: 'products.product',
//     //   //   populate: { path: 'vendorId', select: 'fullName' },
//     //   // })
//     //   .populate({
//     //     path: 'products.product',
//     //     populate: { path: 'vendorId', select: 'fullName mobileNumber' },
//     //   })
//     //   .sort({ createdAt: -1 })
//     //   .lean();

//     const orders = await Order.find(orderFilter)
//       .populate('user', 'fullName')
//       .populate('products.product', 'productName vendorId images category')
//       // .populate({
//       //   path: 'products.product',
//       //   populate: { path: 'vendorId', select: 'fullName' },
//       // })
//       .populate({
//         path: 'products.product',
//         populate: { path: 'vendorId', select: 'fullName mobileNumber' },
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     // Category commission-rate map — same lookup used by getCityDashboard's
//     // `commission` calc, so the two figures always agree.
//     const categoryDocsForCommission = await Category.find({})
//       .select('name slug commissionRate')
//       .lean();
//     const commissionRateByCategoryKey = new Map();
//     for (const c of categoryDocsForCommission) {
//       const rate = Number(c.commissionRate || 0);
//       if (c.slug)
//         commissionRateByCategoryKey.set(String(c.slug).toLowerCase(), rate);
//       if (c.name)
//         commissionRateByCategoryKey.set(
//           String(c.name).trim().toLowerCase(),
//           rate,
//         );
//     }
//     const FLAT_COMMISSION_RATE = 0.1;

//     // Fetch settlements for these orders so each invoice line can show its
//     // real, already-frozen category commission (same source of truth used
//     // by the vendor dashboard) — never recomputed here.
//     const orderIdsForSettlement = orders.map((o) => o._id);
//     const settlementsForInvoices = await Settlement.find({
//       orderId: { $in: orderIdsForSettlement },
//     }).lean();
//     const settlementByLineId = new Map(
//       settlementsForInvoices.map((s) => [String(s.lineId), s]),
//     );

//     // Service bookings use the same month filter, but on their own
//     // createdAt (booking creation date, not bookingDate — matches how
//     // Order invoices use order.createdAt as the invoice date).
//     const bookingFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       bookingFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }

//     const bookings = await ServiceBooking.find(bookingFilter)
//       .populate('user', 'fullName')
//       .populate('serviceProduct', 'productName image')
//       .sort({ createdAt: -1 })
//       .lean();

//     const invoices = [];
//     // let pendingAmount = 0,
//     //   paidAmount = 0,
//     //   commissions = 0,
//     //   gst = 0,
//     //   careTax = 0,
//     //   lateFees = 0;
//     let pendingAmount = 0,
//       paidAmount = 0,
//       commissions = 0,
//       gst = 0,
//       careTax = 0,
//       lateFees = 0,
//       repairWarranty = 0,
//       relocationWarranty = 0,
//       deliveryPackaging = 0,
//       installationFee = 0,
//       platformFee = 0;

//     // Late fees are collected and stored on the order itself (see
//     // payNextMonth), independent of month/type/status filters below —
//     // sum them across ALL orders so the summary card reflects the true
//     // platform-wide total regardless of what the table is currently filtered to.
//     lateFees = orders.reduce(
//       (sum, o) => sum + Number(o.lateFeesCollected || 0),
//       0,
//     );

//     // Commission — same formula as getCityDashboard/FinancialPerformance:
//     // stored order.platformFee first, else per-line category commissionRate,
//     // else flat 10% fallback. Cancelled orders excluded, matching both.
//     commissions = orders.reduce((sum, o) => {
//       if (String(o.status || '').toLowerCase() === 'cancelled') return sum;
//       const stored = Number(o.platformFee || 0);
//       if (stored > 0) return sum + stored;
//       const orderFee = (o.products || []).reduce((lineSum, line) => {
//         const lineValue =
//           Number(line?.pricePerDay || 0) * Number(line?.quantity || 0);
//         const catRaw = line?.product?.category || line?.category || '';
//         const catKey = String(catRaw).trim().toLowerCase();
//         const catRate = commissionRateByCategoryKey.get(catKey);
//         const rate_pct =
//           catRate !== undefined && catRate > 0
//             ? catRate / 100
//             : FLAT_COMMISSION_RATE;
//         return lineSum + lineValue * rate_pct;
//       }, 0);
//       return sum + orderFee;
//     }, 0);

//     orders.forEach((o) => {
//       // const orderGst = Number(o.gst || 0);
//       // const orderCareTax = Number(o.careProtection || 0);
//       const orderGst = Number(o.gst || 0);
//       const orderCareTax = Number(o.careProtection || 0);
//       const orderRepairWarranty = Number(o.repairWarranty || 0);
//       const orderRelocationWarranty = Number(o.relocationWarranty || 0);
//       const orderDeliveryPackaging = Number(o.deliveryPackaging || 0);
//       const orderInstallationFee = Number(o.installationFee || 0);
//       const orderPlatformFee = Number(o.platformFee || 0);
//       const isPaid = ['delivered', 'confirmed'].includes(
//         String(o.status || '').toLowerCase(),
//       );
//       const shortId = String(o._id).slice(-6).toUpperCase();
//       const orderRef = `ORD-${shortId}`;

//       // Rent Receipt — customer side.
//       // Each product line in the order gets its own invoice(s): Rental lines
//       // that span multiple months generate one invoice per month (month 1
//       // follows the order's current status, later months are Pending);
//       // Sell (one-time purchase) lines always generate a single invoice.
//       (o.products || []).forEach((productEntry, productIdx) => {
//         const lineProductType = productEntry.productType || 'Rental';
//         const isRentalLine = String(lineProductType).toLowerCase() === 'rental';
//         const isMonthlyRental =
//           isRentalLine &&
//           String(o.tenureUnit || '').toLowerCase() === 'month' &&
//           Number(o.rentalDuration || 1) > 1;
//         const totalMonths = isMonthlyRental ? Number(o.rentalDuration) : 1;

//         // const productName =
//         //   productEntry.product?.productName || 'Unknown Product';
//         // const variantName = productEntry.variantName || '';
//         // const productImage = (productEntry.product?.images || [])[0] || '';
//         const productName =
//           productEntry.product?.productName || 'Unknown Product';
//         const variantName = productEntry.variantName || '';
//         const productImage = (productEntry.product?.images || [])[0] || '';
//         const vendorName =
//           productEntry.product?.vendorId?.fullName || 'Unknown Vendor';
//         const vendorPhone = productEntry.product?.vendorId?.mobileNumber || '';
//         console.log('vendorId populated as:', productEntry.product?.vendorId);

//         // const lineTotal =
//         //   Number(productEntry.pricePerDay || 0) *
//         //   Number(productEntry.quantity || 1);
//         // const lineAmount = isMonthlyRental
//         //   ? lineTotal / totalMonths
//         //   : lineTotal;
//         const lineTotal =
//           Number(productEntry.pricePerDay || 0) *
//           Number(productEntry.quantity || 1);
//         // pricePerDay already represents the per-month rent for monthly
//         // rentals, so each month's invoice uses it directly (no dividing
//         // by totalMonths).
//         const lineAmount = lineTotal;

//         for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
//           const dueDate = new Date(o.createdAt);
//           dueDate.setMonth(dueDate.getMonth() + monthIdx);

//           const monthInvoiceNo =
//             monthIdx === 0
//               ? `INV-${shortId}${productIdx > 0 ? `-P${productIdx + 1}` : ''}`
//               : `INV-${shortId}${
//                   productIdx > 0 ? `-P${productIdx + 1}` : ''
//                 }-M${monthIdx + 1}`;

//           // const monthsPaidSoFar = Number(o.monthsPaid ?? 1);
//           // const monthStatus = isMonthlyRental
//           //   ? monthIdx < monthsPaidSoFar
//           //     ? 'Paid'
//           //     : 'Pending'
//           //   : isPaid
//           //     ? 'Paid'
//           //     : 'Pending';

//           // // Look up the actual late fee charged for this specific month, if
//           // // any, from the order's stored payment history (never recomputed —
//           // // this is the exact amount that was collected).
//           // const paymentRecord = (o.monthlyPayments || []).find(
//           //   (p) => Number(p.month) === monthIdx + 1,
//           // );

//           // Per-line tracking (new) — falls back to order-level fields for
//           // pre-existing orders saved before per-line tracking existed.
//           const monthsPaidSoFar = Number(
//             productEntry.monthsPaid ?? o.monthsPaid ?? 1,
//           );
//           const monthStatus = isMonthlyRental
//             ? monthIdx < monthsPaidSoFar
//               ? 'Paid'
//               : 'Pending'
//             : isPaid
//               ? 'Paid'
//               : 'Pending';

//           // Look up the actual late fee charged for this specific month, if
//           // any, from this line's own stored payment history (never
//           // recomputed — this is the exact amount that was collected).
//           const paymentRecord = (
//             productEntry.monthlyPayments ||
//             o.monthlyPayments ||
//             []
//           ).find((p) => Number(p.month) === monthIdx + 1);
//           const lateFeeAmount = Number(paymentRecord?.lateFeeAmount || 0);
//           const daysLate = Number(paymentRecord?.daysLate || 0);

//           // Real, frozen category commission for this exact line — pulled
//           // from the Settlement record (same one the vendor dashboard
//           // reads), only shown on the first month's invoice since only
//           // month 1 is paid/settled at checkout.
//           const lineSettlement =
//             monthIdx === 0
//               ? settlementByLineId.get(String(productEntry._id))
//               : null;
//           const commissionRate = lineSettlement
//             ? Math.round(
//                 (Number(lineSettlement.platformFee || 0) /
//                   Number(lineSettlement.grossAmount || 1)) *
//                   100,
//               )
//             : null;
//           const commissionAmount = lineSettlement
//             ? Number(lineSettlement.platformFee || 0)
//             : null;
//           const netSettled = lineSettlement
//             ? Number(lineSettlement.netPayout || 0)
//             : null;

//           // invoices.push({
//           //   _id: `rent-${o._id}-${productIdx}-${monthIdx}`,
//           //   invoiceNo: monthInvoiceNo,
//           //   entityName: o.user?.fullName || o.name || 'Unknown Customer',
//           //   entityType: 'Customer',
//           //   entityPhone: o.phone || '',
//           //   productName,
//           invoices.push({
//             _id: `rent-${o._id}-${productIdx}-${monthIdx}`,
//             invoiceNo: monthInvoiceNo,
//             entityName: o.user?.fullName || o.name || 'Unknown Customer',
//             entityType: 'Customer',
//             entityPhone: o.phone || '',
//             vendorName,
//             vendorPhone,
//             productName,
//             variantName,
//             productImage,
//             productType: lineProductType,
//             tenure: isMonthlyRental
//               ? `${totalMonths} month${totalMonths > 1 ? 's' : ''}`
//               : '',
//             type: 'Rent Receipt',
//             orderRef,
//             amount: lineAmount,
//             lateFeeAmount,
//             daysLate,
//             gst: orderGst,
//             careTax: orderCareTax,
//             repairWarranty: orderRepairWarranty,
//             relocationWarranty: orderRelocationWarranty,
//             deliveryPackaging: orderDeliveryPackaging,
//             installationFee: orderInstallationFee,
//             platformFee: orderPlatformFee,
//             commissionRate,
//             commissionAmount,
//             netSettled,
//             date: dueDate,
//             status: monthStatus,
//             note: isMonthlyRental
//               ? `Month ${monthIdx + 1} of ${totalMonths}`
//               : null,
//           });
//         }
//       });

//       gst += orderGst;
//       careTax += orderCareTax;
//       repairWarranty += orderRepairWarranty;
//       relocationWarranty += orderRelocationWarranty;
//       deliveryPackaging += orderDeliveryPackaging;
//       installationFee += orderInstallationFee;
//       platformFee += orderPlatformFee;

//       const orderLineTotal = (o.products || []).reduce(
//         (sum, p) => sum + Number(p.pricePerDay || 0) * Number(p.quantity || 1),
//         0,
//       );
//       if (isPaid) {
//         paidAmount += orderLineTotal;
//       } else {
//         pendingAmount += orderLineTotal;
//       }
//     });
//     // gst and careTax already summed above per order

//     // Service Invoice — one row per booking, no monthly split (services are
//     // one-time bookings, not recurring like rentals).
//     bookings.forEach((b) => {
//       const isPaid = b.paymentStatus === 'paid';
//       const shortId = String(b._id).slice(-6).toUpperCase();

//       invoices.push({
//         _id: `svc-${b._id}`,
//         invoiceNo: `INV-SVC-${shortId}`,
//         entityName: b.user?.fullName || b.name || 'Unknown Customer',
//         entityType: 'Customer',
//         entityPhone: b.phone || '',
//         productName:
//           b.serviceSnapshot?.productName ||
//           b.serviceProduct?.productName ||
//           'Service',
//         variantName: '',
//         productImage: b.serviceSnapshot?.image || b.serviceProduct?.image || '',
//         productType: 'Service',
//         tenure: '',
//         type: 'Service Invoice',
//         orderRef: `SRV-${shortId}`,
//         amount: Number(b.totalAmount || 0),
//         gst: Number(b.taxBreakdown?.gst || 0),
//         careTax: Number(b.taxBreakdown?.care_tax || 0),
//         date: b.createdAt,
//         status:
//           b.paymentMethod === 'pay_after_service'
//             ? isPaid
//               ? 'Paid'
//               : 'Pending'
//             : isPaid
//               ? 'Paid'
//               : 'Pending',
//         note: b.isUrgent ? 'Urgent booking' : null,
//         lateFeeAmount: 0,
//         daysLate: 0,
//       });

//       if (isPaid) {
//         paidAmount += Number(b.totalAmount || 0);
//       } else {
//         pendingAmount += Number(b.totalAmount || 0);
//       }
//       gst += Number(b.taxBreakdown?.gst || 0);
//       careTax += Number(b.taxBreakdown?.care_tax || 0);
//     });

//     let result = invoices;
//     if (type) result = result.filter((r) => r.productType === type);
//     if (status) result = result.filter((r) => r.status === status);
//     if (search) {
//       const q = search.toLowerCase();
//       result = result.filter(
//         (r) =>
//           r.invoiceNo.toLowerCase().includes(q) ||
//           r.entityName.toLowerCase().includes(q) ||
//           r.orderRef.toLowerCase().includes(q) ||
//           String(r.entityPhone || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(r.productName || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(r.amount || '').includes(q),
//       );
//     }

//     // return res.json({
//     //   invoices: result,
//     //   summary: {
//     //     pendingAmount,
//     //     paidAmount,
//     //     commissions,
//     //     gst,
//     //     careTax,
//     //     lateFees,
//     //   },
//     // });
//     return res.json({
//       invoices: result,
//       summary: {
//         pendingAmount,
//         paidAmount,
//         commissions,
//         gst,
//         careTax,
//         lateFees,
//         repairWarranty,
//         relocationWarranty,
//         deliveryPackaging,
//         installationFee,
//         platformFee,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
const LATE_FEE_PER_DAY = 10;

// export const getAdminInvoices = async (req, res) => {
//   try {
//     const { month, type, status, search } = req.query;
//     const globalInvoiceNumberMap = await buildGlobalInvoiceNumberMap();

//     const orderFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       orderFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }
//     // const orders = await Order.find(orderFilter)
//     //   .populate('user', 'fullName')
//     //   .populate('products.product', 'productName vendorId images')
//     //   // .populate({
//     //   //   path: 'products.product',
//     //   //   populate: { path: 'vendorId', select: 'fullName' },
//     //   // })
//     //   .populate({
//     //     path: 'products.product',
//     //     populate: { path: 'vendorId', select: 'fullName mobileNumber' },
//     //   })
//     //   .sort({ createdAt: -1 })
//     //   .lean();

//     // const orders = await Order.find(orderFilter)
//     //   .populate('user', 'fullName')
//     //   .populate('products.product', 'productName vendorId images category')
//     const orders = await Order.find(orderFilter)
//       .populate('user', 'fullName mobileNumber')
//       .populate('products.product', 'productName vendorId images category')
//       // .populate({
//       //   path: 'products.product',
//       //   populate: { path: 'vendorId', select: 'fullName' },
//       // })
//       .populate({
//         path: 'products.product',
//         populate: { path: 'vendorId', select: 'fullName mobileNumber' },
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     // Category commission-rate map — same lookup used by getCityDashboard's
//     // `commission` calc, so the two figures always agree.
//     const categoryDocsForCommission = await Category.find({})
//       .select('name slug commissionRate')
//       .lean();
//     const commissionRateByCategoryKey = new Map();
//     for (const c of categoryDocsForCommission) {
//       const rate = Number(c.commissionRate || 0);
//       if (c.slug)
//         commissionRateByCategoryKey.set(String(c.slug).toLowerCase(), rate);
//       if (c.name)
//         commissionRateByCategoryKey.set(
//           String(c.name).trim().toLowerCase(),
//           rate,
//         );
//     }
//     const FLAT_COMMISSION_RATE = 0.1;

//     // Fetch settlements for these orders so each invoice line can show its
//     // real, already-frozen category commission (same source of truth used
//     // by the vendor dashboard) — never recomputed here.
//     const orderIdsForSettlement = orders.map((o) => o._id);
//     const settlementsForInvoices = await Settlement.find({
//       orderId: { $in: orderIdsForSettlement },
//     }).lean();
//     const settlementByLineId = new Map(
//       settlementsForInvoices.map((s) => [String(s.lineId), s]),
//     );

//     // Service bookings use the same month filter, but on their own
//     // createdAt (booking creation date, not bookingDate — matches how
//     // Order invoices use order.createdAt as the invoice date).
//     const bookingFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       bookingFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }

//     // const bookings = await ServiceBooking.find(bookingFilter)
//     //   .populate('user', 'fullName')
//     //   .populate('serviceProduct', 'productName image')
//     const bookings = await ServiceBooking.find(bookingFilter)
//       .populate('user', 'fullName mobileNumber')
//       .populate('serviceProduct', 'productName image')
//       .sort({ createdAt: -1 })
//       .lean();

//     const invoices = [];
//     // let pendingAmount = 0,
//     //   paidAmount = 0,
//     //   commissions = 0,
//     //   gst = 0,
//     //   careTax = 0,
//     //   lateFees = 0;
//     let pendingAmount = 0,
//       paidAmount = 0,
//       commissions = 0,
//       gst = 0,
//       careTax = 0,
//       lateFees = 0,
//       repairWarranty = 0,
//       relocationWarranty = 0,
//       deliveryPackaging = 0,
//       installationFee = 0,
//       platformFee = 0;

//     // Late fees are collected and stored on the order itself (see
//     // payNextMonth), independent of month/type/status filters below —
//     // sum them across ALL orders so the summary card reflects the true
//     // platform-wide total regardless of what the table is currently filtered to.
//     lateFees = orders.reduce(
//       (sum, o) => sum + Number(o.lateFeesCollected || 0),
//       0,
//     );

//     // Commission — same formula as getCityDashboard/FinancialPerformance:
//     // stored order.platformFee first, else per-line category commissionRate,
//     // else flat 10% fallback. Cancelled orders excluded, matching both.
//     commissions = orders.reduce((sum, o) => {
//       if (String(o.status || '').toLowerCase() === 'cancelled') return sum;
//       const stored = Number(o.platformFee || 0);
//       if (stored > 0) return sum + stored;
//       const orderFee = (o.products || []).reduce((lineSum, line) => {
//         const lineValue =
//           Number(line?.pricePerDay || 0) * Number(line?.quantity || 0);
//         const catRaw = line?.product?.category || line?.category || '';
//         const catKey = String(catRaw).trim().toLowerCase();
//         const catRate = commissionRateByCategoryKey.get(catKey);
//         const rate_pct =
//           catRate !== undefined && catRate > 0
//             ? catRate / 100
//             : FLAT_COMMISSION_RATE;
//         return lineSum + lineValue * rate_pct;
//       }, 0);
//       return sum + orderFee;
//     }, 0);

//     orders.forEach((o) => {
//       // const orderGst = Number(o.gst || 0);
//       // const orderCareTax = Number(o.careProtection || 0);
//       const orderGst = Number(o.gst || 0);
//       const orderCareTax = Number(o.careProtection || 0);
//       const orderRepairWarranty = Number(o.repairWarranty || 0);
//       const orderRelocationWarranty = Number(o.relocationWarranty || 0);
//       const orderDeliveryPackaging = Number(o.deliveryPackaging || 0);
//       const orderInstallationFee = Number(o.installationFee || 0);
//       const orderPlatformFee = Number(o.platformFee || 0);
//       const isPaid = ['delivered', 'confirmed'].includes(
//         String(o.status || '').toLowerCase(),
//       );
//       // const shortId = String(o._id).slice(-6).toUpperCase();
//       // const orderRef = `ORD-${shortId}`;
//       const shortId = String(o._id).slice(-6).toUpperCase();
//       // Same ORD-0001 format used across Admin/Vendor/User Orders tables,
//       // built from the order's real sequential orderNumber (not a random
//       // _id fragment), so invoice/commission rows always match exactly.
//       const orderRef = `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`;

//       // Rent Receipt — customer side.
//       // Each product line in the order gets its own invoice(s): Rental lines
//       // that span multiple months generate one invoice per month (month 1
//       // follows the order's current status, later months are Pending);
//       // Sell (one-time purchase) lines always generate a single invoice.
//       (o.products || []).forEach((productEntry, productIdx) => {
//         const lineProductType = productEntry.productType || 'Rental';
//         const isRentalLine = String(lineProductType).toLowerCase() === 'rental';
//         const isMonthlyRental =
//           isRentalLine &&
//           String(o.tenureUnit || '').toLowerCase() === 'month' &&
//           Number(o.rentalDuration || 1) > 1;
//         const totalMonths = isMonthlyRental ? Number(o.rentalDuration) : 1;

//         // const productName =
//         //   productEntry.product?.productName || 'Unknown Product';
//         // const variantName = productEntry.variantName || '';
//         // const productImage = (productEntry.product?.images || [])[0] || '';
//         const productName =
//           productEntry.product?.productName || 'Unknown Product';
//         const variantName = productEntry.variantName || '';
//         const productImage = (productEntry.product?.images || [])[0] || '';
//         const vendorName =
//           productEntry.product?.vendorId?.fullName || 'Unknown Vendor';
//         const vendorPhone = productEntry.product?.vendorId?.mobileNumber || '';
//         console.log('vendorId populated as:', productEntry.product?.vendorId);

//         // const lineTotal =
//         //   Number(productEntry.pricePerDay || 0) *
//         //   Number(productEntry.quantity || 1);
//         // const lineAmount = isMonthlyRental
//         //   ? lineTotal / totalMonths
//         //   : lineTotal;
//         const lineTotal =
//           Number(productEntry.pricePerDay || 0) *
//           Number(productEntry.quantity || 1);
//         // pricePerDay already represents the per-month rent for monthly
//         // rentals, so each month's invoice uses it directly (no dividing
//         // by totalMonths).
//         const lineAmount = lineTotal;

//         for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
//           const dueDate = new Date(o.createdAt);
//           dueDate.setMonth(dueDate.getMonth() + monthIdx);

//           const monthInvoiceNo =
//             monthIdx === 0
//               ? `INV-${shortId}${productIdx > 0 ? `-P${productIdx + 1}` : ''}`
//               : `INV-${shortId}${
//                   productIdx > 0 ? `-P${productIdx + 1}` : ''
//                 }-M${monthIdx + 1}`;

//           // const monthsPaidSoFar = Number(o.monthsPaid ?? 1);
//           // const monthStatus = isMonthlyRental
//           //   ? monthIdx < monthsPaidSoFar
//           //     ? 'Paid'
//           //     : 'Pending'
//           //   : isPaid
//           //     ? 'Paid'
//           //     : 'Pending';

//           // // Look up the actual late fee charged for this specific month, if
//           // // any, from the order's stored payment history (never recomputed —
//           // // this is the exact amount that was collected).
//           // const paymentRecord = (o.monthlyPayments || []).find(
//           //   (p) => Number(p.month) === monthIdx + 1,
//           // );

//           // // Per-line tracking (new) — falls back to order-level fields for
//           // // pre-existing orders saved before per-line tracking existed.
//           // const monthsPaidSoFar = Number(
//           //   productEntry.monthsPaid ?? o.monthsPaid ?? 1,
//           // );
//           // const monthStatus = isMonthlyRental
//           //   ? monthIdx < monthsPaidSoFar
//           //     ? 'Paid'
//           //     : 'Pending'
//           //   : isPaid
//           //     ? 'Paid'
//           //     : 'Pending';

//           // // Look up the actual late fee charged for this specific month, if
//           // // any, from this line's own stored payment history (never
//           // // recomputed — this is the exact amount that was collected).
//           // const paymentRecord = (
//           //   productEntry.monthlyPayments ||
//           //   o.monthlyPayments ||
//           //   []
//           // ).find((p) => Number(p.month) === monthIdx + 1);
//           // const lateFeeAmount = Number(paymentRecord?.lateFeeAmount || 0);
//           // const daysLate = Number(paymentRecord?.daysLate || 0);

//           // Per-line tracking (new) — falls back to order-level fields for
//           // pre-existing orders saved before per-line tracking existed.
//           const monthsPaidSoFar = Number(
//             productEntry.monthsPaid ?? o.monthsPaid ?? 1,
//           );
//           const monthStatus = isMonthlyRental
//             ? monthIdx < monthsPaidSoFar
//               ? 'Paid'
//               : 'Pending'
//             : isPaid
//               ? 'Paid'
//               : 'Pending';

//           // Look up the actual late fee charged for this specific month, if
//           // any, from this line's own stored payment history (never
//           // recomputed — this is the exact amount that was collected).
//           const paymentRecord = (
//             productEntry.monthlyPayments ||
//             o.monthlyPayments ||
//             []
//           ).find((p) => Number(p.month) === monthIdx + 1);

//           // For an already-PAID month, keep using the stored/collected
//           // figures exactly as before (never recomputed). For a PENDING
//           // month with no payment record yet, compute daysLate/lateFeeAmount
//           // LIVE from this same `dueDate` — same formula the user-side
//           // "Pay Now" flow already uses (computeNextMonthDue) — so the
//           // admin table stops showing a stale ₹0 for months that are
//           // actually overdue right now.
//           let lateFeeAmount = Number(paymentRecord?.lateFeeAmount || 0);
//           let daysLate = Number(paymentRecord?.daysLate || 0);
//           if (!paymentRecord && monthStatus === 'Pending') {
//             const dueDateOnly = new Date(dueDate);
//             dueDateOnly.setHours(0, 0, 0, 0);
//             const todayOnly = new Date();
//             todayOnly.setHours(0, 0, 0, 0);
//             daysLate = Math.max(
//               0,
//               Math.round((todayOnly - dueDateOnly) / (1000 * 60 * 60 * 24)),
//             );
//             const waivedForThisMonth = (
//               productEntry.pendingLateFeeWaivers || []
//             )
//               .filter((w) => Number(w.month) === monthIdx + 1)
//               .reduce((sum, w) => sum + Number(w.waiverAmount || 0), 0);
//             lateFeeAmount = Math.max(
//               0,
//               daysLate * LATE_FEE_PER_DAY - waivedForThisMonth,
//             );
//           }

//           // // Real, frozen category commission for this exact line — pulled
//           // // from the Settlement record (same one the vendor dashboard
//           // // reads), only shown on the first month's invoice since only
//           // // month 1 is paid/settled at checkout.
//           // const lineSettlement =
//           //   monthIdx === 0
//           //     ? settlementByLineId.get(String(productEntry._id))
//           //     : null;
//           // const commissionRate = lineSettlement
//           //   ? Math.round(
//           //       (Number(lineSettlement.platformFee || 0) /
//           //         Number(lineSettlement.grossAmount || 1)) *
//           //         100,
//           //     )
//           //   : null;
//           // const commissionAmount = lineSettlement
//           //   ? Number(lineSettlement.platformFee || 0)
//           //   : null;
//           // const netSettled = lineSettlement
//           //   ? Number(lineSettlement.netPayout || 0)
//           //   : null;

//           // Real, frozen category commission for this exact line — pulled
//           // from the Settlement record (same one the vendor dashboard
//           // reads), only available on the first month's invoice since only
//           // month 1 is paid/settled at checkout.
//           const lineSettlement =
//             monthIdx === 0
//               ? settlementByLineId.get(String(productEntry._id))
//               : null;

//           // Fallback commission — same formula as the summary `commissions`
//           // total above (category commissionRate, else flat 10%) — used
//           // whenever a line hasn't been settled yet, so every invoice shows
//           // a commission by default instead of waiting for settlement.
//           const catRawForCommission =
//             productEntry?.product?.category || productEntry?.category || '';
//           const catKeyForCommission = String(catRawForCommission)
//             .trim()
//             .toLowerCase();
//           const catRateForCommission =
//             commissionRateByCategoryKey.get(catKeyForCommission);
//           const fallbackRatePct =
//             catRateForCommission !== undefined && catRateForCommission > 0
//               ? catRateForCommission / 100
//               : FLAT_COMMISSION_RATE;
//           const fallbackCommissionAmount = lineAmount * fallbackRatePct;
//           const fallbackCommissionRate = Math.round(fallbackRatePct * 100);

//           const commissionRate = lineSettlement
//             ? Math.round(
//                 (Number(lineSettlement.platformFee || 0) /
//                   Number(lineSettlement.grossAmount || 1)) *
//                   100,
//               )
//             : fallbackCommissionRate;
//           const commissionAmount = lineSettlement
//             ? Number(lineSettlement.platformFee || 0)
//             : fallbackCommissionAmount;
//           const netSettled = lineSettlement
//             ? Number(lineSettlement.netPayout || 0)
//             : null;

//           // invoices.push({
//           //   _id: `rent-${o._id}-${productIdx}-${monthIdx}`,
//           //   invoiceNo: monthInvoiceNo,
//           //   entityName: o.user?.fullName || o.name || 'Unknown Customer',
//           //   entityType: 'Customer',
//           //   entityPhone: o.phone || '',
//           //   productName,
//           invoices.push({
//             _id: `rent-${o._id}-${productIdx}-${monthIdx}`,
//             invoiceNo: monthInvoiceNo,
//             // entityName: o.user?.fullName || o.name || 'Unknown Customer',
//             // entityType: 'Customer',
//             // entityPhone: o.phone || '',
//             entityName: o.user?.fullName || o.name || 'Unknown Customer',
//             entityType: 'Customer',
//             entityPhone: o.user?.mobileNumber || o.phone || '',
//             vendorName,
//             vendorPhone,
//             productName,
//             variantName,
//             productImage,
//             productType: lineProductType,
//             tenure: isMonthlyRental
//               ? `${totalMonths} month${totalMonths > 1 ? 's' : ''}`
//               : '',
//             type: 'Rent Receipt',
//             orderRef,
//             amount: lineAmount,
//             lateFeeAmount,
//             daysLate,
//             gst: orderGst,
//             careTax: orderCareTax,
//             repairWarranty: orderRepairWarranty,
//             relocationWarranty: orderRelocationWarranty,
//             deliveryPackaging: orderDeliveryPackaging,
//             installationFee: orderInstallationFee,
//             platformFee: orderPlatformFee,
//             commissionRate,
//             commissionAmount,
//             netSettled,
//             date: dueDate,
//             status: monthStatus,
//             note: isMonthlyRental
//               ? `Month ${monthIdx + 1} of ${totalMonths}`
//               : null,
//           });
//         }
//       });

//       gst += orderGst;
//       careTax += orderCareTax;
//       repairWarranty += orderRepairWarranty;
//       relocationWarranty += orderRelocationWarranty;
//       deliveryPackaging += orderDeliveryPackaging;
//       installationFee += orderInstallationFee;
//       platformFee += orderPlatformFee;

//       const orderLineTotal = (o.products || []).reduce(
//         (sum, p) => sum + Number(p.pricePerDay || 0) * Number(p.quantity || 1),
//         0,
//       );
//       if (isPaid) {
//         paidAmount += orderLineTotal;
//       } else {
//         pendingAmount += orderLineTotal;
//       }
//     });
//     // gst and careTax already summed above per order

//     // Service Invoice — one row per booking, no monthly split (services are
//     // one-time bookings, not recurring like rentals).
//     // bookings.forEach((b) => {
//     //   const isPaid = b.paymentStatus === 'paid';
//     //   const shortId = String(b._id).slice(-6).toUpperCase();

//     //   invoices.push({
//     //     _id: `svc-${b._id}`,
//     //     invoiceNo: `INV-SVC-${shortId}`,
//     //     entityName: b.user?.fullName || b.name || 'Unknown Customer',
//     //     entityType: 'Customer',
//     //     entityPhone: b.phone || '',
//     //     productName:
//     //       b.serviceSnapshot?.productName ||
//     //       b.serviceProduct?.productName ||
//     //       'Service',
//     //     variantName: '',
//     //     productImage: b.serviceSnapshot?.image || b.serviceProduct?.image || '',
//     //     productType: 'Service',
//     //     tenure: '',
//     //     type: 'Service Invoice',
//     //     orderRef: `SRV-${shortId}`,

//     bookings.forEach((b) => {
//       const isPaid = b.paymentStatus === 'paid';
//       const shortId = String(b._id).slice(-6).toUpperCase();

//       invoices.push({
//         _id: `svc-${b._id}`,
//         invoiceNo: `INV-SVC-${shortId}`,
//         // entityName: b.user?.fullName || b.name || 'Unknown Customer',
//         // entityType: 'Customer',
//         // entityPhone: b.phone || '',
//         entityName: b.user?.fullName || b.name || 'Unknown Customer',
//         entityType: 'Customer',
//         entityPhone: b.user?.mobileNumber || b.phone || '',
//         productName:
//           b.serviceSnapshot?.productName ||
//           b.serviceProduct?.productName ||
//           'Service',
//         variantName: '',
//         productImage: b.serviceSnapshot?.image || b.serviceProduct?.image || '',
//         productType: 'Service',
//         tenure: '',
//         type: 'Service Invoice',
//         // Same SRV-0001 format used across Admin/Vendor/User panels, built
//         // from the booking's real sequential bookingNumber (not a random
//         // _id fragment), so it always matches exactly.
//         orderRef: `SRV-${String(b.bookingNumber || 0).padStart(4, '0')}`,
//         amount: Number(b.totalAmount || 0),
//         gst: Number(b.taxBreakdown?.gst || 0),
//         careTax: Number(b.taxBreakdown?.care_tax || 0),
//         date: b.createdAt,
//         status:
//           b.paymentMethod === 'pay_after_service'
//             ? isPaid
//               ? 'Paid'
//               : 'Pending'
//             : isPaid
//               ? 'Paid'
//               : 'Pending',
//         note: b.isUrgent ? 'Urgent booking' : null,
//         lateFeeAmount: 0,
//         daysLate: 0,
//       });

//       if (isPaid) {
//         paidAmount += Number(b.totalAmount || 0);
//       } else {
//         pendingAmount += Number(b.totalAmount || 0);
//       }
//       gst += Number(b.taxBreakdown?.gst || 0);
//       careTax += Number(b.taxBreakdown?.care_tax || 0);
//     });

//     let result = invoices;
//     if (type) result = result.filter((r) => r.productType === type);
//     if (status) result = result.filter((r) => r.status === status);
//     // if (search) {
//     //   const q = search.toLowerCase();
//     //   result = result.filter(
//     //     (r) =>
//     //       r.invoiceNo.toLowerCase().includes(q) ||
//     //       r.entityName.toLowerCase().includes(q) ||
//     //       r.orderRef.toLowerCase().includes(q) ||
//     //       String(r.entityPhone || '')
//     //         .toLowerCase()
//     //         .includes(q) ||
//     //       String(r.productName || '')
//     //         .toLowerCase()
//     //         .includes(q) ||
//     //       String(r.amount || '').includes(q),
//     //   );
//     // }
//     if (search) {
//       const q = search.toLowerCase();
//       result = result.filter(
//         (r) =>
//           r.invoiceNo.toLowerCase().includes(q) ||
//           formatDisplayInvoiceNo(
//             `INV-${
//               r.invoiceNo
//                 .replace(/^INV-/, '')
//                 .replace(/-M\d+$/, '')
//                 .split('-P')[0]
//             }`,
//             globalInvoiceNumberMap,
//           )
//             .toLowerCase()
//             .includes(q) ||
//           r.entityName.toLowerCase().includes(q) ||
//           r.orderRef.toLowerCase().includes(q) ||
//           String(r.entityPhone || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(r.productName || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(r.amount || '').includes(q),
//       );
//     }

//     // return res.json({
//     //   invoices: result,
//     //   summary: {
//     //     pendingAmount,
//     //     paidAmount,
//     //     commissions,
//     //     gst,
//     //     careTax,
//     //     lateFees,
//     //   },
//     // });
//     result = result.map((r) => ({
//       ...r,
//       displayInvoiceNo: formatDisplayInvoiceNo(
//         `INV-${
//           r.invoiceNo
//             .replace(/^INV-/, '')
//             .replace(/-M\d+$/, '')
//             .split('-P')[0]
//         }`,
//         globalInvoiceNumberMap,
//       ),
//     }));

//     return res.json({
//       invoices: result,
//       summary: {
//         pendingAmount,
//         paidAmount,
//         commissions,
//         gst,
//         careTax,
//         lateFees,
//         repairWarranty,
//         relocationWarranty,
//         deliveryPackaging,
//         installationFee,
//         platformFee,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const getAdminInvoices = async (req, res) => {
//   try {
//     const { month, type, status, search } = req.query;
//     const globalInvoiceNumberMap = await buildGlobalInvoiceNumberMap();

//     const orderFilter = {};
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       orderFilter.createdAt = {
//         $gte: new Date(y, m - 1, 1),
//         $lt: new Date(y, m, 1),
//       };
//     }
export const getAdminInvoices = async (req, res) => {
  try {
    const { month, type, status, search } = req.query;
    const globalInvoiceNumberMap = await buildGlobalInvoiceNumberMap();
    const cityProductIds = await getCityProductIds(req);

    const orderFilter = {};
    if (month) {
      const [y, m] = month.split('-').map(Number);
      orderFilter.createdAt = {
        $gte: new Date(y, m - 1, 1),
        $lt: new Date(y, m, 1),
      };
    }
    if (cityProductIds) {
      orderFilter['products.product'] = { $in: cityProductIds };
    }
    // const orders = await Order.find(orderFilter)
    //   .populate('user', 'fullName')
    //   .populate('products.product', 'productName vendorId images')
    //   // .populate({
    //   //   path: 'products.product',
    //   //   populate: { path: 'vendorId', select: 'fullName' },
    //   // })
    //   .populate({
    //     path: 'products.product',
    //     populate: { path: 'vendorId', select: 'fullName mobileNumber' },
    //   })
    //   .sort({ createdAt: -1 })
    //   .lean();

    // const orders = await Order.find(orderFilter)
    //   .populate('user', 'fullName')
    //   .populate('products.product', 'productName vendorId images category')
    const orders = await Order.find(orderFilter)
      .populate('user', 'fullName mobileNumber')
      .populate('products.product', 'productName vendorId images category')
      // .populate({
      //   path: 'products.product',
      //   populate: { path: 'vendorId', select: 'fullName' },
      // })
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName mobileNumber' },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Category commission-rate map — same lookup used by getCityDashboard's
    // `commission` calc, so the two figures always agree.
    const categoryDocsForCommission = await Category.find({})
      .select('name slug commissionRate')
      .lean();
    const commissionRateByCategoryKey = new Map();
    for (const c of categoryDocsForCommission) {
      const rate = Number(c.commissionRate || 0);
      if (c.slug)
        commissionRateByCategoryKey.set(String(c.slug).toLowerCase(), rate);
      if (c.name)
        commissionRateByCategoryKey.set(
          String(c.name).trim().toLowerCase(),
          rate,
        );
    }
    const FLAT_COMMISSION_RATE = 0.1;

    // Fetch settlements for these orders so each invoice line can show its
    // real, already-frozen category commission (same source of truth used
    // by the vendor dashboard) — never recomputed here.
    const orderIdsForSettlement = orders.map((o) => o._id);
    const settlementsForInvoices = await Settlement.find({
      orderId: { $in: orderIdsForSettlement },
    }).lean();
    const settlementByLineId = new Map(
      settlementsForInvoices.map((s) => [String(s.lineId), s]),
    );

    // Service bookings use the same month filter, but on their own
    // createdAt (booking creation date, not bookingDate — matches how
    // Order invoices use order.createdAt as the invoice date).
    const bookingFilter = {};
    if (month) {
      const [y, m] = month.split('-').map(Number);
      bookingFilter.createdAt = {
        $gte: new Date(y, m - 1, 1),
        $lt: new Date(y, m, 1),
      };
    }

    // const bookings = await ServiceBooking.find(bookingFilter)
    //   .populate('user', 'fullName')
    //   .populate('serviceProduct', 'productName image')
    const bookings = await ServiceBooking.find(bookingFilter)
      .populate('user', 'fullName mobileNumber')
      .populate('serviceProduct', 'productName image')
      .sort({ createdAt: -1 })
      .lean();

    const invoices = [];
    // let pendingAmount = 0,
    //   paidAmount = 0,
    //   commissions = 0,
    //   gst = 0,
    //   careTax = 0,
    //   lateFees = 0;
    let pendingAmount = 0,
      paidAmount = 0,
      commissions = 0,
      gst = 0,
      careTax = 0,
      lateFees = 0,
      repairWarranty = 0,
      relocationWarranty = 0,
      deliveryPackaging = 0,
      installationFee = 0,
      platformFee = 0;

    // Late fees are collected and stored on the order itself (see
    // payNextMonth), independent of month/type/status filters below —
    // sum them across ALL orders so the summary card reflects the true
    // platform-wide total regardless of what the table is currently filtered to.
    lateFees = orders.reduce(
      (sum, o) => sum + Number(o.lateFeesCollected || 0),
      0,
    );

    // Commission — same formula as getCityDashboard/FinancialPerformance:
    // stored order.platformFee first, else per-line category commissionRate,
    // else flat 10% fallback. Cancelled orders excluded, matching both.
    commissions = orders.reduce((sum, o) => {
      if (String(o.status || '').toLowerCase() === 'cancelled') return sum;
      const stored = Number(o.platformFee || 0);
      if (stored > 0) return sum + stored;
      const orderFee = (o.products || []).reduce((lineSum, line) => {
        const lineValue =
          Number(line?.pricePerDay || 0) * Number(line?.quantity || 0);
        const catRaw = line?.product?.category || line?.category || '';
        const catKey = String(catRaw).trim().toLowerCase();
        const catRate = commissionRateByCategoryKey.get(catKey);
        const rate_pct =
          catRate !== undefined && catRate > 0
            ? catRate / 100
            : FLAT_COMMISSION_RATE;
        return lineSum + lineValue * rate_pct;
      }, 0);
      return sum + orderFee;
    }, 0);

    orders.forEach((o) => {
      // const orderGst = Number(o.gst || 0);
      // const orderCareTax = Number(o.careProtection || 0);
      const orderGst = Number(o.gst || 0);
      const orderCareTax = Number(o.careProtection || 0);
      const orderRepairWarranty = Number(o.repairWarranty || 0);
      const orderRelocationWarranty = Number(o.relocationWarranty || 0);
      const orderDeliveryPackaging = Number(o.deliveryPackaging || 0);
      const orderInstallationFee = Number(o.installationFee || 0);
      const orderPlatformFee = Number(o.platformFee || 0);
      const isPaid = ['delivered', 'confirmed'].includes(
        String(o.status || '').toLowerCase(),
      );
      // const shortId = String(o._id).slice(-6).toUpperCase();
      // const orderRef = `ORD-${shortId}`;
      const shortId = String(o._id).slice(-6).toUpperCase();
      // Same ORD-0001 format used across Admin/Vendor/User Orders tables,
      // built from the order's real sequential orderNumber (not a random
      // _id fragment), so invoice/commission rows always match exactly.
      const orderRef = `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`;

      // Rent Receipt — customer side.
      // Each product line in the order gets its own invoice(s): Rental lines
      // that span multiple months generate one invoice per month (month 1
      // follows the order's current status, later months are Pending);
      // Sell (one-time purchase) lines always generate a single invoice.
      // (o.products || []).forEach((productEntry, productIdx) => {
      //   const lineProductType = productEntry.productType || 'Rental';
      (o.products || []).forEach((productEntry, productIdx) => {
        if (
          cityProductIds &&
          !cityProductIds.some(
            (id) => String(id) === String(productEntry.product?._id),
          )
        ) {
          return;
        }

        // const lineProductType = productEntry.productType || 'Rental';
        // const isRentalLine = String(lineProductType).toLowerCase() === 'rental';
        // const isMonthlyRental =
        //   isRentalLine &&
        //   String(o.tenureUnit || '').toLowerCase() === 'month' &&
        //   Number(o.rentalDuration || 1) > 1;
        // const totalMonths = isMonthlyRental ? Number(o.rentalDuration) : 1;

        const lineProductType = productEntry.productType || 'Rental';
        const isRentalLine = String(lineProductType).toLowerCase() === 'rental';
        const lineRentalDuration = Number(
          productEntry.rentalDuration ?? o.rentalDuration ?? 1,
        );
        const isMonthlyRental =
          isRentalLine &&
          String(
            productEntry.tenureUnit || o.tenureUnit || '',
          ).toLowerCase() === 'month' &&
          lineRentalDuration > 1;
        const totalMonths = isMonthlyRental ? lineRentalDuration : 1;

        // const productName =
        //   productEntry.product?.productName || 'Unknown Product';
        // const variantName = productEntry.variantName || '';
        // const productImage = (productEntry.product?.images || [])[0] || '';
        const productName =
          productEntry.product?.productName || 'Unknown Product';
        const variantName = productEntry.variantName || '';
        const productImage = (productEntry.product?.images || [])[0] || '';
        const vendorName =
          productEntry.product?.vendorId?.fullName || 'Unknown Vendor';
        const vendorPhone = productEntry.product?.vendorId?.mobileNumber || '';
        console.log('vendorId populated as:', productEntry.product?.vendorId);

        // const lineTotal =
        //   Number(productEntry.pricePerDay || 0) *
        //   Number(productEntry.quantity || 1);
        // // pricePerDay already represents the per-month rent for monthly
        // // rentals, so each month's invoice uses it directly (no dividing
        // // by totalMonths).
        // const lineAmount = lineTotal;
        const qtyForLine = Number(productEntry.quantity || 1);
        const lineExtensionsForAmount = Array.isArray(productEntry.extensions)
          ? productEntry.extensions
          : [];
        // Base amount for a given 1-indexed month number, honoring any
        // tenure-extension segment on this line (mirrors getRateForMonth
        // used on the frontend) instead of always using the original
        // pricePerDay for every month.
        const getLineBaseAmountForMonth = (monthNumber) => {
          const seg = lineExtensionsForAmount.find(
            (ext) =>
              monthNumber >= ext.startMonth && monthNumber <= ext.endMonth,
          );
          if (seg) return Number(seg.monthlyBaseRate || 0) * qtyForLine;
          return Number(productEntry.pricePerDay || 0) * qtyForLine;
        };
        const lineAmount = getLineBaseAmountForMonth(1);

        // GST/Care Tax for a given month — uses this LINE's own real
        // gstRatePercent/careTaxRatePercent (captured at checkout) applied
        // to that month's actual base rate, instead of the order-level
        // flat gst/careProtection totals. Correctly handles extension
        // months (own base rate from the segment) and original months
        // (line.pricePerDay) with the exact same rate the line was sold
        // at — no approximation or ratio-guessing needed.
        const lineGstRate = Number(productEntry.gstRatePercent || 0) / 100;
        const lineCareTaxRate =
          Number(productEntry.careTaxRatePercent || 0) / 100;
        const getLineGstCareForMonth = (monthNumber) => {
          // Fallback for orders created before gstRatePercent/careTaxRatePercent
          // existed on the line — use the old flat order-level totals so
          // older orders keep displaying exactly as before.
          if (
            !productEntry.gstRatePercent &&
            !productEntry.careTaxRatePercent
          ) {
            return { gst: orderGst, careTax: orderCareTax };
          }
          const baseForTax = getLineBaseAmountForMonth(monthNumber);
          return {
            gst: Math.round(baseForTax * lineGstRate),
            careTax: Math.round(baseForTax * lineCareTaxRate),
          };
        };

        for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
          const dueDate = new Date(o.createdAt);
          dueDate.setMonth(dueDate.getMonth() + monthIdx);

          const monthInvoiceNo =
            monthIdx === 0
              ? `INV-${shortId}${productIdx > 0 ? `-P${productIdx + 1}` : ''}`
              : `INV-${shortId}${
                  productIdx > 0 ? `-P${productIdx + 1}` : ''
                }-M${monthIdx + 1}`;

          // const monthsPaidSoFar = Number(o.monthsPaid ?? 1);
          // const monthStatus = isMonthlyRental
          //   ? monthIdx < monthsPaidSoFar
          //     ? 'Paid'
          //     : 'Pending'
          //   : isPaid
          //     ? 'Paid'
          //     : 'Pending';

          // // Look up the actual late fee charged for this specific month, if
          // // any, from the order's stored payment history (never recomputed —
          // // this is the exact amount that was collected).
          // const paymentRecord = (o.monthlyPayments || []).find(
          //   (p) => Number(p.month) === monthIdx + 1,
          // );

          // // Per-line tracking (new) — falls back to order-level fields for
          // // pre-existing orders saved before per-line tracking existed.
          // const monthsPaidSoFar = Number(
          //   productEntry.monthsPaid ?? o.monthsPaid ?? 1,
          // );
          // const monthStatus = isMonthlyRental
          //   ? monthIdx < monthsPaidSoFar
          //     ? 'Paid'
          //     : 'Pending'
          //   : isPaid
          //     ? 'Paid'
          //     : 'Pending';

          // // Look up the actual late fee charged for this specific month, if
          // // any, from this line's own stored payment history (never
          // // recomputed — this is the exact amount that was collected).
          // const paymentRecord = (
          //   productEntry.monthlyPayments ||
          //   o.monthlyPayments ||
          //   []
          // ).find((p) => Number(p.month) === monthIdx + 1);
          // const lateFeeAmount = Number(paymentRecord?.lateFeeAmount || 0);
          // const daysLate = Number(paymentRecord?.daysLate || 0);

          // Per-line tracking (new) — falls back to order-level fields for
          // pre-existing orders saved before per-line tracking existed.
          const monthsPaidSoFar = Number(
            productEntry.monthsPaid ?? o.monthsPaid ?? 1,
          );
          const monthStatus = isMonthlyRental
            ? monthIdx < monthsPaidSoFar
              ? 'Paid'
              : 'Pending'
            : isPaid
              ? 'Paid'
              : 'Pending';

          // Look up the actual late fee charged for this specific month, if
          // any, from this line's own stored payment history (never
          // recomputed — this is the exact amount that was collected).
          const paymentRecord = (
            productEntry.monthlyPayments ||
            o.monthlyPayments ||
            []
          ).find((p) => Number(p.month) === monthIdx + 1);

          // For an already-PAID month, keep using the stored/collected
          // figures exactly as before (never recomputed). For a PENDING
          // month with no payment record yet, compute daysLate/lateFeeAmount
          // LIVE from this same `dueDate` — same formula the user-side
          // "Pay Now" flow already uses (computeNextMonthDue) — so the
          // admin table stops showing a stale ₹0 for months that are
          // actually overdue right now.
          let lateFeeAmount = Number(paymentRecord?.lateFeeAmount || 0);
          let daysLate = Number(paymentRecord?.daysLate || 0);
          if (!paymentRecord && monthStatus === 'Pending') {
            const dueDateOnly = new Date(dueDate);
            dueDateOnly.setHours(0, 0, 0, 0);
            const todayOnly = new Date();
            todayOnly.setHours(0, 0, 0, 0);
            daysLate = Math.max(
              0,
              Math.round((todayOnly - dueDateOnly) / (1000 * 60 * 60 * 24)),
            );
            const waivedForThisMonth = (
              productEntry.pendingLateFeeWaivers || []
            )
              .filter((w) => Number(w.month) === monthIdx + 1)
              .reduce((sum, w) => sum + Number(w.waiverAmount || 0), 0);
            lateFeeAmount = Math.max(
              0,
              daysLate * LATE_FEE_PER_DAY - waivedForThisMonth,
            );
          }

          // // Real, frozen category commission for this exact line — pulled
          // // from the Settlement record (same one the vendor dashboard
          // // reads), only shown on the first month's invoice since only
          // // month 1 is paid/settled at checkout.
          // const lineSettlement =
          //   monthIdx === 0
          //     ? settlementByLineId.get(String(productEntry._id))
          //     : null;
          // const commissionRate = lineSettlement
          //   ? Math.round(
          //       (Number(lineSettlement.platformFee || 0) /
          //         Number(lineSettlement.grossAmount || 1)) *
          //         100,
          //     )
          //   : null;
          // const commissionAmount = lineSettlement
          //   ? Number(lineSettlement.platformFee || 0)
          //   : null;
          // const netSettled = lineSettlement
          //   ? Number(lineSettlement.netPayout || 0)
          //   : null;

          // Real, frozen category commission for this exact line — pulled
          // from the Settlement record (same one the vendor dashboard
          // reads), only available on the first month's invoice since only
          // month 1 is paid/settled at checkout.
          const lineSettlement =
            monthIdx === 0
              ? settlementByLineId.get(String(productEntry._id))
              : null;

          // Fallback commission — same formula as the summary `commissions`
          // total above (category commissionRate, else flat 10%) — used
          // whenever a line hasn't been settled yet, so every invoice shows
          // a commission by default instead of waiting for settlement.
          const catRawForCommission =
            productEntry?.product?.category || productEntry?.category || '';
          const catKeyForCommission = String(catRawForCommission)
            .trim()
            .toLowerCase();
          const catRateForCommission =
            commissionRateByCategoryKey.get(catKeyForCommission);
          const fallbackRatePct =
            catRateForCommission !== undefined && catRateForCommission > 0
              ? catRateForCommission / 100
              : FLAT_COMMISSION_RATE;
          const fallbackCommissionAmount = lineAmount * fallbackRatePct;
          const fallbackCommissionRate = Math.round(fallbackRatePct * 100);

          const commissionRate = lineSettlement
            ? Math.round(
                (Number(lineSettlement.platformFee || 0) /
                  Number(lineSettlement.grossAmount || 1)) *
                  100,
              )
            : fallbackCommissionRate;
          const commissionAmount = lineSettlement
            ? Number(lineSettlement.platformFee || 0)
            : fallbackCommissionAmount;
          const netSettled = lineSettlement
            ? Number(lineSettlement.netPayout || 0)
            : null;

          // invoices.push({
          //   _id: `rent-${o._id}-${productIdx}-${monthIdx}`,
          //   invoiceNo: monthInvoiceNo,
          //   entityName: o.user?.fullName || o.name || 'Unknown Customer',
          //   entityType: 'Customer',
          //   entityPhone: o.phone || '',
          //   productName,
          invoices.push({
            _id: `rent-${o._id}-${productIdx}-${monthIdx}`,
            invoiceNo: monthInvoiceNo,
            // entityName: o.user?.fullName || o.name || 'Unknown Customer',
            // entityType: 'Customer',
            // entityPhone: o.phone || '',
            entityName: o.user?.fullName || o.name || 'Unknown Customer',
            entityType: 'Customer',
            entityPhone: o.user?.mobileNumber || o.phone || '',
            vendorName,
            vendorPhone,
            productName,
            variantName,
            productImage,
            productType: lineProductType,
            tenure: isMonthlyRental
              ? `${totalMonths} month${totalMonths > 1 ? 's' : ''}`
              : '',
            // type: 'Rent Receipt',
            // orderRef,
            // amount: lineAmount,
            // lateFeeAmount,
            type: 'Rent Receipt',
            orderRef,
            amount: getLineBaseAmountForMonth(monthIdx + 1),
            lateFeeAmount,
            daysLate,
            gst: getLineGstCareForMonth(monthIdx + 1).gst,
            careTax: getLineGstCareForMonth(monthIdx + 1).careTax,
            repairWarranty: orderRepairWarranty,
            relocationWarranty: orderRelocationWarranty,
            deliveryPackaging: orderDeliveryPackaging,
            installationFee: orderInstallationFee,
            platformFee: orderPlatformFee,
            commissionRate,
            commissionAmount,
            netSettled,
            date: dueDate,
            status: monthStatus,
            note: isMonthlyRental
              ? `Month ${monthIdx + 1} of ${totalMonths}`
              : null,
          });
        }
      });

      gst += orderGst;
      careTax += orderCareTax;
      repairWarranty += orderRepairWarranty;
      relocationWarranty += orderRelocationWarranty;
      deliveryPackaging += orderDeliveryPackaging;
      installationFee += orderInstallationFee;
      platformFee += orderPlatformFee;

      // const orderLineTotal = (o.products || []).reduce(
      //   (sum, p) => sum + Number(p.pricePerDay || 0) * Number(p.quantity || 1),
      //   0,
      // );
      // if (isPaid) {
      //   paidAmount += orderLineTotal;
      // } else {
      //   pendingAmount += orderLineTotal;
      // }
    });
    // gst and careTax already summed above per order

    // Service Invoice — one row per booking, no monthly split (services are
    // one-time bookings, not recurring like rentals).
    // bookings.forEach((b) => {
    //   const isPaid = b.paymentStatus === 'paid';
    //   const shortId = String(b._id).slice(-6).toUpperCase();

    //   invoices.push({
    //     _id: `svc-${b._id}`,
    //     invoiceNo: `INV-SVC-${shortId}`,
    //     entityName: b.user?.fullName || b.name || 'Unknown Customer',
    //     entityType: 'Customer',
    //     entityPhone: b.phone || '',
    //     productName:
    //       b.serviceSnapshot?.productName ||
    //       b.serviceProduct?.productName ||
    //       'Service',
    //     variantName: '',
    //     productImage: b.serviceSnapshot?.image || b.serviceProduct?.image || '',
    //     productType: 'Service',
    //     tenure: '',
    //     type: 'Service Invoice',
    //     orderRef: `SRV-${shortId}`,

    bookings.forEach((b) => {
      const isPaid = b.paymentStatus === 'paid';
      const shortId = String(b._id).slice(-6).toUpperCase();

      invoices.push({
        _id: `svc-${b._id}`,
        invoiceNo: `INV-SVC-${shortId}`,
        // entityName: b.user?.fullName || b.name || 'Unknown Customer',
        // entityType: 'Customer',
        // entityPhone: b.phone || '',
        entityName: b.user?.fullName || b.name || 'Unknown Customer',
        entityType: 'Customer',
        entityPhone: b.user?.mobileNumber || b.phone || '',
        productName:
          b.serviceSnapshot?.productName ||
          b.serviceProduct?.productName ||
          'Service',
        variantName: '',
        productImage: b.serviceSnapshot?.image || b.serviceProduct?.image || '',
        productType: 'Service',
        tenure: '',
        type: 'Service Invoice',
        // Same SRV-0001 format used across Admin/Vendor/User panels, built
        // from the booking's real sequential bookingNumber (not a random
        // _id fragment), so it always matches exactly.
        orderRef: `SRV-${String(b.bookingNumber || 0).padStart(4, '0')}`,
        amount: Number(b.totalAmount || 0),
        gst: Number(b.taxBreakdown?.gst || 0),
        careTax: Number(b.taxBreakdown?.care_tax || 0),
        date: b.createdAt,
        status:
          b.paymentMethod === 'pay_after_service'
            ? isPaid
              ? 'Paid'
              : 'Pending'
            : isPaid
              ? 'Paid'
              : 'Pending',
        note: b.isUrgent ? 'Urgent booking' : null,
        lateFeeAmount: 0,
        daysLate: 0,
      });

      //   if (isPaid) {
      //     paidAmount += Number(b.totalAmount || 0);
      //   } else {
      //     pendingAmount += Number(b.totalAmount || 0);
      //   }
      //   gst += Number(b.taxBreakdown?.gst || 0);
      //   careTax += Number(b.taxBreakdown?.care_tax || 0);
      // });

      gst += Number(b.taxBreakdown?.gst || 0);
      careTax += Number(b.taxBreakdown?.care_tax || 0);
    });

    // Pending/Paid totals computed from the actual per-month/per-booking
    // invoice rows (each already carries its own correct status), not the
    // order/booking as a whole — so a 12-month rental with only month 1
    // paid correctly shows ₹(1 month) in Paid and ₹(11 months) in Pending.
    invoices.forEach((inv) => {
      const invTotal =
        Number(inv.amount || 0) +
        Number(inv.gst || 0) +
        Number(inv.careTax || 0);
      if (inv.status === 'Paid') {
        paidAmount += invTotal;
      } else {
        pendingAmount += invTotal;
      }
    });

    let result = invoices;
    if (type) result = result.filter((r) => r.productType === type);
    if (status) result = result.filter((r) => r.status === status);
    // if (search) {
    //   const q = search.toLowerCase();
    //   result = result.filter(
    //     (r) =>
    //       r.invoiceNo.toLowerCase().includes(q) ||
    //       r.entityName.toLowerCase().includes(q) ||
    //       r.orderRef.toLowerCase().includes(q) ||
    //       String(r.entityPhone || '')
    //         .toLowerCase()
    //         .includes(q) ||
    //       String(r.productName || '')
    //         .toLowerCase()
    //         .includes(q) ||
    //       String(r.amount || '').includes(q),
    //   );
    // }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.invoiceNo.toLowerCase().includes(q) ||
          formatDisplayInvoiceNo(
            `INV-${
              r.invoiceNo
                .replace(/^INV-/, '')
                .replace(/-M\d+$/, '')
                .split('-P')[0]
            }`,
            globalInvoiceNumberMap,
          )
            .toLowerCase()
            .includes(q) ||
          r.entityName.toLowerCase().includes(q) ||
          r.orderRef.toLowerCase().includes(q) ||
          String(r.entityPhone || '')
            .toLowerCase()
            .includes(q) ||
          String(r.productName || '')
            .toLowerCase()
            .includes(q) ||
          String(r.amount || '').includes(q),
      );
    }

    // return res.json({
    //   invoices: result,
    //   summary: {
    //     pendingAmount,
    //     paidAmount,
    //     commissions,
    //     gst,
    //     careTax,
    //     lateFees,
    //   },
    // });
    // result = result.map((r) => ({
    //   ...r,
    //   displayInvoiceNo: formatDisplayInvoiceNo(
    //     `INV-${
    //       r.invoiceNo
    //         .replace(/^INV-/, '')
    //         .replace(/-M\d+$/, '')
    //         .split('-P')[0]
    //     }`,
    //     globalInvoiceNumberMap,
    //   ),
    // }));
    // result = result.map((r) => ({
    //   ...r,
    //   // Invoice number now mirrors the order's own sequential number
    //   // (ORD-0016 -> INV-0016), so both always match on the Admin panel.
    //   displayInvoiceNo: `INV-${r.orderRef.replace(/^ORD-/, '').replace(/^SRV-/, '')}`,
    // }));
    // Global sequential invoice numbering across ALL months of ALL orders
    // (not per-order) — e.g. ORD-0001 (12-month tenure) takes
    // INV-0001..INV-0012, then ORD-0002 (3-month tenure) continues with
    // INV-0013..INV-0015, etc. Computed from the FULL, unfiltered
    // `invoices` list so numbers stay stable no matter what type/status/
    // search filter is currently applied on the table.
    const numberingGroups = new Map();
    invoices.forEach((inv) => {
      if (!numberingGroups.has(inv.orderRef)) {
        numberingGroups.set(inv.orderRef, []);
      }
      numberingGroups.get(inv.orderRef).push(inv);
    });
    // Order the groups (i.e. orders/bookings) chronologically by their
    // earliest invoice date, so INV numbers still progress in time order
    // across different orders — just contiguous within each order.
    const orderedGroups = [...numberingGroups.entries()].sort((a, b) => {
      const minA = Math.min(...a[1].map((inv) => new Date(inv.date).getTime()));
      const minB = Math.min(...b[1].map((inv) => new Date(inv.date).getTime()));
      return minA - minB;
    });
    const globalDisplayNoMap = new Map();
    let invoiceCounter = 1;
    orderedGroups.forEach(([, groupInvoices]) => {
      // Within one order, keep months in sequence: M1 (no suffix), M2, M3...
      const sortedGroup = [...groupInvoices].sort((a, b) => {
        const monthA = parseInt(
          (a.invoiceNo.match(/-M(\d+)$/) || [])[1] || '1',
          10,
        );
        const monthB = parseInt(
          (b.invoiceNo.match(/-M(\d+)$/) || [])[1] || '1',
          10,
        );
        return monthA - monthB;
      });
      sortedGroup.forEach((inv) => {
        globalDisplayNoMap.set(
          inv._id,
          `INV-${String(invoiceCounter).padStart(4, '0')}`,
        );
        invoiceCounter += 1;
      });
    });

    result = result.map((r) => ({
      ...r,
      displayInvoiceNo: globalDisplayNoMap.get(r._id) || r.invoiceNo,
    }));

    return res.json({
      invoices: result,
      summary: {
        pendingAmount,
        paidAmount,
        commissions,
        gst,
        careTax,
        lateFees,
        repairWarranty,
        relocationWarranty,
        deliveryPackaging,
        installationFee,
        platformFee,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// export const getAllSettlements = async (req, res) => {
//   try {
//     // const settlements = await Settlement.find({})
//     //   .populate('vendorId', 'fullName email shopName')
//     //   .sort({ createdAt: -1 })
//     //   .lean();
//     const settlements = await Settlement.find({})
//       .populate('vendorId', 'fullName email shopName')
//       .populate('orderId', 'orderNumber')
//       .sort({ createdAt: -1 })
//       .lean();

//     const totalPending = settlements
//       .filter((s) => s.status === 'Pending')
//       .reduce((a, s) => a + s.netPayout, 0);

//     const totalPaid = settlements
//       .filter((s) => s.status === 'Paid')
//       .reduce((a, s) => a + s.netPayout, 0);

//     res.json({
//       settlements,
//       summary: { totalPending, totalPaid },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getAllSettlements = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    let cityVendorIds = null;
    if (cityProductIds) {
      const cityProducts = await Product.find(
        { _id: { $in: cityProductIds } },
        { vendorId: 1 },
      ).lean();
      cityVendorIds = [...new Set(cityProducts.map((p) => String(p.vendorId)))];
    }

    const settlementFilter = cityVendorIds
      ? { vendorId: { $in: cityVendorIds } }
      : {};

    // const settlements = await Settlement.find({})
    //   .populate('vendorId', 'fullName email shopName')
    //   .sort({ createdAt: -1 })
    //   .lean();
    const settlements = await Settlement.find(settlementFilter)
      .populate('vendorId', 'fullName email shopName')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .lean();

    const totalPending = settlements
      .filter((s) => s.status === 'Pending')
      .reduce((a, s) => a + s.netPayout, 0);

    const totalPaid = settlements
      .filter((s) => s.status === 'Paid')
      .reduce((a, s) => a + s.netPayout, 0);

    res.json({
      settlements,
      summary: { totalPending, totalPaid },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// export const getPendingRefundApprovals = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       'products.returnRequest.refundInitiatedAt': { $ne: null },
//     })
//       .populate('user', 'fullName emailAddress')
//       .populate({
//         path: 'products.product',
//         select: 'productName vendorId image images',
//         populate: {
//           path: 'vendorId',
//           select: 'fullName shopName emailAddress',
//         },
//       });
//     const rows = [];
//     for (const order of orders) {
//       for (const line of order.products || []) {
//         const rr = line?.returnRequest;
//         if (!rr?.refundInitiatedAt) continue;

//         const product = line?.product;
//         const vendor = product?.vendorId;

//         // rows.push({
//         //   orderId: order._id,
//         //   lineId: line._id,
//         //   productId: product?._id || null,
//         //   customerName: order.user?.fullName || order.name || '-',
//         //   vendorName:
//         //     vendor?.shopName ||
//         //     vendor?.fullName ||
//         //     vendor?.emailAddress ||
//         //     'Vendor',
//         //   productName: product?.productName || 'Product',
//         //   refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//         //   damageDeduction: Math.max(0, Number(rr.damageDeduction || 0)),
//         //   cleaningFees: Math.max(0, Number(rr.cleaningFees || 0)),
//         //   totalDeduction: Math.max(0, Number(rr.totalDeduction || 0)),
//         //   finalRefundAmount: Math.max(0, Number(rr.finalRefundAmount || 0)),
//         //   qcCompletedAt: rr.qcCompletedAt || null,
//         //   refundInitiatedAt: rr.refundInitiatedAt || null,
//         //   refundApprovedAt: rr.refundApprovedAt || null,
//         //   refundRejectedAt: rr.refundRejectedAt || null,
//         //   refundStatus: rr.refundApprovedAt
//         //     ? 'approved'
//         //     : rr.refundRejectedAt
//         //       ? 'rejected'
//         //       : 'pending',
//         // });
//         rows.push({
//           orderId: order._id,
//           orderNumber: order.orderNumber,
//           lineId: line._id,
//           productId: product?._id || null,
//           customerName: order.user?.fullName || order.name || '-',
//           vendorName:
//             vendor?.shopName ||
//             vendor?.fullName ||
//             vendor?.emailAddress ||
//             'Vendor',
//           productName: product?.productName || 'Product',
//           // productImage:
//           //   product?.image ||
//           //   (Array.isArray(product?.images) ? product.images[0] : null) ||
//           //   null,
//           productImage:
//             product?.image ||
//             (Array.isArray(product?.images) ? product.images[0] : null) ||
//             null,
//           productImages: (Array.isArray(product?.images) &&
//           product.images.length
//             ? product.images
//             : [product?.image].filter(Boolean)
//           ).slice(0, 10),
//           refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//           damageDeduction: Math.max(0, Number(rr.damageDeduction || 0)),
//           cleaningFees: Math.max(0, Number(rr.cleaningFees || 0)),
//           totalDeduction: Math.max(0, Number(rr.totalDeduction || 0)),
//           finalRefundAmount: Math.max(0, Number(rr.finalRefundAmount || 0)),
//           qcCompletedAt: rr.qcCompletedAt || null,
//           refundInitiatedAt: rr.refundInitiatedAt || null,
//           refundApprovedAt: rr.refundApprovedAt || null,
//           refundRejectedAt: rr.refundRejectedAt || null,
//           refundPaidAt: rr.refundPaidAt || null,
//           pickupDate: rr.pickupDate || rr.vendorPickupDate || null,
//           // refundTransactionId: rr.refundTransactionId || '',
//           // pickupPhotoName: rr.pickupPhotoName || '',
//           pickupPhotoName: rr.pickupPhotoName || '',
//           pickupPhotoUrl: rr.pickupPhotoUrl || '',
//           refundTransactionId: rr.refundTransactionId || '',
//           refundStatus: rr.refundApprovedAt
//             ? 'approved'
//             : rr.refundRejectedAt
//               ? 'rejected'
//               : 'pending',
//           payoutStatus: rr.refundPaidAt ? 'paid' : 'pending',
//         });
//       }
//     }

//     rows.sort(
//       (a, b) => new Date(b.refundInitiatedAt) - new Date(a.refundInitiatedAt),
//     );

//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getPendingRefundApprovals = async (req, res) => {
//   try {
//     const cityProductIds = await getCityProductIds(req);
//     const baseFilter = {
//       'products.returnRequest.refundInitiatedAt': { $ne: null },
//       // Only refunds that are still awaiting a decision — exclude ones
//       // already approved or rejected, so this queue only ever shows
//       // truly pending items.
//       'products.returnRequest.refundApprovedAt': null,
//       'products.returnRequest.refundRejectedAt': null,
//     };
//     const orderFilter = cityProductIds
//       ? { ...baseFilter, 'products.product': { $in: cityProductIds } }
//       : baseFilter;
export const getPendingRefundApprovals = async (req, res) => {
  try {
    // NOTE: this endpoint is shared by two frontend pages — the Refund
    // Approval queue (wants only pending) and Refund Management/Tracking
    // (wants only approved/rejected). So we intentionally return ALL
    // refund-initiated lines here, unfiltered by resolution status; each
    // frontend page applies its own status filter on the result.
    const cityProductIds = await getCityProductIds(req);
    const baseFilter = {
      'products.returnRequest.refundInitiatedAt': { $ne: null },
    };
    const orderFilter = cityProductIds
      ? { ...baseFilter, 'products.product': { $in: cityProductIds } }
      : baseFilter;

    const orders = await Order.find(orderFilter)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        select: 'productName vendorId image images',
        populate: {
          path: 'vendorId',
          select: 'fullName shopName emailAddress',
        },
      });
    const rows = [];
    for (const order of orders) {
      // for (const line of order.products || []) {
      //   const rr = line?.returnRequest;
      //   if (!rr?.refundInitiatedAt) continue;

      //   const product = line?.product;
      // for (const line of order.products || []) {
      //   const rr = line?.returnRequest;
      //   if (!rr?.refundInitiatedAt) continue;

      //   const product = line?.product;
      // for (const line of order.products || []) {
      //   const rr = line?.returnRequest;
      //   if (!rr?.refundInitiatedAt) continue;
      //   // Skip lines already resolved (approved or rejected) — only
      //   // show ones still genuinely pending a decision.
      //   if (rr.refundApprovedAt || rr.refundRejectedAt) continue;

      //   const product = line?.product;

      for (const line of order.products || []) {
        const rr = line?.returnRequest;
        if (!rr?.refundInitiatedAt) continue;

        const product = line?.product;

        if (
          cityProductIds &&
          !cityProductIds.some((id) => String(id) === String(product?._id))
        ) {
          continue;
        }
        const vendor = product?.vendorId;

        // rows.push({
        //   orderId: order._id,
        //   lineId: line._id,
        //   productId: product?._id || null,
        //   customerName: order.user?.fullName || order.name || '-',
        //   vendorName:
        //     vendor?.shopName ||
        //     vendor?.fullName ||
        //     vendor?.emailAddress ||
        //     'Vendor',
        //   productName: product?.productName || 'Product',
        //   refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
        //   damageDeduction: Math.max(0, Number(rr.damageDeduction || 0)),
        //   cleaningFees: Math.max(0, Number(rr.cleaningFees || 0)),
        //   totalDeduction: Math.max(0, Number(rr.totalDeduction || 0)),
        //   finalRefundAmount: Math.max(0, Number(rr.finalRefundAmount || 0)),
        //   qcCompletedAt: rr.qcCompletedAt || null,
        //   refundInitiatedAt: rr.refundInitiatedAt || null,
        //   refundApprovedAt: rr.refundApprovedAt || null,
        //   refundRejectedAt: rr.refundRejectedAt || null,
        //   refundStatus: rr.refundApprovedAt
        //     ? 'approved'
        //     : rr.refundRejectedAt
        //       ? 'rejected'
        //       : 'pending',
        // });
        rows.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          lineId: line._id,
          productId: product?._id || null,
          customerName: order.user?.fullName || order.name || '-',
          vendorName:
            vendor?.shopName ||
            vendor?.fullName ||
            vendor?.emailAddress ||
            'Vendor',
          productName: product?.productName || 'Product',
          // productImage:
          //   product?.image ||
          //   (Array.isArray(product?.images) ? product.images[0] : null) ||
          //   null,
          productImage:
            product?.image ||
            (Array.isArray(product?.images) ? product.images[0] : null) ||
            null,
          productImages: (Array.isArray(product?.images) &&
          product.images.length
            ? product.images
            : [product?.image].filter(Boolean)
          ).slice(0, 10),
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
          // refundTransactionId: rr.refundTransactionId || '',
          // pickupPhotoName: rr.pickupPhotoName || '',
          pickupPhotoName: rr.pickupPhotoName || '',
          pickupPhotoUrl: rr.pickupPhotoUrl || '',
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
export const decideRefundApproval = async (req, res) => {
  try {
    const { decision, note } = req.body || {};
    const { orderId, lineId } = req.params;

    if (!['approve', 'reject'].includes(String(decision || ''))) {
      return res.status(400).json({ message: 'Invalid decision.' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const targetLine = (order.products || []).id(lineId);
    if (!targetLine || !targetLine.returnRequest?.refundInitiatedAt) {
      return res.status(404).json({
        message: 'Refund-initiated return line not found.',
      });
    }

    // if (decision === 'approve') {
    //   targetLine.returnRequest.refundApprovedAt = new Date();
    //   targetLine.returnRequest.refundApprovedBy = req.admin?._id || null;
    // } else {
    //   if (!String(note || '').trim()) {
    //     return res.status(400).json({
    //       message: 'A note is required when rejecting a refund.',
    //     });
    //   }
    //   targetLine.returnRequest.refundRejectedAt = new Date();
    //   targetLine.returnRequest.refundRejectedBy = req.admin?._id || null;
    //   targetLine.returnRequest.rejectionNote = String(note).trim();
    // }

    if (decision === 'approve') {
      targetLine.returnRequest.refundApprovedAt = new Date();
      targetLine.returnRequest.refundApprovedBy = req.admin?._id || null;
    } else {
      targetLine.returnRequest.refundRejectedAt = new Date();
      targetLine.returnRequest.refundRejectedBy = req.admin?._id || null;
      targetLine.returnRequest.rejectionNote = String(note || '').trim();
    }
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        select: 'productName vendorId',
        populate: {
          path: 'vendorId',
          select: 'fullName shopName emailAddress',
        },
      });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auto-approve refunds where QC Fee (totalDeduction) is 0, 5 seconds after refund is initiated.
// Runs independently of admin opening the page.
const autoApproveZeroFeeRefunds = async () => {
  try {
    const cutoff = new Date(Date.now() - 5000);
    const orders = await Order.find({
      'products.returnRequest.refundInitiatedAt': { $lte: cutoff },
      'products.returnRequest.refundApprovedAt': null,
      'products.returnRequest.refundRejectedAt': null,
      'products.returnRequest.totalDeduction': 0,
    });

    for (const order of orders) {
      let changed = false;
      for (const line of order.products || []) {
        const rr = line?.returnRequest;
        if (
          rr?.refundInitiatedAt &&
          !rr?.refundApprovedAt &&
          !rr?.refundRejectedAt &&
          Number(rr?.totalDeduction || 0) === 0 &&
          new Date(rr.refundInitiatedAt) <= cutoff
        ) {
          rr.refundApprovedAt = new Date();
          rr.refundApprovedBy = null;
          changed = true;
        }
      }
      if (changed) await order.save();
    }
  } catch (err) {
    console.error('autoApproveZeroFeeRefunds error:', err.message);
  }
};

setInterval(autoApproveZeroFeeRefunds, 5000);

export const markRefundPaid = async (req, res) => {
  try {
    const { orderId, lineId } = req.params;
    const { transactionId } = req.body || {};

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const targetLine = (order.products || []).id(lineId);
    if (!targetLine || !targetLine.returnRequest?.refundApprovedAt) {
      return res.status(404).json({
        message: 'Approved refund line not found.',
      });
    }

    targetLine.returnRequest.refundPaidAt = new Date();
    targetLine.returnRequest.refundPaidBy = req.admin?._id || null;
    targetLine.returnRequest.refundTransactionId = transactionId || '';

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        select: 'productName vendorId',
        populate: {
          path: 'vendorId',
          select: 'fullName shopName emailAddress',
        },
      });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const getPlainCancelRefunds = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       'products.cancelledBy': { $in: ['user', 'vendor'] },
//       'products.lineStatus': 'cancelled',
//     })
//       .populate('user', 'fullName emailAddress')
//       .populate({
//         path: 'products.product',
//         select: 'productName vendorId',
//         populate: {
//           path: 'vendorId',
//           select: 'fullName shopName emailAddress',
//         },
//       });

//     const rows = [];
//     for (const order of orders) {
//       for (const line of order.products || []) {
//         // if (line.cancelledBy !== 'user') continue;
//         // if (line.lineStatus !== 'cancelled') continue;
//         if (!['user', 'vendor'].includes(line.cancelledBy)) continue;
//         if (line.lineStatus !== 'cancelled') continue;
//         // Exclude pickup/return-flow cancels — those are tracked separately
//         if (line?.returnRequest?.requestedAt) continue;

//         const product = line?.product;
//         const vendor = product?.vendorId;
//         const rb = line?.refundBreakdown || {};

//         // Other taxes/fees — same order-level fields used on the
//         // customer-facing track/cancel pages and the vendor side.
//         const otherTaxes =
//           Number(order.gst || 0) +
//           Number(order.careProtection || 0) +
//           Number(order.repairWarranty || 0) +
//           Number(order.relocationWarranty || 0) +
//           Number(order.deliveryPackaging || 0) +
//           Number(order.installationFee || 0) +
//           Number(order.platformFee || 0) +
//           Number(order.deliveryFee || 0);

//         // rows.push({
//         //   orderId: order._id,
//         //   orderNumber: order.orderNumber || 0,
//         //   lineId: line._id,
//         //   customerName: order.user?.fullName || order.name || '-',
//         //   vendorName:
//         //     vendor?.shopName ||
//         //     vendor?.fullName ||
//         //     vendor?.emailAddress ||
//         //     'Vendor',
//         //   productName: product?.productName || 'Product',
//         //   orderAmount: Number(rb.productPrice || 0),
//         //   deduction: Number(rb.feeAmount || 0),
//         //   refundAmount: Number(rb.refundAmount || 0) + otherTaxes,
//         //   refundableDeposit: Number(rb.deposit || 0),
//         //   otherTaxes,
//         //   cancelledAt: order.updatedAt || order.createdAt,
//         //   refundStatus: line.cancelRefundStatus || 'pending',
//         //   refundTransactionId: line.cancelRefundTransactionId || '',
//         //   refundPaidAt: line.cancelRefundPaidAt || null,
//         // });
//         // rows.push({
//         //   orderId: order._id,
//         //   orderNumber: order.orderNumber || 0,
//         //   lineId: line._id,
//         //   customerName: order.user?.fullName || order.name || '-',
//         //   vendorName:
//         //     vendor?.shopName ||
//         //     vendor?.fullName ||
//         //     vendor?.emailAddress ||
//         //     'Vendor',
//         //   productName: product?.productName || 'Product',
//         //   orderAmount:
//         //     Number(rb.productPrice || 0) + Number(rb.deposit || 0) + otherTaxes,
//         //   deduction: Number(rb.feeAmount || 0),
//         //   refundAmount: Number(rb.refundAmount || 0) + otherTaxes,
//         //   refundableDeposit: Number(rb.deposit || 0),
//         //   otherTaxes,
//         //   cancelledAt: line.cancelledAt || order.updatedAt || order.createdAt,
//         //   refundStatus: line.cancelRefundStatus || 'pending',
//         //   refundTransactionId: line.cancelRefundTransactionId || '',
//         //   refundPaidAt: line.cancelRefundPaidAt || null,
//         // });

//         // Recompute deduction/refund the same way the customer-facing
//         // cancel page (and the vendor cancellations list) does: the
//         // cancellation % applies to the FULL paid amount (product price
//         // + deposit + other taxes), not just the product price. The
//         // stored rb.feeAmount/refundAmount used the old (product-price-
//         // only) calculation, so only rb.feePct (the % itself) is trusted.
//         // const totalPaidAmount =
//         //   Number(rb.productPrice || 0) + Number(rb.deposit || 0) + otherTaxes;
//         // const feePct = Number(rb.feePct || 10);
//         // const recomputedDeduction =
//         //   totalPaidAmount > 0
//         //     ? Math.round((totalPaidAmount * feePct) / 100)
//         //     : 0;
//         // const recomputedRefund = Math.max(
//         //   0,
//         //   totalPaidAmount - recomputedDeduction,
//         // );

//         // rows.push({
//         //   orderId: order._id,
//         //   orderNumber: order.orderNumber || 0,
//         //   lineId: line._id,
//         //   customerName: order.user?.fullName || order.name || '-',
//         //   vendorName:
//         //     vendor?.shopName ||
//         //     vendor?.fullName ||
//         //     vendor?.emailAddress ||
//         //     'Vendor',
//         //   productName: product?.productName || 'Product',
//         //   orderAmount: totalPaidAmount,
//         //   deduction: recomputedDeduction,
//         //   refundAmount: recomputedRefund,
//         //   refundableDeposit: Number(rb.deposit || 0),
//         //   otherTaxes,
//         //   cancelledAt: line.cancelledAt || order.updatedAt || order.createdAt,
//         //   refundStatus: line.cancelRefundStatus || 'pending',
//         //   refundTransactionId: line.cancelRefundTransactionId || '',
//         //   refundPaidAt: line.cancelRefundPaidAt || null,
//         // });
//         const totalPaidAmount =
//           Number(rb.productPrice || 0) + Number(rb.deposit || 0) + otherTaxes;

//         // Vendor-initiated cancellations are always a 0% fee, full
//         // refund — vendor is at fault, so the customer isn't charged.
//         const isVendorCancelled = line.cancelledBy === 'vendor';
//         const feePct = isVendorCancelled ? 0 : Number(rb.feePct || 10);
//         const recomputedDeduction = isVendorCancelled
//           ? 0
//           : totalPaidAmount > 0
//             ? Math.round((totalPaidAmount * feePct) / 100)
//             : 0;
//         const recomputedRefund = isVendorCancelled
//           ? totalPaidAmount
//           : Math.max(0, totalPaidAmount - recomputedDeduction);

//         rows.push({
//           orderId: order._id,
//           orderNumber: order.orderNumber || 0,
//           lineId: line._id,
//           customerName: order.user?.fullName || order.name || '-',
//           vendorName:
//             vendor?.shopName ||
//             vendor?.fullName ||
//             vendor?.emailAddress ||
//             'Vendor',
//           productName: product?.productName || 'Product',
//           orderAmount: totalPaidAmount,
//           deduction: recomputedDeduction,
//           refundAmount: recomputedRefund,
//           refundableDeposit: Number(rb.deposit || 0),
//           otherTaxes,
//           cancelledAt: line.cancelledAt || order.updatedAt || order.createdAt,
//           refundStatus: line.cancelRefundStatus || 'pending',
//           refundTransactionId: line.cancelRefundTransactionId || '',
//           refundPaidAt: line.cancelRefundPaidAt || null,
//           cancelledBy: line.cancelledBy || 'user',
//         });
//       }
//     }

//     rows.sort((a, b) => new Date(b.cancelledAt) - new Date(a.cancelledAt));
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getPlainCancelRefunds = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    const orderFilter = cityProductIds
      ? {
          'products.cancelledBy': { $in: ['user', 'vendor'] },
          'products.lineStatus': 'cancelled',
          'products.product': { $in: cityProductIds },
        }
      : {
          'products.cancelledBy': { $in: ['user', 'vendor'] },
          'products.lineStatus': 'cancelled',
        };

    const orders = await Order.find(orderFilter)
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
        // if (line.cancelledBy !== 'user') continue;
        // if (line.lineStatus !== 'cancelled') continue;
        if (!['user', 'vendor'].includes(line.cancelledBy)) continue;
        if (line.lineStatus !== 'cancelled') continue;
        // Exclude pickup/return-flow cancels — those are tracked separately
        if (line?.returnRequest?.requestedAt) continue;

        const product = line?.product;

        if (
          cityProductIds &&
          !cityProductIds.some((id) => String(id) === String(product?._id))
        ) {
          continue;
        }
        const vendor = product?.vendorId;
        const rb = line?.refundBreakdown || {};

        // Other taxes/fees — same order-level fields used on the
        // customer-facing track/cancel pages and the vendor side.
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
        //   vendorName:
        //     vendor?.shopName ||
        //     vendor?.fullName ||
        //     vendor?.emailAddress ||
        //     'Vendor',
        //   productName: product?.productName || 'Product',
        //   orderAmount: Number(rb.productPrice || 0),
        //   deduction: Number(rb.feeAmount || 0),
        //   refundAmount: Number(rb.refundAmount || 0) + otherTaxes,
        //   refundableDeposit: Number(rb.deposit || 0),
        //   otherTaxes,
        //   cancelledAt: order.updatedAt || order.createdAt,
        //   refundStatus: line.cancelRefundStatus || 'pending',
        //   refundTransactionId: line.cancelRefundTransactionId || '',
        //   refundPaidAt: line.cancelRefundPaidAt || null,
        // });
        // rows.push({
        //   orderId: order._id,
        //   orderNumber: order.orderNumber || 0,
        //   lineId: line._id,
        //   customerName: order.user?.fullName || order.name || '-',
        //   vendorName:
        //     vendor?.shopName ||
        //     vendor?.fullName ||
        //     vendor?.emailAddress ||
        //     'Vendor',
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
        // cancel page (and the vendor cancellations list) does: the
        // cancellation % applies to the FULL paid amount (product price
        // + deposit + other taxes), not just the product price. The
        // stored rb.feeAmount/refundAmount used the old (product-price-
        // only) calculation, so only rb.feePct (the % itself) is trusted.
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
        //   vendorName:
        //     vendor?.shopName ||
        //     vendor?.fullName ||
        //     vendor?.emailAddress ||
        //     'Vendor',
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

        // Vendor-initiated cancellations are always a 0% fee, full
        // refund — vendor is at fault, so the customer isn't charged.
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
          vendorName:
            vendor?.shopName ||
            vendor?.fullName ||
            vendor?.emailAddress ||
            'Vendor',
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
export const markPlainCancelRefundPaid = async (req, res) => {
  try {
    const { orderId, lineId } = req.params;
    const { transactionId } = req.body || {};

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const line = order.products.id(lineId);
    if (!line) return res.status(404).json({ message: 'Line not found.' });

    line.cancelRefundStatus = 'paid';
    line.cancelRefundTransactionId = transactionId || '';
    line.cancelRefundPaidAt = new Date();
    line.cancelRefundPaidBy = req.admin?._id || req.admin?.id || null;

    await order.save();
    res.json({ message: 'Refund marked as paid.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
