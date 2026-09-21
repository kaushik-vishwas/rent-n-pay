// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSelector } from 'react-redux';
// import { Package, FileText, IndianRupee, ChevronRight } from 'lucide-react';
// import { apiGetMyOrders } from '@/lib/api';
// import ReferralDashboard from '@/assets/icons/referraldashboard.png';
// import StartRenting from '@/assets/icons/startrenting.png';
// export default function Dashboard() {
//   const router = useRouter();
//   const { user } = useSelector((s) => s.auth);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeBanner, setActiveBanner] = useState(0);
//   const TOTAL_BANNERS = 2;

//   useEffect(() => {
//     apiGetMyOrders()
//       .then((res) => setOrders(res.data || []))
//       .catch(() => setOrders([]))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveBanner((prev) => (prev + 1) % TOTAL_BANNERS);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const activeProductsCount = useMemo(() => {
//     let count = 0;
//     for (const order of orders) {
//       const orderSt = (order.status || '').toLowerCase();
//       if (orderSt === 'cancelled' || orderSt === 'completed') continue;
//       for (const line of order.products || []) {
//         const lineSt = (line.lineStatus || order.status || '').toLowerCase();
//         if (lineSt === 'cancelled' || lineSt === 'completed') continue;
//         if (lineSt !== 'delivered') continue;
//         // Match lineEligibleForRentalHub: must be Rental type
//         const productType = String(line.productType || '').toLowerCase();
//         if (productType !== 'rental') continue;
//         // Must have a product reference
//         if (!line.product) continue;
//         count += 1;
//       }
//     }
//     return count;
//   }, [orders]);

//   const totalRequestsCount = useMemo(() => {
//     let count = 0;
//     for (const order of orders) {
//       for (const line of order.products || []) {
//         count += (line.issueReports || []).length;
//       }
//     }
//     return count;
//   }, [orders]);

//   const rentoMoneyBalance = useMemo(() => {
//     const totalDepositPaid = orders.reduce((sum, order) => {
//       return (
//         sum +
//         (order.products || []).reduce((s, line) => {
//           const active = [
//             'delivered',
//             'confirmed',
//             'shipped',
//             'pending',
//           ].includes(String(line.lineStatus || order.status).toLowerCase());
//           if (!active) return s;
//           return s + Number(line.refundableDeposit || 0);
//         }, 0)
//       );
//     }, 0);

//     const depositRefunded = orders.reduce((sum, order) => {
//       return (
//         sum +
//         (order.products || []).reduce((s, line) => {
//           const isCancelled =
//             String(line.lineStatus || order.status).toLowerCase() ===
//             'cancelled';
//           if (!isCancelled) return s;
//           const rr = line?.returnRequest;
//           const hasReturnTracking = Boolean(rr?.requestedAt);
//           const refundAmt = hasReturnTracking
//             ? Number(rr?.finalRefundAmount || line.refundableDeposit || 0)
//             : Number(line.pricePerDay || 0) * Number(line.quantity || 1);
//           return s + refundAmt;
//         }, 0)
//       );
//     }, 0);

//     return totalDepositPaid - depositRefunded;
//   }, [orders]);

//   const stats = [
//     {
//       title: 'Total Live Orders',
//       value: loading ? '...' : String(activeProductsCount),
//       icon: Package,
//       onClick: () => router.push('/my-account?tab=manage-rental-items'),
//     },
//     {
//       title: 'Total Requests Raised',
//       value: loading ? '...' : String(totalRequestsCount),
//       icon: FileText,
//       onClick: () => router.push('/my-account?tab=all-requests'),
//     },
//     {
//       title: 'Rent Money Available',
//       value: loading
//         ? '...'
//         : `₹${Number(rentoMoneyBalance).toLocaleString('en-IN')}`,
//       icon: IndianRupee,
//       onClick: () => router.push('/my-account?tab=rentoMoney'),
//     },
//   ];

//   const hasActiveRentals = activeProductsCount > 0;

//   return (
//     <div className="space-y-5">
//       {/* <h1 className="text-2xl font-bold text-black">Dashboard</h1> */}

