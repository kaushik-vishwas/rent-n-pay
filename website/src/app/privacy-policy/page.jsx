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
//     title: '1. Information We Collect',
//     body: `When you rent, buy, or book a service through Rentnpay, we collect information such as your name, phone number, email address, delivery or property address, payment details, and government ID (where required for agreements). We also collect usage data — pages visited, products viewed, and device information — to keep the platform running smoothly.`,
//   },
//   {
//     title: '2. How We Use Your Information',
//     body: `We use your information to process rentals, purchases and service bookings, generate agreements, send payment reminders and receipts, verify your identity where legally required, and provide customer support. We may also use it to improve our platform and recommend relevant listings or services.`,
//   },
//   {
//     title: '3. Sharing With Third Parties',
//     body: `We share information with landlords, sellers, or service partners only as needed to fulfil your rental, purchase, or service request. We work with payment gateways, logistics partners, and verification agencies to process transactions securely. We do not sell your personal data to advertisers.`,
//   },
//   {
//     title: '4. Cookies & Tracking',
//     body: `Rentnpay uses cookies and similar technologies to keep you logged in, remember your preferences, and understand how the platform is used. You can control cookies through your browser settings, though some features may not work as expected if cookies are disabled.`,
//   },
//   {
//     title: '5. Data Security',
//     body: `We use industry-standard encryption and access controls to protect your data. Payment information is processed through PCI-DSS compliant partners, and we never store your full card details on our servers.`,
//   },
//   {
//     title: '6. Your Rights',
//     body: `You can access, update, or request deletion of your personal information at any time through your account settings or by contacting our support team. Certain records related to signed rental or purchase agreements may be retained as required by law.`,
//   },
//   {
//     title: '7. Changes to This Policy',
//     body: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We'll notify you of significant changes through the app or via email.`,
//   },
//   {
//     title: '8. Contact Us',
//     body: `If you have questions about this Privacy Policy or how your data is handled, reach out to us at privacy@rentnpay.com or through the Help Center.`,
//   },
// ];

// const PrivacyPolicy = () => {
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

//         <div className="relative z-10 max-w-3xl mx-auto text-center">
//           <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
//             Privacy Policy
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
//           At <span className="font-semibold text-black">Rentnpay</span>, we take
//           your privacy seriously. This policy explains what information we
//           collect, how we use it, and the choices you have — whether you&apos;re
//           renting a home, buying one, or booking a service through our platform.
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

// export default PrivacyPolicy;

