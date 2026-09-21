// 'use client';

// import { useCallback, useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { useParams, useRouter, useSearchParams } from 'next/navigation';
// import {
//   ArrowLeft,
//   Download,
//   Truck,
//   Home,
//   MapPin,
//   CreditCard,
//   Package,
//   AlertTriangle,
//   Info,
//   CheckCircle2,
//   CheckCircle,
// } from 'lucide-react';
// import { apiGetMyOrderById, apiCancelMyOrder } from '@/lib/api';
// import {
//   formatMoney,
//   formatOrderDate,
//   normalizeStatus,
//   orderDisplayId,
//   orderGrandTotal,
//   orderProductLines,
//   lineIsPurchase,
//   productImageUrl,
// } from '@/lib/orderRentalUtils';
// import { downloadOrderInvoicePDF } from '@/lib/orderInvoicePdf';

// const ORANGE_TEXT = 'text-[#FF6F00]';
// const BLUE_LINK = 'text-sky-600 hover:text-sky-700';
// const BLUE_BTN =
//   'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-sky-600 text-sky-600 text-sm font-semibold hover:bg-sky-50 transition-colors';

// function orderStatusLabel(st) {
//   switch (normalizeStatus(st)) {
//     case 'pending':
//       return 'Pending';
//     case 'confirmed':
//       return 'Processing';
//     default:
//       return String(st || '—');
//   }
// }

// function getCancelPolicy(status) {
//   const st = normalizeStatus(status);
//   if (st === 'pending' || st === 'confirmed')
//     return {
//       pct: 10,
//       message: 'Per policy, a 10% deduction applies at this stage.',
//     };
//   return null;
// }

// // function downloadInvoiceStub(order, displayRef, grandTotal) {
// //   const lines = [
// //     'RentNPay — Order summary',
// //     `Reference: ${displayRef}`,
// //     `Placed: ${formatOrderDate(order.createdAt)}`,
// //     `Total: ₹${formatMoney(grandTotal)}`,
// //     '',
// //     `Ship to: ${order.name || ''}`,
// //     String(order.address || '').trim(),
// //     `Phone: ${order.phone || ''}`,
// //   ];
// //   const blob = new Blob([lines.join('\n')], {
// //     type: 'text/plain;charset=utf-8',
// //   });
// //   const url = URL.createObjectURL(blob);
// //   const a = document.createElement('a');
// //   a.href = url;
// //   a.download = `order-${displayRef}.txt`;
// //   a.click();
// //   URL.revokeObjectURL(url);
// // }

// // Only "Ordered" is complete (green). The remaining steps are shown in
// // orange to indicate the order is being worked on, instead of the
// // default gray "not started" look used on the full track page.
// function ProcessingShipmentStepper() {
//   const labels = ['Ordered', 'Packed', 'In Transit', 'Delivered'];
//   const stepComplete = [true, false, false, false];

//   return (
//     <div className="w-full overflow-x-auto pb-1">
//       <div className="flex items-start min-w-[280px] sm:min-w-0">
//         {labels.flatMap((label, i) => {
//           const done = stepComplete[i];
//           const circleClass = done
//             ? 'bg-emerald-500 border-emerald-500 text-white'
//             : 'bg-[#FFF1E6] border-[#FF6F00] text-[#FF6F00]';

//           const chunks = [
//             <div
//               key={`step-${label}`}
//               className="flex flex-col items-center flex-1 min-w-0"
//             >
//               <div
//                 className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${circleClass}`}
//               >
//                 {done ? (
//                   <CheckCircle
//                     className="w-5 h-5 sm:w-6 sm:h-6"
//                     strokeWidth={2.5}
//                   />
//                 ) : i === 1 ? (
//                   <Package className="w-5 h-5 sm:w-6 sm:h-6" />
//                 ) : i === 2 ? (
//                   <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
//                 ) : (
//                   <Home className="w-5 h-5 sm:w-6 sm:h-6" />
//                 )}
//               </div>
//               <p
//                 className={`mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight px-0.5 ${
//                   done ? 'text-gray-800' : 'text-[#FF6F00]'
//                 }`}
//               >
//                 {label}
//               </p>
//             </div>,
//           ];
//           if (i < labels.length - 1) {
//             chunks.push(
//               <div
//                 key={`line-${i}`}
//                 className="flex-1 h-0.5 self-start mt-5 sm:mt-6 mx-0.5 sm:mx-1 min-w-[12px] rounded-full bg-gray-200 overflow-hidden shrink"
//               >
//                 <div
//                   className={`h-full rounded-full ${done ? 'w-full bg-emerald-500' : 'w-0'}`}
//                 />
//               </div>,
//             );
//           }
//           return chunks;
//         })}
//       </div>
//     </div>
//   );
// }

// export default function ProcessingOrderTrackPage() {
//   const params = useParams();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const id = params?.id;
//   const lineIdx = Number(searchParams?.get('lineIdx') ?? 0);
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [cancelling, setCancelling] = useState(false);
//   const [showCancelModal, setShowCancelModal] = useState(false);

