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
//     title: '1. Acceptance of Terms',
//     body: `By accessing or using Rentnpay — to rent, buy, or book a service — you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.`,
//   },
//   {
//     title: '2. Eligibility',
//     body: `You must be at least 18 years old and capable of entering into a legally binding agreement to use Rentnpay. By creating an account, you confirm that the information you provide is accurate and current.`,
//   },
//   {
//     title: '3. Rentals & Agreements',
//     body: `Rental listings are subject to availability and landlord approval. Once a rental agreement is signed digitally through the platform, it is legally binding between the tenant and landlord. Security deposits, lock-in periods, and notice requirements are as stated in the individual agreement.`,
//   },
//   {
//     title: '4. Purchases',
//     body: `Products or properties listed for sale are subject to availability and seller confirmation. Prices, taxes, and delivery timelines will be clearly shown at checkout before you complete a purchase. Ownership transfers as per the terms stated on the order confirmation.`,
//   },
//   {
//     title: '5. Services',
//     body: `Service bookings (repairs, cleaning, move-in support, etc.) are fulfilled by verified service partners. Timelines are estimates and may vary based on location and partner availability. Any damages or disputes related to a service should be reported within 48 hours of completion.`,
//   },
//   {
//     title: '6. Payments',
//     body: `All payments made through Rentnpay — rent, purchase amounts, or service fees — are processed via secure, PCI-DSS compliant payment gateways. Late rent payments may attract charges as specified in your rental agreement. Refunds, where applicable, are processed as per our Refund Policy.`,
//   },
//   {
//     title: '7. User Responsibilities',
//     body: `You agree not to misuse the platform, post false listings, or engage in fraudulent transactions. Landlords and sellers are responsible for the accuracy of their listings; tenants and buyers are responsible for honoring agreed payment schedules.`,
//   },
//   {
//     title: '8. Limitation of Liability',
//     body: `Rentnpay acts as a platform connecting tenants, buyers, landlords, sellers, and service partners. While we verify listings and partners where possible, we are not liable for disputes arising directly between users, beyond the support and mediation we offer through our Help Center.`,
//   },
//   {
//     title: '9. Termination',
//     body: `We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform. You may close your account at any time, subject to settlement of any pending payments or agreements.`,
//   },
//   {
//     title: '10. Changes to These Terms',
//     body: `We may update these Terms & Conditions from time to time to reflect changes in our services or legal requirements. Continued use of Rentnpay after changes are posted constitutes acceptance of the updated terms.`,
//   },
//   {
//     title: '11. Contact Us',
//     body: `For questions about these Terms & Conditions, reach out to us at support@rentnpay.com or through the Help Center.`,
//   },
// ];

// const TermsAndConditions = () => {
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
//             Terms &amp; Conditions
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

//       {/* Terms content */}
//       <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
//         <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-10">
//           These Terms &amp; Conditions govern your use of{' '}
//           <span className="font-semibold text-black">Rentnpay</span> — whether
//           you&apos;re renting a home, buying one, or booking a service through
//           our platform. Please read them carefully before using our services.
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

