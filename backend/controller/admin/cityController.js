// // import VendorKyc from '../../models/VendorKyc.js';
// // import City from '../../models/City.js';

// // const extractCityFromStore = (store = {}) => {
// //   const mapAddress = String(store.mapAddress || '').trim();
// //   if (mapAddress) {
// //     const parts = mapAddress
// //       .split(',')
// //       .map((x) => x.trim())
// //       .filter(Boolean);
// //     if (parts.length >= 3) return parts[parts.length - 3];
// //     if (parts.length >= 2) return parts[parts.length - 2];
// //     return parts[0] || 'Unknown';
// //   }
// //   const address = String(store.completeAddress || '').trim();
// //   if (!address) return 'Unknown';
// //   const tokens = address
// //     .split(',')
// //     .map((x) => x.trim())
// //     .filter(Boolean);
// //   if (tokens.length >= 2) return tokens[tokens.length - 2];
// //   return tokens[0] || 'Unknown';
// // };

// // const extractStateFromStore = (store = {}) => {
// //   const parts = String(store.mapAddress || '')
// //     .split(',')
// //     .map((x) => x.trim())
// //     .filter(Boolean);
// //   return parts.length >= 2 ? parts[parts.length - 2] : '';
// // };

// // export const getAdminCities = async (req, res) => {
// //   try {
// //     const kycRows = await VendorKyc.find({})
// //       .select('storeManagement.stores')
// //       .lean();

// //     const cityMap = new Map();
// //     for (const kyc of kycRows || []) {
// //       const stores = kyc?.storeManagement?.stores ?? [];
// //       for (const store of stores) {
// //         const cityName = extractCityFromStore(store);
// //         const state = extractStateFromStore(store);
// //         if (!cityName || cityName === 'Unknown') continue;
// //         const key = cityName.trim().toLowerCase();
// //         if (!cityMap.has(key)) {
// //           cityMap.set(key, {
// //             cityName: cityName.trim(),
// //             state,
// //             storeCount: 0,
// //             hasActiveStore: false,

// //             latitude: Number(store.mapLat) || null,
// //             longitude: Number(store.mapLng) || null,
// //           });
// //         }
// //         const entry = cityMap.get(key);
// //         entry.storeCount += 1;
// //         if (store.isActive !== false) entry.hasActiveStore = true;

// //         if (!entry.latitude && store.mapLat)
// //           entry.latitude = Number(store.mapLat);
// //         if (!entry.longitude && store.mapLng)
// //           entry.longitude = Number(store.mapLng);
// //       }
// //     }

// //     const cityKeys = [...cityMap.keys()];

// //     const existingDocs = await City.find({
// //       cityKey: { $in: cityKeys },
// //       isDeleted: { $ne: true },
// //     }).lean();
// //     const existingMap = new Map(existingDocs.map((d) => [d.cityKey, d]));

// //     const upsertOps = [];
// //     for (const [key, data] of cityMap.entries()) {
// //       const existing = existingMap.get(key);

// //       if (!existing || existing.isDeleted) {
// //         upsertOps.push({
// //           updateOne: {
// //             filter: { cityKey: key },
// //             update: {
// //               $setOnInsert: {
// //                 cityKey: key,
// //                 cityName: data.cityName,
// //                 state: data.state,
// //                 country: 'India',
// //                 serviceEnabled: true,
// //                 latitude: data.latitude,
// //                 longitude: data.longitude,
// //               },
// //             },
// //             upsert: true,
// //           },
// //         });
// //       } else {
// //         const existing = existingMap.get(key);
// //         if (
// //           (!existing.latitude || !existing.longitude) &&
// //           data.latitude &&
// //           data.longitude
// //         ) {
// //           upsertOps.push({
// //             updateOne: {
// //               filter: { cityKey: key },
// //               update: {
// //                 $set: { latitude: data.latitude, longitude: data.longitude },
// //               },
// //             },
// //           });
// //         }
// //       }
// //     }
// //     if (upsertOps.length > 0) await City.bulkWrite(upsertOps);

// //     const allDocs = await City.find({
// //       cityKey: { $in: cityKeys },
// //       isDeleted: { $ne: true },
// //     }).lean();
// //     const docMap = new Map(allDocs.map((d) => [d.cityKey, d]));

