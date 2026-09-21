// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { apiGetAllSettlements } from '@/service/api';
// import { Search, Download } from 'lucide-react';
// import * as XLSX from 'xlsx';

// import DateIcon from '@/assets/icons/date.png';

// const Transaction = () => {
//   const [settlements, setSettlements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [query, setQuery] = useState('');

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     let cancelled = false;
//     setLoading(true);
//     apiGetAllSettlements(token)
//       .then((res) => {
//         if (cancelled) return;
//         setSettlements(
//           Array.isArray(res?.data?.settlements) ? res.data.settlements : [],
//         );
//       })
//       .catch((err) => {
//         console.error(
//           'Admin settlements fetch failed:',
//           err?.response?.data || err.message,
//         );
//         if (!cancelled) setSettlements([]);
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const availableMonths = useMemo(() => {
//     const map = {};
//     settlements.forEach((s) => {
//       if (!s?.createdAt) return;
//       const d = new Date(s.createdAt);
//       const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
//       if (!map[key]) {
//         map[key] = {
//           value: key,
//           label: d.toLocaleString('default', {
//             month: 'short',
//             year: 'numeric',
//           }),
//           sortDate: new Date(d.getFullYear(), d.getMonth(), 1),
//         };
//       }
//     });
//     return Object.values(map).sort((a, b) => b.sortDate - a.sortDate);
//   }, [settlements]);

//   const transactions = useMemo(() => {
//     const filteredSettlements = settlements.filter((s) => {
//       if (!selectedMonth) return true;
//       if (!s?.createdAt) return false;
//       const d = new Date(s.createdAt);
//       const settleKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
//       return settleKey === selectedMonth;
//     });

//     const mapped = filteredSettlements.map((s) => {
//       const gross = Number(s.grossAmount || 0);
//       const fee = Number(s.platformFee || 0);
//       const settled = Number(s.netPayout || 0);
//       const pct = gross ? Math.round((fee / gross) * 100) : 0;
//       return {
//         date: s?.createdAt
//           ? new Date(s.createdAt).toLocaleDateString('en-GB', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//             })
//           : '—',
//         id: s?.orderId
//           ? `ORD-${String(s.orderId).slice(-6).toUpperCase()}`
//           : 'ORD-—',
//         vendorName:
//           s?.vendorId?.shopName ||
//           s?.vendorId?.fullName ||
//           s?.vendorId?.email ||
//           '—',
//         gross: `₹${gross.toLocaleString('en-IN')}`,
//         commission: `${pct}%`,
//         settled: `₹${settled.toLocaleString('en-IN')}`,
//         transactionId: s?.razorpayPayoutId || '—',
//         status: s?.status || '—',
//       };
//     });

//     const q = query.trim().toLowerCase();
//     if (!q) return mapped;
//     return mapped.filter(
//       (tx) =>
//         tx.id.toLowerCase().includes(q) ||
//         tx.date.toLowerCase().includes(q) ||
//         tx.vendorName.toLowerCase().includes(q),
//     );
//   }, [settlements, selectedMonth, query]);

//   const handleExportExcel = () => {
//     const exportData = transactions.map((tx) => ({
//       'Order ID': tx.id,
//       Vendor: tx.vendorName,
//       'Gross Amount': tx.gross,
//       'Commission (%)': tx.commission,
//       'Settled Amount': tx.settled,
//       Date: tx.date,
//       'Transaction ID': tx.transactionId,
//       Status: tx.status,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
//     XLSX.writeFile(
//       workbook,
//       `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`,
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         <main className="flex-1 overflow-y-auto px-6 pb-6 pt-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//           <div className="bg-white rounded-2xl border border-gray-200 p-5">
//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
//               <div className="relative w-full sm:max-w-xs">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search order ID, vendor, or date..."
//                   className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs outline-none"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={handleExportExcel}
//                 disabled={transactions.length === 0}
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 sm:ml-auto"
//               >
//                 <Download className="w-4 h-4" />
//                 Export to Excel
//               </button>
//             </div>
//             <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//               <table className="min-w-full text-xs md:text-sm border-separate border-spacing-0">
//                 <thead>
//                   <tr className="text-[#64748B] border-b border-gray-100 bg-gray-50/60">
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       ORDER ID
//                     </th>
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       VENDOR
//                     </th>
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       GROSS AMOUNT
//                     </th>
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       COMMISSION (%)
//                     </th>
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       SETTLED AMOUNT
//                     </th>
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       DATE
//                     </th>
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       TRANSACTION ID
//                     </th>
//                     <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
//                       STATUS
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {transactions.map((tx, idx) => (
//                     <tr
//                       key={`${tx.id}-${idx}`}
//                       className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'} hover:bg-orange-50/40 border-b border-gray-100`}
//                     >
//                       <td className="py-3 px-3 text-[#0F172A] font-medium whitespace-nowrap">
//                         {tx.id}
//                       </td>
//                       <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
//                         {tx.vendorName}
//                       </td>
//                       <td className="py-3 px-3 text-left text-[#2563EB] whitespace-nowrap">
//                         {tx.gross}
//                       </td>
//                       <td className="py-3 px-3 text-left text-[#F97316] whitespace-nowrap">
//                         {tx.commission}
//                       </td>
//                       <td className="py-3 px-3 text-left text-emerald-600 font-medium whitespace-nowrap">
//                         {tx.settled}
//                       </td>
//                       <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <img
//                             src={DateIcon.src}
//                             alt="date"
//                             className="w-3 h-3 shrink-0"
//                           />
//                           {tx.date}
//                         </div>
//                       </td>
//                       <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
//                         {tx.transactionId}
//                       </td>
//                       <td className="py-3 px-3">
//                         <span
//                           className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
//                             tx.status === 'Paid'
//                               ? 'bg-emerald-50 text-emerald-700'
//                               : tx.status === 'Processing'
//                                 ? 'bg-blue-50 text-blue-700'
//                                 : tx.status === 'Pending'
//                                   ? 'bg-amber-50 text-amber-700'
//                                   : 'bg-gray-100 text-gray-600'
//                           }`}
//                         >
//                           {tx.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                   {!loading && transactions.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={8}
//                         className="py-4 text-center text-gray-500"
//                       >
//                         No transactions yet.
//                       </td>
//                     </tr>
//                   ) : null}
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={8}
//                         className="py-4 text-center text-gray-500"
//                       >
//                         Loading…
//                       </td>
//                     </tr>
//                   ) : null}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Transaction;

'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGetAllSettlements } from '@/service/api';
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

import DateIcon from '@/assets/icons/date.png';

const Transaction = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiGetAllSettlements(token)
      .then((res) => {
        if (cancelled) return;
        setSettlements(
          Array.isArray(res?.data?.settlements) ? res.data.settlements : [],
        );
      })
      .catch((err) => {
        console.error(
          'Admin settlements fetch failed:',
          err?.response?.data || err.message,
        );
        if (!cancelled) setSettlements([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const availableMonths = useMemo(() => {
    const map = {};
    settlements.forEach((s) => {
      if (!s?.createdAt) return;
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) {
        map[key] = {
          value: key,
          label: d.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          }),
          sortDate: new Date(d.getFullYear(), d.getMonth(), 1),
        };
      }
    });
    return Object.values(map).sort((a, b) => b.sortDate - a.sortDate);
  }, [settlements]);

  const transactions = useMemo(() => {
    const filteredSettlements = settlements.filter((s) => {
      if (!selectedMonth) return true;
      if (!s?.createdAt) return false;
      const d = new Date(s.createdAt);
      const settleKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return settleKey === selectedMonth;
    });

    // const mapped = filteredSettlements.map((s) => {
    //   const gross = Number(s.grossAmount || 0);
    //   const fee = Number(s.platformFee || 0);
    //   const settled = Number(s.netPayout || 0);
    const mapped = filteredSettlements.map((s) => {
      const rent = Number(s.grossAmount || 0);
      const securityDeposit = Number(s.depositAmount || 0);
      // Gross amount = rent + security deposit (matches vendor-side view)
      const gross = rent + securityDeposit;
      const fee = Number(s.platformFee || 0);
      // Backend netPayout = (rent - fee) only; add the deposit back in for
      // display so it reflects the full amount reaching the vendor's bank.
      const settled = Number(s.netPayout || 0) + securityDeposit;
      // const pct = gross ? Math.round((fee / gross) * 100) : 0;
      // return {
      //   date: s?.createdAt
      //     ? new Date(s.createdAt).toLocaleDateString('en-GB', {
      //         day: '2-digit',
      //         month: 'short',
      //         year: 'numeric',
      //       })
      //     : '—',
      //   id: s?.orderId
      //     ? `ORD-${String(s.orderId).slice(-6).toUpperCase()}`
      //     : 'ORD-—',
      //   vendorName:
      //     s?.vendorId?.shopName ||
      //     s?.vendorId?.fullName ||
      //     s?.vendorId?.email ||
      //     '—',
      //   gross: `₹${gross.toLocaleString('en-IN')}`,
      //   commission: `${pct}%`,
      return {
        date: s?.createdAt
          ? new Date(s.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
        // id: s?.orderId
        //   ? `ORD-${String(s.orderId).slice(-6).toUpperCase()}`
        //   : 'ORD-—',
        id: s?.orderId?.orderNumber
          ? `ORD-${String(s.orderId.orderNumber).padStart(4, '0')}`
          : 'ORD-—',
        vendorName:
          s?.vendorId?.shopName ||
          s?.vendorId?.fullName ||
          s?.vendorId?.email ||
          '—',
        gross: `₹${gross.toLocaleString('en-IN')}`,
        commission: `₹${fee.toLocaleString('en-IN')}`,
        settled: `₹${settled.toLocaleString('en-IN')}`,
        transactionId: s?.razorpayPayoutId || '—',
        status: s?.status || '—',
      };
    });

    const q = query.trim().toLowerCase();
    if (!q) return mapped;
    return mapped.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.date.toLowerCase().includes(q) ||
        tx.vendorName.toLowerCase().includes(q),
    );
  }, [settlements, selectedMonth, query]);

  const handleExportExcel = () => {
    const exportData = transactions.map((tx) => ({
      'Order ID': tx.id,
      Vendor: tx.vendorName,
      'Gross Amount': tx.gross,
      'Commission (%)': tx.commission,
      'Settled Amount': tx.settled,
      Date: tx.date,
      'Transaction ID': tx.transactionId,
      Status: tx.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(
      workbook,
      `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 pb-6 pt-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search order ID, vendor, or date..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={transactions.length === 0}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 sm:ml-auto"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
              <table className="min-w-full text-xs md:text-sm border-separate border-spacing-0">
                <thead>
                  {/* <tr className="text-[#64748B] border-b border-gray-100 bg-gray-50/60">
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      ORDER ID
                    </th>
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      VENDOR
                    </th>
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      GROSS AMOUNT
                    </th>
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      COMMISSION
                    </th>
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      SETTLED AMOUNT
                    </th>
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      DATE
                    </th>
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      TRANSACTION ID
                    </th>
                    <th className="py-3 px-3 text-left font-medium whitespace-nowrap">
                      STATUS
                    </th>
                  </tr> */}
                  <tr className="text-[#64748B] border-b border-gray-100 bg-gray-50/60">
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      ORDER ID
                    </th>
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      VENDOR
                    </th>
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      GROSS AMOUNT
                    </th>
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      COMMISSION
                    </th>
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      SETTLED AMOUNT
                    </th>
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      DATE
                    </th>
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      TRANSACTION ID
                    </th>
                    <th className="py-3 px-3 text-center font-medium whitespace-nowrap">
                      STATUS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr
                      key={`${tx.id}-${idx}`}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'} hover:bg-orange-50/40 border-b border-gray-100`}
                    >
                      {/* <td className="py-3 px-3 text-[#0F172A] font-medium whitespace-nowrap">
                        {tx.id}
                      </td>
                      <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                        {tx.vendorName}
                      </td>
                      <td className="py-3 px-3 text-left text-[#2563EB] whitespace-nowrap">
                        {tx.gross}
                      </td>
                      <td className="py-3 px-3 text-left text-[#F97316] whitespace-nowrap">
                        {tx.commission}
                      </td>
                      <td className="py-3 px-3 text-left text-emerald-600 font-medium whitespace-nowrap">
                        {tx.settled}
                      </td>
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={DateIcon.src}
                            alt="date"
                            className="w-3 h-3 shrink-0"
                          />
                          {tx.date}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.transactionId}
                      </td> */}
                      <td className="py-3 px-3 text-center text-[#0F172A] font-medium whitespace-nowrap">
                        {tx.id}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-700 whitespace-nowrap">
                        {tx.vendorName}
                      </td>
                      <td className="py-3 px-3 text-center text-[#2563EB] whitespace-nowrap">
                        {tx.gross}
                      </td>
                      <td className="py-3 px-3 text-center text-[#F97316] whitespace-nowrap">
                        {tx.commission}
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-medium whitespace-nowrap">
                        {tx.settled}
                      </td>
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <img
                            src={DateIcon.src}
                            alt="date"
                            className="w-3 h-3 shrink-0"
                          />
                          {tx.date}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.transactionId}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            tx.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tx.status === 'Processing'
                                ? 'bg-blue-50 text-blue-700'
                                : tx.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 text-center text-gray-500"
                      >
                        No transactions yet.
                      </td>
                    </tr>
                  ) : null}
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 text-center text-gray-500"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transaction;
