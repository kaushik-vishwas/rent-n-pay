// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { CheckCircle2, Package, User, XCircle } from 'lucide-react';
// import {
//   apiAdminGetRefundApprovals,
//   apiAdminDecideRefundApproval,
// } from '@/service/api';

// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// // function RefundDecisionModal({ open, row, onClose, onDecide, deciding }) {
// //   const [note, setNote] = useState('');
// //   if (!open || !row) return null;

// //   return (
// //     <div
// //       className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
// //       onClick={onClose}
// //     >
// //       <div
// //         className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <div className="flex items-start justify-between">
// //           <div>
// //             <h2 className="text-lg font-bold text-black">Approve Refund</h2>
// //             <p className="text-sm text-gray-500 mt-0.5">{row.productName}</p>
// //             {/* <p className="text-xs text-gray-400 mt-0.5">
// //               Customer:{' '}
// //               <span className="font-medium text-gray-600">
// //                 {row.customerName}
// //               </span>
// //               {' • '}
// //               Vendor:{' '}
// //               <span className="font-medium text-gray-600">
// //                 {row.vendorName}
// //               </span>
// //             </p> */}
// //           </div>
// //           <button
// //             type="button"
// //             onClick={onClose}
// //             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
// //           >
// //             <X className="w-5 h-5" />
// //           </button>
// //         </div>

// //         <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
// //           <div className="flex justify-between">
// //             <span className="text-gray-500">Customer</span>
// //             <span className="font-semibold text-black">
// //               {row.customerName}
// //             </span>
// //           </div>
// //           <div className="flex justify-between">
// //             <span className="text-gray-500">Deposit Held</span>
// //             <span className="font-semibold text-black">
// //               {money(row.refundableDeposit)}
// //             </span>
// //           </div>
// //           <div className="flex justify-between text-red-600">
// //             <span>QC / Damage + Cleaning Fees</span>
// //             <span className="font-semibold">- {money(row.totalDeduction)}</span>
// //           </div>
// //           <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-700">
// //             <span>Final Refund Amount</span>
// //             <span>{money(row.finalRefundAmount)}</span>
// //           </div>
// //         </div>

// //         {/* <div className="mt-4">
// //           <label className="text-xs font-semibold text-gray-600">
// //             Note (optional, required if rejecting)
// //           </label>
// //           <textarea
// //             value={note}
// //             onChange={(e) => setNote(e.target.value)}
// //             placeholder="Add a note for this decision..."
// //             className="mt-1 w-full min-h-[80px] rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
// //           />
// //         </div> */}

