// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Heart,
//   ShieldCheck,
//   Truck,
//   BadgeCheck,
//   Star,
//   ChevronLeft,
//   ChevronRight,
//   Package,
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { apiGetMyWishlist, apiToggleWishlist } from '@/lib/api';
// import { addToCart } from '@/store/slices/cartSlice';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const FALLBACK_IMAGES = [
//   'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
//   'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
//   'https://images.unsplash.com/photo-1512495039889-52a3b799c9c7?auto=format&fit=crop&w=1200&q=80',
// ];

// function formatPrice(n) {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num)) return '0';
//   return num.toLocaleString('en-IN');
// }

// function formatPercent(n) {
//   const num = Number(n || 0);
//   if (!Number.isFinite(num) || num <= 0) return '0%';
//   const rounded = Math.round(num * 10) / 10;
//   return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
// }

// function parseSellPrice(product) {
//   if (product?.salesConfiguration?.salePrice != null) {
//     const n = Number(product.salesConfiguration.salePrice);
//     if (Number.isFinite(n) && n > 0) return n;
//   }
//   const s = String(product?.price || '')
//     .replace(/[^\d.]/g, '')
//     .trim();
//   const n = Number(s);
//   return Number.isFinite(n) && n > 0 ? n : 0;
// }

// /** Prefer the selected variant's own sellPrice (per-variant custom listings); fall back to product-level price. */
// function parseVariantSellPrice(product, variant) {
//   const vPrice = Number(variant?.sellPrice);
//   if (Number.isFinite(vPrice) && vPrice > 0) return vPrice;
//   return parseSellPrice(product);
// }

// /** Prefer the selected variant's own mrpPrice; fall back to product-level mrpPrice. */
// function parseVariantMrpPrice(product, variant) {
//   const vMrp = Number(variant?.mrpPrice);
//   if (Number.isFinite(vMrp) && vMrp > 0) return vMrp;
//   if (product?.salesConfiguration?.mrpPrice != null) {
//     const n = Number(product.salesConfiguration.mrpPrice);
//     if (Number.isFinite(n) && n > 0) return n;
//   }
//   return 0;
// }

// const BuyPrdctMain = ({
//   product,
//   offer,
//   selectedVariantIdx,
//   setSelectedVariantIdx,
// }) => {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

//   // console.log('offers', offers);
//   console.log('productId', product?._id);

//   const [wishedIds, setWishedIds] = useState([]);
//   const [togglingId, setTogglingId] = useState('');
//   const [mainImg, setMainImg] = useState(() => {
//     if (Array.isArray(product?.images) && product.images.length) {
//       return product.images[0];
//     }
//     if (product?.image) return product.image;
//     return FALLBACK_IMAGES[0];
//   });
//   const [thumbStart, setThumbStart] = useState(0);
//   const THUMBS_PER_VIEW = 5;

//   const [currentStock, setCurrentStock] = useState(
//     typeof product?.stock === 'number' ? product.stock : 0,
//   );

//   // const gallery = useMemo(() => {
//   //   const imgs = Array.isArray(product?.images)
//   //     ? product.images.filter(Boolean)
//   //     : [];
//   //   if (imgs.length) return imgs.slice(0, 10);
//   //   if (product?.image) return [product.image, ...FALLBACK_IMAGES.slice(0, 3)];
//   //   return FALLBACK_IMAGES;
//   // }, [product?.images, product?.image]);

//   const variants = useMemo(
//     () => (Array.isArray(product?.variants) ? product.variants : []),
//     [product?.variants],
//   );

//   const gallery = useMemo(() => {
//     const imgs = Array.isArray(product?.images)
//       ? product.images.filter(Boolean)
//       : [];
//     const allImgs = imgs.length
//       ? imgs
//       : product?.image
//         ? [product.image, ...FALLBACK_IMAGES.slice(0, 3)]
//         : FALLBACK_IMAGES;

//     // Split per variant if multiple variants exist
//     if (variants.length > 1 && allImgs.length > 1) {
//       const perVariant = Math.ceil(allImgs.length / variants.length);
//       const start = selectedVariantIdx * perVariant;
//       const slice = allImgs.slice(start, start + perVariant);
//       return slice.length > 0 ? slice : allImgs.slice(0, perVariant);
//     }

//     return allImgs.slice(0, 10);
//   }, [product?.images, product?.image, variants, selectedVariantIdx]);

//   const maxThumbStart = Math.max(0, gallery.length - THUMBS_PER_VIEW);
//   const visibleThumbs = gallery.slice(thumbStart, thumbStart + THUMBS_PER_VIEW);
//   useEffect(() => {
//     setThumbStart(0);
//     if (gallery.length) setMainImg(gallery[0]);
//   }, [gallery]);

//   useEffect(() => {
//     setCurrentStock(typeof product?.stock === 'number' ? product.stock : 0);
//   }, [product?.stock]);

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

//   const onToggleWishlist = async () => {
//     if (!isAuthenticated || !product?._id) return;

//     setTogglingId(String(product._id));

//     try {
//       const res = await apiToggleWishlist(product._id);
//       const wished = !!res.data?.wished;

//       setWishedIds((prev) => {
//         const pid = String(product._id);

//         if (wished) {
//           return prev.includes(pid) ? prev : [...prev, pid];
//         }

