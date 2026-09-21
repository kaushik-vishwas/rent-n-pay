// 'use client';

// import React, { useEffect, useState } from 'react';
// import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
// import { apiGetCategories, apiGetSubCategories } from '@/lib/api';
// import { useRouter } from 'next/navigation';

// const DELIVERY_STORAGE_KEY = 'rn_delivery_location';

// const NeedHelpSection = () => {
//   const [deliveryLabel, setDeliveryLabel] = useState('Choose your location');
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const readLabel = () => {
//       try {
//         const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
//         if (!raw) return;
//         const parsed = JSON.parse(raw);
//         if (parsed?.label) setDeliveryLabel(parsed.label);
//       } catch {}
//     };

//     const onCustomChange = (e) => {
//       if (e?.detail?.label) setDeliveryLabel(e.detail.label);
//     };

//     readLabel();
//     window.addEventListener('rn_delivery_location_changed', onCustomChange);
//     window.addEventListener('storage', readLabel);
//     return () => {
//       window.removeEventListener(
//         'rn_delivery_location_changed',
//         onCustomChange,
//       );
//       window.removeEventListener('storage', readLabel);
//     };
//   }, []);

//   // useEffect(() => {
//   //   const fetchServiceCategories = async () => {
//   //     try {
//   //       const res = await apiGetCategories();
//   //       const mainList = Array.isArray(res.data)
//   //         ? res.data
//   //         : res.data.categories || [];

//   //       const subResults = await Promise.all(
//   //         mainList.map((cat) =>
//   //           apiGetSubCategories(cat._id).catch(() => ({ data: [] })),
//   //         ),
//   //       );

//   //       const subList = mainList.flatMap((cat, idx) => {
//   //         const subs = Array.isArray(subResults[idx]?.data)
//   //           ? subResults[idx].data
//   //           : subResults[idx]?.data?.subCategories || [];
//   //         return subs.map((sub) => ({
//   //           ...sub,
//   //           parentName: cat.name,
//   //           availableInService:
//   //             sub.availableInService !== undefined
//   //               ? sub.availableInService
//   //               : cat.availableInService,
//   //         }));
//   //       });

//   //       setServices(subList.filter((item) => item.availableInService));
//   //     } catch (err) {
//   //       console.error(err);
//   //       setServices([]);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchServiceCategories();
//   // }, []);

//   useEffect(() => {
//     const fetchServiceCategories = async () => {
//       try {
//         const res = await apiGetCategories();
//         console.log('CATEGORIES RAW RESPONSE:', res.data);

//         const mainList = Array.isArray(res.data)
//           ? res.data
//           : res.data.categories || [];
//         console.log('MAIN CATEGORY LIST:', mainList);

//         const subResults = await Promise.all(
//           mainList.map((cat) =>
//             apiGetSubCategories(cat._id).catch((e) => {
//               console.log('SUBCATEGORY FETCH FAILED for', cat.name, e);
//               return { data: [] };
//             }),
//           ),
//         );
//         console.log('SUBCATEGORY RESULTS (raw):', subResults);

//         const subList = mainList.flatMap((cat, idx) => {
//           const subs = Array.isArray(subResults[idx]?.data)
//             ? subResults[idx].data
//             : subResults[idx]?.data?.subCategories || [];
//           Replace: return subs.map((sub) => ({
//             ...sub,
//             parentName: cat.name,
//             availableInServices:
//               sub.availableInServices !== undefined
//                 ? sub.availableInServices
//                 : cat.availableInServices,
//           }));
//         });
//         console.log('FLATTENED SUBLIST (before filter):', subList);
//         console.log(
//           'FLATTENED SUBLIST (JSON):',
//           JSON.stringify(subList, null, 2),
//         );

//         const filtered = subList.filter((item) => item.availableInServices);
//         console.log('FILTERED SERVICES (final):', filtered);

//         setServices(filtered);
//       } catch (err) {
//         console.error('SERVICE FETCH ERROR:', err);
//         setServices([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServiceCategories();
//   }, []);

//   return (
//     <section className="w-full bg-white pt-4 sm:pt-6 pb-10 px-4">
//       <div className="w-full mx-auto">
//         {/* Search and delivery bar */}
//         {/* <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0">
//           <div className="relative flex-1 min-w-0 rounded-full sm:rounded-r-none border border-gray-200 bg-white shadow-sm sm:border-r-0">
//             <Search
//               className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
//               aria-hidden
//             />
//             <input
//               type="search"
//               placeholder='Try "Samsung Washing Machine"'
//               className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 border-0 rounded-full sm:rounded-r-none focus:ring-0"
//               aria-label="Search for products or services"
//             />
//           </div>

//           <button
//             type="button"
//             className="flex items-center justify-center gap-2 px-4 py-3 rounded-full sm:rounded-l-none border border-gray-200 sm:border-l-0 bg-white shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
//             aria-label="Change delivery location"
//           >
//             <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
//             <span className="truncate">Deliver to Sadashiv Peth, Pune</span>
//             <span className="text-gray-400 shrink-0" aria-hidden>
//               ▾
//             </span>
//           </button>
//         </div> */}
//         {/* <div className="flex flex-col sm:flex-row w-full gap-2">

//           <div className="relative flex-1 min-w-0 rounded-full border border-[#99A1AF] bg-white shadow-sm">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//             <input
//               type="search"
//               placeholder='Try "Samsung Washing Machine"'
//               className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 rounded-full"
//             />
//           </div>

//           <button
//             type="button"
//             className="flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
//           >
//             <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
//             <span className="truncate">
//               {deliveryLabel.length > 30
//                 ? `${deliveryLabel.slice(0, 30)}...`
//                 : deliveryLabel}
//             </span>
//             <span className="text-gray-400 shrink-0">▾</span>
//           </button>
//         </div> */}

//         {/* Heading */}
//         <div className="flex items-center justify-between mb-6 sm:mb-10 gap-1 sm:gap-2">
//           <div>
//             <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-black">
//               Service Categories
//             </h2>
//           </div>

//           <button
//             onClick={() => router.push('/products?tab=services')}
//             className="bg-black text-white px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm w-fit whitespace-nowrap"
//           >
//             View All
//           </button>
//         </div>

//         {/* Orange circular icons row */}
//         {/* {loading ? (
//           <div className="text-sm text-gray-500 text-center">
//             Loading services...
//           </div>
//         ) : services.length === 0 ? (
//           <div className="text-sm text-gray-500 text-center">
//             No services found.
//           </div>
//         ) : (
//           <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10 md:gap-x-14 lg:gap-x-14 xl:gap-x-16">
//             {services.map((item, index) => (
//               <div
//                 key={item._id || index}
//                 className="flex flex-col items-center gap-3 w-20 sm:w-24 md:w-28 lg:w-32 cursor-pointer group"
//                 onClick={() =>
//                   router.push(
//                     `/products?category=${encodeURIComponent(
//                       item.parentName || item.name || '',
//                     )}&subCategory=${encodeURIComponent(item.name || '')}`,
//                   )
//                 }
//               >
//                 <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full bg-[#FF8D28] flex items-center justify-center text-white overflow-hidden">
//                   <img
//                     src={item.image || mainimg}
//                     alt={item.name}
//                     className="w-8 h-8 object-contain"
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = mainimg;
//                     }}
//                   />
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-800 text-center leading-tight group-hover:text-orange-500 transition-colors">
//                   {item.name}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )} */}

//         {/* Card style services grid */}
//         {loading ? (
//           <div className="text-sm text-gray-500 text-center">
//             Loading services...
//           </div>
//         ) : services.length === 0 ? (
//           <div className="text-sm text-gray-500 text-center">
//             No services found.
//           </div>
//         ) : (
//           <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-x-2 gap-y-4 sm:gap-3 md:gap-6">
//             {services.map((item, index) => (
//               <div key={item._id || index} className="group text-center">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     router.push(
//                       `/products?tab=services&category=${encodeURIComponent(
//                         item.parentName || item.name || '',
//                       )}&subCategory=${encodeURIComponent(item.name || '')}`,
//                     )
//                   }
//                   className="w-full bg-[#F7F7F8] border border-[#99A1AF] rounded-xl h-[72px] sm:h-[90px] md:h-[135px] hover:shadow-md hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden cursor-pointer"
//                 >
//                   <img
//                     src={item.image || mainimg}
//                     alt={item.name}
//                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = mainimg;
//                     }}
//                   />
//                 </button>

//                 <p className="mt-1 sm:mt-2 w-full overflow-hidden whitespace-nowrap text-ellipsis text-gray-800 font-medium text-[10px] sm:text-xs md:text-sm transition-all duration-300 group-hover:text-orange-500">
//                   {item.name}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default NeedHelpSection;

'use client';

import React, { useEffect, useState } from 'react';
import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
import {
  apiGetCategories,
  apiGetSubCategories,
  apiGetServiceProducts,
} from '@/lib/api';
import { useRouter } from 'next/navigation';

const DELIVERY_STORAGE_KEY = 'rn_delivery_location';

const NeedHelpSection = () => {
  const [deliveryLabel, setDeliveryLabel] = useState('Choose your location');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliceCount, setSliceCount] = useState(15);
  const router = useRouter();

  useEffect(() => {
    const readLabel = () => {
      try {
        const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.label) setDeliveryLabel(parsed.label);
      } catch {}
    };

    const onCustomChange = (e) => {
      if (e?.detail?.label) setDeliveryLabel(e.detail.label);
    };

    readLabel();
    window.addEventListener('rn_delivery_location_changed', onCustomChange);
    window.addEventListener('storage', readLabel);
    return () => {
      window.removeEventListener(
        'rn_delivery_location_changed',
        onCustomChange,
      );
      window.removeEventListener('storage', readLabel);
    };
  }, []);

  // useEffect(() => {
  //   const fetchServiceCategories = async () => {
  //     try {
  //       const res = await apiGetCategories();
  //       const mainList = Array.isArray(res.data)
  //         ? res.data
  //         : res.data.categories || [];

  //       const subResults = await Promise.all(
  //         mainList.map((cat) =>
  //           apiGetSubCategories(cat._id).catch(() => ({ data: [] })),
  //         ),
  //       );

  //       const subList = mainList.flatMap((cat, idx) => {
  //         const subs = Array.isArray(subResults[idx]?.data)
  //           ? subResults[idx].data
  //           : subResults[idx]?.data?.subCategories || [];
  //         return subs.map((sub) => ({
  //           ...sub,
  //           parentName: cat.name,
  //           availableInService:
  //             sub.availableInService !== undefined
  //               ? sub.availableInService
  //               : cat.availableInService,
  //         }));
  //       });

  //       setServices(subList.filter((item) => item.availableInService));
  //     } catch (err) {
  //       console.error(err);
  //       setServices([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchServiceCategories();
  // }, []);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const res = await apiGetCategories();
        console.log('CATEGORIES RAW RESPONSE:', res.data);

        const mainList = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];
        console.log('MAIN CATEGORY LIST:', mainList);

        const subResults = await Promise.all(
          mainList.map((cat) =>
            apiGetSubCategories(cat._id).catch((e) => {
              console.log('SUBCATEGORY FETCH FAILED for', cat.name, e);
              return { data: [] };
            }),
          ),
        );
        console.log('SUBCATEGORY RESULTS (raw):', subResults);

        const subList = mainList.flatMap((cat, idx) => {
          const subs = Array.isArray(subResults[idx]?.data)
            ? subResults[idx].data
            : subResults[idx]?.data?.subCategories || [];
          Replace: return subs.map((sub) => ({
            ...sub,
            parentName: cat.name,
            availableInServices:
              sub.availableInServices !== undefined
                ? sub.availableInServices
                : cat.availableInServices,
          }));
        });
        console.log('FLATTENED SUBLIST (before filter):', subList);
        console.log(
          'FLATTENED SUBLIST (JSON):',
          JSON.stringify(subList, null, 2),
        );

        // const filtered = subList.filter((item) => item.availableInServices);
        // console.log('FILTERED SERVICES (final):', filtered);

        // setServices(filtered);
        const filtered = subList.filter((item) => item.availableInServices);
        console.log('FILTERED SERVICES (final):', filtered);

        let allServiceProducts = [];
        try {
          const svcRes = await apiGetServiceProducts();
          allServiceProducts = svcRes.data?.products || [];
        } catch (e) {
          console.error('Failed to load service products for count sort:', e);
        }

        const withCounts = filtered.map((item) => {
          const count = allServiceProducts.filter(
            (p) =>
              String(p.category || p.parentName || '').toLowerCase() ===
                String(item.parentName || '').toLowerCase() &&
              String(p.subCategory || p.name || '').toLowerCase() ===
                String(item.name || '').toLowerCase(),
          ).length;
          return { ...item, productCount: count };
        });

        withCounts.sort((a, b) => b.productCount - a.productCount);

        setServices(withCounts);
      } catch (err) {
        console.error('SERVICE FETCH ERROR:', err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceCategories();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 768)
        setSliceCount(12); // md & lg: 6 cols x 2 rows
      else setSliceCount(15); // mobile: 5 cols x 3 rows
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="w-full bg-white pt-4 sm:pt-6 pb-4 md:pb-6 px-4">
      <div className="w-full mx-auto">
        {/* Search and delivery bar */}
        {/* <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0">
          <div className="relative flex-1 min-w-0 rounded-full sm:rounded-r-none border border-gray-200 bg-white shadow-sm sm:border-r-0">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              placeholder='Try "Samsung Washing Machine"'
              className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 border-0 rounded-full sm:rounded-r-none focus:ring-0"
              aria-label="Search for products or services"
            />
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-full sm:rounded-l-none border border-gray-200 sm:border-l-0 bg-white shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
            aria-label="Change delivery location"
          >
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">Deliver to Sadashiv Peth, Pune</span>
            <span className="text-gray-400 shrink-0" aria-hidden>
              ▾
            </span>
          </button>
        </div> */}
        {/* <div className="flex flex-col sm:flex-row w-full gap-2">
        
          <div className="relative flex-1 min-w-0 rounded-full border border-[#99A1AF] bg-white shadow-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder='Try "Samsung Washing Machine"'
              className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 rounded-full"
            />
          </div>

        
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
          >
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">
              {deliveryLabel.length > 30
                ? `${deliveryLabel.slice(0, 30)}...`
                : deliveryLabel}
            </span>
            <span className="text-gray-400 shrink-0">▾</span>
          </button>
        </div> */}

        {/* Heading */}
        <div className="flex items-center justify-between mb-2 md:mb-3 gap-1 sm:gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl text-black">
              <span className="font-semibold">Service </span>
              <span className="font-bold text-[#F97316]">Categories</span>
            </h1>
          </div>

          {/* <button
            onClick={() => router.push('/products?tab=services')}
            className="bg-[#F97316] font-bold text-white px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm w-fit whitespace-nowrap"
          >
            View All
          </button> */}
        </div>

        {/* Orange circular icons row */}
        {/* {loading ? (
          <div className="text-sm text-gray-500 text-center">
            Loading services...
          </div>
        ) : services.length === 0 ? (
          <div className="text-sm text-gray-500 text-center">
            No services found.
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10 md:gap-x-14 lg:gap-x-14 xl:gap-x-16">
            {services.map((item, index) => (
              <div
                key={item._id || index}
                className="flex flex-col items-center gap-3 w-20 sm:w-24 md:w-28 lg:w-32 cursor-pointer group"
                onClick={() =>
                  router.push(
                    `/products?category=${encodeURIComponent(
                      item.parentName || item.name || '',
                    )}&subCategory=${encodeURIComponent(item.name || '')}`,
                  )
                }
              >
                <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full bg-[#FF8D28] flex items-center justify-center text-white overflow-hidden">
                  <img
                    src={item.image || mainimg}
                    alt={item.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = mainimg;
                    }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-800 text-center leading-tight group-hover:text-orange-500 transition-colors">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        )} */}

        {/* Card style services grid */}
        {loading ? (
          <div className="text-sm text-gray-500 text-center">
            Loading services...
          </div>
        ) : services.length === 0 ? (
          <div className="text-sm text-gray-500 text-center">
            No services found.
          </div>
        ) : (
          <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-x-2 gap-y-4 sm:gap-3 md:gap-6">
            {services.slice(0, sliceCount).map((item, index) => (
              <div key={item._id || index} className="group text-center">
                <button
                  type="button"
                  // onClick={() =>
                  //   router.push(
                  //     `/products?tab=services&category=${encodeURIComponent(
                  //       item.parentName || item.name || '',
                  //     )}&subCategory=${encodeURIComponent(item.name || '')}`,
                  //   )
                  // }
                  className="w-full bg-[#F7F7F8] border border-[#99A1AF] rounded-xl h-[72px] sm:h-[90px] md:h-[135px] hover:shadow-md hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={item.image || mainimg}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = mainimg;
                    }}
                  />
                </button>

                <p className="mt-1 sm:mt-2 w-full overflow-hidden whitespace-nowrap text-ellipsis text-gray-800 font-medium text-[10px] sm:text-xs md:text-sm transition-all duration-300 group-hover:text-orange-500">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NeedHelpSection;
