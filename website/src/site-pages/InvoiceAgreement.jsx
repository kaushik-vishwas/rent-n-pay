// 'use client';

// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   FileText,
//   CalendarDays,
//   Download,
//   Mail,
//   ChevronDown,
//   FileBadge,
// } from 'lucide-react';
// import { apiGetMyInvoices } from '@/lib/api';
// import jsPDF from 'jspdf';

// function fmtDate(iso) {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return '—';
//   return d.toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
// }

// /** e.g. Feb 2026 date -> "2025-26" (Indian FY: Apr–Mar) */
// function getFinancialYear(iso) {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return 'Unknown';
//   const y = d.getFullYear();
//   const m = d.getMonth(); // 0 = Jan
//   const startYear = m >= 3 ? y : y - 1; // April(3) onward = current FY start
//   return `${startYear}-${String(startYear + 1).slice(-2)}`;
// }

// function downloadInvoicePDFUser(invoice) {
//   const pdf = new jsPDF();
//   let y = 20;

//   pdf.setFontSize(16);
//   pdf.text('Payment Invoice', 14, y);
//   pdf.setFontSize(10);
//   pdf.text(`${invoice.invoiceId}`, 150, y);

//   y += 10;
//   pdf.setDrawColor(200);
//   pdf.line(14, y, 196, y);

//   y += 10;
//   pdf.setFontSize(12);
//   pdf.text('Customer Details', 14, y);
//   y += 8;
//   pdf.setFontSize(10);
//   pdf.text(`Name: ${invoice.name || '—'}`, 14, y);
//   y += 6;
//   pdf.text(`Phone: ${invoice.phone || '—'}`, 14, y);
//   y += 6;
//   pdf.text(`Address: ${invoice.address || '—'}`, 14, y);

//   y += 12;
//   pdf.setFontSize(12);
//   pdf.text('Order Details', 14, y);
//   y += 8;
//   pdf.setFontSize(10);
//   pdf.text(`Order Reference: #${invoice.orderRef}`, 14, y);
//   y += 6;
//   pdf.text(`Date: ${fmtDate(invoice.date)}`, 14, y);
//   y += 6;
//   pdf.text(`Status: ${invoice.status}`, 14, y);

//   y += 12;
//   pdf.setFontSize(12);
//   pdf.text('Items', 14, y);
//   y += 8;
//   pdf.setFontSize(10);
//   (invoice.lineItems || []).forEach((li) => {
//     pdf.text(
//       `${li.productName} (${li.productType}) x${li.quantity} — Rs. ${li.pricePerDay}/unit`,
//       14,
//       y,
//     );
//     y += 6;
//   });

//   y += 6;
//   pdf.setDrawColor(200);
//   pdf.line(14, y, 196, y);

//   y += 10;
//   pdf.setFontSize(10);
//   pdf.text(
//     `Base Amount: Rs. ${invoice.baseRentalCost.toLocaleString('en-IN')}`,
//     14,
//     y,
//   );
//   y += 6;
//   pdf.text(`GST: Rs. ${invoice.gst.toLocaleString('en-IN')}`, 14, y);
//   y += 6;
//   pdf.text(`Care Tax: Rs. ${invoice.careTax.toLocaleString('en-IN')}`, 14, y);
//   y += 6;
//   pdf.text(
//     `Delivery Fee: Rs. ${invoice.deliveryFee.toLocaleString('en-IN')}`,
//     14,
//     y,
//   );
//   y += 6;
//   pdf.text(
//     `Refundable Deposit: Rs. ${invoice.deposit.toLocaleString('en-IN')}`,
//     14,
//     y,
//   );
//   if (invoice.discountAmount) {
//     y += 6;
//     pdf.text(
//       `Discount: -Rs. ${invoice.discountAmount.toLocaleString('en-IN')}`,
//       14,
//       y,
//     );
//   }

//   y += 12;
//   pdf.setFontSize(13);
//   pdf.text(`Total Paid: Rs. ${invoice.amount.toLocaleString('en-IN')}`, 14, y);

//   y += 16;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     14,
//     y,
//   );

