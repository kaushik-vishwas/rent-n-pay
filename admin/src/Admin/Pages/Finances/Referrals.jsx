// 'use client';

// import { useEffect, useState } from 'react';
// import * as XLSX from 'xlsx';
// import {
//   ArrowRight,
//   CheckCircle,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Download,
//   Loader2,
//   Search,
//   Users,
// } from 'lucide-react';
// import {
//   apiAdminGetReferralActivity,
//   apiAdminProcessWithdrawal,
// } from '@/service/api';

// export default function ReferralActivity() {
//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   const [stats, setStats] = useState(null);
//   const [referrers, setReferrers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState({});
//   const [search, setSearch] = useState('');
//   const [processingId, setProcessingId] = useState(null);
//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 10;

//   const load = async () => {
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     try {
//       const res = await apiAdminGetReferralActivity(token);
//       setStats(res.data.stats);
//       setReferrers(res.data.referrers);
//     } catch (err) {
//       console.error('Failed to load referral activity', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
//   // Flatten to one row per referee, carrying the parent referrer's info along
//   const flatRows = referrers.flatMap((r) =>
//     r.referees.map((ref) => ({
//       referrerId: r.id,
//       referrerSourceId: r.sourceId,
//       referrerName: r.name,
//       totalInvites: r.totalInvites,
//       referee: ref,
//     })),
//   );

//   const filtered = flatRows.filter((row) => {
//     const q = search.toLowerCase();
//     if (!q) return true;
//     return (
//       row.referrerName.toLowerCase().includes(q) ||
//       row.referrerSourceId.toLowerCase().includes(q) ||
//       row.referee.name.toLowerCase().includes(q) ||
//       row.referee.sourceId.toLowerCase().includes(q)
//     );
//   });
//   const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
//   const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const handleMarkPaid = async (userId, withdrawalId) => {
//     const utr = prompt('Enter UTR / bank reference number:');
//     if (!utr) return;
//     setProcessingId(withdrawalId);
//     try {
//       await apiAdminProcessWithdrawal(userId, withdrawalId, 'paid', utr, token);
//       await load();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to process withdrawal');
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="animate-spin text-blue-600" size={32} />
//       </div>
//     );
//   }

//   const handleExportExcel = () => {
//     const fmtDate = (d) =>
//       d
//         ? new Date(d).toLocaleDateString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//           })
//         : '-';

//     const rows = filtered.map((row) => {
//       const c = row.referee;
//       return {
//         'User ID': row.referrerSourceId,
//         Customer: row.referrerName,
//         'Referee (B)': `${c.sourceId} - ${c.name}`,
//         'Total Invites': row.totalInvites,
//         'Join Date': fmtDate(c.joinDate),
//         'Earning Amount':
//           c.status === 'Order Placed' ? c.commissionEarned || 0 : 0,
//         'Earned Date': fmtDate(c.commissionEarnedAt),
//         'Payment Date': fmtDate(c.paidAt),
//         'Transaction ID': c.transactionId || '-',
//         Status: c.paymentStatus === 'paid' ? 'Paid' : c.status,
//       };
//     });

//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     worksheet['!cols'] = [
//       { wch: 12 },
//       { wch: 22 },
//       { wch: 28 },
//       { wch: 12 },
//       { wch: 14 },
//       { wch: 14 },
//       { wch: 14 },
//       { wch: 14 },
//       { wch: 28 },
//       { wch: 14 },
//     ];

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Referral Activity');

//     XLSX.writeFile(
//       workbook,
//       `referral-activity-${new Date().toISOString().slice(0, 10)}.xlsx`,
//     );
//   };
//   return (
//     <div className="p-2 bg-[#F7F8FA] min-h-screen">
//       {/* HEADER */}
//       {/* <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={handleExportPDF}
//           className="px-4 py-2 bg-white text-[#64748B] font-semibold border-2 border-gray-300 rounded-lg text-sm shadow-sm flex items-center gap-2"
//         >
//           <Download className="w-4 h-4" />
//           Export Referral History
//         </button>
//       </div> */}

//       {/* STATS CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <StatCard
//           label="Total Referrers (A)"
//           value={String(stats?.totalReferrers ?? 0)}
//         />

//         <StatCard
//           label="Total Referees (B)"
//           value={String(stats?.totalReferees ?? 0)}
//           valueColor="#2563EB"
//         />

//         <StatCard
//           label="Total Commissions Paid"
//           value={`₹${stats?.totalDiscountsEarned ?? 0}`}
//           highlight
//         />

//         <StatCard
//           label="Verified Referees"
//           value={String(stats?.verifiedReferees ?? 0)}
//           valueColor="#00A63E"
//         />
//       </div>
//       {/* TABLE */}
//       <div className="bg-white border rounded-xl overflow-hidden">
//         {/* SEARCH */}
//         <div className="p-4 border-b">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
//             <p className="text-base font-semibold">Referrer Network Tree</p>
//             <button
//               onClick={handleExportExcel}
//               className="shrink-0 px-4 py-2 bg-white text-[#64748B] font-semibold border-2 border-gray-300 rounded-lg text-sm shadow-sm flex items-center gap-2 w-fit"
//             >
//               <Download className="w-4 h-4" />
//               Export Referral History
//             </button>
//           </div>

//           <div className="relative w-full">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

//             <input
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="Search by referrer or referee name / ID / code..."
//               className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
//             />
//           </div>
//         </div>

//         {/* SCROLL WRAPPER */}
//         <div className="overflow-x-auto">
//           <div className="min-w-[1550px]">
//             {/* HEADER ROW */}
//             <div className="grid grid-cols-10 bg-gray-50 text-xs text-gray-500 font-medium p-4 gap-4">
//               <div>USER ID</div>
//               <div>CUSTOMER PROFILE</div>
//               <div>REFEREE (B)</div>
//               <div>TOTAL INVITES</div>
//               <div>JOIN DATE</div>
//               <div>EARNING AMOUNT</div>
//               <div>EARNED DATE</div>
//               <div>PAYMENT DATE</div>
//               <div>TRANSACTION ID</div>
//               <div>STATUS</div>
//             </div>

//             {/* EMPTY STATE */}
//             {filtered.length === 0 && (
//               <div className="p-8 text-center text-[#64748B] text-sm">
//                 No referrers found.
//               </div>
//             )}

//             {/* ROWS */}
//             {/* ROWS — flat, one per referee */}
//             {paginated.map((row) => {
//               const c = row.referee;
//               return (
//                 <div
//                   key={`${row.referrerId}-${c.id}`}
//                   className="grid grid-cols-10 items-center p-4 border-t hover:bg-gray-50 text-sm gap-4"
//                 >
//                   {/* USER ID (referrer's source id) */}
//                   <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
//                     {row.referrerSourceId}
//                   </div>

//                   {/* CUSTOMER PROFILE (referrer) */}
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 uppercase rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white flex items-center justify-center text-xs font-bold">
//                       {row.referrerName
//                         .split(' ')
//                         .map((n) => n[0])
//                         .join('')}
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium">{row.referrerName}</p>
//                       <p className="text-xs text-gray-500">Referrer (A)</p>
//                     </div>
//                   </div>

//                   {/* REFEREE (B) */}
//                   <div className="flex items-center gap-2">
//                     {/* <ArrowRight className="w-4 h-4 text-[#94A3B8]" /> */}
//                     <div>
//                       <p className="text-sm font-medium">{c.name}</p>
//                       <p className="text-xs text-[#64748B]">{c.sourceId}</p>
//                     </div>
//                   </div>

//                   {/* TOTAL INVITES (referrer's) */}
//                   <div className="text-sm text-gray-600 flex items-center gap-1">
//                     <Users className="w-4 h-4 font-semibold text-[#00A63E]" />
//                     <span className="font-bold text-black">
//                       {row.totalInvites}
//                     </span>
//                   </div>

//                   {/* JOIN DATE (referee's) */}
//                   <div className="text-sm text-gray-500">
//                     {c.joinDate
//                       ? new Date(c.joinDate).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric',
//                         })
//                       : '—'}
//                   </div>

//                   {/* EARNING AMOUNT */}
//                   <div>
//                     {c.status === 'Order Placed' ? (
//                       <>
//                         <p className="text-sm font-semibold text-[#00A63E]">
//                           ₹{c.commissionEarned}
//                         </p>
//                         {/* <p className="text-xs font-medium text-[#64748B]">
//                           After ₹1,000 cap
//                         </p> */}
//                       </>
//                     ) : (
//                       <p className="text-xs text-yellow-600 font-medium">
//                         No commission yet
//                       </p>
//                     )}
//                   </div>

//                   {/* EARNED DATE */}
//                   <div className="text-sm text-gray-500">
//                     {c.commissionEarnedAt
//                       ? new Date(c.commissionEarnedAt).toLocaleDateString(
//                           'en-IN',
//                           { day: '2-digit', month: 'short', year: 'numeric' },
//                         )
//                       : '—'}
//                   </div>

//                   {/* PAYMENT DATE */}
//                   <div className="text-sm text-gray-500">
//                     {c.paidAt
//                       ? new Date(c.paidAt).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric',
//                         })
//                       : '—'}
//                   </div>
//                   {/* TXN ID */}
//                   <div className="text-xs text-gray-600 break-all">
//                     {c.transactionId || '—'}
//                   </div>

//                   {/* STATUS */}
//                   <div>
//                     <span
//                       className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
//                         c.paymentStatus === 'paid'
//                           ? 'bg-[#F0FDF4] text-[#00A63E] font-semibold border border-[#B9F8CF]'
//                           : c.status === 'Order Placed'
//                             ? 'bg-blue-100 text-blue-600'
//                             : c.status === 'KYC Approved'
//                               ? 'bg-blue-50 text-blue-500'
//                               : 'bg-yellow-100 text-yellow-600'
//                       }`}
//                     >
//                       {c.paymentStatus === 'paid' ? (
//                         <CheckCircle className="w-3.5 h-3.5" />
//                       ) : (
//                         <Clock className="w-3.5 h-3.5" />
//                       )}
//                       {c.paymentStatus === 'paid' ? 'Paid' : c.status}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
//           <span>
//             Showing {filtered.length} referee{filtered.length !== 1 ? 's' : ''}
//           </span>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setPage((p) => p - 1)}
//               disabled={page === 1}
//               className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50"
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>

//             <span className="px-3 py-1 rounded bg-orange-500 text-white text-xs font-semibold">
//               {page}
//             </span>

//             <button
//               onClick={() => setPage((p) => p + 1)}
//               disabled={page === totalPages || totalPages === 0}
//               className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50"
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, highlight, valueColor }) {
//   return (
//     <div className="bg-white border rounded-xl p-4">
//       <p className="text-sm text-[#64748B] font-semibold">{label}</p>

//       <h2
//         className={`text-2xl font-bold mt-1 ${
//           highlight ? 'text-orange-500' : ''
//         }`}
//         style={valueColor ? { color: valueColor } : {}}
//       >
//         {value}
//       </h2>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  Search,
  Users,
} from 'lucide-react';
import {
  apiAdminGetReferralActivity,
  apiAdminProcessWithdrawal,
} from '@/service/api';