//   const load = useCallback(() => {
//     if (!id) return;
//     setLoading(true);
//     setError('');
//     apiGetMyOrderById(id)
//       .then((res) => setOrder(res.data))
//       .catch((err) => {
//         setOrder(null);
//         setError(err.response?.data?.message || 'Could not load this order.');
//       })
//       .finally(() => setLoading(false));
//   }, [id]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const displayRef = useMemo(
//     () => (order ? orderDisplayId(order) : ''),
//     [order],
//   );

//   const selectedLine = useMemo(() => {
//     if (!order) return null;
//     const lines = orderProductLines(order);
//     return lines[lineIdx] ?? lines[0] ?? null;
//   }, [order, lineIdx]);

//   const grandTotal = useMemo(() => {
//     if (!selectedLine) return order ? orderGrandTotal(order) : 0;
//     const unitPrice = Number(
//       selectedLine.pricePerDay ||
//         selectedLine.price ||
//         selectedLine.rentPrice ||
//         0,
//     );
//     const qty = Number(selectedLine.quantity || 1);
//     return unitPrice * qty;
//   }, [selectedLine, order]);

//   const policy = selectedLine ? getCancelPolicy(selectedLine.lineStatus) : null;
//   const st = selectedLine ? normalizeStatus(selectedLine.lineStatus) : '';
//   const showCancel =
//     policy && !['delivered', 'completed', 'cancelled'].includes(st);
//   const depositAmount = useMemo(() => {
//     if (!selectedLine) return 0;
//     if (lineIsPurchase(selectedLine)) return 0;
//     return Number(selectedLine.refundableDeposit || 0);
//   }, [selectedLine]);

//   // Other taxes/fees — sum of all order-level fee fields, excluding the
//   // refundable deposit (that's handled separately above).
//   const taxAmount = useMemo(() => {
//     if (!order) return 0;
//     return (
//       Number(order.gst || 0) +
//       Number(order.careProtection || 0) +
//       Number(order.repairWarranty || 0) +
//       Number(order.relocationWarranty || 0) +
//       Number(order.deliveryPackaging || 0) +
//       Number(order.installationFee || 0) +
//       Number(order.platformFee || 0) +
//       Number(order.deliveryFee || 0)
//     );
//   }, [order]);

//   const feeAmount =
//     policy && grandTotal > 0 ? Math.round((grandTotal * policy.pct) / 100) : 0;
//   const refundAmount =
//     Math.max(0, grandTotal - feeAmount) + depositAmount + taxAmount;

//   const handleCancel = () => {
//     setShowCancelModal(true);
//   };

//   const confirmCancelOrder = () => {
//     if (!order || !policy) return;
//     setCancelling(true);
//     const lineId = selectedLine?._id;

//     apiCancelMyOrder(order._id, lineId)
//       .then(() => {
//         router.push('/my-account?tab=orders?refresh=' + Date.now());
//       })
//       .catch((err) => {
//         window.alert(
//           err.response?.data?.message ||
//             'Cancellation failed. Please try again or contact support.',
//         );
//       })
//       .finally(() => {
//         setCancelling(false);
//         setShowCancelModal(false);
//       });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[50vh] flex items-center justify-center bg-[#F4F6FB]">
//         <div className="w-10 h-10 border-4 border-[#FF6F00] border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="min-h-[50vh] bg-[#F4F6FB] py-12 px-4">
//         <div className="max-w-3xl mx-auto text-center">
//           <p className="text-red-600 font-medium">
//             {error || 'Order not found'}
//           </p>
//           <Link
//             href="/my-account?tab=orders"
//             className={`inline-flex items-center gap-2 mt-6 text-sm font-bold ${ORANGE_TEXT}`}
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Orders
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 pb-16">
//       <div className="max-w-3xl mx-auto">
//         <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
//           <Link
//             href="/my-account?tab=orders"
//             className={`inline-flex items-center gap-2 text-sm font-medium ${BLUE_LINK}`}
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Orders
//           </Link>

//           <div className="flex items-start sm:items-start justify-between gap-3 sm:gap-4 mt-4">
//             <div className="min-w-0">
//               <h1 className="text-xl sm:text-1xl font-bold text-black tracking-tight truncate">
//                 {displayRef}
//               </h1>
//               <p className="text-xs sm:text-sm text-gray-500 mt-1">
//                 Placed on {formatOrderDate(order.createdAt)} · Item Price:
//                 <span className="font-bold text-black">
//                   {' '}
//                   ₹{formatMoney(grandTotal)}
//                 </span>
//               </p>
//             </div>

//             <button
//               type="button"
//               className={`${BLUE_BTN} shrink-0 self-start !px-2.5 sm:!px-4 !py-2 sm:!py-2.5 !text-xs sm:!text-sm whitespace-nowrap`}
//               onClick={() =>
//                 downloadOrderInvoicePDF(order, selectedLine, displayRef)
//               }
//             >
//               <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//               <span className="hidden xs:inline sm:inline">
//                 Download Invoice
//               </span>
//               <span className="xs:hidden sm:hidden">Invoice</span>
//             </button>
//           </div>
//         </div>

