// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import {
//   apiGetAllCoupons,
//   apiToggleCouponStatus,
//   apiDeleteCoupon,
// } from '@/service/api';

// export default function CouponManagerPage() {
//   const router = useRouter();
//   const [coupons, setCoupons] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deletingId, setDeletingId] = useState(null);
//   const [togglingId, setTogglingId] = useState(null);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const LIMIT = 10;

//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   const fetchCoupons = async (p = 1) => {
//     try {
//       setLoading(true);
//       const res = await apiGetAllCoupons(token, { page: p, limit: LIMIT });
//       setCoupons(res.data.data);
//       setTotal(res.data.pagination.total);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to load coupons');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCoupons(page);
//   }, [page]);

//   const handleToggle = async (id) => {
//     try {
//       setTogglingId(id);
//       await apiToggleCouponStatus(id, token);
//       toast.success('Coupon status updated');
//       fetchCoupons(page);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Toggle failed');
//     } finally {
//       setTogglingId(null);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Are you sure you want to delete this coupon?')) return;
//     try {
//       setDeletingId(id);
//       await apiDeleteCoupon(id, token);
//       toast.success('Coupon deleted');
//       fetchCoupons(page);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Delete failed');
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const totalPages = Math.ceil(total / LIMIT);

//   const getStatusStyle = (isActive) => {
//     return isActive
//       ? 'bg-green-100 text-green-700'
//       : 'bg-gray-100 text-gray-500';
//   };

//   const getProgressColor = (used, limit) => {
//     const pct = (used / limit) * 100;
//     if (pct >= 100) return 'bg-red-500';
//     if (pct >= 70) return 'bg-yellow-400';
//     return 'bg-green-500';
//   };

//   const getDaysColor = (status, daysLeft) => {
//     if (status === 'expired') return 'text-red-500';
//     if (daysLeft <= 15) return 'text-orange-500';
//     return 'text-green-600';
//   };

//   return (
//     <div className="">
//       {/* Header */}
//       {/* <div className="flex items-start justify-between mb-6">

//         <button
//           onClick={() => router.push('/system/coupons/create')}
//           className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={2.5}
//             viewBox="0 0 24 24"
//           >
//             <line x1="12" y1="5" x2="12" y2="19" />
//             <line x1="5" y1="12" x2="19" y2="12" />
//           </svg>
//           Generate New Coupon
//         </button>
//       </div>

//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
//         <div className="px-6 pt-5 pb-1">
//           <h2 className="text-base font-bold text-gray-900">All Coupons</h2>
//           <p className="text-xs text-gray-400 mt-0.5">
//             Manage and monitor all promotional codes
//           </p>
//         </div> */}
//       {/* Table Card */}
//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
//         <div className="px-6 pt-5 pb-1 flex items-start justify-between gap-3">
//           <div>
//             <h2 className="text-base font-bold text-gray-900">All Coupons</h2>
//             <p className="text-xs text-gray-400 mt-0.5">
//               Manage and monitor all promotional codes
//             </p>
//           </div>
//           <button
//             onClick={() => router.push('/system/coupons/create')}
//             className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition whitespace-nowrap"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth={2.5}
//               viewBox="0 0 24 24"
//             >
//               <line x1="12" y1="5" x2="12" y2="19" />
//               <line x1="5" y1="12" x2="19" y2="12" />
//             </svg>
//             Generate New Coupon
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400 font-semibold">
//                 <th className="px-6 py-3 text-left">Code Details</th>
//                 <th className="px-4 py-3 text-left">Type</th>
//                 <th className="px-4 py-3 text-left">Usage / Limit</th>
//                 <th className="px-4 py-3 text-left">Validity</th>
//                 <th className="px-4 py-3 text-left">Status</th>
//                 <th className="px-4 py-3 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 [...Array(5)].map((_, i) => (
//                   <tr key={i} className="border-b border-gray-50">
//                     {[...Array(6)].map((__, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : coupons.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="py-16 text-center text-gray-400">
//                     <svg
//                       className="w-10 h-10 mx-auto mb-3 text-gray-300"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={1.5}
//                       viewBox="0 0 24 24"
//                     >
//                       <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
//                     </svg>
//                     No coupons found.{' '}
//                     <button
//                       onClick={() => router.push('/system/coupons/create')}
//                       className="text-orange-500 font-semibold hover:underline"
//                     >
//                       Create one
//                     </button>
//                   </td>
//                 </tr>
//               ) : (
//                 coupons.map((c) => {
//                   const pct = Math.min(
//                     Math.round((c.usedCount / c.totalUsageLimit) * 100),
//                     100,
//                   );
//                   const now = new Date();
//                   const until = new Date(c.validUntil);
//                   const daysLeft = Math.max(
//                     0,
//                     Math.ceil((until - now) / (1000 * 60 * 60 * 24)),
//                   );
//                   const fromStr = new Date(c.validFrom).toLocaleDateString(
//                     'en-IN',
//                     { day: '2-digit', month: 'short' },
//                   );
//                   const untilStr = until.toLocaleDateString('en-IN', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric',
//                   });

