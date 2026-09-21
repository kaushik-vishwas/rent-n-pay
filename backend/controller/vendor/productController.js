// import Product from '../../models/Product.js';
// import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';
// import VendorKyc from '../../models/VendorKyc.js';
// import StockNotify from '../../models/StockNotify.js';

// const parseJsonField = (value, fallback) => {
//   if (!value) return fallback;
//   if (typeof value === 'object') return value;
//   try {
//     return JSON.parse(value);
//   } catch {
//     return fallback;
//   }
// };

// const toNumber = (value, fallback = 0) => {
//   const n = Number(value);
//   return Number.isFinite(n) ? n : fallback;
// };

// const deriveStockStatus = (stock) => {
//   const s = toNumber(stock, 0);
//   if (s <= 0) return 'Out of Stock';
//   if (s <= 5) return 'Low Stock';
//   return 'Active';
// };

// const normalizeVariants = (variantsRaw) => {
//   const arr = Array.isArray(variantsRaw) ? variantsRaw : [];
//   return arr.map((v) => ({
//     variantName: String(v?.variantName || '').trim(),
//     color: String(v?.color || '').trim(),
//     storage: String(v?.storage || '').trim(),
//     ram: String(v?.ram || '').trim(),
//     condition: String(v?.condition || '').trim(),
//     price: String(v?.price || '').trim(),
//     stock: toNumber(v?.stock, 0),
//     variantSpecs: Array.isArray(v?.variantSpecs)
//       ? v.variantSpecs
//           .filter((r) => String(r?.label || '').trim())
//           .map((r) => ({
//             label: String(r.label || '').trim(),
//             value: String(r.value ?? '').trim(),
//           }))
//       : [],
//   }));
// };

// const normalizeRentalConfigurations = (raw) => {
//   const arr = Array.isArray(raw) ? raw : [];
//   return arr.map((cfg) => ({
//     months: toNumber(cfg?.months, 1),
//     days: toNumber(cfg?.days, 0),
//     periodUnit: ['month', 'day'].includes(cfg?.periodUnit)
//       ? cfg.periodUnit
//       : 'month',
//     label: String(cfg?.label || '').trim(),
//     pricePerDay: toNumber(cfg?.pricePerDay, 0),
//     shippingCharges: toNumber(cfg?.shippingCharges, 0),
//     customerRent: toNumber(cfg?.customerRent, 0),
//   }));
// };

// const normalizeLogisticsVerification = (raw) => {
//   const o = raw && typeof raw === 'object' ? raw : {};
//   return {
//     inventoryOwnerName: String(o.inventoryOwnerName || '').trim(),
//     city: String(o.city || '').trim(),
//     deliveryTimelineValue: toNumber(o.deliveryTimelineValue, 0),
//     deliveryTimelineUnit:
//       String(o.deliveryTimelineUnit || 'Days').trim() || 'Days',
//   };
// };

// const normalizeProductPayload = (body) => {
//   const data = { ...body };
//   data.type = body.type === 'Sell' ? 'Sell' : 'Rental';
//   data.specifications = parseJsonField(body.specifications, {});
//   data.variants = normalizeVariants(parseJsonField(body.variants, []));
//   data.rentalConfigurations = normalizeRentalConfigurations(
//     parseJsonField(body.rentalConfigurations, []),
//   );
//   const salesConfigurationRaw = parseJsonField(body.salesConfiguration, {});
//   data.salesConfiguration = {
//     allowVendorEditSalePrice:
//       salesConfigurationRaw?.allowVendorEditSalePrice === false ||
//       salesConfigurationRaw?.allowVendorEditSalePrice === 'false'
//         ? false
//         : true,
//     salePrice: toNumber(
//       salesConfigurationRaw?.salePrice,
//       toNumber(body.price, 0),
//     ),
//     mrpPrice: toNumber(salesConfigurationRaw?.mrpPrice, 0),
//   };
//   data.refundableDeposit = toNumber(body.refundableDeposit, 0);
//   data.logisticsVerification = normalizeLogisticsVerification(
//     parseJsonField(body.logisticsVerification, {}),
//   );
//   data.existingImages = parseJsonField(body.existingImages, []);
//   data.stock = toNumber(body.stock, 0);
//   data.status = deriveStockStatus(data.stock);
//   // Creation metadata (optional; forwarded from frontend when available)
//   if (body.createdVia === 'manual' || body.createdVia === 'template') {
//     data.createdVia = body.createdVia;
//   }
//   if (
//     body.allowVendorEditRentalPrices === true ||
//     body.allowVendorEditRentalPrices === 'true'
//   ) {
//     data.allowVendorEditRentalPrices = true;
//   }
//   const subs = ['draft', 'pending_approval', 'published'];
//   data.submissionStatus = subs.includes(body.submissionStatus)
//     ? body.submissionStatus
//     : 'draft';
//   return data;
// };

// export const createProduct = async (req, res) => {
//   try {
//     console.log('Vendor:', req.vendor);

//     const vendorKyc = await VendorKyc.findOne({ vendorId: req.vendor._id });
//     if (!vendorKyc || vendorKyc.status !== 'approved') {
//       return res.status(403).json({
//         message:
//           'KYC not approved yet. Complete KYC and wait for admin approval before adding products.',
//       });
//     }

//     const data = normalizeProductPayload(req.body);
//     const uploadedImages = [];

