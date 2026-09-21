// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import {
//   Wallet,
//   Clock3,
//   Search,
//   Eye,
//   Download,
//   RefreshCw,
//   AlertCircle,
//   X,
//   CircleCheck,
//   Clock,
// } from 'lucide-react';
// import jsPDF from 'jspdf';
// import {
//   apiGetAdminSettlements,
//   apiMarkSettlementPaid,
//   apiRunSettlementPayoutNow,
// } from '@/service/api';

// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// function StatusBadge({ status }) {
//   const isPending = status === 'Pending';
//   return (
//     <span
//       title={isPending ? 'Awaiting next auto-settlement run' : 'Paid'}
//       className={`px-3 py-1 rounded-full text-xs font-semibold ${
//         isPending
//           ? 'bg-[#E5E7EB] border-2 border-[#D1D5DC] text-[#64748B]'
//           : 'border-2 border-[#7BF1A8] text-[#00A63E] bg-[#DCFCE7]'
//       }`}
//     >
//       {status}
//     </span>
//   );
// }

// function StatCard({
//   icon: Icon,
//   label,
//   value,
//   loading,
//   colorClass,
//   borderClass,
//   iconBgClass,
//   count,
// }) {
//   return (
//     <div className={`bg-white rounded-xl border p-5 shadow-sm ${borderClass}`}>
//       <div className="flex items-center gap-3">
//         <div
//           className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}
//         >
//           <Icon size={18} className={colorClass} />
//         </div>

//         <span className="text-sm text-[#64748B] font-medium">{label}</span>
//       </div>

//       <div className="flex items-end justify-between mt-4">
//         <h2 className={`text-3xl font-bold ${colorClass}`}>
//           {loading ? (
//             <span className="inline-block w-24 h-8 bg-gray-100 rounded animate-pulse" />
//           ) : (
//             value
//           )}
//         </h2>

//         {count !== undefined ? (
//           <span className={`text-3xl font-bold ${colorClass}`}>
//             {loading ? (
//               <span className="inline-block w-10 h-8 bg-gray-100 rounded animate-pulse" />
//             ) : (
//               `(${count})`
//             )}
//           </span>
//         ) : null}
//       </div>
//     </div>
//   );
// }

// // function downloadRowCsv(row) {
// //   const csv = [
// //     [
// //       'Settlement ID',
// //       'Vendor',
// //       'Period',
// //       'Gross Amount',
// //       'Platform Fee (20%)',
// //       'Net Payout',
// //       'Status',
// //       'Paid At',
// //     ],
// //     [
// //       row.settlementId,
// //       row.vendorName,
// //       row.period,
// //       row.grossAmount,
// //       row.platformFee,
// //       row.netPayout,
// //       row.status,
// //       row.paidAt ? new Date(row.paidAt).toLocaleDateString('en-IN') : '',
// //     ],
// //   ]
// //     .map((r) => r.join(','))
// //     .join('\n');
// //   const blob = new Blob([csv], { type: 'text/csv' });
// //   const a = document.createElement('a');
// //   a.href = URL.createObjectURL(blob);
// //   a.download = `${row.settlementId}.csv`;
// //   a.click();
// //   URL.revokeObjectURL(a.href);
// // }

// const formatINRForPDF = (amount) =>
//   `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

// function downloadRowPDF(row) {
//   const pdf = new jsPDF();
//   let y = 20;

//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Settlement Statement', 14, y);
//   pdf.setFont(undefined, 'normal');

//   y += 10;
//   pdf.setFontSize(10);
//   pdf.setTextColor(120);
//   pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, y);
//   pdf.setTextColor(0);

//   y += 12;
//   pdf.setDrawColor(220);
//   pdf.line(14, y, 196, y);

//   y += 10;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Vendor Details', 14, y);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(11);

//   y += 8;
//   pdf.text(`Vendor Name: ${row.vendorName || '—'}`, 14, y);

//   y += 12;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Settlement Details', 14, y);

//   y += 8;
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(11);
//   pdf.text(`Settlement ID: ${row.settlementId || '—'}`, 14, y);
//   y += 7;
//   pdf.text(`Period: ${row.period || '—'}`, 14, y);
//   y += 7;
//   pdf.text(
//     `Total Orders: ${row.orderCount || (row.rows ? row.rows.length : 0)}`,
//     14,
//     y,
//   );
//   y += 7;
//   pdf.text(`Status: ${row.status || '—'}`, 14, y);

//   if (Array.isArray(row.rows) && row.rows.length) {
//     y += 12;
//     pdf.setFontSize(13);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('Orders in this Period', 14, y);
//     pdf.setFont(undefined, 'normal');
//     pdf.setFontSize(9);

//     y += 8;
//     pdf.setFillColor(245, 247, 250);
//     pdf.rect(14, y - 5, 182, 8, 'F');
//     pdf.setFontSize(8);
//     pdf.text('Order ID', 16, y);
//     pdf.text('Business amount', 78, y);
//     pdf.text('Deduction', 110, y);
//     pdf.text('Net Payout', 138, y);
//     pdf.text('Transaction ID', 196, y, { align: 'right' });

//     y += 8;
//     row.rows.forEach((orderRow) => {
//       if (y > 275) {
//         pdf.addPage();
//         y = 20;
//       }
//       // const orderLabel =
//       //   orderRow.orderId?.orderNumber != null
//       //     ? `ORD-${String(orderRow.orderId.orderNumber).padStart(4, '0')}`
//       //     : orderRow.orderNumber != null
//       //       ? `ORD-${String(orderRow.orderNumber).padStart(4, '0')}`
//       //       : orderRow.orderId?._id
//       //         ? `ORD-${String(orderRow.orderId._id).slice(-6).toUpperCase()}`
//       //         : orderRow.orderId
//       //           ? `ORD-${String(orderRow.orderId).slice(-6).toUpperCase()}`
//       //           : orderRow.settlementId || '—';
//       const orderLabel = `ORD-${String(
//         orderRow.orderId?.orderNumber ?? orderRow.orderNumber ?? 0,
//       ).padStart(4, '0')}`;
//       pdf.text(String(orderLabel), 16, y);
//       pdf.text(formatINRForPDF(orderRow.grossAmount), 78, y);
//       pdf.text(`- ${formatINRForPDF(orderRow.platformFee)}`, 110, y);
//       pdf.text(formatINRForPDF(orderRow.netPayout), 138, y);
//       pdf.text(orderRow.transactionId || '—', 196, y, { align: 'right' });
//       y += 7;
//     });
//     pdf.setFontSize(9);

