// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import { adminLogout } from '../../redux/slices/adminSlice';
// import {
//   apiGetVendorKycQueue,
//   apiGetCustomerKycQueue,
//   apiGetAllOrders,
//   apiGetAllServiceBookings,
// } from '@/service/api';
// import {
//   ChevronDown,
//   ChevronRight,
//   IndianRupee,
//   LogOut,
//   Heart,
//   Ticket,
//   Tag,
//   TrendingUp,
//   Megaphone,
//   UserCheck,
// } from 'lucide-react';
// import dashboardIcon from '@/assets/icons/dashboard.png';
// import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';
// import storeIcon from '@/assets/icons/store1.png';
// import cartIcon from '@/assets/icons/cart1.png';
// import ordersIcon from '@/assets/icons/orders1.png';
// import reminderIcon from '@/assets/icons/reminder1.png';
// import peopleIcon from '@/assets/icons/people.png';
// import kycIcon from '@/assets/icons/kyc1.png';
// import analyticsIcon from '@/assets/icons/analytics.png';
// import productOffersIcon from '@/assets/icons/prodcutoffers.png';
// import systemsIcon from '@/assets/icons/systems.png';

// function cls(...parts) {
//   return parts.filter(Boolean).join(' ');
// }

// const ADMIN_ORDERS_LAST_SEEN_KEY = 'adminOrdersLastSeenAt';
// /**
//  * Renders either an <img> (for legacy image icons) or a lucide-react
//  * component icon, matching the invert-on-active styling used everywhere.
//  */
// function GroupIcon({ icon, active, letter }) {
//   if (!icon) return null;
//   const isLucide = typeof icon === 'function' || typeof icon === 'object';
//   // image imports (from /assets/icons/*.png) come in as objects with a `.src`
//   if (icon && icon.src) {
//     return (
//       <img
//         src={icon.src}
//         alt=""
//         className={`w-4 h-4 shrink-0 ${active ? 'brightness-0 invert' : ''}`}
//       />
//     );
//   }
//   const LucideIcon = icon;
//   return (
//     <LucideIcon
//       size={16}
//       className={`shrink-0 ${active ? 'text-white' : 'text-gray-600'}`}
//     />
//   );
// }

// const AdminSidebar = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.admin);
//   const role = user?.role;
//   const portalLabel = role === 'subadmin' ? 'Sub-admin Portal' : 'Admin Portal';
//   // const [kycQueueCounts, setKycQueueCounts] = useState({
//   //   pending: 0,
//   //   resubmitted: 0,
//   // });
//   const [kycQueueCounts, setKycQueueCounts] = useState({
//     pending: 0,
//     resubmitted: 0,
//   });
//   const [kycChildCounts, setKycChildCounts] = useState({
//     vendor: 0,
//     customer: 0,
//   });
//   // const [hasNewOrder, setHasNewOrder] = useState(false);

//   // const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

//   // const checkNewOrders = () => {
//   //   const token =
//   //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//   //   if (!token) return;
//   //   apiGetAllOrders(token)
//   const [hasNewOrder, setHasNewOrder] = useState(false);
//   const pathnameRef = useRef(pathname);

//   const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

//   const checkNewOrders = () => {
//     // Already viewing Live Orders — nothing to blink about, and prevents
//     // the 30s poll from re-flagging orders you're currently looking at.
//     if (pathnameRef.current?.startsWith('/orders')) {
//       setHasNewOrder(false);
//       return;
//     }
//     //   const token =
//     //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     //   if (!token) return;
//     //   apiGetAllOrders(token)
//     //     .then((res) => {
//     //       const list = Array.isArray(res.data) ? res.data : [];
//     //       let lastSeenMs = null;
//     //       try {
//     //         const raw = localStorage.getItem(ADMIN_ORDERS_LAST_SEEN_KEY);
//     //         if (raw) {
//     //           const t = new Date(raw).getTime();
//     //           if (!Number.isNaN(t)) lastSeenMs = t;
//     //         }
//     //       } catch {
//     //         lastSeenMs = null;
//     //       }
//     //       const hasUnseen = list.some((o) => {
//     //         const t = new Date(o.createdAt || 0).getTime();
//     //         if (lastSeenMs == null) return true;
//     //         return !Number.isNaN(t) && t > lastSeenMs;
//     //       });
//     //       setHasNewOrder(hasUnseen);
//     //     })
//     //     .catch(() => {
//     //       /* silent */
//     //     });
//     // };

//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) return;
//     Promise.all([
//       apiGetAllOrders(token).catch(() => ({ data: [] })),
//       apiGetAllServiceBookings(token).catch(() => ({ data: [] })),
//     ])
//       .then(([ordersRes, bookingsRes]) => {
//         const orderList = Array.isArray(ordersRes.data) ? ordersRes.data : [];
//         const bookingList = Array.isArray(bookingsRes.data)
//           ? bookingsRes.data
//           : [];
//         let lastSeenMs = null;
//         try {
//           const raw = localStorage.getItem(ADMIN_ORDERS_LAST_SEEN_KEY);
//           if (raw) {
//             const t = new Date(raw).getTime();
//             if (!Number.isNaN(t)) lastSeenMs = t;
//           }
//         } catch {
//           lastSeenMs = null;
//         }
//         const hasUnseen = [...orderList, ...bookingList].some((o) => {
//           const t = new Date(o.createdAt || 0).getTime();
//           if (lastSeenMs == null) return true;
//           return !Number.isNaN(t) && t > lastSeenMs;
//         });
//         setHasNewOrder(hasUnseen);
//       })
//       .catch(() => {
//         /* silent */
//       });
//   };

