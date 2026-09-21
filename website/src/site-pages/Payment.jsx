// 'use client';

// import { useEffect, useMemo, useRef, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import { clearAppliedCoupon, clearCart } from '../store/slices/cartSlice';
// import {
//   apiCreateBooking,
//   apiCreateOrder,
//   apiExtendMyOrderTenure,
//   apiGetGlobalTax,
//   apiSendOrderConfirmationEmail,
//   apiSendBookingConfirmationEmail,
//   apiPayServiceBooking,
//   apiPayNextMonth,
// } from '@/lib/api';
// import { toast } from 'react-toastify';
// import {
//   Building2,
//   CheckCircle2,
//   CreditCard,
//   Landmark,
//   Lock,
//   Smartphone,
// } from 'lucide-react';
// import { useSearchParams } from 'next/navigation';
// import ServiceReceiptModal from '@/components/ServiceReceiptModal';

// function safeParse(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// // Computes a single service booking's tax breakdown/total the same way
// // Cart.jsx's computeServiceBreakdown does, so bundled multi-service totals
// // on the payment page match what was shown in the cart.
// function computeBookingTotal(booking, globalTax, isCareProtectionEnabled) {
//   const tax = booking?.subCategoryTax || {};
//   const isBlocked = booking?.taxBlocked === true || tax?.taxBlocked === true;
//   const base = Number(booking?.totalAmount || 0);
//   if (isBlocked || !globalTax) return { base, taxLines: [], total: base };
//   const calc = (subKey, globalKey) => {
//     const rate =
//       tax[subKey] != null
//         ? Number(tax[subKey])
//         : (globalTax?.services?.[globalKey] ?? 0);
//     return Math.round((base * rate) / 100);
//   };
//   const taxLines = [
//     { label: 'GST', value: calc('defaultGst', 'gst') },
//     {
//       label: 'Care Tax',
//       value: isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0,
//     },
//     {
//       label: 'Repair & Warranty',
//       value: calc('defaultRepairWarranty', 'repairWarranty'),
//     },
//     {
//       label: 'Relocation Warranty',
//       value: calc('defaultRelocationWarranty', 'relocationWarranty'),
//     },
//     {
//       label: 'Delivery & Packaging',
//       value: calc('defaultDeliveryPackaging', 'deliveryPackaging'),
//     },
//     {
//       label: 'Installation Fee',
//       value: calc('defaultInstallationFee', 'installationFee'),
//     },
//     { label: 'Platform Fee', value: calc('defaultPlatformFee', 'platformFee') },
//   ].filter((t) => t.value > 0);
//   const total = base + taxLines.reduce((s, t) => s + t.value, 0);
//   return { base, taxLines, total };
// }

// // async function applyServiceOfferDiscount(booking) {
// //   if (!booking?.productId) return booking;
// //   try {
// //     const res = await apiGetPublicActiveOffers();
// //     const offers = res.data?.offers || [];
// //     const match = offers.find(
// //       (o) =>
// //         String(o.productId?._id || o.productId) === String(booking.productId),
// //     );
// //     const discountPercent = Number(match?.discountPercent || 0);
// //     if (!match || discountPercent <= 0) return booking;
// //     const baseAmount = Number(booking.totalAmount || 0);
// //     const discountedAmount = Math.max(
// //       0,
// //       Math.round(baseAmount - (baseAmount * discountPercent) / 100),
// //     );
// //     return { ...booking, totalAmount: discountedAmount };
// //   } catch {
// //     return booking;
// //   }
// // }

// // Note: booking.totalAmount saved from the booking modal is already the
// // final, discounted price — no re-fetching or re-applying the offer here.

// // function ServiceOrderSummary({ booking, globalTax }) {
// //   const [open, setOpen] = useState(false);
// //   const tax = booking?.subCategoryTax || {};

// //   const basePrice = Number(booking?.totalAmount || 0);

// //   // Calculate each tax from subcategory rates, fallback to globalTax.services
// //   const calcTax = (subKey, globalKey) => {
// //     const rate =
// //       tax[subKey] != null
// //         ? Number(tax[subKey])
// //         : (globalTax?.services?.[globalKey] ?? 0);
// //     return Math.round((basePrice * rate) / 100);
// //   };

// //   const gst = calcTax('defaultGst', 'gst');
// //   const careTax = calcTax('defaultCareTax', 'careTax');
// //   const repairWarranty = calcTax('defaultRepairWarranty', 'repairWarranty');
// //   const relocationWarranty = calcTax(
// //     'defaultRelocationWarranty',
// //     'relocationWarranty',
// //   );
// //   const deliveryPackaging = calcTax(
// //     'defaultDeliveryPackaging',
// //     'deliveryPackaging',
// //   );
// //   const installationFee = calcTax('defaultInstallationFee', 'installationFee');
// //   const platformFee = calcTax('defaultPlatformFee', 'platformFee');

// function ServiceOrderSummary({ booking, globalTax }) {
//   const [open, setOpen] = useState(false);
//   const tax = booking?.subCategoryTax || {};

//   // If subcategory OR category is taxBlocked, show no taxes
//   const isTaxBlocked = booking?.taxBlocked === true || tax?.taxBlocked === true;

//   const basePrice = Number(booking?.totalAmount || 0);

//   // Calculate each tax from subcategory rates, fallback to globalTax.services
//   const calcTax = (subKey, globalKey) => {
//     if (isTaxBlocked) return 0;
//     const rate =
//       tax[subKey] != null
//         ? Number(tax[subKey])
//         : (globalTax?.services?.[globalKey] ?? 0);
//     return Math.round((basePrice * rate) / 100);
//   };

//   const gst = calcTax('defaultGst', 'gst');
//   const careTax = calcTax('defaultCareTax', 'careTax');
//   const repairWarranty = calcTax('defaultRepairWarranty', 'repairWarranty');
//   const relocationWarranty = calcTax(
//     'defaultRelocationWarranty',
//     'relocationWarranty',
//   );
//   const deliveryPackaging = calcTax(
//     'defaultDeliveryPackaging',
//     'deliveryPackaging',
//   );
//   const installationFee = calcTax('defaultInstallationFee', 'installationFee');
//   const platformFee = calcTax('defaultPlatformFee', 'platformFee');

//   const taxTotal =
//     gst +
//     careTax +
//     repairWarranty +
//     relocationWarranty +
//     deliveryPackaging +
//     installationFee +
//     platformFee;
//   const grandTotal = basePrice + taxTotal;

//   const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

//   const taxLines = [
//     { label: 'GST', value: gst },
//     { label: 'Care Tax', value: careTax },
//     { label: 'Repair & Warranty', value: repairWarranty },
//     { label: 'Relocation Warranty', value: relocationWarranty },
//     { label: 'Delivery & Packaging', value: deliveryPackaging },
//     { label: 'Installation Fee', value: installationFee },
//     { label: 'Platform Fee', value: platformFee },
//   ].filter((t) => t.value > 0);

//   return (
//     <div className="mt-6 rounded-2xl border border-orange-100 bg-white shadow-sm overflow-hidden">
//       {/* Header row — always visible */}
//       <button
//         type="button"
//         onClick={() => setOpen((p) => !p)}
//         className="w-full flex items-center gap-3 p-4 text-left"
//       >
//         {booking.image ? (
//           <img
//             src={booking.image}
//             alt=""
//             className="h-14 w-14 rounded-xl object-cover shrink-0"
//           />
//         ) : null}
//         <div className="flex-1 min-w-0">
//           <p className="font-semibold text-gray-900">
//             {booking.serviceName || 'Service booking'}
//           </p>
//           <p className="text-xs text-gray-500 mt-0.5">
//             {booking.bookingDate} · {booking.timeSlot?.label}
//           </p>
//         </div>
//         <div className="text-right shrink-0">
//           {/* <p className="text-sm font-bold text-gray-900">₹{fmt(grandTotal)}</p> */}
//           <p className="text-xs text-orange-500 mt-0.5">
//             {open ? 'Hide summary ▲' : 'View summary ▼'}
//           </p>
//         </div>
//       </button>

//       {/* Expandable order summary */}
//       {open && (
//         <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2 text-sm">
//           <div className="flex justify-between text-gray-600">
//             <span>Service Fee</span>
//             <span className="font-medium">₹{fmt(basePrice)}</span>
//           </div>
//           {taxLines.map((t) => (
//             <div key={t.label} className="flex justify-between text-gray-600">
//               <span>{t.label}</span>
//               <span className="font-medium">₹{fmt(t.value)}</span>
//             </div>
//           ))}
//           {booking.isUrgent && (
//             <div className="flex justify-between text-amber-600">
//               <span>Urgent Fee</span>
//               <span className="font-medium">₹150</span>
//             </div>
//           )}
//           <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-1">
//             <span>Total</span>
//             <span>₹{fmt(grandTotal)}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function Payment() {
//   const searchParams = useSearchParams();
//   const isExtensionMode = searchParams.get('mode') === 'extension';
//   const isServiceMode = searchParams.get('mode') === 'service';
//   const isServicePayMode = searchParams.get('mode') === 'service-pay';
//   // const isPayNextMonthMode = searchParams.get('mode') === 'pay-next-month';
//   // const payNextMonthOrderId = searchParams.get('orderId') || '';
//   // const payNextMonthLabel = searchParams.get('month') || '';
//   // const payNextMonthBase = Number(searchParams.get('baseAmount') || 0);
//   // const payNextMonthLateFee = Number(searchParams.get('lateFeeAmount') || 0);
//   const isPayNextMonthMode = searchParams.get('mode') === 'pay-next-month';
//   const isPayNextMonthMultiMode =
//     searchParams.get('mode') === 'pay-next-month-multi';
//   const payNextMonthOrderId = searchParams.get('orderId') || '';
//   const payNextMonthLabel = searchParams.get('month') || '';
//   const payNextMonthBase = Number(searchParams.get('baseAmount') || 0);
//   const payNextMonthLateFee = Number(searchParams.get('lateFeeAmount') || 0);
//   const payNextMonthGst = Number(searchParams.get('gstAmount') || 0);
//   const payNextMonthCareTax = Number(searchParams.get('careTaxAmount') || 0);
//   const [pendingMultiMonthPayments, setPendingMultiMonthPayments] = useState(
//     [],
//   );
//   const servicePayBookingId = searchParams.get('bookingId') || '';
//   const servicePayAmount = Number(searchParams.get('amount') || 0);
//   const [pendingExtension, setPendingExtension] = useState(null);
//   const [pendingServiceBooking, setPendingServiceBooking] = useState(null);
//   // Multiple services added from the cart (bundled checkout) — separate
//   // from `pendingServiceBooking`, which is the single-service direct flow.
//   const [bundledServiceBookings, setBundledServiceBookings] = useState([]);
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const { items, appliedCoupon } = useSelector((s) => s.cart);
//   const discountAmount = appliedCoupon?.discountAmount || 0;
//   const isPaymentSuccessFlowRef = useRef(false);

//   // const isRentalItem = (item) =>
//   //   String(item?.productType || 'Rental') === 'Rental';
//   const isRentalItem = (item) =>
//     String(item?.productType || 'Rental') === 'Rental';

//   // Daily-rental items are always billed as a single flat total for the
//   // chosen date range (quantity is not a multiplier for them) — matches
//   // the same rule used in cart.js's totals.
//   const isDailyRentalItem = (item) =>
//     String(item?.productType || 'Rental') === 'Rental' &&
//     String(item?.tenureUnit || 'month') === 'day';

//   // NEW: monthly-tenure rental item (not daily, not buy)
//   const isMonthlyRentalItem = (item) =>
//     String(item?.productType || 'Rental') === 'Rental' &&
//     String(item?.tenureUnit || 'month') !== 'day';

//   const getItemQty = (item) =>
//     isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);

//   const [globalTax, setGlobalTax] = useState(null);
//   const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(true);

//   useEffect(() => {
//     const saved = localStorage.getItem('rentpay_care_protection_enabled');
//     setIsCareProtectionEnabled(saved === null ? true : saved === 'true');
//   }, []);

//   useEffect(() => {
//     const fetchTax = async () => {
//       try {
//         const res = await apiGetGlobalTax();
//         setGlobalTax(res.data?.data?.config || null);
//       } catch (e) {
//         console.error('Failed to load global tax', e);
//       }
//     };
//     fetchTax();
//   }, []);

//   // Base rental cost: saved tier price is already the full selected tenure
//   // (for both day-wise and month-wise rentals).
//   // const rentalBaseCost = useMemo(() => {
//   //   return items.reduce((sum, i) => {
//   //     if (!isRentalItem(i))
//   //       return sum + Number(i.pricePerDay || 0) * Number(i.quantity || 0);
//   //     return sum + Number(i.pricePerDay || 0) * Number(i.quantity || 0);
//   //   }, 0);
//   // }, [items]);
//   // const rentalBaseCost = useMemo(() => {
//   //   return items.reduce((sum, i) => {
//   //     const qty = getItemQty(i);
//   //     // Monthly rentals: item.pricePerDay stores the TOTAL tenure price
//   //     // (e.g. 3 months x 400 = 1200). On payment we only collect month 1.
//   //     if (isMonthlyRentalItem(i)) {
//   //       const months = Number(i.rentalMonths || 1) || 1;
//   //       const firstMonthPrice = Number(i.pricePerDay || 0) / months;
//   //       return sum + firstMonthPrice * qty;
//   //     }
//   //     return sum + Number(i.pricePerDay || 0) * qty;
//   //   }, 0);
//   // }, [items]);

//   const rentalBaseCost = useMemo(() => {
//     return items.reduce((sum, i) => {
//       const qty = getItemQty(i);
//       // Monthly rentals: item.pricePerDay already stores the FIRST-MONTH
//       // price (cart now saves first-month price directly, not the full
//       // tenure total), so no division is needed here anymore.
//       return sum + Number(i.pricePerDay || 0) * qty;
//     }, 0);
//   }, [items]);

//   const refundableDepositTotal = useMemo(() => {
//     return items.reduce((sum, i) => {
//       if (!isRentalItem(i)) return sum;
//       const deposit = Number(i.refundableDeposit || 0);
//       return sum + deposit * Number(i.quantity || 0);
//     }, 0);
//   }, [items]);

//   // const deliveryFee = useMemo(() => (items.length ? 99 : 0), [items.length]);
//   const deliveryFee = 0;

//   // const gst = useMemo(() => {
//   //   if (!globalTax || !items.length) return 0;
//   //   return items.reduce((sum, item) => {
//   //     const itemTotal =
//   //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//   //     const rate = isRentalItem(item)
//   //       ? (globalTax.rental?.gst ?? 0) / 100
//   //       : String(item.condition || '').toLowerCase() === 'refurbished'
//   //         ? (globalTax.buying_refurbished?.gst ?? 0) / 100
//   //         : (globalTax.buying_new?.gst ?? 0) / 100;
//   //     return sum + Math.round(itemTotal * rate);
//   //   }, 0);
//   // }, [items, globalTax]);
//   const gst = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const itemTotal =
//       //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//       const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
//       if (item.taxBlocked) return sum;
//       let rate = 0;
//       if (item.defaultGst != null) {
//         rate = Number(item.defaultGst) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.gst ?? 0) / 100;
//       } else {
//         const cond = String(item.condition || '').toLowerCase();
//         rate =
//           cond === 'refurbished'
//             ? (globalTax?.buying_refurbished?.gst ?? 0) / 100
//             : (globalTax?.buying_new?.gst ?? 0) / 100;
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   // const careProtection = useMemo(() => {
//   //   if (!items.length) return 0;
//   //   return items.reduce((sum, item) => {
//   //     const itemTotal =
//   //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//   //     if (item.taxBlocked) return sum;
//   //     let rate = 0;
//   //     if (item.defaultCareTax != null) {
//   //       rate = Number(item.defaultCareTax) / 100;
//   //     } else if (isRentalItem(item)) {
//   //       rate = (globalTax?.rental?.careTax ?? 0) / 100;
//   //     } else {
//   //       const cond = String(item.condition || '').toLowerCase();
//   //       rate =
//   //         cond === 'refurbished'
//   //           ? (globalTax?.buying_refurbished?.careTax ?? 0) / 100
//   //           : (globalTax?.buying_new?.careTax ?? 0) / 100;
//   //     }
//   //     return sum + Math.round(itemTotal * rate);
//   //   }, 0);
//   // }, [items, globalTax]);

//   const careProtection = useMemo(() => {
//     if (!items.length || !isCareProtectionEnabled) return 0;
//     return items.reduce((sum, item) => {
//       // const itemTotal =
//       //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//       const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
//       if (item.taxBlocked) return sum;
//       let rate = 0;
//       if (item.defaultCareTax != null) {
//         rate = Number(item.defaultCareTax) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.careTax ?? 0) / 100;
//       } else {
//         const cond = String(item.condition || '').toLowerCase();
//         rate =
//           cond === 'refurbished'
//             ? (globalTax?.buying_refurbished?.careTax ?? 0) / 100
//             : (globalTax?.buying_new?.careTax ?? 0) / 100;
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax, isCareProtectionEnabled]);

