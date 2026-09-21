import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import { userAuth } from '../middleware/userAuth.js';
import upload from '../middleware/upload.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  extendOrder,
  returnRequest,
  reportIssue,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  payNextMonth,
  getNextMonthDue,
} from '../controller/orderController.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controller/user/razorpayController.js';

const router = express.Router();

router.post('/', userAuth, createOrder);
router.post('/razorpay/create-order', userAuth, createRazorpayOrder);
router.post('/razorpay/verify', userAuth, verifyRazorpayPayment);
router.get('/my', userAuth, getMyOrders);
router.get('/my/:id', userAuth, getMyOrderById);
router.put('/my/:id/extend', userAuth, extendOrder);
router.post('/:orderId/pay-next-month', userAuth, payNextMonth);
router.get('/:orderId/next-month-due', userAuth, getNextMonthDue);

router.put('/my/:id/relocation-request', userAuth, async (req, res) => {
  try {
    const { productId, newAddress } = req.body || {};

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const targetLine = (order.products || []).find(
      (line) => String(line?.product || '') === String(productId || ''),
    );

    if (!targetLine) {
      return res.status(400).json({ message: 'Product line not found.' });
    }

    if (!newAddress || typeof newAddress !== 'object') {
      return res.status(400).json({ message: 'New address is required.' });
    }

    targetLine.relocationRequest = {
      status: 'requested',
      newAddressId: newAddress._id || null,
      newAddress: {
        label: String(newAddress.label || ''),
        addressLine: String(newAddress.addressLine || ''),
        area: String(newAddress.area || ''),
        pincode: String(newAddress.pincode || ''),
        phone: String(newAddress.phone || ''),
      },
      oldAddressSnapshot: {
        name: order.name || '',
        address: order.address || '',
        phone: order.phone || '',
      },
      requestedAt: new Date(),
      scheduledAt: null,
      completedAt: null,
    };

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function parseArrayField(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseObjectField(value) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

// router.post('/', userAuth, async (req, res) => {
//   try {
//     const { products, rentalDuration, tenureUnit, address, phone, name } =
//       req.body;
//     if (!products?.length || !rentalDuration || !address || !phone || !name) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }
//     const unit =
//       tenureUnit === 'day' || tenureUnit === 'month' ? tenureUnit : 'month';

//     const normalizedLines = [];
//     for (const line of products) {
//       console.log('ORDER LINE:', line);
//       const productId = line?.product;
//       const qty = Math.max(1, Number(line?.quantity || 1));
//       if (!productId) continue;

//       const product = await Product.findById(productId);
//       if (!product) continue;

//       const depUnit = Number(product.refundableDeposit || 0);
//       // normalizedLines.push({
//       //   product: productId,
//       //   productType:
//       //     String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
//       //   quantity: qty,
//       //   pricePerDay: Number(line.pricePerDay),
//       //   refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
//       //   lineStatus: 'pending',
//       // });

//       // REPLACE WITH:
//       // Validate variantId if provided
//       let variantId = null;
//       let variantName = '';
//       if (line.variantId) {
//         const matchedVariant = product.variants?.id
//           ? product.variants.id(line.variantId) // mongoose subdoc lookup
//           : product.variants?.find(
//               (v) => String(v._id) === String(line.variantId),
//             );
//         if (!matchedVariant) {
//           return res.status(400).json({
//             message: `Invalid variantId for product ${productId}`,
//           });
//         }
//         variantId = matchedVariant._id;
//         variantName = matchedVariant.variantName || '';
//       }

//       normalizedLines.push({
//         product: productId,
//         variantId,
//         variantName, // (snapshot so it shows in orders even if product changes)
//         productType:
//           String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
//         quantity: qty,
//         pricePerDay: Number(line.pricePerDay),
//         refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
//         lineStatus: 'pending',
//       });

//       const nextStock = Math.max(0, Number(product.stock || 0) - qty);
//       product.stock = nextStock;
//       product.status =
//         nextStock <= 0
//           ? 'Out of Stock'
//           : nextStock <= 5
//             ? 'Low Stock'
//             : 'Active';
//       await product.save();
//     }

//     if (!normalizedLines.length) {
//       return res.status(400).json({ message: 'No valid products in order' });
//     }

//     const order = await Order.create({
//       user: req.user._id,
//       products: normalizedLines,
//       rentalDuration: Number(rentalDuration),
//       originalRentalDuration: Number(rentalDuration),
//       extendedDurationTotal: 0,
//       tenureUnit: unit,
//       address,
//       phone,
//       name,
//     });
//     const populated = await Order.findById(order._id).populate(
//       'products.product',
//       'productName image',
//     );
//     res.status(201).json(populated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get('/my', userAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my/:id', userAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/my/:id/extend', userAuth, async (req, res) => {
  try {
    const { extensionUnit, extensionDuration, newUnitRent, productId } =
      req.body || {};

    const unit = extensionUnit === 'day' ? 'day' : 'month';
    const durationInc = Math.max(1, Number(extensionDuration || 0));
    const parsedRent = Number(newUnitRent || 0);

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('products.product');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    // if (String(order.status || '').toLowerCase() !== 'delivered') {
    //   return res
    //     .status(400)
    //     .json({ message: 'Only delivered rentals can be extended.' });
    // }

    const targetLine = (order.products || []).find((line) => {
      const lineType = String(line?.productType || '').toLowerCase();
      if (lineType === 'sell') return false;
      const p = line?.product;
      if (!p || typeof p === 'string') return false;
      if (String(p?.type || '').toLowerCase() === 'sell') return false;
      if (productId && String(p?._id || '') !== String(productId)) return false;
      return true;
    });

    if (
      !targetLine ||
      !targetLine.product ||
      typeof targetLine.product === 'string'
    ) {
      return res
        .status(400)
        .json({ message: 'No eligible rental line found to extend.' });
    }

    const lineStatus = String(
      targetLine.lineStatus || order.status || '',
    ).toLowerCase();

    if (lineStatus !== 'delivered') {
      return res.status(400).json({
        message: 'Only delivered rentals can be extended.',
      });
    }

    const product = targetLine.product;
    const cfgs = Array.isArray(product?.rentalConfigurations)
      ? product.rentalConfigurations
      : [];
    const matchingTier = cfgs.find((cfg) => {
      const tierUnit =
        String(cfg?.periodUnit || '').toLowerCase() === 'day' ? 'day' : 'month';
      if (tierUnit !== unit) return false;
      const tierDuration =
        unit === 'day' ? Number(cfg?.days || 0) : Number(cfg?.months || 0);
      return tierDuration === durationInc;
    });

    if (!matchingTier) {
      return res.status(400).json({
        message: 'Selected extension plan is not valid for this product.',
      });
    }

    // if (parsedRent > 0) {
    //   const qty = Math.max(1, Number(targetLine.quantity || 1));
    //   targetLine.pricePerDay = parsedRent / qty;
    // }

    // const currentDuration = Math.max(1, Number(order.rentalDuration || 1));
    // if (!Number.isFinite(Number(order.originalRentalDuration))) {
    //   order.originalRentalDuration = currentDuration;
    // }
    // order.tenureUnit = unit;
    // order.rentalDuration = currentDuration + durationInc;
    // order.extendedDurationTotal =
    //   Math.max(0, Number(order.extendedDurationTotal || 0)) + durationInc;

    // await order.save();

    // if (parsedRent > 0) {
    //   const qty = Math.max(1, Number(targetLine.quantity || 1));
    //   targetLine.pricePerDay = parsedRent / qty;
    // }

    // // Store extension/duration data on THIS LINE only — not on the shared
    // // order — so extending one product's tenure never affects any other
    // // product line inside the same order.
    // const currentDuration = Math.max(
    //   1,
    //   Number(targetLine.rentalDuration ?? order.rentalDuration ?? 1),
    // );
    // if (
    //   !Number.isFinite(
    //     Number(
    //       targetLine.originalRentalDuration ?? order.originalRentalDuration,
    //     ),
    //   )
    // ) {
    //   targetLine.originalRentalDuration = currentDuration;
    // }
    // targetLine.tenureUnit = unit;
    // targetLine.rentalDuration = currentDuration + durationInc;
    // targetLine.extendedDurationTotal =
    //   Math.max(0, Number(targetLine.extendedDurationTotal || 0)) + durationInc;

    // order.markModified('products');
    // await order.save();

    // Store extension/duration data on THIS LINE only — not on the shared
    // order — so extending one product's tenure never affects any other
    // product line inside the same order.
    const currentDuration = Math.max(
      1,
      Number(targetLine.rentalDuration ?? order.rentalDuration ?? 1),
    );
    if (
      !Number.isFinite(
        Number(
          targetLine.originalRentalDuration ?? order.originalRentalDuration,
        ),
      )
    ) {
      targetLine.originalRentalDuration = currentDuration;
    }

    // Rentomojo-style extension: the ORIGINAL months keep their original
    // rate (targetLine.pricePerDay is left untouched) — only the NEWLY
    // ADDED months (currentDuration+1 .. currentDuration+durationInc)
    // get the new, extension-specific rate, recorded as its own segment.
    // `newUnitRent` here is the tax-INCLUSIVE per-month rate the customer
    // saw and paid for in the Extend modal.
    if (parsedRent > 0) {
      const qty = Math.max(1, Number(targetLine.quantity || 1));
      const monthlyRateWithTax = parsedRent;
      // Back out the base (pre-tax) portion using this order's own
      // gst+careProtection ratio to the ORIGINAL base rate — same ratio
      // the frontend used to build the quoted rate — so we can store
      // both figures for later breakdowns (e.g. admin reports).
      const originalBasePerUnit = Math.max(
        1,
        Number(targetLine.pricePerDay || 0) * qty,
      );
      const taxRatio =
        (Number(order.gst || 0) + Number(order.careProtection || 0)) /
        originalBasePerUnit;
      const monthlyBaseRate = Math.round(
        monthlyRateWithTax / (1 + (taxRatio > 0 ? taxRatio : 0)),
      );

      targetLine.extensions = targetLine.extensions || [];
      targetLine.extensions.push({
        startMonth: currentDuration + 1,
        endMonth: currentDuration + durationInc,
        monthlyBaseRate,
        monthlyRateWithTax,
        unit,
      });
    }

    targetLine.tenureUnit = unit;
    targetLine.rentalDuration = currentDuration + durationInc;
    targetLine.extendedDurationTotal =
      Math.max(0, Number(targetLine.extendedDurationTotal || 0)) + durationInc;

    order.markModified('products');
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  '/my/:id/return-request',
  userAuth,
  upload.array('mediaFiles', 10),
  returnRequest,
  async (req, res) => {
    try {
      const {
        productId,
        pickupDate,
        refundMethod,
        refundDetails,
        rating,
        reviewText,
        mediaNames,
        upiId,
        bankAccountName,
        bankAccountNumber,
        bankIfsc,
      } = req.body || {};

      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).populate('products.product');

      if (!order) return res.status(404).json({ message: 'Order not found' });

      // ── Find the specific line FIRST ──
      const targetLine = (order.products || []).find((line) => {
        const lineType = String(line?.productType || '').toLowerCase();
        if (lineType === 'sell') return false;
        const p = line?.product;
        if (!p || typeof p === 'string') return false;
        if (String(p?.type || '').toLowerCase() === 'sell') return false;
        return String(p?._id || '') === String(productId || '');
      });

      if (
        !targetLine ||
        !targetLine.product ||
        typeof targetLine.product === 'string'
      ) {
        return res
          .status(400)
          .json({ message: 'Rental product line not found.' });
      }

      // // ── Check LINE status, not order status ──
      // const lineEffectiveStatus = targetLine?.lineStatus || order.status;
      // if (String(lineEffectiveStatus).toLowerCase() !== 'delivered') {
      //   return res
      //     .status(400)
      //     .json({ message: 'Only delivered rentals can request return.' });
      // }

      // ── Check LINE status, not order status ──
      const lineEffectiveStatus = targetLine?.lineStatus || order.status;
      if (String(lineEffectiveStatus).toLowerCase() !== 'delivered') {
        return res
          .status(400)
          .json({ message: 'Only delivered rentals can request return.' });
      }

      // ── Freeze any currently-unpaid late fee as Pending Due ──
      // Reuses the exact same helper used for Pay Now, so the number
      // matches what the user already sees — frozen here so it stops
      // increasing once the return request is submitted.
      const dueInfo = computeNextMonthDue(order, productId);
      targetLine.pendingDue = dueInfo?.eligible
        ? Number(dueInfo.lateFeeAmount || 0)
        : 0;

      const method = ['original', 'upi', 'bank'].includes(String(refundMethod))
        ? String(refundMethod)
        : 'original';
      const parsedRating = Number(rating || 0);
      const safeRating =
        Number.isFinite(parsedRating) && parsedRating >= 1 && parsedRating <= 5
          ? parsedRating
          : undefined;
      const safePickupDate = pickupDate ? new Date(pickupDate) : null;
      if (safePickupDate && Number.isNaN(safePickupDate.getTime())) {
        return res.status(400).json({ message: 'Invalid pickup date.' });
      }

      const files = Array.isArray(req.files) ? req.files.slice(0, 10) : [];
      const hasUnsupportedMedia = files.some((file) => {
        const mime = String(file?.mimetype || '').toLowerCase();
        return !(mime.startsWith('image/') || mime.startsWith('video/'));
      });
      if (hasUnsupportedMedia) {
        return res.status(400).json({
          message: 'Only image and video files are allowed for review media.',
        });
      }

      const uploadedMedia = [];
      for (const file of files) {
        const mediaRes = await uploadMediaToCloudinary(
          file.buffer,
          'return-reviews',
        );
        uploadedMedia.push({
          url: String(mediaRes?.secure_url || ''),
          type: String(file?.mimetype || ''),
          name: String(file?.originalname || ''),
        });
      }

      const refundObj = parseObjectField(refundDetails);
      const fallbackMediaNames = parseArrayField(mediaNames)
        .map((x) => String(x || '').trim())
        .filter(Boolean)
        .slice(0, 10);
      const safeMediaNames = uploadedMedia.length
        ? uploadedMedia
            .map((m) => m.name)
            .filter(Boolean)
            .slice(0, 10)
        : fallbackMediaNames;

      targetLine.returnRequest = {
        status: safeRating ? 'review_submitted' : 'requested',
        pickupDate: safePickupDate || null,
        refundMethod: method,
        refundDetails: {
          upiId: String(upiId || refundObj?.upiId || '').trim(),
          bankAccountName: String(
            bankAccountName || refundObj?.bankAccountName || '',
          ).trim(),
          bankAccountNumber: String(
            bankAccountNumber || refundObj?.bankAccountNumber || '',
          ).trim(),
          bankIfsc: String(bankIfsc || refundObj?.bankIfsc || '')
            .trim()
            .toUpperCase(),
        },
        rating: safeRating,
        reviewText: String(reviewText || '')
          .trim()
          .slice(0, 1000),
        mediaNames: safeMediaNames,
        media: uploadedMedia,
        requestedAt: new Date(),
        reviewedAt: safeRating ? new Date() : null,
      };

      const rentalLineCount = (order.products || []).filter((line) => {
        const lineType = String(line?.productType || '').toLowerCase();
        if (lineType === 'sell') return false;
        const p = line?.product;
        if (!p || typeof p === 'string') return false;
        if (String(p?.type || '').toLowerCase() === 'sell') return false;
        return true;
      }).length;
      if (rentalLineCount <= 1) {
        order.status = 'cancelled';
      }

      await order.save();

      const populated = await Order.findById(order._id)
        .populate('user', 'fullName emailAddress')
        .populate({
          path: 'products.product',
          populate: { path: 'vendorId', select: 'fullName emailAddress' },
        });
      res.json(populated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

router.put(
  '/my/:id/report-issue',
  userAuth,
  upload.array('issuePhotos', 5),
  reportIssue,

  async (req, res) => {
    try {
      const { productId, issueType, description, photoNames } = req.body || {};

      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).populate('products.product');

      if (!order) return res.status(404).json({ message: 'Order not found' });
      console.log('DEBUG order.status:', order.status);
      console.log(
        'DEBUG products:',
        order.products.map((p) => ({
          productId: String(p.product?._id || p.product),
          lineStatus: p.lineStatus,
          productType: p.productType,
        })),
      );
      console.log('DEBUG requested productId:', req.body.productId);

      // ── FIX: check line-level status first, fall back to order status ──
      const targetLineForStatusCheck = (order.products || []).find((line) => {
        const lineType = String(line?.productType || '').toLowerCase();
        if (lineType === 'sell') return false;
        const p = line?.product;
        if (!p) return false;
        return String(p?._id || p) === String(productId || '');
      });

      const effectiveStatus = String(
        targetLineForStatusCheck?.lineStatus || order.status || '',
      ).toLowerCase();

      if (effectiveStatus !== 'delivered') {
        return res.status(400).json({
          message: 'Issue reporting is available for active rentals only.',
        });
      }
      // ── end fix ──

      const targetLine = (order.products || []).find((line) => {
        const lineType = String(line?.productType || '').toLowerCase();
        if (lineType === 'sell') return false;
        const p = line?.product;
        if (!p || typeof p === 'string') return false;
        if (String(p?.type || '').toLowerCase() === 'sell') return false;
        return String(p?._id || '') === String(productId || '');
      });

      if (
        !targetLine ||
        !targetLine.product ||
        typeof targetLine.product === 'string'
      ) {
        return res
          .status(400)
          .json({ message: 'Rental product line not found.' });
      }

      const allowedTypes = [
        'structural_damage',
        'fabric_stain',
        'functionality_issue',
        'other',
      ];
      const safeIssueType = allowedTypes.includes(
        String(issueType || '').trim(),
      )
        ? String(issueType).trim()
        : 'other';
      const safeDescription = String(description || '')
        .trim()
        .slice(0, 500);

      const files = Array.isArray(req.files) ? req.files.slice(0, 5) : [];
      if (!files.length) {
        return res
          .status(400)
          .json({ message: 'Please upload at least 1 photo.' });
      }
      const hasUnsupportedMedia = files.some(
        (file) =>
          !String(file?.mimetype || '')
            .toLowerCase()
            .startsWith('image/'),
      );
      if (hasUnsupportedMedia) {
        return res.status(400).json({
          message: 'Only image files are allowed for issue reporting.',
        });
      }

      const uploadedPhotos = [];
      for (const file of files) {
        const mediaRes = await uploadMediaToCloudinary(
          file.buffer,
          'rental-issues',
        );
        uploadedPhotos.push({
          url: String(mediaRes?.secure_url || ''),
          type: String(file?.mimetype || ''),
          name: String(file?.originalname || ''),
        });
      }

      const fallbackPhotoNames = parseArrayField(photoNames)
        .map((x) => String(x || '').trim())
        .filter(Boolean)
        .slice(0, 5);
      const safePhotoNames = uploadedPhotos.length
        ? uploadedPhotos
            .map((p) => p.name)
            .filter(Boolean)
            .slice(0, 5)
        : fallbackPhotoNames;

      if (!Array.isArray(targetLine.issueReports)) {
        targetLine.issueReports = [];
      }
      const seqDoc = await Counter.findByIdAndUpdate(
        'vendorIssueQuerySeq',
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
      const queryCode = Number(seqDoc?.seq) || 1;
      targetLine.issueReports.unshift({
        issueType: safeIssueType,
        description: safeDescription,
        photoNames: safePhotoNames,
        photos: uploadedPhotos,
        status: 'open',
        queryCode,
        createdAt: new Date(),
      });

      await order.save();

      const populated = await Order.findById(order._id)
        .populate('user', 'fullName emailAddress')
        .populate({
          path: 'products.product',
          populate: { path: 'vendorId', select: 'fullName emailAddress' },
        });
      res.json(populated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);
// router.put('/my/:id/cancel', userAuth, cancelOrder);

// ── Admin Routes ──────────────────────────────────────────────────────────────
router.get('/', adminAuth, getAllOrders);
router.put('/:id/status', adminAuth, updateOrderStatus);

// router.put('/my/:id/cancel', userAuth, async (req, res) => {
function applyRefundBreakdown(line, effectiveStatus) {
  const isPurchase = String(line.productType || '').toLowerCase() === 'sell';

  const productPrice =
    Number(line.pricePerDay || line.price || 0) *
    Math.max(1, Number(line.quantity || 1));

  const deposit = isPurchase ? 0 : Number(line.refundableDeposit || 0);

  // Matches the frontend's getCancelPolicy(): a 10% cancellation fee
  // applies for pending, confirmed, and shipped statuses alike.
  const feePct = ['pending', 'confirmed', 'shipped'].includes(effectiveStatus)
    ? 10
    : 0;

  // const cancellableBase = productPrice + deposit;
  // const feeAmount = Math.round((cancellableBase * feePct) / 100);
  // const refundAmount = Math.max(0, cancellableBase - feeAmount);
  // Fee applies to product price ONLY — deposit is always refunded in
  // full, untouched by the cancellation fee percentage.
  const feeAmount = Math.round((productPrice * feePct) / 100);
  const refundAmount = Math.max(0, productPrice - feeAmount) + deposit;

  line.refundBreakdown = {
    productPrice,
    deposit,
    feePct,
    feeAmount,
    refundAmount,
  };
}

// router.put('/my/:id/cancel', userAuth, async (req, res) => {
//   try {
//     const { productId } = req.body || {}; // optional — if provided, cancel only that line

//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     const st = String(order.status || '');
//     if (!['pending', 'confirmed', 'shipped'].includes(st)) {
//       return res
//         .status(400)
//         .json({ message: 'This order cannot be cancelled online.' });
//     }

//     if (productId) {
//       // ── Cancel ONLY the specific line ──
//       const targetLine = order.products.find(
//         (l) =>
//           String(l._id) === String(productId) ||
//           String(l.product) === String(productId),
//       );
//       if (!targetLine) {
//         return res.status(404).json({ message: 'Product line not found.' });
//       }

//       const lineEffectiveStatus = targetLine.lineStatus || st;
//       if (!['pending', 'confirmed', 'shipped'].includes(lineEffectiveStatus)) {
//         return res
//           .status(400)
//           .json({ message: 'This item cannot be cancelled.' });
//       }

//       // Restore stock for this line only
//       if (['pending', 'confirmed'].includes(lineEffectiveStatus)) {
//         const product = await Product.findById(targetLine.product);
//         if (product) {
//           const q = Math.max(1, Number(targetLine.quantity || 1));
//           const next = Number(product.stock || 0) + q;
//           product.stock = next;
//           product.status =
//             next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
//           await product.save();
//         }
//       }

//       //   targetLine.lineStatus = 'cancelled';
//       //   targetLine.cancelledBy = 'user';
//       // } else {
//       //   // ── Cancel ALL lines (whole order) ──
//       //   if (['pending', 'confirmed'].includes(st)) {
//       //     for (const line of order.products || []) {
//       //       const product = await Product.findById(line.product);
//       //       if (product) {
//       //         const q = Math.max(1, Number(line.quantity || 1));
//       //         const next = Number(product.stock || 0) + q;
//       //         product.stock = next;
//       //         product.status =
//       //           next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
//       //         await product.save();
//       //       }
//       //     }
//       //   }
//       //   for (const line of order.products || []) {
//       //     line.lineStatus = 'cancelled';
//       //     line.cancelledBy = 'user';
//       //   }
//       // }
//       applyRefundBreakdown(targetLine, lineEffectiveStatus);
//       console.log(
//         '=== DEBUG refundBreakdown (single line) ===',
//         targetLine.refundBreakdown,
//       );
//       targetLine.lineStatus = 'cancelled';
//       targetLine.cancelledBy = 'user';
//     } else {
//       // ── Cancel ALL lines (whole order) ──
//       if (['pending', 'confirmed'].includes(st)) {
//         for (const line of order.products || []) {
//           const product = await Product.findById(line.product);
//           if (product) {
//             const q = Math.max(1, Number(line.quantity || 1));
//             const next = Number(product.stock || 0) + q;
//             product.stock = next;
//             product.status =
//               next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
//             await product.save();
//           }
//         }
//       }
//       for (const line of order.products || []) {
//         const lineSt = line.lineStatus || st;
//         applyRefundBreakdown(line, lineSt);
//         console.log(
//           '=== DEBUG refundBreakdown (bulk line) ===',
//           line.refundBreakdown,
//         );
//         line.lineStatus = 'cancelled';
//         line.cancelledBy = 'user';
//       }
//     }

//     // Recalculate order-level status from all lines
//     const statusRank = {
//       pending: 0,
//       confirmed: 1,
//       shipped: 2,
//       delivered: 3,
//       completed: 4,
//       cancelled: 5,
//     };
//     const allStatuses = order.products.map((l) => l.lineStatus || 'pending');
//     const nonCancelled = allStatuses.filter((s) => s !== 'cancelled');
//     if (nonCancelled.length) {
//       const minRank = Math.min(...nonCancelled.map((s) => statusRank[s] ?? 0));
//       order.status =
//         Object.keys(statusRank).find((k) => statusRank[k] === minRank) ||
//         order.status;
//     } else {
//       order.status = 'cancelled'; // all lines cancelled → whole order cancelled
//     }

//     await order.save();

//     const populated = await Order.findById(order._id)
//       .populate('user', 'fullName emailAddress')
//       .populate({
//         path: 'products.product',
//         populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       });
//     res.json(populated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.put('/my/:id/cancel', userAuth, async (req, res) => {
  try {
    const { productId, refundDetails } = req.body || {}; // refundDetails: { method, upiId, bankAccountName, bankAccountNumber, bankIfsc }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const st = String(order.status || '');
    if (!['pending', 'confirmed', 'shipped'].includes(st)) {
      return res
        .status(400)
        .json({ message: 'This order cannot be cancelled online.' });
    }

    if (productId) {
      // ── Cancel ONLY the specific line ──
      const targetLine = order.products.find(
        (l) =>
          String(l._id) === String(productId) ||
          String(l.product) === String(productId),
      );
      if (!targetLine) {
        return res.status(404).json({ message: 'Product line not found.' });
      }

      const lineEffectiveStatus = targetLine.lineStatus || st;
      if (!['pending', 'confirmed', 'shipped'].includes(lineEffectiveStatus)) {
        return res
          .status(400)
          .json({ message: 'This item cannot be cancelled.' });
      }

      // Restore stock for this line only
      if (['pending', 'confirmed'].includes(lineEffectiveStatus)) {
        const product = await Product.findById(targetLine.product);
        if (product) {
          const q = Math.max(1, Number(targetLine.quantity || 1));
          const next = Number(product.stock || 0) + q;
          product.stock = next;
          product.status =
            next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
          await product.save();
        }
      }

      //   targetLine.lineStatus = 'cancelled';
      //   targetLine.cancelledBy = 'user';
      // } else {
      //   // ── Cancel ALL lines (whole order) ──
      //   if (['pending', 'confirmed'].includes(st)) {
      //     for (const line of order.products || []) {
      //       const product = await Product.findById(line.product);
      //       if (product) {
      //         const q = Math.max(1, Number(line.quantity || 1));
      //         const next = Number(product.stock || 0) + q;
      //         product.stock = next;
      //         product.status =
      //           next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
      //         await product.save();
      //       }
      //     }
      //   }
      //   for (const line of order.products || []) {
      //     line.lineStatus = 'cancelled';
      //     line.cancelledBy = 'user';
      //   }
      // }
      // applyRefundBreakdown(targetLine, lineEffectiveStatus);
      // console.log(
      //   '=== DEBUG refundBreakdown (single line) ===',
      //   targetLine.refundBreakdown,
      // );
      // targetLine.lineStatus = 'cancelled';
      // targetLine.cancelledBy = 'user';

      applyRefundBreakdown(targetLine, lineEffectiveStatus);
      console.log(
        '=== DEBUG refundBreakdown (single line) ===',
        targetLine.refundBreakdown,
      );
      if (refundDetails) {
        targetLine.cancelRefundDetails = {
          method: refundDetails.method === 'upi' ? 'upi' : 'bank',
          upiId: refundDetails.upiId || '',
          bankAccountName: refundDetails.bankAccountName || '',
          bankAccountNumber: refundDetails.bankAccountNumber || '',
          bankIfsc: refundDetails.bankIfsc || '',
        };
      }
      targetLine.lineStatus = 'cancelled';
      targetLine.cancelledBy = 'user';
      targetLine.cancelledAt = new Date();
    } else {
      // ── Cancel ALL lines (whole order) ──
      if (['pending', 'confirmed'].includes(st)) {
        for (const line of order.products || []) {
          const product = await Product.findById(line.product);
          if (product) {
            const q = Math.max(1, Number(line.quantity || 1));
            const next = Number(product.stock || 0) + q;
            product.stock = next;
            product.status =
              next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
            await product.save();
          }
        }
      }
      for (const line of order.products || []) {
        const lineSt = line.lineStatus || st;
        applyRefundBreakdown(line, lineSt);
        console.log(
          '=== DEBUG refundBreakdown (bulk line) ===',
          line.refundBreakdown,
        );
        if (refundDetails) {
          line.cancelRefundDetails = {
            method: refundDetails.method === 'upi' ? 'upi' : 'bank',
            upiId: refundDetails.upiId || '',
            bankAccountName: refundDetails.bankAccountName || '',
            bankAccountNumber: refundDetails.bankAccountNumber || '',
            bankIfsc: refundDetails.bankIfsc || '',
          };
        }
        line.lineStatus = 'cancelled';
        line.cancelledBy = 'user';
        line.cancelledAt = new Date();
      }
    }

    // Recalculate order-level status from all lines
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
      order.status = 'cancelled'; // all lines cancelled → whole order cancelled
    }

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'fullName emailAddress')
      .populate(
        'products.product',
        'productName image type category subCategory',
      )
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Find the specific line
    const line = order.products.find(
      (l) => String(l.product) === String(productId),
    );
    if (!line)
      return res
        .status(404)
        .json({ message: 'Product line not found in order' });

    // Update this line's status
    line.lineStatus = lineStatus;

    // Auto-update order-level status:
    // If ALL lines share the same status → set order.status to match
    // Otherwise → set order.status to the "most advanced" status
    const statusRank = {
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
      completed: 4,
      cancelled: 5,
    };
    const allLineStatuses = order.products.map(
      (l) => l.lineStatus || 'pending',
    );
    const allSame = allLineStatuses.every((s) => s === lineStatus);
    if (allSame) {
      order.status = lineStatus;
    } else {
      // Use the least-advanced non-cancelled status so order reflects overall progress
      const nonCancelled = allLineStatuses.filter((s) => s !== 'cancelled');
      if (nonCancelled.length) {
        const minRank = Math.min(
          ...nonCancelled.map((s) => statusRank[s] ?? 0),
        );
        order.status =
          Object.keys(statusRank).find((k) => statusRank[k] === minRank) ||
          order.status;
      }
    }

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/line-status', async (req, res) => {
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
        .json({ message: 'productId and valid lineStatus required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Find the specific line
    const line = order.products.find(
      (l) => String(l.product) === String(productId),
    );
    if (!line)
      return res
        .status(404)
        .json({ message: 'Product line not found in order' });

    // Update this line's status
    line.lineStatus = lineStatus;

    // Auto-update order-level status:
    // If ALL lines share the same status → set order.status to match
    // Otherwise → set order.status to the "most advanced" status
    const statusRank = {
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
      completed: 4,
      cancelled: 5,
    };
    const allLineStatuses = order.products.map(
      (l) => l.lineStatus || 'pending',
    );
    const allSame = allLineStatuses.every((s) => s === lineStatus);
    if (allSame) {
      order.status = lineStatus;
    } else {
      // Use the least-advanced non-cancelled status so order reflects overall progress
      const nonCancelled = allLineStatuses.filter((s) => s !== 'cancelled');
      if (nonCancelled.length) {
        const minRank = Math.min(
          ...nonCancelled.map((s) => statusRank[s] ?? 0),
        );
        order.status =
          Object.keys(statusRank).find((k) => statusRank[k] === minRank) ||
          order.status;
      }
    }

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