// //     let idx = 1;
// //     const cities = [];
// //     for (const [key, data] of cityMap.entries()) {
// //       const doc = docMap.get(key);
// //       cities.push({
// //         id: `CTY-${String(idx++).padStart(3, '0')}`,
// //         cityKey: key,
// //         city: data.cityName,
// //         state: doc?.state || data.state,
// //         country: doc?.country || 'India',

// //         latitude: doc?.latitude ?? data.latitude ?? null,
// //         longitude: doc?.longitude ?? data.longitude ?? null,
// //         storeCount: data.storeCount,
// //         hasActiveStore: data.hasActiveStore,
// //         serviceEnabled: doc?.serviceEnabled !== false,
// //       });
// //     }

// //     return res.json({ cities });
// //   } catch (error) {
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// // export const patchCityServiceStatus = async (req, res) => {
// //   try {
// //     const { cityKey } = req.params;
// //     const raw = req.body?.serviceEnabled;
// //     const serviceEnabled = raw === true || raw === 'true';

// //     const city = await City.findOneAndUpdate(
// //       { cityKey: cityKey.toLowerCase() },
// //       { serviceEnabled, updatedBy: String(req?.admin?.email || 'admin') },
// //       { new: true, upsert: true },
// //     );

// //     return res.json({
// //       message: `Service listings ${serviceEnabled ? 'enabled' : 'disabled'} for ${cityKey}.`,
// //       city,
// //     });
// //   } catch (error) {
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// // export const deleteCity = async (req, res) => {
// //   try {
// //     const cityKey = req.params.cityKey?.trim().toLowerCase();

// //     if (!cityKey) {
// //       return res.status(400).json({
// //         message: 'cityKey is required',
// //       });
// //     }

// //     const city = await City.findOneAndUpdate(
// //       {
// //         cityKey: { $regex: `^${cityKey}$`, $options: 'i' },
// //       },
// //       {
// //         isDeleted: true,
// //         serviceEnabled: false,
// //         updatedBy: req?.admin?.email || 'admin',
// //       },
// //       { new: true },
// //     );

// //     if (!city) {
// //       return res.status(404).json({
// //         message: 'City not found',
// //       });
// //     }

// //     return res.json({
// //       success: true,
// //       message: `City "${city.cityName}" deleted successfully`,
// //       city,
// //     });
// //   } catch (error) {
// //     return res.status(500).json({
// //       message: error.message,
// //     });
// //   }
// // };

// import VendorKyc from '../../models/VendorKyc.js';
// import City from '../../models/City.js';
// import Order from '../../models/Order.js';
// import Product from '../../models/Product.js';
// import Vendor from '../../models/vendorAuthModel.js';

// // const extractCityFromStore = (store = {}) => {
// //   const mapAddress = String(store.mapAddress || '').trim();
// //   if (mapAddress) {
// //     const parts = mapAddress
// //       .split(',')
// //       .map((x) => x.trim())
// //       .filter(Boolean);
// //     if (parts.length >= 3) return parts[parts.length - 3];
// //     if (parts.length >= 2) return parts[parts.length - 2];
// //     return parts[0] || 'Unknown';
// //   }
// //   const address = String(store.completeAddress || '').trim();
// //   if (!address) return 'Unknown';
// //   const tokens = address
// //     .split(',')
// //     .map((x) => x.trim())
// //     .filter(Boolean);
// //   if (tokens.length >= 2) return tokens[tokens.length - 2];
// //   return tokens[0] || 'Unknown';
// // };
// // AFTER
// const extractCityFromStore = (store = {}) => {
//   const mapAddress = String(store.mapAddress || '').trim();
//   if (mapAddress) {
//     const first = mapAddress.split(',')?.[0]?.trim();
//     if (first) return first;
//   }
//   const address = String(store.completeAddress || '').trim();
//   if (!address) return 'Unknown';
//   return address.split(',')?.[0]?.trim() || 'Unknown';
// };

// // const extractStateFromStore = (store = {}) => {
// //   const parts = String(store.mapAddress || '')
// //     .split(',')
// //     .map((x) => x.trim())
// //     .filter(Boolean);
// //   return parts.length >= 2 ? parts[parts.length - 2] : '';
// // };
// // AFTER
// const extractStateFromStore = (store = {}) => {
//   const parts = String(store.mapAddress || '')
//     .split(',')
//     .map((x) => x.trim())
//     .filter(Boolean);
//   // State is 3rd from end e.g. ["Kochi","Ernakulam","Kerala","682001","India"]
//   return parts.length >= 3 ? parts[parts.length - 3] : parts[1] || '';
// };

