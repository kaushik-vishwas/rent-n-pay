// import React from 'react';
// import { Search, Calendar, Package, Wrench } from 'lucide-react';

// const WorkFlow = () => {
//   const steps = [
//     {
//       icon: Search,
//       title: 'Select Your Gear',
//       desc: 'Browse and pick products',
//     },
//     {
//       icon: Calendar,
//       title: 'Choose Your Tenure',
//       desc: 'Pick monthly or daily',
//     },
//     {
//       icon: Package,
//       title: 'Fast Doorstep Setup',
//       desc: 'Delivery in 1-3 days',
//     },
//     {
//       icon: Wrench,
//       title: 'Enjoy Ongoing Support',
//       desc: 'Included maintenance and reminders',
//     },
//   ];

//   return (
//     <section className="pt-4 md:pt-6 pb-4 md:pb-6 overflow-hidden">
//       <div className=" mx-auto px-4">
//         {/* Title */}
//         <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-center mb-6 sm:mb-14">
//           How Do <span className="text-[#F97316]">RentNPay</span> Work
//         </h2>

//         {/* Steps */}
//         <div className="grid grid-cols-4 gap-x-1.5 sm:gap-x-4 gap-y-4 md:gap-6 relative">
//           {steps.map((step, index) => {
//             const Icon = step.icon;

//             return (
//               <div
//                 key={index}
//                 className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1"
//               >
//                 {/* Dashed Line */}
//                 {/* Curved Dashed Line */}
//                 {index !== steps.length - 1 && (
//                   <div className="block absolute top-[10px] sm:top-9 md:top-14 left-[58%] sm:left-[62%] md:left-[63%] w-full z-0">
//                     <svg
//                       width="100%"
//                       height="20"
//                       viewBox="0 0 260 20"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         d="M0 10
//            C35 20, 65 20, 95 10
//            S155 0, 185 10
//            S225 20, 260 10"
//                         stroke="#111111"
//                         strokeWidth="2"
//                         strokeDasharray="6 6"
//                         strokeLinecap="round"
//                         fill="none"
//                         className="transition-all duration-500 group-hover:stroke-[#F97316]"
//                       />
//                     </svg>
//                   </div>
//                 )}

//                 {/* Icon Circle */}
//                 <div className="relative z-10 w-11 h-11 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-[#F5F5F5] mb-2 sm:mb-5 transition-all duration-300 ease-out group-hover:bg-orange-100 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-100 cursor-pointer">
//                   <Icon
//                     size={16}
//                     strokeWidth={1.8}
//                     className="text-[#F97316] sm:hidden transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
//                   />
//                   <Icon
//                     size={40}
//                     strokeWidth={1.8}
//                     className="text-[#F97316] hidden sm:block transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
//                   />
//                 </div>

//                 {/* Title */}
//                 <h3 className="font-bold text-[10px] sm:text-base md:text-base mb-1 sm:mb-2 leading-tight transition-colors duration-300 group-hover:text-orange-500">
//                   {step.title}
//                 </h3>

//                 {/* Description */}
//                 <p className="text-[9px] sm:text-sm md:text-sm text-gray-600 max-w-[80px] sm:max-w-[180px] leading-snug sm:leading-relaxed">
//                   {step.desc}
//                 </p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default WorkFlow;

import React from 'react';
import { Search, Calendar, Package, Wrench } from 'lucide-react';

const WorkFlow = () => {
  const steps = [
    {
      icon: Search,
      title: 'Select Your Gear',
      desc: 'Browse and pick products',
    },
    {
      icon: Calendar,
      title: 'Choose Your Tenure',
      desc: 'Pick monthly or daily',
    },
    {
      icon: Package,
      title: 'Fast Doorstep Setup',
      desc: 'Delivery in 1-3 days',
    },
    {
      icon: Wrench,
      title: 'Enjoy Ongoing Support',
      desc: 'Included maintenance and reminders',
    },
  ];

  return (
    <section className="pt-3 md:pt-6 pb-2 md:pb-6 overflow-hidden">
      <div className=" mx-auto px-4">
        {/* Title */}
        {/* <h1 className="text-lg sm:text-2xl md:text-4xl font-semibold text-center mb-2 sm:mb-3">
          How Do <span className="text-[#F97316]">RentNPay</span> Work
        </h1> */}
        <h1 className="text-lg sm:text-2xl md:text-4xl text-center mb-2 sm:mb-3">
          <span className="font-semibold">How Do </span>
          <span className="font-bold text-[#F97316]">Rentnpay</span>
          <span className="font-semibold"> Work</span>
        </h1>

        {/* Steps */}
        <div className="grid grid-cols-4 gap-x-1.5 sm:gap-x-4 gap-y-4 md:gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="group relative flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Dashed Line */}
                {/* Curved Dashed Line */}
                {index !== steps.length - 1 && (
                  <div className="block absolute top-[10px] sm:top-9 md:top-14 left-[58%] sm:left-[62%] md:left-[63%] w-full z-0">
                    <svg
                      width="100%"
                      height="20"
                      viewBox="0 0 260 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 10 
           C35 20, 65 20, 95 10
           S155 0, 185 10
           S225 20, 260 10"
                        stroke="#111111"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-500 group-hover:stroke-[#F97316]"
                      />
                    </svg>
                  </div>
                )}

                {/* Icon Circle */}
                <div className="relative z-10 w-11 h-11 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-[#F5F5F5] mb-2 sm:mb-5 transition-all duration-300 ease-out group-hover:bg-orange-100 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-100 cursor-pointer">
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    className="text-[#F97316] sm:hidden transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  />
                  <Icon
                    size={40}
                    strokeWidth={1.8}
                    className="text-[#F97316] hidden sm:block transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  />
                </div>

                {/* Title */}
                <h3 className="font-bold text-[10px] sm:text-base md:text-base mb-1 sm:mb-2 leading-tight transition-colors duration-300 group-hover:text-orange-500">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[9px] sm:text-sm md:text-sm text-gray-600 max-w-[80px] sm:max-w-[180px] leading-snug sm:leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkFlow;
