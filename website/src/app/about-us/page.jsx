// // 'use client';

// // import {
// //   Armchair,
// //   WashingMachine,
// //   Lamp,
// //   Sofa,
// //   Refrigerator,
// //   Bed,
// //   Tv,
// //   Microwave,
// //   AirVent,
// //   Fan,
// //   Table2,
// //   Bath,
// //   Laptop,
// //   Monitor,
// //   Speaker,
// //   DoorOpen,
// //   Package,
// //   Car,
// //   Bike,
// //   Dumbbell,
// // } from 'lucide-react';

// // const stats = [
// //   { value: '25K+', label: 'Renters onboarded' },
// //   { value: '4.8K', label: 'Homes & spaces listed' },
// //   { value: '18', label: 'Cities served' },
// //   { value: '4.7/5', label: 'Average tenant rating' },
// // ];

// // const values = [
// //   {
// //     title: 'Renting, simplified',
// //     desc: 'From search to signed agreement to monthly pay-in, everything lives in one place — no scattered calls, no paper trail.',
// //   },
// //   {
// //     title: 'Payments that just land',
// //     desc: 'Rent, deposits and service charges move on schedule, with reminders and receipts handled automatically for both sides.',
// //   },
// //   {
// //     title: 'People behind the platform',
// //     desc: 'A support team that actually picks up — for landlords chasing a payment and tenants chasing a repair, alike.',
// //   },
// // ];

// // const heroIcons = [
// //   {
// //     Icon: Sofa,
// //     top: '2%',
// //     left: '3%',
// //     size: 'w-16 h-16 md:w-24 md:h-24',
// //     rotate: '-8deg',
// //     delay: '0s',
// //     duration: '5s',
// //   },
// //   {
// //     Icon: Armchair,
// //     top: '55%',
// //     left: '9%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '6deg',
// //     delay: '0.4s',
// //     duration: '6s',
// //   },
// //   {
// //     Icon: Bed,
// //     top: '10%',
// //     left: '15%',
// //     size: 'w-14 h-14 md:w-20 md:h-20',
// //     rotate: '4deg',
// //     delay: '0.8s',
// //     duration: '5.5s',
// //   },
// //   {
// //     Icon: WashingMachine,
// //     top: '60%',
// //     left: '20%',
// //     size: 'w-14 h-14 md:w-20 md:h-20',
// //     rotate: '10deg',
// //     delay: '1.2s',
// //     duration: '6.5s',
// //   },
// //   {
// //     Icon: Refrigerator,
// //     top: '5%',
// //     left: '28%',
// //     size: 'w-14 h-14 md:w-20 md:h-20',
// //     rotate: '-6deg',
// //     delay: '0.2s',
// //     duration: '5s',
// //   },
// //   {
// //     Icon: Lamp,
// //     top: '65%',
// //     left: '33%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '-10deg',
// //     delay: '1.6s',
// //     duration: '6s',
// //   },
// //   {
// //     Icon: Tv,
// //     top: '15%',
// //     left: '40%',
// //     size: 'w-14 h-14 md:w-20 md:h-20',
// //     rotate: '5deg',
// //     delay: '0.6s',
// //     duration: '5.5s',
// //   },
// //   {
// //     Icon: Microwave,
// //     top: '58%',
// //     left: '46%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '-4deg',
// //     delay: '1s',
// //     duration: '6.5s',
// //   },
// //   {
// //     Icon: AirVent,
// //     top: '3%',
// //     left: '52%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '8deg',
// //     delay: '0.3s',
// //     duration: '5s',
// //   },
// //   {
// //     Icon: Fan,
// //     top: '62%',
// //     left: '58%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '-8deg',
// //     delay: '1.4s',
// //     duration: '6s',
// //   },
// //   {
// //     Icon: Table2,
// //     top: '8%',
// //     left: '63%',
// //     size: 'w-14 h-14 md:w-20 md:h-20',
// //     rotate: '6deg',
// //     delay: '0.7s',
// //     duration: '5.5s',
// //   },
// //   {
// //     Icon: Bath,
// //     top: '55%',
// //     left: '68%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '-5deg',
// //     delay: '1.8s',
// //     duration: '6.5s',
// //   },
// //   {
// //     Icon: Laptop,
// //     top: '12%',
// //     left: '73%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '4deg',
// //     delay: '0.5s',
// //     duration: '5s',
// //   },
// //   {
// //     Icon: Monitor,
// //     top: '60%',
// //     left: '78%',
// //     size: 'w-14 h-14 md:w-20 md:h-20',
// //     rotate: '-6deg',
// //     delay: '1.1s',
// //     duration: '6s',
// //   },
// //   {
// //     Icon: Speaker,
// //     top: '5%',
// //     left: '83%',
// //     size: 'w-10 h-10 md:w-14 md:h-14',
// //     rotate: '10deg',
// //     delay: '0.9s',
// //     duration: '5.5s',
// //   },
// //   {
// //     Icon: DoorOpen,
// //     top: '58%',
// //     left: '88%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '-8deg',
// //     delay: '1.3s',
// //     duration: '6.5s',
// //   },
// //   {
// //     Icon: Package,
// //     top: '15%',
// //     left: '92%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '6deg',
// //     delay: '0.1s',
// //     duration: '5s',
// //   },
// //   {
// //     Icon: Car,
// //     top: '75%',
// //     left: '2%',
// //     size: 'w-14 h-14 md:w-20 md:h-20',
// //     rotate: '-4deg',
// //     delay: '1.7s',
// //     duration: '6s',
// //   },
// //   {
// //     Icon: Bike,
// //     top: '80%',
// //     left: '44%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '8deg',
// //     delay: '0.5s',
// //     duration: '5.5s',
// //   },
// //   {
// //     Icon: Dumbbell,
// //     top: '78%',
// //     left: '80%',
// //     size: 'w-12 h-12 md:w-16 md:h-16',
// //     rotate: '-6deg',
// //     delay: '1.5s',
// //     duration: '6.5s',
// //   },
// // ];