//         return prev.filter((x) => x !== pid);
//       });
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setTogglingId('');
//     }
//   };

//   const conditionLabel = useMemo(() => {
//     const raw = String(product?.condition || '').trim();
//     if (!raw) return 'Brand New';
//     return raw;
//   }, [product?.condition]);

//   // const price = useMemo(() => parseSellPrice(product), [product]);
//   // // const offerDiscount = Number(product?.offer?.discountPercent || 0);
//   // const matchedOffer = offers?.find(
//   //   (item) => item?.productId?._id === product?._id && item?.isActive,
//   // );

//   const selectedVariant = variants[selectedVariantIdx] || null;
//   const price = useMemo(
//     () => parseVariantSellPrice(product, selectedVariant),
//     [product, selectedVariant],
//   );
//   const variantMrp = useMemo(
//     () => parseVariantMrpPrice(product, selectedVariant),
//     [product, selectedVariant],
//   );
//   const offerDiscount = Number(offer?.discountPercent || 0);

//   const finalPrice =
//     offerDiscount > 0
//       ? Math.round(price - (price * offerDiscount) / 100)
//       : price;

//   const displayMrp =
//     offerDiscount > 0 ? price : variantMrp > price ? variantMrp : null;
//   // const mrp = useMemo(() => {
//   //   if (product?.salesConfiguration?.mrpPrice != null) {
//   //     const n = Number(product.salesConfiguration.mrpPrice);
//   //     if (Number.isFinite(n) && n > 0) return n;
//   //   }
//   //   if (price > 0) return Math.round(price * 1.2);
//   //   return 0;
//   // }, [product, price]);

//   // const discountPct =
//   //   price > 0 && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

//   const deliveryText = useMemo(() => {
//     const rawValue = product?.logisticsVerification?.deliveryTimelineValue;
//     const rawUnit = String(
//       product?.logisticsVerification?.deliveryTimelineUnit || 'Days',
//     ).trim();
//     const n = Number(rawValue);
//     if (Number.isFinite(n) && n > 0) {
//       const unit = rawUnit || 'Days';
//       return `${n} ${unit}`;
//     }
//     return 'Tomorrow, 4 PM';
//   }, [
//     product?.logisticsVerification?.deliveryTimelineValue,
//     product?.logisticsVerification?.deliveryTimelineUnit,
//   ]);

//   const totalReviews = Array.isArray(product?.reviews)
//     ? product.reviews.length
//     : 0;

//   const averageRating =
//     totalReviews > 0
//       ? (
//           product.reviews.reduce(
//             (acc, item) => acc + Number(item.rating || 0),
//             0,
//           ) / totalReviews
//         ).toFixed(1)
//       : 0;

//   // const goToCheckout = () => {
//   //   if (typeof window !== 'undefined' && product?._id) {
//   //     sessionStorage.setItem(
//   //       'rentpay_checkout_focus_product_id',
//   //       String(product._id),
//   //     );
//   //   }
//   //   dispatch(
//   //     addToCart({
//   //       productId: product?._id,
//   //       quantity: 1,
//   //       rentalMonths: 1,
//   //       tenureUnit: 'month',
//   //       pricePerDay: price || 0,
//   //       title: product?.productName || 'Buy product',
//   //       image: gallery[0] || product?.image || '',
//   //       productType: 'Sell',
//   //       refundableDeposit: 0,
//   //     }),
//   //   );
//   //   router.push('/checkout');
//   // };

//   //updated version
//   const goToCheckout = () => {
//     if (currentStock <= 0) return;

//     if (typeof window !== 'undefined' && product?._id) {
//       sessionStorage.setItem(
//         'rentpay_checkout_focus_product_id',
//         String(product._id),
//       );
//     }

//     dispatch(
//       addToCart({
//         productId: product?._id,
//         variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//         variantName: variants[selectedVariantIdx]?.variantName || '',
//         quantity: 1,
//         rentalMonths: 1,
//         tenureUnit: 'month',
//         pricePerDay: finalPrice || 0,
//         title: product?.productName || 'Buy product',
//         image: gallery[0] || product?.image || '',
//         productType: 'Sell',
//         refundableDeposit: 0,
//         condition: product?.condition || 'Brand New',
//       }),
//     );

//     router.push('/checkout');
//   };

//   // const goToCart = () => {
//   //   dispatch(
//   //     addToCart({
//   //       productId: product?._id,
//   //       quantity: 1,
//   //       rentalMonths: 1,
//   //       tenureUnit: 'month',
//   //       pricePerDay: price || 0,
//   //       title: product?.productName || 'Buy product',
//   //       image: gallery[0] || product?.image || '',
//   //       productType: 'Sell',
//   //       refundableDeposit: 0,
//   //     }),
//   //   );
//   //   router.push('/cart');
//   // };

//   const goToCart = () => {
//     if (currentStock <= 0) return;

//     dispatch(
//       addToCart({
//         productId: product?._id,
//         variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//         variantName: variants[selectedVariantIdx]?.variantName || '',
//         quantity: 1,
//         rentalMonths: 1,
//         tenureUnit: 'month',
//         pricePerDay: finalPrice || 0,
//         title: product?.productName || 'Buy product',
//         image: gallery[0] || product?.image || '',
//         productType: 'Sell',
//         refundableDeposit: 0,
//         condition: product?.condition || 'Brand New',
//       }),
//     );

