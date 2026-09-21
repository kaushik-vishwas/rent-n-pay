// 'use client';

// import React, { Suspense, useEffect, useMemo, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useSelector } from 'react-redux';
// import ReferralDashboard from '@/assets/icons/referraldashboard.png';
// import StartRenting from '@/assets/icons/startrenting.png';
// import {
//   User,
//   MapPin,
//   Truck,
//   Sofa,
//   User2,
//   ChevronDown,
//   Loader2,
//   ArrowBigUp,
//   Users,
//   RefreshCcw,
//   CircleX,
//   Wrench,
//   ChevronRight,
//   ArrowLeft,
//   SquarePen,
//   UserRoundPen,
//   PackageOpen,
//   Package,
//   ReceiptText,
//   Wallet,
//   ClipboardList,
//   BookOpen,
//   CreditCard,
//   Percent,
// } from 'lucide-react';

// // Each tab's content is its own file under components/account/.
// // dynamic() means a tab's code only downloads when that tab is opened.
// const DashboardSection = dynamic(
//   () => import('@/components/Account/Dashboard'),
//   {
//     loading: () => <SectionLoader />,
//   },
// );
// const SubscriptionSection = dynamic(
//   () => import('@/components/Account/Dashboard'),
//   {
//     loading: () => <SectionLoader />,
//   },
// );
// const ProfileSection = dynamic(() => import('@/components/Account/Profile'), {
//   loading: () => <SectionLoader />,
// });
// const AddressSection = dynamic(() => import('@/components/Account/Address'), {
//   loading: () => <SectionLoader />,
// });
// const OrdersSection = dynamic(() => import('@/components/Account/Orders'), {
//   loading: () => <SectionLoader />,
// });
// const RentalsSection = dynamic(
//   () => import('@/components/Account/RentalCommand'),
//   { loading: () => <SectionLoader /> },
// );
// const MyRefundsSection = dynamic(
//   () => import('@/components/Account/MyRefunds'),
//   { loading: () => <SectionLoader /> },
// );
// const MyInvoiceSection = dynamic(
//   () => import('@/components/Account/MyInvoices'),
//   { loading: () => <SectionLoader /> },
// );
// const AllRequestsSection = dynamic(
//   () => import('@/components/Account/AllRequests'),
//   { loading: () => <SectionLoader /> },
// );
// const ReferralSection = dynamic(
//   () => import('@/components/Account/ReferralSection'),
//   { loading: () => <SectionLoader /> },
// );

// const CreateRequest = dynamic(
//   () => import('@/components/Account/ReferralSection'),
//   { loading: () => <SectionLoader /> },
// );

// const RentoMoney = dynamic(() => import('@/components/Account/RentoMoney'), {
//   loading: () => <SectionLoader />,
// });

// const DepositLedgerSection = dynamic(
//   () => import('@/components/Account/DepositLedger'),
//   { loading: () => <SectionLoader /> },
// );

// const AutoDebitPanel = dynamic(
//   () => import('@/components/Account/AutoDebitPanel'),
//   { loading: () => <SectionLoader /> },
// );

// const AdvanceRentalPanel = dynamic(
//   () => import('@/components/Account/AdvanceRentalPanel'),
//   { loading: () => <SectionLoader /> },
// );

// const MyReferralsSection = dynamic(
//   () => import('@/components/Account/MyReferrals'),
//   { loading: () => <SectionLoader /> },
// );
// const TABS = [
//   {
//     key: 'dashboard',
//     label: 'Dashboard',
//     icon: User,
//     Component: DashboardSection,
//   },
//   {
//     key: 'subscription',
//     label: 'My Subscription',
//     icon: PackageOpen,
//     Component: SubscriptionSection,
//   },
//   {
//     key: 'profile',
//     label: 'My Profile',
//     icon: UserRoundPen,
//     Component: ProfileSection,
//   },
//   {
//     key: 'easyPayment',
//     label: 'Easy Payment',
//     icon: CreditCard,
//     Component: null,
//   },
//   // {
//   //   key: 'address',
//   //   label: 'My Address',
//   //   icon: MapPin,
//   //   Component: AddressSection,
//   // },
//   // { key: 'orders', label: 'My Orders', icon: Truck, Component: OrdersSection },
//   { key: 'orders', label: 'My Orders', icon: Truck, Component: OrdersSection },
//   // {
//   //   key: 'rentals',
//   //   label: 'Rental Products',
//   //   icon: Sofa,
//   //   Component: RentalsSection,
//   // },
//   {
//     key: 'referral',
//     label: 'Referral',
//     icon: Users,
//     Component: ReferralSection,
//   },
//   {
//     key: 'createRequest',
//     label: 'Create Request',
//     icon: SquarePen,
//     Component: CreateRequest,
//   },
//   {
//     key: 'rentoMoney',
//     label: 'Rent Money',
//     icon: RefreshCcw,
//     Component: RentoMoney,
//   },
// ];

// const SUBSCRIPTION_SUBTABS = [
//   {
//     key: 'manage-rental-items',
//     label: 'Live Orders',
//     icon: Package,
//   },
//   {
//     key: 'invoices',
//     label: 'Invoices',
//     icon: ReceiptText,
//   },
//   {
//     key: 'deposit-ledger',
//     label: 'Deposit Ledger',
//     icon: BookOpen,
//   },
//   {
//     key: 'my-refunds',
//     label: 'My Refunds',
//     icon: Wallet,
//   },
//   {
//     key: 'address',
//     label: 'My Address',
//     icon: MapPin,
//   },
//   {
//     key: 'all-requests',
//     label: 'All Requests',
//     icon: ClipboardList,
//   },
//   {
//     key: 'my-referral',
//     label: 'My Referral',
//     icon: Users,
//   },
// ];

