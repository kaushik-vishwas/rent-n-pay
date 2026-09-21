// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { createPortal } from 'react-dom';
// import { useRouter, useSearchParams } from 'next/navigation';
// import {
//   Search,
//   Truck,
//   MapPin,
//   CheckCircle2,
//   XCircle,
//   ExternalLink,
//   Package,
//   Star,
//   Calendar,
//   Clock,
//   ChevronLeft,
//   ChevronRight,
//   Wallet,
//   CheckCircle,
// } from 'lucide-react';
// import {
//   apiGetMyBookings,
//   apiGetMyOrders,
//   apiGetMyReview,
//   apiCancelMyBooking,
//   apiGetServiceById,
//   apiGetMyServiceReview,
//   apiGetNextMonthDue,
//   apiPayServiceBooking,
//   apiCreateRazorpayOrder,
//   apiVerifyRazorpayPayment,
// } from '@/lib/api';
// import {
//   formatMoney,
//   formatOrderDate,
//   orderDisplayId,
//   startOfDay,
//   productImageUrl,
//   normalizeStatus,
//   resolveTenureUnit,
//   computeLeaseEnd,
//   computeNextPaymentLabel,
//   daysUntilNextRent,
//   orderLineTotal,
//   orderGrandTotal,
//   primaryProduct,
//   orderIsPurchase,
//   lineIsPurchase,
//   orderProductLines,
//   lineDisplayPrice,
//   purchaseLineTotal,
//   firstMyRentalsEligibleLine,
//   lineUnitRent,
//   lineEligibleForRentalHub,
// } from '@/lib/orderRentalUtils';
// import ReviewModal from '@/components/ReviewModal';
// import BookingModal from '@/components/ServicePage/ServiceBookinModal';
// import ServiceReviewModal from '@/components/ServiceReviewModal';

// const PAGE_SIZE = 10;

// const ORANGE = 'bg-[#FF6F00] hover:bg-[#e56400]';
// const ORANGE1 = 'hover:bg-[#FF6F00]';
// const ORANGE_TEXT = 'text-[#FF6F00]';
// const ORANGE_BORDER = 'border-[#FF6F00]';

// // ─── helpers ────────────────────────────────────────────────────────────────

// function rentalProductLines(order) {
//   return (order.products || []).filter((line) => {
//     const lineType = String(line?.productType || '').toLowerCase();
//     if (lineType === 'sell') return false;
//     const p = line?.product;
//     if (!p || typeof p === 'string') return false;
//     if (String(p?.type || '').toLowerCase() === 'sell') return false;
//     return true;
//   });
// }

// // function resolveServiceProductId(booking) {
// //   const sp = booking?.serviceProduct;
// //   if (!sp) return null;
// //   if (typeof sp === 'string' && sp !== 'undefined') return sp;
// //   if (sp._id) return String(sp._id);
// //   return (
// //     sp?.serviceProductId || booking?.serviceSnapshot?.serviceProductId || null
// //   );
// // }

// function resolveServiceProductId(booking) {
//   const sp = booking?.serviceProduct;

//   // Case 1: populated object with _id
//   if (sp && typeof sp === 'object' && sp._id) return String(sp._id);

//   // Case 2: plain string ID
//   if (sp && typeof sp === 'string' && sp !== 'undefined' && sp !== 'null')
//     return sp;

//   // Case 3: snapshot has it
//   if (
//     booking?.serviceSnapshot?.serviceProductId &&
//     booking.serviceSnapshot.serviceProductId !== ''
//   )
//     return String(booking.serviceSnapshot.serviceProductId);
//   // Case 4: snapshot itself is the ID source
//   if (booking?.serviceSnapshot?._id) return String(booking.serviceSnapshot._id);

//   console.warn('resolveServiceProductId: could not resolve from', booking);
//   return null;
// }

// function CancelConfirmModal({ booking, onConfirm, onClose }) {
//   if (typeof document === 'undefined') return null;
//   const title =
//     booking?.serviceSnapshot?.productName ||
//     booking?.serviceProduct?.productName ||
//     'Service';

//   const now = new Date();
//   // const bookingDateTime = new Date(booking.bookingDate);
//   // if (booking.timeSlot?.startTime) {
//   //   const [h, m] = booking.timeSlot.startTime.split(':').map(Number);
//   //   bookingDateTime.setHours(h, m, 0, 0);
//   // }

//   const bookingDateTime = new Date(booking.bookingDate);
//   if (booking.timeSlot?.from) {
//     const raw = String(booking.timeSlot.from).trim();
//     const isPM = /pm/i.test(raw);
//     const isAM = /am/i.test(raw);
//     const timePart = raw.replace(/[apm\s]/gi, '');
//     let [h, m] = timePart.split(':').map(Number);
//     if (isPM || isAM) {
//       if (isPM && h !== 12) h += 12;
//       if (isAM && h === 12) h = 0;
//     }
//     bookingDateTime.setHours(h, m, 0, 0);
//   }

//   // const hoursUntilService = (bookingDateTime - now) / (1000 * 60 * 60);
//   // const isLate = hoursUntilService < 1.5;
//   // const total = Number(booking.totalAmount || 0);
//   // const fee = isLate ? Math.round(total * 0.1) : 0;
//   // const refund = total - fee;
//   const isPayAfterService = booking.paymentMethod === 'pay_after_service';
//   const hoursUntilService = (bookingDateTime - now) / (1000 * 60 * 60);
//   const isLate = hoursUntilService < 1.5;
//   const total = Number(booking.totalAmount || 0);
//   const fee = isPayAfterService ? 0 : isLate ? Math.round(total * 0.1) : 0;
//   const refund = isPayAfterService ? 0 : total - fee;

//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h2 className="text-base font-bold text-black">Cancel Booking?</h2>
//         <p className="text-sm text-gray-500 mt-1">{title}</p>

//         <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Booking Amount</span>
//             <span className="font-semibold text-black">
//               ₹{formatMoney(total)}/-
//             </span>
//           </div>
//           {/* {isLate ? (
//             <>
//               <div className="flex justify-between text-red-600">
//                 <span>Late Cancellation Fee (10%)</span>
//                 <span className="font-semibold">− ₹{formatMoney(fee)}</span>
//               </div>
//               <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
//                 <span>Refund to Source</span>
//                 <span>₹{formatMoney(refund)}</span>
//               </div>
//               <p className="text-xs text-red-500 mt-1">
//                 Cancelling within 1.5 hours of the service attracts a 10% fee.
//               </p>
//             </>
//           ) : (
//             <>
//               <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
//                 <span>Full Refund to Source</span>
//                 <span>₹{formatMoney(refund)}</span>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Free cancellation — more than 1.5 hours before service.
//               </p>
//             </>
//           )} */}

//           {isPayAfterService ? (
//             <>
//               <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-700 font-bold">
//                 <span>Amount Payable</span>
//                 <span>₹0</span>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 No payment was made for this booking — nothing to refund.
//               </p>
//             </>
//           ) : isLate ? (
//             <>
//               <div className="flex justify-between text-red-600">
//                 <span>Late Cancellation Fee (10%)</span>
//                 <span className="font-semibold">− ₹{formatMoney(fee)}</span>
//               </div>
//               <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
//                 <span>Refund to Source</span>
//                 <span>₹{formatMoney(refund)}</span>
//               </div>
//               <p className="text-xs text-red-500 mt-1">
//                 Cancelling within 1.5 hours of the service attracts a 10% fee.
//               </p>
//             </>
//           ) : (
//             <>
//               <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
//                 <span>Full Refund to Source</span>
//                 <span>₹{formatMoney(refund)}</span>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Free cancellation — more than 1.5 hours before service.
//               </p>
//             </>
//           )}
//         </div>

//         <div className="mt-5 flex gap-3">
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//           >
//             Keep Booking
//           </button>
//           <button
//             type="button"
//             onClick={onConfirm}
//             className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
//           >
//             Yes, Cancel
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// }
// function everyRentalLineHasReturnRequest(order) {
//   const lines = rentalProductLines(order);
//   if (!lines.length) return false;
//   return lines.every((line) => {
//     const s = String(line?.returnRequest?.status || '');
//     return s === 'requested' || s === 'review_submitted';
//   });
// }

// function orderReturnLine(order) {
//   return (order.products || []).find((line) => {
//     const s = String(line?.returnRequest?.status || '');
//     return s === 'requested' || s === 'review_submitted';
//   });
// }

// // function lineRefundableDeposit(line) {
// //   if (!line) return 0;
// //   const fromLine = Number(line.refundableDeposit);
// //   if (Number.isFinite(fromLine) && fromLine > 0) return fromLine;
// //   const p = line.product;
// //   if (p && typeof p === 'object') {
// //     const d = Number(p.refundableDeposit);
// //     if (Number.isFinite(d) && d > 0) return d;
// //   }
// //   return 0;
// // }

// function lineRefundableDeposit(line) {
//   if (!line) return 0;
//   const fromLine = Number(line.refundableDeposit);
//   if (Number.isFinite(fromLine) && fromLine > 0) return fromLine;
//   const p = line.product;
//   if (p && typeof p === 'object') {
//     const d = Number(p.refundableDeposit);
//     if (Number.isFinite(d) && d > 0) return d;
//   }
//   return 0;
// }

// // Product-only order total (products + delivery/GST/care/etc fees +
// // refundable deposits). Deliberately does NOT use order.totalAmount,
// // because that field can include an unrelated service booking amount
// // when a rent/buy order and a service booking share the same order —
// // which would otherwise leak the service price into the product card's
// // "Order Value".
// function orderProductOnlyTotal(order) {
//   const productLines = (order.products || []).map((line) => {
//     const unitPrice = Number(line?.pricePerDay || line?.price || 0);
//     const qty = Number(line?.quantity || 1);
//     return unitPrice * qty;
//   });
//   const productsSubtotal = productLines.reduce((s, v) => s + v, 0);

//   const delivery = Number(order.deliveryFee || 0);
//   const gst = Number(order.gst || 0);
//   const care = Number(order.careProtection || 0);
//   const repairWarranty = Number(order.repairWarranty || 0);
//   const relocationWarranty = Number(order.relocationWarranty || 0);
//   const deliveryPackaging = Number(order.deliveryPackaging || 0);
//   const installationFee = Number(order.installationFee || 0);
//   const platformFee = Number(order.platformFee || 0);
//   const discount = Number(order.discountAmount || 0);

//   const deposits = (order.products || []).reduce((s, l) => {
//     const d = Number(l?.refundableDeposit || 0);
//     return s + (d > 0 ? d : 0);
//   }, 0);

//   return (
//     productsSubtotal +
//     delivery +
//     gst +
//     care +
//     repairWarranty +
//     relocationWarranty +
//     deliveryPackaging +
//     installationFee +
//     platformFee +
//     deposits -
//     discount
//   );
// }

// /**
//  * Classify an order+line pair so each line card knows what to render.
//  * `line` may be null (order has no populated products).
//  */
// function classifyOrderLine(order, line) {
//   // const st = normalizeStatus(order.status);
//   const st = normalizeStatus(line?.lineStatus || order.status);
//   // const st = normalizeStatus(
//   //   order.status === 'cancelled'
//   //     ? 'cancelled'
//   //     : line?.lineStatus || order.status,
//   // );

//   // Resolve product from this specific line (fall back to order-level primary)
//   const lineProduct =
//     line && typeof line.product === 'object' ? line.product : null;
//   const product = lineProduct ?? primaryProduct(order);

//   // const start = order.createdAt ? new Date(order.createdAt) : new Date();
//   // const unit = product
//   //   ? resolveTenureUnit(order, product, order.rentalDuration)
//   //   : order.tenureUnit === 'day'
//   //     ? 'day'
//   //     : 'month';
//   // const leaseEnd = computeLeaseEnd(start, order.rentalDuration, unit);
//   const start = order.createdAt ? new Date(order.createdAt) : new Date();
//   // Use this line's own rentalDuration/tenureUnit when present (set by a
//   // per-product tenure extension) instead of the shared order-level
//   // values, so extending one product's tenure doesn't visually extend
//   // any other product line in the same order.
//   const lineDuration = Number(line?.rentalDuration ?? order.rentalDuration);
//   const lineTenureUnit = line?.tenureUnit ?? order.tenureUnit;
//   const orderForLine = {
//     ...order,
//     rentalDuration: lineDuration,
//     tenureUnit: lineTenureUnit,
//   };
//   const unit = product
//     ? resolveTenureUnit(orderForLine, product, lineDuration)
//     : lineTenureUnit === 'day'
//       ? 'day'
//       : 'month';
//   const leaseEnd = computeLeaseEnd(start, lineDuration, unit);
//   const daysLeft = Math.ceil(
//     (startOfDay(leaseEnd).getTime() - startOfDay(new Date()).getTime()) /
//       86400000,
//   );

//   const isSell = line ? lineIsPurchase(line) : orderIsPurchase(order);

//   if (st === 'cancelled') {
//     return { kind: 'cancelled', leaseEnd, daysLeft, unit, product };
//   }
//   // if (st === 'completed') {
//   //   if (isSell) {
//   //     return {
//   //       kind: 'delivered_purchase',
//   //       purchasePhase: 'completed',
//   //       leaseEnd,
//   //       daysLeft,
//   //       unit,
//   //       product,
//   //     };
//   //   }
//   //   return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
//   // }
//   // if (st === 'delivered') {
//   if (st === 'completed') {
//     if (isSell) {
//       return {
//         kind: 'delivered_purchase',
//         purchasePhase: 'completed',
//         leaseEnd,
//         daysLeft,
//         unit,
//         product,
//       };
//     }
//     return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
//   }

//   // Any relocation request (pending or confirmed) should surface in its
//   // own tab regardless of the line's current status (processing,
//   // dispatched, confirmed, delivered, etc.) — not just when delivered.
//   const hasRelocationRequestAnyStatus =
//     line && Boolean(line?.relocationRequest?.requestedAt);
//   if (hasRelocationRequestAnyStatus) {
//     return {
//       kind: 'relocation_requested',
//       leaseEnd,
//       daysLeft,
//       unit,
//       product,
//     };
//   }

//   if (st === 'delivered') {
//     if (isSell) {
//       return {
//         kind: 'delivered_purchase',
//         purchasePhase: 'delivered',
//         leaseEnd,
//         daysLeft,
//         unit,
//         product,
//       };
//     }

//     // const lineHasReturn =
//     //   line &&
//     //   (() => {
//     //     const s = String(line?.returnRequest?.status || '');
//     //     return s === 'requested' || s === 'review_submitted';
//     //   })();

//     // if (lineHasReturn) {
//     //   const isReturnDone = Boolean(line?.returnRequest?.refundInitiatedAt);
//     //   if (isReturnDone) {
//     //     return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
//     //   }
//     //   return { kind: 'pickup_scheduled', leaseEnd, daysLeft, unit, product };
//     // }

//     const lineHasReturn =
//       line &&
//       (() => {
//         const s = String(line?.returnRequest?.status || '');
//         return s === 'requested' || s === 'review_submitted';
//       })();

//     // If refund already initiated → return cycle fully closed = completed
//     if (lineHasReturn) {
//       const isReturnDone = Boolean(line?.returnRequest?.refundInitiatedAt);
//       if (isReturnDone) {
//         return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
//       }
//       return { kind: 'pickup_scheduled', leaseEnd, daysLeft, unit, product };
//     }

//     // Any relocation request (pending or confirmed) — surface it in its
//     // own tab instead of the regular active-rental screen.
//     // const hasRelocationRequest =
//     //   line && Boolean(line?.relocationRequest?.requestedAt);
//     // if (hasRelocationRequest) {
//     //   return {
//     //     kind: 'relocation_requested',
//     //     leaseEnd,
//     //     daysLeft,
//     //     unit,
//     //     product,
//     //   };
//     // }
//     if (!lineProduct) {
//       return {
//         kind: 'rental_missing_catalog',
//         leaseEnd,
//         daysLeft,
//         unit,
//         product,
//       };
//     }
//     return { kind: 'delivered_rental', leaseEnd, daysLeft, unit, product };
//   }
//   if (st === 'shipped') {
//     return { kind: 'shipped', leaseEnd, daysLeft, unit, product };
//   }
//   return { kind: 'processing', leaseEnd, daysLeft, unit, product };
// }

// // ─── tab helpers ─────────────────────────────────────────────────────────────

// /**
//  * Returns all (order, line) pairs that belong to a given tab.
//  * Each populated line becomes its own row.
//  */
// function buildLineRows(orders, tab) {
//   const rows = [];

//   for (const order of orders) {
//     const lines = orderProductLines(order);

//     if (!lines.length) {
//       // No populated lines — show as single placeholder row on 'all'
//       if (tab === 'all') {
//         rows.push({ order, line: null, key: `${order._id}-null` });
//       }
//       continue;
//     }

//     // for (let idx = 0; idx < lines.length; idx++) {
//     //   const line = lines[idx];
//     //   // const meta = classifyOrderLine(order, line);
//     //   const meta = classifyOrderLine(order, line);
//     //   // console.log('LINE FIELDS:', JSON.stringify(line, null, 2));
//     //   // console.log('FULL ORDER:', JSON.stringify(order, null, 2));

//     //   // Tab membership per line
//     //   // const inTab = (() => {
//     //   //   if (tab === 'all') return true;
//     //   //   if (tab === 'cancelled') return meta.kind === 'cancelled';
//     //   //   if (tab === 'delivered')
//     //   //     return (
//     //   //       meta.kind === 'completed_done' || meta.kind === 'delivered_purchase'
//     //   //     );
//     //   //   if (tab === 'active_rentals') return meta.kind === 'active_rental';
//     //   //   if (tab === 'services') return false;
//     //   //   return true;
//     //   // })();
//     //   const inTab = (() => {
//     //     if (tab === 'all') return true;
//     //     if (tab === 'cancelled') return meta.kind === 'cancelled';
//     //     if (tab === 'delivered')
//     //       return (
//     //         meta.kind === 'completed_done' || meta.kind === 'delivered_purchase'
//     //       );
//     //     if (tab === 'processing') return meta.kind === 'processing';
//     //     if (tab === 'dispatched') return meta.kind === 'shipped';
//     //     if (tab === 'services') return false;
//     //     return true;
//     //   })();

//     //   if (!inTab) continue;

//     for (let idx = 0; idx < lines.length; idx++) {
//       const line = lines[idx];
//       // const meta = classifyOrderLine(order, line);
//       const meta = classifyOrderLine(order, line);
//       // console.log('LINE FIELDS:', JSON.stringify(line, null, 2));
//       // console.log('FULL ORDER:', JSON.stringify(order, null, 2));

//       // Active rentals get their own dedicated screen (Rental Command
//       // Center) — never show them on the Orders page, in any tab.
//       if (meta.kind === 'active_rental') continue;

//       // Tab membership per line
//       // const inTab = (() => {
//       //   if (tab === 'all') return true;
//       //   if (tab === 'cancelled') return meta.kind === 'cancelled';
//       //   if (tab === 'delivered')
//       //     return (
//       //       meta.kind === 'completed_done' || meta.kind === 'delivered_purchase'
//       //     );
//       //   if (tab === 'processing') return meta.kind === 'processing';
//       //   if (tab === 'dispatched') return meta.kind === 'shipped';
//       //   if (tab === 'services') return false;
//       //   return true;
//       // })();
//       // const inTab = (() => {
//       //   if (tab === 'all') return true;
//       //   if (tab === 'cancelled') return meta.kind === 'cancelled';
//       //   if (tab === 'delivered')
//       //     return (
//       //       meta.kind === 'delivered_purchase' &&
//       //       meta.purchasePhase !== 'completed'
//       //     );
//       //   if (tab === 'completed')
//       //     return (
//       //       meta.kind === 'completed_done' ||
//       //       (meta.kind === 'delivered_purchase' &&
//       //         meta.purchasePhase === 'completed')
//       //     );
//       //   if (tab === 'processing') return meta.kind === 'processing';
//       //   if (tab === 'dispatched') return meta.kind === 'shipped';
//       //   if (tab === 'services') return false;
//       //   return true;
//       // })();
//       const inTab = (() => {
//         if (tab === 'all') return true;
//         if (tab === 'cancelled') return meta.kind === 'cancelled';
//         if (tab === 'pickup') return meta.kind === 'pickup_scheduled';
//         if (tab === 'relocate') return meta.kind === 'relocation_requested';
//         if (tab === 'delivered')
//           return (
//             (meta.kind === 'delivered_purchase' &&
//               meta.purchasePhase !== 'completed') ||
//             meta.kind === 'delivered_rental'
//           );
//         if (tab === 'completed')
//           return (
//             meta.kind === 'completed_done' ||
//             (meta.kind === 'delivered_purchase' &&
//               meta.purchasePhase === 'completed')
//           );
//         if (tab === 'processing') return meta.kind === 'processing';
//         if (tab === 'dispatched') return meta.kind === 'shipped';
//         if (tab === 'services') return false;
//         return true;
//       })();

//       if (!inTab) continue;
//       rows.push({
//         order,
//         line,
//         key: `${order._id}-${idx}`,
//         isFirstOfOrder: idx === 0,
//       });
//     }
//   }

//   return rows;
// }

// function getProductDetailHref(order, line) {
//   const p =
//     line?.product && typeof line.product === 'object' ? line.product : null;
//   if (!p?._id) return null;
//   const lineType = String(line?.productType || p?.type || '').toLowerCase();
//   if (lineType === 'sell') return `/buy-product-details/${p._id}`;
//   if (lineType === 'service') return `/service/${p._id}`;
//   return `/rent-product-details/${p._id}`;
// }

// // function tabCounts(orders) {
// //   const c = {
// //     all: 0,
// //     active_rentals: 0,
// //     delivered: 0,
// //     services: 0,
// //     cancelled: 0,
// //   };
// //   for (const o of orders) {
// //     const lines = orderProductLines(o);
// //     if (!lines.length) {
// //       c.all += 1;
// //       continue;
// //     }
// //     for (const line of lines) {
// //       const meta = classifyOrderLine(o, line);
// //       c.all += 1;
// //       if (meta.kind === 'cancelled') c.cancelled += 1;
// //       if (meta.kind === 'completed_done' || meta.kind === 'delivered_purchase')
// //         c.delivered += 1;
// //       if (meta.kind === 'active_rental') c.active_rentals += 1;
// //     }
// //   }
// //   return c;
// // }

// // function tabCounts(orders) {
// //   const c = {
// //     all: 0,
// //     processing: 0,
// //     dispatched: 0,
// //     delivered: 0,
// //     services: 0,
// //     cancelled: 0,
// //   };
// //   for (const o of orders) {
// //     const lines = orderProductLines(o);
// //     if (!lines.length) {
// //       c.all += 1;
// //       continue;
// //     }
// //     for (const line of lines) {
// //       const meta = classifyOrderLine(o, line);
// //       // Active rentals are handled on a separate screen — excluded from
// //       // every Orders-page count, including "All".
// //       if (meta.kind === 'active_rental') continue;
// //       c.all += 1;
// //       if (meta.kind === 'cancelled') c.cancelled += 1;
// //       if (meta.kind === 'completed_done' || meta.kind === 'delivered_purchase')
// //         c.delivered += 1;
// //       if (meta.kind === 'processing') c.processing += 1;
// //       if (meta.kind === 'shipped') c.dispatched += 1;
// //     }
// //   }
// //   return c;
// // }

// // function tabCounts(orders) {
// //   const c = {
// //     all: 0,
// //     processing: 0,
// //     dispatched: 0,
// //     delivered: 0,
// //     services: 0,
// //     completed: 0,
// //     cancelled: 0,
// //   };
// //   for (const o of orders) {
// //     const lines = orderProductLines(o);
// //     if (!lines.length) {
// //       c.all += 1;
// //       continue;
// //     }
// //     for (const line of lines) {
// //       const meta = classifyOrderLine(o, line);
// //       // Active rentals are handled on a separate screen — excluded from
// //       // every Orders-page count, including "All".
// //       if (meta.kind === 'active_rental') continue;
// //       c.all += 1;
// //       if (meta.kind === 'cancelled') c.cancelled += 1;
// //       if (
// //         meta.kind === 'delivered_purchase' &&
// //         meta.purchasePhase !== 'completed'
// //       ) {
// //         c.delivered += 1;
// //       }
// //       if (
// //         meta.kind === 'completed_done' ||
// //         (meta.kind === 'delivered_purchase' &&
// //           meta.purchasePhase === 'completed')
// //       ) {
// //         c.completed += 1;
// //       }
// //       if (meta.kind === 'processing') c.processing += 1;
// //       if (meta.kind === 'shipped') c.dispatched += 1;
// //     }
// //   }
// //   return c;
// // }

// function tabCounts(orders) {
//   const c = {
//     all: 0,
//     processing: 0,
//     dispatched: 0,
//     delivered: 0,
//     services: 0,
//     completed: 0,
//     cancelled: 0,
//     pickup: 0,
//     relocate: 0,
//   };
//   for (const o of orders) {
//     const lines = orderProductLines(o);
//     if (!lines.length) {
//       c.all += 1;
//       continue;
//     }
//     for (const line of lines) {
//       const meta = classifyOrderLine(o, line);
//       // Active rentals are handled on a separate screen — excluded from
//       // every Orders-page count, including "All".
//       if (meta.kind === 'active_rental') continue;
//       c.all += 1;
//       if (meta.kind === 'cancelled') c.cancelled += 1;
//       if (meta.kind === 'pickup_scheduled') c.pickup += 1;
//       if (meta.kind === 'relocation_requested') c.relocate += 1;
//       if (
//         (meta.kind === 'delivered_purchase' &&
//           meta.purchasePhase !== 'completed') ||
//         meta.kind === 'delivered_rental'
//       ) {
//         c.delivered += 1;
//       }
//       if (
//         meta.kind === 'completed_done' ||
//         (meta.kind === 'delivered_purchase' &&
//           meta.purchasePhase === 'completed')
//       ) {
//         c.completed += 1;
//       }
//       if (meta.kind === 'processing') c.processing += 1;
//       if (meta.kind === 'shipped') c.dispatched += 1;
//     }
//   }
//   return c;
// }

// // ─── expected delivery ───────────────────────────────────────────────────────

// function expectedDeliveryDate(order, lineProduct) {
//   const product = lineProduct ?? primaryProduct(order);
//   const lv = product?.logisticsVerification || {};
//   const timelineValue = Number(lv.deliveryTimelineValue);
//   const timelineUnit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();

//   const d = order.vendorFulfillment?.markedShippedAt
//     ? new Date(order.vendorFulfillment.markedShippedAt)
//     : order.createdAt
//       ? new Date(order.createdAt)
//       : new Date();

//   if (Number.isFinite(timelineValue) && timelineValue > 0) {
//     if (timelineUnit === 'hours') d.setHours(d.getHours() + timelineValue);
//     else d.setDate(d.getDate() + timelineValue);
//   } else {
//     d.setDate(d.getDate() + 7);
//   }
//   return formatOrderDate(d);
// }

// // ─── main page ───────────────────────────────────────────────────────────────

// export default function MyOrders() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const refreshKey = searchParams.get('refresh');
//   const [orders, setOrders] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [query, setQuery] = useState('');
//   // const [tab, setTab] = useState('all');
//   const [tab, setTab] = useState('processing');

//   const [page, setPage] = useState(1);
//   const [returnPrompt, setReturnPrompt] = useState({
//     open: false,
//     orderId: '',
//     orderRef: '',
//     productId: '',
//     title: '',
//     image: '',
//     cycleRent: 0,
//     cycleUnit: 'month',
//     startedOn: '',
//     totalTenure: '',
//     totalTenureLabel: 'Total Months',
//     cycleEnds: '',
//   });

//   const [reviewModal, setReviewModal] = useState({
//     open: false,
//     productId: '',
//     orderId: '',
//     productName: '',
//     image: '',
//     existingReview: null,
//   });
//   const [rescheduleModal, setRescheduleModal] = useState({
//     open: false,
//     product: null,
//     booking: null,
//   });

//   const [serviceReviewModal, setServiceReviewModal] = useState({
//     open: false,
//     serviceProductId: '',
//     bookingId: '',
//     serviceName: '',
//     image: '',
//     vendorName: '',
//     existingReview: null,
//   });

//   const [cancelModal, setCancelModal] = useState({
//     open: false,
//     booking: null,
//   });

//   useEffect(() => {
//     function fetchOrders() {
//       setLoading(true);
//       setError('');
//       Promise.all([apiGetMyOrders(), apiGetMyBookings()])
//         .then(([ordersRes, bookingsRes]) => {
//           setOrders(ordersRes.data || []);
//           setBookings(bookingsRes.data || []);
//         })
//         .catch((err) => {
//           setOrders([]);
//           setBookings([]);
//           setError(err.response?.data?.message || 'Failed to load orders.');
//         })
//         .finally(() => setLoading(false));
//     }

//     fetchOrders();
//   }, [refreshKey]);

//   const counts = useMemo(() => {
//     const base = tabCounts(orders);
//     return { ...base, services: bookings.length };
//   }, [orders, bookings.length]);

//   const serviceRows = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const rows = bookings || [];
//     if (!q) return rows;
//     return rows.filter((booking) => {
//       const title = String(
//         booking?.serviceSnapshot?.productName ||
//           booking?.serviceProduct?.productName ||
//           '',
//       ).toLowerCase();
//       return (
//         String(booking?._id || '')
//           .toLowerCase()
//           .includes(q) || title.includes(q)
//       );
//     });
//   }, [bookings, query]);

//   // Build all rows then filter by search query
//   const allLineRows = useMemo(() => buildLineRows(orders, tab), [orders, tab]);

//   const lineRows = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return allLineRows;
//     return allLineRows.filter(({ order, line }) => {
//       const id = String(order._id || '').toLowerCase();
//       const shortId = orderDisplayId(order).toLowerCase();
//       const p = line?.product;
//       const title = String(p?.productName || p?.title || '').toLowerCase();
//       return id.includes(q) || shortId.includes(q) || title.includes(q);
//     });
//   }, [allLineRows, query]);

//   const totalPages = Math.max(1, Math.ceil(lineRows.length / PAGE_SIZE));
//   const safePage = Math.min(page, totalPages);
//   const pageSlice = lineRows.slice(
//     (safePage - 1) * PAGE_SIZE,
//     safePage * PAGE_SIZE,
//   );

//   useEffect(() => {
//     setPage(1);
//   }, [tab, query]);
//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, [page]);

//   // const tabs = [
//   //   { id: 'all', label: 'All', count: counts.all },
//   //   {
//   //     id: 'active_rentals',
//   //     label: 'Active Rentals',
//   //     count: counts.active_rentals,
//   //   },
//   //   { id: 'delivered', label: 'Delivered', count: counts.delivered },
//   //   { id: 'services', label: 'Services', count: counts.services },
//   //   { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
//   // ];
//   // const tabs = [
//   //   // { id: 'all', label: 'All', count: counts.all },
//   //   { id: 'processing', label: 'Processing', count: counts.processing },
//   //   { id: 'dispatched', label: 'Dispatched', count: counts.dispatched },
//   //   { id: 'delivered', label: 'Delivered', count: counts.delivered },
//   //   { id: 'services', label: 'Services', count: counts.services },
//   //   { id: 'completed', label: 'Completed', count: counts.completed },
//   //   { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
//   // ];

//   const tabs = [
//     // { id: 'all', label: 'All', count: counts.all },
//     { id: 'processing', label: 'Processing', count: counts.processing },
//     { id: 'dispatched', label: 'Dispatched', count: counts.dispatched },
//     { id: 'delivered', label: 'Delivered', count: counts.delivered },
//     { id: 'pickup', label: 'Pickup', count: counts.pickup },
//     { id: 'relocate', label: 'Relocate', count: counts.relocate },
//     { id: 'services', label: 'Services', count: counts.services },
//     { id: 'completed', label: 'Completed', count: counts.completed },
//     { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
//   ];

//   const pageNumbers = useMemo(() => {
//     const n = totalPages;
//     if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
//     const cur = safePage;
//     const set = new Set([1, n, cur, cur - 1, cur + 1]);
//     return Array.from(set)
//       .filter((x) => x >= 1 && x <= n)
//       .sort((a, b) => a - b);
//   }, [totalPages, safePage]);

//   return (
//     // <div className="w-full max-w-full overflow-x-hidden -m-4 sm:-m-6 rounded-b-2xl  py-6 px-4 sm:px-6 pb-10">
//     // <div className="w-full max-w-full overflow-x-hidden -m-4 sm:-m-6 rounded-b-2xl py-6 px-4 sm:px-6 pb-10 box-border">
//     //   <div className="w-full min-w-0">
//     <div className="w-full max-w-full overflow-x-hidden">
//       <div className="max-w-6xl mx-auto w-full min-w-0 px-2 pt-1 sm:pt-1.5 pb-10 sm:px-4">
//         <h1 className="text-xl  font-bold text-black tracking-tight">
//           My Orders
//         </h1>

//         <div className="mt-6 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
//           <Search className="w-5 h-5 text-gray-400 shrink-0" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search Item"
//             className="w-full outline-none text-sm text-gray-800 placeholder:text-gray-400"
//           />
//         </div>
//         <div
//           className="mt-4 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-4 px-4 sm:-mx-1 sm:px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
//           style={{ WebkitOverflowScrolling: 'touch' }}
//         >
//           {tabs.map((t) => {
//             const active = tab === t.id;
//             return (
//               <button
//                 key={t.id}
//                 type="button"
//                 onClick={() => setTab(t.id)}
//                 className={`shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
//                   active
//                     ? `${ORANGE} text-white shadow-sm`
//                     : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
//                 }`}
//               >
//                 {t.label}
//                 <span
//                   className={`min-w-[1.5rem] h-6 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold ${
//                     active
//                       ? 'bg-white/20 text-white'
//                       : 'bg-gray-100 text-gray-600'
//                   }`}
//                 >
//                   {t.count}
//                 </span>
//               </button>
//             );
//           })}
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-20">
//             <div className="w-10 h-10 border-4 border-[#FF6F00] border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : error ? (
//           <div className="mt-6 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-4">
//             {error}
//           </div>
//         ) : tab === 'services' ? (
//           serviceRows.length === 0 ? (
//             <div className="mt-10 text-center rounded-xl border border-dashed border-gray-300 bg-white/80 py-14 px-4">
//               <p className="text-gray-700 font-medium">
//                 No service in this view
//               </p>
//               {/* <p className="text-sm text-gray-500 mt-2">
//                 Try another search or filter.
//               </p> */}
//             </div>
//           ) : (
//             <ul className="mt-8 space-y-5">
//               {serviceRows.map((booking) => (
//                 <ServiceBookingCard
//                   key={booking._id}
//                   booking={booking}
//                   onReschedule={(data) =>
//                     setRescheduleModal({ open: true, ...data })
//                   }
//                   // onOpenServiceReview={(payload) =>
//                   //   setServiceReviewModal({
//                   //     open: true,
//                   //     ...payload,
//                   //     existingReview: null,
//                   //   })
//                   // }

//                   onOpenServiceReview={async (payload) => {
//                     if (!payload.serviceProductId) return;
//                     try {
//                       const res = await apiGetMyServiceReview(
//                         String(payload.serviceProductId),
//                       );
//                       setServiceReviewModal({
//                         open: true,
//                         ...payload,
//                         existingReview: res.data?.exists
//                           ? res.data.review
//                           : null,
//                       });
//                     } catch {
//                       setServiceReviewModal({
//                         open: true,
//                         ...payload,
//                         existingReview: null,
//                       });
//                     }
//                   }}
//                   // onCancel={async (id) => {
//                   //   if (!confirm('Cancel this booking?')) return;
//                   //   try {
//                   //     await apiCancelMyBooking(id);
//                   //     const res = await apiGetMyBookings();
//                   //     setBookings(res.data || []);
//                   //   } catch (err) {
//                   //     alert(err?.response?.data?.message || 'Cancel failed');
//                   //   }
//                   // }}
//                   onCancel={(booking) =>
//                     setCancelModal({ open: true, booking })
//                   }
//                   onPaid={async () => {
//                     const res = await apiGetMyBookings();
//                     setBookings(res.data || []);
//                   }}
//                 />
//               ))}
//             </ul>
//           )
//         ) : lineRows.length === 0 ? (
//           <div className="mt-10 text-center py-14">
//             <p className="text-gray-600 font-medium">No orders in this view</p>
//             <p className="text-sm text-gray-500 mt-2">
//               {query
//                 ? 'Try another search or filter.'
//                 : 'Browse rentals and place an order.'}
//             </p>
//           </div>
//         ) : (
//           <>
//             <ul className="mt-8 space-y-5">
//               {pageSlice.map(({ order, line, key, isFirstOfOrder }) => (
//                 <LineCard
//                   key={key}
//                   order={order}
//                   line={line}
//                   isFirstOfOrder={isFirstOfOrder}
//                   onOpenReturnPrompt={(payload) =>
//                     setReturnPrompt({ open: true, ...payload })
//                   }
//                   // onOpenReview={(payload) =>
//                   //   setReviewModal({ open: true, ...payload })
//                   // }
//                   onOpenReview={async (payload) => {
//                     try {
//                       const res = await apiGetMyReview(
//                         payload.productId,
//                         payload.orderId,
//                       );

