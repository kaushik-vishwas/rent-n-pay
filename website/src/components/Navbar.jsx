// 'use client';

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { useAuthModal } from '@/contexts/AuthModalContext';
// import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';
// import { logout as logoutAction } from '@/store/slices/authSlice';
// import { clearCart, syncCart, removeFromCart } from '@/store/slices/cartSlice';
// import { api } from '@/lib/axios';
// import {
//   apiGetUserNotifications,
//   apiGetMyAddresses,
//   apiGetStorefrontVendorProducts,
//   apiGetServiceProducts,
//   apiGetCheckoutPickupStores,
//   apiGetPublicLocationSettings,
// } from '@/lib/api';
// import { USER_AUTH } from '@/lib/userAuthApi';
// import {
//   MapPin,
//   Search,
//   Heart,
//   ShoppingCart,
//   Truck,
//   Menu,
//   X,
//   LocateFixed,
//   User,
//   LogOut,
//   ChevronDown,
//   Sofa,
//   Wallet,
//   Bell,
//   History,
//   User2,
//   Settings,
//   Package,
//   LogIn,
// } from 'lucide-react';

// const DELIVERY_STORAGE_KEY = 'rn_delivery_location';

// function formatNotifTime(iso) {
//   if (!iso) return '';
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return '';
//   const diff = Date.now() - d.getTime();
//   const m = Math.floor(diff / 60000);
//   if (m < 1) return 'Just now';
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 48) return `${h}h ago`;
//   return d.toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// }

// function seenNotifStorageKey(userId) {
//   return userId ? `rn_seen_notif_ids_${userId}` : 'rn_seen_notif_ids';
// }

// function getUnreadNotifCount(apiList, userId) {
//   const ids = (apiList || []).map((n) => n.id);
//   if (!ids.length) return 0;
//   let seen = [];
//   try {
//     seen = JSON.parse(
//       typeof window !== 'undefined'
//         ? localStorage.getItem(seenNotifStorageKey(userId)) || '[]'
//         : '[]',
//     );
//   } catch {
//     seen = [];
//   }
//   const seenSet = new Set(seen);
//   return Math.min(ids.filter((id) => !seenSet.has(id)).length, 9);
// }

// function persistSeenNotifIds(list, userId) {
//   if (typeof window === 'undefined' || !list?.length) return;
//   localStorage.setItem(
//     seenNotifStorageKey(userId),
//     JSON.stringify(list.map((n) => n.id)),
//   );
// }

// function localNotifStorageKey() {
//   if (typeof window === 'undefined') return 'rn_local_notifications_guest';
//   try {
//     const raw = localStorage.getItem('userData');
//     const parsed = raw ? JSON.parse(raw) : null;
//     const uid = parsed?.id || parsed?._id;
//     return uid
//       ? `rn_local_notifications_${uid}`
//       : 'rn_local_notifications_guest';
//   } catch {
//     return 'rn_local_notifications_guest';
//   }
// }

// function readLocalNotifications() {
//   if (typeof window === 'undefined') return [];
//   try {
//     const raw = localStorage.getItem(localNotifStorageKey());
//     const arr = JSON.parse(raw || '[]');
//     return Array.isArray(arr) ? arr : [];
//   } catch {
//     return [];
//   }
// }

// const SEARCH_DEBOUNCE_MS = 220;
// const SEARCH_MIN_CHARS = 1;
// const SEARCH_SUGGEST_LIMIT = 10;
// const SEARCH_RECENT_KEY = 'rn_product_search_recent';
// const SEARCH_RECENT_MAX = 8;
// const SEARCH_RECENT_TOP_MATCH = 4;

// function readSearchRecent() {
//   if (typeof window === 'undefined') return [];
//   try {
//     const raw = localStorage.getItem(SEARCH_RECENT_KEY);
//     const arr = JSON.parse(raw || '[]');
//     if (!Array.isArray(arr)) return [];
//     return arr
//       .filter((x) => typeof x === 'string' && x.trim())
//       .slice(0, SEARCH_RECENT_MAX);
//   } catch {
//     return [];
//   }
// }

// function writeSearchRecent(term) {
//   if (typeof window === 'undefined') return;
//   const t = String(term || '').trim();
//   if (!t) return;
//   const prev = readSearchRecent();
//   const next = [
//     t,
//     ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase()),
//   ].slice(0, SEARCH_RECENT_MAX);
//   localStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(next));
// }

// function clearSearchRecentStorage() {
//   if (typeof window === 'undefined') return;
//   try {
//     localStorage.removeItem(SEARCH_RECENT_KEY);
//   } catch {
//     /* ignore */
//   }
// }

// function categoryHintLine(p) {
//   const sub = String(p.subCategory || p.subcategory || '').trim();
//   const cat = String(p.category || '').trim();
//   if (sub && cat) return `in ${sub} · ${cat}`;
//   if (sub) return `in ${sub}`;
//   if (cat) return `in ${cat}`;
//   return '';
// }

// function SearchInputWithSuggestions({
//   search,
//   setSearch,
//   onSearchNavigate,
//   onServiceNavigate,
//   onServiceSelect,
//   wrapperClassName = '',
//   inputClassName = '',
//   iconLeftClass = 'left-2.5 sm:left-3',
//   placeholder = 'Search products...',
// }) {
//   const [suggestions, setSuggestions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [serviceSuggestions, setServiceSuggestions] = useState([]);
//   const [serviceLoading, setServiceLoading] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const wrapRef = useRef(null);
//   const searchRequestIdRef = useRef(0);

//   const q = search.trim();
//   const matchingRecent =
//     q.length >= 1
//       ? readSearchRecent().filter((r) =>
//           r.toLowerCase().includes(q.toLowerCase()),
//         )
//       : [];
//   const recentToShow =
//     q.length >= 1
//       ? matchingRecent.slice(0, SEARCH_RECENT_TOP_MATCH)
//       : recentSearches;

//   const showRecentsOnly = open && q.length === 0 && recentToShow.length > 0;
//   const showProductPanel = open && q.length >= SEARCH_MIN_CHARS;
//   const showPanel = showRecentsOnly || showProductPanel;

//   useEffect(() => {
//     if (open && q.length === 0 && typeof window !== 'undefined') {
//       setRecentSearches(readSearchRecent());
//     }
//   }, [open, q.length, search]);

//   // useEffect(() => {
//   //   if (q.length < SEARCH_MIN_CHARS) {
//   //     setSuggestions([]);
//   //     setLoading(false);
//   //     return;
//   //   }
//   //   setSuggestions([]);
//   //   const t = setTimeout(() => {
//   //     setLoading(true);
//   //     const queryForRequest = q;
//   //     apiGetStorefrontVendorProducts(
//   //       `search=${encodeURIComponent(queryForRequest)}&limit=${SEARCH_SUGGEST_LIMIT}`,
//   //     )
//   //       .then((res) => {
//   //         setSuggestions(res.data?.products || []);
//   //         setOpen(true);
//   //       })
//   //       .catch(() => setSuggestions([]))
//   //       .finally(() => setLoading(false));
//   //   }, SEARCH_DEBOUNCE_MS);
//   //   return () => clearTimeout(t);
//   // }, [search, q]);
//   useEffect(() => {
//     if (q.length < SEARCH_MIN_CHARS) {
//       setSuggestions([]);
//       setLoading(false);
//       setServiceSuggestions([]);
//       setServiceLoading(false);
//       return;
//     }
//     setSuggestions([]);
//     setServiceSuggestions([]);
//     const t = setTimeout(() => {
//       const requestId = ++searchRequestIdRef.current;
//       setLoading(true);
//       const queryForRequest = q;
//       apiGetStorefrontVendorProducts(
//         `search=${encodeURIComponent(queryForRequest)}&limit=${SEARCH_SUGGEST_LIMIT}`,
//       )
//         .then((res) => {
//           if (requestId !== searchRequestIdRef.current) return;
//           setSuggestions(res.data?.products || []);
//           setOpen(true);
//         })
//         .catch(() => {
//           if (requestId !== searchRequestIdRef.current) return;
//           setSuggestions([]);
//         })
//         .finally(() => {
//           if (requestId !== searchRequestIdRef.current) return;
//           setLoading(false);
//         });

//       setServiceLoading(true);
//       apiGetServiceProducts(
//         `search=${encodeURIComponent(queryForRequest)}&limit=${SEARCH_SUGGEST_LIMIT}`,
//       )
//         .then((res) => {
//           if (requestId !== searchRequestIdRef.current) return;
//           setServiceSuggestions(res.data?.products || []);
//           setOpen(true);
//         })
//         .catch(() => {
//           if (requestId !== searchRequestIdRef.current) return;
//           setServiceSuggestions([]);
//         })
//         .finally(() => {
//           if (requestId !== searchRequestIdRef.current) return;
//           setServiceLoading(false);
//         });
//     }, SEARCH_DEBOUNCE_MS);
//     return () => clearTimeout(t);
//   }, [search, q]);
//   useEffect(() => {
//     const fn = (e) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', fn);
//     return () => document.removeEventListener('mousedown', fn);
//   }, []);

//   const go = (explicitTerm) => {
//     const term = String(explicitTerm ?? search).trim();
//     if (!term) return;
//     writeSearchRecent(term);
//     onSearchNavigate(term);
//     setOpen(false);
//   };

//   // const goService = (serviceOrTerm) => {
//   //   // Clicking a suggestion passes the full service object → go straight to
//   //   // its detail page. A plain string (not currently used, kept for safety)
//   //   // falls back to the service search navigation.
//   //   if (serviceOrTerm && typeof serviceOrTerm === 'object') {
//   //     const id = serviceOrTerm._id || serviceOrTerm.id;
//   //     const name =
//   //       serviceOrTerm.productName ||
//   //       serviceOrTerm.title ||
//   //       serviceOrTerm.name ||
//   //       '';
//   //     if (name) writeSearchRecent(name);
//   //     if (id && typeof onServiceSelect === 'function') {
//   //       onServiceSelect(id);
//   //     }
//   //     setOpen(false);
//   //     return;
//   //   }
//   //   const term = String(serviceOrTerm ?? search).trim();
//   //   if (!term) return;
//   //   writeSearchRecent(term);
//   //   if (typeof onServiceNavigate === 'function') {
//   //     onServiceNavigate(term);
//   //   }
//   //   setOpen(false);
//   // };

//   const goService = (serviceOrTerm) => {
//     // Clicking a suggestion redirects to the products listing page
//     // (Services tab) filtered by name — same behavior as product search,
//     // not the individual service detail page.
//     if (serviceOrTerm && typeof serviceOrTerm === 'object') {
//       const name =
//         serviceOrTerm.productName ||
//         serviceOrTerm.title ||
//         serviceOrTerm.name ||
//         '';
//       if (!name) return;
//       writeSearchRecent(name);
//       if (typeof onServiceNavigate === 'function') {
//         onServiceNavigate(name);
//       }
//       setOpen(false);
//       return;
//     }
//     const term = String(serviceOrTerm ?? search).trim();
//     if (!term) return;
//     writeSearchRecent(term);
//     if (typeof onServiceNavigate === 'function') {
//       onServiceNavigate(term);
//     }
//     setOpen(false);
//   };

//   const clearAllRecent = () => {
//     clearSearchRecentStorage();
//     setRecentSearches([]);
//   };

//   const renderRecentRow = (term) => (
//     <li key={`recent-${term}`} role="option">
//       <button
//         type="button"
//         className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
//         onMouseDown={(e) => e.preventDefault()}
//         onClick={() => setSearch(term)}
//       >
//         <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
//           <History className="h-5 w-5" strokeWidth={1.75} />
//         </div>
//         <div className="min-w-0 flex-1">
//           <p className="truncate text-sm text-gray-900">{term}</p>
//         </div>
//       </button>
//     </li>
//   );

