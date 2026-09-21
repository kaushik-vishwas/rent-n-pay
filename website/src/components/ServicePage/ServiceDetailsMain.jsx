// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import {
//   Star,
//   ShieldCheck,
//   CheckCircle2,
//   Calendar,
//   X,
//   Check,
//   Clock,
// } from 'lucide-react';
// import { apiGetServiceProductById, apiGetPublicActiveOffers } from '@/lib/api';
// import BookingModal from './ServiceBookinModal';

// const Skeleton = ({ className }) => (
//   <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
// );

// const ServiceDetailsMain = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [activeImg, setActiveImg] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [offer, setOffer] = useState(null);

//   const [bookingOpen, setBookingOpen] = useState(false);

//   // useEffect(() => {
//   //   if (!id) return;
//   //   const fetchProduct = async () => {
//   //     try {
//   //       setLoading(true);
//   //       const res = await apiGetServiceProductById(id);
//   //       const data = res.data?.product;
//   //       setProduct(data);
//   //       // schema mein `image` = main image, `images[]` = all images
//   //       setActiveImg(data?.image || '');
//   //     } catch (err) {
//   //       console.error(err);
//   //       setError('Failed to load service details.');
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
//   //   fetchProduct();
//   // }, [id]);
//   useEffect(() => {
//     if (!id) return;
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         const res = await apiGetServiceProductById(id);
//         const data = res.data?.product;
//         setProduct(data);
//         // schema mein `image` = main image, `images[]` = all images
//         setActiveImg(data?.image || '');
//       } catch (err) {
//         console.error(err);
//         setError('Failed to load service details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProduct();

//     apiGetPublicActiveOffers()
//       .then((res) => {
//         const offers = res.data?.offers || [];
//         const match = offers.find(
//           (o) => String(o.productId?._id || o.productId) === String(id),
//         );
//         setOffer(match || null);
//       })
//       .catch(() => setOffer(null));
//   }, [id]);

//   if (loading) {
//     return (
//       <section className="w-full bg-gray-50 py-8 px-3 sm:px-4">
//         <div className="w-full mx-auto">
//           <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
//             <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-6">
//               <div>
//                 <Skeleton className="w-full h-72 rounded-2xl" />
//                 <div className="flex gap-2 mt-3">
//                   {[1, 2, 3].map((i) => (
//                     <Skeleton key={i} className="w-20 h-16 rounded-xl" />
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <Skeleton className="h-6 w-2/3" />
//                 <Skeleton className="h-4 w-1/3" />
//                 <Skeleton className="h-40 w-full rounded-2xl" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (error || !product) {
//     return (
//       <section className="w-full bg-gray-50 py-20 text-center">
//         <p className="text-red-500 text-sm">{error || 'Service not found.'}</p>
//       </section>
//     );
//   }

//   // ── Schema se exact fields
//   // product.productName          → service title
//   // product.image                → main image URL (Cloudinary)
//   // product.images[]             → all image URLs array
//   // product.price                → "₹300" string
//   // product.salesConfiguration.mrpPrice / salePrice
//   // product.category / subCategory
//   // product.serviceMeta.serviceType
//   // product.serviceMeta.included[]
//   // product.serviceMeta.excluded[]
//   // product.serviceMeta.amc.totalAmcFees / serviceCount
//   // product.availabilitySchedule[]  → { day, startTime, endTime, isAvailable }
//   // product.status               → "Low Stock" etc

//   const {
//     productName,
//     image,
//     images = [],
//     price,
//     category,
//     subCategory,
//     salesConfiguration,
//     serviceMeta,
//     availabilitySchedule = [],
//     status,
//   } = product;

//   const thumbs = images.filter((src) => src !== image);
//   const hasDiscount =
//     salesConfiguration?.mrpPrice &&
//     salesConfiguration?.mrpPrice !== salesConfiguration?.salePrice;

//   const offerDiscount = Number(offer?.discountPercent || 0);
//   const hasOffer = !!offer && offerDiscount > 0;
//   const priceBaseNumeric = Number(String(price || '').replace(/[^0-9.]/g, ''));
//   const offerFinalPrice =
//     Number.isFinite(priceBaseNumeric) && priceBaseNumeric > 0
//       ? Math.max(
//           0,
//           Math.round(
//             priceBaseNumeric - (priceBaseNumeric * offerDiscount) / 100,
//           ),
//         )
//       : null;

