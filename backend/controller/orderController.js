// import Order from '../models/Order.js';
// import Product from '../models/Product.js';
// import Counter from '../models/Counter.js';
// import VendorKyc from '../models/VendorKyc.js';
// import { uploadMediaToCloudinary } from '../config/cloudinaryUpload.js';
// import { incrementCouponUsage } from '../controller/admin/couponController.js';
// import { triggerReferralCommission } from './user/userController.js';

// // ── Helpers ──────────────────────────────────────────────────────────────────

// function parseArrayField(value) {
//   if (Array.isArray(value)) return value;
//   if (typeof value !== 'string' || !value.trim()) return [];
//   try {
//     const parsed = JSON.parse(value);
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// function parseObjectField(value) {
//   if (value && typeof value === 'object') return value;
//   if (typeof value !== 'string' || !value.trim()) return {};
//   try {
//     const parsed = JSON.parse(value);
//     return parsed && typeof parsed === 'object' ? parsed : {};
//   } catch {
//     return {};
//   }
// }

// // ── User Controllers ──────────────────────────────────────────────────────────

// // export const createOrder = async (req, res) => {
// //   try {
// //     const {
// //       products,
// //       rentalDuration,
// //       tenureUnit,
// //       address,
// //       phone,
// //       name,
// //       couponId,
// //       discountAmount,
// //     } = req.body;

// //     if (!products?.length || !rentalDuration || !address || !phone || !name) {
// //       return res.status(400).json({ message: 'Missing required fields' });
// //     }

// //     const unit =
// //       tenureUnit === 'day' || tenureUnit === 'month' ? tenureUnit : 'month';

// //     const normalizedLines = [];
// //     for (const line of products) {
// //       const productId = line?.product;
// //       const qty = Math.max(1, Number(line?.quantity || 1));
// //       if (!productId) continue;

// //       const product = await Product.findById(productId);
// //       if (!product) continue;

// //       //variantId validation
// //       let variantId = null;
// //       let variantName = '';
// //       if (line.variantId) {
// //         const matchedVariant = (product.variants || []).find(
// //           (v) => String(v._id) === String(line.variantId),
// //         );
// //         if (matchedVariant) {
// //           variantId = matchedVariant._id;
// //           variantName = matchedVariant.variantName || '';
// //         }
// //       }

// //       const depUnit = Number(product.refundableDeposit || 0);
// //       normalizedLines.push({
// //         product: productId,
// //         variantId,
// //         variantName,
// //         productType:
// //           String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
// //         quantity: qty,
// //         pricePerDay: Number(line.pricePerDay),
// //         refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
// //       });

// //       const nextStock = Math.max(0, Number(product.stock || 0) - qty);
// //       product.stock = nextStock;
// //       product.status =
// //         nextStock <= 0
// //           ? 'Out of Stock'
// //           : nextStock <= 5
// //             ? 'Low Stock'
// //             : 'Active';
// //       await product.save();
// //     }

// //     if (!normalizedLines.length) {
// //       return res.status(400).json({ message: 'No valid products in order' });
// //     }

// //     const order = await Order.create({
// //       user: req.user._id,
// //       products: normalizedLines,
// //       rentalDuration: Number(rentalDuration),
// //       originalRentalDuration: Number(rentalDuration),
// //       extendedDurationTotal: 0,
// //       tenureUnit: unit,
// //       address,
// //       phone,
// //       name,
// //       couponId: couponId || null,
// //       discountAmount: Number(discountAmount || 0),
// //     });

// //     if (couponId) {
// //       await incrementCouponUsage(couponId);
// //     }

// //     const populated = await Order.findById(order._id).populate(
// //       'products.product',
// //       'productName image',
// //     );
// //     res.status(201).json(populated);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// export const createOrder = async (req, res) => {
//   try {
//     const {
//       products,
//       rentalDuration,
//       tenureUnit,
//       address,
//       phone,
//       name,
//       couponId,
//       discountAmount,
//       totalAmount,
//       baseRentalCost,
//       deliveryFee,
//       gst,
//       refundableDeposit,
//       careProtection,
//       cityKey,
//     } = req.body;

//     if (!products?.length || !rentalDuration || !address || !phone || !name) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const unit =
//       tenureUnit === 'day' || tenureUnit === 'month' ? tenureUnit : 'month';

//     const normalizedLines = [];
//     for (const line of products) {
//       const productId = line?.product;
//       const qty = Math.max(1, Number(line?.quantity || 1));
//       if (!productId) continue;

//       const product = await Product.findById(productId);
//       if (!product) continue;

//       let variantId = null;
//       let variantName = '';
//       if (line.variantId) {
//         const matchedVariant = (product.variants || []).find(
//           (v) => String(v._id) === String(line.variantId),
//         );
//         if (matchedVariant) {
//           variantId = matchedVariant._id;
//           variantName = matchedVariant.variantName || '';
//         }
//       }

//       const depUnit = Number(product.refundableDeposit || 0);
//       normalizedLines.push({
//         product: productId,
//         variantId,
//         variantName,
//         productType:
//           String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
//         quantity: qty,
//         pricePerDay: Number(line.pricePerDay),
//         refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
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

//     // if (!normalizedLines.length) {
//     //   return res.status(400).json({ message: 'No valid products in order' });
//     // }

//     // const order = await Order.create({

//     if (!normalizedLines.length) {
//       return res.status(400).json({ message: 'No valid products in order' });
//     }

//     // Auto-fetch city from first product's vendor KYC store
//     const firstProduct = await Product.findById(normalizedLines[0].product);
//     const orderCity = String(firstProduct?.city || '')
//       .trim()
//       .toLowerCase();

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
//       couponId: couponId || null,
//       discountAmount: Number(discountAmount || 0),
//       totalAmount: Number(totalAmount || 0),
//       baseRentalCost: Number(baseRentalCost || 0),
//       deliveryFee: Number(deliveryFee || 0),
//       gst: Number(gst || 0),
//       refundableDeposit: Number(refundableDeposit || 0),
//       careProtection: Number(careProtection || 0),
//       // city: String(product?.city || '')
//       //   .trim()
//       //   .toLowerCase(),
//       city: orderCity,
//     });

//     if (couponId) {
//       await incrementCouponUsage(couponId);
//     }

//     const orderTotal = normalizedLines.reduce((sum, line) => {
//       return sum + line.pricePerDay * Number(rentalDuration);
//     }, 0);
//     await triggerReferralCommission(req.user._id, orderTotal);
//     // ────────────────────────────────────────────────────────────────

//     const populated = await Order.findById(order._id).populate(
//       'products.product',
//       'productName image',
//     );
//     res.status(201).json(populated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .populate('user', 'fullName emailAddress')
//       .populate({
//         path: 'products.product',
//         populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       })
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getMyOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     })
//       .populate('user', 'fullName emailAddress')
//       // .populate({
//       //   path: 'products.product',
//       //   populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       // });
//       .populate({
//         path: 'products.product',
//         select:
//           'productName image images variants type category subCategory logisticsVerification vendorId',
//         populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       });
//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const extendOrder = async (req, res) => {
//   try {
//     const { extensionUnit, extensionDuration, newUnitRent, productId } =
//       req.body || {};

//     const unit = extensionUnit === 'day' ? 'day' : 'month';
//     const durationInc = Math.max(1, Number(extensionDuration || 0));
//     const parsedRent = Number(newUnitRent || 0);

//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     }).populate('products.product');

//     // if (!order) return res.status(404).json({ message: 'Order not found' });
//     // if (String(order.status || '').toLowerCase() !== 'delivered') {
//     //   return res
//     //     .status(400)
//     //     .json({ message: 'Only delivered rentals can be extended.' });
//     // }
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     // const targetLine = (order.products || []).find((line) => {
//     //   const lineType = String(line?.productType || '').toLowerCase();
//     //   if (lineType === 'sell') return false;
//     //   const p = line?.product;
//     //   if (!p || typeof p === 'string') return false;
//     //   if (String(p?.type || '').toLowerCase() === 'sell') return false;
//     //   if (productId && String(p?._id || '') !== String(productId)) return false;
//     //   return true;
//     // });

//     // if (
//     //   !targetLine ||
//     //   !targetLine.product ||
//     //   typeof targetLine.product === 'string'
//     // ) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: 'No eligible rental line found to extend.' });
//     // }

//     const targetLine = (order.products || []).find((line) => {
//       const lineType = String(line?.productType || '').toLowerCase();
//       if (lineType === 'sell') return false;
//       const p = line?.product;
//       if (!p || typeof p === 'string') return false;
//       if (String(p?.type || '').toLowerCase() === 'sell') return false;
//       if (productId && String(p?._id || '') !== String(productId)) return false;
//       return true;
//     });

//     if (
//       !targetLine ||
//       !targetLine.product ||
//       typeof targetLine.product === 'string'
//     ) {
//       return res
//         .status(400)
//         .json({ message: 'No eligible rental line found to extend.' });
//     }

//     //  Check LINE status not order status
//     const lineStatus = String(
//       targetLine.lineStatus || order.status,
//     ).toLowerCase();
//     if (lineStatus !== 'delivered') {
//       return res
//         .status(400)
//         .json({ message: 'Only delivered rentals can be extended.' });
//     }

//     const product = targetLine.product;
//     const cfgs = Array.isArray(product?.rentalConfigurations)
//       ? product.rentalConfigurations
//       : [];
//     const matchingTier = cfgs.find((cfg) => {
//       const tierUnit =
//         String(cfg?.periodUnit || '').toLowerCase() === 'day' ? 'day' : 'month';
//       if (tierUnit !== unit) return false;
//       const tierDuration =
//         unit === 'day' ? Number(cfg?.days || 0) : Number(cfg?.months || 0);
//       return tierDuration === durationInc;
//     });

//     if (!matchingTier) {
//       return res.status(400).json({
//         message: 'Selected extension plan is not valid for this product.',
//       });
//     }

//     if (parsedRent > 0) {
//       const qty = Math.max(1, Number(targetLine.quantity || 1));
//       targetLine.pricePerDay = parsedRent / qty;
//     }

//     const currentDuration = Math.max(1, Number(order.rentalDuration || 1));
//     if (!Number.isFinite(Number(order.originalRentalDuration))) {
//       order.originalRentalDuration = currentDuration;
//     }
//     order.tenureUnit = unit;
//     order.rentalDuration = currentDuration + durationInc;
//     order.extendedDurationTotal =
//       Math.max(0, Number(order.extendedDurationTotal || 0)) + durationInc;

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
// };