//   useEffect(() => {
//     checkNewOrders();
//     const id = setInterval(checkNewOrders, 30_000);
//     const onNewOrderEvent = () => setHasNewOrder(true);
//     window.addEventListener('admin-new-order', onNewOrderEvent);
//     return () => {
//       clearInterval(id);
//       window.removeEventListener('admin-new-order', onNewOrderEvent);
//     };
//   }, []);
//   // useEffect(() => {
//   //   if (pathname?.startsWith('/orders')) {
//   useEffect(() => {
//     pathnameRef.current = pathname;
//     if (pathname?.startsWith('/orders')) {
//       try {
//         localStorage.setItem(
//           ADMIN_ORDERS_LAST_SEEN_KEY,
//           new Date().toISOString(),
//         );
//       } catch {
//         /* ignore */
//       }
//       setHasNewOrder(false);
//     }
//   }, [pathname]);

//   const logout = async () => {
//     await dispatch(adminLogout());
//     router.push('/admin-login');
//   };

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) return;
//     Promise.all([
//       apiGetVendorKycQueue(token).catch(() => null),
//       apiGetCustomerKycQueue(token).catch(() => null),
//     ]).then(([vendorRes, customerRes]) => {
//       const vc = vendorRes?.data?.counts || {};
//       const cc = customerRes?.data?.counts || {};
//       const vendorPending = (vc.pending || 0) + (vc.resubmitted || 0);
//       const customerPending = (cc.pending || 0) + (cc.inReview || 0);
//       setKycQueueCounts({
//         pending: vc.pending || 0,
//         resubmitted: vc.resubmitted || 0,
//       });
//       setKycChildCounts({
//         vendor: vendorPending,
//         customer: customerPending,
//       });
//     });
//   }, []);

//   // ---------------------------------------------------------------------
//   // Nav structure — matches the requested order:
//   // 1 Dashboard, 2 Analytics, 3 KYC, 4 Stores, 5 Products & Custom Listing,
//   // 6 Cart, 7 Wishlist, 8 Live Orders, 9 Partners, 10 Tickets, 11 Offers,
//   // 12 Finance, 13 System, 14 Growth Plan, 15 CMS Management,
//   // 16 Sub-Admin Approval, then Logout.
//   // ---------------------------------------------------------------------
//   const navGroups = [
//     {
//       type: 'link',
//       key: 'dashboard',
//       to: '/dashboard',
//       label: 'Dashboard',
//       icon: dashboardIcon,
//     },
//     {
//       type: 'group',
//       key: 'analytics',
//       label: 'Analytics',
//       icon: analyticsIcon,
//       matchPrefix: '/analytics',
//       children: [
//         {
//           to: '/analytics/financial-performance',
//           label: 'Financial Performance',
//         },
//         { to: '/analytics/order-analytics', label: 'Order Analytics' },
//         { to: '/analytics/cities', label: 'Cities' },
//         { to: '/analytics/life-line', label: 'Life Line' },
//         { to: '/analytics/zone-perfomance', label: 'Zone Perfomance' },
//         {
//           to: '/analytics/cat-subcat-analytics',
//           label: 'Categories Perfomance',
//         },
//       ],
//     },
//     {
//       type: 'group',
//       key: 'kyc',
//       label: 'KYC',
//       icon: kycIcon,
//       matchPrefix: '/kyc',
//       badge:
//         kycQueueCounts.pending +
//         kycQueueCounts.resubmitted +
//         kycChildCounts.customer,
//       children: [
//         { to: '/kyc/vendor', label: 'Vendor', badge: kycChildCounts.vendor },
//         {
//           to: '/kyc/customer',
//           label: 'Customer',
//           badge: kycChildCounts.customer,
//         },
//       ],
//     },
//     {
//       type: 'link',
//       key: 'stores',
//       to: '/stores',
//       label: 'Stores',
//       icon: storeIcon,
//     },
//     {
//       type: 'group',
//       key: 'products-custom-listing',
//       label: 'Products & Listing',
//       icon: productOffersIcon,
//       matchPrefix: null,
//       matchExact: ['/global-products', '/custom-listings'],
//       children: [
//         { to: '/global-products', label: 'Global Products' },
//         { to: '/custom-listings', label: 'Custom Listing' },
//       ],
//     },
//     {
//       type: 'link',
//       key: 'cart',
//       to: '/cart',
//       label: 'Cart',
//       icon: cartIcon,
//     },
//     {
//       type: 'link',
//       key: 'wishlist',
//       to: '/wishlist',
//       label: 'Wishlist',
//       icon: Heart,
//     },
//     {
//       type: 'link',
//       key: 'live-orders',
//       to: '/orders',
//       label: 'Live Orders',
//       icon: ordersIcon,
//       showNewOrderDot: true,
//     },
//     {
//       type: 'group',
//       key: 'partners',
//       label: 'Partners',
//       icon: peopleIcon,
//       matchExact: ['/all-vendors', '/users'],
//       children: [
//         { to: '/all-vendors', label: 'Vendors' },
//         { to: '/users', label: 'Users' },
//         // { to: '/welcome-kit', label: 'Welcome Kit' },
//       ],
//     },
//     {
//       type: 'link',
//       key: 'tickets',
//       to: '/system/tickets',
//       label: 'Tickets',
//       icon: Ticket,
//       matchPrefix: '/system/tickets',
//     },
//     {
//       type: 'group',
//       key: 'offers',
//       label: 'Offers',
//       icon: Tag,
//       matchExact: ['/products-offers'],
//       matchPrefix: '/system/coupons',
//       children: [
//         { to: '/products-offers', label: 'Offers' },
//         { to: '/system/coupons', label: 'Coupons' },
//       ],
//     },
//     {
//       type: 'group',
//       key: 'finance',
//       label: 'Finance',
//       icon: IndianRupee,
//       matchPrefix: null,
//       matchExact: [
//         '/reminders',
//         '/finances/systeminvoice',
//         '/finances/transaction',
//         '/finances/refunds',
//         '/finances/settlements',
//         '/finances/cancellations',
//         '/finances/referrals',
//         '/finances/bank-verification',
//       ],
//       children: [
//         { to: '/reminders', label: 'Reminders' },
//         { to: '/finances/systeminvoice', label: 'System Invoice' },
//         { to: '/finances/transaction', label: 'Transaction' },
//         { to: '/finances/refunds', label: 'Refunds' },
//         { to: '/finances/settlements', label: 'Settlements' },
//         { to: '/finances/cancellations', label: 'Cancellations' },
//         { to: '/finances/referrals', label: 'Referrals' },
//         { to: '/finances/bank-verification', label: 'Bank Verification' },
//       ],
//     },
//     {
//       type: 'group',
//       key: 'system',
//       label: 'System',
//       icon: systemsIcon,
//       matchPrefix: null,
//       matchExact: [
//         '/categories',
//         '/system/approval',
//         '/system/refund-approval',
//         '/system/featured',
//         '/system/commission',
//         '/system/banners',
//         '/system/contact-enquiries',
//         '/finances/tax',
//       ],
//       children: [
//         { to: '/system/approval', label: 'Product Approval' },
//         { to: '/system/refund-approval', label: 'Refund Approval' },
//         { to: '/system/featured', label: 'Featured' },
//         { to: '/categories', label: 'Categories' },
//         { to: '/system/commission', label: 'Commission' },
//         { to: '/finances/tax', label: 'Tax' },
//         { to: '/system/banners', label: 'Banners' },
//         { to: '/system/contact-enquiries', label: 'Contact Enquiries' },
//         // { to: '/system/rent-banners', label: 'Rent Banners' },
//         // { to: '/system/buy-banners', label: 'Buy Banners' },
//       ],
//     },
//     {
//       type: 'link',
//       key: 'growth-plan',
//       to: '/finances/growth-plan',
//       label: 'Growth Plan',
//       icon: TrendingUp,
//     },
//     {
//       type: 'group',
//       key: 'cms-management',
//       label: 'CMS Management',
//       icon: Megaphone,
//       matchExact: [
//         '/system/rent-offer',
//         '/system/rent-as-banners',
//         '/system/buy-advertisements',
//         '/system/advertisements',
//       ],
//       children: [
//         { to: '/system/rent-offer', label: 'Rental Offers' },