//     y += 4;
//     pdf.setDrawColor(220);
//     pdf.line(14, y, 196, y);
//     y += 6;
//   } else {
//     y += 12;
//   }

//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Amount Breakdown', 14, y);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(11);

//   y += 10;
//   pdf.setFillColor(245, 247, 250);
//   pdf.rect(14, y - 6, 182, 10, 'F');
//   pdf.text('Description', 18, y);
//   pdf.text('Amount', 178, y, { align: 'right' });

//   y += 10;
//   pdf.text('Total', 18, y);
//   pdf.text(formatINRForPDF(row.grossAmount), 178, y, { align: 'right' });

//   y += 8;
//   pdf.text('Deduction', 18, y);
//   pdf.setTextColor(200, 60, 60);
//   pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 178, y, { align: 'right' });
//   pdf.setTextColor(0);

//   y += 4;
//   pdf.setDrawColor(220);
//   pdf.line(14, y, 196, y);

//   y += 8;
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Net Payout', 18, y);
//   pdf.setTextColor(16, 150, 100);
//   pdf.text(formatINRForPDF(row.netPayout), 178, y, { align: 'right' });
//   pdf.setTextColor(0);

//   y += 16;
//   pdf.setFontSize(9);
//   pdf.setTextColor(140);
//   pdf.text('This is a system-generated statement.', 14, y);

//   pdf.save(
//     `settlement-${(row.period || 'statement').replace(/\s+/g, '-')}.pdf`,
//   );
// }

// function downloadAllCsv(settlements) {
//   if (!settlements.length) return;
//   const header = [
//     'Settlement ID',
//     'Vendor',
//     'Period',
//     'Gross Amount',
//     'Platform Fee',
//     'Net Payout',
//     'Status',
//     'Paid At',
//   ];
//   const rows = settlements.map((r) =>
//     [
//       r.settlementId,
//       r.vendorName,
//       r.period,
//       r.grossAmount,
//       r.platformFee,
//       r.netPayout,
//       r.status,
//       r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN') : '',
//     ].join(','),
//   );
//   const blob = new Blob([[header.join(','), ...rows].join('\n')], {
//     type: 'text/csv',
//   });
//   const a = document.createElement('a');
//   a.href = URL.createObjectURL(blob);
//   a.download = `settlements_${new Date().toISOString().slice(0, 10)}.csv`;
//   a.click();
//   URL.revokeObjectURL(a.href);
// }

// export default function Settlements() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [data, setData] = useState(null);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [currentPage, setCurrentPage] = useState(1);
//   const ROWS_PER_PAGE = 10;

//   const fetchSettlements = async () => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       setError('Please log in again.');
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const res = await apiGetAdminSettlements(token);
//       console.log('Sample settlement record:', res.data?.settlements?.[0]);
//       setData(res.data);
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Failed to load settlements.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSettlements();
//   }, []);

//   const handleRunPayoutNow = async () => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) return;
//     setRunningPayout(true);
//     try {
//       await apiRunSettlementPayoutNow(token);
//       await fetchSettlements();
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Failed to run payout batch.');
//     } finally {
//       setRunningPayout(false);
//     }
//   };

//   // const handleMarkPaid = async () => {
//   //   if (!confirmRow) return;
//   //   const token =
//   //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//   //   if (!token) return;
//   //   setMarking(true);
//   //   try {
//   //     await apiMarkSettlementPaid(confirmRow._id, token);

//   //     setData((prev) => {
//   //       if (!prev) return prev;
//   //       const updated = prev.settlements.map((s) =>
//   //         s._id === confirmRow._id
//   //           ? { ...s, status: 'Paid', paidAt: new Date().toISOString() }
//   //           : s,
//   //       );
//   //       const totalPaid = updated
//   //         .filter((s) => s.status === 'Paid')
//   //         .reduce((a, s) => a + s.netPayout, 0);
//   //       const totalPending = updated
//   //         .filter((s) => s.status === 'Pending')
//   //         .reduce((a, s) => a + s.netPayout, 0);
//   //       return {
//   //         settlements: updated,
//   //         summary: {
//   //           ...prev.summary,
//   //           totalPaid,
//   //           totalPending,
//   //           // upcoming: totalPending,
//   //           upcoming: updated.reduce(
//   //             (total, item) => total + Number(item.netPayout || 0),
//   //             0,
//   //           ),
//   //           paidCount: updated.filter((s) => s.status === 'Paid').length,
//   //           pendingCount: updated.filter((s) => s.status === 'Pending').length,
//   //         },
//   //       };
//   //     });
//   //     setConfirmRow(null);
//   //   } catch (err) {
//   //     setError(err?.response?.data?.message || 'Failed to update settlement.');
//   //   } finally {
//   //     setMarking(false);
//   //   }
//   // };

//   // const filtered = useMemo(() => {
//   //   const all = data?.settlements || [];
//   //   const q = search.trim().toLowerCase();
//   //   return all.filter((s) => {
//   //     const matchSearch =
//   //       !q ||
//   //       s.vendorName.toLowerCase().includes(q) ||
//   //       s.settlementId.toLowerCase().includes(q);
//   //     const matchStatus = statusFilter === 'All' || s.status === statusFilter;
//   //     return matchSearch && matchStatus;
//   //   });
//   // }, [data, search, statusFilter]);

//   const filtered = useMemo(() => {
//     const all = data?.settlements || [];
//     const q = search.trim().toLowerCase();
//     return all.filter((s) => {
//       const matchSearch =
//         !q ||
//         s.vendorName.toLowerCase().includes(q) ||
//         s.settlementId.toLowerCase().includes(q);
//       const matchStatus = statusFilter === 'All' || s.status === statusFilter;
//       return matchSearch && matchStatus;
//     });
//   }, [data, search, statusFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
//   const paginatedFiltered = useMemo(() => {
//     const start = (currentPage - 1) * ROWS_PER_PAGE;
//     return filtered.slice(start, start + ROWS_PER_PAGE);
//   }, [filtered, currentPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, statusFilter]);

//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(1);
//   }, [totalPages, currentPage]);

//   // const summary = data?.summary || {};
//   const summary = useMemo(() => {
//     const settlements = data?.settlements || [];

//     const upcoming = settlements.reduce(
//       (total, item) => total + Number(item.netPayout || 0),
//       0,
//     );