//         <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
//           <h2 className="text-base font-bold text-black">Shipment Status</h2>
//           <div className="mt-6">
//             <ProcessingShipmentStepper />
//           </div>
//           <div className="mt-6 inline-flex w-auto max-w-full items-center gap-1 rounded-lg bg-[#EFF6FF] border-2 border-[#BEDBFF] px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-black">
//             <Package className="w-4 h-4 shrink-0 text-black" />
//             <p className="text-xs sm:text-sm font-semibold whitespace-nowrap sm:whitespace-normal">
//               We&apos;ll notify you when your product ships.
//             </p>
//           </div>
//         </div>

//         <div className="mt-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
//           <h2 className="text-base font-bold text-black">Order Contents</h2>

//           <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div className="bg-white shadow-md rounded-xl p-4 sm:p-5">
//               <div className="flex items-center gap-2 text-sm font-semibold text-black">
//                 <div className="bg-[#EFF6FF] p-1.5 rounded-lg">
//                   <MapPin className="w-4 h-4 text-[#2563EB]" />
//                 </div>
//                 Shipping Address
//               </div>
//               <p className="mt-3 text-sm text-gray-700 leading-relaxed">
//                 {order.name}
//                 <br />
//                 {String(order.address || '')
//                   .split(/[\n,]+/)
//                   .map((s) => s.trim())
//                   .filter(Boolean)
//                   .join(', ') || order.address}
//               </p>
//               {order.phone ? (
//                 <p className="text-sm text-gray-500 mt-2">
//                   Phone: {order.phone}
//                 </p>
//               ) : null}
//             </div>

//             <div className="bg-white shadow-md rounded-xl p-4 sm:p-5">
//               <div className="flex items-center gap-2 text-sm font-semibold text-black">
//                 <div className="bg-[#F0FDF4] p-1.5 rounded-lg">
//                   <CreditCard className="w-4 h-4 text-[#10B981]" />
//                 </div>
//                 Payment Method
//               </div>
//               <p className="mt-3 text-sm text-gray-700">Paid online</p>
//               <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F0FDF4] text-[#10B981] px-2 py-1 rounded-md">
//                 <CheckCircle2 className="w-3.5 h-3.5" />
//                 Payment successful
//               </p>
//             </div>
//           </div>

//           {selectedLine ? (
//             <div className="mt-6 pt-6 border-t border-gray-100">
//               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                 Item
//               </p>
//               <ul className="space-y-3">
//                 {(() => {
//                   const pop = selectedLine.product;
//                   const variantName = selectedLine?.variantName || '';
//                   const variantId = selectedLine?.variantId;

//                   const variantImg = (() => {
//                     const variants = Array.isArray(pop?.variants)
//                       ? pop.variants
//                       : [];
//                     const allImgs = Array.isArray(pop?.images)
//                       ? pop.images.filter(Boolean)
//                       : [];
//                     if (
//                       (variantId || variantName) &&
//                       variants.length > 0 &&
//                       allImgs.length > 1
//                     ) {
//                       const matchedIdx = variants.findIndex(
//                         (v) =>
//                           (variantId &&
//                             String(v?._id || '') === String(variantId)) ||
//                           (variantName &&
//                             String(v?.variantName || '') === variantName),
//                       );
//                       if (matchedIdx !== -1) {
//                         const perVariant = Math.ceil(
//                           allImgs.length / variants.length,
//                         );
//                         const start = matchedIdx * perVariant;
//                         const slice = allImgs.slice(start, start + perVariant);
//                         if (slice[0]) return slice[0];
//                       }
//                     }
//                     return null;
//                   })();

//                   const img = productImageUrl(variantImg || pop?.image || '');
//                   const title = pop?.productName || pop?.title || 'Item';
//                   const isSell = lineIsPurchase(selectedLine);

//                   // return (
//                   //   <li className="flex gap-3 items-center">
//                   //     <div className="relative w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
//                   //       {img ? (
//                   //         <img
//                   //           src={img}
//                   //           alt=""
//                   //           className="w-full h-full object-cover"
//                   //         />
//                   //       ) : (
//                   //         <div className="w-full h-full flex items-center justify-center text-gray-400">
//                   //           <Package className="w-6 h-6" />
//                   //         </div>
//                   //       )}
//                   //       <span
//                   //         className={`absolute top-1 left-1 text-[8px] uppercase px-1 py-0.5 rounded-full text-white font-semibold ${isSell ? 'bg-blue-600' : 'bg-orange-500'}`}
//                   //       >
//                   //         {isSell ? 'Buy' : 'Rent'}
//                   //       </span>
//                   //     </div>
//                   //     <div className="min-w-0 flex-1">
//                   //       <p className="text-sm font-semibold text-black truncate">
//                   //         {title}
//                   //       </p>
//                   //       {variantName ? (
//                   //         <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
//                   //           {variantName}
//                   //         </span>
//                   //       ) : null}
//                   //       <p className="text-xs text-gray-500 mt-0.5">
//                   //         Qty {selectedLine.quantity ?? 1}
//                   //       </p>
//                   //     </div>
//                   //   </li>
//                   // );

