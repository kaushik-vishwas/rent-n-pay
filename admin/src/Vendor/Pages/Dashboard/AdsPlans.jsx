// 'use client';

// import React from 'react';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import { Rocket, Zap, Star, Target } from 'lucide-react';

// const plans = [
//   {
//     id: 1,
//     title: 'Category Hero',
//     description: "Be the #1 result for 'Sofa' for 24hrs.",
//     price: '299',
//     duration: '24 hours',
//     icon: Target,
//     iconBg: 'bg-indigo-600',
//     border: 'border-blue-200',
//   },
//   {
//     id: 2,
//     title: 'Featured Spotlight',
//     description: "Appear in 'Featured' section for 7 days.",
//     price: '899',
//     duration: '7 days',
//     icon: Star,
//     iconBg: 'bg-orange-500',
//     border: 'border-yellow-300',
//   },
//   {
//     id: 3,
//     title: 'Mega Flash',
//     description: 'Homepage banner + push notification.',
//     price: '1,499',
//     duration: '48 hours',
//     icon: Rocket,
//     iconBg: 'bg-green-500',
//     border: 'border-green-200',
//   },
// ];

// const AdsPlans = () => {
//   // Replace with your actual user state
//   const user = {};

//   return (
//     <div className="flex min-h-screen bg-[#EEF4FA]">
//       {/* Sidebar */}
//       <VendorSidebar />

//       {/* Right Section */}
//       <div className="flex flex-1 flex-col">
//         {/* Top Bar */}
//         <VendorTopBar user={user} />

//         {/* Main Content */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
//           <div className="mx-auto max-w-6xl">
//             {/* Header */}
//             <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-md">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
//                   <Rocket size={22} className="text-white" />
//                 </div>

//                 <div>
//                   <h1 className="text-2xl font-bold text-black">
//                     Growth & Advertising
//                   </h1>

//                   <p className="mt-1 text-sm text-gray-500">
//                     Boost your visibility and get more customers with our
//                     premium plans.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Boosts */}
//             <div className="mt-8">
//               <div className="flex items-center gap-2">
//                 <Zap size={18} className="fill-orange-500 text-orange-500" />

//                 <h2 className="text-xl font-semibold text-black">
//                   Quick Boosts (Pay-Per-Use)
//                 </h2>
//               </div>

//               <p className="mt-2 text-sm text-gray-500">
//                 Instant visibility without monthly commitments
//               </p>

//               {/* Cards */}
//               <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//                 {plans.map((plan) => {
//                   const Icon = plan.icon;

//                   return (
//                     <div
//                       key={plan.id}
//                       className={`rounded-2xl border ${plan.border} bg-white shadow-sm transition-all hover:shadow-md`}
//                     >
//                       <div className="p-5">
//                         <div
//                           className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.iconBg}`}
//                         >
//                           <Icon size={18} className="text-white" />
//                         </div>

//                         <h3 className="mt-5 text-xl font-bold text-black">
//                           {plan.title}
//                         </h3>

//                         <p className="mt-2 text-sm leading-6 text-gray-500">
//                           {plan.description}
//                         </p>

//                         <div className="mt-6 flex items-end gap-2">
//                           <span className="text-3xl font-bold text-black">
//                             ₹ {plan.price}
//                           </span>

//                           <span className="mb-1 text-xs text-gray-500">
//                             {plan.duration}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="px-5 pb-5">
//                         <button className="w-full rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600">
//                           Buy Now
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdsPlans;

'use client';

import React, { useState } from 'react';
import VendorSidebar from '../../Components/Common/VendorSidebar';
import VendorTopBar from '../../Components/Common/VendorTopBar';
import { Rocket, Zap, Star, Target, Sparkle, Sparkles } from 'lucide-react';
import StepOne from './../../Components/Modals/AdsPlan/StepOne';
import StepTwo from './../../Components/Modals/AdsPlan/StepTwo';
import StepThree from './../../Components/Modals/AdsPlan/StepThree';