// // const AboutUs = () => {
// //   return (
// //     <main className="w-full bg-white">
// //       {/* Hero */}
// //       <section
// //         className="relative w-full py-10 md:py-14 px-4 overflow-hidden"
// //         style={{ backgroundColor: 'rgba(249,115,22,0.85)' }}
// //       >
// //         {/* Faint background product icons */}
// //         <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
// //           {heroIcons.map(
// //             ({ Icon, top, left, size, rotate, delay, duration }, i) => (
// //               <Icon
// //                 key={i}
// //                 className={`absolute ${size} text-white animate-[floatIcon_ease-in-out_infinite]`}
// //                 style={{
// //                   top,
// //                   left,
// //                   '--rotate': rotate,
// //                   animationDelay: delay,
// //                   animationDuration: duration,
// //                 }}
// //                 strokeWidth={1.25}
// //               />
// //             ),
// //           )}
// //         </div>

// //         <style jsx>{`
// //           @keyframes floatIcon {
// //             0% {
// //               transform: rotate(var(--rotate)) translateY(0px);
// //             }
// //             50% {
// //               transform: rotate(var(--rotate)) translateY(-10px);
// //             }
// //             100% {
// //               transform: rotate(var(--rotate)) translateY(0px);
// //             }
// //           }
// //         `}</style>

// //         <div className="relative z-10 max-w-6xl mx-auto text-center">
// //           <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
// //             About Us
// //           </h1>
// //         </div>
// //       </section>

// //       {/* The Brand */}
// //       <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
// //         <h2 className="text-2xl md:text-3xl font-bold text-black">The Brand</h2>
// //         <div
// //           className="w-14 h-1 mt-3 mb-6"
// //           style={{ backgroundColor: '#F97316' }}
// //         />

