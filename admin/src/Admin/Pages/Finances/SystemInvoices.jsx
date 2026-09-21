// 'use client';

// import { useEffect, useMemo, useState, useRef } from 'react';
// import {
//   Search,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   TrendingUp,
//   CheckCircle,
//   Mail,
//   Download,
//   IndianRupee,
//   Receipt,
//   Landmark,
//   Leaf,
//   AlertCircle,
//   Phone,
//   Eye,
//   MoreVertical,
// } from 'lucide-react';
// import {
//   apiGetAdminInvoices,
//   apiUpdatePendingLateFeeWaiver,
// } from '@/service/api';
// import jsPDF from 'jspdf';

// function cls(...p) {
//   return p.filter(Boolean).join(' ');
// }

// function getRemainingDaysInfo(iso, status) {
//   if (status !== 'Pending') return null;
//   const due = new Date(iso);
//   if (Number.isNaN(due.getTime())) return null;
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   due.setHours(0, 0, 0, 0);
//   const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

//   let colorClass = 'bg-green-50 text-green-700 border-green-200';
//   if (diffDays < 10) {
//     colorClass = 'bg-red-50 text-red-700 border-red-200';
//   } else if (diffDays <= 30) {
//     colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
//   }

//   return { diffDays, colorClass };
// }

// // Display-only override: Buy (Sell) and Service invoices always show as
// // "Paid" in the UI, regardless of the actual stored status. Does NOT
// // mutate r.status, so filtering by Status dropdown still uses real data.
// function getDisplayStatus(r) {
//   if (r.productType === 'Sell' || r.productType === 'Service') return 'Paid';
//   return r.status;
// }

// function fmtDate(iso) {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return '—';
//   return d.toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
// }

// // The "first month" invoice of a rental group has no "-M{n}" suffix
// // (e.g. INV-A55530, INV-A55530-P2). Later months are INV-A55530-M2,
// // INV-A55530-M3, etc. Stripping that suffix gives the group's key,
// // which is exactly the first-month invoice's own invoiceNo.
// function getInvoiceGroupKey(invoiceNo) {
//   return String(invoiceNo || '').replace(/-M\d+$/, '');
// }

// // Numeric month order within a group: first-month invoice (no -M suffix)
// // is month 1, "-M2" is month 2, "-M3" is month 3, etc. Used purely for
// // sorting rows so a group's months always render in sequence.
// function getMonthOrder(invoiceNo) {
//   const match = String(invoiceNo || '').match(/-M(\d+)$/);
//   return match ? parseInt(match[1], 10) : 1;
// }

// // Display-only formatter: turns the real invoiceNo into INV-000001 style
// // for UI/PDF. Does NOT change r.invoiceNo used for grouping/search/CSV.
// // function getDisplayInvoiceNo(invoiceNo, numberMap) {
// //   const key = getInvoiceGroupKey(invoiceNo);
// //   const num = numberMap[key];
// //   if (!num) return invoiceNo; // fallback if not found in map
// //   const suffix = String(invoiceNo || '').slice(key.length); // e.g. "-M2"
// //   return `INV-${String(num).padStart(6, '0')}${suffix}`;
// // }
// // function getDisplayInvoiceNo(invoiceNo, numberMap) {
// //   const key = getInvoiceGroupKey(invoiceNo);
// //   const num = numberMap[key];
// //   if (!num) return invoiceNo; // fallback if not found in map
// //   // Month suffix (-M2, -M3...) no longer shown in the UI; all months of
// //   // the same rental group now display under the same INV-0001 number.
// //   return `INV-${String(num).padStart(4, '0')}`;
// // }

// function getDisplayInvoiceNo(invoiceNo, numberMap, row) {
//   // Prefer the backend-computed number (shared with the User side) so
//   // both tables always agree. Falls back to client-side calc if absent.
//   if (row?.displayInvoiceNo) return row.displayInvoiceNo;
//   const key = getInvoiceGroupKey(invoiceNo);
//   const num = numberMap[key];
//   if (!num) return invoiceNo;
//   return `INV-${String(num).padStart(4, '0')}`;
// }
// // // Display-only formatter: turns the real orderRef into the same
// // // sequential ORD-0001 style used across the Admin/Vendor/User Orders
// // // tables. Looks up the sequential number from orderRefNumberMap
// // // (built below from all invoices, oldest first). Does NOT change
// // // r.orderRef used elsewhere for filtering/search/CSV.
// // function getDisplayOrderId(orderRef, numberMap) {
// //   const num = numberMap ? numberMap[orderRef] : null;
// //   if (!num) return orderRef; // fallback if not found in map
// //   return `ORD-${String(num).padStart(4, '0')}`;
// // }
// function exportInvoicesCSV(rows) {
//   if (!rows.length) return;

//   const headers = [
//     'Invoice No',
//     'Order Ref',
//     'Customer Name',
//     'Customer Phone',
//     'Product / Service',
//     'Invoice Type', // Rental / Sell / Service
//     'Tenure',
//     'Due Date',
//     'Base Amount',
//     'Late Fee',
//     'Total Amount',
//     'Status',
//     'Note',
//   ];

//   const escapeCell = (val) => {
//     const s = String(val ?? '').replace(/"/g, '""');
//     return /[",\n]/.test(s) ? `"${s}"` : s;
//   };

//   // Forces Excel/Sheets to treat the date as plain text instead of
//   // auto-parsing it into a serial date number (which caused the "#####"
//   // column-overflow display bug). The ="..." wrapper is the standard CSV
//   // trick to preserve exact text in spreadsheet apps.
//   const forceTextCell = (val) => `="${String(val ?? '').replace(/"/g, '""')}"`;

//   const lines = [
//     headers.join(','),
//     ...rows.map((r) => {
//       const baseAmount = Number(r.amount || 0);
//       const lateFee = Number(r.lateFeeAmount || 0);
//       const totalAmount = baseAmount + lateFee;

//       return [
//         escapeCell(r.invoiceNo),
//         escapeCell(r.orderRef),
//         escapeCell(r.entityName),
//         escapeCell(r.entityPhone || ''),
//         escapeCell(r.productName || ''),
//         escapeCell(r.productType || r.type || ''),
//         escapeCell(r.tenure || ''),
//         forceTextCell(fmtDate(r.date)),
//         baseAmount.toFixed(2),
//         lateFee.toFixed(2),
//         totalAmount.toFixed(2),
//         escapeCell(r.status),
//         escapeCell(r.note || ''),
//       ].join(',');
//     }),
//   ];

