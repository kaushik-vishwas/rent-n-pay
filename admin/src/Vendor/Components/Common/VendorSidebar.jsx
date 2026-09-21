// // 'use client';

// // import React, { useState } from 'react';
// // import Link from 'next/link';
// // import { usePathname, useRouter } from 'next/navigation';
// // import { useDispatch } from 'react-redux';
// // import { vendorLogout } from '../../../redux/slices/vendorSlice';
// // import dashboardIcon from '@/assets/icons/dashboard.png';
// // import kycIcon from '@/assets/icons/kyc.png';
// // import storesIcon from '@/assets/icons/stores.png';
// // import productsIcon from '@/assets/icons/products.png';
// // import ordersIcon from '@/assets/icons/orders.png';
// // import EarningIcon from '@/assets/icons/earningpayout.png';
// // import AdsplanIcon from '@/assets/icons/adsplan.png';
// // import SettingsIcon from '@/assets/icons/SettingsIcon.png';
// // import customersIcon from '@/assets/icons/customers.png';
// // import ticketsIcon from '@/assets/icons/tickets.png';
// // import offersIcon from '@/assets/icons/offers.png';
// // import { LogOut, Store, Users } from 'lucide-react';

// // const navItems = [
// //   { to: '/vendor-dashboard', label: 'Dashboard' },
// //   { to: '/vendor-kyc-status', label: 'KYC & Verification' },
// //   { to: '/vendor/stores', label: 'Stores' },
// //   { to: '/vendor-products', label: 'Products' },
// //   { to: '/vendor/orders', label: 'Orders' },
// //   { to: '/vendor/customers', label: 'Customers' },
// //   { to: '/vendor/tickets', label: 'Tickets' },
// //   { to: '/vendor/offers', label: 'Offers' },
// //   { to: '/vendor/earnings-payout', label: 'Earnings & Payout' },
// //   { to: '/vendor/ads-plans', label: 'Ads Plans' },
// //   { to: '/vendor/settings', label: 'Settings' },
// // ];

// // const VendorSidebar = () => {
// //   const [mobileOpen, setMobileOpen] = useState(false);
// //   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
// //   const dispatch = useDispatch();
// //   const router = useRouter();
// //   const pathname = usePathname();

// //   const handleLogout = async () => {
// //     await dispatch(vendorLogout());
// //     router.replace('/vendor-main');
// //   };

// //   return (
// //     <>
// //       {/* <button
// //         onClick={() => setMobileOpen((v) => !v)}
// //         className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm"
// //       >
// //         {mobileOpen ? '✕' : '☰'}
// //       </button> */}
// //       {/* {mobileOpen ? (
// //         <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white z-40" />
// //       ) : null}
// //       <button
// //         onClick={() => setMobileOpen((v) => !v)}
// //         className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
// //           mobileOpen
// //             ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
// //             : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
// //         }`}
// //       >
// //         {mobileOpen ? '✕' : '☰'}
// //       </button> */}
// //       <button
// //         onClick={() => setMobileOpen((v) => !v)}
// //         className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
// //           mobileOpen
// //             ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
// //             : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
// //         }`}
// //       >
// //         {mobileOpen ? '✕' : '☰'}
// //       </button>

// //       {mobileOpen ? (
// //         <div
// //           className="md:hidden fixed inset-0 bg-black/40 z-30"
// //           onClick={() => setMobileOpen(false)}
// //         />
// //       ) : null}

// //       <aside
// //         className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 h-screen flex flex-col transform transition-transform duration-200 ${
// //           mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
// //         }`}
// //       >
// //         {/* <div className="px-5 py-4 flex items-center gap-2 border-b border-gray-100">
// //           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
// //             R
// //           </div>

// //           <div className="flex flex-col leading-none">
// //             <p className="text-lg font-semibold text-black">Rentnpay</p>
// //             <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
// //           </div>
// //         </div> */}
// //         <Link
// //           href="/vendor-dashboard"
// //           onClick={() => setMobileOpen(false)}
// //           className="px-5 py-4 flex items-center gap-2 border-b border-gray-100"
// //         >
// //           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
// //             R
// //           </div>