//   return (
//     <section className="w-full pt-8 sm:pt-10 pb-2 px-3 sm:px-4">
//       <div className="w-full mx-auto">
//         {/* ── Top Card */}
//         <div className="rounded-2xl mb-6 sm:mb-8">
//           <p className="text-xs sm:text-sm truncate mb-2 sm:hidden">
//             <a
//               href="/"
//               className="text-gray-400 hover:text-[#F97316] font-medium"
//             >
//               Home
//             </a>
//             <span className="text-gray-400 mx-1">&gt;</span>
//             <span className="text-[#F97316]">Service Detail</span>
//           </p>

//           <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 lg:gap-6">
//             {/* LEFT — Images */}
//             <div>
//               <div className="relative rounded-2xl overflow-hidden bg-gray-100">
//                 <span className="absolute top-3 left-3 bg-orange-500 text-white uppercase text-xs px-3 py-1 rounded-full font-semibold shadow z-10">
//                   Service
//                 </span>
//                 {hasOffer && offer?.sticker ? (
//                   <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
//                     {offer.sticker}
//                   </span>
//                 ) : null}
//                 <img
//                   src={activeImg}
//                   alt={productName}
//                   className="w-full aspect-square object-cover"
//                 />
//               </div>
//               {/* Thumbnails — all images[] */}
//               {images.length > 1 && (
//                 <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-1">
//                   {images.map((src, i) => (
//                     <button
//                       key={i}
//                       onClick={() => setActiveImg(src)}
//                       className={`w-20 h-16 rounded-xl overflow-hidden border flex-shrink-0 transition-colors ${
//                         activeImg === src
//                           ? 'border-orange-500'
//                           : 'border-gray-200 hover:border-orange-400'
//                       }`}
//                     >
//                       <img
//                         src={src}
//                         alt={`thumb-${i}`}
//                         className="w-full h-full object-cover"
//                       />
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* RIGHT — Details */}
//             <div className="flex flex-col">
//               {/* Breadcrumb */}
//               <p className="text-xs sm:text-sm truncate mb-1 sm:mb-3">
//                 <a
//                   href="/"
//                   className="text-gray-400  hover:text-[#F97316] font-medium"
//                 >
//                   Home
//                 </a>
//                 <span className="text-gray-400 mx-1">&gt;</span>
//                 <span className="text-[#F97316]">Service Detail</span>
//               </p>

//               {/* Title + Rating same row */}
//               <div className="flex flex-row items-start justify-between gap-2">
//                 <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-black capitalize">
//                   {productName}
//                 </h1>
//                 {Number(product?.numReviews || 0) > 0 && (
//                   <div className="shrink-0 flex items-center gap-1 text-[12px]">
//                     <span className="inline-flex items-center gap-1 bg-[#10B981] text-white px-2 py-[2px] rounded-lg">
//                       {Number(product?.averageRating || 0).toFixed(1)}
//                       <Star className="w-3 h-3 fill-current" />
//                     </span>

//                     <span className="text-gray-500 whitespace-nowrap">
//                       ({product.numReviews}{' '}
//                       {product.numReviews === 1 ? 'review' : 'reviews'})
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Price Card */}
//               <div className="mt-3 rounded-2xl border border-gray-200 bg-[#F8F9FA] p-4 space-y-3 text-sm">
//                 {/* Price row */}
//                 <div className="flex items-baseline justify-between gap-4">
//                   <p className="text-sm text-gray-500">Service Price</p>
//                   <div className="text-right">
//                     {hasOffer && offerFinalPrice != null ? (
//                       <>
//                         <div className="flex items-center gap-2 justify-end">
//                           <p className="text-xl sm:text-2xl font-semibold text-black">
//                             ₹{offerFinalPrice.toLocaleString('en-IN')}
//                           </p>
//                           {/* <span className="inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
//                             {offerDiscount}% Off
//                           </span> */}
//                         </div>
//                         <p className="text-xs text-gray-400 line-through">
//                           {price}
//                         </p>
//                       </>
//                     ) : (
//                       // ) : (
//                       //   <>
//                       //     <p className="text-xl sm:text-2xl font-semibold text-black">
//                       //       {price}
//                       //     </p>
//                       //     {hasDiscount && (
//                       //       <p className="text-xs text-gray-400 line-through">
//                       //         ₹{salesConfiguration.mrpPrice}
//                       //       </p>
//                       //     )}
//                       //   </>
//                       // )}
//                       <>
//                         <p className="text-xl sm:text-2xl font-semibold text-black">
//                           {(() => {
//                             const s = String(price ?? '').trim();
//                             if (!s) return '—';
//                             return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
//                           })()}
//                         </p>
//                         {hasDiscount && (
//                           <p className="text-xs text-gray-400 line-through">
//                             ₹{salesConfiguration.mrpPrice}
//                           </p>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* Service Type
//                 {serviceMeta?.serviceType && (
//                   <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-3.5 h-3.5 text-gray-500" />
//                       <span>Service Type</span>
//                     </div>
//                     <span className="text-black font-medium text-right max-w-[55%]">
//                       {serviceMeta.serviceType}
//                     </span>
//                   </div>
//                 )} */}
//                 {/* Estimated Duration */}
//                 {(() => {
//                   const slot = product?.availabilitySchedule?.find(
//                     (s) => s.isAvailable,
//                   );
//                   const workDuration = slot?.workDuration;
//                   return workDuration ? (
//                     <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
//                       <div className="flex items-center gap-2">
//                         <Clock className="w-3.5 h-3.5 text-gray-500" />
//                         <span>Estimated Duration</span>
//                       </div>
//                       <span className="text-black font-medium text-right max-w-[55%]">
//                         {workDuration} hours
//                       </span>
//                     </div>
//                   ) : null;
//                 })()}