//   return (
//     <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
//       <Search
//         size={16}
//         className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-[1]`}
//       />
//       <input
//         type="text"
//         autoComplete="off"
//         autoCorrect="off"
//         spellCheck={false}
//         aria-autocomplete="list"
//         aria-expanded={showPanel}
//         placeholder={placeholder}
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         onFocus={() => {
//           if (typeof window !== 'undefined') {
//             setRecentSearches(readSearchRecent());
//           }
//           setOpen(true);
//         }}
//         onKeyDown={(e) => {
//           if (e.key === 'Escape') setOpen(false);
//         }}
//         className={`${inputClassName} ${search.length > 0 ? '!pr-9 sm:!pr-10' : ''}`}
//       />
//       {search.length > 0 ? (
//         <button
//           type="button"
//           aria-label="Clear search"
//           className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 rounded p-0.5 text-orange-500 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
//           onMouseDown={(e) => e.preventDefault()}
//           onClick={() => setSearch('')}
//         >
//           <X className="h-4 w-4" strokeWidth={2.25} />
//         </button>
//       ) : null}
//       {showPanel ? (
//         <div
//           role="listbox"
//           aria-label="Product suggestions"
//           className="absolute left-0 right-0 top-full z-[60] mt-1.5 max-h-[min(75vh,22rem)] overflow-y-auto rounded-lg border border-gray-100 bg-white py-1 shadow-xl"
//         >
//           {showRecentsOnly ? (
//             <>
//               <ul className="divide-y divide-gray-100">
//                 {recentToShow.map(renderRecentRow)}
//               </ul>
//               <div className="flex justify-end border-t border-gray-100 px-3 py-2">
//                 <button
//                   type="button"
//                   className="text-xs font-semibold text-orange-600 hover:text-orange-700"
//                   onMouseDown={(e) => e.preventDefault()}
//                   onClick={clearAllRecent}
//                 >
//                   Clear all
//                 </button>
//               </div>
//             </>
//           ) : null}

//           {showProductPanel && q.length >= SEARCH_MIN_CHARS ? (
//             <>
//               {recentToShow.length > 0 ? (
//                 <>
//                   <ul className="divide-y divide-gray-100">
//                     {recentToShow.map(renderRecentRow)}
//                   </ul>
//                   <div className="flex justify-end border-t border-gray-100 px-3 py-2">
//                     <button
//                       type="button"
//                       className="text-xs font-semibold text-orange-600 hover:text-orange-700"
//                       onMouseDown={(e) => e.preventDefault()}
//                       onClick={clearAllRecent}
//                     >
//                       Clear all
//                     </button>
//                   </div>
//                   {(loading || suggestions.length > 0) && (
//                     <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
//                       Products
//                     </div>
//                   )}
//                 </>
//               ) : null}

//               {loading ? (
//                 <p className="px-3 py-3 text-sm text-gray-500">Searching…</p>
//               ) : suggestions.length === 0 ? (
//                 !serviceLoading && serviceSuggestions.length === 0 ? (
//                   <button
//                     type="button"
//                     className="w-full px-3 py-3 text-left text-sm text-gray-600 hover:bg-gray-50"
//                     onMouseDown={(e) => e.preventDefault()}
//                     onClick={() => go()}
//                   >
//                     No products or services found
//                   </button>
//                 ) : null
//               ) : (
//                 <ul className="divide-y divide-gray-100">
//                   {suggestions.map((p) => {
//                     const hint = categoryHintLine(p);
//                     return (
//                       <li key={p._id} role="option">
//                         <button
//                           type="button"
//                           className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
//                           onMouseDown={(e) => e.preventDefault()}
//                           onClick={() => go(p.productName)}
//                         >
//                           <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
//                             <img
//                               src={
//                                 p.image ||
//                                 'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
//                               }
//                               alt=""
//                               className="h-full w-full object-cover"
//                             />
//                           </div>
//                           <div className="min-w-0 flex-1 pt-0.5">
//                             <p className="truncate text-sm font-normal text-gray-900">
//                               {p.productName}
//                             </p>
//                             {hint ? (
//                               <p className="mt-0.5 truncate text-xs text-orange-600">
//                                 {hint}
//                               </p>
//                             ) : null}
//                           </div>
//                         </button>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               )}

//               {(serviceLoading || serviceSuggestions.length > 0) && (
//                 <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 border-t border-gray-100">
//                   Services
//                 </div>
//               )}
//               {serviceLoading ? (
//                 <p className="px-3 py-2 text-sm text-gray-500">
//                   Searching services…
//                 </p>
//               ) : serviceSuggestions.length > 0 ? (
//                 <ul className="divide-y divide-gray-100">
//                   {serviceSuggestions.map((s) => {
//                     const hint = categoryHintLine(s);
//                     const displayName =
//                       s.productName || s.title || s.name || '';
//                     return (
//                       <li key={s._id || s.id} role="option">
//                         <button
//                           type="button"
//                           className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
//                           onMouseDown={(e) => e.preventDefault()}
//                           onClick={() => goService(s)}
//                         >
//                           <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
//                             <img
//                               src={
//                                 s.image ||
//                                 'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
//                               }
//                               alt=""
//                               className="h-full w-full object-cover"
//                             />
//                           </div>
//                           <div className="min-w-0 flex-1 pt-0.5">
//                             <p className="truncate text-sm font-normal text-gray-900">
//                               {displayName}
//                             </p>
//                             {hint ? (
//                               <p className="mt-0.5 truncate text-xs text-orange-600">
//                                 {hint}
//                               </p>
//                             ) : null}
//                           </div>
//                         </button>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               ) : null}

//               {/* {(suggestions.length > 0 || serviceSuggestions.length > 0) && (
//                 <div className="border-t border-gray-100 px-2 py-1.5">
//                   <button
//                     type="button"
//                     className="w-full rounded-md px-2 py-2 text-center text-xs font-semibold text-orange-600 hover:bg-orange-50"
//                     onMouseDown={(e) => e.preventDefault()}
//                     onClick={() => go()}
//                   >
//                     See all results for “{q}”
//                   </button>
//                 </div>
//               )} */}
//             </>
//           ) : null}
//         </div>
//       ) : null}
//     </div>
//   );
// }

// const Navbar = () => {
//   const [search, setSearch] = useState('');
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [showNotifPanel, setShowNotifPanel] = useState(false);
//   const [notifLoading, setNotifLoading] = useState(false);
//   const [notifList, setNotifList] = useState([]);
//   const [notifBadge, setNotifBadge] = useState(0);
//   const [locationQuery, setLocationQuery] = useState('');
//   const [locationSearching, setLocationSearching] = useState(false);
//   const [locationOptions, setLocationOptions] = useState([]);
//   const [locating, setLocating] = useState(false);
//   const [locationError, setLocationError] = useState('');
//   const [savedAddresses, setSavedAddresses] = useState([]);
//   const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
//   const [showSavedAddresses, setShowSavedAddresses] = useState(false);
//   const [deliveryLocation, setDeliveryLocation] = useState({
//     label: 'Choose your location',
//     lat: null,
//     lon: null,
//   });

//   const dropdownRef = useRef(null);
//   const notifPanelRef = useRef(null);
//   const notifListRef = useRef([]);
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { open: authModalOpen, openAuth } = useAuthModal();

//   const [locationSourceFlags, setLocationSourceFlags] = useState({
//     rentEnabled: true,
//     buyEnabled: true,
//     serviceEnabled: true,
//   });

//   useEffect(() => {
//     let mounted = true;
//     const fetchFlags = () => {
//       apiGetPublicLocationSettings()
//         .then((res) => {
//           if (!mounted) return;
//           setLocationSourceFlags({
//             rentEnabled: res.data?.rentEnabled !== false,
//             buyEnabled: res.data?.buyEnabled !== false,
//             serviceEnabled: res.data?.serviceEnabled !== false,
//           });
//         })
//         .catch(() => {
//           if (!mounted) return;
//           setLocationSourceFlags({
//             rentEnabled: true,
//             buyEnabled: true,
//             serviceEnabled: true,
//           });
//         });
//     };
//     fetchFlags();

//     window.addEventListener('rn_delivery_location_changed', fetchFlags);
//     const onStorage = (e) => {
//       if (e?.key !== 'rn_delivery_location') return;
//       fetchFlags();
//     };
//     window.addEventListener('storage', onStorage);

//     return () => {
//       mounted = false;
//       window.removeEventListener('rn_delivery_location_changed', fetchFlags);
//       window.removeEventListener('storage', onStorage);
//     };
//   }, []);

//   const { user, isAuthenticated } = useSelector((s) => s.auth);
//   const cartItems = useSelector((s) => s.cart.items);
//   // const cartItems = useSelector((s) => s.cart?.items || []);
//   const cartCount = useSelector((s) =>
//     s.cart.items.reduce((a, i) => a + i.quantity, 0),
//   );
//   // const cartCount = useSelector((s) =>
//   //   s.cart.items.reduce((a, i) => a + i.quantity, 0),
//   // );

//   const [serviceCartCount, setServiceCartCount] = useState(0);

//   // useEffect(() => {
//   //   const check = () => {
//   //     try {
//   //       const raw = localStorage.getItem('rentpay_pending_service_booking');
//   //       setServiceCartCount(raw ? 1 : 0);
//   //     } catch {
//   //       setServiceCartCount(0);
//   //     }
//   //   };
//   useEffect(() => {
//     const check = () => {
//       try {
//         const raw = localStorage.getItem('rentpay_pending_service_bookings');
//         const list = raw ? JSON.parse(raw) : [];
//         setServiceCartCount(Array.isArray(list) ? list.length : 0);
//       } catch {
//         setServiceCartCount(0);
//       }
//     };
//     check();
//     // Re-check when storage changes (e.g. service added/removed in another tab or same page)
//     window.addEventListener('storage', check);
//     window.addEventListener('focus', check);
//     window.addEventListener('rn_service_cart_changed', check);
//     return () => {
//       window.removeEventListener('storage', check);
//       window.removeEventListener('focus', check);
//       window.removeEventListener('rn_service_cart_changed', check);
//     };
//   }, []);

//   const totalCartCount = cartCount + serviceCartCount;

//   const firstLetter = user?.fullName?.charAt(0)?.toUpperCase() || '';
//   const firstName = user?.fullName?.split(' ')[0] || '';

//   // const SEARCH_PLACEHOLDERS = [
//   //   'Search for "AC Service"',
//   //   'Search for "Vehicle"',
//   //   'Search for "Electronics"',
//   //   'Search for "Furniture"',
//   //   'Search for "Camera"',
//   // ];
//   // const [placeholderIdx, setPlaceholderIdx] = useState(0);
//   // const [placeholderVisible, setPlaceholderVisible] = useState(true);

//   // useEffect(() => {
//   //   const interval = setInterval(() => {
//   //     setPlaceholderVisible(false);
//   //     setTimeout(() => {
//   //       setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
//   //       setPlaceholderVisible(true);
//   //     }, 300);
//   //   }, 2000);
//   //   return () => clearInterval(interval);
//   // }, []);

//   // const animatedPlaceholder = SEARCH_PLACEHOLDERS[placeholderIdx];

//   const FALLBACK_PLACEHOLDER_WORDS = [
//     'AC Service',
//     'Vehicle',
//     'Electronics',
//     'Furniture',
//     'Camera',
//   ];
//   const [searchPlaceholders, setSearchPlaceholders] = useState(
//     FALLBACK_PLACEHOLDER_WORDS,
//   );
//   const [placeholderIdx, setPlaceholderIdx] = useState(0);
//   const [placeholderVisible, setPlaceholderVisible] = useState(true);
//   const [typedPlaceholder, setTypedPlaceholder] = useState('');
//   const [isDeletingPlaceholder, setIsDeletingPlaceholder] = useState(false);

//   useEffect(() => {
//     let cancelled = false;
//     api
//       .get('/admin/get-all-sub-categories')
//       .then((res) => {
//         if (cancelled) return;
//         const list = Array.isArray(res.data) ? res.data : [];
//         const names = list.map((s) => s?.name).filter(Boolean);
//         if (names.length > 0) {
//           setSearchPlaceholders(names);
//         }
//       })
//       .catch(() => {
//         /* keep fallback placeholders on error */
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // useEffect(() => {
//   //   if (searchPlaceholders.length <= 1) return undefined;
//   //   const interval = setInterval(() => {
//   //     setPlaceholderVisible(false);
//   //     setTimeout(() => {
//   //       setPlaceholderIdx((i) => (i + 1) % searchPlaceholders.length);
//   //       setPlaceholderVisible(true);
//   //     }, 300);
//   //   }, 2000);
//   //   return () => clearInterval(interval);
//   // }, [searchPlaceholders.length]);

//   // const animatedPlaceholder =
//   //   searchPlaceholders[placeholderIdx] || FALLBACK_PLACEHOLDERS[0];

//   useEffect(() => {
//     if (searchPlaceholders.length === 0) return undefined;
//     const currentWord =
//       searchPlaceholders[placeholderIdx % searchPlaceholders.length] ||
//       FALLBACK_PLACEHOLDERS[0];

//     let timeout;
//     if (!isDeletingPlaceholder) {
//       if (typedPlaceholder.length < currentWord.length) {
//         timeout = setTimeout(() => {
//           setTypedPlaceholder(
//             currentWord.slice(0, typedPlaceholder.length + 1),
//           );
//         }, 70);
//       } else {
//         timeout = setTimeout(() => setIsDeletingPlaceholder(true), 2000);
//       }
//     } else if (typedPlaceholder.length > 0) {
//       timeout = setTimeout(() => {
//         setTypedPlaceholder(typedPlaceholder.slice(0, -1));
//       }, 40);
//     } else {
//       setIsDeletingPlaceholder(false);
//       setPlaceholderIdx((i) => (i + 1) % searchPlaceholders.length);
//     }
//     return () => clearTimeout(timeout);
//   }, [
//     typedPlaceholder,
//     isDeletingPlaceholder,
//     placeholderIdx,
//     searchPlaceholders,
//   ]);

//   // const animatedPlaceholder = typedPlaceholder
//   //   ? `Search for "${typedPlaceholder}"`
//   //   : 'Search for';
//   const animatedPlaceholder = typedPlaceholder
//     ? `Search for '${typedPlaceholder}'`
//     : 'Search for';

//   // useEffect(() => {
//   //   if (typeof window === 'undefined') return;
//   //   try {
//   //     const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
//   //     if (!raw) return;
//   //     const parsed = JSON.parse(raw);
//   //     if (
//   //       parsed &&
//   //       typeof parsed.label === 'string' &&
//   //       Number.isFinite(Number(parsed.lat)) &&
//   //       Number.isFinite(Number(parsed.lon))
//   //     ) {
//   //       setDeliveryLocation({
//   //         label: parsed.label,
//   //         lat: Number.isFinite(Number(parsed.lat)) ? Number(parsed.lat) : null,
//   //         lon: Number.isFinite(Number(parsed.lon)) ? Number(parsed.lon) : null,
//   //       });
//   //     }
//   //   } catch {
//   //     /* ignore corrupt local value */
//   //   }
//   // }, []);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     try {
//       const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
//       if (!raw) {
//         setShowLocationModal(true);
//         return;
//       }
//       const parsed = JSON.parse(raw);
//       if (
//         parsed &&
//         typeof parsed.label === 'string' &&
//         Number.isFinite(Number(parsed.lat)) &&
//         Number.isFinite(Number(parsed.lon))
//       ) {
//         setDeliveryLocation({
//           label: parsed.label,
//           lat: Number.isFinite(Number(parsed.lat)) ? Number(parsed.lat) : null,
//           lon: Number.isFinite(Number(parsed.lon)) ? Number(parsed.lon) : null,
//         });
//       } else {
//         setShowLocationModal(true);
//       }
//     } catch {
//       /* ignore corrupt local value */
//       setShowLocationModal(true);
//     }
//   }, []);

//   useEffect(() => {
//     if (!showLocationModal || typeof document === 'undefined') return undefined;
//     const prevOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prevOverflow;
//     };
//   }, [showLocationModal]);

//   const prevAuthModalOpenRef = useRef(false);
//   useEffect(() => {
//     const wasOpen = prevAuthModalOpenRef.current;
//     prevAuthModalOpenRef.current = authModalOpen;
//     // Auth modal just closed (login/signup completed OR cancelled by user)
//     if (wasOpen && !authModalOpen) {
//       const hasLocation =
//         deliveryLocation.lat != null && deliveryLocation.lon != null;
//       if (!hasLocation) {
//         setShowLocationModal(true);
//       }
//     }
//   }, [authModalOpen, deliveryLocation.lat, deliveryLocation.lon]);

//   const applyDeliveryLocation = useCallback(
//     (label, lat, lon) => {
//       const next = {
//         label: String(label || '').trim() || 'Choose your location',
//         lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
//         lon: Number.isFinite(Number(lon)) ? Number(lon) : null,
//       };
//       setDeliveryLocation(next);
//       if (typeof window !== 'undefined') {
//         localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(next));
//         window.dispatchEvent(
//           new CustomEvent('rn_delivery_location_changed', { detail: next }),
//         );
//       }
//       if (isAuthenticated && cartItems.length) {
//         const productIds = Array.from(
//           new Set(
//             cartItems.map((i) => String(i?.productId || '')).filter(Boolean),
//           ),
//         );
//         if (productIds.length && next.lat != null && next.lon != null) {
//           apiGetCheckoutPickupStores(productIds, {
//             userLat: next.lat,
//             userLng: next.lon,
//           })
//             .then((res) => {
//               const validProductIds = new Set(
//                 (res.data?.stores || [])
//                   .flatMap((store) => store?.products || [])
//                   .map((p) => String(p?.productId || ''))
//                   .filter(Boolean),
//               );
//               cartItems.forEach((item) => {
//                 const id = String(item?.productId || '');
//                 if (!id || validProductIds.has(id)) return;
//                 dispatch(removeFromCart(id));
//               });
//             })
//             .catch(() => {
//               /* keep cart unchanged on API error */
//             });
//         }
//       }
//       return next;
//     },
//     [isAuthenticated, cartItems, dispatch],
//   );

//   // Keep cart UI in sync when user logs in/out without a full refresh.
//   // (Cart state is stored in localStorage, scoped per user.)
//   useEffect(() => {
//     dispatch(syncCart());
//   }, [dispatch, isAuthenticated, user?.id, user?._id, user?.email]);

//   useEffect(() => {
//     notifListRef.current = notifList;
//   }, [notifList]);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       setNotifBadge(0);
//       setNotifList([]);
//       return;
//     }
//     const uid = user?.id || user?._id;
//     apiGetUserNotifications()
//       .then((res) => {
//         const list = res.data?.notifications || [];
//         const localList = readLocalNotifications();
//         setNotifBadge(getUnreadNotifCount([...localList, ...list], uid));
//       })
//       .catch(() => {
//         const localList = readLocalNotifications();
//         setNotifBadge(getUnreadNotifCount(localList, uid));
//       });
//   }, [isAuthenticated, user?.id, user?._id]);

//   useEffect(() => {
//     if (!isAuthenticated) return undefined;
//     const onLocalNotifAdded = () => {
//       const uid = user?.id || user?._id;
//       apiGetUserNotifications()
//         .then((res) => {
//           const list = res.data?.notifications || [];
//           const localList = readLocalNotifications();
//           setNotifBadge(getUnreadNotifCount([...localList, ...list], uid));
//         })
//         .catch(() => {
//           const localList = readLocalNotifications();
//           setNotifBadge(getUnreadNotifCount(localList, uid));
//         });
//     };
//     window.addEventListener('rn_local_notification_added', onLocalNotifAdded);
//     return () =>
//       window.removeEventListener(
//         'rn_local_notification_added',
//         onLocalNotifAdded,
//       );
//   }, [isAuthenticated, user?.id, user?._id]);

//   const loadNotifications = async () => {
//     setNotifLoading(true);
//     try {
//       const extra = [];
//       if (
//         typeof window !== 'undefined' &&
//         sessionStorage.getItem('rn_login_welcome')
//       ) {
//         sessionStorage.removeItem('rn_login_welcome');
//         extra.push({
//           id: 'login-welcome',
//           type: 'welcome',
//           title: 'Welcome back!',
//           detail: `Hi ${firstName || 'there'}, you're signed in. Check your latest updates below.`,
//           href: '/',
//           at: new Date().toISOString(),
//         });
//       }
//       const res = await apiGetUserNotifications();
//       const apiList = res.data?.notifications || [];
//       const localList = readLocalNotifications();
//       const merged = [...extra, ...localList, ...apiList].sort(
//         (a, b) => new Date(b.at) - new Date(a.at),
//       );
//       const seen = new Set();
//       const deduped = [];
//       for (const row of merged) {
//         if (seen.has(row.id)) continue;
//         seen.add(row.id);
//         deduped.push(row);
//       }
//       const slice = deduped.slice(0, 7);
//       setNotifList(slice);
//     } catch {
//       setNotifList([]);
//     } finally {
//       setNotifLoading(false);
//     }
//   };

//   const refreshNotifBadge = useCallback(() => {
//     const uid = user?.id || user?._id;
//     return apiGetUserNotifications()
//       .then((res) => {
//         const list = res.data?.notifications || [];
//         setNotifBadge(getUnreadNotifCount(list, uid));
//       })
//       .catch(() => setNotifBadge(0));
//   }, [user?.id, user?._id]);

//   const closeNotifPanel = useCallback(() => {
//     const uid = user?.id || user?._id;
//     persistSeenNotifIds(notifListRef.current, uid);
//     setShowNotifPanel(false);
//     refreshNotifBadge();
//   }, [user?.id, user?._id, refreshNotifBadge]);

//   const toggleNotifPanel = () => {
//     if (showNotifPanel) {
//       closeNotifPanel();
//     } else {
//       setNotifBadge(0);
//       setShowNotifPanel(true);
//       loadNotifications();
//     }
//     setShowProfileDropdown(false);
//   };

//   //  Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowProfileDropdown(false);
//       }
//       if (
//         !showNotifPanel ||
//         !notifPanelRef.current ||
//         notifPanelRef.current.contains(e.target)
//       ) {
//         return;
//       }
//       closeNotifPanel();
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showNotifPanel, closeNotifPanel]);

