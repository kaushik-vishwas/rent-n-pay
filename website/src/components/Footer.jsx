// 'use client';

// import Link from 'next/link';
// import { Facebook, Twitter, Instagram, Linkedin, X } from 'lucide-react';
// import { FaXTwitter } from 'react-icons/fa6';

// const Footer = () => {
//   const footerLinkClass = 'text-white hover:text-[#F97316] transition-colors';
//   return (
//     <footer className="bg-black text-gray-300 mt-auto">
//       <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
//         {/* Top Footer */}
//         <div className="grid grid-cols-3 md:grid-cols-4 gap-4 gap-y-8 md:gap-10">
//           {/* Discover */}
//           <div>
//             <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
//               Discover
//             </h4>
//             <ul className="space-y-1 text-xs md:text-sm">
//               <li>
//                 <Link href="/rent" className={footerLinkClass}>
//                   Rent
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/buy" className={footerLinkClass}>
//                   Buy
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/service" className={footerLinkClass}>
//                   Services
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Company */}
//           <div>
//             <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
//               Company
//             </h4>
//             <ul className="space-y-1 text-xs md:text-sm">
//               {/* <li>
//                 <Link href="/invest-main" className={footerLinkClass}>
//                   Invest with Us
//                 </Link>S
//               </li> */}
//               <li>
//                 <Link href="/about-us" className={footerLinkClass}>
//                   About Us
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/contact" className={footerLinkClass}>
//                   Contact Us
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/careers" className={footerLinkClass}>
//                   Careers
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/blog" className={footerLinkClass}>
//                   Blogs
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/help-center" className={footerLinkClass}>
//                   Help Center
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/faq" className={footerLinkClass}>
//                   FAQ&apos;s
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Policies */}
//           <div>
//             <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
//               Policies
//             </h4>
//             <ul className="space-y-1 text-xs md:text-sm">
//               <li>
//                 <Link href="/privacy-policy" className={footerLinkClass}>
//                   Privacy Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/terms-and-conditions" className={footerLinkClass}>
//                   Terms & Condition
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/shipping-policy" className={footerLinkClass}>
//                   Shipping Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/refund-policy" className={footerLinkClass}>
//                   Refund Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/cancellation-policy" className={footerLinkClass}>
//                   Cancellation Policy
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Social */}
//           <div className="col-span-3 md:col-span-1">
//             <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
//               Connect With Us
//             </h4>

//             <p className="text-xs md:text-sm text-white mb-2">
//               Follow us on social media for updates and exclusive offers.
//             </p>

//             <div className="flex gap-4">
//               <a
//                 href="#"
//                 className="p-2 bg-[#1877F2] rounded-full  transition-colors"
//               >
//                 <Facebook size={16} className="text-white" />
//               </a>
//               <a
//                 href="#"
//                 className="p-2 bg-white rounded-full  transition-colors"
//               >
//                 <FaXTwitter className="text-black text-base" />
//               </a>
//               <a
//                 href="#"
//                 className="p-2 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] hover:opacity-90 transition-opacity"
//               >
//                 <Instagram size={16} className="text-white" />
//               </a>
//               <a
//                 href="#"
//                 className="p-2 bg-[#0A66C2] rounded-full  transition-colors"
//               >
//                 <Linkedin size={16} className="text-white" />
//               </a>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Footer */}
//         {/* <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm ">
//           <p>© 2026 Rentnpay. All rights reserved.</p>

//           <p className="mt-2 md:mt-0">
//             Developed by <span className="font-semibold">Seekneo</span>
//           </p>
//         </div> */}
//         {/* Bottom Footer */}
//         <div className="text-white mt-4 pt-4 md:mt-6 md:pt-6 flex justify-center items-center text-xs md:text-sm text-center">
//           <p>© 2026 Rentnpay. Developed by Seekneo.</p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, X } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { apiGetPublicLocationSettings } from '@/lib/api';