// const EASY_PAYMENT_SUBTABS = [
//   {
//     key: 'auto-debit',
//     label: 'Auto Debit',
//     icon: RefreshCcw,
//   },
//   {
//     key: 'advance-rental',
//     label: 'Advance Rental',
//     icon: Percent,
//   },
// ];

// function SectionLoader() {
//   return (
//     <div className="flex min-h-[300px] items-center justify-center">
//       <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
//     </div>
//   );
// }

// function formatJoinDate(iso) {
//   if (!iso) return '';
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return '';
//   return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
// }

// // function MyAccountContent() {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const { user, isAuthenticated } = useSelector((s) => s.auth);

// //   const [activeTab, setActiveTab] = useState('profile');
// function MyAccountContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user, isAuthenticated } = useSelector((s) => s.auth);

//   const [mounted, setMounted] = useState(false);
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [mobileActiveBanner, setMobileActiveBanner] = useState(0);
//   const MOBILE_TOTAL_BANNERS = 2;
//   const [subscriptionOpen, setSubscriptionOpen] = useState(false);
//   const [createRequestOpen, setCreateRequestOpen] = useState(false);
//   const [easyPaymentOpen, setEasyPaymentOpen] = useState(false);
//   const [easyPaymentPanel, setEasyPaymentPanel] = useState(null);
//   const [showMobileContent, setShowMobileContent] = useState(false);

//   useEffect(() => {
//     document.body.style.overflow =
//       createRequestOpen || easyPaymentPanel ? 'hidden' : '';
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [createRequestOpen, easyPaymentPanel]);
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setMobileActiveBanner((prev) => (prev + 1) % MOBILE_TOTAL_BANNERS);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const t = searchParams.get('tab');
//     const isKnownTab =
//       TABS.some((x) => x.key === t) ||
//       SUBSCRIPTION_SUBTABS.some((x) => x.key === t);
//     const valid = isKnownTab ? t : 'dashboard';
//     setActiveTab(valid);

//     if (
//       valid === 'subscription' ||
//       SUBSCRIPTION_SUBTABS.some((x) => x.key === valid)
//     ) {
//       setSubscriptionOpen(true);
//     }
//     if (valid === 'my-referral') {
//       setSubscriptionOpen(true);
//     }
//   }, [searchParams]);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.replace('/');
//     }
//   }, [isAuthenticated, router]);

//   // const selectTab = (key) => {
//   //   setActiveTab(key);
//   //   router.replace(`/my-account?tab=${key}`, { scroll: false });
//   // };
//   const selectTab = (key) => {
//     setActiveTab(key);
//     setShowMobileContent(true);
//     router.replace(`/my-account?tab=${key}`, { scroll: false });
//   };

//   const closeMobileContent = () => {
//     setShowMobileContent(false);
//   };

//   // if (!isAuthenticated || !user) {
//   //   return <SectionLoader />;
//   // }
//   if (!mounted || !isAuthenticated || !user) {
//     return <SectionLoader />;
//   }

//   const firstLetter = user?.fullName?.charAt(0)?.toUpperCase() || '';
//   const joinDate = formatJoinDate(user?.createdAt);
//   const isSubscriptionSubTab =
//     SUBSCRIPTION_SUBTABS.some((s) => s.key === activeTab) ||
//     activeTab === 'my-referral';
//   const ActiveComponent =
//     activeTab === 'manage-rental-items'
//       ? RentalsSection
//       : activeTab === 'my-refunds'
//         ? MyRefundsSection
//         : activeTab === 'invoices'
//           ? MyInvoiceSection
//           : activeTab === 'all-requests'
//             ? AllRequestsSection
//             : activeTab === 'deposit-ledger'
//               ? DepositLedgerSection
//               : activeTab === 'address'
//                 ? AddressSection
//                 : activeTab === 'my-referral'
//                   ? MyReferralsSection
//                   : isSubscriptionSubTab
//                     ? SubscriptionSection
//                     : TABS.find((t) => t.key === activeTab)?.Component;

//   // const openReturn = searchParams.get('openReturn');
//   // const openReturnOrderId = searchParams.get('orderId');
//   // const openReturnProductId = searchParams.get('productId');
//   const openReturn =
//     typeof window !== 'undefined' ? searchParams.get('openReturn') : null;
//   const openReturnOrderId =
//     typeof window !== 'undefined' ? searchParams.get('orderId') : null;
//   const openReturnProductId =
//     typeof window !== 'undefined' ? searchParams.get('productId') : null;

//   return (
//     <div className="mx-auto w-full max-w-full px-4 py-6 sm:px-6 sm:py-8">
//       {/* Mobile-only profile summary - shown above the banner only on mobile */}
//       <div className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:hidden">
//         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-lg font-bold text-white">
//           {firstLetter}
//         </div>
//         <div className="min-w-0">
//           {/* <p className="truncate text-sm font-semibold text-black">
//             {user.fullName}
//           </p> */}
//           <p className="truncate text-sm font-semibold text-black">
//             {user.fullName?.split(' ')[0]}
//           </p>
//           {joinDate ? (
//             <p className="mt-0.5 text-xs text-gray-500">Joined - {joinDate}</p>
//           ) : null}
//         </div>
//       </div>

//       {/* Mobile-only top banner (Refer friends / Welcome) - always visible on mobile regardless of active tab */}
//       <div className="mb-4 md:hidden">
//         {mobileActiveBanner === 0 ? (
//           <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-4">
//             <div className="flex items-center gap-3">
//               <div className="flex h-14 w-14 shrink-0 items-center justify-center">
//                 <img
//                   src={ReferralDashboard.src}
//                   alt="Referral Dashboard"
//                   className="h-full w-full object-contain"
//                 />
//               </div>
//               <div className="min-w-0 flex-1">
//                 <p className="text-sm font-bold text-black">
//                   Refer your friends
//                 </p>
//                 <p className="text-base font-semibold text-orange-600">
//                   Earn up to ₹1,000
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => selectTab('referral')}
//                 className="shrink-0 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
//               >
//                 Refer
//               </button>
//             </div>

