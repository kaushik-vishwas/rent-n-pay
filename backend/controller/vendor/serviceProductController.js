import VendorKyc from '../../models/VendorKyc.js';
import ServiceProduct from '../../models/ServiceProduct.js';
import Category from '../../models/Category.js';
import SubCategory from '../../models/SubCategory.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';
import City from '../../models/City.js';
import LocationSourceSettings from '../../models/LocationSourceSettings.js';
import { resolveStateFromCoords } from '../../utils/geocode.js';

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

const publicServiceProductQuery = {
  isAdminApproved: true,
  submissionStatus: 'published',
  vendorListingEnabled: true,
  adminListingEnabled: true,
};

function pickPrimaryStore(stores = []) {
  if (!Array.isArray(stores) || stores.length === 0) return null;
  return (
    stores.find((s) => s?.isDefault && s?.isActive !== false) ||
    stores.find((s) => s?.isActive !== false) ||
    null
  );
}

function vendorServesLocation(store, userLat, userLng) {
  if (!store) return false;
  if (store?.serviceModePanIndia === true) return true;

  const isLocal =
    store?.serviceModeLocalDelivery === true ||
    store?.deliveryZoneType === 'hyper-local';
  if (!isLocal) return store?.deliveryZoneType === 'pan-india';

  if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) return true;

  const sLat = Number(store?.mapLat);
  const sLng = Number(store?.mapLng);
  if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) return false;

  const radius = Number(store?.serviceRadiusKm);
  const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : 50;
  return distanceKm(userLat, userLng, sLat, sLng) <= safeRadius;
}

// async function filterByActiveVendorStores(products, userLat, userLng) {
//   const rows = Array.isArray(products) ? products : [];
//   if (!rows.length) return [];

//   const vendorIds = [
//     ...new Set(rows.map((p) => String(p.vendorId || '')).filter(Boolean)),
//   ];
//   const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
//     .select('vendorId storeManagement.stores')
//     .lean();
//   const storeMap = new Map();
//   for (const row of kycRows || []) {
//     storeMap.set(
//       String(row?.vendorId || ''),
//       pickPrimaryStore(row?.storeManagement?.stores || []),
//     );
//   }

//   return rows.filter((product) => {
//     const store = storeMap.get(String(product.vendorId || ''));
//     return vendorServesLocation(store, userLat, userLng);
//   });
// }

async function filterByActiveVendorStores(products, userLat, userLng) {
  const rows = Array.isArray(products) ? products : [];
  if (!rows.length) return [];

  const vendorIds = [
    ...new Set(rows.map((p) => String(p.vendorId || '')).filter(Boolean)),
  ];
  const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
    .select('vendorId storeManagement.stores')
    .lean();

  // storeId -> store (across all vendors), plus a per-vendor primary-store
  // fallback for legacy services that don't have a storeId yet.
  const storeByIdMap = new Map();
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

  return rows.filter((product) => {
    const vid = String(product.vendorId || '');
    const linkedStore = product.storeId
      ? storeByIdMap.get(String(product.storeId))
      : null;
    // Legacy service with no storeId yet: fall back to old behaviour
    // (vendor's primary store) so it doesn't just disappear.
    const store = linkedStore || vendorPrimaryStoreMap.get(vid);
    if (!store) return false;
    // A service's own linked store must itself be active — a vendor
    // having some OTHER active store elsewhere must not let this
    // service through.
    if (store.isActive === false) return false;
    return vendorServesLocation(store, userLat, userLng);
  });
}

// const extractCityFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => x.trim())
//       .filter(Boolean);
//     if (parts.length >= 3) return parts[parts.length - 3];
//     if (parts.length >= 2) return parts[parts.length - 2];
//     return parts[0] || 'Unknown';
//   }
//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   const tokens = address
//     .split(',')
//     .map((x) => x.trim())
//     .filter(Boolean);
//   if (tokens.length >= 2) return tokens[tokens.length - 2];
//   return tokens[0] || 'Unknown';
// };

// const extractCityFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => x.trim())
//       .filter(Boolean);
//     if (parts.length >= 3) return parts[parts.length - 3];
//     if (parts.length >= 2) return parts[parts.length - 2];
//     return parts[0] || 'Unknown';
//   }
//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   const tokens = address
//     .split(',')
//     .map((x) => x.trim())
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