//                       setReviewModal({
//                         open: true,
//                         ...payload,
//                         existingReview: res.data.exists
//                           ? res.data.review
//                           : null,
//                       });
//                     } catch {
//                       setReviewModal({
//                         open: true,
//                         ...payload,
//                         existingReview: null,
//                       });
//                     }
//                   }}
//                 />
//               ))}
//             </ul>

//             {totalPages > 1 ? (
//               <nav
//                 className="mt-10 flex items-center justify-center gap-4"
//                 aria-label="Pagination"
//               >
//                 <button
//                   type="button"
//                   disabled={safePage <= 1}
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-orange-300 text-orange-600  ${ORANGE1} hover:text-white  disabled:opacity-40 disabled:pointer-events-none`}
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>
//                 <div
//                   className={`min-w-[2.5rem] h-10 px-4 rounded-full text-sm font-semibold flex items-center justify-center ${ORANGE} text-white shadow`}
//                 >
//                   {safePage}
//                 </div>
//                 <button
//                   type="button"
//                   disabled={safePage >= totalPages}
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   className={`w-10 h-10 rounded-full  flex items-center justify-center border-2 border-orange-300 text-orange-600 ${ORANGE1} hover:text-white  disabled:opacity-40 disabled:pointer-events-none`}
//                 >
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </nav>
//             ) : null}
//           </>
//         )}
//         {/* Return prompt modal */}
//         {returnPrompt.open && typeof document !== 'undefined'
//           ? createPortal(
//               <div
//                 className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//                 onClick={() =>
//                   setReturnPrompt((prev) => ({ ...prev, open: false }))
//                 }
//               >
//                 <div
//                   className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <div className="flex items-start justify-between gap-3" />
//                   <div className="mt-4 rounded-xl p-4">
//                     <div className="flex items-center gap-3">
//                       <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
//                         {returnPrompt.image ? (
//                           // eslint-disable-next-line @next/next/no-img-element
//                           <img
//                             src={returnPrompt.image}
//                             alt=""
//                             className="h-full w-full object-cover"
//                           />
//                         ) : null}
//                       </div>
//                       <div>
//                         <p className="font-semibold text-black">
//                           {returnPrompt.title}
//                         </p>
//                         <div className="mt-0.5 inline-flex items-center gap-2">
//                           <p className="text-xs text-[#008236] font-semibold inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5">
//                             Active Rental
//                           </p>
//                           <span className="text-xs text-gray-500">
//                             Order #{returnPrompt.orderRef}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="mt-3 border border-gray-200 bg-[#F9FAFB] rounded-lg p-3 text-sm text-gray-700 space-y-1.5">
//                       <p className="flex justify-between gap-3">
//                         <span>Total:</span>
//                         <span className="font-medium">
//                           ₹{formatMoney(returnPrompt.cycleRent)}
//                           {/* {returnPrompt.cycleUnit === 'day' ? 'day' : 'month'} */}
//                         </span>
//                       </p>
//                       <p className="flex justify-between gap-3">
//                         <span>Started:</span>
//                         <span className="font-medium">
//                           {returnPrompt.startedOn}
//                         </span>
//                       </p>
//                       <p className="flex justify-between gap-3">
//                         <span>{returnPrompt.totalTenureLabel}:</span>
//                         <span className="font-medium">
//                           {returnPrompt.totalTenure}
//                         </span>
//                       </p>
//                       <p className="flex justify-between gap-3">
//                         <span>Cycle Ends:</span>
//                         <span className="font-semibold text-[#F97316]">
//                           {returnPrompt.cycleEnds}
//                         </span>
//                       </p>
//                     </div>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       // my-account?tab=manage-rental-items
//                       // const next = `/my-rentals?openReturn=1&orderId=${encodeURIComponent(returnPrompt.orderId)}&productId=${encodeURIComponent(returnPrompt.productId)}`;
//                       // const next = `/my-account?tab=orders&openReturn=1&orderId=${encodeURIComponent(returnPrompt.orderId)}&productId=${encodeURIComponent(returnPrompt.productId)}`;
//                       // const next = `/?openReturn=1&orderId=${encodeURIComponent(returnPrompt.orderId)}&productId=${encodeURIComponent(returnPrompt.productId)}`;
//                       const next = `/my-account?tab=manage-rental-items`;

//                       setReturnPrompt((prev) => ({ ...prev, open: false }));
//                       router.push(next);
//                     }}
//                     className="mt-5 w-full rounded-xl border border-[#F97316] bg-white py-3 text-sm font-semibold text-[#F97316] hover:bg-orange-50"
//                   >
//                     End Tenancy / Return Item
//                   </button>
//                   <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#64748B] text-center">
//                     <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
//                     <span>
//                       Rent cycle ends on{' '}
//                       <span className="font-semibold text-black">
//                         {returnPrompt.cycleEnds}
//                       </span>
//                       . Schedule your return pickup now.
//                     </span>
//                   </p>
//                 </div>
//               </div>,
//               document.body,
//             )
//           : null}

//         {/* <ReviewModal
//           open={reviewModal.open}
//           productId={reviewModal.productId}
//           orderId={reviewModal.orderId}
//           productName={reviewModal.productName}
//           image={reviewModal.image}
//           existingReview={reviewModal.existingReview}
//           onClose={() =>
//             setReviewModal({
//               open: false,
//               productId: '',
//               orderId: '',
//               productName: '',
//               image: '',
//             })
//           }
//         /> */}

//         {cancelModal.open && cancelModal.booking && (
//           <CancelConfirmModal
//             booking={cancelModal.booking}
//             onClose={() => setCancelModal({ open: false, booking: null })}
//             onConfirm={async () => {
//               try {
//                 await apiCancelMyBooking(cancelModal.booking._id);
//                 const res = await apiGetMyBookings();
//                 setBookings(res.data || []);
//               } catch (err) {
//                 alert(err?.response?.data?.message || 'Cancel failed');
//               } finally {
//                 setCancelModal({ open: false, booking: null });
//               }
//             }}
//           />
//         )}

//         <ReviewModal
//           open={reviewModal.open}
//           productId={reviewModal.productId}
//           orderId={reviewModal.orderId}
//           productName={reviewModal.productName}
//           image={reviewModal.image}
//           existingReview={reviewModal.existingReview}
//           onSuccess={async () => {
//             const res = await apiGetMyOrders();
//             setOrders(res.data); // refresh orders
//           }}
//           onClose={() =>
//             setReviewModal({
//               open: false,
//               productId: '',
//               orderId: '',
//               productName: '',
//               image: '',
//               existingReview: null,
//             })
//           }
//         />

//         <ServiceReviewModal
//           open={serviceReviewModal.open}
//           serviceProductId={serviceReviewModal.serviceProductId}
//           bookingId={serviceReviewModal.bookingId}
//           serviceName={serviceReviewModal.serviceName}
//           image={serviceReviewModal.image}
//           vendorName={serviceReviewModal.vendorName}
//           existingReview={serviceReviewModal.existingReview}
//           onClose={() =>
//             setServiceReviewModal({
//               open: false,
//               serviceProductId: '',
//               bookingId: '',
//               serviceName: '',
//               image: '',
//               vendorName: '',
//               existingReview: null,
//             })
//           }
//           onSuccess={async () => {
//             const res = await apiGetMyBookings();
//             setBookings(res.data || []);
//           }}
//         />
//         {rescheduleModal.open && (
//           <BookingModal
//             isOpen={rescheduleModal.open}
//             product={rescheduleModal.product}
//             existingBooking={rescheduleModal.booking}
//             mode="reschedule"
//             onClose={() =>
//               setRescheduleModal({
//                 open: false,
//                 product: null,
//                 booking: null,
//               })
//             }
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Single line card ─────────────────────────────────────────────────────────

// /**
//  * Renders ONE product line as its own self-contained order card.
//  * The order header (ID, date) is shown on every card so the user
//  * knows which order each item belongs to.
//  */
// // ─── Order Summary Accordion ──────────────────────────────────────────────────
// function OrderSummaryAccordion({ order }) {
//   const [open, setOpen] = useState(false);

//   // const delivery = Number(order.deliveryFee || 0);
//   // const gst = Number(order.gst || 0);
//   // const deposit = Number(order.refundableDeposit || 0);
//   // const care = Number(order.careProtection || 0);
//   // const discount = Number(order.discountAmount || 0);
//   // const total = Number(order.totalAmount || 0);
//   const delivery = Number(order.deliveryFee || 0);
//   const gst = Number(order.gst || 0);
//   const deposit = Number(order.refundableDeposit || 0);
//   const care = Number(order.careProtection || 0);
//   const repairWarranty = Number(order.repairWarranty || 0);
//   const relocationWarranty = Number(order.relocationWarranty || 0);
//   const deliveryPackaging = Number(order.deliveryPackaging || 0);
//   const installationFee = Number(order.installationFee || 0);
//   const platformFee = Number(order.platformFee || 0);
//   const discount = Number(order.discountAmount || 0);
//   const total = Number(order.totalAmount || 0);

//   // Build per-product lines from order.products
//   // const productLines = (order.products || []).map((line) => {
//   //   const p = line?.product;
//   //   const name =
//   //     (p && typeof p === 'object' ? p.productName || p.title : null) ||
//   //     line?.variantName ||
//   //     'Product';
//   //   const unitPrice = Number(line?.pricePerDay || line?.price || 0);
//   //   const qty = Number(line?.quantity || 1);
//   //   const lineTotal = unitPrice * qty;
//   //   const isSell = String(line?.productType || '').toLowerCase() === 'sell';
//   //   return {
//   //     name,
//   //     unitPrice,
//   //     qty,
//   //     lineTotal,
//   //     isSell,
//   //     variantName: line?.variantName || '',
//   //   };
//   // });

//   // Build per-product lines from order.products
//   const productLines = (order.products || []).map((line) => {
//     const p = line?.product;
//     const name =
//       (p && typeof p === 'object' ? p.productName || p.title : null) ||
//       line?.variantName ||
//       'Product';
//     const unitPrice = Number(line?.pricePerDay || line?.price || 0);
//     const qty = Number(line?.quantity || 1);
//     const isSell = String(line?.productType || '').toLowerCase() === 'sell';
//     const lineIsDayRental =
//       !isSell && String(order?.tenureUnit || 'month').toLowerCase() === 'day';
//     // For monthly rentals, unitPrice/pricePerDay stores the FULL tenure
//     // total for this line — show only the per-month price here to match
//     // the order card and payment page (which bill one month at a time).
//     // const lineTotalFull = unitPrice * qty;
//     // const lineTotal =
//     //   !isSell && !lineIsDayRental
//     //     ? Math.round(
//     //         lineTotalFull / Math.max(1, Number(order?.rentalDuration || 1)),
//     //       )
//     //     : lineTotalFull;
//     // pricePerDay already stores the per-month rent for monthly rentals,
//     // so use it directly — don't divide by rentalDuration.
//     const lineTotal = unitPrice * qty;
//     return {
//       name,
//       unitPrice,
//       qty,
//       lineTotal,
//       isSell,
//       isMonthlyRental: !isSell && !lineIsDayRental,
//       variantName: line?.variantName || '',
//     };
//   });

//   const productsSubtotal = productLines.reduce((s, l) => s + l.lineTotal, 0);

//   // Per-product refundable deposits for rental lines
//   const rentalDeposits = (order.products || [])
//     .filter((line) => {
//       const lineType = String(line?.productType || '').toLowerCase();
//       if (lineType === 'sell') return false;
//       const dep = Number(line?.refundableDeposit || 0);
//       return dep > 0;
//     })
//     .map((line) => {
//       const p = line?.product;
//       const name =
//         (p && typeof p === 'object' ? p.productName || p.title : null) ||
//         line?.variantName ||
//         'Product';
//       return {
//         label: `Refundable Deposit — ${name}`,
//         value: Number(line.refundableDeposit),
//       };
//     });

//   // const feeRows = [
//   //   delivery > 0 && { label: 'Delivery Fee', value: delivery, color: '' },
//   //   gst > 0 && { label: 'GST', value: gst, color: '' },
//   //   care > 0 && { label: 'Care & Protection', value: care, color: '' },
//   //   discount > 0 && {
//   //     label: 'Discount',
//   //     value: -discount,
//   //     color: 'text-emerald-600',
//   //   },
//   //   // rental deposits inserted per-product below
//   // ].filter(Boolean);
//   const feeRows = [
//     delivery > 0 && { label: 'Delivery Fee', value: delivery, color: '' },
//     gst > 0 && { label: 'GST', value: gst, color: '' },
//     care > 0 && { label: 'Care & Protection', value: care, color: '' },
//     repairWarranty > 0 && {
//       label: 'Repair & Warranty',
//       value: repairWarranty,
//       color: '',
//     },
//     relocationWarranty > 0 && {
//       label: 'Relocation Warranty',
//       value: relocationWarranty,
//       color: '',
//     },
//     deliveryPackaging > 0 && {
//       label: 'Delivery & Packaging',
//       value: deliveryPackaging,
//       color: '',
//     },
//     installationFee > 0 && {
//       label: 'Installation Fee',
//       value: installationFee,
//       color: '',
//     },
//     platformFee > 0 && {
//       label: 'Platform Fee',
//       value: platformFee,
//       color: '',
//     },
//     discount > 0 && {
//       label: 'Discount',
//       value: -discount,
//       color: 'text-emerald-600',
//     },
//     // rental deposits inserted per-product below
//   ].filter(Boolean);

//   return (
//     <div className="border-t border-gray-100 mx-4 mb-4">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className="w-full flex items-center justify-between py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
//       >
//         <span className="flex items-center gap-1.5">
//           <svg
//             className="w-4 h-4 text-gray-400"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth={2}
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M9 14l-4-4 4-4M5 10h14M15 14l4-4-4-4"
//             />
//           </svg>
//           Order Summary
//           {productLines.length > 1 && (
//             <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
//               {productLines.length} items
//             </span>
//           )}
//         </span>
//         <svg
//           className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//           strokeWidth={2}
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </button>

//       {open && (
//         <div className="pb-3 space-y-1 text-sm">
//           {/* ── Products breakdown ── */}
//           {productLines.length > 0 && (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 space-y-1.5">
//               {productLines.map((line, i) => (
//                 <div key={i} className="flex justify-between items-start gap-2">
//                   <span className="text-gray-600 leading-snug flex-1 min-w-0">
//                     <span className="flex items-center gap-1.5">
//                       <span className="font-medium text-gray-800">
//                         {line.name}
//                       </span>
//                       <span
//                         className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white shrink-0 ${
//                           line.isSell ? 'bg-blue-500' : 'bg-orange-500'
//                         }`}
//                       >
//                         {line.isSell ? 'Buy' : 'Rent'}
//                       </span>
//                     </span>
//                     {(line.variantName || line.qty > 1) && (
//                       <span className="flex items-center gap-1.5 mt-0.5 flex-wrap">
//                         {line.variantName && (
//                           <span className="text-[11px] text-gray-400 border border-gray-200 bg-gray-50 px-1.5 py-0.5 rounded-full">
//                             {line.variantName}
//                           </span>
//                         )}
//                         {line.qty > 1 && (
//                           <span className="text-[11px] text-gray-400">
//                             × {line.qty}
//                           </span>
//                         )}
//                       </span>
//                     )}
//                   </span>
//                   {/* <span className="font-semibold text-gray-800 shrink-0">
//                     ₹{formatMoney(line.lineTotal)}
//                   </span>
//                 </div>
//               ))} */}
//                   {/* <span className="font-semibold text-gray-800 shrink-0">
//                     ₹{formatMoney(line.lineTotal)}
//                     {line.isMonthlyRental ? (
//                       <span className="text-[10px] font-medium text-gray-400 ml-0.5">
//                         /mo
//                       </span>
//                     ) : null}
//                   </span> */}
//                   <span className="font-semibold text-gray-800 shrink-0">
//                     ₹{formatMoney(line.lineTotal)}
//                     <span className="text-[10px] font-medium text-gray-400 ml-0.5">
//                       {line.isMonthlyRental ? '/mo' : '/-'}
//                     </span>
//                   </span>
//                 </div>
//               ))}

//               {/* Products subtotal — only show if there are fees below */}
//               {feeRows.length > 0 && (
//                 <div className="flex justify-between items-center pt-1.5 mt-1 border-t border-gray-200">
//                   <span className="text-gray-500">Products Total</span>
//                   <span className="font-semibold text-gray-800">
//                     ₹{formatMoney(productsSubtotal)}/-
//                   </span>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── Fee rows ── */}
//           {/* {feeRows.map(({ label, value, color }) => (
//             <div key={label} className="flex justify-between items-center">
//               <span className="text-gray-500">{label}</span>
//               <span className={`font-semibold ${color || 'text-gray-800'}`}>
//                 {value < 0 ? '− ' : ''}₹{formatMoney(Math.abs(value))}
//               </span>
//             </div>
//           ))} */}
//           {feeRows.map(({ label, value, color }) => (
//             <div key={label} className="flex justify-between items-center">
//               <span className="text-gray-500">{label}</span>
//               <span className={`font-semibold ${color || 'text-gray-800'}`}>
//                 {value < 0 ? '− ' : ''}₹{formatMoney(Math.abs(value))}/-
//               </span>
//             </div>
//           ))}
//           {/* ── Per-product refundable deposits ── */}
//           {rentalDeposits.length > 0 && (
//             <div className="mt-1">
//               <p className="text-gray-500  mb-1">Refundable Deposit</p>
//               <div className="space-y-1.5 pl-2 border-l-2 border-blue-100">
//                 {rentalDeposits.map(({ label, value }, i) => (
//                   <div
//                     key={i}
//                     className="flex justify-between items-center gap-2"
//                   >
//                     <span className="flex flex-col min-w-0">
//                       <span className="text-xs text-blue-600 truncate">
//                         {label.replace('Refundable Deposit — ', '')}
//                       </span>
//                     </span>
//                     {/* <span className="font-semibold text-blue-600 shrink-0">
//                       ₹{formatMoney(value)}
//                     </span> */}
//                     <span className="font-semibold text-blue-600 shrink-0">
//                       ₹{formatMoney(value)}/-
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//           {/* ── Grand total ── */}
//           <div className="pt-2 mt-1 border-t border-gray-200 flex justify-between items-center">
//             <span className="font-bold text-black">Total Paid</span>
//             {/* <span className="font-bold text-[#FF6F00] text-base">
//               ₹{formatMoney(total)}
//             </span> */}
//             <span className="font-bold text-[#FF6F00] text-base">
//               ₹{formatMoney(total)}/-
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// function LineCard({ order, line, onOpenReturnPrompt, onOpenReview }) {
//   const router = useRouter();
//   const meta = classifyOrderLine(order, line);
//   const oid = orderDisplayId(order);
//   const placed = formatOrderDate(order.createdAt);

//   // Product info from this line
//   // const p =
//   //   line?.product && typeof line.product === 'object' ? line.product : null;
//   // const img = productImageUrl(p?.image || '');
//   // const title = p?.productName || p?.title || 'Item';

//   const p =
//     line?.product && typeof line.product === 'object' ? line.product : null;
//   // resolve variant-specific image and name
//   const variantName = line?.variantName || '';
//   const variantImg = (() => {
//     if (!variantName || !p) return null;
//     // Find the matching variant in product.variants by variantId or variantName
//     const variants = Array.isArray(p?.variants) ? p.variants : [];
//     const matchedVariant = variants.find(
//       (v) =>
//         String(v?._id || '') === String(line?.variantId || '') ||
//         String(v?.variantName || '') === variantName,
//     );
//     if (!matchedVariant) return null;
//     // Variant-specific image: find index of this variant and slice product images
//     const variantIdx = variants.indexOf(matchedVariant);
//     const allImgs = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
//     if (allImgs.length > 1 && variants.length > 1) {
//       const perVariant = Math.ceil(allImgs.length / variants.length);
//       const start = variantIdx * perVariant;
//       const slice = allImgs.slice(start, start + perVariant);
//       return slice[0] || null;
//     }
//     return null;
//   })();

//   const img = productImageUrl(variantImg || p?.image || ''); //  variant image first
//   const title = p?.productName || p?.title || 'Item';
//   const detailHref = getProductDetailHref(order, line);

//   const isSell = line ? lineIsPurchase(line) : false;
//   const qty = Number(line?.quantity || 1);
//   // const linePrice = line ? Number(line.pricePerDay || 0) : 0;
//   const linePrice = line
//     ? Number(line.pricePerDay || 0) * Number(line.quantity || 1)
//     : 0;
//   const unit = meta.unit;
//   const priceSuffix = '';

//   // Per-line rent for active rentals
//   const lineRent = line ? Number(line.pricePerDay || 0) : 0;

//   // Must be defined before any early returns (used in cancelled card too)
//   const procLabel =
//     normalizeStatus(line?.lineStatus || order.status) === 'confirmed'
//       ? 'Confirmed'
//       : 'Processing';

//   // console.log('ORDER FIELDS:', {
//   //   totalAmount: order?.totalAmount,
//   //   grandTotal: order?.grandTotal,
//   //   total: order?.total,
//   //   paidAmount: order?.paidAmount,
//   //   orderTotal: order?.orderTotal,
//   //   allKeys: Object.keys(order || {}),
//   // });
//   // const orderTotal = Number(order?.totalAmount ?? order?.grandTotal ?? 0);
//   // const displayPrice = orderTotal > 0 ? orderTotal : linePrice;
//   // Sum price from line items since order has no top-level price field
//   // const lineTotal = (() => {
//   //   if (line) {
//   //     const qty = Number(line.quantity || 1);
//   //     const unitPrice = Number(
//   //       line.pricePerDay || line.price || line.unitPrice || 0,
//   //     );
//   //     return unitPrice * qty;
//   //   }
//   //   return 0;
//   // })();

//   // const orderTotal = Number(
//   //   order?.totalAmount ??
//   //     order?.grandTotal ??
//   //     order?.total ??
//   //     order?.paidAmount ??
//   //     0,
//   // );
//   // // const displayPrice =
//   // //   orderTotal > 0 ? orderTotal : lineTotal > 0 ? lineTotal : linePrice;
//   // const displayPrice =
//   //   Number(order?.totalAmount || 0) > 0
//   //     ? Number(order.totalAmount)
//   //     : Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
//   // Per-product price only — never show order-level total on a line card.
//   // The order total (including delivery, GST, deposit) belongs in an
//   // order-summary view, not repeated on every product card.
//   // const displayPrice =
//   //   Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
//   // const displayPrice =
//   //   Number(order?.totalAmount || 0) > 0
//   //     ? Number(order.totalAmount)
//   //     : Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
//   const displayPrice =
//     orderProductOnlyTotal(order) > 0
//       ? orderProductOnlyTotal(order)
//       : Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);

//   // For active monthly rentals, the stored line price is the FULL tenure
//   // total (e.g. ₹450 for a 3-month tenure at ₹150/month). The active
//   // rental card should show only the per-month price, matching what the
//   // payment page charges per cycle. This is scoped to this variable only
//   // — displayPrice itself is untouched so every other card (delivered,
//   // completed, shipped, processing, cancelled) keeps showing the same
//   // value as before.
//   // const rentalMonthlyPrice =
//   //   !isSell && unit !== 'day'
//   //     ? Math.round(
//   //         displayPrice / Math.max(1, Number(order.rentalDuration || 1)),
//   //       )
//   //     : displayPrice;
//   const rentalMonthlyPrice = displayPrice;

//   const [hasReview, setHasReview] = useState(false);
//   const [reviewChecked, setReviewChecked] = useState(false);

//   useEffect(() => {
//     if (meta.kind !== 'delivered_purchase') return;
//     if (!p?._id || !order._id) return;

//     apiGetMyReview(String(p._id), String(order._id))
//       .then((res) => {
//         setHasReview(res.data?.exists === true);
//       })
//       .catch(() => setHasReview(false))
//       .finally(() => setReviewChecked(true));
//   }, [meta.kind, p?._id, order._id]);

//   // ── helpers for specific card kinds ──

//   if (
//     !p &&
//     meta.kind !== 'cancelled' &&
//     meta.kind !== 'pickup_scheduled' &&
//     meta.kind !== 'relocation_requested'
//   ) {
//     return (
//       <li className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
//         <p className="font-bold text-black">Order #{oid}</p>
//         <p className="text-sm text-gray-500 mt-1">
//           Product details unavailable
//         </p>
//       </li>
//     );
//   }

//   // ── cancelled ──────────────────────────────────────────────────────────────
//   // if (meta.kind === 'cancelled') {
//   //   const rrLine = line ?? orderReturnLine(order);
//   //   const rr = rrLine?.returnRequest;
//   //   const hasReturnTracking = Boolean(rr?.requestedAt);
//   //   const refundShown = hasReturnTracking
//   //     ? lineRefundableDeposit(rrLine)
//   //     : linePrice;
//   // ── relocation requested (rental) ──────────────────────────────────────────
//   // if (meta.kind === 'relocation_requested') {
//   //   const rl = line?.relocationRequest;
//   //   const newAddr = rl?.newAddress || {};
//   //   const oldAddr = rl?.oldAddressSnapshot || {
//   //     name: order.name,
//   //     address: order.address,
//   //     phone: order.phone,
//   //   };
//   //   const isRelocationConfirmed = String(rl?.status || '') === 'confirmed';
//   //   return (
//   //     <li className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
//   //       <CardHeader oid={oid} placed={placed} isSell={isSell}>
//   //         {isRelocationConfirmed ? (
//   //           <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//   //             <CheckCircle2 className="w-3.5 h-3.5" />
//   //             Confirmed
//   //           </span>
//   //         ) : (
//   //           <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
//   //             <MapPin className="w-3.5 h-3.5" />
//   //             Requested
//   //           </span>
//   //         )}
//   //       </CardHeader>

//   //       <div className="p-4 flex flex-col lg:flex-row lg:items-start gap-4">
//   //         <div className="lg:flex-1 lg:min-w-0">
//   //           <LineRow
//   //             img={img}
//   //             title={title}
//   //             qty={qty}
//   //             isSell={isSell}
//   //             price={rentalMonthlyPrice}
//   //             priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
//   //             variantName={variantName}
//   //             href={detailHref}
//   //           />
//   //         </div>

//   //         <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm lg:w-[480px] lg:shrink-0">
//   //           <div className="sm:border-r sm:border-gray-200 sm:pr-3">
//   //             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//   //               {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
//   //             </p>

//   //             <p className="text-gray-500 text-xs mt-0.5">
//   //               {oldAddr?.address || '-'}
//   //             </p>
//   //             {oldAddr?.phone ? (
//   //               <p className="text-gray-500 text-xs mt-0.5">
//   //                 Phone: {oldAddr.phone}
//   //               </p>
//   //             ) : null}
//   //           </div>
//   //           <div className="border-t border-gray-200 pt-3 sm:border-t-0 sm:pt-0">
//   //             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//   //               New Address
//   //             </p>
//   //             {/* <p className="font-medium text-gray-800 mt-0.5">
//   //               {newAddr?.label || '-'}
//   //             </p> */}
//   //             <p className="text-gray-500 text-xs mt-0.5">
//   //               {[newAddr?.addressLine, newAddr?.area, newAddr?.pincode]
//   //                 .filter(Boolean)
//   //                 .join(', ')}
//   //             </p>
//   //             {newAddr?.phone ? (
//   //               <p className="text-gray-500 text-xs mt-0.5">
//   //                 Phone: {newAddr.phone}
//   //               </p>
//   //             ) : null}
//   //           </div>
//   //         </div>
//   //       </div>
//   //       <OrderSummaryAccordion order={order} />
//   //     </li>
//   //   );
//   // }

//   if (meta.kind === 'relocation_requested') {
//     const rl = line?.relocationRequest;
//     const newAddr = rl?.newAddress || {};
//     const oldAddr = rl?.oldAddressSnapshot || {
//       name: order.name,
//       address: order.address,
//       phone: order.phone,
//     };
//     const isRelocationConfirmed = String(rl?.status || '') === 'confirmed';
//     const relocateTrackHref = `/orders/${String(order._id)}/track-relocate?lineIdx=${orderProductLines(
//       order,
//     ).indexOf(line)}`;
//     return (
//       <li
//         className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden cursor-pointer"
//         onClick={(e) => {
//           if (e.target.closest('button') || e.target.closest('a')) return;
//           router.push(relocateTrackHref);
//         }}
//       >
//         {/* Mobile — unchanged original layout */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Placed on: {placed}
//               </p>
//             </div>
//             <div className="shrink-0">
//               {isRelocationConfirmed ? (
//                 <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                   Confirmed
//                 </span>
//               ) : (
//                 <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
//                   <MapPin className="w-3.5 h-3.5" />
//                   Requested
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="p-4 flex flex-col gap-4">
//             <div className="flex gap-4">
//               <div className="relative shrink-0 w-20 h-20">
//                 <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                   {img ? (
//                     <img
//                       src={img}
//                       alt=""
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-400">
//                       <Package className="w-8 h-8" />
//                     </div>
//                   )}
//                 </div>
//                 <span
//                   className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                     isSell ? 'bg-blue-600' : 'bg-orange-500'
//                   }`}
//                 >
//                   {isSell ? 'Buy' : 'Rent'}
//                 </span>
//               </div>
//               <div className="min-w-0 flex-1">
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Relocation Cost:{' '}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>₹0/-</span>
//                 </p>
//               </div>
//             </div>

//             {/* <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 grid grid-cols-1 gap-3 text-sm">
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {oldAddr?.address || '-'}
//                 </p>
//                 {oldAddr?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {oldAddr.phone}
//                   </p>
//                 ) : null}
//               </div>
//               <div className="border-t border-gray-200 pt-3">
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   New Address
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {[newAddr?.addressLine, newAddr?.area, newAddr?.pincode]
//                     .filter(Boolean)
//                     .join(', ')}
//                 </p>
//                 {newAddr?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {newAddr.phone}
//                   </p>
//                 ) : null}
//               </div>
//             </div> */}
//           </div>
//         </div>

//         {/* Desktop — redesigned layout (same as Processing/Completed/Cancelled) */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>

//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Placed On:{' '}
//                     <span className="font-semibold text-black">{placed}</span>
//                   </p>
//                 </div>
//                 {isRelocationConfirmed ? (
//                   <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//                     <CheckCircle2 className="w-3.5 h-3.5" />
//                     Confirmed
//                   </span>
//                 ) : (
//                   <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
//                     <MapPin className="w-3.5 h-3.5" />
//                     Requested
//                   </span>
//                 )}
//               </div>

//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Relocation Cost:{' '}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>₹0/-</span>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* <div className="px-4 pb-4 pl-4 sm:pl-36 -mt-6">
//             <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 grid grid-cols-2 gap-3 text-sm">
//               <div className="border-r border-gray-200 pr-3">
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {oldAddr?.address || '-'}
//                 </p>
//                 {oldAddr?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {oldAddr.phone}
//                   </p>
//                 ) : null}
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                   New Address
//                 </p>
//                 <p className="text-gray-500 text-xs mt-0.5">
//                   {[newAddr?.addressLine, newAddr?.area, newAddr?.pincode]
//                     .filter(Boolean)
//                     .join(', ')}
//                 </p>
//                 {newAddr?.phone ? (
//                   <p className="text-gray-500 text-xs mt-0.5">
//                     Phone: {newAddr.phone}
//                   </p>
//                 ) : null}
//               </div>
//             </div>
//           </div> */}
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   }

//   // ── pickup scheduled / return requested (rental) ──────────────────────────
//   // if (meta.kind === 'pickup_scheduled') {
//   //   const rr = line?.returnRequest;
//   //   const pickupScheduled = Boolean(rr?.pickupScheduledAt);
//   //   return (
//   //     <li className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
//   //       <CardHeader oid={oid} placed={placed} isSell={isSell}>
//   //         <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
//   //           <Package className="w-3.5 h-3.5" />
//   //           {pickupScheduled ? 'Scheduled' : 'Requested'}
//   //         </span>
//   //       </CardHeader>

//   //       <div className="p-4">
//   //         <LineRow
//   //           img={img}
//   //           title={title}
//   //           qty={qty}
//   //           isSell={isSell}
//   //           price={rentalMonthlyPrice}
//   //           priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
//   //           variantName={variantName}
//   //           href={detailHref}
//   //         />
//   //       </div>

//   //       <div className="px-4 pb-2">
//   //         <p className="text-sm text-gray-600 flex items-start gap-2">
//   //           <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
//   //           <span>
//   //             {pickupScheduled
//   //               ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
//   //               : "We've received your return request — our team will schedule a pickup soon."}
//   //           </span>
//   //         </p>
//   //       </div>

//   //       <div className="px-4 pb-3 flex justify-start">
//   //         <Link
//   //           href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//   //           className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
//   //         >
//   //           View Return Status
//   //           <ExternalLink className="w-3.5 h-3.5" />
//   //         </Link>
//   //       </div>
//   //       <OrderSummaryAccordion order={order} />
//   //     </li>
//   //   );
//   // }

//   if (meta.kind === 'pickup_scheduled') {
//     const rr = line?.returnRequest;
//     const pickupScheduled = Boolean(rr?.pickupScheduledAt);
//     const pickupTrackHref = `/orders/${String(order._id)}/track-pickup?lineIdx=${orderProductLines(
//       order,
//     ).indexOf(line)}`;
//     return (
//       <li
//         className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden cursor-pointer"
//         onClick={(e) => {
//           if (e.target.closest('button') || e.target.closest('a')) return;
//           router.push(pickupTrackHref);
//         }}
//       >
//         {/* Mobile — unchanged original layout */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             {/* <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Placed on: {placed}
//               </p>
//             </div>
//             <div className="shrink-0">
//               <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
//                 <Package className="w-3.5 h-3.5" />
//                 {pickupScheduled ? 'Scheduled' : 'Requested'}
//               </span>
//             </div> */}
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Pickup Date: {formatOrderDate(rr?.requestedAt)}
//               </p>
//             </div>
//             <div className="shrink-0">
//               <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
//                 <Package className="w-3.5 h-3.5" />
//                 {pickupScheduled ? 'Scheduled' : 'Requested'}
//               </span>
//             </div>
//           </div>

//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>
//             {/* <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>

//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//             </div>
//           </div>

//           <div className="px-4 pb-1 -mt-4">
//             <p className="text-sm text-gray-600 flex items-start gap-2">
//               <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
//               <span>
//                 {pickupScheduled
//                   ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
//                   : "We've received your return request — our team will schedule a pickup soon."}
//               </span>
//             </p>
//           </div>

//           <div className="px-4 pb-3 -mt-1 flex justify-start">
//             <Link
//               href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//               className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
//             >
//               View Return Status
//               <ExternalLink className="w-3.5 h-3.5" />
//             </Link>
//           </div>
//         </div> */}
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>

//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//               <p className="text-sm text-gray-600 flex items-start gap-2 mt-1.5">
//                 {/* <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" /> */}
//                 <span>
//                   {pickupScheduled
//                     ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
//                     : "We've received your return request — our team will schedule a pickup soon."}
//                 </span>
//               </p>
//               <Link
//                 href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//                 className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black mt-1.5"
//               >
//                 View Return Status
//                 <ExternalLink className="w-3.5 h-3.5" />
//               </Link>
//             </div>
//           </div>
//         </div>
//         {/* Desktop — redesigned layout */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>

//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 {/* <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Placed On:{' '}
//                     <span className="font-semibold text-black">{placed}</span>
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
//                   <Package className="w-3.5 h-3.5" />
//                   {pickupScheduled ? 'Scheduled' : 'Requested'}
//                 </span> */}
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Pickup Date:{' '}
//                     <span className="font-semibold text-black">
//                       {formatOrderDate(rr?.requestedAt)}
//                     </span>
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
//                   <Package className="w-3.5 h-3.5" />
//                   {pickupScheduled ? 'Scheduled' : 'Requested'}
//                 </span>
//               </div>

//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {/* {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Order Value:{' '}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /month
//                       </span>
//                     ) : null}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-6 flex flex-wrap items-center justify-between gap-2">
//             <p className="text-sm text-gray-600 flex items-center gap-1.5">
//               <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-500" />
//               <span>
//                 {pickupScheduled
//                   ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
//                   : "We've received your return request — our team will schedule a pickup soon."}
//               </span>
//             </p>
//             <Link
//               href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//               className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
//             >
//               View Return Status
//               <ExternalLink className="w-3.5 h-3.5" />
//             </Link>
//           </div>
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   } */}

