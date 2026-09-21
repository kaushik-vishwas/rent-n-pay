// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   apiGetAllOrders,
//   apiGetAllServiceBookings,
//   apiUpdateServiceBookingStatus,
// } from '@/service/api';
// import { Search, Eye, Download } from 'lucide-react';
// import jsPDF from 'jspdf';

// const PAGE_SIZE = 10;
// const tabs = [
//   'Processing',
//   'Dispatched',
//   'Delivered',
//   'Pickup',
//   'Relocate',
//   'Services',
//   'Completed',
//   'Cancelled',
// ];

// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// const matchesDateFilter = (createdAt, filter) => {
//   if (!filter || filter === 'all') return true;
//   if (!createdAt) return false;
//   const created = new Date(createdAt);
//   if (Number.isNaN(created.getTime())) return false;
//   const now = new Date();
//   const startOfToday = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//   );
//   if (filter === 'today') return created >= startOfToday;
//   if (filter === 'last7') {
//     const cutoff = new Date(startOfToday);
//     cutoff.setDate(cutoff.getDate() - 6);
//     return created >= cutoff;
//   }
//   if (filter === 'last30') {
//     const cutoff = new Date(startOfToday);
//     cutoff.setDate(cutoff.getDate() - 29);
//     return created >= cutoff;
//   }
//   return true;
// };

// // Mirrors vendor-side computeVendorLinePayout, but since admin sees ALL
// // vendors' lines together, the fee/tax share is based on the line's
// // share of the ENTIRE order value (not just one vendor's lines).
// function computeAdminLineBreakdown(order, line) {
//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   const lineValue = rate * qty;

//   const allLines = (order?.products || []).filter(
//     (l) => l?.product && typeof l.product === 'object',
//   );
//   const orderTotalValue =
//     allLines.reduce(
//       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
//       0,
//     ) || 1;
//   const share = lineValue / orderTotalValue;

//   const orderPlatformFee = Number(order?.platformFee || 0);
//   const otherTaxes =
//     Number(order?.gst || 0) +
//     Number(order?.careProtection || 0) +
//     Number(order?.repairWarranty || 0) +
//     Number(order?.relocationWarranty || 0) +
//     Number(order?.deliveryPackaging || 0) +
//     Number(order?.installationFee || 0);

//   const lineFee = orderPlatformFee * share;
//   const lineTaxes = otherTaxes * share;
//   const lineDeposit = Number(line?.refundableDeposit || 0);

//   return {
//     productAmount: lineValue,
//     lineFee,
//     lineTaxes,
//     lineDeposit,
//     payout: Math.max(0, lineValue - lineFee) + lineDeposit + lineTaxes,
//   };
// }

// function computeAdminLinePayout(order, line) {
//   return computeAdminLineBreakdown(order, line).payout;
// }

// function looksLikeUrl(value) {
//   const s = String(value || '')
//     .trim()
//     .toLowerCase();
//   return s.startsWith('http://') || s.startsWith('https://');
// }
// const mapTabToStatuses = (tab) => {
//   // if (tab === 'Processing') return ['pending', 'confirmed'];
//   // if (tab === 'Processing') return ['pending'];
//   if (tab === 'Processing') return ['confirmed', 'pending'];
//   if (tab === 'Dispatched') return ['shipped', 'in_progress'];
//   if (tab === 'Delivered') return ['delivered'];
//   if (tab === 'Completed') return ['completed'];
//   if (tab === 'Cancelled') return ['cancelled'];
//   if (tab === 'Pickup') return [];
//   if (tab === 'Relocate') return [];
//   if (tab === 'Services') return [];
//   return [];
// };

// // Admin-wide flatten of every line that has a relocation request, across
// // ALL vendors (unlike the vendor-side version which filters by vendorId).
// // Read-only — no confirm action here, admin can only view.
// function flattenAllRelocationLines(orders, orderNumberMap) {
//   const rows = [];
//   for (const order of orders || []) {
//     const lines = (order.products || []).filter(
//       (l) => l?.product && typeof l.product === 'object',
//     );
//     for (const line of lines) {
//       if (!line?.relocationRequest?.requestedAt) continue;
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // rows.push({
//       //   ...order,
//       //   _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
//       //   // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
//       //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//       //   customerName: order.user?.fullName || order.name || '-',
//       //   customerEmail: order.user?.emailAddress || '',
//       //   productName: p?.productName || p?.title || 'Item',
//       //   productImage: rawImage,
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // const lineAmount =
//       //   Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
//       // rows.push({
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // const lineAmount = computeAdminLinePayout(order, line);
//       // rows.push({
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // const lineAmount = 0; // Relocation amount is always static 0
//       // rows.push({
//       //   ...order,
//       //   _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
//       //   // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
//       //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//       //   amount: lineAmount,
//       //   customerName: order.user?.fullName || order.name || '-',
//       //   customerEmail: order.user?.emailAddress || '',
//       //   productName: p?.productName || p?.title || 'Item',
//       //   productImage: rawImage,

//       const p = line.product;
//       const rawImage = String(p?.image || '').trim();
//       const lineAmount = 0; // Relocate tab table amount is always static 0
//       const relocLineBreakdown = computeAdminLineBreakdown(order, line);
//       rows.push({
//         ...order,
//         _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
//         // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
//         displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//         amount: lineAmount,
//         // Used only in the order details modal breakdown (view icon),
//         // table's "Relocate Amount" column stays 0.
//         productOnlyAmount: Math.max(0, relocLineBreakdown.productAmount),
//         taxesAmount: Math.max(0, relocLineBreakdown.lineTaxes),
//         refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//         customerName: order.user?.fullName || order.name || '-',
//         customerEmail: order.user?.emailAddress || '',
//         productName: p?.productName || p?.title || 'Item',
//         productImage: rawImage,
//         vendorName:
//           p?.vendorId?.shopName ||
//           p?.vendorId?.fullName ||
//           p?.vendorId?.emailAddress ||
//           '-',
//         relocationRequest: line.relocationRequest,
//         currentAddress: line.relocationRequest?.oldAddressSnapshot || {
//           name: order.name,
//           address: order.address,
//           phone: order.phone,
//         },
//         newAddress: line.relocationRequest?.newAddress || {},
//       });
//     }
//   }
//   return rows;
// }
// function statusLabel(raw) {
//   const s = String(raw || 'pending').toLowerCase();
//   const map = {
//     pending: 'Processing',
//     confirmed: 'Confirmed',
//     in_progress: 'In Progress',
//     shipped: 'Shipped',
//     delivered: 'Delivered',
//     completed: 'Completed',
//     cancelled: 'Cancelled',
//     pickup_scheduled: 'Pickup Scheduled',
//   };
//   return map[s] || s;
// }

// // function statusBadgeClass(raw) {
// //   const s = String(raw || '').toLowerCase();
// //   if (s === 'pending') return 'bg-amber-50 text-amber-900 border-amber-200';
// //   if (s === 'confirmed') return 'bg-sky-50 text-sky-900 border-sky-200';
// //   if (s === 'in_progress') return 'bg-blue-50 text-blue-800 border-blue-200';
// //   if (s === 'shipped') return 'bg-indigo-50 text-indigo-900 border-indigo-200';
// //   if (s === 'delivered')
// //     return 'bg-emerald-50 text-emerald-900 border-emerald-200';
// //   if (s === 'completed') return 'bg-teal-50 text-teal-900 border-teal-200';
// //   if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
// //   if (s === 'pickup_scheduled')
// //     return 'bg-blue-50 text-blue-800 border-blue-200';
// //   return 'bg-gray-50 text-gray-800 border-gray-200';
// // }

// function statusBadgeClass(raw) {
//   const s = String(raw || '').toLowerCase();
//   if (s === 'pending') return 'bg-amber-50 text-amber-900 border-amber-200';
//   if (s === 'confirmed') return 'bg-sky-50 text-sky-900 border-sky-200';
//   if (s === 'in_progress') return 'bg-blue-50 text-blue-800 border-blue-200';
//   if (s === 'shipped') return 'bg-indigo-50 text-indigo-900 border-indigo-200';
//   if (s === 'delivered')
//     return 'bg-emerald-50 text-emerald-900 border-emerald-200';
//   if (s === 'completed') return 'bg-teal-50 text-teal-900 border-teal-200';
//   if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
//   if (s === 'pickup_scheduled')
//     return 'bg-blue-50 text-blue-800 border-blue-200';
//   return 'bg-gray-50 text-gray-800 border-gray-200';
// }

// // Mirrors vendor-side Services tab status display:
// // pending -> Scheduled, confirmed/in_progress -> Confirmed,
// // completed -> Completed, cancelled -> Cancelled
// function serviceStatusLabel(raw) {
//   const s = String(raw || '').toLowerCase();
//   if (s === 'cancelled') return 'Cancelled';
//   if (s === 'completed') return 'Completed';
//   if (s === 'confirmed' || s === 'in_progress') return 'Confirmed';
//   return 'Scheduled';
// }

// function serviceStatusBadgeClass(raw) {
//   const s = String(raw || '').toLowerCase();
//   if (s === 'cancelled') return 'bg-red-50 text-red-600 border-red-200';
//   if (s === 'completed')
//     return 'bg-emerald-50 text-emerald-700 border-emerald-200';
//   if (s === 'confirmed' || s === 'in_progress')
//     return 'bg-blue-50 text-blue-700 border-blue-200';
//   return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
// }

// function generateOrderInvoicePDF(order) {
//   const pdf = new jsPDF();
//   const pageW = 210;
//   const marginX = 14;
//   const rightX = pageW - marginX;
//   let y = 20;

//   // Relocation rows show a static 0 in the table/amount field, but the
//   // invoice should show the full product amount (price + deposit + taxes).
//   const invoiceAmount = order?.relocationRequest?.requestedAt
//     ? Number(order.productOnlyAmount || 0) +
//       Number(order.refundableDeposit || 0) +
//       Number(order.taxesAmount || 0)
//     : Number(order.amount || 0);

//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(`Invoice - ${order.displayId || ''}`, marginX, y);
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

//   const boxTop = y;
//   const boxHeight = 62;
//   pdf.setFillColor(245, 247, 250);
//   pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

//   let leftY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Details', marginX + 6, leftY);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   const invDate = order.createdAt
//     ? new Date(order.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       })
//     : '-';

//   // const details = [
//   //   ['Order Number', order.displayId || '-'],
//   //   ['Order Date', invDate],
//   //   ['Product Type', order.productType || '-'],
//   //   ['Customer', order.customerName || '-'],
//   // ];
//   const isRelocationForDetails = Boolean(order?.relocationRequest?.requestedAt);
//   const relocationInvoiceDate = order?.relocationRequest?.requestedAt
//     ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : invDate;

//   const details = [
//     ['Order Number', order.displayId || '-'],
//     [
//       isRelocationForDetails ? 'Relocation Date' : 'Order Date',
//       isRelocationForDetails ? relocationInvoiceDate : invDate,
//     ],
//     ...(isRelocationForDetails ? [['Relocation Amount', 'Rs. 0']] : []),
//     ...(isRelocationForDetails
//       ? []
//       : [['Product Type', order.productType || '-']]),
//     ['Customer', order.customerName || '-'],
//   ];
//   leftY += 7;
//   details.forEach(([label, val]) => {
//     pdf.setFont(undefined, 'bold');
//     pdf.text(label, marginX + 6, leftY);
//     pdf.setFont(undefined, 'normal');
//     pdf.text(String(val), marginX + 45, leftY);
//     leftY += 6;
//   });

//   leftY += 2;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Amount', marginX + 6, leftY);
//   pdf.text(`Rs. ${invoiceAmount.toLocaleString('en-IN')}`, marginX + 45, leftY);
//   pdf.setFont(undefined, 'normal');

//   let rightY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   rightY += 7;
//   pdf.text(order.customerName || '-', rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   pdf.text(order.phone || order.customerEmail || '-', rightX - 6, rightY, {
//     align: 'right',
//   });
//   rightY += 5;
//   const addr = order.address || '-';
//   const addrWrapped = pdf.splitTextToSize(String(addr), 70);
//   addrWrapped.forEach((line) => {
//     pdf.text(line, rightX - 6, rightY, { align: 'right' });
//     rightY += 5;
//   });

//   y = boxTop + boxHeight + 12;

//   pdf.setFontSize(14);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Item(s) Details', marginX, y);
//   pdf.setFont(undefined, 'normal');
//   y += 8;

//   const cols = [
//     { label: 'S.No', x: marginX + 2, w: 8 },
//     { label: 'Particulars', x: marginX + 12, w: 68 },
//     { label: 'Qty', x: marginX + 84, w: 14 },
//     { label: 'Status', x: marginX + 102, w: 30 },
//     { label: 'Amount', x: rightX - 2, w: 20, align: 'right' },
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

//   const rowTop = y;
//   const itemLabel = `Item: ${order.productName || 'Product'}`;
//   const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

//   const statusLabelText = order.isServiceBooking
//     ? serviceStatusLabel(order.lineStatus)
//     : statusLabel(order.isPickupLine ? 'pickup_scheduled' : order.lineStatus);

//   pdf.setFontSize(8);
//   pdf.text('1', cols[0].x, rowTop + 4);
//   pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
//   pdf.text(String(order.productQty || 1), cols[2].x, rowTop + 4);
//   pdf.text(statusLabelText, cols[3].x, rowTop + 4);
//   pdf.text(
//     `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
//     cols[4].x,
//     rowTop + 4,
//     { align: 'right' },
//   );

//   // const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//   // pdf.setDrawColor(225);
//   // pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
//   // y = rowTop + rowHeight + 4;

//   // y += 4;
//   // pdf.setFontSize(9);
//   // pdf.setTextColor(120);
//   // pdf.text(
//   //   'This is a system-generated document. No signature required.',
//   //   marginX,
//   //   y,
//   // );
//   // pdf.setTextColor(0, 0, 0);

//   // pdf.save(`${String(order.displayId || 'invoice').replace('#', '')}.pdf`);

//   const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//   pdf.setDrawColor(225);
//   pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
//   y = rowTop + rowHeight + 4;

//   // Relocation-specific address details (Current/Old address + New address)
//   const isRelocationInvoiceOrder = Boolean(
//     order?.relocationRequest?.requestedAt,
//   );
//   if (isRelocationInvoiceOrder) {
//     const isConfirmed =
//       String(order?.relocationRequest?.status || '') === 'confirmed';

//     const oldAddr = order?.currentAddress || {};
//     const newAddr = order?.newAddress || {};

//     const oldAddrLine =
//       [
//         oldAddr.label || oldAddr.name || '',
//         oldAddr.address || '',
//         oldAddr.phone ? `Phone: ${oldAddr.phone}` : '',
//       ]
//         .filter(Boolean)
//         .join(', ') || '-';

//     const newAddrLine =
//       [
//         newAddr.label || '',
//         [newAddr.addressLine, newAddr.area, newAddr.pincode]
//           .filter(Boolean)
//           .join(', '),
//         newAddr.phone ? `Phone: ${newAddr.phone}` : '',
//       ]
//         .filter(Boolean)
//         .join(', ') || '-';

//     y += 4;
//     pdf.setFontSize(11);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('Relocation Address Details', marginX, y);
//     pdf.setFont(undefined, 'normal');
//     y += 7;

//     pdf.setFontSize(9);
//     pdf.setFont(undefined, 'bold');
//     pdf.text(isConfirmed ? 'Old Address' : 'Current Address', marginX, y);
//     pdf.setFont(undefined, 'normal');
//     const oldWrapped = pdf.splitTextToSize(oldAddrLine, rightX - marginX - 30);
//     pdf.text(oldWrapped, marginX + 32, y);
//     y += Math.max(oldWrapped.length * 5, 6);

//     y += 2;
//     pdf.setFont(undefined, 'bold');
//     pdf.text(isConfirmed ? 'Current Address' : 'New Address', marginX, y);
//     pdf.setFont(undefined, 'normal');
//     const newWrapped = pdf.splitTextToSize(newAddrLine, rightX - marginX - 30);
//     pdf.text(newWrapped, marginX + 32, y);
//     y += Math.max(newWrapped.length * 5, 6);
//   }

//   y += 4;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     marginX,
//     y,
//   );
//   pdf.setTextColor(0, 0, 0);

//   pdf.save(`${String(order.displayId || 'invoice').replace('#', '')}.pdf`);
// }

// function OrderDetailsModal({ open, order, onClose }) {
//   useEffect(() => {
//     if (!open) return;
//     const prevBody = document.body.style.overflow;
//     const prevHtml = document.documentElement.style.overflow;
//     document.body.style.overflow = 'hidden';
//     document.documentElement.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prevBody;
//       document.documentElement.style.overflow = prevHtml;
//     };
//   }, [open]);

//   if (!open || !order) return null;

//   const orderDate = order.createdAt
//     ? new Date(order.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       })
//     : '-';

//   const isRelocationOrder = Boolean(order?.relocationRequest?.requestedAt);
//   const isRelocationConfirmed =
//     String(order?.relocationRequest?.status || '') === 'confirmed';

//   const relocationDate = order?.relocationRequest?.requestedAt
//     ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : '-';

//   const statusText = order.isServiceBooking
//     ? serviceStatusLabel(order.lineStatus)
//     : isRelocationOrder
//       ? isRelocationConfirmed
//         ? 'Completed'
//         : 'Requested'
//       : order.isPickupLine
//         ? 'Pickup Scheduled'
//         : statusLabel(order.lineStatus);

//   const oldAddr = order?.currentAddress || {};
//   const newAddr = order?.newAddress || {};
//   const detailRows = [
//     ['Order ID', order.displayId || '-'],
//     ['Customer', order.customerName || '-'],
//     ['Email', order.customerEmail || '-'],
//     ['Product', order.productName || '-'],
//     ...(isRelocationOrder ? [] : [['Product Type', order.productType || '-']]),
//     // [
//     //   order.isServiceBooking ? 'Amount' : 'Product Amount',
//     //   money(
//     //     order.isServiceBooking
//     //       ? order.amount
//     //       : (order.productOnlyAmount ?? order.amount),
//     //   ),
//     // ],
//     // ...(!isRelocationOrder && order.refundableDeposit
//     //   ? [['Refundable Deposit', money(order.refundableDeposit)]]
//     //   : []),
//     // ...(!isRelocationOrder && !order.isServiceBooking && order.taxesAmount
//     //   ? [['Other Taxes', money(order.taxesAmount)]]
//     //   : []),
//     [
//       order.isServiceBooking ? 'Amount' : 'Product Amount',
//       money(
//         order.isServiceBooking
//           ? order.amount
//           : (order.productOnlyAmount ?? order.amount),
//       ),
//     ],
//     ...(order.refundableDeposit
//       ? [['Refundable Deposit', money(order.refundableDeposit)]]
//       : []),
//     ...(!order.isServiceBooking && order.taxesAmount
//       ? [['Other Taxes', money(order.taxesAmount)]]
//       : []),
//     ['Order Date', orderDate],
//     ...(isRelocationOrder ? [['Relocation Date', relocationDate]] : []),
//     ['Status', statusText],
//   ];

//   return (
//     <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
//             <div>
//               <h2 className="text-lg font-semibold leading-tight text-gray-900">
//                 Order #{order.displayId}
//               </h2>
//               <p className="mt-0.5 text-sm text-gray-500">
//                 {order.customerName} - {order.productName}
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
//               aria-label="Close order details"
//             >
//               ×
//             </button>
//           </div>

//           <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             <div className="grid grid-cols-1 gap-y-2.5 text-sm">
//               {detailRows.map(([label, val]) => (
//                 <div
//                   key={label}
//                   className="flex items-center justify-between gap-3"
//                 >
//                   <span className="text-gray-500">{label}</span>
//                   <span className="font-medium text-gray-900 text-right">
//                     {val}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
//             <p className="font-semibold text-gray-900 text-sm">
//               Customer Address
//             </p>
//             <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
//           </div>

//           {order.deliveryInstructions ? (
//             <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm">
//                 Customer Message
//               </p>
//               <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
//                 {order.deliveryInstructions}
//               </p>
//             </div>
//           ) : null}

