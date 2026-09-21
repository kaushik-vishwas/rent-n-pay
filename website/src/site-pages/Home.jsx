// 'use client';

// import { useEffect, useState } from 'react';
// import {
//   useAuthModal,
//   HOME_AUTH_PROMPT_SESSION_KEY,
// } from '@/contexts/AuthModalContext';
// import BotherSection from '../components/HomePage/BotherSection';
// import FeaturedCategories from '../components/HomePage/FeaturedCategories';
// import ShopsAsPerNeeds from '../components/HomePage/ShopsAsPerNeeds';
// import Trending from '../components/HomePage/Trending';
// import UsersReviews from '../components/HomePage/UsersReviews';
// import NavbarSecondary from '../components/NavbarSecondary';
// import HomeMain from '../components/HomePage/HomeMain';
// import HomeAdvertisement from '../components/HomePage/HomeAdvertisement';
// import ComingSoon from '../components/HomePage/ComingSoon';
// import {
//   apiGetStorefrontVendorProducts,
//   apiGetServiceProducts,
// } from '@/lib/api';

// const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';

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
// const LOCAL_NOTIF_STORAGE_KEY = 'rn_local_notifications';
// // const AVAILABILITY_CACHE_KEY = 'rn_home_availability_cache';
// const AVAILABILITY_CACHE_KEY = 'rn_global_availability_cache';

// function readAvailabilityCache(label) {
//   if (typeof window === 'undefined' || !label) return null;
//   try {
//     const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
//     const map = JSON.parse(raw || '{}');
//     return typeof map[label] === 'boolean' ? map[label] : null;
//   } catch {
//     return null;
//   }
// }

// function writeAvailabilityCache(label, noProductsNearby) {
//   if (typeof window === 'undefined' || !label) return;
//   try {
//     const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
//     const map = JSON.parse(raw || '{}');
//     map[label] = noProductsNearby;
//     localStorage.setItem(AVAILABILITY_CACHE_KEY, JSON.stringify(map));
//   } catch {
//     /* ignore */
//   }
// }

// function readCurrentLocationLabel() {
//   if (typeof window === 'undefined') return '';
//   try {
//     const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
//     const parsed = JSON.parse(raw || '{}');
//     return String(parsed?.label || '').trim();
//   } catch {
//     return '';
//   }
// }

// function resolveNotifiedLocation(currentLabel) {
//   if (typeof window === 'undefined' || !currentLabel) return;
//   try {
//     const raw = localStorage.getItem(NOTIFY_LOCATIONS_KEY);
//     const list = Array.isArray(JSON.parse(raw || '[]'))
//       ? JSON.parse(raw || '[]')
//       : [];
//     const match = list.find(
//       (l) => String(l.label || '').toLowerCase() === currentLabel.toLowerCase(),
//     );
//     if (!match) return;

//     const remaining = list.filter(
//       (l) => String(l.label || '').toLowerCase() !== currentLabel.toLowerCase(),
//     );
//     localStorage.setItem(NOTIFY_LOCATIONS_KEY, JSON.stringify(remaining));

//     const notifKey = localNotifStorageKey();
//     const notifRaw = localStorage.getItem(notifKey);
//     const notifList = Array.isArray(JSON.parse(notifRaw || '[]'))
//       ? JSON.parse(notifRaw || '[]')
//       : [];
//     notifList.unshift({
//       id: `location-live-${Date.now()}`,
//       type: 'location-live',
//       title: 'We are now live near you!',
//       detail: `Products and services are now available in ${currentLabel}.`,
//       href: '/products',
//       at: new Date().toISOString(),
//     });
//     localStorage.setItem(notifKey, JSON.stringify(notifList.slice(0, 20)));
//     window.dispatchEvent(new Event('rn_local_notification_added'));
//   } catch {
//     /* ignore malformed storage */
//   }
// }