//   // const repairWarranty = useMemo(() => {
//   //   if (!globalTax || !items.length) return 0;
//   //   return items.reduce((sum, item) => {
//   //     const itemTotal =
//   //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//   //     const rate = isRentalItem(item)
//   //       ? (globalTax.rental?.repairWarranty ?? 0) / 100
//   //       : String(item.condition || '').toLowerCase() === 'refurbished'
//   //         ? (globalTax.buying_refurbished?.repairWarranty ?? 0) / 100
//   //         : (globalTax.buying_new?.repairWarranty ?? 0) / 100;
//   //     return sum + Math.round(itemTotal * rate);
//   //   }, 0);
//   // }, [items, globalTax]);
//   const repairWarranty = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const itemTotal =
//       //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//       const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
//       if (item.taxBlocked) return sum;
//       let rate = 0;
//       if (item.defaultRepairWarranty != null) {
//         rate = Number(item.defaultRepairWarranty) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.repairWarranty ?? 0) / 100;
//       } else {
//         const cond = String(item.condition || '').toLowerCase();
//         rate =
//           cond === 'refurbished'
//             ? (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100
//             : (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   // const relocationWarranty = useMemo(() => {
//   //   if (!globalTax || !items.length) return 0;
//   //   return items.reduce((sum, item) => {
//   //     const itemTotal =
//   //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//   //     const rate = isRentalItem(item)
//   //       ? (globalTax.rental?.relocationWarranty ?? 0) / 100
//   //       : String(item.condition || '').toLowerCase() === 'refurbished'
//   //         ? (globalTax.buying_refurbished?.relocationWarranty ?? 0) / 100
//   //         : (globalTax.buying_new?.relocationWarranty ?? 0) / 100;
//   //     return sum + Math.round(itemTotal * rate);
//   //   }, 0);
//   // }, [items, globalTax]);
//   const relocationWarranty = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const itemTotal =
//       //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//       const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
//       if (item.taxBlocked) return sum;
//       let rate = 0;
//       if (item.defaultRelocationWarranty != null) {
//         rate = Number(item.defaultRelocationWarranty) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.relocationWarranty ?? 0) / 100;
//       } else {
//         const cond = String(item.condition || '').toLowerCase();
//         rate =
//           cond === 'refurbished'
//             ? (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100
//             : (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   // const deliveryPackaging = useMemo(() => {
//   //   if (!globalTax || !items.length) return 0;
//   //   return items.reduce((sum, item) => {
//   //     const itemTotal =
//   //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//   //     const rate = isRentalItem(item)
//   //       ? (globalTax.rental?.deliveryPackaging ?? 0) / 100
//   //       : String(item.condition || '').toLowerCase() === 'refurbished'
//   //         ? (globalTax.buying_refurbished?.deliveryPackaging ?? 0) / 100
//   //         : (globalTax.buying_new?.deliveryPackaging ?? 0) / 100;
//   //     return sum + Math.round(itemTotal * rate);
//   //   }, 0);
//   // }, [items, globalTax]);
//   const deliveryPackaging = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const itemTotal =
//       //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//       const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
//       if (item.taxBlocked) return sum;
//       let rate = 0;
//       if (item.defaultDeliveryPackaging != null) {
//         rate = Number(item.defaultDeliveryPackaging) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.deliveryPackaging ?? 0) / 100;
//       } else {
//         const cond = String(item.condition || '').toLowerCase();
//         rate =
//           cond === 'refurbished'
//             ? (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100
//             : (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   // const installationFee = useMemo(() => {
//   //   if (!globalTax || !items.length) return 0;
//   //   return items.reduce((sum, item) => {
//   //     const itemTotal =
//   //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//   //     const rate = isRentalItem(item)
//   //       ? (globalTax.rental?.installationFee ?? 0) / 100
//   //       : String(item.condition || '').toLowerCase() === 'refurbished'
//   //         ? (globalTax.buying_refurbished?.installationFee ?? 0) / 100
//   //         : (globalTax.buying_new?.installationFee ?? 0) / 100;
//   //     return sum + Math.round(itemTotal * rate);
//   //   }, 0);
//   // }, [items, globalTax]);
//   const installationFee = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const itemTotal =
//       //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//       const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
//       if (item.taxBlocked) return sum;
//       let rate = 0;
//       if (item.defaultInstallationFee != null) {
//         rate = Number(item.defaultInstallationFee) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.installationFee ?? 0) / 100;
//       } else {
//         const cond = String(item.condition || '').toLowerCase();
//         rate =
//           cond === 'refurbished'
//             ? (globalTax?.buying_refurbished?.installationFee ?? 0) / 100
//             : (globalTax?.buying_new?.installationFee ?? 0) / 100;
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   // const platformFee = useMemo(() => {
//   //   if (!globalTax || !items.length) return 0;
//   //   return items.reduce((sum, item) => {
//   //     const itemTotal =
//   //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//   //     const rate = isRentalItem(item)
//   //       ? (globalTax.rental?.platformFee ?? 0) / 100
//   //       : String(item.condition || '').toLowerCase() === 'refurbished'
//   //         ? (globalTax.buying_refurbished?.platformFee ?? 0) / 100
//   //         : (globalTax.buying_new?.platformFee ?? 0) / 100;
//   //     return sum + Math.round(itemTotal * rate);
//   //   }, 0);
//   // }, [items, globalTax]);
//   const platformFee = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const itemTotal =
//       //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
//       const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
//       if (item.taxBlocked) return sum;
//       let rate = 0;
//       if (item.defaultPlatformFee != null) {
//         rate = Number(item.defaultPlatformFee) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.platformFee ?? 0) / 100;
//       } else {
//         const cond = String(item.condition || '').toLowerCase();
//         rate =
//           cond === 'refurbished'
//             ? (globalTax?.buying_refurbished?.platformFee ?? 0) / 100
//             : (globalTax?.buying_new?.platformFee ?? 0) / 100;
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const extensionTotal = useMemo(() => {
//     if (!isExtensionMode || !pendingExtension) return 0;
//     return Number(pendingExtension.newUnitRent || 0);
//   }, [isExtensionMode, pendingExtension]);

//   // const total = useMemo(() => {
//   //   return (
//   //     rentalBaseCost +
//   //     refundableDepositTotal +
//   //     deliveryFee +
//   //     gst +
//   //     careProtection
//   //   );
//   // }, [
//   //   rentalBaseCost,
//   //   refundableDepositTotal,
//   //   deliveryFee,
//   //   gst,
//   //   careProtection,
//   // ]);

//   // const total = useMemo(() => {
//   //   if (isServiceMode) return Number(pendingServiceBooking?.totalAmount || 0);
//   //   if (isExtensionMode) return extensionTotal;
//   const serviceTaxTotal = useMemo(() => {
//     if (!pendingServiceBooking) return 0;
//     if (!isServiceMode || !pendingServiceBooking) return 0;
//     const tax = pendingServiceBooking?.subCategoryTax || {};
//     const isTaxBlocked =
//       pendingServiceBooking?.taxBlocked === true || tax?.taxBlocked === true;
//     if (isTaxBlocked) return 0;
//     const base = Number(pendingServiceBooking?.totalAmount || 0);
//     const calcTax = (subKey, globalKey) => {
//       const rate =
//         tax[subKey] != null
//           ? Number(tax[subKey])
//           : (globalTax?.services?.[globalKey] ?? 0);
//       return Math.round((base * rate) / 100);
//     };
//     return (
//       calcTax('defaultGst', 'gst') +
//       calcTax('defaultCareTax', 'careTax') +
//       calcTax('defaultRepairWarranty', 'repairWarranty') +
//       calcTax('defaultRelocationWarranty', 'relocationWarranty') +
//       calcTax('defaultDeliveryPackaging', 'deliveryPackaging') +
//       calcTax('defaultInstallationFee', 'installationFee') +
//       calcTax('defaultPlatformFee', 'platformFee')
//     );
//   }, [isServiceMode, pendingServiceBooking, globalTax]);

//   const total = useMemo(() => {
//     if (isPayNextMonthMultiMode) {
//       return pendingMultiMonthPayments.reduce(
//         (sum, p) =>
//           sum +
//           Number(p.baseAmount || 0) +
//           Number(p.lateFeeAmount || 0) +
//           Number(p.gstAmount || 0) +
//           Number(p.careTaxAmount || 0),
//         0,
//       );
//     }
//     if (isPayNextMonthMode) {
//       return (
//         payNextMonthBase +
//         payNextMonthLateFee +
//         payNextMonthGst +
//         payNextMonthCareTax
//       );
//     }
//     if (isServicePayMode) return servicePayAmount;
//     if (isServiceMode)
//       return Number(pendingServiceBooking?.totalAmount || 0) + serviceTaxTotal;
//     if (isExtensionMode) return extensionTotal;
//     // const bundledServiceTotal = pendingServiceBooking
//     //   ? Number(pendingServiceBooking?.totalAmount || 0) + serviceTaxTotal
//     //   : 0;
//     const bundledServiceTotal = bundledServiceBookings.reduce(
//       (sum, b) =>
//         sum + computeBookingTotal(b, globalTax, isCareProtectionEnabled).total,
//       0,
//     );
//     return (
//       rentalBaseCost +
//       refundableDepositTotal +
//       deliveryFee +
//       gst +
//       careProtection +
//       repairWarranty +
//       relocationWarranty +
//       deliveryPackaging +
//       installationFee +
//       platformFee +
//       bundledServiceTotal -
//       discountAmount
//     );
//   }, [
//     isExtensionMode,
//     extensionTotal,
//     rentalBaseCost,
//     refundableDepositTotal,
//     deliveryFee,
//     gst,
//     careProtection,
//     repairWarranty,
//     relocationWarranty,
//     deliveryPackaging,
//     installationFee,
//     platformFee,
//     discountAmount,
//     isServiceMode,
//     pendingServiceBooking,
//     bundledServiceBookings,
//     serviceTaxTotal,
//     globalTax,
//     isCareProtectionEnabled,
//     isPayNextMonthMultiMode,
//     pendingMultiMonthPayments,
//     isPayNextMonthMode,
//     payNextMonthBase,
//     payNextMonthLateFee,
//     payNextMonthGst,
//     payNextMonthCareTax,
//   ]);

//   const baseServiceCharge = isServiceMode
//     ? Number(pendingServiceBooking?.totalAmount || 0)
//     : 0;
//   const taxAmount = 0; // or compute if your API returns it
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [instructions, setInstructions] = useState('');

//   const [method, setMethod] = useState('card'); // card | upi | netbanking
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [saveCardForRentals, setSaveCardForRentals] = useState(false);

//   // Dummy payment fields
//   const [cardNumber, setCardNumber] = useState('');
//   const [expiry, setExpiry] = useState('');
//   const [cvv, setCvv] = useState('');
//   const [nameOnCard, setNameOnCard] = useState('');
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [serviceReceiptData, setServiceReceiptData] = useState(null);
//   const [receiptRedirectUrl, setReceiptRedirectUrl] = useState('/');

//   // useEffect(() => {
//   //   // Prevent redirect-to-cart while we are clearing cart as part of a
//   //   // successful "Pay now" flow (we still navigate to payment-successful).
//   //   if (items.length === 0 && !isPaymentSuccessFlowRef.current) {
//   //     router.replace('/cart');
//   //     return;
//   //   }

//   //   const addr = safeParse(
//   //     localStorage.getItem('rentpay_checkout_selectedAddress'),
//   //   );
//   //   setSelectedAddress(addr || null);

//   //   const ins = safeParse(
//   //     localStorage.getItem('rentpay_checkout_instructions'),
//   //   );

//   //   if (isExtensionMode) {
//   //     const raw = localStorage.getItem('rentpay_pending_extension');
//   //     const ext = raw ? safeParse(raw) : null;
//   //     setPendingExtension(ext || null);
//   //   }
//   //   setInstructions(typeof ins === 'string' ? ins : '');
//   // }, [items.length, router]);

//   // useEffect(() => {
//   //   if (
//   //     items.length === 0 &&
//   //     !isPaymentSuccessFlowRef.current &&
//   //     !isExtensionMode &&
//   //     !isServiceMode
//   //   ) {
//   //     router.replace('/cart');
//   //     return;
//   //   }

//   //   const addr = safeParse(
//   //     localStorage.getItem('rentpay_checkout_selectedAddress'),
//   //   );
//   //   setSelectedAddress(addr || null);

//   //   const ins = safeParse(
//   //     localStorage.getItem('rentpay_checkout_instructions'),
//   //   );
//   //   setInstructions(typeof ins === 'string' ? ins : '');

//   //   if (isExtensionMode) {
//   //     const raw = localStorage.getItem('rentpay_pending_extension');
//   //     const ext = raw ? safeParse(raw) : null;
//   //     setPendingExtension(ext || null);
//   //   }
//   //   if (isServiceMode) {
//   //     const raw = localStorage.getItem('rentpay_pending_service_booking');
//   //     const booking = raw ? safeParse(raw) : null;
//   //     if (!booking) {
//   //       router.replace('/service');
//   //       return;
//   //     }
//   //     setPendingServiceBooking(booking);
//   //     if (booking.selectedAddress) setSelectedAddress(booking.selectedAddress);
//   //   }
//   // }, [items.length, router, isExtensionMode, isServiceMode]);

//   useEffect(() => {
//     // Check for a bundled service booking BEFORE deciding to redirect,
//     // so we don't bounce a service-only cart back to /cart.
//     const bundledServiceRawList = !isServiceMode
//       ? safeParse(localStorage.getItem('rentpay_pending_service_bookings'))
//       : null;
//     const bundledServiceRaw =
//       Array.isArray(bundledServiceRawList) && bundledServiceRawList.length > 0
//         ? bundledServiceRawList
//         : null;

//     if (
//       items.length === 0 &&
//       !bundledServiceRaw &&
//       !isPaymentSuccessFlowRef.current &&
//       !isExtensionMode &&
//       !isServiceMode &&
//       !isServicePayMode &&
//       !isPayNextMonthMode &&
//       !isPayNextMonthMultiMode
//     ) {
//       router.replace('/cart');
//       return;
//     }
//     const addr = safeParse(
//       localStorage.getItem('rentpay_checkout_selectedAddress'),
//     );
//     setSelectedAddress(addr || null);

//     const ins = safeParse(
//       localStorage.getItem('rentpay_checkout_instructions'),
//     );
//     setInstructions(typeof ins === 'string' ? ins : '');

//     if (isExtensionMode) {
//       const raw = localStorage.getItem('rentpay_pending_extension');
//       const ext = raw ? safeParse(raw) : null;
//       setPendingExtension(ext || null);
//     }
//     if (isServicePayMode) {
//       // No pending-booking localStorage needed for pay-later mode.
//       return;
//     }
//     if (isPayNextMonthMultiMode) {
//       const raw = localStorage.getItem('rentpay_pending_multi_month_payments');
//       const list = raw ? safeParse(raw) : null;
//       setPendingMultiMonthPayments(Array.isArray(list) ? list : []);
//       return;
//     }
//     //   if (isServiceMode) {
//     //     const raw = localStorage.getItem('rentpay_pending_service_booking');
//     //     const booking = raw ? safeParse(raw) : null;
//     //     if (!booking) {
//     //       router.replace('/service');
//     //       return;
//     //     }
//     //     setPendingServiceBooking(booking);
//     //     if (booking.selectedAddress) setSelectedAddress(booking.selectedAddress);
//     //   } else if (bundledServiceRaw) {
//     //     // Bundled checkout flow: pick up the pending service booking here too.
//     //     setPendingServiceBooking(bundledServiceRaw);
//     //   }
//     // }, [items.length, router, isExtensionMode, isServiceMode]);

//     if (isServiceMode) {
//       const raw = localStorage.getItem('rentpay_pending_service_booking');
//       const booking = raw ? safeParse(raw) : null;
//       if (!booking) {
//         router.replace('/service');
//         return;
//       }
//       if (booking.selectedAddress) setSelectedAddress(booking.selectedAddress);
//       setPendingServiceBooking(booking);
//     } else if (bundledServiceRaw) {
//       // Bundled checkout flow: pick up all pending service bookings here too.
//       setBundledServiceBookings(bundledServiceRaw);
//     }
//   }, [items.length, router, isExtensionMode, isServiceMode]);

//   const handlePay = async () => {
//     // if (isPayNextMonthMode && payNextMonthOrderId) {
//     //   setError('');
//     //   if (method === 'card') {
//     //     if (
//     //       !cardNumber.trim() ||
//     //       !expiry.trim() ||
//     //       !cvv.trim() ||
//     //       !nameOnCard.trim()
//     //     ) {
//     //       setError('Please fill card details.');
//     //       return;
//     //     }
//     //   }
//     //   setLoading(true);
//     //   try {
//     //     await apiPayNextMonth(payNextMonthOrderId);
//     // if (isPayNextMonthMode && payNextMonthOrderId) {
//     //   setError('');
//     //   if (method === 'card') {
//     //     if (
//     //       !cardNumber.trim() ||
//     //       !expiry.trim() ||
//     //       !cvv.trim() ||
//     //       !nameOnCard.trim()
//     //     ) {
//     //       setError('Please fill card details.');
//     //       return;
//     //     }
//     //   }
//     //   setLoading(true);
//     //   try {
//     //     const payNextMonthProductId = searchParams.get('productId') || '';
//     //     await apiPayNextMonth(payNextMonthOrderId, payNextMonthProductId);
//     if (isPayNextMonthMultiMode && pendingMultiMonthPayments.length > 0) {
//       setError('');
//       if (method === 'card') {
//         if (
//           !cardNumber.trim() ||
//           !expiry.trim() ||
//           !cvv.trim() ||
//           !nameOnCard.trim()
//         ) {
//           setError('Please fill card details.');
//           return;
//         }
//       }
//       setLoading(true);
//       try {
//         for (const item of pendingMultiMonthPayments) {
//           await apiPayNextMonth(item.orderId, item.productId);
//         }
//         toast.success('Rent payment successful!', {
//           position: 'top-right',
//           autoClose: 2000,
//           theme: 'light',
//         });
//         isPaymentSuccessFlowRef.current = true;
//         localStorage.removeItem('rentpay_pending_multi_month_payments');
//         setTimeout(() => {
//           router.push('/my-account?tab=orders&rentPaid=1');
//         }, 1500);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Payment failed.');
//         setLoading(false);
//       }
//       return;
//     }
//     if (isPayNextMonthMode && payNextMonthOrderId) {
//       setError('');
//       if (method === 'card') {
//         if (
//           !cardNumber.trim() ||
//           !expiry.trim() ||
//           !cvv.trim() ||
//           !nameOnCard.trim()
//         ) {
//           setError('Please fill card details.');
//           return;
//         }
//       }
//       setLoading(true);
//       try {
//         const payNextMonthProductId = searchParams.get('productId') || '';
//         await apiPayNextMonth(payNextMonthOrderId, payNextMonthProductId);
//         toast.success('Rent payment successful!', {
//           position: 'top-right',
//           autoClose: 2000,
//           theme: 'light',
//         });
//         isPaymentSuccessFlowRef.current = true;
//         setTimeout(() => {
//           router.push(
//             `/my-account?tab=orders&rentPaid=1&orderId=${encodeURIComponent(
//               payNextMonthOrderId,
//             )}`,
//           );
//         }, 1500);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Payment failed.');
//         setLoading(false);
//       }
//       return;
//     }
//     // if (isServicePayMode && servicePayBookingId) {
//     //   setError('');
//     //   if (method === 'card') {
//     //     if (
//     //       !cardNumber.trim() ||
//     //       !expiry.trim() ||
//     //       !cvv.trim() ||
//     //       !nameOnCard.trim()
//     //     ) {
//     //       setError('Please fill card details.');
//     //       return;
//     //     }
//     //   }
//     //   setLoading(true);
//     //   try {
//     //     await apiPayServiceBooking(servicePayBookingId, {
//     //       paymentMethod: method,
//     //     });
//     //     toast.success('Payment successful!', {
//     //       position: 'top-right',
//     //       autoClose: 2000,
//     //       theme: 'light',
//     //     });
//     //     isPaymentSuccessFlowRef.current = true;
//     //     setTimeout(() => {
//     //       router.push('/my-account?tab=orders&servicePaid=1');
//     //     }, 1500);
//     //   } catch (err) {
//     //     setError(err.response?.data?.message || 'Payment failed.');
//     //     setLoading(false);
//     //   }
//     //   return;
//     // }
//     if (isServicePayMode && servicePayBookingId) {
//       setError('');
//       if (method === 'card') {
//         if (
//           !cardNumber.trim() ||
//           !expiry.trim() ||
//           !cvv.trim() ||
//           !nameOnCard.trim()
//         ) {
//           setError('Please fill card details.');
//           return;
//         }
//       }
//       setLoading(true);
//       try {
//         const payRes = await apiPayServiceBooking(servicePayBookingId, {
//           paymentMethod: method,
//         });
//         const paidBooking = payRes?.data || {};
//         isPaymentSuccessFlowRef.current = true;

//         setReceiptRedirectUrl('/my-account?tab=orders&servicePaid=1');
//         setServiceReceiptData({
//           jobId: `SRV-${String(servicePayBookingId).slice(-8).toUpperCase()}`,
//           serviceName:
//             paidBooking?.serviceSnapshot?.productName ||
//             paidBooking?.serviceProduct?.productName ||
//             'Service',
//           technicianName: paidBooking?.technicianName || '—',
//           bookingDate: paidBooking?.bookingDate
//             ? new Date(paidBooking.bookingDate).toLocaleDateString('en-IN')
//             : '',
//           timeSlot: paidBooking?.timeSlot?.label || '',
//           serviceCharge: Number(
//             paidBooking?.baseAmount ?? servicePayAmount ?? 0,
//           ),
//           taxLines: Array.isArray(paidBooking?.taxLines)
//             ? paidBooking.taxLines
//             : [],
//           taxAndFees: 0,
//           totalPaid: Number(paidBooking?.totalAmount ?? servicePayAmount ?? 0),
//           paymentMethod: method,
//           serviceType: 'Pay After Service',
//         });
//         setShowReceiptModal(true);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Payment failed.');
//         setLoading(false);
//       }
//       return;
//     }
//     // At the TOP of the try block inside handlePay, before the existing rental logic:
//     // if (isExtensionMode && pendingExtension) {
//     //   const {
//     //     orderId,
//     //     productId,
//     //     extensionUnit,
//     //     extensionDuration,
//     //     newUnitRent,
//     //   } = pendingExtension;
//     //   const res = await apiExtendMyOrderTenure(orderId, {
//     //     extensionUnit,
//     //     extensionDuration,
//     //     newUnitRent,
//     //     productId,
//     //   });
//     //   const updated = res.data;
//     //   // Patch the order in Redux/local state isn't available here — we re-fetch on /my-rentals
//     //   localStorage.removeItem('rentpay_pending_extension');
//     //   isPaymentSuccessFlowRef.current = true;
//     //   router.push(
//     //     `/my-rentals?extensionSuccess=1&orderId=${encodeURIComponent(orderId)}`,
//     //   );
//     //   return;
//     // }

//     if (isExtensionMode && pendingExtension) {
//       const {
//         orderId,
//         productId,
//         extensionUnit,
//         extensionDuration,
//         newUnitRent,
//       } = pendingExtension;

//       await apiExtendMyOrderTenure(orderId, {
//         extensionUnit,
//         extensionDuration,
//         newUnitRent,
//         productId,
//       });

//       localStorage.removeItem('rentpay_pending_extension');

//       //  SHOW TOAST HERE
//       toast.success('Product tenure extended successfully!', {
//         position: 'top-right',
//         autoClose: 2000,
//         theme: 'light',
//       });

//       isPaymentSuccessFlowRef.current = true;

//       //  Delay redirect so toast is visible
//       setTimeout(() => {
//         // router.push(
//         //   `/my-rentals?extensionSuccess=1&orderId=${encodeURIComponent(orderId)}`,
//         // );
//         router.push(
//           `/my-account?tab=rentals&extensionSuccess=1&orderId=${encodeURIComponent(orderId)}`,
//         );
//       }, 2000);

//       return;
//     }
//     // ... existing rental order code continues below unchanged
//     setError('');
//     if (!selectedAddress) {
//       setError('Missing delivery address. Go back to checkout.');
//       return;
//     }
//     if (method === 'card') {
//       if (
//         !cardNumber.trim() ||
//         !expiry.trim() ||
//         !cvv.trim() ||
//         !nameOnCard.trim()
//       ) {
//         setError('Please fill card details.');
//         return;
//       }
//     }

//     if (isServicePayMode && method === 'pay_after_service') {
//       setError('Please choose a valid payment method.');
//       return;
//     }

//     setLoading(true);
//     try {
//       // if (isServiceMode && pendingServiceBooking) {
//       //   const bookingRes = await apiCreateBooking({
//       //     ...pendingServiceBooking,
//       //     paymentMethod: method,
//       //     address: addressLine,
//       //     phone: selectedAddress.phone,
//       //     name: selectedAddress.fullName,
//       //   });
//       //   const createdBookingId = bookingRes?.data?._id || '';
//       //   if (createdBookingId) {
//       //     localStorage.setItem('rentpay_last_service_booking_id', createdBookingId);
//       //   }
//       //   isPaymentSuccessFlowRef.current = true;
//       //   localStorage.removeItem('rentpay_pending_service_booking');
//       //   localStorage.removeItem('rentpay_checkout_selectedAddress');
//       //   router.push(
//       //     createdBookingId
//       //       ? `/payment-successful?bookingId=${encodeURIComponent(createdBookingId)}`
//       //       : '/payment-successful',
//       //   );
//       //   return;
//       // }

//       if (isServiceMode && pendingServiceBooking) {
//         // const bookingRes = await apiCreateBooking({
//         //   ...pendingServiceBooking,
//         //   paymentMethod: method,
//         //   address: addressLine,
//         //   phone: selectedAddress.phone,
//         //   name: selectedAddress.fullName,
//         // });
//         // const bookingRes = await apiCreateBooking({
//         //   ...pendingServiceBooking,
//         //   paymentMethod: method,
//         //   address: addressLine,
//         //   phone: selectedAddress.phone,
//         //   name: selectedAddress.fullName,
//         //   taxLines: receiptTaxLines,
//         //   taxBreakdown: Object.fromEntries(
//         //     receiptTaxLines.map((t) => [
//         //       t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//         //       t.value,
//         //     ]),
//         //   ),
//         // });

//         const svcTax = pendingServiceBooking?.subCategoryTax || {};
//         const svcBlocked =
//           pendingServiceBooking?.taxBlocked === true ||
//           svcTax?.taxBlocked === true;
//         const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
//         const calcSvcTax = (subKey, globalKey) => {
//           if (svcBlocked) return 0;
//           const rate =
//             svcTax[subKey] != null
//               ? Number(svcTax[subKey])
//               : (globalTax?.services?.[globalKey] ?? 0);
//           return Math.round((svcBase * rate) / 100);
//         };
//         const receiptTaxLines = [
//           { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
//           // { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
//           {
//             label: 'Care Tax',
//             value: isCareProtectionEnabled
//               ? calcSvcTax('defaultCareTax', 'careTax')
//               : 0,
//           },
//           {
//             label: 'Repair & Warranty',
//             value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
//           },
//           {
//             label: 'Relocation Warranty',
//             value: calcSvcTax(
//               'defaultRelocationWarranty',
//               'relocationWarranty',
//             ),
//           },
//           {
//             label: 'Delivery & Packaging',
//             value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
//           },
//           {
//             label: 'Installation Fee',
//             value: calcSvcTax('defaultInstallationFee', 'installationFee'),
//           },
//           {
//             label: 'Platform Fee',
//             value: calcSvcTax('defaultPlatformFee', 'platformFee'),
//           },
//         ].filter((t) => t.value > 0);

//         // const bookingRes = await apiCreateBooking({
//         //   ...pendingServiceBooking,
//         //   paymentMethod: method,
//         //   address: addressLine,
//         //   phone: selectedAddress.phone,
//         //   name: selectedAddress.fullName,
//         //   taxLines: receiptTaxLines,
//         //   taxBreakdown: Object.fromEntries(
//         //     receiptTaxLines.map((t) => [
//         //       t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//         //       t.value,
//         //     ]),
//         //   ),
//         // });
//         const bookingRes = await apiCreateBooking({
//           ...pendingServiceBooking,
//           paymentMethod: method,
//           address: addressLine,
//           phone: selectedAddress.phone,
//           name: selectedAddress.fullName,
//           totalAmount: total,
//           taxLines: receiptTaxLines,
//           taxBreakdown: Object.fromEntries(
//             receiptTaxLines.map((t) => [
//               t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//               t.value,
//             ]),
//           ),
//         });
//         const createdBookingId = bookingRes?.data?._id || '';
//         const bookingData = bookingRes?.data || {};
//         if (createdBookingId) {
//           localStorage.setItem(
//             'rentpay_last_service_booking_id',
//             createdBookingId,
//           );
//           apiSendBookingConfirmationEmail(createdBookingId).catch((e) =>
//             console.error('Booking confirmation email trigger failed', e),
//           );
//         }
//         isPaymentSuccessFlowRef.current = true;
//         localStorage.removeItem('rentpay_pending_service_booking');
//         localStorage.removeItem('rentpay_checkout_selectedAddress');

//         // Show receipt modal instead of redirecting
//         // setServiceReceiptData({
//         //   jobId:
//         //     bookingData.jobId ||
//         //     createdBookingId?.slice(-8)?.toUpperCase() ||
//         //     'SRV-0000',
//         //   serviceName: pendingServiceBooking.serviceName,
//         //   technicianName: bookingData.technicianName || '—',
//         //   bookingDate: pendingServiceBooking.bookingDate,
//         //   timeSlot: pendingServiceBooking.timeSlot?.label,
//         //   serviceCharge: baseServiceCharge, // see note below
//         //   taxAndFees: taxAmount,
//         //   totalPaid: total,
//         //   paymentMethod: method,
//         // const svcTax = pendingServiceBooking?.subCategoryTax || {};
//         // const svcBlocked =
//         //   pendingServiceBooking?.taxBlocked === true ||
//         //   svcTax?.taxBlocked === true;
//         // const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
//         // const calcSvcTax = (subKey, globalKey) => {
//         //   if (svcBlocked) return 0;
//         //   const rate =
//         //     svcTax[subKey] != null
//         //       ? Number(svcTax[subKey])
//         //       : (globalTax?.services?.[globalKey] ?? 0);
//         //   return Math.round((svcBase * rate) / 100);
//         // };
//         // const receiptTaxLines = [
//         //   { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
//         //   { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
//         //   {
//         //     label: 'Repair & Warranty',
//         //     value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
//         //   },
//         //   {
//         //     label: 'Relocation Warranty',
//         //     value: calcSvcTax(
//         //       'defaultRelocationWarranty',
//         //       'relocationWarranty',
//         //     ),
//         //   },
//         //   {
//         //     label: 'Delivery & Packaging',
//         //     value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
//         //   },
//         //   {
//         //     label: 'Installation Fee',
//         //     value: calcSvcTax('defaultInstallationFee', 'installationFee'),
//         //   },
//         //   {
//         //     label: 'Platform Fee',
//         //     value: calcSvcTax('defaultPlatformFee', 'platformFee'),
//         //   },
//         // ].filter((t) => t.value > 0);

//         setServiceReceiptData({
//           jobId:
//             bookingData.jobId ||
//             createdBookingId?.slice(-8)?.toUpperCase() ||
//             'SRV-0000',
//           serviceName: pendingServiceBooking.serviceName,
//           technicianName: bookingData.technicianName || '—',
//           bookingDate: pendingServiceBooking.bookingDate,
//           timeSlot: pendingServiceBooking.timeSlot?.label,
//           serviceCharge: baseServiceCharge,
//           taxLines: receiptTaxLines,
//           taxAndFees: taxAmount,
//           totalPaid: total,
//           paymentMethod: method,
//         });

//         setShowReceiptModal(true);
//         return;
//       }

//       // const rentalItems = items.filter(
//       //   (i) => String(i.productType || 'Rental') === 'Rental',
//       // );
//       // Service-only bundled checkout (no rent/buy items in cart) — skip order creation entirely.
//       if (items.length === 0 && bundledServiceBookings.length > 0) {
//         const createdBookings = [];
//         for (const booking of bundledServiceBookings) {
//           const { taxLines, total: bTotal } = computeBookingTotal(
//             booking,
//             globalTax,
//             isCareProtectionEnabled,
//           );
//           const bookingRes = await apiCreateBooking({
//             ...booking,
//             paymentMethod: method,
//             address: addressLine,
//             phone: selectedAddress.phone,
//             name: selectedAddress.fullName,
//             totalAmount: bTotal,
//             taxLines,
//             taxBreakdown: Object.fromEntries(
//               taxLines.map((t) => [
//                 t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//                 t.value,
//               ]),
//             ),
//           });
//           const bookingId = bookingRes?.data?._id;
//           if (bookingId) {
//             apiSendBookingConfirmationEmail(bookingId).catch((e) =>
//               console.error('Booking confirmation email trigger failed', e),
//             );
//           }
//           createdBookings.push({
//             booking,
//             bookingId,
//             bookingData: bookingRes?.data || {},
//             taxLines,
//             base: Number(booking?.totalAmount || 0),
//             total: bTotal,
//           });
//         }

//         isPaymentSuccessFlowRef.current = true;
//         localStorage.removeItem('rentpay_pending_service_bookings');
//         localStorage.removeItem('rentpay_checkout_selectedAddress');
//         localStorage.removeItem('rentpay_checkout_instructions');

//         if (method === 'pay_after_service') {
//           router.push('/my-account?tab=orders');
//           return;
//         }

//         const combinedBase = createdBookings.reduce((s, c) => s + c.base, 0);
//         const combinedTotal = createdBookings.reduce((s, c) => s + c.total, 0);
//         const combinedTaxLines = [];
//         createdBookings.forEach((c) => {
//           c.taxLines.forEach((t) => {
//             const existing = combinedTaxLines.find((x) => x.label === t.label);
//             if (existing) existing.value += t.value;
//             else combinedTaxLines.push({ ...t });
//           });
//         });
//         const first = createdBookings[0];

//         setReceiptRedirectUrl('/my-account?tab=orders');
//         setServiceReceiptData({
//           jobId:
//             first.bookingData.jobId ||
//             first.bookingId?.slice(-8)?.toUpperCase() ||
//             'SRV-0000',
//           serviceName:
//             createdBookings.length > 1
//               ? `${first.booking.serviceName} + ${createdBookings.length - 1} more`
//               : first.booking.serviceName,
//           technicianName: first.bookingData.technicianName || '—',
//           bookingDate: first.booking.bookingDate,
//           timeSlot: first.booking.timeSlot?.label,
//           serviceCharge: combinedBase,
//           taxLines: combinedTaxLines,
//           taxAndFees: combinedTaxLines.reduce((s, t) => s + t.value, 0),
//           totalPaid: combinedTotal,
//           paymentMethod: method,
//         });
//         setShowReceiptModal(true);
//         return;
//       }
//       if (false) {
//         const svcTax = pendingServiceBooking?.subCategoryTax || {};
//         const svcBlocked =
//           pendingServiceBooking?.taxBlocked === true ||
//           svcTax?.taxBlocked === true;
//         const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
//         const calcSvcTax = (subKey, globalKey) => {
//           if (svcBlocked) return 0;
//           const rate =
//             svcTax[subKey] != null
//               ? Number(svcTax[subKey])
//               : (globalTax?.services?.[globalKey] ?? 0);
//           return Math.round((svcBase * rate) / 100);
//         };
//         // const receiptTaxLines = [
//         //   { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
//         //   { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
//         //   {
//         //     label: 'Repair & Warranty',
//         //     value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
//         //   },
//         //   {
//         //     label: 'Relocation Warranty',
//         //     value: calcSvcTax(
//         //       'defaultRelocationWarranty',
//         //       'relocationWarranty',
//         //     ),
//         //   },
//         //   {
//         //     label: 'Delivery & Packaging',
//         //     value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
//         //   },
//         //   {
//         //     label: 'Installation Fee',
//         //     value: calcSvcTax('defaultInstallationFee', 'installationFee'),
//         //   },
//         //   {
//         //     label: 'Platform Fee',
//         //     value: calcSvcTax('defaultPlatformFee', 'platformFee'),
//         //   },
//         // ].filter((t) => t.value > 0);
//         // const svcTotal =
//         //   svcBase + receiptTaxLines.reduce((s, t) => s + t.value, 0);

//         // await apiCreateBooking({
//         const receiptTaxLines = [
//           { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
//           {
//             label: 'Care Tax',
//             value: isCareProtectionEnabled
//               ? calcSvcTax('defaultCareTax', 'careTax')
//               : 0,
//           },
//           {
//             label: 'Repair & Warranty',
//             value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
//           },
//           {
//             label: 'Relocation Warranty',
//             value: calcSvcTax(
//               'defaultRelocationWarranty',
//               'relocationWarranty',
//             ),
//           },
//           {
//             label: 'Delivery & Packaging',
//             value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
//           },
//           {
//             label: 'Installation Fee',
//             value: calcSvcTax('defaultInstallationFee', 'installationFee'),
//           },
//           {
//             label: 'Platform Fee',
//             value: calcSvcTax('defaultPlatformFee', 'platformFee'),
//           },
//         ].filter((t) => t.value > 0);
//         const svcTotal =
//           svcBase + receiptTaxLines.reduce((s, t) => s + t.value, 0);

//         // await apiCreateBooking({
//         //   ...pendingServiceBooking,
//         //   paymentMethod: method,
//         //   address: addressLine,
//         //   phone: selectedAddress.phone,
//         //   name: selectedAddress.fullName,
//         //   totalAmount: svcTotal,
//         //   taxLines: receiptTaxLines,
//         //   taxBreakdown: Object.fromEntries(
//         //     receiptTaxLines.map((t) => [
//         //       t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//         //       t.value,
//         //     ]),
//         //   ),
//         // });

//         // isPaymentSuccessFlowRef.current = true;
//         // localStorage.removeItem('rentpay_pending_service_booking');
//         // localStorage.removeItem('rentpay_checkout_selectedAddress');
//         // localStorage.removeItem('rentpay_checkout_instructions');
//         // router.push('/payment-successful');
//         // return;

//         const soloBookingRes = await apiCreateBooking({
//           ...pendingServiceBooking,
//           paymentMethod: method,
//           address: addressLine,
//           phone: selectedAddress.phone,
//           name: selectedAddress.fullName,
//           totalAmount: svcTotal,
//           taxLines: receiptTaxLines,
//           taxBreakdown: Object.fromEntries(
//             receiptTaxLines.map((t) => [
//               t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//               t.value,
//             ]),
//           ),
//         });

//         //   const soloBookingId = soloBookingRes?.data?._id;
//         //   if (soloBookingId) {
//         //     apiSendBookingConfirmationEmail(soloBookingId).catch((e) =>
//         //       console.error('Booking confirmation email trigger failed', e),
//         //     );
//         //   }

//         //   isPaymentSuccessFlowRef.current = true;
//         //   localStorage.removeItem('rentpay_pending_service_booking');
//         //   localStorage.removeItem('rentpay_checkout_selectedAddress');
//         //   localStorage.removeItem('rentpay_checkout_instructions');
//         //   router.push(
//         //     method === 'pay_after_service'
//         //       ? '/my-account?tab=orders'
//         //       : '/payment-successful',
//         //   );
//         //   return;
//         // }

//         const soloBookingId = soloBookingRes?.data?._id;
//         const soloBookingData = soloBookingRes?.data || {};
//         if (soloBookingId) {
//           apiSendBookingConfirmationEmail(soloBookingId).catch((e) =>
//             console.error('Booking confirmation email trigger failed', e),
//           );
//         }

//         isPaymentSuccessFlowRef.current = true;
//         localStorage.removeItem('rentpay_pending_service_booking');
//         localStorage.removeItem('rentpay_checkout_selectedAddress');
//         localStorage.removeItem('rentpay_checkout_instructions');

//         if (method === 'pay_after_service') {
//           router.push('/my-account?tab=orders');
//           return;
//         }

//         setReceiptRedirectUrl('/my-account?tab=orders');
//         setServiceReceiptData({
//           jobId:
//             soloBookingData.jobId ||
//             soloBookingId?.slice(-8)?.toUpperCase() ||
//             'SRV-0000',
//           serviceName: pendingServiceBooking.serviceName,
//           technicianName: soloBookingData.technicianName || '—',
//           bookingDate: pendingServiceBooking.bookingDate,
//           timeSlot: pendingServiceBooking.timeSlot?.label,
//           serviceCharge: svcBase,
//           taxLines: receiptTaxLines,
//           taxAndFees: receiptTaxLines.reduce((s, t) => s + t.value, 0),
//           totalPaid: svcTotal,
//           paymentMethod: method,
//         });
//         setShowReceiptModal(true);
//         return;
//       }

//       const rentalItems = items.filter(
//         (i) => String(i.productType || 'Rental') === 'Rental',
//       );
//       const rentalDuration = Number(rentalItems?.[0]?.rentalMonths || 1);
//       const tenureUnit =
//         rentalItems?.[0]?.tenureUnit === 'day' ? 'day' : 'month';

//       console.log(
//         'ORDER PAYLOAD:',
//         items.map((i) => ({
//           productId: i.productId,
//           variantId: i.variantId,
//           variantName: i.variantName,
//         })),
//       );

//       // const orderRes = await apiCreateOrder({
//       //   products: items.map((i) => ({
//       //     product: i.productId,
//       //     variantId: i.variantId || null,
//       //     quantity: Number(i.quantity),
//       //     pricePerDay: Number(i.pricePerDay),
//       //   })),
//       //   rentalDuration: rentalDuration,
//       //   tenureUnit,
//       //   address: addressLine,
//       //   phone: selectedAddress.phone,
//       //   name: selectedAddress.fullName,
//       //   couponId: appliedCoupon?.couponId || null,
//       //   discountAmount: appliedCoupon?.discountAmount || 0,
//       //   // ── price snapshot ──────────────────────────────
//       //   totalAmount: total,
//       //   baseRentalCost: rentalBaseCost,
//       //   deliveryFee: deliveryFee,
//       //   gst: gst,
//       //   refundableDeposit: refundableDepositTotal,
//       //   careProtection: careProtection,
//       // });

//       const orderRes = await apiCreateOrder({
//         products: items.map((i) => ({
//           product: i.productId,
//           variantId: i.variantId || null,
//           quantity: Number(i.quantity),
//           pricePerDay: Number(i.pricePerDay),
//         })),
//         rentalDuration: rentalDuration,
//         tenureUnit,
//         address: addressLine,
//         phone: selectedAddress.phone,
//         name: selectedAddress.fullName,
//         couponId: appliedCoupon?.couponId || null,
//         discountAmount: appliedCoupon?.discountAmount || 0,
//         // // ── price snapshot ──────────────────────────────
//         // totalAmount: total,
//         // baseRentalCost: rentalBaseCost,
//         // deliveryFee: deliveryFee,
//         // gst: gst,
//         // refundableDeposit: refundableDepositTotal,
//         // careProtection: careProtection,
//         // ── price snapshot ──────────────────────────────
//         totalAmount: total,
//         baseRentalCost: rentalBaseCost,
//         deliveryFee: deliveryFee,
//         gst: gst,
//         refundableDeposit: refundableDepositTotal,
//         careProtection: careProtection,
//         repairWarranty: repairWarranty,
//         relocationWarranty: relocationWarranty,
//         deliveryPackaging: deliveryPackaging,
//         installationFee: installationFee,
//         platformFee: platformFee,

//         // ── city ────────────────────────────────────────
//         cityKey:
//           selectedAddress.cityKey ||
//           (selectedAddress.city || '').trim().toLowerCase(),
//       });
//       // const createdOrderId = orderRes?.data?._id || '';
//       // if (createdOrderId) {
//       //   localStorage.setItem('rentpay_last_order_id', createdOrderId);
//       // }

//       // // isPaymentSuccessFlowRef.current = true;
//       // // dispatch(clearCart());
//       // // dispatch(clearAppliedCoupon());
//       // // localStorage.removeItem('rentpay_checkout_selectedAddress');
//       // // localStorage.removeItem('rentpay_checkout_instructions');
//       // isPaymentSuccessFlowRef.current = true;
//       // dispatch(clearCart());
//       // dispatch(clearAppliedCoupon());
//       // localStorage.removeItem('rentpay_checkout_selectedAddress');
//       // localStorage.removeItem('rentpay_checkout_instructions');
//       // localStorage.removeItem('rentpay_care_protection_enabled');
//       const createdOrderId = orderRes?.data?._id || '';
//       if (createdOrderId) {
//         localStorage.setItem('rentpay_last_order_id', createdOrderId);
//         // Fire-and-forget order confirmation email — doesn't block checkout flow
//         apiSendOrderConfirmationEmail(createdOrderId).catch((e) =>
//           console.error('Order confirmation email trigger failed', e),
//         );
//       }

//       // If service bookings are also pending (bundled checkout), book them now too.
//       for (const oneBooking of bundledServiceBookings) {
//         const { taxLines, total: bTotal } = computeBookingTotal(
//           oneBooking,
//           globalTax,
//           isCareProtectionEnabled,
//         );
//         try {
//           const bundledBookingRes = await apiCreateBooking({
//             ...oneBooking,
//             paymentMethod: method,
//             address: addressLine,
//             phone: selectedAddress.phone,
//             name: selectedAddress.fullName,
//             totalAmount: bTotal,
//             taxLines,
//             taxBreakdown: Object.fromEntries(
//               taxLines.map((t) => [
//                 t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//                 t.value,
//               ]),
//             ),
//           });
//           const bundledBookingId = bundledBookingRes?.data?._id;
//           if (bundledBookingId) {
//             apiSendBookingConfirmationEmail(bundledBookingId).catch((e) =>
//               console.error('Booking confirmation email trigger failed', e),
//             );
//           }
//         } catch (svcErr) {
//           console.error('Service booking failed', svcErr);
//           setError(
//             'Rent/Buy order placed, but a service booking could not be confirmed. Please retry it from your cart.',
//           );
//         }
//       }
//       if (false && pendingServiceBooking) {
//         const svcTax = pendingServiceBooking?.subCategoryTax || {};
//         const svcBlocked =
//           pendingServiceBooking?.taxBlocked === true ||
//           svcTax?.taxBlocked === true;
//         const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
//         const calcSvcTax = (subKey, globalKey) => {
//           if (svcBlocked) return 0;
//           const rate =
//             svcTax[subKey] != null
//               ? Number(svcTax[subKey])
//               : (globalTax?.services?.[globalKey] ?? 0);
//           return Math.round((svcBase * rate) / 100);
//         };
//         const receiptTaxLines = [
//           { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
//           // { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
//           {
//             label: 'Care Tax',
//             value: isCareProtectionEnabled
//               ? calcSvcTax('defaultCareTax', 'careTax')
//               : 0,
//           },
//           {
//             label: 'Repair & Warranty',
//             value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
//           },
//           {
//             label: 'Relocation Warranty',
//             value: calcSvcTax(
//               'defaultRelocationWarranty',
//               'relocationWarranty',
//             ),
//           },
//           {
//             label: 'Delivery & Packaging',
//             value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
//           },
//           {
//             label: 'Installation Fee',
//             value: calcSvcTax('defaultInstallationFee', 'installationFee'),
//           },
//           {
//             label: 'Platform Fee',
//             value: calcSvcTax('defaultPlatformFee', 'platformFee'),
//           },
//         ].filter((t) => t.value > 0);
//         const svcTotal =
//           svcBase + receiptTaxLines.reduce((s, t) => s + t.value, 0);

//         // try {
//         //   await apiCreateBooking({
//         //     ...pendingServiceBooking,
//         //     paymentMethod: method,
//         //     address: addressLine,
//         //     phone: selectedAddress.phone,
//         //     name: selectedAddress.fullName,
//         //     totalAmount: svcTotal,
//         //     taxLines: receiptTaxLines,
//         //     taxBreakdown: Object.fromEntries(
//         //       receiptTaxLines.map((t) => [
//         //         t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//         //         t.value,
//         //       ]),
//         //     ),
//         //   });
//         // } catch (svcErr) {
//         try {
//           const bundledBookingRes = await apiCreateBooking({
//             ...pendingServiceBooking,
//             paymentMethod: method,
//             address: addressLine,
//             phone: selectedAddress.phone,
//             name: selectedAddress.fullName,
//             totalAmount: svcTotal,
//             taxLines: receiptTaxLines,
//             taxBreakdown: Object.fromEntries(
//               receiptTaxLines.map((t) => [
//                 t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
//                 t.value,
//               ]),
//             ),
//           });
//           const bundledBookingId = bundledBookingRes?.data?._id;
//           if (bundledBookingId) {
//             apiSendBookingConfirmationEmail(bundledBookingId).catch((e) =>
//               console.error('Booking confirmation email trigger failed', e),
//             );
//           }
//         } catch (svcErr) {
//           console.error('Service booking failed', svcErr);
//           // Don't block the already-successful rent/buy order; surface a warning instead.
//           setError(
//             'Rent/Buy order placed, but the service booking could not be confirmed. Please retry the service booking from your cart.',
//           );
//         }
//       }

//       // isPaymentSuccessFlowRef.current = true;
//       // dispatch(clearCart());
//       // dispatch(clearAppliedCoupon());
//       // localStorage.removeItem('rentpay_checkout_selectedAddress');
//       // localStorage.removeItem('rentpay_checkout_instructions');
//       // localStorage.removeItem('rentpay_care_protection_enabled');
//       // localStorage.removeItem('rentpay_pending_service_booking');
//       // router.push(
//       //   createdOrderId
//       //     ? `/payment-successful?orderId=${encodeURIComponent(createdOrderId)}`
//       //     : '/payment-successful',
//       // );
//       isPaymentSuccessFlowRef.current = true;
//       dispatch(clearCart());
//       dispatch(clearAppliedCoupon());
//       localStorage.removeItem('rentpay_checkout_selectedAddress');
//       localStorage.removeItem('rentpay_checkout_instructions');
//       localStorage.removeItem('rentpay_care_protection_enabled');
//       localStorage.removeItem('rentpay_pending_service_bookings');

//       const successUrl = createdOrderId
//         ? `/payment-successful?orderId=${encodeURIComponent(createdOrderId)}`
//         : '/payment-successful';

//       // If services were part of this order, show the receipt modal first.
//       if (bundledServiceBookings.length > 0) {
//         const combinedBase2 = bundledServiceBookings.reduce(
//           (s, b) => s + Number(b?.totalAmount || 0),
//           0,
//         );
//         const combinedTaxLines2 = [];
//         let combinedTotal2 = 0;
//         bundledServiceBookings.forEach((b) => {
//           const { taxLines, total } = computeBookingTotal(
//             b,
//             globalTax,
//             isCareProtectionEnabled,
//           );
//           combinedTotal2 += total;
//           taxLines.forEach((t) => {
//             const existing = combinedTaxLines2.find((x) => x.label === t.label);
//             if (existing) existing.value += t.value;
//             else combinedTaxLines2.push({ ...t });
//           });
//         });
//         const first2 = bundledServiceBookings[0];

//         setReceiptRedirectUrl(successUrl);
//         setServiceReceiptData({
//           jobId: `SRV-${String(first2.productId || '')
//             .slice(-6)
//             .toUpperCase()}`,
//           serviceName:
//             bundledServiceBookings.length > 1
//               ? `${first2.serviceName} + ${bundledServiceBookings.length - 1} more`
//               : first2.serviceName,
//           technicianName: '—',
//           bookingDate: first2.bookingDate,
//           timeSlot: first2.timeSlot?.label,
//           serviceCharge: combinedBase2,
//           taxLines: combinedTaxLines2,
//           taxAndFees: combinedTaxLines2.reduce((s, t) => s + t.value, 0),
//           totalPaid: combinedTotal2,
//           paymentMethod: method,
//         });
//         setShowReceiptModal(true);
//       } else if (false && pendingServiceBooking) {
//         const svcTax2 = pendingServiceBooking?.subCategoryTax || {};
//         const svcBlocked2 =
//           pendingServiceBooking?.taxBlocked === true ||
//           svcTax2?.taxBlocked === true;
//         const svcBase2 = Number(pendingServiceBooking?.totalAmount || 0);
//         const calcSvcTax2 = (subKey, globalKey) => {
//           if (svcBlocked2) return 0;
//           const rate =
//             svcTax2[subKey] != null
//               ? Number(svcTax2[subKey])
//               : (globalTax?.services?.[globalKey] ?? 0);
//           return Math.round((svcBase2 * rate) / 100);
//         };
//         const receiptLines = [
//           { label: 'GST', value: calcSvcTax2('defaultGst', 'gst') },
//           {
//             label: 'Care Tax',
//             value: isCareProtectionEnabled
//               ? calcSvcTax2('defaultCareTax', 'careTax')
//               : 0,
//           },
//           {
//             label: 'Repair & Warranty',
//             value: calcSvcTax2('defaultRepairWarranty', 'repairWarranty'),
//           },
//           {
//             label: 'Relocation Warranty',
//             value: calcSvcTax2(
//               'defaultRelocationWarranty',
//               'relocationWarranty',
//             ),
//           },
//           {
//             label: 'Delivery & Packaging',
//             value: calcSvcTax2('defaultDeliveryPackaging', 'deliveryPackaging'),
//           },
//           {
//             label: 'Installation Fee',
//             value: calcSvcTax2('defaultInstallationFee', 'installationFee'),
//           },
//           {
//             label: 'Platform Fee',
//             value: calcSvcTax2('defaultPlatformFee', 'platformFee'),
//           },
//         ].filter((t) => t.value > 0);
//         const svcPaidTotal =
//           svcBase2 + receiptLines.reduce((s, t) => s + t.value, 0);

//         setReceiptRedirectUrl(successUrl);
//         setServiceReceiptData({
//           jobId: `SRV-${String(pendingServiceBooking.productId || '')
//             .slice(-6)
//             .toUpperCase()}`,
//           serviceName: pendingServiceBooking.serviceName,
//           technicianName: '—',
//           bookingDate: pendingServiceBooking.bookingDate,
//           timeSlot: pendingServiceBooking.timeSlot?.label,
//           serviceCharge: svcBase2,
//           taxLines: receiptLines,
//           taxAndFees: receiptLines.reduce((s, t) => s + t.value, 0),
//           totalPaid: svcPaidTotal,
//           paymentMethod: method,
//         });
//         setShowReceiptModal(true);
//       } else {
//         router.push(successUrl);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Could not place order.');
//       setLoading(false);
//     }
//   };

//   const addressLine = selectedAddress
//     ? `${selectedAddress.addressLine}${
//         selectedAddress.area ? `, ${selectedAddress.area}` : ''
//       }${selectedAddress.city ? `, ${selectedAddress.city}` : ''}${
//         selectedAddress.pincode ? ` - ${selectedAddress.pincode}` : ''
//       }`
//     : '';

//   return (
//     <div className="min-h-screen bg-[#eff2f8]">
//       <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
//         <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
//         <p className="mt-1 text-sm text-gray-500">
//           {isServiceMode
//             ? 'Complete your service booking payment'
//             : 'Choose your preferred payment method'}
//         </p>

//         {/* {isServiceMode && pendingServiceBooking ? (
//           <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
//             <div className="flex items-center gap-3">
//               {pendingServiceBooking.image ? (
//                 <img
//                   src={pendingServiceBooking.image}
//                   alt=""
//                   className="h-14 w-14 rounded-xl object-cover"
//                 />
//               ) : null}
//               <div className="min-w-0">
//                 <p className="font-semibold text-gray-900">
//                   {pendingServiceBooking.serviceName || 'Service booking'}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {pendingServiceBooking.bookingDate} ·{' '}
//                   {pendingServiceBooking.timeSlot?.label}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ) : null} */}
//         {isServiceMode && pendingServiceBooking ? (
//           <ServiceOrderSummary
//             booking={pendingServiceBooking}
//             globalTax={globalTax}
//           />
//         ) : null}
//         {!isServiceMode &&
//           bundledServiceBookings.map((b) => (
//             <ServiceOrderSummary
//               key={b.bookingId || b.productId}
//               booking={b}
//               globalTax={globalTax}
//             />
//           ))}

//         <div className="mt-6">
//           <h2 className="text-sm font-semibold text-gray-700">
//             Select Payment Mode
//           </h2>

//           <div className="mt-4 space-y-3">
//             {(pendingServiceBooking || bundledServiceBookings.length > 0) &&
//             !isServicePayMode ? (
//               <label
//                 className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
//                   method === 'pay_after_service'
//                     ? 'border-orange-300 bg-orange-50'
//                     : 'border-gray-200 bg-white'
//                 }`}
//               >
//                 <div className="flex items-start gap-3 px-4 py-4">
//                   <input
//                     type="radio"
//                     name="paymode"
//                     checked={method === 'pay_after_service'}
//                     onChange={() => setMethod('pay_after_service')}
//                     className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
//                     style={{
//                       backgroundImage:
//                         method === 'pay_after_service'
//                           ? 'radial-gradient(white 40%, transparent 41%)'
//                           : 'none',
//                     }}
//                   />
//                   <span className="w-8 h-8 flex items-center justify-center mt-0.5">
//                     <Lock className="w-4 h-4 text-gray-600" />
//                   </span>
//                   <div className="min-w-0">
//                     <span className="font-medium text-gray-900">
//                       Pay After Service
//                     </span>
//                     <p className="mt-0.5 text-[11px] text-gray-500">
//                       Book now, pay once the service is completed
//                     </p>
//                   </div>
//                 </div>
//               </label>
//             ) : null}
//             {/* <label
//               className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
//                 method === 'upi'
//                   ? 'border-orange-300 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <div className="flex items-start gap-3 px-4 py-4">
//                 <input
//                   type="radio"
//                   name="paymode"
//                   checked={method === 'upi'}
//                   onChange={() => setMethod('upi')}
//                   className="mt-1"
//                 />
//                 <Smartphone className="mt-0.5 h-4 w-4 text-gray-500" />
//                 <div className="min-w-0">
//                   <div className="flex items-center gap-2">
//                     <span className="font-medium text-gray-900">UPI</span>
//                     <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
//                       Fastest
//                     </span>
//                   </div>
//                   <p className="mt-0.5 text-[11px] text-gray-500">
//                     Google Pay, PhonePe, Paytm & more
//                   </p>
//                 </div>
//               </div>
//             </label> */}
//             <label
//               className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
//                 method === 'upi'
//                   ? 'border-orange-300 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <div className="flex items-start gap-3 px-4 py-4">
//                 {/* <input
//                   type="radio"
//                   name="paymode"
//                   checked={method === 'upi'}
//                   onChange={() => setMethod('upi')}
//                   className="mt-1"
//                 /> */}
//                 <input
//                   type="radio"
//                   name="paymode"
//                   checked={method === 'upi'}
//                   onChange={() => setMethod('upi')}
//                   className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
//                   style={{
//                     backgroundImage:
//                       method === 'upi'
//                         ? 'radial-gradient(white 40%, transparent 41%)'
//                         : 'none',
//                   }}
//                 />

//                 {/* Icon (aligned with content) */}
//                 <span className="w-8 h-8 flex items-center justify-center mt-0.5">
//                   <Smartphone className="w-4 h-4 text-gray-600" />
//                 </span>

//                 {/* Content */}
//                 <div className="min-w-0">
//                   <div className="flex items-center gap-2">
//                     <span className="font-medium text-gray-900">UPI</span>
//                     <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
//                       Fastest
//                     </span>
//                   </div>

//                   <p className="mt-0.5 text-[11px] text-gray-500">
//                     Google Pay, PhonePe, Paytm & more
//                   </p>
//                 </div>
//               </div>
//             </label>

//             <div
//               className={`overflow-hidden rounded-2xl border transition ${
//                 method === 'card'
//                   ? 'border-orange-300 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               {/* <label className="flex cursor-pointer items-start gap-3 px-4 py-4">
//                 <input
//                   type="radio"
//                   name="paymode"
//                   checked={method === 'card'}
//                   onChange={() => setMethod('card')}
//                   className="mt-1 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
//                   style={{
//                     backgroundImage:
//                       method === 'card'
//                         ? 'radial-gradient(white 40%, transparent 41%)'
//                         : 'none',
//                   }}
//                 />
//                 <CreditCard className="mt-0.5 h-4 w-4 text-gray-500" />
//                 <div className="min-w-0">
//                   <div className="font-medium text-gray-900">
//                     Credit / Debit Card
//                   </div>
//                   <p className="mt-0.5 text-[11px] text-gray-500">
//                     Visa, Mastercard, RuPay
//                   </p>
//                 </div>
//               </label> */}
//               <label className="flex cursor-pointer items-start gap-3 px-4 py-4">
//                 <input
//                   type="radio"
//                   name="paymode"
//                   checked={method === 'card'}
//                   onChange={() => setMethod('card')}
//                   className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
//                   style={{
//                     backgroundImage:
//                       method === 'card'
//                         ? 'radial-gradient(white 40%, transparent 41%)'
//                         : 'none',
//                   }}
//                 />

//                 {/* Centered Icon */}
//                 <span className="w-8 h-8 flex items-center justify-center mt-0.5">
//                   <CreditCard className="w-4 h-4 text-gray-600" />
//                 </span>

//                 <div className="min-w-0">
//                   <div className="font-medium text-gray-900">
//                     Credit / Debit Card
//                   </div>
//                   <p className="mt-0.5 text-[11px] text-gray-500">
//                     Visa, Mastercard, RuPay
//                   </p>
//                 </div>
//               </label>

//               {method === 'card' ? (
//                 <div className="border-t border-orange-200 bg-white px-4 py-4 sm:px-5">
//                   <div className="mb-4 flex items-center gap-2">
//                     <span className="rounded border border-gray-200 bg-[#f7f9fc] px-2 py-1 text-[10px] text-gray-600">
//                       VISA
//                     </span>
//                     <span className="rounded border border-gray-200 bg-[#f7f9fc] px-2 py-1 text-[10px] text-gray-600">
//                       Mastercard
//                     </span>
//                     <span className="rounded border border-gray-200 bg-[#f7f9fc] px-2 py-1 text-[10px] text-gray-600">
//                       RuPay
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                     <label className="text-[11px] font-medium text-gray-600 sm:col-span-2">
//                       Card Number
//                       <input
//                         value={cardNumber}
//                         onChange={(e) => setCardNumber(e.target.value)}
//                         className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
//                         placeholder="1234 5678 9012 3456"
//                       />
//                     </label>

//                     <label className="text-[11px] font-medium text-gray-600">
//                       Expiry (MM/YY)
//                       <input
//                         value={expiry}
//                         onChange={(e) => setExpiry(e.target.value)}
//                         className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
//                         placeholder="12/25"
//                       />
//                     </label>

//                     <label className="text-[11px] font-medium text-gray-600">
//                       CVV
//                       <input
//                         value={cvv}
//                         onChange={(e) => setCvv(e.target.value)}
//                         className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
//                         placeholder="123"
//                       />
//                     </label>

//                     <label className="text-[11px] font-medium text-gray-600 sm:col-span-2">
//                       Name on Card
//                       <input
//                         value={nameOnCard}
//                         onChange={(e) => setNameOnCard(e.target.value)}
//                         className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
//                         placeholder="RAHUL SHARMA"
//                       />
//                     </label>
//                   </div>

//                   <label className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-[#f5f9ff] px-3 py-3">
//                     {/* <input
//                       type="checkbox"
//                       checked={saveCardForRentals}
//                       onChange={(e) => setSaveCardForRentals(e.target.checked)}
//                       className="mt-1"
//                     /> */}
//                     <input
//                       type="checkbox"
//                       checked={saveCardForRentals}
//                       onChange={(e) => setSaveCardForRentals(e.target.checked)}
//                       className="mt-1 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:bg-[#F97316] checked:border-[#F97316] relative"
//                       style={{
//                         backgroundImage: saveCardForRentals
//                           ? 'radial-gradient(white 40%, transparent 41%)'
//                           : 'none',
//                       }}
//                     />
//                     <div>
//                       <p className="text-xs font-semibold text-black">
//                         Save this card securely for monthly rent payments
//                       </p>
//                       {/* <p className="mt-1 text-[10px] text-gray-500">
//                         We can use this card for scheduled debits in future
//                         rental renewals.
//                       </p> */}
//                       <p className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
//                         <Lock className="w-2.5 h-2.5 text-gray-500" />
//                         We can use this card for scheduled debits in future
//                         rental renewals.
//                       </p>
//                     </div>
//                   </label>
//                 </div>
//               ) : null}
//             </div>

//             {/* <label
//               className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
//                 method === 'netbanking'
//                   ? 'border-orange-300 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <div className="flex items-start gap-3 px-4 py-4">
//                 <input
//                   type="radio"
//                   name="paymode"
//                   checked={method === 'netbanking'}
//                   onChange={() => setMethod('netbanking')}
//                   className="mt-1 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
//                   style={{
//                     backgroundImage:
//                       method === 'netbanking'
//                         ? 'radial-gradient(white 40%, transparent 41%)'
//                         : 'none',
//                   }}
//                 />
//                 <Landmark className="mt-0.5 h-4 w-4 text-gray-500" />
//                 <div className="min-w-0 flex-1">
//                   <div className="flex items-center justify-between gap-3">
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Net Banking
//                       </div>
//                       <p className="mt-0.5 text-[11px] text-gray-500">
//                         All major banks supported
//                       </p>
//                     </div>
//                     <Building2 className="h-4 w-4 text-gray-400" />
//                   </div>
//                 </div>
//               </div>
//             </label> */}
//             <label
//               className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
//                 method === 'netbanking'
//                   ? 'border-orange-300 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <div className="flex items-start gap-3 px-4 py-4">
//                 <input
//                   type="radio"
//                   name="paymode"
//                   checked={method === 'netbanking'}
//                   onChange={() => setMethod('netbanking')}
//                   className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
//                   style={{
//                     backgroundImage:
//                       method === 'netbanking'
//                         ? 'radial-gradient(white 40%, transparent 41%)'
//                         : 'none',
//                   }}
//                 />

//                 {/* Centered Landmark Icon */}
//                 <span className="w-8 h-8 flex items-center justify-center mt-0.5">
//                   <Landmark className="w-4 h-4 text-gray-600" />
//                 </span>

//                 <div className="min-w-0 flex-1">
//                   <div className="flex items-center justify-between gap-3">
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         Net Banking
//                       </div>
//                       <p className="mt-0.5 text-[11px] text-gray-500">
//                         All major banks supported
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </label>
//           </div>

//           <div className="mt-6 flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm border border-gray-200">
//             <div>
//               <p className="text-xs text-gray-500">
//                 Total payable
//                 {/* {items.some((i) => isMonthlyRentalItem(i)) ? (
//                   <span className="ml-1 text-orange-500 font-medium">
//                     (1st Month)
//                   </span>
//                 ) : null} */}
//                 {isPayNextMonthMode ? (
//                   <span className="ml-1 text-orange-500 font-medium">
//                     (Month {payNextMonthLabel})
//                   </span>
//                 ) : null}
//                 {isPayNextMonthMultiMode ? (
//                   <span className="ml-1 text-orange-500 font-medium">
//                     ({pendingMultiMonthPayments.length} rentals)
//                   </span>
//                 ) : null}
//               </p>
//               {isPayNextMonthMode &&
//               (payNextMonthGst > 0 || payNextMonthCareTax > 0) ? (
//                 <p className="text-xs text-gray-500 mt-0.5">
//                   Includes ₹{payNextMonthGst.toLocaleString('en-IN')} GST + ₹
//                   {payNextMonthCareTax.toLocaleString('en-IN')} Care Tax
//                 </p>
//               ) : null}
//               {isPayNextMonthMode && payNextMonthLateFee > 0 ? (
//                 <p className="text-xs text-red-500 mt-0.5">
//                   Includes ₹{payNextMonthLateFee.toLocaleString('en-IN')} late
//                   fee
//                 </p>
//               ) : null}
//               <p className="mt-1 text-2xl font-bold text-gray-900">
//                 ₹{total.toLocaleString('en-IN')}
//               </p>
//             </div>
//             {/* <button
//               type="button"
//               onClick={handlePay}
//               disabled={loading}
//               className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
//             >

//               {loading ? 'Processing payment…' : 'Pay Now'}
//             </button> */}
//             <button
//               type="button"
//               onClick={handlePay}
//               disabled={loading}
//               className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
//             >
//               {/* <CheckCircle2 className="h-4 w-4" /> */}
//               {loading
//                 ? 'Processing…'
//                 : method === 'pay_after_service'
//                   ? 'Continue'
//                   : 'Pay Now'}
//             </button>
//           </div>

//           {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
//         </div>
//       </div>
//       {/* {showReceiptModal && serviceReceiptData && (
//         <ServiceReceiptModal
//           data={serviceReceiptData}
//           onClose={() => {
//             setShowReceiptModal(false);
//             router.push('/');
//           }}
//         />
//       )} */}
//       {showReceiptModal && serviceReceiptData && (
//         <ServiceReceiptModal
//           data={serviceReceiptData}
//           onClose={() => {
//             setShowReceiptModal(false);
//             router.push(receiptRedirectUrl);
//           }}
//         />
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { clearAppliedCoupon, clearCart } from '../store/slices/cartSlice';
import {
  apiCreateBooking,
  apiCreateOrder,
  apiExtendMyOrderTenure,
  apiGetGlobalTax,
  apiSendOrderConfirmationEmail,
  apiSendBookingConfirmationEmail,
  apiPayServiceBooking,
  apiPayNextMonth,
} from '@/lib/api';
import { toast } from 'react-toastify';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  Smartphone,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ServiceReceiptModal from '@/components/ServiceReceiptModal';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getNavbarOrderLocation() {
  if (typeof window === 'undefined') return null;
  const parsed = safeParse(localStorage.getItem('rn_delivery_location'));
  const lat = Number(parsed?.lat);
  const lng = Number(parsed?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: String(parsed?.label || '') };
}

// Computes a single service booking's tax breakdown/total the same way
// Cart.jsx's computeServiceBreakdown does, so bundled multi-service totals
// on the payment page match what was shown in the cart.
function computeBookingTotal(booking, globalTax, isCareProtectionEnabled) {
  const tax = booking?.subCategoryTax || {};
  const isBlocked = booking?.taxBlocked === true || tax?.taxBlocked === true;
  const base = Number(booking?.totalAmount || 0);
  if (isBlocked || !globalTax) return { base, taxLines: [], total: base };
  const calc = (subKey, globalKey) => {
    const rate =
      tax[subKey] != null
        ? Number(tax[subKey])
        : (globalTax?.services?.[globalKey] ?? 0);
    return Math.round((base * rate) / 100);
  };
  const taxLines = [
    { label: 'GST', value: calc('defaultGst', 'gst') },
    {
      label: 'Care Tax',
      value: isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0,
    },
    {
      label: 'Repair & Warranty',
      value: calc('defaultRepairWarranty', 'repairWarranty'),
    },
    {
      label: 'Relocation Warranty',
      value: calc('defaultRelocationWarranty', 'relocationWarranty'),
    },
    {
      label: 'Delivery & Packaging',
      value: calc('defaultDeliveryPackaging', 'deliveryPackaging'),
    },
    {
      label: 'Installation Fee',
      value: calc('defaultInstallationFee', 'installationFee'),
    },
    { label: 'Platform Fee', value: calc('defaultPlatformFee', 'platformFee') },
  ].filter((t) => t.value > 0);
  const total = base + taxLines.reduce((s, t) => s + t.value, 0);
  return { base, taxLines, total };
}

// async function applyServiceOfferDiscount(booking) {
//   if (!booking?.productId) return booking;
//   try {
//     const res = await apiGetPublicActiveOffers();
//     const offers = res.data?.offers || [];
//     const match = offers.find(
//       (o) =>
//         String(o.productId?._id || o.productId) === String(booking.productId),
//     );
//     const discountPercent = Number(match?.discountPercent || 0);
//     if (!match || discountPercent <= 0) return booking;
//     const baseAmount = Number(booking.totalAmount || 0);
//     const discountedAmount = Math.max(
//       0,
//       Math.round(baseAmount - (baseAmount * discountPercent) / 100),
//     );
//     return { ...booking, totalAmount: discountedAmount };
//   } catch {
//     return booking;
//   }
// }

// Note: booking.totalAmount saved from the booking modal is already the
// final, discounted price — no re-fetching or re-applying the offer here.

// function ServiceOrderSummary({ booking, globalTax }) {
//   const [open, setOpen] = useState(false);
//   const tax = booking?.subCategoryTax || {};

//   const basePrice = Number(booking?.totalAmount || 0);

//   // Calculate each tax from subcategory rates, fallback to globalTax.services
//   const calcTax = (subKey, globalKey) => {
//     const rate =
//       tax[subKey] != null
//         ? Number(tax[subKey])
//         : (globalTax?.services?.[globalKey] ?? 0);
//     return Math.round((basePrice * rate) / 100);
//   };

//   const gst = calcTax('defaultGst', 'gst');
//   const careTax = calcTax('defaultCareTax', 'careTax');
//   const repairWarranty = calcTax('defaultRepairWarranty', 'repairWarranty');
//   const relocationWarranty = calcTax(
//     'defaultRelocationWarranty',
//     'relocationWarranty',
//   );
//   const deliveryPackaging = calcTax(
//     'defaultDeliveryPackaging',
//     'deliveryPackaging',
//   );
//   const installationFee = calcTax('defaultInstallationFee', 'installationFee');
//   const platformFee = calcTax('defaultPlatformFee', 'platformFee');

function ServiceOrderSummary({ booking, globalTax }) {
  const [open, setOpen] = useState(false);
  const tax = booking?.subCategoryTax || {};

  // If subcategory OR category is taxBlocked, show no taxes
  const isTaxBlocked = booking?.taxBlocked === true || tax?.taxBlocked === true;

  const basePrice = Number(booking?.totalAmount || 0);

  // Calculate each tax from subcategory rates, fallback to globalTax.services
  const calcTax = (subKey, globalKey) => {
    if (isTaxBlocked) return 0;
    const rate =
      tax[subKey] != null
        ? Number(tax[subKey])
        : (globalTax?.services?.[globalKey] ?? 0);
    return Math.round((basePrice * rate) / 100);
  };

  const gst = calcTax('defaultGst', 'gst');
  const careTax = calcTax('defaultCareTax', 'careTax');
  const repairWarranty = calcTax('defaultRepairWarranty', 'repairWarranty');
  const relocationWarranty = calcTax(
    'defaultRelocationWarranty',
    'relocationWarranty',
  );
  const deliveryPackaging = calcTax(
    'defaultDeliveryPackaging',
    'deliveryPackaging',
  );
  const installationFee = calcTax('defaultInstallationFee', 'installationFee');
  const platformFee = calcTax('defaultPlatformFee', 'platformFee');

  const taxTotal =
    gst +
    careTax +
    repairWarranty +
    relocationWarranty +
    deliveryPackaging +
    installationFee +
    platformFee;
  const grandTotal = basePrice + taxTotal;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  const taxLines = [
    { label: 'GST', value: gst },
    { label: 'Care Tax', value: careTax },
    { label: 'Repair & Warranty', value: repairWarranty },
    { label: 'Relocation Warranty', value: relocationWarranty },
    { label: 'Delivery & Packaging', value: deliveryPackaging },
    { label: 'Installation Fee', value: installationFee },
    { label: 'Platform Fee', value: platformFee },
  ].filter((t) => t.value > 0);

  return (
    <div className="mt-6 rounded-2xl border border-orange-100 bg-white shadow-sm overflow-hidden">
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {booking.image ? (
          <img
            src={booking.image}
            alt=""
            className="h-14 w-14 rounded-xl object-cover shrink-0"
          />
        ) : null}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">
            {booking.serviceName || 'Service booking'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {booking.bookingDate} · {booking.timeSlot?.label}
          </p>
        </div>
        <div className="text-right shrink-0">
          {/* <p className="text-sm font-bold text-gray-900">₹{fmt(grandTotal)}</p> */}
          <p className="text-xs text-orange-500 mt-0.5">
            {open ? 'Hide summary ▲' : 'View summary ▼'}
          </p>
        </div>
      </button>

      {/* Expandable order summary */}
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Service Fee</span>
            <span className="font-medium">₹{fmt(basePrice)}</span>
          </div>
          {taxLines.map((t) => (
            <div key={t.label} className="flex justify-between text-gray-600">
              <span>{t.label}</span>
              <span className="font-medium">₹{fmt(t.value)}</span>
            </div>
          ))}
          {booking.isUrgent && (
            <div className="flex justify-between text-amber-600">
              <span>Urgent Fee</span>
              <span className="font-medium">₹150</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-1">
            <span>Total</span>
            <span>₹{fmt(grandTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Payment() {
  const searchParams = useSearchParams();
  const isExtensionMode = searchParams.get('mode') === 'extension';
  const isServiceMode = searchParams.get('mode') === 'service';
  const isServicePayMode = searchParams.get('mode') === 'service-pay';
  // const isPayNextMonthMode = searchParams.get('mode') === 'pay-next-month';
  // const payNextMonthOrderId = searchParams.get('orderId') || '';
  // const payNextMonthLabel = searchParams.get('month') || '';
  // const payNextMonthBase = Number(searchParams.get('baseAmount') || 0);
  // const payNextMonthLateFee = Number(searchParams.get('lateFeeAmount') || 0);
  const isPayNextMonthMode = searchParams.get('mode') === 'pay-next-month';
  const isPayNextMonthMultiMode =
    searchParams.get('mode') === 'pay-next-month-multi';
  const payNextMonthOrderId = searchParams.get('orderId') || '';
  const payNextMonthLabel = searchParams.get('month') || '';
  const payNextMonthBase = Number(searchParams.get('baseAmount') || 0);
  const payNextMonthLateFee = Number(searchParams.get('lateFeeAmount') || 0);
  const payNextMonthGst = Number(searchParams.get('gstAmount') || 0);
  const payNextMonthCareTax = Number(searchParams.get('careTaxAmount') || 0);
  const [pendingMultiMonthPayments, setPendingMultiMonthPayments] = useState(
    [],
  );
  const servicePayBookingId = searchParams.get('bookingId') || '';
  const servicePayAmount = Number(searchParams.get('amount') || 0);
  const [pendingExtension, setPendingExtension] = useState(null);
  const [pendingServiceBooking, setPendingServiceBooking] = useState(null);
  // Multiple services added from the cart (bundled checkout) — separate
  // from `pendingServiceBooking`, which is the single-service direct flow.
  const [bundledServiceBookings, setBundledServiceBookings] = useState([]);
  const router = useRouter();
  const dispatch = useDispatch();

  const { items, appliedCoupon } = useSelector((s) => s.cart);
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const isPaymentSuccessFlowRef = useRef(false);

  // const isRentalItem = (item) =>
  //   String(item?.productType || 'Rental') === 'Rental';
  const isRentalItem = (item) =>
    String(item?.productType || 'Rental') === 'Rental';

  // Daily-rental items are always billed as a single flat total for the
  // chosen date range (quantity is not a multiplier for them) — matches
  // the same rule used in cart.js's totals.
  const isDailyRentalItem = (item) =>
    String(item?.productType || 'Rental') === 'Rental' &&
    String(item?.tenureUnit || 'month') === 'day';

  // NEW: monthly-tenure rental item (not daily, not buy)
  const isMonthlyRentalItem = (item) =>
    String(item?.productType || 'Rental') === 'Rental' &&
    String(item?.tenureUnit || 'month') !== 'day';

  const getItemQty = (item) =>
    isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);

  const [globalTax, setGlobalTax] = useState(null);
  const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('rentpay_care_protection_enabled');
    setIsCareProtectionEnabled(saved === null ? true : saved === 'true');
  }, []);

  useEffect(() => {
    const fetchTax = async () => {
      try {
        const res = await apiGetGlobalTax();
        setGlobalTax(res.data?.data?.config || null);
      } catch (e) {
        console.error('Failed to load global tax', e);
      }
    };
    fetchTax();
  }, []);

  // Base rental cost: saved tier price is already the full selected tenure
  // (for both day-wise and month-wise rentals).
  // const rentalBaseCost = useMemo(() => {
  //   return items.reduce((sum, i) => {
  //     if (!isRentalItem(i))
  //       return sum + Number(i.pricePerDay || 0) * Number(i.quantity || 0);
  //     return sum + Number(i.pricePerDay || 0) * Number(i.quantity || 0);
  //   }, 0);
  // }, [items]);
  // const rentalBaseCost = useMemo(() => {
  //   return items.reduce((sum, i) => {
  //     const qty = getItemQty(i);
  //     // Monthly rentals: item.pricePerDay stores the TOTAL tenure price
  //     // (e.g. 3 months x 400 = 1200). On payment we only collect month 1.
  //     if (isMonthlyRentalItem(i)) {
  //       const months = Number(i.rentalMonths || 1) || 1;
  //       const firstMonthPrice = Number(i.pricePerDay || 0) / months;
  //       return sum + firstMonthPrice * qty;
  //     }
  //     return sum + Number(i.pricePerDay || 0) * qty;
  //   }, 0);
  // }, [items]);

  const rentalBaseCost = useMemo(() => {
    return items.reduce((sum, i) => {
      const qty = getItemQty(i);
      // Monthly rentals: item.pricePerDay already stores the FIRST-MONTH
      // price (cart now saves first-month price directly, not the full
      // tenure total), so no division is needed here anymore.
      return sum + Number(i.pricePerDay || 0) * qty;
    }, 0);
  }, [items]);

  const refundableDepositTotal = useMemo(() => {
    return items.reduce((sum, i) => {
      if (!isRentalItem(i)) return sum;
      const deposit = Number(i.refundableDeposit || 0);
      return sum + deposit * Number(i.quantity || 0);
    }, 0);
  }, [items]);

  // const deliveryFee = useMemo(() => (items.length ? 99 : 0), [items.length]);
  const deliveryFee = 0;

  // const gst = useMemo(() => {
  //   if (!globalTax || !items.length) return 0;
  //   return items.reduce((sum, item) => {
  //     const itemTotal =
  //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
  //     const rate = isRentalItem(item)
  //       ? (globalTax.rental?.gst ?? 0) / 100
  //       : String(item.condition || '').toLowerCase() === 'refurbished'
  //         ? (globalTax.buying_refurbished?.gst ?? 0) / 100
  //         : (globalTax.buying_new?.gst ?? 0) / 100;
  //     return sum + Math.round(itemTotal * rate);
  //   }, 0);
  // }, [items, globalTax]);
  const gst = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const itemTotal =
      //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
      const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
      if (item.taxBlocked) return sum;
      let rate = 0;
      if (item.defaultGst != null) {
        rate = Number(item.defaultGst) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.gst ?? 0) / 100;
      } else {
        const cond = String(item.condition || '').toLowerCase();
        rate =
          cond === 'refurbished'
            ? (globalTax?.buying_refurbished?.gst ?? 0) / 100
            : (globalTax?.buying_new?.gst ?? 0) / 100;
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  // const careProtection = useMemo(() => {
  //   if (!items.length) return 0;
  //   return items.reduce((sum, item) => {
  //     const itemTotal =
  //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
  //     if (item.taxBlocked) return sum;
  //     let rate = 0;
  //     if (item.defaultCareTax != null) {
  //       rate = Number(item.defaultCareTax) / 100;
  //     } else if (isRentalItem(item)) {
  //       rate = (globalTax?.rental?.careTax ?? 0) / 100;
  //     } else {
  //       const cond = String(item.condition || '').toLowerCase();
  //       rate =
  //         cond === 'refurbished'
  //           ? (globalTax?.buying_refurbished?.careTax ?? 0) / 100
  //           : (globalTax?.buying_new?.careTax ?? 0) / 100;
  //     }
  //     return sum + Math.round(itemTotal * rate);
  //   }, 0);
  // }, [items, globalTax]);

  const careProtection = useMemo(() => {
    if (!items.length || !isCareProtectionEnabled) return 0;
    return items.reduce((sum, item) => {
      // const itemTotal =
      //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
      const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
      if (item.taxBlocked) return sum;
      let rate = 0;
      if (item.defaultCareTax != null) {
        rate = Number(item.defaultCareTax) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.careTax ?? 0) / 100;
      } else {
        const cond = String(item.condition || '').toLowerCase();
        rate =
          cond === 'refurbished'
            ? (globalTax?.buying_refurbished?.careTax ?? 0) / 100
            : (globalTax?.buying_new?.careTax ?? 0) / 100;
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax, isCareProtectionEnabled]);

  // const repairWarranty = useMemo(() => {
  //   if (!globalTax || !items.length) return 0;
  //   return items.reduce((sum, item) => {
  //     const itemTotal =
  //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
  //     const rate = isRentalItem(item)
  //       ? (globalTax.rental?.repairWarranty ?? 0) / 100
  //       : String(item.condition || '').toLowerCase() === 'refurbished'
  //         ? (globalTax.buying_refurbished?.repairWarranty ?? 0) / 100
  //         : (globalTax.buying_new?.repairWarranty ?? 0) / 100;
  //     return sum + Math.round(itemTotal * rate);
  //   }, 0);
  // }, [items, globalTax]);
  const repairWarranty = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const itemTotal =
      //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
      const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
      if (item.taxBlocked) return sum;
      let rate = 0;
      if (item.defaultRepairWarranty != null) {
        rate = Number(item.defaultRepairWarranty) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.repairWarranty ?? 0) / 100;
      } else {
        const cond = String(item.condition || '').toLowerCase();
        rate =
          cond === 'refurbished'
            ? (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100
            : (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  // const relocationWarranty = useMemo(() => {
  //   if (!globalTax || !items.length) return 0;
  //   return items.reduce((sum, item) => {
  //     const itemTotal =
  //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
  //     const rate = isRentalItem(item)
  //       ? (globalTax.rental?.relocationWarranty ?? 0) / 100
  //       : String(item.condition || '').toLowerCase() === 'refurbished'
  //         ? (globalTax.buying_refurbished?.relocationWarranty ?? 0) / 100
  //         : (globalTax.buying_new?.relocationWarranty ?? 0) / 100;
  //     return sum + Math.round(itemTotal * rate);
  //   }, 0);
  // }, [items, globalTax]);
  const relocationWarranty = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const itemTotal =
      //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
      const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
      if (item.taxBlocked) return sum;
      let rate = 0;
      if (item.defaultRelocationWarranty != null) {
        rate = Number(item.defaultRelocationWarranty) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.relocationWarranty ?? 0) / 100;
      } else {
        const cond = String(item.condition || '').toLowerCase();
        rate =
          cond === 'refurbished'
            ? (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100
            : (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  // const deliveryPackaging = useMemo(() => {
  //   if (!globalTax || !items.length) return 0;
  //   return items.reduce((sum, item) => {
  //     const itemTotal =
  //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
  //     const rate = isRentalItem(item)
  //       ? (globalTax.rental?.deliveryPackaging ?? 0) / 100
  //       : String(item.condition || '').toLowerCase() === 'refurbished'
  //         ? (globalTax.buying_refurbished?.deliveryPackaging ?? 0) / 100
  //         : (globalTax.buying_new?.deliveryPackaging ?? 0) / 100;
  //     return sum + Math.round(itemTotal * rate);
  //   }, 0);
  // }, [items, globalTax]);
  const deliveryPackaging = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const itemTotal =
      //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
      const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
      if (item.taxBlocked) return sum;
      let rate = 0;
      if (item.defaultDeliveryPackaging != null) {
        rate = Number(item.defaultDeliveryPackaging) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.deliveryPackaging ?? 0) / 100;
      } else {
        const cond = String(item.condition || '').toLowerCase();
        rate =
          cond === 'refurbished'
            ? (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100
            : (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  // const installationFee = useMemo(() => {
  //   if (!globalTax || !items.length) return 0;
  //   return items.reduce((sum, item) => {
  //     const itemTotal =
  //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
  //     const rate = isRentalItem(item)
  //       ? (globalTax.rental?.installationFee ?? 0) / 100
  //       : String(item.condition || '').toLowerCase() === 'refurbished'
  //         ? (globalTax.buying_refurbished?.installationFee ?? 0) / 100
  //         : (globalTax.buying_new?.installationFee ?? 0) / 100;
  //     return sum + Math.round(itemTotal * rate);
  //   }, 0);
  // }, [items, globalTax]);
  const installationFee = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const itemTotal =
      //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
      const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
      if (item.taxBlocked) return sum;
      let rate = 0;
      if (item.defaultInstallationFee != null) {
        rate = Number(item.defaultInstallationFee) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.installationFee ?? 0) / 100;
      } else {
        const cond = String(item.condition || '').toLowerCase();
        rate =
          cond === 'refurbished'
            ? (globalTax?.buying_refurbished?.installationFee ?? 0) / 100
            : (globalTax?.buying_new?.installationFee ?? 0) / 100;
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  // const platformFee = useMemo(() => {
  //   if (!globalTax || !items.length) return 0;
  //   return items.reduce((sum, item) => {
  //     const itemTotal =
  //       Number(item.pricePerDay || 0) * Number(item.quantity || 1);
  //     const rate = isRentalItem(item)
  //       ? (globalTax.rental?.platformFee ?? 0) / 100
  //       : String(item.condition || '').toLowerCase() === 'refurbished'
  //         ? (globalTax.buying_refurbished?.platformFee ?? 0) / 100
  //         : (globalTax.buying_new?.platformFee ?? 0) / 100;
  //     return sum + Math.round(itemTotal * rate);
  //   }, 0);
  // }, [items, globalTax]);
  const platformFee = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const itemTotal =
      //   Number(item.pricePerDay || 0) * Number(item.quantity || 1);
      const itemTotal = Number(item.pricePerDay || 0) * getItemQty(item);
      if (item.taxBlocked) return sum;
      let rate = 0;
      if (item.defaultPlatformFee != null) {
        rate = Number(item.defaultPlatformFee) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.platformFee ?? 0) / 100;
      } else {
        const cond = String(item.condition || '').toLowerCase();
        rate =
          cond === 'refurbished'
            ? (globalTax?.buying_refurbished?.platformFee ?? 0) / 100
            : (globalTax?.buying_new?.platformFee ?? 0) / 100;
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  const extensionTotal = useMemo(() => {
    if (!isExtensionMode || !pendingExtension) return 0;
    return Number(pendingExtension.newUnitRent || 0);
  }, [isExtensionMode, pendingExtension]);

  // const total = useMemo(() => {
  //   return (
  //     rentalBaseCost +
  //     refundableDepositTotal +
  //     deliveryFee +
  //     gst +
  //     careProtection
  //   );
  // }, [
  //   rentalBaseCost,
  //   refundableDepositTotal,
  //   deliveryFee,
  //   gst,
  //   careProtection,
  // ]);

  // const total = useMemo(() => {
  //   if (isServiceMode) return Number(pendingServiceBooking?.totalAmount || 0);
  //   if (isExtensionMode) return extensionTotal;
  const serviceTaxTotal = useMemo(() => {
    if (!pendingServiceBooking) return 0;
    if (!isServiceMode || !pendingServiceBooking) return 0;
    const tax = pendingServiceBooking?.subCategoryTax || {};
    const isTaxBlocked =
      pendingServiceBooking?.taxBlocked === true || tax?.taxBlocked === true;
    if (isTaxBlocked) return 0;
    const base = Number(pendingServiceBooking?.totalAmount || 0);
    const calcTax = (subKey, globalKey) => {
      const rate =
        tax[subKey] != null
          ? Number(tax[subKey])
          : (globalTax?.services?.[globalKey] ?? 0);
      return Math.round((base * rate) / 100);
    };
    return (
      calcTax('defaultGst', 'gst') +
      calcTax('defaultCareTax', 'careTax') +
      calcTax('defaultRepairWarranty', 'repairWarranty') +
      calcTax('defaultRelocationWarranty', 'relocationWarranty') +
      calcTax('defaultDeliveryPackaging', 'deliveryPackaging') +
      calcTax('defaultInstallationFee', 'installationFee') +
      calcTax('defaultPlatformFee', 'platformFee')
    );
  }, [isServiceMode, pendingServiceBooking, globalTax]);

  const total = useMemo(() => {
    if (isPayNextMonthMultiMode) {
      return pendingMultiMonthPayments.reduce(
        (sum, p) =>
          sum +
          Number(p.baseAmount || 0) +
          Number(p.lateFeeAmount || 0) +
          Number(p.gstAmount || 0) +
          Number(p.careTaxAmount || 0),
        0,
      );
    }
    if (isPayNextMonthMode) {
      return (
        payNextMonthBase +
        payNextMonthLateFee +
        payNextMonthGst +
        payNextMonthCareTax
      );
    }
    if (isServicePayMode) return servicePayAmount;
    if (isServiceMode)
      return Number(pendingServiceBooking?.totalAmount || 0) + serviceTaxTotal;
    if (isExtensionMode) return extensionTotal;
    // const bundledServiceTotal = pendingServiceBooking
    //   ? Number(pendingServiceBooking?.totalAmount || 0) + serviceTaxTotal
    //   : 0;
    const bundledServiceTotal = bundledServiceBookings.reduce(
      (sum, b) =>
        sum + computeBookingTotal(b, globalTax, isCareProtectionEnabled).total,
      0,
    );
    return (
      rentalBaseCost +
      refundableDepositTotal +
      deliveryFee +
      gst +
      careProtection +
      repairWarranty +
      relocationWarranty +
      deliveryPackaging +
      installationFee +
      platformFee +
      bundledServiceTotal -
      discountAmount
    );
  }, [
    isExtensionMode,
    extensionTotal,
    rentalBaseCost,
    refundableDepositTotal,
    deliveryFee,
    gst,
    careProtection,
    repairWarranty,
    relocationWarranty,
    deliveryPackaging,
    installationFee,
    platformFee,
    discountAmount,
    isServiceMode,
    pendingServiceBooking,
    bundledServiceBookings,
    serviceTaxTotal,
    globalTax,
    isCareProtectionEnabled,
    isPayNextMonthMultiMode,
    pendingMultiMonthPayments,
    isPayNextMonthMode,
    payNextMonthBase,
    payNextMonthLateFee,
    payNextMonthGst,
    payNextMonthCareTax,
  ]);

  const baseServiceCharge = isServiceMode
    ? Number(pendingServiceBooking?.totalAmount || 0)
    : 0;
  const taxAmount = 0; // or compute if your API returns it
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [instructions, setInstructions] = useState('');

  const [method, setMethod] = useState('card'); // card | upi | netbanking
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveCardForRentals, setSaveCardForRentals] = useState(false);

  // Dummy payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [serviceReceiptData, setServiceReceiptData] = useState(null);
  const [receiptRedirectUrl, setReceiptRedirectUrl] = useState('/');

  // useEffect(() => {
  //   // Prevent redirect-to-cart while we are clearing cart as part of a
  //   // successful "Pay now" flow (we still navigate to payment-successful).
  //   if (items.length === 0 && !isPaymentSuccessFlowRef.current) {
  //     router.replace('/cart');
  //     return;
  //   }

  //   const addr = safeParse(
  //     localStorage.getItem('rentpay_checkout_selectedAddress'),
  //   );
  //   setSelectedAddress(addr || null);

  //   const ins = safeParse(
  //     localStorage.getItem('rentpay_checkout_instructions'),
  //   );

  //   if (isExtensionMode) {
  //     const raw = localStorage.getItem('rentpay_pending_extension');
  //     const ext = raw ? safeParse(raw) : null;
  //     setPendingExtension(ext || null);
  //   }
  //   setInstructions(typeof ins === 'string' ? ins : '');
  // }, [items.length, router]);

  // useEffect(() => {
  //   if (
  //     items.length === 0 &&
  //     !isPaymentSuccessFlowRef.current &&
  //     !isExtensionMode &&
  //     !isServiceMode
  //   ) {
  //     router.replace('/cart');
  //     return;
  //   }

  //   const addr = safeParse(
  //     localStorage.getItem('rentpay_checkout_selectedAddress'),
  //   );
  //   setSelectedAddress(addr || null);

  //   const ins = safeParse(
  //     localStorage.getItem('rentpay_checkout_instructions'),
  //   );
  //   setInstructions(typeof ins === 'string' ? ins : '');

  //   if (isExtensionMode) {
  //     const raw = localStorage.getItem('rentpay_pending_extension');
  //     const ext = raw ? safeParse(raw) : null;
  //     setPendingExtension(ext || null);
  //   }
  //   if (isServiceMode) {
  //     const raw = localStorage.getItem('rentpay_pending_service_booking');
  //     const booking = raw ? safeParse(raw) : null;
  //     if (!booking) {
  //       router.replace('/service');
  //       return;
  //     }
  //     setPendingServiceBooking(booking);
  //     if (booking.selectedAddress) setSelectedAddress(booking.selectedAddress);
  //   }
  // }, [items.length, router, isExtensionMode, isServiceMode]);

  useEffect(() => {
    // Check for a bundled service booking BEFORE deciding to redirect,
    // so we don't bounce a service-only cart back to /cart.
    const bundledServiceRawList = !isServiceMode
      ? safeParse(localStorage.getItem('rentpay_pending_service_bookings'))
      : null;
    const bundledServiceRaw =
      Array.isArray(bundledServiceRawList) && bundledServiceRawList.length > 0
        ? bundledServiceRawList
        : null;

    if (
      items.length === 0 &&
      !bundledServiceRaw &&
      !isPaymentSuccessFlowRef.current &&
      !isExtensionMode &&
      !isServiceMode &&
      !isServicePayMode &&
      !isPayNextMonthMode &&
      !isPayNextMonthMultiMode
    ) {
      router.replace('/cart');
      return;
    }
    const addr = safeParse(
      localStorage.getItem('rentpay_checkout_selectedAddress'),
    );
    setSelectedAddress(addr || null);

    const ins = safeParse(
      localStorage.getItem('rentpay_checkout_instructions'),
    );
    setInstructions(typeof ins === 'string' ? ins : '');

    if (isExtensionMode) {
      const raw = localStorage.getItem('rentpay_pending_extension');
      const ext = raw ? safeParse(raw) : null;
      setPendingExtension(ext || null);
    }
    if (isServicePayMode) {
      // No pending-booking localStorage needed for pay-later mode.
      return;
    }
    if (isPayNextMonthMultiMode) {
      const raw = localStorage.getItem('rentpay_pending_multi_month_payments');
      const list = raw ? safeParse(raw) : null;
      setPendingMultiMonthPayments(Array.isArray(list) ? list : []);
      return;
    }
    //   if (isServiceMode) {
    //     const raw = localStorage.getItem('rentpay_pending_service_booking');
    //     const booking = raw ? safeParse(raw) : null;
    //     if (!booking) {
    //       router.replace('/service');
    //       return;
    //     }
    //     setPendingServiceBooking(booking);
    //     if (booking.selectedAddress) setSelectedAddress(booking.selectedAddress);
    //   } else if (bundledServiceRaw) {
    //     // Bundled checkout flow: pick up the pending service booking here too.
    //     setPendingServiceBooking(bundledServiceRaw);
    //   }
    // }, [items.length, router, isExtensionMode, isServiceMode]);

    if (isServiceMode) {
      const raw = localStorage.getItem('rentpay_pending_service_booking');
      const booking = raw ? safeParse(raw) : null;
      if (!booking) {
        router.replace('/service');
        return;
      }
      if (booking.selectedAddress) setSelectedAddress(booking.selectedAddress);
      setPendingServiceBooking(booking);
    } else if (bundledServiceRaw) {
      // Bundled checkout flow: pick up all pending service bookings here too.
      setBundledServiceBookings(bundledServiceRaw);
    }
  }, [items.length, router, isExtensionMode, isServiceMode]);

  const handlePay = async () => {
    // if (isPayNextMonthMode && payNextMonthOrderId) {
    //   setError('');
    //   if (method === 'card') {
    //     if (
    //       !cardNumber.trim() ||
    //       !expiry.trim() ||
    //       !cvv.trim() ||
    //       !nameOnCard.trim()
    //     ) {
    //       setError('Please fill card details.');
    //       return;
    //     }
    //   }
    //   setLoading(true);
    //   try {
    //     await apiPayNextMonth(payNextMonthOrderId);
    // if (isPayNextMonthMode && payNextMonthOrderId) {
    //   setError('');
    //   if (method === 'card') {
    //     if (
    //       !cardNumber.trim() ||
    //       !expiry.trim() ||
    //       !cvv.trim() ||
    //       !nameOnCard.trim()
    //     ) {
    //       setError('Please fill card details.');
    //       return;
    //     }
    //   }
    //   setLoading(true);
    //   try {
    //     const payNextMonthProductId = searchParams.get('productId') || '';
    //     await apiPayNextMonth(payNextMonthOrderId, payNextMonthProductId);
    if (isPayNextMonthMultiMode && pendingMultiMonthPayments.length > 0) {
      setError('');
      if (method === 'card') {
        if (
          !cardNumber.trim() ||
          !expiry.trim() ||
          !cvv.trim() ||
          !nameOnCard.trim()
        ) {
          setError('Please fill card details.');
          return;
        }
      }
      setLoading(true);
      try {
        for (const item of pendingMultiMonthPayments) {
          await apiPayNextMonth(item.orderId, item.productId);
        }
        toast.success('Rent payment successful!', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'light',
        });
        isPaymentSuccessFlowRef.current = true;
        localStorage.removeItem('rentpay_pending_multi_month_payments');
        setTimeout(() => {
          router.push('/my-account?tab=orders&rentPaid=1');
        }, 1500);
      } catch (err) {
        setError(err.response?.data?.message || 'Payment failed.');
        setLoading(false);
      }
      return;
    }
    if (isPayNextMonthMode && payNextMonthOrderId) {
      setError('');
      if (method === 'card') {
        if (
          !cardNumber.trim() ||
          !expiry.trim() ||
          !cvv.trim() ||
          !nameOnCard.trim()
        ) {
          setError('Please fill card details.');
          return;
        }
      }
      setLoading(true);
      try {
        const payNextMonthProductId = searchParams.get('productId') || '';
        await apiPayNextMonth(payNextMonthOrderId, payNextMonthProductId);
        toast.success('Rent payment successful!', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'light',
        });
        isPaymentSuccessFlowRef.current = true;
        setTimeout(() => {
          router.push(
            `/my-account?tab=orders&rentPaid=1&orderId=${encodeURIComponent(
              payNextMonthOrderId,
            )}`,
          );
        }, 1500);
      } catch (err) {
        setError(err.response?.data?.message || 'Payment failed.');
        setLoading(false);
      }
      return;
    }
    // if (isServicePayMode && servicePayBookingId) {
    //   setError('');
    //   if (method === 'card') {
    //     if (
    //       !cardNumber.trim() ||
    //       !expiry.trim() ||
    //       !cvv.trim() ||
    //       !nameOnCard.trim()
    //     ) {
    //       setError('Please fill card details.');
    //       return;
    //     }
    //   }
    //   setLoading(true);
    //   try {
    //     await apiPayServiceBooking(servicePayBookingId, {
    //       paymentMethod: method,
    //     });
    //     toast.success('Payment successful!', {
    //       position: 'top-right',
    //       autoClose: 2000,
    //       theme: 'light',
    //     });
    //     isPaymentSuccessFlowRef.current = true;
    //     setTimeout(() => {
    //       router.push('/my-account?tab=orders&servicePaid=1');
    //     }, 1500);
    //   } catch (err) {
    //     setError(err.response?.data?.message || 'Payment failed.');
    //     setLoading(false);
    //   }
    //   return;
    // }
    if (isServicePayMode && servicePayBookingId) {
      setError('');
      if (method === 'card') {
        if (
          !cardNumber.trim() ||
          !expiry.trim() ||
          !cvv.trim() ||
          !nameOnCard.trim()
        ) {
          setError('Please fill card details.');
          return;
        }
      }
      setLoading(true);
      try {
        const payRes = await apiPayServiceBooking(servicePayBookingId, {
          paymentMethod: method,
        });
        const paidBooking = payRes?.data || {};
        isPaymentSuccessFlowRef.current = true;

        setReceiptRedirectUrl('/my-account?tab=orders&servicePaid=1');
        setServiceReceiptData({
          jobId: `SRV-${String(servicePayBookingId).slice(-8).toUpperCase()}`,
          serviceName:
            paidBooking?.serviceSnapshot?.productName ||
            paidBooking?.serviceProduct?.productName ||
            'Service',
          technicianName: paidBooking?.technicianName || '—',
          bookingDate: paidBooking?.bookingDate
            ? new Date(paidBooking.bookingDate).toLocaleDateString('en-IN')
            : '',
          timeSlot: paidBooking?.timeSlot?.label || '',
          serviceCharge: Number(
            paidBooking?.baseAmount ?? servicePayAmount ?? 0,
          ),
          taxLines: Array.isArray(paidBooking?.taxLines)
            ? paidBooking.taxLines
            : [],
          taxAndFees: 0,
          totalPaid: Number(paidBooking?.totalAmount ?? servicePayAmount ?? 0),
          paymentMethod: method,
          serviceType: 'Pay After Service',
        });
        setShowReceiptModal(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Payment failed.');
        setLoading(false);
      }
      return;
    }
    // At the TOP of the try block inside handlePay, before the existing rental logic:
    // if (isExtensionMode && pendingExtension) {
    //   const {
    //     orderId,
    //     productId,
    //     extensionUnit,
    //     extensionDuration,
    //     newUnitRent,
    //   } = pendingExtension;
    //   const res = await apiExtendMyOrderTenure(orderId, {
    //     extensionUnit,
    //     extensionDuration,
    //     newUnitRent,
    //     productId,
    //   });
    //   const updated = res.data;
    //   // Patch the order in Redux/local state isn't available here — we re-fetch on /my-rentals
    //   localStorage.removeItem('rentpay_pending_extension');
    //   isPaymentSuccessFlowRef.current = true;
    //   router.push(
    //     `/my-rentals?extensionSuccess=1&orderId=${encodeURIComponent(orderId)}`,
    //   );
    //   return;
    // }

    if (isExtensionMode && pendingExtension) {
      const {
        orderId,
        productId,
        extensionUnit,
        extensionDuration,
        newUnitRent,
      } = pendingExtension;

      await apiExtendMyOrderTenure(orderId, {
        extensionUnit,
        extensionDuration,
        newUnitRent,
        productId,
      });

      localStorage.removeItem('rentpay_pending_extension');

      //  SHOW TOAST HERE
      toast.success('Product tenure extended successfully!', {
        position: 'top-right',
        autoClose: 2000,
        theme: 'light',
      });

      isPaymentSuccessFlowRef.current = true;

      //  Delay redirect so toast is visible
      setTimeout(() => {
        // router.push(
        //   `/my-rentals?extensionSuccess=1&orderId=${encodeURIComponent(orderId)}`,
        // );
        router.push(
          `/my-account?tab=rentals&extensionSuccess=1&orderId=${encodeURIComponent(orderId)}`,
        );
      }, 2000);

      return;
    }
    // ... existing rental order code continues below unchanged
    setError('');
    if (!selectedAddress) {
      setError('Missing delivery address. Go back to checkout.');
      return;
    }
    if (method === 'card') {
      if (
        !cardNumber.trim() ||
        !expiry.trim() ||
        !cvv.trim() ||
        !nameOnCard.trim()
      ) {
        setError('Please fill card details.');
        return;
      }
    }

    if (isServicePayMode && method === 'pay_after_service') {
      setError('Please choose a valid payment method.');
      return;
    }

    setLoading(true);
    try {
      // if (isServiceMode && pendingServiceBooking) {
      //   const bookingRes = await apiCreateBooking({
      //     ...pendingServiceBooking,
      //     paymentMethod: method,
      //     address: addressLine,
      //     phone: selectedAddress.phone,
      //     name: selectedAddress.fullName,
      //   });
      //   const createdBookingId = bookingRes?.data?._id || '';
      //   if (createdBookingId) {
      //     localStorage.setItem('rentpay_last_service_booking_id', createdBookingId);
      //   }
      //   isPaymentSuccessFlowRef.current = true;
      //   localStorage.removeItem('rentpay_pending_service_booking');
      //   localStorage.removeItem('rentpay_checkout_selectedAddress');
      //   router.push(
      //     createdBookingId
      //       ? `/payment-successful?bookingId=${encodeURIComponent(createdBookingId)}`
      //       : '/payment-successful',
      //   );
      //   return;
      // }

      if (isServiceMode && pendingServiceBooking) {
        // const bookingRes = await apiCreateBooking({
        //   ...pendingServiceBooking,
        //   paymentMethod: method,
        //   address: addressLine,
        //   phone: selectedAddress.phone,
        //   name: selectedAddress.fullName,
        // });
        // const bookingRes = await apiCreateBooking({
        //   ...pendingServiceBooking,
        //   paymentMethod: method,
        //   address: addressLine,
        //   phone: selectedAddress.phone,
        //   name: selectedAddress.fullName,
        //   taxLines: receiptTaxLines,
        //   taxBreakdown: Object.fromEntries(
        //     receiptTaxLines.map((t) => [
        //       t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
        //       t.value,
        //     ]),
        //   ),
        // });

        const svcTax = pendingServiceBooking?.subCategoryTax || {};
        const svcBlocked =
          pendingServiceBooking?.taxBlocked === true ||
          svcTax?.taxBlocked === true;
        const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
        const calcSvcTax = (subKey, globalKey) => {
          if (svcBlocked) return 0;
          const rate =
            svcTax[subKey] != null
              ? Number(svcTax[subKey])
              : (globalTax?.services?.[globalKey] ?? 0);
          return Math.round((svcBase * rate) / 100);
        };
        const receiptTaxLines = [
          { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
          // { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
          {
            label: 'Care Tax',
            value: isCareProtectionEnabled
              ? calcSvcTax('defaultCareTax', 'careTax')
              : 0,
          },
          {
            label: 'Repair & Warranty',
            value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
          },
          {
            label: 'Relocation Warranty',
            value: calcSvcTax(
              'defaultRelocationWarranty',
              'relocationWarranty',
            ),
          },
          {
            label: 'Delivery & Packaging',
            value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
          },
          {
            label: 'Installation Fee',
            value: calcSvcTax('defaultInstallationFee', 'installationFee'),
          },
          {
            label: 'Platform Fee',
            value: calcSvcTax('defaultPlatformFee', 'platformFee'),
          },
        ].filter((t) => t.value > 0);

        // const bookingRes = await apiCreateBooking({
        //   ...pendingServiceBooking,
        //   paymentMethod: method,
        //   address: addressLine,
        //   phone: selectedAddress.phone,
        //   name: selectedAddress.fullName,
        //   taxLines: receiptTaxLines,
        //   taxBreakdown: Object.fromEntries(
        //     receiptTaxLines.map((t) => [
        //       t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
        //       t.value,
        //     ]),
        //   ),
        // });
        const bookingRes = await apiCreateBooking({
          ...pendingServiceBooking,
          paymentMethod: method,
          address: addressLine,
          phone: selectedAddress.phone,
          name: selectedAddress.fullName,
          totalAmount: total,
          taxLines: receiptTaxLines,
          taxBreakdown: Object.fromEntries(
            receiptTaxLines.map((t) => [
              t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
              t.value,
            ]),
          ),
        });
        const createdBookingId = bookingRes?.data?._id || '';
        const bookingData = bookingRes?.data || {};
        if (createdBookingId) {
          localStorage.setItem(
            'rentpay_last_service_booking_id',
            createdBookingId,
          );
          apiSendBookingConfirmationEmail(createdBookingId).catch((e) =>
            console.error('Booking confirmation email trigger failed', e),
          );
        }
        isPaymentSuccessFlowRef.current = true;
        localStorage.removeItem('rentpay_pending_service_booking');
        localStorage.removeItem('rentpay_checkout_selectedAddress');

        // Show receipt modal instead of redirecting
        // setServiceReceiptData({
        //   jobId:
        //     bookingData.jobId ||
        //     createdBookingId?.slice(-8)?.toUpperCase() ||
        //     'SRV-0000',
        //   serviceName: pendingServiceBooking.serviceName,
        //   technicianName: bookingData.technicianName || '—',
        //   bookingDate: pendingServiceBooking.bookingDate,
        //   timeSlot: pendingServiceBooking.timeSlot?.label,
        //   serviceCharge: baseServiceCharge, // see note below
        //   taxAndFees: taxAmount,
        //   totalPaid: total,
        //   paymentMethod: method,
        // const svcTax = pendingServiceBooking?.subCategoryTax || {};
        // const svcBlocked =
        //   pendingServiceBooking?.taxBlocked === true ||
        //   svcTax?.taxBlocked === true;
        // const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
        // const calcSvcTax = (subKey, globalKey) => {
        //   if (svcBlocked) return 0;
        //   const rate =
        //     svcTax[subKey] != null
        //       ? Number(svcTax[subKey])
        //       : (globalTax?.services?.[globalKey] ?? 0);
        //   return Math.round((svcBase * rate) / 100);
        // };
        // const receiptTaxLines = [
        //   { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
        //   { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
        //   {
        //     label: 'Repair & Warranty',
        //     value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
        //   },
        //   {
        //     label: 'Relocation Warranty',
        //     value: calcSvcTax(
        //       'defaultRelocationWarranty',
        //       'relocationWarranty',
        //     ),
        //   },
        //   {
        //     label: 'Delivery & Packaging',
        //     value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
        //   },
        //   {
        //     label: 'Installation Fee',
        //     value: calcSvcTax('defaultInstallationFee', 'installationFee'),
        //   },
        //   {
        //     label: 'Platform Fee',
        //     value: calcSvcTax('defaultPlatformFee', 'platformFee'),
        //   },
        // ].filter((t) => t.value > 0);

        setServiceReceiptData({
          jobId:
            bookingData.jobId ||
            createdBookingId?.slice(-8)?.toUpperCase() ||
            'SRV-0000',
          serviceName: pendingServiceBooking.serviceName,
          technicianName: bookingData.technicianName || '—',
          bookingDate: pendingServiceBooking.bookingDate,
          timeSlot: pendingServiceBooking.timeSlot?.label,
          serviceCharge: baseServiceCharge,
          taxLines: receiptTaxLines,
          taxAndFees: taxAmount,
          totalPaid: total,
          paymentMethod: method,
        });

        setShowReceiptModal(true);
        return;
      }

      // const rentalItems = items.filter(
      //   (i) => String(i.productType || 'Rental') === 'Rental',
      // );
      // Service-only bundled checkout (no rent/buy items in cart) — skip order creation entirely.
      if (items.length === 0 && bundledServiceBookings.length > 0) {
        const createdBookings = [];
        for (const booking of bundledServiceBookings) {
          const { taxLines, total: bTotal } = computeBookingTotal(
            booking,
            globalTax,
            isCareProtectionEnabled,
          );
          const bookingRes = await apiCreateBooking({
            ...booking,
            paymentMethod: method,
            address: addressLine,
            phone: selectedAddress.phone,
            name: selectedAddress.fullName,
            totalAmount: bTotal,
            taxLines,
            taxBreakdown: Object.fromEntries(
              taxLines.map((t) => [
                t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
                t.value,
              ]),
            ),
          });
          const bookingId = bookingRes?.data?._id;
          if (bookingId) {
            apiSendBookingConfirmationEmail(bookingId).catch((e) =>
              console.error('Booking confirmation email trigger failed', e),
            );
          }
          createdBookings.push({
            booking,
            bookingId,
            bookingData: bookingRes?.data || {},
            taxLines,
            base: Number(booking?.totalAmount || 0),
            total: bTotal,
          });
        }

        isPaymentSuccessFlowRef.current = true;
        localStorage.removeItem('rentpay_pending_service_bookings');
        localStorage.removeItem('rentpay_checkout_selectedAddress');
        localStorage.removeItem('rentpay_checkout_instructions');

        if (method === 'pay_after_service') {
          router.push('/my-account?tab=orders');
          return;
        }

        const combinedBase = createdBookings.reduce((s, c) => s + c.base, 0);
        const combinedTotal = createdBookings.reduce((s, c) => s + c.total, 0);
        const combinedTaxLines = [];
        createdBookings.forEach((c) => {
          c.taxLines.forEach((t) => {
            const existing = combinedTaxLines.find((x) => x.label === t.label);
            if (existing) existing.value += t.value;
            else combinedTaxLines.push({ ...t });
          });
        });
        const first = createdBookings[0];

        setReceiptRedirectUrl('/my-account?tab=orders');
        setServiceReceiptData({
          jobId:
            first.bookingData.jobId ||
            first.bookingId?.slice(-8)?.toUpperCase() ||
            'SRV-0000',
          serviceName:
            createdBookings.length > 1
              ? `${first.booking.serviceName} + ${createdBookings.length - 1} more`
              : first.booking.serviceName,
          technicianName: first.bookingData.technicianName || '—',
          bookingDate: first.booking.bookingDate,
          timeSlot: first.booking.timeSlot?.label,
          serviceCharge: combinedBase,
          taxLines: combinedTaxLines,
          taxAndFees: combinedTaxLines.reduce((s, t) => s + t.value, 0),
          totalPaid: combinedTotal,
          paymentMethod: method,
        });
        setShowReceiptModal(true);
        return;
      }
      if (false) {
        const svcTax = pendingServiceBooking?.subCategoryTax || {};
        const svcBlocked =
          pendingServiceBooking?.taxBlocked === true ||
          svcTax?.taxBlocked === true;
        const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
        const calcSvcTax = (subKey, globalKey) => {
          if (svcBlocked) return 0;
          const rate =
            svcTax[subKey] != null
              ? Number(svcTax[subKey])
              : (globalTax?.services?.[globalKey] ?? 0);
          return Math.round((svcBase * rate) / 100);
        };
        // const receiptTaxLines = [
        //   { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
        //   { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
        //   {
        //     label: 'Repair & Warranty',
        //     value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
        //   },
        //   {
        //     label: 'Relocation Warranty',
        //     value: calcSvcTax(
        //       'defaultRelocationWarranty',
        //       'relocationWarranty',
        //     ),
        //   },
        //   {
        //     label: 'Delivery & Packaging',
        //     value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
        //   },
        //   {
        //     label: 'Installation Fee',
        //     value: calcSvcTax('defaultInstallationFee', 'installationFee'),
        //   },
        //   {
        //     label: 'Platform Fee',
        //     value: calcSvcTax('defaultPlatformFee', 'platformFee'),
        //   },
        // ].filter((t) => t.value > 0);
        // const svcTotal =
        //   svcBase + receiptTaxLines.reduce((s, t) => s + t.value, 0);

        // await apiCreateBooking({
        const receiptTaxLines = [
          { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
          {
            label: 'Care Tax',
            value: isCareProtectionEnabled
              ? calcSvcTax('defaultCareTax', 'careTax')
              : 0,
          },
          {
            label: 'Repair & Warranty',
            value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
          },
          {
            label: 'Relocation Warranty',
            value: calcSvcTax(
              'defaultRelocationWarranty',
              'relocationWarranty',
            ),
          },
          {
            label: 'Delivery & Packaging',
            value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
          },
          {
            label: 'Installation Fee',
            value: calcSvcTax('defaultInstallationFee', 'installationFee'),
          },
          {
            label: 'Platform Fee',
            value: calcSvcTax('defaultPlatformFee', 'platformFee'),
          },
        ].filter((t) => t.value > 0);
        const svcTotal =
          svcBase + receiptTaxLines.reduce((s, t) => s + t.value, 0);

        // await apiCreateBooking({
        //   ...pendingServiceBooking,
        //   paymentMethod: method,
        //   address: addressLine,
        //   phone: selectedAddress.phone,
        //   name: selectedAddress.fullName,
        //   totalAmount: svcTotal,
        //   taxLines: receiptTaxLines,
        //   taxBreakdown: Object.fromEntries(
        //     receiptTaxLines.map((t) => [
        //       t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
        //       t.value,
        //     ]),
        //   ),
        // });

        // isPaymentSuccessFlowRef.current = true;
        // localStorage.removeItem('rentpay_pending_service_booking');
        // localStorage.removeItem('rentpay_checkout_selectedAddress');
        // localStorage.removeItem('rentpay_checkout_instructions');
        // router.push('/payment-successful');
        // return;

        const soloBookingRes = await apiCreateBooking({
          ...pendingServiceBooking,
          paymentMethod: method,
          address: addressLine,
          phone: selectedAddress.phone,
          name: selectedAddress.fullName,
          totalAmount: svcTotal,
          taxLines: receiptTaxLines,
          taxBreakdown: Object.fromEntries(
            receiptTaxLines.map((t) => [
              t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
              t.value,
            ]),
          ),
        });

        //   const soloBookingId = soloBookingRes?.data?._id;
        //   if (soloBookingId) {
        //     apiSendBookingConfirmationEmail(soloBookingId).catch((e) =>
        //       console.error('Booking confirmation email trigger failed', e),
        //     );
        //   }

        //   isPaymentSuccessFlowRef.current = true;
        //   localStorage.removeItem('rentpay_pending_service_booking');
        //   localStorage.removeItem('rentpay_checkout_selectedAddress');
        //   localStorage.removeItem('rentpay_checkout_instructions');
        //   router.push(
        //     method === 'pay_after_service'
        //       ? '/my-account?tab=orders'
        //       : '/payment-successful',
        //   );
        //   return;
        // }

        const soloBookingId = soloBookingRes?.data?._id;
        const soloBookingData = soloBookingRes?.data || {};
        if (soloBookingId) {
          apiSendBookingConfirmationEmail(soloBookingId).catch((e) =>
            console.error('Booking confirmation email trigger failed', e),
          );
        }

        isPaymentSuccessFlowRef.current = true;
        localStorage.removeItem('rentpay_pending_service_booking');
        localStorage.removeItem('rentpay_checkout_selectedAddress');
        localStorage.removeItem('rentpay_checkout_instructions');

        if (method === 'pay_after_service') {
          router.push('/my-account?tab=orders');
          return;
        }

        setReceiptRedirectUrl('/my-account?tab=orders');
        setServiceReceiptData({
          jobId:
            soloBookingData.jobId ||
            soloBookingId?.slice(-8)?.toUpperCase() ||
            'SRV-0000',
          serviceName: pendingServiceBooking.serviceName,
          technicianName: soloBookingData.technicianName || '—',
          bookingDate: pendingServiceBooking.bookingDate,
          timeSlot: pendingServiceBooking.timeSlot?.label,
          serviceCharge: svcBase,
          taxLines: receiptTaxLines,
          taxAndFees: receiptTaxLines.reduce((s, t) => s + t.value, 0),
          totalPaid: svcTotal,
          paymentMethod: method,
        });
        setShowReceiptModal(true);
        return;
      }

      const rentalItems = items.filter(
        (i) => String(i.productType || 'Rental') === 'Rental',
      );
      const rentalDuration = Number(rentalItems?.[0]?.rentalMonths || 1);
      const tenureUnit =
        rentalItems?.[0]?.tenureUnit === 'day' ? 'day' : 'month';

      console.log(
        'ORDER PAYLOAD:',
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          variantName: i.variantName,
        })),
      );

      // const orderRes = await apiCreateOrder({
      //   products: items.map((i) => ({
      //     product: i.productId,
      //     variantId: i.variantId || null,
      //     quantity: Number(i.quantity),
      //     pricePerDay: Number(i.pricePerDay),
      //   })),
      //   rentalDuration: rentalDuration,
      //   tenureUnit,
      //   address: addressLine,
      //   phone: selectedAddress.phone,
      //   name: selectedAddress.fullName,
      //   couponId: appliedCoupon?.couponId || null,
      //   discountAmount: appliedCoupon?.discountAmount || 0,
      //   // ── price snapshot ──────────────────────────────
      //   totalAmount: total,
      //   baseRentalCost: rentalBaseCost,
      //   deliveryFee: deliveryFee,
      //   gst: gst,
      //   refundableDeposit: refundableDepositTotal,
      //   careProtection: careProtection,
      // });

      // const orderRes = await apiCreateOrder({
      //   products: items.map((i) => ({
      //     product: i.productId,
      //     variantId: i.variantId || null,
      //     quantity: Number(i.quantity),
      //     pricePerDay: Number(i.pricePerDay),
      //   })),
      //   rentalDuration: rentalDuration,
      //   tenureUnit,
      //   address: addressLine,
      //   phone: selectedAddress.phone,
      //   name: selectedAddress.fullName,
      //   couponId: appliedCoupon?.couponId || null,
      //   discountAmount: appliedCoupon?.discountAmount || 0,

      const orderRes = await apiCreateOrder({
        products: items.map((i) => ({
          product: i.productId,
          variantId: i.variantId || null,
          quantity: Number(i.quantity),
          pricePerDay: Number(i.pricePerDay),
        })),
        rentalDuration: rentalDuration,
        tenureUnit,
        address: addressLine,
        phone: selectedAddress.phone,
        name: selectedAddress.fullName,
        deliveryInstructions: instructions,
        couponId: appliedCoupon?.couponId || null,
        discountAmount: appliedCoupon?.discountAmount || 0,
        // // ── price snapshot ──────────────────────────────
        // totalAmount: total,
        // baseRentalCost: rentalBaseCost,
        // deliveryFee: deliveryFee,
        // gst: gst,
        // refundableDeposit: refundableDepositTotal,
        // careProtection: careProtection,
        // ── price snapshot ──────────────────────────────
        totalAmount: total,
        baseRentalCost: rentalBaseCost,
        deliveryFee: deliveryFee,
        gst: gst,
        refundableDeposit: refundableDepositTotal,
        careProtection: careProtection,
        repairWarranty: repairWarranty,
        relocationWarranty: relocationWarranty,
        deliveryPackaging: deliveryPackaging,
        installationFee: installationFee,
        platformFee: platformFee,

        // ── city ────────────────────────────────────────
        cityKey:
          selectedAddress.cityKey ||
          (selectedAddress.city || '').trim().toLowerCase(),

        // ── customer's navbar-selected location snapshot ─
        orderLocation: getNavbarOrderLocation(),
      });
      // const createdOrderId = orderRes?.data?._id || '';
      // if (createdOrderId) {
      //   localStorage.setItem('rentpay_last_order_id', createdOrderId);
      // }

      // // isPaymentSuccessFlowRef.current = true;
      // // dispatch(clearCart());
      // // dispatch(clearAppliedCoupon());
      // // localStorage.removeItem('rentpay_checkout_selectedAddress');
      // // localStorage.removeItem('rentpay_checkout_instructions');
      // isPaymentSuccessFlowRef.current = true;
      // dispatch(clearCart());
      // dispatch(clearAppliedCoupon());
      // localStorage.removeItem('rentpay_checkout_selectedAddress');
      // localStorage.removeItem('rentpay_checkout_instructions');
      // localStorage.removeItem('rentpay_care_protection_enabled');
      const createdOrderId = orderRes?.data?._id || '';
      if (createdOrderId) {
        localStorage.setItem('rentpay_last_order_id', createdOrderId);
        // Fire-and-forget order confirmation email — doesn't block checkout flow
        apiSendOrderConfirmationEmail(createdOrderId).catch((e) =>
          console.error('Order confirmation email trigger failed', e),
        );
      }

      // If service bookings are also pending (bundled checkout), book them now too.
      for (const oneBooking of bundledServiceBookings) {
        const { taxLines, total: bTotal } = computeBookingTotal(
          oneBooking,
          globalTax,
          isCareProtectionEnabled,
        );
        try {
          const bundledBookingRes = await apiCreateBooking({
            ...oneBooking,
            paymentMethod: method,
            address: addressLine,
            phone: selectedAddress.phone,
            name: selectedAddress.fullName,
            totalAmount: bTotal,
            taxLines,
            taxBreakdown: Object.fromEntries(
              taxLines.map((t) => [
                t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
                t.value,
              ]),
            ),
          });
          const bundledBookingId = bundledBookingRes?.data?._id;
          if (bundledBookingId) {
            apiSendBookingConfirmationEmail(bundledBookingId).catch((e) =>
              console.error('Booking confirmation email trigger failed', e),
            );
          }
        } catch (svcErr) {
          console.error('Service booking failed', svcErr);
          setError(
            'Rent/Buy order placed, but a service booking could not be confirmed. Please retry it from your cart.',
          );
        }
      }
      if (false && pendingServiceBooking) {
        const svcTax = pendingServiceBooking?.subCategoryTax || {};
        const svcBlocked =
          pendingServiceBooking?.taxBlocked === true ||
          svcTax?.taxBlocked === true;
        const svcBase = Number(pendingServiceBooking?.totalAmount || 0);
        const calcSvcTax = (subKey, globalKey) => {
          if (svcBlocked) return 0;
          const rate =
            svcTax[subKey] != null
              ? Number(svcTax[subKey])
              : (globalTax?.services?.[globalKey] ?? 0);
          return Math.round((svcBase * rate) / 100);
        };
        const receiptTaxLines = [
          { label: 'GST', value: calcSvcTax('defaultGst', 'gst') },
          // { label: 'Care Tax', value: calcSvcTax('defaultCareTax', 'careTax') },
          {
            label: 'Care Tax',
            value: isCareProtectionEnabled
              ? calcSvcTax('defaultCareTax', 'careTax')
              : 0,
          },
          {
            label: 'Repair & Warranty',
            value: calcSvcTax('defaultRepairWarranty', 'repairWarranty'),
          },
          {
            label: 'Relocation Warranty',
            value: calcSvcTax(
              'defaultRelocationWarranty',
              'relocationWarranty',
            ),
          },
          {
            label: 'Delivery & Packaging',
            value: calcSvcTax('defaultDeliveryPackaging', 'deliveryPackaging'),
          },
          {
            label: 'Installation Fee',
            value: calcSvcTax('defaultInstallationFee', 'installationFee'),
          },
          {
            label: 'Platform Fee',
            value: calcSvcTax('defaultPlatformFee', 'platformFee'),
          },
        ].filter((t) => t.value > 0);
        const svcTotal =
          svcBase + receiptTaxLines.reduce((s, t) => s + t.value, 0);

        // try {
        //   await apiCreateBooking({
        //     ...pendingServiceBooking,
        //     paymentMethod: method,
        //     address: addressLine,
        //     phone: selectedAddress.phone,
        //     name: selectedAddress.fullName,
        //     totalAmount: svcTotal,
        //     taxLines: receiptTaxLines,
        //     taxBreakdown: Object.fromEntries(
        //       receiptTaxLines.map((t) => [
        //         t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
        //         t.value,
        //       ]),
        //     ),
        //   });
        // } catch (svcErr) {
        try {
          const bundledBookingRes = await apiCreateBooking({
            ...pendingServiceBooking,
            paymentMethod: method,
            address: addressLine,
            phone: selectedAddress.phone,
            name: selectedAddress.fullName,
            totalAmount: svcTotal,
            taxLines: receiptTaxLines,
            taxBreakdown: Object.fromEntries(
              receiptTaxLines.map((t) => [
                t.label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
                t.value,
              ]),
            ),
          });
          const bundledBookingId = bundledBookingRes?.data?._id;
          if (bundledBookingId) {
            apiSendBookingConfirmationEmail(bundledBookingId).catch((e) =>
              console.error('Booking confirmation email trigger failed', e),
            );
          }
        } catch (svcErr) {
          console.error('Service booking failed', svcErr);
          // Don't block the already-successful rent/buy order; surface a warning instead.
          setError(
            'Rent/Buy order placed, but the service booking could not be confirmed. Please retry the service booking from your cart.',
          );
        }
      }

      // isPaymentSuccessFlowRef.current = true;
      // dispatch(clearCart());
      // dispatch(clearAppliedCoupon());
      // localStorage.removeItem('rentpay_checkout_selectedAddress');
      // localStorage.removeItem('rentpay_checkout_instructions');
      // localStorage.removeItem('rentpay_care_protection_enabled');
      // localStorage.removeItem('rentpay_pending_service_booking');
      // router.push(
      //   createdOrderId
      //     ? `/payment-successful?orderId=${encodeURIComponent(createdOrderId)}`
      //     : '/payment-successful',
      // );
      isPaymentSuccessFlowRef.current = true;
      dispatch(clearCart());
      dispatch(clearAppliedCoupon());
      localStorage.removeItem('rentpay_checkout_selectedAddress');
      localStorage.removeItem('rentpay_checkout_instructions');
      localStorage.removeItem('rentpay_care_protection_enabled');
      localStorage.removeItem('rentpay_pending_service_bookings');

      const successUrl = createdOrderId
        ? `/payment-successful?orderId=${encodeURIComponent(createdOrderId)}`
        : '/payment-successful';

      // If services were part of this order, show the receipt modal first.
      if (bundledServiceBookings.length > 0) {
        const combinedBase2 = bundledServiceBookings.reduce(
          (s, b) => s + Number(b?.totalAmount || 0),
          0,
        );
        const combinedTaxLines2 = [];
        let combinedTotal2 = 0;
        bundledServiceBookings.forEach((b) => {
          const { taxLines, total } = computeBookingTotal(
            b,
            globalTax,
            isCareProtectionEnabled,
          );
          combinedTotal2 += total;
          taxLines.forEach((t) => {
            const existing = combinedTaxLines2.find((x) => x.label === t.label);
            if (existing) existing.value += t.value;
            else combinedTaxLines2.push({ ...t });
          });
        });
        const first2 = bundledServiceBookings[0];

        setReceiptRedirectUrl(successUrl);
        setServiceReceiptData({
          jobId: `SRV-${String(first2.productId || '')
            .slice(-6)
            .toUpperCase()}`,
          serviceName:
            bundledServiceBookings.length > 1
              ? `${first2.serviceName} + ${bundledServiceBookings.length - 1} more`
              : first2.serviceName,
          technicianName: '—',
          bookingDate: first2.bookingDate,
          timeSlot: first2.timeSlot?.label,
          serviceCharge: combinedBase2,
          taxLines: combinedTaxLines2,
          taxAndFees: combinedTaxLines2.reduce((s, t) => s + t.value, 0),
          totalPaid: combinedTotal2,
          paymentMethod: method,
        });
        setShowReceiptModal(true);
      } else if (false && pendingServiceBooking) {
        const svcTax2 = pendingServiceBooking?.subCategoryTax || {};
        const svcBlocked2 =
          pendingServiceBooking?.taxBlocked === true ||
          svcTax2?.taxBlocked === true;
        const svcBase2 = Number(pendingServiceBooking?.totalAmount || 0);
        const calcSvcTax2 = (subKey, globalKey) => {
          if (svcBlocked2) return 0;
          const rate =
            svcTax2[subKey] != null
              ? Number(svcTax2[subKey])
              : (globalTax?.services?.[globalKey] ?? 0);
          return Math.round((svcBase2 * rate) / 100);
        };
        const receiptLines = [
          { label: 'GST', value: calcSvcTax2('defaultGst', 'gst') },
          {
            label: 'Care Tax',
            value: isCareProtectionEnabled
              ? calcSvcTax2('defaultCareTax', 'careTax')
              : 0,
          },
          {
            label: 'Repair & Warranty',
            value: calcSvcTax2('defaultRepairWarranty', 'repairWarranty'),
          },
          {
            label: 'Relocation Warranty',
            value: calcSvcTax2(
              'defaultRelocationWarranty',
              'relocationWarranty',
            ),
          },
          {
            label: 'Delivery & Packaging',
            value: calcSvcTax2('defaultDeliveryPackaging', 'deliveryPackaging'),
          },
          {
            label: 'Installation Fee',
            value: calcSvcTax2('defaultInstallationFee', 'installationFee'),
          },
          {
            label: 'Platform Fee',
            value: calcSvcTax2('defaultPlatformFee', 'platformFee'),
          },
        ].filter((t) => t.value > 0);
        const svcPaidTotal =
          svcBase2 + receiptLines.reduce((s, t) => s + t.value, 0);

        setReceiptRedirectUrl(successUrl);
        setServiceReceiptData({
          jobId: `SRV-${String(pendingServiceBooking.productId || '')
            .slice(-6)
            .toUpperCase()}`,
          serviceName: pendingServiceBooking.serviceName,
          technicianName: '—',
          bookingDate: pendingServiceBooking.bookingDate,
          timeSlot: pendingServiceBooking.timeSlot?.label,
          serviceCharge: svcBase2,
          taxLines: receiptLines,
          taxAndFees: receiptLines.reduce((s, t) => s + t.value, 0),
          totalPaid: svcPaidTotal,
          paymentMethod: method,
        });
        setShowReceiptModal(true);
      } else {
        router.push(successUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
      setLoading(false);
    }
  };

  const addressLine = selectedAddress
    ? `${selectedAddress.addressLine}${
        selectedAddress.area ? `, ${selectedAddress.area}` : ''
      }${selectedAddress.city ? `, ${selectedAddress.city}` : ''}${
        selectedAddress.pincode ? ` - ${selectedAddress.pincode}` : ''
      }`
    : '';

  return (
    <div className="min-h-screen bg-[#eff2f8]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isServiceMode
            ? 'Complete your service booking payment'
            : 'Choose your preferred payment method'}
        </p>

        {/* {isServiceMode && pendingServiceBooking ? (
          <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {pendingServiceBooking.image ? (
                <img
                  src={pendingServiceBooking.image}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : null}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {pendingServiceBooking.serviceName || 'Service booking'}
                </p>
                <p className="text-xs text-gray-500">
                  {pendingServiceBooking.bookingDate} ·{' '}
                  {pendingServiceBooking.timeSlot?.label}
                </p>
              </div>
            </div>
          </div>
        ) : null} */}
        {isServiceMode && pendingServiceBooking ? (
          <ServiceOrderSummary
            booking={pendingServiceBooking}
            globalTax={globalTax}
          />
        ) : null}
        {!isServiceMode &&
          bundledServiceBookings.map((b) => (
            <ServiceOrderSummary
              key={b.bookingId || b.productId}
              booking={b}
              globalTax={globalTax}
            />
          ))}

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700">
            Select Payment Mode
          </h2>

          <div className="mt-4 space-y-3">
            {(pendingServiceBooking || bundledServiceBookings.length > 0) &&
            !isServicePayMode ? (
              <label
                className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
                  method === 'pay_after_service'
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3 px-4 py-4">
                  <input
                    type="radio"
                    name="paymode"
                    checked={method === 'pay_after_service'}
                    onChange={() => setMethod('pay_after_service')}
                    className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
                    style={{
                      backgroundImage:
                        method === 'pay_after_service'
                          ? 'radial-gradient(white 40%, transparent 41%)'
                          : 'none',
                    }}
                  />
                  <span className="w-8 h-8 flex items-center justify-center mt-0.5">
                    <Lock className="w-4 h-4 text-gray-600" />
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">
                      Pay After Service
                    </span>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Book now, pay once the service is completed
                    </p>
                  </div>
                </div>
              </label>
            ) : null}
            {/* <label
              className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
                method === 'upi'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-4">
                <input
                  type="radio"
                  name="paymode"
                  checked={method === 'upi'}
                  onChange={() => setMethod('upi')}
                  className="mt-1"
                />
                <Smartphone className="mt-0.5 h-4 w-4 text-gray-500" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">UPI</span>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Fastest
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Google Pay, PhonePe, Paytm & more
                  </p>
                </div>
              </div>
            </label> */}
            <label
              className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
                method === 'upi'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-4">
                {/* <input
                  type="radio"
                  name="paymode"
                  checked={method === 'upi'}
                  onChange={() => setMethod('upi')}
                  className="mt-1"
                /> */}
                <input
                  type="radio"
                  name="paymode"
                  checked={method === 'upi'}
                  onChange={() => setMethod('upi')}
                  className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
                  style={{
                    backgroundImage:
                      method === 'upi'
                        ? 'radial-gradient(white 40%, transparent 41%)'
                        : 'none',
                  }}
                />

                {/* Icon (aligned with content) */}
                <span className="w-8 h-8 flex items-center justify-center mt-0.5">
                  <Smartphone className="w-4 h-4 text-gray-600" />
                </span>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">UPI</span>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Fastest
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Google Pay, PhonePe, Paytm & more
                  </p>
                </div>
              </div>
            </label>

            <div
              className={`overflow-hidden rounded-2xl border transition ${
                method === 'card'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* <label className="flex cursor-pointer items-start gap-3 px-4 py-4">
                <input
                  type="radio"
                  name="paymode"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                  className="mt-1 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
                  style={{
                    backgroundImage:
                      method === 'card'
                        ? 'radial-gradient(white 40%, transparent 41%)'
                        : 'none',
                  }}
                />
                <CreditCard className="mt-0.5 h-4 w-4 text-gray-500" />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    Credit / Debit Card
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Visa, Mastercard, RuPay
                  </p>
                </div>
              </label> */}
              <label className="flex cursor-pointer items-start gap-3 px-4 py-4">
                <input
                  type="radio"
                  name="paymode"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                  className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
                  style={{
                    backgroundImage:
                      method === 'card'
                        ? 'radial-gradient(white 40%, transparent 41%)'
                        : 'none',
                  }}
                />

                {/* Centered Icon */}
                <span className="w-8 h-8 flex items-center justify-center mt-0.5">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </span>

                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    Credit / Debit Card
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Visa, Mastercard, RuPay
                  </p>
                </div>
              </label>

              {method === 'card' ? (
                <div className="border-t border-orange-200 bg-white px-4 py-4 sm:px-5">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded border border-gray-200 bg-[#f7f9fc] px-2 py-1 text-[10px] text-gray-600">
                      VISA
                    </span>
                    <span className="rounded border border-gray-200 bg-[#f7f9fc] px-2 py-1 text-[10px] text-gray-600">
                      Mastercard
                    </span>
                    <span className="rounded border border-gray-200 bg-[#f7f9fc] px-2 py-1 text-[10px] text-gray-600">
                      RuPay
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-[11px] font-medium text-gray-600 sm:col-span-2">
                      Card Number
                      <input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                        placeholder="1234 5678 9012 3456"
                      />
                    </label>

                    <label className="text-[11px] font-medium text-gray-600">
                      Expiry (MM/YY)
                      <input
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                        placeholder="12/25"
                      />
                    </label>

                    <label className="text-[11px] font-medium text-gray-600">
                      CVV
                      <input
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                        placeholder="123"
                      />
                    </label>

                    <label className="text-[11px] font-medium text-gray-600 sm:col-span-2">
                      Name on Card
                      <input
                        value={nameOnCard}
                        onChange={(e) => setNameOnCard(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                        placeholder="RAHUL SHARMA"
                      />
                    </label>
                  </div>

                  <label className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-[#f5f9ff] px-3 py-3">
                    {/* <input
                      type="checkbox"
                      checked={saveCardForRentals}
                      onChange={(e) => setSaveCardForRentals(e.target.checked)}
                      className="mt-1"
                    /> */}
                    <input
                      type="checkbox"
                      checked={saveCardForRentals}
                      onChange={(e) => setSaveCardForRentals(e.target.checked)}
                      className="mt-1 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:bg-[#F97316] checked:border-[#F97316] relative"
                      style={{
                        backgroundImage: saveCardForRentals
                          ? 'radial-gradient(white 40%, transparent 41%)'
                          : 'none',
                      }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-black">
                        Save this card securely for monthly rent payments
                      </p>
                      {/* <p className="mt-1 text-[10px] text-gray-500">
                        We can use this card for scheduled debits in future
                        rental renewals.
                      </p> */}
                      <p className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-gray-500" />
                        We can use this card for scheduled debits in future
                        rental renewals.
                      </p>
                    </div>
                  </label>
                </div>
              ) : null}
            </div>

            {/* <label
              className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
                method === 'netbanking'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-4">
                <input
                  type="radio"
                  name="paymode"
                  checked={method === 'netbanking'}
                  onChange={() => setMethod('netbanking')}
                  className="mt-1 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
                  style={{
                    backgroundImage:
                      method === 'netbanking'
                        ? 'radial-gradient(white 40%, transparent 41%)'
                        : 'none',
                  }}
                />
                <Landmark className="mt-0.5 h-4 w-4 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        Net Banking
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        All major banks supported
                      </p>
                    </div>
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </label> */}
            <label
              className={`block overflow-hidden rounded-2xl border cursor-pointer transition ${
                method === 'netbanking'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-4">
                <input
                  type="radio"
                  name="paymode"
                  checked={method === 'netbanking'}
                  onChange={() => setMethod('netbanking')}
                  className="mt-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:border-[#F97316] checked:bg-[#F97316] relative"
                  style={{
                    backgroundImage:
                      method === 'netbanking'
                        ? 'radial-gradient(white 40%, transparent 41%)'
                        : 'none',
                  }}
                />

                {/* Centered Landmark Icon */}
                <span className="w-8 h-8 flex items-center justify-center mt-0.5">
                  <Landmark className="w-4 h-4 text-gray-600" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        Net Banking
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        All major banks supported
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm border border-gray-200">
            <div>
              <p className="text-xs text-gray-500">
                Total payable
                {/* {items.some((i) => isMonthlyRentalItem(i)) ? (
                  <span className="ml-1 text-orange-500 font-medium">
                    (1st Month)
                  </span>
                ) : null} */}
                {isPayNextMonthMode ? (
                  <span className="ml-1 text-orange-500 font-medium">
                    (Month {payNextMonthLabel})
                  </span>
                ) : null}
                {isPayNextMonthMultiMode ? (
                  <span className="ml-1 text-orange-500 font-medium">
                    ({pendingMultiMonthPayments.length} rentals)
                  </span>
                ) : null}
              </p>
              {isPayNextMonthMode &&
              (payNextMonthGst > 0 || payNextMonthCareTax > 0) ? (
                <p className="text-xs text-gray-500 mt-0.5">
                  Includes ₹{payNextMonthGst.toLocaleString('en-IN')} GST + ₹
                  {payNextMonthCareTax.toLocaleString('en-IN')} Care Tax
                </p>
              ) : null}
              {isPayNextMonthMode && payNextMonthLateFee > 0 ? (
                <p className="text-xs text-red-500 mt-0.5">
                  Includes ₹{payNextMonthLateFee.toLocaleString('en-IN')} late
                  fee
                </p>
              ) : null}
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ₹{total.toLocaleString('en-IN')}
              </p>
            </div>
            {/* <button
              type="button"
              onClick={handlePay}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
         
              {loading ? 'Processing payment…' : 'Pay Now'}
            </button> */}
            <button
              type="button"
              onClick={handlePay}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {/* <CheckCircle2 className="h-4 w-4" /> */}
              {loading
                ? 'Processing…'
                : method === 'pay_after_service'
                  ? 'Continue'
                  : 'Pay Now'}
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
      {/* {showReceiptModal && serviceReceiptData && (
        <ServiceReceiptModal
          data={serviceReceiptData}
          onClose={() => {
            setShowReceiptModal(false);
            router.push('/');
          }}
        />
      )} */}
      {showReceiptModal && serviceReceiptData && (
        <ServiceReceiptModal
          data={serviceReceiptData}
          onClose={() => {
            setShowReceiptModal(false);
            router.push(receiptRedirectUrl);
          }}
        />
      )}
    </div>
  );
}