// export const getAdminCities = async (req, res) => {
//   try {
//     const kycRows = await VendorKyc.find({})
//       .select('storeManagement.stores')
//       .lean();

//     const cityMap = new Map();
//     for (const kyc of kycRows || []) {
//       const stores = kyc?.storeManagement?.stores ?? [];
//       for (const store of stores) {
//         const cityName = extractCityFromStore(store);
//         const state = extractStateFromStore(store);
//         if (!cityName || cityName === 'Unknown') continue;
//         const key = cityName.trim().toLowerCase();
//         if (!cityMap.has(key)) {
//           cityMap.set(key, {
//             cityName: cityName.trim(),
//             state,
//             storeCount: 0,
//             hasActiveStore: false,

//             latitude: Number(store.mapLat) || null,
//             longitude: Number(store.mapLng) || null,
//           });
//         }
//         const entry = cityMap.get(key);
//         entry.storeCount += 1;
//         if (store.isActive !== false) entry.hasActiveStore = true;

//         if (!entry.latitude && store.mapLat)
//           entry.latitude = Number(store.mapLat);
//         if (!entry.longitude && store.mapLng)
//           entry.longitude = Number(store.mapLng);
//       }
//     }

//     const cityKeys = [...cityMap.keys()];

//     const existingDocs = await City.find({
//       cityKey: { $in: cityKeys },
//       isDeleted: { $ne: true },
//     }).lean();
//     const existingMap = new Map(existingDocs.map((d) => [d.cityKey, d]));

//     const upsertOps = [];
//     for (const [key, data] of cityMap.entries()) {
//       const existing = existingMap.get(key);

//       if (!existing || existing.isDeleted) {
//         upsertOps.push({
//           updateOne: {
//             filter: { cityKey: key },
//             update: {
//               $setOnInsert: {
//                 cityKey: key,
//                 cityName: data.cityName,
//                 state: data.state,
//                 country: 'India',
//                 serviceEnabled: true,
//                 latitude: data.latitude,
//                 longitude: data.longitude,
//               },
//             },
//             upsert: true,
//           },
//         });
//       } else {
//         const existing = existingMap.get(key);
//         if (
//           (!existing.latitude || !existing.longitude) &&
//           data.latitude &&
//           data.longitude
//         ) {
//           upsertOps.push({
//             updateOne: {
//               filter: { cityKey: key },
//               update: {
//                 $set: { latitude: data.latitude, longitude: data.longitude },
//               },
//             },
//           });
//         }
//       }
//     }
//     if (upsertOps.length > 0) await City.bulkWrite(upsertOps);

//     const allDocs = await City.find({
//       cityKey: { $in: cityKeys },
//       isDeleted: { $ne: true },
//     }).lean();
//     const docMap = new Map(allDocs.map((d) => [d.cityKey, d]));

//     let idx = 1;
//     const cities = [];
//     for (const [key, data] of cityMap.entries()) {
//       const doc = docMap.get(key);
//       cities.push({
//         id: `CTY-${String(idx++).padStart(3, '0')}`,
//         cityKey: key,
//         city: data.cityName,
//         state: doc?.state || data.state,
//         country: doc?.country || 'India',

//         latitude: doc?.latitude ?? data.latitude ?? null,
//         longitude: doc?.longitude ?? data.longitude ?? null,
//         storeCount: data.storeCount,
//         hasActiveStore: data.hasActiveStore,
//         serviceEnabled: doc?.serviceEnabled !== false,
//       });
//     }

//     return res.json({ cities });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const patchCityServiceStatus = async (req, res) => {
//   try {
//     const { cityKey } = req.params;
//     const raw = req.body?.serviceEnabled;
//     const serviceEnabled = raw === true || raw === 'true';

//     const city = await City.findOneAndUpdate(
//       { cityKey: cityKey.toLowerCase() },
//       { serviceEnabled, updatedBy: String(req?.admin?.email || 'admin') },
//       { new: true, upsert: true },
//     );

//     return res.json({
//       message: `Service listings ${serviceEnabled ? 'enabled' : 'disabled'} for ${cityKey}.`,
//       city,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const deleteCity = async (req, res) => {
//   try {
//     const cityKey = req.params.cityKey?.trim().toLowerCase();