//     if (Array.isArray(req.files) && req.files.length > 0) {
//       for (const file of req.files.slice(0, 10)) {
//         const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
//         uploadedImages.push(imgRes.secure_url);
//       }
//     } else if (req.file) {
//       const imgRes = await uploadImageToCloudinary(req.file.buffer, 'products');
//       uploadedImages.push(imgRes.secure_url);
//     }

//     const keptExisting =
//       Array.isArray(data.existingImages) && data.existingImages.length > 0
//         ? data.existingImages.filter(Boolean).slice(0, 10)
//         : [];

//     if (uploadedImages.length > 0) {
//       data.images = [...keptExisting, ...uploadedImages].slice(0, 10);
//       data.image = data.images[0];
//     } else if (keptExisting.length > 0) {
//       data.images = keptExisting;
//       data.image = data.images[0];
//     } else if (Array.isArray(data.images) && data.images.length > 0) {
//       data.image = data.images[0];
//     }

//     if (!data.image) {
//       if (data.submissionStatus === 'draft') {
//         const ph = 'https://placehold.co/400x400/e5e7eb/6b7280?text=Draft';
//         data.image = ph;
//         data.images = [ph];
//       } else {
//         return res
//           .status(400)
//           .json({ message: 'At least one image is required' });
//       }
//     }

//     // delete data.existingImages;
//     // delete data.adminListingEnabled;
//     // delete data.vendorListingEnabled;

//     // if (data.submissionStatus === 'published') {
//     //   data.submissionStatus = 'pending_approval';
//     // }
//     // data.isAdminApproved = false;
//     // data.adminApprovedAt = null;
//     // data.adminApprovedBy = null;

//     // const product = await Product.create({
//     //   ...data,
//     //   vendorId: req.vendor._id,
//     // });
//     delete data.existingImages;
//     delete data.adminListingEnabled;
//     delete data.vendorListingEnabled;

//     if (data.submissionStatus === 'published') {
//       data.submissionStatus = 'pending_approval';
//     }
//     data.isAdminApproved = false;
//     data.adminApprovedAt = null;
//     data.adminApprovedBy = null;

//     // Auto-fill logistics city from the vendor's own city if the form left it blank
//     // AFTER
//     // Auto-fill city from vendor's default active KYC store mapAddress
//     const defaultStore =
//       vendorKyc.storeManagement?.stores?.find(
//         (s) => s.isDefault && s.isActive,
//       ) || vendorKyc.storeManagement?.stores?.find((s) => s.isActive);

//     // const vendorCityFromKyc =
//     //   defaultStore?.mapAddress
//     //     ?.split(',')
//     //     ?.slice(-3, -2)?.[0]
//     //     ?.trim()
//     //     ?.toLowerCase() || '';
//     // AFTER
//     const vendorCityFromKyc =
//       defaultStore?.mapAddress?.split(',')?.[0]?.trim()?.toLowerCase() || '';

//     if (!data.logisticsVerification?.city) {
//       data.logisticsVerification = {
//         ...(data.logisticsVerification || {}),
//         city: vendorCityFromKyc,
//       };
//     }

//     const product = await Product.create({
//       ...data,
//       vendorId: req.vendor._id,
//       city: data.logisticsVerification?.city || vendorCityFromKyc || '',
//     });

//     // res.status(201).json({
//     //   message: 'Product created',
//     //   product,
//     // });
//     // AFTER
//     // const product = await Product.create({
//     //   ...data,
//     //   vendorId: req.vendor._id,
//     //   city: data.logisticsVerification?.city || '',
//     // });

//     res.status(201).json({
//       message: 'Product created',
//       product,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getMyProducts = async (req, res) => {
//   try {
//     const products = await Product.find({
//       vendorId: req.vendor._id,
//     }).sort({ createdAt: -1 });

//     res.status(200).json({ products });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = normalizeProductPayload(req.body);
//     const existing = await Product.findOne({
//       _id: id,
//       vendorId: req.vendor._id,
//     });

//     if (!existing) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     const uploadedImages = [];
//     if (Array.isArray(req.files) && req.files.length > 0) {
//       for (const file of req.files.slice(0, 10)) {
//         const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
//         uploadedImages.push(imgRes.secure_url);
//       }
//     } else if (req.file) {
//       const imgRes = await uploadImageToCloudinary(req.file.buffer, 'products');
//       uploadedImages.push(imgRes.secure_url);
//     }

//     const keptExistingImages = Array.isArray(data.existingImages)
//       ? data.existingImages.filter(Boolean)
//       : Array.isArray(existing.images)
//         ? existing.images
//         : existing.image
//           ? [existing.image]
//           : [];
//     const mergedImages = [...keptExistingImages, ...uploadedImages].slice(
//       0,
//       10,
//     );
//     data.images = mergedImages;
//     data.image = mergedImages[0];

//     // if (!data.image) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: 'At least one image is required for the product.' });
//     // }
//     if (!data.image) {
//       data.image = existing.image;
//       data.images = existing.images || [existing.image];
//     }

//     delete data.existingImages;
//     delete data.adminListingEnabled;
//     delete data.vendorListingEnabled;

//     // Until admin approves at least once, vendors cannot force storefront publish.
//     if (data.submissionStatus === 'published' && !existing.isAdminApproved) {
//       data.submissionStatus = 'pending_approval';
//     }

//     // const product = await Product.findOneAndUpdate(
//     //   { _id: id, vendorId: req.vendor._id },
//     //   data,
//     //   { new: true },
//     // );