//       {/* Banner */}
//       {/* {activeBanner === 0 ? (
//         <div className="hidden rounded-2xl sm:block bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5"> */}
//       {activeBanner === 0 ? (
//         <div className="hidden sm:block rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center justify-center w-24 h-24 shrink-0">
//                 <img src={ReferralDashboard.src} alt="Referral Dashboard" />
//               </div>
//               <div>
//                 <p className="text-base font-bold text-gray-900">
//                   Refer your friends
//                 </p>
//                 <p className="text-lg font-semibold text-orange-600">
//                   Earn up to ₹1,000
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={() => router.push('/my-account?tab=referral')}
//               className="shrink-0 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
//             >
//               Refer Friends
//             </button>
//           </div>

//           <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-500 px-4 py-2">
//             <p className="text-sm font-medium text-white truncate">
//               Save on your rental with Referrals.
//             </p>
//             <div className="flex items-center gap-2 shrink-0">
//               {Array.from({ length: TOTAL_BANNERS }).map((_, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   aria-label={`Show banner ${i + 1}`}
//                   onClick={() => setActiveBanner(i)}
//                   className={`h-2 rounded-full transition-all duration-300 ${
//                     activeBanner === i ? 'w-6 bg-white' : 'w-2 bg-white/50'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       ) : (
//         // ) : (
//         //   <div className=" rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5 ">
//         <div className="hidden sm:block rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center justify-center w-24 h-24 shrink-0">
//                 <img src={StartRenting.src} alt="Start Renting" />
//               </div>
//               <div>
//                 <p className="text-base font-semibold text-black">
//                   Welcome,
//                   <span className=" text-lg block font-bold text-orange-600">
//                     {/* {user?.fullName || ''} */}
//                     {user?.fullName?.split(' ')[0] || ''}
//                   </span>
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={() => router.push('/rent')}
//               className="shrink-0 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
//             >
//               Start Renting
//             </button>
//           </div>

