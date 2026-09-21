// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
// import {
//   apiGetStorefrontVendorProducts,
//   apiGetPublicActiveOffers,
//   apiGetMyWishlist,
//   apiToggleWishlist,
//   apiGetProductById,
//   apiGetActiveBoosts,
// } from '@/lib/api';
// import {
//   getRentalListingAmount,
//   getRentalListingSuffix,
//   getProductDeliveryEtaLabel,
// } from '@/lib/rentalPriceDisplay';
// import { useRouter } from 'next/navigation';
// import { useSelector } from 'react-redux';
// import { useDispatch } from 'react-redux';
// import { addToCart } from '@/store/slices/cartSlice';
// import { useAuthModal } from '@/contexts/AuthModalContext';
// import { useToast } from '@/contexts/ToastContext';
// import { apiRequestStockNotify } from '@/lib/api';

// import {
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   Star,
//   Truck,
//   MapPin,
//   ShoppingCart,
//   Package,
// } from 'lucide-react';

// // const SimilarRental = ({ currentProductId }) => {
// const PLATFORM_FEE_PERCENT = 15;
// // Admin offers store a % of the platform fee removed; convert that into a
// // plain % of product price so it can be used exactly like a vendor offer's
// // discountPercent everywhere below.
// const resolveDiscountPercent = (offer) => {
//   if (!offer) return 0;
//   if (offer.source === 'admin') {
//     return Math.min(
//       PLATFORM_FEE_PERCENT,
//       Number(offer.platformFeeReductionPercent || 0),
//     );
//   }
//   return Number(offer.discountPercent || 0);
// };

// const SimilarRental = ({ currentProductId }) => {
//   const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
//   const [page, setPage] = useState(0);
//   const [products, setProducts] = useState([]);
//   const [offersByProduct, setOffersByProduct] = useState({});
//   const [wishedIds, setWishedIds] = useState([]);
//   const [togglingId, setTogglingId] = useState('');
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { openAuth } = useAuthModal();
//   const { pushToast } = useToast();
//   const [notifyingIds, setNotifyingIds] = useState(new Set());
//   const [notifiedIds, setNotifiedIds] = useState(new Set());
//   const [boostedProductIds, setBoostedProductIds] = useState([]);

//   useEffect(() => {
//     let mounted = true;

//     Promise.all([
//       apiGetStorefrontVendorProducts('limit=200'),
//       apiGetPublicActiveOffers(),
//       apiGetActiveBoosts().catch(() => ({ data: { boostedProductIds: [] } })),
//     ])
//       .then(([pRes, oRes, boostRes]) => {
//         if (!mounted) return;
//         const allProducts = pRes.data?.products || [];
//         const rentProducts = allProducts.filter((p) => p.type === 'Rental');
//         setProducts(rentProducts);

//         const map = {};
//         (oRes.data?.offers || []).forEach((o) => {
//           const pid = String(o.productId?._id || o.productId);
//           map[pid] = o;
//         });
//         setOffersByProduct(map);
//         setBoostedProductIds(boostRes.data?.boostedProductIds || []);
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setProducts([]);
//         setOffersByProduct({});
//         setBoostedProductIds([]);
//       })
//       .finally(() => {
//         if (mounted) setLoading(false);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       setWishedIds([]);
//       return;
//     }
//     let mounted = true;
//     apiGetMyWishlist()
//       .then((res) => {
//         if (!mounted) return;
//         setWishedIds(
//           Array.isArray(res.data?.wishedProductIds)
//             ? res.data.wishedProductIds
//             : [],
//         );
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setWishedIds([]);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, [isAuthenticated]);

//   const isWished = (id) => wishedIds.includes(String(id));

//   const onToggleWishlist = async (e, productId) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!isAuthenticated) return;
//     setTogglingId(String(productId));
//     try {
//       const res = await apiToggleWishlist(productId);
//       const wished = !!res.data?.wished;
//       setWishedIds((prev) => {
//         const pid = String(productId);
//         if (wished) return prev.includes(pid) ? prev : [...prev, pid];
//         return prev.filter((x) => x !== pid);
//       });
//     } catch {
//       // keep UI unchanged on failure
//     } finally {
//       setTogglingId('');
//     }
//   };

//   const cardsPerPage = 4;

