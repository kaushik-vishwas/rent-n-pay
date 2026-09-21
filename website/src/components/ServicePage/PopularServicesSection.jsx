// 'use client';
// import React, { useEffect, useState } from 'react';
// import { Star, ShieldCheck, IndianRupee, Clock } from 'lucide-react';
// import {
//   apiGetServiceProducts,
//   apiGetServiceProductById,
//   apiGetPublicActiveOffers,
// } from '@/lib/api';
// import Link from 'next/link';
// import BookingModal from '../ServicePage/ServiceBookinModal';

// // ── API FUNCTION ─────────────────────────────

// const ServicesLanding = () => {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [offersByProduct, setOffersByProduct] = useState({});
//   const [locVersion, setLocVersion] = useState(0);
//   const [bookingProduct, setBookingProduct] = useState(null);
//   const [bookingOpen, setBookingOpen] = useState(false);
//   const [bookingLoadingId, setBookingLoadingId] = useState(null);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const onLocChange = () => setLocVersion((v) => v + 1);
//     window.addEventListener('rn_delivery_location_changed', onLocChange);
//     window.addEventListener('storage', (e) => {
//       if (e.key === 'rn_delivery_location') onLocChange();
//     });
//     return () => {
//       window.removeEventListener('rn_delivery_location_changed', onLocChange);
//     };
//   }, []);
//   // REPLACE the fetch useEffect with this:
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // READ from localStorage (set by Navbar), just like Trending does
//         // let queryString = '';
//         // try {
//         //   const raw = localStorage.getItem('rn_delivery_location');
//         //   if (raw) {
//         //     const parsed = JSON.parse(raw);
//         //     const lat = Number(parsed?.lat);
//         //     const lon = Number(parsed?.lon);
//         //     if (Number.isFinite(lat) && Number.isFinite(lon)) {
//         //       queryString = `userLat=${lat}&userLng=${lon}`;
//         //     }
//         //   }
//         // } catch {
//         //   // ignore bad storage value
//         // }

//         // const res = await apiGetServiceProducts(queryString);
//         // const res = await apiGetServiceProducts(queryString);
//         const [res, offersRes] = await Promise.all([
//           apiGetServiceProducts(),
//           apiGetPublicActiveOffers().catch(() => ({ data: { offers: [] } })),
//         ]);
//         setServices(res.data?.products || []);

//         const map = {};
//         (offersRes.data?.offers || []).forEach((o) => {
//           const pid = String(o.productId?._id || o.productId);
//           map[pid] = o;
//         });
//         setOffersByProduct(map);
//       } catch (err) {
//         console.error('Failed to fetch service products:', err);
//         setError('Failed to load services.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, [locVersion]); // re-runs whenever navbar location changes
//   return (
//     <div className=" min-h-screen py-8 sm:py-12 px-3 sm:px-4">
//       <div className="w-full mx-auto">
//         {/* Title */}
//         <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">
//           Popular Services Near You
//         </h2>

//         {/* <div className="text-right text-xs sm:text-sm text-orange-500 mb-3 sm:mb-4 cursor-pointer">
//           View All Services →
//         </div> */}

//         {/* Loading State */}
//         {loading && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 animate-pulse"
//               >
//                 <div className="w-full sm:w-28 h-32 sm:h-20 bg-gray-200 rounded-md shrink-0" />
//                 <div className="flex-1 space-y-2">
//                   <div className="h-4 bg-gray-200 rounded w-1/3" />
//                   <div className="h-3 bg-gray-200 rounded w-1/4" />
//                   <div className="h-3 bg-gray-200 rounded w-2/3" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Error State */}
//         {!loading && error && (
//           <div className="text-center text-red-500 py-10">{error}</div>
//         )}

//         {/* Empty State */}
//         {!loading && !error && services.length === 0 && (
//           <div className="text-center text-gray-500 py-10">
//             No services available.
//           </div>
//         )}