//     toast.success('Added to cart successfully', {
//       position: 'top-right',
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'light',
//     });
//   };
//   return (
//     <section className="w-full  px-3 sm:px-4 py-5 sm:py-8">
//       <div className="w-full mx-auto">
//         {/* <div className="text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
//           Home <span className="mx-1">›</span>{' '}
//           {product?.category || 'Electronics'} <span className="mx-1">›</span>{' '}
//           {product?.subCategory || 'Mobiles'}
//         </div> */}
//         <p className="lg:hidden text-xs sm:text-sm truncate mb-3">
//           <a
//             href="/"
//             className="text-gray-400  hover:text-orange-500 font-medium"
//           >
//             Home
//           </a>
//           <span className="text-gray-400 mx-1">&gt;</span>
//           <span className="text-orange-500">Buy Detail</span>
//         </p>

//         <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5 lg:gap-7">
//           {/* Left block */}
//           <div className="bg-white rounded-2xl">
//             <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
//               <div className="absolute top-3 left-3 z-10">
//                 <span className="inline-flex items-center rounded-full bg-[#F97316] text-white px-3 py-1 text-[10px] sm:text-xs font-semibold">
//                   {/* <span className="mr-1.5">•</span> */}
//                   {conditionLabel === 'Brand New' ? 'Brand New' : 'Refurbished'}
//                 </span>
//               </div>

//               <div className="absolute top-3 right-3 z-10">
//                 <button
//                   type="button"
//                   onClick={onToggleWishlist}
//                   disabled={togglingId === String(product?._id)}
//                   className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition disabled:opacity-60"
//                 >
//                   <Heart
//                     className={`h-4 w-4 ${
//                       isWished(product?._id)
//                         ? 'text-red-500 fill-red-500'
//                         : 'text-gray-500'
//                     }`}
//                   />
//                 </button>
//               </div>