//     if (!cityKey) {
//       return res.status(400).json({
//         message: 'cityKey is required',
//       });
//     }

//     const city = await City.findOneAndUpdate(
//       {
//         cityKey: { $regex: `^${cityKey}$`, $options: 'i' },
//       },
//       {
//         isDeleted: true,
//         serviceEnabled: false,
//         updatedBy: req?.admin?.email || 'admin',
//       },
//       { new: true },
//     );

//     if (!city) {
//       return res.status(404).json({
//         message: 'City not found',
//       });
//     }

//     return res.json({
//       success: true,
//       message: `City "${city.cityName}" deleted successfully`,
//       city,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// function getPeriodStart(period) {
//   const now = Date.now();
//   if (period === 'today') {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0);
//     return d;
//   }
//   if (period === 'week') return new Date(now - 7 * 86400_000);
//   if (period === 'month') return new Date(now - 30 * 86400_000);
//   if (period === 'quarter') return new Date(now - 91 * 86400_000);
//   if (period === 'year') return new Date(now - 365 * 86400_000);
//   return new Date(0);
// }

// export const getCityStats = async (req, res) => {
//   try {
//     const { city, period = 'month' } = req.query;
//     const from = getPeriodStart(period);
//     const dateFilter = { createdAt: { $gte: from } };
//     // const hasCityFilter = city && city !== 'all';
//     const hasCityFilter = city && city !== 'all';
//     const cityRegex = hasCityFilter
//       ? new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
//       : null;

//     // Cities dropdown
//     const cities = await City.find(
//       { serviceEnabled: true, isDeleted: { $ne: true } },
//       { cityKey: 1, cityName: 1, _id: 0 },
//     )
//       .sort({ cityName: 1 })
//       .lean();

//     // Orders
//     // const orders = await Order.find({
//     //   ...dateFilter,
//     //   ...(hasCityFilter ? { city } : {}),
//     // }).lean();
//     const orders = await Order.find({
//       ...dateFilter,
//       ...(hasCityFilter ? { city: cityRegex } : {}),
//     }).lean();

//     const grossRevenue = orders.reduce(
//       (s, o) => s + (o.baseRentalCost || 0),
//       0,
//     );
//     const commission = Math.round(grossRevenue * 0.1);
//     const gstTax = orders.reduce((s, o) => s + (o.gst || 0), 0);
//     const careTax = orders.reduce((s, o) => s + (o.careProtection || 0), 0);
//     const lateFees = orders.reduce((s, o) => s + (o.lateFee || 0), 0);
//     const pendingSettlement = orders
//       .filter((o) => o.status === 'delivered')
//       .reduce((s, o) => s + (o.baseRentalCost || 0), 0);
//     const pendingRefunds = orders
//       .filter((o) => o.status === 'cancelled')
//       .reduce((s, o) => s + (o.refundableDeposit || 0), 0);
//     const openTickets = orders.filter((o) => o.status === 'pending').length;
//     const uniqueCustomers = new Set(orders.map((o) => String(o.user))).size;

//     // Products
//     // const productMatch = {
//     //   ...dateFilter,
//     //   ...(hasCityFilter ? { 'logisticsVerification.city': city } : {}),
//     // };
//     // const productMatch = {
//     //   ...dateFilter,
//     //   ...(hasCityFilter ? { 'logisticsVerification.city': cityRegex } : {}),
//     // };
//     // const [activeProducts, totalProducts] = await Promise.all([
//     //   Product.countDocuments({
//     //     ...productMatch,
//     //     isAdminApproved: true,
//     //     status: 'Active',
//     //   }),
//     //   Product.countDocuments(productMatch),
//     // ]);

//     // Products — fall back to vendor.city when the product's own city is blank
//     const productAgg = await Product.aggregate([
//       { $match: dateFilter },
//       {
//         $lookup: {
//           from: 'vendors',
//           localField: 'vendorId',
//           foreignField: '_id',
//           as: 'vendor',
//         },
//       },
//       { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
//       ...(hasCityFilter
//         ? [
//             {
//               $match: {
//                 $or: [
//                   { 'logisticsVerification.city': cityRegex },
//                   { 'vendor.city': cityRegex },
//                 ],
//               },
//             },
//           ]
//         : []),
//       {
//         $group: {
//           _id: null,
//           totalProducts: { $sum: 1 },
//           activeProducts: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $eq: ['$isAdminApproved', true] },
//                     { $eq: ['$status', 'Active'] },
//                   ],
//                 },
//                 1,
//                 0,
//               ],
//             },
//           },
//         },
//       },
//     ]);

