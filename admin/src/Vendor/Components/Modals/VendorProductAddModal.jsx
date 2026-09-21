// 'use client';

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   Box,
//   Calendar,
//   Check,
//   Clock,
//   DollarSign,
//   Filter,
//   Image as ImageIcon,
//   Key,
//   Lock,
//   Package,
//   Plus,
//   Save,
//   Search,
//   Send,
//   Tag,
//   Trash2,
//   TrendingDown,
//   Truck,
//   Upload,
//   X,
//   Zap,
// } from 'lucide-react';
// import {
//   getCategories,
//   getSubCategories,
// } from '../../../redux/slices/categorySlice';
// import { getMyProducts } from '../../../redux/slices/productSlice';
// import {
//   apiGetVendorListingTemplateByType,
//   apiGetVendorListingTemplates,
//   apiGetVendorMarketLowRentalTenures,
//   apiVendorCreateSubCategory,
// } from '@/service/api';
// import check from '@/assets/icons/check.png';

// const PLACEHOLDER_IMG = 'https://placehold.co/56x56/e5e7eb/6b7280?text=IMG';

// /** `public/rent-out.png` — shows Key icon until the asset exists. */
// function RentOutListingIcon({ className }) {
//   const [failed, setFailed] = useState(false);
//   if (failed) {
//     return (
//       <Key
//         className="h-6 w-6 shrink-0 text-gray-500"
//         strokeWidth={2}
//         aria-hidden
//       />
//     );
//   }
//   return (
//     <img
//       src="/rent-out.png"
//       alt=""
//       className={className}
//       onError={() => setFailed(true)}
//     />
//   );
// }

// /** Admin Custom Listings toggle off → must not appear in vendor “Add from catalog”. */
// function adminTemplateAllowedForVendor(t) {
//   if (!t) return false;
//   return (
//     t.isActive !== false &&
//     t.isActive !== 'false' &&
//     t.isActive !== 0 &&
//     t.isActive !== '0'
//   );
// }

// /** Preview for a local `File` in variant media; revokes blob URL on cleanup. */
// function VariantLocalImagePreview({ file, className }) {
//   const [url, setUrl] = useState('');
//   useEffect(() => {
//     if (!file || !(file instanceof File)) {
//       setUrl('');
//       return undefined;
//     }
//     const u = URL.createObjectURL(file);
//     setUrl(u);
//     return () => URL.revokeObjectURL(u);
//   }, [file]);
//   if (!url) {
//     return <div className={`${className} bg-gray-100`} aria-hidden />;
//   }
//   return <img src={url} alt="" className={className} />;
// }

// /** First image for variant row: saved URL or first pending upload. */
// function variantPrimaryVisual(mv) {
//   const url = (mv?.existingImages || []).find((u) => String(u || '').trim());
//   if (url) return { kind: 'url', url: String(url) };
//   const f = (mv?.newImages || []).find((x) => x instanceof File);
//   if (f) return { kind: 'file', file: f };
//   return { kind: 'none' };
// }

// /** Prefer icon URL, then image, for category / subcategory cards from API. */
// function categoryOrSubAssetUrl(item) {
//   const icon = String(item?.icon || '').trim();
//   if (icon) return icon;
//   const img = String(item?.image || '').trim();
//   return img || '';
// }

// function namesMatch(a, b) {
//   return (
//     String(a || '')
//       .trim()
//       .toLowerCase() ===
//     String(b || '')
//       .trim()
//       .toLowerCase()
//   );
// }

// // function listedProductPriceSubtitle(p) {
// //   const raw = p?.price != null ? String(p.price).trim() : '';
// //   if (String(p?.type || '') === 'Sell') {
// //     return raw && raw !== '0' ? raw : '—';
// //   }
// //   if (raw && raw !== '0') {
// //     if (/[₹]|rs\.?|\/|mo|month|day|d\b/i.test(raw)) return raw;
// //     return `₹${raw}/month`;
// //   }
// //   return '—';
// // }

// function listedProductPriceSubtitle(p) {
//   const raw = p?.price != null ? String(p.price).trim() : '';
//   const isSell = String(p?.type || '') === 'Sell';

//   // Custom listings sometimes have '0'/empty top-level price while the real
//   // price lives on a variant — fall back to the first variant with a price
//   // before giving up and showing '—'.
//   const variants = Array.isArray(p?.variants) ? p.variants : [];
//   const variantWithPrice = isSell
//     ? variants.find((v) => String(v?.sellPrice ?? '').trim() !== '')
//     : variants.find((v) => String(v?.price ?? '').trim() !== '');
//   const variantRaw = isSell
//     ? String(variantWithPrice?.sellPrice ?? '').trim()
//     : String(variantWithPrice?.price ?? '').trim();

//   const finalRaw = raw && raw !== '0' ? raw : variantRaw;

//   if (isSell) {
//     return finalRaw && finalRaw !== '0' ? finalRaw : '—';
//   }
//   if (finalRaw && finalRaw !== '0') {
//     if (/[₹]|rs\.?|\/|mo|month|day|d\b/i.test(finalRaw)) return finalRaw;
//     return `₹${finalRaw}/month`;
//   }
//   return '—';
// }

// function genLocalId() {
//   return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
// }

// function emptyVariantSpecRow() {
//   return { label: '', value: '' };
// }

// function newManualVariant() {
//   return {
//     id: genLocalId(),
//     variantName: '',
//     stock: '',
//     existingImages: [],
//     newImages: [],
//     specRows: [emptyVariantSpecRow()],
//     sellPrice: '',
//     mrpPrice: '',
//     rentalPricingModel: 'day',
//     rentalTiers: customListingDayTiers(),
//   };
// }

// // function mergeCustomListingSpecifications(variants) {
// //   const out = {};
// //   for (const mv of variants || []) {
// //     const name = String(mv.variantName || '').trim() || 'Variant';
// //     const rows = Array.isArray(mv.specRows) ? mv.specRows : [];
// //     for (const row of rows) {
// //       const k = String(row?.label || '').trim();
// //       if (!k) continue;
// //       out[`${name} — ${k}`] = String(row?.value ?? '').trim();
// //     }
// //   }
// //   return out;
// // }

// function mergeCustomListingSpecifications(variants) {
//   const out = {};
//   for (const mv of variants || []) {
//     const name = String(mv.variantName || '').trim() || 'Variant';
//     const rows = Array.isArray(mv.specRows) ? mv.specRows : [];
//     for (const row of rows) {
//       const k = String(row?.label || '').trim();
//       if (!k) continue;
//       out[`${name} — ${k}`] = String(row?.value ?? '').trim();
//     }
//   }
//   return out;
// }

// function collectCustomListingImageUrls(variants) {
//   const u = [];
//   for (const mv of variants || []) {
//     for (const url of mv.existingImages || []) {
//       if (url) u.push(String(url));
//     }
//   }
//   return Array.from(new Set(u)).slice(0, 10);
// }

// // function collectCustomListingImageFiles(variants) {
// //   const f = [];
// //   for (const mv of variants || []) {
// //     if (Array.isArray(mv.newImages)) f.push(...mv.newImages);
// //   }
// //   return f.slice(0, 10);
// // }

// function collectCustomListingImageFiles(variants) {
//   const f = [];
//   for (const mv of variants || []) {
//     if (Array.isArray(mv.newImages)) f.push(...mv.newImages);
//   }
//   return f.slice(0, 10);
// }

// /**
//  * Parallel array to collectCustomListingImageFiles(): for each new file (same
//  * order), records the index of the variant (within `variants`) it belongs to,
//  * so the backend can attach each upload to the correct variant instead of
//  * splitting evenly across all variants.
//  */
// function collectCustomListingImageOwners(variants) {
//   const owners = [];
//   (variants || []).forEach((mv, idx) => {
//     if (Array.isArray(mv.newImages)) {
//       mv.newImages.forEach(() => owners.push(idx));
//     }
//   });
//   return owners.slice(0, 10);
// }

// function toNum(v, fallback = 0) {
//   const n = Number(String(v).replace(/,/g, ''));
//   return Number.isFinite(n) ? n : fallback;
// }

// /**
//  * When admin left "Vendor configuration" empty for a tier, derive the
//  * vendor's price from the Customer configuration price minus this
//  * product's category commission % — e.g. customerRent 300 at 10%
//  * commission → vendor sees 270. Never runs when admin DID set a vendor
//  * price; that value always wins as-is.
//  */
// function computeVendorPriceFromCustomerFallback(
//   customerRent,
//   commissionRatePercent,
// ) {
//   const c = toNum(customerRent, 0);
//   if (!(c > 0)) return '';
//   const rateRaw = Number(commissionRatePercent);
//   const safeRate = Number.isFinite(rateRaw)
//     ? Math.min(100, Math.max(0, rateRaw))
//     : 15; // fallback commission rate mirrors FALLBACK_COMMISSION_RATE used elsewhere
//   const vendorAmt = Math.round(c - (c * safeRate) / 100);
//   return vendorAmt > 0 ? String(vendorAmt) : '';
// }

// /**
//  * Label for the first rental tier (custom listing variant row, product.price).
//  * Day-wise: total for N-day block → "₹X / Nd"; month-wise: "₹X/month".
//  */
// function formatFirstTierRentLabel(tiers, rentalPricingModel) {
//   const t0 = tiers?.[0];
//   const raw = t0?.monthlyRent != null ? String(t0.monthlyRent).trim() : '';
//   if (!raw) return null;
//   if (rentalPricingModel === 'day') {
//     const d = toNum(t0?.days, 0);
//     return d > 0 ? `₹${raw} / ${d}d` : `₹${raw}/day`;
//   }
//   return `₹${raw}/month`;
// }

// // const SELL_CONDITION_OPTIONS = ['Brand New', 'Refurbished'];
// // /** Admin template rentals may still use these values (read-only for vendor). */
// // const RENTAL_TEMPLATE_CONDITION_OPTIONS = [
// //   'Brand New',
// //   'Like New',
// //   'Good',
// //   'Fair',
// //   'Refurbished',
// // ];
// // /** Vendor manual / custom rental listings: editable condition set only. */
// // const RENTAL_MANUAL_CONDITION_OPTIONS = ['Brand New', 'Refurbished'];

// const SELL_CONDITION_OPTIONS = ['Brand New', 'Refurbished', 'Mint Condition'];
// /** Admin template rentals may still use these values (read-only for vendor). */
// const RENTAL_TEMPLATE_CONDITION_OPTIONS = [
//   'Brand New',
//   'Like New',
//   'Good',
//   'Fair',
//   'Refurbished',
//   'Mint Condition',
// ];
// /** Vendor manual / custom rental listings: editable condition set only. */
// const RENTAL_MANUAL_CONDITION_OPTIONS = [
//   'Brand New',
//   'Refurbished',
//   'Mint Condition',
// ];

// function normalizeRentalTemplateCondition(condition) {
//   const c = String(condition || '').trim();
//   return RENTAL_TEMPLATE_CONDITION_OPTIONS.includes(c) ? c : 'Good';
// }

// function normalizeManualRentalCondition(condition) {
//   const c = String(condition || '').trim();
//   if (RENTAL_MANUAL_CONDITION_OPTIONS.includes(c)) return c;
//   if (c === 'Like New') return 'Brand New';
//   if (c === 'Good' || c === 'Fair') return 'Refurbished';
//   return 'Brand New';
// }

// function normalizeConditionForListingType(
//   condition,
//   listingType,
//   vendorManualRental = false,
// ) {
//   const c = String(condition || '').trim();
//   if (listingType === 'Sell') {
//     return SELL_CONDITION_OPTIONS.includes(c) ? c : 'Brand New';
//   }
//   return vendorManualRental
//     ? normalizeManualRentalCondition(c)
//     : normalizeRentalTemplateCondition(c);
// }

// function specsObjectFromTemplate(t, variantIndex = 0) {
//   const specs =
//     t?.specifications &&
//     typeof t.specifications === 'object' &&
//     !Array.isArray(t.specifications)
//       ? { ...t.specifications }
//       : {};
//   if (Array.isArray(t?.productCustomSpecs)) {
//     for (const row of t.productCustomSpecs) {
//       const k = String(row?.label || '').trim();
//       if (k) specs[k] = String(row?.value ?? '');
//     }
//   }

//   // Merge selected variant's "variant specs" so vendor-created products
//   // can store them in `product.specifications` (storefront displays from it).
//   const variant =
//     Array.isArray(t?.variants) && t.variants.length
//       ? t.variants[Math.max(0, Math.min(variantIndex, t.variants.length - 1))]
//       : null;

//   const mergeLabelValueRows = (rows) => {
//     if (!Array.isArray(rows)) return;
//     for (const row of rows) {
//       const k = String(row?.label || '').trim();
//       if (!k) continue;
//       specs[k] = String(row?.value ?? '').trim();
//     }
//   };

//   if (variant) {
//     // Expected shape: `variant.variantSpecs: [{label,value}]`
//     if (Array.isArray(variant.variantSpecs)) {
//       mergeLabelValueRows(variant.variantSpecs);
//     } else if (
//       variant.variantSpecs &&
//       typeof variant.variantSpecs === 'object' &&
//       !Array.isArray(variant.variantSpecs)
//     ) {
//       // Sometimes stored as an object map: { "colour": "green", ... }
//       for (const [k, v] of Object.entries(variant.variantSpecs)) {
//         const kk = String(k).trim();
//         if (!kk) continue;
//         specs[kk] = String(v ?? '').trim();
//       }
//     } else if (Array.isArray(variant.specRows)) {
//       // Legacy naming used by the admin flexible form: `specRows`
//       mergeLabelValueRows(variant.specRows);
//     }

//     // Also copy standard fields into spec object (storefront reads from it).
//     if (variant.color) specs.Color = String(variant.color);
//     if (variant.storage) specs.Storage = String(variant.storage);
//     if (variant.ram) specs.RAM = String(variant.ram);
//   }
//   return specs;
// }

// function galleryFromTemplate(t) {
//   const normalizeToUrlArray = (val) => {
//     if (Array.isArray(val)) {
//       return val.filter(Boolean).map((x) => String(x));
//     }
//     if (typeof val === 'string') {
//       const s = val.trim();
//       if (!s) return [];
//       // Sometimes backend stores JSON-stringified arrays.
//       try {
//         if (s.startsWith('[')) {
//           const parsed = JSON.parse(s);
//           if (Array.isArray(parsed)) {
//             return parsed.filter(Boolean).map((x) => String(x));
//           }
//         }
//       } catch {
//         // ignore
//       }
//       // Otherwise treat as a single URL.
//       return [s];
//     }
//     if (val && typeof val === 'object') {
//       // e.g. {0: 'url1', 1: 'url2'} or { images: [...] }
//       if (Array.isArray(val.images)) {
//         return val.images.filter(Boolean).map((x) => String(x));
//       }
//       const values = Object.values(val)
//         .filter(Boolean)
//         .map((x) => String(x));
//       return values;
//     }
//     return [];
//   };

//   const urls = [
//     ...normalizeToUrlArray(t?.images),
//     t?.image ? String(t.image) : '',
//     ...(Array.isArray(t?.variants)
//       ? t.variants.flatMap((v) => [
//           ...normalizeToUrlArray(v?.images),
//           ...normalizeToUrlArray(v?.existingVariantImages),
//           ...normalizeToUrlArray(v?.variantImages),
//         ])
//       : []),
//   ].filter(Boolean);

//   // De-duplicate while preserving order (important for templates
//   // that store the same image at multiple levels).
//   const uniq = Array.from(new Set(urls));
//   return uniq.slice(0, 10);
// }

// // function defaultMonthTiers() {
// //   return [
// //     {
// //       months: 3,
// //       days: 0,
// //       label: '3 Months',
// //       // tierLabel: 'SHORT TERM',
// //       monthlyRent: '',
// //       shippingCharges: '',
// //       bestValue: false,
// //     },
// //     {
// //       months: 6,
// //       days: 0,
// //       label: '6 Months',
// //       // tierLabel: 'STANDARD',
// //       monthlyRent: '',
// //       shippingCharges: '',
// //       bestValue: false,
// //     },
// //     {
// //       months: 12,
// //       days: 0,
// //       label: '12 Months',
// //       // tierLabel: 'LONG TERM',
// //       monthlyRent: '',
// //       shippingCharges: '',
// //       bestValue: true,
// //     },
// //   ];
// // }

// function defaultMonthTiers() {
//   return [
//     {
//       months: 3,
//       days: 0,
//       label: '3 Months',
//       // tierLabel: 'SHORT TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 6,
//       days: 0,
//       label: '6 Months',
//       // tierLabel: 'STANDARD',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 9,
//       days: 0,
//       label: '9 Months',
//       // tierLabel: 'LONG TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: true,
//     },
//   ];
// }

// // function defaultDayTiers() {
// //   return [
// //     {
// //       months: 0,
// //       days: 3,
// //       label: '3 Days',
// //       // tierLabel: 'SHORT TERM',
// //       monthlyRent: '',
// //       shippingCharges: '',
// //       bestValue: false,
// //     },
// //     {
// //       months: 0,
// //       days: 5,
// //       label: '5 Days',
// //       // tierLabel: 'STANDARD',
// //       monthlyRent: '',
// //       shippingCharges: '',
// //       bestValue: false,
// //     },
// //     {
// //       months: 0,
// //       days: 7,
// //       label: '7 Days',
// //       // tierLabel: 'LONG TERM',
// //       monthlyRent: '',
// //       shippingCharges: '',
// //       bestValue: true,
// //     },
// //   ];
// // }

// function defaultDayTiers() {
//   return [
//     {
//       months: 0,
//       days: 1,
//       label: '1 Day',
//       // tierLabel: 'DAILY',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 0,
//       days: 3,
//       label: '3 Days',
//       // tierLabel: 'SHORT TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 0,
//       days: 5,
//       label: '5 Days',
//       // tierLabel: 'STANDARD',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 0,
//       days: 7,
//       label: '7 Days',
//       // tierLabel: 'LONG TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: true,
//     },
//   ];
// }

// function customListingDayTiers() {
//   return [
//     {
//       months: 0,
//       days: 1,
//       label: 'Per Day',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: true,
//     },
//   ];
// }

// const DEFAULT_MARKET_MONTH_TENURES = [3, 6, 9];
// // const DEFAULT_MARKET_DAY_TENURES = [3, 5, 7];
// const DEFAULT_MARKET_DAY_TENURES = [1];

// function formatInrCompact(n) {
//   if (!Number.isFinite(n) || n <= 0) return '';
//   return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
// }

// function sortedPositiveTenureKeys(map) {
//   if (!map || typeof map !== 'object') return [];
//   return Object.keys(map)
//     .map((k) => Number(k))
//     .filter((n) => Number.isFinite(n) && n > 0)
//     .sort((a, b) => a - b);
// }

// /**
//  * Build rental tier rows from market-low API maps (per-unit ₹/mo or ₹/day).
//  * Reuses prior "Your price" totals when tenure rows still match after refresh.
//  */
// // function synthesizeRentalTiersFromMarket(monthMap, dayMap, model, prevTiers) {
// //   const isDay = model === 'day';
// //   const rawKeys = isDay
// //     ? sortedPositiveTenureKeys(dayMap)
// //     : sortedPositiveTenureKeys(monthMap);
// //   const fallback = isDay
// //     ? DEFAULT_MARKET_DAY_TENURES
// //     : DEFAULT_MARKET_MONTH_TENURES;
// //   const keys = rawKeys.length > 0 ? rawKeys : fallback;
// //   const maxKey = keys[keys.length - 1];
// //   const prevArr = Array.isArray(prevTiers) ? prevTiers : [];

// //   const base = keys.map((len, i) => {
// //     const prev = prevArr.find((t) =>
// //       isDay ? toNum(t.days, 0) === len : toNum(t.months, 0) === len,
// //     );
// //     // const bestValue = !isDay
// //     //   ? keys.includes(12)
// //     //     ? len === 12
// //     //     : len === maxKey
// //     //   : len === maxKey;
// //     const bestValue = len === maxKey;
// //     return {
// //       months: isDay ? 0 : len,
// //       days: isDay ? len : 0,
// //       label: isDay ? `${len} Days` : `${len} Months`,
// //       // tierLabel:
// //       //   TIER_BAND_LABELS[i] ?? TIER_BAND_LABELS[TIER_BAND_LABELS.length - 1],
// //       monthlyRent: prev?.monthlyRent != null ? String(prev.monthlyRent) : '',
// //       shippingCharges: '',
// //       bestValue,
// //     };
// //   });

// //   const extra = prevArr
// //     .filter((row) => {
// //       const len = isDay ? toNum(row.days, 0) : toNum(row.months, 0);
// //       return len > 0 && !keys.includes(len);
// //     })
// //     .sort((a, b) => {
// //       const la = isDay ? toNum(a.days, 0) : toNum(a.months, 0);
// //       const lb = isDay ? toNum(b.days, 0) : toNum(b.months, 0);
// //       return la - lb;
// //     })
// //     .map((row) => ({
// //       ...row,
// //       shippingCharges: row.shippingCharges ?? '',
// //       bestValue: false,
// //     }));

// //   // return [...base, ...extra];
// //   const all = [...base, ...extra];
// //   // Mark only the last (longest) tier as best value
// //   all.forEach((t) => (t.bestValue = false));
// //   if (all.length > 0) all[all.length - 1].bestValue = true;
// //   return all;
// // }

// function synthesizeRentalTiersFromMarket(monthMap, dayMap, model, prevTiers) {
//   const isDay = model === 'day';
//   // Fixed tenure ladder — vendor can't edit tenure numbers in custom listings,
//   // so the ladder must always be 3/6/9 (or 3/5/7 days), never driven by
//   // whatever tenures happen to exist in market-low data from other listings.
//   const keys = isDay
//     ? DEFAULT_MARKET_DAY_TENURES
//     : DEFAULT_MARKET_MONTH_TENURES;
//   const maxKey = keys[keys.length - 1];
//   const prevArr = Array.isArray(prevTiers) ? prevTiers : [];

//   const base = keys.map((len) => {
//     const prev = prevArr.find((t) =>
//       isDay ? toNum(t.days, 0) === len : toNum(t.months, 0) === len,
//     );
//     const bestValue = len === maxKey;
//     //   return {
//     //     months: isDay ? 0 : len,
//     //     days: isDay ? len : 0,
//     //     label: isDay ? `${len} Days` : `${len} Months`,
//     //     monthlyRent: prev?.monthlyRent != null ? String(prev.monthlyRent) : '',
//     //     shippingCharges: '',
//     //     bestValue,
//     //   };
//     // });
//     return {
//       months: isDay ? 0 : len,
//       days: isDay ? len : 0,
//       label: isDay ? (len === 1 ? 'Per Day' : `${len} Days`) : `${len} Months`,
//       monthlyRent: prev?.monthlyRent != null ? String(prev.monthlyRent) : '',
//       shippingCharges: '',
//       bestValue,
//     };
//   });

//   // Preserve tiers the vendor manually added via "+ Add more term"
//   // (these sit outside the fixed ladder, e.g. 15 months) — but no longer
//   // treat market-data tenure lengths (like a stray 12) as "extra".
//   const extra = prevArr
//     .filter((row) => {
//       const len = isDay ? toNum(row.days, 0) : toNum(row.months, 0);
//       return len > 0 && !keys.includes(len);
//     })
//     .sort((a, b) => {
//       const la = isDay ? toNum(a.days, 0) : toNum(a.months, 0);
//       const lb = isDay ? toNum(b.days, 0) : toNum(b.months, 0);
//       return la - lb;
//     })
//     .map((row) => ({
//       ...row,
//       shippingCharges: row.shippingCharges ?? '',
//       bestValue: false,
//     }));

//   const all = [...base, ...extra];
//   all.forEach((t) => (t.bestValue = false));
//   if (all.length > 0) all[all.length - 1].bestValue = true;
//   return all;
// }

// function resolveTemplateRentalRaw(template, variantIndex) {
//   const variants = Array.isArray(template?.variants) ? template.variants : [];
//   const v = variants[variantIndex];
//   const fromVariant = Array.isArray(v?.rentalConfigurations)
//     ? v.rentalConfigurations
//     : [];
//   if (fromVariant.length) return fromVariant;
//   if (
//     Array.isArray(template?.rentalConfigurations) &&
//     template.rentalConfigurations.length
//   ) {
//     return template.rentalConfigurations;
//   }
//   return [];
// }

// // function templateVariantPricingModel(template, variantIndex) {
// //   const variants = Array.isArray(template?.variants) ? template.variants : [];
// //   const v = variants[variantIndex];
// //   if (!v) return 'month';
// //   return v.rentalPricingModel === 'day' ? 'day' : 'month';
// // }
// function templateVariantPricingModel(template, variantIndex) {
//   // Source of truth: each saved rental tier config carries its own
//   // `periodUnit` ('day' | 'month'). Reading it directly avoids relying on
//   // template/variant-level flags that may not be persisted correctly.
//   const raw = resolveTemplateRentalRaw(template, variantIndex);
//   if (Array.isArray(raw) && raw.length) {
//     const dayCount = raw.filter((c) => c?.periodUnit === 'day').length;
//     const monthCount = raw.length - dayCount;
//     return dayCount > monthCount ? 'day' : 'month';
//   }
//   const variants = Array.isArray(template?.variants) ? template.variants : [];
//   const v = variants[variantIndex];
//   if (v?.rentalPricingModel === 'day' || v?.rentalPricingModel === 'month') {
//     return v.rentalPricingModel;
//   }
//   return template?.rentalPricingModel === 'day' ? 'day' : 'month';
// }

// /** Admin "Vendor configuration" — do not surface customer-facing prices to vendors. */
// function pickTemplateVendorRent(cfg) {
//   if (cfg == null) return '';
//   if (cfg.vendorRent != null && String(cfg.vendorRent).trim() !== '') {
//     return String(cfg.vendorRent);
//   }
//   return '';
// }

// // function pickTemplateVendorShipping(cfg) {
// //   if (cfg == null) return '';
// //   if (cfg.vendorShipping != null && String(cfg.vendorShipping).trim() !== '') {
// //     return String(cfg.vendorShipping);
// //   }
// //   return '';
// // }
// function pickTemplateVendorShipping(cfg) {
//   if (cfg == null) return '';
//   if (cfg.vendorShipping != null && String(cfg.vendorShipping).trim() !== '') {
//     return String(cfg.vendorShipping);
//   }
//   return '';
// }

// /** Admin "Customer configuration" — the real price end-customers must see. */
// function pickTemplateCustomerRent(cfg) {
//   if (cfg == null) return '';
//   if (cfg.customerRent != null && String(cfg.customerRent).trim() !== '') {
//     return String(cfg.customerRent);
//   }
//   return '';
// }

// /** Per-variant sell pricing + lock from an admin sell template's variant. */
// function getTemplateVariantSaleConfig(template, variantIndex) {
//   const variants = Array.isArray(template?.variants) ? template.variants : [];
//   const v =
//     variants[Math.max(0, Math.min(variantIndex ?? 0, variants.length - 1))];
//   const parseMoney = (x) => {
//     const s = String(x ?? '')
//       .replace(/,/g, '')
//       .trim();
//     if (!s) return null;
//     const n = Number(s);
//     return Number.isFinite(n) ? n : null;
//   };
//   const vSell = parseMoney(v?.sellPrice);
//   const vMrp = parseMoney(v?.mrpPrice);
//   const tplSell = parseMoney(template?.salesConfiguration?.salePrice);
//   const tplMrp = parseMoney(template?.salesConfiguration?.mrpPrice);
//   return {
//     sellPrice:
//       vSell != null && vSell > 0
//         ? String(vSell)
//         : tplSell != null && tplSell > 0
//           ? String(tplSell)
//           : '',
//     mrpPrice:
//       vMrp != null && vMrp > 0
//         ? String(vMrp)
//         : tplMrp != null && tplMrp > 0
//           ? String(tplMrp)
//           : '',
//     //     allowVendorEditSalePrice:
//     //       v?.allowVendorEditSalePrice !== undefined
//     //         ? v.allowVendorEditSalePrice !== false
//     //         : template?.salesConfiguration?.allowVendorEditSalePrice !== false,
//     //   };
//     // }

//     // function rentalTiersFromTemplate(template, model, variantIndex = 0) {

//     allowVendorEditSalePrice:
//       v?.allowVendorEditSalePrice !== undefined
//         ? v.allowVendorEditSalePrice !== false
//         : template?.salesConfiguration?.allowVendorEditSalePrice !== false,
//   };
// }

// /** Per-variant rental-price-edit permission from an admin rental template's variant. */
// function getTemplateVariantAllowEdit(template, variantIndex) {
//   const variants = Array.isArray(template?.variants) ? template.variants : [];
//   const v =
//     variants[Math.max(0, Math.min(variantIndex ?? 0, variants.length - 1))];
//   if (v?.allowVendorEditRentalPrices !== undefined) {
//     return v.allowVendorEditRentalPrices !== false;
//   }
//   return template?.allowVendorEditRentalPrices !== false;
// }

// function rentalTiersFromTemplate(template, model, variantIndex = 0) {
//   const raw = resolveTemplateRentalRaw(template, variantIndex);
//   if (!Array.isArray(raw) || !raw.length) {
//     return model === 'day' ? defaultDayTiers() : defaultMonthTiers();
//   }
//   const wantDay = model === 'day';
//   const templateNativeModel = templateVariantPricingModel(
//     template,
//     variantIndex,
//   );
//   const unitMismatch =
//     (wantDay && templateNativeModel === 'month') ||
//     (!wantDay && templateNativeModel === 'day');
//   const DEFAULT_DAY_LADDER = [3, 5, 7];
//   const DEFAULT_MONTH_LADDER = [3, 6, 12];

//   return raw.slice(0, 6).map((cfg, i) => {
//     const periodUnit = cfg.periodUnit === 'day' ? 'day' : 'month';
//     const isCfgDay = periodUnit === 'day';
//     const cfgMonths = toNum(cfg.months, 0);
//     const cfgDays = toNum(cfg.days, 0);
//     const adminLabel = String(cfg.label || '').trim();

//     let months = 0;
//     let days = 0;
//     let label = '';

//     if (wantDay) {
//       if (isCfgDay && cfgDays > 0) {
//         days = cfgDays;
//         label =
//           adminLabel && !/\bmonths?\b/i.test(adminLabel)
//             ? adminLabel
//             : `${days} Days`;
//       } else {
//         days =
//           DEFAULT_DAY_LADDER[Math.min(i, DEFAULT_DAY_LADDER.length - 1)] ??
//           3 + i * 2;
//         label = `${days} Days`;
//       }
//     } else {
//       if (!isCfgDay && cfgMonths > 0) {
//         months = cfgMonths;
//         label =
//           adminLabel && !/\bdays?\b/i.test(adminLabel)
//             ? adminLabel
//             : `${months} Months`;
//       } else if (isCfgDay && cfgMonths > 0) {
//         months = cfgMonths;
//         label = `${months} Months`;
//       } else {
//         months =
//           DEFAULT_MONTH_LADDER[Math.min(i, DEFAULT_MONTH_LADDER.length - 1)] ??
//           3 * (i + 1);
//         label = `${months} Months`;
//       }
//     }

//     // // `monthlyRent` drives what the vendor SEES and what gets submitted as
//     // // the price, so it must always be the admin's customer-facing price —
//     // // never the vendor's own cost. Vendor cost is kept separately only for
//     // // internal reference and is never shown/submitted as the price.
//     // let rentVal = pickTemplateCustomerRent(cfg);
//     // let shipVal = pickTemplateVendorShipping(cfg);
//     // let vendorCostVal = pickTemplateVendorRent(cfg);
//     // `monthlyRent` drives what the vendor SEES and what gets submitted as
//     // the price, so it must always be the admin's vendor-facing (cost)
//     // price — this is what the vendor pays/charges, not the customer price.
//     // Customer price is kept separately only for internal reference and is
//     // never shown/submitted as the vendor's price.
//     let rentVal = pickTemplateVendorRent(cfg);
//     let shipVal = pickTemplateVendorShipping(cfg);
//     let vendorCostVal = pickTemplateCustomerRent(cfg);
//     if (unitMismatch) {
//       rentVal = '';
//       shipVal = '';
//       vendorCostVal = '';
//     }
//     //     return {
//     //       months,
//     //       days,
//     //       label,
//     //       tierLabel: String(cfg.tierLabel || '').trim(),
//     //       monthlyRent: rentVal,
//     //       shippingCharges: shipVal,
//     //       // bestValue: i === 2,
//     //       bestValue: false,
//     //     };
//     //   });
//     //   if (tiers.length > 0) {
//     //     tiers[tiers.length - 1].bestValue = true;
//     //   }
//     //   return tiers;
//     // }

//     //     return {
//     //       months,
//     //       days,
//     //       label,
//     //       tierLabel: String(cfg.tierLabel || '').trim(),
//     //       monthlyRent: rentVal,
//     //       vendorCost: vendorCostVal,
//     //       shippingCharges: shipVal,
//     //       bestValue: false,
//     //     };
//     //   });
//     //   if (tiers.length > 0) {
//     //     tiers[tiers.length - 1].bestValue = true;
//     //   }
//     //   return tiers;
//     // }
//     return {
//       months,
//       days,
//       label,
//       tierLabel: String(cfg.tierLabel || '').trim(),
//       monthlyRent: rentVal,
//       vendorCost: vendorCostVal,
//       shippingCharges: shipVal,
//       bestValue: false,
//     };
//   });
// }

// /** First-tenure rental line for template variant row, e.g. ₹25000/3month or ₹500/5day. */
// /** Edit-mode fallback: variant's own saved rentalConfigurations (fullTemplate
//  * is null in edit mode, so templateVariantRentalSubtitle can't be used). */
// function editModeVariantRentalSubtitle(v) {
//   const rc = Array.isArray(v?.rentalConfigurations)
//     ? v.rentalConfigurations
//     : [];
//   const t0 = rc[0];
//   if (!t0) return null;
//   const amt =
//     Number(t0.vendorRent) > 0
//       ? Number(t0.vendorRent)
//       : Number(t0.customerRent) > 0
//         ? Number(t0.customerRent)
//         : 0;
//   if (!amt) return null;
//   if (t0.periodUnit === 'day') {
//     return `₹${amt}/day`;
//   }
//   return `₹${amt}/month`;
// }

// // function templateVariantRentalSubtitle(
// //   fullTemplate,
// //   variantIndex,
// //   listingType,
// // ) {
// //   if (listingType === 'sell' || !fullTemplate) return null;
// //   const model = templateVariantPricingModel(fullTemplate, variantIndex);
// //   const tiers = rentalTiersFromTemplate(fullTemplate, model, variantIndex);
// //   const t0 = tiers?.[0];
// //   if (!t0) return null;
// //   const raw = t0.monthlyRent != null ? String(t0.monthlyRent).trim() : '';
// //   if (!raw) return null;
// //   if (model === 'day') {
// //     return `₹${raw}/day`;
// //   }
// //   return `₹${raw}/month`;
// // }

// function templateVariantRentalSubtitle(
//   fullTemplate,
//   variantIndex,
//   listingType,
//   commissionRatePercent,
// ) {
//   if (listingType === 'sell' || !fullTemplate) return null;
//   const model = templateVariantPricingModel(fullTemplate, variantIndex);
//   const tiers = rentalTiersFromTemplate(fullTemplate, model, variantIndex);
//   const t0 = tiers?.[0];
//   if (!t0) return null;
//   const hasVendorPrice =
//     t0.monthlyRent != null &&
//     String(t0.monthlyRent).trim() !== '' &&
//     Number(t0.monthlyRent) > 0;
//   const raw = hasVendorPrice
//     ? String(t0.monthlyRent).trim()
//     : computeVendorPriceFromCustomerFallback(
//         t0.vendorCost,
//         commissionRatePercent,
//       );
//   if (!raw) return null;
//   if (model === 'day') {
//     return `₹${raw}/day`;
//   }
//   return `₹${raw}/month`;
// }

// /** Green pill with white round check — Catalog Images / Verified Specs headers. */
// function GreenVerifiedBadge({ children }) {
//   return (
//     // <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 py-1 pl-1 pr-2.5 text-xs font-semibold text-white shadow-sm">
//     //   <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
//     //     <Check className="h-3 w-3 text-green-600" strokeWidth={3} aria-hidden />
//     //   </span>
//     //   {children}
//     // </span>
//     <span className="inline-flex items-center gap-1 rounded-full bg-green-600 py-1 pl-1 pr-2.5 text-xs font-semibold text-white shadow-sm">
//       <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full ">
//         <img src={check.src} alt="check" className="h-4 w-4 object-contain" />
//       </span>
//       {children}
//     </span>
//   );
// }

// function SectionCard({
//   icon: Icon,
//   title,
//   /** Shown directly under the title in the header (e.g. Figma subtitle). */
//   subtitle = null,
//   /** When true with `icon`, icon is shown in a blue rounded tile like admin Custom Listings. */
//   headerIconBoxed = false,
//   /** Override default emerald icon color (non-boxed). E.g. `h-5 w-5 shrink-0 text-blue-600`. */
//   headerIconClassName = null,
//   badge,
//   children,
//   headerRight,
//   className = '',
//   showLock = false,
//   /** When true, no gray header row — only the card shell + padded body. */
//   hideHeader = false,
// }) {
//   const hasTitle = title != null && String(title).trim() !== '';
//   const headerLeftStart = Boolean(subtitle || headerIconBoxed);
//   const barAlign = headerLeftStart ? 'items-start' : 'items-center';
//   const lockOnlyHeader = showLock && !hasTitle && !Icon;
//   /** Icon + title + subtitle: center icon with the text block (Figma). */
//   const leftIconTextAlign =
//     subtitle && headerIconBoxed && Icon
//       ? 'items-center gap-3'
//       : headerLeftStart
//         ? 'items-start gap-3'
//         : 'items-center gap-2';
//   return (
//     <div
//       className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}
//     >
//       {!hideHeader ? (
//         <div
//           className={`flex ${barAlign} justify-between gap-2 border-b border-gray-100 bg-gray-50/90 px-4 py-3`}
//         >
//           <div className={`flex min-w-0 flex-1 ${leftIconTextAlign}`}>
//             {Icon ? (
//               headerIconBoxed ? (
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                   <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
//                 </div>
//               ) : (
//                 <Icon
//                   className={
//                     headerIconClassName ?? 'h-5 w-5 shrink-0 text-emerald-600'
//                   }
//                   strokeWidth={2}
//                 />
//               )
//             ) : null}
//             <div className="min-w-0 flex-1">
//               <div className="flex min-w-0 items-center gap-1.5">
//                 {hasTitle ? (
//                   <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
//                     {title}
//                   </h3>
//                 ) : null}
//                 {showLock ? (
//                   lockOnlyHeader ? (
//                     <div
//                       className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm"
//                       role="img"
//                       aria-label="Catalog images are locked"
//                     >
//                       <Lock className="h-3 w-3" strokeWidth={2} aria-hidden />
//                     </div>
//                   ) : (
//                     <Lock
//                       className="h-3.5 w-3.5 shrink-0 text-gray-400"
//                       aria-hidden
//                     />
//                   )
//                 ) : null}
//               </div>
//               {subtitle ? (
//                 <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
//               ) : null}
//             </div>
//           </div>
//           <div className="flex shrink-0 items-center gap-2">
//             {badge != null && badge !== false ? (
//               typeof badge === 'string' || typeof badge === 'number' ? (
//                 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
//                   {badge}
//                 </span>
//               ) : (
//                 badge
//               )
//             ) : null}
//             {headerRight}
//           </div>
//         </div>
//       ) : null}
//       <div className="p-4">{children}</div>
//     </div>
//   );
// }

// export default function VendorProductAddModal({
//   isOpen,
//   onClose,
//   onSubmit,
//   mode = 'create',
//   initialData = null,
//   onOpenServiceProduct = null,
//   onOpenManualProduct = null,
// }) {
//   const dispatch = useDispatch();
//   const token = useSelector((state) => state.vendor?.token);
//   const { categories, subCategories } = useSelector((state) => state.category);
//   const { products: vendorProductList, loading: vendorProductsLoading } =
//     useSelector((state) => state.product);

//   const [listingType, setListingType] = useState('rent');
//   const [templates, setTemplates] = useState([]);
//   const [loadingList, setLoadingList] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   /** Search in “Your listed products” (custom listing catalog). */
//   const [listedSearchQuery, setListedSearchQuery] = useState('');
//   const [listedCategoryFilter, setListedCategoryFilter] = useState('');
//   const [listedFilterPanelOpen, setListedFilterPanelOpen] = useState(false);
//   const [applyLoadingId, setApplyLoadingId] = useState(null);
//   const [marketLowTenures, setMarketLowTenures] = useState({
//     month: {},
//     day: {},
//   });
//   const [marketLowLoading, setMarketLowLoading] = useState(false);

//   const [customListing, setCustomListing] = useState(false);
//   const [fullTemplate, setFullTemplate] = useState(null);
//   const [selectedTemplateId, setSelectedTemplateId] = useState(null);

//   // const [categoryId, setCategoryId] = useState('');
//   // const [subCategoryId, setSubCategoryId] = useState('');
//   const [categoryId, setCategoryId] = useState('');
//   const [subCategoryId, setSubCategoryId] = useState('');

//   // Inline "vendor can't find sub-category" quick-create flow
//   const [subCatCreateOpen, setSubCatCreateOpen] = useState(false);
//   const [newSubCatName, setNewSubCatName] = useState('');
//   const [newSubCatImage, setNewSubCatImage] = useState(null);
//   const [newSubCatCommissionRate, setNewSubCatCommissionRate] = useState(15);
//   const [creatingSubCat, setCreatingSubCat] = useState(false);

//   const [productName, setProductName] = useState('');
//   const [brand, setBrand] = useState('');
//   const [condition, setCondition] = useState('Brand New');
//   const [shortDescription, setShortDescription] = useState('');
//   const [description, setDescription] = useState('');
//   const [specs, setSpecs] = useState({});
//   /** Editable label/value rows when vendor may edit specs (manual listing). */
//   const [specRowList, setSpecRowList] = useState([{ label: '', value: '' }]);

//   // Which variant's spec grid should be shown in the form.
//   // We keep this as the template's variant index (not the filtered list index).
//   const [selectedTemplateVariantIndex, setSelectedTemplateVariantIndex] =
//     useState(0);

//   const [variantIndices, setVariantIndices] = useState([]);
//   const [rentalPricingModel, setRentalPricingModel] = useState('month');
//   const [allowVendorPriceEdit, setAllowVendorPriceEdit] = useState(false);
//   const [rentalTiers, setRentalTiers] = useState(defaultMonthTiers());
//   /** Remembers each pricing model's own tiers, so toggling Month-wise/Day-wise
//    * in edit mode shows that unit's real ladder + prices (or an empty one),
//    * instead of leaking the other unit's labels and prices. */
//   const monthTiersBackupRef = useRef(null);
//   const dayTiersBackupRef = useRef(null);

//   // const switchRentalPricingModel = (nextModel) => {
//   //   if (nextModel === rentalPricingModel) return;
//   //   if (rentalPricingModel === 'day') {
//   //     dayTiersBackupRef.current = rentalTiers;
//   //   } else {
//   //     monthTiersBackupRef.current = rentalTiers;
//   //   }
//   //   const restored =
//   //     nextModel === 'day'
//   //       ? dayTiersBackupRef.current || defaultDayTiers()
//   //       : monthTiersBackupRef.current || defaultMonthTiers();
//   //   setRentalPricingModel(nextModel);
//   //   setRentalTiers(restored);
//   // };
//   const switchRentalPricingModel = (nextModel) => {
//     if (nextModel === rentalPricingModel) return;
//     if (rentalPricingModel === 'day') {
//       dayTiersBackupRef.current = rentalTiers;
//     } else {
//       monthTiersBackupRef.current = rentalTiers;
//     }
//     const isCustomRental =
//       mode === 'create' && customListing && listingType === 'rent';
//     const restored =
//       nextModel === 'day'
//         ? dayTiersBackupRef.current ||
//           (isCustomRental ? customListingDayTiers() : defaultDayTiers())
//         : monthTiersBackupRef.current || defaultMonthTiers();
//     setRentalPricingModel(nextModel);
//     setRentalTiers(restored);
//   };
//   const [refundableDeposit, setRefundableDeposit] = useState('');
//   const [sellPrice, setSellPrice] = useState('');
//   const [mrpPrice, setMrpPrice] = useState('');
//   const [allowVendorSalePriceEdit, setAllowVendorSalePriceEdit] =
//     useState(true);

//   const [logistics, setLogistics] = useState({
//     deliveryTimelineValue: '',
//     deliveryTimelineUnit: 'Days',
//     inventoryOwnerName: '',
//     city: '',
//   });
//   const [stock, setStock] = useState('');
//   const [existingImages, setExistingImages] = useState([]);
//   const [newImages, setNewImages] = useState([]);
//   /** Custom listing (no admin template): multiple sellable/rentable SKUs. */
//   const [manualVariants, setManualVariants] = useState([]);
//   /** When set, full variant editor (media, specs) is shown for this id. */
//   const [expandedVariantId, setExpandedVariantId] = useState(null);
//   const [selectedManualVariantId, setSelectedManualVariantId] = useState(null);
//   const lastHydrateKeyRef = useRef('');
//   /** When catalog template or variant row changes, reset tenure unit + tiers to admin defaults. */
//   const lastTemplateRentalSyncKeyRef = useRef('');

//   const createdViaInitial =
//     initialData?.createdVia === 'template' ? 'template' : 'manual';
//   const isTemplateBased = !!fullTemplate || createdViaInitial === 'template';

//   const filteredCategories = useMemo(() => {
//     return (categories || []).filter((c) =>
//       listingType === 'sell' ? c.availableInBuy : c.availableInRent,
//     );
//   }, [categories, listingType]);

//   const filteredSubCategories = useMemo(() => {
//     return (subCategories || []).filter((s) => {
//       const matchesListing =
//         listingType === 'sell' ? s.availableInBuy : s.availableInRent;
//       if (!matchesListing) return false;
//       if (!categoryId) return false;
//       return String(s.category || '') === String(categoryId);
//     });
//   }, [subCategories, listingType, categoryId]);

//   const getTemplateRefundableDeposit = useCallback((t, variantIdx) => {
//     if (!t) return '';

//     const parseMoney = (x) => {
//       const s = String(x ?? '')
//         .replace(/,/g, '')
//         .trim();
//       if (!s) return null;
//       const n = Number(s);
//       return Number.isFinite(n) ? n : null;
//     };

//     // Prefer template-level value (legacy).
//     if (
//       t.refundableDeposit != null &&
//       parseMoney(t.refundableDeposit) != null &&
//       parseMoney(t.refundableDeposit) > 0
//     )
//       return String(t.refundableDeposit);
//     // Otherwise fall back to selected variant value.
//     const v =
//       Array.isArray(t.variants) && t.variants.length
//         ? t.variants[
//             Math.max(0, Math.min(variantIdx ?? 0, t.variants.length - 1))
//           ]
//         : null;
//     if (v?.refundableDeposit != null) {
//       const vn = parseMoney(v.refundableDeposit);
//       if (vn != null && vn > 0) return String(v.refundableDeposit);
//     }

//     // If both are empty/zero, return template value (may be '0') for stability.
//     if (t.refundableDeposit != null) return String(t.refundableDeposit);
//     if (v?.refundableDeposit != null) return String(v.refundableDeposit);
//     return '0';
//   }, []);

//   const resetCreateState = useCallback(() => {
//     setListingType('rent');
//     setSearchQuery('');
//     setCustomListing(false);
//     setFullTemplate(null);
//     setSelectedTemplateId(null);
//     setCategoryId('');
//     setSubCategoryId('');
//     setProductName('');
//     setBrand('');
//     setCondition('Brand New');
//     setShortDescription('');
//     setDescription('');
//     setSpecs({});
//     setSpecRowList([{ label: '', value: '' }]);
//     setSelectedTemplateVariantIndex(0);
//     setVariantIndices([]);
//     setRentalPricingModel('month');
//     setAllowVendorPriceEdit(false);
//     setRentalTiers(defaultMonthTiers());
//     setRefundableDeposit('');
//     setSellPrice('');
//     setMrpPrice('');
//     setAllowVendorSalePriceEdit(true);
//     setLogistics({
//       deliveryTimelineValue: '',
//       deliveryTimelineUnit: 'Days',
//       inventoryOwnerName: '',
//       city: '',
//     });
//     setStock('');
//     setExistingImages([]);
//     setNewImages([]);
//     setManualVariants([]);
//     setExpandedVariantId(null);
//     setListedSearchQuery('');
//     setListedCategoryFilter('');
//     setListedFilterPanelOpen(false);
//     setMarketLowTenures({ month: {}, day: {} });
//     setMarketLowLoading(false);
//   }, []);

//   const hydrateFromVendorProduct = useCallback((p) => {
//     // setCustomListing(false);
//     // setFullTemplate(null);
//     // setSelectedTemplateId(null);
//     setFullTemplate(null);
//     setSelectedTemplateId(null);
//     setListingType(String(p.type || 'Rental') === 'Sell' ? 'sell' : 'rent');
//     setProductName(p.productName || '');
//     setBrand(p.brand || '');
//     setCondition(
//       normalizeConditionForListingType(
//         p.condition,
//         String(p.type || 'Rental') === 'Sell' ? 'Sell' : 'Rental',
//         String(p.type || 'Rental') !== 'Sell' && p.createdVia !== 'template',
//       ),
//     );
//     setShortDescription(p.shortDescription || '');
//     setDescription(p.description || '');
//     const specObj =
//       p.specifications && typeof p.specifications === 'object'
//         ? { ...p.specifications }
//         : {};
//     setSpecs(specObj);
//     const specRows = Object.entries(specObj).map(([label, value]) => ({
//       label,
//       value: String(value ?? ''),
//     }));
//     setSpecRowList(specRows.length ? specRows : [{ label: '', value: '' }]);
//     setExistingImages(
//       Array.isArray(p.images) && p.images.length
//         ? p.images.filter(Boolean).slice(0, 10)
//         : p.image
//           ? [p.image]
//           : [],
//     );
//     setNewImages([]);
//     const nVar = Array.isArray(p.variants) ? p.variants.length : 0;
//     setVariantIndices(nVar ? Array.from({ length: nVar }, (_, i) => i) : []);
//     setSelectedTemplateVariantIndex(0);
//     // Existing listings: treat anything that is not explicitly "template" as manual.
//     const createdVia = p.createdVia === 'template' ? 'template' : 'manual';
//     if (createdVia === 'manual') {
//       setAllowVendorPriceEdit(true);
//     } else if (p.allowVendorEditRentalPrices !== undefined) {
//       setAllowVendorPriceEdit(p.allowVendorEditRentalPrices !== false);
//     } else {
//       // Template-based: always respect whatever admin saved
//       setAllowVendorPriceEdit(p.allowVendorEditRentalPrices !== false);
//     }
//     // const rc = Array.isArray(p.rentalConfigurations)
//     //   ? p.rentalConfigurations
//     //   : [];
//     // const model =
//     //   rc.length && rc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
//     // setRentalPricingModel(model);
//     // if (rc.length) {
//     //   setRentalTiers(
//     //     rc.slice(0, 6).map((cfg, i) => ({
//     //       months: toNum(cfg.months, model === 'day' ? 0 : [3, 6, 12][i] || 3),
//     //       days: toNum(cfg.days, 0),
//     //       label: String(cfg.label || ''),
//     //       tierLabel: '',
//     //       monthlyRent: String(
//     //         cfg.customerRent != null && cfg.customerRent !== ''
//     //           ? cfg.customerRent
//     //           : (cfg.pricePerDay ?? ''),
//     //       ),
//     //       shippingCharges: String(cfg.shippingCharges ?? ''),
//     //       bestValue: i === 2,
//     //     })),
//     //   );
//     // } else {
//     //   setRentalTiers(model === 'day' ? defaultDayTiers() : defaultMonthTiers());
//     // }
//     const rc = Array.isArray(p.rentalConfigurations)
//       ? p.rentalConfigurations
//       : [];
//     const model =
//       rc.length && rc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
//     setRentalPricingModel(model);
//     // Clear any leftover backup from a previously edited product, then store
//     // this product's real saved tiers under its own unit only. The OTHER
//     // unit starts with no backup, so toggling to it shows an empty default
//     // ladder (3/5/7 days or 3/6/9 months) instead of stale data.
//     monthTiersBackupRef.current = null;
//     dayTiersBackupRef.current = null;
//     // const hydratedTiers = rc.length
//     //   ? rc.slice(0, 6).map((cfg, i) => ({
//     //       months: toNum(cfg.months, model === 'day' ? 0 : [3, 6, 12][i] || 3),
//     //       days: toNum(cfg.days, 0),
//     //       label: String(cfg.label || ''),
//     //       tierLabel: '',
//     //       monthlyRent: String(
//     //         cfg.customerRent != null && cfg.customerRent !== ''
//     //           ? cfg.customerRent
//     //           : (cfg.pricePerDay ?? ''),
//     //       ),
//     //       shippingCharges: String(cfg.shippingCharges ?? ''),
//     //       bestValue: i === 2,
//     //     }))
//     //   : model === 'day'
//     //     ? defaultDayTiers()
//     //     : defaultMonthTiers();
//     const hydratedTiers = rc.length
//       ? rc.slice(0, 6).map((cfg, i) => ({
//           months: toNum(cfg.months, model === 'day' ? 0 : [3, 6, 12][i] || 3),
//           days: toNum(cfg.days, 0),
//           label: String(cfg.label || ''),
//           tierLabel: '',
//           // Edit mode must show the VENDOR's own price (what they'll see
//           // and can re-edit), never the customer-facing price.
//           //     monthlyRent: String(
//           //       cfg.vendorRent != null && cfg.vendorRent !== ''
//           //         ? cfg.vendorRent
//           //         : cfg.customerRent != null && cfg.customerRent !== ''
//           //           ? cfg.customerRent
//           //           : (cfg.pricePerDay ?? ''),
//           //     ),
//           //     shippingCharges: String(cfg.shippingCharges ?? ''),
//           //     bestValue: i === 2,
//           //   }))
//           // : model === 'day'
//           //   ? defaultDayTiers()
//           //   : defaultMonthTiers();
//           monthlyRent: String(
//             Number(cfg.vendorRent) > 0
//               ? cfg.vendorRent
//               : cfg.customerRent != null && cfg.customerRent !== ''
//                 ? cfg.customerRent
//                 : (cfg.pricePerDay ?? ''),
//           ),
//           shippingCharges: String(cfg.shippingCharges ?? ''),
//           bestValue: i === 2,
//         }))
//       : model === 'day'
//         ? defaultDayTiers()
//         : defaultMonthTiers();
//     setRentalTiers(hydratedTiers);
//     if (model === 'day') {
//       dayTiersBackupRef.current = hydratedTiers;
//     } else {
//       monthTiersBackupRef.current = hydratedTiers;
//     }
//     setRefundableDeposit(
//       p.refundableDeposit != null ? String(p.refundableDeposit) : '',
//     );
//     setSellPrice(
//       p.salesConfiguration?.salePrice != null
//         ? String(p.salesConfiguration.salePrice)
//         : '',
//     );
//     setMrpPrice(
//       p.salesConfiguration?.mrpPrice != null
//         ? String(p.salesConfiguration.mrpPrice)
//         : '',
//     );
//     setAllowVendorSalePriceEdit(
//       p.salesConfiguration?.allowVendorEditSalePrice !== false,
//     );
//     const lv = p.logisticsVerification || {};
//     setLogistics({
//       deliveryTimelineValue:
//         lv.deliveryTimelineValue != null
//           ? String(lv.deliveryTimelineValue)
//           : '',
//       deliveryTimelineUnit: lv.deliveryTimelineUnit || 'Days',
//       inventoryOwnerName: lv.inventoryOwnerName || '',
//       city: lv.city || '',
//     });
//     setStock(p.stock != null ? String(p.stock) : '');
//     const vList = Array.isArray(p.variants) ? p.variants : [];

//     const allImages =
//       Array.isArray(p.images) && p.images.length
//         ? p.images.filter(Boolean)
//         : p.image
//           ? [p.image]
//           : [];

//     // if (vList.length) {
//     //   setManualVariants(
//     //     vList.map((v) => {
//     //       const vsRows = Array.isArray(v.variantSpecs)
//     //         ? v.variantSpecs.map((r) => ({
//     //             label: String(r?.label || ''),
//     //             value: String(r?.value ?? ''),
//     //           }))
//     //         : [];
//     //       return {
//     //         id: genLocalId(),
//     //         variantName: String(v.variantName || '').trim(),
//     //         stock: v.stock != null ? String(v.stock) : '',
//     //         existingImages: [],
//     //         newImages: [],
//     //         specRows: vsRows.length > 0 ? vsRows : [emptyVariantSpecRow()],
//     //       };
//     //     }),
//     //   );
//     // } else {
//     //   setManualVariants([]);
//     //   setExpandedVariantId(null);
//     // }
//     if (vList.length) {
//       const allImages =
//         Array.isArray(p.images) && p.images.length
//           ? p.images.filter(Boolean)
//           : p.image
//             ? [p.image]
//             : [];

//       // Legacy products (saved before per-variant images existed) have NO
//       // variant with its own `images` — only then do we fall back to
//       // slicing the old shared `product.images` pool, so old listings keep
//       // showing their photos. Once ANY variant has real per-variant images
//       // (new listings, or ones already re-saved), we stop slicing entirely
//       // to avoid the old bleeding-between-variants bug.
//       const anyVariantHasOwnImages = vList.some(
//         (v) => Array.isArray(v.images) && v.images.length > 0,
//       );

//       const hydrated = vList.map((v, idx) => {
//         const vsRows = Array.isArray(v.variantSpecs)
//           ? v.variantSpecs.map((r) => ({
//               label: String(r?.label || ''),
//               value: String(r?.value ?? ''),
//             }))
//           : [];

//         // Per-variant images: use this variant's own saved images. Only for
//         // fully-legacy products (no variant has its own images at all) do
//         // we fall back to slicing the shared pool, purely so old listings
//         // don't suddenly show blank.
//         const variantImgs =
//           Array.isArray(v.images) && v.images.length
//             ? v.images.filter(Boolean)
//             : anyVariantHasOwnImages
//               ? []
//               : vList.length === 1
//                 ? allImages
//                 : (() => {
//                     if (!allImages.length) return [];
//                     const perV = Math.ceil(allImages.length / vList.length);
//                     return allImages.slice(idx * perV, idx * perV + perV);
//                   })();

//         const vRc = Array.isArray(v.rentalConfigurations)
//           ? v.rentalConfigurations
//           : [];
//         const vModel =
//           vRc.length && vRc.some((c) => c.periodUnit === 'day')
//             ? 'day'
//             : vRc.length
//               ? 'month'
//               : 'day';
//         // const vTiers = vRc.length
//         //   ? vRc.slice(0, 6).map((cfg, i) => ({
//         //       months: toNum(cfg.months, 0),
//         //       days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
//         //       label: String(cfg.label || ''),
//         //       tierLabel: '',
//         //       monthlyRent: String(
//         //         cfg.customerRent != null && cfg.customerRent !== ''
//         //           ? cfg.customerRent
//         //           : (cfg.pricePerDay ?? ''),
//         //       ),
//         //       shippingCharges: String(cfg.shippingCharges ?? ''),
//         //       bestValue: i === vRc.length - 1,
//         //     }))
//         //   : customListingDayTiers();

//         const vTiers = vRc.length
//           ? vRc.slice(0, 6).map((cfg, i) => ({
//               months: toNum(cfg.months, 0),
//               days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
//               label: String(cfg.label || ''),
//               tierLabel: '',
//               // Edit mode must show the VENDOR's own price, never the
//               // customer-facing price.
//               //     monthlyRent: String(
//               //       cfg.vendorRent != null && cfg.vendorRent !== ''
//               //         ? cfg.vendorRent
//               //         : cfg.customerRent != null && cfg.customerRent !== ''
//               //           ? cfg.customerRent
//               //           : (cfg.pricePerDay ?? ''),
//               //     ),
//               //     shippingCharges: String(cfg.shippingCharges ?? ''),
//               //     bestValue: i === vRc.length - 1,
//               //   }))
//               // : customListingDayTiers();
//               monthlyRent: String(
//                 Number(cfg.vendorRent) > 0
//                   ? cfg.vendorRent
//                   : cfg.customerRent != null && cfg.customerRent !== ''
//                     ? cfg.customerRent
//                     : (cfg.pricePerDay ?? ''),
//               ),
//               shippingCharges: String(cfg.shippingCharges ?? ''),
//               bestValue: i === vRc.length - 1,
//             }))
//           : customListingDayTiers();

//         return {
//           id: genLocalId(),
//           variantName: String(v.variantName || '').trim(),
//           stock: v.stock != null ? String(v.stock) : '',
//           existingImages: variantImgs, // ← NOW POPULATED
//           newImages: [],
//           specRows: vsRows.length > 0 ? vsRows : [emptyVariantSpecRow()],
//           sellPrice:
//             v.sellPrice != null
//               ? String(v.sellPrice)
//               : v.price != null
//                 ? String(v.price)
//                 : '',
//           mrpPrice: v.mrpPrice != null ? String(v.mrpPrice) : '',
//           rentalPricingModel: vModel,
//           rentalTiers: vTiers,
//         };
//       });

//       setManualVariants(hydrated);
//       // Auto-select first variant for edit mode
//       setSelectedManualVariantId(hydrated[0]?.id ?? null);
//     } else {
//       setManualVariants([]);
//       setExpandedVariantId(null);
//       setSelectedManualVariantId(null);
//     }
//   }, []);

//   useEffect(() => {
//     if (!isOpen) return;
//     dispatch(getCategories());
//   }, [isOpen, dispatch]);

//   useEffect(() => {
//     if (!isOpen || !token) return;
//     setLoadingList(true);
//     apiGetVendorListingTemplates(token, {
//       type: listingType === 'sell' ? 'sell' : 'rental',
//     })
//       .then((res) =>
//         setTemplates(
//           (res.data?.listingTemplates || []).filter(
//             adminTemplateAllowedForVendor,
//           ),
//         ),
//       )
//       .catch(() => setTemplates([]))
//       .finally(() => setLoadingList(false));
//   }, [isOpen, token, listingType]);

//   useEffect(() => {
//     if (!isOpen) {
//       lastHydrateKeyRef.current = '';
//       return;
//     }
//     const hydrateKey = `${mode}:${initialData?._id ?? 'new'}`;
//     if (lastHydrateKeyRef.current === hydrateKey) return;
//     lastHydrateKeyRef.current = hydrateKey;

//     if (mode === 'edit' && initialData) {
//       hydrateFromVendorProduct(initialData);
//     } else if (mode === 'create') {
//       resetCreateState();
//     }
//   }, [
//     isOpen,
//     mode,
//     initialData?._id,
//     hydrateFromVendorProduct,
//     resetCreateState,
//   ]);

//   useEffect(() => {
//     if (!isOpen || mode !== 'create') return;
//     dispatch(getMyProducts());
//   }, [isOpen, mode, dispatch]);

//   useEffect(() => {
//     if (!categoryId) return;
//     dispatch(getSubCategories(categoryId));
//   }, [categoryId, dispatch]);

//   const categoryName = useMemo(() => {
//     if (fullTemplate?.category) return fullTemplate.category;
//     const c = categories.find((x) => x._id === categoryId);
//     return c?.name || '';
//   }, [fullTemplate, categories, categoryId]);

//   /**
//    * Standard/template listing only: if a tier's Vendor configuration price
//    * is missing (admin only set Customer configuration), fall back to
//    * customerRent minus this product's category commission %, instead of
//    * showing an empty box. Tiers that already have a real vendor price are
//    * returned unchanged.
//    */
//   const applyVendorPriceCommissionFallback = (tiers) => {
//     const rate = categories.find(
//       (c) => c.name === categoryName,
//     )?.commissionRate;
//     return (tiers || []).map((t) => {
//       const hasVendorPrice =
//         t.monthlyRent !== '' &&
//         t.monthlyRent != null &&
//         String(t.monthlyRent).trim() !== '' &&
//         Number(t.monthlyRent) > 0;
//       if (hasVendorPrice) return t;
//       const fallback = computeVendorPriceFromCustomerFallback(
//         t.vendorCost,
//         rate,
//       );
//       return fallback ? { ...t, monthlyRent: fallback } : t;
//     });
//   };

//   const subCategoryName = useMemo(() => {
//     if (fullTemplate?.subCategory) return fullTemplate.subCategory;
//     const s = subCategories.find((x) => x._id === subCategoryId);
//     return s?.name || '';
//   }, [fullTemplate, subCategories, subCategoryId]);

//   useEffect(() => {
//     if (!fullTemplate || !Array.isArray(categories) || !categories.length)
//       return;
//     const cn = String(fullTemplate.category || '').trim();
//     if (!cn) return;
//     const c = categories.find((x) => namesMatch(x.name, cn));
//     if (c) setCategoryId(c._id);
//   }, [fullTemplate, categories]);

//   useEffect(() => {
//     if (!fullTemplate || !Array.isArray(subCategories)) return;
//     const sn = String(fullTemplate.subCategory || '').trim();
//     if (!sn || !categoryId) return;
//     const s = subCategories.find((x) => namesMatch(x.name, sn));
//     if (s) setSubCategoryId(s._id);
//   }, [fullTemplate, subCategories, categoryId]);

//   const filteredTemplates = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     return templates.filter(adminTemplateAllowedForVendor).filter((t) => {
//       if (!q) return true;
//       return (
//         String(t.productName || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(t.sku || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(t.category || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(t.subCategory || '')
//           .toLowerCase()
//           .includes(q)
//       );
//     });
//   }, [templates, searchQuery]);

//   const vendorProductsForActiveListing = useMemo(() => {
//     const list = Array.isArray(vendorProductList) ? vendorProductList : [];
//     return list.filter((p) =>
//       listingType === 'sell'
//         ? String(p?.type || '') === 'Sell'
//         : String(p?.type || '') !== 'Sell',
//     );
//   }, [vendorProductList, listingType]);

//   const listedCategoryOptions = useMemo(() => {
//     const s = new Set();
//     for (const p of vendorProductsForActiveListing) {
//       const c = String(p?.category || '').trim();
//       if (c) s.add(c);
//     }
//     return Array.from(s).sort((a, b) => a.localeCompare(b));
//   }, [vendorProductsForActiveListing]);

//   // const filteredListedProducts = useMemo(() => {
//   //   let rows = vendorProductsForActiveListing;
//   //   if (listedCategoryFilter) {
//   //     rows = rows.filter(
//   //       (p) => String(p?.category || '') === listedCategoryFilter,
//   //     );
//   //   }
//   //   const q = listedSearchQuery.trim().toLowerCase();
//   //   if (!q) return rows;
//   //   return rows.filter((p) => {
//   //     const id = String(p?._id || '').toLowerCase();
//   //     return (
//   //       String(p?.productName || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       String(p?.category || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       String(p?.subCategory || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       id.includes(q)
//   //     );
//   //   });
//   // }, [vendorProductsForActiveListing, listedCategoryFilter, listedSearchQuery]);

//   const filteredListedProducts = useMemo(() => {
//     let rows = vendorProductsForActiveListing;
//     // Custom listing: auto-narrow to the category/sub-category the vendor
//     // just picked in "What are you renting/listing?" above, so this table
//     // shows only relevant reference products for that selection.
//     if (mode === 'create' && customListing) {
//       const catName = String(categoryName || '')
//         .trim()
//         .toLowerCase();
//       const subName = String(subCategoryName || '')
//         .trim()
//         .toLowerCase();
//       if (catName) {
//         rows = rows.filter(
//           (p) =>
//             String(p?.category || '')
//               .trim()
//               .toLowerCase() === catName,
//         );
//       }
//       if (subName) {
//         rows = rows.filter(
//           (p) =>
//             String(p?.subCategory || '')
//               .trim()
//               .toLowerCase() === subName,
//         );
//       }
//     }
//     if (listedCategoryFilter) {
//       rows = rows.filter(
//         (p) => String(p?.category || '') === listedCategoryFilter,
//       );
//     }
//     const q = listedSearchQuery.trim().toLowerCase();
//     if (!q) return rows;
//     return rows.filter((p) => {
//       const id = String(p?._id || '').toLowerCase();
//       return (
//         String(p?.productName || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(p?.category || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(p?.subCategory || '')
//           .toLowerCase()
//           .includes(q) ||
//         id.includes(q)
//       );
//     });
//   }, [
//     vendorProductsForActiveListing,
//     listedCategoryFilter,
//     listedSearchQuery,
//     mode,
//     customListing,
//     categoryName,
//     subCategoryName,
//   ]);

//   const applyTemplate = async (row) => {
//     if (!token) return;
//     setApplyLoadingId(row._id);
//     try {
//       const res = await apiGetVendorListingTemplateByType(
//         row._id,
//         token,
//         listingType === 'sell' ? 'sell' : 'rental',
//       );
//       const t = res.data?.listingTemplate;
//       if (!t) {
//         toast.error('Template not found.');
//         return;
//       }
//       setCustomListing(false);
//       setListedSearchQuery('');
//       setListedCategoryFilter('');
//       setListedFilterPanelOpen(false);
//       setManualVariants([]);
//       setExpandedVariantId(null);
//       setFullTemplate(t);
//       setSelectedTemplateId(t._id);
//       setProductName(t.productName || '');
//       setBrand(t.brand || '');
//       setCondition(
//         normalizeConditionForListingType(
//           t.condition,
//           listingType === 'sell' ? 'Sell' : 'Rental',
//           false,
//         ),
//       );
//       setShortDescription(t.shortDescription || '');
//       setDescription(t.description || '');
//       // setSpecs(specsObjectFromTemplate(t));
//       // setExistingImages(galleryFromTemplate(t));
//       const templateSpecsObj = specsObjectFromTemplate(t);
//       setSpecs(templateSpecsObj);
//       // Also populate the editable spec ROWS (not just the specs object),
//       // otherwise the sync effect below rebuilds `specs` from the still-empty
//       // default row and wipes out what we just set from the template.
//       const templateSpecRows = Object.entries(templateSpecsObj).map(
//         ([label, value]) => ({ label, value: String(value ?? '') }),
//       );
//       setSpecRowList(
//         templateSpecRows.length ? templateSpecRows : [{ label: '', value: '' }],
//       );
//       setExistingImages(galleryFromTemplate(t));
//       setNewImages([]);
//       const n = Array.isArray(t.variants) ? t.variants.length : 0;
//       setVariantIndices(n ? Array.from({ length: n }, (_, i) => i) : []);
//       setSelectedTemplateVariantIndex(0);
//       // const vModel =
//       //   t.variants?.[0]?.rentalPricingModel === 'day' ? 'day' : 'month';
//       // setRentalPricingModel(vModel);
//       const vModel = templateVariantPricingModel(t, 0);
//       setRentalPricingModel(vModel);
//       // if (listingType === 'sell') {
//       //   setSellPrice(
//       //     t.salesConfiguration?.salePrice != null
//       //       ? String(t.salesConfiguration.salePrice)
//       //       : '',
//       //   );
//       //   setMrpPrice(
//       //     t.salesConfiguration?.mrpPrice != null
//       //       ? String(t.salesConfiguration.mrpPrice)
//       //       : '',
//       //   );
//       //   setAllowVendorSalePriceEdit(
//       //     t.salesConfiguration?.allowVendorEditSalePrice !== false,
//       //   );
//       // } else {
//       if (listingType === 'sell') {
//         const v0SaleConfig = getTemplateVariantSaleConfig(t, 0);
//         setSellPrice(v0SaleConfig.sellPrice);
//         setMrpPrice(v0SaleConfig.mrpPrice);
//         setAllowVendorSalePriceEdit(v0SaleConfig.allowVendorEditSalePrice);
//         // } else {
//         //   const canEdit = (() => {
//         //     // Root-level flag is the authoritative source (set by admin toggle)
//         //     if (t.allowVendorEditRentalPrices !== undefined) {
//         //       return t.allowVendorEditRentalPrices !== false;
//         //     }
//         //     // Fallback: if root is unset, check if ALL variants explicitly allow editing
//         //     const variantsArr = Array.isArray(t.variants) ? t.variants : [];
//         //     if (variantsArr.length === 0) return false;
//         //     return variantsArr.every(
//         //       (v) => v && v.allowVendorEditRentalPrices !== false,
//         //     );
//         //   })();
//         //   setAllowVendorPriceEdit(canEdit);
//         //   setRefundableDeposit(getTemplateRefundableDeposit(t, 0));
//         // }
//       } else {
//         const canEdit = getTemplateVariantAllowEdit(t, 0);
//         setAllowVendorPriceEdit(canEdit);
//         setRefundableDeposit(getTemplateRefundableDeposit(t, 0));
//       }
//       const lv = t.logisticsVerification || {};
//       setLogistics((prev) => ({
//         ...prev,
//         inventoryOwnerName: lv.inventoryOwnerName || prev.inventoryOwnerName,
//         city: lv.city || prev.city,
//       }));
//       setStock(t.stock != null ? String(t.stock) : '');
//       toast.success('Template loaded. Review logistics and submit.');
//     } catch (e) {
//       toast.error(e?.response?.data?.message || 'Failed to load template.');
//     } finally {
//       setApplyLoadingId(null);
//     }
//   };

//   // const onCustomListing = () => {
//   //   const nextType = listingType;
//   //   resetCreateState();
//   //   setListingType(nextType);
//   //   setCustomListing(true);
//   //   setFullTemplate(null);
//   //   setSelectedTemplateId(null);
//   // };

//   const onCustomListing = () => {
//     const nextType = listingType;
//     const prevCategoryId = categoryId;
//     const prevSubCategoryId = subCategoryId;
//     resetCreateState();
//     setListingType(nextType);
//     setCustomListing(true);
//     setFullTemplate(null);
//     setSelectedTemplateId(null);
//     if (prevCategoryId) setCategoryId(prevCategoryId);
//     if (prevSubCategoryId) setSubCategoryId(prevSubCategoryId);
//   };

//   const handleCreateSubCategory = async () => {
//     if (!newSubCatName.trim()) {
//       toast.error('Enter a sub-category name.');
//       return;
//     }
//     if (!categoryId) {
//       toast.error('Select a main category first.');
//       return;
//     }
//     if (!newSubCatImage) {
//       toast.error('Add a sub-category image.');
//       return;
//     }
//     setCreatingSubCat(true);
//     try {
//       const fd = new FormData();
//       fd.append('name', newSubCatName.trim());
//       fd.append('categoryId', categoryId);
//       fd.append('image', newSubCatImage);
//       fd.append('commissionRate', String(newSubCatCommissionRate || 0));
//       const res = await apiVendorCreateSubCategory(fd, token);
//       const created = res?.data?.subCategory;
//       toast.success('Sub-category created.');
//       // Refresh subcategories for this category so the new one shows up as a tile
//       await dispatch(getSubCategories(categoryId));
//       if (created?._id) setSubCategoryId(created._id);
//       setSubCatCreateOpen(false);
//       setNewSubCatName('');
//       setNewSubCatImage(null);
//       setNewSubCatCommissionRate(15);
//     } catch (e) {
//       toast.error(
//         e?.response?.data?.message || 'Failed to create sub-category.',
//       );
//     } finally {
//       setCreatingSubCat(false);
//     }
//   };

//   const removeVariantIndex = (idx) => {
//     setVariantIndices((prev) => {
//       const next = prev.filter((i) => i !== idx);
//       // If the currently selected variant is removed, fall back to the first remaining one.
//       if (idx === selectedTemplateVariantIndex) {
//         setSelectedTemplateVariantIndex(next[0] ?? 0);
//       }
//       return next;
//     });
//   };

//   useEffect(() => {
//     if (fullTemplate) {
//       const vCount = Array.isArray(fullTemplate.variants)
//         ? fullTemplate.variants.length
//         : 0;
//       if (!vCount) return;
//       setSpecs(
//         specsObjectFromTemplate(fullTemplate, selectedTemplateVariantIndex),
//       );
//       return;
//     }
//     // Edit mode: read specs from the selected variant's variantSpecs
//     if (
//       mode === 'edit' &&
//       isTemplateBased &&
//       Array.isArray(initialData?.variants)
//     ) {
//       // const v = initialData.variants[selectedTemplateVariantIndex];
//       // if (!v) return;
//       // const specObj = {};
//       // // Primary: per-variant variantSpecs rows
//       // if (Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0) {
//       //   v.variantSpecs.forEach((row) => {
//       //     const k = String(row?.label || '').trim();
//       //     if (k) specObj[k] = String(row?.value ?? '').trim();
//       //   });
//       // } else {
//       //   // Fallback: top-level specifications (same for all variants)
//       //   if (
//       //     initialData.specifications &&
//       //     typeof initialData.specifications === 'object'
//       //   ) {
//       //     Object.entries(initialData.specifications).forEach(([k, val]) => {
//       //       const clean = String(k || '').trim();
//       //       if (clean) specObj[clean] = String(val ?? '').trim();
//       //     });
//       //   }
//       // }
//       // setSpecs(specObj);
//       const v = initialData.variants[selectedTemplateVariantIndex];
//       if (!v) return;
//       const specObj = {};

//       // 1. variantSpecs rows (populated after Fix 1, or for already-saved products)
//       if (Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0) {
//         v.variantSpecs.forEach((row) => {
//           const k = String(row?.label || '').trim();
//           if (k) specObj[k] = String(row?.value ?? '').trim();
//         });
//       }

//       // 2. Direct color/storage/ram fields (template-based products with these fields)
//       if (String(v.color || '').trim())
//         specObj['Color'] = String(v.color).trim();
//       if (String(v.storage || '').trim())
//         specObj['Storage'] = String(v.storage).trim();
//       if (String(v.ram || '').trim()) specObj['RAM'] = String(v.ram).trim();

//       // 3. If still nothing found, use top-level specifications as last resort
//       if (Object.keys(specObj).length === 0) {
//         if (
//           initialData.specifications &&
//           typeof initialData.specifications === 'object'
//         ) {
//           Object.entries(initialData.specifications).forEach(([k, val]) => {
//             const clean = String(k || '').trim();
//             if (clean) specObj[clean] = String(val ?? '').trim();
//           });
//         }
//       }

//       setSpecs(specObj);
//     }
//   }, [
//     fullTemplate,
//     selectedTemplateVariantIndex,
//     mode,
//     isTemplateBased,
//     initialData,
//   ]);

//   // Update refundable deposit when the selected template variant changes
//   // (create mode only). Some templates store refundable deposit at variant level.
//   useEffect(() => {
//     if (mode !== 'create') return;
//     if (!fullTemplate) return;
//     setRefundableDeposit(
//       getTemplateRefundableDeposit(fullTemplate, selectedTemplateVariantIndex),
//     );
//   }, [
//     mode,
//     fullTemplate,
//     selectedTemplateVariantIndex,
//     getTemplateRefundableDeposit,
//   ]);

//   // Sync per-variant sell price/MRP/lock when the selected admin sell
//   // template variant changes — mirrors how rental tiers sync above, so
//   // each variant shows and locks its own Sales Configuration instead of
//   // one shared value across every variant.
//   // useEffect(() => {
//   //   if (listingType !== 'sell') return;
//   //   if (!fullTemplate) return;
//   //   const cfg = getTemplateVariantSaleConfig(
//   //     fullTemplate,
//   //     selectedTemplateVariantIndex,
//   //   );
//   //   setSellPrice(cfg.sellPrice);
//   //   setMrpPrice(cfg.mrpPrice);
//   //   setAllowVendorSalePriceEdit(cfg.allowVendorEditSalePrice);
//   // }, [listingType, fullTemplate, selectedTemplateVariantIndex]);

//   useEffect(() => {
//     if (listingType !== 'sell') return;
//     if (!fullTemplate) return;
//     const cfg = getTemplateVariantSaleConfig(
//       fullTemplate,
//       selectedTemplateVariantIndex,
//     );
//     setSellPrice(cfg.sellPrice);
//     setMrpPrice(cfg.mrpPrice);
//     setAllowVendorSalePriceEdit(cfg.allowVendorEditSalePrice);
//   }, [listingType, fullTemplate, selectedTemplateVariantIndex]);

//   // Keep rental "Allow vendors to edit prices" lock in sync with the
//   // currently selected template variant (mirrors the Sell sync above),
//   // so switching variants respects each variant's own admin toggle.
//   useEffect(() => {
//     if (listingType === 'sell') return;
//     if (!fullTemplate) return;
//     if (mode !== 'create') return;
//     setAllowVendorPriceEdit(
//       getTemplateVariantAllowEdit(fullTemplate, selectedTemplateVariantIndex),
//     );
//   }, [listingType, fullTemplate, selectedTemplateVariantIndex, mode]);

//   // EDIT MODE FIX: when editing an existing template-based sell product
//   // (fullTemplate is null here because it wasn't reloaded from the catalog),
//   // Sales Configuration must be re-read from the SELECTED VARIANT's own
//   // sellPrice/mrpPrice whenever the user switches variants — otherwise the
//   // form kept showing whatever variant was hydrated first for every row.
//   useEffect(() => {
//     if (mode !== 'edit') return;
//     if (fullTemplate) return; // handled by the effect above
//     if (listingType !== 'sell') return;
//     if (!isTemplateBased) return;
//     if (!Array.isArray(initialData?.variants) || !initialData.variants.length)
//       return;

//     const v = initialData.variants[selectedTemplateVariantIndex];
//     if (!v) return;

//     const parseMoney = (x) => {
//       const s = String(x ?? '')
//         .replace(/,/g, '')
//         .trim();
//       if (!s) return null;
//       const n = Number(s);
//       return Number.isFinite(n) ? n : null;
//     };

//     const vSell = parseMoney(v.sellPrice);
//     const vMrp = parseMoney(v.mrpPrice);

//     setSellPrice(vSell != null && vSell > 0 ? String(vSell) : '');
//     setMrpPrice(vMrp != null && vMrp > 0 ? String(vMrp) : '');
//     setAllowVendorSalePriceEdit(
//       initialData?.salesConfiguration?.allowVendorEditSalePrice !== false,
//     );
//   }, [
//     mode,
//     fullTemplate,
//     listingType,
//     isTemplateBased,
//     initialData,
//     selectedTemplateVariantIndex,
//   ]);

//   // const addRentalTier = () => {
//   //   setRentalTiers((prev) => {
//   //     const last = prev[prev.length - 1];
//   //     if (rentalPricingModel === 'day') {
//   //       const d = (last?.days || 7) + 2;
//   //       return [
//   //         ...prev,
//   //         {
//   //           months: 0,
//   //           days: d,
//   //           label: `${d} Days`,
//   //           tierLabel: 'CUSTOM',
//   //           monthlyRent: '',
//   //           shippingCharges: '',
//   //           bestValue: false,
//   //         },
//   //       ];
//   //     }
//   //     const m = (last?.months || 12) + 3;
//   //     return [
//   //       ...prev,
//   //       {
//   //         months: m,
//   //         days: 0,
//   //         label: `${m} Months`,
//   //         tierLabel: 'CUSTOM',
//   //         monthlyRent: '',
//   //         shippingCharges: '',
//   //         bestValue: false,
//   //       },
//   //     ];
//   //   });
//   // };

//   // const addRentalTier = () => {
//   //   setRentalTiers((prev) => {
//   //     const last = prev[prev.length - 1];
//   //     if (rentalPricingModel === 'day') {
//   //       const d = (last?.days || 7) + 2;
//   //       next = [
//   //         ...prev,
//   //         {
//   //           months: 0,
//   //           days: d,
//   //           label: `${d} Days`,
//   //           tierLabel: 'CUSTOM',
//   //           monthlyRent: '',
//   //           shippingCharges: '',
//   //           bestValue: false,
//   //         },
//   //       ];
//   //     } else {
//   //       const m = (last?.months || 12) + 3;
//   //       next = [
//   //         ...prev,
//   //         {
//   //           months: m,
//   //           days: 0,
//   //           label: `${m} Months`,
//   //           tierLabel: 'CUSTOM',
//   //           monthlyRent: '',
//   //           shippingCharges: '',
//   //           bestValue: false,
//   //         },
//   //       ];
//   //     }
//   //     const m = (last?.months || 12) + 3;
//   //     return [
//   //       ...prev,
//   //       {
//   //         months: m,
//   //         days: 0,
//   //         label: `${m} Months`,
//   //         tierLabel: 'CUSTOM',
//   //         monthlyRent: '',
//   //         shippingCharges: '',
//   //         bestValue: false,
//   //       },
//   //     ];
//   //   });
//   // };

//   const addRentalTier = () => {
//     setRentalTiers((prev) => {
//       const last = prev[prev.length - 1];
//       if (rentalPricingModel === 'day') {
//         const d = (last?.days || 7) + 2;
//         return [
//           ...prev,
//           {
//             months: 0,
//             days: d,
//             label: `${d} Days`,
//             tierLabel: 'CUSTOM',
//             monthlyRent: '',
//             shippingCharges: '',
//             bestValue: false,
//           },
//         ];
//       }
//       const m = (last?.months || 12) + 3;
//       return [
//         ...prev,
//         {
//           months: m,
//           days: 0,
//           label: `${m} Months`,
//           tierLabel: 'CUSTOM',
//           monthlyRent: '',
//           shippingCharges: '',
//           bestValue: false,
//         },
//       ];
//     });
//   };

//   // const removeRentalTier = (i) => {
//   //   setRentalTiers((prev) =>
//   //     prev.length <= 1 ? prev : prev.filter((_, j) => j !== i),
//   //   );
//   // };
//   const removeRentalTier = (i) => {
//     setRentalTiers((prev) => {
//       if (prev.length <= 1) return prev;
//       const next = prev.filter((_, j) => j !== i);
//       next.forEach((t) => (t.bestValue = false));
//       if (next.length > 0) next[next.length - 1].bestValue = true;
//       return next;
//     });
//   };

//   const updateTier = (i, field, value) => {
//     setRentalTiers((prev) =>
//       prev.map((row, j) => (j === i ? { ...row, [field]: value } : row)),
//     );
//   };

//   const patchTier = (i, patch) => {
//     setRentalTiers((prev) =>
//       prev.map((row, j) => (j === i ? { ...row, ...patch } : row)),
//     );
//   };

//   // const updateSpecRow = (idx, field, value) => {
//   //   setSpecRowList((prev) =>
//   //     prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
//   //   );
//   // };
//   const updateSpecRow = (idx, field, value) => {
//     setSpecRowList((prev) =>
//       prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
//     );
//     // In manual edit, also persist to the variant's specRows
//     if (mode === 'edit' && !isTemplateBased && activeManualVariantId) {
//       setManualVariants((prev) =>
//         prev.map((x) =>
//           x.id === activeManualVariantId
//             ? {
//                 ...x,
//                 specRows: x.specRows.map((r, i) =>
//                   i === idx ? { ...r, [field]: value } : r,
//                 ),
//               }
//             : x,
//         ),
//       );
//     }
//   };

//   const addSpecRow = () => {
//     setSpecRowList((prev) => [...prev, { label: '', value: '' }]);
//   };

//   const removeSpecRow = (idx) => {
//     setSpecRowList((prev) => {
//       const next = prev.filter((_, i) => i !== idx);
//       return next.length ? next : [{ label: '', value: '' }];
//     });
//   };

//   const buildVariantsPayload = () => {
//     if (fullTemplate && Array.isArray(fullTemplate.variants)) {
//       // Template "variant specs" sometimes come as top-level `template.specifications`
//       // (loaded into `specs` state) instead of `variantSpecs` on each variant.
//       // We use `specs` as a fallback source of truth for color/storage/ram.
//       const productSpecEntries = Object.entries(specs || {});

//       const getFromProductSpecs = (pred) => {
//         const hit = productSpecEntries.find(([k]) =>
//           pred(String(k || '').trim()),
//         );
//         if (!hit) return '';
//         const [, v] = hit;
//         return String(v ?? '').trim();
//       };
//       const rows = variantIndices
//         .map((i) => ({ i, v: fullTemplate.variants[i] }))
//         .filter((x) => x.v)
//         .map(({ i, v }) => ({
//           variantName: String(v.variantName || '').trim(),
//           // Admin templates may store Color/Storage/RAM either in direct fields
//           // (`color`, `storage`, `ram`) OR inside `variantSpecs` label/value rows.
//           color: (() => {
//             const direct = v.color;
//             const variantSpecRows = Array.isArray(v.variantSpecs)
//               ? v.variantSpecs
//               : [];
//             const fromVariantSpecs = variantSpecRows.find((s) => {
//               const label = String(s?.label || '')
//                 .toLowerCase()
//                 .trim();
//               return (
//                 label === 'color' ||
//                 label === 'colour' ||
//                 label.includes('color') ||
//                 label.includes('colour')
//               );
//             })?.value;
//             return String(
//               direct ||
//                 fromVariantSpecs ||
//                 getFromProductSpecs((k) => {
//                   const lk = k.toLowerCase();
//                   return (
//                     lk === 'color' ||
//                     lk === 'colour' ||
//                     lk.includes('color') ||
//                     lk.includes('colour')
//                   );
//                 }),
//             ).trim();
//           })(),
//           storage: (() => {
//             const direct = v.storage;
//             const variantSpecRows = Array.isArray(v.variantSpecs)
//               ? v.variantSpecs
//               : [];
//             const fromVariantSpecs = variantSpecRows.find((s) => {
//               const label = String(s?.label || '')
//                 .toLowerCase()
//                 .trim();
//               return (
//                 label === 'storage' ||
//                 label.includes('storage') ||
//                 label.includes('capacity') ||
//                 label.includes('ssd') ||
//                 label.includes('hdd')
//               );
//             })?.value;
//             return String(
//               direct ||
//                 fromVariantSpecs ||
//                 getFromProductSpecs((k) => {
//                   const lk = k.toLowerCase();
//                   return (
//                     lk === 'storage' ||
//                     lk.includes('storage') ||
//                     lk.includes('capacity') ||
//                     lk.includes('ssd') ||
//                     lk.includes('hdd')
//                   );
//                 }),
//             ).trim();
//           })(),
//           ram: (() => {
//             const direct = v.ram;
//             const variantSpecRows = Array.isArray(v.variantSpecs)
//               ? v.variantSpecs
//               : [];
//             const fromVariantSpecs = variantSpecRows.find((s) => {
//               const label = String(s?.label || '')
//                 .toLowerCase()
//                 .trim();
//               return (
//                 label === 'ram' ||
//                 label.includes('ram') ||
//                 label.includes('memory')
//               );
//             })?.value;
//             return String(
//               direct ||
//                 fromVariantSpecs ||
//                 getFromProductSpecs((k) => {
//                   const lk = k.toLowerCase();
//                   return (
//                     lk === 'ram' || lk.includes('ram') || lk.includes('memory')
//                   );
//                 }),
//             ).trim();
//           })(),
//           //     condition: String(v.condition || condition || '').trim(),
//           //     price: String(v.price || fullTemplate.price || '').trim(),
//           //     stock: toNum(v.stock, 0),
//           //     // Copy variantSpecs from template so edit mode and storefront can read them
//           //     variantSpecs: Array.isArray(v.variantSpecs)
//           //       ? v.variantSpecs
//           //           .filter((r) => String(r?.label || '').trim())
//           //           .map((r) => ({
//           //             label: String(r.label || '').trim(),
//           //             value: String(r.value ?? '').trim(),
//           //           }))
//           //       : [],
//           //   }));
//           // if (rows.length) return rows;

//           condition: String(v.condition || condition || '').trim(),
//           price: String(v.price || fullTemplate.price || '').trim(),
//           stock: toNum(v.stock, 0),
//           // Copy variantSpecs from template so edit mode and storefront can read them
//           variantSpecs: Array.isArray(v.variantSpecs)
//             ? v.variantSpecs
//                 .filter((r) => String(r?.label || '').trim())
//                 .map((r) => ({
//                   label: String(r.label || '').trim(),
//                   value: String(r.value ?? '').trim(),
//                 }))
//             : [],
//           // FIX: persist THIS variant's own rental tiers (month/day), not just
//           // the shared top-level rentalConfigurations. Without this, every
//           // variant ended up saved with the same ("common") rental price.
//           // For the variant currently open in the form, use the live
//           // (possibly vendor-edited) rentalTiers/rentalPricingModel state;
//           // for all other variants, fall back to that variant's own
//           // admin-configured tiers from the template.
//           ...(listingType === 'sell'
//             ? {
//                 // FIX: persist THIS variant's own sell price / MRP, not just
//                 // the shared top-level salesConfiguration. Without this,
//                 // every sell variant ended up saved with sellPrice/mrpPrice
//                 // of 0 (only the single top-level price was stored).
//                 sellPrice: (() => {
//                   const isActiveVariant = i === selectedTemplateVariantIndex;
//                   if (isActiveVariant) return toNum(sellPrice, 0);
//                   const cfg = getTemplateVariantSaleConfig(fullTemplate, i);
//                   return toNum(cfg.sellPrice, 0);
//                 })(),
//                 mrpPrice: (() => {
//                   const isActiveVariant = i === selectedTemplateVariantIndex;
//                   if (isActiveVariant) return toNum(mrpPrice, 0);
//                   const cfg = getTemplateVariantSaleConfig(fullTemplate, i);
//                   return toNum(cfg.mrpPrice, 0);
//                 })(),
//               }
//             : {
//                 rentalConfigurations: (() => {
//                   const isActiveVariant = i === selectedTemplateVariantIndex;
//                   const model = isActiveVariant
//                     ? rentalPricingModel
//                     : templateVariantPricingModel(fullTemplate, i);
//                   // const tiers = isActiveVariant
//                   //   ? rentalTiers
//                   //   : rentalTiersFromTemplate(fullTemplate, model, i);
//                   // return tiers.map((t, idx) => ({
//                   //   months:
//                   //     model === 'month'
//                   //       ? toNum(t.months, [3, 6, 12][idx] || 3)
//                   //       : 0,
//                   //   days:
//                   //     model === 'day' ? toNum(t.days, [3, 5, 7][idx] || 3) : 0,
//                   //   periodUnit: model,
//                   //   label: String(t.label || '').trim(),
//                   //   pricePerDay: model === 'day' ? toNum(t.monthlyRent, 0) : 0,
//                   //   customerRent: toNum(t.monthlyRent, 0),
//                   //   shippingCharges: toNum(t.shippingCharges, 0),
//                   // }));

//                   const tiers = isActiveVariant
//                     ? rentalTiers
//                     : rentalTiersFromTemplate(fullTemplate, model, i);
//                   // Same fix as buildRentalPayload: for a locked (admin-
//                   // controlled) variant, submit the real customer price
//                   // (vendorCost) — never the vendor's own cost price — as
//                   // customerRent, since that's what the storefront shows.
//                   const variantLocked = isActiveVariant
//                     ? rentalFieldsLocked
//                     : !getTemplateVariantAllowEdit(fullTemplate, i);
//                   return tiers.map((t, idx) => ({
//                     months:
//                       model === 'month'
//                         ? toNum(t.months, [3, 6, 12][idx] || 3)
//                         : 0,
//                     days:
//                       model === 'day' ? toNum(t.days, [3, 5, 7][idx] || 3) : 0,
//                     periodUnit: model,
//                     label: String(t.label || '').trim(),
//                     pricePerDay:
//                       model === 'day'
//                         ? variantLocked
//                           ? toNum(t.vendorCost, 0)
//                           : toNum(t.monthlyRent, 0)
//                         : 0,
//                     //     customerRent: variantLocked
//                     //       ? toNum(t.vendorCost, 0)
//                     //       : toNum(t.monthlyRent, 0),
//                     //     shippingCharges: toNum(t.shippingCharges, 0),
//                     //   }));
//                     // })(),
//                     // Same fix as buildRentalPayload: customer-facing price
//                     // must always be the admin's real Customer configuration
//                     // value, never gated by whether this variant is locked.
//                     customerRent:
//                       t.vendorCost !== undefined &&
//                       t.vendorCost !== null &&
//                       String(t.vendorCost).trim() !== ''
//                         ? toNum(t.vendorCost, 0)
//                         : toNum(t.monthlyRent, 0),
//                     // Vendor's own configured price — kept separately so the
//                     // vendor's own product table can show THEIR price.
//                     vendorRent: toNum(t.monthlyRent, 0),
//                     shippingCharges: toNum(t.shippingCharges, 0),
//                   }));
//                 })(),
//               }),
//         }));
//       //   if (rows.length) return rows;
//       // }
//       // // if (
//       // //   mode === 'create' &&
//       // //   customListing &&
//       // //   Array.isArray(manualVariants) &&
//       // //   manualVariants.length
//       // // ) {
//       // if (
//       //   ((mode === 'create' && customListing) ||
//       //     (mode === 'edit' && !isTemplateBased)) &&
//       //   Array.isArray(manualVariants) &&
//       //   manualVariants.length
//       // ) {
//       if (rows.length) return rows;
//     }
//     // EDIT MODE FIX: when editing an existing template-based rental/sell
//     // product, `fullTemplate` is null (it's only populated when a template
//     // is freshly applied from the catalog). Without this branch, execution
//     // fell through to the single-variant fallback below and silently
//     // dropped every other variant (and its own rental config) on save.
//     if (
//       mode === 'edit' &&
//       isTemplateBased &&
//       !fullTemplate &&
//       Array.isArray(initialData?.variants) &&
//       initialData.variants.length
//     ) {
//       const rows = initialData.variants.map((v, i) => {
//         const isActiveVariant = i === selectedTemplateVariantIndex;
//         const base = {
//           variantName: String(v.variantName || '').trim(),
//           color: String(v.color || '').trim(),
//           storage: String(v.storage || '').trim(),
//           ram: String(v.ram || '').trim(),
//           condition: String(v.condition || condition || '').trim(),
//           price: String(v.price || '').trim(),
//           stock: toNum(v.stock, 0),
//           variantSpecs: isActiveVariant
//             ? Object.entries(specs || {})
//                 .filter(([k]) => String(k || '').trim())
//                 .map(([k, val]) => ({
//                   label: String(k).trim(),
//                   value: String(val ?? '').trim(),
//                 }))
//             : Array.isArray(v.variantSpecs)
//               ? v.variantSpecs
//               : [],
//         };
//         if (listingType === 'sell') {
//           return {
//             ...base,
//             sellPrice: isActiveVariant
//               ? toNum(sellPrice, 0)
//               : toNum(v.sellPrice, 0),
//             mrpPrice: isActiveVariant
//               ? toNum(mrpPrice, 0)
//               : toNum(v.mrpPrice, 0),
//           };
//         }
//         return {
//           ...base,
//           rentalConfigurations: isActiveVariant
//             ? buildRentalPayload()
//             : Array.isArray(v.rentalConfigurations)
//               ? v.rentalConfigurations
//               : [],
//         };
//       });
//       if (rows.length) return rows;
//     }
//     // if (
//     //   mode === 'create' &&
//     //   customListing &&
//     //   Array.isArray(manualVariants) &&
//     //   manualVariants.length
//     // ) {
//     if (
//       ((mode === 'create' && customListing) ||
//         (mode === 'edit' && !isTemplateBased)) &&
//       Array.isArray(manualVariants) &&
//       manualVariants.length
//     ) {
//       const rentLabel =
//         rentalTiers[0]?.monthlyRent != null &&
//         String(rentalTiers[0].monthlyRent).trim() !== ''
//           ? `₹${rentalTiers[0].monthlyRent}/mo`
//           : '0';
//       const sellLabel =
//         String(sellPrice || '').trim() !== '' ? String(sellPrice).trim() : '0';
//       return manualVariants.map((mv) => {
//         const variantSellLabel =
//           String(mv.sellPrice || '').trim() !== ''
//             ? String(mv.sellPrice).trim()
//             : sellLabel;
//         const variantRentLabel =
//           formatFirstTierRentLabel(
//             mv.rentalTiers,
//             mv.rentalPricingModel || 'day',
//           ) ?? rentLabel;
//         const variantRentalConfigurations =
//           listingType === 'sell'
//             ? undefined
//             : (mv.rentalTiers || []).map((t, i) => ({
//                 months:
//                   (mv.rentalPricingModel || 'day') === 'month'
//                     ? toNum(t.months, [3, 6, 9][i] || 3)
//                     : 0,
//                 days:
//                   (mv.rentalPricingModel || 'day') === 'day'
//                     ? toNum(t.days, 1)
//                     : 0,
//                 periodUnit: mv.rentalPricingModel || 'day',
//                 label: String(t.label || '').trim(),
//                 pricePerDay:
//                   (mv.rentalPricingModel || 'day') === 'day'
//                     ? toNum(t.monthlyRent, 0)
//                     : 0,
//                 customerRent: toNum(t.monthlyRent, 0),
//                 shippingCharges: toNum(t.shippingCharges, 0),
//               }));
//         return {
//           variantName:
//             String(mv.variantName || '').trim() ||
//             String(productName || '').trim() ||
//             'Variant',
//           color: '',
//           storage: '',
//           ram: '',
//           condition: String(condition || '').trim(),
//           price: listingType === 'sell' ? variantSellLabel : variantRentLabel,
//           sellPrice:
//             listingType === 'sell' ? toNum(mv.sellPrice, 0) : undefined,
//           mrpPrice: listingType === 'sell' ? toNum(mv.mrpPrice, 0) : undefined,
//           rentalConfigurations: variantRentalConfigurations,
//           stock: toNum(mv.stock, 0),
//           // Persist this variant's own kept image URLs.
//           images: Array.isArray(mv.existingImages)
//             ? mv.existingImages.filter(Boolean)
//             : [],
//           // ADD THIS — save the per-variant spec rows
//           variantSpecs: Array.isArray(mv.specRows)
//             ? mv.specRows
//                 .filter((r) => String(r?.label || '').trim())
//                 .map((r) => ({
//                   label: String(r.label || '').trim(),
//                   value: String(r.value ?? '').trim(),
//                 }))
//             : [],
//         };
//       });
//     }
//     return [
//       {
//         variantName: productName || 'Default',
//         color: '',
//         storage: '',
//         ram: '',
//         condition: String(condition || '').trim(),
//         price: String(fullTemplate?.price || '').trim(),
//         stock: 0,
//       },
//     ];
//   };
//   // const buildRentalPayload = () =>
//   //   rentalTiers.map((t, i) => ({
//   //     months:
//   //       rentalPricingModel === 'month'
//   //         ? toNum(t.months, [3, 6, 12][i] || 3)
//   //         : 0,
//   //     days: rentalPricingModel === 'day' ? toNum(t.days, [3, 5, 7][i] || 3) : 0,
//   //     periodUnit: rentalPricingModel,
//   //     label: String(t.label || '').trim(),
//   //     pricePerDay: rentalPricingModel === 'day' ? toNum(t.monthlyRent, 0) : 0,
//   //     customerRent: toNum(t.monthlyRent, 0),
//   //     shippingCharges:
//   //       mode === 'create' && customListing ? 0 : toNum(t.shippingCharges, 0),
//   //   }));

//   const buildRentalPayload = () =>
//     rentalTiers.map((t, i) => ({
//       months:
//         rentalPricingModel === 'month'
//           ? toNum(t.months, [3, 6, 12][i] || 3)
//           : 0,
//       days: rentalPricingModel === 'day' ? toNum(t.days, [3, 5, 7][i] || 3) : 0,
//       periodUnit: rentalPricingModel,
//       label: String(t.label || '').trim(),
//       // Submit the admin's real customer-facing price (vendorCost holds it
//       // for locked/template tiers) — never the vendor's own cost price —
//       // as the customerRent, since this is what the storefront shows.
//       pricePerDay:
//         rentalPricingModel === 'day'
//           ? rentalFieldsLocked
//             ? toNum(t.vendorCost, 0)
//             : toNum(t.monthlyRent, 0)
//           : 0,
//       //   customerRent: rentalFieldsLocked
//       //     ? toNum(t.vendorCost, 0)
//       //     : toNum(t.monthlyRent, 0),
//       //   shippingCharges:
//       //     mode === 'create' && customListing ? 0 : toNum(t.shippingCharges, 0),
//       // }));

//       // Customer-facing price must always be the admin's real Customer
//       // configuration value, regardless of whether the vendor is allowed
//       // to edit their own price — vendor edit permission only affects
//       // vendorRent, never what the storefront/customer sees.
//       customerRent:
//         t.vendorCost !== undefined &&
//         t.vendorCost !== null &&
//         String(t.vendorCost).trim() !== ''
//           ? toNum(t.vendorCost, 0)
//           : toNum(t.monthlyRent, 0),
//       // Vendor's own configured price — kept separately so the vendor's
//       // own product table can show THEIR price, not the customer price.
//       vendorRent: toNum(t.monthlyRent, 0),
//       shippingCharges:
//         mode === 'create' && customListing ? 0 : toNum(t.shippingCharges, 0),
//     }));

//   const validate = (submissionStatus) => {
//     if (!String(productName || '').trim()) {
//       toast.error('Product name is required.');
//       return false;
//     }
//     if (
//       !String(categoryName || '').trim() ||
//       !String(subCategoryName || '').trim()
//     ) {
//       toast.error('Category and sub-category are required.');
//       return false;
//     }
//     if (submissionStatus !== 'draft') {
//       const customImageOk =
//         mode === 'create' &&
//         customListing &&
//         manualVariants.some(
//           (mv) =>
//             (mv.existingImages && mv.existingImages.length > 0) ||
//             (mv.newImages && mv.newImages.length > 0),
//         );
//       if (
//         !fullTemplate &&
//         (mode === 'create' && customListing
//           ? !customImageOk
//           : !existingImages.length && !newImages.length)
//       ) {
//         toast.error('Add at least one product image (in variant details).');
//         return false;
//       }
//       if (mode === 'create' && customListing) {
//         if (!manualVariants.length) {
//           toast.error('Add at least one product variant.');
//           return false;
//         }
//         const missingName = manualVariants.some(
//           (mv) => !String(mv.variantName || '').trim(),
//         );
//         if (missingName) {
//           toast.error('Each variant needs a name.');
//           return false;
//         }
//         if (listingType === 'sell') {
//           const missingSellPrice = manualVariants.some(
//             (mv) => !String(mv.sellPrice || '').trim(),
//           );
//           if (missingSellPrice) {
//             toast.error('Each variant needs a selling price.');
//             return false;
//           }
//         } else {
//           const missingRent = manualVariants.some(
//             (mv) =>
//               !Array.isArray(mv.rentalTiers) ||
//               !mv.rentalTiers.some(
//                 (t) => String(t?.monthlyRent || '').trim() !== '',
//               ),
//           );
//           if (missingRent) {
//             toast.error('Each variant needs at least one rental price.');
//             return false;
//           }
//         }
//       }
//       if (!String(logistics.deliveryTimelineValue || '').trim()) {
//         toast.error('Delivery timeline is required.');
//         return false;
//       }
//       if (!String(stock || '').trim()) {
//         toast.error('Inventory count is required.');
//         return false;
//       }
//     }
//     return true;
//   };

//   // const submit = (submissionStatus) => {
//   //   if (!validate(submissionStatus)) return;
//   //   const isCustomListingFlow = customListing;
//   //   const imgs = isCustomListingFlow
//   //     ? collectCustomListingImageUrls(manualVariants)
//   //     : [...existingImages];
//   //   const imageFiles = isCustomListingFlow
//   //     ? collectCustomListingImageFiles(manualVariants)
//   //     : newImages;
//   //   const specificationsPayload = isCustomListingFlow
//   //     ? mergeCustomListingSpecifications(manualVariants)
//   //     : specs;
//   //   const rentalPriceLabel =
//   //     formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ||
//   //     fullTemplate?.price ||
//   //     '0';
//   //   const sellPriceLabel =
//   //     String(sellPrice || '').trim() !== ''
//   //       ? String(sellPrice).trim()
//   //       : fullTemplate?.price || '0';

//   //   const createdVia =
//   //     mode === 'create'
//   //       ? fullTemplate
//   //         ? 'template'
//   //         : 'manual'
//   //       : initialData?.createdVia === 'template'
//   //         ? 'template'
//   //         : 'manual';

//   //   onSubmit({
//   //     productName: String(productName).trim(),
//   //     type: listingType === 'sell' ? 'Sell' : 'Rental',
//   //     category: categoryName,
//   //     subCategory: subCategoryName,
//   //     brand: String(brand || '').trim(),
//   //     condition: normalizeConditionForListingType(
//   //       condition || 'Brand New',
//   //       listingType === 'sell' ? 'Sell' : 'Rental',
//   //       listingType === 'rent' &&
//   //         (mode === 'create'
//   //           ? !fullTemplate
//   //           : initialData?.createdVia !== 'template'),
//   //     ),
//   //     shortDescription: String(shortDescription || '').trim(),
//   //     description: String(description || '').trim(),
//   //     specifications: specificationsPayload,
//   //     variants: buildVariantsPayload(),
//   //     rentalConfigurations: listingType === 'sell' ? [] : buildRentalPayload(),
//   //     refundableDeposit:
//   //       listingType === 'sell' ? 0 : toNum(refundableDeposit, 0),
//   //     salesConfiguration:
//   //       listingType === 'sell'
//   //         ? {
//   //             allowVendorEditSalePrice: allowVendorSalePriceEdit,
//   //             salePrice: toNum(sellPrice, toNum(fullTemplate?.price, 0)),
//   //             mrpPrice: toNum(mrpPrice, 0),
//   //           }
//   //         : {},
//   //     logisticsVerification: {
//   //       inventoryOwnerName: String(logistics.inventoryOwnerName || '').trim(),
//   //       city: String(logistics.city || '').trim(),
//   //       deliveryTimelineValue: toNum(logistics.deliveryTimelineValue, 0),
//   //       deliveryTimelineUnit: logistics.deliveryTimelineUnit || 'Days',
//   //     },
//   //     existingImages: imgs.filter(Boolean).slice(0, 10),
//   //     images: imageFiles,
//   //     price: listingType === 'sell' ? sellPriceLabel : rentalPriceLabel,
//   //     stock: toNum(stock, 0),
//   //     status: 'Active',
//   //     submissionStatus,
//   //     createdVia,
//   //     allowVendorEditRentalPrices: allowVendorPriceEdit,
//   //   });
//   // };

//   // const submit = (submissionStatus) => {
//   //   if (!validate(submissionStatus)) return;
//   //   const isCustomListingFlow = mode === 'create' && customListing;
//   //   const imgs = isCustomListingFlow
//   //     ? collectCustomListingImageUrls(manualVariants)
//   //     : [...existingImages];
//   //   const imageFiles = isCustomListingFlow
//   //     ? collectCustomListingImageFiles(manualVariants)
//   //     : newImages;
//   //   // const specificationsPayload = isCustomListingFlow
//   //   //   ? mergeCustomListingSpecifications(manualVariants)
//   //   //   : specs;
//   //   const isManualEditFlow = mode === 'edit' && !isTemplateBased;
//   //   const specificationsPayload =
//   //     isCustomListingFlow || isManualEditFlow
//   //       ? mergeCustomListingSpecifications(manualVariants)
//   //       : specs;

//   const submit = (submissionStatus) => {
//     if (!validate(submissionStatus)) return;
//     const isCustomListingFlow = mode === 'create' && customListing;
//     // FIX: manual (non-template) EDIT mode must also aggregate images from
//     // each variant's own existingImages/newImages, same as create-mode
//     // custom listings. Without this, per-variant image edits never reached
//     // the submit payload — edit mode was falling back to the shared
//     // top-level existingImages/newImages state, a disconnected pool that
//     // caused images to "bleed" between variants.
//     const isManualEditFlow = mode === 'edit' && !isTemplateBased;
//     const imgs =
//       isCustomListingFlow || isManualEditFlow
//         ? collectCustomListingImageUrls(manualVariants)
//         : [...existingImages];
//     const imageFiles =
//       isCustomListingFlow || isManualEditFlow
//         ? collectCustomListingImageFiles(manualVariants)
//         : newImages;
//     const newImageOwners =
//       isCustomListingFlow || isManualEditFlow
//         ? collectCustomListingImageOwners(manualVariants)
//         : [];
//     // const specificationsPayload = isCustomListingFlow
//     //   ? mergeCustomListingSpecifications(manualVariants)
//     //   : specs;
//     const specificationsPayload =
//       isCustomListingFlow || isManualEditFlow
//         ? mergeCustomListingSpecifications(manualVariants)
//         : specs;
//     // const rentalPriceLabel =
//     //   formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ||
//     //   fullTemplate?.price ||
//     //   '0';
//     const manualVariantRentLabel =
//       (isCustomListingFlow || isManualEditFlow) && manualVariants.length
//         ? formatFirstTierRentLabel(
//             manualVariants[0]?.rentalTiers,
//             manualVariants[0]?.rentalPricingModel || 'day',
//           )
//         : null;
//     const rentalPriceLabel =
//       manualVariantRentLabel ||
//       formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ||
//       fullTemplate?.price ||
//       '0';
//     // const firstVariantSellPrice =
//     //   isCustomListingFlow || isManualEditFlow
//     //     ? String(manualVariants?.[0]?.sellPrice || '').trim()
//     //     : '';
//     const firstVariantSellPrice =
//       isCustomListingFlow || isManualEditFlow
//         ? String(
//             (manualVariants || []).find(
//               (mv) => String(mv?.sellPrice || '').trim() !== '',
//             )?.sellPrice || '',
//           ).trim()
//         : '';
//     const sellPriceLabel =
//       String(sellPrice || '').trim() !== ''
//         ? String(sellPrice).trim()
//         : firstVariantSellPrice || fullTemplate?.price || '0';

//     const createdVia =
//       mode === 'create'
//         ? fullTemplate
//           ? 'template'
//           : 'manual'
//         : initialData?.createdVia === 'template'
//           ? 'template'
//           : 'manual';

//     // // ✅ Use fresh isRentalLocked, not stale rentalFieldsLocked from render
//     // const rentalConfigurations = (() => {
//     //   if (listingType === 'sell') return [];
//     //   if (
//     //     // isRentalLocked &&
//     //     rentalFieldsLocked &&
//     //     mode === 'edit' &&
//     //     Array.isArray(initialData?.rentalConfigurations) &&
//     //     initialData.rentalConfigurations.length > 0
//     //   ) {
//     //     return initialData.rentalConfigurations;
//     //   }
//     //   return buildRentalPayload();
//     // })();

//     // ✅ Use fresh isRentalLocked, not stale rentalFieldsLocked from render
//     const rentalConfigurations = (() => {
//       if (listingType === 'sell') return [];
//       // Custom / manual variant listings: keep the product-level rental
//       // config in sync with the variant's own (latest edited) tiers —
//       // otherwise this stayed on a separate stale state and caused the
//       // storefront/order price to differ from what was just edited.
//       // if (
//       //   (isCustomListingFlow || isManualEditFlow) &&
//       //   Array.isArray(manualVariants) &&
//       //   manualVariants.length
//       // ) {
//       //   const primary = manualVariants[0];
//       //   const model = primary.rentalPricingModel || 'day';
//       //   return (primary.rentalTiers || []).map((t, i) => ({
//       //     months: model === 'month' ? toNum(t.months, [3, 6, 9][i] || 3) : 0,
//       //     days: model === 'day' ? toNum(t.days, 1) : 0,
//       //     periodUnit: model,
//       //     label: String(t.label || '').trim(),
//       //     pricePerDay: model === 'day' ? toNum(t.monthlyRent, 0) : 0,
//       //     customerRent: toNum(t.monthlyRent, 0),
//       //     shippingCharges: toNum(t.shippingCharges, 0),
//       //   }));
//       // }
//       if (
//         (isCustomListingFlow || isManualEditFlow) &&
//         Array.isArray(manualVariants) &&
//         manualVariants.length
//       ) {
//         const primary = manualVariants[0];
//         const model = primary.rentalPricingModel || 'day';
//         return (primary.rentalTiers || []).map((t, i) => ({
//           months: model === 'month' ? toNum(t.months, [3, 6, 9][i] || 3) : 0,
//           days: model === 'day' ? toNum(t.days, 1) : 0,
//           periodUnit: model,
//           label: String(t.label || '').trim(),
//           pricePerDay: model === 'day' ? toNum(t.monthlyRent, 0) : 0,
//           customerRent: toNum(t.monthlyRent, 0),
//           shippingCharges: toNum(t.shippingCharges, 0),
//         }));
//       }
//       // Template-based (standard) listings in edit mode: always mirror
//       // Variant 0's own saved rentalConfigurations for the top-level/master
//       // field, so it stays stable and doesn't drift to whichever variant
//       // tab happened to be open last when Save was clicked.
//       if (
//         mode === 'edit' &&
//         isTemplateBased &&
//         !fullTemplate &&
//         Array.isArray(initialData?.variants) &&
//         initialData.variants.length
//       ) {
//         const isVariant0Active = selectedTemplateVariantIndex === 0;
//         if (isVariant0Active) {
//           return buildRentalPayload();
//         }
//         const v0 = initialData.variants[0];
//         if (
//           Array.isArray(v0?.rentalConfigurations) &&
//           v0.rentalConfigurations.length
//         ) {
//           return v0.rentalConfigurations;
//         }
//         return buildRentalPayload();
//       }
//       if (
//         // isRentalLocked &&
//         rentalFieldsLocked &&
//         mode === 'edit' &&
//         Array.isArray(initialData?.rentalConfigurations) &&
//         initialData.rentalConfigurations.length > 0
//       ) {
//         return initialData.rentalConfigurations;
//       }
//       return buildRentalPayload();
//     })();

//     onSubmit({
//       productName: String(productName).trim(),
//       type: listingType === 'sell' ? 'Sell' : 'Rental',
//       category: categoryName,
//       subCategory: subCategoryName,
//       brand: String(brand || '').trim(),
//       condition: normalizeConditionForListingType(
//         condition || 'Brand New',
//         listingType === 'sell' ? 'Sell' : 'Rental',
//         listingType === 'rent' &&
//           (mode === 'create'
//             ? !fullTemplate
//             : initialData?.createdVia !== 'template'),
//       ),
//       shortDescription: String(shortDescription || '').trim(),
//       description: String(description || '').trim(),
//       // specifications: specificationsPayload,
//       // variants: buildVariantsPayload(),
//       // rentalConfigurations: listingType === 'sell' ? [] : buildRentalPayload(),
//       // refundableDeposit:
//       specifications: specificationsPayload,
//       variants: buildVariantsPayload(),
//       rentalConfigurations,
//       refundableDeposit:
//         listingType === 'sell' ? 0 : toNum(refundableDeposit, 0),
//       salesConfiguration:
//         listingType === 'sell'
//           ? {
//               allowVendorEditSalePrice: allowVendorSalePriceEdit,
//               salePrice: toNum(sellPrice, toNum(fullTemplate?.price, 0)),
//               mrpPrice: toNum(mrpPrice, 0),
//             }
//           : {},
//       logisticsVerification: {
//         inventoryOwnerName: String(logistics.inventoryOwnerName || '').trim(),
//         city: String(logistics.city || '').trim(),
//         deliveryTimelineValue: toNum(logistics.deliveryTimelineValue, 0),
//         deliveryTimelineUnit: logistics.deliveryTimelineUnit || 'Days',
//       },
//       existingImages: imgs.filter(Boolean).slice(0, 10),
//       images: imageFiles,
//       // Parallel to `images` — which variant (by index) each new file belongs to.
//       newImageOwners,
//       price: listingType === 'sell' ? sellPriceLabel : rentalPriceLabel,
//       stock: toNum(stock, 0),
//       status: 'Active',
//       submissionStatus,
//       createdVia,
//       allowVendorEditRentalPrices: allowVendorPriceEdit,
//     });
//   };
//   // useEffect(() => {
//   //   if (!fullTemplate) {
//   //     lastTemplateRentalSyncKeyRef.current = '';
//   //     return;
//   //   }
//   //   if (mode !== 'create') {
//   //     setRentalTiers(
//   //       rentalTiersFromTemplate(
//   //         fullTemplate,
//   //         rentalPricingModel,
//   //         selectedTemplateVariantIndex,
//   //       ),
//   //     );
//   //     return;
//   //   }
//   //   const native = templateVariantPricingModel(
//   //     fullTemplate,
//   //     selectedTemplateVariantIndex,
//   //   );
//   //   const key = `${fullTemplate._id ?? 'tpl'}:${selectedTemplateVariantIndex}`;
//   //   const tplOrVariantChanged = lastTemplateRentalSyncKeyRef.current !== key;
//   //   const lockUnitToTemplate = !allowVendorPriceEdit;
//   //   if (tplOrVariantChanged) {
//   //     lastTemplateRentalSyncKeyRef.current = key;
//   //     setRentalPricingModel(native);
//   //     setRentalTiers(
//   //       rentalTiersFromTemplate(
//   //         fullTemplate,
//   //         native,
//   //         selectedTemplateVariantIndex,
//   //       ),
//   //     );
//   //     return;
//   //   }
//   //   if (!lockUnitToTemplate) {
//   //     setRentalTiers(
//   //       rentalTiersFromTemplate(
//   //         fullTemplate,
//   //         rentalPricingModel,
//   //         selectedTemplateVariantIndex,
//   //       ),
//   //     );
//   //   } else {
//   //     setRentalPricingModel(native);
//   //     setRentalTiers(
//   //       rentalTiersFromTemplate(
//   //         fullTemplate,
//   //         native,
//   //         selectedTemplateVariantIndex,
//   //       ),
//   //     );
//   //   }
//   //   // }, [
//   //   //   fullTemplate,
//   //   //   selectedTemplateVariantIndex,
//   //   //   rentalPricingModel,
//   //   //   mode,
//   //   //   allowVendorPriceEdit,
//   //   // ]);
//   // }, [
//   //   fullTemplate,
//   //   selectedTemplateVariantIndex,
//   //   rentalPricingModel,
//   //   mode,
//   //   allowVendorPriceEdit,
//   // ]);

//   useEffect(() => {
//     if (!fullTemplate) {
//       lastTemplateRentalSyncKeyRef.current = '';
//       return;
//     }
//     if (mode !== 'create') {
//       setRentalTiers(
//         rentalTiersFromTemplate(
//           fullTemplate,
//           rentalPricingModel,
//           selectedTemplateVariantIndex,
//         ),
//       );
//       return;
//     }
//     const native = templateVariantPricingModel(
//       fullTemplate,
//       selectedTemplateVariantIndex,
//     );
//     const key = `${fullTemplate._id ?? 'tpl'}:${selectedTemplateVariantIndex}`;
//     const tplOrVariantChanged = lastTemplateRentalSyncKeyRef.current !== key;
//     const lockUnitToTemplate = !allowVendorPriceEdit;
//     if (tplOrVariantChanged) {
//       lastTemplateRentalSyncKeyRef.current = key;
//       setRentalPricingModel(native);
//       setRentalTiers(
//         applyVendorPriceCommissionFallback(
//           rentalTiersFromTemplate(
//             fullTemplate,
//             native,
//             selectedTemplateVariantIndex,
//           ),
//         ),
//       );
//       return;
//     }
//     if (!lockUnitToTemplate) {
//       setRentalTiers(
//         applyVendorPriceCommissionFallback(
//           rentalTiersFromTemplate(
//             fullTemplate,
//             rentalPricingModel,
//             selectedTemplateVariantIndex,
//           ),
//         ),
//       );
//     } else {
//       setRentalPricingModel(native);
//       setRentalTiers(
//         applyVendorPriceCommissionFallback(
//           rentalTiersFromTemplate(
//             fullTemplate,
//             native,
//             selectedTemplateVariantIndex,
//           ),
//         ),
//       );
//     }
//   }, [
//     fullTemplate,
//     selectedTemplateVariantIndex,
//     rentalPricingModel,
//     mode,
//     allowVendorPriceEdit,
//   ]);

//   // EDIT MODE FIX: when editing an existing template-based rental product
//   // (fullTemplate is null here because it wasn't reloaded from the catalog),
//   // the rental tiers must be re-read from the SELECTED VARIANT's own
//   // rentalConfigurations whenever the user switches variants — otherwise
//   // every variant kept showing the same top-level rentalConfigurations.
//   useEffect(() => {
//     if (mode !== 'edit') return;
//     if (fullTemplate) return; // handled by the effect above
//     if (listingType === 'sell') return;
//     if (!isTemplateBased) return;
//     if (!Array.isArray(initialData?.variants) || !initialData.variants.length)
//       return;

//     const v = initialData.variants[selectedTemplateVariantIndex];
//     if (!v) return;

//     const vRc = Array.isArray(v.rentalConfigurations)
//       ? v.rentalConfigurations
//       : [];
//     if (!vRc.length) return; // no per-variant data, keep current tiers

//     // const vModel = vRc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
//     // const vTiers = vRc.slice(0, 6).map((cfg, i) => ({
//     //   months: toNum(cfg.months, 0),
//     //   days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
//     //   label:
//     //     String(cfg.label || '').trim() ||
//     //     (vModel === 'day'
//     //       ? `${toNum(cfg.days, 1)} Days`
//     //       : `${toNum(cfg.months, 3)} Months`),
//     //   tierLabel: '',
//     //   monthlyRent: String(
//     //     cfg.customerRent != null && cfg.customerRent !== ''
//     //       ? cfg.customerRent
//     //       : (cfg.pricePerDay ?? ''),
//     //   ),
//     //   shippingCharges: String(cfg.shippingCharges ?? ''),
//     //   bestValue: i === vRc.length - 1,
//     // }));
//     const vModel = vRc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
//     const vTiers = vRc.slice(0, 6).map((cfg, i) => ({
//       months: toNum(cfg.months, 0),
//       days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
//       label:
//         String(cfg.label || '').trim() ||
//         (vModel === 'day'
//           ? `${toNum(cfg.days, 1)} Days`
//           : `${toNum(cfg.months, 3)} Months`),
//       tierLabel: '',
//       // Edit mode must show the VENDOR's own price, never the
//       // customer-facing price.
//       //   monthlyRent: String(
//       //     cfg.vendorRent != null && cfg.vendorRent !== ''
//       //       ? cfg.vendorRent
//       //       : cfg.customerRent != null && cfg.customerRent !== ''
//       //         ? cfg.customerRent
//       //         : (cfg.pricePerDay ?? ''),
//       //   ),
//       //   shippingCharges: String(cfg.shippingCharges ?? ''),
//       //   bestValue: i === vRc.length - 1,
//       // }));
//       // Edit mode must show the VENDOR's own price, never the
//       // customer-facing price.
//       monthlyRent: String(
//         Number(cfg.vendorRent) > 0
//           ? cfg.vendorRent
//           : cfg.customerRent != null && cfg.customerRent !== ''
//             ? cfg.customerRent
//             : (cfg.pricePerDay ?? ''),
//       ),
//       shippingCharges: String(cfg.shippingCharges ?? ''),
//       bestValue: i === vRc.length - 1,
//     }));

//     setRentalPricingModel(vModel);
//     setRentalTiers(vTiers);
//     if (vModel === 'day') {
//       dayTiersBackupRef.current = vTiers;
//     } else {
//       monthTiersBackupRef.current = vTiers;
//     }
//   }, [
//     mode,
//     fullTemplate,
//     listingType,
//     isTemplateBased,
//     initialData,
//     selectedTemplateVariantIndex,
//   ]);

//   useEffect(() => {
//     if (!isOpen || mode !== 'edit' || !initialData || !categories.length)
//       return;
//     const c = categories.find((x) => x.name === initialData.category);
//     if (c) setCategoryId(c._id);
//   }, [isOpen, mode, initialData, categories]);

//   useEffect(() => {
//     if (!isOpen || mode !== 'edit' || !initialData || !subCategories.length)
//       return;
//     const s = subCategories.find((x) => x.name === initialData.subCategory);
//     if (s) setSubCategoryId(s._id);
//   }, [isOpen, mode, initialData, subCategories]);

//   // Keep `specs` in sync when vendor can edit specifications (manual / non-template).
//   const createdViaInitialForSync =
//     initialData?.createdVia === 'template' ? 'template' : 'manual';
//   const isTemplateBasedForSync =
//     !!fullTemplate || createdViaInitialForSync === 'template';
//   const detailsLockedForSync =
//     (mode === 'create' && !!fullTemplate) ||
//     (mode === 'edit' && isTemplateBasedForSync);

//   // useEffect(() => {
//   //   if (!isOpen || detailsLockedForSync) return;
//   useEffect(() => {
//     if (!isOpen || detailsLockedForSync) return;
//     if (mode === 'create' && customListing) return;
//     if (mode === 'edit' && !isTemplateBased) return;
//     const next = {};
//     specRowList.forEach(({ label, value }) => {
//       const k = String(label).trim();
//       if (k) next[k] = String(value ?? '').trim();
//     });
//     setSpecs(next);
//   }, [isOpen, mode, customListing, isTemplateBased, fullTemplate, specRowList]);

//   const updateVariantRentalTier = (variantId, i, field, value) => {
//     setManualVariants((prev) =>
//       prev.map((x) =>
//         x.id === variantId
//           ? {
//               ...x,
//               rentalTiers: (x.rentalTiers || []).map((row, j) =>
//                 j === i ? { ...row, [field]: value } : row,
//               ),
//             }
//           : x,
//       ),
//     );
//   };

//   const addVariantRentalTier = (variantId) => {
//     setManualVariants((prev) =>
//       prev.map((x) => {
//         if (x.id !== variantId) return x;
//         const model = x.rentalPricingModel || 'day';
//         const tiers = x.rentalTiers || [];
//         const last = tiers[tiers.length - 1];
//         const nextTier =
//           model === 'day'
//             ? {
//                 months: 0,
//                 days: (last?.days || 7) + 2,
//                 label: `${(last?.days || 7) + 2} Days`,
//                 tierLabel: 'CUSTOM',
//                 monthlyRent: '',
//                 shippingCharges: '',
//                 bestValue: false,
//               }
//             : {
//                 months: (last?.months || 12) + 3,
//                 days: 0,
//                 label: `${(last?.months || 12) + 3} Months`,
//                 tierLabel: 'CUSTOM',
//                 monthlyRent: '',
//                 shippingCharges: '',
//                 bestValue: false,
//               };
//         return { ...x, rentalTiers: [...tiers, nextTier] };
//       }),
//     );
//   };

//   const removeVariantRentalTier = (variantId, i) => {
//     setManualVariants((prev) =>
//       prev.map((x) => {
//         if (x.id !== variantId) return x;
//         const tiers = x.rentalTiers || [];
//         if (tiers.length <= 1) return x;
//         const next = tiers.filter((_, j) => j !== i);
//         next.forEach((t) => (t.bestValue = false));
//         if (next.length > 0) next[next.length - 1].bestValue = true;
//         return { ...x, rentalTiers: next };
//       }),
//     );
//   };

//   const switchVariantRentalPricingModel = (variantId, nextModel) => {
//     setManualVariants((prev) =>
//       prev.map((x) => {
//         if (x.id !== variantId) return x;
//         if (nextModel === x.rentalPricingModel) return x;
//         const restored =
//           nextModel === 'day' ? customListingDayTiers() : defaultMonthTiers();
//         return { ...x, rentalPricingModel: nextModel, rentalTiers: restored };
//       }),
//     );
//   };

//   const activeManualVariantId =
//     mode === 'edit' && !isTemplateBased
//       ? (expandedVariantId ?? selectedManualVariantId)
//       : expandedVariantId;

//   useEffect(() => {
//     if (mode !== 'edit' || isTemplateBased) return;
//     if (!activeManualVariantId) return;
//     const mv = manualVariants.find((v) => v.id === activeManualVariantId);
//     if (!mv) return;
//     const rows = mv.specRows || [];
//     setSpecRowList(rows.length ? rows : [{ label: '', value: '' }]);
//   }, [mode, isTemplateBased, activeManualVariantId]);

//   // Market-low benchmarks for custom rental listings (category + sub-category names).
//   useEffect(() => {
//     if (!isOpen) {
//       setMarketLowTenures({ month: {}, day: {} });
//       setMarketLowLoading(false);
//       return;
//     }
//     if (mode !== 'create' || !customListing || listingType !== 'rent') {
//       setMarketLowTenures({ month: {}, day: {} });
//       setMarketLowLoading(false);
//       return;
//     }
//     const cat = String(categoryName || '').trim();
//     const sub = String(subCategoryName || '').trim();
//     if (!token || !cat || !sub) {
//       setMarketLowTenures({ month: {}, day: {} });
//       setMarketLowLoading(false);
//       return;
//     }
//     let cancelled = false;
//     setMarketLowLoading(true);
//     apiGetVendorMarketLowRentalTenures(
//       { category: cat, subCategory: sub },
//       token,
//     )
//       .then((res) => {
//         if (cancelled) return;
//         const m = res?.data?.month || {};
//         const d = res?.data?.day || {};
//         setMarketLowTenures({ month: m, day: d });
//       })
//       .catch(() => {
//         if (!cancelled) setMarketLowTenures({ month: {}, day: {} });
//       })
//       .finally(() => {
//         if (!cancelled) setMarketLowLoading(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, [
//     isOpen,
//     mode,
//     customListing,
//     listingType,
//     categoryName,
//     subCategoryName,
//     token,
//   ]);

//   // Dynamic tenure rows for custom rental: follow market-low keys (month / day).
//   useEffect(() => {
//     if (
//       !isOpen ||
//       mode !== 'create' ||
//       !customListing ||
//       listingType !== 'rent'
//     )
//       return;
//     setRentalTiers((prev) =>
//       synthesizeRentalTiersFromMarket(
//         marketLowTenures.month,
//         marketLowTenures.day,
//         rentalPricingModel,
//         prev,
//       ),
//     );
//   }, [
//     isOpen,
//     mode,
//     customListing,
//     listingType,
//     marketLowTenures,
//     rentalPricingModel,
//   ]);

//   if (!isOpen) return null;

//   const showDetailSections =
//     mode === 'edit' ||
//     fullTemplate ||
//     (customListing && categoryId && subCategoryId);

//   // Template-based vs manual listings
//   // const createdViaInitial =
//   //   initialData?.createdVia === "template" ? "template" : "manual";
//   // const isTemplateBased = !!fullTemplate || createdViaInitial === "template";

//   // Product images always stay locked for template-based listings, regardless
//   // of whether the admin lets vendors edit prices.
//   const imagesLocked =
//     (mode === 'create' && !!fullTemplate) ||
//     (mode === 'edit' && isTemplateBased);

//   // // Rental pricing fields can be unlocked for vendors when admin explicitly allows it.
//   // const rentalFieldsLocked =
//   //   (mode === 'create' && !!fullTemplate && !allowVendorPriceEdit) ||
//   //   (mode === 'edit' && isTemplateBased && !allowVendorPriceEdit);

//   // // Other admin-provided details (name, brand, condition, description, specs)
//   // // stay locked for vendor (view only) EXCEPT for rent listings, where they
//   // // must follow the SAME lock state as the rental price fields (reusing
//   // // `rentalFieldsLocked` directly guarantees identical on/off behavior).
//   // // Sell listings keep the original fully-locked behavior for now.
//   // const detailsLocked =
//   //   listingType === 'rent' ? rentalFieldsLocked : imagesLocked;
//   // const saleFieldsLocked =
//   //   (mode === 'create' && !!fullTemplate && !allowVendorSalePriceEdit) ||
//   //   (mode === 'edit' &&
//   //     isTemplateBased &&
//   //     !allowVendorSalePriceEdit &&
//   //     listingType === 'sell');

//   // Rental pricing fields can be unlocked for vendors when admin explicitly allows it.
//   const rentalFieldsLocked =
//     (mode === 'create' && !!fullTemplate && !allowVendorPriceEdit) ||
//     (mode === 'edit' && isTemplateBased && !allowVendorPriceEdit);

//   const saleFieldsLocked =
//     (mode === 'create' && !!fullTemplate && !allowVendorSalePriceEdit) ||
//     (mode === 'edit' &&
//       isTemplateBased &&
//       !allowVendorSalePriceEdit &&
//       listingType === 'sell');

//   // Other admin-provided details (name, brand, condition, description, specs)
//   // stay locked for vendor (view only) EXCEPT when the admin toggle for
//   // that listing type explicitly allows editing — rent follows
//   // `rentalFieldsLocked`, sell follows `saleFieldsLocked` (same pattern),
//   // so switching the toggle ON unlocks product details too, not just the
//   // Sales/Rental Configuration section. Product images remain governed
//   // separately by `imagesLocked` and are never unlocked by this toggle.
//   const detailsLocked =
//     listingType === 'rent' ? rentalFieldsLocked : saleFieldsLocked;

//   const isCustomRentalPricing =
//     mode === 'create' && customListing && listingType === 'rent';

//   const conditionSelectOptions =
//     listingType === 'sell'
//       ? SELL_CONDITION_OPTIONS
//       : detailsLocked
//         ? RENTAL_TEMPLATE_CONDITION_OPTIONS
//         : RENTAL_MANUAL_CONDITION_OPTIONS;

//   // const displayVariants =
//   //   fullTemplate && Array.isArray(fullTemplate.variants)
//   //     ? variantIndices
//   //         .map((i) => ({ index: i, v: fullTemplate.variants[i] }))
//   //         .filter((x) => x.v)
//   //     : [];

//   // AFTER:
//   const editModeVariants =
//     mode === 'edit' &&
//     isTemplateBased &&
//     !fullTemplate &&
//     Array.isArray(initialData?.variants)
//       ? initialData.variants
//       : null;

//   const templateVariantsSource = fullTemplate?.variants ?? editModeVariants;

//   const displayVariants =
//     templateVariantsSource && templateVariantsSource.length > 0
//       ? variantIndices.length > 0
//         ? variantIndices
//             .map((i) => ({ index: i, v: templateVariantsSource[i] }))
//             .filter((x) => x.v)
//         : templateVariantsSource.map((v, i) => ({ index: i, v }))
//       : [];

//   const specEntries = Object.entries(specs).filter(
//     ([k, v]) => k && v != null && String(v).trim() !== '',
//   );

//   // const expandedVariant =
//   //   mode === 'create' && customListing && expandedVariantId
//   //     ? (manualVariants.find((v) => v.id === expandedVariantId) ?? null)
//   //     : null;

//   const expandedVariant =
//     ((mode === 'create' && customListing) ||
//       (mode === 'edit' && !isTemplateBased)) &&
//     activeManualVariantId
//       ? (manualVariants.find((v) => v.id === activeManualVariantId) ?? null)
//       : null;

//   const customListingPricePreview =
//     listingType === 'sell'
//       ? String(sellPrice || '').trim()
//         ? `₹${sellPrice}`
//         : '—'
//       : (formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ?? '—');

//   const showPerVariantSalesConfig =
//     listingType === 'sell' &&
//     ((mode === 'create' && customListing) ||
//       (mode === 'edit' && !isTemplateBased));

//   const showPerVariantRentalConfig =
//     listingType === 'rent' &&
//     ((mode === 'create' && customListing) ||
//       (mode === 'edit' && !isTemplateBased)) &&
//     Array.isArray(manualVariants) &&
//     manualVariants.length > 0;

//   /** Own sell prices when not applying an admin listing template from catalog. */
//   const manualSellSalesConfiguration =
//     listingType === 'sell' && !fullTemplate && !showPerVariantSalesConfig;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
//       <div className="flex min-h-0 w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl">
//         <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900">
//               {mode === 'edit' ? 'Edit Listing' : 'Add New Listing'}
//             </h2>
//             <p className="text-xs text-gray-500 mt-0.5">
//               List your product, rental, or service.
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
//             aria-label="Close"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
//           <div className="space-y-4 p-4 sm:p-5">
//             {/* Listing type */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//               {[
//                 {
//                   id: 'sell',
//                   label: 'Sell Product',
//                   sub: 'One-time purchase',
//                   rowIcon: 'tag',
//                 },
//                 {
//                   id: 'rent',
//                   label: 'Rent Out',
//                   sub: 'Monthly rental',
//                   rowIcon: 'rent',
//                 },
//                 {
//                   id: 'service',
//                   label: 'Offer Service',
//                   sub: 'Hourly / fixed',
//                   rowIcon: null,
//                 },
//               ].map((opt) => {
//                 const selected = listingType === opt.id;
//                 const isRowLayout =
//                   opt.rowIcon === 'rent' || opt.rowIcon === 'tag';
//                 return (
//                   <button
//                     key={opt.id}
//                     type="button"
//                     disabled={
//                       opt.id === 'service'
//                         ? mode !== 'create' || !onOpenServiceProduct
//                         : false
//                     }
//                     onClick={() =>
//                       opt.id === 'service'
//                         ? onOpenServiceProduct?.()
//                         : (() => {
//                             const nextKind = opt.id;
//                             setListingType(nextKind);
//                             setCondition((prev) =>
//                               nextKind === 'sell'
//                                 ? normalizeConditionForListingType(prev, 'Sell')
//                                 : normalizeConditionForListingType(
//                                     prev,
//                                     'Rental',
//                                     true,
//                                   ),
//                             );
//                             setCustomListing(false);
//                             setExpandedVariantId(null);
//                             setFullTemplate(null);
//                             setSelectedTemplateId(null);
//                             setSearchQuery('');
//                             setListedSearchQuery('');
//                             setListedCategoryFilter('');
//                             setListedFilterPanelOpen(false);
//                             setProductName('');
//                             setBrand('');
//                             setDescription('');
//                             setSpecs({});
//                             setExistingImages([]);
//                             setNewImages([]);
//                             setManualVariants([]);
//                           })()
//                     }
//                     className={`rounded-xl border-2 transition ${
//                       isRowLayout
//                         ? 'flex flex-row items-center justify-center gap-3 px-4 py-3.5'
//                         : 'flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center'
//                     } ${
//                       selected
//                         ? 'border-blue-500  ring-1 ring-blue-200 bg-white'
//                         : 'border-gray-200 bg-white opacity-60'
//                     } ${
//                       opt.id === 'service' &&
//                       (mode !== 'create' || !onOpenServiceProduct)
//                         ? 'cursor-not-allowed'
//                         : 'cursor-pointer opacity-100'
//                     }`}
//                   >
//                     {isRowLayout ? (
//                       <>
//                         {opt.rowIcon === 'rent' ? (
//                           <RentOutListingIcon className="h-6 w-6 shrink-0 object-contain" />
//                         ) : (
//                           <Tag
//                             className="h-6 w-6 shrink-0 text-gray-600"
//                             strokeWidth={2}
//                             aria-hidden
//                           />
//                         )}
//                         <div className="min-w-0 text-left">
//                           <p
//                             className={`text-sm font-semibold leading-tight ${
//                               selected ? 'text-blue-600' : 'text-gray-900'
//                             }`}
//                           >
//                             {opt.label}
//                           </p>
//                           <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                             {opt.sub}
//                           </p>
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <p
//                           className={`text-sm font-semibold ${
//                             selected ? 'text-blue-600' : 'text-gray-900'
//                           }`}
//                         >
//                           {opt.label}
//                         </p>
//                         <p className="text-[11px] leading-snug text-gray-500">
//                           {opt.sub}
//                         </p>
//                       </>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>

//             <>
//               {/* Category / subcategory (from template or manual) */}
//               <SectionCard
//                 icon={Tag}
//                 headerIconBoxed
//                 title={
//                   listingType === 'sell'
//                     ? 'What are you listing?'
//                     : 'What are you renting?'
//                 }
//                 subtitle="Select category to see relevant fields"
//               >
//                 <div className="w-full space-y-6">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900 mb-3">
//                       Step 1: Main Category{' '}
//                       <span className="text-red-500">*</span>
//                     </p>
//                     {filteredCategories.length === 0 ? (
//                       <p className="text-sm text-gray-500 py-2">
//                         No categories available for this listing type.
//                       </p>
//                     ) : (
//                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
//                         {filteredCategories.map((c) => {
//                           const selected = categoryId === c._id;
//                           const asset = categoryOrSubAssetUrl(c);
//                           return (
//                             <button
//                               key={c._id}
//                               type="button"
//                               disabled={detailsLocked}
//                               onClick={() => {
//                                 if (detailsLocked) return;
//                                 setCategoryId(c._id);
//                                 setSubCategoryId('');
//                               }}
//                               className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
//                                 selected
//                                   ? 'border-orange-500 bg-orange-50/50 shadow-sm'
//                                   : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
//                               } disabled:cursor-not-allowed disabled:opacity-90 disabled:hover:border-gray-200 disabled:hover:bg-white`}
//                             >
//                               {asset ? (
//                                 <img
//                                   src={asset}
//                                   alt=""
//                                   className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
//                                     selected ? '' : 'opacity-90'
//                                   }`}
//                                 />
//                               ) : (
//                                 <Package
//                                   className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
//                                     selected
//                                       ? 'text-orange-500'
//                                       : 'text-gray-400'
//                                   }`}
//                                   strokeWidth={1.75}
//                                 />
//                               )}
//                               <span
//                                 className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
//                                   selected ? 'text-orange-600' : 'text-gray-600'
//                                 }`}
//                               >
//                                 {c.name}
//                               </span>
//                             </button>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                   {/* <div>
//                     <p className="text-sm font-semibold text-gray-900 mb-3">
//                       Step 2: Sub Category{' '}
//                       <span className="text-red-500">*</span>
//                     </p>
//                     {!categoryId ? ( */}
//                   <div>
//                     <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
//                       <p className="text-sm font-semibold text-gray-900">
//                         Step 2: Sub Category{' '}
//                         <span className="text-red-500">*</span>
//                       </p>
//                       {categoryId && !detailsLocked ? (
//                         <button
//                           type="button"
//                           onClick={() => setSubCatCreateOpen((v) => !v)}
//                           className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
//                         >
//                           <Plus className="h-3.5 w-3.5" strokeWidth={2} />
//                           {subCatCreateOpen ? 'Cancel' : 'Sub Category'}
//                         </button>
//                       ) : null}
//                     </div>

//                     {!categoryId ? (
//                       <p className="text-sm text-gray-500 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center">
//                         Choose a main category first.
//                       </p>
//                     ) : filteredSubCategories.length === 0 ? (
//                       <p className="text-sm text-gray-500 py-2">
//                         No sub-categories for this category yet.
//                       </p>
//                     ) : (
//                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
//                         {filteredSubCategories.map((s) => {
//                           const selected = subCategoryId === s._id;
//                           const asset = categoryOrSubAssetUrl(s);
//                           return (
//                             <button
//                               key={s._id}
//                               type="button"
//                               disabled={detailsLocked}
//                               onClick={() => {
//                                 if (detailsLocked) return;
//                                 setSubCategoryId(s._id);
//                               }}
//                               className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
//                                 selected
//                                   ? 'border-orange-500 bg-orange-50/50 shadow-sm'
//                                   : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
//                               } disabled:cursor-not-allowed disabled:opacity-90 disabled:hover:border-gray-200 disabled:hover:bg-white`}
//                             >
//                               {asset ? (
//                                 <img
//                                   src={asset}
//                                   alt=""
//                                   className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
//                                     selected ? '' : 'opacity-90'
//                                   }`}
//                                 />
//                               ) : (
//                                 <Package
//                                   className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
//                                     selected
//                                       ? 'text-orange-500'
//                                       : 'text-gray-400'
//                                   }`}
//                                   strokeWidth={1.75}
//                                 />
//                               )}
//                               <span
//                                 className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
//                                   selected ? 'text-orange-600' : 'text-gray-600'
//                                 }`}
//                               >
//                                 {s.name}
//                               </span>
//                             </button>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                   {/* <p className="w-full text-xs text-gray-500">
//                   {fullTemplate
//                     ? 'Tiles reflect the standard catalog product you added below (read-only).'
//                     : customListing
//                       ? 'Pick main and sub category tiles above. Your listed products below are for reference.'
//                       : 'Pick tiles above, or add a standard product below to set category and sub-category from the catalog.'}
//                 </p> */}
//                 </div>
//               </SectionCard>

//               {/* Standard admin templates vs. your listings (custom listing — read-only, no Add) */}
//               {mode === 'create' && customListing ? (
//                 <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//                   {/* <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/90">
//                   <h3 className="text-sm font-semibold text-gray-900">
//                     Your listed products
//                   </h3>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Reference only — add a new custom listing in the form below.
//                   </p>
//                 </div> */}
//                   <div className="p-4 space-y-3">
//                     <div className="flex flex-col sm:flex-row gap-2">
//                       <div className="relative flex-1">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                         <input
//                           type="search"
//                           value={listedSearchQuery}
//                           onChange={(e) => setListedSearchQuery(e.target.value)}
//                           placeholder="Search your Listed Products"
//                           className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
//                         />
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setListedFilterPanelOpen((v) => !v)}
//                         className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 shrink-0"
//                       >
//                         <Filter className="h-4 w-4 text-gray-500" aria-hidden />
//                         Filter
//                       </button>
//                     </div>
//                     {listedFilterPanelOpen ? (
//                       <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2">
//                         <label className="text-[11px] font-medium text-gray-500">
//                           Category
//                         </label>
//                         <select
//                           value={listedCategoryFilter}
//                           onChange={(e) =>
//                             setListedCategoryFilter(e.target.value)
//                           }
//                           className="mt-1 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
//                         >
//                           <option value="">All categories</option>
//                           {listedCategoryOptions.map((c) => (
//                             <option key={c} value={c}>
//                               {c}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     ) : null}
//                     <div className="max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
//                       {vendorProductsLoading &&
//                       vendorProductsForActiveListing.length === 0 ? (
//                         <p className="p-8 text-center text-sm text-gray-500">
//                           Loading your products…
//                         </p>
//                       ) : filteredListedProducts.length === 0 ? (
//                         <p className="p-8 text-center text-sm text-gray-500">
//                           {vendorProductsForActiveListing.length === 0
//                             ? listingType === 'sell'
//                               ? 'You have no sell listings yet.'
//                               : 'You have no rental listings yet.'
//                             : 'No products match your search or filter.'}
//                         </p>
//                       ) : (
//                         <table className="min-w-full text-sm">
//                           <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
//                             <tr>
//                               <th className="px-3 py-2 font-medium">Product</th>
//                               <th className="px-3 py-2 font-medium hidden sm:table-cell">
//                                 Category
//                               </th>
//                               <th className="px-3 py-2 font-medium hidden md:table-cell">
//                                 Sub-category
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-100">
//                             {filteredListedProducts.map((p) => (
//                               <tr key={p._id} className="hover:bg-gray-50/80">
//                                 <td className="px-3 py-2">
//                                   <div className="flex items-center gap-2">
//                                     <img
//                                       src={
//                                         p.images?.[0] ||
//                                         p.image ||
//                                         PLACEHOLDER_IMG
//                                       }
//                                       alt=""
//                                       className="h-11 w-11 rounded-lg object-cover border border-gray-100"
//                                     />
//                                     <div className="min-w-0">
//                                       <p className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-none">
//                                         {p.productName || '—'}
//                                       </p>
//                                       <p className="text-[11px] text-gray-500">
//                                         {listedProductPriceSubtitle(p)}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td className="px-3 py-2 hidden sm:table-cell text-gray-600">
//                                   {p.category || '—'}
//                                 </td>
//                                 <td className="px-3 py-2 hidden md:table-cell text-gray-600">
//                                   {p.subCategory || '—'}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//                   {/* <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/90">
//                   <h3 className="text-sm font-semibold text-gray-900">
//                     Search Standard Listed Products
//                   </h3>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Admin templates — Add loads catalog data into this form.
//                   </p>
//                 </div> */}
//                   <div className="p-4 space-y-3">
//                     <div className="flex flex-col sm:flex-row gap-2">
//                       <div className="relative flex-1">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                         <input
//                           type="search"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                           placeholder="Search by Product Name or SKU..."
//                           className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
//                         />
//                       </div>
//                       {mode === 'create' ? (
//                         <button
//                           type="button"
//                           onClick={onCustomListing}
//                           className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 shrink-0"
//                         >
//                           + Custom Listing
//                         </button>
//                       ) : null}
//                     </div>
//                     <div className="max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
//                       {loadingList && templates.length === 0 ? (
//                         <p className="p-8 text-center text-sm text-gray-500">
//                           Loading templates…
//                         </p>
//                       ) : filteredTemplates.length === 0 ? (
//                         <p className="p-8 text-center text-sm text-gray-500">
//                           No templates match your search.
//                         </p>
//                       ) : (
//                         <table className="min-w-full text-sm">
//                           <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
//                             <tr>
//                               <th className="px-3 py-2 font-medium">Product</th>
//                               <th className="px-3 py-2 font-medium hidden sm:table-cell">
//                                 Category
//                               </th>
//                               <th className="px-3 py-2 font-medium hidden md:table-cell">
//                                 Sub-category
//                               </th>
//                               <th className="px-3 py-2 font-medium w-24 text-right">
//                                 Action
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-100">
//                             {filteredTemplates.map((row) => {
//                               const added = selectedTemplateId === row._id;
//                               return (
//                                 <tr
//                                   key={row._id}
//                                   className="hover:bg-gray-50/80"
//                                 >
//                                   <td className="px-3 py-2">
//                                     <div className="flex items-center gap-2">
//                                       <img
//                                         src={
//                                           row.images?.[0] ||
//                                           row.image ||
//                                           PLACEHOLDER_IMG
//                                         }
//                                         alt=""
//                                         className="h-11 w-11 rounded-lg object-cover border border-gray-100"
//                                       />
//                                       <div className="min-w-0">
//                                         <p className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-none">
//                                           {row.productName}
//                                         </p>
//                                         {row.sku ? (
//                                           <p className="text-[11px] text-gray-400">
//                                             SKU: {row.sku}
//                                           </p>
//                                         ) : null}
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="px-3 py-2 hidden sm:table-cell text-gray-600">
//                                     {row.category || '—'}
//                                   </td>
//                                   <td className="px-3 py-2 hidden md:table-cell text-gray-600">
//                                     {row.subCategory || '—'}
//                                   </td>
//                                   <td className="px-3 py-2 text-right">
//                                     {added ? (
//                                       <span className="text-sm font-medium text-emerald-600">
//                                         Added
//                                       </span>
//                                     ) : (
//                                       <button
//                                         type="button"
//                                         disabled={!!applyLoadingId}
//                                         onClick={() => applyTemplate(row)}
//                                         className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
//                                       >
//                                         {applyLoadingId === row._id
//                                           ? '…'
//                                           : 'Add'}
//                                       </button>
//                                     )}
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {showDetailSections ? (
//                 <>
//                   <div
//                     className={
//                       mode === 'create' && customListing
//                         ? 'flex flex-col gap-6'
//                         : 'flex flex-col gap-4'
//                     }
//                   >
//                     {/* {!(mode === 'create' && customListing) ? (
//                       <div>
//                         <SectionCard
//                           title="Product Media"
//                           icon={detailsLocked ? null : ImageIcon}
//                           badge={
//                             <GreenVerifiedBadge>
//                               Catalog Images
//                             </GreenVerifiedBadge>
//                           }
//                           showLock={false}
//                         >
//                           {detailsLocked ? (
//                             <div
//                               className="mb-3 flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm"
//                               role="img"
//                               aria-label="Catalog images are locked"
//                             >
//                               <Lock
//                                 className="h-3 w-3"
//                                 strokeWidth={2}
//                                 aria-hidden
//                               />
//                             </div>
//                           ) : null}
//                           <div className="flex flex-wrap gap-3">
//                             {existingImages.map((url, i) => (
//                               <div key={`${url}-${i}`} className="relative">
//                                 <img
//                                   src={url}
//                                   alt=""
//                                   className="h-72 w-64 rounded-xl object-cover border border-gray-200"
//                                 />
//                                 <span className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
//                                   {i + 1}
//                                 </span>
//                               </div>
//                             ))}
//                             {!detailsLocked &&
//                               newImages.map((file, i) => (
//                                 <div
//                                   key={`${file.name}-${i}`}
//                                   className="relative"
//                                 >
//                                   <img
//                                     src={URL.createObjectURL(file)}
//                                     alt=""
//                                     className="h-24 w-24 rounded-xl object-cover border border-gray-200"
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       setNewImages((prev) =>
//                                         prev.filter((_, j) => j !== i),
//                                       )
//                                     }
//                                     className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow"
//                                   >
//                                     <X className="h-3 w-3" />
//                                   </button>
//                                 </div>
//                               ))}
//                             {!detailsLocked ? (
//                               <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400">
//                                 <span>Upload</span>
//                                 <input
//                                   type="file"
//                                   accept="image/*"
//                                   multiple
//                                   className="hidden"
//                                   onChange={(e) => {
//                                     const files = Array.from(
//                                       e.target.files || [],
//                                     ).slice(
//                                       0,
//                                       Math.max(
//                                         0,
//                                         10 -
//                                           existingImages.length -
//                                           newImages.length,
//                                       ),
//                                     );
//                                     setNewImages((prev) => [...prev, ...files]);
//                                     e.target.value = '';
//                                   }}
//                                 />
//                               </label>
//                             ) : null}
//                           </div>
//                         </SectionCard>
//                       </div>
//                     ) : null} */}
//                     {/* {!customListing ? ( */}
//                     {(!customListing || mode === 'edit') &&
//                     !(mode === 'edit' && !isTemplateBased) ? (
//                       <div>
//                         <SectionCard
//                           title="Product Media"
//                           icon={imagesLocked ? null : ImageIcon}
//                           badge={
//                             <GreenVerifiedBadge>
//                               Catalog Images
//                             </GreenVerifiedBadge>
//                           }
//                           showLock={false}
//                         >
//                           {imagesLocked ? (
//                             <div
//                               className="mb-3 flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm"
//                               role="img"
//                               aria-label="Catalog images are locked"
//                             >
//                               <Lock
//                                 className="h-3 w-3"
//                                 strokeWidth={2}
//                                 aria-hidden
//                               />
//                             </div>
//                           ) : null}

//                           {/* NEW: choose selected variant images in edit mode */}
//                           {(() => {
//                             // const mediaImages =
//                             //   mode === 'edit' &&
//                             //   isTemplateBased &&
//                             //   editModeVariants
//                             //     ? (() => {
//                             //         // Try variant's own .images first (template API response has these)
//                             //         const v =
//                             //           editModeVariants[
//                             //             selectedTemplateVariantIndex
//                             //           ];
//                             //         const variantImgs = Array.isArray(v?.images)
//                             //           ? v.images.filter(Boolean)
//                             //           : [];
//                             //         if (variantImgs.length > 0)
//                             //           return variantImgs;
//                             //         // Fallback: distribute top-level initialData.images across variants
//                             //         const allImgs = Array.isArray(
//                             //           initialData?.images,
//                             //         )
//                             //           ? initialData.images.filter(Boolean)
//                             //           : [];
//                             //         if (allImgs.length === 0)
//                             //           return existingImages;
//                             //         const total = editModeVariants.length;
//                             //         if (total <= 1) return allImgs;
//                             //         const perV = Math.ceil(
//                             //           allImgs.length / total,
//                             //         );
//                             //         const idx = selectedTemplateVariantIndex;
//                             //         const slice = allImgs.slice(
//                             //           idx * perV,
//                             //           idx * perV + perV,
//                             //         );
//                             //         return slice.length > 0 ? slice : allImgs;
//                             //       })()
//                             //     : existingImages;

//                             const isManualEdit =
//                               mode === 'edit' && !isTemplateBased;

//                             const mediaImages = isManualEdit
//                               ? expandedVariant?.existingImages ||
//                                 existingImages
//                               : mode === 'edit' &&
//                                   isTemplateBased &&
//                                   editModeVariants
//                                 ? (() => {
//                                     const v =
//                                       editModeVariants[
//                                         selectedTemplateVariantIndex
//                                       ];
//                                     const variantImgs = Array.isArray(v?.images)
//                                       ? v.images.filter(Boolean)
//                                       : [];

//                                     if (variantImgs.length > 0)
//                                       return variantImgs;

//                                     const allImgs = Array.isArray(
//                                       initialData?.images,
//                                     )
//                                       ? initialData.images.filter(Boolean)
//                                       : [];

//                                     if (allImgs.length === 0)
//                                       return existingImages;

//                                     const total = editModeVariants.length;
//                                     if (total <= 1) return allImgs;

//                                     const perV = Math.ceil(
//                                       allImgs.length / total,
//                                     );
//                                     const idx = selectedTemplateVariantIndex;

//                                     const slice = allImgs.slice(
//                                       idx * perV,
//                                       idx * perV + perV,
//                                     );

//                                     return slice.length > 0 ? slice : allImgs;
//                                   })()
//                                 : existingImages;

//                             return (
//                               <div className="flex flex-wrap gap-3">
//                                 {mediaImages.map((url, i) => (
//                                   <div key={`${url}-${i}`} className="relative">
//                                     <img
//                                       src={url}
//                                       alt=""
//                                       className="h-72 w-64 rounded-xl object-cover border border-gray-200"
//                                     />
//                                     <span className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
//                                       {i + 1}
//                                     </span>
//                                   </div>
//                                 ))}
//                                 {!imagesLocked &&
//                                   newImages.map((file, i) => (
//                                     <div
//                                       key={`${file.name}-${i}`}
//                                       className="relative"
//                                     >
//                                       <img
//                                         src={URL.createObjectURL(file)}
//                                         alt=""
//                                         className="h-24 w-24 rounded-xl object-cover border border-gray-200"
//                                       />
//                                       <button
//                                         type="button"
//                                         onClick={() =>
//                                           setNewImages((prev) =>
//                                             prev.filter((_, j) => j !== i),
//                                           )
//                                         }
//                                         className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow"
//                                       >
//                                         <X className="h-3 w-3" />
//                                       </button>
//                                     </div>
//                                   ))}

//                                 {!imagesLocked ? (
//                                   <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400">
//                                     <span>Upload</span>
//                                     <input
//                                       type="file"
//                                       accept="image/*"
//                                       multiple
//                                       className="hidden"
//                                       onChange={(e) => {
//                                         const files = Array.from(
//                                           e.target.files || [],
//                                         ).slice(
//                                           0,
//                                           Math.max(
//                                             0,
//                                             10 -
//                                               existingImages.length -
//                                               newImages.length,
//                                           ),
//                                         );
//                                         setNewImages((prev) => [
//                                           ...prev,
//                                           ...files,
//                                         ]);
//                                         e.target.value = '';
//                                       }}
//                                     />
//                                   </label>
//                                 ) : null}
//                               </div>
//                             );
//                           })()}
//                         </SectionCard>
//                       </div>
//                     ) : null}
//                     <div>
//                       <SectionCard
//                         title={
//                           mode === 'create' && customListing
//                             ? 'Basic Details'
//                             : null
//                         }
//                         icon={null}
//                         // badge={
//                         //   mode === 'create' && customListing ? null : (
//                         //     <GreenVerifiedBadge>
//                         //       Verified Specs
//                         //     </GreenVerifiedBadge>
//                         //   )
//                         // }
//                         badge={
//                           mode === 'create' &&
//                           customListing ? null : isTemplateBased ? (
//                             <GreenVerifiedBadge>
//                               Verified Specs
//                             </GreenVerifiedBadge>
//                           ) : null
//                         }
//                         showLock={detailsLocked}
//                       >
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                           {/* <div> */}
//                           {/* <label className="text-xs text-gray-500">
//                             {mode === 'create' && customListing
//                               ? 'Product title'
//                               : 'Product name'}
//                             {mode === 'create' && customListing ? (
//                               <span className="text-red-500"> *</span>
//                             ) : null}
//                           </label> */}
//                           <div>
//                             {/* Label OUTSIDE (above) - only for create mode with customListing */}
//                             {mode === 'create' && customListing && (
//                               <label className="block text-xs text-gray-500 mb-1">
//                                 Product Title
//                                 <span className="text-red-500"> *</span>
//                               </label>
//                             )}

//                             <div className="relative">
//                               <input
//                                 value={productName}
//                                 onChange={(e) =>
//                                   !detailsLocked &&
//                                   setProductName(e.target.value)
//                                 }
//                                 readOnly={detailsLocked}
//                                 placeholder={
//                                   mode === 'create' && customListing
//                                     ? 'e.g., Samsung Galaxy S23'
//                                     : undefined
//                                 }
//                                 className={`w-full rounded-xl border px-3 text-base ${
//                                   mode === 'create' && customListing
//                                     ? 'py-2.5'
//                                     : 'pt-6 pb-2'
//                                 } ${
//                                   fullTemplate && mode === 'create'
//                                     ? 'bg-white text-black border-gray-200'
//                                     : 'bg-white'
//                                 }`}
//                               />

//                               {/* Label INSIDE - only for non-create or non-customListing mode */}
//                               {!(mode === 'create' && customListing) && (
//                                 <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
//                                   PRODUCT NAME
//                                 </label>
//                               )}
//                             </div>
//                           </div>
//                           {/* <input
//                             value={productName}
//                             onChange={(e) => setProductName(e.target.value)}
//                             readOnly={detailsLocked}
//                             placeholder={
//                               mode === 'create' && customListing
//                                 ? 'e.g., Samsung Galaxy S23'
//                                 : undefined
//                             }
//                             className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
//                               fullTemplate && mode === 'create'
//                                 ? 'bg-gray-50 text-gray-800'
//                                 : 'bg-white'
//                             }`}
//                           /> */}
//                           {/* </div> */}
//                           {/* <div>
//                           <label className="text-xs text-gray-500">Brand</label>
//                           <input
//                             value={brand}
//                             onChange={(e) => setBrand(e.target.value)}
//                             readOnly={detailsLocked}
//                             placeholder={
//                               mode === 'create' && customListing
//                                 ? 'e.g., Samsung'
//                                 : undefined
//                             }
//                             className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
//                               fullTemplate && mode === 'create'
//                                 ? 'bg-gray-50'
//                                 : ''
//                             }`}
//                           />
//                         </div> */}
//                           {/* <div>
//                           <div className="relative">
//                             <input
//                               value={brand}
//                               onChange={(e) => setBrand(e.target.value)}
//                               readOnly={detailsLocked}
//                               placeholder={
//                                 mode === 'create' && customListing
//                                   ? 'e.g., Samsung'
//                                   : undefined
//                               }
//                               className={`w-full rounded-xl border px-3 pt-6 pb-2 text-sm ${
//                                 fullTemplate && mode === 'create'
//                                   ? 'bg-white text-black border-gray-200'
//                                   : 'bg-white'
//                               }`}
//                             />
//                             <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none">
//                               BRAND
//                             </label>
//                           </div>
//                         </div> */}

//                           <div>
//                             {/* Label OUTSIDE (above) - only for create mode with customListing */}
//                             {mode === 'create' && customListing && (
//                               <label className="block text-xs text-gray-500 mb-1">
//                                 Brand
//                               </label>
//                             )}

//                             <div className="relative">
//                               <input
//                                 value={brand}
//                                 onChange={(e) =>
//                                   !detailsLocked && setBrand(e.target.value)
//                                 }
//                                 readOnly={detailsLocked}
//                                 placeholder={
//                                   mode === 'create' && customListing
//                                     ? 'e.g., Samsung'
//                                     : undefined
//                                 }
//                                 className={`w-full rounded-xl border px-3 text-base ${
//                                   mode === 'create' && customListing
//                                     ? 'py-2.5'
//                                     : 'pt-6 pb-2'
//                                 } ${
//                                   fullTemplate && mode === 'create'
//                                     ? 'bg-white text-black border-gray-200'
//                                     : 'bg-white'
//                                 }`}
//                               />

//                               {/* Label INSIDE - only for non-create or non-customListing mode */}
//                               {!(mode === 'create' && customListing) && (
//                                 <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
//                                   BRAND
//                                 </label>
//                               )}
//                             </div>
//                           </div>
//                           {/* <div>
//                           <label className="text-xs text-gray-500">
//                             Condition
//                             {mode === 'create' && customListing ? (
//                               <span className="text-red-500"> *</span>
//                             ) : null}
//                           </label>
//                           <select
//                             value={normalizeConditionForListingType(
//                               condition,
//                               listingType === 'sell' ? 'Sell' : 'Rental',
//                               listingType === 'rent' && !detailsLocked,
//                             )}
//                             onChange={(e) => setCondition(e.target.value)}
//                             disabled={detailsLocked}
//                             className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
//                               fullTemplate && mode === 'create'
//                                 ? 'bg-gray-50'
//                                 : ''
//                             }`}
//                           >
//                             {conditionSelectOptions.map((opt) => (
//                               <option key={opt} value={opt}>
//                                 {opt}
//                               </option>
//                             ))}
//                           </select>
//                         </div> */}
//                           <div>
//                             {/* Label OUTSIDE (above) - only for create mode with customListing */}
//                             {mode === 'create' && customListing && (
//                               <label className="block text-xs text-gray-500 mb-1">
//                                 Condition
//                                 <span className="text-red-500"> *</span>
//                               </label>
//                             )}

//                             <div className="relative">
//                               <select
//                                 value={normalizeConditionForListingType(
//                                   condition,
//                                   listingType === 'sell' ? 'Sell' : 'Rental',
//                                   listingType === 'rent' && !detailsLocked,
//                                 )}
//                                 onChange={(e) =>
//                                   !detailsLocked && setCondition(e.target.value)
//                                 }
//                                 disabled={detailsLocked}
//                                 className={`w-full rounded-xl border px-3 text-base ${
//                                   mode === 'create' && customListing
//                                     ? 'py-2.5'
//                                     : 'pt-6 pb-2'
//                                 } ${
//                                   fullTemplate && mode === 'create'
//                                     ? 'bg-white text-black border-gray-200'
//                                     : 'bg-white'
//                                 }`}
//                               >
//                                 {conditionSelectOptions.map((opt) => (
//                                   <option key={opt} value={opt}>
//                                     {opt}
//                                   </option>
//                                 ))}
//                               </select>

//                               {/* Label INSIDE - only for non-create or non-customListing mode */}
//                               {!(mode === 'create' && customListing) && (
//                                 <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
//                                   CONDITION
//                                 </label>
//                               )}
//                             </div>
//                           </div>
//                           {/* <div className="sm:col-span-2">
//                     <label className="text-xs text-gray-500">
//                       Short description
//                     </label>
//                     <input
//                       value={shortDescription}
//                       onChange={(e) => setShortDescription(e.target.value)}
//                       readOnly={detailsLocked}
//                       className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
//                         fullTemplate && mode === 'create' ? 'bg-gray-50' : ''
//                       }`}
//                     />
//                   </div> */}
//                           {/* <div className="sm:col-span-2">
//                           <label className="text-xs text-gray-500">
//                             Description
//                             {mode === 'create' && customListing ? (
//                               <span className="text-red-500"> *</span>
//                             ) : null}
//                           </label>
//                           <textarea
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             readOnly={detailsLocked}
//                             rows={3}
//                             placeholder={
//                               mode === 'create' && customListing
//                                 ? 'Provide detailed description including key features, condition, etc.'
//                                 : undefined
//                             }
//                             className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
//                               fullTemplate && mode === 'create'
//                                 ? 'bg-gray-50'
//                                 : ''
//                             }`}
//                           />
//                         </div> */}
//                           <div className="sm:col-span-2">
//                             {/* Label OUTSIDE (above) - only for create mode with customListing */}
//                             {mode === 'create' && customListing && (
//                               <label className="block text-xs text-gray-500 mb-1">
//                                 Description
//                                 <span className="text-red-500"> *</span>
//                               </label>
//                             )}

//                             <div className="relative">
//                               <textarea
//                                 value={description}
//                                 onChange={(e) =>
//                                   !detailsLocked &&
//                                   setDescription(e.target.value)
//                                 }
//                                 readOnly={detailsLocked}
//                                 rows={3}
//                                 placeholder={
//                                   mode === 'create' && customListing
//                                     ? 'Provide detailed description including key features, condition, etc.'
//                                     : undefined
//                                 }
//                                 className={`w-full rounded-xl border px-3 text-base ${
//                                   mode === 'create' && customListing
//                                     ? 'py-2.5'
//                                     : 'pt-6 pb-2'
//                                 } ${
//                                   fullTemplate && mode === 'create'
//                                     ? 'bg-white text-black border-gray-200'
//                                     : 'bg-white'
//                                 }`}
//                               />

//                               {/* Label INSIDE - only for non-create or non-customListing mode */}
//                               {!(mode === 'create' && customListing) && (
//                                 <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
//                                   DESCRIPTION
//                                 </label>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         {detailsLocked ? (
//                           specEntries.length > 0 ? (
//                             // <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                             //   {specEntries.map(([k, v]) => (
//                             //     <div key={k}>
//                             //       <label className="text-xs text-gray-500 capitalize">
//                             //         {k}
//                             //       </label>
//                             //       <input
//                             //         value={String(v)}
//                             //         readOnly
//                             //         className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm"
//                             //       />
//                             //     </div>
//                             //   ))}
//                             // </div>
//                             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                               {specEntries.map(([k, v]) => (
//                                 <div key={k}>
//                                   <div className="relative">
//                                     <input
//                                       value={String(v)}
//                                       readOnly
//                                       className="w-full rounded-xl border bg-white px-3 pt-6 pb-2 text-base"
//                                     />
//                                     <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
//                                       {k}
//                                     </label>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : null
//                         ) : (mode === 'create' && customListing) ||
//                           (mode === 'edit' && !isTemplateBased) ? null : (
//                           <div className="mt-4 space-y-3">
//                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                               <p className="text-xs font-medium text-gray-800">
//                                 Product specifications
//                               </p>
//                               <button
//                                 type="button"
//                                 onClick={addSpecRow}
//                                 className="shrink-0 self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700"
//                               >
//                                 + Add specification
//                               </button>
//                             </div>
//                             <div className="space-y-2">
//                               {specRowList.map((row, idx) => (
//                                 <div
//                                   key={idx}
//                                   className="flex flex-wrap gap-2 items-end rounded-xl border border-gray-100 bg-white p-3"
//                                 >
//                                   <div className="flex-1 min-w-[140px]">
//                                     <label className="text-xs text-gray-500">
//                                       Label
//                                     </label>
//                                     <input
//                                       value={row.label}
//                                       onChange={(e) =>
//                                         updateSpecRow(
//                                           idx,
//                                           'label',
//                                           e.target.value,
//                                         )
//                                       }
//                                       placeholder="e.g. Weight"
//                                       className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                                     />
//                                   </div>
//                                   <div className="flex-1 min-w-[140px]">
//                                     <label className="text-xs text-gray-500">
//                                       Value
//                                     </label>
//                                     <input
//                                       value={row.value}
//                                       onChange={(e) =>
//                                         updateSpecRow(
//                                           idx,
//                                           'value',
//                                           e.target.value,
//                                         )
//                                       }
//                                       placeholder="e.g. 200g"
//                                       className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                                     />
//                                   </div>
//                                   {specRowList.length > 1 ? (
//                                     <button
//                                       type="button"
//                                       onClick={() => removeSpecRow(idx)}
//                                       className="text-xs text-red-600 hover:underline pb-1"
//                                     >
//                                       Remove
//                                     </button>
//                                   ) : null}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </SectionCard>
//                     </div>
//                     {/* {mode === 'create' && customListing ? (
//                       <div className="space-y-4 border-t border-gray-200 pt-6"> */}
//                     {(mode === 'create' && customListing) ||
//                     (mode === 'edit' && !isTemplateBased) ? (
//                       <div className="space-y-4 border-t border-gray-200 pt-6">
//                         <SectionCard
//                           title="Product Variants"
//                           subtitle="Add Multiple Product variants"
//                           icon={Tag}
//                           headerIconBoxed
//                           // headerRight={
//                           //   mode === 'create' ? (
//                           //     <button
//                           //       type="button"
//                           //       onClick={() => {
//                           //         const nv = newManualVariant();
//                           //         setManualVariants((prev) => [...prev, nv]);
//                           //         setExpandedVariantId(nv.id);
//                           //       }}
//                           //       className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
//                           //     >
//                           //       + Add Variant
//                           //     </button>
//                           //   ) : null
//                           // }

//                           headerRight={
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 const nv = newManualVariant();
//                                 setManualVariants((prev) => [...prev, nv]);
//                                 if (mode === 'edit' && !isTemplateBased) {
//                                   setSelectedManualVariantId(nv.id);
//                                   setExpandedVariantId(null);
//                                 } else {
//                                   setExpandedVariantId(nv.id);
//                                 }
//                               }}
//                               className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
//                             >
//                               + Add Variant
//                             </button>
//                           }
//                         >
//                           {manualVariants.length === 0 ? (
//                             <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
//                               No variants yet. Click{' '}
//                               <span className="font-semibold text-gray-700">
//                                 + Add Variant
//                               </span>{' '}
//                               to create your first SKU.
//                             </div>
//                           ) : (
//                             <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white overflow-hidden">
//                               {manualVariants.map((mv) => {
//                                 const vis = variantPrimaryVisual(mv);
//                                 const thumbCls =
//                                   'h-14 w-14 rounded-lg object-cover border border-gray-100 shrink-0';
//                                 const active = expandedVariantId === mv.id;

//                                 return (
//                                   // <li
//                                   //   key={mv.id}
//                                   //   className={`flex items-center gap-3 px-3 py-3 bg-white cursor-pointer transition ${
//                                   //     active
//                                   //       ? 'bg-violet-50/60'
//                                   //       : 'hover:bg-gray-50/80'
//                                   //   }`}
//                                   //   role="button"
//                                   //   tabIndex={0}
//                                   //   onClick={() => setExpandedVariantId(mv.id)}
//                                   //   onKeyDown={(e) => {
//                                   //     if (e.key === 'Enter' || e.key === ' ') {
//                                   //       e.preventDefault();
//                                   //       setExpandedVariantId(mv.id);
//                                   //     }
//                                   //   }}
//                                   // >
//                                   <li
//                                     key={mv.id}
//                                     className={`flex items-center gap-3 px-3 py-3 bg-white cursor-pointer transition ${
//                                       active
//                                         ? 'bg-violet-50/60'
//                                         : 'hover:bg-gray-50/80'
//                                     }`}
//                                     role="button"
//                                     tabIndex={0}
//                                     onClick={() => {
//                                       if (mode === 'edit' && !isTemplateBased) {
//                                         setSelectedManualVariantId(mv.id);
//                                         setExpandedVariantId(null);
//                                       } else {
//                                         setExpandedVariantId(mv.id);
//                                       }
//                                     }}
//                                     onKeyDown={(e) => {
//                                       if (e.key === 'Enter' || e.key === ' ') {
//                                         e.preventDefault();
//                                         if (
//                                           mode === 'edit' &&
//                                           !isTemplateBased
//                                         ) {
//                                           setSelectedManualVariantId(mv.id);
//                                           setExpandedVariantId(null);
//                                         } else {
//                                           setExpandedVariantId(mv.id);
//                                         }
//                                       }
//                                     }}
//                                   >
//                                     {vis.kind === 'url' ? (
//                                       <img
//                                         src={vis.url}
//                                         alt=""
//                                         className={thumbCls}
//                                       />
//                                     ) : vis.kind === 'file' ? (
//                                       <VariantLocalImagePreview
//                                         file={vis.file}
//                                         className={thumbCls}
//                                       />
//                                     ) : (
//                                       <img
//                                         src={PLACEHOLDER_IMG}
//                                         alt=""
//                                         className={thumbCls}
//                                       />
//                                     )}
//                                     <div className="flex-1 min-w-0 flex items-center justify-between gap-2 sm:gap-4">
//                                       <div className="min-w-0 flex-1 text-left">
//                                         <p className="truncate text-sm font-semibold text-gray-900">
//                                           {mv.variantName?.trim() ||
//                                             'Untitled variant'}
//                                         </p>
//                                         <p className="mt-0.5 truncate text-sm text-gray-500">
//                                           {listingType === 'sell'
//                                             ? String(mv.sellPrice || '').trim()
//                                               ? `₹${mv.sellPrice}`
//                                               : '—'
//                                             : (formatFirstTierRentLabel(
//                                                 mv.rentalTiers,
//                                                 mv.rentalPricingModel,
//                                               ) ?? '—')}
//                                         </p>
//                                       </div>
//                                       <div className="flex items-center gap-3 sm:gap-8 shrink-0">
//                                         <span className="text-sm text-gray-700 hidden sm:inline-block min-w-[4.5rem] text-right truncate">
//                                           {categoryName || '—'}
//                                         </span>
//                                         <span className="text-sm text-gray-700 hidden sm:inline-block min-w-[4rem] text-right truncate">
//                                           {subCategoryName || '—'}
//                                         </span>
//                                         <span className="text-xs text-gray-600 sm:hidden max-w-[4rem] truncate text-right">
//                                           {[categoryName, subCategoryName]
//                                             .filter(Boolean)
//                                             .join(' · ') || '—'}
//                                         </span>
//                                         {manualVariants.length > 1 ? (
//                                           <button
//                                             type="button"
//                                             aria-label="Delete variant"
//                                             title="Delete variant"
//                                             onClick={(e) => {
//                                               e.stopPropagation();
//                                               setManualVariants((prev) =>
//                                                 prev.filter(
//                                                   (x) => x.id !== mv.id,
//                                                 ),
//                                               );
//                                               setExpandedVariantId((cur) =>
//                                                 cur === mv.id ? null : cur,
//                                               );
//                                             }}
//                                             className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
//                                           >
//                                             <Trash2 className="h-4 w-4" />
//                                           </button>
//                                         ) : (
//                                           <span
//                                             className="inline-flex h-9 w-9 shrink-0"
//                                             aria-hidden
//                                           />
//                                         )}
//                                       </div>
//                                     </div>
//                                   </li>
//                                 );
//                               })}
//                             </ul>
//                           )}
//                         </SectionCard>

//                         {expandedVariant ? (
//                           <SectionCard hideHeader title={null} icon={null}>
//                             <div className="space-y-5">
//                               <div className="rounded-xl border border-gray-200 bg-white p-4">
//                                 <label className="text-sm font-medium text-gray-900">
//                                   Variant Name{' '}
//                                   <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                   value={expandedVariant.variantName}
//                                   onChange={(e) => {
//                                     const val = e.target.value;
//                                     const id = expandedVariant.id;
//                                     setManualVariants((prev) =>
//                                       prev.map((x) =>
//                                         x.id === id
//                                           ? { ...x, variantName: val }
//                                           : x,
//                                       ),
//                                     );
//                                   }}
//                                   className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
//                                   placeholder="eg . 5 Seater sofa"
//                                 />
//                               </div>
//                               {/* <div>
//                             <label className="text-xs text-gray-500">
//                               Variant stock (optional)
//                             </label>
//                             <input
//                               type="number"
//                               min={0}
//                               value={expandedVariant.stock}
//                               onChange={(e) => {
//                                 const val = e.target.value;
//                                 const id = expandedVariant.id;
//                                 setManualVariants((prev) =>
//                                   prev.map((x) =>
//                                     x.id === id ? { ...x, stock: val } : x,
//                                   ),
//                                 );
//                               }}
//                               className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//                               placeholder="e.g. units for this SKU"
//                             />
//                             <p className="text-xs text-gray-500 mt-1">
//                               Separate from{' '}
//                               <span className="font-medium">
//                                 Logistics → Inventory count
//                               </span>{' '}
//                               (overall listing quantity).
//                             </p>
//                           </div> */}

//                               <div className="rounded-xl border border-gray-200 bg-white p-5">
//                                 <div className="flex items-start gap-3">
//                                   {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl  text-violet-600">
//                                   <Box
//                                     className="h-5 w-5"
//                                     strokeWidth={2}
//                                     aria-hidden
//                                   />
//                                 </div> */}
//                                   <div className="min-w-0 flex-1">
//                                     {/* <p className="text-base flex font-semibold text-gray-900">
//                                     <Box
//                                       className="h-5 w-5 text-violet-600 "
//                                       strokeWidth={2}
//                                       aria-hidden
//                                     />
//                                     Product Media
//                                   </p> */}
//                                     <p className="text-base flex items-center gap-2 font-semibold text-gray-900">
//                                       <Box
//                                         className="h-5 w-5 text-violet-600"
//                                         strokeWidth={2}
//                                         aria-hidden
//                                       />
//                                       Product Media
//                                     </p>
//                                     <p className="mt-1 text-xs leading-relaxed text-gray-500">
//                                       Upload up to 10 high-quality Media . First
//                                       image will be the cover photo.
//                                     </p>
//                                   </div>
//                                 </div>

//                                 {(expandedVariant.existingImages || []).length +
//                                   (expandedVariant.newImages || []).length >
//                                 0 ? (
//                                   <div className="mt-4 flex flex-wrap gap-3">
//                                     {(expandedVariant.existingImages || []).map(
//                                       (url, i) => (
//                                         <div
//                                           key={`${url}-${i}`}
//                                           className="relative"
//                                         >
//                                           <img
//                                             src={url}
//                                             alt=""
//                                             className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
//                                           />
//                                           <button
//                                             type="button"
//                                             onClick={() => {
//                                               const id = expandedVariant.id;
//                                               setManualVariants((prev) =>
//                                                 prev.map((x) =>
//                                                   x.id === id
//                                                     ? {
//                                                         ...x,
//                                                         existingImages:
//                                                           x.existingImages.filter(
//                                                             (_, j) => j !== i,
//                                                           ),
//                                                       }
//                                                     : x,
//                                                 ),
//                                               );
//                                             }}
//                                             className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
//                                           >
//                                             <X className="h-3 w-3" />
//                                           </button>
//                                         </div>
//                                       ),
//                                     )}
//                                     {(expandedVariant.newImages || []).map(
//                                       (file, i) => (
//                                         <div
//                                           key={`${file.name}-${file.size}-${i}`}
//                                           className="relative"
//                                         >
//                                           <VariantLocalImagePreview
//                                             file={file}
//                                             className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
//                                           />
//                                           <button
//                                             type="button"
//                                             onClick={() => {
//                                               const id = expandedVariant.id;
//                                               setManualVariants((prev) =>
//                                                 prev.map((x) =>
//                                                   x.id === id
//                                                     ? {
//                                                         ...x,
//                                                         newImages:
//                                                           x.newImages.filter(
//                                                             (_, j) => j !== i,
//                                                           ),
//                                                       }
//                                                     : x,
//                                                 ),
//                                               );
//                                             }}
//                                             className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
//                                           >
//                                             <X className="h-3 w-3" />
//                                           </button>
//                                         </div>
//                                       ),
//                                     )}
//                                   </div>
//                                 ) : null}

//                                 <div
//                                   className="mt-4"
//                                   onDragOver={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                   }}
//                                   onDrop={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                     const id = expandedVariant.id;
//                                     const files = Array.from(
//                                       e.dataTransfer.files || [],
//                                     ).filter((f) =>
//                                       String(f.type || '').startsWith('image/'),
//                                     );
//                                     const used =
//                                       (expandedVariant.existingImages?.length ||
//                                         0) +
//                                       (expandedVariant.newImages?.length || 0);
//                                     const next = files.slice(
//                                       0,
//                                       Math.max(0, 10 - used),
//                                     );
//                                     if (!next.length) return;
//                                     setManualVariants((prev) =>
//                                       prev.map((x) =>
//                                         x.id === id
//                                           ? {
//                                               ...x,
//                                               newImages: [
//                                                 ...(x.newImages || []),
//                                                 ...next,
//                                               ],
//                                             }
//                                           : x,
//                                       ),
//                                     );
//                                   }}
//                                 >
//                                   <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 transition hover:border-violet-300 hover:bg-violet-50/30">
//                                     <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm">
//                                       <Upload
//                                         className="h-7 w-7"
//                                         strokeWidth={2}
//                                         aria-hidden
//                                       />
//                                     </span>
//                                     <span className="mt-3 text-sm font-medium text-gray-700">
//                                       Click to upload or drag and drop
//                                     </span>
//                                     <span className="mt-1 text-xs text-gray-500">
//                                       {(expandedVariant.existingImages
//                                         ?.length || 0) +
//                                         (expandedVariant.newImages?.length ||
//                                           0)}
//                                       /10 uploaded
//                                     </span>
//                                     <input
//                                       type="file"
//                                       accept="image/*"
//                                       multiple
//                                       className="sr-only"
//                                       onChange={(e) => {
//                                         const id = expandedVariant.id;
//                                         const files = Array.from(
//                                           e.target.files || [],
//                                         ).slice(
//                                           0,
//                                           Math.max(
//                                             0,
//                                             10 -
//                                               (expandedVariant.existingImages
//                                                 ?.length || 0) -
//                                               (expandedVariant.newImages
//                                                 ?.length || 0),
//                                           ),
//                                         );
//                                         setManualVariants((prev) =>
//                                           prev.map((x) =>
//                                             x.id === id
//                                               ? {
//                                                   ...x,
//                                                   newImages: [
//                                                     ...(x.newImages || []),
//                                                     ...files,
//                                                   ],
//                                                 }
//                                               : x,
//                                           ),
//                                         );
//                                         e.target.value = '';
//                                       }}
//                                     />
//                                   </label>
//                                 </div>
//                               </div>

//                               <div className="rounded-xl border border-gray-200 bg-white p-5">
//                                 {/* <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                                 <div className="flex min-w-0 items-start gap-3">
//                                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
//                                     <Box
//                                       className="h-5 w-5"
//                                       strokeWidth={2}
//                                       aria-hidden
//                                     />
//                                   </div>
//                                   <div className="min-w-0">
//                                     <p className="text-base font-semibold text-gray-900">
//                                       Product Specifications
//                                     </p>
//                                     <p className="text-base flex items-center gap-2 font-semibold text-gray-900">
//                                       <Box
//                                         className="h-5 w-5 text-violet-600"
//                                         strokeWidth={2}
//                                         aria-hidden
//                                       />
//                                       Product Specifications
//                                     </p>
//                                     <p className="mt-1 text-xs leading-relaxed text-gray-500">
//                                       Add custom attributes for this variant
//                                       (material, dimensions, color, etc.).
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     const id = expandedVariant.id;
//                                     setManualVariants((prev) =>
//                                       prev.map((x) =>
//                                         x.id === id
//                                           ? {
//                                               ...x,
//                                               specRows: [
//                                                 ...(x.specRows || []),
//                                                 emptyVariantSpecRow(),
//                                               ],
//                                             }
//                                           : x,
//                                       ),
//                                     );
//                                   }}
//                                   className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
//                                 >
//                                   <Plus
//                                     className="h-3.5 w-3.5"
//                                     strokeWidth={2}
//                                   />
//                                   Add Custom Specification
//                                 </button>
//                               </div> */}
//                                 <div className="mb-4">
//                                   {/* Top header */}
//                                   <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                                     <div className="flex min-w-0 items-start gap-3">
//                                       <div className="min-w-0">
//                                         <p className="text-base flex items-center gap-2 font-semibold text-gray-900">
//                                           <Box
//                                             className="h-5 w-5 text-violet-600"
//                                             strokeWidth={2}
//                                             aria-hidden
//                                           />
//                                           Product Specifications
//                                         </p>

//                                         <p className="mt-1 text-xs leading-relaxed text-gray-500">
//                                           Add custom attributes for this variant
//                                           (material, dimensions, color, etc.).
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   {/* NEW ROW (like figma) */}
//                                   <div className="mt-4 flex items-center justify-between">
//                                     <p className="text-sm font-semibold text-gray-700">
//                                       Custom Specifications
//                                     </p>

//                                     <button
//                                       type="button"
//                                       onClick={() => {
//                                         const id = expandedVariant.id;
//                                         setManualVariants((prev) =>
//                                           prev.map((x) =>
//                                             x.id === id
//                                               ? {
//                                                   ...x,
//                                                   specRows: [
//                                                     ...(x.specRows || []),
//                                                     emptyVariantSpecRow(),
//                                                   ],
//                                                 }
//                                               : x,
//                                           ),
//                                         );
//                                       }}
//                                       className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
//                                     >
//                                       <Plus
//                                         className="h-3.5 w-3.5"
//                                         strokeWidth={2}
//                                       />
//                                       Add Custom Specification
//                                     </button>
//                                   </div>
//                                 </div>
//                                 <div className="space-y-3">
//                                   {(expandedVariant.specRows || []).map(
//                                     (row, idx) => (
//                                       <div
//                                         key={idx}
//                                         className="flex flex-wrap items-end gap-3 rounded-xl border border-violet-200 bg-violet-50/50 p-3 sm:flex-nowrap"
//                                       >
//                                         <div className="min-w-0 flex-1 sm:min-w-[160px]">
//                                           <label className="text-xs text-gray-500">
//                                             Label
//                                           </label>
//                                           <input
//                                             value={row.label}
//                                             onChange={(e) => {
//                                               const id = expandedVariant.id;
//                                               const v = e.target.value;
//                                               setManualVariants((prev) =>
//                                                 prev.map((x) =>
//                                                   x.id === id
//                                                     ? {
//                                                         ...x,
//                                                         specRows:
//                                                           x.specRows.map(
//                                                             (r, j) =>
//                                                               j === idx
//                                                                 ? {
//                                                                     ...r,
//                                                                     label: v,
//                                                                   }
//                                                                 : r,
//                                                           ),
//                                                       }
//                                                     : x,
//                                                 ),
//                                               );
//                                             }}
//                                             placeholder="e.g., Fabric Material"
//                                             className="mt-1.5 w-full rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-violet-400/70 focus:border-violet-500 focus:bg-white focus:ring-1 focus:ring-violet-200"
//                                           />
//                                         </div>
//                                         <div className="min-w-0 flex-1 sm:min-w-[160px]">
//                                           <label className="text-xs text-gray-500">
//                                             Value
//                                           </label>
//                                           <input
//                                             value={row.value}
//                                             onChange={(e) => {
//                                               const id = expandedVariant.id;
//                                               const v = e.target.value;
//                                               setManualVariants((prev) =>
//                                                 prev.map((x) =>
//                                                   x.id === id
//                                                     ? {
//                                                         ...x,
//                                                         specRows:
//                                                           x.specRows.map(
//                                                             (r, j) =>
//                                                               j === idx
//                                                                 ? {
//                                                                     ...r,
//                                                                     value: v,
//                                                                   }
//                                                                 : r,
//                                                           ),
//                                                       }
//                                                     : x,
//                                                 ),
//                                               );
//                                             }}
//                                             placeholder="e.g., Velvet"
//                                             className="mt-1.5 w-full rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-violet-400/70 focus:border-violet-500 focus:bg-white focus:ring-1 focus:ring-violet-200"
//                                           />
//                                         </div>
//                                         {(expandedVariant.specRows || [])
//                                           .length > 1 ? (
//                                           <button
//                                             type="button"
//                                             title="Remove row"
//                                             onClick={() => {
//                                               const id = expandedVariant.id;
//                                               setManualVariants((prev) =>
//                                                 prev.map((x) =>
//                                                   x.id === id
//                                                     ? {
//                                                         ...x,
//                                                         specRows: (() => {
//                                                           const next = (
//                                                             x.specRows || []
//                                                           ).filter(
//                                                             (_, j) => j !== idx,
//                                                           );
//                                                           return next.length
//                                                             ? next
//                                                             : [
//                                                                 emptyVariantSpecRow(),
//                                                               ];
//                                                         })(),
//                                                       }
//                                                     : x,
//                                                 ),
//                                               );
//                                             }}
//                                             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-100 text-rose-600 transition hover:bg-rose-200"
//                                           >
//                                             <X
//                                               className="h-4 w-4"
//                                               strokeWidth={2}
//                                             />
//                                           </button>
//                                         ) : null}
//                                       </div>
//                                     ),
//                                   )}
//                                 </div>
//                               </div>
//                               {/*
//                             <p className="text-xs text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
//                               Rental / sell pricing, rental terms, and
//                               refundable deposit below apply to this whole
//                               listing (all variants).
//                             </p> */}
//                               {listingType === 'rent' ? (
//                                 <div className="rounded-xl border border-gray-200 bg-white p-5">
//                                   <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
//                                     <div className="flex items-center gap-2">
//                                       <DollarSign
//                                         className="h-5 w-5 text-emerald-600"
//                                         strokeWidth={2}
//                                         aria-hidden
//                                       />
//                                       <p className="text-base font-semibold text-gray-900">
//                                         Rental Configuration
//                                       </p>
//                                     </div>
//                                     <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
//                                       <button
//                                         type="button"
//                                         onClick={() =>
//                                           switchVariantRentalPricingModel(
//                                             expandedVariant.id,
//                                             'month',
//                                           )
//                                         }
//                                         className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
//                                           (expandedVariant.rentalPricingModel ||
//                                             'day') === 'month'
//                                             ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
//                                             : 'text-gray-500 hover:text-gray-800'
//                                         }`}
//                                       >
//                                         <Calendar className="h-3.5 w-3.5" />
//                                         Month-wise
//                                       </button>
//                                       <button
//                                         type="button"
//                                         onClick={() =>
//                                           switchVariantRentalPricingModel(
//                                             expandedVariant.id,
//                                             'day',
//                                           )
//                                         }
//                                         className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
//                                           (expandedVariant.rentalPricingModel ||
//                                             'day') === 'day'
//                                             ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
//                                             : 'text-gray-500 hover:text-gray-800'
//                                         }`}
//                                       >
//                                         <Clock className="h-3.5 w-3.5" />
//                                         Day-wise
//                                       </button>
//                                     </div>
//                                   </div>
//                                   <p className="text-xs text-gray-500 mb-3">
//                                     Set competitive rental prices for different
//                                     tenure options.
//                                   </p>
//                                   {!String(categoryName || '').trim() ||
//                                   !String(subCategoryName || '').trim() ? (
//                                     <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
//                                       Select category and sub-category above to
//                                       load market-low benchmarks for each term.
//                                     </p>
//                                   ) : null}
//                                   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
//                                     {(expandedVariant.rentalTiers || []).map(
//                                       (tier, i) => {
//                                         const model =
//                                           expandedVariant.rentalPricingModel ||
//                                           'day';
//                                         const isDayModel = model === 'day';
//                                         const tenureLen = isDayModel
//                                           ? toNum(tier.days, 0)
//                                           : toNum(tier.months, 0);
//                                         const lowMap = isDayModel
//                                           ? marketLowTenures.day
//                                           : marketLowTenures.month;
//                                         const perUnit =
//                                           tenureLen > 0
//                                             ? (lowMap?.[tenureLen] ??
//                                               lowMap?.[String(tenureLen)])
//                                             : undefined;
//                                         const hasLow =
//                                           perUnit != null &&
//                                           Number.isFinite(Number(perUnit)) &&
//                                           Number(perUnit) > 0;
//                                         const marketLine = marketLowLoading
//                                           ? 'Loading…'
//                                           : hasLow
//                                             ? isDayModel
//                                               ? `₹${formatInrCompact(Number(perUnit))}/day`
//                                               : `₹${formatInrCompact(Number(perUnit))}/mo`
//                                             : '—';
//                                         const onMatchLowest = () => {
//                                           if (!hasLow || tenureLen <= 0) return;
//                                           const total = Math.round(
//                                             Number(perUnit) * tenureLen,
//                                           );
//                                           updateVariantRentalTier(
//                                             expandedVariant.id,
//                                             i,
//                                             'monthlyRent',
//                                             String(total),
//                                           );
//                                         };
//                                         return (
//                                           <div
//                                             key={i}
//                                             className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm space-y-2.5"
//                                           >
//                                             {tier.bestValue ? (
//                                               <span className="absolute top-2 right-2 rounded-full bg-orange-500 text-[9px] font-bold text-white px-2 py-0.5">
//                                                 POPULAR
//                                               </span>
//                                             ) : null}
//                                             <div className="pr-14">
//                                               <p className="text-sm font-semibold text-gray-900">
//                                                 {String(
//                                                   tier.label || '',
//                                                 ).trim() ||
//                                                   (isDayModel
//                                                     ? `${tier.days ?? 0} Days`
//                                                     : `${tier.months ?? 0} Months`)}
//                                               </p>
//                                             </div>
//                                             <div className="rounded-lg border border-gray-300 px-2.5 py-2">
//                                               <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
//                                                 <TrendingDown
//                                                   className="h-3.5 w-3.5 shrink-0 text-emerald-700"
//                                                   strokeWidth={2.5}
//                                                 />
//                                                 Market low
//                                               </div>
//                                               <p className="text-sm font-semibold text-emerald-700 tabular-nums mt-0.5">
//                                                 {marketLine}
//                                               </p>
//                                             </div>
//                                             <div>
//                                               <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
//                                                 Your price
//                                               </label>
//                                               <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20">
//                                                 <span className="flex items-center px-2.5 text-blue-500 text-sm bg-gray-50 border-r border-gray-200">
//                                                   ₹
//                                                 </span>
//                                                 <input
//                                                   type="number"
//                                                   min={0}
//                                                   value={tier.monthlyRent}
//                                                   onChange={(e) =>
//                                                     updateVariantRentalTier(
//                                                       expandedVariant.id,
//                                                       i,
//                                                       'monthlyRent',
//                                                       e.target.value,
//                                                     )
//                                                   }
//                                                   className="w-full min-w-0 py-2 px-2 text-sm outline-none"
//                                                   placeholder="0"
//                                                 />
//                                               </div>
//                                             </div>
//                                             <button
//                                               type="button"
//                                               disabled={!hasLow}
//                                               onClick={onMatchLowest}
//                                               className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                                             >
//                                               <Zap className="h-3.5 w-3.5" />
//                                               Match lowest
//                                             </button>
//                                             {i >= 1 ? (
//                                               <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                   removeVariantRentalTier(
//                                                     expandedVariant.id,
//                                                     i,
//                                                   )
//                                                 }
//                                                 className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
//                                               >
//                                                 <X className="h-3.5 w-3.5" />
//                                                 Remove term
//                                               </button>
//                                             ) : null}
//                                           </div>
//                                         );
//                                       },
//                                     )}
//                                   </div>
//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       addVariantRentalTier(expandedVariant.id)
//                                     }
//                                     className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 sm:w-auto"
//                                   >
//                                     + Add more term
//                                   </button>
//                                 </div>
//                               ) : null}
//                               {listingType === 'sell' ? (
//                                 <div className="rounded-xl border border-gray-200 bg-white p-5">
//                                   <div className="mb-3 flex items-center gap-2">
//                                     <Tag
//                                       className="h-5 w-5 text-violet-600"
//                                       strokeWidth={2}
//                                       aria-hidden
//                                     />
//                                     <p className="text-base font-semibold text-gray-900">
//                                       Sales Configuration
//                                     </p>
//                                   </div>
//                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                                     <div>
//                                       <label className="text-xs text-gray-500">
//                                         Selling Price (₹){' '}
//                                         <span className="text-red-500">*</span>
//                                       </label>
//                                       <input
//                                         type="text"
//                                         inputMode="decimal"
//                                         value={expandedVariant.sellPrice || ''}
//                                         onChange={(e) => {
//                                           const val = e.target.value;
//                                           const id = expandedVariant.id;
//                                           setManualVariants((prev) =>
//                                             prev.map((x) =>
//                                               x.id === id
//                                                 ? { ...x, sellPrice: val }
//                                                 : x,
//                                             ),
//                                           );
//                                         }}
//                                         placeholder="e.g., 54999"
//                                         className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                                       />
//                                     </div>
//                                     <div>
//                                       <label className="text-xs text-gray-500">
//                                         MRP{' '}
//                                         <span className="font-normal text-gray-400">
//                                           (Optional)
//                                         </span>
//                                       </label>
//                                       <input
//                                         type="text"
//                                         inputMode="decimal"
//                                         value={expandedVariant.mrpPrice || ''}
//                                         onChange={(e) => {
//                                           const val = e.target.value;
//                                           const id = expandedVariant.id;
//                                           setManualVariants((prev) =>
//                                             prev.map((x) =>
//                                               x.id === id
//                                                 ? { ...x, mrpPrice: val }
//                                                 : x,
//                                             ),
//                                           );
//                                         }}
//                                         placeholder="e.g., 70000"
//                                         className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                                       />
//                                     </div>
//                                   </div>
//                                 </div>
//                               ) : null}
//                               <button
//                                 type="button"
//                                 onClick={() => setExpandedVariantId(null)}
//                                 className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 sm:w-auto"
//                               >
//                                 Done
//                               </button>
//                             </div>
//                           </SectionCard>
//                         ) : null}
//                       </div>
//                     ) : null}
//                   </div>
//                   {/* {fullTemplate && displayVariants.length > 0 ? ( */}

//                   {(fullTemplate || (mode === 'edit' && isTemplateBased)) &&
//                   displayVariants.length > 0 ? (
//                     <SectionCard
//                       title="Product Variants"
//                       icon={Tag}
//                       headerIconBoxed
//                     >
//                       {/* <p className="text-xs text-gray-500 mb-3">
//                       Add multiple product variants — tap a row to edit specs.
//                       Remove any SKU you do not offer.
//                     </p> */}
//                       <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white overflow-hidden">
//                         {displayVariants.map(({ index, v }) => {
//                           const active = selectedTemplateVariantIndex === index;
//                           // const rentalPreview =
//                           //   listingType === 'rent'
//                           //     ? templateVariantRentalSubtitle(
//                           //         fullTemplate,
//                           //         index,
//                           //         listingType,
//                           //       )
//                           //     : null;
//                           const rentalPreview =
//                             listingType === 'rent'
//                               ? templateVariantRentalSubtitle(
//                                   fullTemplate,
//                                   index,
//                                   listingType,
//                                   categories.find(
//                                     (c) => c.name === categoryName,
//                                   )?.commissionRate,
//                                 )
//                               : null;
//                           // const priceLine =
//                           //   listingType === 'sell'
//                           //     ? (() => {
//                           //         const fromV = String(v.price ?? '').trim();
//                           //         if (fromV) {
//                           //           const n = Number(fromV.replace(/,/g, ''));
//                           //           return Number.isFinite(n)
//                           //             ? `₹${n.toLocaleString('en-IN')}`
//                           //             : `₹${fromV}`;
//                           //         }
//                           //         const fromForm = String(
//                           //           sellPrice ?? '',
//                           //         ).trim();
//                           //         if (fromForm) {
//                           //           const n = Number(
//                           //             fromForm.replace(/,/g, ''),
//                           //           );
//                           //           return Number.isFinite(n)
//                           //             ? `₹${n.toLocaleString('en-IN')}`
//                           //             : `₹${fromForm}`;
//                           //         }
//                           //         return '';
//                           //       })()
//                           //     : rentalPreview || String(v.price || '').trim();
//                           const priceLine =
//                             listingType === 'sell'
//                               ? (() => {
//                                   const vCfg = getTemplateVariantSaleConfig(
//                                     fullTemplate,
//                                     index,
//                                   );
//                                   if (vCfg.sellPrice) {
//                                     const n = Number(vCfg.sellPrice);
//                                     return Number.isFinite(n)
//                                       ? `₹${n.toLocaleString('en-IN')}`
//                                       : `₹${vCfg.sellPrice}`;
//                                   }
//                                   const fromV = String(v.price ?? '').trim();
//                                   if (fromV) {
//                                     const n = Number(fromV.replace(/,/g, ''));
//                                     return Number.isFinite(n)
//                                       ? `₹${n.toLocaleString('en-IN')}`
//                                       : `₹${fromV}`;
//                                   }
//                                   return '';
//                                 })()
//                               : rentalPreview ||
//                                 editModeVariantRentalSubtitle(v) ||
//                                 String(v.price || '').trim();
//                           return (
//                             <li
//                               key={index}
//                               onClick={() =>
//                                 setSelectedTemplateVariantIndex(index)
//                               }
//                               role="button"
//                               tabIndex={0}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'Enter' || e.key === ' ') {
//                                   setSelectedTemplateVariantIndex(index);
//                                 }
//                               }}
//                               className={`flex cursor-pointer items-center gap-3 bg-white px-3 py-3 transition ${
//                                 active
//                                   ? 'bg-violet-50/60'
//                                   : 'hover:bg-gray-50/80'
//                               }`}
//                             >
//                               {/* <img
//                               src={
//                                 v.images?.[0] ||
//                                 existingImages[0] ||
//                                 PLACEHOLDER_IMG
//                               } */}
//                               <img
//                                 src={
//                                   v.images?.[0] ||
//                                   (editModeVariants &&
//                                   Array.isArray(initialData?.images)
//                                     ? initialData.images[index] ||
//                                       initialData.images[0]
//                                     : null) ||
//                                   existingImages[0] ||
//                                   PLACEHOLDER_IMG
//                                 }
//                                 alt=""
//                                 className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover"
//                               />
//                               <div className="min-w-0 flex-1 text-left">
//                                 <p className="truncate text-sm font-semibold text-gray-900">
//                                   {v.variantName || 'Variant'}
//                                 </p>
//                                 <p className="mt-0.5 text-sm text-gray-500">
//                                   {priceLine || '—'}
//                                 </p>
//                               </div>
//                               <div className="flex shrink-0 items-center gap-3 sm:gap-8">
//                                 <span className="hidden min-w-[4.5rem] text-right text-sm text-gray-700 sm:inline-block truncate">
//                                   {categoryName || '—'}
//                                 </span>
//                                 <span className="hidden min-w-[4rem] text-right text-sm text-gray-700 sm:inline-block truncate">
//                                   {subCategoryName || '—'}
//                                 </span>
//                                 <span className="max-w-[4rem] truncate text-right text-xs text-gray-600 sm:hidden">
//                                   {[categoryName, subCategoryName]
//                                     .filter(Boolean)
//                                     .join(' · ') || '—'}
//                                 </span>
//                                 {!detailsLocked ? (
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       removeVariantIndex(index);
//                                     }}
//                                     className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
//                                     aria-label="Remove variant"
//                                   >
//                                     <X className="h-5 w-5" />
//                                   </button>
//                                 ) : (
//                                   <span
//                                     className="inline-flex h-9 w-9 shrink-0"
//                                     aria-hidden
//                                   />
//                                 )}
//                               </div>
//                             </li>
//                           );
//                         })}
//                       </ul>
//                     </SectionCard>
//                   ) : null}
//                   {listingType !== 'sell' && !showPerVariantRentalConfig ? (
//                     <SectionCard
//                       title="Pricing model"
//                       icon={null}
//                       showLock={rentalFieldsLocked}
//                     >
//                       {!rentalFieldsLocked ? (
//                         <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
//                           <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
//                             {/* <button
//                               type="button"
//                               onClick={() => setRentalPricingModel('month')}
//                               className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
//                                 rentalPricingModel === 'month'
//                                   ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
//                                   : 'text-gray-500 hover:text-gray-800'
//                               }`}
//                             >
//                               <Calendar className="h-3.5 w-3.5" />
//                               Month-wise
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setRentalPricingModel('day')}
//                               className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
//                                 rentalPricingModel === 'day'
//                                   ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
//                                   : 'text-gray-500 hover:text-gray-800'
//                               }`}
//                             >
//                               <Clock className="h-3.5 w-3.5" />
//                               Day-wise
//                             </button> */}
//                             <button
//                               type="button"
//                               onClick={() => switchRentalPricingModel('month')}
//                               className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
//                                 rentalPricingModel === 'month'
//                                   ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
//                                   : 'text-gray-500 hover:text-gray-800'
//                               }`}
//                             >
//                               <Calendar className="h-3.5 w-3.5" />
//                               Month-wise
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => switchRentalPricingModel('day')}
//                               className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
//                                 rentalPricingModel === 'day'
//                                   ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
//                                   : 'text-gray-500 hover:text-gray-800'
//                               }`}
//                             >
//                               <Clock className="h-3.5 w-3.5" />
//                               Day-wise
//                             </button>
//                           </div>
//                           {/* <button
//                             type="button"
//                             onClick={addRentalTier}
//                             className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 sm:w-auto sm:self-center"
//                           >
//                             + Add more term
//                           </button> */}
//                           {!(
//                             isCustomRentalPricing &&
//                             rentalPricingModel === 'day'
//                           ) ? (
//                             <button
//                               type="button"
//                               onClick={addRentalTier}
//                               className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 sm:w-auto sm:self-center"
//                             >
//                               + Add more term
//                             </button>
//                           ) : null}
//                         </div>
//                       ) : null}
//                       <div className="mb-4 flex gap-3 border-b border-gray-100 pb-4">
//                         {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center  text-emerald-600">
//                         <DollarSign className="h-5 w-5" strokeWidth={2} />
//                       </div> */}
//                         <div className="min-w-0">
//                           <h4 className="text-sm flex  font-semibold text-gray-900">
//                             <DollarSign
//                               className="h-5 w-5  text-emerald-600"
//                               strokeWidth={2}
//                             />
//                             Rental configuration
//                           </h4>
//                           <p className="text-xs text-gray-500 mt-0.5">
//                             {isCustomRentalPricing
//                               ? `Set competitive rental prices for different tenure options.`
//                               : ''}
//                           </p>
//                           {/* {rentalFieldsLocked ? (
//                           <p className="mt-2 text-xs text-gray-600">
//                             Tenure type:{' '}
//                             <span className="font-semibold text-gray-800">
//                               {rentalPricingModel === 'day'
//                                 ? 'Day-wise'
//                                 : 'Month-wise'}
//                             </span>{' '}
//                             (catalog — read-only)
//                           </p>
//                         ) : null} */}
//                         </div>
//                       </div>
//                       {isCustomRentalPricing ? (
//                         <div className="space-y-4">
//                           {!String(categoryName || '').trim() ||
//                           !String(subCategoryName || '').trim() ? (
//                             <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
//                               Select category and sub-category above to load
//                               market-low benchmarks for each term.
//                             </p>
//                           ) : null}
//                           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
//                             {rentalTiers.map((tier, i) => {
//                               const isDayModel = rentalPricingModel === 'day';
//                               const tenureLen = isDayModel
//                                 ? toNum(tier.days, 0)
//                                 : toNum(tier.months, 0);
//                               const lowMap = isDayModel
//                                 ? marketLowTenures.day
//                                 : marketLowTenures.month;
//                               const perUnit =
//                                 tenureLen > 0
//                                   ? (lowMap?.[tenureLen] ??
//                                     lowMap?.[String(tenureLen)])
//                                   : undefined;
//                               const hasLow =
//                                 perUnit != null &&
//                                 Number.isFinite(Number(perUnit)) &&
//                                 Number(perUnit) > 0;
//                               const marketLine = marketLowLoading
//                                 ? 'Loading…'
//                                 : hasLow
//                                   ? isDayModel
//                                     ? `₹${formatInrCompact(Number(perUnit))}/day`
//                                     : `₹${formatInrCompact(Number(perUnit))}/mo`
//                                   : '—';
//                               const onMatchLowest = () => {
//                                 if (!hasLow || tenureLen <= 0) return;
//                                 const total = Math.round(
//                                   Number(perUnit) * tenureLen,
//                                 );
//                                 updateTier(i, 'monthlyRent', String(total));
//                               };
//                               return (
//                                 <div
//                                   key={i}
//                                   className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm space-y-2.5"
//                                 >
//                                   {tier.bestValue ? (
//                                     <span className="absolute top-2 right-2 rounded-full bg-orange-500 text-[9px] font-bold text-white px-2 py-0.5">
//                                       POPULAR
//                                     </span>
//                                   ) : null}
//                                   {/* {!rentalFieldsLocked ? (
//                                   <div className="flex flex-wrap items-center gap-2">
//                                     <label className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
//                                       Tenure ({isDayModel ? 'days' : 'months'})
//                                     </label>
//                                     <input
//                                       type="number"
//                                       min={1}
//                                       max={isDayModel ? 90 : 60}
//                                       value={
//                                         isDayModel
//                                           ? (tier.days ?? '')
//                                           : (tier.months ?? '')
//                                       }
//                                       onChange={(e) => {
//                                         const v = Math.max(
//                                           1,
//                                           toNum(e.target.value, 1),
//                                         );
//                                         if (isDayModel) {
//                                           patchTier(i, {
//                                             days: v,
//                                             label: `${v} Days`,
//                                           });
//                                         } else {
//                                           patchTier(i, {
//                                             months: v,
//                                             label: `${v} Months`,
//                                           });
//                                         }
//                                       }}
//                                       className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm"
//                                     />
//                                   </div>
//                                 ) : null} */}
//                                   <div className="pr-14">
//                                     {/* <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
//                                     {tier.tierLabel || 'Term'}
//                                   </p> */}
//                                     <p className="text-sm font-semibold text-gray-900">
//                                       {String(tier.label || '').trim() ||
//                                         (isDayModel
//                                           ? `${tier.days ?? 0} Days`
//                                           : `${tier.months ?? 0} Months`)}
//                                     </p>
//                                   </div>
//                                   <div className="rounded-lg  border border-gray-300 px-2.5 py-2">
//                                     <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
//                                       <TrendingDown
//                                         className="h-3.5 w-3.5 shrink-0 text-emerald-700"
//                                         strokeWidth={2.5}
//                                       />
//                                       Market low
//                                     </div>
//                                     <p className="text-sm font-semibold text-emerald-700 tabular-nums mt-0.5">
//                                       {marketLine}
//                                     </p>
//                                     {/* <p className="text-[10px] text-emerald-600/90 mt-0.5">
//                                     {isDayModel
//                                       ? 'Lowest per-day rate for this tenure'
//                                       : 'Lowest per-month rate for this tenure'}
//                                   </p> */}
//                                   </div>
//                                   <div>
//                                     <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
//                                       Your price
//                                     </label>
//                                     <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20">
//                                       <span className="flex items-center px-2.5 text-blue-500 text-sm bg-gray-50 border-r border-gray-200">
//                                         ₹
//                                       </span>
//                                       <input
//                                         type="number"
//                                         min={0}
//                                         value={tier.monthlyRent}
//                                         onChange={(e) =>
//                                           updateTier(
//                                             i,
//                                             'monthlyRent',
//                                             e.target.value,
//                                           )
//                                         }
//                                         className="w-full min-w-0 py-2 px-2 text-sm outline-none"
//                                         disabled={rentalFieldsLocked}
//                                         placeholder="0"
//                                       />
//                                     </div>
//                                     {/* <p className="text-[11px] text-gray-500 mt-1">
//                                     Total rent for this term (same basis as
//                                     storefront).
//                                   </p> */}
//                                   </div>
//                                   <button
//                                     type="button"
//                                     disabled={rentalFieldsLocked || !hasLow}
//                                     onClick={onMatchLowest}
//                                     className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                                   >
//                                     <Zap className="h-3.5 w-3.5" />
//                                     Match lowest
//                                   </button>
//                                   {/* {!rentalFieldsLocked &&
//                                 rentalTiers.length > 1 ? (
//                                   <button
//                                     type="button"
//                                     onClick={() => removeRentalTier(i)}
//                                     className="w-full text-xs font-medium text-red-600 hover:underline"
//                                   >
//                                     Remove term
//                                   </button>
//                                 ) : null} */}
//                                   {!rentalFieldsLocked && i >= 3 ? (
//                                     <button
//                                       type="button"
//                                       onClick={() => removeRentalTier(i)}
//                                       className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
//                                     >
//                                       <X className="h-3.5 w-3.5" />
//                                       Remove term
//                                     </button>
//                                   ) : null}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       ) : (
//                         <>
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                             {rentalTiers.map((tier, i) => (
//                               <div
//                                 key={i}
//                                 className="relative rounded-xl border-2 border-orange-200 bg-orange-50/30 p-3"
//                               >
//                                 {tier.bestValue ? (
//                                   <span className="absolute top-2 right-2 text-[10px] font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
//                                     Best value
//                                   </span>
//                                 ) : null}
//                                 {/* {!rentalFieldsLocked ? (
//                                 <div className="mb-2 flex flex-wrap items-center gap-2">
//                                   <label className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
//                                     Tenure (
//                                     {rentalPricingModel === 'day'
//                                       ? 'days'
//                                       : 'months'}
//                                     )
//                                   </label>
//                                   <input
//                                     type="number"
//                                     min={1}
//                                     max={rentalPricingModel === 'day' ? 90 : 60}
//                                     value={
//                                       rentalPricingModel === 'day'
//                                         ? (tier.days ?? '')
//                                         : (tier.months ?? '')
//                                     }
//                                     onChange={(e) => {
//                                       const v = Math.max(
//                                         1,
//                                         toNum(e.target.value, 1),
//                                       );
//                                       if (rentalPricingModel === 'day') {
//                                         patchTier(i, {
//                                           days: v,
//                                           label: `${v} Days`,
//                                         });
//                                       } else {
//                                         patchTier(i, {
//                                           months: v,
//                                           label: `${v} Months`,
//                                         });
//                                       }
//                                     }}
//                                     className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm"
//                                   />
//                                 </div>
//                               ) : null} */}
//                                 <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
//                                   {tier.tierLabel ||
//                                     (rentalPricingModel === 'day'
//                                       ? 'Term'
//                                       : 'Term')}
//                                 </p>
//                                 <p className="text-lg font-semibold text-black mb-2">
//                                   {String(tier.label || '').trim() ||
//                                     (rentalPricingModel === 'day'
//                                       ? `${tier.days ?? 0} Days`
//                                       : `${tier.months ?? 0} Months`)}
//                                 </p>
//                                 <label className="text-xs text-black">
//                                   {rentalPricingModel === 'day'
//                                     ? 'Rent (per day)'
//                                     : 'Monthly rent'}
//                                 </label>
//                                 <div className="mt-1 flex rounded-lg border border-[#FFB86A] bg-white">
//                                   <span className="pl-2 flex items-center text-gray-500 text-sm">
//                                     ₹
//                                   </span>
//                                   <input
//                                     value={tier.monthlyRent}
//                                     onChange={(e) =>
//                                       updateTier(
//                                         i,
//                                         'monthlyRent',
//                                         e.target.value,
//                                       )
//                                     }
//                                     className="w-full py-2 pr-2 text-sm outline-none rounded-lg"
//                                     disabled={rentalFieldsLocked}
//                                   />
//                                 </div>
//                                 <label className="text-xs text-black mt-2 block">
//                                   Shipping charges
//                                 </label>
//                                 <div className="mt-1 flex rounded-lg border border-[#FFB86A] bg-white">
//                                   <span className="pl-2 flex items-center text-gray-500 text-sm">
//                                     ₹
//                                   </span>
//                                   <input
//                                     value={tier.shippingCharges}
//                                     onChange={(e) =>
//                                       updateTier(
//                                         i,
//                                         'shippingCharges',
//                                         e.target.value,
//                                       )
//                                     }
//                                     className="w-full py-2 pr-2 text-sm outline-none rounded-lg"
//                                     disabled={rentalFieldsLocked}
//                                   />
//                                 </div>
//                                 {/* {!rentalFieldsLocked && rentalTiers.length > 1 ? (
//                                 <button
//                                   type="button"
//                                   onClick={() => removeRentalTier(i)}
//                                   className="mt-2 text-xs text-red-600 hover:underline"
//                                 >
//                                   Remove term
//                                 </button>
//                               ) : null} */}
//                                 {!rentalFieldsLocked && i >= 3 ? (
//                                   <button
//                                     type="button"
//                                     onClick={() => removeRentalTier(i)}
//                                     className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
//                                   >
//                                     <X className="h-3.5 w-3.5" />
//                                     Remove term
//                                   </button>
//                                 ) : null}
//                               </div>
//                             ))}
//                           </div>
//                         </>
//                       )}
//                     </SectionCard>
//                   ) : // ) : showPerVariantRentalConfig ? null : showPerVariantSalesConfig ? null : manualSellSalesConfiguration ? (
//                   //   <SectionCard
//                   //     title="Sales Configuration"
//                   //     subtitle="Set pricing and inventory details"
//                   //     icon={Tag}
//                   //     headerIconBoxed
//                   //     showLock={saleFieldsLocked}
//                   //   >
//                   showPerVariantRentalConfig ? null : showPerVariantSalesConfig ? null : manualSellSalesConfiguration ||
//                     (listingType === 'sell' && !!fullTemplate) ? (
//                     <SectionCard
//                       title="Sales Configuration"
//                       subtitle={
//                         fullTemplate
//                           ? `For variant: ${displayVariants[selectedTemplateVariantIndex]?.v?.variantName || 'selected variant'}`
//                           : 'Set pricing and inventory details'
//                       }
//                       icon={Tag}
//                       headerIconBoxed
//                       showLock={saleFieldsLocked}
//                     >
//                       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                         <div>
//                           <label className="text-sm font-medium text-gray-800">
//                             Selling Price (₹){' '}
//                             <span className="text-red-500">*</span>
//                           </label>
//                           <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
//                             {/* <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
//                             ₹
//                           </span> */}
//                             <input
//                               type="text"
//                               inputMode="decimal"
//                               value={sellPrice}
//                               onChange={(e) => setSellPrice(e.target.value)}
//                               disabled={saleFieldsLocked}
//                               className="w-full py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
//                               placeholder="e.g., 54999"
//                             />
//                           </div>
//                         </div>
//                         <div>
//                           <label className="text-sm font-medium text-gray-800">
//                             MRP{' '}
//                             <span className="font-normal text-gray-500">
//                               (Optional)
//                             </span>
//                             {/* <span className="text-red-500 ml-1">*</span> */}
//                           </label>
//                           <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
//                             {/* <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
//                             ₹
//                           </span> */}
//                             <input
//                               type="text"
//                               inputMode="decimal"
//                               value={mrpPrice}
//                               onChange={(e) => setMrpPrice(e.target.value)}
//                               disabled={saleFieldsLocked}
//                               className="w-full py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
//                               placeholder="e.g., 70000"
//                             />
//                           </div>
//                           <p className="mt-1.5 text-xs text-gray-500">
//                             Original price (for discount calculation)
//                           </p>
//                         </div>
//                       </div>
//                     </SectionCard>
//                   ) : (
//                     <SectionCard
//                       title="Sales Configuration"
//                       subtitle="Set pricing and inventory details"
//                       // icon={DollarSign}
//                       // showLock={saleFieldsLocked}
//                       icon={Tag}
//                       headerIconBoxed
//                     >
//                       <div className="space-y-3">
//                         {/* <div>
//                         <label className="text-xs text-gray-600">
//                           Selling Price *
//                         </label>

//                         <input

//                           value={sellPrice}
//                           onChange={(e) => setSellPrice(e.target.value)}
//                           disabled={saleFieldsLocked}
//                           className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
//                           placeholder="Enter your price"
//                         />
//                       </div> */}
//                         <div>
//                           <label className="text-xs text-gray-600">
//                             Selling Price *
//                           </label>

//                           <div className="mt-1 flex rounded-xl border overflow-hidden">
//                             <span className="flex items-center pl-3 pr-1 text-sm text-[#2563EB]">
//                               ₹
//                             </span>

//                             <input
//                               value={sellPrice}
//                               onChange={(e) => setSellPrice(e.target.value)}
//                               disabled={saleFieldsLocked}
//                               className="flex-none w-3/4 pl-1 pr-3 py-2 text-sm outline-none"
//                               placeholder="Enter your price"
//                             />
//                           </div>
//                         </div>

//                         <div className="rounded-xl border border-[#FFB86A] bg-orange-50 p-4">
//                           <div className="mb-3 flex items-center justify-between gap-2">
//                             <div className="flex min-w-0 items-center gap-2">
//                               <TrendingDown
//                                 className="h-5 w-5 shrink-0 text-emerald-600"
//                                 strokeWidth={2.25}
//                                 aria-hidden
//                               />
//                               <p className="truncate text-base font-medium text-gray-900">
//                                 Market Insights
//                               </p>
//                             </div>
//                             <span className="shrink-0 rounded-full bg-[#DCFCE7] border border-[#7BF1A8] px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">
//                               LIVE DATA
//                             </span>
//                           </div>
//                           <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
//                             <div className="rounded-lg border bg-white p-2.5">
//                               <p className="text-[10px] text-gray-500">
//                                 MRP / Market Price
//                               </p>
//                               <p className="text-sm font-semibold text-gray-900">
//                                 ₹
//                                 {Number.isFinite(Number(mrpPrice)) &&
//                                 Number(mrpPrice) > 0
//                                   ? Number(mrpPrice).toLocaleString('en-IN')
//                                   : '0'}
//                               </p>
//                             </div>
//                             <div className="rounded-lg border bg-white p-2.5">
//                               <p className="text-[10px] text-gray-500">
//                                 Lowest Price Online
//                               </p>
//                               <p className="text-sm font-semibold text-[#10B981]">
//                                 ₹
//                                 {Number.isFinite(Number(sellPrice)) &&
//                                 Number(sellPrice) > 0
//                                   ? Number(sellPrice).toLocaleString('en-IN')
//                                   : '0'}
//                               </p>
//                             </div>
//                           </div>
//                           <button
//                             type="button"
//                             disabled={saleFieldsLocked}
//                             onClick={() => {
//                               if (Number(mrpPrice) > 0 && !Number(sellPrice)) {
//                                 setSellPrice(String(mrpPrice));
//                               }
//                             }}
//                             className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFB86A] px-3 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
//                           >
//                             <Zap
//                               className="h-4 w-4 shrink-0 text-white"
//                               strokeWidth={2.25}
//                               aria-hidden
//                             />
//                             Match Lowest Price
//                           </button>
//                           <p className="mt-2 text-center text-xs text-gray-500">
//                             Auto-fill with the most competitive price online
//                           </p>
//                         </div>

//                         {/* <div>
//                         <label className="text-xs text-gray-600">
//                           MRP (optional)
//                         </label>
//                         <input
//                           value={mrpPrice}
//                           onChange={(e) => setMrpPrice(e.target.value)}
//                           disabled={saleFieldsLocked}
//                           className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
//                           placeholder="MRP"
//                         />
//                       </div> */}
//                       </div>
//                     </SectionCard>
//                   )}

//                   {listingType !== 'sell' ? (
//                     <div className="rounded-2xl border-2 border-violet-300 bg-violet-100 p-4">
//                       <h3 className="text-sm font-semibold text-gray-900">
//                         Refundable Deposit
//                       </h3>
//                       <p className="text-xs text-gray-500 mt-0.5">
//                         Security deposit returned after rental period ends
//                       </p>
//                       {/* <div className="mt-3 flex max-w-xs rounded-xl border border-violet-400 bg-violet-200">
//                         <span className="flex items-center pl-3 text-violet-800/80">
//                           ₹
//                         </span>
//                         <input
//                           value={refundableDeposit}
//                           onChange={(e) => setRefundableDeposit(e.target.value)}
//                           className="w-full rounded-xl bg-transparent py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-violet-400"
//                         />
//                       </div> */}
//                       <div className="mt-3 flex max-w-xs rounded-xl border border-violet-400 bg-violet-200">
//                         <span className="flex items-center pl-3 text-violet-800/80">
//                           ₹
//                         </span>
//                         <input
//                           value={refundableDeposit}
//                           onChange={(e) =>
//                             !rentalFieldsLocked &&
//                             setRefundableDeposit(e.target.value)
//                           }
//                           readOnly={rentalFieldsLocked}
//                           disabled={rentalFieldsLocked}
//                           className="w-full rounded-xl bg-transparent py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
//                         />
//                       </div>
//                     </div>
//                   ) : null}
//                   <SectionCard
//                     title="Logistics & Verification"
//                     icon={Truck}
//                     headerIconClassName="h-5 w-5 shrink-0 text-blue-600"
//                   >
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-sm font-medium text-gray-800">
//                           Delivery timeline{' '}
//                           <span className="text-red-500">*</span>
//                         </label>
//                         {/* <div className="mt-1 flex rounded-xl border border-gray-200 bg-white overflow-hidden">
//                           <input
//                             value={logistics.deliveryTimelineValue}
//                             onChange={(e) =>
//                               setLogistics((p) => ({
//                                 ...p,
//                                 deliveryTimelineValue: e.target.value,
//                               }))
//                             }
//                             className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none"
//                             placeholder="3"
//                           /> */}
//                         <div className="mt-1 flex rounded-xl border border-gray-200 bg-white overflow-hidden">
//                           <input
//                             type="text"
//                             inputMode="numeric"
//                             value={logistics.deliveryTimelineValue}
//                             onChange={(e) => {
//                               const digitsOnly = e.target.value.replace(
//                                 /\D/g,
//                                 '',
//                               );
//                               setLogistics((p) => ({
//                                 ...p,
//                                 deliveryTimelineValue: digitsOnly,
//                               }));
//                             }}
//                             onKeyDown={(e) => {
//                               if (
//                                 ['e', 'E', '+', '-', '.'].includes(e.key) ||
//                                 (!/[0-9]/.test(e.key) &&
//                                   ![
//                                     'Backspace',
//                                     'Delete',
//                                     'ArrowLeft',
//                                     'ArrowRight',
//                                     'Tab',
//                                   ].includes(e.key))
//                               ) {
//                                 e.preventDefault();
//                               }
//                             }}
//                             className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none"
//                             placeholder="3"
//                           />
//                           <select
//                             value={logistics.deliveryTimelineUnit}
//                             onChange={(e) =>
//                               setLogistics((p) => ({
//                                 ...p,
//                                 deliveryTimelineUnit: e.target.value,
//                               }))
//                             }
//                             className="border-l border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
//                           >
//                             <option value="Days">Days</option>
//                             <option value="Hours">Hours</option>
//                           </select>
//                         </div>
//                         <p className="text-xs text-gray-500 mt-1">
//                           Days required to deliver after order confirmation
//                         </p>
//                       </div>
//                       <div>
//                         <label className="text-sm font-medium text-gray-800">
//                           Inventory count{' '}
//                           <span className="text-red-500">*</span>
//                         </label>
//                         {/* <input
//                           type="number"
//                           min={0}
//                           value={stock}
//                           onChange={(e) => setStock(e.target.value)}
//                           className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
//                           placeholder="5"
//                         /> */}
//                         <input
//                           type="text"
//                           inputMode="numeric"
//                           min={0}
//                           value={stock}
//                           onChange={(e) => {
//                             const digitsOnly = e.target.value.replace(
//                               /\D/g,
//                               '',
//                             );
//                             setStock(digitsOnly);
//                           }}
//                           onKeyDown={(e) => {
//                             if (
//                               ['e', 'E', '+', '-', '.'].includes(e.key) ||
//                               (!/[0-9]/.test(e.key) &&
//                                 ![
//                                   'Backspace',
//                                   'Delete',
//                                   'ArrowLeft',
//                                   'ArrowRight',
//                                   'Tab',
//                                 ].includes(e.key))
//                             ) {
//                               e.preventDefault();
//                             }
//                           }}
//                           className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
//                           placeholder="5"
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                           Number of units available
//                         </p>
//                       </div>
//                       {/* <div>
//                     <label className="text-xs text-gray-500">
//                       Inventory owner (optional)
//                     </label>
//                     <input
//                       value={logistics.inventoryOwnerName}
//                       onChange={(e) =>
//                         setLogistics((p) => ({
//                           ...p,
//                           inventoryOwnerName: e.target.value,
//                         }))
//                       }
//                       className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
//                     />
//                   </div> */}
//                       {/* <div>
//                     <label className="text-xs text-gray-500">
//                       City (optional)
//                     </label>
//                     <input
//                       value={logistics.city}
//                       onChange={(e) =>
//                         setLogistics((p) => ({ ...p, city: e.target.value }))
//                       }
//                       className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
//                     />
//                   </div> */}
//                     </div>
//                   </SectionCard>
//                 </>
//               ) : null}
//             </>
//           </div>
//         </div>

//         <div className="flex shrink-0 flex-col-reverse items-stretch justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
//           <button
//             type="button"
//             onClick={() => submit('draft')}
//             className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
//           >
//             <Save className="h-4 w-4" />
//             Save as Draft
//           </button>
//           <button
//             type="button"
//             onClick={() =>
//               submit(mode === 'edit' ? 'published' : 'pending_approval')
//             }
//             className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
//           >
//             <Send className="h-4 w-4" />
//             {mode === 'edit' ? 'Update Product' : 'Submit for Approval'}
//           </button>
//         </div>
//       </div>

//       {/* Vendor quick-create sub-category modal */}
//       {subCatCreateOpen ? (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/40">
//           <div
//             className="absolute inset-0"
//             role="presentation"
//             onClick={() => !creatingSubCat && setSubCatCreateOpen(false)}
//           />
//           <div className="relative flex w-full max-w-lg flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
//             <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
//               <div className="min-w-0 pr-2">
//                 <h3 className="text-lg font-semibold tracking-tight text-gray-900">
//                   Add New Sub-category
//                 </h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Can&apos;t find the right sub-category? Add one for your
//                   listing.
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 disabled={creatingSubCat}
//                 onClick={() => setSubCatCreateOpen(false)}
//                 className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
//                 aria-label="Close"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-6 space-y-5">
//               <div>
//                 <label className="mb-1.5 block text-sm font-medium text-gray-800">
//                   Subcategory <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={newSubCatName}
//                   onChange={(e) => setNewSubCatName(e.target.value)}
//                   placeholder="e.g., Gaming Chairs"
//                   className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                 />
//               </div>

//               <div>
//                 <label className="mb-1.5 block text-sm font-medium text-gray-800">
//                   Category
//                 </label>
//                 <input
//                   value={categoryName}
//                   readOnly
//                   className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 outline-none"
//                 />
//                 <p className="mt-1.5 text-xs text-gray-500">
//                   This sub-category will be added under the main category you
//                   selected above.
//                 </p>
//               </div>

//               <div>
//                 <label className="mb-1.5 block text-sm font-medium text-gray-800">
//                   Commission Rate <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     min={0}
//                     value={newSubCatCommissionRate}
//                     onChange={(e) => setNewSubCatCommissionRate(e.target.value)}
//                     className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                   />
//                   <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
//                     %
//                   </span>
//                 </div>
//                 <p className="mt-1.5 text-xs text-gray-500">
//                   Platform&apos;s percentage share for this category
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-2 text-sm font-medium text-gray-800">
//                   Sub-category Image <span className="text-red-500">*</span>
//                 </p>
//                 <label className="flex flex-col items-center justify-center min-h-[168px] rounded-xl border border-gray-200 bg-gray-50/80 hover:border-orange-200 hover:bg-orange-50/20 cursor-pointer transition-colors">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) =>
//                       setNewSubCatImage(e.target.files?.[0] || null)
//                     }
//                   />
//                   {newSubCatImage ? (
//                     <div className="relative p-3 w-full">
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           setNewSubCatImage(null);
//                         }}
//                         className="absolute top-2 right-2 p-1 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:text-red-600"
//                         aria-label="Remove file"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                       <img
//                         src={URL.createObjectURL(newSubCatImage)}
//                         alt=""
//                         className="mx-auto max-h-32 object-contain rounded-lg"
//                       />
//                       <p className="text-xs text-center text-gray-600 mt-2 truncate px-2">
//                         {newSubCatImage.name}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center gap-2 py-10 px-4">
//                       <ImageIcon
//                         className="w-9 h-9 text-orange-500"
//                         strokeWidth={1.75}
//                       />
//                       <span className="text-sm font-medium text-orange-500">
//                         Select from Media Library
//                       </span>
//                       <span className="text-xs text-gray-400">
//                         PNG, JPG, WebP
//                       </span>
//                     </div>
//                   )}
//                 </label>
//                 <p className="mt-2 text-xs text-gray-500">
//                   512x512px recommended for app grids
//                 </p>
//               </div>

//               <p className="text-xs text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
//                 New sub-categories may be reviewed by the admin team before
//                 appearing elsewhere on the platform.
//               </p>
//             </div>

//             <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
//               <button
//                 type="button"
//                 disabled={creatingSubCat}
//                 onClick={() => setSubCatCreateOpen(false)}
//                 className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={creatingSubCat}
//                 onClick={handleCreateSubCategory}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-60"
//               >
//                 {creatingSubCat ? (
//                   'Creating…'
//                 ) : (
//                   <>
//                     <Check className="h-4 w-4" strokeWidth={2.5} />
//                     Create Sub-category
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Box,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Filter,
  Image as ImageIcon,
  Key,
  Lock,
  Package,
  Plus,
  Save,
  Search,
  Send,
  Tag,
  Trash2,
  TrendingDown,
  Truck,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import {
  getCategories,
  getSubCategories,
} from '../../../redux/slices/categorySlice';
import { getMyProducts } from '../../../redux/slices/productSlice';
import {
  apiGetVendorListingTemplateByType,
  apiGetVendorListingTemplates,
  apiGetVendorMarketLowRentalTenures,
  apiVendorCreateSubCategory,
} from '@/service/api';
import check from '@/assets/icons/check.png';

const PLACEHOLDER_IMG = 'https://placehold.co/56x56/e5e7eb/6b7280?text=IMG';

/** `public/rent-out.png` — shows Key icon until the asset exists. */
function RentOutListingIcon({ className }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <Key
        className="h-6 w-6 shrink-0 text-gray-500"
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  return (
    <img
      src="/rent-out.png"
      alt=""
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

/** Admin Custom Listings toggle off → must not appear in vendor “Add from catalog”. */
function adminTemplateAllowedForVendor(t) {
  if (!t) return false;
  return (
    t.isActive !== false &&
    t.isActive !== 'false' &&
    t.isActive !== 0 &&
    t.isActive !== '0'
  );
}

/** Preview for a local `File` in variant media; revokes blob URL on cleanup. */
function VariantLocalImagePreview({ file, className }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file || !(file instanceof File)) {
      setUrl('');
      return undefined;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) {
    return <div className={`${className} bg-gray-100`} aria-hidden />;
  }
  return <img src={url} alt="" className={className} />;
}

/** First image for variant row: saved URL or first pending upload. */
function variantPrimaryVisual(mv) {
  const url = (mv?.existingImages || []).find((u) => String(u || '').trim());
  if (url) return { kind: 'url', url: String(url) };
  const f = (mv?.newImages || []).find((x) => x instanceof File);
  if (f) return { kind: 'file', file: f };
  return { kind: 'none' };
}

/** Prefer icon URL, then image, for category / subcategory cards from API. */
function categoryOrSubAssetUrl(item) {
  const icon = String(item?.icon || '').trim();
  if (icon) return icon;
  const img = String(item?.image || '').trim();
  return img || '';
}

function namesMatch(a, b) {
  return (
    String(a || '')
      .trim()
      .toLowerCase() ===
    String(b || '')
      .trim()
      .toLowerCase()
  );
}

// function listedProductPriceSubtitle(p) {
//   const raw = p?.price != null ? String(p.price).trim() : '';
//   if (String(p?.type || '') === 'Sell') {
//     return raw && raw !== '0' ? raw : '—';
//   }
//   if (raw && raw !== '0') {
//     if (/[₹]|rs\.?|\/|mo|month|day|d\b/i.test(raw)) return raw;
//     return `₹${raw}/month`;
//   }
//   return '—';
// }

function listedProductPriceSubtitle(p) {
  const raw = p?.price != null ? String(p.price).trim() : '';
  const isSell = String(p?.type || '') === 'Sell';

  // Custom listings sometimes have '0'/empty top-level price while the real
  // price lives on a variant — fall back to the first variant with a price
  // before giving up and showing '—'.
  const variants = Array.isArray(p?.variants) ? p.variants : [];
  const variantWithPrice = isSell
    ? variants.find((v) => String(v?.sellPrice ?? '').trim() !== '')
    : variants.find((v) => String(v?.price ?? '').trim() !== '');
  const variantRaw = isSell
    ? String(variantWithPrice?.sellPrice ?? '').trim()
    : String(variantWithPrice?.price ?? '').trim();

  const finalRaw = raw && raw !== '0' ? raw : variantRaw;

  if (isSell) {
    return finalRaw && finalRaw !== '0' ? finalRaw : '—';
  }
  if (finalRaw && finalRaw !== '0') {
    if (/[₹]|rs\.?|\/|mo|month|day|d\b/i.test(finalRaw)) return finalRaw;
    return `₹${finalRaw}/month`;
  }
  return '—';
}

function genLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyVariantSpecRow() {
  return { label: '', value: '' };
}

function newManualVariant() {
  return {
    id: genLocalId(),
    variantName: '',
    stock: '',
    existingImages: [],
    newImages: [],
    specRows: [emptyVariantSpecRow()],
    sellPrice: '',
    mrpPrice: '',
    rentalPricingModel: 'day',
    rentalTiers: customListingDayTiers(),
  };
}

// function mergeCustomListingSpecifications(variants) {
//   const out = {};
//   for (const mv of variants || []) {
//     const name = String(mv.variantName || '').trim() || 'Variant';
//     const rows = Array.isArray(mv.specRows) ? mv.specRows : [];
//     for (const row of rows) {
//       const k = String(row?.label || '').trim();
//       if (!k) continue;
//       out[`${name} — ${k}`] = String(row?.value ?? '').trim();
//     }
//   }
//   return out;
// }

function mergeCustomListingSpecifications(variants) {
  const out = {};
  for (const mv of variants || []) {
    const name = String(mv.variantName || '').trim() || 'Variant';
    const rows = Array.isArray(mv.specRows) ? mv.specRows : [];
    for (const row of rows) {
      const k = String(row?.label || '').trim();
      if (!k) continue;
      out[`${name} — ${k}`] = String(row?.value ?? '').trim();
    }
  }
  return out;
}

function collectCustomListingImageUrls(variants) {
  const u = [];
  for (const mv of variants || []) {
    for (const url of mv.existingImages || []) {
      if (url) u.push(String(url));
    }
  }
  return Array.from(new Set(u)).slice(0, 10);
}

// function collectCustomListingImageFiles(variants) {
//   const f = [];
//   for (const mv of variants || []) {
//     if (Array.isArray(mv.newImages)) f.push(...mv.newImages);
//   }
//   return f.slice(0, 10);
// }

function collectCustomListingImageFiles(variants) {
  const f = [];
  for (const mv of variants || []) {
    if (Array.isArray(mv.newImages)) f.push(...mv.newImages);
  }
  return f.slice(0, 10);
}

/**
 * Parallel array to collectCustomListingImageFiles(): for each new file (same
 * order), records the index of the variant (within `variants`) it belongs to,
 * so the backend can attach each upload to the correct variant instead of
 * splitting evenly across all variants.
 */
function collectCustomListingImageOwners(variants) {
  const owners = [];
  (variants || []).forEach((mv, idx) => {
    if (Array.isArray(mv.newImages)) {
      mv.newImages.forEach(() => owners.push(idx));
    }
  });
  return owners.slice(0, 10);
}

function toNum(v, fallback = 0) {
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * When admin left "Vendor configuration" empty for a tier, derive the
 * vendor's price from the Customer configuration price minus this
 * product's category commission % — e.g. customerRent 300 at 10%
 * commission → vendor sees 270. Never runs when admin DID set a vendor
 * price; that value always wins as-is.
 */
function computeVendorPriceFromCustomerFallback(
  customerRent,
  commissionRatePercent,
) {
  const c = toNum(customerRent, 0);
  if (!(c > 0)) return '';
  const rateRaw = Number(commissionRatePercent);
  const safeRate = Number.isFinite(rateRaw)
    ? Math.min(100, Math.max(0, rateRaw))
    : 15; // fallback commission rate mirrors FALLBACK_COMMISSION_RATE used elsewhere
  const vendorAmt = Math.round(c - (c * safeRate) / 100);
  return vendorAmt > 0 ? String(vendorAmt) : '';
}

/**
 * Label for the first rental tier (custom listing variant row, product.price).
 * Day-wise: total for N-day block → "₹X / Nd"; month-wise: "₹X/month".
 */
function formatFirstTierRentLabel(tiers, rentalPricingModel) {
  const t0 = tiers?.[0];
  const raw = t0?.monthlyRent != null ? String(t0.monthlyRent).trim() : '';
  if (!raw) return null;
  if (rentalPricingModel === 'day') {
    const d = toNum(t0?.days, 0);
    return d > 0 ? `₹${raw} / ${d}d` : `₹${raw}/day`;
  }
  return `₹${raw}/month`;
}

// const SELL_CONDITION_OPTIONS = ['Brand New', 'Refurbished'];
// /** Admin template rentals may still use these values (read-only for vendor). */
// const RENTAL_TEMPLATE_CONDITION_OPTIONS = [
//   'Brand New',
//   'Like New',
//   'Good',
//   'Fair',
//   'Refurbished',
// ];
// /** Vendor manual / custom rental listings: editable condition set only. */
// const RENTAL_MANUAL_CONDITION_OPTIONS = ['Brand New', 'Refurbished'];

const SELL_CONDITION_OPTIONS = ['Brand New', 'Refurbished', 'Mint Condition'];
/** Admin template rentals may still use these values (read-only for vendor). */
const RENTAL_TEMPLATE_CONDITION_OPTIONS = [
  'Brand New',
  'Like New',
  'Good',
  'Fair',
  'Refurbished',
  'Mint Condition',
];
/** Vendor manual / custom rental listings: editable condition set only. */
const RENTAL_MANUAL_CONDITION_OPTIONS = [
  'Brand New',
  'Refurbished',
  'Mint Condition',
];

function normalizeRentalTemplateCondition(condition) {
  const c = String(condition || '').trim();
  return RENTAL_TEMPLATE_CONDITION_OPTIONS.includes(c) ? c : 'Good';
}

function normalizeManualRentalCondition(condition) {
  const c = String(condition || '').trim();
  if (RENTAL_MANUAL_CONDITION_OPTIONS.includes(c)) return c;
  if (c === 'Like New') return 'Brand New';
  if (c === 'Good' || c === 'Fair') return 'Refurbished';
  return 'Brand New';
}

function normalizeConditionForListingType(
  condition,
  listingType,
  vendorManualRental = false,
) {
  const c = String(condition || '').trim();
  if (listingType === 'Sell') {
    return SELL_CONDITION_OPTIONS.includes(c) ? c : 'Brand New';
  }
  return vendorManualRental
    ? normalizeManualRentalCondition(c)
    : normalizeRentalTemplateCondition(c);
}

function specsObjectFromTemplate(t, variantIndex = 0) {
  const specs =
    t?.specifications &&
    typeof t.specifications === 'object' &&
    !Array.isArray(t.specifications)
      ? { ...t.specifications }
      : {};
  if (Array.isArray(t?.productCustomSpecs)) {
    for (const row of t.productCustomSpecs) {
      const k = String(row?.label || '').trim();
      if (k) specs[k] = String(row?.value ?? '');
    }
  }

  // Merge selected variant's "variant specs" so vendor-created products
  // can store them in `product.specifications` (storefront displays from it).
  const variant =
    Array.isArray(t?.variants) && t.variants.length
      ? t.variants[Math.max(0, Math.min(variantIndex, t.variants.length - 1))]
      : null;

  const mergeLabelValueRows = (rows) => {
    if (!Array.isArray(rows)) return;
    for (const row of rows) {
      const k = String(row?.label || '').trim();
      if (!k) continue;
      specs[k] = String(row?.value ?? '').trim();
    }
  };

  if (variant) {
    // Expected shape: `variant.variantSpecs: [{label,value}]`
    if (Array.isArray(variant.variantSpecs)) {
      mergeLabelValueRows(variant.variantSpecs);
    } else if (
      variant.variantSpecs &&
      typeof variant.variantSpecs === 'object' &&
      !Array.isArray(variant.variantSpecs)
    ) {
      // Sometimes stored as an object map: { "colour": "green", ... }
      for (const [k, v] of Object.entries(variant.variantSpecs)) {
        const kk = String(k).trim();
        if (!kk) continue;
        specs[kk] = String(v ?? '').trim();
      }
    } else if (Array.isArray(variant.specRows)) {
      // Legacy naming used by the admin flexible form: `specRows`
      mergeLabelValueRows(variant.specRows);
    }

    // Also copy standard fields into spec object (storefront reads from it).
    if (variant.color) specs.Color = String(variant.color);
    if (variant.storage) specs.Storage = String(variant.storage);
    if (variant.ram) specs.RAM = String(variant.ram);
  }
  return specs;
}

function galleryFromTemplate(t) {
  const normalizeToUrlArray = (val) => {
    if (Array.isArray(val)) {
      return val.filter(Boolean).map((x) => String(x));
    }
    if (typeof val === 'string') {
      const s = val.trim();
      if (!s) return [];
      // Sometimes backend stores JSON-stringified arrays.
      try {
        if (s.startsWith('[')) {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            return parsed.filter(Boolean).map((x) => String(x));
          }
        }
      } catch {
        // ignore
      }
      // Otherwise treat as a single URL.
      return [s];
    }
    if (val && typeof val === 'object') {
      // e.g. {0: 'url1', 1: 'url2'} or { images: [...] }
      if (Array.isArray(val.images)) {
        return val.images.filter(Boolean).map((x) => String(x));
      }
      const values = Object.values(val)
        .filter(Boolean)
        .map((x) => String(x));
      return values;
    }
    return [];
  };

  const urls = [
    ...normalizeToUrlArray(t?.images),
    t?.image ? String(t.image) : '',
    ...(Array.isArray(t?.variants)
      ? t.variants.flatMap((v) => [
          ...normalizeToUrlArray(v?.images),
          ...normalizeToUrlArray(v?.existingVariantImages),
          ...normalizeToUrlArray(v?.variantImages),
        ])
      : []),
  ].filter(Boolean);

  // De-duplicate while preserving order (important for templates
  // that store the same image at multiple levels).
  const uniq = Array.from(new Set(urls));
  return uniq.slice(0, 10);
}

// function defaultMonthTiers() {
//   return [
//     {
//       months: 3,
//       days: 0,
//       label: '3 Months',
//       // tierLabel: 'SHORT TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 6,
//       days: 0,
//       label: '6 Months',
//       // tierLabel: 'STANDARD',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 12,
//       days: 0,
//       label: '12 Months',
//       // tierLabel: 'LONG TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: true,
//     },
//   ];
// }

function defaultMonthTiers() {
  return [
    {
      months: 3,
      days: 0,
      label: '3 Months',
      // tierLabel: 'SHORT TERM',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: false,
    },
    {
      months: 6,
      days: 0,
      label: '6 Months',
      // tierLabel: 'STANDARD',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: false,
    },
    {
      months: 9,
      days: 0,
      label: '9 Months',
      // tierLabel: 'LONG TERM',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: true,
    },
  ];
}

// function defaultDayTiers() {
//   return [
//     {
//       months: 0,
//       days: 3,
//       label: '3 Days',
//       // tierLabel: 'SHORT TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 0,
//       days: 5,
//       label: '5 Days',
//       // tierLabel: 'STANDARD',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: false,
//     },
//     {
//       months: 0,
//       days: 7,
//       label: '7 Days',
//       // tierLabel: 'LONG TERM',
//       monthlyRent: '',
//       shippingCharges: '',
//       bestValue: true,
//     },
//   ];
// }

function defaultDayTiers() {
  return [
    {
      months: 0,
      days: 1,
      label: '1 Day',
      // tierLabel: 'DAILY',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: false,
    },
    {
      months: 0,
      days: 3,
      label: '3 Days',
      // tierLabel: 'SHORT TERM',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: false,
    },
    {
      months: 0,
      days: 5,
      label: '5 Days',
      // tierLabel: 'STANDARD',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: false,
    },
    {
      months: 0,
      days: 7,
      label: '7 Days',
      // tierLabel: 'LONG TERM',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: true,
    },
  ];
}

function customListingDayTiers() {
  return [
    {
      months: 0,
      days: 1,
      label: 'Per Day',
      monthlyRent: '',
      shippingCharges: '',
      bestValue: true,
    },
  ];
}

const DEFAULT_MARKET_MONTH_TENURES = [3, 6, 9];
// const DEFAULT_MARKET_DAY_TENURES = [3, 5, 7];
const DEFAULT_MARKET_DAY_TENURES = [1];

function formatInrCompact(n) {
  if (!Number.isFinite(n) || n <= 0) return '';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function sortedPositiveTenureKeys(map) {
  if (!map || typeof map !== 'object') return [];
  return Object.keys(map)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
}

/**
 * Build rental tier rows from market-low API maps (per-unit ₹/mo or ₹/day).
 * Reuses prior "Your price" totals when tenure rows still match after refresh.
 */
// function synthesizeRentalTiersFromMarket(monthMap, dayMap, model, prevTiers) {
//   const isDay = model === 'day';
//   const rawKeys = isDay
//     ? sortedPositiveTenureKeys(dayMap)
//     : sortedPositiveTenureKeys(monthMap);
//   const fallback = isDay
//     ? DEFAULT_MARKET_DAY_TENURES
//     : DEFAULT_MARKET_MONTH_TENURES;
//   const keys = rawKeys.length > 0 ? rawKeys : fallback;
//   const maxKey = keys[keys.length - 1];
//   const prevArr = Array.isArray(prevTiers) ? prevTiers : [];

//   const base = keys.map((len, i) => {
//     const prev = prevArr.find((t) =>
//       isDay ? toNum(t.days, 0) === len : toNum(t.months, 0) === len,
//     );
//     // const bestValue = !isDay
//     //   ? keys.includes(12)
//     //     ? len === 12
//     //     : len === maxKey
//     //   : len === maxKey;
//     const bestValue = len === maxKey;
//     return {
//       months: isDay ? 0 : len,
//       days: isDay ? len : 0,
//       label: isDay ? `${len} Days` : `${len} Months`,
//       // tierLabel:
//       //   TIER_BAND_LABELS[i] ?? TIER_BAND_LABELS[TIER_BAND_LABELS.length - 1],
//       monthlyRent: prev?.monthlyRent != null ? String(prev.monthlyRent) : '',
//       shippingCharges: '',
//       bestValue,
//     };
//   });

//   const extra = prevArr
//     .filter((row) => {
//       const len = isDay ? toNum(row.days, 0) : toNum(row.months, 0);
//       return len > 0 && !keys.includes(len);
//     })
//     .sort((a, b) => {
//       const la = isDay ? toNum(a.days, 0) : toNum(a.months, 0);
//       const lb = isDay ? toNum(b.days, 0) : toNum(b.months, 0);
//       return la - lb;
//     })
//     .map((row) => ({
//       ...row,
//       shippingCharges: row.shippingCharges ?? '',
//       bestValue: false,
//     }));

//   // return [...base, ...extra];
//   const all = [...base, ...extra];
//   // Mark only the last (longest) tier as best value
//   all.forEach((t) => (t.bestValue = false));
//   if (all.length > 0) all[all.length - 1].bestValue = true;
//   return all;
// }

function synthesizeRentalTiersFromMarket(monthMap, dayMap, model, prevTiers) {
  const isDay = model === 'day';
  // Fixed tenure ladder — vendor can't edit tenure numbers in custom listings,
  // so the ladder must always be 3/6/9 (or 3/5/7 days), never driven by
  // whatever tenures happen to exist in market-low data from other listings.
  const keys = isDay
    ? DEFAULT_MARKET_DAY_TENURES
    : DEFAULT_MARKET_MONTH_TENURES;
  const maxKey = keys[keys.length - 1];
  const prevArr = Array.isArray(prevTiers) ? prevTiers : [];

  const base = keys.map((len) => {
    const prev = prevArr.find((t) =>
      isDay ? toNum(t.days, 0) === len : toNum(t.months, 0) === len,
    );
    const bestValue = len === maxKey;
    //   return {
    //     months: isDay ? 0 : len,
    //     days: isDay ? len : 0,
    //     label: isDay ? `${len} Days` : `${len} Months`,
    //     monthlyRent: prev?.monthlyRent != null ? String(prev.monthlyRent) : '',
    //     shippingCharges: '',
    //     bestValue,
    //   };
    // });
    return {
      months: isDay ? 0 : len,
      days: isDay ? len : 0,
      label: isDay ? (len === 1 ? 'Per Day' : `${len} Days`) : `${len} Months`,
      monthlyRent: prev?.monthlyRent != null ? String(prev.monthlyRent) : '',
      shippingCharges: '',
      bestValue,
    };
  });

  // Preserve tiers the vendor manually added via "+ Add more term"
  // (these sit outside the fixed ladder, e.g. 15 months) — but no longer
  // treat market-data tenure lengths (like a stray 12) as "extra".
  const extra = prevArr
    .filter((row) => {
      const len = isDay ? toNum(row.days, 0) : toNum(row.months, 0);
      return len > 0 && !keys.includes(len);
    })
    .sort((a, b) => {
      const la = isDay ? toNum(a.days, 0) : toNum(a.months, 0);
      const lb = isDay ? toNum(b.days, 0) : toNum(b.months, 0);
      return la - lb;
    })
    .map((row) => ({
      ...row,
      shippingCharges: row.shippingCharges ?? '',
      bestValue: false,
    }));

  const all = [...base, ...extra];
  all.forEach((t) => (t.bestValue = false));
  if (all.length > 0) all[all.length - 1].bestValue = true;
  return all;
}

function resolveTemplateRentalRaw(template, variantIndex) {
  const variants = Array.isArray(template?.variants) ? template.variants : [];
  const v = variants[variantIndex];
  const fromVariant = Array.isArray(v?.rentalConfigurations)
    ? v.rentalConfigurations
    : [];
  if (fromVariant.length) return fromVariant;
  if (
    Array.isArray(template?.rentalConfigurations) &&
    template.rentalConfigurations.length
  ) {
    return template.rentalConfigurations;
  }
  return [];
}

// function templateVariantPricingModel(template, variantIndex) {
//   const variants = Array.isArray(template?.variants) ? template.variants : [];
//   const v = variants[variantIndex];
//   if (!v) return 'month';
//   return v.rentalPricingModel === 'day' ? 'day' : 'month';
// }
function templateVariantPricingModel(template, variantIndex) {
  // Source of truth: each saved rental tier config carries its own
  // `periodUnit` ('day' | 'month'). Reading it directly avoids relying on
  // template/variant-level flags that may not be persisted correctly.
  const raw = resolveTemplateRentalRaw(template, variantIndex);
  if (Array.isArray(raw) && raw.length) {
    const dayCount = raw.filter((c) => c?.periodUnit === 'day').length;
    const monthCount = raw.length - dayCount;
    return dayCount > monthCount ? 'day' : 'month';
  }
  const variants = Array.isArray(template?.variants) ? template.variants : [];
  const v = variants[variantIndex];
  if (v?.rentalPricingModel === 'day' || v?.rentalPricingModel === 'month') {
    return v.rentalPricingModel;
  }
  return template?.rentalPricingModel === 'day' ? 'day' : 'month';
}

/** Admin "Vendor configuration" — do not surface customer-facing prices to vendors. */
function pickTemplateVendorRent(cfg) {
  if (cfg == null) return '';
  if (cfg.vendorRent != null && String(cfg.vendorRent).trim() !== '') {
    return String(cfg.vendorRent);
  }
  return '';
}

// function pickTemplateVendorShipping(cfg) {
//   if (cfg == null) return '';
//   if (cfg.vendorShipping != null && String(cfg.vendorShipping).trim() !== '') {
//     return String(cfg.vendorShipping);
//   }
//   return '';
// }
function pickTemplateVendorShipping(cfg) {
  if (cfg == null) return '';
  if (cfg.vendorShipping != null && String(cfg.vendorShipping).trim() !== '') {
    return String(cfg.vendorShipping);
  }
  return '';
}

/** Admin "Customer configuration" — the real price end-customers must see. */
function pickTemplateCustomerRent(cfg) {
  if (cfg == null) return '';
  if (cfg.customerRent != null && String(cfg.customerRent).trim() !== '') {
    return String(cfg.customerRent);
  }
  return '';
}

/** Per-variant sell pricing + lock from an admin sell template's variant. */
function getTemplateVariantSaleConfig(template, variantIndex) {
  const variants = Array.isArray(template?.variants) ? template.variants : [];
  const v =
    variants[Math.max(0, Math.min(variantIndex ?? 0, variants.length - 1))];
  const parseMoney = (x) => {
    const s = String(x ?? '')
      .replace(/,/g, '')
      .trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  const vSell = parseMoney(v?.sellPrice);
  const vMrp = parseMoney(v?.mrpPrice);
  const tplSell = parseMoney(template?.salesConfiguration?.salePrice);
  const tplMrp = parseMoney(template?.salesConfiguration?.mrpPrice);
  return {
    sellPrice:
      vSell != null && vSell > 0
        ? String(vSell)
        : tplSell != null && tplSell > 0
          ? String(tplSell)
          : '',
    mrpPrice:
      vMrp != null && vMrp > 0
        ? String(vMrp)
        : tplMrp != null && tplMrp > 0
          ? String(tplMrp)
          : '',
    //     allowVendorEditSalePrice:
    //       v?.allowVendorEditSalePrice !== undefined
    //         ? v.allowVendorEditSalePrice !== false
    //         : template?.salesConfiguration?.allowVendorEditSalePrice !== false,
    //   };
    // }

    // function rentalTiersFromTemplate(template, model, variantIndex = 0) {

    allowVendorEditSalePrice:
      v?.allowVendorEditSalePrice !== undefined
        ? v.allowVendorEditSalePrice !== false
        : template?.salesConfiguration?.allowVendorEditSalePrice !== false,
  };
}

/** Per-variant rental-price-edit permission from an admin rental template's variant. */
function getTemplateVariantAllowEdit(template, variantIndex) {
  const variants = Array.isArray(template?.variants) ? template.variants : [];
  const v =
    variants[Math.max(0, Math.min(variantIndex ?? 0, variants.length - 1))];
  if (v?.allowVendorEditRentalPrices !== undefined) {
    return v.allowVendorEditRentalPrices !== false;
  }
  return template?.allowVendorEditRentalPrices !== false;
}

function rentalTiersFromTemplate(template, model, variantIndex = 0) {
  const raw = resolveTemplateRentalRaw(template, variantIndex);
  if (!Array.isArray(raw) || !raw.length) {
    return model === 'day' ? defaultDayTiers() : defaultMonthTiers();
  }
  const wantDay = model === 'day';
  const templateNativeModel = templateVariantPricingModel(
    template,
    variantIndex,
  );
  const unitMismatch =
    (wantDay && templateNativeModel === 'month') ||
    (!wantDay && templateNativeModel === 'day');
  const DEFAULT_DAY_LADDER = [3, 5, 7];
  const DEFAULT_MONTH_LADDER = [3, 6, 12];

  return raw.slice(0, 6).map((cfg, i) => {
    const periodUnit = cfg.periodUnit === 'day' ? 'day' : 'month';
    const isCfgDay = periodUnit === 'day';
    const cfgMonths = toNum(cfg.months, 0);
    const cfgDays = toNum(cfg.days, 0);
    const adminLabel = String(cfg.label || '').trim();

    let months = 0;
    let days = 0;
    let label = '';

    if (wantDay) {
      if (isCfgDay && cfgDays > 0) {
        days = cfgDays;
        label =
          adminLabel && !/\bmonths?\b/i.test(adminLabel)
            ? adminLabel
            : `${days} Days`;
      } else {
        days =
          DEFAULT_DAY_LADDER[Math.min(i, DEFAULT_DAY_LADDER.length - 1)] ??
          3 + i * 2;
        label = `${days} Days`;
      }
    } else {
      if (!isCfgDay && cfgMonths > 0) {
        months = cfgMonths;
        label =
          adminLabel && !/\bdays?\b/i.test(adminLabel)
            ? adminLabel
            : `${months} Months`;
      } else if (isCfgDay && cfgMonths > 0) {
        months = cfgMonths;
        label = `${months} Months`;
      } else {
        months =
          DEFAULT_MONTH_LADDER[Math.min(i, DEFAULT_MONTH_LADDER.length - 1)] ??
          3 * (i + 1);
        label = `${months} Months`;
      }
    }

    // // `monthlyRent` drives what the vendor SEES and what gets submitted as
    // // the price, so it must always be the admin's customer-facing price —
    // // never the vendor's own cost. Vendor cost is kept separately only for
    // // internal reference and is never shown/submitted as the price.
    // let rentVal = pickTemplateCustomerRent(cfg);
    // let shipVal = pickTemplateVendorShipping(cfg);
    // let vendorCostVal = pickTemplateVendorRent(cfg);
    // `monthlyRent` drives what the vendor SEES and what gets submitted as
    // the price, so it must always be the admin's vendor-facing (cost)
    // price — this is what the vendor pays/charges, not the customer price.
    // Customer price is kept separately only for internal reference and is
    // never shown/submitted as the vendor's price.
    let rentVal = pickTemplateVendorRent(cfg);
    let shipVal = pickTemplateVendorShipping(cfg);
    let vendorCostVal = pickTemplateCustomerRent(cfg);
    if (unitMismatch) {
      rentVal = '';
      shipVal = '';
      vendorCostVal = '';
    }
    //     return {
    //       months,
    //       days,
    //       label,
    //       tierLabel: String(cfg.tierLabel || '').trim(),
    //       monthlyRent: rentVal,
    //       shippingCharges: shipVal,
    //       // bestValue: i === 2,
    //       bestValue: false,
    //     };
    //   });
    //   if (tiers.length > 0) {
    //     tiers[tiers.length - 1].bestValue = true;
    //   }
    //   return tiers;
    // }

    //     return {
    //       months,
    //       days,
    //       label,
    //       tierLabel: String(cfg.tierLabel || '').trim(),
    //       monthlyRent: rentVal,
    //       vendorCost: vendorCostVal,
    //       shippingCharges: shipVal,
    //       bestValue: false,
    //     };
    //   });
    //   if (tiers.length > 0) {
    //     tiers[tiers.length - 1].bestValue = true;
    //   }
    //   return tiers;
    // }
    return {
      months,
      days,
      label,
      tierLabel: String(cfg.tierLabel || '').trim(),
      monthlyRent: rentVal,
      vendorCost: vendorCostVal,
      shippingCharges: shipVal,
      bestValue: false,
    };
  });
}

/** First-tenure rental line for template variant row, e.g. ₹25000/3month or ₹500/5day. */
/** Edit-mode fallback: variant's own saved rentalConfigurations (fullTemplate
 * is null in edit mode, so templateVariantRentalSubtitle can't be used). */
function editModeVariantRentalSubtitle(v) {
  const rc = Array.isArray(v?.rentalConfigurations)
    ? v.rentalConfigurations
    : [];
  const t0 = rc[0];
  if (!t0) return null;
  const amt = Number(t0.vendorRent) > 0 ? Number(t0.vendorRent) : 0;
  if (!amt) return null;
  if (t0.periodUnit === 'day') {
    return `₹${amt}/day`;
  }
  return `₹${amt}/month`;
}

// function templateVariantRentalSubtitle(
//   fullTemplate,
//   variantIndex,
//   listingType,
// ) {
//   if (listingType === 'sell' || !fullTemplate) return null;
//   const model = templateVariantPricingModel(fullTemplate, variantIndex);
//   const tiers = rentalTiersFromTemplate(fullTemplate, model, variantIndex);
//   const t0 = tiers?.[0];
//   if (!t0) return null;
//   const raw = t0.monthlyRent != null ? String(t0.monthlyRent).trim() : '';
//   if (!raw) return null;
//   if (model === 'day') {
//     return `₹${raw}/day`;
//   }
//   return `₹${raw}/month`;
// }

function templateVariantRentalSubtitle(
  fullTemplate,
  variantIndex,
  listingType,
  commissionRatePercent,
) {
  if (listingType === 'sell' || !fullTemplate) return null;
  const model = templateVariantPricingModel(fullTemplate, variantIndex);
  const tiers = rentalTiersFromTemplate(fullTemplate, model, variantIndex);
  const t0 = tiers?.[0];
  if (!t0) return null;
  const hasVendorPrice =
    t0.monthlyRent != null &&
    String(t0.monthlyRent).trim() !== '' &&
    Number(t0.monthlyRent) > 0;
  const raw = hasVendorPrice
    ? String(t0.monthlyRent).trim()
    : computeVendorPriceFromCustomerFallback(
        t0.vendorCost,
        commissionRatePercent,
      );
  if (!raw) return null;
  if (model === 'day') {
    return `₹${raw}/day`;
  }
  return `₹${raw}/month`;
}

/** Green pill with white round check — Catalog Images / Verified Specs headers. */
function GreenVerifiedBadge({ children }) {
  return (
    // <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 py-1 pl-1 pr-2.5 text-xs font-semibold text-white shadow-sm">
    //   <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
    //     <Check className="h-3 w-3 text-green-600" strokeWidth={3} aria-hidden />
    //   </span>
    //   {children}
    // </span>
    <span className="inline-flex items-center gap-1 rounded-full bg-green-600 py-1 pl-1 pr-2.5 text-xs font-semibold text-white shadow-sm">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full ">
        <img src={check.src} alt="check" className="h-4 w-4 object-contain" />
      </span>
      {children}
    </span>
  );
}

function SectionCard({
  icon: Icon,
  title,
  /** Shown directly under the title in the header (e.g. Figma subtitle). */
  subtitle = null,
  /** When true with `icon`, icon is shown in a blue rounded tile like admin Custom Listings. */
  headerIconBoxed = false,
  /** Override default emerald icon color (non-boxed). E.g. `h-5 w-5 shrink-0 text-blue-600`. */
  headerIconClassName = null,
  badge,
  children,
  headerRight,
  className = '',
  showLock = false,
  /** When true, no gray header row — only the card shell + padded body. */
  hideHeader = false,
}) {
  const hasTitle = title != null && String(title).trim() !== '';
  const headerLeftStart = Boolean(subtitle || headerIconBoxed);
  const barAlign = headerLeftStart ? 'items-start' : 'items-center';
  const lockOnlyHeader = showLock && !hasTitle && !Icon;
  /** Icon + title + subtitle: center icon with the text block (Figma). */
  const leftIconTextAlign =
    subtitle && headerIconBoxed && Icon
      ? 'items-center gap-3'
      : headerLeftStart
        ? 'items-start gap-3'
        : 'items-center gap-2';
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {!hideHeader ? (
        <div
          className={`flex ${barAlign} justify-between gap-2 border-b border-gray-100 bg-gray-50/90 px-4 py-3`}
        >
          <div className={`flex min-w-0 flex-1 ${leftIconTextAlign}`}>
            {Icon ? (
              headerIconBoxed ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                </div>
              ) : (
                <Icon
                  className={
                    headerIconClassName ?? 'h-5 w-5 shrink-0 text-emerald-600'
                  }
                  strokeWidth={2}
                />
              )
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                {hasTitle ? (
                  <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                    {title}
                  </h3>
                ) : null}
                {showLock ? (
                  lockOnlyHeader ? (
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm"
                      role="img"
                      aria-label="Catalog images are locked"
                    >
                      <Lock className="h-3 w-3" strokeWidth={2} aria-hidden />
                    </div>
                  ) : (
                    <Lock
                      className="h-3.5 w-3.5 shrink-0 text-gray-400"
                      aria-hidden
                    />
                  )
                ) : null}
              </div>
              {subtitle ? (
                <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {badge != null && badge !== false ? (
              typeof badge === 'string' || typeof badge === 'number' ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  {badge}
                </span>
              ) : (
                badge
              )
            ) : null}
            {headerRight}
          </div>
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function VendorProductAddModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData = null,
  onOpenServiceProduct = null,
  onOpenManualProduct = null,
}) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.vendor?.token);
  const { categories, subCategories } = useSelector((state) => state.category);
  const { products: vendorProductList, loading: vendorProductsLoading } =
    useSelector((state) => state.product);

  const [listingType, setListingType] = useState('rent');
  const [templates, setTemplates] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  /** Search in “Your listed products” (custom listing catalog). */
  const [listedSearchQuery, setListedSearchQuery] = useState('');
  const [listedCategoryFilter, setListedCategoryFilter] = useState('');
  const [listedFilterPanelOpen, setListedFilterPanelOpen] = useState(false);
  const [applyLoadingId, setApplyLoadingId] = useState(null);
  const [marketLowTenures, setMarketLowTenures] = useState({
    month: {},
    day: {},
  });
  const [marketLowLoading, setMarketLowLoading] = useState(false);

  const [customListing, setCustomListing] = useState(false);
  const [fullTemplate, setFullTemplate] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // const [categoryId, setCategoryId] = useState('');
  // const [subCategoryId, setSubCategoryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');

  // Inline "vendor can't find sub-category" quick-create flow
  const [subCatCreateOpen, setSubCatCreateOpen] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatImage, setNewSubCatImage] = useState(null);
  const [newSubCatCommissionRate, setNewSubCatCommissionRate] = useState(15);
  const [creatingSubCat, setCreatingSubCat] = useState(false);

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('Brand New');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState({});
  /** Editable label/value rows when vendor may edit specs (manual listing). */
  const [specRowList, setSpecRowList] = useState([{ label: '', value: '' }]);

  // Which variant's spec grid should be shown in the form.
  // We keep this as the template's variant index (not the filtered list index).
  const [selectedTemplateVariantIndex, setSelectedTemplateVariantIndex] =
    useState(0);

  const [variantIndices, setVariantIndices] = useState([]);
  const [rentalPricingModel, setRentalPricingModel] = useState('month');
  const [allowVendorPriceEdit, setAllowVendorPriceEdit] = useState(false);
  const [rentalTiers, setRentalTiers] = useState(defaultMonthTiers());
  /** Remembers each pricing model's own tiers, so toggling Month-wise/Day-wise
   * in edit mode shows that unit's real ladder + prices (or an empty one),
   * instead of leaking the other unit's labels and prices. */
  const monthTiersBackupRef = useRef(null);
  const dayTiersBackupRef = useRef(null);

  // const switchRentalPricingModel = (nextModel) => {
  //   if (nextModel === rentalPricingModel) return;
  //   if (rentalPricingModel === 'day') {
  //     dayTiersBackupRef.current = rentalTiers;
  //   } else {
  //     monthTiersBackupRef.current = rentalTiers;
  //   }
  //   const restored =
  //     nextModel === 'day'
  //       ? dayTiersBackupRef.current || defaultDayTiers()
  //       : monthTiersBackupRef.current || defaultMonthTiers();
  //   setRentalPricingModel(nextModel);
  //   setRentalTiers(restored);
  // };
  const switchRentalPricingModel = (nextModel) => {
    if (nextModel === rentalPricingModel) return;
    if (rentalPricingModel === 'day') {
      dayTiersBackupRef.current = rentalTiers;
    } else {
      monthTiersBackupRef.current = rentalTiers;
    }
    const isCustomRental =
      mode === 'create' && customListing && listingType === 'rent';
    const restored =
      nextModel === 'day'
        ? dayTiersBackupRef.current ||
          (isCustomRental ? customListingDayTiers() : defaultDayTiers())
        : monthTiersBackupRef.current || defaultMonthTiers();
    setRentalPricingModel(nextModel);
    setRentalTiers(restored);
  };
  const [refundableDeposit, setRefundableDeposit] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [mrpPrice, setMrpPrice] = useState('');
  const [allowVendorSalePriceEdit, setAllowVendorSalePriceEdit] =
    useState(true);

  const [logistics, setLogistics] = useState({
    deliveryTimelineValue: '',
    deliveryTimelineUnit: 'Days',
    inventoryOwnerName: '',
    city: '',
  });
  const [stock, setStock] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  /** Custom listing (no admin template): multiple sellable/rentable SKUs. */
  const [manualVariants, setManualVariants] = useState([]);
  /** When set, full variant editor (media, specs) is shown for this id. */
  const [expandedVariantId, setExpandedVariantId] = useState(null);
  const [selectedManualVariantId, setSelectedManualVariantId] = useState(null);
  const lastHydrateKeyRef = useRef('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Synchronous guard — refs update instantly (unlike state), so this
   * blocks rapid double-clicks that fire before React re-renders the
   * disabled button from `isSubmitting` state. */
  const submitInFlightRef = useRef(false);
  /** When catalog template or variant row changes, reset tenure unit + tiers to admin defaults. */
  const lastTemplateRentalSyncKeyRef = useRef('');

  const createdViaInitial =
    initialData?.createdVia === 'template' ? 'template' : 'manual';
  const isTemplateBased = !!fullTemplate || createdViaInitial === 'template';

  const filteredCategories = useMemo(() => {
    return (categories || []).filter((c) =>
      listingType === 'sell' ? c.availableInBuy : c.availableInRent,
    );
  }, [categories, listingType]);

  const filteredSubCategories = useMemo(() => {
    return (subCategories || []).filter((s) => {
      const matchesListing =
        listingType === 'sell' ? s.availableInBuy : s.availableInRent;
      if (!matchesListing) return false;
      if (!categoryId) return false;
      return String(s.category || '') === String(categoryId);
    });
  }, [subCategories, listingType, categoryId]);

  const getTemplateRefundableDeposit = useCallback((t, variantIdx) => {
    if (!t) return '';

    const parseMoney = (x) => {
      const s = String(x ?? '')
        .replace(/,/g, '')
        .trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    // Prefer template-level value (legacy).
    if (
      t.refundableDeposit != null &&
      parseMoney(t.refundableDeposit) != null &&
      parseMoney(t.refundableDeposit) > 0
    )
      return String(t.refundableDeposit);
    // Otherwise fall back to selected variant value.
    const v =
      Array.isArray(t.variants) && t.variants.length
        ? t.variants[
            Math.max(0, Math.min(variantIdx ?? 0, t.variants.length - 1))
          ]
        : null;
    if (v?.refundableDeposit != null) {
      const vn = parseMoney(v.refundableDeposit);
      if (vn != null && vn > 0) return String(v.refundableDeposit);
    }

    // If both are empty/zero, return template value (may be '0') for stability.
    if (t.refundableDeposit != null) return String(t.refundableDeposit);
    if (v?.refundableDeposit != null) return String(v.refundableDeposit);
    return '0';
  }, []);

  const resetCreateState = useCallback(() => {
    setListingType('rent');
    setSearchQuery('');
    setCustomListing(false);
    setFullTemplate(null);
    setSelectedTemplateId(null);
    setCategoryId('');
    setSubCategoryId('');
    setProductName('');
    setBrand('');
    setCondition('Brand New');
    setShortDescription('');
    setDescription('');
    setSpecs({});
    setSpecRowList([{ label: '', value: '' }]);
    setSelectedTemplateVariantIndex(0);
    setVariantIndices([]);
    setRentalPricingModel('month');
    setAllowVendorPriceEdit(false);
    setRentalTiers(defaultMonthTiers());
    setRefundableDeposit('');
    setSellPrice('');
    setMrpPrice('');
    setAllowVendorSalePriceEdit(true);
    setLogistics({
      deliveryTimelineValue: '',
      deliveryTimelineUnit: 'Days',
      inventoryOwnerName: '',
      city: '',
    });
    setStock('');
    setExistingImages([]);
    setNewImages([]);
    setManualVariants([]);
    setExpandedVariantId(null);
    setListedSearchQuery('');
    setListedCategoryFilter('');
    setListedFilterPanelOpen(false);
    setMarketLowTenures({ month: {}, day: {} });
    setMarketLowLoading(false);
  }, []);

  const hydrateFromVendorProduct = useCallback((p) => {
    // setCustomListing(false);
    // setFullTemplate(null);
    // setSelectedTemplateId(null);
    setFullTemplate(null);
    setSelectedTemplateId(null);
    setListingType(String(p.type || 'Rental') === 'Sell' ? 'sell' : 'rent');
    setProductName(p.productName || '');
    setBrand(p.brand || '');
    setCondition(
      normalizeConditionForListingType(
        p.condition,
        String(p.type || 'Rental') === 'Sell' ? 'Sell' : 'Rental',
        String(p.type || 'Rental') !== 'Sell' && p.createdVia !== 'template',
      ),
    );
    setShortDescription(p.shortDescription || '');
    setDescription(p.description || '');
    const specObj =
      p.specifications && typeof p.specifications === 'object'
        ? { ...p.specifications }
        : {};
    setSpecs(specObj);
    const specRows = Object.entries(specObj).map(([label, value]) => ({
      label,
      value: String(value ?? ''),
    }));
    setSpecRowList(specRows.length ? specRows : [{ label: '', value: '' }]);
    setExistingImages(
      Array.isArray(p.images) && p.images.length
        ? p.images.filter(Boolean).slice(0, 10)
        : p.image
          ? [p.image]
          : [],
    );
    setNewImages([]);
    const nVar = Array.isArray(p.variants) ? p.variants.length : 0;
    setVariantIndices(nVar ? Array.from({ length: nVar }, (_, i) => i) : []);
    setSelectedTemplateVariantIndex(0);
    // Existing listings: treat anything that is not explicitly "template" as manual.
    const createdVia = p.createdVia === 'template' ? 'template' : 'manual';
    if (createdVia === 'manual') {
      setAllowVendorPriceEdit(true);
    } else if (p.allowVendorEditRentalPrices !== undefined) {
      setAllowVendorPriceEdit(p.allowVendorEditRentalPrices !== false);
    } else {
      // Template-based: always respect whatever admin saved
      setAllowVendorPriceEdit(p.allowVendorEditRentalPrices !== false);
    }
    // const rc = Array.isArray(p.rentalConfigurations)
    //   ? p.rentalConfigurations
    //   : [];
    // const model =
    //   rc.length && rc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
    // setRentalPricingModel(model);
    // if (rc.length) {
    //   setRentalTiers(
    //     rc.slice(0, 6).map((cfg, i) => ({
    //       months: toNum(cfg.months, model === 'day' ? 0 : [3, 6, 12][i] || 3),
    //       days: toNum(cfg.days, 0),
    //       label: String(cfg.label || ''),
    //       tierLabel: '',
    //       monthlyRent: String(
    //         cfg.customerRent != null && cfg.customerRent !== ''
    //           ? cfg.customerRent
    //           : (cfg.pricePerDay ?? ''),
    //       ),
    //       shippingCharges: String(cfg.shippingCharges ?? ''),
    //       bestValue: i === 2,
    //     })),
    //   );
    // } else {
    //   setRentalTiers(model === 'day' ? defaultDayTiers() : defaultMonthTiers());
    // }
    const rc = Array.isArray(p.rentalConfigurations)
      ? p.rentalConfigurations
      : [];
    const model =
      rc.length && rc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
    setRentalPricingModel(model);
    // Clear any leftover backup from a previously edited product, then store
    // this product's real saved tiers under its own unit only. The OTHER
    // unit starts with no backup, so toggling to it shows an empty default
    // ladder (3/5/7 days or 3/6/9 months) instead of stale data.
    monthTiersBackupRef.current = null;
    dayTiersBackupRef.current = null;
    // const hydratedTiers = rc.length
    //   ? rc.slice(0, 6).map((cfg, i) => ({
    //       months: toNum(cfg.months, model === 'day' ? 0 : [3, 6, 12][i] || 3),
    //       days: toNum(cfg.days, 0),
    //       label: String(cfg.label || ''),
    //       tierLabel: '',
    //       monthlyRent: String(
    //         cfg.customerRent != null && cfg.customerRent !== ''
    //           ? cfg.customerRent
    //           : (cfg.pricePerDay ?? ''),
    //       ),
    //       shippingCharges: String(cfg.shippingCharges ?? ''),
    //       bestValue: i === 2,
    //     }))
    //   : model === 'day'
    //     ? defaultDayTiers()
    //     : defaultMonthTiers();
    const hydratedTiers = rc.length
      ? rc.slice(0, 6).map((cfg, i) => ({
          months: toNum(cfg.months, model === 'day' ? 0 : [3, 6, 12][i] || 3),
          days: toNum(cfg.days, 0),
          label: String(cfg.label || ''),
          tierLabel: '',
          // Edit mode must show the VENDOR's own price (what they'll see
          // and can re-edit), never the customer-facing price.
          //     monthlyRent: String(
          //       cfg.vendorRent != null && cfg.vendorRent !== ''
          //         ? cfg.vendorRent
          //         : cfg.customerRent != null && cfg.customerRent !== ''
          //           ? cfg.customerRent
          //           : (cfg.pricePerDay ?? ''),
          //     ),
          //     shippingCharges: String(cfg.shippingCharges ?? ''),
          //     bestValue: i === 2,
          //   }))
          // : model === 'day'
          //   ? defaultDayTiers()
          //   : defaultMonthTiers();
          monthlyRent:
            Number(cfg.vendorRent) > 0 ? String(cfg.vendorRent) : '',
          vendorCost:
            cfg.customerRent != null && String(cfg.customerRent).trim() !== ''
              ? String(cfg.customerRent)
              : '',
          shippingCharges: String(cfg.shippingCharges ?? ''),
          bestValue: i === 2,
        }))
      : model === 'day'
        ? defaultDayTiers()
        : defaultMonthTiers();
    setRentalTiers(hydratedTiers);
    if (model === 'day') {
      dayTiersBackupRef.current = hydratedTiers;
    } else {
      monthTiersBackupRef.current = hydratedTiers;
    }
    setRefundableDeposit(
      p.refundableDeposit != null ? String(p.refundableDeposit) : '',
    );
    setSellPrice(
      p.salesConfiguration?.salePrice != null
        ? String(p.salesConfiguration.salePrice)
        : '',
    );
    setMrpPrice(
      p.salesConfiguration?.mrpPrice != null
        ? String(p.salesConfiguration.mrpPrice)
        : '',
    );
    setAllowVendorSalePriceEdit(
      p.salesConfiguration?.allowVendorEditSalePrice !== false,
    );
    const lv = p.logisticsVerification || {};
    setLogistics({
      deliveryTimelineValue:
        lv.deliveryTimelineValue != null
          ? String(lv.deliveryTimelineValue)
          : '',
      deliveryTimelineUnit: lv.deliveryTimelineUnit || 'Days',
      inventoryOwnerName: lv.inventoryOwnerName || '',
      city: lv.city || '',
    });
    // setStock(p.stock != null ? String(p.stock) : '');
    setStock(p.stock != null && Number(p.stock) > 0 ? String(p.stock) : '');
    const vList = Array.isArray(p.variants) ? p.variants : [];

    const allImages =
      Array.isArray(p.images) && p.images.length
        ? p.images.filter(Boolean)
        : p.image
          ? [p.image]
          : [];

    // if (vList.length) {
    //   setManualVariants(
    //     vList.map((v) => {
    //       const vsRows = Array.isArray(v.variantSpecs)
    //         ? v.variantSpecs.map((r) => ({
    //             label: String(r?.label || ''),
    //             value: String(r?.value ?? ''),
    //           }))
    //         : [];
    //       return {
    //         id: genLocalId(),
    //         variantName: String(v.variantName || '').trim(),
    //         stock: v.stock != null ? String(v.stock) : '',
    //         existingImages: [],
    //         newImages: [],
    //         specRows: vsRows.length > 0 ? vsRows : [emptyVariantSpecRow()],
    //       };
    //     }),
    //   );
    // } else {
    //   setManualVariants([]);
    //   setExpandedVariantId(null);
    // }
    if (vList.length) {
      const allImages =
        Array.isArray(p.images) && p.images.length
          ? p.images.filter(Boolean)
          : p.image
            ? [p.image]
            : [];

      // Legacy products (saved before per-variant images existed) have NO
      // variant with its own `images` — only then do we fall back to
      // slicing the old shared `product.images` pool, so old listings keep
      // showing their photos. Once ANY variant has real per-variant images
      // (new listings, or ones already re-saved), we stop slicing entirely
      // to avoid the old bleeding-between-variants bug.
      const anyVariantHasOwnImages = vList.some(
        (v) => Array.isArray(v.images) && v.images.length > 0,
      );

      const hydrated = vList.map((v, idx) => {
        const vsRows = Array.isArray(v.variantSpecs)
          ? v.variantSpecs.map((r) => ({
              label: String(r?.label || ''),
              value: String(r?.value ?? ''),
            }))
          : [];

        // Per-variant images: use this variant's own saved images. Only for
        // fully-legacy products (no variant has its own images at all) do
        // we fall back to slicing the shared pool, purely so old listings
        // don't suddenly show blank.
        const variantImgs =
          Array.isArray(v.images) && v.images.length
            ? v.images.filter(Boolean)
            : anyVariantHasOwnImages
              ? []
              : vList.length === 1
                ? allImages
                : (() => {
                    if (!allImages.length) return [];
                    const perV = Math.ceil(allImages.length / vList.length);
                    return allImages.slice(idx * perV, idx * perV + perV);
                  })();

        const vRc = Array.isArray(v.rentalConfigurations)
          ? v.rentalConfigurations
          : [];
        const vModel =
          vRc.length && vRc.some((c) => c.periodUnit === 'day')
            ? 'day'
            : vRc.length
              ? 'month'
              : 'day';
        // const vTiers = vRc.length
        //   ? vRc.slice(0, 6).map((cfg, i) => ({
        //       months: toNum(cfg.months, 0),
        //       days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
        //       label: String(cfg.label || ''),
        //       tierLabel: '',
        //       monthlyRent: String(
        //         cfg.customerRent != null && cfg.customerRent !== ''
        //           ? cfg.customerRent
        //           : (cfg.pricePerDay ?? ''),
        //       ),
        //       shippingCharges: String(cfg.shippingCharges ?? ''),
        //       bestValue: i === vRc.length - 1,
        //     }))
        //   : customListingDayTiers();

        const vTiers = vRc.length
          ? vRc.slice(0, 6).map((cfg, i) => ({
              months: toNum(cfg.months, 0),
              days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
              label: String(cfg.label || ''),
              tierLabel: '',
              // Edit mode must show the VENDOR's own price, never the
              // customer-facing price.
              //     monthlyRent: String(
              //       cfg.vendorRent != null && cfg.vendorRent !== ''
              //         ? cfg.vendorRent
              //         : cfg.customerRent != null && cfg.customerRent !== ''
              //           ? cfg.customerRent
              //           : (cfg.pricePerDay ?? ''),
              //     ),
              //     shippingCharges: String(cfg.shippingCharges ?? ''),
              //     bestValue: i === vRc.length - 1,
              //   }))
              // : customListingDayTiers();
              monthlyRent: String(
                Number(cfg.vendorRent) > 0
                  ? cfg.vendorRent
                  : cfg.customerRent != null && cfg.customerRent !== ''
                    ? cfg.customerRent
                    : (cfg.pricePerDay ?? ''),
              ),
              shippingCharges: String(cfg.shippingCharges ?? ''),
              bestValue: i === vRc.length - 1,
            }))
          : customListingDayTiers();

        return {
          id: genLocalId(),
          variantName: String(v.variantName || '').trim(),
          stock: v.stock != null ? String(v.stock) : '',
          existingImages: variantImgs, // ← NOW POPULATED
          newImages: [],
          specRows: vsRows.length > 0 ? vsRows : [emptyVariantSpecRow()],
          sellPrice:
            v.sellPrice != null
              ? String(v.sellPrice)
              : v.price != null
                ? String(v.price)
                : '',
          mrpPrice: v.mrpPrice != null ? String(v.mrpPrice) : '',
          rentalPricingModel: vModel,
          rentalTiers: vTiers,
        };
      });

      setManualVariants(hydrated);
      // Auto-select first variant for edit mode
      setSelectedManualVariantId(hydrated[0]?.id ?? null);
    } else {
      setManualVariants([]);
      setExpandedVariantId(null);
      setSelectedManualVariantId(null);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(getCategories());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen || !token) return;
    setLoadingList(true);
    apiGetVendorListingTemplates(token, {
      type: listingType === 'sell' ? 'sell' : 'rental',
    })
      .then((res) =>
        setTemplates(
          (res.data?.listingTemplates || []).filter(
            adminTemplateAllowedForVendor,
          ),
        ),
      )
      .catch(() => setTemplates([]))
      .finally(() => setLoadingList(false));
  }, [isOpen, token, listingType]);

  useEffect(() => {
    if (!isOpen) {
      lastHydrateKeyRef.current = '';
      return;
    }
    const hydrateKey = `${mode}:${initialData?._id ?? 'new'}`;
    if (lastHydrateKeyRef.current === hydrateKey) return;
    lastHydrateKeyRef.current = hydrateKey;

    if (mode === 'edit' && initialData) {
      hydrateFromVendorProduct(initialData);
    } else if (mode === 'create') {
      resetCreateState();
    }
  }, [
    isOpen,
    mode,
    initialData?._id,
    hydrateFromVendorProduct,
    resetCreateState,
  ]);

  useEffect(() => {
    if (!isOpen || mode !== 'create') return;
    dispatch(getMyProducts());
  }, [isOpen, mode, dispatch]);

  useEffect(() => {
    if (!categoryId) return;
    dispatch(getSubCategories(categoryId));
  }, [categoryId, dispatch]);

  const categoryName = useMemo(() => {
    if (fullTemplate?.category) return fullTemplate.category;
    const c = categories.find((x) => x._id === categoryId);
    return c?.name || '';
  }, [fullTemplate, categories, categoryId]);

  /**
   * Standard/template listing only: if a tier's Vendor configuration price
   * is missing (admin only set Customer configuration), fall back to
   * customerRent minus this product's category commission %, instead of
   * showing an empty box. Tiers that already have a real vendor price are
   * returned unchanged.
   */
  const applyVendorPriceCommissionFallback = (tiers) => {
    const rate = categories.find(
      (c) => c.name === categoryName,
    )?.commissionRate;
    return (tiers || []).map((t) => {
      const hasVendorPrice =
        t.monthlyRent !== '' &&
        t.monthlyRent != null &&
        String(t.monthlyRent).trim() !== '' &&
        Number(t.monthlyRent) > 0;
      if (hasVendorPrice) return t;
      const fallback = computeVendorPriceFromCustomerFallback(
        t.vendorCost,
        rate,
      );
      return fallback ? { ...t, monthlyRent: fallback } : t;
    });
  };

  const subCategoryName = useMemo(() => {
    if (fullTemplate?.subCategory) return fullTemplate.subCategory;
    const s = subCategories.find((x) => x._id === subCategoryId);
    return s?.name || '';
  }, [fullTemplate, subCategories, subCategoryId]);

  useEffect(() => {
    if (!fullTemplate || !Array.isArray(categories) || !categories.length)
      return;
    const cn = String(fullTemplate.category || '').trim();
    if (!cn) return;
    const c = categories.find((x) => namesMatch(x.name, cn));
    if (c) setCategoryId(c._id);
  }, [fullTemplate, categories]);

  useEffect(() => {
    if (!fullTemplate || !Array.isArray(subCategories)) return;
    const sn = String(fullTemplate.subCategory || '').trim();
    if (!sn || !categoryId) return;
    const s = subCategories.find((x) => namesMatch(x.name, sn));
    if (s) setSubCategoryId(s._id);
  }, [fullTemplate, subCategories, categoryId]);

  // const filteredTemplates = useMemo(() => {
  //   const q = searchQuery.trim().toLowerCase();
  //   return templates.filter(adminTemplateAllowedForVendor).filter((t) => {
  //     if (!q) return true;
  //     return (
  //       String(t.productName || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       String(t.sku || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       String(t.category || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       String(t.subCategory || '')
  //         .toLowerCase()
  //         .includes(q)
  //     );
  //   });
  // }, [templates, searchQuery]);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const catName = String(categoryName || '')
      .trim()
      .toLowerCase();
    const subName = String(subCategoryName || '')
      .trim()
      .toLowerCase();
    return templates
      .filter(adminTemplateAllowedForVendor)
      .filter((t) => {
        if (catName) {
          const tCat = String(t.category || '')
            .trim()
            .toLowerCase();
          if (tCat !== catName) return false;
        }
        if (subName) {
          const tSub = String(t.subCategory || '')
            .trim()
            .toLowerCase();
          if (tSub !== subName) return false;
        }
        return true;
      })
      .filter((t) => {
        if (!q) return true;
        return (
          String(t.productName || '')
            .toLowerCase()
            .includes(q) ||
          String(t.sku || '')
            .toLowerCase()
            .includes(q) ||
          String(t.category || '')
            .toLowerCase()
            .includes(q) ||
          String(t.subCategory || '')
            .toLowerCase()
            .includes(q)
        );
      });
  }, [templates, searchQuery, categoryName, subCategoryName]);
  // const vendorProductsForActiveListing = useMemo(() => {
  //   const list = Array.isArray(vendorProductList) ? vendorProductList : [];
  //   return list.filter((p) =>
  //     listingType === 'sell'
  //       ? String(p?.type || '') === 'Sell'
  //       : String(p?.type || '') !== 'Sell',
  //   );
  // }, [vendorProductList, listingType]);
  const vendorProductsForActiveListing = useMemo(() => {
    const list = Array.isArray(vendorProductList) ? vendorProductList : [];
    return list.filter((p) =>
      listingType === 'sell'
        ? String(p?.type || '') === 'Sell'
        : String(p?.type || '') !== 'Sell',
    );
  }, [vendorProductList, listingType]);

  /**
   * Templates the vendor has already added as a product (in a previous
   * session/visit), keyed by name+category+sub-category since we don't
   * store the source template id on the saved product. Used to keep the
   * "Add" button disabled/"Added" across modal re-opens, not just for the
   * current session's `selectedTemplateId`.
   */
  const alreadyAddedTemplateKeys = useMemo(() => {
    const set = new Set();
    for (const p of vendorProductsForActiveListing) {
      if (p?.createdVia !== 'template') continue;
      const key = `${String(p.productName || '')
        .trim()
        .toLowerCase()}|${String(p.category || '')
        .trim()
        .toLowerCase()}|${String(p.subCategory || '')
        .trim()
        .toLowerCase()}`;
      set.add(key);
    }
    return set;
  }, [vendorProductsForActiveListing]);

  const listedCategoryOptions = useMemo(() => {
    const s = new Set();
    for (const p of vendorProductsForActiveListing) {
      const c = String(p?.category || '').trim();
      if (c) s.add(c);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [vendorProductsForActiveListing]);

  // const filteredListedProducts = useMemo(() => {
  //   let rows = vendorProductsForActiveListing;
  //   if (listedCategoryFilter) {
  //     rows = rows.filter(
  //       (p) => String(p?.category || '') === listedCategoryFilter,
  //     );
  //   }
  //   const q = listedSearchQuery.trim().toLowerCase();
  //   if (!q) return rows;
  //   return rows.filter((p) => {
  //     const id = String(p?._id || '').toLowerCase();
  //     return (
  //       String(p?.productName || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       String(p?.category || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       String(p?.subCategory || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       id.includes(q)
  //     );
  //   });
  // }, [vendorProductsForActiveListing, listedCategoryFilter, listedSearchQuery]);

  const filteredListedProducts = useMemo(() => {
    let rows = vendorProductsForActiveListing;
    // Custom listing: auto-narrow to the category/sub-category the vendor
    // just picked in "What are you renting/listing?" above, so this table
    // shows only relevant reference products for that selection.
    if (mode === 'create' && customListing) {
      const catName = String(categoryName || '')
        .trim()
        .toLowerCase();
      const subName = String(subCategoryName || '')
        .trim()
        .toLowerCase();
      if (catName) {
        rows = rows.filter(
          (p) =>
            String(p?.category || '')
              .trim()
              .toLowerCase() === catName,
        );
      }
      if (subName) {
        rows = rows.filter(
          (p) =>
            String(p?.subCategory || '')
              .trim()
              .toLowerCase() === subName,
        );
      }
    }
    if (listedCategoryFilter) {
      rows = rows.filter(
        (p) => String(p?.category || '') === listedCategoryFilter,
      );
    }
    const q = listedSearchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const id = String(p?._id || '').toLowerCase();
      return (
        String(p?.productName || '')
          .toLowerCase()
          .includes(q) ||
        String(p?.category || '')
          .toLowerCase()
          .includes(q) ||
        String(p?.subCategory || '')
          .toLowerCase()
          .includes(q) ||
        id.includes(q)
      );
    });
  }, [
    vendorProductsForActiveListing,
    listedCategoryFilter,
    listedSearchQuery,
    mode,
    customListing,
    categoryName,
    subCategoryName,
  ]);

  const applyTemplate = async (row) => {
    if (!token) return;
    setApplyLoadingId(row._id);
    try {
      const res = await apiGetVendorListingTemplateByType(
        row._id,
        token,
        listingType === 'sell' ? 'sell' : 'rental',
      );
      const t = res.data?.listingTemplate;
      if (!t) {
        toast.error('Template not found.');
        return;
      }
      setCustomListing(false);
      setListedSearchQuery('');
      setListedCategoryFilter('');
      setListedFilterPanelOpen(false);
      setManualVariants([]);
      setExpandedVariantId(null);
      setFullTemplate(t);
      setSelectedTemplateId(t._id);
      setProductName(t.productName || '');
      setBrand(t.brand || '');
      setCondition(
        normalizeConditionForListingType(
          t.condition,
          listingType === 'sell' ? 'Sell' : 'Rental',
          false,
        ),
      );
      setShortDescription(t.shortDescription || '');
      setDescription(t.description || '');
      // setSpecs(specsObjectFromTemplate(t));
      // setExistingImages(galleryFromTemplate(t));
      const templateSpecsObj = specsObjectFromTemplate(t);
      setSpecs(templateSpecsObj);
      // Also populate the editable spec ROWS (not just the specs object),
      // otherwise the sync effect below rebuilds `specs` from the still-empty
      // default row and wipes out what we just set from the template.
      const templateSpecRows = Object.entries(templateSpecsObj).map(
        ([label, value]) => ({ label, value: String(value ?? '') }),
      );
      setSpecRowList(
        templateSpecRows.length ? templateSpecRows : [{ label: '', value: '' }],
      );
      setExistingImages(galleryFromTemplate(t));
      setNewImages([]);
      const n = Array.isArray(t.variants) ? t.variants.length : 0;
      setVariantIndices(n ? Array.from({ length: n }, (_, i) => i) : []);
      setSelectedTemplateVariantIndex(0);
      // const vModel =
      //   t.variants?.[0]?.rentalPricingModel === 'day' ? 'day' : 'month';
      // setRentalPricingModel(vModel);
      const vModel = templateVariantPricingModel(t, 0);
      setRentalPricingModel(vModel);
      // if (listingType === 'sell') {
      //   setSellPrice(
      //     t.salesConfiguration?.salePrice != null
      //       ? String(t.salesConfiguration.salePrice)
      //       : '',
      //   );
      //   setMrpPrice(
      //     t.salesConfiguration?.mrpPrice != null
      //       ? String(t.salesConfiguration.mrpPrice)
      //       : '',
      //   );
      //   setAllowVendorSalePriceEdit(
      //     t.salesConfiguration?.allowVendorEditSalePrice !== false,
      //   );
      // } else {
      if (listingType === 'sell') {
        const v0SaleConfig = getTemplateVariantSaleConfig(t, 0);
        setSellPrice(v0SaleConfig.sellPrice);
        setMrpPrice(v0SaleConfig.mrpPrice);
        setAllowVendorSalePriceEdit(v0SaleConfig.allowVendorEditSalePrice);
        // } else {
        //   const canEdit = (() => {
        //     // Root-level flag is the authoritative source (set by admin toggle)
        //     if (t.allowVendorEditRentalPrices !== undefined) {
        //       return t.allowVendorEditRentalPrices !== false;
        //     }
        //     // Fallback: if root is unset, check if ALL variants explicitly allow editing
        //     const variantsArr = Array.isArray(t.variants) ? t.variants : [];
        //     if (variantsArr.length === 0) return false;
        //     return variantsArr.every(
        //       (v) => v && v.allowVendorEditRentalPrices !== false,
        //     );
        //   })();
        //   setAllowVendorPriceEdit(canEdit);
        //   setRefundableDeposit(getTemplateRefundableDeposit(t, 0));
        // }
      } else {
        const canEdit = getTemplateVariantAllowEdit(t, 0);
        setAllowVendorPriceEdit(canEdit);
        setRefundableDeposit(getTemplateRefundableDeposit(t, 0));
      }
      const lv = t.logisticsVerification || {};
      setLogistics((prev) => ({
        ...prev,
        inventoryOwnerName: lv.inventoryOwnerName || prev.inventoryOwnerName,
        city: lv.city || prev.city,
      }));
      // setStock(t.stock != null ? String(t.stock) : '');
      // toast.success('Template loaded. Review logistics and submit.');
      setStock(t.stock != null && Number(t.stock) > 0 ? String(t.stock) : '');
      toast.success('Template loaded. Review logistics and submit.');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load template.');
    } finally {
      setApplyLoadingId(null);
    }
  };

  // const onCustomListing = () => {
  //   const nextType = listingType;
  //   resetCreateState();
  //   setListingType(nextType);
  //   setCustomListing(true);
  //   setFullTemplate(null);
  //   setSelectedTemplateId(null);
  // };

  const onCustomListing = () => {
    const nextType = listingType;
    const prevCategoryId = categoryId;
    const prevSubCategoryId = subCategoryId;
    resetCreateState();
    setListingType(nextType);
    setCustomListing(true);
    setFullTemplate(null);
    setSelectedTemplateId(null);
    if (prevCategoryId) setCategoryId(prevCategoryId);
    if (prevSubCategoryId) setSubCategoryId(prevSubCategoryId);
  };

  const handleCreateSubCategory = async () => {
    if (!newSubCatName.trim()) {
      toast.error('Enter a sub-category name.');
      return;
    }
    if (!categoryId) {
      toast.error('Select a main category first.');
      return;
    }
    if (!newSubCatImage) {
      toast.error('Add a sub-category image.');
      return;
    }
    setCreatingSubCat(true);
    try {
      const fd = new FormData();
      fd.append('name', newSubCatName.trim());
      fd.append('categoryId', categoryId);
      fd.append('image', newSubCatImage);
      fd.append('commissionRate', String(newSubCatCommissionRate || 0));
      const res = await apiVendorCreateSubCategory(fd, token);
      const created = res?.data?.subCategory;
      toast.success('Sub-category created.');
      // Refresh subcategories for this category so the new one shows up as a tile
      await dispatch(getSubCategories(categoryId));
      if (created?._id) setSubCategoryId(created._id);
      setSubCatCreateOpen(false);
      setNewSubCatName('');
      setNewSubCatImage(null);
      setNewSubCatCommissionRate(15);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || 'Failed to create sub-category.',
      );
    } finally {
      setCreatingSubCat(false);
    }
  };

  const removeVariantIndex = (idx) => {
    setVariantIndices((prev) => {
      const next = prev.filter((i) => i !== idx);
      // If the currently selected variant is removed, fall back to the first remaining one.
      if (idx === selectedTemplateVariantIndex) {
        setSelectedTemplateVariantIndex(next[0] ?? 0);
      }
      return next;
    });
  };

  useEffect(() => {
    if (fullTemplate) {
      const vCount = Array.isArray(fullTemplate.variants)
        ? fullTemplate.variants.length
        : 0;
      if (!vCount) return;
      setSpecs(
        specsObjectFromTemplate(fullTemplate, selectedTemplateVariantIndex),
      );
      return;
    }
    // Edit mode: read specs from the selected variant's variantSpecs
    if (
      mode === 'edit' &&
      isTemplateBased &&
      Array.isArray(initialData?.variants)
    ) {
      // const v = initialData.variants[selectedTemplateVariantIndex];
      // if (!v) return;
      // const specObj = {};
      // // Primary: per-variant variantSpecs rows
      // if (Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0) {
      //   v.variantSpecs.forEach((row) => {
      //     const k = String(row?.label || '').trim();
      //     if (k) specObj[k] = String(row?.value ?? '').trim();
      //   });
      // } else {
      //   // Fallback: top-level specifications (same for all variants)
      //   if (
      //     initialData.specifications &&
      //     typeof initialData.specifications === 'object'
      //   ) {
      //     Object.entries(initialData.specifications).forEach(([k, val]) => {
      //       const clean = String(k || '').trim();
      //       if (clean) specObj[clean] = String(val ?? '').trim();
      //     });
      //   }
      // }
      // setSpecs(specObj);
      const v = initialData.variants[selectedTemplateVariantIndex];
      if (!v) return;
      const specObj = {};

      // 1. variantSpecs rows (populated after Fix 1, or for already-saved products)
      if (Array.isArray(v.variantSpecs) && v.variantSpecs.length > 0) {
        v.variantSpecs.forEach((row) => {
          const k = String(row?.label || '').trim();
          if (k) specObj[k] = String(row?.value ?? '').trim();
        });
      }

      // 2. Direct color/storage/ram fields (template-based products with these fields)
      if (String(v.color || '').trim())
        specObj['Color'] = String(v.color).trim();
      if (String(v.storage || '').trim())
        specObj['Storage'] = String(v.storage).trim();
      if (String(v.ram || '').trim()) specObj['RAM'] = String(v.ram).trim();

      // 3. If still nothing found, use top-level specifications as last resort
      if (Object.keys(specObj).length === 0) {
        if (
          initialData.specifications &&
          typeof initialData.specifications === 'object'
        ) {
          Object.entries(initialData.specifications).forEach(([k, val]) => {
            const clean = String(k || '').trim();
            if (clean) specObj[clean] = String(val ?? '').trim();
          });
        }
      }

      setSpecs(specObj);
    }
  }, [
    fullTemplate,
    selectedTemplateVariantIndex,
    mode,
    isTemplateBased,
    initialData,
  ]);

  // Update refundable deposit when the selected template variant changes
  // (create mode only). Some templates store refundable deposit at variant level.
  useEffect(() => {
    if (mode !== 'create') return;
    if (!fullTemplate) return;
    setRefundableDeposit(
      getTemplateRefundableDeposit(fullTemplate, selectedTemplateVariantIndex),
    );
  }, [
    mode,
    fullTemplate,
    selectedTemplateVariantIndex,
    getTemplateRefundableDeposit,
  ]);

  // Sync per-variant sell price/MRP/lock when the selected admin sell
  // template variant changes — mirrors how rental tiers sync above, so
  // each variant shows and locks its own Sales Configuration instead of
  // one shared value across every variant.
  // useEffect(() => {
  //   if (listingType !== 'sell') return;
  //   if (!fullTemplate) return;
  //   const cfg = getTemplateVariantSaleConfig(
  //     fullTemplate,
  //     selectedTemplateVariantIndex,
  //   );
  //   setSellPrice(cfg.sellPrice);
  //   setMrpPrice(cfg.mrpPrice);
  //   setAllowVendorSalePriceEdit(cfg.allowVendorEditSalePrice);
  // }, [listingType, fullTemplate, selectedTemplateVariantIndex]);

  useEffect(() => {
    if (listingType !== 'sell') return;
    if (!fullTemplate) return;
    const cfg = getTemplateVariantSaleConfig(
      fullTemplate,
      selectedTemplateVariantIndex,
    );
    setSellPrice(cfg.sellPrice);
    setMrpPrice(cfg.mrpPrice);
    setAllowVendorSalePriceEdit(cfg.allowVendorEditSalePrice);
  }, [listingType, fullTemplate, selectedTemplateVariantIndex]);

  // Keep rental "Allow vendors to edit prices" lock in sync with the
  // currently selected template variant (mirrors the Sell sync above),
  // so switching variants respects each variant's own admin toggle.
  useEffect(() => {
    if (listingType === 'sell') return;
    if (!fullTemplate) return;
    if (mode !== 'create') return;
    setAllowVendorPriceEdit(
      getTemplateVariantAllowEdit(fullTemplate, selectedTemplateVariantIndex),
    );
  }, [listingType, fullTemplate, selectedTemplateVariantIndex, mode]);

  // EDIT MODE FIX: when editing an existing template-based sell product
  // (fullTemplate is null here because it wasn't reloaded from the catalog),
  // Sales Configuration must be re-read from the SELECTED VARIANT's own
  // sellPrice/mrpPrice whenever the user switches variants — otherwise the
  // form kept showing whatever variant was hydrated first for every row.
  useEffect(() => {
    if (mode !== 'edit') return;
    if (fullTemplate) return; // handled by the effect above
    if (listingType !== 'sell') return;
    if (!isTemplateBased) return;
    if (!Array.isArray(initialData?.variants) || !initialData.variants.length)
      return;

    const v = initialData.variants[selectedTemplateVariantIndex];
    if (!v) return;

    const parseMoney = (x) => {
      const s = String(x ?? '')
        .replace(/,/g, '')
        .trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    const vSell = parseMoney(v.sellPrice);
    const vMrp = parseMoney(v.mrpPrice);

    setSellPrice(vSell != null && vSell > 0 ? String(vSell) : '');
    setMrpPrice(vMrp != null && vMrp > 0 ? String(vMrp) : '');
    setAllowVendorSalePriceEdit(
      initialData?.salesConfiguration?.allowVendorEditSalePrice !== false,
    );
  }, [
    mode,
    fullTemplate,
    listingType,
    isTemplateBased,
    initialData,
    selectedTemplateVariantIndex,
  ]);

  // const addRentalTier = () => {
  //   setRentalTiers((prev) => {
  //     const last = prev[prev.length - 1];
  //     if (rentalPricingModel === 'day') {
  //       const d = (last?.days || 7) + 2;
  //       return [
  //         ...prev,
  //         {
  //           months: 0,
  //           days: d,
  //           label: `${d} Days`,
  //           tierLabel: 'CUSTOM',
  //           monthlyRent: '',
  //           shippingCharges: '',
  //           bestValue: false,
  //         },
  //       ];
  //     }
  //     const m = (last?.months || 12) + 3;
  //     return [
  //       ...prev,
  //       {
  //         months: m,
  //         days: 0,
  //         label: `${m} Months`,
  //         tierLabel: 'CUSTOM',
  //         monthlyRent: '',
  //         shippingCharges: '',
  //         bestValue: false,
  //       },
  //     ];
  //   });
  // };

  // const addRentalTier = () => {
  //   setRentalTiers((prev) => {
  //     const last = prev[prev.length - 1];
  //     if (rentalPricingModel === 'day') {
  //       const d = (last?.days || 7) + 2;
  //       next = [
  //         ...prev,
  //         {
  //           months: 0,
  //           days: d,
  //           label: `${d} Days`,
  //           tierLabel: 'CUSTOM',
  //           monthlyRent: '',
  //           shippingCharges: '',
  //           bestValue: false,
  //         },
  //       ];
  //     } else {
  //       const m = (last?.months || 12) + 3;
  //       next = [
  //         ...prev,
  //         {
  //           months: m,
  //           days: 0,
  //           label: `${m} Months`,
  //           tierLabel: 'CUSTOM',
  //           monthlyRent: '',
  //           shippingCharges: '',
  //           bestValue: false,
  //         },
  //       ];
  //     }
  //     const m = (last?.months || 12) + 3;
  //     return [
  //       ...prev,
  //       {
  //         months: m,
  //         days: 0,
  //         label: `${m} Months`,
  //         tierLabel: 'CUSTOM',
  //         monthlyRent: '',
  //         shippingCharges: '',
  //         bestValue: false,
  //       },
  //     ];
  //   });
  // };

  const addRentalTier = () => {
    setRentalTiers((prev) => {
      const last = prev[prev.length - 1];
      if (rentalPricingModel === 'day') {
        const d = (last?.days || 7) + 2;
        return [
          ...prev,
          {
            months: 0,
            days: d,
            label: `${d} Days`,
            tierLabel: 'CUSTOM',
            monthlyRent: '',
            shippingCharges: '',
            bestValue: false,
          },
        ];
      }
      const m = (last?.months || 12) + 3;
      return [
        ...prev,
        {
          months: m,
          days: 0,
          label: `${m} Months`,
          tierLabel: 'CUSTOM',
          monthlyRent: '',
          shippingCharges: '',
          bestValue: false,
        },
      ];
    });
  };

  // const removeRentalTier = (i) => {
  //   setRentalTiers((prev) =>
  //     prev.length <= 1 ? prev : prev.filter((_, j) => j !== i),
  //   );
  // };
  const removeRentalTier = (i) => {
    setRentalTiers((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, j) => j !== i);
      next.forEach((t) => (t.bestValue = false));
      if (next.length > 0) next[next.length - 1].bestValue = true;
      return next;
    });
  };

  const updateTier = (i, field, value) => {
    setRentalTiers((prev) =>
      prev.map((row, j) => (j === i ? { ...row, [field]: value } : row)),
    );
  };

  const patchTier = (i, patch) => {
    setRentalTiers((prev) =>
      prev.map((row, j) => (j === i ? { ...row, ...patch } : row)),
    );
  };

  // const updateSpecRow = (idx, field, value) => {
  //   setSpecRowList((prev) =>
  //     prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
  //   );
  // };
  const updateSpecRow = (idx, field, value) => {
    setSpecRowList((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
    // In manual edit, also persist to the variant's specRows
    if (mode === 'edit' && !isTemplateBased && activeManualVariantId) {
      setManualVariants((prev) =>
        prev.map((x) =>
          x.id === activeManualVariantId
            ? {
                ...x,
                specRows: x.specRows.map((r, i) =>
                  i === idx ? { ...r, [field]: value } : r,
                ),
              }
            : x,
        ),
      );
    }
  };

  const addSpecRow = () => {
    setSpecRowList((prev) => [...prev, { label: '', value: '' }]);
  };

  const removeSpecRow = (idx) => {
    setSpecRowList((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [{ label: '', value: '' }];
    });
  };

  const buildVariantsPayload = () => {
    if (fullTemplate && Array.isArray(fullTemplate.variants)) {
      // Template "variant specs" sometimes come as top-level `template.specifications`
      // (loaded into `specs` state) instead of `variantSpecs` on each variant.
      // We use `specs` as a fallback source of truth for color/storage/ram.
      const productSpecEntries = Object.entries(specs || {});

      const getFromProductSpecs = (pred) => {
        const hit = productSpecEntries.find(([k]) =>
          pred(String(k || '').trim()),
        );
        if (!hit) return '';
        const [, v] = hit;
        return String(v ?? '').trim();
      };
      const rows = variantIndices
        .map((i) => ({ i, v: fullTemplate.variants[i] }))
        .filter((x) => x.v)
        .map(({ i, v }) => ({
          variantName: String(v.variantName || '').trim(),
          // Admin templates may store Color/Storage/RAM either in direct fields
          // (`color`, `storage`, `ram`) OR inside `variantSpecs` label/value rows.
          color: (() => {
            const direct = v.color;
            const variantSpecRows = Array.isArray(v.variantSpecs)
              ? v.variantSpecs
              : [];
            const fromVariantSpecs = variantSpecRows.find((s) => {
              const label = String(s?.label || '')
                .toLowerCase()
                .trim();
              return (
                label === 'color' ||
                label === 'colour' ||
                label.includes('color') ||
                label.includes('colour')
              );
            })?.value;
            return String(
              direct ||
                fromVariantSpecs ||
                getFromProductSpecs((k) => {
                  const lk = k.toLowerCase();
                  return (
                    lk === 'color' ||
                    lk === 'colour' ||
                    lk.includes('color') ||
                    lk.includes('colour')
                  );
                }),
            ).trim();
          })(),
          storage: (() => {
            const direct = v.storage;
            const variantSpecRows = Array.isArray(v.variantSpecs)
              ? v.variantSpecs
              : [];
            const fromVariantSpecs = variantSpecRows.find((s) => {
              const label = String(s?.label || '')
                .toLowerCase()
                .trim();
              return (
                label === 'storage' ||
                label.includes('storage') ||
                label.includes('capacity') ||
                label.includes('ssd') ||
                label.includes('hdd')
              );
            })?.value;
            return String(
              direct ||
                fromVariantSpecs ||
                getFromProductSpecs((k) => {
                  const lk = k.toLowerCase();
                  return (
                    lk === 'storage' ||
                    lk.includes('storage') ||
                    lk.includes('capacity') ||
                    lk.includes('ssd') ||
                    lk.includes('hdd')
                  );
                }),
            ).trim();
          })(),
          ram: (() => {
            const direct = v.ram;
            const variantSpecRows = Array.isArray(v.variantSpecs)
              ? v.variantSpecs
              : [];
            const fromVariantSpecs = variantSpecRows.find((s) => {
              const label = String(s?.label || '')
                .toLowerCase()
                .trim();
              return (
                label === 'ram' ||
                label.includes('ram') ||
                label.includes('memory')
              );
            })?.value;
            return String(
              direct ||
                fromVariantSpecs ||
                getFromProductSpecs((k) => {
                  const lk = k.toLowerCase();
                  return (
                    lk === 'ram' || lk.includes('ram') || lk.includes('memory')
                  );
                }),
            ).trim();
          })(),
          //     condition: String(v.condition || condition || '').trim(),
          //     price: String(v.price || fullTemplate.price || '').trim(),
          //     stock: toNum(v.stock, 0),
          //     // Copy variantSpecs from template so edit mode and storefront can read them
          //     variantSpecs: Array.isArray(v.variantSpecs)
          //       ? v.variantSpecs
          //           .filter((r) => String(r?.label || '').trim())
          //           .map((r) => ({
          //             label: String(r.label || '').trim(),
          //             value: String(r.value ?? '').trim(),
          //           }))
          //       : [],
          //   }));
          // if (rows.length) return rows;

          condition: String(v.condition || condition || '').trim(),
          price: String(v.price || fullTemplate.price || '').trim(),
          stock: toNum(v.stock, 0),
          // Copy variantSpecs from template so edit mode and storefront can read them
          variantSpecs: Array.isArray(v.variantSpecs)
            ? v.variantSpecs
                .filter((r) => String(r?.label || '').trim())
                .map((r) => ({
                  label: String(r.label || '').trim(),
                  value: String(r.value ?? '').trim(),
                }))
            : [],
          // FIX: persist THIS variant's own rental tiers (month/day), not just
          // the shared top-level rentalConfigurations. Without this, every
          // variant ended up saved with the same ("common") rental price.
          // For the variant currently open in the form, use the live
          // (possibly vendor-edited) rentalTiers/rentalPricingModel state;
          // for all other variants, fall back to that variant's own
          // admin-configured tiers from the template.
          ...(listingType === 'sell'
            ? {
                // FIX: persist THIS variant's own sell price / MRP, not just
                // the shared top-level salesConfiguration. Without this,
                // every sell variant ended up saved with sellPrice/mrpPrice
                // of 0 (only the single top-level price was stored).
                sellPrice: (() => {
                  const isActiveVariant = i === selectedTemplateVariantIndex;
                  if (isActiveVariant) return toNum(sellPrice, 0);
                  const cfg = getTemplateVariantSaleConfig(fullTemplate, i);
                  return toNum(cfg.sellPrice, 0);
                })(),
                mrpPrice: (() => {
                  const isActiveVariant = i === selectedTemplateVariantIndex;
                  if (isActiveVariant) return toNum(mrpPrice, 0);
                  const cfg = getTemplateVariantSaleConfig(fullTemplate, i);
                  return toNum(cfg.mrpPrice, 0);
                })(),
              }
            : {
                rentalConfigurations: (() => {
                  const isActiveVariant = i === selectedTemplateVariantIndex;
                  const model = isActiveVariant
                    ? rentalPricingModel
                    : templateVariantPricingModel(fullTemplate, i);
                  // const tiers = isActiveVariant
                  //   ? rentalTiers
                  //   : rentalTiersFromTemplate(fullTemplate, model, i);
                  // return tiers.map((t, idx) => ({
                  //   months:
                  //     model === 'month'
                  //       ? toNum(t.months, [3, 6, 12][idx] || 3)
                  //       : 0,
                  //   days:
                  //     model === 'day' ? toNum(t.days, [3, 5, 7][idx] || 3) : 0,
                  //   periodUnit: model,
                  //   label: String(t.label || '').trim(),
                  //   pricePerDay: model === 'day' ? toNum(t.monthlyRent, 0) : 0,
                  //   customerRent: toNum(t.monthlyRent, 0),
                  //   shippingCharges: toNum(t.shippingCharges, 0),
                  // }));

                  const tiers = isActiveVariant
                    ? rentalTiers
                    : rentalTiersFromTemplate(fullTemplate, model, i);
                  // Same fix as buildRentalPayload: for a locked (admin-
                  // controlled) variant, submit the real customer price
                  // (vendorCost) — never the vendor's own cost price — as
                  // customerRent, since that's what the storefront shows.
                  const variantLocked = isActiveVariant
                    ? rentalFieldsLocked
                    : !getTemplateVariantAllowEdit(fullTemplate, i);
                  return tiers.map((t, idx) => ({
                    months:
                      model === 'month'
                        ? toNum(t.months, [3, 6, 12][idx] || 3)
                        : 0,
                    days:
                      model === 'day' ? toNum(t.days, [3, 5, 7][idx] || 3) : 0,
                    periodUnit: model,
                    label: String(t.label || '').trim(),
                    pricePerDay:
                      model === 'day'
                        ? variantLocked
                          ? toNum(t.vendorCost, 0)
                          : toNum(t.monthlyRent, 0)
                        : 0,
                    //     customerRent: variantLocked
                    //       ? toNum(t.vendorCost, 0)
                    //       : toNum(t.monthlyRent, 0),
                    //     shippingCharges: toNum(t.shippingCharges, 0),
                    //   }));
                    // })(),
                    // Same fix as buildRentalPayload: customer-facing price
                    // must always be the admin's real Customer configuration
                    // value, never gated by whether this variant is locked.
                    customerRent:
                      t.vendorCost !== undefined &&
                      t.vendorCost !== null &&
                      String(t.vendorCost).trim() !== ''
                        ? toNum(t.vendorCost, 0)
                        : toNum(t.monthlyRent, 0),
                    // Vendor's own configured price — kept separately so the
                    // vendor's own product table can show THEIR price.
                    vendorRent: toNum(t.monthlyRent, 0),
                    shippingCharges: toNum(t.shippingCharges, 0),
                  }));
                })(),
              }),
        }));
      //   if (rows.length) return rows;
      // }
      // // if (
      // //   mode === 'create' &&
      // //   customListing &&
      // //   Array.isArray(manualVariants) &&
      // //   manualVariants.length
      // // ) {
      // if (
      //   ((mode === 'create' && customListing) ||
      //     (mode === 'edit' && !isTemplateBased)) &&
      //   Array.isArray(manualVariants) &&
      //   manualVariants.length
      // ) {
      if (rows.length) return rows;
    }
    // EDIT MODE FIX: when editing an existing template-based rental/sell
    // product, `fullTemplate` is null (it's only populated when a template
    // is freshly applied from the catalog). Without this branch, execution
    // fell through to the single-variant fallback below and silently
    // dropped every other variant (and its own rental config) on save.
    if (
      mode === 'edit' &&
      isTemplateBased &&
      !fullTemplate &&
      Array.isArray(initialData?.variants) &&
      initialData.variants.length
    ) {
      const rows = initialData.variants.map((v, i) => {
        const isActiveVariant = i === selectedTemplateVariantIndex;
        const base = {
          variantName: String(v.variantName || '').trim(),
          color: String(v.color || '').trim(),
          storage: String(v.storage || '').trim(),
          ram: String(v.ram || '').trim(),
          condition: String(v.condition || condition || '').trim(),
          price: String(v.price || '').trim(),
          stock: toNum(v.stock, 0),
          variantSpecs: isActiveVariant
            ? Object.entries(specs || {})
                .filter(([k]) => String(k || '').trim())
                .map(([k, val]) => ({
                  label: String(k).trim(),
                  value: String(val ?? '').trim(),
                }))
            : Array.isArray(v.variantSpecs)
              ? v.variantSpecs
              : [],
        };
        if (listingType === 'sell') {
          return {
            ...base,
            sellPrice: isActiveVariant
              ? toNum(sellPrice, 0)
              : toNum(v.sellPrice, 0),
            mrpPrice: isActiveVariant
              ? toNum(mrpPrice, 0)
              : toNum(v.mrpPrice, 0),
          };
        }
        return {
          ...base,
          rentalConfigurations: isActiveVariant
            ? buildRentalPayload()
            : Array.isArray(v.rentalConfigurations)
              ? v.rentalConfigurations
              : [],
        };
      });
      if (rows.length) return rows;
    }
    // if (
    //   mode === 'create' &&
    //   customListing &&
    //   Array.isArray(manualVariants) &&
    //   manualVariants.length
    // ) {
    if (
      ((mode === 'create' && customListing) ||
        (mode === 'edit' && !isTemplateBased)) &&
      Array.isArray(manualVariants) &&
      manualVariants.length
    ) {
      const rentLabel =
        rentalTiers[0]?.monthlyRent != null &&
        String(rentalTiers[0].monthlyRent).trim() !== ''
          ? `₹${rentalTiers[0].monthlyRent}/mo`
          : '0';
      const sellLabel =
        String(sellPrice || '').trim() !== '' ? String(sellPrice).trim() : '0';
      return manualVariants.map((mv) => {
        const variantSellLabel =
          String(mv.sellPrice || '').trim() !== ''
            ? String(mv.sellPrice).trim()
            : sellLabel;
        const variantRentLabel =
          formatFirstTierRentLabel(
            mv.rentalTiers,
            mv.rentalPricingModel || 'day',
          ) ?? rentLabel;
        const variantRentalConfigurations =
          listingType === 'sell'
            ? undefined
            : (mv.rentalTiers || []).map((t, i) => ({
                months:
                  (mv.rentalPricingModel || 'day') === 'month'
                    ? toNum(t.months, [3, 6, 9][i] || 3)
                    : 0,
                days:
                  (mv.rentalPricingModel || 'day') === 'day'
                    ? toNum(t.days, 1)
                    : 0,
                periodUnit: mv.rentalPricingModel || 'day',
                label: String(t.label || '').trim(),
                pricePerDay:
                  (mv.rentalPricingModel || 'day') === 'day'
                    ? toNum(t.monthlyRent, 0)
                    : 0,
                customerRent: toNum(t.monthlyRent, 0),
                shippingCharges: toNum(t.shippingCharges, 0),
              }));
        return {
          variantName:
            String(mv.variantName || '').trim() ||
            String(productName || '').trim() ||
            'Variant',
          color: '',
          storage: '',
          ram: '',
          condition: String(condition || '').trim(),
          price: listingType === 'sell' ? variantSellLabel : variantRentLabel,
          sellPrice:
            listingType === 'sell' ? toNum(mv.sellPrice, 0) : undefined,
          mrpPrice: listingType === 'sell' ? toNum(mv.mrpPrice, 0) : undefined,
          rentalConfigurations: variantRentalConfigurations,
          stock: toNum(mv.stock, 0),
          // Persist this variant's own kept image URLs.
          images: Array.isArray(mv.existingImages)
            ? mv.existingImages.filter(Boolean)
            : [],
          // ADD THIS — save the per-variant spec rows
          variantSpecs: Array.isArray(mv.specRows)
            ? mv.specRows
                .filter((r) => String(r?.label || '').trim())
                .map((r) => ({
                  label: String(r.label || '').trim(),
                  value: String(r.value ?? '').trim(),
                }))
            : [],
        };
      });
    }
    return [
      {
        variantName: productName || 'Default',
        color: '',
        storage: '',
        ram: '',
        condition: String(condition || '').trim(),
        price: String(fullTemplate?.price || '').trim(),
        stock: 0,
      },
    ];
  };
  // const buildRentalPayload = () =>
  //   rentalTiers.map((t, i) => ({
  //     months:
  //       rentalPricingModel === 'month'
  //         ? toNum(t.months, [3, 6, 12][i] || 3)
  //         : 0,
  //     days: rentalPricingModel === 'day' ? toNum(t.days, [3, 5, 7][i] || 3) : 0,
  //     periodUnit: rentalPricingModel,
  //     label: String(t.label || '').trim(),
  //     pricePerDay: rentalPricingModel === 'day' ? toNum(t.monthlyRent, 0) : 0,
  //     customerRent: toNum(t.monthlyRent, 0),
  //     shippingCharges:
  //       mode === 'create' && customListing ? 0 : toNum(t.shippingCharges, 0),
  //   }));

  const buildRentalPayload = () =>
    rentalTiers.map((t, i) => ({
      months:
        rentalPricingModel === 'month'
          ? toNum(t.months, [3, 6, 12][i] || 3)
          : 0,
      days: rentalPricingModel === 'day' ? toNum(t.days, [3, 5, 7][i] || 3) : 0,
      periodUnit: rentalPricingModel,
      label: String(t.label || '').trim(),
      // Submit the admin's real customer-facing price (vendorCost holds it
      // for locked/template tiers) — never the vendor's own cost price —
      // as the customerRent, since this is what the storefront shows.
      pricePerDay:
        rentalPricingModel === 'day'
          ? rentalFieldsLocked
            ? toNum(t.vendorCost, 0)
            : toNum(t.monthlyRent, 0)
          : 0,
      //   customerRent: rentalFieldsLocked
      //     ? toNum(t.vendorCost, 0)
      //     : toNum(t.monthlyRent, 0),
      //   shippingCharges:
      //     mode === 'create' && customListing ? 0 : toNum(t.shippingCharges, 0),
      // }));

      // Customer-facing price must always be the admin's real Customer
      // configuration value, regardless of whether the vendor is allowed
      // to edit their own price — vendor edit permission only affects
      // vendorRent, never what the storefront/customer sees.
      customerRent:
        t.vendorCost !== undefined &&
        t.vendorCost !== null &&
        String(t.vendorCost).trim() !== ''
          ? toNum(t.vendorCost, 0)
          : toNum(t.monthlyRent, 0),
      // Vendor's own configured price — kept separately so the vendor's
      // own product table can show THEIR price, not the customer price.
      vendorRent: toNum(t.monthlyRent, 0),
      shippingCharges:
        mode === 'create' && customListing ? 0 : toNum(t.shippingCharges, 0),
    }));

  const validate = (submissionStatus) => {
    if (!String(productName || '').trim()) {
      toast.error('Product name is required.');
      return false;
    }
    if (
      !String(categoryName || '').trim() ||
      !String(subCategoryName || '').trim()
    ) {
      toast.error('Category and sub-category are required.');
      return false;
    }
    if (submissionStatus !== 'draft') {
      const customImageOk =
        mode === 'create' &&
        customListing &&
        manualVariants.some(
          (mv) =>
            (mv.existingImages && mv.existingImages.length > 0) ||
            (mv.newImages && mv.newImages.length > 0),
        );
      if (
        !fullTemplate &&
        (mode === 'create' && customListing
          ? !customImageOk
          : !existingImages.length && !newImages.length)
      ) {
        toast.error('Add at least one product image (in variant details).');
        return false;
      }
      if (mode === 'create' && customListing) {
        if (!manualVariants.length) {
          toast.error('Add at least one product variant.');
          return false;
        }
        const missingName = manualVariants.some(
          (mv) => !String(mv.variantName || '').trim(),
        );
        if (missingName) {
          toast.error('Each variant needs a name.');
          return false;
        }
        if (listingType === 'sell') {
          const missingSellPrice = manualVariants.some(
            (mv) => !String(mv.sellPrice || '').trim(),
          );
          if (missingSellPrice) {
            toast.error('Each variant needs a selling price.');
            return false;
          }
        } else {
          const missingRent = manualVariants.some(
            (mv) =>
              !Array.isArray(mv.rentalTiers) ||
              !mv.rentalTiers.some(
                (t) => String(t?.monthlyRent || '').trim() !== '',
              ),
          );
          if (missingRent) {
            toast.error('Each variant needs at least one rental price.');
            return false;
          }
        }
      }
      if (!String(logistics.deliveryTimelineValue || '').trim()) {
        toast.error('Delivery timeline is required.');
        return false;
      }
      if (!String(stock || '').trim()) {
        toast.error('Inventory count is required.');
        return false;
      }
    }
    return true;
  };

  // const submit = (submissionStatus) => {
  //   if (!validate(submissionStatus)) return;
  //   const isCustomListingFlow = customListing;
  //   const imgs = isCustomListingFlow
  //     ? collectCustomListingImageUrls(manualVariants)
  //     : [...existingImages];
  //   const imageFiles = isCustomListingFlow
  //     ? collectCustomListingImageFiles(manualVariants)
  //     : newImages;
  //   const specificationsPayload = isCustomListingFlow
  //     ? mergeCustomListingSpecifications(manualVariants)
  //     : specs;
  //   const rentalPriceLabel =
  //     formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ||
  //     fullTemplate?.price ||
  //     '0';
  //   const sellPriceLabel =
  //     String(sellPrice || '').trim() !== ''
  //       ? String(sellPrice).trim()
  //       : fullTemplate?.price || '0';

  //   const createdVia =
  //     mode === 'create'
  //       ? fullTemplate
  //         ? 'template'
  //         : 'manual'
  //       : initialData?.createdVia === 'template'
  //         ? 'template'
  //         : 'manual';

  //   onSubmit({
  //     productName: String(productName).trim(),
  //     type: listingType === 'sell' ? 'Sell' : 'Rental',
  //     category: categoryName,
  //     subCategory: subCategoryName,
  //     brand: String(brand || '').trim(),
  //     condition: normalizeConditionForListingType(
  //       condition || 'Brand New',
  //       listingType === 'sell' ? 'Sell' : 'Rental',
  //       listingType === 'rent' &&
  //         (mode === 'create'
  //           ? !fullTemplate
  //           : initialData?.createdVia !== 'template'),
  //     ),
  //     shortDescription: String(shortDescription || '').trim(),
  //     description: String(description || '').trim(),
  //     specifications: specificationsPayload,
  //     variants: buildVariantsPayload(),
  //     rentalConfigurations: listingType === 'sell' ? [] : buildRentalPayload(),
  //     refundableDeposit:
  //       listingType === 'sell' ? 0 : toNum(refundableDeposit, 0),
  //     salesConfiguration:
  //       listingType === 'sell'
  //         ? {
  //             allowVendorEditSalePrice: allowVendorSalePriceEdit,
  //             salePrice: toNum(sellPrice, toNum(fullTemplate?.price, 0)),
  //             mrpPrice: toNum(mrpPrice, 0),
  //           }
  //         : {},
  //     logisticsVerification: {
  //       inventoryOwnerName: String(logistics.inventoryOwnerName || '').trim(),
  //       city: String(logistics.city || '').trim(),
  //       deliveryTimelineValue: toNum(logistics.deliveryTimelineValue, 0),
  //       deliveryTimelineUnit: logistics.deliveryTimelineUnit || 'Days',
  //     },
  //     existingImages: imgs.filter(Boolean).slice(0, 10),
  //     images: imageFiles,
  //     price: listingType === 'sell' ? sellPriceLabel : rentalPriceLabel,
  //     stock: toNum(stock, 0),
  //     status: 'Active',
  //     submissionStatus,
  //     createdVia,
  //     allowVendorEditRentalPrices: allowVendorPriceEdit,
  //   });
  // };

  // const submit = (submissionStatus) => {
  //   if (!validate(submissionStatus)) return;
  //   const isCustomListingFlow = mode === 'create' && customListing;
  //   const imgs = isCustomListingFlow
  //     ? collectCustomListingImageUrls(manualVariants)
  //     : [...existingImages];
  //   const imageFiles = isCustomListingFlow
  //     ? collectCustomListingImageFiles(manualVariants)
  //     : newImages;
  //   // const specificationsPayload = isCustomListingFlow
  //   //   ? mergeCustomListingSpecifications(manualVariants)
  //   //   : specs;
  //   const isManualEditFlow = mode === 'edit' && !isTemplateBased;
  //   const specificationsPayload =
  //     isCustomListingFlow || isManualEditFlow
  //       ? mergeCustomListingSpecifications(manualVariants)
  //       : specs;

  const submit = async (submissionStatus) => {
    if (submitInFlightRef.current) return;
    if (!validate(submissionStatus)) return;
    submitInFlightRef.current = true;
    setIsSubmitting(true);
    try {
      const isCustomListingFlow = mode === 'create' && customListing;
      // FIX: manual (non-template) EDIT mode must also aggregate images from
      // each variant's own existingImages/newImages, same as create-mode
      // custom listings. Without this, per-variant image edits never reached
      // the submit payload — edit mode was falling back to the shared
      // top-level existingImages/newImages state, a disconnected pool that
      // caused images to "bleed" between variants.
      const isManualEditFlow = mode === 'edit' && !isTemplateBased;
      const imgs =
        isCustomListingFlow || isManualEditFlow
          ? collectCustomListingImageUrls(manualVariants)
          : [...existingImages];
      const imageFiles =
        isCustomListingFlow || isManualEditFlow
          ? collectCustomListingImageFiles(manualVariants)
          : newImages;
      const newImageOwners =
        isCustomListingFlow || isManualEditFlow
          ? collectCustomListingImageOwners(manualVariants)
          : [];
      // const specificationsPayload = isCustomListingFlow
      //   ? mergeCustomListingSpecifications(manualVariants)
      //   : specs;
      const specificationsPayload =
        isCustomListingFlow || isManualEditFlow
          ? mergeCustomListingSpecifications(manualVariants)
          : specs;
      // const rentalPriceLabel =
      //   formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ||
      //   fullTemplate?.price ||
      //   '0';
      const manualVariantRentLabel =
        (isCustomListingFlow || isManualEditFlow) && manualVariants.length
          ? formatFirstTierRentLabel(
              manualVariants[0]?.rentalTiers,
              manualVariants[0]?.rentalPricingModel || 'day',
            )
          : null;
      const rentalPriceLabel =
        manualVariantRentLabel ||
        formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ||
        fullTemplate?.price ||
        '0';
      // const firstVariantSellPrice =
      //   isCustomListingFlow || isManualEditFlow
      //     ? String(manualVariants?.[0]?.sellPrice || '').trim()
      //     : '';
      const firstVariantSellPrice =
        isCustomListingFlow || isManualEditFlow
          ? String(
              (manualVariants || []).find(
                (mv) => String(mv?.sellPrice || '').trim() !== '',
              )?.sellPrice || '',
            ).trim()
          : '';
      const sellPriceLabel =
        String(sellPrice || '').trim() !== ''
          ? String(sellPrice).trim()
          : firstVariantSellPrice || fullTemplate?.price || '0';

      const createdVia =
        mode === 'create'
          ? fullTemplate
            ? 'template'
            : 'manual'
          : initialData?.createdVia === 'template'
            ? 'template'
            : 'manual';

      // // ✅ Use fresh isRentalLocked, not stale rentalFieldsLocked from render
      // const rentalConfigurations = (() => {
      //   if (listingType === 'sell') return [];
      //   if (
      //     // isRentalLocked &&
      //     rentalFieldsLocked &&
      //     mode === 'edit' &&
      //     Array.isArray(initialData?.rentalConfigurations) &&
      //     initialData.rentalConfigurations.length > 0
      //   ) {
      //     return initialData.rentalConfigurations;
      //   }
      //   return buildRentalPayload();
      // })();

      // ✅ Use fresh isRentalLocked, not stale rentalFieldsLocked from render
      const rentalConfigurations = (() => {
        if (listingType === 'sell') return [];
        // Custom / manual variant listings: keep the product-level rental
        // config in sync with the variant's own (latest edited) tiers —
        // otherwise this stayed on a separate stale state and caused the
        // storefront/order price to differ from what was just edited.
        // if (
        //   (isCustomListingFlow || isManualEditFlow) &&
        //   Array.isArray(manualVariants) &&
        //   manualVariants.length
        // ) {
        //   const primary = manualVariants[0];
        //   const model = primary.rentalPricingModel || 'day';
        //   return (primary.rentalTiers || []).map((t, i) => ({
        //     months: model === 'month' ? toNum(t.months, [3, 6, 9][i] || 3) : 0,
        //     days: model === 'day' ? toNum(t.days, 1) : 0,
        //     periodUnit: model,
        //     label: String(t.label || '').trim(),
        //     pricePerDay: model === 'day' ? toNum(t.monthlyRent, 0) : 0,
        //     customerRent: toNum(t.monthlyRent, 0),
        //     shippingCharges: toNum(t.shippingCharges, 0),
        //   }));
        // }
        if (
          (isCustomListingFlow || isManualEditFlow) &&
          Array.isArray(manualVariants) &&
          manualVariants.length
        ) {
          const primary = manualVariants[0];
          const model = primary.rentalPricingModel || 'day';
          return (primary.rentalTiers || []).map((t, i) => ({
            months: model === 'month' ? toNum(t.months, [3, 6, 9][i] || 3) : 0,
            days: model === 'day' ? toNum(t.days, 1) : 0,
            periodUnit: model,
            label: String(t.label || '').trim(),
            pricePerDay: model === 'day' ? toNum(t.monthlyRent, 0) : 0,
            customerRent: toNum(t.monthlyRent, 0),
            shippingCharges: toNum(t.shippingCharges, 0),
          }));
        }
        // Template-based (standard) listings in edit mode: always mirror
        // Variant 0's own saved rentalConfigurations for the top-level/master
        // field, so it stays stable and doesn't drift to whichever variant
        // tab happened to be open last when Save was clicked.
        if (
          mode === 'edit' &&
          isTemplateBased &&
          !fullTemplate &&
          Array.isArray(initialData?.variants) &&
          initialData.variants.length
        ) {
          const isVariant0Active = selectedTemplateVariantIndex === 0;
          if (isVariant0Active) {
            return buildRentalPayload();
          }
          const v0 = initialData.variants[0];
          if (
            Array.isArray(v0?.rentalConfigurations) &&
            v0.rentalConfigurations.length
          ) {
            return v0.rentalConfigurations;
          }
          return buildRentalPayload();
        }
        if (
          // isRentalLocked &&
          rentalFieldsLocked &&
          mode === 'edit' &&
          Array.isArray(initialData?.rentalConfigurations) &&
          initialData.rentalConfigurations.length > 0
        ) {
          return initialData.rentalConfigurations;
        }
        return buildRentalPayload();
      })();

      onSubmit({
        productName: String(productName).trim(),
        type: listingType === 'sell' ? 'Sell' : 'Rental',
        category: categoryName,
        subCategory: subCategoryName,
        brand: String(brand || '').trim(),
        condition: normalizeConditionForListingType(
          condition || 'Brand New',
          listingType === 'sell' ? 'Sell' : 'Rental',
          listingType === 'rent' &&
            (mode === 'create'
              ? !fullTemplate
              : initialData?.createdVia !== 'template'),
        ),
        shortDescription: String(shortDescription || '').trim(),
        description: String(description || '').trim(),
        // specifications: specificationsPayload,
        // variants: buildVariantsPayload(),
        // rentalConfigurations: listingType === 'sell' ? [] : buildRentalPayload(),
        // refundableDeposit:
        specifications: specificationsPayload,
        variants: buildVariantsPayload(),
        rentalConfigurations,
        refundableDeposit:
          listingType === 'sell' ? 0 : toNum(refundableDeposit, 0),
        salesConfiguration:
          listingType === 'sell'
            ? {
                allowVendorEditSalePrice: allowVendorSalePriceEdit,
                salePrice: toNum(sellPrice, toNum(fullTemplate?.price, 0)),
                mrpPrice: toNum(mrpPrice, 0),
              }
            : {},
        logisticsVerification: {
          inventoryOwnerName: String(logistics.inventoryOwnerName || '').trim(),
          city: String(logistics.city || '').trim(),
          deliveryTimelineValue: toNum(logistics.deliveryTimelineValue, 0),
          deliveryTimelineUnit: logistics.deliveryTimelineUnit || 'Days',
        },
        existingImages: imgs.filter(Boolean).slice(0, 10),
        images: imageFiles,
        // Parallel to `images` — which variant (by index) each new file belongs to.
        newImageOwners,
        price: listingType === 'sell' ? sellPriceLabel : rentalPriceLabel,
        stock: toNum(stock, 0),
        status: 'Active',
        submissionStatus,
        createdVia,
        allowVendorEditRentalPrices: allowVendorPriceEdit,
      });
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };
  // useEffect(() => {
  //   if (!fullTemplate) {
  //     lastTemplateRentalSyncKeyRef.current = '';
  //     return;
  //   }
  //   if (mode !== 'create') {
  //     setRentalTiers(
  //       rentalTiersFromTemplate(
  //         fullTemplate,
  //         rentalPricingModel,
  //         selectedTemplateVariantIndex,
  //       ),
  //     );
  //     return;
  //   }
  //   const native = templateVariantPricingModel(
  //     fullTemplate,
  //     selectedTemplateVariantIndex,
  //   );
  //   const key = `${fullTemplate._id ?? 'tpl'}:${selectedTemplateVariantIndex}`;
  //   const tplOrVariantChanged = lastTemplateRentalSyncKeyRef.current !== key;
  //   const lockUnitToTemplate = !allowVendorPriceEdit;
  //   if (tplOrVariantChanged) {
  //     lastTemplateRentalSyncKeyRef.current = key;
  //     setRentalPricingModel(native);
  //     setRentalTiers(
  //       rentalTiersFromTemplate(
  //         fullTemplate,
  //         native,
  //         selectedTemplateVariantIndex,
  //       ),
  //     );
  //     return;
  //   }
  //   if (!lockUnitToTemplate) {
  //     setRentalTiers(
  //       rentalTiersFromTemplate(
  //         fullTemplate,
  //         rentalPricingModel,
  //         selectedTemplateVariantIndex,
  //       ),
  //     );
  //   } else {
  //     setRentalPricingModel(native);
  //     setRentalTiers(
  //       rentalTiersFromTemplate(
  //         fullTemplate,
  //         native,
  //         selectedTemplateVariantIndex,
  //       ),
  //     );
  //   }
  //   // }, [
  //   //   fullTemplate,
  //   //   selectedTemplateVariantIndex,
  //   //   rentalPricingModel,
  //   //   mode,
  //   //   allowVendorPriceEdit,
  //   // ]);
  // }, [
  //   fullTemplate,
  //   selectedTemplateVariantIndex,
  //   rentalPricingModel,
  //   mode,
  //   allowVendorPriceEdit,
  // ]);

  useEffect(() => {
    if (!fullTemplate) {
      lastTemplateRentalSyncKeyRef.current = '';
      return;
    }
    if (mode !== 'create') {
      setRentalTiers(
        rentalTiersFromTemplate(
          fullTemplate,
          rentalPricingModel,
          selectedTemplateVariantIndex,
        ),
      );
      return;
    }
    const native = templateVariantPricingModel(
      fullTemplate,
      selectedTemplateVariantIndex,
    );
    const key = `${fullTemplate._id ?? 'tpl'}:${selectedTemplateVariantIndex}`;
    const tplOrVariantChanged = lastTemplateRentalSyncKeyRef.current !== key;
    const lockUnitToTemplate = !allowVendorPriceEdit;
    if (tplOrVariantChanged) {
      lastTemplateRentalSyncKeyRef.current = key;
      setRentalPricingModel(native);
      setRentalTiers(
        applyVendorPriceCommissionFallback(
          rentalTiersFromTemplate(
            fullTemplate,
            native,
            selectedTemplateVariantIndex,
          ),
        ),
      );
      return;
    }
    if (!lockUnitToTemplate) {
      setRentalTiers(
        applyVendorPriceCommissionFallback(
          rentalTiersFromTemplate(
            fullTemplate,
            rentalPricingModel,
            selectedTemplateVariantIndex,
          ),
        ),
      );
    } else {
      setRentalPricingModel(native);
      setRentalTiers(
        applyVendorPriceCommissionFallback(
          rentalTiersFromTemplate(
            fullTemplate,
            native,
            selectedTemplateVariantIndex,
          ),
        ),
      );
    }
  }, [
    fullTemplate,
    selectedTemplateVariantIndex,
    rentalPricingModel,
    mode,
    allowVendorPriceEdit,
  ]);

  // EDIT MODE FIX: when editing an existing template-based rental product
  // (fullTemplate is null here because it wasn't reloaded from the catalog),
  // the rental tiers must be re-read from the SELECTED VARIANT's own
  // rentalConfigurations whenever the user switches variants — otherwise
  // every variant kept showing the same top-level rentalConfigurations.
  useEffect(() => {
    if (mode !== 'edit') return;
    if (fullTemplate) return; // handled by the effect above
    if (listingType === 'sell') return;
    if (!isTemplateBased) return;
    if (!Array.isArray(initialData?.variants) || !initialData.variants.length)
      return;

    const v = initialData.variants[selectedTemplateVariantIndex];
    if (!v) return;

    const vRc = Array.isArray(v.rentalConfigurations)
      ? v.rentalConfigurations
      : [];
    if (!vRc.length) return; // no per-variant data, keep current tiers

    // const vModel = vRc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
    // const vTiers = vRc.slice(0, 6).map((cfg, i) => ({
    //   months: toNum(cfg.months, 0),
    //   days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
    //   label:
    //     String(cfg.label || '').trim() ||
    //     (vModel === 'day'
    //       ? `${toNum(cfg.days, 1)} Days`
    //       : `${toNum(cfg.months, 3)} Months`),
    //   tierLabel: '',
    //   monthlyRent: String(
    //     cfg.customerRent != null && cfg.customerRent !== ''
    //       ? cfg.customerRent
    //       : (cfg.pricePerDay ?? ''),
    //   ),
    //   shippingCharges: String(cfg.shippingCharges ?? ''),
    //   bestValue: i === vRc.length - 1,
    // }));
    const vModel = vRc.some((c) => c.periodUnit === 'day') ? 'day' : 'month';
    const vTiers = vRc.slice(0, 6).map((cfg, i) => ({
      months: toNum(cfg.months, 0),
      days: toNum(cfg.days, vModel === 'day' ? 1 : 0),
      label:
        String(cfg.label || '').trim() ||
        (vModel === 'day'
          ? `${toNum(cfg.days, 1)} Days`
          : `${toNum(cfg.months, 3)} Months`),
      tierLabel: '',
      // Edit mode must show the VENDOR's own price, never the
      // customer-facing price.
      //   monthlyRent: String(
      //     cfg.vendorRent != null && cfg.vendorRent !== ''
      //       ? cfg.vendorRent
      //       : cfg.customerRent != null && cfg.customerRent !== ''
      //         ? cfg.customerRent
      //         : (cfg.pricePerDay ?? ''),
      //   ),
      //   shippingCharges: String(cfg.shippingCharges ?? ''),
      //   bestValue: i === vRc.length - 1,
      // }));
      // Edit mode must show the VENDOR's own price, never the
      // customer-facing price.
      monthlyRent: Number(cfg.vendorRent) > 0 ? String(cfg.vendorRent) : '',
      vendorCost:
        cfg.customerRent != null && String(cfg.customerRent).trim() !== ''
          ? String(cfg.customerRent)
          : '',
      shippingCharges: String(cfg.shippingCharges ?? ''),
      bestValue: i === vRc.length - 1,
    }));

    setRentalPricingModel(vModel);
    setRentalTiers(vTiers);
    if (vModel === 'day') {
      dayTiersBackupRef.current = vTiers;
    } else {
      monthTiersBackupRef.current = vTiers;
    }
  }, [
    mode,
    fullTemplate,
    listingType,
    isTemplateBased,
    initialData,
    selectedTemplateVariantIndex,
  ]);

  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !initialData || !categories.length)
      return;
    const c = categories.find((x) => x.name === initialData.category);
    if (c) setCategoryId(c._id);
  }, [isOpen, mode, initialData, categories]);

  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !initialData || !subCategories.length)
      return;
    const s = subCategories.find((x) => x.name === initialData.subCategory);
    if (s) setSubCategoryId(s._id);
  }, [isOpen, mode, initialData, subCategories]);

  // Keep `specs` in sync when vendor can edit specifications (manual / non-template).
  const createdViaInitialForSync =
    initialData?.createdVia === 'template' ? 'template' : 'manual';
  const isTemplateBasedForSync =
    !!fullTemplate || createdViaInitialForSync === 'template';
  const detailsLockedForSync =
    (mode === 'create' && !!fullTemplate) ||
    (mode === 'edit' && isTemplateBasedForSync);

  // useEffect(() => {
  //   if (!isOpen || detailsLockedForSync) return;
  useEffect(() => {
    if (!isOpen || detailsLockedForSync) return;
    if (mode === 'create' && customListing) return;
    if (mode === 'edit' && !isTemplateBased) return;
    const next = {};
    specRowList.forEach(({ label, value }) => {
      const k = String(label).trim();
      if (k) next[k] = String(value ?? '').trim();
    });
    setSpecs(next);
  }, [isOpen, mode, customListing, isTemplateBased, fullTemplate, specRowList]);

  const updateVariantRentalTier = (variantId, i, field, value) => {
    setManualVariants((prev) =>
      prev.map((x) =>
        x.id === variantId
          ? {
              ...x,
              rentalTiers: (x.rentalTiers || []).map((row, j) =>
                j === i ? { ...row, [field]: value } : row,
              ),
            }
          : x,
      ),
    );
  };

  const addVariantRentalTier = (variantId) => {
    setManualVariants((prev) =>
      prev.map((x) => {
        if (x.id !== variantId) return x;
        const model = x.rentalPricingModel || 'day';
        const tiers = x.rentalTiers || [];
        const last = tiers[tiers.length - 1];
        const nextTier =
          model === 'day'
            ? {
                months: 0,
                days: (last?.days || 7) + 2,
                label: `${(last?.days || 7) + 2} Days`,
                tierLabel: 'CUSTOM',
                monthlyRent: '',
                shippingCharges: '',
                bestValue: false,
              }
            : {
                months: (last?.months || 12) + 3,
                days: 0,
                label: `${(last?.months || 12) + 3} Months`,
                tierLabel: 'CUSTOM',
                monthlyRent: '',
                shippingCharges: '',
                bestValue: false,
              };
        return { ...x, rentalTiers: [...tiers, nextTier] };
      }),
    );
  };

  const removeVariantRentalTier = (variantId, i) => {
    setManualVariants((prev) =>
      prev.map((x) => {
        if (x.id !== variantId) return x;
        const tiers = x.rentalTiers || [];
        if (tiers.length <= 1) return x;
        const next = tiers.filter((_, j) => j !== i);
        next.forEach((t) => (t.bestValue = false));
        if (next.length > 0) next[next.length - 1].bestValue = true;
        return { ...x, rentalTiers: next };
      }),
    );
  };

  const switchVariantRentalPricingModel = (variantId, nextModel) => {
    setManualVariants((prev) =>
      prev.map((x) => {
        if (x.id !== variantId) return x;
        if (nextModel === x.rentalPricingModel) return x;
        const restored =
          nextModel === 'day' ? customListingDayTiers() : defaultMonthTiers();
        return { ...x, rentalPricingModel: nextModel, rentalTiers: restored };
      }),
    );
  };

  const activeManualVariantId =
    mode === 'edit' && !isTemplateBased
      ? (expandedVariantId ?? selectedManualVariantId)
      : expandedVariantId;

  useEffect(() => {
    if (mode !== 'edit' || isTemplateBased) return;
    if (!activeManualVariantId) return;
    const mv = manualVariants.find((v) => v.id === activeManualVariantId);
    if (!mv) return;
    const rows = mv.specRows || [];
    setSpecRowList(rows.length ? rows : [{ label: '', value: '' }]);
  }, [mode, isTemplateBased, activeManualVariantId]);

  // Market-low benchmarks for custom rental listings (category + sub-category names).
  useEffect(() => {
    if (!isOpen) {
      setMarketLowTenures({ month: {}, day: {} });
      setMarketLowLoading(false);
      return;
    }
    if (mode !== 'create' || !customListing || listingType !== 'rent') {
      setMarketLowTenures({ month: {}, day: {} });
      setMarketLowLoading(false);
      return;
    }
    const cat = String(categoryName || '').trim();
    const sub = String(subCategoryName || '').trim();
    if (!token || !cat || !sub) {
      setMarketLowTenures({ month: {}, day: {} });
      setMarketLowLoading(false);
      return;
    }
    let cancelled = false;
    setMarketLowLoading(true);
    apiGetVendorMarketLowRentalTenures(
      { category: cat, subCategory: sub },
      token,
    )
      .then((res) => {
        if (cancelled) return;
        const m = res?.data?.month || {};
        const d = res?.data?.day || {};
        setMarketLowTenures({ month: m, day: d });
      })
      .catch(() => {
        if (!cancelled) setMarketLowTenures({ month: {}, day: {} });
      })
      .finally(() => {
        if (!cancelled) setMarketLowLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    mode,
    customListing,
    listingType,
    categoryName,
    subCategoryName,
    token,
  ]);

  // Dynamic tenure rows for custom rental: follow market-low keys (month / day).
  useEffect(() => {
    if (
      !isOpen ||
      mode !== 'create' ||
      !customListing ||
      listingType !== 'rent'
    )
      return;
    setRentalTiers((prev) =>
      synthesizeRentalTiersFromMarket(
        marketLowTenures.month,
        marketLowTenures.day,
        rentalPricingModel,
        prev,
      ),
    );
  }, [
    isOpen,
    mode,
    customListing,
    listingType,
    marketLowTenures,
    rentalPricingModel,
  ]);

  if (!isOpen) return null;

  const showDetailSections =
    mode === 'edit' ||
    fullTemplate ||
    (customListing && categoryId && subCategoryId);

  // Template-based vs manual listings
  // const createdViaInitial =
  //   initialData?.createdVia === "template" ? "template" : "manual";
  // const isTemplateBased = !!fullTemplate || createdViaInitial === "template";

  // Product images always stay locked for template-based listings, regardless
  // of whether the admin lets vendors edit prices.
  const imagesLocked =
    (mode === 'create' && !!fullTemplate) ||
    (mode === 'edit' && isTemplateBased);

  // // Rental pricing fields can be unlocked for vendors when admin explicitly allows it.
  // const rentalFieldsLocked =
  //   (mode === 'create' && !!fullTemplate && !allowVendorPriceEdit) ||
  //   (mode === 'edit' && isTemplateBased && !allowVendorPriceEdit);

  // // Other admin-provided details (name, brand, condition, description, specs)
  // // stay locked for vendor (view only) EXCEPT for rent listings, where they
  // // must follow the SAME lock state as the rental price fields (reusing
  // // `rentalFieldsLocked` directly guarantees identical on/off behavior).
  // // Sell listings keep the original fully-locked behavior for now.
  // const detailsLocked =
  //   listingType === 'rent' ? rentalFieldsLocked : imagesLocked;
  // const saleFieldsLocked =
  //   (mode === 'create' && !!fullTemplate && !allowVendorSalePriceEdit) ||
  //   (mode === 'edit' &&
  //     isTemplateBased &&
  //     !allowVendorSalePriceEdit &&
  //     listingType === 'sell');

  // Rental pricing fields can be unlocked for vendors when admin explicitly allows it.
  const rentalFieldsLocked =
    (mode === 'create' && !!fullTemplate && !allowVendorPriceEdit) ||
    (mode === 'edit' && isTemplateBased && !allowVendorPriceEdit);

  const saleFieldsLocked =
    (mode === 'create' && !!fullTemplate && !allowVendorSalePriceEdit) ||
    (mode === 'edit' &&
      isTemplateBased &&
      !allowVendorSalePriceEdit &&
      listingType === 'sell');

  // Other admin-provided details (name, brand, condition, description, specs)
  // stay locked for vendor (view only) EXCEPT when the admin toggle for
  // that listing type explicitly allows editing — rent follows
  // `rentalFieldsLocked`, sell follows `saleFieldsLocked` (same pattern),
  // so switching the toggle ON unlocks product details too, not just the
  // Sales/Rental Configuration section. Product images remain governed
  // separately by `imagesLocked` and are never unlocked by this toggle.
  const detailsLocked =
    listingType === 'rent' ? rentalFieldsLocked : saleFieldsLocked;

  const isCustomRentalPricing =
    mode === 'create' && customListing && listingType === 'rent';

  const conditionSelectOptions =
    listingType === 'sell'
      ? SELL_CONDITION_OPTIONS
      : detailsLocked
        ? RENTAL_TEMPLATE_CONDITION_OPTIONS
        : RENTAL_MANUAL_CONDITION_OPTIONS;

  // const displayVariants =
  //   fullTemplate && Array.isArray(fullTemplate.variants)
  //     ? variantIndices
  //         .map((i) => ({ index: i, v: fullTemplate.variants[i] }))
  //         .filter((x) => x.v)
  //     : [];

  // AFTER:
  const editModeVariants =
    mode === 'edit' &&
    isTemplateBased &&
    !fullTemplate &&
    Array.isArray(initialData?.variants)
      ? initialData.variants
      : null;

  const templateVariantsSource = fullTemplate?.variants ?? editModeVariants;

  const displayVariants =
    templateVariantsSource && templateVariantsSource.length > 0
      ? variantIndices.length > 0
        ? variantIndices
            .map((i) => ({ index: i, v: templateVariantsSource[i] }))
            .filter((x) => x.v)
        : templateVariantsSource.map((v, i) => ({ index: i, v }))
      : [];

  const specEntries = Object.entries(specs).filter(
    ([k, v]) => k && v != null && String(v).trim() !== '',
  );

  // const expandedVariant =
  //   mode === 'create' && customListing && expandedVariantId
  //     ? (manualVariants.find((v) => v.id === expandedVariantId) ?? null)
  //     : null;

  const expandedVariant =
    ((mode === 'create' && customListing) ||
      (mode === 'edit' && !isTemplateBased)) &&
    activeManualVariantId
      ? (manualVariants.find((v) => v.id === activeManualVariantId) ?? null)
      : null;

  const customListingPricePreview =
    listingType === 'sell'
      ? String(sellPrice || '').trim()
        ? `₹${sellPrice}`
        : '—'
      : (formatFirstTierRentLabel(rentalTiers, rentalPricingModel) ?? '—');

  const showPerVariantSalesConfig =
    listingType === 'sell' &&
    ((mode === 'create' && customListing) ||
      (mode === 'edit' && !isTemplateBased));

  const showPerVariantRentalConfig =
    listingType === 'rent' &&
    ((mode === 'create' && customListing) ||
      (mode === 'edit' && !isTemplateBased)) &&
    Array.isArray(manualVariants) &&
    manualVariants.length > 0;

  /** Own sell prices when not applying an admin listing template from catalog. */
  const manualSellSalesConfiguration =
    listingType === 'sell' && !fullTemplate && !showPerVariantSalesConfig;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="flex min-h-0 w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit Listing' : 'Add New Listing'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              List your product, rental, or service.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="space-y-4 p-4 sm:p-5">
            {/* Listing type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'sell',
                  label: 'Sell Product',
                  sub: 'One-time purchase',
                  rowIcon: 'tag',
                },
                {
                  id: 'rent',
                  label: 'Rent Out',
                  sub: 'Monthly rental',
                  rowIcon: 'rent',
                },
                {
                  id: 'service',
                  label: 'Offer Service',
                  sub: 'Hourly / fixed',
                  rowIcon: null,
                },
              ].map((opt) => {
                const selected = listingType === opt.id;
                const isRowLayout =
                  opt.rowIcon === 'rent' || opt.rowIcon === 'tag';
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={
                      opt.id === 'service'
                        ? mode !== 'create' || !onOpenServiceProduct
                        : false
                    }
                    onClick={() =>
                      opt.id === 'service'
                        ? onOpenServiceProduct?.()
                        : (() => {
                            const nextKind = opt.id;
                            setListingType(nextKind);
                            setCondition((prev) =>
                              nextKind === 'sell'
                                ? normalizeConditionForListingType(prev, 'Sell')
                                : normalizeConditionForListingType(
                                    prev,
                                    'Rental',
                                    true,
                                  ),
                            );
                            setCustomListing(false);
                            setExpandedVariantId(null);
                            setFullTemplate(null);
                            setSelectedTemplateId(null);
                            setSearchQuery('');
                            setListedSearchQuery('');
                            setListedCategoryFilter('');
                            setListedFilterPanelOpen(false);
                            setProductName('');
                            setBrand('');
                            setDescription('');
                            setSpecs({});
                            setExistingImages([]);
                            setNewImages([]);
                            setManualVariants([]);
                          })()
                    }
                    className={`rounded-xl border-2 transition ${
                      isRowLayout
                        ? 'flex flex-row items-center justify-center gap-3 px-4 py-3.5'
                        : 'flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center'
                    } ${
                      selected
                        ? 'border-blue-500  ring-1 ring-blue-200 bg-white'
                        : 'border-gray-200 bg-white opacity-60'
                    } ${
                      opt.id === 'service' &&
                      (mode !== 'create' || !onOpenServiceProduct)
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer opacity-100'
                    }`}
                  >
                    {isRowLayout ? (
                      <>
                        {opt.rowIcon === 'rent' ? (
                          <RentOutListingIcon className="h-6 w-6 shrink-0 object-contain" />
                        ) : (
                          <Tag
                            className="h-6 w-6 shrink-0 text-gray-600"
                            strokeWidth={2}
                            aria-hidden
                          />
                        )}
                        <div className="min-w-0 text-left">
                          <p
                            className={`text-sm font-semibold leading-tight ${
                              selected ? 'text-blue-600' : 'text-gray-900'
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                            {opt.sub}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p
                          className={`text-sm font-semibold ${
                            selected ? 'text-blue-600' : 'text-gray-900'
                          }`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-[11px] leading-snug text-gray-500">
                          {opt.sub}
                        </p>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <>
              {/* Category / subcategory (from template or manual) */}
              <SectionCard
                icon={Tag}
                headerIconBoxed
                title={
                  listingType === 'sell'
                    ? 'What are you listing?'
                    : 'What are you renting?'
                }
                subtitle="Select category to see relevant fields"
              >
                <div className="w-full space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Step 1: Main Category{' '}
                      <span className="text-red-500">*</span>
                    </p>
                    {filteredCategories.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">
                        No categories available for this listing type.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {filteredCategories.map((c) => {
                          const selected = categoryId === c._id;
                          const asset = categoryOrSubAssetUrl(c);
                          return (
                            <button
                              key={c._id}
                              type="button"
                              disabled={detailsLocked}
                              onClick={() => {
                                if (detailsLocked) return;
                                setCategoryId(c._id);
                                setSubCategoryId('');
                              }}
                              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
                                selected
                                  ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
                              } disabled:cursor-not-allowed disabled:opacity-90 disabled:hover:border-gray-200 disabled:hover:bg-white`}
                            >
                              {asset ? (
                                <img
                                  src={asset}
                                  alt=""
                                  className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
                                    selected ? '' : 'opacity-90'
                                  }`}
                                />
                              ) : (
                                <Package
                                  className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
                                    selected
                                      ? 'text-orange-500'
                                      : 'text-gray-400'
                                  }`}
                                  strokeWidth={1.75}
                                />
                              )}
                              <span
                                className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
                                  selected ? 'text-orange-600' : 'text-gray-600'
                                }`}
                              >
                                {c.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Step 2: Sub Category{' '}
                      <span className="text-red-500">*</span>
                    </p>
                    {!categoryId ? ( */}
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Step 2: Sub Category{' '}
                        <span className="text-red-500">*</span>
                      </p>
                      {categoryId && !detailsLocked ? (
                        <button
                          type="button"
                          onClick={() => setSubCatCreateOpen((v) => !v)}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                          {subCatCreateOpen ? 'Cancel' : 'Sub Category'}
                        </button>
                      ) : null}
                    </div>

                    {!categoryId ? (
                      <p className="text-sm text-gray-500 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center">
                        Choose a main category first.
                      </p>
                    ) : filteredSubCategories.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">
                        No sub-categories for this category yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {filteredSubCategories.map((s) => {
                          const selected = subCategoryId === s._id;
                          const asset = categoryOrSubAssetUrl(s);
                          return (
                            <button
                              key={s._id}
                              type="button"
                              disabled={detailsLocked}
                              onClick={() => {
                                if (detailsLocked) return;
                                setSubCategoryId(s._id);
                              }}
                              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
                                selected
                                  ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
                              } disabled:cursor-not-allowed disabled:opacity-90 disabled:hover:border-gray-200 disabled:hover:bg-white`}
                            >
                              {asset ? (
                                <img
                                  src={asset}
                                  alt=""
                                  className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
                                    selected ? '' : 'opacity-90'
                                  }`}
                                />
                              ) : (
                                <Package
                                  className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
                                    selected
                                      ? 'text-orange-500'
                                      : 'text-gray-400'
                                  }`}
                                  strokeWidth={1.75}
                                />
                              )}
                              <span
                                className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
                                  selected ? 'text-orange-600' : 'text-gray-600'
                                }`}
                              >
                                {s.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* <p className="w-full text-xs text-gray-500">
                  {fullTemplate
                    ? 'Tiles reflect the standard catalog product you added below (read-only).'
                    : customListing
                      ? 'Pick main and sub category tiles above. Your listed products below are for reference.'
                      : 'Pick tiles above, or add a standard product below to set category and sub-category from the catalog.'}
                </p> */}
                </div>
              </SectionCard>

              {/* Standard admin templates vs. your listings (custom listing — read-only, no Add) */}
              {mode === 'create' && customListing ? (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {/* <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/90">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Your listed products
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Reference only — add a new custom listing in the form below.
                  </p>
                </div> */}
                  <div className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="search"
                          value={listedSearchQuery}
                          onChange={(e) => setListedSearchQuery(e.target.value)}
                          placeholder="Search your Listed Products"
                          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setListedFilterPanelOpen((v) => !v)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 shrink-0"
                      >
                        <Filter className="h-4 w-4 text-gray-500" aria-hidden />
                        Filter
                      </button>
                    </div>
                    {listedFilterPanelOpen ? (
                      <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2">
                        <label className="text-[11px] font-medium text-gray-500">
                          Category
                        </label>
                        <select
                          value={listedCategoryFilter}
                          onChange={(e) =>
                            setListedCategoryFilter(e.target.value)
                          }
                          className="mt-1 w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">All categories</option>
                          {listedCategoryOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <div className="max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
                      {vendorProductsLoading &&
                      vendorProductsForActiveListing.length === 0 ? (
                        <p className="p-8 text-center text-sm text-gray-500">
                          Loading your products…
                        </p>
                      ) : filteredListedProducts.length === 0 ? (
                        <p className="p-8 text-center text-sm text-gray-500">
                          {vendorProductsForActiveListing.length === 0
                            ? listingType === 'sell'
                              ? 'You have no sell listings yet.'
                              : 'You have no rental listings yet.'
                            : 'No products match your search or filter.'}
                        </p>
                      ) : (
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
                            <tr>
                              <th className="px-3 py-2 font-medium">Product</th>
                              <th className="px-3 py-2 font-medium hidden sm:table-cell">
                                Category
                              </th>
                              <th className="px-3 py-2 font-medium hidden md:table-cell">
                                Sub-category
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredListedProducts.map((p) => (
                              <tr key={p._id} className="hover:bg-gray-50/80">
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={
                                        p.images?.[0] ||
                                        p.image ||
                                        PLACEHOLDER_IMG
                                      }
                                      alt=""
                                      className="h-11 w-11 rounded-lg object-cover border border-gray-100"
                                    />
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-none">
                                        {p.productName || '—'}
                                      </p>
                                      <p className="text-[11px] text-gray-500">
                                        {listedProductPriceSubtitle(p)}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2 hidden sm:table-cell text-gray-600">
                                  {p.category || '—'}
                                </td>
                                <td className="px-3 py-2 hidden md:table-cell text-gray-600">
                                  {p.subCategory || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {/* <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/90">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Search Standard Listed Products
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Admin templates — Add loads catalog data into this form.
                  </p>
                </div> */}
                  <div className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by Product Name or SKU..."
                          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                      {mode === 'create' ? (
                        <button
                          type="button"
                          onClick={onCustomListing}
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 shrink-0"
                        >
                          + Custom Listing
                        </button>
                      ) : null}
                    </div>
                    <div className="max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
                      {loadingList && templates.length === 0 ? (
                        <p className="p-8 text-center text-sm text-gray-500">
                          Loading templates…
                        </p>
                      ) : filteredTemplates.length === 0 ? (
                        <p className="p-8 text-center text-sm text-gray-500">
                          No templates match your search or filter.
                        </p>
                      ) : (
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
                            <tr>
                              <th className="px-3 py-2 font-medium">Product</th>
                              <th className="px-3 py-2 font-medium hidden sm:table-cell">
                                Category
                              </th>
                              <th className="px-3 py-2 font-medium hidden md:table-cell">
                                Sub-category
                              </th>
                              <th className="px-3 py-2 font-medium w-24 text-right">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredTemplates.map((row) => {
                              const templateKey = `${String(
                                row.productName || '',
                              )
                                .trim()
                                .toLowerCase()}|${String(row.category || '')
                                .trim()
                                .toLowerCase()}|${String(row.subCategory || '')
                                .trim()
                                .toLowerCase()}`;
                              const added =
                                selectedTemplateId === row._id ||
                                alreadyAddedTemplateKeys.has(templateKey);
                              return (
                                <tr
                                  key={row._id}
                                  className="hover:bg-gray-50/80"
                                >
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={
                                          row.images?.[0] ||
                                          row.image ||
                                          PLACEHOLDER_IMG
                                        }
                                        alt=""
                                        className="h-11 w-11 rounded-lg object-cover border border-gray-100"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-none">
                                          {row.productName}
                                        </p>
                                        {row.sku ? (
                                          <p className="text-[11px] text-gray-400">
                                            SKU: {row.sku}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 hidden sm:table-cell text-gray-600">
                                    {row.category || '—'}
                                  </td>
                                  <td className="px-3 py-2 hidden md:table-cell text-gray-600">
                                    {row.subCategory || '—'}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {/* {added ? (
                                      <span className="text-sm font-medium text-emerald-600">
                                        Added
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={!!applyLoadingId}
                                        onClick={() => applyTemplate(row)}
                                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                      >
                                        {applyLoadingId === row._id
                                          ? '…'
                                          : 'Add'}
                                      </button>
                                    )} */}
                                    {added ? (
                                      <button
                                        type="button"
                                        disabled
                                        title="You have already added this product"
                                        className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 cursor-not-allowed"
                                      >
                                        Added
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={!!applyLoadingId}
                                        onClick={() => applyTemplate(row)}
                                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                      >
                                        {applyLoadingId === row._id
                                          ? '…'
                                          : 'Add'}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {showDetailSections ? (
                <>
                  <div
                    className={
                      mode === 'create' && customListing
                        ? 'flex flex-col gap-6'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {/* {!(mode === 'create' && customListing) ? (
                      <div>
                        <SectionCard
                          title="Product Media"
                          icon={detailsLocked ? null : ImageIcon}
                          badge={
                            <GreenVerifiedBadge>
                              Catalog Images
                            </GreenVerifiedBadge>
                          }
                          showLock={false}
                        >
                          {detailsLocked ? (
                            <div
                              className="mb-3 flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm"
                              role="img"
                              aria-label="Catalog images are locked"
                            >
                              <Lock
                                className="h-3 w-3"
                                strokeWidth={2}
                                aria-hidden
                              />
                            </div>
                          ) : null}
                          <div className="flex flex-wrap gap-3">
                            {existingImages.map((url, i) => (
                              <div key={`${url}-${i}`} className="relative">
                                <img
                                  src={url}
                                  alt=""
                                  className="h-72 w-64 rounded-xl object-cover border border-gray-200"
                                />
                                <span className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                                  {i + 1}
                                </span>
                              </div>
                            ))}
                            {!detailsLocked &&
                              newImages.map((file, i) => (
                                <div
                                  key={`${file.name}-${i}`}
                                  className="relative"
                                >
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt=""
                                    className="h-24 w-24 rounded-xl object-cover border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setNewImages((prev) =>
                                        prev.filter((_, j) => j !== i),
                                      )
                                    }
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            {!detailsLocked ? (
                              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400">
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    const files = Array.from(
                                      e.target.files || [],
                                    ).slice(
                                      0,
                                      Math.max(
                                        0,
                                        10 -
                                          existingImages.length -
                                          newImages.length,
                                      ),
                                    );
                                    setNewImages((prev) => [...prev, ...files]);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            ) : null}
                          </div>
                        </SectionCard>
                      </div>
                    ) : null} */}
                    {/* {!customListing ? ( */}
                    {(!customListing || mode === 'edit') &&
                    !(mode === 'edit' && !isTemplateBased) ? (
                      <div>
                        <SectionCard
                          title="Product Media"
                          icon={imagesLocked ? null : ImageIcon}
                          badge={
                            <GreenVerifiedBadge>
                              Catalog Images
                            </GreenVerifiedBadge>
                          }
                          showLock={false}
                        >
                          {imagesLocked ? (
                            <div
                              className="mb-3 flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm"
                              role="img"
                              aria-label="Catalog images are locked"
                            >
                              <Lock
                                className="h-3 w-3"
                                strokeWidth={2}
                                aria-hidden
                              />
                            </div>
                          ) : null}

                          {/* NEW: choose selected variant images in edit mode */}
                          {(() => {
                            // const mediaImages =
                            //   mode === 'edit' &&
                            //   isTemplateBased &&
                            //   editModeVariants
                            //     ? (() => {
                            //         // Try variant's own .images first (template API response has these)
                            //         const v =
                            //           editModeVariants[
                            //             selectedTemplateVariantIndex
                            //           ];
                            //         const variantImgs = Array.isArray(v?.images)
                            //           ? v.images.filter(Boolean)
                            //           : [];
                            //         if (variantImgs.length > 0)
                            //           return variantImgs;
                            //         // Fallback: distribute top-level initialData.images across variants
                            //         const allImgs = Array.isArray(
                            //           initialData?.images,
                            //         )
                            //           ? initialData.images.filter(Boolean)
                            //           : [];
                            //         if (allImgs.length === 0)
                            //           return existingImages;
                            //         const total = editModeVariants.length;
                            //         if (total <= 1) return allImgs;
                            //         const perV = Math.ceil(
                            //           allImgs.length / total,
                            //         );
                            //         const idx = selectedTemplateVariantIndex;
                            //         const slice = allImgs.slice(
                            //           idx * perV,
                            //           idx * perV + perV,
                            //         );
                            //         return slice.length > 0 ? slice : allImgs;
                            //       })()
                            //     : existingImages;

                            const isManualEdit =
                              mode === 'edit' && !isTemplateBased;

                            const mediaImages = isManualEdit
                              ? expandedVariant?.existingImages ||
                                existingImages
                              : mode === 'edit' &&
                                  isTemplateBased &&
                                  editModeVariants
                                ? (() => {
                                    const v =
                                      editModeVariants[
                                        selectedTemplateVariantIndex
                                      ];
                                    const variantImgs = Array.isArray(v?.images)
                                      ? v.images.filter(Boolean)
                                      : [];

                                    if (variantImgs.length > 0)
                                      return variantImgs;

                                    const allImgs = Array.isArray(
                                      initialData?.images,
                                    )
                                      ? initialData.images.filter(Boolean)
                                      : [];

                                    if (allImgs.length === 0)
                                      return existingImages;

                                    const total = editModeVariants.length;
                                    if (total <= 1) return allImgs;

                                    const perV = Math.ceil(
                                      allImgs.length / total,
                                    );
                                    const idx = selectedTemplateVariantIndex;

                                    const slice = allImgs.slice(
                                      idx * perV,
                                      idx * perV + perV,
                                    );

                                    return slice.length > 0 ? slice : allImgs;
                                  })()
                                : existingImages;

                            return (
                              <div className="flex flex-wrap gap-3">
                                {mediaImages.map((url, i) => (
                                  <div key={`${url}-${i}`} className="relative">
                                    <img
                                      src={url}
                                      alt=""
                                      className="h-72 w-64 rounded-xl object-cover border border-gray-200"
                                    />
                                    <span className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                                      {i + 1}
                                    </span>
                                  </div>
                                ))}
                                {!imagesLocked &&
                                  newImages.map((file, i) => (
                                    <div
                                      key={`${file.name}-${i}`}
                                      className="relative"
                                    >
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt=""
                                        className="h-24 w-24 rounded-xl object-cover border border-gray-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setNewImages((prev) =>
                                            prev.filter((_, j) => j !== i),
                                          )
                                        }
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}

                                {!imagesLocked ? (
                                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-orange-400">
                                    <span>Upload</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => {
                                        const files = Array.from(
                                          e.target.files || [],
                                        ).slice(
                                          0,
                                          Math.max(
                                            0,
                                            10 -
                                              existingImages.length -
                                              newImages.length,
                                          ),
                                        );
                                        setNewImages((prev) => [
                                          ...prev,
                                          ...files,
                                        ]);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                ) : null}
                              </div>
                            );
                          })()}
                        </SectionCard>
                      </div>
                    ) : null}
                    <div>
                      <SectionCard
                        title={
                          mode === 'create' && customListing
                            ? 'Basic Details'
                            : null
                        }
                        icon={null}
                        // badge={
                        //   mode === 'create' && customListing ? null : (
                        //     <GreenVerifiedBadge>
                        //       Verified Specs
                        //     </GreenVerifiedBadge>
                        //   )
                        // }
                        badge={
                          mode === 'create' &&
                          customListing ? null : isTemplateBased ? (
                            <GreenVerifiedBadge>
                              Verified Specs
                            </GreenVerifiedBadge>
                          ) : null
                        }
                        showLock={detailsLocked}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* <div> */}
                          {/* <label className="text-xs text-gray-500">
                            {mode === 'create' && customListing
                              ? 'Product title'
                              : 'Product name'}
                            {mode === 'create' && customListing ? (
                              <span className="text-red-500"> *</span>
                            ) : null}
                          </label> */}
                          <div>
                            {/* Label OUTSIDE (above) - only for create mode with customListing */}
                            {mode === 'create' && customListing && (
                              <label className="block text-xs text-gray-500 mb-1">
                                Product Title
                                <span className="text-red-500"> *</span>
                              </label>
                            )}

                            <div className="relative">
                              <input
                                value={productName}
                                onChange={(e) =>
                                  !detailsLocked &&
                                  setProductName(e.target.value)
                                }
                                readOnly={detailsLocked}
                                placeholder={
                                  mode === 'create' && customListing
                                    ? 'e.g., Samsung Galaxy S23'
                                    : undefined
                                }
                                className={`w-full rounded-xl border px-3 text-base ${
                                  mode === 'create' && customListing
                                    ? 'py-2.5'
                                    : 'pt-6 pb-2'
                                } ${
                                  fullTemplate && mode === 'create'
                                    ? 'bg-white text-black border-gray-200'
                                    : 'bg-white'
                                }`}
                              />

                              {/* Label INSIDE - only for non-create or non-customListing mode */}
                              {!(mode === 'create' && customListing) && (
                                <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
                                  PRODUCT NAME
                                </label>
                              )}
                            </div>
                          </div>
                          {/* <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            readOnly={detailsLocked}
                            placeholder={
                              mode === 'create' && customListing
                                ? 'e.g., Samsung Galaxy S23'
                                : undefined
                            }
                            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                              fullTemplate && mode === 'create'
                                ? 'bg-gray-50 text-gray-800'
                                : 'bg-white'
                            }`}
                          /> */}
                          {/* </div> */}
                          {/* <div>
                          <label className="text-xs text-gray-500">Brand</label>
                          <input
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            readOnly={detailsLocked}
                            placeholder={
                              mode === 'create' && customListing
                                ? 'e.g., Samsung'
                                : undefined
                            }
                            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                              fullTemplate && mode === 'create'
                                ? 'bg-gray-50'
                                : ''
                            }`}
                          />
                        </div> */}
                          {/* <div>
                          <div className="relative">
                            <input
                              value={brand}
                              onChange={(e) => setBrand(e.target.value)}
                              readOnly={detailsLocked}
                              placeholder={
                                mode === 'create' && customListing
                                  ? 'e.g., Samsung'
                                  : undefined
                              }
                              className={`w-full rounded-xl border px-3 pt-6 pb-2 text-sm ${
                                fullTemplate && mode === 'create'
                                  ? 'bg-white text-black border-gray-200'
                                  : 'bg-white'
                              }`}
                            />
                            <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none">
                              BRAND
                            </label>
                          </div>
                        </div> */}

                          <div>
                            {/* Label OUTSIDE (above) - only for create mode with customListing */}
                            {mode === 'create' && customListing && (
                              <label className="block text-xs text-gray-500 mb-1">
                                Brand
                              </label>
                            )}

                            <div className="relative">
                              <input
                                value={brand}
                                onChange={(e) =>
                                  !detailsLocked && setBrand(e.target.value)
                                }
                                readOnly={detailsLocked}
                                placeholder={
                                  mode === 'create' && customListing
                                    ? 'e.g., Samsung'
                                    : undefined
                                }
                                className={`w-full rounded-xl border px-3 text-base ${
                                  mode === 'create' && customListing
                                    ? 'py-2.5'
                                    : 'pt-6 pb-2'
                                } ${
                                  fullTemplate && mode === 'create'
                                    ? 'bg-white text-black border-gray-200'
                                    : 'bg-white'
                                }`}
                              />

                              {/* Label INSIDE - only for non-create or non-customListing mode */}
                              {!(mode === 'create' && customListing) && (
                                <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
                                  BRAND
                                </label>
                              )}
                            </div>
                          </div>
                          {/* <div>
                          <label className="text-xs text-gray-500">
                            Condition
                            {mode === 'create' && customListing ? (
                              <span className="text-red-500"> *</span>
                            ) : null}
                          </label>
                          <select
                            value={normalizeConditionForListingType(
                              condition,
                              listingType === 'sell' ? 'Sell' : 'Rental',
                              listingType === 'rent' && !detailsLocked,
                            )}
                            onChange={(e) => setCondition(e.target.value)}
                            disabled={detailsLocked}
                            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                              fullTemplate && mode === 'create'
                                ? 'bg-gray-50'
                                : ''
                            }`}
                          >
                            {conditionSelectOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div> */}
                          <div>
                            {/* Label OUTSIDE (above) - only for create mode with customListing */}
                            {mode === 'create' && customListing && (
                              <label className="block text-xs text-gray-500 mb-1">
                                Condition
                                <span className="text-red-500"> *</span>
                              </label>
                            )}

                            <div className="relative">
                              <select
                                value={normalizeConditionForListingType(
                                  condition,
                                  listingType === 'sell' ? 'Sell' : 'Rental',
                                  listingType === 'rent' && !detailsLocked,
                                )}
                                onChange={(e) =>
                                  !detailsLocked && setCondition(e.target.value)
                                }
                                disabled={detailsLocked}
                                className={`w-full rounded-xl border px-3 text-base ${
                                  mode === 'create' && customListing
                                    ? 'py-2.5'
                                    : 'pt-6 pb-2'
                                } ${
                                  fullTemplate && mode === 'create'
                                    ? 'bg-white text-black border-gray-200'
                                    : 'bg-white'
                                }`}
                              >
                                {conditionSelectOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>

                              {/* Label INSIDE - only for non-create or non-customListing mode */}
                              {!(mode === 'create' && customListing) && (
                                <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
                                  CONDITION
                                </label>
                              )}
                            </div>
                          </div>
                          {/* <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500">
                      Short description
                    </label>
                    <input
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      readOnly={detailsLocked}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                        fullTemplate && mode === 'create' ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div> */}
                          {/* <div className="sm:col-span-2">
                          <label className="text-xs text-gray-500">
                            Description
                            {mode === 'create' && customListing ? (
                              <span className="text-red-500"> *</span>
                            ) : null}
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            readOnly={detailsLocked}
                            rows={3}
                            placeholder={
                              mode === 'create' && customListing
                                ? 'Provide detailed description including key features, condition, etc.'
                                : undefined
                            }
                            className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
                              fullTemplate && mode === 'create'
                                ? 'bg-gray-50'
                                : ''
                            }`}
                          />
                        </div> */}
                          <div className="sm:col-span-2">
                            {/* Label OUTSIDE (above) - only for create mode with customListing */}
                            {mode === 'create' && customListing && (
                              <label className="block text-xs text-gray-500 mb-1">
                                Description
                                <span className="text-red-500"> *</span>
                              </label>
                            )}

                            <div className="relative">
                              <textarea
                                value={description}
                                onChange={(e) =>
                                  !detailsLocked &&
                                  setDescription(e.target.value)
                                }
                                readOnly={detailsLocked}
                                rows={3}
                                placeholder={
                                  mode === 'create' && customListing
                                    ? 'Provide detailed description including key features, condition, etc.'
                                    : undefined
                                }
                                className={`w-full rounded-xl border px-3 text-base ${
                                  mode === 'create' && customListing
                                    ? 'py-2.5'
                                    : 'pt-6 pb-2'
                                } ${
                                  fullTemplate && mode === 'create'
                                    ? 'bg-white text-black border-gray-200'
                                    : 'bg-white'
                                }`}
                              />

                              {/* Label INSIDE - only for non-create or non-customListing mode */}
                              {!(mode === 'create' && customListing) && (
                                <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
                                  DESCRIPTION
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                        {detailsLocked ? (
                          specEntries.length > 0 ? (
                            // <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            //   {specEntries.map(([k, v]) => (
                            //     <div key={k}>
                            //       <label className="text-xs text-gray-500 capitalize">
                            //         {k}
                            //       </label>
                            //       <input
                            //         value={String(v)}
                            //         readOnly
                            //         className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm"
                            //       />
                            //     </div>
                            //   ))}
                            // </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {specEntries.map(([k, v]) => (
                                <div key={k}>
                                  <div className="relative">
                                    <input
                                      value={String(v)}
                                      readOnly
                                      className="w-full rounded-xl border bg-white px-3 pt-6 pb-2 text-base"
                                    />
                                    <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none uppercase">
                                      {k}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null
                        ) : (mode === 'create' && customListing) ||
                          (mode === 'edit' && !isTemplateBased) ? null : (
                          <div className="mt-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <p className="text-xs font-medium text-gray-800">
                                Product specifications
                              </p>
                              <button
                                type="button"
                                onClick={addSpecRow}
                                className="shrink-0 self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700"
                              >
                                + Add specification
                              </button>
                            </div>
                            <div className="space-y-2">
                              {specRowList.map((row, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-wrap gap-2 items-end rounded-xl border border-gray-100 bg-white p-3"
                                >
                                  <div className="flex-1 min-w-[140px]">
                                    <label className="text-xs text-gray-500">
                                      Label
                                    </label>
                                    <input
                                      value={row.label}
                                      onChange={(e) =>
                                        updateSpecRow(
                                          idx,
                                          'label',
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. Weight"
                                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-[140px]">
                                    <label className="text-xs text-gray-500">
                                      Value
                                    </label>
                                    <input
                                      value={row.value}
                                      onChange={(e) =>
                                        updateSpecRow(
                                          idx,
                                          'value',
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. 200g"
                                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    />
                                  </div>
                                  {specRowList.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => removeSpecRow(idx)}
                                      className="text-xs text-red-600 hover:underline pb-1"
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </SectionCard>
                    </div>
                    {/* {mode === 'create' && customListing ? (
                      <div className="space-y-4 border-t border-gray-200 pt-6"> */}
                    {(mode === 'create' && customListing) ||
                    (mode === 'edit' && !isTemplateBased) ? (
                      <div className="space-y-4 border-t border-gray-200 pt-6">
                        <SectionCard
                          title="Product Variants"
                          subtitle="Add Multiple Product variants"
                          icon={Tag}
                          headerIconBoxed
                          // headerRight={
                          //   mode === 'create' ? (
                          //     <button
                          //       type="button"
                          //       onClick={() => {
                          //         const nv = newManualVariant();
                          //         setManualVariants((prev) => [...prev, nv]);
                          //         setExpandedVariantId(nv.id);
                          //       }}
                          //       className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                          //     >
                          //       + Add Variant
                          //     </button>
                          //   ) : null
                          // }

                          headerRight={
                            <button
                              type="button"
                              onClick={() => {
                                const nv = newManualVariant();
                                setManualVariants((prev) => [...prev, nv]);
                                if (mode === 'edit' && !isTemplateBased) {
                                  setSelectedManualVariantId(nv.id);
                                  setExpandedVariantId(null);
                                } else {
                                  setExpandedVariantId(nv.id);
                                }
                              }}
                              className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                            >
                              + Add Variant
                            </button>
                          }
                        >
                          {manualVariants.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
                              No variants yet. Click{' '}
                              <span className="font-semibold text-gray-700">
                                + Add Variant
                              </span>{' '}
                              to create your first SKU.
                            </div>
                          ) : (
                            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white overflow-hidden">
                              {manualVariants.map((mv) => {
                                const vis = variantPrimaryVisual(mv);
                                const thumbCls =
                                  'h-14 w-14 rounded-lg object-cover border border-gray-100 shrink-0';
                                const active = expandedVariantId === mv.id;

                                return (
                                  // <li
                                  //   key={mv.id}
                                  //   className={`flex items-center gap-3 px-3 py-3 bg-white cursor-pointer transition ${
                                  //     active
                                  //       ? 'bg-violet-50/60'
                                  //       : 'hover:bg-gray-50/80'
                                  //   }`}
                                  //   role="button"
                                  //   tabIndex={0}
                                  //   onClick={() => setExpandedVariantId(mv.id)}
                                  //   onKeyDown={(e) => {
                                  //     if (e.key === 'Enter' || e.key === ' ') {
                                  //       e.preventDefault();
                                  //       setExpandedVariantId(mv.id);
                                  //     }
                                  //   }}
                                  // >
                                  <li
                                    key={mv.id}
                                    className={`flex items-center gap-3 px-3 py-3 bg-white cursor-pointer transition ${
                                      active
                                        ? 'bg-violet-50/60'
                                        : 'hover:bg-gray-50/80'
                                    }`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                      if (mode === 'edit' && !isTemplateBased) {
                                        setSelectedManualVariantId(mv.id);
                                        setExpandedVariantId(null);
                                      } else {
                                        setExpandedVariantId(mv.id);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (
                                          mode === 'edit' &&
                                          !isTemplateBased
                                        ) {
                                          setSelectedManualVariantId(mv.id);
                                          setExpandedVariantId(null);
                                        } else {
                                          setExpandedVariantId(mv.id);
                                        }
                                      }
                                    }}
                                  >
                                    {vis.kind === 'url' ? (
                                      <img
                                        src={vis.url}
                                        alt=""
                                        className={thumbCls}
                                      />
                                    ) : vis.kind === 'file' ? (
                                      <VariantLocalImagePreview
                                        file={vis.file}
                                        className={thumbCls}
                                      />
                                    ) : (
                                      <img
                                        src={PLACEHOLDER_IMG}
                                        alt=""
                                        className={thumbCls}
                                      />
                                    )}
                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2 sm:gap-4">
                                      <div className="min-w-0 flex-1 text-left">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                          {mv.variantName?.trim() ||
                                            'Untitled variant'}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm text-gray-500">
                                          {listingType === 'sell'
                                            ? String(mv.sellPrice || '').trim()
                                              ? `₹${mv.sellPrice}`
                                              : '—'
                                            : (formatFirstTierRentLabel(
                                                mv.rentalTiers,
                                                mv.rentalPricingModel,
                                              ) ?? '—')}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3 sm:gap-8 shrink-0">
                                        <span className="text-sm text-gray-700 hidden sm:inline-block min-w-[4.5rem] text-right truncate">
                                          {categoryName || '—'}
                                        </span>
                                        <span className="text-sm text-gray-700 hidden sm:inline-block min-w-[4rem] text-right truncate">
                                          {subCategoryName || '—'}
                                        </span>
                                        <span className="text-xs text-gray-600 sm:hidden max-w-[4rem] truncate text-right">
                                          {[categoryName, subCategoryName]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                        </span>
                                        {manualVariants.length > 1 ? (
                                          <button
                                            type="button"
                                            aria-label="Delete variant"
                                            title="Delete variant"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setManualVariants((prev) =>
                                                prev.filter(
                                                  (x) => x.id !== mv.id,
                                                ),
                                              );
                                              setExpandedVariantId((cur) =>
                                                cur === mv.id ? null : cur,
                                              );
                                            }}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        ) : (
                                          <span
                                            className="inline-flex h-9 w-9 shrink-0"
                                            aria-hidden
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </SectionCard>

                        {expandedVariant ? (
                          <SectionCard hideHeader title={null} icon={null}>
                            <div className="space-y-5">
                              <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <label className="text-sm font-medium text-gray-900">
                                  Variant Name{' '}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  value={expandedVariant.variantName}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const id = expandedVariant.id;
                                    setManualVariants((prev) =>
                                      prev.map((x) =>
                                        x.id === id
                                          ? { ...x, variantName: val }
                                          : x,
                                      ),
                                    );
                                  }}
                                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                                  placeholder="eg . 5 Seater sofa"
                                />
                              </div>
                              {/* <div>
                            <label className="text-xs text-gray-500">
                              Variant stock (optional)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={expandedVariant.stock}
                              onChange={(e) => {
                                const val = e.target.value;
                                const id = expandedVariant.id;
                                setManualVariants((prev) =>
                                  prev.map((x) =>
                                    x.id === id ? { ...x, stock: val } : x,
                                  ),
                                );
                              }}
                              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                              placeholder="e.g. units for this SKU"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Separate from{' '}
                              <span className="font-medium">
                                Logistics → Inventory count
                              </span>{' '}
                              (overall listing quantity).
                            </p>
                          </div> */}

                              <div className="rounded-xl border border-gray-200 bg-white p-5">
                                <div className="flex items-start gap-3">
                                  {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl  text-violet-600">
                                  <Box
                                    className="h-5 w-5"
                                    strokeWidth={2}
                                    aria-hidden
                                  />
                                </div> */}
                                  <div className="min-w-0 flex-1">
                                    {/* <p className="text-base flex font-semibold text-gray-900">
                                    <Box
                                      className="h-5 w-5 text-violet-600 "
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                    Product Media
                                  </p> */}
                                    <p className="text-base flex items-center gap-2 font-semibold text-gray-900">
                                      <Box
                                        className="h-5 w-5 text-violet-600"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                      Product Media
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                      Upload up to 10 high-quality Media . First
                                      image will be the cover photo.
                                    </p>
                                  </div>
                                </div>

                                {(expandedVariant.existingImages || []).length +
                                  (expandedVariant.newImages || []).length >
                                0 ? (
                                  <div className="mt-4 flex flex-wrap gap-3">
                                    {(expandedVariant.existingImages || []).map(
                                      (url, i) => (
                                        <div
                                          key={`${url}-${i}`}
                                          className="relative"
                                        >
                                          <img
                                            src={url}
                                            alt=""
                                            className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const id = expandedVariant.id;
                                              setManualVariants((prev) =>
                                                prev.map((x) =>
                                                  x.id === id
                                                    ? {
                                                        ...x,
                                                        existingImages:
                                                          x.existingImages.filter(
                                                            (_, j) => j !== i,
                                                          ),
                                                      }
                                                    : x,
                                                ),
                                              );
                                            }}
                                            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ),
                                    )}
                                    {(expandedVariant.newImages || []).map(
                                      (file, i) => (
                                        <div
                                          key={`${file.name}-${file.size}-${i}`}
                                          className="relative"
                                        >
                                          <VariantLocalImagePreview
                                            file={file}
                                            className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const id = expandedVariant.id;
                                              setManualVariants((prev) =>
                                                prev.map((x) =>
                                                  x.id === id
                                                    ? {
                                                        ...x,
                                                        newImages:
                                                          x.newImages.filter(
                                                            (_, j) => j !== i,
                                                          ),
                                                      }
                                                    : x,
                                                ),
                                              );
                                            }}
                                            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : null}

                                <div
                                  className="mt-4"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const id = expandedVariant.id;
                                    const files = Array.from(
                                      e.dataTransfer.files || [],
                                    ).filter((f) =>
                                      String(f.type || '').startsWith('image/'),
                                    );
                                    const used =
                                      (expandedVariant.existingImages?.length ||
                                        0) +
                                      (expandedVariant.newImages?.length || 0);
                                    const next = files.slice(
                                      0,
                                      Math.max(0, 10 - used),
                                    );
                                    if (!next.length) return;
                                    setManualVariants((prev) =>
                                      prev.map((x) =>
                                        x.id === id
                                          ? {
                                              ...x,
                                              newImages: [
                                                ...(x.newImages || []),
                                                ...next,
                                              ],
                                            }
                                          : x,
                                      ),
                                    );
                                  }}
                                >
                                  <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 transition hover:border-violet-300 hover:bg-violet-50/30">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm">
                                      <Upload
                                        className="h-7 w-7"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                    </span>
                                    <span className="mt-3 text-sm font-medium text-gray-700">
                                      Click to upload or drag and drop
                                    </span>
                                    <span className="mt-1 text-xs text-gray-500">
                                      {(expandedVariant.existingImages
                                        ?.length || 0) +
                                        (expandedVariant.newImages?.length ||
                                          0)}
                                      /10 uploaded
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="sr-only"
                                      onChange={(e) => {
                                        const id = expandedVariant.id;
                                        const files = Array.from(
                                          e.target.files || [],
                                        ).slice(
                                          0,
                                          Math.max(
                                            0,
                                            10 -
                                              (expandedVariant.existingImages
                                                ?.length || 0) -
                                              (expandedVariant.newImages
                                                ?.length || 0),
                                          ),
                                        );
                                        setManualVariants((prev) =>
                                          prev.map((x) =>
                                            x.id === id
                                              ? {
                                                  ...x,
                                                  newImages: [
                                                    ...(x.newImages || []),
                                                    ...files,
                                                  ],
                                                }
                                              : x,
                                          ),
                                        );
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              <div className="rounded-xl border border-gray-200 bg-white p-5">
                                {/* <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                    <Box
                                      className="h-5 w-5"
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-base font-semibold text-gray-900">
                                      Product Specifications
                                    </p>
                                    <p className="text-base flex items-center gap-2 font-semibold text-gray-900">
                                      <Box
                                        className="h-5 w-5 text-violet-600"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                      Product Specifications
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                      Add custom attributes for this variant
                                      (material, dimensions, color, etc.).
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const id = expandedVariant.id;
                                    setManualVariants((prev) =>
                                      prev.map((x) =>
                                        x.id === id
                                          ? {
                                              ...x,
                                              specRows: [
                                                ...(x.specRows || []),
                                                emptyVariantSpecRow(),
                                              ],
                                            }
                                          : x,
                                      ),
                                    );
                                  }}
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
                                >
                                  <Plus
                                    className="h-3.5 w-3.5"
                                    strokeWidth={2}
                                  />
                                  Add Custom Specification
                                </button>
                              </div> */}
                                <div className="mb-4">
                                  {/* Top header */}
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                      <div className="min-w-0">
                                        <p className="text-base flex items-center gap-2 font-semibold text-gray-900">
                                          <Box
                                            className="h-5 w-5 text-violet-600"
                                            strokeWidth={2}
                                            aria-hidden
                                          />
                                          Product Specifications
                                        </p>

                                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                          Add custom attributes for this variant
                                          (material, dimensions, color, etc.).
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* NEW ROW (like figma) */}
                                  <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-700">
                                      Custom Specifications
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const id = expandedVariant.id;
                                        setManualVariants((prev) =>
                                          prev.map((x) =>
                                            x.id === id
                                              ? {
                                                  ...x,
                                                  specRows: [
                                                    ...(x.specRows || []),
                                                    emptyVariantSpecRow(),
                                                  ],
                                                }
                                              : x,
                                          ),
                                        );
                                      }}
                                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
                                    >
                                      <Plus
                                        className="h-3.5 w-3.5"
                                        strokeWidth={2}
                                      />
                                      Add Custom Specification
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {(expandedVariant.specRows || []).map(
                                    (row, idx) => (
                                      <div
                                        key={idx}
                                        className="flex flex-wrap items-end gap-3 rounded-xl border border-violet-200 bg-violet-50/50 p-3 sm:flex-nowrap"
                                      >
                                        <div className="min-w-0 flex-1 sm:min-w-[160px]">
                                          <label className="text-xs text-gray-500">
                                            Label
                                          </label>
                                          <input
                                            value={row.label}
                                            onChange={(e) => {
                                              const id = expandedVariant.id;
                                              const v = e.target.value;
                                              setManualVariants((prev) =>
                                                prev.map((x) =>
                                                  x.id === id
                                                    ? {
                                                        ...x,
                                                        specRows:
                                                          x.specRows.map(
                                                            (r, j) =>
                                                              j === idx
                                                                ? {
                                                                    ...r,
                                                                    label: v,
                                                                  }
                                                                : r,
                                                          ),
                                                      }
                                                    : x,
                                                ),
                                              );
                                            }}
                                            placeholder="e.g., Fabric Material"
                                            className="mt-1.5 w-full rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-violet-400/70 focus:border-violet-500 focus:bg-white focus:ring-1 focus:ring-violet-200"
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1 sm:min-w-[160px]">
                                          <label className="text-xs text-gray-500">
                                            Value
                                          </label>
                                          <input
                                            value={row.value}
                                            onChange={(e) => {
                                              const id = expandedVariant.id;
                                              const v = e.target.value;
                                              setManualVariants((prev) =>
                                                prev.map((x) =>
                                                  x.id === id
                                                    ? {
                                                        ...x,
                                                        specRows:
                                                          x.specRows.map(
                                                            (r, j) =>
                                                              j === idx
                                                                ? {
                                                                    ...r,
                                                                    value: v,
                                                                  }
                                                                : r,
                                                          ),
                                                      }
                                                    : x,
                                                ),
                                              );
                                            }}
                                            placeholder="e.g., Velvet"
                                            className="mt-1.5 w-full rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-violet-400/70 focus:border-violet-500 focus:bg-white focus:ring-1 focus:ring-violet-200"
                                          />
                                        </div>
                                        {(expandedVariant.specRows || [])
                                          .length > 1 ? (
                                          <button
                                            type="button"
                                            title="Remove row"
                                            onClick={() => {
                                              const id = expandedVariant.id;
                                              setManualVariants((prev) =>
                                                prev.map((x) =>
                                                  x.id === id
                                                    ? {
                                                        ...x,
                                                        specRows: (() => {
                                                          const next = (
                                                            x.specRows || []
                                                          ).filter(
                                                            (_, j) => j !== idx,
                                                          );
                                                          return next.length
                                                            ? next
                                                            : [
                                                                emptyVariantSpecRow(),
                                                              ];
                                                        })(),
                                                      }
                                                    : x,
                                                ),
                                              );
                                            }}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-100 text-rose-600 transition hover:bg-rose-200"
                                          >
                                            <X
                                              className="h-4 w-4"
                                              strokeWidth={2}
                                            />
                                          </button>
                                        ) : null}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                              {/* 
                            <p className="text-xs text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                              Rental / sell pricing, rental terms, and
                              refundable deposit below apply to this whole
                              listing (all variants).
                            </p> */}
                              {listingType === 'rent' ? (
                                <div className="rounded-xl border border-gray-200 bg-white p-5">
                                  <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <DollarSign
                                        className="h-5 w-5 text-emerald-600"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                      <p className="text-base font-semibold text-gray-900">
                                        Rental Configuration
                                      </p>
                                    </div>
                                    <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          switchVariantRentalPricingModel(
                                            expandedVariant.id,
                                            'month',
                                          )
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                          (expandedVariant.rentalPricingModel ||
                                            'day') === 'month'
                                            ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                      >
                                        <Calendar className="h-3.5 w-3.5" />
                                        Month-wise
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          switchVariantRentalPricingModel(
                                            expandedVariant.id,
                                            'day',
                                          )
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                          (expandedVariant.rentalPricingModel ||
                                            'day') === 'day'
                                            ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                      >
                                        <Clock className="h-3.5 w-3.5" />
                                        Day-wise
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-3">
                                    Set competitive rental prices for different
                                    tenure options.
                                  </p>
                                  {!String(categoryName || '').trim() ||
                                  !String(subCategoryName || '').trim() ? (
                                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                                      Select category and sub-category above to
                                      load market-low benchmarks for each term.
                                    </p>
                                  ) : null}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {(expandedVariant.rentalTiers || []).map(
                                      (tier, i) => {
                                        const model =
                                          expandedVariant.rentalPricingModel ||
                                          'day';
                                        const isDayModel = model === 'day';
                                        const tenureLen = isDayModel
                                          ? toNum(tier.days, 0)
                                          : toNum(tier.months, 0);
                                        const lowMap = isDayModel
                                          ? marketLowTenures.day
                                          : marketLowTenures.month;
                                        const perUnit =
                                          tenureLen > 0
                                            ? (lowMap?.[tenureLen] ??
                                              lowMap?.[String(tenureLen)])
                                            : undefined;
                                        const hasLow =
                                          perUnit != null &&
                                          Number.isFinite(Number(perUnit)) &&
                                          Number(perUnit) > 0;
                                        const marketLine = marketLowLoading
                                          ? 'Loading…'
                                          : hasLow
                                            ? isDayModel
                                              ? `₹${formatInrCompact(Number(perUnit))}/day`
                                              : `₹${formatInrCompact(Number(perUnit))}/mo`
                                            : '—';
                                        const onMatchLowest = () => {
                                          if (!hasLow || tenureLen <= 0) return;
                                          const total = Math.round(
                                            Number(perUnit) * tenureLen,
                                          );
                                          updateVariantRentalTier(
                                            expandedVariant.id,
                                            i,
                                            'monthlyRent',
                                            String(total),
                                          );
                                        };
                                        return (
                                          <div
                                            key={i}
                                            className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm space-y-2.5"
                                          >
                                            {tier.bestValue ? (
                                              <span className="absolute top-2 right-2 rounded-full bg-orange-500 text-[9px] font-bold text-white px-2 py-0.5">
                                                POPULAR
                                              </span>
                                            ) : null}
                                            <div className="pr-14">
                                              <p className="text-sm font-semibold text-gray-900">
                                                {String(
                                                  tier.label || '',
                                                ).trim() ||
                                                  (isDayModel
                                                    ? `${tier.days ?? 0} Days`
                                                    : `${tier.months ?? 0} Months`)}
                                              </p>
                                            </div>
                                            <div className="rounded-lg border border-gray-300 px-2.5 py-2">
                                              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                                <TrendingDown
                                                  className="h-3.5 w-3.5 shrink-0 text-emerald-700"
                                                  strokeWidth={2.5}
                                                />
                                                Market low
                                              </div>
                                              <p className="text-sm font-semibold text-emerald-700 tabular-nums mt-0.5">
                                                {marketLine}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                Your price
                                              </label>
                                              <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20">
                                                <span className="flex items-center px-2.5 text-blue-500 text-sm bg-gray-50 border-r border-gray-200">
                                                  ₹
                                                </span>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  value={tier.monthlyRent}
                                                  onChange={(e) =>
                                                    updateVariantRentalTier(
                                                      expandedVariant.id,
                                                      i,
                                                      'monthlyRent',
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="w-full min-w-0 py-2 px-2 text-sm outline-none"
                                                  placeholder="0"
                                                />
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              disabled={!hasLow}
                                              onClick={onMatchLowest}
                                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              <Zap className="h-3.5 w-3.5" />
                                              Match lowest
                                            </button>
                                            {i >= 1 ? (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeVariantRentalTier(
                                                    expandedVariant.id,
                                                    i,
                                                  )
                                                }
                                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                                              >
                                                <X className="h-3.5 w-3.5" />
                                                Remove term
                                              </button>
                                            ) : null}
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addVariantRentalTier(expandedVariant.id)
                                    }
                                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 sm:w-auto"
                                  >
                                    + Add more term
                                  </button>
                                </div>
                              ) : null}
                              {listingType === 'sell' ? (
                                <div className="rounded-xl border border-gray-200 bg-white p-5">
                                  <div className="mb-3 flex items-center gap-2">
                                    <Tag
                                      className="h-5 w-5 text-violet-600"
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                    <p className="text-base font-semibold text-gray-900">
                                      Sales Configuration
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs text-gray-500">
                                        Selling Price (₹){' '}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={expandedVariant.sellPrice || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const id = expandedVariant.id;
                                          setManualVariants((prev) =>
                                            prev.map((x) =>
                                              x.id === id
                                                ? { ...x, sellPrice: val }
                                                : x,
                                            ),
                                          );
                                        }}
                                        placeholder="e.g., 54999"
                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500">
                                        MRP{' '}
                                        <span className="font-normal text-gray-400">
                                          (Optional)
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={expandedVariant.mrpPrice || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const id = expandedVariant.id;
                                          setManualVariants((prev) =>
                                            prev.map((x) =>
                                              x.id === id
                                                ? { ...x, mrpPrice: val }
                                                : x,
                                            ),
                                          );
                                        }}
                                        placeholder="e.g., 70000"
                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => setExpandedVariantId(null)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 sm:w-auto"
                              >
                                Done
                              </button>
                            </div>
                          </SectionCard>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {/* {fullTemplate && displayVariants.length > 0 ? ( */}

                  {(fullTemplate || (mode === 'edit' && isTemplateBased)) &&
                  displayVariants.length > 0 ? (
                    <SectionCard
                      title="Product Variants"
                      icon={Tag}
                      headerIconBoxed
                    >
                      {/* <p className="text-xs text-gray-500 mb-3">
                      Add multiple product variants — tap a row to edit specs.
                      Remove any SKU you do not offer.
                    </p> */}
                      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white overflow-hidden">
                        {displayVariants.map(({ index, v }) => {
                          const active = selectedTemplateVariantIndex === index;
                          // const rentalPreview =
                          //   listingType === 'rent'
                          //     ? templateVariantRentalSubtitle(
                          //         fullTemplate,
                          //         index,
                          //         listingType,
                          //       )
                          //     : null;
                          const rentalPreview =
                            listingType === 'rent'
                              ? templateVariantRentalSubtitle(
                                  fullTemplate,
                                  index,
                                  listingType,
                                  categories.find(
                                    (c) => c.name === categoryName,
                                  )?.commissionRate,
                                )
                              : null;
                          // const priceLine =
                          //   listingType === 'sell'
                          //     ? (() => {
                          //         const fromV = String(v.price ?? '').trim();
                          //         if (fromV) {
                          //           const n = Number(fromV.replace(/,/g, ''));
                          //           return Number.isFinite(n)
                          //             ? `₹${n.toLocaleString('en-IN')}`
                          //             : `₹${fromV}`;
                          //         }
                          //         const fromForm = String(
                          //           sellPrice ?? '',
                          //         ).trim();
                          //         if (fromForm) {
                          //           const n = Number(
                          //             fromForm.replace(/,/g, ''),
                          //           );
                          //           return Number.isFinite(n)
                          //             ? `₹${n.toLocaleString('en-IN')}`
                          //             : `₹${fromForm}`;
                          //         }
                          //         return '';
                          //       })()
                          //     : rentalPreview || String(v.price || '').trim();
                          const priceLine =
                            listingType === 'sell'
                              ? (() => {
                                  const vCfg = getTemplateVariantSaleConfig(
                                    fullTemplate,
                                    index,
                                  );
                                  if (vCfg.sellPrice) {
                                    const n = Number(vCfg.sellPrice);
                                    return Number.isFinite(n)
                                      ? `₹${n.toLocaleString('en-IN')}`
                                      : `₹${vCfg.sellPrice}`;
                                  }
                                  const fromV = String(v.price ?? '').trim();
                                  if (fromV) {
                                    const n = Number(fromV.replace(/,/g, ''));
                                    return Number.isFinite(n)
                                      ? `₹${n.toLocaleString('en-IN')}`
                                      : `₹${fromV}`;
                                  }
                                  return '';
                                })()
                              : rentalPreview ||
                                editModeVariantRentalSubtitle(v) ||
                                String(v.price || '').trim();
                          return (
                            <li
                              key={index}
                              onClick={() =>
                                setSelectedTemplateVariantIndex(index)
                              }
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setSelectedTemplateVariantIndex(index);
                                }
                              }}
                              className={`flex cursor-pointer items-center gap-3 bg-white px-3 py-3 transition ${
                                active
                                  ? 'bg-violet-50/60'
                                  : 'hover:bg-gray-50/80'
                              }`}
                            >
                              {/* <img
                              src={
                                v.images?.[0] ||
                                existingImages[0] ||
                                PLACEHOLDER_IMG
                              } */}
                              <img
                                src={
                                  v.images?.[0] ||
                                  (editModeVariants &&
                                  Array.isArray(initialData?.images)
                                    ? initialData.images[index] ||
                                      initialData.images[0]
                                    : null) ||
                                  existingImages[0] ||
                                  PLACEHOLDER_IMG
                                }
                                alt=""
                                className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover"
                              />
                              <div className="min-w-0 flex-1 text-left">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {v.variantName || 'Variant'}
                                </p>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  {priceLine || '—'}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-3 sm:gap-8">
                                <span className="hidden min-w-[4.5rem] text-right text-sm text-gray-700 sm:inline-block truncate">
                                  {categoryName || '—'}
                                </span>
                                <span className="hidden min-w-[4rem] text-right text-sm text-gray-700 sm:inline-block truncate">
                                  {subCategoryName || '—'}
                                </span>
                                <span className="max-w-[4rem] truncate text-right text-xs text-gray-600 sm:hidden">
                                  {[categoryName, subCategoryName]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                                </span>
                                {!detailsLocked ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeVariantIndex(index);
                                    }}
                                    className="shrink-0 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                    aria-label="Remove variant"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                ) : (
                                  <span
                                    className="inline-flex h-9 w-9 shrink-0"
                                    aria-hidden
                                  />
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </SectionCard>
                  ) : null}
                  {listingType !== 'sell' && !showPerVariantRentalConfig ? (
                    <SectionCard
                      title="Pricing model"
                      icon={null}
                      showLock={rentalFieldsLocked}
                    >
                      {!rentalFieldsLocked ? (
                        <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                            {/* <button
                              type="button"
                              onClick={() => setRentalPricingModel('month')}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                rentalPricingModel === 'month'
                                  ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              Month-wise
                            </button>
                            <button
                              type="button"
                              onClick={() => setRentalPricingModel('day')}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                rentalPricingModel === 'day'
                                  ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Day-wise
                            </button> */}
                            <button
                              type="button"
                              onClick={() => switchRentalPricingModel('month')}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                rentalPricingModel === 'month'
                                  ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              Month-wise
                            </button>
                            <button
                              type="button"
                              onClick={() => switchRentalPricingModel('day')}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                rentalPricingModel === 'day'
                                  ? 'border border-amber-200 bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Day-wise
                            </button>
                          </div>
                          {/* <button
                            type="button"
                            onClick={addRentalTier}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 sm:w-auto sm:self-center"
                          >
                            + Add more term
                          </button> */}
                          {!(
                            isCustomRentalPricing &&
                            rentalPricingModel === 'day'
                          ) ? (
                            <button
                              type="button"
                              onClick={addRentalTier}
                              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600 sm:w-auto sm:self-center"
                            >
                              + Add more term
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="mb-4 flex gap-3 border-b border-gray-100 pb-4">
                        {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center  text-emerald-600">
                        <DollarSign className="h-5 w-5" strokeWidth={2} />
                      </div> */}
                        <div className="min-w-0">
                          <h4 className="text-sm flex  font-semibold text-gray-900">
                            <DollarSign
                              className="h-5 w-5  text-emerald-600"
                              strokeWidth={2}
                            />
                            Rental configuration
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {isCustomRentalPricing
                              ? `Set competitive rental prices for different tenure options.`
                              : ''}
                          </p>
                          {/* {rentalFieldsLocked ? (
                          <p className="mt-2 text-xs text-gray-600">
                            Tenure type:{' '}
                            <span className="font-semibold text-gray-800">
                              {rentalPricingModel === 'day'
                                ? 'Day-wise'
                                : 'Month-wise'}
                            </span>{' '}
                            (catalog — read-only)
                          </p>
                        ) : null} */}
                        </div>
                      </div>
                      {isCustomRentalPricing ? (
                        <div className="space-y-4">
                          {!String(categoryName || '').trim() ||
                          !String(subCategoryName || '').trim() ? (
                            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              Select category and sub-category above to load
                              market-low benchmarks for each term.
                            </p>
                          ) : null}
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {rentalTiers.map((tier, i) => {
                              const isDayModel = rentalPricingModel === 'day';
                              const tenureLen = isDayModel
                                ? toNum(tier.days, 0)
                                : toNum(tier.months, 0);
                              const lowMap = isDayModel
                                ? marketLowTenures.day
                                : marketLowTenures.month;
                              const perUnit =
                                tenureLen > 0
                                  ? (lowMap?.[tenureLen] ??
                                    lowMap?.[String(tenureLen)])
                                  : undefined;
                              const hasLow =
                                perUnit != null &&
                                Number.isFinite(Number(perUnit)) &&
                                Number(perUnit) > 0;
                              const marketLine = marketLowLoading
                                ? 'Loading…'
                                : hasLow
                                  ? isDayModel
                                    ? `₹${formatInrCompact(Number(perUnit))}/day`
                                    : `₹${formatInrCompact(Number(perUnit))}/mo`
                                  : '—';
                              const onMatchLowest = () => {
                                if (!hasLow || tenureLen <= 0) return;
                                const total = Math.round(
                                  Number(perUnit) * tenureLen,
                                );
                                updateTier(i, 'monthlyRent', String(total));
                              };
                              return (
                                <div
                                  key={i}
                                  className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm space-y-2.5"
                                >
                                  {tier.bestValue ? (
                                    <span className="absolute top-2 right-2 rounded-full bg-orange-500 text-[9px] font-bold text-white px-2 py-0.5">
                                      POPULAR
                                    </span>
                                  ) : null}
                                  {/* {!rentalFieldsLocked ? (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <label className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                                      Tenure ({isDayModel ? 'days' : 'months'})
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={isDayModel ? 90 : 60}
                                      value={
                                        isDayModel
                                          ? (tier.days ?? '')
                                          : (tier.months ?? '')
                                      }
                                      onChange={(e) => {
                                        const v = Math.max(
                                          1,
                                          toNum(e.target.value, 1),
                                        );
                                        if (isDayModel) {
                                          patchTier(i, {
                                            days: v,
                                            label: `${v} Days`,
                                          });
                                        } else {
                                          patchTier(i, {
                                            months: v,
                                            label: `${v} Months`,
                                          });
                                        }
                                      }}
                                      className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                                    />
                                  </div>
                                ) : null} */}
                                  <div className="pr-14">
                                    {/* <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                    {tier.tierLabel || 'Term'}
                                  </p> */}
                                    <p className="text-sm font-semibold text-gray-900">
                                      {String(tier.label || '').trim() ||
                                        (isDayModel
                                          ? `${tier.days ?? 0} Days`
                                          : `${tier.months ?? 0} Months`)}
                                    </p>
                                  </div>
                                  <div className="rounded-lg  border border-gray-300 px-2.5 py-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                      <TrendingDown
                                        className="h-3.5 w-3.5 shrink-0 text-emerald-700"
                                        strokeWidth={2.5}
                                      />
                                      Market low
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-700 tabular-nums mt-0.5">
                                      {marketLine}
                                    </p>
                                    {/* <p className="text-[10px] text-emerald-600/90 mt-0.5">
                                    {isDayModel
                                      ? 'Lowest per-day rate for this tenure'
                                      : 'Lowest per-month rate for this tenure'}
                                  </p> */}
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      Your price
                                    </label>
                                    <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20">
                                      <span className="flex items-center px-2.5 text-blue-500 text-sm bg-gray-50 border-r border-gray-200">
                                        ₹
                                      </span>
                                      <input
                                        type="number"
                                        min={0}
                                        value={tier.monthlyRent}
                                        onChange={(e) =>
                                          updateTier(
                                            i,
                                            'monthlyRent',
                                            e.target.value,
                                          )
                                        }
                                        className="w-full min-w-0 py-2 px-2 text-sm outline-none"
                                        disabled={rentalFieldsLocked}
                                        placeholder="0"
                                      />
                                    </div>
                                    {/* <p className="text-[11px] text-gray-500 mt-1">
                                    Total rent for this term (same basis as
                                    storefront).
                                  </p> */}
                                  </div>
                                  <button
                                    type="button"
                                    disabled={rentalFieldsLocked || !hasLow}
                                    onClick={onMatchLowest}
                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Zap className="h-3.5 w-3.5" />
                                    Match lowest
                                  </button>
                                  {/* {!rentalFieldsLocked &&
                                rentalTiers.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => removeRentalTier(i)}
                                    className="w-full text-xs font-medium text-red-600 hover:underline"
                                  >
                                    Remove term
                                  </button>
                                ) : null} */}
                                  {!rentalFieldsLocked && i >= 3 ? (
                                    <button
                                      type="button"
                                      onClick={() => removeRentalTier(i)}
                                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                      Remove term
                                    </button>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {rentalTiers.map((tier, i) => (
                              <div
                                key={i}
                                className="relative rounded-xl border-2 border-orange-200 bg-orange-50/30 p-3"
                              >
                                {tier.bestValue ? (
                                  <span className="absolute top-2 right-2 text-[10px] font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    Best value
                                  </span>
                                ) : null}
                                {/* {!rentalFieldsLocked ? (
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <label className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                                    Tenure (
                                    {rentalPricingModel === 'day'
                                      ? 'days'
                                      : 'months'}
                                    )
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={rentalPricingModel === 'day' ? 90 : 60}
                                    value={
                                      rentalPricingModel === 'day'
                                        ? (tier.days ?? '')
                                        : (tier.months ?? '')
                                    }
                                    onChange={(e) => {
                                      const v = Math.max(
                                        1,
                                        toNum(e.target.value, 1),
                                      );
                                      if (rentalPricingModel === 'day') {
                                        patchTier(i, {
                                          days: v,
                                          label: `${v} Days`,
                                        });
                                      } else {
                                        patchTier(i, {
                                          months: v,
                                          label: `${v} Months`,
                                        });
                                      }
                                    }}
                                    className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                                  />
                                </div>
                              ) : null} */}
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                  {tier.tierLabel ||
                                    (rentalPricingModel === 'day'
                                      ? 'Term'
                                      : 'Term')}
                                </p>
                                <p className="text-lg font-semibold text-black mb-2">
                                  {String(tier.label || '').trim() ||
                                    (rentalPricingModel === 'day'
                                      ? `${tier.days ?? 0} Days`
                                      : `${tier.months ?? 0} Months`)}
                                </p>
                                <label className="text-xs text-black">
                                  {rentalPricingModel === 'day'
                                    ? 'Rent (per day)'
                                    : 'Monthly rent'}
                                </label>
                                <div className="mt-1 flex rounded-lg border border-[#FFB86A] bg-white">
                                  <span className="pl-2 flex items-center text-gray-500 text-sm">
                                    ₹
                                  </span>
                                  <input
                                    value={tier.monthlyRent}
                                    onChange={(e) =>
                                      updateTier(
                                        i,
                                        'monthlyRent',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full py-2 pr-2 text-sm outline-none rounded-lg"
                                    disabled={rentalFieldsLocked}
                                  />
                                </div>
                                <label className="text-xs text-black mt-2 block">
                                  Shipping charges
                                </label>
                                <div className="mt-1 flex rounded-lg border border-[#FFB86A] bg-white">
                                  <span className="pl-2 flex items-center text-gray-500 text-sm">
                                    ₹
                                  </span>
                                  <input
                                    value={tier.shippingCharges}
                                    onChange={(e) =>
                                      updateTier(
                                        i,
                                        'shippingCharges',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full py-2 pr-2 text-sm outline-none rounded-lg"
                                    disabled={rentalFieldsLocked}
                                  />
                                </div>
                                {/* {!rentalFieldsLocked && rentalTiers.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => removeRentalTier(i)}
                                  className="mt-2 text-xs text-red-600 hover:underline"
                                >
                                  Remove term
                                </button>
                              ) : null} */}
                                {!rentalFieldsLocked && i >= 3 ? (
                                  <button
                                    type="button"
                                    onClick={() => removeRentalTier(i)}
                                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Remove term
                                  </button>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </SectionCard>
                  ) : // ) : showPerVariantRentalConfig ? null : showPerVariantSalesConfig ? null : manualSellSalesConfiguration ? (
                  //   <SectionCard
                  //     title="Sales Configuration"
                  //     subtitle="Set pricing and inventory details"
                  //     icon={Tag}
                  //     headerIconBoxed
                  //     showLock={saleFieldsLocked}
                  //   >
                  showPerVariantRentalConfig ? null : showPerVariantSalesConfig ? null : manualSellSalesConfiguration ||
                    (listingType === 'sell' && !!fullTemplate) ? (
                    <SectionCard
                      title="Sales Configuration"
                      subtitle={
                        fullTemplate
                          ? `For variant: ${displayVariants[selectedTemplateVariantIndex]?.v?.variantName || 'selected variant'}`
                          : 'Set pricing and inventory details'
                      }
                      icon={Tag}
                      headerIconBoxed
                      showLock={saleFieldsLocked}
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-gray-800">
                            Selling Price (₹){' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                            {/* <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                            ₹
                          </span> */}
                            <input
                              type="text"
                              inputMode="decimal"
                              value={sellPrice}
                              onChange={(e) => setSellPrice(e.target.value)}
                              disabled={saleFieldsLocked}
                              className="w-full py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                              placeholder="e.g., 54999"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-800">
                            MRP{' '}
                            <span className="font-normal text-gray-500">
                              (Optional)
                            </span>
                            {/* <span className="text-red-500 ml-1">*</span> */}
                          </label>
                          <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                            {/* <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                            ₹
                          </span> */}
                            <input
                              type="text"
                              inputMode="decimal"
                              value={mrpPrice}
                              onChange={(e) => setMrpPrice(e.target.value)}
                              disabled={saleFieldsLocked}
                              className="w-full py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                              placeholder="e.g., 70000"
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-gray-500">
                            Original price (for discount calculation)
                          </p>
                        </div>
                      </div>
                    </SectionCard>
                  ) : (
                    <SectionCard
                      title="Sales Configuration"
                      subtitle="Set pricing and inventory details"
                      // icon={DollarSign}
                      // showLock={saleFieldsLocked}
                      icon={Tag}
                      headerIconBoxed
                    >
                      <div className="space-y-3">
                        {/* <div>
                        <label className="text-xs text-gray-600">
                          Selling Price *
                        </label>

                        <input
                        
                          value={sellPrice}
                          onChange={(e) => setSellPrice(e.target.value)}
                          disabled={saleFieldsLocked}
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                          placeholder="Enter your price"
                        />
                      </div> */}
                        <div>
                          <label className="text-xs text-gray-600">
                            Selling Price *
                          </label>

                          <div className="mt-1 flex rounded-xl border overflow-hidden">
                            <span className="flex items-center pl-3 pr-1 text-sm text-[#2563EB]">
                              ₹
                            </span>

                            <input
                              value={sellPrice}
                              onChange={(e) => setSellPrice(e.target.value)}
                              disabled={saleFieldsLocked}
                              className="flex-none w-3/4 pl-1 pr-3 py-2 text-sm outline-none"
                              placeholder="Enter your price"
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#FFB86A] bg-orange-50 p-4">
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <TrendingDown
                                className="h-5 w-5 shrink-0 text-emerald-600"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                              <p className="truncate text-base font-medium text-gray-900">
                                Market Insights
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#DCFCE7] border border-[#7BF1A8] px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">
                              LIVE DATA
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border bg-white p-2.5">
                              <p className="text-[10px] text-gray-500">
                                MRP / Market Price
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                ₹
                                {Number.isFinite(Number(mrpPrice)) &&
                                Number(mrpPrice) > 0
                                  ? Number(mrpPrice).toLocaleString('en-IN')
                                  : '0'}
                              </p>
                            </div>
                            <div className="rounded-lg border bg-white p-2.5">
                              <p className="text-[10px] text-gray-500">
                                Lowest Price Online
                              </p>
                              <p className="text-sm font-semibold text-[#10B981]">
                                ₹
                                {Number.isFinite(Number(sellPrice)) &&
                                Number(sellPrice) > 0
                                  ? Number(sellPrice).toLocaleString('en-IN')
                                  : '0'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={saleFieldsLocked}
                            onClick={() => {
                              if (Number(mrpPrice) > 0 && !Number(sellPrice)) {
                                setSellPrice(String(mrpPrice));
                              }
                            }}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFB86A] px-3 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Zap
                              className="h-4 w-4 shrink-0 text-white"
                              strokeWidth={2.25}
                              aria-hidden
                            />
                            Match Lowest Price
                          </button>
                          <p className="mt-2 text-center text-xs text-gray-500">
                            Auto-fill with the most competitive price online
                          </p>
                        </div>

                        {/* <div>
                        <label className="text-xs text-gray-600">
                          MRP (optional)
                        </label>
                        <input
                          value={mrpPrice}
                          onChange={(e) => setMrpPrice(e.target.value)}
                          disabled={saleFieldsLocked}
                          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                          placeholder="MRP"
                        />
                      </div> */}
                      </div>
                    </SectionCard>
                  )}

                  {listingType !== 'sell' ? (
                    <div className="rounded-2xl border-2 border-violet-300 bg-violet-100 p-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Refundable Deposit
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Security deposit returned after rental period ends
                      </p>
                      {/* <div className="mt-3 flex max-w-xs rounded-xl border border-violet-400 bg-violet-200">
                        <span className="flex items-center pl-3 text-violet-800/80">
                          ₹
                        </span>
                        <input
                          value={refundableDeposit}
                          onChange={(e) => setRefundableDeposit(e.target.value)}
                          className="w-full rounded-xl bg-transparent py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-violet-400"
                        />
                      </div> */}
                      <div className="mt-3 flex max-w-xs rounded-xl border border-violet-400 bg-violet-200">
                        <span className="flex items-center pl-3 text-violet-800/80">
                          ₹
                        </span>
                        <input
                          value={refundableDeposit}
                          onChange={(e) =>
                            !rentalFieldsLocked &&
                            setRefundableDeposit(e.target.value)
                          }
                          readOnly={rentalFieldsLocked}
                          disabled={rentalFieldsLocked}
                          className="w-full rounded-xl bg-transparent py-2.5 pr-3 text-sm text-gray-900 outline-none placeholder:text-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </div>
                    </div>
                  ) : null}
                  <SectionCard
                    title="Logistics & Verification"
                    icon={Truck}
                    headerIconClassName="h-5 w-5 shrink-0 text-blue-600"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-800">
                          Delivery timeline{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        {/* <div className="mt-1 flex rounded-xl border border-gray-200 bg-white overflow-hidden">
                          <input
                            value={logistics.deliveryTimelineValue}
                            onChange={(e) =>
                              setLogistics((p) => ({
                                ...p,
                                deliveryTimelineValue: e.target.value,
                              }))
                            }
                            className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none"
                            placeholder="3"
                          /> */}
                        <div className="mt-1 flex rounded-xl border border-gray-200 bg-white overflow-hidden">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={logistics.deliveryTimelineValue}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(
                                /\D/g,
                                '',
                              );
                              setLogistics((p) => ({
                                ...p,
                                deliveryTimelineValue: digitsOnly,
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (
                                ['e', 'E', '+', '-', '.'].includes(e.key) ||
                                (!/[0-9]/.test(e.key) &&
                                  ![
                                    'Backspace',
                                    'Delete',
                                    'ArrowLeft',
                                    'ArrowRight',
                                    'Tab',
                                  ].includes(e.key))
                              ) {
                                e.preventDefault();
                              }
                            }}
                            className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none"
                            placeholder="3"
                          />
                          <select
                            value={logistics.deliveryTimelineUnit}
                            onChange={(e) =>
                              setLogistics((p) => ({
                                ...p,
                                deliveryTimelineUnit: e.target.value,
                              }))
                            }
                            className="border-l border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                          >
                            <option value="Days">Days</option>
                            <option value="Hours">Hours</option>
                          </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Days required to deliver after order confirmation
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-800">
                          Inventory count{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        {/* <input
                          type="number"
                          min={0}
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                          placeholder="5"
                        /> */}
                        <input
                          type="text"
                          inputMode="numeric"
                          min={0}
                          value={stock}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(
                              /\D/g,
                              '',
                            );
                            setStock(digitsOnly);
                          }}
                          onKeyDown={(e) => {
                            if (
                              ['e', 'E', '+', '-', '.'].includes(e.key) ||
                              (!/[0-9]/.test(e.key) &&
                                ![
                                  'Backspace',
                                  'Delete',
                                  'ArrowLeft',
                                  'ArrowRight',
                                  'Tab',
                                ].includes(e.key))
                            ) {
                              e.preventDefault();
                            }
                          }}
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                          placeholder="5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Number of units available
                        </p>
                      </div>
                      {/* <div>
                    <label className="text-xs text-gray-500">
                      Inventory owner (optional)
                    </label>
                    <input
                      value={logistics.inventoryOwnerName}
                      onChange={(e) =>
                        setLogistics((p) => ({
                          ...p,
                          inventoryOwnerName: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div> */}
                      {/* <div>
                    <label className="text-xs text-gray-500">
                      City (optional)
                    </label>
                    <input
                      value={logistics.city}
                      onChange={(e) =>
                        setLogistics((p) => ({ ...p, city: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div> */}
                    </div>
                  </SectionCard>
                </>
              ) : null}
            </>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse items-stretch justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          {/* <button
            type="button"
            onClick={() => submit('draft')}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() =>
              submit(mode === 'edit' ? 'published' : 'pending_approval')
            }
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? 'Submitting…'
              : mode === 'edit'
                ? 'Update Product'
                : 'Submit for Approval'}
          </button> */}
          <button
            type="button"
            onClick={() => submit('draft')}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() =>
              submit(mode === 'edit' ? 'published' : 'pending_approval')
            }
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? 'Submitting…'
              : mode === 'edit'
                ? 'Update Product'
                : 'Submit for Approval'}
          </button>
        </div>
      </div>

      {/* Vendor quick-create sub-category modal */}
      {subCatCreateOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/40">
          <div
            className="absolute inset-0"
            role="presentation"
            onClick={() => !creatingSubCat && setSubCatCreateOpen(false)}
          />
          <div className="relative flex w-full max-w-lg flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div className="min-w-0 pr-2">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900">
                  Add New Sub-category
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Can&apos;t find the right sub-category? Add one for your
                  listing.
                </p>
              </div>
              <button
                type="button"
                disabled={creatingSubCat}
                onClick={() => setSubCatCreateOpen(false)}
                className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <input
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  placeholder="e.g., Gaming Chairs"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Category
                </label>
                <input
                  value={categoryName}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 outline-none"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  This sub-category will be added under the main category you
                  selected above.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Commission Rate <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={newSubCatCommissionRate}
                    onChange={(e) => setNewSubCatCommissionRate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    %
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Platform&apos;s percentage share for this category
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-800">
                  Sub-category Image <span className="text-red-500">*</span>
                </p>
                <label className="flex flex-col items-center justify-center min-h-[168px] rounded-xl border border-gray-200 bg-gray-50/80 hover:border-orange-200 hover:bg-orange-50/20 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setNewSubCatImage(e.target.files?.[0] || null)
                    }
                  />
                  {newSubCatImage ? (
                    <div className="relative p-3 w-full">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setNewSubCatImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:text-red-600"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={URL.createObjectURL(newSubCatImage)}
                        alt=""
                        className="mx-auto max-h-32 object-contain rounded-lg"
                      />
                      <p className="text-xs text-center text-gray-600 mt-2 truncate px-2">
                        {newSubCatImage.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-10 px-4">
                      <ImageIcon
                        className="w-9 h-9 text-orange-500"
                        strokeWidth={1.75}
                      />
                      <span className="text-sm font-medium text-orange-500">
                        Select from Media Library
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG, WebP
                      </span>
                    </div>
                  )}
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  512x512px recommended for app grids
                </p>
              </div>

              <p className="text-xs text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                New sub-categories may be reviewed by the admin team before
                appearing elsewhere on the platform.
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <button
                type="button"
                disabled={creatingSubCat}
                onClick={() => setSubCatCreateOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creatingSubCat}
                onClick={handleCreateSubCategory}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-60"
              >
                {creatingSubCat ? (
                  'Creating…'
                ) : (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    Create Sub-category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