// //           <div className="flex flex-col leading-none">
// //             <p className="text-lg font-semibold text-black">Rentnpay</p>
// //             <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
// //           </div>
// //         </Link>

// //         <nav className="flex-1 min-h-0 overflow-y-auto py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
// //           {navItems.map((item) => {
// //             const isActive =
// //               pathname === item.to ||
// //               (item.to === '/vendor/orders' &&
// //                 pathname?.startsWith('/vendor/orders')) ||
// //               (item.to === '/vendor/earnings-payout' &&
// //                 pathname?.startsWith('/vendor/earnings-payout'));
// //             return (
// //               <Link
// //                 key={item.to}
// //                 href={item.to}
// //                 onClick={() => setMobileOpen(false)}
// //                 className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${
// //                   isActive
// //                     ? 'bg-[#FF7020] text-white font-medium shadow-sm'
// //                     : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
// //                 }`}
// //               >
// //                 {item.label === 'Dashboard' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={dashboardIcon.src}
// //                       alt="Dashboard"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'KYC & Verification' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={kycIcon.src}
// //                       alt="KYC & Verification"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Stores' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <Store
// //                       className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
// //                       strokeWidth={1.75}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Products' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={productsIcon.src}
// //                       alt="Products"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Orders' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={ordersIcon.src}
// //                       alt="Orders"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Customers' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <Users
// //                       className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
// //                       strokeWidth={1.75}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Tickets' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={ticketsIcon.src}
// //                       alt="Tickets"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Earnings & Payout' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={EarningIcon.src}
// //                       alt="Earnings & Payout"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Ads Plans' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={AdsplanIcon.src}
// //                       alt="AdsPlans"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Settings' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={SettingsIcon.src}
// //                       alt="Settings"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : item.label === 'Offers' ? (
// //                   <span className="inline-flex items-center gap-2">
// //                     <img
// //                       src={offersIcon.src}
// //                       alt="Offers"
// //                       className={`w-4 h-4 object-contain ${
// //                         isActive ? 'brightness-0 invert' : ''
// //                       }`}
// //                     />
// //                     <span>{item.label}</span>
// //                   </span>
// //                 ) : (
// //                   item.label
// //                 )}
// //               </Link>
// //             );
// //           })}
// //         </nav>

// //         <div className="border-t border-gray-100 p-4 flex items-center justify-between text-xs text-gray-600">
// //           <button
// //             onClick={() => setShowLogoutConfirm(true)}
// //             className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
// //           >
// //             <LogOut className="h-4 w-4" strokeWidth={2} />
// //             <span className="text-sm font-bold">Logout</span>
// //           </button>
// //         </div>
// //       </aside>

// //       {showLogoutConfirm ? (
// //         <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
// //           <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200">
// //             <div className="px-5 py-4 border-b border-gray-100">
// //               <h3 className="text-lg font-semibold text-gray-900">Log Out</h3>
// //               <p className="text-sm text-gray-500 mt-1">
// //                 Are you sure you want to log out of your vendor account?
// //               </p>
// //             </div>
// //             <div className="px-5 py-4 flex items-center justify-end gap-2">
// //               <button
// //                 onClick={() => setShowLogoutConfirm(false)}
// //                 className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={() => {
// //                   setShowLogoutConfirm(false);
// //                   handleLogout();
// //                 }}
// //                 className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
// //               >
// //                 Yes, Log Out
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       ) : null}
// //     </>
// //   );
// // };

// // export default VendorSidebar;

// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import { vendorLogout } from '../../../redux/slices/vendorSlice';
// import { apiGetVendorNotifications } from '../../../service/api';
// import dashboardIcon from '@/assets/icons/dashboard.png';
// import kycIcon from '@/assets/icons/kyc.png';
// import storesIcon from '@/assets/icons/stores.png';
// import productsIcon from '@/assets/icons/products.png';
// import ordersIcon from '@/assets/icons/orders.png';
// import EarningIcon from '@/assets/icons/earningpayout.png';
// import AdsplanIcon from '@/assets/icons/adsplan.png';
// import SettingsIcon from '@/assets/icons/SettingsIcon.png';
// import customersIcon from '@/assets/icons/customers.png';
// import ticketsIcon from '@/assets/icons/tickets.png';
// import offersIcon from '@/assets/icons/offers.png';
// import { LogOut, Store, Users } from 'lucide-react';