// const Home = () => {
//   const { openAuth } = useAuthModal();
//   const [mounted, setMounted] = useState(false);
//   const [checkingAvailability, setCheckingAvailability] = useState(true);
//   const [noProductsNearby, setNoProductsNearby] = useState(false);
//   const [currentLocationLabel, setCurrentLocationLabel] = useState('');

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Show cached result instantly (before the API call resolves), so
//   // returning users don't see a delay before the Coming Soon banner appears.
//   useEffect(() => {
//     const label = readCurrentLocationLabel();
//     setCurrentLocationLabel(label);
//     const cached = readAvailabilityCache(label);
//     if (cached !== null) {
//       setNoProductsNearby(cached);
//       setCheckingAvailability(false);
//     }
//   }, []);

//   useEffect(() => {
//     let mountedFlag = true;

//     const checkAvailability = () => {
//       const label = readCurrentLocationLabel();
//       setCurrentLocationLabel(label);
//       // Only show the loading (null) state if we have no cached value yet
//       // for this location — otherwise keep showing the cached result while
//       // this call quietly revalidates in the background.
//       const cached = readAvailabilityCache(label);
//       if (cached !== null) {
//         setNoProductsNearby(cached);
//         setCheckingAvailability(false);
//       } else {
//         setCheckingAvailability(true);
//       }

//       // Promise.all([
//       //   apiGetStorefrontVendorProducts('limit=1'),
//       //   apiGetServiceProducts(),
//       // ])
//       Promise.all([
//         apiGetStorefrontVendorProducts('limit=200'),
//         apiGetServiceProducts(),
//       ])
//         .then(([pRes, sRes]) => {
//           if (!mountedFlag) return;
//           const hasProducts = (pRes.data?.products || []).length > 0;
//           const hasServices = (sRes.data?.products || []).length > 0;
//           const isAvailable = hasProducts || hasServices;
//           setNoProductsNearby(!isAvailable);
//           writeAvailabilityCache(label, !isAvailable);
//           if (isAvailable) {
//             resolveNotifiedLocation(label);
//           }
//         })
//         .catch(() => {
//           if (!mountedFlag) return;
//           // On failure, don't block the normal home page
//           setNoProductsNearby(false);
//         })
//         .finally(() => {
//           if (mountedFlag) setCheckingAvailability(false);
//         });
//     };

//     checkAvailability();

//     const onLocChange = () => checkAvailability();
//     window.addEventListener('rn_delivery_location_changed', onLocChange);
//     const onStorage = (e) => {
//       if (e?.key !== 'rn_delivery_location') return;
//       onLocChange();
//     };
//     window.addEventListener('storage', onStorage);

//     return () => {
//       mountedFlag = false;
//       window.removeEventListener('rn_delivery_location_changed', onLocChange);
//       window.removeEventListener('storage', onStorage);
//     };
//   }, []);

//   // useEffect(() => {
//   //   if (!mounted) return;

//   //   if (localStorage.getItem('userToken')) {
//   //     console.log('[Modal] Skipped — user has token');
//   //     return;
//   //   }

//   //   sessionStorage.removeItem(HOME_AUTH_PROMPT_SESSION_KEY);

//   //   console.log('[Modal] Showing in 500ms...');
//   //   const timer = setTimeout(() => {
//   //     console.log('[Modal] openAuth called');
//   //     openAuth('login');
//   //   }, 500);

//   //   return () => clearTimeout(timer);
//   // }, [mounted, openAuth]);

//   // useEffect(() => {
//   //   if (!mounted) return;

//   //   if (localStorage.getItem('userToken')) {
//   //     console.log('[Modal] Skipped — user has token');
//   //     return;
//   //   }

//   //   sessionStorage.removeItem(HOME_AUTH_PROMPT_SESSION_KEY);

//   //   console.log('[Modal] Showing in 500ms...');
//   //   const timer = setTimeout(() => {
//   //     console.log('[Modal] Opening location modal');
//   //     window.dispatchEvent(new Event('rn_open_location_modal'));
//   //   }, 500);

//   //   return () => clearTimeout(timer);
//   // }, [mounted]);

//   useEffect(() => {
//     if (!mounted) return;

//     if (localStorage.getItem('userToken')) {
//       console.log('[Modal] Skipped — user has token');
//       return;
//     }

//     if (sessionStorage.getItem(HOME_AUTH_PROMPT_SESSION_KEY)) {
//       console.log('[Modal] Skipped — already shown this session');
//       return;
//     }