//             <div className="mt-3 flex items-center justify-center gap-2">
//               {Array.from({ length: MOBILE_TOTAL_BANNERS }).map((_, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   aria-label={`Show banner ${i + 1}`}
//                   onClick={() => setMobileActiveBanner(i)}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${
//                     mobileActiveBanner === i
//                       ? 'w-5 bg-orange-500'
//                       : 'w-1.5 bg-orange-200'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-4">
//             <div className="flex items-center gap-3">
//               <div className="flex h-14 w-14 shrink-0 items-center justify-center">
//                 <img
//                   src={StartRenting.src}
//                   alt="Start Renting"
//                   className="h-full w-full object-contain"
//                 />
//               </div>
//               <div className="min-w-0 flex-1">
//                 <p className="text-sm font-semibold text-black">
//                   Welcome,{' '}
//                   {/* <span className="font-bold text-orange-600">
//                     {user?.fullName || ''}
//                   </span> */}
//                   <span className="font-bold text-orange-600">
//                     {user?.fullName?.split(' ')[0] || ''}
//                   </span>
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => router.push('/rent')}
//                 className="shrink-0 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
//               >
//                 Start
//               </button>
//             </div>

//             <div className="mt-3 flex items-center justify-center gap-2">
//               {Array.from({ length: MOBILE_TOTAL_BANNERS }).map((_, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   aria-label={`Show banner ${i + 1}`}
//                   onClick={() => setMobileActiveBanner(i)}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${
//                     mobileActiveBanner === i
//                       ? 'w-5 bg-orange-500'
//                       : 'w-1.5 bg-orange-200'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="grid w-full max-w-full min-w-0 items-start gap-5 md:grid-cols-[260px_1fr] md:gap-6">
//         {/* Left sidebar */}
//         <aside className="min-w-0 md:sticky md:top-20 md:self-start">
//           <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
//             <div className="hidden items-center gap-3 border-b border-gray-100 px-4 py-4 md:flex">
//               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-lg font-bold text-white">
//                 {firstLetter}
//               </div>
//               <div className="min-w-0">
//                 {/* <p className="truncate text-sm font-semibold text-black">
//                   {user.fullName}
//                 </p> */}
//                 <p className="truncate text-sm font-semibold text-black">
//                   {user.fullName?.split(' ')[0]}
//                 </p>
//                 {joinDate ? (
//                   <p className="mt-0.5 text-xs text-gray-500">
//                     Joined - {joinDate}
//                   </p>
//                 ) : null}
//               </div>
//             </div>

//             <nav className="py-1">
//               {TABS.map(({ key, label, icon: Icon }) => {
//                 const active = activeTab === key;

//                 if (key === 'subscription') {
//                   return (
//                     <div key={key}>
//                       <button
//                         type="button"
//                         onClick={() => setSubscriptionOpen((prev) => !prev)}
//                         className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
//                           active
//                             ? 'border-r-2 border-orange-500 bg-orange-50 font-semibold text-orange-600'
//                             : 'text-gray-700 hover:bg-gray-50'
//                         }`}
//                       >
//                         <span className="flex items-center gap-2.5">
//                           <Icon
//                             size={16}
//                             className={
//                               active ? 'text-orange-500' : 'text-gray-400'
//                             }
//                           />
//                           {label}
//                         </span>
//                         <ChevronDown
//                           size={14}
//                           className={`transition-transform ${
//                             subscriptionOpen ? 'rotate-180' : ''
//                           } ${active ? 'text-orange-400' : 'text-gray-300'}`}
//                         />
//                       </button>
//                       {/*
//                       {subscriptionOpen ? (
//                         <div className="bg-gray-50/60 py-1">
//                           {SUBSCRIPTION_SUBTABS.map((sub) => (
//                             <button
//                               key={sub.key}
//                               type="button"
//                               onClick={() => selectTab(sub.key)}
//                               className={`flex w-full items-center gap-2.5 py-2.5 pl-12 pr-4 text-left text-sm transition-colors ${
//                                 activeTab === sub.key
//                                   ? 'font-semibold text-orange-600'
//                                   : 'text-gray-600 hover:bg-gray-100'
//                               }`}
//                             >
//                               {sub.label}
//                             </button>
//                           ))}
//                         </div>
//                       ) : null} */}
//                       {subscriptionOpen ? (
//                         <div className="bg-gray-50/60 py-1">
//                           {SUBSCRIPTION_SUBTABS.map((sub) => {
//                             const Icon = sub.icon;

//                             return (
//                               <button
//                                 key={sub.key}
//                                 type="button"
//                                 onClick={() => selectTab(sub.key)}
//                                 className={`flex w-full items-center gap-2.5 py-2.5 pl-12 pr-4 text-left text-sm transition-colors ${
//                                   activeTab === sub.key
//                                     ? 'font-semibold text-orange-600'
//                                     : 'text-gray-600 hover:bg-gray-100'
//                                 }`}
//                               >
//                                 <Icon
//                                   size={16}
//                                   className={
//                                     activeTab === sub.key
//                                       ? 'text-orange-500'
//                                       : 'text-gray-400'
//                                   }
//                                 />

//                                 <span>{sub.label}</span>
//                               </button>
//                             );
//                           })}
//                         </div>
//                       ) : null}
//                     </div>
//                   );
//                 }