//   const filteredProducts = useMemo(() => {
//     const base = currentProductId
//       ? products.filter((p) => String(p?._id) !== String(currentProductId))
//       : products;

//     if (boostedProductIds.length === 0) return base;
//     const boosted = base.filter((p) =>
//       boostedProductIds.includes(String(p._id)),
//     );
//     const rest = base.filter((p) => !boostedProductIds.includes(String(p._id)));
//     return [...boosted, ...rest];
//   }, [products, currentProductId, boostedProductIds]);

//   const visibleProducts = filteredProducts.slice(
//     page * cardsPerPage,
//     page * cardsPerPage + cardsPerPage,
//   );

//   const nextSlide = () => {
//     if ((page + 1) * cardsPerPage < filteredProducts.length) {
//       setPage(page + 1);
//     }
//   };

//   const prevSlide = () => {
//     if (page > 0) {
//       setPage(page - 1);
//     }
//   };

//   return (
//     <section className="w-full pt-3 md:pt-6 pb-4 sm:pb-6 px-3 sm:px-4 ">
//       <div className="w-full mx-auto">
//         {/* HEADER */}
//         {/* <div className="flex flex-row items-center justify-between gap-2 mb-2 md:mb-3">
//           <h1 className="text-lg sm:text-2xl lg:text-3xl">
//             <span className="font-semibold text-black">Similar Rentals </span>
//             <span className="font-bold text-[#F97316]">Products</span>
//           </h1>
//           <button

//             onClick={() => router.push('/products?type=Rental')}
//             className="text-orange-500 text-xs sm:text-sm font-medium w-fit whitespace-nowrap"
//           >
//             View All →
//           </button>
//         </div> */}
//         <div className="flex flex-row items-center justify-between gap-2 mb-2 md:mb-3">
//           <h1 className="text-lg sm:text-2xl lg:text-3xl">
//             <span className="font-semibold text-black">Similar Rentals </span>
//             <span className="font-bold text-[#F97316]">Products</span>
//           </h1>
//           {filteredProducts.length > 4 && (
//             <button
//               // onClick={() => router.push('/products')}
//               onClick={() => router.push('/products?type=Rental')}
//               className="group bg-[#F97316] text-white font-bold px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm w-fit whitespace-nowrap flex items-center gap-1"
//             >
//               View All
//               <ChevronRight
//                 size={14}
//                 className="transition-transform duration-300 group-hover:translate-x-1"
//               />
//             </button>
//           )}
//         </div>

