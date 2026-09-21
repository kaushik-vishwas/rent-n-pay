// 'use client';

// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Search, MapPin, ChevronDown, History, X } from 'lucide-react';
// import {
//   apiGetStorefrontVendorProducts,
//   apiGetServiceProducts,
// } from '@/lib/api';
// import { api } from '@/lib/axios';

// const DELIVERY_STORAGE_KEY = 'rn_delivery_location';

// const SEARCH_DEBOUNCE_MS = 220;
// const SEARCH_MIN_CHARS = 1;
// const SEARCH_SUGGEST_LIMIT = 10;
// const SEARCH_RECENT_KEY = 'rn_product_search_recent';
// const SEARCH_RECENT_MAX = 8;

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
// const FALLBACK_PLACEHOLDERS = [
//   'Search for "AC Service"',
//   'Search for "Vehicle"',
//   'Search for "Electronics"',
//   'Search for "Furniture"',
//   'Search for "Camera"',
// ];

// const NavbarSecondary = () => {
//   const router = useRouter();
//   const [search, setSearch] = useState('');
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [serviceSuggestions, setServiceSuggestions] = useState([]);
//   const [serviceLoading, setServiceLoading] = useState(false);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const wrapRef = useRef(null);
//   const [deliveryLabel, setDeliveryLabel] = useState('Choose you location');
//   const [searchPlaceholders, setSearchPlaceholders] = useState(
//     FALLBACK_PLACEHOLDERS,
//   );
//   const [placeholderIdx, setPlaceholderIdx] = useState(0);
//   const [placeholderVisible, setPlaceholderVisible] = useState(true);