//         { to: '/system/rent-as-banners', label: 'RentAs Banners' },
//         { to: '/system/advertisements', label: ' Advertisements' },
//         { to: '/system/buy-advertisements', label: 'Buy Advertisements' },
//         {
//           to: '/system/service-advertisements',
//           label: 'Service Advertisements',
//         },
//       ],
//     },
//     {
//       type: 'link',
//       key: 'sub-admin-approval',
//       to: '/system/subadmin-approval',
//       label: 'Sub-Admins',
//       icon: UserCheck,
//       adminOnly: true,
//     },
//   ];

//   // open/closed state per collapsible group key
//   const [openGroups, setOpenGroups] = useState({});
//   const toggleGroup = (key) =>
//     setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

//   // const isGroupActive = (group) => {
//   //   if (group.matchPrefix && pathname?.startsWith(group.matchPrefix))
//   //     return true;
//   //   if (
//   //     group.matchExact &&
//   //     group.matchExact.some(
//   //       (p) => pathname === p || pathname?.startsWith(`${p}/`),
//   //     )
//   //   ) {
//   //     return true;
//   //   }
//   //   return false;
//   // };
//   const isGroupActive = (group) => {
//     if (
//       group.matchPrefix &&
//       (pathname === group.matchPrefix ||
//         pathname?.startsWith(group.matchPrefix + '/'))
//     )
//       return true;
//     if (
//       group.matchExact &&
//       group.matchExact.some(
//         (p) => pathname === p || pathname?.startsWith(`${p}/`),
//       )
//     ) {
//       return true;
//     }
//     return false;
//   };

//   const isChildActive = (child) =>
//     pathname === child.to || pathname?.startsWith(`${child.to}/`);

//   return (
//     <>
//       <button
//         onClick={() => setMobileOpen((v) => !v)}
//         className={`md:hidden fixed top-3 z-[1202] w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
//           mobileOpen
//             ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
//             : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
//         }`}
//       >
//         {mobileOpen ? '✕' : '☰'}
//       </button>

//       {mobileOpen ? (
//         <div
//           className="md:hidden fixed inset-0 bg-black/40 z-[1200]"
//           onClick={() => setMobileOpen(false)}
//         />
//       ) : null}

