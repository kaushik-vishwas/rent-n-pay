// import VendorKyc from '../models/VendorKyc.js';
// import Product from '../models/Product.js';
// import { extractCityFromAddress } from './extractCityFromAddress.js';

// const ADMIN_SUFFIX_REGEX =
//   /\s+(city subdistrict|subdistrict|district|taluk|tehsil|mandal|division)$/i;

// const normalize = (s) =>
//   String(s || '')
//     .replace(ADMIN_SUFFIX_REGEX, '')
//     .trim()
//     .toLowerCase();

// // Robust match: instead of guessing a single fixed position in the comma
// // list (which breaks when addresses have varying numbers of segments,
// // e.g. an extra pincode segment), scan EVERY part of the address and
// // check if any of them — after stripping admin-layer suffixes like
// // "District"/"Subdistrict" — matches the subadmin's city.
// const addressMatchesCity = (mapAddress, targetCity) => {
//   const target = normalize(targetCity);
//   if (!target) return false;

//   const parts = String(mapAddress || '')
//     .split(',')
//     .map((s) => s.trim())
//     .filter(Boolean);

//   return parts.some((part) => {
//     const cleaned = normalize(part);
//     if (!cleaned) return false;
//     return (
//       cleaned === target || cleaned.includes(target) || target.includes(cleaned)
//     );
//   });
// };

// // Returns array of Product _id's belonging to subadmin's city, or null if admin (no restriction)
// export const getCityProductIds = async (req) => {
//   if (req.admin.role !== 'subadmin' || !req.admin.location) return null;

//   const city = req.admin.location;

//   // Fetch all vendor stores — city isn't reliably stored, so we can't filter
//   // this in the DB query itself; we compute it per-store below instead.
//   const kycDocs = await VendorKyc.find({}, { 'storeManagement.stores': 1 });

//   const storeIds = [];
//   kycDocs.forEach((doc) => {
//     doc.storeManagement.stores.forEach((store) => {
//       // Prefer the stored city if it happens to be set; otherwise check
//       // every segment of the full mapAddress against the subadmin's city.
//       const storeCityField = String(store.city || '')
//         .trim()
//         .toLowerCase();
//       const targetCity = String(city || '')
//         .trim()
//         .toLowerCase();

//       const matches =
//         (storeCityField && storeCityField === targetCity) ||
//         addressMatchesCity(store.mapAddress, city);

//       if (matches) storeIds.push(String(store._id));
//     });
//   });

//   const products = await Product.find(
//     { storeId: { $in: storeIds } },
//     { _id: 1 },
//   );
//   return products.map((p) => p._id);
// };

import VendorKyc from '../models/VendorKyc.js';
import Product from '../models/Product.js';
import { extractCityFromAddress } from './extractCityFromAddress.js';

const ADMIN_SUFFIX_REGEX =
  /\s+(city subdistrict|subdistrict|district|taluk|tehsil|mandal|division)$/i;

const normalize = (s) =>
  String(s || '')
    .replace(ADMIN_SUFFIX_REGEX, '')
    .trim()
    .toLowerCase();