'use client';
import React from 'react';

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
    title: '1. Collection of Personal Information',
    body: `For availing the Services from the Platforms or to contact Rentnpay, you may have to sign up by providing following personal information such as email address, name, phone number and address. Some of the information provided above may constitute personal information and is collected for identity verification and compliance purposes  (“Personal Information”) and is collected for the purpose of verification of identity of the user and to ensure due compliances. We do use your contact information to send you offers based on your previous orders and your interests. In general, you can browse the Platforms without telling us who you are or revealing any Personal Information about yourself. Additionally, if you browse through the Platforms, our servers may automatically record information of certain kind. Such information includes information such as the name of the domain and host from which you access the Internet; the Internet Protocol (IP) address of the device you are using; the date and time of your access. We use this information to monitor the usage of our Platforms and also whatever is necessary for our business. This information does not include Personal Information. If you choose to post messages on our message boards, chat rooms or other message areas or leave feedback, we will collect that information you provide to us. We retain this information as necessary to resolve disputes, provide customer support and troubleshoot problems as permitted by law. If you send us personal correspondence, such as emails or letters, or if other users or third parties send us correspondence about your activities or postings on the Platforms, we may collect such information into a file specific to you`,
  },
  {
    title: '2. Information Collected From Third Party',
    body: `We may collect your Personal Information as well as other information from third parties like Business Partners (as defined in the Rental Terms and Conditions); contractors; Product Partners etc and add the same to our account information.`,
  },
  {
    title: '3. Information Placed on Your Computer',
    body: `We may store some information such as cookies on your computer. Cookies are pieces of information that an application transfers to the hard drive of a visitors computer for record-keeping purposes. This information facilitates your use of the Platforms and ensures that you do not need to re-enter your details every time you visit it. You can erase or choose to block this information from your computer if you want to. Erasing or blocking such information may limit the range of features available to the visitor on the Platforms. We also use such information to provide visitors a personalized experience on the Platforms. We may use such information to allow visitors to use the Platforms without logging in upon returning. `,
  },
  {
    title: '4. Information Collected From Your Mobile Device',
    subList: [
      {
        label: 'Personal Information',
        text: `All information we collect relates to providing Rentnpay's service features; we never receive information unless you expressly choose to share it.`,
      },
      {
        label: 'Contacts',
        text: `Used to avoid errors when entering a delivery mobile number, or to share products with friends and family — we never import or scan your contacts unless you ask us to.`,
      },
      {
        label: 'Phone State',
        text: `We access read-only information such as phone number and device network to provide a seamless experience.`,
      },
      {
        label: 'Location',
        text: `Used strictly to show product stock availability in your area and deliver orders accurately; we never access your specific device location without your explicit permission.`,
      },
      {
        label: 'Camera',
        text: `Used only for profile pictures or KYC document uploads as per RBI 2022 guidelines — we only access images you specifically choose and never scan your photo library, and you can revoke access at any time.`,
      },
    ],
  },
  {
    title: '5. Links',
    body: `Our Platforms may contain links to other websites. Such other sites may use information about your visit to our Platforms. Our Privacy Policy does not apply to practices of such sites that we do not own or control or to people we do not employ. Therefore, we are not responsible for the privacy practices or the accuracy or the integrity of the content included on such other sites. We encourage you to read the individual privacy statements of such websites. `,
  },
  {
    title: '6. Use of Personal Information',
    body: `The Platforms collect and use your Personal Information to provide you better customer experience and also in the administration of our business. The Platforms may use your Personal Information to (a) administer this service, (b) personalize the Platforms’ services for you enable your access to and use of the Platforms’ services, (c) publish information about you on the Platforms, (d) to keep you informed or update you on various services available on the Platforms, (e) send you statements and invoices, (f) collect payments from you, (g) send you marketing communications, (h) send you mails or contact you for various customer satisfaction surveys, market research, promotional activities or in connection with certain transactions, (i) make communications necessary to notify you regarding various security, privacy, and administrative issues, (j) respond to your queries, (k) send you information that may be of interest to you, (l) address you if we have reasonable belief, that you are violating the rights of any third party or any of the agreements or policies that govern your use of the Platforms or our Services or (m) conduct research and perform analysis in order to measure, maintain, protect, develop and improve our Services. The Platforms have no operations in other countries and we do not transfer Personal Information to other countries. However, if the server space provider as matter of backup or other general practices may transfer the server content between any of the countries in which server provider operates or servers are located to enable the use of the information in accordance with this Privacy Policy, You agree to such cross-border transfers of Personal Information and the risk associated with it.Where the Platforms disclose your Personal Information to any third party for any purpose mentioned above, such third parties are obligated to use that Personal Information in accordance with the terms of this Privacy Policy.`,
  },
  {
    title: '7. Personal Information That We Share',
    body: `We are committed to protecting the privacy and security of your information. At no time will we sell your Personal Information without your permission unless set forth in this Privacy Policy to any third parties. The information we receive about you or from you may be used by us or shared by us with our Business Partners, corporate affiliates, dealers, agents, Product Partners and other third parties.We do not share, sell, trade or rent your Personal Information to third parties for unknown reasons. We retain complete anonymity while in all analytics and none of the Personal Information is used, except in a limited set of circumstances as stated in this Policy. We safeguard your email addresses. We don't sell the email addresses provided by you and we use them only as directed by you and in accordance with this Policy.`,
  },
  {
    title: '8. Business Transfers',
    bodies: [
      `If we start up subsidiaries or get involved in mergers or acquisitions, your Personal Information may be the matter of transfer and we will provide notice on any such transfer and become subject to different privacy policy.`,
      `Furthermore, Rentnpay shall provide the Services under the Agreement, either by itself or through any of its Business Partners. In case the Services are required to be provided through such Business Partners, Rentnpay shall share the details (only to the extent required to provide the Services) of the Customer to enable such Business Partner to provide the Services. The Customer hereby authorises Rentnpay to share the details of the Customer with such Business Partners.`,
      `Notwithstanding anything contained in this Privacy Policy or any other agreement, Rentnpay reserves the absolute right to disclose, share, transfer, or provide access to any information (including the Personal Information), without prior notice to the Customer, where such disclosure is:`,
    ],
    letterList: [
      `Required under applicable law, regulation, court order, decree, directive, or governmental request;`,
      `Requested or required by any government authority, statutory body, regulatory authority, law enforcement agency, investigative agency, or judicial or quasi-judicial authority;`,
      `Necessary to comply with legal obligations, respond to subpoenas, or enforce or protect the rights, property, or safety of the Rentnpay, its users, or the public at large;`,
      `Required for the purposes of investigation, prevention, detection, or prosecution of offences, including cyber incidents, fraud, or security breaches; or`,
      `Required to do so by law, in connection with any legal proceedings or prospective legal proceedings, and in order to establish, exercise or defend its legal rights.`,
    ],
    afterList: [
      `Such disclosure shall not be deemed a violation of this Privacy Policy or of any duty of confidentiality owed by Rentnpay, and Rentnpay shall not be liable for any claims, losses, or damages arising out of or in connection with such disclosure.`,
    ],
  },
  {
    title: '9. DND Waiver',
    body: `You agree and authorize Rentnpay to use and share your information with its Business Partners, contractors and other third parties, in so far as required for joint marketing purposes/offering various services/report generations and/or to similar services to provide you with various value-added services, in association with the Services selected by you or otherwise. You agree to receive communications through emails, telephone and/or sms, from Rentnpay including its Business Partners, contractors or its third-party Product Partners regarding the Services/ancillary services updates, information/promotional emails and/or product announcements. In this context, you agree and consent to receive all communications at the mobile number provided, even if this mobile number is registered under DND/NCPR list under TRAI regulations, and for such purpose, you further authorize Rentnpay to share/disclose the information to its Business Partners, contractors or any third-party service provider.`,
  },
  {
    title: '10. Our Commitment to Personal Information Security',
    bodies: [
      `We recognize that your privacy is important to you, and therefore we endeavor to keep your Personal Information confidential. We will take reasonable technical and organizational precautions to prevent the loss, misuse or alteration of your Personal Information. We assure you of our best effort to protect Personal Information.`,
      `HOWEVER, WE DO NOT REPRESENT, WARRANT, OR GUARANTEE THAT YOUR PERSONAL INFORMATION WILL BE PROTECTED AGAINST UNAUTHORIZED ACCESS, LOSS, MISUSE, OR ALTERATIONS, AND DO NOT ACCEPT ANY LIABILITY FOR THE SECURITY OF THE PERSONAL INFORMATION SUBMITTED TO US NOR FOR YOUR OR THIRD PARTIES USE OR MISUSE OF PERSONAL INFORMATION.`,
    ],
  },
  {
    title: '11. Payment Gateway',
    body: `Information relating to electronic transactions entered into via the Platforms shall be protected by encryption technology. We have partnered with Razorpay, a secure payment gateway provider, for processing online payments. The Platforms does not have the ability to interfere and do not interfere with the payment gateway mechanism. The Platforms have no access to the information that you may enter for making the payment through the payment gateway. Your transaction and banking details or other information as required for internet banking or other payment instruments is held by our Payment Gateway partner. By creating a link to a payment gateway, we do not endorse the payment gateway, nor are we liable for any failure of services offered by such payment gateway. Such payment gateway may have a privacy policy different from that of ours. All failures/ errors/ omissions of the payment gateway shall be the sole responsibility of the payment gateway. You hereby consent that you shall not sue Rentnpay for any disputes that you may have with the payment gateway for any wrong doing of the payment gateway.`,
  },
  {
    title: '12. Security',
    body: `We safeguard your privacy using known security standards and procedures and comply with applicable privacy laws. Our Platforms combine industry-approved physical, electronic and procedural safeguards to ensure that your information is well protected through its life cycle in our infrastructure. Personal Information is hashed or encrypted when it is stored in our infrastructure. Personal Information is decrypted, processed and immediately re-encrypted or discarded when no longer necessary.`,
  },
  {
    title: '13. Opt-Out Policy & Account Deletion',
    richBodies: [
      [
        `You have the option to access, modify, change, or request the deletion of your information, including personal information, by reaching out to us at `,
        { email: 'customercare@rentnpay.com' },
        `.`,
      ],
      [
        `If you wish to stop receiving non-essential, promotional, or marketing communications from us, please send an email to `,
        { email: 'customercare@rentnpay.com' },
        `.`,
      ],
      [
        `It's important to be aware that deleting specific personal information may result in the cancellation of your registration on the Rentnpay Platform and a loss of access to certain features.`,
      ],
    ],
  },
  {
    title: '14. Changes to the Privacy Policy',
    body: `We reserve the right to modify this Privacy Policy and it is subject to change at any time without notice. If we decide to change our Privacy Policy, such changes will be posted on Platforms so that you are always aware of the latest amendments in this Privacy Policy and please review this Policy periodically.`,
  },
  {
    title: '15. About This Privacy Policy',
    richBodies: [
      [
        `If you choose to visit our Platforms, your visit and any dispute over privacy is subject to this Privacy Policy and Rental Terms and Conditions. The terms of this Privacy Policy do not govern Personal Information furnished through any means other than the Platforms. If you have any questions about this Privacy Policy or the Platforms' treatment of your Personal Information, please write to `,
        { email: 'customercare@rentnpay.com' },
      ],
    ],
  },
  {
    title: '16. Grievance Redressal Officer',
    body: null,
    grievance: true,
  },
];