//   const csvContent = '\uFEFF' + lines.join('\n'); // BOM for Excel UTF-8
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute(
//     'download',
//     `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`,
//   );
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// }

// // function downloadInvoicePDF(r, displayInvoiceNo, adminRemark) {
// //   const pdf = new jsPDF();
// //   const isCommission = r.type === 'Commission Invoice';
// //   const isSell = r.productType === 'Sell';
// //   const isService = r.productType === 'Service';
// //   const pdfDisplayStatus = isSell || isService ? 'Paid' : r.status;

// //   const docTitle = isCommission
// //     ? 'Commission Invoice'
// //     : isService
// //       ? 'Service Invoice'
// //       : isSell
// //         ? 'Buy Invoice'
// //         : 'Rent Receipt';

// //   const amountLabel = isCommission
// //     ? 'Commission Amount'
// //     : isService
// //       ? 'Service Amount'
// //       : isSell
// //         ? 'Buy Amount'
// //         : 'Rent Amount';

// //   let y = 20;

// //   pdf.setFontSize(16);
// //   pdf.text(docTitle, 14, y);

// //   pdf.setFontSize(10);
// //   pdf.text(`Invoice No: ${displayInvoiceNo || r.invoiceNo}`, 150, y, {
// //     align: 'left',
// //   });

// //   y += 10;
// //   pdf.setDrawColor(200);
// //   pdf.line(14, y, 196, y);

// //   y += 10;
// //   pdf.setFontSize(12);
// //   pdf.text(isCommission ? 'Vendor Details' : 'Customer Details', 14, y);
// //   y += 8;
// //   pdf.setFontSize(10);
// //   pdf.text(`Name: ${r.entityName}`, 14, y);
// //   y += 6;
// //   pdf.text(`Phone: ${r.entityPhone || '—'}`, 14, y);

// //   y += 12;
// //   pdf.setFontSize(12);
// //   pdf.text('Order Details', 14, y);
// //   y += 8;
// //   pdf.setFontSize(10);
// //   // pdf.text(`Order Reference: #${r.orderRef}`, 14, y);
// //   // pdf.text(`Order Reference: ${displayOrderId || r.orderRef}`, 14, y);
// //   pdf.text(`Order Reference: ${r.orderRef}`, 14, y);
// //   y += 6;
// //   pdf.text(`Date: ${fmtDate(r.date)}`, 14, y);
// //   // y += 6;
// //   // pdf.text(`Status: ${r.status === 'Pending' ? 'Unpaid' : r.status}`, 14, y);
// //   y += 6;
// //   pdf.text(
// //     `Status: ${pdfDisplayStatus === 'Pending' ? 'Unpaid' : pdfDisplayStatus}`,
// //     14,
// //     y,
// //   );

// //   if (r.note) {
// //     y += 6;
// //     pdf.text(`Note: ${r.note}`, 14, y);
// //   }

// //   y += 14;
// //   pdf.setDrawColor(200);
// //   pdf.line(14, y, 196, y);

// //   y += 12;
// //   pdf.setFontSize(13);
// //   pdf.text(
// //     `${amountLabel}: Rs. ${Number(r.amount || 0).toLocaleString('en-IN')}`,
// //     14,
// //     y,
// //   );

// //   if (Number(r.lateFeeAmount) > 0) {
// //     y += 8;
// //     pdf.setFontSize(10);
// //     pdf.setTextColor(200, 0, 0);
// //     pdf.text(
// //       `Late Fee (${r.daysLate} day${r.daysLate === 1 ? '' : 's'} late): Rs. ${Number(
// //         r.lateFeeAmount,
// //       ).toLocaleString('en-IN')}`,
// //       14,
// //       y,
// //     );
// //     pdf.setTextColor(0);

// //     y += 8;
// //     pdf.setFontSize(13);
// //     pdf.setTextColor(0);
// //     pdf.text(
// //       `Total Payable: Rs. ${(
// //         Number(r.amount || 0) + Number(r.lateFeeAmount || 0)
// //       ).toLocaleString('en-IN')}`,
// //       14,
// //       y,
// //     );
// //   }

// //   if (adminRemark) {
// //     y += 14;
// //     pdf.setDrawColor(200);
// //     pdf.line(14, y, 196, y);

// //     y += 10;
// //     pdf.setFontSize(11);
// //     pdf.setTextColor(0);
// //     pdf.text('Remark', 14, y);
// //     y += 7;
// //     pdf.setFontSize(10);
// //     pdf.setTextColor(80);
// //     const remarkLines = pdf.splitTextToSize(adminRemark, 180);
// //     pdf.text(remarkLines, 14, y);
// //     y += remarkLines.length * 5;
// //     pdf.setTextColor(0);
// //   }

// //   y += 20;
// //   pdf.setFontSize(9);
// //   pdf.setTextColor(120);
// //   pdf.text(
// //     'This is a system-generated document. No signature required.',
// //     14,
// //     y,
// //   );

// //   pdf.save(`${displayInvoiceNo || r.invoiceNo}.pdf`);
// // }

// function downloadInvoicePDF(r, displayInvoiceNo, adminRemark) {
//   const pdf = new jsPDF();
//   const pageW = 210;
//   const marginX = 14;
//   const rightX = pageW - marginX;

//   const isCommission = r.type === 'Commission Invoice';
//   const isSell = r.productType === 'Sell';
//   const isService = r.productType === 'Service';
//   const pdfDisplayStatus = isSell || isService ? 'Paid' : r.status;

//   const docTitle = isCommission
//     ? 'Commission Invoice'
//     : isService
//       ? 'Service Invoice'
//       : isSell
//         ? 'Buy Invoice'
//         : 'Rent Receipt';

//   const amountLabel = isCommission
//     ? 'Commission Amount'
//     : isService
//       ? 'Service Amount'
//       : isSell
//         ? 'Buy Amount'
//         : 'Rent Amount';

//   const invNo = displayInvoiceNo || r.invoiceNo;

//   let y = 20;

//   // ── Header: title + logo/company block (left) + address (right) ──
//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(`${docTitle} - ${invNo}`, marginX, y);
//   pdf.setFont(undefined, 'normal');

//   y += 5;
//   pdf.setDrawColor(230);
//   pdf.line(marginX, y, rightX, y);

//   const logoY = y + 14;
//   pdf.setFillColor(255, 140, 0);
//   pdf.circle(marginX + 8, logoY, 8, 'F');
//   pdf.setTextColor(255, 255, 255);
//   pdf.setFontSize(22);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('R', marginX + 8, logoY + 2.5, { align: 'center' });
//   pdf.setTextColor(0, 0, 0);

//   pdf.setFontSize(14);
//   pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
//   pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

//   pdf.setFontSize(9);
//   const addrLines = [
//     'State: Maharashtra || State Code: 27',
//     'City: Pune',
//     'Address: B1-1002, Sr. No. 41/1/1,',
//     'Near Kakde Terrace, Warje,',
//     'Pune - 411058, Maharashtra, India.',
//   ];
//   let addrY = y + 8;
//   addrLines.forEach((line) => {
//     pdf.text(line, rightX, addrY, { align: 'right' });
//     addrY += 5;
//   });

//   y = Math.max(logoY + 16, addrY + 4);

//   // ── Details box (Invoice Details left, Billed-to right) ──
//   const boxTop = y;
//   const boxHeight = isCommission ? 62 : 56;
//   pdf.setFillColor(245, 247, 250);
//   pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

//   let leftY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Details', marginX + 6, leftY);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);

//   const details = [
//     ['Order Number', r.orderRef || '-'],
//     ['Date', fmtDate(r.date)],
//     ['Status', pdfDisplayStatus === 'Pending' ? 'Unpaid' : pdfDisplayStatus],
//     ...(r.note ? [['Note', r.note]] : []),
//     ...(isCommission && r.commissionRate != null
//       ? [['Commission Rate', `${r.commissionRate}%`]]
//       : []),
//   ];

//   leftY += 7;
//   details.forEach(([label, val]) => {
//     pdf.setFont(undefined, 'bold');
//     pdf.text(label, marginX + 6, leftY);
//     pdf.setFont(undefined, 'normal');
//     const wrapped = pdf.splitTextToSize(String(val), 55);
//     pdf.text(wrapped, marginX + 45, leftY);
//     leftY += 6 * wrapped.length;
//   });

//   leftY += 2;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(amountLabel, marginX + 6, leftY);
//   pdf.text(
//     `Rs. ${Number(r.amount || 0).toLocaleString('en-IN')}`,
//     marginX + 45,
//     leftY,
//   );
//   pdf.setFont(undefined, 'normal');

//   let rightY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(
//     isCommission ? 'Billed to (Vendor)' : 'Billed to',
//     rightX - 6,
//     rightY,
//     {
//       align: 'right',
//     },
//   );
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   rightY += 7;
//   pdf.text(r.entityName || '-', rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   pdf.text(r.entityPhone || '-', rightX - 6, rightY, { align: 'right' });

//   y = boxTop + boxHeight + 12;

//   // ── Late fee / total payable (Rent/Buy/Service only) ──
//   if (!isCommission && Number(r.lateFeeAmount) > 0) {
//     pdf.setFontSize(10);
//     pdf.setTextColor(200, 0, 0);
//     pdf.text(
//       `Late Fee (${r.daysLate} day${r.daysLate === 1 ? '' : 's'} late): Rs. ${Number(
//         r.lateFeeAmount,
//       ).toLocaleString('en-IN')}`,
//       marginX,
//       y,
//     );
//     pdf.setTextColor(0);
//     y += 8;

//     pdf.setFontSize(13);
//     pdf.setFont(undefined, 'bold');
//     pdf.text(
//       `Total Payable: Rs. ${(
//         Number(r.amount || 0) + Number(r.lateFeeAmount || 0)
//       ).toLocaleString('en-IN')}`,
//       marginX,
//       y,
//     );
//     pdf.setFont(undefined, 'normal');
//     y += 10;
//   }

//   // ── Admin remark ──
//   if (adminRemark) {
//     pdf.setDrawColor(200);
//     pdf.line(marginX, y, rightX, y);
//     y += 10;
//     pdf.setFontSize(11);
//     pdf.setFont(undefined, 'bold');
//     pdf.setTextColor(0);
//     pdf.text('Remark', marginX, y);
//     pdf.setFont(undefined, 'normal');
//     y += 7;
//     pdf.setFontSize(10);
//     pdf.setTextColor(80);
//     const remarkLines = pdf.splitTextToSize(adminRemark, rightX - marginX);
//     pdf.text(remarkLines, marginX, y);
//     y += remarkLines.length * 5;
//     pdf.setTextColor(0);
//   }

//   y += 12;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     marginX,
//     y,
//   );
//   pdf.setTextColor(0, 0, 0);

//   pdf.save(`${invNo}.pdf`);
// }

// const INVOICE_TYPES = ['All Types', 'Rental', 'Sell', 'Service'];
// const INVOICE_TYPE_LABELS = {
//   'All Types': 'All Types',
//   Rental: 'Rental',
//   Sell: 'Buy',
//   Service: 'Service',
// };
// const STATUSES = ['All Status', 'Paid', 'Unpaid'];
// const STATUS_LABELS = {
//   'All Status': 'All Status',
//   Paid: 'Paid',
//   Pending: 'Unpaid',
// };

// const TYPE_BADGE = {
//   'Rent Receipt': {
//     bg: 'bg-[#EFF6FF]',
//     text: 'text-[#155DFC]',
//     border: 'border-[#DBEAFE]',
//   },
//   'Commission Invoice': {
//     bg: 'bg-[#FAF5FF]',
//     text: 'text-[#9810FA]',
//     border: 'border-[#F3E8FF]',
//   },
// };

// const STATUS_BADGE = {
//   Paid: { dot: 'bg-green-500', text: 'text-green-700' },
//   Pending: { dot: 'bg-amber-400', text: 'text-amber-700' },
//   Overdue: { dot: 'bg-red-500', text: 'text-red-700' },
// };

// const ITEMS_PER_PAGE = 30;

// export default function SystemInvoices() {
//   const [search, setSearch] = useState('');
//   const [invoiceType, setInvoiceType] = useState('All Types');
//   const [monthPeriod, setMonthPeriod] = useState('');
//   // Default filter view: show Unpaid invoices only, All Types.
//   const [status, setStatus] = useState('Pending');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selected, setSelected] = useState([]);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [viewInvoice, setViewInvoice] = useState(null);
//   const [remarkDraft, setRemarkDraft] = useState('');
//   const [waiverDraft, setWaiverDraft] = useState('');
//   const [waiverReasonDraft, setWaiverReasonDraft] = useState('');
//   const [waiverSubmitting, setWaiverSubmitting] = useState(false);
//   const [waiverError, setWaiverError] = useState('');

//   const [invoices, setInvoices] = useState([]);
//   const [summary, setSummary] = useState({
//     pendingAmount: 0,
//     paidAmount: 0,
//     commissions: 0,
//     gst: 0,
//     careTax: 0,
//     lateFees: 0,
//     repairWarranty: 0,
//     relocationWarranty: 0,
//     deliveryPackaging: 0,
//     installationFee: 0,
//     platformFee: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   const [remarks, setRemarks] = useState(() => {
//     if (typeof window === 'undefined') return {};
//     try {
//       const saved = localStorage.getItem('invoiceRemarks');
//       return saved ? JSON.parse(saved) : {};
//     } catch (e) {
//       return {};
//     }
//   });

//   // Persist remarks whenever they change (skips the very first render
//   // so we never re-write the same data we just loaded)
//   const isFirstRemarksRender = useRef(true);
//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     if (isFirstRemarksRender.current) {
//       isFirstRemarksRender.current = false;
//       return;
//     }
//     try {
//       localStorage.setItem('invoiceRemarks', JSON.stringify(remarks));
//     } catch (e) {
//       // ignore storage errors (e.g. quota exceeded)
//     }
//   }, [remarks]);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     // apiGetAdminInvoices(token, {
//     //   month: monthPeriod || undefined,
//     //   type: invoiceType !== 'All Types' ? invoiceType : undefined,
//     //   status: status !== 'All Status' ? status : undefined,
//     //   search: search || undefined,
//     // })
//     apiGetAdminInvoices(token, {
//       month: monthPeriod || undefined,
//       // Type is now filtered client-side (see `filtered` below), same as
//       // Status, so invoiceNumberMap is always built from the FULL invoice
//       // list — giving one continuous INV-000001, 000002... sequence across
//       // Rent/Buy/Service instead of each type restarting at 000001.
//       search: search || undefined,
//     })
//       .then((res) => {
//         setInvoices(
//           Array.isArray(res?.data?.invoices) ? res.data.invoices : [],
//         );
//         setSummary(res?.data?.summary || summary);
//       })
//       .catch(() => {
//         setInvoices([]);
//       })
//       .finally(() => setLoading(false));
//   }, [search, invoiceType, status, monthPeriod]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, invoiceType, status, monthPeriod]);

//   // Server applies search/type/month filters. Status is filtered here on
//   // the client using getDisplayStatus() so Buy/Service invoices (which
//   // always DISPLAY as "Paid") are correctly included/excluded regardless
//   // of their real stored status.
//   const filtered = useMemo(() => {
//     let rows = invoices;
//     if (invoiceType !== 'All Types') {
//       rows = rows.filter((inv) => inv.productType === invoiceType);
//     }
//     if (status !== 'All Status') {
//       rows = rows.filter((inv) => getDisplayStatus(inv) === status);
//     }
//     return rows;
//   }, [invoices, invoiceType, status]);

//   // Sequential display numbers (INV-000001, INV-000002...) based on
//   // date, oldest first. Frontend display only — does not affect
//   // r.invoiceNo used elsewhere for grouping/search/CSV export.
//   const invoiceNumberMap = useMemo(() => {
//     const seen = new Set();
//     const orderedKeys = [];
//     [...invoices]
//       .sort((a, b) => new Date(a.date) - new Date(b.date))
//       .forEach((inv) => {
//         const key = getInvoiceGroupKey(inv.invoiceNo);
//         if (!seen.has(key)) {
//           seen.add(key);
//           orderedKeys.push(key);
//         }
//       });
//     const map = {};
//     orderedKeys.forEach((key, idx) => {
//       map[key] = idx + 1;
//     });
//     return map;
//   }, [invoices]);

//   // // Sequential ORD-0001 style numbers for orderRef, based on each
//   // // unique orderRef's earliest invoice date — mirrors the ORD-0001
//   // // numbering already used in the Orders panel. Display only.
//   // const orderRefNumberMap = useMemo(() => {
//   //   const seen = new Set();
//   //   const orderedRefs = [];
//   //   [...invoices]
//   //     .sort((a, b) => new Date(a.date) - new Date(b.date))
//   //     .forEach((inv) => {
//   //       const ref = inv.orderRef;
//   //       if (ref && !seen.has(ref)) {
//   //         seen.add(ref);
//   //         orderedRefs.push(ref);
//   //       }
//   //     });
//   //   const map = {};
//   //   orderedRefs.forEach((ref, idx) => {
//   //     map[ref] = idx + 1;
//   //   });
//   //   return map;
//   // }, [invoices]);

//   // Every invoice row (including M2, M3...) is shown directly in the main
//   // table now — no separate "click to expand months" panel. Rows are
//   // sorted so each group's own invoice number order (oldest first) is
//   // preserved, and within a group the months always appear in sequence:
//   // M1 (no suffix), M2, M3, ...
//   // const mainRows = useMemo(() => {
//   //   return [...filtered].sort((a, b) => {
//   //     const keyA = getInvoiceGroupKey(a.invoiceNo);
//   //     const keyB = getInvoiceGroupKey(b.invoiceNo);
//   //     const orderA = invoiceNumberMap[keyA] || 0;
//   //     const orderB = invoiceNumberMap[keyB] || 0;
//   //     if (orderA !== orderB) return orderA - orderB;
//   //     return getMonthOrder(a.invoiceNo) - getMonthOrder(b.invoiceNo);
//   //   });
//   // }, [filtered, invoiceNumberMap]);
//   // const mainRows = useMemo(() => {
//   //   return [...filtered].sort((a, b) => {
//   //     const keyA = getInvoiceGroupKey(a.invoiceNo);
//   //     const keyB = getInvoiceGroupKey(b.invoiceNo);
//   //     const orderA = invoiceNumberMap[keyA] || 0;
//   //     const orderB = invoiceNumberMap[keyB] || 0;
//   //     // Newest invoice group first (page 1 shows latest), but months
//   //     // within a group still stay in order M1 -> M2 -> M3...
//   //     if (orderA !== orderB) return orderB - orderA;
//   //     return getMonthOrder(a.invoiceNo) - getMonthOrder(b.invoiceNo);
//   //   });
//   // }, [filtered, invoiceNumberMap]);
//   const mainRows = useMemo(() => {
//     return [...filtered].sort((a, b) => {
//       // Sort by nearest Due Date first, across all invoices/customers —
//       // rows with the same due date (e.g. all "31 days" invoices) are
//       // grouped together automatically since same date sorts equal here,
//       // then falls back to group order + month order for stable tie-breaks.
//       const dateA = new Date(a.date).getTime();
//       const dateB = new Date(b.date).getTime();
//       if (dateA !== dateB) return dateA - dateB;

//       const keyA = getInvoiceGroupKey(a.invoiceNo);
//       const keyB = getInvoiceGroupKey(b.invoiceNo);
//       const orderA = invoiceNumberMap[keyA] || 0;
//       const orderB = invoiceNumberMap[keyB] || 0;
//       if (orderA !== orderB) return orderB - orderA;
//       return getMonthOrder(a.invoiceNo) - getMonthOrder(b.invoiceNo);
//     });
//   }, [filtered, invoiceNumberMap]);

//   const totalPages = Math.max(1, Math.ceil(mainRows.length / ITEMS_PER_PAGE));

//   // // Dynamically calculated total commission from invoice data
//   // // (fallback/override in case summary.commissions from API is incorrect or 0)
//   // const totalCommission = useMemo(() => {
//   //   return invoices.reduce(
//   //     (sum, inv) => sum + Number(inv.commissionAmount || 0),
//   //     0,
//   //   );
//   // }, [invoices]);
//   // Total Commission now comes straight from the backend summary, computed
//   // with the same formula as City Dashboard (Revenue & Settlements) and
//   // Financial Performance (Net Profit) — order.platformFee, else category
//   // commissionRate, else flat 10% fallback. Keeps all three in sync.
//   const totalCommission = Number(summary.commissions || 0);

//   const paginated = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return mainRows.slice(start, start + ITEMS_PER_PAGE);
//   }, [mainRows, currentPage]);

//   // For every invoice row that has a real commission amount, insert a
//   // synthetic "COM-xxxxxx" row right below it — same order/customer/
//   // product/tenure/due date/status, but Amount = the commission value.
//   // Purely a display construct; does not touch r.invoiceNo grouping,
//   // filtering, search, or CSV export logic elsewhere. Runs on every
//   // month row (M1/M2/M3...), so each month's own commission (if any)
//   // shows directly beneath it, in order.
//   // const paginatedWithCommission = useMemo(() => {
//   //   const rows = [];
//   //   paginated.forEach((r) => {
//   //     rows.push(r);
//   //     if (r.commissionAmount != null) {
//   //       const mainDisplayNo = getDisplayInvoiceNo(
//   //         r.invoiceNo,
//   //         invoiceNumberMap,
//   //       );
//   //       const comDisplayNo = mainDisplayNo.replace(/^INV-/, 'COM-');
//   //       rows.push({
//   //         ...r,
//   //         _id: `${r._id}-commission`,
//   //         invoiceNo: `${r.invoiceNo}-COMM`,
//   //         _displayInvoiceNoOverride: comDisplayNo,
//   //         type: 'Commission Invoice',
//   //         amount: r.commissionAmount,
//   //         lateFeeAmount: 0,
//   //         commissionRate: r.commissionRate,
//   //         commissionAmount: null,
//   //         netSettled: null,
//   //         isCommissionRow: true,
//   //         entityName: r.vendorName || 'Unknown Vendor',
//   //         entityPhone: r.vendorPhone || '',
//   //       });
//   //     }
//   //   });
//   //   return rows;
//   // }, [paginated, invoiceNumberMap]);
//   // Commission rows removed from display — main invoice rows only.
//   const paginatedWithCommission = useMemo(() => {
//     return paginated;
//   }, [paginated]);

//   const allSelected =
//     paginated.length > 0 && paginated.every((r) => selected.includes(r._id));

//   const toggleAll = () => {
//     if (allSelected) {
//       setSelected((prev) =>
//         prev.filter((id) => !paginated.find((r) => r._id === id)),
//       );
//     } else {
//       setSelected((prev) => [
//         ...prev,
//         ...paginated.map((r) => r._id).filter((id) => !prev.includes(id)),
//       ]);
//     }
//   };

//   const toggleOne = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );
//   };

//   const totalShowing = mainRows.length;
//   const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
//   const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, mainRows.length);

//   return (
//     <div className="min-h-full bg-[#f2f4f8] -m-3 sm:-m-4 md:-m-6 p-4 sm:p-6 md:p-8">
//       <div className="max-w-6xl mx-auto space-y-5">
//         {/* Row 1 — Pending / Paid / Late Fees */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-5">
//             <p className="text-xs font-semibold tracking-widest text-[#155DFC] uppercase">
//               Pending Invoices
//             </p>
//             <p className="mt-2 text-3xl font-bold text-[#155DFC]">
//               ₹{Number(summary.pendingAmount || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#F3E8FF] bg-[#FAF5FF] p-5">
//             <p className="text-xs font-semibold tracking-widest text-[#9810FA] uppercase">
//               Paid Invoices
//             </p>
//             <p className="mt-2 text-3xl font-bold text-[#9810FA]">
//               ₹{Number(summary.paidAmount || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#FEF3C7] bg-yellow-100 p-5">
//             <div className="flex items-center gap-2 mb-2">
//               {/* <div className="h-8 w-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center">
//                   <TrendingUp className="h-4 w-4 text-[#D97706]" />
//                 </div> */}
//               <p className="text-xs font-semibold tracking-widest text-[#D97706] uppercase">
//                 Total Commission
//               </p>
//             </div>
//             <p className="mt-2 text-3xl font-bold text-[#D97706]">
//               ₹{totalCommission.toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Row 2 — Commission / GST / Care Tax / Other Charges */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="rounded-2xl border border-[#DCFCE7] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
//                 <Leaf className="h-4 w-4 text-[#16A34A]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">Late Fees</p>
//             </div>
//             <p className="text-xl font-bold text-[#16A34A]">
//               ₹{Number(summary.lateFees || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
//                 <Landmark className="h-4 w-4 text-[#155DFC]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">GST</p>
//             </div>
//             <p className="text-xl font-bold text-[#155DFC]">
//               ₹{Number(summary.gst || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#FFEDD5] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
//                 <Leaf className="h-4 w-4 text-[#EA580C]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">Care Tax</p>
//             </div>
//             <p className="text-xl font-bold text-[#EA580C]">
//               ₹{Number(summary.careTax || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#E0E7FF] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
//                 <FileText className="h-4 w-4 text-[#4F46E5]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">
//                 Repair & Warranty
//               </p>
//             </div>
//             <p className="text-xl font-bold text-[#4F46E5]">
//               ₹{Number(summary.repairWarranty || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#FCE7F3] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#FDF2F8] flex items-center justify-center">
//                 <FileText className="h-4 w-4 text-[#DB2777]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">
//                 Relocation Warranty
//               </p>
//             </div>
//             <p className="text-xl font-bold text-[#DB2777]">
//               ₹{Number(summary.relocationWarranty || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#CFFAFE] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#ECFEFF] flex items-center justify-center">
//                 <FileText className="h-4 w-4 text-[#0891B2]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">
//                 Delivery & Packaging
//               </p>
//             </div>
//             <p className="text-xl font-bold text-[#0891B2]">
//               ₹{Number(summary.deliveryPackaging || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#FEF9C3] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#FEFCE8] flex items-center justify-center">
//                 <FileText className="h-4 w-4 text-[#CA8A04]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">
//                 Installation Fee
//               </p>
//             </div>
//             <p className="text-xl font-bold text-[#CA8A04]">
//               ₹{Number(summary.installationFee || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//           <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-8 w-8 rounded-lg bg-[#F9FAFB] flex items-center justify-center">
//                 <FileText className="h-4 w-4 text-[#475569]" />
//               </div>
//               <p className="text-xs text-slate-500 font-medium">Platform Fee</p>
//             </div>
//             <p className="text-xl font-bold text-[#475569]">
//               ₹{Number(summary.platformFee || 0).toLocaleString('en-IN')}
//             </p>
//           </div>
//         </div>

//         {/* Search + Filters */}
//         <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 space-y-3">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1 sm:max-w-md">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by Order ID, Product Name, or Customer Name"
//                 className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#6C3EFA]"
//               />
//             </div>
//             <button
//               type="button"
//               onClick={() => exportInvoicesCSV(filtered)}
//               disabled={filtered.length === 0}
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#16A34A] text-[#16A34A] text-sm font-medium hover:bg-[#F0FDF4] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 sm:ml-auto"
//             >
//               <Download className="h-4 w-4" />
//               Export Tally/Excel Format
//             </button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//             <div>
//               <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
//                 Invoice Type
//               </label>
//               <select
//                 value={invoiceType}
//                 onChange={(e) => setInvoiceType(e.target.value)}
//                 className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
//               >
//                 {INVOICE_TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {INVOICE_TYPE_LABELS[t] || t}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
//                 Month / Period
//               </label>
//               <input
//                 type="month"
//                 value={monthPeriod}
//                 onChange={(e) => setMonthPeriod(e.target.value)}
//                 className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
//               />
//             </div>
//             <div>
//               <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
//                 Status
//               </label>
//               <select
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//                 className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
//               >
//                 {STATUSES.map((s) => (
//                   <option key={s} value={s === 'Unpaid' ? 'Pending' : s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Table — single unified table; M1/M2/M3... and their commission
//               rows all render inline, in order, no separate expand panel */}
//         <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-slate-100 bg-slate-50">
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
//                     Invoice no
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap min-w-[90px]">
//                     Order id
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
//                     Customer info
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
//                     Product
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
//                     Tenure
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
//                     Due Date
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
//                     Amount
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
//                     Remaining
//                   </th>
//                   {/* <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
//                       Remark
//                     </th> */}
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {loading ? (
//                   <tr>
//                     <td
//                       colSpan={10}
//                       className="py-10 text-center text-sm text-slate-400"
//                     >
//                       Loading invoices…
//                     </td>
//                   </tr>
//                 ) : paginated.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={10}
//                       className="py-10 text-center text-sm text-slate-400"
//                     >
//                       No invoices found.
//                     </td>
//                   </tr>
//                 ) : (
//                   paginatedWithCommission.map((r) => {
//                     const displayStatus = getDisplayStatus(r);
//                     const statusStyle =
//                       STATUS_BADGE[displayStatus] || STATUS_BADGE['Pending'];
//                     const remainingInfo =
//                       r.productType === 'Service' || r.productType === 'Sell'
//                         ? null
//                         : getRemainingDaysInfo(r.date, r.status);
//                     return (
//                       <tr
//                         key={r._id}
//                         className="hover:bg-slate-50 transition text-center"
//                       >
//                         <td className="px-4 py-3">
//                           <p className="font-semibold whitespace-nowrap text-black">
//                             {/* {r.isCommissionRow
//                               ? r._displayInvoiceNoOverride
//                               : getDisplayInvoiceNo(
//                                   r.invoiceNo,
//                                   invoiceNumberMap,
//                                 )} */}
//                             {r.isCommissionRow
//                               ? r._displayInvoiceNoOverride
//                               : getDisplayInvoiceNo(
//                                   r.invoiceNo,
//                                   invoiceNumberMap,
//                                   r,
//                                 )}
//                           </p>
//                           {r.isCommissionRow && r.commissionRate != null ? (
//                             <p className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
//                               {/* {r.commissionRate}% fee on Order #{r.orderRef} */}
//                               {/* {r.commissionRate}% fee on Order{' '}
//                                 {getDisplayOrderId(r.orderRef, orderRefNumberMap)} */}
//                               {r.commissionRate}% fee on Order {r.orderRef}
//                             </p>
//                           ) : r.note ? (
//                             <p className="text-[11px] text-slate-400 mt-0.5">
//                               {r.note}
//                             </p>
//                           ) : null}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <span
//                             className={cls(
//                               'font-medium',
//                               r.isCommissionRow
//                                 ? 'text-[#9810FA]'
//                                 : 'text-[#155DFC]',
//                             )}
//                           >
//                             {r.orderRef}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           {r.isCommissionRow ? (
//                             <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
//                               Vendor
//                             </p>
//                           ) : null}
//                           <p className="font-medium text-black">
//                             {r.entityName}
//                           </p>
//                           {r.entityPhone ? (
//                             <p className="text-xs text-slate-400">
//                               {r.entityPhone}
//                             </p>
//                           ) : null}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center justify-center gap-2.5">
//                             {r.productImage ? (
//                               <img
//                                 src={r.productImage}
//                                 alt={r.productName || 'Product'}
//                                 className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0"
//                                 onError={(e) => {
//                                   e.currentTarget.style.display = 'none';
//                                 }}
//                               />
//                             ) : (
//                               <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 shrink-0" />
//                             )}
//                             <div className="min-w-0 max-w-[160px]">
//                               <p
//                                 className="font-medium text-black truncate"
//                                 title={r.productName || ''}
//                               >
//                                 {r.productName || '—'}
//                               </p>
//                               {r.variantName ? (
//                                 <p
//                                   className="text-xs text-slate-400 truncate"
//                                   title={r.variantName}
//                                 >
//                                   {r.variantName}
//                                 </p>
//                               ) : null}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">
//                           {r.tenure || '—'}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">
//                           {fmtDate(r.date)}
//                         </td>
//                         {/* <td className="px-4 py-3 text-center">
//                           <span className="font-semibold text-black">
//                             ₹{r.amount.toLocaleString('en-IN')}
//                           </span>
//                           {r.lateFeeAmount > 0 ? (
//                             <p className="text-[11px] text-red-500 mt-0.5">
//                               + ₹{r.lateFeeAmount.toLocaleString('en-IN')} late
//                               fee
//                             </p>
//                           ) : null}
//                         </td> */}
//                         <td className="px-4 py-3 text-center">
//                           {(() => {
//                             const gstForRow = Number(r.gst || 0);
//                             const careTaxForRow = Number(r.careTax || 0);
//                             const displayAmount =
//                               Number(r.amount || 0) + gstForRow + careTaxForRow;
//                             return (
//                               <>
//                                 <span className="font-semibold text-black">
//                                   ₹{displayAmount.toLocaleString('en-IN')}
//                                 </span>
//                                 {/* {gstForRow > 0 || careTaxForRow > 0 ? (
//                                   <p className="text-[10px] text-slate-400 mt-0.5">
//                                     Rent ₹
//                                     {Number(r.amount || 0).toLocaleString(
//                                       'en-IN',
//                                     )}
//                                     {gstForRow > 0
//                                       ? ` + ₹${gstForRow.toLocaleString('en-IN')} GST`
//                                       : ''}
//                                     {careTaxForRow > 0
//                                       ? ` + ₹${careTaxForRow.toLocaleString('en-IN')} Care Tax`
//                                       : ''}
//                                   </p>
//                                 ) : null} */}
//                                 {/* {r.lateFeeAmount > 0 ? (
//                                   <p className="text-[11px] text-red-500 mt-0.5">
//                                     + ₹{r.lateFeeAmount.toLocaleString('en-IN')}{' '}
//                                     late fee
//                                   </p>
//                                 ) : null} */}
//                               </>
//                             );
//                           })()}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center justify-center gap-1.5">
//                             <span
//                               className={cls(
//                                 'h-2 w-2 rounded-full shrink-0',
//                                 statusStyle.dot,
//                               )}
//                             />
//                             {/* <span
//                                 className={cls(
//                                   'text-xs font-semibold',
//                                   statusStyle.text,
//                                 )}
//                               >
//                                 {r.status === 'Pending' ? 'Unpaid' : r.status}
//                               </span> */}
//                             <span
//                               className={cls(
//                                 'text-xs font-semibold',
//                                 statusStyle.text,
//                               )}
//                             >
//                               {displayStatus === 'Pending'
//                                 ? 'Unpaid'
//                                 : displayStatus}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           {remainingInfo ? (
//                             <span
//                               className={cls(
//                                 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap',
//                                 remainingInfo.colorClass,
//                               )}
//                             >
//                               {remainingInfo.diffDays < 0
//                                 ? `${Math.abs(remainingInfo.diffDays)}d overdue`
//                                 : `${remainingInfo.diffDays} days`}
//                             </span>
//                           ) : (
//                             <span className="text-xs text-slate-300">—</span>
//                           )}
//                         </td>
//                         {/* <td className="px-4 py-3 max-w-[140px]">
//                             {remarks[r._id] ? (
//                               <p
//                                 className="text-xs text-slate-600 truncate"
//                                 title={remarks[r._id]}
//                               >
//                                 {remarks[r._id]}
//                               </p>
//                             ) : (
//                               <span className="text-xs text-slate-300">—</span>
//                             )}
//                           </td> */}
//                         <td className="px-4 py-3 relative text-center">
//                           <button
//                             type="button"
//                             title="Actions"
//                             onClick={() =>
//                               setOpenMenuId((prev) =>
//                                 prev === r._id ? null : r._id,
//                               )
//                             }
//                             className="h-8 w-8 mx-auto rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
//                           >
//                             <MoreVertical className="h-3.5 w-3.5" />
//                           </button>
//                           {/* {openMenuId === r._id ? (
//                               <div className="absolute right-4 z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     dInvoicePDF(
//                                       r,
//                                       r.isCommissionRow
//                                         ? r._displayInvoiceNoOverride
//                                         : getDisplayInvoiceNo(
//                                             r.invoiceNo,
//                                             invoiceNumberMap,
//                                           ),
//                                       remarks[r._id],
//                                     );
//                                     setOpenMenuId(null);
//                                   }}
//                                   className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                                 >
//                                   <Receipt className="h-3.5 w-3.5 text-[#EA580C]" />
//                                   Download PDF
//                                 </button> */}
//                           {openMenuId === r._id ? (
//                             <div className="absolute right-4 z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
//                               <div className="px-3 py-2 text-xs font-semibold border-b border-slate-100 flex items-center justify-between">
//                                 <span className="text-slate-500">Late Fee</span>
//                                 <span
//                                   className={
//                                     Number(r.lateFeeAmount) > 0
//                                       ? 'text-red-600'
//                                       : 'text-slate-400'
//                                   }
//                                 >
//                                   ₹
//                                   {Number(r.lateFeeAmount || 0).toLocaleString(
//                                     'en-IN',
//                                   )}
//                                 </span>
//                               </div>
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   // downloadInvoicePDF(
//                                   //   r,
//                                   //   r.isCommissionRow
//                                   //     ? r._displayInvoiceNoOverride
//                                   //     : getDisplayInvoiceNo(
//                                   //         r.invoiceNo,
//                                   //         invoiceNumberMap,
//                                   //       ),
//                                   //   remarks[r._id],
//                                   // );
//                                   downloadInvoicePDF(
//                                     r,
//                                     r.isCommissionRow
//                                       ? r._displayInvoiceNoOverride
//                                       : getDisplayInvoiceNo(
//                                           r.invoiceNo,
//                                           invoiceNumberMap,
//                                           r,
//                                         ),
//                                     remarks[r._id],
//                                   );
//                                   setOpenMenuId(null);
//                                 }}
//                                 className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                               >
//                                 <Receipt className="h-3.5 w-3.5 text-[#EA580C]" />
//                                 Download PDF
//                               </button>
//                               {r.entityPhone ? (
//                                 <a
//                                   href={`tel:${r.entityPhone}`}
//                                   onClick={() => setOpenMenuId(null)}
//                                   className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                                 >
//                                   <Phone className="h-3.5 w-3.5 text-slate-500" />
//                                   Call {r.entityPhone}
//                                 </a>
//                               ) : (
//                                 <span className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 cursor-not-allowed">
//                                   <Phone className="h-3.5 w-3.5" />
//                                   No phone number
//                                 </span>
//                               )}
//                               {/* <button
//                                 type="button"
//                                 onClick={() => {
//                                   setViewInvoice(r);
//                                   setRemarkDraft(remarks[r._id] ?? '');
//                                   setOpenMenuId(null);
//                                 }}
//                                 className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                               >
//                                 <Eye className="h-3.5 w-3.5 text-slate-500" />
//                                 View
//                               </button> */}
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setViewInvoice(r);
//                                   setRemarkDraft(remarks[r._id] ?? '');
//                                   setWaiverDraft('');
//                                   setWaiverReasonDraft('');
//                                   setWaiverError('');
//                                   setOpenMenuId(null);
//                                 }}
//                                 className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                               >
//                                 <Eye className="h-3.5 w-3.5 text-slate-500" />
//                                 View
//                               </button>
//                             </div>
//                           ) : null}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Footer */}
//           <div className="border-t border-slate-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
//             <p className="text-xs text-slate-500">
//               Showing {totalShowing === 0 ? 0 : startIdx}–{endIdx} of{' '}
//               {totalShowing} Invoices
//             </p>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition"
//               >
//                 Previous
//               </button>

//               <div className="flex items-center gap-1">
//                 <span className="h-8 w-8 rounded-lg text-sm border border-[#6C3EFA] bg-[#6C3EFA] text-white font-semibold flex items-center justify-center">
//                   {currentPage}
//                 </span>
//               </div>

//               <button
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(p + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {viewInvoice ? (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
//           onClick={() => setViewInvoice(null)}
//         >
//           <div
//             className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
//               <p className="text-sm font-semibold text-black">
//                 Invoice Details —{' '}
//                 {/* {viewInvoice.isCommissionRow
//                   ? viewInvoice._displayInvoiceNoOverride
//                   : getDisplayInvoiceNo(
//                       viewInvoice.invoiceNo,
//                       invoiceNumberMap,
//                     )} */}
//                 {viewInvoice.isCommissionRow
//                   ? viewInvoice._displayInvoiceNoOverride
//                   : getDisplayInvoiceNo(
//                       viewInvoice.invoiceNo,
//                       invoiceNumberMap,
//                       viewInvoice,
//                     )}
//               </p>
//               <button
//                 type="button"
//                 onClick={() => setViewInvoice(null)}
//                 className="text-xs font-medium text-slate-500 hover:text-black"
//               >
//                 Close ✕
//               </button>
//             </div>

//             <div className="px-5 py-4 space-y-2 text-sm">
//               <div className="grid grid-cols-2 gap-y-2">
//                 {/* <span className="text-slate-500">Order Ref</span>
//                   <span className="font-medium text-black">
//                     #{viewInvoice.orderRef}
//                   </span> */}
//                 {/* <span className="text-slate-500">Order Ref</span>
//                   <span className="font-medium text-black">
//                     {getDisplayOrderId(viewInvoice.orderRef, orderRefNumberMap)}
//                   </span> */}
//                 <span className="text-slate-500">Order Ref</span>
//                 <span className="font-medium text-black">
//                   {viewInvoice.orderRef}
//                 </span>

//                 <span className="text-slate-500">Customer</span>
//                 <span className="font-medium text-black">
//                   {viewInvoice.entityName}
//                 </span>

//                 <span className="text-slate-500">Phone</span>
//                 <span className="font-medium text-black">
//                   {viewInvoice.entityPhone || '—'}
//                 </span>

//                 <span className="text-slate-500">Product</span>
//                 <span className="font-medium text-black">
//                   {viewInvoice.productName || '—'}
//                 </span>

//                 <span className="text-slate-500">Tenure</span>
//                 <span className="font-medium text-black">
//                   {viewInvoice.tenure || '—'}
//                 </span>

//                 <span className="text-slate-500">Due Date</span>
//                 <span className="font-medium text-black">
//                   {fmtDate(viewInvoice.date)}
//                 </span>

//                 {/* <span className="text-slate-500">Amount</span>
//                 <span className="font-medium text-black">
//                   ₹{Number(viewInvoice.amount || 0).toLocaleString('en-IN')}
//                 </span> */}
//                 <span className="text-slate-500">Amount</span>
//                 <span className="font-medium text-black">
//                   ₹
//                   {(
//                     Number(viewInvoice.amount || 0) +
//                     Number(viewInvoice.gst || 0) +
//                     Number(viewInvoice.careTax || 0)
//                   ).toLocaleString('en-IN')}
//                   {/* {Number(viewInvoice.gst || 0) > 0 ||
//                   Number(viewInvoice.careTax || 0) > 0 ? (
//                     <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
//                       Rent ₹
//                       {Number(viewInvoice.amount || 0).toLocaleString('en-IN')}
//                       {Number(viewInvoice.gst || 0) > 0
//                         ? ` + ₹${Number(viewInvoice.gst).toLocaleString('en-IN')} GST`
//                         : ''}
//                       {Number(viewInvoice.careTax || 0) > 0
//                         ? ` + ₹${Number(viewInvoice.careTax).toLocaleString('en-IN')} Care Tax`
//                         : ''}
//                     </span>
//                   ) : null} */}
//                 </span>
//                 {/*
//                 {Number(viewInvoice.lateFeeAmount) > 0 ? (
//                   <>
//                     <span className="text-slate-500">Late Fee</span>
//                     <span className="font-medium text-red-500">
//                       ₹
//                       {Number(viewInvoice.lateFeeAmount).toLocaleString(
//                         'en-IN',
//                       )}
//                     </span>
//                   </>
//                 ) : null} */}
//                 {Number(viewInvoice.lateFeeAmount) > 0 ? (
//                   <>
//                     <span className="text-slate-500">Late Fee</span>
//                     <span className="font-medium text-red-500">
//                       ₹
//                       {Number(viewInvoice.lateFeeAmount).toLocaleString(
//                         'en-IN',
//                       )}
//                       {viewInvoice._originalLateFeeAmount != null &&
//                       Number(viewInvoice._originalLateFeeAmount) !==
//                         Number(viewInvoice.lateFeeAmount) ? (
//                         <span className="ml-1 text-xs text-slate-400 font-normal">
//                           (was ₹
//                           {Number(
//                             viewInvoice._originalLateFeeAmount,
//                           ).toLocaleString('en-IN')}
//                           )
//                         </span>
//                       ) : null}
//                     </span>
//                   </>
//                 ) : null}

//                 {/* <span className="text-slate-500">Status</span>
//                   <span className="font-medium text-black">
//                     {viewInvoice.status === 'Pending'
//                       ? 'Unpaid'
//                       : viewInvoice.status}
//                   </span> */}
//                 <span className="text-slate-500">Status</span>
//                 <span className="font-medium text-black">
//                   {getDisplayStatus(viewInvoice) === 'Pending'
//                     ? 'Unpaid'
//                     : getDisplayStatus(viewInvoice)}
//                 </span>

//                 {viewInvoice.note ? (
//                   <>
//                     <span className="text-slate-500">Note</span>
//                     <span className="font-medium text-black">
//                       {viewInvoice.note}
//                     </span>
//                   </>
//                 ) : null}
//               </div>

//               {Number(viewInvoice.lateFeeAmount) > 0 &&
//               viewInvoice.status === 'Pending' &&
//               String(viewInvoice.type) !== 'Commission Invoice' ? (
//                 <div className="pt-3 border-t border-slate-100">
//                   <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
//                     Give Late Fee Discount
//                   </label>
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="number"
//                       min="0"
//                       max={viewInvoice.lateFeeAmount}
//                       value={waiverDraft}
//                       onChange={(e) => {
//                         setWaiverDraft(e.target.value);
//                         setWaiverError('');
//                       }}
//                       placeholder={`Up to ₹${viewInvoice.lateFeeAmount}`}
//                       className="w-32 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
//                     />
//                     <span className="text-xs text-slate-500">
//                       of ₹{viewInvoice.lateFeeAmount} late fee
//                     </span>
//                   </div>
//                   {/* <textarea
//                     value={waiverReasonDraft}
//                     onChange={(e) => setWaiverReasonDraft(e.target.value)}
//                     placeholder='e.g. "Customer facing financial hardship this month"'
//                     rows={2}
//                     className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA] resize-none"
//                   /> */}
//                   {waiverError ? (
//                     <p className="mt-1 text-xs text-red-500">{waiverError}</p>
//                   ) : null}
//                   <button
//                     type="button"
//                     disabled={waiverSubmitting}
//                     onClick={async () => {
//                       const amount = Number(waiverDraft);
//                       if (!amount || amount <= 0) {
//                         setWaiverError(
//                           'Enter a discount amount greater than 0.',
//                         );
//                         return;
//                       }
//                       // if (amount > Number(viewInvoice.lateFeeAmount)) {
//                       //   setWaiverError(
//                       //     `Discount cannot exceed the current late fee of ₹${viewInvoice.lateFeeAmount}.`,
//                       //   );
//                       //   return;
//                       // }
//                       // if (!waiverReasonDraft.trim()) {
//                       //   setWaiverError(
//                       //     'Please add a reason for this discount.',
//                       //   );
//                       //   return;
//                       // }
//                       // const token =
//                       if (amount > Number(viewInvoice.lateFeeAmount)) {
//                         setWaiverError(
//                           `Discount cannot exceed the current late fee of ₹${viewInvoice.lateFeeAmount}.`,
//                         );
//                         return;
//                       }
//                       const token =
//                         typeof window !== 'undefined'
//                           ? localStorage.getItem('adminToken')
//                           : null;
//                       try {
//                         setWaiverSubmitting(true);
//                         // await apiUpdatePendingLateFeeWaiver(
//                         //   token,
//                         //   viewInvoice._id,
//                         //   {
//                         //     waiverAmount: amount,
//                         //     reason: waiverReasonDraft.trim(),
//                         //   },
//                         // );
//                         await apiUpdatePendingLateFeeWaiver(
//                           token,
//                           viewInvoice._id,
//                           {
//                             waiverAmount: amount,
//                             reason: 'Admin discount',
//                           },
//                         );
//                         // const updatedLateFee = Math.max(
//                         //   0,
//                         //   Number(viewInvoice.lateFeeAmount) - amount,
//                         // );
//                         // setViewInvoice((prev) =>
//                         //   prev
//                         //     ? { ...prev, lateFeeAmount: updatedLateFee }
//                         //     : prev,
//                         // );
//                         // setInvoices((prev) =>
//                         //   prev.map((inv) =>
//                         //     inv._id === viewInvoice._id
//                         //       ? { ...inv, lateFeeAmount: updatedLateFee }
//                         //       : inv,
//                         //   ),
//                         // );
//                         const originalLateFee =
//                           viewInvoice._originalLateFeeAmount != null
//                             ? Number(viewInvoice._originalLateFeeAmount)
//                             : Number(viewInvoice.lateFeeAmount);
//                         const updatedLateFee = Math.max(
//                           0,
//                           Number(viewInvoice.lateFeeAmount) - amount,
//                         );
//                         setViewInvoice((prev) =>
//                           prev
//                             ? {
//                                 ...prev,
//                                 lateFeeAmount: updatedLateFee,
//                                 _originalLateFeeAmount: originalLateFee,
//                               }
//                             : prev,
//                         );
//                         setInvoices((prev) =>
//                           prev.map((inv) =>
//                             inv._id === viewInvoice._id
//                               ? {
//                                   ...inv,
//                                   lateFeeAmount: updatedLateFee,
//                                   _originalLateFeeAmount: originalLateFee,
//                                 }
//                               : inv,
//                           ),
//                         );
//                         //   setWaiverDraft('');
//                         //   setWaiverReasonDraft('');
//                         // } catch (err) {
//                         setWaiverDraft('');
//                       } catch (err) {
//                         setWaiverError(
//                           err?.response?.data?.message ||
//                             'Failed to apply discount.',
//                         );
//                       } finally {
//                         setWaiverSubmitting(false);
//                       }
//                     }}
//                     className="mt-2 px-4 py-2 rounded-lg bg-[#16A34A] text-sm font-medium text-white hover:bg-[#15803D] transition disabled:opacity-50"
//                   >
//                     {waiverSubmitting ? 'Applying…' : 'Apply Discount'}
//                   </button>
//                 </div>
//               ) : null}
//             </div>

//             <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
//               <button
//                 type="button"
//                 onClick={() => setViewInvoice(null)}
//                 className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setRemarks((prev) => ({
//                     ...prev,
//                     [viewInvoice._id]: remarkDraft,
//                   }));
//                   setViewInvoice(null);
//                 }}
//                 className="px-4 py-2 rounded-lg bg-[#6C3EFA] text-sm font-medium text-white hover:bg-[#5b2fe0] transition"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  CheckCircle,
  Mail,
  Download,
  IndianRupee,
  Receipt,
  Landmark,
  Leaf,
  AlertCircle,
  Phone,
  Eye,
  MoreVertical,
} from 'lucide-react';
import {
  apiGetAdminInvoices,
  apiUpdatePendingLateFeeWaiver,
} from '@/service/api';
import jsPDF from 'jspdf';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

function cls(...p) {
  return p.filter(Boolean).join(' ');
}

function getRemainingDaysInfo(iso, status) {
  if (status !== 'Pending') return null;
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  let colorClass = 'bg-green-50 text-green-700 border-green-200';
  if (diffDays < 10) {
    colorClass = 'bg-red-50 text-red-700 border-red-200';
  } else if (diffDays <= 30) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return { diffDays, colorClass };
}

// Display-only override: Buy (Sell) and Service invoices always show as
// "Paid" in the UI, regardless of the actual stored status. Does NOT
// mutate r.status, so filtering by Status dropdown still uses real data.
function getDisplayStatus(r) {
  if (r.productType === 'Sell' || r.productType === 'Service') return 'Paid';
  return r.status;
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// The "first month" invoice of a rental group has no "-M{n}" suffix
// (e.g. INV-A55530, INV-A55530-P2). Later months are INV-A55530-M2,
// INV-A55530-M3, etc. Stripping that suffix gives the group's key,
// which is exactly the first-month invoice's own invoiceNo.
function getInvoiceGroupKey(invoiceNo) {
  return String(invoiceNo || '').replace(/-M\d+$/, '');
}

// Numeric month order within a group: first-month invoice (no -M suffix)
// is month 1, "-M2" is month 2, "-M3" is month 3, etc. Used purely for
// sorting rows so a group's months always render in sequence.
function getMonthOrder(invoiceNo) {
  const match = String(invoiceNo || '').match(/-M(\d+)$/);
  return match ? parseInt(match[1], 10) : 1;
}

// Display-only formatter: turns the real invoiceNo into INV-000001 style
// for UI/PDF. Does NOT change r.invoiceNo used for grouping/search/CSV.
// function getDisplayInvoiceNo(invoiceNo, numberMap) {
//   const key = getInvoiceGroupKey(invoiceNo);
//   const num = numberMap[key];
//   if (!num) return invoiceNo; // fallback if not found in map
//   const suffix = String(invoiceNo || '').slice(key.length); // e.g. "-M2"
//   return `INV-${String(num).padStart(6, '0')}${suffix}`;
// }
// function getDisplayInvoiceNo(invoiceNo, numberMap) {
//   const key = getInvoiceGroupKey(invoiceNo);
//   const num = numberMap[key];
//   if (!num) return invoiceNo; // fallback if not found in map
//   // Month suffix (-M2, -M3...) no longer shown in the UI; all months of
//   // the same rental group now display under the same INV-0001 number.
//   return `INV-${String(num).padStart(4, '0')}`;
// }

function getDisplayInvoiceNo(invoiceNo, numberMap, row) {
  // Prefer the backend-computed number (shared with the User side) so
  // both tables always agree. Falls back to client-side calc if absent.
  if (row?.displayInvoiceNo) return row.displayInvoiceNo;
  const key = getInvoiceGroupKey(invoiceNo);
  const num = numberMap[key];
  if (!num) return invoiceNo;
  return `INV-${String(num).padStart(4, '0')}`;
}
// // Display-only formatter: turns the real orderRef into the same
// // sequential ORD-0001 style used across the Admin/Vendor/User Orders
// // tables. Looks up the sequential number from orderRefNumberMap
// // (built below from all invoices, oldest first). Does NOT change
// // r.orderRef used elsewhere for filtering/search/CSV.
// function getDisplayOrderId(orderRef, numberMap) {
//   const num = numberMap ? numberMap[orderRef] : null;
//   if (!num) return orderRef; // fallback if not found in map
//   return `ORD-${String(num).padStart(4, '0')}`;
// }
function exportInvoicesCSV(rows) {
  if (!rows.length) return;

  const headers = [
    'Invoice No',
    'Order Ref',
    'Customer Name',
    'Customer Phone',
    'Product / Service',
    'Invoice Type', // Rental / Sell / Service
    'Tenure',
    'Due Date',
    'Base Amount',
    'Late Fee',
    'Total Amount',
    'Status',
    'Note',
  ];

  const escapeCell = (val) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  // Forces Excel/Sheets to treat the date as plain text instead of
  // auto-parsing it into a serial date number (which caused the "#####"
  // column-overflow display bug). The ="..." wrapper is the standard CSV
  // trick to preserve exact text in spreadsheet apps.
  const forceTextCell = (val) => `="${String(val ?? '').replace(/"/g, '""')}"`;

  const lines = [
    headers.join(','),
    ...rows.map((r) => {
      const baseAmount = Number(r.amount || 0);
      const lateFee = Number(r.lateFeeAmount || 0);
      const totalAmount = baseAmount + lateFee;

      return [
        escapeCell(r.invoiceNo),
        escapeCell(r.orderRef),
        escapeCell(r.entityName),
        escapeCell(r.entityPhone || ''),
        escapeCell(r.productName || ''),
        escapeCell(r.productType || r.type || ''),
        escapeCell(r.tenure || ''),
        forceTextCell(fmtDate(r.date)),
        baseAmount.toFixed(2),
        lateFee.toFixed(2),
        totalAmount.toFixed(2),
        escapeCell(r.status),
        escapeCell(r.note || ''),
      ].join(',');
    }),
  ];

  const csvContent = '\uFEFF' + lines.join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// function downloadInvoicePDF(r, displayInvoiceNo, adminRemark) {
//   const pdf = new jsPDF();
//   const isCommission = r.type === 'Commission Invoice';
//   const isSell = r.productType === 'Sell';
//   const isService = r.productType === 'Service';
//   const pdfDisplayStatus = isSell || isService ? 'Paid' : r.status;

//   const docTitle = isCommission
//     ? 'Commission Invoice'
//     : isService
//       ? 'Service Invoice'
//       : isSell
//         ? 'Buy Invoice'
//         : 'Rent Receipt';

//   const amountLabel = isCommission
//     ? 'Commission Amount'
//     : isService
//       ? 'Service Amount'
//       : isSell
//         ? 'Buy Amount'
//         : 'Rent Amount';

//   let y = 20;

//   pdf.setFontSize(16);
//   pdf.text(docTitle, 14, y);

//   pdf.setFontSize(10);
//   pdf.text(`Invoice No: ${displayInvoiceNo || r.invoiceNo}`, 150, y, {
//     align: 'left',
//   });

//   y += 10;
//   pdf.setDrawColor(200);
//   pdf.line(14, y, 196, y);

//   y += 10;
//   pdf.setFontSize(12);
//   pdf.text(isCommission ? 'Vendor Details' : 'Customer Details', 14, y);
//   y += 8;
//   pdf.setFontSize(10);
//   pdf.text(`Name: ${r.entityName}`, 14, y);
//   y += 6;
//   pdf.text(`Phone: ${r.entityPhone || '—'}`, 14, y);

//   y += 12;
//   pdf.setFontSize(12);
//   pdf.text('Order Details', 14, y);
//   y += 8;
//   pdf.setFontSize(10);
//   // pdf.text(`Order Reference: #${r.orderRef}`, 14, y);
//   // pdf.text(`Order Reference: ${displayOrderId || r.orderRef}`, 14, y);
//   pdf.text(`Order Reference: ${r.orderRef}`, 14, y);
//   y += 6;
//   pdf.text(`Date: ${fmtDate(r.date)}`, 14, y);
//   // y += 6;
//   // pdf.text(`Status: ${r.status === 'Pending' ? 'Unpaid' : r.status}`, 14, y);
//   y += 6;
//   pdf.text(
//     `Status: ${pdfDisplayStatus === 'Pending' ? 'Unpaid' : pdfDisplayStatus}`,
//     14,
//     y,
//   );

//   if (r.note) {
//     y += 6;
//     pdf.text(`Note: ${r.note}`, 14, y);
//   }

//   y += 14;
//   pdf.setDrawColor(200);
//   pdf.line(14, y, 196, y);

//   y += 12;
//   pdf.setFontSize(13);
//   pdf.text(
//     `${amountLabel}: Rs. ${Number(r.amount || 0).toLocaleString('en-IN')}`,
//     14,
//     y,
//   );

//   if (Number(r.lateFeeAmount) > 0) {
//     y += 8;
//     pdf.setFontSize(10);
//     pdf.setTextColor(200, 0, 0);
//     pdf.text(
//       `Late Fee (${r.daysLate} day${r.daysLate === 1 ? '' : 's'} late): Rs. ${Number(
//         r.lateFeeAmount,
//       ).toLocaleString('en-IN')}`,
//       14,
//       y,
//     );
//     pdf.setTextColor(0);

//     y += 8;
//     pdf.setFontSize(13);
//     pdf.setTextColor(0);
//     pdf.text(
//       `Total Payable: Rs. ${(
//         Number(r.amount || 0) + Number(r.lateFeeAmount || 0)
//       ).toLocaleString('en-IN')}`,
//       14,
//       y,
//     );
//   }

//   if (adminRemark) {
//     y += 14;
//     pdf.setDrawColor(200);
//     pdf.line(14, y, 196, y);

//     y += 10;
//     pdf.setFontSize(11);
//     pdf.setTextColor(0);
//     pdf.text('Remark', 14, y);
//     y += 7;
//     pdf.setFontSize(10);
//     pdf.setTextColor(80);
//     const remarkLines = pdf.splitTextToSize(adminRemark, 180);
//     pdf.text(remarkLines, 14, y);
//     y += remarkLines.length * 5;
//     pdf.setTextColor(0);
//   }

//   y += 20;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     14,
//     y,
//   );

//   pdf.save(`${displayInvoiceNo || r.invoiceNo}.pdf`);
// }

function loadImageAsDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

async function downloadInvoicePDF(r, displayInvoiceNo, adminRemark) {
  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
  } catch (e) {
    // proceed without the logo if it fails to load
  }
  const pdf = new jsPDF();
  const pageW = 210;
  const marginX = 14;
  const rightX = pageW - marginX;

  const isCommission = r.type === 'Commission Invoice';
  const isSell = r.productType === 'Sell';
  const isService = r.productType === 'Service';
  const pdfDisplayStatus = isSell || isService ? 'Paid' : r.status;

  const docTitle = isCommission
    ? 'Commission Invoice'
    : isService
      ? 'Service Invoice'
      : isSell
        ? 'Buy Invoice'
        : 'Rent Receipt';

  const amountLabel = isCommission
    ? 'Commission Amount'
    : isService
      ? 'Service Amount'
      : isSell
        ? 'Buy Amount'
        : 'Rent Amount';

  // const invNo = displayInvoiceNo || r.invoiceNo;

  // let y = 20;
  const invNo = displayInvoiceNo || r.invoiceNo;

  // Same calc as the table's Amount column: base rent/buy/service amount
  // plus GST and Care Tax, so the PDF total matches what's shown in the
  // Admin Invoices table.
  const gstAmount = Number(r.gst || 0);
  const careTaxAmount = Number(r.careTax || 0);
  const displayAmount = Number(r.amount || 0) + gstAmount + careTaxAmount;

  let y = 20;

  // ── Header: title + logo/company block (left) + address (right) ──
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${docTitle} - ${invNo}`, marginX, y);
  pdf.setFont(undefined, 'normal');

  y += 5;
  pdf.setDrawColor(230);
  pdf.line(marginX, y, rightX, y);

  const logoY = y + 14;
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, 'PNG', marginX, logoY - 8, 16, 16);
    } catch (e) {
      pdf.setFillColor(255, 140, 0);
      pdf.circle(marginX + 8, logoY, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont(undefined, 'bold');
      pdf.text('R', marginX + 8, logoY + 2.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
    }
  } else {
    pdf.setFillColor(255, 140, 0);
    pdf.circle(marginX + 8, logoY, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont(undefined, 'bold');
    pdf.text('R', marginX + 8, logoY + 2.5, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
  }

  pdf.setFontSize(14);
  pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
  pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

  pdf.setFontSize(9);
  const addrLines = [
    'State: Maharashtra || State Code: 27',
    'City: Pune',
    'Address: B1-1002, Sr. No. 41/1/1,',
    'Near Kakde Terrace, Warje,',
    'Pune - 411058, Maharashtra, India.',
  ];
  let addrY = y + 8;
  addrLines.forEach((line) => {
    pdf.text(line, rightX, addrY, { align: 'right' });
    addrY += 5;
  });

  y = Math.max(logoY + 16, addrY + 4);

  // ── Details box (Invoice Details left, Billed-to right) ──
  const boxTop = y;
  const boxHeight = isCommission ? 62 : 56;
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

  let leftY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Details', marginX + 6, leftY);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  const details = [
    ['Order Number', r.orderRef || '-'],
    ['Date', fmtDate(r.date)],
    ['Status', pdfDisplayStatus === 'Pending' ? 'Unpaid' : pdfDisplayStatus],
    ...(r.note ? [['Note', r.note]] : []),
    ...(isCommission && r.commissionRate != null
      ? [['Commission Rate', `${r.commissionRate}%`]]
      : []),
  ];

  leftY += 7;
  details.forEach(([label, val]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    const wrapped = pdf.splitTextToSize(String(val), 55);
    pdf.text(wrapped, marginX + 45, leftY);
    leftY += 6 * wrapped.length;
  });

  // leftY += 2;
  // pdf.setFontSize(13);
  // pdf.setFont(undefined, 'bold');
  // pdf.text(amountLabel, marginX + 6, leftY);
  // pdf.text(
  //   `Rs. ${Number(r.amount || 0).toLocaleString('en-IN')}`,
  //   marginX + 45,
  //   leftY,
  // );
  // pdf.setFont(undefined, 'normal');

  leftY += 2;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text(amountLabel, marginX + 6, leftY);
  pdf.text(`Rs. ${displayAmount.toLocaleString('en-IN')}`, marginX + 45, leftY);
  pdf.setFont(undefined, 'normal');

  let rightY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text(
    isCommission ? 'Billed to (Vendor)' : 'Billed to',
    rightX - 6,
    rightY,
    {
      align: 'right',
    },
  );
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  rightY += 7;
  pdf.text(r.entityName || '-', rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  pdf.text(r.entityPhone || '-', rightX - 6, rightY, { align: 'right' });

  y = boxTop + boxHeight + 12;

  // // ── Late fee / total payable (Rent/Buy/Service only) ──
  // if (!isCommission && Number(r.lateFeeAmount) > 0) {
  // ── Late fee / total payable (Rent only) ──
  if (!isCommission && !isSell && !isService && Number(r.lateFeeAmount) > 0) {
    pdf.setFontSize(10);
    pdf.setTextColor(200, 0, 0);
    pdf.text(
      `Late Fee (${r.daysLate} day${r.daysLate === 1 ? '' : 's'} late): Rs. ${Number(
        r.lateFeeAmount,
      ).toLocaleString('en-IN')}`,
      marginX,
      y,
    );
    pdf.setTextColor(0);
    y += 8;

    // pdf.setFontSize(13);
    // pdf.setFont(undefined, 'bold');
    // pdf.text(
    //   `Total Payable: Rs. ${(
    //     Number(r.amount || 0) + Number(r.lateFeeAmount || 0)
    //   ).toLocaleString('en-IN')}`,
    //   marginX,
    //   y,
    // );
    // pdf.setFont(undefined, 'normal');
    // y += 10;
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text(
      `Total Payable: Rs. ${(
        displayAmount + Number(r.lateFeeAmount || 0)
      ).toLocaleString('en-IN')}`,
      marginX,
      y,
    );
    pdf.setFont(undefined, 'normal');
    y += 10;
  }

  // ── Admin remark ──
  if (adminRemark) {
    pdf.setDrawColor(200);
    pdf.line(marginX, y, rightX, y);
    y += 10;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0);
    pdf.text('Remark', marginX, y);
    pdf.setFont(undefined, 'normal');
    y += 7;
    pdf.setFontSize(10);
    pdf.setTextColor(80);
    const remarkLines = pdf.splitTextToSize(adminRemark, rightX - marginX);
    pdf.text(remarkLines, marginX, y);
    y += remarkLines.length * 5;
    pdf.setTextColor(0);
  }

  y += 12;
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    'This is a system-generated document. No signature required.',
    marginX,
    y,
  );
  pdf.setTextColor(0, 0, 0);

  pdf.save(`${invNo}.pdf`);
}

const INVOICE_TYPES = ['All Types', 'Rental', 'Sell', 'Service'];
const INVOICE_TYPE_LABELS = {
  'All Types': 'All Types',
  Rental: 'Rental',
  Sell: 'Buy',
  Service: 'Service',
};
const STATUSES = ['All Status', 'Paid', 'Unpaid'];
const STATUS_LABELS = {
  'All Status': 'All Status',
  Paid: 'Paid',
  Pending: 'Unpaid',
};

const TYPE_BADGE = {
  'Rent Receipt': {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#155DFC]',
    border: 'border-[#DBEAFE]',
  },
  'Commission Invoice': {
    bg: 'bg-[#FAF5FF]',
    text: 'text-[#9810FA]',
    border: 'border-[#F3E8FF]',
  },
};

const STATUS_BADGE = {
  Paid: { dot: 'bg-green-500', text: 'text-green-700' },
  Pending: { dot: 'bg-amber-400', text: 'text-amber-700' },
  Overdue: { dot: 'bg-red-500', text: 'text-red-700' },
};

const ITEMS_PER_PAGE = 30;

export default function SystemInvoices() {
  const [search, setSearch] = useState('');
  const [invoiceType, setInvoiceType] = useState('All Types');
  const [monthPeriod, setMonthPeriod] = useState('');
  // Default filter view: show Unpaid invoices only, All Types.
  const [status, setStatus] = useState('Pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [remarkDraft, setRemarkDraft] = useState('');
  const [waiverDraft, setWaiverDraft] = useState('');
  const [waiverReasonDraft, setWaiverReasonDraft] = useState('');
  const [waiverSubmitting, setWaiverSubmitting] = useState(false);
  const [waiverError, setWaiverError] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({
    pendingAmount: 0,
    paidAmount: 0,
    commissions: 0,
    gst: 0,
    careTax: 0,
    lateFees: 0,
    repairWarranty: 0,
    relocationWarranty: 0,
    deliveryPackaging: 0,
    installationFee: 0,
    platformFee: 0,
  });
  const [loading, setLoading] = useState(true);

  const [remarks, setRemarks] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('invoiceRemarks');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Persist remarks whenever they change (skips the very first render
  // so we never re-write the same data we just loaded)
  const isFirstRemarksRender = useRef(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isFirstRemarksRender.current) {
      isFirstRemarksRender.current = false;
      return;
    }
    try {
      localStorage.setItem('invoiceRemarks', JSON.stringify(remarks));
    } catch (e) {
      // ignore storage errors (e.g. quota exceeded)
    }
  }, [remarks]);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // apiGetAdminInvoices(token, {
    //   month: monthPeriod || undefined,
    //   type: invoiceType !== 'All Types' ? invoiceType : undefined,
    //   status: status !== 'All Status' ? status : undefined,
    //   search: search || undefined,
    // })
    apiGetAdminInvoices(token, {
      month: monthPeriod || undefined,
      // Type is now filtered client-side (see `filtered` below), same as
      // Status, so invoiceNumberMap is always built from the FULL invoice
      // list — giving one continuous INV-000001, 000002... sequence across
      // Rent/Buy/Service instead of each type restarting at 000001.
      search: search || undefined,
    })
      .then((res) => {
        setInvoices(
          Array.isArray(res?.data?.invoices) ? res.data.invoices : [],
        );
        setSummary(res?.data?.summary || summary);
      })
      .catch(() => {
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  }, [search, invoiceType, status, monthPeriod]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, invoiceType, status, monthPeriod]);

  // Server applies search/type/month filters. Status is filtered here on
  // the client using getDisplayStatus() so Buy/Service invoices (which
  // always DISPLAY as "Paid") are correctly included/excluded regardless
  // of their real stored status.
  const filtered = useMemo(() => {
    let rows = invoices;
    if (invoiceType !== 'All Types') {
      rows = rows.filter((inv) => inv.productType === invoiceType);
    }
    if (status !== 'All Status') {
      rows = rows.filter((inv) => getDisplayStatus(inv) === status);
    }
    return rows;
  }, [invoices, invoiceType, status]);

  // Sequential display numbers (INV-000001, INV-000002...) based on
  // date, oldest first. Frontend display only — does not affect
  // r.invoiceNo used elsewhere for grouping/search/CSV export.
  const invoiceNumberMap = useMemo(() => {
    const seen = new Set();
    const orderedKeys = [];
    [...invoices]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((inv) => {
        const key = getInvoiceGroupKey(inv.invoiceNo);
        if (!seen.has(key)) {
          seen.add(key);
          orderedKeys.push(key);
        }
      });
    const map = {};
    orderedKeys.forEach((key, idx) => {
      map[key] = idx + 1;
    });
    return map;
  }, [invoices]);

  // // Sequential ORD-0001 style numbers for orderRef, based on each
  // // unique orderRef's earliest invoice date — mirrors the ORD-0001
  // // numbering already used in the Orders panel. Display only.
  // const orderRefNumberMap = useMemo(() => {
  //   const seen = new Set();
  //   const orderedRefs = [];
  //   [...invoices]
  //     .sort((a, b) => new Date(a.date) - new Date(b.date))
  //     .forEach((inv) => {
  //       const ref = inv.orderRef;
  //       if (ref && !seen.has(ref)) {
  //         seen.add(ref);
  //         orderedRefs.push(ref);
  //       }
  //     });
  //   const map = {};
  //   orderedRefs.forEach((ref, idx) => {
  //     map[ref] = idx + 1;
  //   });
  //   return map;
  // }, [invoices]);

  // Every invoice row (including M2, M3...) is shown directly in the main
  // table now — no separate "click to expand months" panel. Rows are
  // sorted so each group's own invoice number order (oldest first) is
  // preserved, and within a group the months always appear in sequence:
  // M1 (no suffix), M2, M3, ...
  // const mainRows = useMemo(() => {
  //   return [...filtered].sort((a, b) => {
  //     const keyA = getInvoiceGroupKey(a.invoiceNo);
  //     const keyB = getInvoiceGroupKey(b.invoiceNo);
  //     const orderA = invoiceNumberMap[keyA] || 0;
  //     const orderB = invoiceNumberMap[keyB] || 0;
  //     if (orderA !== orderB) return orderA - orderB;
  //     return getMonthOrder(a.invoiceNo) - getMonthOrder(b.invoiceNo);
  //   });
  // }, [filtered, invoiceNumberMap]);
  // const mainRows = useMemo(() => {
  //   return [...filtered].sort((a, b) => {
  //     const keyA = getInvoiceGroupKey(a.invoiceNo);
  //     const keyB = getInvoiceGroupKey(b.invoiceNo);
  //     const orderA = invoiceNumberMap[keyA] || 0;
  //     const orderB = invoiceNumberMap[keyB] || 0;
  //     // Newest invoice group first (page 1 shows latest), but months
  //     // within a group still stay in order M1 -> M2 -> M3...
  //     if (orderA !== orderB) return orderB - orderA;
  //     return getMonthOrder(a.invoiceNo) - getMonthOrder(b.invoiceNo);
  //   });
  // }, [filtered, invoiceNumberMap]);
  const mainRows = useMemo(() => {
    return [...filtered].sort((a, b) => {
      // Sort by nearest Due Date first, across all invoices/customers —
      // rows with the same due date (e.g. all "31 days" invoices) are
      // grouped together automatically since same date sorts equal here,
      // then falls back to group order + month order for stable tie-breaks.
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;

      const keyA = getInvoiceGroupKey(a.invoiceNo);
      const keyB = getInvoiceGroupKey(b.invoiceNo);
      const orderA = invoiceNumberMap[keyA] || 0;
      const orderB = invoiceNumberMap[keyB] || 0;
      if (orderA !== orderB) return orderB - orderA;
      return getMonthOrder(a.invoiceNo) - getMonthOrder(b.invoiceNo);
    });
  }, [filtered, invoiceNumberMap]);

  const totalPages = Math.max(1, Math.ceil(mainRows.length / ITEMS_PER_PAGE));

  // // Dynamically calculated total commission from invoice data
  // // (fallback/override in case summary.commissions from API is incorrect or 0)
  // const totalCommission = useMemo(() => {
  //   return invoices.reduce(
  //     (sum, inv) => sum + Number(inv.commissionAmount || 0),
  //     0,
  //   );
  // }, [invoices]);
  // Total Commission now comes straight from the backend summary, computed
  // with the same formula as City Dashboard (Revenue & Settlements) and
  // Financial Performance (Net Profit) — order.platformFee, else category
  // commissionRate, else flat 10% fallback. Keeps all three in sync.
  const totalCommission = Number(summary.commissions || 0);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return mainRows.slice(start, start + ITEMS_PER_PAGE);
  }, [mainRows, currentPage]);

  // For every invoice row that has a real commission amount, insert a
  // synthetic "COM-xxxxxx" row right below it — same order/customer/
  // product/tenure/due date/status, but Amount = the commission value.
  // Purely a display construct; does not touch r.invoiceNo grouping,
  // filtering, search, or CSV export logic elsewhere. Runs on every
  // month row (M1/M2/M3...), so each month's own commission (if any)
  // shows directly beneath it, in order.
  // const paginatedWithCommission = useMemo(() => {
  //   const rows = [];
  //   paginated.forEach((r) => {
  //     rows.push(r);
  //     if (r.commissionAmount != null) {
  //       const mainDisplayNo = getDisplayInvoiceNo(
  //         r.invoiceNo,
  //         invoiceNumberMap,
  //       );
  //       const comDisplayNo = mainDisplayNo.replace(/^INV-/, 'COM-');
  //       rows.push({
  //         ...r,
  //         _id: `${r._id}-commission`,
  //         invoiceNo: `${r.invoiceNo}-COMM`,
  //         _displayInvoiceNoOverride: comDisplayNo,
  //         type: 'Commission Invoice',
  //         amount: r.commissionAmount,
  //         lateFeeAmount: 0,
  //         commissionRate: r.commissionRate,
  //         commissionAmount: null,
  //         netSettled: null,
  //         isCommissionRow: true,
  //         entityName: r.vendorName || 'Unknown Vendor',
  //         entityPhone: r.vendorPhone || '',
  //       });
  //     }
  //   });
  //   return rows;
  // }, [paginated, invoiceNumberMap]);
  // Commission rows removed from display — main invoice rows only.
  const paginatedWithCommission = useMemo(() => {
    return paginated;
  }, [paginated]);

  const allSelected =
    paginated.length > 0 && paginated.every((r) => selected.includes(r._id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) =>
        prev.filter((id) => !paginated.find((r) => r._id === id)),
      );
    } else {
      setSelected((prev) => [
        ...prev,
        ...paginated.map((r) => r._id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const totalShowing = mainRows.length;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, mainRows.length);

  return (
    <div className="min-h-full bg-[#f2f4f8] -m-3 sm:-m-4 md:-m-6 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Row 1 — Pending / Paid / Late Fees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-5">
            <p className="text-xs font-semibold tracking-widest text-[#155DFC] uppercase">
              Pending Invoices
            </p>
            <p className="mt-2 text-3xl font-bold text-[#155DFC]">
              ₹{Number(summary.pendingAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#F3E8FF] bg-[#FAF5FF] p-5">
            <p className="text-xs font-semibold tracking-widest text-[#9810FA] uppercase">
              Paid Invoices
            </p>
            <p className="mt-2 text-3xl font-bold text-[#9810FA]">
              ₹{Number(summary.paidAmount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#FEF3C7] bg-yellow-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              {/* <div className="h-8 w-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[#D97706]" />
                </div> */}
              <p className="text-xs font-semibold tracking-widest text-[#D97706] uppercase">
                Total Commission
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-[#D97706]">
              ₹{totalCommission.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Row 2 — Commission / GST / Care Tax / Other Charges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#DCFCE7] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
                <Leaf className="h-4 w-4 text-[#16A34A]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Late Fees</p>
            </div>
            <p className="text-xl font-bold text-[#16A34A]">
              ₹{Number(summary.lateFees || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                <Landmark className="h-4 w-4 text-[#155DFC]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">GST</p>
            </div>
            <p className="text-xl font-bold text-[#155DFC]">
              ₹{Number(summary.gst || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#FFEDD5] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                <Leaf className="h-4 w-4 text-[#EA580C]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Care Tax</p>
            </div>
            <p className="text-xl font-bold text-[#EA580C]">
              ₹{Number(summary.careTax || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E0E7FF] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#4F46E5]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Repair & Warranty
              </p>
            </div>
            <p className="text-xl font-bold text-[#4F46E5]">
              ₹{Number(summary.repairWarranty || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#FCE7F3] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#FDF2F8] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#DB2777]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Relocation Warranty
              </p>
            </div>
            <p className="text-xl font-bold text-[#DB2777]">
              ₹{Number(summary.relocationWarranty || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#CFFAFE] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#ECFEFF] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#0891B2]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Delivery & Packaging
              </p>
            </div>
            <p className="text-xl font-bold text-[#0891B2]">
              ₹{Number(summary.deliveryPackaging || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#FEF9C3] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#FEFCE8] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#CA8A04]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Installation Fee
              </p>
            </div>
            <p className="text-xl font-bold text-[#CA8A04]">
              ₹{Number(summary.installationFee || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#F9FAFB] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#475569]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Platform Fee</p>
            </div>
            <p className="text-xl font-bold text-[#475569]">
              ₹{Number(summary.platformFee || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID, Product Name, or Customer Name"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#6C3EFA]"
              />
            </div>
            <button
              type="button"
              onClick={() => exportInvoicesCSV(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#16A34A] text-[#16A34A] text-sm font-medium hover:bg-[#F0FDF4] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 sm:ml-auto"
            >
              <Download className="h-4 w-4" />
              Export Tally/Excel Format
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Invoice Type
              </label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
              >
                {INVOICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INVOICE_TYPE_LABELS[t] || t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Month / Period
              </label>
              <input
                type="month"
                value={monthPeriod}
                onChange={(e) => setMonthPeriod(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s === 'Unpaid' ? 'Pending' : s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table — single unified table; M1/M2/M3... and their commission
              rows all render inline, in order, no separate expand panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                    Invoice no
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap min-w-[90px]">
                    Order id
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Customer info
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Tenure
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                    Remaining
                  </th>
                  {/* <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                      Remark
                    </th> */}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Loading invoices…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  paginatedWithCommission.map((r) => {
                    const displayStatus = getDisplayStatus(r);
                    const statusStyle =
                      STATUS_BADGE[displayStatus] || STATUS_BADGE['Pending'];
                    const remainingInfo =
                      r.productType === 'Service' || r.productType === 'Sell'
                        ? null
                        : getRemainingDaysInfo(r.date, r.status);
                    return (
                      <tr
                        key={r._id}
                        className="hover:bg-slate-50 transition text-center"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold whitespace-nowrap text-black">
                            {/* {r.isCommissionRow
                              ? r._displayInvoiceNoOverride
                              : getDisplayInvoiceNo(
                                  r.invoiceNo,
                                  invoiceNumberMap,
                                )} */}
                            {r.isCommissionRow
                              ? r._displayInvoiceNoOverride
                              : getDisplayInvoiceNo(
                                  r.invoiceNo,
                                  invoiceNumberMap,
                                  r,
                                )}
                          </p>
                          {r.isCommissionRow && r.commissionRate != null ? (
                            <p className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
                              {/* {r.commissionRate}% fee on Order #{r.orderRef} */}
                              {/* {r.commissionRate}% fee on Order{' '}
                                {getDisplayOrderId(r.orderRef, orderRefNumberMap)} */}
                              {r.commissionRate}% fee on Order {r.orderRef}
                            </p>
                          ) : r.note ? (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {r.note}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={cls(
                              'font-medium',
                              r.isCommissionRow
                                ? 'text-[#9810FA]'
                                : 'text-[#155DFC]',
                            )}
                          >
                            {r.orderRef}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.isCommissionRow ? (
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                              Vendor
                            </p>
                          ) : null}
                          <p className="font-medium text-black">
                            {r.entityName}
                          </p>
                          {r.entityPhone ? (
                            <p className="text-xs text-slate-400">
                              {r.entityPhone}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2.5">
                            {r.productImage ? (
                              <img
                                src={r.productImage}
                                alt={r.productName || 'Product'}
                                className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 shrink-0" />
                            )}
                            <div className="min-w-0 max-w-[160px]">
                              <p
                                className="font-medium text-black truncate"
                                title={r.productName || ''}
                              >
                                {r.productName || '—'}
                              </p>
                              {r.variantName ? (
                                <p
                                  className="text-xs text-slate-400 truncate"
                                  title={r.variantName}
                                >
                                  {r.variantName}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">
                          {r.tenure || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">
                          {fmtDate(r.date)}
                        </td>
                        {/* <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-black">
                            ₹{r.amount.toLocaleString('en-IN')}
                          </span>
                          {r.lateFeeAmount > 0 ? (
                            <p className="text-[11px] text-red-500 mt-0.5">
                              + ₹{r.lateFeeAmount.toLocaleString('en-IN')} late
                              fee
                            </p>
                          ) : null}
                        </td> */}
                        <td className="px-4 py-3 text-center">
                          {(() => {
                            const gstForRow = Number(r.gst || 0);
                            const careTaxForRow = Number(r.careTax || 0);
                            const displayAmount =
                              Number(r.amount || 0) + gstForRow + careTaxForRow;
                            return (
                              <>
                                <span className="font-semibold text-black">
                                  ₹{displayAmount.toLocaleString('en-IN')}
                                </span>
                                {/* {gstForRow > 0 || careTaxForRow > 0 ? (
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    Rent ₹
                                    {Number(r.amount || 0).toLocaleString(
                                      'en-IN',
                                    )}
                                    {gstForRow > 0
                                      ? ` + ₹${gstForRow.toLocaleString('en-IN')} GST`
                                      : ''}
                                    {careTaxForRow > 0
                                      ? ` + ₹${careTaxForRow.toLocaleString('en-IN')} Care Tax`
                                      : ''}
                                  </p>
                                ) : null} */}
                                {/* {r.lateFeeAmount > 0 ? (
                                  <p className="text-[11px] text-red-500 mt-0.5">
                                    + ₹{r.lateFeeAmount.toLocaleString('en-IN')}{' '}
                                    late fee
                                  </p>
                                ) : null} */}
                              </>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={cls(
                                'h-2 w-2 rounded-full shrink-0',
                                statusStyle.dot,
                              )}
                            />
                            {/* <span
                                className={cls(
                                  'text-xs font-semibold',
                                  statusStyle.text,
                                )}
                              >
                                {r.status === 'Pending' ? 'Unpaid' : r.status}
                              </span> */}
                            <span
                              className={cls(
                                'text-xs font-semibold',
                                statusStyle.text,
                              )}
                            >
                              {displayStatus === 'Pending'
                                ? 'Unpaid'
                                : displayStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {remainingInfo ? (
                            <span
                              className={cls(
                                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap',
                                remainingInfo.colorClass,
                              )}
                            >
                              {remainingInfo.diffDays < 0
                                ? `${Math.abs(remainingInfo.diffDays)}d overdue`
                                : `${remainingInfo.diffDays} days`}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        {/* <td className="px-4 py-3 max-w-[140px]">
                            {remarks[r._id] ? (
                              <p
                                className="text-xs text-slate-600 truncate"
                                title={remarks[r._id]}
                              >
                                {remarks[r._id]}
                              </p>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td> */}
                        <td className="px-4 py-3 relative text-center">
                          <button
                            type="button"
                            title="Actions"
                            onClick={() =>
                              setOpenMenuId((prev) =>
                                prev === r._id ? null : r._id,
                              )
                            }
                            className="h-8 w-8 mx-auto rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                          {/* {openMenuId === r._id ? (
                              <div className="absolute right-4 z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    dInvoicePDF(
                                      r,
                                      r.isCommissionRow
                                        ? r._displayInvoiceNoOverride
                                        : getDisplayInvoiceNo(
                                            r.invoiceNo,
                                            invoiceNumberMap,
                                          ),
                                      remarks[r._id],
                                    );
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Receipt className="h-3.5 w-3.5 text-[#EA580C]" />
                                  Download PDF
                                </button> */}
                          {/* {openMenuId === r._id ? (
                            <div className="absolute right-4 z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                              <div className="px-3 py-2 text-xs font-semibold border-b border-slate-100 flex items-center justify-between">
                                <span className="text-slate-500">Late Fee</span>
                                <span
                                  className={
                                    Number(r.lateFeeAmount) > 0
                                      ? 'text-red-600'
                                      : 'text-slate-400'
                                  }
                                >
                                  ₹
                                  {Number(r.lateFeeAmount || 0).toLocaleString(
                                    'en-IN',
                                  )}
                                </span>
                              </div>
                              <button */}

                          {openMenuId === r._id ? (
                            <div className="absolute right-4 z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                              {r.productType !== 'Sell' &&
                              r.productType !== 'Service' ? (
                                <div className="px-3 py-2 text-xs font-semibold border-b border-slate-100 flex items-center justify-between">
                                  <span className="text-slate-500">
                                    Late Fee
                                  </span>
                                  <span
                                    className={
                                      Number(r.lateFeeAmount) > 0
                                        ? 'text-red-600'
                                        : 'text-slate-400'
                                    }
                                  >
                                    ₹
                                    {Number(
                                      r.lateFeeAmount || 0,
                                    ).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ) : null}
                              <button
                                type="button"
                                onClick={async () => {
                                  // downloadInvoicePDF(
                                  //   r,
                                  //   r.isCommissionRow
                                  //     ? r._displayInvoiceNoOverride
                                  //     : getDisplayInvoiceNo(
                                  //         r.invoiceNo,
                                  //         invoiceNumberMap,
                                  //       ),
                                  //   remarks[r._id],
                                  // );
                                  await downloadInvoicePDF(
                                    r,
                                    r.isCommissionRow
                                      ? r._displayInvoiceNoOverride
                                      : getDisplayInvoiceNo(
                                          r.invoiceNo,
                                          invoiceNumberMap,
                                          r,
                                        ),
                                    remarks[r._id],
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Receipt className="h-3.5 w-3.5 text-[#EA580C]" />
                                Download PDF
                              </button>
                              {r.entityPhone ? (
                                <a
                                  href={`tel:${r.entityPhone}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                                  Call {r.entityPhone}
                                </a>
                              ) : (
                                <span className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 cursor-not-allowed">
                                  <Phone className="h-3.5 w-3.5" />
                                  No phone number
                                </span>
                              )}
                              {/* <button
                                type="button"
                                onClick={() => {
                                  setViewInvoice(r);
                                  setRemarkDraft(remarks[r._id] ?? '');
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                View
                              </button> */}
                              <button
                                type="button"
                                onClick={() => {
                                  setViewInvoice(r);
                                  setRemarkDraft(remarks[r._id] ?? '');
                                  setWaiverDraft('');
                                  setWaiverReasonDraft('');
                                  setWaiverError('');
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                View
                              </button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-slate-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing {totalShowing === 0 ? 0 : startIdx}–{endIdx} of{' '}
              {totalShowing} Invoices
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                <span className="h-8 w-8 rounded-lg text-sm border border-[#6C3EFA] bg-[#6C3EFA] text-white font-semibold flex items-center justify-center">
                  {currentPage}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewInvoice ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewInvoice(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-black">
                Invoice Details —{' '}
                {/* {viewInvoice.isCommissionRow
                  ? viewInvoice._displayInvoiceNoOverride
                  : getDisplayInvoiceNo(
                      viewInvoice.invoiceNo,
                      invoiceNumberMap,
                    )} */}
                {viewInvoice.isCommissionRow
                  ? viewInvoice._displayInvoiceNoOverride
                  : getDisplayInvoiceNo(
                      viewInvoice.invoiceNo,
                      invoiceNumberMap,
                      viewInvoice,
                    )}
              </p>
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="text-xs font-medium text-slate-500 hover:text-black"
              >
                Close ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                {/* <span className="text-slate-500">Order Ref</span>
                  <span className="font-medium text-black">
                    #{viewInvoice.orderRef}
                  </span> */}
                {/* <span className="text-slate-500">Order Ref</span>
                  <span className="font-medium text-black">
                    {getDisplayOrderId(viewInvoice.orderRef, orderRefNumberMap)}
                  </span> */}
                <span className="text-slate-500">Order Ref</span>
                <span className="font-medium text-black">
                  {viewInvoice.orderRef}
                </span>

                <span className="text-slate-500">Customer</span>
                <span className="font-medium text-black">
                  {viewInvoice.entityName}
                </span>

                <span className="text-slate-500">Phone</span>
                <span className="font-medium text-black">
                  {viewInvoice.entityPhone || '—'}
                </span>

                <span className="text-slate-500">Product</span>
                <span className="font-medium text-black">
                  {viewInvoice.productName || '—'}
                </span>

                <span className="text-slate-500">Tenure</span>
                <span className="font-medium text-black">
                  {viewInvoice.tenure || '—'}
                </span>

                <span className="text-slate-500">Due Date</span>
                <span className="font-medium text-black">
                  {fmtDate(viewInvoice.date)}
                </span>

                {/* <span className="text-slate-500">Amount</span>
                <span className="font-medium text-black">
                  ₹{Number(viewInvoice.amount || 0).toLocaleString('en-IN')}
                </span> */}
                <span className="text-slate-500">Amount</span>
                <span className="font-medium text-black">
                  ₹
                  {(
                    Number(viewInvoice.amount || 0) +
                    Number(viewInvoice.gst || 0) +
                    Number(viewInvoice.careTax || 0)
                  ).toLocaleString('en-IN')}
                  {/* {Number(viewInvoice.gst || 0) > 0 ||
                  Number(viewInvoice.careTax || 0) > 0 ? (
                    <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                      Rent ₹
                      {Number(viewInvoice.amount || 0).toLocaleString('en-IN')}
                      {Number(viewInvoice.gst || 0) > 0
                        ? ` + ₹${Number(viewInvoice.gst).toLocaleString('en-IN')} GST`
                        : ''}
                      {Number(viewInvoice.careTax || 0) > 0
                        ? ` + ₹${Number(viewInvoice.careTax).toLocaleString('en-IN')} Care Tax`
                        : ''}
                    </span>
                  ) : null} */}
                </span>
                {/* 
                {Number(viewInvoice.lateFeeAmount) > 0 ? (
                  <>
                    <span className="text-slate-500">Late Fee</span>
                    <span className="font-medium text-red-500">
                      ₹
                      {Number(viewInvoice.lateFeeAmount).toLocaleString(
                        'en-IN',
                      )}
                    </span>
                  </>
                ) : null} */}
                {Number(viewInvoice.lateFeeAmount) > 0 ? (
                  <>
                    <span className="text-slate-500">Late Fee</span>
                    <span className="font-medium text-red-500">
                      ₹
                      {Number(viewInvoice.lateFeeAmount).toLocaleString(
                        'en-IN',
                      )}
                      {viewInvoice._originalLateFeeAmount != null &&
                      Number(viewInvoice._originalLateFeeAmount) !==
                        Number(viewInvoice.lateFeeAmount) ? (
                        <span className="ml-1 text-xs text-slate-400 font-normal">
                          (was ₹
                          {Number(
                            viewInvoice._originalLateFeeAmount,
                          ).toLocaleString('en-IN')}
                          )
                        </span>
                      ) : null}
                    </span>
                  </>
                ) : null}

                {/* <span className="text-slate-500">Status</span>
                  <span className="font-medium text-black">
                    {viewInvoice.status === 'Pending'
                      ? 'Unpaid'
                      : viewInvoice.status}
                  </span> */}
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-black">
                  {getDisplayStatus(viewInvoice) === 'Pending'
                    ? 'Unpaid'
                    : getDisplayStatus(viewInvoice)}
                </span>

                {viewInvoice.note ? (
                  <>
                    <span className="text-slate-500">Note</span>
                    <span className="font-medium text-black">
                      {viewInvoice.note}
                    </span>
                  </>
                ) : null}
              </div>

              {Number(viewInvoice.lateFeeAmount) > 0 &&
              viewInvoice.status === 'Pending' &&
              String(viewInvoice.type) !== 'Commission Invoice' ? (
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Give Late Fee Discount
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={viewInvoice.lateFeeAmount}
                      value={waiverDraft}
                      onChange={(e) => {
                        setWaiverDraft(e.target.value);
                        setWaiverError('');
                      }}
                      placeholder={`Up to ₹${viewInvoice.lateFeeAmount}`}
                      className="w-32 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA]"
                    />
                    <span className="text-xs text-slate-500">
                      of ₹{viewInvoice.lateFeeAmount} late fee
                    </span>
                  </div>
                  {/* <textarea
                    value={waiverReasonDraft}
                    onChange={(e) => setWaiverReasonDraft(e.target.value)}
                    placeholder='e.g. "Customer facing financial hardship this month"'
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 px-3 text-sm outline-none focus:border-[#6C3EFA] resize-none"
                  /> */}
                  {waiverError ? (
                    <p className="mt-1 text-xs text-red-500">{waiverError}</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={waiverSubmitting}
                    onClick={async () => {
                      const amount = Number(waiverDraft);
                      if (!amount || amount <= 0) {
                        setWaiverError(
                          'Enter a discount amount greater than 0.',
                        );
                        return;
                      }
                      // if (amount > Number(viewInvoice.lateFeeAmount)) {
                      //   setWaiverError(
                      //     `Discount cannot exceed the current late fee of ₹${viewInvoice.lateFeeAmount}.`,
                      //   );
                      //   return;
                      // }
                      // if (!waiverReasonDraft.trim()) {
                      //   setWaiverError(
                      //     'Please add a reason for this discount.',
                      //   );
                      //   return;
                      // }
                      // const token =
                      if (amount > Number(viewInvoice.lateFeeAmount)) {
                        setWaiverError(
                          `Discount cannot exceed the current late fee of ₹${viewInvoice.lateFeeAmount}.`,
                        );
                        return;
                      }
                      const token =
                        typeof window !== 'undefined'
                          ? localStorage.getItem('adminToken')
                          : null;
                      try {
                        setWaiverSubmitting(true);
                        // await apiUpdatePendingLateFeeWaiver(
                        //   token,
                        //   viewInvoice._id,
                        //   {
                        //     waiverAmount: amount,
                        //     reason: waiverReasonDraft.trim(),
                        //   },
                        // );
                        await apiUpdatePendingLateFeeWaiver(
                          token,
                          viewInvoice._id,
                          {
                            waiverAmount: amount,
                            reason: 'Admin discount',
                          },
                        );
                        // const updatedLateFee = Math.max(
                        //   0,
                        //   Number(viewInvoice.lateFeeAmount) - amount,
                        // );
                        // setViewInvoice((prev) =>
                        //   prev
                        //     ? { ...prev, lateFeeAmount: updatedLateFee }
                        //     : prev,
                        // );
                        // setInvoices((prev) =>
                        //   prev.map((inv) =>
                        //     inv._id === viewInvoice._id
                        //       ? { ...inv, lateFeeAmount: updatedLateFee }
                        //       : inv,
                        //   ),
                        // );
                        const originalLateFee =
                          viewInvoice._originalLateFeeAmount != null
                            ? Number(viewInvoice._originalLateFeeAmount)
                            : Number(viewInvoice.lateFeeAmount);
                        const updatedLateFee = Math.max(
                          0,
                          Number(viewInvoice.lateFeeAmount) - amount,
                        );
                        setViewInvoice((prev) =>
                          prev
                            ? {
                                ...prev,
                                lateFeeAmount: updatedLateFee,
                                _originalLateFeeAmount: originalLateFee,
                              }
                            : prev,
                        );
                        setInvoices((prev) =>
                          prev.map((inv) =>
                            inv._id === viewInvoice._id
                              ? {
                                  ...inv,
                                  lateFeeAmount: updatedLateFee,
                                  _originalLateFeeAmount: originalLateFee,
                                }
                              : inv,
                          ),
                        );
                        //   setWaiverDraft('');
                        //   setWaiverReasonDraft('');
                        // } catch (err) {
                        setWaiverDraft('');
                      } catch (err) {
                        setWaiverError(
                          err?.response?.data?.message ||
                            'Failed to apply discount.',
                        );
                      } finally {
                        setWaiverSubmitting(false);
                      }
                    }}
                    className="mt-2 px-4 py-2 rounded-lg bg-[#16A34A] text-sm font-medium text-white hover:bg-[#15803D] transition disabled:opacity-50"
                  >
                    {waiverSubmitting ? 'Applying…' : 'Apply Discount'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setRemarks((prev) => ({
                    ...prev,
                    [viewInvoice._id]: remarkDraft,
                  }));
                  setViewInvoice(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#6C3EFA] text-sm font-medium text-white hover:bg-[#5b2fe0] transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