//       {/* <aside
//         className={`fixed md:sticky inset-y-0 left-0 md:top-0 z-[1201] bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200 flex flex-col h-screen overflow-hidden w-56 ${
//           mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
//         } ${sidebarOpen ? 'md:w-56' : 'md:w-16'}`}
//       > */}
//       <aside
//         className={`fixed md:sticky inset-y-0 left-0 md:top-0 z-[1201] bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200 flex flex-col h-[100dvh] md:h-screen overflow-hidden w-56 ${
//           mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
//         } ${sidebarOpen ? 'md:w-56' : 'md:w-16'}`}
//       >
//         <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
//           <Link href="/" className="flex items-center gap-2 min-w-0">
//             <img
//               src={RentnpayLogo.src}
//               alt="Rentnpay"
//               className="w-10 h-10 shrink-0 object-contain"
//             />
//             {sidebarOpen ? (
//               <div className="leading-tight min-w-0">
//                 <p className="text-lg font-semibold text-black truncate">
//                   Rentnpay
//                 </p>
//                 <p className="text-sm font-semibold text-gray-500">
//                   {portalLabel}
//                 </p>
//               </div>
//             ) : null}
//           </Link>
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="hidden p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
//             title="Toggle sidebar"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M4 6h16M4 12h16M4 18h16"
//               />
//             </svg>
//           </button>
//         </div>

//         <nav className="flex-1 overflow-y-auto py-4 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//           {navGroups.map((group) => {
//             if (group.adminOnly && role !== 'admin') return null;

//             if (group.type === 'link') {
//               const isActive =
//                 pathname === group.to ||
//                 (group.matchPrefix && pathname?.startsWith(group.matchPrefix));
//               return (
//                 <Link
//                   key={group.key}
//                   href={group.to}
//                   onClick={() => setMobileOpen(false)}
//                   className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
//                     isActive
//                       ? 'bg-[#FF7020] text-white font-medium shadow-sm'
//                       : ''
//                   }`}
//                   title={group.label}
//                 >
//                   <span className="inline-flex items-center gap-2 min-w-0">
//                     <GroupIcon icon={group.icon} active={isActive} />
//                     {sidebarOpen ? group.label : group.label.charAt(0)}
//                     {group.showNewOrderDot && hasNewOrder ? (
//                       <span className="relative flex h-2.5 w-2.5">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
//                       </span>
//                     ) : null}
//                   </span>
//                 </Link>
//               );
//             }

//             // collapsible group
//             const active = isGroupActive(group);
//             const open = !!openGroups[group.key];
//             return (
//               <div className="mx-2 mt-1" key={group.key}>
//                 <button
//                   type="button"
//                   onClick={() => toggleGroup(group.key)}
//                   className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
//                     active
//                       ? 'bg-[#FF7020] text-white font-medium shadow-sm'
//                       : ''
//                   }`}
//                   title={group.label}
//                 >
//                   <span className="inline-flex items-center gap-2">
//                     <GroupIcon icon={group.icon} active={active} />
//                     {sidebarOpen ? group.label : group.label.charAt(0)}
//                     {sidebarOpen && group.badge > 0 && !open ? (
//                       <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 text-white font-medium">
//                         {group.badge > 9 ? '9+' : group.badge}
//                       </span>
//                     ) : null}
//                   </span>
//                   {sidebarOpen ? (
//                     open ? (
//                       <ChevronDown
//                         size={18}
//                         className={
//                           active
//                             ? 'text-white fill-white'
//                             : 'text-gray-400 fill-gray-400'
//                         }
//                       />
//                     ) : (
//                       <ChevronRight
//                         size={18}
//                         className={
//                           active
//                             ? 'text-white fill-white'
//                             : 'text-gray-400 fill-gray-400'
//                         }
//                       />
//                     )
//                   ) : null}
//                 </button>
//                 {sidebarOpen && open ? (
//                   <div className="mt-1 ml-2 space-y-0.5">
//                     {group.children.map((child) => (
//                       <Link
//                         key={child.to}
//                         href={child.to}
//                         onClick={() => setMobileOpen(false)}
//                         className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
//                           isChildActive(child)
//                             ? 'bg-orange-50 text-orange-600 font-medium'
//                             : ''
//                         }`}
//                       >
//                         <span>{child.label}</span>
//                         {child.badge > 0 ? (
//                           <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 text-white font-medium leading-none">
//                             {child.badge > 9 ? '9+' : child.badge}
//                           </span>
//                         ) : null}
//                       </Link>
//                     ))}
//                   </div>
//                 ) : null}
//               </div>
//             );
//           })}
//         </nav>

//         {/* <div className="border-t border-gray-100 p-4">
//           <button
//             onClick={() => setLogoutConfirmOpen(true)}
//             className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
//           > */}
//         <div
//           className="border-t border-gray-100 p-4 shrink-0"
//           style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
//         >
//           <button
//             onClick={() => setLogoutConfirmOpen(true)}
//             className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
//           >
//             <LogOut className="h-4 w-4" strokeWidth={2} />
//             {sidebarOpen ? (
//               <span className="text-sm font-bold">Logout</span>
//             ) : null}
//           </button>
//         </div>
//       </aside>