// //         <p className="text-sm md:text-base text-gray-700 leading-relaxed">
// //           Hi!{' '}
// //           <span className="font-semibold text-black">We&apos;re Rentnpay,</span>{' '}
// //           one platform for everything to do with a home — rent it, buy it, or
// //           get it serviced, all without switching apps or chasing people down.
// //         </p>

// //         <p className="mt-5 text-sm md:text-base text-gray-700 leading-relaxed">
// //           Looking to <span className="font-semibold text-black">rent</span>?
// //           Browse verified listings, sign the agreement online, and pay every
// //           month from the same dashboard — no scattered calls, no paper trail.
// //           Ready to <span className="font-semibold text-black">buy</span>{' '}
// //           instead? We help you go from shortlisting a home to closing the deal,
// //           with transparent pricing and support at every step. And once
// //           you&apos;re in, our{' '}
// //           <span className="font-semibold text-black">services</span> marketplace
// //           covers everything from repairs and cleaning to move-in setup — booked
// //           in a few taps, handled by verified professionals.
// //         </p>

// //         <p className="mt-5 text-sm md:text-base text-gray-700 leading-relaxed">
// //           Whether you&apos;re a tenant, a buyer, a landlord, or a service
// //           partner, Rentnpay brings listings, payments and support into one place
// //           — across multiple cities in India.
// //         </p>
// //       </section>

// //       {/* Values */}
// //       {/* <section className="bg-[#FFF8F1] py-14 md:py-20">
// //         <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
// //           {values.map((v) => (
// //             <div
// //               key={v.title}
// //               className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-orange-100"
// //             >
// //               <h3 className="text-lg md:text-xl font-semibold text-black mb-3">
// //                 {v.title}
// //               </h3>
// //               <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
// //             </div>
// //           ))}
// //         </div>
// //       </section> */}
// //     </main>
// //   );
// // };

// // export default AboutUs;

// 'use client';

// import {
//   Armchair,
//   WashingMachine,
//   Lamp,
//   Sofa,
//   Refrigerator,
//   Bed,
//   Tv,
//   Microwave,
//   AirVent,
//   Fan,
//   Table2,
//   Bath,
//   Laptop,
//   Monitor,
//   Speaker,
//   DoorOpen,
//   Package,
//   Car,
//   Bike,
//   Dumbbell,
// } from 'lucide-react';

// const stats = [
//   { value: '25K+', label: 'Renters onboarded' },
//   { value: '4.8K', label: 'Homes & spaces listed' },
//   { value: '18', label: 'Cities served' },
//   { value: '4.7/5', label: 'Average tenant rating' },
// ];

// const values = [
//   {
//     title: 'Renting, simplified',
//     desc: 'From search to signed agreement to monthly pay-in, everything lives in one place — no scattered calls, no paper trail.',
//   },
//   {
//     title: 'Payments that just land',
//     desc: 'Rent, deposits and service charges move on schedule, with reminders and receipts handled automatically for both sides.',
//   },
//   {
//     title: 'People behind the platform',
//     desc: 'A support team that actually picks up — for landlords chasing a payment and tenants chasing a repair, alike.',
//   },
// ];

