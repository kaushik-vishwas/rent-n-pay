// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   apiDeleteAdminOffer,
//   apiGetAllAdminProducts,
//   apiGetAdminOffers,
//   apiUpsertAdminOffer,
// } from '@/service/api';
// import { toast } from 'react-toastify';
// import { Heart, Search, ShoppingCart, Trash2, Truck } from 'lucide-react';

// const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// const formatPercent = (n) => {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num) || num <= 0) return '0%';
//   const rounded = Math.round(num * 10) / 10;
//   return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
// };
// // const parsePrice = (raw) => {
// //   const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
// //   return Number.isFinite(n) ? n : 0;
// // };
// // const PLATFORM_FEE_PERCENT = 12;
// const parsePrice = (raw) => {
//   const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
//   return Number.isFinite(n) ? n : 0;
// };

// const tierRentAmount = (tier) => {
//   const n = (k) => {
//     const v = Number(String(tier?.[k] ?? '').replace(/,/g, ''));
//     return Number.isFinite(v) && v > 0 ? v : 0;
//   };
//   return n('customerRent') || n('pricePerDay') || n('vendorRent') || 0;
// };

// // const getBasePriceInfo = (product) => {
// //   if (
// //     product?.type === 'Rental' &&
// //     Array.isArray(product?.rentalConfigurations)
// //   ) {
// //     const usable = product.rentalConfigurations.filter(
// //       (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
// //     );
// //     const tier = usable.sort((a, b) => {
// //       const lenA =
// //         a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
// //       const lenB =
// //         b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
// //       return lenA - lenB;
// //     })[0];
// //     if (tier) {
// //       const isDay = tier.periodUnit === 'day';
// //       const len = isDay
// //         ? Number(tier.days) > 0
// //           ? Number(tier.days)
// //           : 1
// //         : Number(tier.months) > 0
// //           ? Number(tier.months)
// //           : 1;
// //       const totalAmt = tierRentAmount(tier);
// //       const perUnit = Math.round(totalAmt / len);
// //       return { amount: perUnit, suffix: isDay ? '/d' : '/mo' };
// //     }
// //   }
// //   return { amount: parsePrice(product?.price), suffix: '' };
// // };

// const getBasePriceInfo = (product) => {
//   if (product?.type === 'Rental') {
//     const top = Array.isArray(product?.rentalConfigurations)
//       ? product.rentalConfigurations
//       : [];
//     const topHasPrice = top.some(
//       (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
//     );
//     let configs = top;
//     if (!topHasPrice) {
//       const variants = Array.isArray(product?.variants) ? product.variants : [];
//       const fromVariants = variants.flatMap((v) =>
//         Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
//       );
//       if (fromVariants.length) configs = fromVariants;
//     }
//     const usable = configs.filter(
//       (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
//     );
//     // const tier = usable.sort((a, b) => {
//     //   const lenA =
//     //     a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
//     //   const lenB =
//     //     b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
//     //   return lenA - lenB;
//     // })[0];
//     // if (tier) {
//     const tier = usable.sort((a, b) => {
//       const lenA =
//         a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
//       const lenB =
//         b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
//       return lenB - lenA;
//     })[0];
//     if (tier) {
//       const isDay = tier.periodUnit === 'day';
//       const totalAmt = tierRentAmount(tier);
//       // Day-wise tiers store a total for the tenure, so divide by day count
//       // to get the per-day rate. Month-wise tiers store customerRent as the
//       // ALREADY per-month rate, so use it as-is — never divide by months.
//       const perUnit = isDay
//         ? Math.round(totalAmt / (Number(tier.days) > 0 ? Number(tier.days) : 1))
//         : Math.round(totalAmt);
//       return { amount: perUnit, suffix: isDay ? '/d' : '/mo' };
//     }
//   }
//   const basePrice = parsePrice(product?.price);
//   if (basePrice > 0) return { amount: basePrice, suffix: '' };
//   const variants = Array.isArray(product?.variants) ? product.variants : [];
//   const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
//   if (firstWithPrice) {
//     return { amount: parsePrice(firstWithPrice.sellPrice), suffix: '' };
//   }
//   return { amount: 0, suffix: '' };
// };

// const PLATFORM_FEE_PERCENT = 15;

// // Given admin's reduction on platform fee, compute effective platform fee %
// // e.g. reduction=50 → effectiveFee = 12 * (1 - 50/100) = 6%
// const resolveEffectivePlatformFeePercent = (draft = {}, offer = {}) => {
//   const mode = draft.discountType || 'percent';
//   const rawValue =
//     draft.platformFeeReduction ?? offer.platformFeeReductionPercent ?? '';
//   const n = Number(rawValue || 0);
//   if (!Number.isFinite(n) || n <= 0) return PLATFORM_FEE_PERCENT;
//   let reductionPercent = n;
//   if (mode === 'amount') {
//     // user entered rupee amount off the fee; convert to % of platform fee
//     // We need base price context — handle in table row instead
//     reductionPercent = 0; // fallback; computed per-row
//   }
//   return Math.max(0, PLATFORM_FEE_PERCENT * (1 - reductionPercent / 100));
// };

// export default function ProductsOffers() {
//   const pageSize = 10;
//   const [products, setProducts] = useState([]);
//   const [offersByProduct, setOffersByProduct] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [savingId, setSavingId] = useState('');
//   const [search, setSearch] = useState('');
//   const [draftByProduct, setDraftByProduct] = useState({});
//   const [page, setPage] = useState(1);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [modalProductId, setModalProductId] = useState('');
//   const [modalReduction, setModalReduction] = useState('');
//   const [modalDiscountType, setModalDiscountType] = useState('percent');
//   const [modalSaving, setModalSaving] = useState(false);

//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   const loadData = async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const [productsRes, offersRes] = await Promise.all([
//         apiGetAllAdminProducts(token, 'limit=200'),
//         apiGetAdminOffers(token),
//       ]);
//       const prods = productsRes.data?.products || [];
//       const offers = offersRes.data?.offers || [];
//       const map = {};
//       offers.forEach((o) => {
//         map[String(o.productId?._id || o.productId)] = o;
//       });
//       const drafts = {};
//       prods.forEach((p) => {
//         const id = String(p._id);
//         const off = map[id] || {};
//         drafts[id] = {
//           platformFeeReduction:
//             off.platformFeeReductionPercent != null
//               ? String(off.platformFeeReductionPercent)
//               : '',
//           discountType: 'percent',
//           isActive: off.isActive ?? true,
//         };
//       });
//       // setProducts(
//       //   prods.filter((p) => String(p.type || '').toLowerCase() === 'rental'),
//       // );
//       setProducts(prods);
//       setOffersByProduct(map);
//       setDraftByProduct(drafts);
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || 'Failed to load products/offers',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [token]);

//   // const rows = useMemo(() => {
//   //   const q = search.trim().toLowerCase();
//   //   const base = products.filter(
//   //     (p) => String(p.type || '').toLowerCase() === 'rental',
//   //   );
//   const rows = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     const base = products;
//     if (!q) return base;
//     return base.filter((p) =>
//       String(p.productName || '')
//         .toLowerCase()
//         .includes(q),
//     );
//   }, [products, search]);

//   const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
//   const currentPage = Math.min(page, totalPages);
//   const pagedRows = rows.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize,
//   );
//   useEffect(() => {
//     setPage(1);
//   }, [search]);

