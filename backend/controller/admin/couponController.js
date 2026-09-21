import Coupon from '../../models/Coupon.js';

// Admin: Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      promotionName,
      discountType,
      discountValue,
      applicableOn,
      minOrderValue,
      maxDiscountCap,
      userSegment,
      validFrom,
      validUntil,
      totalUsageLimit,
      usageLimitPerUser,
    } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      promotionName,
      discountType,
      discountValue,
      applicableOn,
      minOrderValue,
      maxDiscountCap,
      userSegment,
      validFrom,
      validUntil,
      totalUsageLimit,
      usageLimitPerUser,
      createdBy: req.admin._id,
    });

    return res
      .status(201)
      .json({ success: true, message: 'Coupon created', data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get All Coupons (paginated + status filter)
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const filter = {};
    if (status === 'active') {
      filter.isActive = true;
      filter.validFrom = { $lte: now };
      filter.validUntil = { $gte: now };
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.$or = [{ validUntil: { $lt: now } }];
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Coupon.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: coupons,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get Single Coupon
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).lean({
      virtuals: true,
    });
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });
    return res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const { code, usedCount, createdBy, ...updateData } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });

    return res
      .status(200)
      .json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Toggle Active/Inactive
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`,
      data: { isActive: coupon.isActive },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });
    return res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// User: Validate & Apply Coupon
// export const validateCoupon = async (req, res) => {
//   try {
//     const { code, orderAmount, category } = req.body;
//     const now = new Date();

//     const coupon = await Coupon.findOne({ code: code.toUpperCase() });

//     if (!coupon)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Invalid coupon code' });
//     if (!coupon.isActive)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Coupon is inactive' });
//     // if (now < coupon.validFrom)
//     //   return res.status(400).json({ success: false, message: "Coupon is not yet valid" });
//     // if (now > coupon.validUntil)
//     //   return res.status(400).json({ success: false, message: "Coupon has expired" });
//     if (coupon.usedCount >= coupon.totalUsageLimit)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Coupon usage limit reached' });
//     if (orderAmount < coupon.minOrderValue)
//       return res.status(400).json({
//         success: false,
//         message: `Minimum order value of ₹${coupon.minOrderValue} required`,
//       });
//     // if (category && !coupon.applicableOn.includes(category))
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'Coupon not applicable for this category',
//     //   });

//     if (category && !coupon.applicableOn.includes(category))
//       return res.status(400).json({
//         success: false,
//         message: 'Coupon not applicable for this category',
//       });

//     // Rental-only coupons: enforce that the caller is validating against
//     // rental value specifically. Defense-in-depth in case orderAmount is
//     // ever tampered with client-side.
//     // if (
//     //   Array.isArray(coupon.applicableOn) &&
//     //   coupon.applicableOn.length > 0 &&
//     //   coupon.applicableOn.includes('Rental') &&
//     //   !coupon.applicableOn.includes('Sell') &&
//     //   category &&
//     //   category !== 'Rental'
//     // )
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'Coupon is applicable only on rental products',
//     //   });

//     // Calculate discount
//     let discountAmount = 0;
//     if (coupon.discountType === 'percentage') {
//       discountAmount = (orderAmount * coupon.discountValue) / 100;
//       if (coupon.maxDiscountCap) {
//         discountAmount = Math.min(discountAmount, coupon.maxDiscountCap);
//       }
//     } else {
//       discountAmount = coupon.discountValue;
//     }

//     discountAmount = Math.min(discountAmount, orderAmount);

//     return res.status(200).json({
//       success: true,
//       message: 'Coupon applied successfully',
//       data: {
//         couponId: coupon._id,
//         code: coupon.code,
//         discountType: coupon.discountType,
//         discountValue: coupon.discountValue,
//         discountAmount,
//         finalAmount: orderAmount - discountAmount,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

export const validateCoupon = async (req, res) => {
  try {
    const { code, categoryTotals } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: 'Invalid coupon code' });
    if (!coupon.isActive)
      return res
        .status(400)
        .json({ success: false, message: 'Coupon is inactive' });
    if (coupon.usedCount >= coupon.totalUsageLimit)
      return res
        .status(400)
        .json({ success: false, message: 'Coupon usage limit reached' });

    // The order amount this coupon can act on is the SUM of only the
    // categories the admin selected in applicableOn — e.g. a rentals-only
    // coupon never sees buy or service value, and vice versa.
    const totals = categoryTotals || {};
    const applicable = Array.isArray(coupon.applicableOn)
      ? coupon.applicableOn
      : [];
    const orderAmount = applicable.reduce(
      (sum, cat) => sum + Number(totals[cat] || 0),
      0,
    );

    if (orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: `This coupon only applies to ${applicable.join(', ') || 'certain'} items — none found in your cart`,
      });
    }

    if (orderAmount < coupon.minOrderValue)
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required in ${applicable.join(', ')} items`,
      });

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountCap) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountCap);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount: orderAmount - discountAmount,
        minOrderValue: coupon.minOrderValue,
        applicableOn: coupon.applicableOn,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Internal: Call this in Order service after order is placed
export const incrementCouponUsage = async (couponId) => {
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
};

export const getActivePublicCoupons = async (req, res) => {
  try {
    const { applicableOn } = req.query;
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      ...(applicableOn && { applicableOn: { $in: applicableOn.split(',') } }),
    })
      .select(
        'code promotionName discountType discountValue minOrderValue maxDiscountCap applicableOn',
      )
      .limit(10)
      .lean();

    return res.status(200).json({ success: true, data: coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