// function clearedStorageKey(vendorId) {
//   const id = vendorId || 'session';
//   return `vendorNotifLastClearedAt:${id}`;
// }

// const navItems = [
//   { to: '/vendor-dashboard', label: 'Dashboard' },
//   { to: '/vendor-kyc-status', label: 'KYC & Verification' },
//   { to: '/vendor/stores', label: 'Stores' },
//   { to: '/vendor-products', label: 'Products' },
//   { to: '/vendor/orders', label: 'Orders' },
//   { to: '/vendor/customers', label: 'Customers' },
//   { to: '/vendor/tickets', label: 'Tickets' },
//   { to: '/vendor/offers', label: 'Offers' },
//   { to: '/vendor/earnings-payout', label: 'Earnings & Payout' },
//   { to: '/vendor/ads-plans', label: 'Ads Plans' },
//   { to: '/vendor/settings', label: 'Settings' },
// ];
// const VendorSidebar = () => {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [hasNewOrder, setHasNewOrder] = useState(false);
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const pathname = usePathname();
//   const { user } = useSelector((state) => state.vendor);

//   const checkNewOrders = useCallback(async () => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) return;
//     try {
//       const { data } = await apiGetVendorNotifications(token);
//       const list = Array.isArray(data?.notifications) ? data.notifications : [];
//       const vendorId = user?._id || user?.id || '';
//       let clearedMs = null;
//       try {
//         const raw = localStorage.getItem(clearedStorageKey(vendorId));
//         if (raw) {
//           const t = new Date(raw).getTime();
//           if (!Number.isNaN(t)) clearedMs = t;
//         }
//       } catch {
//         clearedMs = null;
//       }
//       const hasUnseenOrder = list.some((n) => {
//         if (n.type !== 'order') return false;
//         const t = new Date(n.at).getTime();
//         if (clearedMs == null) return true;
//         return !Number.isNaN(t) && t > clearedMs;
//       });
//       setHasNewOrder(hasUnseenOrder);
//     } catch {
//       /* silent */
//     }
//   }, [user]);

//   useEffect(() => {
//     checkNewOrders();
//     const id = setInterval(checkNewOrders, 30_000);
//     return () => clearInterval(id);
//   }, [checkNewOrders]);

//   useEffect(() => {
//     const onOrdersChanged = () => checkNewOrders();
//     window.addEventListener('vendor-orders-changed', onOrdersChanged);
//     return () =>
//       window.removeEventListener('vendor-orders-changed', onOrdersChanged);
//   }, [checkNewOrders]);

//   // useEffect(() => {
//   //   if (pathname?.startsWith('/vendor/orders')) {
//   //     setHasNewOrder(false);
//   //   }
//   // }, [pathname]);
//   useEffect(() => {
//     if (pathname?.startsWith('/vendor/orders')) {
//       try {
//         const vendorId = user?._id || user?.id || '';
//         localStorage.setItem(
//           clearedStorageKey(vendorId),
//           new Date().toISOString(),
//         );
//       } catch {
//         /* ignore */
//       }
//       setHasNewOrder(false);
//     }
//   }, [pathname, user]);

//   const handleLogout = async () => {
//     await dispatch(vendorLogout());
//     router.replace('/vendor-main');
//   };

//   return (
//     <>
//       {/* <button
//         onClick={() => setMobileOpen((v) => !v)}
//         className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm"
//       >
//         {mobileOpen ? '✕' : '☰'}
//       </button> */}
//       {/* {mobileOpen ? (
//         <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white z-40" />
//       ) : null}
//       <button
//         onClick={() => setMobileOpen((v) => !v)}
//         className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
//           mobileOpen
//             ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
//             : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
//         }`}
//       >
//         {mobileOpen ? '✕' : '☰'}
//       </button> */}
//       <button
//         onClick={() => setMobileOpen((v) => !v)}
//         className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
//           mobileOpen
//             ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
//             : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
//         }`}
//       >
//         {mobileOpen ? '✕' : '☰'}
//       </button>

