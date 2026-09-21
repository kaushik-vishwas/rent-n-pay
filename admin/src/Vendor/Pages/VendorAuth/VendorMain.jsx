// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import VendorLogin from './VendorLogin';
// import VendorSignup from './VendorSignup';
// import VendorOtpVerification from './VendorOtpVerification';
// import VendorWelcome from './VendorWelcome';
// import VendorForgotPassword from './VendorForgotPassword';
// import { clearPendingSignup } from '../../../redux/slices/vendorSlice';
// import step2Icon from '@/assets/icons/step2.png';
// import dollarVendorIcon from '@/assets/icons/doller-vndr.png';
// import verifiedVendorIcon from '@/assets/icons/verified-vndr.png';
// import truckVendorIcon from '@/assets/icons/truck-vndr.png';
// import { Phone } from 'lucide-react';
// import vendorMainImage from '@/assets/images/vendor-main.png';
// import checkVendorsIcon from '@/assets/icons/check-vndrs.png';

// const VendorMain = () => {
//   const dispatch = useDispatch();
//   const [modal, setModal] = useState(null);
//   const [otpEmail, setOtpEmail] = useState('');

//   const closeModal = () => setModal(null);

//   /** Reset stale pending-email from localStorage so Sign Up opens the form, not OTP. */
//   const openSignupModal = () => {
//     dispatch(clearPendingSignup());
//     setModal('signup');
//   };

//   const modalContent = () => {
//     switch (modal) {
//       case 'login':
//         return (
//           <VendorLogin
//             onClose={closeModal}
//             onSignup={openSignupModal}
//             onForgotPassword={() => setModal('forgot')}
//           />
//         );
//       case 'forgot':
//         return <VendorForgotPassword onBackToLogin={() => setModal('login')} />;
//       case 'signup':
//         return (
//           <VendorSignup
//             onClose={closeModal}
//             onSignIn={() => setModal('login')}
//             onSuccess={(email) => {
//               setOtpEmail(email);
//               setModal('otp');
//             }}
//           />
//         );
//       case 'otp':
//         return (
//           <VendorOtpVerification
//             email={otpEmail}
//             onChangeEmail={openSignupModal}
//             onSuccess={() => setModal('welcome')}
//           />
//         );
//       case 'welcome':
//         return (
//           <VendorWelcome
//             onGoToDashboard={() => (window.location.href = '/vendor-dashboard')}
//             onCompleteKYC={() =>
//               (window.location.href = '/vendor-kyc-verification')
//             }
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   // Prevent background scroll while any auth modal is open.
//   useEffect(() => {
//     if (!modal) return undefined;
//     const previousOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = previousOverflow;
//     };
//   }, [modal]);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Top nav */}
//       <header className="w-full border-b border-gray-100 bg-white">
//         <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-xl  flex items-center justify-center">
//               <img
//                 src={step2Icon.src}
//                 alt="Rentnpay"
//                 className="w-8 h-8 shrink-0"
//               />
//             </div>
//             <div className="leading-tight">
//               <p className="text-sm font-semibold text-black">
//                 Rentnpay Partner
//               </p>
//               {/* <p className="text-xs text-gray-500">Vendor Portal</p> */}
//             </div>
//           </div>
//           <button
//             className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black"
//             onClick={() => setModal('login')}
//           >
//             Already a Partner? <span className="text-blue-600">Sign In</span>
//           </button>
//         </div>
//       </header>

//       {/* Hero section */}
//       <main className="flex-1">
//         <section className="max-w-6xl mx-auto px-4 lg:px-6 pt-10 lg:pt-16 pb-10 lg:pb-16">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
//             <div>
//               {/* <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 mb-3">
//                 Rentnpay Partner
//               </p> */}
//               <h1 className="text-3xl sm:text-4xl lg:text-5xl font-manrope font-semibold text-black leading-tight mb-4">
//                 Grow your Rental
//                 <br className="hidden sm:block" />
//                 Business with <span className="text-black">Rentnpay.</span>
//               </h1>
//               <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-lg">
//                 Join 500+ local vendors. Zero commission for the first month.
//               </p>