const plans = [
  {
    id: 1,
    title: 'Category Hero',
    description: "Be the #1 result for 'Sofa' for 24hrs.",
    price: '299',
    duration: '24 hours',
    icon: Target,
    iconBg: 'bg-indigo-600',
    border: 'border-blue-200',
  },
  {
    id: 2,
    title: 'Featured Spotlight',
    description: "Appear in 'Featured' section for 7 days.",
    price: '899',
    duration: '7 days',
    icon: Sparkles,
    iconBg: 'bg-orange-500',
    border: 'border-yellow-300',
  },
  {
    id: 3,
    title: 'Mega Flash',
    description: 'Homepage banner + push notification.',
    price: '1,499',
    duration: '48 hours',
    icon: Rocket,
    iconBg: 'bg-green-500',
    border: 'border-green-200',
  },
];

const AdsPlans = () => {
  // Replace with your actual user state
  const user = {};

  // which step-modal is currently open: null | 1 | 2 | 3
  const [activeStep, setActiveStep] = useState(null);

  // data collected across the flow
  const [chosenProducts, setChosenProducts] = useState([]);
  const [schedules, setSchedules] = useState({});

  const handleBuyNow = (plan) => {
    if (plan.id === 1) {
      // Category Hero -> open Step 1
      setActiveStep(1);
    } else {
      // TODO: hook up the other plans' own flows
    }
  };

  const closeAll = () => {
    setActiveStep(null);
    setChosenProducts([]);
    setSchedules({});
  };

  return (
    <div className="flex h-screen bg-[#EEF4FA] overflow-hidden">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Right Section */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <VendorTopBar user={user} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-4 pt-1 md:px-5 md:pb-5 md:pt-1 lg:px-6 lg:pb-6 lg:pt-2">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            {/* <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
                  <Rocket size={22} className="text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-black">
                    Growth & Advertising
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Boost your visibility and get more customers with our
                    premium plans.
                  </p>
                </div>
              </div>
            </div> */}

            {/* Quick Boosts */}
            <div className="mt-2">
              {/* <div className="flex items-center gap-2">
                <Zap size={18} className=" text-orange-500" />

                <h2 className="text-xl font-semibold text-black">
                  Quick Boosts (Pay-Per-Use)
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Instant visibility without monthly commitments
              </p> */}

              {/* Cards */}
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => {
                  const Icon = plan.icon;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl border ${plan.border} bg-white shadow-sm transition-all hover:shadow-md`}
                    >
                      <div className="p-5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.iconBg}`}
                        >
                          <Icon size={18} className="text-white" />
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-black">
                          {plan.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {plan.description}
                        </p>

                        <div className="mt-6 flex items-end gap-2">
                          <span className="text-3xl font-bold text-black">
                            ₹{plan.price}
                          </span>

                          <span className="mb-1 text-sm font-semibold text-gray-600">
                            {plan.duration}
                          </span>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <button
                          onClick={() => handleBuyNow(plan)}
                          className="w-full rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ---- Category Hero Boost flow: Step 1 -> Step 2 -> Step 3 ---- */}

      {/* <StepOne
        open={activeStep === 1}
        onClose={closeAll}
        onNext={(products) => {
          setChosenProducts(products);
          setActiveStep(2);
        }}
      /> */}
      <StepOne
        open={activeStep === 1}
        onClose={closeAll}
        onNext={(products) => {
          setChosenProducts(products);
          setActiveStep(2);
        }}
        initialSelected={chosenProducts}
      />

      <StepTwo
        open={activeStep === 2}
        products={chosenProducts}
        onBack={() => setActiveStep(1)}
        onClose={closeAll}
        onNext={(scheduleData) => {
          setSchedules(scheduleData);
          setActiveStep(3);
        }}
      />

      <StepThree
        open={activeStep === 3}
        products={chosenProducts}
        schedules={schedules}
        onBack={() => setActiveStep(2)}
        onClose={closeAll}
        onConfirm={({ total, method }) => {
          console.log('Boost order confirmed:', {
            products: chosenProducts,
            schedules,
            total,
            method,
          });
          // TODO: call your API to persist the boost order
          closeAll();
        }}
      />
    </div>
  );
};

export default AdsPlans;
