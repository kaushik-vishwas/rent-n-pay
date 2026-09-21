// 'use client';
// import { useEffect, useState } from 'react';
// import NavbarSecondary from '../components/NavbarSecondary';
// import RentalCategories from '../components/RentPage/RentalCategories';
// import RentMain from '../components/RentPage/RentMain';
// // import SaleBanner from '../components/RentPage/SaleBanner';
// import Trending from '../components/HomePage/Trending';
// import ShopsAsPerNeeds from '../components/HomePage/ShopsAsPerNeeds';
// import WorkFlow from '../components/RentPage/WorkFlow';
// import Discount from '../components/RentPage/Discount';
// import LovedByLocals from '../components/BuyPage/LovedByLocals';
// import HomeAdvertisement from '../components/HomePage/HomeAdvertisement';
// import ComingSoon from '../components/HomePage/ComingSoon';
// import {
//   apiGetStorefrontVendorProducts,
//   apiGetServiceProducts,
// } from '@/lib/api';

// const DELIVERY_STORAGE_KEY = 'rn_delivery_location';
// const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';
// // const AVAILABILITY_CACHE_KEY = 'rn_rent_availability_cache';
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

// function writeAvailabilityCache(label, noRentalsNearby) {
//   if (typeof window === 'undefined' || !label) return;
//   try {
//     const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
//     const map = JSON.parse(raw || '{}');
//     map[label] = noRentalsNearby;
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
//   const [checkingAvailability, setCheckingAvailability] = useState(true);
//   const [noRentalsNearby, setNoRentalsNearby] = useState(false);
//   const [currentLocationLabel, setCurrentLocationLabel] = useState('');

//   // Show cached result instantly (before the API call resolves), so
//   // returning users don't see a delay before the Coming Soon banner appears.
//   useEffect(() => {
//     const label = readCurrentLocationLabel();
//     setCurrentLocationLabel(label);
//     const cached = readAvailabilityCache(label);
//     if (cached !== null) {
//       setNoRentalsNearby(cached);
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
//         setNoRentalsNearby(cached);
//         setCheckingAvailability(false);
//       } else {
//         setCheckingAvailability(true);
//       }

//       // apiGetStorefrontVendorProducts('limit=200')
//       //   .then((res) => {
//       //     if (!mountedFlag) return;
//       //     const products = res.data?.products || [];
//       //     const hasRentals = products.some(
//       //       (p) => String(p.type || '') === 'Rental',
//       //     );
//       //     setNoRentalsNearby(!hasRentals);
//       //     writeAvailabilityCache(label, !hasRentals);
//       //     if (hasRentals) {
//       //       resolveNotifiedLocation(label);
//       //     }
//       //   })
//       //   .catch(() => {
//       //     if (!mountedFlag) return;
//       //     setNoRentalsNearby(false);
//       //   })
//       //   .finally(() => {
//       //     if (mountedFlag) setCheckingAvailability(false);
//       //   });
//       Promise.all([
//         apiGetStorefrontVendorProducts('limit=200'),
//         apiGetServiceProducts(),
//       ])
//         .then(([pRes, sRes]) => {
//           if (!mountedFlag) return;
//           const hasProducts = (pRes.data?.products || []).length > 0;
//           const hasServices = (sRes.data?.products || []).length > 0;
//           const isAvailable = hasProducts || hasServices;
//           setNoRentalsNearby(!isAvailable);
//           writeAvailabilityCache(label, !isAvailable);
//           if (isAvailable) {
//             resolveNotifiedLocation(label);
//           }
//         })
//         .catch(() => {
//           if (!mountedFlag) return;
//           setNoRentalsNearby(false);
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
//       {/* <NavbarSecondary />
//       {!checkingAvailability && noRentalsNearby ? (
//         <ComingSoon locationLabel={currentLocationLabel} />
//       ) : null}
//       <RentMain />
//       <RentalCategories />

//       <HomeAdvertisement />
//       <ShopsAsPerNeeds />

//       {!(!checkingAvailability && noRentalsNearby) ? <Trending /> : null}
//       <WorkFlow />
//       <Discount />
//       <LovedByLocals /> */}
//       <NavbarSecondary />
//       {!checkingAvailability && noRentalsNearby ? (
//         <ComingSoon locationLabel={currentLocationLabel} />
//       ) : (
//         <>
//           <RentMain />
//           <RentalCategories />
//           <HomeAdvertisement />
//           <ShopsAsPerNeeds />
//           <Trending />
//           <WorkFlow />
//           <Discount />
//           <LovedByLocals />
//         </>
//       )}
//     </>
//   );
// };