//               {/* <div className=" rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">

//                 <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 sm:py-2.5 flex-1 gap-2">
//                   <Phone className="w-3.5 h-3.5 text-gray-500" />

//                   <div className="flex items-center gap-1 text-gray-700 text-sm">
//                     <span className="text-xs">+91</span>
//                     <span className="w-px h-4 bg-gray-300" />
//                   </div>

//                   <input
//                     type="tel"
//                     placeholder="7745665205"
//                     className="flex-1 bg-transparent border-none outline-none text-sm text-black placeholder:text-gray-400"
//                   />
//                 </div>
//                 <button
//                   onClick={openSignupModal}
//                   className="w-full sm:w-auto inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-sm"
//                 >
//                   Start Selling
//                 </button>
//               </div> */}

//               <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-500">
//                 <span className="text-[#64748B] text-sm ">✓ Free to join</span>
//                 <span className="w-1 h-1 rounded-full bg-[#64748B]" />
//                 <span className="text-[#64748B] text-sm">✓ Quick approval</span>
//                 <span className="w-1 h-1 rounded-full bg-[#64748B]" />
//                 <span className="text-[#64748B] text-sm">
//                   ✓ No hidden charges
//                 </span>
//               </div>

//               {/* <div className="mt-6 inline-flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-100">
//                 <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
//                   <span className="w-3 h-3 rounded-full bg-emerald-500" />
//                 </div>
//                 <div className="text-xs leading-tight">
//                   <p className="font-medium text-black">500+ Vendors</p>
//                   <p className="text-gray-500 text-[11px]">Already growing</p>
//                 </div>
//               </div> */}
//             </div>
//             {/*
//             <div className="relative">
//               <div className="rounded-3xl overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.22)] bg-gray-200 aspect-[4/3] sm:aspect-[5/3] lg:aspect-[4/3]">
//                 <div
//                   className="w-full h-full bg-cover bg-center"
//                   style={{
//                     // backgroundImage:
//                     //   'url("https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=1200")',
//                     backgroundImage: `url(${vendorMainImage.src})`,
//                   }}
//                 />
//               </div>
//             </div> */}
//             <div className="relative">
//               {/* Image container */}
//               <div className="rounded-3xl overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.22)] bg-gray-200 aspect-[4/3] sm:aspect-[5/3] lg:aspect-[4/3]">
//                 <div
//                   className="w-full h-full bg-cover bg-center"
//                   style={{
//                     backgroundImage: `url(${vendorMainImage.src})`,
//                   }}
//                 />
//               </div>

//               {/* Floating badge OUTSIDE overflow-hidden */}
//               {/* <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 inline-flex items-center gap-2 bg-white rounded-lg  px-3 py-3 shadow-sm border border-gray-100">
//                 <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
//                   <span className="w-3 h-3 rounded-full bg-emerald-500" />
//                 </div>

//                 <div className="text-xs leading-tight">
//                   <p className="font-medium text-black">500+ Vendors</p>
//                   <p className="text-gray-500 text-[11px]">Already growing</p>
//                 </div>
//               </div> */}
//               <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 inline-flex items-center gap-2 bg-white rounded-lg px-3 py-3 shadow-sm border border-gray-100">
//                 <div className="w-10 h-10 flex items-center justify-center">
//                   <img
//                     src={checkVendorsIcon.src}
//                     alt="Verified Vendors"
//                     className="w-8 h-8 shrink-0"
//                   />
//                 </div>

//                 <div className="text-xs leading-tight">
//                   <p className="font-medium text-black">500+ Vendors</p>
//                   <p className="text-gray-500 text-[11px]">Already growing</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Why Partner section */}
//         <section className="bg-gray-50 border-t border-gray-100 py-10 lg:py-14">
//           <div className="max-w-6xl mx-auto px-4 lg:px-6">
//             <h2 className="text-xl sm:text-2xl font-semibold text-black text-center mb-8">
//               Why Partner with Us?
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
//                 {/* <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
//                   <span className="text-emerald-600 text-lg">$</span>
//                 </div> */}