// //         <div className="mt-5 flex gap-3">
// //           <button
// //             type="button"
// //             disabled={deciding}
// //             onClick={() => onDecide('reject', note)}
// //             className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
// //           >
// //             <XCircle className="w-4 h-4" />
// //             No
// //           </button>
// //           <button
// //             type="button"
// //             disabled={deciding}
// //             onClick={() => onDecide('approve', note)}
// //             className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
// //           >
// //             <CheckCircle2 className="w-4 h-4" />
// //             {deciding ? 'Approving...' : 'Yes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// const RefundApproval = () => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedId, setSelectedId] = useState('');
//   const [deciding, setDeciding] = useState(false);
//   const getToken = () =>
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   const fetchRows = () => {
//     setLoading(true);
//     setError('');
//     apiAdminGetRefundApprovals(getToken())
//       .then((res) => setRows(res.data || []))
//       .catch((err) =>
//         setError(
//           err?.response?.data?.message || 'Failed to load refund approvals.',
//         ),
//       )
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     fetchRows();
//   }, []);

//   const selected = useMemo(
//     () =>
//       rows.find((r) => `${r.orderId}-${r.lineId}` === selectedId) ||
//       rows[0] ||
//       null,
//     [rows, selectedId],
//   );

//   useEffect(() => {
//     if (!selectedId && rows[0]) {
//       setSelectedId(`${rows[0].orderId}-${rows[0].lineId}`);
//     }
//     if (
//       selectedId &&
//       !rows.some((r) => `${r.orderId}-${r.lineId}` === selectedId)
//     ) {
//       setSelectedId(rows[0] ? `${rows[0].orderId}-${rows[0].lineId}` : '');
//     }
//   }, [rows, selectedId]);

//   const handleDecide = async (row, decision) => {
//     if (!row) return;
//     setDeciding(true);
//     try {
//       await apiAdminDecideRefundApproval(
//         row.orderId,
//         row.lineId,
//         { decision },
//         getToken(),
//       );
//       setRows((prev) =>
//         prev.map((r) =>
//           r.orderId === row.orderId && r.lineId === row.lineId
//             ? {
//                 ...r,
//                 refundStatus: decision === 'approve' ? 'approved' : 'rejected',
//               }
//             : r,
//         ),
//       );
//       fetchRows();
//     } catch (err) {
//       alert(err?.response?.data?.message || 'Failed to update decision.');
//     } finally {
//       setDeciding(false);
//     }
//   };
//   console.log('DEBUG selected refund row:', JSON.stringify(selected, null, 2));

//   return (
//     <div className="p-2 sm:p-4">
//       {loading ? (
//         <div className="flex justify-center py-14">
//           <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
//           {error}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
//           {/* LEFT: Pending Queue Table */}
//           <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//             <div className="px-4 py-4 border-b border-gray-100">
//               <p className="text-base font-semibold text-black">
//                 Refund Approval Queue
//               </p>
//               <p className="text-xs text-gray-500">
//                 {rows.length} refund requests
//               </p>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead className="bg-gray-50 text-gray-500 text-xs">
//                   <tr>
//                     <th className="px-4 py-3 text-center">Order ID</th>
//                     <th className="px-4 py-3 text-center">Customer</th>
//                     <th className="px-4 py-3 text-center">Vendor</th>
//                     <th className="px-4 py-3 text-center">Product</th>
//                     <th className="px-4 py-3 text-center">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.map((row, index) => {
//                     const rowId = `${row.orderId}-${row.lineId}`;
//                     return (
//                       <tr
//                         key={rowId}
//                         className={`border-t cursor-pointer ${
//                           selected &&
//                           `${selected.orderId}-${selected.lineId}` === rowId
//                             ? 'bg-orange-50/40'
//                             : 'hover:bg-gray-50'
//                         }`}
//                         onClick={() => setSelectedId(rowId)}
//                       >
//                         <td className="px-4 py-3 text-center font-semibold text-black">
//                           ORD-{String(row.orderNumber || 0).padStart(4, '0')}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700">
//                           {row.customerName}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700">
//                           {row.vendorName}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700">
//                           {row.productName}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border capitalize ${
//                               row.refundStatus === 'approved'
//                                 ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//                                 : row.refundStatus === 'rejected'
//                                   ? 'border-red-200 bg-red-50 text-red-700'
//                                   : 'border-amber-200 bg-amber-50 text-amber-700'
//                             }`}
//                           >
//                             {row.refundStatus}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                   {rows.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-6 py-10 text-center text-gray-500"
//                       >
//                         No refund approvals pending.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </section>

//           {/* RIGHT: Locked Detail Panel */}
//           <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-140px)] min-h-[560px]">
//             {selected ? (
//               <>
//                 <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
//                   <span className="w-9 h-9 rounded-xl bg-orange-500 text-white inline-flex items-center justify-center shrink-0">
//                     <Package className="w-4 h-4" />
//                   </span>
//                   <div>
//                     <p className="text-sm font-semibold text-black">
//                       Refund Audit
//                     </p>
//                     <p className="text-xs text-gray-500 font-medium truncate">
//                       {selected.productName}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="p-4 space-y-4 h-[calc(100%-57px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                   <img
//                     src={selected.productImage || selected.image}
//                     alt={selected.productName}
//                     className="w-full h-64 rounded-xl object-contain bg-gray-50 border border-gray-100"
//                   />

//                   {/* <div>
//                     <p className="font-semibold text-black">
//                       {selected.productName}
//                     </p>
//                   </div> */}

//                   {/* <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
//                     <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
//                       <User className="w-3 h-3" />
//                       Customer
//                     </p>
//                     <p className="text-sm font-semibold text-black mt-0.5">
//                       {selected.customerName}
//                     </p>
//                     <p className="text-[11px] text-gray-500 mt-1">
//                       Vendor: {selected.vendorName}
//                     </p>
//                   </div> */}

//                   <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Deposit</span>
//                       <span className="font-semibold text-black">
//                         {money(selected.refundableDeposit)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-red-600">
//                       <span>QC Fee</span>
//                       <span className="font-semibold">
//                         - {money(selected.totalDeduction)}
//                       </span>
//                     </div>
//                     <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-700">
//                       <span>Refund</span>
//                       <span>{money(selected.finalRefundAmount)}</span>
//                     </div>
//                   </div>
//                   {/*
//                   {selected.refundStatus === 'pending' ? (
//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         disabled={deciding}
//                         onClick={() => handleDecide(selected, 'reject')}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
//                       >
//                         <XCircle className="w-4 h-4" />
//                         Reject
//                       </button>
//                       <button
//                         type="button"
//                         disabled={deciding}
//                         onClick={() => handleDecide(selected, 'approve')}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
//                       >
//                         <CheckCircle2 className="w-4 h-4" />
//                         {deciding ? 'Processing...' : 'Approve'}
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="text-center text-sm text-gray-500">
//                       Already {selected.refundStatus}.
//                     </div>
//                   )} */}

//                   {selected.refundStatus === 'pending' ? (
//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         disabled={deciding}
//                         onClick={() => handleDecide(selected, 'reject')}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
//                       >
//                         <XCircle className="w-4 h-4" />
//                         Reject
//                       </button>
//                       <button
//                         type="button"
//                         disabled={deciding}
//                         onClick={() => handleDecide(selected, 'approve')}
//                         className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
//                       >
//                         <CheckCircle2 className="w-4 h-4" />
//                         {deciding ? 'Processing...' : 'Approve'}
//                       </button>
//                     </div>
//                   ) : (
//                     <div
//                       className={`rounded-xl border p-3 text-center text-sm font-medium ${
//                         selected.refundStatus === 'approved'
//                           ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//                           : 'border-red-200 bg-red-50 text-red-700'
//                       }`}
//                     >
//                       Already {selected.refundStatus}.
//                       <p className="text-xs font-normal text-gray-500 mt-1">
//                         {selected.refundStatus === 'approved'
//                           ? selected.refundApprovedAt
//                             ? new Date(
//                                 selected.refundApprovedAt,
//                               ).toLocaleString('en-IN', {
//                                 day: '2-digit',
//                                 month: 'short',
//                                 year: 'numeric',
//                                 hour: '2-digit',
//                                 minute: '2-digit',
//                               })
//                             : ''
//                           : selected.refundRejectedAt
//                             ? new Date(
//                                 selected.refundRejectedAt,
//                               ).toLocaleString('en-IN', {
//                                 day: '2-digit',
//                                 month: 'short',
//                                 year: 'numeric',
//                                 hour: '2-digit',
//                                 minute: '2-digit',
//                               })
//                             : ''}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <div className="p-6 text-sm text-gray-500">
//                 Select a refund request to review.
//               </div>
//             )}
//           </aside>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RefundApproval;

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Package,
  User,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  apiAdminGetRefundApprovals,
  apiAdminDecideRefundApproval,
} from '@/service/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// function RefundDecisionModal({ open, row, onClose, onDecide, deciding }) {
//   const [note, setNote] = useState('');
//   if (!open || !row) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-start justify-between">
//           <div>
//             <h2 className="text-lg font-bold text-black">Approve Refund</h2>
//             <p className="text-sm text-gray-500 mt-0.5">{row.productName}</p>
//             {/* <p className="text-xs text-gray-400 mt-0.5">
//               Customer:{' '}
//               <span className="font-medium text-gray-600">
//                 {row.customerName}
//               </span>
//               {' • '}
//               Vendor:{' '}
//               <span className="font-medium text-gray-600">
//                 {row.vendorName}
//               </span>
//             </p> */}
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className="text-gray-500">Customer</span>
//             <span className="font-semibold text-black">
//               {row.customerName}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Deposit Held</span>
//             <span className="font-semibold text-black">
//               {money(row.refundableDeposit)}
//             </span>
//           </div>
//           <div className="flex justify-between text-red-600">
//             <span>QC / Damage + Cleaning Fees</span>
//             <span className="font-semibold">- {money(row.totalDeduction)}</span>
//           </div>
//           <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-700">
//             <span>Final Refund Amount</span>
//             <span>{money(row.finalRefundAmount)}</span>
//           </div>
//         </div>

