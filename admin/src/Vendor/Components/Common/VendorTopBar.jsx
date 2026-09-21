// 'use client';

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { useSelector } from 'react-redux';
// import { useRouter, usePathname } from 'next/navigation';
// import {
//   Eye,
//   LayoutDashboard,
//   ShieldCheck,
//   Store,
//   Package,
//   ShoppingCart,
//   Wallet,
//   Rocket,
//   Users,
//   Ticket,
//   Tag,
// } from 'lucide-react';
// import {
//   apiGetVendorNotifications,
//   apiGetMyVendorKyc,
// } from '../../../service/api';
// import VendorNewOrderModal from '../Modals/VendorNewOrderModal';
// import VendorReturnRequestedModal from '../Modals/VendorReturnRequestedModal';

// function clearedStorageKey(vendorId) {
//   const id = vendorId || 'session';
//   return `vendorNotifLastClearedAt:${id}`;
// }

// function formatRelativeTime(date) {
//   if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
//   const sec = Math.floor((Date.now() - date.getTime()) / 1000);
//   if (sec < 45) return 'just now';
//   if (sec < 3600) return `${Math.max(1, Math.floor(sec / 60))} min ago`;
//   if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
//   if (sec < 604800) return `${Math.floor(sec / 86400)} day ago`;
//   return date.toLocaleDateString();
// }

// const VendorTopBar = () => {
//   const { user, token: reduxToken } = useSelector((state) => state.vendor);
//   const router = useRouter();
//   const pathname = usePathname();
//   const [mounted, setMounted] = useState(false);
//   const [kycAppId, setKycAppId] = useState('');
//   const [notificationsOpen, setNotificationsOpen] = useState(false);
//   const [, bumpRelativeLabels] = useState(0);
//   const wrapRef = useRef(null);

//   const [notifications, setNotifications] = useState([]);
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [notificationsLoading, setNotificationsLoading] = useState(false);
//   const [notificationsError, setNotificationsError] = useState(null);
//   /** Bumps when user opens the panel so badge recalculates after “mark seen” */
//   const [lastClearedVersion, setLastClearedVersion] = useState(0);
//   const [orderModalId, setOrderModalId] = useState(null);
//   const [returnModal, setReturnModal] = useState({
//     orderId: null,
//     productId: null,
//   });

//   // const vendorId = user?._id || user?.id || '';
//   const vendorId = user?._id || user?.id || '';
//   const [expiredToast, setExpiredToast] = useState(null);
//   const toastTimerRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//     };
//   }, []);

//   // const loadNotifications = useCallback(async () => {
//   //   const token =
//   //     typeof window !== 'undefined'
//   //       ? localStorage.getItem('vendorToken')
//   //       : null;
//   //   if (!token) {
//   //     setNotifications([]);
//   //     setNotificationCount(0);
//   //     return;
//   //   }
//   //   setNotificationsLoading(true);
//   //   setNotificationsError(null);
//   //   try {
//   //     const { data } = await apiGetVendorNotifications(token);
//   //     const list = Array.isArray(data?.notifications) ? data.notifications : [];
//   //     setNotifications(list);
//   //     const c = Number(data?.count);
//   //     setNotificationCount(Number.isFinite(c) ? c : list.length);
//   //   } catch (e) {
//   //     setNotificationsError(
//   //       e?.response?.data?.message || e?.message || 'Failed to load',
//   //     );
//   //     setNotifications([]);
//   //     setNotificationCount(0);
//   //   } finally {
//   //     setNotificationsLoading(false);
//   //   }
//   // }, []);

//   const [ticketAlerts, setTicketAlerts] = useState([]);
//   const ticketAlertIdsRef = useRef(new Set());

//   const checkExpiredTickets = useCallback(async () => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) return;
//     try {
//       const { apiGetVendorTickets } = await import('../../../service/api');
//       const { data } = await apiGetVendorTickets(token);
//       const tickets = Array.isArray(data?.tickets) ? data.tickets : [];
//       const DEADLINE_MS = 2 * 60 * 1000; // change back to 72 * 60 * 60 * 1000 for production
//       tickets.forEach((t) => {
//         if (t.status === 'solved') return;
//         const created = new Date(t.createdAt).getTime();
//         const deadline = created + DEADLINE_MS;
//         if (Date.now() >= deadline && !ticketAlertIdsRef.current.has(t._id)) {
//           ticketAlertIdsRef.current.add(t._id);
//           const name = t.productName || t.queryId || 'ticket';
//           setTicketAlerts((prev) => [
//             {
//               id: `ticket-expired-${t._id}`,
//               title: 'Ticket Action Required',
//               detail: `Please check your "${name}" immediately`,
//               at: new Date().toISOString(),
//               type: 'ticket_alert',
//             },
//             ...prev,
//           ]);
//           setNotificationCount((c) => c + 1);
//         }
//       });
//     } catch {
//       /* silent */
//     }
//   }, []);