//                   return (
//                     <li className="flex gap-3 items-center">
//                       <div className="relative w-24 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
//                         {img ? (
//                           <img
//                             src={img}
//                             alt=""
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-gray-400">
//                             <Package className="w-8 h-8" />
//                           </div>
//                         )}
//                         <span
//                           className={`absolute top-1 left-1 text-[8px] uppercase px-1 py-0.5 rounded-full text-white font-semibold ${isSell ? 'bg-blue-600' : 'bg-orange-500'}`}
//                         >
//                           {isSell ? 'Buy' : 'Rent'}
//                         </span>
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-sm font-semibold text-black truncate">
//                           {title}
//                         </p>
//                         {variantName ? (
//                           <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
//                             {variantName}
//                           </span>
//                         ) : null}
//                         <p className="text-xs text-gray-500 mt-0.5">
//                           Qty {selectedLine.quantity ?? 1}
//                         </p>
//                       </div>
//                     </li>
//                   );
//                 })()}
//               </ul>
//             </div>
//           ) : null}
//         </div>

//         {showCancel ? (
//           <div className="mt-5 rounded-xl border border-red-200 bg-red-50/80 p-5 sm:p-6">
//             <div className="flex gap-3">
//               <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
//               <div>
//                 <h2 className="text-base font-bold text-black">
//                   Want to cancel?
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Review the cancellation terms based on your order status.
//                 </p>
//               </div>
//             </div>

//             <div className="mt-5 bg-white rounded-lg border border-gray-200 p-4">
//               <p className="text-sm font-semibold text-black flex items-center gap-2">
//                 <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
//                 Order status: {orderStatusLabel(selectedLine?.lineStatus)}
//               </p>
//               <div className="mt-3 flex gap-2 rounded-lg bg-[#FFFBEB] border border-[#FEE685] px-3 py-2.5 text-xs text-[#973C00]">
//                 <Info className="w-4 h-4 shrink-0 mt-0.5" />
//                 {policy.message}
//               </div>
//             </div>
//             <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
//               <p className="text-sm font-bold text-black">Refund breakdown</p>
//               <div className="mt-3 space-y-2 text-sm">
//                 <div className="flex justify-between gap-4">
//                   <span className="text-gray-600">Product price</span>
//                   <span className="font-medium text-black">
//                     ₹{formatMoney(grandTotal)}
//                   </span>
//                 </div>
//                 {depositAmount > 0 ? (
//                   <div className="flex justify-between gap-4">
//                     <span className="text-gray-600">Security deposit</span>
//                     <span className="font-medium text-black">
//                       ₹{formatMoney(depositAmount)}
//                     </span>
//                   </div>
//                 ) : null}
//                 {taxAmount > 0 ? (
//                   <div className="flex justify-between gap-4">
//                     <span className="text-gray-600">Other taxes</span>
//                     <span className="font-medium text-black">
//                       ₹{formatMoney(taxAmount)}
//                     </span>
//                   </div>
//                 ) : null}
//                 {policy.pct > 0 ? (
//                   <div className="flex justify-between gap-4">
//                     <span className="text-gray-600">
//                       Cancellation fee ({policy.pct}%)
//                     </span>
//                     <span className="font-medium text-[#EF4444]">
//                       − ₹{formatMoney(feeAmount)}
//                     </span>
//                   </div>
//                 ) : null}
//               </div>
//               <div className="my-3 border-t border-gray-200" />
//               <div className="flex justify-between gap-4 items-center">
//                 <span className="text-sm font-semibold text-gray-800">
//                   Refund amount
//                 </span>
//                 <span className="text-lg font-bold text-[#EF4444]">
//                   ₹{formatMoney(refundAmount)}
//                 </span>
//               </div>
//             </div>

//             <button
//               type="button"
//               disabled={cancelling}
//               onClick={handleCancel}
//               className="mt-5 w-full py-3.5 rounded-xl bg-[#EF4444] hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold tracking-wide transition-colors"
//             >
//               {cancelling
//                 ? 'Processing…'
//                 : policy.pct > 0
//                   ? 'Accept deduction & cancel order'
//                   : 'Cancel order'}
//             </button>
//             <p className="text-xs text-gray-500 text-center mt-3">
//               By clicking, you agree to the cancellation fee and refund terms
//             </p>
//           </div>
//         ) : null}
//       </div>

//       {showCancelModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
//           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in">
//             <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-red-100">
//               <AlertTriangle className="w-7 h-7 text-red-600" />
//             </div>
//             <h3 className="text-xl font-bold text-center text-black mt-4">
//               Confirm Cancellation
//             </h3>
//             <p className="text-sm text-gray-600 text-center mt-2">
//               {policy?.pct > 0
//                 ? `A ${policy.pct}% deduction applies. Refund amount: ₹${formatMoney(refundAmount)}`
//                 : 'Are you sure you want to cancel this item?'}
//             </p>
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => setShowCancelModal(false)}
//                 className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
//               >
//                 No, Keep Order
//               </button>
//               <button
//                 onClick={confirmCancelOrder}
//                 disabled={cancelling}
//                 className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
//               >
//                 {cancelling ? 'Processing...' : 'Yes, Cancel'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Truck,
  Home,
  MapPin,
  CreditCard,
  Package,
  AlertTriangle,
  Info,
  CheckCircle2,
  CheckCircle,
} from 'lucide-react';
import { apiGetMyOrderById, apiCancelMyOrder } from '@/lib/api';
import {
  formatMoney,
  formatOrderDate,
  normalizeStatus,
  orderDisplayId,
  orderGrandTotal,
  orderProductLines,
  lineIsPurchase,
  productImageUrl,
  formatPaymentMethodLabel,
} from '@/lib/orderRentalUtils';
import { downloadOrderInvoicePDF } from '@/lib/orderInvoicePdf';