//                 {/* AMC info — only if serviceType is AMC */}
//                 {/* {serviceMeta?.amc && (
//                   <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
//                     <span>AMC Services</span>
//                     <span className="font-medium text-black">
//                       {serviceMeta.amc.serviceCount} visits · ₹
//                       {serviceMeta.amc.totalAmcFees}
//                     </span>
//                   </div>
//                 )} */}

//                 {/* Visiting charges */}
//                 <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
//                   <span>Visiting Charges</span>
//                   <div className="text-right">
//                     <span className="text-[#10B981] font-medium block">
//                       FREE
//                     </span>
//                     <span className="text-[10px] sm:text-xs text-gray-400">
//                       Waived off on booking
//                     </span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => setBookingOpen(true)}
//                   className="mt-3 w-full py-2.5 rounded-xl bg-[#F97316] text-white text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2"
//                 >
//                   <Calendar className="w-3.5 h-3.5" />
//                   Book now
//                 </button>

//                 <div className="mt-2 flex items-center justify-between">
//                   <div>
//                     <p className="font-semibold text-lg text-center text-[#F97316]">
//                       100%
//                     </p>
//                     <p className="text-gray-500 font-semibold text-xs">
//                       Satisfaction
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-semibold text-lg text-center text-[#F97316]">
//                       Same day
//                     </p>
//                     <p className="text-gray-500 font-semibold text-xs">
//                       Service available
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {(serviceMeta?.included?.length > 0 ||
//         serviceMeta?.excluded?.length > 0) && (
//         <div className="grid grid-cols-1 w-full mx-auto md:grid-cols-2 gap-4 md:gap-6 mb-2">
//           {serviceMeta?.included?.length > 0 && (
//             <div className="bg-green-50 rounded-2xl border border-green-200 p-4 sm:p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <h2 className="text-sm sm:text-base font-semibold text-black">
//                   ✓ What&apos;s Included
//                 </h2>
//               </div>
//               <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
//                 {serviceMeta.included.map((item, i) => (
//                   <li key={i} className="flex items-start gap-2">
//                     <span className="mt-[2px] flex items-center justify-center w-5 h-5 rounded-full bg-[#10B9811A] shrink-0">
//                       <Check className="w-3 h-3 text-[#10B981]" />
//                     </span>
//                     <span className="capitalize">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {serviceMeta?.excluded?.length > 0 && (
//             <div className="bg-red-50 rounded-2xl border border-[#FFC9C9] p-4 sm:p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <h2 className="text-sm sm:text-base font-semibold text-black">
//                   ✗ What&apos;s Excluded
//                 </h2>
//               </div>
//               <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
//                 {serviceMeta.excluded.map((item, i) => (
//                   <li key={i} className="flex items-start gap-2">
//                     <span className="mt-[2px] flex items-center justify-center w-5 h-5 rounded-full bg-[#FFE2E2] shrink-0">
//                       <X className="w-3 h-3 text-[#E7000B]" />
//                     </span>
//                     <span className="capitalize">{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Availability Schedule */}
//       {/* {availabilitySchedule.length > 0 && (
//         <div className="max-w-6xl mx-auto mb-8">
//           <h3 className="text-base sm:text-lg font-semibold text-black mb-3">
//             Availability
//           </h3>
//           <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
//             <div className="flex flex-wrap gap-2">
//               {availabilitySchedule.map((slot) => (
//                 <div
//                   key={slot.day}
//                   className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium ${
//                     slot.isAvailable
//                       ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//                       : 'border-gray-200 bg-gray-100 text-gray-400'
//                   }`}
//                 >
//                   <span className={slot.isAvailable ? '' : 'line-through'}>
//                     {slot.day}
//                   </span>
//                   {slot.isAvailable && (
//                     <span className="text-[10px] font-normal text-gray-500 mt-0.5">
//                       {slot.startTime}–{slot.endTime}
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )} */}