// // export const returnRequest = async (req, res) => {
// //   try {
// //     const {
// //       productId,
// //       pickupDate,
// //       refundMethod,
// //       refundDetails,
// //       rating,
// //       reviewText,
// //       mediaNames,
// //       upiId,
// //       bankAccountName,
// //       bankAccountNumber,
// //       bankIfsc,
// //     } = req.body || {};

// //     const order = await Order.findOne({
// //       _id: req.params.id,
// //       user: req.user._id,
// //     }).populate("products.product");

// //     if (!order) return res.status(404).json({ message: "Order not found" });
// //     if (String(order.status || "").toLowerCase() !== "delivered") {
// //       return res
// //         .status(400)
// //         .json({ message: "Only delivered rentals can request return." });
// //     }

// //     const targetLine = (order.products || []).find((line) => {
// //       const lineType = String(line?.productType || "").toLowerCase();
// //       if (lineType === "sell") return false;
// //       const p = line?.product;
// //       if (!p || typeof p === "string") return false;
// //       if (String(p?.type || "").toLowerCase() === "sell") return false;
// //       return String(p?._id || "") === String(productId || "");
// //     });

// //     if (
// //       !targetLine ||
// //       !targetLine.product ||
// //       typeof targetLine.product === "string"
// //     ) {
// //       return res
// //         .status(400)
// //         .json({ message: "Rental product line not found." });
// //     }

// //     const method = ["original", "upi", "bank"].includes(String(refundMethod))
// //       ? String(refundMethod)
// //       : "original";
// //     const parsedRating = Number(rating || 0);
// //     const safeRating =
// //       Number.isFinite(parsedRating) && parsedRating >= 1 && parsedRating <= 5
// //         ? parsedRating
// //         : undefined;
// //     const safePickupDate = pickupDate ? new Date(pickupDate) : null;
// //     if (safePickupDate && Number.isNaN(safePickupDate.getTime())) {
// //       return res.status(400).json({ message: "Invalid pickup date." });
// //     }

// //     const files = Array.isArray(req.files) ? req.files.slice(0, 10) : [];
// //     const hasUnsupportedMedia = files.some((file) => {
// //       const mime = String(file?.mimetype || "").toLowerCase();
// //       return !(mime.startsWith("image/") || mime.startsWith("video/"));
// //     });
// //     if (hasUnsupportedMedia) {
// //       return res.status(400).json({
// //         message: "Only image and video files are allowed for review media.",
// //       });
// //     }

// //     const uploadedMedia = [];
// //     for (const file of files) {
// //       const mediaRes = await uploadMediaToCloudinary(
// //         file.buffer,
// //         "return-reviews",
// //       );
// //       uploadedMedia.push({
// //         url: String(mediaRes?.secure_url || ""),
// //         type: String(file?.mimetype || ""),
// //         name: String(file?.originalname || ""),
// //       });
// //     }

// //     const refundObj = parseObjectField(refundDetails);
// //     const fallbackMediaNames = parseArrayField(mediaNames)
// //       .map((x) => String(x || "").trim())
// //       .filter(Boolean)
// //       .slice(0, 10);
// //     const safeMediaNames = uploadedMedia.length
// //       ? uploadedMedia
// //           .map((m) => m.name)
// //           .filter(Boolean)
// //           .slice(0, 10)
// //       : fallbackMediaNames;

// //     targetLine.returnRequest = {
// //       status: safeRating ? "review_submitted" : "requested",
// //       pickupDate: safePickupDate || null,
// //       refundMethod: method,
// //       refundDetails: {
// //         upiId: String(upiId || refundObj?.upiId || "").trim(),
// //         bankAccountName: String(
// //           bankAccountName || refundObj?.bankAccountName || "",
// //         ).trim(),
// //         bankAccountNumber: String(
// //           bankAccountNumber || refundObj?.bankAccountNumber || "",
// //         ).trim(),
// //         bankIfsc: String(bankIfsc || refundObj?.bankIfsc || "")
// //           .trim()
// //           .toUpperCase(),
// //       },
// //       rating: safeRating,
// //       reviewText: String(reviewText || "")
// //         .trim()
// //         .slice(0, 1000),
// //       mediaNames: safeMediaNames,
// //       media: uploadedMedia,
// //       requestedAt: new Date(),
// //       reviewedAt: safeRating ? new Date() : null,
// //     };

// //     const rentalLineCount = (order.products || []).filter((line) => {
// //       const lineType = String(line?.productType || "").toLowerCase();
// //       if (lineType === "sell") return false;
// //       const p = line?.product;
// //       if (!p || typeof p === "string") return false;
// //       if (String(p?.type || "").toLowerCase() === "sell") return false;
// //       return true;
// //     }).length;
// //     if (rentalLineCount <= 1) {
// //       order.status = "cancelled";
// //     }

// //     await order.save();

// //     const populated = await Order.findById(order._id)
// //       .populate("user", "fullName emailAddress")
// //       .populate({
// //         path: "products.product",
// //         populate: { path: "vendorId", select: "fullName emailAddress" },
// //       });
// //     res.json(populated);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// export const returnRequest = async (req, res) => {
//   try {
//     const {
//       productId,
//       pickupDate,
//       refundMethod,
//       refundDetails,
//       rating,
//       reviewText,
//       mediaNames,
//       upiId,
//       bankAccountName,
//       bankAccountNumber,
//       bankIfsc,
//     } = req.body || {};

//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     }).populate('products.product');

//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     const targetLine = (order.products || []).find((line) => {
//       const lineType = String(line?.productType || '').toLowerCase();
//       if (lineType === 'sell') return false;
//       const p = line?.product;
//       if (!p || typeof p === 'string') return false;
//       if (String(p?.type || '').toLowerCase() === 'sell') return false;
//       return String(p?._id || '') === String(productId || '');
//     });

//     if (
//       !targetLine ||
//       !targetLine.product ||
//       typeof targetLine.product === 'string'
//     ) {
//       return res
//         .status(400)
//         .json({ message: 'Rental product line not found.' });
//     }

//     // ── check line status ──
//     const lineEffectiveStatus = targetLine?.lineStatus || order.status;
//     if (String(lineEffectiveStatus).toLowerCase() !== 'delivered') {
//       return res
//         .status(400)
//         .json({ message: 'Only delivered rentals can request return.' });
//     }

//     const method = ['original', 'upi', 'bank'].includes(String(refundMethod))
//       ? String(refundMethod)
//       : 'original';
//     const parsedRating = Number(rating || 0);
//     const safeRating =
//       Number.isFinite(parsedRating) && parsedRating >= 1 && parsedRating <= 5
//         ? parsedRating
//         : undefined;
//     const safePickupDate = pickupDate ? new Date(pickupDate) : null;
//     if (safePickupDate && Number.isNaN(safePickupDate.getTime())) {
//       return res.status(400).json({ message: 'Invalid pickup date.' });
//     }

//     const files = Array.isArray(req.files) ? req.files.slice(0, 10) : [];
//     const uploadedMedia = [];
//     for (const file of files) {
//       const mediaRes = await uploadMediaToCloudinary(
//         file.buffer,
//         'return-reviews',
//       );
//       uploadedMedia.push({
//         url: String(mediaRes?.secure_url || ''),
//         type: String(file?.mimetype || ''),
//         name: String(file?.originalname || ''),
//       });
//     }

//     const refundObj = parseObjectField(refundDetails);
//     const fallbackMediaNames = parseArrayField(mediaNames)
//       .map((x) => String(x || '').trim())
//       .filter(Boolean)
//       .slice(0, 10);
//     const safeMediaNames = uploadedMedia.length
//       ? uploadedMedia
//           .map((m) => m.name)
//           .filter(Boolean)
//           .slice(0, 10)
//       : fallbackMediaNames;

//     targetLine.returnRequest = {
//       status: safeRating ? 'review_submitted' : 'requested',
//       pickupDate: safePickupDate || null,
//       refundMethod: method,
//       refundDetails: {
//         upiId: String(upiId || refundObj?.upiId || '').trim(),
//         bankAccountName: String(
//           bankAccountName || refundObj?.bankAccountName || '',
//         ).trim(),
//         bankAccountNumber: String(
//           bankAccountNumber || refundObj?.bankAccountNumber || '',
//         ).trim(),
//         bankIfsc: String(bankIfsc || refundObj?.bankIfsc || '')
//           .trim()
//           .toUpperCase(),
//       },
//       rating: safeRating,
//       reviewText: String(reviewText || '')
//         .trim()
//         .slice(0, 1000),
//       mediaNames: safeMediaNames,
//       media: uploadedMedia,
//       requestedAt: new Date(),
//       reviewedAt: safeRating ? new Date() : null,
//     };

//     // ── KEY ADDITION: save review into product.reviews[] so it shows on product page ──
//     if (safeRating) {
//       const product = await Product.findById(productId);
//       if (product) {
//         const userId = req.user._id;
//         const userName = req.user.fullName || 'Customer';

//         // one review per user per product (same rule as buy products)
//         const existingReview = product.reviews.find(
//           (r) => String(r.user) === String(userId),
//         );

//         if (existingReview) {
//           // update existing review
//           existingReview.rating = safeRating;
//           existingReview.comment = String(reviewText || '')
//             .trim()
//             .slice(0, 1000);
//           existingReview.orderId = order._id; // update to latest order
//           existingReview.images = uploadedMedia
//             .map((m) => m.url)
//             .filter(Boolean);
//           existingReview.updatedAt = new Date();
//         } else {
//           // create new review
//           product.reviews.push({
//             user: userId,
//             name: userName,
//             rating: safeRating,
//             comment: String(reviewText || '')
//               .trim()
//               .slice(0, 1000),
//             images: uploadedMedia.map((m) => m.url).filter(Boolean),
//             orderId: order._id,
//           });
//         }

//         // recalculate aggregates
//         product.numReviews = product.reviews.length;
//         product.averageRating =
//           product.reviews.reduce((acc, r) => acc + r.rating, 0) /
//           product.reviews.length;

//         await product.save();
//       }
//     }

