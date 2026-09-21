// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   FileText,
//   CalendarDays,
//   Download,
//   Mail,
//   ChevronDown,
//   FileBadge,
//   Search,
// } from 'lucide-react';
// import { apiGetMyInvoices } from '@/lib/api';
// import jsPDF from 'jspdf';
// import JSZip from 'jszip';
// import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

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

// function loadImageAsDataUrl(src) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous';
//     img.onload = () => {
//       try {
//         const canvas = document.createElement('canvas');
//         canvas.width = img.naturalWidth;
//         canvas.height = img.naturalHeight;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL('image/png'));
//       } catch (e) {
//         reject(e);
//       }
//     };
//     img.onerror = reject;
//     img.src = src;
//   });
// }

// // function drawRentalInvoicePDF(pdf, invoice, logoDataUrl) {
// //   const pageW = 210;
// //   const marginX = 14;
// //   const rightX = pageW - marginX;
// //   let y = 20;

// //   // Header title
// //   pdf.setFontSize(18);
// //   pdf.setFont(undefined, 'bold');
// //   pdf.text(`Invoice - ${invoice.invoiceId}`, marginX, y);
// //   pdf.setFont(undefined, 'normal');

// //   y += 5;
// //   pdf.setDrawColor(230);
// //   pdf.line(marginX, y, rightX, y);

// //   // Logo + company block (left)
// //   const logoY = y + 14;
// //   if (logoDataUrl) {
// //     try {
// //       pdf.addImage(logoDataUrl, 'PNG', marginX, logoY - 8, 16, 16);
// //     } catch (e) {
// //       // fall back silently if the image fails to embed
// //     }
// //   }

// //   pdf.setFontSize(14);
// //   pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
// //   pdf.setFont(undefined, 'normal');
// //   pdf.setFontSize(9);
// //   pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
// //   pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

// //   // Address block (right, right-aligned)
// //   pdf.setFontSize(9);
// //   const addrLines = [
// //     'State: Maharashtra || State Code: 27',
// //     'City: Pune',
// //     'Address: B1-1002, Sr. No. 41/1/1,',
// //     'Near Kakde Terrace, Warje,',
// //     'Pune \u2013 411058, Maharashtra, India.',
// //   ];
// //   let addrY = y + 8;
// //   addrLines.forEach((line) => {
// //     pdf.text(line, rightX, addrY, { align: 'right' });
// //     addrY += 5;
// //   });

// //   y = Math.max(logoY + 16, addrY + 4);

// //   // Gray "Invoice Details / Billed to" box
// //   const boxTop = y;
// //   const rentalItemsCountForHeight = (invoice.lineItems || []).filter(
// //     (li) =>
// //       (li.productType || '').toLowerCase() === 'rent' ||
// //       (li.productType || '').toLowerCase() === 'rental',
// //   ).length;
// //   const extraDepositLines =
// //     Number(invoice.deposit || 0) > 0 && rentalItemsCountForHeight > 0
// //       ? rentalItemsCountForHeight > 1
// //         ? rentalItemsCountForHeight + 1
// //         : 1
// //       : 0;
// //   // const extraDeliveryLines = Number(invoice.deliveryFee || 0) > 0 ? 1 : 0;
// //   // const boxHeight = 62 + (extraDepositLines + extraDeliveryLines) * 6;
// //   const extraDynamicFeeLines = [
// //     Number(invoice.careTax || 0),
// //     Number(invoice.deliveryPackaging || invoice.deliveryFee || 0),
// //     Number(invoice.installationFee || 0),
// //     Number(invoice.platformFee || 0),
// //     Number(invoice.relocationWarranty || 0),
// //     Number(invoice.repairWarranty || 0),
// //   ].filter((v) => v > 0).length;
// //   const boxHeight = 62 + (extraDepositLines + extraDynamicFeeLines) * 6;
// //   pdf.setFillColor(245, 247, 250);
// //   pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

// //   let leftY = boxTop + 10;
// //   pdf.setFontSize(12);
// //   pdf.setFont(undefined, 'bold');
// //   pdf.text('Invoice Details', marginX + 6, leftY);
// //   pdf.setFont(undefined, 'normal');
// //   pdf.setFontSize(9);

// //   const details = [
// //     // ['Order Number', invoice.invoiceId],
// //     ['Order Number', invoice.orderRef],
// //     ['Order Placed', fmtDate(invoice.date)],
// //     [
// //       'Total Rate',
// //       `Rs. ${Number(invoice.baseRentalCost || 0).toLocaleString('en-IN')}`,
// //     ],
// //     [
// //       'Total Discount',
// //       `Rs. ${Number(invoice.discountAmount || 0).toLocaleString('en-IN')}`,
// //     ],
// //     [
// //       'Total Late Fee',
// //       `Rs. ${Number(invoice.lateFee || 0).toLocaleString('en-IN')}`,
// //     ],
// //     ['Gst', `Rs. ${Number(invoice.gst || 0).toLocaleString('en-IN')}`],
// //   ];
// //   leftY += 7;
// //   details.forEach(([label, val]) => {
// //     pdf.setFont(undefined, 'bold');
// //     pdf.text(label, marginX + 6, leftY);
// //     pdf.setFont(undefined, 'normal');
// //     pdf.text(String(val), marginX + 45, leftY);
// //     leftY += 6;
// //   });

// //   const lineItemsForDetails = invoice.lineItems || [];
// //   const rentalItemsForDeposit = lineItemsForDetails.filter(
// //     (li) =>
// //       (li.productType || '').toLowerCase() === 'rent' ||
// //       (li.productType || '').toLowerCase() === 'rental',
// //   );
// //   if (Number(invoice.deposit || 0) > 0 && rentalItemsForDeposit.length > 0) {
// //     if (rentalItemsForDeposit.length > 1) {
// //       pdf.setFont(undefined, 'bold');
// //       pdf.text('Refundable Deposit', marginX + 6, leftY);
// //       pdf.setFont(undefined, 'normal');
// //       leftY += 6;
// //       const depositPerItem =
// //         Number(invoice.deposit || 0) / rentalItemsForDeposit.length;
// //       rentalItemsForDeposit.forEach((li) => {
// //         pdf.text(
// //           `(${li.productName}): Rs. ${depositPerItem.toLocaleString('en-IN')}`,
// //           marginX + 10,
// //           leftY,
// //         );
// //         leftY += 6;
// //       });
// //     } else {
// //       pdf.setFont(undefined, 'bold');
// //       pdf.text('Refundable Deposit', marginX + 6, leftY);
// //       pdf.setFont(undefined, 'normal');
// //       pdf.text(
// //         `Rs. ${Number(invoice.deposit || 0).toLocaleString('en-IN')}`,
// //         marginX + 45,
// //         leftY,
// //       );
// //       leftY += 6;
// //     }
// //   }

// //   // if (Number(invoice.deliveryFee || 0) > 0) {
// //   //   pdf.setFont(undefined, 'bold');
// //   //   pdf.text('Delivery & Packaging', marginX + 6, leftY);
// //   //   pdf.setFont(undefined, 'normal');
// //   //   pdf.text(
// //   //     `Rs. ${Number(invoice.deliveryFee || 0).toLocaleString('en-IN')}`,
// //   //     marginX + 45,
// //   //     leftY,
// //   //   );
// //   //   leftY += 6;
// //   // }
// //   const dynamicFeeRows = [
// //     ['Care & Protection', Number(invoice.careTax || 0)],
// //     [
// //       'Delivery & Packaging',
// //       Number(invoice.deliveryPackaging || invoice.deliveryFee || 0),
// //     ],
// //     ['Installation Fee', Number(invoice.installationFee || 0)],
// //     ['Platform Fee', Number(invoice.platformFee || 0)],
// //     ['Relocation Warranty', Number(invoice.relocationWarranty || 0)],
// //     ['Repair & Warranty', Number(invoice.repairWarranty || 0)],
// //   ];
// //   dynamicFeeRows.forEach(([label, val]) => {
// //     if (val > 0) {
// //       pdf.setFont(undefined, 'bold');
// //       pdf.text(label, marginX + 6, leftY);
// //       pdf.setFont(undefined, 'normal');
// //       pdf.text(`Rs. ${val.toLocaleString('en-IN')}`, marginX + 45, leftY);
// //       leftY += 6;
// //     }
// //   });
// //   leftY += 2;
// //   pdf.setFontSize(13);
// //   pdf.setFont(undefined, 'bold');
// //   pdf.text('Net Payable', marginX + 6, leftY);
// //   pdf.text(
// //     `Rs. ${Number(invoice.amount || 0).toLocaleString('en-IN')}`,
// //     marginX + 45,
// //     leftY,
// //   );
// //   pdf.setFont(undefined, 'normal');