//   const loadNotifications = useCallback(async () => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) {
//       setNotifications([]);
//       setNotificationCount(0);
//       return;
//     }
//     setNotificationsLoading(true);
//     setNotificationsError(null);
//     try {
//       const { data } = await apiGetVendorNotifications(token);
//       const list = Array.isArray(data?.notifications) ? data.notifications : [];
//       setNotifications(list);
//       const c = Number(data?.count);
//       setNotificationCount(Number.isFinite(c) ? c : list.length);
//     } catch (e) {
//       setNotificationsError(
//         e?.response?.data?.message || e?.message || 'Failed to load',
//       );
//       setNotifications([]);
//       setNotificationCount(0);
//     } finally {
//       setNotificationsLoading(false);
//     }
//   }, []);
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (!pathname?.startsWith('/vendor-kyc-status')) return;
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) return;
//     apiGetMyVendorKyc(token)
//       .then((res) => {
//         const id = res.data?.kyc?._id;
//         setKycAppId(id ? `VND-${String(id).slice(-6).toUpperCase()}` : '');
//       })
//       .catch(() => setKycAppId(''));
//   }, [pathname]);

//   useEffect(() => {
//     loadNotifications();
//   }, [loadNotifications]);

//   useEffect(() => {
//     checkExpiredTickets();
//     const id = setInterval(checkExpiredTickets, 30_000);
//     return () => clearInterval(id);
//   }, [checkExpiredTickets]);

//   useEffect(() => {
//     if (!notificationsOpen) return;
//     loadNotifications();
//   }, [notificationsOpen, loadNotifications]);

//   useEffect(() => {
//     if (!notificationsOpen) return;
//     const id = setInterval(() => bumpRelativeLabels((t) => t + 1), 60_000);
//     return () => clearInterval(id);
//   }, [notificationsOpen]);

//   useEffect(() => {
//     if (!notificationsOpen) return;
//     const onKey = (e) => {
//       if (e.key === 'Escape') setNotificationsOpen(false);
//     };
//     document.addEventListener('keydown', onKey);
//     return () => document.removeEventListener('keydown', onKey);
//   }, [notificationsOpen]);

//   useEffect(() => {
//     if (!notificationsOpen) return;
//     const onPointer = (e) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target)) {
//         setNotificationsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', onPointer);
//     document.addEventListener('touchstart', onPointer);
//     return () => {
//       document.removeEventListener('mousedown', onPointer);
//       document.removeEventListener('touchstart', onPointer);
//     };
//   }, [notificationsOpen]);

//   const fullName = mounted ? user?.fullName : '';
//   const initialsName = mounted ? user?.fullName : '';

//   const visibleBadgeCount = useMemo(() => {
//     if (!mounted || typeof window === 'undefined') return 0;
//     let clearedMs = null;
//     try {
//       const raw = localStorage.getItem(clearedStorageKey(vendorId));
//       if (raw) {
//         const t = new Date(raw).getTime();
//         if (!Number.isNaN(t)) clearedMs = t;
//       }
//     } catch {
//       clearedMs = null;
//     }
//     if (clearedMs == null) {
//       return Math.min(Math.max(0, notificationCount), 99);
//     }
//     const unread = notifications.filter((n) => {
//       const t = new Date(n.at).getTime();
//       return !Number.isNaN(t) && t > clearedMs;
//     }).length;
//     return Math.min(unread, 99);
//   }, [mounted, notifications, notificationCount, lastClearedVersion, vendorId]);

//   const badgeText =
//     visibleBadgeCount > 99 ? '99+' : String(visibleBadgeCount || '');

//   const getVendorToken = useCallback(() => {
//     if (reduxToken) return reduxToken;
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('vendorToken');
//     }
//     return null;
//   }, [reduxToken]);

//   const orderIdFromNotification = (n) => {
//     if (n?.orderId) return n.orderId;
//     if (typeof n?.id === 'string' && n.id.startsWith('order-')) {
//       return n.id.slice('order-'.length);
//     }
//     return null;
//   };

//   const handleBellClick = () => {
//     if (notificationsOpen) {
//       setNotificationsOpen(false);
//       return;
//     }
//     if (typeof window !== 'undefined') {
//       try {
//         localStorage.setItem(
//           clearedStorageKey(vendorId),
//           new Date().toISOString(),
//         );
//       } catch {
//         /* ignore */
//       }
//     }
//     setLastClearedVersion((v) => v + 1);
//     setNotificationsOpen(true);
//   };

