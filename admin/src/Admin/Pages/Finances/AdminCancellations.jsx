// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   Wallet,
//   Clock3,
//   CheckCircle2,
//   Search,
//   X,
//   Download,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import {
//   apiAdminGetCancelRefunds,
//   apiAdminMarkCancelRefundPaid,
// } from '@/service/api';

// const PAGE_SIZE = 15;

// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// const formatDate = (d) =>
//   d
//     ? new Date(d).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       })
//     : '-';

// const getToken = () =>
//   typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

// function ConfirmPaidModal({
//   open,
//   row,
//   onClose,
//   onConfirm,
//   confirming,
//   transactionId,
//   setTransactionId,
// }) {
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
//             <h2 className="text-lg font-bold text-gray-900">
//               Confirm Cancellation Refund
//             </h2>
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
//             <span className="font-semibold text-gray-900">
//               {row.customerName}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Order Amount</span>
//             <span className="font-semibold text-gray-900">
//               {money(row.orderAmount)}
//             </span>
//           </div>
//           <div className="flex justify-between text-red-600">
//             <span>Cancellation Fee</span>
//             <span className="font-semibold">
//               {row.deduction > 0 ? `- ${money(row.deduction)}` : '₹0'}
//             </span>
//           </div>
//           <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-700">
//             <span>Refund Amount to Pay</span>
//             <span>{money(row.refundAmount)}</span>
//           </div>
//         </div>

//         {/* <div className="mt-4">
//           <label className="text-xs font-medium text-gray-600">
//             Refund Transaction ID
//           </label>
//           <input
//             value={transactionId}
//             onChange={(e) => setTransactionId(e.target.value)}
//             placeholder="Enter transaction / UTR ID"
//             className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
//           />
//         </div> */}

//         <button
//           type="button"
//           disabled={confirming}
//           onClick={onConfirm}
//           className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
//         >
//           {confirming ? 'Confirming...' : 'Mark as Paid'}
//         </button>
//       </div>
//     </div>
//   );
// }

// const AdminCancellations = () => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [query, setQuery] = useState('');
//   const [modal, setModal] = useState({ open: false, row: null });
//   const [confirming, setConfirming] = useState(false);
//   const [transactionId, setTransactionId] = useState('');
//   const [page, setPage] = useState(1);

//   const fetchRows = () => {
//     setLoading(true);
//     setError('');
//     apiAdminGetCancelRefunds(getToken())
//       .then((res) => setRows(res.data || []))
//       .catch((err) =>
//         setError(
//           err?.response?.data?.message || 'Failed to load cancellations.',
//         ),
//       )
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     fetchRows();
//   }, []);

//   const filteredRows = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return rows;
//     return rows.filter(
//       (r) =>
//         String(r.vendorName || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(r.customerName || '')
//           .toLowerCase()
//           .includes(q) ||
//         `ORD-${String(r.orderNumber || 0).padStart(4, '0')}`
//           .toLowerCase()
//           .includes(q),
//     );
//   }, [rows, query]);

//   const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
//   const safePage = Math.min(page, totalPages);
//   const pageRows = filteredRows.slice(
//     (safePage - 1) * PAGE_SIZE,
//     safePage * PAGE_SIZE,
//   );

//   useEffect(() => {
//     setPage(1);
//   }, [query]);

//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   const upcomingTotal = useMemo(
//     () => rows.reduce((s, r) => s + Number(r.refundAmount || 0), 0),
//     [rows],
//   );
//   const pendingTotal = useMemo(
//     () =>
//       rows
//         .filter((r) => r.refundStatus !== 'paid')
//         .reduce((s, r) => s + Number(r.refundAmount || 0), 0),
//     [rows],
//   );
//   const paidTotal = useMemo(
//     () =>
//       rows
//         .filter((r) => r.refundStatus === 'paid')
//         .reduce((s, r) => s + Number(r.refundAmount || 0), 0),
//     [rows],
//   );

//   const handleExportExcel = () => {
//     const exportData = filteredRows.map((row) => ({
//       'Order ID': `ORD-${String(row.orderNumber || 0).padStart(4, '0')}`,
//       'Customer Name': row.customerName || '-',
//       'Vendor Name': row.vendorName || '-',
//       Product: row.productName || '-',
//       'Order Amount': Number(row.orderAmount || 0),
//       Deduction: Number(row.deduction || 0),
//       'Refund Amount': Number(row.refundAmount || 0),
//       Status: row.refundStatus === 'paid' ? 'Paid' : 'Pending',
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Cancellations');
//     XLSX.writeFile(
//       workbook,
//       `cancellations-${new Date().toISOString().slice(0, 10)}.xlsx`,
//     );
//   };