//                 if (key === 'easyPayment') {
//                   return (
//                     <div key={key}>
//                       <button
//                         type="button"
//                         onClick={() => setEasyPaymentOpen((prev) => !prev)}
//                         className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
//                           easyPaymentOpen
//                             ? 'border-r-2 border-orange-500 bg-orange-50 font-semibold text-orange-600'
//                             : 'text-gray-700 hover:bg-gray-50'
//                         }`}
//                       >
//                         <span className="flex items-center gap-2.5">
//                           <Icon
//                             size={16}
//                             className={
//                               easyPaymentOpen
//                                 ? 'text-orange-500'
//                                 : 'text-gray-400'
//                             }
//                           />
//                           {label}
//                         </span>
//                         <ChevronDown
//                           size={14}
//                           className={`transition-transform ${
//                             easyPaymentOpen ? 'rotate-180' : ''
//                           } ${
//                             easyPaymentOpen
//                               ? 'text-orange-400'
//                               : 'text-gray-300'
//                           }`}
//                         />
//                       </button>
//                       {easyPaymentOpen ? (
//                         <div className="bg-gray-50/60 py-1">
//                           {EASY_PAYMENT_SUBTABS.map((sub) => {
//                             const SubIcon = sub.icon;

//                             return (
//                               <button
//                                 key={sub.key}
//                                 type="button"
//                                 onClick={() => {
//                                   setCreateRequestOpen(false);
//                                   setEasyPaymentPanel(sub.key);
//                                 }}
//                                 className="flex w-full items-center gap-2.5 py-2.5 pl-12 pr-4 text-left text-sm text-gray-600 transition-colors hover:bg-gray-100"
//                               >
//                                 <SubIcon size={16} className="text-gray-400" />
//                                 <span>{sub.label}</span>
//                               </button>
//                             );
//                           })}
//                         </div>
//                       ) : null}
//                     </div>
//                   );
//                 }

//                 return (
//                   <button
//                     key={key}
//                     type="button"
//                     onClick={() => {
//                       if (key === 'createRequest') {
//                         setEasyPaymentPanel(null);
//                         setCreateRequestOpen(true);
//                       } else {
//                         selectTab(key);
//                       }
//                     }}
//                     className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
//                       active && key !== 'createRequest'
//                         ? 'border-r-2 border-orange-500 bg-orange-50 font-semibold text-orange-600'
//                         : 'text-gray-700 hover:bg-gray-50'
//                     }`}
//                   >
//                     <span className="flex items-center gap-2.5">
//                       <Icon
//                         size={16}
//                         className={active ? 'text-orange-500' : 'text-gray-400'}
//                       />
//                       {label}
//                     </span>
//                     <ChevronRight
//                       size={14}
//                       className={active ? 'text-orange-400' : 'text-gray-300'}
//                     />
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>
//         </aside>

//         {/* Right content panel */}
//         <div className="relative min-w-0 max-w-full">
//           {/* overlay */}
//           {(createRequestOpen || easyPaymentPanel) && (
//             <div className="fixed inset-0 z-40 bg-black/30" />
//           )}

//           {/* slide panel */}
//           <div
//             className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
//               createRequestOpen ? 'translate-x-0' : 'translate-x-full'
//             }`}
//           >
//             <div className="border-b border-gray-100 p-4">
//               <button
//                 onClick={() => setCreateRequestOpen(false)}
//                 className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
//               >
//                 <ArrowLeft size={16} />
//               </button>
//               <p className="text-base font-semibold text-black">
//                 Create a new request
//               </p>
//               <p className="mt-1 text-xs text-gray-500">
//                 Choose from the below listed options to create a request of your
//                 choice
//               </p>
//             </div>
//             <div
//               className="space-y-2 overflow-y-auto p-4"
//               style={{ maxHeight: 'calc(100vh - 120px)' }}
//             >
//               {[
//                 {
//                   label: 'Report Issue / Repair',
//                   tab: 'manage-rental-items',
//                   icon: Wrench,
//                   intent: 'issue',
//                 },
//                 {
//                   label: 'Relocate Rentnpay Products',
//                   tab: 'manage-rental-items',
//                   icon: RefreshCcw,
//                   intent: 'relocate',
//                 },
//                 {
//                   label: 'Request Return / Pickup',
//                   tab: 'manage-rental-items',
//                   icon: CircleX,
//                   intent: 'return',
//                 },
//                 {
//                   label: 'Transfer Ownership',
//                   tab: null,
//                   icon: Users,
//                   badge: 'Unavailable',
//                 },
//                 {
//                   label: 'Upgrade Product',
//                   tab: null,
//                   icon: ArrowBigUp,
//                   badge: 'Unavailable',
//                 },
//               ].map((item) => {
//                 const Icon = item.icon;

//                 return (
//                   <button
//                     key={item.label}
//                     // onClick={() => {
//                     //   if (item.tab) {
//                     //     setCreateRequestOpen(false);
//                     //     selectTab(item.tab);
//                     //   }
//                     // }}
//                     onClick={() => {
//                       if (item.tab) {
//                         setCreateRequestOpen(false);
//                         if (item.intent) {
//                           setActiveTab(item.tab);
//                           setShowMobileContent(true);
//                           router.replace(
//                             `/my-account?tab=${item.tab}&intent=${item.intent}`,
//                             { scroll: false },
//                           );
//                         } else {
//                           selectTab(item.tab);
//                         }
//                       }
//                     }}
//                     //   className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-3 py-3.5 text-left text-sm text-gray-800 hover:bg-gray-50"
//                     // >
//                     //   <div className="flex items-center gap-3">
//                     //     <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
//                     //       <Icon size={18} className="text-orange-500" />
//                     //     </div>

//                     //     <span className="flex flex-col gap-0.5">
//                     //       {item.label}
//                     //       {item.badge && (
//                     //         <span className="w-fit rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
//                     //           {item.badge}
//                     //         </span>
//                     //       )}
//                     //     </span>
//                     //   </div>

