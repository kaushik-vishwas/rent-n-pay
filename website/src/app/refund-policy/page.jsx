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

// const sections = [
//   {
//     title: '1. Overview',
//     body: `This Refund Policy explains when and how refunds are issued for rentals, purchases, and services booked through Rentnpay. Refund eligibility and timelines vary slightly depending on the type of order.`,
//   },
//   {
//     title: '2. Rental Orders',
//     body: `If a rented item arrives damaged, defective, or significantly different from what was listed, you can request a replacement or refund within 48 hours of delivery. Security deposits are refunded within 7–10 business days after the item is picked up and inspected, minus any applicable damage or outstanding dues.`,
//   },
//   {
//     title: '3. Purchase Orders',
//     body: `Products bought through Rentnpay can be returned within 7 days of delivery if unused, in original packaging, and with all accessories intact. Once we receive and inspect the returned item, refunds are processed to your original payment method within 5–7 business days.`,
//   },
//   {
//     title: '4. Service Bookings',
//     body: `If a booked service (repair, cleaning, installation, etc.) is not completed as described, you can raise a concern within 48 hours of the scheduled service. Verified issues are eligible for a partial or full refund of the service fee, or a free re-visit, at your preference.`,
//   },
//   {
//     title: '5. Non-Refundable Items',
//     body: `Certain charges — including delivery fees already incurred, convenience fees, and any rent already accrued for the period used — are non-refundable, except where the order was cancelled due to an error on our part.`,
//   },
//   {
//     title: '6. Cancellations Before Delivery',
//     body: `Orders cancelled before dispatch are eligible for a full refund. Once an item has been dispatched or a service professional has been assigned, standard refund timelines under the relevant section above will apply instead.`,
//   },
//   {
//     title: '7. Refund Method',
//     body: `Refunds are credited back to the original payment method used at checkout — UPI, card, net banking, or wallet. Depending on your bank, it may take a few additional business days for the amount to reflect after we initiate the refund.`,
//   },
//   {
//     title: '8. How to Request a Refund',
//     body: `You can raise a refund request from your Orders page or by contacting our support team with your order ID and reason. We'll confirm eligibility and keep you updated on the status until it's resolved.`,
//   },
//   {
//     title: '9. Contact Us',
//     body: `For any refund-related questions, reach out to us at support@rentnpay.com or through the Help Center.`,
//   },
// ];

// const RefundPolicy = () => {
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

//         <div className="relative z-10 max-w-6xl mx-auto text-center">
//           <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
//             Refund Policy
//           </h1>
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
//       </section>

//       {/* Policy content */}
//       <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
//         <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-10">
//           We want you to feel confident renting, buying, or booking services on{' '}
//           <span className="font-semibold text-black">Rentnpay</span>. This
//           policy outlines when a refund applies and how long it takes.
//         </p>

//         <div className="space-y-10">
//           {sections.map((s) => (
//             <div key={s.title}>
//               <h2 className="text-lg md:text-xl font-semibold text-black mb-3">
//                 {s.title}
//               </h2>
//               <div
//                 className="w-10 h-1 mb-3"
//                 style={{ backgroundColor: '#F97316' }}
//               />
//               <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//                 {s.body}
//               </p>
//             </div>
//           ))}
//         </div>
//       </section>
//     </main>
//   );
// };

// export default RefundPolicy;

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

// type BulletItem = { text: string };
// type Section = {
//   title: string;
//   intro?: string;
//   bullets?: BulletItem[];
//   subsections?: {
//     subtitle: string;
//     intro?: string;
//     bullets?: BulletItem[];
//   }[];
// };