//     const totalProducts = productAgg[0]?.totalProducts || 0;
//     const activeProducts = productAgg[0]?.activeProducts || 0;

//     // Live Partners
//     // const livePartners = await Vendor.countDocuments({
//     //   isVerified: true,
//     //   ...(hasCityFilter ? { city } : {}),
//     // });
//     const livePartners = await Vendor.countDocuments({
//       isVerified: true,
//       ...(hasCityFilter ? { city: cityRegex } : {}),
//     });

//     return res.json({
//       success: true,
//       data: {
//         cities,
//         activeProducts,
//         totalProducts,
//         uniqueCustomers,
//         livePartners,
//         openTickets,
//         grossRevenue,
//         commission,
//         pendingSettlement,
//         pendingRefunds,
//         gstTax,
//         careTax,
//         lateFees,
//       },
//     });
//   } catch (err) {
//     console.error('getCityStats:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// import VendorKyc from '../../models/VendorKyc.js';
// import City from '../../models/City.js';

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

// const extractStateFromStore = (store = {}) => {
//   const parts = String(store.mapAddress || '')
//     .split(',')
//     .map((x) => x.trim())
//     .filter(Boolean);
//   return parts.length >= 2 ? parts[parts.length - 2] : '';
// };

import VendorKyc from '../../models/VendorKyc.js';
import City from '../../models/City.js';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const NON_CITY_KEYWORDS = [
  'district',
  'subdistrict',
  'sub-district',
  'taluk',
  'tehsil',
  'division',
  'mandal',
  'india',
];

const findStateIndex = (parts = []) =>
  parts.findIndex((p) =>
    INDIAN_STATES.some((s) => s.toLowerCase() === p.toLowerCase()),
  );

const getAddressParts = (store = {}) => {
  const mapAddress = String(store.mapAddress || '').trim();
  const source = mapAddress || String(store.completeAddress || '').trim();
  return source
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
};

// const extractCityFromStore = (store = {}) => {
//   const parts = getAddressParts(store);
//   if (parts.length === 0) return 'Unknown';

//   const stateIndex = findStateIndex(parts);
//   if (stateIndex > 0) {
//     for (let i = stateIndex - 1; i >= 0; i--) {
//       const candidate = parts[i];
//       const isNonCity = NON_CITY_KEYWORDS.some((kw) =>
//         candidate.toLowerCase().includes(kw),
//       );
//       if (!isNonCity && !/^\d+$/.test(candidate)) return candidate;
//     }
//   }

//   if (parts.length >= 3) return parts[parts.length - 3];
//   if (parts.length >= 2) return parts[parts.length - 2];
//   return parts[0] || 'Unknown';
// };
const ADMIN_SUFFIX_REGEX =
  /\s+(city subdistrict|subdistrict|district|taluk|tehsil|mandal|division)$/i;

const extractCityFromStore = (store = {}) => {
  const parts = getAddressParts(store);
  if (parts.length === 0) return 'Unknown';
  const stateIndex = findStateIndex(parts);
  if (stateIndex > 0) {
    for (let i = stateIndex - 1; i >= 0; i--) {
      const candidate = parts[i];

      // If this segment IS an admin layer (e.g. "Pune District",
      // "Pune City Subdistrict"), strip the suffix and use what's left
      // immediately — that's the real city — instead of skipping past
      // it and wrongly landing on an earlier locality name.
      if (ADMIN_SUFFIX_REGEX.test(candidate)) {
        const stripped = candidate.replace(ADMIN_SUFFIX_REGEX, '').trim();
        if (stripped) return stripped;
        continue;
      }

      const isNonCity = NON_CITY_KEYWORDS.some((kw) =>
        candidate.toLowerCase().includes(kw),
      );
      if (!isNonCity && !/^\d+$/.test(candidate)) return candidate;
    }
  }
  if (parts.length >= 3) return parts[parts.length - 3];
  if (parts.length >= 2) return parts[parts.length - 2];
  return parts[0] || 'Unknown';
};

