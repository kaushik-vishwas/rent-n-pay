// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import { useSelector } from 'react-redux';
// import {
//   apiDeleteVendorOffer,
//   apiGetMyProducts,
//   apiGetMyServiceProducts,
//   apiGetVendorOffers,
//   apiUpsertVendorOffer,
// } from '@/service/api';
// import { toast } from 'react-toastify';
// import { Heart, Search, ShoppingCart, Trash2, Truck } from 'lucide-react';

// const STICKERS = [
//   '',
//   'Limited Deal',
//   'Festival Offer',
//   'Hot Sale',
//   'Clearance',
//   'New Arrival',
// ];

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
//     const tier = usable.sort((a, b) => {
//       const lenA =
//         a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
//       const lenB =
//         b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
//       return lenA - lenB;
//     })[0];
//     //   if (tier) {
//     //   if (tier) {
//     //     const isDay = tier.periodUnit === 'day';
//     //     const len = isDay
//     //       ? Number(tier.days) > 0
//     //         ? Number(tier.days)
//     //         : 1
//     //       : Number(tier.months) > 0
//     //         ? Number(tier.months)
//     //         : 1;
//     //     const totalAmt = tierRentAmount(tier);
//     //     const perUnit = Math.round(totalAmt / len);
//     //     return { amount: perUnit, suffix: isDay ? '/d' : '/mo' };
//     //   }
//     // }
//     // const basePrice = parsePrice(product?.price);
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

// const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// const formatPercent = (n) => {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num) || num <= 0) return '0%';
//   const rounded = Math.round(num * 10) / 10;
//   return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
// };

// const toDateInputValue = (dateLike) => {
//   if (!dateLike) return '';
//   const d = new Date(dateLike);
//   if (Number.isNaN(d.getTime())) return '';
//   return d.toISOString().slice(0, 10);
// };

// const resolveDiscountPercent = (basePrice, draft = {}, offer = {}) => {
//   const safeDraft = draft || {};
//   const safeOffer = offer || {};
//   const mode = safeDraft.discountType || 'percent';
//   const rawValue = safeDraft.discountPercent ?? safeOffer.discountPercent ?? '';
//   const n = Number(rawValue || 0);
//   if (!Number.isFinite(n) || n <= 0 || basePrice <= 0) return 0;
//   if (mode === 'amount') {
//     return Math.min(100, Math.max(0, (n / basePrice) * 100));
//   }
//   return Math.min(100, Math.max(0, n));
// };
// const getDeliveryEtaLabel = (product) => {
//   const lv = product?.logisticsVerification || {};
//   const n = Number(lv.deliveryTimelineValue);
//   const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
//   if (!Number.isFinite(n) || n <= 0) return 'Varies';
//   if (unit === 'hours') return `${n} hour${n !== 1 ? 's' : ''}`;
//   return `${n} day${n !== 1 ? 's' : ''}`;
// };

// export default function VendorOffersPage() {
//   const pageSize = 10;
//   const { user, token } = useSelector((s) => s.vendor);
//   const [products, setProducts] = useState([]);
//   const [offersByProduct, setOffersByProduct] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [savingId, setSavingId] = useState('');
//   const [selectedPreviewProductId, setSelectedPreviewProductId] = useState('');
//   const [draftByProduct, setDraftByProduct] = useState({});
//   const [page, setPage] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState('create');
//   const [form, setForm] = useState({
//     productId: '',
//     discountPercent: '',
//     discountType: 'percent',
//     sticker: '',
//     startDate: '',
//     endDate: '',
//     isActive: true,
//   });

//   const authToken =
//     token ||
//     (typeof window !== 'undefined'
//       ? localStorage.getItem('vendorToken')
//       : null);

//   // const loadData = async () => {
//   //   if (!authToken) return;
//   //   setLoading(true);
//   //   try {
//   //     const [productsRes, offersRes] = await Promise.all([
//   //       apiGetMyProducts(authToken),
//   //       apiGetVendorOffers(authToken),
//   //     ]);
//   //     const prods = productsRes.data?.products || [];
//   //     const offers = offersRes.data?.offers || [];
//   //     const map = {};
//   //     offers.forEach((o) => {
//   //       map[String(o.productId?._id || o.productId)] = o;
//   //     });
//   //     const drafts = {};
//   //     (prods || [])(
//   //       // .filter((p) => p.type === 'Rental')

//   //       // .forEach((p) => {
//   //       //   const id = String(p._id);
//   //       //   const offer = map[id] || {};
//   //       //   drafts[id] = {
//   //       //     discountPercent:
//   //       //       offer.discountPercent != null
//   //       //         ? String(offer.discountPercent)
//   //       //         : '',
//   //       //     discountType: 'percent',
//   //       //     sticker: offer.sticker || '',
//   //       //     isActive: offer.isActive ?? false,
//   //       //   };
//   //       // });
//   //       prods || [],
//   //     ).forEach((p) => {
//   //       const id = String(p._id);
//   //       const offer = map[id] || {};

//   //       drafts[id] = {
//   //         discountPercent:
//   //           offer.discountPercent != null ? String(offer.discountPercent) : '',
//   //         discountType: 'percent',
//   //         sticker: offer.sticker || '',
//   //         isActive: offer.isActive ?? false,
//   //       };
//   //     });
//   //     setProducts(prods);
//   //     setOffersByProduct(map);
//   //     setDraftByProduct(drafts);
//   //   } catch (err) {
//   //     toast.error(err.response?.data?.message || 'Failed to load offers data');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const loadData = async () => {
//     if (!authToken) return;

//     setLoading(true);

//     try {
//       const [productsRes, serviceProductsRes, offersRes] = await Promise.all([
//         apiGetMyProducts(authToken),
//         apiGetMyServiceProducts(authToken),
//         apiGetVendorOffers(authToken),
//       ]);

//       const prods = productsRes.data?.products || [];
//       const serviceProds = (serviceProductsRes.data?.products || []).map(
//         (sp) => ({ ...sp, productType: 'ServiceProduct' }),
//       );
//       const allProds = [
//         ...prods.map((p) => ({ ...p, productType: 'Product' })),
//         ...serviceProds,
//       ];
//       const offers = offersRes.data?.offers || [];

//       const map = {};

//       offers.forEach((o) => {
//         map[String(o.productId?._id || o.productId)] = o;
//       });

//       const drafts = {};

//       (allProds || []).forEach((p) => {
//         const id = String(p._id);
//         const offer = map[id] || {};

//         // drafts[id] = {
//         //   discountPercent:
//         //     offer.discountPercent != null ? String(offer.discountPercent) : '',
//         //   discountType: 'percent',
//         //   sticker: offer.sticker || '',
//         //   isActive: offer.isActive ?? false,
//         // };
//         drafts[id] = {
//           discountPercent:
//             offer.discountPercent != null ? String(offer.discountPercent) : '',
//           discountType: 'percent',
//           sticker: offer.sticker || '',
//           isActive: offer.isActive ?? true,
//         };
//       });

//       setProducts(allProds);
//       setOffersByProduct(map);
//       setDraftByProduct(drafts);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || 'Failed to load offers data');
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     loadData();
//   }, [authToken]);

//   const rows = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     // const base = products.filter((p) => p.type === 'Rental');
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

//   // const rentalProducts = useMemo(
//   //   () => products.filter((p) => p.type === 'Rental'),
//   //   [products],
//   // );
//   const allProducts = useMemo(() => products, [products]);

//   useEffect(() => {
//     if (!rows.length) {
//       setSelectedPreviewProductId('');
//       return;
//     }
//     const exists = rows.some(
//       (p) => String(p._id) === String(selectedPreviewProductId),
//     );
//     if (!exists) {
//       setSelectedPreviewProductId(String(rows[0]._id));
//     }
//   }, [rows, selectedPreviewProductId]);