//   useEffect(() => {
//     if (!showNotifPanel) return;
//     const onKey = (e) => {
//       if (e.key === 'Escape') closeNotifPanel();
//     };
//     document.addEventListener('keydown', onKey);
//     return () => document.removeEventListener('keydown', onKey);
//   }, [showNotifPanel, closeNotifPanel]);

//   useEffect(() => {
//     if (typeof window === 'undefined') return undefined;
//     const onOpenLocationModal = () => setShowLocationModal(true);
//     window.addEventListener('rn_open_location_modal', onOpenLocationModal);
//     return () =>
//       window.removeEventListener('rn_open_location_modal', onOpenLocationModal);
//   }, []);

//   //  Logout handler
//   const handleLogout = async () => {
//     setLoggingOut(true);
//     try {
//       await api.post(USER_AUTH.logout);
//     } catch (err) {
//       console.error('Logout API error:', err);
//     } finally {
//       const uid = user?.id || user?._id;
//       if (uid) {
//         try {
//           localStorage.removeItem(seenNotifStorageKey(uid));
//         } catch {
//           /* ignore */
//         }
//       }
//       dispatch(logoutAction());
//       dispatch(clearCart());
//       setShowProfileDropdown(false);
//       setShowNotifPanel(false);
//       setShowLogoutConfirm(false);
//       setLoggingOut(false);
//       router.push('/');
//     }
//   };

//   const runProductSearch = (term) => {
//     const t = String(term || '').trim();
//     if (!t) return;
//     router.push(`/products?search=${encodeURIComponent(t)}`);
//   };

//   const runServiceSearch = (term) => {
//     const t = String(term || '').trim();
//     if (!t) return;
//     router.push(`/products?tab=services&search=${encodeURIComponent(t)}`);
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     runProductSearch(search);
//   };

//   useEffect(() => {
//     if (!showLocationModal) return;
//     const q = String(locationQuery || '').trim();
//     if (q.length < 3) {
//       setLocationOptions([]);
//       setLocationSearching(false);
//       return;
//     }
//     const t = setTimeout(async () => {
//       setLocationSearching(true);
//       try {
//         const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=in&q=${encodeURIComponent(
//           q,
//         )}`;
//         const res = await fetch(url, {
//           headers: { Accept: 'application/json' },
//         });
//         const data = await res.json();
//         const out = Array.isArray(data)
//           ? data.map((x) => ({
//               id: x.place_id,
//               label: x.display_name,
//               lat: Number(x.lat),
//               lon: Number(x.lon),
//             }))
//           : [];
//         setLocationOptions(
//           out.filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon)),
//         );
//       } catch {
//         setLocationOptions([]);
//       } finally {
//         setLocationSearching(false);
//       }
//     }, 300);
//     return () => clearTimeout(t);
//   }, [locationQuery, showLocationModal]);

//   const chooseLocation = async ({ label, lat, lon }) => {
//     applyDeliveryLocation(label, lat, lon);
//     setLocationError('');
//     setShowLocationModal(false);
//     setLocationQuery('');
//     setLocationOptions([]);
//     setShowSavedAddresses(false);
//   };

//   const onFetchMyLocation = async () => {
//     if (!navigator.geolocation) {
//       setLocationError('Geolocation is not supported in this browser.');
//       return;
//     }
//     setLocating(true);
//     setLocationError('');
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const lat = pos.coords.latitude;
//           const lon = pos.coords.longitude;
//           let label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
//           try {
//             const rev = await fetch(
//               `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
//                 lat,
//               )}&lon=${encodeURIComponent(lon)}`,
//               { headers: { Accept: 'application/json' } },
//             );
//             const revData = await rev.json();
//             if (revData?.display_name) label = revData.display_name;
//           } catch {
//             /* reverse geocode optional */
//           }
//           await chooseLocation({ label, lat, lon });
//         } finally {
//           setLocating(false);
//         }
//       },
//       (err) => {
//         setLocating(false);
//         setLocationError(err?.message || 'Unable to fetch your location.');
//       },
//       { enableHighAccuracy: true, timeout: 12000 },
//     );
//   };

//   const onSavedAddressClick = async () => {
//     if (!isAuthenticated) {
//       setShowLocationModal(false);
//       openAuth('login');
//       return;
//     }
//     setShowSavedAddresses((v) => !v);
//     if (savedAddresses.length > 0 || loadingSavedAddresses) return;
//     setLoadingSavedAddresses(true);
//     try {
//       const res = await apiGetMyAddresses();
//       setSavedAddresses(
//         Array.isArray(res.data?.addresses) ? res.data.addresses : [],
//       );
//     } catch {
//       setSavedAddresses([]);
//       setLocationError('Could not load saved addresses.');
//     } finally {
//       setLoadingSavedAddresses(false);
//     }
//   };

//   const chooseSavedAddress = async (addr) => {
//     const parts = [
//       addr?.addressLine,
//       addr?.area,
//       addr?.city,
//       addr?.pincode ? `- ${addr.pincode}` : '',
//     ]
//       .filter(Boolean)
//       .join(', ');
//     setLocationSearching(true);
//     try {
//       const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
//         parts,
//       )}`;
//       const res = await fetch(url, { headers: { Accept: 'application/json' } });
//       const data = await res.json();
//       const first = Array.isArray(data) ? data[0] : null;
//       if (!first) {
//         setLocationError('Could not map this saved address location.');
//         return;
//       }
//       await chooseLocation({
//         label: parts,
//         lat: Number(first.lat),
//         lon: Number(first.lon),
//       });
//     } catch {
//       setLocationError('Failed to use saved address location.');
//     } finally {
//       setLocationSearching(false);
//     }
//   };

//   return (
//     <>
//       <header className="bg-white border-b sticky top-0 z-50">
//         <div className=" mx-auto px-4 sm:px-6 py-3 sm:py-4">
//           {!isAuthenticated ? (
//             <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 sm:gap-x-3 md:gap-x-4">
//               {/*
//               <Link
//                 href="/"
//                 className="flex shrink-0 items-center justify-self-start gap-2"
//               >
//                 <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
//                   R
//                 </div>

//                 <span className="text-lg  font-bold text-[#F97316] whitespace-nowrap">
//                   Rentnpay
//                 </span>
//               </Link>

//               <div className="flex min-w-0 w-full flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-center md:gap-3"> */}
//               <div className="flex shrink-0 items-center justify-self-start gap-3 min-w-0">
//                 {/* <Link href="/" className="flex shrink-0 items-center gap-2">
//                   <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
//                     R
//                   </div>
//                   <span className="hidden sm:inline text-lg  font-bold text-[#F97316] whitespace-nowrap">
//                     Rentnpay
//                   </span>
//                 </Link> */}

//                 <Link href="/" className="flex shrink-0 items-center gap-1">
//                   <img
//                     src={RentnpayLogo.src}
//                     alt="Rentnpay"
//                     className="w-7 h-7 shrink-0 object-contain"
//                   />
//                   <span className="hidden sm:inline text-lg  font-bold text-[#F97316] whitespace-nowrap">
//                     Rentnpay
//                   </span>
//                 </Link>

//                 {/* Nav links — Rent, Sell, Service */}
//                 <nav className="hidden md:flex items-center shrink-0 ml-2 w-[168px]">
//                   <div className="flex items-center gap-6">
//                     {locationSourceFlags.rentEnabled ? (
//                       <Link
//                         href="/rent"
//                         className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
//                       >
//                         Rent
//                       </Link>
//                     ) : null}
//                     {locationSourceFlags.buyEnabled ? (
//                       <Link
//                         href="/buy"
//                         className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
//                       >
//                         Buy
//                       </Link>
//                     ) : null}
//                     {locationSourceFlags.serviceEnabled ? (
//                       <Link
//                         href="/service"
//                         className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
//                       >
//                         Services
//                       </Link>
//                     ) : null}
//                   </div>
//                 </nav>
//                 {/*
//                 <button
//                   type="button"
//                   onClick={() => setShowLocationModal(true)}
//                   className="flex md:hidden items-center gap-2 min-w-0 flex-1 border border-gray-300 bg-white pl-2.5 pr-2 py-[7px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors shrink-0"
//                 >
//                   <MapPin size={14} className="text-gray-400 shrink-0" />
//                   <span className="truncate min-w-0 flex-1 text-left">
//                     {deliveryLocation.label === 'Choose your location'
//                       ? 'Choose location'
//                       : deliveryLocation.label.length > 10
//                         ? `${deliveryLocation.label.slice(0, 10)}...`
//                         : deliveryLocation.label}
//                   </span>
//                   <ChevronDown size={13} className="text-gray-400 shrink-0" />
//                 </button>
//               </div>

//               <div className="flex min-w-0 w-full flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-center md:gap-3">
//                 <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3"> */}
//               </div>

//               <div className="flex min-w-0 w-full flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-center md:gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowLocationModal(true)}
//                   className="flex md:hidden items-center gap-2 min-w-0 w-full border border-gray-300 bg-white pl-2.5 pr-2 py-[7px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
//                 >
//                   <MapPin size={14} className="text-gray-500 shrink-0" />
//                   <span className="truncate min-w-0 flex-1 text-left">
//                     {deliveryLocation.label === 'Choose your location'
//                       ? 'Choose location'
//                       : deliveryLocation.label.length > 32
//                         ? `${deliveryLocation.label.slice(0, 32)}...`
//                         : deliveryLocation.label}
//                   </span>
//                   <ChevronDown size={13} className="text-gray-500 shrink-0" />
//                 </button>

//                 {/* Location + Search — separate pills, with a gap */}
//                 <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setShowLocationModal(true)}
//                     className="flex items-center gap-2 w-1/2 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
//                   >
//                     <MapPin size={15} className="text-gray-500 shrink-0" />
//                     <span className="truncate flex-1 text-left">
//                       {deliveryLocation.label === 'Choose your location'
//                         ? 'Choose location'
//                         : deliveryLocation.label.length > 30
//                           ? `${deliveryLocation.label.slice(0, 30)}…`
//                           : deliveryLocation.label}
//                     </span>
//                     <ChevronDown size={14} className="text-gray-500 shrink-0" />
//                   </button>

//                   <form onSubmit={handleSearch} className="w-1/2">
//                     <SearchInputWithSuggestions
//                       search={search}
//                       setSearch={setSearch}
//                       onSearchNavigate={runProductSearch}
//                       onServiceNavigate={runServiceSearch}
//                       wrapperClassName="w-full"
//                       placeholder={animatedPlaceholder}
//                       iconLeftClass="left-3"
//                       inputClassName={`w-full pl-8 pr-3 py-[9px] text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
//                     />
//                   </form>
//                 </div>
//               </div>
//               <div className="flex shrink-0 items-center justify-end justify-self-end gap-2 sm:gap-3">
//                 {/* <button
//                   type="button"
//                   onClick={() => openAuth('login')}
//                   className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
//                 >
//                   Login
//                 </button> */}
//                 <button
//                   type="button"
//                   onClick={() => openAuth('login')}
//                   className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
//                 >
//                   Login/Signup
//                   <LogIn size={16} />
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-center gap-3 sm:gap-4 w-full">
//               {/* <Link
//                 href="/"
//                 className="flex shrink-0 items-center justify-self-start gap-2"
//               >
//                 <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
//                   R
//                 </div>

//                 <span className="text-xl  font-bold text-[#F97316] whitespace-nowrap">
//                   Rentnpay
//                 </span>
//               </Link>

//               <nav className="hidden md:flex items-center gap-6 shrink-0"> */}
//               {/* <Link
//                 href="/"
//                 className="flex shrink-0 items-center justify-self-start gap-2"
//               >
//                 <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
//                   R
//                 </div>

//                 <span className="hidden sm:inline text-xl  font-bold text-[#F97316] whitespace-nowrap">
//                   Rentnpay
//                 </span>
//               </Link> */}
//               <Link
//                 href="/"
//                 className="flex shrink-0 items-center justify-self-start gap-1"
//               >
//                 <img
//                   src={RentnpayLogo.src}
//                   alt="Rentnpay"
//                   className="w-7 h-7 shrink-0 object-contain"
//                 />

//                 <span className="hidden sm:inline text-xl  font-bold text-[#F97316] whitespace-nowrap">
//                   Rentnpay
//                 </span>
//               </Link>

//               <button
//                 type="button"
//                 onClick={() => setShowLocationModal(true)}
//                 className="flex md:hidden items-center gap-2 min-w-0 flex-1 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors shrink-0"
//               >
//                 <MapPin size={15} className="text-gray-500 shrink-0" />
//                 <span className="truncate flex-1 text-left">
//                   {deliveryLocation.label === 'Choose your location'
//                     ? 'Choose location'
//                     : deliveryLocation.label}
//                 </span>
//                 <ChevronDown size={14} className="text-gray-500 shrink-0" />
//               </button>