//       {/* ── Safety Strip */}
//       {/* <div className="mt-6 max-w-6xl mx-auto flex items-center gap-2 text-[11px] sm:text-xs text-gray-500">
//         <ShieldCheck className="w-4 h-4 text-emerald-500" />
//         <span>
//           All technicians are background-checked and services are backed by
//           Rentnpay guarantee.
//         </span>
//       </div> */}
//       <BookingModal
//         isOpen={bookingOpen}
//         onClose={() => setBookingOpen(false)}
//         product={product}
//       />
//     </section>
//   );
// };

// export default ServiceDetailsMain;

'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiGetServiceProductById, apiGetPublicActiveOffers } from '@/lib/api';
import BookingModal from './ServiceBookinModal';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const ServiceDetailsMain = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offer, setOffer] = useState(null);

  const [bookingOpen, setBookingOpen] = useState(false);

  // Touch swipe support for mobile (finger swipe on main image) — must be
  // declared before any early return so hook order stays consistent.
  const touchStartXRef = useRef(null);
  const touchDeltaXRef = useRef(0);

  // useEffect(() => {
  //   if (!id) return;
  //   const fetchProduct = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await apiGetServiceProductById(id);
  //       const data = res.data?.product;
  //       setProduct(data);
  //       // schema mein `image` = main image, `images[]` = all images
  //       setActiveImg(data?.image || '');
  //     } catch (err) {
  //       console.error(err);
  //       setError('Failed to load service details.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProduct();
  // }, [id]);
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await apiGetServiceProductById(id);
        const data = res.data?.product;
        setProduct(data);
        // schema mein `image` = main image, `images[]` = all images
        setActiveImg(data?.image || '');
      } catch (err) {
        console.error(err);
        setError('Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    apiGetPublicActiveOffers()
      .then((res) => {
        const offers = res.data?.offers || [];
        const match = offers.find(
          (o) => String(o.productId?._id || o.productId) === String(id),
        );
        setOffer(match || null);
      })
      .catch(() => setOffer(null));
  }, [id]);

  if (loading) {
    return (
      <section className="w-full bg-gray-50 py-8 px-3 sm:px-4">
        <div className="w-full mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-6">
              <div>
                <Skeleton className="w-full h-72 rounded-2xl" />
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-20 h-16 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="w-full bg-gray-50 py-20 text-center">
        <p className="text-red-500 text-sm">{error || 'Service not found.'}</p>
      </section>
    );
  }

  // ── Schema se exact fields
  // product.productName          → service title
  // product.image                → main image URL (Cloudinary)
  // product.images[]             → all image URLs array
  // product.price                → "₹300" string
  // product.salesConfiguration.mrpPrice / salePrice
  // product.category / subCategory
  // product.serviceMeta.serviceType
  // product.serviceMeta.included[]
  // product.serviceMeta.excluded[]
  // product.serviceMeta.amc.totalAmcFees / serviceCount
  // product.availabilitySchedule[]  → { day, startTime, endTime, isAvailable }
  // product.status               → "Low Stock" etc

  const {
    productName,
    image,
    images = [],
    price,
    category,
    subCategory,
    salesConfiguration,
    serviceMeta,
    availabilitySchedule = [],
    status,
  } = product;

  const thumbs = images.filter((src) => src !== image);

  // Current index of activeImg within images[] — used for arrows & swipe
  const currentImgIdx = Math.max(0, images.indexOf(activeImg));

  const goToImage = (idx) => {
    if (!images.length) return;
    const safeIdx = ((idx % images.length) + images.length) % images.length; // wrap around
    setActiveImg(images[safeIdx]);
  };

  const goPrevImage = () => goToImage(currentImgIdx - 1);
  const goNextImage = () => goToImage(currentImgIdx + 1);

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

  const hasDiscount =
    salesConfiguration?.mrpPrice &&
    salesConfiguration?.mrpPrice !== salesConfiguration?.salePrice;

  const offerDiscount = Number(offer?.discountPercent || 0);
  const hasOffer = !!offer && offerDiscount > 0;
  const priceBaseNumeric = Number(String(price || '').replace(/[^0-9.]/g, ''));
  const offerFinalPrice =
    Number.isFinite(priceBaseNumeric) && priceBaseNumeric > 0
      ? Math.max(
          0,
          Math.round(
            priceBaseNumeric - (priceBaseNumeric * offerDiscount) / 100,
          ),
        )
      : null;

  return (
    <section className="w-full pt-8 sm:pt-10 pb-2 px-3 sm:px-4">
      <div className="w-full mx-auto">
        {/* ── Top Card */}
        <div className="rounded-2xl mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm truncate mb-2 sm:hidden">
            <a
              href="/"
              className="text-gray-400 hover:text-[#F97316] font-medium"
            >
              Home
            </a>
            <span className="text-gray-400 mx-1">&gt;</span>
            <span className="text-[#F97316]">Service Detail</span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 lg:gap-6">
            {/* LEFT — Images */}
            <div>
              <div
                className="relative rounded-2xl overflow-hidden bg-gray-100"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <span className="absolute top-3 left-3 bg-orange-500 text-white uppercase text-xs px-3 py-1 rounded-full font-semibold shadow z-10">
                  Service
                </span>
                {hasOffer && offer?.sticker ? (
                  <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
                    {offer.sticker}
                  </span>
                ) : null}
                <img
                  src={activeImg}
                  alt={productName}
                  className="w-full aspect-square object-cover select-none"
                  draggable={false}
                />
              </div>
              {/* Thumbnails — all images[] */}
              {/* Thumbnails — all images[] */}
              {images.length > 1 && (
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrevImage}
                    aria-label="Previous image"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex-1 flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(src)}
                        className={`w-20 h-16 rounded-xl overflow-hidden border flex-shrink-0 transition-colors ${
                          activeImg === src
                            ? 'border-orange-500'
                            : 'border-gray-200 hover:border-orange-400'
                        }`}
                      >
                        <img
                          src={src}
                          alt={`thumb-${i}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={goNextImage}
                    aria-label="Next image"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT — Details */}
            <div className="flex flex-col">
              {/* Breadcrumb */}
              <p className="text-xs sm:text-sm truncate mb-1 sm:mb-3">
                <a
                  href="/"
                  className="text-gray-400  hover:text-[#F97316] font-medium"
                >
                  Home
                </a>
                <span className="text-gray-400 mx-1">&gt;</span>
                <span className="text-[#F97316]">Service Detail</span>
              </p>

              {/* Title + Rating same row */}
              <div className="flex flex-row items-start justify-between gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-black capitalize">
                  {productName}
                </h1>
                {Number(product?.numReviews || 0) > 0 && (
                  <div className="shrink-0 flex items-center gap-1 text-[12px]">
                    <span className="inline-flex items-center gap-1 bg-[#10B981] text-white px-2 py-[2px] rounded-lg">
                      {Number(product?.averageRating || 0).toFixed(1)}
                      <Star className="w-3 h-3 fill-current" />
                    </span>

                    <span className="text-gray-500 whitespace-nowrap">
                      ({product.numReviews}{' '}
                      {product.numReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>

              {/* Price Card */}
              <div className="mt-3 rounded-2xl border border-gray-200 bg-[#F8F9FA] p-4 space-y-3 text-sm">
                {/* Price row */}
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm text-gray-500">Service Price</p>
                  <div className="text-right">
                    {hasOffer && offerFinalPrice != null ? (
                      <>
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-xl sm:text-2xl font-semibold text-black">
                            ₹{offerFinalPrice.toLocaleString('en-IN')}
                          </p>
                          {/* <span className="inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
                            {offerDiscount}% Off
                          </span> */}
                        </div>
                        <p className="text-xs text-gray-400 line-through">
                          {Number.isFinite(priceBaseNumeric) &&
                          priceBaseNumeric > 0
                            ? `₹${priceBaseNumeric.toLocaleString('en-IN')}`
                            : price}
                        </p>
                      </>
                    ) : (
                      // ) : (
                      //   <>
                      //     <p className="text-xl sm:text-2xl font-semibold text-black">
                      //       {price}
                      //     </p>
                      //     {hasDiscount && (
                      //       <p className="text-xs text-gray-400 line-through">
                      //         ₹{salesConfiguration.mrpPrice}
                      //       </p>
                      //     )}
                      //   </>
                      // )}
                      <>
                        <p className="text-xl sm:text-2xl font-semibold text-black">
                          {(() => {
                            const s = String(price ?? '').trim();
                            if (!s) return '—';
                            if (
                              Number.isFinite(priceBaseNumeric) &&
                              priceBaseNumeric > 0
                            ) {
                              return `₹${priceBaseNumeric.toLocaleString('en-IN')}`;
                            }
                            return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
                          })()}
                        </p>
                        {hasDiscount && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹
                            {Number(salesConfiguration.mrpPrice).toLocaleString(
                              'en-IN',
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Service Type
                {serviceMeta?.serviceType && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Service Type</span>
                    </div>
                    <span className="text-black font-medium text-right max-w-[55%]">
                      {serviceMeta.serviceType}
                    </span>
                  </div>
                )} */}
                {/* Estimated Duration */}
                {(() => {
                  const slot = product?.availabilitySchedule?.find(
                    (s) => s.isAvailable,
                  );
                  const workDuration = slot?.workDuration;
                  return workDuration ? (
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Estimated Duration</span>
                      </div>
                      <span className="text-black font-medium text-right max-w-[55%]">
                        {workDuration} hours
                      </span>
                    </div>
                  ) : null;
                })()}

                {/* AMC info — only if serviceType is AMC */}
                {/* {serviceMeta?.amc && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                    <span>AMC Services</span>
                    <span className="font-medium text-black">
                      {serviceMeta.amc.serviceCount} visits · ₹
                      {serviceMeta.amc.totalAmcFees}
                    </span>
                  </div>
                )} */}

                {/* Visiting charges */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                  <span>Visiting Charges</span>
                  <div className="text-right">
                    <span className="text-[#10B981] font-medium block">
                      FREE
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      Waived off on booking
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setBookingOpen(true)}
                  className="mt-3 w-full py-2.5 rounded-xl bg-[#F97316] text-white text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book now
                </button>

                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg text-center text-[#F97316]">
                      100%
                    </p>
                    <p className="text-gray-500 font-semibold text-xs">
                      Satisfaction
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-center text-[#F97316]">
                      Same day
                    </p>
                    <p className="text-gray-500 font-semibold text-xs">
                      Service available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(serviceMeta?.included?.length > 0 ||
        serviceMeta?.excluded?.length > 0) && (
        <div className="grid grid-cols-1 w-full mx-auto md:grid-cols-2 gap-4 md:gap-6 mb-2">
          {serviceMeta?.included?.length > 0 && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-black">
                  ✓ What&apos;s Included
                </h2>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                {serviceMeta.included.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-[2px] flex items-center justify-center w-5 h-5 rounded-full bg-[#10B9811A] shrink-0">
                      <Check className="w-3 h-3 text-[#10B981]" />
                    </span>
                    <span className="capitalize">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {serviceMeta?.excluded?.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-[#FFC9C9] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-black">
                  ✗ What&apos;s Excluded
                </h2>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                {serviceMeta.excluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-[2px] flex items-center justify-center w-5 h-5 rounded-full bg-[#FFE2E2] shrink-0">
                      <X className="w-3 h-3 text-[#E7000B]" />
                    </span>
                    <span className="capitalize">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Availability Schedule */}
      {/* {availabilitySchedule.length > 0 && (
        <div className="max-w-6xl mx-auto mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-black mb-3">
            Availability
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {availabilitySchedule.map((slot) => (
                <div
                  key={slot.day}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium ${
                    slot.isAvailable
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className={slot.isAvailable ? '' : 'line-through'}>
                    {slot.day}
                  </span>
                  {slot.isAvailable && (
                    <span className="text-[10px] font-normal text-gray-500 mt-0.5">
                      {slot.startTime}–{slot.endTime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {/* ── Safety Strip */}
      {/* <div className="mt-6 max-w-6xl mx-auto flex items-center gap-2 text-[11px] sm:text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>
          All technicians are background-checked and services are backed by
          Rentnpay guarantee.
        </span>
      </div> */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        product={product}
      />
    </section>
  );
};

export default ServiceDetailsMain;