// //   // Billed to (right side of box)
// //   let rightY = boxTop + 10;
// //   pdf.setFontSize(12);
// //   pdf.setFont(undefined, 'bold');
// //   pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
// //   pdf.setFont(undefined, 'normal');
// //   pdf.setFontSize(9);
// //   rightY += 7;
// //   pdf.text(invoice.name || '\u2014', rightX - 6, rightY, { align: 'right' });
// //   rightY += 5;
// //   pdf.text(invoice.phone || '\u2014', rightX - 6, rightY, { align: 'right' });
// //   rightY += 5;
// //   const addr = invoice.address || '\u2014';
// //   const addrWrapped = pdf.splitTextToSize(addr, 70);
// //   addrWrapped.forEach((line) => {
// //     pdf.text(line, rightX - 6, rightY, { align: 'right' });
// //     rightY += 5;
// //   });

// //   y = boxTop + boxHeight + 12;

// //   // Invoice Item(s) Details heading
// //   pdf.setFontSize(14);
// //   pdf.setFont(undefined, 'bold');
// //   pdf.text('Invoice Item(s) Details', marginX, y);
// //   pdf.setFont(undefined, 'normal');
// //   y += 8;

// //   const cols = [
// //     { label: 'S.No', x: marginX + 2, w: 8 },
// //     { label: 'Particulars', x: marginX + 12, w: 62 },
// //     { label: 'Rate', x: marginX + 82, w: 20 },
// //     { label: 'Coupon\nDiscount', x: marginX + 108, w: 20 },
// //     { label: 'Late\nFees', x: marginX + 132, w: 16 },
// //     { label: 'Taxable\nValue', x: marginX + 154, w: 18, align: 'right' },
// //     { label: 'GST', x: rightX - 2, w: 18, align: 'right' },
// //   ];

// //   pdf.setFontSize(8);
// //   pdf.setFont(undefined, 'bold');
// //   pdf.setTextColor(110);
// //   cols.forEach((c) => {
// //     pdf.text(c.label, c.x, y, c.align ? { align: c.align } : undefined);
// //   });
// //   pdf.setTextColor(0, 0, 0);
// //   pdf.setFont(undefined, 'normal');
// //   y += 6;

// //   const lineItems = invoice.lineItems || [];
// //   const gstPerItem = lineItems.length
// //     ? Number(invoice.gst || 0) / lineItems.length
// //     : 0;

// //   lineItems.forEach((li, idx) => {
// //     const rowTop = y;
// //     const taxable = Number(li.pricePerDay || 0) * Number(li.quantity || 1);

// //     const itemNameWrapped = pdf.splitTextToSize(
// //       `Item: ${li.productName} (${li.productType})`,
// //       cols[1].w,
// //     );
// //     const particularLines = [
// //       ...itemNameWrapped,
// //       `Qty: ${li.quantity}`,
// //       li.ref ? `Ref: ${li.ref}` : null,
// //       li.hsn ? `HSN/SAC: ${li.hsn}` : null,
// //     ].filter(Boolean);

// //     pdf.setFontSize(8);
// //     pdf.text(String(idx + 1), cols[0].x, rowTop + 4);
// //     pdf.text(particularLines, cols[1].x, rowTop + 4);
// //     pdf.text(
// //       `Rs.${Number(li.pricePerDay || 0).toLocaleString('en-IN')}`,
// //       cols[2].x,
// //       rowTop + 4,
// //     );
// //     pdf.text('Rs.0', cols[3].x, rowTop + 4);
// //     pdf.text('Rs.0', cols[4].x, rowTop + 4);
// //     pdf.text(`Rs.${taxable.toLocaleString('en-IN')}`, cols[5].x, rowTop + 4, {
// //       align: 'right',
// //     });
// //     pdf.text(`Rs.${gstPerItem.toFixed(2)}`, cols[6].x, rowTop + 4, {
// //       align: 'right',
// //     });

// //     const rowHeight = Math.max(particularLines.length * 4.2 + 4, 14);
// //     pdf.setDrawColor(225);
// //     pdf.roundedRect(
// //       marginX,
// //       rowTop - 4,
// //       rightX - marginX,
// //       rowHeight,
// //       2,
// //       2,
// //       'S',
// //     );
// //     y = rowTop + rowHeight + 4;
// //   });

// //   y += 4;
// //   pdf.setFontSize(9);
// //   pdf.setTextColor(120);
// //   pdf.text(
// //     'This is a system-generated document. No signature required.',
// //     marginX,
// //     y,
// //   );
// //   pdf.setTextColor(0, 0, 0);
// // }

// function drawRentalInvoicePDF(pdf, invoice, logoDataUrl) {
//   const pageW = 210;
//   const marginX = 14;
//   const rightX = pageW - marginX;
//   let y = 20;

//   // Header title
//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(`Rent Receipt - ${invoice.invoiceId.replace('#', '')}`, marginX, y);
//   pdf.setFont(undefined, 'normal');

//   y += 5;
//   pdf.setDrawColor(230);
//   pdf.line(marginX, y, rightX, y);

//   // Logo + company block (left) — actual Rentnpay logo image, falling
//   // back to the orange-circle "R" mark only if the image failed to load.
//   const logoY = y + 14;
//   if (logoDataUrl) {
//     try {
//       pdf.addImage(logoDataUrl, 'PNG', marginX, logoY - 8, 16, 16);
//     } catch (e) {
//       pdf.setFillColor(255, 140, 0);
//       pdf.circle(marginX + 8, logoY, 8, 'F');
//       pdf.setTextColor(255, 255, 255);
//       pdf.setFontSize(22);
//       pdf.setFont(undefined, 'bold');
//       pdf.text('R', marginX + 8, logoY + 2.5, { align: 'center' });
//       pdf.setTextColor(0, 0, 0);
//     }
//   } else {
//     pdf.setFillColor(255, 140, 0);
//     pdf.circle(marginX + 8, logoY, 8, 'F');
//     pdf.setTextColor(255, 255, 255);
//     pdf.setFontSize(22);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('R', marginX + 8, logoY + 2.5, { align: 'center' });
//     pdf.setTextColor(0, 0, 0);
//   }

//   pdf.setFontSize(14);
//   pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
//   pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

//   // Address block (right, right-aligned)
//   pdf.setFontSize(9);
//   const addrLines = [
//     'State: Maharashtra || State Code: 27',
//     'City: Pune',
//     'Address: B1-1002, Sr. No. 41/1/1,',
//     'Near Kakde Terrace, Warje,',
//     'Pune \u2013 411058, Maharashtra, India.',
//   ];
//   let addrY = y + 8;
//   addrLines.forEach((line) => {
//     pdf.text(line, rightX, addrY, { align: 'right' });
//     addrY += 5;
//   });

//   y = Math.max(logoY + 16, addrY + 4);

//   // Gray "Invoice Details / Billed to" box — same structure as Admin's
//   // single-box layout (Order Number, Date, Status, Note, Amount on the
//   // left; Billed-to on the right), instead of the old itemized table.
//   const boxTop = y;
//   const details = [
//     ['Order Number', invoice.orderRef || '—'],
//     ['Date', fmtDate(invoice.date)],
//     ['Status', invoice.status === 'Pending' ? 'Unpaid' : invoice.status || '—'],
//     ...(invoice.tenure ? [['Note', invoice.tenure]] : []),
//   ];
//   const boxHeight = 56 + details.length * 0; // base height, grows below if needed
//   const computedBoxHeight = 46 + details.length * 6;
//   pdf.setFillColor(245, 247, 250);
//   pdf.roundedRect(
//     marginX,
//     boxTop,
//     rightX - marginX,
//     computedBoxHeight,
//     3,
//     3,
//     'F',
//   );

//   let leftY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Details', marginX + 6, leftY);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);

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
//   pdf.text('Rent Amount', marginX + 6, leftY);
//   pdf.text(
//     `Rs. ${Number(invoice.amount || 0).toLocaleString('en-IN')}`,
//     marginX + 45,
//     leftY,
//   );
//   pdf.setFont(undefined, 'normal');

//   // Billed to (right side of box)
//   let rightY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   rightY += 7;
//   pdf.text(invoice.name || '\u2014', rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   pdf.text(invoice.phone || '\u2014', rightX - 6, rightY, { align: 'right' });

//   y = boxTop + computedBoxHeight + 12;

//   y += 8;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     marginX,
//     y,
//   );
//   pdf.setTextColor(0, 0, 0);
// }

// async function downloadInvoicePDFUser(invoice) {
//   let logoDataUrl = null;
//   try {
//     logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
//   } catch (e) {
//     // proceed without the logo if it fails to load
//   }
//   const pdf = new jsPDF();
//   drawRentalInvoicePDF(pdf, invoice, logoDataUrl);
//   pdf.save(`${invoice.invoiceId.replace('#', '')}.pdf`);
// }

// function buildInvoicePDFBlob(invoice, logoDataUrl) {
//   const pdf = new jsPDF();
//   drawRentalInvoicePDF(pdf, invoice, logoDataUrl);
//   return pdf.output('blob');
// }

// async function downloadAllInvoicesZip(invoices) {
//   if (!invoices || invoices.length === 0) return;

//   let logoDataUrl = null;
//   try {
//     logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
//   } catch (e) {
//     // proceed without the logo if it fails to load
//   }

//   const zip = new JSZip();

//   invoices.forEach((invoice) => {
//     const blob = buildInvoicePDFBlob(invoice, logoDataUrl);
//     zip.file(`${invoice.invoiceId.replace('#', '')}.pdf`, blob);
//   });