//   const openCreateModal = () => {
//     setModalMode('create');
//     setForm({
//       productId: '',
//       discountPercent: '',
//       discountType: 'percent',
//       sticker: '',
//       startDate: '',
//       endDate: '',
//       isActive: true,
//     });
//     setIsModalOpen(true);
//   };

//   const openEditModal = (productId) => {
//     const offer = offersByProduct[productId] || {};
//     setModalMode('edit');
//     setForm({
//       productId,
//       discountPercent: offer.discountPercent ?? '',
//       discountType: 'percent',
//       sticker: offer.sticker || '',
//       startDate: toDateInputValue(offer.startDate),
//       endDate: toDateInputValue(offer.endDate),
//       isActive: offer.isActive ?? true,
//     });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => setIsModalOpen(false);

//   const removeOffer = async (productId) => {
//     const offer = offersByProduct[productId];
//     if (!offer?._id) return;
//     setSavingId(productId);
//     try {
//       await apiDeleteVendorOffer(offer._id, authToken);
//       toast.success('Offer removed');
//       await loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to remove offer');
//     } finally {
//       setSavingId('');
//     }
//   };

//   const applyInlineOffer = async (productId) => {
//     const product = rows.find((p) => String(p._id) === String(productId));
//     const { amount: basePrice } = getBasePriceInfo(product);
//     const draft = draftByProduct[productId] || {};
//     const mode = draft.discountType || 'percent';
//     const raw = Number(draft.discountPercent || 0);
//     if (mode === 'amount') {
//       if (!raw || raw <= 0) {
//         toast.error('Discount amount must be greater than 0');
//         return;
//       }
//       if (!basePrice || raw > basePrice) {
//         toast.error('Discount amount cannot be more than product price');
//         return;
//       }
//     } else if (!raw || raw < 1 || raw > 100) {
//       toast.error('Discount percent must be between 1 and 100');
//       return;
//     }
//     const discountPercent = resolveDiscountPercent(basePrice, draft, {});

//     setSavingId(productId);
//     try {
//       // await apiUpsertVendorOffer(
//       //   {
//       //     productId,
//       //     discountPercent,
//       //     sticker: draft.sticker || '',
//       //     isActive: draft.isActive ?? true,
//       //   },
//       //   authToken,
//       // );
//       const existingOffer = offersByProduct[productId] || {};
//       await apiUpsertVendorOffer(
//         {
//           productId,
//           productType: product?.productType || 'Product',
//           discountPercent,
//           sticker: draft.sticker || '',
//           isActive: draft.isActive ?? true,
//           startDate: existingOffer.startDate
//             ? toDateInputValue(existingOffer.startDate)
//             : null,
//           endDate: existingOffer.endDate
//             ? toDateInputValue(existingOffer.endDate)
//             : null,
//         },
//         authToken,
//       );
//       toast.success('Offer applied');
//       await loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save offer');
//     } finally {
//       setSavingId('');
//     }
//   };

//   const submitOffer = async () => {
//     const productId = String(form.productId || '');
//     // const selected = rentalProducts.find((p) => String(p._id) === productId);
//     const selected = allProducts.find((p) => String(p._id) === productId);
//     const { amount: basePrice } = getBasePriceInfo(selected);
//     const raw = Number(form.discountPercent || 0);
//     const discountPercent =
//       form.discountType === 'amount'
//         ? Math.min(100, Math.max(0, (raw / Math.max(1, basePrice)) * 100))
//         : raw;
//     if (!productId) {
//       toast.error('Please select a product');
//       return;
//     }
//     if (form.discountType === 'amount') {
//       if (!raw || raw <= 0) {
//         toast.error('Flat amount must be greater than 0');
//         return;
//       }
//       if (!basePrice || raw > basePrice) {
//         toast.error('Flat amount cannot exceed product price');
//         return;
//       }
//     } else if (
//       !discountPercent ||
//       discountPercent < 1 ||
//       discountPercent > 100
//     ) {
//       toast.error('Discount percent must be between 1 and 100');
//       return;
//     }
//     if (form.startDate && form.endDate && form.endDate < form.startDate) {
//       toast.error('End date must be after start date');
//       return;
//     }

//     setSavingId(productId);
//     try {
//       await apiUpsertVendorOffer(
//         {
//           productId,
//           productType: selected?.productType || 'Product',
//           discountPercent,
//           sticker: form.sticker || '',
//           startDate: form.startDate || null,
//           endDate: form.endDate || null,
//           isActive: form.isActive,
//         },
//         authToken,
//       );
//       toast.success(modalMode === 'create' ? 'Offer created' : 'Offer updated');
//       setIsModalOpen(false);
//       await loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save offer');
//     } finally {
//       setSavingId('');
//     }
//   };

//   const preview =
//     rows.find((p) => String(p._id) === String(selectedPreviewProductId)) ||
//     null;
//   const previewOffer = preview ? offersByProduct[String(preview._id)] : null;
//   const previewDraft = preview ? draftByProduct[String(preview._id)] : null;
//   const { amount: previewBase } = getBasePriceInfo(preview);
//   const previewDiscount = resolveDiscountPercent(
//     previewBase,
//     previewDraft,
//     previewOffer,
//   );
//   const previewSticker = previewDraft?.sticker || previewOffer?.sticker || '';
//   const previewActive = preview
//     ? (previewDraft?.isActive ?? previewOffer?.isActive ?? false)
//     : false;
//   const previewDeliveryEta = getDeliveryEtaLabel(preview);
//   const previewFinal = Math.max(
//     0,
//     Math.round(previewBase - (previewBase * previewDiscount) / 100),
//   );
//   // const formProduct = rentalProducts.find(
//   //   (p) => String(p._id) === String(form.productId),
//   // );
//   const formProduct = allProducts.find(
//     (p) => String(p._id) === String(form.productId),
//   );
//   const { amount: formBase } = getBasePriceInfo(formProduct);
//   const formRaw = Number(form.discountPercent || 0);
//   const formDiscountPercent =
//     form.discountType === 'amount'
//       ? Math.min(100, Math.max(0, (formRaw / Math.max(1, formBase)) * 100))
//       : Math.min(100, Math.max(0, formRaw));
//   const formDiscountAmount = Math.round((formBase * formDiscountPercent) / 100);
//   const formDiscounted = Math.max(0, formBase - formDiscountAmount);
//   const platformCommission = Math.round(formDiscounted * 0.12);
//   const vendorPayout = Math.max(0, formDiscounted - platformCommission);

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       <VendorSidebar />
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         <VendorTopBar user={user} />
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f3f5f9]">
//           {/* <div className="flex items-start justify-between gap-3 mb-5">
//             <button
//               onClick={openCreateModal}
//               className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700"
//             >
//               + Create New Offer
//             </button>
//           </div>

//           <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//             <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
//               <div className="p-4 border-b border-gray-100">
//                 <div className="relative w-full md:max-w-sm">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search products or offers..."
//                     className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
//                   />
//                 </div>
//               </div> */}

//           <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//             <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
//               <div className="p-4 border-b border-gray-100">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                   <div className="relative w-full sm:max-w-sm">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       value={search}
//                       onChange={(e) => setSearch(e.target.value)}
//                       placeholder="Search products or offers..."
//                       className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
//                     />
//                   </div>
//                   <button
//                     onClick={openCreateModal}
//                     className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700 w-full sm:w-auto shrink-0"
//                   >
//                     + Create New Offer
//                   </button>
//                 </div>
//               </div>