//     // res.status(200).json({
//     //   message: 'Updated successfully',
//     //   product,
//     // });
//     const previousStock = existing.stock ?? 0;

//     // const product = await Product.findOneAndUpdate(
//     //   { _id: id, vendorId: req.vendor._id },
//     //   data,
//     //   { new: true },
//     // );

//     // const product = await Product.findOneAndUpdate(
//     //   { _id: id, vendorId: req.vendor._id },
//     //   { ...data, city: data.logisticsVerification?.city || '' },
//     //   { new: true },
//     // );
//     // AFTER
//     const kycForUpdate = await VendorKyc.findOne({ vendorId: req.vendor._id });
//     const defaultStoreForUpdate =
//       kycForUpdate?.storeManagement?.stores?.find(
//         (s) => s.isDefault && s.isActive,
//       ) ||
//       kycForUpdate?.storeManagement?.stores?.find((s) => s.isActive) ||
//       kycForUpdate?.storeManagement?.stores?.[0];
//     // const parts = (defaultStoreForUpdate?.mapAddress || '')
//     //   .split(',')
//     //   .map((x) => x.trim())
//     //   .filter(Boolean);
//     // const cityForUpdate =
//     //   parts.length >= 3
//     //     ? parts[parts.length - 3].toLowerCase()
//     //     : (parts[0] || '').toLowerCase();
//     // AFTER
//     const cityForUpdate =
//       (defaultStoreForUpdate?.mapAddress || '')
//         .split(',')?.[0]
//         ?.trim()
//         ?.toLowerCase() || '';

//     const product = await Product.findOneAndUpdate(
//       { _id: id, vendorId: req.vendor._id },
//       {
//         ...data,
//         city: data.logisticsVerification?.city || cityForUpdate || '',
//       },
//       { new: true },
//     );

//     // If product was out of stock and now has stock → notify waiting users
//     const newStock = product.stock ?? 0;
//     if (previousStock <= 0 && newStock > 0) {
//       await StockNotify.updateMany(
//         { productId: product._id, notified: false },
//         { $set: { notified: true, updatedAt: new Date() } },
//       ).catch(() => {}); // don't fail the update if notify fails
//     }

//     res.status(200).json({
//       message: 'Updated successfully',
//       product,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const patchVendorProductListingVisibility = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const raw = req.body?.vendorListingEnabled;
//     const vendorListingEnabled = raw === true || raw === 'true';