//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//               </div>
//             </div>
//           </div>

//           <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-12 flex flex-wrap items-center justify-between gap-2">
//             <p className="text-sm text-gray-600 flex items-center gap-1.5">
//               {/* <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-500" /> */}
//               <span>
//                 {pickupScheduled
//                   ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
//                   : "We've received your return request — our team will schedule a pickup soon."}
//               </span>
//             </p>
//             <Link
//               href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//               className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
//             >
//               View Return Status
//               <ExternalLink className="w-3.5 h-3.5" />
//             </Link>
//           </div>
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   }

//   // if (meta.kind === 'cancelled') {

//   // if (meta.kind === 'cancelled') {
//   //   const rrLine = line ?? orderReturnLine(order);
//   //   const rr = rrLine?.returnRequest;
//   //   const hasReturnTracking = Boolean(rr?.requestedAt);
//   //   console.log('=== DEBUG hasReturnTracking ===', hasReturnTracking);
//   //   console.log('=== DEBUG rr.requestedAt ===', rr?.requestedAt);
//   //   console.log(
//   //     '=== DEBUG rrLine.refundBreakdown ===',
//   //     rrLine?.refundBreakdown,
//   //   );
//   //   console.log(
//   //     '=== DEBUG rrLine.refundableDeposit ===',
//   //     rrLine?.refundableDeposit,
//   //   );
//   //   console.log('=== DEBUG rrLine full ===', rrLine);
//   //   const refundShown = hasReturnTracking
//   //     ? lineRefundableDeposit(rrLine)
//   //     : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);
//   //   const cancelledDetailDate = hasReturnTracking
//   //     ? formatOrderDate(rr.requestedAt)
//   //     : placed;
//   //   return (
//   //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//   //       <CardHeader oid={oid} placed={placed} isSell={isSell}>
//   //         <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
//   //           <XCircle className="w-3.5 h-3.5" />
//   //           Cancelled
//   //         </span>
//   //       </CardHeader>

//   //       <div className="p-4">
//   //         <LineRow
//   //           img={img}
//   //           title={title}
//   //           qty={qty}
//   //           isSell={isSell}
//   //           price={rentalMonthlyPrice}
//   //           // priceSuffix={priceSuffix}
//   //           priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
//   //           variantName={variantName}
//   //           href={detailHref}
//   //         />
//   //       </div>

//   //       <div className="px-4 pb-2">
//   //         <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
//   //           <CheckCircle2 className="w-4 h-4 shrink-0" />
//   //           Refund Processed: ₹{formatMoney(refundShown)} to Source
//   //         </p>
//   //         <p className="text-xs text-gray-500 mt-1">
//   //           {hasReturnTracking
//   //             ? `Cancelled by you on ${cancelledDetailDate}`
//   //             : rrLine?.cancelledBy === 'vendor'
//   //               ? `Cancelled by vendor on ${cancelledDetailDate}`
//   //               : `Cancelled on ${cancelledDetailDate}`}
//   //         </p>
//   //         {rrLine?.cancelledBy === 'vendor' && rrLine?.cancelReason ? (
//   //           <p className="text-xs text-gray-500 mt-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
//   //             <span className="font-medium text-gray-700">Reason:</span>{' '}
//   //             {rrLine.cancelReason}
//   //           </p>
//   //         ) : null}
//   //       </div>
//   //       <div className="px-4 pb-3 flex justify-start">
//   //         {hasReturnTracking ? (
//   //           <Link
//   //             href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//   //             className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
//   //           >
//   //             View Refund Details
//   //             <ExternalLink className="w-3.5 h-3.5" />
//   //           </Link>
//   //         ) : (
//   //           <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 cursor-not-allowed">
//   //             View Refund Details
//   //             <ExternalLink className="w-3.5 h-3.5" />
//   //           </span>
//   //         )}
//   //       </div>
//   //       <OrderSummaryAccordion order={order} />
//   //     </li>
//   //   );
//   // }

//   // if (meta.kind === 'cancelled') {
//   //   const rrLine = line ?? orderReturnLine(order);
//   //   const rr = rrLine?.returnRequest;
//   //   const hasReturnTracking = Boolean(rr?.requestedAt);
//   //   const refundShown = hasReturnTracking
//   //     ? lineRefundableDeposit(rrLine)
//   //     : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);
//   //   const cancelledDetailDate = hasReturnTracking
//   //     ? formatOrderDate(rr.requestedAt)
//   //     : placed;
//   //   const cancelledTrackHref = `/orders/${String(order._id)}/track-cancelled?lineIdx=${orderProductLines(
//   //     order,
//   //   ).indexOf(line)}`;

//   if (meta.kind === 'cancelled') {
//     const rrLine = line ?? orderReturnLine(order);
//     const rr = rrLine?.returnRequest;
//     const hasReturnTracking = Boolean(rr?.requestedAt);

//     // Recompute the refund the same way the pre-cancel confirmation
//     // screen does (product price − cancellation fee + deposit),
//     // instead of trusting a stored total that may not have the fee
//     // deducted from it.
//     // const cancelFeeShown = Number(
//     //   rrLine?.refundBreakdown?.feeAmount ??
//     //     rrLine?.refundBreakdown?.cancellationFee ??
//     //     rrLine?.refundBreakdown?.fee ??
//     //     0,
//     // );
//     // const depositShown = lineRefundableDeposit(rrLine);
//     // const computedRefund =
//     //   Math.max(0, linePrice - cancelFeeShown) + depositShown;

//     // const refundShown = hasReturnTracking
//     //   ? depositShown
//     //   : rrLine?.refundBreakdown?.feeAmount !== undefined ||
//     //       rrLine?.refundBreakdown?.cancellationFee !== undefined ||
//     //       rrLine?.refundBreakdown?.fee !== undefined
//     //     ? computedRefund
//     //     : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);

//     const cancelFeeShown = Number(
//       rrLine?.refundBreakdown?.feeAmount ??
//         rrLine?.refundBreakdown?.cancellationFee ??
//         rrLine?.refundBreakdown?.fee ??
//         0,
//     );
//     const depositShown = lineRefundableDeposit(rrLine);
//     // Other taxes/fees — same order-level fields used on the track page,
//     // excluding the refundable deposit (handled separately above).
//     const taxShown =
//       Number(order.gst || 0) +
//       Number(order.careProtection || 0) +
//       Number(order.repairWarranty || 0) +
//       Number(order.relocationWarranty || 0) +
//       Number(order.deliveryPackaging || 0) +
//       Number(order.installationFee || 0) +
//       Number(order.platformFee || 0) +
//       Number(order.deliveryFee || 0);
//     const computedRefund =
//       Math.max(0, linePrice - cancelFeeShown) + depositShown + taxShown;

//     const refundShown = hasReturnTracking
//       ? depositShown
//       : rrLine?.refundBreakdown?.feeAmount !== undefined ||
//           rrLine?.refundBreakdown?.cancellationFee !== undefined ||
//           rrLine?.refundBreakdown?.fee !== undefined
//         ? computedRefund
//         : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);

//     const cancelledDetailDate = hasReturnTracking
//       ? formatOrderDate(rr.requestedAt)
//       : placed;
//     const cancelledTrackHref = `/orders/${String(order._id)}/track-cancelled?lineIdx=${orderProductLines(
//       order,
//     ).indexOf(line)}`;
//     return (
//       <li
//         className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
//         onClick={(e) => {
//           if (e.target.closest('button') || e.target.closest('a')) return;
//           router.push(cancelledTrackHref);
//         }}
//       >
//         {/* Mobile — unchanged original layout */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Placed on: {placed}
//               </p>
//             </div>
//             <div className="shrink-0">
//               <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
//                 <XCircle className="w-3.5 h-3.5" />
//                 Cancelled
//               </span>
//             </div>
//           </div>

//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>
//               {/* {variantName ? (
//                 <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                   {variantName}
//                 </span>
//               ) : null} */}
//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}
//                   {!isSell && unit !== 'day' ? (
//                     <span className="text-xs font-medium text-gray-500 ml-1">
//                       /-
//                     </span>
//                   ) : null}
//                 </span> */}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}/-
//                 </span>
//               </p>
//             </div>
//           </div>

//           <div className="px-4 pb-2">
//             <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
//               <CheckCircle2 className="w-4 h-4 shrink-0" />
//               Refund Processed: ₹{formatMoney(refundShown)} to Source
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//               {hasReturnTracking
//                 ? `Cancelled by you on ${cancelledDetailDate}`
//                 : rrLine?.cancelledBy === 'vendor'
//                   ? `Cancelled by vendor on ${cancelledDetailDate}`
//                   : `Cancelled on ${cancelledDetailDate}`}
//             </p>
//             {rrLine?.cancelledBy === 'vendor' && rrLine?.cancelReason ? (
//               <p className="text-xs text-gray-500 mt-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
//                 <span className="font-medium text-gray-700">Reason:</span>{' '}
//                 {rrLine.cancelReason}
//               </p>
//             ) : null}
//           </div>
//           <div className="px-4 pb-3 flex justify-start">
//             {hasReturnTracking ? (
//               <Link
//                 href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//                 className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
//               >
//                 View Refund Details
//                 <ExternalLink className="w-3.5 h-3.5" />
//               </Link>
//             ) : (
//               <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 cursor-not-allowed">
//                 View Refund Details
//                 <ExternalLink className="w-3.5 h-3.5" />
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Desktop — redesigned layout (same as Processing/Completed) */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>

//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Placed On:{' '}
//                     <span className="font-semibold text-black">{placed}</span>
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
//                   <XCircle className="w-3.5 h-3.5" />
//                   Cancelled
//                 </span>
//               </div>

//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Order Value:{' '}
//                   {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /-
//                       </span>
//                     ) : null}
//                   </span> */}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}/-
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-6">
//             <p className="text-sm flex items-center justify-between gap-2 flex-wrap">
//               <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
//                 <CheckCircle2 className="w-4 h-4 shrink-0" />
//                 Refund Processed: ₹{formatMoney(refundShown)} to Source
//               </span>
//               {hasReturnTracking ? (
//                 <Link
//                   href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
//                   className="shrink-0 inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-black"
//                 >
//                   View Refund Details
//                   <ExternalLink className="w-3.5 h-3.5" />
//                 </Link>
//               ) : (
//                 <span className="shrink-0 inline-flex items-center gap-1.5 font-medium text-gray-400 cursor-not-allowed">
//                   View Refund Details
//                   <ExternalLink className="w-3.5 h-3.5" />
//                 </span>
//               )}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//               {hasReturnTracking
//                 ? `Cancelled by you on ${cancelledDetailDate}`
//                 : rrLine?.cancelledBy === 'vendor'
//                   ? `Cancelled by vendor on ${cancelledDetailDate}`
//                   : `Cancelled on ${cancelledDetailDate}`}
//             </p>
//             {rrLine?.cancelledBy === 'vendor' && rrLine?.cancelReason ? (
//               <p className="text-xs text-gray-500 mt-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
//                 <span className="font-medium text-gray-700">Reason:</span>{' '}
//                 {rrLine.cancelReason}
//               </p>
//             ) : null}
//           </div>
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   }
//   // ── delivered / completed purchase ────────────────────────────────────────
//   // if (meta.kind === 'delivered_purchase') {
//   //   const phase = meta.purchasePhase || 'delivered';
//   //   const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
//   //   const headerDateLabel =
//   //     phase === 'completed'
//   //       ? `Completed on: ${milestoneDate}`
//   //       : `Delivered on: ${milestoneDate}`;
//   //   const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';

//   //   return (
//   //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//   //       <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//   //         <div>
//   //           <p className="font-bold text-black">Order #{oid}</p>
//   //           <p className="text-sm text-gray-500 mt-0.5">{headerDateLabel}</p>
//   //         </div>
//   //         <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//   //           <CheckCircle2 className="w-3.5 h-3.5" />
//   //           {badgeLabel}
//   //         </span>
//   //       </div>
//   //       <div className="p-4">
//   //         <LineRow
//   //           img={img}
//   //           title={title}
//   //           qty={qty}
//   //           isSell={isSell}
//   //           price={linePrice}
//   //           priceSuffix={priceSuffix}
//   //         />
//   //       </div>
//   //       <div className="px-4 pb-2">
//   //         <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
//   //           <CheckCircle2 className="w-4 h-4 shrink-0" />
//   //           {phase === 'completed'
//   //             ? 'Thank you — order complete'
//   //             : 'Delivered successfully'}
//   //         </p>
//   //       </div>
//   //       <div className="px-4 pb-4">
//   //         {/* <button
//   //           type="button"
//   //           className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
//   //         >
//   //           <Star className="w-4 h-4 text-gray-700" />
//   //           Rate &amp; Review
//   //         </button> */}
//   //         <button
//   //           type="button"
//   //           onClick={() =>
//   //             onOpenReview?.({
//   //               productId: p?._id,
//   //               orderId: order._id,
//   //               productName: title,
//   //               image: img,
//   //             })
//   //           }
//   //           className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
//   //         >
//   //           <Star className="w-4 h-4" />
//   //           Rate &amp; Review
//   //         </button>
//   //       </div>
//   //     </li>
//   //   );
//   // }

//   // ── delivered / completed purchase ────────────────────────────────────────
//   // if (meta.kind === 'delivered_purchase') {
//   //   const phase = meta.purchasePhase || 'delivered';
//   //   const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
//   //   const headerDateLabel =
//   //     phase === 'completed'
//   //       ? `Completed on: ${milestoneDate}`
//   //       : `Delivered on: ${milestoneDate}`;
//   //   const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';

//   //   return (
//   //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//   //       <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//   //         <div className="min-w-0">
//   //           <p className="font-bold text-black truncate">Order #{oid}</p>
//   //           <p className="text-sm text-gray-500 mt-0.5">{headerDateLabel}</p>
//   //         </div>
//   //         <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//   //           <CheckCircle2 className="w-3.5 h-3.5" />
//   //           {badgeLabel}
//   //         </span>
//   //       </div>
//   //       <div className="p-4">
//   //         <LineRow
//   //           img={img}
//   //           title={title}
//   //           qty={qty}
//   //           isSell={isSell}
//   //           // price={linePrice}
//   //           price={displayPrice}
//   //           priceSuffix={priceSuffix}
//   //           variantName={variantName}
//   //           href={detailHref}
//   //         />
//   //       </div>
//   //       <div className="px-4 pb-2">
//   //         <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
//   //           <CheckCircle2 className="w-4 h-4 shrink-0" />
//   //           {phase === 'completed'
//   //             ? 'Thank you — order complete'
//   //             : 'Delivered successfully'}
//   //         </p>
//   //       </div>
//   //       <div className="px-4 pb-3">
//   //         <button
//   //           type="button"
//   //           onClick={() =>
//   //             onOpenReview?.({
//   //               productId: p?._id,
//   //               orderId: order._id,
//   //               productName: title,
//   //               image: img,
//   //             })
//   //           }
//   //           className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
//   //         >
//   //           <Star className="w-4 h-4 text-black fill-none" />
//   //           {reviewChecked && hasReview ? 'Update Review' : 'Rate & Review'}
//   //         </button>
//   //       </div>
//   //       <OrderSummaryAccordion order={order} />
//   //     </li>
//   //   );
//   // }

//   // // ── delivered / completed purchase ────────────────────────────────────────
//   // if (meta.kind === 'delivered_purchase') {
//   //   const phase = meta.purchasePhase || 'delivered';
//   //   const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
//   //   const headerDateLabel =
//   //     phase === 'completed'
//   //       ? `Completed on: ${milestoneDate}`
//   //       : `Delivered on: ${milestoneDate}`;
//   //   const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';

//   //   return (
//   //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//   // ── delivered / completed purchase ────────────────────────────────────────
//   if (meta.kind === 'delivered_purchase') {
//     const phase = meta.purchasePhase || 'delivered';
//     const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
//     const headerDateLabel =
//       phase === 'completed'
//         ? `Completed on: ${milestoneDate}`
//         : `Delivered on: ${milestoneDate}`;
//     const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';
//     const deliveredTrackHref = `/orders/${String(order._id)}/track-delivered?lineIdx=${orderProductLines(
//       order,
//     ).indexOf(line)}`;

//     return (
//       <li
//         className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
//         onClick={(e) => {
//           if (e.target.closest('button') || e.target.closest('a')) return;
//           router.push(deliveredTrackHref);
//         }}
//       >
//         {/* Mobile — unchanged original layout */}
//         {/* Mobile — unchanged original layout */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">{headerDateLabel}</p>
//             </div>
//             <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//               <CheckCircle2 className="w-3.5 h-3.5" />
//               {badgeLabel}
//             </span>
//           </div>
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>
//               {/* {variantName ? (
//                 <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                   {variantName}
//                 </span>
//               ) : null} */}
//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//               {/* <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(displayPrice)}
//                 </span>
//               </p> */}
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(displayPrice)}/-
//                 </span>
//               </p>
//             </div>
//           </div>
//           <div className="px-4 pb-2">
//             <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
//               <CheckCircle2 className="w-4 h-4 shrink-0" />
//               {phase === 'completed'
//                 ? 'Thank you — order complete'
//                 : 'Delivered successfully'}
//             </p>
//           </div>
//           <div className="px-4 pb-3">
//             <button
//               type="button"
//               onClick={() =>
//                 onOpenReview?.({
//                   productId: p?._id,
//                   orderId: order._id,
//                   productName: title,
//                   image: img,
//                 })
//               }
//               className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
//             >
//               <Star className="w-4 h-4 text-black fill-none" />
//               {reviewChecked && hasReview ? 'Update Review' : 'Rate & Review'}
//             </button>
//           </div>
//         </div>
//         {/* Desktop — redesigned layout (same as Processing/Completed) */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>

//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     {headerDateLabel}
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                   {badgeLabel}
//                 </span>
//               </div>

//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 {/* <p className="text-sm text-gray-500 mt-0.5">
//                   Order Value:{' '}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(displayPrice)}
//                   </span>
//                 </p> */}
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Order Value:{' '}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(displayPrice)}/-
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-9 flex flex-wrap items-center justify-between gap-2">
//             <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
//               <CheckCircle2 className="w-4 h-4 shrink-0" />
//               {phase === 'completed'
//                 ? 'Thank you — order complete'
//                 : 'Delivered successfully'}
//             </p>
//             <button
//               type="button"
//               onClick={() =>
//                 onOpenReview?.({
//                   productId: p?._id,
//                   orderId: order._id,
//                   productName: title,
//                   image: img,
//                 })
//               }
//               className="shrink-0 px-3 py-1.5 rounded-lg border-2 border-gray-300 bg-white text-black text-xs font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-1.5"
//             >
//               <Star className="w-3.5 h-3.5 text-black fill-none" />
//               {reviewChecked && hasReview ? 'Update Review' : 'Rate & Review'}
//             </button>
//           </div>
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   }

//   // ── delivered rental (same card as delivered purchase, no review button) ──
//   if (meta.kind === 'delivered_rental') {
//     const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
//     const deliveredRentalTrackHref = `/orders/${String(order._id)}/track-delivered?lineIdx=${orderProductLines(
//       order,
//     ).indexOf(line)}`;

//     return (
//       <li
//         className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
//         onClick={(e) => {
//           if (e.target.closest('button') || e.target.closest('a')) return;
//           router.push(deliveredRentalTrackHref);
//         }}
//       >
//         {/* Mobile */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Delivered on: {milestoneDate}
//               </p>
//             </div>
//             <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//               <CheckCircle2 className="w-3.5 h-3.5" />
//               Delivered
//             </span>
//           </div>
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
//                 Rent
//               </span>
//             </div>
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>
//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}/-
//                 </span>
//               </p>
//             </div>
//           </div>
//           <div className="px-4 pb-3">
//             <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
//               <CheckCircle2 className="w-4 h-4 shrink-0" />
//               Delivered successfully
//             </p>
//           </div>
//         </div>

//         {/* Desktop */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
//                 Rent
//               </span>
//             </div>
//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Delivered On:{' '}
//                     <span className="font-semibold text-black">
//                       {milestoneDate}
//                     </span>
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                   Delivered
//                 </span>
//               </div>
//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-between gap-2 flex-wrap">
//                   <span>
//                     Order Value:{' '}
//                     <span className={`font-bold ${ORANGE_TEXT}`}>
//                       ₹{formatMoney(rentalMonthlyPrice)}/-
//                     </span>
//                   </span>
//                   <span className="text-emerald-600 font-medium flex items-center gap-1.5 shrink-0">
//                     <CheckCircle2 className="w-4 h-4" />
//                     Delivered successfully
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   }

//   // ── completed rental

//   // ── completed rental ──────────────────────────────────────────────────────
//   // if (meta.kind === 'completed_done') {
//   //   return (
//   //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//   //       <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//   //         <div className="min-w-0">
//   //           <p className="font-bold text-black truncate">Order #{oid}</p>
//   //           <p className="text-sm text-gray-500 mt-0.5">
//   //             Completed on:{' '}
//   //             {formatOrderDate(order.updatedAt || order.createdAt)}
//   //           </p>
//   //         </div>
//   //         <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
//   //           <CheckCircle2 className="w-3.5 h-3.5" />
//   //           Completed
//   //         </span>
//   //       </div>
//   //       {/* <div className="p-4">
//   //         <LineRow
//   //           img={img}
//   //           title={title}
//   //           qty={qty}
//   //           isSell={isSell}
//   //           // price={linePrice}
//   //           price={displayPrice}
//   //           priceSuffix={priceSuffix}
//   //           variantName={variantName}
//   //           href={detailHref}
//   //         />
//   //       </div>
//   //       <div className="px-4 pb-2">
//   //         <p className="text-sm text-emerald-600 flex items-center gap-1.5">
//   //           <CheckCircle2 className="w-4 h-4" />
//   //           Thank you — rental closed
//   //         </p>
//   //       </div> */}
//   //       <div className="p-4">
//   //         <LineRow
//   //           img={img}
//   //           title={title}
//   //           qty={qty}
//   //           isSell={isSell}
//   //           // price={linePrice}
//   //           price={rentalMonthlyPrice}
//   //           // priceSuffix={priceSuffix}
//   //           priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
//   //           variantName={variantName}
//   //           href={detailHref}
//   //         />
//   //       </div>
//   //       <div className="px-4 pb-2">
//   //         <p className="text-sm text-emerald-600 flex items-center gap-1.5">
//   //           <CheckCircle2 className="w-4 h-4" />
//   //           Thank you — rental closed
//   //         </p>
//   //       </div>
//   //       <OrderSummaryAccordion order={order} />
//   //       {/* <div className="px-4 pb-4">
//   //         <button
//   //           type="button"
//   //           className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
//   //         >
//   //           <Star className="w-4 h-4" />
//   //           Rate &amp; review
//   //         </button>
//   //       </div> */}
//   //     </li>
//   //   );
//   // }

//   // ── completed rental ──────────────────────────────────────────────────────
//   if (meta.kind === 'completed_done') {
//     const completedTrackHref = `/orders/${String(order._id)}/track-completed?lineIdx=${orderProductLines(
//       order,
//     ).indexOf(line)}`;
//     return (
//       <li
//         className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
//         onClick={(e) => {
//           if (e.target.closest('button') || e.target.closest('a')) return;
//           router.push(completedTrackHref);
//         }}
//       >
//         {/* Mobile — unchanged original layout */}
//         {/* Mobile — unchanged original layout */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Completed on:{' '}
//                 {formatOrderDate(order.updatedAt || order.createdAt)}
//               </p>
//             </div>
//             <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
//               <CheckCircle2 className="w-3.5 h-3.5" />
//               Completed
//             </span>
//           </div>

//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>
//               {/* {variantName ? (
//                 <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                   {variantName}
//                 </span>
//               ) : null} */}
//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}
//                   {!isSell && unit !== 'day' ? (
//                     <span className="text-xs font-medium text-gray-500 ml-1">
//                       /-
//                     </span>
//                   ) : null}
//                 </span> */}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}/-
//                 </span>
//               </p>
//             </div>
//           </div>
//           <div className="px-4 pb-2">
//             <p className="text-sm text-emerald-600 flex items-center gap-1.5">
//               <CheckCircle2 className="w-4 h-4" />
//               Thank you — rental closed
//             </p>
//           </div>
//         </div>
//         {/* Desktop — redesigned layout (same as Processing/Shipped) */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>

//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Completed On:{' '}
//                     <span className="font-semibold text-black">
//                       {formatOrderDate(order.updatedAt || order.createdAt)}
//                     </span>
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
//                   <CheckCircle2 className="w-3.5 h-3.5" />
//                   Completed
//                 </span>
//               </div>

//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-between gap-2 flex-wrap">
//                   <span>
//                     Order Value:{' '}
//                     {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                       ₹{formatMoney(rentalMonthlyPrice)}
//                       {!isSell && unit !== 'day' ? (
//                         <span className="text-xs font-medium text-gray-500 ml-1">
//                           /-
//                         </span>
//                       ) : null}
//                     </span> */}
//                     <span className={`font-bold ${ORANGE_TEXT}`}>
//                       ₹{formatMoney(rentalMonthlyPrice)}/-
//                     </span>
//                   </span>
//                   <span className="text-emerald-600 font-medium flex items-center gap-1.5 shrink-0">
//                     <CheckCircle2 className="w-4 h-4" />
//                     Thank you — rental closed
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   }

//   // ── active rental ─────────────────────────────────────────────────────────
//   if (meta.kind === 'active_rental') {
//     // Payment due countdown is based on the NEXT unpaid month's due date
//     // (order start + monthsPaid months), not the overall tenure end date.
//     // e.g. if 2 months are already paid, the "Pay 3rd Month" countdown
//     // should reflect the window between month 2 and month 3, not the
//     // days remaining until the full tenure ends.
//     const monthsPaidForDue = Number(line?.monthsPaid ?? order?.monthsPaid ?? 1);
//     const nextDueDate = new Date(order.createdAt || new Date());
//     if (unit === 'day') {
//       nextDueDate.setDate(nextDueDate.getDate() + monthsPaidForDue * 30);
//     } else {
//       nextDueDate.setMonth(nextDueDate.getMonth() + monthsPaidForDue);
//     }
//     const daysUntilNextDue = Math.ceil(
//       (startOfDay(nextDueDate).getTime() - startOfDay(new Date()).getTime()) /
//         86400000,
//     );

//     const paymentDueClass =
//       daysUntilNextDue < 10
//         ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FFC9C9]'
//         : daysUntilNextDue < 30
//           ? 'bg-[#FFFBEB] text-[#BB4D00] border border-[#FEE685]'
//           : 'bg-[#DCFCE7] text-[#16A34A] border border-[#B9F8CF]';

//     return (
//       <li className="bg-white rounded-xl border-2 border-[#B9F8CF] shadow-sm overflow-hidden">
//         <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-[#E5E7EB] bg-[#F0FDF4]">
//           <div className="min-w-0">
//             <p className="font-bold text-black truncate">Order #{oid}</p>
//             <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
//           </div>
//           <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
//             <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
//             Active rental
//           </span>
//         </div>

//         {/* <div className="p-4">
//           <LineRow
//             img={img}
//             title={title}
//             qty={qty}
//             isSell={isSell}
//             // price={linePrice}
//             price={displayPrice}
//             priceSuffix={priceSuffix}
//             variantName={variantName}
//             href={detailHref}
//           />
//         </div>

//         <div className="px-4 pb-2">
//           <p className="text-sm text-gray-600 flex items-start gap-2">
//             <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
//             <span>Tenure ends {formatOrderDate(meta.leaseEnd)}</span>
//           </p>
//           <span
//             className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${paymentDueClass}`}
//           >
//             <Clock className="w-3.5 h-3.5" />
//             Payment due in {meta.daysLeft} day{meta.daysLeft === 1 ? '' : 's'}
//           </span>
//         </div> */}

//         <div className="p-4 pb-3">
//           {/* <div className="flex gap-4 items-start">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
//                 Rent
//               </span>
//             </div>
//             <div className="min-w-0 flex-1 flex flex-col gap-1">
//               {detailHref ? (
//                 <Link
//                   href={detailHref}
//                   className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug"
//                 >
//                   {title}
//                 </Link>
//               ) : (
//                 <p className="font-semibold text-black leading-snug">{title}</p>
//               )}
//               {variantName ? (
//                 <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
//                   {variantName}
//                 </span>
//               ) : null}
//               {qty > 1 && <p className="text-sm text-gray-500">Qty: {qty}</p>}
//               <p className={`text-base font-bold ${ORANGE_TEXT}`}>
//                 ₹{formatMoney(displayPrice)}
//               </p>
//             </div>
//             <Link
//               href="/my-rentals"
//               className="shrink-0 inline-flex items-center justify-center gap-1.5 px-10 py-2.5 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors"
//             >
//               <Wallet className="w-4 h-4" />
//               Pay Rent
//             </Link>
//           </div> */}
//           <div className="flex gap-3 items-start">
//             {detailHref ? (
//               <Link href={detailHref} className="flex gap-3 flex-1 min-w-0">
//                 <div className="relative shrink-0 w-16 h-16">
//                   <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                     {img ? (
//                       <img
//                         src={img}
//                         alt=""
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-gray-400">
//                         <Package className="w-8 h-8" />
//                       </div>
//                     )}
//                   </div>
//                   <span className="absolute top-1 left-1 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
//                     Rent
//                   </span>
//                 </div>
//                 <div className="min-w-0 flex-1 flex flex-col gap-0.5">
//                   {/* <p className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug text-sm">
//                     {title}
//                   </p>
//                   {variantName ? (
//                     <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
//                       {variantName}
//                     </span>
//                   ) : null}
//                   {qty > 1 && (
//                     <p className="text-xs text-gray-500">Qty: {qty}</p>
//                   )}
//                   <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(displayPrice)}
//                   </p>
//                 </div>
//               </Link> */}
//                   {/* <p className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug text-sm">
//                     {title}
//                   </p>
//                   {variantName ? (
//                     <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
//                       {variantName}
//                     </span>
//                   ) : null}
//                   {qty > 1 && (
//                     <p className="text-xs text-gray-500">Qty: {qty}</p>
//                   )}

//                   <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /month
//                       </span>
//                     ) : null}
//                   </p>
//                 </div>
//               </Link>
//             ) : (
//               <div className="flex gap-3 flex-1 min-w-0">
//                 <div className="relative shrink-0 w-16 h-16">
//                   <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                     {img ? (
//                       <img
//                         src={img}
//                         alt=""
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-gray-400">
//                         <Package className="w-8 h-8" />
//                       </div>
//                     )}
//                   </div>
//                   <span className="absolute top-1 left-1 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
//                     Rent
//                   </span>
//                 </div>
//                 <div className="min-w-0 flex-1 flex flex-col gap-0.5">
//                   <p className="font-semibold text-black leading-snug text-sm">
//                     {title}
//                   </p> */}
//                   <p
//                     title={title}
//                     className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug text-sm truncate min-w-0 max-w-[135px] sm:max-w-none sm:whitespace-normal"
//                   >
//                     {title}
//                   </p>
//                   {/* {variantName ? (
//                     <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
//                       {variantName}
//                     </span>
//                   ) : null} */}
//                   {qty > 1 && (
//                     <p className="text-xs text-gray-500">Qty: {qty}</p>
//                   )}
//                   {/*
//                   <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /-
//                       </span>
//                     ) : null}
//                   </p> */}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}/-
//                   </span>
//                 </div>
//               </Link>
//             ) : (
//               <div className="flex gap-3 flex-1 min-w-0">
//                 <div className="relative shrink-0 w-16 h-16">
//                   <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                     {img ? (
//                       <img
//                         src={img}
//                         alt=""
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-gray-400">
//                         <Package className="w-8 h-8" />
//                       </div>
//                     )}
//                   </div>
//                   <span className="absolute top-1 left-1 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
//                     Rent
//                   </span>
//                 </div>
//                 <div className="min-w-0 flex-1 flex flex-col gap-0.5">
//                   {/* <p className="font-semibold text-black leading-snug text-sm">
//                     {title}
//                   </p>
//                   {variantName ? (
//                     <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
//                       {variantName}
//                     </span>
//                   ) : null}
//                   {qty > 1 && (
//                     <p className="text-xs text-gray-500">Qty: {qty}</p>
//                   )}
//                   <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(displayPrice)}
//                   </p>
//                 </div>
//               </div>
//             )} */}
//                   <p
//                     title={title}
//                     className="font-semibold text-black leading-snug text-sm truncate min-w-0 max-w-[135px] sm:max-w-none sm:whitespace-normal"
//                   >
//                     {title}
//                   </p>
//                   {/* {variantName ? (
//                     <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
//                       {variantName}
//                     </span>
//                   ) : null} */}
//                   {/* null */}
//                   {qty > 1 && (
//                     <p className="text-xs text-gray-500">Qty: {qty}</p>
//                   )}
//                   {/* <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /-
//                       </span>
//                     ) : null}
//                   </p> */}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}/-
//                   </span>
//                 </div>
//               </div>
//             )}
//             {/* <Link
//               href="/my-account?tab=manage-rental-items"
//               className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
//             >
//               <Wallet className="w-4 h-4" />
//               Pay Rent
//             </Link>
//           </div>

//           {!isSell && unit !== 'day' ? (
//             <div className="mt-2">
//               <Pay2ndMonthButton order={order} line={line} />
//             </div>
//           ) : null}
//         </div> */}
//             {/* {!isSell && unit !== 'day' ? (
//               <div className="shrink-0">
//                 <Pay2ndMonthButton order={order} line={line} />
//               </div>
//             ) : (
//               <Link
//                 href="/my-account?tab=manage-rental-items"
//                 className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
//               >
//                 <Wallet className="w-4 h-4" />
//                 Pay Rent
//               </Link>
//             )}
//           </div>
//         </div> */}

//             {/* {!isSell && unit !== 'day' ? (
//               <div className="shrink-0">
//                 <Pay2ndMonthButton order={order} line={line} />
//               </div>
//             ) : isSell ? (
//               <Link
//                 href="/my-account?tab=manage-rental-items"
//                 className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
//               >
//                 <Wallet className="w-4 h-4" />
//                 Pay Rent
//               </Link>
//             ) : null} */}
//             {!isSell && unit !== 'day' ? (
//               // Hidden on mobile — Rental Command Center's mobile UI
//               // already has its own "Pay Now" flow for monthly rentals.
//               // Desktop Orders page keeps this button as before.
//               <div className="hidden sm:block shrink-0">
//                 <Pay2ndMonthButton order={order} line={line} />
//               </div>
//             ) : isSell ? (
//               <Link
//                 href="/my-account?tab=manage-rental-items"
//                 className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
//               >
//                 <Wallet className="w-4 h-4" />
//                 Pay Rent
//               </Link>
//             ) : null}
//           </div>
//         </div>