const pickCityFromParts = (parts) => {
  const cleaned = parts
    .map((p) => stripAdminSuffix(p))
    .filter((p) => p && !isPincode(p) && !isCountry(p));
  return cleaned.length ? cleaned[cleaned.length - 1] : parts[0] || 'Unknown';
};

const extractCityFromStore = (store = {}) => {
  const mapAddress = String(store.mapAddress || '').trim();
  if (mapAddress) {
    const parts = mapAddress
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    return pickCityFromParts(parts);
  }
  const address = String(store.completeAddress || '').trim();
  if (!address) return 'Unknown';
  const tokens = address
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  return pickCityFromParts(tokens);
};

// const extractStateFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const parts = mapAddress
//       .split(',')
//       .map((x) => x.trim())
//       .filter(Boolean);
//     if (parts.length >= 2) return parts[parts.length - 2];
//     return parts[0] || 'Unknown';
//   }
//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   const tokens = address
//     .split(',')
//     .map((x) => x.trim())
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
      .map((x) => x.trim())
      .filter(Boolean);
    const found = findStateInTokens(parts);
    if (found) return found;
  }

  const address = String(store.completeAddress || '').trim();
  if (address) {
    // completeAddress sometimes uses periods instead of commas as separators.
    const tokens = address
      .split(/[,.]/)
      .map((x) => x.trim())
      .filter(Boolean);
    const found = findStateInTokens(tokens);
    if (found) return found;
  }

  return 'Unknown';
};

function projectPublicServiceProduct(product) {
  const included = Array.isArray(product?.serviceMeta?.included)
    ? product.serviceMeta.included.filter(Boolean)
    : [];
  return {
    _id: product._id,
    image: product.image,
    title: product.productName,
    category: product.category,
    subCategory: product.subCategory,
    desc: included.length
      ? `Includes: ${included.join(', ')}`
      : product.shortDescription,
    price: product.price,
    mrpPrice: product.salesConfiguration?.mrpPrice,
    salePrice: product.salesConfiguration?.salePrice,
    //     serviceType: product.serviceMeta?.serviceType,
    //     status: product.status,
    //     rating: product.averageRating || 0,
    //     reviewCount: product.numReviews || 0,
    //   };
    // }
    serviceType: product.serviceMeta?.serviceType,
    status: product.status,
    rating: product.averageRating || 0,
    reviewCount: product.numReviews || 0,
    availabilitySchedule: Array.isArray(product.availabilitySchedule)
      ? product.availabilitySchedule
      : [],
    featured: {
      enabled: !!product.featured?.enabled,
      status: product.featured?.status || 'inactive',
      priorityRank: Number(product.featured?.priorityRank || 0),
    },
  };
}

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

const deriveStatusFromStock = (stock) => {
  const s = toNumber(stock, 0);
  if (s <= 0) return 'Out of Stock';
  if (s <= 5) return 'Low Stock';
  return 'Active';
};

const normalizeAvailabilitySchedule = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => ({
    day: x?.day || 'Mon',
    startTime: String(x?.startTime || '').trim(),
    endTime: String(x?.endTime || '').trim(),
    breakStart: String(x?.breakStart || '').trim(),
    breakEnd: String(x?.breakEnd || '').trim(),
    isAvailable: x?.isAvailable !== undefined ? !!x.isAvailable : true,
    workDuration: String(x?.workDuration || '').trim(),
  }));
};

