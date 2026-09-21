// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import {
//   ChevronLeft,
//   ChevronRight,
//   Heart,
//   Package,
//   ShoppingCart,
//   Star,
//   Truck,
// } from 'lucide-react';
// import {
//   apiGetStorefrontVendorProducts,
//   apiGetPublicActiveOffers,
//   apiGetMyWishlist,
//   apiToggleWishlist,
//   apiGetActiveBoosts,
// } from '@/lib/api';
// import { getRentalListingAmount } from '@/lib/rentalPriceDisplay';
// import { useSelector } from 'react-redux';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { addToCart } from '@/store/slices/cartSlice';
// import { useDispatch } from 'react-redux';
// import { useAuthModal } from '@/contexts/AuthModalContext';
// import { useToast } from '@/contexts/ToastContext';
// import { apiRequestStockNotify } from '@/lib/api';
// const CARDS_PER_PAGE = 4;

// const formatPrice = (n) => {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num)) return '0';
//   return num.toLocaleString('en-IN');
// };

// const getDeliveryLabel = (product) => {
//   const n = Number(product?.logisticsVerification?.deliveryTimelineValue);
//   const rawUnit = String(
//     product?.logisticsVerification?.deliveryTimelineUnit || 'Days',
//   ).trim();
//   if (Number.isFinite(n) && n > 0) return `${n} ${rawUnit || 'Days'}`;
//   return '2-4 days';
// };

// const PLATFORM_FEE_PERCENT = 15;
// // Admin offers store a % of the platform fee removed; convert that into a
// // plain % of product price so it can be used exactly like a vendor offer's
// // discountPercent everywhere below.
// function resolveDiscountPercent(offer) {
//   if (!offer) return 0;
//   if (offer.source === 'admin') {
//     return Math.min(
//       PLATFORM_FEE_PERCENT,
//       Number(offer.platformFeeReductionPercent || 0),
//     );
//   }
//   return Number(offer.discountPercent || 0);
// }

// export default function BuySimilarProducts({ currentProductId }) {
//   const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
//   const [products, setProducts] = useState([]);
//   const [offersByProduct, setOffersByProduct] = useState({});
//   const [page, setPage] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [wishedIds, setWishedIds] = useState([]);
//   const [togglingId, setTogglingId] = useState('');
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const activeFilter = searchParams.get('filter') || 'all';
//   const dispatch = useDispatch();
//   const { openAuth } = useAuthModal();
//   const { pushToast } = useToast();

//   const [boostedProductIds, setBoostedProductIds] = useState([]);
//   const [notifyingIds, setNotifyingIds] = useState(new Set());

//   const [notifiedIds, setNotifiedIds] = useState(() => {
//     if (typeof window === 'undefined') return new Set();

//     try {
//       const raw = localStorage.getItem('buy_notified_ids');
//       return new Set(JSON.parse(raw || '[]'));
//     } catch {
//       return new Set();
//     }
//   });

//   // ── fetch products ──────────────────────────────────────────────
//   useEffect(() => {
//     let mounted = true;
//     Promise.all([
//       apiGetStorefrontVendorProducts('limit=200'),
//       apiGetPublicActiveOffers(),
//       apiGetActiveBoosts().catch(() => ({ data: { boostedProductIds: [] } })),
//     ])
//       .then(([pRes, oRes, boostRes]) => {
//         if (!mounted) return;
//         const all = Array.isArray(pRes?.data?.products)
//           ? pRes.data.products
//           : [];
//         setProducts(all.filter((p) => String(p?.type) === 'Sell'));

//         const map = {};
//         (oRes?.data?.offers || []).forEach((o) => {
//           const pid = String(o.productId?._id || o.productId);
//           map[pid] = o;
//         });
//         setOffersByProduct(map);
//         setBoostedProductIds(boostRes.data?.boostedProductIds || []);
//       })
//       .catch(() => {
//         if (mounted) {
//           setProducts([]);
//           setOffersByProduct({});
//           setBoostedProductIds([]);
//         }
//       })
//       .finally(() => {
//         if (mounted) setLoading(false);
//       });
//     return () => {
//       mounted = false;
//     };
//   }, []);
//   // ── fetch wishlist ───────────────────────────────────────────────
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
//         if (mounted) setWishedIds([]);
//       });
//     return () => {
//       mounted = false;
//     };
//   }, [isAuthenticated]);