//           {isRelocationOrder ? (
//             <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm">
//                 Relocation Address Details
//               </p>
//               <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="rounded-lg border border-gray-200 bg-white p-3">
//                   <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
//                     {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
//                   </p>
//                   <p className="mt-1 text-sm font-medium text-gray-800">
//                     {oldAddr.label || oldAddr.name || '-'}
//                   </p>
//                   <p className="mt-0.5 text-xs text-gray-500">
//                     {oldAddr.address || '-'}
//                   </p>
//                   {oldAddr.phone ? (
//                     <p className="mt-0.5 text-xs text-gray-500">
//                       Phone: {oldAddr.phone}
//                     </p>
//                   ) : null}
//                 </div>
//                 <div className="rounded-lg border border-gray-200 bg-white p-3">
//                   <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
//                     {isRelocationConfirmed ? 'Current Address' : 'New Address'}
//                   </p>
//                   <p className="mt-1 text-sm font-medium text-gray-800">
//                     {newAddr.label || '-'}
//                   </p>
//                   <p className="mt-0.5 text-xs text-gray-500">
//                     {[newAddr.addressLine, newAddr.area, newAddr.pincode]
//                       .filter(Boolean)
//                       .join(', ') || '-'}
//                   </p>
//                   {newAddr.phone ? (
//                     <p className="mt-0.5 text-xs text-gray-500">
//                       Phone: {newAddr.phone}
//                     </p>
//                   ) : null}
//                 </div>
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [serviceBookings, setServiceBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('Processing');
//   const [query, setQuery] = useState('');
//   const [page, setPage] = useState(1);
//   const [savingBookingId, setSavingBookingId] = useState('');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [viewModal, setViewModal] = useState({ open: false, order: null });

//   const fetchOrders = async () => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       setError('Please login again to continue.');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       const [ordersRes, bookingsRes] = await Promise.all([
//         apiGetAllOrders(token),
//         apiGetAllServiceBookings(token),
//       ]);
//       setOrders(ordersRes.data || []);
//       setServiceBookings(bookingsRes.data || []);
//     } catch (err) {
//       setOrders([]);
//       setServiceBookings([]);
//       setError(err.response?.data?.message || 'Failed to load orders.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // const normalizedOrders = useMemo(
//   //   () =>
//   //     (orders || []).map((o) => {
//   //       const amount = (o.products || []).reduce(
//   //         (s, i) =>
//   //           s +
//   //           Number(i.pricePerDay || 0) *
//   //             Number(i.quantity || 0) *
//   //             Number(o.rentalDuration || 0),
//   //         0,
//   //       );
//   //       const lineItems = (o.products || []).map((i) => {
//   //         const p = i.product;
//   //         const rawName =
//   //           p && typeof p === 'object' ? p.productName || p.title || '' : '';
//   //         const imageFromProduct =
//   //           p && typeof p === 'object' ? String(p.image || '').trim() : '';
//   //         const hasUrlName = looksLikeUrl(rawName);
//   //         const lineImage = imageFromProduct || (hasUrlName ? rawName : '');
//   //         const safeName = hasUrlName ? 'Product' : rawName || 'Item';
//   //         return {
//   //           name: safeName,
//   //           qty: Number(i.quantity || 1),
//   //           image: lineImage,
//   //         };
//   //       });
//   //       const lines = lineItems.map((x) => `${x.name} ×${x.qty}`);
//   //       const primary = o.products?.[0]?.product;
//   //       const productImage =
//   //         primary && typeof primary === 'object' ? primary.image || '' : '';
//   //       const productTypeSet = new Set(
//   //         (o.products || [])
//   //           .map((i) => {
//   //             const p = i?.product;
//   //             const populatedType =
//   //               p && typeof p === 'object' ? String(p.type || '').trim() : '';
//   //             if (populatedType) return populatedType;
//   //             const snapshotType = String(i?.productType || '').trim();
//   //             if (snapshotType) return snapshotType;
//   //             return 'Rental';
//   //           })
//   //           .filter(Boolean),
//   //       );
//   //       const pickupLines = (o.products || []).filter((i) =>
//   //         Boolean(
//   //           i?.returnRequest?.pickupScheduledAt &&
//   //           !i?.returnRequest?.refundInitiatedAt,
//   //         ),
//   //       );
//   //       const pickupLineItems = pickupLines.map((i) => {
//   //         const p = i.product;
//   //         const rawName =
//   //           p && typeof p === 'object' ? p.productName || p.title || '' : '';
//   //         const imageFromProduct =
//   //           p && typeof p === 'object' ? String(p.image || '').trim() : '';
//   //         const hasUrlName = looksLikeUrl(rawName);
//   //         const lineImage = imageFromProduct || (hasUrlName ? rawName : '');
//   //         const safeName = hasUrlName ? 'Product' : rawName || 'Item';
//   //         return {
//   //           name: safeName,
//   //           qty: Number(i.quantity || 1),
//   //           image: lineImage,
//   //         };
//   //       });
//   //       const pickupProductLines = pickupLineItems.map(
//   //         (x) => `${x.name} ×${x.qty}`,
//   //       );
//   //       const pickupProductImage = pickupLineItems?.[0]?.image || '';
//   //       return {
//   //         ...o,
//   //         amount,
//   //         displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//   //         customerName: o.user?.fullName || o.name || '-',
//   //         customerEmail: o.user?.emailAddress || '',
//   //         productLines: lines.length ? lines : ['—'],
//   //         productImage:
//   //           String(productImage || '').trim() || lineItems?.[0]?.image || '',
//   //         productLineItems: lineItems.length ? lineItems : [],
//   //         pickupProductLines: pickupProductLines.length
//   //           ? pickupProductLines
//   //           : ['—'],
//   //         pickupProductImage,
//   //         hasScheduledReturnPickup: pickupLines.length > 0,
//   //         productTypes: Array.from(productTypeSet),
//   //       };
//   //     }),
//   //   [orders],
//   // );

//   // const normalizedOrders = useMemo(() => {
//   //   const rows = [];
//   //   for (const o of orders || []) {
//   const normalizedOrders = useMemo(() => {
//     const rows = [];

//     // const orderNumberMap = new Map(
//     //   [...(orders || [])]
//     //     .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
//     //     .map((o, idx) => [String(o._id), idx + 1]),
//     // );
//     // const bookingNumberMap = new Map(
//     //   [...(serviceBookings || [])]
//     //     .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
//     //     .map((b, idx) => [String(b._id), idx + 1]),
//     // );

//     const sortedOrders = [...(orders || [])].sort(
//       (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//     );
//     const sortedBookings = [...(serviceBookings || [])].sort(
//       (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//     );

//     const orderNumberMap = new Map(
//       sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//     );
//     const bookingNumberMap = new Map(
//       sortedBookings.map((b, idx) => [String(b._id), idx + 1]),
//     );

//     for (const o of sortedOrders) {
//       const lines = (o.products || []).filter(
//         (i) => i?.product && typeof i.product === 'object',
//       );
//       if (!lines.length) {
//         // no populated lines — show order as single row
//         rows.push({
//           ...o,
//           _rowId: `${o._id}-null`,
//           // amount: 0,
//           // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//           // customerName: o.user?.fullName || o.name || '-',
//           // customerEmail: o.user?.emailAddress || '',
//           // productName: '—',
//           amount: 0,
//           displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
//           customerName: o.user?.fullName || o.name || '-',
//           customerEmail: o.user?.emailAddress || '',
//           productName: '—',
//           productImage: '',
//           productType: '—',
//           lineStatus: o.status,
//           hasScheduledReturnPickup: false,
//           isPickupLine: false,
//         });
//         continue;
//       }

//       // for (const line of lines) {
//       //   const p = line.product;
//       //   const isSell =
//       //     String(line?.productType || '').toLowerCase() === 'sell' ||
//       //     String(p?.type || '').toLowerCase() === 'sell';
//       //   const lineAmount =
//       //     Number(line.pricePerDay || 0) * Number(line.quantity || 1);
//       for (const line of lines) {
//         const p = line.product;
//         const isSell =
//           String(line?.productType || '').toLowerCase() === 'sell' ||
//           String(p?.type || '').toLowerCase() === 'sell';
//         // Now matches vendor payout math: value - platform fee + deposit + taxes
//         const lineBreakdown = computeAdminLineBreakdown(o, line);
//         const lineAmount = lineBreakdown.payout;

//         // const rawImage = String(p?.image || '').trim();
//         // const isPickupLine =
//         //   Boolean(line?.returnRequest?.pickupScheduledAt) &&
//         //   !line?.returnRequest?.refundInitiatedAt;

//         // const effectiveStatus = line?.lineStatus || o.status;
//         const rawImage = String(p?.image || '').trim();

//         const isPickupLine =
//           Boolean(line?.returnRequest?.pickupScheduledAt) &&
//           !line?.returnRequest?.refundInitiatedAt;

//         const pickupDate = line?.returnRequest?.pickupScheduledAt || null;

//         // Mirror vendor-side logic: once refund is initiated (QC + inspection
//         // done), the return cycle is fully closed — treat as 'completed'
//         const isReturnCompleted = Boolean(
//           line?.returnRequest?.refundInitiatedAt,
//         );

//         const effectiveStatus = isReturnCompleted
//           ? 'completed'
//           : line?.lineStatus || o.status;

//         // rows.push({
//         //   ...o,
//         //   _rowId: `${o._id}-${String(p?._id || Math.random())}`,
//         //   // amount: lineAmount,
//         //   // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//         //   // customerName: o.user?.fullName || o.name || '-',
//         //   // customerEmail: o.user?.emailAddress || '',
//         //   // productName: p?.productName || p?.title || 'Item',
//         //   amount: lineAmount,
//         //   displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
//         //   customerName: o.user?.fullName || o.name || '-',
//         //   customerEmail: o.user?.emailAddress || '',
//         //   productName: p?.productName || p?.title || 'Item',
//         //   productImage: rawImage,
//         //   productQty: Number(line.quantity || 1),
//         //   productType: isSell ? 'Buy' : 'Rent',
//         //   lineStatus: effectiveStatus,
//         //   hasScheduledReturnPickup: isPickupLine,
//         //   isPickupLine,
//         //   pickupDate,
//         // });

//         rows.push({
//           ...o,
//           _rowId: `${o._id}-${String(p?._id || Math.random())}`,
//           // amount: lineAmount,
//           // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//           // customerName: o.user?.fullName || o.name || '-',
//           // customerEmail: o.user?.emailAddress || '',
//           // productName: p?.productName || p?.title || 'Item',
//           amount: lineAmount,
//           displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
//           customerName: o.user?.fullName || o.name || '-',
//           customerEmail: o.user?.emailAddress || '',
//           productName: p?.productName || p?.title || 'Item',
//           productImage: rawImage,
//           productQty: Number(line.quantity || 1),
//           productType: isSell ? 'Buy' : 'Rent',
//           lineStatus: effectiveStatus,
//           hasScheduledReturnPickup: isPickupLine,
//           isPickupLine,
//           pickupDate,
//           pendingDue: Math.max(0, Number(line?.pendingDue || 0)),
//           // Used only in the order details modal breakdown
//           productOnlyAmount: Math.max(0, lineBreakdown.productAmount),
//           taxesAmount: Math.max(0, lineBreakdown.lineTaxes),
//           refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//         });
//       }
//     }
//     for (const booking of sortedBookings) {
//       rows.push({
//         ...booking,
//         _rowId: `service-${booking._id}`,
//         amount: Number(booking.totalAmount || 0),
//         // displayId: `SRV-${String(booking._id).slice(-3).toUpperCase()}`,
//         displayId: `SRV-${String(booking.bookingNumber || 0).padStart(4, '0')}`,
//         customerName: booking.user?.fullName || booking.name || '-',
//         customerEmail: booking.user?.emailAddress || '',
//         productName:
//           booking.serviceSnapshot?.productName ||
//           booking.serviceProduct?.productName ||
//           'Service booking',
//         productImage:
//           booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
//         productQty: 1,
//         productType: 'Service',
//         lineStatus: booking.status || 'pending',
//         hasScheduledReturnPickup: false,
//         isPickupLine: false,
//         isServiceBooking: true,
//       });
//     }
//     return rows;
//   }, [orders, serviceBookings]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     if (activeTab === 'Pickup' && !o.hasScheduledReturnPickup) return false;
//   //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) return false;
//   //     const tabMatch = allowed.length
//   //       ? allowed.includes(String(o.status))
//   //       : true;
//   //     if (!tabMatch) return false;
//   //     if (!q) return true;
//   //     const linesForSearch =
//   //       activeTab === 'Pickup' ? o.pickupProductLines : o.productLines;
//   //     const lineMatch = (linesForSearch || []).some((l) =>
//   //       String(l).toLowerCase().includes(q),
//   //     );
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.customerEmail || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       lineMatch
//   //     );
//   //   });
//   // }, [normalizedOrders, activeTab, query]);

//   // const tabCounts = useMemo(() => {
//   //   const list = normalizedOrders;
//   //   const nonPickup = list.filter((x) => !x.hasScheduledReturnPickup);
//   //   const shipped = list.filter((x) => String(x.status) === 'shipped').length;
//   //   return {
//   //     Processing: nonPickup.filter((x) =>
//   //       ['pending', 'confirmed'].includes(String(x.status)),
//   //     ).length,
//   //     Dispatched: nonPickup.filter((x) => String(x.status) === 'shipped')
//   //       .length,
//   //     'In Transit': nonPickup.filter((x) => String(x.status) === 'shipped')
//   //       .length,
//   //     Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
//   //       .length,
//   //     Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
//   //       .length,
//   //     Pickup: list.filter((x) => x.hasScheduledReturnPickup).length,
//   //   };
//   // }, [normalizedOrders]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     if (activeTab === 'Services') {
//   //       if (!o.isServiceBooking) return false;
//   //     } else {
//   //       if (o.isServiceBooking) return false;
//   //       if (activeTab === 'Pickup' && !o.isPickupLine) return false;
//   //       if (activeTab !== 'Pickup' && o.isPickupLine) return false;
//   //       const tabMatch = allowed.length
//   //         ? allowed.includes(String(o.lineStatus))
//   //         : true;
//   //       if (!tabMatch) return false;
//   //     }
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.customerEmail || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [normalizedOrders, activeTab, query]);
//   // const relocationOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const sortedOrders = [...(orders || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const orderNumberMap = new Map(
//   //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//   //   );
//   //   const rows = flattenAllRelocationLines(sortedOrders, orderNumberMap);
//   //   return rows.filter((o) => {
//   //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//   //     if (
//   //       statusFilter !== 'all' &&
//   //       String(o.relocationRequest?.status || 'requested') !== statusFilter
//   //     ) {
//   //       return false;
//   //     }
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.customerEmail || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q) ||
//   //       String(o.vendorName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [orders, query, dateFilter, statusFilter]);

//   const relocationOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const sortedOrders = [...(orders || [])].sort(
//       (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//     );
//     const orderNumberMap = new Map(
//       sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//     );
//     const rows = flattenAllRelocationLines(sortedOrders, orderNumberMap);
//     return rows.filter((o) => {
//       if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//       if (
//         statusFilter !== 'all' &&
//         String(o.relocationRequest?.status || 'requested') !== statusFilter
//       ) {
//         return false;
//       }
//       if (!q) return true;
//       return (
//         String(o.displayId).toLowerCase().includes(q) ||
//         String(o.customerName).toLowerCase().includes(q) ||
//         String(o.customerEmail || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(o.productName).toLowerCase().includes(q) ||
//         String(o.vendorName).toLowerCase().includes(q)
//       );
//     });
//   }, [orders, query, dateFilter, statusFilter]);

//   const relocationTotal = useMemo(
//     () => relocationOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [relocationOrders],
//   );

//   const filteredOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const allowed = mapTabToStatuses(activeTab);
//     return normalizedOrders
//       .filter((o) => {
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;

//         if (activeTab === 'Services') {
//           if (!o.isServiceBooking) return false;
//           if (
//             statusFilter !== 'all' &&
//             serviceStatusLabel(o.lineStatus).toLowerCase() !== statusFilter
//           ) {
//             return false;
//           }
//         } else {
//           if (o.isServiceBooking) return false;
//           if (activeTab === 'Pickup' && !o.isPickupLine) return false;
//           if (activeTab !== 'Pickup' && o.isPickupLine) return false;

//           if (statusFilter !== 'all') {
//             if (String(o.lineStatus) !== statusFilter) return false;
//           } else {
//             const tabMatch = allowed.length
//               ? allowed.includes(String(o.lineStatus))
//               : true;
//             if (!tabMatch) return false;
//           }
//         }
//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.customerEmail || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .reverse(); // show newest orders first (page 1), oldest last
//   }, [normalizedOrders, activeTab, query, dateFilter, statusFilter]);

//   const tabCounts = useMemo(() => {
//     const productRows = normalizedOrders.filter((x) => !x.isServiceBooking);
//     const nonPickup = productRows.filter((x) => !x.isPickupLine);
//     return {
//       Processing: nonPickup.filter((x) =>
//         ['confirmed', 'pending'].includes(String(x.lineStatus)),
//       ).length,
//       Dispatched: nonPickup.filter((x) => String(x.lineStatus) === 'shipped')
//         .length,
//       Delivered: nonPickup.filter((x) => String(x.lineStatus) === 'delivered')
//         .length,
//       Completed: nonPickup.filter((x) => String(x.lineStatus) === 'completed')
//         .length,
//       Pickup: productRows.filter((x) => x.isPickupLine).length,
//       Relocate: 0, // computed separately below via relocationOrders
//       Services: normalizedOrders.filter((x) => x.isServiceBooking).length,
//       Cancelled: nonPickup.filter((x) => String(x.lineStatus) === 'cancelled')
//         .length,
//     };
//   }, [normalizedOrders]);

//   const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
//   const safePage = Math.min(page, totalPages);
//   const pageSlice = filteredOrders.slice(
//     (safePage - 1) * PAGE_SIZE,
//     safePage * PAGE_SIZE,
//   );
//   useEffect(() => {
//     setPage(1);
//   }, [activeTab, query, dateFilter, statusFilter]);

//   useEffect(() => {
//     setStatusFilter('all');
//   }, [activeTab]);

//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   // const stats = useMemo(() => {
//   //   const processing = normalizedOrders.filter((o) =>
//   //     ['pending', 'confirmed'].includes(String(o.status)),
//   //   ).length;
//   //   const totalRevenue = normalizedOrders.reduce(
//   //     (s, o) => s + Number(o.amount || 0),
//   //     0,
//   //   );

//   console.log('Normalized orders:', normalizedOrders.length);

//   console.log(
//     'Pending lineStatus:',
//     normalizedOrders.filter((o) => String(o.lineStatus) === 'pending').length,
//   );

//   const stats = useMemo(() => {
//     const processing = normalizedOrders.filter((o) =>
//       ['confirmed', 'pending'].includes(String(o.lineStatus)),
//     ).length;
//     const totalRevenue = normalizedOrders.reduce(
//       (s, o) => s + Number(o.amount || 0),
//       0,
//     );
//     const averageOrder = normalizedOrders.length
//       ? Math.round(totalRevenue / normalizedOrders.length)
//       : 0;
//     // const urgentActions = normalizedOrders.filter((o) => {
//     //   const isOpen = !['completed', 'cancelled'].includes(String(o.status));
//     //   if (!isOpen) return false;
//     //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
//     //   return ageMs > 24 * 60 * 60 * 1000;
//     // }).length;

//     const urgentActions = normalizedOrders.filter((o) => {
//       return (
//         String(o.lineStatus) === 'pending' &&
//         Date.now() - new Date(o.createdAt || 0).getTime() > 24 * 60 * 60 * 1000
//       );
//     }).length;
//     return { processing, totalRevenue, averageOrder, urgentActions };
//   }, [normalizedOrders]);

//   const filteredTotal = useMemo(
//     () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [filteredOrders],
//   );

//   const pageTotal = useMemo(
//     () => pageSlice.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [pageSlice],
//   );

//   const pagePendingDueTotal = useMemo(
//     () => pageSlice.reduce((s, o) => s + Number(o.pendingDue || 0), 0),
//     [pageSlice],
//   );

//   const pageFrom =
//     filteredOrders.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
//   const pageTo = Math.min(safePage * PAGE_SIZE, filteredOrders.length);

//   const pageNumbers = useMemo(() => {
//     const n = totalPages;
//     if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
//     const cur = safePage;
//     const set = new Set([1, n, cur, cur - 1, cur + 1]);
//     return Array.from(set)
//       .filter((x) => x >= 1 && x <= n)
//       .sort((a, b) => a - b);
//   }, [totalPages, safePage]);

//   const updateServiceStatus = async (bookingId, status) => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token || !bookingId || !status) return;

//     setSavingBookingId(bookingId);
//     try {
//       const res = await apiUpdateServiceBookingStatus(bookingId, status, token);
//       setServiceBookings((prev) =>
//         (prev || []).map((booking) =>
//           booking._id === bookingId ? res.data : booking,
//         ),
//       );
//     } catch (err) {
//       setError(
//         err.response?.data?.message || 'Failed to update service booking.',
//       );
//     } finally {
//       setSavingBookingId('');
//     }
//   };

//   return (
//     <main className="space-y-4 sm:space-y-5">
//       {/* <div>
//         <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Read-only view of all customer orders.
//         </p>
//       </div> */}

//       {loading ? (
//         <div className="flex justify-center py-14">
//           <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
//           {error}
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
//             <div className="bg-white rounded-2xl border border-blue-100 p-4">
//               <p className="text-xs text-gray-500">Total Processing</p>
//               <p className="text-4xl font-semibold text-blue-600 mt-1">
//                 {stats.processing}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-emerald-100 p-4">
//               <p className="text-xs text-gray-500">Total Revenue</p>
//               <p className="text-4xl font-semibold text-emerald-600 mt-1">
//                 {money(stats.totalRevenue)}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-violet-100 p-4">
//               <p className="text-xs text-gray-500">Average Order</p>
//               <p className="text-4xl font-semibold text-violet-600 mt-1">
//                 {money(stats.averageOrder)}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-orange-100 p-4">
//               <p className="text-xs text-gray-500">Urgent Actions</p>
//               <p className="text-4xl font-semibold text-orange-600 mt-1">
//                 {stats.urgentActions}
//               </p>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 space-y-4">
//             <div className="flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab}
//                   type="button"
//                   onClick={() => setActiveTab(tab)}
//                   className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border shrink-0 whitespace-nowrap ${
//                     activeTab === tab
//                       ? 'bg-white border-gray-300 shadow-sm text-gray-900'
//                       : 'border-transparent text-gray-500 hover:bg-gray-50'
//                   }`}
//                 >
//                   <span>{tab}</span>
//                   <span
//                     className={`min-w-[1.5rem] h-6 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
//                       activeTab === tab
//                         ? 'bg-orange-100 text-orange-800'
//                         : 'bg-gray-100 text-gray-600'
//                     }`}
//                   >
//                     {tab === 'Relocate'
//                       ? relocationOrders.length
//                       : (tabCounts[tab] ?? 0)}
//                   </span>
//                 </button>
//               ))}
//             </div>