const normalizeServiceProductPayload = (body) => {
  const data = { ...body };
  data.type = 'Service';

  data.productCustomSpecs = parseJsonField(body.productCustomSpecs, []);
  data.specifications = parseJsonField(body.specifications, {});
  data.serviceMeta = parseJsonField(body.serviceMeta, {});
  data.availabilitySchedule = normalizeAvailabilitySchedule(
    parseJsonField(body.availabilitySchedule, []),
  );

  data.category = body.category;
  data.subCategory = body.subCategory;
  data.brand = body.brand || '';
  data.condition = body.condition || 'Brand New';

  data.shortDescription = body.shortDescription || '';
  data.description = body.description || '';

  data.refundableDeposit = toNumber(body.refundableDeposit, 0);

  const salesConfigRaw = parseJsonField(body.salesConfiguration, {});
  data.salesConfiguration = {
    allowVendorEditSalePrice:
      salesConfigRaw?.allowVendorEditSalePrice === false ||
      salesConfigRaw?.allowVendorEditSalePrice === 'false'
        ? false
        : true,
    salePrice: toNumber(salesConfigRaw?.salePrice, 0),
    mrpPrice: toNumber(salesConfigRaw?.mrpPrice, 0),
  };

  data.logisticsVerification = parseJsonField(body.logisticsVerification, {});
  data.existingImages = parseJsonField(body.existingImages, []);

  data.stock = toNumber(body.stock, 0);
  data.status = deriveStatusFromStock(data.stock);

  const subs = ['draft', 'pending_approval', 'published'];
  data.submissionStatus = subs.includes(body.submissionStatus)
    ? body.submissionStatus
    : 'draft';

  // For template auto-creation
  if (body.serviceTemplateId) data.serviceTemplateId = body.serviceTemplateId;
  if (body.createdVia) data.createdVia = body.createdVia;

  return data;
};