//           <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-500 px-4 py-2">
//             <p className="text-sm font-medium text-white truncate">
//               Checkout offers to save more on your new lifestyle.
//             </p>
//             <div className="flex items-center gap-2 shrink-0">
//               {Array.from({ length: TOTAL_BANNERS }).map((_, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   aria-label={`Show banner ${i + 1}`}
//                   onClick={() => setActiveBanner(i)}
//                   className={`h-2 rounded-full transition-all duration-300 ${
//                     activeBanner === i ? 'w-6 bg-white' : 'w-2 bg-white/50'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {stats.map((item, index) => {
//           const Icon = item.icon;
//           return (
//             <div
//               key={index}
//               onClick={item.onClick || undefined}
//               className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between transition hover:shadow-md ${item.onClick ? 'cursor-pointer hover:border-orange-300' : ''}`}
//             >
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
//                   <Icon size={22} className="text-orange-500" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-black leading-tight">
//                     {item.value}
//                   </p>
//                   <p className="text-base text-gray-600 mt-0.5">{item.title}</p>
//                 </div>
//               </div>
//               {item.onClick && (
//                 <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Empty State */}
//       {/* <div className="bg-white rounded-xl p-10 text-center border border-gray-200">
//         <h2 className="text-xl font-semibold text-gray-700">
//           You don&apos;t have any active requests!
//         </h2>
//       </div> */}
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Package, FileText, IndianRupee, ChevronRight } from 'lucide-react';
import { apiGetMyOrders } from '@/lib/api';
import ReferralDashboard from '@/assets/icons/referraldashboard.png';
import StartRenting from '@/assets/icons/startrenting.png';
export default function Dashboard() {
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const TOTAL_BANNERS = 2;

  useEffect(() => {
    apiGetMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % TOTAL_BANNERS);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeProductsCount = useMemo(() => {
    let count = 0;
    for (const order of orders) {
      const orderSt = (order.status || '').toLowerCase();
      if (orderSt === 'cancelled' || orderSt === 'completed') continue;
      for (const line of order.products || []) {
        const lineSt = (line.lineStatus || order.status || '').toLowerCase();
        if (lineSt === 'cancelled' || lineSt === 'completed') continue;
        if (lineSt !== 'delivered') continue;
        // Match lineEligibleForRentalHub: must be Rental type
        const productType = String(line.productType || '').toLowerCase();
        if (productType !== 'rental') continue;
        // Must have a product reference
        if (!line.product) continue;
        count += 1;
      }
    }
    return count;
  }, [orders]);

  const totalRequestsCount = useMemo(() => {
    let count = 0;
    for (const order of orders) {
      for (const line of order.products || []) {
        count += (line.issueReports || []).length;
      }
    }
    return count;
  }, [orders]);

  // const rentoMoneyBalance = useMemo(() => {
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
  //           String(line.lineStatus || order.status).toLowerCase() ===
  //           'cancelled';
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

  //   return totalDepositPaid - depositRefunded;
  // }, [orders]);

  const rentoMoneyBalance = useMemo(() => {
    const totalDepositPaid = orders.reduce((sum, order) => {
      return (
        sum +
        (order.products || []).reduce((s, line) => {
          return s + Number(line.refundableDeposit || 0);
        }, 0)
      );
    }, 0);

    const depositAdjusted = orders.reduce((sum, order) => {
      return (
        sum +
        (order.products || []).reduce((s, line) => {
          const rr = line?.returnRequest;
          if (!rr?.refundApprovedAt) return s;

          const deduction =
            rr?.totalDeduction != null
              ? Number(rr.totalDeduction)
              : Number(rr?.damageDeduction || 0) +
                Number(rr?.cleaningFees || 0);

          return s + Math.max(0, deduction);
        }, 0)
      );
    }, 0);

    const depositRefunded = orders.reduce((sum, order) => {
      return (
        sum +
        (order.products || []).reduce((s, line) => {
          const rr = line?.returnRequest;
          if (rr?.refundPaidAt) {
            return s + Number(rr?.finalRefundAmount || 0);
          }

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

    return totalDepositPaid - depositAdjusted - depositRefunded;
  }, [orders]);
  const stats = [
    {
      title: 'Total Live Orders',
      value: loading ? '...' : String(activeProductsCount),
      icon: Package,
      onClick: () => router.push('/my-account?tab=manage-rental-items'),
    },
    {
      title: 'Total Requests Raised',
      value: loading ? '...' : String(totalRequestsCount),
      icon: FileText,
      onClick: () => router.push('/my-account?tab=all-requests'),
    },
    // {
    //   title: 'Rent Money Available',
    //   value: loading
    //     ? '...'
    //     : `₹${Number(rentoMoneyBalance).toLocaleString('en-IN')}`,
    //   icon: IndianRupee,
    //   onClick: () => router.push('/my-account?tab=rentoMoney'),
    // },
    {
      title: 'Active Deposit',
      value: loading
        ? '...'
        : `₹${Number(rentoMoneyBalance).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      onClick: () => router.push('/my-account?tab=deposit-ledger'),
    },
  ];

  const hasActiveRentals = activeProductsCount > 0;

  return (
    <div className="space-y-5">
      {/* <h1 className="text-2xl font-bold text-black">Dashboard</h1> */}

      {/* Banner */}
      {/* {activeBanner === 0 ? (
        <div className="hidden rounded-2xl sm:block bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5"> */}
      {activeBanner === 0 ? (
        <div className="hidden sm:block rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-24 h-24 shrink-0">
                <img src={ReferralDashboard.src} alt="Referral Dashboard" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">
                  Refer your friends
                </p>
                <p className="text-lg font-semibold text-orange-600">
                  Earn up to ₹1,000
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/my-account?tab=referral')}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Refer Friends
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-500 px-4 py-2">
            <p className="text-sm font-medium text-white truncate">
              Save on your rental with Referrals.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {Array.from({ length: TOTAL_BANNERS }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show banner ${i + 1}`}
                  onClick={() => setActiveBanner(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeBanner === i ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ) : (
        //   <div className=" rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5 ">
        <div className="hidden sm:block rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-24 h-24 shrink-0">
                <img src={StartRenting.src} alt="Start Renting" />
              </div>
              <div>
                <p className="text-base font-semibold text-black">
                  Welcome,
                  <span className=" text-lg block font-bold text-orange-600">
                    {/* {user?.fullName || ''} */}
                    {user?.fullName?.split(' ')[0] || ''}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/rent')}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Start Renting
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-500 px-4 py-2">
            <p className="text-sm font-medium text-white truncate">
              Checkout offers to save more on your new lifestyle.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {Array.from({ length: TOTAL_BANNERS }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show banner ${i + 1}`}
                  onClick={() => setActiveBanner(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeBanner === i ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              onClick={item.onClick || undefined}
              className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between transition hover:shadow-md ${item.onClick ? 'cursor-pointer hover:border-orange-300' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-black leading-tight">
                    {item.value}
                  </p>
                  <p className="text-base text-gray-600 mt-0.5">{item.title}</p>
                </div>
              </div>
              {item.onClick && (
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {/* <div className="bg-white rounded-xl p-10 text-center border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700">
          You don&apos;t have any active requests!
        </h2>
      </div> */}
    </div>
  );
}