//     const totalPending = settlements
//       .filter((item) => item.status === 'Pending')
//       .reduce((total, item) => total + Number(item.netPayout || 0), 0);

//     const totalPaid = settlements
//       .filter((item) => item.status === 'Paid')
//       .reduce((total, item) => total + Number(item.netPayout || 0), 0);

//     //   return {
//     //     upcoming, // All Net Payout total (Pending + Paid)
//     //     totalPending, // Only Pending Net Payout total
//     //     totalPaid, // Only Paid Net Payout total
//     //     pendingCount: settlements.filter((item) => item.status === 'Pending')
//     //       .length,
//     //     paidCount: settlements.filter((item) => item.status === 'Paid').length,
//     //   };
//     // }, [data]);

//     return {
//       upcoming, // All Net Payout total (Pending + Paid)
//       totalPending, // Only Pending Net Payout total
//       totalPaid, // Only Paid Net Payout total
//       pendingCount: settlements.filter((item) => item.status === 'Pending')
//         .length,
//       paidCount: settlements.filter((item) => item.status === 'Paid').length,
//     };
//   }, [data]);

//   // Count of orders/settlement-lines that fall in the same vendor + payout
//   // period as each row, so every row can show "how many orders in this
//   // specific pay period" without changing the underlying row structure.
//   const periodOrderCounts = useMemo(() => {
//     const all = data?.settlements || [];
//     const counts = {};
//     for (const s of all) {
//       const key = `${s.vendorId}-${s.period}`;
//       counts[key] = (counts[key] || 0) + 1;
//     }
//     return counts;
//   }, [data]);

//   const groupedFiltered = useMemo(() => {
//     const groups = new Map();
//     filtered.forEach((s) => {
//       const key = `${s.vendorId}-${s.period}`;
//       if (!groups.has(key)) {
//         groups.set(key, {
//           _groupKey: key,
//           settlementId: s.settlementId,
//           vendorName: s.vendorName,
//           period: s.period,
//           orderCount: 0,
//           grossAmount: 0,
//           platformFee: 0,
//           netPayout: 0,
//           paidAt: s.paidAt,
//           transactionId: s.transactionId,
//           status: s.status,
//           rows: [],
//         });
//       }
//       const g = groups.get(key);
//       g.orderCount += 1;
//       g.grossAmount += Number(s.grossAmount || 0);
//       g.platformFee += Number(s.platformFee || 0);
//       g.netPayout += Number(s.netPayout || 0);
//       g.rows.push(s);
//       // If any row in the group is Pending, group is Pending
//       if (s.status === 'Pending') g.status = 'Pending';
//       // Use the latest paidAt
//       if (s.paidAt && (!g.paidAt || new Date(s.paidAt) > new Date(g.paidAt)))
//         g.paidAt = s.paidAt;
//       if (s.transactionId && !g.transactionId)
//         g.transactionId = s.transactionId;
//     });
//     return Array.from(groups.values());
//   }, [filtered]);

//   const groupedTotalPages = Math.max(
//     1,
//     Math.ceil(groupedFiltered.length / ROWS_PER_PAGE),
//   );
//   const paginatedGrouped = useMemo(() => {
//     const start = (currentPage - 1) * ROWS_PER_PAGE;
//     return groupedFiltered.slice(start, start + ROWS_PER_PAGE);
//   }, [groupedFiltered, currentPage]);

//   return (
//     <div className="p-6 pt-3 bg-gray-50 min-h-screen">
//       {/* Heading */}
//       {/* <div className="flex items-start justify-between gap-4">

//         <div className="flex gap-2">
//           <button
//             type="button"
//             onClick={() => downloadAllCsv(data?.settlements || [])}
//             disabled={loading || !data?.settlements?.length}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40"
//           >
//             <Download size={15} />
//             Export all
//           </button>
//           <button
//             type="button"
//             onClick={fetchSettlements}
//             disabled={loading}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
//           >
//             <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
//             Refresh
//           </button>
//         </div>
//       </div> */}

//       {/* Error */}
//       {error && (
//         <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           <AlertCircle size={16} className="shrink-0" />
//           {error}
//           <button
//             type="button"
//             className="ml-auto text-red-400 hover:text-red-700"
//             onClick={() => setError('')}
//           >
//             <X size={14} />
//           </button>
//         </div>
//       )}

//       {/* Stat cards */}
//       {/* <h2 className="font-semibold mt-8 mb-4">Settlement Overview</h2>
//       <div className="grid lg:grid-cols-3 gap-5">
//         <StatCard
//           icon={Wallet}
//           label="Upcoming Settlement"
//           value={money(summary.upcoming)}
//           loading={loading}
//           colorClass="text-[#2563EB]"
//           borderClass="border-[#BEDBFF]"
//           iconBgClass="bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]"
//         />
//         <StatCard
//           icon={Clock3}
//           label="Pending Settlements"
//           value={money(summary.totalPending)}
//           loading={loading}
//           colorClass="text-[#F97316]"
//           borderClass="border-[#FFD6A8]"
//           iconBgClass="bg-gradient-to-br from-[#FFEDD4] to-[#FFE2E2]"
//         />
//         <StatCard
//           icon={CircleCheck}
//           label="Total Paid Settlements"
//           value={money(summary.totalPaid)}
//           loading={loading}
//           colorClass="text-[#10B981]"
//           borderClass="border-[#B9F8CF]"
//           iconBgClass="bg-gradient-to-br from-[#DCFCE7] to-[#D0FAE5]"
//         />
//       </div> */}

//       <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-5 items-center">
//         {/* Upcoming Settlement */}
//         <StatCard
//           icon={Wallet}
//           label="Upcoming Settlement"
//           value={money(summary.upcoming)}
//           loading={loading}
//           colorClass="text-[#2563EB]"
//           borderClass="border-[#BEDBFF]"
//           iconBgClass="bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]"
//         />

//         {/* Minus Icon */}
//         <div className="hidden lg:flex items-center justify-center">
//           <div className="w-10 h-10 rounded-full bg-[#E5E7EB] border flex items-center justify-center text-xl font-bold text-[#64748B]">
//             −
//           </div>
//         </div>

//         {/* Pending Settlements */}
//         <StatCard
//           icon={Clock3}
//           label="Pending Settlements"
//           value={money(summary.totalPending)}
//           loading={loading}
//           colorClass="text-[#F97316]"
//           borderClass="border-[#FFD6A8]"
//           iconBgClass="bg-gradient-to-br from-[#FFEDD4] to-[#FFE2E2]"
//           count={summary.pendingCount ?? 0}
//         />