const ORANGE_TEXT = 'text-[#FF6F00]';
const BLUE_LINK = 'text-sky-600 hover:text-sky-700';
const BLUE_BTN =
  'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-sky-600 text-sky-600 text-sm font-semibold hover:bg-sky-50 transition-colors';

// function orderStatusLabel(st) {
// function formatPaymentMethodLabel(method) {
//   const raw = String(method || '').trim();
//   if (!raw) return 'Original Payment Source';
//   const map = {
//     netbanking: 'Net Banking',
//     card: 'Card',
//     upi: 'UPI',
//     wallet: 'Wallet',
//     emi: 'EMI',
//   };
//   return (
//     map[raw.toLowerCase()] ||
//     raw.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
//   );
// }

function orderStatusLabel(st) {
  switch (normalizeStatus(st)) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Processing';
    default:
      return String(st || '—');
  }
}

function getCancelPolicy(status) {
  const st = normalizeStatus(status);
  if (st === 'pending' || st === 'confirmed')
    return {
      pct: 10,
      message: 'Per policy, a 10% deduction applies at this stage.',
    };
  return null;
}

// function downloadInvoiceStub(order, displayRef, grandTotal) {
//   const lines = [
//     'RentNPay — Order summary',
//     `Reference: ${displayRef}`,
//     `Placed: ${formatOrderDate(order.createdAt)}`,
//     `Total: ₹${formatMoney(grandTotal)}`,
//     '',
//     `Ship to: ${order.name || ''}`,
//     String(order.address || '').trim(),
//     `Phone: ${order.phone || ''}`,
//   ];
//   const blob = new Blob([lines.join('\n')], {
//     type: 'text/plain;charset=utf-8',
//   });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = `order-${displayRef}.txt`;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// Only "Ordered" is complete (green). The remaining steps are shown in
// orange to indicate the order is being worked on, instead of the
// default gray "not started" look used on the full track page.
function ProcessingShipmentStepper() {
  const labels = ['Ordered', 'Packed', 'In Transit', 'Delivered'];
  const stepComplete = [true, false, false, false];

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-start min-w-[280px] sm:min-w-0">
        {labels.flatMap((label, i) => {
          const done = stepComplete[i];
          const circleClass = done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-[#FFF1E6] border-[#FF6F00] text-[#FF6F00]';

          const chunks = [
            <div
              key={`step-${label}`}
              className="flex flex-col items-center flex-1 min-w-0"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${circleClass}`}
              >
                {done ? (
                  <CheckCircle
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    strokeWidth={2.5}
                  />
                ) : i === 1 ? (
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : i === 2 ? (
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <p
                className={`mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight px-0.5 ${
                  done ? 'text-gray-800' : 'text-[#FF6F00]'
                }`}
              >
                {label}
              </p>
            </div>,
          ];
          if (i < labels.length - 1) {
            chunks.push(
              <div
                key={`line-${i}`}
                className="flex-1 h-0.5 self-start mt-5 sm:mt-6 mx-0.5 sm:mx-1 min-w-[12px] rounded-full bg-gray-200 overflow-hidden shrink"
              >
                <div
                  className={`h-full rounded-full ${done ? 'w-full bg-emerald-500' : 'w-0'}`}
                />
              </div>,
            );
          }
          return chunks;
        })}
      </div>
    </div>
  );
}

export default function ProcessingOrderTrackPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;
  const lineIdx = Number(searchParams?.get('lineIdx') ?? 0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [cancelling, setCancelling] = useState(false);
  // const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  // const [refundMethod, setRefundMethod] = useState('bank');
  const [refundMethod, setRefundMethod] = useState('original');
  const [refundForm, setRefundForm] = useState({
    upiId: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfsc: '',
  });
  const [refundFormError, setRefundFormError] = useState('');

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    apiGetMyOrderById(id)
      .then((res) => setOrder(res.data))
      .catch((err) => {
        setOrder(null);
        setError(err.response?.data?.message || 'Could not load this order.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const displayRef = useMemo(
    () => (order ? orderDisplayId(order) : ''),
    [order],
  );

  const selectedLine = useMemo(() => {
    if (!order) return null;
    const lines = orderProductLines(order);
    return lines[lineIdx] ?? lines[0] ?? null;
  }, [order, lineIdx]);

  const grandTotal = useMemo(() => {
    if (!selectedLine) return order ? orderGrandTotal(order) : 0;
    const unitPrice = Number(
      selectedLine.pricePerDay ||
        selectedLine.price ||
        selectedLine.rentPrice ||
        0,
    );
    const qty = Number(selectedLine.quantity || 1);
    return unitPrice * qty;
  }, [selectedLine, order]);

  const policy = selectedLine ? getCancelPolicy(selectedLine.lineStatus) : null;
  const st = selectedLine ? normalizeStatus(selectedLine.lineStatus) : '';
  const showCancel =
    policy && !['delivered', 'completed', 'cancelled'].includes(st);
  const depositAmount = useMemo(() => {
    if (!selectedLine) return 0;
    if (lineIsPurchase(selectedLine)) return 0;
    return Number(selectedLine.refundableDeposit || 0);
  }, [selectedLine]);

  // Other taxes/fees — sum of all order-level fee fields, excluding the
  // refundable deposit (that's handled separately above).
  const taxAmount = useMemo(() => {
    if (!order) return 0;
    return (
      Number(order.gst || 0) +
      Number(order.careProtection || 0) +
      Number(order.repairWarranty || 0) +
      Number(order.relocationWarranty || 0) +
      Number(order.deliveryPackaging || 0) +
      Number(order.installationFee || 0) +
      Number(order.platformFee || 0) +
      Number(order.deliveryFee || 0)
    );
  }, [order]);

  // const feeAmount =
  //   policy && grandTotal > 0 ? Math.round((grandTotal * policy.pct) / 100) : 0;
  // const refundAmount =
  //   Math.max(0, grandTotal - feeAmount) + depositAmount + taxAmount;
  const totalPaidAmount = grandTotal + depositAmount + taxAmount;
  const feeAmount =
    policy && totalPaidAmount > 0
      ? Math.round((totalPaidAmount * policy.pct) / 100)
      : 0;
  const refundAmount = Math.max(0, totalPaidAmount - feeAmount);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    if (!order || !policy) return;

    // if (refundMethod === 'upi') {
    //   if (!refundForm.upiId.trim()) {
    //     setRefundFormError('Please enter your UPI ID.');
    //     return;
    //   }
    // } else {
    //   if (
    //     !refundForm.bankAccountName.trim() ||
    //     !refundForm.bankAccountNumber.trim() ||
    //     !refundForm.bankIfsc.trim()
    //   ) {
    //     setRefundFormError('Please fill in all bank account details.');
    //     return;
    //   }
    // }
    // if (refundMethod === 'upi') {
    //   if (!refundForm.upiId.trim()) {
    //     setRefundFormError('Please enter your UPI ID.');
    //     return;
    //   }
    // } else if (refundMethod === 'bank') {
    //   if (
    //     !refundForm.bankAccountName.trim() ||
    //     !refundForm.bankAccountNumber.trim() ||
    //     !refundForm.bankIfsc.trim()
    //   ) {
    //     setRefundFormError('Please fill in all bank account details.');
    //     return;
    //   }
    // }
    // setRefundFormError('');
    if (refundMethod === 'upi') {
      const upiId = refundForm.upiId.trim();
      // Standard UPI VPA format: handle@bank — e.g. rahul@okhdfcbank
      const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiId) {
        setRefundFormError('Please enter your UPI ID.');
        return;
      }
      if (!upiPattern.test(upiId)) {
        setRefundFormError('Please enter a valid UPI ID (e.g. name@bank).');
        return;
      }
    } else if (refundMethod === 'bank') {
      const accName = refundForm.bankAccountName.trim();
      const accNumber = refundForm.bankAccountNumber.trim();
      const ifsc = refundForm.bankIfsc.trim().toUpperCase();

      if (!accName || !accNumber || !ifsc) {
        setRefundFormError('Please fill in all bank account details.');
        return;
      }
      if (!/^[a-zA-Z .]{3,100}$/.test(accName)) {
        setRefundFormError(
          'Account holder name should only contain letters and spaces.',
        );
        return;
      }
      if (!/^\d{9,18}$/.test(accNumber)) {
        setRefundFormError(
          'Please enter a valid account number (9-18 digits).',
        );
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        setRefundFormError(
          'Please enter a valid IFSC code (e.g. HDFC0001234).',
        );
        return;
      }
    }
    setRefundFormError('');
    setCancelling(true);
    const lineId = selectedLine?._id;
    const refundDetails = { method: refundMethod, ...refundForm };

    apiCancelMyOrder(order._id, lineId, refundDetails)
      .then(() => {
        router.push('/my-account?tab=orders?refresh=' + Date.now());
      })
      .catch((err) => {
        window.alert(
          err.response?.data?.message ||
            'Cancellation failed. Please try again or contact support.',
        );
      })
      .finally(() => {
        setCancelling(false);
        setShowCancelModal(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#F4F6FB]">
        <div className="w-10 h-10 border-4 border-[#FF6F00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[50vh] bg-[#F4F6FB] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-600 font-medium">
            {error || 'Order not found'}
          </p>
          <Link
            href="/my-account?tab=orders"
            className={`inline-flex items-center gap-2 mt-6 text-sm font-bold ${ORANGE_TEXT}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 pb-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <Link
            href="/my-account?tab=orders"
            className={`inline-flex items-center gap-2 text-sm font-medium ${BLUE_LINK}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="flex items-start sm:items-start justify-between gap-3 sm:gap-4 mt-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-1xl font-bold text-black tracking-tight truncate">
                {displayRef}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Placed on {formatOrderDate(order.createdAt)} · Item Price:
                <span className="font-bold text-black">
                  {' '}
                  ₹{formatMoney(grandTotal)}
                </span>
              </p>
            </div>

            <button
              type="button"
              className={`${BLUE_BTN} shrink-0 self-start !px-2.5 sm:!px-4 !py-2 sm:!py-2.5 !text-xs sm:!text-sm whitespace-nowrap`}
              onClick={() =>
                downloadOrderInvoicePDF(order, selectedLine, displayRef)
              }
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">
                Download Invoice
              </span>
              <span className="xs:hidden sm:hidden">Invoice</span>
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-bold text-black">Shipment Status</h2>
          <div className="mt-6">
            <ProcessingShipmentStepper />
          </div>
          <div className="mt-6 inline-flex w-auto max-w-full items-center gap-1 rounded-lg bg-[#EFF6FF] border-2 border-[#BEDBFF] px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-black">
            <Package className="w-4 h-4 shrink-0 text-black" />
            <p className="text-xs sm:text-sm font-semibold whitespace-nowrap sm:whitespace-normal">
              We&apos;ll notify you when your product ships.
            </p>
          </div>
        </div>

        <div className="mt-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-bold text-black">Order Contents</h2>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                <div className="bg-[#EFF6FF] p-1.5 rounded-lg">
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                </div>
                Shipping Address
              </div>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                {order.name}
                <br />
                {String(order.address || '')
                  .split(/[\n,]+/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .join(', ') || order.address}
              </p>
              {order.phone ? (
                <p className="text-sm text-gray-500 mt-2">
                  Phone: {order.phone}
                </p>
              ) : null}
            </div>

            <div className="bg-white shadow-md rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                <div className="bg-[#F0FDF4] p-1.5 rounded-lg">
                  <CreditCard className="w-4 h-4 text-[#10B981]" />
                </div>
                Payment Method
              </div>
              <p className="mt-3 text-sm text-gray-700">Paid online</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F0FDF4] text-[#10B981] px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Payment successful
              </p>
            </div>
          </div>

          {selectedLine ? (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Item
              </p>
              <ul className="space-y-3">
                {(() => {
                  const pop = selectedLine.product;
                  const variantName = selectedLine?.variantName || '';
                  const variantId = selectedLine?.variantId;

                  const variantImg = (() => {
                    const variants = Array.isArray(pop?.variants)
                      ? pop.variants
                      : [];
                    const allImgs = Array.isArray(pop?.images)
                      ? pop.images.filter(Boolean)
                      : [];
                    if (
                      (variantId || variantName) &&
                      variants.length > 0 &&
                      allImgs.length > 1
                    ) {
                      const matchedIdx = variants.findIndex(
                        (v) =>
                          (variantId &&
                            String(v?._id || '') === String(variantId)) ||
                          (variantName &&
                            String(v?.variantName || '') === variantName),
                      );
                      if (matchedIdx !== -1) {
                        const perVariant = Math.ceil(
                          allImgs.length / variants.length,
                        );
                        const start = matchedIdx * perVariant;
                        const slice = allImgs.slice(start, start + perVariant);
                        if (slice[0]) return slice[0];
                      }
                    }
                    return null;
                  })();

                  const img = productImageUrl(variantImg || pop?.image || '');
                  const title = pop?.productName || pop?.title || 'Item';
                  const isSell = lineIsPurchase(selectedLine);

                  // return (
                  //   <li className="flex gap-3 items-center">
                  //     <div className="relative w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  //       {img ? (
                  //         <img
                  //           src={img}
                  //           alt=""
                  //           className="w-full h-full object-cover"
                  //         />
                  //       ) : (
                  //         <div className="w-full h-full flex items-center justify-center text-gray-400">
                  //           <Package className="w-6 h-6" />
                  //         </div>
                  //       )}
                  //       <span
                  //         className={`absolute top-1 left-1 text-[8px] uppercase px-1 py-0.5 rounded-full text-white font-semibold ${isSell ? 'bg-blue-600' : 'bg-orange-500'}`}
                  //       >
                  //         {isSell ? 'Buy' : 'Rent'}
                  //       </span>
                  //     </div>
                  //     <div className="min-w-0 flex-1">
                  //       <p className="text-sm font-semibold text-black truncate">
                  //         {title}
                  //       </p>
                  //       {variantName ? (
                  //         <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                  //           {variantName}
                  //         </span>
                  //       ) : null}
                  //       <p className="text-xs text-gray-500 mt-0.5">
                  //         Qty {selectedLine.quantity ?? 1}
                  //       </p>
                  //     </div>
                  //   </li>
                  // );

                  return (
                    <li className="flex gap-3 items-center">
                      <div className="relative w-24 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
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
                        <span
                          className={`absolute top-1 left-1 text-[8px] uppercase px-1 py-0.5 rounded-full text-white font-semibold ${isSell ? 'bg-blue-600' : 'bg-orange-500'}`}
                        >
                          {isSell ? 'Buy' : 'Rent'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-black truncate">
                          {title}
                        </p>
                        {variantName ? (
                          <span className="inline-block mt-0.5 text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                            {variantName}
                          </span>
                        ) : null}
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty {selectedLine.quantity ?? 1}
                        </p>
                      </div>
                    </li>
                  );
                })()}
              </ul>
            </div>
          ) : null}
        </div>

        {showCancel ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50/80 p-5 sm:p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-black">
                  Want to cancel?
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Review the cancellation terms based on your order status.
                </p>
              </div>
            </div>

            <div className="mt-5 bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-semibold text-black flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                Order status: {orderStatusLabel(selectedLine?.lineStatus)}
              </p>
              <div className="mt-3 flex gap-2 rounded-lg bg-[#FFFBEB] border border-[#FEE685] px-3 py-2.5 text-xs text-[#973C00]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                {policy.message}
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-bold text-black">Refund breakdown</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Product price</span>
                  <span className="font-medium text-black">
                    ₹{formatMoney(grandTotal)}
                  </span>
                </div>
                {depositAmount > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Security deposit</span>
                    <span className="font-medium text-black">
                      ₹{formatMoney(depositAmount)}
                    </span>
                  </div>
                ) : null}
                {taxAmount > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Other taxes</span>
                    <span className="font-medium text-black">
                      ₹{formatMoney(taxAmount)}
                    </span>
                  </div>
                ) : null}
                {policy.pct > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Cancellation fee ({policy.pct}%)
                    </span>
                    <span className="font-medium text-[#EF4444]">
                      − ₹{formatMoney(feeAmount)}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="my-3 border-t border-gray-200" />
              <div className="flex justify-between gap-4 items-center">
                <span className="text-sm font-semibold text-gray-800">
                  Refund amount
                </span>
                <span className="text-lg font-bold text-[#EF4444]">
                  ₹{formatMoney(refundAmount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancel}
              className="mt-5 w-full py-3.5 rounded-xl bg-[#EF4444] hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold tracking-wide transition-colors"
            >
              {cancelling
                ? 'Processing…'
                : policy.pct > 0
                  ? 'Accept deduction & cancel order'
                  : 'Cancel order'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              By clicking, you agree to the cancellation fee and refund terms
            </p>
          </div>
        ) : null}
      </div>

      {/* {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-red-100">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-black mt-4">
              Confirm Cancellation
            </h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              {policy?.pct > 0
                ? `A ${policy.pct}% deduction applies. Refund amount: ₹${formatMoney(refundAmount)}`
                : 'Are you sure you want to cancel this item?'}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                No, Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Processing...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )} */}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-red-100">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-black mt-4">
              Confirm Cancellation
            </h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              {policy?.pct > 0
                ? `Refund amount: ₹${formatMoney(refundAmount)}`
                : 'Are you sure you want to cancel this item?'}
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-black mb-2">
                Where should we send your refund?
              </p>
              {/* <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setRefundMethod('bank')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                    refundMethod === 'bank'
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setRefundMethod('upi')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                    refundMethod === 'upi'
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  UPI
                </button>
              </div> */}
              <div className="grid grid-cols-3 gap-2 mb-3 mt-4">
                {order?.paymentMethod ? (
                  <button
                    type="button"
                    onClick={() => setRefundMethod('original')}
                    className={`relative py-2 px-1 rounded-lg text-xs sm:text-sm font-semibold border ${
                      refundMethod === 'original'
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                      Recommended
                    </span>
                    {/* <span className="block mt-2">Original Payment</span>
                    <span className="block text-[11px] font-normal mt-0.5">
                      {formatPaymentMethodLabel(order.paymentMethod)}
                    </span> */}
                    <span className="block mt-2">Original Payment</span>
                    <span className="block text-[11px] font-normal mt-0.5">
                      {formatPaymentMethodLabel(
                        order.paymentMethod,
                        order.paymentMethodDetail,
                      )}
                    </span>
                  </button>
                ) : null}
                {/* <button
                  type="button"
                  onClick={() => setRefundMethod('bank')}
                  className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-semibold border ${
                    refundMethod === 'bank'
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setRefundMethod('upi')}
                  className={`flex-1 min-w-[80px] py-2 rounded-lg text-sm font-semibold border ${
                    refundMethod === 'upi'
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  UPI
                </button> */}

                <button
                  type="button"
                  onClick={() => setRefundMethod('bank')}
                  className={`py-2 px-1 rounded-lg text-xs sm:text-sm font-semibold border ${
                    refundMethod === 'bank'
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setRefundMethod('upi')}
                  className={`py-2 px-1 rounded-lg text-xs sm:text-sm font-semibold border ${
                    refundMethod === 'upi'
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  UPI
                </button>
              </div>

              {/* {refundMethod === 'bank' ? ( */}
              {refundMethod === 'original' ? null : refundMethod === 'bank' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={refundForm.bankAccountName}
                    onChange={(e) =>
                      setRefundForm((f) => ({
                        ...f,
                        bankAccountName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-red-400"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={refundForm.bankAccountNumber}
                    onChange={(e) =>
                      setRefundForm((f) => ({
                        ...f,
                        bankAccountNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-red-400"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={refundForm.bankIfsc}
                    onChange={(e) =>
                      setRefundForm((f) => ({
                        ...f,
                        bankIfsc: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-red-400"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Your UPI ID (e.g. name@bank)"
                  value={refundForm.upiId}
                  onChange={(e) =>
                    setRefundForm((f) => ({ ...f, upiId: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-red-400"
                />
              )}

              {refundFormError ? (
                <p className="text-xs text-red-600 mt-2">{refundFormError}</p>
              ) : null}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                No, Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Processing...' : 'Confirm & Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