//             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
//               <div className="relative w-full sm:max-w-md">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search orders, customers, email, products..."
//                   className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex flex-1 flex-wrap sm:justify-end gap-3">
//                 <select
//                   value={dateFilter}
//                   onChange={(e) => setDateFilter(e.target.value)}
//                   className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                 >
//                   <option value="all">All Dates</option>
//                   <option value="today">Today</option>
//                   <option value="last7">Last 7 Days</option>
//                   <option value="last30">Last 30 Days</option>
//                 </select>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                 >
//                   {activeTab === 'Services' ? (
//                     <>
//                       <option value="all">All Statuses</option>
//                       <option value="scheduled">Scheduled</option>
//                       <option value="confirmed">Confirmed</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                     </>
//                   ) : activeTab === 'Pickup' ? (
//                     <option value="all">All Statuses</option>
//                   ) : activeTab === 'Relocate' ? (
//                     <>
//                       <option value="all">All Statuses</option>
//                       <option value="requested">Requested</option>
//                       <option value="confirmed">Confirmed</option>
//                     </>
//                   ) : (
//                     <>
//                       <option value="all">All Statuses</option>
//                       <option value="pending">Processing</option>
//                       <option value="confirmed">Confirmed</option>
//                       <option value="shipped">Dispatched</option>
//                       <option value="delivered">Delivered</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                     </>
//                   )}
//                 </select>
//               </div>
//             </div>
//             <div className="rounded-2xl border border-gray-200 overflow-hidden"></div>
//             {activeTab === 'Relocate' ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-[1100px] w-full text-sm">
//                   <thead className="bg-gray-50 border-b border-gray-100">
//                     <tr className="text-gray-500">
//                       <th className="px-4 py-3 text-center font-medium">
//                         Order ID
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Customer
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         Products
//                       </th>
//                       {/* <th className="px-4 py-3 text-left font-medium">
//                         Vendor
//                       </th> */}
//                       <th className="px-4 py-3 text-center font-medium">
//                         Relocate Date
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Relocate Amount
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Status
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {relocationOrders.map((order) => (
//                       <tr
//                         key={order._rowId}
//                         className="border-t border-gray-100"
//                       >
//                         <td className="px-4 py-3 text-center font-semibold text-gray-900">
//                           {order.displayId}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700">
//                           <div>{order.customerName}</div>
//                           {order.customerEmail ? (
//                             <div className="text-xs text-gray-500 mt-0.5">
//                               {order.customerEmail}
//                             </div>
//                           ) : null}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <div className="flex items-center justify-start gap-2">
//                             {order.productImage ? (
//                               <img
//                                 src={order.productImage}
//                                 alt=""
//                                 className="w-9 h-9 rounded-md object-cover shrink-0"
//                               />
//                             ) : (
//                               <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
//                             )}
//                             <span className="text-gray-800">
//                               {order.productName}
//                             </span>
//                           </div>
//                         </td>
//                         {/* <td className="px-4 py-3 text-gray-700">
//                           {order.vendorName}
//                         </td> */}
//                         {/* <td className="px-4 py-3 text-gray-600">
//                           {order.relocationRequest?.requestedAt
//                             ? new Date(
//                                 order.relocationRequest.requestedAt,
//                               ).toLocaleDateString('en-GB')
//                             : '-'}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${
//                               order.relocationRequest?.status === 'confirmed'
//                                 ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//                                 : 'border-blue-200 bg-blue-50 text-blue-700'
//                             }`}
//                           >
//                             {order.relocationRequest?.status || 'requested'}
//                           </span>
//                         </td> */}
//                         <td className="px-4 py-3 text-center text-gray-600">
//                           {order.relocationRequest?.requestedAt
//                             ? new Date(
//                                 order.relocationRequest.requestedAt,
//                               ).toLocaleDateString('en-GB')
//                             : '-'}
//                         </td>
//                         <td className="px-4 py-3 text-center font-semibold text-gray-900">
//                           {money(order.amount)}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${
//                               order.relocationRequest?.status === 'confirmed'
//                                 ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//                                 : 'border-blue-200 bg-blue-50 text-blue-700'
//                             }`}
//                           >
//                             {order.relocationRequest?.status || 'requested'}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <div className="flex items-center justify-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setViewModal({ open: true, order })
//                               }
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="View"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => generateOrderInvoicePDF(order)}
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="Download"
//                             >
//                               <Download className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                     {/* {relocationOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={6}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No relocation requests yet.
//                         </td>
//                       </tr>
//                     )} */}
//                     {/* {relocationOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={7}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No relocation requests yet.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             ) : ( */}
//                     {relocationOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={7}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No relocation requests yet.
//                         </td>
//                       </tr>
//                     )}
//                     {/* </tbody>
//                   {relocationOrders.length > 0 && (
//                     <tfoot>
//                       <tr className="bg-[#F97316] text-white">
//                         <td
//                           colSpan={4}
//                           className="px-4 py-3 text-center font-semibold"
//                         >
//                           Total
//                         </td>
//                         <td className="px-4 py-3 text-center font-semibold">
//                           {money(relocationTotal)}
//                         </td>
//                         <td className="px-4 py-3"></td>
//                         <td className="px-4 py-3"></td>
//                       </tr>
//                     </tfoot>
//                   )}
//                 </table>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-[980px] w-full text-sm"> */}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-[980px] w-full text-sm">
//                   <thead className="bg-gray-50 border-b border-gray-100">
//                     <tr className="text-gray-500">
//                       <th className="px-4 py-3 text-center font-medium">
//                         Order ID
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Customer
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         Products
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Type
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
//                         {activeTab === 'Pickup' ? 'Pickup Date' : 'Order date'}
//                       </th>
//                       {activeTab === 'Pickup' ? (
//                         <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
//                           Pending Due
//                         </th>
//                       ) : (
//                         <th className="px-4 py-3 text-center font-medium">
//                           Amount
//                         </th>
//                       )}
//                       <th className="px-4 py-3 text-center font-medium">
//                         Status
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {pageSlice.map((order) => (
//                       <tr
//                         key={order._rowId}
//                         className="border-t border-gray-100"
//                       >
//                         <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top">
//                           {order.displayId}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700 align-top">
//                           <div>{order.customerName}</div>
//                           {order.customerEmail ? (
//                             <div className="text-xs text-gray-500 mt-0.5">
//                               {order.customerEmail}
//                             </div>
//                           ) : null}
//                         </td>
//                         <td className="px-4 py-3 text-left align-top">
//                           <div className="flex items-center justify-start gap-2">
//                             {order.productImage ? (
//                               <img
//                                 src={order.productImage}
//                                 alt=""
//                                 className="w-9 h-9 rounded-md object-cover shrink-0"
//                               />
//                             ) : (
//                               <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
//                             )}
//                             <span className="text-xs text-gray-800">
//                               {order.productName}
//                               {order.productQty > 1
//                                 ? ` ×${order.productQty}`
//                                 : ''}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-center align-top">
//                           <span
//                             className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border ${
//                               order.productType === 'Service'
//                                 ? 'bg-sky-50 text-sky-800 border-sky-200'
//                                 : order.productType === 'Sell'
//                                   ? 'bg-blue-50 text-blue-800 border-blue-200'
//                                   : 'bg-orange-50 text-orange-800 border-orange-200'
//                             }`}
//                           >
//                             {order.productType}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-600 align-top whitespace-nowrap">
//                           {order.isPickupLine && order.pickupDate
//                             ? new Date(order.pickupDate).toLocaleDateString(
//                                 'en-GB',
//                               )
//                             : order.createdAt
//                               ? new Date(order.createdAt).toLocaleDateString(
//                                   'en-GB',
//                                 )
//                               : '-'}
//                         </td>
//                         {activeTab === 'Pickup' ? (
//                           <td className="px-4 py-3 text-center align-top whitespace-nowrap">
//                             {order.pendingDue > 0 ? (
//                               <span className="font-semibold text-red-600">
//                                 {money(order.pendingDue)}
//                               </span>
//                             ) : (
//                               <span className="text-gray-400">₹0</span>
//                             )}
//                           </td>
//                         ) : (
//                           <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top">
//                             {money(order.amount)}
//                           </td>
//                         )}
//                         <td className="px-4 py-3 text-center align-top whitespace-nowrap">
//                           {order.isPickupLine ? (
//                             <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border bg-blue-50 text-blue-800 border-blue-200 whitespace-nowrap">
//                               Pickup Scheduled
//                             </span>
//                           ) : order.isServiceBooking ? (
//                             <span
//                               className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${serviceStatusBadgeClass(order.lineStatus)}`}
//                             >
//                               {serviceStatusLabel(order.lineStatus)}
//                             </span>
//                           ) : (
//                             <span
//                               className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${statusBadgeClass(order.lineStatus)}`}
//                             >
//                               {statusLabel(order.lineStatus)}
//                             </span>
//                           )}
//                         </td>
//                         <td className="px-4 py-3 text-center align-top">
//                           <div className="flex items-center justify-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setViewModal({ open: true, order })
//                               }
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="View"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => generateOrderInvoicePDF(order)}
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="Download"
//                             >
//                               <Download className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}

//                     {filteredOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={activeTab === 'Pickup' ? 9 : 8}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No orders found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                   <tfoot>
//                     <tr className="bg-[#F97316] text-white">
//                       <td
//                         colSpan={5}
//                         className="px-4 py-3 text-center font-semibold"
//                       >
//                         {/* Total ({pageSlice.length} orders) */}
//                         Total
//                       </td>
//                       {activeTab === 'Pickup' ? (
//                         <td className="px-4 py-3 text-center font-semibold">
//                           {money(pagePendingDueTotal)}
//                         </td>
//                       ) : (
//                         <td className="px-4 py-3 text-center font-semibold">
//                           {money(pageTotal)}
//                         </td>
//                       )}
//                       <td className="px-4 py-3"></td>
//                       <td className="px-4 py-3"></td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             )}
//           </div>
//           {activeTab !== 'Relocate' && totalPages > 1 ? (
//             <nav
//               className="flex flex-wrap items-center justify-center gap-2"
//               aria-label="Pagination"
//             >
//               <button
//                 type="button"
//                 disabled={safePage <= 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 Previous
//               </button>
//               <span className="min-w-[2.25rem] h-9 px-3 inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[#F97316] text-white shadow">
//                 {safePage}
//               </span>
//               <button
//                 type="button"
//                 disabled={safePage >= totalPages}
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 Next
//               </button>
//             </nav>
//           ) : null}
//         </>
//       )}
//       <OrderDetailsModal
//         open={viewModal.open}
//         order={viewModal.order}
//         onClose={() => setViewModal({ open: false, order: null })}
//       />
//     </main>
//   );
// };

// export default Orders;

// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   apiGetAllOrders,
//   apiGetAllServiceBookings,
//   apiUpdateServiceBookingStatus,
// } from '@/service/api';
// import { Search, Eye, Download } from 'lucide-react';
// import jsPDF from 'jspdf';

// const PAGE_SIZE = 10;
// const tabs = [
//   'Processing',
//   'Dispatched',
//   'Delivered',
//   'Pickup',
//   'Relocate',
//   'Services',
//   'Completed',
//   'Cancelled',
// ];

// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// const matchesDateFilter = (createdAt, filter) => {
//   if (!filter || filter === 'all') return true;
//   if (!createdAt) return false;
//   const created = new Date(createdAt);
//   if (Number.isNaN(created.getTime())) return false;
//   const now = new Date();
//   const startOfToday = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//   );
//   if (filter === 'today') return created >= startOfToday;
//   if (filter === 'last7') {
//     const cutoff = new Date(startOfToday);
//     cutoff.setDate(cutoff.getDate() - 6);
//     return created >= cutoff;
//   }
//   if (filter === 'last30') {
//     const cutoff = new Date(startOfToday);
//     cutoff.setDate(cutoff.getDate() - 29);
//     return created >= cutoff;
//   }
//   return true;
// };

// // Mirrors vendor-side computeVendorLinePayout, but since admin sees ALL
// // vendors' lines together, the fee/tax share is based on the line's
// // share of the ENTIRE order value (not just one vendor's lines).
// // function computeAdminLineBreakdown(order, line) {
// //   const qty = Number(line?.quantity || 1);
// //   const rate = Number(line?.pricePerDay || 0);
// //   const lineValue = rate * qty;

// //   const allLines = (order?.products || []).filter(
// //     (l) => l?.product && typeof l.product === 'object',
// //   );
// //   const orderTotalValue =
// //     allLines.reduce(
// //       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
// //       0,
// //     ) || 1;
// //   const share = lineValue / orderTotalValue;

// //   const orderPlatformFee = Number(order?.platformFee || 0);
// //   const otherTaxes =
// //     Number(order?.gst || 0) +
// //     Number(order?.careProtection || 0) +
// //     Number(order?.repairWarranty || 0) +
// //     Number(order?.relocationWarranty || 0) +
// //     Number(order?.deliveryPackaging || 0) +
// //     Number(order?.installationFee || 0);

// //   const lineFee = orderPlatformFee * share;
// //   const lineTaxes = otherTaxes * share;
// //   const lineDeposit = Number(line?.refundableDeposit || 0);

// //   return {
// //     productAmount: lineValue,
// //     lineFee,
// //     lineTaxes,
// //     lineDeposit,
// //     payout: Math.max(0, lineValue - lineFee) + lineDeposit + lineTaxes,
// //   };
// // }

// function computeAdminLineBreakdown(order, line) {
//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   const lineValue = rate * qty;

//   // Show the FULL order amount on every product line — same as the
//   // customer-facing "My Orders" page (which never divides fees/taxes
//   // per product when multiple products share one order). No more
//   // proportional "share" split across lines.
//   const allLines = (order?.products || []).filter(
//     (l) => l?.product && typeof l.product === 'object',
//   );
//   const orderProductTotal = allLines.reduce(
//     (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
//     0,
//   );
//   const orderDepositTotal = allLines.reduce(
//     (s, l) => s + Math.max(0, Number(l?.refundableDeposit || 0)),
//     0,
//   );

//   //   const orderPlatformFee = Number(order?.platformFee || 0);
//   //   const otherTaxes =
//   //     Number(order?.gst || 0) +
//   //     Number(order?.careProtection || 0) +
//   //     Number(order?.repairWarranty || 0) +
//   //     Number(order?.relocationWarranty || 0) +
//   //     Number(order?.deliveryPackaging || 0) +
//   //     Number(order?.installationFee || 0);

//   //   const lineDeposit = Number(line?.refundableDeposit || 0);

//   //   const fullPayout =
//   //     Math.max(0, orderProductTotal - orderPlatformFee) +
//   //     orderDepositTotal +
//   //     otherTaxes;

//   //   return {
//   //     productAmount: lineValue,
//   //     lineFee: orderPlatformFee,
//   //     lineTaxes: otherTaxes,
//   //     lineDeposit,
//   //     payout: fullPayout,
//   //   };
//   // }

//   // function computeAdminLinePayout(order, line) {
//   const orderPlatformFee = Number(order?.platformFee || 0);
//   const otherTaxes =
//     Number(order?.gst || 0) +
//     Number(order?.careProtection || 0) +
//     Number(order?.repairWarranty || 0) +
//     Number(order?.relocationWarranty || 0) +
//     Number(order?.deliveryPackaging || 0) +
//     Number(order?.installationFee || 0);
//   const discountAmount = Number(order?.discountAmount || 0);

//   const lineDeposit = Number(line?.refundableDeposit || 0);

//   const fullPayout =
//     Math.max(0, orderProductTotal - orderPlatformFee - discountAmount) +
//     orderDepositTotal +
//     otherTaxes;

//   return {
//     productAmount: lineValue,
//     lineFee: orderPlatformFee,
//     lineTaxes: otherTaxes,
//     lineDeposit,
//     payout: fullPayout,
//   };
// }

// function computeAdminLinePayout(order, line) {
//   return computeAdminLineBreakdown(order, line).payout;
// }

// function looksLikeUrl(value) {
//   const s = String(value || '')
//     .trim()
//     .toLowerCase();
//   return s.startsWith('http://') || s.startsWith('https://');
// }
// const mapTabToStatuses = (tab) => {
//   // if (tab === 'Processing') return ['pending', 'confirmed'];
//   // if (tab === 'Processing') return ['pending'];
//   if (tab === 'Processing') return ['confirmed', 'pending'];
//   if (tab === 'Dispatched') return ['shipped', 'in_progress'];
//   if (tab === 'Delivered') return ['delivered'];
//   if (tab === 'Completed') return ['completed'];
//   if (tab === 'Cancelled') return ['cancelled'];
//   if (tab === 'Pickup') return [];
//   if (tab === 'Relocate') return [];
//   if (tab === 'Services') return [];
//   return [];
// };

// // Admin-wide flatten of every line that has a relocation request, across
// // ALL vendors (unlike the vendor-side version which filters by vendorId).
// // Read-only — no confirm action here, admin can only view.
// function flattenAllRelocationLines(orders, orderNumberMap) {
//   const rows = [];
//   for (const order of orders || []) {
//     const lines = (order.products || []).filter(
//       (l) => l?.product && typeof l.product === 'object',
//     );
//     for (const line of lines) {
//       if (!line?.relocationRequest?.requestedAt) continue;
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // rows.push({
//       //   ...order,
//       //   _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
//       //   // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
//       //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//       //   customerName: order.user?.fullName || order.name || '-',
//       //   customerEmail: order.user?.emailAddress || '',
//       //   productName: p?.productName || p?.title || 'Item',
//       //   productImage: rawImage,
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // const lineAmount =
//       //   Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
//       // rows.push({
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // const lineAmount = computeAdminLinePayout(order, line);
//       // rows.push({
//       // const p = line.product;
//       // const rawImage = String(p?.image || '').trim();
//       // const lineAmount = 0; // Relocation amount is always static 0
//       // rows.push({
//       //   ...order,
//       //   _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
//       //   // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
//       //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//       //   amount: lineAmount,
//       //   customerName: order.user?.fullName || order.name || '-',
//       //   customerEmail: order.user?.emailAddress || '',
//       //   productName: p?.productName || p?.title || 'Item',
//       //   productImage: rawImage,

//       const p = line.product;
//       const rawImage = String(p?.image || '').trim();
//       const lineAmount = 0; // Relocate tab table amount is always static 0
//       const relocLineBreakdown = computeAdminLineBreakdown(order, line);
//       rows.push({
//         ...order,
//         _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
//         // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
//         displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//         amount: lineAmount,
//         // Used only in the order details modal breakdown (view icon),
//         // table's "Relocate Amount" column stays 0.
//         productOnlyAmount: Math.max(0, relocLineBreakdown.productAmount),
//         taxesAmount: Math.max(0, relocLineBreakdown.lineTaxes),
//         refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//         customerName: order.user?.fullName || order.name || '-',
//         customerEmail: order.user?.emailAddress || '',
//         productName: p?.productName || p?.title || 'Item',
//         productImage: rawImage,
//         vendorName:
//           p?.vendorId?.shopName ||
//           p?.vendorId?.fullName ||
//           p?.vendorId?.emailAddress ||
//           '-',
//         relocationRequest: line.relocationRequest,
//         currentAddress: line.relocationRequest?.oldAddressSnapshot || {
//           name: order.name,
//           address: order.address,
//           phone: order.phone,
//         },
//         newAddress: line.relocationRequest?.newAddress || {},
//       });
//     }
//   }
//   return rows;
// }
// function statusLabel(raw) {
//   const s = String(raw || 'pending').toLowerCase();
//   const map = {
//     pending: 'Processing',
//     confirmed: 'Confirmed',
//     in_progress: 'In Progress',
//     shipped: 'Shipped',
//     delivered: 'Delivered',
//     completed: 'Completed',
//     cancelled: 'Cancelled',
//     pickup_scheduled: 'Pickup Scheduled',
//   };
//   return map[s] || s;
// }

// // function statusBadgeClass(raw) {
// //   const s = String(raw || '').toLowerCase();
// //   if (s === 'pending') return 'bg-amber-50 text-amber-900 border-amber-200';
// //   if (s === 'confirmed') return 'bg-sky-50 text-sky-900 border-sky-200';
// //   if (s === 'in_progress') return 'bg-blue-50 text-blue-800 border-blue-200';
// //   if (s === 'shipped') return 'bg-indigo-50 text-indigo-900 border-indigo-200';
// //   if (s === 'delivered')
// //     return 'bg-emerald-50 text-emerald-900 border-emerald-200';
// //   if (s === 'completed') return 'bg-teal-50 text-teal-900 border-teal-200';
// //   if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
// //   if (s === 'pickup_scheduled')
// //     return 'bg-blue-50 text-blue-800 border-blue-200';
// //   return 'bg-gray-50 text-gray-800 border-gray-200';
// // }

// function statusBadgeClass(raw) {
//   const s = String(raw || '').toLowerCase();
//   if (s === 'pending') return 'bg-amber-50 text-amber-900 border-amber-200';
//   if (s === 'confirmed') return 'bg-sky-50 text-sky-900 border-sky-200';
//   if (s === 'in_progress') return 'bg-blue-50 text-blue-800 border-blue-200';
//   if (s === 'shipped') return 'bg-indigo-50 text-indigo-900 border-indigo-200';
//   if (s === 'delivered')
//     return 'bg-emerald-50 text-emerald-900 border-emerald-200';
//   if (s === 'completed') return 'bg-teal-50 text-teal-900 border-teal-200';
//   if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
//   if (s === 'pickup_scheduled')
//     return 'bg-blue-50 text-blue-800 border-blue-200';
//   return 'bg-gray-50 text-gray-800 border-gray-200';
// }

// // Mirrors vendor-side Services tab status display:
// // pending -> Scheduled, confirmed/in_progress -> Confirmed,
// // completed -> Completed, cancelled -> Cancelled
// function serviceStatusLabel(raw) {
//   const s = String(raw || '').toLowerCase();
//   if (s === 'cancelled') return 'Cancelled';
//   if (s === 'completed') return 'Completed';
//   if (s === 'confirmed' || s === 'in_progress') return 'Confirmed';
//   return 'Scheduled';
// }

// function serviceStatusBadgeClass(raw) {
//   const s = String(raw || '').toLowerCase();
//   if (s === 'cancelled') return 'bg-red-50 text-red-600 border-red-200';
//   if (s === 'completed')
//     return 'bg-emerald-50 text-emerald-700 border-emerald-200';
//   if (s === 'confirmed' || s === 'in_progress')
//     return 'bg-blue-50 text-blue-700 border-blue-200';
//   return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
// }

// function generateOrderInvoicePDF(order) {
//   const pdf = new jsPDF();
//   const pageW = 210;
//   const marginX = 14;
//   const rightX = pageW - marginX;
//   let y = 20;

//   // Relocation rows show a static 0 in the table/amount field, but the
//   // invoice should show the full product amount (price + deposit + taxes).
//   const invoiceAmount = order?.relocationRequest?.requestedAt
//     ? Number(order.productOnlyAmount || 0) +
//       Number(order.refundableDeposit || 0) +
//       Number(order.taxesAmount || 0)
//     : Number(order.amount || 0);

//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(`Invoice - ${order.displayId || ''}`, marginX, y);
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

//   const boxTop = y;
//   const boxHeight = 62;
//   pdf.setFillColor(245, 247, 250);
//   pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

//   let leftY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Details', marginX + 6, leftY);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   const invDate = order.createdAt
//     ? new Date(order.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       })
//     : '-';

//   // const details = [
//   //   ['Order Number', order.displayId || '-'],
//   //   ['Order Date', invDate],
//   //   ['Product Type', order.productType || '-'],
//   //   ['Customer', order.customerName || '-'],
//   // ];
//   const isRelocationForDetails = Boolean(order?.relocationRequest?.requestedAt);
//   const relocationInvoiceDate = order?.relocationRequest?.requestedAt
//     ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : invDate;

//   const details = [
//     ['Order Number', order.displayId || '-'],
//     [
//       isRelocationForDetails ? 'Relocation Date' : 'Order Date',
//       isRelocationForDetails ? relocationInvoiceDate : invDate,
//     ],
//     ...(isRelocationForDetails ? [['Relocation Amount', 'Rs. 0']] : []),
//     ...(isRelocationForDetails
//       ? []
//       : [['Product Type', order.productType || '-']]),
//     ['Customer', order.customerName || '-'],
//     ...(!order.isServiceBooking &&
//     !isRelocationForDetails &&
//     String(order.productType || '') !== 'Buy' &&
//     Number(order.refundableDeposit || 0) > 0
//       ? [
//           [
//             'Refundable Deposit',
//             `Rs. ${Number(order.refundableDeposit).toLocaleString('en-IN')}`,
//           ],
//         ]
//       : []),
//     ...(Number(order.taxesAmount || 0) > 0
//       ? [
//           [
//             'Other Taxes',
//             `Rs. ${Number(order.taxesAmount).toLocaleString('en-IN')}`,
//           ],
//         ]
//       : []),
//   ];
//   leftY += 7;
//   details.forEach(([label, val]) => {
//     pdf.setFont(undefined, 'bold');
//     pdf.text(label, marginX + 6, leftY);
//     pdf.setFont(undefined, 'normal');
//     pdf.text(String(val), marginX + 45, leftY);
//     leftY += 6;
//   });

//   leftY += 2;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Amount', marginX + 6, leftY);
//   pdf.text(`Rs. ${invoiceAmount.toLocaleString('en-IN')}`, marginX + 45, leftY);
//   pdf.setFont(undefined, 'normal');

//   let rightY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   rightY += 7;
//   pdf.text(order.customerName || '-', rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   pdf.text(order.phone || order.customerEmail || '-', rightX - 6, rightY, {
//     align: 'right',
//   });
//   rightY += 5;
//   const addr = order.address || '-';
//   const addrWrapped = pdf.splitTextToSize(String(addr), 70);
//   addrWrapped.forEach((line) => {
//     pdf.text(line, rightX - 6, rightY, { align: 'right' });
//     rightY += 5;
//   });

//   y = boxTop + boxHeight + 12;

//   pdf.setFontSize(14);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Item(s) Details', marginX, y);
//   pdf.setFont(undefined, 'normal');
//   y += 8;

//   const cols = [
//     { label: 'S.No', x: marginX + 2, w: 8 },
//     { label: 'Particulars', x: marginX + 12, w: 68 },
//     { label: 'Qty', x: marginX + 84, w: 14 },
//     { label: 'Status', x: marginX + 102, w: 30 },
//     { label: 'Amount', x: rightX - 2, w: 20, align: 'right' },
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

//   // const rowTop = y;
//   // const itemLabel = `Item: ${order.productName || 'Product'}`;
//   // const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

//   // const statusLabelText = order.isServiceBooking
//   //   ? serviceStatusLabel(order.lineStatus)
//   //   : statusLabel(order.isPickupLine ? 'pickup_scheduled' : order.lineStatus);

//   // pdf.setFontSize(8);
//   // pdf.text('1', cols[0].x, rowTop + 4);
//   // pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
//   // pdf.text(String(order.productQty || 1), cols[2].x, rowTop + 4);
//   // pdf.text(statusLabelText, cols[3].x, rowTop + 4);
//   // pdf.text(
//   //   `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
//   //   cols[4].x,
//   //   rowTop + 4,
//   //   { align: 'right' },
//   // );

//   const statusLabelText = order.isServiceBooking
//     ? serviceStatusLabel(order.lineStatus)
//     : statusLabel(order.isPickupLine ? 'pickup_scheduled' : order.lineStatus);

//   // When this order has more than one product line, list every product
//   // with its own price, then show the order total — so the invoice
//   // matches the full order amount already shown in the table row.
//   // Single-product orders keep the original single-row layout.
//   const allInvoiceProductLines = (order?.products || []).filter(
//     (l) => l?.product && typeof l.product === 'object',
//   );
//   const isMultiProductInvoice =
//     !order.isServiceBooking &&
//     !order?.relocationRequest?.requestedAt &&
//     allInvoiceProductLines.length > 1;

//   pdf.setFontSize(8);

//   // Each product line can be in a different status (e.g. one shipped,
//   // one confirmed) — resolve status per line instead of reusing the
//   // single shared statusLabelText value.
//   const lineStatusLabelText = (line) =>
//     statusLabel(line?.lineStatus || order.status);

//   let rowTop = y;
//   if (isMultiProductInvoice) {
//     let rowStartY = y;
//     let sno = 1;
//     allInvoiceProductLines.forEach((line) => {
//       const lp = line?.product;
//       const qty = Number(line?.quantity || 1);
//       const rate = Number(line?.pricePerDay || 0);
//       const lineAmount = rate * qty;
//       const itemLabel = `Item: ${lp?.productName || lp?.title || 'Product'}`;
//       const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);
//       const rowHeightMulti = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//       const thisLineStatus = lineStatusLabelText(line);

//       pdf.text(String(sno), cols[0].x, rowStartY + 4);
//       pdf.text(itemNameWrapped, cols[1].x, rowStartY + 4);
//       pdf.text(String(qty), cols[2].x, rowStartY + 4);
//       pdf.text(thisLineStatus, cols[3].x, rowStartY + 4);
//       pdf.text(
//         `Rs.${lineAmount.toLocaleString('en-IN')}`,
//         cols[4].x,
//         rowStartY + 4,
//         { align: 'right' },
//       );
//       pdf.setDrawColor(225);
//       pdf.roundedRect(
//         marginX,
//         rowStartY - 4,
//         rightX - marginX,
//         rowHeightMulti,
//         2,
//         2,
//         'S',
//       );
//       rowStartY += rowHeightMulti + 4;
//       sno += 1;
//     });

//     pdf.setFont(undefined, 'bold');
//     pdf.text('Order Total', cols[1].x, rowStartY + 4);
//     pdf.text(
//       `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
//       cols[4].x,
//       rowStartY + 4,
//       { align: 'right' },
//     );
//     pdf.setFont(undefined, 'normal');
//     y = rowStartY + 10;
//   } else {
//     const itemLabel = `Item: ${order.productName || 'Product'}`;
//     const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

//     // Table row shows just this product's own price (matches the
//     // multi-product table, where each row shows its own line amount).
//     // The full order total (with deposit/taxes) still shows separately
//     // in the "Amount" field of the Invoice Details section above.
//     const rowItemAmount = order?.relocationRequest?.requestedAt
//       ? invoiceAmount
//       : Number(order.productOnlyAmount ?? invoiceAmount);

//     pdf.text('1', cols[0].x, rowTop + 4);
//     pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
//     pdf.text(String(order.productQty || 1), cols[2].x, rowTop + 4);
//     pdf.text(statusLabelText, cols[3].x, rowTop + 4);
//     pdf.text(
//       `Rs.${rowItemAmount.toLocaleString('en-IN')}`,
//       cols[4].x,
//       rowTop + 4,
//       { align: 'right' },
//     );

//     // const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//     // pdf.setDrawColor(225);
//     // pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
//     // y = rowTop + rowHeight + 4;

//     // y += 4;
//     // pdf.setFontSize(9);
//     // pdf.setTextColor(120);
//     // pdf.text(
//     //   'This is a system-generated document. No signature required.',
//     //   marginX,
//     //   y,
//     // );
//     // pdf.setTextColor(0, 0, 0);

//     // pdf.save(`${String(order.displayId || 'invoice').replace('#', '')}.pdf`);

//     const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
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
//   }

//   // Relocation-specific address details (Current/Old address + New address)
//   const isRelocationInvoiceOrder = Boolean(
//     order?.relocationRequest?.requestedAt,
//   );
//   if (isRelocationInvoiceOrder) {
//     const isConfirmed =
//       String(order?.relocationRequest?.status || '') === 'confirmed';

//     const oldAddr = order?.currentAddress || {};
//     const newAddr = order?.newAddress || {};

//     const oldAddrLine =
//       [
//         oldAddr.label || oldAddr.name || '',
//         oldAddr.address || '',
//         oldAddr.phone ? `Phone: ${oldAddr.phone}` : '',
//       ]
//         .filter(Boolean)
//         .join(', ') || '-';

//     const newAddrLine =
//       [
//         newAddr.label || '',
//         [newAddr.addressLine, newAddr.area, newAddr.pincode]
//           .filter(Boolean)
//           .join(', '),
//         newAddr.phone ? `Phone: ${newAddr.phone}` : '',
//       ]
//         .filter(Boolean)
//         .join(', ') || '-';

//     y += 4;
//     pdf.setFontSize(11);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('Relocation Address Details', marginX, y);
//     pdf.setFont(undefined, 'normal');
//     y += 7;

//     pdf.setFontSize(9);
//     pdf.setFont(undefined, 'bold');
//     pdf.text(isConfirmed ? 'Old Address' : 'Current Address', marginX, y);
//     pdf.setFont(undefined, 'normal');
//     const oldWrapped = pdf.splitTextToSize(oldAddrLine, rightX - marginX - 30);
//     pdf.text(oldWrapped, marginX + 32, y);
//     y += Math.max(oldWrapped.length * 5, 6);

//     y += 2;
//     pdf.setFont(undefined, 'bold');
//     pdf.text(isConfirmed ? 'Current Address' : 'New Address', marginX, y);
//     pdf.setFont(undefined, 'normal');
//     const newWrapped = pdf.splitTextToSize(newAddrLine, rightX - marginX - 30);
//     pdf.text(newWrapped, marginX + 32, y);
//     y += Math.max(newWrapped.length * 5, 6);
//   }

//   y += 4;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     marginX,
//     y,
//   );
//   pdf.setTextColor(0, 0, 0);

//   pdf.save(`${String(order.displayId || 'invoice').replace('#', '')}.pdf`);
// }

// function OrderDetailsModal({ open, order, onClose }) {
//   useEffect(() => {
//     if (!open) return;
//     const prevBody = document.body.style.overflow;
//     const prevHtml = document.documentElement.style.overflow;
//     document.body.style.overflow = 'hidden';
//     document.documentElement.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prevBody;
//       document.documentElement.style.overflow = prevHtml;
//     };
//   }, [open]);

//   if (!open || !order) return null;

//   // When this order has more than one product line, show all of them
//   // here so the modal total matches the full order amount already shown
//   // in the table row. Single-product orders are unaffected — they keep
//   // showing just their own detail rows below.
//   const allOrderProductLines = (order?.products || []).filter(
//     (l) => l?.product && typeof l.product === 'object',
//   );
//   const isMultiProductOrder =
//     !order.isServiceBooking && allOrderProductLines.length > 1;
//   const multiProductRows = isMultiProductOrder
//     ? allOrderProductLines.map((l) => {
//         const lp = l?.product;
//         const qty = Number(l?.quantity || 1);
//         const rate = Number(l?.pricePerDay || 0);
//         return {
//           key: String(lp?._id || l?._id || Math.random()),
//           name: lp?.productName || lp?.title || 'Product',
//           image: lp?.image || '',
//           qty,
//           price: rate * qty,
//           isSell:
//             String(l?.productType || '').toLowerCase() === 'sell' ||
//             String(lp?.type || '').toLowerCase() === 'sell',
//         };
//       })
//     : [];

//   const orderDate = order.createdAt
//     ? new Date(order.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       })
//     : '-';

//   const isRelocationOrder = Boolean(order?.relocationRequest?.requestedAt);
//   const isRelocationConfirmed =
//     String(order?.relocationRequest?.status || '') === 'confirmed';

//   const relocationDate = order?.relocationRequest?.requestedAt
//     ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : '-';

//   const statusText = order.isServiceBooking
//     ? serviceStatusLabel(order.lineStatus)
//     : isRelocationOrder
//       ? isRelocationConfirmed
//         ? 'Completed'
//         : 'Requested'
//       : order.isPickupLine
//         ? 'Pickup Scheduled'
//         : statusLabel(order.lineStatus);

//   const oldAddr = order?.currentAddress || {};
//   const newAddr = order?.newAddress || {};
//   const detailRows = [
//     ['Order ID', order.displayId || '-'],
//     ['Customer', order.customerName || '-'],
//     ['Email', order.customerEmail || '-'],
//     ['Delivery Number', order.phone || '-'],
//     ['Registered Number', order.user?.mobileNumber || '-'],
//     ['Product', order.productName || '-'],
//     ...(isRelocationOrder ? [] : [['Product Type', order.productType || '-']]),
//     // [
//     //   order.isServiceBooking ? 'Amount' : 'Product Amount',
//     //   money(
//     //     order.isServiceBooking
//     //       ? order.amount
//     //       : (order.productOnlyAmount ?? order.amount),
//     //   ),
//     // ],
//     // ...(!isRelocationOrder && order.refundableDeposit
//     //   ? [['Refundable Deposit', money(order.refundableDeposit)]]
//     //   : []),
//     // ...(!isRelocationOrder && !order.isServiceBooking && order.taxesAmount
//     //   ? [['Other Taxes', money(order.taxesAmount)]]
//     //   : []),
//     [
//       order.isServiceBooking ? 'Amount' : 'Product Amount',
//       money(
//         order.isServiceBooking
//           ? order.amount
//           : (order.productOnlyAmount ?? order.amount),
//       ),
//     ],
//     ...(order.refundableDeposit
//       ? [['Refundable Deposit', money(order.refundableDeposit)]]
//       : []),
//     ...(!order.isServiceBooking && order.taxesAmount
//       ? [['Other Taxes', money(order.taxesAmount)]]
//       : []),
//     ['Order Date', orderDate],
//     ...(isRelocationOrder ? [['Relocation Date', relocationDate]] : []),
//     ['Status', statusText],
//   ];

//   return (
//     <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
//             <div>
//               <h2 className="text-lg font-semibold leading-tight text-gray-900">
//                 Order #{order.displayId}
//               </h2>
//               <p className="mt-0.5 text-sm text-gray-500">
//                 {order.customerName} - {order.productName}
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
//               aria-label="Close order details"
//             >
//               ×
//             </button>
//           </div>

//           <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             {isMultiProductOrder ? (
//               <>
//                 <div className="space-y-2">
//                   {multiProductRows.map((row) => (
//                     <div
//                       key={row.key}
//                       className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
//                     >
//                       <div className="flex items-center gap-2 min-w-0">
//                         {row.image ? (
//                           <img
//                             src={row.image}
//                             alt=""
//                             className="h-9 w-9 rounded-md object-cover shrink-0"
//                           />
//                         ) : (
//                           <div className="h-9 w-9 rounded-md bg-gray-100 shrink-0" />
//                         )}
//                         <div className="min-w-0">
//                           <p className="text-sm font-medium text-gray-900 truncate">
//                             {row.name}
//                             {row.qty > 1 ? ` ×${row.qty}` : ''}
//                           </p>
//                           <span
//                             className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${
//                               row.isSell ? 'bg-blue-600' : 'bg-orange-500'
//                             }`}
//                           >
//                             {row.isSell ? 'Buy' : 'Rent'}
//                           </span>
//                         </div>
//                       </div>
//                       <span className="font-semibold text-gray-900 text-sm shrink-0">
//                         {money(row.price)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-3 grid grid-cols-1 gap-y-2.5 text-sm border-t border-gray-200 pt-3">
//                   {detailRows
//                     .filter(
//                       ([label]) =>
//                         label !== 'Product' &&
//                         label !== 'Product Type' &&
//                         label !== 'Product Amount' &&
//                         label !== 'Amount',
//                     )
//                     .map(([label, val]) => (
//                       <div
//                         key={label}
//                         className="flex items-center justify-between gap-3"
//                       >
//                         <span className="text-gray-500">{label}</span>
//                         <span className="font-medium text-gray-900 text-right">
//                           {val}
//                         </span>
//                       </div>
//                     ))}
//                   <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-2 mt-1">
//                     <span className="text-gray-700 font-semibold">
//                       Order Total
//                     </span>
//                     <span className="font-bold text-gray-900 text-right">
//                       {money(order.amount)}
//                     </span>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="grid grid-cols-1 gap-y-2.5 text-sm">
//                 {detailRows.map(([label, val]) => (
//                   <div
//                     key={label}
//                     className="flex items-center justify-between gap-3"
//                   >
//                     <span className="text-gray-500">{label}</span>
//                     <span className="font-medium text-gray-900 text-right">
//                       {val}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
//             <p className="font-semibold text-gray-900 text-sm">
//               Customer Address
//             </p>
//             <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
//           </div>

//           {order.deliveryInstructions ? (
//             <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm">
//                 Customer Message
//               </p>
//               <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
//                 {order.deliveryInstructions}
//               </p>
//             </div>
//           ) : null}

//           {isRelocationOrder ? (
//             <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm">
//                 Relocation Address Details
//               </p>
//               <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="rounded-lg border border-gray-200 bg-white p-3">
//                   <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
//                     {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
//                   </p>
//                   <p className="mt-1 text-sm font-medium text-gray-800">
//                     {oldAddr.label || oldAddr.name || '-'}
//                   </p>
//                   <p className="mt-0.5 text-xs text-gray-500">
//                     {oldAddr.address || '-'}
//                   </p>
//                   {oldAddr.phone ? (
//                     <p className="mt-0.5 text-xs text-gray-500">
//                       Phone: {oldAddr.phone}
//                     </p>
//                   ) : null}
//                 </div>
//                 <div className="rounded-lg border border-gray-200 bg-white p-3">
//                   <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
//                     {isRelocationConfirmed ? 'Current Address' : 'New Address'}
//                   </p>
//                   <p className="mt-1 text-sm font-medium text-gray-800">
//                     {newAddr.label || '-'}
//                   </p>
//                   <p className="mt-0.5 text-xs text-gray-500">
//                     {[newAddr.addressLine, newAddr.area, newAddr.pincode]
//                       .filter(Boolean)
//                       .join(', ') || '-'}
//                   </p>
//                   {newAddr.phone ? (
//                     <p className="mt-0.5 text-xs text-gray-500">
//                       Phone: {newAddr.phone}
//                     </p>
//                   ) : null}
//                 </div>
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [serviceBookings, setServiceBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('Processing');
//   const [query, setQuery] = useState('');
//   const [page, setPage] = useState(1);
//   const [savingBookingId, setSavingBookingId] = useState('');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [viewModal, setViewModal] = useState({ open: false, order: null });

//   const fetchOrders = async () => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       setError('Please login again to continue.');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       const [ordersRes, bookingsRes] = await Promise.all([
//         apiGetAllOrders(token),
//         apiGetAllServiceBookings(token),
//       ]);
//       setOrders(ordersRes.data || []);
//       setServiceBookings(bookingsRes.data || []);
//     } catch (err) {
//       setOrders([]);
//       setServiceBookings([]);
//       setError(err.response?.data?.message || 'Failed to load orders.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // const normalizedOrders = useMemo(
//   //   () =>
//   //     (orders || []).map((o) => {
//   //       const amount = (o.products || []).reduce(
//   //         (s, i) =>
//   //           s +
//   //           Number(i.pricePerDay || 0) *
//   //             Number(i.quantity || 0) *
//   //             Number(o.rentalDuration || 0),
//   //         0,
//   //       );
//   //       const lineItems = (o.products || []).map((i) => {
//   //         const p = i.product;
//   //         const rawName =
//   //           p && typeof p === 'object' ? p.productName || p.title || '' : '';
//   //         const imageFromProduct =
//   //           p && typeof p === 'object' ? String(p.image || '').trim() : '';
//   //         const hasUrlName = looksLikeUrl(rawName);
//   //         const lineImage = imageFromProduct || (hasUrlName ? rawName : '');
//   //         const safeName = hasUrlName ? 'Product' : rawName || 'Item';
//   //         return {
//   //           name: safeName,
//   //           qty: Number(i.quantity || 1),
//   //           image: lineImage,
//   //         };
//   //       });
//   //       const lines = lineItems.map((x) => `${x.name} ×${x.qty}`);
//   //       const primary = o.products?.[0]?.product;
//   //       const productImage =
//   //         primary && typeof primary === 'object' ? primary.image || '' : '';
//   //       const productTypeSet = new Set(
//   //         (o.products || [])
//   //           .map((i) => {
//   //             const p = i?.product;
//   //             const populatedType =
//   //               p && typeof p === 'object' ? String(p.type || '').trim() : '';
//   //             if (populatedType) return populatedType;
//   //             const snapshotType = String(i?.productType || '').trim();
//   //             if (snapshotType) return snapshotType;
//   //             return 'Rental';
//   //           })
//   //           .filter(Boolean),
//   //       );
//   //       const pickupLines = (o.products || []).filter((i) =>
//   //         Boolean(
//   //           i?.returnRequest?.pickupScheduledAt &&
//   //           !i?.returnRequest?.refundInitiatedAt,
//   //         ),
//   //       );
//   //       const pickupLineItems = pickupLines.map((i) => {
//   //         const p = i.product;
//   //         const rawName =
//   //           p && typeof p === 'object' ? p.productName || p.title || '' : '';
//   //         const imageFromProduct =
//   //           p && typeof p === 'object' ? String(p.image || '').trim() : '';
//   //         const hasUrlName = looksLikeUrl(rawName);
//   //         const lineImage = imageFromProduct || (hasUrlName ? rawName : '');
//   //         const safeName = hasUrlName ? 'Product' : rawName || 'Item';
//   //         return {
//   //           name: safeName,
//   //           qty: Number(i.quantity || 1),
//   //           image: lineImage,
//   //         };
//   //       });
//   //       const pickupProductLines = pickupLineItems.map(
//   //         (x) => `${x.name} ×${x.qty}`,
//   //       );
//   //       const pickupProductImage = pickupLineItems?.[0]?.image || '';
//   //       return {
//   //         ...o,
//   //         amount,
//   //         displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//   //         customerName: o.user?.fullName || o.name || '-',
//   //         customerEmail: o.user?.emailAddress || '',
//   //         productLines: lines.length ? lines : ['—'],
//   //         productImage:
//   //           String(productImage || '').trim() || lineItems?.[0]?.image || '',
//   //         productLineItems: lineItems.length ? lineItems : [],
//   //         pickupProductLines: pickupProductLines.length
//   //           ? pickupProductLines
//   //           : ['—'],
//   //         pickupProductImage,
//   //         hasScheduledReturnPickup: pickupLines.length > 0,
//   //         productTypes: Array.from(productTypeSet),
//   //       };
//   //     }),
//   //   [orders],
//   // );

//   // const normalizedOrders = useMemo(() => {
//   //   const rows = [];
//   //   for (const o of orders || []) {
//   const normalizedOrders = useMemo(() => {
//     const rows = [];

//     // const orderNumberMap = new Map(
//     //   [...(orders || [])]
//     //     .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
//     //     .map((o, idx) => [String(o._id), idx + 1]),
//     // );
//     // const bookingNumberMap = new Map(
//     //   [...(serviceBookings || [])]
//     //     .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
//     //     .map((b, idx) => [String(b._id), idx + 1]),
//     // );

//     const sortedOrders = [...(orders || [])].sort(
//       (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//     );
//     const sortedBookings = [...(serviceBookings || [])].sort(
//       (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//     );

//     const orderNumberMap = new Map(
//       sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//     );
//     const bookingNumberMap = new Map(
//       sortedBookings.map((b, idx) => [String(b._id), idx + 1]),
//     );

//     for (const o of sortedOrders) {
//       const lines = (o.products || []).filter(
//         (i) => i?.product && typeof i.product === 'object',
//       );
//       if (!lines.length) {
//         // no populated lines — show order as single row
//         rows.push({
//           ...o,
//           _rowId: `${o._id}-null`,
//           // amount: 0,
//           // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//           // customerName: o.user?.fullName || o.name || '-',
//           // customerEmail: o.user?.emailAddress || '',
//           // productName: '—',
//           amount: 0,
//           displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
//           customerName: o.user?.fullName || o.name || '-',
//           customerEmail: o.user?.emailAddress || '',
//           productName: '—',
//           productImage: '',
//           productType: '—',
//           lineStatus: o.status,
//           hasScheduledReturnPickup: false,
//           isPickupLine: false,
//         });
//         continue;
//       }

//       // for (const line of lines) {
//       //   const p = line.product;
//       //   const isSell =
//       //     String(line?.productType || '').toLowerCase() === 'sell' ||
//       //     String(p?.type || '').toLowerCase() === 'sell';
//       //   const lineAmount =
//       //     Number(line.pricePerDay || 0) * Number(line.quantity || 1);
//       for (const line of lines) {
//         const p = line.product;
//         const isSell =
//           String(line?.productType || '').toLowerCase() === 'sell' ||
//           String(p?.type || '').toLowerCase() === 'sell';
//         // Now matches vendor payout math: value - platform fee + deposit + taxes
//         const lineBreakdown = computeAdminLineBreakdown(o, line);
//         const lineAmount = lineBreakdown.payout;

//         // const rawImage = String(p?.image || '').trim();
//         // const isPickupLine =
//         //   Boolean(line?.returnRequest?.pickupScheduledAt) &&
//         //   !line?.returnRequest?.refundInitiatedAt;

//         // const effectiveStatus = line?.lineStatus || o.status;
//         const rawImage = String(p?.image || '').trim();

//         const isPickupLine =
//           Boolean(line?.returnRequest?.pickupScheduledAt) &&
//           !line?.returnRequest?.refundInitiatedAt;

//         const pickupDate = line?.returnRequest?.pickupScheduledAt || null;

//         // Mirror vendor-side logic: once refund is initiated (QC + inspection
//         // done), the return cycle is fully closed — treat as 'completed'
//         const isReturnCompleted = Boolean(
//           line?.returnRequest?.refundInitiatedAt,
//         );

//         const effectiveStatus = isReturnCompleted
//           ? 'completed'
//           : line?.lineStatus || o.status;

//         // rows.push({
//         //   ...o,
//         //   _rowId: `${o._id}-${String(p?._id || Math.random())}`,
//         //   // amount: lineAmount,
//         //   // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//         //   // customerName: o.user?.fullName || o.name || '-',
//         //   // customerEmail: o.user?.emailAddress || '',
//         //   // productName: p?.productName || p?.title || 'Item',
//         //   amount: lineAmount,
//         //   displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
//         //   customerName: o.user?.fullName || o.name || '-',
//         //   customerEmail: o.user?.emailAddress || '',
//         //   productName: p?.productName || p?.title || 'Item',
//         //   productImage: rawImage,
//         //   productQty: Number(line.quantity || 1),
//         //   productType: isSell ? 'Buy' : 'Rent',
//         //   lineStatus: effectiveStatus,
//         //   hasScheduledReturnPickup: isPickupLine,
//         //   isPickupLine,
//         //   pickupDate,
//         // });

//         rows.push({
//           ...o,
//           _rowId: `${o._id}-${String(p?._id || Math.random())}`,
//           // amount: lineAmount,
//           // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
//           // customerName: o.user?.fullName || o.name || '-',
//           // customerEmail: o.user?.emailAddress || '',
//           // productName: p?.productName || p?.title || 'Item',
//           amount: lineAmount,
//           displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
//           customerName: o.user?.fullName || o.name || '-',
//           customerEmail: o.user?.emailAddress || '',
//           productName: p?.productName || p?.title || 'Item',
//           productImage: rawImage,
//           productQty: Number(line.quantity || 1),
//           productType: isSell ? 'Buy' : 'Rent',
//           lineStatus: effectiveStatus,
//           hasScheduledReturnPickup: isPickupLine,
//           isPickupLine,
//           pickupDate,
//           pendingDue: Math.max(0, Number(line?.pendingDue || 0)),
//           // Used only in the order details modal breakdown
//           productOnlyAmount: Math.max(0, lineBreakdown.productAmount),
//           taxesAmount: Math.max(0, lineBreakdown.lineTaxes),
//           refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//         });
//       }
//     }
//     for (const booking of sortedBookings) {
//       // Compute service booking taxes the same way the customer-facing
//       // ServiceOrderSummaryAccordion does, so the invoice's "Other Taxes"
//       // row can show a value for service bookings too.
//       const svcTaxLines = Array.isArray(booking?.taxLines)
//         ? booking.taxLines
//         : [];
//       const svcBreakdown = booking?.taxBreakdown || {};
//       const svcComputedTaxTotal =
//         svcTaxLines.length > 0
//           ? svcTaxLines.reduce((s, t) => s + Number(t?.value || 0), 0)
//           : [
//               Number(svcBreakdown.gst || 0),
//               Number(svcBreakdown.careTax || 0),
//               Number(svcBreakdown.repairWarranty || 0),
//               Number(svcBreakdown.relocationWarranty || 0),
//               Number(svcBreakdown.deliveryPackaging || 0),
//               Number(svcBreakdown.installationFee || 0),
//               Number(svcBreakdown.platformFee || 0),
//             ].reduce((s, v) => s + v, 0);

//       rows.push({
//         ...booking,
//         _rowId: `service-${booking._id}`,
//         amount: Number(booking.totalAmount || 0),
//         // displayId: `SRV-${String(booking._id).slice(-3).toUpperCase()}`,
//         displayId: `SRV-${String(booking.bookingNumber || 0).padStart(4, '0')}`,
//         customerName: booking.user?.fullName || booking.name || '-',
//         customerEmail: booking.user?.emailAddress || '',
//         productName:
//           booking.serviceSnapshot?.productName ||
//           booking.serviceProduct?.productName ||
//           'Service booking',
//         productImage:
//           booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
//         productQty: 1,
//         productType: 'Service',
//         lineStatus: booking.status || 'pending',
//         hasScheduledReturnPickup: false,
//         isPickupLine: false,
//         isServiceBooking: true,
//         taxesAmount: Math.max(0, svcComputedTaxTotal),
//       });
//     }
//     return rows;
//   }, [orders, serviceBookings]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     if (activeTab === 'Pickup' && !o.hasScheduledReturnPickup) return false;
//   //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) return false;
//   //     const tabMatch = allowed.length
//   //       ? allowed.includes(String(o.status))
//   //       : true;
//   //     if (!tabMatch) return false;
//   //     if (!q) return true;
//   //     const linesForSearch =
//   //       activeTab === 'Pickup' ? o.pickupProductLines : o.productLines;
//   //     const lineMatch = (linesForSearch || []).some((l) =>
//   //       String(l).toLowerCase().includes(q),
//   //     );
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.customerEmail || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       lineMatch
//   //     );
//   //   });
//   // }, [normalizedOrders, activeTab, query]);

//   // const tabCounts = useMemo(() => {
//   //   const list = normalizedOrders;
//   //   const nonPickup = list.filter((x) => !x.hasScheduledReturnPickup);
//   //   const shipped = list.filter((x) => String(x.status) === 'shipped').length;
//   //   return {
//   //     Processing: nonPickup.filter((x) =>
//   //       ['pending', 'confirmed'].includes(String(x.status)),
//   //     ).length,
//   //     Dispatched: nonPickup.filter((x) => String(x.status) === 'shipped')
//   //       .length,
//   //     'In Transit': nonPickup.filter((x) => String(x.status) === 'shipped')
//   //       .length,
//   //     Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
//   //       .length,
//   //     Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
//   //       .length,
//   //     Pickup: list.filter((x) => x.hasScheduledReturnPickup).length,
//   //   };
//   // }, [normalizedOrders]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     if (activeTab === 'Services') {
//   //       if (!o.isServiceBooking) return false;
//   //     } else {
//   //       if (o.isServiceBooking) return false;
//   //       if (activeTab === 'Pickup' && !o.isPickupLine) return false;
//   //       if (activeTab !== 'Pickup' && o.isPickupLine) return false;
//   //       const tabMatch = allowed.length
//   //         ? allowed.includes(String(o.lineStatus))
//   //         : true;
//   //       if (!tabMatch) return false;
//   //     }
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.customerEmail || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [normalizedOrders, activeTab, query]);
//   // const relocationOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const sortedOrders = [...(orders || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const orderNumberMap = new Map(
//   //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//   //   );
//   //   const rows = flattenAllRelocationLines(sortedOrders, orderNumberMap);
//   //   return rows.filter((o) => {
//   //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//   //     if (
//   //       statusFilter !== 'all' &&
//   //       String(o.relocationRequest?.status || 'requested') !== statusFilter
//   //     ) {
//   //       return false;
//   //     }
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.customerEmail || '')
//   //         .toLowerCase()
//   //         .includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q) ||
//   //       String(o.vendorName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [orders, query, dateFilter, statusFilter]);

//   const relocationOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const sortedOrders = [...(orders || [])].sort(
//       (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//     );
//     const orderNumberMap = new Map(
//       sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//     );
//     const rows = flattenAllRelocationLines(sortedOrders, orderNumberMap);
//     return rows.filter((o) => {
//       if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//       if (
//         statusFilter !== 'all' &&
//         String(o.relocationRequest?.status || 'requested') !== statusFilter
//       ) {
//         return false;
//       }
//       if (!q) return true;
//       return (
//         String(o.displayId).toLowerCase().includes(q) ||
//         String(o.customerName).toLowerCase().includes(q) ||
//         String(o.customerEmail || '')
//           .toLowerCase()
//           .includes(q) ||
//         String(o.productName).toLowerCase().includes(q) ||
//         String(o.vendorName).toLowerCase().includes(q)
//       );
//     });
//   }, [orders, query, dateFilter, statusFilter]);

//   const relocationTotal = useMemo(
//     () => relocationOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [relocationOrders],
//   );

//   const filteredOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const allowed = mapTabToStatuses(activeTab);
//     return normalizedOrders
//       .filter((o) => {
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;

//         if (activeTab === 'Services') {
//           if (!o.isServiceBooking) return false;
//           if (
//             statusFilter !== 'all' &&
//             serviceStatusLabel(o.lineStatus).toLowerCase() !== statusFilter
//           ) {
//             return false;
//           }
//         } else {
//           if (o.isServiceBooking) return false;
//           if (activeTab === 'Pickup' && !o.isPickupLine) return false;
//           if (activeTab !== 'Pickup' && o.isPickupLine) return false;

//           if (statusFilter !== 'all') {
//             if (String(o.lineStatus) !== statusFilter) return false;
//           } else {
//             const tabMatch = allowed.length
//               ? allowed.includes(String(o.lineStatus))
//               : true;
//             if (!tabMatch) return false;
//           }
//         }
//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.customerEmail || '')
//             .toLowerCase()
//             .includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .reverse(); // show newest orders first (page 1), oldest last
//   }, [normalizedOrders, activeTab, query, dateFilter, statusFilter]);

//   const tabCounts = useMemo(() => {
//     const productRows = normalizedOrders.filter((x) => !x.isServiceBooking);
//     const nonPickup = productRows.filter((x) => !x.isPickupLine);
//     return {
//       Processing: nonPickup.filter((x) =>
//         ['confirmed', 'pending'].includes(String(x.lineStatus)),
//       ).length,
//       Dispatched: nonPickup.filter((x) => String(x.lineStatus) === 'shipped')
//         .length,
//       Delivered: nonPickup.filter((x) => String(x.lineStatus) === 'delivered')
//         .length,
//       Completed: nonPickup.filter((x) => String(x.lineStatus) === 'completed')
//         .length,
//       Pickup: productRows.filter((x) => x.isPickupLine).length,
//       Relocate: 0, // computed separately below via relocationOrders
//       Services: normalizedOrders.filter((x) => x.isServiceBooking).length,
//       Cancelled: nonPickup.filter((x) => String(x.lineStatus) === 'cancelled')
//         .length,
//     };
//   }, [normalizedOrders]);

//   const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
//   const safePage = Math.min(page, totalPages);
//   const pageSlice = filteredOrders.slice(
//     (safePage - 1) * PAGE_SIZE,
//     safePage * PAGE_SIZE,
//   );
//   useEffect(() => {
//     setPage(1);
//   }, [activeTab, query, dateFilter, statusFilter]);

//   useEffect(() => {
//     setStatusFilter('all');
//   }, [activeTab]);

//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   // const stats = useMemo(() => {
//   //   const processing = normalizedOrders.filter((o) =>
//   //     ['pending', 'confirmed'].includes(String(o.status)),
//   //   ).length;
//   //   const totalRevenue = normalizedOrders.reduce(
//   //     (s, o) => s + Number(o.amount || 0),
//   //     0,
//   //   );

//   console.log('Normalized orders:', normalizedOrders.length);

//   console.log(
//     'Pending lineStatus:',
//     normalizedOrders.filter((o) => String(o.lineStatus) === 'pending').length,
//   );

//   // const stats = useMemo(() => {
//   //   const processing = normalizedOrders.filter((o) =>
//   //     ['confirmed', 'pending'].includes(String(o.lineStatus)),
//   //   ).length;
//   //   const totalRevenue = normalizedOrders.reduce(
//   //     (s, o) => s + Number(o.amount || 0),
//   //     0,
//   //   );
//   //   const averageOrder = normalizedOrders.length
//   //     ? Math.round(totalRevenue / normalizedOrders.length)
//   //     : 0;

//   const stats = useMemo(() => {
//     const processing = normalizedOrders.filter((o) =>
//       ['confirmed', 'pending'].includes(String(o.lineStatus)),
//     ).length;
//     // Each product line in an order now shows the FULL order amount
//     // (not divided per product), so summing every line would double/
//     // triple-count orders with multiple products. Count each order's
//     // amount only once (by order _id); service bookings are always
//     // counted since each booking is its own separate transaction.
//     const seenOrderIdsForRevenue = new Set();
//     const totalRevenue = normalizedOrders.reduce((s, o) => {
//       if (o.isServiceBooking) {
//         return s + Number(o.amount || 0);
//       }
//       const orderId = String(o._id || '');
//       if (orderId && seenOrderIdsForRevenue.has(orderId)) return s;
//       if (orderId) seenOrderIdsForRevenue.add(orderId);
//       return s + Number(o.amount || 0);
//     }, 0);
//     const averageOrder = normalizedOrders.length
//       ? Math.round(totalRevenue / normalizedOrders.length)
//       : 0;
//     // const urgentActions = normalizedOrders.filter((o) => {
//     //   const isOpen = !['completed', 'cancelled'].includes(String(o.status));
//     //   if (!isOpen) return false;
//     //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
//     //   return ageMs > 24 * 60 * 60 * 1000;
//     // }).length;

//     const urgentActions = normalizedOrders.filter((o) => {
//       return (
//         String(o.lineStatus) === 'pending' &&
//         Date.now() - new Date(o.createdAt || 0).getTime() > 24 * 60 * 60 * 1000
//       );
//     }).length;
//     return { processing, totalRevenue, averageOrder, urgentActions };
//   }, [normalizedOrders]);

//   const filteredTotal = useMemo(
//     () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [filteredOrders],
//   );

//   const pageTotal = useMemo(
//     () => pageSlice.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [pageSlice],
//   );

//   const pagePendingDueTotal = useMemo(
//     () => pageSlice.reduce((s, o) => s + Number(o.pendingDue || 0), 0),
//     [pageSlice],
//   );

//   const pageFrom =
//     filteredOrders.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
//   const pageTo = Math.min(safePage * PAGE_SIZE, filteredOrders.length);

//   const pageNumbers = useMemo(() => {
//     const n = totalPages;
//     if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
//     const cur = safePage;
//     const set = new Set([1, n, cur, cur - 1, cur + 1]);
//     return Array.from(set)
//       .filter((x) => x >= 1 && x <= n)
//       .sort((a, b) => a - b);
//   }, [totalPages, safePage]);

//   const updateServiceStatus = async (bookingId, status) => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token || !bookingId || !status) return;

//     setSavingBookingId(bookingId);
//     try {
//       const res = await apiUpdateServiceBookingStatus(bookingId, status, token);
//       setServiceBookings((prev) =>
//         (prev || []).map((booking) =>
//           booking._id === bookingId ? res.data : booking,
//         ),
//       );
//     } catch (err) {
//       setError(
//         err.response?.data?.message || 'Failed to update service booking.',
//       );
//     } finally {
//       setSavingBookingId('');
//     }
//   };

//   return (
//     <main className="space-y-4 sm:space-y-5">
//       {/* <div>
//         <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Read-only view of all customer orders.
//         </p>
//       </div> */}

//       {loading ? (
//         <div className="flex justify-center py-14">
//           <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
//           {error}
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
//             <div className="bg-white rounded-2xl border border-blue-100 p-4">
//               <p className="text-xs text-gray-500">Total Processing</p>
//               <p className="text-4xl font-semibold text-blue-600 mt-1">
//                 {stats.processing}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-emerald-100 p-4">
//               <p className="text-xs text-gray-500">Total Revenue</p>
//               <p className="text-4xl font-semibold text-emerald-600 mt-1">
//                 {money(stats.totalRevenue)}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-violet-100 p-4">
//               <p className="text-xs text-gray-500">Average Order</p>
//               <p className="text-4xl font-semibold text-violet-600 mt-1">
//                 {money(stats.averageOrder)}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-orange-100 p-4">
//               <p className="text-xs text-gray-500">Urgent Actions</p>
//               <p className="text-4xl font-semibold text-orange-600 mt-1">
//                 {stats.urgentActions}
//               </p>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 space-y-4">
//             <div className="flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab}
//                   type="button"
//                   onClick={() => setActiveTab(tab)}
//                   className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border shrink-0 whitespace-nowrap ${
//                     activeTab === tab
//                       ? 'bg-white border-gray-300 shadow-sm text-gray-900'
//                       : 'border-transparent text-gray-500 hover:bg-gray-50'
//                   }`}
//                 >
//                   <span>{tab}</span>
//                   <span
//                     className={`min-w-[1.5rem] h-6 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
//                       activeTab === tab
//                         ? 'bg-orange-100 text-orange-800'
//                         : 'bg-gray-100 text-gray-600'
//                     }`}
//                   >
//                     {tab === 'Relocate'
//                       ? relocationOrders.length
//                       : (tabCounts[tab] ?? 0)}
//                   </span>
//                 </button>
//               ))}
//             </div>

//             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
//               <div className="relative w-full sm:max-w-md">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search orders, customers, email, products..."
//                   className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex flex-1 flex-wrap sm:justify-end gap-3">
//                 <select
//                   value={dateFilter}
//                   onChange={(e) => setDateFilter(e.target.value)}
//                   className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                 >
//                   <option value="all">All Dates</option>
//                   <option value="today">Today</option>
//                   <option value="last7">Last 7 Days</option>
//                   <option value="last30">Last 30 Days</option>
//                 </select>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                 >
//                   {activeTab === 'Services' ? (
//                     <>
//                       <option value="all">All Statuses</option>
//                       <option value="scheduled">Scheduled</option>
//                       <option value="confirmed">Confirmed</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                     </>
//                   ) : activeTab === 'Pickup' ? (
//                     <option value="all">All Statuses</option>
//                   ) : activeTab === 'Relocate' ? (
//                     <>
//                       <option value="all">All Statuses</option>
//                       <option value="requested">Requested</option>
//                       <option value="confirmed">Confirmed</option>
//                     </>
//                   ) : (
//                     <>
//                       <option value="all">All Statuses</option>
//                       <option value="pending">Processing</option>
//                       <option value="confirmed">Confirmed</option>
//                       <option value="shipped">Dispatched</option>
//                       <option value="delivered">Delivered</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                     </>
//                   )}
//                 </select>
//               </div>
//             </div>
//             <div className="rounded-2xl border border-gray-200 overflow-hidden"></div>
//             {activeTab === 'Relocate' ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-[1100px] w-full text-sm">
//                   <thead className="bg-gray-50 border-b border-gray-100">
//                     <tr className="text-gray-500">
//                       <th className="px-4 py-3 text-center font-medium">
//                         Order ID
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Customer
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         Products
//                       </th>
//                       {/* <th className="px-4 py-3 text-left font-medium">
//                         Vendor
//                       </th> */}
//                       <th className="px-4 py-3 text-center font-medium">
//                         Relocate Date
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Relocate Amount
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Status
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {relocationOrders.map((order) => (
//                       <tr
//                         key={order._rowId}
//                         className="border-t border-gray-100"
//                       >
//                         <td className="px-4 py-3 text-center font-semibold text-gray-900">
//                           {order.displayId}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700">
//                           <div>{order.customerName}</div>
//                           {order.customerEmail ? (
//                             <div className="text-xs text-gray-500 mt-0.5">
//                               {order.customerEmail}
//                             </div>
//                           ) : null}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <div className="flex items-center justify-start gap-2">
//                             {order.productImage ? (
//                               <img
//                                 src={order.productImage}
//                                 alt=""
//                                 className="w-9 h-9 rounded-md object-cover shrink-0"
//                               />
//                             ) : (
//                               <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
//                             )}
//                             <span className="text-gray-800">
//                               {order.productName}
//                             </span>
//                           </div>
//                         </td>
//                         {/* <td className="px-4 py-3 text-gray-700">
//                           {order.vendorName}
//                         </td> */}
//                         {/* <td className="px-4 py-3 text-gray-600">
//                           {order.relocationRequest?.requestedAt
//                             ? new Date(
//                                 order.relocationRequest.requestedAt,
//                               ).toLocaleDateString('en-GB')
//                             : '-'}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${
//                               order.relocationRequest?.status === 'confirmed'
//                                 ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//                                 : 'border-blue-200 bg-blue-50 text-blue-700'
//                             }`}
//                           >
//                             {order.relocationRequest?.status || 'requested'}
//                           </span>
//                         </td> */}
//                         <td className="px-4 py-3 text-center text-gray-600">
//                           {order.relocationRequest?.requestedAt
//                             ? new Date(
//                                 order.relocationRequest.requestedAt,
//                               ).toLocaleDateString('en-GB')
//                             : '-'}
//                         </td>
//                         <td className="px-4 py-3 text-center font-semibold text-gray-900">
//                           {money(order.amount)}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${
//                               order.relocationRequest?.status === 'confirmed'
//                                 ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//                                 : 'border-blue-200 bg-blue-50 text-blue-700'
//                             }`}
//                           >
//                             {order.relocationRequest?.status || 'requested'}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <div className="flex items-center justify-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setViewModal({ open: true, order })
//                               }
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="View"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => generateOrderInvoicePDF(order)}
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="Download"
//                             >
//                               <Download className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                     {/* {relocationOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={6}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No relocation requests yet.
//                         </td>
//                       </tr>
//                     )} */}
//                     {/* {relocationOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={7}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No relocation requests yet.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             ) : ( */}
//                     {relocationOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={7}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No relocation requests yet.
//                         </td>
//                       </tr>
//                     )}
//                     {/* </tbody>
//                   {relocationOrders.length > 0 && (
//                     <tfoot>
//                       <tr className="bg-[#F97316] text-white">
//                         <td
//                           colSpan={4}
//                           className="px-4 py-3 text-center font-semibold"
//                         >
//                           Total
//                         </td>
//                         <td className="px-4 py-3 text-center font-semibold">
//                           {money(relocationTotal)}
//                         </td>
//                         <td className="px-4 py-3"></td>
//                         <td className="px-4 py-3"></td>
//                       </tr>
//                     </tfoot>
//                   )}
//                 </table>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-[980px] w-full text-sm"> */}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-[980px] w-full text-sm">
//                   <thead className="bg-gray-50 border-b border-gray-100">
//                     <tr className="text-gray-500">
//                       <th className="px-4 py-3 text-center font-medium">
//                         Order ID
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Customer
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         Products
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Type
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
//                         {activeTab === 'Pickup' ? 'Pickup Date' : 'Order date'}
//                       </th>
//                       {activeTab === 'Pickup' ? (
//                         <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
//                           Pending Due
//                         </th>
//                       ) : (
//                         <th className="px-4 py-3 text-center font-medium">
//                           Amount
//                         </th>
//                       )}
//                       <th className="px-4 py-3 text-center font-medium">
//                         Status
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {pageSlice.map((order) => (
//                       <tr
//                         key={order._rowId}
//                         className="border-t border-gray-100"
//                       >
//                         {/* <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top">
//                           {order.displayId}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700 align-top">
//                           <div>{order.customerName}</div>
//                           {order.customerEmail ? (
//                             <div className="text-xs text-gray-500 mt-0.5">
//                               {order.customerEmail}
//                             </div>
//                           ) : null}
//                         </td>
//                         <td className="px-4 py-3 text-left align-top">
//                           <div className="flex items-center justify-start gap-2">
//                             {order.productImage ? (
//                               <img
//                                 src={order.productImage}
//                                 alt=""
//                                 className="w-9 h-9 rounded-md object-cover shrink-0"
//                               />
//                             ) : (
//                               <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
//                             )}
//                             <span className="text-xs text-gray-800">
//                               {order.productName}
//                               {order.productQty > 1
//                                 ? ` ×${order.productQty}`
//                                 : ''}
//                             </span>
//                           </div>
//                         </td> */}

//                         <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top whitespace-nowrap">
//                           {order.displayId}
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-700 align-top">
//                           <div>{order.customerName}</div>
//                           {order.customerEmail ? (
//                             <div className="text-xs text-gray-500 mt-0.5">
//                               {order.customerEmail}
//                             </div>
//                           ) : null}
//                         </td>
//                         <td className="px-4 py-3 text-left align-top">
//                           <div className="flex items-center justify-start gap-2">
//                             {order.productImage ? (
//                               <img
//                                 src={order.productImage}
//                                 alt=""
//                                 className="w-9 h-9 rounded-md object-cover shrink-0"
//                               />
//                             ) : (
//                               <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
//                             )}
//                             <span className="text-xs text-gray-800">
//                               {order.productName}
//                               {order.productQty > 1
//                                 ? ` ×${order.productQty}`
//                                 : ''}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-center align-top">
//                           <span
//                             className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border ${
//                               order.productType === 'Service'
//                                 ? 'bg-sky-50 text-sky-800 border-sky-200'
//                                 : order.productType === 'Sell'
//                                   ? 'bg-blue-50 text-blue-800 border-blue-200'
//                                   : 'bg-orange-50 text-orange-800 border-orange-200'
//                             }`}
//                           >
//                             {order.productType}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center text-gray-600 align-top whitespace-nowrap">
//                           {order.isPickupLine && order.pickupDate
//                             ? new Date(order.pickupDate).toLocaleDateString(
//                                 'en-GB',
//                               )
//                             : order.createdAt
//                               ? new Date(order.createdAt).toLocaleDateString(
//                                   'en-GB',
//                                 )
//                               : '-'}
//                         </td>
//                         {activeTab === 'Pickup' ? (
//                           <td className="px-4 py-3 text-center align-top whitespace-nowrap">
//                             {order.pendingDue > 0 ? (
//                               <span className="font-semibold text-red-600">
//                                 {money(order.pendingDue)}
//                               </span>
//                             ) : (
//                               <span className="text-gray-400">₹0</span>
//                             )}
//                           </td>
//                         ) : (
//                           <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top">
//                             {money(order.amount)}
//                           </td>
//                         )}
//                         <td className="px-4 py-3 text-center align-top whitespace-nowrap">
//                           {order.isPickupLine ? (
//                             <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border bg-blue-50 text-blue-800 border-blue-200 whitespace-nowrap">
//                               Pickup Scheduled
//                             </span>
//                           ) : order.isServiceBooking ? (
//                             <span
//                               className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${serviceStatusBadgeClass(order.lineStatus)}`}
//                             >
//                               {serviceStatusLabel(order.lineStatus)}
//                             </span>
//                           ) : (
//                             <span
//                               className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${statusBadgeClass(order.lineStatus)}`}
//                             >
//                               {statusLabel(order.lineStatus)}
//                             </span>
//                           )}
//                         </td>
//                         <td className="px-4 py-3 text-center align-top">
//                           <div className="flex items-center justify-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setViewModal({ open: true, order })
//                               }
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="View"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => generateOrderInvoicePDF(order)}
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                               title="Download"
//                             >
//                               <Download className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}

//                     {filteredOrders.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={activeTab === 'Pickup' ? 9 : 8}
//                           className="px-4 py-10 text-center text-gray-500"
//                         >
//                           No orders found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                   <tfoot>
//                     <tr className="bg-[#F97316] text-white">
//                       <td
//                         colSpan={5}
//                         className="px-4 py-3 text-center font-semibold"
//                       >
//                         {/* Total ({pageSlice.length} orders) */}
//                         Total
//                       </td>
//                       {activeTab === 'Pickup' ? (
//                         <td className="px-4 py-3 text-center font-semibold">
//                           {money(pagePendingDueTotal)}
//                         </td>
//                       ) : (
//                         <td className="px-4 py-3 text-center font-semibold">
//                           {money(pageTotal)}
//                         </td>
//                       )}
//                       <td className="px-4 py-3"></td>
//                       <td className="px-4 py-3"></td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             )}
//           </div>
//           {activeTab !== 'Relocate' && totalPages > 1 ? (
//             <nav
//               className="flex flex-wrap items-center justify-center gap-2"
//               aria-label="Pagination"
//             >
//               <button
//                 type="button"
//                 disabled={safePage <= 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 Previous
//               </button>
//               <span className="min-w-[2.25rem] h-9 px-3 inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[#F97316] text-white shadow">
//                 {safePage}
//               </span>
//               <button
//                 type="button"
//                 disabled={safePage >= totalPages}
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 Next
//               </button>
//             </nav>
//           ) : null}
//         </>
//       )}
//       <OrderDetailsModal
//         open={viewModal.open}
//         order={viewModal.order}
//         onClose={() => setViewModal({ open: false, order: null })}
//       />
//     </main>
//   );
// };

// export default Orders;

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  apiGetAllOrders,
  apiGetAllServiceBookings,
  apiUpdateServiceBookingStatus,
} from '@/service/api';
import { resolveLineRefundableDeposit } from '@/Vendor/utils/vendorPayout';
import {
  Search,
  Eye,
  Download,
  Package,
  ClipboardCheck,
  User,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import jsPDF from 'jspdf';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

const PAGE_SIZE = 10;
const tabs = [
  'Processing',
  'Dispatched',
  'Delivered',
  'Pickup',
  'Relocate',
  'Services',
  'Completed',
  'Cancelled',
];

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const matchesDateFilter = (createdAt, filter) => {
  if (!filter || filter === 'all') return true;
  if (!createdAt) return false;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  if (filter === 'today') return created >= startOfToday;
  if (filter === 'last7') {
    const cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - 6);
    return created >= cutoff;
  }
  if (filter === 'last30') {
    const cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - 29);
    return created >= cutoff;
  }
  return true;
};

// Mirrors vendor-side computeVendorLinePayout, but since admin sees ALL
// vendors' lines together, the fee/tax share is based on the line's
// share of the ENTIRE order value (not just one vendor's lines).
// function computeAdminLineBreakdown(order, line) {
//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   const lineValue = rate * qty;

//   const allLines = (order?.products || []).filter(
//     (l) => l?.product && typeof l.product === 'object',
//   );
//   const orderTotalValue =
//     allLines.reduce(
//       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
//       0,
//     ) || 1;
//   const share = lineValue / orderTotalValue;

//   const orderPlatformFee = Number(order?.platformFee || 0);
//   const otherTaxes =
//     Number(order?.gst || 0) +
//     Number(order?.careProtection || 0) +
//     Number(order?.repairWarranty || 0) +
//     Number(order?.relocationWarranty || 0) +
//     Number(order?.deliveryPackaging || 0) +
//     Number(order?.installationFee || 0);

//   const lineFee = orderPlatformFee * share;
//   const lineTaxes = otherTaxes * share;
//   const lineDeposit = Number(line?.refundableDeposit || 0);

//   return {
//     productAmount: lineValue,
//     lineFee,
//     lineTaxes,
//     lineDeposit,
//     payout: Math.max(0, lineValue - lineFee) + lineDeposit + lineTaxes,
//   };
// }

function computeAdminLineBreakdown(order, line) {
  const qty = Number(line?.quantity || 1);
  const rate = Number(line?.pricePerDay || 0);
  const lineValue = rate * qty;

  // Show the FULL order amount on every product line — same as the
  // customer-facing "My Orders" page (which never divides fees/taxes
  // per product when multiple products share one order). No more
  // proportional "share" split across lines.
  const allLines = (order?.products || []).filter(
    (l) => l?.product && typeof l.product === 'object',
  );
  const orderProductTotal = allLines.reduce(
    (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
    0,
  );
  let orderDepositTotal = allLines.reduce(
    (s, l) => s + resolveLineRefundableDeposit(l, order),
    0,
  );
  if (orderDepositTotal <= 0) {
    orderDepositTotal = Math.max(0, Number(order?.refundableDeposit || 0));
  }

  //   const orderPlatformFee = Number(order?.platformFee || 0);
  //   const otherTaxes =
  //     Number(order?.gst || 0) +
  //     Number(order?.careProtection || 0) +
  //     Number(order?.repairWarranty || 0) +
  //     Number(order?.relocationWarranty || 0) +
  //     Number(order?.deliveryPackaging || 0) +
  //     Number(order?.installationFee || 0);

  //   const lineDeposit = Number(line?.refundableDeposit || 0);

  //   const fullPayout =
  //     Math.max(0, orderProductTotal - orderPlatformFee) +
  //     orderDepositTotal +
  //     otherTaxes;

  //   return {
  //     productAmount: lineValue,
  //     lineFee: orderPlatformFee,
  //     lineTaxes: otherTaxes,
  //     lineDeposit,
  //     payout: fullPayout,
  //   };
  // }

  // function computeAdminLinePayout(order, line) {
  const orderPlatformFee = Number(order?.platformFee || 0);
  const otherTaxes =
    Number(order?.gst || 0) +
    Number(order?.careProtection || 0) +
    Number(order?.repairWarranty || 0) +
    Number(order?.relocationWarranty || 0) +
    Number(order?.deliveryPackaging || 0) +
    Number(order?.installationFee || 0);
  const discountAmount = Number(order?.discountAmount || 0);

  const lineDeposit = resolveLineRefundableDeposit(line, order);

  const fullPayout =
    Math.max(0, orderProductTotal - orderPlatformFee - discountAmount) +
    orderDepositTotal +
    otherTaxes;

  return {
    productAmount: lineValue,
    lineFee: orderPlatformFee,
    lineTaxes: otherTaxes,
    lineDeposit,
    payout: fullPayout,
  };
}

function computeAdminLinePayout(order, line) {
  return computeAdminLineBreakdown(order, line).payout;
}

function looksLikeUrl(value) {
  const s = String(value || '')
    .trim()
    .toLowerCase();
  return s.startsWith('http://') || s.startsWith('https://');
}
const mapTabToStatuses = (tab) => {
  // if (tab === 'Processing') return ['pending', 'confirmed'];
  // if (tab === 'Processing') return ['pending'];
  if (tab === 'Processing') return ['confirmed', 'pending'];
  if (tab === 'Dispatched') return ['shipped', 'in_progress'];
  if (tab === 'Delivered') return ['delivered'];
  if (tab === 'Completed') return ['completed'];
  if (tab === 'Cancelled') return ['cancelled'];
  if (tab === 'Pickup') return [];
  if (tab === 'Relocate') return [];
  if (tab === 'Services') return [];
  return [];
};

// Admin-wide flatten of every line that has a relocation request, across
// ALL vendors (unlike the vendor-side version which filters by vendorId).
// Read-only — no confirm action here, admin can only view.
function flattenAllRelocationLines(orders, orderNumberMap) {
  const rows = [];
  for (const order of orders || []) {
    const lines = (order.products || []).filter(
      (l) => l?.product && typeof l.product === 'object',
    );
    for (const line of lines) {
      if (!line?.relocationRequest?.requestedAt) continue;
      // const p = line.product;
      // const rawImage = String(p?.image || '').trim();
      // rows.push({
      //   ...order,
      //   _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
      //   // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
      //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
      //   customerName: order.user?.fullName || order.name || '-',
      //   customerEmail: order.user?.emailAddress || '',
      //   productName: p?.productName || p?.title || 'Item',
      //   productImage: rawImage,
      // const p = line.product;
      // const rawImage = String(p?.image || '').trim();
      // const lineAmount =
      //   Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
      // rows.push({
      // const p = line.product;
      // const rawImage = String(p?.image || '').trim();
      // const lineAmount = computeAdminLinePayout(order, line);
      // rows.push({
      // const p = line.product;
      // const rawImage = String(p?.image || '').trim();
      // const lineAmount = 0; // Relocation amount is always static 0
      // rows.push({
      //   ...order,
      //   _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
      //   // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
      //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
      //   amount: lineAmount,
      //   customerName: order.user?.fullName || order.name || '-',
      //   customerEmail: order.user?.emailAddress || '',
      //   productName: p?.productName || p?.title || 'Item',
      //   productImage: rawImage,

      // const p = line.product;
      // const rawImage = String(p?.image || '').trim();
      // const lineAmount = 0; // Relocate tab table amount is always static 0
      // const relocLineBreakdown = computeAdminLineBreakdown(order, line);
      // rows.push({
      //   ...order,
      //   _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
      //   // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
      //   displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
      //   amount: lineAmount,
      const p = line.product;
      const rawImage = String(p?.image || '').trim();
      const lineAmount = 0; // Relocate tab table amount is always static 0
      const relocLineBreakdown = computeAdminLineBreakdown(order, line);
      const relocIsSell =
        String(line?.productType || '').toLowerCase() === 'sell' ||
        String(p?.type || '').toLowerCase() === 'sell';
      rows.push({
        ...order,
        _rowId: `reloc-${order._id}-${String(p?._id || Math.random())}`,
        // displayId: `ORD-${String(orderNumberMap.get(String(order._id)) || 0).padStart(3, '0')}`,
        displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
        amount: lineAmount,
        productType: relocIsSell ? 'Buy' : 'Rent',
        // Used only in the order details modal breakdown (view icon),
        // table's "Relocate Amount" column stays 0.
        productOnlyAmount: Math.max(0, relocLineBreakdown.productAmount),
        taxesAmount: Math.max(0, relocLineBreakdown.lineTaxes),
        refundableDeposit: resolveLineRefundableDeposit(line, order),
        customerName: order.user?.fullName || order.name || '-',
        customerEmail: order.user?.emailAddress || '',
        productName: p?.productName || p?.title || 'Item',
        productImage: rawImage,
        vendorName:
          p?.vendorId?.shopName ||
          p?.vendorId?.fullName ||
          p?.vendorId?.emailAddress ||
          '-',
        relocationRequest: line.relocationRequest,
        currentAddress: line.relocationRequest?.oldAddressSnapshot || {
          name: order.name,
          address: order.address,
          phone: order.phone,
        },
        newAddress: line.relocationRequest?.newAddress || {},
      });
    }
  }
  return rows;
}
function statusLabel(raw) {
  const s = String(raw || 'pending').toLowerCase();
  const map = {
    pending: 'Processing',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    shipped: 'Shipped',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pickup_scheduled: 'Pickup Scheduled',
  };
  return map[s] || s;
}

// function statusBadgeClass(raw) {
//   const s = String(raw || '').toLowerCase();
//   if (s === 'pending') return 'bg-amber-50 text-amber-900 border-amber-200';
//   if (s === 'confirmed') return 'bg-sky-50 text-sky-900 border-sky-200';
//   if (s === 'in_progress') return 'bg-blue-50 text-blue-800 border-blue-200';
//   if (s === 'shipped') return 'bg-indigo-50 text-indigo-900 border-indigo-200';
//   if (s === 'delivered')
//     return 'bg-emerald-50 text-emerald-900 border-emerald-200';
//   if (s === 'completed') return 'bg-teal-50 text-teal-900 border-teal-200';
//   if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
//   if (s === 'pickup_scheduled')
//     return 'bg-blue-50 text-blue-800 border-blue-200';
//   return 'bg-gray-50 text-gray-800 border-gray-200';
// }

function statusBadgeClass(raw) {
  const s = String(raw || '').toLowerCase();
  if (s === 'pending') return 'bg-amber-50 text-amber-900 border-amber-200';
  if (s === 'confirmed') return 'bg-sky-50 text-sky-900 border-sky-200';
  if (s === 'in_progress') return 'bg-blue-50 text-blue-800 border-blue-200';
  if (s === 'shipped') return 'bg-indigo-50 text-indigo-900 border-indigo-200';
  if (s === 'delivered')
    return 'bg-emerald-50 text-emerald-900 border-emerald-200';
  if (s === 'completed') return 'bg-teal-50 text-teal-900 border-teal-200';
  if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
  if (s === 'pickup_scheduled')
    return 'bg-blue-50 text-blue-800 border-blue-200';
  return 'bg-gray-50 text-gray-800 border-gray-200';
}

// Mirrors vendor-side Services tab status display:
// pending -> Scheduled, confirmed/in_progress -> Confirmed,
// completed -> Completed, cancelled -> Cancelled
function serviceStatusLabel(raw) {
  const s = String(raw || '').toLowerCase();
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'completed') return 'Completed';
  if (s === 'confirmed' || s === 'in_progress') return 'Confirmed';
  return 'Scheduled';
}

function serviceStatusBadgeClass(raw) {
  const s = String(raw || '').toLowerCase();
  if (s === 'cancelled') return 'bg-red-50 text-red-600 border-red-200';
  if (s === 'completed')
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'confirmed' || s === 'in_progress')
    return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
}

function generateOrderInvoicePDF(order) {
  const pdf = new jsPDF();
  const pageW = 210;
  const marginX = 14;
  const rightX = pageW - marginX;
  let y = 20;

  // Relocation rows show a static 0 in the table/amount field, but the
  // invoice should show the full product amount (price + deposit + taxes).
  const invoiceAmount = order?.relocationRequest?.requestedAt
    ? Number(order.productOnlyAmount || 0) +
      Number(order.refundableDeposit || 0) +
      Number(order.taxesAmount || 0)
    : Number(order.amount || 0);

  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Invoice - ${order.displayId || ''}`, marginX, y);
  pdf.setFont(undefined, 'normal');

  y += 5;
  pdf.setDrawColor(230);
  pdf.line(marginX, y, rightX, y);

  const logoY = y + 14;
  try {
    pdf.addImage(RentnpayLogo.src, 'PNG', marginX, logoY - 8, 16, 16);
  } catch (e) {
    // Fallback to the old circle+"R" if the image fails to load/encode
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

  const boxTop = y;
  const boxHeight = 62;
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

  let leftY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Details', marginX + 6, leftY);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  const invDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  // const details = [
  //   ['Order Number', order.displayId || '-'],
  //   ['Order Date', invDate],
  //   ['Product Type', order.productType || '-'],
  //   ['Customer', order.customerName || '-'],
  // ];
  const isRelocationForDetails = Boolean(order?.relocationRequest?.requestedAt);
  const relocationInvoiceDate = order?.relocationRequest?.requestedAt
    ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
        'en-IN',
        { day: '2-digit', month: 'short', year: 'numeric' },
      )
    : invDate;

  const details = [
    ['Order Number', order.displayId || '-'],
    [
      isRelocationForDetails ? 'Relocation Date' : 'Order Date',
      isRelocationForDetails ? relocationInvoiceDate : invDate,
    ],
    ...(isRelocationForDetails ? [['Relocation Amount', 'Rs. 0']] : []),
    ...(isRelocationForDetails
      ? []
      : [['Product Type', order.productType || '-']]),
    ['Customer', order.customerName || '-'],
    ...(!order.isServiceBooking &&
    !isRelocationForDetails &&
    String(order.productType || '') !== 'Buy' &&
    Number(order.refundableDeposit || 0) > 0
      ? [
          [
            'Refundable Deposit',
            `Rs. ${Number(order.refundableDeposit).toLocaleString('en-IN')}`,
          ],
        ]
      : []),
    ...(Number(order.taxesAmount || 0) > 0
      ? [
          [
            'Other Taxes',
            `Rs. ${Number(order.taxesAmount).toLocaleString('en-IN')}`,
          ],
        ]
      : []),
  ];
  leftY += 7;
  details.forEach(([label, val]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(String(val), marginX + 45, leftY);
    leftY += 6;
  });

  leftY += 2;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Amount', marginX + 6, leftY);
  pdf.text(`Rs. ${invoiceAmount.toLocaleString('en-IN')}`, marginX + 45, leftY);
  pdf.setFont(undefined, 'normal');

  let rightY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  rightY += 7;
  pdf.text(order.customerName || '-', rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  pdf.text(order.phone || order.customerEmail || '-', rightX - 6, rightY, {
    align: 'right',
  });
  rightY += 5;
  const addr = order.address || '-';
  const addrWrapped = pdf.splitTextToSize(String(addr), 70);
  addrWrapped.forEach((line) => {
    pdf.text(line, rightX - 6, rightY, { align: 'right' });
    rightY += 5;
  });

  y = boxTop + boxHeight + 12;

  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Item(s) Details', marginX, y);
  pdf.setFont(undefined, 'normal');
  y += 8;

  const cols = [
    { label: 'S.No', x: marginX + 2, w: 8 },
    { label: 'Particulars', x: marginX + 12, w: 68 },
    { label: 'Qty', x: marginX + 84, w: 14 },
    { label: 'Status', x: marginX + 102, w: 30 },
    { label: 'Amount', x: rightX - 2, w: 20, align: 'right' },
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

  // const rowTop = y;
  // const itemLabel = `Item: ${order.productName || 'Product'}`;
  // const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

  // const statusLabelText = order.isServiceBooking
  //   ? serviceStatusLabel(order.lineStatus)
  //   : statusLabel(order.isPickupLine ? 'pickup_scheduled' : order.lineStatus);

  // pdf.setFontSize(8);
  // pdf.text('1', cols[0].x, rowTop + 4);
  // pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
  // pdf.text(String(order.productQty || 1), cols[2].x, rowTop + 4);
  // pdf.text(statusLabelText, cols[3].x, rowTop + 4);
  // pdf.text(
  //   `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
  //   cols[4].x,
  //   rowTop + 4,
  //   { align: 'right' },
  // );

  const statusLabelText = order.isServiceBooking
    ? serviceStatusLabel(order.lineStatus)
    : statusLabel(order.isPickupLine ? 'pickup_scheduled' : order.lineStatus);

  // When this order has more than one product line, list every product
  // with its own price, then show the order total — so the invoice
  // matches the full order amount already shown in the table row.
  // Single-product orders keep the original single-row layout.
  const allInvoiceProductLines = (order?.products || []).filter(
    (l) => l?.product && typeof l.product === 'object',
  );
  const isMultiProductInvoice =
    !order.isServiceBooking &&
    !order?.relocationRequest?.requestedAt &&
    allInvoiceProductLines.length > 1;

  pdf.setFontSize(8);

  // Each product line can be in a different status (e.g. one shipped,
  // one confirmed) — resolve status per line instead of reusing the
  // single shared statusLabelText value.
  const lineStatusLabelText = (line) =>
    statusLabel(line?.lineStatus || order.status);

  let rowTop = y;
  if (isMultiProductInvoice) {
    let rowStartY = y;
    let sno = 1;
    allInvoiceProductLines.forEach((line) => {
      const lp = line?.product;
      const qty = Number(line?.quantity || 1);
      const rate = Number(line?.pricePerDay || 0);
      const lineAmount = rate * qty;
      const itemLabel = `Item: ${lp?.productName || lp?.title || 'Product'}`;
      const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);
      const rowHeightMulti = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
      const thisLineStatus = lineStatusLabelText(line);

      pdf.text(String(sno), cols[0].x, rowStartY + 4);
      pdf.text(itemNameWrapped, cols[1].x, rowStartY + 4);
      pdf.text(String(qty), cols[2].x, rowStartY + 4);
      pdf.text(thisLineStatus, cols[3].x, rowStartY + 4);
      pdf.text(
        `Rs.${lineAmount.toLocaleString('en-IN')}`,
        cols[4].x,
        rowStartY + 4,
        { align: 'right' },
      );
      pdf.setDrawColor(225);
      pdf.roundedRect(
        marginX,
        rowStartY - 4,
        rightX - marginX,
        rowHeightMulti,
        2,
        2,
        'S',
      );
      rowStartY += rowHeightMulti + 4;
      sno += 1;
    });

    pdf.setFont(undefined, 'bold');
    pdf.text('Order Total', cols[1].x, rowStartY + 4);
    pdf.text(
      `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
      cols[4].x,
      rowStartY + 4,
      { align: 'right' },
    );
    pdf.setFont(undefined, 'normal');
    y = rowStartY + 10;
  } else {
    const itemLabel = `Item: ${order.productName || 'Product'}`;
    const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

    // Table row shows just this product's own price (matches the
    // multi-product table, where each row shows its own line amount).
    // The full order total (with deposit/taxes) still shows separately
    // in the "Amount" field of the Invoice Details section above.
    const rowItemAmount = order?.relocationRequest?.requestedAt
      ? invoiceAmount
      : Number(order.productOnlyAmount ?? invoiceAmount);

    pdf.text('1', cols[0].x, rowTop + 4);
    pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
    pdf.text(String(order.productQty || 1), cols[2].x, rowTop + 4);
    pdf.text(statusLabelText, cols[3].x, rowTop + 4);
    pdf.text(
      `Rs.${rowItemAmount.toLocaleString('en-IN')}`,
      cols[4].x,
      rowTop + 4,
      { align: 'right' },
    );

    // const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
    // pdf.setDrawColor(225);
    // pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
    // y = rowTop + rowHeight + 4;

    // y += 4;
    // pdf.setFontSize(9);
    // pdf.setTextColor(120);
    // pdf.text(
    //   'This is a system-generated document. No signature required.',
    //   marginX,
    //   y,
    // );
    // pdf.setTextColor(0, 0, 0);

    // pdf.save(`${String(order.displayId || 'invoice').replace('#', '')}.pdf`);

    const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
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
  }

  // Relocation-specific address details (Current/Old address + New address)
  const isRelocationInvoiceOrder = Boolean(
    order?.relocationRequest?.requestedAt,
  );
  if (isRelocationInvoiceOrder) {
    const isConfirmed =
      String(order?.relocationRequest?.status || '') === 'confirmed';

    const oldAddr = order?.currentAddress || {};
    const newAddr = order?.newAddress || {};

    const oldAddrLine =
      [
        oldAddr.label || oldAddr.name || '',
        oldAddr.address || '',
        oldAddr.phone ? `Phone: ${oldAddr.phone}` : '',
      ]
        .filter(Boolean)
        .join(', ') || '-';

    const newAddrLine =
      [
        newAddr.label || '',
        [newAddr.addressLine, newAddr.area, newAddr.pincode]
          .filter(Boolean)
          .join(', '),
        newAddr.phone ? `Phone: ${newAddr.phone}` : '',
      ]
        .filter(Boolean)
        .join(', ') || '-';

    y += 4;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('Relocation Address Details', marginX, y);
    pdf.setFont(undefined, 'normal');
    y += 7;

    pdf.setFontSize(9);
    pdf.setFont(undefined, 'bold');
    pdf.text(isConfirmed ? 'Old Address' : 'Current Address', marginX, y);
    pdf.setFont(undefined, 'normal');
    const oldWrapped = pdf.splitTextToSize(oldAddrLine, rightX - marginX - 30);
    pdf.text(oldWrapped, marginX + 32, y);
    y += Math.max(oldWrapped.length * 5, 6);

    y += 2;
    pdf.setFont(undefined, 'bold');
    pdf.text(isConfirmed ? 'Current Address' : 'New Address', marginX, y);
    pdf.setFont(undefined, 'normal');
    const newWrapped = pdf.splitTextToSize(newAddrLine, rightX - marginX - 30);
    pdf.text(newWrapped, marginX + 32, y);
    y += Math.max(newWrapped.length * 5, 6);
  }

  y += 4;
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    'This is a system-generated document. No signature required.',
    marginX,
    y,
  );
  pdf.setTextColor(0, 0, 0);

  pdf.save(`${String(order.displayId || 'invoice').replace('#', '')}.pdf`);
}

function OrderDetailsModal({ open, order, onClose }) {
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  if (!open || !order) return null;

  // When this order has more than one product line, show all of them
  // here so the modal total matches the full order amount already shown
  // in the table row. Single-product orders are unaffected — they keep
  // showing just their own detail rows below.
  const allOrderProductLines = (order?.products || []).filter(
    (l) => l?.product && typeof l.product === 'object',
  );
  const isMultiProductOrder =
    !order.isServiceBooking && allOrderProductLines.length > 1;
  const multiProductRows = isMultiProductOrder
    ? allOrderProductLines.map((l) => {
        const lp = l?.product;
        const qty = Number(l?.quantity || 1);
        const rate = Number(l?.pricePerDay || 0);
        return {
          key: String(lp?._id || l?._id || Math.random()),
          name: lp?.productName || lp?.title || 'Product',
          image: lp?.image || '',
          qty,
          price: rate * qty,
          isSell:
            String(l?.productType || '').toLowerCase() === 'sell' ||
            String(lp?.type || '').toLowerCase() === 'sell',
        };
      })
    : [];

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  const isRelocationOrder = Boolean(order?.relocationRequest?.requestedAt);
  const isRelocationConfirmed =
    String(order?.relocationRequest?.status || '') === 'confirmed';

  const relocationDate = order?.relocationRequest?.requestedAt
    ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
        'en-IN',
        { day: '2-digit', month: 'short', year: 'numeric' },
      )
    : '-';

  const statusText = order.isServiceBooking
    ? serviceStatusLabel(order.lineStatus)
    : isRelocationOrder
      ? isRelocationConfirmed
        ? 'Completed'
        : 'Requested'
      : order.isPickupLine
        ? 'Pickup Scheduled'
        : statusLabel(order.lineStatus);

  const oldAddr = order?.currentAddress || {};
  const newAddr = order?.newAddress || {};
  // const detailRows = [
  //   ['Order ID', order.displayId || '-'],
  //   ['Customer', order.customerName || '-'],
  //   ['Email', order.customerEmail || '-'],
  //   ['Delivery Number', order.phone || '-'],
  //   ['Registered Number', order.user?.mobileNumber || '-'],
  //   ['Product', order.productName || '-'],
  //   ...(isRelocationOrder ? [] : [['Product Type', order.productType || '-']]),

  //   [
  //     order.isServiceBooking ? 'Amount' : 'Product Amount',
  //     money(
  //       order.isServiceBooking
  //         ? order.amount
  //         : (order.productOnlyAmount ?? order.amount),
  //     ),
  //   ],
  //   ...(order.refundableDeposit
  //     ? [['Refundable Deposit', money(order.refundableDeposit)]]
  //     : []),
  //   ...(!order.isServiceBooking && order.taxesAmount
  //     ? [['Other Taxes', money(order.taxesAmount)]]
  //     : []),
  //   ['Order Date', orderDate],
  //   ...(isRelocationOrder ? [['Relocation Date', relocationDate]] : []),
  //   ['Status', statusText],
  // ];

  const detailRowPairs = [
    [
      ['Order ID', order.displayId || '-'],
      ['Product', order.productName || '-'],
    ],
    [
      ['Customer', order.customerName || '-'],
      [
        order.isServiceBooking ? 'Amount' : 'Product Amount',
        money(
          order.isServiceBooking
            ? order.amount
            : (order.productOnlyAmount ?? order.amount),
        ),
      ],
    ],
    // [
    //   ['Registered Number', order.user?.mobileNumber || '-'],
    //   order.refundableDeposit
    //     ? ['Refundable Deposit', money(order.refundableDeposit)]
    //     : null,
    // ],
    [
      ['Registered Number', order.user?.mobileNumber || '-'],
      order.refundableDeposit
        ? ['Refundable Deposit', money(order.refundableDeposit)]
        : ['Status', statusText],
    ],
    [
      ['Delivery Number', order.phone || '-'],
      isRelocationOrder
        ? ['Relocation Date', relocationDate]
        : ['Order Date', orderDate],
    ],
    // [
    //   isRelocationOrder ? null : ['Order Type', order.productType || '-'],
    //   !order.isServiceBooking && order.taxesAmount
    //     ? ['Other Taxes', money(order.taxesAmount)]
    //     : null,
    // ],
    [
      ['Order Type', order.productType || '-'],
      !order.isServiceBooking && order.taxesAmount
        ? ['Other Taxes', money(order.taxesAmount)]
        : null,
    ],
  ];

  // Kept for the multi-product filter logic below (labels only).
  const detailRows = detailRowPairs.flat().filter(Boolean);
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
        <div className="p-5 sm:p-6">
          {/* <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold leading-tight text-gray-900">
                Order #{order.displayId}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {order.customerName} - {order.productName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close order details"
            >
              ×
            </button>
          </div> */}

          <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-sm">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold leading-tight text-gray-900">
                  Order #{order.displayId}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {order.customerName} - {order.productName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close order details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            {isMultiProductOrder ? ( */}
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2 mb-1">
              <ClipboardCheck className="h-4 w-4 text-orange-500" />
              Order Details
            </p>
            {isMultiProductOrder ? (
              <>
                <div className="space-y-2">
                  {multiProductRows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {row.image ? (
                          <img
                            src={row.image}
                            alt=""
                            className="h-9 w-9 rounded-md object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-gray-100 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {row.name}
                            {row.qty > 1 ? ` ×${row.qty}` : ''}
                          </p>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${
                              row.isSell ? 'bg-blue-600' : 'bg-orange-500'
                            }`}
                          >
                            {row.isSell ? 'Buy' : 'Rent'}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm shrink-0">
                        {money(row.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-y-2.5 text-sm border-t border-gray-200 pt-3">
                  {detailRows
                    .filter(
                      ([label]) =>
                        label !== 'Product' &&
                        label !== 'Product Type' &&
                        label !== 'Product Amount' &&
                        label !== 'Amount',
                    )
                    .map(([label, val]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-900 text-right">
                          {val}
                        </span>
                      </div>
                    ))}
                  <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-2 mt-1">
                    <span className="text-gray-700 font-semibold">
                      Order Total
                    </span>
                    <span className="font-bold text-gray-900 text-right">
                      {money(order.amount)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              // ) : (
              //   <div className="grid grid-cols-1 gap-y-2.5 text-sm">
              //     {detailRows.map(([label, val]) => (
              //       <div
              //         key={label}
              //         className="flex items-center justify-between gap-3"
              //       >
              //         <span className="text-gray-500">{label}</span>
              //         <span className="font-medium text-gray-900 text-right">
              //           {val}
              //         </span>
              //       </div>
              //     ))}
              //   </div>
              // )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                {detailRowPairs.map((pair, idx) =>
                  pair.map((item, i) =>
                    item ? (
                      // <div
                      //   key={`${idx}-${i}`}
                      //   className="flex items-center justify-between gap-3"
                      // >
                      //   <span className="text-gray-500">{item[0]}</span>
                      //   <span className="font-medium text-gray-900 text-right">
                      //     {item[1]}
                      //   </span>
                      // </div>
                      <div
                        key={`${idx}-${i}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-gray-500 whitespace-nowrap">
                          {item[0]}
                        </span>
                        <span className="font-medium text-gray-900 text-right">
                          {item[1]}
                        </span>
                      </div>
                    ) : (
                      <div key={`${idx}-${i}`} />
                    ),
                  ),
                )}
              </div>
            )}
          </div>

          {/* <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="font-semibold text-gray-900 text-sm">
              Customer Address
            </p>
            <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
          </div> */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Customer Address
            </p>
            <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
          </div>

          {order.deliveryInstructions ? (
            // <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            //   <p className="font-semibold text-gray-900 text-sm">
            //     Customer Message
            //   </p>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                Customer Message
              </p>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                {order.deliveryInstructions}
              </p>
            </div>
          ) : null}

          {isRelocationOrder ? (
            // <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
            //   <p className="font-semibold text-gray-900 text-sm">
            //     Relocation Address Details
            //   </p>
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Relocation Address Details
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {oldAddr.label || oldAddr.name || '-'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {oldAddr.address || '-'}
                  </p>
                  {oldAddr.phone ? (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Phone: {oldAddr.phone}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {isRelocationConfirmed ? 'Current Address' : 'New Address'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {newAddr.label || '-'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {[newAddr.addressLine, newAddr.area, newAddr.pincode]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                  {newAddr.phone ? (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Phone: {newAddr.phone}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Processing');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [savingBookingId, setSavingBookingId] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModal, setViewModal] = useState({ open: false, order: null });

  const fetchOrders = async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setError('Please login again to continue.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        apiGetAllOrders(token),
        apiGetAllServiceBookings(token),
      ]);
      setOrders(ordersRes.data || []);
      setServiceBookings(bookingsRes.data || []);
    } catch (err) {
      setOrders([]);
      setServiceBookings([]);
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // const normalizedOrders = useMemo(
  //   () =>
  //     (orders || []).map((o) => {
  //       const amount = (o.products || []).reduce(
  //         (s, i) =>
  //           s +
  //           Number(i.pricePerDay || 0) *
  //             Number(i.quantity || 0) *
  //             Number(o.rentalDuration || 0),
  //         0,
  //       );
  //       const lineItems = (o.products || []).map((i) => {
  //         const p = i.product;
  //         const rawName =
  //           p && typeof p === 'object' ? p.productName || p.title || '' : '';
  //         const imageFromProduct =
  //           p && typeof p === 'object' ? String(p.image || '').trim() : '';
  //         const hasUrlName = looksLikeUrl(rawName);
  //         const lineImage = imageFromProduct || (hasUrlName ? rawName : '');
  //         const safeName = hasUrlName ? 'Product' : rawName || 'Item';
  //         return {
  //           name: safeName,
  //           qty: Number(i.quantity || 1),
  //           image: lineImage,
  //         };
  //       });
  //       const lines = lineItems.map((x) => `${x.name} ×${x.qty}`);
  //       const primary = o.products?.[0]?.product;
  //       const productImage =
  //         primary && typeof primary === 'object' ? primary.image || '' : '';
  //       const productTypeSet = new Set(
  //         (o.products || [])
  //           .map((i) => {
  //             const p = i?.product;
  //             const populatedType =
  //               p && typeof p === 'object' ? String(p.type || '').trim() : '';
  //             if (populatedType) return populatedType;
  //             const snapshotType = String(i?.productType || '').trim();
  //             if (snapshotType) return snapshotType;
  //             return 'Rental';
  //           })
  //           .filter(Boolean),
  //       );
  //       const pickupLines = (o.products || []).filter((i) =>
  //         Boolean(
  //           i?.returnRequest?.pickupScheduledAt &&
  //           !i?.returnRequest?.refundInitiatedAt,
  //         ),
  //       );
  //       const pickupLineItems = pickupLines.map((i) => {
  //         const p = i.product;
  //         const rawName =
  //           p && typeof p === 'object' ? p.productName || p.title || '' : '';
  //         const imageFromProduct =
  //           p && typeof p === 'object' ? String(p.image || '').trim() : '';
  //         const hasUrlName = looksLikeUrl(rawName);
  //         const lineImage = imageFromProduct || (hasUrlName ? rawName : '');
  //         const safeName = hasUrlName ? 'Product' : rawName || 'Item';
  //         return {
  //           name: safeName,
  //           qty: Number(i.quantity || 1),
  //           image: lineImage,
  //         };
  //       });
  //       const pickupProductLines = pickupLineItems.map(
  //         (x) => `${x.name} ×${x.qty}`,
  //       );
  //       const pickupProductImage = pickupLineItems?.[0]?.image || '';
  //       return {
  //         ...o,
  //         amount,
  //         displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
  //         customerName: o.user?.fullName || o.name || '-',
  //         customerEmail: o.user?.emailAddress || '',
  //         productLines: lines.length ? lines : ['—'],
  //         productImage:
  //           String(productImage || '').trim() || lineItems?.[0]?.image || '',
  //         productLineItems: lineItems.length ? lineItems : [],
  //         pickupProductLines: pickupProductLines.length
  //           ? pickupProductLines
  //           : ['—'],
  //         pickupProductImage,
  //         hasScheduledReturnPickup: pickupLines.length > 0,
  //         productTypes: Array.from(productTypeSet),
  //       };
  //     }),
  //   [orders],
  // );

  // const normalizedOrders = useMemo(() => {
  //   const rows = [];
  //   for (const o of orders || []) {
  const normalizedOrders = useMemo(() => {
    const rows = [];

    // const orderNumberMap = new Map(
    //   [...(orders || [])]
    //     .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    //     .map((o, idx) => [String(o._id), idx + 1]),
    // );
    // const bookingNumberMap = new Map(
    //   [...(serviceBookings || [])]
    //     .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    //     .map((b, idx) => [String(b._id), idx + 1]),
    // );

    const sortedOrders = [...(orders || [])].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    );
    const sortedBookings = [...(serviceBookings || [])].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    );

    const orderNumberMap = new Map(
      sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
    );
    const bookingNumberMap = new Map(
      sortedBookings.map((b, idx) => [String(b._id), idx + 1]),
    );

    for (const o of sortedOrders) {
      const lines = (o.products || []).filter(
        (i) => i?.product && typeof i.product === 'object',
      );
      if (!lines.length) {
        // no populated lines — show order as single row
        rows.push({
          ...o,
          _rowId: `${o._id}-null`,
          // amount: 0,
          // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
          // customerName: o.user?.fullName || o.name || '-',
          // customerEmail: o.user?.emailAddress || '',
          // productName: '—',
          amount: 0,
          displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
          customerName: o.user?.fullName || o.name || '-',
          customerEmail: o.user?.emailAddress || '',
          productName: '—',
          productImage: '',
          productType: '—',
          lineStatus: o.status,
          hasScheduledReturnPickup: false,
          isPickupLine: false,
        });
        continue;
      }

      // for (const line of lines) {
      //   const p = line.product;
      //   const isSell =
      //     String(line?.productType || '').toLowerCase() === 'sell' ||
      //     String(p?.type || '').toLowerCase() === 'sell';
      //   const lineAmount =
      //     Number(line.pricePerDay || 0) * Number(line.quantity || 1);
      for (const line of lines) {
        const p = line.product;
        const isSell =
          String(line?.productType || '').toLowerCase() === 'sell' ||
          String(p?.type || '').toLowerCase() === 'sell';
        // Now matches vendor payout math: value - platform fee + deposit + taxes
        const lineBreakdown = computeAdminLineBreakdown(o, line);
        const lineAmount = lineBreakdown.payout;

        // const rawImage = String(p?.image || '').trim();
        // const isPickupLine =
        //   Boolean(line?.returnRequest?.pickupScheduledAt) &&
        //   !line?.returnRequest?.refundInitiatedAt;

        // const effectiveStatus = line?.lineStatus || o.status;
        const rawImage = String(p?.image || '').trim();

        const isPickupLine =
          Boolean(line?.returnRequest?.pickupScheduledAt) &&
          !line?.returnRequest?.refundInitiatedAt;

        const pickupDate = line?.returnRequest?.pickupScheduledAt || null;

        // Mirror vendor-side logic: once refund is initiated (QC + inspection
        // done), the return cycle is fully closed — treat as 'completed'
        const isReturnCompleted = Boolean(
          line?.returnRequest?.refundInitiatedAt,
        );

        const effectiveStatus = isReturnCompleted
          ? 'completed'
          : line?.lineStatus || o.status;

        // rows.push({
        //   ...o,
        //   _rowId: `${o._id}-${String(p?._id || Math.random())}`,
        //   // amount: lineAmount,
        //   // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
        //   // customerName: o.user?.fullName || o.name || '-',
        //   // customerEmail: o.user?.emailAddress || '',
        //   // productName: p?.productName || p?.title || 'Item',
        //   amount: lineAmount,
        //   displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
        //   customerName: o.user?.fullName || o.name || '-',
        //   customerEmail: o.user?.emailAddress || '',
        //   productName: p?.productName || p?.title || 'Item',
        //   productImage: rawImage,
        //   productQty: Number(line.quantity || 1),
        //   productType: isSell ? 'Buy' : 'Rent',
        //   lineStatus: effectiveStatus,
        //   hasScheduledReturnPickup: isPickupLine,
        //   isPickupLine,
        //   pickupDate,
        // });

        rows.push({
          ...o,
          _rowId: `${o._id}-${String(p?._id || Math.random())}`,
          // amount: lineAmount,
          // displayId: `ORD-${String(o._id).slice(-3).toUpperCase()}`,
          // customerName: o.user?.fullName || o.name || '-',
          // customerEmail: o.user?.emailAddress || '',
          // productName: p?.productName || p?.title || 'Item',
          amount: lineAmount,
          displayId: `ORD-${String(o.orderNumber || 0).padStart(4, '0')}`,
          customerName: o.user?.fullName || o.name || '-',
          customerEmail: o.user?.emailAddress || '',
          productName: p?.productName || p?.title || 'Item',
          productImage: rawImage,
          productQty: Number(line.quantity || 1),
          productType: isSell ? 'Buy' : 'Rent',
          lineStatus: effectiveStatus,
          hasScheduledReturnPickup: isPickupLine,
          isPickupLine,
          pickupDate,
          pendingDue: Math.max(0, Number(line?.pendingDue || 0)),
          // Used only in the order details modal breakdown
          productOnlyAmount: Math.max(0, lineBreakdown.productAmount),
          taxesAmount: Math.max(0, lineBreakdown.lineTaxes),
          refundableDeposit: resolveLineRefundableDeposit(line, o),
        });
      }
    }
    for (const booking of sortedBookings) {
      // Compute service booking taxes the same way the customer-facing
      // ServiceOrderSummaryAccordion does, so the invoice's "Other Taxes"
      // row can show a value for service bookings too.
      const svcTaxLines = Array.isArray(booking?.taxLines)
        ? booking.taxLines
        : [];
      const svcBreakdown = booking?.taxBreakdown || {};
      const svcComputedTaxTotal =
        svcTaxLines.length > 0
          ? svcTaxLines.reduce((s, t) => s + Number(t?.value || 0), 0)
          : [
              Number(svcBreakdown.gst || 0),
              Number(svcBreakdown.careTax || 0),
              Number(svcBreakdown.repairWarranty || 0),
              Number(svcBreakdown.relocationWarranty || 0),
              Number(svcBreakdown.deliveryPackaging || 0),
              Number(svcBreakdown.installationFee || 0),
              Number(svcBreakdown.platformFee || 0),
            ].reduce((s, v) => s + v, 0);

      rows.push({
        ...booking,
        _rowId: `service-${booking._id}`,
        amount: Number(booking.totalAmount || 0),
        // displayId: `SRV-${String(booking._id).slice(-3).toUpperCase()}`,
        displayId: `SRV-${String(booking.bookingNumber || 0).padStart(4, '0')}`,
        customerName: booking.user?.fullName || booking.name || '-',
        customerEmail: booking.user?.emailAddress || '',
        productName:
          booking.serviceSnapshot?.productName ||
          booking.serviceProduct?.productName ||
          'Service booking',
        productImage:
          booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
        productQty: 1,
        productType: 'Service',
        lineStatus: booking.status || 'pending',
        hasScheduledReturnPickup: false,
        isPickupLine: false,
        isServiceBooking: true,
        taxesAmount: Math.max(0, svcComputedTaxTotal),
      });
    }
    return rows;
  }, [orders, serviceBookings]);

  // const filteredOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const allowed = mapTabToStatuses(activeTab);
  //   return normalizedOrders.filter((o) => {
  //     if (activeTab === 'Pickup' && !o.hasScheduledReturnPickup) return false;
  //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) return false;
  //     const tabMatch = allowed.length
  //       ? allowed.includes(String(o.status))
  //       : true;
  //     if (!tabMatch) return false;
  //     if (!q) return true;
  //     const linesForSearch =
  //       activeTab === 'Pickup' ? o.pickupProductLines : o.productLines;
  //     const lineMatch = (linesForSearch || []).some((l) =>
  //       String(l).toLowerCase().includes(q),
  //     );
  //     return (
  //       String(o.displayId).toLowerCase().includes(q) ||
  //       String(o.customerName).toLowerCase().includes(q) ||
  //       String(o.customerEmail || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       lineMatch
  //     );
  //   });
  // }, [normalizedOrders, activeTab, query]);

  // const tabCounts = useMemo(() => {
  //   const list = normalizedOrders;
  //   const nonPickup = list.filter((x) => !x.hasScheduledReturnPickup);
  //   const shipped = list.filter((x) => String(x.status) === 'shipped').length;
  //   return {
  //     Processing: nonPickup.filter((x) =>
  //       ['pending', 'confirmed'].includes(String(x.status)),
  //     ).length,
  //     Dispatched: nonPickup.filter((x) => String(x.status) === 'shipped')
  //       .length,
  //     'In Transit': nonPickup.filter((x) => String(x.status) === 'shipped')
  //       .length,
  //     Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
  //       .length,
  //     Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
  //       .length,
  //     Pickup: list.filter((x) => x.hasScheduledReturnPickup).length,
  //   };
  // }, [normalizedOrders]);

  // const filteredOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const allowed = mapTabToStatuses(activeTab);
  //   return normalizedOrders.filter((o) => {
  //     if (activeTab === 'Services') {
  //       if (!o.isServiceBooking) return false;
  //     } else {
  //       if (o.isServiceBooking) return false;
  //       if (activeTab === 'Pickup' && !o.isPickupLine) return false;
  //       if (activeTab !== 'Pickup' && o.isPickupLine) return false;
  //       const tabMatch = allowed.length
  //         ? allowed.includes(String(o.lineStatus))
  //         : true;
  //       if (!tabMatch) return false;
  //     }
  //     if (!q) return true;
  //     return (
  //       String(o.displayId).toLowerCase().includes(q) ||
  //       String(o.customerName).toLowerCase().includes(q) ||
  //       String(o.customerEmail || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       String(o.productName).toLowerCase().includes(q)
  //     );
  //   });
  // }, [normalizedOrders, activeTab, query]);
  // const relocationOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const sortedOrders = [...(orders || [])].sort(
  //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  //   );
  //   const orderNumberMap = new Map(
  //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
  //   );
  //   const rows = flattenAllRelocationLines(sortedOrders, orderNumberMap);
  //   return rows.filter((o) => {
  //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
  //     if (
  //       statusFilter !== 'all' &&
  //       String(o.relocationRequest?.status || 'requested') !== statusFilter
  //     ) {
  //       return false;
  //     }
  //     if (!q) return true;
  //     return (
  //       String(o.displayId).toLowerCase().includes(q) ||
  //       String(o.customerName).toLowerCase().includes(q) ||
  //       String(o.customerEmail || '')
  //         .toLowerCase()
  //         .includes(q) ||
  //       String(o.productName).toLowerCase().includes(q) ||
  //       String(o.vendorName).toLowerCase().includes(q)
  //     );
  //   });
  // }, [orders, query, dateFilter, statusFilter]);

  const relocationOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sortedOrders = [...(orders || [])].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    );
    const orderNumberMap = new Map(
      sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
    );
    const rows = flattenAllRelocationLines(sortedOrders, orderNumberMap);
    return rows.filter((o) => {
      if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
      if (
        statusFilter !== 'all' &&
        String(o.relocationRequest?.status || 'requested') !== statusFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        String(o.displayId).toLowerCase().includes(q) ||
        String(o.customerName).toLowerCase().includes(q) ||
        String(o.customerEmail || '')
          .toLowerCase()
          .includes(q) ||
        String(o.productName).toLowerCase().includes(q) ||
        String(o.vendorName).toLowerCase().includes(q)
      );
    });
  }, [orders, query, dateFilter, statusFilter]);

  const relocationTotal = useMemo(
    () => relocationOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
    [relocationOrders],
  );

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allowed = mapTabToStatuses(activeTab);
    return normalizedOrders
      .filter((o) => {
        if (!matchesDateFilter(o.createdAt, dateFilter)) return false;

        if (activeTab === 'Services') {
          if (!o.isServiceBooking) return false;
          if (
            statusFilter !== 'all' &&
            serviceStatusLabel(o.lineStatus).toLowerCase() !== statusFilter
          ) {
            return false;
          }
        } else {
          if (o.isServiceBooking) return false;
          if (activeTab === 'Pickup' && !o.isPickupLine) return false;
          if (activeTab !== 'Pickup' && o.isPickupLine) return false;

          if (statusFilter !== 'all') {
            if (String(o.lineStatus) !== statusFilter) return false;
          } else {
            const tabMatch = allowed.length
              ? allowed.includes(String(o.lineStatus))
              : true;
            if (!tabMatch) return false;
          }
        }
        if (!q) return true;
        return (
          String(o.displayId).toLowerCase().includes(q) ||
          String(o.customerName).toLowerCase().includes(q) ||
          String(o.customerEmail || '')
            .toLowerCase()
            .includes(q) ||
          String(o.productName).toLowerCase().includes(q)
        );
      })
      .reverse(); // show newest orders first (page 1), oldest last
  }, [normalizedOrders, activeTab, query, dateFilter, statusFilter]);

  const tabCounts = useMemo(() => {
    const productRows = normalizedOrders.filter((x) => !x.isServiceBooking);
    const nonPickup = productRows.filter((x) => !x.isPickupLine);
    return {
      Processing: nonPickup.filter((x) =>
        ['confirmed', 'pending'].includes(String(x.lineStatus)),
      ).length,
      Dispatched: nonPickup.filter((x) => String(x.lineStatus) === 'shipped')
        .length,
      Delivered: nonPickup.filter((x) => String(x.lineStatus) === 'delivered')
        .length,
      Completed: nonPickup.filter((x) => String(x.lineStatus) === 'completed')
        .length,
      Pickup: productRows.filter((x) => x.isPickupLine).length,
      Relocate: 0, // computed separately below via relocationOrders
      Services: normalizedOrders.filter((x) => x.isServiceBooking).length,
      Cancelled: nonPickup.filter((x) => String(x.lineStatus) === 'cancelled')
        .length,
    };
  }, [normalizedOrders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  useEffect(() => {
    setPage(1);
  }, [activeTab, query, dateFilter, statusFilter]);

  useEffect(() => {
    setStatusFilter('all');
  }, [activeTab]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // const stats = useMemo(() => {
  //   const processing = normalizedOrders.filter((o) =>
  //     ['pending', 'confirmed'].includes(String(o.status)),
  //   ).length;
  //   const totalRevenue = normalizedOrders.reduce(
  //     (s, o) => s + Number(o.amount || 0),
  //     0,
  //   );

  console.log('Normalized orders:', normalizedOrders.length);

  console.log(
    'Pending lineStatus:',
    normalizedOrders.filter((o) => String(o.lineStatus) === 'pending').length,
  );

  // const stats = useMemo(() => {
  //   const processing = normalizedOrders.filter((o) =>
  //     ['confirmed', 'pending'].includes(String(o.lineStatus)),
  //   ).length;
  //   const totalRevenue = normalizedOrders.reduce(
  //     (s, o) => s + Number(o.amount || 0),
  //     0,
  //   );
  //   const averageOrder = normalizedOrders.length
  //     ? Math.round(totalRevenue / normalizedOrders.length)
  //     : 0;

  const stats = useMemo(() => {
    const processing = normalizedOrders.filter((o) =>
      ['confirmed', 'pending'].includes(String(o.lineStatus)),
    ).length;
    // Each product line in an order now shows the FULL order amount
    // (not divided per product), so summing every line would double/
    // triple-count orders with multiple products. Count each order's
    // amount only once (by order _id); service bookings are always
    // counted since each booking is its own separate transaction.
    const seenOrderIdsForRevenue = new Set();
    const totalRevenue = normalizedOrders.reduce((s, o) => {
      if (o.isServiceBooking) {
        return s + Number(o.amount || 0);
      }
      const orderId = String(o._id || '');
      if (orderId && seenOrderIdsForRevenue.has(orderId)) return s;
      if (orderId) seenOrderIdsForRevenue.add(orderId);
      return s + Number(o.amount || 0);
    }, 0);
    const averageOrder = normalizedOrders.length
      ? Math.round(totalRevenue / normalizedOrders.length)
      : 0;
    // const urgentActions = normalizedOrders.filter((o) => {
    //   const isOpen = !['completed', 'cancelled'].includes(String(o.status));
    //   if (!isOpen) return false;
    //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
    //   return ageMs > 24 * 60 * 60 * 1000;
    // }).length;

    const urgentActions = normalizedOrders.filter((o) => {
      return (
        String(o.lineStatus) === 'pending' &&
        Date.now() - new Date(o.createdAt || 0).getTime() > 24 * 60 * 60 * 1000
      );
    }).length;
    return { processing, totalRevenue, averageOrder, urgentActions };
  }, [normalizedOrders]);

  const filteredTotal = useMemo(
    () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
    [filteredOrders],
  );

  const pageTotal = useMemo(
    () => pageSlice.reduce((s, o) => s + Number(o.amount || 0), 0),
    [pageSlice],
  );

  const pagePendingDueTotal = useMemo(
    () => pageSlice.reduce((s, o) => s + Number(o.pendingDue || 0), 0),
    [pageSlice],
  );

  const pageFrom =
    filteredOrders.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const pageTo = Math.min(safePage * PAGE_SIZE, filteredOrders.length);

  const pageNumbers = useMemo(() => {
    const n = totalPages;
    if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
    const cur = safePage;
    const set = new Set([1, n, cur, cur - 1, cur + 1]);
    return Array.from(set)
      .filter((x) => x >= 1 && x <= n)
      .sort((a, b) => a - b);
  }, [totalPages, safePage]);

  const updateServiceStatus = async (bookingId, status) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token || !bookingId || !status) return;

    setSavingBookingId(bookingId);
    try {
      const res = await apiUpdateServiceBookingStatus(bookingId, status, token);
      setServiceBookings((prev) =>
        (prev || []).map((booking) =>
          booking._id === bookingId ? res.data : booking,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update service booking.',
      );
    } finally {
      setSavingBookingId('');
    }
  };

  return (
    <main className="space-y-4 sm:space-y-5">
      {/* <div>
        <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Read-only view of all customer orders.
        </p>
      </div> */}

      {loading ? (
        <div className="flex justify-center py-14">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-blue-100 p-4">
              <p className="text-xs text-gray-500">Total Processing</p>
              <p className="text-4xl font-semibold text-blue-600 mt-1">
                {stats.processing}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-4">
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-4xl font-semibold text-emerald-600 mt-1">
                {money(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-violet-100 p-4">
              <p className="text-xs text-gray-500">Average Order</p>
              <p className="text-4xl font-semibold text-violet-600 mt-1">
                {money(stats.averageOrder)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-orange-100 p-4">
              <p className="text-xs text-gray-500">Urgent Actions</p>
              <p className="text-4xl font-semibold text-orange-600 mt-1">
                {stats.urgentActions}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 space-y-4">
            <div className="flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border shrink-0 whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white border-gray-300 shadow-sm text-gray-900'
                      : 'border-transparent text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`min-w-[1.5rem] h-6 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                      activeTab === tab
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab === 'Relocate'
                      ? relocationOrders.length
                      : (tabCounts[tab] ?? 0)}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders, customers, email, products..."
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-1 flex-wrap sm:justify-end gap-3">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="last30">Last 30 Days</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
                >
                  {activeTab === 'Services' ? (
                    <>
                      <option value="all">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  ) : activeTab === 'Pickup' ? (
                    <option value="all">All Statuses</option>
                  ) : activeTab === 'Relocate' ? (
                    <>
                      <option value="all">All Statuses</option>
                      <option value="requested">Requested</option>
                      <option value="confirmed">Confirmed</option>
                    </>
                  ) : (
                    <>
                      <option value="all">All Statuses</option>
                      <option value="pending">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 overflow-hidden"></div>
            {activeTab === 'Relocate' ? (
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-gray-500">
                      <th className="px-4 py-3 text-center font-medium">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Products
                      </th>
                      {/* <th className="px-4 py-3 text-left font-medium">
                        Vendor
                      </th> */}
                      <th className="px-4 py-3 text-center font-medium">
                        Relocate Date
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Relocate Amount
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {relocationOrders.map((order) => (
                      <tr
                        key={order._rowId}
                        className="border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-center font-semibold text-gray-900">
                          {order.displayId}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          <div>{order.customerName}</div>
                          {/* {order.customerEmail ? (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {order.customerEmail}
                            </div>
                          ) : null} */}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-start gap-2">
                            {order.productImage ? (
                              <img
                                src={order.productImage}
                                alt=""
                                className="w-9 h-9 rounded-md object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
                            )}
                            <span className="text-gray-800">
                              {order.productName}
                            </span>
                          </div>
                        </td>
                        {/* <td className="px-4 py-3 text-gray-700">
                          {order.vendorName}
                        </td> */}
                        {/* <td className="px-4 py-3 text-gray-600">
                          {order.relocationRequest?.requestedAt
                            ? new Date(
                                order.relocationRequest.requestedAt,
                              ).toLocaleDateString('en-GB')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${
                              order.relocationRequest?.status === 'confirmed'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-blue-200 bg-blue-50 text-blue-700'
                            }`}
                          >
                            {order.relocationRequest?.status || 'requested'}
                          </span>
                        </td> */}
                        <td className="px-4 py-3 text-center text-gray-600">
                          {order.relocationRequest?.requestedAt
                            ? new Date(
                                order.relocationRequest.requestedAt,
                              ).toLocaleDateString('en-GB')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-900">
                          {money(order.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${
                              order.relocationRequest?.status === 'confirmed'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-blue-200 bg-blue-50 text-blue-700'
                            }`}
                          >
                            {order.relocationRequest?.status || 'requested'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setViewModal({ open: true, order })
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => generateOrderInvoicePDF(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* {relocationOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No relocation requests yet.
                        </td>
                      </tr>
                    )} */}
                    {/* {relocationOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No relocation requests yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : ( */}
                    {relocationOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No relocation requests yet.
                        </td>
                      </tr>
                    )}
                    {/* </tbody>
                  {relocationOrders.length > 0 && (
                    <tfoot>
                      <tr className="bg-[#F97316] text-white">
                        <td
                          colSpan={4}
                          className="px-4 py-3 text-center font-semibold"
                        >
                          Total
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {money(relocationTotal)}
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-sm"> */}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-gray-500">
                      <th className="px-4 py-3 text-center font-medium">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Products
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Type
                      </th>
                      <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                        {activeTab === 'Pickup' ? 'Pickup Date' : 'Order date'}
                      </th>
                      {activeTab === 'Pickup' ? (
                        <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                          Pending Due
                        </th>
                      ) : (
                        <th className="px-4 py-3 text-center font-medium">
                          Amount
                        </th>
                      )}
                      <th className="px-4 py-3 text-center font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map((order) => (
                      <tr
                        key={order._rowId}
                        className="border-t border-gray-100"
                      >
                        {/* <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top">
                          {order.displayId}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 align-top">
                          <div>{order.customerName}</div>
                          {order.customerEmail ? (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {order.customerEmail}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-left align-top">
                          <div className="flex items-center justify-start gap-2">
                            {order.productImage ? (
                              <img
                                src={order.productImage}
                                alt=""
                                className="w-9 h-9 rounded-md object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
                            )}
                            <span className="text-xs text-gray-800">
                              {order.productName}
                              {order.productQty > 1
                                ? ` ×${order.productQty}`
                                : ''}
                            </span>
                          </div>
                        </td> */}

                        <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top whitespace-nowrap">
                          {order.displayId}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 align-top">
                          <div>{order.customerName}</div>
                          {/* {order.customerEmail ? (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {order.customerEmail}
                            </div>
                          ) : null} */}
                        </td>
                        <td className="px-4 py-3 text-left align-top">
                          <div className="flex items-center justify-start gap-2">
                            {order.productImage ? (
                              <img
                                src={order.productImage}
                                alt=""
                                className="w-9 h-9 rounded-md object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-md bg-gray-100 shrink-0" />
                            )}
                            <span className="text-xs text-gray-800">
                              {order.productName}
                              {order.productQty > 1
                                ? ` ×${order.productQty}`
                                : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center align-top">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border ${
                              order.productType === 'Service'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : order.productType === 'Sell'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-orange-50 text-orange-800 border-orange-200'
                            }`}
                          >
                            {order.productType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 align-top whitespace-nowrap">
                          {order.isPickupLine && order.pickupDate
                            ? new Date(order.pickupDate).toLocaleDateString(
                                'en-GB',
                              )
                            : order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  'en-GB',
                                )
                              : '-'}
                        </td>
                        {activeTab === 'Pickup' ? (
                          <td className="px-4 py-3 text-center align-top whitespace-nowrap">
                            {order.pendingDue > 0 ? (
                              <span className="font-semibold text-red-600">
                                {money(order.pendingDue)}
                              </span>
                            ) : (
                              <span className="text-gray-400">₹0</span>
                            )}
                          </td>
                        ) : (
                          <td className="px-4 py-3 text-center font-semibold text-gray-900 align-top">
                            {money(order.amount)}
                          </td>
                        )}
                        <td className="px-4 py-3 text-center align-top whitespace-nowrap">
                          {order.isPickupLine ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border bg-blue-50 text-blue-800 border-blue-200 whitespace-nowrap">
                              Pickup Scheduled
                            </span>
                          ) : order.isServiceBooking ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${serviceStatusBadgeClass(order.lineStatus)}`}
                            >
                              {serviceStatusLabel(order.lineStatus)}
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${statusBadgeClass(order.lineStatus)}`}
                            >
                              {statusLabel(order.lineStatus)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center align-top">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setViewModal({ open: true, order })
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => generateOrderInvoicePDF(order)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={activeTab === 'Pickup' ? 9 : 8}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F97316] text-white">
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-center font-semibold"
                      >
                        {/* Total ({pageSlice.length} orders) */}
                        Total
                      </td>
                      {activeTab === 'Pickup' ? (
                        <td className="px-4 py-3 text-center font-semibold">
                          {money(pagePendingDueTotal)}
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-center font-semibold">
                          {money(pageTotal)}
                        </td>
                      )}
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          {activeTab !== 'Relocate' && totalPages > 1 ? (
            <nav
              className="flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous
              </button>
              <span className="min-w-[2.25rem] h-9 px-3 inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[#F97316] text-white shadow">
                {safePage}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
      <OrderDetailsModal
        open={viewModal.open}
        order={viewModal.order}
        onClose={() => setViewModal({ open: false, order: null })}
      />
    </main>
  );
};

export default Orders;