//               {/* Nav links — Rent, Sell, Service */}
//               {/* <nav className="hidden md:flex items-center gap-6 shrink-0">
//                 <Link
//                   href="/products"
//                   className="text-sm  text-gray-700 hover:text-[#F97316] transition-colors"
//                 >
//                   Rent */}
//               {/* Nav links — Rent, Sell, Service */}
//               {/* Nav links — Rent, Sell, Service */}
//               <nav className="hidden md:flex items-center shrink-0 md:ml-6 w-[168px]">
//                 <div className="flex items-center gap-6">
//                   {locationSourceFlags.rentEnabled ? (
//                     <Link
//                       href="/rent"
//                       className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
//                     >
//                       Rent
//                     </Link>
//                   ) : null}
//                   {locationSourceFlags.buyEnabled ? (
//                     <Link
//                       href="/buy"
//                       className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
//                     >
//                       Buy
//                     </Link>
//                   ) : null}
//                   {locationSourceFlags.serviceEnabled ? (
//                     <Link
//                       href="/service"
//                       className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
//                     >
//                       Services
//                     </Link>
//                   ) : null}
//                 </div>
//               </nav>

//               {/* Location + Search — separate pills, with a gap */}

//               {/* <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3 mx-4 md:ml-10">
//                 <button
//                   type="button"
//                   onClick={() => setShowLocationModal(true)}
//                   className="flex md:hidden items-center gap-1.5 min-w-0 max-w-[150px] sm:max-w-[200px] border border-gray-300 bg-white pl-2.5 pr-2 py-[7px] rounded-lg text-xs text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors shrink-0"
//                 >
//                   <MapPin size={14} className="text-gray-400 shrink-0" />
//                   <span className="truncate min-w-0 flex-1 text-left">
//                     {deliveryLocation.label === 'Choose your location'
//                       ? 'Choose location'
//                       : deliveryLocation.label}
//                   </span>
//                   <ChevronDown size={13} className="text-gray-400 shrink-0" />
//                 </button>

//                 <form onSubmit={handleSearch} className="w-1/2"> */}
//               <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3 mx-4 md:ml-10">
//                 <button
//                   type="button"
//                   onClick={() => setShowLocationModal(true)}
//                   className="flex items-center gap-2 w-1/2 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
//                 >
//                   <MapPin size={15} className="text-gray-500 shrink-0" />
//                   <span className="truncate flex-1 text-left">
//                     {deliveryLocation.label === 'Choose your location'
//                       ? 'Choose location'
//                       : deliveryLocation.label.length > 30
//                         ? `${deliveryLocation.label.slice(0, 30)}…`
//                         : deliveryLocation.label}
//                   </span>
//                   <ChevronDown size={14} className="text-gray-500 shrink-0" />
//                 </button>

//                 <form onSubmit={handleSearch} className="w-1/2">
//                   <SearchInputWithSuggestions
//                     search={search}
//                     setSearch={setSearch}
//                     onSearchNavigate={runProductSearch}
//                     onServiceNavigate={runServiceSearch}
//                     wrapperClassName="w-full"
//                     placeholder={animatedPlaceholder}
//                     iconLeftClass="left-3"
//                     inputClassName={`w-full pl-8 pr-3 py-[9px] text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
//                   />
//                 </form>
//               </div>
//               <div className="flex items-center gap-2 sm:gap-3 text-gray-500 shrink-0 ml-auto">
//                 {isAuthenticated && user ? (
//                   <>
//                     <Link
//                       href="/cart"
//                       className="relative flex items-center gap-1 hover:text-black p-1"
//                     >
//                       {/* <ShoppingCart size={18} className="w-5 h-5" />
//                       {cartCount > 0 && (
//                         <span className="absolute -top-0.5 -right-1 sm:-top-2 sm:-right-3 bg-red-600 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
//                           {cartCount}
//                         </span>
//                       )} */}
//                       <ShoppingCart className="w-5 h-5" />

//                       {/* {cartCount > 0 && (
//                         <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
//                           {cartCount > 9 ? '9+' : cartCount}
//                         </span>
//                       )} */}
//                       {totalCartCount > 0 && (
//                         <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
//                           {totalCartCount > 9 ? '9+' : totalCartCount}
//                         </span>
//                       )}
//                     </Link>

//                     <Link
//                       href="/wishlist"
//                       className="flex items-center gap-1 hover:text-black p-1"
//                     >
//                       <Heart size={18} className="w-5 h-5 " />
//                     </Link>
//                   </>
//                 ) : null}
//                 {/* //test */}

//                 {isAuthenticated && user ? (
//                   <>
//                     {showNotifPanel ? (
//                       <button
//                         type="button"
//                         aria-label="Close notifications"
//                         className="fixed inset-0 z-[55] bg-black/20 md:bg-transparent"
//                         onClick={closeNotifPanel}
//                       />
//                     ) : null}
//                     <div className="relative" ref={notifPanelRef}>
//                       {/* <button
//                         type="button"
//                         onClick={toggleNotifPanel}
//                         aria-expanded={showNotifPanel}
//                         aria-haspopup="dialog"
//                         className="relative w-9 h-9 flex items-center justify-center    text-gray-600 hover:text-black "
//                       >
//                         <span className="sr-only">Notifications</span>
//                         <Bell className="w-5 h-5" strokeWidth={1.8} />
//                         {notifBadge > 0 ? (
//                           <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
//                             {notifBadge > 9 ? '9+' : notifBadge}
//                           </span>
//                         ) : null}
//                       </button> */}
//                       <button
//                         type="button"
//                         onClick={toggleNotifPanel}
//                         aria-expanded={showNotifPanel}
//                         aria-haspopup="dialog"
//                         className="relative w-9 h-9 flex items-center justify-center text-gray-600 hover:text-black"
//                       >
//                         <span className="sr-only">Notifications</span>

//                         <Bell className="w-5 h-5" strokeWidth={1.8} />

//                         {notifBadge > 0 && (
//                           <span className="absolute top-0.5 right-0 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
//                             {notifBadge > 9 ? '9+' : notifBadge}
//                           </span>
//                         )}
//                       </button>

//                       {showNotifPanel ? (
//                         <div
//                           role="dialog"
//                           aria-label="Notifications"
//                           className="fixed z-[60] top-[calc(3.75rem+env(safe-area-inset-top,0px))] right-[max(0.75rem,env(safe-area-inset-right,0px))] w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
//                         >
//                           <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
//                             <p className="text-sm font-semibold text-gray-900">
//                               Notifications
//                             </p>
//                             {/* <span className="text-[11px] text-gray-400">
//                               Last 7 updates
//                             </span> */}
//                           </div>
//                           {notifLoading ? (
//                             <p className="px-4 py-6 text-sm text-gray-500 text-center">
//                               Loading…
//                             </p>
//                           ) : notifList.length === 0 ? (
//                             <p className="px-4 py-6 text-sm text-gray-500 text-center">
//                               No recent notification yet.
//                             </p>
//                           ) : (
//                             <ul className="max-h-[min(70vh,20rem)] overflow-y-auto divide-y divide-gray-50">
//                               {notifList.map((n) => (
//                                 <li
//                                   key={n.id}
//                                   className={`px-4 py-3 hover:bg-gray-50 ${n.href ? 'cursor-pointer' : ''}`}
//                                   onClick={() => {
//                                     if (!n.href) return;
//                                     router.push(n.href);
//                                     closeNotifPanel();
//                                   }}
//                                 >
//                                   <div className="flex items-start gap-2">
//                                     <div className="flex-1 min-w-0">
//                                       <p className="text-sm font-medium text-gray-900">
//                                         {n.title}
//                                       </p>
//                                       <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
//                                         {n.detail}
//                                       </p>
//                                       <p className="text-[11px] text-gray-400 mt-1">
//                                         {formatNotifTime(n.at)}
//                                       </p>
//                                     </div>
//                                     {/* {n.href ? (
//                                   <button
//                                     type="button"
//                                     className="shrink-0 px-3 py-1.5 text-xs font-semibold text-[#F97316] border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100"
//                                     onClick={() => {
//                                       router.push(n.href || '/');
//                                       setShowNotifPanel(false);
//                                     }}
//                                   >
//                                     View
//                                   </button>
//                                 ) : null} */}
//                                   </div>
//                                 </li>
//                               ))}
//                             </ul>
//                           )}
//                         </div>
//                       ) : null}
//                     </div>
//                   </>
//                 ) : null}

//                 {/*  Profile with dropdown — only when logged in */}
//                 {isAuthenticated && user ? (
//                   <div className="relative" ref={dropdownRef}>
//                     <button
//                       type="button"
//                       onClick={() => setShowProfileDropdown((prev) => !prev)}
//                       className="flex items-center gap-2 hover:text-black p-1"
//                     >
//                       <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center text-sm font-bold shrink-0">
//                         {firstLetter}
//                       </div>
//                       {/* <span className="hidden md:inline text-sm font-medium">
//                         {firstName}
//                       </span> */}
//                       {/* <ChevronDown
//                         size={14}
//                         className="hidden md:block text-gray-400"
//                       /> */}
//                     </button>

//                     {/*  Dropdown */}
//                     {showProfileDropdown && (
//                       <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
//                         <Link
//                           href="/my-account"
//                           onClick={() => setShowProfileDropdown(false)}
//                           className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
//                         >
//                           <User size={15} className="text-orange-500" />
//                           My Account
//                         </Link>
//                         <Link
//                           href="/settings"
//                           onClick={() => setShowProfileDropdown(false)}
//                           className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                         >
//                           <Settings size={15} className="text-orange-500" />
//                           Settings
//                         </Link>

//                         {/* <button
//                           type="button"
//                           onClick={handleLogout}
//                           disabled={loggingOut}
//                           className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 border-t border-gray-100"
//                         >
//                           <LogOut size={15} />
//                           {loggingOut ? 'Logging out…' : 'Logout'}
//                         </button> */}
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setShowProfileDropdown(false);
//                             setShowLogoutConfirm(true);
//                           }}
//                           className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
//                         >
//                           <LogOut size={15} />
//                           Logout
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ) : null}

//                 {/* Mobile menu button */}
//                 {/* <button
//                   type="button"
//                   onClick={() => setMenuOpen(!menuOpen)}
//                   className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
//                   aria-label="Toggle menu"
//                 >
//                   {menuOpen ? <X size={20} /> : <Menu size={20} />}
//                 </button> */}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Mobile menu */}
//         {/* {menuOpen && (
//           <div className="md:hidden border-t bg-white px-3 py-4 space-y-3">
//             <button
//               type="button"
//               onClick={() => setShowLocationModal(true)}
//               className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm text-gray-600 w-full justify-center"
//             >
//               <MapPin size={14} className="text-orange-500" />
//               <span>Choose your location</span>
//             </button>

//             <form onSubmit={handleSearch} className="flex gap-2">
//               <SearchInputWithSuggestions
//                 search={search}
//                 setSearch={setSearch}
//                 onSearchNavigate={runProductSearch}
//                 wrapperClassName="flex-1 min-w-0"
//                 iconLeftClass="left-3"
//                 placeholder="Search..."
//                 inputClassName="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
//               />
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shrink-0"
//               >
//                 Search
//               </button>
//             </form>

//             {!isAuthenticated && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   openAuth('login');
//                   setMenuOpen(false);
//                 }}
//                 className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
//               >
//                 Login
//               </button>
//             )}

//             {isAuthenticated && user && (
//               <div className="border border-gray-100 rounded-xl overflow-hidden">
//                 <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50">
//                   <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
//                     {firstLetter}
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-sm font-semibold text-gray-900 truncate">
//                       {user.fullName}
//                     </p>
//                     <p className="text-xs text-gray-500 truncate">
//                       {user.email}
//                     </p>
//                   </div>
//                 </div>
//                 <Link
//                   href="/profile"
//                   onClick={() => setMenuOpen(false)}
//                   className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                 >
//                   <User size={15} />
//                   My Profile & KYC
//                 </Link>
//                 <Link
//                   href="/my-address"
//                   onClick={() => setMenuOpen(false)}
//                   className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                 >
//                   <MapPin size={15} className="text-orange-500" />
//                   My Address
//                 </Link>

//                 <Link
//                   href="/orders"
//                   onClick={() => setMenuOpen(false)}
//                   className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                 >
//                   <Truck size={15} className="text-orange-500" />
//                   My Orders
//                 </Link>

//                 <Link
//                   href="/my-rentals"
//                   onClick={() => setMenuOpen(false)}
//                   className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                 >
//                   <Sofa size={15} className="text-orange-500 shrink-0" />
//                   Rental Products
//                 </Link>
//                 <Link
//                   href="/referral"
//                   onClick={() => setMenuOpen(false)}
//                   className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                 >
//                   <User2 size={15} className="text-orange-500 shrink-0" />
//                   Referral
//                 </Link>