//                 <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
//                   <img
//                     src={dollarVendorIcon.src}
//                     alt="Payments"
//                     className="w-6 h-6 shrink-0"
//                   />
//                 </div>
//                 <h3 className="text-base font-semibold text-black mb-1.5">
//                   Guaranteed Payments
//                 </h3>
//                 <p className="text-xs sm:text-sm text-gray-600">
//                   On-time monthly payouts with transparent settlement reports.
//                 </p>
//               </div>
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
//                 {/* <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
//                   <span className="text-blue-600 text-lg">👤</span>
//                 </div> */}
//                 <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
//                   <img
//                     src={verifiedVendorIcon.src}
//                     alt="Verified Customers"
//                     className="w-6 h-6 shrink-0"
//                   />
//                 </div>
//                 <h3 className="text-base font-semibold text-black mb-1.5">
//                   Verified Customers
//                 </h3>
//                 <p className="text-xs sm:text-sm text-gray-600">
//                   KYC-checked tenants to ensure only safe and reliable
//                   transactions.
//                 </p>
//               </div>
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
//                 {/* <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
//                   <span className="text-orange-500 text-lg">🚚</span>
//                 </div> */}
//                 <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
//                   <img
//                     src={truckVendorIcon.src}
//                     alt="Logistics Support"
//                     className="w-6 h-6 shrink-0"
//                   />
//                 </div>
//                 <h3 className="text-base font-semibold text-black mb-1.5">
//                   Logistics Support
//                 </h3>
//                 <p className="text-xs sm:text-sm text-gray-600">
//                   We handle pickup &amp; drop for hassle-free rental operations.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* Single centered modal overlay */}
//       {modal && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center px-4"
//           style={{
//             backgroundColor: 'rgba(15,23,42,0.45)',
//             backdropFilter: 'blur(4px)',
//           }}
//         >
//           <div>{modalContent()}</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VendorMain;

'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import VendorLogin from './VendorLogin';
import VendorSignup from './VendorSignup';
import VendorOtpVerification from './VendorOtpVerification';
import VendorWelcome from './VendorWelcome';
import VendorForgotPassword from './VendorForgotPassword';
import { clearPendingSignup } from '../../../redux/slices/vendorSlice';
import step2Icon from '@/assets/icons/step2.png';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';
import dollarVendorIcon from '@/assets/icons/doller-vndr.png';
import verifiedVendorIcon from '@/assets/icons/verified-vndr.png';
import truckVendorIcon from '@/assets/icons/truck-vndr.png';
import {
  DollarSign,
  Phone,
  Truck,
  Users,
  Check,
  BadgeCheck,
} from 'lucide-react';
import vendorMainImage from '@/assets/images/vendor-main.png';
import checkVendorsIcon from '@/assets/icons/check-vndrs.png';
import {
  apiVendorCheckEmailStartSelling,
  apiVendorVerifyStartSellingOtp,
  apiGetVendorsPublicCount,
} from '@/service/api';