//               <img
//                 src={mainImg}
//                 alt={product?.productName || 'Product'}
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="mt-3 flex items-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => setThumbStart((p) => Math.max(0, p - 1))}
//                 disabled={thumbStart === 0}
//                 className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
//                 aria-label="Previous images"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               <div className="grid flex-1 grid-cols-4 gap-2 sm:grid-cols-5">
//                 {visibleThumbs.map((src, idx) => (
//                   <button
//                     key={`${src}-${thumbStart + idx}`}
//                     type="button"
//                     onClick={() => setMainImg(src)}
//                     className={`h-14 sm:h-16 rounded-lg overflow-hidden border ${
//                       mainImg === src
//                         ? 'border-orange-500 ring-1 ring-orange-200'
//                         : 'border-gray-200'
//                     }`}
//                   >
//                     <img
//                       src={src}
//                       alt=""
//                       className="h-full w-full object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setThumbStart((p) => Math.min(maxThumbStart, p + 1))
//                 }
//                 disabled={thumbStart >= maxThumbStart}
//                 className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
//                 aria-label="Next images"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//             {variants.length > 1 && (
//               <div className="mt-3 sm:mt-4">
//                 <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
//                   Select Variant
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {variants.map((v, idx) => {
//                     const isSelected = selectedVariantIdx === idx;
//                     const variantImages = (() => {
//                       const fromDb = Array.isArray(product?.images)
//                         ? product.images.filter(Boolean)
//                         : [];
//                       const allImgs =
//                         fromDb.length > 0 ? fromDb : FALLBACK_IMAGES;
//                       const perVariant = Math.ceil(
//                         allImgs.length / variants.length,
//                       );
//                       const start = idx * perVariant;
//                       const slice = allImgs.slice(start, start + perVariant);
//                       return slice.length > 0 ? slice : allImgs.slice(0, 1);
//                     })();
//                     return (
//                       <button
//                         key={v.variantName || idx}
//                         type="button"
//                         onClick={() => {
//                           setSelectedVariantIdx(idx);
//                           setMainImg(variantImages[0]);
//                         }}
//                         className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
//                           isSelected
//                             ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-400'
//                             : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
//                         }`}
//                       >
//                         <img
//                           src={variantImages[0]}
//                           alt={v.variantName}
//                           className="w-8 h-8 object-cover rounded"
//                         />
//                         <span>{v.variantName}</span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right block */}
//           <div className="space-y-3 sm:space-y-4">
//             <p className="hidden lg:block text-xs sm:text-sm truncate mb-3 sm:mb-4">
//               <a
//                 href="/"
//                 className="text-gray-400  hover:text-[#F97316] font-medium"
//               >
//                 Home
//               </a>
//               <span className="text-gray-400 mx-1">&gt;</span>
//               <span className="text-[#F97316]">Buy Detail</span>
//             </p>
//             {/* <div>

//               <h1 className="text-2xl sm:text-[32px] leading-tight font-semibold text-black">
//                 {product?.productName || 'Buy product'}
//               </h1>

//               {currentStock > 0 ? (
//                 <p className="text-green-600  text-xs  px-2.5 py-1 rounded-full mt-1 font-medium">
//                   {currentStock} in stock
//                 </p>
//               ) : (
//                 <p className="text-red-700 bg-red-100  px-2.5 py-1 rounded-full text-sm mt-1 font-medium">
//                   Out of stock
//                 </p>
//               )}
//               <div className="mt-2 flex items-center gap-2">
//                 <span className="inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-white text-[11px] font-semibold">
//                   <Star className="h-3 w-3 fill-white text-white" />
//                   4.8
//                 </span>
//                 <span className="text-xs sm:text-sm text-gray-500 underline">
//                   124 Ratings
//                 </span>
//               </div>
//             </div> */}

//             <div>
//               {/* Product title + stock same row */}
//               <div className="flex flex-row items-start justify-between gap-2">
//                 <h1 className="text-2xl sm:text-[32px] leading-tight font-semibold text-black">
//                   {product?.productName || 'Buy product'}
//                 </h1>

//                 {currentStock > 0 ? (
//                   <p className="shrink-0 text-green-600 bg-green-100 border border-green-300 px-2.5 py-1 rounded-full text-xs font-medium">
//                     {currentStock} in stock
//                   </p>
//                 ) : (
//                   <p className="shrink-0 text-red-700 bg-red-100 border border-red-300 px-2.5 py-1 rounded-full text-xs font-medium">
//                     Out of stock
//                   </p>
//                 )}
//               </div>

//               {/* Rating below title */}
//               {Number(totalReviews) > 0 && Number(averageRating) > 0 && (
//                 <div className="mt-1.5 flex items-center gap-2">
//                   <span className="inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-white text-[11px] font-semibold">
//                     <Star className="h-3 w-3 fill-white text-white" />
//                     {Number(averageRating).toFixed(1)}
//                   </span>

//                   <span className="text-xs sm:text-sm text-gray-500 underline">
//                     {totalReviews} {totalReviews === 1 ? 'Rating' : 'Ratings'}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* <div className="rounded-xl border border-gray-200 bg-gray-100/70 px-4 py-4">
//               <div className="flex items-end gap-2 sm:gap-3">
//                 <span className="text-3xl sm:text-[40px] leading-none font-semibold text-black">
//                   ₹{price || 0}
//                 </span>
//                 {mrp > price ? (
//                   <span className="text-sm text-gray-400 line-through pb-1">
//                     ₹{mrp}
//                   </span>
//                 ) : null}
//                 {discountPct > 0 ? (
//                   <span className="text-sm sm:text-base font-semibold text-[#10B981] pb-1">
//                     {discountPct}% OFF
//                   </span>
//                 ) : null}
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 inclusive of all taxes
//               </p>
//             </div> */}
//             {/* <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-[#FFFBEB] to-[#FFF7ED] px-4 py-4">
//               <div className="flex items-end gap-2 sm:gap-3">
//                 <span className="text-3xl sm:text-[40px] leading-none font-semibold text-black">
//                   ₹{formatPrice(finalPrice)}
//                 </span>

//                 {displayMrp ? (
//                   <span className="text-lg text-gray-400 line-through pb-1">
//                     ₹{formatPrice(displayMrp)}
//                   </span>
//                 ) : null}
//               </div>

//               <p className="text-xs text-gray-500 mt-1">
//                 inclusive of all taxes
//               </p>
//             </div> */}
//             <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-[#FFFBEB] to-[#FFF7ED] px-4 py-4">
//               <div className="flex items-end gap-1 sm:gap-3">
//                 <span className="text-3xl sm:text-[40px] leading-none font-semibold text-black">
//                   ₹{formatPrice(finalPrice)}
//                 </span>

//                 {displayMrp ? (
//                   <span className="text-xl text-gray-400 line-through pb-1">
//                     ₹{formatPrice(displayMrp)}
//                   </span>
//                 ) : null}

//                 {offerDiscount > 0 ? (
//                   <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs sm:text-xs font-semibold text-[#F97316] border-[#F97316] bg-orange-50 mb-1">
//                     {formatPercent(offerDiscount)} Off
//                   </span>
//                 ) : null}
//               </div>

//               <p className="text-xs font-semibold text-gray-500 mt-1">
//                 inclusive of all taxes
//               </p>
//             </div>

//             <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
//               <h3 className="text-base font-semibold text-black mb-3">
//                 Why Trust This Product?
//               </h3>
//               <div className="space-y-3">
//                 {/* <div className="flex items-start gap-2.5">
//                   <BadgeCheck className="h-4 w-4 text-blue-500 mt-0.5" />
//                   <div>
//                     <p className="text-sm text-black">
//                       Condition:{' '}
//                       <span className="font-medium">{conditionLabel}</span>
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Quality checked by seller
//                     </p>
//                   </div>
//                 </div> */}
//                 <div className="flex items-start gap-2.5">
//                   <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
//                     <Package className="h-4 w-4 text-[#F97316]" />
//                   </div>

//                   <div>
//                     <p className="text-sm text-black">
//                       Condition:{' '}
//                       <span className="font-medium">{conditionLabel}</span>
//                     </p>

//                     <p className="text-xs text-gray-500">
//                       Quality checked by seller
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-2.5">
//                   <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
//                     <ShieldCheck className="h-4 w-4 text-[#F97316]" />
//                   </div>

//                   <div>
//                     <p className="text-sm text-black">1-Year Brand Warranty</p>

//                     <p className="text-xs text-gray-500">
//                       Official seller warranty
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-2.5">
//                   <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
//                     <Truck className="h-4 w-4 text-[#F97316]" />
//                   </div>

//                   <div>
//                     <p className="text-sm text-black">
//                       Delivered in {deliveryText}
//                     </p>

//                     <p className="text-xs text-gray-500">
//                       Express delivery within city
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* <button
//               type="button"
//               onClick={goToCheckout}
//               className="w-full rounded-xl bg-orange-500 text-white font-semibold py-3 hover:bg-orange-600"
//             >
//               Buy Now
//             </button> */}
//             {/* <button
//               type="button"
//               onClick={goToCheckout}
//               disabled={currentStock <= 0}
//               className={`w-full rounded-xl font-semibold py-3 transition
//     ${
//       currentStock <= 0
//         ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//         : 'bg-orange-500 text-white hover:bg-orange-600'
//     }`}
//             >
//               {currentStock <= 0 ? 'Buy Now' : 'Buy Now'}
//             </button> */}
//             {/* <button
//               type="button"
//               onClick={goToCart}
//               className="w-full rounded-xl border border-[#2563EB] text-[#2563EB] font-semibold py-3 hover:bg-blue-50"
//             >
//               Add to Cart
//             </button> */}
//             <button
//               type="button"
//               onClick={goToCart}
//               disabled={currentStock <= 0}
//               className={`w-full rounded-xl font-semibold py-3 transition
//     ${
//       currentStock <= 0
//         ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
//         : 'border border-orange-500 bg-[#F97316] text-white'
//     }`}
//             >
//               Add to Cart
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BuyPrdctMain;

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShieldCheck,
  Truck,
  BadgeCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { apiGetMyWishlist, apiToggleWishlist } from '@/lib/api';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512495039889-52a3b799c9c7?auto=format&fit=crop&w=1200&q=80',
];

function formatPrice(n) {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('en-IN');
}

function formatPercent(n) {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return '0%';
  const rounded = Math.round(num * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

function parseSellPrice(product) {
  if (product?.salesConfiguration?.salePrice != null) {
    const n = Number(product.salesConfiguration.salePrice);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const s = String(product?.price || '')
    .replace(/[^\d.]/g, '')
    .trim();
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Prefer the selected variant's own sellPrice (per-variant custom listings); fall back to product-level price. */
function parseVariantSellPrice(product, variant) {
  const vPrice = Number(variant?.sellPrice);
  if (Number.isFinite(vPrice) && vPrice > 0) return vPrice;
  return parseSellPrice(product);
}

/** Prefer the selected variant's own mrpPrice; fall back to product-level mrpPrice. */
function parseVariantMrpPrice(product, variant) {
  const vMrp = Number(variant?.mrpPrice);
  if (Number.isFinite(vMrp) && vMrp > 0) return vMrp;
  if (product?.salesConfiguration?.mrpPrice != null) {
    const n = Number(product.salesConfiguration.mrpPrice);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

// const BuyPrdctMain = ({
//   product,
//   offer,
//   selectedVariantIdx,
//   setSelectedVariantIdx,
// }) => {
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

const BuyPrdctMain = ({
  product,
  offer,
  selectedVariantIdx,
  setSelectedVariantIdx,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  // console.log('offers', offers);
  console.log('productId', product?._id);

  const [wishedIds, setWishedIds] = useState([]);
  const [togglingId, setTogglingId] = useState('');
  const [mainImg, setMainImg] = useState(() => {
    if (Array.isArray(product?.images) && product.images.length) {
      return product.images[0];
    }
    if (product?.image) return product.image;
    return FALLBACK_IMAGES[0];
  });
  const [thumbStart, setThumbStart] = useState(0);
  const THUMBS_PER_VIEW = 5;

  const [currentStock, setCurrentStock] = useState(
    typeof product?.stock === 'number' ? product.stock : 0,
  );

  // const gallery = useMemo(() => {
  //   const imgs = Array.isArray(product?.images)
  //     ? product.images.filter(Boolean)
  //     : [];
  //   if (imgs.length) return imgs.slice(0, 10);
  //   if (product?.image) return [product.image, ...FALLBACK_IMAGES.slice(0, 3)];
  //   return FALLBACK_IMAGES;
  // }, [product?.images, product?.image]);

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants],
  );

  const gallery = useMemo(() => {
    const imgs = Array.isArray(product?.images)
      ? product.images.filter(Boolean)
      : [];
    const allImgs = imgs.length
      ? imgs
      : product?.image
        ? [product.image, ...FALLBACK_IMAGES.slice(0, 3)]
        : FALLBACK_IMAGES;

    // Split per variant if multiple variants exist
    if (variants.length > 1 && allImgs.length > 1) {
      const perVariant = Math.ceil(allImgs.length / variants.length);
      const start = selectedVariantIdx * perVariant;
      const slice = allImgs.slice(start, start + perVariant);
      return slice.length > 0 ? slice : allImgs.slice(0, perVariant);
    }

    return allImgs.slice(0, 10);
  }, [product?.images, product?.image, variants, selectedVariantIdx]);

  const maxThumbStart = Math.max(0, gallery.length - THUMBS_PER_VIEW);
  const visibleThumbs = gallery.slice(thumbStart, thumbStart + THUMBS_PER_VIEW);
  useEffect(() => {
    setThumbStart(0);
    if (gallery.length) setMainImg(gallery[0]);
  }, [gallery]);

  // Current index of mainImg within gallery[] — used for arrows & swipe
  const currentImgIdx = Math.max(0, gallery.indexOf(mainImg));

  const goToImage = (idx) => {
    if (!gallery.length) return;
    const safeIdx = ((idx % gallery.length) + gallery.length) % gallery.length; // wrap around
    setMainImg(gallery[safeIdx]);
    if (safeIdx < thumbStart) {
      setThumbStart(safeIdx);
    } else if (safeIdx >= thumbStart + THUMBS_PER_VIEW) {
      setThumbStart(Math.max(0, safeIdx - THUMBS_PER_VIEW + 1));
    }
  };

  const goPrevImage = () => goToImage(currentImgIdx - 1);
  const goNextImage = () => goToImage(currentImgIdx + 1);

  // Touch swipe support for mobile (finger swipe on main image) — declared
  // unconditionally at top level so hook order stays consistent.
  const touchStartXRef = useRef(null);
  const touchDeltaXRef = useRef(0);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartXRef.current == null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    const SWIPE_THRESHOLD = 40; // px
    if (Math.abs(touchDeltaXRef.current) > SWIPE_THRESHOLD) {
      if (touchDeltaXRef.current < 0) {
        goNextImage(); // swiped left → next image
      } else {
        goPrevImage(); // swiped right → previous image
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  useEffect(() => {
    setCurrentStock(typeof product?.stock === 'number' ? product.stock : 0);
  }, [product?.stock]);

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

  const onToggleWishlist = async () => {
    if (!isAuthenticated || !product?._id) return;

    setTogglingId(String(product._id));

    try {
      const res = await apiToggleWishlist(product._id);
      const wished = !!res.data?.wished;

      setWishedIds((prev) => {
        const pid = String(product._id);

        if (wished) {
          return prev.includes(pid) ? prev : [...prev, pid];
        }

        return prev.filter((x) => x !== pid);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setTogglingId('');
    }
  };

  const conditionLabel = useMemo(() => {
    const raw = String(product?.condition || '').trim();
    if (!raw) return 'Brand New';
    return raw;
  }, [product?.condition]);

  // const price = useMemo(() => parseSellPrice(product), [product]);
  // // const offerDiscount = Number(product?.offer?.discountPercent || 0);
  // const matchedOffer = offers?.find(
  //   (item) => item?.productId?._id === product?._id && item?.isActive,
  // );

  const selectedVariant = variants[selectedVariantIdx] || null;
  const price = useMemo(
    () => parseVariantSellPrice(product, selectedVariant),
    [product, selectedVariant],
  );
  const variantMrp = useMemo(
    () => parseVariantMrpPrice(product, selectedVariant),
    [product, selectedVariant],
  );
  // const offerDiscount = Number(offer?.discountPercent || 0);
  const offerDiscount = resolveDiscountPercent(offer);

  const finalPrice =
    offerDiscount > 0
      ? Math.round(price - (price * offerDiscount) / 100)
      : price;

  const displayMrp =
    offerDiscount > 0 ? price : variantMrp > price ? variantMrp : null;
  // const mrp = useMemo(() => {
  //   if (product?.salesConfiguration?.mrpPrice != null) {
  //     const n = Number(product.salesConfiguration.mrpPrice);
  //     if (Number.isFinite(n) && n > 0) return n;
  //   }
  //   if (price > 0) return Math.round(price * 1.2);
  //   return 0;
  // }, [product, price]);

  // const discountPct =
  //   price > 0 && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const deliveryText = useMemo(() => {
    const rawValue = product?.logisticsVerification?.deliveryTimelineValue;
    const rawUnit = String(
      product?.logisticsVerification?.deliveryTimelineUnit || 'Days',
    ).trim();
    const n = Number(rawValue);
    if (Number.isFinite(n) && n > 0) {
      const unit = rawUnit || 'Days';
      return `${n} ${unit}`;
    }
    return 'Tomorrow, 4 PM';
  }, [
    product?.logisticsVerification?.deliveryTimelineValue,
    product?.logisticsVerification?.deliveryTimelineUnit,
  ]);

  const totalReviews = Array.isArray(product?.reviews)
    ? product.reviews.length
    : 0;

  const averageRating =
    totalReviews > 0
      ? (
          product.reviews.reduce(
            (acc, item) => acc + Number(item.rating || 0),
            0,
          ) / totalReviews
        ).toFixed(1)
      : 0;

  // const goToCheckout = () => {
  //   if (typeof window !== 'undefined' && product?._id) {
  //     sessionStorage.setItem(
  //       'rentpay_checkout_focus_product_id',
  //       String(product._id),
  //     );
  //   }
  //   dispatch(
  //     addToCart({
  //       productId: product?._id,
  //       quantity: 1,
  //       rentalMonths: 1,
  //       tenureUnit: 'month',
  //       pricePerDay: price || 0,
  //       title: product?.productName || 'Buy product',
  //       image: gallery[0] || product?.image || '',
  //       productType: 'Sell',
  //       refundableDeposit: 0,
  //     }),
  //   );
  //   router.push('/checkout');
  // };

  //updated version
  const goToCheckout = () => {
    if (currentStock <= 0) return;

    if (typeof window !== 'undefined' && product?._id) {
      sessionStorage.setItem(
        'rentpay_checkout_focus_product_id',
        String(product._id),
      );
    }

    dispatch(
      addToCart({
        productId: product?._id,
        variantId: variants[selectedVariantIdx]?._id?.toString() || null,
        variantName: variants[selectedVariantIdx]?.variantName || '',
        quantity: 1,
        rentalMonths: 1,
        tenureUnit: 'month',
        pricePerDay: finalPrice || 0,
        title: product?.productName || 'Buy product',
        image: gallery[0] || product?.image || '',
        productType: 'Sell',
        refundableDeposit: 0,
        condition: product?.condition || 'Brand New',
      }),
    );

    router.push('/checkout');
  };

  // const goToCart = () => {
  //   dispatch(
  //     addToCart({
  //       productId: product?._id,
  //       quantity: 1,
  //       rentalMonths: 1,
  //       tenureUnit: 'month',
  //       pricePerDay: price || 0,
  //       title: product?.productName || 'Buy product',
  //       image: gallery[0] || product?.image || '',
  //       productType: 'Sell',
  //       refundableDeposit: 0,
  //     }),
  //   );
  //   router.push('/cart');
  // };

  const goToCart = () => {
    if (currentStock <= 0) return;

    dispatch(
      addToCart({
        productId: product?._id,
        variantId: variants[selectedVariantIdx]?._id?.toString() || null,
        variantName: variants[selectedVariantIdx]?.variantName || '',
        quantity: 1,
        rentalMonths: 1,
        tenureUnit: 'month',
        pricePerDay: finalPrice || 0,
        title: product?.productName || 'Buy product',
        image: gallery[0] || product?.image || '',
        productType: 'Sell',
        refundableDeposit: 0,
        condition: product?.condition || 'Brand New',
      }),
    );

    toast.success('Added to cart successfully', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
    });
  };
  return (
    <section className="w-full  px-3 sm:px-4 py-5 sm:py-8">
      <div className="w-full mx-auto">
        {/* <div className="text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
          Home <span className="mx-1">›</span>{' '}
          {product?.category || 'Electronics'} <span className="mx-1">›</span>{' '}
          {product?.subCategory || 'Mobiles'}
        </div> */}
        <p className="lg:hidden text-xs sm:text-sm truncate mb-3">
          <a
            href="/"
            className="text-gray-400  hover:text-orange-500 font-medium"
          >
            Home
          </a>
          <span className="text-gray-400 mx-1">&gt;</span>
          <span className="text-orange-500">Buy Detail</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5 lg:gap-7">
          {/* Left block */}
          <div className="bg-white rounded-2xl">
            <div
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center rounded-full bg-[#F97316] text-white px-3 py-1 text-[10px] sm:text-xs font-semibold">
                  {/* <span className="mr-1.5">•</span> */}
                  {conditionLabel === 'Brand New' ? 'Brand New' : 'Refurbished'}
                </span>
              </div>

              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={onToggleWishlist}
                  disabled={togglingId === String(product?._id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition disabled:opacity-60"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWished(product?._id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              </div>

              <img
                src={mainImg}
                alt={product?.productName || 'Product'}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={goPrevImage}
                disabled={gallery.length <= 1}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="grid flex-1 grid-cols-4 gap-2 sm:grid-cols-5">
                {visibleThumbs.map((src, idx) => (
                  <button
                    key={`${src}-${thumbStart + idx}`}
                    type="button"
                    onClick={() => setMainImg(src)}
                    className={`h-14 sm:h-16 rounded-lg overflow-hidden border ${
                      mainImg === src
                        ? 'border-orange-500 ring-1 ring-orange-200'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={goNextImage}
                disabled={gallery.length <= 1}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {variants.length > 1 && (
              <div className="mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Select Variant
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    const variantImages = (() => {
                      const fromDb = Array.isArray(product?.images)
                        ? product.images.filter(Boolean)
                        : [];
                      const allImgs =
                        fromDb.length > 0 ? fromDb : FALLBACK_IMAGES;
                      const perVariant = Math.ceil(
                        allImgs.length / variants.length,
                      );
                      const start = idx * perVariant;
                      const slice = allImgs.slice(start, start + perVariant);
                      return slice.length > 0 ? slice : allImgs.slice(0, 1);
                    })();
                    return (
                      <button
                        key={v.variantName || idx}
                        type="button"
                        onClick={() => {
                          setSelectedVariantIdx(idx);
                          setMainImg(variantImages[0]);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-400'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <img
                          src={variantImages[0]}
                          alt={v.variantName}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span>{v.variantName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right block */}
          <div className="space-y-3 sm:space-y-4">
            <p className="hidden lg:block text-xs sm:text-sm truncate mb-3 sm:mb-4">
              <a
                href="/"
                className="text-gray-400  hover:text-[#F97316] font-medium"
              >
                Home
              </a>
              <span className="text-gray-400 mx-1">&gt;</span>
              <span className="text-[#F97316]">Buy Detail</span>
            </p>
            {/* <div>
         
              <h1 className="text-2xl sm:text-[32px] leading-tight font-semibold text-black">
                {product?.productName || 'Buy product'}
              </h1>

              {currentStock > 0 ? (
                <p className="text-green-600  text-xs  px-2.5 py-1 rounded-full mt-1 font-medium">
                  {currentStock} in stock
                </p>
              ) : (
                <p className="text-red-700 bg-red-100  px-2.5 py-1 rounded-full text-sm mt-1 font-medium">
                  Out of stock
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-white text-[11px] font-semibold">
                  <Star className="h-3 w-3 fill-white text-white" />
                  4.8
                </span>
                <span className="text-xs sm:text-sm text-gray-500 underline">
                  124 Ratings
                </span>
              </div>
            </div> */}

            <div>
              {/* Product title + stock same row */}
              <div className="flex flex-row items-start justify-between gap-2">
                <h1 className="text-2xl sm:text-[32px] leading-tight font-semibold text-black">
                  {product?.productName || 'Buy product'}
                </h1>

                {currentStock > 0 ? (
                  <p className="shrink-0 text-green-600 bg-green-100 border border-green-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    {currentStock} in stock
                  </p>
                ) : (
                  <p className="shrink-0 text-red-700 bg-red-100 border border-red-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    Out of stock
                  </p>
                )}
              </div>

              {/* Rating below title */}
              {Number(totalReviews) > 0 && Number(averageRating) > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-white text-[11px] font-semibold">
                    <Star className="h-3 w-3 fill-white text-white" />
                    {Number(averageRating).toFixed(1)}
                  </span>

                  <span className="text-xs sm:text-sm text-gray-500 underline">
                    {totalReviews} {totalReviews === 1 ? 'Rating' : 'Ratings'}
                  </span>
                </div>
              )}
            </div>

            {/* <div className="rounded-xl border border-gray-200 bg-gray-100/70 px-4 py-4">
              <div className="flex items-end gap-2 sm:gap-3">
                <span className="text-3xl sm:text-[40px] leading-none font-semibold text-black">
                  ₹{price || 0}
                </span>
                {mrp > price ? (
                  <span className="text-sm text-gray-400 line-through pb-1">
                    ₹{mrp}
                  </span>
                ) : null}
                {discountPct > 0 ? (
                  <span className="text-sm sm:text-base font-semibold text-[#10B981] pb-1">
                    {discountPct}% OFF
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                inclusive of all taxes
              </p>
            </div> */}
            {/* <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-[#FFFBEB] to-[#FFF7ED] px-4 py-4">
              <div className="flex items-end gap-2 sm:gap-3">
                <span className="text-3xl sm:text-[40px] leading-none font-semibold text-black">
                  ₹{formatPrice(finalPrice)}
                </span>

                {displayMrp ? (
                  <span className="text-lg text-gray-400 line-through pb-1">
                    ₹{formatPrice(displayMrp)}
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                inclusive of all taxes
              </p>
            </div> */}
            <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-[#FFFBEB] to-[#FFF7ED] px-4 py-4">
              <div className="flex items-end gap-1 sm:gap-3">
                <span className="text-3xl sm:text-[40px] leading-none font-semibold text-black">
                  ₹{formatPrice(finalPrice)}
                </span>

                {displayMrp ? (
                  <span className="text-xl text-gray-400 line-through pb-1">
                    ₹{formatPrice(displayMrp)}
                  </span>
                ) : null}

                {offerDiscount > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs sm:text-xs font-semibold text-[#F97316] border-[#F97316] bg-orange-50 mb-1">
                    {formatPercent(offerDiscount)} Off
                  </span>
                ) : null}
              </div>

              <p className="text-xs font-semibold text-gray-500 mt-1">
                inclusive of all taxes
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
              <h3 className="text-base font-semibold text-black mb-3">
                Why Trust This Product?
              </h3>
              <div className="space-y-3">
                {/* <div className="flex items-start gap-2.5">
                  <BadgeCheck className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-black">
                      Condition:{' '}
                      <span className="font-medium">{conditionLabel}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Quality checked by seller
                    </p>
                  </div>
                </div> */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-[#F97316]" />
                  </div>

                  <div>
                    <p className="text-sm text-black">
                      Condition:{' '}
                      <span className="font-medium">{conditionLabel}</span>
                    </p>

                    <p className="text-xs text-gray-500">
                      Quality checked by seller
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-[#F97316]" />
                  </div>

                  <div>
                    <p className="text-sm text-black">1-Year Brand Warranty</p>

                    <p className="text-xs text-gray-500">
                      Official seller warranty
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4 text-[#F97316]" />
                  </div>

                  <div>
                    <p className="text-sm text-black">
                      Delivered in {deliveryText}
                    </p>

                    <p className="text-xs text-gray-500">
                      Express delivery within city
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* <button
              type="button"
              onClick={goToCheckout}
              className="w-full rounded-xl bg-orange-500 text-white font-semibold py-3 hover:bg-orange-600"
            >
              Buy Now
            </button> */}
            {/* <button
              type="button"
              onClick={goToCheckout}
              disabled={currentStock <= 0}
              className={`w-full rounded-xl font-semibold py-3 transition
    ${
      currentStock <= 0
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-orange-500 text-white hover:bg-orange-600'
    }`}
            >
              {currentStock <= 0 ? 'Buy Now' : 'Buy Now'}
            </button> */}
            {/* <button
              type="button"
              onClick={goToCart}
              className="w-full rounded-xl border border-[#2563EB] text-[#2563EB] font-semibold py-3 hover:bg-blue-50"
            >
              Add to Cart
            </button> */}
            <button
              type="button"
              onClick={goToCart}
              disabled={currentStock <= 0}
              className={`w-full rounded-xl font-semibold py-3 transition
    ${
      currentStock <= 0
        ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
        : 'border border-orange-500 bg-[#F97316] text-white'
    }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyPrdctMain;