//   useEffect(() => {
//     let cancelled = false;
//     api
//       .get('/admin/get-all-sub-categories')
//       .then((res) => {
//         if (cancelled) return;
//         const list = Array.isArray(res.data) ? res.data : [];
//         const names = list.map((s) => s?.name).filter(Boolean);
//         if (names.length > 0) {
//           setSearchPlaceholders(names.map((n) => `Search for "${n}"`));
//         }
//       })
//       .catch(() => {
//         /* keep fallback placeholders on error */
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   useEffect(() => {
//     if (searchPlaceholders.length <= 1) return undefined;
//     const interval = setInterval(() => {
//       setPlaceholderVisible(false);
//       setTimeout(() => {
//         setPlaceholderIdx((i) => (i + 1) % searchPlaceholders.length);
//         setPlaceholderVisible(true);
//       }, 300);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [searchPlaceholders.length]);

//   const animatedPlaceholder =
//     searchPlaceholders[placeholderIdx] || FALLBACK_PLACEHOLDERS[0];

//   const formatLocationLabel = (raw) => {
//     const s = String(raw || '').trim();
//     if (!s) return 'Choose your location';

//     // Keep it UI-friendly: show only the first 2 meaningful comma-separated parts
//     // (e.g., "Church Street, Wadi Bunder" or "Kochi, Ernakulam").
//     const parts = s
//       .split(',')
//       .map((x) => String(x).trim())
//       .filter(Boolean)
//       .filter((x) => !/^\s*india\s*$/i.test(x));

//     const first = parts[0] || s;
//     const second = parts[1] || '';
//     const combined = second ? `${first}, ${second}` : first;

//     // Final guardrail against very long strings.
//     if (combined.length <= 32) return combined;
//     return `${combined.slice(0, 32)}...`;
//   };

//   useEffect(() => {
//     if (typeof window === 'undefined') return undefined;

//     const readAndSet = () => {
//       try {
//         const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
//         if (!raw) return;
//         const parsed = JSON.parse(raw);
//         const label = String(parsed?.label || '').trim();
//         if (label) setDeliveryLabel(formatLocationLabel(label));
//       } catch {
//         /* ignore invalid local storage */
//       }
//     };

//     const onCustomChange = (e) => {
//       const label = String(e?.detail?.label || '').trim();
//       if (label) setDeliveryLabel(formatLocationLabel(label));
//     };

//     const onStorage = (e) => {
//       if (e.key !== DELIVERY_STORAGE_KEY) return;
//       readAndSet();
//     };

//     readAndSet();
//     window.addEventListener('rn_delivery_location_changed', onCustomChange);
//     window.addEventListener('storage', onStorage);
//     return () => {
//       window.removeEventListener(
//         'rn_delivery_location_changed',
//         onCustomChange,
//       );
//       window.removeEventListener('storage', onStorage);
//     };
//   }, []);

//   const q = search.trim();
//   const matchingRecent = useMemo(() => {
//     if (!q.length) return [];
//     const lower = q.toLowerCase();
//     return readSearchRecent().filter((r) => r.toLowerCase().includes(lower));
//   }, [q]);

//   const showRecentsOnly = open && q.length === 0 && recentSearches.length > 0;
//   const showSuggestionsPanel =
//     open &&
//     q.length >= SEARCH_MIN_CHARS &&
//     (suggestions.length > 0 ||
//       loading ||
//       serviceSuggestions.length > 0 ||
//       serviceLoading);

//   useEffect(() => {
//     if (!open) return;
//     if (q.length !== 0) return;
//     setRecentSearches(readSearchRecent());
//   }, [open, q.length]);

//   useEffect(() => {
//     if (!open) return;
//     if (q.length < SEARCH_MIN_CHARS) {
//       setSuggestions([]);
//       setLoading(false);
//       setServiceSuggestions([]);
//       setServiceLoading(false);
//       return;
//     }
//     setLoading(true);
//     setServiceLoading(true);
//     const t = setTimeout(() => {
//       apiGetStorefrontVendorProducts(
//         `search=${encodeURIComponent(q)}&limit=${SEARCH_SUGGEST_LIMIT}`,
//       )
//         .then((res) => {
//           setSuggestions(
//             Array.isArray(res.data?.products) ? res.data.products : [],
//           );
//         })
//         .catch(() => setSuggestions([]))
//         .finally(() => setLoading(false));

//       apiGetServiceProducts(
//         `search=${encodeURIComponent(q)}&limit=${SEARCH_SUGGEST_LIMIT}`,
//       )
//         .then((res) => {
//           setServiceSuggestions(
//             Array.isArray(res.data?.products) ? res.data.products : [],
//           );
//         })
//         .catch(() => setServiceSuggestions([]))
//         .finally(() => setServiceLoading(false));
//     }, SEARCH_DEBOUNCE_MS);
//     return () => clearTimeout(t);
//   }, [q, open]);

//   useEffect(() => {
//     if (!open) return;
//     const fn = (e) => {
//       const el = wrapRef.current;
//       if (!el) return;
//       if (!el.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener('mousedown', fn);
//     return () => document.removeEventListener('mousedown', fn);
//   }, [open]);

//   const runProductSearch = (term) => {
//     const t = String(term || '').trim();
//     if (!t) return;
//     writeSearchRecent(t);
//     router.push(`/products?search=${encodeURIComponent(t)}`);
//   };

//   const getProductDetailsHref = (p) => {
//     const isSellProduct = String(p?.type || '').toLowerCase() === 'sell';
//     return isSellProduct
//       ? `/buy-product-details/${p._id}`
//       : `/rent-product-details/${p._id}`;
//   };

//   const openProductDetails = (p) => {
//     if (p?.productName) writeSearchRecent(p.productName);
//     router.push(getProductDetailsHref(p));
//   };

//   // const openServiceDetail = (service) => {
//   //   const id = service?._id || service?.id;
//   //   const name = service?.productName || service?.title || service?.name || '';
//   //   if (name) writeSearchRecent(name);
//   //   if (id) router.push(`/service/${id}`);
//   // };

//   const runServiceSearch = (service) => {
//     const name = service?.productName || service?.title || service?.name || '';
//     if (!name) return;
//     writeSearchRecent(name);
//     router.push(`/products?tab=services&search=${encodeURIComponent(name)}`);
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     runProductSearch(search);
//   };

//   return (
//     // <div className="w-full md:hidden">
//     <div className="w-full md:hidden sticky top-[56px] z-40 bg-white ">
//       <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col items-stretch gap-2">
//         {/* Location Bar — same UI as desktop */}
//         {/* <button
//           type="button"
//           onClick={() => {
//             setOpen(false);
//             if (typeof window !== 'undefined') {
//               window.dispatchEvent(new CustomEvent('rn_open_location_modal'));
//             }
//           }}
//           className="flex items-center gap-2 w-full border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
//         >
//           <MapPin size={15} className="text-gray-400 shrink-0" />
//           <span className="truncate flex-1 text-left">{deliveryLabel}</span>
//           <ChevronDown size={14} className="text-gray-400 shrink-0" />
//         </button> */}

//         {/* Search Bar */}
//         <div ref={wrapRef} className="relative min-w-0 w-full">
//           <form onSubmit={handleSearchSubmit}>
//             <Search
//               size={18}
//               className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//             />
//             <input
//               type="text"
//               placeholder={animatedPlaceholder}
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//               }}
//               onFocus={() => {
//                 setOpen(true);
//                 if (search.trim().length === 0)
//                   setRecentSearches(readSearchRecent());
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === 'Escape') setOpen(false);
//               }}
//               className={`w-full pl-9 pr-8 py-[9px] rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 text-sm transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
//             />
//           </form>

//           {search.length > 0 ? (
//             <button
//               type="button"
//               aria-label="Clear search"
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
//               onMouseDown={(e) => e.preventDefault()}
//               onClick={() => setSearch('')}
//             >
//               <X size={16} />
//             </button>
//           ) : null}

//           {open ? (
//             <div
//               role="listbox"
//               aria-label="Search suggestions"
//               className="absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden"
//             >
//               {showRecentsOnly ? (
//                 <>
//                   <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
//                     Recent
//                   </div>
//                   <ul className="divide-y divide-gray-100">
//                     {recentSearches.slice(0, SEARCH_RECENT_MAX).map((term) => (
//                       <li key={term}>
//                         <button
//                           type="button"
//                           className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
//                           onMouseDown={(e) => e.preventDefault()}
//                           onClick={() => {
//                             setSearch(term);
//                           }}
//                         >
//                           <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 shrink-0">
//                             <History size={16} />
//                           </span>
//                           <span className="text-sm text-gray-900 truncate">
//                             {term}
//                           </span>
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                   {recentSearches.length > 0 ? (
//                     <div className="px-3 py-2 border-t border-gray-100 flex justify-end">
//                       <button
//                         type="button"
//                         className="text-xs font-semibold text-orange-600 hover:text-orange-700"
//                         onMouseDown={(e) => e.preventDefault()}
//                         onClick={() => {
//                           clearSearchRecentStorage();
//                           setRecentSearches([]);
//                         }}
//                       >
//                         Clear all
//                       </button>
//                     </div>
//                   ) : null}
//                 </>
//               ) : showSuggestionsPanel ? (
//                 <>
//                   <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
//                     Suggestions
//                   </div>
//                   {loading ? (
//                     <div className="px-3 py-4 text-sm text-gray-500 text-center">
//                       Searching…
//                     </div>
//                   ) : suggestions.length === 0 ? (
//                     !serviceLoading && serviceSuggestions.length === 0 ? (
//                       <div className="px-3 py-4 text-sm text-gray-500 text-center">
//                         No results found
//                       </div>
//                     ) : null
//                   ) : (
//                     <ul className="divide-y divide-gray-100">
//                       {suggestions.slice(0, SEARCH_SUGGEST_LIMIT).map((p) => (
//                         <li key={p._id}>
//                           <button
//                             type="button"
//                             className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
//                             onMouseDown={(e) => e.preventDefault()}
//                             onClick={() => {
//                               openProductDetails(p);
//                               setOpen(false);
//                             }}
//                           >
//                             <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
//                               <img
//                                 src={
//                                   p.image ||
//                                   'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
//                                 }
//                                 alt=""
//                                 className="h-full w-full object-cover"
//                               />
//                             </span>
//                             <span className="min-w-0 flex-1">
//                               <span className="block text-sm text-gray-900 truncate">
//                                 {p.productName}
//                               </span>
//                               {categoryHintLine(p) ? (
//                                 <span className="block text-xs text-orange-600 truncate">
//                                   {categoryHintLine(p)}
//                                 </span>
//                               ) : null}
//                             </span>
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}

//                   {serviceLoading || serviceSuggestions.length > 0 ? (
//                     <>
//                       <div className="px-3 py-2 border-t border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
//                         Services
//                       </div>
//                       {serviceLoading ? (
//                         <div className="px-3 py-4 text-sm text-gray-500 text-center">
//                           Searching services…
//                         </div>
//                       ) : (
//                         <ul className="divide-y divide-gray-100">
//                           {serviceSuggestions
//                             .slice(0, SEARCH_SUGGEST_LIMIT)
//                             .map((service) => (
//                               <li key={service._id || service.id}>
//                                 <button
//                                   type="button"
//                                   className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
//                                   onMouseDown={(e) => e.preventDefault()}
//                                   onClick={() => {
//                                     runServiceSearch(service);
//                                     setOpen(false);
//                                   }}
//                                 >
//                                   <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
//                                     <img
//                                       src={
//                                         service.image ||
//                                         'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
//                                       }
//                                       alt=""
//                                       className="h-full w-full object-cover"
//                                     />
//                                   </span>
//                                   <span className="min-w-0 flex-1">
//                                     <span className="block text-sm text-gray-900 truncate">
//                                       {service.productName ||
//                                         service.title ||
//                                         service.name}
//                                     </span>
//                                     {categoryHintLine(service) ? (
//                                       <span className="block text-xs text-orange-600 truncate">
//                                         {categoryHintLine(service)}
//                                       </span>
//                                     ) : null}
//                                   </span>
//                                 </button>
//                               </li>
//                             ))}
//                         </ul>
//                       )}
//                     </>
//                   ) : null}
//                 </>
//               ) : null}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NavbarSecondary;

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, History, X } from 'lucide-react';
import {
  apiGetStorefrontVendorProducts,
  apiGetServiceProducts,
} from '@/lib/api';
import { api } from '@/lib/axios';

const DELIVERY_STORAGE_KEY = 'rn_delivery_location';

const SEARCH_DEBOUNCE_MS = 220;
const SEARCH_MIN_CHARS = 1;
const SEARCH_SUGGEST_LIMIT = 10;
const SEARCH_RECENT_KEY = 'rn_product_search_recent';
const SEARCH_RECENT_MAX = 8;

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
const FALLBACK_PLACEHOLDER_WORDS = [
  'AC Service',
  'Vehicle',
  'Electronics',
  'Furniture',
  'Camera',
];

const NavbarSecondary = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [serviceSuggestions, setServiceSuggestions] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const wrapRef = useRef(null);
  const [deliveryLabel, setDeliveryLabel] = useState('Choose you location');
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

  useEffect(() => {
    if (searchPlaceholders.length === 0) return undefined;
    const currentWord =
      searchPlaceholders[placeholderIdx % searchPlaceholders.length] ||
      FALLBACK_PLACEHOLDER_WORDS[0];

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

  const formatLocationLabel = (raw) => {
    const s = String(raw || '').trim();
    if (!s) return 'Choose your location';

    // Keep it UI-friendly: show only the first 2 meaningful comma-separated parts
    // (e.g., "Church Street, Wadi Bunder" or "Kochi, Ernakulam").
    const parts = s
      .split(',')
      .map((x) => String(x).trim())
      .filter(Boolean)
      .filter((x) => !/^\s*india\s*$/i.test(x));

    const first = parts[0] || s;
    const second = parts[1] || '';
    const combined = second ? `${first}, ${second}` : first;

    // Final guardrail against very long strings.
    if (combined.length <= 32) return combined;
    return `${combined.slice(0, 32)}...`;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const readAndSet = () => {
      try {
        const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const label = String(parsed?.label || '').trim();
        if (label) setDeliveryLabel(formatLocationLabel(label));
      } catch {
        /* ignore invalid local storage */
      }
    };

    const onCustomChange = (e) => {
      const label = String(e?.detail?.label || '').trim();
      if (label) setDeliveryLabel(formatLocationLabel(label));
    };

    const onStorage = (e) => {
      if (e.key !== DELIVERY_STORAGE_KEY) return;
      readAndSet();
    };

    readAndSet();
    window.addEventListener('rn_delivery_location_changed', onCustomChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(
        'rn_delivery_location_changed',
        onCustomChange,
      );
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const q = search.trim();
  const matchingRecent = useMemo(() => {
    if (!q.length) return [];
    const lower = q.toLowerCase();
    return readSearchRecent().filter((r) => r.toLowerCase().includes(lower));
  }, [q]);

  const showRecentsOnly = open && q.length === 0 && recentSearches.length > 0;
  const showSuggestionsPanel =
    open &&
    q.length >= SEARCH_MIN_CHARS &&
    (suggestions.length > 0 ||
      loading ||
      serviceSuggestions.length > 0 ||
      serviceLoading);

  useEffect(() => {
    if (!open) return;
    if (q.length !== 0) return;
    setRecentSearches(readSearchRecent());
  }, [open, q.length]);

  useEffect(() => {
    if (!open) return;
    if (q.length < SEARCH_MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      setServiceSuggestions([]);
      setServiceLoading(false);
      return;
    }
    setLoading(true);
    setServiceLoading(true);
    const t = setTimeout(() => {
      apiGetStorefrontVendorProducts(
        `search=${encodeURIComponent(q)}&limit=${SEARCH_SUGGEST_LIMIT}`,
      )
        .then((res) => {
          setSuggestions(
            Array.isArray(res.data?.products) ? res.data.products : [],
          );
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));

      apiGetServiceProducts(
        `search=${encodeURIComponent(q)}&limit=${SEARCH_SUGGEST_LIMIT}`,
      )
        .then((res) => {
          setServiceSuggestions(
            Array.isArray(res.data?.products) ? res.data.products : [],
          );
        })
        .catch(() => setServiceSuggestions([]))
        .finally(() => setServiceLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const runProductSearch = (term) => {
    const t = String(term || '').trim();
    if (!t) return;
    writeSearchRecent(t);
    router.push(`/products?search=${encodeURIComponent(t)}`);
  };

  const getProductDetailsHref = (p) => {
    const isSellProduct = String(p?.type || '').toLowerCase() === 'sell';
    return isSellProduct
      ? `/buy-product-details/${p._id}`
      : `/rent-product-details/${p._id}`;
  };

  const openProductDetails = (p) => {
    if (p?.productName) writeSearchRecent(p.productName);
    router.push(getProductDetailsHref(p));
  };

  // const openServiceDetail = (service) => {
  //   const id = service?._id || service?.id;
  //   const name = service?.productName || service?.title || service?.name || '';
  //   if (name) writeSearchRecent(name);
  //   if (id) router.push(`/service/${id}`);
  // };

  const runServiceSearch = (service) => {
    const name = service?.productName || service?.title || service?.name || '';
    if (!name) return;
    writeSearchRecent(name);
    router.push(`/products?tab=services&search=${encodeURIComponent(name)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runProductSearch(search);
  };

  return (
    // <div className="w-full md:hidden">
    <div className="w-full md:hidden sticky top-[56px] z-40 bg-white ">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pb-1 flex flex-col items-stretch gap-2">
        {/* Location Bar — same UI as desktop */}
        {/* <button
          type="button"
          onClick={() => {
            setOpen(false);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('rn_open_location_modal'));
            }
          }}
          className="flex items-center gap-2 w-full border border-gray-300 bg-white pl-3 pr-3 py-[9px] rounded-lg text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 transition-colors"
        >
          <MapPin size={15} className="text-gray-400 shrink-0" />
          <span className="truncate flex-1 text-left">{deliveryLabel}</span>
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        </button> */}

        {/* Search Bar */}
        <div ref={wrapRef} className="relative min-w-0 w-full">
          {/* <form onSubmit={handleSearchSubmit}>
            <Search
              size={18}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder={animatedPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onFocus={() => {
                setOpen(true);
                if (search.trim().length === 0)
                  setRecentSearches(readSearchRecent());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
              // className={`w-full pl-9 pr-8 py-[9px] rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 text-sm transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
              className={`w-full pl-9 pr-8 py-[9px] rounded-lg border border-gray-300 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 text-sm transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
            />
          </form> */}

          <form onSubmit={handleSearchSubmit}>
            <Search
              size={15}
              className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder={animatedPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onFocus={() => {
                setOpen(true);
                if (search.trim().length === 0)
                  setRecentSearches(readSearchRecent());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
              // className={`w-full pl-9 pr-8 py-[9px] rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 text-sm transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
              className={`w-full pl-7 pr-8 py-[7px] rounded-lg border border-gray-300 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 text-sm transition-opacity duration-300 ${placeholderVisible ? 'placeholder-opacity-100' : 'placeholder-opacity-0'}`}
            />
          </form>

          {search.length > 0 ? (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setSearch('')}
            >
              <X size={16} />
            </button>
          ) : null}

          {open ? (
            <div
              role="listbox"
              aria-label="Search suggestions"
              className="absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden"
            >
              {showRecentsOnly ? (
                <>
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Recent
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {recentSearches.slice(0, SEARCH_RECENT_MAX).map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearch(term);
                          }}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 shrink-0">
                            <History size={16} />
                          </span>
                          <span className="text-sm text-gray-900 truncate">
                            {term}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {recentSearches.length > 0 ? (
                    <div className="px-3 py-2 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          clearSearchRecentStorage();
                          setRecentSearches([]);
                        }}
                      >
                        Clear all
                      </button>
                    </div>
                  ) : null}
                </>
              ) : showSuggestionsPanel ? (
                <>
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Suggestions
                  </div>
                  {loading ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      Searching…
                    </div>
                  ) : suggestions.length === 0 ? (
                    !serviceLoading && serviceSuggestions.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        No results found
                      </div>
                    ) : null
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {suggestions.slice(0, SEARCH_SUGGEST_LIMIT).map((p) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              openProductDetails(p);
                              setOpen(false);
                            }}
                          >
                            <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                              <img
                                src={
                                  p.image ||
                                  'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm text-gray-900 truncate">
                                {p.productName}
                              </span>
                              {categoryHintLine(p) ? (
                                <span className="block text-xs text-orange-600 truncate">
                                  {categoryHintLine(p)}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {serviceLoading || serviceSuggestions.length > 0 ? (
                    <>
                      <div className="px-3 py-2 border-t border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Services
                      </div>
                      {serviceLoading ? (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          Searching services…
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {serviceSuggestions
                            .slice(0, SEARCH_SUGGEST_LIMIT)
                            .map((service) => (
                              <li key={service._id || service.id}>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    runServiceSearch(service);
                                    setOpen(false);
                                  }}
                                >
                                  <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                                    <img
                                      src={
                                        service.image ||
                                        'https://placehold.co/88x88/e5e7eb/6b7280?text=IMG'
                                      }
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm text-gray-900 truncate">
                                      {service.productName ||
                                        service.title ||
                                        service.name}
                                    </span>
                                    {categoryHintLine(service) ? (
                                      <span className="block text-xs text-orange-600 truncate">
                                        {categoryHintLine(service)}
                                      </span>
                                    ) : null}
                                  </span>
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NavbarSecondary;
