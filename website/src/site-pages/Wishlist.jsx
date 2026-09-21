// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { useDispatch } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import {
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Star,
//   Truck,
//   Package,
// } from 'lucide-react';
// import {
//   apiGetMyWishlist,
//   apiToggleWishlist,
//   apiGetPublicActiveOffers,
//   apiRequestStockNotify,
// } from '@/lib/api';
// import {
//   getRentalListingAmount,
//   getRentalListingSuffix,
//   getProductDeliveryEtaLabel,
// } from '@/lib/rentalPriceDisplay';
// import { addToCart } from '@/store/slices/cartSlice';
// import { useToast } from '@/contexts/ToastContext';

// const formatPercent = (n) => {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num) || num <= 0) return '0%';
//   const rounded = Math.round(num * 10) / 10;
//   return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
// };

// const formatPrice = (n) => {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num)) return '0';
//   return num.toLocaleString('en-IN');
// };

// export default function Wishlist() {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [busyId, setBusyId] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');
//   const [offersByProduct, setOffersByProduct] = useState({});
//   const [notifyingIds, setNotifyingIds] = useState(new Set());
//   const [notifiedIds, setNotifiedIds] = useState(() => {
//     if (typeof window === 'undefined') return new Set();
//     try {
//       const raw = localStorage.getItem('rn_notified_product_ids');
//       const arr = JSON.parse(raw || '[]');
//       return new Set(Array.isArray(arr) ? arr : []);
//     } catch {
//       return new Set();
//     }
//   });

//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { pushToast } = useToast();

//   const ITEMS_PER_PAGE = 12;

//   const handleNotifyMe = async (e, productId) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const pid = String(productId);

//     if (notifiedIds.has(pid)) {
//       pushToast("You're already on the waitlist for this product.", 'info');
//       return;
//     }

//     setNotifyingIds((prev) => new Set(prev).add(pid));

//     try {
//       const res = await apiRequestStockNotify(productId);
//       setNotifiedIds((prev) => {
//         const next = new Set(prev).add(pid);
//         try {
//           localStorage.setItem(
//             'rn_notified_product_ids',
//             JSON.stringify([...next]),
//           );
//         } catch {}
//         return next;
//       });

//       if (res.data?.alreadyRequested) {
//         pushToast("You're already on the waitlist for this product.", 'info');
//       } else {
//         pushToast(
//           'We will notify you when this product is back in stock!',
//           'success',
//         );
//       }
//     } catch {
//       pushToast('Something went wrong. Please try again.', 'error');
//     } finally {
//       setNotifyingIds((prev) => {
//         const next = new Set(prev);
//         next.delete(pid);
//         return next;
//       });
//     }
//   };

//   const getProductType = (type) => String(type || '').toLowerCase();

//   const loadWishlist = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const res = await apiGetMyWishlist();
//       setItems(Array.isArray(res.data?.items) ? res.data.items : []);
//     } catch (err) {
//       setItems([]);
//       setError(err?.response?.data?.message || 'Failed to load wishlist.');
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     loadWishlist();

//     apiGetPublicActiveOffers()
//       .then((oRes) => {
//         const map = {};
//         (oRes.data?.offers || []).forEach((o) => {
//           const pid = String(o.productId?._id || o.productId);
//           map[pid] = o;
//         });
//         setOffersByProduct(map);
//       })
//       .catch(() => setOffersByProduct({}));
//   }, []);

//   const total = useMemo(() => items.length, [items]);

//   const filteredItems = useMemo(() => {
//     return items.filter((item) => {
//       const matchesSearch =
//         item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.category?.toLowerCase().includes(searchTerm.toLowerCase());

//       const type = getProductType(item.type);

//       const matchesType =
//         filterType === 'all' ||
//         (filterType === 'buy' && type === 'sell') ||
//         (filterType === 'rent' && type === 'rental');

//       return matchesSearch && matchesType;
//     });
//   }, [items, searchTerm, filterType]);

//   const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

//   const paginatedItems = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     const end = start + ITEMS_PER_PAGE;
//     return filteredItems.slice(start, end);
//   }, [filteredItems, currentPage]);

//   const removeFromWishlist = async (productId) => {
//     setBusyId(String(productId));

//     try {
//       await apiToggleWishlist(productId);

//       const updated = items.filter((p) => String(p._id) !== String(productId));

//       setItems(updated);

//       const newTotalPages = Math.ceil(updated.length / ITEMS_PER_PAGE);

//       if (currentPage > newTotalPages && newTotalPages > 0) {
//         setCurrentPage(newTotalPages);
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Could not update wishlist.');
//     } finally {
//       setBusyId('');
//     }
//   };

//   const buyCount = items.filter(
//     (item) => getProductType(item.type) === 'sell',
//   ).length;

//   const rentCount = items.filter(
//     (item) => getProductType(item.type) === 'rental',
//   ).length;