//   // ── helpers ──────────────────────────────────────────────────────
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

//   const handleNotifyMe = async (e, productId) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       openAuth('login');
//       return;
//     }

//     const pid = String(productId);

//     if (notifiedIds.has(pid)) {
//       pushToast("You're already on the waitlist.", 'info');
//       return;
//     }

//     setNotifyingIds((prev) => new Set(prev).add(pid));

//     try {
//       await apiRequestStockNotify(productId);

//       setNotifiedIds((prev) => {
//         const next = new Set(prev).add(pid);

//         localStorage.setItem('buy_notified_ids', JSON.stringify([...next]));

//         return next;
//       });

//       pushToast(
//         'We will notify you when this product is back in stock.',
//         'success',
//       );
//     } catch {
//       pushToast('Something went wrong.', 'error');
//     } finally {
//       setNotifyingIds((prev) => {
//         const next = new Set(prev);
//         next.delete(pid);
//         return next;
//       });
//     }
//   };

//   // const visible = useMemo(
//   //   () =>
//   //     products.slice(
//   //       page * CARDS_PER_PAGE,
//   //       page * CARDS_PER_PAGE + CARDS_PER_PAGE,
//   //     ),
//   //   [products, page],
//   // );

//   // const next = () => {
//   //   if ((page + 1) * CARDS_PER_PAGE < products.length) setPage((p) => p + 1);
//   // };
//   const filteredProducts = useMemo(() => {
//     const base = currentProductId
//       ? products.filter((p) => String(p?._id) !== String(currentProductId))
//       : products;

//     let filtered;
//     if (activeFilter === 'brandNew') {
//       filtered = base.filter((p) =>
//         String(p?.condition || 'Brand New')
//           .trim()
//           .toLowerCase()
//           .includes('brand new'),
//       );
//     } else if (activeFilter === 'preOwned') {
//       filtered = base.filter((p) => {
//         const cond = String(p?.condition || 'Brand New')
//           .trim()
//           .toLowerCase();
//         return !cond.includes('brand new') && !cond.includes('mint condition');
//       });
//     } else if (activeFilter === 'mintCondition') {
//       filtered = base.filter((p) =>
//         String(p?.condition || '')
//           .trim()
//           .toLowerCase()
//           .includes('mint condition'),
//       );
//     } else {
//       filtered = base;
//     }

//     // Float boosted products to the top
//     if (boostedProductIds.length === 0) return filtered;
//     const boosted = filtered.filter((p) =>
//       boostedProductIds.includes(String(p._id)),
//     );
//     const rest = filtered.filter(
//       (p) => !boostedProductIds.includes(String(p._id)),
//     );
//     return [...boosted, ...rest];
//   }, [products, currentProductId, activeFilter, boostedProductIds]);

//   const visible = useMemo(
//     () =>
//       filteredProducts.slice(
//         page * CARDS_PER_PAGE,
//         page * CARDS_PER_PAGE + CARDS_PER_PAGE,
//       ),
//     [filteredProducts, page],
//   );

//   useEffect(() => {
//     setPage(0);
//   }, [activeFilter]);

//   const next = () => {
//     if ((page + 1) * CARDS_PER_PAGE < filteredProducts.length)
//       setPage((p) => p + 1);
//   };
//   const prev = () => {
//     if (page > 0) setPage((p) => p - 1);
//   };

//   return (
//     <section className="w-full pt-3 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-4 ">
//       <div className=" mx-auto">
//         {/* HEADER */}
//         {/* <div className="flex flex-row items-center justify-between gap-2 mb-2 sm:mb-3"> */}
//         <div className="flex flex-row items-center justify-between gap-2 mb-2 md:mb-3">
//           <h1 className="text-lg sm:text-2xl lg:text-3xl text-black">
//             <span className="font-semibold">Similar Buy </span>
//             <span className="font-bold text-[#F97316]">Products</span>
//           </h1>
//           {/* {filteredProducts.length > 5 && (
//             <button
//               onClick={() => router.push('/products?type=Sell')}
//               className="bg-[#F97316] text-white font-bold px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm w-fit whitespace-nowrap"
//             >
//               View All
//             </button>
//           )} */}
//           {filteredProducts.length > 4 && (
//             <button
//               onClick={() => router.push('/products?type=Sell')}
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