//         {/* Equal Icon */}
//         <div className="hidden lg:flex items-center justify-center">
//           <div className="w-10 h-10 rounded-full bg-[#E5E7EB] border flex items-center justify-center text-xl font-bold text-[#64748B]">
//             =
//           </div>
//         </div>

//         {/* Total Paid Settlements */}
//         <StatCard
//           icon={CircleCheck}
//           label="Total Paid Settlements"
//           value={money(summary.totalPaid)}
//           loading={loading}
//           colorClass="text-[#10B981]"
//           borderClass="border-[#B9F8CF]"
//           iconBgClass="bg-gradient-to-br from-[#DCFCE7] to-[#D0FAE5]"
//           count={summary.paidCount ?? 0}
//         />
//       </div>

//       {/* Search + filter */}
//       <div className="mt-4 flex flex-col sm:flex-row gap-3">
//         <div className="relative flex-1">
//           <Search size={16} className="absolute left-4 top-4 text-gray-400" />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by vendor or settlement ID"
//             className="w-full pl-11 pr-4 py-3 border rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
//           />
//         </div>
//         {/* <div className="flex gap-2 items-center">
//           {['All', 'Pending', 'Paid'].map((f) => (
//             <button
//               key={f}
//               type="button"
//               onClick={() => setStatusFilter(f)}
//               className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
//                 statusFilter === f
//                   ? f === 'Paid'
//                     ? 'bg-[#DCFCE7] text-[#00A63E] border-[#7BF1A8]'
//                     : f === 'Pending'
//                       ? 'bg-[#E5E7EB] text-[#64748B] border-[#D1D5DC]'
//                       : 'bg-blue-100 text-blue-700 border-blue-300'
//                   : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
//               }`}
//             >
//               {f}
//             </button>
//           ))}
//         </div>
//       </div> */}
//         <div className="flex flex-wrap gap-2 items-center">
//           {['All', 'Pending', 'Paid'].map((f) => (
//             <button
//               key={f}
//               type="button"
//               onClick={() => setStatusFilter(f)}
//               className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
//                 statusFilter === f
//                   ? f === 'Paid'
//                     ? 'bg-[#DCFCE7] text-[#00A63E] border-[#7BF1A8]'
//                     : f === 'Pending'
//                       ? 'bg-[#E5E7EB] text-[#64748B] border-[#D1D5DC]'
//                       : 'bg-blue-100 text-blue-700 border-blue-300'
//                   : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
//               }`}
//             >
//               {f}
//             </button>
//           ))}
//           <button
//             type="button"
//             onClick={() => downloadAllCsv(data?.settlements || [])}
//             disabled={loading || !data?.settlements?.length}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40"
//           >
//             <Download size={15} />
//             Export all
//           </button>
//           <button
//             type="button"
//             onClick={fetchSettlements}
//             disabled={loading}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
//           >
//             <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
//             Refresh
//           </button>
//           {/* <button
//             type="button"
//             onClick={handleRunPayoutNow}
//             disabled={runningPayout || loading}
//             title="Manually trigger the auto-payout batch (for testing)"
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 disabled:opacity-50"
//           >
//             {runningPayout ? (
//               <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
//             ) : null}
//             Run Payout Now
//           </button> */}
//         </div>
//       </div>

//       {/* Count cards */}
//       {/* <div className="grid md:grid-cols-2 gap-5 mt-6">
//         <div className="bg-white border border-[#B9F8CF] rounded-xl p-5">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#DCFCE7] to-[#D0FAE5] flex items-center justify-center">
//               <CircleCheck className="w-5 h-5 text-[#10B981]" />
//             </div>

//             <p className="text-[#64748B] font-medium">Paid Settlements</p>
//           </div>

//           <h2 className="text-3xl font-bold text-[#10B981] mt-3">
//             {loading ? '…' : (summary.paidCount ?? 0)}
//           </h2>
//         </div>
//         <div className="bg-white border border-[#FFD6A8] rounded-xl p-5">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFEDD4] to-[#FFE2E2] flex items-center justify-center">
//               <Clock className="w-5 h-5 text-[#F97316]" />
//             </div>

//             <p className="text-[#64748B] font-medium">Pending Settlements</p>
//           </div>