//   const zipBlob = await zip.generateAsync({ type: 'blob' });
//   const url = URL.createObjectURL(zipBlob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'invoices.zip';
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   URL.revokeObjectURL(url);
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
// const ITEMS_PER_PAGE = 30;

// const InvoiceAgreement = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [financialYear, setFinancialYear] = useState('All');
//   const [invoiceStatus, setInvoiceStatus] = useState('All');
//   const [search, setSearch] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [zipLoading, setZipLoading] = useState(false);

//   const handleDownloadAllInvoices = async () => {
//     setZipLoading(true);
//     try {
//       await downloadAllInvoicesZip(filteredInvoices);
//     } finally {
//       setZipLoading(false);
//     }
//   };

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
//     let rows = invoices;
//     if (financialYear !== 'All') {
//       rows = rows.filter((inv) => getFinancialYear(inv.date) === financialYear);
//     }
//     if (invoiceStatus !== 'All') {
//       rows = rows.filter((inv) => {
//         const displayStatus = inv.status === 'Pending' ? 'Unpaid' : inv.status;
//         return displayStatus === invoiceStatus;
//       });
//     }
//     if (search.trim()) {
//       const q = search.trim().toLowerCase();
//       rows = rows.filter(
//         (inv) =>
//           String(inv.invoiceId || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(inv.orderRef || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(inv.item || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(inv.amount ?? '').includes(q),
//       );
//     }
//     // Paid invoices first (same as Admin's table default view), then
//     // within each group oldest date first — so invoice numbers read in
//     // ascending order (INV-0001, INV-0002, INV-0003...) instead of
//     // reverse.
//     return [...rows].sort((a, b) => {
//       const aPaid = a.status === 'Paid' ? 0 : 1;
//       const bPaid = b.status === 'Paid' ? 0 : 1;
//       if (aPaid !== bPaid) return aPaid - bPaid;
//       return new Date(a.date) - new Date(b.date);
//     });
//   }, [invoices, financialYear, invoiceStatus, search]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [financialYear, invoiceStatus, search]);

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE),
//   );
//   const paginatedInvoices = React.useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
//   }, [filteredInvoices, currentPage]);

//   return (
//     <div>
//       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
//         {/* Header */}

//         {/* <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
//           <div>
//             <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>

//             <p className="text-slate-500 mt-2">
//               Access your rental agreements and monthly tax invoices.
//             </p>
//           </div>

//           <button className="flex items-center justify-center gap-2 border rounded-xl px-5 py-3 bg-white hover:bg-gray-50 transition shadow-sm">
//             <Mail size={18} />
//             Email All to Me
//           </button>
//         </div> */}

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

//         {/* <div className="mt-2 sm:mt-0"> */}
//         <div className="mt-2 sm:mt-0 lg:-mt-1">
//           {/* <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between"> */}
//           <div className="flex flex-col gap-3 mb-4 sm:mb-3 lg:mb-2.5 md:flex-row md:items-center md:justify-between">
//             <div className="flex items-center gap-2">
//               <h2 className="text-base font-semibold sm:text-lg">
//                 Payment Invoices
//               </h2>

//               <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full">
//                 {filteredInvoices.length}
//               </span>
//             </div>

//             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-nowrap">
//               <div className="relative w-full sm:flex-1 sm:min-w-[160px] sm:max-w-md">
//                 <Search
//                   size={14}
//                   className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
//                 />
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search invoices"
//                   className="w-full border bg-white rounded-lg pl-8 pr-2 py-2 sm:py-1.5 text-xs sm:text-sm outline-none"
//                 />
//               </div>

//               <div className="flex flex-row gap-2">
//                 <select
//                   value={invoiceStatus}
//                   onChange={(e) => setInvoiceStatus(e.target.value)}
//                   className="flex-1 sm:flex-none w-full sm:w-28 border bg-white rounded-lg px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm outline-none min-w-0"
//                 >
//                   <option value="All">All Status</option>
//                   <option value="Paid">Paid</option>
//                   <option value="Unpaid">Unpaid</option>
//                 </select>

//                 <select
//                   value={financialYear}
//                   onChange={(e) => setFinancialYear(e.target.value)}
//                   className="flex-1 sm:flex-none w-full sm:w-32 border bg-white rounded-lg px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm outline-none min-w-0"
//                 >
//                   <option value="All">All Years</option>
//                   {financialYears.map((fy) => (
//                     <option key={fy} value={fy}>
//                       FY {fy}
//                     </option>
//                   ))}
//                 </select>

//                 <button
//                   onClick={handleDownloadAllInvoices}
//                   disabled={zipLoading || filteredInvoices.length === 0}
//                   className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2 sm:py-1.5 text-xs sm:text-sm bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-40 flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
//                 >
//                   <Download size={15} />
//                   {zipLoading ? 'Preparing ZIP…' : 'Download All'}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden hidden sm:block">
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-gray-500 text-xs">
//                     <th className="px-4 py-2">DUE DATE</th>
//                     <th className="px-4 py-2">INVOICE ID</th>
//                     <th className="px-4 py-2">ORDER ID</th>
//                     <th className="px-4 py-2">ITEM</th>
//                     <th className="px-4 py-2">AMOUNT</th>
//                     <th className="px-4 py-2">STATUS</th>
//                     <th className="px-4 py-2 text-center">ACTION</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={7}
//                         className="px-4 py-6 text-sm text-center text-gray-400"
//                       >
//                         Loading invoices…
//                       </td>
//                     </tr>
//                   ) : paginatedInvoices.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={7}
//                         className="px-4 py-6 text-sm text-center text-gray-400"
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
//                         <td className="px-4 py-3 text-sm font-medium">
//                           {fmtDate(invoice.date)}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className="bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold">
//                             {invoice.invoiceId}
//                           </span>
//                         </td>

//                         <td className="px-4 py-3">
//                           <span className="text-blue-600 text-xs font-medium">
//                             {invoice.orderRef}
//                           </span>
//                         </td>

//                         <td className="px-4 py-3 text-sm text-gray-600">
//                           {invoice.item}
//                         </td>

//                         <td className="px-4 py-3 text-sm font-semibold">
//                           ₹{invoice.amount.toLocaleString('en-IN')}
//                         </td>

//                         <td className="px-4 py-3">
//                           <span
//                             className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
//                               invoice.status === 'Paid'
//                                 ? 'text-green-700'
//                                 : 'text-amber-700'
//                             }`}
//                           >
//                             <span
//                               className={`h-2 w-2 rounded-full ${
//                                 invoice.status === 'Paid'
//                                   ? 'bg-green-500'
//                                   : 'bg-amber-400'
//                               }`}
//                             />
//                             {invoice.status === 'Pending'
//                               ? 'Unpaid'
//                               : invoice.status}
//                           </span>
//                         </td>

//                         <td className="px-4 py-3 text-center">
//                           <button
//                             onClick={() => {
//                               downloadInvoicePDFUser(invoice);
//                             }}
//                             className="text-orange-500 hover:text-orange-600"
//                           >
//                             <Download size={16} />
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
//               <div className="flex items-center justify-between px-4 py-3 border-t">
//                 <p className="text-xs text-gray-500">
//                   Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
//                   {Math.min(
//                     currentPage * ITEMS_PER_PAGE,
//                     filteredInvoices.length,
//                   )}{' '}
//                   of {filteredInvoices.length} invoices
//                 </p>
//                 <div className="flex items-center gap-1.5">
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
//                   >
//                     Previous
//                   </button>
//                   <span className="h-6 w-6 rounded-lg text-xs border border-orange-500 bg-orange-500 text-white font-semibold flex items-center justify-center">
//                     {currentPage}
//                   </span>
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(p + 1, totalPages))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Mobile table (small screens only) */}
//           <div className="sm:hidden bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-[560px] w-full">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-gray-500 text-[10px] uppercase tracking-wide">
//                     <th className="px-3 py-2 whitespace-nowrap">Due Date</th>
//                     <th className="px-3 py-2 min-w-[130px]">Invoice Id</th>
//                     <th className="px-3 py-2 min-w-[100px]">Order Id</th>
//                     <th className="px-3 py-2 min-w-[170px]">Item</th>
//                     <th className="px-3 py-2 text-right whitespace-nowrap">
//                       Amount
//                     </th>
//                     <th className="px-3 py-2 whitespace-nowrap">Status</th>
//                     <th className="px-3 py-2 text-center whitespace-nowrap">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={7}
//                         className="px-3 py-6 text-xs text-center text-gray-400"
//                       >
//                         Loading invoices…
//                       </td>
//                     </tr>
//                   ) : paginatedInvoices.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={7}
//                         className="px-3 py-6 text-xs text-center text-gray-400"
//                       >
//                         No invoices yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedInvoices.map((invoice) => (
//                       <tr key={invoice._id} className="border-t">
//                         <td className="px-3 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
//                           {fmtDate(invoice.date)}
//                         </td>

//                         <td className="px-3 py-3 max-w-[150px]">
//                           <span
//                             className="inline-block max-w-full truncate align-middle bg-gray-100 rounded-full px-2 py-1 text-[10px] font-semibold"
//                             title={invoice.invoiceId}
//                           >
//                             {invoice.invoiceId}
//                           </span>
//                         </td>

