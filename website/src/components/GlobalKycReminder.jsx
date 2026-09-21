// 'use client';

// import { useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import { apiGetMyUserKyc } from '@/lib/api';

// const SESSION_KEY = 'rentpay_kyc_reminder_shown';
// const MAX_REMINDERS = 3;
// const INTERVAL_MS = 60000;
// // const INTERVAL_MS = 120000;

// // Dispatch this event (e.g. window.dispatchEvent(new Event(KYC_REMINDER_NEW_ORDER_EVENT)))
// // right after an order is successfully placed, to give the user a fresh
// // set of 3 reminders for that new order — even if they already used up
// // their 3 reminders for a previous order earlier in this same tab.
// export const KYC_REMINDER_NEW_ORDER_EVENT = 'rn_kyc_reminder_new_order';

// export default function GlobalKycReminder() {
//   const router = useRouter();
//   const timerRef = useRef(null);
//   const countRef = useRef(0);
//   useEffect(() => {
//     let cancelled = false;

//     const stopTimer = () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };

//     const checkAndMaybeRemind = async () => {
//       console.log(
//         '[KycReminder] Interval fired at',
//         new Date().toLocaleTimeString(),
//         '| countRef:',
//         countRef.current,
//       );
//       try {
//         const res = await apiGetMyUserKyc();
//         const status = String(res.data?.kyc?.status || 'not_submitted');
//         console.log('[KycReminder] KYC check ran, status:', status);
//         if (cancelled) return;

//         if (status === 'approved') {
//           console.log('[KycReminder] STOPPING — status is approved');
//           sessionStorage.setItem(SESSION_KEY, 'done');
//           stopTimer();
//           return;
//         }

//         if (countRef.current >= MAX_REMINDERS) {
//           console.log(
//             '[KycReminder] STOPPING — countRef already at/above MAX_REMINDERS:',
//             countRef.current,
//           );
//           sessionStorage.setItem(SESSION_KEY, 'done');
//           stopTimer();
//           return;
//         }

//         console.log(
//           '[KycReminder] Showing toast now, count before increment:',
//           countRef.current,
//         );
//         toast.error('Kindly complete your KYC for seamless delivery.', {
//           position: 'top-right',
//           autoClose: 2500,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: 'colored',
//           onClick: () => router.push('/my-account?tab=profile'),
//           style: { cursor: 'pointer' },
//         });
//         countRef.current += 1;
//         console.log('[KycReminder] count after increment:', countRef.current);

//         if (countRef.current >= MAX_REMINDERS) {
//           console.log(
//             '[KycReminder] STOPPING — hit MAX_REMINDERS after this toast',
//           );
//           sessionStorage.setItem(SESSION_KEY, 'done');
//           stopTimer();
//         }
//       } catch (err) {
//         console.error('[KycReminder] KYC check failed:', err);
//       }
//     };

//     const startCycle = ({ isRestart } = {}) => {
//       const token =
//         typeof window !== 'undefined'
//           ? localStorage.getItem('userToken')
//           : null;
//       console.log(
//         '[KycReminder] startCycle called, isRestart:',
//         Boolean(isRestart),
//         '| token present:',
//         Boolean(token),
//       );
//       if (!token) {
//         console.log('[KycReminder] EXITING — no token found');
//         return;
//       }

//       if (isRestart) {
//         // A new order was just placed — give the user a fresh set of
//         // reminders even if a previous order already used up all 3.
//         sessionStorage.removeItem(SESSION_KEY);
//         countRef.current = 0;
//       } else {
//         const alreadyDone = sessionStorage.getItem(SESSION_KEY) === 'done';
//         console.log(
//           '[KycReminder] sessionStorage flag:',
//           sessionStorage.getItem(SESSION_KEY),
//           '| alreadyDone:',
//           alreadyDone,
//         );
//         if (alreadyDone) {
//           console.log('[KycReminder] EXITING — already done this session');
//           return;
//         }
//       }

//       stopTimer();
//       console.log(
//         '[KycReminder] Setting up interval now, INTERVAL_MS =',
//         INTERVAL_MS,
//       );
//       timerRef.current = setInterval(checkAndMaybeRemind, INTERVAL_MS);
//     };

//     // Initial mount — normal 3-reminders-per-session behavior.
//     startCycle();

//     // New order placed — reset and start a fresh set of 3 reminders.
//     const onNewOrder = () => startCycle({ isRestart: true });
//     window.addEventListener(KYC_REMINDER_NEW_ORDER_EVENT, onNewOrder);

//     return () => {
//       console.log(
//         '[KycReminder] CLEANUP — effect unmounting, clearing interval',
//       );
//       cancelled = true;
//       stopTimer();
//       window.removeEventListener(KYC_REMINDER_NEW_ORDER_EVENT, onNewOrder);
//     };
//   }, []);

//   return null;
// }

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { apiGetMyUserKyc, apiGetMyOrders } from '@/lib/api';