//     // update order status if only one rental line
//     const rentalLineCount = (order.products || []).filter((line) => {
//       const lineType = String(line?.productType || '').toLowerCase();
//       if (lineType === 'sell') return false;
//       const p = line?.product;
//       if (!p || typeof p === 'string') return false;
//       if (String(p?.type || '').toLowerCase() === 'sell') return false;
//       return true;
//     }).length;
//     if (rentalLineCount <= 1) {
//       order.status = 'cancelled';
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
// };
// export const reportIssue = async (req, res) => {
//   try {
//     const { productId, issueType, description, photoNames } = req.body || {};

//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     }).populate('products.product');

//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     // if (String(order.status || '').toLowerCase() !== 'delivered') {
//     //   return res.status(400).json({
//     //     message: 'Issue reporting is available for active rentals only.',
//     //   });
//     // }

//     const requestedLine = (order.products || []).find(
//       (line) =>
//         String(line?.product?._id || line?.product) === String(productId || ''),
//     );
//     const effectiveStatus = String(
//       requestedLine?.lineStatus || order.status || '',
//     ).toLowerCase();

//     if (effectiveStatus !== 'delivered') {
//       return res.status(400).json({
//         message: 'Issue reporting is available for active rentals only.',
//       });
//     }

//     const targetLine = (order.products || []).find((line) => {
//       const lineType = String(line?.productType || '').toLowerCase();
//       if (lineType === 'sell') return false;
//       const p = line?.product;
//       if (!p || typeof p === 'string') return false;
//       if (String(p?.type || '').toLowerCase() === 'sell') return false;
//       return String(p?._id || '') === String(productId || '');
//     });

//     if (
//       !targetLine ||
//       !targetLine.product ||
//       typeof targetLine.product === 'string'
//     ) {
//       return res
//         .status(400)
//         .json({ message: 'Rental product line not found.' });
//     }

//     const allowedTypes = [
//       'structural_damage',
//       'fabric_stain',
//       'functionality_issue',
//       'other',
//     ];
//     const safeIssueType = allowedTypes.includes(String(issueType || '').trim())
//       ? String(issueType).trim()
//       : 'other';
//     const safeDescription = String(description || '')
//       .trim()
//       .slice(0, 500);

//     const files = Array.isArray(req.files) ? req.files.slice(0, 5) : [];
//     if (!files.length) {
//       return res
//         .status(400)
//         .json({ message: 'Please upload at least 1 photo.' });
//     }
//     const hasUnsupportedMedia = files.some(
//       (file) =>
//         !String(file?.mimetype || '')
//           .toLowerCase()
//           .startsWith('image/'),
//     );
//     if (hasUnsupportedMedia) {
//       return res
//         .status(400)
//         .json({ message: 'Only image files are allowed for issue reporting.' });
//     }

//     const uploadedPhotos = [];
//     for (const file of files) {
//       const mediaRes = await uploadMediaToCloudinary(
//         file.buffer,
//         'rental-issues',
//       );
//       uploadedPhotos.push({
//         url: String(mediaRes?.secure_url || ''),
//         type: String(file?.mimetype || ''),
//         name: String(file?.originalname || ''),
//       });
//     }

//     const fallbackPhotoNames = parseArrayField(photoNames)
//       .map((x) => String(x || '').trim())
//       .filter(Boolean)
//       .slice(0, 5);
//     const safePhotoNames = uploadedPhotos.length
//       ? uploadedPhotos
//           .map((p) => p.name)
//           .filter(Boolean)
//           .slice(0, 5)
//       : fallbackPhotoNames;

//     if (!Array.isArray(targetLine.issueReports)) {
//       targetLine.issueReports = [];
//     }
//     const seqDoc = await Counter.findByIdAndUpdate(
//       'vendorIssueQuerySeq',
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true },
//     );
//     const queryCode = Number(seqDoc?.seq) || 1;
//     targetLine.issueReports.unshift({
//       issueType: safeIssueType,
//       description: safeDescription,
//       photoNames: safePhotoNames,
//       photos: uploadedPhotos,
//       status: 'open',
//       queryCode,
//       createdAt: new Date(),
//     });

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
// };

// export const cancelOrder = async (req, res) => {
//   try {
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

//     if (st === 'pending' || st === 'confirmed') {
//       for (const line of order.products || []) {
//         const product = await Product.findById(line.product);
//         if (product) {
//           const q = Math.max(1, Number(line.quantity || 1));
//           const next = Number(product.stock || 0) + q;
//           product.stock = next;
//           product.status =
//             next <= 0 ? 'Out of Stock' : next <= 5 ? 'Low Stock' : 'Active';
//           await product.save();
//         }
//       }
//     }

//     order.status = 'cancelled';
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
// };

// // ── Admin Controllers ─────────────────────────────────────────────────────────

// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate('user', 'fullName emailAddress')
//       .populate(
//         'products.product',
//         'productName image type category subCategory',
//       )
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updateOrderStatus = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     if (req.body.status) order.status = req.body.status;
//     await order.save();
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import VendorKyc from '../models/VendorKyc.js';
import ServiceBooking from '../models/ServiceBooking.js';
import { uploadMediaToCloudinary } from '../config/cloudinaryUpload.js';
import { incrementCouponUsage } from '../controller/admin/couponController.js';
import { triggerReferralCommission } from './user/userController.js';
import Vendor from '../models/vendorAuthModel.js';
import {
  sendNewOrderEmail,
  sendRentalOrderConfirmedEmail,
} from '../utils/sendMail.js';
import {
  sendBookingConfirmationEmail,
  sendServiceBookingConfirmationEmail,
} from '../utils/sendMail.js';
import { getNextSequence } from '../utils/getNextSequence.js';
import { getCityProductIds } from '../utils/cityScope.js';
import { resolveVendorUnitRateForOrderSnapshot } from '../utils/vendorPayout.js';
import {
  findListingTemplateForProduct,
  resolveTemplateRefundableDeposit,
} from '../utils/listingTemplateVendorRent.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── User Controllers ──────────────────────────────────────────────────────────

// export const createOrder = async (req, res) => {
//   try {
//     const {
//       products,
//       rentalDuration,
//       tenureUnit,
//       address,
//       phone,
//       name,
//       couponId,
//       discountAmount,
//     } = req.body;

//     if (!products?.length || !rentalDuration || !address || !phone || !name) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const unit =
//       tenureUnit === 'day' || tenureUnit === 'month' ? tenureUnit : 'month';

//     const normalizedLines = [];
//     for (const line of products) {
//       const productId = line?.product;
//       const qty = Math.max(1, Number(line?.quantity || 1));
//       if (!productId) continue;

//       const product = await Product.findById(productId);
//       if (!product) continue;

//       //variantId validation
//       let variantId = null;
//       let variantName = '';
//       if (line.variantId) {
//         const matchedVariant = (product.variants || []).find(
//           (v) => String(v._id) === String(line.variantId),
//         );
//         if (matchedVariant) {
//           variantId = matchedVariant._id;
//           variantName = matchedVariant.variantName || '';
//         }
//       }

//       const depUnit = Number(product.refundableDeposit || 0);
//       normalizedLines.push({
//         product: productId,
//         variantId,
//         variantName,
//         productType:
//           String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
//         quantity: qty,
//         pricePerDay: Number(line.pricePerDay),
//         refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
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
//       couponId: couponId || null,
//       discountAmount: Number(discountAmount || 0),
//     });

//     if (couponId) {
//       await incrementCouponUsage(couponId);
//     }

