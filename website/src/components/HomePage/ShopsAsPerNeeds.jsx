// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
// import {
//   apiGetCategories,
//   apiGetSubCategories,
//   apiGetActiveRentaBanners,
// } from '@/lib/api';
// import { useRouter } from 'next/navigation';

// const ShopsAsPerNeeds = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isDesktop, setIsDesktop] = useState(false);
//   const router = useRouter();

//   const [rentaBanners, setRentaBanners] = useState([]);
//   const [bannerIndex, setBannerIndex] = useState(0);
//   const [bannerLoaded, setBannerLoaded] = useState(false);

//   useEffect(() => {
//     let isMounted = true;

//     apiGetActiveRentaBanners()
//       .then((res) => {
//         if (!isMounted) return;
//         if (res.data?.banners?.length) setRentaBanners(res.data.banners);
//       })
//       .catch(() => {})
//       .finally(() => {
//         if (isMounted) setBannerLoaded(true);
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (rentaBanners.length <= 1) return;
//     const t = setInterval(
//       () => setBannerIndex((i) => (i + 1) % rentaBanners.length),
//       5000,
//     );
//     return () => clearInterval(t);
//   }, [rentaBanners]);

//   const currentRentaBanner =
//     rentaBanners.length > 0 ? rentaBanners[bannerIndex] : null;

//   useEffect(() => {
//     let isMounted = true;

//     const load = async () => {
//       try {
//         const res = await apiGetCategories();
//         const mainList = Array.isArray(res?.data)
//           ? res.data
//           : res?.data?.categories || [];

//         const subResults = await Promise.all(
//           mainList.map((cat) =>
//             apiGetSubCategories(cat._id).catch(() => ({ data: [] })),
//           ),
//         );

//         if (!isMounted) return;

//         const subList = mainList.flatMap((cat, idx) => {
//           const subs = Array.isArray(subResults[idx]?.data)
//             ? subResults[idx].data
//             : subResults[idx]?.data?.subCategories || [];
//           return subs.map((sub) => ({
//             ...sub,
//             parentName: cat.name,
//             availableInRent:
//               sub.availableInRent !== undefined
//                 ? sub.availableInRent
//                 : cat.availableInRent,
//             availableInBuy:
//               sub.availableInBuy !== undefined
//                 ? sub.availableInBuy
//                 : cat.availableInBuy,
//             availableInServices:
//               sub.availableInServices !== undefined
//                 ? sub.availableInServices
//                 : cat.availableInServices,
//           }));
//         });

//         setCategories(subList);
//       } catch (e) {
//         console.error('[ShopsAsPerNeeds]', e);

//         if (!isMounted) return;

//         setCategories([]);
//       } finally {
//         if (!isMounted) return;

//         setLoading(false);
//       }
//     };

//     load();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     const checkScreen = () => {
//       setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
//     };

//     checkScreen();
//     window.addEventListener('resize', checkScreen);

//     return () => window.removeEventListener('resize', checkScreen);
//   }, []);

//   // const rentCategories = useMemo(() => {
//   //   const isRentEnabled = (c) => {
//   //     const v = c?.availableInRent;

//   //     return (
//   //       v === true ||
//   //       v === 'true' ||
//   //       v === 1 ||
//   //       v === '1' ||
//   //       v === undefined ||
//   //       v === null
//   //     );
//   //   };

//   //   return categories.filter(isRentEnabled);
//   // }, [categories]);
//   const rentCategories = useMemo(() => {
//     return categories.filter((c) => c?.availableInRent === true);
//   }, [categories]);

//   // const displayed = rentCategories.slice(0, isDesktop ? 12 : 15);
//   const featuredLimit = isDesktop ? 18 : 15;
//   const remainingCategories = rentCategories.slice(featuredLimit);
//   const displayed = remainingCategories.slice(0, isDesktop ? 12 : 15);

//   // Hide this section entirely if FeaturedCategories already showed everything
//   if (!loading && remainingCategories.length === 0) {
//     return null;
//   }

