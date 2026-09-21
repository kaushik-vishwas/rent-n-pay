// 'use client';

// import React, { useEffect, useState } from 'react';
// import NavbarSecondary from '../components/NavbarSecondary';
// import ServiceBannerSection from '../components/ServicePage/ServiceBannerSection';
// import NeedHelpSection from '../components/ServicePage/NeedHelpSection';
// import PopularServicesSection from '../components/ServicePage/PopularServicesSection';
// import LovedByLocals from '../components/BuyPage/LovedByLocals';
// import SaleBanner from '../components/RentPage/SaleBanner';
// import ComingSoon from '../components/HomePage/ComingSoon';
// import {
//   apiGetServiceProducts,
//   apiGetStorefrontVendorProducts,
// } from '@/lib/api';

// const DELIVERY_STORAGE_KEY = 'rn_delivery_location';
// const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';
// // const AVAILABILITY_CACHE_KEY = 'rn_service_availability_cache';
// const AVAILABILITY_CACHE_KEY = 'rn_global_availability_cache';

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

// function writeAvailabilityCache(label, noServicesNearby) {
//   if (typeof window === 'undefined' || !label) return;
//   try {
//     const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
//     const map = JSON.parse(raw || '{}');
//     map[label] = noServicesNearby;
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

// const ServicePage = () => {
//   const [checkingAvailability, setCheckingAvailability] = useState(true);
//   const [noServicesNearby, setNoServicesNearby] = useState(false);
//   const [currentLocationLabel, setCurrentLocationLabel] = useState('');

//   // Show cached result instantly (before the API call resolves), so
//   // returning users don't see a delay before the Coming Soon banner appears.
//   useEffect(() => {
//     const label = readCurrentLocationLabel();
//     setCurrentLocationLabel(label);
//     const cached = readAvailabilityCache(label);
//     if (cached !== null) {
//       setNoServicesNearby(cached);
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
//         setNoServicesNearby(cached);
//         setCheckingAvailability(false);
//       } else {
//         setCheckingAvailability(true);
//       }
//       Promise.all([
//         apiGetServiceProducts(),
//         apiGetStorefrontVendorProducts('limit=200'),
//       ])
//         .then(([sRes, pRes]) => {
//           if (!mountedFlag) return;
//           const hasServices = (sRes.data?.products || []).length > 0;
//           const hasProducts = (pRes.data?.products || []).length > 0;
//           const isAvailable = hasServices || hasProducts;
//           setNoServicesNearby(!isAvailable);
//           writeAvailabilityCache(label, !isAvailable);
//           if (isAvailable) {
//             resolveNotifiedLocation(label);
//           }
//         })
//         .catch(() => {
//           if (!mountedFlag) return;
//           setNoServicesNearby(false);
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

//   return (
//     <>
//       <NavbarSecondary />
//       {!checkingAvailability && noServicesNearby ? (
//         <ComingSoon locationLabel={currentLocationLabel} />
//       ) : (
//         <>
//           <ServiceBannerSection />
//           <NeedHelpSection />
//           <SaleBanner />
//           <PopularServicesSection />
//           <LovedByLocals />
//         </>
//       )}
//     </>
//   );
// };

// export default ServicePage;

'use client';

import React, { useEffect, useState } from 'react';
import NavbarSecondary from '../components/NavbarSecondary';
import ServiceBannerSection from '../components/ServicePage/ServiceBannerSection';
import NeedHelpSection from '../components/ServicePage/NeedHelpSection';
import PopularServicesSection from '../components/ServicePage/PopularServicesSection';
import LovedByLocals from '../components/BuyPage/LovedByLocals';
import SaleBanner from '../components/RentPage/SaleBanner';
import ComingSoon from '../components/HomePage/ComingSoon';
import {
  apiGetServiceProducts,
  apiGetStorefrontVendorProducts,
} from '@/lib/api';

const DELIVERY_STORAGE_KEY = 'rn_delivery_location';
const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';
// const AVAILABILITY_CACHE_KEY = 'rn_service_availability_cache';
const AVAILABILITY_CACHE_KEY = 'rn_global_availability_cache';

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

function writeAvailabilityCache(label, noServicesNearby) {
  if (typeof window === 'undefined' || !label) return;
  try {
    const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
    const map = JSON.parse(raw || '{}');
    map[label] = noServicesNearby;
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
  } catch {
    /* ignore malformed storage */
  }
}

const ServicePage = () => {
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [noServicesNearby, setNoServicesNearby] = useState(false);
  const [currentLocationLabel, setCurrentLocationLabel] = useState('');

  // Show cached result instantly (before the API call resolves), so
  // returning users don't see a delay before the Coming Soon banner appears.
  useEffect(() => {
    const label = readCurrentLocationLabel();
    setCurrentLocationLabel(label);
    const cached = readAvailabilityCache(label);
    if (cached !== null) {
      setNoServicesNearby(cached);
      setCheckingAvailability(false);
    }
  }, []);

  useEffect(() => {
    let mountedFlag = true;

    const checkAvailability = () => {
      const label = readCurrentLocationLabel();
      setCurrentLocationLabel(label);
      // Only show the loading (null) state if we have no cached value yet
      // for this location — otherwise keep showing the cached result while
      // this call quietly revalidates in the background.
      const cached = readAvailabilityCache(label);
      if (cached !== null) {
        setNoServicesNearby(cached);
        setCheckingAvailability(false);
      } else {
        setCheckingAvailability(true);
      }
      Promise.all([
        apiGetServiceProducts(),
        apiGetStorefrontVendorProducts('limit=200'),
      ])
        .then(([sRes, pRes]) => {
          if (!mountedFlag) return;
          const hasServices = (sRes.data?.products || []).length > 0;
          const hasProducts = (pRes.data?.products || []).length > 0;
          const isAvailable = hasServices || hasProducts;
          setNoServicesNearby(!isAvailable);
          writeAvailabilityCache(label, !isAvailable);
          if (isAvailable) {
            resolveNotifiedLocation(label);
          }
        })
        .catch(() => {
          if (!mountedFlag) return;
          setNoServicesNearby(false);
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

  return (
    <>
      <NavbarSecondary />
      {checkingAvailability ? null : noServicesNearby ? (
        <ComingSoon locationLabel={currentLocationLabel} />
      ) : (
        <>
          <ServiceBannerSection />
          <NeedHelpSection />
          <SaleBanner />
          <PopularServicesSection />
          <LovedByLocals />
        </>
      )}
    </>
  );
};

export default ServicePage;