//           <h2 className="text-3xl font-bold text-[#F97316] mt-3">
//             {loading ? '…' : (summary.pendingCount ?? 0)}
//           </h2>
//         </div>
//       </div> */}

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow mt-8">
//         <div className="p-5 border-b flex items-center justify-between gap-2">
//           <div>
//             <h2 className="font-semibold text-lg">Settlement Tracking</h2>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[1000px]">
//             <thead className="bg-gray-50">
//               <tr className="text-center text-[#64748B] text-xs uppercase">
//                 <th className="p-4">Settlement ID</th>
//                 <th className="p-4">Vendor Name</th>
//                 <th className="p-4">Payout Period</th>
//                 <th className="p-4">Orders Count</th>
//                 <th className="p-4">Business Amount</th>
//                 <th className="p-4">Deductions </th>
//                 <th className="p-4">Net Payout</th>
//                 <th className="p-4">Date</th>
//                 <th className="p-4">Transaction ID</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 Array.from({ length: 4 }).map((_, i) => (
//                   <tr key={i} className="border-t">
//                     {Array.from({ length: 11 }).map((__, j) => (
//                       <td key={j} className="p-4 text-center">
//                         <div className="h-4 bg-gray-100 rounded animate-pulse w-20 mx-auto" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : filtered.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={11}
//                     className="p-12 text-center text-gray-400 text-sm"
//                   >
//                     {search || statusFilter !== 'All'
//                       ? 'No settlements match your filters.'
//                       : 'No settlement records yet. They are generated automatically from delivered and completed orders.'}
//                   </td>
//                 </tr>
//               ) : (
//                 // ) : (
//                 //   filtered.map((item) => (
//                 paginatedGrouped.map((item) => (
//                   <tr
//                     key={item._groupKey}
//                     className="border-t hover:bg-gray-50"
//                   >
//                     <td className="p-4 text-center font-mono text-sm text-[#0F172A] whitespace-nowrap">
//                       {item.settlementId}
//                     </td>
//                     <td className="p-4 text-center font-medium text-[#0F172A]">
//                       {item.vendorName}
//                     </td>
//                     <td className="p-4 text-center text-[#64748B] text-sm whitespace-nowrap">
//                       {item.period}
//                     </td>
//                     <td className="p-4 text-center font-semibold text-[#0F172A]">
//                       {item.orderCount}
//                     </td>
//                     <td className="p-4 text-center font-semibold text-[#2563EB]">
//                       {money(item.grossAmount)}
//                     </td>
//                     <td className="p-4 text-center font-semibold text-[#E7000B]">
//                       − {money(item.platformFee)}
//                     </td>
//                     <td className="p-4 text-center font-semibold text-[#10B981]">
//                       {money(item.netPayout)}
//                     </td>
//                     <td className="p-4 text-center text-sm text-gray-500 whitespace-nowrap">
//                       {item.paidAt
//                         ? new Date(item.paidAt).toLocaleDateString('en-IN', {
//                             day: 'numeric',
//                             month: 'short',
//                             year: 'numeric',
//                           })
//                         : '—'}
//                     </td>
//                     <td className="p-4 text-center text-sm font-mono text-gray-600">
//                       {item.transactionId || '—'}
//                     </td>
//                     <td className="p-4 text-center">
//                       <StatusBadge status={item.status} />
//                     </td>
//                     <td className="p-4 text-center">
//                       <div className="flex gap-2 justify-center">
//                         <button
//                           type="button"
//                           title="Download PDF"
//                           onClick={() => downloadRowPDF(item)}
//                           className="p-2 rounded-lg bg-[#DCFCE7] text-[#00A63E] hover:bg-green-200"
//                         >
//                           <Download size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {!loading && groupedFiltered.length > ROWS_PER_PAGE ? (
//           <div className="flex items-center justify-between px-5 py-4 border-t">
//             <p className="text-xs text-gray-500">
//               Page {currentPage} of {groupedTotalPages}
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 disabled={currentPage <= 1}
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-40"
//               >
//                 Previous
//               </button>
//               <button
//                 type="button"
//                 disabled={currentPage >= groupedTotalPages}
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(groupedTotalPages, p + 1))
//                 }
//                 className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-40"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Wallet,
  Clock3,
  Search,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  X,
  CircleCheck,
  Clock,
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  apiGetAdminSettlements,
  apiMarkSettlementPaid,
  apiRunSettlementPayoutNow,
} from '@/service/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function StatusBadge({ status }) {
  const isPending = status === 'Pending';
  return (
    <span
      title={isPending ? 'Awaiting next auto-settlement run' : 'Paid'}
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isPending
          ? 'bg-[#E5E7EB] border-2 border-[#D1D5DC] text-[#64748B]'
          : 'border-2 border-[#7BF1A8] text-[#00A63E] bg-[#DCFCE7]'
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  colorClass,
  borderClass,
  iconBgClass,
  count,
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm ${borderClass}`}>
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}
        >
          <Icon size={18} className={colorClass} />
        </div>

        <span className="text-sm text-[#64748B] font-medium">{label}</span>
      </div>

      <div className="flex items-end justify-between mt-4">
        <h2 className={`text-3xl font-bold ${colorClass}`}>
          {loading ? (
            <span className="inline-block w-24 h-8 bg-gray-100 rounded animate-pulse" />
          ) : (
            value
          )}
        </h2>

        {count !== undefined ? (
          <span className={`text-3xl font-bold ${colorClass}`}>
            {loading ? (
              <span className="inline-block w-10 h-8 bg-gray-100 rounded animate-pulse" />
            ) : (
              `(${count})`
            )}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// function downloadRowCsv(row) {
//   const csv = [
//     [
//       'Settlement ID',
//       'Vendor',
//       'Period',
//       'Gross Amount',
//       'Platform Fee (20%)',
//       'Net Payout',
//       'Status',
//       'Paid At',
//     ],
//     [
//       row.settlementId,
//       row.vendorName,
//       row.period,
//       row.grossAmount,
//       row.platformFee,
//       row.netPayout,
//       row.status,
//       row.paidAt ? new Date(row.paidAt).toLocaleDateString('en-IN') : '',
//     ],
//   ]
//     .map((r) => r.join(','))
//     .join('\n');
//   const blob = new Blob([csv], { type: 'text/csv' });
//   const a = document.createElement('a');
//   a.href = URL.createObjectURL(blob);
//   a.download = `${row.settlementId}.csv`;
//   a.click();
//   URL.revokeObjectURL(a.href);
// }

const formatINRForPDF = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

function downloadRowPDF(row) {
  const pdf = new jsPDF();
  let y = 20;

  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('Settlement Statement', 14, y);
  pdf.setFont(undefined, 'normal');

  y += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(120);
  pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, y);
  pdf.setTextColor(0);

  y += 12;
  pdf.setDrawColor(220);
  pdf.line(14, y, 196, y);

  y += 10;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Vendor Details', 14, y);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);

  y += 8;
  pdf.text(`Vendor Name: ${row.vendorName || '—'}`, 14, y);

  y += 12;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Settlement Details', 14, y);

  y += 8;
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);
  pdf.text(`Settlement ID: ${row.settlementId || '—'}`, 14, y);
  y += 7;
  pdf.text(`Period: ${row.period || '—'}`, 14, y);
  y += 7;
  pdf.text(
    `Total Orders: ${row.orderCount || (row.rows ? row.rows.length : 0)}`,
    14,
    y,
  );
  y += 7;
  pdf.text(`Status: ${row.status || '—'}`, 14, y);

  if (Array.isArray(row.rows) && row.rows.length) {
    y += 12;
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text('Orders in this Period', 14, y);
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);

    // y += 8;
    // pdf.setFillColor(245, 247, 250);
    // pdf.rect(14, y - 5, 182, 8, 'F');
    // pdf.setFontSize(8);
    // pdf.text('Order ID', 16, y);
    // pdf.text('Business amount', 78, y);
    // pdf.text('Deduction', 110, y);
    // pdf.text('Net Payout', 138, y);
    // pdf.text('Transaction ID', 196, y, { align: 'right' });

    // y += 8;
    // row.rows.forEach((orderRow) => {
    //   if (y > 275) {
    //     pdf.addPage();
    //     y = 20;
    //   }

    //   const orderLabel = `ORD-${String(
    //     orderRow.orderId?.orderNumber ?? orderRow.orderNumber ?? 0,
    //   ).padStart(4, '0')}`;
    //   pdf.text(String(orderLabel), 16, y);
    //   pdf.text(formatINRForPDF(orderRow.grossAmount), 78, y);
    //   pdf.text(`- ${formatINRForPDF(orderRow.platformFee)}`, 110, y);
    //   pdf.text(formatINRForPDF(orderRow.netPayout), 138, y);
    //   pdf.text(orderRow.transactionId || '—', 196, y, { align: 'right' });
    //   y += 7;
    // });

    y += 8;
    pdf.setFillColor(245, 247, 250);
    pdf.rect(14, y - 5, 182, 8, 'F');
    pdf.setFontSize(8);
    pdf.text('Order ID', 16, y);
    pdf.text('Business amt', 58, y);
    pdf.text('Deduction', 86, y);
    pdf.text('Refund Ded.', 114, y);
    pdf.text('Net Payout', 146, y);
    pdf.text('Txn ID', 196, y, { align: 'right' });

    y += 8;
    row.rows.forEach((orderRow) => {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }
      const orderLabel = `ORD-${String(
        orderRow.orderId?.orderNumber ?? orderRow.orderNumber ?? 0,
      ).padStart(4, '0')}`;
      pdf.text(String(orderLabel), 16, y);
      pdf.text(formatINRForPDF(orderRow.grossAmount), 58, y);
      pdf.text(`- ${formatINRForPDF(orderRow.platformFee)}`, 86, y);
      pdf.text(
        orderRow.refundAmount > 0
          ? `- ${formatINRForPDF(orderRow.refundAmount)}`
          : '—',
        114,
        y,
      );
      pdf.text(formatINRForPDF(orderRow.netPayout), 146, y);
      pdf.text(orderRow.transactionId || '—', 196, y, { align: 'right' });
      y += 7;
    });
    pdf.setFontSize(9);

    y += 4;
    pdf.setDrawColor(220);
    pdf.line(14, y, 196, y);
    y += 6;
  } else {
    y += 12;
  }

  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Amount Breakdown', 14, y);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);

  y += 10;
  pdf.setFillColor(245, 247, 250);
  pdf.rect(14, y - 6, 182, 10, 'F');
  pdf.text('Description', 18, y);
  pdf.text('Amount', 178, y, { align: 'right' });

  y += 10;
  pdf.text('Total', 18, y);
  pdf.text(formatINRForPDF(row.grossAmount), 178, y, { align: 'right' });

  y += 8;
  pdf.text('Deduction', 18, y);
  pdf.setTextColor(200, 60, 60);
  pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 178, y, { align: 'right' });
  pdf.setTextColor(0);

  y += 4;
  pdf.setDrawColor(220);
  pdf.line(14, y, 196, y);

  y += 8;
  pdf.setFont(undefined, 'bold');
  pdf.text('Net Payout', 18, y);
  pdf.setTextColor(16, 150, 100);
  pdf.text(formatINRForPDF(row.netPayout), 178, y, { align: 'right' });
  pdf.setTextColor(0);

  y += 16;
  pdf.setFontSize(9);
  pdf.setTextColor(140);
  pdf.text('This is a system-generated statement.', 14, y);

  pdf.save(
    `settlement-${(row.period || 'statement').replace(/\s+/g, '-')}.pdf`,
  );
}