//   const pageInfoMap = [
//     {
//       to: '/vendor-dashboard',
//       label: 'Vendor Dashboard',
//       subtitle: 'Comprehensive financial overview and performance metrics',
//       icon: (
//         <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1E40AF] shadow-sm">
//           <LayoutDashboard className="h-6 w-6 text-white" strokeWidth={1.75} />
//         </span>
//       ),
//     },
//     {
//       to: '/vendor-kyc-status',
//       label: 'KYC & Verification Status',
//       subtitle: kycAppId ? `Application ID: ${kycAppId}` : '',
//       icon: (
//         <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-green-400 via-emerald-500 to-teal-600 shadow-lg">
//           <ShieldCheck className="h-6 w-6 text-white" strokeWidth={1.75} />
//         </span>
//       ),
//     },
//     {
//       to: '/vendor/stores',
//       label: 'Active Stores',
//       subtitle: 'View and manage stores',
//       icon: (
//         <span
//           className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30 ring-1 ring-violet-400/30"
//           aria-hidden
//         >
//           <Store className="h-6 w-6 text-white" strokeWidth={1.75} />
//         </span>
//       ),
//     },
//     {
//       to: '/vendor-products',
//       label: 'Inventory Overview',
//       subtitle: 'Manage your product stock and availability',
//       icon: (
//         <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1E3A8A] shadow-md">
//           <Package className="w-6 h-6 text-white" strokeWidth={1.75} />
//         </div>
//       ),
//     },
//     {
//       to: '/vendor/orders',
//       label: 'Orders',
//       subtitle: 'Customers who ordered your products.',
//       icon: (
//         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#38BDF8] to-[#2563EB] shadow-lg">
//           <ShoppingCart className="h-6 w-6 text-white" strokeWidth={1.75} />
//         </div>
//       ),
//     },
//     {
//       to: '/vendor/earnings-payout',
//       label: 'Earnings & Payout',
//       subtitle: 'Track your earnings, settlements, and payment schedules',
//       icon: (
//         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-600 shadow-lg">
//           <Wallet className="h-6 w-6 text-white" />
//         </div>
//       ),
//     },
//     {
//       to: '/vendor/ads-plans',
//       label: 'Growth & Advertising',
//       subtitle:
//         'Boost your visibility and get more customers with our premium plans.',
//       icon: (
//         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 shadow-lg">
//           <Rocket size={22} className="text-white" />
//         </div>
//       ),
//     },
//     {
//       to: '/vendor/customers',
//       label: 'Customers',
//       subtitle: 'Track customer lifecycle with dynamic platform data',
//       icon: (
//         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-400 via-fuchsia-500 to-purple-600 shadow-lg">
//           <Users className="h-6 w-6 text-white" strokeWidth={1.75} />
//         </div>
//       ),
//     },
//     {
//       to: '/vendor/tickets',
//       label: 'Customer Queries',
//       subtitle: 'Manage Customer Queries',
//       icon: (
//         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 shadow-lg">
//           <Ticket className="h-6 w-6 text-white" strokeWidth={1.75} />
//         </div>
//       ),
//     },
//     {
//       to: '/vendor/offers',
//       label: 'Product Offers & Promotions',
//       subtitle: 'Create and manage promotional offers for your products',
//       icon: (
//         <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-400 via-pink-500 to-fuchsia-600 shadow-lg">
//           <Tag className="h-6 w-6 text-white" strokeWidth={1.75} />
//         </div>
//       ),
//     },
//   ];

//   const currentPageInfo =
//     pageInfoMap.find(
//       (item) => pathname === item.to || pathname?.startsWith(item.to + '/'),
//     ) || pageInfoMap[0];

//   return (
//     <header className="w-full bg-white border-b border-gray-200 pl-14 md:pl-4 lg:pl-6 pr-3 sm:pr-4 lg:pr-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20">
//       {expiredToast && (
//         <div className="fixed bottom-5 right-5 z-[99] flex items-start gap-3 rounded-xl border border-red-200 bg-white shadow-xl px-4 py-3 max-w-xs animate-bounce-once">
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-semibold text-red-700">
//               Action Required
//             </p>
//             <p className="text-xs text-gray-600 mt-0.5">{expiredToast}</p>
//           </div>
//           <button
//             type="button"
//             onClick={() => setExpiredToast(null)}
//             className="text-gray-400 hover:text-gray-600 text-lg leading-none"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {notificationsOpen && (
//         <button
//           type="button"
//           aria-label="Close notifications"
//           className="fixed inset-0 z-30 bg-black/20 md:bg-transparent"
//           onClick={() => setNotificationsOpen(false)}
//         />
//       )}