//                 <button
//                   type="button"
//                   onClick={handleLogout}
//                   disabled={loggingOut}
//                   className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 disabled:opacity-50"
//                 >
//                   <LogOut size={15} />
//                   {loggingOut ? 'Logging out…' : 'Logout'}
//                 </button>
//               </div>
//             )}
//           </div>
//         )} */}
//         {/* Mobile menu modal */}
//         {menuOpen && (
//           <div className="md:hidden fixed inset-0 z-[100] flex">
//             {/* Backdrop */}
//             <div
//               className="absolute inset-0 bg-black/40"
//               onClick={() => setMenuOpen(false)}
//             />
//             {/* Drawer */}
//             <div className="relative ml-auto w-[85vw] max-w-xs bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
//               {/* Header */}
//               <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//                 <span className="text-sm font-semibold text-gray-800"></span>
//                 <button
//                   type="button"
//                   onClick={() => setMenuOpen(false)}
//                   className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
//                   aria-label="Close menu"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               <div className="px-3 py-4 space-y-3 flex-1">
//                 {/* <button
//                   type="button"
//                   onClick={() => {
//                     setShowLocationModal(true);
//                     setMenuOpen(false);
//                   }}
//                   className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm text-gray-600 w-full justify-center"
//                 >
//                   <MapPin size={14} className="text-orange-500" />
//                   <span>Choose your location</span>
//                 </button> */}
//                 {/*
//                 <form
//                   onSubmit={(e) => {
//                     handleSearch(e);
//                     setMenuOpen(false);
//                   }}
//                   className="flex gap-2"
//                 >
//                   <SearchInputWithSuggestions
//                     search={search}
//                     setSearch={setSearch}
//                     onSearchNavigate={(term) => {
//                       runProductSearch(term);
//                       setMenuOpen(false);
//                     }}
//                     wrapperClassName="flex-1 min-w-0"
//                     iconLeftClass="left-3"
//                     placeholder="Search..."
//                     inputClassName="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
//                   />
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-[#F97316] text-white text-sm font-medium rounded-lg shrink-0"
//                   >
//                     Search
//                   </button>
//                 </form> */}

//                 {!isAuthenticated && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       openAuth('login');
//                       setMenuOpen(false);
//                     }}
//                     className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
//                   >
//                     Login
//                   </button>
//                 )}

//                 {isAuthenticated && user && (
//                   <div className="border border-gray-100 rounded-xl overflow-hidden">
//                     {/* <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
//                       <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
//                         {firstLetter}
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-sm font-semibold text-gray-900 truncate">
//                           {user.fullName}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">
//                           {user.email}
//                         </p>
//                       </div>
//                     </div> */}
//                     <Link
//                       href="/my-account"
//                       onClick={() => setShowProfileDropdown(false)}
//                       className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
//                     >
//                       <User size={15} className="text-orange-500" />
//                       My Account
//                     </Link>

//                     <Link
//                       href="/settings"
//                       onClick={() => setShowProfileDropdown(false)}
//                       className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                     >
//                       <Settings size={15} className="text-orange-500" />
//                       Settings
//                     </Link>

//                     {/* <button
//                       type="button"
//                       onClick={handleLogout}
//                       disabled={loggingOut}
//                       className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 border-t border-gray-100"
//                     >
//                       <LogOut size={15} />
//                       {loggingOut ? 'Logging out…' : 'Logout'}
//                     </button> */}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setMenuOpen(false);
//                         setShowLogoutConfirm(true);
//                       }}
//                       className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
//                     >
//                       <LogOut size={15} />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Logout Confirmation Modal */}
//       {showLogoutConfirm && (
//         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
//           <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//               <p className="text-sm font-semibold text-gray-900">
//                 Confirm Logout
//               </p>
//               <button
//                 type="button"
//                 onClick={() => setShowLogoutConfirm(false)}
//                 className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//             <div className="px-5 py-6 text-center">
//               <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
//                 <LogOut className="w-6 h-6 text-red-600" />
//               </div>
//               <p className="text-base font-semibold text-gray-900">
//                 Are you sure you want to logout?
//               </p>
//               {/* <p className="mt-1 text-sm text-gray-500">
//                 You will need to login again to access your account.
//               </p> */}
//             </div>
//             <div className="flex gap-3 px-5 pb-5">
//               <button
//                 type="button"
//                 onClick={() => setShowLogoutConfirm(false)}
//                 className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 disabled={loggingOut}
//                 className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
//               >
//                 {loggingOut ? 'Logging out…' : 'Yes, Logout'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Location Modal — unchanged */}
//       {/* {showLocationModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4"> */}
//       {showLocationModal && (
//         <div
//           className={`fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 ${
//             deliveryLocation.lat != null && deliveryLocation.lon != null
//               ? 'bg-black/40'
//               : 'bg-white'
//           }`}
//         >
//           <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
//             {/* <div className="flex justify-end p-3">
//               <button
//                 onClick={() => setShowLocationModal(false)}
//                 className="text-gray-400 hover:text-gray-600 text-lg leading-none"
//               >
//                 ×
//               </button>
//             </div> */}
//             <div className="flex justify-end p-3">
//               {deliveryLocation.lat != null && deliveryLocation.lon != null ? (
//                 <button
//                   onClick={() => setShowLocationModal(false)}
//                   className="text-gray-400 hover:text-gray-600 text-lg leading-none"
//                 >
//                   ×
//                 </button>
//               ) : null}
//             </div>
//             <div className="px-5 pb-5 sm:px-6 sm:pb-6">
//               <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
//                 Choose your location
//               </h2>
//               <p className="mt-1 text-xs sm:text-sm text-gray-500 text-center">
//                 Please select a location to view products near you.
//               </p>
//               <div className="mt-5">
//                 <label className="block text-xs sm:text-sm font-semibold text-black mb-1.5">
//                   Search Location
//                 </label>
//                 <div className="relative">
//                   <MapPin className="w-4 h-4 text-[#F97316] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
//                   <input
//                     type="text"
//                     value={locationQuery}
//                     onChange={(e) => {
//                       setLocationQuery(e.target.value);
//                       setLocationError('');
//                     }}
//                     placeholder="Enter area, street name..."
//                     className="w-full pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
//                   />
//                 </div>
//                 {locationSearching ? (
//                   <p className="mt-2 text-xs text-gray-500">
//                     Searching locations...
//                   </p>
//                 ) : null}
//                 {locationOptions.length > 0 ? (
//                   <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 divide-y">
//                     {locationOptions.map((opt) => (
//                       <li key={opt.id}>
//                         <button
//                           type="button"
//                           onClick={() => chooseLocation(opt)}
//                           className="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
//                         >
//                           {opt.label}
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : null}
//               </div>
//               <button
//                 type="button"
//                 onClick={onFetchMyLocation}
//                 disabled={locating}
//                 className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 shadow-[0_10px_22px_rgba(249,115,22,0.45)] disabled:opacity-60"
//               >
//                 <LocateFixed className="w-4 h-4" />
//                 {locating ? 'Fetching location...' : 'Fetch my location'}
//               </button>
//               {/* <button
//                 type="button"
//                 onClick={() => {
//                   onSavedAddressClick();
//                 }}
//                 className="mt-3 w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 py-2.5 sm:py-3 hover:bg-gray-50"
//               >
//                 <User className="w-4 h-4" />
//                 {isAuthenticated
//                   ? 'Use saved addresses'
//                   : 'Login for saved addresses'}
//               </button> */}
//               {/* {!isAuthenticated && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowLocationModal(false);
//                     openAuth('login');
//                   }}
//                   className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl font-semibold border border-gray-300 bg-white text-xs sm:text-sm text-black py-2.5 sm:py-3 hover:bg-gray-50"
//                 >
//                   <User className="w-4 h-4 font-semibold text-black" />
//                   Login for saved addresses
//                 </button>
//               )} */}
//               {showSavedAddresses ? (
//                 <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 max-h-44 overflow-y-auto">
//                   {loadingSavedAddresses ? (
//                     <p className="px-3 py-2 text-xs text-gray-500">
//                       Loading saved addresses...
//                     </p>
//                   ) : savedAddresses.length === 0 ? (
//                     <p className="px-3 py-2 text-xs text-gray-500">
//                       No saved addresses yet.
//                     </p>
//                   ) : (
//                     <ul className="divide-y divide-gray-200">
//                       {savedAddresses.map((addr) => {
//                         const line = `${addr.addressLine || ''}${addr.area ? `, ${addr.area}` : ''}${
//                           addr.city ? `, ${addr.city}` : ''
//                         }${addr.pincode ? ` - ${addr.pincode}` : ''}`;
//                         return (
//                           <li key={addr._id}>
//                             <button
//                               type="button"
//                               onClick={() => chooseSavedAddress(addr)}
//                               className="w-full px-3 py-2 text-left hover:bg-white"
//                             >
//                               <p className="text-xs sm:text-sm font-medium text-gray-800">
//                                 {addr.label || 'Address'}
//                               </p>
//                               <p className="text-[11px] text-gray-600 mt-0.5">
//                                 {line}
//                               </p>
//                             </button>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   )}
//                 </div>
//               ) : null}
//               {locationError ? (
//                 <p className="mt-3 text-xs text-red-600 text-center">
//                   {locationError}
//                 </p>
//               ) : null}
//               {/* <div className="mt-4 flex items-start justify-center gap-1.5 text-[10px] sm:text-xs text-gray-500 text-center px-3">

//                 <p>
//                   We deliver within{' '}
//                   <span className="font-bold text-gray-800">50km radius</span>{' '}
//                   from your location
//                 </p>
//               </div> */}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Navbar;

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useAuthModal } from '@/contexts/AuthModalContext';
import Image from 'next/image';
import { useRouter as useSearchRouter } from 'next/navigation';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { clearCart, syncCart, removeFromCart } from '@/store/slices/cartSlice';
import { api } from '@/lib/axios';
import {
  apiGetUserNotifications,
  apiGetMyAddresses,
  apiGetStorefrontVendorProducts,
  apiGetServiceProducts,
  apiGetCheckoutPickupStores,
  apiGetPublicLocationSettings,
} from '@/lib/api';
import { USER_AUTH } from '@/lib/userAuthApi';
import {
  MapPin,
  Search,
  Heart,
  ShoppingCart,
  Truck,
  Menu,
  X,
  LocateFixed,
  User,
  LogOut,
  ChevronDown,
  Sofa,
  Wallet,
  Bell,
  History,
  User2,
  Settings,
  Package,
  LogIn,
} from 'lucide-react';

// const DELIVERY_STORAGE_KEY = 'rn_delivery_location';
const DELIVERY_STORAGE_KEY = 'rn_delivery_location';

function stripPincodeFromLabel(label) {
  if (!label) return label;
  return label
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !/^\d+$/.test(part))
    .join(', ');
}

function formatNotifTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function seenNotifStorageKey(userId) {
  return userId ? `rn_seen_notif_ids_${userId}` : 'rn_seen_notif_ids';
}

function getUnreadNotifCount(apiList, userId) {
  const ids = (apiList || []).map((n) => n.id);
  if (!ids.length) return 0;
  let seen = [];
  try {
    seen = JSON.parse(
      typeof window !== 'undefined'
        ? localStorage.getItem(seenNotifStorageKey(userId)) || '[]'
        : '[]',
    );
  } catch {
    seen = [];
  }
  const seenSet = new Set(seen);
  return Math.min(ids.filter((id) => !seenSet.has(id)).length, 9);
}

function persistSeenNotifIds(list, userId) {
  if (typeof window === 'undefined' || !list?.length) return;
  localStorage.setItem(
    seenNotifStorageKey(userId),
    JSON.stringify(list.map((n) => n.id)),
  );
}

function localNotifStorageKey() {
  if (typeof window === 'undefined') return 'rn_local_notifications_guest';
  try {
    const raw = localStorage.getItem('userData');
    const parsed = raw ? JSON.parse(raw) : null;
    const uid = parsed?.id || parsed?._id;
    return uid
      ? `rn_local_notifications_${uid}`
      : 'rn_local_notifications_guest';
  } catch {
    return 'rn_local_notifications_guest';
  }
}

function readLocalNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(localNotifStorageKey());
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const SEARCH_DEBOUNCE_MS = 220;
const SEARCH_MIN_CHARS = 1;
const SEARCH_SUGGEST_LIMIT = 10;
const SEARCH_RECENT_KEY = 'rn_product_search_recent';
const SEARCH_RECENT_MAX = 8;
const SEARCH_RECENT_TOP_MATCH = 4;

function readSearchRecent() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_RECENT_KEY);
    const arr = JSON.parse(raw || '[]');
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => typeof x === 'string' && x.trim())
      .slice(0, SEARCH_RECENT_MAX);
  } catch {
    return [];
  }
}

function writeSearchRecent(term) {
  if (typeof window === 'undefined') return;
  const t = String(term || '').trim();
  if (!t) return;
  const prev = readSearchRecent();
  const next = [
    t,
    ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase()),
  ].slice(0, SEARCH_RECENT_MAX);
  localStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(next));
}

function clearSearchRecentStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEARCH_RECENT_KEY);
  } catch {
    /* ignore */
  }
}

function categoryHintLine(p) {
  const sub = String(p.subCategory || p.subcategory || '').trim();
  const cat = String(p.category || '').trim();
  if (sub && cat) return `in ${sub} · ${cat}`;
  if (sub) return `in ${sub}`;
  if (cat) return `in ${cat}`;
  return '';
}