//                         <td className="px-3 py-3 text-xs text-blue-600 font-medium whitespace-nowrap">
//                           {invoice.orderRef}
//                         </td>

//                         <td
//                           className="px-3 py-3 text-xs text-gray-600 max-w-[190px] truncate"
//                           title={invoice.item}
//                         >
//                           {invoice.item}
//                         </td>

//                         <td className="px-3 py-3 text-xs font-semibold text-slate-900 text-right whitespace-nowrap">
//                           ₹{invoice.amount.toLocaleString('en-IN')}
//                         </td>

//                         <td className="px-3 py-3 whitespace-nowrap">
//                           <span
//                             className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
//                               invoice.status === 'Paid'
//                                 ? 'text-green-700'
//                                 : 'text-amber-700'
//                             }`}
//                           >
//                             <span
//                               className={`h-1.5 w-1.5 rounded-full ${
//                                 invoice.status === 'Paid'
//                                   ? 'bg-green-500'
//                                   : 'bg-amber-400'
//                               }`}
//                             />
//                             {invoice.status === 'Pending'
//                               ? 'Unpaid'
//                               : invoice.status}
//                           </span>
//                         </td>

//                         <td className="px-3 py-3 text-center">
//                           <button
//                             onClick={() => downloadInvoicePDFUser(invoice)}
//                             className="text-orange-500 active:text-orange-600"
//                             aria-label="Download invoice"
//                           >
//                             <Download size={15} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile pagination */}
//             {!loading && filteredInvoices.length > 0 && (
//               <div className="border-t px-3 py-2.5 flex items-center justify-between gap-2">
//                 <p className="text-[10px] text-gray-500 leading-tight">
//                   {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
//                   {Math.min(
//                     currentPage * ITEMS_PER_PAGE,
//                     filteredInvoices.length,
//                   )}{' '}
//                   of {filteredInvoices.length}
//                 </p>
//                 <div className="flex items-center gap-1.5 shrink-0">
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium disabled:opacity-40 active:bg-gray-50 transition"
//                   >
//                     Prev
//                   </button>
//                   <span className="h-6 w-6 shrink-0 rounded-lg text-[11px] border border-orange-500 bg-orange-500 text-white font-semibold flex items-center justify-center">
//                     {currentPage}
//                   </span>
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(p + 1, totalPages))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium disabled:opacity-40 active:bg-gray-50 transition"
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

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mt-6 bg-[#edf5ff] border border-blue-200 rounded-xl p-3.5 sm:p-4">
//           <div className="flex gap-3">
//             <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
//               <FileText size={16} className="sm:hidden" />
//               <FileText size={18} className="hidden sm:block" />
//             </div>

//             <div className="min-w-0">
//               {/* <h3 className="font-semibold text-sm text-blue-900 leading-snug">
//                 Need documents for tax filing?
//               </h3> */}

//               <p className="text-blue-700 text-xs sm:text-sm mt-1 leading-relaxed">
//                 Use the &quot;Download All&quot; button to all your invoices in
//                 one convenient ZIP file.
//               </p>

//               <p className="text-xs text-blue-500 mt-1.5 sm:mt-1 leading-relaxed">
//                 💡 Tip: Download invoices regularly for your records and GST
//                 claims.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceAgreement;

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
// import JSZip from 'jszip';
// import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

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

// function loadImageAsDataUrl(src) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous';
//     img.onload = () => {
//       try {
//         const canvas = document.createElement('canvas');
//         canvas.width = img.naturalWidth;
//         canvas.height = img.naturalHeight;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL('image/png'));
//       } catch (e) {
//         reject(e);
//       }
//     };
//     img.onerror = reject;
//     img.src = src;
//   });
// }

// function drawRentalInvoicePDF(pdf, invoice, logoDataUrl) {
//   const pageW = 210;
//   const marginX = 14;
//   const rightX = pageW - marginX;
//   let y = 20;

//   // Header title
//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(`Invoice - ${invoice.invoiceId}`, marginX, y);
//   pdf.setFont(undefined, 'normal');

//   y += 5;
//   pdf.setDrawColor(230);
//   pdf.line(marginX, y, rightX, y);

//   // Logo + company block (left)
//   const logoY = y + 14;
//   if (logoDataUrl) {
//     try {
//       pdf.addImage(logoDataUrl, 'PNG', marginX, logoY - 8, 16, 16);
//     } catch (e) {
//       // fall back silently if the image fails to embed
//     }
//   }

//   pdf.setFontSize(14);
//   pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
//   pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

//   // Address block (right, right-aligned)
//   pdf.setFontSize(9);
//   const addrLines = [
//     'State: Maharashtra || State Code: 27',
//     'City: Pune',
//     'Address: B1-1002, Sr. No. 41/1/1,',
//     'Near Kakde Terrace, Warje,',
//     'Pune \u2013 411058, Maharashtra, India.',
//   ];
//   let addrY = y + 8;
//   addrLines.forEach((line) => {
//     pdf.text(line, rightX, addrY, { align: 'right' });
//     addrY += 5;
//   });

//   y = Math.max(logoY + 16, addrY + 4);

//   // Gray "Invoice Details / Billed to" box
//   const boxTop = y;
//   const rentalItemsCountForHeight = (invoice.lineItems || []).filter(
//     (li) =>
//       (li.productType || '').toLowerCase() === 'rent' ||
//       (li.productType || '').toLowerCase() === 'rental',
//   ).length;
//   const extraDepositLines =
//     Number(invoice.deposit || 0) > 0 && rentalItemsCountForHeight > 0
//       ? rentalItemsCountForHeight > 1
//         ? rentalItemsCountForHeight + 1
//         : 1
//       : 0;
//   // const extraDeliveryLines = Number(invoice.deliveryFee || 0) > 0 ? 1 : 0;
//   // const boxHeight = 62 + (extraDepositLines + extraDeliveryLines) * 6;
//   const extraDynamicFeeLines = [
//     Number(invoice.careTax || 0),
//     Number(invoice.deliveryPackaging || invoice.deliveryFee || 0),
//     Number(invoice.installationFee || 0),
//     Number(invoice.platformFee || 0),
//     Number(invoice.relocationWarranty || 0),
//     Number(invoice.repairWarranty || 0),
//   ].filter((v) => v > 0).length;
//   const boxHeight = 62 + (extraDepositLines + extraDynamicFeeLines) * 6;
//   pdf.setFillColor(245, 247, 250);
//   pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

//   let leftY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Details', marginX + 6, leftY);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);

//   const details = [
//     // ['Order Number', invoice.invoiceId],
//     ['Order Number', invoice.orderRef],
//     ['Order Placed', fmtDate(invoice.date)],
//     [
//       'Total Rate',
//       `Rs. ${Number(invoice.baseRentalCost || 0).toLocaleString('en-IN')}`,
//     ],
//     [
//       'Total Discount',
//       `Rs. ${Number(invoice.discountAmount || 0).toLocaleString('en-IN')}`,
//     ],
//     [
//       'Total Late Fee',
//       `Rs. ${Number(invoice.lateFee || 0).toLocaleString('en-IN')}`,
//     ],
//     ['Gst', `Rs. ${Number(invoice.gst || 0).toLocaleString('en-IN')}`],
//   ];
//   leftY += 7;
//   details.forEach(([label, val]) => {
//     pdf.setFont(undefined, 'bold');
//     pdf.text(label, marginX + 6, leftY);
//     pdf.setFont(undefined, 'normal');
//     pdf.text(String(val), marginX + 45, leftY);
//     leftY += 6;
//   });

//   const lineItemsForDetails = invoice.lineItems || [];
//   const rentalItemsForDeposit = lineItemsForDetails.filter(
//     (li) =>
//       (li.productType || '').toLowerCase() === 'rent' ||
//       (li.productType || '').toLowerCase() === 'rental',
//   );
//   if (Number(invoice.deposit || 0) > 0 && rentalItemsForDeposit.length > 0) {
//     if (rentalItemsForDeposit.length > 1) {
//       pdf.setFont(undefined, 'bold');
//       pdf.text('Refundable Deposit', marginX + 6, leftY);
//       pdf.setFont(undefined, 'normal');
//       leftY += 6;
//       const depositPerItem =
//         Number(invoice.deposit || 0) / rentalItemsForDeposit.length;
//       rentalItemsForDeposit.forEach((li) => {
//         pdf.text(
//           `(${li.productName}): Rs. ${depositPerItem.toLocaleString('en-IN')}`,
//           marginX + 10,
//           leftY,
//         );
//         leftY += 6;
//       });
//     } else {
//       pdf.setFont(undefined, 'bold');
//       pdf.text('Refundable Deposit', marginX + 6, leftY);
//       pdf.setFont(undefined, 'normal');
//       pdf.text(
//         `Rs. ${Number(invoice.deposit || 0).toLocaleString('en-IN')}`,
//         marginX + 45,
//         leftY,
//       );
//       leftY += 6;
//     }
//   }

//   // if (Number(invoice.deliveryFee || 0) > 0) {
//   //   pdf.setFont(undefined, 'bold');
//   //   pdf.text('Delivery & Packaging', marginX + 6, leftY);
//   //   pdf.setFont(undefined, 'normal');
//   //   pdf.text(
//   //     `Rs. ${Number(invoice.deliveryFee || 0).toLocaleString('en-IN')}`,
//   //     marginX + 45,
//   //     leftY,
//   //   );
//   //   leftY += 6;
//   // }
//   const dynamicFeeRows = [
//     ['Care & Protection', Number(invoice.careTax || 0)],
//     [
//       'Delivery & Packaging',
//       Number(invoice.deliveryPackaging || invoice.deliveryFee || 0),
//     ],
//     ['Installation Fee', Number(invoice.installationFee || 0)],
//     ['Platform Fee', Number(invoice.platformFee || 0)],
//     ['Relocation Warranty', Number(invoice.relocationWarranty || 0)],
//     ['Repair & Warranty', Number(invoice.repairWarranty || 0)],
//   ];
//   dynamicFeeRows.forEach(([label, val]) => {
//     if (val > 0) {
//       pdf.setFont(undefined, 'bold');
//       pdf.text(label, marginX + 6, leftY);
//       pdf.setFont(undefined, 'normal');
//       pdf.text(`Rs. ${val.toLocaleString('en-IN')}`, marginX + 45, leftY);
//       leftY += 6;
//     }
//   });
//   leftY += 2;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Net Payable', marginX + 6, leftY);
//   pdf.text(
//     `Rs. ${Number(invoice.amount || 0).toLocaleString('en-IN')}`,
//     marginX + 45,
//     leftY,
//   );
//   pdf.setFont(undefined, 'normal');

//   // Billed to (right side of box)
//   let rightY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   rightY += 7;
//   pdf.text(invoice.name || '\u2014', rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   pdf.text(invoice.phone || '\u2014', rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   const addr = invoice.address || '\u2014';
//   const addrWrapped = pdf.splitTextToSize(addr, 70);
//   addrWrapped.forEach((line) => {
//     pdf.text(line, rightX - 6, rightY, { align: 'right' });
//     rightY += 5;
//   });

//   y = boxTop + boxHeight + 12;

//   // Invoice Item(s) Details heading
//   pdf.setFontSize(14);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Item(s) Details', marginX, y);
//   pdf.setFont(undefined, 'normal');
//   y += 8;

//   const cols = [
//     { label: 'S.No', x: marginX + 2, w: 8 },
//     { label: 'Particulars', x: marginX + 12, w: 62 },
//     { label: 'Rate', x: marginX + 82, w: 20 },
//     { label: 'Coupon\nDiscount', x: marginX + 108, w: 20 },
//     { label: 'Late\nFees', x: marginX + 132, w: 16 },
//     { label: 'Taxable\nValue', x: marginX + 154, w: 18, align: 'right' },
//     { label: 'GST', x: rightX - 2, w: 18, align: 'right' },
//   ];

//   pdf.setFontSize(8);
//   pdf.setFont(undefined, 'bold');
//   pdf.setTextColor(110);
//   cols.forEach((c) => {
//     pdf.text(c.label, c.x, y, c.align ? { align: c.align } : undefined);
//   });
//   pdf.setTextColor(0, 0, 0);
//   pdf.setFont(undefined, 'normal');
//   y += 6;

//   const lineItems = invoice.lineItems || [];
//   const gstPerItem = lineItems.length
//     ? Number(invoice.gst || 0) / lineItems.length
//     : 0;

//   lineItems.forEach((li, idx) => {
//     const rowTop = y;
//     const taxable = Number(li.pricePerDay || 0) * Number(li.quantity || 1);

//     const itemNameWrapped = pdf.splitTextToSize(
//       `Item: ${li.productName} (${li.productType})`,
//       cols[1].w,
//     );
//     const particularLines = [
//       ...itemNameWrapped,
//       `Qty: ${li.quantity}`,
//       li.ref ? `Ref: ${li.ref}` : null,
//       li.hsn ? `HSN/SAC: ${li.hsn}` : null,
//     ].filter(Boolean);

//     pdf.setFontSize(8);
//     pdf.text(String(idx + 1), cols[0].x, rowTop + 4);
//     pdf.text(particularLines, cols[1].x, rowTop + 4);
//     pdf.text(
//       `Rs.${Number(li.pricePerDay || 0).toLocaleString('en-IN')}`,
//       cols[2].x,
//       rowTop + 4,
//     );
//     pdf.text('Rs.0', cols[3].x, rowTop + 4);
//     pdf.text('Rs.0', cols[4].x, rowTop + 4);
//     pdf.text(`Rs.${taxable.toLocaleString('en-IN')}`, cols[5].x, rowTop + 4, {
//       align: 'right',
//     });
//     pdf.text(`Rs.${gstPerItem.toFixed(2)}`, cols[6].x, rowTop + 4, {
//       align: 'right',
//     });

//     const rowHeight = Math.max(particularLines.length * 4.2 + 4, 14);
//     pdf.setDrawColor(225);
//     pdf.roundedRect(
//       marginX,
//       rowTop - 4,
//       rightX - marginX,
//       rowHeight,
//       2,
//       2,
//       'S',
//     );
//     y = rowTop + rowHeight + 4;
//   });

//   y += 4;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     marginX,
//     y,
//   );
//   pdf.setTextColor(0, 0, 0);
// }

// async function downloadInvoicePDFUser(invoice) {
//   let logoDataUrl = null;
//   try {
//     logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
//   } catch (e) {
//     // proceed without the logo if it fails to load
//   }
//   const pdf = new jsPDF();
//   drawRentalInvoicePDF(pdf, invoice, logoDataUrl);
//   pdf.save(`${invoice.invoiceId.replace('#', '')}.pdf`);
// }

// function buildInvoicePDFBlob(invoice, logoDataUrl) {
//   const pdf = new jsPDF();
//   drawRentalInvoicePDF(pdf, invoice, logoDataUrl);
//   return pdf.output('blob');
// }

// async function downloadAllInvoicesZip(invoices) {
//   if (!invoices || invoices.length === 0) return;

//   let logoDataUrl = null;
//   try {
//     logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
//   } catch (e) {
//     // proceed without the logo if it fails to load
//   }

//   const zip = new JSZip();

//   invoices.forEach((invoice) => {
//     const blob = buildInvoicePDFBlob(invoice, logoDataUrl);
//     zip.file(`${invoice.invoiceId.replace('#', '')}.pdf`, blob);
//   });

//   const zipBlob = await zip.generateAsync({ type: 'blob' });
//   const url = URL.createObjectURL(zipBlob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'invoices.zip';
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   URL.revokeObjectURL(url);
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
//   const [zipLoading, setZipLoading] = useState(false);

//   const handleDownloadAllInvoices = async () => {
//     setZipLoading(true);
//     try {
//       await downloadAllInvoicesZip(filteredInvoices);
//     } finally {
//       setZipLoading(false);
//     }
//   };

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
//     <div>
//       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
//         {/* Header */}

//         {/* <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
//           <div>
//             <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>

//             <p className="text-slate-500 mt-2">
//               Access your rental agreements and monthly tax invoices.
//             </p>
//           </div>

//           <button className="flex items-center justify-center gap-2 border rounded-xl px-5 py-3 bg-white hover:bg-gray-50 transition shadow-sm">
//             <Mail size={18} />
//             Email All to Me
//           </button>
//         </div> */}

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

//         {/* <div className="mt-2 sm:mt-0"> */}
//         <div className="mt-2 sm:mt-0 lg:-mt-1">
//           {/* <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between"> */}
//           <div className="flex flex-col gap-3 mb-4 sm:mb-3 lg:mb-2.5 md:flex-row md:items-center md:justify-between">
//             <div className="flex items-center gap-2">
//               <h2 className="text-base font-semibold sm:text-lg">
//                 Payment Invoices
//               </h2>

//               <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full">
//                 {filteredInvoices.length}
//               </span>
//             </div>

//             <div className="flex flex-row gap-2 sm:items-center">
//               <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
//                 <span className="text-gray-600 text-xs sm:text-sm shrink-0 hidden xs:inline sm:inline">
//                   Financial Year:
//                 </span>

//                 <select
//                   value={financialYear}
//                   onChange={(e) => setFinancialYear(e.target.value)}
//                   className="flex-1 sm:flex-none w-full sm:w-32 border bg-white rounded-lg px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm outline-none min-w-0"
//                 >
//                   <option value="All">All Years</option>
//                   {financialYears.map((fy) => (
//                     <option key={fy} value={fy}>
//                       FY {fy}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <button
//                 onClick={handleDownloadAllInvoices}
//                 disabled={zipLoading || filteredInvoices.length === 0}
//                 className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2 sm:py-1.5 text-xs sm:text-sm bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-40 flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
//               >
//                 <Download size={15} />
//                 {zipLoading ? 'Preparing ZIP…' : 'Download All'}
//               </button>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border overflow-hidden hidden sm:block">
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-gray-500 text-xs">
//                     <th className="px-4 py-2">DATE</th>
//                     <th className="px-4 py-2">INVOICE ID</th>
//                     <th className="px-4 py-2">ITEM(S)</th>
//                     <th className="px-4 py-2">AMOUNT</th>
//                     <th className="px-4 py-2 text-center">ACTION</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-4 py-6 text-sm text-center text-gray-400"
//                       >
//                         Loading invoices…
//                       </td>
//                     </tr>
//                   ) : paginatedInvoices.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-4 py-6 text-sm text-center text-gray-400"
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
//                         <td className="px-4 py-3 text-sm font-medium">
//                           {fmtDate(invoice.date)}
//                         </td>

//                         <td className="px-4 py-3">
//                           <span className="bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold">
//                             {invoice.invoiceId}
//                           </span>
//                         </td>

//                         <td className="px-4 py-3 text-sm text-gray-600">
//                           {invoice.item}
//                         </td>

//                         <td className="px-4 py-3 text-sm font-semibold">
//                           ₹{invoice.amount.toLocaleString('en-IN')}
//                         </td>

//                         <td className="px-4 py-3 text-center">
//                           <button
//                             onClick={() => {
//                               downloadInvoicePDFUser(invoice);
//                             }}
//                             className="text-orange-500 hover:text-orange-600"
//                           >
//                             <Download size={16} />
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
//               <div className="flex items-center justify-between px-4 py-3 border-t">
//                 <p className="text-xs text-gray-500">
//                   Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
//                   {Math.min(
//                     currentPage * ITEMS_PER_PAGE,
//                     filteredInvoices.length,
//                   )}{' '}
//                   of {filteredInvoices.length} invoices
//                 </p>
//                 <div className="flex items-center gap-1.5">
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
//                   >
//                     Previous
//                   </button>
//                   <span className="h-6 w-6 rounded-lg text-xs border border-orange-500 bg-orange-500 text-white font-semibold flex items-center justify-center">
//                     {currentPage}
//                   </span>
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(p + 1, totalPages))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Mobile table (small screens only) */}
//           <div className="sm:hidden bg-white rounded-2xl shadow-sm border overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-[560px] w-full">
//                 <thead className="bg-gray-50">
//                   <tr className="text-left text-gray-500 text-[10px] uppercase tracking-wide">
//                     <th className="px-3 py-2 whitespace-nowrap">Date</th>
//                     <th className="px-3 py-2 min-w-[130px]">Invoice</th>
//                     <th className="px-3 py-2 min-w-[170px]">Item</th>
//                     <th className="px-3 py-2 text-right whitespace-nowrap">
//                       Amount
//                     </th>
//                     <th className="px-3 py-2 text-center whitespace-nowrap"></th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-3 py-6 text-xs text-center text-gray-400"
//                       >
//                         Loading invoices…
//                       </td>
//                     </tr>
//                   ) : paginatedInvoices.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className="px-3 py-6 text-xs text-center text-gray-400"
//                       >
//                         No invoices yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedInvoices.map((invoice) => (
//                       <tr key={invoice._id} className="border-t">
//                         <td className="px-3 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
//                           {fmtDate(invoice.date)}
//                         </td>