const VendorMain = () => {
  const dispatch = useDispatch();
  const [modal, setModal] = useState(null);
  const [otpEmail, setOtpEmail] = useState('');
  const [vendorCount, setVendorCount] = useState(0);

  // Hero "Start Selling" box state
  const [sellEmail, setSellEmail] = useState('');
  const [sellLoading, setSellLoading] = useState(false);
  const [sellOtp, setSellOtp] = useState('');
  const [sellError, setSellError] = useState('');

  const closeModal = () => setModal(null);
  useEffect(() => {
    apiGetVendorsPublicCount()
      .then((res) => setVendorCount(res.data?.totalVendors || 0))
      .catch(() => setVendorCount(0));
  }, []);

  const handleStartSelling = async () => {
    setSellError('');
    if (!sellEmail.trim()) {
      setSellError('Please enter your email address');
      return;
    }
    setSellLoading(true);
    try {
      const res = await apiVendorCheckEmailStartSelling({
        emailAddress: sellEmail.trim(),
      });
      if (res.data?.exists) {
        setModal('startSellingOtp');
      } else {
        setOtpEmail(sellEmail.trim());
        dispatch(clearPendingSignup());
        setModal('signup');
      }
    } catch (err) {
      setSellError(
        err.response?.data?.message || 'Something went wrong. Try again.',
      );
    } finally {
      setSellLoading(false);
    }
  };

  const handleVerifyStartSellingOtp = async () => {
    setSellError('');
    if (!sellOtp.trim()) {
      setSellError('Please enter the OTP sent to your email');
      return;
    }
    setSellLoading(true);
    try {
      const res = await apiVendorVerifyStartSellingOtp({
        emailAddress: sellEmail.trim(),
        otp: sellOtp.trim(),
      });
      if (res.data?.token) {
        localStorage.setItem('vendorToken', res.data.token);
        localStorage.setItem('vendorUser', JSON.stringify(res.data.vendor));
      }
      window.location.href = '/vendor-dashboard';
    } catch (err) {
      setSellError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setSellLoading(false);
    }
  };

  /** Reset stale pending-email from localStorage so Sign Up opens the form, not OTP. */
  const openSignupModal = () => {
    dispatch(clearPendingSignup());
    setModal('signup');
  };

  const modalContent = () => {
    switch (modal) {
      case 'login':
        return (
          <VendorLogin
            onClose={closeModal}
            onSignup={openSignupModal}
            onForgotPassword={() => setModal('forgot')}
          />
        );
      case 'forgot':
        return <VendorForgotPassword onBackToLogin={() => setModal('login')} />;
      case 'signup':
        return (
          <VendorSignup
            onClose={closeModal}
            onSignIn={() => setModal('login')}
            onSuccess={(email) => {
              setOtpEmail(email);
              setModal('otp');
            }}
          />
        );
      case 'otp':
        return (
          <VendorOtpVerification
            email={otpEmail}
            onChangeEmail={openSignupModal}
            onSuccess={() => setModal('welcome')}
          />
        );
      case 'welcome':
        return (
          <VendorWelcome
            onGoToDashboard={() => (window.location.href = '/vendor-dashboard')}
            onCompleteKYC={() =>
              (window.location.href = '/vendor-kyc-verification')
            }
          />
        );
      case 'startSellingOtp':
        return (
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_40px_rgba(15,23,42,0.10)] border border-gray-100 px-7 py-8 flex flex-col items-center relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
            >
              ✕
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-black mb-2 text-center">
              Verify it&apos;s you
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-5 text-center">
              We sent a 6-digit OTP to <strong>{sellEmail}</strong>
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={sellOtp}
              onChange={(e) => setSellOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center tracking-[0.3em] mb-3 outline-none focus:border-blue-400"
            />
            {sellError && (
              <p className="text-xs text-red-500 mb-3 text-center">
                {sellError}
              </p>
            )}
            <button
              onClick={handleVerifyStartSellingOtp}
              disabled={sellLoading}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98]
                ${sellLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {sellLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Prevent background scroll while any auth modal is open.
  useEffect(() => {
    if (!modal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      {/* <header className="w-full border-b border-gray-100 bg-white"> */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="w-full mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          {/* <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl  flex items-center justify-center">
              <img
                src={step2Icon.src}
                alt="Rentnpay"
                className="w-8 h-8 shrink-0"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-black">
                Rentnpay Partner
              </p>
            </div>
          </div> */}
          {/* <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base">R</span>
            </div>
            <div className="leading-tight">
              <p className="text-lg font-semibold" style={{ color: '#F97316' }}>
                Rentnpay Partner
              </p>
         
            </div>
          </div> */}
          <div className="flex items-center gap-1 min-w-0">
            <img
              src={RentnpayLogo.src}
              alt="Rentnpay"
              className="w-7 h-7 shrink-0 object-contain"
            />
            <div className="leading-tight min-w-0">
              <p
                className="text-sm sm:text-lg font-semibold whitespace-nowrap"
                style={{ color: '#F97316' }}
              >
                Rentnpay Partner
              </p>
              {/* <p className="text-xs text-gray-500">Vendor Portal</p> */}
            </div>
          </div>
          <button
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-black"
            onClick={() => setModal('login')}
          >
            Already a Partner? <span className="text-[#F97316]">Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1">
        <section className="w-full mx-auto px-4 lg:px-6 pt-10 lg:pt-16 pb-10 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              {/* <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 mb-3">
                Rentnpay Partner
              </p> */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-manrope font-bold text-black leading-tight mb-4">
                Grow your Rental
                <br className="hidden sm:block" />
                Business with <span className="text-black">Rentnpay.</span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-gray-600 mb-6 max-w-lg">
                Join{' '}
                {vendorCount > 0
                  ? `${vendorCount.toLocaleString('en-IN')}+`
                  : '500+'}{' '}
                local vendors. Zero commission for the first month.
              </p>

              {/* <div className="rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">
                <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 sm:py-2.5 flex-1 gap-2">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>

                  <input
                    type="email"
                    value={sellEmail}
                    onChange={(e) => setSellEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-black placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleStartSelling}
                  disabled={sellLoading}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm
                    ${sellLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {sellLoading ? 'Checking...' : 'Start Selling'}
                </button>
              </div> */}
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg transition-shadow duration-300 hover:shadow-xl hover:shadow-orange-100/60 focus-within:shadow-xl focus-within:shadow-orange-100/60 focus-within:border-orange-200">
                <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 sm:py-2.5 flex-1 gap-2 transition-colors duration-200 focus-within:bg-orange-50/50">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>

                  <input
                    type="email"
                    value={sellEmail}
                    onChange={(e) => setSellEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-black placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleStartSelling}
                  disabled={sellLoading}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all duration-300 active:scale-[0.97]
                    ${
                      sellLoading
                        ? 'bg-orange-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-[#F97316] hover:from-orange-500 hover:to-[#F97316] hover:shadow-lg hover:shadow-orange-300/50 hover:-translate-y-0.5'
                    }`}
                >
                  {sellLoading ? 'Checking...' : 'Start Now'}
                </button>
              </div>
              {sellError && (
                <p className="text-xs text-red-500 -mt-2 mb-3">{sellError}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <div className="group flex items-center gap-1.5 cursor-default">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-200 transition-transform duration-200 group-hover:scale-110 group-hover:shadow-emerald-300">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-[#64748B] font-semibold text-sm group-hover:text-black transition-colors duration-200">
                    Free to join
                  </span>
                </div>
                <div className="group flex items-center gap-1.5 cursor-default">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-200 transition-transform duration-200 group-hover:scale-110 group-hover:shadow-emerald-300">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-[#64748B] font-semibold text-sm group-hover:text-black transition-colors duration-200">
                    Quick approval
                  </span>
                </div>
                <div className="group flex items-center gap-1.5 cursor-default">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-200 transition-transform duration-200 group-hover:scale-110 group-hover:shadow-emerald-300">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-[#64748B] font-semibold text-sm group-hover:text-black transition-colors duration-200">
                    No hidden charges
                  </span>
                </div>
              </div>

              {/* <div className="mt-6 inline-flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs leading-tight">
                  <p className="font-medium text-black">500+ Vendors</p>
                  <p className="text-gray-500 text-[11px]">Already growing</p>
                </div>
              </div> */}
            </div>
            {/* 
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.22)] bg-gray-200 aspect-[4/3] sm:aspect-[5/3] lg:aspect-[4/3]">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    // backgroundImage:
                    //   'url("https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=1200")',
                    backgroundImage: `url(${vendorMainImage.src})`,
                  }}
                />
              </div>
            </div> */}
            <div className="relative">
              {/* Image container */}
              <div className="rounded-3xl overflow-hidden shadow-[0_18px_55px_rgba(15,23,42,0.22)] bg-gray-200 aspect-[4/3] sm:aspect-[5/3] lg:aspect-[4/3]">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${vendorMainImage.src})`,
                  }}
                />
              </div>

              {/* Floating badge OUTSIDE overflow-hidden */}
              {/* <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 inline-flex items-center gap-2 bg-white rounded-lg  px-3 py-3 shadow-sm border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>

                <div className="text-xs leading-tight">
                  <p className="font-medium text-black">500+ Vendors</p>
                  <p className="text-gray-500 text-[11px]">Already growing</p>
                </div>
              </div> */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 inline-flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-3 shadow-lg border border-gray-100 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                  <BadgeCheck className="w-5 h-5 text-white" strokeWidth={2} />
                </div>

                {/* <div className="text-xs leading-tight">
                  <p className="font-bold text-sm text-black">500+ Vendors</p>
                  <p className="text-gray-500 text-xs">Already growing</p>
                </div> */}
                <div className="text-xs leading-tight">
                  <p className="font-bold text-sm text-black">
                    {vendorCount > 0
                      ? `${vendorCount.toLocaleString('en-IN')}+ Vendors`
                      : '500+ Vendors'}
                  </p>
                  <p className="text-gray-500 text-xs">Already growing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner section */}
        {/* <section className="bg-gray-50 border-t border-gray-100 py-10 lg:py-14">
          <div className="w-full mx-auto px-4 lg:px-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-black text-center mb-8">
              Why Partner with Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
               
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <img
                    src={dollarVendorIcon.src}
                    alt="Payments"
                    className="w-6 h-6 shrink-0"
                  />
                </div>
                <h3 className="text-base font-semibold text-black mb-1.5">
                  Guaranteed Payments
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  On-time monthly payouts with transparent settlement reports.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
               
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <img
                    src={verifiedVendorIcon.src}
                    alt="Verified Customers"
                    className="w-6 h-6 shrink-0"
                  />
                </div>
                <h3 className="text-base font-semibold text-black mb-1.5">
                  Verified Customers
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  KYC-checked tenants to ensure only safe and reliable
                  transactions.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
             
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                  <img
                    src={truckVendorIcon.src}
                    alt="Logistics Support"
                    className="w-6 h-6 shrink-0"
                  />
                </div>
                <h3 className="text-base font-semibold text-black mb-1.5">
                  Logistics Support
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  We handle pickup &amp; drop for hassle-free rental operations.
                </p>
              </div>
            </div>
          </div>
        </section> */}
        <section className="bg-gray-50 border-t border-gray-100 py-10 lg:py-14">
          <div className="w-full mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-manrope font-bold text-black">
                Why Partner with Us?
              </h2>
              {/* <p className="text-sm font-semibold text-gray-500 mt-2 max-w-md mx-auto">
                Everything you need to grow your rental business, backed by our
                platform.
              </p> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Guaranteed Payments */}
              <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-5 shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-black mb-1.5">
                  Guaranteed Payments
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  On-time monthly payouts with transparent settlement reports.
                </p>
              </div>

              {/* Verified Customers */}
              <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-5 shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-black mb-1.5">
                  Verified Customers
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  KYC-checked tenants to ensure only safe and reliable
                  transactions.
                </p>
              </div>

              {/* Logistics Support */}
              <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-5 shadow-md shadow-amber-200 group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-black mb-1.5">
                  Logistics Support
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We handle pickup &amp; drop for hassle-free rental operations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Single centered modal overlay */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            backgroundColor: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div>{modalContent()}</div>
        </div>
      )}
    </div>
  );
};

export default VendorMain;
