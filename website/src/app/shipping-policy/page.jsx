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
//     title: '1. Delivery & Installation',
//     body: `For rented or purchased furniture and appliances, Rentnpay coordinates delivery and, where applicable, installation at your chosen address. Delivery slots are confirmed at checkout and shared via SMS/email ahead of the scheduled date.`,
//   },
//   {
//     title: '2. Delivery Timelines',
//     body: `Standard delivery typically takes 2–7 business days depending on your city, product availability, and stock at the nearest warehouse. Larger items (sofas, wardrobes, appliances) may take slightly longer than smaller accessories. Estimated timelines are shown on the product page before you confirm your order.`,
//   },
//   {
//     title: '3. Delivery Charges',
//     body: `Delivery charges, if any, are calculated based on distance, product size, and floor/access at the delivery location, and are shown transparently at checkout before payment. Select rental plans and purchase orders above a minimum value may qualify for free delivery.`,
//   },
//   {
//     title: '4. Serviceable Locations',
//     body: `Rentnpay currently delivers and installs across the cities we operate in. If your pin code falls outside our serviceable area, this will be flagged at checkout so you know before you pay.`,
//   },
//   {
//     title: '5. Delivery Attempts',
//     body: `Our delivery partner will make up to two attempts to deliver at the scheduled address. Please ensure someone is available to receive and inspect the item. If both attempts fail, the order may be rescheduled or cancelled as per our Refund Policy.`,
//   },
//   {
//     title: '6. Inspection at Delivery',
//     body: `We recommend inspecting the product for visible damage at the time of delivery, before signing off. Any damage should be reported to our support team within 24 hours with photos, so we can arrange a replacement or repair quickly.`,
//   },
//   {
//     title: '7. Rescheduling',
//     body: `Need to change your delivery date? You can reschedule from your order dashboard up to 24 hours before the scheduled slot, subject to availability of the delivery team in your area.`,
//   },
//   {
//     title: '8. Pickup (End of Rental)',
//     body: `When a rental period ends or is closed early, Rentnpay schedules a pickup of the rented items. Please ensure the product is accessible and in its agreed condition; normal wear and tear is expected and accounted for in your rental terms.`,
//   },
//   {
//     title: '9. Contact Us',
//     body: `For delivery-related questions or to report an issue, reach out to us at support@rentnpay.com or through the Help Center.`,
//   },
// ];

// const ShippingPolicy = () => {
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
//             Shipping Policy
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
//           This Shipping Policy explains how{' '}
//           <span className="font-semibold text-black">Rentnpay</span> handles
//           delivery, installation, and pickup for rented and purchased products,
//           so you know what to expect from order to doorstep.
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