//                         <td className="px-3 py-3 max-w-[150px]">
//                           <span
//                             className="inline-block max-w-full truncate align-middle bg-gray-100 rounded-full px-2 py-1 text-[10px] font-semibold"
//                             title={invoice.invoiceId}
//                           >
//                             {invoice.invoiceId}
//                           </span>
//                         </td>

//                         <td
//                           className="px-3 py-3 text-xs text-gray-600 max-w-[190px] truncate"
//                           title={invoice.item}
//                         >
//                           {invoice.item}
//                         </td>

//                         <td className="px-3 py-3 text-xs font-semibold text-slate-900 text-right whitespace-nowrap">
//                           ₹{invoice.amount.toLocaleString('en-IN')}
//                         </td>

//                         <td className="px-3 py-3 text-center">
//                           <button
//                             onClick={() => downloadInvoicePDFUser(invoice)}
//                             className="text-orange-500 active:text-orange-600"
//                             aria-label="Download invoice"
//                           >
//                             <Download size={15} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile pagination */}
//             {!loading && filteredInvoices.length > 0 && (
//               <div className="border-t px-3 py-2.5 flex items-center justify-between gap-2">
//                 <p className="text-[10px] text-gray-500 leading-tight">
//                   {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
//                   {Math.min(
//                     currentPage * ITEMS_PER_PAGE,
//                     filteredInvoices.length,
//                   )}{' '}
//                   of {filteredInvoices.length}
//                 </p>
//                 <div className="flex items-center gap-1.5 shrink-0">
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium disabled:opacity-40 active:bg-gray-50 transition"
//                   >
//                     Prev
//                   </button>
//                   <span className="h-6 w-6 shrink-0 rounded-lg text-[11px] border border-orange-500 bg-orange-500 text-white font-semibold flex items-center justify-center">
//                     {currentPage}
//                   </span>
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(p + 1, totalPages))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium disabled:opacity-40 active:bg-gray-50 transition"
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

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mt-6 bg-[#edf5ff] border border-blue-200 rounded-xl p-3.5 sm:p-4">
//           <div className="flex gap-3">
//             <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
//               <FileText size={16} className="sm:hidden" />
//               <FileText size={18} className="hidden sm:block" />
//             </div>

//             <div className="min-w-0">
//               {/* <h3 className="font-semibold text-sm text-blue-900 leading-snug">
//                 Need documents for tax filing?
//               </h3> */}

//               <p className="text-blue-700 text-xs sm:text-sm mt-1 leading-relaxed">
//                 Use the &quot;Download All&quot; button to all your invoices in
//                 one convenient ZIP file.
//               </p>

//               <p className="text-xs text-blue-500 mt-1.5 sm:mt-1 leading-relaxed">
//                 💡 Tip: Download invoices regularly for your records and GST
//                 claims.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceAgreement;

'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  CalendarDays,
  Download,
  Mail,
  ChevronDown,
  FileBadge,
} from 'lucide-react';
import { apiGetMyInvoices } from '@/lib/api';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** e.g. Feb 2026 date -> "2025-26" (Indian FY: Apr–Mar) */
function getFinancialYear(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  const y = d.getFullYear();
  const m = d.getMonth(); // 0 = Jan
  const startYear = m >= 3 ? y : y - 1; // April(3) onward = current FY start
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

function numberToWordsInvoice(num) {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function twoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : '');
  }

  function threeDigits(n) {
    if (n >= 100) {
      return `${ones[Math.floor(n / 100)]} Hundred${
        n % 100 ? ` And ${twoDigits(n % 100)}` : ''
      }`;
    }
    return twoDigits(n);
  }

  function integerToWords(n) {
    if (n === 0) return 'Zero';
    let result = '';
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const rest = n;

    if (crore) result += `${threeDigits(crore)} Crore `;
    if (lakh) result += `${threeDigits(lakh)} Lakh `;
    if (thousand) result += `${threeDigits(thousand)} Thousand `;
    if (rest) result += threeDigits(rest);

    return result.trim();
  }

  const rupees = Math.floor(num);
  const paisa = Math.round((num - rupees) * 100);

  let words = `${integerToWords(rupees)} Rupees`;
  if (paisa > 0) {
    words += ` And ${integerToWords(paisa)} Paisa`;
  }
  return words;
}

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