// const heroIcons = [
//   {
//     Icon: Sofa,
//     top: '2%',
//     left: '3%',
//     size: 'w-16 h-16 md:w-24 md:h-24',
//     rotate: '-8deg',
//     delay: '0s',
//     duration: '5s',
//   },
//   {
//     Icon: Armchair,
//     top: '55%',
//     left: '9%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '6deg',
//     delay: '0.4s',
//     duration: '6s',
//   },
//   {
//     Icon: Bed,
//     top: '10%',
//     left: '15%',
//     size: 'w-14 h-14 md:w-20 md:h-20',
//     rotate: '4deg',
//     delay: '0.8s',
//     duration: '5.5s',
//   },
//   {
//     Icon: WashingMachine,
//     top: '60%',
//     left: '20%',
//     size: 'w-14 h-14 md:w-20 md:h-20',
//     rotate: '10deg',
//     delay: '1.2s',
//     duration: '6.5s',
//   },
//   {
//     Icon: Refrigerator,
//     top: '5%',
//     left: '28%',
//     size: 'w-14 h-14 md:w-20 md:h-20',
//     rotate: '-6deg',
//     delay: '0.2s',
//     duration: '5s',
//   },
//   {
//     Icon: Lamp,
//     top: '65%',
//     left: '33%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '-10deg',
//     delay: '1.6s',
//     duration: '6s',
//   },
//   {
//     Icon: Tv,
//     top: '15%',
//     left: '40%',
//     size: 'w-14 h-14 md:w-20 md:h-20',
//     rotate: '5deg',
//     delay: '0.6s',
//     duration: '5.5s',
//   },
//   {
//     Icon: Microwave,
//     top: '58%',
//     left: '46%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '-4deg',
//     delay: '1s',
//     duration: '6.5s',
//   },
//   {
//     Icon: AirVent,
//     top: '3%',
//     left: '52%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '8deg',
//     delay: '0.3s',
//     duration: '5s',
//   },
//   {
//     Icon: Fan,
//     top: '62%',
//     left: '58%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '-8deg',
//     delay: '1.4s',
//     duration: '6s',
//   },
//   {
//     Icon: Table2,
//     top: '8%',
//     left: '63%',
//     size: 'w-14 h-14 md:w-20 md:h-20',
//     rotate: '6deg',
//     delay: '0.7s',
//     duration: '5.5s',
//   },
//   {
//     Icon: Bath,
//     top: '55%',
//     left: '68%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '-5deg',
//     delay: '1.8s',
//     duration: '6.5s',
//   },
//   {
//     Icon: Laptop,
//     top: '12%',
//     left: '73%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '4deg',
//     delay: '0.5s',
//     duration: '5s',
//   },
//   {
//     Icon: Monitor,
//     top: '60%',
//     left: '78%',
//     size: 'w-14 h-14 md:w-20 md:h-20',
//     rotate: '-6deg',
//     delay: '1.1s',
//     duration: '6s',
//   },
//   {
//     Icon: Speaker,
//     top: '5%',
//     left: '83%',
//     size: 'w-10 h-10 md:w-14 md:h-14',
//     rotate: '10deg',
//     delay: '0.9s',
//     duration: '5.5s',
//   },
//   {
//     Icon: DoorOpen,
//     top: '58%',
//     left: '88%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '-8deg',
//     delay: '1.3s',
//     duration: '6.5s',
//   },
//   {
//     Icon: Package,
//     top: '15%',
//     left: '92%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '6deg',
//     delay: '0.1s',
//     duration: '5s',
//   },
//   {
//     Icon: Car,
//     top: '75%',
//     left: '2%',
//     size: 'w-14 h-14 md:w-20 md:h-20',
//     rotate: '-4deg',
//     delay: '1.7s',
//     duration: '6s',
//   },
//   {
//     Icon: Bike,
//     top: '80%',
//     left: '44%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '8deg',
//     delay: '0.5s',
//     duration: '5.5s',
//   },
//   {
//     Icon: Dumbbell,
//     top: '78%',
//     left: '80%',
//     size: 'w-12 h-12 md:w-16 md:h-16',
//     rotate: '-6deg',
//     delay: '1.5s',
//     duration: '6.5s',
//   },
// ];

