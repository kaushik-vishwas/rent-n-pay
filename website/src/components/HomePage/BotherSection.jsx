// 'use client';

// import React, { useState, useEffect } from 'react';
// import rentImg from '@/assets/images/rent11.png';
// import buyImg from '@/assets/images/buy1.png';
// import serviceImg from '@/assets/images/service1.png';

// import { apiGetStorefrontVendorProducts, apiGetCategories } from '@/lib/api';
// import { getRentalListingAmount } from '@/lib/rentalPriceDisplay';
// import { useRouter } from 'next/navigation';

// const BotherSection = () => {
//   const router = useRouter();
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [lowestRentPrice, setLowestRentPrice] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [catRes, prodRes] = await Promise.all([
//           apiGetCategories(),
//           apiGetStorefrontVendorProducts('limit=300'),
//         ]);

//         // const categoryList = Array.isArray(catRes.data)
//         //   ? catRes.data
//         //   : catRes.data.categories || [];
//         const categoryList = Array.isArray(catRes.data)
//           ? catRes.data
//           : catRes.data.categories || [];

//         console.log('All Categories:', categoryList);

//         console.log(
//           categoryList.map((c) => ({
//             name: c.name,
//             availableInRent: c.availableInRent,
//           })),
//         );

//         // const rentCategories = categoryList.filter(
//         //   (cat) => cat.availableInRent === true,
//         // );
//         const rentCategories = categoryList.filter(
//           (cat) => cat.availableInRent === true,
//         );

//         console.log('Filtered Rent Categories:', rentCategories);

//         setCategories(rentCategories);

//         setCategories(rentCategories);

//         const products = prodRes.data?.products || [];

//         const rentalPrices = products
//           .filter((p) => String(p.type || '').toLowerCase() === 'rental')
//           .map((p) => getRentalListingAmount(p))
//           .filter((p) => p > 0);

//         if (rentalPrices.length > 0) {
//           setLowestRentPrice(Math.min(...rentalPrices));
//         } else {
//           setLowestRentPrice(null);
//         }
//       } catch (err) {
//         console.error('Failed to load categories:', err);
//         setCategories([]);
//         setLowestRentPrice(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <section className="w-full pt-1 pb-4 md:pt-2 md:pb-6 px-4">
//       <div className="mx-auto">
//         {/* <h2 className="text-2xl md:text-3xl font-bold mb-10"> */}
//         {/* <h2 className="text-lg sm:text-2xl md:text-3xl mb-4 md:mb-8 font-bold text-black">
//           What's Bothering You ?
//         </h2> */}
//         <h1 className="text-lg sm:text-2xl md:text-3xl mb-2 md:mb-3 text-black">
//           <span className="font-semibold"> What&apos;s </span>
//           <span className="font-bold text-[#F97316]">Bothering You?</span>
//         </h1>

//         <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-6">
//           {/* RENT CARD */}
//           <button
//             type="button"
//             onClick={() => router.push('/rent')}
//             className="text-left border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex flex-col justify-between min-h-[220px] md:min-h-[360px] relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
//           >
//             <div>
//               <div className="mb-4">
//                 <p className="text-[10px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block">
//                   {lowestRentPrice != null
//                     ? `Starts @ ₹${lowestRentPrice.toLocaleString('en-IN')}`
//                     : 'Best Price'}
//                 </p>
//               </div>

//               <h3 className="text-sm md:text-xl font-semibold mb-2">
//                 Renting →
//               </h3>

//               <p className="hidden md:block font-medium text-sm text-gray-600 mb-4">
//                 Upgrade your lifestyle without the commitment. Free relocation &
//                 maintenance included.
//               </p>

//               <ul className="text-sm font-medium text-gray-700 space-y-0">
//                 {loading ? (
//                   <li className="text-gray-500">Loading...</li>
//                 ) : categories.length === 0 ? (
//                   <li className="text-gray-500">No categories.</li>
//                 ) : (
//                   categories.slice(0, 10).map((c) => (
//                     <li
//                       key={c._id || c.slug || c.name}
//                       className="text-[10px] sm:text-xs md:text-sm truncate"
//                     >
//                       {c.name}
//                     </li>
//                   ))
//                 )}
//               </ul>
//             </div>

//             <img
//               src={rentImg.src}
//               alt="rent"
//               className="absolute bottom-0 right-0 w-24 md:w-60 object-contain"
//             />
//           </button>

//           {/* RIGHT SIDE */}
//           <div className="grid grid-rows-2 gap-2 sm:gap-3 md:gap-6">
//             {/* BUY CARD */}
//             <button
//               type="button"
//               onClick={() => router.push('/buy')}
//               //   className="text-left w-full border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex justify-between items-center relative overflow-hidden min-h-[105px] md:min-h-0 hover:shadow-md transition-shadow"
//               // >
//               //   <div className="relative z-10 w-1/2 md:w-full">
//               className="text-left w-full border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex justify-between items-start md:items-center relative overflow-hidden min-h-[105px] md:min-h-0 hover:shadow-md transition-shadow"
//             >
//               <div className="relative z-10 w-1/2 md:w-full pt-2 md:pt-0">
//                 {/* <div className="mb-2">
//                   <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
//                     Verified Products
//                   </p>
//                 </div>

//                 <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
//                   Buy New & Used →
//                 </h3> */}
//                 <div className="mb-0.5 md:mb-2">
//                   <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
//                     Verified Products
//                   </p>
//                 </div>

//                 <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
//                   Buy New & Used →
//                 </h3>

//                 <p className="hidden font-medium md:block text-sm text-gray-600 mt-2 max-w-[200px]">
//                   Shop brand new or certified refurbished items from stores near
//                   you
//                 </p>
//               </div>

//               <img
//                 src={buyImg.src}
//                 alt="buy"
//                 className="absolute right-0 bottom-0 w-32 sm:top-0 sm:bottom-auto sm:right-0 sm:w-40 md:-right-4 md:w-72 object-contain"
//               />
//             </button>

//             {/* SERVICE CARD */}
//             <button
//               type="button"
//               onClick={() => router.push('/service')}
//               //   className="text-left w-full border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex justify-between items-center relative overflow-hidden min-h-[105px] md:min-h-0 hover:shadow-md transition-shadow"
//               // >
//               //   <div className="w-1/2 md:w-full">
//               className="text-left w-full border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex justify-between items-start md:items-center relative overflow-hidden min-h-[105px] md:min-h-0 hover:shadow-md transition-shadow"
//             >
//               <div className="w-1/2 md:w-full pt-2 md:pt-0">
//                 {/* <div className="mb-2">
//                   <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
//                     Arrives in 2Hrs
//                   </p>
//                 </div>

//                 <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
//                   Book Services →
//                 </h3> */}
//                 <div className="mb-0.5 md:mb-2">
//                   <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
//                     Arrives in 2Hrs
//                   </p>
//                 </div>

//                 <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
//                   Book Services →
//                 </h3>

//                 <p className="hidden font-medium md:block text-sm text-gray-600 mt-2 max-w-[200px]">
//                   Verified professionals for repairs, cleaning, and installation
//                 </p>
//               </div>

//               <img
//                 src={serviceImg.src}
//                 alt="service"
//                 className="absolute -right-2 bottom-0 w-28 md:w-44 object-contain"
//               />
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BotherSection;

'use client';

import React, { useState, useEffect } from 'react';
import rentImg from '@/assets/images/rent11.png';
import buyImg from '@/assets/images/buy1.png';
import serviceImg from '@/assets/images/service1.png';

import {
  apiGetStorefrontVendorProducts,
  apiGetCategories,
  apiGetPublicLocationSettings,
} from '@/lib/api';
import { getRentalListingAmount } from '@/lib/rentalPriceDisplay';
import { useRouter } from 'next/navigation';

const BotherSection = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowestRentPrice, setLowestRentPrice] = useState(null);
  const [locationSourceFlags, setLocationSourceFlags] = useState({
    rentEnabled: true,
    buyEnabled: true,
    serviceEnabled: true,
  });

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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiGetCategories(),
          apiGetStorefrontVendorProducts('limit=300'),
        ]);

        // const categoryList = Array.isArray(catRes.data)
        //   ? catRes.data
        //   : catRes.data.categories || [];
        const categoryList = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data.categories || [];

        console.log('All Categories:', categoryList);

        console.log(
          categoryList.map((c) => ({
            name: c.name,
            availableInRent: c.availableInRent,
          })),
        );

        // const rentCategories = categoryList.filter(
        //   (cat) => cat.availableInRent === true,
        // );
        const rentCategories = categoryList.filter(
          (cat) => cat.availableInRent === true,
        );

        console.log('Filtered Rent Categories:', rentCategories);

        setCategories(rentCategories);

        setCategories(rentCategories);

        const products = prodRes.data?.products || [];

        const rentalPrices = products
          .filter((p) => String(p.type || '').toLowerCase() === 'rental')
          .map((p) => getRentalListingAmount(p))
          .filter((p) => p > 0);

        if (rentalPrices.length > 0) {
          setLowestRentPrice(Math.min(...rentalPrices));
        } else {
          setLowestRentPrice(null);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
        setLowestRentPrice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="w-full pt-1 pb-4 md:pt-2 md:pb-6 px-4">
      <div className="mx-auto">
        {/* <h2 className="text-2xl md:text-3xl font-bold mb-10"> */}
        {/* <h2 className="text-lg sm:text-2xl md:text-3xl mb-4 md:mb-8 font-bold text-black">
          What's Bothering You ?
        </h2> */}
        <h1 className="text-lg sm:text-2xl md:text-3xl mb-2 md:mb-3 text-black">
          <span className="font-semibold"> What&apos;s </span>
          <span className="font-bold text-[#F97316]">Bothering You?</span>
        </h1>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-6">
          {/* RENT CARD */}
          <button
            type="button"
            onClick={() => {
              if (!locationSourceFlags.rentEnabled) return;
              router.push('/rent');
            }}
            disabled={!locationSourceFlags.rentEnabled}
            className={`text-left border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex flex-col justify-between min-h-[220px] md:min-h-[360px] relative overflow-hidden hover:shadow-md transition-shadow ${
              locationSourceFlags.rentEnabled
                ? 'cursor-pointer'
                : 'cursor-not-allowed'
            }`}
          >
            {!locationSourceFlags.rentEnabled ? (
              <div className="absolute inset-0 z-20 backdrop-blur-sm bg-white/20" />
            ) : null}
            <div>
              <div className="mb-4">
                <p className="text-[10px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block">
                  {lowestRentPrice != null
                    ? `Starts @ ₹${lowestRentPrice.toLocaleString('en-IN')}`
                    : 'Best Price'}
                </p>
              </div>

              <h3 className="text-sm md:text-xl font-semibold mb-2">
                Renting →
              </h3>

              <p className="hidden md:block font-medium text-sm text-gray-600 mb-4">
                Upgrade your lifestyle without the commitment. Free relocation &
                maintenance included.
              </p>

              <ul className="text-sm font-medium text-gray-700 space-y-0">
                {loading ? (
                  <li className="text-gray-500">Loading...</li>
                ) : categories.length === 0 ? (
                  <li className="text-gray-500">No categories.</li>
                ) : (
                  categories.slice(0, 10).map((c) => (
                    <li
                      key={c._id || c.slug || c.name}
                      className="text-[10px] sm:text-xs md:text-sm truncate"
                    >
                      {c.name}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <img
              src={rentImg.src}
              alt="rent"
              className="absolute bottom-0 right-0 w-24 md:w-60 object-contain"
            />
          </button>

          {/* RIGHT SIDE */}
          <div className="grid grid-rows-2 gap-2 sm:gap-3 md:gap-6">
            {/* BUY CARD */}
            <button
              type="button"
              onClick={() => {
                if (!locationSourceFlags.buyEnabled) return;
                router.push('/buy');
              }}
              disabled={!locationSourceFlags.buyEnabled}
              className={`text-left w-full border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex justify-between items-start md:items-center relative overflow-hidden min-h-[105px] md:min-h-0 hover:shadow-md transition-shadow ${
                locationSourceFlags.buyEnabled
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed'
              }`}
            >
              {!locationSourceFlags.buyEnabled ? (
                <div className="absolute inset-0 z-20 backdrop-blur-sm bg-white/20" />
              ) : null}
              <div className="relative z-10 w-1/2 md:w-full pt-2 md:pt-0">
                {/* <div className="mb-2">
                  <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
                    Verified Products
                  </p>
                </div>

                <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
                  Buy New & Used →
                </h3> */}
                <div className="mb-0.5 md:mb-2">
                  <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
                    Verified Products
                  </p>
                </div>

                <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
                  Buy New & Used →
                </h3>

                <p className="hidden font-medium md:block text-sm text-gray-600 mt-2 max-w-[200px]">
                  Shop brand new or certified refurbished items from stores near
                  you
                </p>
              </div>

              <img
                src={buyImg.src}
                alt="buy"
                className="absolute right-0 bottom-0 w-32 sm:top-0 sm:bottom-auto sm:right-0 sm:w-40 md:-right-4 md:w-72 object-contain"
              />
            </button>

            {/* SERVICE CARD */}
            <button
              type="button"
              onClick={() => {
                if (!locationSourceFlags.serviceEnabled) return;
                router.push('/service');
              }}
              disabled={!locationSourceFlags.serviceEnabled}
              className={`text-left w-full border-2 border-[#F97316] bg-[#F4F4F4] rounded-xl p-3 md:p-6 flex justify-between items-start md:items-center relative overflow-hidden min-h-[105px] md:min-h-0 hover:shadow-md transition-shadow ${
                locationSourceFlags.serviceEnabled
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed'
              }`}
            >
              {!locationSourceFlags.serviceEnabled ? (
                <div className="absolute inset-0 z-20 backdrop-blur-sm bg-white/20" />
              ) : null}
              <div className="w-1/2 md:w-full pt-2 md:pt-0">
                {/* <div className="mb-2">
                  <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
                    Arrives in 2Hrs
                  </p>
                </div>

                <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
                  Book Services →
                </h3> */}
                <div className="mb-0.5 md:mb-2">
                  <p className="text-[9px] md:text-xs bg-[#FFFFFF] text-[#DD6800] px-2 py-0.5 md:px-3 md:py-1 rounded-full inline-block whitespace-nowrap">
                    Arrives in 2Hrs
                  </p>
                </div>

                <h3 className="text-[11px] md:text-lg font-semibold leading-tight">
                  Book Services →
                </h3>

                <p className="hidden font-medium md:block text-sm text-gray-600 mt-2 max-w-[200px]">
                  Verified professionals for repairs, cleaning, and installation
                </p>
              </div>

              <img
                src={serviceImg.src}
                alt="service"
                className="absolute -right-2 bottom-0 w-28 md:w-44 object-contain"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BotherSection;
