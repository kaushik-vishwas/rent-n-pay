// 'use client';

// import { useEffect, useState } from 'react';
// import { Loader2, Wallet } from 'lucide-react';
// import Rentomoney from '@/assets/icons/Rentomoney.png';
// import { apiGetMyOrders } from '@/lib/api';

// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// export default function DepositLedger() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // useEffect(() => {
//   //   const token = localStorage.getItem('userToken');
//   //   if (!token) {
//   //     setError('Please login again.');
//   //     setLoading(false);
//   //     return;
//   //   }
//   //   // fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
//   //   //   headers: { Authorization: `Bearer ${token}` },
//   //   // })
//   //   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//   //   if (!baseUrl) {
//   //     setError('API URL is not configured.');
//   //     setLoading(false);
//   //     return;
//   //   }
//   //   fetch(`${baseUrl}/orders/my`, {
//   //     headers: { Authorization: `Bearer ${token}` },
//   //   })
//   //     .then((r) => r.json())
//   //     .then((data) => {
//   //       setOrders(Array.isArray(data) ? data : []);
//   //     })
//   //     .catch(() => setError('Failed to load deposit ledger.'))
//   //     .finally(() => setLoading(false));
//   // }, []);
//   useEffect(() => {
//     apiGetMyOrders()
//       .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
//       .catch(() => setError('Failed to load deposit ledger.'))
//       .finally(() => setLoading(false));
//   }, []);

//   const totalDepositPaid = orders.reduce((sum, order) => {
//     return (
//       sum +
//       (order.products || []).reduce((s, line) => {
//         const active = [
//           'delivered',
//           'confirmed',
//           'shipped',
//           'pending',
//         ].includes(String(line.lineStatus || order.status).toLowerCase());
//         if (!active) return s;
//         return s + Number(line.refundableDeposit || 0);
//       }, 0)
//     );
//   }, 0);

//   const depositRefunded = orders.reduce((sum, order) => {
//     return (
//       sum +
//       (order.products || []).reduce((s, line) => {
//         const isCancelled =
//           String(line.lineStatus || order.status).toLowerCase() === 'cancelled';
//         if (!isCancelled) return s;

//         const rr = line?.returnRequest;
//         const hasReturnTracking = Boolean(rr?.requestedAt);

//         const refundAmt = hasReturnTracking
//           ? Number(rr?.finalRefundAmount || line.refundableDeposit || 0)
//           : Number(line.pricePerDay || 0) * Number(line.quantity || 1);

//         return s + refundAmt;
//       }, 0)
//     );
//   }, 0);

//   const refundableBalance = totalDepositPaid - depositRefunded;

//   if (loading) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center">
//         <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       <div>
//         <h2 className="text-xl font-semibold text-black">Deposit Ledger</h2>
//         <p className="mt-0.5 text-sm text-gray-500">
//           View security deposit and refund amount information here.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//         {/* Green card — Total Available Balance */}
//         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-5 text-white">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm text-white">Active Deposit</p>
//               <p className="mt-1 text-4xl font-bold">
//                 {money(refundableBalance)}
//               </p>
//             </div>
//             <div className="flex items-center justify-center">
//               <img
//                 src={Rentomoney.src}
//                 alt="Rent Money"
//                 className="h-28 w-28 shrink-0 drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)]"
//               />
//             </div>
//           </div>
//         </div>

