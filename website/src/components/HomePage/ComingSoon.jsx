// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useAuthModal } from '@/contexts/AuthModalContext';
// import { Bell, BellRing } from 'lucide-react';
// const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';

// function readNotifyLocations() {
//   if (typeof window === 'undefined') return [];
//   try {
//     const raw = localStorage.getItem(NOTIFY_LOCATIONS_KEY);
//     const arr = JSON.parse(raw || '[]');
//     return Array.isArray(arr) ? arr : [];
//   } catch {
//     return [];
//   }
// }

// function writeNotifyLocations(list) {
//   if (typeof window === 'undefined') return;
//   localStorage.setItem(NOTIFY_LOCATIONS_KEY, JSON.stringify(list));
// }

// const ComingSoon = ({ locationLabel }) => {
//   const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
//   const { openAuth } = useAuthModal();
//   const [requested, setRequested] = useState(false);

//   useEffect(() => {
//     const list = readNotifyLocations();
//     setRequested(
//       list.some(
//         (l) =>
//           String(l.label || '').toLowerCase() ===
//           String(locationLabel || '').toLowerCase(),
//       ),
//     );
//   }, [locationLabel]);

//   const handleNotifyMe = () => {
//     if (!isAuthenticated) {
//       openAuth('login');
//       return;
//     }
//     if (requested || !locationLabel) return;

//     const list = readNotifyLocations();
//     const next = [
//       ...list.filter(
//         (l) =>
//           String(l.label || '').toLowerCase() !==
//           String(locationLabel || '').toLowerCase(),
//       ),
//       { label: locationLabel, at: new Date().toISOString() },
//     ];
//     writeNotifyLocations(next);
//     setRequested(true);
//   };

//   const handleChangeLocation = () => {
//     if (typeof window === 'undefined') return;
//     window.dispatchEvent(new CustomEvent('rn_open_location_modal'));
//   };
//   return (
//     <section className="w-full flex-1 flex items-center justify-center py-8 sm:py-24 px-4 relative overflow-hidden bg-white">
//       {/* Dotted pattern - left */}
//       <div
//         className="block absolute left-0 top-0 h-full w-10 sm:w-24 md:w-32 lg:w-40 pointer-events-none"
//         style={{
//           backgroundImage:
//             'radial-gradient(circle, #F97316 1.5px, transparent 1.5px)',
//           backgroundSize: '14px 14px',
//           maskImage:
//             'radial-gradient(ellipse 100% 80% at 0% 50%, black 40%, transparent 90%)',
//           WebkitMaskImage:
//             'radial-gradient(ellipse 100% 80% at 0% 50%, black 40%, transparent 90%)',
//         }}
//       />
//       {/* Dotted pattern - right */}
//       <div
//         className="block absolute right-0 top-0 h-full w-10 sm:w-24 md:w-32 lg:w-40 pointer-events-none"
//         style={{
//           backgroundImage:
//             'radial-gradient(circle, #F97316 1.5px, transparent 1.5px)',
//           backgroundSize: '14px 14px',
//           maskImage:
//             'radial-gradient(ellipse 100% 80% at 100% 50%, black 40%, transparent 90%)',
//           WebkitMaskImage:
//             'radial-gradient(ellipse 100% 80% at 100% 50%, black 40%, transparent 90%)',
//         }}
//       />

//       <div className="max-w-xl w-full text-center relative z-10">
//         <h1 className="text-xl sm:text-5xl font-extrabold text-gray-300 mb-2 sm:mb-4 leading-tight">
//           WE ARE <br />
//           COMING <span className="text-[#F97316] font-extrabold"> SOON</span>
//         </h1>
//         <p className="text-xs sm:text-lg font-medium text-gray-500 max-w-md mx-auto">
//           We&apos;re currently live in select areas and
//           <br className="block " /> expanding quickly. Get notified when we are
//           <br className="block " />
//           near you!
//         </p>

//         <button
//           type="button"
//           onClick={handleNotifyMe}
//           disabled={requested}
//           className={`mt-3 sm:mt-6 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-base font-bold transition shadow-lg shadow-orange-200 ${
//             requested
//               ? 'bg-[#F97316] text-white hover:bg-orange-600'
//               : 'bg-[#F97316] text-white hover:bg-orange-600'
//           }`}
//         >
//           {requested ? (
//             <BellRing size={14} className="sm:hidden" />
//           ) : (
//             <Bell size={14} className="sm:hidden" />
//           )}
//           {requested ? (
//             <BellRing size={20} className="hidden sm:block" />
//           ) : (
//             <Bell size={20} className="hidden sm:block" />
//           )}
//           {requested ? "You're on the list" : 'Notify me!'}
//         </button>