//       {logoutConfirmOpen ? (
//         <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-2">
//               Log Out
//             </h2>
//             <p className="text-sm text-gray-600 mb-6">
//               Are you sure you want to log out of your admin account?
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setLogoutConfirmOpen(false)}
//                 className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   setLogoutConfirmOpen(false);
//                   logout();
//                 }}
//                 className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
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
// export default AdminSidebar;

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../../redux/slices/adminSlice';
import {
  apiGetVendorKycQueue,
  apiGetCustomerKycQueue,
  apiGetAllOrders,
  apiGetAllServiceBookings,
} from '@/service/api';
import {
  ChevronDown,
  ChevronRight,
  IndianRupee,
  LogOut,
  Heart,
  Ticket,
  Tag,
  TrendingUp,
  Megaphone,
  UserCheck,
  Settings,
} from 'lucide-react';
import dashboardIcon from '@/assets/icons/dashboard.png';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';
import storeIcon from '@/assets/icons/store1.png';
import cartIcon from '@/assets/icons/cart1.png';
import ordersIcon from '@/assets/icons/orders1.png';
import reminderIcon from '@/assets/icons/reminder1.png';
import peopleIcon from '@/assets/icons/people.png';
import kycIcon from '@/assets/icons/kyc1.png';
import analyticsIcon from '@/assets/icons/analytics.png';
import productOffersIcon from '@/assets/icons/prodcutoffers.png';
import systemsIcon from '@/assets/icons/systems.png';

function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}

const ADMIN_ORDERS_LAST_SEEN_KEY = 'adminOrdersLastSeenAt';
/**
 * Renders either an <img> (for legacy image icons) or a lucide-react
 * component icon, matching the invert-on-active styling used everywhere.
 */
function GroupIcon({ icon, active, letter }) {
  if (!icon) return null;
  const isLucide = typeof icon === 'function' || typeof icon === 'object';
  // image imports (from /assets/icons/*.png) come in as objects with a `.src`
  if (icon && icon.src) {
    return (
      <img
        src={icon.src}
        alt=""
        className={`w-4 h-4 shrink-0 ${active ? 'brightness-0 invert' : ''}`}
      />
    );
  }
  const LucideIcon = icon;
  return (
    <LucideIcon
      size={16}
      className={`shrink-0 ${active ? 'text-white' : 'text-gray-600'}`}
    />
  );
}

const AdminSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.admin);
  const role = user?.role;
  const portalLabel = role === 'subadmin' ? 'Sub-admin Portal' : 'Admin Portal';
  // const [kycQueueCounts, setKycQueueCounts] = useState({
  //   pending: 0,
  //   resubmitted: 0,
  // });
  const [kycQueueCounts, setKycQueueCounts] = useState({
    pending: 0,
    resubmitted: 0,
  });
  const [kycChildCounts, setKycChildCounts] = useState({
    vendor: 0,
    customer: 0,
  });
  // const [hasNewOrder, setHasNewOrder] = useState(false);

  // const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // const checkNewOrders = () => {
  //   const token =
  //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  //   if (!token) return;
  //   apiGetAllOrders(token)
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const pathnameRef = useRef(pathname);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const checkNewOrders = () => {
    // Already viewing Live Orders — nothing to blink about, and prevents
    // the 30s poll from re-flagging orders you're currently looking at.
    if (pathnameRef.current?.startsWith('/orders')) {
      setHasNewOrder(false);
      return;
    }
    //   const token =
    //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    //   if (!token) return;
    //   apiGetAllOrders(token)
    //     .then((res) => {
    //       const list = Array.isArray(res.data) ? res.data : [];
    //       let lastSeenMs = null;
    //       try {
    //         const raw = localStorage.getItem(ADMIN_ORDERS_LAST_SEEN_KEY);
    //         if (raw) {
    //           const t = new Date(raw).getTime();
    //           if (!Number.isNaN(t)) lastSeenMs = t;
    //         }
    //       } catch {
    //         lastSeenMs = null;
    //       }
    //       const hasUnseen = list.some((o) => {
    //         const t = new Date(o.createdAt || 0).getTime();
    //         if (lastSeenMs == null) return true;
    //         return !Number.isNaN(t) && t > lastSeenMs;
    //       });
    //       setHasNewOrder(hasUnseen);
    //     })
    //     .catch(() => {
    //       /* silent */
    //     });
    // };

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) return;
    Promise.all([
      apiGetAllOrders(token).catch(() => ({ data: [] })),
      apiGetAllServiceBookings(token).catch(() => ({ data: [] })),
    ])
      .then(([ordersRes, bookingsRes]) => {
        const orderList = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const bookingList = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : [];
        let lastSeenMs = null;
        try {
          const raw = localStorage.getItem(ADMIN_ORDERS_LAST_SEEN_KEY);
          if (raw) {
            const t = new Date(raw).getTime();
            if (!Number.isNaN(t)) lastSeenMs = t;
          }
        } catch {
          lastSeenMs = null;
        }
        const hasUnseen = [...orderList, ...bookingList].some((o) => {
          const t = new Date(o.createdAt || 0).getTime();
          if (lastSeenMs == null) return true;
          return !Number.isNaN(t) && t > lastSeenMs;
        });
        setHasNewOrder(hasUnseen);
      })
      .catch(() => {
        /* silent */
      });
  };

  useEffect(() => {
    checkNewOrders();
    const id = setInterval(checkNewOrders, 30_000);
    const onNewOrderEvent = () => setHasNewOrder(true);
    window.addEventListener('admin-new-order', onNewOrderEvent);
    return () => {
      clearInterval(id);
      window.removeEventListener('admin-new-order', onNewOrderEvent);
    };
  }, []);
  // useEffect(() => {
  //   if (pathname?.startsWith('/orders')) {
  useEffect(() => {
    pathnameRef.current = pathname;
    if (pathname?.startsWith('/orders')) {
      try {
        localStorage.setItem(
          ADMIN_ORDERS_LAST_SEEN_KEY,
          new Date().toISOString(),
        );
      } catch {
        /* ignore */
      }
      setHasNewOrder(false);
    }
  }, [pathname]);

  const logout = async () => {
    await dispatch(adminLogout());
    router.push('/admin-login');
  };

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) return;
    Promise.all([
      apiGetVendorKycQueue(token).catch(() => null),
      apiGetCustomerKycQueue(token).catch(() => null),
    ]).then(([vendorRes, customerRes]) => {
      const vc = vendorRes?.data?.counts || {};
      const cc = customerRes?.data?.counts || {};
      const vendorPending = (vc.pending || 0) + (vc.resubmitted || 0);
      const customerPending = (cc.pending || 0) + (cc.inReview || 0);
      setKycQueueCounts({
        pending: vc.pending || 0,
        resubmitted: vc.resubmitted || 0,
      });
      setKycChildCounts({
        vendor: vendorPending,
        customer: customerPending,
      });
    });
  }, []);

  // ---------------------------------------------------------------------
  // Nav structure — matches the requested order:
  // 1 Dashboard, 2 Analytics, 3 KYC, 4 Stores, 5 Products & Custom Listing,
  // 6 Cart, 7 Wishlist, 8 Live Orders, 9 Partners, 10 Tickets, 11 Offers,
  // 12 Finance, 13 System, 14 Growth Plan, 15 CMS Management,
  // 16 Sub-Admin Approval, then Logout.
  // ---------------------------------------------------------------------
  const navGroups = [
    {
      type: 'link',
      key: 'dashboard',
      to: '/dashboard',
      label: 'Dashboard',
      icon: dashboardIcon,
    },
    {
      type: 'group',
      key: 'analytics',
      label: 'Analytics',
      icon: analyticsIcon,
      matchPrefix: '/analytics',
      children: [
        {
          to: '/analytics/financial-performance',
          label: 'Financial Performance',
        },
        { to: '/analytics/order-analytics', label: 'Order Analytics' },
        { to: '/analytics/cities', label: 'Cities' },
        { to: '/analytics/life-line', label: 'Life Line' },
        { to: '/analytics/zone-perfomance', label: 'Zone Perfomance' },
        {
          to: '/analytics/cat-subcat-analytics',
          label: 'Categories Perfomance',
        },
      ],
    },
    {
      type: 'group',
      key: 'kyc',
      label: 'KYC',
      icon: kycIcon,
      matchPrefix: '/kyc',
      badge:
        kycQueueCounts.pending +
        kycQueueCounts.resubmitted +
        kycChildCounts.customer,
      children: [
        { to: '/kyc/vendor', label: 'Vendor', badge: kycChildCounts.vendor },
        {
          to: '/kyc/customer',
          label: 'Customer',
          badge: kycChildCounts.customer,
        },
      ],
    },
    {
      type: 'link',
      key: 'stores',
      to: '/stores',
      label: 'Stores',
      icon: storeIcon,
    },
    {
      type: 'group',
      key: 'products-custom-listing',
      label: 'Products & Listing',
      icon: productOffersIcon,
      matchPrefix: null,
      matchExact: ['/global-products', '/custom-listings'],
      children: [
        { to: '/global-products', label: 'Global Products' },
        { to: '/custom-listings', label: 'Custom Listing' },
      ],
    },
    {
      type: 'link',
      key: 'cart',
      to: '/cart',
      label: 'Cart',
      icon: cartIcon,
    },
    {
      type: 'link',
      key: 'wishlist',
      to: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
    },
    {
      type: 'link',
      key: 'live-orders',
      to: '/orders',
      label: 'Live Orders',
      icon: ordersIcon,
      showNewOrderDot: true,
    },
    {
      type: 'group',
      key: 'partners',
      label: 'Partners',
      icon: peopleIcon,
      matchExact: ['/all-vendors', '/users'],
      children: [
        { to: '/all-vendors', label: 'Vendors' },
        { to: '/users', label: 'Customers' },
        // { to: '/welcome-kit', label: 'Welcome Kit' },
      ],
    },
    {
      type: 'link',
      key: 'tickets',
      to: '/system/tickets',
      label: 'Tickets',
      icon: Ticket,
      matchPrefix: '/system/tickets',
    },
    {
      type: 'group',
      key: 'offers',
      label: 'Offers',
      icon: Tag,
      matchExact: ['/products-offers'],
      matchPrefix: '/system/coupons',
      children: [
        { to: '/products-offers', label: 'Offers' },
        { to: '/system/coupons', label: 'Coupons' },
      ],
    },
    {
      type: 'group',
      key: 'finance',
      label: 'Finance',
      icon: IndianRupee,
      matchPrefix: null,
      matchExact: [
        '/reminders',
        '/finances/systeminvoice',
        '/finances/transaction',
        '/finances/refunds',
        '/finances/settlements',
        '/finances/cancellations',
        '/finances/referrals',
        '/finances/bank-verification',
      ],
      children: [
        { to: '/reminders', label: 'Reminders' },
        { to: '/finances/systeminvoice', label: 'System Invoice' },
        { to: '/finances/transaction', label: 'Transaction' },
        { to: '/finances/refunds', label: 'Refunds' },
        { to: '/finances/settlements', label: 'Settlements' },
        { to: '/finances/cancellations', label: 'Cancellations' },
        { to: '/finances/referrals', label: 'Referrals' },
        { to: '/finances/bank-verification', label: 'Bank Verification' },
      ],
    },
    {
      type: 'group',
      key: 'system',
      label: 'System',
      icon: systemsIcon,
      matchPrefix: null,
      matchExact: [
        '/categories',
        '/system/approval',
        '/system/refund-approval',
        '/system/featured',
        '/system/commission',
        //   '/system/banners',
        //   '/system/contact-enquiries',
        //   '/finances/tax',
        // ],
        // children: [
        //   { to: '/system/approval', label: 'Product Approval' },
        //   { to: '/system/refund-approval', label: 'Refund Approval' },
        //   { to: '/system/featured', label: 'Featured' },
        //   { to: '/categories', label: 'Categories' },
        //   { to: '/system/commission', label: 'Commission' },
        //   { to: '/finances/tax', label: 'Tax' },
        //   { to: '/system/banners', label: 'Banners' },
        //   { to: '/system/contact-enquiries', label: 'Contact Enquiries' },
        '/system/contact-enquiries',
        '/finances/tax',
      ],
      children: [
        { to: '/system/approval', label: 'Product Approval' },
        { to: '/system/refund-approval', label: 'Refund Approval' },
        { to: '/system/featured', label: 'Featured' },
        { to: '/categories', label: 'Categories' },
        { to: '/system/commission', label: 'Commission' },
        { to: '/finances/tax', label: 'Tax' },
        { to: '/system/contact-enquiries', label: 'Contact Enquiries' },
        // { to: '/system/rent-banners', label: 'Rent Banners' },
        // { to: '/system/buy-banners', label: 'Buy Banners' },
      ],
    },
    {
      type: 'link',
      key: 'growth-plan',
      to: '/finances/growth-plan',
      label: 'Growth Plan',
      icon: TrendingUp,
    },
    // {
    //   type: 'group',
    //   key: 'cms-management',
    //   label: 'CMS Management',
    //   icon: Megaphone,
    //   matchExact: [
    //     '/system/rent-offer',
    //     '/system/rent-as-banners',
    //     '/system/buy-advertisements',
    //     '/system/advertisements',
    //   ],
    //   children: [
    //     { to: '/system/rent-offer', label: 'Rental Offers' },

    //     { to: '/system/rent-as-banners', label: 'RentAs Banners' },
    //     { to: '/system/advertisements', label: ' Advertisements' },
    //     { to: '/system/buy-advertisements', label: 'Buy Advertisements' },
    //     {
    //       to: '/system/service-advertisements',
    //       label: 'Service Advertisements',
    //     },
    //   ],
    // },

    {
      type: 'group',
      key: 'banners',
      label: 'Banners',
      icon: Megaphone,
      matchExact: [
        '/system/banners',
        '/system/rent-offer',
        '/system/rent-as-banners',
        '/system/advertisements',
        '/system/buy-advertisements',
        '/system/service-advertisements',
      ],
      children: [
        { to: '/system/banners', label: 'Main Banners' },
        // {
        //   key: 'advertisement-banner',
        //   label: 'Advertisement Banner',
        //   subChildren: [
        //     { to: '/system/rent-offer', label: 'Rental Offers' },
        //     { to: '/system/rent-as-banners', label: 'RentAs Banners' },
        //     { to: '/system/advertisements', label: 'Advertisements' },
        //     { to: '/system/buy-advertisements', label: 'Buy Advertisements' },
        //     {
        //       to: '/system/service-advertisements',
        //       label: 'Service Advertisements',
        //     },
        //   ],
        // },
        { to: '/system/advertisements', label: 'Advertisement Banners' },
      ],
    },
    {
      type: 'link',
      key: 'sub-admin-approval',
      to: '/system/subadmin-approval',
      label: 'Sub-Admins',
      icon: UserCheck,
      adminOnly: true,
    },
    {
      type: 'link',
      key: 'settings',
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      adminOnly: true,
    },
  ];

  // open/closed state per collapsible group key
  const [openGroups, setOpenGroups] = useState({});
  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // const isGroupActive = (group) => {
  //   if (group.matchPrefix && pathname?.startsWith(group.matchPrefix))
  //     return true;
  //   if (
  //     group.matchExact &&
  //     group.matchExact.some(
  //       (p) => pathname === p || pathname?.startsWith(`${p}/`),
  //     )
  //   ) {
  //     return true;
  //   }
  //   return false;
  // };
  const isGroupActive = (group) => {
    if (
      group.matchPrefix &&
      (pathname === group.matchPrefix ||
        pathname?.startsWith(group.matchPrefix + '/'))
    )
      return true;
    if (
      group.matchExact &&
      group.matchExact.some(
        (p) => pathname === p || pathname?.startsWith(`${p}/`),
      )
    ) {
      return true;
    }
    return false;
  };

  // const isChildActive = (child) =>
  //   pathname === child.to || pathname?.startsWith(`${child.to}/`);
  const isChildActive = (child) =>
    pathname === child.to || pathname?.startsWith(`${child.to}/`);

  const isSubGroupActive = (subChildren) =>
    subChildren.some((sc) => isChildActive(sc));

  return (
    <>
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className={`md:hidden fixed top-3 z-[1202] w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 ${
          mobileOpen
            ? 'right-3 left-auto bg-[#FF7020] text-white border border-[#FF7020]'
            : 'left-3 right-auto bg-white text-gray-600 border border-gray-200'
        }`}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {mobileOpen ? (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[1200]"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* <aside
        className={`fixed md:sticky inset-y-0 left-0 md:top-0 z-[1201] bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200 flex flex-col h-screen overflow-hidden w-56 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarOpen ? 'md:w-56' : 'md:w-16'}`}
      > */}
      <aside
        className={`fixed md:sticky inset-y-0 left-0 md:top-0 z-[1201] bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200 flex flex-col h-[100dvh] md:h-screen overflow-hidden w-56 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarOpen ? 'md:w-56' : 'md:w-16'}`}
      >
        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <img
              src={RentnpayLogo.src}
              alt="Rentnpay"
              className="w-10 h-10 shrink-0 object-contain"
            />
            {sidebarOpen ? (
              <div className="leading-tight min-w-0">
                <p className="text-lg font-semibold text-black truncate">
                  Rentnpay
                </p>
                <p className="text-sm font-semibold text-gray-500">
                  {portalLabel}
                </p>
              </div>
            ) : null}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
          {navGroups.map((group) => {
            if (group.adminOnly && role !== 'admin') return null;

            if (group.type === 'link') {
              const isActive =
                pathname === group.to ||
                (group.matchPrefix && pathname?.startsWith(group.matchPrefix));
              return (
                <Link
                  key={group.key}
                  href={group.to}
                  onClick={() => setMobileOpen(false)}
                  className={`mx-2 px-3 py-2 rounded-lg text-sm flex items-center text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
                    isActive
                      ? 'bg-[#FF7020] text-white font-medium shadow-sm'
                      : ''
                  }`}
                  title={group.label}
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <GroupIcon icon={group.icon} active={isActive} />
                    {sidebarOpen ? group.label : group.label.charAt(0)}
                    {group.showNewOrderDot && hasNewOrder ? (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            }

            // collapsible group
            const active = isGroupActive(group);
            const open = !!openGroups[group.key];
            return (
              <div className="mx-2 mt-1" key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
                    active
                      ? 'bg-[#FF7020] text-white font-medium shadow-sm'
                      : ''
                  }`}
                  title={group.label}
                >
                  <span className="inline-flex items-center gap-2">
                    <GroupIcon icon={group.icon} active={active} />
                    {sidebarOpen ? group.label : group.label.charAt(0)}
                    {sidebarOpen && group.badge > 0 && !open ? (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 text-white font-medium">
                        {group.badge > 9 ? '9+' : group.badge}
                      </span>
                    ) : null}
                  </span>
                  {sidebarOpen ? (
                    open ? (
                      <ChevronDown
                        size={18}
                        className={
                          active
                            ? 'text-white fill-white'
                            : 'text-gray-400 fill-gray-400'
                        }
                      />
                    ) : (
                      <ChevronRight
                        size={18}
                        className={
                          active
                            ? 'text-white fill-white'
                            : 'text-gray-400 fill-gray-400'
                        }
                      />
                    )
                  ) : null}
                </button>
                {/* {sidebarOpen && open ? (
                  <div className="mt-1 ml-2 space-y-0.5">
                    {group.children.map((child) => (
                      <Link
                        key={child.to}
                        href={child.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
                          isChildActive(child)
                            ? 'bg-orange-50 text-orange-600 font-medium'
                            : ''
                        }`}
                      >
                        <span>{child.label}</span>
                        {child.badge > 0 ? (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 text-white font-medium leading-none">
                            {child.badge > 9 ? '9+' : child.badge}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ) : null} */}
                {sidebarOpen && open ? (
                  <div className="mt-1 ml-2 space-y-0.5">
                    {group.children.map((child) => {
                      if (child.subChildren) {
                        const subOpen = !!openGroups[child.key];
                        const subActive = isSubGroupActive(child.subChildren);
                        return (
                          <div key={child.key}>
                            <button
                              type="button"
                              onClick={() => toggleGroup(child.key)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
                                subActive
                                  ? 'bg-orange-50 text-orange-600 font-medium'
                                  : ''
                              }`}
                            >
                              <span>{child.label}</span>
                              {subOpen ? (
                                <ChevronDown
                                  size={16}
                                  className="text-gray-400"
                                />
                              ) : (
                                <ChevronRight
                                  size={16}
                                  className="text-gray-400"
                                />
                              )}
                            </button>
                            {subOpen ? (
                              <div className="mt-1 ml-2 space-y-0.5">
                                {child.subChildren.map((sc) => (
                                  <Link
                                    key={sc.to}
                                    href={sc.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
                                      isChildActive(sc)
                                        ? 'bg-orange-50 text-orange-600 font-medium'
                                        : ''
                                    }`}
                                  >
                                    <span>{sc.label}</span>
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={child.to}
                          href={child.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 ${
                            isChildActive(child)
                              ? 'bg-orange-50 text-orange-600 font-medium'
                              : ''
                          }`}
                        >
                          <span>{child.label}</span>
                          {child.badge > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] px-1 rounded-full bg-red-500 text-white font-medium leading-none">
                              {child.badge > 9 ? '9+' : child.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        {/* <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          > */}
        <div
          className="border-t border-gray-100 p-4 shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            {sidebarOpen ? (
              <span className="text-sm font-bold">Logout</span>
            ) : null}
          </button>
        </div>
      </aside>

      {logoutConfirmOpen ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Log Out
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to log out of your admin account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  logout();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
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
export default AdminSidebar;