//         {/* <div className="px-4 pb-3">
//           <p className="text-sm text-gray-600 flex items-start gap-2 mb-2">
//             <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
//             <span>Tenure ends {formatOrderDate(meta.leaseEnd)}</span>
//           </p>
//           <div className="flex flex-col gap-1.5">
//             <div className="flex items-center justify-between gap-2">
//               <span
//                 className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${paymentDueClass}`}
//               >
//                 <Clock className="w-3.5 h-3.5" />
//                 {daysUntilNextDue > 0
//                   ? `Payment due in ${daysUntilNextDue} day${daysUntilNextDue === 1 ? '' : 's'}`
//                   : 'Payment due now'}
//               </span>
//               <button */}
//         <div className="px-4 pb-3">
//           <p className="text-sm text-gray-600 flex items-start gap-1 mb-2">
//             <Calendar className="w-3 h-3 shrink-0 mt-0.5 text-gray-500" />
//             <span className="text-xs">
//               Tenure ends {formatOrderDate(meta.leaseEnd)}
//             </span>
//           </p>
//           <div className="flex flex-col gap-1.5">
//             <div className="flex items-center justify-between gap-2">
//               {unit !== 'day' ? (
//                 <span
//                   className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${paymentDueClass}`}
//                 >
//                   <Clock className="w-3.5 h-3.5" />
//                   {daysUntilNextDue > 0
//                     ? `Payment due in ${daysUntilNextDue} day${daysUntilNextDue === 1 ? '' : 's'}`
//                     : 'Payment due now'}
//                 </span>
//               ) : (
//                 <span />
//               )}
//               <button
//                 type="button"
//                 onClick={() => {
//                   const orderId = String(order?._id || '');
//                   const productId = String(p?._id || '');
//                   if (!orderId || !productId) return;
//                   onOpenReturnPrompt?.({
//                     orderId,
//                     orderRef: oid,
//                     productId,
//                     title,
//                     image: img,
//                     cycleRent: lineRent,
//                     cycleUnit: unit === 'day' ? 'day' : 'month',
//                     startedOn: formatOrderDate(order.createdAt),
//                     totalTenure: String(order.rentalDuration || 0),
//                     totalTenureLabel:
//                       unit === 'day' ? 'Total Days' : 'Total Months',
//                     cycleEnds: formatOrderDate(meta.leaseEnd),
//                   });
//                 }}
//                 className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2 transition-colors shrink-0"
//               >
//                 Request Pickup / Close Rental
//               </button>
//             </div>
//             <button
//               type="button"
//               onClick={() => {
//                 const orderId = String(order?._id || '');
//                 const productId = String(p?._id || '');
//                 if (!orderId || !productId) return;
//                 onOpenReturnPrompt?.({
//                   orderId,
//                   orderRef: oid,
//                   productId,
//                   title,
//                   image: img,
//                   cycleRent: lineRent,
//                   cycleUnit: unit === 'day' ? 'day' : 'month',
//                   startedOn: formatOrderDate(order.createdAt),
//                   totalTenure: String(order.rentalDuration || 0),
//                   totalTenureLabel:
//                     unit === 'day' ? 'Total Days' : 'Total Months',
//                   cycleEnds: formatOrderDate(meta.leaseEnd),
//                 });
//               }}
//               className="sm:hidden inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
//             >
//               Request Pickup / Close Rental
//             </button>
//           </div>
//         </div>
//         <OrderSummaryAccordion order={order} />
//         {/* <div className="px-4 pb-4 flex flex-col sm:flex-row sm:items-center gap-3">
//           <Link
//             href="/my-rentals"
//             className="inline-flex items-center justify-center gap-2 w-full sm:w-[70%] px-4 py-3 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold"
//           >
//             <Wallet className="w-4 h-4" />
//             Pay Rent
//           </Link>

//           <button
//             type="button"
//             onClick={() => {
//               const orderId = String(order?._id || '');
//               const productId = String(p?._id || '');
//               if (!orderId || !productId) return;
//               onOpenReturnPrompt?.({
//                 orderId,
//                 orderRef: oid,
//                 productId,
//                 title,
//                 image: img,
//                 cycleRent: lineRent,
//                 cycleUnit: unit === 'day' ? 'day' : 'month',
//                 startedOn: formatOrderDate(order.createdAt),
//                 totalTenure: String(order.rentalDuration || 0),
//                 totalTenureLabel:
//                   unit === 'day' ? 'Total Days' : 'Total Months',
//                 cycleEnds: formatOrderDate(meta.leaseEnd),
//               });
//             }}
//             className="inline-flex items-center justify-center gap-1 w-full sm:w-[30%] text-sm font-medium text-gray-600 hover:text-black text-center"
//           >
//             Request Pickup / Close Rental
//           </button>
//         </div> */}
//       </li>
//     );
//   }

//   // ── shipped ───────────────────────────────────────────────────────────────
//   if (meta.kind === 'shipped') {
//     return (
//       <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//         {/* Mobile — unchanged original layout */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Placed on: {placed}
//               </p>
//             </div>
//             <div className="shrink-0">
//               <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
//                 <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
//                 Shipped
//               </span>
//             </div>
//           </div>

//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>
//               {/* {variantName ? (
//                 <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                   {variantName}
//                 </span>
//               ) : null} */}
//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}
//                   {!isSell && unit !== 'day' ? (
//                     <span className="text-xs font-medium text-gray-500 ml-1">
//                       /-
//                     </span>
//                   ) : null}
//                 </span> */}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}/-
//                 </span>
//               </p>
//               <p className="text-sm text-gray-500 mt-1">
//                 Expected delivery: {expectedDeliveryDate(order, p)}
//               </p>
//             </div>
//           </div>

//           <div className="px-4 pb-4">
//             <Link
//               href={`/orders/${String(order._id)}/track?lineIdx=${orderProductLines(
//                 order,
//               ).indexOf(line)}`}
//               className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white text-sm font-semibold ${ORANGE}`}
//             >
//               <MapPin className="w-4 h-4" />
//               Track Order
//             </Link>
//           </div>
//         </div>

//         {/* Desktop — redesigned layout */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>

//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Placed On:{' '}
//                     <span className="font-semibold text-black">{placed}</span>
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
//                   <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
//                   Shipped
//                 </span>
//               </div>

//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Order Value:{' '}
//                   {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /-
//                       </span>
//                     ) : null}
//                   </span> */}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}/-
//                   </span>
//                 </p>
//                 <p className="text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
//                   <span>
//                     Expected delivery: {expectedDeliveryDate(order, p)}
//                   </span>
//                   <Link
//                     href={`/orders/${String(order._id)}/track?lineIdx=${orderProductLines(
//                       order,
//                     ).indexOf(line)}`}
//                     className={`shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold ${ORANGE}`}
//                   >
//                     <MapPin className="w-3.5 h-3.5" />
//                     Track Order
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <OrderSummaryAccordion order={order} />
//       </li>
//     );
//   }

//   // ── rental missing catalog ────────────────────────────────────────────────
//   if (meta.kind === 'rental_missing_catalog') {
//     return (
//       <li className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
//         <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-amber-100 bg-amber-50/50">
//           <div>
//             <p className="font-bold text-black">Order #{oid}</p>
//             <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
//           </div>
//           <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
//             <Package className="w-3.5 h-3.5" />
//             Delivered · details incomplete
//           </span>
//         </div>
//         <div className="p-4">
//           <p className="text-sm text-gray-700 leading-relaxed">
//             This item is delivered but product details are missing from the
//             snapshot.
//           </p>
//         </div>
//       </li>
//     );
//   }

//   // ── processing / confirmed (default) ─────────────────────────────────────

//   //   const processingTrackHref = `/orders/${String(order._id)}/track-processing?lineIdx=${orderProductLines(
//   //     order,
//   //   ).indexOf(line)}`;

//   //   return (
//   //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//   //       <div
//   //         role="button"
//   //         tabIndex={0}
//   //         onClick={() => router.push(processingTrackHref)}
//   //         onKeyDown={(e) => {
//   //           if (e.key === 'Enter') router.push(processingTrackHref);
//   //         }}
//   //         className="cursor-pointer"
//   //       >
//   //         <CardHeader oid={oid} placed={placed} isSell={isSell}>
//   //           <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
//   //             <Package className="w-3.5 h-3.5" />
//   //             {procLabel}
//   //           </span>
//   //         </CardHeader>

//   //         <div className="p-4">
//   //           <LineRow
//   //             img={img}
//   //             title={title}
//   //             qty={qty}
//   //             isSell={isSell}
//   //             price={rentalMonthlyPrice}
//   //             priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
//   //             variantName={variantName}
//   //           />
//   //         </div>

//   //         <div className="px-4 pb-2 pt-0">
//   //           <p className="text-sm  text-gray-500">
//   //             We&apos;ll notify you when your product ships.
//   //           </p>
//   //         </div>
//   //       </div>

//   //       <OrderSummaryAccordion order={order} />
//   //     </li>
//   //   );
//   // }

//   const processingTrackHref = `/orders/${String(order._id)}/track-processing?lineIdx=${orderProductLines(
//     order,
//   ).indexOf(line)}`;

//   return (
//     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//       {/* <div
//         role="button"
//         tabIndex={0}
//         onClick={() => router.push(processingTrackHref)}
//         onKeyDown={(e) => {
//           if (e.key === 'Enter') router.push(processingTrackHref);
//         }}
//         className="cursor-pointer"
//       > */}
//       <div>
//         {/* Mobile — unchanged original layout */}
//         {/* <div className="sm:hidden">
//           <CardHeader oid={oid} placed={placed} isSell={isSell}>
//             <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
//               <Package className="w-3.5 h-3.5" />
//               {procLabel}
//             </span>
//           </CardHeader>

//           <div className="p-4">
//             <LineRow
//               img={img}
//               title={title}
//               qty={qty}
//               isSell={isSell}
//               price={rentalMonthlyPrice}
//               priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
//               variantName={variantName}
//             />
//           </div>

//           <div className="px-4 pb-2 pt-0">
//             <p className="text-sm  text-gray-500">
//               We&apos;ll notify you when your product ships.
//             </p>
//           </div>
//         </div> */}
//         {/* Mobile — unchanged original layout */}
//         <div className="sm:hidden">
//           <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//             <div className="min-w-0">
//               <p className="font-bold text-black truncate">Order ID: {oid}</p>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Placed on: {placed}
//               </p>
//             </div>
//             <div className="shrink-0">
//               <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
//                 <Package className="w-3.5 h-3.5" />
//                 {procLabel}
//               </span>
//             </div>
//           </div>
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-20 h-20">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>
//               {/* {variantName ? (
//                 <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                   {variantName}
//                 </span>
//               ) : null} */}
//               {qty > 1 ? (
//                 <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//               ) : null}
//               {/* <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}
//                   {!isSell && unit !== 'day' ? (
//                     <span className="text-xs font-medium text-gray-500 ml-1">
//                       /month
//                     </span>
//                   ) : null}
//                 </span>
//               </p>
//             </div>
//           </div>

//           <div className="px-4 pb-2 pt-0">
//             <p className="text-sm  text-gray-500">
//               We&apos;ll notify you when your product ships.
//             </p>
//           </div>
//         </div> */}
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}
//                   {!isSell && unit !== 'day' ? (
//                     <span className="text-xs font-medium text-gray-500 ml-1">
//                       /-
//                     </span>
//                   ) : null}
//                 </span> */}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(rentalMonthlyPrice)}/-
//                 </span>
//               </p>
//               <p className="text-sm text-gray-500 mt-1">
//                 We&apos;ll notify you when your product ships.
//               </p>
//             </div>
//           </div>

//           <div className="px-4 pb-4">
//             <Link
//               href={processingTrackHref}
//               className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white text-sm font-semibold ${ORANGE}`}
//             >
//               <MapPin className="w-4 h-4" />
//               Track Order
//             </Link>
//           </div>
//         </div>

//         {/* Desktop — redesigned layout */}

//         {/* Desktop — redesigned layout */}
//         <div className="hidden sm:block">
//           <div className="p-4 flex gap-4">
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Package className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span
//                 className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//                   isSell ? 'bg-blue-600' : 'bg-orange-500'
//                 }`}
//               >
//                 {isSell ? 'Buy' : 'Rent'}
//               </span>
//             </div>

//             <div className="min-w-0 flex-1 flex flex-col gap-2">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="min-w-0">
//                   <p className="text-sm text-gray-500">
//                     Order ID:{' '}
//                     <span className="font-semibold text-black">{oid}</span>
//                   </p>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     Placed On:{' '}
//                     <span className="font-semibold text-black">{placed}</span>
//                   </p>
//                 </div>
//                 <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
//                   <Package className="w-3.5 h-3.5" />
//                   {procLabel}
//                 </span>
//               </div>

//               <div>
//                 <p title={title} className="text-sm text-gray-500">
//                   Product Name:{' '}
//                   <span className="font-semibold text-black">{title}</span>
//                 </p>
//                 {/* {variantName ? (
//                   <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//                     {variantName}
//                   </span>
//                 ) : null} */}
//                 {qty > 1 ? (
//                   <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//                 ) : null}
//                 {/* <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-between gap-2 flex-wrap">
//                   <span>
//                     Order Value:{' '}
//                     <span className={`font-bold ${ORANGE_TEXT}`}>
//                       ₹{formatMoney(rentalMonthlyPrice)}
//                       {!isSell && unit !== 'day' ? (
//                         <span className="text-xs font-medium text-gray-500 ml-1">
//                           /month
//                         </span>
//                       ) : null}
//                     </span>
//                   </span>
//                   <span className="text-gray-500 shrink-0">
//                     We&apos;ll notify you when your product ships.
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <OrderSummaryAccordion order={order} />
//     </li>
//   );
// }

// // ─── shared sub-components ─────────────────────────────────────────────────── */}
//                 {/* <p className="text-sm text-gray-500 mt-0.5">
//                   Order Value:{' '}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /month
//                       </span>
//                     ) : null}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-6 flex flex-wrap items-center justify-between gap-2">
//             <p className="text-sm text-gray-500">
//               We&apos;ll notify you when your product ships.
//             </p>
//             <Link
//               href={processingTrackHref}
//               className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold ${ORANGE}`}
//             >
//               <MapPin className="w-4 h-4" />
//               Track Order
//             </Link>
//           </div> */}
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   Order Value:{' '}
//                   {/* <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}
//                     {!isSell && unit !== 'day' ? (
//                       <span className="text-xs font-medium text-gray-500 ml-1">
//                         /-
//                       </span>
//                     ) : null}
//                   </span> */}
//                   <span className={`font-bold ${ORANGE_TEXT}`}>
//                     ₹{formatMoney(rentalMonthlyPrice)}/-
//                   </span>
//                 </p>
//                 <p className="text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
//                   <span>We&apos;ll notify you when your product ships.</span>
//                   <Link
//                     href={processingTrackHref}
//                     className={`shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold ${ORANGE}`}
//                   >
//                     <MapPin className="w-3.5 h-3.5" />
//                     Track Order
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <OrderSummaryAccordion order={order} />
//     </li>
//   );
// }

// // ─── shared sub-components ───────────────────────────────────────────────────
// function CardHeader({ oid, placed, isSell, children }) {
//   return (
//     <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//       <div className="min-w-0">
//         <p className="font-bold text-black truncate">Order #{oid}</p>
//         <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
//       </div>
//       <div className="shrink-0">{children}</div>
//     </div>
//   );
// }
// // Late-fee confirmation modal shown before redirecting to the payment page.
// function LateFeeConfirmModal({ info, onConfirm, onClose, loading }) {
//   const hasLateFee = Number(info?.lateFeeAmount || 0) > 0;
//   if (typeof document === 'undefined') return null;
//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//       onClick={onClose}
//     >
//       <div
//         className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h2 className="text-base font-bold text-black">
//           {hasLateFee ? 'Late Fee Applies' : 'Confirm Payment'}
//         </h2>
//         {hasLateFee ? (
//           <p className="text-sm text-gray-500 mt-1">
//             This payment is {info.daysLate} day{info.daysLate === 1 ? '' : 's'}{' '}
//             late. A late fee of ₹10/day applies.
//           </p>
//         ) : (
//           <p className="text-sm text-gray-500 mt-1">
//             You&apos;re paying on time — no late fee.
//           </p>
//         )}

//         <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Month {info.nextMonth} Rent</span>
//             <span className="font-semibold text-black">
//               ₹{Number(info.baseAmount).toLocaleString('en-IN')}
//             </span>
//           </div>
//           {hasLateFee ? (
//             <div className="flex justify-between text-red-600">
//               <span>Late Fee ({info.daysLate} × ₹10)</span>
//               <span className="font-semibold">
//                 + ₹{Number(info.lateFeeAmount).toLocaleString('en-IN')}
//               </span>
//             </div>
//           ) : null}
//           <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-black">
//             <span>Total Payable</span>
//             <span>₹{Number(info.totalAmount).toLocaleString('en-IN')}</span>
//           </div>
//         </div>

//         <div className="mt-5 flex gap-3">
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={onConfirm}
//             disabled={loading}
//             className="flex-1 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white text-sm font-semibold disabled:opacity-60"
//           >
//             {loading ? 'Loading…' : 'Proceed to Pay'}
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// }

// // Dynamic "Pay Nth Month" button — shows only while there are unpaid
// // months left on a monthly rental. On click it fetches the exact amount
// // due (base rent + any late fee) from the server and shows a confirm
// // modal before redirecting to the payment page.
// // function Pay2ndMonthButton({ order, line }) {
// //   const router = useRouter();
// //   const orderId = String(order?._id || '');
// //   const productId = String(
// //     (line?.product && typeof line.product === 'object' && line.product._id) ||
// //       '',
// //   );

// //   const totalMonths = Number(order?.rentalDuration || 1);
// //   const monthsPaid = Number(order?.monthsPaid ?? 1);
// //   const [dueInfo, setDueInfo] = useState(null);
// //   const [fetching, setFetching] = useState(false);

// function Pay2ndMonthButton({ order, line }) {
//   const router = useRouter();
//   const orderId = String(order?._id || '');
//   const productId = String(
//     (line?.product && typeof line.product === 'object' && line.product._id) ||
//       '',
//   );

//   // const totalMonths = Number(order?.rentalDuration || 1);
//   // // Read from the specific line first — falls back to order-level only
//   // // for pre-existing orders saved before per-line tracking existed.
//   // const monthsPaid = Number(line?.monthsPaid ?? order?.monthsPaid ?? 1);
//   // Read from the specific line first — falls back to order-level only
//   // for pre-existing orders saved before per-line tracking existed.
//   const totalMonths = Number(
//     line?.rentalDuration ?? order?.rentalDuration ?? 1,
//   );
//   const monthsPaid = Number(line?.monthsPaid ?? order?.monthsPaid ?? 1);
//   const [dueInfo, setDueInfo] = useState(null);
//   const [fetching, setFetching] = useState(false);

//   // All months paid — hide the button entirely.
//   if (monthsPaid >= totalMonths) return null;

//   const nextMonth = monthsPaid + 1;
//   const ordinal =
//     nextMonth === 2
//       ? '2nd'
//       : nextMonth === 3
//         ? '3rd'
//         : nextMonth === 1
//           ? '1st'
//           : `${nextMonth}th`;

//   // const handleClick = async () => {
//   //   setFetching(true);
//   //   try {
//   //     const res = await apiGetNextMonthDue(orderId);
//   //     setDueInfo(res.data);
//   //   } catch (err) {
//   //     alert(err?.response?.data?.message || 'Could not fetch payment due.');
//   //   } finally {
//   //     setFetching(false);
//   //   }
//   // };

//   const handleClick = async () => {
//     setFetching(true);
//     try {
//       const res = await apiGetNextMonthDue(orderId, productId);
//       setDueInfo(res.data);
//     } catch (err) {
//       alert(err?.response?.data?.message || 'Could not fetch payment due.');
//     } finally {
//       setFetching(false);
//     }
//   };

//   return (
//     <>
//       {/* <button
//         type="button"
//         onClick={handleClick}
//         disabled={fetching}
//         className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#ea580c] text-white text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60"
//       >
//         <Wallet className="w-4 h-4" />
//         {fetching ? 'Checking…' : `Pay ${ordinal} Month`}
//       </button> */}
//       <button
//         type="button"
//         onClick={handleClick}
//         disabled={fetching}
//         className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#F97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60"
//       >
//         <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//         {fetching ? 'Checking…' : `Pay ${ordinal} Month`}
//       </button>

//       {dueInfo ? (
//         <LateFeeConfirmModal
//           info={dueInfo}
//           loading={false}
//           onClose={() => setDueInfo(null)}
//           onConfirm={() => {
//             router.push(
//               `/payment?mode=pay-next-month&orderId=${encodeURIComponent(
//                 orderId,
//               )}&productId=${encodeURIComponent(productId)}&month=${dueInfo.nextMonth}&baseAmount=${dueInfo.baseAmount}&lateFeeAmount=${dueInfo.lateFeeAmount}&amount=${dueInfo.totalAmount}`,
//             );
//           }}
//         />
//       ) : null}
//     </>
//   );
// }

// // function ServiceBookingCard({
// //   booking,
// //   onReschedule,
// //   onCancel,
// //   onOpenServiceReview,
// // }) {
// //   const title =
// //     booking?.serviceSnapshot?.productName ||
// //     booking?.serviceProduct?.productName ||
// //     'Service booking';
// //   const img =
// //     booking?.serviceSnapshot?.image || booking?.serviceProduct?.image || '';
// //   const bookingDate = booking?.bookingDate
// //     ? formatOrderDate(booking.bookingDate)
// //     : '-';
// //   const oid = `SRV-${String(booking?._id || '')
// //     .slice(-3)
// //     .toUpperCase()}`;
// //   // const status = String(booking?.status || 'pending').replace('_', ' ');
// //   const rawStatus = String(booking?.status || 'pending');

// //   const status =
// //     booking?.status === 'completed'
// //       ? 'Completed'
// //       : booking?.status === 'cancelled'
// //         ? 'Cancelled'
// //         : 'Scheduled';

// //   const statusClass =
// //     booking?.status === 'completed'
// //       ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
// //       : booking?.status === 'cancelled'
// //         ? 'bg-red-50 text-red-700 border-red-200'
// //         : 'bg-[#DBEAFE] text-[#2563EB] border-[#DBEAFE]';

// // function ServiceBookingCard({
// //   booking,
// //   onReschedule,
// //   onCancel,
// //   onOpenServiceReview,
// // }) {
// //   console.log('booking.serviceProduct:', booking?.serviceProduct);
// function ServiceOrderSummaryAccordion({ booking }) {
//   const [open, setOpen] = useState(false);

//   const basePrice = Number(booking?.totalAmount || 0);
//   const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

//   // Tax lines stored in booking (saved at payment time)
//   const taxLines = Array.isArray(booking?.taxLines) ? booking.taxLines : [];

//   // Fallback: compute from taxBreakdown if taxLines not stored
//   const breakdown = booking?.taxBreakdown || {};
//   const computedLines =
//     taxLines.length === 0
//       ? [
//           { label: 'GST', value: Number(breakdown.gst || 0) },
//           { label: 'Care Tax', value: Number(breakdown.careTax || 0) },
//           {
//             label: 'Repair & Warranty',
//             value: Number(breakdown.repairWarranty || 0),
//           },
//           {
//             label: 'Relocation Warranty',
//             value: Number(breakdown.relocationWarranty || 0),
//           },
//           {
//             label: 'Delivery & Packaging',
//             value: Number(breakdown.deliveryPackaging || 0),
//           },
//           {
//             label: 'Installation Fee',
//             value: Number(breakdown.installationFee || 0),
//           },
//           { label: 'Platform Fee', value: Number(breakdown.platformFee || 0) },
//         ].filter((t) => t.value > 0)
//       : taxLines;

//   const taxTotal = computedLines.reduce((s, t) => s + t.value, 0);
//   const serviceFee =
//     basePrice - taxTotal > 0 ? basePrice - taxTotal : basePrice;

//   return (
//     <div className="border-t border-gray-100 mx-4 mb-4">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className="w-full flex items-center justify-between py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
//       >
//         <span className="flex items-center gap-1.5">
//           <svg
//             className="w-4 h-4 text-gray-400"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth={2}
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M9 14l-4-4 4-4M5 10h14M15 14l4-4-4-4"
//             />
//           </svg>
//           Order Summary
//         </span>
//         <svg
//           className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//           strokeWidth={2}
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </button>

//       {open && (
//         <div className="pb-3 space-y-1.5 text-sm">
//           {/* Service fee row */}
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600 font-medium">
//                 {booking?.serviceSnapshot?.productName || 'Service Fee'}
//               </span>
//               <span className="font-semibold text-gray-800">
//                 ₹{fmt(taxTotal > 0 ? serviceFee : basePrice)}/-
//               </span>
//             </div>
//           </div>

//           {/* Tax lines */}
//           {computedLines.length > 0 &&
//             computedLines.map((t) => (
//               <div key={t.label} className="flex justify-between items-center">
//                 <span className="text-gray-500">{t.label}</span>
//                 <span className="font-semibold text-gray-800">
//                   ₹{fmt(t.value)}/-
//                 </span>
//               </div>
//             ))}

//           {booking?.isUrgent && (
//             <div className="flex justify-between items-center">
//               <span className="text-amber-600">Urgent Fee</span>
//               <span className="font-semibold text-amber-600">₹150/-</span>
//             </div>
//           )}

//           {/* Total */}
//           <div className="pt-2 mt-1 border-t border-gray-200 flex justify-between items-center">
//             <span className="font-bold text-black">Total Paid</span>
//             <span className="font-bold text-[#FF6F00] text-base">
//               ₹{fmt(basePrice)}/-
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function PayServiceNowButton({ booking, onPaid }) {
//   const [loading, setLoading] = useState(false);
//   const amount = Number(booking?.totalAmount || 0);

//   const handlePay = async () => {
//     setLoading(true);
//     try {
//       const rzpRes = await apiCreateRazorpayOrder(amount);
//       const { orderId: razorpayOrderId, amount: rzpAmount } = rzpRes.data;

//       await new Promise((resolve, reject) => {
//         const options = {
//           key:
//             process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
//             'rzp_test_TF4N39zZPzWuGw',
//           amount: rzpAmount,
//           currency: 'INR',
//           name: 'RentNPay',
//           description: 'Service Payment',
//           order_id: razorpayOrderId,
//           handler: async (response) => {
//             try {
//               await apiVerifyRazorpayPayment({
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//               });
//               resolve();
//             } catch (e) {
//               reject(e);
//             }
//           },
//           modal: {
//             ondismiss: () => reject(new Error('Payment cancelled')),
//           },
//           theme: { color: '#F97316' },
//         };
//         const rzp = new window.Razorpay(options);
//         rzp.open();
//       });

//       await apiPayServiceBooking(booking._id, { paymentMethod: 'card' });
//       await onPaid?.();
//     } catch (err) {
//       if (err.message === 'Payment cancelled') {
//         alert('Payment was cancelled. Please try again.');
//       } else {
//         alert(
//           err?.response?.data?.message || 'Payment failed. Please try again.',
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       type="button"
//       onClick={handlePay}
//       disabled={loading}
//       className="inline-flex items-center justify-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold w-fit disabled:opacity-60"
//     >
//       <Wallet className="w-3.5 h-3.5" />
//       {loading ? 'Processing…' : `Pay ₹${formatMoney(amount)}`}
//     </button>
//   );
// }

// function ServiceBookingCard({
//   booking,
//   onReschedule,
//   onCancel,
//   onOpenServiceReview,
//   onPaid,
// }) {
//   // console.log('booking.serviceProduct:', booking?.serviceProduct);
//   // console.log('booking.serviceSnapshot:', booking?.serviceSnapshot);
//   const title =
//     booking?.serviceSnapshot?.productName ||
//     booking?.serviceProduct?.productName ||
//     'Service booking';
//   const img =
//     booking?.serviceSnapshot?.image || booking?.serviceProduct?.image || '';
//   // const oid = `SRV-${String(booking?._id || '')
//   //   .slice(-3)
//   //   .toUpperCase()}`;
//   const oid = `SRV-${String(booking?.bookingNumber || 0).padStart(4, '0')}`;
//   const rawStatus = String(booking?.status || 'pending');

//   // const status =
//   //   booking?.status === 'completed'
//   //     ? 'Completed'
//   //     : booking?.status === 'cancelled'
//   //       ? 'Cancelled'
//   //       : 'Scheduled';
//   const status =
//     booking?.status === 'completed'
//       ? 'Completed'
//       : booking?.status === 'cancelled'
//         ? 'Cancelled'
//         : booking?.status === 'confirmed' || booking?.status === 'in_progress'
//           ? 'Confirmed'
//           : 'Scheduled';

//   const statusClass =
//     booking?.status === 'completed'
//       ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//       : booking?.status === 'cancelled'
//         ? 'bg-red-50 text-red-700 border-red-200'
//         : 'bg-[#DBEAFE] text-[#2563EB] border-[#DBEAFE]';

//   // ── check if user already reviewed this booking ──
//   const serviceDetailHref = (() => {
//     const id =
//       booking?.serviceProduct?._id ||
//       (typeof booking?.serviceProduct === 'string'
//         ? booking.serviceProduct
//         : null) ||
//       booking?.serviceSnapshot?.serviceProductId;
//     return id ? `/service/${id}` : null;
//   })();

//   const [hasReview, setHasReview] = useState(false);
//   const [reviewChecked, setReviewChecked] = useState(false);

//   useEffect(() => {
//     if (booking?.status !== 'completed') return;
//     // const productId = booking.serviceProduct?._id || booking.serviceProduct;
//     // if (!productId || !booking._id) return;
//     const productId = resolveServiceProductId(booking);
//     // console.log('resolved productId for review check:', productId, booking);
//     if (!productId) return;
//     apiGetMyServiceReview(String(productId))
//       .then((res) => setHasReview(res.data?.exists === true))
//       .catch(() => setHasReview(false))
//       .finally(() => setReviewChecked(true));
//   }, [booking?.status, booking?.serviceProduct]);

//   return (
//     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//       {/* <div className="p-4">
//         <div className="flex gap-4">
//           {serviceDetailHref ? (
//             <Link
//               href={serviceDetailHref}
//               className="relative shrink-0 w-28 h-28 block"
//             >
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Calendar className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
//                 Service
//               </span>
//             </Link>
//           ) : (
//             <div className="relative shrink-0 w-28 h-28">
//               <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                 {img ? (
//                   <img
//                     src={img}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <Calendar className="w-8 h-8" />
//                   </div>
//                 )}
//               </div>
//               <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
//                 Service
//               </span>
//             </div>
//           )}
//           <div className="min-w-0 flex-1">
//             <div className="flex items-start justify-between gap-2">
//               <p className="text-sm text-gray-500">
//                 Service ID:{' '}
//                 <span className="font-semibold text-black">{oid}</span>
//               </p>
//               <span
//                 className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}
//               >
//                 {booking?.status === 'completed' ? (
//                   <CheckCircle className="w-3.5 h-3.5" />
//                 ) : booking?.status === 'cancelled' ? (
//                   <XCircle className="w-3.5 h-3.5" />
//                 ) : (
//                   <Calendar className="w-3.5 h-3.5" />
//                 )}
//                 {status}
//               </span>
//             </div>
//             <p className="text-sm text-gray-500 mt-0.5">
//               Booked On:{' '}
//               <span className="font-semibold text-black">
//                 {formatOrderDate(booking?.createdAt)}
//               </span>
//             </p>
//             <p title={title} className="text-sm text-gray-500 mt-0.5">
//               Service Name:{' '}
//               <span className="font-semibold text-black">{title}</span>
//             </p>

//             {booking?.paymentMethod === 'pay_after_service' ? (
//               <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
//                 Pay After Service
//               </span>
//             ) : null}
//             <p className="text-sm text-gray-500 mt-1">
//               Order Value:{' '}
//               <span className={`font-bold ${ORANGE_TEXT}`}>
//                 ₹{formatMoney(booking?.totalAmount || 0)}
//               </span>
//             </p>

//             {booking?.paymentStatus === 'pending' &&
//             booking?.status === 'completed' ? (
//               <Link
//                 href={`/payment?mode=service-pay&bookingId=${encodeURIComponent(
//                   booking._id,
//                 )}&amount=${encodeURIComponent(booking.totalAmount || 0)}`}
//                 className="inline-flex items-center justify-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold w-fit"
//               >
//                 <Wallet className="w-3.5 h-3.5" />
//                 Pay ₹{formatMoney(booking.totalAmount || 0)}
//               </Link>
//             ) : null}

//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//               <p className="text-sm text-gray-500 flex items-center gap-1">
//                 <Calendar className="w-4 h-4 hidden sm:inline-block" />
//                 <span>
//                   Scheduled:
//                   <span className="text-[#155DFC] font-semibold">
//                     {formatOrderDate(booking?.bookingDate)} ·{' '}
//                     {booking?.timeSlot?.label || '-'}
//                   </span>
//                 </span>
//               </p>

//               <div className="flex flex-wrap gap-3 sm:shrink-0">
//                 {booking?.status === 'completed' ? (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const spId = resolveServiceProductId(booking);
//                       if (!spId) {
//                         alert(
//                           'This service listing is no longer available for review.',
//                         );
//                         return;
//                       }
//                       onOpenServiceReview?.({
//                         serviceProductId: spId,
//                         serviceName: title,
//                         image: img,
//                         vendorName:
//                           booking.serviceSnapshot?.vendorName ||
//                           booking.vendor?.fullName ||
//                           'Service Provider',
//                       });
//                     }}
//                     className="px-5 py-2.5 rounded-lg border-2 border-[#FF6F00] bg-white text-[#FF6F00] text-sm font-semibold hover:bg-orange-50 transition inline-flex items-center justify-center gap-2 whitespace-nowrap"
//                   >
//                     <Star className="w-4 h-4" />
//                     {reviewChecked && hasReview
//                       ? 'Update Review'
//                       : 'Rate & Review'}
//                   </button>
//                 ) : booking?.status !== 'cancelled' ? (
//                   <>
//                     {booking?.status === 'pending' ? (
//                       <RescheduleButton
//                         booking={booking}
//                         onReschedule={onReschedule}
//                       />
//                     ) : null}
//                     <button
//                       type="button"
//                       className="px-5 py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition whitespace-nowrap"
//                       onClick={() => onCancel(booking)}
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <div className="space-y-1">
//                     <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
//                       <CheckCircle2 className="w-4 h-4 shrink-0" />
//                       Refund Processed: ₹
//                       {formatMoney(
//                         booking.refundAmount ?? booking.totalAmount ?? 0,
//                       )}{' '}
//                       to Source
//                     </p>
//                     {booking.lateFee > 0 && (
//                       <p className="text-xs text-red-500">
//                         Late cancellation fee deducted: ₹
//                         {formatMoney(booking.lateFee)}
//                       </p>
//                     )}
//                     <p className="text-xs text-gray-500">
//                       {booking.cancelledBy === 'vendor'
//                         ? 'Cancelled by vendor on '
//                         : 'Cancelled on '}
//                       {formatOrderDate(
//                         booking.cancelledAt || booking.updatedAt,
//                       )}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <ServiceOrderSummaryAccordion booking={booking} /> */}
//       {/* Mobile — original layout, unchanged */}
//       <div className="sm:hidden">
//         <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
//           <div>
//             <p className="font-bold text-black">Service ID: {oid}</p>
//             <p className="text-sm text-gray-500 mt-0.5">
//               Booked on: {formatOrderDate(booking?.createdAt)}
//             </p>
//           </div>
//           <span
//             className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}
//           >
//             {booking?.status === 'completed' ? (
//               <CheckCircle className="w-3.5 h-3.5" />
//             ) : booking?.status === 'cancelled' ? (
//               <XCircle className="w-3.5 h-3.5" />
//             ) : (
//               <Calendar className="w-3.5 h-3.5" />
//             )}
//             {status}
//           </span>
//         </div>
//         <div className="p-4">
//           <div className="flex gap-4">
//             {serviceDetailHref ? (
//               <Link
//                 href={serviceDetailHref}
//                 className="relative shrink-0 w-20 h-20 block"
//               >
//                 <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                   {img ? (
//                     <img
//                       src={img}
//                       alt=""
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-400">
//                       <Calendar className="w-8 h-8" />
//                     </div>
//                   )}
//                 </div>
//                 <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
//                   Service
//                 </span>
//               </Link>
//             ) : (
//               <div className="relative shrink-0 w-20 h-20">
//                 <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                   {img ? (
//                     <img
//                       src={img}
//                       alt=""
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-400">
//                       <Calendar className="w-8 h-8" />
//                     </div>
//                   )}
//                 </div>
//                 <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
//                   Service
//                 </span>
//               </div>
//             )}
//             <div className="min-w-0 flex-1">
//               <p title={title} className="text-sm text-gray-500">
//                 Product Name:{' '}
//                 {serviceDetailHref ? (
//                   <Link
//                     href={serviceDetailHref}
//                     className="font-semibold text-black hover:text-[#FF6F00] transition-colors"
//                   >
//                     {title}
//                   </Link>
//                 ) : (
//                   <span className="font-semibold text-black">{title}</span>
//                 )}
//               </p>
//               {booking?.paymentMethod === 'pay_after_service' ? (
//                 <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
//                   Pay After Service
//                 </span>
//               ) : null}
//               {/* <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(booking?.totalAmount || 0)}
//                 </span>
//               </p> */}
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(booking?.totalAmount || 0)}/-
//                 </span>
//               </p>
//               {booking?.paymentStatus === 'pending' &&
//               booking?.status === 'completed' ? (
//                 <PayServiceNowButton booking={booking} onPaid={onPaid} />
//               ) : null}

//               <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
//                 <Calendar className="w-4 h-4 hidden sm:inline-block" />
//                 <span>
//                   Scheduled:
//                   <span className="text-[#155DFC] font-semibold">
//                     {formatOrderDate(booking?.bookingDate)} ·{' '}
//                     {booking?.timeSlot?.label || '-'}
//                   </span>
//                 </span>
//               </p>

