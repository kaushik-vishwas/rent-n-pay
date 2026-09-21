// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Star } from 'lucide-react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { apiGetServiceProducts, apiGetPublicActiveOffers } from '@/lib/api';
// const FrequentlyBookTogether = () => {
//   const { id } = useParams();
//   const router = useRouter();

//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [locVersion, setLocVersion] = useState(0);
//   const [offersByProduct, setOffersByProduct] = useState({});

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const onLocChange = () => setLocVersion((v) => v + 1);
//     window.addEventListener('rn_delivery_location_changed', onLocChange);
//     const onStorage = (e) => {
//       if (e.key === 'rn_delivery_location') onLocChange();
//     };
//     window.addEventListener('storage', onStorage);
//     return () => {
//       window.removeEventListener('rn_delivery_location_changed', onLocChange);
//       window.removeEventListener('storage', onStorage);
//     };
//   }, []);

//   useEffect(() => {
//     const fetchRelatedServices = async () => {
//       try {
//         setLoading(true);

//         const [res, offersRes] = await Promise.all([
//           apiGetServiceProducts(),
//           apiGetPublicActiveOffers().catch(() => ({ data: { offers: [] } })),
//         ]);
//         const allProducts = res.data?.products || [];

//         // Exclude the current service being viewed
//         const filtered = allProducts.filter(
//           (p) => String(p._id || p.id) !== String(id),
//         );

//         setServices(filtered.slice(0, 3));

//         const map = {};
//         (offersRes.data?.offers || []).forEach((o) => {
//           const pid = String(o.productId?._id || o.productId);
//           map[pid] = o;
//         });
//         setOffersByProduct(map);
//       } catch (error) {
//         console.error('Related services error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRelatedServices();
//   }, [id, locVersion]);

//   const handleAdd = (service) => {
//     const serviceId = service._id || service.id;
//     router.push(`/service/${serviceId}`);
//   };

//   if (loading) {
//     return (
//       // <section className="w-full mx-auto px-4 md:px-6 pt-2 pb-8 mt-0">
//       //   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
//       //     Frequently Booked Together
//       //   </h2>
//       <section className="w-full mx-auto px-4 md:px-6 pt-2 pb-8 mt-0">
//         <h2 className="text-lg sm:text-2xl lg:text-3xl mb-2 md:mb-3">
//           <span className="font-semibold text-black">Frequently </span>
//           <span className="font-bold text-[#F97316]">Booked Together</span>
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//           {[1, 2, 3].map((item) => (
//             <div
//               key={item}
//               className="animate-pulse bg-white border border-gray-200 rounded-2xl p-5"
//             >
//               <div className="h-40 bg-gray-200 rounded-xl mb-4" />
//               <div className="h-5 bg-gray-200 rounded mb-3" />
//               <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
//               <div className="h-10 bg-gray-200 rounded" />
//             </div>
//           ))}
//         </div>
//       </section>
//     );
//   }

//   if (!services.length) return null;

//   return (
//     <section className="w-full mx-auto px-4 md:px-6 py-8">
//       {/* <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
//         <span className="font-semibold text-black">Frequently </span>
//         <span className="font-bold text-[#F97316]"> Booked Together</span>
//       </h2> */}
//       <h2 className="text-lg sm:text-2xl lg:text-3xl mb-2 md:mb-3">
//         <span className="font-semibold text-black">Frequently </span>
//         <span className="font-bold text-[#F97316]">Booked Together</span>
//       </h2>

//       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
//         {services.map((service) => {
//           const price = service.price ?? service.startingPrice ?? '—';
//           const displayPrice = (() => {
//             const s = String(price ?? '').trim();
//             if (!s || s === '—') return '—';
//             const numeric = Number(s.replace(/[^0-9.]/g, ''));
//             if (Number.isFinite(numeric) && numeric > 0) {
//               return `₹${numeric.toLocaleString('en-IN')}`;
//             }
//             return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
//           })();
//           const rating = Number(service.averageRating || service.rating || 0);
//           const reviewCount = Number(
//             service.numReviews || service.reviewCount || 0,
//           );

//           return (
//             <Link
//               href={`/service/${service._id || service.id}`}
//               key={service._id || service.id}
//               className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block"
//             >
//               <div className="relative overflow-hidden">
//                 <img
//                   src={service.image || service.imageUrl}
//                   alt={service.title || service.productName || service.name}
//                   className="w-full aspect-square object-cover"
//                 />
//               </div>