//         {/* Service Cards */}
//         {!loading && !error && services.length > 0 && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//             {services.map((service, index) => (
//               <Link
//                 href={`/service/${service._id || service.id}`}
//                 key={service._id || index}
//                 className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg will-change-transform"
//               >
//                 <div className="flex flex-row gap-3 sm:gap-4 min-w-0">
//                   <img
//                     src={service.image || service.imageUrl || '/fallback.png'}
//                     alt={service.title || service.name}
//                     className="w-[30%] sm:w-28 h-24 sm:h-20 object-cover rounded-md shrink-0"
//                   />
//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-center flex-wrap gap-2">
//                       <h3 className="font-semibold text-sm sm:text-base">
//                         {service.title || service.name}
//                       </h3>
//                       {service?.reviewCount > 0 && (
//                         <span className="bg-[#F97316] gap-1 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-[2px] rounded flex items-center w-fit shrink-0">
//                           <Star size={10} className="fill-white shrink-0" />
//                           {Number(service?.rating || 0).toFixed(1)}
//                         </span>
//                       )}
//                       {/* {(() => {
//                         const offer =
//                           offersByProduct[String(service._id || service.id)];
//                         const discount = Number(offer?.discountPercent || 0);
//                         return offer && discount > 0 ? (
//                           <span className="inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
//                             {discount}% Off
//                           </span>
//                         ) : null;
//                       })()} */}
//                     </div>
//                     {(() => {
//                       const rawDesc = service.description || service.desc || '';
//                       const includesMatch =
//                         rawDesc.match(/includes\s*:\s*(.+)/i);
//                       const includesText =
//                         service.serviceMeta?.included ||
//                         service.includes ||
//                         (includesMatch ? includesMatch[1] : null);
//                       const cleanDesc = includesMatch
//                         ? rawDesc.slice(0, includesMatch.index).trim()
//                         : rawDesc;

//                       const includesList = includesText
//                         ? Array.isArray(includesText)
//                           ? includesText
//                           : String(includesText)
//                               .split(',')
//                               .map((s) => s.trim())
//                               .filter(Boolean)
//                         : [];

//                       return (
//                         <>
//                           {includesList.length > 0 && (
//                             <div className="mt-1">
//                               <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
//                                 What&apos;s Included:
//                               </p>
//                               <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                                 {includesList.slice(0, 3).map((item, idx) => (
//                                   <span
//                                     key={idx}
//                                     className="bg-orange-50 border border-[#FF8D28]/30 text-[#F97316] text-[10px] sm:text-xs px-2 py-0.5 rounded-full"
//                                   >
//                                     ✓ {item}
//                                   </span>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                           {cleanDesc && (
//                             <p className="text-[10px] sm:text-xs text-gray-500 mt-2 max-w-sm">
//                               {cleanDesc}
//                             </p>
//                           )}
//                           <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#F97316] mt-2">
//                             <span>Professional Service</span>
//                             <span>Same Day Available</span>
//                           </div>
//                           {Array.isArray(service.availabilitySchedule) &&
//                             (() => {
//                               const dayNames = [
//                                 'Sun',
//                                 'Mon',
//                                 'Tue',
//                                 'Wed',
//                                 'Thu',
//                                 'Fri',
//                                 'Sat',
//                               ];
//                               const todayName = dayNames[new Date().getDay()];
//                               const today = service.availabilitySchedule.find(
//                                 (d) => d.day === todayName,
//                               );

//                               if (!today) return null;

//                               return (
//                                 <div className="flex items-center gap-1 text-[10px] sm:text-xs mt-1.5">
//                                   <Clock
//                                     size={11}
//                                     className={
//                                       today.isAvailable
//                                         ? 'text-green-600'
//                                         : 'text-gray-400'
//                                     }
//                                   />
//                                   {today.isAvailable ? (
//                                     <span className="text-green-600 font-medium">
//                                       {today.workDuration} hrs today
//                                     </span>
//                                   ) : (
//                                     <span className="text-gray-400">
//                                       Closed today
//                                     </span>
//                                   )}
//                                 </div>
//                               );
//                             })()}
//                         </>
//                       );
//                     })()}
//                   </div>
//                 </div>