//         {/* GRID */}
//         <div className="flex overflow-x-auto sm:overflow-visible gap-3 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
//           {loading ? (
//             Array.from({ length: CARDS_PER_PAGE }).map((_, idx) => (
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
//           ) : visible.length === 0 ? (
//             <p className="text-sm text-gray-500 col-span-full py-8 text-center">
//               No similar products found.
//             </p>
//           ) : (
//             // visible.map((item) => {
//             //   const base = getRentalListingAmount(item);
//             //   const offer = offersByProduct[String(item?._id)];
//             visible.map((item) => {
//               const rawBase = getRentalListingAmount(item);
//               // Custom/manual multi-variant sell listings may leave the
//               // top-level price/salesConfiguration empty (each variant
//               // carries its own sellPrice). Fall back to the first variant
//               // that actually has a sell price, so the card doesn't show ₹0.
//               const base =
//                 !rawBase || rawBase <= 0
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
//               // const offer = offersByProduct[String(item?._id)];
//               // const discount = Number(offer?.discountPercent || 0);
//               // const hasOffer = !!offer && discount > 0;
//               const offer = offersByProduct[String(item?._id)];
//               const discount = resolveDiscountPercent(offer);
//               const hasOffer = !!offer && discount > 0;
//               const price = hasOffer
//                 ? Math.max(0, Math.round(base - (base * discount) / 100))
//                 : base;
//               const old = base;
//               const inStock = Number(item?.stock || 0) > 0;
//               const totalReviews = Number(item?.numReviews || 0);
//               const averageRating = Number(item?.averageRating || 0);