//               <div className="px-2 sm:px-4 pb-2.5 sm:pb-4 pt-2">
//                 {/* TITLE + RATING - same row */}
//                 <div className="flex justify-between items-start mb-1">
//                   <h3 className="text-sm sm:text-xl font-bold truncate">
//                     {service.title || service.productName || service.name}
//                   </h3>
//                   {reviewCount > 0 && (
//                     <div className="flex items-center gap-1 text-white text-[11px] bg-[#F97316] px-2 py-0.5 rounded-full shrink-0 mt-1">
//                       <Star size={12} fill="white" />
//                       {rating.toFixed(1)}
//                     </div>
//                   )}
//                 </div>
//                 {/* PRICE + OFFER - same row */}
//                 {(() => {
//                   const serviceId = String(service._id || service.id);
//                   const offer = offersByProduct[serviceId];
//                   const discount = Number(offer?.discountPercent || 0);
//                   const hasOffer = !!offer && discount > 0;
//                   const basePrice = Number(
//                     String(
//                       service.price ?? service.startingPrice ?? '',
//                     ).replace(/[^0-9.]/g, ''),
//                   );
//                   const finalPrice =
//                     hasOffer && Number.isFinite(basePrice) && basePrice > 0
//                       ? Math.max(
//                           0,
//                           Math.round(basePrice - (basePrice * discount) / 100),
//                         )
//                       : null;

//                   return (
//                     <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
//                       <div>
//                         <span className="font-bold text-sm sm:text-xl leading-none">
//                           {hasOffer && finalPrice != null
//                             ? `₹${finalPrice.toLocaleString('en-IN')}`
//                             : displayPrice}
//                         </span>
//                         {hasOffer && finalPrice != null ? (
//                           <span className="ml-2 text-gray-400 text-xs line-through">
//                             {displayPrice}
//                           </span>
//                         ) : service.originalPrice ? (
//                           <span className="ml-2 text-gray-400 text-xs line-through">
//                             ₹
//                             {Number(service.originalPrice).toLocaleString(
//                               'en-IN',
//                             )}
//                           </span>
//                         ) : null}
//                       </div>
//                       {hasOffer ? (
//                         <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap self-end">
//                           {discount}% Off
//                         </span>
//                       ) : null}
//                     </div>
//                   );
//                 })()}

//                 {/* ADD SERVICE BUTTON - below */}
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     handleAdd(service);
//                   }}
//                   className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
//                 >
//                   Add Service
//                 </button>
//               </div>
//             </Link>
//           );
//         })}
//       </div>
//     </section>
//   );
// };

// export default FrequentlyBookTogether;