//                   return (
//                     <tr
//                       key={c._id}
//                       className="border-b border-gray-50 hover:bg-gray-50/60 transition"
//                     >
//                       {/* Code Details */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
//                             <svg
//                               className="w-4 h-4 text-orange-500"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth={2}
//                               viewBox="0 0 24 24"
//                             >
//                               <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
//                               <line x1="7" y1="7" x2="7.01" y2="7" />
//                             </svg>
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-1.5 font-bold text-gray-800">
//                               {c.code}
//                               <button
//                                 onClick={() => {
//                                   navigator.clipboard.writeText(c.code);
//                                   toast.success('Copied!');
//                                 }}
//                                 className="text-gray-300 hover:text-orange-500 transition"
//                               >
//                                 <svg
//                                   className="w-3.5 h-3.5"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   strokeWidth={2}
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <rect
//                                     x="9"
//                                     y="9"
//                                     width="13"
//                                     height="13"
//                                     rx="2"
//                                   />
//                                   <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//                                 </svg>
//                               </button>
//                             </div>
//                             <div className="text-xs text-gray-400 mt-0.5">
//                               {c.promotionName}
//                             </div>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Type */}
//                       <td className="px-4 py-4">
//                         <div className="flex flex-col gap-1">
//                           <div className="flex items-center gap-1.5 font-semibold text-gray-700 text-xs">
//                             <svg
//                               className="w-3.5 h-3.5 text-orange-500 flex-shrink-0"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth={2}
//                               viewBox="0 0 24 24"
//                             >
//                               <line x1="19" y1="5" x2="5" y2="19" />
//                               <circle cx="6.5" cy="6.5" r="2.5" />
//                               <circle cx="17.5" cy="17.5" r="2.5" />
//                             </svg>
//                             {c.discountType === 'percentage'
//                               ? `${c.discountValue}% OFF`
//                               : `Flat ₹${c.discountValue}`}
//                           </div>
//                           <div className="flex flex-wrap gap-1">
//                             {(c.applicableOn || []).map((item) => (
//                               <span
//                                 key={item}
//                                 className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
//             ${item === 'rentals' ? 'bg-orange-100 text-orange-600' : ''}
//             ${item === 'selling' ? 'bg-blue-100 text-blue-600' : ''}
//             ${item === 'services' ? 'bg-purple-100 text-purple-600' : ''}
//           `}
//                               >
//                                 {item}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       </td>

//                       {/* Usage */}
//                       <td className="px-4 py-4">
//                         <div className="w-32">
//                           <div className="text-xs font-bold tabular-nums mb-1.5 text-gray-800">
//                             {c.usedCount.toLocaleString()}{' '}
//                             <span className="font-normal text-gray-400">
//                               / {c.totalUsageLimit.toLocaleString()}
//                             </span>
//                           </div>
//                           <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                             <div
//                               className={`h-full rounded-full ${getProgressColor(c.usedCount, c.totalUsageLimit)}`}
//                               style={{ width: `${pct}%` }}
//                             />
//                           </div>
//                         </div>
//                       </td>

//                       {/* Validity */}
//                       <td className="px-4 py-4">
//                         <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
//                           <svg
//                             className="w-3 h-3"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth={2}
//                             viewBox="0 0 24 24"
//                           >
//                             <rect x="3" y="4" width="18" height="18" rx="2" />
//                             <line x1="16" y1="2" x2="16" y2="6" />
//                             <line x1="8" y1="2" x2="8" y2="6" />
//                             <line x1="3" y1="10" x2="21" y2="10" />
//                           </svg>
//                           {fromStr} – {untilStr}
//                         </div>
//                         <div
//                           className={`text-xs font-semibold ${getDaysColor(c.status, daysLeft)}`}
//                         >
//                           {c.status === 'expired'
//                             ? 'Expired'
//                             : `${daysLeft} days remaining`}
//                         </div>
//                       </td>