//                 {/* <div className="flex flex-row sm:flex-col md:flex-col items-center justify-between sm:items-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
//                   <div className="text-left sm:text-right">
//                     <p className="text-[10px] sm:text-xs text-gray-500">
//                       Starting from
//                     </p>

//                     <div className="flex items-center sm:justify-end gap-2">
//                       <span className="text-base sm:text-xl font-bold">
//                         {service.price ?? service.startingPrice}
//                       </span>

//                       {service.originalPrice && (
//                         <span className="text-gray-500 line-through text-xs sm:text-sm">
//                           ₹{service.originalPrice}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <button */}
//                 <div className="flex flex-row sm:flex-col md:flex-col items-center justify-between sm:items-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
//                   <div className="text-left sm:text-right">
//                     <p className="text-[10px] sm:text-xs text-gray-500">
//                       Starting from
//                     </p>

//                     <div className="flex items-center sm:justify-end gap-2">
//                       {(() => {
//                         const serviceId = String(service._id || service.id);
//                         const offer = offersByProduct[serviceId];
//                         const discount = Number(offer?.discountPercent || 0);
//                         const hasOffer = !!offer && discount > 0;
//                         const rawPrice = service.price ?? service.startingPrice;
//                         const basePrice = Number(
//                           String(rawPrice ?? '').replace(/[^0-9.]/g, ''),
//                         );
//                         const finalPrice =
//                           hasOffer &&
//                           Number.isFinite(basePrice) &&
//                           basePrice > 0
//                             ? Math.max(
//                                 0,
//                                 Math.round(
//                                   basePrice - (basePrice * discount) / 100,
//                                 ),
//                               )
//                             : null;

//                         // return (
//                         //   <>
//                         //     <span className="text-base sm:text-xl font-bold">
//                         //       {hasOffer && finalPrice != null
//                         //         ? `₹${finalPrice.toLocaleString('en-IN')}`
//                         //         : rawPrice}
//                         //     </span>
//                         //     {hasOffer && finalPrice != null ? (
//                         //       <span className="text-gray-500 line-through text-xs sm:text-sm">
//                         //         {rawPrice}
//                         //       </span>
//                         //     ) : null}
//                         //   </>
//                         // );

//                         const displayRawPrice = (() => {
//                           const s = String(rawPrice ?? '').trim();
//                           if (!s) return '—';
//                           return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
//                         })();

//                         return (
//                           <>
//                             <span className="text-base sm:text-xl font-bold">
//                               {hasOffer && finalPrice != null
//                                 ? `₹${finalPrice.toLocaleString('en-IN')}`
//                                 : displayRawPrice}
//                             </span>
//                             {hasOffer && finalPrice != null ? (
//                               <span className="text-gray-500 line-through text-xs sm:text-sm">
//                                 {displayRawPrice}
//                               </span>
//                             ) : null}
//                           </>
//                         );
//                       })()}
//                     </div>
//                   </div>
//                   <div className="flex sm:contents items-center gap-2 sm:gap-3">
//                     <button
//                       onClick={async (e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         const serviceId = service._id || service.id;
//                         try {
//                           setBookingLoadingId(serviceId);
//                           const res = await apiGetServiceProductById(serviceId);
//                           const fullProduct = res.data?.product;
//                           setBookingProduct(fullProduct || service);
//                           setBookingOpen(true);
//                         } catch (err) {
//                           console.error(
//                             'Failed to fetch service details for slot booking:',
//                             err,
//                           );
//                           setBookingProduct(service);
//                           setBookingOpen(true);
//                         } finally {
//                           setBookingLoadingId(null);
//                         }
//                       }}
//                       disabled={
//                         bookingLoadingId === (service._id || service.id)
//                       }
//                       className="border border-[#F97316] text-[#F97316] font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-orange-50 shrink-0 flex items-center gap-1 disabled:opacity-60"
//                     >
//                       <Clock size={12} className="shrink-0" />
//                       {bookingLoadingId === (service._id || service.id)
//                         ? '...'
//                         : 'Slot'}
//                     </button>
//                     <button className="bg-[#F97316] font-medium text-white text-xs sm:text-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-md hover:bg-orange-600 shrink-0">
//                       Add Service
//                     </button>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}