//         {/* <div className="mt-4">
//           <label className="text-xs font-semibold text-gray-600">
//             Note (optional, required if rejecting)
//           </label>
//           <textarea
//             value={note}
//             onChange={(e) => setNote(e.target.value)}
//             placeholder="Add a note for this decision..."
//             className="mt-1 w-full min-h-[80px] rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
//           />
//         </div> */}

//         <div className="mt-5 flex gap-3">
//           <button
//             type="button"
//             disabled={deciding}
//             onClick={() => onDecide('reject', note)}
//             className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
//           >
//             <XCircle className="w-4 h-4" />
//             No
//           </button>
//           <button
//             type="button"
//             disabled={deciding}
//             onClick={() => onDecide('approve', note)}
//             className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
//           >
//             <CheckCircle2 className="w-4 h-4" />
//             {deciding ? 'Approving...' : 'Yes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

const RefundApproval = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [selectedId, setSelectedId] = useState('');
  // const [deciding, setDeciding] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [productImgIndex, setProductImgIndex] = useState(0);
  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // const fetchRows = () => {
  //   setLoading(true);
  //   setError('');
  //   apiAdminGetRefundApprovals(getToken())
  //     .then((res) => setRows(res.data || []))
  //     .catch((err) =>
  //       setError(
  //         err?.response?.data?.message || 'Failed to load refund approvals.',
  //       ),
  //     )
  //     .finally(() => setLoading(false));
  // };

  const fetchRows = () => {
    setLoading(true);
    setError('');
    apiAdminGetRefundApprovals(getToken())
      .then((res) => {
        // This queue only shows refunds still awaiting a decision — the
        // Refund Management/Tracking page is where already-approved and
        // already-rejected refunds are shown instead.
        const all = res.data || [];
        setRows(all.filter((r) => r.refundStatus === 'pending'));
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message || 'Failed to load refund approvals.',
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const selected = useMemo(
    () =>
      rows.find((r) => `${r.orderId}-${r.lineId}` === selectedId) ||
      rows[0] ||
      null,
    [rows, selectedId],
  );

  // useEffect(() => {
  //   if (!selectedId && rows[0]) {
  //     setSelectedId(`${rows[0].orderId}-${rows[0].lineId}`);
  //   }
  //   if (
  //     selectedId &&
  //     !rows.some((r) => `${r.orderId}-${r.lineId}` === selectedId)
  //   ) {
  //     setSelectedId(rows[0] ? `${rows[0].orderId}-${rows[0].lineId}` : '');
  //   }
  // }, [rows, selectedId]);

  useEffect(() => {
    if (!selectedId && rows[0]) {
      setSelectedId(`${rows[0].orderId}-${rows[0].lineId}`);
    }
    if (
      selectedId &&
      !rows.some((r) => `${r.orderId}-${r.lineId}` === selectedId)
    ) {
      setSelectedId(rows[0] ? `${rows[0].orderId}-${rows[0].lineId}` : '');
    }
  }, [rows, selectedId]);

  useEffect(() => {
    setProductImgIndex(0);
  }, [selectedId]);

  const handleDecide = async (row, decision) => {
    if (!row) return;
    setDeciding(true);
    try {
      await apiAdminDecideRefundApproval(
        row.orderId,
        row.lineId,
        { decision },
        getToken(),
      );
      setRows((prev) =>
        prev.map((r) =>
          r.orderId === row.orderId && r.lineId === row.lineId
            ? {
                ...r,
                refundStatus: decision === 'approve' ? 'approved' : 'rejected',
              }
            : r,
        ),
      );
      fetchRows();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update decision.');
    } finally {
      setDeciding(false);
    }
  };
  console.log('DEBUG selected refund row:', JSON.stringify(selected, null, 2));

  return (
    <div className="p-2 sm:p-4">
      {loading ? (
        <div className="flex justify-center py-14">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
          {/* LEFT: Pending Queue Table */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100">
              <p className="text-base font-semibold text-black">
                Refund Approval Queue
              </p>
              <p className="text-xs text-gray-500">
                {rows.length} refund requests
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-center">Order ID</th>
                    <th className="px-4 py-3 text-center">Customer</th>
                    <th className="px-4 py-3 text-center">Vendor</th>
                    <th className="px-4 py-3 text-center">Product</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const rowId = `${row.orderId}-${row.lineId}`;
                    return (
                      <tr
                        key={rowId}
                        className={`border-t cursor-pointer ${
                          selected &&
                          `${selected.orderId}-${selected.lineId}` === rowId
                            ? 'bg-orange-50/40'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedId(rowId)}
                      >
                        <td className="px-4 py-3 text-center font-semibold text-black">
                          ORD-{String(row.orderNumber || 0).padStart(4, '0')}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {row.customerName}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {row.vendorName}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {row.productName}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border capitalize ${
                              row.refundStatus === 'approved'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : row.refundStatus === 'rejected'
                                  ? 'border-red-200 bg-red-50 text-red-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {row.refundStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No refund approvals pending.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* RIGHT: Locked Detail Panel */}
          <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-140px)] min-h-[560px]">
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-orange-500 text-white inline-flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Refund Audit
                    </p>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {selected.productName}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-4 h-[calc(100%-57px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {/* <img
                    src={selected.productImage || selected.image}
                    alt={selected.productName}
                    className="w-full h-64 rounded-xl object-contain bg-gray-50 border border-gray-100"
                  /> */}
                  {(() => {
                    const imgs =
                      Array.isArray(selected.productImages) &&
                      selected.productImages.length
                        ? selected.productImages
                        : [selected.productImage || selected.image].filter(
                            Boolean,
                          );
                    const safeIndex = Math.min(
                      productImgIndex,
                      Math.max(0, imgs.length - 1),
                    );
                    return (
                      <div className="relative w-full h-64 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                        <img
                          src={imgs[safeIndex]}
                          alt={selected.productName}
                          className="w-full h-full object-contain"
                        />
                        {imgs.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setProductImgIndex(
                                  (safeIndex - 1 + imgs.length) % imgs.length,
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow-sm inline-flex items-center justify-center hover:bg-white"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setProductImgIndex(
                                  (safeIndex + 1) % imgs.length,
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow-sm inline-flex items-center justify-center hover:bg-white"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-4 h-4 text-gray-700" />
                            </button>
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-medium">
                              {safeIndex + 1}/{imgs.length}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {selected.pickupPhotoUrl && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        QC Inspection Photo
                      </p>
                      <img
                        src={selected.pickupPhotoUrl}
                        alt="Inspection"
                        className="w-full h-48 rounded-xl object-contain bg-gray-50 border border-gray-100"
                      />
                    </div>
                  )}

                  {/* <div>
                    <p className="font-semibold text-black">
                      {selected.productName}
                    </p>
                  </div> */}

                  {/* <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      Customer
                    </p>
                    <p className="text-sm font-semibold text-black mt-0.5">
                      {selected.customerName}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Vendor: {selected.vendorName}
                    </p>
                  </div> */}

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deposit</span>
                      <span className="font-semibold text-black">
                        {money(selected.refundableDeposit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>QC Fee</span>
                      <span className="font-semibold">
                        - {money(selected.totalDeduction)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-700">
                      <span>Refund</span>
                      <span>{money(selected.finalRefundAmount)}</span>
                    </div>
                  </div>
                  {/* 
                  {selected.refundStatus === 'pending' ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => handleDecide(selected, 'reject')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => handleDecide(selected, 'approve')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {deciding ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-500">
                      Already {selected.refundStatus}.
                    </div>
                  )} */}

                  {/* {selected.refundStatus === 'pending' ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => handleDecide(selected, 'reject')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => handleDecide(selected, 'approve')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {deciding ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`rounded-xl border p-3 text-center text-sm font-medium ${
                        selected.refundStatus === 'approved'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      Already {selected.refundStatus}.
                      <p className="text-xs font-normal text-gray-500 mt-1">
                        {selected.refundStatus === 'approved'
                          ? selected.refundApprovedAt
                            ? new Date(
                                selected.refundApprovedAt,
                              ).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''
                          : selected.refundRejectedAt
                            ? new Date(
                                selected.refundRejectedAt,
                              ).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                      </p>
                    </div>
                  )} */}

                  {selected.refundStatus === 'pending' ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => handleDecide(selected, 'reject')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={deciding}
                        onClick={() => handleDecide(selected, 'approve')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {deciding ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="p-6 text-sm text-gray-500">
                Select a refund request to review.
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default RefundApproval;