//         {/* White card — Deposit breakdown */}
//         <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
//           <p className="text-3xl font-bold text-black">
//             {money(refundableBalance)}
//           </p>
//           <div className="space-y-1.5 pt-1 border-t border-gray-100">
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-gray-500">Total Deposit Paid</span>
//               <span className="font-medium text-gray-800">
//                 {money(totalDepositPaid)}
//               </span>
//             </div>
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-rose-500">Deposit Refunded</span>
//               <span className="font-medium text-rose-600">
//                 -{money(depositRefunded)}
//               </span>
//             </div>
//             <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-1.5">
//               <span className="text-gray-500">Active Deposits</span>
//               <span className="font-semibold text-emerald-700">
//                 {money(refundableBalance)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import Rentomoney from '@/assets/icons/Rentomoney.png';
import { apiGetMyOrders } from '@/lib/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function DepositLedger() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const token = localStorage.getItem('userToken');
  //   if (!token) {
  //     setError('Please login again.');
  //     setLoading(false);
  //     return;
  //   }
  //   // fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
  //   //   headers: { Authorization: `Bearer ${token}` },
  //   // })
  //   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  //   if (!baseUrl) {
  //     setError('API URL is not configured.');
  //     setLoading(false);
  //     return;
  //   }
  //   fetch(`${baseUrl}/orders/my`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((r) => r.json())
  //     .then((data) => {
  //       setOrders(Array.isArray(data) ? data : []);
  //     })
  //     .catch(() => setError('Failed to load deposit ledger.'))
  //     .finally(() => setLoading(false));
  // }, []);
  useEffect(() => {
    apiGetMyOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load deposit ledger.'))
      .finally(() => setLoading(false));
  }, []);

  // const totalDepositPaid = orders.reduce((sum, order) => {
  //   return (
  //     sum +
  //     (order.products || []).reduce((s, line) => {
  //       const active = [
  //         'delivered',
  //         'confirmed',
  //         'shipped',
  //         'pending',
  //         'cancelled',
  //       ].includes(String(line.lineStatus || order.status).toLowerCase());
  //       if (!active) return s;
  //       return s + Number(line.refundableDeposit || 0);
  //     }, 0)
  //   );
  // }, 0);
  const totalDepositPaid = orders.reduce((sum, order) => {
    return (
      sum +
      (order.products || []).reduce((s, line) => {
        return s + Number(line.refundableDeposit || 0);
      }, 0)
    );
  }, 0);

  // const depositRefunded = orders.reduce((sum, order) => {
  //   return (
  //     sum +
  //     (order.products || []).reduce((s, line) => {
  //       const isCancelled =
  //         String(line.lineStatus || order.status).toLowerCase() === 'cancelled';
  //       if (!isCancelled) return s;

  //       const rr = line?.returnRequest;
  //       const hasReturnTracking = Boolean(rr?.requestedAt);

  //       const refundAmt = hasReturnTracking
  //         ? Number(rr?.finalRefundAmount || line.refundableDeposit || 0)
  //         : Number(line.pricePerDay || 0) * Number(line.quantity || 1);

  //       return s + refundAmt;
  //     }, 0)
  //   );
  // }, 0);

  const depositAdjusted = orders.reduce((sum, order) => {
    return (
      sum +
      (order.products || []).reduce((s, line) => {
        const rr = line?.returnRequest;
        // Deduction is only real once admin has reviewed and approved it —
        // vendor's inspection submission alone is just a claim, not final.
        if (!rr?.refundApprovedAt) return s;

        const deduction =
          rr?.totalDeduction != null
            ? Number(rr.totalDeduction)
            : Number(rr?.damageDeduction || 0) + Number(rr?.cleaningFees || 0);

        return s + Math.max(0, deduction);
      }, 0)
    );
  }, 0);

  const depositRefunded = orders.reduce((sum, order) => {
    return (
      sum +
      (order.products || []).reduce((s, line) => {
        // const rr = line?.returnRequest;
        // // Only count as "refunded" once admin has actually marked payout as paid.
        // const isPaidOut = rr?.payoutStatus === 'paid';
        // if (!isPaidOut) return s;

        // return s + Number(rr?.finalRefundAmount || 0);
        const rr = line?.returnRequest;
        // Path 1: post-delivery return — refunded once admin marks it paid
        // (backend sets refundPaidAt, not a payoutStatus field).
        if (rr?.refundPaidAt) {
          return s + Number(rr?.finalRefundAmount || 0);
        }

        // Path 2: pre-delivery user cancellation — separate flow, own fields.
        // Only the deposit portion belongs in the deposit ledger (not the
        // full order refund, which includes rent/taxes/fees too).
        const isCancelDeposit =
          line?.cancelledBy === 'user' &&
          line?.lineStatus === 'cancelled' &&
          !rr?.requestedAt &&
          Boolean(line?.cancelRefundPaidAt);
        if (isCancelDeposit) {
          return s + Number(line?.refundBreakdown?.deposit || 0);
        }

        return s;
      }, 0)
    );
  }, 0);

  const refundableBalance =
    totalDepositPaid - depositAdjusted - depositRefunded;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-black">Deposit Ledger</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          View security deposit and refund amount information here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Green card — Total Available Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white">Active Deposit</p>
              <p className="mt-1 text-4xl font-bold">
                {money(refundableBalance)}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={Rentomoney.src}
                alt="Rent Money"
                className="h-28 w-28 shrink-0 drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* White card — Deposit breakdown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <p className="text-3xl font-bold text-black">
            {money(refundableBalance)}
          </p>
          <div className="space-y-1.5 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Deposit Paid</span>
              <span className="font-medium text-gray-800">
                {money(totalDepositPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-500">Deposit Adjusted</span>
              <span className="font-medium text-amber-600">
                -{money(depositAdjusted)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-rose-500">Deposit Refunded</span>
              <span className="font-medium text-rose-600">
                -{money(depositRefunded)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-1.5">
              <span className="text-gray-500">Active Deposits</span>
              <span className="font-semibold text-emerald-700">
                {money(refundableBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