// function SearchInputWithSuggestions({
//   search,
//   setSearch,
//   onSearchNavigate,
//   onServiceNavigate,
//   onServiceSelect,
//   wrapperClassName = '',
//   inputClassName = '',
//   iconLeftClass = 'left-2.5 sm:left-3',
//   placeholder = 'Search products...',
// }) {
function SearchInputWithSuggestions({
  search,
  setSearch,
  onSearchNavigate,
  onServiceNavigate,
  onServiceSelect,
  wrapperClassName = '',
  inputClassName = '',
  iconLeftClass = 'left-2.5 sm:left-3',
  placeholder = 'Search products...',
}) {
  const searchRouter = useSearchRouter();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceSuggestions, setServiceSuggestions] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const wrapRef = useRef(null);
  const searchRequestIdRef = useRef(0);

  const q = search.trim();
  const matchingRecent =
    q.length >= 1
      ? readSearchRecent().filter((r) =>
          r.toLowerCase().includes(q.toLowerCase()),
        )
      : [];
  const recentToShow =
    q.length >= 1
      ? matchingRecent.slice(0, SEARCH_RECENT_TOP_MATCH)
      : recentSearches;

  const showRecentsOnly = open && q.length === 0 && recentToShow.length > 0;
  const showProductPanel = open && q.length >= SEARCH_MIN_CHARS;
  const showPanel = showRecentsOnly || showProductPanel;

  useEffect(() => {
    if (open && q.length === 0 && typeof window !== 'undefined') {
      setRecentSearches(readSearchRecent());
    }
  }, [open, q.length, search]);

  // useEffect(() => {
  //   if (q.length < SEARCH_MIN_CHARS) {
  //     setSuggestions([]);
  //     setLoading(false);
  //     return;
  //   }
  //   setSuggestions([]);
  //   const t = setTimeout(() => {
  //     setLoading(true);
  //     const queryForRequest = q;
  //     apiGetStorefrontVendorProducts(
  //       `search=${encodeURIComponent(queryForRequest)}&limit=${SEARCH_SUGGEST_LIMIT}`,
  //     )
  //       .then((res) => {
  //         setSuggestions(res.data?.products || []);
  //         setOpen(true);
  //       })
  //       .catch(() => setSuggestions([]))
  //       .finally(() => setLoading(false));
  //   }, SEARCH_DEBOUNCE_MS);
  //   return () => clearTimeout(t);
  // }, [search, q]);
  useEffect(() => {
    if (q.length < SEARCH_MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      setServiceSuggestions([]);
      setServiceLoading(false);
      return;
    }
    setSuggestions([]);
    setServiceSuggestions([]);
    const t = setTimeout(() => {
      const requestId = ++searchRequestIdRef.current;
      setLoading(true);
      const queryForRequest = q;
      apiGetStorefrontVendorProducts(
        `search=${encodeURIComponent(queryForRequest)}&limit=${SEARCH_SUGGEST_LIMIT}`,
      )
        .then((res) => {
          if (requestId !== searchRequestIdRef.current) return;
          setSuggestions(res.data?.products || []);
          setOpen(true);
        })
        .catch(() => {
          if (requestId !== searchRequestIdRef.current) return;
          setSuggestions([]);
        })
        .finally(() => {
          if (requestId !== searchRequestIdRef.current) return;
          setLoading(false);
        });

      setServiceLoading(true);
      apiGetServiceProducts(
        `search=${encodeURIComponent(queryForRequest)}&limit=${SEARCH_SUGGEST_LIMIT}`,
      )
        .then((res) => {
          if (requestId !== searchRequestIdRef.current) return;
          setServiceSuggestions(res.data?.products || []);
          setOpen(true);
        })
        .catch(() => {
          if (requestId !== searchRequestIdRef.current) return;
          setServiceSuggestions([]);
        })
        .finally(() => {
          if (requestId !== searchRequestIdRef.current) return;
          setServiceLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search, q]);
  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const go = (explicitTerm) => {
    const term = String(explicitTerm ?? search).trim();
    if (!term) return;
    writeSearchRecent(term);
    onSearchNavigate(term);
    setOpen(false);
    setSearch('');
  };

  // const goService = (serviceOrTerm) => {
  //   // Clicking a suggestion passes the full service object → go straight to
  //   // its detail page. A plain string (not currently used, kept for safety)
  //   // falls back to the service search navigation.
  //   if (serviceOrTerm && typeof serviceOrTerm === 'object') {
  //     const id = serviceOrTerm._id || serviceOrTerm.id;
  //     const name =
  //       serviceOrTerm.productName ||
  //       serviceOrTerm.title ||
  //       serviceOrTerm.name ||
  //       '';
  //     if (name) writeSearchRecent(name);
  //     if (id && typeof onServiceSelect === 'function') {
  //       onServiceSelect(id);
  //     }
  //     setOpen(false);
  //     return;
  //   }
  //   const term = String(serviceOrTerm ?? search).trim();
  //   if (!term) return;
  //   writeSearchRecent(term);
  //   if (typeof onServiceNavigate === 'function') {
  //     onServiceNavigate(term);
  //   }
  //   setOpen(false);
  // };

  // const goService = (serviceOrTerm) => {
  //   // Clicking a suggestion redirects to the products listing page
  //   // (Services tab) filtered by name — same behavior as product search,
  //   // not the individual service detail page.
  //   if (serviceOrTerm && typeof serviceOrTerm === 'object') {
  //     const name =
  //       serviceOrTerm.productName ||
  //       serviceOrTerm.title ||
  //       serviceOrTerm.name ||
  //       '';
  //     if (!name) return;
  //     writeSearchRecent(name);
  //     if (typeof onServiceNavigate === 'function') {
  //       onServiceNavigate(name);
  //     }
  //     setOpen(false);
  //     return;
  //   }
  //   const term = String(serviceOrTerm ?? search).trim();
  //   if (!term) return;
  //   writeSearchRecent(term);
  //   if (typeof onServiceNavigate === 'function') {
  //     onServiceNavigate(term);
  //   }
  //   setOpen(false);
  // };

  const goService = (serviceOrTerm) => {
    // Clicking a specific service suggestion goes straight to that
    // service's own detail page, same as how a typed/submitted search
    // still falls back to the filtered listing page below.
    if (serviceOrTerm && typeof serviceOrTerm === 'object') {
      const name =
        serviceOrTerm.productName ||
        serviceOrTerm.title ||
        serviceOrTerm.name ||
        '';
      const id = serviceOrTerm._id || serviceOrTerm.id;
      if (name) writeSearchRecent(name);
      setOpen(false);
      setSearch('');
      if (id) {
        searchRouter.push(`/service/${id}`);
        return;
      }
      // Fallback: no id available, keep previous behavior.
      if (name && typeof onServiceNavigate === 'function') {
        onServiceNavigate(name);
      }
      return;
    }
    const term = String(serviceOrTerm ?? search).trim();
    if (!term) return;
    writeSearchRecent(term);
    if (typeof onServiceNavigate === 'function') {
      onServiceNavigate(term);
    }
    setOpen(false);
    setSearch('');
  };

  const clearAllRecent = () => {
    clearSearchRecentStorage();
    setRecentSearches([]);
  };

  const renderRecentRow = (term) => (
    <li key={`recent-${term}`} role="option">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setSearch(term)}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <History className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-gray-900">{term}</p>
        </div>
      </button>
    </li>
  );

  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      <Search
        size={16}
        className={`absolute ${iconLeftClass} top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-[1]`}
      />
      <input
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={showPanel}
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => {
          if (typeof window !== 'undefined') {
            setRecentSearches(readSearchRecent());
          }
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        className={`${inputClassName} ${search.length > 0 ? '!pr-9 sm:!pr-10' : ''}`}
      />
      {search.length > 0 ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 rounded p-0.5 text-orange-500 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setSearch('')}
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>
      ) : null}
      {showPanel ? (
        <div
          role="listbox"
          aria-label="Product suggestions"
          className="absolute left-0 right-0 top-full z-[60] mt-1.5 max-h-[min(75vh,22rem)] overflow-y-auto rounded-lg border border-gray-100 bg-white py-1 shadow-xl"
        >
          {showRecentsOnly ? (
            <>
              <ul className="divide-y divide-gray-100">
                {recentToShow.map(renderRecentRow)}
              </ul>
              <div className="flex justify-end border-t border-gray-100 px-3 py-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={clearAllRecent}
                >
                  Clear all
                </button>
              </div>
            </>
          ) : null}

          {showProductPanel && q.length >= SEARCH_MIN_CHARS ? (
            <>
              {recentToShow.length > 0 ? (
                <>
                  <ul className="divide-y divide-gray-100">
                    {recentToShow.map(renderRecentRow)}
                  </ul>
                  <div className="flex justify-end border-t border-gray-100 px-3 py-2">
                    <button
                      type="button"
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={clearAllRecent}
                    >
                      Clear all
                    </button>
                  </div>
                  {(loading || suggestions.length > 0) && (
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Products
                    </div>
                  )}
                </>
              ) : null}

              {loading ? (
                <p className="px-3 py-3 text-sm text-gray-500">Searching…</p>
              ) : suggestions.length === 0 ? (
                !serviceLoading && serviceSuggestions.length === 0 ? (
                  <button
                    type="button"
                    className="w-full px-3 py-3 text-left text-sm text-gray-600 hover:bg-gray-50"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go()}
                  >
                    No products or services found
                  </button>
                ) : null
              ) : (
                <ul className="divide-y divide-gray-100">
                  {suggestions.map((p) => {
                    const hint = categoryHintLine(p);
                    return (
                      <li key={p._id} role="option">
                        <button
                          type="button"
                          className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => go(p.productName)}
                        >
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            <img
                              src={
                                p.image ||
                                'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
                              }
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="truncate text-sm font-normal text-gray-900">
                              {p.productName}
                            </p>
                            {hint ? (
                              <p className="mt-0.5 truncate text-xs text-orange-600">
                                {hint}
                              </p>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {(serviceLoading || serviceSuggestions.length > 0) && (
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 border-t border-gray-100">
                  Services
                </div>
              )}
              {serviceLoading ? (
                <p className="px-3 py-2 text-sm text-gray-500">
                  Searching services…
                </p>
              ) : serviceSuggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {serviceSuggestions.map((s) => {
                    const hint = categoryHintLine(s);
                    const displayName =
                      s.productName || s.title || s.name || '';
                    return (
                      <li key={s._id || s.id} role="option">
                        <button
                          type="button"
                          className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => goService(s)}
                        >
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            <img
                              src={
                                s.image ||
                                'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
                              }
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="truncate text-sm font-normal text-gray-900">
                              {displayName}
                            </p>
                            {hint ? (
                              <p className="mt-0.5 truncate text-xs text-orange-600">
                                {hint}
                              </p>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {/* {(suggestions.length > 0 || serviceSuggestions.length > 0) && (
                <div className="border-t border-gray-100 px-2 py-1.5">
                  <button
                    type="button"
                    className="w-full rounded-md px-2 py-2 text-center text-xs font-semibold text-orange-600 hover:bg-orange-50"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go()}
                  >
                    See all results for “{q}”
                  </button>
                </div>
              )} */}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [notifBadge, setNotifBadge] = useState(0);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSearching, setLocationSearching] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState({
    label: 'Choose your location',
    lat: null,
    lon: null,
  });

  const dropdownRef = useRef(null);
  const notifPanelRef = useRef(null);
  const notifListRef = useRef([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const { open: authModalOpen, openAuth } = useAuthModal();

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

  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const cartItems = useSelector((s) => s.cart.items);
  // const cartItems = useSelector((s) => s.cart?.items || []);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((a, i) => a + i.quantity, 0),
  );
  // const cartCount = useSelector((s) =>
  //   s.cart.items.reduce((a, i) => a + i.quantity, 0),
  // );

  // const [serviceCartCount, setServiceCartCount] = useState(0);
  const [serviceCartCount, setServiceCartCount] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // useEffect(() => {
  //   const check = () => {
  //     try {
  //       const raw = localStorage.getItem('rentpay_pending_service_booking');
  //       setServiceCartCount(raw ? 1 : 0);
  //     } catch {
  //       setServiceCartCount(0);
  //     }
  //   };
  useEffect(() => {
    const check = () => {
      try {
        const raw = localStorage.getItem('rentpay_pending_service_bookings');
        const list = raw ? JSON.parse(raw) : [];
        setServiceCartCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setServiceCartCount(0);
      }
    };
    check();
    // Re-check when storage changes (e.g. service added/removed in another tab or same page)
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    window.addEventListener('rn_service_cart_changed', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('focus', check);
      window.removeEventListener('rn_service_cart_changed', check);
    };
  }, []);

  const totalCartCount = cartCount + serviceCartCount;

  const firstLetter = user?.fullName?.charAt(0)?.toUpperCase() || '';
  const firstName = user?.fullName?.split(' ')[0] || '';

  // const SEARCH_PLACEHOLDERS = [
  //   'Search for "AC Service"',
  //   'Search for "Vehicle"',
  //   'Search for "Electronics"',
  //   'Search for "Furniture"',
  //   'Search for "Camera"',
  // ];
  // const [placeholderIdx, setPlaceholderIdx] = useState(0);
  // const [placeholderVisible, setPlaceholderVisible] = useState(true);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setPlaceholderVisible(false);
  //     setTimeout(() => {
  //       setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
  //       setPlaceholderVisible(true);
  //     }, 300);
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, []);

  // const animatedPlaceholder = SEARCH_PLACEHOLDERS[placeholderIdx];

  const FALLBACK_PLACEHOLDER_WORDS = [
    'AC Service',
    'Vehicle',
    'Electronics',
    'Furniture',
    'Camera',
  ];
  const [searchPlaceholders, setSearchPlaceholders] = useState(
    FALLBACK_PLACEHOLDER_WORDS,
  );
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [isDeletingPlaceholder, setIsDeletingPlaceholder] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/admin/get-all-sub-categories')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const names = list.map((s) => s?.name).filter(Boolean);
        if (names.length > 0) {
          setSearchPlaceholders(names);
        }
      })
      .catch(() => {
        /* keep fallback placeholders on error */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // useEffect(() => {
  //   if (searchPlaceholders.length <= 1) return undefined;
  //   const interval = setInterval(() => {
  //     setPlaceholderVisible(false);
  //     setTimeout(() => {
  //       setPlaceholderIdx((i) => (i + 1) % searchPlaceholders.length);
  //       setPlaceholderVisible(true);
  //     }, 300);
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, [searchPlaceholders.length]);

  // const animatedPlaceholder =
  //   searchPlaceholders[placeholderIdx] || FALLBACK_PLACEHOLDERS[0];

  useEffect(() => {
    if (searchPlaceholders.length === 0) return undefined;
    const currentWord =
      searchPlaceholders[placeholderIdx % searchPlaceholders.length] ||
      FALLBACK_PLACEHOLDERS[0];

    let timeout;
    if (!isDeletingPlaceholder) {
      if (typedPlaceholder.length < currentWord.length) {
        timeout = setTimeout(() => {
          setTypedPlaceholder(
            currentWord.slice(0, typedPlaceholder.length + 1),
          );
        }, 70);
      } else {
        timeout = setTimeout(() => setIsDeletingPlaceholder(true), 2000);
      }
    } else if (typedPlaceholder.length > 0) {
      timeout = setTimeout(() => {
        setTypedPlaceholder(typedPlaceholder.slice(0, -1));
      }, 40);
    } else {
      setIsDeletingPlaceholder(false);
      setPlaceholderIdx((i) => (i + 1) % searchPlaceholders.length);
    }
    return () => clearTimeout(timeout);
  }, [
    typedPlaceholder,
    isDeletingPlaceholder,
    placeholderIdx,
    searchPlaceholders,
  ]);

  // const animatedPlaceholder = typedPlaceholder
  //   ? `Search for "${typedPlaceholder}"`
  //   : 'Search for';
  const animatedPlaceholder = typedPlaceholder
    ? `Search for '${typedPlaceholder}'`
    : 'Search for';

  // useEffect(() => {
  //   if (typeof window === 'undefined') return;
  //   try {
  //     const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
  //     if (!raw) return;
  //     const parsed = JSON.parse(raw);
  //     if (
  //       parsed &&
  //       typeof parsed.label === 'string' &&
  //       Number.isFinite(Number(parsed.lat)) &&
  //       Number.isFinite(Number(parsed.lon))
  //     ) {
  //       setDeliveryLocation({
  //         label: parsed.label,
  //         lat: Number.isFinite(Number(parsed.lat)) ? Number(parsed.lat) : null,
  //         lon: Number.isFinite(Number(parsed.lon)) ? Number(parsed.lon) : null,
  //       });
  //     }
  //   } catch {
  //     /* ignore corrupt local value */
  //   }
  // }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
      if (!raw) {
        setShowLocationModal(true);
        return;
      }
      //     const parsed = JSON.parse(raw);
      //     if (
      //       parsed &&
      //       typeof parsed.label === 'string' &&
      //       Number.isFinite(Number(parsed.lat)) &&
      //       Number.isFinite(Number(parsed.lon))
      //     ) {
      //       setDeliveryLocation({
      //         label: parsed.label,
      //         lat: Number.isFinite(Number(parsed.lat)) ? Number(parsed.lat) : null,
      //         lon: Number.isFinite(Number(parsed.lon)) ? Number(parsed.lon) : null,
      //       });
      //     } else {
      //       setShowLocationModal(true);
      //     }
      //   } catch {
      //     /* ignore corrupt local value */
      //     setShowLocationModal(true);
      //   }
      // }, []);

      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.label === 'string' &&
        Number.isFinite(Number(parsed.lat)) &&
        Number.isFinite(Number(parsed.lon))
      ) {
        setDeliveryLocation({
          label: parsed.label,
          lat: Number.isFinite(Number(parsed.lat)) ? Number(parsed.lat) : null,
          lon: Number.isFinite(Number(parsed.lon)) ? Number(parsed.lon) : null,
        });
        // A valid saved location was found — make sure the modal
        // isn't left open by a race with any other trigger
        // (e.g. rn_open_location_modal being dispatched elsewhere).
        setShowLocationModal(false);
      } else {
        setShowLocationModal(true);
      }
    } catch {
      /* ignore corrupt local value */
      setShowLocationModal(true);
    }
  }, []);

  useEffect(() => {
    if (!showLocationModal || typeof document === 'undefined') return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showLocationModal]);

  const prevAuthModalOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = prevAuthModalOpenRef.current;
    prevAuthModalOpenRef.current = authModalOpen;
    // Auth modal just closed (login/signup completed OR cancelled by user)
    if (wasOpen && !authModalOpen) {
      const hasLocation =
        deliveryLocation.lat != null && deliveryLocation.lon != null;
      if (!hasLocation) {
        setShowLocationModal(true);
      }
    }
  }, [authModalOpen, deliveryLocation.lat, deliveryLocation.lon]);

  const applyDeliveryLocation = useCallback(
    (label, lat, lon) => {
      const next = {
        label: String(label || '').trim() || 'Choose your location',
        lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
        lon: Number.isFinite(Number(lon)) ? Number(lon) : null,
      };
      setDeliveryLocation(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(
          new CustomEvent('rn_delivery_location_changed', { detail: next }),
        );
      }
      if (isAuthenticated && cartItems.length) {
        const productIds = Array.from(
          new Set(
            cartItems.map((i) => String(i?.productId || '')).filter(Boolean),
          ),
        );
        if (productIds.length && next.lat != null && next.lon != null) {
          apiGetCheckoutPickupStores(productIds, {
            userLat: next.lat,
            userLng: next.lon,
          })
            .then((res) => {
              const validProductIds = new Set(
                (res.data?.stores || [])
                  .flatMap((store) => store?.products || [])
                  .map((p) => String(p?.productId || ''))
                  .filter(Boolean),
              );
              cartItems.forEach((item) => {
                const id = String(item?.productId || '');
                if (!id || validProductIds.has(id)) return;
                dispatch(removeFromCart(id));
              });
            })
            .catch(() => {
              /* keep cart unchanged on API error */
            });
        }
      }
      return next;
    },
    [isAuthenticated, cartItems, dispatch],
  );

  // Keep cart UI in sync when user logs in/out without a full refresh.
  // (Cart state is stored in localStorage, scoped per user.)
  useEffect(() => {
    dispatch(syncCart());
  }, [dispatch, isAuthenticated, user?.id, user?._id, user?.email]);

  useEffect(() => {
    notifListRef.current = notifList;
  }, [notifList]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifBadge(0);
      setNotifList([]);
      return;
    }
    const uid = user?.id || user?._id;
    apiGetUserNotifications()
      .then((res) => {
        const list = res.data?.notifications || [];
        const localList = readLocalNotifications();
        setNotifBadge(getUnreadNotifCount([...localList, ...list], uid));
      })
      .catch(() => {
        const localList = readLocalNotifications();
        setNotifBadge(getUnreadNotifCount(localList, uid));
      });
  }, [isAuthenticated, user?.id, user?._id]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const onLocalNotifAdded = () => {
      const uid = user?.id || user?._id;
      apiGetUserNotifications()
        .then((res) => {
          const list = res.data?.notifications || [];
          const localList = readLocalNotifications();
          setNotifBadge(getUnreadNotifCount([...localList, ...list], uid));
        })
        .catch(() => {
          const localList = readLocalNotifications();
          setNotifBadge(getUnreadNotifCount(localList, uid));
        });
    };
    window.addEventListener('rn_local_notification_added', onLocalNotifAdded);
    return () =>
      window.removeEventListener(
        'rn_local_notification_added',
        onLocalNotifAdded,
      );
  }, [isAuthenticated, user?.id, user?._id]);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const extra = [];
      if (
        typeof window !== 'undefined' &&
        sessionStorage.getItem('rn_login_welcome')
      ) {
        sessionStorage.removeItem('rn_login_welcome');
        extra.push({
          id: 'login-welcome',
          type: 'welcome',
          title: 'Welcome back!',
          detail: `Hi ${firstName || 'there'}, you're signed in. Check your latest updates below.`,
          href: '/',
          at: new Date().toISOString(),
        });
      }
      const res = await apiGetUserNotifications();
      const apiList = res.data?.notifications || [];
      const localList = readLocalNotifications();
      const merged = [...extra, ...localList, ...apiList].sort(
        (a, b) => new Date(b.at) - new Date(a.at),
      );
      const seen = new Set();
      const deduped = [];
      for (const row of merged) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        deduped.push(row);
      }
      const slice = deduped.slice(0, 7);
      setNotifList(slice);
    } catch {
      setNotifList([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const refreshNotifBadge = useCallback(() => {
    const uid = user?.id || user?._id;
    return apiGetUserNotifications()
      .then((res) => {
        const list = res.data?.notifications || [];
        setNotifBadge(getUnreadNotifCount(list, uid));
      })
      .catch(() => setNotifBadge(0));
  }, [user?.id, user?._id]);

  const closeNotifPanel = useCallback(() => {
    const uid = user?.id || user?._id;
    persistSeenNotifIds(notifListRef.current, uid);
    setShowNotifPanel(false);
    refreshNotifBadge();
  }, [user?.id, user?._id, refreshNotifBadge]);

  const toggleNotifPanel = () => {
    if (showNotifPanel) {
      closeNotifPanel();
    } else {
      setNotifBadge(0);
      setShowNotifPanel(true);
      loadNotifications();
    }
    setShowProfileDropdown(false);
  };

  //  Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (
        !showNotifPanel ||
        !notifPanelRef.current ||
        notifPanelRef.current.contains(e.target)
      ) {
        return;
      }
      closeNotifPanel();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifPanel, closeNotifPanel]);

  useEffect(() => {
    if (!showNotifPanel) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeNotifPanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showNotifPanel, closeNotifPanel]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onOpenLocationModal = () => setShowLocationModal(true);
    window.addEventListener('rn_open_location_modal', onOpenLocationModal);
    return () =>
      window.removeEventListener('rn_open_location_modal', onOpenLocationModal);
  }, []);

  //  Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post(USER_AUTH.logout);
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      const uid = user?.id || user?._id;
      if (uid) {
        try {
          localStorage.removeItem(seenNotifStorageKey(uid));
        } catch {
          /* ignore */
        }
      }
      dispatch(logoutAction());
      dispatch(clearCart());
      setShowProfileDropdown(false);
      setShowNotifPanel(false);
      setShowLogoutConfirm(false);
      setLoggingOut(false);
      router.push('/');
    }
  };

  const runProductSearch = (term) => {
    const t = String(term || '').trim();
    if (!t) return;
    router.push(`/products?search=${encodeURIComponent(t)}`);
  };

  const runServiceSearch = (term) => {
    const t = String(term || '').trim();
    if (!t) return;
    router.push(`/products?tab=services&search=${encodeURIComponent(t)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runProductSearch(search);
  };

  useEffect(() => {
    if (!showLocationModal) return;
    const q = String(locationQuery || '').trim();
    if (q.length < 3) {
      setLocationOptions([]);
      setLocationSearching(false);
      return;
    }
    const t = setTimeout(async () => {
      setLocationSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=in&q=${encodeURIComponent(
          q,
        )}`;
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        // const out = Array.isArray(data)
        //   ? data.map((x) => ({
        //       id: x.place_id,
        //       label: x.display_name,
        //       lat: Number(x.lat),
        //       lon: Number(x.lon),
        //     }))
        //   : [];
        const out = Array.isArray(data)
          ? data.map((x) => ({
              id: x.place_id,
              label: stripPincodeFromLabel(x.display_name),
              lat: Number(x.lat),
              lon: Number(x.lon),
            }))
          : [];
        setLocationOptions(
          out.filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon)),
        );
      } catch {
        setLocationOptions([]);
      } finally {
        setLocationSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [locationQuery, showLocationModal]);

  const chooseLocation = async ({ label, lat, lon }) => {
    applyDeliveryLocation(label, lat, lon);
    setLocationError('');
    setShowLocationModal(false);
    setLocationQuery('');
    setLocationOptions([]);
    setShowSavedAddresses(false);
  };

  const onFetchMyLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          // let label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          // try {
          //   const rev = await fetch(
          //     `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          //       lat,
          //     )}&lon=${encodeURIComponent(lon)}`,
          //     { headers: { Accept: 'application/json' } },
          //   );
          //   const revData = await rev.json();
          //   if (revData?.display_name) label = revData.display_name;
          // } catch {
          //   /* reverse geocode optional */
          // }
          let label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          try {
            const rev = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                lat,
              )}&lon=${encodeURIComponent(lon)}`,
              { headers: { Accept: 'application/json' } },
            );
            const revData = await rev.json();
            if (revData?.display_name) {
              label = stripPincodeFromLabel(revData.display_name);
            }
          } catch {
            /* reverse geocode optional */
          }
          await chooseLocation({ label, lat, lon });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocationError(err?.message || 'Unable to fetch your location.');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const onSavedAddressClick = async () => {
    if (!isAuthenticated) {
      setShowLocationModal(false);
      openAuth('login');
      return;
    }
    setShowSavedAddresses((v) => !v);
    if (savedAddresses.length > 0 || loadingSavedAddresses) return;
    setLoadingSavedAddresses(true);
    try {
      const res = await apiGetMyAddresses();
      setSavedAddresses(
        Array.isArray(res.data?.addresses) ? res.data.addresses : [],
      );
    } catch {
      setSavedAddresses([]);
      setLocationError('Could not load saved addresses.');
    } finally {
      setLoadingSavedAddresses(false);
    }
  };

  // const chooseSavedAddress = async (addr) => {
  //   const parts = [
  //     addr?.addressLine,
  //     addr?.area,
  //     addr?.city,
  //     addr?.pincode ? `- ${addr.pincode}` : '',
  //   ]
  //     .filter(Boolean)
  //     .join(', ');
  //   setLocationSearching(true);
  //   try {
  //     const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
  //       parts,
  //     )}`;
  //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
  //     const data = await res.json();
  //     const first = Array.isArray(data) ? data[0] : null;
  //     if (!first) {
  //       setLocationError('Could not map this saved address location.');
  //       return;
  //     }
  //     await chooseLocation({
  //       label: parts,
  //       lat: Number(first.lat),
  //       lon: Number(first.lon),
  //     });
  //   } catch {
  //     setLocationError('Failed to use saved address location.');
  //   } finally {
  //     setLocationSearching(false);
  //   }
  // };

  const chooseSavedAddress = async (addr) => {
    const parts = [
      addr?.addressLine,
      addr?.area,
      addr?.city,
      addr?.pincode ? `- ${addr.pincode}` : '',
    ]
      .filter(Boolean)
      .join(', ');
    // Display label for the navbar pill should not include the pincode,
    // even though the pincode is still used in the geocoding query below
    // for accuracy.
    const displayLabel = [addr?.addressLine, addr?.area, addr?.city]
      .filter(Boolean)
      .join(', ');
    setLocationSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(
        parts,
      )}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      const first = Array.isArray(data) ? data[0] : null;
      if (!first) {
        setLocationError('Could not map this saved address location.');
        return;
      }
      await chooseLocation({
        label: displayLabel || parts,
        lat: Number(first.lat),
        lon: Number(first.lon),
      });
    } catch {
      setLocationError('Failed to use saved address location.');
    } finally {
      setLocationSearching(false);
    }
  };
  return (
    <>
      <header className="bg-white border-b sticky top-0 z-50">
        <div className=" mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {!isAuthenticated ? (
            <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 sm:gap-x-3 md:gap-x-4">
              {/*
              <Link
                href="/"
                className="flex shrink-0 items-center justify-self-start gap-2"
              >
                <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  R
                </div>

                <span className="text-lg  font-bold text-[#F97316] whitespace-nowrap">
                  Rentnpay
                </span>
              </Link>

              <div className="flex min-w-0 w-full flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-center md:gap-3"> */}
              <div className="flex shrink-0 items-center justify-self-start gap-3 min-w-0">
                {/* <Link href="/" className="flex shrink-0 items-center gap-2">
                  <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    R
                  </div>
                  <span className="hidden sm:inline text-lg  font-bold text-[#F97316] whitespace-nowrap">
                    Rentnpay
                  </span>
                </Link> */}

                {/* <Link href="/" className="flex shrink-0 items-center gap-1">
                  <img
                    src={RentnpayLogo.src}
                    alt="Rentnpay"
                    className="w-7 h-7 shrink-0 object-contain"
                  />
                  <span className="hidden sm:inline text-lg  font-bold text-[#F97316] whitespace-nowrap">
                    Rentnpay
                  </span>
                </Link> */}

                <Link href="/" className="flex shrink-0 items-center gap-1">
                  <Image
                    src={RentnpayLogo}
                    alt="Rentnpay"
                    priority
                    className="w-7 h-7 shrink-0 object-contain"
                  />
                  <span className="hidden sm:inline text-lg  font-bold text-[#F97316] whitespace-nowrap">
                    Rentnpay
                  </span>
                </Link>

                {/* Nav links — Rent, Sell, Service */}
                <nav className="hidden md:flex items-center shrink-0 ml-2 w-[168px]">
                  <div className="flex items-center gap-6">
                    {locationSourceFlags.rentEnabled ? (
                      <Link
                        href="/rent"
                        className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
                      >
                        Rent
                      </Link>
                    ) : null}
                    {locationSourceFlags.buyEnabled ? (
                      <Link
                        href="/buy"
                        className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
                      >
                        Buy
                      </Link>
                    ) : null}
                    {locationSourceFlags.serviceEnabled ? (
                      <Link
                        href="/service"
                        className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
                      >
                        Services
                      </Link>
                    ) : null}
                  </div>
                </nav>
                {/*
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex md:hidden items-center gap-2 min-w-0 flex-1 border border-gray-300 bg-white pl-2.5 pr-2 py-[7px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors shrink-0"
                >
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate min-w-0 flex-1 text-left">
                    {deliveryLocation.label === 'Choose your location'
                      ? 'Choose location'
                      : deliveryLocation.label.length > 10
                        ? `${deliveryLocation.label.slice(0, 10)}...`
                        : deliveryLocation.label}
                  </span>
                  <ChevronDown size={13} className="text-gray-400 shrink-0" />
                </button>
              </div>

              <div className="flex min-w-0 w-full flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-center md:gap-3">
                <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3"> */}
              </div>

              <div className="flex min-w-0 w-full flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-center md:gap-3">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex md:hidden items-center gap-1 min-w-0 w-full border border-gray-300 bg-white pl-2.5 pr-2 py-[7px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
                >
                  <MapPin size={14} className="text-gray-500 shrink-0" />
                  <span className="truncate min-w-0 flex-1 text-left">
                    {deliveryLocation.label === 'Choose your location'
                      ? 'Choose location'
                      : deliveryLocation.label.length > 32
                        ? `${deliveryLocation.label.slice(0, 32)}...`
                        : deliveryLocation.label}
                  </span>
                  <ChevronDown size={13} className="text-gray-500 shrink-0" />
                </button>

                {/* Location + Search — separate pills, with a gap */}
                <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3">
                  {/* <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="flex items-center gap-2 w-1/2 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
                  >
                    <MapPin size={15} className="text-gray-500 shrink-0" />
                    <span className="truncate flex-1 text-left">
                      {deliveryLocation.label === 'Choose your location'
                        ? 'Choose location'
                        : deliveryLocation.label.length > 30
                          ? `${deliveryLocation.label.slice(0, 30)}…`
                          : deliveryLocation.label}
                    </span>
                    <ChevronDown size={14} className="text-gray-500 shrink-0" />
                  </button>

                  <form onSubmit={handleSearch} className="w-1/2">
                    <SearchInputWithSuggestions
                      search={search}
                      setSearch={setSearch}
                      onSearchNavigate={runProductSearch}
                      onServiceNavigate={runServiceSearch}
                      wrapperClassName="w-full"
                      placeholder={animatedPlaceholder}
                      iconLeftClass="left-3"
                      inputClassName={`w-full pl-8 pr-3 py-[9px] text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
                    />
                  </form>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-end justify-self-end gap-2 sm:gap-3"> */}
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="flex items-center gap-1 w-1/2 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
                  >
                    <MapPin size={15} className="text-gray-500 shrink-0" />
                    <span className="truncate flex-1 text-left">
                      {deliveryLocation.label === 'Choose your location'
                        ? 'Choose location'
                        : deliveryLocation.label.length > 30
                          ? `${deliveryLocation.label.slice(0, 30)}…`
                          : deliveryLocation.label}
                    </span>
                    <ChevronDown size={14} className="text-gray-500 shrink-0" />
                  </button>

                  <form onSubmit={handleSearch} className="w-1/2">
                    <SearchInputWithSuggestions
                      search={search}
                      setSearch={setSearch}
                      onSearchNavigate={runProductSearch}
                      onServiceNavigate={runServiceSearch}
                      wrapperClassName="w-full"
                      placeholder={animatedPlaceholder}
                      iconLeftClass="left-3"
                      inputClassName={`w-full pl-8 pr-3 py-[9px] text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
                    />
                  </form>
                </div>
              </div>
              {/* <div className="flex shrink-0 items-center justify-end justify-self-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
                >
                  Login/Signup
                  <LogIn size={16} />
                </button>
              </div> */}

              <div className="flex shrink-0 items-center justify-end justify-self-end gap-2 sm:gap-3">
                <Link
                  href="/cart"
                  className="relative flex items-center gap-1 text-gray-500 hover:text-black p-1"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {hasMounted && totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
                      {totalCartCount > 9 ? '9+' : totalCartCount}
                    </span>
                  )}
                </Link>
                {/* <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
                >
                  Login
                </button> */}
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
                >
                  Login/Signup
                  <LogIn size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              {/* <Link
                href="/"
                className="flex shrink-0 items-center justify-self-start gap-2"
              >
                <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  R
                </div>

                <span className="text-xl  font-bold text-[#F97316] whitespace-nowrap">
                  Rentnpay
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-6 shrink-0"> */}
              {/* <Link
                href="/"
                className="flex shrink-0 items-center justify-self-start gap-2"
              >
                <div className="w-8 h-8  bg-[#F97316] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  R
                </div>

                <span className="hidden sm:inline text-xl  font-bold text-[#F97316] whitespace-nowrap">
                  Rentnpay
                </span>
              </Link> */}
              {/* <Link
                href="/"
                className="flex shrink-0 items-center justify-self-start gap-1"
              >
                <img
                  src={RentnpayLogo.src}
                  alt="Rentnpay"
                  className="w-7 h-7 shrink-0 object-contain"
                />

                <span className="hidden sm:inline text-xl  font-bold text-[#F97316] whitespace-nowrap">
                  Rentnpay
                </span>
              </Link> */}
              <Link
                href="/"
                className="flex shrink-0 items-center justify-self-start gap-1"
              >
                <Image
                  src={RentnpayLogo}
                  alt="Rentnpay"
                  priority
                  className="w-7 h-7 shrink-0 object-contain"
                />

                <span className="hidden sm:inline text-xl  font-bold text-[#F97316] whitespace-nowrap">
                  Rentnpay
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="flex md:hidden items-center gap-1 min-w-0 flex-1 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors shrink-0"
              >
                <MapPin size={15} className="text-gray-500 shrink-0" />
                <span className="truncate flex-1 text-left">
                  {deliveryLocation.label === 'Choose your location'
                    ? 'Choose location'
                    : deliveryLocation.label}
                </span>
                <ChevronDown size={14} className="text-gray-500 shrink-0" />
              </button>

              {/* Nav links — Rent, Sell, Service */}
              {/* <nav className="hidden md:flex items-center gap-6 shrink-0">
                <Link
                  href="/products"
                  className="text-sm  text-gray-700 hover:text-[#F97316] transition-colors"
                >
                  Rent */}
              {/* Nav links — Rent, Sell, Service */}
              {/* Nav links — Rent, Sell, Service */}
              <nav className="hidden md:flex items-center shrink-0 md:ml-6 w-[168px]">
                <div className="flex items-center gap-6">
                  {locationSourceFlags.rentEnabled ? (
                    <Link
                      href="/rent"
                      className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
                    >
                      Rent
                    </Link>
                  ) : null}
                  {locationSourceFlags.buyEnabled ? (
                    <Link
                      href="/buy"
                      className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
                    >
                      Buy
                    </Link>
                  ) : null}
                  {locationSourceFlags.serviceEnabled ? (
                    <Link
                      href="/service"
                      className="text-sm font-bold text-gray-500 hover:text-[#000000] transition-colors whitespace-nowrap"
                    >
                      Services
                    </Link>
                  ) : null}
                </div>
              </nav>

              {/* Location + Search — separate pills, with a gap */}

              {/* <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3 mx-4 md:ml-10">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex md:hidden items-center gap-1.5 min-w-0 max-w-[150px] sm:max-w-[200px] border border-gray-300 bg-white pl-2.5 pr-2 py-[7px] rounded-lg text-xs text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors shrink-0"
                >
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate min-w-0 flex-1 text-left">
                    {deliveryLocation.label === 'Choose your location'
                      ? 'Choose location'
                      : deliveryLocation.label}
                  </span>
                  <ChevronDown size={13} className="text-gray-400 shrink-0" />
                </button>

                <form onSubmit={handleSearch} className="w-1/2"> */}
              <div className="hidden md:flex items-center flex-1 max-w-xl min-w-0 gap-3 mx-4 md:ml-10">
                {/* <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-2 w-1/2 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
                >
                  <MapPin size={15} className="text-gray-500 shrink-0" />
                  <span className="truncate flex-1 text-left">
                    {deliveryLocation.label === 'Choose your location'
                      ? 'Choose location'
                      : deliveryLocation.label.length > 30
                        ? `${deliveryLocation.label.slice(0, 30)}…`
                        : deliveryLocation.label}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 shrink-0" />
                </button>

                <form onSubmit={handleSearch} className="w-1/2">
                  <SearchInputWithSuggestions
                    search={search}
                    setSearch={setSearch}
                    onSearchNavigate={runProductSearch}
                    onServiceNavigate={runServiceSearch}
                    wrapperClassName="w-full"
                    placeholder={animatedPlaceholder}
                    iconLeftClass="left-3"
                    inputClassName={`w-full pl-8 pr-3 py-[9px] text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
                  />
                </form>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-500 shrink-0 ml-auto"> */}

                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-1 w-1/2 border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
                >
                  <MapPin size={15} className="text-gray-500 shrink-0" />
                  <span className="truncate flex-1 text-left">
                    {deliveryLocation.label === 'Choose your location'
                      ? 'Choose location'
                      : deliveryLocation.label.length > 30
                        ? `${deliveryLocation.label.slice(0, 30)}…`
                        : deliveryLocation.label}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 shrink-0" />
                </button>

                <form onSubmit={handleSearch} className="w-1/2">
                  <SearchInputWithSuggestions
                    search={search}
                    setSearch={setSearch}
                    onSearchNavigate={runProductSearch}
                    onServiceNavigate={runServiceSearch}
                    wrapperClassName="w-full"
                    placeholder={animatedPlaceholder}
                    iconLeftClass="left-3"
                    inputClassName={`w-full pl-8 pr-3 py-[9px] text-sm border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
                  />
                </form>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-500 shrink-0 ml-auto">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href="/cart"
                      className="relative flex items-center gap-1 text-gray-500 hover:text-black p-1"
                    >
                      {/* <ShoppingCart size={18} className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-1 sm:-top-2 sm:-right-3 bg-red-600 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                          {cartCount}
                        </span>
                      )} */}
                      <ShoppingCart className="w-5 h-5" />

                      {/* {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )} */}
                      {hasMounted && totalCartCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
                          {totalCartCount > 9 ? '9+' : totalCartCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-1 hover:text-black p-1"
                    >
                      <Heart size={18} className="w-5 h-5 " />
                    </Link>
                  </>
                ) : null}
                {/* //test */}

                {isAuthenticated && user ? (
                  <>
                    {showNotifPanel ? (
                      <button
                        type="button"
                        aria-label="Close notifications"
                        className="fixed inset-0 z-[55] bg-black/20 md:bg-transparent"
                        onClick={closeNotifPanel}
                      />
                    ) : null}
                    <div className="relative" ref={notifPanelRef}>
                      {/* <button
                        type="button"
                        onClick={toggleNotifPanel}
                        aria-expanded={showNotifPanel}
                        aria-haspopup="dialog"
                        className="relative w-9 h-9 flex items-center justify-center    text-gray-600 hover:text-black "
                      >
                        <span className="sr-only">Notifications</span>
                        <Bell className="w-5 h-5" strokeWidth={1.8} />
                        {notifBadge > 0 ? (
                          <span className="absolute -top-1 -right-1 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
                            {notifBadge > 9 ? '9+' : notifBadge}
                          </span>
                        ) : null}
                      </button> */}
                      <button
                        type="button"
                        onClick={toggleNotifPanel}
                        aria-expanded={showNotifPanel}
                        aria-haspopup="dialog"
                        className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-black"
                      >
                        <span className="sr-only">Notifications</span>

                        <Bell className="w-5 h-5" strokeWidth={1.8} />

                        {notifBadge > 0 && (
                          <span className="absolute top-0.5 right-0 min-h-[1.125rem] min-w-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold leading-none shadow-sm">
                            {notifBadge > 9 ? '9+' : notifBadge}
                          </span>
                        )}
                      </button>

                      {showNotifPanel ? (
                        <div
                          role="dialog"
                          aria-label="Notifications"
                          className="fixed z-[60] top-[calc(3.75rem+env(safe-area-inset-top,0px))] right-[max(0.75rem,env(safe-area-inset-right,0px))] w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">
                              Notifications
                            </p>
                            {/* <span className="text-[11px] text-gray-400">
                              Last 7 updates
                            </span> */}
                          </div>
                          {notifLoading ? (
                            <p className="px-4 py-6 text-sm text-gray-500 text-center">
                              Loading…
                            </p>
                          ) : notifList.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-gray-500 text-center">
                              No recent notification yet.
                            </p>
                          ) : (
                            <ul className="max-h-[min(70vh,20rem)] overflow-y-auto divide-y divide-gray-50">
                              {notifList.map((n) => (
                                <li
                                  key={n.id}
                                  className={`px-4 py-3 hover:bg-gray-50 ${n.href ? 'cursor-pointer' : ''}`}
                                  onClick={() => {
                                    if (!n.href) return;
                                    router.push(n.href);
                                    closeNotifPanel();
                                  }}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900">
                                        {n.title}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                        {n.detail}
                                      </p>
                                      <p className="text-[11px] text-gray-400 mt-1">
                                        {formatNotifTime(n.at)}
                                      </p>
                                    </div>
                                    {/* {n.href ? (
                                  <button
                                    type="button"
                                    className="shrink-0 px-3 py-1.5 text-xs font-semibold text-[#F97316] border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100"
                                    onClick={() => {
                                      router.push(n.href || '/');
                                      setShowNotifPanel(false);
                                    }}
                                  >
                                    View
                                  </button>
                                ) : null} */}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {/*  Profile with dropdown — only when logged in */}
                {isAuthenticated && user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowProfileDropdown((prev) => !prev)}
                      className="flex items-center gap-2 hover:text-black p-1"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F97316] text-white flex items-center justify-center text-lg font-bold shrink-0">
                        {firstLetter}
                      </div>
                      {/* <span className="hidden md:inline text-sm font-medium">
                        {firstName}
                      </span> */}
                      {/* <ChevronDown
                        size={14}
                        className="hidden md:block text-gray-400"
                      /> */}
                    </button>

                    {/*  Dropdown */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                        <Link
                          href="/my-account"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User size={15} className="text-orange-500" />
                          My Account
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                        >
                          <Settings size={15} className="text-orange-500" />
                          Settings
                        </Link>

                        {/* <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 border-t border-gray-100"
                        >
                          <LogOut size={15} />
                          {loggingOut ? 'Logging out…' : 'Logout'}
                        </button> */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                        >
                          <LogOut size={15} />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Mobile menu button */}
                {/* <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button> */}
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {/* {menuOpen && (
          <div className="md:hidden border-t bg-white px-3 py-4 space-y-3">
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm text-gray-600 w-full justify-center"
            >
              <MapPin size={14} className="text-orange-500" />
              <span>Choose your location</span>
            </button>

            <form onSubmit={handleSearch} className="flex gap-2">
              <SearchInputWithSuggestions
                search={search}
                setSearch={setSearch}
                onSearchNavigate={runProductSearch}
                wrapperClassName="flex-1 min-w-0"
                iconLeftClass="left-3"
                placeholder="Search..."
                inputClassName="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shrink-0"
              >
                Search
              </button>
            </form>

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  openAuth('login');
                  setMenuOpen(false);
                }}
                className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
              >
                Login
              </button>
            )}

            {isAuthenticated && user && (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {firstLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  <User size={15} />
                  My Profile & KYC
                </Link>
                <Link
                  href="/my-address"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  <MapPin size={15} className="text-orange-500" />
                  My Address
                </Link>

                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  <Truck size={15} className="text-orange-500" />
                  My Orders
                </Link>

                <Link
                  href="/my-rentals"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  <Sofa size={15} className="text-orange-500 shrink-0" />
                  Rental Products
                </Link>
                <Link
                  href="/referral"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  <User2 size={15} className="text-orange-500 shrink-0" />
                  Referral
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 disabled:opacity-50"
                >
                  <LogOut size={15} />
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        )} */}
        {/* Mobile menu modal */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative ml-auto w-[85vw] max-w-xs bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800"></span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-3 py-4 space-y-3 flex-1">
                {/* <button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm text-gray-600 w-full justify-center"
                >
                  <MapPin size={14} className="text-orange-500" />
                  <span>Choose your location</span>
                </button> */}
                {/*
                <form
                  onSubmit={(e) => {
                    handleSearch(e);
                    setMenuOpen(false);
                  }}
                  className="flex gap-2"
                >
                  <SearchInputWithSuggestions
                    search={search}
                    setSearch={setSearch}
                    onSearchNavigate={(term) => {
                      runProductSearch(term);
                      setMenuOpen(false);
                    }}
                    wrapperClassName="flex-1 min-w-0"
                    iconLeftClass="left-3"
                    placeholder="Search..."
                    inputClassName="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F97316] text-white text-sm font-medium rounded-lg shrink-0"
                  >
                    Search
                  </button>
                </form> */}

                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      openAuth('login');
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600"
                  >
                    Login
                  </button>
                )}

                {isAuthenticated && user && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    {/* <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                      <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div> */}
                    <Link
                      href="/my-account"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User size={15} className="text-orange-500" />
                      My Account
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                    >
                      <Settings size={15} className="text-orange-500" />
                      Settings
                    </Link>

                    {/* <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 border-t border-gray-100"
                    >
                      <LogOut size={15} />
                      {loggingOut ? 'Logging out…' : 'Logout'}
                    </button> */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                Confirm Logout
              </p>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                Are you sure you want to logout?
              </p>
              {/* <p className="mt-1 text-sm text-gray-500">
                You will need to login again to access your account.
              </p> */}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loggingOut ? 'Logging out…' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal — unchanged */}
      {/* {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4"> */}
      {showLocationModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 ${
            deliveryLocation.lat != null && deliveryLocation.lon != null
              ? 'bg-black/40'
              : 'bg-white'
          }`}
        >
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* <div className="flex justify-end p-3">
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div> */}
            <div className="flex justify-end p-3">
              {deliveryLocation.lat != null && deliveryLocation.lon != null ? (
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              ) : null}
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                Choose your location
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 text-center">
                Please select a location to view products near you.
              </p>
              <div className="mt-5">
                <label className="block text-xs sm:text-sm font-semibold text-black mb-1.5">
                  Search Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#F97316] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setLocationError('');
                    }}
                    placeholder="Enter area, street name..."
                    className="w-full pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                {locationSearching ? (
                  <p className="mt-2 text-xs text-gray-500">
                    Searching locations...
                  </p>
                ) : null}
                {locationOptions.length > 0 ? (
                  <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 divide-y">
                    {locationOptions.map((opt) => (
                      <li key={opt.id}>
                        <button
                          type="button"
                          onClick={() => chooseLocation(opt)}
                          className="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onFetchMyLocation}
                disabled={locating}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 shadow-[0_10px_22px_rgba(249,115,22,0.45)] disabled:opacity-60"
              >
                <LocateFixed className="w-4 h-4" />
                {locating ? 'Fetching location...' : 'Fetch my location'}
              </button>
              {/* <button
                type="button"
                onClick={() => {
                  onSavedAddressClick();
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-xs sm:text-sm text-gray-700 py-2.5 sm:py-3 hover:bg-gray-50"
              >
                <User className="w-4 h-4" />
                {isAuthenticated
                  ? 'Use saved addresses'
                  : 'Login for saved addresses'}
              </button> */}
              {/* {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(false);
                    openAuth('login');
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl font-semibold border border-gray-300 bg-white text-xs sm:text-sm text-black py-2.5 sm:py-3 hover:bg-gray-50"
                >
                  <User className="w-4 h-4 font-semibold text-black" />
                  Login for saved addresses
                </button>
              )} */}
              {showSavedAddresses ? (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 max-h-44 overflow-y-auto">
                  {loadingSavedAddresses ? (
                    <p className="px-3 py-2 text-xs text-gray-500">
                      Loading saved addresses...
                    </p>
                  ) : savedAddresses.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-gray-500">
                      No saved addresses yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {savedAddresses.map((addr) => {
                        const line = `${addr.addressLine || ''}${addr.area ? `, ${addr.area}` : ''}${
                          addr.city ? `, ${addr.city}` : ''
                        }${addr.pincode ? ` - ${addr.pincode}` : ''}`;
                        return (
                          <li key={addr._id}>
                            <button
                              type="button"
                              onClick={() => chooseSavedAddress(addr)}
                              className="w-full px-3 py-2 text-left hover:bg-white"
                            >
                              <p className="text-xs sm:text-sm font-medium text-gray-800">
                                {addr.label || 'Address'}
                              </p>
                              <p className="text-[11px] text-gray-600 mt-0.5">
                                {line}
                              </p>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
              {locationError ? (
                <p className="mt-3 text-xs text-red-600 text-center">
                  {locationError}
                </p>
              ) : null}
              {/* <div className="mt-4 flex items-start justify-center gap-1.5 text-[10px] sm:text-xs text-gray-500 text-center px-3">

                <p>
                  We deliver within{' '}
                  <span className="font-bold text-gray-800">50km radius</span>{' '}
                  from your location
                </p>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
