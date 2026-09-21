// 'use client';

// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import Link from 'next/link';
// import {
//   AlertCircle,
//   BadgeCheck,
//   Camera,
//   Info,
//   CheckCircle2,
//   CircleAlert,
//   ClipboardCheck,
//   IndianRupee,
//   Package,
//   Package2,
//   Shield,
//   ShieldCheck,
//   Upload,
//   User,
//   Wrench,
//   Calendar,
//   X,
//   DollarSign,
//   Search,
//   ChevronDown,
//   Eye,
//   Download,
// } from 'lucide-react';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import {
//   apiCompleteVendorReturnInspection,
//   apiGetVendorOrders,
//   apiGetVendorServiceBookings,
//   apiUpdateVendorServiceBookingStatus,
//   apiUpdateVendorOrderStatus,
//   apiUpdateVendorLineStatus,
//   apiSendVendorDeliveryOtp,
//   apiVerifyVendorDeliveryOtp,
//   apiSendServiceCompletionOtp,
//   apiVerifyServiceCompletionOtp,
//   apiConfirmVendorRelocation,
// } from '@/service/api';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import VendorReturnRequestedModal from '../../Components/Modals/VendorReturnRequestedModal';
// import VendorNewOrderModal from '../../Components/Modals/VendorNewOrderModal';
// import jsPDF from 'jspdf';

// // const tabs = [
// //   'Processing',
// //   'Dispatched',
// //   'In Transit',
// //   'Cancelled',
// //   'Delivered',
// //   'Pickup',
// //   'Completed',
// //   'Services',
// // ];
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
// import totalVal from '@/assets/icons/total-val.png';
// import processOrder from '@/assets/icons/process-order.png';
// import totalOrdersIcon from '@/assets/icons/total-orders2.png';
// import ClipboardCheckIcon from '@/assets/icons/rtn-inspection.png';
// // const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// // const makeOtp = () => String(1000 + Math.floor(Math.random() * 9000));
// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// const makeOtp = () => String(1000 + Math.floor(Math.random() * 9000));

// const getServiceDisplayStatus = (status) => {
//   const s = String(status || '');
//   if (s === 'cancelled') return 'cancelled';
//   if (s === 'completed') return 'completed';
//   return 'scheduled';
// };

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

// function normalizeBool(v) {
//   if (v === true || v === false) return v;
//   if (typeof v === 'string') {
//     const x = v.trim().toLowerCase();
//     if (['true', 'yes', '1'].includes(x)) return true;
//     if (['false', 'no', '0'].includes(x)) return false;
//   }
//   return null;
// }

// function productRequiresInstallation(product) {
//   if (!product || typeof product !== 'object') return false;

//   // Prefer explicit backend flags when available.
//   const explicitCandidates = [
//     product?.requiresInstallation,
//     product?.installationRequired,
//     product?.logisticsVerification?.requiresInstallation,
//     product?.logisticsVerification?.installationRequired,
//     product?.logisticsVerification?.needsInstallation,
//   ];
//   for (const candidate of explicitCandidates) {
//     const parsed = normalizeBool(candidate);
//     if (parsed !== null) return parsed;
//   }

//   // Dynamic fallback by category + subcategory from product data.
//   const category = String(product?.category || '')
//     .trim()
//     .toLowerCase();
//   const subCategory = String(product?.subCategory || '')
//     .trim()
//     .toLowerCase();
//   const key = `${category} ${subCategory}`.trim();
//   if (!key) return false;

//   // Known non-installation families.
//   if (
//     /\b(mobile|smartphone|phone|cellphone|laptop|tablet|watch|earbud|headphone|charger|power bank)\b/.test(
//       key,
//     )
//   ) {
//     return false;
//   }

//   // Known installation-required families.
//   if (
//     /\b(ac|air conditioner|split ac|window ac|geyser|water heater|chimney|hob|cooktop|wall mount|tv mount)\b/.test(
//       key,
//     )
//   ) {
//     return true;
//   }

//   return false;
// }

// const mapTabToStatuses = (tab) => {
//   // if (tab === 'Processing') return ['pending', 'confirmed'];
//   if (tab === 'Processing') return ['confirmed', 'pending'];
//   if (tab === 'Dispatched') return ['shipped', 'in_progress'];
//   if (tab === 'In Transit') return ['shipped', 'in_progress'];
//   if (tab === 'Cancelled') return ['cancelled'];
//   //   if (tab === 'Delivered') return ['delivered'];
//   //   if (tab === 'Completed') return ['completed'];
//   //   if (tab === 'Pickup') return [];
//   //   if (tab === 'Services')
//   //     return ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
//   //   return [];
//   // };
//   if (tab === 'Delivered') return ['delivered'];
//   if (tab === 'Completed') return ['completed'];
//   if (tab === 'Pickup') return [];
//   if (tab === 'Services')
//     return ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
//   return [];
// };

// const statusDisplayLabel = (statusRaw) => {
//   const s = String(statusRaw || '');
//   if (s === 'pending') return 'Processing';
//   return s;
// };

// const statusBadgeClasses = (statusRaw) => {
//   const status = String(statusRaw || '').toLowerCase();
//   if (status === 'pending' || status === 'confirmed') {
//     return 'border-amber-200 bg-amber-50 text-amber-700';
//   }
//   if (status === 'shipped') {
//     return 'border-sky-200 bg-sky-50 text-sky-700';
//   }
//   if (status === 'in_progress') {
//     return 'border-blue-200 bg-blue-50 text-blue-700';
//   }
//   if (status === 'delivered') {
//     return 'border-emerald-200 bg-emerald-50 text-emerald-700';
//   }
//   // if (status === 'completed') {
//   //   return 'border-violet-200 bg-violet-50 text-violet-700';
//   // }
//   if (status === 'cancelled') {
//     return 'border-red-200 bg-red-50 text-red-700';
//   }
//   return 'border-gray-200 bg-gray-50 text-gray-700';
// };

// function getNextStepAction(order) {
//   if (order.isServiceBooking) {
//     return getServiceStatusMeta(order).nextStep;
//   }
//   const status = String(order.status || '');
//   if (status === 'completed') return null;
//   if (status === 'pending') return { label: 'Review', type: 'review' };
//   if (['pending', 'confirmed'].includes(status))
//     return { label: 'Packaging', type: 'packaging' };
//   if (status === 'shipped') return { label: 'Delivery', type: 'delivery' };
//   if (status === 'cancelled' && !order?.hasScheduledReturnPickup) {
//     if (Boolean(order?.returnRequest?.requestedAt)) {
//       return { label: 'Schedule', type: 'schedule' };
//     }
//     return null;
//   }
//   return null;
// }

// function StatusStepDropdown({ label, badgeClass, nextStep, onSelect }) {
//   const [open, setOpen] = useState(false);

//   if (!nextStep) {
//     return (
//       <span
//         className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${badgeClass}`}
//       >
//         {label}
//       </span>
//     );
//   }

//   return (
//     <div className="relative inline-block">
//       <button
//         type="button"
//         onClick={(e) => {
//           e.stopPropagation();
//           setOpen((v) => !v);
//         }}
//         className={`inline-flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${badgeClass}`}
//       >
//         {label}
//         <ChevronDown className="h-3 w-3" />
//       </button>
//       {open && (
//         <div
//           className="absolute z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <button
//             type="button"
//             onClick={() => {
//               setOpen(false);
//               onSelect(nextStep);
//             }}
//             className="w-full text-left px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
//           >
//             {nextStep.label} →
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function getRelocateStatusMeta(order) {
//   const status = order.relocationRequest?.status || 'requested';
//   const badgeClass =
//     status === 'confirmed'
//       ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//       : 'border-blue-200 bg-blue-50 text-blue-700';
//   const nextStep =
//     status === 'confirmed'
//       ? null
//       : { label: 'Confirm', type: 'relocate-confirm' };
//   return { label: status, badgeClass, nextStep };
// }

// function getServiceStatusMeta(order) {
//   const status = String(order.status || '');
//   if (status === 'cancelled') {
//     return {
//       label: 'Cancelled',
//       badgeClass: 'bg-red-50 text-red-600 border-red-200',
//       nextStep: null,
//     };
//   }
//   if (status === 'completed') {
//     return {
//       label: 'Completed',
//       badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//       nextStep: null,
//     };
//   }
//   if (status === 'confirmed' || status === 'in_progress') {
//     return {
//       label: 'Confirmed',
//       badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
//       nextStep: { label: 'Complete', type: 'service-complete' },
//     };
//   }
//   return {
//     label: 'Scheduled',
//     badgeClass: 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]',
//     nextStep: null,
//   };
// }

// function lineMatchesVendor(line, vendorIdStr) {
//   const p = line?.product;
//   if (!p || typeof p === 'string') return false;
//   const vid = p.vendorId?._id ?? p.vendorId;
//   return String(vid) === vendorIdStr;
// }

// function vendorScheduledReturnLine(order, vendorIdStr) {
//   return (order?.products || []).find((line) => {
//     if (!lineMatchesVendor(line, vendorIdStr)) return false;
//     return (
//       Boolean(line?.returnRequest?.pickupScheduledAt) &&
//       !line?.returnRequest?.refundInitiatedAt
//     );
//   });
// }

// function vendorReturnRequestedLine(order, vendorIdStr) {
//   return (order?.products || []).find((line) => {
//     if (!lineMatchesVendor(line, vendorIdStr)) return false;
//     return Boolean(line?.returnRequest?.requestedAt);
//   });
// }

// function vendorRelocationRequestedLine(order, vendorIdStr) {
//   return (order?.products || []).find((line) => {
//     if (!lineMatchesVendor(line, vendorIdStr)) return false;
//     return Boolean(line?.relocationRequest?.requestedAt);
//   });
// }

// function flattenVendorRelocationLines(orders, vendorIdStr, orderNumberMap) {
//   const rows = [];
//   for (const order of orders) {
//     const myLines = (order.products || []).filter(
//       (l) =>
//         lineMatchesVendor(l, vendorIdStr) &&
//         Boolean(l?.relocationRequest?.requestedAt),
//     );
//     for (const line of myLines) {
//       // const base = normalizeVendorOrderLine(
//       //   order,
//       //   line,
//       //   vendorIdStr,
//       //   orderNumberMap,
//       // );
//       // rows.push({
//       //   ...base,
//       //   _rowId: `reloc-${base._rowId}`,
//       //   relocationRequest: line.relocationRequest,
//       const base = normalizeVendorOrderLine(
//         order,
//         line,
//         vendorIdStr,
//         orderNumberMap,
//       );
//       rows.push({
//         ...base,
//         amount: 0, // Relocation amount is always static 0
//         _rowId: `reloc-${base._rowId}`,
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

// // // function normalizeVendorOrderLine(order, line, vendorIdStr) {
// // // function normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap) {
// // function normalizeVendorOrderLine(order, line, vendorIdStr) {
// // Mirrors the payout math shown in VendorNewOrderModal's Financial Summary:
// // order value - platform fee + refundable deposit + other taxes (gst,
// // care protection, repair/relocation warranty, delivery/installation fee).
// // Fee/tax fields are stored at order level, so when a vendor has multiple
// // lines in the same order, each line gets a proportional share based on
// // its value — this avoids double-counting the order-level fee across lines.
// // function computeVendorLinePayout(order, line, vendorIdStr) {
// //   const qty = Number(line?.quantity || 1);
// //   const rate = Number(line?.pricePerDay || 0);
// //   const lineValue = rate * qty;

// //   const vendorLines = (order?.products || []).filter((l) =>
// //     lineMatchesVendor(l, vendorIdStr),
// //   );
// //   const vendorTotal =
// //     vendorLines.reduce(
// //       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
// //       0,
// //     ) || 1;
// //   const share = lineValue / vendorTotal;

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

// //   return Math.max(0, lineValue - lineFee) + lineDeposit + lineTaxes;
// // }

// // function computeVendorLineBreakdown(order, line, vendorIdStr) {
// //   const qty = Number(line?.quantity || 1);
// //   const rate = Number(line?.pricePerDay || 0);
// //   const lineValue = rate * qty;

// //   const vendorLines = (order?.products || []).filter((l) =>
// //     lineMatchesVendor(l, vendorIdStr),
// //   );
// //   const vendorTotal =
// //     vendorLines.reduce(
// //       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
// //       0,
// //     ) || 1;
// //   const share = lineValue / vendorTotal;

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

// function computeVendorLineBreakdown(order, line, vendorIdStr) {
//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   const lineValue = rate * qty;

//   // Show the FULL order amount on every product line — same as the
//   // customer-facing "My Orders" page (which never divides fees/taxes
//   // per product when multiple products share one order). No more
//   // proportional "share" split across lines.
//   const vendorLines = (order?.products || []).filter((l) =>
//     lineMatchesVendor(l, vendorIdStr),
//   );
//   const vendorProductTotal = vendorLines.reduce(
//     (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
//     0,
//   );
//   const vendorDepositTotal = vendorLines.reduce(
//     (s, l) => s + Math.max(0, Number(l?.refundableDeposit || 0)),
//     0,
//   );

//   // const orderPlatformFee = Number(order?.platformFee || 0);
//   // const otherTaxes =
//   //   Number(order?.gst || 0) +
//   //   Number(order?.careProtection || 0) +
//   //   Number(order?.repairWarranty || 0) +
//   //   Number(order?.relocationWarranty || 0) +
//   //   Number(order?.deliveryPackaging || 0) +
//   //   Number(order?.installationFee || 0);

//   // const lineDeposit = Number(line?.refundableDeposit || 0);

//   // const fullPayout =
//   //   Math.max(0, vendorProductTotal - orderPlatformFee) +
//   //   vendorDepositTotal +
//   //   otherTaxes;

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
//     Math.max(0, vendorProductTotal - orderPlatformFee - discountAmount) +
//     vendorDepositTotal +
//     otherTaxes;

//   return {
//     productAmount: lineValue,
//     lineFee: orderPlatformFee,
//     lineTaxes: otherTaxes,
//     lineDeposit,
//     payout: fullPayout,
//   };
// }

// function computeVendorLinePayout(order, line, vendorIdStr) {
//   return computeVendorLineBreakdown(order, line, vendorIdStr).payout;
// }

// // function normalizeVendorOrderLine(order, line, vendorIdStr) {
// // function normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap) {
// function normalizeVendorOrderLine(order, line, vendorIdStr) {
//   const product = line?.product;

//   const isSell =
//     String(line?.productType || '').toLowerCase() === 'sell' ||
//     String(product?.type || '').toLowerCase() === 'sell';

//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   // Per-product price only — never multiply by duration here.
//   // Duration-based totals belong in settlement/payout views, not the order table.
//   // Monthly-tenure rental lines store the FULL tenure price in pricePerDay
//   // (e.g. 3 months x 400 = 1200); the customer only pays the first month at
//   // checkout, so show that same first-month amount in the vendor table.
//   // const tenureUnit = String(order?.tenureUnit || 'month').toLowerCase();
//   // const rentalMonths = Math.max(1, Number(order?.rentalDuration || 1));
//   // const lineAmount =
//   //   !isSell && tenureUnit !== 'day' ? (rate / rentalMonths) * qty : rate * qty;
//   // // pricePerDay already stores the per-month rent for monthly rentals,
//   // // so use it directly — don't divide by rentalMonths.
//   // const lineAmount = rate * qty;
//   // pricePerDay already stores the per-month rent for monthly rentals,
//   // so use it directly — don't divide by rentalMonths.
//   // Table now shows vendor's final payout (value - platform fee + deposit
//   // + other taxes), matching the New Order modal's Financial Summary.
//   const lineBreakdown = computeVendorLineBreakdown(order, line, vendorIdStr);
//   const lineAmount = lineBreakdown.payout;

//   const isScheduled =
//     Boolean(line?.returnRequest?.pickupScheduledAt) &&
//     !line?.returnRequest?.refundInitiatedAt;

//   // ── KEY FIX: if line has a return request submitted but not yet
//   // scheduled for pickup, treat it as 'cancelled' so it appears
//   // in the Cancelled tab with a "Schedule" action button ──
//   // const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
//   // const isReturnPendingSchedule =
//   //   hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

//   // const effectiveStatus = isReturnPendingSchedule
//   //   ? 'cancelled' // force into Cancelled tab → Schedule button
//   //   : line?.lineStatus || order.status;

//   const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
//   const isReturnPendingSchedule =
//     hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

//   // If refund has been initiated (QC + inspection done), the return cycle
//   // is fully closed — treat as 'completed' so it vanishes from Delivered tab
//   const isReturnCompleted = Boolean(line?.returnRequest?.refundInitiatedAt);

//   const effectiveStatus = isReturnCompleted
//     ? 'completed' // hide from Delivered tab
//     : isReturnPendingSchedule
//       ? 'cancelled' // Cancelled tab → Schedule button
//       : line?.lineStatus || order.status;

//   return {
//     ...order,
//     _rowId: `${order._id}-${String(product?._id || line?._id || Math.random())}`,
//     status: effectiveStatus,
//     orderType: isSell ? 'Buy' : 'Rent',
//     amount: lineAmount,
//     // displayId: `ORD-${String(order._id).slice(-3).toUpperCase()}`,
//     // displayId: `ORD-${String(orderNumberMap?.get(String(order._id)) || 0).padStart(3, '0')}`,
//     displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//     customerName: order.user?.fullName || order.name || '-',
//     productName: product?.productName || 'Product',
//     // productImage: product?.image || '',
//     productImage: (() => {
//       const variantName = line?.variantName || '';
//       const variantId = line?.variantId;
//       const variants = Array.isArray(product?.variants) ? product.variants : [];
//       const allImgs = Array.isArray(product?.images)
//         ? product.images.filter(Boolean)
//         : [];
//       if (
//         (variantId || variantName) &&
//         variants.length > 0 &&
//         allImgs.length > 1
//       ) {
//         const matchedIdx = variants.findIndex(
//           (v) =>
//             (variantId && String(v?._id || '') === String(variantId)) ||
//             (variantName && String(v?.variantName || '') === variantName),
//         );

//         if (matchedIdx !== -1) {
//           const perVariant = Math.ceil(allImgs.length / variants.length);
//           const start = matchedIdx * perVariant;
//           const slice = allImgs.slice(start, start + perVariant);
//           if (slice[0]) return slice[0];
//         }
//       }
//       return product?.images?.[0] || product?.image || '';
//     })(),
//     variantName: line?.variantName || '',
//     variantId: line?.variantId || null,
//     primaryProduct: product || null,
//     primaryLine: line || null,
//     // refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//     // returnRequest: line?.returnRequest || {},
//     refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//     // Frozen late-fee amount (if any) at the moment return was requested —
//     // defaults to 0 for lines that never had a pending due.
//     pendingDue: Math.max(0, Number(line?.pendingDue || 0)),
//     // Used only in the order details modal, so "Amount" shows just the
//     // product's own price, with taxes shown as a separate field.
//     productOnlyAmount: Math.max(0, lineBreakdown.productAmount),
//     taxesAmount: Math.max(0, lineBreakdown.lineTaxes),
//     returnRequest: line?.returnRequest || {},
//     relocationRequest: line?.relocationRequest || {},
//     hasScheduledReturnPickup: isScheduled,
//   };
// }

// // function flattenVendorOrderLines(orders, vendorIdStr) {
// //   const rows = [];
// //   for (const order of orders) {
// //     const myLines = (order.products || []).filter((l) =>
// //       lineMatchesVendor(l, vendorIdStr),
// //     );
// //     if (!myLines.length) continue;
// //     for (const line of myLines) {
// //       rows.push(normalizeVendorOrderLine(order, line, vendorIdStr));
// //     }
// //   }
// //   return rows;
// // }

// // function flattenVendorOrderLines(orders, vendorIdStr, orderNumberMap) {
// //   const rows = [];
// //   for (const order of orders) {
// //     const myLines = (order.products || []).filter((l) =>
// //       lineMatchesVendor(l, vendorIdStr),
// //     );
// //     if (!myLines.length) continue;
// //     for (const line of myLines) {
// //       rows.push(
// //         normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap),
// //       );
// //     }
// //   }
// //   return rows;
// // }

// function flattenVendorOrderLines(orders, vendorIdStr) {
//   const rows = [];
//   for (const order of orders) {
//     const myLines = (order.products || []).filter((l) =>
//       lineMatchesVendor(l, vendorIdStr),
//     );
//     if (!myLines.length) continue;
//     for (const line of myLines) {
//       rows.push(normalizeVendorOrderLine(order, line, vendorIdStr));
//     }
//   }
//   return rows;
// }

// function DeliveryVerificationModal({
//   open,
//   order,
//   otp,
//   otpInput,
//   setOtpInput,
//   installationDone,
//   setInstallationDone,
//   confirming,
//   onClose,
//   onConfirm,
//   otpSent,
//   sendingOtp,
//   onSendOtp,
//   kycBlockedMessage,
// }) {
//   const otpInputRef = useRef(null);
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
//   const productTitle = order.productName || 'Product';
//   const firstSku = `SKU-${String(order._id || '')
//     .slice(-6)
//     .toUpperCase()}`;
//   const requiresInstallation = productRequiresInstallation(
//     order.primaryProduct,
//   );
//   const orderValue = Number(order.amount || 0);
//   const payoutValue = Number(order.amount || 0);
//   // const otpOk = otpInput.length === 4 && otpInput === otp;
//   // const canConfirm =
//   //   otpOk && (!requiresInstallation || installationDone) && !confirming;
//   const otpOk = otpInput.length === 4; // server verifies the actual value
//   const canConfirm =
//     otpOk &&
//     otpSent &&
//     (!requiresInstallation || installationDone) &&
//     !confirming;

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[20px] bg-white border border-gray-200 shadow-2xl overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3">
//             <div className="flex items-start gap-3">
//               <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white">
//                 <ShieldCheck className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-lg leading-[1.05] font-semibold text-gray-900">
//                   Delivery Verification
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   Confirm handover with customer OTP
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
//               aria-label="Close delivery verification"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//             <p className="text-gray-600 inline-flex items-center gap-2">
//               <Package className="h-4 w-4 text-gray-400" />
//               <span className="text-gray-400">Order:</span>{' '}
//               <span className="font-semibold text-gray-900">
//                 #{order.displayId}
//               </span>
//             </p>
//             <p className="text-gray-600 inline-flex items-center gap-2">
//               <User className="h-4 w-4 text-gray-400" />
//               <span className="text-gray-400">Customer:</span>{' '}
//               <span className="font-semibold text-gray-900">
//                 {order.customerName || '-'}
//               </span>
//             </p>
//           </div>

//           <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             <p className="font-semibold text-black text-sm inline-flex items-center gap-2">
//               <Package className="h-4 w-4 text-gray-500" />
//               Items Being Delivered
//             </p>
//             <div className="mt-2 flex items-start justify-between gap-3">
//               <div>
//                 <p className="text-sm text-black font-medium">{productTitle}</p>
//                 <p className="text-xs text-gray-400 mt-0.5">SKU : {firstSku}</p>
//               </div>
//               {requiresInstallation ? (
//                 <span className="shrink-0 rounded-md border border-[#8EC5FF] bg-[#DBEAFE] px-2 py-1 text-[11px] font-semibold text-[#1447E6]">
//                   Requires Installation
//                 </span>
//               ) : null}
//             </div>
//           </div>

//           {/* <div className="mt-4">
//             <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
//               <ShieldCheck className="h-4 w-4 text-orange-500" />
//               Proof of Delivery (OTP)
//             </p>
//             <p className="mt-1 text-sm text-gray-600">
//               Ask the customer for the 4-digit OTP sent to their phone
//             </p>
//             <div
//               className="mt-3 flex items-center justify-center gap-3"
//               onClick={() => otpInputRef.current?.focus()}
//             >
//               {[0, 1, 2, 3].map((idx) => (
//                 <div
//                   key={idx}
//                   className="h-12 w-12 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-900 flex items-center justify-center"
//                 >
//                   {otpInput[idx] ? (
//                     otpInput[idx]
//                   ) : (
//                     <span className="text-gray-300">•</span>
//                   )}
//                 </div>
//               ))}
//               <input
//                 ref={otpInputRef}
//                 value={otpInput}
//                 onChange={(e) =>
//                   setOtpInput(
//                     String(e.target.value || '')
//                       .replace(/\D/g, '')
//                       .slice(0, 4),
//                   )
//                 }
//                 className="sr-only"
//                 inputMode="numeric"
//                 autoComplete="one-time-code"
//               />
//             </div>
//             <p className="mt-2 text-center text-xs text-gray-500">
//               Dummy OTP for test:{' '}
//               <span className="font-semibold tracking-widest">{otp}</span>
//             </p>
//             <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
//               <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
//               The customer received this OTP via SMS when the order was marked
//               as &quot;Out for Delivery&quot;. This confirms they have received
//               the items.
//             </div>
//           </div> */}

//           <div className="mt-4">
//             <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
//               <ShieldCheck className="h-4 w-4 text-orange-500" />
//               Proof of Delivery (OTP)
//             </p>
//             {/* <p className="mt-1 text-sm text-gray-600">
//               Send OTP to customer&apos;s email, then ask them for the code.
//             </p> */}
//             <p className="mt-1 text-sm text-gray-600">
//               Ask the customer for the 4-digit OTP sent to their gmail.
//             </p>

//             {/* Send / Resend OTP button */}
//             {kycBlockedMessage ? (
//               <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
//                 <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
//                 <span>
//                   <span className="font-semibold block">Delivery Blocked</span>
//                   <span className="block text-xs text-red-700 mt-1">
//                     {kycBlockedMessage}
//                   </span>
//                 </span>
//               </div>
//             ) : (
//               <button
//                 type="button"
//                 onClick={onSendOtp}
//                 disabled={sendingOtp}
//                 className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-800 text-sm font-semibold hover:bg-orange-100 disabled:opacity-50"
//               >
//                 {sendingOtp
//                   ? 'Sending...'
//                   : otpSent
//                     ? 'Resend OTP'
//                     : 'Send OTP to Customer'}
//               </button>
//             )}

//             {otpSent && (
//               <>
//                 <div
//                   className="mt-4 flex items-center justify-center gap-3"
//                   onClick={() => otpInputRef.current?.focus()}
//                 >
//                   {[0, 1, 2, 3].map((idx) => (
//                     <div
//                       key={idx}
//                       className="h-12 w-12 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-900 flex items-center justify-center"
//                     >
//                       {otpInput[idx] ? (
//                         otpInput[idx]
//                       ) : (
//                         <span className="text-gray-300">•</span>
//                       )}
//                     </div>
//                   ))}
//                   <input
//                     ref={otpInputRef}
//                     value={otpInput}
//                     onChange={(e) =>
//                       setOtpInput(
//                         String(e.target.value || '')
//                           .replace(/\D/g, '')
//                           .slice(0, 4),
//                       )
//                     }
//                     className="sr-only"
//                     inputMode="numeric"
//                     autoComplete="one-time-code"
//                   />
//                 </div>
//                 {/* <p className="mt-2 text-center text-xs text-gray-500">
//                   OTP sent to customer&apos;s email. Valid for 10 minutes.
//                 </p> */}
//                 {/* <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
//                   <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
//                   Ask the customer for the OTP they received on their registered
//                   email.
//                 </div> */}
//                 <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
//                   <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
//                   The customer receives this OTP via their registered email.
//                   This confirms that they have received the items.
//                 </div>
//               </>
//             )}
//           </div>

//           {requiresInstallation ? (
//             <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
//               {/* header */}
//               <div className="flex items-start gap-3">
//                 <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#9810FA]">
//                   <Wrench className="h-5 w-5" />
//                 </span>

//                 <div>
//                   <p className="font-semibold text-gray-900">
//                     Installation Required
//                   </p>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Some items need installation before delivery completion
//                   </p>
//                 </div>
//               </div>

//               {/* items */}
//               {/* <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
//                 <p className="text-[11px] uppercase tracking-wide text-gray-400">
//                   Items to install
//                 </p>
//                 <p className="mt-1 text-sm text-gray-800">{productTitle}</p>
//               </div> */}
//               <div className="mt-3 rounded-lg border border-[#DAB2FF] bg-white px-3 py-2.5">
//                 <p className="text-[11px] uppercase tracking-wide text-gray-400">
//                   Items to install
//                 </p>

//                 <div className="mt-1 flex items-center gap-2">
//                   <span className="h-2 w-2 rounded-full bg-[#9810FA]" />
//                   <p className="text-sm font-medium text-black">
//                     {productTitle}
//                   </p>
//                 </div>
//               </div>

//               {/* checkbox */}
//               <label className="mt-3 flex items-start gap-3 rounded-xl border border-[#DAB2FF] bg-white px-3 py-2.5 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={installationDone}
//                   onChange={(e) =>
//                     setInstallationDone(Boolean(e.target.checked))
//                   }
//                   className="mt-0.5 h-5 w-5 rounded border-[#C27AFF] text-violet-600 focus:ring-violet-500"
//                 />
//                 <span>
//                   <span className="text-sm font-semibold text-gray-900">
//                     Installation Completed{' '}
//                     <span className="text-red-500">*</span>
//                   </span>
//                   <span className="block text-xs text-gray-500">
//                     Check this box after completing installation and testing
//                   </span>
//                 </span>
//               </label>
//             </div>
//           ) : null}

//           {/* <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
//               <IndianRupee className="h-4 w-4 text-orange-500" />
//               Settlement Preview
//             </p>
//             <div className="mt-2 flex items-center justify-between text-sm">
//               <span className="text-gray-500">Order Value</span>
//               <span className="font-semibold text-gray-900">
//                 {money(orderValue)}
//               </span>
//             </div>
//             <div className="mt-3 rounded-lg border border-[#FFB86A] bg-[#FFFBEB] px-3 py-2.5 flex items-center justify-between">
//               <span className="text-sm font-semibold text-[#9F2D00]">
//                 Your Payout
//               </span>
//               <span className="text-2xl font-bold text-amber-700">
//                 {money(payoutValue)}
//               </span>
//             </div>

//             <div className="mt-2 flex items-start gap-1 text-xs text-gray-500">
//               <Calendar className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
//               <p>
//                 Will move to{' '}
//                 <span className="text-black font-semibold">
//                   Pending Settlement
//                 </span>{' '}
//                 after delivery confirmation
//               </p>
//             </div>
//           </div> */}

//           {!canConfirm ? (
//             <div className="mt-4 rounded-xl border border-[#FFD230] bg-[#FFFBEB] px-3 py-2.5 text-sm text-amber-900 flex gap-2">
//               <CircleAlert className="h-4 w-4 mt-0.5 text-[#E17100] shrink-0" />
//               <span>
//                 <span className="font-semibold text-[#7B3306] block">
//                   Complete Required Steps
//                 </span>
//                 <span className="block text-[#973C00] text-xs mt-1">
//                   {otpOk ? '✓' : '✗'} Enter the 4-digit OTP from customer
//                 </span>
//                 {requiresInstallation ? (
//                   <span className="block text-[#973C00] text-xs">
//                     {installationDone ? '✓' : '✗'} Confirm installation is
//                     completed
//                   </span>
//                 ) : null}
//               </span>
//             </div>
//           ) : (
//             // <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 flex gap-2">
//             //   <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
//             //   <span>OTP verified. Ready to confirm delivery.</span>
//             // </div>
//             <div></div>
//           )}

//           <button
//             type="button"
//             disabled={!canConfirm}
//             onClick={onConfirm}
//             className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white enabled:hover:bg-[#e56400] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2"
//           >
//             {confirming ? (
//               'Confirming...'
//             ) : (
//               <>
//                 <CheckCircle2 className="h-4 w-4" />
//                 Confirm Delivery
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ReturnInspectionModal({
//   open,
//   order,
//   checklist,
//   setChecklist,
//   pickupPhotoName,
//   setPickupPhotoName,
//   damageDeduction,
//   setDamageDeduction,
//   cleaningFees,
//   setCleaningFees,
//   authorizeRefund,
//   setAuthorizeRefund,
//   submitting,
//   onClose,
//   onSubmit,
// }) {
//   const [pickupPhotoPreview, setPickupPhotoPreview] = useState('');

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

//   useEffect(() => {
//     return () => {
//       if (pickupPhotoPreview) {
//         URL.revokeObjectURL(pickupPhotoPreview);
//       }
//     };
//   }, [pickupPhotoPreview]);

//   if (!open || !order) return null;

//   const depositHeld = Math.max(0, Number(order?.refundableDeposit || 0));
//   const safeDamage = Math.max(0, Number(damageDeduction || 0));
//   const safeCleaning = Math.max(0, Number(cleaningFees || 0));
//   const finalRefundAmount = Math.max(
//     0,
//     depositHeld - safeDamage - safeCleaning,
//   );
//   const canSubmit = Boolean(pickupPhotoName && authorizeRefund) && !submitting;
//   const originalPhotoTakenOn = (() => {
//     const src = order?.primaryProduct?.createdAt || order?.createdAt;
//     if (!src) return '—';
//     const d = new Date(src);
//     if (Number.isNaN(d.getTime())) return '—';
//     return d.toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });
//   })();

//   const checklistRows = [
//     {
//       key: 'powerFunctionCheck',
//       label: 'Power / Function Check',
//       hint: 'All features working as expected',
//     },
//     {
//       key: 'surfaceScratches',
//       label: 'Surface Scratches',
//       hint: 'Visible scratches or scuff marks',
//     },
//     {
//       key: 'structuralIntegrity',
//       label: 'Structural Integrity',
//       hint: 'Frame and build quality intact',
//     },
//     {
//       key: 'accessoriesAccountedFor',
//       label: 'Accessories Accounted For',
//       hint: 'All included items returned',
//     },
//     {
//       key: 'cleanlinessCheck',
//       label: 'Cleanliness Check',
//       hint: 'Item returned in clean condition',
//     },
//   ];

//   return (
//     <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
//             <div className="flex items-start gap-3">
//               {/* <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F54900] to-[#F97316] text-white shadow-sm">
//                 <ClipboardCheck className="h-7 w-7" />
//               </span> */}
//               <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F54900] to-[#F97316] shadow-sm">
//                 <img
//                   src={ClipboardCheckIcon.src}
//                   alt="Clipboard Check"
//                   className="w-7 h-7 shrink-0 brightness-0 invert"
//                 />
//               </span>
//               <div>
//                 <h2 className="text-xl font-semibold leading-tight text-gray-900">
//                   Return Inspection: Order #{order.displayId}
//                 </h2>
//                 <p className="mt-0.5 text-sm text-gray-500">
//                   {order.customerName} - {order.productName}
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
//               aria-label="Close inspection"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           <div className="mt-4">
//             <h3 className="text-xl font-semibold leading-[1.1] text-gray-900">
//               Condition Comparison
//             </h3>
//             <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <p className="text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
//                   <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
//                   Original Delivery Condition
//                 </p>
//                 <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2.5">
//                   <div className="relative h-[208px] rounded-lg bg-gray-100 overflow-hidden">
//                     {order.productImage ? (
//                       <img
//                         src={order.productImage}
//                         alt=""
//                         className="h-full w-full object-cover"
//                       />
//                     ) : null}
//                     <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
//                       DELIVERED
//                     </span>
//                   </div>
//                 </div>
//                 <p className="mt-2 text-[11px] text-gray-400">
//                   Photo taken on: {originalPhotoTakenOn}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
//                   <Camera className="h-3.5 w-3.5 text-orange-500" />
//                   New Pickup Photo <span className="text-red-600">*</span>
//                 </p>
//                 <label className="mt-2 flex h-[232px] cursor-pointer flex-col items-center justify-center rounded-xl border border-[#99A1AF] bg-[#F9FAFB] text-sm text-gray-600 hover:bg-gray-50">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (pickupPhotoPreview) {
//                         URL.revokeObjectURL(pickupPhotoPreview);
//                       }
//                       if (file) {
//                         setPickupPhotoName(file.name);
//                         setPickupPhotoPreview(URL.createObjectURL(file));
//                       } else {
//                         setPickupPhotoName('');
//                         setPickupPhotoPreview('');
//                       }
//                     }}
//                   />
//                   {pickupPhotoPreview ? (
//                     <img
//                       src={pickupPhotoPreview}
//                       alt="Pickup preview"
//                       className="h-full w-full rounded-xl object-cover"
//                     />
//                   ) : (
//                     <>
//                       <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316] text-white shadow-sm">
//                         <Upload className="h-5 w-5" />
//                       </span>
//                       <span className="mt-3 text-[17px] font-semibold text-gray-900">
//                         Upload Pickup Photo
//                       </span>
//                       <span className="mt-1 text-[13px] text-gray-500">
//                         Click or drag to upload
//                       </span>
//                     </>
//                   )}
//                 </label>
//                 <p className="mt-2 text-[11px] text-gray-400">
//                   {/* {pickupPhotoName || 'No file selected'} */}
//                   {pickupPhotoName || 'Upload required to proceed'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-5  p-4">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Inspection Checklist
//             </h3>
//             <div className="mt-4 rounded-xl border border-[#D1D5DC] bg-[#F9FAFB] px-4 py-3">
//               {checklistRows.map((row) => (
//                 <label
//                   key={row.key}
//                   className="flex items-center justify-between py-2"
//                 >
//                   <span>
//                     <span className="block text-[15px] leading-[1.15] font-semibold text-gray-900">
//                       {row.label}
//                     </span>
//                     <span className="block text-[12px] leading-[1.2] text-gray-500">
//                       {row.hint}
//                     </span>
//                   </span>
//                   <span className="relative inline-flex h-8 w-14 items-center">
//                     <input
//                       type="checkbox"
//                       checked={Boolean(checklist[row.key])}
//                       onChange={(e) =>
//                         setChecklist((prev) => ({
//                           ...prev,
//                           [row.key]: Boolean(e.target.checked),
//                         }))
//                       }
//                       className="peer sr-only"
//                     />
//                     <span className="absolute inset-0 rounded-full bg-gray-200 transition peer-checked:bg-[#10B981]" />
//                     <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-6" />
//                   </span>
//                 </label>
//               ))}

//               <div className="mt-2 rounded-xl border border-[#8EC5FF] bg-[#EFF6FF] px-4 py-3">
//                 <p className="inline-flex items-center gap-2 text-[15px] font-semibold leading-[1.1] text-gray-900">
//                   <Shield className="h-5 w-5 text-[#2563EB]" />
//                   Rentnpay Care Protection
//                 </p>
//                 <p className="mt-1 text-[12px] leading-[1.3] text-gray-500">
//                   Minor wear (scratches &lt;2cm, light scuff marks) is covered
//                   by Rentnpay Care and should not be deducted from the
//                   customer&apos;s deposit.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-5">
//             <h3 className="inline-flex items-center gap-1 text-base font-semibold text-gray-900">
//               <DollarSign className="h-4 w-4 text-[#10B981]" />
//               Refund &amp; Deduction Calculator
//             </h3>

//             <div className="mt-3 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
//               <div className="flex items-center justify-between border-b border-gray-200 pb-3">
//                 <span className="text-sm leading-[1.15] text-gray-500">
//                   Total Deposit Held
//                 </span>
//                 <span className="text-[34px] font-semibold leading-none text-gray-900">
//                   {money(depositHeld)}
//                 </span>
//               </div>

//               <div className="mt-4">
//                 <label className="text-sm font-semibold leading-[1.15] text-gray-900">
//                   Damage Deduction
//                 </label>
//                 <div className="mt-2 relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EF4444] font-semibold  text-sm">
//                     ₹
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={damageDeduction}
//                     onChange={(e) => setDamageDeduction(e.target.value)}
//                     className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm"
//                   />
//                 </div>
//                 <p className="mt-1 text-sm leading-[1.3] text-gray-500">
//                   Amount deducted for repair/replacement costs
//                 </p>
//               </div>

//               <div className="mt-3">
//                 <label className="text-[15px] font-semibold leading-[1.15] text-gray-900">
//                   Cleaning Fees
//                 </label>
//                 <div className="mt-2 relative max-w-[420px]">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EF4444] font-semibold text-sm">
//                     ₹
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={cleaningFees}
//                     onChange={(e) => setCleaningFees(e.target.value)}
//                     className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm"
//                   />
//                 </div>
//               </div>

//               <div className="mt-4 border-t border-gray-200 pt-4">
//                 <div className="rounded-xl border border-[#05DF72] bg-[#ECFDF5] px-4 py-3 flex items-center justify-between">
//                   <div>
//                     <p className="text-[15px] font-semibold leading-[1.15] text-black">
//                       Final Refund Amount
//                     </p>
//                     <p className="mt-1 text-[12px] leading-[1.3] text-[#64748B]">
//                       Amount to be refunded to customer&apos;s account
//                     </p>
//                   </div>
//                   <span className="text-[34px] font-bold leading-none text-emerald-600">
//                     {money(finalRefundAmount)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-5 p-4">
//             <h3 className="text-base font-semibold text-black">
//               Authorization
//             </h3>
//             <label className="mt-3 flex items-start gap-3 rounded-lg border border-[#D1D5DC] px-3 py-2.5">
//               <input
//                 type="checkbox"
//                 checked={authorizeRefund}
//                 onChange={(e) => setAuthorizeRefund(Boolean(e.target.checked))}
//                 className="mt-0.5 h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//               />
//               <span>
//                 <span className="block text-sm font-semibold text-gray-800">
//                   I verify that the inspection is complete and authorize the
//                   refund of {money(finalRefundAmount)}.
//                 </span>
//                 <span className="mt-1 block text-xs text-gray-500">
//                   By checking this box, you confirm all inspection details are
//                   accurate and the refund amount is correct.
//                 </span>
//               </span>
//             </label>
//           </div>

//           <button
//             type="button"
//             disabled={!canSubmit}
//             onClick={onSubmit}
//             className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white enabled:hover:bg-[#e56400] disabled:cursor-not-allowed disabled:bg-orange-200 inline-flex items-center justify-center gap-2"
//           >
//             {submitting ? (
//               'Initiating...'
//             ) : (
//               <>
//                 <CheckCircle2 className="h-4 w-4" />
//                 Initiate Refund & Close Order
//               </>
//             )}
//           </button>
//           <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs text-gray-500">
//             <CircleAlert className="h-3.5 w-3.5 text-[#F97316]" />
//             Upload pickup photo and complete authorization to proceed
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function generateOrderInvoicePDF(order, categoryRateMap) {
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

//   // Determine whether this row came from the Pickup tab or Relocate tab,
//   // so the date field reflects the relevant date instead of the order date.
//   const isRelocationOrder = Boolean(
//     order?.relocationRequest?.requestedAt && order?.newAddress,
//   );
//   const isPickupOrder =
//     Boolean(order?.hasScheduledReturnPickup) ||
//     Boolean(order?.returnRequest?.pickupScheduledAt);

//   let dateLabel = 'Order Date';
//   let dateValue = invDate;
//   if (isRelocationOrder) {
//     dateLabel = 'Relocation Date';
//     dateValue = order?.relocationRequest?.requestedAt
//       ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//           'en-IN',
//           { day: '2-digit', month: 'short', year: 'numeric' },
//         )
//       : '-';
//   } else if (isPickupOrder) {
//     dateLabel = 'Pickup Date';
//     dateValue = order?.returnRequest?.pickupScheduledAt
//       ? new Date(order.returnRequest.pickupScheduledAt).toLocaleDateString(
//           'en-IN',
//           { day: '2-digit', month: 'short', year: 'numeric' },
//         )
//       : invDate;
//   }

//   const details = [
//     ['Order Number', order.displayId || '-'],
//     [dateLabel, dateValue],
//     ...(isRelocationOrder ? [['Relocation Amount', 'Rs. 0']] : []),
//     [
//       'Order Type',
//       order.orderType || (order.isServiceBooking ? 'Service' : '-'),
//     ],
//     ['Customer', order.customerName || '-'],
//     ...(!order.isServiceBooking &&
//     String(order.orderType || '') !== 'Buy' &&
//     Number(order.refundableDeposit || 0) > 0
//       ? [
//           [
//             'Refundable Deposit',
//             `Rs. ${Number(order.refundableDeposit).toLocaleString('en-IN')}`,
//           ],
//         ]
//       : []),
//     ...(!order.isServiceBooking && Number(order.taxesAmount || 0) > 0
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
//   pdf.text(order.phone || order.user?.phone || '-', rightX - 6, rightY, {
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
//   // const itemLabel = `Item: ${order.productName || 'Product'}${
//   //   order.variantName ? ` (${order.variantName})` : ''
//   // }`;
//   // const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

//   // let statusCapitalized;
//   // if (isRelocationOrder) {
//   //   const relocStatus = String(order?.relocationRequest?.status || 'requested');
//   //   statusCapitalized = relocStatus === 'confirmed' ? 'Completed' : 'Requested';
//   // } else {
//   //   const statusLabel = String(
//   //     order.status === 'pending' ? 'Processing' : order.status || '-',
//   //   );
//   //   statusCapitalized =
//   //     statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
//   // }

//   // pdf.setFontSize(8);
//   // pdf.text('1', cols[0].x, rowTop + 4);
//   // pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
//   // pdf.text(String(order.quantity || 1), cols[2].x, rowTop + 4);
//   // pdf.text(statusCapitalized, cols[3].x, rowTop + 4);
//   // pdf.text(
//   //   `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
//   //   cols[4].x,
//   //   rowTop + 4,
//   //   { align: 'right' },
//   // );

//   // const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//   // pdf.setDrawColor(225);
//   // pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
//   // y = rowTop + rowHeight + 4;

//   let statusCapitalized;
//   if (isRelocationOrder) {
//     const relocStatus = String(order?.relocationRequest?.status || 'requested');
//     statusCapitalized = relocStatus === 'confirmed' ? 'Completed' : 'Requested';
//   } else {
//     const statusLabel = String(
//       order.status === 'pending' ? 'Processing' : order.status || '-',
//     );
//     statusCapitalized =
//       statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
//   }

//   // When this order has more than one product line for this vendor,
//   // list every product with its own price, then show the order total —
//   // so the invoice matches the full order amount already shown in the
//   // table row. Single-product orders keep the original single-row layout.
//   const vendorIdForInvoice = String(
//     order?.primaryProduct?.vendorId?._id ||
//       order?.primaryProduct?.vendorId ||
//       '',
//   );
//   const vendorInvoiceLines = (order?.products || []).filter((l) => {
//     const p = l?.product;
//     if (!p || typeof p === 'string') return false;
//     const vid = p.vendorId?._id ?? p.vendorId;
//     return vendorIdForInvoice && String(vid) === vendorIdForInvoice;
//   });
//   const isMultiProductInvoice =
//     !order.isServiceBooking &&
//     !isRelocationOrder &&
//     vendorInvoiceLines.length > 1;

//   // Each product line can be in a different status (e.g. one shipped,
//   // one confirmed) — resolve status per line instead of reusing the
//   // single shared statusCapitalized value.
//   const lineStatusCapitalized = (line) => {
//     const raw = String(line?.lineStatus || order.status || '');
//     const label = raw === 'pending' ? 'Processing' : raw || '-';
//     return label.charAt(0).toUpperCase() + label.slice(1);
//   };

//   pdf.setFontSize(8);

//   if (isMultiProductInvoice) {
//     let rowStartY = y;
//     let sno = 1;
//     vendorInvoiceLines.forEach((line) => {
//       const lp = line?.product;
//       const qty = Number(line?.quantity || 1);
//       const rate = Number(line?.pricePerDay || 0);
//       const lineAmount = rate * qty;
//       const itemLabel = `Item: ${lp?.productName || lp?.title || 'Product'}${
//         line?.variantName ? ` (${line.variantName})` : ''
//       }`;
//       const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);
//       const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//       const thisLineStatus = lineStatusCapitalized(line);

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
//         rowHeight,
//         2,
//         2,
//         'S',
//       );
//       rowStartY += rowHeight + 4;
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
//     const rowTop = y;
//     const itemLabel = `Item: ${order.productName || 'Product'}${
//       order.variantName ? ` (${order.variantName})` : ''
//     }`;
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
//     pdf.text(String(order.quantity || 1), cols[2].x, rowTop + 4);
//     pdf.text(statusCapitalized, cols[3].x, rowTop + 4);
//     pdf.text(
//       `Rs.${rowItemAmount.toLocaleString('en-IN')}`,
//       cols[4].x,
//       rowTop + 4,
//       { align: 'right' },
//     );

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

//   // Relocation-specific address details (Current/Old address + New address),
//   // shown dynamically based on whether the relocation has been confirmed.
//   if (isRelocationOrder) {
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

// // function OrderDetailsModal({ open, order, onClose }) {
// function OrderDetailsModal({ open, order, onClose, vendorIdStr }) {
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

//   // When this order has more than one product line belonging to this
//   // vendor, show all of them here so the modal total matches the full
//   // order amount already shown in the table row. Single-product orders
//   // are unaffected — they keep showing just their own detail rows below.
//   const vendorOrderLines = (order?.products || []).filter((l) =>
//     lineMatchesVendor(l, vendorIdStr),
//   );
//   const isMultiProductOrder = vendorOrderLines.length > 1;
//   const multiProductRows = isMultiProductOrder
//     ? vendorOrderLines.map((l) => {
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

//   const isRelocationOrder = Boolean(
//     order?.relocationRequest?.requestedAt && order?.newAddress,
//   );
//   const isRelocationConfirmed =
//     String(order?.relocationRequest?.status || '') === 'confirmed';

//   const orderDate = order.createdAt
//     ? new Date(order.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       })
//     : '-';

//   const relocationDate = order?.relocationRequest?.requestedAt
//     ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : '-';

//   const pickupDate = order?.returnRequest?.pickupScheduledAt
//     ? new Date(order.returnRequest.pickupScheduledAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : '-';

//   const statusText = order.isServiceBooking
//     ? getServiceStatusMeta(order).label
//     : isRelocationOrder
//       ? isRelocationConfirmed
//         ? 'Completed'
//         : 'Requested'
//       : statusDisplayLabel(order.status);

//   const statusClass = order.isServiceBooking
//     ? getServiceStatusMeta(order).badgeClass
//     : isRelocationOrder
//       ? isRelocationConfirmed
//         ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//         : 'border-blue-200 bg-blue-50 text-blue-700'
//       : statusBadgeClasses(order.status);

//   const oldAddr = order?.currentAddress || {};
//   const newAddr = order?.newAddress || {};

//   const detailRows = [
//     ['Order ID', order.displayId || '-'],
//     ['Customer', order.customerName || '-'],
//     ['Delivery Number', order.phone || order.user?.phone || '-'],
//     ['Registered Number', order.user?.mobileNumber || order.user?.phone || '-'],
//     ['Product', order.productName || '-'],
//     ...(order.variantName ? [['Variant', order.variantName]] : []),
//     [
//       'Order Type',
//       order.orderType || (order.isServiceBooking ? 'Service' : '-'),
//     ],
//     // ['Quantity', String(order.quantity || 1)],
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
//     ...(order.hasScheduledReturnPickup ? [['Pickup Date', pickupDate]] : []),
//   ];

//   return (
//     <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
//             <div className="flex items-start gap-3">
//               <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-sm">
//                 <Package className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-lg font-semibold leading-tight text-gray-900">
//                   Order #{order.displayId}
//                 </h2>
//                 <p className="mt-0.5 text-sm text-gray-500">
//                   {order.customerName} - {order.productName}
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
//               aria-label="Close order details"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           {/* <div className="mt-4 flex items-center gap-3">
//             {order.productImage ? (
//               <img
//                 src={order.productImage}
//                 alt=""
//                 className="h-16 w-16 rounded-xl object-cover border border-gray-200"
//               />
//             ) : (
//               <div className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200" />
//             )}
//             <span
//               className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-xs font-semibold capitalize ${statusClass}`}
//             >
//               {statusText}
//             </span>
//           </div> */}

//           <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//               <ClipboardCheck className="h-4 w-4 text-orange-500" />
//               Order Details
//             </p>

//             {isMultiProductOrder ? (
//               <>
//                 <div className="mt-3 space-y-2">
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
//                 <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm border-t border-gray-200 pt-3">
//                   {detailRows
//                     .filter(
//                       ([label]) =>
//                         label !== 'Product' &&
//                         label !== 'Variant' &&
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
//                   <div className="flex items-center justify-between gap-3 sm:col-span-2 border-t border-gray-200 pt-2 mt-1">
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
//               <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
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

//           {/* <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
//             <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//               <User className="h-4 w-4 text-blue-500" />
//               Customer Address
//             </p>
//             <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
//           </div> */}

//           <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
//             <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//               <User className="h-4 w-4 text-blue-500" />
//               Customer Address
//             </p>
//             <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
//           </div>

//           {order.deliveryInstructions ? (
//             <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//                 <Info className="h-4 w-4 text-amber-600" />
//                 Customer Message
//               </p>
//               <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
//                 {order.deliveryInstructions}
//               </p>
//             </div>
//           ) : null}

//           {isRelocationOrder ? (
//             <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-blue-600" />
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
//           {/*
//           <button
//             type="button"
//             onClick={() => generateOrderInvoicePDF(order, categoryRateMap)}
//             className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white hover:bg-[#e56400] shadow-sm inline-flex items-center justify-center gap-2"
//           >
//             <Download className="h-4 w-4" />
//             Download Invoice
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function VendorOrdersPage() {
//   const { user, token } = useSelector((s) => s.vendor);
//   const [orders, setOrders] = useState([]);
//   const [serviceBookings, setServiceBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [updatingId, setUpdatingId] = useState('');
//   const [deliveryModal, setDeliveryModal] = useState({
//     open: false,
//     order: null,
//     otp: '',
//   });
//   const [kycBlockedMessage, setKycBlockedMessage] = useState('');
//   const [otpInput, setOtpInput] = useState('');
//   const [installationDone, setInstallationDone] = useState(false);
//   const [returnModal, setReturnModal] = useState({
//     orderId: null,
//     productId: null,
//   });
//   const [inspectionModal, setInspectionModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [completeServiceModal, setCompleteServiceModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [relocationConfirmModal, setRelocationConfirmModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [newOrderModal, setNewOrderModal] = useState({
//     open: false,
//     orderId: null,
//   });
//   const [viewModal, setViewModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [confirmingRelocation, setConfirmingRelocation] = useState(false);
//   const [serviceOtpInput, setServiceOtpInput] = useState('');
//   const [serviceOtpSent, setServiceOtpSent] = useState(false);
//   const [sendingServiceOtp, setSendingServiceOtp] = useState(false);
//   const [verifyingServiceOtp, setVerifyingServiceOtp] = useState(false);
//   const [inspectionChecklist, setInspectionChecklist] = useState({
//     powerFunctionCheck: true,
//     surfaceScratches: false,
//     structuralIntegrity: true,
//     accessoriesAccountedFor: true,
//     cleanlinessCheck: true,
//   });
//   const [inspectionPickupPhotoName, setInspectionPickupPhotoName] =
//     useState('');
//   const [damageDeduction, setDamageDeduction] = useState('0');
//   const [cleaningFees, setCleaningFees] = useState('0');
//   const [authorizeRefund, setAuthorizeRefund] = useState(false);
//   // const [activeTab, setActiveTab] = useState('Processing');
//   // const [query, setQuery] = useState('');
//   // const [sendingOtp, setSendingOtp] = useState(false);
//   const [activeTab, setActiveTab] = useState('Processing');
//   const [query, setQuery] = useState('');
//   const [sendingOtp, setSendingOtp] = useState(false);
//   // const [dateFilter, setDateFilter] = useState('all');
//   // const [statusFilter, setStatusFilter] = useState('all');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [customerFilter, setCustomerFilter] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const PAGE_SIZE = 10;

//   const vendorIdStr = String(user?.id || user?._id || '');

//   const fetchOrders = useCallback(async () => {
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       setError('Please login again to continue.');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       const [ordersRes, bookingsRes] = await Promise.all([
//         apiGetVendorOrders(authToken),
//         apiGetVendorServiceBookings(authToken),
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
//   }, [token]);

//   const handleSendDeliveryOtp = async () => {
//     const order = deliveryModal.order;
//     if (!order?._id) return;

//     const productId = String(
//       order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//     );
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);

//     setSendingOtp(true);
//     try {
//       await apiSendVendorDeliveryOtp(order._id, productId, authToken);
//       toast.success('OTP sent to customer email!');
//       setKycBlockedMessage('');
//       // Mark OTP as sent so button changes to "Resend OTP"
//       setDeliveryModal((prev) => ({ ...prev, otpSent: true }));
//     } catch (err) {
//       console.error('OTP send error:', err);
//       const msg = err?.response?.data?.message || 'Failed to send OTP.';
//       if (err?.response?.data?.kycBlocked) {
//         setKycBlockedMessage(msg);
//       } else {
//         toast.error(msg);
//       }
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab, query, dateFilter, statusFilter, customerFilter]);

//   useEffect(() => {
//     setStatusFilter('all');
//   }, [activeTab]);
//   useEffect(() => {
//     const onOrdersChanged = () => fetchOrders();
//     window.addEventListener('vendor-orders-changed', onOrdersChanged);
//     return () =>
//       window.removeEventListener('vendor-orders-changed', onOrdersChanged);
//   }, [fetchOrders]);

//   // const normalizedOrders = useMemo(() => {
//   //   if (!vendorIdStr) return [];
//   //   // return (orders || []).map((o) => normalizeVendorOrder(o, vendorIdStr));
//   //   const rows = flattenVendorOrderLines(orders || [], vendorIdStr);
//   //   for (const booking of serviceBookings || []) {
//   //     rows.push({
//   //       ...booking,
//   //       _rowId: `service-${booking._id}`,
//   //       status: booking.status || 'pending',
//   //       amount: Number(booking.totalAmount || 0),
//   //       displayId: `SRV-${String(booking._id).slice(-3).toUpperCase()}`,
//   //       customerName: booking.user?.fullName || booking.name || '-',
//   // const normalizedOrders = useMemo(() => {
//   //   if (!vendorIdStr) return [];

//   //   const sortedOrders = [...(orders || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const sortedBookings = [...(serviceBookings || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const orderNumberMap = new Map(
//   //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//   //   );
//   //   const bookingNumberMap = new Map(
//   //     sortedBookings.map((b, idx) => [String(b._id), idx + 1]),
//   //   );

//   //   const rows = flattenVendorOrderLines(
//   //     sortedOrders,
//   //     vendorIdStr,
//   //     orderNumberMap,
//   //   );
//   //   for (const booking of sortedBookings) {
//   //     rows.push({
//   //       ...booking,
//   //       _rowId: `service-${booking._id}`,
//   //       status: booking.status || 'pending',
//   //       amount: Number(booking.totalAmount || 0),
//   //       // displayId: `SRV-${String(bookingNumberMap.get(String(booking._id)) || 0).padStart(3, '0')}`,
//   //       displayId: `SRV-${String(booking.bookingNumber || 0).padStart(3, '0')}`,
//   const normalizedOrders = useMemo(() => {
//     if (!vendorIdStr) return [];

//     const rows = flattenVendorOrderLines(orders || [], vendorIdStr);
//     for (const booking of serviceBookings || []) {
//       rows.push({
//         ...booking,
//         _rowId: `service-${booking._id}`,
//         status: booking.status || 'pending',
//         amount: Number(booking.totalAmount || 0),
//         displayId: `SRV-${String(booking?.bookingNumber || 0).padStart(4, '0')}`,
//         customerName: booking.user?.fullName || booking.name || '-',
//         productName:
//           booking.serviceSnapshot?.productName ||
//           booking.serviceProduct?.productName ||
//           'Service booking',
//         productImage:
//           booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
//         primaryProduct: booking.serviceProduct || null,
//         primaryLine: null,
//         isServiceBooking: true,
//       });
//     }
//     return rows;
//   }, [orders, serviceBookings, vendorIdStr]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     // Hide pending orders — they only appear via the New Order modal
//   //     // until vendor accepts them (which moves them to 'confirmed')
//   //     if (String(o.status) === 'pending' && !o.vendorAcknowledged) return false;

//   //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) {
//   //       return false;
//   //     }
//   //     const tabMatch = allowed.length
//   //       ? allowed.includes(String(o.status))
//   //       : true;
//   //     if (!tabMatch) return false;
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [normalizedOrders, activeTab, query]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     // Services tab: only service bookings
//   //     if (activeTab === 'Services') {
//   const customerOptions = useMemo(() => {
//     const names = new Set();
//     (normalizedOrders || []).forEach((o) => {
//       if (o.customerName && o.customerName !== '-') names.add(o.customerName);
//     });
//     return Array.from(names).sort((a, b) => a.localeCompare(b));
//   }, [normalizedOrders]);

//   const filteredOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const allowed = mapTabToStatuses(activeTab);
//     return normalizedOrders
//       .filter((o) => {
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//         if (
//           customerFilter !== 'all' &&
//           String(o.customerName) !== customerFilter
//         )
//           return false;

//         // Services tab: only service bookings
//         if (activeTab === 'Services') {
//           if (!o.isServiceBooking) return false;
//           if (
//             statusFilter !== 'all' &&
//             getServiceDisplayStatus(o.status) !== statusFilter
//           ) {
//             return false;
//           }
//           if (!q) return true;
//           return (
//             String(o.displayId).toLowerCase().includes(q) ||
//             String(o.customerName).toLowerCase().includes(q) ||
//             String(o.productName).toLowerCase().includes(q)
//           );
//         }

//         // All other tabs: exclude service bookings
//         //     if (o.isServiceBooking) return false;

//         //     if (String(o.status) === 'pending' && !o.vendorAcknowledged) return false;

//         //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) {
//         //       return false;
//         //     }
//         //     const tabMatch = allowed.length
//         //       ? allowed.includes(String(o.status))
//         //       : true;
//         //     if (!tabMatch) return false;
//         //     if (!q) return true;
//         //     return (
//         //       String(o.displayId).toLowerCase().includes(q) ||
//         //       String(o.customerName).toLowerCase().includes(q) ||
//         //       String(o.productName).toLowerCase().includes(q)
//         //     );
//         //   });
//         // }, [normalizedOrders, activeTab, query, dateFilter, statusFilter]);
//         // All other tabs: exclude service bookings
//         // All other tabs: exclude service bookings
//         if (o.isServiceBooking) return false;

//         if (statusFilter !== 'all') {
//           const matchesStatus =
//             statusFilter === 'confirmed'
//               ? ['confirmed', 'pending'].includes(String(o.status))
//               : statusFilter === 'confirmed_only'
//                 ? String(o.status) === 'confirmed'
//                 : String(o.status) === statusFilter;
//           if (!matchesStatus) return false;
//         }

//         if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) {
//           return false;
//         }

//         // When a specific customer is selected, show ALL their products
//         // regardless of the active tab's status restriction.
//         // When a specific customer OR a specific status is selected, show ALL
//         // matching items regardless of the active tab's status restriction.
//         if (customerFilter === 'all' && statusFilter === 'all') {
//           const tabMatch = allowed.length
//             ? allowed.includes(String(o.status))
//             : true;
//           if (!tabMatch) return false;
//         }
//         //       if (!q) return true;
//         //       return (
//         //         String(o.displayId).toLowerCase().includes(q) ||
//         //         String(o.customerName).toLowerCase().includes(q) ||
//         //         String(o.productName).toLowerCase().includes(q)
//         //       );
//         //     })
//         //     .reverse();
//         // }, [
//         //   normalizedOrders,
//         //   activeTab,
//         //   query,
//         //   dateFilter,
//         //   statusFilter,
//         //   customerFilter,
//         // ]);

//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//   }, [
//     normalizedOrders,
//     activeTab,
//     query,
//     dateFilter,
//     statusFilter,
//     customerFilter,
//   ]);

//   // const pickupScheduledOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   return normalizedOrders.filter((o) => {
//   //     if (!o.hasScheduledReturnPickup) return false;
//   //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//   //     if (statusFilter !== 'all' && String(o.status) !== statusFilter)
//   //       return false;
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [normalizedOrders, query, dateFilter, statusFilter]);

//   // const relocationOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const sortedOrders = [...(orders || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const orderNumberMap = new Map(
//   //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//   //   );
//   //   const rows = flattenVendorRelocationLines(
//   //     sortedOrders,
//   //     vendorIdStr,
//   //     orderNumberMap,
//   //   );
//   const relocationOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const rows = flattenVendorRelocationLines(orders || [], vendorIdStr);
//     //   return rows.filter((o) => {
//     //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//     //     if (customerFilter !== 'all' && String(o.customerName) !== customerFilter)
//     //       return false;
//     //     if (!q) return true;
//     //     return (
//     //       String(o.displayId).toLowerCase().includes(q) ||
//     //       String(o.customerName).toLowerCase().includes(q) ||
//     //       String(o.productName).toLowerCase().includes(q)
//     //     );
//     //   });
//     // }, [orders, vendorIdStr, query, dateFilter, customerFilter]);
//     return rows
//       .filter((o) => {
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//         if (
//           customerFilter !== 'all' &&
//           String(o.customerName) !== customerFilter
//         )
//           return false;
//         if (
//           statusFilter !== 'all' &&
//           String(o.relocationRequest?.status || 'requested') !== statusFilter
//         ) {
//           return false;
//         }
//         //       if (!q) return true;
//         //       return (
//         //         String(o.displayId).toLowerCase().includes(q) ||
//         //         String(o.customerName).toLowerCase().includes(q) ||
//         //         String(o.productName).toLowerCase().includes(q)
//         //       );
//         //     })
//         //     .reverse();
//         // }, [orders, vendorIdStr, query, dateFilter, customerFilter, statusFilter]);
//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//   }, [orders, vendorIdStr, query, dateFilter, customerFilter, statusFilter]);

//   const relocationTotal = useMemo(
//     () => relocationOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [relocationOrders],
//   );

//   const pickupScheduledOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return normalizedOrders
//       .filter((o) => {
//         if (!o.hasScheduledReturnPickup) return false;
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//         if (statusFilter !== 'all' && String(o.status) !== statusFilter)
//           return false;
//         if (
//           customerFilter !== 'all' &&
//           String(o.customerName) !== customerFilter
//         )
//           return false;
//         //       if (!q) return true;
//         //       return (
//         //         String(o.displayId).toLowerCase().includes(q) ||
//         //         String(o.customerName).toLowerCase().includes(q) ||
//         //         String(o.productName).toLowerCase().includes(q)
//         //       );
//         //     })
//         //     .reverse();
//         // }, [normalizedOrders, query, dateFilter, statusFilter, customerFilter]);
//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//   }, [normalizedOrders, query, dateFilter, statusFilter, customerFilter]);

//   // const stats = useMemo(() => {
//   //   // const processing = normalizedOrders.filter((o) =>
//   //   //   ['pending', 'confirmed'].includes(String(o.status)),
//   //   // ).length;
//   //   const processing = normalizedOrders.filter((o) =>
//   //     ['confirmed', 'pending'].includes(String(o.status)),
//   //   ).length;
//   //   const totalRevenue = normalizedOrders.reduce(
//   //     (s, o) => s + Number(o.amount || 0),
//   //     0,
//   //   );
//   //   const averageOrder = normalizedOrders.length
//   //     ? Math.round(totalRevenue / normalizedOrders.length)
//   //     : 0;

//   const stats = useMemo(() => {
//     // const processing = normalizedOrders.filter((o) =>
//     //   ['pending', 'confirmed'].includes(String(o.status)),
//     // ).length;
//     const processing = normalizedOrders.filter((o) =>
//       ['confirmed', 'pending'].includes(String(o.status)),
//     ).length;
//     // Each product line in an order now shows the FULL order/payout
//     // amount (not divided per product), so summing every line would
//     // double/triple-count orders that have multiple products from this
//     // vendor. Count each order's amount only once (by order _id);
//     // service bookings are always counted since each booking is its
//     // own separate transaction.
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
//     //   const isOpen = !['completed', 'cancelled'].includes(String(o.lineStatus));
//     //   if (!isOpen) return false;
//     //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
//     //   return ageMs > 24 * 60 * 60 * 1000;
//     // }).length;
//     const urgentActions = normalizedOrders.filter((o) => {
//       if (o.isServiceBooking) return false;
//       const isOpen = !['completed', 'cancelled'].includes(String(o.lineStatus));
//       if (!isOpen) return false;
//       const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
//       return ageMs > 24 * 60 * 60 * 1000;
//     }).length;
//     return { processing, totalRevenue, averageOrder, urgentActions };
//   }, [normalizedOrders]);

//   const filteredTotal = useMemo(
//     () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [filteredOrders],
//   );

//   const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
//   const paginatedOrders = useMemo(
//     () =>
//       filteredOrders.slice(
//         (currentPage - 1) * PAGE_SIZE,
//         currentPage * PAGE_SIZE,
//       ),
//     [filteredOrders, currentPage],
//   );

//   const totalPickupPages = Math.max(
//     1,
//     Math.ceil(pickupScheduledOrders.length / PAGE_SIZE),
//   );
//   const paginatedPickupOrders = useMemo(
//     () =>
//       pickupScheduledOrders.slice(
//         (currentPage - 1) * PAGE_SIZE,
//         currentPage * PAGE_SIZE,
//       ),
//     [pickupScheduledOrders, currentPage],
//   );
//   // const pickupTotal = useMemo(
//   //   () => pickupScheduledOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//   //   [pickupScheduledOrders],
//   // );
//   const pickupTotal = useMemo(
//     () => pickupScheduledOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [pickupScheduledOrders],
//   );
//   const pickupPendingDueTotal = useMemo(
//     () =>
//       pickupScheduledOrders.reduce((s, o) => s + Number(o.pendingDue || 0), 0),
//     [pickupScheduledOrders],
//   );
//   const servicesTotal = useMemo(
//     () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [filteredOrders],
//   );

//   // const tabCounts = useMemo(() => {
//   //   const list = normalizedOrders;
//   //   const nonPickup = list.filter((x) => !x.hasScheduledReturnPickup);
//   //   const shipped = nonPickup.filter((x) =>
//   //     ['shipped', 'in_progress'].includes(String(x.status)),
//   //   ).length;
//   //   return {
//   //     Processing: nonPickup.filter(
//   //       (x) =>
//   //         ['confirmed'].includes(String(x.status)) ||
//   //         (String(x.status) === 'pending' && x.vendorAcknowledged),
//   //     ).length,
//   //     Dispatched: shipped,
//   //     'In Transit': shipped,
//   //     Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
//   //       .length,
//   //     Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
//   //       .length,
//   //     Completed: nonPickup.filter((x) => String(x.status) === 'completed')
//   //       .length,
//   //     Pickup: list.filter((x) => x.hasScheduledReturnPickup).length,
//   //   };
//   // }, [normalizedOrders]);

//   const tabCounts = useMemo(() => {
//     const list = normalizedOrders;
//     const productOrders = list.filter((x) => !x.isServiceBooking);
//     const nonPickup = productOrders.filter((x) => !x.hasScheduledReturnPickup);
//     const shipped = nonPickup.filter((x) =>
//       ['shipped', 'in_progress'].includes(String(x.status)),
//     ).length;
//     return {
//       Processing: nonPickup.filter((x) =>
//         ['confirmed', 'pending'].includes(String(x.status)),
//       ).length,
//       Dispatched: shipped,
//       'In Transit': shipped,
//       Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
//         .length,
//       Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
//         .length,
//       Completed: nonPickup.filter((x) => String(x.status) === 'completed')
//         .length,
//       Pickup: productOrders.filter((x) => x.hasScheduledReturnPickup).length,
//       Relocate: productOrders.filter((x) =>
//         Boolean(x?.relocationRequest?.requestedAt),
//       ).length,
//       Services: list.filter((x) => x.isServiceBooking).length,
//     };
//   }, [normalizedOrders]);

//   const showPackaging = (status) =>
//     ['pending', 'confirmed'].includes(String(status));
//   const showDeliveryAction = (status) => String(status) === 'shipped';
//   const serviceActionForStatus = (status) => {
//     const s = String(status || '');
//     if (s === 'pending') return { label: 'Confirm', next: 'confirmed' };
//     if (s === 'confirmed') return { label: 'Start', next: 'in_progress' };
//     if (s === 'in_progress') return { label: 'Complete', next: 'completed' };
//     return null;
//   };
//   // const showScheduleAction = (order) => {
//   //   if (String(order?.status || '') !== 'cancelled') return false;
//   //   if (order?.hasScheduledReturnPickup) return false;
//   //   return true;
//   // };
//   // const showScheduleAction = (order) => {
//   //   if (order?.hasScheduledReturnPickup) return false;
//   //   // Show Schedule if status is 'cancelled' (covers both:
//   //   // actual cancelled orders AND delivered rentals with return request pending)
//   //   if (String(order?.status || '') !== 'cancelled') return false;
//   //   return true;
//   // };

//   // DELETE showScheduleAction, ADD this instead:
//   const getCancelledAction = (order) => {
//     if (String(order?.status || '') !== 'cancelled') return null;
//     if (order?.hasScheduledReturnPickup) return null;
//     // Delivered rental with active return request → show Schedule
//     if (Boolean(order?.returnRequest?.requestedAt)) return 'schedule';
//     // Plain cancel — who did it?
//     const cancelledBy = order?.primaryLine?.cancelledBy;
//     if (cancelledBy === 'vendor') return 'by_vendor';
//     if (cancelledBy === 'user') return 'by_user';
//     return null;
//   };

//   const handleConfirmRelocation = async () => {
//     const order = relocationConfirmModal.order;
//     if (!order?._id) return;
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     const productId = String(
//       order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//     );
//     setConfirmingRelocation(true);
//     try {
//       const res = await apiConfirmVendorRelocation(
//         order._id,
//         { productId },
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Relocation request confirmed.');
//       setRelocationConfirmModal({ open: false, order: null });
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Failed to confirm relocation.',
//       );
//     } finally {
//       setConfirmingRelocation(false);
//     }
//   };

//   const handleSendServiceCompletionOtp = async () => {
//     const booking = completeServiceModal.order;
//     if (!booking?._id) return;
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     setSendingServiceOtp(true);
//     try {
//       await apiSendServiceCompletionOtp(booking._id, authToken);
//       toast.success('OTP sent to customer email!');
//       setServiceOtpSent(true);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to send OTP.');
//     } finally {
//       setSendingServiceOtp(false);
//     }
//   };

//   const handleVerifyServiceCompletionOtp = async () => {
//     const booking = completeServiceModal.order;
//     if (!booking?._id) return;
//     if (!serviceOtpInput) {
//       toast.error('Please enter the OTP.');
//       return;
//     }
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     setVerifyingServiceOtp(true);
//     try {
//       const res = await apiVerifyServiceCompletionOtp(
//         booking._id,
//         serviceOtpInput,
//         authToken,
//       );
//       setServiceBookings((prev) =>
//         prev.map((b) =>
//           String(b._id) === String(booking._id) ? res.data.data : b,
//         ),
//       );
//       toast.success('Service marked as completed!');
//       setCompleteServiceModal({ open: false, order: null });
//       setServiceOtpInput('');
//       setServiceOtpSent(false);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Incorrect or expired OTP.');
//     } finally {
//       setVerifyingServiceOtp(false);
//     }
//   };

//   const updateServiceBookingStatus = async (booking, status) => {
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken || !booking?._id) return;
//     setUpdatingId(booking._id);
//     try {
//       const res = await apiUpdateVendorServiceBookingStatus(
//         booking._id,
//         status,
//         authToken,
//       );
//       setServiceBookings((prev) =>
//         prev.map((b) => (String(b._id) === String(booking._id) ? res.data : b)),
//       );
//       toast.success('Service booking updated.');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Could not update booking.');
//     } finally {
//       setUpdatingId('');
//     }
//   };

//   const openInspectionModal = (order) => {
//     setInspectionModal({ open: true, order });
//     setInspectionChecklist({
//       powerFunctionCheck: true,
//       surfaceScratches: false,
//       structuralIntegrity: true,
//       accessoriesAccountedFor: true,
//       cleanlinessCheck: true,
//     });
//     setInspectionPickupPhotoName('');
//     setDamageDeduction('0');
//     setCleaningFees('0');
//     setAuthorizeRefund(false);
//   };

//   const closeInspectionModal = () => {
//     if (updatingId) return;
//     setInspectionModal({ open: false, order: null });
//   };

//   const submitInspection = async () => {
//     const order = inspectionModal.order;
//     if (!order?._id) return;
//     if (!inspectionPickupPhotoName) {
//       toast.error('Please upload pickup photo.');
//       return;
//     }
//     if (!authorizeRefund) {
//       toast.error('Please authorize refund to continue.');
//       return;
//     }

//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }

//     setUpdatingId(order._id);
//     try {
//       const res = await apiCompleteVendorReturnInspection(
//         order._id,
//         {
//           productId: order?.primaryLine?.product?._id || '',
//           inspectionChecklist,
//           pickupPhotoName: inspectionPickupPhotoName,
//           damageDeduction: Number(damageDeduction || 0),
//           cleaningFees: Number(cleaningFees || 0),
//           authorizeRefund,
//         },
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Inspection saved. Refund initiated.');
//       closeInspectionModal();
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message ||
//           'Failed to initiate refund and close order.',
//       );
//     } finally {
//       setUpdatingId('');
//     }
//   };

//   // const handleStatusNextAction = (order, nextStep) => {
//   //   if (nextStep.type === 'review') {
//   //     setNewOrderModal({ open: true, orderId: order._id });
//   //   } else if (nextStep.type === 'packaging') {
//   const handleReviewAccept = async (order) => {
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     setUpdatingId(order._rowId || order._id);
//     try {
//       const res = await apiUpdateVendorOrderStatus(
//         order._id,
//         'confirmed',
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Order confirmed.');
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Could not confirm order.');
//     } finally {
//       setUpdatingId('');
//     }
//   };

//   const handleStatusNextAction = (order, nextStep) => {
//     if (nextStep.type === 'review') {
//       handleReviewAccept(order);
//     } else if (nextStep.type === 'packaging') {
//       const productId = String(
//         order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//       );
//       window.location.href = `/vendor/orders/${order._id}/pack?productId=${encodeURIComponent(productId)}`;
//     } else if (nextStep.type === 'delivery') {
//       openDeliveryModal(order);
//     } else if (nextStep.type === 'schedule') {
//       const rrLine = vendorReturnRequestedLine(order, vendorIdStr);
//       setReturnModal({
//         orderId: order._id,
//         productId: rrLine?.product?._id || null,
//       });
//     } else if (nextStep.type === 'service') {
//       updateServiceBookingStatus(order, nextStep.next);
//     } else if (nextStep.type === 'inspection') {
//       openInspectionModal(order);
//     } else if (nextStep.type === 'relocate-confirm') {
//       setRelocationConfirmModal({ open: true, order });
//     } else if (nextStep.type === 'service-complete') {
//       setCompleteServiceModal({ open: true, order });
//     }
//   };

//   const openDeliveryModal = (order) => {
//     // setDeliveryModal({ open: true, order, otp: makeOtp() });
//     setDeliveryModal({ open: true, order, otp: '', otpSent: false });
//     setOtpInput('');
//     setInstallationDone(false);
//     setKycBlockedMessage('');
//   };

//   const closeDeliveryModal = () => {
//     if (updatingId) return;
//     setDeliveryModal({ open: false, order: null, otp: '' });
//     setOtpInput('');
//     setInstallationDone(false);
//     setKycBlockedMessage('');
//   };

//   // const confirmDeliveryFromModal = async () => {
//   //   const order = deliveryModal.order;
//   //   if (!order?._id) return;
//   //   if (otpInput !== deliveryModal.otp) {
//   //     toast.error('OTP does not match.');
//   //     return;
//   //   }
//   //   if (
//   //     productRequiresInstallation(order.primaryProduct) &&
//   //     !installationDone
//   //   ) {
//   //     toast.error('Please confirm installation completed.');
//   //     return;
//   //   }
//   //   const authToken =
//   //     token ||
//   //     (typeof window !== 'undefined'
//   //       ? localStorage.getItem('vendorToken')
//   //       : null);
//   //   if (!authToken) {
//   //     toast.error('Please login again.');
//   //     return;
//   //   }

//   //   const productId = String(
//   //     order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//   //   );

//   //   setUpdatingId(order._rowId || order._id);
//   //   try {
//   //     // ↓ Call LINE-level status instead of order-level
//   //     const res = await apiUpdateVendorLineStatus(
//   //       order._id,
//   //       productId,
//   //       'delivered',
//   //       authToken,
//   //     );
//   //     const updated = res.data;
//   //     setOrders((prev) =>
//   //       prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//   //     );
//   //     toast.success('Delivery confirmed for this item.');
//   //     closeDeliveryModal();
//   //   } catch (err) {
//   //     toast.error(err.response?.data?.message || 'Could not confirm delivery');
//   //   } finally {
//   //     setUpdatingId('');
//   //   }
//   // };

//   const confirmDeliveryFromModal = async () => {
//     const order = deliveryModal.order;
//     if (!order?._id) return;

//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again.');
//       return;
//     }

//     const productId = String(
//       order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//     );

//     if (
//       productRequiresInstallation(order.primaryProduct) &&
//       !installationDone
//     ) {
//       toast.error('Please confirm installation completed.');
//       return;
//     }

//     setUpdatingId(order._rowId || order._id);
//     try {
//       // Step 1: verify OTP server-side
//       await apiVerifyVendorDeliveryOtp(
//         order._id,
//         productId,
//         otpInput,
//         authToken,
//       );

//       // Step 2: mark delivered
//       const res = await apiUpdateVendorLineStatus(
//         order._id,
//         productId,
//         'delivered',
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Delivery confirmed!');
//       closeDeliveryModal();
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Could not confirm delivery.',
//       );
//     } finally {
//       setUpdatingId('');
//     }
//   };
//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       <VendorSidebar />
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         <VendorTopBar user={user} />
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f3f5f9]">
//           <div className="space-y-4 sm:space-y-5 max-w-[1600px]">
//             {/* <div>
//               <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Customers who ordered your products.
//               </p>
//             </div> */}

//             {loading ? (
//               <div className="flex justify-center py-14">
//                 <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : error ? (
//               <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
//                 {error}
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
//                   {/* <div className="bg-white rounded-2xl border border-blue-100 p-4">
//                     <p className="text-xs text-gray-500">Processing orders</p>
//                     <p className="text-4xl font-semibold text-[#2563EB] mt-1">
//                       {stats.processing}
//                     </p>
//                   </div> */}
//                   <div className="bg-white rounded-2xl border border-[#BEDBFF] p-4">
//                     <div className="flex items-center gap-1.5">
//                       <img
//                         src={processOrder.src}
//                         alt="processing orders"
//                         className="w-8 h-8"
//                       />
//                       <p className="text-xs text-gray-500">Processing Orders</p>
//                     </div>

//                     <p className="text-3xl font-semibold text-[#2563EB] mt-1">
//                       {stats.processing}
//                     </p>
//                   </div>
//                   {/* <div className="bg-white rounded-2xl border border-emerald-100 p-4">
//                     <p className="text-xs text-gray-500">Total value</p>
//                     <p className="text-4xl font-semibold text-[#F97316] mt-1">
//                       {money(stats.totalRevenue)}
//                     </p>
//                   </div> */}
//                   <div className="bg-white rounded-2xl border border-[#FFD6A8] p-4">
//                     <div className="flex items-center gap-1.5">
//                       <img
//                         src={totalVal.src}
//                         alt="total value"
//                         className="w-8 h-8"
//                       />
//                       <p className="text-xs text-gray-500">Total value</p>
//                     </div>

//                     <p className="text-3xl font-semibold text-[#F97316] mt-1">
//                       {money(stats.totalRevenue)}
//                     </p>
//                   </div>
//                   {/* <div className="bg-white rounded-2xl border border-violet-100 p-4">
//                     <p className="text-xs text-gray-500">Average order</p>
//                     <p className="text-4xl font-semibold text-violet-600 mt-1">
//                       {money(stats.averageOrder)}
//                     </p>
//                   </div> */}
//                   <div className="bg-white rounded-2xl border border-emerald-100 p-4">
//                     <div className="flex items-center gap-1.5">
//                       <img
//                         src={totalOrdersIcon.src}
//                         alt="total orders"
//                         className="w-8 h-8"
//                       />
//                       <p className="text-xs text-gray-500">Total Orders</p>
//                     </div>

//                     <p className="text-3xl font-semibold text-[#10B981] mt-2">
//                       {normalizedOrders.length}
//                     </p>
//                   </div>
//                   {/* <div className="bg-white rounded-2xl border border-orange-100 p-4">
//                     <p className="text-xs text-gray-500">Urgent actions</p>
//                     <p className="text-4xl font-semibold text-orange-600 mt-1">
//                       {stats.urgentActions}
//                     </p>
//                   </div> */}
//                 </div>

//                 <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <div className="flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                     {tabs.map((tab) => (
//                       <button
//                         key={tab}
//                         type="button"
//                         onClick={() => setActiveTab(tab)}
//                         className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border shrink-0 whitespace-nowrap ${
//                           activeTab === tab
//                             ? 'bg-white border-gray-300 shadow-sm text-gray-900'
//                             : 'border-transparent text-gray-500 hover:bg-gray-50'
//                         }`}
//                       >
//                         <span>{tab}</span>
//                         <span
//                           className={`min-w-[1.5rem] h-6 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
//                             activeTab === tab
//                               ? 'bg-[#F97316] text-white'
//                               : 'bg-gray-100 text-gray-600'
//                           }`}
//                         >
//                           {tabCounts[tab] ?? 0}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <input
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     placeholder="Search orders, customers, products..."
//                     className="w-full sm:max-w-md px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                   />
//                 </div> */}
//                 {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <div className="flex flex-col sm:flex-row sm:items-center gap-3">
//                     <div className="relative w-full sm:max-w-md">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                       <input
//                         value={query}
//                         onChange={(e) => setQuery(e.target.value)}
//                         placeholder="Search orders, customers, products..."
//                         className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                       />
//                     </div>
//                     <div className="flex flex-1 flex-wrap sm:justify-end gap-3"> */}
//                 <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <div className="flex flex-nowrap items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                     <div className="relative w-full max-w-md shrink-0">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                       <input
//                         value={query}
//                         onChange={(e) => setQuery(e.target.value)}
//                         placeholder="Search orders, customers, products..."
//                         className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                       />
//                     </div>
//                     <div className="flex flex-nowrap flex-1 justify-end gap-3">
//                       <select
//                         value={dateFilter}
//                         onChange={(e) => setDateFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         <option value="all">All Dates</option>
//                         <option value="today">Today</option>
//                         <option value="last7">Last 7 Days</option>
//                         <option value="last30">Last 30 Days</option>
//                       </select>
//                       {/*
//                       <select
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         {activeTab === 'Services' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="scheduled">Scheduled</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         ) : (
//                           <>
//                             <option value="all">All Statuses</option>

//                             <option value="confirmed">Processing</option>
//                             <option value="shipped">Dispatched</option>

//                             <option value="delivered">Delivered</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         )}
//                       </select> */}
//                       <select
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         {activeTab === 'Services' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="scheduled">Scheduled</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         ) : activeTab === 'Pickup' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="cancelled">Pickup Scheduled</option>
//                           </>
//                         ) : activeTab === 'Relocate' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="requested">Requested</option>
//                             <option value="confirmed">Confirmed</option>
//                           </>
//                         ) : (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="confirmed">Processing</option>
//                             <option value="confirmed_only">Confirmed</option>
//                             <option value="shipped">Dispatched</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         )}
//                       </select>
//                       <select
//                         value={customerFilter}
//                         onChange={(e) => setCustomerFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         <option value="all">All Customers</option>
//                         {customerOptions.map((name) => (
//                           <option key={name} value={name}>
//                             {name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 {activeTab === 'Relocate' && (
//                   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="min-w-[1100px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                           <tr className="text-gray-500">
//                             <th className="px-4 py-3 text-left font-medium">
//                               Order ID
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Customer
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Product
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Type
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Relocation Date
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Relocate Amount
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Status
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {relocationOrders.map((order) => (
//                             <tr
//                               key={order._rowId}
//                               className="border-t border-gray-100"
//                             >
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {order.displayId}
//                               </td>
//                               <td className="px-4 py-3 text-gray-700">
//                                 {order.customerName}
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <span className="text-gray-800">
//                                     {order.productName}
//                                   </span>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <span
//                                   className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
//                                     order.orderType === 'Buy'
//                                       ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
//                                       : 'border-teal-200 bg-teal-50 text-teal-700'
//                                   }`}
//                                 >
//                                   {order.orderType || '-'}
//                                 </span>
//                               </td>
//                               <td className="px-4 py-3 text-gray-600">
//                                 {order.relocationRequest?.requestedAt
//                                   ? new Date(
//                                       order.relocationRequest.requestedAt,
//                                     ).toLocaleDateString('en-GB')
//                                   : '-'}
//                               </td>
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {money(order.amount)}
//                               </td>
//                               <td className="px-4 py-3">
//                                 <StatusStepDropdown
//                                   {...getRelocateStatusMeta(order)}
//                                   onSelect={(nextStep) =>
//                                     handleStatusNextAction(order, nextStep)
//                                   }
//                                 />
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setViewModal({ open: true, order });
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="View"
//                                   >
//                                     <Eye className="h-4 w-4" />
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       generateOrderInvoicePDF(order, categoryRateMap);
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="Download"
//                                   >
//                                     <Download className="h-4 w-4" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                           {/* {relocationOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={8}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No relocation requests yet.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                         {relocationOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={7}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(relocationTotal)}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         )} */}
//                           {relocationOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={8}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No relocation requests yet.
//                               </td>
//                             </tr>
//                           )}
//                           {/* </tbody>
//                         {relocationOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={5}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(relocationTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         )}
//                       </table>
//                     </div>
//                   </div>
//                 )}
//                 {activeTab !== 'Pickup' &&
//                   activeTab !== 'Services' &&
//                   activeTab !== 'Relocate' && ( */}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//                 {activeTab !== 'Pickup' &&
//                   activeTab !== 'Services' &&
//                   activeTab !== 'Relocate' && (
//                     <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                       <div className="overflow-x-auto">
//                         <table className="min-w-[1060px] w-full text-sm">
//                           <thead className="bg-gray-50 border-b border-gray-100">
//                             <tr className="text-gray-500">
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Order ID
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Customer
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Product
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Type
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Order Date
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Amount
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Status
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Action
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {/* {paginatedOrders.map((order) => (
//                               <tr
//                                 // key={order._id}
//                                 key={order._rowId}
//                                 onClick={() => {
//                                   if (
//                                     String(order.status) === 'pending' &&
//                                     !order.isServiceBooking
//                                   ) {
//                                     setNewOrderModal({
//                                       open: true,
//                                       orderId: order._id,
//                                     });
//                                   }
//                                 }}
//                                 className={`border-t border-gray-100 ${
//                                   String(order.status) === 'pending' &&
//                                   !order.isServiceBooking
//                                     ? 'cursor-pointer hover:bg-orange-50/60'
//                                     : ''
//                                 }`}
//                               > */}
//                             {paginatedOrders.map((order) => (
//                               <tr
//                                 // key={order._id}
//                                 key={order._rowId}
//                                 className="border-t border-gray-100"
//                               >
//                                 <td className="px-4 py-3 font-semibold text-gray-900">
//                                   {order.displayId}
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-700">
//                                   {order.customerName}
//                                 </td>
//                                 {/* <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <span className="text-gray-800">
//                                     {order.productName}
//                                   </span>
//                                 </div>
//                               </td> */}
//                                 <td className="px-4 py-3">
//                                   <div className="flex items-center gap-2">
//                                     {order.productImage ? (
//                                       <img
//                                         src={order.productImage}
//                                         alt=""
//                                         className="w-9 h-9 rounded-md object-cover"
//                                       />
//                                     ) : (
//                                       <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                     )}
//                                     <div className="min-w-0">
//                                       <span className="text-gray-800 block">
//                                         {order.productName}
//                                       </span>
//                                       {/*— show variant name like Amazon/Flipkart */}
//                                       {order.variantName ? (
//                                         <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
//                                           {order.variantName}
//                                         </span>
//                                       ) : null}
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   {order.isServiceBooking ? (
//                                     <span className="text-gray-300 text-xs">
//                                       —
//                                     </span>
//                                   ) : (
//                                     <span
//                                       className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
//                                         order.orderType === 'Buy'
//                                           ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
//                                           : 'border-teal-200 bg-teal-50 text-teal-700'
//                                       }`}
//                                     >
//                                       {order.orderType || '-'}
//                                     </span>
//                                   )}
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-600">
//                                   {order.createdAt
//                                     ? new Date(
//                                         order.createdAt,
//                                       ).toLocaleDateString('en-GB')
//                                     : '-'}
//                                 </td>
//                                 <td className="px-4 py-3 font-semibold text-gray-900">
//                                   {money(order.amount)}
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <StatusStepDropdown
//                                     label={statusDisplayLabel(order.status)}
//                                     badgeClass={statusBadgeClasses(
//                                       order.status,
//                                     )}
//                                     nextStep={getNextStepAction(order)}
//                                     onSelect={(nextStep) =>
//                                       handleStatusNextAction(order, nextStep)
//                                     }
//                                   />
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <div className="flex items-center gap-2">
//                                     <button
//                                       type="button"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         setViewModal({ open: true, order });
//                                       }}
//                                       className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                       title="View"
//                                     >
//                                       <Eye className="h-4 w-4" />
//                                     </button>
//                                     <button
//                                       type="button"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         generateOrderInvoicePDF(order, categoryRateMap);
//                                       }}
//                                       className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                       title="Download"
//                                     >
//                                       <Download className="h-4 w-4" />
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}

//                             {filteredOrders.length === 0 && (
//                               <tr>
//                                 <td
//                                   colSpan={8}
//                                   className="px-4 py-10 text-center text-gray-500"
//                                 >
//                                   No orders found.
//                                 </td>
//                               </tr>
//                             )}
//                           </tbody>
//                           {/* <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={7}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(filteredTotal)}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         </table>
//                       </div>
//                       {filteredOrders.length > 0 && (
//                         <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
//                           <p className="text-xs text-gray-500">
//                             Page {currentPage} of {totalPages} •{' '}
//                             {filteredOrders.length} results
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) => Math.max(1, p - 1))
//                               }
//                               disabled={currentPage === 1}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Previous
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) =>
//                                   Math.min(totalPages, p + 1),
//                                 )
//                               }
//                               disabled={currentPage === totalPages}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Next
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 {activeTab === 'Pickup' && ( */}
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={5}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(filteredTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         </table>
//                       </div>
//                       {filteredOrders.length > 0 && (
//                         <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
//                           <p className="text-xs text-gray-500">
//                             Page {currentPage} of {totalPages} •{' '}
//                             {filteredOrders.length} results
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) => Math.max(1, p - 1))
//                               }
//                               disabled={currentPage === 1}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Previous
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) =>
//                                   Math.min(totalPages, p + 1),
//                                 )
//                               }
//                               disabled={currentPage === totalPages}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Next
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                 {activeTab === 'Pickup' && (
//                   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="min-w-[1060px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                           <tr className="text-gray-500">
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Order ID
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Customer
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Product
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Type
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Pickup Date
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Pending Due
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Status
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {paginatedPickupOrders.map((order) => (
//                             <tr
//                               // key={`pickup-${order._id}`}
//                               key={`pickup-${order._rowId}`}
//                               className="border-t border-gray-100"
//                             >
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {order.displayId}
//                               </td>
//                               <td className="px-4 py-3 text-gray-700">
//                                 {order.customerName}
//                               </td>
//                               {/* <td className="px-4 py-3">
//                               <div className="flex items-center gap-2">
//                                 {order.productImage ? (
//                                   <img
//                                     src={order.productImage}
//                                     alt=""
//                                     className="w-9 h-9 rounded-md object-cover"
//                                   />
//                                 ) : (
//                                   <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                 )}
//                                 <span className="text-gray-800">
//                                   {order.productName}
//                                 </span>
//                               </div>
//                             </td> */}

//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <div className="min-w-0">
//                                     <span className="text-gray-800 block">
//                                       {order.productName}
//                                     </span>
//                                     {/*show variant name like Amazon/Flipkart */}
//                                     {order.variantName ? (
//                                       <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
//                                         {order.variantName}
//                                       </span>
//                                     ) : null}
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <span
//                                   className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
//                                     order.orderType === 'Buy'
//                                       ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
//                                       : 'border-teal-200 bg-teal-50 text-teal-700'
//                                   }`}
//                                 >
//                                   {order.orderType || '-'}
//                                 </span>
//                               </td>
//                               <td className="px-4 py-3 text-gray-600">
//                                 {order.createdAt
//                                   ? new Date(
//                                       order.createdAt,
//                                     ).toLocaleDateString('en-GB')
//                                   : '-'}
//                               </td>
//                               {/* <td className="px-4 py-3 font-semibold text-gray-900">
//                               {money(order.amount)}
//                             </td>
//                             <td className="px-4 py-3">
//                               {order.pendingDue > 0 ? (
//                                 <span className="font-semibold text-red-600">
//                                   {money(order.pendingDue)}
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-400">₹0</span>
//                               )}
//                             </td>
//                             <td className="px-4 py-3">
//                               <StatusStepDropdown
//                                 label="Pickup Scheduled" */}

//                               <td className="px-4 py-3 whitespace-nowrap">
//                                 {order.pendingDue > 0 ? (
//                                   <span className="font-semibold text-red-600">
//                                     {money(order.pendingDue)}
//                                   </span>
//                                 ) : (
//                                   <span className="text-gray-400">₹0</span>
//                                 )}
//                               </td>
//                               <td className="px-4 py-3">
//                                 <StatusStepDropdown
//                                   label="Pickup Scheduled"
//                                   badgeClass="border-blue-200 bg-blue-50 text-blue-700"
//                                   nextStep={{
//                                     label: 'Inspection',
//                                     type: 'inspection',
//                                   }}
//                                   onSelect={() =>
//                                     handleStatusNextAction(order, {
//                                       type: 'inspection',
//                                     })
//                                   }
//                                 />
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setViewModal({ open: true, order });
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="View"
//                                   >
//                                     <Eye className="h-4 w-4" />
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       generateOrderInvoicePDF(order, categoryRateMap);
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="Download"
//                                   >
//                                     <Download className="h-4 w-4" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                           {/* {pickupScheduledOrders.length === 0 && (
//                           <tr>
//                             <td
//                               colSpan={8}
//                               className="px-4 py-10 text-center text-gray-500"
//                             >
//                               No pickup-scheduled returns yet.
//                             </td>
//                           </tr>
//                         )} */}

//                           {/* {pickupScheduledOrders.length === 0 && (
//                           <tr>
//                             <td
//                               colSpan={9}
//                               className="px-4 py-10 text-center text-gray-500"
//                             >
//                               No pickup-scheduled returns yet.
//                             </td>
//                           </tr>
//                         )} */}
//                           {pickupScheduledOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={8}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No pickup-scheduled returns yet.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                         {pickupScheduledOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={5}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(pickupPendingDueTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         )}
//                       </table>
//                     </div>
//                     {pickupScheduledOrders.length > 0 && (
//                       <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
//                         <p className="text-xs text-gray-500">
//                           Page {currentPage} of {totalPickupPages} •{' '}
//                           {pickupScheduledOrders.length} results
//                         </p>
//                         <div className="flex items-center gap-2">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setCurrentPage((p) => Math.max(1, p - 1))
//                             }
//                             disabled={currentPage === 1}
//                             className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                           >
//                             Previous
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setCurrentPage((p) =>
//                                 Math.min(totalPickupPages, p + 1),
//                               )
//                             }
//                             disabled={currentPage === totalPickupPages}
//                             className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                           >
//                             Next
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === 'Services' && (
//                   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="min-w-[1060px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                           <tr className="text-gray-500">
//                             <th className="px-4 py-3 text-left font-medium">
//                               Order ID
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Customer
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Product
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Order Date
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Amount
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Status
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {paginatedOrders.map((order) => (
//                             <tr
//                               key={order._rowId}
//                               className="border-t border-gray-100"
//                             >
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {order.displayId}
//                               </td>
//                               <td className="px-4 py-3 text-gray-700">
//                                 {order.customerName}
//                               </td>
//                               {/* <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <span className="text-gray-800">
//                                     {order.productName}
//                                   </span>
//                                 </div>
//                               </td> */}

//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <div className="min-w-0">
//                                     <span className="text-gray-800 block">
//                                       {order.productName}
//                                     </span>
//                                     {/*ADD — show variant name like Amazon/Flipkart */}
//                                     {order.variantName ? (
//                                       <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
//                                         {order.variantName}
//                                       </span>
//                                     ) : null}
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3 text-gray-600">
//                                 {order.createdAt
//                                   ? new Date(
//                                       order.createdAt,
//                                     ).toLocaleDateString('en-GB')
//                                   : '-'}
//                               </td>
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {money(order.amount)}
//                               </td>
//                               {/* <td className="px-4 py-3">
//                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]">
//                                   <Calendar className="w-3.5 h-3.5" />
//                                   Scheduled
//                                 </span>
//                               </td> */}
//                               {/* <td className="px-4 py-3">
//                                 {String(order.status) === 'cancelled' ? (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-red-50 text-red-600 border-red-200">
//                                     <X className="w-3.5 h-3.5" />
//                                     Cancelled
//                                   </span>
//                                 ) : String(order.status) === 'completed' ? (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
//                                     <CheckCircle2 className="w-3.5 h-3.5" />
//                                     Completed
//                                   </span>
//                                 ) : (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]">
//                                     <Calendar className="w-3.5 h-3.5" />
//                                     Scheduled
//                                   </span>
//                                 )}
//                               </td> */}
//                               <td className="px-4 py-3">
//                                 <StatusStepDropdown
//                                   {...getServiceStatusMeta(order)}
//                                   onSelect={(nextStep) =>
//                                     handleStatusNextAction(order, nextStep)
//                                   }
//                                 />
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setViewModal({ open: true, order });
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="View"
//                                   >
//                                     <Eye className="h-4 w-4" />
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       generateOrderInvoicePDF(order, categoryRateMap);
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="Download"
//                                   >
//                                     <Download className="h-4 w-4" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}

//                           {filteredOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={7}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No service bookings found.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                         {/* {filteredOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={6}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(servicesTotal)}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         )} */}
//                         {filteredOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={4}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(servicesTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         )}
//                       </table>
//                       {filteredOrders.length > 0 && (
//                         <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
//                           <p className="text-xs text-gray-500">
//                             Page {currentPage} of {totalPages} •{' '}
//                             {filteredOrders.length} results
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) => Math.max(1, p - 1))
//                               }
//                               disabled={currentPage === 1}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Previous
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) =>
//                                   Math.min(totalPages, p + 1),
//                                 )
//                               }
//                               disabled={currentPage === totalPages}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Next
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//       <DeliveryVerificationModal
//         open={deliveryModal.open}
//         order={deliveryModal.order}
//         otp={deliveryModal.otp}
//         otpInput={otpInput}
//         setOtpInput={setOtpInput}
//         installationDone={installationDone}
//         setInstallationDone={setInstallationDone}
//         confirming={Boolean(
//           updatingId && deliveryModal.order?._id === updatingId,
//         )}
//         onClose={closeDeliveryModal}
//         onConfirm={confirmDeliveryFromModal}
//         otpSent={deliveryModal.otpSent || false}
//         sendingOtp={sendingOtp}
//         onSendOtp={handleSendDeliveryOtp}
//         kycBlockedMessage={kycBlockedMessage}
//       />
//       {relocationConfirmModal.open && relocationConfirmModal.order && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//           onClick={() =>
//             !confirmingRelocation &&
//             setRelocationConfirmModal({ open: false, order: null })
//           }
//         >
//           <div
//             className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center gap-3">
//               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                 <Calendar className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-base font-bold text-gray-900">
//                   Confirm Relocation
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {relocationConfirmModal.order.productName}
//                 </p>
//               </div>
//             </div>

//             <p className="mt-4 text-sm text-gray-600">
//               Are you sure you want to confirm relocating this product from the
//               old address to the new address?
//             </p>

//             <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3 text-sm">
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   Old Address
//                 </p>
//                 <p className="font-medium text-gray-800 mt-0.5">
//                   {relocationConfirmModal.order.currentAddress?.label ||
//                     relocationConfirmModal.order.currentAddress?.name ||
//                     '-'}
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {relocationConfirmModal.order.currentAddress?.address || '-'}
//                 </p>
//                 {relocationConfirmModal.order.currentAddress?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {relocationConfirmModal.order.currentAddress.phone}
//                   </p>
//                 ) : null}
//               </div>
//               <div className="border-t border-gray-200 pt-3">
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   New Address
//                 </p>
//                 <p className="font-medium text-gray-800 mt-0.5">
//                   {relocationConfirmModal.order.newAddress?.label || '-'}
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {[
//                     relocationConfirmModal.order.newAddress?.addressLine,
//                     relocationConfirmModal.order.newAddress?.area,
//                     relocationConfirmModal.order.newAddress?.pincode,
//                   ]
//                     .filter(Boolean)
//                     .join(', ')}
//                 </p>
//                 {relocationConfirmModal.order.newAddress?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {relocationConfirmModal.order.newAddress.phone}
//                   </p>
//                 ) : null}
//               </div>
//             </div>

//             <div className="mt-5 flex gap-3">
//               <button
//                 type="button"
//                 disabled={confirmingRelocation}
//                 onClick={() =>
//                   setRelocationConfirmModal({ open: false, order: null })
//                 }
//                 className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={confirmingRelocation}
//                 onClick={handleConfirmRelocation}
//                 className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//               >
//                 {confirmingRelocation ? 'Confirming...' : 'Confirm'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <VendorNewOrderModal
//         open={newOrderModal.open}
//         orderId={newOrderModal.orderId}
//         vendorIdStr={vendorIdStr}
//         getToken={() =>
//           token ||
//           (typeof window !== 'undefined'
//             ? localStorage.getItem('vendorToken')
//             : null)
//         }
//         onClose={() => {
//           setNewOrderModal({ open: false, orderId: null });
//           fetchOrders();
//         }}
//       />

//       <VendorReturnRequestedModal
//         open={Boolean(returnModal.orderId)}
//         orderId={returnModal.orderId}
//         productId={returnModal.productId}
//         vendorIdStr={vendorIdStr}
//         getToken={() =>
//           token ||
//           (typeof window !== 'undefined'
//             ? localStorage.getItem('vendorToken')
//             : null)
//         }
//         onClose={() => {
//           setReturnModal({ orderId: null, productId: null });
//           fetchOrders();
//         }}
//       />

//       {/* {completeServiceModal.open && completeServiceModal.order && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//           onClick={() => setCompleteServiceModal({ open: false, order: null })}
//         >
//           <div
//             className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center gap-3">
//               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//                 <CheckCircle2 className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-base font-bold text-gray-900">
//                   Mark as Completed?
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {completeServiceModal.order.productName}
//                 </p>
//               </div>
//             </div>

//             <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
//               Are you sure this service is completed? This action will notify
//               the customer and cannot be undone.
//             </p>

//             <div className="mt-5 flex gap-3">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setCompleteServiceModal({ open: false, order: null })
//                 }
//                 className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={updatingId === completeServiceModal.order._id}
//                 onClick={async () => {
//                   await updateServiceBookingStatus(
//                     completeServiceModal.order,
//                     'completed',
//                   );
//                   setCompleteServiceModal({ open: false, order: null });
//                 }}
//                 className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//               >
//                 {updatingId === completeServiceModal.order._id
//                   ? 'Saving...'
//                   : 'Yes, Complete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {completeServiceModal.open && completeServiceModal.order && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//           onClick={() => {
//             setCompleteServiceModal({ open: false, order: null });
//             setServiceOtpInput('');
//             setServiceOtpSent(false);
//           }}
//         >
//           <div
//             className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center gap-3">
//               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//                 <CheckCircle2 className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-base font-bold text-gray-900">
//                   Complete Service
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {completeServiceModal.order.productName}
//                 </p>
//               </div>
//             </div>

//             {!serviceOtpSent ? (
//               <>
//                 <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
//                   Send an OTP to the customer&apos;s email. Ask them for the
//                   code once the service is done, then enter it to confirm
//                   completion.
//                 </p>
//                 <div className="mt-5 flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setCompleteServiceModal({ open: false, order: null });
//                       setServiceOtpInput('');
//                       setServiceOtpSent(false);
//                     }}
//                     className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     disabled={sendingServiceOtp}
//                     onClick={handleSendServiceCompletionOtp}
//                     className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//                   >
//                     {sendingServiceOtp ? 'Sending...' : 'Send OTP to Customer'}
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
//                   Ask the customer for the 4-digit OTP sent to their email and
//                   enter it below to mark this service as completed.
//                 </p>
//                 <input
//                   value={serviceOtpInput}
//                   onChange={(e) =>
//                     setServiceOtpInput(
//                       String(e.target.value || '')
//                         .replace(/\D/g, '')
//                         .slice(0, 4),
//                     )
//                   }
//                   inputMode="numeric"
//                   autoComplete="one-time-code"
//                   placeholder="Enter OTP"
//                   className="mt-4 w-full text-center tracking-[0.5em] text-lg font-semibold px-3 py-2.5 border border-gray-300 rounded-xl"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleSendServiceCompletionOtp}
//                   disabled={sendingServiceOtp}
//                   className="mt-2 text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
//                 >
//                   {sendingServiceOtp ? 'Resending...' : 'Resend OTP'}
//                 </button>
//                 <div className="mt-5 flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setCompleteServiceModal({ open: false, order: null });
//                       setServiceOtpInput('');
//                       setServiceOtpSent(false);
//                     }}
//                     className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     disabled={
//                       verifyingServiceOtp || serviceOtpInput.length !== 4
//                     }
//                     onClick={handleVerifyServiceCompletionOtp}
//                     className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//                   >
//                     {verifyingServiceOtp ? 'Verifying...' : 'Verify & Complete'}
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//       <ReturnInspectionModal
//         open={inspectionModal.open}
//         order={inspectionModal.order}
//         checklist={inspectionChecklist}
//         setChecklist={setInspectionChecklist}
//         pickupPhotoName={inspectionPickupPhotoName}
//         setPickupPhotoName={setInspectionPickupPhotoName}
//         damageDeduction={damageDeduction}
//         setDamageDeduction={setDamageDeduction}
//         cleaningFees={cleaningFees}
//         setCleaningFees={setCleaningFees}
//         authorizeRefund={authorizeRefund}
//         setAuthorizeRefund={setAuthorizeRefund}
//         submitting={Boolean(
//           updatingId && inspectionModal.order?._id === updatingId,
//         )}
//         onClose={closeInspectionModal}
//         onSubmit={submitInspection}
//       />
//       <OrderDetailsModal
//         open={viewModal.open}
//         order={viewModal.order}
//         onClose={() => setViewModal({ open: false, order: null })}
//         vendorIdStr={vendorIdStr}
//       />
//     </div>
//   );
// }

// 'use client';

// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import Link from 'next/link';
// import {
//   AlertCircle,
//   BadgeCheck,
//   Camera,
//   Info,
//   CheckCircle2,
//   CircleAlert,
//   ClipboardCheck,
//   IndianRupee,
//   Package,
//   Package2,
//   Shield,
//   ShieldCheck,
//   Upload,
//   User,
//   Wrench,
//   Calendar,
//   X,
//   DollarSign,
//   Search,
//   ChevronDown,
//   Eye,
//   Download,
// } from 'lucide-react';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import {
//   apiCompleteVendorReturnInspection,
//   apiGetVendorOrders,
//   apiGetVendorServiceBookings,
//   apiUpdateVendorServiceBookingStatus,
//   apiUpdateVendorOrderStatus,
//   apiUpdateVendorLineStatus,
//   apiSendVendorDeliveryOtp,
//   apiVerifyVendorDeliveryOtp,
//   apiSendServiceCompletionOtp,
//   apiVerifyServiceCompletionOtp,
//   apiConfirmVendorRelocation,
// } from '@/service/api';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import VendorReturnRequestedModal from '../../Components/Modals/VendorReturnRequestedModal';
// import VendorNewOrderModal from '../../Components/Modals/VendorNewOrderModal';
// import jsPDF from 'jspdf';

// // const tabs = [
// //   'Processing',
// //   'Dispatched',
// //   'In Transit',
// //   'Cancelled',
// //   'Delivered',
// //   'Pickup',
// //   'Completed',
// //   'Services',
// // ];
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
// import totalVal from '@/assets/icons/total-val.png';
// import processOrder from '@/assets/icons/process-order.png';
// import totalOrdersIcon from '@/assets/icons/total-orders2.png';
// import ClipboardCheckIcon from '@/assets/icons/rtn-inspection.png';
// // const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// // const makeOtp = () => String(1000 + Math.floor(Math.random() * 9000));
// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// const makeOtp = () => String(1000 + Math.floor(Math.random() * 9000));

// const getServiceDisplayStatus = (status) => {
//   const s = String(status || '');
//   if (s === 'cancelled') return 'cancelled';
//   if (s === 'completed') return 'completed';
//   return 'scheduled';
// };

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

// function normalizeBool(v) {
//   if (v === true || v === false) return v;
//   if (typeof v === 'string') {
//     const x = v.trim().toLowerCase();
//     if (['true', 'yes', '1'].includes(x)) return true;
//     if (['false', 'no', '0'].includes(x)) return false;
//   }
//   return null;
// }

// function productRequiresInstallation(product) {
//   if (!product || typeof product !== 'object') return false;

//   // Prefer explicit backend flags when available.
//   const explicitCandidates = [
//     product?.requiresInstallation,
//     product?.installationRequired,
//     product?.logisticsVerification?.requiresInstallation,
//     product?.logisticsVerification?.installationRequired,
//     product?.logisticsVerification?.needsInstallation,
//   ];
//   for (const candidate of explicitCandidates) {
//     const parsed = normalizeBool(candidate);
//     if (parsed !== null) return parsed;
//   }

//   // Dynamic fallback by category + subcategory from product data.
//   const category = String(product?.category || '')
//     .trim()
//     .toLowerCase();
//   const subCategory = String(product?.subCategory || '')
//     .trim()
//     .toLowerCase();
//   const key = `${category} ${subCategory}`.trim();
//   if (!key) return false;

//   // Known non-installation families.
//   if (
//     /\b(mobile|smartphone|phone|cellphone|laptop|tablet|watch|earbud|headphone|charger|power bank)\b/.test(
//       key,
//     )
//   ) {
//     return false;
//   }

//   // Known installation-required families.
//   if (
//     /\b(ac|air conditioner|split ac|window ac|geyser|water heater|chimney|hob|cooktop|wall mount|tv mount)\b/.test(
//       key,
//     )
//   ) {
//     return true;
//   }

//   return false;
// }

// const mapTabToStatuses = (tab) => {
//   // if (tab === 'Processing') return ['pending', 'confirmed'];
//   if (tab === 'Processing') return ['confirmed', 'pending'];
//   if (tab === 'Dispatched') return ['shipped', 'in_progress'];
//   if (tab === 'In Transit') return ['shipped', 'in_progress'];
//   if (tab === 'Cancelled') return ['cancelled'];
//   //   if (tab === 'Delivered') return ['delivered'];
//   //   if (tab === 'Completed') return ['completed'];
//   //   if (tab === 'Pickup') return [];
//   //   if (tab === 'Services')
//   //     return ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
//   //   return [];
//   // };
//   if (tab === 'Delivered') return ['delivered'];
//   if (tab === 'Completed') return ['completed'];
//   if (tab === 'Pickup') return [];
//   if (tab === 'Services')
//     return ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
//   return [];
// };

// const statusDisplayLabel = (statusRaw) => {
//   const s = String(statusRaw || '');
//   if (s === 'pending') return 'Processing';
//   return s;
// };

// const statusBadgeClasses = (statusRaw) => {
//   const status = String(statusRaw || '').toLowerCase();
//   if (status === 'pending' || status === 'confirmed') {
//     return 'border-amber-200 bg-amber-50 text-amber-700';
//   }
//   if (status === 'shipped') {
//     return 'border-sky-200 bg-sky-50 text-sky-700';
//   }
//   if (status === 'in_progress') {
//     return 'border-blue-200 bg-blue-50 text-blue-700';
//   }
//   if (status === 'delivered') {
//     return 'border-emerald-200 bg-emerald-50 text-emerald-700';
//   }
//   // if (status === 'completed') {
//   //   return 'border-violet-200 bg-violet-50 text-violet-700';
//   // }
//   if (status === 'cancelled') {
//     return 'border-red-200 bg-red-50 text-red-700';
//   }
//   return 'border-gray-200 bg-gray-50 text-gray-700';
// };

// function getNextStepAction(order) {
//   if (order.isServiceBooking) {
//     return getServiceStatusMeta(order).nextStep;
//   }
//   const status = String(order.status || '');
//   if (status === 'completed') return null;
//   if (status === 'pending') return { label: 'Review', type: 'review' };
//   if (['pending', 'confirmed'].includes(status))
//     return { label: 'Packaging', type: 'packaging' };
//   if (status === 'shipped') return { label: 'Delivery', type: 'delivery' };
//   if (status === 'cancelled' && !order?.hasScheduledReturnPickup) {
//     if (Boolean(order?.returnRequest?.requestedAt)) {
//       return { label: 'Schedule', type: 'schedule' };
//     }
//     return null;
//   }
//   return null;
// }

// function StatusStepDropdown({ label, badgeClass, nextStep, onSelect }) {
//   const [open, setOpen] = useState(false);

//   if (!nextStep) {
//     return (
//       <span
//         className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${badgeClass}`}
//       >
//         {label}
//       </span>
//     );
//   }

//   return (
//     <div className="relative inline-block">
//       <button
//         type="button"
//         onClick={(e) => {
//           e.stopPropagation();
//           setOpen((v) => !v);
//         }}
//         className={`inline-flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${badgeClass}`}
//       >
//         {label}
//         <ChevronDown className="h-3 w-3" />
//       </button>
//       {open && (
//         <div
//           className="absolute z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <button
//             type="button"
//             onClick={() => {
//               setOpen(false);
//               onSelect(nextStep);
//             }}
//             className="w-full text-left px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
//           >
//             {nextStep.label} →
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function getRelocateStatusMeta(order) {
//   const status = order.relocationRequest?.status || 'requested';
//   const badgeClass =
//     status === 'confirmed'
//       ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//       : 'border-blue-200 bg-blue-50 text-blue-700';
//   const nextStep =
//     status === 'confirmed'
//       ? null
//       : { label: 'Confirm', type: 'relocate-confirm' };
//   return { label: status, badgeClass, nextStep };
// }

// function getServiceStatusMeta(order) {
//   const status = String(order.status || '');
//   if (status === 'cancelled') {
//     return {
//       label: 'Cancelled',
//       badgeClass: 'bg-red-50 text-red-600 border-red-200',
//       nextStep: null,
//     };
//   }
//   if (status === 'completed') {
//     return {
//       label: 'Completed',
//       badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//       nextStep: null,
//     };
//   }
//   if (status === 'confirmed' || status === 'in_progress') {
//     return {
//       label: 'Confirmed',
//       badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
//       nextStep: { label: 'Complete', type: 'service-complete' },
//     };
//   }
//   return {
//     label: 'Scheduled',
//     badgeClass: 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]',
//     nextStep: null,
//   };
// }

// function lineMatchesVendor(line, vendorIdStr) {
//   const p = line?.product;
//   if (!p || typeof p === 'string') return false;
//   const vid = p.vendorId?._id ?? p.vendorId;
//   return String(vid) === vendorIdStr;
// }

// function vendorScheduledReturnLine(order, vendorIdStr) {
//   return (order?.products || []).find((line) => {
//     if (!lineMatchesVendor(line, vendorIdStr)) return false;
//     return (
//       Boolean(line?.returnRequest?.pickupScheduledAt) &&
//       !line?.returnRequest?.refundInitiatedAt
//     );
//   });
// }

// function vendorReturnRequestedLine(order, vendorIdStr) {
//   return (order?.products || []).find((line) => {
//     if (!lineMatchesVendor(line, vendorIdStr)) return false;
//     return Boolean(line?.returnRequest?.requestedAt);
//   });
// }

// function vendorRelocationRequestedLine(order, vendorIdStr) {
//   return (order?.products || []).find((line) => {
//     if (!lineMatchesVendor(line, vendorIdStr)) return false;
//     return Boolean(line?.relocationRequest?.requestedAt);
//   });
// }

// function flattenVendorRelocationLines(orders, vendorIdStr, orderNumberMap) {
//   const rows = [];
//   for (const order of orders) {
//     const myLines = (order.products || []).filter(
//       (l) =>
//         lineMatchesVendor(l, vendorIdStr) &&
//         Boolean(l?.relocationRequest?.requestedAt),
//     );
//     for (const line of myLines) {
//       // const base = normalizeVendorOrderLine(
//       //   order,
//       //   line,
//       //   vendorIdStr,
//       //   orderNumberMap,
//       // );
//       // rows.push({
//       //   ...base,
//       //   _rowId: `reloc-${base._rowId}`,
//       //   relocationRequest: line.relocationRequest,
//       const base = normalizeVendorOrderLine(
//         order,
//         line,
//         vendorIdStr,
//         orderNumberMap,
//       );
//       rows.push({
//         ...base,
//         amount: 0, // Relocation amount is always static 0
//         _rowId: `reloc-${base._rowId}`,
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

// // // function normalizeVendorOrderLine(order, line, vendorIdStr) {
// // // function normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap) {
// // function normalizeVendorOrderLine(order, line, vendorIdStr) {
// // Mirrors the payout math shown in VendorNewOrderModal's Financial Summary:
// // order value - platform fee + refundable deposit + other taxes (gst,
// // care protection, repair/relocation warranty, delivery/installation fee).
// // Fee/tax fields are stored at order level, so when a vendor has multiple
// // lines in the same order, each line gets a proportional share based on
// // its value — this avoids double-counting the order-level fee across lines.
// // function computeVendorLinePayout(order, line, vendorIdStr) {
// //   const qty = Number(line?.quantity || 1);
// //   const rate = Number(line?.pricePerDay || 0);
// //   const lineValue = rate * qty;

// //   const vendorLines = (order?.products || []).filter((l) =>
// //     lineMatchesVendor(l, vendorIdStr),
// //   );
// //   const vendorTotal =
// //     vendorLines.reduce(
// //       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
// //       0,
// //     ) || 1;
// //   const share = lineValue / vendorTotal;

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

// //   return Math.max(0, lineValue - lineFee) + lineDeposit + lineTaxes;
// // }

// // function computeVendorLineBreakdown(order, line, vendorIdStr) {
// //   const qty = Number(line?.quantity || 1);
// //   const rate = Number(line?.pricePerDay || 0);
// //   const lineValue = rate * qty;

// //   const vendorLines = (order?.products || []).filter((l) =>
// //     lineMatchesVendor(l, vendorIdStr),
// //   );
// //   const vendorTotal =
// //     vendorLines.reduce(
// //       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
// //       0,
// //     ) || 1;
// //   const share = lineValue / vendorTotal;

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

// // Admin offers are platform-funded discounts the vendor didn't choose, so
// // the vendor table shows their real listed price. Vendor-run offers are
// // the vendor's own discount, so the table shows what the customer actually
// // paid (matches their real payout). No offer on the line → just pricePerDay.
// function vendorDisplayRate(line) {
//   const pricePerDay = Number(line?.pricePerDay || 0);
//   if (line?.offerSource === 'admin') {
//     return Number(line?.originalPricePerDay ?? pricePerDay);
//   }
//   return pricePerDay;
// }

// function computeVendorLineBreakdown(order, line, vendorIdStr) {
//   const qty = Number(line?.quantity || 1);
//   const rate = vendorDisplayRate(line);
//   const lineValue = rate * qty;

//   // Show the FULL order amount on every product line — same as the
//   // customer-facing "My Orders" page (which never divides fees/taxes
//   // per product when multiple products share one order). No more
//   // proportional "share" split across lines.
//   const vendorLines = (order?.products || []).filter((l) =>
//     lineMatchesVendor(l, vendorIdStr),
//   );
//   const vendorProductTotal = vendorLines.reduce(
//     (s, l) => s + vendorDisplayRate(l) * Number(l?.quantity || 1),
//     0,
//   );

//   const vendorDepositTotal = vendorLines.reduce(
//     (s, l) => s + Math.max(0, Number(l?.refundableDeposit || 0)),
//     0,
//   );

//   // const orderPlatformFee = Number(order?.platformFee || 0);
//   // const otherTaxes =
//   //   Number(order?.gst || 0) +
//   //   Number(order?.careProtection || 0) +
//   //   Number(order?.repairWarranty || 0) +
//   //   Number(order?.relocationWarranty || 0) +
//   //   Number(order?.deliveryPackaging || 0) +
//   //   Number(order?.installationFee || 0);

//   // const lineDeposit = Number(line?.refundableDeposit || 0);

//   // const fullPayout =
//   //   Math.max(0, vendorProductTotal - orderPlatformFee) +
//   //   vendorDepositTotal +
//   //   otherTaxes;

//   // const orderPlatformFee = Number(order?.platformFee || 0);
//   // const otherTaxes =
//   //   Number(order?.gst || 0) +
//   //   Number(order?.careProtection || 0) +
//   //   Number(order?.repairWarranty || 0) +
//   //   Number(order?.relocationWarranty || 0) +
//   //   Number(order?.deliveryPackaging || 0) +
//   //   Number(order?.installationFee || 0);
//   // const discountAmount = Number(order?.discountAmount || 0);

//   // const lineDeposit = Number(line?.refundableDeposit || 0);

//   // const fullPayout =
//   //   Math.max(0, vendorProductTotal - orderPlatformFee - discountAmount) +
//   //   vendorDepositTotal +
//   //   otherTaxes;

//   const orderPlatformFee = Number(order?.platformFee || 0);
//   const otherTaxes =
//     Number(order?.gst || 0) +
//     Number(order?.careProtection || 0) +
//     Number(order?.repairWarranty || 0) +
//     Number(order?.relocationWarranty || 0) +
//     Number(order?.deliveryPackaging || 0) +
//     Number(order?.installationFee || 0);
//   // Coupon discounts are funded by admin/platform, not the vendor —
//   // so the vendor's payout must NOT be reduced by discountAmount.
//   // Vendor always sees the full listed price.

//   const lineDeposit = Number(line?.refundableDeposit || 0);

//   const fullPayout =
//     Math.max(0, vendorProductTotal - orderPlatformFee) +
//     vendorDepositTotal +
//     otherTaxes;

//   return {
//     productAmount: lineValue,
//     lineFee: orderPlatformFee,
//     lineTaxes: otherTaxes,
//     lineDeposit,
//     payout: fullPayout,
//   };
// }

// function computeVendorLinePayout(order, line, vendorIdStr) {
//   return computeVendorLineBreakdown(order, line, vendorIdStr).payout;
// }

// // function normalizeVendorOrderLine(order, line, vendorIdStr) {
// // function normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap) {
// function normalizeVendorOrderLine(order, line, vendorIdStr) {
//   const product = line?.product;

//   const isSell =
//     String(line?.productType || '').toLowerCase() === 'sell' ||
//     String(product?.type || '').toLowerCase() === 'sell';

//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   // Per-product price only — never multiply by duration here.
//   // Duration-based totals belong in settlement/payout views, not the order table.
//   // Monthly-tenure rental lines store the FULL tenure price in pricePerDay
//   // (e.g. 3 months x 400 = 1200); the customer only pays the first month at
//   // checkout, so show that same first-month amount in the vendor table.
//   // const tenureUnit = String(order?.tenureUnit || 'month').toLowerCase();
//   // const rentalMonths = Math.max(1, Number(order?.rentalDuration || 1));
//   // const lineAmount =
//   //   !isSell && tenureUnit !== 'day' ? (rate / rentalMonths) * qty : rate * qty;
//   // // pricePerDay already stores the per-month rent for monthly rentals,
//   // // so use it directly — don't divide by rentalMonths.
//   // const lineAmount = rate * qty;
//   // pricePerDay already stores the per-month rent for monthly rentals,
//   // so use it directly — don't divide by rentalMonths.
//   // Table now shows vendor's final payout (value - platform fee + deposit
//   // + other taxes), matching the New Order modal's Financial Summary.
//   const lineBreakdown = computeVendorLineBreakdown(order, line, vendorIdStr);
//   const lineAmount = lineBreakdown.payout;

//   const isScheduled =
//     Boolean(line?.returnRequest?.pickupScheduledAt) &&
//     !line?.returnRequest?.refundInitiatedAt;

//   // ── KEY FIX: if line has a return request submitted but not yet
//   // scheduled for pickup, treat it as 'cancelled' so it appears
//   // in the Cancelled tab with a "Schedule" action button ──
//   // const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
//   // const isReturnPendingSchedule =
//   //   hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

//   // const effectiveStatus = isReturnPendingSchedule
//   //   ? 'cancelled' // force into Cancelled tab → Schedule button
//   //   : line?.lineStatus || order.status;

//   // const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
//   // const isReturnPendingSchedule =
//   //   hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

//   // // If refund has been initiated (QC + inspection done), the return cycle
//   // // is fully closed — treat as 'completed' so it vanishes from Delivered tab
//   // const isReturnCompleted = Boolean(line?.returnRequest?.refundInitiatedAt);

//   // const effectiveStatus = isReturnCompleted
//   //   ? 'completed' // hide from Delivered tab
//   //   : isReturnPendingSchedule
//   //     ? 'cancelled' // Cancelled tab → Schedule button
//   //     : line?.lineStatus || order.status;
//   const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
//   const isReturnPendingSchedule =
//     hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

//   // If refund has been initiated (QC + inspection done), the return cycle
//   // is fully closed — treat as 'completed' so it vanishes from Delivered tab
//   const isReturnCompleted = Boolean(line?.returnRequest?.refundInitiatedAt);

//   // A pending return request now shows directly in the Pickup tab (with a
//   // "Requested" dropdown) instead of routing through the Cancelled tab.
//   const hasPendingReturnRequest = isReturnPendingSchedule && !isReturnCompleted;

//   const effectiveStatus = isReturnCompleted
//     ? 'completed' // hide from Delivered tab
//     : line?.lineStatus || order.status;

//   return {
//     ...order,
//     _rowId: `${order._id}-${String(product?._id || line?._id || Math.random())}`,
//     status: effectiveStatus,
//     orderType: isSell ? 'Buy' : 'Rent',
//     amount: lineAmount,
//     // displayId: `ORD-${String(order._id).slice(-3).toUpperCase()}`,
//     // displayId: `ORD-${String(orderNumberMap?.get(String(order._id)) || 0).padStart(3, '0')}`,
//     displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
//     customerName: order.user?.fullName || order.name || '-',
//     productName: product?.productName || 'Product',
//     // productImage: product?.image || '',
//     productImage: (() => {
//       const variantName = line?.variantName || '';
//       const variantId = line?.variantId;
//       const variants = Array.isArray(product?.variants) ? product.variants : [];
//       const allImgs = Array.isArray(product?.images)
//         ? product.images.filter(Boolean)
//         : [];
//       if (
//         (variantId || variantName) &&
//         variants.length > 0 &&
//         allImgs.length > 1
//       ) {
//         const matchedIdx = variants.findIndex(
//           (v) =>
//             (variantId && String(v?._id || '') === String(variantId)) ||
//             (variantName && String(v?.variantName || '') === variantName),
//         );

//         if (matchedIdx !== -1) {
//           const perVariant = Math.ceil(allImgs.length / variants.length);
//           const start = matchedIdx * perVariant;
//           const slice = allImgs.slice(start, start + perVariant);
//           if (slice[0]) return slice[0];
//         }
//       }
//       return product?.images?.[0] || product?.image || '';
//     })(),
//     variantName: line?.variantName || '',
//     variantId: line?.variantId || null,
//     primaryProduct: product || null,
//     primaryLine: line || null,
//     // refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//     // returnRequest: line?.returnRequest || {},
//     refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
//     // Frozen late-fee amount (if any) at the moment return was requested —
//     // defaults to 0 for lines that never had a pending due.
//     pendingDue: Math.max(0, Number(line?.pendingDue || 0)),
//     // Used only in the order details modal, so "Amount" shows just the
//     // product's own price, with taxes shown as a separate field.
//     productOnlyAmount: Math.max(0, lineBreakdown.productAmount),
//     taxesAmount: Math.max(0, lineBreakdown.lineTaxes),
//     returnRequest: line?.returnRequest || {},
//     relocationRequest: line?.relocationRequest || {},
//     hasScheduledReturnPickup: isScheduled,
//     hasPendingReturnRequest,
//   };
// }

// // function flattenVendorOrderLines(orders, vendorIdStr) {
// //   const rows = [];
// //   for (const order of orders) {
// //     const myLines = (order.products || []).filter((l) =>
// //       lineMatchesVendor(l, vendorIdStr),
// //     );
// //     if (!myLines.length) continue;
// //     for (const line of myLines) {
// //       rows.push(normalizeVendorOrderLine(order, line, vendorIdStr));
// //     }
// //   }
// //   return rows;
// // }

// // function flattenVendorOrderLines(orders, vendorIdStr, orderNumberMap) {
// //   const rows = [];
// //   for (const order of orders) {
// //     const myLines = (order.products || []).filter((l) =>
// //       lineMatchesVendor(l, vendorIdStr),
// //     );
// //     if (!myLines.length) continue;
// //     for (const line of myLines) {
// //       rows.push(
// //         normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap),
// //       );
// //     }
// //   }
// //   return rows;
// // }

// function flattenVendorOrderLines(orders, vendorIdStr) {
//   const rows = [];
//   for (const order of orders) {
//     const myLines = (order.products || []).filter((l) =>
//       lineMatchesVendor(l, vendorIdStr),
//     );
//     if (!myLines.length) continue;
//     for (const line of myLines) {
//       rows.push(normalizeVendorOrderLine(order, line, vendorIdStr));
//     }
//   }
//   return rows;
// }

// function DeliveryVerificationModal({
//   open,
//   order,
//   otp,
//   otpInput,
//   setOtpInput,
//   installationDone,
//   setInstallationDone,
//   confirming,
//   onClose,
//   onConfirm,
//   otpSent,
//   sendingOtp,
//   onSendOtp,
//   kycBlockedMessage,
// }) {
//   const otpInputRef = useRef(null);
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
//   const productTitle = order.productName || 'Product';
//   const firstSku = `SKU-${String(order._id || '')
//     .slice(-6)
//     .toUpperCase()}`;
//   const requiresInstallation = productRequiresInstallation(
//     order.primaryProduct,
//   );
//   const orderValue = Number(order.amount || 0);
//   const payoutValue = Number(order.amount || 0);
//   // const otpOk = otpInput.length === 4 && otpInput === otp;
//   // const canConfirm =
//   //   otpOk && (!requiresInstallation || installationDone) && !confirming;
//   const otpOk = otpInput.length === 4; // server verifies the actual value
//   const canConfirm =
//     otpOk &&
//     otpSent &&
//     (!requiresInstallation || installationDone) &&
//     !confirming;

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[20px] bg-white border border-gray-200 shadow-2xl overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3">
//             <div className="flex items-start gap-3">
//               <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white">
//                 <ShieldCheck className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-lg leading-[1.05] font-semibold text-gray-900">
//                   Delivery Verification
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   Confirm handover with customer OTP
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
//               aria-label="Close delivery verification"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//             <p className="text-gray-600 inline-flex items-center gap-2">
//               <Package className="h-4 w-4 text-gray-400" />
//               <span className="text-gray-400">Order:</span>{' '}
//               <span className="font-semibold text-gray-900">
//                 #{order.displayId}
//               </span>
//             </p>
//             <p className="text-gray-600 inline-flex items-center gap-2">
//               <User className="h-4 w-4 text-gray-400" />
//               <span className="text-gray-400">Customer:</span>{' '}
//               <span className="font-semibold text-gray-900">
//                 {order.customerName || '-'}
//               </span>
//             </p>
//           </div>

//           <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             <p className="font-semibold text-black text-sm inline-flex items-center gap-2">
//               <Package className="h-4 w-4 text-gray-500" />
//               Items Being Delivered
//             </p>
//             <div className="mt-2 flex items-start justify-between gap-3">
//               <div>
//                 <p className="text-sm text-black font-medium">{productTitle}</p>
//                 <p className="text-xs text-gray-400 mt-0.5">SKU : {firstSku}</p>
//               </div>
//               {requiresInstallation ? (
//                 <span className="shrink-0 rounded-md border border-[#8EC5FF] bg-[#DBEAFE] px-2 py-1 text-[11px] font-semibold text-[#1447E6]">
//                   Requires Installation
//                 </span>
//               ) : null}
//             </div>
//           </div>

//           {/* <div className="mt-4">
//             <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
//               <ShieldCheck className="h-4 w-4 text-orange-500" />
//               Proof of Delivery (OTP)
//             </p>
//             <p className="mt-1 text-sm text-gray-600">
//               Ask the customer for the 4-digit OTP sent to their phone
//             </p>
//             <div
//               className="mt-3 flex items-center justify-center gap-3"
//               onClick={() => otpInputRef.current?.focus()}
//             >
//               {[0, 1, 2, 3].map((idx) => (
//                 <div
//                   key={idx}
//                   className="h-12 w-12 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-900 flex items-center justify-center"
//                 >
//                   {otpInput[idx] ? (
//                     otpInput[idx]
//                   ) : (
//                     <span className="text-gray-300">•</span>
//                   )}
//                 </div>
//               ))}
//               <input
//                 ref={otpInputRef}
//                 value={otpInput}
//                 onChange={(e) =>
//                   setOtpInput(
//                     String(e.target.value || '')
//                       .replace(/\D/g, '')
//                       .slice(0, 4),
//                   )
//                 }
//                 className="sr-only"
//                 inputMode="numeric"
//                 autoComplete="one-time-code"
//               />
//             </div>
//             <p className="mt-2 text-center text-xs text-gray-500">
//               Dummy OTP for test:{' '}
//               <span className="font-semibold tracking-widest">{otp}</span>
//             </p>
//             <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
//               <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
//               The customer received this OTP via SMS when the order was marked
//               as &quot;Out for Delivery&quot;. This confirms they have received
//               the items.
//             </div>
//           </div> */}

//           <div className="mt-4">
//             <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
//               <ShieldCheck className="h-4 w-4 text-orange-500" />
//               Proof of Delivery (OTP)
//             </p>
//             {/* <p className="mt-1 text-sm text-gray-600">
//               Send OTP to customer&apos;s email, then ask them for the code.
//             </p> */}
//             <p className="mt-1 text-sm text-gray-600">
//               Ask the customer for the 4-digit OTP sent to their gmail.
//             </p>

//             {/* Send / Resend OTP button */}
//             {kycBlockedMessage ? (
//               <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
//                 <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
//                 <span>
//                   <span className="font-semibold block">Delivery Blocked</span>
//                   <span className="block text-xs text-red-700 mt-1">
//                     {kycBlockedMessage}
//                   </span>
//                 </span>
//               </div>
//             ) : (
//               <button
//                 type="button"
//                 onClick={onSendOtp}
//                 disabled={sendingOtp}
//                 className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-800 text-sm font-semibold hover:bg-orange-100 disabled:opacity-50"
//               >
//                 {sendingOtp
//                   ? 'Sending...'
//                   : otpSent
//                     ? 'Resend OTP'
//                     : 'Send OTP to Customer'}
//               </button>
//             )}

//             {otpSent && (
//               <>
//                 <div
//                   className="mt-4 flex items-center justify-center gap-3"
//                   onClick={() => otpInputRef.current?.focus()}
//                 >
//                   {[0, 1, 2, 3].map((idx) => (
//                     <div
//                       key={idx}
//                       className="h-12 w-12 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-900 flex items-center justify-center"
//                     >
//                       {otpInput[idx] ? (
//                         otpInput[idx]
//                       ) : (
//                         <span className="text-gray-300">•</span>
//                       )}
//                     </div>
//                   ))}
//                   <input
//                     ref={otpInputRef}
//                     value={otpInput}
//                     onChange={(e) =>
//                       setOtpInput(
//                         String(e.target.value || '')
//                           .replace(/\D/g, '')
//                           .slice(0, 4),
//                       )
//                     }
//                     className="sr-only"
//                     inputMode="numeric"
//                     autoComplete="one-time-code"
//                   />
//                 </div>
//                 {/* <p className="mt-2 text-center text-xs text-gray-500">
//                   OTP sent to customer&apos;s email. Valid for 10 minutes.
//                 </p> */}
//                 {/* <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
//                   <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
//                   Ask the customer for the OTP they received on their registered
//                   email.
//                 </div> */}
//                 <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
//                   <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
//                   The customer receives this OTP via their registered email.
//                   This confirms that they have received the items.
//                 </div>
//               </>
//             )}
//           </div>

//           {requiresInstallation ? (
//             <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
//               {/* header */}
//               <div className="flex items-start gap-3">
//                 <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#9810FA]">
//                   <Wrench className="h-5 w-5" />
//                 </span>

//                 <div>
//                   <p className="font-semibold text-gray-900">
//                     Installation Required
//                   </p>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Some items need installation before delivery completion
//                   </p>
//                 </div>
//               </div>

//               {/* items */}
//               {/* <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
//                 <p className="text-[11px] uppercase tracking-wide text-gray-400">
//                   Items to install
//                 </p>
//                 <p className="mt-1 text-sm text-gray-800">{productTitle}</p>
//               </div> */}
//               <div className="mt-3 rounded-lg border border-[#DAB2FF] bg-white px-3 py-2.5">
//                 <p className="text-[11px] uppercase tracking-wide text-gray-400">
//                   Items to install
//                 </p>

//                 <div className="mt-1 flex items-center gap-2">
//                   <span className="h-2 w-2 rounded-full bg-[#9810FA]" />
//                   <p className="text-sm font-medium text-black">
//                     {productTitle}
//                   </p>
//                 </div>
//               </div>

//               {/* checkbox */}
//               <label className="mt-3 flex items-start gap-3 rounded-xl border border-[#DAB2FF] bg-white px-3 py-2.5 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={installationDone}
//                   onChange={(e) =>
//                     setInstallationDone(Boolean(e.target.checked))
//                   }
//                   className="mt-0.5 h-5 w-5 rounded border-[#C27AFF] text-violet-600 focus:ring-violet-500"
//                 />
//                 <span>
//                   <span className="text-sm font-semibold text-gray-900">
//                     Installation Completed{' '}
//                     <span className="text-red-500">*</span>
//                   </span>
//                   <span className="block text-xs text-gray-500">
//                     Check this box after completing installation and testing
//                   </span>
//                 </span>
//               </label>
//             </div>
//           ) : null}

//           {/* <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
//               <IndianRupee className="h-4 w-4 text-orange-500" />
//               Settlement Preview
//             </p>
//             <div className="mt-2 flex items-center justify-between text-sm">
//               <span className="text-gray-500">Order Value</span>
//               <span className="font-semibold text-gray-900">
//                 {money(orderValue)}
//               </span>
//             </div>
//             <div className="mt-3 rounded-lg border border-[#FFB86A] bg-[#FFFBEB] px-3 py-2.5 flex items-center justify-between">
//               <span className="text-sm font-semibold text-[#9F2D00]">
//                 Your Payout
//               </span>
//               <span className="text-2xl font-bold text-amber-700">
//                 {money(payoutValue)}
//               </span>
//             </div>

//             <div className="mt-2 flex items-start gap-1 text-xs text-gray-500">
//               <Calendar className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
//               <p>
//                 Will move to{' '}
//                 <span className="text-black font-semibold">
//                   Pending Settlement
//                 </span>{' '}
//                 after delivery confirmation
//               </p>
//             </div>
//           </div> */}

//           {!canConfirm ? (
//             <div className="mt-4 rounded-xl border border-[#FFD230] bg-[#FFFBEB] px-3 py-2.5 text-sm text-amber-900 flex gap-2">
//               <CircleAlert className="h-4 w-4 mt-0.5 text-[#E17100] shrink-0" />
//               <span>
//                 <span className="font-semibold text-[#7B3306] block">
//                   Complete Required Steps
//                 </span>
//                 <span className="block text-[#973C00] text-xs mt-1">
//                   {otpOk ? '✓' : '✗'} Enter the 4-digit OTP from customer
//                 </span>
//                 {requiresInstallation ? (
//                   <span className="block text-[#973C00] text-xs">
//                     {installationDone ? '✓' : '✗'} Confirm installation is
//                     completed
//                   </span>
//                 ) : null}
//               </span>
//             </div>
//           ) : (
//             // <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 flex gap-2">
//             //   <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
//             //   <span>OTP verified. Ready to confirm delivery.</span>
//             // </div>
//             <div></div>
//           )}

//           <button
//             type="button"
//             disabled={!canConfirm}
//             onClick={onConfirm}
//             className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white enabled:hover:bg-[#e56400] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2"
//           >
//             {confirming ? (
//               'Confirming...'
//             ) : (
//               <>
//                 <CheckCircle2 className="h-4 w-4" />
//                 Confirm Delivery
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // function ReturnInspectionModal({
// //   open,
// //   order,
// //   checklist,
// //   setChecklist,
// //   pickupPhotoName,
// //   setPickupPhotoName,
// function ReturnInspectionModal({
//   open,
//   order,
//   checklist,
//   setChecklist,
//   pickupPhotoName,
//   setPickupPhotoName,
//   setPickupPhotoFile,
//   damageDeduction,
//   setDamageDeduction,
//   cleaningFees,
//   setCleaningFees,
//   authorizeRefund,
//   setAuthorizeRefund,
//   submitting,
//   onClose,
//   onSubmit,
// }) {
//   const [pickupPhotoPreview, setPickupPhotoPreview] = useState('');

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

//   useEffect(() => {
//     return () => {
//       if (pickupPhotoPreview) {
//         URL.revokeObjectURL(pickupPhotoPreview);
//       }
//     };
//   }, [pickupPhotoPreview]);

//   if (!open || !order) return null;

//   const depositHeld = Math.max(0, Number(order?.refundableDeposit || 0));
//   const safeDamage = Math.max(0, Number(damageDeduction || 0));
//   const safeCleaning = Math.max(0, Number(cleaningFees || 0));
//   const finalRefundAmount = Math.max(
//     0,
//     depositHeld - safeDamage - safeCleaning,
//   );
//   const canSubmit = Boolean(pickupPhotoName && authorizeRefund) && !submitting;
//   const originalPhotoTakenOn = (() => {
//     const src = order?.primaryProduct?.createdAt || order?.createdAt;
//     if (!src) return '—';
//     const d = new Date(src);
//     if (Number.isNaN(d.getTime())) return '—';
//     return d.toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });
//   })();

//   const checklistRows = [
//     {
//       key: 'powerFunctionCheck',
//       label: 'Power / Function Check',
//       hint: 'All features working as expected',
//     },
//     {
//       key: 'surfaceScratches',
//       label: 'Surface Scratches',
//       hint: 'Visible scratches or scuff marks',
//     },
//     {
//       key: 'structuralIntegrity',
//       label: 'Structural Integrity',
//       hint: 'Frame and build quality intact',
//     },
//     {
//       key: 'accessoriesAccountedFor',
//       label: 'Accessories Accounted For',
//       hint: 'All included items returned',
//     },
//     {
//       key: 'cleanlinessCheck',
//       label: 'Cleanliness Check',
//       hint: 'Item returned in clean condition',
//     },
//   ];

//   return (
//     <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
//             <div className="flex items-start gap-3">
//               {/* <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F54900] to-[#F97316] text-white shadow-sm">
//                 <ClipboardCheck className="h-7 w-7" />
//               </span> */}
//               <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F54900] to-[#F97316] shadow-sm">
//                 <img
//                   src={ClipboardCheckIcon.src}
//                   alt="Clipboard Check"
//                   className="w-7 h-7 shrink-0 brightness-0 invert"
//                 />
//               </span>
//               <div>
//                 <h2 className="text-xl font-semibold leading-tight text-gray-900">
//                   Return Inspection: Order #{order.displayId}
//                 </h2>
//                 <p className="mt-0.5 text-sm text-gray-500">
//                   {order.customerName} - {order.productName}
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
//               aria-label="Close inspection"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           <div className="mt-4">
//             <h3 className="text-xl font-semibold leading-[1.1] text-gray-900">
//               Condition Comparison
//             </h3>
//             <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <p className="text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
//                   <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
//                   Original Delivery Condition
//                 </p>
//                 <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2.5">
//                   <div className="relative h-[208px] rounded-lg bg-gray-100 overflow-hidden">
//                     {order.productImage ? (
//                       <img
//                         src={order.productImage}
//                         alt=""
//                         className="h-full w-full object-cover"
//                       />
//                     ) : null}
//                     <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
//                       DELIVERED
//                     </span>
//                   </div>
//                 </div>
//                 <p className="mt-2 text-[11px] text-gray-400">
//                   Photo taken on: {originalPhotoTakenOn}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
//                   <Camera className="h-3.5 w-3.5 text-orange-500" />
//                   New Pickup Photo <span className="text-red-600">*</span>
//                 </p>
//                 <label className="mt-2 flex h-[232px] cursor-pointer flex-col items-center justify-center rounded-xl border border-[#99A1AF] bg-[#F9FAFB] text-sm text-gray-600 hover:bg-gray-50">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (pickupPhotoPreview) {
//                         URL.revokeObjectURL(pickupPhotoPreview);
//                       }
//                       // if (file) {
//                       //   setPickupPhotoName(file.name);
//                       //   setPickupPhotoPreview(URL.createObjectURL(file));
//                       // } else {
//                       //   setPickupPhotoName('');
//                       //   setPickupPhotoPreview('');
//                       // }
//                       if (file) {
//                         setPickupPhotoName(file.name);
//                         setPickupPhotoFile(file);
//                         setPickupPhotoPreview(URL.createObjectURL(file));
//                       } else {
//                         setPickupPhotoName('');
//                         setPickupPhotoFile(null);
//                         setPickupPhotoPreview('');
//                       }
//                     }}
//                   />
//                   {pickupPhotoPreview ? (
//                     <img
//                       src={pickupPhotoPreview}
//                       alt="Pickup preview"
//                       className="h-full w-full rounded-xl object-cover"
//                     />
//                   ) : (
//                     <>
//                       <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316] text-white shadow-sm">
//                         <Upload className="h-5 w-5" />
//                       </span>
//                       <span className="mt-3 text-[17px] font-semibold text-gray-900">
//                         Upload Pickup Photo
//                       </span>
//                       <span className="mt-1 text-[13px] text-gray-500">
//                         Click or drag to upload
//                       </span>
//                     </>
//                   )}
//                 </label>
//                 <p className="mt-2 text-[11px] text-gray-400">
//                   {/* {pickupPhotoName || 'No file selected'} */}
//                   {pickupPhotoName || 'Upload required to proceed'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-5  p-4">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Inspection Checklist
//             </h3>
//             <div className="mt-4 rounded-xl border border-[#D1D5DC] bg-[#F9FAFB] px-4 py-3">
//               {checklistRows.map((row) => (
//                 <label
//                   key={row.key}
//                   className="flex items-center justify-between py-2"
//                 >
//                   <span>
//                     <span className="block text-[15px] leading-[1.15] font-semibold text-gray-900">
//                       {row.label}
//                     </span>
//                     <span className="block text-[12px] leading-[1.2] text-gray-500">
//                       {row.hint}
//                     </span>
//                   </span>
//                   <span className="relative inline-flex h-8 w-14 items-center">
//                     <input
//                       type="checkbox"
//                       checked={Boolean(checklist[row.key])}
//                       onChange={(e) =>
//                         setChecklist((prev) => ({
//                           ...prev,
//                           [row.key]: Boolean(e.target.checked),
//                         }))
//                       }
//                       className="peer sr-only"
//                     />
//                     <span className="absolute inset-0 rounded-full bg-gray-200 transition peer-checked:bg-[#10B981]" />
//                     <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-6" />
//                   </span>
//                 </label>
//               ))}

//               <div className="mt-2 rounded-xl border border-[#8EC5FF] bg-[#EFF6FF] px-4 py-3">
//                 <p className="inline-flex items-center gap-2 text-[15px] font-semibold leading-[1.1] text-gray-900">
//                   <Shield className="h-5 w-5 text-[#2563EB]" />
//                   Rentnpay Care Protection
//                 </p>
//                 <p className="mt-1 text-[12px] leading-[1.3] text-gray-500">
//                   Minor wear (scratches &lt;2cm, light scuff marks) is covered
//                   by Rentnpay Care and should not be deducted from the
//                   customer&apos;s deposit.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-5">
//             <h3 className="inline-flex items-center gap-1 text-base font-semibold text-gray-900">
//               <DollarSign className="h-4 w-4 text-[#10B981]" />
//               Refund &amp; Deduction Calculator
//             </h3>

//             <div className="mt-3 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
//               <div className="flex items-center justify-between border-b border-gray-200 pb-3">
//                 <span className="text-sm leading-[1.15] text-gray-500">
//                   Total Deposit Held
//                 </span>
//                 <span className="text-[34px] font-semibold leading-none text-gray-900">
//                   {money(depositHeld)}
//                 </span>
//               </div>

//               <div className="mt-4">
//                 <label className="text-sm font-semibold leading-[1.15] text-gray-900">
//                   Damage Deduction
//                 </label>
//                 <div className="mt-2 relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EF4444] font-semibold  text-sm">
//                     ₹
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={damageDeduction}
//                     onChange={(e) => setDamageDeduction(e.target.value)}
//                     className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm"
//                   />
//                 </div>
//                 <p className="mt-1 text-sm leading-[1.3] text-gray-500">
//                   Amount deducted for repair/replacement costs
//                 </p>
//               </div>

//               <div className="mt-3">
//                 <label className="text-[15px] font-semibold leading-[1.15] text-gray-900">
//                   Cleaning Fees
//                 </label>
//                 <div className="mt-2 relative max-w-[420px]">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EF4444] font-semibold text-sm">
//                     ₹
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={cleaningFees}
//                     onChange={(e) => setCleaningFees(e.target.value)}
//                     className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm"
//                   />
//                 </div>
//               </div>

//               <div className="mt-4 border-t border-gray-200 pt-4">
//                 <div className="rounded-xl border border-[#05DF72] bg-[#ECFDF5] px-4 py-3 flex items-center justify-between">
//                   <div>
//                     <p className="text-[15px] font-semibold leading-[1.15] text-black">
//                       Final Refund Amount
//                     </p>
//                     <p className="mt-1 text-[12px] leading-[1.3] text-[#64748B]">
//                       Amount to be refunded to customer&apos;s account
//                     </p>
//                   </div>
//                   <span className="text-[34px] font-bold leading-none text-emerald-600">
//                     {money(finalRefundAmount)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-5 p-4">
//             <h3 className="text-base font-semibold text-black">
//               Authorization
//             </h3>
//             <label className="mt-3 flex items-start gap-3 rounded-lg border border-[#D1D5DC] px-3 py-2.5">
//               <input
//                 type="checkbox"
//                 checked={authorizeRefund}
//                 onChange={(e) => setAuthorizeRefund(Boolean(e.target.checked))}
//                 className="mt-0.5 h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//               />
//               <span>
//                 <span className="block text-sm font-semibold text-gray-800">
//                   I verify that the inspection is complete and authorize the
//                   refund of {money(finalRefundAmount)}.
//                 </span>
//                 <span className="mt-1 block text-xs text-gray-500">
//                   By checking this box, you confirm all inspection details are
//                   accurate and the refund amount is correct.
//                 </span>
//               </span>
//             </label>
//           </div>

//           <button
//             type="button"
//             disabled={!canSubmit}
//             onClick={onSubmit}
//             className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white enabled:hover:bg-[#e56400] disabled:cursor-not-allowed disabled:bg-orange-200 inline-flex items-center justify-center gap-2"
//           >
//             {submitting ? (
//               'Initiating...'
//             ) : (
//               <>
//                 <CheckCircle2 className="h-4 w-4" />
//                 Initiate Refund & Close Order
//               </>
//             )}
//           </button>
//           <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs text-gray-500">
//             <CircleAlert className="h-3.5 w-3.5 text-[#F97316]" />
//             Upload pickup photo and complete authorization to proceed
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function generateOrderInvoicePDF(order, categoryRateMap) {
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

//   // Determine whether this row came from the Pickup tab or Relocate tab,
//   // so the date field reflects the relevant date instead of the order date.
//   const isRelocationOrder = Boolean(
//     order?.relocationRequest?.requestedAt && order?.newAddress,
//   );
//   const isPickupOrder =
//     Boolean(order?.hasScheduledReturnPickup) ||
//     Boolean(order?.returnRequest?.pickupScheduledAt);

//   let dateLabel = 'Order Date';
//   let dateValue = invDate;
//   if (isRelocationOrder) {
//     dateLabel = 'Relocation Date';
//     dateValue = order?.relocationRequest?.requestedAt
//       ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//           'en-IN',
//           { day: '2-digit', month: 'short', year: 'numeric' },
//         )
//       : '-';
//   } else if (isPickupOrder) {
//     dateLabel = 'Pickup Date';
//     dateValue = order?.returnRequest?.pickupScheduledAt
//       ? new Date(order.returnRequest.pickupScheduledAt).toLocaleDateString(
//           'en-IN',
//           { day: '2-digit', month: 'short', year: 'numeric' },
//         )
//       : invDate;
//   }

//   const details = [
//     ['Order Number', order.displayId || '-'],
//     [dateLabel, dateValue],
//     ...(isRelocationOrder ? [['Relocation Amount', 'Rs. 0']] : []),
//     [
//       'Order Type',
//       order.orderType || (order.isServiceBooking ? 'Service' : '-'),
//     ],
//     ['Customer', order.customerName || '-'],
//     ...(!order.isServiceBooking &&
//     String(order.orderType || '') !== 'Buy' &&
//     Number(order.refundableDeposit || 0) > 0
//       ? [
//           [
//             'Refundable Deposit',
//             `Rs. ${Number(order.refundableDeposit).toLocaleString('en-IN')}`,
//           ],
//         ]
//       : []),
//     //   ...(!order.isServiceBooking && Number(order.taxesAmount || 0) > 0
//     //     ? [
//     //         [
//     //           'Other Taxes',
//     //           `Rs. ${Number(order.taxesAmount).toLocaleString('en-IN')}`,
//     //         ],
//     //       ]
//     //     : []),
//     // ];
//     // leftY += 7;
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
//   pdf.text(order.phone || order.user?.phone || '-', rightX - 6, rightY, {
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
//   // const itemLabel = `Item: ${order.productName || 'Product'}${
//   //   order.variantName ? ` (${order.variantName})` : ''
//   // }`;
//   // const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

//   // let statusCapitalized;
//   // if (isRelocationOrder) {
//   //   const relocStatus = String(order?.relocationRequest?.status || 'requested');
//   //   statusCapitalized = relocStatus === 'confirmed' ? 'Completed' : 'Requested';
//   // } else {
//   //   const statusLabel = String(
//   //     order.status === 'pending' ? 'Processing' : order.status || '-',
//   //   );
//   //   statusCapitalized =
//   //     statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
//   // }

//   // pdf.setFontSize(8);
//   // pdf.text('1', cols[0].x, rowTop + 4);
//   // pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
//   // pdf.text(String(order.quantity || 1), cols[2].x, rowTop + 4);
//   // pdf.text(statusCapitalized, cols[3].x, rowTop + 4);
//   // pdf.text(
//   //   `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
//   //   cols[4].x,
//   //   rowTop + 4,
//   //   { align: 'right' },
//   // );

//   // const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//   // pdf.setDrawColor(225);
//   // pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
//   // y = rowTop + rowHeight + 4;

//   let statusCapitalized;
//   if (isRelocationOrder) {
//     const relocStatus = String(order?.relocationRequest?.status || 'requested');
//     statusCapitalized = relocStatus === 'confirmed' ? 'Completed' : 'Requested';
//   } else {
//     const statusLabel = String(
//       order.status === 'pending' ? 'Processing' : order.status || '-',
//     );
//     statusCapitalized =
//       statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
//   }

//   // When this order has more than one product line for this vendor,
//   // list every product with its own price, then show the order total —
//   // so the invoice matches the full order amount already shown in the
//   // table row. Single-product orders keep the original single-row layout.
//   const vendorIdForInvoice = String(
//     order?.primaryProduct?.vendorId?._id ||
//       order?.primaryProduct?.vendorId ||
//       '',
//   );
//   const vendorInvoiceLines = (order?.products || []).filter((l) => {
//     const p = l?.product;
//     if (!p || typeof p === 'string') return false;
//     const vid = p.vendorId?._id ?? p.vendorId;
//     return vendorIdForInvoice && String(vid) === vendorIdForInvoice;
//   });
//   const isMultiProductInvoice =
//     !order.isServiceBooking &&
//     !isRelocationOrder &&
//     vendorInvoiceLines.length > 1;

//   // Each product line can be in a different status (e.g. one shipped,
//   // one confirmed) — resolve status per line instead of reusing the
//   // single shared statusCapitalized value.
//   const lineStatusCapitalized = (line) => {
//     const raw = String(line?.lineStatus || order.status || '');
//     const label = raw === 'pending' ? 'Processing' : raw || '-';
//     return label.charAt(0).toUpperCase() + label.slice(1);
//   };

//   pdf.setFontSize(8);

//   if (isMultiProductInvoice) {
//     let rowStartY = y;
//     let sno = 1;
//     vendorInvoiceLines.forEach((line) => {
//       const lp = line?.product;
//       const qty = Number(line?.quantity || 1);
//       const rate = Number(line?.pricePerDay || 0);
//       const lineAmount = rate * qty;
//       const itemLabel = `Item: ${lp?.productName || lp?.title || 'Product'}${
//         line?.variantName ? ` (${line.variantName})` : ''
//       }`;
//       const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);
//       const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
//       const thisLineStatus = lineStatusCapitalized(line);

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
//         rowHeight,
//         2,
//         2,
//         'S',
//       );
//       rowStartY += rowHeight + 4;
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
//     const rowTop = y;
//     const itemLabel = `Item: ${order.productName || 'Product'}${
//       order.variantName ? ` (${order.variantName})` : ''
//     }`;
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
//     pdf.text(String(order.quantity || 1), cols[2].x, rowTop + 4);
//     pdf.text(statusCapitalized, cols[3].x, rowTop + 4);
//     pdf.text(
//       `Rs.${rowItemAmount.toLocaleString('en-IN')}`,
//       cols[4].x,
//       rowTop + 4,
//       { align: 'right' },
//     );

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

//   // Relocation-specific address details (Current/Old address + New address),
//   // shown dynamically based on whether the relocation has been confirmed.
//   if (isRelocationOrder) {
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

// // function OrderDetailsModal({ open, order, onClose }) {
// function OrderDetailsModal({ open, order, onClose, vendorIdStr }) {
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

//   // When this order has more than one product line belonging to this
//   // vendor, show all of them here so the modal total matches the full
//   // order amount already shown in the table row. Single-product orders
//   // are unaffected — they keep showing just their own detail rows below.
//   const vendorOrderLines = (order?.products || []).filter((l) =>
//     lineMatchesVendor(l, vendorIdStr),
//   );
//   const isMultiProductOrder = vendorOrderLines.length > 1;
//   const multiProductRows = isMultiProductOrder
//     ? vendorOrderLines.map((l) => {
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

//   const isRelocationOrder = Boolean(
//     order?.relocationRequest?.requestedAt && order?.newAddress,
//   );
//   const isRelocationConfirmed =
//     String(order?.relocationRequest?.status || '') === 'confirmed';

//   const orderDate = order.createdAt
//     ? new Date(order.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       })
//     : '-';

//   const relocationDate = order?.relocationRequest?.requestedAt
//     ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : '-';

//   const pickupDate = order?.returnRequest?.pickupScheduledAt
//     ? new Date(order.returnRequest.pickupScheduledAt).toLocaleDateString(
//         'en-IN',
//         { day: '2-digit', month: 'short', year: 'numeric' },
//       )
//     : '-';

//   const statusText = order.isServiceBooking
//     ? getServiceStatusMeta(order).label
//     : isRelocationOrder
//       ? isRelocationConfirmed
//         ? 'Completed'
//         : 'Requested'
//       : statusDisplayLabel(order.status);

//   const statusClass = order.isServiceBooking
//     ? getServiceStatusMeta(order).badgeClass
//     : isRelocationOrder
//       ? isRelocationConfirmed
//         ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
//         : 'border-blue-200 bg-blue-50 text-blue-700'
//       : statusBadgeClasses(order.status);

//   const oldAddr = order?.currentAddress || {};
//   const newAddr = order?.newAddress || {};

//   // const detailRows = [
//   //   ['Order ID', order.displayId || '-'],
//   //   ['Customer', order.customerName || '-'],
//   //   ['Delivery Number', order.phone || order.user?.phone || '-'],
//   //   ['Registered Number', order.user?.mobileNumber || order.user?.phone || '-'],
//   //   ['Product', order.productName || '-'],
//   //   ...(order.variantName ? [['Variant', order.variantName]] : []),
//   //   [
//   //     'Order Type',
//   //     order.orderType || (order.isServiceBooking ? 'Service' : '-'),
//   //   ],

//   //   [
//   //     order.isServiceBooking ? 'Amount' : 'Product Amount',
//   //     money(
//   //       order.isServiceBooking
//   //         ? order.amount
//   //         : (order.productOnlyAmount ?? order.amount),
//   //     ),
//   //   ],
//   //   ...(order.refundableDeposit
//   //     ? [['Refundable Deposit', money(order.refundableDeposit)]]
//   //     : []),

//   //   ...(order.taxesAmount ? [['Other Taxes', money(order.taxesAmount)]] : []),
//   //   ['Order Date', orderDate],
//   //   ...(isRelocationOrder ? [['Relocation Date', relocationDate]] : []),
//   //   ...(order.hasScheduledReturnPickup ? [['Pickup Date', pickupDate]] : []),
//   // ];

//   const detailRows = [
//     ['Order ID', order.displayId || '-'],
//     ['Product', order.productName || '-'],
//     ['Customer', order.customerName || '-'],
//     [
//       order.isServiceBooking ? 'Amount' : 'Product Amount',
//       money(
//         order.isServiceBooking
//           ? order.amount
//           : (order.productOnlyAmount ?? order.amount),
//       ),
//     ],
//     ['Registered Number', order.user?.mobileNumber || order.user?.phone || '-'],
//     ...(order.refundableDeposit
//       ? [['Refundable Deposit', money(order.refundableDeposit)]]
//       : []),
//     ['Delivery Number', order.phone || order.user?.phone || '-'],
//     ['Order Date', orderDate],
//     [
//       'Order Type',
//       order.orderType || (order.isServiceBooking ? 'Service' : '-'),
//     ],
//     ...(order.variantName ? [['Variant', order.variantName]] : []),
//     ...(isRelocationOrder ? [['Relocation Date', relocationDate]] : []),
//     ...(order.hasScheduledReturnPickup ? [['Pickup Date', pickupDate]] : []),
//   ];
//   return (
//     <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/60" aria-hidden />
//       <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//         <div className="p-5 sm:p-6">
//           <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
//             <div className="flex items-start gap-3">
//               <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-sm">
//                 <Package className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-lg font-semibold leading-tight text-gray-900">
//                   Order #{order.displayId}
//                 </h2>
//                 <p className="mt-0.5 text-sm text-gray-500">
//                   {order.customerName} - {order.productName}
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
//               aria-label="Close order details"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           {/* <div className="mt-4 flex items-center gap-3">
//             {order.productImage ? (
//               <img
//                 src={order.productImage}
//                 alt=""
//                 className="h-16 w-16 rounded-xl object-cover border border-gray-200"
//               />
//             ) : (
//               <div className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200" />
//             )}
//             <span
//               className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-xs font-semibold capitalize ${statusClass}`}
//             >
//               {statusText}
//             </span>
//           </div> */}

//           <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
//             <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//               <ClipboardCheck className="h-4 w-4 text-orange-500" />
//               Order Details
//             </p>

//             {isMultiProductOrder ? (
//               <>
//                 <div className="mt-3 space-y-2">
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
//                 <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm border-t border-gray-200 pt-3">
//                   {detailRows
//                     .filter(
//                       ([label]) =>
//                         label !== 'Product' &&
//                         label !== 'Variant' &&
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
//                   <div className="flex items-center justify-between gap-3 sm:col-span-2 border-t border-gray-200 pt-2 mt-1">
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
//               <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
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

//           {/* <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
//             <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//               <User className="h-4 w-4 text-blue-500" />
//               Customer Address
//             </p>
//             <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
//           </div> */}

//           <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
//             <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//               <User className="h-4 w-4 text-blue-500" />
//               Customer Address
//             </p>
//             <p className="mt-2 text-sm text-gray-700">{order.address || '-'}</p>
//           </div>

//           {order.deliveryInstructions ? (
//             <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//                 <Info className="h-4 w-4 text-amber-600" />
//                 Customer Message
//               </p>
//               <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
//                 {order.deliveryInstructions}
//               </p>
//             </div>
//           ) : null}

//           {isRelocationOrder ? (
//             <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
//               <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-blue-600" />
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
//           {/*
//           <button
//             type="button"
//             onClick={() => generateOrderInvoicePDF(order, categoryRateMap)}
//             className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white hover:bg-[#e56400] shadow-sm inline-flex items-center justify-center gap-2"
//           >
//             <Download className="h-4 w-4" />
//             Download Invoice
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function VendorOrdersPage() {
//   const { user, token } = useSelector((s) => s.vendor);
//   const [orders, setOrders] = useState([]);
//   const [serviceBookings, setServiceBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [updatingId, setUpdatingId] = useState('');
//   const [deliveryModal, setDeliveryModal] = useState({
//     open: false,
//     order: null,
//     otp: '',
//   });
//   const [kycBlockedMessage, setKycBlockedMessage] = useState('');
//   const [otpInput, setOtpInput] = useState('');
//   const [installationDone, setInstallationDone] = useState(false);
//   const [returnModal, setReturnModal] = useState({
//     orderId: null,
//     productId: null,
//   });
//   const [inspectionModal, setInspectionModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [completeServiceModal, setCompleteServiceModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [relocationConfirmModal, setRelocationConfirmModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [newOrderModal, setNewOrderModal] = useState({
//     open: false,
//     orderId: null,
//   });
//   const [viewModal, setViewModal] = useState({
//     open: false,
//     order: null,
//   });
//   const [confirmingRelocation, setConfirmingRelocation] = useState(false);
//   const [serviceOtpInput, setServiceOtpInput] = useState('');
//   const [serviceOtpSent, setServiceOtpSent] = useState(false);
//   const [sendingServiceOtp, setSendingServiceOtp] = useState(false);
//   const [verifyingServiceOtp, setVerifyingServiceOtp] = useState(false);
//   const [inspectionChecklist, setInspectionChecklist] = useState({
//     powerFunctionCheck: true,
//     surfaceScratches: false,
//     structuralIntegrity: true,
//     accessoriesAccountedFor: true,
//     cleanlinessCheck: true,
//   });
//   // const [inspectionPickupPhotoName, setInspectionPickupPhotoName] =
//   //   useState('');
//   const [inspectionPickupPhotoName, setInspectionPickupPhotoName] =
//     useState('');
//   const [inspectionPickupPhotoFile, setInspectionPickupPhotoFile] =
//     useState(null);
//   const [damageDeduction, setDamageDeduction] = useState('0');
//   const [cleaningFees, setCleaningFees] = useState('0');
//   const [authorizeRefund, setAuthorizeRefund] = useState(false);
//   // const [activeTab, setActiveTab] = useState('Processing');
//   // const [query, setQuery] = useState('');
//   // const [sendingOtp, setSendingOtp] = useState(false);
//   const [activeTab, setActiveTab] = useState('Processing');
//   const [query, setQuery] = useState('');
//   const [sendingOtp, setSendingOtp] = useState(false);
//   // const [dateFilter, setDateFilter] = useState('all');
//   // const [statusFilter, setStatusFilter] = useState('all');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [customerFilter, setCustomerFilter] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const PAGE_SIZE = 10;

//   const vendorIdStr = String(user?.id || user?._id || '');

//   const fetchOrders = useCallback(async () => {
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       setError('Please login again to continue.');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       const [ordersRes, bookingsRes] = await Promise.all([
//         apiGetVendorOrders(authToken),
//         apiGetVendorServiceBookings(authToken),
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
//   }, [token]);

//   const handleSendDeliveryOtp = async () => {
//     const order = deliveryModal.order;
//     if (!order?._id) return;

//     const productId = String(
//       order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//     );
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);

//     setSendingOtp(true);
//     try {
//       await apiSendVendorDeliveryOtp(order._id, productId, authToken);
//       toast.success('OTP sent to customer email!');
//       setKycBlockedMessage('');
//       // Mark OTP as sent so button changes to "Resend OTP"
//       setDeliveryModal((prev) => ({ ...prev, otpSent: true }));
//     } catch (err) {
//       console.error('OTP send error:', err);
//       const msg = err?.response?.data?.message || 'Failed to send OTP.';
//       if (err?.response?.data?.kycBlocked) {
//         setKycBlockedMessage(msg);
//       } else {
//         toast.error(msg);
//       }
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab, query, dateFilter, statusFilter, customerFilter]);

//   useEffect(() => {
//     setStatusFilter('all');
//   }, [activeTab]);
//   useEffect(() => {
//     const onOrdersChanged = () => fetchOrders();
//     window.addEventListener('vendor-orders-changed', onOrdersChanged);
//     return () =>
//       window.removeEventListener('vendor-orders-changed', onOrdersChanged);
//   }, [fetchOrders]);

//   // const normalizedOrders = useMemo(() => {
//   //   if (!vendorIdStr) return [];
//   //   // return (orders || []).map((o) => normalizeVendorOrder(o, vendorIdStr));
//   //   const rows = flattenVendorOrderLines(orders || [], vendorIdStr);
//   //   for (const booking of serviceBookings || []) {
//   //     rows.push({
//   //       ...booking,
//   //       _rowId: `service-${booking._id}`,
//   //       status: booking.status || 'pending',
//   //       amount: Number(booking.totalAmount || 0),
//   //       displayId: `SRV-${String(booking._id).slice(-3).toUpperCase()}`,
//   //       customerName: booking.user?.fullName || booking.name || '-',
//   // const normalizedOrders = useMemo(() => {
//   //   if (!vendorIdStr) return [];

//   //   const sortedOrders = [...(orders || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const sortedBookings = [...(serviceBookings || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const orderNumberMap = new Map(
//   //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//   //   );
//   //   const bookingNumberMap = new Map(
//   //     sortedBookings.map((b, idx) => [String(b._id), idx + 1]),
//   //   );

//   //   const rows = flattenVendorOrderLines(
//   //     sortedOrders,
//   //     vendorIdStr,
//   //     orderNumberMap,
//   //   );
//   //   for (const booking of sortedBookings) {
//   //     rows.push({
//   //       ...booking,
//   //       _rowId: `service-${booking._id}`,
//   //       status: booking.status || 'pending',
//   //       amount: Number(booking.totalAmount || 0),
//   //       // displayId: `SRV-${String(bookingNumberMap.get(String(booking._id)) || 0).padStart(3, '0')}`,
//   //       displayId: `SRV-${String(booking.bookingNumber || 0).padStart(3, '0')}`,
//   const normalizedOrders = useMemo(() => {
//     if (!vendorIdStr) return [];

//     // const rows = flattenVendorOrderLines(orders || [], vendorIdStr);
//     // for (const booking of serviceBookings || []) {
//     //   rows.push({
//     //     ...booking,
//     //     _rowId: `service-${booking._id}`,
//     //     status: booking.status || 'pending',
//     //     amount: Number(booking.totalAmount || 0),
//     //     displayId: `SRV-${String(booking?.bookingNumber || 0).padStart(4, '0')}`,
//     //     customerName: booking.user?.fullName || booking.name || '-',
//     //     productName:
//     //       booking.serviceSnapshot?.productName ||
//     //       booking.serviceProduct?.productName ||
//     //       'Service booking',
//     //     productImage:
//     //       booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
//     //     primaryProduct: booking.serviceProduct || null,
//     //     primaryLine: null,
//     //     isServiceBooking: true,
//     //   });
//     // }
//     // return rows;
//     const rows = flattenVendorOrderLines(orders || [], vendorIdStr);
//     for (const booking of serviceBookings || []) {
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
//         status: booking.status || 'pending',
//         amount: Number(booking.totalAmount || 0),
//         displayId: `SRV-${String(booking?.bookingNumber || 0).padStart(4, '0')}`,
//         customerName: booking.user?.fullName || booking.name || '-',
//         productName:
//           booking.serviceSnapshot?.productName ||
//           booking.serviceProduct?.productName ||
//           'Service booking',
//         productImage:
//           booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
//         primaryProduct: booking.serviceProduct || null,
//         primaryLine: null,
//         isServiceBooking: true,
//         taxesAmount: Math.max(0, svcComputedTaxTotal),
//       });
//     }
//     return rows;
//   }, [orders, serviceBookings, vendorIdStr]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     // Hide pending orders — they only appear via the New Order modal
//   //     // until vendor accepts them (which moves them to 'confirmed')
//   //     if (String(o.status) === 'pending' && !o.vendorAcknowledged) return false;

//   //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) {
//   //       return false;
//   //     }
//   //     const tabMatch = allowed.length
//   //       ? allowed.includes(String(o.status))
//   //       : true;
//   //     if (!tabMatch) return false;
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [normalizedOrders, activeTab, query]);

//   // const filteredOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const allowed = mapTabToStatuses(activeTab);
//   //   return normalizedOrders.filter((o) => {
//   //     // Services tab: only service bookings
//   //     if (activeTab === 'Services') {
//   const customerOptions = useMemo(() => {
//     const names = new Set();
//     (normalizedOrders || []).forEach((o) => {
//       if (o.customerName && o.customerName !== '-') names.add(o.customerName);
//     });
//     return Array.from(names).sort((a, b) => a.localeCompare(b));
//   }, [normalizedOrders]);

//   const filteredOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const allowed = mapTabToStatuses(activeTab);
//     return normalizedOrders
//       .filter((o) => {
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//         if (
//           customerFilter !== 'all' &&
//           String(o.customerName) !== customerFilter
//         )
//           return false;

//         // Services tab: only service bookings
//         if (activeTab === 'Services') {
//           if (!o.isServiceBooking) return false;
//           if (
//             statusFilter !== 'all' &&
//             getServiceDisplayStatus(o.status) !== statusFilter
//           ) {
//             return false;
//           }
//           if (!q) return true;
//           return (
//             String(o.displayId).toLowerCase().includes(q) ||
//             String(o.customerName).toLowerCase().includes(q) ||
//             String(o.productName).toLowerCase().includes(q)
//           );
//         }

//         // All other tabs: exclude service bookings
//         //     if (o.isServiceBooking) return false;

//         //     if (String(o.status) === 'pending' && !o.vendorAcknowledged) return false;

//         //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) {
//         //       return false;
//         //     }
//         //     const tabMatch = allowed.length
//         //       ? allowed.includes(String(o.status))
//         //       : true;
//         //     if (!tabMatch) return false;
//         //     if (!q) return true;
//         //     return (
//         //       String(o.displayId).toLowerCase().includes(q) ||
//         //       String(o.customerName).toLowerCase().includes(q) ||
//         //       String(o.productName).toLowerCase().includes(q)
//         //     );
//         //   });
//         // }, [normalizedOrders, activeTab, query, dateFilter, statusFilter]);
//         // All other tabs: exclude service bookings
//         // All other tabs: exclude service bookings
//         if (o.isServiceBooking) return false;

//         if (statusFilter !== 'all') {
//           const matchesStatus =
//             statusFilter === 'confirmed'
//               ? ['confirmed', 'pending'].includes(String(o.status))
//               : statusFilter === 'confirmed_only'
//                 ? String(o.status) === 'confirmed'
//                 : String(o.status) === statusFilter;
//           if (!matchesStatus) return false;
//         }

//         if (
//           activeTab !== 'Pickup' &&
//           (o.hasScheduledReturnPickup || o.hasPendingReturnRequest)
//         ) {
//           return false;
//         }

//         // When a specific customer is selected, show ALL their products
//         // regardless of the active tab's status restriction.
//         // When a specific customer OR a specific status is selected, show ALL
//         // matching items regardless of the active tab's status restriction.
//         if (customerFilter === 'all' && statusFilter === 'all') {
//           const tabMatch = allowed.length
//             ? allowed.includes(String(o.status))
//             : true;
//           if (!tabMatch) return false;
//         }
//         //       if (!q) return true;
//         //       return (
//         //         String(o.displayId).toLowerCase().includes(q) ||
//         //         String(o.customerName).toLowerCase().includes(q) ||
//         //         String(o.productName).toLowerCase().includes(q)
//         //       );
//         //     })
//         //     .reverse();
//         // }, [
//         //   normalizedOrders,
//         //   activeTab,
//         //   query,
//         //   dateFilter,
//         //   statusFilter,
//         //   customerFilter,
//         // ]);

//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//   }, [
//     normalizedOrders,
//     activeTab,
//     query,
//     dateFilter,
//     statusFilter,
//     customerFilter,
//   ]);

//   // const pickupScheduledOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   return normalizedOrders.filter((o) => {
//   //     if (!o.hasScheduledReturnPickup) return false;
//   //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//   //     if (statusFilter !== 'all' && String(o.status) !== statusFilter)
//   //       return false;
//   //     if (!q) return true;
//   //     return (
//   //       String(o.displayId).toLowerCase().includes(q) ||
//   //       String(o.customerName).toLowerCase().includes(q) ||
//   //       String(o.productName).toLowerCase().includes(q)
//   //     );
//   //   });
//   // }, [normalizedOrders, query, dateFilter, statusFilter]);

//   // const relocationOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   const sortedOrders = [...(orders || [])].sort(
//   //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
//   //   );
//   //   const orderNumberMap = new Map(
//   //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
//   //   );
//   //   const rows = flattenVendorRelocationLines(
//   //     sortedOrders,
//   //     vendorIdStr,
//   //     orderNumberMap,
//   //   );
//   const relocationOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const rows = flattenVendorRelocationLines(orders || [], vendorIdStr);
//     //   return rows.filter((o) => {
//     //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//     //     if (customerFilter !== 'all' && String(o.customerName) !== customerFilter)
//     //       return false;
//     //     if (!q) return true;
//     //     return (
//     //       String(o.displayId).toLowerCase().includes(q) ||
//     //       String(o.customerName).toLowerCase().includes(q) ||
//     //       String(o.productName).toLowerCase().includes(q)
//     //     );
//     //   });
//     // }, [orders, vendorIdStr, query, dateFilter, customerFilter]);
//     return rows
//       .filter((o) => {
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//         if (
//           customerFilter !== 'all' &&
//           String(o.customerName) !== customerFilter
//         )
//           return false;
//         if (
//           statusFilter !== 'all' &&
//           String(o.relocationRequest?.status || 'requested') !== statusFilter
//         ) {
//           return false;
//         }
//         //       if (!q) return true;
//         //       return (
//         //         String(o.displayId).toLowerCase().includes(q) ||
//         //         String(o.customerName).toLowerCase().includes(q) ||
//         //         String(o.productName).toLowerCase().includes(q)
//         //       );
//         //     })
//         //     .reverse();
//         // }, [orders, vendorIdStr, query, dateFilter, customerFilter, statusFilter]);
//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//   }, [orders, vendorIdStr, query, dateFilter, customerFilter, statusFilter]);

//   const relocationTotal = useMemo(
//     () => relocationOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [relocationOrders],
//   );

//   // const pickupScheduledOrders = useMemo(() => {
//   //   const q = query.trim().toLowerCase();
//   //   return normalizedOrders
//   //     .filter((o) => {
//   //       if (!o.hasScheduledReturnPickup) return false;
//   //       if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//   //       if (statusFilter !== 'all' && String(o.status) !== statusFilter)
//   //         return false;
//   //       if (
//   //         customerFilter !== 'all' &&
//   //         String(o.customerName) !== customerFilter
//   //       )
//   //         return false;
//   const pickupScheduledOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return normalizedOrders
//       .filter((o) => {
//         if (!o.hasScheduledReturnPickup && !o.hasPendingReturnRequest)
//           return false;
//         if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
//         if (statusFilter === 'requested' && o.hasScheduledReturnPickup)
//           return false;
//         if (statusFilter === 'scheduled' && !o.hasScheduledReturnPickup)
//           return false;
//         if (
//           customerFilter !== 'all' &&
//           String(o.customerName) !== customerFilter
//         )
//           return false;
//         //       if (!q) return true;
//         //       return (
//         //         String(o.displayId).toLowerCase().includes(q) ||
//         //         String(o.customerName).toLowerCase().includes(q) ||
//         //         String(o.productName).toLowerCase().includes(q)
//         //       );
//         //     })
//         //     .reverse();
//         // }, [normalizedOrders, query, dateFilter, statusFilter, customerFilter]);
//         if (!q) return true;
//         return (
//           String(o.displayId).toLowerCase().includes(q) ||
//           String(o.customerName).toLowerCase().includes(q) ||
//           String(o.productName).toLowerCase().includes(q)
//         );
//       })
//       .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//   }, [normalizedOrders, query, dateFilter, statusFilter, customerFilter]);

//   // const stats = useMemo(() => {
//   //   // const processing = normalizedOrders.filter((o) =>
//   //   //   ['pending', 'confirmed'].includes(String(o.status)),
//   //   // ).length;
//   //   const processing = normalizedOrders.filter((o) =>
//   //     ['confirmed', 'pending'].includes(String(o.status)),
//   //   ).length;
//   //   const totalRevenue = normalizedOrders.reduce(
//   //     (s, o) => s + Number(o.amount || 0),
//   //     0,
//   //   );
//   //   const averageOrder = normalizedOrders.length
//   //     ? Math.round(totalRevenue / normalizedOrders.length)
//   //     : 0;

//   const stats = useMemo(() => {
//     // const processing = normalizedOrders.filter((o) =>
//     //   ['pending', 'confirmed'].includes(String(o.status)),
//     // ).length;
//     const processing = normalizedOrders.filter((o) =>
//       ['confirmed', 'pending'].includes(String(o.status)),
//     ).length;
//     // Each product line in an order now shows the FULL order/payout
//     // amount (not divided per product), so summing every line would
//     // double/triple-count orders that have multiple products from this
//     // vendor. Count each order's amount only once (by order _id);
//     // service bookings are always counted since each booking is its
//     // own separate transaction.
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
//     //   const isOpen = !['completed', 'cancelled'].includes(String(o.lineStatus));
//     //   if (!isOpen) return false;
//     //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
//     //   return ageMs > 24 * 60 * 60 * 1000;
//     // }).length;
//     const urgentActions = normalizedOrders.filter((o) => {
//       if (o.isServiceBooking) return false;
//       const isOpen = !['completed', 'cancelled'].includes(String(o.lineStatus));
//       if (!isOpen) return false;
//       const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
//       return ageMs > 24 * 60 * 60 * 1000;
//     }).length;
//     return { processing, totalRevenue, averageOrder, urgentActions };
//   }, [normalizedOrders]);

//   const filteredTotal = useMemo(
//     () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [filteredOrders],
//   );

//   const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
//   const paginatedOrders = useMemo(
//     () =>
//       filteredOrders.slice(
//         (currentPage - 1) * PAGE_SIZE,
//         currentPage * PAGE_SIZE,
//       ),
//     [filteredOrders, currentPage],
//   );

//   const totalPickupPages = Math.max(
//     1,
//     Math.ceil(pickupScheduledOrders.length / PAGE_SIZE),
//   );
//   const paginatedPickupOrders = useMemo(
//     () =>
//       pickupScheduledOrders.slice(
//         (currentPage - 1) * PAGE_SIZE,
//         currentPage * PAGE_SIZE,
//       ),
//     [pickupScheduledOrders, currentPage],
//   );
//   // const pickupTotal = useMemo(
//   //   () => pickupScheduledOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//   //   [pickupScheduledOrders],
//   // );
//   const pickupTotal = useMemo(
//     () => pickupScheduledOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [pickupScheduledOrders],
//   );
//   const pickupPendingDueTotal = useMemo(
//     () =>
//       pickupScheduledOrders.reduce((s, o) => s + Number(o.pendingDue || 0), 0),
//     [pickupScheduledOrders],
//   );
//   const servicesTotal = useMemo(
//     () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
//     [filteredOrders],
//   );

//   // const tabCounts = useMemo(() => {
//   //   const list = normalizedOrders;
//   //   const nonPickup = list.filter((x) => !x.hasScheduledReturnPickup);
//   //   const shipped = nonPickup.filter((x) =>
//   //     ['shipped', 'in_progress'].includes(String(x.status)),
//   //   ).length;
//   //   return {
//   //     Processing: nonPickup.filter(
//   //       (x) =>
//   //         ['confirmed'].includes(String(x.status)) ||
//   //         (String(x.status) === 'pending' && x.vendorAcknowledged),
//   //     ).length,
//   //     Dispatched: shipped,
//   //     'In Transit': shipped,
//   //     Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
//   //       .length,
//   //     Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
//   //       .length,
//   //     Completed: nonPickup.filter((x) => String(x.status) === 'completed')
//   //       .length,
//   //     Pickup: list.filter((x) => x.hasScheduledReturnPickup).length,
//   //   };
//   // }, [normalizedOrders]);

//   const tabCounts = useMemo(() => {
//     const list = normalizedOrders;
//     const productOrders = list.filter((x) => !x.isServiceBooking);
//     const nonPickup = productOrders.filter((x) => !x.hasScheduledReturnPickup);
//     const shipped = nonPickup.filter((x) =>
//       ['shipped', 'in_progress'].includes(String(x.status)),
//     ).length;
//     return {
//       Processing: nonPickup.filter((x) =>
//         ['confirmed', 'pending'].includes(String(x.status)),
//       ).length,
//       Dispatched: shipped,
//       'In Transit': shipped,
//       Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
//         .length,
//       Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
//         .length,
//       Completed: nonPickup.filter((x) => String(x.status) === 'completed')
//         .length,
//       // Pickup: productOrders.filter((x) => x.hasScheduledReturnPickup).length,
//       Pickup: productOrders.filter(
//         (x) => x.hasScheduledReturnPickup || x.hasPendingReturnRequest,
//       ).length,
//       Relocate: productOrders.filter((x) =>
//         Boolean(x?.relocationRequest?.requestedAt),
//       ).length,
//       Services: list.filter((x) => x.isServiceBooking).length,
//     };
//   }, [normalizedOrders]);

//   const showPackaging = (status) =>
//     ['pending', 'confirmed'].includes(String(status));
//   const showDeliveryAction = (status) => String(status) === 'shipped';
//   const serviceActionForStatus = (status) => {
//     const s = String(status || '');
//     if (s === 'pending') return { label: 'Confirm', next: 'confirmed' };
//     if (s === 'confirmed') return { label: 'Start', next: 'in_progress' };
//     if (s === 'in_progress') return { label: 'Complete', next: 'completed' };
//     return null;
//   };
//   // const showScheduleAction = (order) => {
//   //   if (String(order?.status || '') !== 'cancelled') return false;
//   //   if (order?.hasScheduledReturnPickup) return false;
//   //   return true;
//   // };
//   // const showScheduleAction = (order) => {
//   //   if (order?.hasScheduledReturnPickup) return false;
//   //   // Show Schedule if status is 'cancelled' (covers both:
//   //   // actual cancelled orders AND delivered rentals with return request pending)
//   //   if (String(order?.status || '') !== 'cancelled') return false;
//   //   return true;
//   // };

//   // DELETE showScheduleAction, ADD this instead:
//   const getCancelledAction = (order) => {
//     if (String(order?.status || '') !== 'cancelled') return null;
//     if (order?.hasScheduledReturnPickup) return null;
//     // Delivered rental with active return request → show Schedule
//     if (Boolean(order?.returnRequest?.requestedAt)) return 'schedule';
//     // Plain cancel — who did it?
//     const cancelledBy = order?.primaryLine?.cancelledBy;
//     if (cancelledBy === 'vendor') return 'by_vendor';
//     if (cancelledBy === 'user') return 'by_user';
//     return null;
//   };

//   const handleConfirmRelocation = async () => {
//     const order = relocationConfirmModal.order;
//     if (!order?._id) return;
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     const productId = String(
//       order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//     );
//     setConfirmingRelocation(true);
//     try {
//       const res = await apiConfirmVendorRelocation(
//         order._id,
//         { productId },
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Relocation request confirmed.');
//       setRelocationConfirmModal({ open: false, order: null });
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Failed to confirm relocation.',
//       );
//     } finally {
//       setConfirmingRelocation(false);
//     }
//   };

//   const handleSendServiceCompletionOtp = async () => {
//     const booking = completeServiceModal.order;
//     if (!booking?._id) return;
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     setSendingServiceOtp(true);
//     try {
//       await apiSendServiceCompletionOtp(booking._id, authToken);
//       toast.success('OTP sent to customer email!');
//       setServiceOtpSent(true);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to send OTP.');
//     } finally {
//       setSendingServiceOtp(false);
//     }
//   };

//   const handleVerifyServiceCompletionOtp = async () => {
//     const booking = completeServiceModal.order;
//     if (!booking?._id) return;
//     if (!serviceOtpInput) {
//       toast.error('Please enter the OTP.');
//       return;
//     }
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     setVerifyingServiceOtp(true);
//     try {
//       const res = await apiVerifyServiceCompletionOtp(
//         booking._id,
//         serviceOtpInput,
//         authToken,
//       );
//       setServiceBookings((prev) =>
//         prev.map((b) =>
//           String(b._id) === String(booking._id) ? res.data.data : b,
//         ),
//       );
//       toast.success('Service marked as completed!');
//       setCompleteServiceModal({ open: false, order: null });
//       setServiceOtpInput('');
//       setServiceOtpSent(false);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Incorrect or expired OTP.');
//     } finally {
//       setVerifyingServiceOtp(false);
//     }
//   };

//   const updateServiceBookingStatus = async (booking, status) => {
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken || !booking?._id) return;
//     setUpdatingId(booking._id);
//     try {
//       const res = await apiUpdateVendorServiceBookingStatus(
//         booking._id,
//         status,
//         authToken,
//       );
//       setServiceBookings((prev) =>
//         prev.map((b) => (String(b._id) === String(booking._id) ? res.data : b)),
//       );
//       toast.success('Service booking updated.');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Could not update booking.');
//     } finally {
//       setUpdatingId('');
//     }
//   };

//   const openInspectionModal = (order) => {
//     setInspectionModal({ open: true, order });
//     setInspectionChecklist({
//       powerFunctionCheck: true,
//       surfaceScratches: false,
//       structuralIntegrity: true,
//       accessoriesAccountedFor: true,
//       cleanlinessCheck: true,
//     });
//     // setInspectionPickupPhotoName('');
//     // setDamageDeduction('0');
//     setInspectionPickupPhotoName('');
//     setInspectionPickupPhotoFile(null);
//     setDamageDeduction('0');
//     setCleaningFees('0');
//     setAuthorizeRefund(false);
//   };

//   const closeInspectionModal = () => {
//     if (updatingId) return;
//     setInspectionModal({ open: false, order: null });
//   };

//   const submitInspection = async () => {
//     const order = inspectionModal.order;
//     if (!order?._id) return;
//     if (!inspectionPickupPhotoName) {
//       toast.error('Please upload pickup photo.');
//       return;
//     }
//     if (!authorizeRefund) {
//       toast.error('Please authorize refund to continue.');
//       return;
//     }

//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }

//     // setUpdatingId(order._id);
//     // try {
//     //   const res = await apiCompleteVendorReturnInspection(
//     //     order._id,
//     //     {
//     //       productId: order?.primaryLine?.product?._id || '',
//     //       inspectionChecklist,
//     //       pickupPhotoName: inspectionPickupPhotoName,
//     //       damageDeduction: Number(damageDeduction || 0),
//     //       cleaningFees: Number(cleaningFees || 0),
//     //       authorizeRefund,
//     //     },
//     //     authToken,
//     //   );
//     setUpdatingId(order._id);
//     try {
//       const formData = new FormData();
//       formData.append('productId', order?.primaryLine?.product?._id || '');
//       formData.append(
//         'inspectionChecklist',
//         JSON.stringify(inspectionChecklist),
//       );
//       formData.append('pickupPhotoName', inspectionPickupPhotoName);
//       formData.append('damageDeduction', Number(damageDeduction || 0));
//       formData.append('cleaningFees', Number(cleaningFees || 0));
//       formData.append('authorizeRefund', authorizeRefund);
//       if (inspectionPickupPhotoFile) {
//         formData.append('pickupPhoto', inspectionPickupPhotoFile);
//       }

//       const res = await apiCompleteVendorReturnInspection(
//         order._id,
//         formData,
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Inspection saved. Refund initiated.');
//       closeInspectionModal();
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message ||
//           'Failed to initiate refund and close order.',
//       );
//     } finally {
//       setUpdatingId('');
//     }
//   };

//   // const handleStatusNextAction = (order, nextStep) => {
//   //   if (nextStep.type === 'review') {
//   //     setNewOrderModal({ open: true, orderId: order._id });
//   //   } else if (nextStep.type === 'packaging') {
//   const handleReviewAccept = async (order) => {
//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again to continue.');
//       return;
//     }
//     setUpdatingId(order._rowId || order._id);
//     try {
//       const res = await apiUpdateVendorOrderStatus(
//         order._id,
//         'confirmed',
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Order confirmed.');
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Could not confirm order.');
//     } finally {
//       setUpdatingId('');
//     }
//   };

//   const handleStatusNextAction = (order, nextStep) => {
//     if (nextStep.type === 'review') {
//       handleReviewAccept(order);
//     } else if (nextStep.type === 'packaging') {
//       const productId = String(
//         order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//       );
//       window.location.href = `/vendor/orders/${order._id}/pack?productId=${encodeURIComponent(productId)}`;
//     } else if (nextStep.type === 'delivery') {
//       openDeliveryModal(order);
//     } else if (nextStep.type === 'schedule') {
//       const rrLine = vendorReturnRequestedLine(order, vendorIdStr);
//       setReturnModal({
//         orderId: order._id,
//         productId: rrLine?.product?._id || null,
//       });
//     } else if (nextStep.type === 'service') {
//       updateServiceBookingStatus(order, nextStep.next);
//     } else if (nextStep.type === 'inspection') {
//       openInspectionModal(order);
//     } else if (nextStep.type === 'relocate-confirm') {
//       setRelocationConfirmModal({ open: true, order });
//     } else if (nextStep.type === 'service-complete') {
//       setCompleteServiceModal({ open: true, order });
//     }
//   };

//   const openDeliveryModal = (order) => {
//     // setDeliveryModal({ open: true, order, otp: makeOtp() });
//     setDeliveryModal({ open: true, order, otp: '', otpSent: false });
//     setOtpInput('');
//     setInstallationDone(false);
//     setKycBlockedMessage('');
//   };

//   const closeDeliveryModal = () => {
//     if (updatingId) return;
//     setDeliveryModal({ open: false, order: null, otp: '' });
//     setOtpInput('');
//     setInstallationDone(false);
//     setKycBlockedMessage('');
//   };

//   // const confirmDeliveryFromModal = async () => {
//   //   const order = deliveryModal.order;
//   //   if (!order?._id) return;
//   //   if (otpInput !== deliveryModal.otp) {
//   //     toast.error('OTP does not match.');
//   //     return;
//   //   }
//   //   if (
//   //     productRequiresInstallation(order.primaryProduct) &&
//   //     !installationDone
//   //   ) {
//   //     toast.error('Please confirm installation completed.');
//   //     return;
//   //   }
//   //   const authToken =
//   //     token ||
//   //     (typeof window !== 'undefined'
//   //       ? localStorage.getItem('vendorToken')
//   //       : null);
//   //   if (!authToken) {
//   //     toast.error('Please login again.');
//   //     return;
//   //   }

//   //   const productId = String(
//   //     order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//   //   );

//   //   setUpdatingId(order._rowId || order._id);
//   //   try {
//   //     // ↓ Call LINE-level status instead of order-level
//   //     const res = await apiUpdateVendorLineStatus(
//   //       order._id,
//   //       productId,
//   //       'delivered',
//   //       authToken,
//   //     );
//   //     const updated = res.data;
//   //     setOrders((prev) =>
//   //       prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//   //     );
//   //     toast.success('Delivery confirmed for this item.');
//   //     closeDeliveryModal();
//   //   } catch (err) {
//   //     toast.error(err.response?.data?.message || 'Could not confirm delivery');
//   //   } finally {
//   //     setUpdatingId('');
//   //   }
//   // };

//   const confirmDeliveryFromModal = async () => {
//     const order = deliveryModal.order;
//     if (!order?._id) return;

//     const authToken =
//       token ||
//       (typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null);
//     if (!authToken) {
//       toast.error('Please login again.');
//       return;
//     }

//     const productId = String(
//       order.primaryLine?.product?._id || order.primaryProduct?._id || '',
//     );

//     if (
//       productRequiresInstallation(order.primaryProduct) &&
//       !installationDone
//     ) {
//       toast.error('Please confirm installation completed.');
//       return;
//     }

//     setUpdatingId(order._rowId || order._id);
//     try {
//       // Step 1: verify OTP server-side
//       await apiVerifyVendorDeliveryOtp(
//         order._id,
//         productId,
//         otpInput,
//         authToken,
//       );

//       // Step 2: mark delivered
//       const res = await apiUpdateVendorLineStatus(
//         order._id,
//         productId,
//         'delivered',
//         authToken,
//       );
//       const updated = res.data;
//       setOrders((prev) =>
//         prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
//       );
//       toast.success('Delivery confirmed!');
//       closeDeliveryModal();
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Could not confirm delivery.',
//       );
//     } finally {
//       setUpdatingId('');
//     }
//   };
//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       <VendorSidebar />
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         <VendorTopBar user={user} />
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f3f5f9]">
//           <div className="space-y-4 sm:space-y-5 max-w-[1600px]">
//             {/* <div>
//               <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Customers who ordered your products.
//               </p>
//             </div> */}

//             {loading ? (
//               <div className="flex justify-center py-14">
//                 <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : error ? (
//               <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
//                 {error}
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
//                   {/* <div className="bg-white rounded-2xl border border-blue-100 p-4">
//                     <p className="text-xs text-gray-500">Processing orders</p>
//                     <p className="text-4xl font-semibold text-[#2563EB] mt-1">
//                       {stats.processing}
//                     </p>
//                   </div> */}
//                   <div className="bg-white rounded-2xl border border-[#BEDBFF] p-4">
//                     <div className="flex items-center gap-1.5">
//                       <img
//                         src={processOrder.src}
//                         alt="processing orders"
//                         className="w-8 h-8"
//                       />
//                       <p className="text-xs text-gray-500">Processing Orders</p>
//                     </div>

//                     <p className="text-3xl font-semibold text-[#2563EB] mt-1">
//                       {stats.processing}
//                     </p>
//                   </div>
//                   {/* <div className="bg-white rounded-2xl border border-emerald-100 p-4">
//                     <p className="text-xs text-gray-500">Total value</p>
//                     <p className="text-4xl font-semibold text-[#F97316] mt-1">
//                       {money(stats.totalRevenue)}
//                     </p>
//                   </div> */}
//                   <div className="bg-white rounded-2xl border border-[#FFD6A8] p-4">
//                     <div className="flex items-center gap-1.5">
//                       <img
//                         src={totalVal.src}
//                         alt="total value"
//                         className="w-8 h-8"
//                       />
//                       <p className="text-xs text-gray-500">Total value</p>
//                     </div>

//                     <p className="text-3xl font-semibold text-[#F97316] mt-1">
//                       {money(stats.totalRevenue)}
//                     </p>
//                   </div>
//                   {/* <div className="bg-white rounded-2xl border border-violet-100 p-4">
//                     <p className="text-xs text-gray-500">Average order</p>
//                     <p className="text-4xl font-semibold text-violet-600 mt-1">
//                       {money(stats.averageOrder)}
//                     </p>
//                   </div> */}
//                   <div className="bg-white rounded-2xl border border-emerald-100 p-4">
//                     <div className="flex items-center gap-1.5">
//                       <img
//                         src={totalOrdersIcon.src}
//                         alt="total orders"
//                         className="w-8 h-8"
//                       />
//                       <p className="text-xs text-gray-500">Total Orders</p>
//                     </div>

//                     <p className="text-3xl font-semibold text-[#10B981] mt-2">
//                       {normalizedOrders.length}
//                     </p>
//                   </div>
//                   {/* <div className="bg-white rounded-2xl border border-orange-100 p-4">
//                     <p className="text-xs text-gray-500">Urgent actions</p>
//                     <p className="text-4xl font-semibold text-orange-600 mt-1">
//                       {stats.urgentActions}
//                     </p>
//                   </div> */}
//                 </div>

//                 <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <div className="flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                     {tabs.map((tab) => (
//                       <button
//                         key={tab}
//                         type="button"
//                         onClick={() => setActiveTab(tab)}
//                         className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border shrink-0 whitespace-nowrap ${
//                           activeTab === tab
//                             ? 'bg-white border-gray-300 shadow-sm text-gray-900'
//                             : 'border-transparent text-gray-500 hover:bg-gray-50'
//                         }`}
//                       >
//                         <span>{tab}</span>
//                         <span
//                           className={`min-w-[1.5rem] h-6 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
//                             activeTab === tab
//                               ? 'bg-[#F97316] text-white'
//                               : 'bg-gray-100 text-gray-600'
//                           }`}
//                         >
//                           {tabCounts[tab] ?? 0}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <input
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     placeholder="Search orders, customers, products..."
//                     className="w-full sm:max-w-md px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                   />
//                 </div> */}
//                 {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <div className="flex flex-col sm:flex-row sm:items-center gap-3">
//                     <div className="relative w-full sm:max-w-md">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                       <input
//                         value={query}
//                         onChange={(e) => setQuery(e.target.value)}
//                         placeholder="Search orders, customers, products..."
//                         className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                       />
//                     </div>
//                     <div className="flex flex-1 flex-wrap sm:justify-end gap-3"> */}
//                 <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//                   <div className="flex flex-nowrap items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                     <div className="relative w-full max-w-md shrink-0">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                       <input
//                         value={query}
//                         onChange={(e) => setQuery(e.target.value)}
//                         placeholder="Search orders, customers, products..."
//                         className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                       />
//                     </div>
//                     <div className="flex flex-nowrap flex-1 justify-end gap-3">
//                       <select
//                         value={dateFilter}
//                         onChange={(e) => setDateFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         <option value="all">All Dates</option>
//                         <option value="today">Today</option>
//                         <option value="last7">Last 7 Days</option>
//                         <option value="last30">Last 30 Days</option>
//                       </select>
//                       {/*
//                       <select
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         {activeTab === 'Services' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="scheduled">Scheduled</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         ) : (
//                           <>
//                             <option value="all">All Statuses</option>

//                             <option value="confirmed">Processing</option>
//                             <option value="shipped">Dispatched</option>

//                             <option value="delivered">Delivered</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         )}
//                       </select> */}
//                       <select
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         {activeTab === 'Services' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="scheduled">Scheduled</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         ) : activeTab === 'Pickup' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="requested">Requested</option>
//                             <option value="scheduled">Pickup Scheduled</option>
//                           </>
//                         ) : activeTab === 'Relocate' ? (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="requested">Requested</option>
//                             <option value="confirmed">Confirmed</option>
//                           </>
//                         ) : (
//                           <>
//                             <option value="all">All Statuses</option>
//                             <option value="confirmed">Processing</option>
//                             <option value="confirmed_only">Confirmed</option>
//                             <option value="shipped">Dispatched</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="completed">Completed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </>
//                         )}
//                       </select>
//                       <select
//                         value={customerFilter}
//                         onChange={(e) => setCustomerFilter(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
//                       >
//                         <option value="all">All Customers</option>
//                         {customerOptions.map((name) => (
//                           <option key={name} value={name}>
//                             {name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 {activeTab === 'Relocate' && (
//                   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="min-w-[1100px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                           <tr className="text-gray-500">
//                             <th className="px-4 py-3 text-left font-medium">
//                               Order ID
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Customer
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Product
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Type
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Relocation Date
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Relocate Amount
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Status
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {relocationOrders.map((order) => (
//                             <tr
//                               key={order._rowId}
//                               className="border-t border-gray-100"
//                             >
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {order.displayId}
//                               </td>
//                               <td className="px-4 py-3 text-gray-700">
//                                 {order.customerName}
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <span className="text-gray-800">
//                                     {order.productName}
//                                   </span>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <span
//                                   className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
//                                     order.orderType === 'Buy'
//                                       ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
//                                       : 'border-teal-200 bg-teal-50 text-teal-700'
//                                   }`}
//                                 >
//                                   {order.orderType || '-'}
//                                 </span>
//                               </td>
//                               <td className="px-4 py-3 text-gray-600">
//                                 {order.relocationRequest?.requestedAt
//                                   ? new Date(
//                                       order.relocationRequest.requestedAt,
//                                     ).toLocaleDateString('en-GB')
//                                   : '-'}
//                               </td>
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {money(order.amount)}
//                               </td>
//                               <td className="px-4 py-3">
//                                 <StatusStepDropdown
//                                   {...getRelocateStatusMeta(order)}
//                                   onSelect={(nextStep) =>
//                                     handleStatusNextAction(order, nextStep)
//                                   }
//                                 />
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setViewModal({ open: true, order });
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="View"
//                                   >
//                                     <Eye className="h-4 w-4" />
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       generateOrderInvoicePDF(order, categoryRateMap);
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="Download"
//                                   >
//                                     <Download className="h-4 w-4" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                           {/* {relocationOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={8}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No relocation requests yet.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                         {relocationOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={7}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(relocationTotal)}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         )} */}
//                           {relocationOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={8}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No relocation requests yet.
//                               </td>
//                             </tr>
//                           )}
//                           {/* </tbody>
//                         {relocationOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={5}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(relocationTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         )}
//                       </table>
//                     </div>
//                   </div>
//                 )}
//                 {activeTab !== 'Pickup' &&
//                   activeTab !== 'Services' &&
//                   activeTab !== 'Relocate' && ( */}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//                 {activeTab !== 'Pickup' &&
//                   activeTab !== 'Services' &&
//                   activeTab !== 'Relocate' && (
//                     <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                       <div className="overflow-x-auto">
//                         <table className="min-w-[1060px] w-full text-sm">
//                           <thead className="bg-gray-50 border-b border-gray-100">
//                             <tr className="text-gray-500">
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Order ID
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Customer
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Product
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Type
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Order Date
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Amount
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Status
//                               </th>
//                               <th className="px-4 py-3 text-left font-medium">
//                                 Action
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {/* {paginatedOrders.map((order) => (
//                               <tr
//                                 // key={order._id}
//                                 key={order._rowId}
//                                 onClick={() => {
//                                   if (
//                                     String(order.status) === 'pending' &&
//                                     !order.isServiceBooking
//                                   ) {
//                                     setNewOrderModal({
//                                       open: true,
//                                       orderId: order._id,
//                                     });
//                                   }
//                                 }}
//                                 className={`border-t border-gray-100 ${
//                                   String(order.status) === 'pending' &&
//                                   !order.isServiceBooking
//                                     ? 'cursor-pointer hover:bg-orange-50/60'
//                                     : ''
//                                 }`}
//                               > */}
//                             {paginatedOrders.map((order) => (
//                               <tr
//                                 // key={order._id}
//                                 key={order._rowId}
//                                 className="border-t border-gray-100"
//                               >
//                                 <td className="px-4 py-3 font-semibold text-gray-900">
//                                   {order.displayId}
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-700">
//                                   {order.customerName}
//                                 </td>
//                                 {/* <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <span className="text-gray-800">
//                                     {order.productName}
//                                   </span>
//                                 </div>
//                               </td> */}
//                                 <td className="px-4 py-3">
//                                   <div className="flex items-center gap-2">
//                                     {order.productImage ? (
//                                       <img
//                                         src={order.productImage}
//                                         alt=""
//                                         className="w-9 h-9 rounded-md object-cover"
//                                       />
//                                     ) : (
//                                       <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                     )}
//                                     <div className="min-w-0">
//                                       <span className="text-gray-800 block">
//                                         {order.productName}
//                                       </span>
//                                       {/*— show variant name like Amazon/Flipkart */}
//                                       {order.variantName ? (
//                                         <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
//                                           {order.variantName}
//                                         </span>
//                                       ) : null}
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   {order.isServiceBooking ? (
//                                     <span className="text-gray-300 text-xs">
//                                       —
//                                     </span>
//                                   ) : (
//                                     <span
//                                       className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
//                                         order.orderType === 'Buy'
//                                           ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
//                                           : 'border-teal-200 bg-teal-50 text-teal-700'
//                                       }`}
//                                     >
//                                       {order.orderType || '-'}
//                                     </span>
//                                   )}
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-600">
//                                   {order.createdAt
//                                     ? new Date(
//                                         order.createdAt,
//                                       ).toLocaleDateString('en-GB')
//                                     : '-'}
//                                 </td>
//                                 <td className="px-4 py-3 font-semibold text-gray-900">
//                                   {money(order.amount)}
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <StatusStepDropdown
//                                     label={statusDisplayLabel(order.status)}
//                                     badgeClass={statusBadgeClasses(
//                                       order.status,
//                                     )}
//                                     nextStep={getNextStepAction(order)}
//                                     onSelect={(nextStep) =>
//                                       handleStatusNextAction(order, nextStep)
//                                     }
//                                   />
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <div className="flex items-center gap-2">
//                                     <button
//                                       type="button"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         setViewModal({ open: true, order });
//                                       }}
//                                       className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                       title="View"
//                                     >
//                                       <Eye className="h-4 w-4" />
//                                     </button>
//                                     <button
//                                       type="button"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         generateOrderInvoicePDF(order, categoryRateMap);
//                                       }}
//                                       className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                       title="Download"
//                                     >
//                                       <Download className="h-4 w-4" />
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}

//                             {filteredOrders.length === 0 && (
//                               <tr>
//                                 <td
//                                   colSpan={8}
//                                   className="px-4 py-10 text-center text-gray-500"
//                                 >
//                                   No orders found.
//                                 </td>
//                               </tr>
//                             )}
//                           </tbody>
//                           {/* <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={7}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(filteredTotal)}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         </table>
//                       </div>
//                       {filteredOrders.length > 0 && (
//                         <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
//                           <p className="text-xs text-gray-500">
//                             Page {currentPage} of {totalPages} •{' '}
//                             {filteredOrders.length} results
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) => Math.max(1, p - 1))
//                               }
//                               disabled={currentPage === 1}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Previous
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) =>
//                                   Math.min(totalPages, p + 1),
//                                 )
//                               }
//                               disabled={currentPage === totalPages}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Next
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 {activeTab === 'Pickup' && ( */}
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={5}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(filteredTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         </table>
//                       </div>
//                       {filteredOrders.length > 0 && (
//                         <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
//                           <p className="text-xs text-gray-500">
//                             Page {currentPage} of {totalPages} •{' '}
//                             {filteredOrders.length} results
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) => Math.max(1, p - 1))
//                               }
//                               disabled={currentPage === 1}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Previous
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) =>
//                                   Math.min(totalPages, p + 1),
//                                 )
//                               }
//                               disabled={currentPage === totalPages}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Next
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                 {activeTab === 'Pickup' && (
//                   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="min-w-[1060px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                           <tr className="text-gray-500">
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Order ID
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Customer
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Product
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Type
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Pickup Date
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Pending Due
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Status
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {paginatedPickupOrders.map((order) => (
//                             <tr
//                               // key={`pickup-${order._id}`}
//                               key={`pickup-${order._rowId}`}
//                               className="border-t border-gray-100"
//                             >
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {order.displayId}
//                               </td>
//                               <td className="px-4 py-3 text-gray-700">
//                                 {order.customerName}
//                               </td>
//                               {/* <td className="px-4 py-3">
//                               <div className="flex items-center gap-2">
//                                 {order.productImage ? (
//                                   <img
//                                     src={order.productImage}
//                                     alt=""
//                                     className="w-9 h-9 rounded-md object-cover"
//                                   />
//                                 ) : (
//                                   <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                 )}
//                                 <span className="text-gray-800">
//                                   {order.productName}
//                                 </span>
//                               </div>
//                             </td> */}

//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <div className="min-w-0">
//                                     <span className="text-gray-800 block">
//                                       {order.productName}
//                                     </span>
//                                     {/*show variant name like Amazon/Flipkart */}
//                                     {order.variantName ? (
//                                       <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
//                                         {order.variantName}
//                                       </span>
//                                     ) : null}
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <span
//                                   className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
//                                     order.orderType === 'Buy'
//                                       ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
//                                       : 'border-teal-200 bg-teal-50 text-teal-700'
//                                   }`}
//                                 >
//                                   {order.orderType || '-'}
//                                 </span>
//                               </td>
//                               <td className="px-4 py-3 text-gray-600">
//                                 {order.createdAt
//                                   ? new Date(
//                                       order.createdAt,
//                                     ).toLocaleDateString('en-GB')
//                                   : '-'}
//                               </td>
//                               {/* <td className="px-4 py-3 font-semibold text-gray-900">
//                               {money(order.amount)}
//                             </td>
//                             <td className="px-4 py-3">
//                               {order.pendingDue > 0 ? (
//                                 <span className="font-semibold text-red-600">
//                                   {money(order.pendingDue)}
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-400">₹0</span>
//                               )}
//                             </td>
//                             <td className="px-4 py-3">
//                               <StatusStepDropdown
//                                 label="Pickup Scheduled" */}

//                               <td className="px-4 py-3 whitespace-nowrap">
//                                 {order.pendingDue > 0 ? (
//                                   <span className="font-semibold text-red-600">
//                                     {money(order.pendingDue)}
//                                   </span>
//                                 ) : (
//                                   <span className="text-gray-400">₹0</span>
//                                 )}
//                               </td>
//                               {/* <td className="px-4 py-3">
//                                 <StatusStepDropdown
//                                   label="Pickup Scheduled"
//                                   badgeClass="border-blue-200 bg-blue-50 text-blue-700"
//                                   nextStep={{
//                                     label: 'Inspection',
//                                     type: 'inspection',
//                                   }}
//                                   onSelect={() =>
//                                     handleStatusNextAction(order, {
//                                       type: 'inspection',
//                                     })
//                                   }
//                                 />
//                               </td> */}
//                               <td className="px-4 py-3">
//                                 {order.hasScheduledReturnPickup ? (
//                                   <StatusStepDropdown
//                                     label="Pickup Scheduled"
//                                     badgeClass="border-blue-200 bg-blue-50 text-blue-700"
//                                     nextStep={{
//                                       label: 'Inspection',
//                                       type: 'inspection',
//                                     }}
//                                     onSelect={() =>
//                                       handleStatusNextAction(order, {
//                                         type: 'inspection',
//                                       })
//                                     }
//                                   />
//                                 ) : (
//                                   <StatusStepDropdown
//                                     label="Requested"
//                                     badgeClass="border-amber-200 bg-amber-50 text-amber-700"
//                                     nextStep={{
//                                       label: 'Schedule',
//                                       type: 'schedule',
//                                     }}
//                                     onSelect={() =>
//                                       handleStatusNextAction(order, {
//                                         type: 'schedule',
//                                       })
//                                     }
//                                   />
//                                 )}
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setViewModal({ open: true, order });
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="View"
//                                   >
//                                     <Eye className="h-4 w-4" />
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       generateOrderInvoicePDF(order, categoryRateMap);
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="Download"
//                                   >
//                                     <Download className="h-4 w-4" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                           {/* {pickupScheduledOrders.length === 0 && (
//                           <tr>
//                             <td
//                               colSpan={8}
//                               className="px-4 py-10 text-center text-gray-500"
//                             >
//                               No pickup-scheduled returns yet.
//                             </td>
//                           </tr>
//                         )} */}

//                           {/* {pickupScheduledOrders.length === 0 && (
//                           <tr>
//                             <td
//                               colSpan={9}
//                               className="px-4 py-10 text-center text-gray-500"
//                             >
//                               No pickup-scheduled returns yet.
//                             </td>
//                           </tr>
//                         )} */}
//                           {pickupScheduledOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={8}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No pickup-scheduled returns yet.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                         {pickupScheduledOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={5}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(pickupPendingDueTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         )}
//                       </table>
//                     </div>
//                     {pickupScheduledOrders.length > 0 && (
//                       <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
//                         <p className="text-xs text-gray-500">
//                           Page {currentPage} of {totalPickupPages} •{' '}
//                           {pickupScheduledOrders.length} results
//                         </p>
//                         <div className="flex items-center gap-2">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setCurrentPage((p) => Math.max(1, p - 1))
//                             }
//                             disabled={currentPage === 1}
//                             className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                           >
//                             Previous
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setCurrentPage((p) =>
//                                 Math.min(totalPickupPages, p + 1),
//                               )
//                             }
//                             disabled={currentPage === totalPickupPages}
//                             className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                           >
//                             Next
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === 'Services' && (
//                   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="min-w-[1060px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                           <tr className="text-gray-500">
//                             <th className="px-4 py-3 text-left font-medium">
//                               Order ID
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Customer
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Product
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Order Date
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Amount
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Status
//                             </th>
//                             <th className="px-4 py-3 text-left font-medium">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {paginatedOrders.map((order) => (
//                             <tr
//                               key={order._rowId}
//                               className="border-t border-gray-100"
//                             >
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {order.displayId}
//                               </td>
//                               <td className="px-4 py-3 text-gray-700">
//                                 {order.customerName}
//                               </td>
//                               {/* <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <span className="text-gray-800">
//                                     {order.productName}
//                                   </span>
//                                 </div>
//                               </td> */}

//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   {order.productImage ? (
//                                     <img
//                                       src={order.productImage}
//                                       alt=""
//                                       className="w-9 h-9 rounded-md object-cover"
//                                     />
//                                   ) : (
//                                     <div className="w-9 h-9 rounded-md bg-gray-100" />
//                                   )}
//                                   <div className="min-w-0">
//                                     <span className="text-gray-800 block">
//                                       {order.productName}
//                                     </span>
//                                     {/*ADD — show variant name like Amazon/Flipkart */}
//                                     {order.variantName ? (
//                                       <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
//                                         {order.variantName}
//                                       </span>
//                                     ) : null}
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3 text-gray-600">
//                                 {order.createdAt
//                                   ? new Date(
//                                       order.createdAt,
//                                     ).toLocaleDateString('en-GB')
//                                   : '-'}
//                               </td>
//                               <td className="px-4 py-3 font-semibold text-gray-900">
//                                 {money(order.amount)}
//                               </td>
//                               {/* <td className="px-4 py-3">
//                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]">
//                                   <Calendar className="w-3.5 h-3.5" />
//                                   Scheduled
//                                 </span>
//                               </td> */}
//                               {/* <td className="px-4 py-3">
//                                 {String(order.status) === 'cancelled' ? (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-red-50 text-red-600 border-red-200">
//                                     <X className="w-3.5 h-3.5" />
//                                     Cancelled
//                                   </span>
//                                 ) : String(order.status) === 'completed' ? (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
//                                     <CheckCircle2 className="w-3.5 h-3.5" />
//                                     Completed
//                                   </span>
//                                 ) : (
//                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]">
//                                     <Calendar className="w-3.5 h-3.5" />
//                                     Scheduled
//                                   </span>
//                                 )}
//                               </td> */}
//                               <td className="px-4 py-3">
//                                 <StatusStepDropdown
//                                   {...getServiceStatusMeta(order)}
//                                   onSelect={(nextStep) =>
//                                     handleStatusNextAction(order, nextStep)
//                                   }
//                                 />
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       setViewModal({ open: true, order });
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="View"
//                                   >
//                                     <Eye className="h-4 w-4" />
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       generateOrderInvoicePDF(order, categoryRateMap);
//                                     }}
//                                     className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     title="Download"
//                                   >
//                                     <Download className="h-4 w-4" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}

//                           {filteredOrders.length === 0 && (
//                             <tr>
//                               <td
//                                 colSpan={7}
//                                 className="px-4 py-10 text-center text-gray-500"
//                               >
//                                 No service bookings found.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                         {/* {filteredOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={6}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(servicesTotal)}
//                               </td>
//                             </tr>
//                           </tfoot>
//                         )} */}
//                         {filteredOrders.length > 0 && (
//                           <tfoot>
//                             <tr className="bg-gray-800 text-white">
//                               <td
//                                 colSpan={4}
//                                 className="px-4 py-3 font-semibold"
//                               >
//                                 Total
//                               </td>
//                               <td className="px-4 py-3 font-semibold">
//                                 {money(servicesTotal)}
//                               </td>
//                               <td className="px-4 py-3"></td>
//                               <td className="px-4 py-3"></td>
//                             </tr>
//                           </tfoot>
//                         )}
//                       </table>
//                       {filteredOrders.length > 0 && (
//                         <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
//                           <p className="text-xs text-gray-500">
//                             Page {currentPage} of {totalPages} •{' '}
//                             {filteredOrders.length} results
//                           </p>
//                           <div className="flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) => Math.max(1, p - 1))
//                               }
//                               disabled={currentPage === 1}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Previous
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCurrentPage((p) =>
//                                   Math.min(totalPages, p + 1),
//                                 )
//                               }
//                               disabled={currentPage === totalPages}
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
//                             >
//                               Next
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//       <DeliveryVerificationModal
//         open={deliveryModal.open}
//         order={deliveryModal.order}
//         otp={deliveryModal.otp}
//         otpInput={otpInput}
//         setOtpInput={setOtpInput}
//         installationDone={installationDone}
//         setInstallationDone={setInstallationDone}
//         confirming={Boolean(
//           updatingId && deliveryModal.order?._id === updatingId,
//         )}
//         onClose={closeDeliveryModal}
//         onConfirm={confirmDeliveryFromModal}
//         otpSent={deliveryModal.otpSent || false}
//         sendingOtp={sendingOtp}
//         onSendOtp={handleSendDeliveryOtp}
//         kycBlockedMessage={kycBlockedMessage}
//       />
//       {relocationConfirmModal.open && relocationConfirmModal.order && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//           onClick={() =>
//             !confirmingRelocation &&
//             setRelocationConfirmModal({ open: false, order: null })
//           }
//         >
//           <div
//             className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center gap-3">
//               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                 <Calendar className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-base font-bold text-gray-900">
//                   Confirm Relocation
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {relocationConfirmModal.order.productName}
//                 </p>
//               </div>
//             </div>

//             <p className="mt-4 text-sm text-gray-600">
//               Are you sure you want to confirm relocating this product from the
//               old address to the new address?
//             </p>

//             <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3 text-sm">
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   Old Address
//                 </p>
//                 <p className="font-medium text-gray-800 mt-0.5">
//                   {relocationConfirmModal.order.currentAddress?.label ||
//                     relocationConfirmModal.order.currentAddress?.name ||
//                     '-'}
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {relocationConfirmModal.order.currentAddress?.address || '-'}
//                 </p>
//                 {relocationConfirmModal.order.currentAddress?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {relocationConfirmModal.order.currentAddress.phone}
//                   </p>
//                 ) : null}
//               </div>
//               <div className="border-t border-gray-200 pt-3">
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   New Address
//                 </p>
//                 <p className="font-medium text-gray-800 mt-0.5">
//                   {relocationConfirmModal.order.newAddress?.label || '-'}
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {[
//                     relocationConfirmModal.order.newAddress?.addressLine,
//                     relocationConfirmModal.order.newAddress?.area,
//                     relocationConfirmModal.order.newAddress?.pincode,
//                   ]
//                     .filter(Boolean)
//                     .join(', ')}
//                 </p>
//                 {relocationConfirmModal.order.newAddress?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {relocationConfirmModal.order.newAddress.phone}
//                   </p>
//                 ) : null}
//               </div>
//             </div>

//             <div className="mt-5 flex gap-3">
//               <button
//                 type="button"
//                 disabled={confirmingRelocation}
//                 onClick={() =>
//                   setRelocationConfirmModal({ open: false, order: null })
//                 }
//                 className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={confirmingRelocation}
//                 onClick={handleConfirmRelocation}
//                 className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//               >
//                 {confirmingRelocation ? 'Confirming...' : 'Confirm'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <VendorNewOrderModal
//         open={newOrderModal.open}
//         orderId={newOrderModal.orderId}
//         vendorIdStr={vendorIdStr}
//         getToken={() =>
//           token ||
//           (typeof window !== 'undefined'
//             ? localStorage.getItem('vendorToken')
//             : null)
//         }
//         onClose={() => {
//           setNewOrderModal({ open: false, orderId: null });
//           fetchOrders();
//         }}
//       />

//       <VendorReturnRequestedModal
//         open={Boolean(returnModal.orderId)}
//         orderId={returnModal.orderId}
//         productId={returnModal.productId}
//         vendorIdStr={vendorIdStr}
//         getToken={() =>
//           token ||
//           (typeof window !== 'undefined'
//             ? localStorage.getItem('vendorToken')
//             : null)
//         }
//         onClose={() => {
//           setReturnModal({ orderId: null, productId: null });
//           fetchOrders();
//         }}
//       />

//       {/* {completeServiceModal.open && completeServiceModal.order && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//           onClick={() => setCompleteServiceModal({ open: false, order: null })}
//         >
//           <div
//             className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center gap-3">
//               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//                 <CheckCircle2 className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-base font-bold text-gray-900">
//                   Mark as Completed?
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {completeServiceModal.order.productName}
//                 </p>
//               </div>
//             </div>

//             <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
//               Are you sure this service is completed? This action will notify
//               the customer and cannot be undone.
//             </p>

//             <div className="mt-5 flex gap-3">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setCompleteServiceModal({ open: false, order: null })
//                 }
//                 className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={updatingId === completeServiceModal.order._id}
//                 onClick={async () => {
//                   await updateServiceBookingStatus(
//                     completeServiceModal.order,
//                     'completed',
//                   );
//                   setCompleteServiceModal({ open: false, order: null });
//                 }}
//                 className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//               >
//                 {updatingId === completeServiceModal.order._id
//                   ? 'Saving...'
//                   : 'Yes, Complete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {completeServiceModal.open && completeServiceModal.order && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//           onClick={() => {
//             setCompleteServiceModal({ open: false, order: null });
//             setServiceOtpInput('');
//             setServiceOtpSent(false);
//           }}
//         >
//           <div
//             className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center gap-3">
//               <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//                 <CheckCircle2 className="h-5 w-5" />
//               </span>
//               <div>
//                 <h2 className="text-base font-bold text-gray-900">
//                   Complete Service
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {completeServiceModal.order.productName}
//                 </p>
//               </div>
//             </div>

//             {!serviceOtpSent ? (
//               <>
//                 <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
//                   Send an OTP to the customer&apos;s email. Ask them for the
//                   code once the service is done, then enter it to confirm
//                   completion.
//                 </p>
//                 <div className="mt-5 flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setCompleteServiceModal({ open: false, order: null });
//                       setServiceOtpInput('');
//                       setServiceOtpSent(false);
//                     }}
//                     className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     disabled={sendingServiceOtp}
//                     onClick={handleSendServiceCompletionOtp}
//                     className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//                   >
//                     {sendingServiceOtp ? 'Sending...' : 'Send OTP to Customer'}
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
//                   Ask the customer for the 4-digit OTP sent to their email and
//                   enter it below to mark this service as completed.
//                 </p>
//                 <input
//                   value={serviceOtpInput}
//                   onChange={(e) =>
//                     setServiceOtpInput(
//                       String(e.target.value || '')
//                         .replace(/\D/g, '')
//                         .slice(0, 4),
//                     )
//                   }
//                   inputMode="numeric"
//                   autoComplete="one-time-code"
//                   placeholder="Enter OTP"
//                   className="mt-4 w-full text-center tracking-[0.5em] text-lg font-semibold px-3 py-2.5 border border-gray-300 rounded-xl"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleSendServiceCompletionOtp}
//                   disabled={sendingServiceOtp}
//                   className="mt-2 text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
//                 >
//                   {sendingServiceOtp ? 'Resending...' : 'Resend OTP'}
//                 </button>
//                 <div className="mt-5 flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setCompleteServiceModal({ open: false, order: null });
//                       setServiceOtpInput('');
//                       setServiceOtpSent(false);
//                     }}
//                     className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     disabled={
//                       verifyingServiceOtp || serviceOtpInput.length !== 4
//                     }
//                     onClick={handleVerifyServiceCompletionOtp}
//                     className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
//                   >
//                     {verifyingServiceOtp ? 'Verifying...' : 'Verify & Complete'}
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//       <ReturnInspectionModal
//         open={inspectionModal.open}
//         order={inspectionModal.order}
//         checklist={inspectionChecklist}
//         setChecklist={setInspectionChecklist}
//         // pickupPhotoName={inspectionPickupPhotoName}
//         // setPickupPhotoName={setInspectionPickupPhotoName}
//         pickupPhotoName={inspectionPickupPhotoName}
//         setPickupPhotoName={setInspectionPickupPhotoName}
//         setPickupPhotoFile={setInspectionPickupPhotoFile}
//         damageDeduction={damageDeduction}
//         setDamageDeduction={setDamageDeduction}
//         cleaningFees={cleaningFees}
//         setCleaningFees={setCleaningFees}
//         authorizeRefund={authorizeRefund}
//         setAuthorizeRefund={setAuthorizeRefund}
//         submitting={Boolean(
//           updatingId && inspectionModal.order?._id === updatingId,
//         )}
//         onClose={closeInspectionModal}
//         onSubmit={submitInspection}
//       />
//       <OrderDetailsModal
//         open={viewModal.open}
//         order={viewModal.order}
//         onClose={() => setViewModal({ open: false, order: null })}
//         vendorIdStr={vendorIdStr}
//       />
//     </div>
//   );
// }

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  Info,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  IndianRupee,
  Package,
  Package2,
  Shield,
  ShieldCheck,
  Upload,
  User,
  Wrench,
  Calendar,
  X,
  DollarSign,
  Search,
  ChevronDown,
  Eye,
  Download,
  Ban,
} from 'lucide-react';
import VendorSidebar from '../../Components/Common/VendorSidebar';
import VendorTopBar from '../../Components/Common/VendorTopBar';
import {
  apiCompleteVendorReturnInspection,
  apiGetVendorOrders,
  apiGetVendorServiceBookings,
  apiGetCategories,
  apiUpdateVendorServiceBookingStatus,
  apiUpdateVendorOrderStatus,
  apiUpdateVendorLineStatus,
  apiSendVendorDeliveryOtp,
  apiVerifyVendorDeliveryOtp,
  apiSendServiceCompletionOtp,
  apiVerifyServiceCompletionOtp,
  apiConfirmVendorRelocation,
  apiVendorCancelOrder,
} from '@/service/api';
import {
  buildCategoryRateMap,
  computeVendorLineMoney,
  computeVendorLinesPayout,
  resolveLineRefundableDeposit,
  resolveVendorOrderLineDisplayAmount,
  resolveVendorOrderLineProductAmount,
} from '../../utils/vendorPayout';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import VendorReturnRequestedModal from '../../Components/Modals/VendorReturnRequestedModal';
import VendorNewOrderModal from '../../Components/Modals/VendorNewOrderModal';
import jsPDF from 'jspdf';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

// const tabs = [
//   'Processing',
//   'Dispatched',
//   'In Transit',
//   'Cancelled',
//   'Delivered',
//   'Pickup',
//   'Completed',
//   'Services',
// ];
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
import totalVal from '@/assets/icons/total-val.png';
import processOrder from '@/assets/icons/process-order.png';
import totalOrdersIcon from '@/assets/icons/total-orders2.png';
import ClipboardCheckIcon from '@/assets/icons/rtn-inspection.png';
// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// const makeOtp = () => String(1000 + Math.floor(Math.random() * 9000));
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const makeOtp = () => String(1000 + Math.floor(Math.random() * 9000));

const getServiceDisplayStatus = (status) => {
  const s = String(status || '');
  if (s === 'cancelled') return 'cancelled';
  if (s === 'completed') return 'completed';
  return 'scheduled';
};

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

function normalizeBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    const x = v.trim().toLowerCase();
    if (['true', 'yes', '1'].includes(x)) return true;
    if (['false', 'no', '0'].includes(x)) return false;
  }
  return null;
}

function productRequiresInstallation(product) {
  if (!product || typeof product !== 'object') return false;

  // Prefer explicit backend flags when available.
  const explicitCandidates = [
    product?.requiresInstallation,
    product?.installationRequired,
    product?.logisticsVerification?.requiresInstallation,
    product?.logisticsVerification?.installationRequired,
    product?.logisticsVerification?.needsInstallation,
  ];
  for (const candidate of explicitCandidates) {
    const parsed = normalizeBool(candidate);
    if (parsed !== null) return parsed;
  }

  // Dynamic fallback by category + subcategory from product data.
  const category = String(product?.category || '')
    .trim()
    .toLowerCase();
  const subCategory = String(product?.subCategory || '')
    .trim()
    .toLowerCase();
  const key = `${category} ${subCategory}`.trim();
  if (!key) return false;

  // Known non-installation families.
  if (
    /\b(mobile|smartphone|phone|cellphone|laptop|tablet|watch|earbud|headphone|charger|power bank)\b/.test(
      key,
    )
  ) {
    return false;
  }

  // Known installation-required families.
  if (
    /\b(ac|air conditioner|split ac|window ac|geyser|water heater|chimney|hob|cooktop|wall mount|tv mount)\b/.test(
      key,
    )
  ) {
    return true;
  }

  return false;
}

const mapTabToStatuses = (tab) => {
  // if (tab === 'Processing') return ['pending', 'confirmed'];
  if (tab === 'Processing') return ['confirmed', 'pending'];
  if (tab === 'Dispatched') return ['shipped', 'in_progress'];
  if (tab === 'In Transit') return ['shipped', 'in_progress'];
  if (tab === 'Cancelled') return ['cancelled'];
  //   if (tab === 'Delivered') return ['delivered'];
  //   if (tab === 'Completed') return ['completed'];
  //   if (tab === 'Pickup') return [];
  //   if (tab === 'Services')
  //     return ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  //   return [];
  // };
  if (tab === 'Delivered') return ['delivered'];
  if (tab === 'Completed') return ['completed'];
  if (tab === 'Pickup') return [];
  if (tab === 'Services')
    return ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  return [];
};

const statusDisplayLabel = (statusRaw) => {
  const s = String(statusRaw || '');
  if (s === 'pending') return 'Processing';
  return s;
};

const statusBadgeClasses = (statusRaw) => {
  const status = String(statusRaw || '').toLowerCase();
  if (status === 'pending' || status === 'confirmed') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  if (status === 'shipped') {
    return 'border-sky-200 bg-sky-50 text-sky-700';
  }
  if (status === 'in_progress') {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }
  if (status === 'delivered') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  // if (status === 'completed') {
  //   return 'border-violet-200 bg-violet-50 text-violet-700';
  // }
  if (status === 'cancelled') {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  return 'border-gray-200 bg-gray-50 text-gray-700';
};

function getNextStepAction(order) {
  if (order.isServiceBooking) {
    return getServiceStatusMeta(order).nextStep;
  }
  const status = String(order.status || '');
  if (status === 'completed') return null;
  if (status === 'pending') return { label: 'Review', type: 'review' };
  if (['pending', 'confirmed'].includes(status))
    return { label: 'Packaging', type: 'packaging' };
  if (status === 'shipped') return { label: 'Delivery', type: 'delivery' };
  if (status === 'cancelled' && !order?.hasScheduledReturnPickup) {
    if (Boolean(order?.returnRequest?.requestedAt)) {
      return { label: 'Schedule', type: 'schedule' };
    }
    return null;
  }
  return null;
}

function StatusStepDropdown({ label, badgeClass, nextStep, onSelect }) {
  const [open, setOpen] = useState(false);

  if (!nextStep) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${badgeClass}`}
      >
        {label}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold capitalize ${badgeClass}`}
      >
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          className="absolute z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSelect(nextStep);
            }}
            className="w-full text-left px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {nextStep.label} →
          </button>
        </div>
      )}
    </div>
  );
}

function CancelActionButton({ onCancelClick }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
        title="Cancel Order"
      >
        <Ban className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCancelClick();
            }}
            className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}

function getRelocateStatusMeta(order) {
  const status = order.relocationRequest?.status || 'requested';
  const badgeClass =
    status === 'confirmed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-blue-200 bg-blue-50 text-blue-700';
  const nextStep =
    status === 'confirmed'
      ? null
      : { label: 'Confirm', type: 'relocate-confirm' };
  return { label: status, badgeClass, nextStep };
}

function getServiceStatusMeta(order) {
  const status = String(order.status || '');
  if (status === 'cancelled') {
    return {
      label: 'Cancelled',
      badgeClass: 'bg-red-50 text-red-600 border-red-200',
      nextStep: null,
    };
  }
  if (status === 'completed') {
    return {
      label: 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      nextStep: null,
    };
  }
  if (status === 'confirmed' || status === 'in_progress') {
    return {
      label: 'Confirmed',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      nextStep: { label: 'Complete', type: 'service-complete' },
    };
  }
  return {
    label: 'Scheduled',
    badgeClass: 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]',
    nextStep: null,
  };
}

function lineMatchesVendor(line, vendorIdStr) {
  const p = line?.product;
  if (!p || typeof p === 'string') return false;
  const vid = p.vendorId?._id ?? p.vendorId;
  return String(vid) === vendorIdStr;
}

function vendorScheduledReturnLine(order, vendorIdStr) {
  return (order?.products || []).find((line) => {
    if (!lineMatchesVendor(line, vendorIdStr)) return false;
    return (
      Boolean(line?.returnRequest?.pickupScheduledAt) &&
      !line?.returnRequest?.refundInitiatedAt
    );
  });
}

function vendorReturnRequestedLine(order, vendorIdStr) {
  return (order?.products || []).find((line) => {
    if (!lineMatchesVendor(line, vendorIdStr)) return false;
    return Boolean(line?.returnRequest?.requestedAt);
  });
}

function vendorRelocationRequestedLine(order, vendorIdStr) {
  return (order?.products || []).find((line) => {
    if (!lineMatchesVendor(line, vendorIdStr)) return false;
    return Boolean(line?.relocationRequest?.requestedAt);
  });
}

function flattenVendorRelocationLines(
  orders,
  vendorIdStr,
  categoryRateMap = {},
) {
  const rows = [];
  for (const order of orders) {
    const myLines = (order.products || []).filter(
      (l) =>
        lineMatchesVendor(l, vendorIdStr) &&
        Boolean(l?.relocationRequest?.requestedAt),
    );
    for (const line of myLines) {
      // const base = normalizeVendorOrderLine(
      //   order,
      //   line,
      //   vendorIdStr,
      //   orderNumberMap,
      // );
      // rows.push({
      //   ...base,
      //   _rowId: `reloc-${base._rowId}`,
      //   relocationRequest: line.relocationRequest,
      const base = normalizeVendorOrderLine(
        order,
        line,
        vendorIdStr,
        categoryRateMap,
      );
      rows.push({
        ...base,
        amount: 0, // Relocation amount is always static 0
        _rowId: `reloc-${base._rowId}`,
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

// // function normalizeVendorOrderLine(order, line, vendorIdStr) {
// // function normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap) {
// function normalizeVendorOrderLine(order, line, vendorIdStr) {
// Mirrors the payout math shown in VendorNewOrderModal's Financial Summary:
// order value - platform fee + refundable deposit + other taxes (gst,
// care protection, repair/relocation warranty, delivery/installation fee).
// Fee/tax fields are stored at order level, so when a vendor has multiple
// lines in the same order, each line gets a proportional share based on
// its value — this avoids double-counting the order-level fee across lines.
// function computeVendorLinePayout(order, line, vendorIdStr) {
//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   const lineValue = rate * qty;

//   const vendorLines = (order?.products || []).filter((l) =>
//     lineMatchesVendor(l, vendorIdStr),
//   );
//   const vendorTotal =
//     vendorLines.reduce(
//       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
//       0,
//     ) || 1;
//   const share = lineValue / vendorTotal;

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

//   return Math.max(0, lineValue - lineFee) + lineDeposit + lineTaxes;
// }

// function computeVendorLineBreakdown(order, line, vendorIdStr) {
//   const qty = Number(line?.quantity || 1);
//   const rate = Number(line?.pricePerDay || 0);
//   const lineValue = rate * qty;

//   const vendorLines = (order?.products || []).filter((l) =>
//     lineMatchesVendor(l, vendorIdStr),
//   );
//   const vendorTotal =
//     vendorLines.reduce(
//       (s, l) => s + Number(l?.pricePerDay || 0) * Number(l?.quantity || 1),
//       0,
//     ) || 1;
//   const share = lineValue / vendorTotal;

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

function computeVendorLineBreakdown(
  order,
  line,
  vendorIdStr,
  categoryRateMap = {},
) {
  const thisLine = computeVendorLineMoney(line, categoryRateMap, order);
  const vendorLines = (order?.products || []).filter((l) =>
    lineMatchesVendor(l, vendorIdStr),
  );
  const orderCommission = vendorLines.reduce(
    (s, l) => s + computeVendorLineMoney(l, categoryRateMap, order).commission,
    0,
  );

  return {
    productAmount: thisLine.netProduct,
    lineFee: orderCommission,
    lineTaxes: 0,
    lineDeposit: thisLine.deposit,
    payout: thisLine.payout,
  };
}

function computeVendorLinePayout(
  order,
  line,
  vendorIdStr,
  categoryRateMap = {},
) {
  return computeVendorLineBreakdown(
    order,
    line,
    vendorIdStr,
    categoryRateMap,
  ).payout;
}

// function normalizeVendorOrderLine(order, line, vendorIdStr) {
// function normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap) {
function normalizeVendorOrderLine(
  order,
  line,
  vendorIdStr,
  categoryRateMap = {},
) {
  const product = line?.product;

  const isSell =
    String(line?.productType || '').toLowerCase() === 'sell' ||
    String(product?.type || '').toLowerCase() === 'sell';

  // Table shows (product price after commission) + deposit. Care tax and
  // other customer checkout fees are not vendor earnings.
  const lineMoney = computeVendorLineMoney(line, categoryRateMap, order);
  const lineBreakdown = computeVendorLineBreakdown(
    order,
    line,
    vendorIdStr,
    categoryRateMap,
  );
  // Prefer frozen checkout snapshot (vendorUnitRateAtOrder) when present.
  const lineAmount = resolveVendorOrderLineDisplayAmount(
    line,
    categoryRateMap,
    order,
  );
  const customerCheckoutTaxes =
    Number(order?.gst || 0) +
    Number(order?.careProtection || 0) +
    Number(order?.repairWarranty || 0) +
    Number(order?.relocationWarranty || 0) +
    Number(order?.deliveryPackaging || 0) +
    Number(order?.installationFee || 0);

  const isScheduled =
    Boolean(line?.returnRequest?.pickupScheduledAt) &&
    !line?.returnRequest?.refundInitiatedAt;

  // ── KEY FIX: if line has a return request submitted but not yet
  // scheduled for pickup, treat it as 'cancelled' so it appears
  // in the Cancelled tab with a "Schedule" action button ──
  // const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
  // const isReturnPendingSchedule =
  //   hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

  // const effectiveStatus = isReturnPendingSchedule
  //   ? 'cancelled' // force into Cancelled tab → Schedule button
  //   : line?.lineStatus || order.status;

  // const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
  // const isReturnPendingSchedule =
  //   hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

  // // If refund has been initiated (QC + inspection done), the return cycle
  // // is fully closed — treat as 'completed' so it vanishes from Delivered tab
  // const isReturnCompleted = Boolean(line?.returnRequest?.refundInitiatedAt);

  // const effectiveStatus = isReturnCompleted
  //   ? 'completed' // hide from Delivered tab
  //   : isReturnPendingSchedule
  //     ? 'cancelled' // Cancelled tab → Schedule button
  //     : line?.lineStatus || order.status;
  const hasReturnRequest = Boolean(line?.returnRequest?.requestedAt);
  const isReturnPendingSchedule =
    hasReturnRequest && !line?.returnRequest?.pickupScheduledAt;

  // If refund has been initiated (QC + inspection done), the return cycle
  // is fully closed — treat as 'completed' so it vanishes from Delivered tab
  const isReturnCompleted = Boolean(line?.returnRequest?.refundInitiatedAt);

  // A pending return request now shows directly in the Pickup tab (with a
  // "Requested" dropdown) instead of routing through the Cancelled tab.
  const hasPendingReturnRequest = isReturnPendingSchedule && !isReturnCompleted;

  const effectiveStatus = isReturnCompleted
    ? 'completed' // hide from Delivered tab
    : line?.lineStatus || order.status;

  return {
    ...order,
    _rowId: `${order._id}-${String(product?._id || line?._id || Math.random())}`,
    status: effectiveStatus,
    orderType: isSell ? 'Buy' : 'Rent',
    amount: lineAmount,
    // displayId: `ORD-${String(order._id).slice(-3).toUpperCase()}`,
    // displayId: `ORD-${String(orderNumberMap?.get(String(order._id)) || 0).padStart(3, '0')}`,
    displayId: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
    customerName: order.user?.fullName || order.name || '-',
    productName: product?.productName || 'Product',
    // productImage: product?.image || '',
    productImage: (() => {
      const variantName = line?.variantName || '';
      const variantId = line?.variantId;
      const variants = Array.isArray(product?.variants) ? product.variants : [];
      const allImgs = Array.isArray(product?.images)
        ? product.images.filter(Boolean)
        : [];
      if (
        (variantId || variantName) &&
        variants.length > 0 &&
        allImgs.length > 1
      ) {
        const matchedIdx = variants.findIndex(
          (v) =>
            (variantId && String(v?._id || '') === String(variantId)) ||
            (variantName && String(v?.variantName || '') === variantName),
        );

        if (matchedIdx !== -1) {
          const perVariant = Math.ceil(allImgs.length / variants.length);
          const start = matchedIdx * perVariant;
          const slice = allImgs.slice(start, start + perVariant);
          if (slice[0]) return slice[0];
        }
      }
      return product?.images?.[0] || product?.image || '';
    })(),
    variantName: line?.variantName || '',
    variantId: line?.variantId || null,
    primaryProduct: product || null,
    primaryLine: line
      ? {
          ...line,
          vendorUnitRateAtOrder: line.vendorUnitRateAtOrder,
        }
      : null,
    vendorUnitRateAtOrder: line?.vendorUnitRateAtOrder,
    // refundableDeposit: Math.max(0, Number(line?.refundableDeposit || 0)),
    // returnRequest: line?.returnRequest || {},
    refundableDeposit: resolveLineRefundableDeposit(line, order),
    // Frozen late-fee amount (if any) at the moment return was requested —
    // defaults to 0 for lines that never had a pending due.
    pendingDue: Math.max(0, Number(line?.pendingDue || 0)),
    // // Used only in the order details modal, so "Amount" shows just the
    // // product's own price, with taxes shown as a separate field.
    // productOnlyAmount: Math.max(0, lineBreakdown.productAmount),
    // taxesAmount: Math.max(0, lineBreakdown.lineTaxes),
    //test
    // Used only in the order details modal, so "Amount" shows just the
    // product's own price, with taxes shown as a separate field.
    productOnlyAmount: Math.max(
      0,
      resolveVendorOrderLineProductAmount(line, categoryRateMap, order),
    ),
    // Customer checkout fees (care tax, GST, etc.) — used only for
    // customer-refund previews, never added to vendor payout/amount.
    taxesAmount: Math.max(0, customerCheckoutTaxes),
    // The amount the CUSTOMER actually paid for this product (after any
    // admin offer discount) — always uses pricePerDay directly, never
    // vendorDisplayRate. This is what gets refunded on cancellation, so
    // use this (not productOnlyAmount) anywhere you preview a refund.
    actualChargedAmount: Math.max(
      0,
      Number(line?.pricePerDay || 0) * Math.max(1, Number(line?.quantity || 1)),
    ),
    returnRequest: line?.returnRequest || {},
    relocationRequest: line?.relocationRequest || {},
    hasScheduledReturnPickup: isScheduled,
    hasPendingReturnRequest,
  };
}

// function flattenVendorOrderLines(orders, vendorIdStr) {
//   const rows = [];
//   for (const order of orders) {
//     const myLines = (order.products || []).filter((l) =>
//       lineMatchesVendor(l, vendorIdStr),
//     );
//     if (!myLines.length) continue;
//     for (const line of myLines) {
//       rows.push(normalizeVendorOrderLine(order, line, vendorIdStr));
//     }
//   }
//   return rows;
// }

// function flattenVendorOrderLines(orders, vendorIdStr, orderNumberMap) {
//   const rows = [];
//   for (const order of orders) {
//     const myLines = (order.products || []).filter((l) =>
//       lineMatchesVendor(l, vendorIdStr),
//     );
//     if (!myLines.length) continue;
//     for (const line of myLines) {
//       rows.push(
//         normalizeVendorOrderLine(order, line, vendorIdStr, orderNumberMap),
//       );
//     }
//   }
//   return rows;
// }

function flattenVendorOrderLines(orders, vendorIdStr, categoryRateMap = {}) {
  const rows = [];
  for (const order of orders) {
    const myLines = (order.products || []).filter((l) =>
      lineMatchesVendor(l, vendorIdStr),
    );
    if (!myLines.length) continue;
    for (const line of myLines) {
      rows.push(
        normalizeVendorOrderLine(order, line, vendorIdStr, categoryRateMap),
      );
    }
  }
  return rows;
}

function DeliveryVerificationModal({
  open,
  order,
  otp,
  otpInput,
  setOtpInput,
  installationDone,
  setInstallationDone,
  confirming,
  onClose,
  onConfirm,
  otpSent,
  sendingOtp,
  onSendOtp,
  kycBlockedMessage,
}) {
  const otpInputRef = useRef(null);
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
  const productTitle = order.productName || 'Product';
  const firstSku = `SKU-${String(order._id || '')
    .slice(-6)
    .toUpperCase()}`;
  const requiresInstallation = productRequiresInstallation(
    order.primaryProduct,
  );
  const orderValue = Number(order.amount || 0);
  const payoutValue = Number(order.amount || 0);
  // const otpOk = otpInput.length === 4 && otpInput === otp;
  // const canConfirm =
  //   otpOk && (!requiresInstallation || installationDone) && !confirming;
  const otpOk = otpInput.length === 4; // server verifies the actual value
  const canConfirm =
    otpOk &&
    otpSent &&
    (!requiresInstallation || installationDone) &&
    !confirming;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[20px] bg-white border border-gray-200 shadow-2xl overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg leading-[1.05] font-semibold text-gray-900">
                  Delivery Verification
                </h2>
                <p className="text-sm text-gray-500">
                  Confirm handover with customer OTP
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close delivery verification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p className="text-gray-600 inline-flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Order:</span>{' '}
              <span className="font-semibold text-gray-900">
                #{order.displayId}
              </span>
            </p>
            <p className="text-gray-600 inline-flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Customer:</span>{' '}
              <span className="font-semibold text-gray-900">
                {order.customerName || '-'}
              </span>
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="font-semibold text-black text-sm inline-flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              Items Being Delivered
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-black font-medium">{productTitle}</p>
                <p className="text-xs text-gray-400 mt-0.5">SKU : {firstSku}</p>
              </div>
              {requiresInstallation ? (
                <span className="shrink-0 rounded-md border border-[#8EC5FF] bg-[#DBEAFE] px-2 py-1 text-[11px] font-semibold text-[#1447E6]">
                  Requires Installation
                </span>
              ) : null}
            </div>
          </div>

          {/* <div className="mt-4">
            <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-500" />
              Proof of Delivery (OTP)
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Ask the customer for the 4-digit OTP sent to their phone
            </p>
            <div
              className="mt-3 flex items-center justify-center gap-3"
              onClick={() => otpInputRef.current?.focus()}
            >
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="h-12 w-12 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-900 flex items-center justify-center"
                >
                  {otpInput[idx] ? (
                    otpInput[idx]
                  ) : (
                    <span className="text-gray-300">•</span>
                  )}
                </div>
              ))}
              <input
                ref={otpInputRef}
                value={otpInput}
                onChange={(e) =>
                  setOtpInput(
                    String(e.target.value || '')
                      .replace(/\D/g, '')
                      .slice(0, 4),
                  )
                }
                className="sr-only"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">
              Dummy OTP for test:{' '}
              <span className="font-semibold tracking-widest">{otp}</span>
            </p>
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
              The customer received this OTP via SMS when the order was marked
              as &quot;Out for Delivery&quot;. This confirms they have received
              the items.
            </div>
          </div> */}

          <div className="mt-4">
            <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-500" />
              Proof of Delivery (OTP)
            </p>
            {/* <p className="mt-1 text-sm text-gray-600">
              Send OTP to customer&apos;s email, then ask them for the code.
            </p> */}
            <p className="mt-1 text-sm text-gray-600">
              Ask the customer for the 4-digit OTP sent to their gmail.
            </p>

            {/* Send / Resend OTP button */}
            {kycBlockedMessage ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                <span>
                  <span className="font-semibold block">Delivery Blocked</span>
                  <span className="block text-xs text-red-700 mt-1">
                    {kycBlockedMessage}
                  </span>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSendOtp}
                disabled={sendingOtp}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-800 text-sm font-semibold hover:bg-orange-100 disabled:opacity-50"
              >
                {sendingOtp
                  ? 'Sending...'
                  : otpSent
                    ? 'Resend OTP'
                    : 'Send OTP to Customer'}
              </button>
            )}

            {otpSent && (
              <>
                <div
                  className="mt-4 flex items-center justify-center gap-3"
                  onClick={() => otpInputRef.current?.focus()}
                >
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="h-12 w-12 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-gray-900 flex items-center justify-center"
                    >
                      {otpInput[idx] ? (
                        otpInput[idx]
                      ) : (
                        <span className="text-gray-300">•</span>
                      )}
                    </div>
                  ))}
                  <input
                    ref={otpInputRef}
                    value={otpInput}
                    onChange={(e) =>
                      setOtpInput(
                        String(e.target.value || '')
                          .replace(/\D/g, '')
                          .slice(0, 4),
                      )
                    }
                    className="sr-only"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
                {/* <p className="mt-2 text-center text-xs text-gray-500">
                  OTP sent to customer&apos;s email. Valid for 10 minutes.
                </p> */}
                {/* <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                  Ask the customer for the OTP they received on their registered
                  email.
                </div> */}
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 inline-flex items-start gap-2 w-full">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                  The customer receives this OTP via their registered email.
                  This confirms that they have received the items.
                </div>
              </>
            )}
          </div>

          {requiresInstallation ? (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
              {/* header */}
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#9810FA]">
                  <Wrench className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-semibold text-gray-900">
                    Installation Required
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Some items need installation before delivery completion
                  </p>
                </div>
              </div>

              {/* items */}
              {/* <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Items to install
                </p>
                <p className="mt-1 text-sm text-gray-800">{productTitle}</p>
              </div> */}
              <div className="mt-3 rounded-lg border border-[#DAB2FF] bg-white px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Items to install
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#9810FA]" />
                  <p className="text-sm font-medium text-black">
                    {productTitle}
                  </p>
                </div>
              </div>

              {/* checkbox */}
              <label className="mt-3 flex items-start gap-3 rounded-xl border border-[#DAB2FF] bg-white px-3 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={installationDone}
                  onChange={(e) =>
                    setInstallationDone(Boolean(e.target.checked))
                  }
                  className="mt-0.5 h-5 w-5 rounded border-[#C27AFF] text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="text-sm font-semibold text-gray-900">
                    Installation Completed{' '}
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="block text-xs text-gray-500">
                    Check this box after completing installation and testing
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {/* <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-orange-500" />
              Settlement Preview
            </p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Order Value</span>
              <span className="font-semibold text-gray-900">
                {money(orderValue)}
              </span>
            </div>
            <div className="mt-3 rounded-lg border border-[#FFB86A] bg-[#FFFBEB] px-3 py-2.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#9F2D00]">
                Your Payout
              </span>
              <span className="text-2xl font-bold text-amber-700">
                {money(payoutValue)}
              </span>
            </div>
     
            <div className="mt-2 flex items-start gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
              <p>
                Will move to{' '}
                <span className="text-black font-semibold">
                  Pending Settlement
                </span>{' '}
                after delivery confirmation
              </p>
            </div>
          </div> */}

          {!canConfirm ? (
            <div className="mt-4 rounded-xl border border-[#FFD230] bg-[#FFFBEB] px-3 py-2.5 text-sm text-amber-900 flex gap-2">
              <CircleAlert className="h-4 w-4 mt-0.5 text-[#E17100] shrink-0" />
              <span>
                <span className="font-semibold text-[#7B3306] block">
                  Complete Required Steps
                </span>
                <span className="block text-[#973C00] text-xs mt-1">
                  {otpOk ? '✓' : '✗'} Enter the 4-digit OTP from customer
                </span>
                {requiresInstallation ? (
                  <span className="block text-[#973C00] text-xs">
                    {installationDone ? '✓' : '✗'} Confirm installation is
                    completed
                  </span>
                ) : null}
              </span>
            </div>
          ) : (
            // <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 flex gap-2">
            //   <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            //   <span>OTP verified. Ready to confirm delivery.</span>
            // </div>
            <div></div>
          )}

          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white enabled:hover:bg-[#e56400] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2"
          >
            {confirming ? (
              'Confirming...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm Delivery
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// function ReturnInspectionModal({
//   open,
//   order,
//   checklist,
//   setChecklist,
//   pickupPhotoName,
//   setPickupPhotoName,
function ReturnInspectionModal({
  open,
  order,
  checklist,
  setChecklist,
  pickupPhotoName,
  setPickupPhotoName,
  setPickupPhotoFile,
  damageDeduction,
  setDamageDeduction,
  cleaningFees,
  setCleaningFees,
  authorizeRefund,
  setAuthorizeRefund,
  submitting,
  onClose,
  onSubmit,
}) {
  const [pickupPhotoPreview, setPickupPhotoPreview] = useState('');

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

  useEffect(() => {
    return () => {
      if (pickupPhotoPreview) {
        URL.revokeObjectURL(pickupPhotoPreview);
      }
    };
  }, [pickupPhotoPreview]);

  if (!open || !order) return null;

  const depositHeld = Math.max(0, Number(order?.refundableDeposit || 0));
  const safeDamage = Math.max(0, Number(damageDeduction || 0));
  const safeCleaning = Math.max(0, Number(cleaningFees || 0));
  const finalRefundAmount = Math.max(
    0,
    depositHeld - safeDamage - safeCleaning,
  );
  const canSubmit = Boolean(pickupPhotoName && authorizeRefund) && !submitting;
  const originalPhotoTakenOn = (() => {
    const src = order?.primaryProduct?.createdAt || order?.createdAt;
    if (!src) return '—';
    const d = new Date(src);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  })();

  const checklistRows = [
    {
      key: 'powerFunctionCheck',
      label: 'Power / Function Check',
      hint: 'All features working as expected',
    },
    {
      key: 'surfaceScratches',
      label: 'Surface Scratches',
      hint: 'Visible scratches or scuff marks',
    },
    {
      key: 'structuralIntegrity',
      label: 'Structural Integrity',
      hint: 'Frame and build quality intact',
    },
    {
      key: 'accessoriesAccountedFor',
      label: 'Accessories Accounted For',
      hint: 'All included items returned',
    },
    {
      key: 'cleanlinessCheck',
      label: 'Cleanliness Check',
      hint: 'Item returned in clean condition',
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-start gap-3">
              {/* <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F54900] to-[#F97316] text-white shadow-sm">
                <ClipboardCheck className="h-7 w-7" />
              </span> */}
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F54900] to-[#F97316] shadow-sm">
                <img
                  src={ClipboardCheckIcon.src}
                  alt="Clipboard Check"
                  className="w-7 h-7 shrink-0 brightness-0 invert"
                />
              </span>
              <div>
                <h2 className="text-xl font-semibold leading-tight text-gray-900">
                  Return Inspection: Order #{order.displayId}
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
              aria-label="Close inspection"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-semibold leading-[1.1] text-gray-900">
              Condition Comparison
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                  Original Delivery Condition
                </p>
                <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2.5">
                  <div className="relative h-[208px] rounded-lg bg-gray-100 overflow-hidden">
                    {order.productImage ? (
                      <img
                        src={order.productImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
                      DELIVERED
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  Photo taken on: {originalPhotoTakenOn}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-orange-500" />
                  New Pickup Photo <span className="text-red-600">*</span>
                </p>
                <label className="mt-2 flex h-[232px] cursor-pointer flex-col items-center justify-center rounded-xl border border-[#99A1AF] bg-[#F9FAFB] text-sm text-gray-600 hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (pickupPhotoPreview) {
                        URL.revokeObjectURL(pickupPhotoPreview);
                      }
                      // if (file) {
                      //   setPickupPhotoName(file.name);
                      //   setPickupPhotoPreview(URL.createObjectURL(file));
                      // } else {
                      //   setPickupPhotoName('');
                      //   setPickupPhotoPreview('');
                      // }
                      if (file) {
                        setPickupPhotoName(file.name);
                        setPickupPhotoFile(file);
                        setPickupPhotoPreview(URL.createObjectURL(file));
                      } else {
                        setPickupPhotoName('');
                        setPickupPhotoFile(null);
                        setPickupPhotoPreview('');
                      }
                    }}
                  />
                  {pickupPhotoPreview ? (
                    <img
                      src={pickupPhotoPreview}
                      alt="Pickup preview"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316] text-white shadow-sm">
                        <Upload className="h-5 w-5" />
                      </span>
                      <span className="mt-3 text-[17px] font-semibold text-gray-900">
                        Upload Pickup Photo
                      </span>
                      <span className="mt-1 text-[13px] text-gray-500">
                        Click or drag to upload
                      </span>
                    </>
                  )}
                </label>
                <p className="mt-2 text-[11px] text-gray-400">
                  {/* {pickupPhotoName || 'No file selected'} */}
                  {pickupPhotoName || 'Upload required to proceed'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5  p-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Inspection Checklist
            </h3>
            <div className="mt-4 rounded-xl border border-[#D1D5DC] bg-[#F9FAFB] px-4 py-3">
              {checklistRows.map((row) => (
                <label
                  key={row.key}
                  className="flex items-center justify-between py-2"
                >
                  <span>
                    <span className="block text-[15px] leading-[1.15] font-semibold text-gray-900">
                      {row.label}
                    </span>
                    <span className="block text-[12px] leading-[1.2] text-gray-500">
                      {row.hint}
                    </span>
                  </span>
                  <span className="relative inline-flex h-8 w-14 items-center">
                    <input
                      type="checkbox"
                      checked={Boolean(checklist[row.key])}
                      onChange={(e) =>
                        setChecklist((prev) => ({
                          ...prev,
                          [row.key]: Boolean(e.target.checked),
                        }))
                      }
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-full bg-gray-200 transition peer-checked:bg-[#10B981]" />
                    <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-6" />
                  </span>
                </label>
              ))}

              <div className="mt-2 rounded-xl border border-[#8EC5FF] bg-[#EFF6FF] px-4 py-3">
                <p className="inline-flex items-center gap-2 text-[15px] font-semibold leading-[1.1] text-gray-900">
                  <Shield className="h-5 w-5 text-[#2563EB]" />
                  Rentnpay Care Protection
                </p>
                <p className="mt-1 text-[12px] leading-[1.3] text-gray-500">
                  Minor wear (scratches &lt;2cm, light scuff marks) is covered
                  by Rentnpay Care and should not be deducted from the
                  customer&apos;s deposit.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="inline-flex items-center gap-1 text-base font-semibold text-gray-900">
              <DollarSign className="h-4 w-4 text-[#10B981]" />
              Refund &amp; Deduction Calculator
            </h3>

            <div className="mt-3 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-sm leading-[1.15] text-gray-500">
                  Total Deposit Held
                </span>
                <span className="text-[34px] font-semibold leading-none text-gray-900">
                  {money(depositHeld)}
                </span>
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold leading-[1.15] text-gray-900">
                  Damage Deduction
                </label>
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EF4444] font-semibold  text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={damageDeduction}
                    onChange={(e) => setDamageDeduction(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm"
                  />
                </div>
                <p className="mt-1 text-sm leading-[1.3] text-gray-500">
                  Amount deducted for repair/replacement costs
                </p>
              </div>

              <div className="mt-3">
                <label className="text-[15px] font-semibold leading-[1.15] text-gray-900">
                  Cleaning Fees
                </label>
                <div className="mt-2 relative max-w-[420px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EF4444] font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={cleaningFees}
                    onChange={(e) => setCleaningFees(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="rounded-xl border border-[#05DF72] bg-[#ECFDF5] px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-semibold leading-[1.15] text-black">
                      Final Refund Amount
                    </p>
                    <p className="mt-1 text-[12px] leading-[1.3] text-[#64748B]">
                      Amount to be refunded to customer&apos;s account
                    </p>
                  </div>
                  <span className="text-[34px] font-bold leading-none text-emerald-600">
                    {money(finalRefundAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-4">
            <h3 className="text-base font-semibold text-black">
              Authorization
            </h3>
            <label className="mt-3 flex items-start gap-3 rounded-lg border border-[#D1D5DC] px-3 py-2.5">
              <input
                type="checkbox"
                checked={authorizeRefund}
                onChange={(e) => setAuthorizeRefund(Boolean(e.target.checked))}
                className="mt-0.5 h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  I verify that the inspection is complete and authorize the
                  refund of {money(finalRefundAmount)}.
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  By checking this box, you confirm all inspection details are
                  accurate and the refund amount is correct.
                </span>
              </span>
            </label>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white enabled:hover:bg-[#e56400] disabled:cursor-not-allowed disabled:bg-orange-200 inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Initiating...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Initiate Refund & Close Order
              </>
            )}
          </button>
          <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs text-gray-500">
            <CircleAlert className="h-3.5 w-3.5 text-[#F97316]" />
            Upload pickup photo and complete authorization to proceed
          </p>
        </div>
      </div>
    </div>
  );
}

function VendorCancelOrderModal({
  open,
  order,
  cancelling,
  onClose,
  onConfirm,
}) {
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

  // if (!open || !order) return null;

  // const productAmount = Number(order.productOnlyAmount ?? order.amount ?? 0);
  // const deposit = Number(order.refundableDeposit || 0);
  // const taxes = Number(order.taxesAmount || 0);
  // const fullRefund = productAmount + deposit + taxes;

  //test
  if (!open || !order) return null;

  // Use the customer's actual charged amount (post admin-offer), not the
  // vendor's inflated display rate — this is what will actually be
  // refunded, so the preview must match the backend's real calculation.
  const productAmount = Number(
    order.actualChargedAmount ?? order.productOnlyAmount ?? order.amount ?? 0,
  );
  const deposit = Number(order.refundableDeposit || 0);
  const taxes = Number(order.taxesAmount || 0);
  const fullRefund = productAmount + deposit + taxes;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm">
                <Ban className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold leading-tight text-gray-900">
                  Cancel Order #{order.displayId}
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
              aria-label="Close cancel order"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* <div className="mt-4 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
            <CircleAlert className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
            <span>
              You are cancelling this order as the vendor. Since the customer is
              not at fault, they will receive a{' '}
              <span className="font-semibold">full refund</span> with no
              deduction.
            </span>
          </div> */}

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
            <CircleAlert className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
            <span>
              You are cancelling this order as the vendor. Since the customer is
              not at fault, they will receive a{' '}
              <span className="font-semibold">full refund</span> with no
              deduction.
              {order?.primaryLine?.offerSource === 'admin' ? (
                <span className="block mt-1 text-xs text-red-700">
                  This product had an admin-funded discount, so the refund
                  reflects the amount the customer actually paid, not your
                  listed price.
                </span>
              ) : null}
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="font-semibold text-gray-900 text-sm">
              Refund Breakdown
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Product Amount</span>
                <span className="font-medium text-gray-900">
                  {money(productAmount)}
                </span>
              </div>
              {deposit > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Refundable Deposit</span>
                  <span className="font-medium text-gray-900">
                    {money(deposit)}
                  </span>
                </div>
              ) : null}
              {taxes > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Other Taxes</span>
                  <span className="font-medium text-gray-900">
                    {money(taxes)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-500">Deduction</span>
                <span className="font-semibold text-gray-900">₹0</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-[#05DF72] bg-[#ECFDF5] px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-black">
                Full Refund Amount
              </span>
              <span className="text-2xl font-bold text-emerald-600">
                {money(fullRefund)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={cancelling}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Go Back
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {cancelling ? (
                'Cancelling...'
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Confirm Cancellation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateOrderInvoicePDF(order, categoryRateMap = {}) {
  const pdf = new jsPDF();
  const pageW = 210;
  const marginX = 14;
  const rightX = pageW - marginX;
  let y = 20;

  // Relocation rows show a static 0 in the table/amount field, but the
  // invoice should show the full product amount (price + deposit + taxes).
  const invoiceAmount = order?.relocationRequest?.requestedAt
    ? Number(order.productOnlyAmount || 0) +
      Number(order.refundableDeposit || 0)
    : Number(order.amount || 0);

  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Invoice - ${order.displayId || ''}`, marginX, y);
  pdf.setFont(undefined, 'normal');

  y += 5;
  pdf.setDrawColor(230);
  pdf.line(marginX, y, rightX, y);

  // const logoY = y + 14;
  // pdf.setFillColor(255, 140, 0);
  // pdf.circle(marginX + 8, logoY, 8, 'F');
  // pdf.setTextColor(255, 255, 255);
  // pdf.setFontSize(22);
  // pdf.setFont(undefined, 'bold');
  // pdf.text('R', marginX + 8, logoY + 2.5, { align: 'center' });
  // pdf.setTextColor(0, 0, 0);
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

  // Determine whether this row came from the Pickup tab or Relocate tab,
  // so the date field reflects the relevant date instead of the order date.
  const isRelocationOrder = Boolean(
    order?.relocationRequest?.requestedAt && order?.newAddress,
  );
  const isPickupOrder =
    Boolean(order?.hasScheduledReturnPickup) ||
    Boolean(order?.returnRequest?.pickupScheduledAt);

  let dateLabel = 'Order Date';
  let dateValue = invDate;
  if (isRelocationOrder) {
    dateLabel = 'Relocation Date';
    dateValue = order?.relocationRequest?.requestedAt
      ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
          'en-IN',
          { day: '2-digit', month: 'short', year: 'numeric' },
        )
      : '-';
  } else if (isPickupOrder) {
    dateLabel = 'Pickup Date';
    dateValue = order?.returnRequest?.pickupScheduledAt
      ? new Date(order.returnRequest.pickupScheduledAt).toLocaleDateString(
          'en-IN',
          { day: '2-digit', month: 'short', year: 'numeric' },
        )
      : invDate;
  }

  const details = [
    ['Order Number', order.displayId || '-'],
    [dateLabel, dateValue],
    ...(isRelocationOrder ? [['Relocation Amount', 'Rs. 0']] : []),
    [
      'Order Type',
      order.orderType || (order.isServiceBooking ? 'Service' : '-'),
    ],
    ['Customer', order.customerName || '-'],
    ...(!order.isServiceBooking &&
    String(order.orderType || '') !== 'Buy' &&
    Number(order.refundableDeposit || 0) > 0
      ? [
          [
            'Refundable Deposit',
            `Rs. ${Number(order.refundableDeposit).toLocaleString('en-IN')}`,
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
  pdf.text(order.phone || order.user?.phone || '-', rightX - 6, rightY, {
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
  // const itemLabel = `Item: ${order.productName || 'Product'}${
  //   order.variantName ? ` (${order.variantName})` : ''
  // }`;
  // const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

  // let statusCapitalized;
  // if (isRelocationOrder) {
  //   const relocStatus = String(order?.relocationRequest?.status || 'requested');
  //   statusCapitalized = relocStatus === 'confirmed' ? 'Completed' : 'Requested';
  // } else {
  //   const statusLabel = String(
  //     order.status === 'pending' ? 'Processing' : order.status || '-',
  //   );
  //   statusCapitalized =
  //     statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
  // }

  // pdf.setFontSize(8);
  // pdf.text('1', cols[0].x, rowTop + 4);
  // pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
  // pdf.text(String(order.quantity || 1), cols[2].x, rowTop + 4);
  // pdf.text(statusCapitalized, cols[3].x, rowTop + 4);
  // pdf.text(
  //   `Rs.${invoiceAmount.toLocaleString('en-IN')}`,
  //   cols[4].x,
  //   rowTop + 4,
  //   { align: 'right' },
  // );

  // const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
  // pdf.setDrawColor(225);
  // pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
  // y = rowTop + rowHeight + 4;

  let statusCapitalized;
  if (isRelocationOrder) {
    const relocStatus = String(order?.relocationRequest?.status || 'requested');
    statusCapitalized = relocStatus === 'confirmed' ? 'Completed' : 'Requested';
  } else {
    const statusLabel = String(
      order.status === 'pending' ? 'Processing' : order.status || '-',
    );
    statusCapitalized =
      statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
  }

  // When this order has more than one product line for this vendor,
  // list every product with its own price, then show the order total —
  // so the invoice matches the full order amount already shown in the
  // table row. Single-product orders keep the original single-row layout.
  const vendorIdForInvoice = String(
    order?.primaryProduct?.vendorId?._id ||
      order?.primaryProduct?.vendorId ||
      '',
  );
  const vendorInvoiceLines = (order?.products || []).filter((l) => {
    const p = l?.product;
    if (!p || typeof p === 'string') return false;
    const vid = p.vendorId?._id ?? p.vendorId;
    return vendorIdForInvoice && String(vid) === vendorIdForInvoice;
  });
  const isMultiProductInvoice =
    !order.isServiceBooking &&
    !isRelocationOrder &&
    vendorInvoiceLines.length > 1;

  // Each product line can be in a different status (e.g. one shipped,
  // one confirmed) — resolve status per line instead of reusing the
  // single shared statusCapitalized value.
  const lineStatusCapitalized = (line) => {
    const raw = String(line?.lineStatus || order.status || '');
    const label = raw === 'pending' ? 'Processing' : raw || '-';
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  pdf.setFontSize(8);

  if (isMultiProductInvoice) {
    let rowStartY = y;
    let sno = 1;
    vendorInvoiceLines.forEach((line) => {
      const lp = line?.product;
      const qty = Number(line?.quantity || 1);
      const lineAmount = resolveVendorOrderLineProductAmount(
        line,
        categoryRateMap,
        order,
      );
      const itemLabel = `Item: ${lp?.productName || lp?.title || 'Product'}${
        line?.variantName ? ` (${line.variantName})` : ''
      }`;
      const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);
      const rowHeight = Math.max(itemNameWrapped.length * 4.2 + 4, 14);
      const thisLineStatus = lineStatusCapitalized(line);

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
        rowHeight,
        2,
        2,
        'S',
      );
      rowStartY += rowHeight + 4;
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
    const rowTop = y;
    const itemLabel = `Item: ${order.productName || 'Product'}${
      order.variantName ? ` (${order.variantName})` : ''
    }`;
    const itemNameWrapped = pdf.splitTextToSize(itemLabel, cols[1].w);

    // Table row shows just this product's own price (matches the
    // multi-product table, where each row shows its own line amount).
    // The full order total (with deposit/taxes) still shows separately
    // in the "Amount" field of the Invoice Details section above.
    const primaryLine = order?.primaryLine || null;
    const rowItemAmount = order?.relocationRequest?.requestedAt
      ? invoiceAmount
      : primaryLine
        ? resolveVendorOrderLineProductAmount(
            primaryLine,
            categoryRateMap,
            order,
          )
        : Number(order.productOnlyAmount ?? invoiceAmount);

    pdf.text('1', cols[0].x, rowTop + 4);
    pdf.text(itemNameWrapped, cols[1].x, rowTop + 4);
    pdf.text(String(order.quantity || 1), cols[2].x, rowTop + 4);
    pdf.text(statusCapitalized, cols[3].x, rowTop + 4);
    pdf.text(
      `Rs.${rowItemAmount.toLocaleString('en-IN')}`,
      cols[4].x,
      rowTop + 4,
      { align: 'right' },
    );

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

  // Relocation-specific address details (Current/Old address + New address),
  // shown dynamically based on whether the relocation has been confirmed.
  if (isRelocationOrder) {
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

// function OrderDetailsModal({ open, order, onClose }) {
function OrderDetailsModal({
  open,
  order,
  onClose,
  vendorIdStr,
  categoryRateMap = {},
}) {
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

  // When this order has more than one product line belonging to this
  // vendor, show all of them here so the modal total matches the full
  // order amount already shown in the table row. Single-product orders
  // are unaffected — they keep showing just their own detail rows below.
  const vendorOrderLines = (order?.products || []).filter((l) =>
    lineMatchesVendor(l, vendorIdStr),
  );
  const isMultiProductOrder = vendorOrderLines.length > 1;
  const multiProductRows = isMultiProductOrder
    ? vendorOrderLines.map((l) => {
        const lp = l?.product;
        const qty = Number(l?.quantity || 1);
        const netProduct = computeVendorLineMoney(
          l,
          categoryRateMap,
          order,
        ).netProduct;
        return {
          key: String(lp?._id || l?._id || Math.random()),
          name: lp?.productName || lp?.title || 'Product',
          image: lp?.image || '',
          qty,
          price: netProduct,
          isSell:
            String(l?.productType || '').toLowerCase() === 'sell' ||
            String(lp?.type || '').toLowerCase() === 'sell',
        };
      })
    : [];

  const isRelocationOrder = Boolean(
    order?.relocationRequest?.requestedAt && order?.newAddress,
  );
  const isRelocationConfirmed =
    String(order?.relocationRequest?.status || '') === 'confirmed';

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  const relocationDate = order?.relocationRequest?.requestedAt
    ? new Date(order.relocationRequest.requestedAt).toLocaleDateString(
        'en-IN',
        { day: '2-digit', month: 'short', year: 'numeric' },
      )
    : '-';

  const pickupDate = order?.returnRequest?.pickupScheduledAt
    ? new Date(order.returnRequest.pickupScheduledAt).toLocaleDateString(
        'en-IN',
        { day: '2-digit', month: 'short', year: 'numeric' },
      )
    : '-';

  const statusText = order.isServiceBooking
    ? getServiceStatusMeta(order).label
    : isRelocationOrder
      ? isRelocationConfirmed
        ? 'Completed'
        : 'Requested'
      : statusDisplayLabel(order.status);

  const statusClass = order.isServiceBooking
    ? getServiceStatusMeta(order).badgeClass
    : isRelocationOrder
      ? isRelocationConfirmed
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-blue-200 bg-blue-50 text-blue-700'
      : statusBadgeClasses(order.status);

  const oldAddr = order?.currentAddress || {};
  const newAddr = order?.newAddress || {};

  // const detailRows = [
  //   ['Order ID', order.displayId || '-'],
  //   ['Customer', order.customerName || '-'],
  //   ['Delivery Number', order.phone || order.user?.phone || '-'],
  //   ['Registered Number', order.user?.mobileNumber || order.user?.phone || '-'],
  //   ['Product', order.productName || '-'],
  //   ...(order.variantName ? [['Variant', order.variantName]] : []),
  //   [
  //     'Order Type',
  //     order.orderType || (order.isServiceBooking ? 'Service' : '-'),
  //   ],

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

  //   ...(order.taxesAmount ? [['Other Taxes', money(order.taxesAmount)]] : []),
  //   ['Order Date', orderDate],
  //   ...(isRelocationOrder ? [['Relocation Date', relocationDate]] : []),
  //   ...(order.hasScheduledReturnPickup ? [['Pickup Date', pickupDate]] : []),
  // ];

  const detailRows = [
    ['Order ID', order.displayId || '-'],
    ['Product', order.productName || '-'],
    ['Customer', order.customerName || '-'],
    [
      order.isServiceBooking ? 'Amount' : 'Product Amount',
      money(
        order.isServiceBooking
          ? order.amount
          : (order.productOnlyAmount ?? order.amount),
      ),
    ],
    // ['Registered Number', order.user?.mobileNumber || order.user?.phone || '-'],
    // ...(order.refundableDeposit
    //   ? [['Refundable Deposit', money(order.refundableDeposit)]]
    //   : []),
    // ['Delivery Number', order.phone || order.user?.phone || '-'],
    // ['Order Date', orderDate],
    // [
    //   'Order Type',
    //   order.orderType || (order.isServiceBooking ? 'Service' : '-'),
    // ],
    ['Registered Number', order.user?.mobileNumber || order.user?.phone || '-'],
    ...(order.refundableDeposit
      ? [['Refundable Deposit', money(order.refundableDeposit)]]
      : []),
    ...(order.orderType === 'Buy'
      ? [
          ['Order Date', orderDate],
          ['Delivery Number', order.phone || order.user?.phone || '-'],
        ]
      : [
          ['Delivery Number', order.phone || order.user?.phone || '-'],
          ['Order Date', orderDate],
        ]),
    [
      'Order Type',
      order.orderType || (order.isServiceBooking ? 'Service' : '-'),
    ],
    ...(order.variantName ? [['Variant', order.variantName]] : []),
    ...(isRelocationOrder ? [['Relocation Date', relocationDate]] : []),
    ...(order.hasScheduledReturnPickup ? [['Pickup Date', pickupDate]] : []),
  ];
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
        <div className="p-5 sm:p-6">
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

          {/* <div className="mt-4 flex items-center gap-3">
            {order.productImage ? (
              <img
                src={order.productImage}
                alt=""
                className="h-16 w-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200" />
            )}
            <span
              className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-xs font-semibold capitalize ${statusClass}`}
            >
              {statusText}
            </span>
          </div> */}

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-orange-500" />
              Order Details
            </p>

            {isMultiProductOrder ? (
              <>
                <div className="mt-3 space-y-2">
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
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm border-t border-gray-200 pt-3">
                  {detailRows
                    .filter(
                      ([label]) =>
                        label !== 'Product' &&
                        label !== 'Variant' &&
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
                  <div className="flex items-center justify-between gap-3 sm:col-span-2 border-t border-gray-200 pt-2 mt-1">
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
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                {detailRows.map(([label, val]) => (
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
              </div>
            )}
          </div>

          {/* <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="font-semibold text-gray-900 text-sm inline-flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
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
          {/* 
          <button
            type="button"
            onClick={() => generateOrderInvoicePDF(order, categoryRateMap)}
            className="mt-5 w-full rounded-xl bg-[#FF6F00] py-3 text-sm font-semibold text-white hover:bg-[#e56400] shadow-sm inline-flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default function VendorOrdersPage() {
  const { user, token } = useSelector((s) => s.vendor);
  const [orders, setOrders] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [deliveryModal, setDeliveryModal] = useState({
    open: false,
    order: null,
    otp: '',
  });
  const [kycBlockedMessage, setKycBlockedMessage] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [installationDone, setInstallationDone] = useState(false);
  const [returnModal, setReturnModal] = useState({
    orderId: null,
    productId: null,
  });
  const [inspectionModal, setInspectionModal] = useState({
    open: false,
    order: null,
  });
  const [completeServiceModal, setCompleteServiceModal] = useState({
    open: false,
    order: null,
  });
  const [relocationConfirmModal, setRelocationConfirmModal] = useState({
    open: false,
    order: null,
  });
  const [newOrderModal, setNewOrderModal] = useState({
    open: false,
    orderId: null,
  });
  const [viewModal, setViewModal] = useState({
    open: false,
    order: null,
  });
  const [cancelOrderModal, setCancelOrderModal] = useState({
    open: false,
    order: null,
  });
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [confirmingRelocation, setConfirmingRelocation] = useState(false);
  const [serviceOtpInput, setServiceOtpInput] = useState('');
  const [serviceOtpSent, setServiceOtpSent] = useState(false);
  const [sendingServiceOtp, setSendingServiceOtp] = useState(false);
  const [verifyingServiceOtp, setVerifyingServiceOtp] = useState(false);
  const [inspectionChecklist, setInspectionChecklist] = useState({
    powerFunctionCheck: true,
    surfaceScratches: false,
    structuralIntegrity: true,
    accessoriesAccountedFor: true,
    cleanlinessCheck: true,
  });
  // const [inspectionPickupPhotoName, setInspectionPickupPhotoName] =
  //   useState('');
  const [inspectionPickupPhotoName, setInspectionPickupPhotoName] =
    useState('');
  const [inspectionPickupPhotoFile, setInspectionPickupPhotoFile] =
    useState(null);
  const [damageDeduction, setDamageDeduction] = useState('0');
  const [cleaningFees, setCleaningFees] = useState('0');
  const [authorizeRefund, setAuthorizeRefund] = useState(false);
  // const [activeTab, setActiveTab] = useState('Processing');
  // const [query, setQuery] = useState('');
  // const [sendingOtp, setSendingOtp] = useState(false);
  const [activeTab, setActiveTab] = useState('Processing');
  const [query, setQuery] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  // const [dateFilter, setDateFilter] = useState('all');
  // const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryRateMap, setCategoryRateMap] = useState({});
  const PAGE_SIZE = 10;

  const vendorIdStr = String(user?.id || user?._id || '');

  const fetchOrders = useCallback(async () => {
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      setError('Please login again to continue.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [ordersRes, bookingsRes, catRes] = await Promise.all([
        apiGetVendorOrders(authToken),
        apiGetVendorServiceBookings(authToken),
        apiGetCategories().catch(() => ({ data: [] })),
      ]);
      setOrders(ordersRes.data || []);
      setServiceBookings(bookingsRes.data || []);
      setCategoryRateMap(
        buildCategoryRateMap(Array.isArray(catRes.data) ? catRes.data : []),
      );
    } catch (err) {
      setOrders([]);
      setServiceBookings([]);
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSendDeliveryOtp = async () => {
    const order = deliveryModal.order;
    if (!order?._id) return;

    const productId = String(
      order.primaryLine?.product?._id || order.primaryProduct?._id || '',
    );
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);

    setSendingOtp(true);
    try {
      await apiSendVendorDeliveryOtp(order._id, productId, authToken);
      toast.success('OTP sent to customer email!');
      setKycBlockedMessage('');
      // Mark OTP as sent so button changes to "Resend OTP"
      setDeliveryModal((prev) => ({ ...prev, otpSent: true }));
    } catch (err) {
      console.error('OTP send error:', err);
      const msg = err?.response?.data?.message || 'Failed to send OTP.';
      if (err?.response?.data?.kycBlocked) {
        setKycBlockedMessage(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query, dateFilter, statusFilter, customerFilter]);

  useEffect(() => {
    setStatusFilter('all');
  }, [activeTab]);
  useEffect(() => {
    const onOrdersChanged = () => fetchOrders();
    window.addEventListener('vendor-orders-changed', onOrdersChanged);
    return () =>
      window.removeEventListener('vendor-orders-changed', onOrdersChanged);
  }, [fetchOrders]);

  // const normalizedOrders = useMemo(() => {
  //   if (!vendorIdStr) return [];
  //   // return (orders || []).map((o) => normalizeVendorOrder(o, vendorIdStr));
  //   const rows = flattenVendorOrderLines(orders || [], vendorIdStr);
  //   for (const booking of serviceBookings || []) {
  //     rows.push({
  //       ...booking,
  //       _rowId: `service-${booking._id}`,
  //       status: booking.status || 'pending',
  //       amount: Number(booking.totalAmount || 0),
  //       displayId: `SRV-${String(booking._id).slice(-3).toUpperCase()}`,
  //       customerName: booking.user?.fullName || booking.name || '-',
  // const normalizedOrders = useMemo(() => {
  //   if (!vendorIdStr) return [];

  //   const sortedOrders = [...(orders || [])].sort(
  //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  //   );
  //   const sortedBookings = [...(serviceBookings || [])].sort(
  //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  //   );
  //   const orderNumberMap = new Map(
  //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
  //   );
  //   const bookingNumberMap = new Map(
  //     sortedBookings.map((b, idx) => [String(b._id), idx + 1]),
  //   );

  //   const rows = flattenVendorOrderLines(
  //     sortedOrders,
  //     vendorIdStr,
  //     orderNumberMap,
  //   );
  //   for (const booking of sortedBookings) {
  //     rows.push({
  //       ...booking,
  //       _rowId: `service-${booking._id}`,
  //       status: booking.status || 'pending',
  //       amount: Number(booking.totalAmount || 0),
  //       // displayId: `SRV-${String(bookingNumberMap.get(String(booking._id)) || 0).padStart(3, '0')}`,
  //       displayId: `SRV-${String(booking.bookingNumber || 0).padStart(3, '0')}`,
  const normalizedOrders = useMemo(() => {
    if (!vendorIdStr) return [];

    // const rows = flattenVendorOrderLines(orders || [], vendorIdStr);
    // for (const booking of serviceBookings || []) {
    //   rows.push({
    //     ...booking,
    //     _rowId: `service-${booking._id}`,
    //     status: booking.status || 'pending',
    //     amount: Number(booking.totalAmount || 0),
    //     displayId: `SRV-${String(booking?.bookingNumber || 0).padStart(4, '0')}`,
    //     customerName: booking.user?.fullName || booking.name || '-',
    //     productName:
    //       booking.serviceSnapshot?.productName ||
    //       booking.serviceProduct?.productName ||
    //       'Service booking',
    //     productImage:
    //       booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
    //     primaryProduct: booking.serviceProduct || null,
    //     primaryLine: null,
    //     isServiceBooking: true,
    //   });
    // }
    // return rows;
    const rows = flattenVendorOrderLines(
      orders || [],
      vendorIdStr,
      categoryRateMap,
    );
    for (const booking of serviceBookings || []) {
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
        status: booking.status || 'pending',
        amount: Number(booking.totalAmount || 0),
        displayId: `SRV-${String(booking?.bookingNumber || 0).padStart(4, '0')}`,
        customerName: booking.user?.fullName || booking.name || '-',
        productName:
          booking.serviceSnapshot?.productName ||
          booking.serviceProduct?.productName ||
          'Service booking',
        productImage:
          booking.serviceSnapshot?.image || booking.serviceProduct?.image || '',
        primaryProduct: booking.serviceProduct || null,
        primaryLine: null,
        isServiceBooking: true,
        taxesAmount: Math.max(0, svcComputedTaxTotal),
      });
    }
    return rows;
  }, [orders, serviceBookings, vendorIdStr, categoryRateMap]);

  // const filteredOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const allowed = mapTabToStatuses(activeTab);
  //   return normalizedOrders.filter((o) => {
  //     // Hide pending orders — they only appear via the New Order modal
  //     // until vendor accepts them (which moves them to 'confirmed')
  //     if (String(o.status) === 'pending' && !o.vendorAcknowledged) return false;

  //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) {
  //       return false;
  //     }
  //     const tabMatch = allowed.length
  //       ? allowed.includes(String(o.status))
  //       : true;
  //     if (!tabMatch) return false;
  //     if (!q) return true;
  //     return (
  //       String(o.displayId).toLowerCase().includes(q) ||
  //       String(o.customerName).toLowerCase().includes(q) ||
  //       String(o.productName).toLowerCase().includes(q)
  //     );
  //   });
  // }, [normalizedOrders, activeTab, query]);

  // const filteredOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const allowed = mapTabToStatuses(activeTab);
  //   return normalizedOrders.filter((o) => {
  //     // Services tab: only service bookings
  //     if (activeTab === 'Services') {
  const customerOptions = useMemo(() => {
    const names = new Set();
    (normalizedOrders || []).forEach((o) => {
      if (o.customerName && o.customerName !== '-') names.add(o.customerName);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [normalizedOrders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allowed = mapTabToStatuses(activeTab);
    return normalizedOrders
      .filter((o) => {
        if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
        if (
          customerFilter !== 'all' &&
          String(o.customerName) !== customerFilter
        )
          return false;

        // Services tab: only service bookings
        if (activeTab === 'Services') {
          if (!o.isServiceBooking) return false;
          if (
            statusFilter !== 'all' &&
            getServiceDisplayStatus(o.status) !== statusFilter
          ) {
            return false;
          }
          if (!q) return true;
          return (
            String(o.displayId).toLowerCase().includes(q) ||
            String(o.customerName).toLowerCase().includes(q) ||
            String(o.productName).toLowerCase().includes(q)
          );
        }

        // All other tabs: exclude service bookings
        //     if (o.isServiceBooking) return false;

        //     if (String(o.status) === 'pending' && !o.vendorAcknowledged) return false;

        //     if (activeTab !== 'Pickup' && o.hasScheduledReturnPickup) {
        //       return false;
        //     }
        //     const tabMatch = allowed.length
        //       ? allowed.includes(String(o.status))
        //       : true;
        //     if (!tabMatch) return false;
        //     if (!q) return true;
        //     return (
        //       String(o.displayId).toLowerCase().includes(q) ||
        //       String(o.customerName).toLowerCase().includes(q) ||
        //       String(o.productName).toLowerCase().includes(q)
        //     );
        //   });
        // }, [normalizedOrders, activeTab, query, dateFilter, statusFilter]);
        // All other tabs: exclude service bookings
        // All other tabs: exclude service bookings
        if (o.isServiceBooking) return false;

        if (statusFilter !== 'all') {
          const matchesStatus =
            statusFilter === 'confirmed'
              ? ['confirmed', 'pending'].includes(String(o.status))
              : statusFilter === 'confirmed_only'
                ? String(o.status) === 'confirmed'
                : String(o.status) === statusFilter;
          if (!matchesStatus) return false;
        }

        if (
          activeTab !== 'Pickup' &&
          (o.hasScheduledReturnPickup || o.hasPendingReturnRequest)
        ) {
          return false;
        }

        // When a specific customer is selected, show ALL their products
        // regardless of the active tab's status restriction.
        // When a specific customer OR a specific status is selected, show ALL
        // matching items regardless of the active tab's status restriction.
        if (customerFilter === 'all' && statusFilter === 'all') {
          const tabMatch = allowed.length
            ? allowed.includes(String(o.status))
            : true;
          if (!tabMatch) return false;
        }
        //       if (!q) return true;
        //       return (
        //         String(o.displayId).toLowerCase().includes(q) ||
        //         String(o.customerName).toLowerCase().includes(q) ||
        //         String(o.productName).toLowerCase().includes(q)
        //       );
        //     })
        //     .reverse();
        // }, [
        //   normalizedOrders,
        //   activeTab,
        //   query,
        //   dateFilter,
        //   statusFilter,
        //   customerFilter,
        // ]);

        if (!q) return true;
        return (
          String(o.displayId).toLowerCase().includes(q) ||
          String(o.customerName).toLowerCase().includes(q) ||
          String(o.productName).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [
    normalizedOrders,
    activeTab,
    query,
    dateFilter,
    statusFilter,
    customerFilter,
  ]);

  // const pickupScheduledOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   return normalizedOrders.filter((o) => {
  //     if (!o.hasScheduledReturnPickup) return false;
  //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
  //     if (statusFilter !== 'all' && String(o.status) !== statusFilter)
  //       return false;
  //     if (!q) return true;
  //     return (
  //       String(o.displayId).toLowerCase().includes(q) ||
  //       String(o.customerName).toLowerCase().includes(q) ||
  //       String(o.productName).toLowerCase().includes(q)
  //     );
  //   });
  // }, [normalizedOrders, query, dateFilter, statusFilter]);

  // const relocationOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   const sortedOrders = [...(orders || [])].sort(
  //     (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  //   );
  //   const orderNumberMap = new Map(
  //     sortedOrders.map((o, idx) => [String(o._id), idx + 1]),
  //   );
  //   const rows = flattenVendorRelocationLines(
  //     sortedOrders,
  //     vendorIdStr,
  //     orderNumberMap,
  //   );
  const relocationOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = flattenVendorRelocationLines(
      orders || [],
      vendorIdStr,
      categoryRateMap,
    );
    //   return rows.filter((o) => {
    //     if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
    //     if (customerFilter !== 'all' && String(o.customerName) !== customerFilter)
    //       return false;
    //     if (!q) return true;
    //     return (
    //       String(o.displayId).toLowerCase().includes(q) ||
    //       String(o.customerName).toLowerCase().includes(q) ||
    //       String(o.productName).toLowerCase().includes(q)
    //     );
    //   });
    // }, [orders, vendorIdStr, query, dateFilter, customerFilter]);
    return rows
      .filter((o) => {
        if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
        if (
          customerFilter !== 'all' &&
          String(o.customerName) !== customerFilter
        )
          return false;
        if (
          statusFilter !== 'all' &&
          String(o.relocationRequest?.status || 'requested') !== statusFilter
        ) {
          return false;
        }
        //       if (!q) return true;
        //       return (
        //         String(o.displayId).toLowerCase().includes(q) ||
        //         String(o.customerName).toLowerCase().includes(q) ||
        //         String(o.productName).toLowerCase().includes(q)
        //       );
        //     })
        //     .reverse();
        // }, [orders, vendorIdStr, query, dateFilter, customerFilter, statusFilter]);
        if (!q) return true;
        return (
          String(o.displayId).toLowerCase().includes(q) ||
          String(o.customerName).toLowerCase().includes(q) ||
          String(o.productName).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [
    orders,
    vendorIdStr,
    query,
    dateFilter,
    customerFilter,
    statusFilter,
    categoryRateMap,
  ]);

  const relocationTotal = useMemo(
    () => relocationOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
    [relocationOrders],
  );

  // const pickupScheduledOrders = useMemo(() => {
  //   const q = query.trim().toLowerCase();
  //   return normalizedOrders
  //     .filter((o) => {
  //       if (!o.hasScheduledReturnPickup) return false;
  //       if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
  //       if (statusFilter !== 'all' && String(o.status) !== statusFilter)
  //         return false;
  //       if (
  //         customerFilter !== 'all' &&
  //         String(o.customerName) !== customerFilter
  //       )
  //         return false;
  const pickupScheduledOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalizedOrders
      .filter((o) => {
        if (!o.hasScheduledReturnPickup && !o.hasPendingReturnRequest)
          return false;
        if (!matchesDateFilter(o.createdAt, dateFilter)) return false;
        if (statusFilter === 'requested' && o.hasScheduledReturnPickup)
          return false;
        if (statusFilter === 'scheduled' && !o.hasScheduledReturnPickup)
          return false;
        if (
          customerFilter !== 'all' &&
          String(o.customerName) !== customerFilter
        )
          return false;
        //       if (!q) return true;
        //       return (
        //         String(o.displayId).toLowerCase().includes(q) ||
        //         String(o.customerName).toLowerCase().includes(q) ||
        //         String(o.productName).toLowerCase().includes(q)
        //       );
        //     })
        //     .reverse();
        // }, [normalizedOrders, query, dateFilter, statusFilter, customerFilter]);
        if (!q) return true;
        return (
          String(o.displayId).toLowerCase().includes(q) ||
          String(o.customerName).toLowerCase().includes(q) ||
          String(o.productName).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [normalizedOrders, query, dateFilter, statusFilter, customerFilter]);

  // const stats = useMemo(() => {
  //   // const processing = normalizedOrders.filter((o) =>
  //   //   ['pending', 'confirmed'].includes(String(o.status)),
  //   // ).length;
  //   const processing = normalizedOrders.filter((o) =>
  //     ['confirmed', 'pending'].includes(String(o.status)),
  //   ).length;
  //   const totalRevenue = normalizedOrders.reduce(
  //     (s, o) => s + Number(o.amount || 0),
  //     0,
  //   );
  //   const averageOrder = normalizedOrders.length
  //     ? Math.round(totalRevenue / normalizedOrders.length)
  //     : 0;

  const stats = useMemo(() => {
    // const processing = normalizedOrders.filter((o) =>
    //   ['pending', 'confirmed'].includes(String(o.status)),
    // ).length;
    const processing = normalizedOrders.filter((o) =>
      ['confirmed', 'pending'].includes(String(o.status)),
    ).length;
    // Each flattened row is one product line with its own vendor amount.
    const totalRevenue = normalizedOrders.reduce(
      (s, o) => s + Number(o.amount || 0),
      0,
    );
    const averageOrder = normalizedOrders.length
      ? Math.round(totalRevenue / normalizedOrders.length)
      : 0;

    // const urgentActions = normalizedOrders.filter((o) => {
    //   const isOpen = !['completed', 'cancelled'].includes(String(o.lineStatus));
    //   if (!isOpen) return false;
    //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
    //   return ageMs > 24 * 60 * 60 * 1000;
    // }).length;
    const urgentActions = normalizedOrders.filter((o) => {
      if (o.isServiceBooking) return false;
      const isOpen = !['completed', 'cancelled'].includes(String(o.lineStatus));
      if (!isOpen) return false;
      const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
      return ageMs > 24 * 60 * 60 * 1000;
    }).length;
    return { processing, totalRevenue, averageOrder, urgentActions };
  }, [normalizedOrders]);

  const filteredTotal = useMemo(
    () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
    [filteredOrders],
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(
    () =>
      filteredOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredOrders, currentPage],
  );

  const totalPickupPages = Math.max(
    1,
    Math.ceil(pickupScheduledOrders.length / PAGE_SIZE),
  );
  const paginatedPickupOrders = useMemo(
    () =>
      pickupScheduledOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [pickupScheduledOrders, currentPage],
  );
  // const pickupTotal = useMemo(
  //   () => pickupScheduledOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
  //   [pickupScheduledOrders],
  // );
  const pickupTotal = useMemo(
    () => pickupScheduledOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
    [pickupScheduledOrders],
  );
  const pickupPendingDueTotal = useMemo(
    () =>
      pickupScheduledOrders.reduce((s, o) => s + Number(o.pendingDue || 0), 0),
    [pickupScheduledOrders],
  );
  const servicesTotal = useMemo(
    () => filteredOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
    [filteredOrders],
  );

  // const tabCounts = useMemo(() => {
  //   const list = normalizedOrders;
  //   const nonPickup = list.filter((x) => !x.hasScheduledReturnPickup);
  //   const shipped = nonPickup.filter((x) =>
  //     ['shipped', 'in_progress'].includes(String(x.status)),
  //   ).length;
  //   return {
  //     Processing: nonPickup.filter(
  //       (x) =>
  //         ['confirmed'].includes(String(x.status)) ||
  //         (String(x.status) === 'pending' && x.vendorAcknowledged),
  //     ).length,
  //     Dispatched: shipped,
  //     'In Transit': shipped,
  //     Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
  //       .length,
  //     Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
  //       .length,
  //     Completed: nonPickup.filter((x) => String(x.status) === 'completed')
  //       .length,
  //     Pickup: list.filter((x) => x.hasScheduledReturnPickup).length,
  //   };
  // }, [normalizedOrders]);

  const tabCounts = useMemo(() => {
    const list = normalizedOrders;
    const productOrders = list.filter((x) => !x.isServiceBooking);
    const nonPickup = productOrders.filter((x) => !x.hasScheduledReturnPickup);
    const shipped = nonPickup.filter((x) =>
      ['shipped', 'in_progress'].includes(String(x.status)),
    ).length;
    return {
      Processing: nonPickup.filter((x) =>
        ['confirmed', 'pending'].includes(String(x.status)),
      ).length,
      Dispatched: shipped,
      'In Transit': shipped,
      Cancelled: nonPickup.filter((x) => String(x.status) === 'cancelled')
        .length,
      Delivered: nonPickup.filter((x) => String(x.status) === 'delivered')
        .length,
      Completed: nonPickup.filter((x) => String(x.status) === 'completed')
        .length,
      // Pickup: productOrders.filter((x) => x.hasScheduledReturnPickup).length,
      Pickup: productOrders.filter(
        (x) => x.hasScheduledReturnPickup || x.hasPendingReturnRequest,
      ).length,
      Relocate: productOrders.filter((x) =>
        Boolean(x?.relocationRequest?.requestedAt),
      ).length,
      Services: list.filter((x) => x.isServiceBooking).length,
    };
  }, [normalizedOrders]);

  const showPackaging = (status) =>
    ['pending', 'confirmed'].includes(String(status));
  const showDeliveryAction = (status) => String(status) === 'shipped';
  const serviceActionForStatus = (status) => {
    const s = String(status || '');
    if (s === 'pending') return { label: 'Confirm', next: 'confirmed' };
    if (s === 'confirmed') return { label: 'Start', next: 'in_progress' };
    if (s === 'in_progress') return { label: 'Complete', next: 'completed' };
    return null;
  };
  // const showScheduleAction = (order) => {
  //   if (String(order?.status || '') !== 'cancelled') return false;
  //   if (order?.hasScheduledReturnPickup) return false;
  //   return true;
  // };
  // const showScheduleAction = (order) => {
  //   if (order?.hasScheduledReturnPickup) return false;
  //   // Show Schedule if status is 'cancelled' (covers both:
  //   // actual cancelled orders AND delivered rentals with return request pending)
  //   if (String(order?.status || '') !== 'cancelled') return false;
  //   return true;
  // };

  // DELETE showScheduleAction, ADD this instead:
  const getCancelledAction = (order) => {
    if (String(order?.status || '') !== 'cancelled') return null;
    if (order?.hasScheduledReturnPickup) return null;
    // Delivered rental with active return request → show Schedule
    if (Boolean(order?.returnRequest?.requestedAt)) return 'schedule';
    // Plain cancel — who did it?
    const cancelledBy = order?.primaryLine?.cancelledBy;
    if (cancelledBy === 'vendor') return 'by_vendor';
    if (cancelledBy === 'user') return 'by_user';
    return null;
  };

  const handleConfirmRelocation = async () => {
    const order = relocationConfirmModal.order;
    if (!order?._id) return;
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      toast.error('Please login again to continue.');
      return;
    }
    const productId = String(
      order.primaryLine?.product?._id || order.primaryProduct?._id || '',
    );
    setConfirmingRelocation(true);
    try {
      const res = await apiConfirmVendorRelocation(
        order._id,
        { productId },
        authToken,
      );
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
      );
      toast.success('Relocation request confirmed.');
      setRelocationConfirmModal({ open: false, order: null });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to confirm relocation.',
      );
    } finally {
      setConfirmingRelocation(false);
    }
  };

  const handleSendServiceCompletionOtp = async () => {
    const booking = completeServiceModal.order;
    if (!booking?._id) return;
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      toast.error('Please login again to continue.');
      return;
    }
    setSendingServiceOtp(true);
    try {
      await apiSendServiceCompletionOtp(booking._id, authToken);
      toast.success('OTP sent to customer email!');
      setServiceOtpSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setSendingServiceOtp(false);
    }
  };

  const handleVerifyServiceCompletionOtp = async () => {
    const booking = completeServiceModal.order;
    if (!booking?._id) return;
    if (!serviceOtpInput) {
      toast.error('Please enter the OTP.');
      return;
    }
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      toast.error('Please login again to continue.');
      return;
    }
    setVerifyingServiceOtp(true);
    try {
      const res = await apiVerifyServiceCompletionOtp(
        booking._id,
        serviceOtpInput,
        authToken,
      );
      setServiceBookings((prev) =>
        prev.map((b) =>
          String(b._id) === String(booking._id) ? res.data.data : b,
        ),
      );
      toast.success('Service marked as completed!');
      setCompleteServiceModal({ open: false, order: null });
      setServiceOtpInput('');
      setServiceOtpSent(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Incorrect or expired OTP.');
    } finally {
      setVerifyingServiceOtp(false);
    }
  };

  const updateServiceBookingStatus = async (booking, status) => {
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken || !booking?._id) return;
    setUpdatingId(booking._id);
    try {
      const res = await apiUpdateVendorServiceBookingStatus(
        booking._id,
        status,
        authToken,
      );
      setServiceBookings((prev) =>
        prev.map((b) => (String(b._id) === String(booking._id) ? res.data : b)),
      );
      toast.success('Service booking updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update booking.');
    } finally {
      setUpdatingId('');
    }
  };

  const openInspectionModal = (order) => {
    setInspectionModal({ open: true, order });
    setInspectionChecklist({
      powerFunctionCheck: true,
      surfaceScratches: false,
      structuralIntegrity: true,
      accessoriesAccountedFor: true,
      cleanlinessCheck: true,
    });
    // setInspectionPickupPhotoName('');
    // setDamageDeduction('0');
    setInspectionPickupPhotoName('');
    setInspectionPickupPhotoFile(null);
    setDamageDeduction('0');
    setCleaningFees('0');
    setAuthorizeRefund(false);
  };

  const closeInspectionModal = () => {
    if (updatingId) return;
    setInspectionModal({ open: false, order: null });
  };

  const submitInspection = async () => {
    const order = inspectionModal.order;
    if (!order?._id) return;
    if (!inspectionPickupPhotoName) {
      toast.error('Please upload pickup photo.');
      return;
    }
    if (!authorizeRefund) {
      toast.error('Please authorize refund to continue.');
      return;
    }

    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      toast.error('Please login again to continue.');
      return;
    }

    // setUpdatingId(order._id);
    // try {
    //   const res = await apiCompleteVendorReturnInspection(
    //     order._id,
    //     {
    //       productId: order?.primaryLine?.product?._id || '',
    //       inspectionChecklist,
    //       pickupPhotoName: inspectionPickupPhotoName,
    //       damageDeduction: Number(damageDeduction || 0),
    //       cleaningFees: Number(cleaningFees || 0),
    //       authorizeRefund,
    //     },
    //     authToken,
    //   );
    setUpdatingId(order._id);
    try {
      const formData = new FormData();
      formData.append('productId', order?.primaryLine?.product?._id || '');
      formData.append(
        'inspectionChecklist',
        JSON.stringify(inspectionChecklist),
      );
      formData.append('pickupPhotoName', inspectionPickupPhotoName);
      formData.append('damageDeduction', Number(damageDeduction || 0));
      formData.append('cleaningFees', Number(cleaningFees || 0));
      formData.append('authorizeRefund', authorizeRefund);
      if (inspectionPickupPhotoFile) {
        formData.append('pickupPhoto', inspectionPickupPhotoFile);
      }

      const res = await apiCompleteVendorReturnInspection(
        order._id,
        formData,
        authToken,
      );
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
      );
      toast.success('Inspection saved. Refund initiated.');
      closeInspectionModal();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          'Failed to initiate refund and close order.',
      );
    } finally {
      setUpdatingId('');
    }
  };

  // const handleStatusNextAction = (order, nextStep) => {
  //   if (nextStep.type === 'review') {
  //     setNewOrderModal({ open: true, orderId: order._id });
  //   } else if (nextStep.type === 'packaging') {
  const handleReviewAccept = async (order) => {
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      toast.error('Please login again to continue.');
      return;
    }
    setUpdatingId(order._rowId || order._id);
    try {
      const res = await apiUpdateVendorOrderStatus(
        order._id,
        'confirmed',
        authToken,
      );
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
      );
      toast.success('Order confirmed.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not confirm order.');
    } finally {
      setUpdatingId('');
    }
  };

  const handleStatusNextAction = (order, nextStep) => {
    if (nextStep.type === 'review') {
      handleReviewAccept(order);
    } else if (nextStep.type === 'packaging') {
      const productId = String(
        order.primaryLine?.product?._id || order.primaryProduct?._id || '',
      );
      window.location.href = `/vendor/orders/${order._id}/pack?productId=${encodeURIComponent(productId)}`;
    } else if (nextStep.type === 'delivery') {
      openDeliveryModal(order);
    } else if (nextStep.type === 'schedule') {
      const rrLine = vendorReturnRequestedLine(order, vendorIdStr);
      setReturnModal({
        orderId: order._id,
        productId: rrLine?.product?._id || null,
      });
    } else if (nextStep.type === 'service') {
      updateServiceBookingStatus(order, nextStep.next);
    } else if (nextStep.type === 'inspection') {
      openInspectionModal(order);
    } else if (nextStep.type === 'relocate-confirm') {
      setRelocationConfirmModal({ open: true, order });
    } else if (nextStep.type === 'service-complete') {
      setCompleteServiceModal({ open: true, order });
    }
  };

  const openCancelOrderModal = (order) => {
    setCancelOrderModal({ open: true, order });
  };

  const closeCancelOrderModal = () => {
    if (cancellingOrder) return;
    setCancelOrderModal({ open: false, order: null });
  };

  const confirmVendorCancelOrder = async () => {
    const order = cancelOrderModal.order;
    if (!order?._id) return;
    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      toast.error('Please login again to continue.');
      return;
    }
    const productId = String(
      order.primaryLine?.product?._id || order.primaryProduct?._id || '',
    );
    setCancellingOrder(true);
    try {
      const res = await apiVendorCancelOrder(order._id, productId, authToken);
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
      );
      toast.success('Order cancelled. Full refund initiated for the customer.');
      setCancelOrderModal({ open: false, order: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancellingOrder(false);
    }
  };

  const openDeliveryModal = (order) => {
    // setDeliveryModal({ open: true, order, otp: makeOtp() });
    setDeliveryModal({ open: true, order, otp: '', otpSent: false });
    setOtpInput('');
    setInstallationDone(false);
    setKycBlockedMessage('');
  };

  const closeDeliveryModal = () => {
    if (updatingId) return;
    setDeliveryModal({ open: false, order: null, otp: '' });
    setOtpInput('');
    setInstallationDone(false);
    setKycBlockedMessage('');
  };

  // const confirmDeliveryFromModal = async () => {
  //   const order = deliveryModal.order;
  //   if (!order?._id) return;
  //   if (otpInput !== deliveryModal.otp) {
  //     toast.error('OTP does not match.');
  //     return;
  //   }
  //   if (
  //     productRequiresInstallation(order.primaryProduct) &&
  //     !installationDone
  //   ) {
  //     toast.error('Please confirm installation completed.');
  //     return;
  //   }
  //   const authToken =
  //     token ||
  //     (typeof window !== 'undefined'
  //       ? localStorage.getItem('vendorToken')
  //       : null);
  //   if (!authToken) {
  //     toast.error('Please login again.');
  //     return;
  //   }

  //   const productId = String(
  //     order.primaryLine?.product?._id || order.primaryProduct?._id || '',
  //   );

  //   setUpdatingId(order._rowId || order._id);
  //   try {
  //     // ↓ Call LINE-level status instead of order-level
  //     const res = await apiUpdateVendorLineStatus(
  //       order._id,
  //       productId,
  //       'delivered',
  //       authToken,
  //     );
  //     const updated = res.data;
  //     setOrders((prev) =>
  //       prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
  //     );
  //     toast.success('Delivery confirmed for this item.');
  //     closeDeliveryModal();
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Could not confirm delivery');
  //   } finally {
  //     setUpdatingId('');
  //   }
  // };

  const confirmDeliveryFromModal = async () => {
    const order = deliveryModal.order;
    if (!order?._id) return;

    const authToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null);
    if (!authToken) {
      toast.error('Please login again.');
      return;
    }

    const productId = String(
      order.primaryLine?.product?._id || order.primaryProduct?._id || '',
    );

    if (
      productRequiresInstallation(order.primaryProduct) &&
      !installationDone
    ) {
      toast.error('Please confirm installation completed.');
      return;
    }

    setUpdatingId(order._rowId || order._id);
    try {
      // Step 1: verify OTP server-side
      await apiVerifyVendorDeliveryOtp(
        order._id,
        productId,
        otpInput,
        authToken,
      );

      // Step 2: mark delivered
      const res = await apiUpdateVendorLineStatus(
        order._id,
        productId,
        'delivered',
        authToken,
      );
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (String(o._id) === String(order._id) ? updated : o)),
      );
      toast.success('Delivery confirmed!');
      closeDeliveryModal();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Could not confirm delivery.',
      );
    } finally {
      setUpdatingId('');
    }
  };
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <VendorSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <VendorTopBar user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f3f5f9]">
          <div className="space-y-4 sm:space-y-5 max-w-[1600px]">
            {/* <div>
              <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-500 mt-1">
                Customers who ordered your products.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {/* <div className="bg-white rounded-2xl border border-blue-100 p-4">
                    <p className="text-xs text-gray-500">Processing orders</p>
                    <p className="text-4xl font-semibold text-[#2563EB] mt-1">
                      {stats.processing}
                    </p>
                  </div> */}
                  <div className="bg-white rounded-2xl border border-[#BEDBFF] p-4">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={processOrder.src}
                        alt="processing orders"
                        className="w-8 h-8"
                      />
                      <p className="text-xs text-gray-500">Processing Orders</p>
                    </div>

                    <p className="text-3xl font-semibold text-[#2563EB] mt-1">
                      {stats.processing}
                    </p>
                  </div>
                  {/* <div className="bg-white rounded-2xl border border-emerald-100 p-4">
                    <p className="text-xs text-gray-500">Total value</p>
                    <p className="text-4xl font-semibold text-[#F97316] mt-1">
                      {money(stats.totalRevenue)}
                    </p>
                  </div> */}
                  <div className="bg-white rounded-2xl border border-[#FFD6A8] p-4">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={totalVal.src}
                        alt="total value"
                        className="w-8 h-8"
                      />
                      <p className="text-xs text-gray-500">Total value</p>
                    </div>

                    <p className="text-3xl font-semibold text-[#F97316] mt-1">
                      {money(stats.totalRevenue)}
                    </p>
                  </div>
                  {/* <div className="bg-white rounded-2xl border border-violet-100 p-4">
                    <p className="text-xs text-gray-500">Average order</p>
                    <p className="text-4xl font-semibold text-violet-600 mt-1">
                      {money(stats.averageOrder)}
                    </p>
                  </div> */}
                  <div className="bg-white rounded-2xl border border-emerald-100 p-4">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={totalOrdersIcon.src}
                        alt="total orders"
                        className="w-8 h-8"
                      />
                      <p className="text-xs text-gray-500">Total Orders</p>
                    </div>

                    <p className="text-3xl font-semibold text-[#10B981] mt-2">
                      {normalizedOrders.length}
                    </p>
                  </div>
                  {/* <div className="bg-white rounded-2xl border border-orange-100 p-4">
                    <p className="text-xs text-gray-500">Urgent actions</p>
                    <p className="text-4xl font-semibold text-orange-600 mt-1">
                      {stats.urgentActions}
                    </p>
                  </div> */}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
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
                              ? 'bg-[#F97316] text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tabCounts[tab] ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search orders, customers, products..."
                    className="w-full sm:max-w-md px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
                  />
                </div> */}
                {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search orders, customers, products..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
                      />
                    </div>
                    <div className="flex flex-1 flex-wrap sm:justify-end gap-3"> */}
                <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
                  <div className="flex flex-nowrap items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="relative w-full max-w-md shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search orders, customers, products..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
                      />
                    </div>
                    <div className="flex flex-nowrap flex-1 justify-end gap-3">
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
                      {/* 
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
                      >
                        {activeTab === 'Services' ? (
                          <>
                            <option value="all">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </>
                        ) : (
                          <>
                            <option value="all">All Statuses</option>
                        
                            <option value="confirmed">Processing</option>
                            <option value="shipped">Dispatched</option>

                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </>
                        )}
                      </select> */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
                      >
                        {activeTab === 'Services' ? (
                          <>
                            <option value="all">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </>
                        ) : activeTab === 'Pickup' ? (
                          <>
                            <option value="all">All Statuses</option>
                            <option value="requested">Requested</option>
                            <option value="scheduled">Pickup Scheduled</option>
                          </>
                        ) : activeTab === 'Relocate' ? (
                          <>
                            <option value="all">All Statuses</option>
                            <option value="requested">Requested</option>
                            <option value="confirmed">Confirmed</option>
                          </>
                        ) : (
                          <>
                            <option value="all">All Statuses</option>
                            <option value="confirmed">Processing</option>
                            <option value="confirmed_only">Confirmed</option>
                            <option value="shipped">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </>
                        )}
                      </select>
                      <select
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white"
                      >
                        <option value="all">All Customers</option>
                        {customerOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {activeTab === 'Relocate' && (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-[1100px] w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr className="text-gray-500">
                            <th className="px-4 py-3 text-left font-medium">
                              Order ID
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Product
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Relocation Date
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Relocate Amount
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
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
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {order.displayId}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {order.customerName}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {order.productImage ? (
                                    <img
                                      src={order.productImage}
                                      alt=""
                                      className="w-9 h-9 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-md bg-gray-100" />
                                  )}
                                  <span className="text-gray-800">
                                    {order.productName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                    order.orderType === 'Buy'
                                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                      : 'border-teal-200 bg-teal-50 text-teal-700'
                                  }`}
                                >
                                  {order.orderType || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {order.relocationRequest?.requestedAt
                                  ? new Date(
                                      order.relocationRequest.requestedAt,
                                    ).toLocaleDateString('en-GB')
                                  : '-'}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {money(order.amount)}
                              </td>
                              <td className="px-4 py-3">
                                <StatusStepDropdown
                                  {...getRelocateStatusMeta(order)}
                                  onSelect={(nextStep) =>
                                    handleStatusNextAction(order, nextStep)
                                  }
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewModal({ open: true, order });
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateOrderInvoicePDF(order, categoryRateMap);
                                    }}
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
                                colSpan={8}
                                className="px-4 py-10 text-center text-gray-500"
                              >
                                No relocation requests yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {relocationOrders.length > 0 && (
                          <tfoot>
                            <tr className="bg-gray-800 text-white">
                              <td
                                colSpan={7}
                                className="px-4 py-3 font-semibold"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {money(relocationTotal)}
                              </td>
                            </tr>
                          </tfoot>
                        )} */}
                          {relocationOrders.length === 0 && (
                            <tr>
                              <td
                                colSpan={8}
                                className="px-4 py-10 text-center text-gray-500"
                              >
                                No relocation requests yet.
                              </td>
                            </tr>
                          )}
                          {/* </tbody>
                        {relocationOrders.length > 0 && (
                          <tfoot>
                            <tr className="bg-gray-800 text-white">
                              <td
                                colSpan={5}
                                className="px-4 py-3 font-semibold"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {money(relocationTotal)}
                              </td>
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                )}
                {activeTab !== 'Pickup' &&
                  activeTab !== 'Services' &&
                  activeTab !== 'Relocate' && ( */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {activeTab !== 'Pickup' &&
                  activeTab !== 'Services' &&
                  activeTab !== 'Relocate' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-[1060px] w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-gray-500">
                              <th className="px-4 py-3 text-left font-medium">
                                Order ID
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Customer
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Product
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Type
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Order Date
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Amount
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* {paginatedOrders.map((order) => (
                              <tr
                                // key={order._id}
                                key={order._rowId}
                                onClick={() => {
                                  if (
                                    String(order.status) === 'pending' &&
                                    !order.isServiceBooking
                                  ) {
                                    setNewOrderModal({
                                      open: true,
                                      orderId: order._id,
                                    });
                                  }
                                }}
                                className={`border-t border-gray-100 ${
                                  String(order.status) === 'pending' &&
                                  !order.isServiceBooking
                                    ? 'cursor-pointer hover:bg-orange-50/60'
                                    : ''
                                }`}
                              > */}
                            {paginatedOrders.map((order) => (
                              <tr
                                // key={order._id}
                                key={order._rowId}
                                className="border-t border-gray-100"
                              >
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                  {order.displayId}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {order.customerName}
                                </td>
                                {/* <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {order.productImage ? (
                                    <img
                                      src={order.productImage}
                                      alt=""
                                      className="w-9 h-9 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-md bg-gray-100" />
                                  )}
                                  <span className="text-gray-800">
                                    {order.productName}
                                  </span>
                                </div>
                              </td> */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {order.productImage ? (
                                      <img
                                        src={order.productImage}
                                        alt=""
                                        className="w-9 h-9 rounded-md object-cover"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-md bg-gray-100" />
                                    )}
                                    <div className="min-w-0">
                                      <span className="text-gray-800 block">
                                        {order.productName}
                                      </span>
                                      {/*— show variant name like Amazon/Flipkart */}
                                      {order.variantName ? (
                                        <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
                                          {order.variantName}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {order.isServiceBooking ? (
                                    <span className="text-gray-300 text-xs">
                                      —
                                    </span>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                        order.orderType === 'Buy'
                                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                          : 'border-teal-200 bg-teal-50 text-teal-700'
                                      }`}
                                    >
                                      {order.orderType || '-'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {order.createdAt
                                    ? new Date(
                                        order.createdAt,
                                      ).toLocaleDateString('en-GB')
                                    : '-'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                  {money(order.amount)}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusStepDropdown
                                    label={statusDisplayLabel(order.status)}
                                    badgeClass={statusBadgeClasses(
                                      order.status,
                                    )}
                                    nextStep={getNextStepAction(order)}
                                    onSelect={(nextStep) =>
                                      handleStatusNextAction(order, nextStep)
                                    }
                                  />
                                </td>
                                {/* <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewModal({ open: true, order });
                                      }}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                      title="View"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateOrderInvoicePDF(order, categoryRateMap);
                                      }}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                      title="Download"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {filteredOrders.length === 0 && ( */}

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewModal({ open: true, order });
                                      }}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                      title="View"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateOrderInvoicePDF(order, categoryRateMap);
                                      }}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                      title="Download"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                    {[
                                      'pending',
                                      'confirmed',
                                      'shipped',
                                    ].includes(String(order.status)) ? (
                                      <CancelActionButton
                                        onCancelClick={() =>
                                          openCancelOrderModal(order)
                                        }
                                      />
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {filteredOrders.length === 0 && (
                              <tr>
                                <td
                                  colSpan={8}
                                  className="px-4 py-10 text-center text-gray-500"
                                >
                                  No orders found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                          {/* <tfoot>
                            <tr className="bg-gray-800 text-white">
                              <td
                                colSpan={7}
                                className="px-4 py-3 font-semibold"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {money(filteredTotal)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      {filteredOrders.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Page {currentPage} of {totalPages} •{' '}
                            {filteredOrders.length} results
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1),
                                )
                              }
                              disabled={currentPage === totalPages}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                {activeTab === 'Pickup' && ( */}
                          <tfoot>
                            <tr className="bg-gray-800 text-white">
                              <td
                                colSpan={5}
                                className="px-4 py-3 font-semibold"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {money(filteredTotal)}
                              </td>
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      {filteredOrders.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Page {currentPage} of {totalPages} •{' '}
                            {filteredOrders.length} results
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1),
                                )
                              }
                              disabled={currentPage === totalPages}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {activeTab === 'Pickup' && (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-[1060px] w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr className="text-gray-500">
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Order ID
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Product
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Pickup Date
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Pending Due
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPickupOrders.map((order) => (
                            <tr
                              // key={`pickup-${order._id}`}
                              key={`pickup-${order._rowId}`}
                              className="border-t border-gray-100"
                            >
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {order.displayId}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {order.customerName}
                              </td>
                              {/* <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {order.productImage ? (
                                  <img
                                    src={order.productImage}
                                    alt=""
                                    className="w-9 h-9 rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-md bg-gray-100" />
                                )}
                                <span className="text-gray-800">
                                  {order.productName}
                                </span>
                              </div>
                            </td> */}

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {order.productImage ? (
                                    <img
                                      src={order.productImage}
                                      alt=""
                                      className="w-9 h-9 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-md bg-gray-100" />
                                  )}
                                  <div className="min-w-0">
                                    <span className="text-gray-800 block">
                                      {order.productName}
                                    </span>
                                    {/*show variant name like Amazon/Flipkart */}
                                    {order.variantName ? (
                                      <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
                                        {order.variantName}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                    order.orderType === 'Buy'
                                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                      : 'border-teal-200 bg-teal-50 text-teal-700'
                                  }`}
                                >
                                  {order.orderType || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt,
                                    ).toLocaleDateString('en-GB')
                                  : '-'}
                              </td>
                              {/* <td className="px-4 py-3 font-semibold text-gray-900">
                              {money(order.amount)}
                            </td>
                            <td className="px-4 py-3">
                              {order.pendingDue > 0 ? (
                                <span className="font-semibold text-red-600">
                                  {money(order.pendingDue)}
                                </span>
                              ) : (
                                <span className="text-gray-400">₹0</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <StatusStepDropdown
                                label="Pickup Scheduled" */}

                              <td className="px-4 py-3 whitespace-nowrap">
                                {order.pendingDue > 0 ? (
                                  <span className="font-semibold text-red-600">
                                    {money(order.pendingDue)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">₹0</span>
                                )}
                              </td>
                              {/* <td className="px-4 py-3">
                                <StatusStepDropdown
                                  label="Pickup Scheduled"
                                  badgeClass="border-blue-200 bg-blue-50 text-blue-700"
                                  nextStep={{
                                    label: 'Inspection',
                                    type: 'inspection',
                                  }}
                                  onSelect={() =>
                                    handleStatusNextAction(order, {
                                      type: 'inspection',
                                    })
                                  }
                                />
                              </td> */}
                              <td className="px-4 py-3">
                                {order.hasScheduledReturnPickup ? (
                                  <StatusStepDropdown
                                    label="Pickup Scheduled"
                                    badgeClass="border-blue-200 bg-blue-50 text-blue-700"
                                    nextStep={{
                                      label: 'Inspection',
                                      type: 'inspection',
                                    }}
                                    onSelect={() =>
                                      handleStatusNextAction(order, {
                                        type: 'inspection',
                                      })
                                    }
                                  />
                                ) : (
                                  <StatusStepDropdown
                                    label="Requested"
                                    badgeClass="border-amber-200 bg-amber-50 text-amber-700"
                                    nextStep={{
                                      label: 'Schedule',
                                      type: 'schedule',
                                    }}
                                    onSelect={() =>
                                      handleStatusNextAction(order, {
                                        type: 'schedule',
                                      })
                                    }
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewModal({ open: true, order });
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateOrderInvoicePDF(order, categoryRateMap);
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {/* {pickupScheduledOrders.length === 0 && (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-4 py-10 text-center text-gray-500"
                            >
                              No pickup-scheduled returns yet.
                            </td>
                          </tr>
                        )} */}

                          {/* {pickupScheduledOrders.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className="px-4 py-10 text-center text-gray-500"
                            >
                              No pickup-scheduled returns yet.
                            </td>
                          </tr>
                        )} */}
                          {pickupScheduledOrders.length === 0 && (
                            <tr>
                              <td
                                colSpan={8}
                                className="px-4 py-10 text-center text-gray-500"
                              >
                                No pickup-scheduled returns yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {pickupScheduledOrders.length > 0 && (
                          <tfoot>
                            <tr className="bg-gray-800 text-white">
                              <td
                                colSpan={5}
                                className="px-4 py-3 font-semibold"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {money(pickupPendingDueTotal)}
                              </td>
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                    {pickupScheduledOrders.length > 0 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
                        <p className="text-xs text-gray-500">
                          Page {currentPage} of {totalPickupPages} •{' '}
                          {pickupScheduledOrders.length} results
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(totalPickupPages, p + 1),
                              )
                            }
                            disabled={currentPage === totalPickupPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Services' && (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-[1060px] w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr className="text-gray-500">
                            <th className="px-4 py-3 text-left font-medium">
                              Order ID
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Product
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Order Date
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedOrders.map((order) => (
                            <tr
                              key={order._rowId}
                              className="border-t border-gray-100"
                            >
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {order.displayId}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {order.customerName}
                              </td>
                              {/* <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {order.productImage ? (
                                    <img
                                      src={order.productImage}
                                      alt=""
                                      className="w-9 h-9 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-md bg-gray-100" />
                                  )}
                                  <span className="text-gray-800">
                                    {order.productName}
                                  </span>
                                </div>
                              </td> */}

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {order.productImage ? (
                                    <img
                                      src={order.productImage}
                                      alt=""
                                      className="w-9 h-9 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-md bg-gray-100" />
                                  )}
                                  <div className="min-w-0">
                                    <span className="text-gray-800 block">
                                      {order.productName}
                                    </span>
                                    {/*ADD — show variant name like Amazon/Flipkart */}
                                    {order.variantName ? (
                                      <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
                                        {order.variantName}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt,
                                    ).toLocaleDateString('en-GB')
                                  : '-'}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {money(order.amount)}
                              </td>
                              {/* <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Scheduled
                                </span>
                              </td> */}
                              {/* <td className="px-4 py-3">
                                {String(order.status) === 'cancelled' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-red-50 text-red-600 border-red-200">
                                    <X className="w-3.5 h-3.5" />
                                    Cancelled
                                  </span>
                                ) : String(order.status) === 'completed' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Scheduled
                                  </span>
                                )}
                              </td> */}
                              <td className="px-4 py-3">
                                <StatusStepDropdown
                                  {...getServiceStatusMeta(order)}
                                  onSelect={(nextStep) =>
                                    handleStatusNextAction(order, nextStep)
                                  }
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewModal({ open: true, order });
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateOrderInvoicePDF(order, categoryRateMap);
                                    }}
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
                                colSpan={7}
                                className="px-4 py-10 text-center text-gray-500"
                              >
                                No service bookings found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {/* {filteredOrders.length > 0 && (
                          <tfoot>
                            <tr className="bg-gray-800 text-white">
                              <td
                                colSpan={6}
                                className="px-4 py-3 font-semibold"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {money(servicesTotal)}
                              </td>
                            </tr>
                          </tfoot>
                        )} */}
                        {filteredOrders.length > 0 && (
                          <tfoot>
                            <tr className="bg-gray-800 text-white">
                              <td
                                colSpan={4}
                                className="px-4 py-3 font-semibold"
                              >
                                Total
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {money(servicesTotal)}
                              </td>
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                      {filteredOrders.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Page {currentPage} of {totalPages} •{' '}
                            {filteredOrders.length} results
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1),
                                )
                              }
                              disabled={currentPage === totalPages}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <DeliveryVerificationModal
        open={deliveryModal.open}
        order={deliveryModal.order}
        otp={deliveryModal.otp}
        otpInput={otpInput}
        setOtpInput={setOtpInput}
        installationDone={installationDone}
        setInstallationDone={setInstallationDone}
        confirming={Boolean(
          updatingId && deliveryModal.order?._id === updatingId,
        )}
        onClose={closeDeliveryModal}
        onConfirm={confirmDeliveryFromModal}
        otpSent={deliveryModal.otpSent || false}
        sendingOtp={sendingOtp}
        onSendOtp={handleSendDeliveryOtp}
        kycBlockedMessage={kycBlockedMessage}
      />
      {relocationConfirmModal.open && relocationConfirmModal.order && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() =>
            !confirmingRelocation &&
            setRelocationConfirmModal({ open: false, order: null })
          }
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Confirm Relocation
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {relocationConfirmModal.order.productName}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to confirm relocating this product from the
              old address to the new address?
            </p>

            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Old Address
                </p>
                <p className="font-medium text-gray-800 mt-0.5">
                  {relocationConfirmModal.order.currentAddress?.label ||
                    relocationConfirmModal.order.currentAddress?.name ||
                    '-'}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {relocationConfirmModal.order.currentAddress?.address || '-'}
                </p>
                {relocationConfirmModal.order.currentAddress?.phone ? (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Phone: {relocationConfirmModal.order.currentAddress.phone}
                  </p>
                ) : null}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  New Address
                </p>
                <p className="font-medium text-gray-800 mt-0.5">
                  {relocationConfirmModal.order.newAddress?.label || '-'}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {[
                    relocationConfirmModal.order.newAddress?.addressLine,
                    relocationConfirmModal.order.newAddress?.area,
                    relocationConfirmModal.order.newAddress?.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {relocationConfirmModal.order.newAddress?.phone ? (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Phone: {relocationConfirmModal.order.newAddress.phone}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={confirmingRelocation}
                onClick={() =>
                  setRelocationConfirmModal({ open: false, order: null })
                }
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmingRelocation}
                onClick={handleConfirmRelocation}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {confirmingRelocation ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      <VendorNewOrderModal
        open={newOrderModal.open}
        orderId={newOrderModal.orderId}
        vendorIdStr={vendorIdStr}
        getToken={() =>
          token ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('vendorToken')
            : null)
        }
        onClose={() => {
          setNewOrderModal({ open: false, orderId: null });
          fetchOrders();
        }}
      />

      <VendorReturnRequestedModal
        open={Boolean(returnModal.orderId)}
        orderId={returnModal.orderId}
        productId={returnModal.productId}
        vendorIdStr={vendorIdStr}
        getToken={() =>
          token ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('vendorToken')
            : null)
        }
        onClose={() => {
          setReturnModal({ orderId: null, productId: null });
          fetchOrders();
        }}
      />

      {/* {completeServiceModal.open && completeServiceModal.order && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setCompleteServiceModal({ open: false, order: null })}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Mark as Completed?
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {completeServiceModal.order.productName}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
              Are you sure this service is completed? This action will notify
              the customer and cannot be undone.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setCompleteServiceModal({ open: false, order: null })
                }
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingId === completeServiceModal.order._id}
                onClick={async () => {
                  await updateServiceBookingStatus(
                    completeServiceModal.order,
                    'completed',
                  );
                  setCompleteServiceModal({ open: false, order: null });
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {updatingId === completeServiceModal.order._id
                  ? 'Saving...'
                  : 'Yes, Complete'}
              </button>
            </div>
          </div>
        </div>
      )} */}

      {completeServiceModal.open && completeServiceModal.order && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => {
            setCompleteServiceModal({ open: false, order: null });
            setServiceOtpInput('');
            setServiceOtpSent(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Complete Service
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {completeServiceModal.order.productName}
                </p>
              </div>
            </div>

            {!serviceOtpSent ? (
              <>
                <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  Send an OTP to the customer&apos;s email. Ask them for the
                  code once the service is done, then enter it to confirm
                  completion.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCompleteServiceModal({ open: false, order: null });
                      setServiceOtpInput('');
                      setServiceOtpSent(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={sendingServiceOtp}
                    onClick={handleSendServiceCompletionOtp}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {sendingServiceOtp ? 'Sending...' : 'Send OTP to Customer'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  Ask the customer for the 4-digit OTP sent to their email and
                  enter it below to mark this service as completed.
                </p>
                <input
                  value={serviceOtpInput}
                  onChange={(e) =>
                    setServiceOtpInput(
                      String(e.target.value || '')
                        .replace(/\D/g, '')
                        .slice(0, 4),
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter OTP"
                  className="mt-4 w-full text-center tracking-[0.5em] text-lg font-semibold px-3 py-2.5 border border-gray-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleSendServiceCompletionOtp}
                  disabled={sendingServiceOtp}
                  className="mt-2 text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                >
                  {sendingServiceOtp ? 'Resending...' : 'Resend OTP'}
                </button>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCompleteServiceModal({ open: false, order: null });
                      setServiceOtpInput('');
                      setServiceOtpSent(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      verifyingServiceOtp || serviceOtpInput.length !== 4
                    }
                    onClick={handleVerifyServiceCompletionOtp}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {verifyingServiceOtp ? 'Verifying...' : 'Verify & Complete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <ReturnInspectionModal
        open={inspectionModal.open}
        order={inspectionModal.order}
        checklist={inspectionChecklist}
        setChecklist={setInspectionChecklist}
        // pickupPhotoName={inspectionPickupPhotoName}
        // setPickupPhotoName={setInspectionPickupPhotoName}
        pickupPhotoName={inspectionPickupPhotoName}
        setPickupPhotoName={setInspectionPickupPhotoName}
        setPickupPhotoFile={setInspectionPickupPhotoFile}
        damageDeduction={damageDeduction}
        setDamageDeduction={setDamageDeduction}
        cleaningFees={cleaningFees}
        setCleaningFees={setCleaningFees}
        authorizeRefund={authorizeRefund}
        setAuthorizeRefund={setAuthorizeRefund}
        submitting={Boolean(
          updatingId && inspectionModal.order?._id === updatingId,
        )}
        onClose={closeInspectionModal}
        onSubmit={submitInspection}
      />
      <OrderDetailsModal
        open={viewModal.open}
        order={viewModal.order}
        onClose={() => setViewModal({ open: false, order: null })}
        vendorIdStr={vendorIdStr}
        categoryRateMap={categoryRateMap}
      />
      <VendorCancelOrderModal
        open={cancelOrderModal.open}
        order={cancelOrderModal.order}
        cancelling={cancellingOrder}
        onClose={closeCancelOrderModal}
        onConfirm={confirmVendorCancelOrder}
      />
    </div>
  );
}