// const AboutUs = () => {
//   return (
//     <main className="w-full bg-white">
//       {/* Hero */}
//       <section
//         className="relative w-full py-10 md:py-14 px-4 overflow-hidden"
//         style={{ backgroundColor: 'rgba(249,115,22,0.85)' }}
//       >
//         {/* Faint background product icons */}
//         <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
//           {heroIcons.map(
//             ({ Icon, top, left, size, rotate, delay, duration }, i) => (
//               <Icon
//                 key={i}
//                 className={`absolute ${size} text-white animate-[floatIcon_ease-in-out_infinite]`}
//                 style={{
//                   top,
//                   left,
//                   '--rotate': rotate,
//                   animationDelay: delay,
//                   animationDuration: duration,
//                 }}
//                 strokeWidth={1.25}
//               />
//             ),
//           )}
//         </div>

//         <style jsx>{`
//           @keyframes floatIcon {
//             0% {
//               transform: rotate(var(--rotate)) translateY(0px);
//             }
//             50% {
//               transform: rotate(var(--rotate)) translateY(-10px);
//             }
//             100% {
//               transform: rotate(var(--rotate)) translateY(0px);
//             }
//           }
//         `}</style>

//         <div className="relative z-10 max-w-6xl mx-auto text-center">
//           <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
//             About Us
//           </h1>
//         </div>
//       </section>

//       {/* The Brand */}
//       <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
//         <h2 className="text-2xl md:text-3xl font-bold text-black">The Brand</h2>
//         <div
//           className="w-14 h-1 mt-3 mb-6"
//           style={{ backgroundColor: '#F97316' }}
//         />

//         <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//           Hi!{' '}
//           <span className="font-semibold text-black">We&apos;re Rentnpay,</span>{' '}
//           one platform for everything to do with a home — rent it, buy it, or
//           get it serviced, all without switching apps or chasing people down.
//         </p>

//         <p className="mt-5 text-sm md:text-base text-gray-700 leading-relaxed">
//           Looking to <span className="font-semibold text-black">rent</span>?
//           Browse verified listings, sign the agreement online, and pay every
//           month from the same dashboard — no scattered calls, no paper trail.
//           Ready to <span className="font-semibold text-black">buy</span>{' '}
//           instead? We help you go from shortlisting a home to closing the deal,
//           with transparent pricing and support at every step. And once
//           you&apos;re in, our{' '}
//           <span className="font-semibold text-black">services</span> marketplace
//           covers everything from repairs and cleaning to move-in setup — booked
//           in a few taps, handled by verified professionals.
//         </p>

//         <p className="mt-5 text-sm md:text-base text-gray-700 leading-relaxed">
//           Whether you&apos;re a tenant, a buyer, a landlord, or a service
//           partner, Rentnpay brings listings, payments and support into one place
//           — across multiple cities in India.
//         </p>
//       </section>

//       {/* Values */}
//       {/* <section className="bg-[#FFF8F1] py-14 md:py-20">
//         <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
//           {values.map((v) => (
//             <div
//               key={v.title}
//               className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-orange-100"
//             >
//               <h3 className="text-lg md:text-xl font-semibold text-black mb-3">
//                 {v.title}
//               </h3>
//               <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section> */}
//     </main>
//   );
// };

// export default AboutUs;

'use client';

import {
  Armchair,
  WashingMachine,
  Lamp,
  Sofa,
  Refrigerator,
  Bed,
  Tv,
  Microwave,
  AirVent,
  Fan,
  Table2,
  Bath,
  Laptop,
  Monitor,
  Speaker,
  DoorOpen,
  Package,
  Car,
  Bike,
  Dumbbell,
} from 'lucide-react';