//         <p className="mt-4 text-xs sm:text-sm text-gray-500">
//           <button
//             type="button"
//             onClick={handleChangeLocation}
//             className="font-semibold text-[#F97316] underline underline-offset-2 hover:text-orange-600"
//           >
//             Change location
//           </button>
//         </p>
//       </div>
//     </section>
//   );
// };

// export default ComingSoon

'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Bell, BellRing } from 'lucide-react';
import ComingSoonImage from '@/assets/images/coming-soon.png';
const NOTIFY_LOCATIONS_KEY = 'rn_notify_me_locations';

function readNotifyLocations() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFY_LOCATIONS_KEY);
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeNotifyLocations(list) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFY_LOCATIONS_KEY, JSON.stringify(list));
}

const ComingSoon = ({ locationLabel }) => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const { openAuth } = useAuthModal();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const list = readNotifyLocations();
    setRequested(
      list.some(
        (l) =>
          String(l.label || '').toLowerCase() ===
          String(locationLabel || '').toLowerCase(),
      ),
    );
  }, [locationLabel]);

  const handleNotifyMe = () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    if (requested || !locationLabel) return;

    const list = readNotifyLocations();
    const next = [
      ...list.filter(
        (l) =>
          String(l.label || '').toLowerCase() !==
          String(locationLabel || '').toLowerCase(),
      ),
      { label: locationLabel, at: new Date().toISOString() },
    ];
    writeNotifyLocations(next);
    setRequested(true);
  };

  const handleChangeLocation = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('rn_open_location_modal'));
  };
  return (
    <>
      <section className="w-full flex-1 flex flex-col items-center justify-center py-8 sm:py-24 px-4 relative overflow-hidden bg-gray-50">
        {/* Dotted pattern - left hfhf*/}
        <div
          className="block absolute left-0 top-0 h-full w-10 sm:w-24 md:w-32 lg:w-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #F97316 1.5px, transparent 1.5px)',
            backgroundSize: '14px 14px',
            maskImage:
              'radial-gradient(ellipse 100% 80% at 0% 50%, black 40%, transparent 90%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 100% 80% at 0% 50%, black 40%, transparent 90%)',
          }}
        />
        {/* Dotted pattern - right */}
        <div
          className="block absolute right-0 top-0 h-full w-10 sm:w-24 md:w-32 lg:w-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #F97316 1.5px, transparent 1.5px)',
            backgroundSize: '14px 14px',
            maskImage:
              'radial-gradient(ellipse 100% 80% at 100% 50%, black 40%, transparent 90%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 100% 80% at 100% 50%, black 40%, transparent 90%)',
          }}
        />
        <div className="max-w-xl w-full text-center relative z-10">
          <h1 className="text-xl sm:text-5xl font-extrabold text-gray-300 mb-2 sm:mb-4 leading-tight">
            WE ARE <br />
            COMING <span className="text-[#F97316] font-extrabold"> SOON</span>
          </h1>
          <p className="text-xs sm:text-lg font-medium text-gray-500 max-w-md mx-auto">
            We&apos;re currently live in select areas and
            <br className="block " /> expanding quickly. Get notified when we
            are
            <br className="block " />
            near you!
          </p>

          <button
            type="button"
            onClick={handleNotifyMe}
            disabled={requested}
            className={`mt-3 sm:mt-6 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-base font-bold transition shadow-lg shadow-orange-200 ${
              requested
                ? 'bg-[#F97316] text-white hover:bg-orange-600'
                : 'bg-[#F97316] text-white hover:bg-orange-600'
            }`}
          >
            {requested ? (
              <BellRing size={14} className="sm:hidden" />
            ) : (
              <Bell size={14} className="sm:hidden" />
            )}
            {requested ? (
              <BellRing size={20} className="hidden sm:block" />
            ) : (
              <Bell size={20} className="hidden sm:block" />
            )}
            {requested ? "You're on the list" : 'Notify me!'}
          </button>

          <p className="mt-4 text-xs sm:text-sm text-gray-500">
            <button
              type="button"
              onClick={handleChangeLocation}
              className="font-semibold text-[#F97316] underline underline-offset-2 hover:text-orange-600"
            >
              Change location
            </button>
          </p>
        </div>
      </section>

      <div className="w-full bg-white -mt-1">
        <img
          src={ComingSoonImage.src}
          alt="Coming Soon"
          className="w-full h-auto block"
        />
      </div>
    </>
  );
};

export default ComingSoon;