//               <div className="mt-3 flex gap-2">
//                 {booking?.status === 'completed' ? (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const spId = resolveServiceProductId(booking);
//                       if (!spId) {
//                         alert(
//                           'This service listing is no longer available for review.',
//                         );
//                         return;
//                       }
//                       onOpenServiceReview?.({
//                         serviceProductId: spId,
//                         serviceName: title,
//                         image: img,
//                         vendorName:
//                           booking.serviceSnapshot?.vendorName ||
//                           booking.vendor?.fullName ||
//                           'Service Provider',
//                       });
//                     }}
//                     className="flex-1 py-2.5 rounded-lg border-2 border-[#FF6F00] bg-white text-[#FF6F00] text-sm font-semibold hover:bg-orange-50 transition inline-flex items-center justify-center gap-2"
//                   >
//                     <Star className="w-4 h-4" />
//                     {reviewChecked && hasReview
//                       ? 'Update Review'
//                       : 'Rate & Review'}
//                   </button>
//                 ) : booking?.status !== 'cancelled' ? (
//                   <>
//                     {booking?.status === 'pending' ? (
//                       <RescheduleButton
//                         booking={booking}
//                         onReschedule={onReschedule}
//                       />
//                     ) : null}
//                     <button
//                       type="button"
//                       className={`${
//                         booking?.status === 'pending' ? 'flex-[3]' : 'flex-1'
//                       } py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition`}
//                       onClick={() => onCancel(booking)}
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <div className="mt-1 space-y-1">
//                     <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
//                       <CheckCircle2 className="w-4 h-4 shrink-0" />
//                       Refund Processed: ₹
//                       {formatMoney(
//                         booking.refundAmount ?? booking.totalAmount ?? 0,
//                       )}{' '}
//                       to Source
//                     </p>
//                     {booking.lateFee > 0 && (
//                       <p className="text-xs text-red-500">
//                         Late cancellation fee deducted: ₹
//                         {formatMoney(booking.lateFee)}
//                       </p>
//                     )}
//                     <p className="text-xs text-gray-500">
//                       {booking.cancelledBy === 'vendor'
//                         ? 'Cancelled by vendor on '
//                         : 'Cancelled on '}
//                       {formatOrderDate(
//                         booking.cancelledAt || booking.updatedAt,
//                       )}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         <ServiceOrderSummaryAccordion booking={booking} />
//       </div>

//       {/* Desktop — redesigned layout */}
//       <div className="hidden sm:block">
//         <div className="p-4">
//           <div className="flex gap-4">
//             {serviceDetailHref ? (
//               <Link
//                 href={serviceDetailHref}
//                 className="relative shrink-0 w-28 h-28 block"
//               >
//                 <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                   {img ? (
//                     <img
//                       src={img}
//                       alt=""
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-400">
//                       <Calendar className="w-8 h-8" />
//                     </div>
//                   )}
//                 </div>
//                 <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
//                   Service
//                 </span>
//               </Link>
//             ) : (
//               <div className="relative shrink-0 w-28 h-28">
//                 <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//                   {img ? (
//                     <img
//                       src={img}
//                       alt=""
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-400">
//                       <Calendar className="w-8 h-8" />
//                     </div>
//                   )}
//                 </div>
//                 <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
//                   Service
//                 </span>
//               </div>
//             )}
//             <div className="min-w-0 flex-1">
//               <div className="flex items-start justify-between gap-2">
//                 <p className="text-sm text-gray-500">
//                   Service ID:{' '}
//                   <span className="font-semibold text-black">{oid}</span>
//                 </p>
//                 <span
//                   className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}
//                 >
//                   {booking?.status === 'completed' ? (
//                     <CheckCircle className="w-3.5 h-3.5" />
//                   ) : booking?.status === 'cancelled' ? (
//                     <XCircle className="w-3.5 h-3.5" />
//                   ) : (
//                     <Calendar className="w-3.5 h-3.5" />
//                   )}
//                   {status}
//                 </span>
//               </div>
//               <p className="text-sm text-gray-500 mt-0.5">
//                 Booked On:{' '}
//                 <span className="font-semibold text-black">
//                   {formatOrderDate(booking?.createdAt)}
//                 </span>
//               </p>
//               <p title={title} className="text-sm text-gray-500 mt-0.5">
//                 Service Name:{' '}
//                 <span className="font-semibold text-black">{title}</span>
//               </p>
//               {booking?.paymentMethod === 'pay_after_service' ? (
//                 <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
//                   Pay After Service
//                 </span>
//               ) : null}
//               {/* <p className="text-sm text-gray-500 mt-1">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(booking?.totalAmount || 0)}
//                 </span>
//               </p> */}

//               <p className="text-sm text-gray-500 mt-1">
//                 Order Value:{' '}
//                 <span className={`font-bold ${ORANGE_TEXT}`}>
//                   ₹{formatMoney(booking?.totalAmount || 0)}/-
//                 </span>
//               </p>
//               {booking?.paymentStatus === 'pending' &&
//               booking?.status === 'completed' ? (
//                 <PayServiceNowButton booking={booking} onPaid={onPaid} />
//               ) : null}
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//                 <p className="text-sm text-gray-500 flex items-center gap-1">
//                   <Calendar className="w-4 h-4 hidden sm:inline-block" />
//                   <span>
//                     Scheduled:
//                     <span className="text-[#155DFC] font-semibold">
//                       {formatOrderDate(booking?.bookingDate)} ·{' '}
//                       {booking?.timeSlot?.label || '-'}
//                     </span>
//                   </span>
//                 </p>

//                 <div className="flex flex-wrap gap-3 sm:shrink-0">
//                   {booking?.status === 'completed' ? (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         const spId = resolveServiceProductId(booking);
//                         if (!spId) {
//                           alert(
//                             'This service listing is no longer available for review.',
//                           );
//                           return;
//                         }
//                         onOpenServiceReview?.({
//                           serviceProductId: spId,
//                           serviceName: title,
//                           image: img,
//                           vendorName:
//                             booking.serviceSnapshot?.vendorName ||
//                             booking.vendor?.fullName ||
//                             'Service Provider',
//                         });
//                       }}
//                       className="px-5 py-2.5 rounded-lg border-2 border-[#FF6F00] bg-white text-[#FF6F00] text-sm font-semibold hover:bg-orange-50 transition inline-flex items-center justify-center gap-2 whitespace-nowrap"
//                     >
//                       <Star className="w-4 h-4" />
//                       {reviewChecked && hasReview
//                         ? 'Update Review'
//                         : 'Rate & Review'}
//                     </button>
//                   ) : booking?.status !== 'cancelled' ? (
//                     <>
//                       {booking?.status === 'pending' ? (
//                         <RescheduleButton
//                           booking={booking}
//                           onReschedule={onReschedule}
//                         />
//                       ) : null}
//                       <button
//                         type="button"
//                         className="px-5 py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition whitespace-nowrap"
//                         onClick={() => onCancel(booking)}
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   ) : (
//                     <div className="space-y-1">
//                       <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
//                         <CheckCircle2 className="w-4 h-4 shrink-0" />
//                         Refund Processed: ₹
//                         {formatMoney(
//                           booking.refundAmount ?? booking.totalAmount ?? 0,
//                         )}{' '}
//                         to Source
//                       </p>
//                       {booking.lateFee > 0 && (
//                         <p className="text-xs text-red-500">
//                           Late cancellation fee deducted: ₹
//                           {formatMoney(booking.lateFee)}
//                         </p>
//                       )}
//                       <p className="text-xs text-gray-500">
//                         {booking.cancelledBy === 'vendor'
//                           ? 'Cancelled by vendor on '
//                           : 'Cancelled on '}
//                         {formatOrderDate(
//                           booking.cancelledAt || booking.updatedAt,
//                         )}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <ServiceOrderSummaryAccordion booking={booking} />
//       </div>
//     </li>
//   );
// }

// function RescheduleButton({ booking, onReschedule }) {
//   const [fetching, setFetching] = useState(false);
//   return (
//     <button
//       type="button"
//       disabled={fetching}
//       className="flex-[7] py-2.5 rounded-lg bg-blue-50 border-2 border-[#155DFC] text-[#155DFC] text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
//       onClick={async () => {
//         try {
//           setFetching(true);
//           const productId =
//             booking.serviceProduct?._id || booking.serviceProduct;
//           const res = await apiGetServiceById(String(productId));
//           const fullProduct = res.data?.product || res.data;
//           onReschedule({ product: fullProduct, booking });
//         } catch {
//           onReschedule({ product: booking.serviceProduct, booking });
//         } finally {
//           setFetching(false);
//         }
//       }}
//     >
//       <Calendar className="w-4 h-4 text-[#155DFC]" />
//       {fetching ? 'Loading...' : 'Reschedule'}
//     </button>
//   );
// }

// // function LineRow({ img, title, qty, isSell, price, priceSuffix, variantName }) {
// //   return (
// //     <div className="flex gap-4">
// //       <div className="relative shrink-0 w-20 h-20">
// //         <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
// //           {img ? (
// //             // eslint-disable-next-line @next/next/no-img-element
// //             <img src={img} alt="" className="w-full h-full object-cover" />
// //           ) : (
// //             <div className="w-full h-full flex items-center justify-center text-gray-400">
// //               <Package className="w-8 h-8" />
// //             </div>
// //           )}
// //         </div>
// //         <span
// //           className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
// //             isSell ? 'bg-blue-600' : 'bg-orange-500'
// //           }`}
// //         >
// //           {isSell ? 'Buy' : 'Rent'}
// //         </span>
// //       </div>

// //       <div className="min-w-0 flex-1">
// //         <div className="flex items-center gap-2 flex-wrap">
// //           <p className="font-semibold text-black">{title}</p>

// //           {variantName ? (
// //             <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
// //               {variantName}
// //             </span>
// //           ) : null}
// //         </div>

// //         {qty > 1 ? (
// //           <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
// //         ) : null}

// //         <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
// //           ₹{formatMoney(price)}
// //           {priceSuffix ? (
// //             <span className="text-sm font-medium text-gray-500 ml-1">
// //               {priceSuffix}
// //             </span>
// //           ) : null}
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// function LineRow({
//   img,
//   title,
//   qty,
//   isSell,
//   price,
//   priceSuffix,
//   variantName,
//   href,
// }) {
//   const Content = (
//     <div className="flex gap-4">
//       <div className="relative shrink-0 w-20 h-20">
//         <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//           {img ? (
//             <img src={img} alt="" className="w-full h-full object-cover" />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center text-gray-400">
//               <Package className="w-8 h-8" />
//             </div>
//           )}
//         </div>
//         <span
//           className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//             isSell ? 'bg-blue-600' : 'bg-orange-500'
//           }`}
//         >
//           {isSell ? 'Buy' : 'Rent'}
//         </span>
//       </div>
//       {/* <div className="min-w-0 flex-1">
//         <div className="flex items-center gap-2 flex-wrap">
//           <p
//             className={`font-semibold text-black ${href ? 'hover:text-[#FF6F00] transition-colors' : ''}`}
//           >
//             {title}
//           </p>
//           {variantName ? (
//             <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//               {variantName}
//             </span>
//           ) : null}
//         </div> */}
//       <div className="min-w-0 flex-1">
//         <div className="flex items-center gap-2 flex-wrap min-w-0">
//           <p
//             title={title}
//             className={`font-semibold text-black truncate min-w-0 max-w-[135px] sm:max-w-none sm:whitespace-normal ${href ? 'hover:text-[#FF6F00] transition-colors' : ''}`}
//           >
//             {title}
//           </p>
//           {/* {variantName ? (
//             <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//               {variantName}
//             </span>
//           ) : null} */}
//           {/* null */}
//         </div>
//         {qty > 1 ? (
//           <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//         ) : null}
//         {/* <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
//           ₹{formatMoney(price)}
//           {priceSuffix ? (
//             <span className="text-sm font-medium text-gray-500 ml-1">
//               {priceSuffix}
//             </span>
//           ) : null}
//         </p> */}
//         <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
//           ₹{formatMoney(price)}/-
//         </p>
//       </div>
//     </div>
//   );

//   if (href) {
//     return (
//       <Link href={href} className="block hover:opacity-90 transition-opacity">
//         {Content}
//       </Link>
//     );
//   }
//   return Content;
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Package,
  Star,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Wallet,
  CheckCircle,
} from 'lucide-react';
import {
  apiGetMyBookings,
  apiGetMyOrders,
  apiGetMyReview,
  apiCancelMyBooking,
  apiGetServiceById,
  apiGetMyServiceReview,
  apiGetNextMonthDue,
  apiPayServiceBooking,
  apiCreateRazorpayOrder,
  apiVerifyRazorpayPayment,
} from '@/lib/api';
import {
  formatMoney,
  formatOrderDate,
  orderDisplayId,
  startOfDay,
  productImageUrl,
  normalizeStatus,
  resolveTenureUnit,
  computeLeaseEnd,
  computeNextPaymentLabel,
  daysUntilNextRent,
  orderLineTotal,
  orderGrandTotal,
  primaryProduct,
  orderIsPurchase,
  lineIsPurchase,
  orderProductLines,
  lineDisplayPrice,
  purchaseLineTotal,
  firstMyRentalsEligibleLine,
  lineUnitRent,
  lineEligibleForRentalHub,
} from '@/lib/orderRentalUtils';
import ReviewModal from '@/components/ReviewModal';
import BookingModal from '@/components/ServicePage/ServiceBookinModal';
import ServiceReviewModal from '@/components/ServiceReviewModal';
import ServiceReceiptModal from '@/components/ServiceReceiptModal';

const PAGE_SIZE = 10;

const ORANGE = 'bg-[#FF6F00] hover:bg-[#e56400]';
const ORANGE1 = 'hover:bg-[#FF6F00]';
const ORANGE_TEXT = 'text-[#FF6F00]';
const ORANGE_BORDER = 'border-[#FF6F00]';

// ─── helpers ────────────────────────────────────────────────────────────────

function rentalProductLines(order) {
  return (order.products || []).filter((line) => {
    const lineType = String(line?.productType || '').toLowerCase();
    if (lineType === 'sell') return false;
    const p = line?.product;
    if (!p || typeof p === 'string') return false;
    if (String(p?.type || '').toLowerCase() === 'sell') return false;
    return true;
  });
}

// function resolveServiceProductId(booking) {
//   const sp = booking?.serviceProduct;
//   if (!sp) return null;
//   if (typeof sp === 'string' && sp !== 'undefined') return sp;
//   if (sp._id) return String(sp._id);
//   return (
//     sp?.serviceProductId || booking?.serviceSnapshot?.serviceProductId || null
//   );
// }

function resolveServiceProductId(booking) {
  const sp = booking?.serviceProduct;

  // Case 1: populated object with _id
  if (sp && typeof sp === 'object' && sp._id) return String(sp._id);

  // Case 2: plain string ID
  if (sp && typeof sp === 'string' && sp !== 'undefined' && sp !== 'null')
    return sp;

  // Case 3: snapshot has it
  if (
    booking?.serviceSnapshot?.serviceProductId &&
    booking.serviceSnapshot.serviceProductId !== ''
  )
    return String(booking.serviceSnapshot.serviceProductId);
  // Case 4: snapshot itself is the ID source
  if (booking?.serviceSnapshot?._id) return String(booking.serviceSnapshot._id);

  console.warn('resolveServiceProductId: could not resolve from', booking);
  return null;
}

function CancelConfirmModal({ booking, onConfirm, onClose }) {
  if (typeof document === 'undefined') return null;
  const title =
    booking?.serviceSnapshot?.productName ||
    booking?.serviceProduct?.productName ||
    'Service';

  const now = new Date();
  // const bookingDateTime = new Date(booking.bookingDate);
  // if (booking.timeSlot?.startTime) {
  //   const [h, m] = booking.timeSlot.startTime.split(':').map(Number);
  //   bookingDateTime.setHours(h, m, 0, 0);
  // }

  const bookingDateTime = new Date(booking.bookingDate);
  if (booking.timeSlot?.from) {
    const raw = String(booking.timeSlot.from).trim();
    const isPM = /pm/i.test(raw);
    const isAM = /am/i.test(raw);
    const timePart = raw.replace(/[apm\s]/gi, '');
    let [h, m] = timePart.split(':').map(Number);
    if (isPM || isAM) {
      if (isPM && h !== 12) h += 12;
      if (isAM && h === 12) h = 0;
    }
    bookingDateTime.setHours(h, m, 0, 0);
  }

  // const hoursUntilService = (bookingDateTime - now) / (1000 * 60 * 60);
  // const isLate = hoursUntilService < 1.5;
  // const total = Number(booking.totalAmount || 0);
  // const fee = isLate ? Math.round(total * 0.1) : 0;
  // const refund = total - fee;
  const isPayAfterService = booking.paymentMethod === 'pay_after_service';
  const hoursUntilService = (bookingDateTime - now) / (1000 * 60 * 60);
  const isLate = hoursUntilService < 1.5;
  const total = Number(booking.totalAmount || 0);
  const fee = isPayAfterService ? 0 : isLate ? Math.round(total * 0.1) : 0;
  const refund = isPayAfterService ? 0 : total - fee;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-black">Cancel Booking?</h2>
        <p className="text-sm text-gray-500 mt-1">{title}</p>

        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking Amount</span>
            <span className="font-semibold text-black">
              ₹{formatMoney(total)}/-
            </span>
          </div>
          {/* {isLate ? (
            <>
              <div className="flex justify-between text-red-600">
                <span>Late Cancellation Fee (10%)</span>
                <span className="font-semibold">− ₹{formatMoney(fee)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
                <span>Refund to Source</span>
                <span>₹{formatMoney(refund)}</span>
              </div>
              <p className="text-xs text-red-500 mt-1">
                Cancelling within 1.5 hours of the service attracts a 10% fee.
              </p>
            </>
          ) : (
            <>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
                <span>Full Refund to Source</span>
                <span>₹{formatMoney(refund)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Free cancellation — more than 1.5 hours before service.
              </p>
            </>
          )} */}

          {isPayAfterService ? (
            <>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-700 font-bold">
                <span>Amount Payable</span>
                <span>₹0</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                No payment was made for this booking — nothing to refund.
              </p>
            </>
          ) : isLate ? (
            <>
              <div className="flex justify-between text-red-600">
                <span>Late Cancellation Fee (10%)</span>
                <span className="font-semibold">− ₹{formatMoney(fee)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
                <span>Refund to Source</span>
                <span>₹{formatMoney(refund)}</span>
              </div>
              <p className="text-xs text-red-500 mt-1">
                Cancelling within 1.5 hours of the service attracts a 10% fee.
              </p>
            </>
          ) : (
            <>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-emerald-700 font-bold">
                <span>Full Refund to Source</span>
                <span>₹{formatMoney(refund)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Free cancellation — more than 1.5 hours before service.
              </p>
            </>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
function everyRentalLineHasReturnRequest(order) {
  const lines = rentalProductLines(order);
  if (!lines.length) return false;
  return lines.every((line) => {
    const s = String(line?.returnRequest?.status || '');
    return s === 'requested' || s === 'review_submitted';
  });
}

function orderReturnLine(order) {
  return (order.products || []).find((line) => {
    const s = String(line?.returnRequest?.status || '');
    return s === 'requested' || s === 'review_submitted';
  });
}

// function lineRefundableDeposit(line) {
//   if (!line) return 0;
//   const fromLine = Number(line.refundableDeposit);
//   if (Number.isFinite(fromLine) && fromLine > 0) return fromLine;
//   const p = line.product;
//   if (p && typeof p === 'object') {
//     const d = Number(p.refundableDeposit);
//     if (Number.isFinite(d) && d > 0) return d;
//   }
//   return 0;
// }

function lineRefundableDeposit(line) {
  if (!line) return 0;
  const fromLine = Number(line.refundableDeposit);
  if (Number.isFinite(fromLine) && fromLine > 0) return fromLine;
  const p = line.product;
  if (p && typeof p === 'object') {
    const d = Number(p.refundableDeposit);
    if (Number.isFinite(d) && d > 0) return d;
  }
  return 0;
}

// Product-only order total (products + delivery/GST/care/etc fees +
// refundable deposits). Deliberately does NOT use order.totalAmount,
// because that field can include an unrelated service booking amount
// when a rent/buy order and a service booking share the same order —
// which would otherwise leak the service price into the product card's
// "Order Value".
function orderProductOnlyTotal(order) {
  const productLines = (order.products || []).map((line) => {
    const unitPrice = Number(line?.pricePerDay || line?.price || 0);
    const qty = Number(line?.quantity || 1);
    return unitPrice * qty;
  });
  const productsSubtotal = productLines.reduce((s, v) => s + v, 0);

  const delivery = Number(order.deliveryFee || 0);
  const gst = Number(order.gst || 0);
  const care = Number(order.careProtection || 0);
  const repairWarranty = Number(order.repairWarranty || 0);
  const relocationWarranty = Number(order.relocationWarranty || 0);
  const deliveryPackaging = Number(order.deliveryPackaging || 0);
  const installationFee = Number(order.installationFee || 0);
  const platformFee = Number(order.platformFee || 0);
  const discount = Number(order.discountAmount || 0);

  const deposits = (order.products || []).reduce((s, l) => {
    const d = Number(l?.refundableDeposit || 0);
    return s + (d > 0 ? d : 0);
  }, 0);

  return (
    productsSubtotal +
    delivery +
    gst +
    care +
    repairWarranty +
    relocationWarranty +
    deliveryPackaging +
    installationFee +
    platformFee +
    deposits -
    discount
  );
}

/**
 * Classify an order+line pair so each line card knows what to render.
 * `line` may be null (order has no populated products).
 */
function classifyOrderLine(order, line) {
  // const st = normalizeStatus(order.status);
  const st = normalizeStatus(line?.lineStatus || order.status);
  // const st = normalizeStatus(
  //   order.status === 'cancelled'
  //     ? 'cancelled'
  //     : line?.lineStatus || order.status,
  // );

  // Resolve product from this specific line (fall back to order-level primary)
  const lineProduct =
    line && typeof line.product === 'object' ? line.product : null;
  const product = lineProduct ?? primaryProduct(order);

  // const start = order.createdAt ? new Date(order.createdAt) : new Date();
  // const unit = product
  //   ? resolveTenureUnit(order, product, order.rentalDuration)
  //   : order.tenureUnit === 'day'
  //     ? 'day'
  //     : 'month';
  // const leaseEnd = computeLeaseEnd(start, order.rentalDuration, unit);
  const start = order.createdAt ? new Date(order.createdAt) : new Date();
  // Use this line's own rentalDuration/tenureUnit when present (set by a
  // per-product tenure extension) instead of the shared order-level
  // values, so extending one product's tenure doesn't visually extend
  // any other product line in the same order.
  const lineDuration = Number(line?.rentalDuration ?? order.rentalDuration);
  const lineTenureUnit = line?.tenureUnit ?? order.tenureUnit;
  const orderForLine = {
    ...order,
    rentalDuration: lineDuration,
    tenureUnit: lineTenureUnit,
  };
  const unit = product
    ? resolveTenureUnit(orderForLine, product, lineDuration)
    : lineTenureUnit === 'day'
      ? 'day'
      : 'month';
  const leaseEnd = computeLeaseEnd(start, lineDuration, unit);
  const daysLeft = Math.ceil(
    (startOfDay(leaseEnd).getTime() - startOfDay(new Date()).getTime()) /
      86400000,
  );

  const isSell = line ? lineIsPurchase(line) : orderIsPurchase(order);

  if (st === 'cancelled') {
    return { kind: 'cancelled', leaseEnd, daysLeft, unit, product };
  }
  // if (st === 'completed') {
  //   if (isSell) {
  //     return {
  //       kind: 'delivered_purchase',
  //       purchasePhase: 'completed',
  //       leaseEnd,
  //       daysLeft,
  //       unit,
  //       product,
  //     };
  //   }
  //   return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
  // }
  // if (st === 'delivered') {
  if (st === 'completed') {
    if (isSell) {
      return {
        kind: 'delivered_purchase',
        purchasePhase: 'completed',
        leaseEnd,
        daysLeft,
        unit,
        product,
      };
    }
    return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
  }

  // Any relocation request (pending or confirmed) should surface in its
  // own tab regardless of the line's current status (processing,
  // dispatched, confirmed, delivered, etc.) — not just when delivered.
  const hasRelocationRequestAnyStatus =
    line && Boolean(line?.relocationRequest?.requestedAt);
  if (hasRelocationRequestAnyStatus) {
    return {
      kind: 'relocation_requested',
      leaseEnd,
      daysLeft,
      unit,
      product,
    };
  }

  if (st === 'delivered') {
    if (isSell) {
      return {
        kind: 'delivered_purchase',
        purchasePhase: 'delivered',
        leaseEnd,
        daysLeft,
        unit,
        product,
      };
    }

    // const lineHasReturn =
    //   line &&
    //   (() => {
    //     const s = String(line?.returnRequest?.status || '');
    //     return s === 'requested' || s === 'review_submitted';
    //   })();

    // if (lineHasReturn) {
    //   const isReturnDone = Boolean(line?.returnRequest?.refundInitiatedAt);
    //   if (isReturnDone) {
    //     return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
    //   }
    //   return { kind: 'pickup_scheduled', leaseEnd, daysLeft, unit, product };
    // }

    const lineHasReturn =
      line &&
      (() => {
        const s = String(line?.returnRequest?.status || '');
        return s === 'requested' || s === 'review_submitted';
      })();

    // If refund already initiated → return cycle fully closed = completed
    if (lineHasReturn) {
      const isReturnDone = Boolean(line?.returnRequest?.refundInitiatedAt);
      if (isReturnDone) {
        return { kind: 'completed_done', leaseEnd, daysLeft, unit, product };
      }
      return { kind: 'pickup_scheduled', leaseEnd, daysLeft, unit, product };
    }

    // Any relocation request (pending or confirmed) — surface it in its
    // own tab instead of the regular active-rental screen.
    // const hasRelocationRequest =
    //   line && Boolean(line?.relocationRequest?.requestedAt);
    // if (hasRelocationRequest) {
    //   return {
    //     kind: 'relocation_requested',
    //     leaseEnd,
    //     daysLeft,
    //     unit,
    //     product,
    //   };
    // }
    if (!lineProduct) {
      return {
        kind: 'rental_missing_catalog',
        leaseEnd,
        daysLeft,
        unit,
        product,
      };
    }
    return { kind: 'delivered_rental', leaseEnd, daysLeft, unit, product };
  }
  if (st === 'shipped') {
    return { kind: 'shipped', leaseEnd, daysLeft, unit, product };
  }
  return { kind: 'processing', leaseEnd, daysLeft, unit, product };
}

// ─── tab helpers ─────────────────────────────────────────────────────────────

/**
 * Returns all (order, line) pairs that belong to a given tab.
 * Each populated line becomes its own row.
 */
function buildLineRows(orders, tab) {
  const rows = [];

  for (const order of orders) {
    const lines = orderProductLines(order);

    if (!lines.length) {
      // No populated lines — show as single placeholder row on 'all'
      if (tab === 'all') {
        rows.push({ order, line: null, key: `${order._id}-null` });
      }
      continue;
    }

    // for (let idx = 0; idx < lines.length; idx++) {
    //   const line = lines[idx];
    //   // const meta = classifyOrderLine(order, line);
    //   const meta = classifyOrderLine(order, line);
    //   // console.log('LINE FIELDS:', JSON.stringify(line, null, 2));
    //   // console.log('FULL ORDER:', JSON.stringify(order, null, 2));

    //   // Tab membership per line
    //   // const inTab = (() => {
    //   //   if (tab === 'all') return true;
    //   //   if (tab === 'cancelled') return meta.kind === 'cancelled';
    //   //   if (tab === 'delivered')
    //   //     return (
    //   //       meta.kind === 'completed_done' || meta.kind === 'delivered_purchase'
    //   //     );
    //   //   if (tab === 'active_rentals') return meta.kind === 'active_rental';
    //   //   if (tab === 'services') return false;
    //   //   return true;
    //   // })();
    //   const inTab = (() => {
    //     if (tab === 'all') return true;
    //     if (tab === 'cancelled') return meta.kind === 'cancelled';
    //     if (tab === 'delivered')
    //       return (
    //         meta.kind === 'completed_done' || meta.kind === 'delivered_purchase'
    //       );
    //     if (tab === 'processing') return meta.kind === 'processing';
    //     if (tab === 'dispatched') return meta.kind === 'shipped';
    //     if (tab === 'services') return false;
    //     return true;
    //   })();

    //   if (!inTab) continue;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      // const meta = classifyOrderLine(order, line);
      const meta = classifyOrderLine(order, line);
      // console.log('LINE FIELDS:', JSON.stringify(line, null, 2));
      // console.log('FULL ORDER:', JSON.stringify(order, null, 2));

      // Active rentals get their own dedicated screen (Rental Command
      // Center) — never show them on the Orders page, in any tab.
      if (meta.kind === 'active_rental') continue;

      // Tab membership per line
      // const inTab = (() => {
      //   if (tab === 'all') return true;
      //   if (tab === 'cancelled') return meta.kind === 'cancelled';
      //   if (tab === 'delivered')
      //     return (
      //       meta.kind === 'completed_done' || meta.kind === 'delivered_purchase'
      //     );
      //   if (tab === 'processing') return meta.kind === 'processing';
      //   if (tab === 'dispatched') return meta.kind === 'shipped';
      //   if (tab === 'services') return false;
      //   return true;
      // })();
      // const inTab = (() => {
      //   if (tab === 'all') return true;
      //   if (tab === 'cancelled') return meta.kind === 'cancelled';
      //   if (tab === 'delivered')
      //     return (
      //       meta.kind === 'delivered_purchase' &&
      //       meta.purchasePhase !== 'completed'
      //     );
      //   if (tab === 'completed')
      //     return (
      //       meta.kind === 'completed_done' ||
      //       (meta.kind === 'delivered_purchase' &&
      //         meta.purchasePhase === 'completed')
      //     );
      //   if (tab === 'processing') return meta.kind === 'processing';
      //   if (tab === 'dispatched') return meta.kind === 'shipped';
      //   if (tab === 'services') return false;
      //   return true;
      // })();
      const inTab = (() => {
        if (tab === 'all') return true;
        if (tab === 'cancelled') return meta.kind === 'cancelled';
        if (tab === 'pickup') return meta.kind === 'pickup_scheduled';
        if (tab === 'relocate') return meta.kind === 'relocation_requested';
        if (tab === 'delivered')
          return (
            (meta.kind === 'delivered_purchase' &&
              meta.purchasePhase !== 'completed') ||
            meta.kind === 'delivered_rental'
          );
        if (tab === 'completed')
          return (
            meta.kind === 'completed_done' ||
            (meta.kind === 'delivered_purchase' &&
              meta.purchasePhase === 'completed')
          );
        if (tab === 'processing') return meta.kind === 'processing';
        if (tab === 'dispatched') return meta.kind === 'shipped';
        if (tab === 'services') return false;
        return true;
      })();

      if (!inTab) continue;
      rows.push({
        order,
        line,
        key: `${order._id}-${idx}`,
        isFirstOfOrder: idx === 0,
      });
    }
  }

  return rows;
}

function getProductDetailHref(order, line) {
  const p =
    line?.product && typeof line.product === 'object' ? line.product : null;
  if (!p?._id) return null;
  const lineType = String(line?.productType || p?.type || '').toLowerCase();
  if (lineType === 'sell') return `/buy-product-details/${p._id}`;
  if (lineType === 'service') return `/service/${p._id}`;
  return `/rent-product-details/${p._id}`;
}

// function tabCounts(orders) {
//   const c = {
//     all: 0,
//     active_rentals: 0,
//     delivered: 0,
//     services: 0,
//     cancelled: 0,
//   };
//   for (const o of orders) {
//     const lines = orderProductLines(o);
//     if (!lines.length) {
//       c.all += 1;
//       continue;
//     }
//     for (const line of lines) {
//       const meta = classifyOrderLine(o, line);
//       c.all += 1;
//       if (meta.kind === 'cancelled') c.cancelled += 1;
//       if (meta.kind === 'completed_done' || meta.kind === 'delivered_purchase')
//         c.delivered += 1;
//       if (meta.kind === 'active_rental') c.active_rentals += 1;
//     }
//   }
//   return c;
// }

// function tabCounts(orders) {
//   const c = {
//     all: 0,
//     processing: 0,
//     dispatched: 0,
//     delivered: 0,
//     services: 0,
//     cancelled: 0,
//   };
//   for (const o of orders) {
//     const lines = orderProductLines(o);
//     if (!lines.length) {
//       c.all += 1;
//       continue;
//     }
//     for (const line of lines) {
//       const meta = classifyOrderLine(o, line);
//       // Active rentals are handled on a separate screen — excluded from
//       // every Orders-page count, including "All".
//       if (meta.kind === 'active_rental') continue;
//       c.all += 1;
//       if (meta.kind === 'cancelled') c.cancelled += 1;
//       if (meta.kind === 'completed_done' || meta.kind === 'delivered_purchase')
//         c.delivered += 1;
//       if (meta.kind === 'processing') c.processing += 1;
//       if (meta.kind === 'shipped') c.dispatched += 1;
//     }
//   }
//   return c;
// }

// function tabCounts(orders) {
//   const c = {
//     all: 0,
//     processing: 0,
//     dispatched: 0,
//     delivered: 0,
//     services: 0,
//     completed: 0,
//     cancelled: 0,
//   };
//   for (const o of orders) {
//     const lines = orderProductLines(o);
//     if (!lines.length) {
//       c.all += 1;
//       continue;
//     }
//     for (const line of lines) {
//       const meta = classifyOrderLine(o, line);
//       // Active rentals are handled on a separate screen — excluded from
//       // every Orders-page count, including "All".
//       if (meta.kind === 'active_rental') continue;
//       c.all += 1;
//       if (meta.kind === 'cancelled') c.cancelled += 1;
//       if (
//         meta.kind === 'delivered_purchase' &&
//         meta.purchasePhase !== 'completed'
//       ) {
//         c.delivered += 1;
//       }
//       if (
//         meta.kind === 'completed_done' ||
//         (meta.kind === 'delivered_purchase' &&
//           meta.purchasePhase === 'completed')
//       ) {
//         c.completed += 1;
//       }
//       if (meta.kind === 'processing') c.processing += 1;
//       if (meta.kind === 'shipped') c.dispatched += 1;
//     }
//   }
//   return c;
// }

function tabCounts(orders) {
  const c = {
    all: 0,
    processing: 0,
    dispatched: 0,
    delivered: 0,
    services: 0,
    completed: 0,
    cancelled: 0,
    pickup: 0,
    relocate: 0,
  };
  for (const o of orders) {
    const lines = orderProductLines(o);
    if (!lines.length) {
      c.all += 1;
      continue;
    }
    for (const line of lines) {
      const meta = classifyOrderLine(o, line);
      // Active rentals are handled on a separate screen — excluded from
      // every Orders-page count, including "All".
      if (meta.kind === 'active_rental') continue;
      c.all += 1;
      if (meta.kind === 'cancelled') c.cancelled += 1;
      if (meta.kind === 'pickup_scheduled') c.pickup += 1;
      if (meta.kind === 'relocation_requested') c.relocate += 1;
      if (
        (meta.kind === 'delivered_purchase' &&
          meta.purchasePhase !== 'completed') ||
        meta.kind === 'delivered_rental'
      ) {
        c.delivered += 1;
      }
      if (
        meta.kind === 'completed_done' ||
        (meta.kind === 'delivered_purchase' &&
          meta.purchasePhase === 'completed')
      ) {
        c.completed += 1;
      }
      if (meta.kind === 'processing') c.processing += 1;
      if (meta.kind === 'shipped') c.dispatched += 1;
    }
  }
  return c;
}

// ─── expected delivery ───────────────────────────────────────────────────────

function expectedDeliveryDate(order, lineProduct) {
  const product = lineProduct ?? primaryProduct(order);
  const lv = product?.logisticsVerification || {};
  const timelineValue = Number(lv.deliveryTimelineValue);
  const timelineUnit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();

  const d = order.vendorFulfillment?.markedShippedAt
    ? new Date(order.vendorFulfillment.markedShippedAt)
    : order.createdAt
      ? new Date(order.createdAt)
      : new Date();

  if (Number.isFinite(timelineValue) && timelineValue > 0) {
    if (timelineUnit === 'hours') d.setHours(d.getHours() + timelineValue);
    else d.setDate(d.getDate() + timelineValue);
  } else {
    d.setDate(d.getDate() + 7);
  }
  return formatOrderDate(d);
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function MyOrders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshKey = searchParams.get('refresh');
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  // const [tab, setTab] = useState('all');
  const [tab, setTab] = useState('processing');

  const [page, setPage] = useState(1);
  const [returnPrompt, setReturnPrompt] = useState({
    open: false,
    orderId: '',
    orderRef: '',
    productId: '',
    title: '',
    image: '',
    cycleRent: 0,
    cycleUnit: 'month',
    startedOn: '',
    totalTenure: '',
    totalTenureLabel: 'Total Months',
    cycleEnds: '',
  });

  const [reviewModal, setReviewModal] = useState({
    open: false,
    productId: '',
    orderId: '',
    productName: '',
    image: '',
    existingReview: null,
  });
  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    product: null,
    booking: null,
  });

  const [serviceReviewModal, setServiceReviewModal] = useState({
    open: false,
    serviceProductId: '',
    bookingId: '',
    serviceName: '',
    image: '',
    vendorName: '',
    existingReview: null,
  });

  const [cancelModal, setCancelModal] = useState({
    open: false,
    booking: null,
  });

  const [payAfterServiceReceipt, setPayAfterServiceReceipt] = useState({
    open: false,
    data: null,
  });

  useEffect(() => {
    function fetchOrders() {
      setLoading(true);
      setError('');
      Promise.all([apiGetMyOrders(), apiGetMyBookings()])
        .then(([ordersRes, bookingsRes]) => {
          setOrders(ordersRes.data || []);
          setBookings(bookingsRes.data || []);
        })
        .catch((err) => {
          setOrders([]);
          setBookings([]);
          setError(err.response?.data?.message || 'Failed to load orders.');
        })
        .finally(() => setLoading(false));
    }

    fetchOrders();
  }, [refreshKey]);

  const counts = useMemo(() => {
    const base = tabCounts(orders);
    return { ...base, services: bookings.length };
  }, [orders, bookings.length]);

  const serviceRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = bookings || [];
    if (!q) return rows;
    return rows.filter((booking) => {
      const title = String(
        booking?.serviceSnapshot?.productName ||
          booking?.serviceProduct?.productName ||
          '',
      ).toLowerCase();
      return (
        String(booking?._id || '')
          .toLowerCase()
          .includes(q) || title.includes(q)
      );
    });
  }, [bookings, query]);

  // Build all rows then filter by search query
  const allLineRows = useMemo(() => buildLineRows(orders, tab), [orders, tab]);

  const lineRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allLineRows;
    return allLineRows.filter(({ order, line }) => {
      const id = String(order._id || '').toLowerCase();
      const shortId = orderDisplayId(order).toLowerCase();
      const p = line?.product;
      const title = String(p?.productName || p?.title || '').toLowerCase();
      return id.includes(q) || shortId.includes(q) || title.includes(q);
    });
  }, [allLineRows, query]);

  const totalPages = Math.max(1, Math.ceil(lineRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = lineRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [tab, query]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // const tabs = [
  //   { id: 'all', label: 'All', count: counts.all },
  //   {
  //     id: 'active_rentals',
  //     label: 'Active Rentals',
  //     count: counts.active_rentals,
  //   },
  //   { id: 'delivered', label: 'Delivered', count: counts.delivered },
  //   { id: 'services', label: 'Services', count: counts.services },
  //   { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  // ];
  // const tabs = [
  //   // { id: 'all', label: 'All', count: counts.all },
  //   { id: 'processing', label: 'Processing', count: counts.processing },
  //   { id: 'dispatched', label: 'Dispatched', count: counts.dispatched },
  //   { id: 'delivered', label: 'Delivered', count: counts.delivered },
  //   { id: 'services', label: 'Services', count: counts.services },
  //   { id: 'completed', label: 'Completed', count: counts.completed },
  //   { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  // ];

  const tabs = [
    // { id: 'all', label: 'All', count: counts.all },
    { id: 'processing', label: 'Processing', count: counts.processing },
    { id: 'dispatched', label: 'Dispatched', count: counts.dispatched },
    { id: 'delivered', label: 'Delivered', count: counts.delivered },
    { id: 'pickup', label: 'Pickup', count: counts.pickup },
    { id: 'relocate', label: 'Relocate', count: counts.relocate },
    { id: 'services', label: 'Services', count: counts.services },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const pageNumbers = useMemo(() => {
    const n = totalPages;
    if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
    const cur = safePage;
    const set = new Set([1, n, cur, cur - 1, cur + 1]);
    return Array.from(set)
      .filter((x) => x >= 1 && x <= n)
      .sort((a, b) => a - b);
  }, [totalPages, safePage]);

  return (
    // <div className="w-full max-w-full overflow-x-hidden -m-4 sm:-m-6 rounded-b-2xl  py-6 px-4 sm:px-6 pb-10">
    // <div className="w-full max-w-full overflow-x-hidden -m-4 sm:-m-6 rounded-b-2xl py-6 px-4 sm:px-6 pb-10 box-border">
    //   <div className="w-full min-w-0">
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full min-w-0 px-2 pt-1 sm:pt-1.5 pb-10 sm:px-4">
        <h1 className="text-xl  font-bold text-black tracking-tight">
          My Orders
        </h1>

        <div className="mt-6 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Item"
            className="w-full outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
        </div>
        <div
          className="mt-4 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-4 px-4 sm:-mx-1 sm:px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? `${ORANGE} text-white shadow-sm`
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t.label}
                <span
                  className={`min-w-[1.5rem] h-6 px-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#FF6F00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="mt-6 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-4">
            {error}
          </div>
        ) : tab === 'services' ? (
          serviceRows.length === 0 ? (
            <div className="mt-10 text-center rounded-xl border border-dashed border-gray-300 bg-white/80 py-14 px-4">
              <p className="text-gray-700 font-medium">
                No service in this view
              </p>
              {/* <p className="text-sm text-gray-500 mt-2">
                Try another search or filter.
              </p> */}
            </div>
          ) : (
            <ul className="mt-8 space-y-5">
              {serviceRows.map((booking) => (
                <ServiceBookingCard
                  key={booking._id}
                  booking={booking}
                  onReschedule={(data) =>
                    setRescheduleModal({ open: true, ...data })
                  }
                  // onOpenServiceReview={(payload) =>
                  //   setServiceReviewModal({
                  //     open: true,
                  //     ...payload,
                  //     existingReview: null,
                  //   })
                  // }

                  onOpenServiceReview={async (payload) => {
                    if (!payload.serviceProductId) return;
                    try {
                      const res = await apiGetMyServiceReview(
                        String(payload.serviceProductId),
                      );
                      setServiceReviewModal({
                        open: true,
                        ...payload,
                        existingReview: res.data?.exists
                          ? res.data.review
                          : null,
                      });
                    } catch {
                      setServiceReviewModal({
                        open: true,
                        ...payload,
                        existingReview: null,
                      });
                    }
                  }}
                  // onCancel={async (id) => {
                  //   if (!confirm('Cancel this booking?')) return;
                  //   try {
                  //     await apiCancelMyBooking(id);
                  //     const res = await apiGetMyBookings();
                  //     setBookings(res.data || []);
                  //   } catch (err) {
                  //     alert(err?.response?.data?.message || 'Cancel failed');
                  //   }
                  // }}
                  onCancel={(booking) =>
                    setCancelModal({ open: true, booking })
                  }
                  onPaid={async () => {
                    const res = await apiGetMyBookings();
                    setBookings(res.data || []);
                  }}
                  onShowReceipt={(data) =>
                    setPayAfterServiceReceipt({ open: true, data })
                  }
                />
              ))}
            </ul>
          )
        ) : lineRows.length === 0 ? (
          <div className="mt-10 text-center py-14">
            <p className="text-gray-600 font-medium">No orders in this view</p>
            <p className="text-sm text-gray-500 mt-2">
              {query
                ? 'Try another search or filter.'
                : 'Browse rentals and place an order.'}
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-5">
              {pageSlice.map(({ order, line, key, isFirstOfOrder }) => (
                <LineCard
                  key={key}
                  order={order}
                  line={line}
                  isFirstOfOrder={isFirstOfOrder}
                  onOpenReturnPrompt={(payload) =>
                    setReturnPrompt({ open: true, ...payload })
                  }
                  // onOpenReview={(payload) =>
                  //   setReviewModal({ open: true, ...payload })
                  // }
                  onOpenReview={async (payload) => {
                    try {
                      const res = await apiGetMyReview(
                        payload.productId,
                        payload.orderId,
                      );

                      setReviewModal({
                        open: true,
                        ...payload,
                        existingReview: res.data.exists
                          ? res.data.review
                          : null,
                      });
                    } catch {
                      setReviewModal({
                        open: true,
                        ...payload,
                        existingReview: null,
                      });
                    }
                  }}
                />
              ))}
            </ul>

            {totalPages > 1 ? (
              <nav
                className="mt-10 flex items-center justify-center gap-4"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-orange-300 text-orange-600  ${ORANGE1} hover:text-white  disabled:opacity-40 disabled:pointer-events-none`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div
                  className={`min-w-[2.5rem] h-10 px-4 rounded-full text-sm font-semibold flex items-center justify-center ${ORANGE} text-white shadow`}
                >
                  {safePage}
                </div>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`w-10 h-10 rounded-full  flex items-center justify-center border-2 border-orange-300 text-orange-600 ${ORANGE1} hover:text-white  disabled:opacity-40 disabled:pointer-events-none`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            ) : null}
          </>
        )}
        {/* Return prompt modal */}
        {returnPrompt.open && typeof document !== 'undefined'
          ? createPortal(
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
                onClick={() =>
                  setReturnPrompt((prev) => ({ ...prev, open: false }))
                }
              >
                <div
                  className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-3" />
                  <div className="mt-4 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {returnPrompt.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={returnPrompt.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-black">
                          {returnPrompt.title}
                        </p>
                        <div className="mt-0.5 inline-flex items-center gap-2">
                          <p className="text-xs text-[#008236] font-semibold inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5">
                            Active Rental
                          </p>
                          <span className="text-xs text-gray-500">
                            Order #{returnPrompt.orderRef}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 border border-gray-200 bg-[#F9FAFB] rounded-lg p-3 text-sm text-gray-700 space-y-1.5">
                      <p className="flex justify-between gap-3">
                        <span>Total:</span>
                        <span className="font-medium">
                          ₹{formatMoney(returnPrompt.cycleRent)}
                          {/* {returnPrompt.cycleUnit === 'day' ? 'day' : 'month'} */}
                        </span>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span>Started:</span>
                        <span className="font-medium">
                          {returnPrompt.startedOn}
                        </span>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span>{returnPrompt.totalTenureLabel}:</span>
                        <span className="font-medium">
                          {returnPrompt.totalTenure}
                        </span>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span>Cycle Ends:</span>
                        <span className="font-semibold text-[#F97316]">
                          {returnPrompt.cycleEnds}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      // my-account?tab=manage-rental-items
                      // const next = `/my-rentals?openReturn=1&orderId=${encodeURIComponent(returnPrompt.orderId)}&productId=${encodeURIComponent(returnPrompt.productId)}`;
                      // const next = `/my-account?tab=orders&openReturn=1&orderId=${encodeURIComponent(returnPrompt.orderId)}&productId=${encodeURIComponent(returnPrompt.productId)}`;
                      // const next = `/?openReturn=1&orderId=${encodeURIComponent(returnPrompt.orderId)}&productId=${encodeURIComponent(returnPrompt.productId)}`;
                      const next = `/my-account?tab=manage-rental-items`;

                      setReturnPrompt((prev) => ({ ...prev, open: false }));
                      router.push(next);
                    }}
                    className="mt-5 w-full rounded-xl border border-[#F97316] bg-white py-3 text-sm font-semibold text-[#F97316] hover:bg-orange-50"
                  >
                    End Tenancy / Return Item
                  </button>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#64748B] text-center">
                    <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>
                      Rent cycle ends on{' '}
                      <span className="font-semibold text-black">
                        {returnPrompt.cycleEnds}
                      </span>
                      . Schedule your return pickup now.
                    </span>
                  </p>
                </div>
              </div>,
              document.body,
            )
          : null}

        {/* <ReviewModal
          open={reviewModal.open}
          productId={reviewModal.productId}
          orderId={reviewModal.orderId}
          productName={reviewModal.productName}
          image={reviewModal.image}
          existingReview={reviewModal.existingReview}
          onClose={() =>
            setReviewModal({
              open: false,
              productId: '',
              orderId: '',
              productName: '',
              image: '',
            })
          }
        /> */}

        {cancelModal.open && cancelModal.booking && (
          <CancelConfirmModal
            booking={cancelModal.booking}
            onClose={() => setCancelModal({ open: false, booking: null })}
            onConfirm={async () => {
              try {
                await apiCancelMyBooking(cancelModal.booking._id);
                const res = await apiGetMyBookings();
                setBookings(res.data || []);
              } catch (err) {
                alert(err?.response?.data?.message || 'Cancel failed');
              } finally {
                setCancelModal({ open: false, booking: null });
              }
            }}
          />
        )}

        <ReviewModal
          open={reviewModal.open}
          productId={reviewModal.productId}
          orderId={reviewModal.orderId}
          productName={reviewModal.productName}
          image={reviewModal.image}
          existingReview={reviewModal.existingReview}
          onSuccess={async () => {
            const res = await apiGetMyOrders();
            setOrders(res.data); // refresh orders
          }}
          onClose={() =>
            setReviewModal({
              open: false,
              productId: '',
              orderId: '',
              productName: '',
              image: '',
              existingReview: null,
            })
          }
        />

        <ServiceReviewModal
          open={serviceReviewModal.open}
          serviceProductId={serviceReviewModal.serviceProductId}
          bookingId={serviceReviewModal.bookingId}
          serviceName={serviceReviewModal.serviceName}
          image={serviceReviewModal.image}
          vendorName={serviceReviewModal.vendorName}
          existingReview={serviceReviewModal.existingReview}
          onClose={() =>
            setServiceReviewModal({
              open: false,
              serviceProductId: '',
              bookingId: '',
              serviceName: '',
              image: '',
              vendorName: '',
              existingReview: null,
            })
          }
          onSuccess={async () => {
            const res = await apiGetMyBookings();
            setBookings(res.data || []);
          }}
        />
        {payAfterServiceReceipt.open && payAfterServiceReceipt.data && (
          <ServiceReceiptModal
            data={payAfterServiceReceipt.data}
            onClose={() =>
              setPayAfterServiceReceipt({ open: false, data: null })
            }
          />
        )}
        {rescheduleModal.open && (
          <BookingModal
            isOpen={rescheduleModal.open}
            product={rescheduleModal.product}
            existingBooking={rescheduleModal.booking}
            mode="reschedule"
            onClose={() =>
              setRescheduleModal({
                open: false,
                product: null,
                booking: null,
              })
            }
          />
        )}
      </div>
    </div>
  );
}

