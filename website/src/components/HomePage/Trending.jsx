// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
// import {
//   apiGetStorefrontVendorProducts,
//   apiGetPublicActiveOffers,
//   apiGetMyWishlist,
//   apiToggleWishlist,
//   apiGetServiceProducts,
//   apiRequestStockNotify,
//   apiGetProductById,
//   apiGetPublicLocationSettings,
//   apiGetActiveBoosts,
// } from '@/lib/api';
// import {
//   getRentalListingAmount,
//   getRentalListingSuffix,
//   getProductDeliveryEtaLabel,
// } from '@/lib/rentalPriceDisplay';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { addToCart } from '@/store/slices/cartSlice';
// import { useAuthModal } from '@/contexts/AuthModalContext';
// import { useToast } from '@/contexts/ToastContext';

// import {
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   Star,
//   Truck,
//   Package,
// } from 'lucide-react';

// // const formatPercent = (n) => {
// //   const num = Number(n || 0);
// //   if (!Number.isFinite(num) || num <= 0) return '0%';
// //   const rounded = Math.round(num * 10) / 10;
// //   return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
// // };
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

// // Admin offers reduce the platform's own fee cut and pass that saving
// // straight to the customer — the vendor still gets the full base price.
// // Vendor offers cut the price out of the vendor's own payout (unchanged).
// const PLATFORM_FEE_PERCENT = 15;
// const computeOfferPricing = (offer, base) => {
//   if (!offer || !base) {
//     return { discountAmount: 0, finalPrice: base, displayPercent: 0 };
//   }
//   // if (offer.source === 'admin') {
//   //   const reduction = Number(offer.platformFeeReductionPercent || 0);
//   //   if (!reduction) {
//   //     return { discountAmount: 0, finalPrice: base, displayPercent: 0 };
//   //   }
//   //   const defaultFeeAmount = base * (PLATFORM_FEE_PERCENT / 100);
//   //   const effectiveFeePercent = Math.max(
//   //     0,
//   //     PLATFORM_FEE_PERCENT * (1 - reduction / 100),
//   //   );
//   //   const effectiveFeeAmount = base * (effectiveFeePercent / 100);
//   //   const discountAmount = Math.round(defaultFeeAmount - effectiveFeeAmount);
//   //   const finalPrice = Math.max(0, base - discountAmount);
//   //   const displayPercent = base > 0 ? (discountAmount / base) * 100 : 0;
//   //   return { discountAmount, finalPrice, displayPercent };
//   // }

//   if (offer.source === 'admin') {
//     // Stored value IS the % of product price admin entered — no
//     // conversion needed, so the customer sees the exact number admin typed.
//     const priceBasedPercent = Math.min(
//       PLATFORM_FEE_PERCENT,
//       Number(offer.platformFeeReductionPercent || 0),
//     );
//     if (!priceBasedPercent) {
//       return { discountAmount: 0, finalPrice: base, displayPercent: 0 };
//     }
//     const discountAmount = Math.round(base * (priceBasedPercent / 100));
//     const finalPrice = Math.max(0, base - discountAmount);
//     return {
//       discountAmount,
//       finalPrice,
//       displayPercent: priceBasedPercent,
//     };
//   }
//   const discountPercent = Number(offer.discountPercent || 0);
//   const discountAmount = Math.round((base * discountPercent) / 100);
//   const finalPrice = Math.max(0, base - discountAmount);
//   return { discountAmount, finalPrice, displayPercent: discountPercent };
// };

// const Trending = () => {
//   const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
//   const [page, setPage] = useState(0);
//   const [activeTab, setActiveTab] = useState('All');
//   const [products, setProducts] = useState([]);
//   const [offersByProduct, setOffersByProduct] = useState({});
//   const [wishedIds, setWishedIds] = useState([]);
//   const [togglingId, setTogglingId] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [locVersion, setLocVersion] = useState(0);
//   const [activeFilter, setActiveFilter] = useState('');
//   const [serviceProducts, setServiceProducts] = useState([]);
//   const [servicesLoading, setServicesLoading] = useState(false);
//   const [boostedProductIds, setBoostedProductIds] = useState([]);
//   const [locationSourceFlags, setLocationSourceFlags] = useState({
//     rentEnabled: true,
//     buyEnabled: true,
//     serviceEnabled: true,
//   });
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { pushToast } = useToast();

//   const { openAuth } = useAuthModal();
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

//   const handleNotifyMe = async (e, productId) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       openAuth('login');
//       return;
//     }

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

//   useEffect(() => {
//     if (typeof window === 'undefined') return undefined;
//     const onLocChange = () => {
//       setPage(0);
//       setActiveTab('All');
//       setLocVersion((v) => v + 1);
//     };

//     window.addEventListener('rn_delivery_location_changed', onLocChange);
//     const onStorage = (e) => {
//       if (e?.key !== 'rn_delivery_location') return;
//       onLocChange();
//     };
//     window.addEventListener('storage', onStorage);

//     return () => {
//       window.removeEventListener('rn_delivery_location_changed', onLocChange);
//       window.removeEventListener('storage', onStorage);
//     };
//   }, []);

//   useEffect(() => {
//     const isActiveTabDisabled =
//       (activeTab === 'Rent' && !locationSourceFlags.rentEnabled) ||
//       (activeTab === 'Sale' && !locationSourceFlags.buyEnabled) ||
//       (activeTab === 'Services' && !locationSourceFlags.serviceEnabled);

//     const enabledSourceCount = [
//       locationSourceFlags.rentEnabled,
//       locationSourceFlags.buyEnabled,
//       locationSourceFlags.serviceEnabled,
//     ].filter(Boolean).length;

//     if (enabledSourceCount === 1) {
//       // Only one source available — lock straight to it, no tabs needed.
//       const onlyTab = locationSourceFlags.rentEnabled
//         ? 'Rent'
//         : locationSourceFlags.buyEnabled
//           ? 'Sale'
//           : 'Services';
//       if (activeTab !== onlyTab) {
//         setActiveTab(onlyTab);
//         setPage(0);
//       }
//     } else if (isActiveTabDisabled) {
//       setActiveTab('All');
//       setPage(0);
//     }
//   }, [locationSourceFlags, activeTab]);

//   // useEffect(() => {
//   //   if (activeTab !== 'Services') return;

//   //   setServicesLoading(true);
//   //   let queryString = '';
//   //   try {
//   //     const raw = localStorage.getItem('rn_delivery_location');
//   //     if (raw) {
//   //       const parsed = JSON.parse(raw);
//   //       const lat = Number(parsed?.lat);
//   //       const lon = Number(parsed?.lon);
//   //       if (Number.isFinite(lat) && Number.isFinite(lon)) {
//   //         queryString = `userLat=${lat}&userLng=${lon}`;
//   //       }
//   //     }
//   //   } catch {}

//   //   apiGetServiceProducts(queryString)
//   //     .then((res) => setServiceProducts(res.data?.products || []))
//   //     .catch(() => setServiceProducts([]))
//   //     .finally(() => setServicesLoading(false));
//   // }, [activeTab, locVersion]);

//   useEffect(() => {
//     if (activeTab !== 'Services') return;

//     setServicesLoading(true);

//     apiGetServiceProducts()
//       .then((res) => setServiceProducts(res.data?.products || []))
//       .catch(() => setServiceProducts([]))
//       .finally(() => setServicesLoading(false));
//   }, [activeTab, locVersion]);