//       <div className="flex items-center gap-3 min-w-0">
//         {currentPageInfo.icon}
//         <div className="flex flex-col min-w-0">
//           <h1 className="text-xl md:text-xl font-semibold text-black truncate">
//             {currentPageInfo.label}
//           </h1>
//           {currentPageInfo.subtitle ? (
//             <p className="text-xs sm:text-sm text-gray-500 truncate">
//               {currentPageInfo.subtitle}
//             </p>
//           ) : null}
//         </div>
//       </div>
//       <div className="flex items-center gap-2 sm:gap-3">
//         <div className="flex items-center gap-2 relative" ref={wrapRef}>
//           <button
//             type="button"
//             onClick={handleBellClick}
//             aria-expanded={notificationsOpen}
//             aria-haspopup="dialog"
//             className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
//           >
//             <span className="sr-only">Notifications</span>
//             {visibleBadgeCount > 0 && (
//               <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
//                 {badgeText}
//               </span>
//             )}
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.8}
//                 d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//               />
//             </svg>
//           </button>

//           {notificationsOpen && (
//             <div
//               role="dialog"
//               aria-label="Notifications"
//               className="fixed left-3 right-3 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,22rem)] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
//             >
//               <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
//                 <p className="text-sm font-semibold text-gray-900">
//                   Notifications
//                 </p>
//                 <span className="text-[11px] text-gray-400">
//                   Last 10 updates
//                 </span>
//               </div>
//               {notificationsLoading && (
//                 <p className="px-4 py-6 text-sm text-gray-500 text-center">
//                   Loading…
//                 </p>
//               )}
//               {!notificationsLoading && notificationsError && (
//                 <p className="px-4 py-6 text-sm text-red-600 text-center">
//                   {notificationsError}
//                 </p>
//               )}
//               {!notificationsLoading &&
//                 !notificationsError &&
//                 notifications.length === 0 &&
//                 ticketAlerts.length === 0 && (
//                   <p className="px-4 py-6 text-sm text-gray-500 text-center">
//                     No recent activity yet.
//                   </p>
//                 )}
//               {!notificationsLoading &&
//                 !notificationsError &&
//                 (notifications.length > 0 || ticketAlerts.length > 0) && (
//                   <ul className="max-h-[min(70vh,20rem)] overflow-y-auto divide-y divide-gray-50 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//                     {/* {[...ticketAlerts, ...notifications]
//                       .slice(0, 10)
//                       .map((n) => {
//                         const at =
//                           n.at != null ? new Date(n.at) : new Date(NaN);
//                         const oid = orderIdFromNotification(n);
//                         const showView =
//                           (n.type === 'order' || n.type === 'return_request') &&
//                           oid;
//                         return (
//                           <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
//                             <div className="flex items-start gap-2">
//                               <div className="flex-1 min-w-0">
//                                 <p className="text-sm font-medium text-gray-900">
//                                   {n.title}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
//                                   {n.detail}
//                                 </p>
//                                 <p className="text-[11px] text-gray-400 mt-1">
//                                   {formatRelativeTime(at)}
//                                 </p>
//                               </div>
//                               {showView ? (
//                                 <button
//                                   type="button"
//                                   className="shrink-0 inline-flex items-center justify-center w-8 h-8 text-[#F97316] border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100"
//                                   onClick={() => {
//                                     if (n.type === 'return_request') {
//                                       setReturnModal({
//                                         orderId: oid,
//                                         productId: n.productId || null,
//                                       });
//                                     } else {
//                                       setOrderModalId(oid);
//                                     }
//                                     setNotificationsOpen(false);
//                                     loadNotifications();
//                                   }}
//                                   aria-label="View notification"
//                                 >
//                                   <Eye className="w-4 h-4" />
//                                 </button>
//                               ) : null}
//                             </div>
//                           </li>
//                         );
//                       })} */}

//                     {[...ticketAlerts, ...notifications]
//                       .slice(0, 10)
//                       .map((n) => {
//                         const at =
//                           n.at != null ? new Date(n.at) : new Date(NaN);
//                         const oid = orderIdFromNotification(n);
//                         const isTicketAlert = n.type === 'ticket_alert';
//                         const showView =
//                           isTicketAlert ||
//                           ((n.type === 'order' ||
//                             n.type === 'return_request') &&
//                             oid);
//                         return (
//                           <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
//                             <div className="flex items-start gap-2">
//                               <div className="flex-1 min-w-0">
//                                 <p className="text-sm font-medium text-gray-900">
//                                   {n.title}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
//                                   {n.detail}
//                                 </p>
//                                 <p className="text-[11px] text-gray-400 mt-1">
//                                   {formatRelativeTime(at)}
//                                 </p>
//                               </div>
//                               {showView ? (
//                                 <button
//                                   type="button"
//                                   className="shrink-0 inline-flex items-center justify-center w-8 h-8 text-[#F97316] border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100"
//                                   onClick={() => {
//                                     if (isTicketAlert) {
//                                       setNotificationsOpen(false);
//                                       router.push('/vendor/tickets');
//                                     } else if (n.type === 'return_request') {
//                                       setReturnModal({
//                                         orderId: oid,
//                                         productId: n.productId || null,
//                                       });
//                                       setNotificationsOpen(false);
//                                       loadNotifications();
//                                     } else {
//                                       setOrderModalId(oid);
//                                       setNotificationsOpen(false);
//                                       loadNotifications();
//                                     }
//                                   }}
//                                   aria-label="View notification"
//                                 >
//                                   <Eye className="w-4 h-4" />
//                                 </button>
//                               ) : null}
//                             </div>
//                           </li>
//                         );
//                       })}
//                   </ul>
//                 )}
//             </div>
//           )}