//               {loading ? (
//                 <div className="flex justify-center py-14">
//                   <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                 </div>
//               ) : (
//                 <>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-[980px] w-full text-sm">
//                       <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
//                         <tr>
//                           <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
//                             Product Details
//                           </th>
//                           <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
//                             Original Price
//                           </th>
//                           <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
//                             Discount
//                           </th>
//                           <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
//                             Sticker
//                           </th>
//                           <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
//                             Final Price
//                           </th>
//                           <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {pagedRows.map((p) => {
//                           const id = String(p._id);
//                           const { amount: base, suffix: baseSuffix } =
//                             getBasePriceInfo(p);
//                           const offer = offersByProduct[id] || {};
//                           const draft = draftByProduct[id] || {};
//                           const discountPercent = resolveDiscountPercent(
//                             base,
//                             draft,
//                             offer,
//                           );
//                           const final = Math.max(
//                             0,
//                             Math.round(base - (base * discountPercent) / 100),
//                           );
//                           const start = toDateInputValue(offer.startDate);
//                           const end = toDateInputValue(offer.endDate);
//                           return (
//                             <tr
//                               key={id}
//                               onClick={() => setSelectedPreviewProductId(id)}
//                               className={`border-t border-gray-100 cursor-pointer transition ${
//                                 String(selectedPreviewProductId) === id
//                                   ? 'bg-orange-50'
//                                   : 'hover:bg-gray-50'
//                               }`}
//                             >
//                               <td className="px-3 py-3">
//                                 <div className="flex items-center gap-3">
//                                   <img
//                                     src={p.image}
//                                     alt=""
//                                     className="w-10 h-10 rounded object-cover"
//                                   />
//                                   <div>
//                                     <p className="font-medium text-gray-900">
//                                       {p.productName}
//                                     </p>
//                                     <div className="mt-0.5 flex items-center gap-1.5">
//                                       <button
//                                         type="button"
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           setDraftByProduct((prev) => ({
//                                             ...prev,
//                                             [id]: {
//                                               ...(prev[id] || {}),
//                                               isActive: !(
//                                                 prev[id]?.isActive ??
//                                                 offer.isActive ??
//                                                 false
//                                               ),
//                                             },
//                                           }));
//                                         }}
//                                         className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
//                                           (draft.isActive ?? offer.isActive)
//                                             ? 'bg-orange-500'
//                                             : 'bg-gray-300'
//                                         }`}
//                                         aria-label="Toggle offer active state"
//                                       >
//                                         <span
//                                           className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
//                                             (draft.isActive ?? offer.isActive)
//                                               ? 'translate-x-3.5'
//                                               : 'translate-x-0.5'
//                                           }`}
//                                         />
//                                       </button>
//                                       <p className="text-[11px] text-gray-500">
//                                         {draft.sticker ||
//                                           offer.sticker ||
//                                           p.category}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-3 py-3">
//                                 {rupee(base)}
//                                 {baseSuffix ? (
//                                   <span className="text-gray-400">
//                                     {baseSuffix}
//                                   </span>
//                                 ) : null}
//                               </td>
//                               <td className="px-3 py-3">
//                                 <div className="flex items-center gap-1.5">
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setDraftByProduct((prev) => ({
//                                         ...prev,
//                                         [id]: {
//                                           ...(prev[id] || {}),
//                                           discountType: 'percent',
//                                         },
//                                       }));
//                                     }}
//                                     className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold ${
//                                       (draft.discountType || 'percent') ===
//                                       'percent'
//                                         ? 'bg-blue-600 text-white'
//                                         : 'bg-gray-200 text-gray-600'
//                                     }`}
//                                   >
//                                     %
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setDraftByProduct((prev) => ({
//                                         ...prev,
//                                         [id]: {
//                                           ...(prev[id] || {}),
//                                           discountType: 'amount',
//                                         },
//                                       }));
//                                     }}
//                                     className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold ${
//                                       draft.discountType === 'amount'
//                                         ? 'bg-blue-600 text-white'
//                                         : 'bg-gray-200 text-gray-600'
//                                     }`}
//                                   >
//                                     ₹
//                                   </button>
//                                   <input
//                                     type="number"
//                                     min={1}
//                                     max={
//                                       draft.discountType === 'amount'
//                                         ? Math.max(1, base)
//                                         : 100
//                                     }
//                                     value={draft.discountPercent ?? ''}
//                                     onClick={(e) => e.stopPropagation()}
//                                     onChange={(e) =>
//                                       setDraftByProduct((prev) => ({
//                                         ...prev,
//                                         [id]: {
//                                           ...(prev[id] || {}),
//                                           discountPercent: e.target.value,
//                                         },
//                                       }))
//                                     }
//                                     placeholder={
//                                       draft.discountType === 'amount'
//                                         ? '₹ amount'
//                                         : '% off'
//                                     }
//                                     className="w-16 px-2 py-1.5 border border-gray-200 rounded text-xs"
//                                   />
//                                 </div>
//                               </td>
//                               {/* <td className="px-3 py-3">
//                                 <select
//                                   value={draft.sticker ?? ''}
//                                   onClick={(e) => e.stopPropagation()}
//                                   onChange={(e) =>
//                                     setDraftByProduct((prev) => ({
//                                       ...prev,
//                                       [id]: {
//                                         ...(prev[id] || {}),
//                                         sticker: e.target.value,
//                                       },
//                                     }))
//                                   }
//                                   className="w-24 px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white"
//                                 >
//                                   {STICKERS.map((s) => (
//                                     <option key={s || 'none'} value={s}>
//                                       {s || 'None'}
//                                     </option>
//                                   ))}
//                                 </select>
//                               </td> */}
//                               <td className="px-3 py-3">
//                                 {p.productType === 'ServiceProduct' ? (
//                                   <span className="text-[11px] text-gray-400 italic">
//                                     None
//                                   </span>
//                                 ) : (
//                                   <select
//                                     value={draft.sticker ?? ''}
//                                     onClick={(e) => e.stopPropagation()}
//                                     onChange={(e) =>
//                                       setDraftByProduct((prev) => ({
//                                         ...prev,
//                                         [id]: {
//                                           ...(prev[id] || {}),
//                                           sticker: e.target.value,
//                                         },
//                                       }))
//                                     }
//                                     className="w-24 px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white"
//                                   >
//                                     {STICKERS.map((s) => (
//                                       <option key={s || 'none'} value={s}>
//                                         {s || 'None'}
//                                       </option>
//                                     ))}
//                                   </select>
//                                 )}
//                               </td>
//                               <td className="px-3 py-3 text-emerald-600 font-semibold">
//                                 {discountPercent ? rupee(final) : '-'}
//                               </td>
//                               <td className="px-3 py-3">
//                                 <div className="flex flex-col gap-1">
//                                   {/* <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       applyInlineOffer(id);
//                                     }}
//                                     disabled={savingId === id}
//                                     className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-60"
//                                   >
//                                     {savingId === id ? 'Saving...' : 'Apply'}
//                                   </button> */}
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       applyInlineOffer(id);
//                                     }}
//                                     disabled={savingId === id}
//                                     className={`px-3 py-1 rounded-lg text-white text-xs disabled:opacity-60 ${
//                                       offer?._id
//                                         ? 'bg-emerald-600'
//                                         : 'bg-blue-600'
//                                     }`}
//                                   >
//                                     {savingId === id
//                                       ? 'Saving...'
//                                       : offer?._id
//                                         ? 'Applied'
//                                         : 'Apply'}
//                                   </button>
//                                   {offer?._id ? (
//                                     <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         removeOffer(id);
//                                       }}
//                                       disabled={savingId === id}
//                                       className="inline-flex items-center gap-1 text-red-600 text-xs font-medium disabled:opacity-50"
//                                       aria-label="Delete offer"
//                                       title="Delete offer"
//                                     >
//                                       <Trash2 className="w-3.5 h-3.5" />
//                                       Remove{' '}
//                                     </button>
//                                   ) : null}
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                         {pagedRows.length === 0 ? (
//                           <tr>
//                             <td
//                               colSpan={6}
//                               className="px-4 py-10 text-center text-gray-500"
//                             >
//                               No products found.
//                             </td>
//                           </tr>
//                         ) : null}
//                       </tbody>
//                     </table>
//                   </div>
//                   {rows.length > 0 ? (
//                     <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
//                       <span>
//                         Showing {(currentPage - 1) * pageSize + 1}-
//                         {Math.min(currentPage * pageSize, rows.length)} of{' '}
//                         {rows.length}
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           onClick={() => setPage((p) => Math.max(1, p - 1))}
//                           disabled={currentPage === 1}
//                           className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
//                         >
//                           Prev
//                         </button>
//                         <span className="font-medium text-gray-700">
//                           {currentPage}/{totalPages}
//                         </span>
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setPage((p) => Math.min(totalPages, p + 1))
//                           }
//                           disabled={currentPage === totalPages}
//                           className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     </div>
//                   ) : null}
//                 </>
//               )}
//             </div>

//             <div className="space-y-4">
//               <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden">
//                 <div className="p-4 border-b border-blue-200 bg-blue-50/70">
//                   <h3 className="text-sm font-semibold text-gray-900">
//                     Customer Preview
//                   </h3>
//                   <p className="text-xs text-gray-600 mt-1">
//                     How this offer will appear to customers
//                   </p>
//                 </div>
//                 {preview ? (
//                   <div className="p-4">
//                     <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
//                       <div className="relative">
//                         <img
//                           src={preview.image}
//                           alt=""
//                           className="w-full h-52 object-cover"
//                         />
//                         {previewActive && previewSticker ? (
//                           <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-orange-500 text-white text-[10px] font-medium px-2 py-0.5">
//                             {previewSticker}
//                           </span>
//                         ) : null}
//                         <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 text-blue-700 text-[10px] font-medium px-2 py-0.5">
//                           <Truck className="w-3 h-3" />
//                           {previewDeliveryEta}
//                         </span>
//                         <button
//                           type="button"
//                           className="absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-500 border border-gray-200"
//                           aria-label="Wishlist"
//                         >
//                           <Heart className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                       <div className="p-3.5">
//                         <div className="flex items-center justify-between gap-2">
//                           <p className="text-[22px] leading-none font-semibold text-gray-900">
//                             LG
//                           </p>
//                           <span className="inline-flex items-center rounded-full bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5">
//                             4.3 ★
//                           </span>
//                         </div>
//                         <p className="mt-1 text-base font-medium text-gray-900 line-clamp-1">
//                           {preview.productName}
//                         </p>
//                         <span className="mt-2 inline-flex rounded-full border border-gray-200 text-[10px] text-gray-500 px-2 py-0.5">
//                           {preview.condition || 'Refurbished'}
//                         </span>
//                         <div className="mt-3 flex items-end justify-between gap-2">
//                           <div className="flex items-end gap-1.5">
//                             <span className="text-[28px] leading-none font-semibold text-gray-900">
//                               {previewDiscount
//                                 ? rupee(previewFinal)
//                                 : rupee(previewBase)}
//                             </span>
//                             {previewDiscount ? (
//                               <span className="text-xs text-gray-400 line-through mb-1">
//                                 {rupee(previewBase)}
//                               </span>
//                             ) : null}
//                           </div>
//                           <span className="inline-flex rounded-full border border-gray-200 text-[10px] text-gray-500 px-2 py-0.5 mb-1">
//                             {previewDiscount
//                               ? `${formatPercent(previewDiscount)} Off`
//                               : 'No offer'}
//                           </span>
//                         </div>
//                         <button className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium inline-flex items-center justify-center gap-1.5">
//                           <ShoppingCart className="w-3.5 h-3.5" />
//                           Buy Now
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="p-4 text-sm text-gray-500">
//                     No products to preview.
//                   </p>
//                 )}
//               </div>

//               <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-xs">
//                 <p className="text-gray-600">Offer Impact</p>
//                 <div className="mt-2 flex justify-between">
//                   <span>Discount Amount:</span>
//                   <span className="font-medium text-rose-600">
//                     {previewDiscount ? rupee(previewBase - previewFinal) : '₹0'}
//                   </span>
//                 </div>
//                 <div className="mt-1 flex justify-between">
//                   <span>Customer Saves:</span>
//                   <span className="font-medium text-emerald-700">
//                     {formatPercent(previewDiscount)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {isModalOpen ? (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
//               <div className="w-full max-w-xl max-h-[86vh] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
//                 <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//                   <div>
//                     <h3 className="text-2xl font-semibold text-gray-900">
//                       {modalMode === 'create'
//                         ? 'Create New Offer'
//                         : 'Update Offer'}
//                     </h3>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Create a promotional offer for your products
//                     </p>
//                   </div>
//                   <button
//                     onClick={closeModal}
//                     className="text-sm text-gray-500 hover:text-gray-700 h-8 w-8 rounded-lg border border-gray-200"
//                   >
//                     ×
//                   </button>
//                 </div>

//                 <div className="p-5 space-y-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                   <div>
//                     <p className="text-xs font-medium text-gray-700 mb-2">
//                       Step 1: Select Product
//                     </p>
//                     {/* <select
//                       value={form.productId}
//                       onChange={(e) =>
//                         setForm((prev) => ({
//                           ...prev,
//                           productId: e.target.value,
//                         }))
//                       }
//                       disabled={modalMode === 'edit'}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
//                     >
//                       <option value="">Select a product</option> */}
//                     <select
//                       value={form.productId}
//                       onChange={(e) => {
//                         const newId = e.target.value;
//                         const selectedProduct = allProducts.find(
//                           (p) => String(p._id) === String(newId),
//                         );
//                         setForm((prev) => ({
//                           ...prev,
//                           productId: newId,
//                           sticker:
//                             selectedProduct?.productType === 'ServiceProduct'
//                               ? ''
//                               : prev.sticker,
//                         }));
//                       }}
//                       disabled={modalMode === 'edit'}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
//                     >
//                       <option value="">Select a product</option>
//                       {allProducts.map((p) => {
//                         const typeLabel =
//                           p.productType === 'ServiceProduct'
//                             ? 'Service'
//                             : p.type === 'Rental'
//                               ? 'Rent'
//                               : 'Sell';
//                         return (
//                           <option key={p._id} value={p._id}>
//                             {p.productName} ({typeLabel})
//                           </option>
//                         );
//                       })}
//                     </select>
//                     {formProduct ? (
//                       <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 flex items-center gap-3">
//                         <img
//                           src={formProduct.image}
//                           alt=""
//                           className="w-10 h-10 rounded-lg object-cover"
//                         />
//                         <div>
//                           <p className="text-sm font-semibold text-gray-900">
//                             {formProduct.productName}
//                           </p>
//                           <p className="text-xs text-blue-700">
//                             {rupee(formBase)}
//                           </p>
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>

//                   <div>
//                     <p className="text-xs font-medium text-gray-700 mb-2">
//                       Step 2: Set Your Offer
//                     </p>
//                     <div className="grid grid-cols-2 gap-2 mb-2">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setForm((prev) => ({
//                             ...prev,
//                             discountType: 'percent',
//                           }))
//                         }
//                         className={`rounded-lg py-2 text-xs font-medium border ${
//                           form.discountType === 'percent'
//                             ? 'bg-blue-600 border-blue-600 text-white'
//                             : 'bg-gray-50 border-gray-200 text-gray-600'
//                         }`}
//                       >
//                         Percentage (%)
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setForm((prev) => ({
//                             ...prev,
//                             discountType: 'amount',
//                           }))
//                         }
//                         className={`rounded-lg py-2 text-xs font-medium border ${
//                           form.discountType === 'amount'
//                             ? 'bg-blue-600 border-blue-600 text-white'
//                             : 'bg-gray-50 border-gray-200 text-gray-600'
//                         }`}
//                       >
//                         Flat Amount (₹)
//                       </button>
//                     </div>
//                     <div className="relative">
//                       <input
//                         type="number"
//                         min={1}
//                         max={
//                           form.discountType === 'amount'
//                             ? Math.max(1, formBase)
//                             : 100
//                         }
//                         value={form.discountPercent}
//                         onChange={(e) =>
//                           setForm((prev) => ({
//                             ...prev,
//                             discountPercent: e.target.value,
//                           }))
//                         }
//                         placeholder={
//                           form.discountType === 'amount' ? 'Amount' : 'Percent'
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                       />
//                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
//                         {form.discountType === 'amount' ? '₹' : '%'}
//                       </span>
//                     </div>
//                     <div className="mt-3 rounded-xl border border-emerald-200 bg-[#F0FDF4] p-3">
//                       <p className="text-xs font-semibold text-gray-800 mb-2">
//                         Live Calculator
//                       </p>
//                       <div className="text-xs text-gray-600 space-y-1.5">
//                         <div className="flex justify-between">
//                           <span>Discounted Price</span>
//                           <span className="font-medium text-gray-900">
//                             {rupee(formDiscounted)}
//                           </span>
//                         </div>
//                         {/* <div className="flex justify-between">
//                           <span>Platform Commission (12%)</span>
//                           <span className="font-medium text-rose-600">
//                             -{rupee(platformCommission)}
//                           </span>
//                         </div> */}
//                         {/* <div className="pt-1.5 mt-1 border-t border-emerald-200 flex justify-between">
//                           <span className="font-semibold text-gray-800">
//                             Vendor Final Payout:
//                           </span>
//                           <span className="font-semibold text-emerald-700">
//                             {rupee(vendorPayout)}
//                           </span>
//                         </div> */}
//                       </div>
//                     </div>
//                   </div>

//                   {/* <div>
//                     <p className="text-xs font-medium text-gray-700 mb-2">
//                       Step 3: Marketing Labels
//                     </p>
//                     <select
//                       value={form.sticker}
//                       onChange={(e) =>
//                         setForm((prev) => ({
//                           ...prev,
//                           sticker: e.target.value,
//                         }))
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     >
//                       {STICKERS.map((s) => (
//                         <option key={s || 'none'} value={s}>
//                           {s || 'None'}
//                         </option>
//                       ))}
//                     </select>
//                     <p className="mt-2 text-[11px] text-gray-400">
//                       Preview:{' '}
//                       <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100">
//                         {form.sticker || 'None'}
//                       </span>
//                     </p>
//                   </div> */}
//                   <div>
//                     <p className="text-xs font-medium text-gray-700 mb-2">
//                       Step 3: Marketing Labels
//                     </p>
//                     {formProduct?.productType === 'ServiceProduct' ? (
//                       <p className="text-[11px] text-gray-400 italic px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
//                         Not available for services
//                       </p>
//                     ) : (
//                       <>
//                         <select
//                           value={form.sticker}
//                           onChange={(e) =>
//                             setForm((prev) => ({
//                               ...prev,
//                               sticker: e.target.value,
//                             }))
//                           }
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                         >
//                           {STICKERS.map((s) => (
//                             <option key={s || 'none'} value={s}>
//                               {s || 'None'}
//                             </option>
//                           ))}
//                         </select>
//                         <p className="mt-2 text-[11px] text-gray-400">
//                           Preview:{' '}
//                           <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100">
//                             {form.sticker || 'None'}
//                           </span>
//                         </p>
//                       </>
//                     )}
//                   </div>

//                   {/* <div>
//                     <p className="text-xs font-medium text-gray-700 mb-2">
//                       Step 4: Duration
//                     </p>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div>
//                         <p className="text-[11px] text-gray-500 mb-1">
//                           Start Date
//                         </p>
//                         <input
//                           type="date"
//                           value={form.startDate}
//                           onChange={(e) =>
//                             setForm((prev) => ({
//                               ...prev,
//                               startDate: e.target.value,
//                             }))
//                           }
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                         />
//                       </div>
//                       <div>
//                         <p className="text-[11px] text-gray-500 mb-1">
//                           End Date
//                         </p>
//                         <input
//                           type="date"
//                           value={form.endDate}
//                           onChange={(e) =>
//                             setForm((prev) => ({
//                               ...prev,
//                               endDate: e.target.value,
//                             }))
//                           }
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                         />
//                       </div>
//                     </div>
//                   </div> */}

//                   <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
//                     <button
//                       onClick={closeModal}
//                       className="px-8 py-2 rounded-xl border border-gray-300 text-sm"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={submitOffer}
//                       disabled={savingId === form.productId}
//                       className="px-8 py-2 rounded-xl bg-blue-600 text-white text-sm disabled:opacity-60"
//                     >
//                       {savingId === form.productId
//                         ? 'Saving...'
//                         : modalMode === 'create'
//                           ? 'Publish Offer'
//                           : 'Update Offer'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : null}
//         </main>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import VendorSidebar from '../../Components/Common/VendorSidebar';
import VendorTopBar from '../../Components/Common/VendorTopBar';
import { useSelector } from 'react-redux';
import {
  apiDeleteVendorOffer,
  apiGetMyProducts,
  apiGetMyServiceProducts,
  apiGetVendorOffers,
  apiUpsertVendorOffer,
} from '@/service/api';
import { toast } from 'react-toastify';
import { Heart, Search, ShoppingCart, Trash2, Truck } from 'lucide-react';

const STICKERS = [
  '',
  'Limited Deal',
  'Festival Offer',
  'Hot Sale',
  'Clearance',
  'New Arrival',
];

const parsePrice = (raw) => {
  const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

// const tierRentAmount = (tier) => {
//   const n = (k) => {
//     const v = Number(String(tier?.[k] ?? '').replace(/,/g, ''));
//     return Number.isFinite(v) && v > 0 ? v : 0;
//   };
//   return n('customerRent') || n('pricePerDay') || n('vendorRent') || 0;
// };

const tierRentAmount = (tier) => {
  const n = (k) => {
    const v = Number(String(tier?.[k] ?? '').replace(/,/g, ''));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  // Vendor's own price is the base for offers/discounts on this page —
  // never the admin's customer-facing price.
  return n('vendorRent') || n('customerRent') || n('pricePerDay') || 0;
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
    // const topHasPrice = top.some(
    //   (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
    // );
    // let configs = top;
    // if (!topHasPrice) {
    //   const variants = Array.isArray(product?.variants) ? product.variants : [];
    //   const fromVariants = variants.flatMap((v) =>
    //     Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
    //   );
    //   if (fromVariants.length) configs = fromVariants;
    // }
    // const usable = configs.filter(
    //   (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
    // );
    const topHasPrice = top.some(
      (c) =>
        Number(c?.vendorRent || c?.customerRent || c?.pricePerDay || 0) > 0,
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
      (c) =>
        Number(c?.vendorRent || c?.customerRent || c?.pricePerDay || 0) > 0,
    );
    // const tier = usable.sort((a, b) => {
    //   const lenA =
    //     a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
    //   const lenB =
    //     b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
    //   return lenA - lenB;
    // })[0];
    const tier = usable.sort((a, b) => {
      const lenA =
        a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
      const lenB =
        b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
      return lenA - lenB;
    })[0];
    //   if (tier) {
    //   if (tier) {
    //     const isDay = tier.periodUnit === 'day';
    //     const len = isDay
    //       ? Number(tier.days) > 0
    //         ? Number(tier.days)
    //         : 1
    //       : Number(tier.months) > 0
    //         ? Number(tier.months)
    //         : 1;
    //     const totalAmt = tierRentAmount(tier);
    //     const perUnit = Math.round(totalAmt / len);
    //     return { amount: perUnit, suffix: isDay ? '/d' : '/mo' };
    //   }
    // }
    // const basePrice = parsePrice(product?.price);
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

const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatPercent = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return '0%';
  const rounded = Math.round(num * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
};

const toDateInputValue = (dateLike) => {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const resolveDiscountPercent = (basePrice, draft = {}, offer = {}) => {
  const safeDraft = draft || {};
  const safeOffer = offer || {};
  const mode = safeDraft.discountType || 'percent';
  const rawValue = safeDraft.discountPercent ?? safeOffer.discountPercent ?? '';
  const n = Number(rawValue || 0);
  if (!Number.isFinite(n) || n <= 0 || basePrice <= 0) return 0;
  if (mode === 'amount') {
    return Math.min(100, Math.max(0, (n / basePrice) * 100));
  }
  return Math.min(100, Math.max(0, n));
};
const getDeliveryEtaLabel = (product) => {
  const lv = product?.logisticsVerification || {};
  const n = Number(lv.deliveryTimelineValue);
  const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
  if (!Number.isFinite(n) || n <= 0) return 'Varies';
  if (unit === 'hours') return `${n} hour${n !== 1 ? 's' : ''}`;
  return `${n} day${n !== 1 ? 's' : ''}`;
};

export default function VendorOffersPage() {
  const pageSize = 10;
  const { user, token } = useSelector((s) => s.vendor);
  const [products, setProducts] = useState([]);
  const [offersByProduct, setOffersByProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState('');
  const [selectedPreviewProductId, setSelectedPreviewProductId] = useState('');
  const [draftByProduct, setDraftByProduct] = useState({});
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [form, setForm] = useState({
    productId: '',
    discountPercent: '',
    discountType: 'percent',
    sticker: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const authToken =
    token ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('vendorToken')
      : null);

  // const loadData = async () => {
  //   if (!authToken) return;
  //   setLoading(true);
  //   try {
  //     const [productsRes, offersRes] = await Promise.all([
  //       apiGetMyProducts(authToken),
  //       apiGetVendorOffers(authToken),
  //     ]);
  //     const prods = productsRes.data?.products || [];
  //     const offers = offersRes.data?.offers || [];
  //     const map = {};
  //     offers.forEach((o) => {
  //       map[String(o.productId?._id || o.productId)] = o;
  //     });
  //     const drafts = {};
  //     (prods || [])(
  //       // .filter((p) => p.type === 'Rental')

  //       // .forEach((p) => {
  //       //   const id = String(p._id);
  //       //   const offer = map[id] || {};
  //       //   drafts[id] = {
  //       //     discountPercent:
  //       //       offer.discountPercent != null
  //       //         ? String(offer.discountPercent)
  //       //         : '',
  //       //     discountType: 'percent',
  //       //     sticker: offer.sticker || '',
  //       //     isActive: offer.isActive ?? false,
  //       //   };
  //       // });
  //       prods || [],
  //     ).forEach((p) => {
  //       const id = String(p._id);
  //       const offer = map[id] || {};

  //       drafts[id] = {
  //         discountPercent:
  //           offer.discountPercent != null ? String(offer.discountPercent) : '',
  //         discountType: 'percent',
  //         sticker: offer.sticker || '',
  //         isActive: offer.isActive ?? false,
  //       };
  //     });
  //     setProducts(prods);
  //     setOffersByProduct(map);
  //     setDraftByProduct(drafts);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Failed to load offers data');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadData = async () => {
    if (!authToken) return;

    setLoading(true);

    try {
      const [productsRes, serviceProductsRes, offersRes] = await Promise.all([
        apiGetMyProducts(authToken),
        apiGetMyServiceProducts(authToken),
        apiGetVendorOffers(authToken),
      ]);

      const prods = productsRes.data?.products || [];
      const serviceProds = (serviceProductsRes.data?.products || []).map(
        (sp) => ({ ...sp, productType: 'ServiceProduct' }),
      );
      const allProds = [
        ...prods.map((p) => ({ ...p, productType: 'Product' })),
        ...serviceProds,
      ];
      const offers = offersRes.data?.offers || [];

      const map = {};

      offers.forEach((o) => {
        map[String(o.productId?._id || o.productId)] = o;
      });

      const drafts = {};

      (allProds || []).forEach((p) => {
        const id = String(p._id);
        const offer = map[id] || {};

        // drafts[id] = {
        //   discountPercent:
        //     offer.discountPercent != null ? String(offer.discountPercent) : '',
        //   discountType: 'percent',
        //   sticker: offer.sticker || '',
        //   isActive: offer.isActive ?? false,
        // };
        drafts[id] = {
          discountPercent:
            offer.discountPercent != null ? String(offer.discountPercent) : '',
          discountType: 'percent',
          sticker: offer.sticker || '',
          isActive: offer.isActive ?? true,
        };
      });

      setProducts(allProds);
      setOffersByProduct(map);
      setDraftByProduct(drafts);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load offers data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [authToken]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    // const base = products.filter((p) => p.type === 'Rental');
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

  // const rentalProducts = useMemo(
  //   () => products.filter((p) => p.type === 'Rental'),
  //   [products],
  // );
  const allProducts = useMemo(() => products, [products]);

  useEffect(() => {
    if (!rows.length) {
      setSelectedPreviewProductId('');
      return;
    }
    const exists = rows.some(
      (p) => String(p._id) === String(selectedPreviewProductId),
    );
    if (!exists) {
      setSelectedPreviewProductId(String(rows[0]._id));
    }
  }, [rows, selectedPreviewProductId]);

  const openCreateModal = () => {
    setModalMode('create');
    setForm({
      productId: '',
      discountPercent: '',
      discountType: 'percent',
      sticker: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (productId) => {
    const offer = offersByProduct[productId] || {};
    setModalMode('edit');
    setForm({
      productId,
      discountPercent: offer.discountPercent ?? '',
      discountType: 'percent',
      sticker: offer.sticker || '',
      startDate: toDateInputValue(offer.startDate),
      endDate: toDateInputValue(offer.endDate),
      isActive: offer.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const removeOffer = async (productId) => {
    const offer = offersByProduct[productId];
    if (!offer?._id) return;
    setSavingId(productId);
    try {
      await apiDeleteVendorOffer(offer._id, authToken);
      toast.success('Offer removed');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove offer');
    } finally {
      setSavingId('');
    }
  };

  const applyInlineOffer = async (productId) => {
    const product = rows.find((p) => String(p._id) === String(productId));
    const { amount: basePrice } = getBasePriceInfo(product);
    const draft = draftByProduct[productId] || {};
    const mode = draft.discountType || 'percent';
    const raw = Number(draft.discountPercent || 0);
    if (mode === 'amount') {
      if (!raw || raw <= 0) {
        toast.error('Discount amount must be greater than 0');
        return;
      }
      if (!basePrice || raw > basePrice) {
        toast.error('Discount amount cannot be more than product price');
        return;
      }
    } else if (!raw || raw < 1 || raw > 100) {
      toast.error('Discount percent must be between 1 and 100');
      return;
    }
    const discountPercent = resolveDiscountPercent(basePrice, draft, {});

    setSavingId(productId);
    try {
      // await apiUpsertVendorOffer(
      //   {
      //     productId,
      //     discountPercent,
      //     sticker: draft.sticker || '',
      //     isActive: draft.isActive ?? true,
      //   },
      //   authToken,
      // );
      const existingOffer = offersByProduct[productId] || {};
      await apiUpsertVendorOffer(
        {
          productId,
          productType: product?.productType || 'Product',
          discountPercent,
          sticker: draft.sticker || '',
          isActive: draft.isActive ?? true,
          startDate: existingOffer.startDate
            ? toDateInputValue(existingOffer.startDate)
            : null,
          endDate: existingOffer.endDate
            ? toDateInputValue(existingOffer.endDate)
            : null,
        },
        authToken,
      );
      toast.success('Offer applied');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSavingId('');
    }
  };

  const submitOffer = async () => {
    const productId = String(form.productId || '');
    // const selected = rentalProducts.find((p) => String(p._id) === productId);
    const selected = allProducts.find((p) => String(p._id) === productId);
    const { amount: basePrice } = getBasePriceInfo(selected);
    const raw = Number(form.discountPercent || 0);
    const discountPercent =
      form.discountType === 'amount'
        ? Math.min(100, Math.max(0, (raw / Math.max(1, basePrice)) * 100))
        : raw;
    if (!productId) {
      toast.error('Please select a product');
      return;
    }
    if (form.discountType === 'amount') {
      if (!raw || raw <= 0) {
        toast.error('Flat amount must be greater than 0');
        return;
      }
      if (!basePrice || raw > basePrice) {
        toast.error('Flat amount cannot exceed product price');
        return;
      }
    } else if (
      !discountPercent ||
      discountPercent < 1 ||
      discountPercent > 100
    ) {
      toast.error('Discount percent must be between 1 and 100');
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setSavingId(productId);
    try {
      await apiUpsertVendorOffer(
        {
          productId,
          productType: selected?.productType || 'Product',
          discountPercent,
          sticker: form.sticker || '',
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          isActive: form.isActive,
        },
        authToken,
      );
      toast.success(modalMode === 'create' ? 'Offer created' : 'Offer updated');
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSavingId('');
    }
  };

  const preview =
    rows.find((p) => String(p._id) === String(selectedPreviewProductId)) ||
    null;
  const previewOffer = preview ? offersByProduct[String(preview._id)] : null;
  const previewDraft = preview ? draftByProduct[String(preview._id)] : null;
  const { amount: previewBase } = getBasePriceInfo(preview);
  const previewDiscount = resolveDiscountPercent(
    previewBase,
    previewDraft,
    previewOffer,
  );
  const previewSticker = previewDraft?.sticker || previewOffer?.sticker || '';
  const previewActive = preview
    ? (previewDraft?.isActive ?? previewOffer?.isActive ?? false)
    : false;
  const previewDeliveryEta = getDeliveryEtaLabel(preview);
  const previewFinal = Math.max(
    0,
    Math.round(previewBase - (previewBase * previewDiscount) / 100),
  );
  // const formProduct = rentalProducts.find(
  //   (p) => String(p._id) === String(form.productId),
  // );
  const formProduct = allProducts.find(
    (p) => String(p._id) === String(form.productId),
  );
  const { amount: formBase } = getBasePriceInfo(formProduct);
  const formRaw = Number(form.discountPercent || 0);
  const formDiscountPercent =
    form.discountType === 'amount'
      ? Math.min(100, Math.max(0, (formRaw / Math.max(1, formBase)) * 100))
      : Math.min(100, Math.max(0, formRaw));
  const formDiscountAmount = Math.round((formBase * formDiscountPercent) / 100);
  const formDiscounted = Math.max(0, formBase - formDiscountAmount);
  const platformCommission = Math.round(formDiscounted * 0.12);
  const vendorPayout = Math.max(0, formDiscounted - platformCommission);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <VendorSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <VendorTopBar user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f3f5f9]">
          {/* <div className="flex items-start justify-between gap-3 mb-5">
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700"
            >
              + Create New Offer
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products or offers..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div> */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products or offers..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700 w-full sm:w-auto shrink-0"
                  >
                    + Create New Offer
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-14">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-[980px] w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
                            Product Details
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
                            Original Price
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
                            Discount
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
                            Sticker
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
                            Final Price
                          </th>
                          <th className="px-3 py-3 text-left text-[11px] uppercase tracking-wide font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedRows.map((p) => {
                          const id = String(p._id);
                          const { amount: base, suffix: baseSuffix } =
                            getBasePriceInfo(p);
                          const offer = offersByProduct[id] || {};
                          const draft = draftByProduct[id] || {};
                          const discountPercent = resolveDiscountPercent(
                            base,
                            draft,
                            offer,
                          );
                          const final = Math.max(
                            0,
                            Math.round(base - (base * discountPercent) / 100),
                          );
                          const start = toDateInputValue(offer.startDate);
                          const end = toDateInputValue(offer.endDate);
                          return (
                            <tr
                              key={id}
                              onClick={() => setSelectedPreviewProductId(id)}
                              className={`border-t border-gray-100 cursor-pointer transition ${
                                String(selectedPreviewProductId) === id
                                  ? 'bg-orange-50'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.image}
                                    alt=""
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {p.productName}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
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
                                        aria-label="Toggle offer active state"
                                      >
                                        <span
                                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                            (draft.isActive ?? offer.isActive)
                                              ? 'translate-x-3.5'
                                              : 'translate-x-0.5'
                                          }`}
                                        />
                                      </button>
                                      <p className="text-[11px] text-gray-500">
                                        {draft.sticker ||
                                          offer.sticker ||
                                          p.category}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                {rupee(base)}
                                {baseSuffix ? (
                                  <span className="text-gray-400">
                                    {baseSuffix}
                                  </span>
                                ) : null}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDraftByProduct((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...(prev[id] || {}),
                                          discountType: 'percent',
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDraftByProduct((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...(prev[id] || {}),
                                          discountType: 'amount',
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
                                  <input
                                    type="number"
                                    min={1}
                                    max={
                                      draft.discountType === 'amount'
                                        ? Math.max(1, base)
                                        : 100
                                    }
                                    value={draft.discountPercent ?? ''}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                      setDraftByProduct((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...(prev[id] || {}),
                                          discountPercent: e.target.value,
                                        },
                                      }))
                                    }
                                    placeholder={
                                      draft.discountType === 'amount'
                                        ? '₹ amount'
                                        : '% off'
                                    }
                                    className="w-16 px-2 py-1.5 border border-gray-200 rounded text-xs"
                                  />
                                </div>
                              </td>
                              {/* <td className="px-3 py-3">
                                <select
                                  value={draft.sticker ?? ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    setDraftByProduct((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...(prev[id] || {}),
                                        sticker: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-24 px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white"
                                >
                                  {STICKERS.map((s) => (
                                    <option key={s || 'none'} value={s}>
                                      {s || 'None'}
                                    </option>
                                  ))}
                                </select>
                              </td> */}
                              <td className="px-3 py-3">
                                {p.productType === 'ServiceProduct' ? (
                                  <span className="text-[11px] text-gray-400 italic">
                                    None
                                  </span>
                                ) : (
                                  <select
                                    value={draft.sticker ?? ''}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                      setDraftByProduct((prev) => ({
                                        ...prev,
                                        [id]: {
                                          ...(prev[id] || {}),
                                          sticker: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-24 px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white"
                                  >
                                    {STICKERS.map((s) => (
                                      <option key={s || 'none'} value={s}>
                                        {s || 'None'}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="px-3 py-3 text-emerald-600 font-semibold">
                                {discountPercent ? rupee(final) : '-'}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col gap-1">
                                  {/* <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applyInlineOffer(id);
                                    }}
                                    disabled={savingId === id}
                                    className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-60"
                                  >
                                    {savingId === id ? 'Saving...' : 'Apply'}
                                  </button> */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applyInlineOffer(id);
                                    }}
                                    disabled={savingId === id}
                                    className={`px-3 py-1 rounded-lg text-white text-xs disabled:opacity-60 ${
                                      offer?._id
                                        ? 'bg-emerald-600'
                                        : 'bg-blue-600'
                                    }`}
                                  >
                                    {savingId === id
                                      ? 'Saving...'
                                      : offer?._id
                                        ? 'Applied'
                                        : 'Apply'}
                                  </button>
                                  {offer?._id ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeOffer(id);
                                      }}
                                      disabled={savingId === id}
                                      className="inline-flex items-center gap-1 text-red-600 text-xs font-medium disabled:opacity-50"
                                      aria-label="Delete offer"
                                      title="Delete offer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Remove{' '}
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
                              colSpan={6}
                              className="px-4 py-10 text-center text-gray-500"
                            >
                              No products found.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 0 ? (
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
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="space-y-4">
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
                          className="w-full h-52 object-cover"
                        />
                        {previewActive && previewSticker ? (
                          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-orange-500 text-white text-[10px] font-medium px-2 py-0.5">
                            {previewSticker}
                          </span>
                        ) : null}
                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 text-blue-700 text-[10px] font-medium px-2 py-0.5">
                          <Truck className="w-3 h-3" />
                          {previewDeliveryEta}
                        </span>
                        <button
                          type="button"
                          className="absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-500 border border-gray-200"
                          aria-label="Wishlist"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[22px] leading-none font-semibold text-gray-900">
                            LG
                          </p>
                          <span className="inline-flex items-center rounded-full bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5">
                            4.3 ★
                          </span>
                        </div>
                        <p className="mt-1 text-base font-medium text-gray-900 line-clamp-1">
                          {preview.productName}
                        </p>
                        <span className="mt-2 inline-flex rounded-full border border-gray-200 text-[10px] text-gray-500 px-2 py-0.5">
                          {preview.condition || 'Refurbished'}
                        </span>
                        <div className="mt-3 flex items-end justify-between gap-2">
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
                          <span className="inline-flex rounded-full border border-gray-200 text-[10px] text-gray-500 px-2 py-0.5 mb-1">
                            {previewDiscount
                              ? `${formatPercent(previewDiscount)} Off`
                              : 'No offer'}
                          </span>
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
                    {previewDiscount ? rupee(previewBase - previewFinal) : '₹0'}
                  </span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span>Customer Saves:</span>
                  <span className="font-medium text-emerald-700">
                    {formatPercent(previewDiscount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
              <div className="w-full max-w-xl max-h-[86vh] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {modalMode === 'create'
                        ? 'Create New Offer'
                        : 'Update Offer'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Create a promotional offer for your products
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-sm text-gray-500 hover:text-gray-700 h-8 w-8 rounded-lg border border-gray-200"
                  >
                    ×
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Step 1: Select Product
                    </p>
                    {/* <select
                      value={form.productId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          productId: e.target.value,
                        }))
                      }
                      disabled={modalMode === 'edit'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                    >
                      <option value="">Select a product</option> */}
                    <select
                      value={form.productId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        const selectedProduct = allProducts.find(
                          (p) => String(p._id) === String(newId),
                        );
                        setForm((prev) => ({
                          ...prev,
                          productId: newId,
                          sticker:
                            selectedProduct?.productType === 'ServiceProduct'
                              ? ''
                              : prev.sticker,
                        }));
                      }}
                      disabled={modalMode === 'edit'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                    >
                      <option value="">Select a product</option>
                      {allProducts.map((p) => {
                        const typeLabel =
                          p.productType === 'ServiceProduct'
                            ? 'Service'
                            : p.type === 'Rental'
                              ? 'Rent'
                              : 'Sell';
                        return (
                          <option key={p._id} value={p._id}>
                            {p.productName} ({typeLabel})
                          </option>
                        );
                      })}
                    </select>
                    {formProduct ? (
                      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 flex items-center gap-3">
                        <img
                          src={formProduct.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formProduct.productName}
                          </p>
                          <p className="text-xs text-blue-700">
                            {rupee(formBase)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Step 2: Set Your Offer
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            discountType: 'percent',
                          }))
                        }
                        className={`rounded-lg py-2 text-xs font-medium border ${
                          form.discountType === 'percent'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            discountType: 'amount',
                          }))
                        }
                        className={`rounded-lg py-2 text-xs font-medium border ${
                          form.discountType === 'amount'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        Flat Amount (₹)
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={
                          form.discountType === 'amount'
                            ? Math.max(1, formBase)
                            : 100
                        }
                        value={form.discountPercent}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            discountPercent: e.target.value,
                          }))
                        }
                        placeholder={
                          form.discountType === 'amount' ? 'Amount' : 'Percent'
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        {form.discountType === 'amount' ? '₹' : '%'}
                      </span>
                    </div>
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-[#F0FDF4] p-3">
                      <p className="text-xs font-semibold text-gray-800 mb-2">
                        Live Calculator
                      </p>
                      <div className="text-xs text-gray-600 space-y-1.5">
                        <div className="flex justify-between">
                          <span>Discounted Price</span>
                          <span className="font-medium text-gray-900">
                            {rupee(formDiscounted)}
                          </span>
                        </div>
                        {/* <div className="flex justify-between">
                          <span>Platform Commission (12%)</span>
                          <span className="font-medium text-rose-600">
                            -{rupee(platformCommission)}
                          </span>
                        </div> */}
                        {/* <div className="pt-1.5 mt-1 border-t border-emerald-200 flex justify-between">
                          <span className="font-semibold text-gray-800">
                            Vendor Final Payout:
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {rupee(vendorPayout)}
                          </span>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  {/* <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Step 3: Marketing Labels
                    </p>
                    <select
                      value={form.sticker}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          sticker: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {STICKERS.map((s) => (
                        <option key={s || 'none'} value={s}>
                          {s || 'None'}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-[11px] text-gray-400">
                      Preview:{' '}
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100">
                        {form.sticker || 'None'}
                      </span>
                    </p>
                  </div> */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Step 3: Marketing Labels
                    </p>
                    {formProduct?.productType === 'ServiceProduct' ? (
                      <p className="text-[11px] text-gray-400 italic px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                        Not available for services
                      </p>
                    ) : (
                      <>
                        <select
                          value={form.sticker}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              sticker: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {STICKERS.map((s) => (
                            <option key={s || 'none'} value={s}>
                              {s || 'None'}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-[11px] text-gray-400">
                          Preview:{' '}
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100">
                            {form.sticker || 'None'}
                          </span>
                        </p>
                      </>
                    )}
                  </div>

                  {/* <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Step 4: Duration
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">
                          Start Date
                        </p>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">
                          End Date
                        </p>
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div> */}

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={closeModal}
                      className="px-8 py-2 rounded-xl border border-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitOffer}
                      disabled={savingId === form.productId}
                      className="px-8 py-2 rounded-xl bg-blue-600 text-white text-sm disabled:opacity-60"
                    >
                      {savingId === form.productId
                        ? 'Saving...'
                        : modalMode === 'create'
                          ? 'Publish Offer'
                          : 'Update Offer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