//   pdf.save(`${invoice.invoiceId.replace('#', '')}.pdf`);
// }

// const agreements = [
//   {
//     id: 1,
//     title: 'Rental Agreement - Fabric Sofa & Bed',
//     signed: '10 Jan 2026',
//     valid: '10 Jan 2027',
//     items: ['Fabric Sofa (Blue)', '3-Seater', 'Queen Size Bed Frame'],
//   },
//   {
//     id: 2,
//     title: 'Rental Agreement - Samsung Washing Machine',
//     signed: '15 Nov 2025',
//     valid: '15 Nov 2026',
//     items: ['Samsung Top Load 6.5kg'],
//   },
// ];

// // const InvoiceAgreement = () => {
// //   const [invoices, setInvoices] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const token =
// //       typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
// //     if (!token) {
// //       setLoading(false);
// //       return;
// //     }
// //     apiGetMyInvoices(token)
// //       .then((res) => {
// //         setInvoices(
// //           Array.isArray(res?.data?.invoices) ? res.data.invoices : [],
// //         );
// //       })
// //       .catch(() => setInvoices([]))
// //       .finally(() => setLoading(false));
// //   }, []);
// const ITEMS_PER_PAGE = 10;

// const InvoiceAgreement = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [financialYear, setFinancialYear] = useState('All');
//   const [currentPage, setCurrentPage] = useState(1);

//   useEffect(() => {
//     apiGetMyInvoices()
//       .then((res) => {
//         setInvoices(
//           Array.isArray(res?.data?.invoices) ? res.data.invoices : [],
//         );
//       })
//       .catch(() => setInvoices([]))
//       .finally(() => setLoading(false));
//   }, []);

//   const financialYears = React.useMemo(() => {
//     const set = new Set(invoices.map((inv) => getFinancialYear(inv.date)));
//     return Array.from(set).sort().reverse();
//   }, [invoices]);

//   const filteredInvoices = React.useMemo(() => {
//     if (financialYear === 'All') return invoices;
//     return invoices.filter(
//       (inv) => getFinancialYear(inv.date) === financialYear,
//     );
//   }, [invoices, financialYear]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [financialYear]);

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE),
//   );
//   const paginatedInvoices = React.useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
//   }, [filteredInvoices, currentPage]);

//   return (
//     <div className="min-h-screen bg-[#f6f8fc] py-6 lg:py-10">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}

//         <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
//           <div>
//             <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>

//             {/* <p className="text-slate-500 mt-2">
//               Access your rental agreements and monthly tax invoices.
//             </p> */}
//           </div>

//           <button className="flex items-center justify-center gap-2 border rounded-xl px-5 py-3 bg-white hover:bg-gray-50 transition shadow-sm">
//             <Mail size={18} />
//             Email All to Me
//           </button>
//         </div>

//         {/* Rental Agreements */}

//         {/* <div className="mt-10">
//           <div className="flex items-center gap-2 mb-5">
//             <FileText className="text-orange-500" size={20} />

//             <h2 className="text-2xl font-semibold">Rental Agreements</h2>

//             <span className="bg-gray-200 text-sm px-2 py-1 rounded-full">
//               2
//             </span>
//           </div>

//           <div className="space-y-5">
//             {agreements.map((agreement) => (
//               <div
//                 key={agreement.id}
//                 className="bg-white rounded-2xl border shadow-sm p-5"
//               >
//                 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//                   <div className="flex gap-5">
//                     <div className="w-20 h-20 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-red-600 shrink-0">
//                       <FileText size={34} />
//                       <span className="text-sm font-semibold mt-1">PDF</span>
//                     </div>

//                     <div>
//                       <h3 className="text-xl font-semibold">
//                         {agreement.title}
//                       </h3>

//                       <div className="flex flex-wrap items-center gap-5 text-gray-500 text-sm mt-3">
//                         <div className="flex items-center gap-2">
//                           <CalendarDays size={15} />
//                           Signed on:
//                           <span className="font-medium text-slate-700">
//                             {agreement.signed}
//                           </span>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <CalendarDays size={15} />
//                           Valid till:
//                           <span className="font-medium text-slate-700">
//                             {agreement.valid}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap gap-2 mt-4">
//                         {agreement.items.map((item) => (
//                           <span
//                             key={item}
//                             className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
//                           >
//                             {item}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   <button className="border-2 border-orange-500 text-orange-500 rounded-xl px-6 py-3 hover:bg-orange-50 transition flex items-center justify-center gap-2">
//                     <Download size={18} />
//                     Download Contract
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div> */}