//       {mobileOpen ? (
//         <div
//           className="md:hidden fixed inset-0 bg-black/40 z-30"
//           onClick={() => setMobileOpen(false)}
//         />
//       ) : null}

//       <aside
//         className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 h-screen flex flex-col transform transition-transform duration-200 ${
//           mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
//         }`}
//       >
//         {/* <div className="px-5 py-4 flex items-center gap-2 border-b border-gray-100">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
//             R
//           </div>

//           <div className="flex flex-col leading-none">
//             <p className="text-lg font-semibold text-black">Rentnpay</p>
//             <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
//           </div>
//         </div> */}
//         <Link
//           href="/vendor-dashboard"
//           onClick={() => setMobileOpen(false)}
//           className="px-5 py-4 flex items-center gap-2 border-b border-gray-100"
//         >
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
//             R
//           </div>

//           <div className="flex flex-col leading-none">
//             <p className="text-lg font-semibold text-black">Rentnpay</p>
//             <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
//           </div>
//         </Link>

//         <nav className="flex-1 min-h-0 overflow-y-auto py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//           {navItems.map((item) => {
//             const isActive =
//               pathname === item.to ||
//               (item.to === '/vendor/orders' &&
//                 pathname?.startsWith('/vendor/orders')) ||
//               (item.to === '/vendor/earnings-payout' &&
//                 pathname?.startsWith('/vendor/earnings-payout'));
//             return (
//               <Link
//                 key={item.to}
//                 href={item.to}
//                 onClick={() => setMobileOpen(false)}
//                 className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${
//                   isActive
//                     ? 'bg-[#FF7020] text-white font-medium shadow-sm'
//                     : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
//                 }`}
//               >
//                 {item.label === 'Dashboard' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={dashboardIcon.src}
//                       alt="Dashboard"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'KYC & Verification' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={kycIcon.src}
//                       alt="KYC & Verification"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Stores' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <Store
//                       className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
//                       strokeWidth={1.75}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Products' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={productsIcon.src}
//                       alt="Products"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Orders' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={ordersIcon.src}
//                       alt="Orders"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                     {hasNewOrder ? (
//                       <span className="relative flex h-2.5 w-2.5">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
//                       </span>
//                     ) : null}
//                   </span>
//                 ) : item.label === 'Customers' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <Users
//                       className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
//                       strokeWidth={1.75}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Tickets' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={ticketsIcon.src}
//                       alt="Tickets"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Earnings & Payout' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={EarningIcon.src}
//                       alt="Earnings & Payout"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Ads Plans' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={AdsplanIcon.src}
//                       alt="AdsPlans"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Settings' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={SettingsIcon.src}
//                       alt="Settings"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Offers' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={offersIcon.src}
//                       alt="Offers"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : (
//                   item.label
//                 )}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="border-t border-gray-100 p-4 flex items-center justify-between text-xs text-gray-600">
//           <button
//             onClick={() => setShowLogoutConfirm(true)}
//             className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
//           >
//             <LogOut className="h-4 w-4" strokeWidth={2} />
//             <span className="text-sm font-bold">Logout</span>
//           </button>
//         </div>
//       </aside>

//       {showLogoutConfirm ? (
//         <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//           <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200">
//             <div className="px-5 py-4 border-b border-gray-100">
//               <h3 className="text-lg font-semibold text-gray-900">Log Out</h3>
//               <p className="text-sm text-gray-500 mt-1">
//                 Are you sure you want to log out of your vendor account?
//               </p>
//             </div>
//             <div className="px-5 py-4 flex items-center justify-end gap-2">
//               <button
//                 onClick={() => setShowLogoutConfirm(false)}
//                 className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   setShowLogoutConfirm(false);
//                   handleLogout();
//                 }}
//                 className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
//               >
//                 Yes, Log Out
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </>
//   );
// };

// export default VendorSidebar;

// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useDispatch } from 'react-redux';
// import { vendorLogout } from '../../../redux/slices/vendorSlice';
// import dashboardIcon from '@/assets/icons/dashboard.png';
// import kycIcon from '@/assets/icons/kyc.png';
// import storesIcon from '@/assets/icons/stores.png';
// import productsIcon from '@/assets/icons/products.png';
// import ordersIcon from '@/assets/icons/orders.png';
// import EarningIcon from '@/assets/icons/earningpayout.png';
// import AdsplanIcon from '@/assets/icons/adsplan.png';
// import SettingsIcon from '@/assets/icons/SettingsIcon.png';
// import customersIcon from '@/assets/icons/customers.png';
// import ticketsIcon from '@/assets/icons/tickets.png';
// import offersIcon from '@/assets/icons/offers.png';
// import { LogOut, Store, Users } from 'lucide-react';

// const navItems = [
//   { to: '/vendor-dashboard', label: 'Dashboard' },
//   { to: '/vendor-kyc-status', label: 'KYC & Verification' },
//   { to: '/vendor/stores', label: 'Stores' },
//   { to: '/vendor-products', label: 'Products' },
//   { to: '/vendor/orders', label: 'Orders' },
//   { to: '/vendor/customers', label: 'Customers' },
//   { to: '/vendor/tickets', label: 'Tickets' },
//   { to: '/vendor/offers', label: 'Offers' },
//   { to: '/vendor/earnings-payout', label: 'Earnings & Payout' },
//   { to: '/vendor/ads-plans', label: 'Ads Plans' },
//   { to: '/vendor/settings', label: 'Settings' },
// ];

// const VendorSidebar = () => {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const pathname = usePathname();

//   const handleLogout = async () => {
//     await dispatch(vendorLogout());
//     router.replace('/vendor-main');
//   };

//   return (
//     <>
//       {/* <button
//         onClick={() => setMobileOpen((v) => !v)}
//         className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm"
//       >
//         {mobileOpen ? '✕' : '☰'}
//       </button> */}
//       {/* {mobileOpen ? (
//         <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white z-40" />
//       ) : null}
//       <button
//         onClick={() => setMobileOpen((v) => !v)}
//         className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
//           mobileOpen
//             ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
//             : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
//         }`}
//       >
//         {mobileOpen ? '✕' : '☰'}
//       </button> */}
//       <button
//         onClick={() => setMobileOpen((v) => !v)}
//         className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
//           mobileOpen
//             ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
//             : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
//         }`}
//       >
//         {mobileOpen ? '✕' : '☰'}
//       </button>

//       {mobileOpen ? (
//         <div
//           className="md:hidden fixed inset-0 bg-black/40 z-30"
//           onClick={() => setMobileOpen(false)}
//         />
//       ) : null}

//       <aside
//         className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 h-screen flex flex-col transform transition-transform duration-200 ${
//           mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
//         }`}
//       >
//         {/* <div className="px-5 py-4 flex items-center gap-2 border-b border-gray-100">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
//             R
//           </div>

//           <div className="flex flex-col leading-none">
//             <p className="text-lg font-semibold text-black">Rentnpay</p>
//             <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
//           </div>
//         </div> */}
//         <Link
//           href="/vendor-dashboard"
//           onClick={() => setMobileOpen(false)}
//           className="px-5 py-4 flex items-center gap-2 border-b border-gray-100"
//         >
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
//             R
//           </div>

//           <div className="flex flex-col leading-none">
//             <p className="text-lg font-semibold text-black">Rentnpay</p>
//             <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
//           </div>
//         </Link>