//                     //   <ChevronRight size={14} className="text-gray-400" />
//                     className={`flex w-full items-center justify-between rounded-xl border px-3 py-3.5 text-left text-sm ${
//                       item.badge
//                         ? 'cursor-not-allowed border-gray-100 text-gray-400'
//                         : 'border-gray-100 text-gray-800 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
//                         <Icon
//                           size={18}
//                           className={
//                             item.badge ? 'text-gray-400' : 'text-orange-500'
//                           }
//                         />
//                       </div>
//                       <span className="flex items-center gap-2">
//                         <span>{item.label}</span>
//                         {item.badge && (
//                           <span className="w-fit rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
//                             {item.badge}
//                           </span>
//                         )}
//                       </span>
//                     </div>

//                     <ChevronRight size={14} className="text-gray-400" />
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Easy Payment slide panel */}
//           <div
//             className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
//               easyPaymentPanel ? 'translate-x-0' : 'translate-x-full'
//             }`}
//           >
//             {easyPaymentPanel === 'auto-debit' ? (
//               <AutoDebitPanel onBack={() => setEasyPaymentPanel(null)} />
//             ) : easyPaymentPanel === 'advance-rental' ? (
//               <AdvanceRentalPanel onBack={() => setEasyPaymentPanel(null)} />
//             ) : null}
//           </div>

//           {/* <section className="min-h-[300px] min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
//             {ActiveComponent ? ( */}
//           {/* <section
//             className={`fixed inset-0 z-50 h-screen w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-transform duration-300 ease-in-out sm:p-6 md:static md:inset-auto md:z-auto md:h-auto md:w-auto md:translate-x-0 md:overflow-visible ${
//               showMobileContent ? 'translate-x-0' : 'translate-x-full'
//             }`}
//           > */}
//           <section
//             className={`fixed inset-0 z-50 h-screen w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-transform duration-300 ease-in-out sm:p-6 md:static md:inset-auto md:z-auto md:h-auto md:w-auto md:translate-x-0 md:overflow-visible ${
//               showMobileContent ? 'translate-x-0' : 'translate-x-full'
//             }`}
//           >
//             <button
//               type="button"
//               onClick={closeMobileContent}
//               className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 md:hidden"
//             >
//               <ArrowLeft size={16} />
//               <span>Back</span>
//             </button>
//             {/* {ActiveComponent ? (
//               <ActiveComponent
//                 openReturn={
//                   activeTab === 'rentals' || activeTab === 'manage-rental-items'
//                     ? openReturn
//                     : null
//                 }
//                 openReturnOrderId={openReturnOrderId}
//                 openReturnProductId={openReturnProductId}
//                 subscriptionView={
//                   isSubscriptionSubTab ? activeTab : 'manage-rental-items'
//                 }
//               />
//             ) : null} */}
//             {ActiveComponent ? (
//               <ActiveComponent
//                 openReturn={
//                   activeTab === 'rentals' || activeTab === 'manage-rental-items'
//                     ? openReturn
//                     : null
//                 }
//                 openReturnOrderId={openReturnOrderId}
//                 openReturnProductId={openReturnProductId}
//                 subscriptionView={
//                   isSubscriptionSubTab ? activeTab : 'manage-rental-items'
//                 }
//                 mobilePanelVisible={showMobileContent}
//               />
//             ) : null}
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function MyAccountPage() {
//   return (
//     <Suspense fallback={<SectionLoader />}>
//       <MyAccountContent />
//     </Suspense>
//   );
// }

'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import ReferralDashboard from '@/assets/icons/referraldashboard.png';
import StartRenting from '@/assets/icons/startrenting.png';
import {
  User,
  MapPin,
  Truck,
  Sofa,
  User2,
  ChevronDown,
  Loader2,
  ArrowBigUp,
  Users,
  RefreshCcw,
  CircleX,
  Wrench,
  ChevronRight,
  ArrowLeft,
  SquarePen,
  UserRoundPen,
  PackageOpen,
  Package,
  ReceiptText,
  Wallet,
  ClipboardList,
  BookOpen,
  CreditCard,
  Percent,
} from 'lucide-react';

// Each tab's content is its own file under components/account/.
// dynamic() means a tab's code only downloads when that tab is opened.
const DashboardSection = dynamic(
  () => import('@/components/Account/Dashboard'),
  {
    loading: () => <SectionLoader />,
  },
);
const SubscriptionSection = dynamic(
  () => import('@/components/Account/Dashboard'),
  {
    loading: () => <SectionLoader />,
  },
);
const ProfileSection = dynamic(() => import('@/components/Account/Profile'), {
  loading: () => <SectionLoader />,
});
const AddressSection = dynamic(() => import('@/components/Account/Address'), {
  loading: () => <SectionLoader />,
});
const OrdersSection = dynamic(() => import('@/components/Account/Orders'), {
  loading: () => <SectionLoader />,
});
const RentalsSection = dynamic(
  () => import('@/components/Account/RentalCommand'),
  { loading: () => <SectionLoader /> },
);
const MyRefundsSection = dynamic(
  () => import('@/components/Account/MyRefunds'),
  { loading: () => <SectionLoader /> },
);
const MyInvoiceSection = dynamic(
  () => import('@/components/Account/MyInvoices'),
  { loading: () => <SectionLoader /> },
);
const AllRequestsSection = dynamic(
  () => import('@/components/Account/AllRequests'),
  { loading: () => <SectionLoader /> },
);
const ReferralSection = dynamic(
  () => import('@/components/Account/ReferralSection'),
  { loading: () => <SectionLoader /> },
);

const CreateRequest = dynamic(
  () => import('@/components/Account/ReferralSection'),
  { loading: () => <SectionLoader /> },
);

const RentoMoney = dynamic(() => import('@/components/Account/RentoMoney'), {
  loading: () => <SectionLoader />,
});

const DepositLedgerSection = dynamic(
  () => import('@/components/Account/DepositLedger'),
  { loading: () => <SectionLoader /> },
);

const AutoDebitPanel = dynamic(
  () => import('@/components/Account/AutoDebitPanel'),
  { loading: () => <SectionLoader /> },
);

const AdvanceRentalPanel = dynamic(
  () => import('@/components/Account/AdvanceRentalPanel'),
  { loading: () => <SectionLoader /> },
);

const MyReferralsSection = dynamic(
  () => import('@/components/Account/MyReferrals'),
  { loading: () => <SectionLoader /> },
);
const TABS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: User,
    Component: DashboardSection,
  },
  {
    key: 'subscription',
    label: 'My Subscription',
    icon: PackageOpen,
    Component: SubscriptionSection,
  },
  {
    key: 'profile',
    label: 'My Profile',
    icon: UserRoundPen,
    Component: ProfileSection,
  },
  {
    key: 'easyPayment',
    label: 'Easy Payment',
    icon: CreditCard,
    Component: null,
  },
  // {
  //   key: 'address',
  //   label: 'My Address',
  //   icon: MapPin,
  //   Component: AddressSection,
  // },
  // { key: 'orders', label: 'My Orders', icon: Truck, Component: OrdersSection },
  { key: 'orders', label: 'My Orders', icon: Truck, Component: OrdersSection },
  // {
  //   key: 'rentals',
  //   label: 'Rental Products',
  //   icon: Sofa,
  //   Component: RentalsSection,
  // },
  {
    key: 'referral',
    label: 'Referral',
    icon: Users,
    Component: ReferralSection,
  },
  {
    key: 'createRequest',
    label: 'Create Request',
    icon: SquarePen,
    Component: CreateRequest,
  },
  // {
  //   key: 'rentoMoney',
  //   label: 'Rent Money',
  //   icon: RefreshCcw,
  //   Component: RentoMoney,
  // },
];