// export default TermsAndConditions;

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
    title: 'Definitions',
    subsections: [
      {
        body: `"We/we" or "Our/our" or "Us/us" or "Rentnpay" or "Service Provider" refers to Rentnpay Commerce LLP and shall include its successors and assignees.`,
      },
      {
        body: `"Website" or "Site" shall mean https://www.rentnpay.com and mobile applications ("App") developed by Rentnpay Commerce LLP.`,
      },
      {
        body: `"You/you" or "Your/your" or "Yourself/yourself" shall mean reference to the Prospect or Customer or his/her representative and any other user accessing the Site.`,
      },
    ],
  },
  {
    title: 'Intellectual Property Rights',
    body: `All textual, graphical, visual, software, logos, trademarks, designs, and other content appearing on the Platform, unless otherwise stated, are the property of Rentnpay Commerce LLP or its licensors and are protected under applicable copyright, trademark, and other intellectual property laws. Copying, reproduction, redistribution, modification, publication, or commercial use of any such content without Rentnpay's prior written permission is strictly prohibited.`,
  },
  {
    title: '1. Rental Term and Duration',
    subsections: [
      {
        subtitle: '1.1 Rental Commencement',
        body: (
          <>
            The rental period shall commence on the date the rented product is
            successfully delivered to the Customer or the Customer&apos;s
            authorised representative (&quot;
            <strong className="text-black">Rental Commencement Date</strong>
            &quot;) and shall continue for the rental tenure selected at the
            time of placing the order.
          </>
        ),
      },
      {
        subtitle: '1.2 Minimum Rental Tenure',
        body: `The rental tenure selected by the Customer at the time of booking shall constitute the minimum rental commitment. If the Customer returns the product before completing the selected tenure, the Customer shall remain liable to pay the rental charges for the entire selected rental period, unless otherwise agreed by Rentnpay in writing.`,
      },
      {
        subtitle: '1.3 Renewal of Rental',
        body: `Upon completion of the selected rental tenure, the Customer may request an extension, subject to product availability and the approval of Rentnpay and/or the Product Partner. Rentnpay reserves the right to approve or decline any renewal request at its sole discretion.`,
      },
      {
        subtitle: '1.4 Completion of Rental',
        body: `The rental agreement shall remain effective until the rented product is returned and accepted by Rentnpay or the Product Partner, and all outstanding rental charges, fees, penalties, or other applicable dues have been paid by the Customer.`,
      },
      {
        subtitle: '1.5 Marketplace Services',
        body: `The Customer acknowledges that Rentnpay operates as a technology-enabled rental marketplace. Products listed on the Platform may be owned and supplied either by Rentnpay or by verified Product Partners. Accordingly, product availability, renewal, replacement, and related rental services may be subject to the Product Partner's approval, where relevant.`,
      },
    ],
  },
  {
    title: '2. Payment & Early Closure',
    subsections: [
      {
        subtitle: '2.1 Rental Plans',
        body: (
          <>
            At the time of placing an order, Customers may choose from the
            rental plans made available on the Platform, including daily rentals
            or fixed rental tenures such as{' '}
            <strong className="text-black">3, 6, 9, or 12 months</strong>,
            subject to product availability and the options displayed at the
            time of booking.
          </>
        ),
      },
      {
        subtitle: '2.2 Minimum Rental Commitment',
        body: `The selected rental tenure forms a minimum contractual commitment between the Customer and the applicable rental provider. If the Customer chooses to return the rented product before completing the selected rental tenure, the Customer shall remain liable to pay the rental charges applicable for the entire selected rental period, unless otherwise agreed by Rentnpay in writing or expressly provided under any applicable policy.`,
        // note: `Illustration: If a Customer selects a 3-month rental plan and returns the product after 1 month, the Customer shall still be responsible for paying the rental charges for the remaining 2 months, thereby completing the financial obligation for the originally selected rental tenure.`,
        note: (
          <>
            <strong className="text-black">Illustration:</strong> If a Customer
            selects a <strong className="text-black">3-month</strong> rental
            plan and returns the product after{' '}
            <strong className="text-black">1 month</strong>, the Customer shall
            still be responsible for paying the rental charges for the remaining{' '}
            <strong className="text-black">2 months</strong>, thereby completing
            the financial obligation for the originally selected rental tenure.
          </>
        ),
      },
      {
        subtitle: '2.3 Payment Methods',
        body: `Rentnpay accepts payments through the payment methods made available on the Platform, including but not limited to credit cards, debit cards, UPI, net banking, digital wallets, bank transfers, and other payment options supported by our authorized payment gateway partners.`,
      },
      {
        subtitle: '2.4 Customer Payment Representations',
        body: `By making any payment through the Platform, you represent and warrant that:`,
        bullets: [
          {
            text: 'The payment information provided by you is accurate, complete, and lawfully belongs to you or you are duly authorized to use such a payment method.',
          },
          {
            text: 'You have sufficient funds or valid authorization to complete the transaction.',
          },
          {
            text: 'Your bank, card issuer, or payment service provider will honour the payment instructions initiated by you.',
          },
          {
            text: 'You agree to pay all applicable rental charges, security deposits, delivery or pickup charges, taxes, convenience fees, late fees, damage charges, and any other amounts payable in accordance with these Terms and the applicable rental agreement.',
          },
        ],
      },
      {
        subtitle: '2.5 Currency',
        body: (
          <>
            All payments made on the Rentnpay Platform shall be processed
            exclusively in{' '}
            <strong className="text-black">Indian Rupees (INR)</strong> and
            shall be subject to the applicable laws and regulations of the
            Republic of India.
          </>
        ),
      },
      {
        subtitle: '2.6 Payment Processing',
        body: `All online payments are securely processed through authorized third-party payment gateway providers. Rentnpay does not store or retain your complete card or banking credentials. Payment transactions are subject to the terms, conditions, and security protocols of the respective payment service providers.`,
      },
    ],
  },
  {
    title: '3. Order Confirmation',
    subsections: [
      {
        subtitle: '3.1 Order Confirmation',
        body: `An order shall be considered confirmed only after the Customer has successfully completed the required payment, submitted the necessary Know Your Customer ("KYC") information (where applicable), and Rentnpay has completed its verification process. Upon successful verification, Rentnpay shall notify the Customer through the Platform, registered email address, SMS, or any other communication channel.`,
      },
      {
        subtitle: '3.2 Product Availability',
        body: `All orders are subject to product availability. In the event the selected product becomes unavailable, Rentnpay may, after consulting the Product Partner, offer a similar or alternative product. The Customer may choose to accept or reject the alternative product. If the alternative is declined or no suitable replacement is available, any eligible amount paid by the Customer shall be refunded in accordance with the Refund & Cancellation Policy.`,
      },
      {
        subtitle: '3.3 Order Acceptance',
        body: `Submission of an order or successful payment does not guarantee acceptance of the order. Rentnpay reserves the right to accept, reject, or cancel any order prior to delivery at its sole discretion, including but not limited to unsuccessful KYC verification, non-serviceable locations, suspected fraudulent activity, incorrect information, product unavailability, Product Partner rejection, or any other operational or legal reason. In such cases, any eligible payment received shall be refunded in accordance with the applicable policy.`,
      },
      {
        subtitle: '3.4 Customer Verification',
        body: `The Customer authorises Rentnpay to verify the information provided during registration or while placing an order. Rentnpay may conduct identity verification, address verification, credit assessment (where applicable), and other checks through authorised third-party service providers to determine the Customer's eligibility to use the Platform and its services.`,
      },
    ],
  },
  {
    title: '4. Delivery and Installation',
    subsections: [
      {
        subtitle: '4.1 Delivery of Products',
        body: (
          <>
            Upon confirmation of the order, the rented product shall be
            delivered to the address provided by the Customer by{' '}
            <strong className="text-black">Rentnpay</strong>, the{' '}
            <strong className="text-black">Product Partner</strong>, or their
            authorised logistics partner. Where applicable, installation
            services may also be provided by Rentnpay, the Product Partner, or
            an authorised service partner.
          </>
        ),
      },
      {
        subtitle: '4.2 Customer Availability',
        body: `The Customer or an authorised representative must be present at the delivery location to receive the product and, where applicable, facilitate installation. If an authorised representative receives the product, Rentnpay may require valid identity proof and an authorisation from the Customer.`,
      },
      {
        subtitle: '4.3 Delivery & Installation Charges',
        body: `Delivery and installation charges, if applicable, shall be displayed at the time of placing the order. Additional charges may apply for repeated delivery attempts, special delivery requests, remote locations, or installations requiring extra materials, labour, or non-standard fittings.`,
      },
      {
        subtitle: '4.4 Inspection of Products',
        body: `The Customer shall inspect the product at the time of delivery and immediately report any visible damage, defects, or missing components to the delivery personnel. Once the delivery is accepted without objection, the product shall be deemed to have been received in satisfactory condition, and any subsequent claims for visible damage may not be accepted.`,
      },
      {
        subtitle: '4.5 Customer Responsibilities',
        body: `The Customer shall ensure that the delivery location is accessible and that all necessary permissions, including entry permissions, parking access, or lift/elevator approvals, are obtained before the scheduled delivery. The Customer shall also take reasonable precautions to safeguard their premises and personal belongings during the delivery, installation, servicing, or pickup of the rented product.`,
      },
    ],
  },
  {
    title: '5. Damage / Theft / Loss',
    subsections: [
      {
        subtitle: '5.1 Customer Responsibility',
        body: `The Customer shall be responsible for maintaining the rented product in good condition throughout the rental period, subject to reasonable wear and tear. In the event of any damage, theft, loss, or destruction of the product while it is in the Customer's possession, the Customer shall be liable for the applicable repair, replacement, or compensation costs as determined by Rentnpay.`,
      },
      {
        subtitle: '5.2 Assessment of Damage',
        body: `The condition of the product shall be assessed at the time of delivery and again during pickup or return. The extent of any damage shall be determined based on the delivery records, inspection reports, photographs, and other relevant evidence maintained by Rentnpay.`,
      },
      {
        subtitle: '5.3 Repair & Replacement Charges',
        body: `If the product is found to be damaged beyond normal wear and tear, improperly repaired, modified without prior approval, or contains missing or replaced parts, Rentnpay may recover the reasonable cost of repair or replacement from the Customer. Where a product is lost, stolen, or damaged beyond economical repair, the Customer may be required to pay its fair replacement value. A damage assessment report and applicable charges, if any, shall be communicated to the Customer.`,
      },
    ],
  },
  {
    title: '6. Damage Protection Plan',
    subsections: [
      {
        subtitle: '6.1 Optional Protection Plan',
        body: (
          <>
            Rentnpay may, at its sole discretion, offer Customers an optional
            damage protection plan (&quot;
            <strong className="text-black">Protection Plan</strong>
            &quot;) for eligible products. The availability, coverage, fees,
            exclusions, and applicable terms of such Protection Plan shall be
            displayed on the Platform at the time of placing the order.
          </>
        ),
      },
      {
        subtitle: '6.2 Scope of Coverage',
        body: `Where a Customer has subscribed to the applicable Protection Plan and has paid all applicable charges, Rentnpay may waive or reduce certain eligible damage charges in accordance with the terms of the selected Protection Plan. The extent of coverage, including any exclusions or limitations, shall be determined solely by Rentnpay.`,
      },
      {
        subtitle: '6.3 Exclusions',
        body: `The Protection Plan shall not cover damages arising from intentional misuse, negligence, theft, loss, unauthorised repairs or modifications, missing accessories, or any other exclusions specified in the applicable Protection Plan. Failure to pay the applicable Protection Plan charges may result in the loss of coverage.`,
      },
    ],
  },
  {
    title: '7. Service & Maintenance',
    subsections: [
      {
        subtitle: '7.1 Service Requests',
        body: (
          <>
            Routine maintenance and repair services for rented products may be
            provided by Rentnpay{' '}
            <strong className="text-black">
              or its authorised service partners
            </strong>{' '}
            upon the Customer&apos;s request. Complimentary maintenance, if
            offered, shall be subject to the product or rental plan and shall
            not cover damages caused by misuse, negligence, improper handling,
            or unauthorised modifications by the Customer.
          </>
        ),
      },
      {
        subtitle: '7.2 Inspection & Repairs',
        body: `Upon receiving a service request, Rentnpay or the applicable authorised service partners may first attempt to resolve the issue remotely. If required, an authorised representative may visit the Customer's location to inspect or repair the product. Where on-site repair is not feasible, the product may be collected for servicing or replacement, subject to availability.`,
      },
      {
        subtitle: '7.3 Service Charges',
        body: (
          <>
            If the inspection determines that the issue resulted from misuse,
            negligence, accidental damage, unauthorised repairs, or any act
            attributable to the Customer, Rentnpay{' '}
            <strong className="text-black">may recover</strong> the reasonable
            cost of inspection, repair, replacement, transportation, spare
            parts, or related service charges from the Customer.
          </>
        ),
      },
      {
        subtitle: '7.4 Replacement',
        body: `Where a product cannot be repaired within a reasonable time due to a manufacturing defect or normal operational failure, Rentnpay and/or the Product Partner may, at their discretion and subject to availability, provide a replacement product of the same or a similar model.`,
      },
      {
        subtitle: '7.5 Rental Charges During Service',
        body: `Unless otherwise agreed in writing, the Customer shall continue to be liable for the applicable rental charges during the repair or maintenance period, particularly where the service requirement arises due to damage or misuse attributable to the Customer.`,
      },
    ],
  },
  {
    title: '8. Customer Data and Tracking Software',
    body: `The provisions of this Clause apply only to electronic products capable of storing or processing data, including but not limited to laptops, desktops, tablets, mobile phones, and similar devices rented through the Rentnpay Platform.`,
    subsections: [
      {
        subtitle: '8.1 Customer Data',
        body: `The Customer is solely responsible for backing up, securing, and permanently removing all personal data, accounts, passwords, SIM cards, memory cards, and other storage media from the rented device before returning it for service, repair, replacement, or at the end of the rental period.`,
        note: `Rentnpay, the Product Partner, and their authorised service partners shall not be responsible for any loss, deletion, corruption, or disclosure of Customer data arising during servicing, repairs, replacement, or return of the rented device. The Customer is advised to maintain complete backups of all important data.`,
      },
      {
        subtitle: '8.2 Device Tracking',
        body: `To protect rented assets against theft, misuse, or unauthorised possession, Rentnpay and/or the Product Partner may install or activate device management, security, or location-tracking software on eligible electronic products, in accordance with applicable laws.`,
        note: `By renting such products, the Customer expressly consents to the operation of such software solely for legitimate business purposes, including asset protection, recovery, security, and device management. The Customer shall not disable, tamper with, remove, or interfere with any security or tracking software installed on the rented device. Any such unauthorised action may constitute a breach of these Terms & Conditions and may result in suspension of services, recovery proceedings, or other legal action.`,
      },
      {
        subtitle: '8.3 Survival',
        body: `The obligations contained in this Clause shall survive the expiry, cancellation, or termination of the rental agreement to the extent necessary for the protection and recovery of rented assets.`,
      },
    ],
  },
  {
    title: '9. Inspection',
    subsections: [
      {
        subtitle: '9.1',
        body: `Rentnpay and/or the Product Partner reserve the right to inspect any rented product during the rental period to verify its condition, proper usage, and compliance with these Terms & Conditions.`,
        note: `Where reasonably practicable, prior notice shall be provided to the Customer before conducting an inspection. The Customer agrees to provide reasonable access to the rented product and cooperate with Rentnpay, the Product Partner, or their authorised representatives for the purpose of inspection, maintenance, servicing, or verification.`,
      },
    ],
  },
  {
    title: '10. Information of Customers',
    subsections: [
      {
        subtitle: '10.1 Use and Sharing of Information',
        body: `The Customer authorises Rentnpay to collect, use, store, process, and share the Customer's information, including personal and financial information, with its Product Partners, logistics partners, service partners, payment gateway providers, verification agencies, affiliates, collection agencies, and other authorised third parties solely for the purpose of providing services, processing orders, facilitating payments, verifying identity, complying with legal obligations, recovering outstanding dues, and operating the Platform. Such processing shall be carried out in accordance with Rentnpay's Privacy Policy.`,
      },
      {
        subtitle: '10.2 Legal Disclosure',
        body: `Rentnpay may disclose Customer information where required by applicable law, court order, governmental authority, regulatory body, or any other lawful request.`,
      },
      {
        subtitle: '10.3 Credit and Recovery',
        body: `Where permitted under applicable law, Rentnpay may share relevant information with authorised credit bureaus, financial institutions, or recovery agencies in relation to unpaid dues, defaults, fraudulent activities, or recovery proceedings. The Customer acknowledges that any failure to fulfil payment obligations may affect their credit profile, and Rentnpay shall not be liable for any consequences arising from such lawful disclosure.`,
      },
    ],
  },
  {
    title: '11. Relocation',
    subsections: [
      {
        subtitle: '11.1',
        body: (
          <>
            If the Customer wishes to relocate a rented product to a different
            address during the rental period, the Customer must submit a
            relocation request to Rentnpay at least{' '}
            <strong className="text-black">7 days</strong> before the proposed
            relocation date. The request shall be subject to verification,
            serviceability of the new location, and approval by Rentnpay.
          </>
        ),
      },
      {
        subtitle: '11.2',
        body: `Relocation of rented products shall be carried out only by Rentnpay, the Product Partner, or their authorised logistics partners. The Customer shall not relocate, transport, or permit the relocation of any rented product without obtaining prior written approval from Rentnpay.`,
      },
      {
        subtitle: '11.3',
        body: `If the requested relocation address is outside the serviceable area or the relocation request cannot be accommodated, Rentnpay may decline the request or treat it as an early termination of the rental agreement, in which case the applicable rental charges, fees, and other obligations shall continue to apply in accordance with these Terms & Conditions.`,
      },
    ],
  },
  {
    title: '12. Product Upgrade',
    subsections: [
      {
        subtitle: '12.1',
        body: `Rentnpay may, at its sole discretion, offer Customers the option to upgrade their rented product during the rental period, subject to product availability and the approval of Rentnpay.`,
      },
      {
        subtitle: '12.2',
        body: `To be eligible for an upgrade, the Customer must have completed the minimum rental tenure (if applicable), have no outstanding dues or policy violations, and satisfy any other eligibility criteria specified by Rentnpay.`,
      },
      {
        subtitle: '12.3',
        body: `Upgrades shall generally be available only within the same product category or to a product of equal or higher rental value. Any difference in rental charges, security deposit, delivery fees, or other applicable charges shall be payable by the Customer before the upgraded product is delivered.`,
      },
      {
        subtitle: '12.4',
        body: `The availability of the upgrade option is subject to product availability, serviceability. Rentnpay reserves the right to approve, decline, or withdraw the upgrade option at its sole discretion without assigning any reason.`,
      },
    ],
  },
  {
    title: '13. Termination',
    subsections: [
      {
        subtitle: '13.1 Termination by the Customer',
        body: (
          <>
            The Customer may terminate the rental agreement by submitting a
            cancellation or return request through the Platform in accordance
            with the applicable rental plan and by providing at least{' '}
            <strong className="text-black">
              30 (thirty) days&apos; prior notice
            </strong>
            , unless otherwise specified.
          </>
        ),
      },
      {
        subtitle: '13.2 Termination by Rentnpay',
        body: `Rentnpay and/or the Product Partner reserve the right to suspend or terminate the rental agreement with immediate effect if:`,
        bullets: [
          {
            text: 'The Customer fails to pay any rental charges, security deposit, or other applicable dues;',
          },
          {
            text: 'The Customer breaches these Terms & Conditions or the applicable Rental Agreement;',
          },
          {
            text: 'The rented product is misused, damaged, relocated without approval, or used for any unlawful purpose; or',
          },
          {
            text: 'Rentnpay reasonably believes that continued rental may result in fraud, misuse, or legal or operational risks.',
          },
        ],
      },
      {
        subtitle: '13.3 Consequences of Termination',
        body: `Upon termination of the rental agreement:`,
        bullets: [
          {
            text: 'Rentnpay and/or the Product Partner shall be entitled to recover possession of the rented product;',
          },
          {
            text: 'The Customer shall immediately pay all outstanding rental charges, penalties, damage charges, and any other applicable dues; and',
          },
          {
            text: 'Any refund or adjustment, if applicable, shall be processed in accordance with the Refund & Cancellation Policy.',
          },
        ],
      },
      {
        subtitle: '13.4 Termination by Rentnpay',
        body: (
          <>
            Rentnpay may terminate the rental agreement without assigning any
            reason by providing the Customer with{' '}
            <strong className="text-black">
              30 (thirty) days&apos; prior notice
            </strong>
            , subject to applicable law.
          </>
        ),
      },
    ],
  },
  {
    title: '14. Ownership of Products',
    subsections: [
      {
        subtitle: '14.1',
        body: `All rented products available through the Platform shall remain the exclusive property of Rentnpay and/or Product Partners, as the case may be, throughout the rental period. Nothing contained in these Terms & Conditions or the Rental Agreement shall be construed as transferring any ownership, title, or proprietary rights in the rented product to the Customer.`,
      },
      {
        subtitle: '14.2',
        body: `The Customer shall not sell, pledge, mortgage, sub-rent, transfer, assign, modify, or otherwise create any third-party rights or interests over the rented product. The Customer shall immediately notify Rentnpay if any rented product is lost, seized, attached, confiscated, or becomes subject to any legal claim or proceeding and shall cooperate fully in protecting the ownership rights of Rentnpay and/or Product Partners.`,
      },
      {
        subtitle: '14.3',
        body: `The Customer agrees to indemnify and hold harmless Rentnpay against any loss, damage, liability, or expense arising from any unauthorised use, transfer, seizure, or claim relating to the rented product while it is in the Customer's possession.`,
      },
    ],
  },
  {
    title: '15. Assignment',
    subsections: [
      {
        subtitle: '15.1',
        body: `The Customer shall not assign, transfer, sub-license, or otherwise transfer any rights or obligations under these Terms & Conditions or the Rental Agreement, nor transfer possession of any rented product to any third party, without the prior written consent of Rentnpay.`,
      },
      {
        subtitle: '15.2',
        body: `Where permitted by Rentnpay, the Customer may request the transfer (novation) of the rental agreement to another person, subject to successful verification, KYC approval, serviceability of the new location, and any other conditions specified by Rentnpay and/or the Product Partner.`,
      },
      {
        subtitle: '15.3',
        body: `Rentnpay reserves the right to assign, transfer, or delegate its rights and obligations under these Terms & Conditions to any affiliate, successor, financial institution, recovery agency, service provider, or other authorised third party, without requiring the Customer's prior consent, provided such assignment does not materially affect the Customer's rights under these Terms.`,
      },
    ],
  },
  {
    title: '16. Indemnification',
    subsections: [
      {
        subtitle: '16.1',
        body: (
          <>
            The Customer agrees to indemnify, defend, and hold harmless
            Rentnpay,{' '}
            <strong className="text-black">
              the applicable Product Partner
            </strong>
            , and their respective affiliates, employees, partners, and service
            providers from and against any claims, losses, damages, liabilities,
            costs, or expenses (including reasonable legal fees) arising out of
            or relating to the Customer&apos;s misuse of the rented product,
            breach of these Terms &amp; Conditions, violation of applicable
            laws, or infringement of any third-party rights.
          </>
        ),
      },
      {
        subtitle: '16.2',
        body: `To the fullest extent permitted by applicable law, Rentnpay and the applicable Product Partner shall not be liable for any indirect, incidental, special, or consequential loss or damage arising from the Customer's use of the rented product. This Clause shall survive the termination or expiry of the rental agreement.`,
      },
    ],
  },
  {
    title: '17. Governing Law',
    subsections: [
      {
        subtitle: '17.1',
        body: `This Agreement shall be governed by the laws of India and shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.`,
      },
    ],
  },
  {
    title: '18. Entire Agreement',
    subsections: [
      {
        subtitle: '18.1',
        body: (
          <>
            These Terms &amp; Conditions, together with the Privacy Policy,
            Rental Agreement, Refund &amp; Cancellation Policy, Delivery &amp;
            Pickup Policy, and any other policies published on the Rentnpay
            Platform, constitute the entire agreement between{' '}
            <strong className="text-black">Rentnpay</strong> and the Customer
            regarding the use of the Platform and its services.
          </>
        ),
      },
      {
        subtitle: '18.2',
        body: `In the event of any inconsistency between these Terms & Conditions and any other policy published on the Platform, the specific policy applicable to the relevant service shall prevail to the extent of such inconsistency.`,
      },
      {
        subtitle: '18.3',
        body: `Rentnpay reserves the right to amend or update these Terms & Conditions and related policies at any time. Any changes shall become effective upon publication on the Platform, and the Customer's continued use of the Platform shall constitute acceptance of the revised Terms.`,
      },
    ],
  },
  {
    title: '19. Limitation of Liability',
    subsections: [
      {
        subtitle: '19.1',
        body: (
          <>
            To the maximum extent permitted by applicable law,{' '}
            <strong className="text-black">Rentnpay</strong>, the applicable
            Product Partner, and their respective affiliates, employees,
            partners, and service providers shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages,
            including any loss of profits, revenue, business opportunities, or
            data arising out of or in connection with the use of the Platform or
            any rented product.
          </>
        ),
      },
      {
        subtitle: '19.2',
        body: (
          <>
            In any event, the total liability of Rentnpay arising out of or
            relating to these Terms &amp; Conditions shall not exceed the total
            rental amount paid by the Customer for{' '}
            <strong className="text-black">one (1) month</strong> in respect of
            the relevant order, except where such limitation is prohibited by
            applicable law.
          </>
        ),
      },
      {
        subtitle: '19.3',
        body: `This Clause shall survive the termination, cancellation, or expiry of the rental agreement.`,
      },
    ],
  },
  {
    title: '20. Disclaimer',
    subsections: [
      {
        subtitle: '20.1',
        body: `Rentnpay reserves the right to accept, reject, modify, or cancel any order, in whole or in part, prior to delivery due to product unavailability, operational constraints, unsuccessful verification, Product Partner rejection, suspected fraudulent activity, or any other legitimate reason. In such cases, any eligible refund shall be processed in accordance with the Refund & Cancellation Policy.`,
      },
      {
        subtitle: '20.2',
        body: `Each order placed on the Platform shall be treated as an independent transaction and shall be governed by the Terms & Conditions and policies applicable at the time of placing that order.`,
      },
      {
        subtitle: '20.3',
        body: (
          <>
            The Customer acknowledges that products available on the Platform
            may be owned and supplied either by Rentnpay or the Product Partner.
            The Customer shall remain responsible for complying with these Terms
            & Conditions and shall be liable for any outstanding dues, damage,
            loss, theft, or other obligations relating to the rented product,
            irrespective of whether the product is supplied by Rentnpay or the{' '}
            <strong className="text-black">Product Partner</strong>.
          </>
        ),
      },
    ],
  },
];