//         <nav className="flex-1 min-h-0 overflow-y-auto py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//           {navItems.map((item) => {
//             const isActive =
//               pathname === item.to ||
//               (item.to === '/vendor/orders' &&
//                 pathname?.startsWith('/vendor/orders')) ||
//               (item.to === '/vendor/earnings-payout' &&
//                 pathname?.startsWith('/vendor/earnings-payout'));
//             return (
//               <Link
//                 key={item.to}
//                 href={item.to}
//                 onClick={() => setMobileOpen(false)}
//                 className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${
//                   isActive
//                     ? 'bg-[#FF7020] text-white font-medium shadow-sm'
//                     : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
//                 }`}
//               >
//                 {item.label === 'Dashboard' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={dashboardIcon.src}
//                       alt="Dashboard"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'KYC & Verification' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={kycIcon.src}
//                       alt="KYC & Verification"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Stores' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <Store
//                       className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
//                       strokeWidth={1.75}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Products' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={productsIcon.src}
//                       alt="Products"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Orders' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={ordersIcon.src}
//                       alt="Orders"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Customers' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <Users
//                       className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
//                       strokeWidth={1.75}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Tickets' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={ticketsIcon.src}
//                       alt="Tickets"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Earnings & Payout' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={EarningIcon.src}
//                       alt="Earnings & Payout"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Ads Plans' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={AdsplanIcon.src}
//                       alt="AdsPlans"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Settings' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={SettingsIcon.src}
//                       alt="Settings"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : item.label === 'Offers' ? (
//                   <span className="inline-flex items-center gap-2">
//                     <img
//                       src={offersIcon.src}
//                       alt="Offers"
//                       className={`w-4 h-4 object-contain ${
//                         isActive ? 'brightness-0 invert' : ''
//                       }`}
//                     />
//                     <span>{item.label}</span>
//                   </span>
//                 ) : (
//                   item.label
//                 )}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="border-t border-gray-100 p-4 flex items-center justify-between text-xs text-gray-600">
//           <button
//             onClick={() => setShowLogoutConfirm(true)}
//             className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
//           >
//             <LogOut className="h-4 w-4" strokeWidth={2} />
//             <span className="text-sm font-bold">Logout</span>
//           </button>
//         </div>
//       </aside>

//       {showLogoutConfirm ? (
//         <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//           <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200">
//             <div className="px-5 py-4 border-b border-gray-100">
//               <h3 className="text-lg font-semibold text-gray-900">Log Out</h3>
//               <p className="text-sm text-gray-500 mt-1">
//                 Are you sure you want to log out of your vendor account?
//               </p>
//             </div>
//             <div className="px-5 py-4 flex items-center justify-end gap-2">
//               <button
//                 onClick={() => setShowLogoutConfirm(false)}
//                 className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   setShowLogoutConfirm(false);
//                   handleLogout();
//                 }}
//                 className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
//               >
//                 Yes, Log Out
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </>
//   );
// };

// export default VendorSidebar;

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { vendorLogout } from '../../../redux/slices/vendorSlice';
import { apiGetVendorNotifications } from '../../../service/api';
import dashboardIcon from '@/assets/icons/dashboard.png';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';
import kycIcon from '@/assets/icons/kyc.png';
import storesIcon from '@/assets/icons/stores.png';
import productsIcon from '@/assets/icons/products.png';
import ordersIcon from '@/assets/icons/orders.png';
import EarningIcon from '@/assets/icons/earningpayout.png';
import AdsplanIcon from '@/assets/icons/adsplan.png';
import SettingsIcon from '@/assets/icons/SettingsIcon.png';
import customersIcon from '@/assets/icons/customers.png';
import ticketsIcon from '@/assets/icons/tickets.png';
import offersIcon from '@/assets/icons/offers.png';
import { LogOut, Store, Users, ChevronDown, ChevronRight } from 'lucide-react';

function clearedStorageKey(vendorId) {
  const id = vendorId || 'session';
  return `vendorNotifLastClearedAt:${id}`;
}