//         {/* Payment Invoices */}

//         <div className="mt-12">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-5">
//             <div className="flex items-center gap-2">
//               {/* <FileBadge className="text-orange-500" size={20} /> */}

//               <h2 className="text-2xl font-semibold">Payment Invoices</h2>

//               <span className="bg-gray-200 text-sm px-2 py-1 rounded-full">
//                 {filteredInvoices.length}
//               </span>
//             </div>

//             <div className="flex items-center gap-3">
//               <span className="text-gray-600">Financial Year:</span>

//               <select
//                 value={financialYear}
//                 onChange={(e) => setFinancialYear(e.target.value)}
//                 className="w-40 border bg-white rounded-xl px-4 py-3 outline-none"
//               >
//                 <option value="All">All Years</option>
//                 {financialYears.map((fy) => (
//                   <option key={fy} value={fy}>
//                     FY {fy}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-gray-500 text-sm">
//                     <th className="px-6 py-4">DATE</th>
//                     <th className="px-6 py-4">INVOICE ID</th>
//                     <th className="px-6 py-4">ITEM(S)</th>
//                     <th className="px-6 py-4">AMOUNT</th>
//                     <th className="px-6 py-4 text-center">ACTION</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-6 py-10 text-center text-gray-400"
//                       >
//                         Loading invoices…
//                       </td>
//                     </tr>
//                   ) : paginatedInvoices.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-6 py-10 text-center text-gray-400"
//                       >
//                         No invoices yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedInvoices.map((invoice) => (
//                       <tr
//                         key={invoice._id}
//                         className="border-t hover:bg-gray-50"
//                       >
//                         <td className="px-6 py-6 font-medium">
//                           {fmtDate(invoice.date)}
//                         </td>

//                         <td className="px-6 py-6">
//                           <span className="bg-gray-100 rounded-full px-3 py-2 text-sm font-semibold">
//                             {invoice.invoiceId}
//                           </span>
//                         </td>

//                         <td className="px-6 py-6 text-gray-600">
//                           {invoice.item}
//                         </td>

//                         <td className="px-6 py-6 font-semibold">
//                           ₹{invoice.amount.toLocaleString('en-IN')}
//                         </td>

//                         <td className="px-6 py-6 text-center">
//                           <button
//                             onClick={() => downloadInvoicePDFUser(invoice)}
//                             className="text-orange-500 hover:text-orange-600"
//                           >
//                             <Download size={20} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {!loading && filteredInvoices.length > 0 && (
//               <div className="flex items-center justify-between px-6 py-4 border-t">
//                 <p className="text-sm text-gray-500">
//                   Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
//                   {Math.min(
//                     currentPage * ITEMS_PER_PAGE,
//                     filteredInvoices.length,
//                   )}{' '}
//                   of {filteredInvoices.length} invoices
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
//                   >
//                     Previous
//                   </button>
//                   <span className="h-8 w-8 rounded-lg text-sm border border-orange-500 bg-orange-500 text-white font-semibold flex items-center justify-center">
//                     {currentPage}
//                   </span>
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(p + 1, totalPages))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Bottom Card */}

//       <div className="mt-10 bg-[#edf5ff] border border-blue-200 rounded-2xl p-6">
//         <div className="flex gap-4">
//           <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
//             <FileText />
//           </div>

//           <div>
//             <h3 className="font-semibold text-blue-900">
//               Need documents for tax filing?
//             </h3>

//             <p className="text-blue-700 mt-2">
//               Use the "Email All to Me" button to receive all your rental
//               agreements and invoices in one convenient ZIP file.
//             </p>

//             <p className="text-sm text-blue-500 mt-2">
//               💡 Tip: Download invoices regularly for your records and GST
//               claims.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceAgreement;