const heroIcons = [
  {
    Icon: Sofa,
    top: '2%',
    left: '3%',
    size: 'w-16 h-16 md:w-24 md:h-24',
    rotate: '-8deg',
    delay: '0s',
    duration: '5s',
  },
  {
    Icon: Armchair,
    top: '55%',
    left: '9%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '6deg',
    delay: '0.4s',
    duration: '6s',
  },
  {
    Icon: Bed,
    top: '10%',
    left: '15%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '4deg',
    delay: '0.8s',
    duration: '5.5s',
  },
  {
    Icon: WashingMachine,
    top: '60%',
    left: '20%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '10deg',
    delay: '1.2s',
    duration: '6.5s',
  },
  {
    Icon: Refrigerator,
    top: '5%',
    left: '28%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '-6deg',
    delay: '0.2s',
    duration: '5s',
  },
  {
    Icon: Lamp,
    top: '65%',
    left: '33%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-10deg',
    delay: '1.6s',
    duration: '6s',
  },
  {
    Icon: Tv,
    top: '15%',
    left: '40%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '5deg',
    delay: '0.6s',
    duration: '5.5s',
  },
  {
    Icon: Microwave,
    top: '58%',
    left: '46%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-4deg',
    delay: '1s',
    duration: '6.5s',
  },
  {
    Icon: AirVent,
    top: '3%',
    left: '52%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '8deg',
    delay: '0.3s',
    duration: '5s',
  },
  {
    Icon: Fan,
    top: '62%',
    left: '58%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-8deg',
    delay: '1.4s',
    duration: '6s',
  },
  {
    Icon: Table2,
    top: '8%',
    left: '63%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '6deg',
    delay: '0.7s',
    duration: '5.5s',
  },
  {
    Icon: Bath,
    top: '55%',
    left: '68%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-5deg',
    delay: '1.8s',
    duration: '6.5s',
  },
  {
    Icon: Laptop,
    top: '12%',
    left: '73%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '4deg',
    delay: '0.5s',
    duration: '5s',
  },
  {
    Icon: Monitor,
    top: '60%',
    left: '78%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '-6deg',
    delay: '1.1s',
    duration: '6s',
  },
  {
    Icon: Speaker,
    top: '5%',
    left: '83%',
    size: 'w-10 h-10 md:w-14 md:h-14',
    rotate: '10deg',
    delay: '0.9s',
    duration: '5.5s',
  },
  {
    Icon: DoorOpen,
    top: '58%',
    left: '88%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-8deg',
    delay: '1.3s',
    duration: '6.5s',
  },
  {
    Icon: Package,
    top: '15%',
    left: '92%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '6deg',
    delay: '0.1s',
    duration: '5s',
  },
  {
    Icon: Car,
    top: '75%',
    left: '2%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '-4deg',
    delay: '1.7s',
    duration: '6s',
  },
  {
    Icon: Bike,
    top: '80%',
    left: '44%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '8deg',
    delay: '0.5s',
    duration: '5.5s',
  },
  {
    Icon: Dumbbell,
    top: '78%',
    left: '80%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-6deg',
    delay: '1.5s',
    duration: '6.5s',
  },
];

const sections = [
  {
    title: '1. Freedom of Choice',
    body: `Experience Residential, Office, and Event solutions on a single platform. Choose from thousands of products and decide whether to Rent, Subscribe, or Buy—whatever works best for you.`,
  },
  {
    title: '2. Freedom of Access',
    body: `Access premium furniture, appliances, office essentials, and event equipment without the burden of ownership. Pay only for what you need, when you need it.`,
  },
  {
    title: '3. Freedom to Scale',
    body: `Life changes, and your requirements change with it. Easily add, upgrade, exchange, or return products as your needs evolve.`,
  },
  {
    title: '4. Freedom of Flexibility',
    body: `Choose plans that match your lifestyle. Whether you need something for a few days, a few months, or longer, we offer flexible options that adapt to you.`,
  },
  {
    title: '5. Freedom of Convenience',
    body: `From product selection and doorstep delivery to installation, maintenance, and pickup, we manage the entire experience so you can focus on what matters most.`,
  },
  {
    title: '6. Freedom of Value',
    body: `Enjoy high-quality, trusted products at affordable prices without making large upfront investments. Get more value while spending less.`,
  },
  {
    title: '7. Our Promise',
    body: `At Rentnpay, we're redefining how people access the things they need. By bringing together Residential, Office, and Event solutions on one platform, we make modern living simpler, smarter, and more flexible.`,
    highlight: 'Rent. Subscribe. Buy. One Platform. Endless Possibilities.',
  },
];