//     console.log('[Modal] Showing in 500ms...');
//     const timer = setTimeout(() => {
//       console.log('[Modal] Opening location modal');
//       sessionStorage.setItem(HOME_AUTH_PROMPT_SESSION_KEY, '1');
//       window.dispatchEvent(new Event('rn_open_location_modal'));
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [mounted]);

//   return (
//     <>
//       {/* <NavbarSecondary />
//       {!checkingAvailability && noProductsNearby ? (
//         <ComingSoon locationLabel={currentLocationLabel} />
//       ) : null}
//       <HomeMain />
//       <FeaturedCategories />
//       <BotherSection />
//       <ShopsAsPerNeeds />

//       {!(!checkingAvailability && noProductsNearby) ? <Trending /> : null}
//       <HomeAdvertisement />
//       <UsersReviews /> */}
//       <NavbarSecondary />
//       {checkingAvailability ? null : noProductsNearby ? (
//         <ComingSoon locationLabel={currentLocationLabel} />
//       ) : (
//         <>
//           <HomeMain />
//           <FeaturedCategories />
//           <BotherSection />
//           <ShopsAsPerNeeds />
//           <Trending />
//           <HomeAdvertisement />
//           <UsersReviews />
//         </>
//       )}
//     </>
//   );
// };

// export default Home;

'use client';

import { useEffect, useState } from 'react';
import {
  useAuthModal,
  HOME_AUTH_PROMPT_SESSION_KEY,
} from '@/contexts/AuthModalContext';
import BotherSection from '../components/HomePage/BotherSection';
import FeaturedCategories from '../components/HomePage/FeaturedCategories';
import ShopsAsPerNeeds from '../components/HomePage/ShopsAsPerNeeds';
import Trending from '../components/HomePage/Trending';
import UsersReviews from '../components/HomePage/UsersReviews';
import NavbarSecondary from '../components/NavbarSecondary';
import HomeMain from '../components/HomePage/HomeMain';
import HomeAdvertisement from '../components/HomePage/HomeAdvertisement';
import ComingSoon from '../components/HomePage/ComingSoon';
import {
  apiGetStorefrontVendorProducts,
  apiGetServiceProducts,
} from '@/lib/api';

const DELIVERY_STORAGE_KEY = 'rn_delivery_location';
const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';

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
const LOCAL_NOTIF_STORAGE_KEY = 'rn_local_notifications';
// const AVAILABILITY_CACHE_KEY = 'rn_home_availability_cache';
const AVAILABILITY_CACHE_KEY = 'rn_global_availability_cache';

function readAvailabilityCache(label) {
  if (typeof window === 'undefined' || !label) return null;
  try {
    const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
    const map = JSON.parse(raw || '{}');
    return typeof map[label] === 'boolean' ? map[label] : null;
  } catch {
    return null;
  }
}