//         {/* Slot Booking Modal (shared across cards) */}
//         <BookingModal
//           isOpen={bookingOpen}
//           onClose={() => setBookingOpen(false)}
//           product={bookingProduct}
//         />

//         {/* Why Choose */}
//         <div className="mt-10 sm:mt-16 text-center">
//           <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-10">
//             Why Choose Our Services
//           </h3>
//           <div className="grid grid-cols-3 gap-3 sm:gap-10">
//             {[
//               {
//                 icon: (
//                   <ShieldCheck size={18} className="sm:w-[22px] sm:h-[22px]" />
//                 ),
//                 title: 'Verified Professionals',
//                 desc: 'All service providers are background-checked and certified',
//               },
//               {
//                 icon: (
//                   <IndianRupee size={14} className="sm:w-[22px] sm:h-[22px]" />
//                 ),
//                 title: 'Transparent Pricing',
//                 desc: 'No hidden charges. What you see is what you pay',
//               },
//               {
//                 icon: <Clock size={18} className="sm:w-[22px] sm:h-[22px]" />,
//                 title: 'On-Time Guarantee',
//                 desc: 'Professionals arrive on time or we compensate you',
//               },
//             ].map((item, i) => (
//               <div
//                 key={i}
//                 className="group flex flex-col items-center text-center p-2 sm:p-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#FF8D28]/40 cursor-pointer"
//               >
//                 <div className="bg-[#F97316] p-2 sm:p-3 rounded-lg sm:rounded-xl text-white mb-2 sm:mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
//                   {item.icon}
//                 </div>
//                 <h4 className="font-semibold mb-1 text-[11px] sm:text-base">
//                   {item.title}
//                 </h4>
//                 <p className="hidden sm:block text-xs sm:text-sm max-w-xs mx-auto">
//                   {item.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ServicesLanding;

'use client';
import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, IndianRupee, Clock } from 'lucide-react';
import {
  apiGetServiceProducts,
  apiGetServiceProductById,
  apiGetPublicActiveOffers,
} from '@/lib/api';
import Link from 'next/link';
import BookingModal from '../ServicePage/ServiceBookinModal';

// ── API FUNCTION ─────────────────────────────