//   return (
//     <div className="w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
//       <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
//         <div>
//           <h1 className="text-2xl font-bold text-black">My Wishlist</h1>

//           <p className="text-sm text-gray-500 mt-1">
//             Save products you love and come back anytime.
//           </p>

//           <div className="mt-4 relative w-full sm:w-80">
//             <Search
//               size={16}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             />

//             <input
//               type="text"
//               placeholder="Search wishlist products..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
//             />
//           </div>
//         </div>

//         <select
//           value={filterType}
//           onChange={(e) => {
//             setFilterType(e.target.value);
//             setCurrentPage(1);
//           }}
//           className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
//         >
//           <option value="all">All ({total})</option>
//           <option value="buy">Buy ({buyCount})</option>
//           <option value="rent">Rent ({rentCount})</option>
//         </select>
//       </div>

//       {loading ? (
//         <div className="flex justify-center py-10">
//           <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       ) : items.length === 0 ? (
//         <div className=" p-10 text-center">
//           <p className="text-sm text-gray-500 font-medium mt-1">
//             No wishlist products yet.
//           </p>

//           <Link
//             href="/products"
//             className="inline-block mt-2 text-sm text-orange-500 font-medium hover:underline"
//           >
//             Browse products
//           </Link>
//         </div>
//       ) : filteredItems.length === 0 ? (
//         <div className=" p-12 text-center">
//           <p className="text-sm font-medium text-gray-500 ">
//             No matching wishlist products found.
//           </p>

//           <p
//             onClick={() => {
//               setSearchTerm('');
//               setFilterType('all');
//             }}
//             className="mt-3 text-sm text-orange-500 font-medium cursor-pointer hover:underline"
//           >
//             Clear search
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="flex overflow-x-auto sm:overflow-visible gap-1.5 sm:gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
//             {paginatedItems.map((item) => {
//               const isRentalItem = getProductType(item.type) === 'rental';
//               const isSellProduct = getProductType(item.type) === 'sell';
//               const detailsHref = isSellProduct
//                 ? `/buy-product-details/${item._id}`
//                 : `/rent-product-details/${item._id}`;

//               const offer = offersByProduct[String(item._id)];
//               const rawBase = getRentalListingAmount(item);
//               const effectiveRawBase =
//                 isSellProduct && (!rawBase || rawBase <= 0)
//                   ? (() => {
//                       const variants = Array.isArray(item.variants)
//                         ? item.variants
//                         : [];
//                       const firstWithPrice = variants.find(
//                         (v) => Number(v?.sellPrice) > 0,
//                       );
//                       return firstWithPrice
//                         ? Number(firstWithPrice.sellPrice)
//                         : rawBase;
//                     })()
//                   : rawBase;

//               const allConfigsForCard = [
//                 ...(Array.isArray(item.rentalConfigurations)
//                   ? item.rentalConfigurations
//                   : []),
//                 ...(Array.isArray(item.variants)
//                   ? item.variants.flatMap((v) =>
//                       Array.isArray(v?.rentalConfigurations)
//                         ? v.rentalConfigurations
//                         : [],
//                     )
//                   : []),
//               ];
//               const lowestConfig = allConfigsForCard
//                 .filter(
//                   (cfg) =>
//                     Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
//                 )
//                 .sort((a, b) => {
//                   const perUnitA =
//                     a.periodUnit === 'day' && Number(a.days) > 0
//                       ? Number(a.customerRent || a.pricePerDay) / Number(a.days)
//                       : Number(a.customerRent || a.pricePerDay);
//                   const perUnitB =
//                     b.periodUnit === 'day' && Number(b.days) > 0
//                       ? Number(b.customerRent || b.pricePerDay) / Number(b.days)
//                       : Number(b.customerRent || b.pricePerDay);
//                   return perUnitA - perUnitB;
//                 })[0];
//               const base = lowestConfig
//                 ? lowestConfig.periodUnit === 'day' &&
//                   Number(lowestConfig.days) > 0
//                   ? Math.round(
//                       Number(
//                         lowestConfig.customerRent || lowestConfig.pricePerDay,
//                       ) / Number(lowestConfig.days),
//                     )
//                   : Math.round(
//                       Number(
//                         lowestConfig.customerRent || lowestConfig.pricePerDay,
//                       ),
//                     )
//                 : effectiveRawBase;
//               const priceSuffix = isRentalItem
//                 ? lowestConfig?.periodUnit === 'day'
//                   ? '/day'
//                   : '/month'
//                 : '';
//               const discount = Number(offer?.discountPercent || 0);
//               const finalPrice = Math.max(
//                 0,
//                 Math.round(base - (base * discount) / 100),
//               );
//               const hasOffer = !!offer && discount > 0;
//               const tag = offer?.sticker || '';
//               const statusType = item.stock > 0 ? 'delivery' : 'pickup';
//               const deliveryEta = getProductDeliveryEtaLabel(item);
//               const status =
//                 item.stock > 0 ? deliveryEta || 'Varies' : 'Out of Stock';
//               const rating = Number(item.averageRating || 0).toFixed(1);
//               const hasRating = Number(item.numReviews || 0) > 0;