//         {/* PRODUCT GRID */}
//         <div className="flex overflow-x-auto sm:overflow-visible gap-3 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
//           {loading ? (
//             Array.from({ length: cardsPerPage }).map((_, idx) => (
//               <div
//                 key={`skeleton-${idx}`}
//                 className="bg-white border rounded-lg sm:rounded-xl overflow-hidden min-w-0 animate-pulse w-[46%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
//               >
//                 <div className="h-44 bg-gray-100" />
//                 <div className="px-3 sm:px-4 py-4">
//                   <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
//                   <div className="h-4 w-2/3 bg-gray-100 rounded mb-2" />
//                   <div className="h-4 w-1/2 bg-gray-100 rounded mb-4" />
//                   <div className="h-9 w-full bg-gray-100 rounded-lg" />
//                 </div>
//               </div>
//             ))
//           ) : visibleProducts.length === 0 ? (
//             <p className="text-sm text-gray-500 col-span-full py-8 text-center">
//               No similar rentals found.
//             </p>
//           ) : (
//             visibleProducts.map((item) => {
//               // const lowestConfig = Array.isArray(item.rentalConfigurations)
//               //   ? item.rentalConfigurations.find(
//               //       (cfg) =>
//               //         Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
//               //     )
//               //   : null;
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
//                   // For month-based configs, customerRent is already the
//                   // per-month rate — don't divide it by months.
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
//               const tenureTotal = lowestConfig
//                 ? Number(
//                     lowestConfig.customerRent || lowestConfig.pricePerDay || 0,
//                   )
//                 : 0;
//               const base = lowestConfig
//                 ? lowestConfig.periodUnit === 'day' &&
//                   Number(lowestConfig.days) > 0
//                   ? Math.round(tenureTotal / Number(lowestConfig.days))
//                   : // tenureTotal is already the per-month rate for
//                     // month-based configs — use it directly.
//                     Math.round(tenureTotal)
//                 : getRentalListingAmount(item);
//               const priceSuffix =
//                 lowestConfig?.periodUnit === 'day' ? '/day' : '/month';
//               // const offer = offersByProduct[String(item?._id)];
//               // const discount = Number(offer?.discountPercent || 0);
//               // const hasOffer = !!offer && discount > 0;
//               const offer = offersByProduct[String(item?._id)];
//               const discount = resolveDiscountPercent(offer);
//               const hasOffer = !!offer && discount > 0;
//               const finalPrice = Math.max(
//                 0,
//                 Math.round(base - (base * discount) / 100),
//               );
//               const old = base;
//               const inStock = Number(item?.stock || 0) > 0;
//               const totalReviews = Number(item?.numReviews || 0);
//               const averageRating = Number(item?.averageRating || 0);
//               return (
//                 <div
//                   key={item?._id}
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer w-[46%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
//                 >
//                   {/* IMAGE SECTION */}

//                   <div className="relative pt-1 px-1 overflow-hidden">
//                     {/* {(offer?.sticker ||
//                       (!hasOffer &&
//                         boostedProductIds.includes(String(item._id)))) && (
//                       <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                         {offer?.sticker || 'Bestseller'}
//                       </span>
//                     )} */}
//                     {(offer?.sticker ||
//                       boostedProductIds.includes(String(item._id))) && (
//                       <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                         {offer?.sticker || 'Bestseller'}
//                       </span>
//                     )}

//                     <img
//                       src={item?.image || mainimg}
//                       alt={item?.productName || 'product'}
//                       // className="w-full h-48 sm:h-52 object-cover rounded-xl"
//                       className="w-full aspect-square object-cover rounded-xl"
//                     />

//                     {/* bottom left status */}
//                     <div className="absolute bottom-3 left-3">
//                       {inStock ? (
//                         <span className="flex items-center gap-1 text-xs bg-white/95 border border-gray-200 shadow-sm  px-2 py-1 rounded-full">
//                           <Truck size={12} className="text-blue-500" />
//                           {getProductDeliveryEtaLabel(item) || 'Varies'}
//                         </span>
//                       ) : (
//                         <span className="flex items-center gap-1 text-xs bg-white/95 border text-red-500  shadow-sm px-2 py-1 rounded-full">
//                           <Package size={12} className="text-red-500" />
//                           Out of Stock
//                         </span>
//                       )}
//                     </div>

//                     {/* wishlist */}
//                     <button
//                       type="button"
//                       onClick={(e) => onToggleWishlist(e, item?._id)}
//                       disabled={togglingId === String(item?._id)}
//                       className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
//                     >
//                       <Heart
//                         size={16}
//                         className={
//                           isWished(item?._id)
//                             ? 'text-red-500 fill-red-500'
//                             : 'text-gray-700'
//                         }
//                       />
//                     </button>

//                     {/* rating badge - bottom right, same row as delivery status */}
//                     {totalReviews > 0 && (
//                       <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 text-white text-[9px] sm:text-[11px] bg-[#F97316] px-1.5 sm:px-2 py-0.5 rounded-full">
//                         <Star
//                           size={10}
//                           className="fill-white text-white sm:hidden"
//                         />
//                         <Star
//                           size={12}
//                           className="fill-white text-white hidden sm:block"
//                         />
//                         {averageRating.toFixed(1)}
//                       </div>
//                     )}
//                   </div>

//                   {/* CONTENT */}
//                   <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
//                     {/* TITLE + CONDITION BADGE */}
//                     <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
//                       <h3 className="text-xs sm:text-base font-semibold truncate">
//                         {item?.productName}
//                       </h3>
//                       <span className="inline-block text-[8px] sm:text-[11px] text-gray-500 border border-gray-200 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
//                         {item.condition?.trim() || 'For Rent'}
//                       </span>
//                     </div>

//                     {/* PRICE */}
//                     <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
//                       <div>
//                         <span className="font-bold text-sm sm:text-xl leading-none">
//                           ₹{hasOffer ? finalPrice : base}
//                         </span>
//                         <span className="ml-1 text-[10px] sm:text-sm font-medium">
//                           {priceSuffix}
//                         </span>

//                         {hasOffer ? (
//                           <span className="ml-1 sm:ml-2 text-gray-400 text-[10px] sm:text-xs line-through">
//                             ₹{old}
//                           </span>
//                         ) : null}
//                       </div>
//                       {hasOffer ? (
//                         <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border text-[8px] sm:text-[11px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
//                           {discount}% Off
//                         </span>
//                       ) : null}
//                     </div>

//                     {/* BUTTON (TRENDING STYLE) */}
//                     {/* <button
//                       onClick={() =>
//                         router.push(`/rent-product-details/${item?._id}`)
//                       }
//                       className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
//                     >
//                       Rent Now
//                     </button> */}
//                     {(() => {
//                       // const isDaily = item.rentalConfigurations?.some(
//                       //   (cfg) => cfg?.periodUnit === 'day',
//                       // );
//                       const isDaily = allConfigsForCard.some(
//                         (cfg) => cfg?.periodUnit === 'day',
//                       );

//                       // Out of stock
//                       if (item.stock <= 0) {
//                         return (
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() =>
//                                 router.push(`/rent-product-details/${item._id}`)
//                               }
//                               className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
//                             >
//                               Details
//                             </button>

//                             <button
//                               onClick={(e) => handleNotifyMe(e, item._id)}
//                               disabled={notifyingIds.has(String(item._id))}
//                               className={`flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition
//           ${
//             notifiedIds.has(String(item._id))
//               ? 'bg-orange-500 text-white'
//               : 'border border-orange-400 text-orange-500 hover:bg-orange-50'
//           }`}
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

//                       // Daily Rental
//                       if (isDaily) {
//                         return (
//                           <button
//                             onClick={() =>
//                               router.push(`/rent-product-details/${item._id}`)
//                             }
//                             className="w-full py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
//                           >
//                             View
//                           </button>
//                         );
//                       }

//                       // Monthly Rental
//                       return (
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() =>
//                               router.push(`/rent-product-details/${item._id}`)
//                             }
//                             className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
//                           >
//                             View
//                           </button>

//                           <button
//                             onClick={async () => {
//                               let fullProduct = item;
//                               try {
//                                 const res = await apiGetProductById(item._id);
//                                 if (res?.data?.product)
//                                   fullProduct = res.data.product;
//                               } catch (e) {
//                                 // fall back to list item if detail fetch fails
//                               }
//                               dispatch(
//                                 addToCart({
//                                   productId: item._id,
//                                   variantId: null,
//                                   variantName: '',
//                                   quantity: 1,
//                                   rentalMonths:
//                                     lowestConfig?.periodUnit === 'day'
//                                       ? Number(lowestConfig?.days) || 1
//                                       : Number(lowestConfig?.months) || 1,
//                                   // For monthly plans, tenureTotal/base is the
//                                   // per-month rate — multiply by months to get
//                                   // the total tenure price for the cart (day
//                                   // plans use tenureTotal as-is, unaffected).
//                                   pricePerDay: (() => {
//                                     const rawTotal = tenureTotal || base;
//                                     return hasOffer
//                                       ? Math.max(
//                                           0,
//                                           Math.round(
//                                             rawTotal -
//                                               (rawTotal * discount) / 100,
//                                           ),
//                                         )
//                                       : rawTotal;
//                                   })(),
//                                   originalPricePerDay: tenureTotal || base,
//                                   title: item.productName,
//                                   image: item.image,
//                                   tenureUnit:
//                                     lowestConfig?.periodUnit === 'day'
//                                       ? 'day'
//                                       : 'month',
//                                   refundableDeposit: Number(
//                                     item.refundableDeposit || 0,
//                                   ),
//                                   rentalConfigurations:
//                                     item.rentalConfigurations || [],
//                                   condition: item.condition || '',
//                                   productType: 'Rental',
//                                   offer: offer || null,
//                                   defaultGst:
//                                     item?.subCategoryTax?.defaultGst ?? null,
//                                   defaultCareTax:
//                                     item?.subCategoryTax?.defaultCareTax ??
//                                     null,
//                                   defaultRepairWarranty:
//                                     item?.subCategoryTax
//                                       ?.defaultRepairWarranty ?? null,
//                                   defaultRelocationWarranty:
//                                     item?.subCategoryTax
//                                       ?.defaultRelocationWarranty ?? null,
//                                   defaultDeliveryPackaging:
//                                     item?.subCategoryTax
//                                       ?.defaultDeliveryPackaging ?? null,
//                                   defaultInstallationFee:
//                                     item?.subCategoryTax
//                                       ?.defaultInstallationFee ?? null,
//                                   defaultPlatformFee:
//                                     item?.subCategoryTax?.defaultPlatformFee ??
//                                     null,
//                                   taxBlocked:
//                                     item?.subCategoryTax?.taxBlocked ?? false,
//                                   startDate: null,
//                                   endDate: null,
//                                   dailyRate: null,
//                                 }),
//                                 //     );

//                                 //     router.push('/cart');
//                                 //   }}
//                                 //   className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
//                                 // >
//                                 //   Cart
//                               );
//                             }}
//                             className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
//                           >
//                             Cart
//                           </button>
//                         </div>
//                       );
//                     })()}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* ARROWS */}
//         {/* <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-10">
//           <button
//             onClick={prevSlide}
//             className="p-2 sm:p-3 border rounded-full hover:bg-black hover:text-white"
//           >
//             <ChevronLeft size={18} />
//           </button>
//           <button
//             onClick={nextSlide}
//             className="p-2 sm:p-3 border hover:bg-black hover:text-white rounded-full"
//           >
//             <ChevronRight size={18} />
//           </button>
//         </div> */}
//       </div>
//     </section>
//   );
// };

// export default SimilarRental;

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
import {
  apiGetStorefrontVendorProducts,
  apiGetPublicActiveOffers,
  apiGetMyWishlist,
  apiToggleWishlist,
  apiGetProductById,
  apiGetActiveBoosts,
} from '@/lib/api';
import {
  getRentalListingAmount,
  getRentalListingSuffix,
  getProductDeliveryEtaLabel,
} from '@/lib/rentalPriceDisplay';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/contexts/ToastContext';
import { apiRequestStockNotify } from '@/lib/api';

import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  MapPin,
  ShoppingCart,
  Package,
} from 'lucide-react';