const PrivacyPolicy = () => {
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
            Privacy Policy
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
        <div className="text-sm md:text-base text-gray-700 leading-relaxed mb-10 space-y-4">
          <p>
            We&apos;re Rentnpay, an online rental solution for your furnishing
            needs.
          </p>
          <p>
            <span className="font-semibold text-black">
              Rentnpay Commerce LLP
            </span>{' '}
            is a Limited Liability Partnership incorporated and registered under
            the Limited Liability Partnership Act, 2008, having its registered
            office at Fl. No. B1-1002, Amrutvel Social, Sr. No. 41/1/1, Near
            Kakde Terrace, Warje, Pune - 411058, Maharashtra, India
            (&quot;Rentnpay&quot;). Rentnpay is strongly committed to protecting
            your privacy and has taken all necessary and reasonable measures to
            protect your personal information and handle the same in a safe and
            responsible manner in accordance with the terms and conditions of
            this policy (&quot;Privacy Policy&quot;) set out herein below:
          </p>
          <p>
            <span className="font-semibold text-black">
              https://www.rentnpay.com
            </span>{' '}
            owned by Rentnpay (&quot;Platforms&quot;) are a marketplace for
            people to engage in subscribing to experience with respect to
            furniture, appliances, electronics either collectively as a package
            or individual items by signing a personalized contract provided
            thereunder (hereinafter referred to as the &quot;Services&quot;).
            The information contained on these Platforms and the personal
            information collected by using/login and or accessing these
            Platforms are stored at a secured server. We use industry-standard
            security measures and work with reputable hosting and infrastructure
            providers to protect information stored on our servers. The
            Platforms are owned by an Indian company which is providing its
            Services in India. Hence, we are duty bound to abide by the laws,
            regulations, rules, circulars, notifications etc governing privacy
            in India. This Privacy Policy is applicable to all users of the
            Platforms. The user is herein collectively referred to as
            &quot;You&quot; / &quot;Customer&quot;. You may note that this
            Privacy Policy may be found deficient with respect to certain
            privacy laws of some other countries. By visiting the Platforms you
            agree to be bound by the terms and conditions of this Privacy
            Policy. If you do not agree please do not use or access our
            Platforms. By mere use of the Platforms, you expressly consent to
            our use and disclosure of your personal information in accordance
            with this Privacy Policy.
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
              {s.subList ? (
                <div className="space-y-2">
                  {s.subList.map((item, idx) => (
                    <p
                      key={idx}
                      className="text-sm md:text-base text-gray-700 leading-relaxed"
                    >
                      <span className="font-semibold text-black">
                        {item.label}:
                      </span>{' '}
                      {item.text}
                    </p>
                  ))}
                </div>
              ) : s.richBodies ? (
                <>
                  {s.richBodies.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 last:mb-0"
                    >
                      {para.map((seg, sIdx) =>
                        typeof seg === 'string' ? (
                          <React.Fragment key={sIdx}>{seg}</React.Fragment>
                        ) : (
                          <a
                            key={sIdx}
                            href={`mailto:${seg.email}`}
                            className="text-orange-500 hover:underline"
                          >
                            {seg.email}
                          </a>
                        ),
                      )}
                    </p>
                  ))}
                </>
              ) : s.bodies ? (
                <>
                  {s.bodies.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
                  {s.letterList && (
                    <ol className="list-[lower-alpha] pl-5 space-y-1 mt-3">
                      {s.letterList.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm md:text-base text-gray-700 leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ol>
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
                </>
              ) : s.grievance ? (
                <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-3">
                  <p>
                    In the event of any grievance pertaining to our privacy
                    policy or practices involving the usage of data, the
                    Grievance Redressal Officer may be contacted at the
                    coordinates provided herein below:
                  </p>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium text-black">
                        Grievance Redressal Officer:
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-black">Name:</span> Mr.
                      Kishor Shivaji Navale
                    </p>
                    <p>
                      <span className="font-medium text-black">
                        Designation:
                      </span>{' '}
                      Designated Partner &amp; Grievance Redressal Officer
                    </p>
                    <p>
                      <span className="font-medium text-black">Email:</span>{' '}
                      <a
                        href="mailto:grievance.officer@rentnpay.com"
                        className="text-orange-500 hover:underline"
                      >
                        grievance.officer@rentnpay.com
                      </a>
                    </p>
                    <p>
                      <span className="font-medium text-black">Address:</span>{' '}
                      Fl. No. B1-1002, Amrutvel Social, Sr. No. 41/1/1, Near
                      Kakde Terrace, Warje, Pune - 411058, Maharashtra, India.
                    </p>
                  </div>
                  <p>
                    All disputes arising out of or relating to this Privacy
                    Policy shall be subject to the exclusive jurisdiction of the
                    competent courts at Pune, Maharashtra, India.
                  </p>
                </div>
              ) : (
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {s.body}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