// export default Home;

'use client';
import { useEffect, useState } from 'react';
import NavbarSecondary from '../components/NavbarSecondary';
import RentalCategories from '../components/RentPage/RentalCategories';
import RentMain from '../components/RentPage/RentMain';
// import SaleBanner from '../components/RentPage/SaleBanner';
import Trending from '../components/HomePage/Trending';
import ShopsAsPerNeeds from '../components/HomePage/ShopsAsPerNeeds';
import WorkFlow from '../components/RentPage/WorkFlow';
import Discount from '../components/RentPage/Discount';
import LovedByLocals from '../components/BuyPage/LovedByLocals';
import HomeAdvertisement from '../components/HomePage/HomeAdvertisement';
import ComingSoon from '../components/HomePage/ComingSoon';
import {
  apiGetStorefrontVendorProducts,
  apiGetServiceProducts,
} from '@/lib/api';

const DELIVERY_STORAGE_KEY = 'rn_delivery_location';
const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';
// const AVAILABILITY_CACHE_KEY = 'rn_rent_availability_cache';
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

function writeAvailabilityCache(label, noRentalsNearby) {
  if (typeof window === 'undefined' || !label) return;
  try {
    const raw = localStorage.getItem(AVAILABILITY_CACHE_KEY);
    const map = JSON.parse(raw || '{}');
    map[label] = noRentalsNearby;
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

const Home = () => {
  // Initial state must match on server AND client (no localStorage reads
  // in the initializer) to avoid hydration mismatches. We resolve the
  // real cached value in a layout-safe useEffect below, which still runs
  // before paint on the client so there's no visible white flash.
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [noRentalsNearby, setNoRentalsNearby] = useState(false);
  const [currentLocationLabel, setCurrentLocationLabel] = useState('');

  // Resolve cached availability as early as possible on the client only.
  useEffect(() => {
    const label = readCurrentLocationLabel();
    setCurrentLocationLabel(label);
    const cached = readAvailabilityCache(label);
    if (cached !== null) {
      setNoRentalsNearby(cached);
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
        setNoRentalsNearby(cached);
        setCheckingAvailability(false);
      } else {
        setCheckingAvailability(true);
      }

      // apiGetStorefrontVendorProducts('limit=200')
      //   .then((res) => {
      //     if (!mountedFlag) return;
      //     const products = res.data?.products || [];
      //     const hasRentals = products.some(
      //       (p) => String(p.type || '') === 'Rental',
      //     );
      //     setNoRentalsNearby(!hasRentals);
      //     writeAvailabilityCache(label, !hasRentals);
      //     if (hasRentals) {
      //       resolveNotifiedLocation(label);
      //     }
      //   })
      //   .catch(() => {
      //     if (!mountedFlag) return;
      //     setNoRentalsNearby(false);
      //   })
      //   .finally(() => {
      //     if (mountedFlag) setCheckingAvailability(false);
      //   });
      Promise.all([
        apiGetStorefrontVendorProducts('limit=200'),
        apiGetServiceProducts(),
      ])
        .then(([pRes, sRes]) => {
          if (!mountedFlag) return;
          const hasProducts = (pRes.data?.products || []).length > 0;
          const hasServices = (sRes.data?.products || []).length > 0;
          const isAvailable = hasProducts || hasServices;
          setNoRentalsNearby(!isAvailable);
          writeAvailabilityCache(label, !isAvailable);
          if (isAvailable) {
            resolveNotifiedLocation(label);
          }
        })
        .catch(() => {
          if (!mountedFlag) return;
          setNoRentalsNearby(false);
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
      {/* <NavbarSecondary />
      {!checkingAvailability && noRentalsNearby ? (
        <ComingSoon locationLabel={currentLocationLabel} />
      ) : null}
      <RentMain />
      <RentalCategories />

      <HomeAdvertisement />
      <ShopsAsPerNeeds />

      {!(!checkingAvailability && noRentalsNearby) ? <Trending /> : null}
      <WorkFlow />
      <Discount />
      <LovedByLocals /> */}
      <NavbarSecondary />
      {checkingAvailability ? null : noRentalsNearby ? (
        <ComingSoon locationLabel={currentLocationLabel} />
      ) : (
        <>
          <RentMain />
          <RentalCategories />
          <HomeAdvertisement />
          <ShopsAsPerNeeds />
          <Trending />
          <WorkFlow />
          <Discount />
          <LovedByLocals />
        </>
      )}
    </>
  );
};

export default Home;