// Robust match: instead of guessing a single fixed position in the comma
// list (which breaks when addresses have varying numbers of segments,
// e.g. an extra pincode segment), scan EVERY part of the address and
// check if any of them — after stripping admin-layer suffixes like
// "District"/"Subdistrict" — matches the subadmin's city.
const addressMatchesCity = (mapAddress, targetCity) => {
  const target = normalize(targetCity);
  if (!target) return false;

  const parts = String(mapAddress || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.some((part) => {
    const cleaned = normalize(part);
    if (!cleaned) return false;
    return (
      cleaned === target || cleaned.includes(target) || target.includes(cleaned)
    );
  });
};

// Returns array of Product _id's belonging to subadmin's city, or null if admin (no restriction)
// export const getCityProductIds = async (req) => {
//   if (req.admin.role !== 'subadmin' || !req.admin.location) return null;

//   const city = req.admin.location;

//   // Fetch all vendor stores — city isn't reliably stored, so we can't filter
//   // this in the DB query itself; we compute it per-store below instead.
//   const kycDocs = await VendorKyc.find({}, { 'storeManagement.stores': 1 });

//   const storeIds = [];
//   kycDocs.forEach((doc) => {
//     doc.storeManagement.stores.forEach((store) => {
//       // Prefer the stored city if it happens to be set; otherwise check
//       // every segment of the full mapAddress against the subadmin's city.
//       const storeCityField = String(store.city || '')
//         .trim()
//         .toLowerCase();
//       const targetCity = String(city || '')
//         .trim()
//         .toLowerCase();

//       const matches =
//         (storeCityField && storeCityField === targetCity) ||
//         addressMatchesCity(store.mapAddress, city);

//       if (matches) storeIds.push(String(store._id));
//     });
//   });

//   const products = await Product.find(
//     { storeId: { $in: storeIds } },
//     { _id: 1 },
//   );
//   return products.map((p) => p._id);
// };

// // Returns array of Product _id's belonging to subadmin's city, or null if admin (no restriction)
// export const getCityProductIds = async (req) => {
//   if (req.admin.role !== 'subadmin' || !req.admin.location) return null;

//   const city = req.admin.location;

//   // Fetch all vendor stores — city isn't reliably stored, so we can't filter
//   // this in the DB query itself; we compute it per-store below instead.
//   const kycDocs = await VendorKyc.find(
//     {},
//     { vendorId: 1, 'storeManagement.stores': 1 },
//   );

//   // Match by VENDOR (not storeId): a vendor whose city matches is included
//   // wholesale. This mirrors the vendorToCity resolution used elsewhere
//   // (e.g. the City Dashboard), and avoids missing products whose `storeId`
//   // field is stale/unset even though the vendor's store clearly matches
//   // the target city.
//   const vendorIds = [];
//   kycDocs.forEach((doc) => {
//     const stores = doc.storeManagement?.stores || [];
//     const targetCity = String(city || '')
//       .trim()
//       .toLowerCase();

//     const vendorMatches = stores.some((store) => {
//       const storeCityField = String(store.city || '')
//         .trim()
//         .toLowerCase();

//       return (
//         (storeCityField && storeCityField === targetCity) ||
//         addressMatchesCity(store.mapAddress, city)
//       );
//     });

//     if (vendorMatches) vendorIds.push(String(doc.vendorId));
//   });

//   const products = await Product.find(
//     { vendorId: { $in: vendorIds } },
//     { _id: 1 },
//   );
//   return products.map((p) => p._id);
// };

// Returns array of Product _id's belonging to subadmin's city, or null if admin (no restriction)
export const getCityProductIds = async (req) => {
  if (req.admin.role !== 'subadmin' || !req.admin.location) return null;

  const city = req.admin.location;
  const targetCity = String(city || '')
    .trim()
    .toLowerCase();

  // Fetch all vendor stores — city isn't reliably stored, so we can't filter
  // this in the DB query itself; we compute it per-store below instead.
  const kycDocs = await VendorKyc.find(
    {},
    { vendorId: 1, 'storeManagement.stores': 1 },
  );

  // Hybrid matching:
  // 1) storeIds — stores that individually match the target city. Used to
  //    correctly scope multi-city vendors (a vendor with stores in two
  //    different cities should only show that city's products here).
  // 2) singleCityVendorIds — vendors whose EVERY store is in this same
  //    city (i.e. not actually multi-city). For these vendors only, we
  //    also fall back to vendorId matching, so products with a
  //    missing/stale `storeId` field still get included instead of being
  //    silently dropped. Multi-city vendors are intentionally excluded
  //    from this fallback, since we can't safely guess which of their
  //    cities an untagged product belongs to.
  const storeIds = [];
  const singleCityVendorIds = [];

  kycDocs.forEach((doc) => {
    const stores = doc.storeManagement?.stores || [];
    if (!stores.length) return;

    let matchedAny = false;
    let allMatch = true;

    stores.forEach((store) => {
      const storeCityField = String(store.city || '')
        .trim()
        .toLowerCase();
      const matches =
        (storeCityField && storeCityField === targetCity) ||
        addressMatchesCity(store.mapAddress, city);

      if (matches) {
        matchedAny = true;
        storeIds.push(String(store._id));
      } else {
        allMatch = false;
      }
    });

    // Only treat as a "single-city vendor" (safe for vendorId fallback) if
    // every one of its stores matches this city.
    if (matchedAny && allMatch) {
      singleCityVendorIds.push(String(doc.vendorId));
    }
  });

  const products = await Product.find(
    {
      $or: [
        { storeId: { $in: storeIds } },
        {
          vendorId: { $in: singleCityVendorIds },
          $or: [
            { storeId: { $exists: false } },
            { storeId: null },
            { storeId: { $nin: storeIds } },
          ],
        },
      ],
    },
    { _id: 1 },
  );
  return products.map((p) => p._id);
};