const AboutUs = () => {
  return (
    <main className="w-full bg-white">
      {/* Hero */}
      <section
        className="relative w-full py-10 md:py-14 px-4 overflow-hidden"
        style={{ backgroundColor: 'rgba(249,115,22,0.85)' }}
      >
        {/* Faint background product icons */}
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          {heroIcons.map(
            ({ Icon, top, left, size, rotate, delay, duration }, i) => (
              <Icon
                key={i}
                className={`absolute ${size} text-white animate-[floatIcon_ease-in-out_infinite]`}
                style={{
                  top,
                  left,
                  '--rotate': rotate,
                  animationDelay: delay,
                  animationDuration: duration,
                }}
                strokeWidth={1.25}
              />
            ),
          )}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            About Us
          </h1>
        </div>

        <style jsx>{`
          @keyframes floatIcon {
            0% {
              transform: rotate(var(--rotate)) translateY(0px);
            }
            50% {
              transform: rotate(var(--rotate)) translateY(-10px);
            }
            100% {
              transform: rotate(var(--rotate)) translateY(0px);
            }
          }
        `}</style>
      </section>

      {/* About content */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="mb-10 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-black">
            Welcome to Rentnpay — Your Trusted Lifestyle Partner
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            At <span className="font-semibold text-black">Rentnpay</span>, we
            believe that every stage of life deserves flexibility. That&apos;s
            why we&apos;ve created a platform that gives you the freedom to
            access everything you need for your{' '}
            <span className="font-semibold text-black">
              home, workspace, and events
            </span>{' '}
            — all in one place.
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Whether you&apos;re furnishing a new apartment, setting up an
            office, or planning a memorable event, Rentnpay lets you{' '}
            <span className="font-semibold text-black">
              Rent, Subscribe, or Buy
            </span>{' '}
            according to your needs, budget, and lifestyle.
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We don&apos;t just provide products—we provide the freedom to live,
            work, and celebrate your way.
          </p>
          <h3 className="text-lg md:text-xl font-semibold text-black pt-2">
            Why Rentnpay?
          </h3>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We are more than a rental company — we are a complete lifestyle
            solutions platform built around freedom, flexibility, and
            convenience.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg md:text-xl font-semibold text-black mb-3">
                {s.title}
              </h2>
              <div
                className="w-10 h-1 mb-3"
                style={{ backgroundColor: '#F97316' }}
              />
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {s.body}
              </p>
              {s.highlight && (
                <p className="text-sm md:text-base font-bold text-black leading-relaxed mt-3">
                  {s.highlight}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us */}
      <section className="bg-[#FFF8F1] py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black">
            Contact Us
          </h2>
          <div
            className="w-14 h-1 mt-3 mb-6 mx-auto"
            style={{ backgroundColor: '#F97316' }}
          />
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We&apos;re happy to assist you.
          </p>

          <div className="mt-8 inline-block text-left bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-orange-100">
            <p className="text-base font-semibold text-black mb-4">
              Rentnpay Commerce LLP
            </p>

            <p className="text-sm font-semibold text-black">
              Customer Support Hours
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Monday – Saturday, 10:00 AM – 7:00 PM (IST)
            </p>

            <p className="text-sm text-gray-600">
              <span className="font-semibold text-black">Email:</span>{' '}
              support@rentnpay.com
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-black">Business Email:</span>{' '}
              info@rentnpay.com
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-black">Phone:</span> +91-
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold text-black">Website:</span>{' '}
              <a
                href="https://www.rentnpay.com"
                className="text-orange-600 underline"
              >
                www.rentnpay.com
              </a>
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              For any queries regarding rentals, payments, delivery, returns,
              cancellations, or account support, please contact us using the
              above details.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