//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   // useEffect(() => {
//   //   if (!rows.length) {
//   //     setSelectedPreviewProductId('');
//   //     return;
//   //   }
//   //   const exists = rows.some(
//   //     (p) => String(p._id) === String(selectedPreviewProductId),
//   //   );
//   //   if (!exists) setSelectedPreviewProductId(String(rows[0]._id));
//   // }, [rows, selectedPreviewProductId]);

//   const applyOffer = async (productId) => {
//     const product = rows.find((p) => String(p._id) === String(productId));
//     const basePrice = parsePrice(product?.price);
//     const draft = draftByProduct[productId] || {};
//     const mode = draft.discountType || 'percent';
//     const raw = Number(draft.platformFeeReduction || 0);

//     let platformFeeReductionPercent;
//     if (mode === 'amount') {
//       // rupee amount off the platform fee → convert to % of the fee
//       const defaultFeeAmount = Math.round(
//         basePrice * (PLATFORM_FEE_PERCENT / 100),
//       );
//       if (!raw || raw <= 0) {
//         toast.error('Discount amount must be greater than 0');
//         return;
//       }
//       if (raw > defaultFeeAmount) {
//         toast.error(
//           `Cannot discount more than the platform fee (${rupee(defaultFeeAmount)})`,
//         );
//         return;
//       }
//       platformFeeReductionPercent = Math.min(
//         100,
//         Math.round((raw / defaultFeeAmount) * 100),
//       );
//     } else {
//       if (!raw || raw < 1 || raw > 100) {
//         toast.error('Platform fee reduction must be between 1% and 100%');
//         return;
//       }
//       platformFeeReductionPercent = raw;
//     }

//     setSavingId(productId);
//     try {
//       await apiUpsertAdminOffer(
//         { productId, platformFeeReductionPercent, isActive: true },
//         token,
//       );
//       toast.success('Offer saved');
//       await loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save offer');
//     } finally {
//       setSavingId('');
//     }
//   };

//   const removeOffer = async (productId) => {
//     const offer = offersByProduct[productId];
//     if (!offer?._id) return;
//     setSavingId(productId);
//     try {
//       await apiDeleteAdminOffer(offer._id, token);
//       toast.success('Offer deleted');
//       await loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to delete offer');
//     } finally {
//       setSavingId('');
//     }
//   };

//   // const preview =
//   //   rows.find((p) => String(p._id) === String(selectedPreviewProductId)) ||
//   //   null;
//   // const previewOffer = preview ? offersByProduct[String(preview._id)] : null;
//   // const previewDraft = preview ? draftByProduct[String(preview._id)] : null;
//   // const previewBase = parsePrice(preview?.price);
//   // const previewDiscount = resolveDiscountPercent(
//   //   previewBase,
//   //   previewDraft,
//   //   previewOffer,
//   // );
//   // const previewFinal = Math.max(
//   //   0,
//   //   Math.round(previewBase - (previewBase * previewDiscount) / 100),
//   // );
//   // const previewSticker =
//   //   previewDraft?.sticker || previewOffer?.sticker || 'Bestseller';
//   // const previewDiscountAmount = Math.max(0, previewBase - previewFinal);
//   // const previewDeliveryEta = getDeliveryEtaLabel(preview);
//   // const previewRating = (
//   //   4 +
//   //   ((preview?.productName?.length || 3) % 10) / 10
//   // ).toFixed(1);

//   return (
//     <div className="space-y-4 sm:space-y-5 max-w-full overflow-hidden">
//       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
//         {/* <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Products & Offers
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Switch between offer management and global product inventory
//           </p>
//         </div> */}
//         {/* <button
//           type="button"
//           onClick={() => {
//             setModalProductId('');
//             setModalReduction('');
//             setModalDiscountType('percent');
//             setShowCreateModal(true);
//           }}
//           className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700"
//         >
//           + Create New Offer
//         </button> */}
//       </div>

//       {showCreateModal &&
//         (() => {
//           // const selectedProduct =
//           //   products.find((p) => String(p._id) === modalProductId) || null;
//           // const base = parsePrice(selectedProduct?.price);
//           const selectedProduct =
//             products.find((p) => String(p._id) === modalProductId) || null;
//           const { amount: base } = getBasePriceInfo(selectedProduct);
//           const defaultFeeAmount = Math.round(
//             base * (PLATFORM_FEE_PERCENT / 100),
//           );
//           const rawReduction = Number(modalReduction || 0);
//           let effectiveFeePercent = PLATFORM_FEE_PERCENT;
//           if (rawReduction > 0) {
//             if (modalDiscountType === 'amount') {
//               const pct =
//                 defaultFeeAmount > 0
//                   ? Math.min(100, (rawReduction / defaultFeeAmount) * 100)
//                   : 0;
//               effectiveFeePercent = Math.max(
//                 0,
//                 PLATFORM_FEE_PERCENT * (1 - pct / 100),
//               );
//             } else {
//               effectiveFeePercent = Math.max(
//                 0,
//                 PLATFORM_FEE_PERCENT * (1 - rawReduction / 100),
//               );
//             }
//           }
//           const effectiveFeeAmount = Math.round(
//             base * (effectiveFeePercent / 100),
//           );
//           const payout = Math.max(0, base - effectiveFeeAmount);

//           const handleModalApply = async () => {
//             if (!modalProductId) {
//               toast.error('Please select a product');
//               return;
//             }
//             const raw = Number(modalReduction || 0);
//             let platformFeeReductionPercent;
//             if (modalDiscountType === 'amount') {
//               if (!raw || raw <= 0) {
//                 toast.error('Discount amount must be greater than 0');
//                 return;
//               }
//               if (raw > defaultFeeAmount) {
//                 toast.error(
//                   `Cannot exceed platform fee (${rupee(defaultFeeAmount)})`,
//                 );
//                 return;
//               }
//               platformFeeReductionPercent = Math.min(
//                 100,
//                 Math.round((raw / defaultFeeAmount) * 100),
//               );
//             } else {
//               if (!raw || raw < 1 || raw > 100) {
//                 toast.error('Reduction must be between 1% and 100%');
//                 return;
//               }
//               platformFeeReductionPercent = raw;
//             }
//             setModalSaving(true);
//             try {
//               await apiUpsertAdminOffer(
//                 {
//                   productId: modalProductId,
//                   platformFeeReductionPercent,
//                   isActive: true,
//                 },
//                 token,
//               );
//               toast.success('Offer created');
//               setShowCreateModal(false);
//               await loadData();
//             } catch (err) {
//               toast.error(
//                 err.response?.data?.message || 'Failed to save offer',
//               );
//             } finally {
//               setModalSaving(false);
//             }
//           };

//           return (
//             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//               <button
//                 type="button"
//                 aria-label="Close"
//                 className="absolute inset-0 bg-black/50"
//                 onClick={() => setShowCreateModal(false)}
//               />
//               <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between">
//                   <h2 className="text-white font-semibold text-base">
//                     Create New Offer
//                   </h2>
//                   <button
//                     type="button"
//                     onClick={() => setShowCreateModal(false)}
//                     className="text-white/80 hover:text-white text-xl leading-none"
//                   >
//                     ×
//                   </button>
//                 </div>