'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGetServiceProducts, apiGetPublicActiveOffers } from '@/lib/api';
const FrequentlyBookTogether = () => {
  const { id } = useParams();
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locVersion, setLocVersion] = useState(0);
  const [offersByProduct, setOffersByProduct] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onLocChange = () => setLocVersion((v) => v + 1);
    window.addEventListener('rn_delivery_location_changed', onLocChange);
    const onStorage = (e) => {
      if (e.key === 'rn_delivery_location') onLocChange();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('rn_delivery_location_changed', onLocChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const fetchRelatedServices = async () => {
      try {
        setLoading(true);

        const [res, offersRes] = await Promise.all([
          apiGetServiceProducts(),
          apiGetPublicActiveOffers().catch(() => ({ data: { offers: [] } })),
        ]);
        // const allProducts = res.data?.products || [];

        // // Exclude the current service being viewed
        // const filtered = allProducts.filter(
        //   (p) => String(p._id || p.id) !== String(id),
        // );

        // setServices(filtered.slice(0, 3));
        const allProducts = res.data?.products || [];

        // Exclude the current service being viewed
        const filtered = allProducts.filter(
          (p) => String(p._id || p.id) !== String(id),
        );

        // Admin "Featured" services always come first, ordered by
        // priorityRank. Only counts if status is 'live' — an 'inactive'
        // toggle in the admin featured table excludes it here automatically.
        const isFeaturedActive = (s) =>
          s?.featured?.enabled === true && s?.featured?.status === 'live';
        const featured = filtered
          .filter(isFeaturedActive)
          .sort(
            (a, b) =>
              Number(a?.featured?.priorityRank || 0) -
              Number(b?.featured?.priorityRank || 0),
          );
        const rest = filtered.filter((s) => !isFeaturedActive(s));
        const sortedServices = [...featured, ...rest];

        setServices(sortedServices.slice(0, 3));

        const map = {};
        (offersRes.data?.offers || []).forEach((o) => {
          const pid = String(o.productId?._id || o.productId);
          map[pid] = o;
        });
        setOffersByProduct(map);
      } catch (error) {
        console.error('Related services error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedServices();
  }, [id, locVersion]);

  const handleAdd = (service) => {
    const serviceId = service._id || service.id;
    router.push(`/service/${serviceId}`);
  };

  if (loading) {
    return (
      // <section className="w-full mx-auto px-4 md:px-6 pt-2 pb-8 mt-0">
      //   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
      //     Frequently Booked Together
      //   </h2>
      <section className="w-full mx-auto px-4 md:px-6 pt-2 pb-8 mt-0">
        <h2 className="text-lg sm:text-2xl lg:text-3xl mb-2 md:mb-3">
          <span className="font-semibold text-black">Frequently </span>
          <span className="font-bold text-[#F97316]">Booked Together</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className="h-40 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!services.length) return null;

  return (
    <section className="w-full mx-auto px-4 md:px-6 py-8">
      {/* <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
        <span className="font-semibold text-black">Frequently </span>
        <span className="font-bold text-[#F97316]"> Booked Together</span>
      </h2> */}
      <h2 className="text-lg sm:text-2xl lg:text-3xl mb-2 md:mb-3">
        <span className="font-semibold text-black">Frequently </span>
        <span className="font-bold text-[#F97316]">Booked Together</span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {services.map((service) => {
          const price = service.price ?? service.startingPrice ?? '—';
          const displayPrice = (() => {
            const s = String(price ?? '').trim();
            if (!s || s === '—') return '—';
            const numeric = Number(s.replace(/[^0-9.]/g, ''));
            if (Number.isFinite(numeric) && numeric > 0) {
              return `₹${numeric.toLocaleString('en-IN')}`;
            }
            return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
          })();
          const rating = Number(service.averageRating || service.rating || 0);
          const reviewCount = Number(
            service.numReviews || service.reviewCount || 0,
          );

          return (
            <Link
              href={`/service/${service._id || service.id}`}
              key={service._id || service.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer block"
            >
              {/* <div className="relative overflow-hidden">
                <img
                  src={service.image || service.imageUrl}
                  alt={service.title || service.productName || service.name}
                  className="w-full aspect-square object-cover"
                />
              </div> */}
              <div className="relative overflow-hidden">
                {service?.featured?.enabled &&
                service?.featured?.status === 'live' ? (
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#F97316] text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10 shadow-sm">
                    {/* <Star size={10} fill="white" /> */}
                    Featured
                  </span>
                ) : null}
                <img
                  src={service.image || service.imageUrl}
                  alt={service.title || service.productName || service.name}
                  className="w-full aspect-square object-cover"
                />
              </div>

              <div className="px-2 sm:px-4 pb-2.5 sm:pb-4 pt-2">
                {/* TITLE + RATING - same row */}
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm sm:text-xl font-bold truncate">
                    {service.title || service.productName || service.name}
                  </h3>
                  {reviewCount > 0 && (
                    <div className="flex items-center gap-1 text-white text-[11px] bg-[#F97316] px-2 py-0.5 rounded-full shrink-0 mt-1">
                      <Star size={12} fill="white" />
                      {rating.toFixed(1)}
                    </div>
                  )}
                </div>
                {/* PRICE + OFFER - same row */}
                {(() => {
                  const serviceId = String(service._id || service.id);
                  const offer = offersByProduct[serviceId];
                  const discount = Number(offer?.discountPercent || 0);
                  const hasOffer = !!offer && discount > 0;
                  const basePrice = Number(
                    String(
                      service.price ?? service.startingPrice ?? '',
                    ).replace(/[^0-9.]/g, ''),
                  );
                  const finalPrice =
                    hasOffer && Number.isFinite(basePrice) && basePrice > 0
                      ? Math.max(
                          0,
                          Math.round(basePrice - (basePrice * discount) / 100),
                        )
                      : null;

                  return (
                    <div className="flex items-end justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                      <div>
                        <span className="font-bold text-sm sm:text-xl leading-none">
                          {hasOffer && finalPrice != null
                            ? `₹${finalPrice.toLocaleString('en-IN')}`
                            : displayPrice}
                        </span>
                        {hasOffer && finalPrice != null ? (
                          <span className="ml-2 text-gray-400 text-xs line-through">
                            {displayPrice}
                          </span>
                        ) : service.originalPrice ? (
                          <span className="ml-2 text-gray-400 text-xs line-through">
                            ₹
                            {Number(service.originalPrice).toLocaleString(
                              'en-IN',
                            )}
                          </span>
                        ) : null}
                      </div>
                      {hasOffer ? (
                        <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-full border text-[7px] sm:text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap self-end">
                          {discount}% Off
                        </span>
                      ) : null}
                    </div>
                  );
                })()}

                {/* ADD SERVICE BUTTON - below */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAdd(service);
                  }}
                  className="flex items-center justify-center gap-2 w-full text-center py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition bg-[#F97316] text-white hover:bg-orange-600"
                >
                  Add Service
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FrequentlyBookTogether;