//                       {/* Status */}
//                       <td className="px-4 py-4">
//                         <span
//                           className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(c.status)}`}
//                         >
//                           {c.status === 'active' && (
//                             <svg
//                               className="w-2.5 h-2.5"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth={3}
//                               viewBox="0 0 24 24"
//                             >
//                               <polyline points="20 6 9 17 4 12" />
//                             </svg>
//                           )}
//                           {c.status === 'expired' && (
//                             <svg
//                               className="w-2.5 h-2.5"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth={3}
//                               viewBox="0 0 24 24"
//                             >
//                               <circle cx="12" cy="12" r="10" />
//                               <line x1="12" y1="8" x2="12" y2="12" />
//                               <line x1="12" y1="16" x2="12.01" y2="16" />
//                             </svg>
//                           )}
//                           {c.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-4 py-4">
//                         <div className="flex items-center gap-3">
//                           <label
//                             className={`relative inline-flex items-center cursor-pointer ${togglingId === c._id ? 'opacity-50 pointer-events-none' : ''}`}
//                           >
//                             <input
//                               type="checkbox"
//                               className="sr-only"
//                               checked={c.isActive}
//                               onChange={() => handleToggle(c._id)}
//                               disabled={togglingId === c._id}
//                             />
//                             <div
//                               className={`w-11 h-6 rounded-full transition-colors duration-200 ${c.isActive ? 'bg-orange-500' : 'bg-gray-200'}`}
//                             >
//                               <div
//                                 className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${c.isActive ? 'translate-x-5' : 'translate-x-0'}`}
//                               />
//                             </div>
//                           </label>

//                           <button
//                             onClick={() =>
//                               router.push(
//                                 `/system/coupons/create?edit=${c._id}`,
//                               )
//                             }
//                             className="text-gray-400 hover:text-blue-500 transition p-1 rounded"
//                             title="Edit"
//                           >
//                             <svg
//                               className="w-4 h-4"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth={2}
//                               viewBox="0 0 24 24"
//                             >
//                               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                               <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                             </svg>
//                           </button>
//                           <button
//                             onClick={() => handleDelete(c._id)}
//                             disabled={deletingId === c._id}
//                             className="text-gray-400 hover:text-red-500 transition p-1 rounded"
//                             title="Delete"
//                           >
//                             {deletingId === c._id ? (
//                               <svg
//                                 className="w-4 h-4 animate-spin"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <circle
//                                   className="opacity-25"
//                                   cx="12"
//                                   cy="12"
//                                   r="10"
//                                   stroke="currentColor"
//                                   strokeWidth="4"
//                                 />
//                                 <path
//                                   className="opacity-75"
//                                   fill="currentColor"
//                                   d="M4 12a8 8 0 018-8v8H4z"
//                                 />
//                               </svg>
//                             ) : (
//                               <svg
//                                 className="w-4 h-4"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 strokeWidth={2}
//                                 viewBox="0 0 24 24"
//                               >
//                                 <polyline points="3 6 5 6 21 6" />
//                                 <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
//                                 <path d="M10 11v6M14 11v6" />
//                                 <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
//                               </svg>
//                             )}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
//           <span className="text-sm text-gray-400">
//             Showing {coupons.length} of {total} coupons
//           </span>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
//             >
//               Previous
//             </button>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page >= totalPages}
//               className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  apiGetAllCoupons,
  apiToggleCouponStatus,
  apiDeleteCoupon,
} from '@/service/api';