// ─── Single line card ─────────────────────────────────────────────────────────

/**
 * Renders ONE product line as its own self-contained order card.
 * The order header (ID, date) is shown on every card so the user
 * knows which order each item belongs to.
 */
// ─── Order Summary Accordion ──────────────────────────────────────────────────
function OrderSummaryAccordion({ order }) {
  const [open, setOpen] = useState(false);

  // const delivery = Number(order.deliveryFee || 0);
  // const gst = Number(order.gst || 0);
  // const deposit = Number(order.refundableDeposit || 0);
  // const care = Number(order.careProtection || 0);
  // const discount = Number(order.discountAmount || 0);
  // const total = Number(order.totalAmount || 0);
  const delivery = Number(order.deliveryFee || 0);
  const gst = Number(order.gst || 0);
  const deposit = Number(order.refundableDeposit || 0);
  const care = Number(order.careProtection || 0);
  const repairWarranty = Number(order.repairWarranty || 0);
  const relocationWarranty = Number(order.relocationWarranty || 0);
  const deliveryPackaging = Number(order.deliveryPackaging || 0);
  const installationFee = Number(order.installationFee || 0);
  const platformFee = Number(order.platformFee || 0);
  const discount = Number(order.discountAmount || 0);
  const total = Number(order.totalAmount || 0);

  // Build per-product lines from order.products
  // const productLines = (order.products || []).map((line) => {
  //   const p = line?.product;
  //   const name =
  //     (p && typeof p === 'object' ? p.productName || p.title : null) ||
  //     line?.variantName ||
  //     'Product';
  //   const unitPrice = Number(line?.pricePerDay || line?.price || 0);
  //   const qty = Number(line?.quantity || 1);
  //   const lineTotal = unitPrice * qty;
  //   const isSell = String(line?.productType || '').toLowerCase() === 'sell';
  //   return {
  //     name,
  //     unitPrice,
  //     qty,
  //     lineTotal,
  //     isSell,
  //     variantName: line?.variantName || '',
  //   };
  // });

  // Build per-product lines from order.products
  const productLines = (order.products || []).map((line) => {
    const p = line?.product;
    const name =
      (p && typeof p === 'object' ? p.productName || p.title : null) ||
      line?.variantName ||
      'Product';
    const unitPrice = Number(line?.pricePerDay || line?.price || 0);
    const qty = Number(line?.quantity || 1);
    const isSell = String(line?.productType || '').toLowerCase() === 'sell';
    const lineIsDayRental =
      !isSell && String(order?.tenureUnit || 'month').toLowerCase() === 'day';
    // For monthly rentals, unitPrice/pricePerDay stores the FULL tenure
    // total for this line — show only the per-month price here to match
    // the order card and payment page (which bill one month at a time).
    // const lineTotalFull = unitPrice * qty;
    // const lineTotal =
    //   !isSell && !lineIsDayRental
    //     ? Math.round(
    //         lineTotalFull / Math.max(1, Number(order?.rentalDuration || 1)),
    //       )
    //     : lineTotalFull;
    // pricePerDay already stores the per-month rent for monthly rentals,
    // so use it directly — don't divide by rentalDuration.
    const lineTotal = unitPrice * qty;
    return {
      name,
      unitPrice,
      qty,
      lineTotal,
      isSell,
      isMonthlyRental: !isSell && !lineIsDayRental,
      variantName: line?.variantName || '',
    };
  });

  const productsSubtotal = productLines.reduce((s, l) => s + l.lineTotal, 0);

  // Per-product refundable deposits for rental lines
  const rentalDeposits = (order.products || [])
    .filter((line) => {
      const lineType = String(line?.productType || '').toLowerCase();
      if (lineType === 'sell') return false;
      const dep = Number(line?.refundableDeposit || 0);
      return dep > 0;
    })
    .map((line) => {
      const p = line?.product;
      const name =
        (p && typeof p === 'object' ? p.productName || p.title : null) ||
        line?.variantName ||
        'Product';
      return {
        label: `Refundable Deposit — ${name}`,
        value: Number(line.refundableDeposit),
      };
    });

  // const feeRows = [
  //   delivery > 0 && { label: 'Delivery Fee', value: delivery, color: '' },
  //   gst > 0 && { label: 'GST', value: gst, color: '' },
  //   care > 0 && { label: 'Care & Protection', value: care, color: '' },
  //   discount > 0 && {
  //     label: 'Discount',
  //     value: -discount,
  //     color: 'text-emerald-600',
  //   },
  //   // rental deposits inserted per-product below
  // ].filter(Boolean);
  const feeRows = [
    delivery > 0 && { label: 'Delivery Fee', value: delivery, color: '' },
    gst > 0 && { label: 'GST', value: gst, color: '' },
    care > 0 && { label: 'Care & Protection', value: care, color: '' },
    repairWarranty > 0 && {
      label: 'Repair & Warranty',
      value: repairWarranty,
      color: '',
    },
    relocationWarranty > 0 && {
      label: 'Relocation Warranty',
      value: relocationWarranty,
      color: '',
    },
    deliveryPackaging > 0 && {
      label: 'Delivery & Packaging',
      value: deliveryPackaging,
      color: '',
    },
    installationFee > 0 && {
      label: 'Installation Fee',
      value: installationFee,
      color: '',
    },
    platformFee > 0 && {
      label: 'Platform Fee',
      value: platformFee,
      color: '',
    },
    discount > 0 && {
      label: 'Discount',
      value: -discount,
      color: 'text-emerald-600',
    },
    // rental deposits inserted per-product below
  ].filter(Boolean);

  return (
    <div className="border-t border-gray-100 mx-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 14l-4-4 4-4M5 10h14M15 14l4-4-4-4"
            />
          </svg>
          Order Summary
          {productLines.length > 1 && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
              {productLines.length} items
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="pb-3 space-y-1 text-sm">
          {/* ── Products breakdown ── */}
          {productLines.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 space-y-1.5">
              {productLines.map((line, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 leading-snug flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-800">
                        {line.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white shrink-0 ${
                          line.isSell ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                      >
                        {line.isSell ? 'Buy' : 'Rent'}
                      </span>
                    </span>
                    {(line.variantName || line.qty > 1) && (
                      <span className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {line.variantName && (
                          <span className="text-[11px] text-gray-400 border border-gray-200 bg-gray-50 px-1.5 py-0.5 rounded-full">
                            {line.variantName}
                          </span>
                        )}
                        {line.qty > 1 && (
                          <span className="text-[11px] text-gray-400">
                            × {line.qty}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                  {/* <span className="font-semibold text-gray-800 shrink-0">
                    ₹{formatMoney(line.lineTotal)}
                  </span>
                </div>
              ))} */}
                  {/* <span className="font-semibold text-gray-800 shrink-0">
                    ₹{formatMoney(line.lineTotal)}
                    {line.isMonthlyRental ? (
                      <span className="text-[10px] font-medium text-gray-400 ml-0.5">
                        /mo
                      </span>
                    ) : null}
                  </span> */}
                  <span className="font-semibold text-gray-800 shrink-0">
                    ₹{formatMoney(line.lineTotal)}
                    <span className="text-[10px] font-medium text-gray-400 ml-0.5">
                      {line.isMonthlyRental ? '/mo' : '/-'}
                    </span>
                  </span>
                </div>
              ))}

              {/* Products subtotal — only show if there are fees below */}
              {feeRows.length > 0 && (
                <div className="flex justify-between items-center pt-1.5 mt-1 border-t border-gray-200">
                  <span className="text-gray-500">Products Total</span>
                  <span className="font-semibold text-gray-800">
                    ₹{formatMoney(productsSubtotal)}/-
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Fee rows ── */}
          {/* {feeRows.map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500">{label}</span>
              <span className={`font-semibold ${color || 'text-gray-800'}`}>
                {value < 0 ? '− ' : ''}₹{formatMoney(Math.abs(value))}
              </span>
            </div>
          ))} */}
          {feeRows.map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500">{label}</span>
              <span className={`font-semibold ${color || 'text-gray-800'}`}>
                {value < 0 ? '− ' : ''}₹{formatMoney(Math.abs(value))}/-
              </span>
            </div>
          ))}
          {/* ── Per-product refundable deposits ── */}
          {rentalDeposits.length > 0 && (
            <div className="mt-1">
              <p className="text-gray-500  mb-1">Refundable Deposit</p>
              <div className="space-y-1.5 pl-2 border-l-2 border-blue-100">
                {rentalDeposits.map(({ label, value }, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center gap-2"
                  >
                    <span className="flex flex-col min-w-0">
                      <span className="text-xs text-blue-600 truncate">
                        {label.replace('Refundable Deposit — ', '')}
                      </span>
                    </span>
                    {/* <span className="font-semibold text-blue-600 shrink-0">
                      ₹{formatMoney(value)}
                    </span> */}
                    <span className="font-semibold text-blue-600 shrink-0">
                      ₹{formatMoney(value)}/-
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ── Grand total ── */}
          <div className="pt-2 mt-1 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-black">Total Paid</span>
            {/* <span className="font-bold text-[#FF6F00] text-base">
              ₹{formatMoney(total)}
            </span> */}
            <span className="font-bold text-[#FF6F00] text-base">
              ₹{formatMoney(total)}/-
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
function LineCard({ order, line, onOpenReturnPrompt, onOpenReview }) {
  const router = useRouter();
  const meta = classifyOrderLine(order, line);
  const oid = orderDisplayId(order);
  const placed = formatOrderDate(order.createdAt);

  // Product info from this line
  // const p =
  //   line?.product && typeof line.product === 'object' ? line.product : null;
  // const img = productImageUrl(p?.image || '');
  // const title = p?.productName || p?.title || 'Item';

  const p =
    line?.product && typeof line.product === 'object' ? line.product : null;
  // resolve variant-specific image and name
  const variantName = line?.variantName || '';
  const variantImg = (() => {
    if (!variantName || !p) return null;
    // Find the matching variant in product.variants by variantId or variantName
    const variants = Array.isArray(p?.variants) ? p.variants : [];
    const matchedVariant = variants.find(
      (v) =>
        String(v?._id || '') === String(line?.variantId || '') ||
        String(v?.variantName || '') === variantName,
    );
    if (!matchedVariant) return null;
    // Variant-specific image: find index of this variant and slice product images
    const variantIdx = variants.indexOf(matchedVariant);
    const allImgs = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
    if (allImgs.length > 1 && variants.length > 1) {
      const perVariant = Math.ceil(allImgs.length / variants.length);
      const start = variantIdx * perVariant;
      const slice = allImgs.slice(start, start + perVariant);
      return slice[0] || null;
    }
    return null;
  })();

  const img = productImageUrl(variantImg || p?.image || ''); //  variant image first
  const title = p?.productName || p?.title || 'Item';
  const detailHref = getProductDetailHref(order, line);

  const isSell = line ? lineIsPurchase(line) : false;
  const qty = Number(line?.quantity || 1);
  // const linePrice = line ? Number(line.pricePerDay || 0) : 0;
  const linePrice = line
    ? Number(line.pricePerDay || 0) * Number(line.quantity || 1)
    : 0;
  const unit = meta.unit;
  const priceSuffix = '';

  // Per-line rent for active rentals
  const lineRent = line ? Number(line.pricePerDay || 0) : 0;

  // Must be defined before any early returns (used in cancelled card too)
  const procLabel =
    normalizeStatus(line?.lineStatus || order.status) === 'confirmed'
      ? 'Confirmed'
      : 'Processing';

  // console.log('ORDER FIELDS:', {
  //   totalAmount: order?.totalAmount,
  //   grandTotal: order?.grandTotal,
  //   total: order?.total,
  //   paidAmount: order?.paidAmount,
  //   orderTotal: order?.orderTotal,
  //   allKeys: Object.keys(order || {}),
  // });
  // const orderTotal = Number(order?.totalAmount ?? order?.grandTotal ?? 0);
  // const displayPrice = orderTotal > 0 ? orderTotal : linePrice;
  // Sum price from line items since order has no top-level price field
  // const lineTotal = (() => {
  //   if (line) {
  //     const qty = Number(line.quantity || 1);
  //     const unitPrice = Number(
  //       line.pricePerDay || line.price || line.unitPrice || 0,
  //     );
  //     return unitPrice * qty;
  //   }
  //   return 0;
  // })();

  // const orderTotal = Number(
  //   order?.totalAmount ??
  //     order?.grandTotal ??
  //     order?.total ??
  //     order?.paidAmount ??
  //     0,
  // );
  // // const displayPrice =
  // //   orderTotal > 0 ? orderTotal : lineTotal > 0 ? lineTotal : linePrice;
  // const displayPrice =
  //   Number(order?.totalAmount || 0) > 0
  //     ? Number(order.totalAmount)
  //     : Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
  // Per-product price only — never show order-level total on a line card.
  // The order total (including delivery, GST, deposit) belongs in an
  // order-summary view, not repeated on every product card.
  // const displayPrice =
  //   Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
  // const displayPrice =
  //   Number(order?.totalAmount || 0) > 0
  //     ? Number(order.totalAmount)
  //     : Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);
  const displayPrice =
    orderProductOnlyTotal(order) > 0
      ? orderProductOnlyTotal(order)
      : Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);

  // For active monthly rentals, the stored line price is the FULL tenure
  // total (e.g. ₹450 for a 3-month tenure at ₹150/month). The active
  // rental card should show only the per-month price, matching what the
  // payment page charges per cycle. This is scoped to this variable only
  // — displayPrice itself is untouched so every other card (delivered,
  // completed, shipped, processing, cancelled) keeps showing the same
  // value as before.
  // const rentalMonthlyPrice =
  //   !isSell && unit !== 'day'
  //     ? Math.round(
  //         displayPrice / Math.max(1, Number(order.rentalDuration || 1)),
  //       )
  //     : displayPrice;
  const rentalMonthlyPrice = displayPrice;

  const [hasReview, setHasReview] = useState(false);
  const [reviewChecked, setReviewChecked] = useState(false);

  useEffect(() => {
    if (meta.kind !== 'delivered_purchase') return;
    if (!p?._id || !order._id) return;

    apiGetMyReview(String(p._id), String(order._id))
      .then((res) => {
        setHasReview(res.data?.exists === true);
      })
      .catch(() => setHasReview(false))
      .finally(() => setReviewChecked(true));
  }, [meta.kind, p?._id, order._id]);

  // ── helpers for specific card kinds ──

  if (
    !p &&
    meta.kind !== 'cancelled' &&
    meta.kind !== 'pickup_scheduled' &&
    meta.kind !== 'relocation_requested'
  ) {
    return (
      <li className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="font-bold text-black">Order #{oid}</p>
        <p className="text-sm text-gray-500 mt-1">
          Product details unavailable
        </p>
      </li>
    );
  }

  // ── cancelled ──────────────────────────────────────────────────────────────
  // if (meta.kind === 'cancelled') {
  //   const rrLine = line ?? orderReturnLine(order);
  //   const rr = rrLine?.returnRequest;
  //   const hasReturnTracking = Boolean(rr?.requestedAt);
  //   const refundShown = hasReturnTracking
  //     ? lineRefundableDeposit(rrLine)
  //     : linePrice;
  // ── relocation requested (rental) ──────────────────────────────────────────
  // if (meta.kind === 'relocation_requested') {
  //   const rl = line?.relocationRequest;
  //   const newAddr = rl?.newAddress || {};
  //   const oldAddr = rl?.oldAddressSnapshot || {
  //     name: order.name,
  //     address: order.address,
  //     phone: order.phone,
  //   };
  //   const isRelocationConfirmed = String(rl?.status || '') === 'confirmed';
  //   return (
  //     <li className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
  //       <CardHeader oid={oid} placed={placed} isSell={isSell}>
  //         {isRelocationConfirmed ? (
  //           <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  //             <CheckCircle2 className="w-3.5 h-3.5" />
  //             Confirmed
  //           </span>
  //         ) : (
  //           <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
  //             <MapPin className="w-3.5 h-3.5" />
  //             Requested
  //           </span>
  //         )}
  //       </CardHeader>

  //       <div className="p-4 flex flex-col lg:flex-row lg:items-start gap-4">
  //         <div className="lg:flex-1 lg:min-w-0">
  //           <LineRow
  //             img={img}
  //             title={title}
  //             qty={qty}
  //             isSell={isSell}
  //             price={rentalMonthlyPrice}
  //             priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
  //             variantName={variantName}
  //             href={detailHref}
  //           />
  //         </div>

  //         <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm lg:w-[480px] lg:shrink-0">
  //           <div className="sm:border-r sm:border-gray-200 sm:pr-3">
  //             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
  //               {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
  //             </p>

  //             <p className="text-gray-500 text-xs mt-0.5">
  //               {oldAddr?.address || '-'}
  //             </p>
  //             {oldAddr?.phone ? (
  //               <p className="text-gray-500 text-xs mt-0.5">
  //                 Phone: {oldAddr.phone}
  //               </p>
  //             ) : null}
  //           </div>
  //           <div className="border-t border-gray-200 pt-3 sm:border-t-0 sm:pt-0">
  //             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
  //               New Address
  //             </p>
  //             {/* <p className="font-medium text-gray-800 mt-0.5">
  //               {newAddr?.label || '-'}
  //             </p> */}
  //             <p className="text-gray-500 text-xs mt-0.5">
  //               {[newAddr?.addressLine, newAddr?.area, newAddr?.pincode]
  //                 .filter(Boolean)
  //                 .join(', ')}
  //             </p>
  //             {newAddr?.phone ? (
  //               <p className="text-gray-500 text-xs mt-0.5">
  //                 Phone: {newAddr.phone}
  //               </p>
  //             ) : null}
  //           </div>
  //         </div>
  //       </div>
  //       <OrderSummaryAccordion order={order} />
  //     </li>
  //   );
  // }

  if (meta.kind === 'relocation_requested') {
    const rl = line?.relocationRequest;
    const newAddr = rl?.newAddress || {};
    const oldAddr = rl?.oldAddressSnapshot || {
      name: order.name,
      address: order.address,
      phone: order.phone,
    };
    const isRelocationConfirmed = String(rl?.status || '') === 'confirmed';
    const relocateTrackHref = `/orders/${String(order._id)}/track-relocate?lineIdx=${orderProductLines(
      order,
    ).indexOf(line)}`;
    return (
      <li
        className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          router.push(relocateTrackHref);
        }}
      >
        {/* Mobile — unchanged original layout */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Placed on: {placed}
              </p>
            </div>
            <div className="shrink-0">
              {isRelocationConfirmed ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <MapPin className="w-3.5 h-3.5" />
                  Requested
                </span>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative shrink-0 w-20 h-20">
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span
                  className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                    isSell ? 'bg-blue-600' : 'bg-orange-500'
                  }`}
                >
                  {isSell ? 'Buy' : 'Rent'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                <p className="text-sm text-gray-500 mt-0.5">
                  Relocation Cost:{' '}
                  <span className={`font-bold ${ORANGE_TEXT}`}>₹0/-</span>
                </p>
              </div>
            </div>

            {/* <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {oldAddr?.address || '-'}
                </p>
                {oldAddr?.phone ? (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Phone: {oldAddr.phone}
                  </p>
                ) : null}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  New Address
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {[newAddr?.addressLine, newAddr?.area, newAddr?.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {newAddr?.phone ? (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Phone: {newAddr.phone}
                  </p>
                ) : null}
              </div>
            </div> */}
          </div>
        </div>

        {/* Desktop — redesigned layout (same as Processing/Completed/Cancelled) */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed On:{' '}
                    <span className="font-semibold text-black">{placed}</span>
                  </p>
                </div>
                {isRelocationConfirmed ? (
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmed
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <MapPin className="w-3.5 h-3.5" />
                    Requested
                  </span>
                )}
              </div>

              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                <p className="text-sm text-gray-500 mt-0.5">
                  Relocation Cost:{' '}
                  <span className={`font-bold ${ORANGE_TEXT}`}>₹0/-</span>
                </p>
              </div>
            </div>
          </div>

          {/* <div className="px-4 pb-4 pl-4 sm:pl-36 -mt-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 grid grid-cols-2 gap-3 text-sm">
              <div className="border-r border-gray-200 pr-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {isRelocationConfirmed ? 'Old Address' : 'Current Address'}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {oldAddr?.address || '-'}
                </p>
                {oldAddr?.phone ? (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Phone: {oldAddr.phone}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  New Address
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {[newAddr?.addressLine, newAddr?.area, newAddr?.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {newAddr?.phone ? (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Phone: {newAddr.phone}
                  </p>
                ) : null}
              </div>
            </div>
          </div> */}
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  }

  // ── pickup scheduled / return requested (rental) ──────────────────────────
  // if (meta.kind === 'pickup_scheduled') {
  //   const rr = line?.returnRequest;
  //   const pickupScheduled = Boolean(rr?.pickupScheduledAt);
  //   return (
  //     <li className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
  //       <CardHeader oid={oid} placed={placed} isSell={isSell}>
  //         <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
  //           <Package className="w-3.5 h-3.5" />
  //           {pickupScheduled ? 'Scheduled' : 'Requested'}
  //         </span>
  //       </CardHeader>

  //       <div className="p-4">
  //         <LineRow
  //           img={img}
  //           title={title}
  //           qty={qty}
  //           isSell={isSell}
  //           price={rentalMonthlyPrice}
  //           priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
  //           variantName={variantName}
  //           href={detailHref}
  //         />
  //       </div>

  //       <div className="px-4 pb-2">
  //         <p className="text-sm text-gray-600 flex items-start gap-2">
  //           <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
  //           <span>
  //             {pickupScheduled
  //               ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
  //               : "We've received your return request — our team will schedule a pickup soon."}
  //           </span>
  //         </p>
  //       </div>

  //       <div className="px-4 pb-3 flex justify-start">
  //         <Link
  //           href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
  //           className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
  //         >
  //           View Return Status
  //           <ExternalLink className="w-3.5 h-3.5" />
  //         </Link>
  //       </div>
  //       <OrderSummaryAccordion order={order} />
  //     </li>
  //   );
  // }

  if (meta.kind === 'pickup_scheduled') {
    const rr = line?.returnRequest;
    const pickupScheduled = Boolean(rr?.pickupScheduledAt);
    const pickupTrackHref = `/orders/${String(order._id)}/track-pickup?lineIdx=${orderProductLines(
      order,
    ).indexOf(line)}`;
    return (
      <li
        className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          router.push(pickupTrackHref);
        }}
      >
        {/* Mobile — unchanged original layout */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            {/* <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Placed on: {placed}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Package className="w-3.5 h-3.5" />
                {pickupScheduled ? 'Scheduled' : 'Requested'}
              </span>
            </div> */}
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Pickup Date: {formatOrderDate(rr?.requestedAt)}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Package className="w-3.5 h-3.5" />
                {pickupScheduled ? 'Scheduled' : 'Requested'}
              </span>
            </div>
          </div>

          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>
            {/* <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>

              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
            </div>
          </div>

          <div className="px-4 pb-1 -mt-4">
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
              <span>
                {pickupScheduled
                  ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
                  : "We've received your return request — our team will schedule a pickup soon."}
              </span>
            </p>
          </div>

          <div className="px-4 pb-3 -mt-1 flex justify-start">
            <Link
              href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
            >
              View Return Status
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div> */}
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>

              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
              <p className="text-sm text-gray-600 flex items-start gap-2 mt-1.5">
                {/* <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" /> */}
                <span>
                  {pickupScheduled
                    ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
                    : "We've received your return request — our team will schedule a pickup soon."}
                </span>
              </p>
              <Link
                href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black mt-1.5"
              >
                View Return Status
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
        {/* Desktop — redesigned layout */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                {/* <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed On:{' '}
                    <span className="font-semibold text-black">{placed}</span>
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Package className="w-3.5 h-3.5" />
                  {pickupScheduled ? 'Scheduled' : 'Requested'}
                </span> */}
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Pickup Date:{' '}
                    <span className="font-semibold text-black">
                      {formatOrderDate(rr?.requestedAt)}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Package className="w-3.5 h-3.5" />
                  {pickupScheduled ? 'Scheduled' : 'Requested'}
                </span>
              </div>

              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {/* {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                <p className="text-sm text-gray-500 mt-0.5">
                  Order Value:{' '}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /month
                      </span>
                    ) : null}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-6 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-500" />
              <span>
                {pickupScheduled
                  ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
                  : "We've received your return request — our team will schedule a pickup soon."}
              </span>
            </p>
            <Link
              href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
              className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
            >
              View Return Status
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  } */}

                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-12 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              {/* <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-500" /> */}
              <span>
                {pickupScheduled
                  ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
                  : "We've received your return request — our team will schedule a pickup soon."}
              </span>
            </p>
            <Link
              href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
              className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
            >
              View Return Status
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  }

  // if (meta.kind === 'cancelled') {

  // if (meta.kind === 'cancelled') {
  //   const rrLine = line ?? orderReturnLine(order);
  //   const rr = rrLine?.returnRequest;
  //   const hasReturnTracking = Boolean(rr?.requestedAt);
  //   console.log('=== DEBUG hasReturnTracking ===', hasReturnTracking);
  //   console.log('=== DEBUG rr.requestedAt ===', rr?.requestedAt);
  //   console.log(
  //     '=== DEBUG rrLine.refundBreakdown ===',
  //     rrLine?.refundBreakdown,
  //   );
  //   console.log(
  //     '=== DEBUG rrLine.refundableDeposit ===',
  //     rrLine?.refundableDeposit,
  //   );
  //   console.log('=== DEBUG rrLine full ===', rrLine);
  //   const refundShown = hasReturnTracking
  //     ? lineRefundableDeposit(rrLine)
  //     : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);
  //   const cancelledDetailDate = hasReturnTracking
  //     ? formatOrderDate(rr.requestedAt)
  //     : placed;
  //   return (
  //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  //       <CardHeader oid={oid} placed={placed} isSell={isSell}>
  //         <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
  //           <XCircle className="w-3.5 h-3.5" />
  //           Cancelled
  //         </span>
  //       </CardHeader>

  //       <div className="p-4">
  //         <LineRow
  //           img={img}
  //           title={title}
  //           qty={qty}
  //           isSell={isSell}
  //           price={rentalMonthlyPrice}
  //           // priceSuffix={priceSuffix}
  //           priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
  //           variantName={variantName}
  //           href={detailHref}
  //         />
  //       </div>

  //       <div className="px-4 pb-2">
  //         <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
  //           <CheckCircle2 className="w-4 h-4 shrink-0" />
  //           Refund Processed: ₹{formatMoney(refundShown)} to Source
  //         </p>
  //         <p className="text-xs text-gray-500 mt-1">
  //           {hasReturnTracking
  //             ? `Cancelled by you on ${cancelledDetailDate}`
  //             : rrLine?.cancelledBy === 'vendor'
  //               ? `Cancelled by vendor on ${cancelledDetailDate}`
  //               : `Cancelled on ${cancelledDetailDate}`}
  //         </p>
  //         {rrLine?.cancelledBy === 'vendor' && rrLine?.cancelReason ? (
  //           <p className="text-xs text-gray-500 mt-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
  //             <span className="font-medium text-gray-700">Reason:</span>{' '}
  //             {rrLine.cancelReason}
  //           </p>
  //         ) : null}
  //       </div>
  //       <div className="px-4 pb-3 flex justify-start">
  //         {hasReturnTracking ? (
  //           <Link
  //             href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
  //             className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
  //           >
  //             View Refund Details
  //             <ExternalLink className="w-3.5 h-3.5" />
  //           </Link>
  //         ) : (
  //           <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 cursor-not-allowed">
  //             View Refund Details
  //             <ExternalLink className="w-3.5 h-3.5" />
  //           </span>
  //         )}
  //       </div>
  //       <OrderSummaryAccordion order={order} />
  //     </li>
  //   );
  // }

  // if (meta.kind === 'cancelled') {
  //   const rrLine = line ?? orderReturnLine(order);
  //   const rr = rrLine?.returnRequest;
  //   const hasReturnTracking = Boolean(rr?.requestedAt);
  //   const refundShown = hasReturnTracking
  //     ? lineRefundableDeposit(rrLine)
  //     : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);
  //   const cancelledDetailDate = hasReturnTracking
  //     ? formatOrderDate(rr.requestedAt)
  //     : placed;
  //   const cancelledTrackHref = `/orders/${String(order._id)}/track-cancelled?lineIdx=${orderProductLines(
  //     order,
  //   ).indexOf(line)}`;

  if (meta.kind === 'cancelled') {
    const rrLine = line ?? orderReturnLine(order);
    const rr = rrLine?.returnRequest;
    const hasReturnTracking = Boolean(rr?.requestedAt);

    // Recompute the refund the same way the pre-cancel confirmation
    // screen does (product price − cancellation fee + deposit),
    // instead of trusting a stored total that may not have the fee
    // deducted from it.
    // const cancelFeeShown = Number(
    //   rrLine?.refundBreakdown?.feeAmount ??
    //     rrLine?.refundBreakdown?.cancellationFee ??
    //     rrLine?.refundBreakdown?.fee ??
    //     0,
    // );
    // const depositShown = lineRefundableDeposit(rrLine);
    // const computedRefund =
    //   Math.max(0, linePrice - cancelFeeShown) + depositShown;

    // const refundShown = hasReturnTracking
    //   ? depositShown
    //   : rrLine?.refundBreakdown?.feeAmount !== undefined ||
    //       rrLine?.refundBreakdown?.cancellationFee !== undefined ||
    //       rrLine?.refundBreakdown?.fee !== undefined
    //     ? computedRefund
    //     : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);

    // const cancelFeeShown = Number(
    //   rrLine?.refundBreakdown?.feeAmount ??
    //     rrLine?.refundBreakdown?.cancellationFee ??
    //     rrLine?.refundBreakdown?.fee ??
    //     0,
    // );
    // const depositShown = lineRefundableDeposit(rrLine);
    // // Other taxes/fees — same order-level fields used on the track page,
    // // excluding the refundable deposit (handled separately above).
    // const taxShown =
    //   Number(order.gst || 0) +
    //   Number(order.careProtection || 0) +
    //   Number(order.repairWarranty || 0) +
    //   Number(order.relocationWarranty || 0) +
    //   Number(order.deliveryPackaging || 0) +
    //   Number(order.installationFee || 0) +
    //   Number(order.platformFee || 0) +
    //   Number(order.deliveryFee || 0);
    // const computedRefund =
    //   Math.max(0, linePrice - cancelFeeShown) + depositShown + taxShown;

    // const refundShown = hasReturnTracking
    //   ? depositShown
    //   : rrLine?.refundBreakdown?.feeAmount !== undefined ||
    //       rrLine?.refundBreakdown?.cancellationFee !== undefined ||
    //       rrLine?.refundBreakdown?.fee !== undefined
    //     ? computedRefund
    //     : Number(rrLine?.refundBreakdown?.refundAmount ?? linePrice);

    // const depositShown = lineRefundableDeposit(rrLine);
    // const taxShown =
    //   Number(order.gst || 0) +
    //   Number(order.careProtection || 0) +
    //   Number(order.repairWarranty || 0) +
    //   Number(order.relocationWarranty || 0) +
    //   Number(order.deliveryPackaging || 0) +
    //   Number(order.installationFee || 0) +
    //   Number(order.platformFee || 0) +
    //   Number(order.deliveryFee || 0);
    // const totalPaidShown = linePrice + depositShown + taxShown;
    // // const cancelFeeShown = Number(
    // //   rrLine?.refundBreakdown?.feeAmount ??
    // //     rrLine?.refundBreakdown?.cancellationFee ??
    // //     rrLine?.refundBreakdown?.fee ??
    // //     Math.round(totalPaidShown * 0.1),
    // // );
    // // const computedRefund = Math.max(0, totalPaidShown - cancelFeeShown);

    // // const refundShown = hasReturnTracking ? depositShown : computedRefund;
    // // Always recompute fee from total — never trust stale stored value
    // const cancelFeeShown = Math.round(totalPaidShown * 0.1);
    // const computedRefund = Math.max(0, totalPaidShown - cancelFeeShown);

    // const refundShown = hasReturnTracking ? depositShown : computedRefund;

    const depositShown = lineRefundableDeposit(rrLine);
    const taxShown =
      Number(order.gst || 0) +
      Number(order.careProtection || 0) +
      Number(order.repairWarranty || 0) +
      Number(order.relocationWarranty || 0) +
      Number(order.deliveryPackaging || 0) +
      Number(order.installationFee || 0) +
      Number(order.platformFee || 0) +
      Number(order.deliveryFee || 0);
    const totalPaidShown = linePrice + depositShown + taxShown;
    // Vendor-initiated cancellations are always a full refund with no
    // fee — the customer isn't at fault, so nothing is deducted.
    const isVendorCancelledShown = rrLine?.cancelledBy === 'vendor';
    // Always recompute fee from total — never trust stale stored value
    const cancelFeeShown = isVendorCancelledShown
      ? 0
      : Math.round(totalPaidShown * 0.1);
    const computedRefund = Math.max(0, totalPaidShown - cancelFeeShown);

    const refundShown = hasReturnTracking ? depositShown : computedRefund;

    // const cancelledDetailDate = hasReturnTracking
    //   ? formatOrderDate(rr.requestedAt)
    //   : placed;
    const cancelledDetailDate = hasReturnTracking
      ? formatOrderDate(rr.requestedAt)
      : formatOrderDate(
          rrLine?.cancelledAt ||
            rrLine?.updatedAt ||
            order.updatedAt ||
            order.createdAt,
        );
    const cancelledTrackHref = `/orders/${String(order._id)}/track-cancelled?lineIdx=${orderProductLines(
      order,
    ).indexOf(line)}`;
    return (
      <li
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          router.push(cancelledTrackHref);
        }}
      >
        {/* Mobile — unchanged original layout */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Placed on: {placed}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-3.5 h-3.5" />
                Cancelled
              </span>
            </div>
          </div>

          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>
              {/* {variantName ? (
                <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                  {variantName}
                </span>
              ) : null} */}
              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
              <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}
                  {!isSell && unit !== 'day' ? (
                    <span className="text-xs font-medium text-gray-500 ml-1">
                      /-
                    </span>
                  ) : null}
                </span> */}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}/-
                </span>
              </p>
            </div>
          </div>

          <div className="px-4 pb-2">
            <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Refund Processed: ₹{formatMoney(refundShown)} to Source
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {hasReturnTracking
                ? `Cancelled by you on ${cancelledDetailDate}`
                : rrLine?.cancelledBy === 'vendor'
                  ? `Cancelled by vendor on ${cancelledDetailDate}`
                  : `Cancelled on ${cancelledDetailDate}`}
            </p>
            {rrLine?.cancelledBy === 'vendor' && rrLine?.cancelReason ? (
              <p className="text-xs text-gray-500 mt-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <span className="font-medium text-gray-700">Reason:</span>{' '}
                {rrLine.cancelReason}
              </p>
            ) : null}
          </div>
          <div className="px-4 pb-3 flex justify-start">
            {hasReturnTracking ? (
              <Link
                href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
              >
                View Refund Details
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 cursor-not-allowed">
                View Refund Details
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Desktop — redesigned layout (same as Processing/Completed) */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed On:{' '}
                    <span className="font-semibold text-black">{placed}</span>
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelled
                </span>
              </div>

              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                <p className="text-sm text-gray-500 mt-0.5">
                  Order Value:{' '}
                  {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /-
                      </span>
                    ) : null}
                  </span> */}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}/-
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-6">
            <p className="text-sm flex items-center justify-between gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Refund Processed: ₹{formatMoney(refundShown)} to Source
              </span>
              {hasReturnTracking ? (
                <Link
                  href={`/orders/return-status?orderId=${encodeURIComponent(order._id)}`}
                  className="shrink-0 inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-black"
                >
                  View Refund Details
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1.5 font-medium text-gray-400 cursor-not-allowed">
                  View Refund Details
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {hasReturnTracking
                ? `Cancelled by you on ${cancelledDetailDate}`
                : rrLine?.cancelledBy === 'vendor'
                  ? `Cancelled by vendor on ${cancelledDetailDate}`
                  : `Cancelled on ${cancelledDetailDate}`}
            </p>
            {rrLine?.cancelledBy === 'vendor' && rrLine?.cancelReason ? (
              <p className="text-xs text-gray-500 mt-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <span className="font-medium text-gray-700">Reason:</span>{' '}
                {rrLine.cancelReason}
              </p>
            ) : null}
          </div>
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  }
  // ── delivered / completed purchase ────────────────────────────────────────
  // if (meta.kind === 'delivered_purchase') {
  //   const phase = meta.purchasePhase || 'delivered';
  //   const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
  //   const headerDateLabel =
  //     phase === 'completed'
  //       ? `Completed on: ${milestoneDate}`
  //       : `Delivered on: ${milestoneDate}`;
  //   const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';

  //   return (
  //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  //       <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
  //         <div>
  //           <p className="font-bold text-black">Order #{oid}</p>
  //           <p className="text-sm text-gray-500 mt-0.5">{headerDateLabel}</p>
  //         </div>
  //         <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  //           <CheckCircle2 className="w-3.5 h-3.5" />
  //           {badgeLabel}
  //         </span>
  //       </div>
  //       <div className="p-4">
  //         <LineRow
  //           img={img}
  //           title={title}
  //           qty={qty}
  //           isSell={isSell}
  //           price={linePrice}
  //           priceSuffix={priceSuffix}
  //         />
  //       </div>
  //       <div className="px-4 pb-2">
  //         <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
  //           <CheckCircle2 className="w-4 h-4 shrink-0" />
  //           {phase === 'completed'
  //             ? 'Thank you — order complete'
  //             : 'Delivered successfully'}
  //         </p>
  //       </div>
  //       <div className="px-4 pb-4">
  //         {/* <button
  //           type="button"
  //           className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
  //         >
  //           <Star className="w-4 h-4 text-gray-700" />
  //           Rate &amp; Review
  //         </button> */}
  //         <button
  //           type="button"
  //           onClick={() =>
  //             onOpenReview?.({
  //               productId: p?._id,
  //               orderId: order._id,
  //               productName: title,
  //               image: img,
  //             })
  //           }
  //           className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
  //         >
  //           <Star className="w-4 h-4" />
  //           Rate &amp; Review
  //         </button>
  //       </div>
  //     </li>
  //   );
  // }

  // ── delivered / completed purchase ────────────────────────────────────────
  // if (meta.kind === 'delivered_purchase') {
  //   const phase = meta.purchasePhase || 'delivered';
  //   const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
  //   const headerDateLabel =
  //     phase === 'completed'
  //       ? `Completed on: ${milestoneDate}`
  //       : `Delivered on: ${milestoneDate}`;
  //   const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';

  //   return (
  //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  //       <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
  //         <div className="min-w-0">
  //           <p className="font-bold text-black truncate">Order #{oid}</p>
  //           <p className="text-sm text-gray-500 mt-0.5">{headerDateLabel}</p>
  //         </div>
  //         <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  //           <CheckCircle2 className="w-3.5 h-3.5" />
  //           {badgeLabel}
  //         </span>
  //       </div>
  //       <div className="p-4">
  //         <LineRow
  //           img={img}
  //           title={title}
  //           qty={qty}
  //           isSell={isSell}
  //           // price={linePrice}
  //           price={displayPrice}
  //           priceSuffix={priceSuffix}
  //           variantName={variantName}
  //           href={detailHref}
  //         />
  //       </div>
  //       <div className="px-4 pb-2">
  //         <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
  //           <CheckCircle2 className="w-4 h-4 shrink-0" />
  //           {phase === 'completed'
  //             ? 'Thank you — order complete'
  //             : 'Delivered successfully'}
  //         </p>
  //       </div>
  //       <div className="px-4 pb-3">
  //         <button
  //           type="button"
  //           onClick={() =>
  //             onOpenReview?.({
  //               productId: p?._id,
  //               orderId: order._id,
  //               productName: title,
  //               image: img,
  //             })
  //           }
  //           className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
  //         >
  //           <Star className="w-4 h-4 text-black fill-none" />
  //           {reviewChecked && hasReview ? 'Update Review' : 'Rate & Review'}
  //         </button>
  //       </div>
  //       <OrderSummaryAccordion order={order} />
  //     </li>
  //   );
  // }

  // // ── delivered / completed purchase ────────────────────────────────────────
  // if (meta.kind === 'delivered_purchase') {
  //   const phase = meta.purchasePhase || 'delivered';
  //   const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
  //   const headerDateLabel =
  //     phase === 'completed'
  //       ? `Completed on: ${milestoneDate}`
  //       : `Delivered on: ${milestoneDate}`;
  //   const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';

  //   return (
  //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  // ── delivered / completed purchase ────────────────────────────────────────
  if (meta.kind === 'delivered_purchase') {
    const phase = meta.purchasePhase || 'delivered';
    const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
    const headerDateLabel =
      phase === 'completed'
        ? `Completed on: ${milestoneDate}`
        : `Delivered on: ${milestoneDate}`;
    const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';
    const deliveredTrackHref = `/orders/${String(order._id)}/track-delivered?lineIdx=${orderProductLines(
      order,
    ).indexOf(line)}`;

    return (
      <li
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          router.push(deliveredTrackHref);
        }}
      >
        {/* Mobile — unchanged original layout */}
        {/* Mobile — unchanged original layout */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">{headerDateLabel}</p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {badgeLabel}
            </span>
          </div>
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>
              {/* {variantName ? (
                <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                  {variantName}
                </span>
              ) : null} */}
              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
              {/* <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(displayPrice)}
                </span>
              </p> */}
              <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(displayPrice)}/-
                </span>
              </p>
            </div>
          </div>
          <div className="px-4 pb-2">
            <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {phase === 'completed'
                ? 'Thank you — order complete'
                : 'Delivered successfully'}
            </p>
          </div>
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={() =>
                onOpenReview?.({
                  productId: p?._id,
                  orderId: order._id,
                  productName: title,
                  image: img,
                })
              }
              className="flex-1 w-full min-h-[44px] rounded-xl border-2 border-gray-300 bg-white text-black text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4 text-black fill-none" />
              {reviewChecked && hasReview ? 'Update Review' : 'Rate & Review'}
            </button>
          </div>
        </div>
        {/* Desktop — redesigned layout (same as Processing/Completed) */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {headerDateLabel}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {badgeLabel}
                </span>
              </div>

              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                {/* <p className="text-sm text-gray-500 mt-0.5">
                  Order Value:{' '}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(displayPrice)}
                  </span>
                </p> */}
                <p className="text-sm text-gray-500 mt-0.5">
                  Order Value:{' '}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(displayPrice)}/-
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-9 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {phase === 'completed'
                ? 'Thank you — order complete'
                : 'Delivered successfully'}
            </p>
            <button
              type="button"
              onClick={() =>
                onOpenReview?.({
                  productId: p?._id,
                  orderId: order._id,
                  productName: title,
                  image: img,
                })
              }
              className="shrink-0 px-3 py-1.5 rounded-lg border-2 border-gray-300 bg-white text-black text-xs font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-black fill-none" />
              {reviewChecked && hasReview ? 'Update Review' : 'Rate & Review'}
            </button>
          </div>
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  }

  // ── delivered rental (same card as delivered purchase, no review button) ──
  if (meta.kind === 'delivered_rental') {
    const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
    const deliveredRentalTrackHref = `/orders/${String(order._id)}/track-delivered?lineIdx=${orderProductLines(
      order,
    ).indexOf(line)}`;

    return (
      <li
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          router.push(deliveredRentalTrackHref);
        }}
      >
        {/* Mobile */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Delivered on: {milestoneDate}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Delivered
            </span>
          </div>
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
                Rent
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>
              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
              <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}/-
                </span>
              </p>
            </div>
          </div>
          <div className="px-4 pb-3">
            <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Delivered successfully
            </p>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
                Rent
              </span>
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Delivered On:{' '}
                    <span className="font-semibold text-black">
                      {milestoneDate}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Delivered
                </span>
              </div>
              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-between gap-2 flex-wrap">
                  <span>
                    Order Value:{' '}
                    <span className={`font-bold ${ORANGE_TEXT}`}>
                      ₹{formatMoney(rentalMonthlyPrice)}/-
                    </span>
                  </span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    Delivered successfully
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  }

  // ── completed rental

  // ── completed rental ──────────────────────────────────────────────────────
  // if (meta.kind === 'completed_done') {
  //   return (
  //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  //       <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
  //         <div className="min-w-0">
  //           <p className="font-bold text-black truncate">Order #{oid}</p>
  //           <p className="text-sm text-gray-500 mt-0.5">
  //             Completed on:{' '}
  //             {formatOrderDate(order.updatedAt || order.createdAt)}
  //           </p>
  //         </div>
  //         <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
  //           <CheckCircle2 className="w-3.5 h-3.5" />
  //           Completed
  //         </span>
  //       </div>
  //       {/* <div className="p-4">
  //         <LineRow
  //           img={img}
  //           title={title}
  //           qty={qty}
  //           isSell={isSell}
  //           // price={linePrice}
  //           price={displayPrice}
  //           priceSuffix={priceSuffix}
  //           variantName={variantName}
  //           href={detailHref}
  //         />
  //       </div>
  //       <div className="px-4 pb-2">
  //         <p className="text-sm text-emerald-600 flex items-center gap-1.5">
  //           <CheckCircle2 className="w-4 h-4" />
  //           Thank you — rental closed
  //         </p>
  //       </div> */}
  //       <div className="p-4">
  //         <LineRow
  //           img={img}
  //           title={title}
  //           qty={qty}
  //           isSell={isSell}
  //           // price={linePrice}
  //           price={rentalMonthlyPrice}
  //           // priceSuffix={priceSuffix}
  //           priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
  //           variantName={variantName}
  //           href={detailHref}
  //         />
  //       </div>
  //       <div className="px-4 pb-2">
  //         <p className="text-sm text-emerald-600 flex items-center gap-1.5">
  //           <CheckCircle2 className="w-4 h-4" />
  //           Thank you — rental closed
  //         </p>
  //       </div>
  //       <OrderSummaryAccordion order={order} />
  //       {/* <div className="px-4 pb-4">
  //         <button
  //           type="button"
  //           className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
  //         >
  //           <Star className="w-4 h-4" />
  //           Rate &amp; review
  //         </button>
  //       </div> */}
  //     </li>
  //   );
  // }

  // ── completed rental ──────────────────────────────────────────────────────
  if (meta.kind === 'completed_done') {
    const completedTrackHref = `/orders/${String(order._id)}/track-completed?lineIdx=${orderProductLines(
      order,
    ).indexOf(line)}`;
    return (
      <li
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('a')) return;
          router.push(completedTrackHref);
        }}
      >
        {/* Mobile — unchanged original layout */}
        {/* Mobile — unchanged original layout */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Completed on:{' '}
                {formatOrderDate(order.updatedAt || order.createdAt)}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          </div>

          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>
              {/* {variantName ? (
                <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                  {variantName}
                </span>
              ) : null} */}
              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
              <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}
                  {!isSell && unit !== 'day' ? (
                    <span className="text-xs font-medium text-gray-500 ml-1">
                      /-
                    </span>
                  ) : null}
                </span> */}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}/-
                </span>
              </p>
            </div>
          </div>
          <div className="px-4 pb-2">
            <p className="text-sm text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Thank you — rental closed
            </p>
          </div>
        </div>
        {/* Desktop — redesigned layout (same as Processing/Shipped) */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Completed On:{' '}
                    <span className="font-semibold text-black">
                      {formatOrderDate(order.updatedAt || order.createdAt)}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              </div>

              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-between gap-2 flex-wrap">
                  <span>
                    Order Value:{' '}
                    {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                      ₹{formatMoney(rentalMonthlyPrice)}
                      {!isSell && unit !== 'day' ? (
                        <span className="text-xs font-medium text-gray-500 ml-1">
                          /-
                        </span>
                      ) : null}
                    </span> */}
                    <span className={`font-bold ${ORANGE_TEXT}`}>
                      ₹{formatMoney(rentalMonthlyPrice)}/-
                    </span>
                  </span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    Thank you — rental closed
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  }

  // ── active rental ─────────────────────────────────────────────────────────
  if (meta.kind === 'active_rental') {
    // Payment due countdown is based on the NEXT unpaid month's due date
    // (order start + monthsPaid months), not the overall tenure end date.
    // e.g. if 2 months are already paid, the "Pay 3rd Month" countdown
    // should reflect the window between month 2 and month 3, not the
    // days remaining until the full tenure ends.
    const monthsPaidForDue = Number(line?.monthsPaid ?? order?.monthsPaid ?? 1);
    const nextDueDate = new Date(order.createdAt || new Date());
    if (unit === 'day') {
      nextDueDate.setDate(nextDueDate.getDate() + monthsPaidForDue * 30);
    } else {
      nextDueDate.setMonth(nextDueDate.getMonth() + monthsPaidForDue);
    }
    const daysUntilNextDue = Math.ceil(
      (startOfDay(nextDueDate).getTime() - startOfDay(new Date()).getTime()) /
        86400000,
    );

    const paymentDueClass =
      daysUntilNextDue < 10
        ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FFC9C9]'
        : daysUntilNextDue < 30
          ? 'bg-[#FFFBEB] text-[#BB4D00] border border-[#FEE685]'
          : 'bg-[#DCFCE7] text-[#16A34A] border border-[#B9F8CF]';

    return (
      <li className="bg-white rounded-xl border-2 border-[#B9F8CF] shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <div className="min-w-0">
            <p className="font-bold text-black truncate">Order #{oid}</p>
            <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            Active rental
          </span>
        </div>

        {/* <div className="p-4">
          <LineRow
            img={img}
            title={title}
            qty={qty}
            isSell={isSell}
            // price={linePrice}
            price={displayPrice}
            priceSuffix={priceSuffix}
            variantName={variantName}
            href={detailHref}
          />
        </div>

        <div className="px-4 pb-2">
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
            <span>Tenure ends {formatOrderDate(meta.leaseEnd)}</span>
          </p>
          <span
            className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${paymentDueClass}`}
          >
            <Clock className="w-3.5 h-3.5" />
            Payment due in {meta.daysLeft} day{meta.daysLeft === 1 ? '' : 's'}
          </span>
        </div> */}

        <div className="p-4 pb-3">
          {/* <div className="flex gap-4 items-start">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
                Rent
              </span>
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              {detailHref ? (
                <Link
                  href={detailHref}
                  className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug"
                >
                  {title}
                </Link>
              ) : (
                <p className="font-semibold text-black leading-snug">{title}</p>
              )}
              {variantName ? (
                <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                  {variantName}
                </span>
              ) : null}
              {qty > 1 && <p className="text-sm text-gray-500">Qty: {qty}</p>}
              <p className={`text-base font-bold ${ORANGE_TEXT}`}>
                ₹{formatMoney(displayPrice)}
              </p>
            </div>
            <Link
              href="/my-rentals"
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-10 py-2.5 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              Pay Rent
            </Link>
          </div> */}
          <div className="flex gap-3 items-start">
            {detailHref ? (
              <Link href={detailHref} className="flex gap-3 flex-1 min-w-0">
                <div className="relative shrink-0 w-16 h-16">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <span className="absolute top-1 left-1 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
                    Rent
                  </span>
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  {/* <p className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug text-sm">
                    {title}
                  </p>
                  {variantName ? (
                    <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                      {variantName}
                    </span>
                  ) : null}
                  {qty > 1 && (
                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                  )}
                  <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(displayPrice)}
                  </p>
                </div>
              </Link> */}
                  {/* <p className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug text-sm">
                    {title}
                  </p>
                  {variantName ? (
                    <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                      {variantName}
                    </span>
                  ) : null}
                  {qty > 1 && (
                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                  )}

                  <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /month
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="relative shrink-0 w-16 h-16">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <span className="absolute top-1 left-1 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
                    Rent
                  </span>
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <p className="font-semibold text-black leading-snug text-sm">
                    {title}
                  </p> */}
                  <p
                    title={title}
                    className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug text-sm truncate min-w-0 max-w-[135px] sm:max-w-none sm:whitespace-normal"
                  >
                    {title}
                  </p>
                  {/* {variantName ? (
                    <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                      {variantName}
                    </span>
                  ) : null} */}
                  {qty > 1 && (
                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                  )}
                  {/* 
                  <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /-
                      </span>
                    ) : null}
                  </p> */}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}/-
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="relative shrink-0 w-16 h-16">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <span className="absolute top-1 left-1 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-orange-500">
                    Rent
                  </span>
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  {/* <p className="font-semibold text-black leading-snug text-sm">
                    {title}
                  </p>
                  {variantName ? (
                    <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                      {variantName}
                    </span>
                  ) : null}
                  {qty > 1 && (
                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                  )}
                  <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(displayPrice)}
                  </p>
                </div>
              </div>
            )} */}
                  <p
                    title={title}
                    className="font-semibold text-black leading-snug text-sm truncate min-w-0 max-w-[135px] sm:max-w-none sm:whitespace-normal"
                  >
                    {title}
                  </p>
                  {/* {variantName ? (
                    <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                      {variantName}
                    </span>
                  ) : null} */}
                  {/* null */}
                  {qty > 1 && (
                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                  )}
                  {/* <p className={`text-sm font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /-
                      </span>
                    ) : null}
                  </p> */}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}/-
                  </span>
                </div>
              </div>
            )}
            {/* <Link
              href="/my-account?tab=manage-rental-items"
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              <Wallet className="w-4 h-4" />
              Pay Rent
            </Link>
          </div>

          {!isSell && unit !== 'day' ? (
            <div className="mt-2">
              <Pay2ndMonthButton order={order} line={line} />
            </div>
          ) : null}
        </div> */}
            {/* {!isSell && unit !== 'day' ? (
              <div className="shrink-0">
                <Pay2ndMonthButton order={order} line={line} />
              </div>
            ) : (
              <Link
                href="/my-account?tab=manage-rental-items"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
              >
                <Wallet className="w-4 h-4" />
                Pay Rent
              </Link>
            )}
          </div>
        </div> */}

            {/* {!isSell && unit !== 'day' ? (
              <div className="shrink-0">
                <Pay2ndMonthButton order={order} line={line} />
              </div>
            ) : isSell ? (
              <Link
                href="/my-account?tab=manage-rental-items"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
              >
                <Wallet className="w-4 h-4" />
                Pay Rent
              </Link>
            ) : null} */}
            {!isSell && unit !== 'day' ? (
              // Hidden on mobile — Rental Command Center's mobile UI
              // already has its own "Pay Now" flow for monthly rentals.
              // Desktop Orders page keeps this button as before.
              <div className="hidden sm:block shrink-0">
                <Pay2ndMonthButton order={order} line={line} />
              </div>
            ) : isSell ? (
              <Link
                href="/my-account?tab=manage-rental-items"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
              >
                <Wallet className="w-4 h-4" />
                Pay Rent
              </Link>
            ) : null}
          </div>
        </div>

        {/* <div className="px-4 pb-3">
          <p className="text-sm text-gray-600 flex items-start gap-2 mb-2">
            <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
            <span>Tenure ends {formatOrderDate(meta.leaseEnd)}</span>
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${paymentDueClass}`}
              >
                <Clock className="w-3.5 h-3.5" />
                {daysUntilNextDue > 0
                  ? `Payment due in ${daysUntilNextDue} day${daysUntilNextDue === 1 ? '' : 's'}`
                  : 'Payment due now'}
              </span>
              <button */}
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-600 flex items-start gap-1 mb-2">
            <Calendar className="w-3 h-3 shrink-0 mt-0.5 text-gray-500" />
            <span className="text-xs">
              Tenure ends {formatOrderDate(meta.leaseEnd)}
            </span>
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              {unit !== 'day' ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${paymentDueClass}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {daysUntilNextDue > 0
                    ? `Payment due in ${daysUntilNextDue} day${daysUntilNextDue === 1 ? '' : 's'}`
                    : 'Payment due now'}
                </span>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => {
                  const orderId = String(order?._id || '');
                  const productId = String(p?._id || '');
                  if (!orderId || !productId) return;
                  onOpenReturnPrompt?.({
                    orderId,
                    orderRef: oid,
                    productId,
                    title,
                    image: img,
                    cycleRent: lineRent,
                    cycleUnit: unit === 'day' ? 'day' : 'month',
                    startedOn: formatOrderDate(order.createdAt),
                    totalTenure: String(order.rentalDuration || 0),
                    totalTenureLabel:
                      unit === 'day' ? 'Total Days' : 'Total Months',
                    cycleEnds: formatOrderDate(meta.leaseEnd),
                  });
                }}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2 transition-colors shrink-0"
              >
                Request Pickup / Close Rental
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const orderId = String(order?._id || '');
                const productId = String(p?._id || '');
                if (!orderId || !productId) return;
                onOpenReturnPrompt?.({
                  orderId,
                  orderRef: oid,
                  productId,
                  title,
                  image: img,
                  cycleRent: lineRent,
                  cycleUnit: unit === 'day' ? 'day' : 'month',
                  startedOn: formatOrderDate(order.createdAt),
                  totalTenure: String(order.rentalDuration || 0),
                  totalTenureLabel:
                    unit === 'day' ? 'Total Days' : 'Total Months',
                  cycleEnds: formatOrderDate(meta.leaseEnd),
                });
              }}
              className="sm:hidden inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
            >
              Request Pickup / Close Rental
            </button>
          </div>
        </div>
        <OrderSummaryAccordion order={order} />
        {/* <div className="px-4 pb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            href="/my-rentals"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-[70%] px-4 py-3 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold"
          >
            <Wallet className="w-4 h-4" />
            Pay Rent
          </Link>

          <button
            type="button"
            onClick={() => {
              const orderId = String(order?._id || '');
              const productId = String(p?._id || '');
              if (!orderId || !productId) return;
              onOpenReturnPrompt?.({
                orderId,
                orderRef: oid,
                productId,
                title,
                image: img,
                cycleRent: lineRent,
                cycleUnit: unit === 'day' ? 'day' : 'month',
                startedOn: formatOrderDate(order.createdAt),
                totalTenure: String(order.rentalDuration || 0),
                totalTenureLabel:
                  unit === 'day' ? 'Total Days' : 'Total Months',
                cycleEnds: formatOrderDate(meta.leaseEnd),
              });
            }}
            className="inline-flex items-center justify-center gap-1 w-full sm:w-[30%] text-sm font-medium text-gray-600 hover:text-black text-center"
          >
            Request Pickup / Close Rental
          </button>
        </div> */}
      </li>
    );
  }

  // ── shipped ───────────────────────────────────────────────────────────────
  if (meta.kind === 'shipped') {
    return (
      <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile — unchanged original layout */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Placed on: {placed}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
                <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
                Shipped
              </span>
            </div>
          </div>

          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>
              {/* {variantName ? (
                <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                  {variantName}
                </span>
              ) : null} */}
              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
              <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}
                  {!isSell && unit !== 'day' ? (
                    <span className="text-xs font-medium text-gray-500 ml-1">
                      /-
                    </span>
                  ) : null}
                </span> */}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}/-
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Expected delivery: {expectedDeliveryDate(order, p)}
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <Link
              href={`/orders/${String(order._id)}/track?lineIdx=${orderProductLines(
                order,
              ).indexOf(line)}`}
              className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white text-sm font-semibold ${ORANGE}`}
            >
              <MapPin className="w-4 h-4" />
              Track Order
            </Link>
          </div>
        </div>

        {/* Desktop — redesigned layout */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed On:{' '}
                    <span className="font-semibold text-black">{placed}</span>
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
                  <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
                  Shipped
                </span>
              </div>

              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                <p className="text-sm text-gray-500 mt-0.5">
                  Order Value:{' '}
                  {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /-
                      </span>
                    ) : null}
                  </span> */}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}/-
                  </span>
                </p>
                <p className="text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Expected delivery: {expectedDeliveryDate(order, p)}
                  </span>
                  <Link
                    href={`/orders/${String(order._id)}/track?lineIdx=${orderProductLines(
                      order,
                    ).indexOf(line)}`}
                    className={`shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold ${ORANGE}`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Track Order
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <OrderSummaryAccordion order={order} />
      </li>
    );
  }

  // ── rental missing catalog ────────────────────────────────────────────────
  if (meta.kind === 'rental_missing_catalog') {
    return (
      <li className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-amber-100 bg-amber-50/50">
          <div>
            <p className="font-bold text-black">Order #{oid}</p>
            <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <Package className="w-3.5 h-3.5" />
            Delivered · details incomplete
          </span>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            This item is delivered but product details are missing from the
            snapshot.
          </p>
        </div>
      </li>
    );
  }

  // ── processing / confirmed (default) ─────────────────────────────────────

  //   const processingTrackHref = `/orders/${String(order._id)}/track-processing?lineIdx=${orderProductLines(
  //     order,
  //   ).indexOf(line)}`;

  //   return (
  //     <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  //       <div
  //         role="button"
  //         tabIndex={0}
  //         onClick={() => router.push(processingTrackHref)}
  //         onKeyDown={(e) => {
  //           if (e.key === 'Enter') router.push(processingTrackHref);
  //         }}
  //         className="cursor-pointer"
  //       >
  //         <CardHeader oid={oid} placed={placed} isSell={isSell}>
  //           <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
  //             <Package className="w-3.5 h-3.5" />
  //             {procLabel}
  //           </span>
  //         </CardHeader>

  //         <div className="p-4">
  //           <LineRow
  //             img={img}
  //             title={title}
  //             qty={qty}
  //             isSell={isSell}
  //             price={rentalMonthlyPrice}
  //             priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
  //             variantName={variantName}
  //           />
  //         </div>

  //         <div className="px-4 pb-2 pt-0">
  //           <p className="text-sm  text-gray-500">
  //             We&apos;ll notify you when your product ships.
  //           </p>
  //         </div>
  //       </div>

  //       <OrderSummaryAccordion order={order} />
  //     </li>
  //   );
  // }

  const processingTrackHref = `/orders/${String(order._id)}/track-processing?lineIdx=${orderProductLines(
    order,
  ).indexOf(line)}`;

  return (
    <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(processingTrackHref)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') router.push(processingTrackHref);
        }}
        className="cursor-pointer"
      > */}
      <div>
        {/* Mobile — unchanged original layout */}
        {/* <div className="sm:hidden">
          <CardHeader oid={oid} placed={placed} isSell={isSell}>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              <Package className="w-3.5 h-3.5" />
              {procLabel}
            </span>
          </CardHeader>

          <div className="p-4">
            <LineRow
              img={img}
              title={title}
              qty={qty}
              isSell={isSell}
              price={rentalMonthlyPrice}
              priceSuffix={!isSell && unit !== 'day' ? '/month' : priceSuffix}
              variantName={variantName}
            />
          </div>

          <div className="px-4 pb-2 pt-0">
            <p className="text-sm  text-gray-500">
              We&apos;ll notify you when your product ships.
            </p>
          </div>
        </div> */}
        {/* Mobile — unchanged original layout */}
        <div className="sm:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div className="min-w-0">
              <p className="font-bold text-black truncate">Order ID: {oid}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Placed on: {placed}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                <Package className="w-3.5 h-3.5" />
                {procLabel}
              </span>
            </div>
          </div>
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-20 h-20">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>
              {/* {variantName ? (
                <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                  {variantName}
                </span>
              ) : null} */}
              {qty > 1 ? (
                <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
              ) : null}
              {/* <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}
                  {!isSell && unit !== 'day' ? (
                    <span className="text-xs font-medium text-gray-500 ml-1">
                      /month
                    </span>
                  ) : null}
                </span>
              </p>
            </div>
          </div>

          <div className="px-4 pb-2 pt-0">
            <p className="text-sm  text-gray-500">
              We&apos;ll notify you when your product ships.
            </p>
          </div>
        </div> */}
              <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}
                  {!isSell && unit !== 'day' ? (
                    <span className="text-xs font-medium text-gray-500 ml-1">
                      /-
                    </span>
                  ) : null}
                </span> */}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(rentalMonthlyPrice)}/-
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                We&apos;ll notify you when your product ships.
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <Link
              href={processingTrackHref}
              className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white text-sm font-semibold ${ORANGE}`}
            >
              <MapPin className="w-4 h-4" />
              Track Order
            </Link>
          </div>
        </div>

        {/* Desktop — redesigned layout */}

        {/* Desktop — redesigned layout */}
        <div className="hidden sm:block">
          <div className="p-4 flex gap-4">
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
                  isSell ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {isSell ? 'Buy' : 'Rent'}
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    Order ID:{' '}
                    <span className="font-semibold text-black">{oid}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed On:{' '}
                    <span className="font-semibold text-black">{placed}</span>
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  <Package className="w-3.5 h-3.5" />
                  {procLabel}
                </span>
              </div>

              <div>
                <p title={title} className="text-sm text-gray-500">
                  Product Name:{' '}
                  <span className="font-semibold text-black">{title}</span>
                </p>
                {/* {variantName ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                    {variantName}
                  </span>
                ) : null} */}
                {qty > 1 ? (
                  <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
                ) : null}
                {/* <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-between gap-2 flex-wrap">
                  <span>
                    Order Value:{' '}
                    <span className={`font-bold ${ORANGE_TEXT}`}>
                      ₹{formatMoney(rentalMonthlyPrice)}
                      {!isSell && unit !== 'day' ? (
                        <span className="text-xs font-medium text-gray-500 ml-1">
                          /month
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="text-gray-500 shrink-0">
                    We&apos;ll notify you when your product ships.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderSummaryAccordion order={order} />
    </li>
  );
}

// ─── shared sub-components ─────────────────────────────────────────────────── */}
                {/* <p className="text-sm text-gray-500 mt-0.5">
                  Order Value:{' '}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /month
                      </span>
                    ) : null}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 pl-4 sm:pl-36 -mt-6 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-500">
              We&apos;ll notify you when your product ships.
            </p>
            <Link
              href={processingTrackHref}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold ${ORANGE}`}
            >
              <MapPin className="w-4 h-4" />
              Track Order
            </Link>
          </div> */}
                <p className="text-sm text-gray-500 mt-0.5">
                  Order Value:{' '}
                  {/* <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}
                    {!isSell && unit !== 'day' ? (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        /-
                      </span>
                    ) : null}
                  </span> */}
                  <span className={`font-bold ${ORANGE_TEXT}`}>
                    ₹{formatMoney(rentalMonthlyPrice)}/-
                  </span>
                </p>
                <p className="text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
                  <span>We&apos;ll notify you when your product ships.</span>
                  <Link
                    href={processingTrackHref}
                    className={`shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold ${ORANGE}`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Track Order
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderSummaryAccordion order={order} />
    </li>
  );
}