//   return (
//     <section className="w-full pt-2 md:pt-6 pb-8 md:pb-12 px-4">
//       <div className="mx-auto">
//         {/* Heading */}
//         <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-5 md:mb-10">
//           Rent As Per Your Needs !
//         </h2>

//         {/* Main Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr] gap-4 lg:gap-6 items-stretch">
//           {/* Left Banner */}
//           <div className="hidden lg:block h-[535px] overflow-hidden rounded-2xl border-2 border-orange-500 shadow-md">
//             {bannerLoaded && currentRentaBanner?.image && (
//               <img
//                 src={currentRentaBanner.image}
//                 alt={currentRentaBanner?.title || 'Rent Banner'}
//                 className="w-full h-[535px] rounded-2xl object-cover transition-opacity duration-500 hover:scale-110"
//               />
//             )}
//           </div>

//           {/* Right Categories */}
//           <div className="col-span-1 grid grid-cols-5 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 content-start">
//             {loading
//               ? Array.from({ length: 8 }).map((_, index) => (
//                   <div key={`skeleton-${index}`} className="group text-center">
//                     <div className="w-full bg-[#F7F7F8] border border-[#99A1AF] rounded-xl h-[115px] sm:h-[125px] md:h-[135px] p-2 sm:p-3 flex items-center justify-center overflow-hidden">
//                       <img
//                         src={mainimg}
//                         alt=""
//                         className="w-full h-full object-contain opacity-40"
//                       />
//                     </div>

//                     <p className="mt-2 text-sm text-gray-300">&nbsp;</p>
//                   </div>
//                 ))
//               : displayed.map((c, index) => {
//                   const title = c?.name || c?.title || `Category ${index + 1}`;
//                   const image = c?.image || c?.icon || mainimg;

//                   return (
//                     <div
//                       key={c?._id || c?.id || `${title}-${index}`}
//                       className="group text-center"
//                     >
//                       <button
//                         type="button"
//                         onClick={() =>
//                           router.push(
//                             `/products?category=${encodeURIComponent(
//                               c?.parentName || title,
//                             )}&subCategory=${encodeURIComponent(title)}`,
//                           )
//                         }
//                         className="w-full bg-[#F7F7F8] border border-[#99A1AF] rounded-xl h-[72px] sm:h-[90px] md:h-[135px] hover:shadow-md hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden"
//                       >
//                         <img
//                           src={image}
//                           alt={title}
//                           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
//                         />
//                       </button>

//                       <p className="mt-2 w-full overflow-hidden whitespace-nowrap text-ellipsis text-gray-800 font-medium text-[10px] sm:text-xs md:text-sm transition-all duration-300 group-hover:text-orange-500">
//                         {title}
//                       </p>
//                     </div>
//                   );
//                 })}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ShopsAsPerNeeds;

'use client';

import { useEffect, useMemo, useState } from 'react';
import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
import {
  apiGetCategories,
  apiGetSubCategories,
  apiGetActiveRentaBanners,
} from '@/lib/api';
import { useRouter } from 'next/navigation';