// export default ShippingPolicy;

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
    title: '1. Service Coverage',
    bodies: [
      `Rentnpay delivers products only to locations that are serviceable by Rentnpay, its Product Partners, or authorised logistics partners. Product availability and serviceability may vary depending on the location.`,
      `If a delivery location is found to be non-serviceable after order confirmation, Rentnpay reserves the right to cancel the order and process any eligible refund in accordance with the Refund & Cancellation Policy.`,
    ],
  },
  {
    title: '2. Delivery Timeline',
    bodies: [
      `Estimated delivery timelines displayed on the Platform are indicative only and may vary depending on product availability, location, operational requirements, weather conditions, traffic, public holidays, or other circumstances beyond Rentnpay's reasonable control.`,
      `Rentnpay will make reasonable efforts to inform Customers of any significant delay.`,
    ],
  },
  {
    title: '3. Delivery, Installation & Pickup Charges',
    bodies: [
      `Delivery, installation, pickup, relocation, or other applicable service charges will be displayed during checkout or communicated before order confirmation.`,
      `Additional charges may apply for:`,
    ],
    list: [
      `Remote or non-serviceable locations.`,
      `Repeated delivery or pickup attempts due to Customer unavailability.`,
      `Special handling requirements.`,
      `Staircase delivery where lift access is unavailable.`,
      `Relocation requests or other special services.`,
    ],
  },
  {
    title: '4. Delivery & Installation',
    bodies: [
      `Where applicable, products will be delivered and installed by Rentnpay, the Product Partner, or their authorised service partners.`,
      `The Customer or an authorised representative must be present at the delivery location with valid identification, where requested, to receive the product.`,
      `Delivery shall be deemed completed once the product has been successfully handed over to the Customer and, where applicable, installed.`,
    ],
  },
  {
    title: '5. Inspection at Delivery',
    bodies: [
      `Customers are requested to inspect the product immediately upon delivery and report any visible damage, defects, or missing accessories before accepting the delivery.`,
      `Acceptance of the delivery without objection shall be deemed confirmation that the product has been received in satisfactory condition, subject to normal wear and tear.`,
    ],
  },
  {
    title: '6. Delivery & Pickup Partners',
    bodies: [
      `Depending on the product category, city, availability, logistics requirements, or Product Partner, the delivery team and pickup team may be different.`,
      `Customers should hand over rented products only to authorised personnel designated by Rentnpay or the applicable Product Partner.`,
    ],
  },
  {
    title: '7. Failed Delivery',
    bodies: [`If delivery cannot be completed because of:`],
    list: [
      `Customer unavailability;`,
      `Incorrect or incomplete address;`,
      `Restricted access to the premises;`,
      `Failure to obtain required permissions; or`,
      `Any other reason attributable to the Customer,`,
    ],
    afterList: [
      `Rentnpay may reschedule the delivery and additional delivery or handling charges may apply.`,
    ],
  },
  {
    title: '8. Pickup of Products',
    bodies: [
      `Customers may request pickup upon completion or termination of the rental period through the Rentnpay Platform or Customer Support.`,
      `Before pickup, the Customer must ensure that:`,
    ],
    list: [
      `The product is available at the agreed pickup location;`,
      `All accessories, manuals, cables, keys, remotes, chargers, and other supplied components are returned;`,
      `Personal belongings and data (where applicable) have been removed; and`,
      `The product is kept ready for collection.`,
    ],
    afterList: [
      `Pickup shall be considered complete only after inspection of the product by Rentnpay, the Product Partner, or the authorised pickup representative.`,
      `If the Customer is unavailable during the scheduled pickup, additional pickup or rescheduling charges may apply.`,
    ],
  },
  {
    title: '9. Relocation',
    bodies: [
      `Customers wishing to relocate a rented product during the rental period must obtain prior approval from Rentnpay.`,
      `Relocation shall only be carried out by Rentnpay, the Product Partner, or their authorised logistics partners. Customers must not relocate or transport rented products themselves without prior written approval.`,
      `Applicable relocation charges, if any, will be communicated before the service is scheduled.`,
    ],
  },
  {
    title: '10. Delays Beyond Our Control',
    body: `Rentnpay shall not be liable for delays in delivery, installation, relocation, or pickup arising from events beyond its reasonable control, including natural disasters, severe weather, transport disruptions, strikes, government restrictions, pandemics, civil disturbances, or other force majeure events.`,
  },
  {
    title: '11. Contact Us',
    body: `For any delivery, installation, pickup, relocation, or shipping-related assistance, Customers may contact the Rentnpay Support Team through the contact details provided on the Platform.`,
  },
];

const ShippingPolicy = () => {
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
            Shipping Policy
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
          This Shipping, Delivery & Pickup Policy explains how products are
          delivered, installed, relocated, and collected through the Rentnpay
          Platform.
        </p>

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
              {s.bodies ? (
                s.bodies.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 last:mb-0"
                  >
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {s.body}
                </p>
              )}
              {s.list && (
                <ul className="list-disc pl-5 space-y-1 mt-3">
                  {s.list.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm md:text-base text-gray-700 leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {s.afterList &&
                s.afterList.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-sm md:text-base text-gray-700 leading-relaxed mt-3"
                  >
                    {para}
                  </p>
                ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ShippingPolicy;