// ─── shared sub-components ───────────────────────────────────────────────────
function CardHeader({ oid, placed, isSell, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
      <div className="min-w-0">
        <p className="font-bold text-black truncate">Order #{oid}</p>
        <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
// Late-fee confirmation modal shown before redirecting to the payment page.
function LateFeeConfirmModal({ info, onConfirm, onClose, loading }) {
  const hasLateFee = Number(info?.lateFeeAmount || 0) > 0;
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-black">
          {hasLateFee ? 'Late Fee Applies' : 'Confirm Payment'}
        </h2>
        {hasLateFee ? (
          <p className="text-sm text-gray-500 mt-1">
            This payment is {info.daysLate} day{info.daysLate === 1 ? '' : 's'}{' '}
            late. A late fee of ₹10/day applies.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            You&apos;re paying on time — no late fee.
          </p>
        )}

        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Month {info.nextMonth} Rent</span>
            <span className="font-semibold text-black">
              ₹{Number(info.baseAmount).toLocaleString('en-IN')}
            </span>
          </div>
          {hasLateFee ? (
            <div className="flex justify-between text-red-600">
              <span>Late Fee ({info.daysLate} × ₹10)</span>
              <span className="font-semibold">
                + ₹{Number(info.lateFeeAmount).toLocaleString('en-IN')}
              </span>
            </div>
          ) : null}
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-black">
            <span>Total Payable</span>
            <span>₹{Number(info.totalAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Proceed to Pay'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Dynamic "Pay Nth Month" button — shows only while there are unpaid
// months left on a monthly rental. On click it fetches the exact amount
// due (base rent + any late fee) from the server and shows a confirm
// modal before redirecting to the payment page.
// function Pay2ndMonthButton({ order, line }) {
//   const router = useRouter();
//   const orderId = String(order?._id || '');
//   const productId = String(
//     (line?.product && typeof line.product === 'object' && line.product._id) ||
//       '',
//   );

//   const totalMonths = Number(order?.rentalDuration || 1);
//   const monthsPaid = Number(order?.monthsPaid ?? 1);
//   const [dueInfo, setDueInfo] = useState(null);
//   const [fetching, setFetching] = useState(false);

function Pay2ndMonthButton({ order, line }) {
  const router = useRouter();
  const orderId = String(order?._id || '');
  const productId = String(
    (line?.product && typeof line.product === 'object' && line.product._id) ||
      '',
  );

  // const totalMonths = Number(order?.rentalDuration || 1);
  // // Read from the specific line first — falls back to order-level only
  // // for pre-existing orders saved before per-line tracking existed.
  // const monthsPaid = Number(line?.monthsPaid ?? order?.monthsPaid ?? 1);
  // Read from the specific line first — falls back to order-level only
  // for pre-existing orders saved before per-line tracking existed.
  const totalMonths = Number(
    line?.rentalDuration ?? order?.rentalDuration ?? 1,
  );
  const monthsPaid = Number(line?.monthsPaid ?? order?.monthsPaid ?? 1);
  const [dueInfo, setDueInfo] = useState(null);
  const [fetching, setFetching] = useState(false);

  // All months paid — hide the button entirely.
  if (monthsPaid >= totalMonths) return null;

  const nextMonth = monthsPaid + 1;
  const ordinal =
    nextMonth === 2
      ? '2nd'
      : nextMonth === 3
        ? '3rd'
        : nextMonth === 1
          ? '1st'
          : `${nextMonth}th`;

  // const handleClick = async () => {
  //   setFetching(true);
  //   try {
  //     const res = await apiGetNextMonthDue(orderId);
  //     setDueInfo(res.data);
  //   } catch (err) {
  //     alert(err?.response?.data?.message || 'Could not fetch payment due.');
  //   } finally {
  //     setFetching(false);
  //   }
  // };

  const handleClick = async () => {
    setFetching(true);
    try {
      const res = await apiGetNextMonthDue(orderId, productId);
      setDueInfo(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not fetch payment due.');
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      {/* <button
        type="button"
        onClick={handleClick}
        disabled={fetching}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#ea580c] text-white text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60"
      >
        <Wallet className="w-4 h-4" />
        {fetching ? 'Checking…' : `Pay ${ordinal} Month`}
      </button> */}
      <button
        type="button"
        onClick={handleClick}
        disabled={fetching}
        className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#F97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60"
      >
        <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        {fetching ? 'Checking…' : `Pay ${ordinal} Month`}
      </button>

      {dueInfo ? (
        <LateFeeConfirmModal
          info={dueInfo}
          loading={false}
          onClose={() => setDueInfo(null)}
          onConfirm={() => {
            router.push(
              `/payment?mode=pay-next-month&orderId=${encodeURIComponent(
                orderId,
              )}&productId=${encodeURIComponent(productId)}&month=${dueInfo.nextMonth}&baseAmount=${dueInfo.baseAmount}&lateFeeAmount=${dueInfo.lateFeeAmount}&amount=${dueInfo.totalAmount}`,
            );
          }}
        />
      ) : null}
    </>
  );
}

// function ServiceBookingCard({
//   booking,
//   onReschedule,
//   onCancel,
//   onOpenServiceReview,
// }) {
//   const title =
//     booking?.serviceSnapshot?.productName ||
//     booking?.serviceProduct?.productName ||
//     'Service booking';
//   const img =
//     booking?.serviceSnapshot?.image || booking?.serviceProduct?.image || '';
//   const bookingDate = booking?.bookingDate
//     ? formatOrderDate(booking.bookingDate)
//     : '-';
//   const oid = `SRV-${String(booking?._id || '')
//     .slice(-3)
//     .toUpperCase()}`;
//   // const status = String(booking?.status || 'pending').replace('_', ' ');
//   const rawStatus = String(booking?.status || 'pending');

//   const status =
//     booking?.status === 'completed'
//       ? 'Completed'
//       : booking?.status === 'cancelled'
//         ? 'Cancelled'
//         : 'Scheduled';

//   const statusClass =
//     booking?.status === 'completed'
//       ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//       : booking?.status === 'cancelled'
//         ? 'bg-red-50 text-red-700 border-red-200'
//         : 'bg-[#DBEAFE] text-[#2563EB] border-[#DBEAFE]';

// function ServiceBookingCard({
//   booking,
//   onReschedule,
//   onCancel,
//   onOpenServiceReview,
// }) {
//   console.log('booking.serviceProduct:', booking?.serviceProduct);
function ServiceOrderSummaryAccordion({ booking }) {
  const [open, setOpen] = useState(false);

  const basePrice = Number(booking?.totalAmount || 0);
  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  // Tax lines stored in booking (saved at payment time)
  const taxLines = Array.isArray(booking?.taxLines) ? booking.taxLines : [];

  // Fallback: compute from taxBreakdown if taxLines not stored
  const breakdown = booking?.taxBreakdown || {};
  const computedLines =
    taxLines.length === 0
      ? [
          { label: 'GST', value: Number(breakdown.gst || 0) },
          { label: 'Care Tax', value: Number(breakdown.careTax || 0) },
          {
            label: 'Repair & Warranty',
            value: Number(breakdown.repairWarranty || 0),
          },
          {
            label: 'Relocation Warranty',
            value: Number(breakdown.relocationWarranty || 0),
          },
          {
            label: 'Delivery & Packaging',
            value: Number(breakdown.deliveryPackaging || 0),
          },
          {
            label: 'Installation Fee',
            value: Number(breakdown.installationFee || 0),
          },
          { label: 'Platform Fee', value: Number(breakdown.platformFee || 0) },
        ].filter((t) => t.value > 0)
      : taxLines;

  const taxTotal = computedLines.reduce((s, t) => s + t.value, 0);
  const serviceFee =
    basePrice - taxTotal > 0 ? basePrice - taxTotal : basePrice;

  return (
    <div className="border-t border-gray-100 mx-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 14l-4-4 4-4M5 10h14M15 14l4-4-4-4"
            />
          </svg>
          Order Summary
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="pb-3 space-y-1.5 text-sm">
          {/* Service fee row */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">
                {booking?.serviceSnapshot?.productName || 'Service Fee'}
              </span>
              <span className="font-semibold text-gray-800">
                ₹{fmt(taxTotal > 0 ? serviceFee : basePrice)}/-
              </span>
            </div>
          </div>

          {/* Tax lines */}
          {computedLines.length > 0 &&
            computedLines.map((t) => (
              <div key={t.label} className="flex justify-between items-center">
                <span className="text-gray-500">{t.label}</span>
                <span className="font-semibold text-gray-800">
                  ₹{fmt(t.value)}/-
                </span>
              </div>
            ))}

          {booking?.isUrgent && (
            <div className="flex justify-between items-center">
              <span className="text-amber-600">Urgent Fee</span>
              <span className="font-semibold text-amber-600">₹150/-</span>
            </div>
          )}

          {/* Total */}
          <div className="pt-2 mt-1 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-black">Total Paid</span>
            <span className="font-bold text-[#FF6F00] text-base">
              ₹{fmt(basePrice)}/-
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PayServiceNowButton({ booking, onPaid, onShowReceipt }) {
  const [loading, setLoading] = useState(false);
  const amount = Number(booking?.totalAmount || 0);

  const handlePay = async () => {
    setLoading(true);
    try {
      const rzpRes = await apiCreateRazorpayOrder(amount);
      const { orderId: razorpayOrderId, amount: rzpAmount } = rzpRes.data;

      await new Promise((resolve, reject) => {
        const options = {
          key:
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
            'rzp_test_TF4N39zZPzWuGw',
          amount: rzpAmount,
          currency: 'INR',
          name: 'Rentnpay',
          description: 'Service Payment',
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              await apiVerifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
          theme: { color: '#F97316' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      await apiPayServiceBooking(booking._id, { paymentMethod: 'card' });

      const taxLines = Array.isArray(booking?.taxLines) ? booking.taxLines : [];
      const breakdown = booking?.taxBreakdown || {};
      const computedTaxLines =
        taxLines.length === 0
          ? [
              { label: 'GST', value: Number(breakdown.gst || 0) },
              { label: 'Care Tax', value: Number(breakdown.careTax || 0) },
              {
                label: 'Repair & Warranty',
                value: Number(breakdown.repairWarranty || 0),
              },
              {
                label: 'Relocation Warranty',
                value: Number(breakdown.relocationWarranty || 0),
              },
              {
                label: 'Delivery & Packaging',
                value: Number(breakdown.deliveryPackaging || 0),
              },
              {
                label: 'Installation Fee',
                value: Number(breakdown.installationFee || 0),
              },
              {
                label: 'Platform Fee',
                value: Number(breakdown.platformFee || 0),
              },
            ].filter((t) => t.value > 0)
          : taxLines;
      const taxAndFees = computedTaxLines.reduce((s, t) => s + t.value, 0);
      const serviceCharge =
        amount - taxAndFees > 0 ? amount - taxAndFees : amount;

      onShowReceipt?.({
        jobId:
          booking?.jobId ||
          String(booking?._id || '')
            .slice(-8)
            .toUpperCase() ||
          'SRV-0000',
        serviceName:
          booking?.serviceSnapshot?.productName ||
          booking?.serviceProduct?.productName ||
          'Service',
        technicianName: booking?.technicianName || '—',
        bookingDate: booking?.bookingDate,
        timeSlot: booking?.timeSlot?.label,
        serviceCharge,
        taxLines: computedTaxLines,
        taxAndFees,
        totalPaid: amount,
        paymentMethod: 'card',
        name: booking?.name,
        phone: booking?.phone,
        address: booking?.address,
      });

      await onPaid?.();
    } catch (err) {
      if (err.message === 'Payment cancelled') {
        alert('Payment was cancelled. Please try again.');
      } else {
        alert(
          err?.response?.data?.message || 'Payment failed. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold w-fit disabled:opacity-60"
    >
      <Wallet className="w-3.5 h-3.5" />
      {loading ? 'Processing…' : `Pay ₹${formatMoney(amount)}`}
    </button>
  );
}

function ServiceBookingCard({
  booking,
  onReschedule,
  onCancel,
  onOpenServiceReview,
  onPaid,
  onShowReceipt,
}) {
  // console.log('booking.serviceProduct:', booking?.serviceProduct);
  // console.log('booking.serviceSnapshot:', booking?.serviceSnapshot);
  const title =
    booking?.serviceSnapshot?.productName ||
    booking?.serviceProduct?.productName ||
    'Service booking';
  const img =
    booking?.serviceSnapshot?.image || booking?.serviceProduct?.image || '';
  // const oid = `SRV-${String(booking?._id || '')
  //   .slice(-3)
  //   .toUpperCase()}`;
  const oid = `SRV-${String(booking?.bookingNumber || 0).padStart(4, '0')}`;
  const rawStatus = String(booking?.status || 'pending');

  // const status =
  //   booking?.status === 'completed'
  //     ? 'Completed'
  //     : booking?.status === 'cancelled'
  //       ? 'Cancelled'
  //       : 'Scheduled';
  const status =
    booking?.status === 'completed'
      ? 'Completed'
      : booking?.status === 'cancelled'
        ? 'Cancelled'
        : booking?.status === 'confirmed' || booking?.status === 'in_progress'
          ? 'Confirmed'
          : 'Scheduled';

  const statusClass =
    booking?.status === 'completed'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : booking?.status === 'cancelled'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-[#DBEAFE] text-[#2563EB] border-[#DBEAFE]';

  // ── check if user already reviewed this booking ──
  const serviceDetailHref = (() => {
    const id =
      booking?.serviceProduct?._id ||
      (typeof booking?.serviceProduct === 'string'
        ? booking.serviceProduct
        : null) ||
      booking?.serviceSnapshot?.serviceProductId;
    return id ? `/service/${id}` : null;
  })();

  const [hasReview, setHasReview] = useState(false);
  const [reviewChecked, setReviewChecked] = useState(false);

  useEffect(() => {
    if (booking?.status !== 'completed') return;
    // const productId = booking.serviceProduct?._id || booking.serviceProduct;
    // if (!productId || !booking._id) return;
    const productId = resolveServiceProductId(booking);
    // console.log('resolved productId for review check:', productId, booking);
    if (!productId) return;
    apiGetMyServiceReview(String(productId))
      .then((res) => setHasReview(res.data?.exists === true))
      .catch(() => setHasReview(false))
      .finally(() => setReviewChecked(true));
  }, [booking?.status, booking?.serviceProduct]);

  return (
    <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* <div className="p-4">
        <div className="flex gap-4">
          {serviceDetailHref ? (
            <Link
              href={serviceDetailHref}
              className="relative shrink-0 w-28 h-28 block"
            >
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Calendar className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
                Service
              </span>
            </Link>
          ) : (
            <div className="relative shrink-0 w-28 h-28">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Calendar className="w-8 h-8" />
                  </div>
                )}
              </div>
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
                Service
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-500">
                Service ID:{' '}
                <span className="font-semibold text-black">{oid}</span>
              </p>
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}
              >
                {booking?.status === 'completed' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : booking?.status === 'cancelled' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                {status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Booked On:{' '}
              <span className="font-semibold text-black">
                {formatOrderDate(booking?.createdAt)}
              </span>
            </p>
            <p title={title} className="text-sm text-gray-500 mt-0.5">
              Service Name:{' '}
              <span className="font-semibold text-black">{title}</span>
            </p>

            {booking?.paymentMethod === 'pay_after_service' ? (
              <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Pay After Service
              </span>
            ) : null}
            <p className="text-sm text-gray-500 mt-1">
              Order Value:{' '}
              <span className={`font-bold ${ORANGE_TEXT}`}>
                ₹{formatMoney(booking?.totalAmount || 0)}
              </span>
            </p>

            {booking?.paymentStatus === 'pending' &&
            booking?.status === 'completed' ? (
              <Link
                href={`/payment?mode=service-pay&bookingId=${encodeURIComponent(
                  booking._id,
                )}&amount=${encodeURIComponent(booking.totalAmount || 0)}`}
                className="inline-flex items-center justify-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold w-fit"
              >
                <Wallet className="w-3.5 h-3.5" />
                Pay ₹{formatMoney(booking.totalAmount || 0)}
              </Link>
            ) : null}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4 hidden sm:inline-block" />
                <span>
                  Scheduled:
                  <span className="text-[#155DFC] font-semibold">
                    {formatOrderDate(booking?.bookingDate)} ·{' '}
                    {booking?.timeSlot?.label || '-'}
                  </span>
                </span>
              </p>

              <div className="flex flex-wrap gap-3 sm:shrink-0">
                {booking?.status === 'completed' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const spId = resolveServiceProductId(booking);
                      if (!spId) {
                        alert(
                          'This service listing is no longer available for review.',
                        );
                        return;
                      }
                      onOpenServiceReview?.({
                        serviceProductId: spId,
                        serviceName: title,
                        image: img,
                        vendorName:
                          booking.serviceSnapshot?.vendorName ||
                          booking.vendor?.fullName ||
                          'Service Provider',
                      });
                    }}
                    className="px-5 py-2.5 rounded-lg border-2 border-[#FF6F00] bg-white text-[#FF6F00] text-sm font-semibold hover:bg-orange-50 transition inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Star className="w-4 h-4" />
                    {reviewChecked && hasReview
                      ? 'Update Review'
                      : 'Rate & Review'}
                  </button>
                ) : booking?.status !== 'cancelled' ? (
                  <>
                    {booking?.status === 'pending' ? (
                      <RescheduleButton
                        booking={booking}
                        onReschedule={onReschedule}
                      />
                    ) : null}
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition whitespace-nowrap"
                      onClick={() => onCancel(booking)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Refund Processed: ₹
                      {formatMoney(
                        booking.refundAmount ?? booking.totalAmount ?? 0,
                      )}{' '}
                      to Source
                    </p>
                    {booking.lateFee > 0 && (
                      <p className="text-xs text-red-500">
                        Late cancellation fee deducted: ₹
                        {formatMoney(booking.lateFee)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {booking.cancelledBy === 'vendor'
                        ? 'Cancelled by vendor on '
                        : 'Cancelled on '}
                      {formatOrderDate(
                        booking.cancelledAt || booking.updatedAt,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ServiceOrderSummaryAccordion booking={booking} /> */}
      {/* Mobile — original layout, unchanged */}
      <div className="sm:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-black">Service ID: {oid}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Booked on: {formatOrderDate(booking?.createdAt)}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}
          >
            {booking?.status === 'completed' ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : booking?.status === 'cancelled' ? (
              <XCircle className="w-3.5 h-3.5" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            {status}
          </span>
        </div>
        <div className="p-4">
          <div className="flex gap-4">
            {serviceDetailHref ? (
              <Link
                href={serviceDetailHref}
                className="relative shrink-0 w-20 h-20 block"
              >
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
                  Service
                </span>
              </Link>
            ) : (
              <div className="relative shrink-0 w-20 h-20">
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
                  Service
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p title={title} className="text-sm text-gray-500">
                Product Name:{' '}
                {serviceDetailHref ? (
                  <Link
                    href={serviceDetailHref}
                    className="font-semibold text-black hover:text-[#FF6F00] transition-colors"
                  >
                    {title}
                  </Link>
                ) : (
                  <span className="font-semibold text-black">{title}</span>
                )}
              </p>
              {booking?.paymentMethod === 'pay_after_service' ? (
                <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Pay After Service
                </span>
              ) : null}
              {/* <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(booking?.totalAmount || 0)}
                </span>
              </p> */}
              <p className="text-sm text-gray-500 mt-0.5">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(booking?.totalAmount || 0)}/-
                </span>
              </p>
              {booking?.paymentStatus === 'pending' &&
              booking?.status === 'completed' ? (
                <PayServiceNowButton
                  booking={booking}
                  onPaid={onPaid}
                  onShowReceipt={onShowReceipt}
                />
              ) : null}

              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <Calendar className="w-4 h-4 hidden sm:inline-block" />
                <span>
                  Scheduled:
                  <span className="text-[#155DFC] font-semibold">
                    {formatOrderDate(booking?.bookingDate)} ·{' '}
                    {booking?.timeSlot?.label || '-'}
                  </span>
                </span>
              </p>

              <div className="mt-3 flex gap-2">
                {booking?.status === 'completed' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const spId = resolveServiceProductId(booking);
                      if (!spId) {
                        alert(
                          'This service listing is no longer available for review.',
                        );
                        return;
                      }
                      onOpenServiceReview?.({
                        serviceProductId: spId,
                        serviceName: title,
                        image: img,
                        vendorName:
                          booking.serviceSnapshot?.vendorName ||
                          booking.vendor?.fullName ||
                          'Service Provider',
                      });
                    }}
                    className="flex-1 py-2.5 rounded-lg border-2 border-[#FF6F00] bg-white text-[#FF6F00] text-sm font-semibold hover:bg-orange-50 transition inline-flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {reviewChecked && hasReview
                      ? 'Update Review'
                      : 'Rate & Review'}
                  </button>
                ) : booking?.status !== 'cancelled' ? (
                  <>
                    {booking?.status === 'pending' ? (
                      <RescheduleButton
                        booking={booking}
                        onReschedule={onReschedule}
                      />
                    ) : null}
                    <button
                      type="button"
                      className={`${
                        booking?.status === 'pending' ? 'flex-[3]' : 'flex-1'
                      } py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition`}
                      onClick={() => onCancel(booking)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Refund Processed: ₹
                      {formatMoney(
                        booking.refundAmount ?? booking.totalAmount ?? 0,
                      )}{' '}
                      to Source
                    </p>
                    {booking.lateFee > 0 && (
                      <p className="text-xs text-red-500">
                        Late cancellation fee deducted: ₹
                        {formatMoney(booking.lateFee)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {booking.cancelledBy === 'vendor'
                        ? 'Cancelled by vendor on '
                        : 'Cancelled on '}
                      {formatOrderDate(
                        booking.cancelledAt || booking.updatedAt,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <ServiceOrderSummaryAccordion booking={booking} />
      </div>

      {/* Desktop — redesigned layout */}
      <div className="hidden sm:block">
        <div className="p-4">
          <div className="flex gap-4">
            {serviceDetailHref ? (
              <Link
                href={serviceDetailHref}
                className="relative shrink-0 w-28 h-28 block"
              >
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
                  Service
                </span>
              </Link>
            ) : (
              <div className="relative shrink-0 w-28 h-28">
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold bg-blue-600">
                  Service
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-500">
                  Service ID:{' '}
                  <span className="font-semibold text-black">{oid}</span>
                </p>
                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}
                >
                  {booking?.status === 'completed' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : booking?.status === 'cancelled' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5" />
                  )}
                  {status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Booked On:{' '}
                <span className="font-semibold text-black">
                  {formatOrderDate(booking?.createdAt)}
                </span>
              </p>
              <p title={title} className="text-sm text-gray-500 mt-0.5">
                Service Name:{' '}
                <span className="font-semibold text-black">{title}</span>
              </p>
              {booking?.paymentMethod === 'pay_after_service' ? (
                <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Pay After Service
                </span>
              ) : null}
              {/* <p className="text-sm text-gray-500 mt-1">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(booking?.totalAmount || 0)}
                </span>
              </p> */}

              <p className="text-sm text-gray-500 mt-1">
                Order Value:{' '}
                <span className={`font-bold ${ORANGE_TEXT}`}>
                  ₹{formatMoney(booking?.totalAmount || 0)}/-
                </span>
              </p>
              {booking?.paymentStatus === 'pending' &&
              booking?.status === 'completed' ? (
                <PayServiceNowButton
                  booking={booking}
                  onPaid={onPaid}
                  onShowReceipt={onShowReceipt}
                />
              ) : null}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4 hidden sm:inline-block" />
                  <span>
                    Scheduled:
                    <span className="text-[#155DFC] font-semibold">
                      {formatOrderDate(booking?.bookingDate)} ·{' '}
                      {booking?.timeSlot?.label || '-'}
                    </span>
                  </span>
                </p>

                <div className="flex flex-wrap gap-3 sm:shrink-0">
                  {booking?.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const spId = resolveServiceProductId(booking);
                        if (!spId) {
                          alert(
                            'This service listing is no longer available for review.',
                          );
                          return;
                        }
                        onOpenServiceReview?.({
                          serviceProductId: spId,
                          serviceName: title,
                          image: img,
                          vendorName:
                            booking.serviceSnapshot?.vendorName ||
                            booking.vendor?.fullName ||
                            'Service Provider',
                        });
                      }}
                      className="px-5 py-2.5 rounded-lg border-2 border-[#FF6F00] bg-white text-[#FF6F00] text-sm font-semibold hover:bg-orange-50 transition inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Star className="w-4 h-4" />
                      {reviewChecked && hasReview
                        ? 'Update Review'
                        : 'Rate & Review'}
                    </button>
                  ) : booking?.status !== 'cancelled' ? (
                    <>
                      {booking?.status === 'pending' ? (
                        <RescheduleButton
                          booking={booking}
                          onReschedule={onReschedule}
                        />
                      ) : null}
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition whitespace-nowrap"
                        onClick={() => onCancel(booking)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Refund Processed: ₹
                        {formatMoney(
                          booking.refundAmount ?? booking.totalAmount ?? 0,
                        )}{' '}
                        to Source
                      </p>
                      {booking.lateFee > 0 && (
                        <p className="text-xs text-red-500">
                          Late cancellation fee deducted: ₹
                          {formatMoney(booking.lateFee)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {booking.cancelledBy === 'vendor'
                          ? 'Cancelled by vendor on '
                          : 'Cancelled on '}
                        {formatOrderDate(
                          booking.cancelledAt || booking.updatedAt,
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ServiceOrderSummaryAccordion booking={booking} />
      </div>
    </li>
  );
}

function RescheduleButton({ booking, onReschedule }) {
  const [fetching, setFetching] = useState(false);
  return (
    <button
      type="button"
      disabled={fetching}
      className="flex-[7] py-2.5 rounded-lg bg-blue-50 border-2 border-[#155DFC] text-[#155DFC] text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
      onClick={async () => {
        try {
          setFetching(true);
          const productId =
            booking.serviceProduct?._id || booking.serviceProduct;
          const res = await apiGetServiceById(String(productId));
          const fullProduct = res.data?.product || res.data;
          onReschedule({ product: fullProduct, booking });
        } catch {
          onReschedule({ product: booking.serviceProduct, booking });
        } finally {
          setFetching(false);
        }
      }}
    >
      <Calendar className="w-4 h-4 text-[#155DFC]" />
      {fetching ? 'Loading...' : 'Reschedule'}
    </button>
  );
}

// function LineRow({ img, title, qty, isSell, price, priceSuffix, variantName }) {
//   return (
//     <div className="flex gap-4">
//       <div className="relative shrink-0 w-20 h-20">
//         <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
//           {img ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={img} alt="" className="w-full h-full object-cover" />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center text-gray-400">
//               <Package className="w-8 h-8" />
//             </div>
//           )}
//         </div>
//         <span
//           className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
//             isSell ? 'bg-blue-600' : 'bg-orange-500'
//           }`}
//         >
//           {isSell ? 'Buy' : 'Rent'}
//         </span>
//       </div>

//       <div className="min-w-0 flex-1">
//         <div className="flex items-center gap-2 flex-wrap">
//           <p className="font-semibold text-black">{title}</p>

//           {variantName ? (
//             <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
//               {variantName}
//             </span>
//           ) : null}
//         </div>

//         {qty > 1 ? (
//           <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
//         ) : null}

//         <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
//           ₹{formatMoney(price)}
//           {priceSuffix ? (
//             <span className="text-sm font-medium text-gray-500 ml-1">
//               {priceSuffix}
//             </span>
//           ) : null}
//         </p>
//       </div>
//     </div>
//   );
// }

function LineRow({
  img,
  title,
  qty,
  isSell,
  price,
  priceSuffix,
  variantName,
  href,
}) {
  const Content = (
    <div className="flex gap-4">
      <div className="relative shrink-0 w-20 h-20">
        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
          {img ? (
            <img src={img} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>
        <span
          className={`absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded-full text-white font-semibold ${
            isSell ? 'bg-blue-600' : 'bg-orange-500'
          }`}
        >
          {isSell ? 'Buy' : 'Rent'}
        </span>
      </div>
      {/* <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`font-semibold text-black ${href ? 'hover:text-[#FF6F00] transition-colors' : ''}`}
          >
            {title}
          </p>
          {variantName ? (
            <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
              {variantName}
            </span>
          ) : null}
        </div> */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <p
            title={title}
            className={`font-semibold text-black truncate min-w-0 max-w-[135px] sm:max-w-none sm:whitespace-normal ${href ? 'hover:text-[#FF6F00] transition-colors' : ''}`}
          >
            {title}
          </p>
          {/* {variantName ? (
            <span className="text-xs font-semibold text-black border border-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
              {variantName}
            </span>
          ) : null} */}
          {/* null */}
        </div>
        {qty > 1 ? (
          <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
        ) : null}
        {/* <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
          ₹{formatMoney(price)}
          {priceSuffix ? (
            <span className="text-sm font-medium text-gray-500 ml-1">
              {priceSuffix}
            </span>
          ) : null}
        </p> */}
        <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
          ₹{formatMoney(price)}/-
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {Content}
      </Link>
    );
  }
  return Content;
}