const extractStateFromStore = (store = {}) => {
  const parts = getAddressParts(store);
  const stateIndex = findStateIndex(parts);
  if (stateIndex !== -1) return parts[stateIndex];

  return parts.length >= 2 ? parts[parts.length - 2] : '';
};

// export const getAdminCities = async (req, res) => {
//   try {
//     const kycRows = await VendorKyc.find({})
//       .select('storeManagement.stores')
//       .lean();

//     const cityMap = new Map();
//     for (const kyc of kycRows || []) {
//       const stores = kyc?.storeManagement?.stores ?? [];
//       for (const store of stores) {
//         const cityName = extractCityFromStore(store);
//         const state = extractStateFromStore(store);
//         if (!cityName || cityName === 'Unknown') continue;
//         const key = cityName.trim().toLowerCase();
//         if (!cityMap.has(key)) {
//           cityMap.set(key, {
//             cityName: cityName.trim(),
//             state,
//             storeCount: 0,
//             hasActiveStore: false,

//             latitude: Number(store.mapLat) || null,
//             longitude: Number(store.mapLng) || null,
//           });
//         }
//         const entry = cityMap.get(key);
//         entry.storeCount += 1;
//         if (store.isActive !== false) entry.hasActiveStore = true;

//         if (!entry.latitude && store.mapLat)
//           entry.latitude = Number(store.mapLat);
//         if (!entry.longitude && store.mapLng)
//           entry.longitude = Number(store.mapLng);
//       }
//     }

//     const cityKeys = [...cityMap.keys()];

//     const existingDocs = await City.find({
//       cityKey: { $in: cityKeys },
//       isDeleted: { $ne: true },
//     }).lean();
//     const existingMap = new Map(existingDocs.map((d) => [d.cityKey, d]));

//     const upsertOps = [];
//     for (const [key, data] of cityMap.entries()) {
//       const existing = existingMap.get(key);

//       if (!existing || existing.isDeleted) {
//         upsertOps.push({
//           updateOne: {
//             filter: { cityKey: key },
//             update: {
//               $setOnInsert: {
//                 cityKey: key,
//                 cityName: data.cityName,
//                 state: data.state,
//                 country: 'India',
//                 serviceEnabled: true,
//                 latitude: data.latitude,
//                 longitude: data.longitude,
//               },
//             },
//             upsert: true,
//           },
//         });
//       } else {
//         const existing = existingMap.get(key);
//         if (
//           (!existing.latitude || !existing.longitude) &&
//           data.latitude &&
//           data.longitude
//         ) {
//           upsertOps.push({
//             updateOne: {
//               filter: { cityKey: key },
//               update: {
//                 $set: { latitude: data.latitude, longitude: data.longitude },
//               },
//             },
//           });
//         }
//       }
//     }
//     if (upsertOps.length > 0) await City.bulkWrite(upsertOps);

//     const allDocs = await City.find({
//       cityKey: { $in: cityKeys },
//       isDeleted: { $ne: true },
//     }).lean();
//     const docMap = new Map(allDocs.map((d) => [d.cityKey, d]));

//     let idx = 1;
//     const cities = [];
//     for (const [key, data] of cityMap.entries()) {
//       const doc = docMap.get(key);
//       cities.push({
//         id: `CTY-${String(idx++).padStart(3, '0')}`,
//         cityKey: key,
//         city: data.cityName,
//         state: doc?.state || data.state,
//         country: doc?.country || 'India',

//         latitude: doc?.latitude ?? data.latitude ?? null,
//         longitude: doc?.longitude ?? data.longitude ?? null,
//         storeCount: data.storeCount,
//         hasActiveStore: data.hasActiveStore,
//         serviceEnabled: doc?.serviceEnabled !== false,
//       });
//     }