const TermsAndConditions = () => {
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
            Terms &amp; Conditions
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

      {/* Terms content */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-10">
          Welcome to <span className="font-semibold text-black">Rentnpay</span>,
          an online rental marketplace operated by{' '}
          <span className="font-semibold text-black">
            Rentnpay Commerce LLP
          </span>{' '}
          , a Limited Liability Partnership incorporated under the Limited
          Liability Partnership Act, 2008, with its registered office at{' '}
          <span className="font-semibold text-black">
            Fl. No. B1-1002, Amrutvel Society, Sr. No. 41/1/1, Near Kakde
            Terrace, Warje, Pune – 411058, Maharashtra, India.
          </span>
          <br />
          <br />
          These Terms &amp; Conditions{' '}
          <span className="font-semibold text-black">
            (&quot;Terms&quot;)
          </span>{' '}
          govern your access to and use of the Rentnpay website, mobile
          application (if applicable), and all related services (collectively,
          the{' '}
          <span className="font-semibold text-black">&quot;Platform&quot;</span>{' '}
          ). By accessing, registering, or using the Platform, you agree to be
          legally bound by these Terms, along with our Privacy Policy, Refund
          &amp; Cancellation Policy, Delivery &amp; Pickup Policy, Rental
          Agreement, and any other policies published by Rentnpay from time to
          time.
          <br />
          <br />
          Rentnpay operates as a technology-enabled marketplace that connects
          customers with verified third-party rental partners (&quot;Product
          Partners&quot;) and, where applicable, offers products and services
          directly through the Platform. Rentnpay facilitates rental
          transactions, payment processing, customer support, and related
          services; however, unless expressly stated otherwise, the products
          listed on the Platform may be owned and supplied by independent
          Product Partners.
          <br />
          <br />
          Please review the following Terms of Use carefully. If you do not
          agree with these Terms, you must not access or use the Platform or its
          services. Rentnpay reserves the right to modify these Terms at any
          time, and any changes will become effective upon publication on the
          Platform. Your continued use of the Platform after such updates
          constitutes your acceptance of the revised Terms.
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
              {s.body && (
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {s.body}
                </p>
              )}
              {s.subsections && (
                <div className="space-y-4">
                  {/* {s.subsections.map((sub) => (
                    <div key={sub.subtitle}>
                      <h3 className="text-sm md:text-base font-semibold text-black mb-1">
                        {sub.subtitle}
                      </h3>
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                        {sub.body}
                      </p>
                    </div>
                  ))} */}
                  {s.subsections.map((sub) => (
                    <div key={sub.subtitle}>
                      <h3 className="text-sm md:text-base font-semibold text-black mb-1">
                        {sub.subtitle}
                      </h3>
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                        {sub.body}
                      </p>
                      {sub.note && (
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-2">
                          {sub.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default TermsAndConditions;