const sections = [
  {
    title: '1. Cancellation Before Delivery',
    intro:
      'Customers may cancel an order before the product is delivered by contacting the Rentnpay Support Team.',
    subsections: [
      {
        subtitle: 'Monthly Rental Orders',
        intro:
          'Orders booked on a monthly rental basis (e.g., 3, 6, 9, or 12 months) may be cancelled before delivery without any cancellation charges. Any eligible refund will be processed in accordance with the original payment method.',
      },
      // {
      //   subtitle: 'Daily Rental Orders',
      //   intro:
      //     'Orders booked on a day-wise rental basis (e.g., 1-day, 2-day, or similar short-duration rentals) are non-cancellable and non-refundable once the booking has been confirmed.',
      // },
      {
        subtitle: 'Daily Rental Orders',
        intro:
          'Orders booked on a day-wise rental basis (e.g., 1-day, 2-day, or similar short-duration rentals) are',
        highlight: 'non-cancellable and non-refundable',
        outro: 'once the booking has been confirmed.',
      },
    ],
  },
  {
    title: '2. Return After Delivery (Early Closure)',
    intro:
      'Customers may request the return of a rented product before the completion of the selected rental tenure.',
    bullets: [
      {
        text: (
          <>
            For{' '}
            <span className="font-bold text-black">monthly rental plans</span>,
            an <span className="font-bold text-black">Early Closure Fee</span>{' '}
            may apply.
          </>
        ),
      },
      {
        text: 'The applicable Early Closure Fee will depend on the rental tenure selected at the time of booking and the duration for which the product has been used.',
      },
      {
        text: 'Any outstanding rental charges, damages, late fees, or other applicable dues must be cleared before the rental can be closed.',
      },
    ],
  },
  {
    title: '3. Refunds',
    intro: 'Where a refund is applicable under this Policy:',
    bullets: [
      {
        text: 'Refunds will be initiated after verification and approval by Rentnpay.',
      },
      {
        text: 'Refunds will be processed through the original mode of payment.',
      },
      {
        text: 'Processing timelines may vary depending on the payment method and banking partner.',
      },
    ],
  },
  {
    title: '4. Non-Refundable Charges',
    intro:
      'Unless otherwise required by applicable law or expressly approved by Rentnpay, the following may be non-refundable:',
    bullets: [
      { text: 'Confirmed day-wise rental bookings.' },
      { text: 'Charges for services already rendered.' },
      {
        text: 'Delivery, pickup, installation, or convenience charges, where applicable.',
      },
      { text: 'Damage, repair, late payment, or other applicable fees.' },
    ],
  },
];

const CancellationPolicy = () => {
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

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Refund Policy
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

      {/* Policy content */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-10">
          At <span className="font-semibold text-black">Rentnpay</span>, we
          understand that plans may change. Customers may cancel an order before
          delivery or return a rented product after delivery, subject to the
          following terms.
        </p>

        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              {/* Section heading */}
              <h2 className="text-lg md:text-xl font-semibold text-black mb-3">
                {s.title}
              </h2>
              <div
                className="w-10 h-1 mb-3"
                style={{ backgroundColor: '#F97316' }}
              />

              {/* Optional intro paragraph */}
              {s.intro && (
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                  {s.intro}
                </p>
              )}

              {/* Subsections (e.g. Monthly vs Daily) */}
              {s.subsections && (
                <div className="space-y-4 mb-2">
                  {s.subsections.map((sub) => (
                    <div
                      key={sub.subtitle}
                      className="pl-4 border-l-2 border-orange-200"
                    >
                      <h3 className="text-sm md:text-base font-semibold text-black mb-1">
                        {sub.subtitle}
                      </h3>
                      {/* {sub.intro && (
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {sub.intro}
                        </p>
                      )} */}
                      {sub.intro && (
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {sub.intro}{' '}
                          {sub.highlight && (
                            <span className="font-bold text-black">
                              {sub.highlight}
                            </span>
                          )}{' '}
                          {sub.outro}
                        </p>
                      )}
                      {sub.bullets && (
                        <ul className="mt-2 space-y-1 list-disc list-inside text-sm md:text-base text-gray-700">
                          {sub.bullets.map((b, i) => (
                            <li key={i}>{b.text}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Top-level bullets */}
              {s.bullets && (
                <ul className="space-y-2 mt-1">
                  {s.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm md:text-base text-gray-700"
                    >
                      <span
                        className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#F97316' }}
                      />
                      <span className="leading-relaxed">{b.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default CancellationPolicy;