function downloadAllCsv(settlements) {
  if (!settlements.length) return;
  const header = [
    'Settlement ID',
    'Vendor',
    'Period',
    'Gross Amount',
    'Platform Fee',
    'Net Payout',
    'Status',
    'Paid At',
  ];
  const rows = settlements.map((r) =>
    [
      r.settlementId,
      r.vendorName,
      r.period,
      r.grossAmount,
      r.platformFee,
      r.netPayout,
      r.status,
      r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN') : '',
    ].join(','),
  );
  const blob = new Blob([[header.join(','), ...rows].join('\n')], {
    type: 'text/csv',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `settlements_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Settlements() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const fetchSettlements = async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setError('Please log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiGetAdminSettlements(token);
      console.log('Sample settlement record:', res.data?.settlements?.[0]);
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load settlements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleRunPayoutNow = async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) return;
    setRunningPayout(true);
    try {
      await apiRunSettlementPayoutNow(token);
      await fetchSettlements();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to run payout batch.');
    } finally {
      setRunningPayout(false);
    }
  };

  // const handleMarkPaid = async () => {
  //   if (!confirmRow) return;
  //   const token =
  //     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  //   if (!token) return;
  //   setMarking(true);
  //   try {
  //     await apiMarkSettlementPaid(confirmRow._id, token);

  //     setData((prev) => {
  //       if (!prev) return prev;
  //       const updated = prev.settlements.map((s) =>
  //         s._id === confirmRow._id
  //           ? { ...s, status: 'Paid', paidAt: new Date().toISOString() }
  //           : s,
  //       );
  //       const totalPaid = updated
  //         .filter((s) => s.status === 'Paid')
  //         .reduce((a, s) => a + s.netPayout, 0);
  //       const totalPending = updated
  //         .filter((s) => s.status === 'Pending')
  //         .reduce((a, s) => a + s.netPayout, 0);
  //       return {
  //         settlements: updated,
  //         summary: {
  //           ...prev.summary,
  //           totalPaid,
  //           totalPending,
  //           // upcoming: totalPending,
  //           upcoming: updated.reduce(
  //             (total, item) => total + Number(item.netPayout || 0),
  //             0,
  //           ),
  //           paidCount: updated.filter((s) => s.status === 'Paid').length,
  //           pendingCount: updated.filter((s) => s.status === 'Pending').length,
  //         },
  //       };
  //     });
  //     setConfirmRow(null);
  //   } catch (err) {
  //     setError(err?.response?.data?.message || 'Failed to update settlement.');
  //   } finally {
  //     setMarking(false);
  //   }
  // };

  // const filtered = useMemo(() => {
  //   const all = data?.settlements || [];
  //   const q = search.trim().toLowerCase();
  //   return all.filter((s) => {
  //     const matchSearch =
  //       !q ||
  //       s.vendorName.toLowerCase().includes(q) ||
  //       s.settlementId.toLowerCase().includes(q);
  //     const matchStatus = statusFilter === 'All' || s.status === statusFilter;
  //     return matchSearch && matchStatus;
  //   });
  // }, [data, search, statusFilter]);

  const filtered = useMemo(() => {
    const all = data?.settlements || [];
    const q = search.trim().toLowerCase();
    return all.filter((s) => {
      const matchSearch =
        !q ||
        s.vendorName.toLowerCase().includes(q) ||
        s.settlementId.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginatedFiltered = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // const summary = data?.summary || {};
  const summary = useMemo(() => {
    const settlements = data?.settlements || [];
    // Backend netPayout = (rent - fee) only; add the deposit back in so
    // these cards reflect the full amount reaching the vendor's bank.
    const withDeposit = (item) =>
      Number(item.netPayout || 0) + Number(item.depositAmount || 0);

    const upcoming = settlements.reduce(
      (total, item) => total + withDeposit(item),
      0,
    );

    const totalPending = settlements
      .filter((item) => item.status === 'Pending')
      .reduce((total, item) => total + withDeposit(item), 0);

    const totalPaid = settlements
      .filter((item) => item.status === 'Paid')
      .reduce((total, item) => total + withDeposit(item), 0);

    //   return {
    //     upcoming, // All Net Payout total (Pending + Paid)
    //     totalPending, // Only Pending Net Payout total
    //     totalPaid, // Only Paid Net Payout total
    //     pendingCount: settlements.filter((item) => item.status === 'Pending')
    //       .length,
    //     paidCount: settlements.filter((item) => item.status === 'Paid').length,
    //   };
    // }, [data]);

    return {
      upcoming, // All Net Payout total (Pending + Paid)
      totalPending, // Only Pending Net Payout total
      totalPaid, // Only Paid Net Payout total
      pendingCount: settlements.filter((item) => item.status === 'Pending')
        .length,
      paidCount: settlements.filter((item) => item.status === 'Paid').length,
    };
  }, [data]);

  // Count of orders/settlement-lines that fall in the same vendor + payout
  // period as each row, so every row can show "how many orders in this
  // specific pay period" without changing the underlying row structure.
  const periodOrderCounts = useMemo(() => {
    const all = data?.settlements || [];
    const counts = {};
    for (const s of all) {
      const key = `${s.vendorId}-${s.period}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [data]);

  const groupedFiltered = useMemo(() => {
    const groups = new Map();
    filtered.forEach((s) => {
      const key = `${s.vendorId}-${s.period}`;
      // if (!groups.has(key)) {
      //   groups.set(key, {
      //     _groupKey: key,
      //     settlementId: s.settlementId,
      //     vendorName: s.vendorName,
      //     period: s.period,
      //     orderCount: 0,
      //     grossAmount: 0,
      //     platformFee: 0,
      //     netPayout: 0,
      //     paidAt: s.paidAt,
      //     transactionId: s.transactionId,
      //     status: s.status,
      //     rows: [],
      //   });
      // }

      // const g = groups.get(key);
      // g.orderCount += 1;
      // g.grossAmount += Number(s.grossAmount || 0);
      // g.platformFee += Number(s.platformFee || 0);
      // g.refundAmount = (g.refundAmount || 0) + Number(s.refundAmount || 0);
      // g.netPayout += Number(s.netPayout || 0);
      // g.rows.push(s);
      if (!groups.has(key)) {
        groups.set(key, {
          _groupKey: key,
          settlementId: s.settlementId,
          vendorName: s.vendorName,
          period: s.period,
          orderCount: 0,
          grossAmount: 0,
          platformFee: 0,
          netPayout: 0,
          paidAt: s.paidAt,
          transactionId: s.transactionId,
          status: s.status,
          rows: [],
        });
      }
      const g = groups.get(key);
      const securityDeposit = Number(s.depositAmount || 0);
      g.orderCount += 1;
      // Business Amount = rent + security deposit (matches vendor-side view)
      g.grossAmount += Number(s.grossAmount || 0) + securityDeposit;
      g.platformFee += Number(s.platformFee || 0);
      g.refundAmount = (g.refundAmount || 0) + Number(s.refundAmount || 0);
      // Backend netPayout = (rent - fee) only; add the deposit back in so
      // Net Payout reflects the full amount reaching the vendor's bank.
      g.netPayout += Number(s.netPayout || 0) + securityDeposit;
      g.rows.push(s);
      // If any row in the group is Pending, group is Pending
      if (s.status === 'Pending') g.status = 'Pending';
      // Use the latest paidAt
      if (s.paidAt && (!g.paidAt || new Date(s.paidAt) > new Date(g.paidAt)))
        g.paidAt = s.paidAt;
      if (s.transactionId && !g.transactionId)
        g.transactionId = s.transactionId;
    });
    return Array.from(groups.values());
  }, [filtered]);

  const groupedTotalPages = Math.max(
    1,
    Math.ceil(groupedFiltered.length / ROWS_PER_PAGE),
  );
  const paginatedGrouped = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return groupedFiltered.slice(start, start + ROWS_PER_PAGE);
  }, [groupedFiltered, currentPage]);

  return (
    <div className="p-6 pt-3 bg-gray-50 min-h-screen">
      {/* Heading */}
      {/* <div className="flex items-start justify-between gap-4">

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadAllCsv(data?.settlements || [])}
            disabled={loading || !data?.settlements?.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40"
          >
            <Download size={15} />
            Export all
          </button>
          <button
            type="button"
            onClick={fetchSettlements}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div> */}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button
            type="button"
            className="ml-auto text-red-400 hover:text-red-700"
            onClick={() => setError('')}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stat cards */}
      {/* <h2 className="font-semibold mt-8 mb-4">Settlement Overview</h2>
      <div className="grid lg:grid-cols-3 gap-5">
        <StatCard
          icon={Wallet}
          label="Upcoming Settlement"
          value={money(summary.upcoming)}
          loading={loading}
          colorClass="text-[#2563EB]"
          borderClass="border-[#BEDBFF]"
          iconBgClass="bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]"
        />
        <StatCard
          icon={Clock3}
          label="Pending Settlements"
          value={money(summary.totalPending)}
          loading={loading}
          colorClass="text-[#F97316]"
          borderClass="border-[#FFD6A8]"
          iconBgClass="bg-gradient-to-br from-[#FFEDD4] to-[#FFE2E2]"
        />
        <StatCard
          icon={CircleCheck}
          label="Total Paid Settlements"
          value={money(summary.totalPaid)}
          loading={loading}
          colorClass="text-[#10B981]"
          borderClass="border-[#B9F8CF]"
          iconBgClass="bg-gradient-to-br from-[#DCFCE7] to-[#D0FAE5]"
        />
      </div> */}

      <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-5 items-center">
        {/* Upcoming Settlement */}
        <StatCard
          icon={Wallet}
          label="Upcoming Settlement"
          value={money(summary.upcoming)}
          loading={loading}
          colorClass="text-[#2563EB]"
          borderClass="border-[#BEDBFF]"
          iconBgClass="bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]"
        />

        {/* Minus Icon */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] border flex items-center justify-center text-xl font-bold text-[#64748B]">
            −
          </div>
        </div>

        {/* Pending Settlements */}
        <StatCard
          icon={Clock3}
          label="Pending Settlements"
          value={money(summary.totalPending)}
          loading={loading}
          colorClass="text-[#F97316]"
          borderClass="border-[#FFD6A8]"
          iconBgClass="bg-gradient-to-br from-[#FFEDD4] to-[#FFE2E2]"
          count={summary.pendingCount ?? 0}
        />

        {/* Equal Icon */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] border flex items-center justify-center text-xl font-bold text-[#64748B]">
            =
          </div>
        </div>

        {/* Total Paid Settlements */}
        <StatCard
          icon={CircleCheck}
          label="Total Paid Settlements"
          value={money(summary.totalPaid)}
          loading={loading}
          colorClass="text-[#10B981]"
          borderClass="border-[#B9F8CF]"
          iconBgClass="bg-gradient-to-br from-[#DCFCE7] to-[#D0FAE5]"
          count={summary.paidCount ?? 0}
        />
      </div>

      {/* Search + filter */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor or settlement ID"
            className="w-full pl-11 pr-4 py-3 border rounded-lg outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        {/* <div className="flex gap-2 items-center">
          {['All', 'Pending', 'Paid'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                statusFilter === f
                  ? f === 'Paid'
                    ? 'bg-[#DCFCE7] text-[#00A63E] border-[#7BF1A8]'
                    : f === 'Pending'
                      ? 'bg-[#E5E7EB] text-[#64748B] border-[#D1D5DC]'
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div> */}
        <div className="flex flex-wrap gap-2 items-center">
          {['All', 'Pending', 'Paid'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                statusFilter === f
                  ? f === 'Paid'
                    ? 'bg-[#DCFCE7] text-[#00A63E] border-[#7BF1A8]'
                    : f === 'Pending'
                      ? 'bg-[#E5E7EB] text-[#64748B] border-[#D1D5DC]'
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={() => downloadAllCsv(data?.settlements || [])}
            disabled={loading || !data?.settlements?.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40"
          >
            <Download size={15} />
            Export all
          </button>
          <button
            type="button"
            onClick={fetchSettlements}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {/* <button
            type="button"
            onClick={handleRunPayoutNow}
            disabled={runningPayout || loading}
            title="Manually trigger the auto-payout batch (for testing)"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 disabled:opacity-50"
          >
            {runningPayout ? (
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : null}
            Run Payout Now
          </button> */}
        </div>
      </div>

      {/* Count cards */}
      {/* <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="bg-white border border-[#B9F8CF] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#DCFCE7] to-[#D0FAE5] flex items-center justify-center">
              <CircleCheck className="w-5 h-5 text-[#10B981]" />
            </div>

            <p className="text-[#64748B] font-medium">Paid Settlements</p>
          </div>

          <h2 className="text-3xl font-bold text-[#10B981] mt-3">
            {loading ? '…' : (summary.paidCount ?? 0)}
          </h2>
        </div>
        <div className="bg-white border border-[#FFD6A8] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFEDD4] to-[#FFE2E2] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#F97316]" />
            </div>

            <p className="text-[#64748B] font-medium">Pending Settlements</p>
          </div>

          <h2 className="text-3xl font-bold text-[#F97316] mt-3">
            {loading ? '…' : (summary.pendingCount ?? 0)}
          </h2>
        </div>
      </div> */}

      {/* Table */}
      <div className="bg-white rounded-xl shadow mt-8">
        <div className="p-5 border-b flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-lg">Settlement Tracking</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr className="text-center text-[#64748B] text-xs uppercase">
                <th className="p-4">Settlement ID</th>
                <th className="p-4">Vendor Name</th>
                <th className="p-4">Payout Period</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4">Business Amount</th>
                <th className="p-4">Deductions </th>
                <th className="p-4">Refund Deduction</th>
                <th className="p-4">Net Payout</th>
                <th className="p-4">Date</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 12 }).map((__, j) => (
                      <td key={j} className="p-4 text-center">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-20 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="p-12 text-center text-gray-400 text-sm"
                  >
                    {search || statusFilter !== 'All'
                      ? 'No settlements match your filters.'
                      : 'No settlement records yet. They are generated automatically from delivered and completed orders.'}
                  </td>
                </tr>
              ) : (
                // ) : (
                //   filtered.map((item) => (
                paginatedGrouped.map((item) => (
                  <tr
                    key={item._groupKey}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4 text-center font-mono text-sm text-[#0F172A] whitespace-nowrap">
                      {item.settlementId}
                    </td>
                    <td className="p-4 text-center font-medium text-[#0F172A]">
                      {item.vendorName}
                    </td>
                    <td className="p-4 text-center text-[#64748B] text-sm whitespace-nowrap">
                      {item.period}
                    </td>
                    <td className="p-4 text-center font-semibold text-[#0F172A]">
                      {item.orderCount}
                    </td>
                    <td className="p-4 text-center font-semibold text-[#2563EB]">
                      {money(item.grossAmount)}
                    </td>
                    <td className="p-4 text-center font-semibold text-[#E7000B]">
                      − {money(item.platformFee)}
                    </td>
                    <td className="p-4 text-center font-semibold text-[#E7000B]">
                      {item.refundAmount > 0
                        ? `− ${money(item.refundAmount)}`
                        : '—'}
                    </td>
                    <td className="p-4 text-center font-semibold text-[#10B981]">
                      {money(item.netPayout)}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-500 whitespace-nowrap">
                      {item.paidAt
                        ? new Date(item.paidAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="p-4 text-center text-sm font-mono text-gray-600">
                      {item.transactionId || '—'}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          title="Download PDF"
                          onClick={() => downloadRowPDF(item)}
                          className="p-2 rounded-lg bg-[#DCFCE7] text-[#00A63E] hover:bg-green-200"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && groupedFiltered.length > ROWS_PER_PAGE ? (
          <div className="flex items-center justify-between px-5 py-4 border-t">
            <p className="text-xs text-gray-500">
              Page {currentPage} of {groupedTotalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= groupedTotalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(groupedTotalPages, p + 1))
                }
                className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