//           <VendorNewOrderModal
//             open={Boolean(orderModalId)}
//             orderId={orderModalId}
//             vendorIdStr={String(user?.id || user?._id || '')}
//             getToken={getVendorToken}
//             onClose={() => {
//               setOrderModalId(null);
//               loadNotifications();
//             }}
//           />

//           <VendorReturnRequestedModal
//             open={Boolean(returnModal.orderId)}
//             orderId={returnModal.orderId}
//             productId={returnModal.productId}
//             vendorIdStr={String(user?.id || user?._id || '')}
//             getToken={getVendorToken}
//             onClose={() => {
//               setReturnModal({ orderId: null, productId: null });
//               loadNotifications();
//             }}
//           />

//           <div className="hidden lg:flex items-center gap-2">
//             <div className="text-right">
//               <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
//                 {fullName || 'User Name'}
//               </p>
//               <p className="text-[11px] text-gray-400">Vendor</p>
//             </div>
//             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
//               {(initialsName || '')?.[0]?.toUpperCase() || 'U'}
//             </div>
//           </div>
//           <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
//             {(initialsName || '')?.[0]?.toUpperCase() || 'U'}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default VendorTopBar;

'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import {
  Eye,
  LayoutDashboard,
  ShieldCheck,
  Store,
  Package,
  ShoppingCart,
  Wallet,
  Rocket,
  Users,
  Ticket,
  Tag,
  Settings,
  ArrowRightLeft,
  RotateCcw,
  CircleX,
} from 'lucide-react';
import {
  apiGetVendorNotifications,
  apiGetMyVendorKyc,
} from '../../../service/api';
import VendorNewOrderModal from '../Modals/VendorNewOrderModal';
import VendorReturnRequestedModal from '../Modals/VendorReturnRequestedModal';
import VendorNewServiceBookingModal from '../Modals/VendorNewServiceBookingModal';

function clearedStorageKey(vendorId) {
  const id = vendorId || 'session';
  return `vendorNotifLastClearedAt:${id}`;
}

function formatRelativeTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 45) return 'just now';
  if (sec < 3600) return `${Math.max(1, Math.floor(sec / 60))} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} day ago`;
  return date.toLocaleDateString();
}

