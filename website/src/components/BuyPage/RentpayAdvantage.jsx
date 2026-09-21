// import React from 'react';
// import buyBrandNew from '@/assets/icons/buyBrandNew.png';
// import buyUsed from '@/assets/icons/buyUsed.png';

// const RentpayAdvantage = () => {
//   return (
//     <section className="w-full bg-[#F7F7F8] py-10 sm:py-16 px-3 sm:px-4">
//       <div className=" mx-auto">
//         {/* Heading */}
//         <div className="mb-6 sm:mb-8">
//           <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black">
//             The Rentnpay Advantage
//           </h2>
//           <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500 max-w-xl">
//             Why we are the smartest way to shop, rent, and book in your city
//           </p>
//         </div>

//         {/* White card with two columns */}
//         <div className="bg-white rounded-md sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16">
//             {/* Left column */}
//             <div className="min-w-0">
//               <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
//                 <div className="">
//                   <img
//                     src={buyBrandNew.src}
//                     alt="Brand New"
//                     className="w-11 h-11 s object-contain"
//                   />
//                 </div>

//                 <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black">
//                   Brand New (Retail Style)
//                 </h3>
//               </div>

//               <div className="space-y-2 sm:space-y-3">
//                 {[
//                   'Premium (Standard MRP)',
//                   'Brand Warranty',
//                   'Unopened Box',
//                   'Eligible for Annual Plans',
//                 ].map((item) => (
//                   <div
//                     key={item}
//                     className="w-full rounded-full bg-[#F7F7F8] px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-black text-center"
//                   >
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Right column */}
//             <div className="min-w-0">
//               <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
//                 <div className=" ">
//                   <img
//                     src={buyUsed.src}
//                     alt="Used"
//                     className="w-11 h-11  object-contain"
//                   />
//                 </div>

//                 <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black">
//                   Buying Used (Certified)
//                 </h3>
//               </div>

//               <div className="space-y-2 sm:space-y-3">
//                 {[
//                   'Up to 60% Savings',
//                   'Rentnpay Care (Optional)',
//                   'Verified Multi-Point Check',
//                   '1 Free Service Included',
//                 ].map((item) => (
//                   <div
//                     key={item}
//                     className="w-full rounded-full bg-[#F7F7F8] px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-black text-center"
//                   >
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RentpayAdvantage;

import React from 'react';
import buyBrandNew from '@/assets/icons/buyBrandNew.png';
import buyUsed from '@/assets/icons/buyUsed.png';

const RentpayAdvantage = () => {
  const brandNewItems = [
    'Premium (Standard MRP)',
    'Brand Warranty',
    'Unopened Box',
    'Eligible for Annual Plans',
  ];

  const usedItems = [
    'Up to 60% Savings',
    'Rentnpay Care (Optional)',
    'Verified Multi-Point Check',
    '1 Free Service Included',
  ];

  return (
    <section className="w-full pt-3 md:pt-6 pb-4 md:pb-6 px-3 sm:px-4">
      <div className="mx-auto">
        {/* Heading */}
        <div className="mb-2 md:mb-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl text-black">
            <span className="font-semibold">The Rentnpay </span>
            <span className="font-bold text-[#F97316]">Advantage</span>
          </h1>
          {/* <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-500 max-w-xl">
            Why we are the smartest way to shop, rent, and book in your city
          </p> */}
        </div>

        {/* White card with two columns */}
        <div className="bg-white rounded-md sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 transition-shadow duration-300 hover:shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16">
            {/* Left column */}
            <div className="min-w-0 group">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="rounded-full p-1.5 transition-colors duration-300 group-hover:bg-[#FFF3EA]">
                  {/* <img
                    src={buyBrandNew.src}
                    alt="Brand New"
                    className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  /> */}
                  <img
                    src={buyBrandNew.src}
                    alt="Brand New"
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  />
                </div>

                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black">
                  Brand New (Retail Style)
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {brandNewItems.map((item) => (
                  <div
                    key={item}
                    className="w-full rounded-full bg-[#F7F7F8] px-3 sm:px-5 py-1.5 sm:py-2 text-xs font-semibold sm:text-sm text-black text-center
                      transition-all duration-200 ease-out cursor-default
                      hover:bg-[#FFF3EA] hover:text-[#DD6800] hover:shadow-sm hover:-translate-y-0.5
                      active:scale-95 active:bg-[#FFE8D4]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="min-w-0 group">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="rounded-full p-1.5 transition-colors duration-300 group-hover:bg-[#FFF3EA]">
                  {/* <img
                    src={buyUsed.src}
                    alt="Used"
                    className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  /> */}
                  <img
                    src={buyUsed.src}
                    alt="Used"
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  />
                </div>

                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black">
                  Buying Used (Certified)
                </h3>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {usedItems.map((item) => (
                  <div
                    key={item}
                    className="w-full rounded-full bg-[#F7F7F8] font-semibold px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-black text-center
                      transition-all duration-200 ease-out cursor-default
                      hover:bg-[#FFF3EA] hover:text-[#DD6800] hover:shadow-sm hover:-translate-y-0.5
                      active:scale-95 active:bg-[#FFE8D4]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentpayAdvantage;