//   useEffect(() => {
//     let mounted = true;
//     apiGetPublicLocationSettings()
//       .then((res) => {
//         if (!mounted) return;
//         setLocationSourceFlags({
//           rentEnabled: res.data?.rentEnabled !== false,
//           buyEnabled: res.data?.buyEnabled !== false,
//           serviceEnabled: res.data?.serviceEnabled !== false,
//         });
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setLocationSourceFlags({
//           rentEnabled: true,
//           buyEnabled: true,
//           serviceEnabled: true,
//         });
//       });
//     return () => {
//       mounted = false;
//     };
//   }, [locVersion]);

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
//         setProducts(allProducts);

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
//   }, [locVersion]);
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

//   const cardsPerPage = 8;

//   // const filteredProducts =
//   //   activeTab === 'All'
//   //     ? products
//   //     : activeTab === 'Rent'
//   //       ? products.filter((p) => String(p.type || '') === 'Rental')
//   //       : activeTab === 'Sale'
//   //         ? products.filter((p) => String(p.type || '') === 'Sell')
//   //         : products.filter((p) =>
//   //             String(p.category || '')
//   //               .toLowerCase()
//   //               .includes('service'),
//   //           );
//   const filteredProducts = products
//     .filter((p) => {
//       if (activeTab === 'Rent') {
//         return String(p.type || '') === 'Rental';
//       }
//       if (activeTab === 'Sale') {
//         return String(p.type || '') === 'Sell';
//       }
//       if (activeTab === 'Services') {
//         return false; // services tab uses separate serviceProducts array now
//       }
//       return true; // All tab — show rent + sell only, services shown separately below
//     })
//     .filter((p) => {
//       if (activeFilter === 'Available Today') {
//         const createdAt = new Date(p.createdAt);
//         const today = new Date();

//         return (
//           createdAt.getDate() === today.getDate() &&
//           createdAt.getMonth() === today.getMonth() &&
//           createdAt.getFullYear() === today.getFullYear()
//         );
//       }

//       if (activeFilter === 'Under ₹500') {
//         return getRentalListingAmount(p) <= 500;
//       }

//       return true;
//     })

//     // .sort((a, b) => {
//     //   if (activeFilter === 'Top Rated') {
//     //     return Number(b.averageRating || 0) - Number(a.averageRating || 0);
//     //   }
//     //   return 0;
//     // });
//     .sort((a, b) => {
//       if (activeFilter === 'Top Rated') {
//         const rA = Number(a.averageRating ?? a.rating ?? 0);
//         const rB = Number(b.averageRating ?? b.rating ?? 0);
//         return rB - rA;
//       }
//       return 0;
//     });

//   // const filteredServiceProducts = serviceProducts
//   //   .filter((s) => {
//   //     if (activeFilter === 'Available Today') {
//   //       const createdAt = new Date(s.createdAt);
//   //       const today = new Date();
//   //       return (
//   //         createdAt.getDate() === today.getDate() &&
//   //         createdAt.getMonth() === today.getMonth() &&
//   //         createdAt.getFullYear() === today.getFullYear()
//   //       );
//   //     }
//   //     if (activeFilter === 'Under ₹500') {
//   //       const price = Number(
//   //         String(s.price ?? s.startingPrice ?? '').replace(/[^0-9.]/g, ''),
//   //       );
//   //       return Number.isFinite(price) && price <= 500;
//   //     }
//   //     return true;
//   //   })
//   //   .sort((a, b) => {
//   //     if (activeFilter === 'Top Rated') {
//   //       const rA = Number(a.averageRating ?? a.rating ?? 0);
//   //       const rB = Number(b.averageRating ?? b.rating ?? 0);
//   //       return rB - rA;
//   //     }
//   //     return 0;
//   //   });

//   const filteredServiceProducts = (() => {
//     const base = serviceProducts
//       .filter((s) => {
//         if (activeFilter === 'Available Today') {
//           const createdAt = new Date(s.createdAt);
//           const today = new Date();
//           return (
//             createdAt.getDate() === today.getDate() &&
//             createdAt.getMonth() === today.getMonth() &&
//             createdAt.getFullYear() === today.getFullYear()
//           );
//         }
//         if (activeFilter === 'Under ₹500') {
//           const price = Number(
//             String(s.price ?? s.startingPrice ?? '').replace(/[^0-9.]/g, ''),
//           );
//           return Number.isFinite(price) && price <= 500;
//         }
//         return true;
//       })
//       .sort((a, b) => {
//         if (activeFilter === 'Top Rated') {
//           const rA = Number(a.averageRating ?? a.rating ?? 0);
//           const rB = Number(b.averageRating ?? b.rating ?? 0);
//           return rB - rA;
//         }
//         return 0;
//       });

//     // Admin "Featured" services always come first, ordered by priorityRank.
//     // Only counts if status is 'live' — an 'inactive' toggle in the admin
//     // featured table excludes it here automatically.
//     const isFeaturedActive = (s) =>
//       s?.featured?.enabled === true && s?.featured?.status === 'live';
//     const featured = base
//       .filter(isFeaturedActive)
//       .sort(
//         (a, b) =>
//           Number(a?.featured?.priorityRank || 0) -
//           Number(b?.featured?.priorityRank || 0),
//       );
//     const rest = base.filter((s) => !isFeaturedActive(s));

//     return [...featured, ...rest];
//   })();

//   // const allTabMerged =
//   //   activeTab === 'All' && activeFilter === 'Top Rated'
//   //     ? [...filteredProducts].sort(
//   //         (a, b) =>
//   //           Number(b.averageRating ?? b.rating ?? 0) -
//   //           Number(a.averageRating ?? a.rating ?? 0),
//   //       )
//   //     : null;

//   // const visibleProducts = filteredProducts.slice(
//   //   page * cardsPerPage,
//   //   page * cardsPerPage + cardsPerPage,
//   // );

//   // const sortedFilteredProducts = (() => {
//   //   // First apply existing sort (Top Rated filter etc.)
//   //   const baseSorted =
//   //     activeTab === 'All' && activeFilter === 'Top Rated'
//   //       ? [...filteredProducts].sort(
//   //           (a, b) =>
//   //             Number(b.averageRating ?? b.rating ?? 0) -
//   //             Number(a.averageRating ?? a.rating ?? 0),
//   //         )
//   //       : [...filteredProducts];

//   //   // Then always float boosted products to the very top
//   //   if (boostedProductIds.length === 0) return baseSorted;
//   //   const boosted = baseSorted.filter((p) =>
//   //     boostedProductIds.includes(String(p._id)),
//   //   );
//   //   const rest = baseSorted.filter(
//   //     (p) => !boostedProductIds.includes(String(p._id)),
//   //   );
//   //   return [...boosted, ...rest];
//   // })();
//   const sortedFilteredProducts = (() => {
//     // First apply existing sort (Top Rated filter etc.)
//     const baseSorted =
//       activeTab === 'All' && activeFilter === 'Top Rated'
//         ? [...filteredProducts].sort(
//             (a, b) =>
//               Number(b.averageRating ?? b.rating ?? 0) -
//               Number(a.averageRating ?? a.rating ?? 0),
//           )
//         : [...filteredProducts];

//     // Admin "Featured" items always come first, ordered by priorityRank.
//     // Only counts if status is 'live' — an 'inactive' toggle in the admin
//     // featured table excludes it here automatically.
//     const isFeaturedActive = (p) =>
//       p?.featured?.enabled === true && p?.featured?.status === 'live';
//     const featured = baseSorted
//       .filter(isFeaturedActive)
//       .sort(
//         (a, b) =>
//           Number(a?.featured?.priorityRank || 0) -
//           Number(b?.featured?.priorityRank || 0),
//       );
//     const nonFeatured = baseSorted.filter((p) => !isFeaturedActive(p));

//     // Then float boosted products to the top of the remaining (non-featured) list.
//     if (boostedProductIds.length === 0) return [...featured, ...nonFeatured];
//     const boosted = nonFeatured.filter((p) =>
//       boostedProductIds.includes(String(p._id)),
//     );
//     const rest = nonFeatured.filter(
//       (p) => !boostedProductIds.includes(String(p._id)),
//     );
//     return [...featured, ...boosted, ...rest];
//   })();

//   const visibleProducts = sortedFilteredProducts.slice(
//     page * cardsPerPage,
//     page * cardsPerPage + cardsPerPage,
//   );

//   const [shouldScroll, setShouldScroll] = useState(false);

//   useEffect(() => {
//     if (!shouldScroll) return;
//     document
//       .querySelector('#trending-section')
//       ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     setShouldScroll(false);
//   }, [page, shouldScroll]);

//   const nextSlide = () => {
//     if ((page + 1) * cardsPerPage < sortedFilteredProducts.length) {
//       setPage((p) => p + 1);
//       setShouldScroll(true);
//     }
//   };

//   const prevSlide = () => {
//     if (page > 0) {
//       setPage((p) => p - 1);
//       setShouldScroll(true);
//     }
//   };
//   const allSourcesDisabled =
//     !locationSourceFlags.rentEnabled &&
//     !locationSourceFlags.buyEnabled &&
//     !locationSourceFlags.serviceEnabled;

//   if (allSourcesDisabled) {
//     return null;
//   }

//   return (
//     // <section id="trending-section" className="w-full py-16 px-4 ">
//     // <section
//     //   id="trending-section"
//     //   className="w-full py-8 sm:py-10 md:py-16 px-4"
//     // >
//     <section
//       id="trending-section"
//       className="w-full pt-3 sm:pt-4 md:pt-6 pb-4 sm:pb-4 md:pb-6 px-4"
//     >
//       <div className=" mx-auto">
//         {/* HEADER */}
//         <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
//           <h1 className="text-xl sm:text-2xl md:text-3xl">
//             <span className="font-semibold text-black">Trending </span>
//             <span className="font-bold text-[#F97316]">Near You!</span>
//           </h1>

//           {/* <Link
//             href="/products"
//             className="group px-4 sm:px-5 py-2 rounded-full bg-[#F97316] text-white text-[10px] sm:text-sm font-bold transition flex items-center gap-1"
//           >
//             View All
//             <ChevronRight
//               size={14}
//               className="transition-transform duration-300 group-hover:translate-x-1"
//             />
//           </Link> */}
//           <Link
//             href="/products"
//             className="group px-2 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#F97316] text-white text-[10px] sm:text-sm font-bold transition flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
//           >
//             View All
//             <ChevronRight
//               size={12}
//               className="sm:hidden transition-transform duration-300 group-hover:translate-x-1"
//             />
//             <ChevronRight
//               size={14}
//               className="hidden sm:block transition-transform duration-300 group-hover:translate-x-1"
//             />
//           </Link>
//         </div>

//         {/* DESCRIPTION */}
//         {/* <p className="text-gray-500 mb-6 text-sm sm:text-base">
//           Explore the most popular rentals, verified used electronics, and
//           top-rated services in your neighborhood
//         </p> */}

//         {/* CATEGORY + FILTERS */}
//         {/* <div className="flex justify-between items-center mb-1.5 flex-wrap gap-4"> */}
//         <div className="flex justify-between items-center mb-1 sm:mb-3 flex-wrap gap-4">
//           {/* TABS */}
//           {/* <div className="flex gap-6  text-sm">
//             {['All', 'Rent', 'Sale', 'Services'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => {
//                   setActiveTab(tab);
//                   setPage(0);
//                 }}
//                 className={`pb-1 ${
//                   activeTab === tab
//                     ? 'border-b-2 border-black font-medium'
//                     : 'text-gray-500'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div> */}
//           {(() => {
//             const enabledSourceCount = [
//               locationSourceFlags.rentEnabled,
//               locationSourceFlags.buyEnabled,
//               locationSourceFlags.serviceEnabled,
//             ].filter(Boolean).length;

//             if (enabledSourceCount <= 1) return null;

//             return (
//               <div className="flex gap-6 text-sm">
//                 {[
//                   { label: 'All', value: 'All', enabled: true },
//                   {
//                     label: 'For Rent',
//                     value: 'Rent',
//                     enabled: locationSourceFlags.rentEnabled,
//                   },
//                   {
//                     label: 'For Buy',
//                     value: 'Sale',
//                     enabled: locationSourceFlags.buyEnabled,
//                   },
//                   {
//                     label: 'Services',
//                     value: 'Services',
//                     enabled: locationSourceFlags.serviceEnabled,
//                   },
//                 ]
//                   .filter((tab) => tab.enabled)
//                   .map((tab) => (
//                     <button
//                       key={tab.value}
//                       onClick={() => {
//                         setActiveTab(tab.value);
//                         setPage(0);
//                       }}
//                       className={`pb-1 transition ${
//                         activeTab === tab.value
//                           ? 'border-b-2 border-[#F97316] font-medium text-[#F97316]'
//                           : 'text-black'
//                       }`}
//                     >
//                       <span className="uppercase tracking-wide">
//                         {tab.label}
//                       </span>
//                     </button>
//                   ))}
//               </div>
//             );
//           })()}

//           {/* FILTER BUTTONS */}

//           {/* <div className="flex gap-2 sm:gap-3 flex-wrap">
//             {['Available Today', 'Under ₹500', 'Top Rated'].map((filter) => (
//               <button
//                 key={filter}
//                 className="border px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap hover:bg-black hover:text-white transition"
//               >
//                 {filter}
//               </button>
//             ))}
//           </div> */}
//           <div className="flex gap-2 sm:gap-3 flex-wrap">
//             {['Available Today', 'Under ₹500', 'Top Rated'].map((filter) => (
//               <button
//                 key={filter}
//                 onClick={() => {
//                   setActiveFilter((prev) => (prev === filter ? '' : filter));
//                   setPage(0);
//                 }}
//                 className={`border px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap transition ${
//                   activeFilter === filter
//                     ? 'bg-[#F97316] text-white border-white'
//                     : 'hover:bg-[#F97316] hover:text-white'
//                 }`}
//               >
//                 {filter}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* PRODUCT GRID */}
//         {activeTab === 'Services' ? (
//           servicesLoading ? (
//             <div className="flex justify-center py-14">
//               <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           ) : filteredServiceProducts.length === 0 ? (
//             <div className="text-center text-gray-500 py-14">
//               No services available near you.
//             </div>
//           ) : (
//             // <div className="flex overflow-x-auto sm:overflow-visible gap-2 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
//             <div className="flex overflow-x-auto sm:overflow-visible gap-1.5 sm:gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
//               {filteredServiceProducts.map((service, index) => (
//                 //
//                 //   key={service._id || index}
//                 //   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer"
//                 // >
//                 <Link
//                   href={`/service/${service._id || service.id}`}
//                   key={service._id || index}
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block w-[52%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
//                 >
//                   {/* IMAGE SECTION */}
//                   {/* <div className="relative overflow-hidden">

//                     <img */}
//                   {/* IMAGE SECTION */}
//                   {/* <div className="relative overflow-hidden">
//                     {offersByProduct[String(service._id || service.id)]
//                       ?.sticker ? (
//                       <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                         {
//                           offersByProduct[String(service._id || service.id)]
//                             ?.sticker
//                         }
//                       </span>
//                     ) : null} */}
//                   <div className="relative overflow-hidden">
//                     {/* {service?.featured?.enabled &&
//                     service?.featured?.status === 'live' ? (
//                       <span className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
//                         <Star size={10} fill="white" />
//                         Featured
//                       </span>
//                     ) : offersByProduct[String(service._id || service.id)] */}
//                     {service?.featured?.enabled &&
//                     service?.featured?.status === 'live' ? (
//                       <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#F97316] text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
//                         {/* <Star size={10} fill="white" /> */}
//                         Featured
//                       </span>
//                     ) : offersByProduct[String(service._id || service.id)]
//                         ?.sticker ? (
//                       <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                         {
//                           offersByProduct[String(service._id || service.id)]
//                             ?.sticker
//                         }
//                       </span>
//                     ) : null}

//                     <img
//                       src={service.image || service.imageUrl || mainimg}
//                       alt={service.title || service.name}
//                       // className="w-full h-40 sm:h-44 object-cover"
//                       className="w-full aspect-square object-cover"
//                     />

//                     {/* bottom left badge */}
//                     {/* <div className="absolute bottom-3 left-3">
//                       <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
//                         <Wrench size={12} />
//                         Professional
//                       </span>
//                     </div> */}
//                   </div>

//                   {/* CARD CONTENT */}
//                   <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
//                     {/* TITLE + RATING */}
//                     <div className="flex justify-between items-start mb-1">
//                       {/* <h3 className="text-xl font-bold">
//                         {service.title || service.name}
//                       </h3> */}
//                       <h3 className="text-sm sm:text-xl font-bold truncate">
//                         {service.title || service.name}
//                       </h3>
//                       {Number(
//                         service?.numReviews || service?.reviewCount || 0,
//                       ) > 0 && (
//                         <div className="flex items-center gap-1 text-white text-[11px] bg-[#F97316] px-2 py-0.5 rounded-full shrink-0 mt-1">
//                           <Star size={12} fill="white" />
//                           {Number(
//                             service?.averageRating || service?.rating || 0,
//                           ).toFixed(1)}
//                         </div>
//                       )}
//                     </div>

//                     {/* CONDITION BADGE */}
//                     {/* <div className="mb-2 -ml-4">
//                       <span className="inline-block text-[11px] text-gray-500 border border-gray-300 border-l-0 rounded-r-xl px-3 py-1">
//                         {service.description || service.desc
//                           ? (service.description || service.desc).slice(0, 40) +
//                             '...'
//                           : 'Professional Service'}
//                       </span>
//                     </div> */}

//                     {/* PRICE */}
//                     {/* <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
//                       <div>
//                         <span className="font-bold text-sm sm:text-xl leading-none">
//                           {service.price ?? service.startingPrice ?? '—'}
//                         </span>
//                         {service.originalPrice && (
//                           <span className="ml-2 text-gray-400 text-xs line-through">
//                             ₹{service.originalPrice}
//                           </span>
//                         )}
//                       </div>
//                     </div> */}

//                     {/* PRICE */}
//                     {(() => {
//                       const serviceOffer =
//                         offersByProduct[String(service._id || service.id)];
//                       const serviceDiscount = Number(
//                         serviceOffer?.discountPercent || 0,
//                       );
//                       const hasServiceOffer =
//                         !!serviceOffer && serviceDiscount > 0;
//                       const serviceBasePrice = Number(
//                         String(
//                           service.price ?? service.startingPrice ?? '',
//                         ).replace(/[^0-9.]/g, ''),
//                       );
//                       const serviceFinalPrice =
//                         Number.isFinite(serviceBasePrice) &&
//                         serviceBasePrice > 0
//                           ? Math.max(
//                               0,
//                               Math.round(
//                                 serviceBasePrice -
//                                   (serviceBasePrice * serviceDiscount) / 100,
//                               ),
//                             )
//                           : null;
//                       return (
//                         <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
//                           <div>
//                             {/* <span className="font-bold text-sm sm:text-xl leading-none">
//                               {hasServiceOffer && serviceFinalPrice != null
//                                 ? `₹${formatPrice(serviceFinalPrice)}`
//                                 : (service.price ??
//                                   service.startingPrice ??
//                                   '—')}
//                             </span> */}
//                             {/* <span className="font-bold text-sm sm:text-xl leading-none">
//                               {hasServiceOffer && serviceFinalPrice != null
//                                 ? `₹${formatPrice(serviceFinalPrice)}`
//                                 : (() => {
//                                     const raw =
//                                       service.price ??
//                                       service.startingPrice ??
//                                       '—';
//                                     const rawStr = String(raw).trim();
//                                     if (rawStr === '—' || rawStr === '')
//                                       return '—';
//                                     return /[₹]|rs\.?/i.test(rawStr)
//                                       ? rawStr
//                                       : `₹${rawStr}`;
//                                   })()}
//                             </span> */}
//                             <span className="font-bold text-sm sm:text-xl leading-none">
//                               {hasServiceOffer && serviceFinalPrice != null
//                                 ? `₹${formatPrice(serviceFinalPrice)}`
//                                 : (() => {
//                                     const raw =
//                                       service.price ??
//                                       service.startingPrice ??
//                                       '—';
//                                     const rawStr = String(raw).trim();
//                                     if (rawStr === '—' || rawStr === '')
//                                       return '—';
//                                     const numeric = Number(
//                                       rawStr.replace(/[^0-9.]/g, ''),
//                                     );
//                                     if (
//                                       !Number.isFinite(numeric) ||
//                                       numeric <= 0
//                                     ) {
//                                       return /[₹]|rs\.?/i.test(rawStr)
//                                         ? rawStr
//                                         : `₹${rawStr}`;
//                                     }
//                                     return `₹${formatPrice(numeric)}`;
//                                   })()}
//                             </span>
//                             {hasServiceOffer && serviceFinalPrice != null ? (
//                               <span className="ml-2 text-gray-400 text-xs line-through">
//                                 ₹{formatPrice(serviceBasePrice)}
//                               </span>
//                             ) : // ) : service.originalPrice ? (
//                             //   <span className="ml-2 text-gray-400 text-xs line-through">
//                             //     ₹{service.originalPrice}
//                             //   </span>
//                             // ) : null}
//                             service.originalPrice ? (
//                               <span className="ml-2 text-gray-400 text-xs line-through">
//                                 ₹{formatPrice(service.originalPrice)}
//                               </span>
//                             ) : null}
//                           </div>
//                           {hasServiceOffer ? (
//                             <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap self-end">
//                               {formatPercent(serviceDiscount)} Off
//                             </span>
//                           ) : null}
//                         </div>
//                       );
//                     })()}

//                     {/* BUTTON */}
//                     <Link
//                       href={`/service/${service._id || service.id}`}
//                       className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
//                     >
//                       Add Service
//                     </Link>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )
//         ) : loading ? (
//           <div className="flex justify-center py-14">
//             <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : visibleProducts.length === 0 ? (
//           <div className="text-center text-gray-500 py-14">
//             No products available near you.
//           </div>
//         ) : (
//           // <div className="flex overflow-x-auto sm:overflow-visible gap-2 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
//           <div className="flex overflow-x-auto sm:overflow-visible gap-1.5 sm:gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
//             {visibleProducts.map((item) => {
//               const isServiceProduct =
//                 String(item.type || '').toLowerCase() === 'service';
//               const isSellProduct =
//                 String(item.type || '').toLowerCase() === 'sell';
//               const detailsHref = isServiceProduct
//                 ? `/service/${item._id}`
//                 : isSellProduct
//                   ? `/buy-product-details/${item._id}`
//                   : `/rent-product-details/${item._id}`;
//               const offer = offersByProduct[String(item._id)];
//               const rawBase = getRentalListingAmount(item);
//               // Custom/manual multi-variant sell listings may leave the
//               // top-level price/salesConfiguration empty (each variant
//               // carries its own sellPrice). Fall back to the first variant
//               // that actually has a sell price, so the card doesn't show ₹0.
//               const isSellForPrice =
//                 String(item.type || '').toLowerCase() === 'sell';
//               const effectiveRawBase =
//                 isSellForPrice && (!rawBase || rawBase <= 0)
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
//               // Custom/manual listings store pricing per-variant; template &
//               // legacy listings store it at the product level. Gather all
//               // priced tiers from both sources and pick the cheapest one.
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
//               const base = lowestConfig
//                 ? lowestConfig.periodUnit === 'day' &&
//                   Number(lowestConfig.days) > 0
//                   ? Math.round(
//                       Number(
//                         lowestConfig.customerRent || lowestConfig.pricePerDay,
//                       ) / Number(lowestConfig.days),
//                     )
//                   : // customerRent is already the per-month rate for
//                     // month-based configs — use it directly.
//                     Math.round(
//                       Number(
//                         lowestConfig.customerRent || lowestConfig.pricePerDay,
//                       ),
//                     )
//                 : effectiveRawBase;
//               const priceSuffix =
//                 item.type === 'Rental'
//                   ? lowestConfig?.periodUnit === 'day'
//                     ? '/day'
//                     : '/month'
//                   : '';
//               const offerPricing = computeOfferPricing(offer, base);
//               const discount = offerPricing.displayPercent;
//               const finalPrice = offerPricing.finalPrice;
//               const hasOffer = !!offer && offerPricing.discountAmount > 0;
//               const isBoosted = boostedProductIds.includes(String(item._id));
//               const tag = offer?.sticker || (isBoosted ? 'Bestseller' : '');
//               const statusType = item.stock > 0 ? 'delivery' : 'pickup';
//               const deliveryEta = getProductDeliveryEtaLabel(item);
//               const status =
//                 item.stock > 0 ? deliveryEta || 'Varies' : 'Out of Stock';
//               const rating = Number(item.averageRating || 0).toFixed(1);
//               const hasRating = Number(item.numReviews || 0) > 0;

//               return (
//                 // <div
//                 //   key={item._id}
//                 //   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer"
//                 // >.
//                 <Link
//                   href={detailsHref}
//                   key={item._id}
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block w-[52%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
//                 >
//                   {/* <div className="relative pt-1 px-1 overflow-hidden">
//                     {tag && (
//                       <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                         {tag}
//                       </span>
//                     )} */}
//                   <div className="relative pt-1 px-1 overflow-hidden">
//                     {/* <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                       {tag}
//                     </span> */}
//                     {/* {item?.featured?.enabled &&
//                     item?.featured?.status === 'live' ? (
//                       <span className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
//                         <Star size={10} fill="white" />
//                         Featured
//                       </span>
//                     ) : ( */}
//                     {item?.featured?.enabled &&
//                     item?.featured?.status === 'live' ? (
//                       <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#F97316] text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
//                         {/* <Star size={10} fill="white" /> */}
//                         Featured
//                       </span>
//                     ) : (
//                       tag && (
//                         <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                           {tag}
//                         </span>
//                       )
//                     )}

//                     <img
//                       src={item.image || item.imageUrl || mainimg}
//                       alt="product"
//                       // className="w-full h-44 sm:h-48 object-cover rounded-xl"
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
//                     {/* <button
//                       type="button"
//                       onClick={(e) => onToggleWishlist(e, item._id)}
//                       disabled={togglingId === String(item._id)}
//                       className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
//                     >
//                       <Heart
//                         size={16}
//                         className={
//                           isWished(item._id)
//                             ? 'text-red-500 fill-red-500'
//                             : 'text-gray-700'
//                         }
//                       />
//                     </button>
//                   </div> */}
//                     <button
//                       type="button"
//                       onClick={(e) => onToggleWishlist(e, item._id)}
//                       disabled={togglingId === String(item._id)}
//                       className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
//                     >
//                       <Heart
//                         size={16}
//                         className={
//                           isWished(item._id)
//                             ? 'text-red-500 fill-red-500'
//                             : 'text-gray-700'
//                         }
//                       />
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
//                     {/* <div className="flex justify-between items-start mb-1">
//                       <h3 className="text-xl font-bold truncate">
//                         {item.productName || item.title || item.name}
//                       </h3>
//                       {hasRating && (
//                         <div className="flex items-center gap-1 text-white text-[11px] bg-emerald-500 px-2 py-0.5 rounded-full">
//                           <Star size={12} fill="white" />
//                           {rating}
//                         </div>
//                       )}
//                     </div>
//                     <div className="mb-2 -ml-4">
//                       <span className="inline-block text-[11px] text-gray-500 border border-gray-300 border-l-0 rounded-r-xl px-3 py-1">
//                         {item.condition?.trim() ||
//                           (item.type === 'Rental' ? 'For Rent' : 'Brand New')}
//                       </span>
//                     </div> */}
//                     {/* <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1"> */}
//                     <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0">
//                       {/* <h3 className="text-xl font-bold">
//                         {item.productName || item.title || item.name}
//                       </h3> */}
//                       <h3 className="text-sm sm:text-xl font-bold truncate">
//                         {item.productName || item.title || item.name}
//                       </h3>
//                       <span className="inline-block text-[9px] sm:text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
//                         {item.condition?.trim() ||
//                           (item.type === 'Rental' ? 'For Rent' : 'Brand New')}
//                       </span>
//                       {/* <span className="inline-block text-[11px] text-gray-500 border border-gray-300 border-r-0 rounded-l-full px-3 py-1 whitespace-nowrap shrink-0 -mr-3 sm:-mr-4">
//                         {item.condition?.trim() ||
//                           (item.type === 'Rental' ? 'For Rent' : 'Brand New')}
//                       </span> */}
//                     </div>
//                     {/* <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
//                       <div>

//                         <span className="font-bold text-sm sm:text-xl leading-none">
//                           ₹{formatPrice(hasOffer ? finalPrice : base)}
//                         </span> */}
//                     <div className="flex items-end justify-between gap-1 sm:gap-2 mb-0 sm:mb-0.5">
//                       <div>
//                         {/* <span className="font-bold text-xl leading-none">
//                           ₹{hasOffer ? finalPrice : base}
//                         </span> */}
//                         <span className="font-bold text-sm sm:text-xl leading-none">
//                           ₹{formatPrice(hasOffer ? finalPrice : base)}
//                         </span>
//                         {/* <span className="ml-1 text-base font-bold">
//                           {priceSuffix}
//                         </span> */}
//                         <span className="text-xs sm:text-base font-bold">
//                           {priceSuffix}
//                         </span>
//                         {/* {hasOffer ? (
//                           <span className="ml-2 text-gray-400 text-xs line-through">
//                             ₹{base}
//                           </span>
//                         ) : null} */}
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
//                     {/* <Link
//                       href={detailsHref}
//                       className={`flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl text-sm font-medium transition ${
//                         item.stock > 0
//                           ? 'bg-[#F97316] text-white hover:bg-orange-600'
//                           : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
//                       }`}
//                     >
//                       {item.stock > 0 && <ShoppingCart size={16} />}
//                       {item.stock > 0
//                         ? String(item.type || '').toLowerCase() === 'sell'
//                           ? 'Buy Now'
//                           : 'Rent Now'
//                         : 'Details'}
//                     </Link> */}
//                     {(() => {
//                       // Custom/manual listings store tenure config per
//                       // variant; template/legacy listings store it at the
//                       // product level. Check both so day-wise custom
//                       // listings correctly show only the "View" button.
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
//                         // Out of stock: Details + Notify Me
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
//                         // Daily rental: only View button → goes to detail page
//                         return (
//                           <Link
//                             href={detailsHref}
//                             className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
//                           >
//                             {String(item.type || '').toLowerCase() === 'sell'
//                               ? 'Buy Now'
//                               : 'View'}
//                           </Link>
//                         );
//                       }

//                       // In stock, monthly rental or sell: View + Add to Cart
//                       const isSell =
//                         String(item.type || '').toLowerCase() === 'sell';

//                       // Pick lowest price plan for cart
//                       // Pick lowest price plan for cart — check variant-level
//                       // rentalConfigurations first (custom listings), falling
//                       // back to product-level (template/legacy listings).
//                       // Build separate candidate groups — product-level list,
//                       // and each variant's own list — instead of merging them
//                       // into one array. This way the tenure options shown in
//                       // the cart always belong to a single source (the one
//                       // that produced the cheapest plan), never a mix of
//                       // multiple variants' tenures.
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
//                             // For month plans, price is already the
//                             // per-month rate — don't divide by months.
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
//                         // For month plans, price is already the per-month
//                         // rate — don't divide by months.
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
//                       // const cartPrice =
//                       //   lowestPlan?.price || getRentalListingAmount(item);
//                       // const cartMonths = lowestPlan?.months || 1;
//                       // const cartTenureUnit = lowestPlan?.periodUnit || 'month';

//                       // const offer = offersByProduct[String(item._id)];
//                       // const discount = Number(offer?.discountPercent || 0);
//                       // const finalCartPrice =
//                       //   discount > 0
//                       //     ? Math.max(
//                       //         0,
//                       //         Math.round(
//                       //           cartPrice - (cartPrice * discount) / 100,
//                       //         ),
//                       //       )
//                       //     : cartPrice;
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
//                         // Custom/manual multi-variant sell listings: fall
//                         // back to the first variant's own sellPrice.
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

//                       // For month plans, lowestPlan.price is the per-month
//                       // rate — multiply by months to get the total tenure
//                       // price dispatched to the cart (day plans unchanged).
//                       // const cartPrice = isSell
//                       //   ? sellBasePrice || getRentalListingAmount(item)
//                       //   : lowestPlan
//                       //     ? lowestPlan.periodUnit === 'day'
//                       //       ? lowestPlan.price
//                       //       : lowestPlan.price * (lowestPlan.months || 1)
//                       //     : getRentalListingAmount(item);
//                       const cartPrice = isSell
//                         ? sellBasePrice || getRentalListingAmount(item)
//                         : lowestPlan
//                           ? lowestPlan.price
//                           : getRentalListingAmount(item);
//                       const cartMonths = lowestPlan?.months || 1;
//                       const cartTenureUnit = lowestPlan?.periodUnit || 'month';

//                       const offer = offersByProduct[String(item._id)];
//                       const cartOfferPricing = computeOfferPricing(
//                         offer,
//                         cartPrice,
//                       );
//                       const finalCartPrice = cartOfferPricing.finalPrice;

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
//                             onClick={async (e) => {
//                               e.preventDefault();
//                               // dispatch(
//                               //   addToCart({
//                               //     productId: item._id,
//                               //     variantId: null,
//                               //     variantName: '',
//                               //     quantity: 1,
//                               //     rentalMonths: cartMonths,
//                               //     pricePerDay: finalCartPrice,
//                               //     title:
//                               //       item.productName ||
//                               //       item.title ||
//                               //       item.name ||
//                               //       '',
//                               //     image: item.image || item.imageUrl || '',
//                               //     tenureUnit: cartTenureUnit,
//                               //     refundableDeposit: Number(
//                               //       item.refundableDeposit || 0,
//                               //     ),
//                               //     rentalConfigurations:
//                               //       item.rentalConfigurations || [],
//                               //   }),
//                               // );
//                               // router.push('/cart');
//                               // Fetch full product to get subCategoryTax
//                               // let fullProduct = null;
//                               // try {
//                               //   const res = await apiGetProductById(item._id);
//                               //   fullProduct = res.data?.product || null;
//                               // } catch {}
//                               // Prefer subCategoryTax already present on the
//                               // list item; only hit the network if missing.
//                               // Full product fetch no longer needed for
//                               // sell items — cart slice auto-calculates
//                               // tax/delivery when tax override fields are
//                               // omitted (matches BuySimilarProducts).
//                               let fullProduct = null;

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
//                                         originalPricePerDay: cartPrice,
//                                         title:
//                                           item.productName ||
//                                           item.title ||
//                                           item.name ||
//                                           '',
//                                         image:
//                                           item.image || item.imageUrl || '',
//                                         tenureUnit: 'month',
//                                         productType: 'Sell',
//                                         refundableDeposit: 0,
//                                         condition:
//                                           item?.condition || 'Brand New',
//                                         offer: offer || null,
//                                         rentalConfigurations: [],
//                                       }
//                                     : // : {
//                                       //     productId: item._id,
//                                       //     variantId: null,
//                                       //     variantName: '',
//                                       //     quantity: 1,
//                                       //     rentalMonths: cartMonths,
//                                       //     pricePerDay: finalCartPrice,
//                                       //     title:
//                                       //       item.productName ||
//                                       //       item.title ||
//                                       //       item.name ||
//                                       //       '',
//                                       //     image:
//                                       //       item.image || item.imageUrl || '',
//                                       //     tenureUnit: cartTenureUnit,
//                                       //     refundableDeposit: Number(
//                                       //       item.refundableDeposit || 0,
//                                       //     ),
//                                       //     rentalConfigurations:
//                                       //       item.rentalConfigurations || [],
//                                       //   },
//                                       {
//                                         productId: item._id,
//                                         variantId: null,
//                                         variantName: '',
//                                         quantity: 1,
//                                         rentalMonths: cartMonths,
//                                         pricePerDay: finalCartPrice,
//                                         originalPricePerDay: cartPrice,
//                                         title:
//                                           item.productName ||
//                                           item.title ||
//                                           item.name ||
//                                           '',
//                                         image:
//                                           item.image || item.imageUrl || '',
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
//                                           fullProduct?.subCategoryTax
//                                             ?.defaultGst ??
//                                           item?.subCategoryTax?.defaultGst ??
//                                           null,
//                                         defaultCareTax:
//                                           fullProduct?.subCategoryTax
//                                             ?.defaultCareTax ??
//                                           item?.subCategoryTax
//                                             ?.defaultCareTax ??
//                                           null,
//                                         defaultRepairWarranty:
//                                           fullProduct?.subCategoryTax
//                                             ?.defaultRepairWarranty ??
//                                           item?.subCategoryTax
//                                             ?.defaultRepairWarranty ??
//                                           null,
//                                         defaultRelocationWarranty:
//                                           fullProduct?.subCategoryTax
//                                             ?.defaultRelocationWarranty ??
//                                           item?.subCategoryTax
//                                             ?.defaultRelocationWarranty ??
//                                           null,
//                                         defaultDeliveryPackaging:
//                                           fullProduct?.subCategoryTax
//                                             ?.defaultDeliveryPackaging ??
//                                           item?.subCategoryTax
//                                             ?.defaultDeliveryPackaging ??
//                                           null,
//                                         defaultInstallationFee:
//                                           fullProduct?.subCategoryTax
//                                             ?.defaultInstallationFee ??
//                                           item?.subCategoryTax
//                                             ?.defaultInstallationFee ??
//                                           null,
//                                         defaultPlatformFee:
//                                           fullProduct?.subCategoryTax
//                                             ?.defaultPlatformFee ??
//                                           item?.subCategoryTax
//                                             ?.defaultPlatformFee ??
//                                           null,
//                                         taxBlocked:
//                                           fullProduct?.subCategoryTax
//                                             ?.taxBlocked ??
//                                           item?.subCategoryTax?.taxBlocked ??
//                                           false,
//                                       },
//                                 ),
//                                 //     );
//                                 //     router.push('/cart');
//                                 //   }}
//                                 //   className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 transition"
//                                 // >
//                                 //   {isSell ? 'Cart' : 'Cart'}
//                               );
//                             }}
//                             className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 transition"
//                           >
//                             {isSell ? 'Cart' : 'Cart'}
//                           </button>
//                         </div>
//                       );
//                     })()}
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         )}

//         {/* PAGINATION */}
//         {activeTab !== 'Services' &&
//           sortedFilteredProducts.length > cardsPerPage && (
//             // <div className="flex justify-center items-center gap-3 mt-10 flex-wrap">
//             <div className="hidden sm:flex justify-center items-center gap-3 mt-10 flex-wrap">
//               <button
//                 onClick={prevSlide}
//                 disabled={page === 0}
//                 className="p-2.5 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>

//               <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF6F00] text-sm font-semibold text-white">
//                 {page + 1}
//               </span>

//               <button
//                 onClick={nextSlide}
//                 disabled={
//                   (page + 1) * cardsPerPage >= sortedFilteredProducts.length
//                 }
//                 className="p-2.5 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           )}
//       </div>
//     </section>
//   );
// };

// export default Trending;

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
import {
  apiGetStorefrontVendorProducts,
  apiGetPublicActiveOffers,
  apiGetMyWishlist,
  apiToggleWishlist,
  apiGetServiceProducts,
  apiRequestStockNotify,
  apiGetProductById,
  apiGetPublicLocationSettings,
  apiGetActiveBoosts,
} from '@/lib/api';
import {
  getRentalListingAmount,
  getRentalListingSuffix,
  getProductDeliveryEtaLabel,
} from '@/lib/rentalPriceDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/store/slices/cartSlice';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/contexts/ToastContext';

import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Package,
} from 'lucide-react';

// const formatPercent = (n) => {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num) || num <= 0) return '0%';
//   const rounded = Math.round(num * 10) / 10;
//   return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
// };
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

// Admin offers reduce the platform's own fee cut and pass that saving
// straight to the customer — the vendor still gets the full base price.
// Vendor offers cut the price out of the vendor's own payout (unchanged).
const PLATFORM_FEE_PERCENT = 15;
const computeOfferPricing = (offer, base) => {
  if (!offer || !base) {
    return { discountAmount: 0, finalPrice: base, displayPercent: 0 };
  }
  // if (offer.source === 'admin') {
  //   const reduction = Number(offer.platformFeeReductionPercent || 0);
  //   if (!reduction) {
  //     return { discountAmount: 0, finalPrice: base, displayPercent: 0 };
  //   }
  //   const defaultFeeAmount = base * (PLATFORM_FEE_PERCENT / 100);
  //   const effectiveFeePercent = Math.max(
  //     0,
  //     PLATFORM_FEE_PERCENT * (1 - reduction / 100),
  //   );
  //   const effectiveFeeAmount = base * (effectiveFeePercent / 100);
  //   const discountAmount = Math.round(defaultFeeAmount - effectiveFeeAmount);
  //   const finalPrice = Math.max(0, base - discountAmount);
  //   const displayPercent = base > 0 ? (discountAmount / base) * 100 : 0;
  //   return { discountAmount, finalPrice, displayPercent };
  // }

  if (offer.source === 'admin') {
    // Stored value IS the % of product price admin entered — no
    // conversion needed, so the customer sees the exact number admin typed.
    const priceBasedPercent = Math.min(
      PLATFORM_FEE_PERCENT,
      Number(offer.platformFeeReductionPercent || 0),
    );
    if (!priceBasedPercent) {
      return { discountAmount: 0, finalPrice: base, displayPercent: 0 };
    }
    const discountAmount = Math.round(base * (priceBasedPercent / 100));
    const finalPrice = Math.max(0, base - discountAmount);
    return {
      discountAmount,
      finalPrice,
      displayPercent: priceBasedPercent,
    };
  }
  const discountPercent = Number(offer.discountPercent || 0);
  const discountAmount = Math.round((base * discountPercent) / 100);
  const finalPrice = Math.max(0, base - discountAmount);
  return { discountAmount, finalPrice, displayPercent: discountPercent };
};

const Trending = () => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('All');
  const [products, setProducts] = useState([]);
  const [offersByProduct, setOffersByProduct] = useState({});
  const [wishedIds, setWishedIds] = useState([]);
  const [togglingId, setTogglingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [locVersion, setLocVersion] = useState(0);
  const [activeFilter, setActiveFilter] = useState('');
  const [serviceProducts, setServiceProducts] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [boostedProductIds, setBoostedProductIds] = useState([]);
  const [locationSourceFlags, setLocationSourceFlags] = useState({
    rentEnabled: true,
    buyEnabled: true,
    serviceEnabled: true,
  });
  const dispatch = useDispatch();
  const router = useRouter();
  const { pushToast } = useToast();

  const { openAuth } = useAuthModal();
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

  const handleNotifyMe = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onLocChange = () => {
      setPage(0);
      setActiveTab('All');
      setLocVersion((v) => v + 1);
    };

    window.addEventListener('rn_delivery_location_changed', onLocChange);
    const onStorage = (e) => {
      if (e?.key !== 'rn_delivery_location') return;
      onLocChange();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('rn_delivery_location_changed', onLocChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const isActiveTabDisabled =
      (activeTab === 'Rent' && !locationSourceFlags.rentEnabled) ||
      (activeTab === 'Sale' && !locationSourceFlags.buyEnabled) ||
      (activeTab === 'Services' && !locationSourceFlags.serviceEnabled);

    const enabledSourceCount = [
      locationSourceFlags.rentEnabled,
      locationSourceFlags.buyEnabled,
      locationSourceFlags.serviceEnabled,
    ].filter(Boolean).length;

    if (enabledSourceCount === 1) {
      // Only one source available — lock straight to it, no tabs needed.
      const onlyTab = locationSourceFlags.rentEnabled
        ? 'Rent'
        : locationSourceFlags.buyEnabled
          ? 'Sale'
          : 'Services';
      if (activeTab !== onlyTab) {
        setActiveTab(onlyTab);
        setPage(0);
      }
    } else if (isActiveTabDisabled) {
      setActiveTab('All');
      setPage(0);
    }
  }, [locationSourceFlags, activeTab]);

  // useEffect(() => {
  //   if (activeTab !== 'Services') return;

  //   setServicesLoading(true);
  //   let queryString = '';
  //   try {
  //     const raw = localStorage.getItem('rn_delivery_location');
  //     if (raw) {
  //       const parsed = JSON.parse(raw);
  //       const lat = Number(parsed?.lat);
  //       const lon = Number(parsed?.lon);
  //       if (Number.isFinite(lat) && Number.isFinite(lon)) {
  //         queryString = `userLat=${lat}&userLng=${lon}`;
  //       }
  //     }
  //   } catch {}

  //   apiGetServiceProducts(queryString)
  //     .then((res) => setServiceProducts(res.data?.products || []))
  //     .catch(() => setServiceProducts([]))
  //     .finally(() => setServicesLoading(false));
  // }, [activeTab, locVersion]);

  useEffect(() => {
    if (activeTab !== 'Services') return;

    setServicesLoading(true);

    apiGetServiceProducts()
      .then((res) => setServiceProducts(res.data?.products || []))
      .catch(() => setServiceProducts([]))
      .finally(() => setServicesLoading(false));
  }, [activeTab, locVersion]);

  useEffect(() => {
    let mounted = true;
    apiGetPublicLocationSettings()
      .then((res) => {
        if (!mounted) return;
        setLocationSourceFlags({
          rentEnabled: res.data?.rentEnabled !== false,
          buyEnabled: res.data?.buyEnabled !== false,
          serviceEnabled: res.data?.serviceEnabled !== false,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setLocationSourceFlags({
          rentEnabled: true,
          buyEnabled: true,
          serviceEnabled: true,
        });
      });
    return () => {
      mounted = false;
    };
  }, [locVersion]);

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
        setProducts(allProducts);

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
  }, [locVersion]);
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

  const cardsPerPage = 8;

  // const filteredProducts =
  //   activeTab === 'All'
  //     ? products
  //     : activeTab === 'Rent'
  //       ? products.filter((p) => String(p.type || '') === 'Rental')
  //       : activeTab === 'Sale'
  //         ? products.filter((p) => String(p.type || '') === 'Sell')
  //         : products.filter((p) =>
  //             String(p.category || '')
  //               .toLowerCase()
  //               .includes('service'),
  //           );
  const filteredProducts = products
    .filter((p) => {
      if (activeTab === 'Rent') {
        return String(p.type || '') === 'Rental';
      }
      if (activeTab === 'Sale') {
        return String(p.type || '') === 'Sell';
      }
      if (activeTab === 'Services') {
        return false; // services tab uses separate serviceProducts array now
      }
      return true; // All tab — show rent + sell only, services shown separately below
    })
    .filter((p) => {
      if (activeFilter === 'Available Today') {
        const createdAt = new Date(p.createdAt);
        const today = new Date();

        return (
          createdAt.getDate() === today.getDate() &&
          createdAt.getMonth() === today.getMonth() &&
          createdAt.getFullYear() === today.getFullYear()
        );
      }

      if (activeFilter === 'Under ₹500') {
        return getRentalListingAmount(p) <= 500;
      }

      return true;
    })

    // .sort((a, b) => {
    //   if (activeFilter === 'Top Rated') {
    //     return Number(b.averageRating || 0) - Number(a.averageRating || 0);
    //   }
    //   return 0;
    // });
    .sort((a, b) => {
      if (activeFilter === 'Top Rated') {
        const rA = Number(a.averageRating ?? a.rating ?? 0);
        const rB = Number(b.averageRating ?? b.rating ?? 0);
        return rB - rA;
      }
      return 0;
    });

  // const filteredServiceProducts = serviceProducts
  //   .filter((s) => {
  //     if (activeFilter === 'Available Today') {
  //       const createdAt = new Date(s.createdAt);
  //       const today = new Date();
  //       return (
  //         createdAt.getDate() === today.getDate() &&
  //         createdAt.getMonth() === today.getMonth() &&
  //         createdAt.getFullYear() === today.getFullYear()
  //       );
  //     }
  //     if (activeFilter === 'Under ₹500') {
  //       const price = Number(
  //         String(s.price ?? s.startingPrice ?? '').replace(/[^0-9.]/g, ''),
  //       );
  //       return Number.isFinite(price) && price <= 500;
  //     }
  //     return true;
  //   })
  //   .sort((a, b) => {
  //     if (activeFilter === 'Top Rated') {
  //       const rA = Number(a.averageRating ?? a.rating ?? 0);
  //       const rB = Number(b.averageRating ?? b.rating ?? 0);
  //       return rB - rA;
  //     }
  //     return 0;
  //   });

  const filteredServiceProducts = (() => {
    const base = serviceProducts
      .filter((s) => {
        if (activeFilter === 'Available Today') {
          const createdAt = new Date(s.createdAt);
          const today = new Date();
          return (
            createdAt.getDate() === today.getDate() &&
            createdAt.getMonth() === today.getMonth() &&
            createdAt.getFullYear() === today.getFullYear()
          );
        }
        if (activeFilter === 'Under ₹500') {
          const price = Number(
            String(s.price ?? s.startingPrice ?? '').replace(/[^0-9.]/g, ''),
          );
          return Number.isFinite(price) && price <= 500;
        }
        return true;
      })
      .sort((a, b) => {
        if (activeFilter === 'Top Rated') {
          const rA = Number(a.averageRating ?? a.rating ?? 0);
          const rB = Number(b.averageRating ?? b.rating ?? 0);
          return rB - rA;
        }
        return 0;
      });

    // Admin "Featured" services always come first, ordered by priorityRank.
    // Only counts if status is 'live' — an 'inactive' toggle in the admin
    // featured table excludes it here automatically.
    const isFeaturedActive = (s) =>
      s?.featured?.enabled === true && s?.featured?.status === 'live';
    const featured = base
      .filter(isFeaturedActive)
      .sort(
        (a, b) =>
          Number(a?.featured?.priorityRank || 0) -
          Number(b?.featured?.priorityRank || 0),
      );
    const rest = base.filter((s) => !isFeaturedActive(s));

    return [...featured, ...rest];
  })();

  // const allTabMerged =
  //   activeTab === 'All' && activeFilter === 'Top Rated'
  //     ? [...filteredProducts].sort(
  //         (a, b) =>
  //           Number(b.averageRating ?? b.rating ?? 0) -
  //           Number(a.averageRating ?? a.rating ?? 0),
  //       )
  //     : null;

  // const visibleProducts = filteredProducts.slice(
  //   page * cardsPerPage,
  //   page * cardsPerPage + cardsPerPage,
  // );

  // const sortedFilteredProducts = (() => {
  //   // First apply existing sort (Top Rated filter etc.)
  //   const baseSorted =
  //     activeTab === 'All' && activeFilter === 'Top Rated'
  //       ? [...filteredProducts].sort(
  //           (a, b) =>
  //             Number(b.averageRating ?? b.rating ?? 0) -
  //             Number(a.averageRating ?? a.rating ?? 0),
  //         )
  //       : [...filteredProducts];

  //   // Then always float boosted products to the very top
  //   if (boostedProductIds.length === 0) return baseSorted;
  //   const boosted = baseSorted.filter((p) =>
  //     boostedProductIds.includes(String(p._id)),
  //   );
  //   const rest = baseSorted.filter(
  //     (p) => !boostedProductIds.includes(String(p._id)),
  //   );
  //   return [...boosted, ...rest];
  // })();
  const sortedFilteredProducts = (() => {
    // First apply existing sort (Top Rated filter etc.)
    const baseSorted =
      activeTab === 'All' && activeFilter === 'Top Rated'
        ? [...filteredProducts].sort(
            (a, b) =>
              Number(b.averageRating ?? b.rating ?? 0) -
              Number(a.averageRating ?? a.rating ?? 0),
          )
        : [...filteredProducts];

    // Admin "Featured" items always come first, ordered by priorityRank.
    // Only counts if status is 'live' — an 'inactive' toggle in the admin
    // featured table excludes it here automatically.
    const isFeaturedActive = (p) =>
      p?.featured?.enabled === true && p?.featured?.status === 'live';
    const featured = baseSorted
      .filter(isFeaturedActive)
      .sort(
        (a, b) =>
          Number(a?.featured?.priorityRank || 0) -
          Number(b?.featured?.priorityRank || 0),
      );
    const nonFeatured = baseSorted.filter((p) => !isFeaturedActive(p));

    // Then float boosted products to the top of the remaining (non-featured) list.
    if (boostedProductIds.length === 0) return [...featured, ...nonFeatured];
    const boosted = nonFeatured.filter((p) =>
      boostedProductIds.includes(String(p._id)),
    );
    const rest = nonFeatured.filter(
      (p) => !boostedProductIds.includes(String(p._id)),
    );
    return [...featured, ...boosted, ...rest];
  })();

  const visibleProducts = sortedFilteredProducts.slice(
    page * cardsPerPage,
    page * cardsPerPage + cardsPerPage,
  );

  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (!shouldScroll) return;
    document
      .querySelector('#trending-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShouldScroll(false);
  }, [page, shouldScroll]);

  const nextSlide = () => {
    if ((page + 1) * cardsPerPage < sortedFilteredProducts.length) {
      setPage((p) => p + 1);
      setShouldScroll(true);
    }
  };

  const prevSlide = () => {
    if (page > 0) {
      setPage((p) => p - 1);
      setShouldScroll(true);
    }
  };
  const allSourcesDisabled =
    !locationSourceFlags.rentEnabled &&
    !locationSourceFlags.buyEnabled &&
    !locationSourceFlags.serviceEnabled;

  if (allSourcesDisabled) {
    return null;
  }

  return (
    // <section id="trending-section" className="w-full py-16 px-4 ">
    // <section
    //   id="trending-section"
    //   className="w-full py-8 sm:py-10 md:py-16 px-4"
    // >
    <section
      id="trending-section"
      className="w-full pt-3 sm:pt-4 md:pt-6 pb-4 sm:pb-4 md:pb-6 px-4"
    >
      <div className=" mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl md:text-3xl">
            <span className="font-semibold text-black">Trending </span>
            <span className="font-bold text-[#F97316]">Near You!</span>
          </h1>

          {/* <Link
            href="/products"
            className="group px-4 sm:px-5 py-2 rounded-full bg-[#F97316] text-white text-[10px] sm:text-sm font-bold transition flex items-center gap-1"
          >
            View All
            <ChevronRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link> */}
          <Link
            href="/products"
            className="group px-2 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#F97316] text-white text-[10px] sm:text-sm font-bold transition flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
          >
            View All
            <ChevronRight
              size={12}
              className="sm:hidden transition-transform duration-300 group-hover:translate-x-1"
            />
            <ChevronRight
              size={14}
              className="hidden sm:block transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* DESCRIPTION */}
        {/* <p className="text-gray-500 mb-6 text-sm sm:text-base">
          Explore the most popular rentals, verified used electronics, and
          top-rated services in your neighborhood
        </p> */}

        {/* CATEGORY + FILTERS */}
        {/* <div className="flex justify-between items-center mb-1.5 flex-wrap gap-4"> */}
        <div className="flex justify-between items-center mb-1 sm:mb-3 flex-wrap gap-4">
          {/* TABS */}
          {/* <div className="flex gap-6  text-sm">
            {['All', 'Rent', 'Sale', 'Services'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(0);
                }}
                className={`pb-1 ${
                  activeTab === tab
                    ? 'border-b-2 border-black font-medium'
                    : 'text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div> */}
          {(() => {
            const enabledSourceCount = [
              locationSourceFlags.rentEnabled,
              locationSourceFlags.buyEnabled,
              locationSourceFlags.serviceEnabled,
            ].filter(Boolean).length;

            if (enabledSourceCount <= 1) return null;

            return (
              <div className="flex gap-6 text-sm">
                {[
                  { label: 'All', value: 'All', enabled: true },
                  {
                    label: 'For Rent',
                    value: 'Rent',
                    enabled: locationSourceFlags.rentEnabled,
                  },
                  {
                    label: 'For Buy',
                    value: 'Sale',
                    enabled: locationSourceFlags.buyEnabled,
                  },
                  {
                    label: 'Services',
                    value: 'Services',
                    enabled: locationSourceFlags.serviceEnabled,
                  },
                ]
                  .filter((tab) => tab.enabled)
                  .map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => {
                        setActiveTab(tab.value);
                        setPage(0);
                      }}
                      className={`pb-1 transition ${
                        activeTab === tab.value
                          ? 'border-b-2 border-[#F97316] font-medium text-[#F97316]'
                          : 'text-black'
                      }`}
                    >
                      <span className="uppercase tracking-wide">
                        {tab.label}
                      </span>
                    </button>
                  ))}
              </div>
            );
          })()}

          {/* FILTER BUTTONS */}

          {/* <div className="flex gap-2 sm:gap-3 flex-wrap">
            {['Available Today', 'Under ₹500', 'Top Rated'].map((filter) => (
              <button
                key={filter}
                className="border px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap hover:bg-black hover:text-white transition"
              >
                {filter}
              </button>
            ))}
          </div> */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {['Available Today', 'Under ₹500', 'Top Rated'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter((prev) => (prev === filter ? '' : filter));
                  setPage(0);
                }}
                className={`border px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap transition ${
                  activeFilter === filter
                    ? 'bg-[#F97316] text-white border-white'
                    : 'hover:bg-[#F97316] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        {activeTab === 'Services' ? (
          servicesLoading ? (
            <div className="flex justify-center py-14">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredServiceProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-14">
              No services available near you.
            </div>
          ) : (
            // <div className="flex overflow-x-auto sm:overflow-visible gap-2 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
            <div className="flex overflow-x-auto sm:overflow-visible gap-1.5 sm:gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
              {filteredServiceProducts.map((service, index) => (
                //
                //   key={service._id || index}
                //   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                // >
                <Link
                  href={`/service/${service._id || service.id}`}
                  key={service._id || index}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block w-[52%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
                >
                  {/* IMAGE SECTION */}
                  {/* <div className="relative overflow-hidden">
               

                    <img */}
                  {/* IMAGE SECTION */}
                  {/* <div className="relative overflow-hidden">
                    {offersByProduct[String(service._id || service.id)]
                      ?.sticker ? (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                        {
                          offersByProduct[String(service._id || service.id)]
                            ?.sticker
                        }
                      </span>
                    ) : null} */}
                  <div className="relative overflow-hidden">
                    {/* {service?.featured?.enabled &&
                    service?.featured?.status === 'live' ? (
                      <span className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
                        <Star size={10} fill="white" />
                        Featured
                      </span>
                    ) : offersByProduct[String(service._id || service.id)] */}
                    {service?.featured?.enabled &&
                    service?.featured?.status === 'live' ? (
                      <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#F97316] text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
                        {/* <Star size={10} fill="white" /> */}
                        Featured
                      </span>
                    ) : offersByProduct[String(service._id || service.id)]
                        ?.sticker ? (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                        {
                          offersByProduct[String(service._id || service.id)]
                            ?.sticker
                        }
                      </span>
                    ) : null}

                    <img
                      src={service.image || service.imageUrl || mainimg}
                      alt={service.title || service.name}
                      // className="w-full h-40 sm:h-44 object-cover"
                      className="w-full aspect-square object-cover"
                    />

                    {/* bottom left badge */}
                    {/* <div className="absolute bottom-3 left-3">
                      <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                        <Wrench size={12} />
                        Professional
                      </span>
                    </div> */}
                  </div>

                  {/* CARD CONTENT */}
                  <div className="px-2 sm:px-4 pb-2.5 sm:pb-4">
                    {/* TITLE + RATING */}
                    <div className="flex justify-between items-start mb-1">
                      {/* <h3 className="text-xl font-bold">
                        {service.title || service.name}
                      </h3> */}
                      <h3 className="text-sm sm:text-xl font-bold truncate">
                        {service.title || service.name}
                      </h3>
                      {Number(
                        service?.numReviews || service?.reviewCount || 0,
                      ) > 0 && (
                        <div className="flex items-center gap-1 text-white text-[11px] bg-[#F97316] px-2 py-0.5 rounded-full shrink-0 mt-1">
                          <Star size={12} fill="white" />
                          {Number(
                            service?.averageRating || service?.rating || 0,
                          ).toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* CONDITION BADGE */}
                    {/* <div className="mb-2 -ml-4">
                      <span className="inline-block text-[11px] text-gray-500 border border-gray-300 border-l-0 rounded-r-xl px-3 py-1">
                        {service.description || service.desc
                          ? (service.description || service.desc).slice(0, 40) +
                            '...'
                          : 'Professional Service'}
                      </span>
                    </div> */}

                    {/* PRICE */}
                    {/* <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                      <div>
                        <span className="font-bold text-sm sm:text-xl leading-none">
                          {service.price ?? service.startingPrice ?? '—'}
                        </span>
                        {service.originalPrice && (
                          <span className="ml-2 text-gray-400 text-xs line-through">
                            ₹{service.originalPrice}
                          </span>
                        )}
                      </div>
                    </div> */}

                    {/* PRICE */}
                    {(() => {
                      const serviceOffer =
                        offersByProduct[String(service._id || service.id)];
                      const serviceDiscount = Number(
                        serviceOffer?.discountPercent || 0,
                      );
                      const hasServiceOffer =
                        !!serviceOffer && serviceDiscount > 0;
                      const serviceBasePrice = Number(
                        String(
                          service.price ?? service.startingPrice ?? '',
                        ).replace(/[^0-9.]/g, ''),
                      );
                      const serviceFinalPrice =
                        Number.isFinite(serviceBasePrice) &&
                        serviceBasePrice > 0
                          ? Math.max(
                              0,
                              Math.round(
                                serviceBasePrice -
                                  (serviceBasePrice * serviceDiscount) / 100,
                              ),
                            )
                          : null;
                      return (
                        <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                          <div>
                            {/* <span className="font-bold text-sm sm:text-xl leading-none">
                              {hasServiceOffer && serviceFinalPrice != null
                                ? `₹${formatPrice(serviceFinalPrice)}`
                                : (service.price ??
                                  service.startingPrice ??
                                  '—')}
                            </span> */}
                            {/* <span className="font-bold text-sm sm:text-xl leading-none">
                              {hasServiceOffer && serviceFinalPrice != null
                                ? `₹${formatPrice(serviceFinalPrice)}`
                                : (() => {
                                    const raw =
                                      service.price ??
                                      service.startingPrice ??
                                      '—';
                                    const rawStr = String(raw).trim();
                                    if (rawStr === '—' || rawStr === '')
                                      return '—';
                                    return /[₹]|rs\.?/i.test(rawStr)
                                      ? rawStr
                                      : `₹${rawStr}`;
                                  })()}
                            </span> */}
                            <span className="font-bold text-sm sm:text-xl leading-none">
                              {hasServiceOffer && serviceFinalPrice != null
                                ? `₹${formatPrice(serviceFinalPrice)}`
                                : (() => {
                                    const raw =
                                      service.price ??
                                      service.startingPrice ??
                                      '—';
                                    const rawStr = String(raw).trim();
                                    if (rawStr === '—' || rawStr === '')
                                      return '—';
                                    const numeric = Number(
                                      rawStr.replace(/[^0-9.]/g, ''),
                                    );
                                    if (
                                      !Number.isFinite(numeric) ||
                                      numeric <= 0
                                    ) {
                                      return /[₹]|rs\.?/i.test(rawStr)
                                        ? rawStr
                                        : `₹${rawStr}`;
                                    }
                                    return `₹${formatPrice(numeric)}`;
                                  })()}
                            </span>
                            {hasServiceOffer && serviceFinalPrice != null ? (
                              <span className="ml-2 text-gray-400 text-xs line-through">
                                ₹{formatPrice(serviceBasePrice)}
                              </span>
                            ) : // ) : service.originalPrice ? (
                            //   <span className="ml-2 text-gray-400 text-xs line-through">
                            //     ₹{service.originalPrice}
                            //   </span>
                            // ) : null}
                            service.originalPrice ? (
                              <span className="ml-2 text-gray-400 text-xs line-through">
                                ₹{formatPrice(service.originalPrice)}
                              </span>
                            ) : null}
                          </div>
                          {hasServiceOffer ? (
                            <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap self-end">
                              {formatPercent(serviceDiscount)} Off
                            </span>
                          ) : null}
                        </div>
                      );
                    })()}

                    {/* BUTTON */}
                    <Link
                      href={`/service/${service._id || service.id}`}
                      className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
                    >
                      Add Service
                    </Link>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : loading ? (
          <div className="flex justify-center py-14">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-14">
            No products available near you.
          </div>
        ) : (
          // <div className="flex overflow-x-auto sm:overflow-visible gap-2 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
          <div className="flex overflow-x-auto sm:overflow-visible gap-1.5 sm:gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide">
            {visibleProducts.map((item) => {
              const isServiceProduct =
                String(item.type || '').toLowerCase() === 'service';
              const isSellProduct =
                String(item.type || '').toLowerCase() === 'sell';
              const detailsHref = isServiceProduct
                ? `/service/${item._id}`
                : isSellProduct
                  ? `/buy-product-details/${item._id}`
                  : `/rent-product-details/${item._id}`;
              const offer = offersByProduct[String(item._id)];
              const rawBase = getRentalListingAmount(item);
              // Custom/manual multi-variant sell listings may leave the
              // top-level price/salesConfiguration empty (each variant
              // carries its own sellPrice). Fall back to the first variant
              // that actually has a sell price, so the card doesn't show ₹0.
              const isSellForPrice =
                String(item.type || '').toLowerCase() === 'sell';
              const effectiveRawBase =
                isSellForPrice && (!rawBase || rawBase <= 0)
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
              // Custom/manual listings store pricing per-variant; template &
              // legacy listings store it at the product level. Gather all
              // priced tiers from both sources and pick the cheapest one.
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
              const base = lowestConfig
                ? lowestConfig.periodUnit === 'day' &&
                  Number(lowestConfig.days) > 0
                  ? Math.round(
                      Number(
                        lowestConfig.customerRent || lowestConfig.pricePerDay,
                      ) / Number(lowestConfig.days),
                    )
                  : // customerRent is already the per-month rate for
                    // month-based configs — use it directly.
                    Math.round(
                      Number(
                        lowestConfig.customerRent || lowestConfig.pricePerDay,
                      ),
                    )
                : effectiveRawBase;
              const priceSuffix =
                item.type === 'Rental'
                  ? lowestConfig?.periodUnit === 'day'
                    ? '/day'
                    : '/month'
                  : '';
              const offerPricing = computeOfferPricing(offer, base);
              const discount = offerPricing.displayPercent;
              const finalPrice = offerPricing.finalPrice;
              const hasOffer = !!offer && offerPricing.discountAmount > 0;
              const isBoosted = boostedProductIds.includes(String(item._id));
              const tag = offer?.sticker || (isBoosted ? 'Bestseller' : '');
              const statusType = item.stock > 0 ? 'delivery' : 'pickup';
              const deliveryEta = getProductDeliveryEtaLabel(item);
              const status =
                item.stock > 0 ? deliveryEta || 'Varies' : 'Out of Stock';
              const rating = Number(item.averageRating || 0).toFixed(1);
              const hasRating = Number(item.numReviews || 0) > 0;

              return (
                // <div
                //   key={item._id}
                //   className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                // >.
                <Link
                  href={detailsHref}
                  key={item._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block w-[52%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink"
                >
                  {/* <div className="relative pt-1 px-1 overflow-hidden">
                    {tag && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                        {tag}
                      </span>
                    )} */}
                  <div className="relative pt-1 px-1 overflow-hidden">
                    {/* <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                      {tag}
                    </span> */}
                    {/* {item?.featured?.enabled &&
                    item?.featured?.status === 'live' ? (
                      <span className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
                        <Star size={10} fill="white" />
                        Featured
                      </span>
                    ) : ( */}
                    {item?.featured?.enabled &&
                    item?.featured?.status === 'live' ? (
                      <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#F97316] text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
                        {/* <Star size={10} fill="white" /> */}
                        Featured
                      </span>
                    ) : (
                      tag && (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                          {tag}
                        </span>
                      )
                    )}

                    <img
                      src={item.image || item.imageUrl || mainimg}
                      alt="product"
                      // className="w-full h-44 sm:h-48 object-cover rounded-xl"
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
                    {/* <button
                      type="button"
                      onClick={(e) => onToggleWishlist(e, item._id)}
                      disabled={togglingId === String(item._id)}
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
                    >
                      <Heart
                        size={16}
                        className={
                          isWished(item._id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-700'
                        }
                      />
                    </button>
                  </div> */}
                    <button
                      type="button"
                      onClick={(e) => onToggleWishlist(e, item._id)}
                      disabled={togglingId === String(item._id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition disabled:opacity-60"
                    >
                      <Heart
                        size={16}
                        className={
                          isWished(item._id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-700'
                        }
                      />
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
                    {/* <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold truncate">
                        {item.productName || item.title || item.name}
                      </h3>
                      {hasRating && (
                        <div className="flex items-center gap-1 text-white text-[11px] bg-emerald-500 px-2 py-0.5 rounded-full">
                          <Star size={12} fill="white" />
                          {rating}
                        </div>
                      )}
                    </div>
                    <div className="mb-2 -ml-4">
                      <span className="inline-block text-[11px] text-gray-500 border border-gray-300 border-l-0 rounded-r-xl px-3 py-1">
                        {item.condition?.trim() ||
                          (item.type === 'Rental' ? 'For Rent' : 'Brand New')}
                      </span>
                    </div> */}
                    {/* <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1"> */}
                    <div className="flex justify-between items-center gap-1 sm:gap-2 mb-0">
                      {/* <h3 className="text-xl font-bold">
                        {item.productName || item.title || item.name}
                      </h3> */}
                      <h3 className="text-sm sm:text-xl font-bold truncate">
                        {item.productName || item.title || item.name}
                      </h3>
                      <span className="inline-block text-[9px] sm:text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap shrink-0">
                        {item.condition?.trim() ||
                          (item.type === 'Rental' ? 'For Rent' : 'Brand New')}
                      </span>
                      {/* <span className="inline-block text-[11px] text-gray-500 border border-gray-300 border-r-0 rounded-l-full px-3 py-1 whitespace-nowrap shrink-0 -mr-3 sm:-mr-4">
                        {item.condition?.trim() ||
                          (item.type === 'Rental' ? 'For Rent' : 'Brand New')}
                      </span> */}
                    </div>
                    {/* <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                      <div>
                      
                        <span className="font-bold text-sm sm:text-xl leading-none">
                          ₹{formatPrice(hasOffer ? finalPrice : base)}
                        </span> */}
                    {/* <div className="flex items-end justify-between gap-1 sm:gap-2 mb-0 sm:mb-0.5">
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
                    </div> */}
                    <div className="flex flex-nowrap items-end justify-between gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <div className="min-w-0 flex flex-nowrap items-end gap-1 sm:gap-2 w-full">
                        <div>
                          {/* <span className="font-bold text-xl leading-none">
                            ₹{hasOffer ? finalPrice : base}
                          </span> */}
                          <span className="font-bold text-sm sm:text-xl leading-none">
                            ₹{formatPrice(hasOffer ? finalPrice : base)}
                          </span>
                          {/* <span className="ml-1 text-base font-bold">
                            {priceSuffix}
                          </span> */}
                          <span className="text-xs sm:text-base font-bold">
                            {priceSuffix}
                          </span>
                          {/* {hasOffer ? (
                            <span className="ml-2 text-gray-400 text-xs line-through">
                              ₹{base}
                            </span>
                          ) : null} */}
                          {hasOffer ? (
                            <span className="ml-2 text-gray-400 text-xs line-through">
                              ₹{formatPrice(base)}
                            </span>
                          ) : null}
                        </div>
                        {hasOffer ? (
                          <span className="ml-auto inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap shrink-0">
                            {formatPercent(discount)} Off
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {/* <Link
                      href={detailsHref}
                      className={`flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-xl text-sm font-medium transition ${
                        item.stock > 0
                          ? 'bg-[#F97316] text-white hover:bg-orange-600'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {item.stock > 0 && <ShoppingCart size={16} />}
                      {item.stock > 0
                        ? String(item.type || '').toLowerCase() === 'sell'
                          ? 'Buy Now'
                          : 'Rent Now'
                        : 'Details'}
                    </Link> */}
                    {(() => {
                      // Custom/manual listings store tenure config per
                      // variant; template/legacy listings store it at the
                      // product level. Check both so day-wise custom
                      // listings correctly show only the "View" button.
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
                        // Out of stock: Details + Notify Me
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
                        // Daily rental: only View button → goes to detail page
                        return (
                          <Link
                            href={detailsHref}
                            className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
                          >
                            {String(item.type || '').toLowerCase() === 'sell'
                              ? 'Buy Now'
                              : 'View'}
                          </Link>
                        );
                      }

                      // In stock, monthly rental or sell: View + Add to Cart
                      const isSell =
                        String(item.type || '').toLowerCase() === 'sell';

                      // Pick lowest price plan for cart
                      // Pick lowest price plan for cart — check variant-level
                      // rentalConfigurations first (custom listings), falling
                      // back to product-level (template/legacy listings).
                      // Build separate candidate groups — product-level list,
                      // and each variant's own list — instead of merging them
                      // into one array. This way the tenure options shown in
                      // the cart always belong to a single source (the one
                      // that produced the cheapest plan), never a mix of
                      // multiple variants' tenures.
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
                            // For month plans, price is already the
                            // per-month rate — don't divide by months.
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
                        // For month plans, price is already the per-month
                        // rate — don't divide by months.
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
                      // const cartPrice =
                      //   lowestPlan?.price || getRentalListingAmount(item);
                      // const cartMonths = lowestPlan?.months || 1;
                      // const cartTenureUnit = lowestPlan?.periodUnit || 'month';

                      // const offer = offersByProduct[String(item._id)];
                      // const discount = Number(offer?.discountPercent || 0);
                      // const finalCartPrice =
                      //   discount > 0
                      //     ? Math.max(
                      //         0,
                      //         Math.round(
                      //           cartPrice - (cartPrice * discount) / 100,
                      //         ),
                      //       )
                      //     : cartPrice;
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
                        // Custom/manual multi-variant sell listings: fall
                        // back to the first variant's own sellPrice.
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

                      // For month plans, lowestPlan.price is the per-month
                      // rate — multiply by months to get the total tenure
                      // price dispatched to the cart (day plans unchanged).
                      // const cartPrice = isSell
                      //   ? sellBasePrice || getRentalListingAmount(item)
                      //   : lowestPlan
                      //     ? lowestPlan.periodUnit === 'day'
                      //       ? lowestPlan.price
                      //       : lowestPlan.price * (lowestPlan.months || 1)
                      //     : getRentalListingAmount(item);
                      const cartPrice = isSell
                        ? sellBasePrice || getRentalListingAmount(item)
                        : lowestPlan
                          ? lowestPlan.price
                          : getRentalListingAmount(item);
                      const cartMonths = lowestPlan?.months || 1;
                      const cartTenureUnit = lowestPlan?.periodUnit || 'month';

                      const offer = offersByProduct[String(item._id)];
                      const cartOfferPricing = computeOfferPricing(
                        offer,
                        cartPrice,
                      );
                      const finalCartPrice = cartOfferPricing.finalPrice;

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
                            onClick={async (e) => {
                              e.preventDefault();
                              // dispatch(
                              //   addToCart({
                              //     productId: item._id,
                              //     variantId: null,
                              //     variantName: '',
                              //     quantity: 1,
                              //     rentalMonths: cartMonths,
                              //     pricePerDay: finalCartPrice,
                              //     title:
                              //       item.productName ||
                              //       item.title ||
                              //       item.name ||
                              //       '',
                              //     image: item.image || item.imageUrl || '',
                              //     tenureUnit: cartTenureUnit,
                              //     refundableDeposit: Number(
                              //       item.refundableDeposit || 0,
                              //     ),
                              //     rentalConfigurations:
                              //       item.rentalConfigurations || [],
                              //   }),
                              // );
                              // router.push('/cart');
                              // Fetch full product to get subCategoryTax
                              // let fullProduct = null;
                              // try {
                              //   const res = await apiGetProductById(item._id);
                              //   fullProduct = res.data?.product || null;
                              // } catch {}
                              // Prefer subCategoryTax already present on the
                              // list item; only hit the network if missing.
                              // Full product fetch no longer needed for
                              // sell items — cart slice auto-calculates
                              // tax/delivery when tax override fields are
                              // omitted (matches BuySimilarProducts).
                              let fullProduct = null;

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
                                        originalPricePerDay: cartPrice,
                                        title:
                                          item.productName ||
                                          item.title ||
                                          item.name ||
                                          '',
                                        image:
                                          item.image || item.imageUrl || '',
                                        tenureUnit: 'month',
                                        productType: 'Sell',
                                        refundableDeposit: 0,
                                        condition:
                                          item?.condition || 'Brand New',
                                        offer: offer || null,
                                        rentalConfigurations: [],
                                      }
                                    : // : {
                                      //     productId: item._id,
                                      //     variantId: null,
                                      //     variantName: '',
                                      //     quantity: 1,
                                      //     rentalMonths: cartMonths,
                                      //     pricePerDay: finalCartPrice,
                                      //     title:
                                      //       item.productName ||
                                      //       item.title ||
                                      //       item.name ||
                                      //       '',
                                      //     image:
                                      //       item.image || item.imageUrl || '',
                                      //     tenureUnit: cartTenureUnit,
                                      //     refundableDeposit: Number(
                                      //       item.refundableDeposit || 0,
                                      //     ),
                                      //     rentalConfigurations:
                                      //       item.rentalConfigurations || [],
                                      //   },
                                      {
                                        productId: item._id,
                                        variantId: null,
                                        variantName: '',
                                        quantity: 1,
                                        rentalMonths: cartMonths,
                                        pricePerDay: finalCartPrice,
                                        originalPricePerDay: cartPrice,
                                        title:
                                          item.productName ||
                                          item.title ||
                                          item.name ||
                                          '',
                                        image:
                                          item.image || item.imageUrl || '',
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
                                          fullProduct?.subCategoryTax
                                            ?.defaultGst ??
                                          item?.subCategoryTax?.defaultGst ??
                                          null,
                                        defaultCareTax:
                                          fullProduct?.subCategoryTax
                                            ?.defaultCareTax ??
                                          item?.subCategoryTax
                                            ?.defaultCareTax ??
                                          null,
                                        defaultRepairWarranty:
                                          fullProduct?.subCategoryTax
                                            ?.defaultRepairWarranty ??
                                          item?.subCategoryTax
                                            ?.defaultRepairWarranty ??
                                          null,
                                        defaultRelocationWarranty:
                                          fullProduct?.subCategoryTax
                                            ?.defaultRelocationWarranty ??
                                          item?.subCategoryTax
                                            ?.defaultRelocationWarranty ??
                                          null,
                                        defaultDeliveryPackaging:
                                          fullProduct?.subCategoryTax
                                            ?.defaultDeliveryPackaging ??
                                          item?.subCategoryTax
                                            ?.defaultDeliveryPackaging ??
                                          null,
                                        defaultInstallationFee:
                                          fullProduct?.subCategoryTax
                                            ?.defaultInstallationFee ??
                                          item?.subCategoryTax
                                            ?.defaultInstallationFee ??
                                          null,
                                        defaultPlatformFee:
                                          fullProduct?.subCategoryTax
                                            ?.defaultPlatformFee ??
                                          item?.subCategoryTax
                                            ?.defaultPlatformFee ??
                                          null,
                                        taxBlocked:
                                          fullProduct?.subCategoryTax
                                            ?.taxBlocked ??
                                          item?.subCategoryTax?.taxBlocked ??
                                          false,
                                      },
                                ),
                                //     );
                                //     router.push('/cart');
                                //   }}
                                //   className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 transition"
                                // >
                                //   {isSell ? 'Cart' : 'Cart'}
                              );
                            }}
                            className="flex items-center justify-center gap-1 flex-1 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 transition"
                          >
                            {isSell ? 'Cart' : 'Cart'}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {activeTab !== 'Services' &&
          sortedFilteredProducts.length > cardsPerPage && (
            // <div className="flex justify-center items-center gap-3 mt-10 flex-wrap">
            <div className="hidden sm:flex justify-center items-center gap-3 mt-10 flex-wrap">
              <button
                onClick={prevSlide}
                disabled={page === 0}
                className="p-2.5 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF6F00] text-sm font-semibold text-white">
                {page + 1}
              </span>

              <button
                onClick={nextSlide}
                disabled={
                  (page + 1) * cardsPerPage >= sortedFilteredProducts.length
                }
                className="p-2.5 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
      </div>
    </section>
  );
};

export default Trending;