//               return (
//                 <Link
//                   href={detailsHref}
//                   key={item._id}
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block w-[52%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
//                 >
//                   <div className="relative pt-1 px-1 overflow-hidden">
//                     {tag && (
//                       <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                         {tag}
//                       </span>
//                     )}

//                     <img
//                       src={
//                         item.image ||
//                         item.images?.[0] ||
//                         'https://placehold.co/600x400/e5e7eb/6b7280?text=IMG'
//                       }
//                       alt={item.productName}
//                       className="w-full aspect-square object-cover rounded-xl"
//                     />

//                     <div className="absolute bottom-3 left-3">
//                       {statusType === 'delivery' ? (
//                         <span className="flex items-center gap-1 text-[11px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
//                           <Truck size={12} />
//                           {status}
//                         </span>
//                       ) : (
//                         <span className="flex items-center gap-1 text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
//                           <Package size={12} />
//                           {status}
//                         </span>
//                       )}
//                     </div>

//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         removeFromWishlist(item._id);
//                       }}
//                       disabled={busyId === String(item._id)}
//                       className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
//                     >
//                       <Heart size={16} className="text-red-500 fill-red-500" />
//                     </button>

//                     {hasRating && (
//                       <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 text-white text-[9px] sm:text-[11px] bg-[#F97316] px-1.5 sm:px-2 py-0.5 rounded-full">
//                         <Star size={10} className="sm:hidden" fill="white" />
//                         <Star
//                           size={12}
//                           className="hidden sm:block"
//                           fill="white"
//                         />
//                         {rating}
//                       </div>
//                     )}
//                   </div>

//                   <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
//                     <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0">
//                       <h3 className="text-sm sm:text-xl font-bold truncate">
//                         {item.productName}
//                       </h3>
//                       <span className="inline-block text-[9px] sm:text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
//                         {item.condition?.trim() ||
//                           (isRentalItem ? 'For Rent' : 'Brand New')}
//                       </span>
//                     </div>

//                     <div className="flex items-end justify-between gap-1 sm:gap-2 mb-0 sm:mb-0.5">
//                       <div>
//                         <span className="font-bold text-sm sm:text-xl leading-none">
//                           ₹{formatPrice(hasOffer ? finalPrice : base)}
//                         </span>
//                         <span className="text-xs sm:text-base font-bold">
//                           {priceSuffix}
//                         </span>
//                         {hasOffer ? (
//                           <span className="ml-2 text-gray-400 text-xs line-through">
//                             ₹{formatPrice(base)}
//                           </span>
//                         ) : null}
//                       </div>
//                       {hasOffer ? (
//                         <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap self-end">
//                           {formatPercent(discount)} Off
//                         </span>
//                       ) : null}
//                     </div>

//                     {(() => {
//                       const isDaily =
//                         item.rentalConfigurations?.some(
//                           (cfg) => cfg?.periodUnit === 'day',
//                         ) ||
//                         (Array.isArray(item.variants) &&
//                           item.variants.some((v) =>
//                             Array.isArray(v?.rentalConfigurations)
//                               ? v.rentalConfigurations.some(
//                                   (cfg) => cfg?.periodUnit === 'day',
//                                 )
//                               : false,
//                           ));

//                       if (item.stock <= 0) {
//                         return (
//                           <div className="flex gap-2">
//                             <Link
//                               href={detailsHref}
//                               className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
//                             >
//                               Details
//                             </Link>
//                             <button
//                               type="button"
//                               onClick={(e) => handleNotifyMe(e, item._id)}
//                               disabled={notifyingIds.has(String(item._id))}
//                               className={`flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition
//     ${
//       notifiedIds.has(String(item._id))
//         ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-default'
//         : 'border-orange-300 text-orange-500  hover:bg-orange-50 disabled:opacity-60 disabled:cursor-not-allowed'
//     }`}
//                             >
//                               {notifyingIds.has(String(item._id))
//                                 ? '...'
//                                 : notifiedIds.has(String(item._id))
//                                   ? 'Waitlisted'
//                                   : 'Notify Me'}
//                             </button>
//                           </div>
//                         );
//                       }

//                       if (isDaily) {
//                         return (
//                           <Link
//                             href={detailsHref}
//                             className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
//                           >
//                             {isSellProduct ? 'Buy Now' : 'View'}
//                           </Link>
//                         );
//                       }

//                       const isSell = isSellProduct;

//                       const candidateGroups = [
//                         Array.isArray(item.rentalConfigurations)
//                           ? item.rentalConfigurations
//                           : [],
//                         ...(Array.isArray(item.variants)
//                           ? item.variants.map((v) =>
//                               Array.isArray(v?.rentalConfigurations)
//                                 ? v.rentalConfigurations
//                                 : [],
//                             )
//                           : []),
//                       ].filter((group) => group.length > 0);

//                       let lowestPlan = null;
//                       let lowestPlanGroup = [];
//                       candidateGroups.forEach((group) => {
//                         const groupLowest = group
//                           .map((cfg) => ({
//                             price: Number(
//                               cfg?.customerRent || cfg?.pricePerDay || 0,
//                             ),
//                             months: Number(cfg?.months) || 1,
//                             periodUnit:
//                               cfg?.periodUnit === 'day' ? 'day' : 'month',
//                             rawDays: Number(cfg?.days) || 0,
//                           }))
//                           .filter((p) => p.price > 0)
//                           .sort((a, b) => {
//                             const perUnitA =
//                               a.periodUnit === 'day' && a.rawDays > 0
//                                 ? a.price / a.rawDays
//                                 : a.price;
//                             const perUnitB =
//                               b.periodUnit === 'day' && b.rawDays > 0
//                                 ? b.price / b.rawDays
//                                 : b.price;
//                             return perUnitA - perUnitB;
//                           })[0];
//                         if (!groupLowest) return;
//                         const currentPerUnit =
//                           groupLowest.periodUnit === 'day' &&
//                           groupLowest.rawDays > 0
//                             ? groupLowest.price / groupLowest.rawDays
//                             : groupLowest.price;
//                         const bestPerUnit = lowestPlan
//                           ? lowestPlan.periodUnit === 'day' &&
//                             lowestPlan.rawDays > 0
//                             ? lowestPlan.price / lowestPlan.rawDays
//                             : lowestPlan.price
//                           : Infinity;
//                         if (currentPerUnit < bestPerUnit) {
//                           lowestPlan = groupLowest;
//                           lowestPlanGroup = group;
//                         }
//                       });

//                       const rentalConfigs = lowestPlanGroup;

//                       const sellBasePrice = (() => {
//                         if (item?.salesConfiguration?.salePrice != null) {
//                           const n = Number(item.salesConfiguration.salePrice);
//                           if (Number.isFinite(n) && n > 0) return n;
//                         }
//                         const s = String(item?.price || '')
//                           .replace(/[^\d.]/g, '')
//                           .trim();
//                         const n = Number(s);
//                         if (Number.isFinite(n) && n > 0) return n;
//                         const variants = Array.isArray(item.variants)
//                           ? item.variants
//                           : [];
//                         const firstWithPrice = variants.find(
//                           (v) => Number(v?.sellPrice) > 0,
//                         );
//                         return firstWithPrice
//                           ? Number(firstWithPrice.sellPrice)
//                           : 0;
//                       })();

//                       const cartPrice = isSell
//                         ? sellBasePrice || getRentalListingAmount(item)
//                         : lowestPlan
//                           ? lowestPlan.price
//                           : getRentalListingAmount(item);
//                       const cartMonths = lowestPlan?.months || 1;
//                       const cartTenureUnit = lowestPlan?.periodUnit || 'month';

//                       const finalCartPrice =
//                         discount > 0
//                           ? Math.max(
//                               0,
//                               Math.round(
//                                 cartPrice - (cartPrice * discount) / 100,
//                               ),
//                             )
//                           : cartPrice;

//                       return (
//                         <div className="flex gap-2">
//                           <Link
//                             href={detailsHref}
//                             className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
//                           >
//                             View
//                           </Link>
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               dispatch(
//                                 addToCart(
//                                   isSell
//                                     ? {
//                                         productId: item._id,
//                                         variantId: null,
//                                         variantName: '',
//                                         quantity: 1,
//                                         rentalMonths: 1,
//                                         pricePerDay: finalCartPrice,
//                                         title: item.productName || '',
//                                         image:
//                                           item.image || item.images?.[0] || '',
//                                         tenureUnit: 'month',
//                                         productType: 'Sell',
//                                         refundableDeposit: 0,
//                                         condition:
//                                           item?.condition || 'Brand New',
//                                         rentalConfigurations: [],
//                                       }
//                                     : {
//                                         productId: item._id,
//                                         variantId: null,
//                                         variantName: '',
//                                         quantity: 1,
//                                         rentalMonths: cartMonths,
//                                         pricePerDay: finalCartPrice,
//                                         title: item.productName || '',
//                                         image:
//                                           item.image || item.images?.[0] || '',
//                                         tenureUnit: cartTenureUnit,
//                                         refundableDeposit: Number(
//                                           item.refundableDeposit || 0,
//                                         ),
//                                         rentalConfigurations:
//                                           rentalConfigs.length
//                                             ? rentalConfigs
//                                             : item.rentalConfigurations || [],
//                                         offer: offer || null,
//                                         defaultGst:
//                                           item?.subCategoryTax?.defaultGst ??
//                                           null,
//                                         defaultCareTax:
//                                           item?.subCategoryTax
//                                             ?.defaultCareTax ?? null,
//                                         defaultRepairWarranty:
//                                           item?.subCategoryTax
//                                             ?.defaultRepairWarranty ?? null,
//                                         defaultRelocationWarranty:
//                                           item?.subCategoryTax
//                                             ?.defaultRelocationWarranty ?? null,
//                                         defaultDeliveryPackaging:
//                                           item?.subCategoryTax
//                                             ?.defaultDeliveryPackaging ?? null,
//                                         defaultInstallationFee:
//                                           item?.subCategoryTax
//                                             ?.defaultInstallationFee ?? null,
//                                         defaultPlatformFee:
//                                           item?.subCategoryTax
//                                             ?.defaultPlatformFee ?? null,
//                                         taxBlocked:
//                                           item?.subCategoryTax?.taxBlocked ??
//                                           false,
//                                       },
//                                 ),
//                               );
//                             }}
//                             className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 transition"
//                           >
//                             Cart
//                           </button>
//                         </div>
//                       );
//                     })()}
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>

//           {totalPages > 1 && (
//             <div className="flex justify-center items-center gap-4 mt-10">
//               <button
//                 onClick={() => setCurrentPage((prev) => prev - 1)}
//                 disabled={currentPage === 1}
//                 className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
//               >
//                 <ChevronLeft size={20} />
//               </button>

//               <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
//                 {currentPage}
//               </div>

//               <button
//                 onClick={() => setCurrentPage((prev) => prev + 1)}
//                 disabled={currentPage === totalPages}
//                 className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  Truck,
  Package,
} from 'lucide-react';
import {
  apiGetMyWishlist,
  apiToggleWishlist,
  apiGetPublicActiveOffers,
  apiRequestStockNotify,
  apiGetActiveBoosts,
} from '@/lib/api';
import {
  getRentalListingAmount,
  getRentalListingSuffix,
  getProductDeliveryEtaLabel,
} from '@/lib/rentalPriceDisplay';
import { addToCart } from '@/store/slices/cartSlice';
import { useToast } from '@/contexts/ToastContext';

const formatPercent = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return '0%';
  const rounded = Math.round(num * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
};

const formatPrice = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('en-IN');
};