const SUBSCRIPTION_SUBTABS = [
  {
    key: 'manage-rental-items',
    label: 'Live Orders',
    icon: Package,
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: ReceiptText,
  },
  {
    key: 'deposit-ledger',
    label: 'Deposit Ledger',
    icon: BookOpen,
  },
  {
    key: 'my-refunds',
    label: 'My Refunds',
    icon: Wallet,
  },
  {
    key: 'address',
    label: 'My Address',
    icon: MapPin,
  },
  {
    key: 'all-requests',
    label: 'All Requests',
    icon: ClipboardList,
  },
  {
    key: 'my-referral',
    label: 'My Referral',
    icon: Users,
  },
];

const EASY_PAYMENT_SUBTABS = [
  {
    key: 'auto-debit',
    label: 'Auto Debit',
    icon: RefreshCcw,
  },
];

function SectionLoader() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  );
}

function formatJoinDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// function MyAccountContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user, isAuthenticated } = useSelector((s) => s.auth);

//   const [activeTab, setActiveTab] = useState('profile');
function MyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileActiveBanner, setMobileActiveBanner] = useState(0);
  const MOBILE_TOTAL_BANNERS = 2;
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  const [easyPaymentOpen, setEasyPaymentOpen] = useState(false);
  const [easyPaymentPanel, setEasyPaymentPanel] = useState(null);
  const [showMobileContent, setShowMobileContent] = useState(false);

  useEffect(() => {
    document.body.style.overflow =
      createRequestOpen || easyPaymentPanel ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [createRequestOpen, easyPaymentPanel]);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMobileActiveBanner((prev) => (prev + 1) % MOBILE_TOTAL_BANNERS);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = searchParams.get('tab');
    const isKnownTab =
      TABS.some((x) => x.key === t) ||
      SUBSCRIPTION_SUBTABS.some((x) => x.key === t);
    const valid = isKnownTab ? t : 'dashboard';
    setActiveTab(valid);

    if (
      valid === 'subscription' ||
      SUBSCRIPTION_SUBTABS.some((x) => x.key === valid)
    ) {
      setSubscriptionOpen(true);
    }
    if (valid === 'my-referral') {
      setSubscriptionOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // const selectTab = (key) => {
  //   setActiveTab(key);
  //   router.replace(`/my-account?tab=${key}`, { scroll: false });
  // };
  const selectTab = (key) => {
    setActiveTab(key);
    setShowMobileContent(true);
    router.replace(`/my-account?tab=${key}`, { scroll: false });
  };

  const closeMobileContent = () => {
    setShowMobileContent(false);
  };

  // if (!isAuthenticated || !user) {
  //   return <SectionLoader />;
  // }
  if (!mounted || !isAuthenticated || !user) {
    return <SectionLoader />;
  }

  const firstLetter = user?.fullName?.charAt(0)?.toUpperCase() || '';
  const joinDate = formatJoinDate(user?.createdAt);
  const isSubscriptionSubTab =
    SUBSCRIPTION_SUBTABS.some((s) => s.key === activeTab) ||
    activeTab === 'my-referral';
  const ActiveComponent =
    activeTab === 'manage-rental-items'
      ? RentalsSection
      : activeTab === 'my-refunds'
        ? MyRefundsSection
        : activeTab === 'invoices'
          ? MyInvoiceSection
          : activeTab === 'all-requests'
            ? AllRequestsSection
            : activeTab === 'deposit-ledger'
              ? DepositLedgerSection
              : activeTab === 'address'
                ? AddressSection
                : activeTab === 'my-referral'
                  ? MyReferralsSection
                  : isSubscriptionSubTab
                    ? SubscriptionSection
                    : TABS.find((t) => t.key === activeTab)?.Component;

  // const openReturn = searchParams.get('openReturn');
  // const openReturnOrderId = searchParams.get('orderId');
  // const openReturnProductId = searchParams.get('productId');
  const openReturn =
    typeof window !== 'undefined' ? searchParams.get('openReturn') : null;
  const openReturnOrderId =
    typeof window !== 'undefined' ? searchParams.get('orderId') : null;
  const openReturnProductId =
    typeof window !== 'undefined' ? searchParams.get('productId') : null;

  return (
    <div className="mx-auto w-full max-w-full px-4 py-6 sm:px-6 sm:py-8">
      {/* Mobile-only profile summary - shown above the banner only on mobile */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:hidden">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-lg font-bold text-white">
          {firstLetter}
        </div>
        <div className="min-w-0">
          {/* <p className="truncate text-sm font-semibold text-black">
            {user.fullName}
          </p> */}
          <p className="truncate text-sm font-semibold text-black">
            {user.fullName?.split(' ')[0]}
          </p>
          {joinDate ? (
            <p className="mt-0.5 text-xs text-gray-500">Joined - {joinDate}</p>
          ) : null}
        </div>
      </div>

      {/* Mobile-only top banner (Refer friends / Welcome) - always visible on mobile regardless of active tab */}
      <div className="mb-4 md:hidden">
        {mobileActiveBanner === 0 ? (
          <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                <img
                  src={ReferralDashboard.src}
                  alt="Referral Dashboard"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-black">
                  Refer your friends
                </p>
                <p className="text-base font-semibold text-orange-600">
                  Earn up to ₹1,000
                </p>
              </div>
              <button
                type="button"
                onClick={() => selectTab('referral')}
                className="shrink-0 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
              >
                Refer
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: MOBILE_TOTAL_BANNERS }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show banner ${i + 1}`}
                  onClick={() => setMobileActiveBanner(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    mobileActiveBanner === i
                      ? 'w-5 bg-orange-500'
                      : 'w-1.5 bg-orange-200'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                <img
                  src={StartRenting.src}
                  alt="Start Renting"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-black">
                  Welcome,{' '}
                  {/* <span className="font-bold text-orange-600">
                    {user?.fullName || ''}
                  </span> */}
                  <span className="font-bold text-orange-600">
                    {user?.fullName?.split(' ')[0] || ''}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/rent')}
                className="shrink-0 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
              >
                Start
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: MOBILE_TOTAL_BANNERS }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show banner ${i + 1}`}
                  onClick={() => setMobileActiveBanner(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    mobileActiveBanner === i
                      ? 'w-5 bg-orange-500'
                      : 'w-1.5 bg-orange-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid w-full max-w-full min-w-0 items-start gap-5 md:grid-cols-[260px_1fr] md:gap-6">
        {/* Left sidebar */}
        <aside className="min-w-0 md:sticky md:top-20 md:self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="hidden items-center gap-3 border-b border-gray-100 px-4 py-4 md:flex">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-2xl font-bold text-white">
                {firstLetter}
              </div>
              <div className="min-w-0">
                {/* <p className="truncate text-sm font-semibold text-black">
                  {user.fullName}
                </p> */}
                <p className="truncate text-sm font-semibold text-black">
                  {user.fullName?.split(' ')[0]}
                </p>
                {joinDate ? (
                  <p className="mt-0.5 text-xs text-gray-500">
                    Joined - {joinDate}
                  </p>
                ) : null}
              </div>
            </div>

            <nav className="py-1">
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;

                if (key === 'subscription') {
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() => setSubscriptionOpen((prev) => !prev)}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
                          active
                            ? 'border-r-2 border-orange-500 bg-orange-50 font-semibold text-orange-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            size={16}
                            className={
                              active ? 'text-orange-500' : 'text-gray-400'
                            }
                          />
                          {label}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${
                            subscriptionOpen ? 'rotate-180' : ''
                          } ${active ? 'text-orange-400' : 'text-gray-300'}`}
                        />
                      </button>
                      {/* 
                      {subscriptionOpen ? (
                        <div className="bg-gray-50/60 py-1">
                          {SUBSCRIPTION_SUBTABS.map((sub) => (
                            <button
                              key={sub.key}
                              type="button"
                              onClick={() => selectTab(sub.key)}
                              className={`flex w-full items-center gap-2.5 py-2.5 pl-12 pr-4 text-left text-sm transition-colors ${
                                activeTab === sub.key
                                  ? 'font-semibold text-orange-600'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      ) : null} */}
                      {subscriptionOpen ? (
                        <div className="bg-gray-50/60 py-1">
                          {SUBSCRIPTION_SUBTABS.map((sub) => {
                            const Icon = sub.icon;

                            return (
                              <button
                                key={sub.key}
                                type="button"
                                onClick={() => selectTab(sub.key)}
                                className={`flex w-full items-center gap-2.5 py-2.5 pl-12 pr-4 text-left text-sm transition-colors ${
                                  activeTab === sub.key
                                    ? 'font-semibold text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <Icon
                                  size={16}
                                  className={
                                    activeTab === sub.key
                                      ? 'text-orange-500'
                                      : 'text-gray-400'
                                  }
                                />

                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                if (key === 'easyPayment') {
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() => setEasyPaymentOpen((prev) => !prev)}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
                          easyPaymentOpen
                            ? 'border-r-2 border-orange-500 bg-orange-50 font-semibold text-orange-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            size={16}
                            className={
                              easyPaymentOpen
                                ? 'text-orange-500'
                                : 'text-gray-400'
                            }
                          />
                          {label}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${
                            easyPaymentOpen ? 'rotate-180' : ''
                          } ${
                            easyPaymentOpen
                              ? 'text-orange-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                      {easyPaymentOpen ? (
                        <div className="bg-gray-50/60 py-1">
                          {EASY_PAYMENT_SUBTABS.map((sub) => {
                            const SubIcon = sub.icon;

                            return (
                              <button
                                key={sub.key}
                                type="button"
                                onClick={() => {
                                  setCreateRequestOpen(false);
                                  setEasyPaymentPanel(sub.key);
                                }}
                                className="flex w-full items-center gap-2.5 py-2.5 pl-12 pr-4 text-left text-sm text-gray-600 transition-colors hover:bg-gray-100"
                              >
                                <SubIcon size={16} className="text-gray-400" />
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === 'createRequest') {
                        setEasyPaymentPanel(null);
                        setCreateRequestOpen(true);
                      } else {
                        selectTab(key);
                      }
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${
                      active && key !== 'createRequest'
                        ? 'border-r-2 border-orange-500 bg-orange-50 font-semibold text-orange-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={active ? 'text-orange-500' : 'text-gray-400'}
                      />
                      {label}
                    </span>
                    <ChevronRight
                      size={14}
                      className={active ? 'text-orange-400' : 'text-gray-300'}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right content panel */}
        <div className="relative min-w-0 max-w-full">
          {/* overlay */}
          {(createRequestOpen || easyPaymentPanel) && (
            <div className="fixed inset-0 z-40 bg-black/30" />
          )}

          {/* slide panel */}
          <div
            className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
              createRequestOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="border-b border-gray-100 p-4">
              <button
                onClick={() => setCreateRequestOpen(false)}
                className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft size={16} />
              </button>
              <p className="text-base font-semibold text-black">
                Create a new request
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Choose from the below listed options to create a request of your
                choice
              </p>
            </div>
            <div
              className="space-y-2 overflow-y-auto p-4"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            >
              {[
                {
                  label: 'Report Issue / Repair',
                  tab: 'manage-rental-items',
                  icon: Wrench,
                  intent: 'issue',
                },
                {
                  label: 'Relocate Rentnpay Products',
                  tab: 'manage-rental-items',
                  icon: RefreshCcw,
                  intent: 'relocate',
                },
                {
                  label: 'Request Return / Pickup',
                  tab: 'manage-rental-items',
                  icon: CircleX,
                  intent: 'return',
                },
                {
                  label: 'Transfer Ownership',
                  tab: null,
                  icon: Users,
                  badge: 'Unavailable',
                },
                {
                  label: 'Upgrade Product',
                  tab: null,
                  icon: ArrowBigUp,
                  badge: 'Unavailable',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    // onClick={() => {
                    //   if (item.tab) {
                    //     setCreateRequestOpen(false);
                    //     selectTab(item.tab);
                    //   }
                    // }}
                    onClick={() => {
                      if (item.tab) {
                        setCreateRequestOpen(false);
                        if (item.intent) {
                          setActiveTab(item.tab);
                          setShowMobileContent(true);
                          router.replace(
                            `/my-account?tab=${item.tab}&intent=${item.intent}`,
                            { scroll: false },
                          );
                        } else {
                          selectTab(item.tab);
                        }
                      }
                    }}
                    //   className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-3 py-3.5 text-left text-sm text-gray-800 hover:bg-gray-50"
                    // >
                    //   <div className="flex items-center gap-3">
                    //     <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                    //       <Icon size={18} className="text-orange-500" />
                    //     </div>

                    //     <span className="flex flex-col gap-0.5">
                    //       {item.label}
                    //       {item.badge && (
                    //         <span className="w-fit rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    //           {item.badge}
                    //         </span>
                    //       )}
                    //     </span>
                    //   </div>

                    //   <ChevronRight size={14} className="text-gray-400" />
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-3.5 text-left text-sm ${
                      item.badge
                        ? 'cursor-not-allowed border-gray-100 text-gray-400'
                        : 'border-gray-100 text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                        <Icon
                          size={18}
                          className={
                            item.badge ? 'text-gray-400' : 'text-orange-500'
                          }
                        />
                      </div>
                      <span className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="w-fit rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </div>

                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Easy Payment slide panel */}
          <div
            className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
              easyPaymentPanel ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {easyPaymentPanel === 'auto-debit' ? (
              <AutoDebitPanel onBack={() => setEasyPaymentPanel(null)} />
            ) : easyPaymentPanel === 'advance-rental' ? (
              <AdvanceRentalPanel onBack={() => setEasyPaymentPanel(null)} />
            ) : null}
          </div>

          {/* <section className="min-h-[300px] min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            {ActiveComponent ? ( */}
          {/* <section
            className={`fixed inset-0 z-50 h-screen w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-transform duration-300 ease-in-out sm:p-6 md:static md:inset-auto md:z-auto md:h-auto md:w-auto md:translate-x-0 md:overflow-visible ${
              showMobileContent ? 'translate-x-0' : 'translate-x-full'
            }`}
          > */}
          <section
            className={`fixed inset-0 z-50 h-screen w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-transform duration-300 ease-in-out sm:p-6 md:static md:inset-auto md:z-auto md:h-auto md:w-auto md:translate-x-0 md:overflow-visible ${
              showMobileContent ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <button
              type="button"
              onClick={closeMobileContent}
              className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 md:hidden"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            {/* {ActiveComponent ? (
              <ActiveComponent
                openReturn={
                  activeTab === 'rentals' || activeTab === 'manage-rental-items'
                    ? openReturn
                    : null
                }
                openReturnOrderId={openReturnOrderId}
                openReturnProductId={openReturnProductId}
                subscriptionView={
                  isSubscriptionSubTab ? activeTab : 'manage-rental-items'
                }
              />
            ) : null} */}
            {ActiveComponent ? (
              <ActiveComponent
                openReturn={
                  activeTab === 'rentals' || activeTab === 'manage-rental-items'
                    ? openReturn
                    : null
                }
                openReturnOrderId={openReturnOrderId}
                openReturnProductId={openReturnProductId}
                subscriptionView={
                  isSubscriptionSubTab ? activeTab : 'manage-rental-items'
                }
                mobilePanelVisible={showMobileContent}
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function MyAccountPage() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <MyAccountContent />
    </Suspense>
  );
}