export default function ReferralActivity() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const [stats, setStats] = useState(null);
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiAdminGetReferralActivity(token);
      setStats(res.data.stats);
      setReferrers(res.data.referrers);
    } catch (err) {
      console.error('Failed to load referral activity', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  // Flatten to one row per referee, carrying the parent referrer's info along
  const flatRows = referrers.flatMap((r) =>
    r.referees.map((ref) => ({
      referrerId: r.id,
      referrerSourceId: r.sourceId,
      referrerName: r.name,
      totalInvites: r.totalInvites,
      referee: ref,
    })),
  );

  const filtered = flatRows.filter((row) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      row.referrerName.toLowerCase().includes(q) ||
      row.referrerSourceId.toLowerCase().includes(q) ||
      row.referee.name.toLowerCase().includes(q) ||
      row.referee.sourceId.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkPaid = async (userId, withdrawalId) => {
    const utr = prompt('Enter UTR / bank reference number:');
    if (!utr) return;
    setProcessingId(withdrawalId);
    try {
      await apiAdminProcessWithdrawal(userId, withdrawalId, 'paid', utr, token);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const handleExportExcel = () => {
    const fmtDate = (d) =>
      d
        ? new Date(d).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '-';

    const rows = filtered.map((row) => {
      const c = row.referee;
      return {
        'User ID': row.referrerSourceId,
        Customer: row.referrerName,
        'Referee (B)': `${c.sourceId} - ${c.name}`,
        'Total Invites': row.totalInvites,
        'Join Date': fmtDate(c.joinDate),
        'Earning Amount':
          c.status === 'Order Placed' ? c.commissionEarned || 0 : 0,
        'Earned Date': fmtDate(c.commissionEarnedAt),
        'Payment Date': fmtDate(c.paidAt),
        'Transaction ID': c.transactionId || '-',
        Status: c.paymentStatus === 'paid' ? 'Paid' : c.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 22 },
      { wch: 28 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 28 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Referral Activity');

    XLSX.writeFile(
      workbook,
      `referral-activity-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };
  return (
    <div className="p-2 bg-[#F7F8FA]">
      {/* HEADER */}
      {/* <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-white text-[#64748B] font-semibold border-2 border-gray-300 rounded-lg text-sm shadow-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Referral History
        </button>
      </div> */}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Referrers (A)"
          value={String(stats?.totalReferrers ?? 0)}
        />

        <StatCard
          label="Total Referees (B)"
          value={String(stats?.totalReferees ?? 0)}
          valueColor="#2563EB"
        />

        <StatCard
          label="Total Commissions Paid"
          value={`₹${stats?.totalDiscountsEarned ?? 0}`}
          highlight
        />

        <StatCard
          label="Verified Referees"
          value={String(stats?.verifiedReferees ?? 0)}
          valueColor="#00A63E"
        />
      </div>
      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {/* SEARCH */}
        {/* <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <p className="text-base font-semibold">Referrer Network Tree</p>
            <button
              onClick={handleExportExcel}
              className="shrink-0 px-4 py-2 bg-white text-[#64748B] font-semibold border-2 border-gray-300 rounded-lg text-sm shadow-sm flex items-center gap-2 w-fit"
            >
              <Download className="w-4 h-4" />
              Export Referral History
            </button>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by referrer or referee name / ID / code..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div> */}
        <div className="p-4 border-b">
          <p className="text-base font-semibold mb-3">Referrer Network Tree</p>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by referrer or referee name / ID / code..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>

            <button
              onClick={handleExportExcel}
              className="shrink-0 px-4 py-2 bg-white text-[#64748B] font-semibold border-2 border-gray-300 rounded-lg text-sm shadow-sm flex items-center gap-2 w-fit"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Referral History</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* SCROLL WRAPPER */}
        <div className="overflow-x-auto">
          <div className="min-w-[1550px]">
            {/* HEADER ROW */}
            <div className="grid grid-cols-10 bg-gray-50 text-xs text-gray-500 font-medium p-4 gap-4 text-center">
              <div>USER ID</div>
              <div>CUSTOMER PROFILE</div>
              <div>REFEREE (B)</div>
              <div>TOTAL INVITES</div>
              <div>JOIN DATE</div>
              <div>EARNING AMOUNT</div>
              <div>EARNED DATE</div>
              <div>PAYMENT DATE</div>
              <div>TRANSACTION ID</div>
              <div>STATUS</div>
            </div>

            {/* EMPTY STATE */}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-[#64748B] text-sm">
                No referrers found.
              </div>
            )}

            {/* ROWS */}
            {/* ROWS — flat, one per referee */}
            {paginated.map((row) => {
              const c = row.referee;
              return (
                <div
                  key={`${row.referrerId}-${c.id}`}
                  className="grid grid-cols-10 items-center p-4 border-t hover:bg-gray-50 text-sm gap-4 text-center"
                >
                  {/* USER ID (referrer's source id) */}
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-medium text-sm">
                    {row.referrerSourceId}
                  </div>

                  {/* CUSTOMER PROFILE (referrer) */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 uppercase rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white flex items-center justify-center text-xs font-bold">
                      {row.referrerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{row.referrerName}</p>
                      <p className="text-xs text-gray-500">Referrer (A)</p>
                    </div>
                  </div>
                  {/* REFEREE (B) */}
                  <div className="flex items-center justify-center gap-2">
                    {/* <ArrowRight className="w-4 h-4 text-[#94A3B8]" /> */}
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-[#64748B]">{c.sourceId}</p>
                    </div>
                  </div>

                  {/* TOTAL INVITES (referrer's) */}
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 font-semibold text-[#00A63E]" />
                    <span className="font-bold text-black">
                      {row.totalInvites}
                    </span>
                  </div>

                  {/* JOIN DATE (referee's) */}
                  <div className="text-sm text-gray-500">
                    {c.joinDate
                      ? new Date(c.joinDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </div>

                  {/* EARNING AMOUNT */}
                  <div>
                    {c.status === 'Order Placed' ? (
                      <>
                        <p className="text-sm font-semibold text-[#00A63E]">
                          ₹{c.commissionEarned}
                        </p>
                        {/* <p className="text-xs font-medium text-[#64748B]">
                          After ₹1,000 cap
                        </p> */}
                      </>
                    ) : (
                      <p className="text-xs text-yellow-600 font-medium">
                        No commission yet
                      </p>
                    )}
                  </div>

                  {/* EARNED DATE */}
                  <div className="text-sm text-gray-500">
                    {c.commissionEarnedAt
                      ? new Date(c.commissionEarnedAt).toLocaleDateString(
                          'en-IN',
                          { day: '2-digit', month: 'short', year: 'numeric' },
                        )
                      : '—'}
                  </div>

                  {/* PAYMENT DATE */}
                  <div className="text-sm text-gray-500">
                    {c.paidAt
                      ? new Date(c.paidAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </div>
                  {/* TXN ID */}
                  <div className="text-xs text-gray-600 break-all">
                    {c.transactionId || '—'}
                  </div>

                  {/* STATUS */}
                  {/* <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        c.paymentStatus === 'paid'
                          ? 'bg-[#F0FDF4] text-[#00A63E] font-semibold border border-[#B9F8CF]'
                          : c.status === 'Order Placed'
                            ? 'bg-blue-100 text-blue-600'
                            : c.status === 'KYC Approved'
                              ? 'bg-blue-50 text-blue-500'
                              : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {c.paymentStatus === 'paid' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {c.paymentStatus === 'paid' ? 'Paid' : c.status}
                    </span>
                  </div> */}

                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        c.paymentStatus === 'paid'
                          ? 'bg-[#F0FDF4] text-[#00A63E] font-semibold border border-[#B9F8CF]'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {c.paymentStatus === 'paid' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {c.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {filtered.length} referee{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 rounded bg-orange-500 text-white text-xs font-semibold">
              {page}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight, valueColor }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-[#64748B] font-semibold">{label}</p>

      <h2
        className={`text-2xl font-bold mt-1 ${
          highlight ? 'text-orange-500' : ''
        }`}
        style={valueColor ? { color: valueColor } : {}}
      >
        {value}
      </h2>
    </div>
  );
}