const VendorTopBar = () => {
  const { user, token: reduxToken } = useSelector((state) => state.vendor);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [kycAppId, setKycAppId] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [, bumpRelativeLabels] = useState(0);
  const wrapRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  /** Bumps when user opens the panel so badge recalculates after “mark seen” */
  const [lastClearedVersion, setLastClearedVersion] = useState(0);
  const [orderModalId, setOrderModalId] = useState(null);
  const [returnModal, setReturnModal] = useState({
    orderId: null,
    productId: null,
  });
  const [serviceBookingModalId, setServiceBookingModalId] = useState(null);

  // const vendorId = user?._id || user?.id || '';
  const vendorId = user?._id || user?.id || '';
  const [expiredToast, setExpiredToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // const loadNotifications = useCallback(async () => {
  //   const token =
  //     typeof window !== 'undefined'
  //       ? localStorage.getItem('vendorToken')
  //       : null;
  //   if (!token) {
  //     setNotifications([]);
  //     setNotificationCount(0);
  //     return;
  //   }
  //   setNotificationsLoading(true);
  //   setNotificationsError(null);
  //   try {
  //     const { data } = await apiGetVendorNotifications(token);
  //     const list = Array.isArray(data?.notifications) ? data.notifications : [];
  //     setNotifications(list);
  //     const c = Number(data?.count);
  //     setNotificationCount(Number.isFinite(c) ? c : list.length);
  //   } catch (e) {
  //     setNotificationsError(
  //       e?.response?.data?.message || e?.message || 'Failed to load',
  //     );
  //     setNotifications([]);
  //     setNotificationCount(0);
  //   } finally {
  //     setNotificationsLoading(false);
  //   }
  // }, []);

  const [ticketAlerts, setTicketAlerts] = useState([]);
  const ticketAlertIdsRef = useRef(new Set());

  const checkExpiredTickets = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) return;
    try {
      const { apiGetVendorTickets } = await import('../../../service/api');
      const { data } = await apiGetVendorTickets(token);
      const tickets = Array.isArray(data?.tickets) ? data.tickets : [];
      const DEADLINE_MS = 2 * 60 * 1000; // change back to 72 * 60 * 60 * 1000 for production
      tickets.forEach((t) => {
        if (t.status === 'solved') return;
        const created = new Date(t.createdAt).getTime();
        const deadline = created + DEADLINE_MS;
        if (Date.now() >= deadline && !ticketAlertIdsRef.current.has(t._id)) {
          ticketAlertIdsRef.current.add(t._id);
          const name = t.productName || t.queryId || 'ticket';
          setTicketAlerts((prev) => [
            {
              id: `ticket-expired-${t._id}`,
              title: 'Ticket Action Required',
              detail: `Please check your "${name}" immediately`,
              at: new Date().toISOString(),
              type: 'ticket_alert',
            },
            ...prev,
          ]);
          setNotificationCount((c) => c + 1);
        }
      });
    } catch {
      /* silent */
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const { data } = await apiGetVendorNotifications(token);
      const list = Array.isArray(data?.notifications) ? data.notifications : [];
      setNotifications(list);
      const c = Number(data?.count);
      setNotificationCount(Number.isFinite(c) ? c : list.length);
    } catch (e) {
      setNotificationsError(
        e?.response?.data?.message || e?.message || 'Failed to load',
      );
      setNotifications([]);
      setNotificationCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pathname?.startsWith('/vendor-kyc-status')) return;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) return;
    apiGetMyVendorKyc(token)
      .then((res) => {
        const id = res.data?.kyc?._id;
        setKycAppId(id ? `VND-${String(id).slice(-6).toUpperCase()}` : '');
      })
      .catch(() => setKycAppId(''));
  }, [pathname]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    checkExpiredTickets();
    const id = setInterval(checkExpiredTickets, 30_000);
    return () => clearInterval(id);
  }, [checkExpiredTickets]);

  useEffect(() => {
    if (!notificationsOpen) return;
    loadNotifications();
  }, [notificationsOpen, loadNotifications]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const id = setInterval(() => bumpRelativeLabels((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setNotificationsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [notificationsOpen]);

  const fullName = mounted ? user?.fullName : '';
  const initialsName = mounted ? user?.fullName : '';

  const visibleBadgeCount = useMemo(() => {
    if (!mounted || typeof window === 'undefined') return 0;
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
    if (clearedMs == null) {
      return Math.min(Math.max(0, notificationCount), 99);
    }
    const unread = notifications.filter((n) => {
      const t = new Date(n.at).getTime();
      return !Number.isNaN(t) && t > clearedMs;
    }).length;
    return Math.min(unread, 99);
  }, [mounted, notifications, notificationCount, lastClearedVersion, vendorId]);

  const badgeText =
    visibleBadgeCount > 99 ? '99+' : String(visibleBadgeCount || '');

  const getVendorToken = useCallback(() => {
    if (reduxToken) return reduxToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vendorToken');
    }
    return null;
  }, [reduxToken]);

  const orderIdFromNotification = (n) => {
    if (n?.orderId) return n.orderId;
    if (typeof n?.id === 'string' && n.id.startsWith('order-')) {
      return n.id.slice('order-'.length);
    }
    return null;
  };

  const handleBellClick = () => {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          clearedStorageKey(vendorId),
          new Date().toISOString(),
        );
      } catch {
        /* ignore */
      }
    }
    setLastClearedVersion((v) => v + 1);
    setNotificationsOpen(true);
  };

  const pageInfoMap = [
    {
      to: '/vendor-dashboard',
      label: 'Vendor Dashboard',
      subtitle: 'Comprehensive financial overview and performance metrics',
      icon: (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1E40AF] shadow-sm">
          <LayoutDashboard className="h-6 w-6 text-white" strokeWidth={1.75} />
        </span>
      ),
    },
    {
      to: '/vendor-kyc-status',
      label: 'KYC & Verification Status',
      subtitle: kycAppId ? `Application ID: ${kycAppId}` : '',
      icon: (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-green-400 via-emerald-500 to-teal-600 shadow-lg">
          <ShieldCheck className="h-6 w-6 text-white" strokeWidth={1.75} />
        </span>
      ),
    },
    {
      to: '/vendor/stores',
      label: 'Active Stores',
      subtitle: 'View and manage stores',
      icon: (
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30 ring-1 ring-violet-400/30"
          aria-hidden
        >
          <Store className="h-6 w-6 text-white" strokeWidth={1.75} />
        </span>
      ),
    },
    {
      to: '/vendor/settings',
      label: 'Settings',
      subtitle: 'Manage your account, business, and payout details.',
      icon: (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-400 via-gray-500 to-slate-600 shadow-lg">
          <Settings className="h-6 w-6 text-white" strokeWidth={1.75} />
        </span>
      ),
    },
    {
      to: '/vendor-products',
      label: 'Inventory Overview',
      subtitle: 'Manage your product stock and availability',
      icon: (
        <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1E3A8A] shadow-md">
          <Package className="w-6 h-6 text-white" strokeWidth={1.75} />
        </div>
      ),
    },
    {
      to: '/vendor/orders',
      label: 'Orders',
      subtitle: 'Customers who ordered your products.',
      icon: (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#38BDF8] to-[#2563EB] shadow-lg">
          <ShoppingCart className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>
      ),
    },
    // {
    //   to: '/vendor/earnings-payout',
    //   label: 'Earnings & Payout',
    //   subtitle: 'Track your earnings, settlements, and payment schedules',
    //   icon: (
    //     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-600 shadow-lg">
    //       <Wallet className="h-6 w-6 text-white" />
    //     </div>
    //   ),
    // },

    {
      to: '/vendor/earnings-payout/transaction',
      label: 'Transaction Summary',
      subtitle: 'Recent payouts and settlement history',
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-600 shadow-lg">
          <ArrowRightLeft className="h-6 w-6 text-white" />
        </div>
      ),
    },

    {
      to: '/vendor/earnings-payout/refunds',
      label: 'Refund Management',
      subtitle: 'Track and manage Refunds',
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#3B82F6] via-[#2563EB] to-[#1E3A8A]  shadow-lg">
          <RotateCcw className="h-6 w-6 text-white" />
        </div>
      ),
    },
    {
      to: '/vendor/earnings-payout/settlements',
      label: 'Settlements Management',
      subtitle: 'Track and manage vendor payouts and settlement cycles',
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 via-violet-600 to-fuchsia-600  shadow-lg">
          <Wallet className="h-6 w-6 text-white" />
        </div>
      ),
    },
    {
      to: '/vendor/earnings-payout/cancellation',
      label: 'Cancellations Management',
      subtitle: 'Track and manage Cancellations',
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-red-500 to-rose-400  shadow-lg">
          <CircleX className="h-6 w-6 text-white" />
        </div>
      ),
    },
    {
      to: '/vendor/ads-plans',
      label: 'Growth & Advertising',
      subtitle:
        'Boost your visibility and get more customers with our premium plans.',
      icon: (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 shadow-lg">
          <Rocket size={22} className="text-white" />
        </div>
      ),
    },
    {
      to: '/vendor/customers',
      label: 'Customers',
      subtitle: 'Track customer lifecycle with dynamic platform data',
      icon: (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-400 via-fuchsia-500 to-purple-600 shadow-lg">
          <Users className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>
      ),
    },
    {
      to: '/vendor/tickets',
      label: 'Customer Queries',
      subtitle: 'Manage Customer Queries',
      icon: (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-500 shadow-lg">
          <Ticket className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>
      ),
    },
    {
      to: '/vendor/offers',
      label: 'Product Offers & Promotions',
      subtitle: 'Create and manage promotional offers for your products',
      icon: (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-400 via-pink-500 to-fuchsia-600 shadow-lg">
          <Tag className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>
      ),
    },
  ];

  const currentPageInfo =
    pageInfoMap.find(
      (item) => pathname === item.to || pathname?.startsWith(item.to + '/'),
    ) || pageInfoMap[0];

  return (
    <header className="w-full bg-white border-b border-gray-200 pl-14 md:pl-4 lg:pl-6 pr-3 sm:pr-4 lg:pr-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20">
      {expiredToast && (
        <div className="fixed bottom-5 right-5 z-[99] flex items-start gap-3 rounded-xl border border-red-200 bg-white shadow-xl px-4 py-3 max-w-xs animate-bounce-once">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">
              Action Required
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{expiredToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setExpiredToast(null)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {notificationsOpen && (
        <button
          type="button"
          aria-label="Close notifications"
          className="fixed inset-0 z-30 bg-black/20 md:bg-transparent"
          onClick={() => setNotificationsOpen(false)}
        />
      )}

      <div className="flex items-center gap-3 min-w-0">
        {currentPageInfo.icon}
        <div className="flex flex-col min-w-0">
          <h1 className="text-xl md:text-xl font-semibold text-black truncate">
            {currentPageInfo.label}
          </h1>
          {currentPageInfo.subtitle ? (
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {currentPageInfo.subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 relative" ref={wrapRef}>
          <button
            type="button"
            onClick={handleBellClick}
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            <span className="sr-only">Notifications</span>
            {visibleBadgeCount > 0 && (
              <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
                {badgeText}
              </span>
            )}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {notificationsOpen && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="fixed left-3 right-3 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,22rem)] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  Notifications
                </p>
                <span className="text-[11px] text-gray-400">
                  Last 10 updates
                </span>
              </div>
              {notificationsLoading && (
                <p className="px-4 py-6 text-sm text-gray-500 text-center">
                  Loading…
                </p>
              )}
              {!notificationsLoading && notificationsError && (
                <p className="px-4 py-6 text-sm text-red-600 text-center">
                  {notificationsError}
                </p>
              )}
              {!notificationsLoading &&
                !notificationsError &&
                notifications.length === 0 &&
                ticketAlerts.length === 0 && (
                  <p className="px-4 py-6 text-sm text-gray-500 text-center">
                    No recent activity yet.
                  </p>
                )}
              {!notificationsLoading &&
                !notificationsError &&
                (notifications.length > 0 || ticketAlerts.length > 0) && (
                  <ul className="max-h-[min(70vh,20rem)] overflow-y-auto divide-y divide-gray-50 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
                    {/* {[...ticketAlerts, ...notifications]
                      .slice(0, 10)
                      .map((n) => {
                        const at =
                          n.at != null ? new Date(n.at) : new Date(NaN);
                        const oid = orderIdFromNotification(n);
                        const showView =
                          (n.type === 'order' || n.type === 'return_request') &&
                          oid;
                        return (
                          <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {n.detail}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-1">
                                  {formatRelativeTime(at)}
                                </p>
                              </div>
                              {showView ? (
                                <button
                                  type="button"
                                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 text-[#F97316] border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100"
                                  onClick={() => {
                                    if (n.type === 'return_request') {
                                      setReturnModal({
                                        orderId: oid,
                                        productId: n.productId || null,
                                      });
                                    } else {
                                      setOrderModalId(oid);
                                    }
                                    setNotificationsOpen(false);
                                    loadNotifications();
                                  }}
                                  aria-label="View notification"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              ) : null}
                            </div>
                          </li>
                        );
                      })} */}

                    {[...ticketAlerts, ...notifications]
                      .slice(0, 10)
                      .map((n) => {
                        const at =
                          n.at != null ? new Date(n.at) : new Date(NaN);
                        const oid = orderIdFromNotification(n);
                        const isTicketAlert = n.type === 'ticket_alert';
                        const isServiceBookingAlert =
                          n.type === 'service_booking';
                        const showView =
                          isTicketAlert ||
                          isServiceBookingAlert ||
                          ((n.type === 'order' ||
                            n.type === 'return_request') &&
                            oid);
                        return (
                          <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {n.detail}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-1">
                                  {formatRelativeTime(at)}
                                </p>
                              </div>
                              {showView ? (
                                <button
                                  type="button"
                                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 text-[#F97316] border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100"
                                  onClick={() => {
                                    if (isTicketAlert) {
                                      setNotificationsOpen(false);
                                      router.push('/vendor/tickets');
                                    } else if (isServiceBookingAlert) {
                                      setServiceBookingModalId(n.bookingId);
                                      setNotificationsOpen(false);
                                      loadNotifications();
                                    } else if (n.type === 'return_request') {
                                      setReturnModal({
                                        orderId: oid,
                                        productId: n.productId || null,
                                      });
                                      setNotificationsOpen(false);
                                      loadNotifications();
                                    } else {
                                      setOrderModalId(oid);
                                      setNotificationsOpen(false);
                                      loadNotifications();
                                    }
                                  }}
                                  aria-label="View notification"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
            </div>
          )}

          <VendorNewOrderModal
            open={Boolean(orderModalId)}
            orderId={orderModalId}
            vendorIdStr={String(user?.id || user?._id || '')}
            getToken={getVendorToken}
            onClose={() => {
              setOrderModalId(null);
              loadNotifications();
            }}
          />

          <VendorReturnRequestedModal
            open={Boolean(returnModal.orderId)}
            orderId={returnModal.orderId}
            productId={returnModal.productId}
            vendorIdStr={String(user?.id || user?._id || '')}
            getToken={getVendorToken}
            onClose={() => {
              setReturnModal({ orderId: null, productId: null });
              loadNotifications();
            }}
          />

          <VendorNewServiceBookingModal
            open={Boolean(serviceBookingModalId)}
            bookingId={serviceBookingModalId}
            getToken={getVendorToken}
            onClose={() => {
              setServiceBookingModalId(null);
              loadNotifications();
            }}
          />

          {/* <div className="hidden lg:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                {fullName || 'User Name'}
              </p>
              <p className="text-[11px] text-gray-400">Vendor</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
              {(initialsName || '')?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
            {(initialsName || '')?.[0]?.toUpperCase() || 'U'}
          </div> */}
          <button
            type="button"
            onClick={() => router.push('/vendor/settings')}
            className="hidden lg:flex items-center gap-2"
          >
            <div className="text-right">
              <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                {fullName || 'User Name'}
              </p>
              <p className="text-[11px] text-gray-400">Vendor</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
              {(initialsName || '')?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
          <button
            type="button"
            onClick={() => router.push('/vendor/settings')}
            className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold"
          >
            {(initialsName || '')?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default VendorTopBar;