//     const product = await Product.findOne({
//       _id: id,
//       vendorId: req.vendor._id,
//     });
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     if (!product.isAdminApproved) {
//       return res.status(400).json({
//         message: 'This listing is pending admin approval.',
//       });
//     }
//     if (product.submissionStatus !== 'published') {
//       return res.status(400).json({
//         message:
//           'Only published listings can be shown or hidden on the website.',
//       });
//     }

//     product.vendorListingEnabled = vendorListingEnabled;
//     await product.save();

//     return res.status(200).json({
//       message: 'Storefront visibility updated.',
//       product,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findOneAndDelete({
//       _id: id,
//       vendorId: req.vendor._id,
//     });

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json({
//       message: 'Deleted successfully',
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id).populate(
//       'vendorId',
//       'fullName emailAddress',
//     );

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json({ product });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// function pickProductRentalConfigurations(product) {
//   const top = product?.rentalConfigurations;
//   if (Array.isArray(top) && top.length) return top;
//   const v0 = product?.variants?.[0];
//   if (
//     Array.isArray(v0?.rentalConfigurations) &&
//     v0.rentalConfigurations.length
//   ) {
//     return v0.rentalConfigurations;
//   }
//   return [];
// }

// function tierRentAmount(cfg) {
//   const n = (k) => {
//     const v = Number(String(cfg?.[k] ?? '').replace(/,/g, ''));
//     return Number.isFinite(v) && v > 0 ? v : 0;
//   };
//   return n('customerRent') || n('pricePerDay') || n('vendorRent') || 0;
// }

// /**
//  * Lowest per-month / per-day rate by tenure across other vendors’ rental listings
//  * (excludes current vendor). Used in manual product modal “Market low”.
//  */
// export const getMarketLowRentalTenures = async (req, res) => {
//   try {
//     const category = String(req.query.category || '').trim();
//     const subCategory = String(req.query.subCategory || '').trim();
//     const vendorId = req.vendor._id;

//     const baseQuery = {
//       type: 'Rental',
//       submissionStatus: 'published',
//       isAdminApproved: { $ne: false },
//       adminListingEnabled: { $ne: false },
//       vendorListingEnabled: { $ne: false },
//       vendorId: { $ne: vendorId },
//     };

//     const narrowQuery = { ...baseQuery };
//     if (category) narrowQuery.category = category;
//     if (subCategory) narrowQuery.subCategory = subCategory;

//     let products = await Product.find(narrowQuery)
//       .select('rentalConfigurations variants')
//       .lean();

//     if ((!products || products.length === 0) && category && subCategory) {
//       products = await Product.find({
//         ...baseQuery,
//         category,
//       })
//         .select('rentalConfigurations variants')
//         .lean();
//     }

//     if (!products || products.length === 0) {
//       products = await Product.find(baseQuery)
//         .select('rentalConfigurations variants')
//         .lean();
//     }

//     const monthMin = {};
//     const dayMin = {};

//     for (const p of products) {
//       const configs = pickProductRentalConfigurations(p);
//       for (const cfg of configs) {
//         const periodUnit = cfg?.periodUnit === 'day' ? 'day' : 'month';
//         const amt = tierRentAmount(cfg);
//         if (!amt || amt <= 0) continue;

//         if (periodUnit === 'day') {
//           const days = Number(cfg?.days) || 0;
//           if (days <= 0) continue;
//           const perDay = amt / days;
//           const prev = dayMin[days];
//           if (prev == null || perDay < prev) dayMin[days] = perDay;
//         } else {
//           const months = Number(cfg?.months) || 0;
//           if (months <= 0) continue;
//           const perMonth = amt / months;
//           const prev = monthMin[months];
//           if (prev == null || perMonth < prev) monthMin[months] = perMonth;
//         }
//       }
//     }

//     const roundMap = (obj) => {
//       const out = {};
//       for (const k of Object.keys(obj)) {
//         out[String(k)] = Math.round(obj[k]);
//       }
//       return out;
//     };

//     res.json({
//       month: roundMap(monthMin),
//       day: roundMap(dayMin),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import SubCategory from '../../models/SubCategory.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';
import VendorKyc from '../../models/VendorKyc.js';
import StockNotify from '../../models/StockNotify.js';

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const deriveStockStatus = (stock) => {
  const s = toNumber(stock, 0);
  if (s <= 0) return 'Out of Stock';
  if (s <= 5) return 'Low Stock';
  return 'Active';
};

// const normalizeVariants = (variantsRaw) => {
//   const arr = Array.isArray(variantsRaw) ? variantsRaw : [];
//   return arr.map((v) => ({
//     variantName: String(v?.variantName || '').trim(),
//     color: String(v?.color || '').trim(),
//     storage: String(v?.storage || '').trim(),
//     ram: String(v?.ram || '').trim(),
//     condition: String(v?.condition || '').trim(),
//     price: String(v?.price || '').trim(),
//     stock: toNumber(v?.stock, 0),
//     variantSpecs: Array.isArray(v?.variantSpecs)
//       ? v.variantSpecs
//           .filter((r) => String(r?.label || '').trim())
//           .map((r) => ({
//             label: String(r.label || '').trim(),
//             value: String(r.value ?? '').trim(),
//           }))
//       : [],
//   }));
// };

const normalizeVariants = (variantsRaw) => {
  const arr = Array.isArray(variantsRaw) ? variantsRaw : [];
  return arr.map((v) => ({
    variantName: String(v?.variantName || '').trim(),
    color: String(v?.color || '').trim(),
    storage: String(v?.storage || '').trim(),
    ram: String(v?.ram || '').trim(),
    condition: String(v?.condition || '').trim(),
    price: String(v?.price || '').trim(),
    stock: toNumber(v?.stock, 0),
    // Per-variant sell pricing (custom/manual sell listings only; harmless
    // 0-default for rental/template variants that never send these).
    sellPrice: toNumber(v?.sellPrice, 0),
    mrpPrice: toNumber(v?.mrpPrice, 0),
    // Per-variant rental tenure pricing (custom/manual rent listings only;
    // empty array default for sell/template variants that never send this).
    rentalConfigurations: normalizeRentalConfigurations(
      v?.rentalConfigurations,
    ),
    // Preserve this variant's own saved images through normalization —
    // without this, every variant's images array was silently dropped here,
    // then only the variant that received a brand-new upload got its
    // images array repopulated (by the controller's per-variant merge),
    // wiping out all other variants' existing images on every update.
    images: Array.isArray(v?.images)
      ? v.images.filter(Boolean).map((x) => String(x))
      : [],
    variantSpecs: Array.isArray(v?.variantSpecs)
      ? v.variantSpecs
          .filter((r) => String(r?.label || '').trim())
          .map((r) => ({
            label: String(r.label || '').trim(),
            value: String(r.value ?? '').trim(),
          }))
      : [],
  }));
};

// const normalizeRentalConfigurations = (raw) => {
//   const arr = Array.isArray(raw) ? raw : [];
//   return arr.map((cfg) => ({
//     months: toNumber(cfg?.months, 1),
//     days: toNumber(cfg?.days, 0),
//     periodUnit: ['month', 'day'].includes(cfg?.periodUnit)
//       ? cfg.periodUnit
//       : 'month',
//     label: String(cfg?.label || '').trim(),
//     pricePerDay: toNumber(cfg?.pricePerDay, 0),
//     shippingCharges: toNumber(cfg?.shippingCharges, 0),
//     customerRent: toNumber(cfg?.customerRent, 0),
//   }));
// };

const normalizeRentalConfigurations = (raw) => {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((cfg) => ({
    months: toNumber(cfg?.months, 1),
    days: toNumber(cfg?.days, 0),
    periodUnit: ['month', 'day'].includes(cfg?.periodUnit)
      ? cfg.periodUnit
      : 'month',
    label: String(cfg?.label || '').trim(),
    pricePerDay: toNumber(cfg?.pricePerDay, 0),
    shippingCharges: toNumber(cfg?.shippingCharges, 0),
    customerRent: toNumber(cfg?.customerRent, 0),
    // Vendor's own configured price — shown only in the vendor's product
    // table, never to customers. Was being silently dropped here, causing
    // it to always save as 0 regardless of what the vendor form sent.
    vendorRent: toNumber(cfg?.vendorRent, 0),
  }));
};
const normalizeLogisticsVerification = (raw) => {
  const o = raw && typeof raw === 'object' ? raw : {};
  return {
    inventoryOwnerName: String(o.inventoryOwnerName || '').trim(),
    city: String(o.city || '').trim(),
    deliveryTimelineValue: toNumber(o.deliveryTimelineValue, 0),
    deliveryTimelineUnit:
      String(o.deliveryTimelineUnit || 'Days').trim() || 'Days',
  };
};

const normalizeProductPayload = (body) => {
  const data = { ...body };
  data.type = body.type === 'Sell' ? 'Sell' : 'Rental';
  data.specifications = parseJsonField(body.specifications, {});
  data.variants = normalizeVariants(parseJsonField(body.variants, []));
  data.rentalConfigurations = normalizeRentalConfigurations(
    parseJsonField(body.rentalConfigurations, []),
  );
  const salesConfigurationRaw = parseJsonField(body.salesConfiguration, {});
  data.salesConfiguration = {
    allowVendorEditSalePrice:
      salesConfigurationRaw?.allowVendorEditSalePrice === false ||
      salesConfigurationRaw?.allowVendorEditSalePrice === 'false'
        ? false
        : true,
    salePrice: toNumber(
      salesConfigurationRaw?.salePrice,
      toNumber(body.price, 0),
    ),
    mrpPrice: toNumber(salesConfigurationRaw?.mrpPrice, 0),
  };
  data.refundableDeposit = toNumber(body.refundableDeposit, 0);
  data.logisticsVerification = normalizeLogisticsVerification(
    parseJsonField(body.logisticsVerification, {}),
  );
  data.existingImages = parseJsonField(body.existingImages, []);
  data.stock = toNumber(body.stock, 0);
  data.status = deriveStockStatus(data.stock);
  // Creation metadata (optional; forwarded from frontend when available)
  if (body.createdVia === 'manual' || body.createdVia === 'template') {
    data.createdVia = body.createdVia;
  }
  if (
    body.allowVendorEditRentalPrices === true ||
    body.allowVendorEditRentalPrices === 'true'
  ) {
    data.allowVendorEditRentalPrices = true;
  }
  const subs = ['draft', 'pending_approval', 'published'];
  data.submissionStatus = subs.includes(body.submissionStatus)
    ? body.submissionStatus
    : 'draft';
  return data;
};

export const createProduct = async (req, res) => {
  try {
    console.log('Vendor:', req.vendor);

    const vendorKyc = await VendorKyc.findOne({ vendorId: req.vendor._id });
    if (!vendorKyc || vendorKyc.status !== 'approved') {
      return res.status(403).json({
        message:
          'KYC not approved yet. Complete KYC and wait for admin approval before adding products.',
      });
    }

    // const data = normalizeProductPayload(req.body);
    // const uploadedImages = [];

    // if (Array.isArray(req.files) && req.files.length > 0) {
    //   for (const file of req.files.slice(0, 10)) {
    //     const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
    //     uploadedImages.push(imgRes.secure_url);
    //   }
    // } else if (req.file) {
    //   const imgRes = await uploadImageToCloudinary(req.file.buffer, 'products');
    //   uploadedImages.push(imgRes.secure_url);
    // }

    const data = normalizeProductPayload(req.body);
    const uploadedImages = [];
    const variantImagesByIndex = {};

    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files.slice(0, 40)) {
        const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
        const variantMatch = /^variantImages_(\d+)$/.exec(file.fieldname || '');
        if (variantMatch) {
          const idx = Number(variantMatch[1]);
          if (!variantImagesByIndex[idx]) variantImagesByIndex[idx] = [];
          variantImagesByIndex[idx].push(imgRes.secure_url);
        } else {
          uploadedImages.push(imgRes.secure_url);
        }
      }
    } else if (req.file) {
      const imgRes = await uploadImageToCloudinary(req.file.buffer, 'products');
      uploadedImages.push(imgRes.secure_url);
    }

    if (
      Array.isArray(data.variants) &&
      Object.keys(variantImagesByIndex).length > 0
    ) {
      data.variants = data.variants.map((v, idx) => {
        const newOnes = variantImagesByIndex[idx] || [];
        if (newOnes.length === 0) return v;
        const existing = Array.isArray(v.images) ? v.images : [];
        return { ...v, images: [...existing, ...newOnes].slice(0, 10) };
      });
    }
    const keptExisting =
      Array.isArray(data.existingImages) && data.existingImages.length > 0
        ? data.existingImages.filter(Boolean).slice(0, 10)
        : [];

    if (uploadedImages.length > 0) {
      data.images = [...keptExisting, ...uploadedImages].slice(0, 10);
      data.image = data.images[0];
    } else if (keptExisting.length > 0) {
      data.images = keptExisting;
      data.image = data.images[0];
    } else if (Array.isArray(data.images) && data.images.length > 0) {
      data.image = data.images[0];
    }

    // // Custom listings (manual variants) may have no top-level images at all —
    // // every image lives on the variants instead. Fall back to the first
    // // available variant image so the top-level `image`/`images` fields
    // // (still required by the schema) get populated correctly.
    // if (
    //   !data.image &&
    //   Array.isArray(data.variants) &&
    //   data.variants.length > 0
    // ) {
    //   const firstVariantWithImage = data.variants.find(
    //     (v) => Array.isArray(v.images) && v.images.length > 0,
    //   );
    //   if (firstVariantWithImage) {
    //     data.image = firstVariantWithImage.images[0];
    //     if (!Array.isArray(data.images) || data.images.length === 0) {
    //       data.images = data.variants
    //         .flatMap((v) => (Array.isArray(v.images) ? v.images : []))
    //         .slice(0, 10);
    //     }
    //   }
    // }

    // Custom listings (manual variants) may have no top-level images at all —
    // every image lives on the variants instead. Fall back to the first
    // available variant image so the top-level `image`/`images` fields
    // (still required by the schema) get populated correctly.
    if (
      !data.image &&
      Array.isArray(data.variants) &&
      data.variants.length > 0
    ) {
      const firstVariantWithImage = data.variants.find(
        (v) => Array.isArray(v.images) && v.images.length > 0,
      );
      if (firstVariantWithImage) {
        data.image = firstVariantWithImage.images[0];
        if (!Array.isArray(data.images) || data.images.length === 0) {
          data.images = data.variants
            .flatMap((v) => (Array.isArray(v.images) ? v.images : []))
            .slice(0, 10);
        }
      }
    }

    // Custom listings (single/manual variant) may have their rental pricing
    // set only on the variant's own rentalConfigurations, leaving the
    // top-level product.rentalConfigurations at schema defaults (0). Several
    // places (Rental Command Center's extend/early-closure pricing, etc.)
    // read pricing from the top-level field, so fall back to the first
    // variant's rentalConfigurations whenever the top-level one has no
    // priced entries — without overwriting a top-level config that already
    // has real pricing (e.g. admin-entered listings).
    const hasTopLevelRentalPricing =
      Array.isArray(data.rentalConfigurations) &&
      data.rentalConfigurations.some(
        (cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
      );

    if (
      !hasTopLevelRentalPricing &&
      Array.isArray(data.variants) &&
      data.variants.length > 0
    ) {
      const firstVariantWithRentalPricing = data.variants.find(
        (v) =>
          Array.isArray(v.rentalConfigurations) &&
          v.rentalConfigurations.some(
            (cfg) => Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
          ),
      );
      if (firstVariantWithRentalPricing) {
        data.rentalConfigurations =
          firstVariantWithRentalPricing.rentalConfigurations;
      }
    }

    if (!data.image) {
      if (data.submissionStatus === 'draft') {
        const ph = 'https://placehold.co/400x400/e5e7eb/6b7280?text=Draft';
        data.image = ph;
        data.images = [ph];
      } else {
        return res
          .status(400)
          .json({ message: 'At least one image is required' });
      }
    }

    delete data.existingImages;
    delete data.adminListingEnabled;
    delete data.vendorListingEnabled;

    if (data.submissionStatus === 'published') {
      data.submissionStatus = 'pending_approval';
    }
    data.isAdminApproved = false;
    data.adminApprovedAt = null;
    data.adminApprovedBy = null;

    // const product = await Product.create({
    //   ...data,
    //   vendorId: req.vendor._id,
    // });

    const activeStores = (vendorKyc?.storeManagement?.stores || []).filter(
      (s) => s.isActive !== false,
    );
    const linkedStore =
      activeStores.find((s) => s.isDefault) || activeStores[0] || null;

    const product = await Product.create({
      ...data,
      vendorId: req.vendor._id,
      storeId: linkedStore ? String(linkedStore._id) : '',
    });

    res.status(201).json({
      message: 'Product created',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getMyProducts = async (req, res) => {
//   try {
//     const products = await Product.find({
//       vendorId: req.vendor._id,
//     }).sort({ createdAt: -1 });

//     res.status(200).json({ products });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      vendorId: req.vendor._id,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = normalizeProductPayload(req.body);
    // const existing = await Product.findOne({
    //   _id: id,
    //   vendorId: req.vendor._id,
    // });

    // if (!existing) {
    //   return res.status(404).json({ message: 'Product not found' });
    // }

    const existing = await Product.findOne({
      _id: id,
      vendorId: req.vendor._id,
    });

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Backfill storeId for legacy products that predate store-linking.
    // Only runs if this product has no storeId yet — never overwrites
    // an already-linked product on a routine edit.
    if (!existing.storeId) {
      const vendorKyc = await VendorKyc.findOne({ vendorId: req.vendor._id })
        .select('storeManagement.stores')
        .lean();
      const activeStores = (vendorKyc?.storeManagement?.stores || []).filter(
        (s) => s.isActive !== false,
      );
      const linkedStore =
        activeStores.find((s) => s.isDefault) || activeStores[0] || null;
      if (linkedStore) {
        data.storeId = String(linkedStore._id);
      }
    }

    // const uploadedImages = [];
    // if (Array.isArray(req.files) && req.files.length > 0) {
    //   for (const file of req.files.slice(0, 10)) {
    //     const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
    //     uploadedImages.push(imgRes.secure_url);
    //   }
    // } else if (req.file) {
    //   const imgRes = await uploadImageToCloudinary(req.file.buffer, 'products');
    //   uploadedImages.push(imgRes.secure_url);
    // }

    // const keptExistingImages = Array.isArray(data.existingImages)
    //   ? data.existingImages.filter(Boolean)
    //   : Array.isArray(existing.images)
    //     ? existing.images
    //     : existing.image
    //       ? [existing.image]
    //       : [];
    // const mergedImages = [...keptExistingImages, ...uploadedImages].slice(
    //   0,
    //   10,
    // );
    // data.images = mergedImages;
    // data.image = mergedImages[0];

    // const uploadedImages = [];
    // if (Array.isArray(req.files) && req.files.length > 0) {
    //   for (const file of req.files.slice(0, 10)) {
    //     const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
    //     uploadedImages.push(imgRes.secure_url);
    //   }
    // } else if (req.file) {
    //   const imgRes = await uploadImageToCloudinary(req.file.buffer, 'products');
    //   uploadedImages.push(imgRes.secure_url);
    // }

    // With upload.any(), req.files is a flat array where each file carries
    // its own `fieldname`. Variant-specific uploads use fieldname
    // `variantImages_<index>` (index into data.variants); anything else
    // (e.g. plain 'images', legacy/template flow) is treated as
    // top-level/product-wide images, same as before.
    const uploadedImages = [];
    const uploadedImagesByVariantIndex = {};

    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files.slice(0, 30)) {
        const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
        const match = /^variantImages_(\d+)$/.exec(file.fieldname || '');
        if (match) {
          const vIdx = Number(match[1]);
          if (!uploadedImagesByVariantIndex[vIdx]) {
            uploadedImagesByVariantIndex[vIdx] = [];
          }
          uploadedImagesByVariantIndex[vIdx].push(imgRes.secure_url);
        } else {
          uploadedImages.push(imgRes.secure_url);
        }
      }
    } else if (req.file) {
      const imgRes = await uploadImageToCloudinary(req.file.buffer, 'products');
      uploadedImages.push(imgRes.secure_url);
    }

    if (Array.isArray(data.variants) && data.variants.length) {
      data.variants.forEach((variant, idx) => {
        const newOnes = uploadedImagesByVariantIndex[idx];
        if (newOnes && newOnes.length) {
          variant.images = Array.isArray(variant.images)
            ? [...variant.images, ...newOnes]
            : [...newOnes];
        }
      });
    }

    // Which variant (by index in data.variants) each newly uploaded image
    // belongs to — parallel to uploadedImages/req.files. Without this we
    // can't know that a new "jeans" photo belongs only to Test1.
    let newImageOwners = [];
    if (data.newImageOwners) {
      try {
        newImageOwners = Array.isArray(data.newImageOwners)
          ? data.newImageOwners
          : JSON.parse(data.newImageOwners);
      } catch {
        newImageOwners = [];
      }
    }
    delete data.newImageOwners;

    if (
      Array.isArray(data.variants) &&
      data.variants.length &&
      uploadedImages.length > 0 &&
      newImageOwners.length === uploadedImages.length
    ) {
      uploadedImages.forEach((url, i) => {
        const variant = data.variants[newImageOwners[i]];
        if (variant) {
          variant.images = Array.isArray(variant.images)
            ? [...variant.images, url]
            : [url];
        }
      });
    }

    const keptExistingImages = Array.isArray(data.existingImages)
      ? data.existingImages.filter(Boolean)
      : Array.isArray(existing.images)
        ? existing.images
        : existing.image
          ? [existing.image]
          : [];

    // If variants carry their own images, use their union as the product
    // gallery — keeps each variant's images fully separate (fixes images
    // bleeding between variants). Otherwise, keep the original flat-merge
    // behaviour for non-variant / template listings.
    const variantImageUnion =
      Array.isArray(data.variants) && data.variants.length
        ? Array.from(
            new Set(
              data.variants.flatMap((v) =>
                Array.isArray(v.images) ? v.images.filter(Boolean) : [],
              ),
            ),
          )
        : [];

    const mergedImages =
      variantImageUnion.length > 0
        ? variantImageUnion.slice(0, 10)
        : [...keptExistingImages, ...uploadedImages].slice(0, 10);

    data.images = mergedImages;
    data.image = mergedImages[0];

    // if (!data.image) {
    //   return res
    //     .status(400)
    //     .json({ message: 'At least one image is required for the product.' });
    // }
    if (!data.image) {
      data.image = existing.image;
      data.images = existing.images || [existing.image];
    }

    delete data.existingImages;
    delete data.adminListingEnabled;
    delete data.vendorListingEnabled;

    // Until admin approves at least once, vendors cannot force storefront publish.
    if (data.submissionStatus === 'published' && !existing.isAdminApproved) {
      data.submissionStatus = 'pending_approval';
    }

    // const product = await Product.findOneAndUpdate(
    //   { _id: id, vendorId: req.vendor._id },
    //   data,
    //   { new: true },
    // );

    // res.status(200).json({
    //   message: 'Updated successfully',
    //   product,
    // });
    const previousStock = existing.stock ?? 0;

    const product = await Product.findOneAndUpdate(
      { _id: id, vendorId: req.vendor._id },
      data,
      { new: true },
    );

    // If product was out of stock and now has stock → notify waiting users
    const newStock = product.stock ?? 0;
    if (previousStock <= 0 && newStock > 0) {
      await StockNotify.updateMany(
        { productId: product._id, notified: false },
        { $set: { notified: true, updatedAt: new Date() } },
      ).catch(() => {}); // don't fail the update if notify fails
    }

    res.status(200).json({
      message: 'Updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const patchVendorProductListingVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body?.vendorListingEnabled;
    const vendorListingEnabled = raw === true || raw === 'true';

    const product = await Product.findOne({
      _id: id,
      vendorId: req.vendor._id,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!product.isAdminApproved) {
      return res.status(400).json({
        message: 'This listing is pending admin approval.',
      });
    }
    if (product.submissionStatus !== 'published') {
      return res.status(400).json({
        message:
          'Only published listings can be shown or hidden on the website.',
      });
    }

    product.vendorListingEnabled = vendorListingEnabled;
    await product.save();

    return res.status(200).json({
      message: 'Storefront visibility updated.',
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findOneAndDelete({
//       _id: id,
//       vendorId: req.vendor._id,
//     });

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json({
//       message: 'Deleted successfully',
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id).populate(
//       'vendorId',
//       'fullName emailAddress',
//     );

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json({ product });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: never remove the document. This keeps the product
    // resolvable for any existing rent/buy order that references it, while
    // hiding it from the vendor's active list and the public storefront.
    const product = await Product.findOneAndUpdate(
      { _id: id, vendorId: req.vendor._id },
      {
        isDeleted: true,
        deletedAt: new Date(),
        vendorListingEnabled: false,
      },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate(
      'vendorId',
      'fullName emailAddress',
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Look up subcategory tax by name (since category/subCategory are String fields)
    // Look up subcategory tax by name (since category/subCategory are String fields)
    let subCategoryTax = null;
    if (product.subCategory) {
      const subCatDoc = await SubCategory.findOne({ name: product.subCategory })
        .select(
          'defaultGst defaultCareTax defaultRepairWarranty defaultRelocationWarranty defaultDeliveryPackaging defaultInstallationFee defaultPlatformFee taxBlocked category',
        )
        .lean();
      if (subCatDoc) {
        subCategoryTax = subCatDoc;
        // Parent category toggle wins: if the parent category is OFF,
        // force this subcategory to act as blocked too — even if its
        // own toggle is ON.
        if (subCatDoc.category) {
          const parentCatDoc = await Category.findById(subCatDoc.category)
            .select('taxBlocked')
            .lean();
          if (parentCatDoc?.taxBlocked) {
            subCategoryTax.taxBlocked = true;
          }
        }
      }
    }
    if (!subCategoryTax && product.category) {
      const catDoc = await Category.findOne({ name: product.category })
        .select(
          'defaultGst defaultCareTax defaultRepairWarranty defaultRelocationWarranty defaultDeliveryPackaging defaultInstallationFee defaultPlatformFee taxBlocked',
        )
        .lean();
      if (catDoc) subCategoryTax = catDoc;
    }

    // res.status(200).json({
    //   product: {
    //     ...product.toObject(),
    //     subCategoryTax: subCategoryTax || {},
    //   },
    // });
    console.log('=== PRODUCT TAX DEBUG ===');
    console.log('product.subCategory (string):', product.subCategory);
    console.log('product.category (string):', product.category);
    console.log('subCategoryTax found:', subCategoryTax);

    res.status(200).json({
      product: {
        ...product.toObject(),
        subCategoryTax: subCategoryTax || {},
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function pickProductRentalConfigurations(product) {
  const top = product?.rentalConfigurations;
  if (Array.isArray(top) && top.length) return top;
  const v0 = product?.variants?.[0];
  if (
    Array.isArray(v0?.rentalConfigurations) &&
    v0.rentalConfigurations.length
  ) {
    return v0.rentalConfigurations;
  }
  return [];
}

function tierRentAmount(cfg) {
  const n = (k) => {
    const v = Number(String(cfg?.[k] ?? '').replace(/,/g, ''));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  return n('customerRent') || n('pricePerDay') || n('vendorRent') || 0;
}

/**
 * Lowest per-month / per-day rate by tenure across other vendors’ rental listings
 * (excludes current vendor). Used in manual product modal “Market low”.
 */
export const getMarketLowRentalTenures = async (req, res) => {
  try {
    const category = String(req.query.category || '').trim();
    const subCategory = String(req.query.subCategory || '').trim();
    const vendorId = req.vendor._id;

    const baseQuery = {
      type: 'Rental',
      submissionStatus: 'published',
      isAdminApproved: { $ne: false },
      adminListingEnabled: { $ne: false },
      vendorListingEnabled: { $ne: false },
      vendorId: { $ne: vendorId },
    };

    const narrowQuery = { ...baseQuery };
    if (category) narrowQuery.category = category;
    if (subCategory) narrowQuery.subCategory = subCategory;

    let products = await Product.find(narrowQuery)
      .select('rentalConfigurations variants')
      .lean();

    if ((!products || products.length === 0) && category && subCategory) {
      products = await Product.find({
        ...baseQuery,
        category,
      })
        .select('rentalConfigurations variants')
        .lean();
    }

    if (!products || products.length === 0) {
      products = await Product.find(baseQuery)
        .select('rentalConfigurations variants')
        .lean();
    }

    const monthMin = {};
    const dayMin = {};

    for (const p of products) {
      const configs = pickProductRentalConfigurations(p);
      for (const cfg of configs) {
        const periodUnit = cfg?.periodUnit === 'day' ? 'day' : 'month';
        const amt = tierRentAmount(cfg);
        if (!amt || amt <= 0) continue;

        if (periodUnit === 'day') {
          const days = Number(cfg?.days) || 0;
          if (days <= 0) continue;
          const perDay = amt / days;
          const prev = dayMin[days];
          if (prev == null || perDay < prev) dayMin[days] = perDay;
        } else {
          const months = Number(cfg?.months) || 0;
          if (months <= 0) continue;
          const perMonth = amt / months;
          const prev = monthMin[months];
          if (prev == null || perMonth < prev) monthMin[months] = perMonth;
        }
      }
    }

    const roundMap = (obj) => {
      const out = {};
      for (const k of Object.keys(obj)) {
        out[String(k)] = Math.round(obj[k]);
      }
      return out;
    };

    res.json({
      month: roundMap(monthMin),
      day: roundMap(dayMin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