//               return (
//                 <div
//                   key={item._id}
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.03] w-[46%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
//                 >
//                   {/* IMAGE SECTION */}
//                   {/* <div className="relative pt-1 px-1 overflow-hidden">
//                       <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                         Bestseller
//                       </span>

//                       <img */}
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
//                       src={
//                         item?.image ||
//                         'https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=700&q=80'
//                       }
//                       alt={item?.productName || 'product'}
//                       // h-44 sm:h-48
//                       className="w-full aspect-square object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
//                     />

//                     {/* bottom-left: stock/delivery status */}
//                     <div className="absolute bottom-3 left-3">
//                       {inStock ? (
//                         <span className="flex items-center gap-1 text-xs bg-white/95 border border-gray-200 shadow-sm px-2 py-1 rounded-full">
//                           <Truck size={12} className="text-blue-500" />
//                           {getDeliveryLabel(item)}
//                         </span>
//                       ) : (
//                         <span className="flex items-center gap-1 text-xs bg-white/95 text-red-500 border border-gray-200 shadow-sm px-2 py-1 rounded-full">
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
//                         {item?.condition?.trim() || 'Brand New'}
//                       </span>
//                     </div>

//                     {/* PRICE */}
//                     <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
//                       <div>
//                         {/* <span className="font-bold text-sm sm:text-xl leading-none">
//                             ₹{price}
//                           </span>
//                           {hasOffer && (
//                             <span className="ml-1 sm:ml-2 text-gray-400 text-[10px] sm:text-xs line-through">
//                               ₹{old}
//                             </span>
//                           )} */}
//                         <span className="font-bold text-sm sm:text-xl leading-none">
//                           ₹{formatPrice(price)}
//                         </span>
//                         {hasOffer && (
//                           <span className="ml-1 sm:ml-2 text-gray-400 text-[10px] sm:text-xs line-through">
//                             ₹{formatPrice(old)}
//                           </span>
//                         )}
//                       </div>
//                       {hasOffer && (
//                         <span className="text-[8px] sm:text-[11px] text-orange-500 border border-orange-200 rounded-full px-1.5 sm:px-2 py-0.5">
//                           {discount % 1 === 0 ? discount : discount.toFixed(1)}%
//                           Off
//                         </span>
//                       )}
//                     </div>

//                     {/* BUTTON */}
//                     {/* <button
//                         onClick={() =>
//                           router.push(`/buy-product-details/${item?._id}`)
//                         }
//                         className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
//                       >
//                         Buy Now
//                       </button> */}
//                     {item.stock <= 0 ? (
//                       <div className="flex gap-2">
//                         <Link
//                           href={`/buy-product-details/${item._id}`}
//                           className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-center text-xs sm:text-sm font-medium border border-gray-300 hover:bg-gray-50"
//                         >
//                           Details
//                         </Link>

//                         <button
//                           onClick={(e) => handleNotifyMe(e, item._id)}
//                           disabled={notifyingIds.has(String(item._id))}
//                           className={`flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition
//         ${
//           notifiedIds.has(String(item._id))
//             ? 'bg-orange-500 text-white'
//             : 'border border-orange-400 text-orange-500 hover:bg-orange-50'
//         }`}
//                         >
//                           {notifyingIds.has(String(item._id))
//                             ? '...'
//                             : notifiedIds.has(String(item._id))
//                               ? 'Waitlisted'
//                               : 'Notify Me'}
//                         </button>
//                       </div>
//                     ) : (
//                       <div className="flex gap-2">
//                         <Link
//                           href={`/buy-product-details/${item._id}`}
//                           className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-center text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50"
//                         >
//                           View
//                         </Link>

//                         <button
//                           onClick={(e) => {
//                             e.preventDefault();

//                             dispatch(
//                               addToCart({
//                                 productId: item._id,
//                                 variantId: null,
//                                 variantName: '',
//                                 quantity: 1,
//                                 rentalMonths: 1,
//                                 tenureUnit: 'month',
//                                 pricePerDay: price,
//                                 originalPricePerDay: base,
//                                 title: item.productName,
//                                 image: item.image,
//                                 productType: 'Sell',
//                                 refundableDeposit: 0,
//                                 condition: item?.condition || 'Brand New',
//                                 offer: offer || null,
//                               }),
//                               //     );

//                               //     router.push('/cart');
//                               //   }}
//                               //   className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
//                               // >
//                               //   Cart
//                             );
//                           }}
//                           className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
//                         >
//                           Cart
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* ARROWS */}
//         {/* <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-10">
//             <button
//               onClick={prev}
//               className="p-2 sm:p-3 border rounded-full hover:bg-black hover:text-white"
//             >
//               <ChevronLeft size={18} />
//             </button>
//             <button
//               onClick={next}
//               className="p-2 sm:p-3 border hover:bg-black hover:text-white rounded-full"
//             >
//               <ChevronRight size={18} />
//             </button>
//           </div> */}
//       </div>
//     </section>
//   );
// }

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Package,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import {
  apiGetStorefrontVendorProducts,
  apiGetPublicActiveOffers,
  apiGetMyWishlist,
  apiToggleWishlist,
  apiGetActiveBoosts,
} from '@/lib/api';
import { getRentalListingAmount } from '@/lib/rentalPriceDisplay';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { addToCart } from '@/store/slices/cartSlice';
import { useDispatch } from 'react-redux';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/contexts/ToastContext';
import { apiRequestStockNotify } from '@/lib/api';
const CARDS_PER_PAGE = 4;

const formatPrice = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('en-IN');
};

const getDeliveryLabel = (product) => {
  const n = Number(product?.logisticsVerification?.deliveryTimelineValue);
  const rawUnit = String(
    product?.logisticsVerification?.deliveryTimelineUnit || 'Days',
  ).trim();
  if (Number.isFinite(n) && n > 0) return `${n} ${rawUnit || 'Days'}`;
  return '2-4 days';
};