//     return res.json({ cities });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const getAdminCities = async (req, res) => {
  try {
    const isSubadmin = req.admin?.role === 'subadmin';
    const subadminCity = isSubadmin
      ? String(req.admin.location || '')
          .trim()
          .toLowerCase()
      : null;

    const kycRows = await VendorKyc.find({})
      .select('storeManagement.stores')
      .lean();

    const cityMap = new Map();
    for (const kyc of kycRows || []) {
      const stores = kyc?.storeManagement?.stores ?? [];
      for (const store of stores) {
        // const cityName = extractCityFromStore(store);
        // const state = extractStateFromStore(store);
        // if (!cityName || cityName === 'Unknown') continue;
        // const key = cityName.trim().toLowerCase();
        const cityName = extractCityFromStore(store);
        const state = extractStateFromStore(store);
        if (!cityName || cityName === 'Unknown') continue;
        const key = cityName.trim().toLowerCase();
        if (subadminCity && key !== subadminCity) continue;
        if (!cityMap.has(key)) {
          cityMap.set(key, {
            cityName: cityName.trim(),
            state,
            storeCount: 0,
            hasActiveStore: false,

            latitude: Number(store.mapLat) || null,
            longitude: Number(store.mapLng) || null,
          });
        }
        const entry = cityMap.get(key);
        entry.storeCount += 1;
        if (store.isActive !== false) entry.hasActiveStore = true;

        if (!entry.latitude && store.mapLat)
          entry.latitude = Number(store.mapLat);
        if (!entry.longitude && store.mapLng)
          entry.longitude = Number(store.mapLng);
      }
    }

    const cityKeys = [...cityMap.keys()];

    const existingDocs = await City.find({
      cityKey: { $in: cityKeys },
      isDeleted: { $ne: true },
    }).lean();
    const existingMap = new Map(existingDocs.map((d) => [d.cityKey, d]));

    const upsertOps = [];
    for (const [key, data] of cityMap.entries()) {
      const existing = existingMap.get(key);

      if (!existing || existing.isDeleted) {
        upsertOps.push({
          updateOne: {
            filter: { cityKey: key },
            update: {
              $setOnInsert: {
                cityKey: key,
                cityName: data.cityName,
                state: data.state,
                country: 'India',
                serviceEnabled: true,
                latitude: data.latitude,
                longitude: data.longitude,
              },
            },
            upsert: true,
          },
        });
      } else {
        const existing = existingMap.get(key);
        if (
          (!existing.latitude || !existing.longitude) &&
          data.latitude &&
          data.longitude
        ) {
          upsertOps.push({
            updateOne: {
              filter: { cityKey: key },
              update: {
                $set: { latitude: data.latitude, longitude: data.longitude },
              },
            },
          });
        }
      }
    }
    if (upsertOps.length > 0) await City.bulkWrite(upsertOps);

    const allDocs = await City.find({
      cityKey: { $in: cityKeys },
      isDeleted: { $ne: true },
    }).lean();
    const docMap = new Map(allDocs.map((d) => [d.cityKey, d]));

    let idx = 1;
    const cities = [];
    for (const [key, data] of cityMap.entries()) {
      const doc = docMap.get(key);
      cities.push({
        id: `CTY-${String(idx++).padStart(3, '0')}`,
        cityKey: key,
        city: data.cityName,
        state: doc?.state || data.state,
        country: doc?.country || 'India',

        latitude: doc?.latitude ?? data.latitude ?? null,
        longitude: doc?.longitude ?? data.longitude ?? null,
        storeCount: data.storeCount,
        hasActiveStore: data.hasActiveStore,
        serviceEnabled: doc?.serviceEnabled !== false,
      });
    }

    return res.json({ cities });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const patchCityServiceStatus = async (req, res) => {
  try {
    const { cityKey } = req.params;
    const raw = req.body?.serviceEnabled;
    const serviceEnabled = raw === true || raw === 'true';

    const city = await City.findOneAndUpdate(
      { cityKey: cityKey.toLowerCase() },
      { serviceEnabled, updatedBy: String(req?.admin?.email || 'admin') },
      { new: true, upsert: true },
    );

    return res.json({
      message: `Service listings ${serviceEnabled ? 'enabled' : 'disabled'} for ${cityKey}.`,
      city,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const cityKey = req.params.cityKey?.trim().toLowerCase();

    if (!cityKey) {
      return res.status(400).json({
        message: 'cityKey is required',
      });
    }

    const city = await City.findOneAndUpdate(
      {
        cityKey: { $regex: `^${cityKey}$`, $options: 'i' },
      },
      {
        isDeleted: true,
        serviceEnabled: false,
        updatedBy: req?.admin?.email || 'admin',
      },
      { new: true },
    );

    if (!city) {
      return res.status(404).json({
        message: 'City not found',
      });
    }

    return res.json({
      success: true,
      message: `City "${city.cityName}" deleted successfully`,
      city,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