// const SimilarRental = ({ currentProductId }) => {
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

const SimilarRental = ({ currentProductId }) => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [offersByProduct, setOffersByProduct] = useState({});
  const [wishedIds, setWishedIds] = useState([]);
  const [togglingId, setTogglingId] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const { openAuth } = useAuthModal();
  const { pushToast } = useToast();
  const [notifyingIds, setNotifyingIds] = useState(new Set());
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const [boostedProductIds, setBoostedProductIds] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiGetStorefrontVendorProducts('limit=200'),
      apiGetPublicActiveOffers(),
      apiGetActiveBoosts().catch(() => ({ data: { boostedProductIds: [] } })),
    ])
      .then(([pRes, oRes, boostRes]) => {
        if (!mounted) return;
        const allProducts = pRes.data?.products || [];
        const rentProducts = allProducts.filter((p) => p.type === 'Rental');
        setProducts(rentProducts);

        const map = {};
        (oRes.data?.offers || []).forEach((o) => {
          const pid = String(o.productId?._id || o.productId);
          map[pid] = o;
        });
        setOffersByProduct(map);
        setBoostedProductIds(boostRes.data?.boostedProductIds || []);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
        setOffersByProduct({});
        setBoostedProductIds([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishedIds([]);
      return;
    }
    let mounted = true;
    apiGetMyWishlist()
      .then((res) => {
        if (!mounted) return;
        setWishedIds(
          Array.isArray(res.data?.wishedProductIds)
            ? res.data.wishedProductIds
            : [],
        );
      })
      .catch(() => {
        if (!mounted) return;
        setWishedIds([]);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const isWished = (id) => wishedIds.includes(String(id));

  const onToggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setTogglingId(String(productId));
    try {
      const res = await apiToggleWishlist(productId);
      const wished = !!res.data?.wished;
      setWishedIds((prev) => {
        const pid = String(productId);
        if (wished) return prev.includes(pid) ? prev : [...prev, pid];
        return prev.filter((x) => x !== pid);
      });
    } catch {
      // keep UI unchanged on failure
    } finally {
      setTogglingId('');
    }
  };

  const cardsPerPage = 4;

  // const filteredProducts = useMemo(() => {
  //   const base = currentProductId
  //     ? products.filter((p) => String(p?._id) !== String(currentProductId))
  //     : products;

  //   if (boostedProductIds.length === 0) return base;
  //   const boosted = base.filter((p) =>
  //     boostedProductIds.includes(String(p._id)),
  //   );
  //   const rest = base.filter((p) => !boostedProductIds.includes(String(p._id)));
  //   return [...boosted, ...rest];
  // }, [products, currentProductId, boostedProductIds]);
  const filteredProducts = useMemo(() => {
    const base = currentProductId
      ? products.filter((p) => String(p?._id) !== String(currentProductId))
      : products;

    // Admin "Featured" items always come first, ordered by priorityRank.
    // Only counts if status is 'live' — an 'inactive' toggle in the admin
    // featured table excludes it here automatically.
    const isFeaturedActive = (p) =>
      p?.featured?.enabled === true && p?.featured?.status === 'live';
    const featured = base
      .filter(isFeaturedActive)
      .sort(
        (a, b) =>
          Number(a?.featured?.priorityRank || 0) -
          Number(b?.featured?.priorityRank || 0),
      );
    const nonFeatured = base.filter((p) => !isFeaturedActive(p));

    // Then float boosted products to the top of the remaining (non-featured) list.
    if (boostedProductIds.length === 0) return [...featured, ...nonFeatured];
    const boosted = nonFeatured.filter((p) =>
      boostedProductIds.includes(String(p._id)),
    );
    const rest = nonFeatured.filter(
      (p) => !boostedProductIds.includes(String(p._id)),
    );
    return [...featured, ...boosted, ...rest];
  }, [products, currentProductId, boostedProductIds]);

  const visibleProducts = filteredProducts.slice(
    page * cardsPerPage,
    page * cardsPerPage + cardsPerPage,
  );

  const nextSlide = () => {
    if ((page + 1) * cardsPerPage < filteredProducts.length) {
      setPage(page + 1);
    }
  };

  const prevSlide = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <section className="w-full pt-3 md:pt-6 pb-4 sm:pb-6 px-3 sm:px-4 ">
      <div className="w-full mx-auto">
        {/* HEADER */}
        {/* <div className="flex flex-row items-center justify-between gap-2 mb-2 md:mb-3">
          <h1 className="text-lg sm:text-2xl lg:text-3xl">
            <span className="font-semibold text-black">Similar Rentals </span>
            <span className="font-bold text-[#F97316]">Products</span>
          </h1>
          <button
         
            onClick={() => router.push('/products?type=Rental')}
            className="text-orange-500 text-xs sm:text-sm font-medium w-fit whitespace-nowrap"
          >
            View All →
          </button>
        </div> */}
        <div className="flex flex-row items-center justify-between gap-2 mb-2 md:mb-3">
          <h1 className="text-lg sm:text-2xl lg:text-3xl">
            <span className="font-semibold text-black">Similar Rentals </span>
            <span className="font-bold text-[#F97316]">Products</span>
          </h1>
          {filteredProducts.length > 4 && (
            <button
              // onClick={() => router.push('/products')}
              onClick={() => router.push('/products?type=Rental')}
              className="group bg-[#F97316] text-white font-bold px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm w-fit whitespace-nowrap flex items-center gap-1"
            >
              View All
              <ChevronRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          )}
        </div>

        {/* PRODUCT GRID */}
        <div className="flex overflow-x-auto sm:overflow-visible gap-3 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
          {loading ? (
            Array.from({ length: cardsPerPage }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="bg-white border rounded-lg sm:rounded-xl overflow-hidden min-w-0 animate-pulse w-[46%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
              >
                <div className="h-44 bg-gray-100" />
                <div className="px-3 sm:px-4 py-4">
                  <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                  <div className="h-4 w-2/3 bg-gray-100 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded mb-4" />
                  <div className="h-9 w-full bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))
          ) : visibleProducts.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full py-8 text-center">
              No similar rentals found.
            </p>
          ) : (
            visibleProducts.map((item) => {
              // const lowestConfig = Array.isArray(item.rentalConfigurations)
              //   ? item.rentalConfigurations.find(
              //       (cfg) =>
              //         Number(cfg?.customerRent || cfg?.pricePerDay || 0) > 0,
              //     )
              //   : null;
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
                  // For month-based configs, customerRent is already the
                  // per-month rate — don't divide it by months.
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
              const tenureTotal = lowestConfig
                ? Number(
                    lowestConfig.customerRent || lowestConfig.pricePerDay || 0,
                  )
                : 0;
              const base = lowestConfig
                ? lowestConfig.periodUnit === 'day' &&
                  Number(lowestConfig.days) > 0
                  ? Math.round(tenureTotal / Number(lowestConfig.days))
                  : // tenureTotal is already the per-month rate for
                    // month-based configs — use it directly.
                    Math.round(tenureTotal)
                : getRentalListingAmount(item);
              const priceSuffix =
                lowestConfig?.periodUnit === 'day' ? '/day' : '/month';
              // const offer = offersByProduct[String(item?._id)];
              // const discount = Number(offer?.discountPercent || 0);
              // const hasOffer = !!offer && discount > 0;
              const offer = offersByProduct[String(item?._id)];
              const discount = resolveDiscountPercent(offer);
              const hasOffer = !!offer && discount > 0;
              const finalPrice = Math.max(
                0,
                Math.round(base - (base * discount) / 100),
              );
              const old = base;
              const inStock = Number(item?.stock || 0) > 0;
              const totalReviews = Number(item?.numReviews || 0);
              const averageRating = Number(item?.averageRating || 0);
              return (
                <div
                  key={item?._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer w-[46%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
                >
                  {/* IMAGE SECTION */}

                  <div className="relative pt-1 px-1 overflow-hidden">
                    {/* {(offer?.sticker ||
                      (!hasOffer &&
                        boostedProductIds.includes(String(item._id)))) && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                        {offer?.sticker || 'Bestseller'}
                      </span>
                    )} */}
                    {/* {(offer?.sticker ||
                      boostedProductIds.includes(String(item._id))) && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                        {offer?.sticker || 'Bestseller'}
                      </span>
                    )}

                    <img
                      src={item?.image || mainimg} */}
                    {item?.featured?.enabled &&
                    item?.featured?.status === 'live' ? (
                      <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#F97316] text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
                        {/* <Star size={10} fill="white" /> */}
                        Featured
                      </span>
                    ) : (
                      (offer?.sticker ||
                        boostedProductIds.includes(String(item._id))) && (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                          {offer?.sticker || 'Bestseller'}
                        </span>
                      )
                    )}

                    <img
                      src={item?.image || mainimg}
                      alt={item?.productName || 'product'}
                      // className="w-full h-48 sm:h-52 object-cover rounded-xl"
                      className="w-full aspect-square object-cover rounded-xl"
                    />

                    {/* bottom left status */}
                    <div className="absolute bottom-3 left-3">
                      {inStock ? (
                        <span className="flex items-center gap-1 text-xs bg-white/95 border border-gray-200 shadow-sm  px-2 py-1 rounded-full">
                          <Truck size={12} className="text-blue-500" />
                          {getProductDeliveryEtaLabel(item) || 'Varies'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-white/95 border text-red-500  shadow-sm px-2 py-1 rounded-full">
                          <Package size={12} className="text-red-500" />
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* wishlist */}
                    <button
                      type="button"
                      onClick={(e) => onToggleWishlist(e, item?._id)}
                      disabled={togglingId === String(item?._id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
                    >
                      <Heart
                        size={16}
                        className={
                          isWished(item?._id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-700'
                        }
                      />
                    </button>

                    {/* rating badge - bottom right, same row as delivery status */}
                    {totalReviews > 0 && (
                      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 text-white text-[9px] sm:text-[11px] bg-[#F97316] px-1.5 sm:px-2 py-0.5 rounded-full">
                        <Star
                          size={10}
                          className="fill-white text-white sm:hidden"
                        />
                        <Star
                          size={12}
                          className="fill-white text-white hidden sm:block"
                        />
                        {averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
                    {/* TITLE + CONDITION BADGE */}
                    <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                      <h3 className="text-xs sm:text-base font-semibold truncate">
                        {item?.productName}
                      </h3>
                      <span className="inline-block text-[8px] sm:text-[11px] text-gray-500 border border-gray-200 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
                        {item.condition?.trim() || 'For Rent'}
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                      <div>
                        <span className="font-bold text-sm sm:text-xl leading-none">
                          ₹{hasOffer ? finalPrice : base}
                        </span>
                        <span className="ml-1 text-[10px] sm:text-sm font-medium">
                          {priceSuffix}
                        </span>

                        {hasOffer ? (
                          <span className="ml-1 sm:ml-2 text-gray-400 text-[10px] sm:text-xs line-through">
                            ₹{old}
                          </span>
                        ) : null}
                      </div>
                      {hasOffer ? (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border text-[8px] sm:text-[11px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
                          {discount}% Off
                        </span>
                      ) : null}
                    </div>

                    {/* BUTTON (TRENDING STYLE) */}
                    {/* <button
                      onClick={() =>
                        router.push(`/rent-product-details/${item?._id}`)
                      }
                      className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Rent Now
                    </button> */}
                    {(() => {
                      // const isDaily = item.rentalConfigurations?.some(
                      //   (cfg) => cfg?.periodUnit === 'day',
                      // );
                      const isDaily = allConfigsForCard.some(
                        (cfg) => cfg?.periodUnit === 'day',
                      );

                      // Out of stock
                      if (item.stock <= 0) {
                        return (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                router.push(`/rent-product-details/${item._id}`)
                              }
                              className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                            >
                              Details
                            </button>

                            <button
                              onClick={(e) => handleNotifyMe(e, item._id)}
                              disabled={notifyingIds.has(String(item._id))}
                              className={`flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition
          ${
            notifiedIds.has(String(item._id))
              ? 'bg-orange-500 text-white'
              : 'border border-orange-400 text-orange-500 hover:bg-orange-50'
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

                      // Daily Rental
                      if (isDaily) {
                        return (
                          <button
                            onClick={() =>
                              router.push(`/rent-product-details/${item._id}`)
                            }
                            className="w-full py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
                          >
                            View
                          </button>
                        );
                      }

                      // Monthly Rental
                      return (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(`/rent-product-details/${item._id}`)
                            }
                            className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50 transition"
                          >
                            View
                          </button>

                          <button
                            onClick={async () => {
                              let fullProduct = item;
                              try {
                                const res = await apiGetProductById(item._id);
                                if (res?.data?.product)
                                  fullProduct = res.data.product;
                              } catch (e) {
                                // fall back to list item if detail fetch fails
                              }
                              dispatch(
                                addToCart({
                                  productId: item._id,
                                  variantId: null,
                                  variantName: '',
                                  quantity: 1,
                                  rentalMonths:
                                    lowestConfig?.periodUnit === 'day'
                                      ? Number(lowestConfig?.days) || 1
                                      : Number(lowestConfig?.months) || 1,
                                  // For monthly plans, tenureTotal/base is the
                                  // per-month rate — multiply by months to get
                                  // the total tenure price for the cart (day
                                  // plans use tenureTotal as-is, unaffected).
                                  pricePerDay: (() => {
                                    const rawTotal = tenureTotal || base;
                                    return hasOffer
                                      ? Math.max(
                                          0,
                                          Math.round(
                                            rawTotal -
                                              (rawTotal * discount) / 100,
                                          ),
                                        )
                                      : rawTotal;
                                  })(),
                                  originalPricePerDay: tenureTotal || base,
                                  title: item.productName,
                                  image: item.image,
                                  tenureUnit:
                                    lowestConfig?.periodUnit === 'day'
                                      ? 'day'
                                      : 'month',
                                  refundableDeposit: Number(
                                    item.refundableDeposit || 0,
                                  ),
                                  rentalConfigurations:
                                    item.rentalConfigurations || [],
                                  condition: item.condition || '',
                                  productType: 'Rental',
                                  offer: offer || null,
                                  defaultGst:
                                    item?.subCategoryTax?.defaultGst ?? null,
                                  defaultCareTax:
                                    item?.subCategoryTax?.defaultCareTax ??
                                    null,
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
                                    item?.subCategoryTax?.defaultPlatformFee ??
                                    null,
                                  taxBlocked:
                                    item?.subCategoryTax?.taxBlocked ?? false,
                                  startDate: null,
                                  endDate: null,
                                  dailyRate: null,
                                }),
                                //     );

                                //     router.push('/cart');
                                //   }}
                                //   className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
                                // >
                                //   Cart
                              );
                            }}
                            className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
                          >
                            Cart
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ARROWS */}
        {/* <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-10">
          <button
            onClick={prevSlide}
            className="p-2 sm:p-3 border rounded-full hover:bg-black hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 sm:p-3 border hover:bg-black hover:text-white rounded-full"
          >
            <ChevronRight size={18} />
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default SimilarRental;