//     const populated = await Order.findById(order._id).populate(
//       'products.product',
//       'productName image',
//     );
//     res.status(201).json(populated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Resolves the real locality/sublocality name (never a housing society)
// for a given lat/lng via Google's Geocoding API. Falls back to '' on any
// failure so order creation is never blocked by a geocoding hiccup.
async function resolveOrderArea(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.log('[AreaDebug] skipped: invalid lat/lng', lat, lng);
    return '';
  }
  try {
    // Nominatim (OpenStreetMap) reverse geocoding — free, no API key.
    // Requires a descriptive User-Agent per Nominatim's usage policy.
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'RentnpayApp/1.0 (admin@rentnpay.com)' },
    });
    const json = await resp.json();
    // console.log('[AreaDebug] nominatim address:', JSON.stringify(json.address));
    const a = json?.address || {};
    // Prefer the real neighbourhood/suburb name over a housing society —
    // Nominatim rarely puts society names in these fields, unlike `label`
    // (which came from the frontend's autocomplete and includes them).
    const resolved =
      a.suburb ||
      a.neighbourhood ||
      a.quarter ||
      a.city_district ||
      a.town ||
      a.village ||
      a.city ||
      '';
    // console.log('[AreaDebug] resolved area:', resolved);
    return resolved;
  } catch (e) {
    // console.error('[AreaDebug] fetch threw:', e.message);
    return '';
  }
}
export const createOrder = async (req, res) => {
  try {
    const {
      products,
      rentalDuration,
      tenureUnit,
      address,
      phone,
      name,
      deliveryInstructions,
      orderLocation,
      couponId,
      discountAmount,
      totalAmount,
      baseRentalCost,
      deliveryFee,
      gst,
      refundableDeposit,
      careProtection,
      repairWarranty,
      relocationWarranty,
      deliveryPackaging,
      installationFee,
      platformFee,
      paymentId,
      paymentMethod,
      paymentMethodDetail,
    } = req.body;

    if (!products?.length || !rentalDuration || !address || !phone || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const unit =
      tenureUnit === 'day' || tenureUnit === 'month' ? tenureUnit : 'month';

    const normalizedLines = [];
    for (const line of products) {
      const productId = line?.product;
      const qty = Math.max(1, Number(line?.quantity || 1));
      if (!productId) continue;

      const product = await Product.findById(productId);
      if (!product) continue;

      let variantId = null;
      let variantName = '';
      if (line.variantId) {
        const matchedVariant = (product.variants || []).find(
          (v) => String(v._id) === String(line.variantId),
        );
        if (matchedVariant) {
          variantId = matchedVariant._id;
          variantName = matchedVariant.variantName || '';
        }
      }

      let depUnit = Number(product.refundableDeposit || 0);
      if (!(depUnit > 0) && String(product.createdVia || '') === 'template') {
        const template = await findListingTemplateForProduct(product);
        const fromTemplate = resolveTemplateRefundableDeposit(template, {
          variantId,
          variantName,
        });
        if (fromTemplate > 0) depUnit = fromTemplate;
      }
      // normalizedLines.push({
      //   product: productId,
      //   variantId,
      //   variantName,
      //   productType:
      //     String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
      //   quantity: qty,
      //   pricePerDay: Number(line.pricePerDay),
      //   refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
      // });
      // normalizedLines.push({
      //   product: productId,
      //   variantId,
      //   variantName,
      //   productType:
      //     String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
      //   quantity: qty,
      //   pricePerDay: Number(line.pricePerDay),
      //   originalPricePerDay: Number.isFinite(Number(line.originalPricePerDay))
      //     ? Number(line.originalPricePerDay)
      //     : Number(line.pricePerDay),
      //   refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
      // });

      // normalizedLines.push({
      //   product: productId,
      //   variantId,
      //   variantName,
      //   productType:
      //     String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental',
      //   quantity: qty,
      //   pricePerDay: Number(line.pricePerDay),
      //   originalPricePerDay: Number.isFinite(Number(line.originalPricePerDay))
      //     ? Number(line.originalPricePerDay)
      //     : Number(line.pricePerDay),
      //   offerSource:
      //     line.offerSource === 'admin' || line.offerSource === 'vendor'
      //       ? line.offerSource
      //       : null,
      //   refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
      // });

      const productType =
        String(product.type || '').trim() === 'Sell' ? 'Sell' : 'Rental';
      const pricePerDay = Number(line.pricePerDay);
      const originalPricePerDay = Number.isFinite(
        Number(line.originalPricePerDay),
      )
        ? Number(line.originalPricePerDay)
        : pricePerDay;
      const offerSource =
        line.offerSource === 'admin' || line.offerSource === 'vendor'
          ? line.offerSource
          : null;
      const orderDraft = {
        rentalDuration: Number(rentalDuration),
        tenureUnit: unit,
      };
      const lineDraft = {
        variantId,
        variantName,
        productType,
        quantity: qty,
        pricePerDay,
        originalPricePerDay,
        offerSource,
        rentalDuration: Number(rentalDuration),
        tenureUnit: unit,
      };
      const vendorUnitRateAtOrder = await resolveVendorUnitRateForOrderSnapshot(
        product,
        lineDraft,
        orderDraft,
      );

      normalizedLines.push({
        product: productId,
        variantId,
        variantName,
        productType,
        quantity: qty,
        pricePerDay,
        originalPricePerDay,
        offerSource,
        // Real per-line GST/Care Tax % actually applied at checkout —
        // sent from the cart's own tax calculation (see cart's
        // getItemTaxRate). Falls back to 0 for older clients that don't
        // send this yet, so nothing breaks for in-flight checkouts.
        gstRatePercent: Number.isFinite(Number(line.gstRatePercent))
          ? Number(line.gstRatePercent)
          : 0,
        careTaxRatePercent: Number.isFinite(Number(line.careTaxRatePercent))
          ? Number(line.careTaxRatePercent)
          : 0,
        refundableDeposit: Number.isFinite(depUnit) ? depUnit * qty : 0,
        vendorUnitRateAtOrder,
      });

      const nextStock = Math.max(0, Number(product.stock || 0) - qty);
      product.stock = nextStock;
      product.status =
        nextStock <= 0
          ? 'Out of Stock'
          : nextStock <= 5
            ? 'Low Stock'
            : 'Active';
      await product.save();
    }

    // if (!normalizedLines.length) {
    //   return res.status(400).json({ message: 'No valid products in order' });
    // }

    // const order = await Order.create({
    //   user: req.user._id,
    //   products: normalizedLines,
    if (!normalizedLines.length) {
      return res.status(400).json({ message: 'No valid products in order' });
    }

    const orderNumber = await getNextSequence('orderNumber');

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      products: normalizedLines,
      rentalDuration: Number(rentalDuration),
      originalRentalDuration: Number(rentalDuration),
      extendedDurationTotal: 0,
      tenureUnit: unit,
      address,
      phone,
      name,
      deliveryInstructions: String(deliveryInstructions || ''),
      orderLocation: {
        lat: Number.isFinite(Number(orderLocation?.lat))
          ? Number(orderLocation.lat)
          : null,
        lng: Number.isFinite(Number(orderLocation?.lng))
          ? Number(orderLocation.lng)
          : null,
        label: String(orderLocation?.label || ''),
        area: await resolveOrderArea(
          Number(orderLocation?.lat),
          Number(orderLocation?.lng),
        ),
      },
      couponId: couponId || null,
      discountAmount: Number(discountAmount || 0),
      totalAmount: Number(totalAmount || 0),
      baseRentalCost: Number(baseRentalCost || 0),
      deliveryFee: Number(deliveryFee || 0),
      gst: Number(gst || 0),
      refundableDeposit: Number(refundableDeposit || 0),
      careProtection: Number(careProtection || 0),
      repairWarranty: Number(repairWarranty || 0),
      relocationWarranty: Number(relocationWarranty || 0),
      deliveryPackaging: Number(deliveryPackaging || 0),
      installationFee: Number(installationFee || 0),
      platformFee: Number(platformFee || 0),
      paymentId: paymentId || '',
      paymentMethod: paymentMethod || '',
      paymentMethodDetail: paymentMethodDetail || '',
    });

    if (couponId) {
      await incrementCouponUsage(couponId);
    }

    // Fetch actual payment method from Razorpay (UPI, netbanking, card, etc.)
    // if (order.paymentId) {
    //   try {
    //     const Razorpay = (await import('razorpay')).default;
    //     const rzp = new Razorpay({
    //       key_id: process.env.RAZORPAY_KEY_ID,
    //       key_secret: process.env.RAZORPAY_KEY_SECRET,
    //     });
    //     const payment = await rzp.payments.fetch(order.paymentId);
    //     order.paymentMethod = payment.method || '';
    //     await order.save();
    //   } catch (e) {
    //     console.error('Could not fetch Razorpay payment method:', e?.message);
    //   }
    // }

    // const orderTotal = normalizedLines.reduce((sum, line) => {
    //   return sum + line.pricePerDay * Number(rentalDuration);
    // }, 0);
    // await triggerReferralCommission(req.user._id, orderTotal);
    // // ────────────────────────────────────────────────────────────────
    const orderTotal = normalizedLines.reduce((sum, line) => {
      return sum + line.pricePerDay * Number(rentalDuration);
    }, 0);
    setImmediate(() => {
      triggerReferralCommission(req.user._id, orderTotal).catch((e) =>
        console.error('Failed to trigger referral commission:', e),
      );
    });
    // ────────────────────────────────────────────────────────────────

    // const populated = await Order.findById(order._id).populate(
    //   'products.product',
    //   'productName image',
    // );
    // res.status(201).json(populated);

    //     const populated = await Order.findById(order._id).populate({
    //       path: 'products.product',
    //       select: 'productName image vendorId',
    //       populate: { path: 'vendorId', select: 'fullName emailAddress' },
    //     });

    //     // // Group order lines by vendor and email each vendor their own lines.
    //     // // Wrapped so an email failure never blocks the order response.
    //     // try {
    //     //   const vendorGroups = new Map();
    //     //   for (const line of populated.products) {
    //     //     const vendor = line.product?.vendorId;
    //     //     if (!vendor?.emailAddress) continue;
    //     //     const key = String(vendor._id);
    //     //     if (!vendorGroups.has(key)) {
    //     //       vendorGroups.set(key, { vendor, lines: [] });
    //     //     }
    //     //     vendorGroups.get(key).lines.push(line);
    //     //   }

    //     //   for (const { vendor, lines } of vendorGroups.values()) {
    //     //     await sendNewOrderEmail(
    //     //       vendor.emailAddress,
    //     //       vendor.fullName,
    //     //       populated,
    //     //       lines,
    //     //     );
    //     //   }
    //     // } catch (emailErr) {
    //     //   console.error('Failed to send new order vendor email:', emailErr);
    //     // }

    //     // Group order lines by vendor and email each vendor their own lines.
    //     // Wrapped so an email failure never blocks the order response.
    //     try {
    //       const vendorGroups = new Map();
    //       for (const line of populated.products) {
    //         const vendor = line.product?.vendorId;
    //         if (!vendor?.emailAddress) continue;
    //         const key = String(vendor._id);
    //         if (!vendorGroups.has(key)) {
    //           vendorGroups.set(key, { vendor, lines: [] });
    //         }
    //         vendorGroups.get(key).lines.push(line);
    //       }

    //       for (const { vendor, lines } of vendorGroups.values()) {
    //         await sendNewOrderEmail(
    //           vendor.emailAddress,
    //           vendor.fullName,
    //           populated,
    //           lines,
    //         );
    //       }
    //     } catch (emailErr) {
    //       console.error('Failed to send new order vendor email:', emailErr);
    //     }

    //     // Email the customer a rental confirmation for each Rental-type line.
    //     // Wrapped so an email failure never blocks the order response.
    //     try {
    //       if (req.user?.emailAddress) {
    //         for (const line of populated.products) {
    //           if (line.productType !== 'Rental') continue;
    //           await sendRentalOrderConfirmedEmail(
    //             req.user.emailAddress,
    //             req.user.fullName || name,
    //             populated,
    //             line,
    //           );
    //         }
    //       }
    //     } catch (emailErr) {
    //       console.error('Failed to send rental confirmation email:', emailErr);
    //     }

    //     res.status(201).json(populated);
    //   } catch (err) {
    //     res.status(500).json({ message: err.message });
    //   }
    // };

    const populated = await Order.findById(order._id).populate({
      path: 'products.product',
      select: 'productName image vendorId',
      populate: { path: 'vendorId', select: 'fullName emailAddress' },
    });

    // Respond immediately — the order is already saved at this point.
    // Everything below (vendor + customer emails) is non-critical to the
    // client response and was previously blocking it for several seconds
    // (each email is a real SMTP round-trip). Fire them in the background
    // instead so the order number appears to the user right away.
    res.status(201).json(populated);

    // setImmediate(async () => {
    //   // Group order lines by vendor and email each vendor their own lines.
    //   try {
    setImmediate(async () => {
      // Fetch actual payment method from Razorpay (UPI, netbanking, card, etc.)
      // Runs after the response is already sent, so it never delays the
      // order id reaching the client.
      // if (order.paymentId) {
      //   try {
      //     const Razorpay = (await import('razorpay')).default;
      //     const rzp = new Razorpay({
      //       key_id: process.env.RAZORPAY_KEY_ID,
      //       key_secret: process.env.RAZORPAY_KEY_SECRET,
      //     });
      //     const payment = await rzp.payments.fetch(order.paymentId);
      //     order.paymentMethod = payment.method || '';
      //     await order.save();
      //   } catch (e) {
      //     console.error('Could not fetch Razorpay payment method:', e?.message);
      //   }
      // }

      if (order.paymentId) {
        try {
          const Razorpay = (await import('razorpay')).default;
          const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });
          const payment = await rzp.payments.fetch(order.paymentId);
          order.paymentMethod = payment.method || '';
          // Capture identifying detail so admin/finance can tell WHICH
          // card/UPI ID/bank to actually route a refund to — the bare
          // method name ("card") alone isn't enough to act on.
          if (payment.method === 'card' && payment.card) {
            order.paymentMethodDetail = `${payment.card.network || 'Card'} ending ${payment.card.last4 || '----'}`;
          } else if (payment.method === 'upi' && payment.vpa) {
            order.paymentMethodDetail = payment.vpa;
          } else if (payment.method === 'netbanking' && payment.bank) {
            order.paymentMethodDetail = `${payment.bank} Net Banking`;
          } else if (payment.method === 'wallet' && payment.wallet) {
            order.paymentMethodDetail = `${payment.wallet} Wallet`;
          }
          await order.save();
        } catch (e) {
          console.error('Could not fetch Razorpay payment method:', e?.message);
        }
      }

      // Group order lines by vendor and email each vendor their own lines.
      try {
        const vendorGroups = new Map();
        for (const line of populated.products) {
          const vendor = line.product?.vendorId;
          if (!vendor?.emailAddress) continue;
          const key = String(vendor._id);
          if (!vendorGroups.has(key)) {
            vendorGroups.set(key, { vendor, lines: [] });
          }
          vendorGroups.get(key).lines.push(line);
        }

        for (const { vendor, lines } of vendorGroups.values()) {
          await sendNewOrderEmail(
            vendor.emailAddress,
            vendor.fullName,
            populated,
            lines,
          );
        }
      } catch (emailErr) {
        console.error('Failed to send new order vendor email:', emailErr);
      }

      // Email the customer a rental confirmation for each Rental-type line.
      try {
        if (req.user?.emailAddress) {
          for (const line of populated.products) {
            if (line.productType !== 'Rental') continue;
            await sendRentalOrderConfirmedEmail(
              req.user.emailAddress,
              req.user.fullName || name,
              populated,
              line,
            );
          }
        }
      } catch (emailErr) {
        console.error('Failed to send rental confirmation email:', emailErr);
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .populate('user', 'fullName emailAddress')
//       .populate({
//         path: 'products.product',
//         populate: { path: 'vendorId', select: 'fullName emailAddress' },
//       })
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'fullName emailAddress')
      .populate({
        path: 'products.product',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      })
      .sort({ createdAt: -1 });

    // VendorKyc is a separate collection (not embedded in Vendor), so we
    // fetch shopName in a second lookup and attach it onto each product's
    // populated vendorId object without altering the Vendor schema/populate.
    const vendorIds = [
      ...new Set(
        orders
          .flatMap((o) => o.products || [])
          .map((line) => line.product?.vendorId?._id)
          .filter(Boolean)
          .map((id) => String(id)),
      ),
    ];

    // if (vendorIds.length) {
    //   const kycDocs = await VendorKyc.find({
    //     vendorId: { $in: vendorIds },
    //   }).select('vendorId businessDetails.shopName');

    //   const shopNameByVendorId = new Map(
    //     kycDocs.map((k) => [
    //       String(k.vendorId),
    //       k.businessDetails?.shopName || '',
    //     ]),
    //   );

    //   orders.forEach((order) => {
    //     (order.products || []).forEach((line) => {
    //       const vendor = line.product?.vendorId;
    //       if (vendor?._id) {
    //         const shopName = shopNameByVendorId.get(String(vendor._id));
    //         if (shopName) {
    //           vendor._doc.shopName = shopName;
    //         }
    //       }
    //     });
    //   });
    // }

    if (vendorIds.length) {
      const kycDocs = await VendorKyc.find({
        vendorId: { $in: vendorIds },
      }).select('vendorId businessDetails.shopName storeManagement.stores');

      const vendorMetaById = new Map(
        kycDocs.map((k) => {
          const stores = k.storeManagement?.stores || [];
          const defaultStore =
            stores.find((s) => s.isDefault && s.isActive) ||
            stores.find((s) => s.isActive) ||
            stores[0] ||
            null;
          return [
            String(k.vendorId),
            {
              shopName: k.businessDetails?.shopName || '',
              storeLocation:
                defaultStore?.mapAddress || defaultStore?.completeAddress || '',
            },
          ];
        }),
      );

      orders.forEach((order) => {
        (order.products || []).forEach((line) => {
          const vendor = line.product?.vendorId;
          if (vendor?._id) {
            const meta = vendorMetaById.get(String(vendor._id));
            if (meta) {
              vendor._doc.shopName = meta.shopName;
              vendor._doc.storeLocation = meta.storeLocation;
            }
          }
        });
      });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('user', 'fullName emailAddress')
      // .populate({
      //   path: 'products.product',
      //   populate: { path: 'vendorId', select: 'fullName emailAddress' },
      // });
      .populate({
        path: 'products.product',
        select:
          'productName image images variants type category subCategory logisticsVerification vendorId',
        populate: { path: 'vendorId', select: 'fullName emailAddress' },
      });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const extendOrder = async (req, res) => {
//   try {
//     const { extensionUnit, extensionDuration, newUnitRent, productId } =
//       req.body || {};

//     const unit = extensionUnit === 'day' ? 'day' : 'month';
//     const durationInc = Math.max(1, Number(extensionDuration || 0));
//     const parsedRent = Number(newUnitRent || 0);

//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     }).populate('products.product');

//     // if (!order) return res.status(404).json({ message: 'Order not found' });
//     // if (String(order.status || '').toLowerCase() !== 'delivered') {
//     //   return res
//     //     .status(400)
//     //     .json({ message: 'Only delivered rentals can be extended.' });
//     // }
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     // const targetLine = (order.products || []).find((line) => {
//     //   const lineType = String(line?.productType || '').toLowerCase();
//     //   if (lineType === 'sell') return false;
//     //   const p = line?.product;
//     //   if (!p || typeof p === 'string') return false;
//     //   if (String(p?.type || '').toLowerCase() === 'sell') return false;
//     //   if (productId && String(p?._id || '') !== String(productId)) return false;
//     //   return true;
//     // });

//     // if (
//     //   !targetLine ||
//     //   !targetLine.product ||
//     //   typeof targetLine.product === 'string'
//     // ) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: 'No eligible rental line found to extend.' });
//     // }

//     const targetLine = (order.products || []).find((line) => {
//       const lineType = String(line?.productType || '').toLowerCase();
//       if (lineType === 'sell') return false;
//       const p = line?.product;
//       if (!p || typeof p === 'string') return false;
//       if (String(p?.type || '').toLowerCase() === 'sell') return false;
//       if (productId && String(p?._id || '') !== String(productId)) return false;
//       return true;
//     });

//     if (
//       !targetLine ||
//       !targetLine.product ||
//       typeof targetLine.product === 'string'
//     ) {
//       return res
//         .status(400)
//         .json({ message: 'No eligible rental line found to extend.' });
//     }

//     //  Check LINE status not order status
//     const lineStatus = String(
//       targetLine.lineStatus || order.status,
//     ).toLowerCase();
//     if (lineStatus !== 'delivered') {
//       return res
//         .status(400)
//         .json({ message: 'Only delivered rentals can be extended.' });
//     }

//     const product = targetLine.product;
//     const cfgs = Array.isArray(product?.rentalConfigurations)
//       ? product.rentalConfigurations
//       : [];
//     const matchingTier = cfgs.find((cfg) => {
//       const tierUnit =
//         String(cfg?.periodUnit || '').toLowerCase() === 'day' ? 'day' : 'month';
//       if (tierUnit !== unit) return false;
//       const tierDuration =
//         unit === 'day' ? Number(cfg?.days || 0) : Number(cfg?.months || 0);
//       return tierDuration === durationInc;
//     });

//     if (!matchingTier) {
//       return res.status(400).json({
//         message: 'Selected extension plan is not valid for this product.',
//       });
//     }

//     // if (parsedRent > 0) {
//     //   const qty = Math.max(1, Number(targetLine.quantity || 1));
//     //   targetLine.pricePerDay = parsedRent / qty;
//     // }

//     // const currentDuration = Math.max(1, Number(order.rentalDuration || 1));
//     // if (!Number.isFinite(Number(order.originalRentalDuration))) {
//     //   order.originalRentalDuration = currentDuration;
//     // }
//     // order.tenureUnit = unit;
//     // order.rentalDuration = currentDuration + durationInc;
//     // order.extendedDurationTotal =
//     //   Math.max(0, Number(order.extendedDurationTotal || 0)) + durationInc;

//     // await order.save();

//     if (parsedRent > 0) {
//       const qty = Math.max(1, Number(targetLine.quantity || 1));
//       targetLine.pricePerDay = parsedRent / qty;
//     }

//     // Store extension/duration data on THIS LINE only — not on the shared
//     // order — so extending one product's tenure never affects any other
//     // product line inside the same order.
//     const currentDuration = Math.max(
//       1,
//       Number(targetLine.rentalDuration ?? order.rentalDuration ?? 1),
//     );
//     if (
//       !Number.isFinite(
//         Number(
//           targetLine.originalRentalDuration ?? order.originalRentalDuration,
//         ),
//       )
//     ) {
//       targetLine.originalRentalDuration = currentDuration;
//     }
//     targetLine.tenureUnit = unit;
//     targetLine.rentalDuration = currentDuration + durationInc;
//     targetLine.extendedDurationTotal =
//       Math.max(0, Number(targetLine.extendedDurationTotal || 0)) + durationInc;

//     order.markModified('products');
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
// };

// export const returnRequest = async (req, res) => {
//   try {
//     const {
//       productId,
//       pickupDate,
//       refundMethod,
//       refundDetails,
//       rating,
//       reviewText,
//       mediaNames,
//       upiId,
//       bankAccountName,
//       bankAccountNumber,
//       bankIfsc,
//     } = req.body || {};

//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     }).populate("products.product");

//     if (!order) return res.status(404).json({ message: "Order not found" });
//     if (String(order.status || "").toLowerCase() !== "delivered") {
//       return res
//         .status(400)
//         .json({ message: "Only delivered rentals can request return." });
//     }

//     const targetLine = (order.products || []).find((line) => {
//       const lineType = String(line?.productType || "").toLowerCase();
//       if (lineType === "sell") return false;
//       const p = line?.product;
//       if (!p || typeof p === "string") return false;
//       if (String(p?.type || "").toLowerCase() === "sell") return false;
//       return String(p?._id || "") === String(productId || "");
//     });

//     if (
//       !targetLine ||
//       !targetLine.product ||
//       typeof targetLine.product === "string"
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Rental product line not found." });
//     }

//     const method = ["original", "upi", "bank"].includes(String(refundMethod))
//       ? String(refundMethod)
//       : "original";
//     const parsedRating = Number(rating || 0);
//     const safeRating =
//       Number.isFinite(parsedRating) && parsedRating >= 1 && parsedRating <= 5
//         ? parsedRating
//         : undefined;
//     const safePickupDate = pickupDate ? new Date(pickupDate) : null;
//     if (safePickupDate && Number.isNaN(safePickupDate.getTime())) {
//       return res.status(400).json({ message: "Invalid pickup date." });
//     }

//     const files = Array.isArray(req.files) ? req.files.slice(0, 10) : [];
//     const hasUnsupportedMedia = files.some((file) => {
//       const mime = String(file?.mimetype || "").toLowerCase();
//       return !(mime.startsWith("image/") || mime.startsWith("video/"));
//     });
//     if (hasUnsupportedMedia) {
//       return res.status(400).json({
//         message: "Only image and video files are allowed for review media.",
//       });
//     }

//     const uploadedMedia = [];
//     for (const file of files) {
//       const mediaRes = await uploadMediaToCloudinary(
//         file.buffer,
//         "return-reviews",
//       );
//       uploadedMedia.push({
//         url: String(mediaRes?.secure_url || ""),
//         type: String(file?.mimetype || ""),
//         name: String(file?.originalname || ""),
//       });
//     }

//     const refundObj = parseObjectField(refundDetails);
//     const fallbackMediaNames = parseArrayField(mediaNames)
//       .map((x) => String(x || "").trim())
//       .filter(Boolean)
//       .slice(0, 10);
//     const safeMediaNames = uploadedMedia.length
//       ? uploadedMedia
//           .map((m) => m.name)
//           .filter(Boolean)
//           .slice(0, 10)
//       : fallbackMediaNames;

//     targetLine.returnRequest = {
//       status: safeRating ? "review_submitted" : "requested",
//       pickupDate: safePickupDate || null,
//       refundMethod: method,
//       refundDetails: {
//         upiId: String(upiId || refundObj?.upiId || "").trim(),
//         bankAccountName: String(
//           bankAccountName || refundObj?.bankAccountName || "",
//         ).trim(),
//         bankAccountNumber: String(
//           bankAccountNumber || refundObj?.bankAccountNumber || "",
//         ).trim(),
//         bankIfsc: String(bankIfsc || refundObj?.bankIfsc || "")
//           .trim()
//           .toUpperCase(),
//       },
//       rating: safeRating,
//       reviewText: String(reviewText || "")
//         .trim()
//         .slice(0, 1000),
//       mediaNames: safeMediaNames,
//       media: uploadedMedia,
//       requestedAt: new Date(),
//       reviewedAt: safeRating ? new Date() : null,
//     };

//     const rentalLineCount = (order.products || []).filter((line) => {
//       const lineType = String(line?.productType || "").toLowerCase();
//       if (lineType === "sell") return false;
//       const p = line?.product;
//       if (!p || typeof p === "string") return false;
//       if (String(p?.type || "").toLowerCase() === "sell") return false;
//       return true;
//     }).length;
//     if (rentalLineCount <= 1) {
//       order.status = "cancelled";
//     }

//     await order.save();

//     const populated = await Order.findById(order._id)
//       .populate("user", "fullName emailAddress")
//       .populate({
//         path: "products.product",
//         populate: { path: "vendorId", select: "fullName emailAddress" },
//       });
//     res.json(populated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const extendOrder = async (req, res) => {
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

    // if (!order) return res.status(404).json({ message: 'Order not found' });
    // if (String(order.status || '').toLowerCase() !== 'delivered') {
    //   return res
    //     .status(400)
    //     .json({ message: 'Only delivered rentals can be extended.' });
    // }
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // const targetLine = (order.products || []).find((line) => {
    //   const lineType = String(line?.productType || '').toLowerCase();
    //   if (lineType === 'sell') return false;
    //   const p = line?.product;
    //   if (!p || typeof p === 'string') return false;
    //   if (String(p?.type || '').toLowerCase() === 'sell') return false;
    //   if (productId && String(p?._id || '') !== String(productId)) return false;
    //   return true;
    // });

    // if (
    //   !targetLine ||
    //   !targetLine.product ||
    //   typeof targetLine.product === 'string'
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: 'No eligible rental line found to extend.' });
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

    //  Check LINE status not order status
    const lineStatus = String(
      targetLine.lineStatus || order.status,
    ).toLowerCase();
    if (lineStatus !== 'delivered') {
      return res
        .status(400)
        .json({ message: 'Only delivered rentals can be extended.' });
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

    // NOTE: targetLine.pricePerDay is intentionally left UNTOUCHED here.
    // It must keep reflecting the ORIGINAL committed rate for the
    // original months. The extension's own rate is stored as a separate
    // segment in targetLine.extensions[] (see below), which is what
    // getRateForMonth() / getCurrentCycleRate() / computeNextMonthDue()
    // already read to bill each month at its correct rate.

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
    // targetLine.tenureUnit = unit;
    // targetLine.rentalDuration = currentDuration + durationInc;
    // targetLine.extendedDurationTotal =
    //   Math.max(0, Number(targetLine.extendedDurationTotal || 0)) + durationInc;

    // order.markModified('products');

    targetLine.tenureUnit = unit;
    targetLine.rentalDuration = currentDuration + durationInc;
    targetLine.extendedDurationTotal =
      Math.max(0, Number(targetLine.extendedDurationTotal || 0)) + durationInc;

    // Record the extension as its OWN segment (Rentomojo-style) instead of
    // overwriting the line's base rate. This is what makes months 1-12
    // keep billing at the original ₹1,230/mo and only months 13-15 bill
    // at the new ₹4,920/mo.
    if (parsedRent > 0) {
      const baseRentPerUnit =
        Number(req.body?.newBaseRent || 0) > 0
          ? Number(req.body.newBaseRent)
          : parsedRent;
      targetLine.extensions = Array.isArray(targetLine.extensions)
        ? targetLine.extensions
        : [];
      targetLine.extensions.push({
        startMonth: currentDuration + 1,
        endMonth: currentDuration + durationInc,
        monthlyBaseRate: baseRentPerUnit,
        monthlyRateWithTax: parsedRent,
        unit,
      });
    }

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
};
export const returnRequest = async (req, res) => {
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

    // ── check line status ──
    const lineEffectiveStatus = targetLine?.lineStatus || order.status;
    if (String(lineEffectiveStatus).toLowerCase() !== 'delivered') {
      return res
        .status(400)
        .json({ message: 'Only delivered rentals can request return.' });
    }

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

    // ── KEY ADDITION: save review into product.reviews[] so it shows on product page ──
    if (safeRating) {
      const product = await Product.findById(productId);
      if (product) {
        const userId = req.user._id;
        const userName = req.user.fullName || 'Customer';

        // one review per user per product (same rule as buy products)
        const existingReview = product.reviews.find(
          (r) => String(r.user) === String(userId),
        );

        if (existingReview) {
          // update existing review
          existingReview.rating = safeRating;
          existingReview.comment = String(reviewText || '')
            .trim()
            .slice(0, 1000);
          existingReview.orderId = order._id; // update to latest order
          existingReview.images = uploadedMedia
            .map((m) => m.url)
            .filter(Boolean);
          existingReview.updatedAt = new Date();
        } else {
          // create new review
          product.reviews.push({
            user: userId,
            name: userName,
            rating: safeRating,
            comment: String(reviewText || '')
              .trim()
              .slice(0, 1000),
            images: uploadedMedia.map((m) => m.url).filter(Boolean),
            orderId: order._id,
          });
        }

        // recalculate aggregates
        product.numReviews = product.reviews.length;
        product.averageRating =
          product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length;

        await product.save();
      }
    }

    // update order status if only one rental line
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
};
export const reportIssue = async (req, res) => {
  try {
    const { productId, issueType, description, photoNames } = req.body || {};

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('products.product');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    // if (String(order.status || '').toLowerCase() !== 'delivered') {
    //   return res.status(400).json({
    //     message: 'Issue reporting is available for active rentals only.',
    //   });
    // }

    const requestedLine = (order.products || []).find(
      (line) =>
        String(line?.product?._id || line?.product) === String(productId || ''),
    );
    const effectiveStatus = String(
      requestedLine?.lineStatus || order.status || '',
    ).toLowerCase();

    if (effectiveStatus !== 'delivered') {
      return res.status(400).json({
        message: 'Issue reporting is available for active rentals only.',
      });
    }

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
    const safeIssueType = allowedTypes.includes(String(issueType || '').trim())
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
      return res
        .status(400)
        .json({ message: 'Only image files are allowed for issue reporting.' });
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
};

export const cancelOrder = async (req, res) => {
  try {
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

    if (st === 'pending' || st === 'confirmed') {
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

    order.status = 'cancelled';
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
};

// ── Admin Controllers ─────────────────────────────────────────────────────────

// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate('user', 'fullName emailAddress mobileNumber')
//       .populate(
//         'products.product',
//         'productName image type category subCategory',
//       )
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getAllOrders = async (req, res) => {
  try {
    const cityProductIds = await getCityProductIds(req);
    const filter = cityProductIds
      ? { 'products.product': { $in: cityProductIds } }
      : {};

    const orders = await Order.find(filter)
      .populate('user', 'fullName emailAddress mobileNumber')
      .populate(
        'products.product',
        'productName image type category subCategory',
      )
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.body.status) order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendOrderConfirmationNotification = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('products.product', 'productName image')
      .populate('user', 'fullName emailAddress');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const custEmail = order.user?.emailAddress;
    const custName = order.user?.fullName || order.name;

    if (!custEmail) {
      return res.status(400).json({ message: 'Customer email not found.' });
    }

    // await sendOrderConfirmationEmail(custEmail, custName, order);

    res.json({ success: true, message: 'Order confirmation email sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendBookingConfirmationNotification = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await ServiceBooking.findById(bookingId).populate(
      'user',
      'fullName emailAddress',
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const custEmail = booking.user?.emailAddress;
    const custName = booking.user?.fullName || booking.name;

    if (!custEmail) {
      return res.status(400).json({ message: 'Customer email not found.' });
    }

    // await sendBookingConfirmationEmail(custEmail, custName, booking);
    await sendServiceBookingConfirmationEmail(custEmail, custName, booking);

    res.json({ success: true, message: 'Booking confirmation email sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const LATE_FEE_PER_DAY = 10;

// Shared helper: computes the base rent for the next unpaid month plus any
// late fee owed, based on the order's creation date and today's date.
// monthIdx here is 0-indexed (month 2 = index 1).
// function computeNextMonthDue(order) {
//   const isMonthly = String(order.tenureUnit || '').toLowerCase() === 'month';
//   const currentPaid = Number(order.monthsPaid || 1);
//   const totalMonths = Number(order.rentalDuration || 1);
//   const nextMonth = currentPaid + 1; // 1-indexed month about to be paid

//   if (!isMonthly || currentPaid >= totalMonths) {
//     return { eligible: false, isMonthly, currentPaid, totalMonths, nextMonth };
//   }

//   // Due date for month N is (N-1) calendar months after order creation.
//   const dueDate = new Date(order.createdAt);
//   dueDate.setMonth(dueDate.getMonth() + (nextMonth - 1));
//   dueDate.setHours(0, 0, 0, 0);

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const daysLate = Math.max(
//     0,
//     Math.round((today - dueDate) / (1000 * 60 * 60 * 24)),
//   );

//   const firstLine = (order.products || [])[0] || {};
//   const baseAmount =
//     (Number(firstLine.pricePerDay || 0) * Number(firstLine.quantity || 1)) /
//     totalMonths;

//   const lateFeeAmount = daysLate * LATE_FEE_PER_DAY;

//   return {
//     eligible: true,
//     isMonthly,
//     currentPaid,
//     totalMonths,
//     nextMonth,
//     dueDate,
//     daysLate,
//     baseAmount: Math.round(baseAmount),
//     lateFeeAmount,
//     totalAmount: Math.round(baseAmount) + lateFeeAmount,
//   };
// }

// function computeNextMonthDue(order, productId) {
//   const isMonthly = String(order.tenureUnit || '').toLowerCase() === 'month';
//   const currentPaid = Number(order.monthsPaid || 1);
//   const totalMonths = Number(order.rentalDuration || 1);
//   const nextMonth = currentPaid + 1; // 1-indexed month about to be paid

//   if (!isMonthly || currentPaid >= totalMonths) {
//     return { eligible: false, isMonthly, currentPaid, totalMonths, nextMonth };
//   }

//   // Due date for month N is (N-1) calendar months after order creation.
//   const dueDate = new Date(order.createdAt);
//   dueDate.setMonth(dueDate.getMonth() + (nextMonth - 1));
//   dueDate.setHours(0, 0, 0, 0);

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const daysLate = Math.max(
//     0,
//     Math.round((today - dueDate) / (1000 * 60 * 60 * 24)),
//   );

//   // Find the specific product line this payment is for. Falls back to the
//   // first Rental line if no productId is given (keeps old callers working),
//   // but for multi-product orders the caller should always pass productId.
//   const products = order.products || [];
//   const matchedLine = productId
//     ? products.find((p) => String(p.product) === String(productId))
//     : products.find(
//         (p) => String(p.productType || 'Rental').toLowerCase() === 'rental',
//       );
//   const line = matchedLine || products[0] || {};

//   const baseAmount =
//     (Number(line.pricePerDay || 0) * Number(line.quantity || 1)) / totalMonths;

//   const lateFeeAmount = daysLate * LATE_FEE_PER_DAY;

//   return {
//     eligible: true,
//     isMonthly,
//     currentPaid,
//     totalMonths,
//     nextMonth,
//     dueDate,
//     daysLate,
//     baseAmount: Math.round(baseAmount),
//     lateFeeAmount,
//     totalAmount: Math.round(baseAmount) + lateFeeAmount,
//   };
// }

// function computeNextMonthDue(order, productId) {
//   // const isMonthly = String(order.tenureUnit || '').toLowerCase() === 'month';
//   // const totalMonths = Number(order.rentalDuration || 1);

//   // // Find the specific product line this payment is for. Falls back to the
//   // // first Rental line if no productId is given (keeps old single-product
//   // // callers working), but multi-product orders must always pass productId.
//   // const products = order.products || [];
//   // const matchedLine = productId
//   //   ? products.find((p) => String(p.product) === String(productId))
//   //   : products.find(
//   //       (p) => String(p.productType || 'Rental').toLowerCase() === 'rental',
//   //     );
//   // const line = matchedLine || products[0] || {};
//   const isMonthly = String(order.tenureUnit || '').toLowerCase() === 'month';

//   // Find the specific product line this payment is for. Falls back to the
//   // first Rental line if no productId is given (keeps old single-product
//   // callers working), but multi-product orders must always pass productId.
//   const products = order.products || [];
//   const matchedLine = productId
//     ? products.find((p) => String(p.product) === String(productId))
//     : products.find(
//         (p) => String(p.productType || 'Rental').toLowerCase() === 'rental',
//       );
//   const line = matchedLine || products[0] || {};

//   // Use THIS line's own rentalDuration (set when the user extends this
//   // specific product's tenure) instead of the shared order-level value —
//   // otherwise, after extending one product, totalMonths stays stuck at
//   // the original tenure and blocks further payments ("All months are
//   // already paid.") even though the line itself was extended.
//   const totalMonths = Number(line.rentalDuration ?? order.rentalDuration ?? 1);

//   // Per-line tracking (new) — falls back to order-level fields only for
//   // pre-existing single-product orders that haven't been touched since
//   // this line field was introduced.
//   const currentPaid = Number(line.monthsPaid ?? order.monthsPaid ?? 1);
//   const nextMonth = currentPaid + 1; // 1-indexed month about to be paid

//   if (!isMonthly || currentPaid >= totalMonths) {
//     return { eligible: false, isMonthly, currentPaid, totalMonths, nextMonth };
//   }

//   // Due date for month N is (N-1) calendar months after order creation.
//   const dueDate = new Date(order.createdAt);
//   dueDate.setMonth(dueDate.getMonth() + (nextMonth - 1));
//   dueDate.setHours(0, 0, 0, 0);

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   // const daysLate = Math.max(
//   //   0,
//   //   Math.round((today - dueDate) / (1000 * 60 * 60 * 24)),
//   // );
//   const daysLate = Math.max(
//     0,
//     Math.round((today - dueDate) / (1000 * 60 * 60 * 24)),
//   );

//   // Subtract any admin-granted waiver for THIS specific upcoming month
//   // (stored on the line since no monthlyPayments record exists until the
//   // month is actually paid). Never goes below 0.
//   const waivedForThisMonth = (line.pendingLateFeeWaivers || [])
//     .filter((w) => Number(w.month) === nextMonth)
//     .reduce((sum, w) => sum + Number(w.waiverAmount || 0), 0);

//   //   const baseAmount = Number(line.pricePerDay || 0) * Number(line.quantity || 1);

//   //   const lateFeeAmount = daysLate * LATE_FEE_PER_DAY;

//   //   return {
//   //     eligible: true,
//   //     isMonthly,
//   //     currentPaid,
//   //     totalMonths,
//   //     nextMonth,
//   //     dueDate,
//   //     daysLate,
//   //     baseAmount: Math.round(baseAmount),
//   //     lateFeeAmount,
//   //     totalAmount: Math.round(baseAmount) + lateFeeAmount,
//   //   };
//   // }

//   const baseAmount = Number(line.pricePerDay || 0) * Number(line.quantity || 1);

//   // const lateFeeAmount = Math.max(
//   //   0,
//   //   daysLate * LATE_FEE_PER_DAY - waivedForThisMonth,
//   // );
//   const grossLateFeeAmount = daysLate * LATE_FEE_PER_DAY;
//   const lateFeeAmount = Math.max(0, grossLateFeeAmount - waivedForThisMonth);

//   // GST/Care Protection were stored as ONE flat total for the whole

//   // GST/Care Protection were stored as ONE flat total for the whole
//   // tenure at checkout. Spread that same total evenly across all months
//   // so each monthly payment (month 1 at checkout, month 2+ here) carries
//   // its proportional share — total collected across the tenure still
//   // equals order.gst / order.careProtection exactly.
//   const gstAmount = Math.round(Number(order.gst || 0) / totalMonths);
//   const careTaxAmount = Math.round(
//     Number(order.careProtection || 0) / totalMonths,
//   );

//   //   return {
//   //     eligible: true,
//   //     isMonthly,
//   //     currentPaid,
//   //     totalMonths,
//   //     nextMonth,
//   //     dueDate,
//   //     daysLate,
//   //     baseAmount: Math.round(baseAmount),
//   //     lateFeeAmount,
//   //     gstAmount,
//   //     careTaxAmount,
//   //     totalAmount:
//   //       Math.round(baseAmount) + lateFeeAmount + gstAmount + careTaxAmount,
//   //   };
//   // }

//   return {
//     eligible: true,
//     isMonthly,
//     currentPaid,
//     totalMonths,
//     nextMonth,
//     dueDate,
//     daysLate,
//     baseAmount: Math.round(baseAmount),
//     lateFeeAmount,
//     grossLateFeeAmount,
//     gstAmount,
//     careTaxAmount,
//     totalAmount:
//       Math.round(baseAmount) + lateFeeAmount + gstAmount + careTaxAmount,
//   };
// }

function computeNextMonthDue(order, productId) {
  // const isMonthly = String(order.tenureUnit || '').toLowerCase() === 'month';
  // const totalMonths = Number(order.rentalDuration || 1);

  // // Find the specific product line this payment is for. Falls back to the
  // // first Rental line if no productId is given (keeps old single-product
  // // callers working), but multi-product orders must always pass productId.
  // const products = order.products || [];
  // const matchedLine = productId
  //   ? products.find((p) => String(p.product) === String(productId))
  //   : products.find(
  //       (p) => String(p.productType || 'Rental').toLowerCase() === 'rental',
  //     );
  // const line = matchedLine || products[0] || {};
  const isMonthly = String(order.tenureUnit || '').toLowerCase() === 'month';

  // Find the specific product line this payment is for. Falls back to the
  // first Rental line if no productId is given (keeps old single-product
  // callers working), but multi-product orders must always pass productId.
  const products = order.products || [];
  const matchedLine = productId
    ? products.find((p) => String(p.product) === String(productId))
    : products.find(
        (p) => String(p.productType || 'Rental').toLowerCase() === 'rental',
      );
  const line = matchedLine || products[0] || {};

  // Use THIS line's own rentalDuration (set when the user extends this
  // specific product's tenure) instead of the shared order-level value —
  // otherwise, after extending one product, totalMonths stays stuck at
  // the original tenure and blocks further payments ("All months are
  // already paid.") even though the line itself was extended.
  const totalMonths = Number(line.rentalDuration ?? order.rentalDuration ?? 1);

  // Per-line tracking (new) — falls back to order-level fields only for
  // pre-existing single-product orders that haven't been touched since
  // this line field was introduced.
  const currentPaid = Number(line.monthsPaid ?? order.monthsPaid ?? 1);
  const nextMonth = currentPaid + 1; // 1-indexed month about to be paid

  if (!isMonthly || currentPaid >= totalMonths) {
    return { eligible: false, isMonthly, currentPaid, totalMonths, nextMonth };
  }

  // Due date for month N is (N-1) calendar months after order creation.
  const dueDate = new Date(order.createdAt);
  dueDate.setMonth(dueDate.getMonth() + (nextMonth - 1));
  dueDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // const daysLate = Math.max(
  //   0,
  //   Math.round((today - dueDate) / (1000 * 60 * 60 * 24)),
  // );
  const daysLate = Math.max(
    0,
    Math.round((today - dueDate) / (1000 * 60 * 60 * 24)),
  );

  // Subtract any admin-granted waiver for THIS specific upcoming month
  // (stored on the line since no monthlyPayments record exists until the
  // month is actually paid). Never goes below 0.
  const waivedForThisMonth = (line.pendingLateFeeWaivers || [])
    .filter((w) => Number(w.month) === nextMonth)
    .reduce((sum, w) => sum + Number(w.waiverAmount || 0), 0);

  //   const baseAmount = Number(line.pricePerDay || 0) * Number(line.quantity || 1);

  //   const lateFeeAmount = daysLate * LATE_FEE_PER_DAY;

  //   return {
  //     eligible: true,
  //     isMonthly,
  //     currentPaid,
  //     totalMonths,
  //     nextMonth,
  //     dueDate,
  //     daysLate,
  //     baseAmount: Math.round(baseAmount),
  //     lateFeeAmount,
  //     totalAmount: Math.round(baseAmount) + lateFeeAmount,
  //   };
  // }

  // Rentomojo-style segments: if `nextMonth` falls inside an extension
  // segment, bill at THAT segment's own tax-inclusive rate instead of
  // the original line.pricePerDay + flat-spread order tax. Original
  // months (no matching segment) keep the old flat-spread behavior
  // exactly as before — fully backward compatible with pre-extension
  // orders and lines that have never been extended.
  const extensions = Array.isArray(line.extensions) ? line.extensions : [];
  const matchingSegment = extensions.find(
    (ext) => nextMonth >= ext.startMonth && nextMonth <= ext.endMonth,
  );

  let baseAmount;
  let gstAmount;
  let careTaxAmount;

  if (matchingSegment) {
    const qty = Number(line.quantity || 1);
    baseAmount = Math.round(Number(matchingSegment.monthlyBaseRate || 0) * qty);
    const taxPortion = Math.max(
      0,
      Number(matchingSegment.monthlyRateWithTax || 0) -
        Number(matchingSegment.monthlyBaseRate || 0),
    );
    // Split the segment's combined tax portion proportionally between
    // GST and Care Tax using this order's own gst:careProtection ratio,
    // so downstream breakdowns (mobile tax-summary dropdown, invoices)
    // still show two separate line items instead of one lump sum.
    const gstShareOfTax =
      Number(order.gst || 0) + Number(order.careProtection || 0) > 0
        ? Number(order.gst || 0) /
          (Number(order.gst || 0) + Number(order.careProtection || 0))
        : 0.5;
    gstAmount = Math.round(taxPortion * qty * gstShareOfTax);
    careTaxAmount = Math.round(taxPortion * qty * (1 - gstShareOfTax));
  } else {
    baseAmount = Number(line.pricePerDay || 0) * Number(line.quantity || 1);
    // GST/Care Protection were stored as ONE flat total for the whole
    // ORIGINAL tenure at checkout. Spread that same total evenly across
    // the original months only (originalRentalDuration), not the full
    // extended totalMonths — otherwise adding an extension would dilute
    // the original months' tax share incorrectly.
    const originalMonths = Math.max(
      1,
      Number(
        line.originalRentalDuration ??
          order.originalRentalDuration ??
          totalMonths,
      ),
    );
    gstAmount = Math.round(Number(order.gst || 0) / originalMonths);
    careTaxAmount = Math.round(
      Number(order.careProtection || 0) / originalMonths,
    );
  }

  const grossLateFeeAmount = daysLate * LATE_FEE_PER_DAY;
  const lateFeeAmount = Math.max(0, grossLateFeeAmount - waivedForThisMonth);

  //   return {
  //     eligible: true,
  //     isMonthly,
  //     currentPaid,
  //     totalMonths,
  //     nextMonth,
  //     dueDate,
  //     daysLate,
  //     baseAmount: Math.round(baseAmount),
  //     lateFeeAmount,
  //     gstAmount,
  //     careTaxAmount,
  //     totalAmount:
  //       Math.round(baseAmount) + lateFeeAmount + gstAmount + careTaxAmount,
  //   };
  // }

  return {
    eligible: true,
    isMonthly,
    currentPaid,
    totalMonths,
    nextMonth,
    dueDate,
    daysLate,
    baseAmount: Math.round(baseAmount),
    lateFeeAmount,
    grossLateFeeAmount,
    gstAmount,
    careTaxAmount,
    totalAmount:
      Math.round(baseAmount) + lateFeeAmount + gstAmount + careTaxAmount,
  };
}

// GET /orders/:orderId/next-month-due
// export const getNextMonthDue = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     const info = computeNextMonthDue(order);
//     if (!info.eligible) {
//       return res.status(400).json({
//         message: !info.isMonthly
//           ? 'This order is not a monthly rental.'
//           : 'All months are already paid.',
//       });
//     }

//     return res.json(info);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// GET /orders/:orderId/next-month-due?productId=...
export const getNextMonthDue = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId } = req.query;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const info = computeNextMonthDue(order, productId);
    if (!info.eligible) {
      return res.status(400).json({
        message: !info.isMonthly
          ? 'This order is not a monthly rental.'
          : 'All months are already paid.',
      });
    }

    return res.json(info);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /orders/:orderId/pay-next-month
// export const payNextMonth = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { productId } = req.body || {};
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     const info = computeNextMonthDue(order, productId);
//     if (!info.eligible) {
//       return res.status(400).json({
//         message: !info.isMonthly
//           ? 'This order is not a monthly rental.'
//           : 'All months are already paid.',
//       });
//     }

//     order.monthsPaid = info.nextMonth;
//     order.lateFeesCollected =
//       Number(order.lateFeesCollected || 0) + info.lateFeeAmount;
//     order.monthlyPayments = order.monthlyPayments || [];
//     order.monthlyPayments.push({
//       month: info.nextMonth,
//       baseAmount: info.baseAmount,
//       lateFeeAmount: info.lateFeeAmount,
//       daysLate: info.daysLate,
//       paidAt: new Date(),
//     });
//     await order.save();

//     return res.json({
//       monthsPaid: order.monthsPaid,
//       rentalDuration: info.totalMonths,
//       baseAmount: info.baseAmount,
//       lateFeeAmount: info.lateFeeAmount,
//       totalAmount: info.totalAmount,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// POST /orders/:orderId/pay-next-month
export const payNextMonth = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId } = req.body || {};
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const info = computeNextMonthDue(order, productId);
    if (!info.eligible) {
      return res.status(400).json({
        message: !info.isMonthly
          ? 'This order is not a monthly rental.'
          : 'All months are already paid.',
      });
    }

    // Locate the exact subdocument to update — must match the same line
    // computeNextMonthDue resolved above, so the payment lands on the
    // correct product, not the whole order.
    const products = order.products || [];
    const lineDoc = productId
      ? products.find((p) => String(p.product) === String(productId))
      : products.find(
          (p) => String(p.productType || 'Rental').toLowerCase() === 'rental',
        ) || products[0];

    if (!lineDoc) {
      return res
        .status(400)
        .json({ message: 'Product line not found on this order.' });
    }

    // lineDoc.monthsPaid = info.nextMonth;
    // lineDoc.lateFeesCollected =
    //   Number(lineDoc.lateFeesCollected || 0) + info.lateFeeAmount;
    // lineDoc.monthlyPayments = lineDoc.monthlyPayments || [];
    // lineDoc.monthlyPayments.push({
    //   month: info.nextMonth,
    //   baseAmount: info.baseAmount,
    //   lateFeeAmount: info.lateFeeAmount,
    //   daysLate: info.daysLate,
    //   paidAt: new Date(),
    // });

    // await order.save();

    // return res.json({
    //   monthsPaid: lineDoc.monthsPaid,
    //   rentalDuration: info.totalMonths,
    //   baseAmount: info.baseAmount,
    //   lateFeeAmount: info.lateFeeAmount,
    //   totalAmount: info.totalAmount,
    // });

    lineDoc.monthsPaid = info.nextMonth;
    lineDoc.lateFeesCollected =
      Number(lineDoc.lateFeesCollected || 0) + info.lateFeeAmount;
    lineDoc.monthlyPayments = lineDoc.monthlyPayments || [];
    lineDoc.monthlyPayments.push({
      month: info.nextMonth,
      baseAmount: info.baseAmount,
      lateFeeAmount: info.lateFeeAmount,
      gstAmount: info.gstAmount,
      careTaxAmount: info.careTaxAmount,
      daysLate: info.daysLate,
      paidAt: new Date(),
    });

    await order.save();

    return res.json({
      monthsPaid: lineDoc.monthsPaid,
      rentalDuration: info.totalMonths,
      baseAmount: info.baseAmount,
      lateFeeAmount: info.lateFeeAmount,
      gstAmount: info.gstAmount,
      careTaxAmount: info.careTaxAmount,
      totalAmount: info.totalAmount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