function defaultAvailabilitySchedule() {
  return [
    { day: 'Mon', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { day: 'Tue', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { day: 'Wed', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { day: 'Thu', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { day: 'Fri', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { day: 'Sat', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { day: 'Sun', startTime: '09:00', endTime: '18:00', isAvailable: false },
  ];
}

export const createServiceProduct = async (req, res) => {
  try {
    const vendorKyc = await VendorKyc.findOne({
      vendorId: req.vendor._id,
    });
    if (!vendorKyc || vendorKyc.status !== 'approved') {
      return res.status(403).json({
        message:
          'KYC not approved yet. Complete KYC and wait for admin approval before adding products.',
      });
    }

    const data = normalizeServiceProductPayload(req.body);
    const uploadedImages = [];

    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files.slice(0, 10)) {
        const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
        uploadedImages.push(imgRes.secure_url);
      }
    }

    const keptExisting =
      Array.isArray(data.existingImages) && data.existingImages.length > 0
        ? data.existingImages.filter(Boolean).slice(0, 10)
        : [];

    const mergedImages = [...keptExisting, ...uploadedImages].slice(0, 10);

    if (mergedImages.length) {
      data.images = mergedImages;
      data.image = mergedImages[0];
    } else if (data.submissionStatus === 'draft') {
      const ph = 'https://placehold.co/400x400/e5e7eb/6b7280?text=Draft';
      data.image = ph;
      data.images = [ph];
    } else {
      return res
        .status(400)
        .json({ message: 'At least one image is required' });
    }

    if (
      !Array.isArray(data.availabilitySchedule) ||
      !data.availabilitySchedule.length
    ) {
      data.availabilitySchedule = defaultAvailabilitySchedule();
    }

    delete data.existingImages;

    if (data.submissionStatus === 'published') {
      data.submissionStatus = 'pending_approval';
    }

    data.isAdminApproved = false;
    data.adminApprovedAt = null;
    data.adminApprovedBy = null;
    data.adminListingEnabled = true;
    data.vendorListingEnabled = true;

    const activeStores = (vendorKyc?.storeManagement?.stores || []).filter(
      (s) => s.isActive !== false,
    );
    const linkedStore =
      activeStores.find((s) => s.isDefault) || activeStores[0] || null;

    const serviceProduct = await ServiceProduct.create({
      ...data,
      vendorId: req.vendor._id,
      storeId: linkedStore ? String(linkedStore._id) : '',
    });

    return res.status(201).json({
      message: 'Service product created',
      product: serviceProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateServiceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ServiceProduct.findOne({
      _id: id,
      vendorId: req.vendor._id,
    });
    if (!existing) {
      return res.status(404).json({ message: 'Service product not found' });
    }

    const data = normalizeServiceProductPayload(req.body);

    // Backfill storeId for legacy services that predate store-linking.
    // Only runs if this service has no storeId yet — never overwrites
    // an already-linked service on a routine edit.
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

    const uploadedImages = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files.slice(0, 10)) {
        const imgRes = await uploadImageToCloudinary(file.buffer, 'products');
        uploadedImages.push(imgRes.secure_url);
      }
    }

    const keptExisting =
      Array.isArray(data.existingImages) && data.existingImages.length > 0
        ? data.existingImages.filter(Boolean).slice(0, 10)
        : Array.isArray(existing.images) && existing.images.length
          ? existing.images
          : [];

    const mergedImages = [...keptExisting, ...uploadedImages].slice(0, 10);
    if (mergedImages.length) {
      data.images = mergedImages;
      data.image = mergedImages[0];
    } else {
      data.images = keptExisting;
      data.image = keptExisting[0] || existing.image;
    }

    if (
      !Array.isArray(data.availabilitySchedule) ||
      !data.availabilitySchedule.length
    ) {
      data.availabilitySchedule =
        existing.availabilitySchedule || defaultAvailabilitySchedule();
    }

    delete data.existingImages;

    if (
      data.submissionStatus === 'published' &&
      existing.isAdminApproved === false
    ) {
      data.submissionStatus = 'pending_approval';
    }

    const updated = await ServiceProduct.findOneAndUpdate(
      { _id: id, vendorId: req.vendor._id },
      data,
      { new: true },
    );

    return res.status(200).json({
      message: 'Updated successfully',
      product: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const getMyServiceProducts = async (req, res) => {
//   try {
//     const serviceProducts = await ServiceProduct.find({
//       vendorId: req.vendor._id,
//     }).sort({ createdAt: -1 });
//     return res.status(200).json({ products: serviceProducts });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
export const getMyServiceProducts = async (req, res) => {
  try {
    const serviceProducts = await ServiceProduct.find({
      vendorId: req.vendor._id,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });
    return res.status(200).json({ products: serviceProducts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const deleteServiceProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await ServiceProduct.findOneAndDelete({
//       _id: id,
//       vendorId: req.vendor._id,
//     });
//     if (!deleted) {
//       return res.status(404).json({ message: 'Service product not found' });
//     }
//     return res.status(200).json({ message: 'Deleted successfully' });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const deleteServiceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete: never remove the document. This keeps the service
    // resolvable for any existing booking/order that references it, while
    // hiding it from the vendor's active list and the public storefront.
    const deleted = await ServiceProduct.findOneAndUpdate(
      { _id: id, vendorId: req.vendor._id },
      {
        isDeleted: true,
        deletedAt: new Date(),
        vendorListingEnabled: false,
      },
      { new: true },
    );
    if (!deleted) {
      return res.status(404).json({ message: 'Service product not found' });
    }
    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const patchVendorServiceListingVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body?.vendorListingEnabled;
    const vendorListingEnabled = raw === true || raw === 'true';

    const product = await ServiceProduct.findOne({
      _id: id,
      vendorId: req.vendor._id,
    });
    if (!product) {
      return res.status(404).json({ message: 'Service product not found' });
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

// export const getServiceProducts = async (req, res) => {
//   try {
//     const { search, category, subCategory, userLat, userLng } = req.query;
//     const query = { ...publicServiceProductQuery };
//     if (category) query.category = category;
//     if (subCategory) query.subCategory = subCategory;
//     if (search) {
//       query.$or = [
//         { productName: { $regex: search, $options: 'i' } },
//         { category: { $regex: search, $options: 'i' } },
//         { subCategory: { $regex: search, $options: 'i' } },
//         { shortDescription: { $regex: search, $options: 'i' } },
//       ];
//     }

//     const hasUserLocation =
//       Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng));
//     const serviceProducts = await ServiceProduct.find(query)
//       .sort({ createdAt: -1 })
//       .lean();
//     const visible = await filterByActiveVendorStores(
//       serviceProducts,
//       hasUserLocation ? Number(userLat) : undefined,
//       hasUserLocation ? Number(userLng) : undefined,
//     );
//     return res
//       .status(200)
//       .json({ products: visible.map(projectPublicServiceProduct) });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const getServiceProducts = async (req, res) => {
//   try {
//     const { search, category, subCategory, userLat, userLng } = req.query;
//     const query = { ...publicServiceProductQuery };
//     if (category) query.category = category;
export const getServiceProducts = async (req, res) => {
  try {
    const { search, category, subCategory, userLat, userLng } = req.query;
    const query = { ...publicServiceProductQuery, isDeleted: { $ne: true } };
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const hasUserLocation =
      Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng));

    const serviceProducts = await ServiceProduct.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // let visible = await filterByActiveVendorStores(
    //   serviceProducts,
    //   hasUserLocation ? Number(userLat) : undefined,
    //   hasUserLocation ? Number(userLng) : undefined,
    // );

    // const disabledCities = await City.find({ serviceEnabled: false })
    //   .select('cityKey')
    //   .lean();

    let visible = await filterByActiveVendorStores(
      serviceProducts,
      hasUserLocation ? Number(userLat) : undefined,
      hasUserLocation ? Number(userLng) : undefined,
    );

    // Sub-admin state-level Service toggle filtering (mirrors the same
    // block in adminController.getAllProducts for Rent/Buy).
    if (hasUserLocation && visible.length) {
      const resolvedState = await resolveStateFromCoords(
        Number(userLat),
        Number(userLng),
      );
      if (resolvedState) {
        const normalizedState = String(resolvedState).trim().toLowerCase();
        const stateSettings = await LocationSourceSettings.findOne({
          state: normalizedState,
        }).lean();

        if (stateSettings && stateSettings.serviceEnabled === false) {
          const vendorIdsForState = [
            ...new Set(
              visible.map((p) => String(p.vendorId || '')).filter(Boolean),
            ),
          ];
          const kycForState = await VendorKyc.find({
            vendorId: { $in: vendorIdsForState },
          })
            .select('vendorId storeManagement.stores')
            .lean();

          const vendorStateMap = new Map();
          for (const kyc of kycForState) {
            const store = pickPrimaryStore(kyc?.storeManagement?.stores || []);
            if (!store) continue;
            vendorStateMap.set(
              String(kyc.vendorId),
              String(extractStateFromStore(store) || '').toLowerCase(),
            );
          }

          visible = visible.filter((product) => {
            const vendorState = vendorStateMap.get(
              String(product.vendorId || ''),
            );
            return vendorState !== normalizedState; // drop this state's services
          });
        }
      }
    }

    const disabledCities = await City.find({ serviceEnabled: false })
      .select('cityKey')
      .lean();

    if (disabledCities.length > 0) {
      const disabledKeys = new Set(disabledCities.map((c) => c.cityKey));

      const vendorIds = [
        ...new Set(
          visible.map((p) => String(p.vendorId || '')).filter(Boolean),
        ),
      ];

      const kycRows = await VendorKyc.find({ vendorId: { $in: vendorIds } })
        .select('vendorId storeManagement.stores')
        .lean();

      const vendorCityMap = new Map();
      for (const kyc of kycRows) {
        const store = pickPrimaryStore(kyc?.storeManagement?.stores || []);
        if (!store) continue;
        const cityName = extractCityFromStore(store);
        vendorCityMap.set(String(kyc.vendorId), cityName.trim().toLowerCase());
      }

      visible = visible.filter((product) => {
        const cityKey = vendorCityMap.get(String(product.vendorId || ''));
        if (!cityKey) return true;
        return !disabledKeys.has(cityKey);
      });
    }

    return res
      .status(200)
      .json({ products: visible.map(projectPublicServiceProduct) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getServiceProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userLat, userLng } = req.query;

    const product = await ServiceProduct.findOne({
      _id: id,
      ...publicServiceProductQuery,
    }).lean();

    if (!product) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const hasUserLocation =
      Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng));
    const [visible] = await filterByActiveVendorStores(
      [product],
      hasUserLocation ? Number(userLat) : undefined,
      hasUserLocation ? Number(userLng) : undefined,
    );
    if (!visible) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // return res.status(200).json({ product: visible });
    // Look up subcategory tax by name
    let subCategoryTax = null;
    if (visible.subCategory) {
      const subCatDoc = await SubCategory.findOne({ name: visible.subCategory })
        .select(
          'defaultGst defaultCareTax defaultRepairWarranty defaultRelocationWarranty defaultDeliveryPackaging defaultInstallationFee defaultPlatformFee taxBlocked',
        )
        .lean();
      if (subCatDoc) subCategoryTax = subCatDoc;
    }
    if (!subCategoryTax && visible.category) {
      const catDoc = await Category.findOne({ name: visible.category })
        .select(
          'defaultGst defaultCareTax defaultRepairWarranty defaultRelocationWarranty defaultDeliveryPackaging defaultInstallationFee defaultPlatformFee taxBlocked',
        )
        .lean();
      if (catDoc) subCategoryTax = catDoc;
    }

    // return res.status(200).json({
    //   product: { ...visible, subCategoryTax: subCategoryTax || {} },
    // });
    // Also check if parent category is taxBlocked
    // let categoryBlocked = false;
    // if (visible.category) {
    //   const catDoc = await Category.findOne({ name: visible.category })
    //     .select('taxBlocked')
    //     .lean();
    //   if (catDoc?.taxBlocked) categoryBlocked = true;
    // }

    // return res.status(200).json({
    //   product: {
    //     ...visible,
    //     subCategoryTax: subCategoryTax || {},
    //     // taxBlocked = true if either category OR subcategory is blocked
    //     taxBlocked: categoryBlocked || (subCategoryTax?.taxBlocked ?? false),
    //   },
    // });

    // Check parent category block — same pattern as getProductById rental controller
    if (subCategoryTax && subCategoryTax._id) {
      // subCategoryTax has its own _id, find its parent category by ObjectId
      const subCatFull = await SubCategory.findById(subCategoryTax._id)
        .select('category')
        .lean();
      if (subCatFull?.category) {
        const parentCatDoc = await Category.findById(subCatFull.category)
          .select('taxBlocked')
          .lean();
        if (parentCatDoc?.taxBlocked) {
          subCategoryTax = { ...subCategoryTax, taxBlocked: true };
        }
      }
    } else if (visible.category) {
      // fallback: name-based category lookup
      const catDoc = await Category.findOne({ name: visible.category })
        .select('taxBlocked')
        .lean();
      if (catDoc?.taxBlocked && subCategoryTax) {
        subCategoryTax = { ...subCategoryTax, taxBlocked: true };
      }
    }

    return res.status(200).json({
      product: {
        ...visible,
        subCategoryTax: subCategoryTax || {},
        taxBlocked: subCategoryTax?.taxBlocked ?? false,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addServiceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, tags, bookingId } = req.body;
    const userId = req.user._id;

    const product = await ServiceProduct.findById(id);
    if (!product) return res.status(404).json({ message: 'Service not found' });

    const uploadedImages = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files.slice(0, 5)) {
        const imgRes = await uploadImageToCloudinary(file.buffer, 'reviews');
        uploadedImages.push(imgRes.secure_url);
      }
    }

    const alreadyReviewed = product.reviews.find(
      (r) => String(r.userId) === String(userId),
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment || '';
      alreadyReviewed.tags =
        typeof tags === 'string' ? JSON.parse(tags) : tags || [];

      if (uploadedImages.length > 0) {
        alreadyReviewed.images = [
          ...(alreadyReviewed.images || []),
          ...uploadedImages,
        ];
      }
    } else {
      product.reviews.push({
        userId,
        name: req.user.fullName || req.user.name || 'User',
        rating: Number(rating),
        comment: comment || '',
        tags: typeof tags === 'string' ? JSON.parse(tags) : tags || [],
        images: uploadedImages,
      });
    }

    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.numReviews;

    await product.save();
    return res.status(200).json({ message: 'Review submitted', product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyServiceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingId } = req.query;
    const userId = req.user._id;

    const product = await ServiceProduct.findById(id).select('reviews');
    if (!product) return res.status(404).json({ message: 'Not found' });

    const review = product.reviews.find(
      (r) => String(r.userId) === String(userId),
    );
    return res
      .status(200)
      .json({ exists: Boolean(review), review: review || null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRelatedServices = async (req, res) => {
  try {
    const { id } = req.params;

    const currentService = await ServiceProduct.findOne({
      _id: id,
      ...publicServiceProductQuery,
    }).lean();

    if (!currentService) {
      return res.status(404).json({
        message: 'Service not found',
      });
    }

    const relatedServices = await ServiceProduct.find({
      _id: { $ne: currentService._id },

      category: currentService.category,
      subCategory: currentService.subCategory,

      ...publicServiceProductQuery,
    })
      .select(
        '_id productName image price averageRating numReviews availabilitySchedule',
      )
      .limit(6)
      .lean();

    return res.status(200).json({
      services: relatedServices,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