const SESSION_KEY = 'rentpay_kyc_reminder_shown';
const MAX_REMINDERS = 3;
const INTERVAL_MS = 60000;
// const INTERVAL_MS = 120000;

// Dispatch this event (e.g. window.dispatchEvent(new Event(KYC_REMINDER_NEW_ORDER_EVENT)))
// right after an order is successfully placed, to give the user a fresh
// set of 3 reminders for that new order — even if they already used up
// their 3 reminders for a previous order earlier in this same tab.
export const KYC_REMINDER_NEW_ORDER_EVENT = 'rn_kyc_reminder_new_order';

export default function GlobalKycReminder() {
  const router = useRouter();
  const timerRef = useRef(null);
  const countRef = useRef(0);
  useEffect(() => {
    let cancelled = false;

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const checkAndMaybeRemind = async () => {
      console.log(
        '[KycReminder] Interval fired at',
        new Date().toLocaleTimeString(),
        '| countRef:',
        countRef.current,
      );
      try {
        const res = await apiGetMyUserKyc();
        const status = String(res.data?.kyc?.status || 'not_submitted');
        console.log('[KycReminder] KYC check ran, status:', status);
        if (cancelled) return;

        if (status === 'approved') {
          console.log('[KycReminder] STOPPING — status is approved');
          sessionStorage.setItem(SESSION_KEY, 'done');
          stopTimer();
          return;
        }

        if (countRef.current >= MAX_REMINDERS) {
          console.log(
            '[KycReminder] STOPPING — countRef already at/above MAX_REMINDERS:',
            countRef.current,
          );
          sessionStorage.setItem(SESSION_KEY, 'done');
          stopTimer();
          return;
        }

        console.log(
          '[KycReminder] Showing toast now, count before increment:',
          countRef.current,
        );
        toast.error('Kindly complete your KYC for seamless delivery.', {
          position: 'top-right',
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
          onClick: () => router.push('/my-account?tab=profile'),
          style: { cursor: 'pointer' },
        });
        countRef.current += 1;
        console.log('[KycReminder] count after increment:', countRef.current);

        if (countRef.current >= MAX_REMINDERS) {
          console.log(
            '[KycReminder] STOPPING — hit MAX_REMINDERS after this toast',
          );
          sessionStorage.setItem(SESSION_KEY, 'done');
          stopTimer();
        }
      } catch (err) {
        console.error('[KycReminder] KYC check failed:', err);
      }
    };

    const hasAtLeastOneOrder = async () => {
      try {
        const res = await apiGetMyOrders();
        const orders = res?.data?.orders || res?.data || [];
        return Array.isArray(orders) && orders.length > 0;
      } catch (err) {
        console.error('[KycReminder] Order check failed:', err);
        // Fail safe: if we can't confirm an order exists, don't nag the user.
        return false;
      }
    };

    const startCycle = async ({ isRestart } = {}) => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('userToken')
          : null;
      console.log(
        '[KycReminder] startCycle called, isRestart:',
        Boolean(isRestart),
        '| token present:',
        Boolean(token),
      );
      if (!token) {
        console.log('[KycReminder] EXITING — no token found');
        return;
      }

      const hasOrder = await hasAtLeastOneOrder();
      if (cancelled) return;
      if (!hasOrder) {
        console.log('[KycReminder] EXITING — user has no orders yet');
        return;
      }

      if (isRestart) {
        // A new order was just placed — give the user a fresh set of
        // reminders even if a previous order already used up all 3.
        sessionStorage.removeItem(SESSION_KEY);
        countRef.current = 0;
      } else {
        const alreadyDone = sessionStorage.getItem(SESSION_KEY) === 'done';
        console.log(
          '[KycReminder] sessionStorage flag:',
          sessionStorage.getItem(SESSION_KEY),
          '| alreadyDone:',
          alreadyDone,
        );
        if (alreadyDone) {
          console.log('[KycReminder] EXITING — already done this session');
          return;
        }
      }

      stopTimer();
      console.log(
        '[KycReminder] Setting up interval now, INTERVAL_MS =',
        INTERVAL_MS,
      );
      timerRef.current = setInterval(checkAndMaybeRemind, INTERVAL_MS);
    };

    // Initial mount — normal 3-reminders-per-session behavior,
    // but only if the user has placed at least one order.
    startCycle();

    // New order placed — reset and start a fresh set of 3 reminders.
    const onNewOrder = () => {
      startCycle({ isRestart: true });
    };
    window.addEventListener(KYC_REMINDER_NEW_ORDER_EVENT, onNewOrder);

    return () => {
      console.log(
        '[KycReminder] CLEANUP — effect unmounting, clearing interval',
      );
      cancelled = true;
      stopTimer();
      window.removeEventListener(KYC_REMINDER_NEW_ORDER_EVENT, onNewOrder);
    };
  }, []);

  return null;
}