//                 <div className="p-5 space-y-4">
//                   {/* Product selector */}
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1.5">
//                       Select Product
//                     </label>
//                     <select
//                       value={modalProductId}
//                       onChange={(e) => {
//                         setModalProductId(e.target.value);
//                         setModalReduction('');
//                       }}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
//                     >
//                       <option value="">— Choose a product —</option>
//                       {/* {products.map((p) => (
//                         <option key={String(p._id)} value={String(p._id)}>
//                           {p.productName} ({rupee(p.price)})
//                         </option>
//                       ))} */}
//                       {products.map((p) => {
//                         const { amount: optAmount, suffix: optSuffix } =
//                           getBasePriceInfo(p);
//                         return (
//                           <option key={String(p._id)} value={String(p._id)}>
//                             {p.productName} ({rupee(optAmount)}
//                             {optSuffix})
//                           </option>
//                         );
//                       })}
//                     </select>
//                   </div>

//                   {/* Reduction input */}
//                   {selectedProduct && (
//                     <>
//                       <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 flex justify-between text-xs text-gray-600">
//                         <span>Default platform fee</span>
//                         <span className="font-semibold text-blue-600">
//                           {rupee(defaultFeeAmount)}
//                         </span>
//                       </div>

//                       <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1.5">
//                           Reduce Platform Fee
//                         </label>
//                         <div className="flex items-center gap-2 mb-2">
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setModalDiscountType('percent');
//                               setModalReduction('');
//                             }}
//                             className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-semibold ${modalDiscountType === 'percent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
//                           >
//                             %
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setModalDiscountType('amount');
//                               setModalReduction('');
//                             }}
//                             className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-semibold ${modalDiscountType === 'amount' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
//                           >
//                             ₹
//                           </button>
//                           <input
//                             type="number"
//                             min={1}
//                             max={
//                               modalDiscountType === 'amount'
//                                 ? defaultFeeAmount
//                                 : 100
//                             }
//                             placeholder={
//                               modalDiscountType === 'amount'
//                                 ? `max ${defaultFeeAmount}`
//                                 : 'max 100'
//                             }
//                             value={modalReduction}
//                             onChange={(e) => setModalReduction(e.target.value)}
//                             className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
//                           />
//                         </div>
//                       </div>

//                       {/* Live preview */}
//                       {rawReduction > 0 && (
//                         <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-1.5 text-xs">
//                           <div className="flex justify-between text-gray-600">
//                             <span>Effective platform fee</span>
//                             <span className="font-semibold text-orange-600">
//                               {formatPercent(effectiveFeePercent)} (
//                               {rupee(effectiveFeeAmount)})
//                             </span>
//                           </div>
//                           <div className="flex justify-between text-gray-600">
//                             <span>Vendor payout</span>
//                             <span className="font-semibold text-emerald-700">
//                               {rupee(payout)}
//                             </span>
//                           </div>
//                           <div className="flex justify-between text-gray-600">
//                             <span>Vendor gains extra</span>
//                             <span className="font-semibold text-emerald-600">
//                               +{rupee(defaultFeeAmount - effectiveFeeAmount)}
//                             </span>
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}

//                   {/* Actions */}
//                   <div className="flex gap-3 pt-1">
//                     <button
//                       type="button"
//                       onClick={() => setShowCreateModal(false)}
//                       className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleModalApply}
//                       disabled={
//                         modalSaving || !modalProductId || !modalReduction
//                       }
//                       className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
//                     >
//                       {modalSaving ? 'Saving...' : 'Apply Offer'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })()}

//       <>
//         {/* <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
//           Admin-Initiated Offers
//         </div> */}
//         {/*
//         <div className="grid grid-cols-1 gap-4">
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden"> */}
//         <div className="grid grid-cols-1 gap-4 w-full">
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden w-full">
//             {/* <div className="p-4 border-b border-gray-100">
//               <div className="relative w-full sm:max-w-md">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search products or offers..."
//                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
//                 />
//               </div>
//             </div> */}
//             <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//               <div className="relative w-full sm:max-w-md">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search products or offers..."
//                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setModalProductId('');
//                   setModalReduction('');
//                   setModalDiscountType('percent');
//                   setShowCreateModal(true);
//                 }}
//                 className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700 shrink-0"
//               >
//                 + Create New Offer
//               </button>
//             </div>

//             {loading ? (
//               <div className="flex justify-center py-14">
//                 <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-[900px] w-full text-sm">
//                   <thead className="bg-gray-50 border-b border-gray-100">
//                     <tr className="text-gray-500 text-[11px] uppercase tracking-wide">
//                       <th className="px-3 py-3 text-left font-medium">
//                         Product Details
//                       </th>
//                       <th className="px-3 py-3 text-center font-medium">
//                         Product Price
//                       </th>
//                       <th className="px-3 py-3 text-center font-medium">
//                         Default Platform Fee
//                       </th>
//                       <th className="px-3 py-3 text-center font-medium">
//                         Reduce Platform Fee
//                       </th>
//                       <th className="px-3 py-3 text-center font-medium">
//                         Effective Platform Fee
//                       </th>
//                       <th className="px-3 py-3 text-center font-medium">
//                         Vendor Payout
//                       </th>
//                       <th className="px-3 py-3 text-center font-medium">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {pagedRows.map((p) => {
//                       // const id = String(p._id);
//                       // const offer = offersByProduct[id] || {};
//                       // const draft = draftByProduct[id] || {};
//                       // const base = parsePrice(p.price);
//                       // const defaultFeeAmount = Math.round(
//                       const id = String(p._id);
//                       const offer = offersByProduct[id] || {};
//                       const draft = draftByProduct[id] || {};
//                       const { amount: base, suffix: baseSuffix } =
//                         getBasePriceInfo(p);
//                       const defaultFeeAmount = Math.round(
//                         base * (PLATFORM_FEE_PERCENT / 100),
//                       );

//                       // Compute effective platform fee %
//                       const mode = draft.discountType || 'percent';
//                       const rawReduction = Number(
//                         draft.platformFeeReduction ||
//                           offer.platformFeeReductionPercent ||
//                           0,
//                       );
//                       let effectiveFeePercent = PLATFORM_FEE_PERCENT;
//                       if (rawReduction > 0) {
//                         if (mode === 'amount') {
//                           // ₹ entered → what % of the fee is being removed?
//                           const reductionAsPercOfFee =
//                             defaultFeeAmount > 0
//                               ? Math.min(
//                                   100,
//                                   (rawReduction / defaultFeeAmount) * 100,
//                                 )
//                               : 0;
//                           effectiveFeePercent = Math.max(
//                             0,
//                             PLATFORM_FEE_PERCENT *
//                               (1 - reductionAsPercOfFee / 100),
//                           );
//                         } else {
//                           effectiveFeePercent = Math.max(
//                             0,
//                             PLATFORM_FEE_PERCENT * (1 - rawReduction / 100),
//                           );
//                         }
//                       }
//                       const effectiveFeeAmount = Math.round(
//                         base * (effectiveFeePercent / 100),
//                       );
//                       const payout = Math.max(0, base - effectiveFeeAmount);
//                       const hasOffer = !!offer?._id;