const Footer = () => {
  const footerLinkClass = 'text-white hover:text-[#F97316] transition-colors';

  const [locationSourceFlags, setLocationSourceFlags] = useState({
    rentEnabled: true,
    buyEnabled: true,
    serviceEnabled: true,
  });

  useEffect(() => {
    let mounted = true;
    const fetchFlags = () => {
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
    };
    fetchFlags();

    window.addEventListener('rn_delivery_location_changed', fetchFlags);
    const onStorage = (e) => {
      if (e?.key !== 'rn_delivery_location') return;
      fetchFlags();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mounted = false;
      window.removeEventListener('rn_delivery_location_changed', fetchFlags);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <footer className="bg-black text-gray-300 mt-auto">
      {/* <div className="max-w-6xl mx-auto px-4 py-8 md:py-12"> */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 md:pt-12 md:pb-6">
        {/* Top Footer */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 gap-y-8 md:gap-10">
          {/* Discover */}
          <div>
            {/* <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2"> */}
            <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
              Discover
            </h4>
            {/* <ul className="space-y-1 text-xs md:text-sm"> */}
            <ul className="space-y-1 text-[11px] md:text-xs">
              {locationSourceFlags.rentEnabled ? (
                <li>
                  <Link href="/rent" className={footerLinkClass}>
                    Rent
                  </Link>
                </li>
              ) : null}
              {locationSourceFlags.buyEnabled ? (
                <li>
                  <Link href="/buy" className={footerLinkClass}>
                    Buy
                  </Link>
                </li>
              ) : null}
              {locationSourceFlags.serviceEnabled ? (
                <li>
                  <Link href="/service" className={footerLinkClass}>
                    Services
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Company */}
          <div>
            {/* <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2"> */}
            <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
              Company
            </h4>
            {/* <ul className="space-y-1 text-xs md:text-sm"> */}
            <ul className="space-y-1 text-[11px] md:text-xs">
              {/* <li>
                <Link href="/invest-main" className={footerLinkClass}>
                  Invest with Us
                </Link>S
              </li> */}
              <li>
                <Link href="/about-us" className={footerLinkClass}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className={footerLinkClass}>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className={footerLinkClass}>
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/help-center" className={footerLinkClass}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className={footerLinkClass}>
                  FAQ&apos;s
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            {/* <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2"> */}
            <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
              Policies
            </h4>
            {/* <ul className="space-y-1 text-xs md:text-sm"> */}
            <ul className="space-y-1 text-[11px] md:text-xs">
              <li>
                <Link href="/privacy-policy" className={footerLinkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className={footerLinkClass}>
                  Terms & Condition
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className={footerLinkClass}>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className={footerLinkClass}>
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className={footerLinkClass}>
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="col-span-3 md:col-span-1">
            {/* <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2"> */}
            <h4 className="text-white font-semibold text-xs md:text-base mb-2 md:mb-2">
              Connect With Us
            </h4>

            {/* <p className="text-xs md:text-sm text-white mb-2">
              Follow us on social media for updates and exclusive offers.
            </p> */}
            <p className="text-[11px] md:text-xs text-white mb-2">
              Follow us on social media for updates and exclusive offers.
            </p>

            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-[#1877F2] rounded-full  transition-colors"
              >
                <Facebook size={16} className="text-white" />
              </a>
              <a
                href="#"
                className="p-2 bg-white rounded-full  transition-colors"
              >
                <FaXTwitter className="text-black text-base" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] hover:opacity-90 transition-opacity"
              >
                <Instagram size={16} className="text-white" />
              </a>
              <a
                href="#"
                className="p-2 bg-[#0A66C2] rounded-full  transition-colors"
              >
                <Linkedin size={16} className="text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        {/* <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm ">
          <p>© 2026 Rentnpay. All rights reserved.</p>
          

       
          <p className="mt-2 md:mt-0">
            Developed by <span className="font-semibold">Seekneo</span>
          </p>
        </div> */}
        {/* Bottom Footer */}
        {/* <div className="text-white mt-4 pt-4 md:mt-6 md:pt-6 flex justify-center items-center text-xs md:text-sm text-center">
          <p>© 2026 Rentnpay. Developed by Seekneo.</p>
        </div> */}
        <div className="text-white mt-4 pt-4 md:mt-6 md:pt-6 flex justify-center items-center text-[10px] md:text-xs text-center">
          <p>© 2026 Rentnpay. Developed by Seekneo.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