function drawRentalInvoicePDF(pdf, invoice, logoDataUrl) {
  const pageW = 210;
  const marginX = 14;
  const rightX = pageW - marginX;
  let y = 20;

  // Header title
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  // pdf.text(`Invoice - ${invoice.invoiceId}`, marginX, y);
  pdf.text(`Invoice - ${invoice.orderRef}`, marginX, y);
  pdf.setFont(undefined, 'normal');

  y += 5;
  pdf.setDrawColor(230);
  pdf.line(marginX, y, rightX, y);

  // Logo + company block (left)
  const logoY = y + 14;
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, 'PNG', marginX, logoY - 8, 16, 16);
    } catch (e) {
      // fall back silently if the image fails to embed
    }
  }

  pdf.setFontSize(14);
  pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
  pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

  // Address block (right, right-aligned)
  pdf.setFontSize(9);
  const addrLines = [
    'State: Maharashtra || State Code: 27',
    'City: Pune',
    'Address: B1-1002, Sr. No. 41/1/1,',
    'Near Kakde Terrace, Warje,',
    'Pune \u2013 411058, Maharashtra, India.',
  ];
  let addrY = y + 8;
  addrLines.forEach((line) => {
    pdf.text(line, rightX, addrY, { align: 'right' });
    addrY += 5;
  });

  y = Math.max(logoY + 16, addrY + 4);

  // Gray "Invoice Details / Billed to" box
  const boxTop = y;
  const rentalItemsCountForHeight = (invoice.lineItems || []).filter(
    (li) =>
      (li.productType || '').toLowerCase() === 'rent' ||
      (li.productType || '').toLowerCase() === 'rental',
  ).length;
  const extraDepositLines =
    Number(invoice.deposit || 0) > 0 && rentalItemsCountForHeight > 0
      ? rentalItemsCountForHeight > 1
        ? rentalItemsCountForHeight + 1
        : 1
      : 0;
  // const extraDeliveryLines = Number(invoice.deliveryFee || 0) > 0 ? 1 : 0;
  // const boxHeight = 62 + (extraDepositLines + extraDeliveryLines) * 6;
  const otherTaxesTotalForHeight =
    Number(invoice.gst || 0) +
    Number(invoice.careTax || 0) +
    Number(invoice.deliveryPackaging || invoice.deliveryFee || 0) +
    Number(invoice.installationFee || 0) +
    Number(invoice.platformFee || 0) +
    Number(invoice.relocationWarranty || 0) +
    Number(invoice.repairWarranty || 0);
  const extraDynamicFeeLines = otherTaxesTotalForHeight > 0 ? 1 : 0;
  const boxHeight = 62 + (extraDepositLines + extraDynamicFeeLines) * 6;
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

  let leftY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Details', marginX + 6, leftY);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  const details = [
    // ['Order Number', invoice.invoiceId],
    ['Order Number', invoice.orderRef],
    ['Order Date', fmtDate(invoice.date)],
    // [
    //   'Total Rate',
    //   `Rs. ${Number(invoice.baseRentalCost || 0).toLocaleString('en-IN')}`,
    // ],
    // [
    //   'Total Discount',
    //   `Rs. ${Number(invoice.discountAmount || 0).toLocaleString('en-IN')}`,
    // ],
    // [
    //   'Total Late Fee',
    //   `Rs. ${Number(invoice.lateFee || 0).toLocaleString('en-IN')}`,
    // ],
  ];
  leftY += 7;
  details.forEach(([label, val]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(String(val), marginX + 45, leftY);
    leftY += 6;
  });

  const lineItemsForDetails = invoice.lineItems || [];
  const rentalItemsForDeposit = lineItemsForDetails.filter(
    (li) =>
      (li.productType || '').toLowerCase() === 'rent' ||
      (li.productType || '').toLowerCase() === 'rental',
  );
  if (Number(invoice.deposit || 0) > 0 && rentalItemsForDeposit.length > 0) {
    if (rentalItemsForDeposit.length > 1) {
      pdf.setFont(undefined, 'bold');
      pdf.text('Refundable Deposit', marginX + 6, leftY);
      pdf.setFont(undefined, 'normal');
      leftY += 6;
      const depositPerItem =
        Number(invoice.deposit || 0) / rentalItemsForDeposit.length;
      rentalItemsForDeposit.forEach((li) => {
        pdf.text(
          `(${li.productName}): Rs. ${depositPerItem.toLocaleString('en-IN')}`,
          marginX + 10,
          leftY,
        );
        leftY += 6;
      });
    } else {
      pdf.setFont(undefined, 'bold');
      pdf.text('Refundable Deposit', marginX + 6, leftY);
      pdf.setFont(undefined, 'normal');
      pdf.text(
        `Rs. ${Number(invoice.deposit || 0).toLocaleString('en-IN')}`,
        marginX + 45,
        leftY,
      );
      leftY += 6;
    }
  }

  // if (Number(invoice.deliveryFee || 0) > 0) {
  //   pdf.setFont(undefined, 'bold');
  //   pdf.text('Delivery & Packaging', marginX + 6, leftY);
  //   pdf.setFont(undefined, 'normal');
  //   pdf.text(
  //     `Rs. ${Number(invoice.deliveryFee || 0).toLocaleString('en-IN')}`,
  //     marginX + 45,
  //     leftY,
  //   );
  //   leftY += 6;
  // }
  const otherTaxesTotal =
    Number(invoice.gst || 0) +
    Number(invoice.careTax || 0) +
    Number(invoice.deliveryPackaging || invoice.deliveryFee || 0) +
    Number(invoice.installationFee || 0) +
    Number(invoice.platformFee || 0) +
    Number(invoice.relocationWarranty || 0) +
    Number(invoice.repairWarranty || 0);
  if (otherTaxesTotal > 0) {
    pdf.setFont(undefined, 'bold');
    pdf.text('Other Taxes', marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(
      `Rs. ${otherTaxesTotal.toLocaleString('en-IN')}`,
      marginX + 45,
      leftY,
    );
    leftY += 6;
  }
  leftY += 2;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Total', marginX + 6, leftY);
  pdf.text(
    `Rs. ${Number(invoice.amount || 0).toLocaleString('en-IN')}`,
    marginX + 45,
    leftY,
  );
  pdf.setFont(undefined, 'normal');

  // Billed to (right side of box)
  let rightY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  rightY += 7;
  pdf.text(invoice.name || '\u2014', rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  pdf.text(invoice.phone || '\u2014', rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  const addr = invoice.address || '\u2014';
  const addrWrapped = pdf.splitTextToSize(addr, 70);
  addrWrapped.forEach((line) => {
    pdf.text(line, rightX - 6, rightY, { align: 'right' });
    rightY += 5;
  });

  y = boxTop + boxHeight + 12;

  // Invoice Item(s) Details heading
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Item(s) Details', marginX, y);
  pdf.setFont(undefined, 'normal');
  y += 8;

  const cols = [
    { label: 'S.No', x: marginX + 2, w: 8 },
    { label: 'Particulars', x: marginX + 12, w: 80 },
    { label: 'Qty', x: marginX + 118, w: 14 },
    { label: 'Status', x: marginX + 140, w: 26 },
    { label: 'Amount', x: rightX - 2, w: 24, align: 'right' },
  ];

  pdf.setFontSize(8);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(110);
  cols.forEach((c) => {
    pdf.text(c.label, c.x, y, c.align ? { align: c.align } : undefined);
  });
  pdf.setTextColor(0, 0, 0);
  pdf.setFont(undefined, 'normal');
  y += 6;

  const lineItems = invoice.lineItems || [];
  const gstPerItem = lineItems.length
    ? Number(invoice.gst || 0) / lineItems.length
    : 0;

  lineItems.forEach((li, idx) => {
    const rowTop = y;
    const taxable = Number(li.pricePerDay || 0) * Number(li.quantity || 1);

    const typeLabel = ['rent', 'rental'].includes(
      (li.productType || '').toLowerCase(),
    )
      ? 'Rent'
      : 'Buy';
    const itemNameWrapped = pdf.splitTextToSize(
      `Item: ${li.productName} (${typeLabel})`,
      cols[1].w,
    );
    const particularLines = [
      ...itemNameWrapped,
      // `Qty: ${li.quantity}`,
      li.ref ? `Ref: ${li.ref}` : null,
      li.hsn ? `HSN/SAC: ${li.hsn}` : null,
    ].filter(Boolean);

    pdf.setFontSize(8);
    pdf.text(String(idx + 1), cols[0].x, rowTop + 4);
    pdf.text(particularLines, cols[1].x, rowTop + 4);
    pdf.text(String(li.quantity || 1), cols[2].x, rowTop + 4);
    pdf.setFontSize(7);
    pdf.text(li.status || 'Confirmed', cols[3].x, rowTop + 4, {
      maxWidth: 34,
    });
    pdf.setFontSize(8);
    pdf.text(`Rs.${taxable.toLocaleString('en-IN')}`, cols[4].x, rowTop + 4, {
      align: 'right',
    });

    const rowHeight = Math.max(particularLines.length * 4.2 + 4, 14);
    pdf.setDrawColor(225);
    pdf.roundedRect(
      marginX,
      rowTop - 4,
      rightX - marginX,
      rowHeight,
      2,
      2,
      'S',
    );
    y = rowTop + rowHeight + 4;
  });
  y += 6;
  const amountInWords = numberToWordsInvoice(Number(invoice.amount || 0));
  const wordsWrapped = pdf.splitTextToSize(
    `Total (In Words): ${amountInWords}`,
    rightX - marginX - 12,
  );
  const wordsStartY = 30;
  const totalBarHeight = wordsStartY + wordsWrapped.length * 6 + 2;
  pdf.setFillColor(249, 115, 22); // #F97316
  pdf.roundedRect(marginX, y, rightX - marginX, totalBarHeight, 3, 3, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(
    `Rs. ${Number(invoice.amount || 0).toLocaleString('en-IN')}`,
    rightX - 6,
    y + 14,
    { align: 'right' },
  );
  pdf.text('Total', rightX - 6, y + 22, { align: 'right' });

  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);
  pdf.text(wordsWrapped, rightX - 6, y + wordsStartY, {
    align: 'right',
  });

  pdf.setTextColor(0, 0, 0);

  y += totalBarHeight + 8;
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    'This is a system-generated document. No signature required.',
    marginX,
    y,
  );
  pdf.setTextColor(0, 0, 0);
}

async function downloadInvoicePDFUser(invoice) {
  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
  } catch (e) {
    // proceed without the logo if it fails to load
  }
  const pdf = new jsPDF();
  drawRentalInvoicePDF(pdf, invoice, logoDataUrl);
  pdf.save(`${invoice.invoiceId.replace('#', '')}.pdf`);
}