const ShopsAsPerNeeds = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  const [rentaBanners, setRentaBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    apiGetActiveRentaBanners()
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.banners?.length) setRentaBanners(res.data.banners);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setBannerLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (rentaBanners.length <= 1) return;
    const t = setInterval(
      () => setBannerIndex((i) => (i + 1) % rentaBanners.length),
      5000,
    );
    return () => clearInterval(t);
  }, [rentaBanners]);

  const currentRentaBanner =
    rentaBanners.length > 0 ? rentaBanners[bannerIndex] : null;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await apiGetCategories();
        const mainList = Array.isArray(res?.data)
          ? res.data
          : res?.data?.categories || [];

        const subResults = await Promise.all(
          mainList.map((cat) =>
            apiGetSubCategories(cat._id).catch(() => ({ data: [] })),
          ),
        );

        if (!isMounted) return;

        const subList = mainList.flatMap((cat, idx) => {
          const subs = Array.isArray(subResults[idx]?.data)
            ? subResults[idx].data
            : subResults[idx]?.data?.subCategories || [];
          return subs.map((sub) => ({
            ...sub,
            parentName: cat.name,
            availableInRent:
              sub.availableInRent !== undefined
                ? sub.availableInRent
                : cat.availableInRent,
            availableInBuy:
              sub.availableInBuy !== undefined
                ? sub.availableInBuy
                : cat.availableInBuy,
            availableInServices:
              sub.availableInServices !== undefined
                ? sub.availableInServices
                : cat.availableInServices,
          }));
        });

        setCategories(subList);
      } catch (e) {
        console.error('[ShopsAsPerNeeds]', e);

        if (!isMounted) return;

        setCategories([]);
      } finally {
        if (!isMounted) return;

        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);

    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // const rentCategories = useMemo(() => {
  //   const isRentEnabled = (c) => {
  //     const v = c?.availableInRent;

  //     return (
  //       v === true ||
  //       v === 'true' ||
  //       v === 1 ||
  //       v === '1' ||
  //       v === undefined ||
  //       v === null
  //     );
  //   };

  //   return categories.filter(isRentEnabled);
  // }, [categories]);
  const rentCategories = useMemo(() => {
    return categories.filter((c) => c?.availableInRent === true);
  }, [categories]);

  // const displayed = rentCategories.slice(0, isDesktop ? 12 : 15);
  const featuredLimit = isDesktop ? 18 : 15;
  const remainingCategories = rentCategories.slice(featuredLimit);
  const displayed = remainingCategories.slice(0, isDesktop ? 12 : 15);

  // Hide this section entirely if FeaturedCategories already showed everything
  if (!loading && remainingCategories.length === 0) {
    return null;
  }

  return (
    // <section className="w-full pt-1 pb-4 md:pt-2 md:pb-6 px-4">
    <section className="w-full pt-3 pb-4 md:pt-6 md:pb-6 px-4">
      <div className="mx-auto">
        {/* Heading */}
        <h1 className="text-lg sm:text-2xl md:text-3xl mb-2 md:mb-3">
          <span className="font-semibold text-black">Rent As Per </span>
          <span className="font-bold text-[#F97316]">Your Needs!</span>
        </h1>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr] gap-4 lg:gap-6 items-stretch">
          {/* Left Banner */}
          <div className="hidden lg:block h-[535px] overflow-hidden rounded-2xl border-2 border-orange-500 shadow-md">
            {bannerLoaded && currentRentaBanner?.image && (
              <img
                src={currentRentaBanner.image}
                alt={currentRentaBanner?.title || 'Rent Banner'}
                className="w-full h-[535px] rounded-2xl object-cover transition-opacity duration-500 hover:scale-110"
              />
            )}
          </div>

          {/* Right Categories */}
          <div className="col-span-1 grid grid-cols-5 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 content-start">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="group text-center">
                    <div className="w-full bg-[#F7F7F8] border border-[#99A1AF] rounded-xl h-[115px] sm:h-[125px] md:h-[135px] p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={mainimg}
                        alt=""
                        className="w-full h-full object-contain opacity-40"
                      />
                    </div>

                    <p className="mt-2 text-sm text-gray-300">&nbsp;</p>
                  </div>
                ))
              : displayed.map((c, index) => {
                  const title = c?.name || c?.title || `Category ${index + 1}`;
                  const image = c?.image || c?.icon || mainimg;

                  return (
                    <div
                      key={c?._id || c?.id || `${title}-${index}`}
                      className="group text-center"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/products?category=${encodeURIComponent(
                              c?.parentName || title,
                            )}&subCategory=${encodeURIComponent(title)}`,
                          )
                        }
                        className="w-full bg-[#F7F7F8] border border-[#99A1AF] rounded-xl h-[72px] sm:h-[90px] md:h-[135px] hover:shadow-md hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </button>

                      <p className="mt-2 w-full overflow-hidden whitespace-nowrap text-ellipsis text-gray-800 font-medium text-[10px] sm:text-xs md:text-sm transition-all duration-300 group-hover:text-orange-500">
                        {title}
                      </p>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopsAsPerNeeds;