const navItems = [
  { to: '/vendor-dashboard', label: 'Dashboard' },
  { to: '/vendor-kyc-status', label: 'KYC & Verification' },
  { to: '/vendor/stores', label: 'Stores' },
  { to: '/vendor-products', label: 'Products' },
  { to: '/vendor/orders', label: 'Orders' },
  { to: '/vendor/customers', label: 'Customers' },
  { to: '/vendor/tickets', label: 'Tickets' },
  { to: '/vendor/offers', label: 'Offers' },
  { to: '/vendor/earnings-payout', label: 'Earnings & Payout' },
  { to: '/vendor/ads-plans', label: 'Ads Plans' },
  // { to: '/vendor/earnings-payout/settlement', label: 'settlement' },
  { to: '/vendor/settings', label: 'Settings' },
];
const VendorSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [earningsOpen, setEarningsOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.vendor);

  const checkNewOrders = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) return;
    try {
      const { data } = await apiGetVendorNotifications(token);
      const list = Array.isArray(data?.notifications) ? data.notifications : [];
      const vendorId = user?._id || user?.id || '';
      let clearedMs = null;
      try {
        const raw = localStorage.getItem(clearedStorageKey(vendorId));
        if (raw) {
          const t = new Date(raw).getTime();
          if (!Number.isNaN(t)) clearedMs = t;
        }
      } catch {
        clearedMs = null;
      }
      // const hasUnseenOrder = list.some((n) => {
      //   if (n.type !== 'order') return false;
      //   const t = new Date(n.at).getTime();
      //   if (clearedMs == null) return true;
      //   return !Number.isNaN(t) && t > clearedMs;
      // });
      const hasUnseenOrder = list.some((n) => {
        if (n.type !== 'order' && n.type !== 'service_booking') return false;
        const t = new Date(n.at).getTime();
        if (clearedMs == null) return true;
        return !Number.isNaN(t) && t > clearedMs;
      });
      setHasNewOrder(hasUnseenOrder);
    } catch {
      /* silent */
    }
  }, [user]);

  useEffect(() => {
    checkNewOrders();
    const id = setInterval(checkNewOrders, 30_000);
    return () => clearInterval(id);
  }, [checkNewOrders]);

  useEffect(() => {
    const onOrdersChanged = () => checkNewOrders();
    window.addEventListener('vendor-orders-changed', onOrdersChanged);
    return () =>
      window.removeEventListener('vendor-orders-changed', onOrdersChanged);
  }, [checkNewOrders]);

  // useEffect(() => {
  //   if (pathname?.startsWith('/vendor/orders')) {
  //     setHasNewOrder(false);
  //   }
  // }, [pathname]);
  useEffect(() => {
    if (pathname?.startsWith('/vendor/orders')) {
      try {
        const vendorId = user?._id || user?.id || '';
        localStorage.setItem(
          clearedStorageKey(vendorId),
          new Date().toISOString(),
        );
      } catch {
        /* ignore */
      }
      setHasNewOrder(false);
    }
  }, [pathname, user]);

  useEffect(() => {
    if (pathname?.startsWith('/vendor/earnings-payout')) {
      setEarningsOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await dispatch(vendorLogout());
    router.replace('/vendor-main');
  };

  return (
    <>
      {/* <button
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm"
      >
        {mobileOpen ? '✕' : '☰'}
      </button> */}
      {/* {mobileOpen ? (
        <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white z-40" />
      ) : null}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
          mobileOpen
            ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
            : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
        }`}
      >
        {mobileOpen ? '✕' : '☰'}
      </button> */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className={`md:hidden fixed top-3 z-50 w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
          mobileOpen
            ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
            : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
        }`}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {mobileOpen ? (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 h-screen flex flex-col transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      > */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 h-[100dvh] md:h-screen flex flex-col transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* <div className="px-5 py-4 flex items-center gap-2 border-b border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
            R
          </div>

          <div className="flex flex-col leading-none">
            <p className="text-lg font-semibold text-black">Rentnpay</p>
            <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
          </div>
        </div> */}
        {/* <Link
          href="/vendor-dashboard"
          onClick={() => setMobileOpen(false)}
          className="px-5 py-4 flex items-center gap-2 border-b border-gray-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-2xl font-bold text-white">
            R
          </div>

          <div className="flex flex-col leading-none"> */}
        <Link
          href="/vendor-dashboard"
          onClick={() => setMobileOpen(false)}
          className="px-5 py-4 flex items-center gap-2 border-b border-gray-100"
        >
          <img
            src={RentnpayLogo.src}
            alt="Rentnpay"
            className="h-10 w-10 shrink-0 object-contain"
          />

          <div className="flex flex-col leading-none">
            <p className="text-lg font-semibold text-black">Rentnpay</p>
            <p className="text-sm font-semibold text-gray-500">Vendor Portal</p>
          </div>
        </Link>

        <nav className="flex-1 min-h-0 overflow-y-auto py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map((item) => {
            // const isActive =
            //   pathname === item.to ||
            //   (item.to === '/vendor/orders' &&
            //     pathname?.startsWith('/vendor/orders')) ||
            //   (item.to === '/vendor/earnings-payout' &&
            //     pathname?.startsWith('/vendor/earnings-payout'));
            const isActive =
              pathname === item.to ||
              pathname?.startsWith(`${item.to}/`) ||
              (item.to === '/vendor/earnings-payout' &&
                pathname?.startsWith('/vendor/earnings-payout'));

            if (item.to === '/vendor/earnings-payout') {
              return (
                <div className="mx-2 mt-1" key={item.to}>
                  <button
                    type="button"
                    onClick={() => setEarningsOpen((v) => !v)}
                    className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-[#FF7020] text-white font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <img
                        src={EarningIcon.src}
                        alt="Earnings & Payout"
                        className={`w-4 h-4 object-contain ${
                          isActive ? 'brightness-0 invert' : ''
                        }`}
                      />
                      <span>{item.label}</span>
                    </span>
                    {earningsOpen ? (
                      <ChevronDown
                        size={18}
                        className={isActive ? 'text-white' : 'text-gray-400'}
                      />
                    ) : (
                      <ChevronRight
                        size={18}
                        className={isActive ? 'text-white' : 'text-gray-400'}
                      />
                    )}
                  </button>
                  {earningsOpen ? (
                    <div className="mt-1 ml-2 space-y-0.5">
                      {[
                        {
                          to: '/vendor/earnings-payout/transaction',
                          label: 'Transaction',
                        },
                        {
                          to: '/vendor/earnings-payout/refunds',
                          label: 'Refunds',
                        },
                        {
                          to: '/vendor/earnings-payout/settlements',
                          label: 'Settlements',
                        },
                        {
                          to: '/vendor/earnings-payout/cancellation',
                          label: 'Cancellation',
                        },
                      ].map((child) => (
                        <Link
                          key={child.to}
                          href={child.to}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
                            pathname === child.to
                              ? 'bg-orange-50 text-orange-600 font-medium'
                              : ''
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setMobileOpen(false)}
                className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${
                  isActive
                    ? 'bg-[#FF7020] text-white font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {item.label === 'Dashboard' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={dashboardIcon.src}
                      alt="Dashboard"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : item.label === 'KYC & Verification' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={kycIcon.src}
                      alt="KYC & Verification"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : item.label === 'Stores' ? (
                  <span className="inline-flex items-center gap-2">
                    <Store
                      className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
                      strokeWidth={1.75}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : item.label === 'Products' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={productsIcon.src}
                      alt="Products"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : item.label === 'Orders' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={ordersIcon.src}
                      alt="Orders"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                    {hasNewOrder ? (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                    ) : null}
                  </span>
                ) : item.label === 'Customers' ? (
                  <span className="inline-flex items-center gap-2">
                    <Users
                      className={`${isActive ? 'text-white' : 'text-gray-600'} h-4 w-4`}
                      strokeWidth={1.75}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : item.label === 'Tickets' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={ticketsIcon.src}
                      alt="Tickets"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : // ) : item.label === 'Earnings & Payout' ? (
                //   <span className="inline-flex items-center gap-2">
                //     <img
                //       src={EarningIcon.src}
                //       alt="Earnings & Payout"
                //       className={`w-4 h-4 object-contain ${
                //         isActive ? 'brightness-0 invert' : ''
                //       }`}
                //     />
                //     <span>{item.label}</span>
                //   </span>
                item.label === 'Ads Plans' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={AdsplanIcon.src}
                      alt="AdsPlans"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : item.label === 'Settings' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={SettingsIcon.src}
                      alt="Settings"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : item.label === 'Offers' ? (
                  <span className="inline-flex items-center gap-2">
                    <img
                      src={offersIcon.src}
                      alt="Offers"
                      className={`w-4 h-4 object-contain ${
                        isActive ? 'brightness-0 invert' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            );
          })}
        </nav>

        {/* <div className="border-t border-gray-100 p-4 flex items-center justify-between text-xs text-gray-600">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div> */}
        <div
          className="border-t border-gray-100 p-4 flex items-center justify-between text-xs text-gray-600 shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Log Out</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to log out of your vendor account?
              </p>
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default VendorSidebar;