//                       return (
//                         <tr
//                           key={id}
//                           className="border-t border-gray-100 hover:bg-gray-50"
//                         >
//                           <td className="px-3 py-3 text-center">
//                             <div className="flex items-start justify-start gap-2.5">
//                               <img
//                                 src={p.image}
//                                 alt=""
//                                 className="w-9 h-9 rounded object-cover"
//                               />
//                               <div className="text-left">
//                                 <p className="font-medium text-gray-900">
//                                   {p.productName}
//                                 </p>
//                                 <div className="mt-0.5 flex items-center gap-1.5">
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       setDraftByProduct((prev) => ({
//                                         ...prev,
//                                         [id]: {
//                                           ...(prev[id] || {}),
//                                           isActive: !(
//                                             prev[id]?.isActive ??
//                                             offer.isActive ??
//                                             false
//                                           ),
//                                         },
//                                       }));
//                                     }}
//                                     className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
//                                       (draft.isActive ?? offer.isActive)
//                                         ? 'bg-orange-500'
//                                         : 'bg-gray-300'
//                                     }`}
//                                   >
//                                     <span
//                                       className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
//                                         (draft.isActive ?? offer.isActive)
//                                           ? 'translate-x-3.5'
//                                           : 'translate-x-0.5'
//                                       }`}
//                                     />
//                                   </button>
//                                   <span
//                                     className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${hasOffer && offer.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
//                                   >
//                                     {hasOffer && offer.isActive
//                                       ? 'Active Offer'
//                                       : 'No Offer'}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           {/* <td className="px-3 py-3 text-right text-gray-700 font-medium">
//                             {rupee(base)}
//                           </td> */}
//                           <td className="px-3 py-3 text-center text-gray-700 font-medium">
//                             {rupee(base)}
//                             {baseSuffix ? (
//                               <span className="text-gray-400">
//                                 {baseSuffix}
//                               </span>
//                             ) : null}
//                           </td>
//                           <td className="px-3 py-3 text-center">
//                             <p className="text-blue-600 text-xs font-semibold">
//                               {formatPercent(PLATFORM_FEE_PERCENT)}
//                             </p>
//                             <p className="text-gray-500 text-xs">
//                               {rupee(defaultFeeAmount)}
//                             </p>
//                           </td>
//                           <td className="px-3 py-3 text-center">
//                             <div className="space-y-1.5 inline-block text-left">
//                               <div className="flex items-center gap-1.5">
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setDraftByProduct((prev) => ({
//                                       ...prev,
//                                       [id]: {
//                                         ...(prev[id] || {}),
//                                         discountType: 'percent',
//                                       },
//                                     }))
//                                   }
//                                   className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold ${
//                                     (draft.discountType || 'percent') ===
//                                     'percent'
//                                       ? 'bg-blue-600 text-white'
//                                       : 'bg-gray-200 text-gray-600'
//                                   }`}
//                                 >
//                                   %
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setDraftByProduct((prev) => ({
//                                       ...prev,
//                                       [id]: {
//                                         ...(prev[id] || {}),
//                                         discountType: 'amount',
//                                       },
//                                     }))
//                                   }
//                                   className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold ${
//                                     draft.discountType === 'amount'
//                                       ? 'bg-blue-600 text-white'
//                                       : 'bg-gray-200 text-gray-600'
//                                   }`}
//                                 >
//                                   ₹
//                                 </button>
//                               </div>
//                               <input
//                                 type="number"
//                                 min={1}
//                                 max={
//                                   draft.discountType === 'amount'
//                                     ? defaultFeeAmount
//                                     : 100
//                                 }
//                                 placeholder={
//                                   draft.discountType === 'amount'
//                                     ? `max ${defaultFeeAmount}`
//                                     : 'max 100'
//                                 }
//                                 value={draft.platformFeeReduction ?? ''}
//                                 onChange={(e) =>
//                                   setDraftByProduct((prev) => ({
//                                     ...prev,
//                                     [id]: {
//                                       ...(prev[id] || {}),
//                                       platformFeeReduction: e.target.value,
//                                     },
//                                   }))
//                                 }
//                                 className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs"
//                               />
//                               {rawReduction > 0 && (
//                                 <p className="text-[10px] text-orange-600 font-medium">
//                                   → {formatPercent(effectiveFeePercent)} fee
//                                 </p>
//                               )}
//                             </div>
//                           </td>
//                           <td className="px-3 py-3 text-center">
//                             <p
//                               className={`text-xs font-semibold ${rawReduction > 0 ? 'text-orange-600' : 'text-blue-600'}`}
//                             >
//                               {formatPercent(effectiveFeePercent)}
//                             </p>
//                             <p
//                               className={`text-xs ${rawReduction > 0 ? 'text-orange-500' : 'text-gray-500'}`}
//                             >
//                               {rupee(effectiveFeeAmount)}
//                             </p>
//                           </td>
//                           <td className="px-3 py-3 text-center">
//                             <p className="text-emerald-600 font-semibold text-sm">
//                               {rupee(payout)}
//                             </p>
//                             {rawReduction > 0 && (
//                               <p className="text-[10px] text-emerald-500">
//                                 +{rupee(payout - (base - defaultFeeAmount))}{' '}
//                                 extra
//                               </p>
//                             )}
//                           </td>
//                           <td className="px-3 py-3 text-center">
//                             <div className="flex flex-col items-center gap-1">
//                               <button
//                                 type="button"
//                                 onClick={() => applyOffer(id)}
//                                 disabled={savingId === id}
//                                 className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs disabled:opacity-60"
//                               >
//                                 {savingId === id ? 'Saving...' : 'Apply'}
//                               </button>
//                               {hasOffer ? (
//                                 <button
//                                   type="button"
//                                   onClick={() => removeOffer(id)}
//                                   disabled={savingId === id}
//                                   className="inline-flex items-center gap-1 text-red-600 text-xs font-medium disabled:opacity-50"
//                                 >
//                                   <Trash2 className="w-3.5 h-3.5" />
//                                   Delete
//                                 </button>
//                               ) : null}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                     {pagedRows.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan={8}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No rental products found.
//                         </td>
//                       </tr>
//                     ) : null}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//             {!loading && rows.length > 0 ? (
//               <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
//                 <span>
//                   Showing {(currentPage - 1) * pageSize + 1}-
//                   {Math.min(currentPage * pageSize, rows.length)} of{' '}
//                   {rows.length}
//                 </span>
//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setPage((p) => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                     className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
//                   >
//                     Prev
//                   </button>
//                   <span className="font-medium text-gray-700">
//                     {currentPage}/{totalPages}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                     disabled={currentPage === totalPages}
//                     className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             ) : null}
//           </div>

//           {/* <div className="space-y-4">
//             <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden">
//               <div className="p-4 border-b border-blue-200 bg-blue-50/70">
//                 <h3 className="text-sm font-semibold text-gray-900">
//                   Customer Preview
//                 </h3>
//                 <p className="text-xs text-gray-600 mt-1">
//                   How this offer will appear to customers
//                 </p>
//               </div>
//               {preview ? (
//                 <div className="p-4">
//                   <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
//                     <div className="relative">
//                       <img
//                         src={preview.image}
//                         alt=""
//                         className="w-full h-40 object-cover"
//                       />
//                       <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-orange-500 text-white text-[10px] font-medium px-2 py-0.5">
//                         {previewSticker || 'Bestseller'}
//                       </span>
//                       <span className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white text-sm font-bold leading-none shadow-sm">
//                         {formatPercent(previewDiscount)}
//                       </span>
//                       <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 text-blue-700 text-[10px] font-medium px-2 py-0.5">
//                         <Truck className="w-3 h-3" />
//                         {previewDeliveryEta}
//                       </span>
//                       <button
//                         type="button"
//                         className="absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-500 border border-gray-200"
//                       >
//                         <Heart className="w-3.5 h-3.5" />
//                       </button>
//                     </div>
//                     <div className="p-3.5">
//                       <div className="flex items-start justify-between gap-2">
//                         <p className="text-base font-medium text-gray-900 line-clamp-1">
//                           {preview.productName}
//                         </p>
//                         <span className="inline-flex items-center rounded-full bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 shrink-0">
//                           {previewRating} ★
//                         </span>
//                       </div>
//                       <div className="mt-2">
//                         <span className="inline-flex items-center rounded-full bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-0.5">
//                           {String(
//                             preview.condition || preview.type || 'Used - Good',
//                           )}
//                         </span>
//                       </div>
//                       <div className="mt-2 flex items-end justify-between gap-2">
//                         <div className="flex items-end gap-1.5">
//                           <span className="text-[28px] leading-none font-semibold text-gray-900">
//                             {previewDiscount
//                               ? rupee(previewFinal)
//                               : rupee(previewBase)}
//                           </span>
//                           {previewDiscount ? (
//                             <span className="text-xs text-gray-400 line-through mb-1">
//                               {rupee(previewBase)}
//                             </span>
//                           ) : null}
//                         </div>
//                       </div>
//                       <button className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium inline-flex items-center justify-center gap-1.5">
//                         <ShoppingCart className="w-3.5 h-3.5" />
//                         Buy Now
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="p-4 text-sm text-gray-500">
//                   No products to preview.
//                 </p>
//               )}
//             </div>

//             <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-xs">
//               <p className="text-gray-600">Offer Impact</p>
//               <div className="mt-2 flex justify-between">
//                 <span>Discount Amount:</span>
//                 <span className="font-medium text-rose-600">
//                   {rupee(previewDiscountAmount)}
//                 </span>
//               </div>
//               <div className="mt-1 flex justify-between">
//                 <span>Customer Saves:</span>
//                 <span className="font-medium text-emerald-700">
//                   {formatPercent(previewDiscount)}
//                 </span>
//               </div>
//             </div>
//           </div> */}
//         </div>
//       </>
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  apiDeleteAdminOffer,
  apiGetAllAdminProducts,
  apiGetAdminOffers,
  apiUpsertAdminOffer,
} from '@/service/api';
import { toast } from 'react-toastify';
import { Heart, Search, ShoppingCart, Trash2, Truck } from 'lucide-react';

const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatPercent = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return '0%';
  const rounded = Math.round(num * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
};
// const parsePrice = (raw) => {
//   const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
//   return Number.isFinite(n) ? n : 0;
// };
// const PLATFORM_FEE_PERCENT = 12;
const parsePrice = (raw) => {
  const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

const tierRentAmount = (tier) => {
  const n = (k) => {
    const v = Number(String(tier?.[k] ?? '').replace(/,/g, ''));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  return n('customerRent') || n('pricePerDay') || n('vendorRent') || 0;
};

// const getBasePriceInfo = (product) => {
//   if (
//     product?.type === 'Rental' &&
//     Array.isArray(product?.rentalConfigurations)
//   ) {
//     const usable = product.rentalConfigurations.filter(
//       (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
//     );
//     const tier = usable.sort((a, b) => {
//       const lenA =
//         a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
//       const lenB =
//         b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
//       return lenA - lenB;
//     })[0];
//     if (tier) {
//       const isDay = tier.periodUnit === 'day';
//       const len = isDay
//         ? Number(tier.days) > 0
//           ? Number(tier.days)
//           : 1
//         : Number(tier.months) > 0
//           ? Number(tier.months)
//           : 1;
//       const totalAmt = tierRentAmount(tier);
//       const perUnit = Math.round(totalAmt / len);
//       return { amount: perUnit, suffix: isDay ? '/d' : '/mo' };
//     }
//   }
//   return { amount: parsePrice(product?.price), suffix: '' };
// };

const getBasePriceInfo = (product) => {
  if (product?.type === 'Rental') {
    const top = Array.isArray(product?.rentalConfigurations)
      ? product.rentalConfigurations
      : [];
    const topHasPrice = top.some(
      (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
    );
    let configs = top;
    if (!topHasPrice) {
      const variants = Array.isArray(product?.variants) ? product.variants : [];
      const fromVariants = variants.flatMap((v) =>
        Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
      );
      if (fromVariants.length) configs = fromVariants;
    }
    const usable = configs.filter(
      (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
    );
    // const tier = usable.sort((a, b) => {
    //   const lenA =
    //     a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
    //   const lenB =
    //     b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
    //   return lenA - lenB;
    // })[0];
    // if (tier) {
    // const tier = usable.sort((a, b) => {
    //   const lenA =
    //     a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
    //   const lenB =
    //     b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
    //   return lenB - lenA;
    // })[0];
    const tier = usable.sort((a, b) => {
      const lenA =
        a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
      const lenB =
        b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
      return lenA - lenB;
    })[0];
    if (tier) {
      const isDay = tier.periodUnit === 'day';
      const totalAmt = tierRentAmount(tier);
      // Day-wise tiers store a total for the tenure, so divide by day count
      // to get the per-day rate. Month-wise tiers store customerRent as the
      // ALREADY per-month rate, so use it as-is — never divide by months.
      const perUnit = isDay
        ? Math.round(totalAmt / (Number(tier.days) > 0 ? Number(tier.days) : 1))
        : Math.round(totalAmt);
      return { amount: perUnit, suffix: isDay ? '/d' : '/mo' };
    }
  }
  const basePrice = parsePrice(product?.price);
  if (basePrice > 0) return { amount: basePrice, suffix: '' };
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
  if (firstWithPrice) {
    return { amount: parsePrice(firstWithPrice.sellPrice), suffix: '' };
  }
  return { amount: 0, suffix: '' };
};

const PLATFORM_FEE_PERCENT = 15;

// Given admin's reduction on platform fee, compute effective platform fee %
// e.g. reduction=50 → effectiveFee = 12 * (1 - 50/100) = 6%
const resolveEffectivePlatformFeePercent = (draft = {}, offer = {}) => {
  const mode = draft.discountType || 'percent';
  const rawValue =
    draft.platformFeeReduction ?? offer.platformFeeReductionPercent ?? '';
  const n = Number(rawValue || 0);
  if (!Number.isFinite(n) || n <= 0) return PLATFORM_FEE_PERCENT;
  let reductionPercent = n;
  if (mode === 'amount') {
    // user entered rupee amount off the fee; convert to % of platform fee
    // We need base price context — handle in table row instead
    reductionPercent = 0; // fallback; computed per-row
  }
  return Math.max(0, PLATFORM_FEE_PERCENT * (1 - reductionPercent / 100));
};

export default function ProductsOffers() {
  const pageSize = 10;
  const [products, setProducts] = useState([]);
  const [offersByProduct, setOffersByProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [search, setSearch] = useState('');
  const [draftByProduct, setDraftByProduct] = useState({});
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalProductId, setModalProductId] = useState('');
  const [modalReduction, setModalReduction] = useState('');
  const [modalDiscountType, setModalDiscountType] = useState('percent');
  const [modalSaving, setModalSaving] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [productsRes, offersRes] = await Promise.all([
        apiGetAllAdminProducts(token, 'limit=200'),
        apiGetAdminOffers(token),
      ]);
      const prods = productsRes.data?.products || [];
      const offers = offersRes.data?.offers || [];
      const map = {};
      offers.forEach((o) => {
        map[String(o.productId?._id || o.productId)] = o;
      });
      const drafts = {};
      prods.forEach((p) => {
        const id = String(p._id);
        const off = map[id] || {};
        drafts[id] = {
          platformFeeReduction:
            off.platformFeeReductionPercent != null
              ? String(off.platformFeeReductionPercent)
              : '',
          discountType: 'percent',
          isActive: off.isActive ?? true,
        };
      });
      // setProducts(
      //   prods.filter((p) => String(p.type || '').toLowerCase() === 'rental'),
      // );
      setProducts(prods);
      setOffersByProduct(map);
      setDraftByProduct(drafts);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to load products/offers',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // const rows = useMemo(() => {
  //   const q = search.trim().toLowerCase();
  //   const base = products.filter(
  //     (p) => String(p.type || '').toLowerCase() === 'rental',
  //   );
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = products;
    if (!q) return base;
    return base.filter((p) =>
      String(p.productName || '')
        .toLowerCase()
        .includes(q),
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // useEffect(() => {
  //   if (!rows.length) {
  //     setSelectedPreviewProductId('');
  //     return;
  //   }
  //   const exists = rows.some(
  //     (p) => String(p._id) === String(selectedPreviewProductId),
  //   );
  //   if (!exists) setSelectedPreviewProductId(String(rows[0]._id));
  // }, [rows, selectedPreviewProductId]);

  const applyOffer = async (productId) => {
    const product = rows.find((p) => String(p._id) === String(productId));
    const { amount: basePrice } = getBasePriceInfo(product);
    const draft = draftByProduct[productId] || {};
    const mode = draft.discountType || 'percent';
    const raw = Number(draft.platformFeeReduction || 0);

    let platformFeeReductionPercent;
    if (mode === 'amount') {
      // rupee amount off the platform fee → convert to % of the fee
      const defaultFeeAmount = Math.round(
        basePrice * (PLATFORM_FEE_PERCENT / 100),
      );
      if (!raw || raw <= 0) {
        toast.error('Discount amount must be greater than 0');
        return;
      }
      if (raw > defaultFeeAmount) {
        toast.error(
          `Cannot discount more than the platform fee (${rupee(defaultFeeAmount)})`,
        );
        return;
      }
      platformFeeReductionPercent = Math.min(
        100,
        Math.round((raw / defaultFeeAmount) * 100),
      );
    } else {
      if (!raw || raw < 1 || raw > PLATFORM_FEE_PERCENT) {
        toast.error(
          `Platform fee reduction must be between 1% and ${PLATFORM_FEE_PERCENT}%`,
        );
        return;
      }
      // Store exactly what admin entered — % of product price.
      platformFeeReductionPercent = raw;
    }

    setSavingId(productId);
    try {
      await apiUpsertAdminOffer(
        { productId, platformFeeReductionPercent, isActive: true },
        token,
      );
      toast.success('Offer saved');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSavingId('');
    }
  };

  const removeOffer = async (productId) => {
    const offer = offersByProduct[productId];
    if (!offer?._id) return;
    setSavingId(productId);
    try {
      await apiDeleteAdminOffer(offer._id, token);
      toast.success('Offer deleted');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete offer');
    } finally {
      setSavingId('');
    }
  };

  // const preview =
  //   rows.find((p) => String(p._id) === String(selectedPreviewProductId)) ||
  //   null;
  // const previewOffer = preview ? offersByProduct[String(preview._id)] : null;
  // const previewDraft = preview ? draftByProduct[String(preview._id)] : null;
  // const previewBase = parsePrice(preview?.price);
  // const previewDiscount = resolveDiscountPercent(
  //   previewBase,
  //   previewDraft,
  //   previewOffer,
  // );
  // const previewFinal = Math.max(
  //   0,
  //   Math.round(previewBase - (previewBase * previewDiscount) / 100),
  // );
  // const previewSticker =
  //   previewDraft?.sticker || previewOffer?.sticker || 'Bestseller';
  // const previewDiscountAmount = Math.max(0, previewBase - previewFinal);
  // const previewDeliveryEta = getDeliveryEtaLabel(preview);
  // const previewRating = (
  //   4 +
  //   ((preview?.productName?.length || 3) % 10) / 10
  // ).toFixed(1);

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Products & Offers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Switch between offer management and global product inventory
          </p>
        </div> */}
        {/* <button
          type="button"
          onClick={() => {
            setModalProductId('');
            setModalReduction('');
            setModalDiscountType('percent');
            setShowCreateModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700"
        >
          + Create New Offer
        </button> */}
      </div>

      {showCreateModal &&
        (() => {
          // const selectedProduct =
          //   products.find((p) => String(p._id) === modalProductId) || null;
          // const base = parsePrice(selectedProduct?.price);
          // const selectedProduct =
          //   products.find((p) => String(p._id) === modalProductId) || null;
          // const { amount: base } = getBasePriceInfo(selectedProduct);
          // const defaultFeeAmount = Math.round(
          //   base * (PLATFORM_FEE_PERCENT / 100),
          // );

          const selectedProduct =
            products.find((p) => String(p._id) === modalProductId) || null;
          const { amount: base, suffix: baseSuffix } =
            getBasePriceInfo(selectedProduct);
          const defaultFeeAmount = Math.round(
            base * (PLATFORM_FEE_PERCENT / 100),
          );
          if (selectedProduct) {
            console.log('[AdminOffer Debug] selectedProduct:', {
              id: selectedProduct._id,
              productName: selectedProduct.productName,
              type: selectedProduct.type,
              price: selectedProduct.price,
              rentalConfigurations: selectedProduct.rentalConfigurations,
              variants: selectedProduct.variants,
              getBasePriceInfoResult: { amount: base, suffix: baseSuffix },
              defaultFeeAmount,
            });
          }
          const rawReduction = Number(modalReduction || 0);
          let effectiveFeePercent = PLATFORM_FEE_PERCENT;
          if (rawReduction > 0) {
            if (modalDiscountType === 'amount') {
              const pct =
                defaultFeeAmount > 0
                  ? Math.min(100, (rawReduction / defaultFeeAmount) * 100)
                  : 0;
              effectiveFeePercent = Math.max(
                0,
                PLATFORM_FEE_PERCENT * (1 - pct / 100),
              );
            } else {
              // rawReduction is already % of product price.
              const discountAmt = base * (rawReduction / 100);
              effectiveFeePercent =
                defaultFeeAmount > 0
                  ? Math.max(
                      0,
                      PLATFORM_FEE_PERCENT *
                        (1 - Math.min(1, discountAmt / defaultFeeAmount)),
                    )
                  : 0;
            }
          }
          const effectiveFeeAmount = Math.round(
            base * (effectiveFeePercent / 100),
          );
          const payout = Math.max(0, base - effectiveFeeAmount);

          const handleModalApply = async () => {
            if (!modalProductId) {
              toast.error('Please select a product');
              return;
            }
            const raw = Number(modalReduction || 0);
            let platformFeeReductionPercent;
            if (modalDiscountType === 'amount') {
              if (!raw || raw <= 0) {
                toast.error('Discount amount must be greater than 0');
                return;
              }
              if (raw > defaultFeeAmount) {
                toast.error(
                  `Cannot exceed platform fee (${rupee(defaultFeeAmount)})`,
                );
                return;
              }
              platformFeeReductionPercent = Math.min(
                100,
                Math.round((raw / defaultFeeAmount) * 100),
              );
            } else {
              if (!raw || raw < 1 || raw > PLATFORM_FEE_PERCENT) {
                toast.error(
                  `Reduction must be between 1% and ${PLATFORM_FEE_PERCENT}%`,
                );
                return;
              }
              platformFeeReductionPercent = raw;
            }
            setModalSaving(true);
            try {
              await apiUpsertAdminOffer(
                {
                  productId: modalProductId,
                  platformFeeReductionPercent,
                  isActive: true,
                },
                token,
              );
              toast.success('Offer created');
              setShowCreateModal(false);
              await loadData();
            } catch (err) {
              toast.error(
                err.response?.data?.message || 'Failed to save offer',
              );
            } finally {
              setModalSaving(false);
            }
          };

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowCreateModal(false)}
              />
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between">
                  <h2 className="text-white font-semibold text-base">
                    Create New Offer
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-white/80 hover:text-white text-xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Product selector */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Select Product
                    </label>
                    <select
                      value={modalProductId}
                      onChange={(e) => {
                        setModalProductId(e.target.value);
                        setModalReduction('');
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">— Choose a product —</option>
                      {/* {products.map((p) => (
                        <option key={String(p._id)} value={String(p._id)}>
                          {p.productName} ({rupee(p.price)})
                        </option>
                      ))} */}
                      {products.map((p) => {
                        const { amount: optAmount, suffix: optSuffix } =
                          getBasePriceInfo(p);
                        return (
                          <option key={String(p._id)} value={String(p._id)}>
                            {p.productName} ({rupee(optAmount)}
                            {optSuffix})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Reduction input */}
                  {selectedProduct && (
                    <>
                      <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 flex justify-between text-xs text-gray-600">
                        <span>Default platform fee</span>
                        <span className="font-semibold text-blue-600">
                          {rupee(defaultFeeAmount)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Reduce Platform Fee
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalDiscountType('percent');
                              setModalReduction('');
                            }}
                            className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-semibold ${modalDiscountType === 'percent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                          >
                            %
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalDiscountType('amount');
                              setModalReduction('');
                            }}
                            className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-semibold ${modalDiscountType === 'amount' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                          >
                            ₹
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={
                              modalDiscountType === 'amount'
                                ? defaultFeeAmount
                                : PLATFORM_FEE_PERCENT
                            }
                            placeholder={
                              modalDiscountType === 'amount'
                                ? `max ${defaultFeeAmount}`
                                : `max ${PLATFORM_FEE_PERCENT}`
                            }
                            value={modalReduction}
                            onChange={(e) => setModalReduction(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* Live preview */}
                      {rawReduction > 0 && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-1.5 text-xs">
                          <div className="flex justify-between text-gray-600">
                            <span>Balance</span>
                            <span className="font-semibold text-orange-600">
                              {formatPercent(effectiveFeePercent)} (
                              {rupee(effectiveFeeAmount)})
                            </span>
                          </div>
                          {/* <div className="flex justify-between text-gray-600">
                            <span>Vendor payout</span>
                            <span className="font-semibold text-emerald-700">
                              {rupee(payout)}
                            </span>
                          </div> */}
                          <div className="flex justify-between text-gray-600">
                            <span>Discount</span>
                            <span className="font-semibold text-emerald-600">
                              +{rupee(defaultFeeAmount - effectiveFeeAmount)}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleModalApply}
                      disabled={
                        modalSaving || !modalProductId || !modalReduction
                      }
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {modalSaving ? 'Saving...' : 'Apply Offer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      <>
        {/* <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
          Admin-Initiated Offers
        </div> */}
        {/*
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden"> */}
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden w-full">
            {/* <div className="p-4 border-b border-gray-100">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products or offers..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div> */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products or offers..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalProductId('');
                  setModalReduction('');
                  setModalDiscountType('percent');
                  setShowCreateModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700 shrink-0"
              >
                + Create New Offer
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-14">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-gray-500 text-[11px] uppercase tracking-wide">
                      <th className="px-3 py-3 text-left font-medium">
                        Product
                      </th>
                      <th className="px-3 py-3 text-center font-medium">
                        Price
                      </th>
                      <th className="px-3 py-3 text-center font-medium">
                        Commission
                      </th>
                      <th className="px-3 py-3 text-center font-medium">
                        Discount
                      </th>
                      <th className="px-3 py-3 text-center font-medium">
                        Balance
                      </th>
                      {/* <th className="px-3 py-3 text-center font-medium">
                        Vendor Payout
                      </th> */}
                      <th className="px-3 py-3 text-center font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((p) => {
                      // const id = String(p._id);
                      // const offer = offersByProduct[id] || {};
                      // const draft = draftByProduct[id] || {};
                      // const base = parsePrice(p.price);
                      // const defaultFeeAmount = Math.round(
                      const id = String(p._id);
                      const offer = offersByProduct[id] || {};
                      const draft = draftByProduct[id] || {};
                      // const { amount: base, suffix: baseSuffix } =
                      //   getBasePriceInfo(p);
                      // const defaultFeeAmount = Math.round(
                      //   base * (PLATFORM_FEE_PERCENT / 100),
                      // );
                      const { amount: base, suffix: baseSuffix } =
                        getBasePriceInfo(p);
                      const defaultFeeAmount = Math.round(
                        base * (PLATFORM_FEE_PERCENT / 100),
                      );
                      if (base <= 0) {
                        console.log('[AdminOffer Debug] Zero price product:', {
                          id: p._id,
                          productName: p.productName,
                          type: p.type,
                          price: p.price,
                          rentalConfigurations: p.rentalConfigurations,
                          variants: p.variants,
                        });
                      }

                      // Compute effective platform fee %
                      const mode = draft.discountType || 'percent';
                      const rawReduction = Number(
                        draft.platformFeeReduction || 0,
                      );
                      let effectiveFeePercent = PLATFORM_FEE_PERCENT;
                      if (rawReduction > 0) {
                        if (mode === 'amount') {
                          // ₹ entered → what % of the fee is being removed?
                          const reductionAsPercOfFee =
                            defaultFeeAmount > 0
                              ? Math.min(
                                  100,
                                  (rawReduction / defaultFeeAmount) * 100,
                                )
                              : 0;
                          effectiveFeePercent = Math.max(
                            0,
                            PLATFORM_FEE_PERCENT *
                              (1 - reductionAsPercOfFee / 100),
                          );
                        } else {
                          const discountAmt = base * (rawReduction / 100);
                          effectiveFeePercent =
                            defaultFeeAmount > 0
                              ? Math.max(
                                  0,
                                  PLATFORM_FEE_PERCENT *
                                    (1 -
                                      Math.min(
                                        1,
                                        discountAmt / defaultFeeAmount,
                                      )),
                                )
                              : 0;
                        }
                      }
                      const effectiveFeeAmount = Math.round(
                        base * (effectiveFeePercent / 100),
                      );
                      const payout = Math.max(0, base - effectiveFeeAmount);
                      const hasOffer = !!offer?._id;

                      return (
                        <tr
                          key={id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-start justify-start gap-2.5">
                              <img
                                src={p.image}
                                alt=""
                                className="w-9 h-9 rounded object-cover"
                              />
                              <div className="text-left">
                                <p className="font-medium text-gray-900">
                                  {p.productName}
                                </p>
                                {/* <div className="mt-0.5 flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDraftByProduct((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...(prev[id] || {}),
                                          isActive: !(
                                            prev[id]?.isActive ??
                                            offer.isActive ??
                                            false
                                          ),
                                        },
                                      }));
                                    }}
                                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
                                      (draft.isActive ?? offer.isActive)
                                        ? 'bg-orange-500'
                                        : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                        (draft.isActive ?? offer.isActive)
                                          ? 'translate-x-3.5'
                                          : 'translate-x-0.5'
                                      }`}
                                    />
                                  </button>
                                  <span
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${hasOffer && offer.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                                  >
                                    {hasOffer && offer.isActive
                                      ? 'Active Offer'
                                      : 'No Offer'}
                                  </span>
                                </div> */}
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${hasOffer && offer.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                                  >
                                    {hasOffer && offer.isActive
                                      ? 'Active Offer'
                                      : 'No Offer'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* <td className="px-3 py-3 text-right text-gray-700 font-medium">
                            {rupee(base)}
                          </td> */}
                          <td className="px-3 py-3 text-center text-gray-700 font-medium">
                            {rupee(base)}
                            {baseSuffix ? (
                              <span className="text-gray-400">
                                {baseSuffix}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <p className="text-blue-600 text-xs font-semibold">
                              {formatPercent(PLATFORM_FEE_PERCENT)}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {rupee(defaultFeeAmount)}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="space-y-1.5 inline-block text-left">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentMode =
                                      draft.discountType || 'percent';
                                    if (currentMode === 'percent') return;
                                    const currentRaw = Number(
                                      draft.platformFeeReduction || 0,
                                    );
                                    const converted =
                                      currentRaw > 0 && base > 0
                                        ? String(
                                            Math.min(
                                              PLATFORM_FEE_PERCENT,
                                              Math.round(
                                                (currentRaw / base) * 100,
                                              ),
                                            ),
                                          )
                                        : '';
                                    setDraftByProduct((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...(prev[id] || {}),
                                        discountType: 'percent',
                                        platformFeeReduction: converted,
                                      },
                                    }));
                                  }}
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold ${
                                    (draft.discountType || 'percent') ===
                                    'percent'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  %
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentMode =
                                      draft.discountType || 'percent';
                                    if (currentMode === 'amount') return;
                                    const currentRaw = Number(
                                      draft.platformFeeReduction || 0,
                                    );
                                    const converted =
                                      currentRaw > 0
                                        ? String(
                                            Math.round(
                                              base * (currentRaw / 100),
                                            ),
                                          )
                                        : '';
                                    setDraftByProduct((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...(prev[id] || {}),
                                        discountType: 'amount',
                                        platformFeeReduction: converted,
                                      },
                                    }));
                                  }}
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold ${
                                    draft.discountType === 'amount'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  ₹
                                </button>
                              </div>
                              <input
                                type="number"
                                min={1}
                                max={
                                  draft.discountType === 'amount'
                                    ? defaultFeeAmount
                                    : PLATFORM_FEE_PERCENT
                                }
                                placeholder={
                                  draft.discountType === 'amount'
                                    ? `max ${defaultFeeAmount}`
                                    : `max ${PLATFORM_FEE_PERCENT}`
                                }
                                value={draft.platformFeeReduction ?? ''}
                                onChange={(e) =>
                                  setDraftByProduct((prev) => ({
                                    ...prev,
                                    [id]: {
                                      ...(prev[id] || {}),
                                      platformFeeReduction: e.target.value,
                                    },
                                  }))
                                }
                                className="w-24 px-2 py-1.5 border border-gray-200 rounded text-xs"
                              />
                              {/* {rawReduction > 0 && (
                                <p className="text-[10px] text-orange-600 font-medium">
                                  → {formatPercent(effectiveFeePercent)} fee (
                                  {rupee(effectiveFeeAmount)})
                                </p>
                              )} */}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {/* <p
                              className={`text-xs font-semibold ${rawReduction > 0 ? 'text-orange-600' : 'text-blue-600'}`}
                            >
                              {formatPercent(effectiveFeePercent)}
                            </p> */}
                            <p
                              className={`text-xs ${rawReduction > 0 ? 'text-orange-500' : 'text-gray-500'}`}
                            >
                              {rupee(effectiveFeeAmount)}
                            </p>
                          </td>
                          {/* <td className="px-3 py-3 text-center">
                            <p className="text-emerald-600 font-semibold text-sm">
                              {rupee(payout)}
                            </p>
                            {rawReduction > 0 && (
                              <p className="text-[10px] text-emerald-500">
                                +{rupee(payout - (base - defaultFeeAmount))}{' '}
                                extra
                              </p>
                            )}
                          </td> */}
                          <td className="px-3 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => applyOffer(id)}
                                disabled={savingId === id}
                                className={`px-3 py-1 rounded-full text-white text-xs disabled:opacity-60 ${
                                  hasOffer ? 'bg-emerald-600' : 'bg-blue-600'
                                }`}
                              >
                                {savingId === id
                                  ? 'Saving...'
                                  : hasOffer
                                    ? 'Applied'
                                    : 'Apply'}
                              </button>
                              {hasOffer ? (
                                <button
                                  type="button"
                                  onClick={() => removeOffer(id)}
                                  disabled={savingId === id}
                                  className="inline-flex items-center gap-1 text-red-600 text-xs font-medium disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No offers found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && rows.length > 0 ? (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, rows.length)} of{' '}
                  {rows.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="font-medium text-gray-700">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden">
              <div className="p-4 border-b border-blue-200 bg-blue-50/70">
                <h3 className="text-sm font-semibold text-gray-900">
                  Customer Preview
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  How this offer will appear to customers
                </p>
              </div>
              {preview ? (
                <div className="p-4">
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <div className="relative">
                      <img
                        src={preview.image}
                        alt=""
                        className="w-full h-40 object-cover"
                      />
                      <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-orange-500 text-white text-[10px] font-medium px-2 py-0.5">
                        {previewSticker || 'Bestseller'}
                      </span>
                      <span className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white text-sm font-bold leading-none shadow-sm">
                        {formatPercent(previewDiscount)}
                      </span>
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 text-blue-700 text-[10px] font-medium px-2 py-0.5">
                        <Truck className="w-3 h-3" />
                        {previewDeliveryEta}
                      </span>
                      <button
                        type="button"
                        className="absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-500 border border-gray-200"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-base font-medium text-gray-900 line-clamp-1">
                          {preview.productName}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 shrink-0">
                          {previewRating} ★
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-0.5">
                          {String(
                            preview.condition || preview.type || 'Used - Good',
                          )}
                        </span>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <div className="flex items-end gap-1.5">
                          <span className="text-[28px] leading-none font-semibold text-gray-900">
                            {previewDiscount
                              ? rupee(previewFinal)
                              : rupee(previewBase)}
                          </span>
                          {previewDiscount ? (
                            <span className="text-xs text-gray-400 line-through mb-1">
                              {rupee(previewBase)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium inline-flex items-center justify-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="p-4 text-sm text-gray-500">
                  No products to preview.
                </p>
              )}
            </div>

            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-xs">
              <p className="text-gray-600">Offer Impact</p>
              <div className="mt-2 flex justify-between">
                <span>Discount Amount:</span>
                <span className="font-medium text-rose-600">
                  {rupee(previewDiscountAmount)}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Customer Saves:</span>
                <span className="font-medium text-emerald-700">
                  {formatPercent(previewDiscount)}
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </>
    </div>
  );
}