//   const handleConfirmPaid = async () => {
//     const row = modal.row;
//     if (!row) return;
//     setConfirming(true);
//     try {
//       await apiAdminMarkCancelRefundPaid(
//         row.orderId,
//         row.lineId,
//         transactionId,
//         getToken(),
//       );
//       setRows((prev) =>
//         prev.map((r) =>
//           r.orderId === row.orderId && r.lineId === row.lineId
//             ? {
//                 ...r,
//                 refundStatus: 'paid',
//                 refundTransactionId: transactionId,
//                 refundPaidAt: new Date(),
//               }
//             : r,
//         ),
//       );
//       setModal({ open: false, row: null });
//       setTransactionId('');
//       fetchRows();
//     } catch (err) {
//       alert(err?.response?.data?.message || 'Failed to confirm payout.');
//     } finally {
//       setConfirming(false);
//     }
//   };

//   return (
//     <div className="p-2 sm:p-4">
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-6">
//         <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
//           <div className="flex items-center gap-2">
//             <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
//               <Wallet className="h-4 w-4" />
//             </span>
//             <p className="text-sm text-gray-600">Total Cancellation Refunds</p>
//           </div>
//           <p className="mt-3 text-3xl font-bold text-blue-700">
//             {money(upcomingTotal)}
//           </p>
//         </div>

//         <div className="rounded-2xl border border-orange-400 bg-orange-50 p-4">
//           <div className="flex items-center gap-2">
//             <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-300 text-orange-600">
//               <Clock3 className="h-4 w-4" />
//             </span>
//             <p className="text-sm text-gray-600">Pending Refunds</p>
//           </div>
//           <p className="mt-3 text-3xl font-bold text-orange-600">
//             {money(pendingTotal)}
//           </p>
//         </div>

//         <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
//           <div className="flex items-center gap-2">
//             <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
//               <CheckCircle2 className="h-4 w-4" />
//             </span>
//             <p className="text-sm text-gray-600">Total Paid Refunds</p>
//           </div>
//           <p className="mt-3 text-3xl font-bold text-emerald-600">
//             {money(paidTotal)}
//           </p>
//         </div>
//       </div>

//       <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
//         <div className="relative flex-1 max-w-lg">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search any Vendor, Customer, or Order ID"
//             className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
//           />
//         </div>
//         <button
//           type="button"
//           onClick={handleExportExcel}
//           disabled={filteredRows.length === 0}
//           className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 sm:ml-auto"
//         >
//           <Download className="w-4 h-4" />
//           Export to Excel
//         </button>
//       </div>