const PLATFORM_FEE_PERCENT = 15;
// Admin offers store a % of the platform fee removed; convert that into a
// plain % of product price so it can be used exactly like a vendor offer's
// discountPercent everywhere below.
function resolveDiscountPercent(offer) {
  if (!offer) return 0;
  if (offer.source === 'admin') {
    return Math.min(
      PLATFORM_FEE_PERCENT,
      Number(offer.platformFeeReductionPercent || 0),
    );
  }
  return Number(offer.discountPercent || 0);
}

export default function BuySimilarProducts({ currentProductId }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [products, setProducts] = useState([]);
  const [offersByProduct, setOffersByProduct] = useState({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wishedIds, setWishedIds] = useState([]);
  const [togglingId, setTogglingId] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get('filter') || 'all';
  const dispatch = useDispatch();
  const { openAuth } = useAuthModal();
  const { pushToast } = useToast();

  const [boostedProductIds, setBoostedProductIds] = useState([]);
  const [notifyingIds, setNotifyingIds] = useState(new Set());

  const [notifiedIds, setNotifiedIds] = useState(() => {
    if (typeof window === 'undefined') return new Set();

    try {
      const raw = localStorage.getItem('buy_notified_ids');
      return new Set(JSON.parse(raw || '[]'));
    } catch {
      return new Set();
    }
  });

  // ── fetch products ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiGetStorefrontVendorProducts('limit=200'),
      apiGetPublicActiveOffers(),
      apiGetActiveBoosts().catch(() => ({ data: { boostedProductIds: [] } })),
    ])
      .then(([pRes, oRes, boostRes]) => {
        if (!mounted) return;
        const all = Array.isArray(pRes?.data?.products)
          ? pRes.data.products
          : [];
        setProducts(all.filter((p) => String(p?.type) === 'Sell'));

        const map = {};
        (oRes?.data?.offers || []).forEach((o) => {
          const pid = String(o.productId?._id || o.productId);
          map[pid] = o;
        });
        setOffersByProduct(map);
        setBoostedProductIds(boostRes.data?.boostedProductIds || []);
      })
      .catch(() => {
        if (mounted) {
          setProducts([]);
          setOffersByProduct({});
          setBoostedProductIds([]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  // ── fetch wishlist ───────────────────────────────────────────────
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
        if (mounted) setWishedIds([]);
      });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // ── helpers ──────────────────────────────────────────────────────
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

  const handleNotifyMe = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    const pid = String(productId);

    if (notifiedIds.has(pid)) {
      pushToast("You're already on the waitlist.", 'info');
      return;
    }

    setNotifyingIds((prev) => new Set(prev).add(pid));

    try {
      await apiRequestStockNotify(productId);

      setNotifiedIds((prev) => {
        const next = new Set(prev).add(pid);

        localStorage.setItem('buy_notified_ids', JSON.stringify([...next]));

        return next;
      });

      pushToast(
        'We will notify you when this product is back in stock.',
        'success',
      );
    } catch {
      pushToast('Something went wrong.', 'error');
    } finally {
      setNotifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(pid);
        return next;
      });
    }
  };

  // const visible = useMemo(
  //   () =>
  //     products.slice(
  //       page * CARDS_PER_PAGE,
  //       page * CARDS_PER_PAGE + CARDS_PER_PAGE,
  //     ),
  //   [products, page],
  // );

  // const next = () => {
  //   if ((page + 1) * CARDS_PER_PAGE < products.length) setPage((p) => p + 1);
  // };
  const filteredProducts = useMemo(() => {
    const base = currentProductId
      ? products.filter((p) => String(p?._id) !== String(currentProductId))
      : products;

    let filtered;
    if (activeFilter === 'brandNew') {
      filtered = base.filter((p) =>
        String(p?.condition || 'Brand New')
          .trim()
          .toLowerCase()
          .includes('brand new'),
      );
    } else if (activeFilter === 'preOwned') {
      filtered = base.filter((p) => {
        const cond = String(p?.condition || 'Brand New')
          .trim()
          .toLowerCase();
        return !cond.includes('brand new') && !cond.includes('mint condition');
      });
    } else if (activeFilter === 'mintCondition') {
      filtered = base.filter((p) =>
        String(p?.condition || '')
          .trim()
          .toLowerCase()
          .includes('mint condition'),
      );
    } else {
      filtered = base;
    }

    // Float boosted products to the top
    //   if (boostedProductIds.length === 0) return filtered;
    //   const boosted = filtered.filter((p) =>
    //     boostedProductIds.includes(String(p._id)),
    //   );
    //   const rest = filtered.filter(
    //     (p) => !boostedProductIds.includes(String(p._id)),
    //   );
    //   return [...boosted, ...rest];
    // }, [products, currentProductId, activeFilter, boostedProductIds]);
    // Admin "Featured" items always come first, ordered by priorityRank.
    // Only counts if status is 'live' — an 'inactive' toggle in the admin
    // featured table excludes it here automatically.
    const isFeaturedActive = (p) =>
      p?.featured?.enabled === true && p?.featured?.status === 'live';
    const featured = filtered
      .filter(isFeaturedActive)
      .sort(
        (a, b) =>
          Number(a?.featured?.priorityRank || 0) -
          Number(b?.featured?.priorityRank || 0),
      );
    const nonFeatured = filtered.filter((p) => !isFeaturedActive(p));

    // Then float boosted products to the top of the remaining (non-featured) list.
    if (boostedProductIds.length === 0) return [...featured, ...nonFeatured];
    const boosted = nonFeatured.filter((p) =>
      boostedProductIds.includes(String(p._id)),
    );
    const rest = nonFeatured.filter(
      (p) => !boostedProductIds.includes(String(p._id)),
    );
    return [...featured, ...boosted, ...rest];
  }, [products, currentProductId, activeFilter, boostedProductIds]);

  const visible = useMemo(
    () =>
      filteredProducts.slice(
        page * CARDS_PER_PAGE,
        page * CARDS_PER_PAGE + CARDS_PER_PAGE,
      ),
    [filteredProducts, page],
  );

  useEffect(() => {
    setPage(0);
  }, [activeFilter]);

  const next = () => {
    if ((page + 1) * CARDS_PER_PAGE < filteredProducts.length)
      setPage((p) => p + 1);
  };
  const prev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  return (
    <section className="w-full pt-3 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-4 ">
      <div className=" mx-auto">
        {/* HEADER */}
        {/* <div className="flex flex-row items-center justify-between gap-2 mb-2 sm:mb-3"> */}
        <div className="flex flex-row items-center justify-between gap-2 mb-2 md:mb-3">
          <h1 className="text-lg sm:text-2xl lg:text-3xl text-black">
            <span className="font-semibold">Similar Buy </span>
            <span className="font-bold text-[#F97316]">Products</span>
          </h1>
          {/* {filteredProducts.length > 5 && (
            <button
              onClick={() => router.push('/products?type=Sell')}
              className="bg-[#F97316] text-white font-bold px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm w-fit whitespace-nowrap"
            >
              View All
            </button>
          )} */}
          {filteredProducts.length > 4 && (
            <button
              onClick={() => router.push('/products?type=Sell')}
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

        {/* GRID */}
        <div className="flex overflow-x-auto sm:overflow-visible gap-3 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
          {loading ? (
            Array.from({ length: CARDS_PER_PAGE }).map((_, idx) => (
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
          ) : visible.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full py-8 text-center">
              No similar products found.
            </p>
          ) : (
            // visible.map((item) => {
            //   const base = getRentalListingAmount(item);
            //   const offer = offersByProduct[String(item?._id)];
            visible.map((item) => {
              const rawBase = getRentalListingAmount(item);
              // Custom/manual multi-variant sell listings may leave the
              // top-level price/salesConfiguration empty (each variant
              // carries its own sellPrice). Fall back to the first variant
              // that actually has a sell price, so the card doesn't show ₹0.
              const base =
                !rawBase || rawBase <= 0
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
              // const offer = offersByProduct[String(item?._id)];
              // const discount = Number(offer?.discountPercent || 0);
              // const hasOffer = !!offer && discount > 0;
              const offer = offersByProduct[String(item?._id)];
              const discount = resolveDiscountPercent(offer);
              const hasOffer = !!offer && discount > 0;
              const price = hasOffer
                ? Math.max(0, Math.round(base - (base * discount) / 100))
                : base;
              const old = base;
              const inStock = Number(item?.stock || 0) > 0;
              const totalReviews = Number(item?.numReviews || 0);
              const averageRating = Number(item?.averageRating || 0);

              return (
                <div
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.03] w-[46%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
                >
                  {/* IMAGE SECTION */}
                  {/* <div className="relative pt-1 px-1 overflow-hidden">
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                        Bestseller
                      </span>

                      <img */}
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
                    )} */}
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
                      src={
                        item?.image ||
                        'https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=700&q=80'
                      }
                      alt={item?.productName || 'product'}
                      // h-44 sm:h-48
                      className="w-full aspect-square object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* bottom-left: stock/delivery status */}
                    <div className="absolute bottom-3 left-3">
                      {inStock ? (
                        <span className="flex items-center gap-1 text-xs bg-white/95 border border-gray-200 shadow-sm px-2 py-1 rounded-full">
                          <Truck size={12} className="text-blue-500" />
                          {getDeliveryLabel(item)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-white/95 text-red-500 border border-gray-200 shadow-sm px-2 py-1 rounded-full">
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
                        {item?.condition?.trim() || 'Brand New'}
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                      <div>
                        {/* <span className="font-bold text-sm sm:text-xl leading-none">
                            ₹{price}
                          </span>
                          {hasOffer && (
                            <span className="ml-1 sm:ml-2 text-gray-400 text-[10px] sm:text-xs line-through">
                              ₹{old}
                            </span>
                          )} */}
                        <span className="font-bold text-sm sm:text-xl leading-none">
                          ₹{formatPrice(price)}
                        </span>
                        {hasOffer && (
                          <span className="ml-1 sm:ml-2 text-gray-400 text-[10px] sm:text-xs line-through">
                            ₹{formatPrice(old)}
                          </span>
                        )}
                      </div>
                      {hasOffer && (
                        <span className="text-[8px] sm:text-[11px] text-orange-500 border border-orange-200 rounded-full px-1.5 sm:px-2 py-0.5">
                          {discount % 1 === 0 ? discount : discount.toFixed(1)}%
                          Off
                        </span>
                      )}
                    </div>

                    {/* BUTTON */}
                    {/* <button
                        onClick={() =>
                          router.push(`/buy-product-details/${item?._id}`)
                        }
                        className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl text-sm font-medium transition bg-orange-500 text-white hover:bg-orange-600"
                      >
                        Buy Now
                      </button> */}
                    {item.stock <= 0 ? (
                      <div className="flex gap-2">
                        <Link
                          href={`/buy-product-details/${item._id}`}
                          className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-center text-xs sm:text-sm font-medium border border-gray-300 hover:bg-gray-50"
                        >
                          Details
                        </Link>

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
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href={`/buy-product-details/${item._id}`}
                          className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-center text-xs sm:text-sm font-medium border border-orange-400 text-orange-500 hover:bg-orange-50"
                        >
                          View
                        </Link>

                        <button
                          onClick={(e) => {
                            e.preventDefault();

                            dispatch(
                              addToCart({
                                productId: item._id,
                                variantId: null,
                                variantName: '',
                                quantity: 1,
                                rentalMonths: 1,
                                tenureUnit: 'month',
                                pricePerDay: price,
                                originalPricePerDay: base,
                                title: item.productName,
                                image: item.image,
                                productType: 'Sell',
                                refundableDeposit: 0,
                                condition: item?.condition || 'Brand New',
                                offer: offer || null,
                              }),
                              //     );

                              //     router.push('/cart');
                              //   }}
                              //   className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
                              // >
                              //   Cart
                            );
                          }}
                          className="flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Cart
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ARROWS */}
        {/* <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-10">
            <button
              onClick={prev}
              className="p-2 sm:p-3 border rounded-full hover:bg-black hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="p-2 sm:p-3 border hover:bg-black hover:text-white rounded-full"
            >
              <ChevronRight size={18} />
            </button>
          </div> */}
      </div>
    </section>
  );
}