const PLATFORM_FEE_PERCENT = 15;
// Admin offers store a % of the platform fee removed; convert that into a
// plain % of product price so it can be used exactly like a vendor offer's
// discountPercent everywhere below.
const resolveDiscountPercent = (offer) => {
  if (!offer) return 0;
  if (offer.source === 'admin') {
    return Math.min(
      PLATFORM_FEE_PERCENT,
      Number(offer.platformFeeReductionPercent || 0),
    );
  }
  return Number(offer.discountPercent || 0);
};

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [offersByProduct, setOffersByProduct] = useState({});
  const [boostedProductIds, setBoostedProductIds] = useState([]);
  const [notifyingIds, setNotifyingIds] = useState(new Set());
  const [notifiedIds, setNotifiedIds] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('rn_notified_product_ids');
      const arr = JSON.parse(raw || '[]');
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const { pushToast } = useToast();

  const ITEMS_PER_PAGE = 12;

  const handleNotifyMe = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const pid = String(productId);

    if (notifiedIds.has(pid)) {
      pushToast("You're already on the waitlist for this product.", 'info');
      return;
    }

    setNotifyingIds((prev) => new Set(prev).add(pid));

    try {
      const res = await apiRequestStockNotify(productId);
      setNotifiedIds((prev) => {
        const next = new Set(prev).add(pid);
        try {
          localStorage.setItem(
            'rn_notified_product_ids',
            JSON.stringify([...next]),
          );
        } catch {}
        return next;
      });

      if (res.data?.alreadyRequested) {
        pushToast("You're already on the waitlist for this product.", 'info');
      } else {
        pushToast(
          'We will notify you when this product is back in stock!',
          'success',
        );
      }
    } catch {
      pushToast('Something went wrong. Please try again.', 'error');
    } finally {
      setNotifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(pid);
        return next;
      });
    }
  };

  const getProductType = (type) => String(type || '').toLowerCase();

  const loadWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiGetMyWishlist();
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch (err) {
      setItems([]);
      setError(err?.response?.data?.message || 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadWishlist();

    apiGetPublicActiveOffers()
      .then((oRes) => {
        const map = {};
        (oRes.data?.offers || []).forEach((o) => {
          const pid = String(o.productId?._id || o.productId);
          map[pid] = o;
        });
        setOffersByProduct(map);
      })
      .catch(() => setOffersByProduct({}));

    apiGetActiveBoosts()
      .then((res) => {
        setBoostedProductIds(res.data?.boostedProductIds || []);
      })
      .catch(() => setBoostedProductIds([]));
  }, []);

  const total = useMemo(() => items.length, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const type = getProductType(item.type);

      const matchesType =
        filterType === 'all' ||
        (filterType === 'buy' && type === 'sell') ||
        (filterType === 'rent' && type === 'rental');

      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, filterType]);

  const sortedFilteredItems = useMemo(() => {
    if (boostedProductIds.length === 0) return filteredItems;
    const boosted = filteredItems.filter((p) =>
      boostedProductIds.includes(String(p._id)),
    );
    const rest = filteredItems.filter(
      (p) => !boostedProductIds.includes(String(p._id)),
    );
    return [...boosted, ...rest];
  }, [filteredItems, boostedProductIds]);

  const totalPages = Math.ceil(sortedFilteredItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedFilteredItems.slice(start, end);
  }, [sortedFilteredItems, currentPage]);

  const removeFromWishlist = async (productId) => {
    setBusyId(String(productId));

    try {
      await apiToggleWishlist(productId);

      const updated = items.filter((p) => String(p._id) !== String(productId));

      setItems(updated);

      const newTotalPages = Math.ceil(updated.length / ITEMS_PER_PAGE);

      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update wishlist.');
    } finally {
      setBusyId('');
    }
  };

  const buyCount = items.filter(
    (item) => getProductType(item.type) === 'sell',
  ).length;

  const rentCount = items.filter(
    (item) => getProductType(item.type) === 'rental',
  ).length;

  return (
    <div className="w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-black">My Wishlist</h1>

          <p className="text-sm text-gray-500 mt-1">
            Save products you love and come back anytime.
          </p>

          <div className="mt-4 relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search wishlist products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All ({total})</option>
          <option value="buy">Buy ({buyCount})</option>
          <option value="rent">Rent ({rentCount})</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className=" p-10 text-center">
          <p className="text-sm text-gray-500 font-medium mt-1">
            No wishlist products yet.
          </p>

          <Link
            href="/products"
            className="inline-block mt-2 text-sm text-orange-500 font-medium hover:underline"
          >
            Browse products
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className=" p-12 text-center">
          <p className="text-sm font-medium text-gray-500 ">
            No matching wishlist products found.
          </p>

          <p
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="mt-3 text-sm text-orange-500 font-medium cursor-pointer hover:underline"
          >
            Clear search
          </p>
        </div>
      ) : (
        <>
          <div className="flex overflow-x-auto sm:overflow-visible gap-1.5 sm:gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
            {paginatedItems.map((item) => {
              const isRentalItem = getProductType(item.type) === 'rental';
              const isSellProduct = getProductType(item.type) === 'sell';
              const detailsHref = isSellProduct
                ? `/buy-product-details/${item._id}`
                : `/rent-product-details/${item._id}`;

              const offer = offersByProduct[String(item._id)];
              const rawBase = getRentalListingAmount(item);
              const effectiveRawBase =
                isSellProduct && (!rawBase || rawBase <= 0)
                  ? (() => {
                      const variants = Array.isArray(item.variants)
                        ? item.variants
                        : [];
                      const firstWithPrice = variants.find(
                        (v) => Number(v?.sellPrice) > 0,
                      );
                      return firstWithPrice
                        ? Number(firstWithPrice.sellPrice)
                        : rawBase;
                    })()
                  : rawBase;

              const allConfigsForCard = [
                ...(Array.isArray(item.rentalConfigurations)
                  ? item.rentalConfigurations
                  : []),
                ...(Array.isArray(item.variants)
                  ? item.variants.flatMap((v) =>
                      Array.isArray(v?.rentalConfigurations)
                        ? v.rentalConfigurations
                        : [],
                    )
                  : []),
              ];
              const lowestConfig = allConfigsForCard
                .filter(
                  (cfg) =>
                    Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
                )
                .sort((a, b) => {
                  const perUnitA =
                    a.periodUnit === 'day' && Number(a.days) > 0
                      ? Number(a.customerRent || a.pricePerDay) / Number(a.days)
                      : Number(a.customerRent || a.pricePerDay);
                  const perUnitB =
                    b.periodUnit === 'day' && Number(b.days) > 0
                      ? Number(b.customerRent || b.pricePerDay) / Number(b.days)
                      : Number(b.customerRent || b.pricePerDay);
                  return perUnitA - perUnitB;
                })[0];
              const base = lowestConfig
                ? lowestConfig.periodUnit === 'day' &&
                  Number(lowestConfig.days) > 0
                  ? Math.round(
                      Number(
                        lowestConfig.customerRent || lowestConfig.pricePerDay,
                      ) / Number(lowestConfig.days),
                    )
                  : Math.round(
                      Number(
                        lowestConfig.customerRent || lowestConfig.pricePerDay,
                      ),
                    )
                : effectiveRawBase;
              const priceSuffix = isRentalItem
                ? lowestConfig?.periodUnit === 'day'
                  ? '/day'
                  : '/month'
                : '';
              const discount = resolveDiscountPercent(offer);
              const finalPrice = Math.max(
                0,
                Math.round(base - (base * discount) / 100),
              );
              const hasOffer = !!offer && discount > 0;
              const isBoosted = boostedProductIds.includes(String(item._id));
              const tag = offer?.sticker || (isBoosted ? 'Bestseller' : '');
              const statusType = item.stock > 0 ? 'delivery' : 'pickup';
              const deliveryEta = getProductDeliveryEtaLabel(item);
              const status =
                item.stock > 0 ? deliveryEta || 'Varies' : 'Out of Stock';
              const rating = Number(item.averageRating || 0).toFixed(1);
              const hasRating = Number(item.numReviews || 0) > 0;

              return (
                <Link
                  href={detailsHref}
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block w-[52%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
                >
                  <div className="relative pt-1 px-1 overflow-hidden">
                    {tag && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                        {tag}
                      </span>
                    )}

                    <img
                      src={
                        item.image ||
                        item.images?.[0] ||
                        'https://placehold.co/600x400/e5e7eb/6b7280?text=IMG'
                      }
                      alt={item.productName}
                      className="w-full aspect-square object-cover rounded-xl"
                    />

                    <div className="absolute bottom-3 left-3">
                      {statusType === 'delivery' ? (
                        <span className="flex items-center gap-1 text-[11px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          <Truck size={12} />
                          {status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          <Package size={12} />
                          {status}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(item._id);
                      }}
                      disabled={busyId === String(item._id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
                    >
                      <Heart size={16} className="text-red-500 fill-red-500" />
                    </button>

                    {hasRating && (
                      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 text-white text-[9px] sm:text-[11px] bg-[#F97316] px-1.5 sm:px-2 py-0.5 rounded-full">
                        <Star size={10} className="sm:hidden" fill="white" />
                        <Star
                          size={12}
                          className="hidden sm:block"
                          fill="white"
                        />
                        {rating}
                      </div>
                    )}
                  </div>

                  <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
                    <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0">
                      <h3 className="text-sm sm:text-xl font-bold truncate">
                        {item.productName}
                      </h3>
                      <span className="inline-block text-[9px] sm:text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
                        {item.condition?.trim() ||
                          (isRentalItem ? 'For Rent' : 'Brand New')}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-1 sm:gap-2 mb-0 sm:mb-0.5">
                      <div>
                        <span className="font-bold text-sm sm:text-xl leading-none">
                          ₹{formatPrice(hasOffer ? finalPrice : base)}
                        </span>
                        <span className="text-xs sm:text-base font-bold">
                          {priceSuffix}
                        </span>
                        {hasOffer ? (
                          <span className="ml-2 text-gray-400 text-xs line-through">
                            ₹{formatPrice(base)}
                          </span>
                        ) : null}
                      </div>
                      {hasOffer ? (
                        <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap self-end">
                          {formatPercent(discount)} Off
                        </span>
                      ) : null}
                    </div>

                    {(() => {
                      const isDaily =
                        item.rentalConfigurations?.some(
                          (cfg) => cfg?.periodUnit === 'day',
                        ) ||
                        (Array.isArray(item.variants) &&
                          item.variants.some((v) =>
                            Array.isArray(v?.rentalConfigurations)
                              ? v.rentalConfigurations.some(
                                  (cfg) => cfg?.periodUnit === 'day',
                                )
                              : false,
                          ));

                      if (item.stock <= 0) {
                        return (
                          <div className="flex gap-2">
                            <Link
                              href={detailsHref}
                              className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                            >
                              Details
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => handleNotifyMe(e, item._id)}
                              disabled={notifyingIds.has(String(item._id))}
                              className={`flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition
    ${
      notifiedIds.has(String(item._id))
        ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-default'
        : 'border-orange-300 text-orange-500  hover:bg-orange-50 disabled:opacity-60 disabled:cursor-not-allowed'
    }`}
                            >
                              {notifyingIds.has(String(item._id))
                                ? '...'
                                : notifiedIds.has(String(item._id))
                                  ? 'Waitlisted'
                                  : 'Notify Me'}
                            </button>
                          </div>
                        );
                      }

                      if (isDaily) {
                        return (
                          <Link
                            href={detailsHref}
                            className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
                          >
                            {isSellProduct ? 'Buy Now' : 'View'}
                          </Link>
                        );
                      }

                      const isSell = isSellProduct;

                      const candidateGroups = [
                        Array.isArray(item.rentalConfigurations)
                          ? item.rentalConfigurations
                          : [],
                        ...(Array.isArray(item.variants)
                          ? item.variants.map((v) =>
                              Array.isArray(v?.rentalConfigurations)
                                ? v.rentalConfigurations
                                : [],
                            )
                          : []),
                      ].filter((group) => group.length > 0);

                      let lowestPlan = null;
                      let lowestPlanGroup = [];
                      candidateGroups.forEach((group) => {
                        const groupLowest = group
                          .map((cfg) => ({
                            price: Number(
                              cfg?.customerRent || cfg?.pricePerDay || 0,
                            ),
                            months: Number(cfg?.months) || 1,
                            periodUnit:
                              cfg?.periodUnit === 'day' ? 'day' : 'month',
                            rawDays: Number(cfg?.days) || 0,
                          }))
                          .filter((p) => p.price > 0)
                          .sort((a, b) => {
                            const perUnitA =
                              a.periodUnit === 'day' && a.rawDays > 0
                                ? a.price / a.rawDays
                                : a.price;
                            const perUnitB =
                              b.periodUnit === 'day' && b.rawDays > 0
                                ? b.price / b.rawDays
                                : b.price;
                            return perUnitA - perUnitB;
                          })[0];
                        if (!groupLowest) return;
                        const currentPerUnit =
                          groupLowest.periodUnit === 'day' &&
                          groupLowest.rawDays > 0
                            ? groupLowest.price / groupLowest.rawDays
                            : groupLowest.price;
                        const bestPerUnit = lowestPlan
                          ? lowestPlan.periodUnit === 'day' &&
                            lowestPlan.rawDays > 0
                            ? lowestPlan.price / lowestPlan.rawDays
                            : lowestPlan.price
                          : Infinity;
                        if (currentPerUnit < bestPerUnit) {
                          lowestPlan = groupLowest;
                          lowestPlanGroup = group;
                        }
                      });

                      const rentalConfigs = lowestPlanGroup;

                      const sellBasePrice = (() => {
                        if (item?.salesConfiguration?.salePrice != null) {
                          const n = Number(item.salesConfiguration.salePrice);
                          if (Number.isFinite(n) && n > 0) return n;
                        }
                        const s = String(item?.price || '')
                          .replace(/[^\d.]/g, '')
                          .trim();
                        const n = Number(s);
                        if (Number.isFinite(n) && n > 0) return n;
                        const variants = Array.isArray(item.variants)
                          ? item.variants
                          : [];
                        const firstWithPrice = variants.find(
                          (v) => Number(v?.sellPrice) > 0,
                        );
                        return firstWithPrice
                          ? Number(firstWithPrice.sellPrice)
                          : 0;
                      })();

                      const cartPrice = isSell
                        ? sellBasePrice || getRentalListingAmount(item)
                        : lowestPlan
                          ? lowestPlan.price
                          : getRentalListingAmount(item);
                      const cartMonths = lowestPlan?.months || 1;
                      const cartTenureUnit = lowestPlan?.periodUnit || 'month';

                      const finalCartPrice =
                        discount > 0
                          ? Math.max(
                              0,
                              Math.round(
                                cartPrice - (cartPrice * discount) / 100,
                              ),
                            )
                          : cartPrice;

                      return (
                        <div className="flex gap-2">
                          <Link
                            href={detailsHref}
                            className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              dispatch(
                                addToCart(
                                  isSell
                                    ? {
                                        productId: item._id,
                                        variantId: null,
                                        variantName: '',
                                        quantity: 1,
                                        rentalMonths: 1,
                                        pricePerDay: finalCartPrice,
                                        title: item.productName || '',
                                        image:
                                          item.image || item.images?.[0] || '',
                                        tenureUnit: 'month',
                                        productType: 'Sell',
                                        refundableDeposit: 0,
                                        condition:
                                          item?.condition || 'Brand New',
                                        rentalConfigurations: [],
                                      }
                                    : {
                                        productId: item._id,
                                        variantId: null,
                                        variantName: '',
                                        quantity: 1,
                                        rentalMonths: cartMonths,
                                        pricePerDay: finalCartPrice,
                                        title: item.productName || '',
                                        image:
                                          item.image || item.images?.[0] || '',
                                        tenureUnit: cartTenureUnit,
                                        refundableDeposit: Number(
                                          item.refundableDeposit || 0,
                                        ),
                                        rentalConfigurations:
                                          rentalConfigs.length
                                            ? rentalConfigs
                                            : item.rentalConfigurations || [],
                                        offer: offer || null,
                                        defaultGst:
                                          item?.subCategoryTax?.defaultGst ??
                                          null,
                                        defaultCareTax:
                                          item?.subCategoryTax
                                            ?.defaultCareTax ?? null,
                                        defaultRepairWarranty:
                                          item?.subCategoryTax
                                            ?.defaultRepairWarranty ?? null,
                                        defaultRelocationWarranty:
                                          item?.subCategoryTax
                                            ?.defaultRelocationWarranty ?? null,
                                        defaultDeliveryPackaging:
                                          item?.subCategoryTax
                                            ?.defaultDeliveryPackaging ?? null,
                                        defaultInstallationFee:
                                          item?.subCategoryTax
                                            ?.defaultInstallationFee ?? null,
                                        defaultPlatformFee:
                                          item?.subCategoryTax
                                            ?.defaultPlatformFee ?? null,
                                        taxBlocked:
                                          item?.subCategoryTax?.taxBlocked ??
                                          false,
                                      },
                                ),
                              );
                            }}
                            className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 transition"
                          >
                            Cart
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                {currentPage}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