function writeAvailabilityCache(label, noProductsNearby) {
  if (typeof window === 'undefined' || !label) return;
  try {
    const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
    const map = JSON.parse(raw || '{}');
    map[label] = noProductsNearby;
    localStorage.setItem(AVAILABILITY_CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function readCurrentLocationLabel() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
    const parsed = JSON.parse(raw || '{}');
    return String(parsed?.label || '').trim();
  } catch {
    return '';
  }
}

function resolveNotifiedLocation(currentLabel) {
  if (typeof window === 'undefined' || !currentLabel) return;
  try {
    const raw = localStorage.getItem(NOTIFY_LOCATIONS_KEY);
    const list = Array.isArray(JSON.parse(raw || '[]'))
      ? JSON.parse(raw || '[]')
      : [];
    const match = list.find(
      (l) => String(l.label || '').toLowerCase() === currentLabel.toLowerCase(),
    );
    if (!match) return;

    const remaining = list.filter(
      (l) => String(l.label || '').toLowerCase() !== currentLabel.toLowerCase(),
    );
    localStorage.setItem(NOTIFY_LOCATIONS_KEY, JSON.stringify(remaining));

    const notifKey = localNotifStorageKey();
    const notifRaw = localStorage.getItem(notifKey);
    const notifList = Array.isArray(JSON.parse(notifRaw || '[]'))
      ? JSON.parse(notifRaw || '[]')
      : [];
    notifList.unshift({
      id: `location-live-${Date.now()}`,
      type: 'location-live',
      title: 'We are now live near you!',
      detail: `Products and services are now available in ${currentLabel}.`,
      href: '/products',
      at: new Date().toISOString(),
    });
    localStorage.setItem(notifKey, JSON.stringify(notifList.slice(0, 20)));
    window.dispatchEvent(new Event('rn_local_notification_added'));
  } catch {}
}

const Home = () => {
  const { openAuth } = useAuthModal();
  const [mounted, setMounted] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [noProductsNearby, setNoProductsNearby] = useState(false);
  const [currentLocationLabel, setCurrentLocationLabel] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const label = readCurrentLocationLabel();
    setCurrentLocationLabel(label);
    const cached = readAvailabilityCache(label);
    if (cached !== null) {
      setNoProductsNearby(cached);
      setCheckingAvailability(false);
    }
  }, []);

  useEffect(() => {
    let mountedFlag = true;

    const checkAvailability = () => {
      const label = readCurrentLocationLabel();
      setCurrentLocationLabel(label);

      const cached = readAvailabilityCache(label);
      if (cached !== null) {
        setNoProductsNearby(cached);
        setCheckingAvailability(false);
      } else {
        setCheckingAvailability(true);
      }

      Promise.all([
        apiGetStorefrontVendorProducts('limit=200'),
        apiGetServiceProducts(),
      ])
        .then(([pRes, sRes]) => {
          if (!mountedFlag) return;
          const hasProducts = (pRes.data?.products || []).length > 0;
          const hasServices = (sRes.data?.products || []).length > 0;
          const isAvailable = hasProducts || hasServices;
          setNoProductsNearby(!isAvailable);
          writeAvailabilityCache(label, !isAvailable);
          if (isAvailable) {
            resolveNotifiedLocation(label);
          }
        })
        .catch(() => {
          if (!mountedFlag) return;
          // On failure, don't block the normal home page
          setNoProductsNearby(false);
        })
        .finally(() => {
          if (mountedFlag) setCheckingAvailability(false);
        });
    };

    checkAvailability();

    const onLocChange = () => checkAvailability();
    window.addEventListener('rn_delivery_location_changed', onLocChange);
    const onStorage = (e) => {
      if (e?.key !== 'rn_delivery_location') return;
      onLocChange();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mountedFlag = false;
      window.removeEventListener('rn_delivery_location_changed', onLocChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (localStorage.getItem('userToken')) {
      console.log('[Modal] Skipped — user has token');
      return;
    }

    if (sessionStorage.getItem(HOME_AUTH_PROMPT_SESSION_KEY)) {
      console.log('[Modal] Skipped — already shown this session');
      return;
    }

    try {
      const raw = localStorage.getItem('rn_delivery_location');
      const parsed = raw ? JSON.parse(raw) : null;
      const hasValidLocation =
        parsed &&
        typeof parsed.label === 'string' &&
        Number.isFinite(Number(parsed.lat)) &&
        Number.isFinite(Number(parsed.lon));
      if (hasValidLocation) {
        console.log('[Modal] Skipped — location already saved');
        return;
      }
    } catch {}

    console.log('[Modal] Showing in 500ms...');
    const timer = setTimeout(() => {
      console.log('[Modal] Opening location modal');
      sessionStorage.setItem(HOME_AUTH_PROMPT_SESSION_KEY, '1');
      window.dispatchEvent(new Event('rn_open_location_modal'));
    }, 500);

    return () => clearTimeout(timer);
  }, [mounted]);
  return (
    <>
      <NavbarSecondary />
      {!checkingAvailability && noProductsNearby ? (
        <ComingSoon locationLabel={currentLocationLabel} />
      ) : (
        <>
          <HomeMain />
          <FeaturedCategories />
          <BotherSection />
          <ShopsAsPerNeeds />
          <Trending />
          <HomeAdvertisement />
          <UsersReviews />
        </>
      )}
    </>
  );
};

export default Home;