//       <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//         <div className="px-5 py-4 border-b border-gray-100">
//           <h3 className="text-base font-bold text-gray-900">
//             Order Cancellations
//           </h3>
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-14">
//             <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : error ? (
//           <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl m-4">
//             {error}
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-[1100px] w-full text-sm">
//               <thead className="bg-gray-50 border-b border-gray-100">
//                 <tr className="text-gray-500">
//                   <th className="px-4 py-3 text-center font-medium whitespace-nowrap min-w-[110px]">
//                     Order ID
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium">
//                     Customer Name
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium">
//                     Vendor Name
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium">Product</th>
//                   <th className="px-4 py-3 text-center font-medium">
//                     Order Amount
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium">
//                     Deduction
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium">
//                     Refund Amount
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
//                     Cancelled Date
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
//                     Transaction ID
//                   </th>
//                   <th className="px-4 py-3 text-center font-medium">Status</th>
//                   {/* <th className="px-4 py-3 text-center font-medium">Action</th> */}
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageRows.map((row) => {
//                   const isPaid = row.refundStatus === 'paid';
//                   return (
//                     <tr
//                       key={`${row.orderId}-${row.lineId}`}
//                       className="border-t border-gray-100"
//                     >
//                       <td className="px-4 py-3 text-center font-semibold text-gray-900 whitespace-nowrap">
//                         ORD-{String(row.orderNumber || 0).padStart(4, '0')}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-700">
//                         {row.customerName}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-700">
//                         {row.vendorName}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-700">
//                         {row.productName}
//                       </td>
//                       <td className="px-4 py-3 text-center font-semibold text-blue-600">
//                         {money(row.orderAmount)}
//                       </td>
//                       <td className="px-4 py-3 text-center font-semibold text-red-500">
//                         {row.deduction > 0 ? money(row.deduction) : '-'}
//                       </td>
//                       <td className="px-4 py-3 text-center font-semibold text-emerald-700">
//                         {money(row.refundAmount)}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">
//                         {formatDate(row.cancelledAt)}
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-700">
//                         {row.refundTransactionId || '-'}
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         {isPaid ? (
//                           <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
//                             <CheckCircle2 className="w-3 h-3" />
//                             Paid
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//                             <Clock3 className="w-3 h-3" />
//                             Pending
//                           </span>
//                         )}
//                       </td>
//                       {/* <td className="px-4 py-3 text-center">
//                         {isPaid ? (
//                           <span className="text-gray-300 text-xs">—</span>
//                         ) : (
//                           <button
//                             type="button"
//                             onClick={() => setModal({ open: true, row })}
//                             className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
//                           >
//                             Confirm
//                           </button>
//                         )}
//                       </td> */}
//                     </tr>
//                   );
//                 })}
//                 {filteredRows.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={11}
//                       className="px-4 py-10 text-center text-gray-500"
//                     >
//                       No cancelled orders yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {!loading && !error && totalPages > 1 ? (
//           <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
//             <p className="text-xs text-gray-500">
//               Page {safePage} of {totalPages} · {filteredRows.length} results
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 disabled={safePage <= 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>
//               <span className="min-w-[2rem] h-9 px-3 rounded-lg text-sm font-semibold flex items-center justify-center bg-orange-500 text-white">
//                 {safePage}
//               </span>
//               <button
//                 type="button"
//                 disabled={safePage >= totalPages}
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         ) : null}
//       </div>

//       <ConfirmPaidModal
//         open={modal.open}
//         row={modal.row}
//         confirming={confirming}
//         transactionId={transactionId}
//         setTransactionId={setTransactionId}
//         onClose={() => {
//           setModal({ open: false, row: null });
//           setTransactionId('');
//         }}
//         onConfirm={handleConfirmPaid}
//       />
//     </div>
//   );
// };

// export default AdminCancellations;

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  Clock3,
  CheckCircle2,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  apiAdminGetCancelRefunds,
  apiAdminMarkCancelRefundPaid,
  apiRunCancelRefundPayoutNow,
} from '@/service/api';

const PAGE_SIZE = 15;

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

function ConfirmPaidModal({
  open,
  row,
  onClose,
  onConfirm,
  confirming,
  transactionId,
  setTransactionId,
}) {
  if (!open || !row) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Confirm Cancellation Refund
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Customer</span>
            <span className="font-semibold text-gray-900">
              {row.customerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Order Amount</span>
            <span className="font-semibold text-gray-900">
              {money(row.orderAmount)}
            </span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Cancellation Fee</span>
            <span className="font-semibold">
              {row.deduction > 0 ? `- ${money(row.deduction)}` : '₹0'}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-emerald-700">
            <span>Refund Amount to Pay</span>
            <span>{money(row.refundAmount)}</span>
          </div>
        </div>

        {/* <div className="mt-4">
          <label className="text-xs font-medium text-gray-600">
            Refund Transaction ID
          </label>
          <input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction / UTR ID"
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
          />
        </div> */}

        <button
          type="button"
          disabled={confirming}
          onClick={onConfirm}
          className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
        >
          {confirming ? 'Confirming...' : 'Mark as Paid'}
        </button>
      </div>
    </div>
  );
}

const AdminCancellations = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState({ open: false, row: null });
  const [confirming, setConfirming] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [page, setPage] = useState(1);
  const [runningPayout, setRunningPayout] = useState(false);

  const fetchRows = () => {
    setLoading(true);
    setError('');
    apiAdminGetCancelRefunds(getToken())
      .then((res) => setRows(res.data || []))
      .catch((err) =>
        setError(
          err?.response?.data?.message || 'Failed to load cancellations.',
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.vendorName || '')
          .toLowerCase()
          .includes(q) ||
        String(r.customerName || '')
          .toLowerCase()
          .includes(q) ||
        `ORD-${String(r.orderNumber || 0).padStart(4, '0')}`
          .toLowerCase()
          .includes(q),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const upcomingTotal = useMemo(
    () => rows.reduce((s, r) => s + Number(r.refundAmount || 0), 0),
    [rows],
  );
  const pendingTotal = useMemo(
    () =>
      rows
        .filter((r) => r.refundStatus !== 'paid')
        .reduce((s, r) => s + Number(r.refundAmount || 0), 0),
    [rows],
  );
  const paidTotal = useMemo(
    () =>
      rows
        .filter((r) => r.refundStatus === 'paid')
        .reduce((s, r) => s + Number(r.refundAmount || 0), 0),
    [rows],
  );

  const handleExportExcel = () => {
    const exportData = filteredRows.map((row) => ({
      'Order ID': `ORD-${String(row.orderNumber || 0).padStart(4, '0')}`,
      'Customer Name': row.customerName || '-',
      'Vendor Name': row.vendorName || '-',
      Product: row.productName || '-',
      'Order Amount': Number(row.orderAmount || 0),
      Deduction: Number(row.deduction || 0),
      'Refund Amount': Number(row.refundAmount || 0),
      Status: row.refundStatus === 'paid' ? 'Paid' : 'Pending',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cancellations');
    XLSX.writeFile(
      workbook,
      `cancellations-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleRunPayoutNow = async () => {
    setRunningPayout(true);
    try {
      await apiRunCancelRefundPayoutNow(getToken());
      fetchRows();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to run payout batch.');
    } finally {
      setRunningPayout(false);
    }
  };

  const handleConfirmPaid = async () => {
    const row = modal.row;
    if (!row) return;
    setConfirming(true);
    try {
      await apiAdminMarkCancelRefundPaid(
        row.orderId,
        row.lineId,
        transactionId,
        getToken(),
      );
      setRows((prev) =>
        prev.map((r) =>
          r.orderId === row.orderId && r.lineId === row.lineId
            ? {
                ...r,
                refundStatus: 'paid',
                refundTransactionId: transactionId,
                refundPaidAt: new Date(),
              }
            : r,
        ),
      );
      setModal({ open: false, row: null });
      setTransactionId('');
      fetchRows();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to confirm payout.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-6">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Wallet className="h-4 w-4" />
            </span>
            <p className="text-sm text-gray-600">Total Cancellation Refunds</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-blue-700">
            {money(upcomingTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-400 bg-orange-50 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-300 text-orange-600">
              <Clock3 className="h-4 w-4" />
            </span>
            <p className="text-sm text-gray-600">Pending Refunds</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-orange-600">
            {money(pendingTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <p className="text-sm text-gray-600">Total Paid Refunds</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-600">
            {money(paidTotal)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any Vendor, Customer, or Order ID"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
          />
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={filteredRows.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 sm:ml-auto"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
        {/* <button
          type="button"
          onClick={handleRunPayoutNow}
          disabled={runningPayout}
          title="Manually trigger the auto-payout batch (for testing)"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 disabled:opacity-50 shrink-0"
        >
          {runningPayout ? (
            <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : null}
          Run Payout Now
        </button> */}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            Order Cancellations
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl m-4">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="px-4 py-3 text-center font-medium whitespace-nowrap min-w-[110px]">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    Vendor Name
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Product</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Order Amount
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    Deduction
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    Refund Amount
                  </th>
                  <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                    Cancelled Date
                  </th>
                  <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  {/* <th className="px-4 py-3 text-center font-medium">Action</th> */}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const isPaid = row.refundStatus === 'paid';
                  return (
                    <tr
                      key={`${row.orderId}-${row.lineId}`}
                      className="border-t border-gray-100"
                    >
                      <td className="px-4 py-3 text-center font-semibold text-gray-900 whitespace-nowrap">
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
                      <td className="px-4 py-3 text-center font-semibold text-blue-600">
                        {money(row.orderAmount)}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-red-500">
                        {row.deduction > 0 ? money(row.deduction) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-emerald-700">
                        {money(row.refundAmount)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">
                        {formatDate(row.cancelledAt)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {row.refundTransactionId || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock3 className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      {/* <td className="px-4 py-3 text-center">
                        {isPaid ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setModal({ open: true, row })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                          >
                            Confirm
                          </button>
                        )}
                      </td> */}
                    </tr>
                  );
                })}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No cancelled orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {safePage} of {totalPages} · {filteredRows.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="min-w-[2rem] h-9 px-3 rounded-lg text-sm font-semibold flex items-center justify-center bg-orange-500 text-white">
                {safePage}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmPaidModal
        open={modal.open}
        row={modal.row}
        confirming={confirming}
        transactionId={transactionId}
        setTransactionId={setTransactionId}
        onClose={() => {
          setModal({ open: false, row: null });
          setTransactionId('');
        }}
        onConfirm={handleConfirmPaid}
      />
    </div>
  );
};

export default AdminCancellations;