function buildInvoicePDFBlob(invoice, logoDataUrl) {
  const pdf = new jsPDF();
  drawRentalInvoicePDF(pdf, invoice, logoDataUrl);
  return pdf.output('blob');
}

async function downloadAllInvoicesZip(invoices) {
  if (!invoices || invoices.length === 0) return;

  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
  } catch (e) {
    // proceed without the logo if it fails to load
  }

  const zip = new JSZip();

  invoices.forEach((invoice) => {
    const blob = buildInvoicePDFBlob(invoice, logoDataUrl);
    zip.file(`${invoice.invoiceId.replace('#', '')}.pdf`, blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'invoices.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const agreements = [
  {
    id: 1,
    title: 'Rental Agreement - Fabric Sofa & Bed',
    signed: '10 Jan 2026',
    valid: '10 Jan 2027',
    items: ['Fabric Sofa (Blue)', '3-Seater', 'Queen Size Bed Frame'],
  },
  {
    id: 2,
    title: 'Rental Agreement - Samsung Washing Machine',
    signed: '15 Nov 2025',
    valid: '15 Nov 2026',
    items: ['Samsung Top Load 6.5kg'],
  },
];

// const InvoiceAgreement = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
//     if (!token) {
//       setLoading(false);
//       return;
//     }
//     apiGetMyInvoices(token)
//       .then((res) => {
//         setInvoices(
//           Array.isArray(res?.data?.invoices) ? res.data.invoices : [],
//         );
//       })
//       .catch(() => setInvoices([]))
//       .finally(() => setLoading(false));
//   }, []);
const ITEMS_PER_PAGE = 10;

const InvoiceAgreement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialYear, setFinancialYear] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [zipLoading, setZipLoading] = useState(false);

  const handleDownloadAllInvoices = async () => {
    setZipLoading(true);
    try {
      await downloadAllInvoicesZip(filteredInvoices);
    } finally {
      setZipLoading(false);
    }
  };

  useEffect(() => {
    apiGetMyInvoices()
      .then((res) => {
        setInvoices(
          Array.isArray(res?.data?.invoices) ? res.data.invoices : [],
        );
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const financialYears = React.useMemo(() => {
    const set = new Set(invoices.map((inv) => getFinancialYear(inv.date)));
    return Array.from(set).sort().reverse();
  }, [invoices]);

  const filteredInvoices = React.useMemo(() => {
    if (financialYear === 'All') return invoices;
    return invoices.filter(
      (inv) => getFinancialYear(inv.date) === financialYear,
    );
  }, [invoices, financialYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [financialYear]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE),
  );
  const paginatedInvoices = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}

        {/* <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Documents</h1>

            <p className="text-slate-500 mt-2">
              Access your rental agreements and monthly tax invoices.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 border rounded-xl px-5 py-3 bg-white hover:bg-gray-50 transition shadow-sm">
            <Mail size={18} />
            Email All to Me
          </button>
        </div> */}

        {/* Rental Agreements */}

        {/* <div className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="text-orange-500" size={20} />

            <h2 className="text-2xl font-semibold">Rental Agreements</h2>

            <span className="bg-gray-200 text-sm px-2 py-1 rounded-full">
              2
            </span>
          </div>

          <div className="space-y-5">
            {agreements.map((agreement) => (
              <div
                key={agreement.id}
                className="bg-white rounded-2xl border shadow-sm p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex gap-5">
                    <div className="w-20 h-20 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-red-600 shrink-0">
                      <FileText size={34} />
                      <span className="text-sm font-semibold mt-1">PDF</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold">
                        {agreement.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-5 text-gray-500 text-sm mt-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={15} />
                          Signed on:
                          <span className="font-medium text-slate-700">
                            {agreement.signed}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays size={15} />
                          Valid till:
                          <span className="font-medium text-slate-700">
                            {agreement.valid}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {agreement.items.map((item) => (
                          <span
                            key={item}
                            className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className="border-2 border-orange-500 text-orange-500 rounded-xl px-6 py-3 hover:bg-orange-50 transition flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Payment Invoices */}

        {/* <div className="mt-2 sm:mt-0"> */}
        <div className="mt-2 sm:mt-0 lg:-mt-1">
          {/* <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between"> */}
          <div className="flex flex-col gap-3 mb-4 sm:mb-3 lg:mb-2.5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold sm:text-lg">
                Payment Invoices
              </h2>

              <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full">
                {filteredInvoices.length}
              </span>
            </div>

            <div className="flex flex-row gap-2 sm:items-center">
              <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
                <span className="text-gray-600 text-xs sm:text-sm shrink-0 hidden xs:inline sm:inline">
                  Financial Year:
                </span>

                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="flex-1 sm:flex-none w-full sm:w-32 border bg-white rounded-lg px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm outline-none min-w-0"
                >
                  <option value="All">All Years</option>
                  {financialYears.map((fy) => (
                    <option key={fy} value={fy}>
                      FY {fy}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDownloadAllInvoices}
                disabled={zipLoading || filteredInvoices.length === 0}
                className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2 sm:py-1.5 text-xs sm:text-sm bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-40 flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
              >
                <Download size={15} />
                {zipLoading ? 'Preparing ZIP…' : 'Download All'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500 text-xs">
                    <th className="px-4 py-2">DATE</th>
                    <th className="px-4 py-2">INVOICE ID</th>
                    <th className="px-4 py-2">ITEM(S)</th>
                    <th className="px-4 py-2">AMOUNT</th>
                    <th className="px-4 py-2 text-center">ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-sm text-center text-gray-400"
                      >
                        Loading invoices…
                      </td>
                    </tr>
                  ) : paginatedInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-sm text-center text-gray-400"
                      >
                        No invoices yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {fmtDate(invoice.date)}
                        </td>

                        <td className="px-4 py-3">
                          <span className="bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold">
                            {invoice.invoiceId}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">
                          {invoice.item}
                        </td>

                        <td className="px-4 py-3 text-sm font-semibold">
                          ₹{invoice.amount.toLocaleString('en-IN')}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              downloadInvoicePDFUser(invoice);
                            }}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filteredInvoices.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-gray-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredInvoices.length,
                  )}{' '}
                  of {filteredInvoices.length} invoices
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  <span className="h-6 w-6 rounded-lg text-xs border border-orange-500 bg-orange-500 text-white font-semibold flex items-center justify-center">
                    {currentPage}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile table (small screens only) */}
          <div className="sm:hidden bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[560px] w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500 text-[10px] uppercase tracking-wide">
                    <th className="px-3 py-2 whitespace-nowrap">Date</th>
                    <th className="px-3 py-2 min-w-[130px]">Invoice</th>
                    <th className="px-3 py-2 min-w-[170px]">Item</th>
                    <th className="px-3 py-2 text-right whitespace-nowrap">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-center whitespace-nowrap"></th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-xs text-center text-gray-400"
                      >
                        Loading invoices…
                      </td>
                    </tr>
                  ) : paginatedInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-xs text-center text-gray-400"
                      >
                        No invoices yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((invoice) => (
                      <tr key={invoice._id} className="border-t">
                        <td className="px-3 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {fmtDate(invoice.date)}
                        </td>

                        <td className="px-3 py-3 max-w-[150px]">
                          <span
                            className="inline-block max-w-full truncate align-middle bg-gray-100 rounded-full px-2 py-1 text-[10px] font-semibold"
                            title={invoice.invoiceId}
                          >
                            {invoice.invoiceId}
                          </span>
                        </td>

                        <td
                          className="px-3 py-3 text-xs text-gray-600 max-w-[190px] truncate"
                          title={invoice.item}
                        >
                          {invoice.item}
                        </td>

                        <td className="px-3 py-3 text-xs font-semibold text-slate-900 text-right whitespace-nowrap">
                          ₹{invoice.amount.toLocaleString('en-IN')}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => downloadInvoicePDFUser(invoice)}
                            className="text-orange-500 active:text-orange-600"
                            aria-label="Download invoice"
                          >
                            <Download size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile pagination */}
            {!loading && filteredInvoices.length > 0 && (
              <div className="border-t px-3 py-2.5 flex items-center justify-between gap-2">
                <p className="text-[10px] text-gray-500 leading-tight">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredInvoices.length,
                  )}{' '}
                  of {filteredInvoices.length}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium disabled:opacity-40 active:bg-gray-50 transition"
                  >
                    Prev
                  </button>
                  <span className="h-6 w-6 shrink-0 rounded-lg text-[11px] border border-orange-500 bg-orange-500 text-white font-semibold flex items-center justify-center">
                    {currentPage}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium disabled:opacity-40 active:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Card */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 bg-[#edf5ff] border border-blue-200 rounded-xl p-3.5 sm:p-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FileText size={16} className="sm:hidden" />
              <FileText size={18} className="hidden sm:block" />
            </div>

            <div className="min-w-0">
              {/* <h3 className="font-semibold text-sm text-blue-900 leading-snug">
                Need documents for tax filing?
              </h3> */}

              <p className="text-blue-700 text-xs sm:text-sm mt-1 leading-relaxed">
                Use the &quot;Download All&quot; button to all your invoices in
                one convenient ZIP file.
              </p>

              <p className="text-xs text-blue-500 mt-1.5 sm:mt-1 leading-relaxed">
                💡 Tip: Download invoices regularly for your records and GST
                claims.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAgreement;