const ServicesLanding = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offersByProduct, setOffersByProduct] = useState({});
  const [locVersion, setLocVersion] = useState(0);
  const [bookingProduct, setBookingProduct] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoadingId, setBookingLoadingId] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onLocChange = () => setLocVersion((v) => v + 1);
    window.addEventListener('rn_delivery_location_changed', onLocChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'rn_delivery_location') onLocChange();
    });
    return () => {
      window.removeEventListener('rn_delivery_location_changed', onLocChange);
    };
  }, []);
  // REPLACE the fetch useEffect with this:
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // READ from localStorage (set by Navbar), just like Trending does
        // let queryString = '';
        // try {
        //   const raw = localStorage.getItem('rn_delivery_location');
        //   if (raw) {
        //     const parsed = JSON.parse(raw);
        //     const lat = Number(parsed?.lat);
        //     const lon = Number(parsed?.lon);
        //     if (Number.isFinite(lat) && Number.isFinite(lon)) {
        //       queryString = `userLat=${lat}&userLng=${lon}`;
        //     }
        //   }
        // } catch {
        //   // ignore bad storage value
        // }

        // const res = await apiGetServiceProducts(queryString);
        // const res = await apiGetServiceProducts(queryString);
        const [res, offersRes] = await Promise.all([
          apiGetServiceProducts(),
          apiGetPublicActiveOffers().catch(() => ({ data: { offers: [] } })),
        ]);
        setServices(res.data?.products || []);

        const map = {};
        (offersRes.data?.offers || []).forEach((o) => {
          const pid = String(o.productId?._id || o.productId);
          map[pid] = o;
        });
        setOffersByProduct(map);
      } catch (err) {
        console.error('Failed to fetch service products:', err);
        setError('Failed to load services.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [locVersion]); // re-runs whenever navbar location changes
  return (
    <div className="w-full pt-3 md:pt-6 pb-4 md:pb-6 px-3 sm:px-4">
      <div className="w-full mx-auto">
        {/* Title */}
        {/* <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">
          Popular Services Near You
        </h1> */}
        <h1 className="text-start text-xl sm:text-2xl md:text-3xl mb-2 md:mb-3 text-black">
          <span className="font-semibold">Popular </span>
          <span className="font-bold text-[#F97316]">Services Near You</span>
        </h1>

        {/* <div className="text-right text-xs sm:text-sm text-orange-500 mb-3 sm:mb-4 cursor-pointer">
          View All Services →
        </div> */}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 animate-pulse"
              >
                <div className="w-full sm:w-28 h-32 sm:h-20 bg-gray-200 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center text-red-500 py-10">{error}</div>
        )}

        {/* Empty State */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No services available.
          </div>
        )}

        {/* Service Cards */}
        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <Link
                href={`/service/${service._id || service.id}`}
                key={service._id || index}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg will-change-transform"
              >
                <div className="flex flex-row gap-3 sm:gap-4 min-w-0">
                  <img
                    src={service.image || service.imageUrl || '/fallback.png'}
                    alt={service.title || service.name}
                    className="w-[30%] sm:w-28 h-24 sm:h-20 object-cover rounded-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 justify-between sm:justify-start">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {service.title || service.name}
                      </h3>
                      {(() => {
                        // console.log(
                        //   'DEBUG availabilitySchedule for',
                        //   service.title || service.name,
                        //   service.availabilitySchedule,
                        // );
                        const slot = Array.isArray(service.availabilitySchedule)
                          ? service.availabilitySchedule.find(
                              (s) => s.isAvailable,
                            )
                          : null;
                        const workDuration = slot?.workDuration;
                        return workDuration ? (
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Clock size={11} className="text-gray-700" />
                            Est. {workDuration} hrs
                          </span>
                        ) : null;
                      })()}
                      {service?.reviewCount > 0 && (
                        <span className="sm:hidden ml-auto bg-[#F97316] rounded-lg gap-1 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-[2px]  flex items-center w-fit shrink-0">
                          <Star size={10} className="fill-white shrink-0" />
                          {Number(service?.rating || 0).toFixed(1)}
                        </span>
                      )}
                      {/* {(() => {
                        const offer =
                          offersByProduct[String(service._id || service.id)];
                        const discount = Number(offer?.discountPercent || 0);
                        return offer && discount > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
                            {discount}% Off
                          </span>
                        ) : null;
                      })()} */}
                    </div>
                    {(() => {
                      const rawDesc = service.description || service.desc || '';
                      const includesMatch =
                        rawDesc.match(/includes\s*:\s*(.+)/i);
                      const includesText =
                        service.serviceMeta?.included ||
                        service.includes ||
                        (includesMatch ? includesMatch[1] : null);
                      const cleanDesc = includesMatch
                        ? rawDesc.slice(0, includesMatch.index).trim()
                        : rawDesc;

                      const includesList = includesText
                        ? Array.isArray(includesText)
                          ? includesText
                          : String(includesText)
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                        : [];

                      return (
                        <>
                          {includesList.length > 0 && (
                            <div className="mt-1">
                              <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                                What&apos;s Included:
                              </p>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {includesList.slice(0, 3).map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-orange-50 border border-[#FF8D28]/30 text-[#F97316] text-[10px] sm:text-xs px-2 py-0.5 rounded-full"
                                  >
                                    ✓ {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {cleanDesc && (
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-2 max-w-sm">
                              {cleanDesc}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#F97316] mt-2">
                            <span>Professional Service</span>
                            <span>Same Day Available</span>
                          </div>
                          {Array.isArray(service.availabilitySchedule) &&
                            (() => {
                              const dayNames = [
                                'Sun',
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thu',
                                'Fri',
                                'Sat',
                              ];
                              const todayName = dayNames[new Date().getDay()];
                              const today = service.availabilitySchedule.find(
                                (d) => d.day === todayName,
                              );

                              if (!today) return null;

                              // return (
                              //   <div className="flex items-center gap-1 text-[10px] sm:text-xs mt-1.5">
                              //     <Clock
                              //       size={11}
                              //       className={
                              //         today.isAvailable
                              //           ? 'text-green-600'
                              //           : 'text-gray-400'
                              //       }
                              //     />
                              //     {today.isAvailable ? (
                              //       <span className="text-green-600 font-medium">
                              //         {today.workDuration} hrs today
                              //       </span>
                              //     ) : (
                              //       <span className="text-gray-400">
                              //         Closed today
                              //       </span>
                              //     )}
                              //   </div>
                              // );
                            })()}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* <div className="flex flex-row sm:flex-col md:flex-col items-center justify-between sm:items-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Starting from
                    </p>

                    <div className="flex items-center sm:justify-end gap-2">
                      <span className="text-base sm:text-xl font-bold">
                        {service.price ?? service.startingPrice}
                      </span>

                      {service.originalPrice && (
                        <span className="text-gray-500 line-through text-xs sm:text-sm">
                          ₹{service.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <button */}
                <div className="flex flex-row sm:flex-col md:flex-col items-center justify-between sm:items-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <p className="sm:hidden text-[10px] sm:text-xs text-gray-500">
                      Starting from
                    </p>
                    {service?.reviewCount > 0 && (
                      <span className="hidden sm:inline-flex bg-[#F97316] gap-1 text-white text-xs px-2 py-[2px] rounded-lg items-center w-fit shrink-0 mb-1">
                        <Star size={10} className="fill-white shrink-0" />
                        {Number(service?.rating || 0).toFixed(1)}
                      </span>
                    )}

                    <div className="flex items-center sm:justify-end gap-2">
                      {(() => {
                        const serviceId = String(service._id || service.id);
                        const offer = offersByProduct[serviceId];
                        const discount = Number(offer?.discountPercent || 0);
                        const hasOffer = !!offer && discount > 0;
                        const rawPrice = service.price ?? service.startingPrice;
                        const basePrice = Number(
                          String(rawPrice ?? '').replace(/[^0-9.]/g, ''),
                        );
                        const finalPrice =
                          hasOffer &&
                          Number.isFinite(basePrice) &&
                          basePrice > 0
                            ? Math.max(
                                0,
                                Math.round(
                                  basePrice - (basePrice * discount) / 100,
                                ),
                              )
                            : null;

                        // return (
                        //   <>
                        //     <span className="text-base sm:text-xl font-bold">
                        //       {hasOffer && finalPrice != null
                        //         ? `₹${finalPrice.toLocaleString('en-IN')}`
                        //         : rawPrice}
                        //     </span>
                        //     {hasOffer && finalPrice != null ? (
                        //       <span className="text-gray-500 line-through text-xs sm:text-sm">
                        //         {rawPrice}
                        //       </span>
                        //     ) : null}
                        //   </>
                        // );

                        // const displayRawPrice = (() => {
                        //   const s = String(rawPrice ?? '').trim();
                        //   if (!s) return '—';
                        //   return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
                        // })();

                        const displayRawPrice = (() => {
                          const s = String(rawPrice ?? '').trim();
                          if (!s) return '—';
                          if (Number.isFinite(basePrice) && basePrice > 0) {
                            return `₹${basePrice.toLocaleString('en-IN')}`;
                          }
                          return /[₹]|rs\.?/i.test(s) ? s : `₹${s}`;
                        })();

                        return (
                          <>
                            <span className="text-base sm:text-xl font-bold">
                              {hasOffer && finalPrice != null
                                ? `₹${finalPrice.toLocaleString('en-IN')}`
                                : displayRawPrice}
                            </span>
                            {hasOffer && finalPrice != null ? (
                              <span className="text-gray-500 line-through text-xs sm:text-sm">
                                {displayRawPrice}
                              </span>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const serviceId = service._id || service.id;
                        try {
                          setBookingLoadingId(serviceId);
                          const res = await apiGetServiceProductById(serviceId);
                          const fullProduct = res.data?.product;
                          setBookingProduct(fullProduct || service);
                          setBookingOpen(true);
                        } catch (err) {
                          console.error(
                            'Failed to fetch service details for slot booking:',
                            err,
                          );
                          setBookingProduct(service);
                          setBookingOpen(true);
                        } finally {
                          setBookingLoadingId(null);
                        }
                      }}
                      disabled={
                        bookingLoadingId === (service._id || service.id)
                      }
                      className="border border-[#F97316] text-[#F97316] font-medium text-xs sm:text-xs px-3 sm:px-3 py-1.5 sm:py-1.5 rounded-md hover:bg-orange-50 shrink-0 flex items-center gap-1 disabled:opacity-60"
                    >
                      <Clock size={12} className="shrink-0" />
                      {bookingLoadingId === (service._id || service.id)
                        ? '...'
                        : 'Slot'}
                    </button>
                    <button className="bg-[#F97316] font-medium text-white text-xs sm:text-xs px-4 sm:px-4 py-1.5 sm:py-1.5 rounded-md hover:bg-orange-600 shrink-0">
                      Add Service
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Slot Booking Modal (shared across cards) */}
        <BookingModal
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
          product={bookingProduct}
        />

        {/* Why Choose */}
        <div className="mt-8 sm:mt-10 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl mb-2 md:mb-3 text-black">
            <span className="font-semibold">Why Choose Our </span>
            <span className="font-bold text-[#F97316]">Services</span>
          </h1>
          <div className="grid grid-cols-3 gap-3 sm:gap-10">
            {[
              {
                icon: (
                  <ShieldCheck size={18} className="sm:w-[22px] sm:h-[22px]" />
                ),
                title: 'Verified Professionals',
                desc: 'All service providers are background-checked and certified',
              },
              {
                icon: (
                  <IndianRupee size={14} className="sm:w-[22px] sm:h-[22px]" />
                ),
                title: 'Transparent Pricing',
                desc: 'No hidden charges. What you see is what you pay',
              },
              {
                icon: <Clock size={18} className="sm:w-[22px] sm:h-[22px]" />,
                title: 'On-Time Guarantee',
                desc: 'Professionals arrive on time or we compensate you',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group flex flex-col items-center text-center p-2 sm:p-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#FF8D28]/40 cursor-pointer"
              >
                <div className="bg-[#F97316] p-2 sm:p-3 rounded-lg sm:rounded-xl text-white mb-2 sm:mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {item.icon}
                </div>
                <h4 className="font-semibold mb-1 text-[11px] sm:text-base">
                  {item.title}
                </h4>
                <p className="hidden sm:block text-xs sm:text-sm max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesLanding;
