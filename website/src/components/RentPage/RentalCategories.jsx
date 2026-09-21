// 'use client';

// import React, { useEffect, useState } from 'react';
// import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
// import {
//   apiGetCategories,
//   apiGetSubCategories,
//   apiGetStorefrontVendorProducts,
// } from '@/lib/api';
// import { useRouter } from 'next/navigation';

// const RentalCategories = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isLargeScreen, setIsLargeScreen] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await apiGetCategories();
//         const mainList = Array.isArray(res.data)
//           ? res.data
//           : res.data.categories || [];

//         const subResults = await Promise.all(
//           mainList.map((cat) =>
//             apiGetSubCategories(cat._id).catch(() => ({ data: [] })),
//           ),
//         );

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
//           }));
//         });
//         const rentOnlyList = subList.filter((item) => item.availableInRent);

//         let allProducts = [];
//         try {
//           const prodRes = await apiGetStorefrontVendorProducts('limit=400');
//           allProducts = (prodRes.data?.products || []).filter(
//             (p) => String(p.type || '').toLowerCase() === 'rental',
//           );
//         } catch (e) {
//           console.error('Failed to load products for count sort:', e);
//         }

//         const withCounts = rentOnlyList.map((item) => {
//           const count = allProducts.filter(
//             (p) =>
//               String(p.category || '').toLowerCase() ===
//                 String(item.parentName || '').toLowerCase() &&
//               String(p.subCategory || '').toLowerCase() ===
//                 String(item.name || '').toLowerCase(),
//           ).length;
//           return { ...item, productCount: count };
//         });

//         withCounts.sort((a, b) => b.productCount - a.productCount);

//         setCategories(withCounts);
//       } catch (err) {
//         console.error(err);
//         setCategories([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);

//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return (
//     <section className="w-full pt-4 md:pt-8 pb-16 px-4">
//       <div className="w-full mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6 sm:mb-10 gap-1 sm:gap-2">
//           <div>
//             <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-black">
//               Rental Categories
//             </h2>
//           </div>

//           <button
//             onClick={() => router.push('/products?type=Rental')}
//             className="bg-black text-white px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm w-fit whitespace-nowrap"
//           >
//             View All
//           </button>
//         </div>

//         {/* Grid */}
//         {loading ? (
//           <div className="text-sm text-gray-500">Loading categories...</div>
//         ) : categories.length === 0 ? (
//           <div className="text-sm text-gray-500">No categories found.</div>
//         ) : (
//           <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-x-2 gap-y-4 sm:gap-3 md:gap-6">
//             {categories.slice(0, isLargeScreen ? 18 : 15).map((item, index) => (
//               <div key={item._id || index} className="group text-center">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     // router.push(
//                     //   `/products?type=Rental&category=${encodeURIComponent(
//                     //     item.name || '',
//                     //   )}`,
//                     // )
//                     router.push(
//                       `/products?type=Rental&category=${encodeURIComponent(
//                         item.parentName || item.name || '',
//                       )}&subCategory=${encodeURIComponent(item.name || '')}`,
//                     )
//                   }
//                   className="w-full bg-[#F7F7F8] border border-[#99A1AF] rounded-xl h-[72px] sm:h-[90px] md:h-[135px] hover:shadow-md hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden"
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

// export default RentalCategories;

'use client';

import React, { useEffect, useState } from 'react';
import { IMG_SUB as mainimg } from '@/lib/assetPlaceholders';
import {
  apiGetCategories,
  apiGetSubCategories,
  apiGetStorefrontVendorProducts,
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const RentalCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiGetCategories();
        const mainList = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];

        const subResults = await Promise.all(
          mainList.map((cat) =>
            apiGetSubCategories(cat._id).catch(() => ({ data: [] })),
          ),
        );

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
          }));
        });
        const rentOnlyList = subList.filter((item) => item.availableInRent);

        let allProducts = [];
        try {
          const prodRes = await apiGetStorefrontVendorProducts('limit=400');
          allProducts = (prodRes.data?.products || []).filter(
            (p) => String(p.type || '').toLowerCase() === 'rental',
          );
        } catch (e) {
          console.error('Failed to load products for count sort:', e);
        }

        const withCounts = rentOnlyList.map((item) => {
          const count = allProducts.filter(
            (p) =>
              String(p.category || '').toLowerCase() ===
                String(item.parentName || '').toLowerCase() &&
              String(p.subCategory || '').toLowerCase() ===
                String(item.name || '').toLowerCase(),
          ).length;
          return { ...item, productCount: count };
        });

        withCounts.sort((a, b) => b.productCount - a.productCount);

        setCategories(withCounts);
      } catch (err) {
        console.error(err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="w-full pt-3 md:pt-6 pb-4 md:pb-6 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 md:mb-3 gap-1 sm:gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl text-black">
              <span className="font-semibold">Rental </span>
              <span className="font-bold text-[#F97316]">Categories</span>
            </h1>
          </div>
          <button
            onClick={() => router.push('/products?type=Rental')}
            className="group bg-[#F97316] text-white px-2 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-[10px] sm:text-sm w-fit whitespace-nowrap flex items-center gap-1"
          >
            View All
            <ChevronRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-sm text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-gray-500">No categories found.</div>
        ) : (
          <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-x-2 gap-y-4 sm:gap-3 md:gap-6">
            {categories.slice(0, isLargeScreen ? 18 : 15).map((item, index) => (
              <div key={item._id || index} className="group text-center">
                <button
                  type="button"
                  onClick={() =>
                    // router.push(
                    //   `/products?type=Rental&category=${encodeURIComponent(
                    //     item.name || '',
                    //   )}`,
                    // )
                    router.push(
                      `/products?type=Rental&category=${encodeURIComponent(
                        item.parentName || item.name || '',
                      )}&subCategory=${encodeURIComponent(item.name || '')}`,
                    )
                  }
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

export default RentalCategories;