export default function CouponManagerPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const fetchCoupons = async (p = 1) => {
    try {
      setLoading(true);
      const res = await apiGetAllCoupons(token, { page: p, limit: LIMIT });
      setCoupons(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(page);
  }, [page]);

  const handleToggle = async (id) => {
    try {
      setTogglingId(id);
      await apiToggleCouponStatus(id, token);
      toast.success('Coupon status updated');
      fetchCoupons(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Toggle failed');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      setDeletingId(id);
      await apiDeleteCoupon(id, token);
      toast.success('Coupon deleted');
      fetchCoupons(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const getStatusStyle = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-500';
  };

  const getProgressColor = (used, limit) => {
    const pct = (used / limit) * 100;
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 70) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getDaysColor = (status, daysLeft) => {
    if (status === 'expired') return 'text-red-500';
    if (daysLeft <= 15) return 'text-orange-500';
    return 'text-green-600';
  };

  return (
    <div className="">
      {/* Header */}
      {/* <div className="flex items-start justify-between mb-6">
      
        <button
          onClick={() => router.push('/system/coupons/create')}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Generate New Coupon
        </button>
      </div>

 
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 pt-5 pb-1">
          <h2 className="text-base font-bold text-gray-900">All Coupons</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage and monitor all promotional codes
          </p>
        </div> */}
      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 pt-5 pb-1 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">All Coupons</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage and monitor all promotional codes
            </p>
          </div>
          <button
            onClick={() => router.push('/system/coupons/create')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition whitespace-nowrap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Generate New Coupon
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400 font-semibold">
                <th className="px-6 py-3 text-left">Code Details</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-center">Usage / Limit</th>
                <th className="px-4 py-3 text-center">Validity</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <svg
                      className="w-10 h-10 mx-auto mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    </svg>
                    No coupons found.{' '}
                    <button
                      onClick={() => router.push('/system/coupons/create')}
                      className="text-orange-500 font-semibold hover:underline"
                    >
                      Create one
                    </button>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const pct = Math.min(
                    Math.round((c.usedCount / c.totalUsageLimit) * 100),
                    100,
                  );
                  const now = new Date();
                  const until = new Date(c.validUntil);
                  const daysLeft = Math.max(
                    0,
                    Math.ceil((until - now) / (1000 * 60 * 60 * 24)),
                  );
                  const fromStr = new Date(c.validFrom).toLocaleDateString(
                    'en-IN',
                    { day: '2-digit', month: 'short' },
                  );
                  const untilStr = until.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={c._id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition"
                    >
                      {/* Code Details */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-start justify-start gap-3">
                          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                              <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5 font-bold text-gray-800">
                              {c.code}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(c.code);
                                  toast.success('Copied!');
                                }}
                                className="text-gray-300 hover:text-orange-500 transition"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                  />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {c.promotionName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-700 text-xs">
                            <svg
                              className="w-3.5 h-3.5 text-orange-500 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <line x1="19" y1="5" x2="5" y2="19" />
                              <circle cx="6.5" cy="6.5" r="2.5" />
                              <circle cx="17.5" cy="17.5" r="2.5" />
                            </svg>
                            {c.discountType === 'percentage'
                              ? `${c.discountValue}% OFF`
                              : `Flat ₹${c.discountValue}`}
                          </div>
                          {/* <div className="flex flex-wrap gap-1">
                            {(c.applicableOn || []).map((item) => (
                              <span
                                key={item}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
            ${item === 'rentals' ? 'bg-orange-100 text-orange-600' : ''}
            ${item === 'selling' ? 'bg-blue-100 text-blue-600' : ''}
            ${item === 'services' ? 'bg-purple-100 text-purple-600' : ''}
          `}
                              >
                                {item}
                              </span>
                            ))}
                          </div> */}
                          <div className="flex flex-wrap gap-1">
                            {(c.applicableOn || []).map((item) => (
                              <span
                                key={item}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
            ${item === 'rentals' ? 'bg-orange-100 text-orange-600' : ''}
            ${item === 'selling' ? 'bg-blue-100 text-blue-600' : ''}
            ${item === 'services' ? 'bg-purple-100 text-purple-600' : ''}
          `}
                              >
                                {item === 'selling'
                                  ? 'Buy'
                                  : item === 'rentals'
                                    ? 'Rent'
                                    : item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-4 text-center">
                        <div className="w-32 mx-auto">
                          <div className="text-xs font-bold tabular-nums mb-1.5 text-gray-800">
                            {c.usedCount.toLocaleString()}{' '}
                            <span className="font-normal text-gray-400">
                              / {c.totalUsageLimit.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressColor(c.usedCount, c.totalUsageLimit)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {fromStr} – {untilStr}
                        </div>
                        <div
                          className={`text-xs font-semibold ${getDaysColor(c.status, daysLeft)}`}
                        >
                          {c.status === 'expired'
                            ? 'Expired'
                            : `${daysLeft} days remaining`}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(c.status)}`}
                        >
                          {c.status === 'active' && (
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              viewBox="0 0 24 24"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {c.status === 'expired' && (
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                          )}
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <label
                            className={`relative inline-flex items-center cursor-pointer ${togglingId === c._id ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={c.isActive}
                              onChange={() => handleToggle(c._id)}
                              disabled={togglingId === c._id}
                            />
                            <div
                              className={`w-11 h-6 rounded-full transition-colors duration-200 ${c.isActive ? 'bg-orange-500' : 'bg-gray-200'}`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${c.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                              />
                            </div>
                          </label>

                          <button
                            onClick={() =>
                              router.push(
                                `/system/coupons/create?edit=${c._id}`,
                              )
                            }
                            className="text-gray-400 hover:text-blue-500 transition p-1 rounded"
                            title="Edit"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            disabled={deletingId === c._id}
                            className="text-gray-400 hover:text-red-500 transition p-1 rounded"
                            title="Delete"
                          >
                            {deletingId === c._id ? (
                              <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <span className="text-sm text-gray-400">
            Showing {coupons.length} of {total} coupons
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-1.5 text-sm font-medium border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
