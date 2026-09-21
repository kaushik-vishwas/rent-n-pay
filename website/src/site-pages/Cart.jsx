// 'use client';

// import Link from 'next/link';
// import { useEffect, useMemo, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useRouter } from 'next/navigation';
// // import {
// //   removeFromCart,
// //   updateQuantity,
// //   updateTenure,
// //   syncCart,
// //   clearAppliedCoupon,
// //   setAppliedCoupon,
// // } from '../store/slices/cartSlice';
// import {
//   removeFromCart,
//   updateQuantity,
//   updateTenure,
//   updateRentalDates,
//   syncCart,
//   clearAppliedCoupon,
//   setAppliedCoupon,
// } from '../store/slices/cartSlice';
// import {
//   apiGetActiveCoupons,
//   apiGetProductById,
//   apiValidateCoupon,
//   apiGetGlobalTax,
// } from '@/lib/api';
// import { useToast } from '@/contexts/ToastContext';
// import { api } from '@/lib/axios';
// // import {
// //   Shield,
// //   Trash2,
// //   Plus,
// //   Minus,
// //   ShoppingCart,
// //   BadgePercent,
// //   AlertCircle,
// //   Lock,
// //   ChevronRight,
// //   Calendar,
// // } from 'lucide-react';
// import {
//   Shield,
//   Trash2,
//   Plus,
//   Minus,
//   ShoppingCart,
//   BadgePercent,
//   AlertCircle,
//   Lock,
//   ChevronRight,
//   ChevronLeft,
//   Calendar,
//   ShieldCheck,
// } from 'lucide-react';
// import offerCartIcon from '@/assets/icons/offer-cart.png';
// import BookingModal from '@/components/ServicePage/ServiceBookinModal';
// import { apiGetServiceById } from '@/lib/api';

// // function getDeliveryTimelineLabel(product) {
// //   const lv = product?.logisticsVerification || {};
// //   const n = Number(lv.deliveryTimelineValue);
// //   const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
// //   if (!Number.isFinite(n) || n <= 0) return '';
// //   if (unit === 'hours') {
// //     return `Delivery in ${n} hour${n === 1 ? '' : 's'}`;
// //   }
// //   return `Delivery in ${n} day${n === 1 ? '' : 's'}`;
// // }
// function getDeliveryTimelineLabel(product) {
//   const lv = product?.logisticsVerification || {};
//   const n = Number(lv.deliveryTimelineValue);
//   const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
//   if (!Number.isFinite(n) || n <= 0) return '';
//   if (unit === 'hours') {
//     return `Delivery in ${n} hour${n === 1 ? '' : 's'}`;
//   }
//   return `Delivery in ${n} day${n === 1 ? '' : 's'}`;
// }

// // ── Daily-rental date helpers (used only by the Change Date modal) ────────
// const isDailyRentalItem = (item) =>
//   String(item?.productType || 'Rental') === 'Rental' &&
//   String(item?.tenureUnit || 'month') === 'day';

// function parseLocalIso(iso) {
//   if (!iso || typeof iso !== 'string') return null;
//   const [y, mo, da] = iso.split('-').map((x) => parseInt(x, 10));
//   if (!y || !mo || !da) return null;
//   return new Date(y, mo - 1, da);
// }
// function startOfLocalDay(d) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }
// function addLocalDays(d, n) {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// }
// function toLocalIso(d) {
//   const x = startOfLocalDay(d);
//   const y = x.getFullYear();
//   const m = String(x.getMonth() + 1).padStart(2, '0');
//   const day = String(x.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }
// function formatRangeLine(iso) {
//   const d = parseLocalIso(iso);
//   if (!d) return '';
//   return d.toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: '2-digit',
//   });
// }
// function buildMonthGrid(year, monthIndex) {
//   const first = new Date(year, monthIndex, 1);
//   const last = new Date(year, monthIndex + 1, 0);
//   const daysInMonth = last.getDate();
//   const startWeekday = first.getDay();
//   const cells = [];
//   for (let i = 0; i < startWeekday; i++) cells.push(null);
//   for (let day = 1; day <= daysInMonth; day++) {
//     cells.push(new Date(year, monthIndex, day));
//   }
//   return cells;
// }
// function isDateInRangeInclusive(day, startIso, endIso) {
//   if (!startIso || !endIso) return false;
//   const t = startOfLocalDay(day).getTime();
//   const a = startOfLocalDay(parseLocalIso(startIso)).getTime();
//   const b = startOfLocalDay(parseLocalIso(endIso)).getTime();
//   return t >= a && t <= b;
// }
// const CART_CAL_ORANGE = '#FF7000';

// /** Right-side modal to change delivery/pickup dates for a daily-rental cart item. */
// const ChangeDailyDateModal = ({ item, onClose, onSave }) => {
//   const [startDate, setStartDate] = useState(item.startDate || '');
//   const [endDate, setEndDate] = useState(item.endDate || '');
//   const [selectingDate, setSelectingDate] = useState('start');
//   const [calendarMonth, setCalendarMonth] = useState(() => {
//     const base = item.startDate ? parseLocalIso(item.startDate) : new Date();
//     return new Date(base.getFullYear(), base.getMonth(), 1);
//   });

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, []);

//   const calendarCells = useMemo(
//     () => buildMonthGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
//     [calendarMonth],
//   );

//   const handleDayClick = (day) => {
//     const start = startOfLocalDay(day);
//     const today = startOfLocalDay(new Date());
//     if (start.getTime() < today.getTime()) return;

//     if (selectingDate === 'start') {
//       setStartDate(toLocalIso(start));
//       setEndDate((prevEnd) => {
//         if (!prevEnd) return prevEnd;
//         const e = parseLocalIso(prevEnd);
//         if (e && startOfLocalDay(e).getTime() < start.getTime()) return '';
//         return prevEnd;
//       });
//       setSelectingDate('end');
//       return;
//     }
//     const s = startDate ? parseLocalIso(startDate) : null;
//     if (s && start.getTime() < startOfLocalDay(s).getTime()) {
//       setStartDate(toLocalIso(start));
//       setEndDate('');
//       setSelectingDate('end');
//       return;
//     }
//     if (s) {
//       const minPickup = startOfLocalDay(addLocalDays(s, 2));
//       if (start.getTime() < minPickup.getTime()) {
//         return;
//       }
//     }
//     setEndDate(toLocalIso(start));
//   };

//   const chargeableStartDate = useMemo(() => {
//     if (!startDate) return '';
//     return toLocalIso(addLocalDays(parseLocalIso(startDate), 1));
//   }, [startDate]);

//   const chargeableEndDate = useMemo(() => {
//     if (!endDate) return '';
//     return toLocalIso(addLocalDays(parseLocalIso(endDate), -1));
//   }, [endDate]);

//   const selectedDays = useMemo(() => {
//     if (!startDate || !endDate) return 0;
//     const s = parseLocalIso(startDate);
//     const e = parseLocalIso(endDate);
//     if (!s || !e) return 0;
//     const diff =
//       Math.round(
//         (startOfLocalDay(e).getTime() - startOfLocalDay(s).getTime()) /
//           (1000 * 60 * 60 * 24),
//       ) + 1;
//     const fullDays = diff > 0 ? diff : 0;
//     const chargeable = fullDays - 2;
//     return chargeable > 0 ? chargeable : 0;
//   }, [startDate, endDate]);

//   const rate = Number(item.dailyRate || 0);
//   const total = rate * selectedDays;
//   const canSave = startDate && endDate && selectedDays > 0;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <div className="relative w-full max-w-md bg-white max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white z-10">
//           <h2 className="text-lg font-bold text-gray-900">Change Dates</h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-bold"
//           >
//             ✕
//           </button>
//         </div>
//         <div
//           className="flex-1 px-5 py-4 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
//           style={{ scrollbarWidth: 'none' }}
//         >
//           <div className="grid grid-cols-2 gap-2">
//             <button
//               type="button"
//               onClick={() => setSelectingDate('start')}
//               className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
//                 selectingDate === 'start'
//                   ? 'border-orange-500 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <p className="text-[10px] font-medium text-gray-500">
//                 Delivery Date
//               </p>
//               <p className="text-sm font-semibold text-gray-900">
//                 {startDate ? formatRangeLine(startDate) : 'Select'}
//               </p>
//             </button>
//             <button
//               type="button"
//               onClick={() => startDate && setSelectingDate('end')}
//               className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
//                 selectingDate === 'end'
//                   ? 'border-orange-500 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <p className="text-[10px] font-medium text-gray-500">
//                 Pickup Date
//               </p>
//               <p className="text-sm font-semibold text-gray-900">
//                 {endDate ? formatRangeLine(endDate) : 'Select'}
//               </p>
//             </button>
//           </div>

//           <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
//             <div
//               className="flex items-center justify-between px-3 py-2.5 text-white"
//               style={{ backgroundColor: CART_CAL_ORANGE }}
//             >
//               <button
//                 type="button"
//                 onClick={() =>
//                   setCalendarMonth(
//                     (p) => new Date(p.getFullYear(), p.getMonth() - 1, 1),
//                   )
//                 }
//                 className="p-1 rounded-lg hover:bg-white/20"
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <span className="text-sm font-semibold">
//                 {calendarMonth.toLocaleDateString('en-IN', {
//                   month: 'long',
//                   year: 'numeric',
//                 })}
//               </span>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setCalendarMonth(
//                     (p) => new Date(p.getFullYear(), p.getMonth() + 1, 1),
//                   )
//                 }
//                 className="p-1 rounded-lg hover:bg-white/20"
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="px-2 sm:px-3 pt-3 pb-2">
//               <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium text-gray-500 mb-1">
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
//                   <div key={w} className="py-1">
//                     {w}
//                   </div>
//                 ))}
//               </div>
//               <div className="grid grid-cols-7 gap-y-1 text-center">
//                 {calendarCells.map((day, idx) => {
//                   if (!day)
//                     return <div key={`e-${idx}`} className="h-9" aria-hidden />;
//                   const iso = toLocalIso(day);
//                   const today = startOfLocalDay(new Date());
//                   let disabled =
//                     startOfLocalDay(day).getTime() < today.getTime();
//                   if (!disabled && selectingDate === 'end' && startDate) {
//                     const minPickupTime = startOfLocalDay(
//                       addLocalDays(parseLocalIso(startDate), 2),
//                     ).getTime();
//                     if (startOfLocalDay(day).getTime() < minPickupTime) {
//                       disabled = true;
//                     }
//                   }
//                   const inRange = isDateInRangeInclusive(
//                     day,
//                     startDate,
//                     endDate,
//                   );
//                   return (
//                     <div
//                       key={iso}
//                       className="flex items-center justify-center p-0.5"
//                     >
//                       <button
//                         type="button"
//                         disabled={disabled}
//                         onClick={() => handleDayClick(day)}
//                         className={[
//                           'w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center',
//                           disabled
//                             ? 'text-gray-300 cursor-not-allowed bg-gray-50'
//                             : inRange
//                               ? 'text-white'
//                               : 'bg-gray-100 text-gray-800 hover:bg-orange-100',
//                         ].join(' ')}
//                         style={
//                           inRange && !disabled
//                             ? {
//                                 backgroundColor: CART_CAL_ORANGE,
//                                 opacity:
//                                   iso !== startDate && iso !== endDate
//                                     ? 0.45
//                                     : 1,
//                               }
//                             : undefined
//                         }
//                       >
//                         {day.getDate()}
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {startDate && endDate ? (
//             <div className="mt-1 rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-center gap-4 text-center">
//               <div className="shrink-0 leading-none">
//                 <span className="text-3xl font-bold text-gray-900">
//                   {String(selectedDays).padStart(2, '0')}
//                 </span>
//                 <span className="ml-1 text-xs text-gray-500 align-super">
//                   Day{selectedDays !== 1 ? 's' : ''}
//                 </span>
//               </div>
//               <div className="min-w-0 text-left">
//                 <p className="text-xs text-gray-800 font-medium">
//                   Chargeable Period:
//                 </p>
//                 {selectedDays > 0 ? (
//                   <p className="text-xs font-semibold text-gray-900 mt-0.5">
//                     {formatRangeLine(chargeableStartDate)} -{' '}
//                     {formatRangeLine(chargeableEndDate)}
//                   </p>
//                 ) : (
//                   <p className="text-[11px] text-red-600 mt-0.5">
//                     Pickup must be 2+ days after delivery.
//                   </p>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <p className="text-xs text-gray-400">
//               Select a delivery date, then a pickup date.
//             </p>
//           )}
//         </div>
//         <div className="px-5 pb-5 bg-white">
//           <button
//             type="button"
//             disabled={!canSave}
//             onClick={() =>
//               onSave({ startDate, endDate, days: selectedDays, total })
//             }
//             className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600"
//           >
//             Save Dates
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// const formatINR = (n) => Number(n || 0).toLocaleString('en-IN');

// const TAX_FIELDS = [
//   { key: 'gst', defaultKey: 'defaultGst', rateKey: 'gst', label: 'GST' },
//   {
//     key: 'careTax',
//     defaultKey: 'defaultCareTax',
//     rateKey: 'careTax',
//     label: 'Care Tax',
//   },
//   {
//     key: 'repairWarranty',
//     defaultKey: 'defaultRepairWarranty',
//     rateKey: 'repairWarranty',
//     label: 'Repair & Warranty',
//   },
//   {
//     key: 'relocationWarranty',
//     defaultKey: 'defaultRelocationWarranty',
//     rateKey: 'relocationWarranty',
//     label: 'Relocation Warranty',
//   },
//   {
//     key: 'deliveryPackaging',
//     defaultKey: 'defaultDeliveryPackaging',
//     rateKey: 'deliveryPackaging',
//     label: 'Delivery & Packaging',
//   },
//   {
//     key: 'installationFee',
//     defaultKey: 'defaultInstallationFee',
//     rateKey: 'installationFee',
//     label: 'Installation Fee',
//   },
//   {
//     key: 'platformFee',
//     defaultKey: 'defaultPlatformFee',
//     rateKey: 'platformFee',
//     label: 'Platform Fee',
//   },
// ];

// const getItemTaxRate = (item, field, globalTax, isRentalFn) => {
//   if (item.taxBlocked) return 0;
//   if (item[field.defaultKey] != null)
//     return Number(item[field.defaultKey]) / 100;
//   if (isRentalFn(item)) return (globalTax?.rental?.[field.rateKey] ?? 0) / 100;
//   //   const condition = String(item.condition || '').toLowerCase();
//   //   return condition === 'refurbished'
//   //     ? (globalTax?.buying_refurbished?.[field.rateKey] ?? 0) / 100
//   //     : (globalTax?.buying_new?.[field.rateKey] ?? 0) / 100;
//   // };
//   const condition = String(item.condition || '').toLowerCase();
//   if (condition === 'refurbished') {
//     return (globalTax?.buying_refurbished?.[field.rateKey] ?? 0) / 100;
//   }
//   if (condition === 'mint condition' || condition === 'mint') {
//     return (globalTax?.buying_mint?.[field.rateKey] ?? 0) / 100;
//   }
//   return (globalTax?.buying_new?.[field.rateKey] ?? 0) / 100;
// };

// const computeGroupBreakdown = (
//   group,
//   globalTax,
//   isCareProtectionEnabled,
//   isRentalFn,
// ) => {
//   let itemsTotal = 0;
//   let refundableDeposit = 0;
//   const fees = {
//     gst: 0,
//     careTax: 0,
//     repairWarranty: 0,
//     relocationWarranty: 0,
//     deliveryPackaging: 0,
//     installationFee: 0,
//     platformFee: 0,
//   };
//   group.forEach((item) => {
//     const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//     const price = Number(item.pricePerDay || 0);
//     const itemTotal = price * qty;
//     itemsTotal += itemTotal;
//     if (isRentalFn(item)) {
//       refundableDeposit += Number(item.refundableDeposit || 0) * qty;
//     }
//     TAX_FIELDS.forEach((field) => {
//       if (field.key === 'careTax' && !isCareProtectionEnabled) return;
//       const rate = getItemTaxRate(item, field, globalTax, isRentalFn);
//       fees[field.key] += Math.round(itemTotal * rate);
//     });
//   });
//   return { itemsTotal, refundableDeposit, fees };
// };
// const computeServiceBreakdown = (
//   booking,
//   globalTax,
//   isCareProtectionEnabled,
// ) => {
//   const tax = booking?.subCategoryTax || {};
//   const isBlocked = booking?.taxBlocked === true || tax?.taxBlocked === true;
//   const base = Number(booking?.totalAmount || 0);
//   const calc = (subKey, globalKey) => {
//     if (isBlocked) return 0;
//     const rate =
//       tax[subKey] != null
//         ? Number(tax[subKey])
//         : (globalTax?.services?.[globalKey] ?? 0);
//     return Math.round((base * rate) / 100);
//   };
//   return {
//     itemsTotal: base,
//     fees: {
//       gst: calc('defaultGst', 'gst'),
//       careTax: isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0,
//       repairWarranty: calc('defaultRepairWarranty', 'repairWarranty'),
//       relocationWarranty: calc(
//         'defaultRelocationWarranty',
//         'relocationWarranty',
//       ),
//       deliveryPackaging: calc('defaultDeliveryPackaging', 'deliveryPackaging'),
//       installationFee: calc('defaultInstallationFee', 'installationFee'),
//       platformFee: calc('defaultPlatformFee', 'platformFee'),
//     },
//   };
// };

// const CartTenureButton = ({ item, onTenureChange, offer }) => {
//   const discountPercent = Number(offer?.discountPercent || 0);
//   const hasOffer = discountPercent > 0;
//   const [open, setOpen] = useState(false);
//   const [customMonths, setCustomMonths] = useState('');

//   useEffect(() => {
//     if (open) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [open]);
//   const configs = Array.isArray(item.rentalConfigurations)
//     ? item.rentalConfigurations.filter(
//         (cfg) => Number(cfg.customerRent || cfg.pricePerDay || 0) > 0,
//       )
//     : [];

//   // Custom tenure: only for monthly configs, capped at vendor's max fixed tenure.
//   // const monthlyConfigs = configs
//   //   .filter(
//   //     (cfg) =>
//   //       !(
//   //         cfg?.periodUnit === 'day' ||
//   //         (Number(cfg?.days) > 0 && !Number(cfg?.months))
//   //       ),
//   //   )
//   //   .map((cfg) => ({
//   //     months: Number(cfg.months) || 1,
//   //     total: Number(cfg.customerRent || cfg.pricePerDay || 0),
//   //     perMonth: Math.round(
//   //       Number(cfg.customerRent || cfg.pricePerDay || 0) /
//   //         (Number(cfg.months) || 1),
//   //     ),
//   //   }))
//   //   .sort((a, b) => a.months - b.months);
//   const monthlyConfigs = configs
//     .filter(
//       (cfg) =>
//         !(
//           cfg?.periodUnit === 'day' ||
//           (Number(cfg?.days) > 0 && !Number(cfg?.months))
//         ),
//     )
//     .map((cfg) => {
//       const months = Number(cfg.months) || 1;
//       const rate = Number(cfg.customerRent || cfg.pricePerDay || 0); // per-month rate, not total
//       return {
//         months,
//         total: rate * months,
//         perMonth: rate,
//       };
//     })
//     .sort((a, b) => a.months - b.months);

//   // const maxCustomMonths = monthlyConfigs.length
//   //   ? monthlyConfigs[monthlyConfigs.length - 1].months
//   //   : 0;

//   // const customPlan = useMemo(() => {
//   //   const m = parseInt(customMonths, 10);
//   //   if (!m || m <= 0) return null;
//   //   if (maxCustomMonths && m > maxCustomMonths) return null;
//   //   if (monthlyConfigs.length < 2) return null;
//   const maxCustomMonths = monthlyConfigs.length
//     ? monthlyConfigs[monthlyConfigs.length - 1].months
//     : 0;

//   const minCustomMonths = monthlyConfigs.length ? monthlyConfigs[0].months : 0;

//   const customPlan = useMemo(() => {
//     const m = parseInt(customMonths, 10);
//     if (!m || m <= 0) return null;
//     if (minCustomMonths && m < minCustomMonths) return null;
//     if (maxCustomMonths && m > maxCustomMonths) return null;
//     if (monthlyConfigs.length < 2) return null;

//     let lower = monthlyConfigs[0];
//     let upper = monthlyConfigs[monthlyConfigs.length - 1];
//     for (let i = 0; i < monthlyConfigs.length - 1; i++) {
//       if (m >= monthlyConfigs[i].months && m <= monthlyConfigs[i + 1].months) {
//         lower = monthlyConfigs[i];
//         upper = monthlyConfigs[i + 1];
//         break;
//       }
//     }
//     if (m < monthlyConfigs[0].months) {
//       lower = monthlyConfigs[0];
//       upper = monthlyConfigs[1];
//     }
//     if (m > monthlyConfigs[monthlyConfigs.length - 1].months) {
//       lower = monthlyConfigs[monthlyConfigs.length - 2];
//       upper = monthlyConfigs[monthlyConfigs.length - 1];
//     }
//     const slope =
//       (upper.perMonth - lower.perMonth) / (upper.months - lower.months || 1);
//     const perMonth = Math.max(
//       1,
//       Math.round(lower.perMonth + slope * (m - lower.months)),
//     );
//     return { months: m, perMonth, total: perMonth * m };
//   }, [customMonths, monthlyConfigs, maxCustomMonths]);

//   const getTenureLabel = (cfg) => {
//     const isDayUnit =
//       cfg?.periodUnit === 'day' ||
//       (Number(cfg?.days) > 0 && !Number(cfg?.months));
//     if (isDayUnit) {
//       const days = Number(cfg.days) || 1;
//       return `${days} Day${days !== 1 ? 's' : ''}`;
//     }
//     const months = Number(cfg.months) || 1;
//     return `${months} Month${months !== 1 ? 's' : ''}`;
//   };

//   const getPriceSuffix = (cfg) => {
//     const isDayUnit =
//       cfg?.periodUnit === 'day' ||
//       (Number(cfg?.days) > 0 && !Number(cfg?.months));
//     return isDayUnit ? '/day' : '/mo';
//   };

//   const currentLabel = (() => {
//     const isDayItem = String(item.tenureUnit || 'month') === 'day';
//     const n = Number(item.rentalMonths || 1);
//     return isDayItem
//       ? `${n} Day${n !== 1 ? 's' : ''}`
//       : `${n} Month${n !== 1 ? 's' : ''}`;
//   })();

//   // Baseline for "Save ₹X" = the original (undiscounted) per-unit rate of
//   // the shortest tenure (configs[0]) — same logic as the product detail page.
//   const baselineConfig = configs[0];
//   const baselineIsDayUnit =
//     baselineConfig?.periodUnit === 'day' ||
//     (Number(baselineConfig?.days) > 0 && !Number(baselineConfig?.months));
//   // const baselineRawTotal = Number(
//   //   baselineConfig?.customerRent || baselineConfig?.pricePerDay || 0,
//   // );
//   // const baselineUnits = baselineIsDayUnit
//   //   ? Number(baselineConfig?.days) || 1
//   //   : Number(baselineConfig?.months) || 1;
//   // const maxPerUnit = baselineConfig
//   //   ? Math.round(baselineRawTotal / baselineUnits)
//   //   : 0;
//   // customerRent / pricePerDay is already the per-unit rate.
//   const maxPerUnit = baselineConfig
//     ? Number(baselineConfig?.customerRent || baselineConfig?.pricePerDay || 0)
//     : 0;

//   // if (configs.length <= 1) {
//   //   return (
//   //     <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
//   //       {currentLabel}
//   //     </div>
//   //   );
//   // }

//   const isDayItemFallback = String(item.tenureUnit || 'month') === 'day';

//   if (configs.length <= 1) {
//     return (
//       //     <div
//       //       className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 border-2 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 ${
//       //         isDayItemFallback ? 'sm:!border-orange-400 sm:!text-orange-600' : ''
//       //       }`}
//       //     >
//       //       {currentLabel}
//       //     </div>
//       //   );
//       // }
//       <div
//         className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 border-2 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 sm:h-7 sm:flex sm:items-center sm:justify-center ${
//           isDayItemFallback ? 'sm:!border-orange-400 sm:!text-orange-600' : ''
//         }`}
//       >
//         {currentLabel}
//       </div>
//     );
//   }

//   return (
//     <>
//       <button
//         type="button"
//         //   onClick={() => setOpen(true)}
//         //   className="flex items-center gap-0.5 sm:gap-2 px-1.5 py-0.5 sm:px-3 sm:py-1.5 border-2 border-orange-400 text-orange-600 bg-white rounded-md sm:rounded-lg text-[10px] sm:text-sm font-semibold hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap"
//         // >
//         //   <span>{currentLabel}</span>
//         //   <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
//         // </button>
//         onClick={() => setOpen(true)}
//         className="flex items-center   px-1.5 py-0.5 sm:px-2.5 sm:py-1 border-2 border-orange-400 text-orange-600 bg-white rounded-md sm:rounded-lg text-[10px] sm:text-sm font-semibold hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap sm:h-7"
//       >
//         <span>{currentLabel}</span>
//         <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
//       </button>

//       {open && (
//         <div className="fixed inset-0 z-50 flex">
//           {/* Backdrop — no click close */}
//           <div className="flex-1 bg-black/40 overflow-y-auto" />
//           {/* Modal Panel */}
//           <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
//             {/* Header */}
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
//               <h2 className="text-lg font-bold text-gray-900">Select Tenure</h2>
//               <button
//                 type="button"
//                 onClick={() => setOpen(false)}
//                 className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-xl font-bold"
//               >
//                 ✕
//               </button>
//             </div>
//             {/* Options */}
//             <div className="flex-1 px-5 py-4 space-y-3">
//               {configs.map((cfg, index) => {
//                 const isDayUnit =
//                   cfg?.periodUnit === 'day' ||
//                   (Number(cfg?.days) > 0 && !Number(cfg?.months));
//                 const units = isDayUnit
//                   ? Number(cfg.days) || 1
//                   : Number(cfg.months) || 1;

//                 // const rawTotalPrice = Number(
//                 //   cfg.customerRent || cfg.pricePerDay || 0,
//                 // );
//                 // const originalPerUnit = Math.round(rawTotalPrice / units);
//                 // const perUnit = hasOffer
//                 //   ? Math.max(
//                 //       0,
//                 //       Math.round(
//                 //         originalPerUnit -
//                 //           (originalPerUnit * discountPercent) / 100,
//                 //       ),
//                 //     )
//                 //   : originalPerUnit;
//                 // // Total is derived FROM the per-unit price (not the other way
//                 // // around) so the amount applied to the cart always matches
//                 // // exactly what was shown in this modal (perUnit × units).
//                 // const discountedTotalPrice = perUnit * units;

//                 // customerRent / pricePerDay is the PER-UNIT rate (per month
//                 // or per day), not the total tenure price.
//                 const originalPerUnit = Number(
//                   cfg.customerRent || cfg.pricePerDay || 0,
//                 );
//                 const perUnit = hasOffer
//                   ? Math.max(
//                       0,
//                       Math.round(
//                         originalPerUnit -
//                           (originalPerUnit * discountPercent) / 100,
//                       ),
//                     )
//                   : originalPerUnit;
//                 // Total is derived FROM the per-unit price (not the other way
//                 // around) so the amount applied to the cart always matches
//                 // exactly what was shown in this modal (perUnit × units).
//                 const discountedTotalPrice = perUnit * units;
//                 const saving = maxPerUnit - perUnit;
//                 const isBestValue = index === configs.length - 1;
//                 const label = getTenureLabel(cfg);
//                 const suffix = getPriceSuffix(cfg);

//                 const isSelected = (() => {
//                   const isDayItem =
//                     String(item.tenureUnit || 'month') === 'day';
//                   const n = Number(item.rentalMonths || 1);
//                   if (isDayUnit && isDayItem) return units === n;
//                   if (!isDayUnit && !isDayItem) return units === n;
//                   return false;
//                 })();

//                 return (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => {
//                       onTenureChange(cfg, perUnit, discountedTotalPrice);
//                       setOpen(false);
//                     }}
//                     className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all text-left ${
//                       isSelected
//                         ? 'border-green-500 bg-green-50'
//                         : 'border-gray-200 bg-white hover:border-orange-300'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
//                           isSelected ? 'border-green-500' : 'border-gray-300'
//                         }`}
//                       >
//                         {isSelected && (
//                           <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
//                         )}
//                       </div>
//                       <div>
//                         <p className="font-semibold text-gray-900 text-sm">
//                           {label}
//                         </p>
//                         <div className="flex gap-1 mt-0.5 flex-wrap">
//                           {saving > 0 && (
//                             <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
//                               Save ₹{saving}
//                               {suffix}
//                             </span>
//                           )}
//                           {isBestValue && (
//                             <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
//                               Best Value
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-right shrink-0">
//                       <p className="font-bold text-gray-900">
//                         ₹{formatINR(perUnit)}
//                         <span className="text-xs font-normal text-gray-500">
//                           {suffix}
//                         </span>
//                       </p>
//                       {hasOffer && originalPerUnit !== perUnit && (
//                         <p className="text-xs text-gray-400 line-through">
//                           ₹{formatINR(originalPerUnit)}
//                           {suffix}
//                         </p>
//                       )}
//                     </div>
//                   </button>
//                 );
//               })}

//               {monthlyConfigs.length > 1 && (
//                 <div className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 border-gray-200 bg-white">
//                   <div className="flex items-center gap-2">
//                     <p className="font-semibold text-gray-900 text-sm">
//                       Custom
//                     </p>
//                     {/* <input
//                       type="number"
//                       min="1"
//                       max={maxCustomMonths || undefined}
//                       placeholder="e.g. 2"
//                       value={customMonths}
//                       onChange={(e) => setCustomMonths(e.target.value)}
//                       className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
//                     />
//                     <span className="text-xs text-gray-500">
//                       months {maxCustomMonths ? `(max ${maxCustomMonths})` : ''}
//                     </span> */}
//                     <input
//                       type="number"
//                       min={minCustomMonths || 1}
//                       max={maxCustomMonths || undefined}
//                       placeholder={`e.g. ${minCustomMonths || 2}`}
//                       value={customMonths}
//                       onChange={(e) => setCustomMonths(e.target.value)}
//                       className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
//                     />
//                     {/* <span className="text-xs text-gray-500">
//                       months{' '}
//                       {minCustomMonths && maxCustomMonths
//                         ? `(${minCustomMonths}-${maxCustomMonths})`
//                         : ''}
//                     </span> */}
//                   </div>
//                   {/* <div className="text-right shrink-0 flex items-center gap-2">
//                     {customPlan ? (
//                       <>
//                         <p className="font-bold text-gray-900">
//                           ₹{formatINR(customPlan.perMonth)}
//                           <span className="text-xs font-normal text-gray-500">
//                             /mo
//                           </span>
//                         </p>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             const discountedTotal = hasOffer
//                               ? Math.max(
//                                   0,
//                                   Math.round(
//                                     customPlan.total -
//                                       (customPlan.total * discountPercent) /
//                                         100,
//                                   ),
//                                 )
//                               : customPlan.total;
//                             onTenureChange(
//                               {
//                                 periodUnit: 'month',
//                                 months: customPlan.months,
//                               },
//                               customPlan.perMonth,
//                               discountedTotal,
//                             );
//                             setOpen(false);
//                           }}
//                           className="text-xs font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600"
//                         >
//                           Apply
//                         </button>
//                       </> */}
//                   <div className="text-right shrink-0 flex items-center gap-2">
//                     {customPlan ? (
//                       <>
//                         <div>
//                           <p className="font-bold text-gray-900">
//                             ₹
//                             {formatINR(
//                               hasOffer
//                                 ? Math.max(
//                                     0,
//                                     Math.round(
//                                       customPlan.perMonth -
//                                         (customPlan.perMonth *
//                                           discountPercent) /
//                                           100,
//                                     ),
//                                   )
//                                 : customPlan.perMonth,
//                             )}
//                             <span className="text-xs font-normal text-gray-500">
//                               /mo
//                             </span>
//                           </p>
//                           {hasOffer && (
//                             <p className="text-xs text-gray-400 line-through">
//                               ₹{formatINR(customPlan.perMonth)}/mo
//                             </p>
//                           )}
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             const discountedTotal = hasOffer
//                               ? Math.max(
//                                   0,
//                                   Math.round(
//                                     customPlan.total -
//                                       (customPlan.total * discountPercent) /
//                                         100,
//                                   ),
//                                 )
//                               : customPlan.total;
//                             onTenureChange(
//                               {
//                                 periodUnit: 'month',
//                                 months: customPlan.months,
//                               },
//                               customPlan.perMonth,
//                               discountedTotal,
//                             );
//                             setOpen(false);
//                           }}
//                           className="text-xs font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600"
//                         >
//                           Apply
//                         </button>
//                       </>
//                     ) : // ) : customMonths ? (
//                     //   <p className="text-[10px] text-red-500">
//                     //     {maxCustomMonths
//                     //       ? `Max ${maxCustomMonths} months`
//                     //       : 'Invalid'}
//                     //   </p>
//                     // ) : (
//                     //   <p className="text-xs text-gray-400">Enter months</p>
//                     // )}
//                     customMonths && minCustomMonths && maxCustomMonths ? (
//                       <p className="text-[10px] text-red-500">
//                         Enter a value between {minCustomMonths} and{' '}
//                         {maxCustomMonths} months
//                       </p>
//                     ) : (
//                       <p className="text-xs text-gray-400">
//                         Enter{' '}
//                         {minCustomMonths && maxCustomMonths
//                           ? `${minCustomMonths}-${maxCustomMonths}`
//                           : ''}{' '}
//                         months
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// const Cart = () => {
//   const { items } = useSelector((s) => s.cart);
//   // const { items } = useSelector((s) => s.cart || { items: [] });
//   const { user, isAuthenticated } = useSelector((s) => s.auth);
//   const dispatch = useDispatch();
//   const [isHydrated, setIsHydrated] = useState(false);
//   const router = useRouter();

//   const { pushToast } = useToast();
//   const isRentalItem = (item) =>
//     String(item?.productType || 'Rental') === 'Rental';

//   const stockMapKey = useMemo(
//     () =>
//       items
//         .map((i) => i.productId)
//         .sort()
//         .join('_'),
//     [items],
//   );
//   const [activeCoupons, setActiveCoupons] = useState([]);
//   const [couponCode, setCouponCode] = useState('');
//   // { code, discountAmount, discountType, discountValue, finalAmount }
//   const [couponError, setCouponError] = useState('');
//   const [couponLoading, setCouponLoading] = useState(false);
//   const [stockByProductId, setStockByProductId] = useState({});
//   const [deliveryByProductId, setDeliveryByProductId] = useState({});
//   // const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(() => {
//   //   if (typeof window === 'undefined') return true;
//   //   const saved = localStorage.getItem('rentpay_care_protection_enabled');
//   //   return saved === null ? true : saved === 'true';
//   // });
//   const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(true);
//   const [globalTax, setGlobalTax] = useState(null);
//   const [isSummaryOpen, setIsSummaryOpen] = useState(false);
//   const [pendingServiceBookings, setPendingServiceBookings] = useState([]);
//   const [serviceOffer, setServiceOffer] = useState(null);
//   const [changeSlotOpen, setChangeSlotOpen] = useState(false);
//   const [changeSlotProduct, setChangeSlotProduct] = useState(null);
//   const [changeSlotLoading, setChangeSlotLoading] = useState(false);
//   const [changeSlotBookingProductId, setChangeSlotBookingProductId] =
//     useState(null);
//   const [dateModalItem, setDateModalItem] = useState(null);

//   const appliedCoupon = useSelector((s) => s.cart.appliedCoupon);
//   //  const appliedCoupon = useSelector((s) => s.cart?.appliedCoupon);

//   const sellItems = useMemo(
//     () => items.filter((i) => !isRentalItem(i)),
//     [items],
//   );
//   const dailyRentalItems = useMemo(
//     () =>
//       items.filter(
//         (i) => isRentalItem(i) && String(i.tenureUnit || 'month') === 'day',
//       ),
//     [items],
//   );
//   const monthlyRentalItems = useMemo(
//     () =>
//       items.filter(
//         (i) => isRentalItem(i) && String(i.tenureUnit || 'month') !== 'day',
//       ),
//     [items],
//   );

//   // const [openSection, setOpenSection] = useState({
//   //   buying: false,
//   //   dailyRental: false,
//   //   monthlyRental: false,
//   //   deposit: false,
//   // });
//   const [openSection, setOpenSection] = useState({
//     buying: false,
//     dailyRental: false,
//     monthlyRental: false,
//     rental: false,
//     service: false,
//     deposit: false,
//   });

//   // const serviceDiscountPercent = Number(serviceOffer?.discountPercent || 0);
//   // const hasServiceOffer = !!serviceOffer && serviceDiscountPercent > 0;

//   // const discountedServiceBooking = useMemo(() => {
//   //   if (!pendingServiceBooking) return null;
//   //   if (!hasServiceOffer) return pendingServiceBooking;
//   //   const baseAmount = Number(pendingServiceBooking.totalAmount || 0);
//   //   const discountedAmount = Math.max(
//   //     0,
//   //     Math.round(baseAmount - (baseAmount * serviceDiscountPercent) / 100),
//   //   );
//   //   return { ...pendingServiceBooking, totalAmount: discountedAmount };
//   // }, [pendingServiceBooking, hasServiceOffer, serviceDiscountPercent]);

//   // const serviceBreakdown = useMemo(
//   //   () =>
//   //     discountedServiceBooking
//   //       ? computeServiceBreakdown(
//   //           discountedServiceBooking,
//   //           globalTax,
//   //           isCareProtectionEnabled,
//   //         )
//   //       : null,
//   //   [discountedServiceBooking, globalTax, isCareProtectionEnabled],
//   // );

//   const serviceBookingsWithMeta = useMemo(
//     () =>
//       pendingServiceBookings.map((booking) => {
//         const hasOffer =
//           Number(booking.originalAmount || 0) >
//           Number(booking.totalAmount || 0);
//         const discountPercent =
//           hasOffer && booking.originalAmount > 0
//             ? Math.round(
//                 ((booking.originalAmount - booking.totalAmount) /
//                   booking.originalAmount) *
//                   100,
//               )
//             : 0;
//         const breakdown = computeServiceBreakdown(
//           booking,
//           globalTax,
//           isCareProtectionEnabled,
//         );
//         return { booking, hasOffer, discountPercent, breakdown };
//       }),
//     [pendingServiceBookings, globalTax, isCareProtectionEnabled],
//   );
//   const toggleSection = (key) =>
//     setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));

//   const total = useMemo(() => {
//     return items.reduce((sum, i) => {
//       const qty = isDailyRentalItem(i) ? 1 : Number(i.quantity || 0);
//       const unitPrice = Number(i.pricePerDay || 0);
//       return sum + unitPrice * qty;
//     }, 0);
//   }, [items]);

//   const refundableDepositTotal = useMemo(() => {
//     return items.reduce((sum, i) => {
//       if (!isRentalItem(i)) return sum;
//       const deposit = Number(i.refundableDeposit || 0);
//       return sum + deposit * Number(i.quantity || 0);
//     }, 0);
//   }, [items]);

//   const hasRentalItems = useMemo(
//     () => items.some((i) => isRentalItem(i)),
//     [items],
//   );

//   const primaryRentalItem = useMemo(() => {
//     return items.find((i) => isRentalItem(i)) || null;
//   }, [items]);

//   const getRentalTenureLabel = (item) => {
//     const n = Number(item?.rentalMonths || 1);
//     return String(item?.tenureUnit || 'month') === 'day'
//       ? `${n} Day${n === 1 ? '' : 's'}`
//       : `${n} Month${n === 1 ? '' : 's'}`;
//   };

//   const getRentalPriceLabel = (item) => {
//     const n = Number(item?.rentalMonths || 1);
//     return String(item?.tenureUnit || 'month') === 'day'
//       ? `Rental Price `
//       : `Rental Price  `;
//   };

//   const handleTenureChange = (productId, cfg) => {
//     dispatch(
//       updateQuantity({
//         productId,
//         quantity: items.find((i) => i.productId === productId)?.quantity || 1,
//         rentalMonths: Number(cfg.months) || 1,
//         pricePerDay: Number(cfg.customerRent || cfg.pricePerDay || 0),
//       }),
//     );
//   };

//   const deliveryFee = 0;
//   // const gst = useMemo(() => {
//   //   return Math.round(total * 0.06);
//   // }, [total]);
//   // const gst = useMemo(() => {
//   //   console.log('=== GST DEBUG ===');
//   //   console.log('globalTax:', globalTax);
//   //   console.log('items:', items);
//   //   console.log('items[0].condition:', items[0]?.condition);
//   //   console.log('items[0].productType:', items[0]?.productType);
//   const gst = useMemo(() => {
//     if (!items.length) {
//       return 0;
//     }

//     // return items.reduce((sum, item) => {
//     //   const qty = Number(item.quantity || 1);
//     //   const price = Number(item.pricePerDay || 0);
//     //   const itemTotal = price * qty;

//     //   let gstRate = 0;

//     //   if (isRentalItem(item)) {
//     //     // Rental → use rental GST rate
//     //     gstRate = (globalTax.rental?.gst ?? 0) / 100;
//     //   } else {
//     //     // Sell → check product condition
//     //     const condition = String(item.condition || '').toLowerCase();
//     //     if (condition === 'refurbished') {
//     //       gstRate = (globalTax.buying_refurbished?.gst ?? 0) / 100;
//     //     } else {
//     //       // Brand New, Like New, Good, Fair → buying_new
//     //       gstRate = (globalTax.buying_new?.gst ?? 0) / 100;
//     //     }
//     //   }

//     //   return sum + Math.round(itemTotal * gstRate);
//     // }, 0);
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       if (item.taxBlocked) return sum;

//       let gstRate = 0;
//       if (item.defaultGst != null) {
//         gstRate = Number(item.defaultGst) / 100;
//       } else if (isRentalItem(item)) {
//         gstRate = (globalTax?.rental?.gst ?? 0) / 100;
//         // } else {
//         //   const condition = String(item.condition || '').toLowerCase();
//         //   gstRate =
//         //     condition === 'refurbished'
//         //       ? (globalTax?.buying_refurbished?.gst ?? 0) / 100
//         //       : (globalTax?.buying_new?.gst ?? 0) / 100;
//         // }
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           gstRate = (globalTax?.buying_refurbished?.gst ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           gstRate = (globalTax?.buying_mint?.gst ?? 0) / 100;
//         } else {
//           gstRate = (globalTax?.buying_new?.gst ?? 0) / 100;
//         }
//       }

//       return sum + Math.round(itemTotal * gstRate);
//     }, 0);
//   }, [total, items, globalTax]);

//   // const careProtection = useMemo(() => {
//   //   return items.length ? 30 : 0;
//   // }, [items.length]);
//   const careProtection = useMemo(() => {
//     console.log('=== CARE TAX DEBUG ===');
//     console.log('isCareProtectionEnabled:', isCareProtectionEnabled);
//     console.log('globalTax:', globalTax);
//     console.log('items.length:', items.length);
//     if (!isCareProtectionEnabled || !items.length) {
//       return 0;
//     }

//     // return items.reduce((sum, item) => {
//     //   const qty = Number(item.quantity || 1);
//     //   const price = Number(item.pricePerDay || 0);
//     //   const itemTotal = price * qty;

//     //   let careTaxRate = 0;

//     //   if (isRentalItem(item)) {
//     //     careTaxRate = (globalTax.rental?.careTax ?? 0) / 100;
//     //   } else {
//     //     const condition = String(item.condition || '').toLowerCase();
//     //     if (condition === 'refurbished') {
//     //       careTaxRate = (globalTax.buying_refurbished?.careTax ?? 0) / 100;
//     //     } else {
//     //       careTaxRate = (globalTax.buying_new?.careTax ?? 0) / 100;
//     //     }
//     //   }

//     //   return sum + Math.round(itemTotal * careTaxRate);
//     // }, 0);
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       if (item.taxBlocked) return sum;

//       let careTaxRate = 0;
//       if (item.defaultCareTax != null) {
//         careTaxRate = Number(item.defaultCareTax) / 100;
//       } else if (isRentalItem(item)) {
//         careTaxRate = (globalTax?.rental?.careTax ?? 0) / 100;
//         // } else {
//         //   const condition = String(item.condition || '').toLowerCase();
//         //   careTaxRate =
//         //     condition === 'refurbished'
//         //       ? (globalTax?.buying_refurbished?.careTax ?? 0) / 100
//         //       : (globalTax?.buying_new?.careTax ?? 0) / 100;
//         // }
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           careTaxRate = (globalTax?.buying_refurbished?.careTax ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           careTaxRate = (globalTax?.buying_mint?.careTax ?? 0) / 100;
//         } else {
//           careTaxRate = (globalTax?.buying_new?.careTax ?? 0) / 100;
//         }
//       }

//       return sum + Math.round(itemTotal * careTaxRate);
//     }, 0);
//   }, [items, isCareProtectionEnabled, globalTax]);

//   // const discountAmount = appliedCoupon?.discountAmount || 0;
//   const repairWarranty = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.repairWarranty ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.repairWarranty ?? 0) / 100
//       //       : (globalTax.buying_new?.repairWarranty ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultRepairWarranty != null) {
//         rate = Number(item.defaultRepairWarranty) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.repairWarranty ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100
//         //           : (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const relocationWarranty = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.repairWarranty ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const relocationWarranty = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.relocationWarranty ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.relocationWarranty ?? 0) / 100
//       //       : (globalTax.buying_new?.relocationWarranty ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultRelocationWarranty != null) {
//         rate = Number(item.defaultRelocationWarranty) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.relocationWarranty ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100
//         //           : (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const deliveryPackaging = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.relocationWarranty ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const deliveryPackaging = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.deliveryPackaging ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.deliveryPackaging ?? 0) / 100
//       //       : (globalTax.buying_new?.deliveryPackaging ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultDeliveryPackaging != null) {
//         rate = Number(item.defaultDeliveryPackaging) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.deliveryPackaging ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100
//         //           : (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);
//         // const installationFee = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.deliveryPackaging ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);
//   const installationFee = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.installationFee ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.installationFee ?? 0) / 100
//       //       : (globalTax.buying_new?.installationFee ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultInstallationFee != null) {
//         rate = Number(item.defaultInstallationFee) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.installationFee ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.installationFee ?? 0) / 100
//         //           : (globalTax?.buying_new?.installationFee ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const platformFee = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.installationFee ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.installationFee ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.installationFee ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const platformFee = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.platformFee ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.platformFee ?? 0) / 100
//       //       : (globalTax.buying_new?.platformFee ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultPlatformFee != null) {
//         rate = Number(item.defaultPlatformFee) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.platformFee ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.platformFee ?? 0) / 100
//         //           : (globalTax?.buying_new?.platformFee ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const buyingBreakdown = useMemo(
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.platformFee ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.platformFee ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.platformFee ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const buyingBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         sellItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [sellItems, globalTax, isCareProtectionEnabled],
//   );
//   const dailyRentalBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         dailyRentalItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [dailyRentalItems, globalTax, isCareProtectionEnabled],
//   );
//   const monthlyRentalBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         monthlyRentalItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [monthlyRentalItems, globalTax, isCareProtectionEnabled],
//   );

//   const rentalItems = useMemo(
//     () => [...dailyRentalItems, ...monthlyRentalItems],
//     [dailyRentalItems, monthlyRentalItems],
//   );
//   const rentalBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         rentalItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [rentalItems, globalTax, isCareProtectionEnabled],
//   );

//   // const discountAmount = appliedCoupon?.discountAmount || 0;
//   const discountAmount = appliedCoupon?.discountAmount || 0;
//   // const serviceBookingTotal = useMemo(
//   //   () => Number(pendingServiceBooking?.totalAmount || 0),
//   //   [pendingServiceBooking],
//   // );
//   const serviceBookingTotal = useMemo(() => {
//     return pendingServiceBookings.reduce((sum, booking) => {
//       const base = Number(booking?.totalAmount || 0);
//       if (!globalTax) return sum + base;
//       const tax = booking?.subCategoryTax || {};
//       const isBlocked =
//         booking?.taxBlocked === true || tax?.taxBlocked === true;
//       if (isBlocked) return sum + base;
//       const calc = (subKey, globalKey) => {
//         const rate =
//           tax[subKey] != null
//             ? Number(tax[subKey])
//             : (globalTax?.services?.[globalKey] ?? 0);
//         return Math.round((base * rate) / 100);
//       };
//       const feesSum =
//         calc('defaultGst', 'gst') +
//         (isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0) +
//         calc('defaultRepairWarranty', 'repairWarranty') +
//         calc('defaultRelocationWarranty', 'relocationWarranty') +
//         calc('defaultDeliveryPackaging', 'deliveryPackaging') +
//         calc('defaultInstallationFee', 'installationFee') +
//         calc('defaultPlatformFee', 'platformFee');
//       return sum + base + feesSum;
//     }, 0);
//   }, [pendingServiceBookings, globalTax, isCareProtectionEnabled]);

//   // const totalPayToday = useMemo(() => {
//   //   return (
//   //     total +
//   //     refundableDepositTotal +
//   //     deliveryFee +
//   //     gst +
//   //     careProtection -
//   //     discountAmount
//   //   );
//   // }, [
//   //   total,
//   //   refundableDepositTotal,
//   //   deliveryFee,
//   //   gst,
//   //   careProtection,
//   //   discountAmount,
//   // ]);

//   // const totalPayToday = useMemo(() => {
//   //   return (
//   //     total +
//   //     refundableDepositTotal +
//   //     deliveryFee +
//   //     gst +
//   //     careProtection +
//   //     repairWarranty +
//   //     relocationWarranty +
//   //     deliveryPackaging +
//   //     installationFee +
//   //     platformFee -
//   //     discountAmount
//   //   );
//   // }, [
//   //   total,
//   //   refundableDepositTotal,
//   //   deliveryFee,
//   //   gst,
//   //   careProtection,
//   //   repairWarranty,
//   //   relocationWarranty,
//   //   deliveryPackaging,
//   //   installationFee,
//   //   platformFee,
//   //   discountAmount,
//   // ]);

//   const totalPayToday = useMemo(() => {
//     return (
//       total +
//       refundableDepositTotal +
//       deliveryFee +
//       gst +
//       careProtection +
//       repairWarranty +
//       relocationWarranty +
//       deliveryPackaging +
//       installationFee +
//       platformFee +
//       serviceBookingTotal -
//       discountAmount
//     );
//   }, [
//     total,
//     refundableDepositTotal,
//     deliveryFee,
//     gst,
//     careProtection,
//     repairWarranty,
//     relocationWarranty,
//     deliveryPackaging,
//     installationFee,
//     platformFee,
//     serviceBookingTotal,
//     discountAmount,
//   ]);

//   const imgSrc = (src) => {
//     if (!src) return 'https://via.placeholder.com/100?text=No+Image';
//     return src.startsWith('http')
//       ? src
//       : (process.env.NEXT_PUBLIC_API_URL || '') + src;
//   };

//   useEffect(() => {
//     setIsHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!isHydrated) return;
//     const readBookings = () => {
//       try {
//         const raw = localStorage.getItem('rentpay_pending_service_bookings');
//         const list = raw ? JSON.parse(raw) : [];
//         setPendingServiceBookings(Array.isArray(list) ? list : []);
//       } catch {
//         setPendingServiceBookings([]);
//       }
//     };
//     readBookings();
//     window.addEventListener('rn_service_cart_changed', readBookings);
//     return () =>
//       window.removeEventListener('rn_service_cart_changed', readBookings);
//   }, [isHydrated]);

//   // useEffect(() => {
//   //   if (!pendingServiceBooking?.productId) {
//   //     setServiceOffer(null);
//   //     return;
//   //   }
//   //   let cancelled = false;
//   //   apiGetPublicActiveOffers()
//   //     .then((res) => {
//   //       if (cancelled) return;
//   //       const offers = res.data?.offers || [];
//   //       const match = offers.find(
//   //         (o) =>
//   //           String(o.productId?._id || o.productId) ===
//   //           String(pendingServiceBooking.productId),
//   //       );
//   //       setServiceOffer(match || null);
//   //     })
//   //     .catch(() => {
//   //       if (!cancelled) setServiceOffer(null);
//   //     });
//   //   return () => {
//   //     cancelled = true;
//   //   };
//   // }, [pendingServiceBooking?.productId]);
//   // Note: pendingServiceBooking.totalAmount is already the final, discounted
//   // price (set once by the booking modal). We must NOT re-fetch and re-apply
//   // the offer here, or the discount gets applied twice.

//   useEffect(() => {
//     localStorage.setItem(
//       'rentpay_care_protection_enabled',
//       String(isCareProtectionEnabled),
//     );
//   }, [isCareProtectionEnabled]);

//   useEffect(() => {
//     apiGetActiveCoupons()
//       .then((res) => setActiveCoupons(res.data?.data || []))
//       .catch(() => {});
//   }, []);

//   // useEffect(() => {
//   //   const fetchTax = async () => {
//   //     try {
//   //       const { apiGetGlobalTax } = await import('@/lib/api');
//   //       const res = await apiGetGlobalTax();
//   //       setGlobalTax(res.data?.data?.config || null);
//   //     } catch (e) {
//   //       console.error('Failed to load global tax', e);
//   //     }
//   //   };
//   //   fetchTax();
//   // }, []);

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
//   useEffect(() => {
//     if (!isHydrated) return;
//     dispatch(syncCart());
//   }, [dispatch, user, isAuthenticated, isHydrated]);

//   useEffect(() => {
//     let cancelled = false;
//     const ids = Array.from(new Set(items.map((i) => i.productId))).filter(
//       Boolean,
//     );
//     if (!ids.length) {
//       setStockByProductId({});
//       setDeliveryByProductId({});
//       return;
//     }

//     Promise.all(
//       ids.map((id) =>
//         apiGetProductById(id)
//           .then((res) => ({
//             id,
//             stock:
//               res.data?.product?.stock != null
//                 ? Number(res.data.product.stock)
//                 : 0,
//             deliveryLabel: getDeliveryTimelineLabel(res.data?.product),
//           }))
//           .catch(() => ({ id, stock: 0, deliveryLabel: '' })),
//       ),
//     ).then((pairs) => {
//       if (cancelled) return;
//       const nextStock = {};
//       const nextDelivery = {};
//       pairs.forEach((p) => {
//         nextStock[p.id] = p.stock;
//         nextDelivery[p.id] = p.deliveryLabel;
//       });
//       setStockByProductId(nextStock);
//       setDeliveryByProductId(nextDelivery);
//     });

//     return () => {
//       cancelled = true;
//     };
//   }, [stockMapKey]);

//   const getStockAndCheck = async (productId, nextQty) => {
//     const id = productId;
//     const res = await apiGetProductById(id);
//     const stock = res.data?.product?.stock ?? stockByProductId[id] ?? 0;
//     return {
//       ok: Number(nextQty) <= Number(stock || 0),
//       stock: Number(stock || 0),
//     };
//   };

//   const handleApplyCoupon = async (codeToApply) => {
//     const code = (codeToApply || couponCode).trim().toUpperCase();
//     if (!code) return;
//     setCouponLoading(true);
//     setCouponError('');
//     try {
//       const res = await apiValidateCoupon({ code, orderAmount: total });
//       dispatch(setAppliedCoupon(res.data.data)); // 👈 Redux mein store
//       pushToast(
//         `"${code}" applied! ₹${res.data.data.discountAmount} saved`,
//         'success',
//       );
//     } catch (err) {
//       setCouponError(err?.response?.data?.message || 'Invalid coupon');
//       dispatch(clearAppliedCoupon());
//     } finally {
//       setCouponLoading(false);
//     }
//   };

//   const handleRemoveCoupon = () => {
//     dispatch(clearAppliedCoupon());
//     setCouponCode('');
//     setCouponError('');
//   };

//   // const removeServiceBooking = (productId) => {
//   //   setPendingServiceBookings((prev) => {
//   //     const updated = prev.filter(
//   //       (b) => String(b.productId) !== String(productId),
//   //     );
//   //     localStorage.setItem(
//   //       'rentpay_pending_service_bookings',
//   //       JSON.stringify(updated),
//   //     );
//   //     return updated;
//   //   });
//   // };
//   const removeServiceBooking = (productId) => {
//     setPendingServiceBookings((prev) => {
//       const updated = prev.filter(
//         (b) => String(b.productId) !== String(productId),
//       );
//       localStorage.setItem(
//         'rentpay_pending_service_bookings',
//         JSON.stringify(updated),
//       );

//       // Mirror the removal to the server so admin's live cart table
//       // drops this service booking too, same pattern as product cart sync.
//       const userToken =
//         typeof window !== 'undefined'
//           ? localStorage.getItem('userToken')
//           : null;
//       if (userToken) {
//         api
//           .post('/live-cart/sync-services', { bookings: updated })
//           .catch(() => {
//             // Silent fail — never disrupt the user's cart UI.
//           });
//       }

//       return updated;
//     });
//   };

//   if (!isHydrated) {
//     return <div className="w-full mx-auto px-4 py-8" />;
//   }

//   if (items.length === 0 && pendingServiceBookings.length === 0) {
//     return (
//       <div className="w-full mx-auto px-4 py-16 text-center">
//         <h1 className="text-2xl font-bold text-black mb-4">
//           Your cart is empty
//         </h1>
//         <Link
//           href="/products"
//           className="text-primary font-medium hover:underline"
//         >
//           Browse products
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#f5f7fb] min-h-[calc(100vh-64px)]">
//       <div className="max-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
//         <div className="mb-5">
//           <h1 className="text-2xl font-bold text-black flex items-center gap-2">
//             {/* <ShoppingCart className="w-7 h-7 text-blue-600" /> */}
//             Shopping Cart
//           </h1>
//           <p className="text-sm font-bold text-gray-500 mt-1">
//             {items.length + pendingServiceBookings.length} item
//             {items.length + pendingServiceBookings.length !== 1 ? 's' : ''} in
//             your cart
//           </p>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
//           <div className="xl:col-span-8 space-y-4">
//             {/* {pendingServiceBooking && (
//               <div className="p-4 bg-white border border-gray-200 rounded-2xl">
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="relative">
//                     <img
//                       src={
//                         pendingServiceBooking.image ||
//                         'https://via.placeholder.com/100?text=Service'
//                       }
//                       alt=""
//                       className="w-full sm:w-28 h-28 object-cover rounded-xl"
//                     />
//                     <span className="absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white bg-red-500">
//                       Service
//                     </span>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="font-semibold text-2xl text-black truncate">
//                       {pendingServiceBooking.serviceName}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {pendingServiceBooking.bookingDate} ·{' '}
//                       {pendingServiceBooking.timeSlot?.label}
//                     </p>
//                     <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md">
//                       <div className="rounded-xl border border-[#FFD6A8] bg-white px-3 py-2">
//                         <p className="text-3xl text-center font-semibold text-[#F97316]">
//                           ₹{formatINR(pendingServiceBooking.totalAmount)}
//                         </p>
//                         <p className="text-xs text-center text-gray-500">
//                           Service Fee
//                         </p>
//                       </div>
//                     </div>
//                     <div className="mt-3 flex items-center justify-end">
//                       <div className="inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden">
//                         <button
//                           onClick={() => {
//                             localStorage.removeItem(
//                               'rentpay_pending_service_booking',
//                             );
//                             setPendingServiceBooking(null);
//                             window.dispatchEvent(
//                               new CustomEvent('rn_service_cart_changed'),
//                             );
//                           }}
//                           className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             localStorage.removeItem(
//                               'rentpay_pending_service_booking',
//                             );
//                             setPendingServiceBooking(null);
//                             window.dispatchEvent(
//                               new CustomEvent('rn_service_cart_changed'),
//                             );
//                           }}
//                           className="px-3 h-9 flex items-center text-sm text-red-600 font-medium hover:bg-gray-50"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )} */}

//             {pendingServiceBookings.map((booking) => {
//               const hasOffer =
//                 Number(booking.originalAmount || 0) >
//                 Number(booking.totalAmount || 0);
//               return (
//                 <div
//                   key={booking.bookingId || booking.productId}
//                   //   className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
//                   // >
//                   //   <div className="flex flex-row gap-3 sm:gap-4 p-3 sm:p-4">
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
//                 >
//                   <div className="flex flex-row gap-3 sm:gap-4 p-3 sm:p-4 pb-4 sm:pb-4">
//                     {/* Image */}
//                     <div className="relative shrink-0 w-1/4 sm:w-auto">
//                       <img
//                         src={
//                           booking.image ||
//                           'https://via.placeholder.com/100?text=Service'
//                         }
//                         alt=""
//                         className="w-full sm:w-28 h-24 sm:h-28 object-cover rounded-xl"
//                       />
//                       <span className="absolute top-1 left-1 sm:top-2 sm:left-2 text-[8px] sm:text-[10px] uppercase px-1.5 py-0.5 sm:px-2 rounded-full text-white bg-[#8B5CF6] font-semibold">
//                         Service
//                       </span>
//                     </div>

//                     {/* Details */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between gap-2 sm:block">
//                         <p className="font-semibold text-sm sm:text-2xl text-black truncate">
//                           {booking.serviceName}
//                         </p>
//                         <div className="flex sm:hidden items-center gap-1 shrink-0">
//                           {/* <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border border-[#D1D5DC] rounded-md shrink-0"
//                           >
//                             <Trash2 className="w-3 h-3" />
//                           </button> */}
//                           <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-6 h-6 sm:w-6 sm:h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3 h-3 sm:w-3 sm:h-3" />
//                           </button>
//                           <button
//                             type="button"
//                             disabled={changeSlotLoading}
//                             onClick={async () => {
//                               if (changeSlotLoading) return;
//                               setChangeSlotLoading(true);
//                               try {
//                                 setChangeSlotBookingProductId(
//                                   booking.productId,
//                                 );
//                                 const res = await apiGetServiceById(
//                                   booking.productId,
//                                 );
//                                 setChangeSlotProduct(
//                                   res.data?.product || res.data,
//                                 );
//                                 setChangeSlotOpen(true);
//                               } catch {
//                                 setChangeSlotProduct(null);
//                                 setChangeSlotOpen(true);
//                               } finally {
//                                 setChangeSlotLoading(false);
//                               }
//                             }}
//                             className="flex items-center gap-0.5 px-1.5 py-1 rounded-md border-2 border-orange-400 text-orange-600 text-[9px] font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3 h-3" />
//                             {changeSlotLoading ? '...' : 'Change'}
//                           </button>
//                         </div>
//                       </div>
//                       <p className="text-sm sm:text-2xl font-bold text-[#F97316] mt-1 flex items-center gap-2 flex-wrap">
//                         ₹{formatINR(booking.totalAmount)}
//                         {hasOffer ? (
//                           <>
//                             <span className="text-xs sm:text-sm font-normal text-gray-400 line-through">
//                               ₹{formatINR(booking.originalAmount)}
//                             </span>
//                             {/* <span className="inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
//                             {serviceDiscountPercent}% Off
//                           </span> */}
//                           </>
//                         ) : null}
//                       </p>

//                       {/* Scheduled Slot row */}
//                       {/* <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-1 sm:gap-1.5 text-sm text-gray-500 flex-wrap">
//                           <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-400" />
//                           <span className="text-[10px] sm:text-xs text-gray-500">
//                             Scheduled Slot:
//                           </span>
//                           <span className="text-[10px] sm:text-xs font-semibold text-[#8B5CF6]">
//                             {booking.bookingDate} @ {booking.timeSlot?.label}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="mt-2 mb-1 hidden sm:flex justify-end">
//                         <div className="inline-flex items-center gap-2"> */}
//                       <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-1 sm:gap-1.5 text-sm text-gray-500 flex-wrap">
//                           <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-400" />
//                           <span className="text-[10px] sm:text-xs text-gray-500">
//                             Scheduled Slot:
//                           </span>
//                           <span className="text-[10px] sm:text-xs font-semibold text-[#8B5CF6]">
//                             {booking.bookingDate} @ {booking.timeSlot?.label}
//                           </span>
//                         </div>
//                         <div className="hidden sm:inline-flex items-center gap-2 shrink-0">
//                           {/* <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </button> */}
//                           .
//                           <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                           </button>
//                           <button
//                             type="button"
//                             disabled={changeSlotLoading}
//                             onClick={async () => {
//                               if (changeSlotLoading) return;
//                               setChangeSlotLoading(true);
//                               try {
//                                 setChangeSlotBookingProductId(
//                                   booking.productId,
//                                 );
//                                 const res = await apiGetServiceById(
//                                   booking.productId,
//                                 );
//                                 setChangeSlotProduct(
//                                   res.data?.product || res.data,
//                                 );
//                                 setChangeSlotOpen(true);
//                               } catch {
//                                 setChangeSlotProduct(null);
//                                 setChangeSlotOpen(true);
//                               } finally {
//                                 setChangeSlotLoading(false);
//                               }
//                             }}
//                             //   className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
//                             // >
//                             //   <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                             //   {changeSlotLoading ? 'Loading...' : 'Change Slot'}
//                             // </button>
//                             className="flex items-center gap-1 sm:gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-xs font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
//                           >
//                             {/* <Calendar className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                             {changeSlotLoading ? 'Loading...' : 'Change Slot'}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })} */}
//                             <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                             {changeSlotLoading ? 'Loading...' : 'Change Slot'}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//             {items.map((item) => (
//               <div
//                 key={item.productId}
//                 className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl sm:rounded-2xl"
//               >
//                 <div className="flex flex-row gap-3 sm:gap-4">
//                   {/* <div className="relative">
//                     <img
//                       src={imgSrc(item.image)}
//                       alt=""
//                       className="w-full sm:w-28 h-28 object-cover rounded-xl"
//                       onError={(e) => {
//                         e.target.src = 'https://via.placeholder.com/100';
//                       }}
//                     />
//                     <span
//                       className={`absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white ${
//                         isRentalItem(item) ? 'bg-orange-500' : 'bg-blue-600'
//                       }`}
//                     >
//                       {isRentalItem(item) ? 'Rental' : 'Buy'}
//                     </span>
//                   </div> */}
//                   <div
//                     className="relative cursor-pointer shrink-0 w-1/4 sm:w-auto"
//                     onClick={() => {
//                       const isSell =
//                         String(item.productType || 'Rental') === 'Sell';
//                       router.push(
//                         isSell
//                           ? `/buy-product-details/${item.productId}`
//                           : `/rent-product-details/${item.productId}`,
//                       );
//                     }}
//                   >
//                     <img
//                       src={imgSrc(item.image)}
//                       alt=""
//                       className="w-full sm:w-28 h-24 sm:h-28 object-cover rounded-xl hover:opacity-90 transition"
//                       onError={(e) => {
//                         e.target.src = 'https://via.placeholder.com/100';
//                       }}
//                     />
//                     <span
//                       className={`absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white ${
//                         isRentalItem(item) ? 'bg-orange-500' : 'bg-blue-600'
//                       }`}
//                     >
//                       {isRentalItem(item) ? 'Rental' : 'Buy'}
//                     </span>
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-row items-center sm:items-start sm:justify-between gap-2 flex-wrap sm:flex-nowrap">
//                       <p className="font-semibold text-sm sm:text-2xl text-black truncate flex-1 min-w-0 sm:flex-initial">
//                         {item.title}
//                       </p>
//                       {/* {isRentalItem(item) ? (
//                         <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
//                           {getRentalTenureLabel(item)}
//                         </div>
//                       ) : null} */}
//                       <div
//                         className={
//                           isDailyRentalItem(item) ? 'hidden sm:block' : ''
//                         }
//                       >
//                         {isRentalItem(item) ? (
//                           Array.isArray(item.rentalConfigurations) &&
//                           item.rentalConfigurations.length > 1 ? (
//                             <CartTenureButton
//                               item={item}
//                               offer={item.offer || null}
//                               // onTenureChange={(
//                               //   selected,
//                               //   discountedPerUnit,
//                               //   discountedTotal,
//                               // ) => {
//                               //   const isDayUnit =
//                               //     selected?.periodUnit === 'day' ||
//                               //     (Number(selected?.days) > 0 &&
//                               //       !Number(selected?.months));
//                               //   dispatch(
//                               //     updateTenure({
//                               //       productId: item.productId,
//                               //       rentalMonths: isDayUnit
//                               //         ? Number(selected.days) || 1
//                               //         : Number(selected.months) || 1,
//                               //       pricePerDay: discountedTotal,
//                               //       tenureUnit: isDayUnit ? 'day' : 'month',
//                               //     }),
//                               //   );
//                               // }}
//                               onTenureChange={(
//                                 selected,
//                                 discountedPerUnit,
//                                 discountedTotal,
//                               ) => {
//                                 const isDayUnit =
//                                   selected?.periodUnit === 'day' ||
//                                   (Number(selected?.days) > 0 &&
//                                     !Number(selected?.months));
//                                 dispatch(
//                                   updateTenure({
//                                     productId: item.productId,
//                                     rentalMonths: isDayUnit
//                                       ? Number(selected.days) || 1
//                                       : Number(selected.months) || 1,
//                                     pricePerDay: isDayUnit
//                                       ? discountedTotal
//                                       : discountedPerUnit,
//                                     tenureUnit: isDayUnit ? 'day' : 'month',
//                                   }),
//                                 );
//                               }}
//                             />
//                           ) : (
//                             <div
//                               className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 border rounded-md sm:rounded-lg text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 ${
//                                 isDailyRentalItem(item)
//                                   ? 'sm:!border-orange-400 sm:!text-orange-600'
//                                   : ''
//                               }`}
//                             >
//                               {getRentalTenureLabel(item)}
//                             </div>
//                           )
//                         ) : null}
//                       </div>
//                       {isDailyRentalItem(item) ? (
//                         <div className="flex sm:hidden items-center gap-1 shrink-0">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-md shrink-0"
//                           >
//                             <Trash2 className="w-3 h-3" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setDateModalItem(item)}
//                             className="flex items-center gap-0.5 px-1.5 py-1 rounded-md border-2 border-orange-400 text-orange-600 text-[9px] font-semibold hover:bg-orange-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3 h-3" />
//                             Change
//                           </button>
//                         </div>
//                       ) : null}
//                       {/* {isRentalItem(item) && !isDailyRentalItem(item) ? (
//                         <div className="flex sm:hidden items-center border border-[#D1D5DC] rounded-md overflow-hidden shrink-0">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-5 h-5 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                           >
//                             <Trash2 className="w-2.5 h-2.5" />
//                           </button>
//                           <button
//                             onClick={() =>
//                               dispatch(
//                                 updateQuantity({
//                                   productId: item.productId,
//                                   quantity: item.quantity - 1,
//                                 }),
//                               )
//                             }
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Minus className="w-2.5 h-2.5" />
//                           </button>
//                           <span className="w-4 text-center text-[9px]">
//                             {item.quantity}
//                           </span>
//                           <button
//                             onClick={async () => {
//                               const productId = item.productId;
//                               const nextQty = item.quantity + 1;
//                               const { ok, stock } = await getStockAndCheck(
//                                 productId,
//                                 nextQty,
//                               );
//                               if (!ok) {
//                                 pushToast(
//                                   `Only ${stock} available in stock for this product.`,
//                                   'error',
//                                 );
//                                 return;
//                               }
//                               dispatch(
//                                 updateQuantity({
//                                   productId,
//                                   quantity: nextQty,
//                                 }),
//                               );
//                             }}
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Plus className="w-2.5 h-2.5" />
//                           </button>
//                         </div>
//                       ) : null} */}
//                       {!isRentalItem(item) ? (
//                         <div className="flex sm:hidden items-center border-2 border-[#D1D5DC] rounded-md overflow-hidden shrink-0">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-5 h-5 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                           >
//                             <Trash2 className="w-2.5 h-2.5" />
//                           </button>
//                           <button
//                             onClick={() =>
//                               dispatch(
//                                 updateQuantity({
//                                   productId: item.productId,
//                                   quantity: item.quantity - 1,
//                                 }),
//                               )
//                             }
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Minus className="w-2.5 h-2.5" />
//                           </button>
//                           <span className="w-4 text-center text-[9px]">
//                             {item.quantity}
//                           </span>
//                           <button
//                             onClick={async () => {
//                               const productId = item.productId;
//                               const nextQty = item.quantity + 1;
//                               const { ok, stock } = await getStockAndCheck(
//                                 productId,
//                                 nextQty,
//                               );
//                               if (!ok) {
//                                 pushToast(
//                                   `Only ${stock} available in stock for this product.`,
//                                   'error',
//                                 );
//                                 return;
//                               }
//                               dispatch(
//                                 updateQuantity({
//                                   productId,
//                                   quantity: nextQty,
//                                 }),
//                               );
//                             }}
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Plus className="w-2.5 h-2.5" />
//                           </button>
//                         </div>
//                       ) : null}
//                     </div>
//                     {/* <div
//                       className={`mt-1.5 sm:mt-3 grid ${
//                         isDailyRentalItem(item)
//                           ? 'grid-cols-3'
//                           : 'grid-cols-2 sm:grid-cols-3'
//                       } gap-1 sm:gap-2 max-w-md`}
//                     > */}
//                     <div
//                       className={`mt-1.5 sm:mt-0.5 grid ${
//                         isDailyRentalItem(item)
//                           ? 'grid-cols-3'
//                           : 'grid-cols-2 sm:grid-cols-3'
//                       } gap-1 sm:gap-2 max-w-md`}
//                     >
//                       {isDailyRentalItem(item) ? (
//                         <div className="flex sm:hidden flex-col items-center justify-center rounded-md border border-[#FFD6A8] bg-white px-1 py-0.5">
//                           <p className="text-xs font-semibold text-[#F97316] text-center leading-tight">
//                             {getRentalTenureLabel(item)}
//                           </p>
//                         </div>
//                       ) : null}
//                       {/* <div className="rounded-md sm:rounded-xl border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-3 sm:py-2">
//                         <p className="text-xs sm:text-3xl text-center font-semibold text-[#F97316]">
//                           ₹{formatINR(item.pricePerDay)}
//                         </p>
//                         <p className="text-[8px] sm:text-xs text-center text-gray-500 truncate">
//                           {isRentalItem(item)
//                             ? getRentalPriceLabel(item)
//                             : 'Sale Price'}
//                         </p>
//                       </div>
//                       {isRentalItem(item) ? (
//                         <div className="rounded-md sm:rounded-xl border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-3 sm:py-2">
//                           <p className="text-xs sm:text-3xl text-center font-semibold text-[#F97316]">
//                             ₹{formatINR(item.refundableDeposit)}
//                           </p>
//                           <p className="text-[8px] sm:text-xs text-center text-gray-500">
//                             Deposit
//                           </p>
//                         </div>
//                       ) : null} */}
//                       <div className="rounded-md sm:rounded-lg border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-2.5 sm:py-1">
//                         <p className="text-xs sm:text-xl text-center font-semibold text-[#F97316]">
//                           ₹{formatINR(item.pricePerDay)}
//                         </p>
//                         <p className="text-[8px] sm:text-xs text-center text-gray-500 truncate">
//                           {isRentalItem(item)
//                             ? getRentalPriceLabel(item)
//                             : 'Sale Price'}
//                         </p>
//                       </div>
//                       {isRentalItem(item) ? (
//                         <div className="rounded-md sm:rounded-lg border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-2.5 sm:py-1">
//                           <p className="text-xs sm:text-xl text-center font-semibold text-[#F97316]">
//                             ₹{formatINR(item.refundableDeposit)}
//                           </p>
//                           <p className="text-[8px] sm:text-xs text-center text-gray-500">
//                             Deposit
//                           </p>
//                         </div>
//                       ) : null}
//                     </div>

//                     {/* <p className="text-xs text-gray-500 mt-2">
//                       {deliveryByProductId[item.productId] ||
//                         'Delivery in 2-3 days'}
//                     </p> */}
//                     {/* {isDailyRentalItem(item) &&
//                     item.startDate &&
//                     item.endDate ? (
//                       <p className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 flex items-center gap-1 flex-wrap">
//                         <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
//                         <span>
//                           {formatRangeLine(item.startDate)}{' '}
//                           <span className="text-orange-500 font-semibold">
//                             to
//                           </span>{' '}
//                           {formatRangeLine(item.endDate)}
//                         </span>
//                       </p>
//                     ) : (
//                       <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
//                         {deliveryByProductId[item.productId] ||
//                           'Delivery in 2-3 days'}
//                       </p>
//                     )}

//                     <div className="mt-1 sm:mt-3 flex items-center justify-between gap-2">
//                       <p className="text-xs text-gray-500 mt-2"></p> */}
//                     {/* <div className="mt-1 sm:mt-3 flex items-center justify-between gap-2">
//                       {isDailyRentalItem(item) && */}
//                     <div className="mt-0.5 sm:mt-0.5 flex items-center justify-between gap-2">
//                       {isDailyRentalItem(item) &&
//                       item.startDate &&
//                       item.endDate ? (
//                         <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 flex-wrap">
//                           <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
//                           <span>
//                             {formatRangeLine(item.startDate)}{' '}
//                             <span className="text-orange-500 font-semibold">
//                               to
//                             </span>{' '}
//                             {formatRangeLine(item.endDate)}
//                           </span>
//                         </p>
//                       ) : (
//                         <p className="text-[10px] sm:text-xs text-gray-500">
//                           {deliveryByProductId[item.productId] ||
//                             'Delivery in 2-3 days'}
//                         </p>
//                       )}
//                       {/*
//                       <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
//                         <button
//                           onClick={() =>
//                             dispatch(removeFromCart(item.productId))
//                           }
//                           className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() =>
//                             dispatch(
//                               updateQuantity({
//                                 productId: item.productId,
//                                 quantity: item.quantity - 1,
//                               }),
//                             )
//                           }
//                           className="w-9 h-9 inline-flex items-center justify-center hover:bg-gray-50"
//                         >
//                           <Minus className="w-4 h-4" />
//                         </button>
//                         <span className="w-10 text-center text-sm">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={async () => {
//                             const productId = item.productId;
//                             const nextQty = item.quantity + 1;
//                             const { ok, stock } = await getStockAndCheck(
//                               productId,
//                               nextQty,
//                             );
//                             if (!ok) {
//                               pushToast(
//                                 `Only ${stock} available in stock for this product.`,
//                                 'error',
//                               );
//                               return;
//                             }
//                             dispatch(
//                               updateQuantity({
//                                 productId,
//                                 quantity: nextQty,
//                               }),
//                             );
//                           }}
//                           className="w-9 h-9 inline-flex items-center justify-center hover:bg-gray-50"
//                         >
//                           <Plus className="w-4 h-4" />
//                         </button>
//                       </div> */}
//                       {/* <div className="inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden">

//                         <button
//                           onClick={() =>
//                             dispatch(removeFromCart(item.productId))
//                           }
//                           className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>

//                         <button
//                           onClick={() =>
//                             dispatch(
//                               updateQuantity({
//                                 productId: item.productId,
//                                 quantity: item.quantity - 1,
//                               }),
//                             )
//                           }
//                           className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 "
//                         >
//                           <Minus className="w-4 h-4" />
//                         </button>

//                         <span className="w-10 text-center text-sm ">
//                           {item.quantity}
//                         </span>

//                         <button
//                           onClick={async () => {
//                             const productId = item.productId;
//                             const nextQty = item.quantity + 1;
//                             const { ok, stock } = await getStockAndCheck(
//                               productId,
//                               nextQty,
//                             );

//                             if (!ok) {
//                               pushToast(
//                                 `Only ${stock} available in stock for this product.`,
//                                 'error',
//                               );
//                               return;
//                             }

//                             dispatch(
//                               updateQuantity({
//                                 productId,
//                                 quantity: nextQty,
//                               }),
//                             );
//                           }}
//                           className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
//                         >
//                           <Plus className="w-4 h-4" />
//                         </button>
//                       </div> */}
//                       {/* {isDailyRentalItem(item) ? (
//                         <div className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setDateModalItem(item)}
//                             className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-sm font-semibold hover:bg-orange-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                             Change Date
//                           </button>
//                         </div>
//                       ) : ( */}
//                       {isDailyRentalItem(item) ? (
//                         <div className="hidden sm:inline-flex items-center gap-1.5 sm:gap-1.5">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setDateModalItem(item)}
//                             className="flex items-center gap-1 sm:gap-1 px-2  py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-xs font-semibold hover:bg-orange-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                             Change Date
//                           </button>
//                         </div>
//                       ) : (
//                         // <div className="hidden sm:inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden shrink-0">
//                         // <div
//                         //   className={`${
//                         //     !isRentalItem(item)
//                         //       ? 'hidden sm:inline-flex'
//                         //       : 'inline-flex'
//                         //   } items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden shrink-0`}
//                         // >
//                         //   {/* Trash */}
//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(removeFromCart(item.productId))
//                         //     }
//                         //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         //   >
//                         //     <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   {/* Minus */}
//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId: item.productId,
//                         //           quantity: item.quantity - 1,
//                         //         }),
//                         //       )
//                         //     }
//                         //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 "
//                         //   >
//                         //     <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   {/* Quantity */}
//                         //   <span className="w-7 sm:w-10 text-center text-xs sm:text-sm ">
//                         //     {item.quantity}
//                         //   </span>

//                         //   {/* Plus */}
//                         //   <button
//                         //     onClick={async () => {
//                         //       const productId = item.productId;
//                         //       const nextQty = item.quantity + 1;
//                         //       const { ok, stock } = await getStockAndCheck(
//                         //         productId,
//                         //         nextQty,
//                         //       );

//                         //       if (!ok) {
//                         //         pushToast(
//                         //           `Only ${stock} available in stock for this product.`,
//                         //           'error',
//                         //         );
//                         //         return;
//                         //       }

//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId,
//                         //           quantity: nextQty,
//                         //         }),
//                         //       );
//                         //     }}
//                         //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50"
//                         //   >
//                         //     <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         //   </button>
//                         // </div>
//                         // <div
//                         //   className={`${
//                         //     !isRentalItem(item)
//                         //       ? 'hidden sm:inline-flex'
//                         //       : 'inline-flex'
//                         //   } items-center border sm:border-2 border-[#D1D5DC] rounded-md sm:rounded-lg overflow-hidden shrink-0`}
//                         // >

//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(removeFromCart(item.productId))
//                         //     }
//                         //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         //   >
//                         //     <Trash2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId: item.productId,
//                         //           quantity: item.quantity - 1,
//                         //         }),
//                         //       )
//                         //     }
//                         //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 "
//                         //   >
//                         //     <Minus className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   <span className="w-4 sm:w-10 text-center text-[9px] sm:text-sm ">
//                         //     {item.quantity}
//                         //   </span>

//                         //   <button
//                         //     onClick={async () => {
//                         //       const productId = item.productId;
//                         //       const nextQty = item.quantity + 1;
//                         //       const { ok, stock } = await getStockAndCheck(
//                         //         productId,
//                         //         nextQty,
//                         //       );

//                         //       if (!ok) {
//                         //         pushToast(
//                         //           `Only ${stock} available in stock for this product.`,
//                         //           'error',
//                         //         );
//                         //         return;
//                         //       }

//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId,
//                         //           quantity: nextQty,
//                         //         }),
//                         //       );
//                         //     }}
//                         //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50"
//                         //   >
//                         //     <Plus className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
//                         //   </button>
//                         // </div>
//                         <div
//                           className={`${
//                             !isRentalItem(item)
//                               ? 'hidden sm:inline-flex'
//                               : 'inline-flex'
//                           } items-center border sm:border-2 border-[#D1D5DC] rounded-md sm:rounded-lg overflow-hidden shrink-0`}
//                         >
//                           {/* Trash */}
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                           >
//                             <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                           </button>

//                           {/* Minus */}
//                           <button
//                             onClick={() =>
//                               dispatch(
//                                 updateQuantity({
//                                   productId: item.productId,
//                                   quantity: item.quantity - 1,
//                                 }),
//                               )
//                             }
//                             className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-50 "
//                           >
//                             <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                           </button>

//                           {/* Quantity */}
//                           <span className="w-4 sm:w-7 text-center text-[9px] sm:text-xs ">
//                             {item.quantity}
//                           </span>

//                           {/* Plus */}
//                           <button
//                             onClick={async () => {
//                               const productId = item.productId;
//                               const nextQty = item.quantity + 1;
//                               const { ok, stock } = await getStockAndCheck(
//                                 productId,
//                                 nextQty,
//                               );

//                               if (!ok) {
//                                 pushToast(
//                                   `Only ${stock} available in stock for this product.`,
//                                   'error',
//                                 );
//                                 return;
//                               }

//                               dispatch(
//                                 updateQuantity({
//                                   productId,
//                                   quantity: nextQty,
//                                 }),
//                               );
//                             }}
//                             className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                           </button>
//                         </div>
//                       )}
//                     </div>

//                     {/* <p className="text-xs text-gray-500 mt-2">
//                       Available stock: {stockByProductId[item.productId] ?? '—'}
//                     </p> */}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="xl:col-span-4">
//             <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-5 sticky top-24">
//               {/* <button
//                 type="button"
//                 onClick={() => setIsSummaryOpen((p) => !p)}
//                 className="w-full flex items-center justify-between mb-4"
//               >
//                 <h2 className="text-2xl font-semibold text-black">
//                   Order Summary
//                 </h2>
//                 <ChevronRight
//                   className={`w-5 h-5 text-gray-500 transition-transform ${isSummaryOpen ? 'rotate-90' : ''}`}
//                 />
//               </button>
//               <div
//                 className={`space-y-3 text-sm overflow-hidden transition-all duration-300 ${isSummaryOpen ? 'max-h-[1200px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}
//               > */}

//               <h2 className="text-xl font-semibold text-black mb-4">
//                 Order Summary
//               </h2>
//               <div className="space-y-3 text-sm mb-4">
//                 {/* {pendingServiceBooking && (
//                   <div className="border border-orange-100 bg-orange-50 rounded-xl p-3">
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium text-gray-800">
//                         Service Summary
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           localStorage.removeItem(
//                             'rentpay_pending_service_booking',
//                           );
//                           setPendingServiceBooking(null);
//                         }}
//                         className="text-xs text-red-500 hover:underline"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                     <div className="mt-2 flex items-center gap-3">
//                       {pendingServiceBooking.image ? (
//                         <img
//                           src={pendingServiceBooking.image}
//                           alt=""
//                           className="w-14 h-14 rounded-lg object-cover"
//                         />
//                       ) : null}
//                       <div className="min-w-0 flex-1">
//                         <p className="text-sm font-semibold text-gray-900 truncate">
//                           {pendingServiceBooking.serviceName}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-0.5">
//                           {pendingServiceBooking.bookingDate} ·{' '}
//                           {pendingServiceBooking.timeSlot?.label}
//                         </p>
//                       </div>
//                       <span className="font-medium text-gray-900 shrink-0">
//                         ₹{formatINR(serviceBookingTotal)}
//                       </span>
//                     </div>
//                   </div>
//                 )} */}
//                 {[
//                   {
//                     key: 'buying',
//                     title: `Buying Summary (${sellItems.length} item${sellItems.length === 1 ? '' : 's'})`,
//                     items: sellItems,
//                     breakdown: buyingBreakdown,
//                     show: sellItems.length > 0,
//                   },
//                   // {
//                   //   key: 'rental',
//                   //   title: `Rental Summary (${rentalItems.length} item${rentalItems.length === 1 ? '' : 's'})`,
//                   //   items: rentalItems,
//                   //   breakdown: rentalBreakdown,
//                   //   show: rentalItems.length > 0,
//                   // },
//                   {
//                     key: 'rental',
//                     title: `Rental Summary (${rentalItems.length} item${rentalItems.length === 1 ? '' : 's'})`,
//                     items: rentalItems,
//                     breakdown: rentalBreakdown,
//                     show: rentalItems.length > 0,
//                     showAllTaxes: true,
//                   },
//                   // ]
//                   //   .filter((g) => g.show)
//                   //   .map((group) => (
//                 ]
//                   .concat(
//                     pendingServiceBookings.length > 0
//                       ? [
//                           {
//                             key: 'service',
//                             title: `Service Summary (${pendingServiceBookings.length} item${pendingServiceBookings.length === 1 ? '' : 's'})`,
//                             isService: true,
//                             breakdown: {
//                               itemsTotal: serviceBookingsWithMeta.reduce(
//                                 (s, m) => s + m.breakdown.itemsTotal,
//                                 0,
//                               ),
//                               fees: serviceBookingsWithMeta.reduce((acc, m) => {
//                                 Object.keys(m.breakdown.fees).forEach((k) => {
//                                   acc[k] = (acc[k] || 0) + m.breakdown.fees[k];
//                                 });
//                                 return acc;
//                               }, {}),
//                             },
//                             show: true,
//                           },
//                         ]
//                       : [],
//                   )
//                   .filter((g) => g.show)
//                   .map((group) => (
//                     <div
//                       key={group.key}
//                       className="border border-gray-100 rounded-xl"
//                     >
//                       <button
//                         type="button"
//                         onClick={() => toggleSection(group.key)}
//                         className="w-full flex items-center justify-between px-3 py-2"
//                       >
//                         <span className="font-medium text-gray-800">
//                           {group.title}
//                         </span>
//                         {/* <div className="flex items-center gap-2">
//                           <span className="font-medium text-gray-900">
//                             ₹{formatINR(Math.round(group.breakdown.itemsTotal))}
//                           </span>
//                           <ChevronRight
//                             className={`w-4 h-4 text-gray-500 transition-transform ${openSection[group.key] ? 'rotate-90' : ''}`}
//                           />
//                         </div> */}
//                         <div className="flex items-center gap-2">
//                           <span className="font-medium text-gray-900">
//                             ₹
//                             {formatINR(
//                               Math.round(
//                                 group.breakdown.itemsTotal +
//                                   Object.values(group.breakdown.fees).reduce(
//                                     (s, v) => s + v,
//                                     0,
//                                   ),
//                               ),
//                             )}
//                           </span>
//                           <ChevronRight
//                             className={`w-4 h-4 text-gray-500 transition-transform ${openSection[group.key] ? 'rotate-90' : ''}`}
//                           />
//                         </div>
//                       </button>
//                       {openSection[group.key] && (
//                         <div className="px-3 pb-3 space-y-1.5">
//                           {group.isService ? (
//                             // <div className="text-xs text-gray-500 flex items-center justify-between">
//                             //   <span className="truncate pr-2">
//                             //     {pendingServiceBooking.serviceName} (
//                             //     {pendingServiceBooking.bookingDate} ·{' '}
//                             //     {pendingServiceBooking.timeSlot?.label})
//                             //   </span>
//                             //   <div className="flex items-center gap-2">
//                             //     <span>
//                             //       ₹{formatINR(group.breakdown.itemsTotal)}
//                             //     </span>
//                             //     <button
//                             //       onClick={() => {
//                             //         localStorage.removeItem(
//                             //           'rentpay_pending_service_booking',
//                             //         );
//                             //         setPendingServiceBooking(null);
//                             //       }}
//                             //       className="text-[10px] text-red-500 hover:underline"
//                             //     >
//                             //       Remove
//                             //     </button>
//                             //   </div>
//                             // </div>
//                             // <div className="text-xs text-gray-500 flex items-center justify-between">
//                             //   <span className="truncate pr-2">
//                             //     {pendingServiceBooking.serviceName} (
//                             //     {pendingServiceBooking.bookingDate} ·{' '}
//                             //     {pendingServiceBooking.timeSlot?.label})
//                             //   </span>
//                             //   <span className="flex items-center gap-1.5 shrink-0">
//                             <div className="space-y-1">
//                               {serviceBookingsWithMeta.map((m) => (
//                                 <div
//                                   key={
//                                     m.booking.bookingId || m.booking.productId
//                                   }
//                                   className="text-xs text-gray-600 flex items-center justify-between"
//                                 >
//                                   <span className="truncate pr-2 flex items-center gap-1">
//                                     <span className="shrink-0">•</span>
//                                     {m.booking.serviceName} (
//                                     {m.booking.bookingDate})
//                                   </span>
//                                   <span className="flex items-center gap-1.5 shrink-0">
//                                     {m.hasOffer ? (
//                                       <span className="text-gray-400 line-through">
//                                         ₹{formatINR(m.booking.originalAmount)}
//                                       </span>
//                                     ) : null}
//                                     <span>
//                                       ₹{formatINR(m.breakdown.itemsTotal)}
//                                     </span>
//                                   </span>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             // ) : (
//                             //   group.items.map((it) => (
//                             //     <div
//                             //       key={it.productId}
//                             //       className="text-xs text-gray-500 flex items-center justify-between"
//                             //     >
//                             //       <span className="truncate pr-2">
//                             //         {it.title}
//                             //       </span>
//                             //       <span>
//                             //         {isDailyRentalItem(it)
//                             //           ? `₹${formatINR(it.pricePerDay)}`
//                             //           : `₹${formatINR(it.pricePerDay)} × ${it.quantity}`}
//                             //       </span>
//                             //     </div>
//                             //   ))
//                             // )}
//                             // <div className="pt-1 mt-1 border-t border-gray-100 space-y-1">
//                             //   {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
//                             //     (field) =>
//                             //       group.breakdown.fees[field.key] > 0 ? (
//                             //         <div
//                             //           key={field.key}
//                             //           className="flex items-center justify-between"
//                             //         >
//                             //           <span className="text-gray-600">
//                             //             {field.label}
//                             //           </span>
//                             //           <span className="font-medium">
//                             //             ₹
//                             //             {formatINR(
//                             //               group.breakdown.fees[field.key],
//                             //             )}
//                             //           </span>
//                             //         </div>
//                             //       ) : null,
//                             //   )}
//                             //   {group.breakdown.fees.careTax > 0 && (
//                             //     <div className="flex items-center justify-between">
//                             //       <span className="text-gray-600">Care Tax</span>
//                             //       <span className="font-medium">
//                             //         ₹{formatINR(group.breakdown.fees.careTax)}
//                             //       </span>
//                             //     </div>
//                             //   )}
//                             // </div>

//                             group.items.map((it) => (
//                               <div
//                                 key={it.productId}
//                                 className="text-xs text-gray-600 flex items-center justify-between"
//                               >
//                                 <span className="truncate pr-2 flex items-center gap-1">
//                                   <span className="shrink-0">•</span>
//                                   {it.title}
//                                 </span>
//                                 <span>
//                                   {isDailyRentalItem(it)
//                                     ? `₹${formatINR(it.pricePerDay)}`
//                                     : `₹${formatINR(it.pricePerDay)} × ${it.quantity}`}
//                                 </span>
//                               </div>
//                             ))
//                           )}
//                           {/* <div className="pt-1 mt-1 border-t border-gray-100 space-y-1 text-xs">
//                             {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
//                               (field) =>
//                                 group.breakdown.fees[field.key] > 0 ? (
//                                   <div
//                                     key={field.key}
//                                     className="flex items-center justify-between"
//                                   >
//                                     <span className="text-gray-600">
//                                       {field.label}
//                                     </span>
//                                     <span className="font-medium">
//                                       ₹
//                                       {formatINR(
//                                         group.breakdown.fees[field.key],
//                                       )}
//                                     </span>
//                                   </div>
//                                 ) : null,
//                             )}
//                             {group.breakdown.fees.careTax > 0 && (
//                               <div className="flex items-center justify-between">
//                                 <span className="text-gray-600">Care Tax</span>
//                                 <span className="font-medium">
//                                   ₹{formatINR(group.breakdown.fees.careTax)}
//                                 </span>
//                               </div>
//                             )}
//                           </div> */}
//                           <div className="pt-1 mt-1 border-t border-gray-100 space-y-1 text-xs">
//                             {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
//                               (field) =>
//                                 group.breakdown.fees[field.key] > 0 ||
//                                 group.showAllTaxes ? (
//                                   <div
//                                     key={field.key}
//                                     className="flex items-center justify-between"
//                                   >
//                                     <span className="text-gray-600">
//                                       {field.label}
//                                     </span>
//                                     <span className="font-medium">
//                                       ₹
//                                       {formatINR(
//                                         group.breakdown.fees[field.key],
//                                       )}
//                                     </span>
//                                   </div>
//                                 ) : null,
//                             )}
//                             {(group.breakdown.fees.careTax > 0 ||
//                               group.showAllTaxes) && (
//                               <div className="flex items-center justify-between">
//                                 <span className="text-gray-600">Care Tax</span>
//                                 <span className="font-medium">
//                                   ₹{formatINR(group.breakdown.fees.careTax)}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                 {refundableDepositTotal > 0 && (
//                   <div className="border border-gray-100 rounded-xl">
//                     <button
//                       type="button"
//                       onClick={() => toggleSection('deposit')}
//                       className="w-full flex items-center justify-between px-3 py-2"
//                     >
//                       <span className="font-medium text-gray-800 flex items-center gap-1 relative group">
//                         Refundable Deposits
//                         <AlertCircle className="w-4 h-4 text-gray-400 cursor-pointer peer" />
//                         <span className="pointer-events-none absolute left-0 top-full mt-1 w-56 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                           This deposit is fully refundable. It is returned once
//                           the rented product is collected back in good
//                           condition, with no damage or missing accessories.
//                         </span>
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium text-gray-900">
//                           ₹{formatINR(Math.round(refundableDepositTotal))}
//                         </span>
//                         <ChevronRight
//                           className={`w-4 h-4 text-gray-500 transition-transform ${openSection.deposit ? 'rotate-90' : ''}`}
//                         />
//                       </div>
//                     </button>
//                     {openSection.deposit && (
//                       <div className="px-3 pb-3 space-y-1.5">
//                         {items
//                           .filter((i) => isRentalItem(i))
//                           .map((it) => (
//                             <div
//                               key={it.productId}
//                               className="text-xs text-gray-600 flex items-center justify-between"
//                             >
//                               <span className="truncate pr-2">
//                                 {it.title}{' '}
//                                 <span className="text-gray-400">
//                                   (
//                                   {String(it.tenureUnit || 'month') === 'day'
//                                     ? 'Daily'
//                                     : 'Monthly'}
//                                   )
//                                 </span>
//                               </span>
//                               <span className="font-medium">
//                                 ₹
//                                 {formatINR(
//                                   Number(it.refundableDeposit || 0) *
//                                     Number(it.quantity || 1),
//                                 )}
//                               </span>
//                             </div>
//                           ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* {(hasRentalItems || items.some((i) => !isRentalItem(i))) &&
//               isCareProtectionEnabled &&
//               careProtection > 0 ? ( */}
//               {/* {isCareProtectionEnabled &&
//               (careProtection > 0 ||
//                 (pendingServiceBooking &&
//                   serviceBreakdown?.fees?.careTax > 0)) &&
//               (items.length > 0 || pendingServiceBooking) ? (
//                 <div className="mt-4 rounded-xl border-2 border-[#BEDBFF] bg-blue-50 px-4 py-4">
//                   <div className="flex-1">
//                     <p className="text-sm font-semibold text-black flex items-center gap-1.5 relative group">
//                       <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
//                       Rentnpay Care Protection
//                       <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
//                       <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                         Covers accidental damage and breakdowns during use, plus
//                         priority customer support if anything goes wrong with
//                         your rented or purchased product.
//                       </span>
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {hasRentalItems
//                         ? 'Damage protection & priority support'
//                         : 'Buyer protection & priority support'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setIsCareProtectionEnabled(false)}
//                     className="text-xs text-gray-500 whitespace-nowrap self-center"
//                   >
//                     Dont Want? <span className="text-blue-600">Remove</span>
//                   </button>
//                 </div>
//               ) : null} */}

//               {items.length > 0 || pendingServiceBookings.length > 0 ? (
//                 <div className="mt-4 rounded-xl border-2 border-[#BEDBFF] bg-blue-50 px-4 py-4">
//                   <div className="flex-1">
//                     {/* <p className="text-sm font-semibold text-black flex items-center gap-1.5 relative group">
//                       <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
//                       Rentnpay Care Protection
//                       <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
//                       <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                         Covers accidental damage and breakdowns during use, plus
//                         priority customer support if anything goes wrong with
//                         your rented or purchased product.
//                       </span>
//                     </p> */}
//                     <p className="text-sm font-semibold text-black flex items-center gap-0.5 relative group">
//                       <style>{`
//                         @keyframes careProtectionStop1 {
//                           0%, 100% { stop-color: #3B82F6; }
//                           50% { stop-color: #1D4ED8; }
//                         }
//                         @keyframes careProtectionStop2 {
//                           0%, 100% { stop-color: #1D4ED8; }
//                           50% { stop-color: #3B82F6; }
//                         }
//                         .care-protection-stop-1 {
//                           animation: careProtectionStop1 3s ease-in-out infinite;
//                         }
//                         .care-protection-stop-2 {
//                           animation: careProtectionStop2 3s ease-in-out infinite;
//                         }
//                       `}</style>
//                       <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
//                         <svg
//                           className="relative w-7 h-7"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                         >
//                           <defs>
//                             <linearGradient
//                               id="careProtectionGradient"
//                               x1="0"
//                               y1="0"
//                               x2="24"
//                               y2="24"
//                             >
//                               <stop
//                                 offset="0%"
//                                 className="care-protection-stop-1"
//                                 stopColor="#3B82F6"
//                               />
//                               <stop
//                                 offset="100%"
//                                 className="care-protection-stop-2"
//                                 stopColor="#1D4ED8"
//                               />
//                             </linearGradient>
//                           </defs>
//                           <path
//                             d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
//                             fill="url(#careProtectionGradient)"
//                           />
//                           <path
//                             d="M9 12l2 2 4-4"
//                             stroke="white"
//                             strokeWidth={2}
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       </span>
//                       Rentnpay Care Protection
//                       <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
//                       <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                         Covers accidental damage and breakdowns during use, plus
//                         priority customer support if anything goes wrong with
//                         your rented or purchased product.
//                       </span>
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {hasRentalItems
//                         ? 'Damage protection & priority support'
//                         : 'Buyer protection & priority support'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setIsCareProtectionEnabled((prev) => !prev)}
//                     className="text-xs text-gray-500 whitespace-nowrap self-center"
//                   >
//                     {isCareProtectionEnabled ? (
//                       <>
//                         Dont Want?{' '}
//                         <span className="font-semibold text-blue-600">
//                           Remove
//                         </span>
//                       </>
//                     ) : (
//                       <>
//                         Want it back?{' '}
//                         <span className="font-semibold text-blue-600">Add</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               ) : null}

//               {/* {appliedCoupon && (
//                 <div className="flex items-center justify-between text-green-600">
//                   <span className="flex items-center gap-1">
//                     Discount ({appliedCoupon.code})
//                     <button
//                       onClick={handleRemoveCoupon}
//                       className="text-red-400 text-xs ml-1"
//                     >
//                       Remove
//                     </button>
//                   </span>
//                   <span className="font-medium">
//                     - ₹{formatINR(appliedCoupon.discountAmount)}
//                   </span>
//                 </div>
//               )} */}

//               <div className="mt-4 rounded-xl bg-blue-50 px-3 py-3 flex items-center justify-between">
//                 <span className="font-semibold text-black">Total Payable</span>
//                 <span className="text-4xl font-bold text-blue-700">
//                   ₹{formatINR(Math.round(totalPayToday))}
//                 </span>
//               </div>

//               <div className="mt-5">
//                 {/* <p className="font-semibold text-gray-900 flex items-center gap-2">
//                   <BadgePercent className="w-4 h-4" />
//                   Rental Offers and Discounts
//                 </p> */}
//                 <p className="font-semibold text-black flex items-center gap-2">
//                   <img
//                     src={offerCartIcon.src}
//                     alt="Offers"
//                     className="w-5 h-5 shrink-0"
//                   />
//                   Offers and Discounts
//                 </p>
//                 <div className="mt-3 overflow-x-auto">
//                   <div className="flex gap-2 min-w-max">
//                     {activeCoupons.length > 0 && (
//                       <div className="mt-3 overflow-x-auto">
//                         <div className="flex gap-2 min-w-max">
//                           {activeCoupons.map((c) => {
//                             const progress = Math.min(
//                               (total / c.minOrderValue) * 100,
//                               100,
//                             );
//                             const isEligible = total >= c.minOrderValue;
//                             const remaining = c.minOrderValue - total;

//                             return (
//                               <div
//                                 key={c.code}
//                                 className="w-56 rounded-xl border border-gray-200 bg-white p-3"
//                               >
//                                 {/* Discount label */}
//                                 <p className="text-xs text-orange-600 font-medium">
//                                   {c.discountType === 'percentage'
//                                     ? `${c.discountValue}% Discount${c.maxDiscountCap ? ` Upto ₹${c.maxDiscountCap}` : ''}`
//                                     : `Flat ₹${c.discountValue} Off`}
//                                 </p>

//                                 {/* Eligible or not text */}
//                                 <p className="text-[10px] text-gray-400 mt-1">
//                                   {isEligible
//                                     ? `On items above ₹${c.minOrderValue}`
//                                     : `Add ₹${remaining} more to unlock`}{' '}
//                                   {/* 👈 dynamic hint */}
//                                 </p>

//                                 {/* Progress bar */}
//                                 <div className="mt-2 h-1.5 rounded-full bg-orange-200">
//                                   <div
//                                     className="h-1.5 rounded-full bg-orange-500 transition-all duration-300"
//                                     style={{ width: `${progress}%` }} // 👈 dynamic width
//                                   />
//                                 </div>

//                                 {/* Code + Apply button */}
//                                 <div className="mt-2 flex items-center justify-between">
//                                   <span className="text-[10px] px-2 py-0.5 rounded-full border border-orange-300 text-orange-600">
//                                     {c.code}
//                                   </span>
//                                   <button
//                                     onClick={() =>
//                                       isEligible && handleApplyCoupon(c.code)
//                                     } // 👈 eligible tabhi click
//                                     disabled={!isEligible}
//                                     className={`text-xs font-semibold transition-colors ${
//                                       isEligible
//                                         ? 'text-orange-600 cursor-pointer' // enabled — dark
//                                         : 'text-orange-300 cursor-not-allowed' // disabled — faded
//                                     }`}
//                                   >
//                                     APPLY
//                                   </button>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4">
//                 <p className="text-sm text-gray-700 mb-2">Have a Coupon?</p>
//                 {appliedCoupon ? (
//                   <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
//                     <span className="text-sm text-green-700 font-medium">
//                       {appliedCoupon.code} applied
//                     </span>
//                     <button
//                       onClick={handleRemoveCoupon}
//                       className="text-xs text-red-500 hover:underline"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         placeholder="Enter Code"
//                         value={couponCode}
//                         onChange={(e) =>
//                           setCouponCode(e.target.value.toUpperCase())
//                         }
//                         className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 text-sm"
//                       />
//                       <button
//                         onClick={() => handleApplyCoupon()}
//                         disabled={couponLoading}
//                         className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50"
//                       >
//                         {couponLoading ? '...' : 'Apply'}
//                       </button>
//                     </div>
//                     {couponError && (
//                       <p className="text-xs text-red-500 mt-1">{couponError}</p>
//                     )}
//                   </>
//                 )}
//               </div>

//               {/* <Link
//                 href="/checkout"
//                 className="mt-5 block w-full py-3 bg-[#2563EB] text-white text-center font-medium rounded-xl hover:bg-blue-700"
//               >
//                 Proceed to Checkout
//               </Link> */}
//               <button
//                 type="button"
//                 onClick={() => {
//                   try {
//                     localStorage.setItem(
//                       'rentpay_checkout_total',
//                       String(Math.round(totalPayToday)),
//                     );
//                   } catch {}
//                   router.push('/checkout');
//                 }}
//                 className="mt-5 block w-full py-3 bg-[#2563EB] text-white text-center font-medium rounded-xl hover:bg-blue-700"
//               >
//                 Proceed to Checkout
//               </button>

//               <div className="mt-3 text-xs text-gray-500 space-y-1">
//                 <p className="flex items-center justify-center gap-1 ">
//                   <Lock className="w-3 h-3 text-[#10B981]" />
//                   100% Secure Payments
//                 </p>
//                 <p className="flex items-center justify-center gap-1 ">
//                   <Shield className="w-3 h-3 text-[#2563EB]" />
//                   Deposits are Refundable
//                 </p>
//                 {/* <p>◎ Deposits are Refundable</p> */}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* {changeSlotOpen && changeSlotProduct && (
//         <BookingModal */}
//       {dateModalItem && (
//         <ChangeDailyDateModal
//           item={dateModalItem}
//           onClose={() => setDateModalItem(null)}
//           onSave={({ startDate, endDate, days, total }) => {
//             dispatch(
//               updateRentalDates({
//                 productId: dateModalItem.productId,
//                 startDate,
//                 endDate,
//                 rentalMonths: days,
//                 pricePerDay: total,
//               }),
//             );
//             setDateModalItem(null);
//           }}
//         />
//       )}

//       {changeSlotOpen && changeSlotProduct && (
//         <BookingModal
//           isOpen={changeSlotOpen}
//           product={changeSlotProduct}
//           mode="create"
//           onClose={() => {
//             setChangeSlotOpen(false);
//             setChangeSlotProduct(null);
//             setChangeSlotBookingProductId(null);
//             // Re-read updated bookings from localStorage
//             try {
//               const raw = localStorage.getItem(
//                 'rentpay_pending_service_bookings',
//               );
//               const list = raw ? JSON.parse(raw) : [];
//               setPendingServiceBookings(Array.isArray(list) ? list : []);
//             } catch {
//               setPendingServiceBookings([]);
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Cart;

// 'use client';

// import Link from 'next/link';
// import { useEffect, useMemo, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useRouter } from 'next/navigation';
// // import {
// //   removeFromCart,
// //   updateQuantity,
// //   updateTenure,
// //   syncCart,
// //   clearAppliedCoupon,
// //   setAppliedCoupon,
// // } from '../store/slices/cartSlice';
// import {
//   removeFromCart,
//   updateQuantity,
//   updateTenure,
//   updateRentalDates,
//   syncCart,
//   clearAppliedCoupon,
//   setAppliedCoupon,
// } from '../store/slices/cartSlice';
// import {
//   apiGetActiveCoupons,
//   apiGetProductById,
//   apiValidateCoupon,
//   apiGetGlobalTax,
// } from '@/lib/api';
// import { useToast } from '@/contexts/ToastContext';
// import { api } from '@/lib/axios';
// // import {
// //   Shield,
// //   Trash2,
// //   Plus,
// //   Minus,
// //   ShoppingCart,
// //   BadgePercent,
// //   AlertCircle,
// //   Lock,
// //   ChevronRight,
// //   Calendar,
// // } from 'lucide-react';
// import {
//   Shield,
//   Trash2,
//   Plus,
//   Minus,
//   ShoppingCart,
//   BadgePercent,
//   AlertCircle,
//   Lock,
//   ChevronRight,
//   ChevronLeft,
//   Calendar,
//   ShieldCheck,
// } from 'lucide-react';
// import offerCartIcon from '@/assets/icons/offer-cart.png';
// import BookingModal from '@/components/ServicePage/ServiceBookinModal';
// import { apiGetServiceById } from '@/lib/api';

// // function getDeliveryTimelineLabel(product) {
// //   const lv = product?.logisticsVerification || {};
// //   const n = Number(lv.deliveryTimelineValue);
// //   const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
// //   if (!Number.isFinite(n) || n <= 0) return '';
// //   if (unit === 'hours') {
// //     return `Delivery in ${n} hour${n === 1 ? '' : 's'}`;
// //   }
// //   return `Delivery in ${n} day${n === 1 ? '' : 's'}`;
// // }
// function getDeliveryTimelineLabel(product) {
//   const lv = product?.logisticsVerification || {};
//   const n = Number(lv.deliveryTimelineValue);
//   const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
//   if (!Number.isFinite(n) || n <= 0) return '';
//   if (unit === 'hours') {
//     return `Delivery in ${n} hour${n === 1 ? '' : 's'}`;
//   }
//   return `Delivery in ${n} day${n === 1 ? '' : 's'}`;
// }

// // ── Daily-rental date helpers (used only by the Change Date modal) ────────
// const isDailyRentalItem = (item) =>
//   String(item?.productType || 'Rental') === 'Rental' &&
//   String(item?.tenureUnit || 'month') === 'day';

// function parseLocalIso(iso) {
//   if (!iso || typeof iso !== 'string') return null;
//   const [y, mo, da] = iso.split('-').map((x) => parseInt(x, 10));
//   if (!y || !mo || !da) return null;
//   return new Date(y, mo - 1, da);
// }
// function startOfLocalDay(d) {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// }
// function addLocalDays(d, n) {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// }
// function toLocalIso(d) {
//   const x = startOfLocalDay(d);
//   const y = x.getFullYear();
//   const m = String(x.getMonth() + 1).padStart(2, '0');
//   const day = String(x.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }
// function formatRangeLine(iso) {
//   const d = parseLocalIso(iso);
//   if (!d) return '';
//   return d.toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: '2-digit',
//   });
// }
// function buildMonthGrid(year, monthIndex) {
//   const first = new Date(year, monthIndex, 1);
//   const last = new Date(year, monthIndex + 1, 0);
//   const daysInMonth = last.getDate();
//   const startWeekday = first.getDay();
//   const cells = [];
//   for (let i = 0; i < startWeekday; i++) cells.push(null);
//   for (let day = 1; day <= daysInMonth; day++) {
//     cells.push(new Date(year, monthIndex, day));
//   }
//   return cells;
// }
// function isDateInRangeInclusive(day, startIso, endIso) {
//   if (!startIso || !endIso) return false;
//   const t = startOfLocalDay(day).getTime();
//   const a = startOfLocalDay(parseLocalIso(startIso)).getTime();
//   const b = startOfLocalDay(parseLocalIso(endIso)).getTime();
//   return t >= a && t <= b;
// }
// const CART_CAL_ORANGE = '#FF7000';

// /** Right-side modal to change delivery/pickup dates for a daily-rental cart item. */
// const ChangeDailyDateModal = ({ item, onClose, onSave }) => {
//   const [startDate, setStartDate] = useState(item.startDate || '');
//   const [endDate, setEndDate] = useState(item.endDate || '');
//   const [selectingDate, setSelectingDate] = useState('start');
//   const [calendarMonth, setCalendarMonth] = useState(() => {
//     const base = item.startDate ? parseLocalIso(item.startDate) : new Date();
//     return new Date(base.getFullYear(), base.getMonth(), 1);
//   });

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, []);

//   const calendarCells = useMemo(
//     () => buildMonthGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
//     [calendarMonth],
//   );

//   const handleDayClick = (day) => {
//     const start = startOfLocalDay(day);
//     const today = startOfLocalDay(new Date());
//     if (start.getTime() < today.getTime()) return;

//     if (selectingDate === 'start') {
//       setStartDate(toLocalIso(start));
//       setEndDate((prevEnd) => {
//         if (!prevEnd) return prevEnd;
//         const e = parseLocalIso(prevEnd);
//         if (e && startOfLocalDay(e).getTime() < start.getTime()) return '';
//         return prevEnd;
//       });
//       setSelectingDate('end');
//       return;
//     }
//     const s = startDate ? parseLocalIso(startDate) : null;
//     if (s && start.getTime() < startOfLocalDay(s).getTime()) {
//       setStartDate(toLocalIso(start));
//       setEndDate('');
//       setSelectingDate('end');
//       return;
//     }
//     if (s) {
//       const minPickup = startOfLocalDay(addLocalDays(s, 2));
//       if (start.getTime() < minPickup.getTime()) {
//         return;
//       }
//     }
//     setEndDate(toLocalIso(start));
//   };

//   const chargeableStartDate = useMemo(() => {
//     if (!startDate) return '';
//     return toLocalIso(addLocalDays(parseLocalIso(startDate), 1));
//   }, [startDate]);

//   const chargeableEndDate = useMemo(() => {
//     if (!endDate) return '';
//     return toLocalIso(addLocalDays(parseLocalIso(endDate), -1));
//   }, [endDate]);

//   const selectedDays = useMemo(() => {
//     if (!startDate || !endDate) return 0;
//     const s = parseLocalIso(startDate);
//     const e = parseLocalIso(endDate);
//     if (!s || !e) return 0;
//     const diff =
//       Math.round(
//         (startOfLocalDay(e).getTime() - startOfLocalDay(s).getTime()) /
//           (1000 * 60 * 60 * 24),
//       ) + 1;
//     const fullDays = diff > 0 ? diff : 0;
//     const chargeable = fullDays - 2;
//     return chargeable > 0 ? chargeable : 0;
//   }, [startDate, endDate]);

//   const rate = Number(item.dailyRate || 0);
//   const total = rate * selectedDays;
//   const canSave = startDate && endDate && selectedDays > 0;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <div className="relative w-full max-w-md bg-white max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white z-10">
//           <h2 className="text-lg font-bold text-gray-900">Change Dates</h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-bold"
//           >
//             ✕
//           </button>
//         </div>
//         <div
//           className="flex-1 px-5 py-4 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
//           style={{ scrollbarWidth: 'none' }}
//         >
//           <div className="grid grid-cols-2 gap-2">
//             <button
//               type="button"
//               onClick={() => setSelectingDate('start')}
//               className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
//                 selectingDate === 'start'
//                   ? 'border-orange-500 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <p className="text-[10px] font-medium text-gray-500">
//                 Delivery Date
//               </p>
//               <p className="text-sm font-semibold text-gray-900">
//                 {startDate ? formatRangeLine(startDate) : 'Select'}
//               </p>
//             </button>
//             <button
//               type="button"
//               onClick={() => startDate && setSelectingDate('end')}
//               className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
//                 selectingDate === 'end'
//                   ? 'border-orange-500 bg-orange-50'
//                   : 'border-gray-200 bg-white'
//               }`}
//             >
//               <p className="text-[10px] font-medium text-gray-500">
//                 Pickup Date
//               </p>
//               <p className="text-sm font-semibold text-gray-900">
//                 {endDate ? formatRangeLine(endDate) : 'Select'}
//               </p>
//             </button>
//           </div>

//           <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
//             <div
//               className="flex items-center justify-between px-3 py-2.5 text-white"
//               style={{ backgroundColor: CART_CAL_ORANGE }}
//             >
//               <button
//                 type="button"
//                 onClick={() =>
//                   setCalendarMonth(
//                     (p) => new Date(p.getFullYear(), p.getMonth() - 1, 1),
//                   )
//                 }
//                 className="p-1 rounded-lg hover:bg-white/20"
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <span className="text-sm font-semibold">
//                 {calendarMonth.toLocaleDateString('en-IN', {
//                   month: 'long',
//                   year: 'numeric',
//                 })}
//               </span>
//               <button
//                 type="button"
//                 onClick={() =>
//                   setCalendarMonth(
//                     (p) => new Date(p.getFullYear(), p.getMonth() + 1, 1),
//                   )
//                 }
//                 className="p-1 rounded-lg hover:bg-white/20"
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="px-2 sm:px-3 pt-3 pb-2">
//               <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium text-gray-500 mb-1">
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
//                   <div key={w} className="py-1">
//                     {w}
//                   </div>
//                 ))}
//               </div>
//               <div className="grid grid-cols-7 gap-y-1 text-center">
//                 {calendarCells.map((day, idx) => {
//                   if (!day)
//                     return <div key={`e-${idx}`} className="h-9" aria-hidden />;
//                   const iso = toLocalIso(day);
//                   const today = startOfLocalDay(new Date());
//                   let disabled =
//                     startOfLocalDay(day).getTime() < today.getTime();
//                   if (!disabled && selectingDate === 'end' && startDate) {
//                     const minPickupTime = startOfLocalDay(
//                       addLocalDays(parseLocalIso(startDate), 2),
//                     ).getTime();
//                     if (startOfLocalDay(day).getTime() < minPickupTime) {
//                       disabled = true;
//                     }
//                   }
//                   const inRange = isDateInRangeInclusive(
//                     day,
//                     startDate,
//                     endDate,
//                   );
//                   return (
//                     <div
//                       key={iso}
//                       className="flex items-center justify-center p-0.5"
//                     >
//                       <button
//                         type="button"
//                         disabled={disabled}
//                         onClick={() => handleDayClick(day)}
//                         className={[
//                           'w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center',
//                           disabled
//                             ? 'text-gray-300 cursor-not-allowed bg-gray-50'
//                             : inRange
//                               ? 'text-white'
//                               : 'bg-gray-100 text-gray-800 hover:bg-orange-100',
//                         ].join(' ')}
//                         style={
//                           inRange && !disabled
//                             ? {
//                                 backgroundColor: CART_CAL_ORANGE,
//                                 opacity:
//                                   iso !== startDate && iso !== endDate
//                                     ? 0.45
//                                     : 1,
//                               }
//                             : undefined
//                         }
//                       >
//                         {day.getDate()}
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {startDate && endDate ? (
//             <div className="mt-1 rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-center gap-4 text-center">
//               <div className="shrink-0 leading-none">
//                 <span className="text-3xl font-bold text-gray-900">
//                   {String(selectedDays).padStart(2, '0')}
//                 </span>
//                 <span className="ml-1 text-xs text-gray-500 align-super">
//                   Day{selectedDays !== 1 ? 's' : ''}
//                 </span>
//               </div>
//               <div className="min-w-0 text-left">
//                 <p className="text-xs text-gray-800 font-medium">
//                   Chargeable Period:
//                 </p>
//                 {selectedDays > 0 ? (
//                   <p className="text-xs font-semibold text-gray-900 mt-0.5">
//                     {formatRangeLine(chargeableStartDate)} -{' '}
//                     {formatRangeLine(chargeableEndDate)}
//                   </p>
//                 ) : (
//                   <p className="text-[11px] text-red-600 mt-0.5">
//                     Pickup must be 2+ days after delivery.
//                   </p>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <p className="text-xs text-gray-400">
//               Select a delivery date, then a pickup date.
//             </p>
//           )}
//         </div>
//         <div className="px-5 pb-5 bg-white">
//           <button
//             type="button"
//             disabled={!canSave}
//             onClick={() =>
//               onSave({ startDate, endDate, days: selectedDays, total })
//             }
//             className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600"
//           >
//             Save Dates
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// const formatINR = (n) => Number(n || 0).toLocaleString('en-IN');

// const TAX_FIELDS = [
//   { key: 'gst', defaultKey: 'defaultGst', rateKey: 'gst', label: 'GST' },
//   {
//     key: 'careTax',
//     defaultKey: 'defaultCareTax',
//     rateKey: 'careTax',
//     label: 'Care Tax',
//   },
//   {
//     key: 'repairWarranty',
//     defaultKey: 'defaultRepairWarranty',
//     rateKey: 'repairWarranty',
//     label: 'Repair & Warranty',
//   },
//   {
//     key: 'relocationWarranty',
//     defaultKey: 'defaultRelocationWarranty',
//     rateKey: 'relocationWarranty',
//     label: 'Relocation Warranty',
//   },
//   {
//     key: 'deliveryPackaging',
//     defaultKey: 'defaultDeliveryPackaging',
//     rateKey: 'deliveryPackaging',
//     label: 'Delivery & Packaging',
//   },
//   {
//     key: 'installationFee',
//     defaultKey: 'defaultInstallationFee',
//     rateKey: 'installationFee',
//     label: 'Installation Fee',
//   },
//   {
//     key: 'platformFee',
//     defaultKey: 'defaultPlatformFee',
//     rateKey: 'platformFee',
//     label: 'Platform Fee',
//   },
// ];

// const getItemTaxRate = (item, field, globalTax, isRentalFn) => {
//   if (item.taxBlocked) return 0;
//   if (item[field.defaultKey] != null)
//     return Number(item[field.defaultKey]) / 100;
//   if (isRentalFn(item)) return (globalTax?.rental?.[field.rateKey] ?? 0) / 100;
//   //   const condition = String(item.condition || '').toLowerCase();
//   //   return condition === 'refurbished'
//   //     ? (globalTax?.buying_refurbished?.[field.rateKey] ?? 0) / 100
//   //     : (globalTax?.buying_new?.[field.rateKey] ?? 0) / 100;
//   // };
//   const condition = String(item.condition || '').toLowerCase();
//   if (condition === 'refurbished') {
//     return (globalTax?.buying_refurbished?.[field.rateKey] ?? 0) / 100;
//   }
//   if (condition === 'mint condition' || condition === 'mint') {
//     return (globalTax?.buying_mint?.[field.rateKey] ?? 0) / 100;
//   }
//   return (globalTax?.buying_new?.[field.rateKey] ?? 0) / 100;
// };

// const computeGroupBreakdown = (
//   group,
//   globalTax,
//   isCareProtectionEnabled,
//   isRentalFn,
// ) => {
//   let itemsTotal = 0;
//   let refundableDeposit = 0;
//   const fees = {
//     gst: 0,
//     careTax: 0,
//     repairWarranty: 0,
//     relocationWarranty: 0,
//     deliveryPackaging: 0,
//     installationFee: 0,
//     platformFee: 0,
//   };
//   group.forEach((item) => {
//     const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//     const price = Number(item.pricePerDay || 0);
//     const itemTotal = price * qty;
//     itemsTotal += itemTotal;
//     if (isRentalFn(item)) {
//       refundableDeposit += Number(item.refundableDeposit || 0) * qty;
//     }
//     TAX_FIELDS.forEach((field) => {
//       if (field.key === 'careTax' && !isCareProtectionEnabled) return;
//       const rate = getItemTaxRate(item, field, globalTax, isRentalFn);
//       fees[field.key] += Math.round(itemTotal * rate);
//     });
//   });
//   return { itemsTotal, refundableDeposit, fees };
// };
// const computeServiceBreakdown = (
//   booking,
//   globalTax,
//   isCareProtectionEnabled,
// ) => {
//   const tax = booking?.subCategoryTax || {};
//   const isBlocked = booking?.taxBlocked === true || tax?.taxBlocked === true;
//   const base = Number(booking?.totalAmount || 0);
//   const calc = (subKey, globalKey) => {
//     if (isBlocked) return 0;
//     const rate =
//       tax[subKey] != null
//         ? Number(tax[subKey])
//         : (globalTax?.services?.[globalKey] ?? 0);
//     return Math.round((base * rate) / 100);
//   };
//   return {
//     itemsTotal: base,
//     fees: {
//       gst: calc('defaultGst', 'gst'),
//       careTax: isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0,
//       repairWarranty: calc('defaultRepairWarranty', 'repairWarranty'),
//       relocationWarranty: calc(
//         'defaultRelocationWarranty',
//         'relocationWarranty',
//       ),
//       deliveryPackaging: calc('defaultDeliveryPackaging', 'deliveryPackaging'),
//       installationFee: calc('defaultInstallationFee', 'installationFee'),
//       platformFee: calc('defaultPlatformFee', 'platformFee'),
//     },
//   };
// };

// const CartTenureButton = ({ item, onTenureChange, offer }) => {
//   const discountPercent = Number(offer?.discountPercent || 0);
//   const hasOffer = discountPercent > 0;
//   const [open, setOpen] = useState(false);
//   const [customMonths, setCustomMonths] = useState('');

//   useEffect(() => {
//     if (open) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [open]);
//   const configs = Array.isArray(item.rentalConfigurations)
//     ? item.rentalConfigurations.filter(
//         (cfg) => Number(cfg.customerRent || cfg.pricePerDay || 0) > 0,
//       )
//     : [];

//   // Custom tenure: only for monthly configs, capped at vendor's max fixed tenure.
//   // const monthlyConfigs = configs
//   //   .filter(
//   //     (cfg) =>
//   //       !(
//   //         cfg?.periodUnit === 'day' ||
//   //         (Number(cfg?.days) > 0 && !Number(cfg?.months))
//   //       ),
//   //   )
//   //   .map((cfg) => ({
//   //     months: Number(cfg.months) || 1,
//   //     total: Number(cfg.customerRent || cfg.pricePerDay || 0),
//   //     perMonth: Math.round(
//   //       Number(cfg.customerRent || cfg.pricePerDay || 0) /
//   //         (Number(cfg.months) || 1),
//   //     ),
//   //   }))
//   //   .sort((a, b) => a.months - b.months);
//   const monthlyConfigs = configs
//     .filter(
//       (cfg) =>
//         !(
//           cfg?.periodUnit === 'day' ||
//           (Number(cfg?.days) > 0 && !Number(cfg?.months))
//         ),
//     )
//     .map((cfg) => {
//       const months = Number(cfg.months) || 1;
//       const rate = Number(cfg.customerRent || cfg.pricePerDay || 0); // per-month rate, not total
//       return {
//         months,
//         total: rate * months,
//         perMonth: rate,
//       };
//     })
//     .sort((a, b) => a.months - b.months);

//   // const maxCustomMonths = monthlyConfigs.length
//   //   ? monthlyConfigs[monthlyConfigs.length - 1].months
//   //   : 0;

//   // const customPlan = useMemo(() => {
//   //   const m = parseInt(customMonths, 10);
//   //   if (!m || m <= 0) return null;
//   //   if (maxCustomMonths && m > maxCustomMonths) return null;
//   //   if (monthlyConfigs.length < 2) return null;
//   const maxCustomMonths = monthlyConfigs.length
//     ? monthlyConfigs[monthlyConfigs.length - 1].months
//     : 0;

//   const minCustomMonths = monthlyConfigs.length ? monthlyConfigs[0].months : 0;

//   const customPlan = useMemo(() => {
//     const m = parseInt(customMonths, 10);
//     if (!m || m <= 0) return null;
//     if (minCustomMonths && m < minCustomMonths) return null;
//     if (maxCustomMonths && m > maxCustomMonths) return null;
//     if (monthlyConfigs.length < 2) return null;

//     let lower = monthlyConfigs[0];
//     let upper = monthlyConfigs[monthlyConfigs.length - 1];
//     for (let i = 0; i < monthlyConfigs.length - 1; i++) {
//       if (m >= monthlyConfigs[i].months && m <= monthlyConfigs[i + 1].months) {
//         lower = monthlyConfigs[i];
//         upper = monthlyConfigs[i + 1];
//         break;
//       }
//     }
//     if (m < monthlyConfigs[0].months) {
//       lower = monthlyConfigs[0];
//       upper = monthlyConfigs[1];
//     }
//     if (m > monthlyConfigs[monthlyConfigs.length - 1].months) {
//       lower = monthlyConfigs[monthlyConfigs.length - 2];
//       upper = monthlyConfigs[monthlyConfigs.length - 1];
//     }
//     const slope =
//       (upper.perMonth - lower.perMonth) / (upper.months - lower.months || 1);
//     const perMonth = Math.max(
//       1,
//       Math.round(lower.perMonth + slope * (m - lower.months)),
//     );
//     return { months: m, perMonth, total: perMonth * m };
//   }, [customMonths, monthlyConfigs, maxCustomMonths]);

//   const getTenureLabel = (cfg) => {
//     const isDayUnit =
//       cfg?.periodUnit === 'day' ||
//       (Number(cfg?.days) > 0 && !Number(cfg?.months));
//     if (isDayUnit) {
//       const days = Number(cfg.days) || 1;
//       return `${days} Day${days !== 1 ? 's' : ''}`;
//     }
//     const months = Number(cfg.months) || 1;
//     return `${months} Month${months !== 1 ? 's' : ''}`;
//   };

//   const getPriceSuffix = (cfg) => {
//     const isDayUnit =
//       cfg?.periodUnit === 'day' ||
//       (Number(cfg?.days) > 0 && !Number(cfg?.months));
//     return isDayUnit ? '/day' : '/mo';
//   };

//   const currentLabel = (() => {
//     const isDayItem = String(item.tenureUnit || 'month') === 'day';
//     const n = Number(item.rentalMonths || 1);
//     return isDayItem
//       ? `${n} Day${n !== 1 ? 's' : ''}`
//       : `${n} Month${n !== 1 ? 's' : ''}`;
//   })();

//   // Baseline for "Save ₹X" = the original (undiscounted) per-unit rate of
//   // the shortest tenure (configs[0]) — same logic as the product detail page.
//   const baselineConfig = configs[0];
//   const baselineIsDayUnit =
//     baselineConfig?.periodUnit === 'day' ||
//     (Number(baselineConfig?.days) > 0 && !Number(baselineConfig?.months));
//   // const baselineRawTotal = Number(
//   //   baselineConfig?.customerRent || baselineConfig?.pricePerDay || 0,
//   // );
//   // const baselineUnits = baselineIsDayUnit
//   //   ? Number(baselineConfig?.days) || 1
//   //   : Number(baselineConfig?.months) || 1;
//   // const maxPerUnit = baselineConfig
//   //   ? Math.round(baselineRawTotal / baselineUnits)
//   //   : 0;
//   // customerRent / pricePerDay is already the per-unit rate.
//   const maxPerUnit = baselineConfig
//     ? Number(baselineConfig?.customerRent || baselineConfig?.pricePerDay || 0)
//     : 0;

//   // if (configs.length <= 1) {
//   //   return (
//   //     <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
//   //       {currentLabel}
//   //     </div>
//   //   );
//   // }

//   const isDayItemFallback = String(item.tenureUnit || 'month') === 'day';

//   if (configs.length <= 1) {
//     return (
//       //     <div
//       //       className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 border-2 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 ${
//       //         isDayItemFallback ? 'sm:!border-orange-400 sm:!text-orange-600' : ''
//       //       }`}
//       //     >
//       //       {currentLabel}
//       //     </div>
//       //   );
//       // }
//       <div
//         className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 border-2 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 sm:h-7 sm:flex sm:items-center sm:justify-center ${
//           isDayItemFallback ? 'sm:!border-orange-400 sm:!text-orange-600' : ''
//         }`}
//       >
//         {currentLabel}
//       </div>
//     );
//   }

//   return (
//     <>
//       <button
//         type="button"
//         //   onClick={() => setOpen(true)}
//         //   className="flex items-center gap-0.5 sm:gap-2 px-1.5 py-0.5 sm:px-3 sm:py-1.5 border-2 border-orange-400 text-orange-600 bg-white rounded-md sm:rounded-lg text-[10px] sm:text-sm font-semibold hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap"
//         // >
//         //   <span>{currentLabel}</span>
//         //   <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
//         // </button>
//         onClick={() => setOpen(true)}
//         className="flex items-center   px-1.5 py-0.5 sm:px-2.5 sm:py-1 border-2 border-orange-400 text-orange-600 bg-white rounded-md sm:rounded-lg text-[10px] sm:text-sm font-semibold hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap sm:h-7"
//       >
//         <span>{currentLabel}</span>
//         <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
//       </button>

//       {open && (
//         <div className="fixed inset-0 z-50 flex">
//           {/* Backdrop — no click close */}
//           <div className="flex-1 bg-black/40 overflow-y-auto" />
//           {/* Modal Panel */}
//           <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
//             {/* Header */}
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
//               <h2 className="text-lg font-bold text-gray-900">Select Tenure</h2>
//               <button
//                 type="button"
//                 onClick={() => setOpen(false)}
//                 className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-xl font-bold"
//               >
//                 ✕
//               </button>
//             </div>
//             {/* Options */}
//             <div className="flex-1 px-5 py-4 space-y-3">
//               {configs.map((cfg, index) => {
//                 const isDayUnit =
//                   cfg?.periodUnit === 'day' ||
//                   (Number(cfg?.days) > 0 && !Number(cfg?.months));
//                 const units = isDayUnit
//                   ? Number(cfg.days) || 1
//                   : Number(cfg.months) || 1;

//                 // const rawTotalPrice = Number(
//                 //   cfg.customerRent || cfg.pricePerDay || 0,
//                 // );
//                 // const originalPerUnit = Math.round(rawTotalPrice / units);
//                 // const perUnit = hasOffer
//                 //   ? Math.max(
//                 //       0,
//                 //       Math.round(
//                 //         originalPerUnit -
//                 //           (originalPerUnit * discountPercent) / 100,
//                 //       ),
//                 //     )
//                 //   : originalPerUnit;
//                 // // Total is derived FROM the per-unit price (not the other way
//                 // // around) so the amount applied to the cart always matches
//                 // // exactly what was shown in this modal (perUnit × units).
//                 // const discountedTotalPrice = perUnit * units;

//                 // customerRent / pricePerDay is the PER-UNIT rate (per month
//                 // or per day), not the total tenure price.
//                 const originalPerUnit = Number(
//                   cfg.customerRent || cfg.pricePerDay || 0,
//                 );
//                 const perUnit = hasOffer
//                   ? Math.max(
//                       0,
//                       Math.round(
//                         originalPerUnit -
//                           (originalPerUnit * discountPercent) / 100,
//                       ),
//                     )
//                   : originalPerUnit;
//                 // Total is derived FROM the per-unit price (not the other way
//                 // around) so the amount applied to the cart always matches
//                 // exactly what was shown in this modal (perUnit × units).
//                 const discountedTotalPrice = perUnit * units;
//                 const saving = maxPerUnit - perUnit;
//                 const isBestValue = index === configs.length - 1;
//                 const label = getTenureLabel(cfg);
//                 const suffix = getPriceSuffix(cfg);

//                 const isSelected = (() => {
//                   const isDayItem =
//                     String(item.tenureUnit || 'month') === 'day';
//                   const n = Number(item.rentalMonths || 1);
//                   if (isDayUnit && isDayItem) return units === n;
//                   if (!isDayUnit && !isDayItem) return units === n;
//                   return false;
//                 })();

//                 return (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => {
//                       onTenureChange(cfg, perUnit, discountedTotalPrice);
//                       setOpen(false);
//                     }}
//                     className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all text-left ${
//                       isSelected
//                         ? 'border-green-500 bg-green-50'
//                         : 'border-gray-200 bg-white hover:border-orange-300'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
//                           isSelected ? 'border-green-500' : 'border-gray-300'
//                         }`}
//                       >
//                         {isSelected && (
//                           <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
//                         )}
//                       </div>
//                       <div>
//                         <p className="font-semibold text-gray-900 text-sm">
//                           {label}
//                         </p>
//                         <div className="flex gap-1 mt-0.5 flex-wrap">
//                           {saving > 0 && (
//                             <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
//                               Save ₹{saving}
//                               {suffix}
//                             </span>
//                           )}
//                           {isBestValue && (
//                             <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
//                               Best Value
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-right shrink-0">
//                       <p className="font-bold text-gray-900">
//                         ₹{formatINR(perUnit)}
//                         <span className="text-xs font-normal text-gray-500">
//                           {suffix}
//                         </span>
//                       </p>
//                       {hasOffer && originalPerUnit !== perUnit && (
//                         <p className="text-xs text-gray-400 line-through">
//                           ₹{formatINR(originalPerUnit)}
//                           {suffix}
//                         </p>
//                       )}
//                     </div>
//                   </button>
//                 );
//               })}

//               {monthlyConfigs.length > 1 && (
//                 <div className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 border-gray-200 bg-white">
//                   <div className="flex items-center gap-2">
//                     <p className="font-semibold text-gray-900 text-sm">
//                       Custom
//                     </p>
//                     {/* <input
//                       type="number"
//                       min="1"
//                       max={maxCustomMonths || undefined}
//                       placeholder="e.g. 2"
//                       value={customMonths}
//                       onChange={(e) => setCustomMonths(e.target.value)}
//                       className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
//                     />
//                     <span className="text-xs text-gray-500">
//                       months {maxCustomMonths ? `(max ${maxCustomMonths})` : ''}
//                     </span> */}
//                     <input
//                       type="number"
//                       min={minCustomMonths || 1}
//                       max={maxCustomMonths || undefined}
//                       placeholder={`e.g. ${minCustomMonths || 2}`}
//                       value={customMonths}
//                       onChange={(e) => setCustomMonths(e.target.value)}
//                       className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
//                     />
//                     {/* <span className="text-xs text-gray-500">
//                       months{' '}
//                       {minCustomMonths && maxCustomMonths
//                         ? `(${minCustomMonths}-${maxCustomMonths})`
//                         : ''}
//                     </span> */}
//                   </div>
//                   {/* <div className="text-right shrink-0 flex items-center gap-2">
//                     {customPlan ? (
//                       <>
//                         <p className="font-bold text-gray-900">
//                           ₹{formatINR(customPlan.perMonth)}
//                           <span className="text-xs font-normal text-gray-500">
//                             /mo
//                           </span>
//                         </p>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             const discountedTotal = hasOffer
//                               ? Math.max(
//                                   0,
//                                   Math.round(
//                                     customPlan.total -
//                                       (customPlan.total * discountPercent) /
//                                         100,
//                                   ),
//                                 )
//                               : customPlan.total;
//                             onTenureChange(
//                               {
//                                 periodUnit: 'month',
//                                 months: customPlan.months,
//                               },
//                               customPlan.perMonth,
//                               discountedTotal,
//                             );
//                             setOpen(false);
//                           }}
//                           className="text-xs font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600"
//                         >
//                           Apply
//                         </button>
//                       </> */}
//                   <div className="text-right shrink-0 flex items-center gap-2">
//                     {customPlan ? (
//                       <>
//                         <div>
//                           <p className="font-bold text-gray-900">
//                             ₹
//                             {formatINR(
//                               hasOffer
//                                 ? Math.max(
//                                     0,
//                                     Math.round(
//                                       customPlan.perMonth -
//                                         (customPlan.perMonth *
//                                           discountPercent) /
//                                           100,
//                                     ),
//                                   )
//                                 : customPlan.perMonth,
//                             )}
//                             <span className="text-xs font-normal text-gray-500">
//                               /mo
//                             </span>
//                           </p>
//                           {hasOffer && (
//                             <p className="text-xs text-gray-400 line-through">
//                               ₹{formatINR(customPlan.perMonth)}/mo
//                             </p>
//                           )}
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             const discountedTotal = hasOffer
//                               ? Math.max(
//                                   0,
//                                   Math.round(
//                                     customPlan.total -
//                                       (customPlan.total * discountPercent) /
//                                         100,
//                                   ),
//                                 )
//                               : customPlan.total;
//                             onTenureChange(
//                               {
//                                 periodUnit: 'month',
//                                 months: customPlan.months,
//                               },
//                               customPlan.perMonth,
//                               discountedTotal,
//                             );
//                             setOpen(false);
//                           }}
//                           className="text-xs font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600"
//                         >
//                           Apply
//                         </button>
//                       </>
//                     ) : // ) : customMonths ? (
//                     //   <p className="text-[10px] text-red-500">
//                     //     {maxCustomMonths
//                     //       ? `Max ${maxCustomMonths} months`
//                     //       : 'Invalid'}
//                     //   </p>
//                     // ) : (
//                     //   <p className="text-xs text-gray-400">Enter months</p>
//                     // )}
//                     customMonths && minCustomMonths && maxCustomMonths ? (
//                       <p className="text-[10px] text-red-500">
//                         Enter a value between {minCustomMonths} and{' '}
//                         {maxCustomMonths} months
//                       </p>
//                     ) : (
//                       <p className="text-xs text-gray-400">
//                         Enter{' '}
//                         {minCustomMonths && maxCustomMonths
//                           ? `${minCustomMonths}-${maxCustomMonths}`
//                           : ''}{' '}
//                         months
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// const Cart = () => {
//   const { items } = useSelector((s) => s.cart);
//   // const { items } = useSelector((s) => s.cart || { items: [] });
//   const { user, isAuthenticated } = useSelector((s) => s.auth);
//   const dispatch = useDispatch();
//   const [isHydrated, setIsHydrated] = useState(false);
//   const router = useRouter();

//   const { pushToast } = useToast();
//   const isRentalItem = (item) =>
//     String(item?.productType || 'Rental') === 'Rental';

//   const stockMapKey = useMemo(
//     () =>
//       items
//         .map((i) => i.productId)
//         .sort()
//         .join('_'),
//     [items],
//   );
//   const [activeCoupons, setActiveCoupons] = useState([]);
//   const [couponCode, setCouponCode] = useState('');
//   // { code, discountAmount, discountType, discountValue, finalAmount }
//   const [couponError, setCouponError] = useState('');
//   const [couponLoading, setCouponLoading] = useState(false);
//   const [stockByProductId, setStockByProductId] = useState({});
//   const [deliveryByProductId, setDeliveryByProductId] = useState({});
//   // const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(() => {
//   //   if (typeof window === 'undefined') return true;
//   //   const saved = localStorage.getItem('rentpay_care_protection_enabled');
//   //   return saved === null ? true : saved === 'true';
//   // });
//   const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(true);
//   const [globalTax, setGlobalTax] = useState(null);
//   const [isSummaryOpen, setIsSummaryOpen] = useState(false);
//   const [pendingServiceBookings, setPendingServiceBookings] = useState([]);
//   const [serviceOffer, setServiceOffer] = useState(null);
//   const [changeSlotOpen, setChangeSlotOpen] = useState(false);
//   const [changeSlotProduct, setChangeSlotProduct] = useState(null);
//   const [changeSlotLoading, setChangeSlotLoading] = useState(false);
//   const [changeSlotBookingProductId, setChangeSlotBookingProductId] =
//     useState(null);
//   const [dateModalItem, setDateModalItem] = useState(null);

//   const appliedCoupon = useSelector((s) => s.cart.appliedCoupon);
//   //  const appliedCoupon = useSelector((s) => s.cart?.appliedCoupon);

//   const sellItems = useMemo(
//     () => items.filter((i) => !isRentalItem(i)),
//     [items],
//   );
//   const dailyRentalItems = useMemo(
//     () =>
//       items.filter(
//         (i) => isRentalItem(i) && String(i.tenureUnit || 'month') === 'day',
//       ),
//     [items],
//   );
//   const monthlyRentalItems = useMemo(
//     () =>
//       items.filter(
//         (i) => isRentalItem(i) && String(i.tenureUnit || 'month') !== 'day',
//       ),
//     [items],
//   );

//   // const [openSection, setOpenSection] = useState({
//   //   buying: false,
//   //   dailyRental: false,
//   //   monthlyRental: false,
//   //   deposit: false,
//   // });
//   const [openSection, setOpenSection] = useState({
//     buying: false,
//     dailyRental: false,
//     monthlyRental: false,
//     rental: false,
//     service: false,
//     deposit: false,
//   });

//   // const serviceDiscountPercent = Number(serviceOffer?.discountPercent || 0);
//   // const hasServiceOffer = !!serviceOffer && serviceDiscountPercent > 0;

//   // const discountedServiceBooking = useMemo(() => {
//   //   if (!pendingServiceBooking) return null;
//   //   if (!hasServiceOffer) return pendingServiceBooking;
//   //   const baseAmount = Number(pendingServiceBooking.totalAmount || 0);
//   //   const discountedAmount = Math.max(
//   //     0,
//   //     Math.round(baseAmount - (baseAmount * serviceDiscountPercent) / 100),
//   //   );
//   //   return { ...pendingServiceBooking, totalAmount: discountedAmount };
//   // }, [pendingServiceBooking, hasServiceOffer, serviceDiscountPercent]);

//   // const serviceBreakdown = useMemo(
//   //   () =>
//   //     discountedServiceBooking
//   //       ? computeServiceBreakdown(
//   //           discountedServiceBooking,
//   //           globalTax,
//   //           isCareProtectionEnabled,
//   //         )
//   //       : null,
//   //   [discountedServiceBooking, globalTax, isCareProtectionEnabled],
//   // );

//   const serviceBookingsWithMeta = useMemo(
//     () =>
//       pendingServiceBookings.map((booking) => {
//         const hasOffer =
//           Number(booking.originalAmount || 0) >
//           Number(booking.totalAmount || 0);
//         const discountPercent =
//           hasOffer && booking.originalAmount > 0
//             ? Math.round(
//                 ((booking.originalAmount - booking.totalAmount) /
//                   booking.originalAmount) *
//                   100,
//               )
//             : 0;
//         const breakdown = computeServiceBreakdown(
//           booking,
//           globalTax,
//           isCareProtectionEnabled,
//         );
//         return { booking, hasOffer, discountPercent, breakdown };
//       }),
//     [pendingServiceBookings, globalTax, isCareProtectionEnabled],
//   );
//   const toggleSection = (key) =>
//     setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));

//   // const total = useMemo(() => {
//   //   return items.reduce((sum, i) => {
//   //     const qty = isDailyRentalItem(i) ? 1 : Number(i.quantity || 0);
//   //     const unitPrice = Number(i.pricePerDay || 0);
//   //     return sum + unitPrice * qty;
//   //   }, 0);
//   // }, [items]);

//   const total = useMemo(() => {
//     return items.reduce((sum, i) => {
//       const qty = isDailyRentalItem(i) ? 1 : Number(i.quantity || 0);
//       const unitPrice = Number(i.pricePerDay || 0);
//       return sum + unitPrice * qty;
//     }, 0);
//   }, [items]);

//   // Coupon must only ever consider rental items' value — buy items never
//   // count toward coupon eligibility or the discount base amount.
//   const rentalOnlyTotal = useMemo(() => {
//     return items.reduce((sum, i) => {
//       if (!isRentalItem(i)) return sum;
//       const qty = isDailyRentalItem(i) ? 1 : Number(i.quantity || 0);
//       const unitPrice = Number(i.pricePerDay || 0);
//       return sum + unitPrice * qty;
//     }, 0);
//   }, [items]);

//   // Buy-only base value (used only when a coupon's applicableOn includes 'selling')
//   const sellOnlyTotal = useMemo(() => {
//     return items.reduce((sum, i) => {
//       if (isRentalItem(i)) return sum;
//       const qty = Number(i.quantity || 0);
//       const unitPrice = Number(i.pricePerDay || 0);
//       return sum + unitPrice * qty;
//     }, 0);
//   }, [items]);

//   // Service-only base value (used only when a coupon's applicableOn includes 'services')
//   const serviceOnlyBaseTotal = useMemo(() => {
//     return pendingServiceBookings.reduce(
//       (sum, b) => sum + Number(b?.totalAmount || 0),
//       0,
//     );
//   }, [pendingServiceBookings]);

//   // Bundled so the backend can decide, per-coupon, which category totals count.
//   const categoryTotals = useMemo(
//     () => ({
//       rentals: rentalOnlyTotal,
//       selling: sellOnlyTotal,
//       services: serviceOnlyBaseTotal,
//     }),
//     [rentalOnlyTotal, sellOnlyTotal, serviceOnlyBaseTotal],
//   );

//   // If the customer removes items from the category this coupon targets
//   // (or the remaining value drops below the coupon's minimum), the coupon
//   // is no longer valid — auto-remove it so the discount never lingers
//   // against a category it was never meant for.
//   useEffect(() => {
//     if (!isHydrated) return;
//     if (!appliedCoupon) return;
//     if (!Array.isArray(appliedCoupon.applicableOn)) return;
//     const relevantTotal = appliedCoupon.applicableOn.reduce(
//       (s, cat) => s + Number(categoryTotals[cat] || 0),
//       0,
//     );
//     const minOrderValue = Number(appliedCoupon.minOrderValue || 0);
//     if (relevantTotal <= 0 || relevantTotal < minOrderValue) {
//       dispatch(clearAppliedCoupon());
//       pushToast(
//         `"${appliedCoupon.code}" removed — no longer eligible`,
//         'error',
//       );
//     }
//   }, [categoryTotals, appliedCoupon, isHydrated, dispatch, pushToast]);

//   const refundableDepositTotal = useMemo(() => {
//     return items.reduce((sum, i) => {
//       if (!isRentalItem(i)) return sum;
//       const deposit = Number(i.refundableDeposit || 0);
//       return sum + deposit * Number(i.quantity || 0);
//     }, 0);
//   }, [items]);

//   const hasRentalItems = useMemo(
//     () => items.some((i) => isRentalItem(i)),
//     [items],
//   );

//   const primaryRentalItem = useMemo(() => {
//     return items.find((i) => isRentalItem(i)) || null;
//   }, [items]);

//   const getRentalTenureLabel = (item) => {
//     const n = Number(item?.rentalMonths || 1);
//     return String(item?.tenureUnit || 'month') === 'day'
//       ? `${n} Day${n === 1 ? '' : 's'}`
//       : `${n} Month${n === 1 ? '' : 's'}`;
//   };

//   const getRentalPriceLabel = (item) => {
//     const n = Number(item?.rentalMonths || 1);
//     return String(item?.tenureUnit || 'month') === 'day'
//       ? `Rental Price `
//       : `Rental Price  `;
//   };

//   const handleTenureChange = (productId, cfg) => {
//     dispatch(
//       updateQuantity({
//         productId,
//         quantity: items.find((i) => i.productId === productId)?.quantity || 1,
//         rentalMonths: Number(cfg.months) || 1,
//         pricePerDay: Number(cfg.customerRent || cfg.pricePerDay || 0),
//       }),
//     );
//   };

//   const deliveryFee = 0;
//   // const gst = useMemo(() => {
//   //   return Math.round(total * 0.06);
//   // }, [total]);
//   // const gst = useMemo(() => {
//   //   console.log('=== GST DEBUG ===');
//   //   console.log('globalTax:', globalTax);
//   //   console.log('items:', items);
//   //   console.log('items[0].condition:', items[0]?.condition);
//   //   console.log('items[0].productType:', items[0]?.productType);
//   const gst = useMemo(() => {
//     if (!items.length) {
//       return 0;
//     }

//     // return items.reduce((sum, item) => {
//     //   const qty = Number(item.quantity || 1);
//     //   const price = Number(item.pricePerDay || 0);
//     //   const itemTotal = price * qty;

//     //   let gstRate = 0;

//     //   if (isRentalItem(item)) {
//     //     // Rental → use rental GST rate
//     //     gstRate = (globalTax.rental?.gst ?? 0) / 100;
//     //   } else {
//     //     // Sell → check product condition
//     //     const condition = String(item.condition || '').toLowerCase();
//     //     if (condition === 'refurbished') {
//     //       gstRate = (globalTax.buying_refurbished?.gst ?? 0) / 100;
//     //     } else {
//     //       // Brand New, Like New, Good, Fair → buying_new
//     //       gstRate = (globalTax.buying_new?.gst ?? 0) / 100;
//     //     }
//     //   }

//     //   return sum + Math.round(itemTotal * gstRate);
//     // }, 0);
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       if (item.taxBlocked) return sum;

//       let gstRate = 0;
//       if (item.defaultGst != null) {
//         gstRate = Number(item.defaultGst) / 100;
//       } else if (isRentalItem(item)) {
//         gstRate = (globalTax?.rental?.gst ?? 0) / 100;
//         // } else {
//         //   const condition = String(item.condition || '').toLowerCase();
//         //   gstRate =
//         //     condition === 'refurbished'
//         //       ? (globalTax?.buying_refurbished?.gst ?? 0) / 100
//         //       : (globalTax?.buying_new?.gst ?? 0) / 100;
//         // }
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           gstRate = (globalTax?.buying_refurbished?.gst ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           gstRate = (globalTax?.buying_mint?.gst ?? 0) / 100;
//         } else {
//           gstRate = (globalTax?.buying_new?.gst ?? 0) / 100;
//         }
//       }

//       return sum + Math.round(itemTotal * gstRate);
//     }, 0);
//   }, [total, items, globalTax]);

//   // const careProtection = useMemo(() => {
//   //   return items.length ? 30 : 0;
//   // }, [items.length]);
//   const careProtection = useMemo(() => {
//     console.log('=== CARE TAX DEBUG ===');
//     console.log('isCareProtectionEnabled:', isCareProtectionEnabled);
//     console.log('globalTax:', globalTax);
//     console.log('items.length:', items.length);
//     if (!isCareProtectionEnabled || !items.length) {
//       return 0;
//     }

//     // return items.reduce((sum, item) => {
//     //   const qty = Number(item.quantity || 1);
//     //   const price = Number(item.pricePerDay || 0);
//     //   const itemTotal = price * qty;

//     //   let careTaxRate = 0;

//     //   if (isRentalItem(item)) {
//     //     careTaxRate = (globalTax.rental?.careTax ?? 0) / 100;
//     //   } else {
//     //     const condition = String(item.condition || '').toLowerCase();
//     //     if (condition === 'refurbished') {
//     //       careTaxRate = (globalTax.buying_refurbished?.careTax ?? 0) / 100;
//     //     } else {
//     //       careTaxRate = (globalTax.buying_new?.careTax ?? 0) / 100;
//     //     }
//     //   }

//     //   return sum + Math.round(itemTotal * careTaxRate);
//     // }, 0);
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       if (item.taxBlocked) return sum;

//       let careTaxRate = 0;
//       if (item.defaultCareTax != null) {
//         careTaxRate = Number(item.defaultCareTax) / 100;
//       } else if (isRentalItem(item)) {
//         careTaxRate = (globalTax?.rental?.careTax ?? 0) / 100;
//         // } else {
//         //   const condition = String(item.condition || '').toLowerCase();
//         //   careTaxRate =
//         //     condition === 'refurbished'
//         //       ? (globalTax?.buying_refurbished?.careTax ?? 0) / 100
//         //       : (globalTax?.buying_new?.careTax ?? 0) / 100;
//         // }
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           careTaxRate = (globalTax?.buying_refurbished?.careTax ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           careTaxRate = (globalTax?.buying_mint?.careTax ?? 0) / 100;
//         } else {
//           careTaxRate = (globalTax?.buying_new?.careTax ?? 0) / 100;
//         }
//       }

//       return sum + Math.round(itemTotal * careTaxRate);
//     }, 0);
//   }, [items, isCareProtectionEnabled, globalTax]);

//   // const discountAmount = appliedCoupon?.discountAmount || 0;
//   const repairWarranty = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.repairWarranty ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.repairWarranty ?? 0) / 100
//       //       : (globalTax.buying_new?.repairWarranty ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultRepairWarranty != null) {
//         rate = Number(item.defaultRepairWarranty) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.repairWarranty ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100
//         //           : (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const relocationWarranty = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.repairWarranty ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const relocationWarranty = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.relocationWarranty ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.relocationWarranty ?? 0) / 100
//       //       : (globalTax.buying_new?.relocationWarranty ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultRelocationWarranty != null) {
//         rate = Number(item.defaultRelocationWarranty) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.relocationWarranty ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100
//         //           : (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const deliveryPackaging = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.relocationWarranty ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const deliveryPackaging = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.deliveryPackaging ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.deliveryPackaging ?? 0) / 100
//       //       : (globalTax.buying_new?.deliveryPackaging ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultDeliveryPackaging != null) {
//         rate = Number(item.defaultDeliveryPackaging) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.deliveryPackaging ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100
//         //           : (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);
//         // const installationFee = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.deliveryPackaging ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);
//   const installationFee = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.installationFee ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.installationFee ?? 0) / 100
//       //       : (globalTax.buying_new?.installationFee ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultInstallationFee != null) {
//         rate = Number(item.defaultInstallationFee) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.installationFee ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.installationFee ?? 0) / 100
//         //           : (globalTax?.buying_new?.installationFee ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const platformFee = useMemo(() => {
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.installationFee ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.installationFee ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.installationFee ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const platformFee = useMemo(() => {
//     if (!items.length) return 0;
//     return items.reduce((sum, item) => {
//       // const qty = Number(item.quantity || 1);
//       const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
//       const price = Number(item.pricePerDay || 0);
//       const itemTotal = price * qty;
//       let rate = 0;
//       // if (isRentalItem(item)) {
//       //   rate = (globalTax.rental?.platformFee ?? 0) / 100;
//       // } else {
//       //   const condition = String(item.condition || '').toLowerCase();
//       //   rate =
//       //     condition === 'refurbished'
//       //       ? (globalTax.buying_refurbished?.platformFee ?? 0) / 100
//       //       : (globalTax.buying_new?.platformFee ?? 0) / 100;
//       // }
//       if (item.taxBlocked) return sum;
//       if (item.defaultPlatformFee != null) {
//         rate = Number(item.defaultPlatformFee) / 100;
//       } else if (isRentalItem(item)) {
//         rate = (globalTax?.rental?.platformFee ?? 0) / 100;
//         //     } else {
//         //       const condition = String(item.condition || '').toLowerCase();
//         //       rate =
//         //         condition === 'refurbished'
//         //           ? (globalTax?.buying_refurbished?.platformFee ?? 0) / 100
//         //           : (globalTax?.buying_new?.platformFee ?? 0) / 100;
//         //     }
//         //     return sum + Math.round(itemTotal * rate);
//         //   }, 0);
//         // }, [items, globalTax]);

//         // const buyingBreakdown = useMemo(
//       } else {
//         const condition = String(item.condition || '').toLowerCase();
//         if (condition === 'refurbished') {
//           rate = (globalTax?.buying_refurbished?.platformFee ?? 0) / 100;
//         } else if (condition === 'mint condition' || condition === 'mint') {
//           rate = (globalTax?.buying_mint?.platformFee ?? 0) / 100;
//         } else {
//           rate = (globalTax?.buying_new?.platformFee ?? 0) / 100;
//         }
//       }
//       return sum + Math.round(itemTotal * rate);
//     }, 0);
//   }, [items, globalTax]);

//   const buyingBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         sellItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [sellItems, globalTax, isCareProtectionEnabled],
//   );
//   const dailyRentalBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         dailyRentalItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [dailyRentalItems, globalTax, isCareProtectionEnabled],
//   );
//   const monthlyRentalBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         monthlyRentalItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [monthlyRentalItems, globalTax, isCareProtectionEnabled],
//   );

//   const rentalItems = useMemo(
//     () => [...dailyRentalItems, ...monthlyRentalItems],
//     [dailyRentalItems, monthlyRentalItems],
//   );
//   const rentalBreakdown = useMemo(
//     () =>
//       computeGroupBreakdown(
//         rentalItems,
//         globalTax,
//         isCareProtectionEnabled,
//         isRentalItem,
//       ),
//     [rentalItems, globalTax, isCareProtectionEnabled],
//   );

//   // const discountAmount = appliedCoupon?.discountAmount || 0;
//   const discountAmount = appliedCoupon?.discountAmount || 0;
//   // const serviceBookingTotal = useMemo(
//   //   () => Number(pendingServiceBooking?.totalAmount || 0),
//   //   [pendingServiceBooking],
//   // );
//   const serviceBookingTotal = useMemo(() => {
//     return pendingServiceBookings.reduce((sum, booking) => {
//       const base = Number(booking?.totalAmount || 0);
//       if (!globalTax) return sum + base;
//       const tax = booking?.subCategoryTax || {};
//       const isBlocked =
//         booking?.taxBlocked === true || tax?.taxBlocked === true;
//       if (isBlocked) return sum + base;
//       const calc = (subKey, globalKey) => {
//         const rate =
//           tax[subKey] != null
//             ? Number(tax[subKey])
//             : (globalTax?.services?.[globalKey] ?? 0);
//         return Math.round((base * rate) / 100);
//       };
//       const feesSum =
//         calc('defaultGst', 'gst') +
//         (isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0) +
//         calc('defaultRepairWarranty', 'repairWarranty') +
//         calc('defaultRelocationWarranty', 'relocationWarranty') +
//         calc('defaultDeliveryPackaging', 'deliveryPackaging') +
//         calc('defaultInstallationFee', 'installationFee') +
//         calc('defaultPlatformFee', 'platformFee');
//       return sum + base + feesSum;
//     }, 0);
//   }, [pendingServiceBookings, globalTax, isCareProtectionEnabled]);

//   // const totalPayToday = useMemo(() => {
//   //   return (
//   //     total +
//   //     refundableDepositTotal +
//   //     deliveryFee +
//   //     gst +
//   //     careProtection -
//   //     discountAmount
//   //   );
//   // }, [
//   //   total,
//   //   refundableDepositTotal,
//   //   deliveryFee,
//   //   gst,
//   //   careProtection,
//   //   discountAmount,
//   // ]);

//   // const totalPayToday = useMemo(() => {
//   //   return (
//   //     total +
//   //     refundableDepositTotal +
//   //     deliveryFee +
//   //     gst +
//   //     careProtection +
//   //     repairWarranty +
//   //     relocationWarranty +
//   //     deliveryPackaging +
//   //     installationFee +
//   //     platformFee -
//   //     discountAmount
//   //   );
//   // }, [
//   //   total,
//   //   refundableDepositTotal,
//   //   deliveryFee,
//   //   gst,
//   //   careProtection,
//   //   repairWarranty,
//   //   relocationWarranty,
//   //   deliveryPackaging,
//   //   installationFee,
//   //   platformFee,
//   //   discountAmount,
//   // ]);

//   const totalPayToday = useMemo(() => {
//     return (
//       total +
//       refundableDepositTotal +
//       deliveryFee +
//       gst +
//       careProtection +
//       repairWarranty +
//       relocationWarranty +
//       deliveryPackaging +
//       installationFee +
//       platformFee +
//       serviceBookingTotal -
//       discountAmount
//     );
//   }, [
//     total,
//     refundableDepositTotal,
//     deliveryFee,
//     gst,
//     careProtection,
//     repairWarranty,
//     relocationWarranty,
//     deliveryPackaging,
//     installationFee,
//     platformFee,
//     serviceBookingTotal,
//     discountAmount,
//   ]);

//   const imgSrc = (src) => {
//     if (!src) return 'https://via.placeholder.com/100?text=No+Image';
//     return src.startsWith('http')
//       ? src
//       : (process.env.NEXT_PUBLIC_API_URL || '') + src;
//   };

//   useEffect(() => {
//     setIsHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!isHydrated) return;
//     const readBookings = () => {
//       try {
//         const raw = localStorage.getItem('rentpay_pending_service_bookings');
//         const list = raw ? JSON.parse(raw) : [];
//         setPendingServiceBookings(Array.isArray(list) ? list : []);
//       } catch {
//         setPendingServiceBookings([]);
//       }
//     };
//     readBookings();
//     window.addEventListener('rn_service_cart_changed', readBookings);
//     return () =>
//       window.removeEventListener('rn_service_cart_changed', readBookings);
//   }, [isHydrated]);

//   // useEffect(() => {
//   //   if (!pendingServiceBooking?.productId) {
//   //     setServiceOffer(null);
//   //     return;
//   //   }
//   //   let cancelled = false;
//   //   apiGetPublicActiveOffers()
//   //     .then((res) => {
//   //       if (cancelled) return;
//   //       const offers = res.data?.offers || [];
//   //       const match = offers.find(
//   //         (o) =>
//   //           String(o.productId?._id || o.productId) ===
//   //           String(pendingServiceBooking.productId),
//   //       );
//   //       setServiceOffer(match || null);
//   //     })
//   //     .catch(() => {
//   //       if (!cancelled) setServiceOffer(null);
//   //     });
//   //   return () => {
//   //     cancelled = true;
//   //   };
//   // }, [pendingServiceBooking?.productId]);
//   // Note: pendingServiceBooking.totalAmount is already the final, discounted
//   // price (set once by the booking modal). We must NOT re-fetch and re-apply
//   // the offer here, or the discount gets applied twice.

//   useEffect(() => {
//     localStorage.setItem(
//       'rentpay_care_protection_enabled',
//       String(isCareProtectionEnabled),
//     );
//   }, [isCareProtectionEnabled]);

//   useEffect(() => {
//     apiGetActiveCoupons()
//       .then((res) => setActiveCoupons(res.data?.data || []))
//       .catch(() => {});
//   }, []);

//   // useEffect(() => {
//   //   const fetchTax = async () => {
//   //     try {
//   //       const { apiGetGlobalTax } = await import('@/lib/api');
//   //       const res = await apiGetGlobalTax();
//   //       setGlobalTax(res.data?.data?.config || null);
//   //     } catch (e) {
//   //       console.error('Failed to load global tax', e);
//   //     }
//   //   };
//   //   fetchTax();
//   // }, []);

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
//   useEffect(() => {
//     if (!isHydrated) return;
//     dispatch(syncCart());
//   }, [dispatch, user, isAuthenticated, isHydrated]);

//   useEffect(() => {
//     let cancelled = false;
//     const ids = Array.from(new Set(items.map((i) => i.productId))).filter(
//       Boolean,
//     );
//     if (!ids.length) {
//       setStockByProductId({});
//       setDeliveryByProductId({});
//       return;
//     }

//     Promise.all(
//       ids.map((id) =>
//         apiGetProductById(id)
//           .then((res) => ({
//             id,
//             stock:
//               res.data?.product?.stock != null
//                 ? Number(res.data.product.stock)
//                 : 0,
//             deliveryLabel: getDeliveryTimelineLabel(res.data?.product),
//           }))
//           .catch(() => ({ id, stock: 0, deliveryLabel: '' })),
//       ),
//     ).then((pairs) => {
//       if (cancelled) return;
//       const nextStock = {};
//       const nextDelivery = {};
//       pairs.forEach((p) => {
//         nextStock[p.id] = p.stock;
//         nextDelivery[p.id] = p.deliveryLabel;
//       });
//       setStockByProductId(nextStock);
//       setDeliveryByProductId(nextDelivery);
//     });

//     return () => {
//       cancelled = true;
//     };
//   }, [stockMapKey]);

//   const getStockAndCheck = async (productId, nextQty) => {
//     const id = productId;
//     const res = await apiGetProductById(id);
//     const stock = res.data?.product?.stock ?? stockByProductId[id] ?? 0;
//     return {
//       ok: Number(nextQty) <= Number(stock || 0),
//       stock: Number(stock || 0),
//     };
//   };

//   const handleApplyCoupon = async (codeToApply) => {
//     const code = (codeToApply || couponCode).trim().toUpperCase();
//     if (!code) return;
//     setCouponLoading(true);
//     setCouponError('');
//     try {
//       // const res = await apiValidateCoupon({ code, orderAmount: total });
//       // const res = await apiValidateCoupon({
//       //   code,
//       //   orderAmount: rentalOnlyTotal,
//       // });
//       // const res = await apiValidateCoupon({
//       //   code,
//       //   orderAmount: rentalOnlyTotal,
//       //   category: 'Rental',
//       // });
//       const res = await apiValidateCoupon({ code, categoryTotals });
//       dispatch(setAppliedCoupon(res.data.data)); // 👈 Redux mein store
//       pushToast(
//         `"${code}" applied! ₹${res.data.data.discountAmount} saved`,
//         'success',
//       );
//     } catch (err) {
//       setCouponError(err?.response?.data?.message || 'Invalid coupon');
//       dispatch(clearAppliedCoupon());
//     } finally {
//       setCouponLoading(false);
//     }
//   };

//   const handleRemoveCoupon = () => {
//     dispatch(clearAppliedCoupon());
//     setCouponCode('');
//     setCouponError('');
//   };

//   // const removeServiceBooking = (productId) => {
//   //   setPendingServiceBookings((prev) => {
//   //     const updated = prev.filter(
//   //       (b) => String(b.productId) !== String(productId),
//   //     );
//   //     localStorage.setItem(
//   //       'rentpay_pending_service_bookings',
//   //       JSON.stringify(updated),
//   //     );
//   //     return updated;
//   //   });
//   // };
//   const removeServiceBooking = (productId) => {
//     setPendingServiceBookings((prev) => {
//       const updated = prev.filter(
//         (b) => String(b.productId) !== String(productId),
//       );
//       localStorage.setItem(
//         'rentpay_pending_service_bookings',
//         JSON.stringify(updated),
//       );

//       // Mirror the removal to the server so admin's live cart table
//       // drops this service booking too, same pattern as product cart sync.
//       const userToken =
//         typeof window !== 'undefined'
//           ? localStorage.getItem('userToken')
//           : null;
//       if (userToken) {
//         api
//           .post('/live-cart/sync-services', { bookings: updated })
//           .catch(() => {
//             // Silent fail — never disrupt the user's cart UI.
//           });
//       }

//       return updated;
//     });
//   };

//   if (!isHydrated) {
//     return <div className="w-full mx-auto px-4 py-8" />;
//   }

//   if (items.length === 0 && pendingServiceBookings.length === 0) {
//     return (
//       <div className="w-full mx-auto px-4 py-16 text-center">
//         <h1 className="text-2xl font-bold text-black mb-4">
//           Your cart is empty
//         </h1>
//         <Link
//           href="/products"
//           className="text-primary font-medium hover:underline"
//         >
//           Browse products
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#f5f7fb] min-h-[calc(100vh-64px)]">
//       <div className="max-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
//         <div className="mb-5">
//           <h1 className="text-2xl font-bold text-black flex items-center gap-2">
//             {/* <ShoppingCart className="w-7 h-7 text-blue-600" /> */}
//             Shopping Cart
//           </h1>
//           <p className="text-sm font-bold text-gray-500 mt-1">
//             {items.length + pendingServiceBookings.length} item
//             {items.length + pendingServiceBookings.length !== 1 ? 's' : ''} in
//             your cart
//           </p>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
//           <div className="xl:col-span-8 space-y-4">
//             {/* {pendingServiceBooking && (
//               <div className="p-4 bg-white border border-gray-200 rounded-2xl">
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="relative">
//                     <img
//                       src={
//                         pendingServiceBooking.image ||
//                         'https://via.placeholder.com/100?text=Service'
//                       }
//                       alt=""
//                       className="w-full sm:w-28 h-28 object-cover rounded-xl"
//                     />
//                     <span className="absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white bg-red-500">
//                       Service
//                     </span>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="font-semibold text-2xl text-black truncate">
//                       {pendingServiceBooking.serviceName}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {pendingServiceBooking.bookingDate} ·{' '}
//                       {pendingServiceBooking.timeSlot?.label}
//                     </p>
//                     <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md">
//                       <div className="rounded-xl border border-[#FFD6A8] bg-white px-3 py-2">
//                         <p className="text-3xl text-center font-semibold text-[#F97316]">
//                           ₹{formatINR(pendingServiceBooking.totalAmount)}
//                         </p>
//                         <p className="text-xs text-center text-gray-500">
//                           Service Fee
//                         </p>
//                       </div>
//                     </div>
//                     <div className="mt-3 flex items-center justify-end">
//                       <div className="inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden">
//                         <button
//                           onClick={() => {
//                             localStorage.removeItem(
//                               'rentpay_pending_service_booking',
//                             );
//                             setPendingServiceBooking(null);
//                             window.dispatchEvent(
//                               new CustomEvent('rn_service_cart_changed'),
//                             );
//                           }}
//                           className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             localStorage.removeItem(
//                               'rentpay_pending_service_booking',
//                             );
//                             setPendingServiceBooking(null);
//                             window.dispatchEvent(
//                               new CustomEvent('rn_service_cart_changed'),
//                             );
//                           }}
//                           className="px-3 h-9 flex items-center text-sm text-red-600 font-medium hover:bg-gray-50"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )} */}

//             {pendingServiceBookings.map((booking) => {
//               const hasOffer =
//                 Number(booking.originalAmount || 0) >
//                 Number(booking.totalAmount || 0);
//               return (
//                 <div
//                   key={booking.bookingId || booking.productId}
//                   //   className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
//                   // >
//                   //   <div className="flex flex-row gap-3 sm:gap-4 p-3 sm:p-4">
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
//                 >
//                   <div className="flex flex-row gap-3 sm:gap-4 p-3 sm:p-4 pb-4 sm:pb-4">
//                     {/* Image */}
//                     <div className="relative shrink-0 w-1/4 sm:w-auto">
//                       <img
//                         src={
//                           booking.image ||
//                           'https://via.placeholder.com/100?text=Service'
//                         }
//                         alt=""
//                         className="w-full sm:w-28 h-24 sm:h-28 object-cover rounded-xl"
//                       />
//                       <span className="absolute top-1 left-1 sm:top-2 sm:left-2 text-[8px] sm:text-[10px] uppercase px-1.5 py-0.5 sm:px-2 rounded-full text-white bg-[#8B5CF6] font-semibold">
//                         Service
//                       </span>
//                     </div>

//                     {/* Details */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between gap-2 sm:block">
//                         <p className="font-semibold text-sm sm:text-2xl text-black truncate">
//                           {booking.serviceName}
//                         </p>
//                         <div className="flex sm:hidden items-center gap-1 shrink-0">
//                           {/* <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border border-[#D1D5DC] rounded-md shrink-0"
//                           >
//                             <Trash2 className="w-3 h-3" />
//                           </button> */}
//                           <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-6 h-6 sm:w-6 sm:h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3 h-3 sm:w-3 sm:h-3" />
//                           </button>
//                           <button
//                             type="button"
//                             disabled={changeSlotLoading}
//                             onClick={async () => {
//                               if (changeSlotLoading) return;
//                               setChangeSlotLoading(true);
//                               try {
//                                 setChangeSlotBookingProductId(
//                                   booking.productId,
//                                 );
//                                 const res = await apiGetServiceById(
//                                   booking.productId,
//                                 );
//                                 setChangeSlotProduct(
//                                   res.data?.product || res.data,
//                                 );
//                                 setChangeSlotOpen(true);
//                               } catch {
//                                 setChangeSlotProduct(null);
//                                 setChangeSlotOpen(true);
//                               } finally {
//                                 setChangeSlotLoading(false);
//                               }
//                             }}
//                             className="flex items-center gap-0.5 px-1.5 py-1 rounded-md border-2 border-orange-400 text-orange-600 text-[9px] font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3 h-3" />
//                             {changeSlotLoading ? '...' : 'Change'}
//                           </button>
//                         </div>
//                       </div>
//                       <p className="text-sm sm:text-2xl font-bold text-[#F97316] mt-1 flex items-center gap-2 flex-wrap">
//                         ₹{formatINR(booking.totalAmount)}
//                         {hasOffer ? (
//                           <>
//                             <span className="text-xs sm:text-sm font-normal text-gray-400 line-through">
//                               ₹{formatINR(booking.originalAmount)}
//                             </span>
//                             {/* <span className="inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
//                             {serviceDiscountPercent}% Off
//                           </span> */}
//                           </>
//                         ) : null}
//                       </p>

//                       {/* Scheduled Slot row */}
//                       {/* <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-1 sm:gap-1.5 text-sm text-gray-500 flex-wrap">
//                           <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-400" />
//                           <span className="text-[10px] sm:text-xs text-gray-500">
//                             Scheduled Slot:
//                           </span>
//                           <span className="text-[10px] sm:text-xs font-semibold text-[#8B5CF6]">
//                             {booking.bookingDate} @ {booking.timeSlot?.label}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="mt-2 mb-1 hidden sm:flex justify-end">
//                         <div className="inline-flex items-center gap-2"> */}
//                       <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-1 sm:gap-1.5 text-sm text-gray-500 flex-wrap">
//                           <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-400" />
//                           <span className="text-[10px] sm:text-xs text-gray-500">
//                             Scheduled Slot:
//                           </span>
//                           <span className="text-[10px] sm:text-xs font-semibold text-[#8B5CF6]">
//                             {booking.bookingDate} @ {booking.timeSlot?.label}
//                           </span>
//                         </div>
//                         <div className="hidden sm:inline-flex items-center gap-2 shrink-0">
//                           {/* <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </button> */}
//                           .
//                           <button
//                             onClick={() =>
//                               removeServiceBooking(booking.productId)
//                             }
//                             className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                           </button>
//                           <button
//                             type="button"
//                             disabled={changeSlotLoading}
//                             onClick={async () => {
//                               if (changeSlotLoading) return;
//                               setChangeSlotLoading(true);
//                               try {
//                                 setChangeSlotBookingProductId(
//                                   booking.productId,
//                                 );
//                                 const res = await apiGetServiceById(
//                                   booking.productId,
//                                 );
//                                 setChangeSlotProduct(
//                                   res.data?.product || res.data,
//                                 );
//                                 setChangeSlotOpen(true);
//                               } catch {
//                                 setChangeSlotProduct(null);
//                                 setChangeSlotOpen(true);
//                               } finally {
//                                 setChangeSlotLoading(false);
//                               }
//                             }}
//                             //   className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
//                             // >
//                             //   <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                             //   {changeSlotLoading ? 'Loading...' : 'Change Slot'}
//                             // </button>
//                             className="flex items-center gap-1 sm:gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-xs font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
//                           >
//                             {/* <Calendar className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                             {changeSlotLoading ? 'Loading...' : 'Change Slot'}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })} */}
//                             <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                             {changeSlotLoading ? 'Loading...' : 'Change Slot'}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//             {items.map((item) => (
//               <div
//                 key={item.productId}
//                 className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl sm:rounded-2xl"
//               >
//                 <div className="flex flex-row gap-3 sm:gap-4">
//                   {/* <div className="relative">
//                     <img
//                       src={imgSrc(item.image)}
//                       alt=""
//                       className="w-full sm:w-28 h-28 object-cover rounded-xl"
//                       onError={(e) => {
//                         e.target.src = 'https://via.placeholder.com/100';
//                       }}
//                     />
//                     <span
//                       className={`absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white ${
//                         isRentalItem(item) ? 'bg-orange-500' : 'bg-blue-600'
//                       }`}
//                     >
//                       {isRentalItem(item) ? 'Rental' : 'Buy'}
//                     </span>
//                   </div> */}
//                   <div
//                     className="relative cursor-pointer shrink-0 w-1/4 sm:w-auto"
//                     onClick={() => {
//                       const isSell =
//                         String(item.productType || 'Rental') === 'Sell';
//                       router.push(
//                         isSell
//                           ? `/buy-product-details/${item.productId}`
//                           : `/rent-product-details/${item.productId}`,
//                       );
//                     }}
//                   >
//                     <img
//                       src={imgSrc(item.image)}
//                       alt=""
//                       className="w-full sm:w-28 h-24 sm:h-28 object-cover rounded-xl hover:opacity-90 transition"
//                       onError={(e) => {
//                         e.target.src = 'https://via.placeholder.com/100';
//                       }}
//                     />
//                     <span
//                       className={`absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white ${
//                         isRentalItem(item) ? 'bg-orange-500' : 'bg-blue-600'
//                       }`}
//                     >
//                       {isRentalItem(item) ? 'Rental' : 'Buy'}
//                     </span>
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-row items-center sm:items-start sm:justify-between gap-2 flex-wrap sm:flex-nowrap">
//                       <p className="font-semibold text-sm sm:text-2xl text-black truncate flex-1 min-w-0 sm:flex-initial">
//                         {item.title}
//                       </p>
//                       {/* {isRentalItem(item) ? (
//                         <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
//                           {getRentalTenureLabel(item)}
//                         </div>
//                       ) : null} */}
//                       <div
//                         className={
//                           isDailyRentalItem(item) ? 'hidden sm:block' : ''
//                         }
//                       >
//                         {isRentalItem(item) ? (
//                           Array.isArray(item.rentalConfigurations) &&
//                           item.rentalConfigurations.length > 1 ? (
//                             <CartTenureButton
//                               item={item}
//                               offer={item.offer || null}
//                               // onTenureChange={(
//                               //   selected,
//                               //   discountedPerUnit,
//                               //   discountedTotal,
//                               // ) => {
//                               //   const isDayUnit =
//                               //     selected?.periodUnit === 'day' ||
//                               //     (Number(selected?.days) > 0 &&
//                               //       !Number(selected?.months));
//                               //   dispatch(
//                               //     updateTenure({
//                               //       productId: item.productId,
//                               //       rentalMonths: isDayUnit
//                               //         ? Number(selected.days) || 1
//                               //         : Number(selected.months) || 1,
//                               //       pricePerDay: discountedTotal,
//                               //       tenureUnit: isDayUnit ? 'day' : 'month',
//                               //     }),
//                               //   );
//                               // }}
//                               onTenureChange={(
//                                 selected,
//                                 discountedPerUnit,
//                                 discountedTotal,
//                               ) => {
//                                 const isDayUnit =
//                                   selected?.periodUnit === 'day' ||
//                                   (Number(selected?.days) > 0 &&
//                                     !Number(selected?.months));
//                                 dispatch(
//                                   updateTenure({
//                                     productId: item.productId,
//                                     rentalMonths: isDayUnit
//                                       ? Number(selected.days) || 1
//                                       : Number(selected.months) || 1,
//                                     pricePerDay: isDayUnit
//                                       ? discountedTotal
//                                       : discountedPerUnit,
//                                     tenureUnit: isDayUnit ? 'day' : 'month',
//                                   }),
//                                 );
//                               }}
//                             />
//                           ) : (
//                             <div
//                               className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 border rounded-md sm:rounded-lg text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 ${
//                                 isDailyRentalItem(item)
//                                   ? 'sm:!border-orange-400 sm:!text-orange-600'
//                                   : ''
//                               }`}
//                             >
//                               {getRentalTenureLabel(item)}
//                             </div>
//                           )
//                         ) : null}
//                       </div>
//                       {isDailyRentalItem(item) ? (
//                         <div className="flex sm:hidden items-center gap-1 shrink-0">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-md shrink-0"
//                           >
//                             <Trash2 className="w-3 h-3" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setDateModalItem(item)}
//                             className="flex items-center gap-0.5 px-1.5 py-1 rounded-md border-2 border-orange-400 text-orange-600 text-[9px] font-semibold hover:bg-orange-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3 h-3" />
//                             Change
//                           </button>
//                         </div>
//                       ) : null}
//                       {/* {isRentalItem(item) && !isDailyRentalItem(item) ? (
//                         <div className="flex sm:hidden items-center border border-[#D1D5DC] rounded-md overflow-hidden shrink-0">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-5 h-5 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                           >
//                             <Trash2 className="w-2.5 h-2.5" />
//                           </button>
//                           <button
//                             onClick={() =>
//                               dispatch(
//                                 updateQuantity({
//                                   productId: item.productId,
//                                   quantity: item.quantity - 1,
//                                 }),
//                               )
//                             }
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Minus className="w-2.5 h-2.5" />
//                           </button>
//                           <span className="w-4 text-center text-[9px]">
//                             {item.quantity}
//                           </span>
//                           <button
//                             onClick={async () => {
//                               const productId = item.productId;
//                               const nextQty = item.quantity + 1;
//                               const { ok, stock } = await getStockAndCheck(
//                                 productId,
//                                 nextQty,
//                               );
//                               if (!ok) {
//                                 pushToast(
//                                   `Only ${stock} available in stock for this product.`,
//                                   'error',
//                                 );
//                                 return;
//                               }
//                               dispatch(
//                                 updateQuantity({
//                                   productId,
//                                   quantity: nextQty,
//                                 }),
//                               );
//                             }}
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Plus className="w-2.5 h-2.5" />
//                           </button>
//                         </div>
//                       ) : null} */}
//                       {!isRentalItem(item) ? (
//                         <div className="flex sm:hidden items-center border-2 border-[#D1D5DC] rounded-md overflow-hidden shrink-0">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-5 h-5 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                           >
//                             <Trash2 className="w-2.5 h-2.5" />
//                           </button>
//                           <button
//                             onClick={() =>
//                               dispatch(
//                                 updateQuantity({
//                                   productId: item.productId,
//                                   quantity: item.quantity - 1,
//                                 }),
//                               )
//                             }
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Minus className="w-2.5 h-2.5" />
//                           </button>
//                           <span className="w-4 text-center text-[9px]">
//                             {item.quantity}
//                           </span>
//                           <button
//                             onClick={async () => {
//                               const productId = item.productId;
//                               const nextQty = item.quantity + 1;
//                               const { ok, stock } = await getStockAndCheck(
//                                 productId,
//                                 nextQty,
//                               );
//                               if (!ok) {
//                                 pushToast(
//                                   `Only ${stock} available in stock for this product.`,
//                                   'error',
//                                 );
//                                 return;
//                               }
//                               dispatch(
//                                 updateQuantity({
//                                   productId,
//                                   quantity: nextQty,
//                                 }),
//                               );
//                             }}
//                             className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Plus className="w-2.5 h-2.5" />
//                           </button>
//                         </div>
//                       ) : null}
//                     </div>
//                     {/* <div
//                       className={`mt-1.5 sm:mt-3 grid ${
//                         isDailyRentalItem(item)
//                           ? 'grid-cols-3'
//                           : 'grid-cols-2 sm:grid-cols-3'
//                       } gap-1 sm:gap-2 max-w-md`}
//                     > */}
//                     <div
//                       className={`mt-1.5 sm:mt-0.5 grid ${
//                         isDailyRentalItem(item)
//                           ? 'grid-cols-3'
//                           : 'grid-cols-2 sm:grid-cols-3'
//                       } gap-1 sm:gap-2 max-w-md`}
//                     >
//                       {isDailyRentalItem(item) ? (
//                         <div className="flex sm:hidden flex-col items-center justify-center rounded-md border border-[#FFD6A8] bg-white px-1 py-0.5">
//                           <p className="text-xs font-semibold text-[#F97316] text-center leading-tight">
//                             {getRentalTenureLabel(item)}
//                           </p>
//                         </div>
//                       ) : null}
//                       {/* <div className="rounded-md sm:rounded-xl border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-3 sm:py-2">
//                         <p className="text-xs sm:text-3xl text-center font-semibold text-[#F97316]">
//                           ₹{formatINR(item.pricePerDay)}
//                         </p>
//                         <p className="text-[8px] sm:text-xs text-center text-gray-500 truncate">
//                           {isRentalItem(item)
//                             ? getRentalPriceLabel(item)
//                             : 'Sale Price'}
//                         </p>
//                       </div>
//                       {isRentalItem(item) ? (
//                         <div className="rounded-md sm:rounded-xl border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-3 sm:py-2">
//                           <p className="text-xs sm:text-3xl text-center font-semibold text-[#F97316]">
//                             ₹{formatINR(item.refundableDeposit)}
//                           </p>
//                           <p className="text-[8px] sm:text-xs text-center text-gray-500">
//                             Deposit
//                           </p>
//                         </div>
//                       ) : null} */}
//                       <div className="rounded-md sm:rounded-lg border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-2.5 sm:py-1">
//                         <p className="text-xs sm:text-xl text-center font-semibold text-[#F97316]">
//                           ₹{formatINR(item.pricePerDay)}
//                         </p>
//                         <p className="text-[8px] sm:text-xs text-center text-gray-500 truncate">
//                           {isRentalItem(item)
//                             ? getRentalPriceLabel(item)
//                             : 'Sale Price'}
//                         </p>
//                       </div>
//                       {isRentalItem(item) ? (
//                         <div className="rounded-md sm:rounded-lg border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-2.5 sm:py-1">
//                           <p className="text-xs sm:text-xl text-center font-semibold text-[#F97316]">
//                             ₹{formatINR(item.refundableDeposit)}
//                           </p>
//                           <p className="text-[8px] sm:text-xs text-center text-gray-500">
//                             Deposit
//                           </p>
//                         </div>
//                       ) : null}
//                     </div>

//                     {/* <p className="text-xs text-gray-500 mt-2">
//                       {deliveryByProductId[item.productId] ||
//                         'Delivery in 2-3 days'}
//                     </p> */}
//                     {/* {isDailyRentalItem(item) &&
//                     item.startDate &&
//                     item.endDate ? (
//                       <p className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 flex items-center gap-1 flex-wrap">
//                         <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
//                         <span>
//                           {formatRangeLine(item.startDate)}{' '}
//                           <span className="text-orange-500 font-semibold">
//                             to
//                           </span>{' '}
//                           {formatRangeLine(item.endDate)}
//                         </span>
//                       </p>
//                     ) : (
//                       <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
//                         {deliveryByProductId[item.productId] ||
//                           'Delivery in 2-3 days'}
//                       </p>
//                     )}

//                     <div className="mt-1 sm:mt-3 flex items-center justify-between gap-2">
//                       <p className="text-xs text-gray-500 mt-2"></p> */}
//                     {/* <div className="mt-1 sm:mt-3 flex items-center justify-between gap-2">
//                       {isDailyRentalItem(item) && */}
//                     <div className="mt-0.5 sm:mt-0.5 flex items-center justify-between gap-2">
//                       {isDailyRentalItem(item) &&
//                       item.startDate &&
//                       item.endDate ? (
//                         <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 flex-wrap">
//                           <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
//                           <span>
//                             {formatRangeLine(item.startDate)}{' '}
//                             <span className="text-orange-500 font-semibold">
//                               to
//                             </span>{' '}
//                             {formatRangeLine(item.endDate)}
//                           </span>
//                         </p>
//                       ) : (
//                         <p className="text-[10px] sm:text-xs text-gray-500">
//                           {deliveryByProductId[item.productId] ||
//                             'Delivery in 2-3 days'}
//                         </p>
//                       )}
//                       {/*
//                       <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
//                         <button
//                           onClick={() =>
//                             dispatch(removeFromCart(item.productId))
//                           }
//                           className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() =>
//                             dispatch(
//                               updateQuantity({
//                                 productId: item.productId,
//                                 quantity: item.quantity - 1,
//                               }),
//                             )
//                           }
//                           className="w-9 h-9 inline-flex items-center justify-center hover:bg-gray-50"
//                         >
//                           <Minus className="w-4 h-4" />
//                         </button>
//                         <span className="w-10 text-center text-sm">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={async () => {
//                             const productId = item.productId;
//                             const nextQty = item.quantity + 1;
//                             const { ok, stock } = await getStockAndCheck(
//                               productId,
//                               nextQty,
//                             );
//                             if (!ok) {
//                               pushToast(
//                                 `Only ${stock} available in stock for this product.`,
//                                 'error',
//                               );
//                               return;
//                             }
//                             dispatch(
//                               updateQuantity({
//                                 productId,
//                                 quantity: nextQty,
//                               }),
//                             );
//                           }}
//                           className="w-9 h-9 inline-flex items-center justify-center hover:bg-gray-50"
//                         >
//                           <Plus className="w-4 h-4" />
//                         </button>
//                       </div> */}
//                       {/* <div className="inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden">

//                         <button
//                           onClick={() =>
//                             dispatch(removeFromCart(item.productId))
//                           }
//                           className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>

//                         <button
//                           onClick={() =>
//                             dispatch(
//                               updateQuantity({
//                                 productId: item.productId,
//                                 quantity: item.quantity - 1,
//                               }),
//                             )
//                           }
//                           className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 "
//                         >
//                           <Minus className="w-4 h-4" />
//                         </button>

//                         <span className="w-10 text-center text-sm ">
//                           {item.quantity}
//                         </span>

//                         <button
//                           onClick={async () => {
//                             const productId = item.productId;
//                             const nextQty = item.quantity + 1;
//                             const { ok, stock } = await getStockAndCheck(
//                               productId,
//                               nextQty,
//                             );

//                             if (!ok) {
//                               pushToast(
//                                 `Only ${stock} available in stock for this product.`,
//                                 'error',
//                               );
//                               return;
//                             }

//                             dispatch(
//                               updateQuantity({
//                                 productId,
//                                 quantity: nextQty,
//                               }),
//                             );
//                           }}
//                           className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
//                         >
//                           <Plus className="w-4 h-4" />
//                         </button>
//                       </div> */}
//                       {/* {isDailyRentalItem(item) ? (
//                         <div className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setDateModalItem(item)}
//                             className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-sm font-semibold hover:bg-orange-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                             Change Date
//                           </button>
//                         </div>
//                       ) : ( */}
//                       {isDailyRentalItem(item) ? (
//                         <div className="hidden sm:inline-flex items-center gap-1.5 sm:gap-1.5">
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setDateModalItem(item)}
//                             className="flex items-center gap-1 sm:gap-1 px-2  py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-xs font-semibold hover:bg-orange-50 whitespace-nowrap"
//                           >
//                             <Calendar className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
//                             Change Date
//                           </button>
//                         </div>
//                       ) : (
//                         // <div className="hidden sm:inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden shrink-0">
//                         // <div
//                         //   className={`${
//                         //     !isRentalItem(item)
//                         //       ? 'hidden sm:inline-flex'
//                         //       : 'inline-flex'
//                         //   } items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden shrink-0`}
//                         // >
//                         //   {/* Trash */}
//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(removeFromCart(item.productId))
//                         //     }
//                         //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         //   >
//                         //     <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   {/* Minus */}
//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId: item.productId,
//                         //           quantity: item.quantity - 1,
//                         //         }),
//                         //       )
//                         //     }
//                         //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 "
//                         //   >
//                         //     <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   {/* Quantity */}
//                         //   <span className="w-7 sm:w-10 text-center text-xs sm:text-sm ">
//                         //     {item.quantity}
//                         //   </span>

//                         //   {/* Plus */}
//                         //   <button
//                         //     onClick={async () => {
//                         //       const productId = item.productId;
//                         //       const nextQty = item.quantity + 1;
//                         //       const { ok, stock } = await getStockAndCheck(
//                         //         productId,
//                         //         nextQty,
//                         //       );

//                         //       if (!ok) {
//                         //         pushToast(
//                         //           `Only ${stock} available in stock for this product.`,
//                         //           'error',
//                         //         );
//                         //         return;
//                         //       }

//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId,
//                         //           quantity: nextQty,
//                         //         }),
//                         //       );
//                         //     }}
//                         //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50"
//                         //   >
//                         //     <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         //   </button>
//                         // </div>
//                         // <div
//                         //   className={`${
//                         //     !isRentalItem(item)
//                         //       ? 'hidden sm:inline-flex'
//                         //       : 'inline-flex'
//                         //   } items-center border sm:border-2 border-[#D1D5DC] rounded-md sm:rounded-lg overflow-hidden shrink-0`}
//                         // >

//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(removeFromCart(item.productId))
//                         //     }
//                         //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                         //   >
//                         //     <Trash2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   <button
//                         //     onClick={() =>
//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId: item.productId,
//                         //           quantity: item.quantity - 1,
//                         //         }),
//                         //       )
//                         //     }
//                         //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 "
//                         //   >
//                         //     <Minus className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
//                         //   </button>

//                         //   <span className="w-4 sm:w-10 text-center text-[9px] sm:text-sm ">
//                         //     {item.quantity}
//                         //   </span>

//                         //   <button
//                         //     onClick={async () => {
//                         //       const productId = item.productId;
//                         //       const nextQty = item.quantity + 1;
//                         //       const { ok, stock } = await getStockAndCheck(
//                         //         productId,
//                         //         nextQty,
//                         //       );

//                         //       if (!ok) {
//                         //         pushToast(
//                         //           `Only ${stock} available in stock for this product.`,
//                         //           'error',
//                         //         );
//                         //         return;
//                         //       }

//                         //       dispatch(
//                         //         updateQuantity({
//                         //           productId,
//                         //           quantity: nextQty,
//                         //         }),
//                         //       );
//                         //     }}
//                         //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50"
//                         //   >
//                         //     <Plus className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
//                         //   </button>
//                         // </div>
//                         <div
//                           className={`${
//                             !isRentalItem(item)
//                               ? 'hidden sm:inline-flex'
//                               : 'inline-flex'
//                           } items-center border sm:border-2 border-[#D1D5DC] rounded-md sm:rounded-lg overflow-hidden shrink-0`}
//                         >
//                           {/* Trash */}
//                           <button
//                             onClick={() =>
//                               dispatch(removeFromCart(item.productId))
//                             }
//                             className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
//                           >
//                             <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                           </button>

//                           {/* Minus */}
//                           <button
//                             onClick={() =>
//                               dispatch(
//                                 updateQuantity({
//                                   productId: item.productId,
//                                   quantity: item.quantity - 1,
//                                 }),
//                               )
//                             }
//                             className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-50 "
//                           >
//                             <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                           </button>

//                           {/* Quantity */}
//                           <span className="w-4 sm:w-7 text-center text-[9px] sm:text-xs ">
//                             {item.quantity}
//                           </span>

//                           {/* Plus */}
//                           <button
//                             onClick={async () => {
//                               const productId = item.productId;
//                               const nextQty = item.quantity + 1;
//                               const { ok, stock } = await getStockAndCheck(
//                                 productId,
//                                 nextQty,
//                               );

//                               if (!ok) {
//                                 pushToast(
//                                   `Only ${stock} available in stock for this product.`,
//                                   'error',
//                                 );
//                                 return;
//                               }

//                               dispatch(
//                                 updateQuantity({
//                                   productId,
//                                   quantity: nextQty,
//                                 }),
//                               );
//                             }}
//                             className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-50"
//                           >
//                             <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//                           </button>
//                         </div>
//                       )}
//                     </div>

//                     {/* <p className="text-xs text-gray-500 mt-2">
//                       Available stock: {stockByProductId[item.productId] ?? '—'}
//                     </p> */}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="xl:col-span-4">
//             <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-5 sticky top-24">
//               {/* <button
//                 type="button"
//                 onClick={() => setIsSummaryOpen((p) => !p)}
//                 className="w-full flex items-center justify-between mb-4"
//               >
//                 <h2 className="text-2xl font-semibold text-black">
//                   Order Summary
//                 </h2>
//                 <ChevronRight
//                   className={`w-5 h-5 text-gray-500 transition-transform ${isSummaryOpen ? 'rotate-90' : ''}`}
//                 />
//               </button>
//               <div
//                 className={`space-y-3 text-sm overflow-hidden transition-all duration-300 ${isSummaryOpen ? 'max-h-[1200px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}
//               > */}

//               <h2 className="text-xl font-semibold text-black mb-4">
//                 Order Summary
//               </h2>
//               <div className="space-y-3 text-sm mb-4">
//                 {/* {pendingServiceBooking && (
//                   <div className="border border-orange-100 bg-orange-50 rounded-xl p-3">
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium text-gray-800">
//                         Service Summary
//                       </span>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           localStorage.removeItem(
//                             'rentpay_pending_service_booking',
//                           );
//                           setPendingServiceBooking(null);
//                         }}
//                         className="text-xs text-red-500 hover:underline"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                     <div className="mt-2 flex items-center gap-3">
//                       {pendingServiceBooking.image ? (
//                         <img
//                           src={pendingServiceBooking.image}
//                           alt=""
//                           className="w-14 h-14 rounded-lg object-cover"
//                         />
//                       ) : null}
//                       <div className="min-w-0 flex-1">
//                         <p className="text-sm font-semibold text-gray-900 truncate">
//                           {pendingServiceBooking.serviceName}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-0.5">
//                           {pendingServiceBooking.bookingDate} ·{' '}
//                           {pendingServiceBooking.timeSlot?.label}
//                         </p>
//                       </div>
//                       <span className="font-medium text-gray-900 shrink-0">
//                         ₹{formatINR(serviceBookingTotal)}
//                       </span>
//                     </div>
//                   </div>
//                 )} */}
//                 {[
//                   {
//                     key: 'buying',
//                     title: `Buying Summary (${sellItems.length} item${sellItems.length === 1 ? '' : 's'})`,
//                     items: sellItems,
//                     breakdown: buyingBreakdown,
//                     show: sellItems.length > 0,
//                   },
//                   // {
//                   //   key: 'rental',
//                   //   title: `Rental Summary (${rentalItems.length} item${rentalItems.length === 1 ? '' : 's'})`,
//                   //   items: rentalItems,
//                   //   breakdown: rentalBreakdown,
//                   //   show: rentalItems.length > 0,
//                   // },
//                   {
//                     key: 'rental',
//                     title: `Rental Summary (${rentalItems.length} item${rentalItems.length === 1 ? '' : 's'})`,
//                     items: rentalItems,
//                     breakdown: rentalBreakdown,
//                     show: rentalItems.length > 0,
//                     showAllTaxes: true,
//                   },
//                   // ]
//                   //   .filter((g) => g.show)
//                   //   .map((group) => (
//                 ]
//                   .concat(
//                     pendingServiceBookings.length > 0
//                       ? [
//                           {
//                             key: 'service',
//                             title: `Service Summary (${pendingServiceBookings.length} item${pendingServiceBookings.length === 1 ? '' : 's'})`,
//                             isService: true,
//                             breakdown: {
//                               itemsTotal: serviceBookingsWithMeta.reduce(
//                                 (s, m) => s + m.breakdown.itemsTotal,
//                                 0,
//                               ),
//                               fees: serviceBookingsWithMeta.reduce((acc, m) => {
//                                 Object.keys(m.breakdown.fees).forEach((k) => {
//                                   acc[k] = (acc[k] || 0) + m.breakdown.fees[k];
//                                 });
//                                 return acc;
//                               }, {}),
//                             },
//                             show: true,
//                           },
//                         ]
//                       : [],
//                   )
//                   .filter((g) => g.show)
//                   .map((group) => (
//                     <div
//                       key={group.key}
//                       className="border border-gray-100 rounded-xl"
//                     >
//                       <button
//                         type="button"
//                         onClick={() => toggleSection(group.key)}
//                         className="w-full flex items-center justify-between px-3 py-2"
//                       >
//                         <span className="font-medium text-gray-800">
//                           {group.title}
//                         </span>
//                         {/* <div className="flex items-center gap-2">
//                           <span className="font-medium text-gray-900">
//                             ₹{formatINR(Math.round(group.breakdown.itemsTotal))}
//                           </span>
//                           <ChevronRight
//                             className={`w-4 h-4 text-gray-500 transition-transform ${openSection[group.key] ? 'rotate-90' : ''}`}
//                           />
//                         </div> */}
//                         <div className="flex items-center gap-2">
//                           <span className="font-medium text-gray-900">
//                             ₹
//                             {formatINR(
//                               Math.round(
//                                 group.breakdown.itemsTotal +
//                                   Object.values(group.breakdown.fees).reduce(
//                                     (s, v) => s + v,
//                                     0,
//                                   ),
//                               ),
//                             )}
//                           </span>
//                           <ChevronRight
//                             className={`w-4 h-4 text-gray-500 transition-transform ${openSection[group.key] ? 'rotate-90' : ''}`}
//                           />
//                         </div>
//                       </button>
//                       {openSection[group.key] && (
//                         <div className="px-3 pb-3 space-y-1.5">
//                           {group.isService ? (
//                             // <div className="text-xs text-gray-500 flex items-center justify-between">
//                             //   <span className="truncate pr-2">
//                             //     {pendingServiceBooking.serviceName} (
//                             //     {pendingServiceBooking.bookingDate} ·{' '}
//                             //     {pendingServiceBooking.timeSlot?.label})
//                             //   </span>
//                             //   <div className="flex items-center gap-2">
//                             //     <span>
//                             //       ₹{formatINR(group.breakdown.itemsTotal)}
//                             //     </span>
//                             //     <button
//                             //       onClick={() => {
//                             //         localStorage.removeItem(
//                             //           'rentpay_pending_service_booking',
//                             //         );
//                             //         setPendingServiceBooking(null);
//                             //       }}
//                             //       className="text-[10px] text-red-500 hover:underline"
//                             //     >
//                             //       Remove
//                             //     </button>
//                             //   </div>
//                             // </div>
//                             // <div className="text-xs text-gray-500 flex items-center justify-between">
//                             //   <span className="truncate pr-2">
//                             //     {pendingServiceBooking.serviceName} (
//                             //     {pendingServiceBooking.bookingDate} ·{' '}
//                             //     {pendingServiceBooking.timeSlot?.label})
//                             //   </span>
//                             //   <span className="flex items-center gap-1.5 shrink-0">
//                             <div className="space-y-1">
//                               {serviceBookingsWithMeta.map((m) => (
//                                 <div
//                                   key={
//                                     m.booking.bookingId || m.booking.productId
//                                   }
//                                   className="text-xs text-gray-600 flex items-center justify-between"
//                                 >
//                                   <span className="truncate pr-2 flex items-center gap-1">
//                                     <span className="shrink-0">•</span>
//                                     {m.booking.serviceName} (
//                                     {m.booking.bookingDate})
//                                   </span>
//                                   <span className="flex items-center gap-1.5 shrink-0">
//                                     {m.hasOffer ? (
//                                       <span className="text-gray-400 line-through">
//                                         ₹{formatINR(m.booking.originalAmount)}
//                                       </span>
//                                     ) : null}
//                                     <span>
//                                       ₹{formatINR(m.breakdown.itemsTotal)}
//                                     </span>
//                                   </span>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             // ) : (
//                             //   group.items.map((it) => (
//                             //     <div
//                             //       key={it.productId}
//                             //       className="text-xs text-gray-500 flex items-center justify-between"
//                             //     >
//                             //       <span className="truncate pr-2">
//                             //         {it.title}
//                             //       </span>
//                             //       <span>
//                             //         {isDailyRentalItem(it)
//                             //           ? `₹${formatINR(it.pricePerDay)}`
//                             //           : `₹${formatINR(it.pricePerDay)} × ${it.quantity}`}
//                             //       </span>
//                             //     </div>
//                             //   ))
//                             // )}
//                             // <div className="pt-1 mt-1 border-t border-gray-100 space-y-1">
//                             //   {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
//                             //     (field) =>
//                             //       group.breakdown.fees[field.key] > 0 ? (
//                             //         <div
//                             //           key={field.key}
//                             //           className="flex items-center justify-between"
//                             //         >
//                             //           <span className="text-gray-600">
//                             //             {field.label}
//                             //           </span>
//                             //           <span className="font-medium">
//                             //             ₹
//                             //             {formatINR(
//                             //               group.breakdown.fees[field.key],
//                             //             )}
//                             //           </span>
//                             //         </div>
//                             //       ) : null,
//                             //   )}
//                             //   {group.breakdown.fees.careTax > 0 && (
//                             //     <div className="flex items-center justify-between">
//                             //       <span className="text-gray-600">Care Tax</span>
//                             //       <span className="font-medium">
//                             //         ₹{formatINR(group.breakdown.fees.careTax)}
//                             //       </span>
//                             //     </div>
//                             //   )}
//                             // </div>

//                             group.items.map((it) => (
//                               <div
//                                 key={it.productId}
//                                 className="text-xs text-gray-600 flex items-center justify-between"
//                               >
//                                 <span className="truncate pr-2 flex items-center gap-1">
//                                   <span className="shrink-0">•</span>
//                                   {it.title}
//                                 </span>
//                                 <span>
//                                   {isDailyRentalItem(it)
//                                     ? `₹${formatINR(it.pricePerDay)}`
//                                     : `₹${formatINR(it.pricePerDay)} × ${it.quantity}`}
//                                 </span>
//                               </div>
//                             ))
//                           )}
//                           {/* <div className="pt-1 mt-1 border-t border-gray-100 space-y-1 text-xs">
//                             {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
//                               (field) =>
//                                 group.breakdown.fees[field.key] > 0 ? (
//                                   <div
//                                     key={field.key}
//                                     className="flex items-center justify-between"
//                                   >
//                                     <span className="text-gray-600">
//                                       {field.label}
//                                     </span>
//                                     <span className="font-medium">
//                                       ₹
//                                       {formatINR(
//                                         group.breakdown.fees[field.key],
//                                       )}
//                                     </span>
//                                   </div>
//                                 ) : null,
//                             )}
//                             {group.breakdown.fees.careTax > 0 && (
//                               <div className="flex items-center justify-between">
//                                 <span className="text-gray-600">Care Tax</span>
//                                 <span className="font-medium">
//                                   ₹{formatINR(group.breakdown.fees.careTax)}
//                                 </span>
//                               </div>
//                             )}
//                           </div> */}
//                           <div className="pt-1 mt-1 border-t border-gray-100 space-y-1 text-xs">
//                             {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
//                               (field) =>
//                                 group.breakdown.fees[field.key] > 0 ||
//                                 group.showAllTaxes ? (
//                                   <div
//                                     key={field.key}
//                                     className="flex items-center justify-between"
//                                   >
//                                     <span className="text-gray-600">
//                                       {field.label}
//                                     </span>
//                                     <span className="font-medium">
//                                       ₹
//                                       {formatINR(
//                                         group.breakdown.fees[field.key],
//                                       )}
//                                     </span>
//                                   </div>
//                                 ) : null,
//                             )}
//                             {/* {(group.breakdown.fees.careTax > 0 ||
//                               group.showAllTaxes) && (
//                               <div className="flex items-center justify-between">
//                                 <span className="text-gray-600">Care Tax</span>
//                                 <span className="font-medium">
//                                   ₹{formatINR(group.breakdown.fees.careTax)}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))} */}
//                             {(group.breakdown.fees.careTax > 0 ||
//                               group.showAllTaxes) && (
//                               <div className="flex items-center justify-between">
//                                 <span className="text-gray-600">Care Tax</span>
//                                 <span className="font-medium">
//                                   ₹{formatINR(group.breakdown.fees.careTax)}
//                                 </span>
//                               </div>
//                             )}
//                             {appliedCoupon &&
//                               discountAmount > 0 &&
//                               Array.isArray(appliedCoupon.applicableOn) &&
//                               ((group.key === 'rental' &&
//                                 appliedCoupon.applicableOn.includes(
//                                   'rentals',
//                                 )) ||
//                                 (group.key === 'buying' &&
//                                   appliedCoupon.applicableOn.includes(
//                                     'selling',
//                                   )) ||
//                                 (group.key === 'service' &&
//                                   appliedCoupon.applicableOn.includes(
//                                     'services',
//                                   ))) && (
//                                 <div className="flex items-center justify-between text-green-600">
//                                   <span>Coupon ({appliedCoupon.code})</span>
//                                   <span className="font-medium">
//                                     − ₹{formatINR(discountAmount)}
//                                   </span>
//                                 </div>
//                               )}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                 {refundableDepositTotal > 0 && (
//                   <div className="border border-gray-100 rounded-xl">
//                     <button
//                       type="button"
//                       onClick={() => toggleSection('deposit')}
//                       className="w-full flex items-center justify-between px-3 py-2"
//                     >
//                       <span className="font-medium text-gray-800 flex items-center gap-1 relative group">
//                         Refundable Deposits
//                         <AlertCircle className="w-4 h-4 text-gray-400 cursor-pointer peer" />
//                         <span className="pointer-events-none absolute left-0 top-full mt-1 w-56 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                           This deposit is fully refundable. It is returned once
//                           the rented product is collected back in good
//                           condition, with no damage or missing accessories.
//                         </span>
//                       </span>
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium text-gray-900">
//                           ₹{formatINR(Math.round(refundableDepositTotal))}
//                         </span>
//                         <ChevronRight
//                           className={`w-4 h-4 text-gray-500 transition-transform ${openSection.deposit ? 'rotate-90' : ''}`}
//                         />
//                       </div>
//                     </button>
//                     {openSection.deposit && (
//                       <div className="px-3 pb-3 space-y-1.5">
//                         {items
//                           .filter((i) => isRentalItem(i))
//                           .map((it) => (
//                             <div
//                               key={it.productId}
//                               className="text-xs text-gray-600 flex items-center justify-between"
//                             >
//                               <span className="truncate pr-2">
//                                 {it.title}{' '}
//                                 <span className="text-gray-400">
//                                   (
//                                   {String(it.tenureUnit || 'month') === 'day'
//                                     ? 'Daily'
//                                     : 'Monthly'}
//                                   )
//                                 </span>
//                               </span>
//                               <span className="font-medium">
//                                 ₹
//                                 {formatINR(
//                                   Number(it.refundableDeposit || 0) *
//                                     Number(it.quantity || 1),
//                                 )}
//                               </span>
//                             </div>
//                           ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* {(hasRentalItems || items.some((i) => !isRentalItem(i))) &&
//               isCareProtectionEnabled &&
//               careProtection > 0 ? ( */}
//               {/* {isCareProtectionEnabled &&
//               (careProtection > 0 ||
//                 (pendingServiceBooking &&
//                   serviceBreakdown?.fees?.careTax > 0)) &&
//               (items.length > 0 || pendingServiceBooking) ? (
//                 <div className="mt-4 rounded-xl border-2 border-[#BEDBFF] bg-blue-50 px-4 py-4">
//                   <div className="flex-1">
//                     <p className="text-sm font-semibold text-black flex items-center gap-1.5 relative group">
//                       <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
//                       Rentnpay Care Protection
//                       <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
//                       <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                         Covers accidental damage and breakdowns during use, plus
//                         priority customer support if anything goes wrong with
//                         your rented or purchased product.
//                       </span>
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {hasRentalItems
//                         ? 'Damage protection & priority support'
//                         : 'Buyer protection & priority support'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setIsCareProtectionEnabled(false)}
//                     className="text-xs text-gray-500 whitespace-nowrap self-center"
//                   >
//                     Dont Want? <span className="text-blue-600">Remove</span>
//                   </button>
//                 </div>
//               ) : null} */}

//               {items.length > 0 || pendingServiceBookings.length > 0 ? (
//                 <div className="mt-4 rounded-xl border-2 border-[#BEDBFF] bg-blue-50 px-4 py-4">
//                   <div className="flex-1">
//                     {/* <p className="text-sm font-semibold text-black flex items-center gap-1.5 relative group">
//                       <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
//                       Rentnpay Care Protection
//                       <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
//                       <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                         Covers accidental damage and breakdowns during use, plus
//                         priority customer support if anything goes wrong with
//                         your rented or purchased product.
//                       </span>
//                     </p> */}
//                     <p className="text-sm font-semibold text-black flex items-center gap-0.5 relative group">
//                       <style>{`
//                         @keyframes careProtectionStop1 {
//                           0%, 100% { stop-color: #3B82F6; }
//                           50% { stop-color: #1D4ED8; }
//                         }
//                         @keyframes careProtectionStop2 {
//                           0%, 100% { stop-color: #1D4ED8; }
//                           50% { stop-color: #3B82F6; }
//                         }
//                         .care-protection-stop-1 {
//                           animation: careProtectionStop1 3s ease-in-out infinite;
//                         }
//                         .care-protection-stop-2 {
//                           animation: careProtectionStop2 3s ease-in-out infinite;
//                         }
//                       `}</style>
//                       <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
//                         <svg
//                           className="relative w-7 h-7"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                         >
//                           <defs>
//                             <linearGradient
//                               id="careProtectionGradient"
//                               x1="0"
//                               y1="0"
//                               x2="24"
//                               y2="24"
//                             >
//                               <stop
//                                 offset="0%"
//                                 className="care-protection-stop-1"
//                                 stopColor="#3B82F6"
//                               />
//                               <stop
//                                 offset="100%"
//                                 className="care-protection-stop-2"
//                                 stopColor="#1D4ED8"
//                               />
//                             </linearGradient>
//                           </defs>
//                           <path
//                             d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
//                             fill="url(#careProtectionGradient)"
//                           />
//                           <path
//                             d="M9 12l2 2 4-4"
//                             stroke="white"
//                             strokeWidth={2}
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       </span>
//                       Rentnpay Care Protection
//                       <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
//                       <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
//                         Covers accidental damage and breakdowns during use, plus
//                         priority customer support if anything goes wrong with
//                         your rented or purchased product.
//                       </span>
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {hasRentalItems
//                         ? 'Damage protection & priority support'
//                         : 'Buyer protection & priority support'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setIsCareProtectionEnabled((prev) => !prev)}
//                     className="text-xs text-gray-500 whitespace-nowrap self-center"
//                   >
//                     {isCareProtectionEnabled ? (
//                       <>
//                         Dont Want?{' '}
//                         <span className="font-semibold text-blue-600">
//                           Remove
//                         </span>
//                       </>
//                     ) : (
//                       <>
//                         Want it back?{' '}
//                         <span className="font-semibold text-blue-600">Add</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               ) : null}

//               {/* {appliedCoupon && (
//                 <div className="flex items-center justify-between text-green-600">
//                   <span className="flex items-center gap-1">
//                     Discount ({appliedCoupon.code})
//                     <button
//                       onClick={handleRemoveCoupon}
//                       className="text-red-400 text-xs ml-1"
//                     >
//                       Remove
//                     </button>
//                   </span>
//                   <span className="font-medium">
//                     - ₹{formatINR(appliedCoupon.discountAmount)}
//                   </span>
//                 </div>
//               )} */}

//               <div className="mt-4 rounded-xl bg-blue-50 px-3 py-3 flex items-center justify-between">
//                 <span className="font-semibold text-black">Total Payable</span>
//                 <span className="text-4xl font-bold text-blue-700">
//                   ₹{formatINR(Math.round(totalPayToday))}
//                 </span>
//               </div>

//               <div className="mt-5">
//                 {/* <p className="font-semibold text-gray-900 flex items-center gap-2">
//                   <BadgePercent className="w-4 h-4" />
//                   Rental Offers and Discounts
//                 </p> */}
//                 <p className="font-semibold text-black flex items-center gap-1">
//                   <img
//                     src={offerCartIcon.src}
//                     alt="Offers"
//                     className="w-5 h-5 shrink-0"
//                   />
//                   Offers and Discounts
//                 </p>
//                 <div className="mt-3 overflow-x-auto">
//                   <div className="flex gap-2 min-w-max">
//                     {activeCoupons.length > 0 && (
//                       <div className="mt-3 overflow-x-auto">
//                         <div className="flex gap-2 min-w-max">
//                           {/* {activeCoupons.map((c) => {
//                             const progress = Math.min(
//                               (total / c.minOrderValue) * 100,
//                               100,
//                             );
//                             const isEligible = total >= c.minOrderValue;
//                             const remaining = c.minOrderValue - total; */}
//                           {activeCoupons.map((c) => {
//                             const couponRelevantTotal = Array.isArray(
//                               c.applicableOn,
//                             )
//                               ? c.applicableOn.reduce(
//                                   (s, cat) =>
//                                     s + Number(categoryTotals[cat] || 0),
//                                   0,
//                                 )
//                               : 0;
//                             const progress = Math.min(
//                               (couponRelevantTotal / c.minOrderValue) * 100,
//                               100,
//                             );
//                             const isEligible =
//                               couponRelevantTotal >= c.minOrderValue;
//                             const remaining =
//                               c.minOrderValue - couponRelevantTotal;

//                             return (
//                               <div
//                                 key={c.code}
//                                 className="w-56 rounded-xl border border-gray-200 bg-white p-3"
//                               >
//                                 {/* Discount label */}
//                                 <p className="text-xs text-orange-600 font-medium">
//                                   {c.discountType === 'percentage'
//                                     ? `${c.discountValue}% Discount${c.maxDiscountCap ? ` Upto ₹${c.maxDiscountCap}` : ''}`
//                                     : `Flat ₹${c.discountValue} Off`}
//                                 </p>

//                                 {/* Eligible or not text */}
//                                 <p className="text-[10px] text-gray-400 mt-1">
//                                   {isEligible
//                                     ? `On items above ₹${c.minOrderValue}`
//                                     : `Add ₹${remaining} more to unlock`}{' '}
//                                   {/* 👈 dynamic hint */}
//                                 </p>

//                                 {/* Progress bar */}
//                                 <div className="mt-2 h-1.5 rounded-full bg-orange-200">
//                                   <div
//                                     className="h-1.5 rounded-full bg-orange-500 transition-all duration-300"
//                                     style={{ width: `${progress}%` }} // 👈 dynamic width
//                                   />
//                                 </div>

//                                 {/* Code + Apply button */}
//                                 <div className="mt-2 flex items-center justify-between">
//                                   <span className="text-[10px] px-2 py-0.5 rounded-full border border-orange-300 text-orange-600">
//                                     {c.code}
//                                   </span>
//                                   <button
//                                     onClick={() =>
//                                       isEligible && handleApplyCoupon(c.code)
//                                     } // 👈 eligible tabhi click
//                                     disabled={!isEligible}
//                                     className={`text-xs font-semibold transition-colors ${
//                                       isEligible
//                                         ? 'text-orange-600 cursor-pointer' // enabled — dark
//                                         : 'text-orange-300 cursor-not-allowed' // disabled — faded
//                                     }`}
//                                   >
//                                     APPLY
//                                   </button>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4">
//                 <p className="text-sm text-gray-700 mb-2">Have a Coupon?</p>
//                 {appliedCoupon ? (
//                   <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
//                     <span className="text-sm text-green-700 font-medium">
//                       {appliedCoupon.code} applied
//                     </span>
//                     <button
//                       onClick={handleRemoveCoupon}
//                       className="text-xs text-red-500 hover:underline"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         placeholder="Enter Code"
//                         value={couponCode}
//                         onChange={(e) =>
//                           setCouponCode(e.target.value.toUpperCase())
//                         }
//                         className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 text-sm"
//                       />
//                       <button
//                         onClick={() => handleApplyCoupon()}
//                         disabled={couponLoading}
//                         className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50"
//                       >
//                         {couponLoading ? '...' : 'Apply'}
//                       </button>
//                     </div>
//                     {couponError && (
//                       <p className="text-xs text-red-500 mt-1">{couponError}</p>
//                     )}
//                   </>
//                 )}
//               </div>

//               {/* <Link
//                 href="/checkout"
//                 className="mt-5 block w-full py-3 bg-[#2563EB] text-white text-center font-medium rounded-xl hover:bg-blue-700"
//               >
//                 Proceed to Checkout
//               </Link> */}
//               <button
//                 type="button"
//                 onClick={() => {
//                   try {
//                     localStorage.setItem(
//                       'rentpay_checkout_total',
//                       String(Math.round(totalPayToday)),
//                     );
//                   } catch {}
//                   router.push('/checkout');
//                 }}
//                 className="mt-5 block w-full py-3 bg-[#2563EB] text-white text-center font-medium rounded-xl hover:bg-blue-700"
//               >
//                 Proceed to Checkout
//               </button>

//               <div className="mt-3 text-xs text-gray-500 space-y-1">
//                 <p className="flex items-center justify-center gap-1 ">
//                   <Lock className="w-3 h-3 text-[#10B981]" />
//                   100% Secure Payments
//                 </p>
//                 <p className="flex items-center justify-center gap-1 ">
//                   <Shield className="w-3 h-3 text-[#2563EB]" />
//                   Deposits are Refundable
//                 </p>
//                 {/* <p>◎ Deposits are Refundable</p> */}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* {changeSlotOpen && changeSlotProduct && (
//         <BookingModal */}
//       {dateModalItem && (
//         <ChangeDailyDateModal
//           item={dateModalItem}
//           onClose={() => setDateModalItem(null)}
//           onSave={({ startDate, endDate, days, total }) => {
//             dispatch(
//               updateRentalDates({
//                 productId: dateModalItem.productId,
//                 startDate,
//                 endDate,
//                 rentalMonths: days,
//                 pricePerDay: total,
//               }),
//             );
//             setDateModalItem(null);
//           }}
//         />
//       )}

//       {changeSlotOpen && changeSlotProduct && (
//         <BookingModal
//           isOpen={changeSlotOpen}
//           product={changeSlotProduct}
//           mode="create"
//           onClose={() => {
//             setChangeSlotOpen(false);
//             setChangeSlotProduct(null);
//             setChangeSlotBookingProductId(null);
//             // Re-read updated bookings from localStorage
//             try {
//               const raw = localStorage.getItem(
//                 'rentpay_pending_service_bookings',
//               );
//               const list = raw ? JSON.parse(raw) : [];
//               setPendingServiceBookings(Array.isArray(list) ? list : []);
//             } catch {
//               setPendingServiceBookings([]);
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Cart;

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
// import {
//   removeFromCart,
//   updateQuantity,
//   updateTenure,
//   syncCart,
//   clearAppliedCoupon,
//   setAppliedCoupon,
// } from '../store/slices/cartSlice';
import {
  removeFromCart,
  updateQuantity,
  updateTenure,
  updateRentalDates,
  syncCart,
  clearAppliedCoupon,
  setAppliedCoupon,
} from '../store/slices/cartSlice';
import {
  apiGetActiveCoupons,
  apiGetProductById,
  apiValidateCoupon,
  apiGetGlobalTax,
} from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { api } from '@/lib/axios';
import { BACKEND_URL } from '@/lib/apiConfig';
// import {
//   Shield,
//   Trash2,
//   Plus,
//   Minus,
//   ShoppingCart,
//   BadgePercent,
//   AlertCircle,
//   Lock,
//   ChevronRight,
//   Calendar,
// } from 'lucide-react';
import {
  Shield,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  BadgePercent,
  AlertCircle,
  Lock,
  ChevronRight,
  ChevronLeft,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import offerCartIcon from '@/assets/icons/offer-cart.png';
import BookingModal from '@/components/ServicePage/ServiceBookinModal';
import { apiGetServiceById } from '@/lib/api';

// function getDeliveryTimelineLabel(product) {
//   const lv = product?.logisticsVerification || {};
//   const n = Number(lv.deliveryTimelineValue);
//   const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
//   if (!Number.isFinite(n) || n <= 0) return '';
//   if (unit === 'hours') {
//     return `Delivery in ${n} hour${n === 1 ? '' : 's'}`;
//   }
//   return `Delivery in ${n} day${n === 1 ? '' : 's'}`;
// }
function getDeliveryTimelineLabel(product) {
  const lv = product?.logisticsVerification || {};
  const n = Number(lv.deliveryTimelineValue);
  const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
  if (!Number.isFinite(n) || n <= 0) return '';
  if (unit === 'hours') {
    return `Delivery in ${n} hour${n === 1 ? '' : 's'}`;
  }
  return `Delivery in ${n} day${n === 1 ? '' : 's'}`;
}

// ── Daily-rental date helpers (used only by the Change Date modal) ────────
const isDailyRentalItem = (item) =>
  String(item?.productType || 'Rental') === 'Rental' &&
  String(item?.tenureUnit || 'month') === 'day';

function parseLocalIso(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const [y, mo, da] = iso.split('-').map((x) => parseInt(x, 10));
  if (!y || !mo || !da) return null;
  return new Date(y, mo - 1, da);
}
function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addLocalDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function toLocalIso(d) {
  const x = startOfLocalDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function formatRangeLine(iso) {
  const d = parseLocalIso(iso);
  if (!d) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}
function buildMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const daysInMonth = last.getDate();
  const startWeekday = first.getDay();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, monthIndex, day));
  }
  return cells;
}
function isDateInRangeInclusive(day, startIso, endIso) {
  if (!startIso || !endIso) return false;
  const t = startOfLocalDay(day).getTime();
  const a = startOfLocalDay(parseLocalIso(startIso)).getTime();
  const b = startOfLocalDay(parseLocalIso(endIso)).getTime();
  return t >= a && t <= b;
}
const CART_CAL_ORANGE = '#FF7000';

/** Right-side modal to change delivery/pickup dates for a daily-rental cart item. */
const ChangeDailyDateModal = ({ item, onClose, onSave }) => {
  const [startDate, setStartDate] = useState(item.startDate || '');
  const [endDate, setEndDate] = useState(item.endDate || '');
  const [selectingDate, setSelectingDate] = useState('start');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = item.startDate ? parseLocalIso(item.startDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const calendarCells = useMemo(
    () => buildMonthGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth],
  );

  const handleDayClick = (day) => {
    const start = startOfLocalDay(day);
    const today = startOfLocalDay(new Date());
    if (start.getTime() < today.getTime()) return;

    if (selectingDate === 'start') {
      setStartDate(toLocalIso(start));
      setEndDate((prevEnd) => {
        if (!prevEnd) return prevEnd;
        const e = parseLocalIso(prevEnd);
        if (e && startOfLocalDay(e).getTime() < start.getTime()) return '';
        return prevEnd;
      });
      setSelectingDate('end');
      return;
    }
    const s = startDate ? parseLocalIso(startDate) : null;
    if (s && start.getTime() < startOfLocalDay(s).getTime()) {
      setStartDate(toLocalIso(start));
      setEndDate('');
      setSelectingDate('end');
      return;
    }
    if (s) {
      const minPickup = startOfLocalDay(addLocalDays(s, 2));
      if (start.getTime() < minPickup.getTime()) {
        return;
      }
    }
    setEndDate(toLocalIso(start));
  };

  const chargeableStartDate = useMemo(() => {
    if (!startDate) return '';
    return toLocalIso(addLocalDays(parseLocalIso(startDate), 1));
  }, [startDate]);

  const chargeableEndDate = useMemo(() => {
    if (!endDate) return '';
    return toLocalIso(addLocalDays(parseLocalIso(endDate), -1));
  }, [endDate]);

  const selectedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = parseLocalIso(startDate);
    const e = parseLocalIso(endDate);
    if (!s || !e) return 0;
    const diff =
      Math.round(
        (startOfLocalDay(e).getTime() - startOfLocalDay(s).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;
    const fullDays = diff > 0 ? diff : 0;
    const chargeable = fullDays - 2;
    return chargeable > 0 ? chargeable : 0;
  }, [startDate, endDate]);

  const rate = Number(item.dailyRate || 0);
  const total = rate * selectedDays;
  const canSave = startDate && endDate && selectedDays > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Change Dates</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div
          className="flex-1 px-5 py-4 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectingDate('start')}
              className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
                selectingDate === 'start'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <p className="text-[10px] font-medium text-gray-500">
                Delivery Date
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {startDate ? formatRangeLine(startDate) : 'Select'}
              </p>
            </button>
            <button
              type="button"
              onClick={() => startDate && setSelectingDate('end')}
              className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
                selectingDate === 'end'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <p className="text-[10px] font-medium text-gray-500">
                Pickup Date
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {endDate ? formatRangeLine(endDate) : 'Select'}
              </p>
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div
              className="flex items-center justify-between px-3 py-2.5 text-white"
              style={{ backgroundColor: CART_CAL_ORANGE }}
            >
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (p) => new Date(p.getFullYear(), p.getMonth() - 1, 1),
                  )
                }
                className="p-1 rounded-lg hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold">
                {calendarMonth.toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (p) => new Date(p.getFullYear(), p.getMonth() + 1, 1),
                  )
                }
                className="p-1 rounded-lg hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="px-2 sm:px-3 pt-3 pb-2">
              <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium text-gray-500 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
                  <div key={w} className="py-1">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {calendarCells.map((day, idx) => {
                  if (!day)
                    return <div key={`e-${idx}`} className="h-9" aria-hidden />;
                  const iso = toLocalIso(day);
                  const today = startOfLocalDay(new Date());
                  let disabled =
                    startOfLocalDay(day).getTime() < today.getTime();
                  if (!disabled && selectingDate === 'end' && startDate) {
                    const minPickupTime = startOfLocalDay(
                      addLocalDays(parseLocalIso(startDate), 2),
                    ).getTime();
                    if (startOfLocalDay(day).getTime() < minPickupTime) {
                      disabled = true;
                    }
                  }
                  const inRange = isDateInRangeInclusive(
                    day,
                    startDate,
                    endDate,
                  );
                  return (
                    <div
                      key={iso}
                      className="flex items-center justify-center p-0.5"
                    >
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDayClick(day)}
                        className={[
                          'w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center',
                          disabled
                            ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                            : inRange
                              ? 'text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-orange-100',
                        ].join(' ')}
                        style={
                          inRange && !disabled
                            ? {
                                backgroundColor: CART_CAL_ORANGE,
                                opacity:
                                  iso !== startDate && iso !== endDate
                                    ? 0.45
                                    : 1,
                              }
                            : undefined
                        }
                      >
                        {day.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {startDate && endDate ? (
            <div className="mt-1 rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-center gap-4 text-center">
              <div className="shrink-0 leading-none">
                <span className="text-3xl font-bold text-gray-900">
                  {String(selectedDays).padStart(2, '0')}
                </span>
                <span className="ml-1 text-xs text-gray-500 align-super">
                  Day{selectedDays !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs text-gray-800 font-medium">
                  Chargeable Period:
                </p>
                {selectedDays > 0 ? (
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">
                    {formatRangeLine(chargeableStartDate)} -{' '}
                    {formatRangeLine(chargeableEndDate)}
                  </p>
                ) : (
                  <p className="text-[11px] text-red-600 mt-0.5">
                    Pickup must be 2+ days after delivery.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Select a delivery date, then a pickup date.
            </p>
          )}
        </div>
        <div className="px-5 pb-5 bg-white">
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave({ startDate, endDate, days: selectedDays, total })
            }
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600"
          >
            Save Dates
          </button>
        </div>
      </div>
    </div>
  );
};
const formatINR = (n) => Number(n || 0).toLocaleString('en-IN');

const TAX_FIELDS = [
  { key: 'gst', defaultKey: 'defaultGst', rateKey: 'gst', label: 'GST' },
  {
    key: 'careTax',
    defaultKey: 'defaultCareTax',
    rateKey: 'careTax',
    label: 'Care Tax',
  },
  {
    key: 'repairWarranty',
    defaultKey: 'defaultRepairWarranty',
    rateKey: 'repairWarranty',
    label: 'Repair & Warranty',
  },
  {
    key: 'relocationWarranty',
    defaultKey: 'defaultRelocationWarranty',
    rateKey: 'relocationWarranty',
    label: 'Relocation Warranty',
  },
  {
    key: 'deliveryPackaging',
    defaultKey: 'defaultDeliveryPackaging',
    rateKey: 'deliveryPackaging',
    label: 'Delivery & Packaging',
  },
  {
    key: 'installationFee',
    defaultKey: 'defaultInstallationFee',
    rateKey: 'installationFee',
    label: 'Installation Fee',
  },
  {
    key: 'platformFee',
    defaultKey: 'defaultPlatformFee',
    rateKey: 'platformFee',
    label: 'Platform Fee',
  },
];

const hasPositiveTaxOverride = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
};

const getItemTaxRate = (item, field, globalTax, isRentalFn) => {
  if (item.taxBlocked) return 0;
  // Subcategory docs default tax fields to 0 — treat 0 as "use global tax".
  if (hasPositiveTaxOverride(item[field.defaultKey])) {
    return Number(item[field.defaultKey]) / 100;
  }
  if (isRentalFn(item)) return (globalTax?.rental?.[field.rateKey] ?? 0) / 100;
  //   const condition = String(item.condition || '').toLowerCase();
  //   return condition === 'refurbished'
  //     ? (globalTax?.buying_refurbished?.[field.rateKey] ?? 0) / 100
  //     : (globalTax?.buying_new?.[field.rateKey] ?? 0) / 100;
  // };
  const condition = String(item.condition || '').toLowerCase();
  if (condition === 'refurbished') {
    return (globalTax?.buying_refurbished?.[field.rateKey] ?? 0) / 100;
  }
  if (condition === 'mint condition' || condition === 'mint') {
    return (globalTax?.buying_mint?.[field.rateKey] ?? 0) / 100;
  }
  return (globalTax?.buying_new?.[field.rateKey] ?? 0) / 100;
};

const computeGroupBreakdown = (
  group,
  globalTax,
  isCareProtectionEnabled,
  isRentalFn,
) => {
  let itemsTotal = 0;
  let refundableDeposit = 0;
  const fees = {
    gst: 0,
    careTax: 0,
    repairWarranty: 0,
    relocationWarranty: 0,
    deliveryPackaging: 0,
    installationFee: 0,
    platformFee: 0,
  };
  group.forEach((item) => {
    const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
    const price = Number(item.pricePerDay || 0);
    const itemTotal = price * qty;
    itemsTotal += itemTotal;
    if (isRentalFn(item)) {
      refundableDeposit += Number(item.refundableDeposit || 0) * qty;
    }
    TAX_FIELDS.forEach((field) => {
      if (field.key === 'careTax' && !isCareProtectionEnabled) return;
      const rate = getItemTaxRate(item, field, globalTax, isRentalFn);
      fees[field.key] += Math.round(itemTotal * rate);
    });
  });
  return { itemsTotal, refundableDeposit, fees };
};
const computeServiceBreakdown = (
  booking,
  globalTax,
  isCareProtectionEnabled,
) => {
  const tax = booking?.subCategoryTax || {};
  const isBlocked = booking?.taxBlocked === true || tax?.taxBlocked === true;
  const base = Number(booking?.totalAmount || 0);
  const calc = (subKey, globalKey) => {
    if (isBlocked) return 0;
    const rate =
      tax[subKey] != null
        ? Number(tax[subKey])
        : (globalTax?.services?.[globalKey] ?? 0);
    return Math.round((base * rate) / 100);
  };
  return {
    itemsTotal: base,
    fees: {
      gst: calc('defaultGst', 'gst'),
      careTax: isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0,
      repairWarranty: calc('defaultRepairWarranty', 'repairWarranty'),
      relocationWarranty: calc(
        'defaultRelocationWarranty',
        'relocationWarranty',
      ),
      deliveryPackaging: calc('defaultDeliveryPackaging', 'deliveryPackaging'),
      installationFee: calc('defaultInstallationFee', 'installationFee'),
      platformFee: calc('defaultPlatformFee', 'platformFee'),
    },
  };
};

const CartTenureButton = ({ item, onTenureChange, offer }) => {
  const discountPercent = Number(offer?.discountPercent || 0);
  const hasOffer = discountPercent > 0;
  const [open, setOpen] = useState(false);
  const [customMonths, setCustomMonths] = useState('');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  const configs = Array.isArray(item.rentalConfigurations)
    ? item.rentalConfigurations.filter(
        (cfg) => Number(cfg.customerRent || cfg.pricePerDay || 0) > 0,
      )
    : [];

  // Custom tenure: only for monthly configs, capped at vendor's max fixed tenure.
  // const monthlyConfigs = configs
  //   .filter(
  //     (cfg) =>
  //       !(
  //         cfg?.periodUnit === 'day' ||
  //         (Number(cfg?.days) > 0 && !Number(cfg?.months))
  //       ),
  //   )
  //   .map((cfg) => ({
  //     months: Number(cfg.months) || 1,
  //     total: Number(cfg.customerRent || cfg.pricePerDay || 0),
  //     perMonth: Math.round(
  //       Number(cfg.customerRent || cfg.pricePerDay || 0) /
  //         (Number(cfg.months) || 1),
  //     ),
  //   }))
  //   .sort((a, b) => a.months - b.months);
  const monthlyConfigs = configs
    .filter(
      (cfg) =>
        !(
          cfg?.periodUnit === 'day' ||
          (Number(cfg?.days) > 0 && !Number(cfg?.months))
        ),
    )
    .map((cfg) => {
      const months = Number(cfg.months) || 1;
      const rate = Number(cfg.customerRent || cfg.pricePerDay || 0); // per-month rate, not total
      return {
        months,
        total: rate * months,
        perMonth: rate,
      };
    })
    .sort((a, b) => a.months - b.months);

  // const maxCustomMonths = monthlyConfigs.length
  //   ? monthlyConfigs[monthlyConfigs.length - 1].months
  //   : 0;

  // const customPlan = useMemo(() => {
  //   const m = parseInt(customMonths, 10);
  //   if (!m || m <= 0) return null;
  //   if (maxCustomMonths && m > maxCustomMonths) return null;
  //   if (monthlyConfigs.length < 2) return null;
  const maxCustomMonths = monthlyConfigs.length
    ? monthlyConfigs[monthlyConfigs.length - 1].months
    : 0;

  const minCustomMonths = monthlyConfigs.length ? monthlyConfigs[0].months : 0;

  const customPlan = useMemo(() => {
    const m = parseInt(customMonths, 10);
    if (!m || m <= 0) return null;
    if (minCustomMonths && m < minCustomMonths) return null;
    if (maxCustomMonths && m > maxCustomMonths) return null;
    if (monthlyConfigs.length < 2) return null;

    let lower = monthlyConfigs[0];
    let upper = monthlyConfigs[monthlyConfigs.length - 1];
    for (let i = 0; i < monthlyConfigs.length - 1; i++) {
      if (m >= monthlyConfigs[i].months && m <= monthlyConfigs[i + 1].months) {
        lower = monthlyConfigs[i];
        upper = monthlyConfigs[i + 1];
        break;
      }
    }
    if (m < monthlyConfigs[0].months) {
      lower = monthlyConfigs[0];
      upper = monthlyConfigs[1];
    }
    if (m > monthlyConfigs[monthlyConfigs.length - 1].months) {
      lower = monthlyConfigs[monthlyConfigs.length - 2];
      upper = monthlyConfigs[monthlyConfigs.length - 1];
    }
    const slope =
      (upper.perMonth - lower.perMonth) / (upper.months - lower.months || 1);
    const perMonth = Math.max(
      1,
      Math.round(lower.perMonth + slope * (m - lower.months)),
    );
    return { months: m, perMonth, total: perMonth * m };
  }, [customMonths, monthlyConfigs, maxCustomMonths]);

  const getTenureLabel = (cfg) => {
    const isDayUnit =
      cfg?.periodUnit === 'day' ||
      (Number(cfg?.days) > 0 && !Number(cfg?.months));
    if (isDayUnit) {
      const days = Number(cfg.days) || 1;
      return `${days} Day${days !== 1 ? 's' : ''}`;
    }
    const months = Number(cfg.months) || 1;
    return `${months} Month${months !== 1 ? 's' : ''}`;
  };

  const getPriceSuffix = (cfg) => {
    const isDayUnit =
      cfg?.periodUnit === 'day' ||
      (Number(cfg?.days) > 0 && !Number(cfg?.months));
    return isDayUnit ? '/day' : '/mo';
  };

  const currentLabel = (() => {
    const isDayItem = String(item.tenureUnit || 'month') === 'day';
    const n = Number(item.rentalMonths || 1);
    return isDayItem
      ? `${n} Day${n !== 1 ? 's' : ''}`
      : `${n} Month${n !== 1 ? 's' : ''}`;
  })();

  // Baseline for "Save ₹X" = the original (undiscounted) per-unit rate of
  // the shortest tenure (configs[0]) — same logic as the product detail page.
  const baselineConfig = configs[0];
  const baselineIsDayUnit =
    baselineConfig?.periodUnit === 'day' ||
    (Number(baselineConfig?.days) > 0 && !Number(baselineConfig?.months));
  // const baselineRawTotal = Number(
  //   baselineConfig?.customerRent || baselineConfig?.pricePerDay || 0,
  // );
  // const baselineUnits = baselineIsDayUnit
  //   ? Number(baselineConfig?.days) || 1
  //   : Number(baselineConfig?.months) || 1;
  // const maxPerUnit = baselineConfig
  //   ? Math.round(baselineRawTotal / baselineUnits)
  //   : 0;
  // customerRent / pricePerDay is already the per-unit rate.
  const maxPerUnit = baselineConfig
    ? Number(baselineConfig?.customerRent || baselineConfig?.pricePerDay || 0)
    : 0;

  // if (configs.length <= 1) {
  //   return (
  //     <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
  //       {currentLabel}
  //     </div>
  //   );
  // }

  const isDayItemFallback = String(item.tenureUnit || 'month') === 'day';

  if (configs.length <= 1) {
    return (
      //     <div
      //       className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 border-2 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 ${
      //         isDayItemFallback ? 'sm:!border-orange-400 sm:!text-orange-600' : ''
      //       }`}
      //     >
      //       {currentLabel}
      //     </div>
      //   );
      // }
      <div
        className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 border-2 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 sm:h-7 sm:flex sm:items-center sm:justify-center ${
          isDayItemFallback ? 'sm:!border-orange-400 sm:!text-orange-600' : ''
        }`}
      >
        {currentLabel}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        //   onClick={() => setOpen(true)}
        //   className="flex items-center gap-0.5 sm:gap-2 px-1.5 py-0.5 sm:px-3 sm:py-1.5 border-2 border-orange-400 text-orange-600 bg-white rounded-md sm:rounded-lg text-[10px] sm:text-sm font-semibold hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap"
        // >
        //   <span>{currentLabel}</span>
        //   <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        // </button>
        onClick={() => setOpen(true)}
        className="flex items-center   px-1.5 py-0.5 sm:px-2.5 sm:py-1 border-2 border-orange-400 text-orange-600 bg-white rounded-md sm:rounded-lg text-[10px] sm:text-sm font-semibold hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap sm:h-7"
      >
        <span>{currentLabel}</span>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop — no click close */}
          <div className="flex-1 bg-black/40 overflow-y-auto" />
          {/* Modal Panel */}
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">Select Tenure</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            {/* Options */}
            <div className="flex-1 px-5 py-4 space-y-3">
              {configs.map((cfg, index) => {
                const isDayUnit =
                  cfg?.periodUnit === 'day' ||
                  (Number(cfg?.days) > 0 && !Number(cfg?.months));
                const units = isDayUnit
                  ? Number(cfg.days) || 1
                  : Number(cfg.months) || 1;

                // const rawTotalPrice = Number(
                //   cfg.customerRent || cfg.pricePerDay || 0,
                // );
                // const originalPerUnit = Math.round(rawTotalPrice / units);
                // const perUnit = hasOffer
                //   ? Math.max(
                //       0,
                //       Math.round(
                //         originalPerUnit -
                //           (originalPerUnit * discountPercent) / 100,
                //       ),
                //     )
                //   : originalPerUnit;
                // // Total is derived FROM the per-unit price (not the other way
                // // around) so the amount applied to the cart always matches
                // // exactly what was shown in this modal (perUnit × units).
                // const discountedTotalPrice = perUnit * units;

                // customerRent / pricePerDay is the PER-UNIT rate (per month
                // or per day), not the total tenure price.
                const originalPerUnit = Number(
                  cfg.customerRent || cfg.pricePerDay || 0,
                );
                const perUnit = hasOffer
                  ? Math.max(
                      0,
                      Math.round(
                        originalPerUnit -
                          (originalPerUnit * discountPercent) / 100,
                      ),
                    )
                  : originalPerUnit;
                // Total is derived FROM the per-unit price (not the other way
                // around) so the amount applied to the cart always matches
                // exactly what was shown in this modal (perUnit × units).
                const discountedTotalPrice = perUnit * units;
                const saving = maxPerUnit - perUnit;
                const isBestValue = index === configs.length - 1;
                const label = getTenureLabel(cfg);
                const suffix = getPriceSuffix(cfg);

                const isSelected = (() => {
                  const isDayItem =
                    String(item.tenureUnit || 'month') === 'day';
                  const n = Number(item.rentalMonths || 1);
                  if (isDayUnit && isDayItem) return units === n;
                  if (!isDayUnit && !isDayItem) return units === n;
                  return false;
                })();

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onTenureChange(cfg, perUnit, discountedTotalPrice);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-green-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {label}
                        </p>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {saving > 0 && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Save ₹{saving}
                              {suffix}
                            </span>
                          )}
                          {isBestValue && (
                            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                              Best Value
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">
                        ₹{formatINR(perUnit)}
                        <span className="text-xs font-normal text-gray-500">
                          {suffix}
                        </span>
                      </p>
                      {hasOffer && originalPerUnit !== perUnit && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{formatINR(originalPerUnit)}
                          {suffix}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}

              {monthlyConfigs.length > 1 && (
                <div className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      Custom
                    </p>
                    {/* <input
                      type="number"
                      min="1"
                      max={maxCustomMonths || undefined}
                      placeholder="e.g. 2"
                      value={customMonths}
                      onChange={(e) => setCustomMonths(e.target.value)}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
                    />
                    <span className="text-xs text-gray-500">
                      months {maxCustomMonths ? `(max ${maxCustomMonths})` : ''}
                    </span> */}
                    <input
                      type="number"
                      min={minCustomMonths || 1}
                      max={maxCustomMonths || undefined}
                      placeholder={`e.g. ${minCustomMonths || 2}`}
                      value={customMonths}
                      onChange={(e) => setCustomMonths(e.target.value)}
                      className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
                    />
                    {/* <span className="text-xs text-gray-500">
                      months{' '}
                      {minCustomMonths && maxCustomMonths
                        ? `(${minCustomMonths}-${maxCustomMonths})`
                        : ''}
                    </span> */}
                  </div>
                  {/* <div className="text-right shrink-0 flex items-center gap-2">
                    {customPlan ? (
                      <>
                        <p className="font-bold text-gray-900">
                          ₹{formatINR(customPlan.perMonth)}
                          <span className="text-xs font-normal text-gray-500">
                            /mo
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const discountedTotal = hasOffer
                              ? Math.max(
                                  0,
                                  Math.round(
                                    customPlan.total -
                                      (customPlan.total * discountPercent) /
                                        100,
                                  ),
                                )
                              : customPlan.total;
                            onTenureChange(
                              {
                                periodUnit: 'month',
                                months: customPlan.months,
                              },
                              customPlan.perMonth,
                              discountedTotal,
                            );
                            setOpen(false);
                          }}
                          className="text-xs font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600"
                        >
                          Apply
                        </button>
                      </> */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    {customPlan ? (
                      <>
                        <div>
                          <p className="font-bold text-gray-900">
                            ₹
                            {formatINR(
                              hasOffer
                                ? Math.max(
                                    0,
                                    Math.round(
                                      customPlan.perMonth -
                                        (customPlan.perMonth *
                                          discountPercent) /
                                          100,
                                    ),
                                  )
                                : customPlan.perMonth,
                            )}
                            <span className="text-xs font-normal text-gray-500">
                              /mo
                            </span>
                          </p>
                          {hasOffer && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{formatINR(customPlan.perMonth)}/mo
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const discountedTotal = hasOffer
                              ? Math.max(
                                  0,
                                  Math.round(
                                    customPlan.total -
                                      (customPlan.total * discountPercent) /
                                        100,
                                  ),
                                )
                              : customPlan.total;
                            onTenureChange(
                              {
                                periodUnit: 'month',
                                months: customPlan.months,
                              },
                              customPlan.perMonth,
                              discountedTotal,
                            );
                            setOpen(false);
                          }}
                          className="text-xs font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-600"
                        >
                          Apply
                        </button>
                      </>
                    ) : // ) : customMonths ? (
                    //   <p className="text-[10px] text-red-500">
                    //     {maxCustomMonths
                    //       ? `Max ${maxCustomMonths} months`
                    //       : 'Invalid'}
                    //   </p>
                    // ) : (
                    //   <p className="text-xs text-gray-400">Enter months</p>
                    // )}
                    customMonths && minCustomMonths && maxCustomMonths ? (
                      <p className="text-[10px] text-red-500">
                        Enter a value between {minCustomMonths} and{' '}
                        {maxCustomMonths} months
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Enter{' '}
                        {minCustomMonths && maxCustomMonths
                          ? `${minCustomMonths}-${maxCustomMonths}`
                          : ''}{' '}
                        months
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Cart = () => {
  const { items } = useSelector((s) => s.cart);
  // const { items } = useSelector((s) => s.cart || { items: [] });
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  const { pushToast } = useToast();
  const { open: authModalOpen, openAuth } = useAuthModal();
  const pendingCheckoutRef = useRef(false);
  const prevAuthModalOpenRef = useRef(false);
  const isRentalItem = (item) =>
    String(item?.productType || 'Rental') === 'Rental';

  const stockMapKey = useMemo(
    () =>
      items
        .map((i) => i.productId)
        .sort()
        .join('_'),
    [items],
  );
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  // { code, discountAmount, discountType, discountValue, finalAmount }
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [stockByProductId, setStockByProductId] = useState({});
  const [deliveryByProductId, setDeliveryByProductId] = useState({});
  // const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(() => {
  //   if (typeof window === 'undefined') return true;
  //   const saved = localStorage.getItem('rentpay_care_protection_enabled');
  //   return saved === null ? true : saved === 'true';
  // });
  const [isCareProtectionEnabled, setIsCareProtectionEnabled] = useState(true);
  const [globalTax, setGlobalTax] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [pendingServiceBookings, setPendingServiceBookings] = useState([]);
  const [serviceOffer, setServiceOffer] = useState(null);
  const [changeSlotOpen, setChangeSlotOpen] = useState(false);
  const [changeSlotProduct, setChangeSlotProduct] = useState(null);
  const [changeSlotLoading, setChangeSlotLoading] = useState(false);
  const [changeSlotBookingProductId, setChangeSlotBookingProductId] =
    useState(null);
  const [dateModalItem, setDateModalItem] = useState(null);

  const appliedCoupon = useSelector((s) => s.cart.appliedCoupon);
  //  const appliedCoupon = useSelector((s) => s.cart?.appliedCoupon);

  const sellItems = useMemo(
    () => items.filter((i) => !isRentalItem(i)),
    [items],
  );
  const dailyRentalItems = useMemo(
    () =>
      items.filter(
        (i) => isRentalItem(i) && String(i.tenureUnit || 'month') === 'day',
      ),
    [items],
  );
  const monthlyRentalItems = useMemo(
    () =>
      items.filter(
        (i) => isRentalItem(i) && String(i.tenureUnit || 'month') !== 'day',
      ),
    [items],
  );

  // const [openSection, setOpenSection] = useState({
  //   buying: false,
  //   dailyRental: false,
  //   monthlyRental: false,
  //   deposit: false,
  // });
  const [openSection, setOpenSection] = useState({
    buying: false,
    dailyRental: false,
    monthlyRental: false,
    rental: false,
    service: false,
    deposit: false,
  });

  // const serviceDiscountPercent = Number(serviceOffer?.discountPercent || 0);
  // const hasServiceOffer = !!serviceOffer && serviceDiscountPercent > 0;

  // const discountedServiceBooking = useMemo(() => {
  //   if (!pendingServiceBooking) return null;
  //   if (!hasServiceOffer) return pendingServiceBooking;
  //   const baseAmount = Number(pendingServiceBooking.totalAmount || 0);
  //   const discountedAmount = Math.max(
  //     0,
  //     Math.round(baseAmount - (baseAmount * serviceDiscountPercent) / 100),
  //   );
  //   return { ...pendingServiceBooking, totalAmount: discountedAmount };
  // }, [pendingServiceBooking, hasServiceOffer, serviceDiscountPercent]);

  // const serviceBreakdown = useMemo(
  //   () =>
  //     discountedServiceBooking
  //       ? computeServiceBreakdown(
  //           discountedServiceBooking,
  //           globalTax,
  //           isCareProtectionEnabled,
  //         )
  //       : null,
  //   [discountedServiceBooking, globalTax, isCareProtectionEnabled],
  // );

  const serviceBookingsWithMeta = useMemo(
    () =>
      pendingServiceBookings.map((booking) => {
        const hasOffer =
          Number(booking.originalAmount || 0) >
          Number(booking.totalAmount || 0);
        const discountPercent =
          hasOffer && booking.originalAmount > 0
            ? Math.round(
                ((booking.originalAmount - booking.totalAmount) /
                  booking.originalAmount) *
                  100,
              )
            : 0;
        const breakdown = computeServiceBreakdown(
          booking,
          globalTax,
          isCareProtectionEnabled,
        );
        return { booking, hasOffer, discountPercent, breakdown };
      }),
    [pendingServiceBookings, globalTax, isCareProtectionEnabled],
  );
  const toggleSection = (key) =>
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));

  // const total = useMemo(() => {
  //   return items.reduce((sum, i) => {
  //     const qty = isDailyRentalItem(i) ? 1 : Number(i.quantity || 0);
  //     const unitPrice = Number(i.pricePerDay || 0);
  //     return sum + unitPrice * qty;
  //   }, 0);
  // }, [items]);

  const total = useMemo(() => {
    return items.reduce((sum, i) => {
      const qty = isDailyRentalItem(i) ? 1 : Number(i.quantity || 0);
      const unitPrice = Number(i.pricePerDay || 0);
      return sum + unitPrice * qty;
    }, 0);
  }, [items]);

  // Coupon must only ever consider rental items' value — buy items never
  // count toward coupon eligibility or the discount base amount.
  const rentalOnlyTotal = useMemo(() => {
    return items.reduce((sum, i) => {
      if (!isRentalItem(i)) return sum;
      const qty = isDailyRentalItem(i) ? 1 : Number(i.quantity || 0);
      const unitPrice = Number(i.pricePerDay || 0);
      return sum + unitPrice * qty;
    }, 0);
  }, [items]);

  // Buy-only base value (used only when a coupon's applicableOn includes 'selling')
  const sellOnlyTotal = useMemo(() => {
    return items.reduce((sum, i) => {
      if (isRentalItem(i)) return sum;
      const qty = Number(i.quantity || 0);
      const unitPrice = Number(i.pricePerDay || 0);
      return sum + unitPrice * qty;
    }, 0);
  }, [items]);

  // Service-only base value (used only when a coupon's applicableOn includes 'services')
  const serviceOnlyBaseTotal = useMemo(() => {
    return pendingServiceBookings.reduce(
      (sum, b) => sum + Number(b?.totalAmount || 0),
      0,
    );
  }, [pendingServiceBookings]);

  // Bundled so the backend can decide, per-coupon, which category totals count.
  const categoryTotals = useMemo(
    () => ({
      rentals: rentalOnlyTotal,
      selling: sellOnlyTotal,
      services: serviceOnlyBaseTotal,
    }),
    [rentalOnlyTotal, sellOnlyTotal, serviceOnlyBaseTotal],
  );

  // If the customer removes items from the category this coupon targets
  // (or the remaining value drops below the coupon's minimum), the coupon
  // is no longer valid — auto-remove it so the discount never lingers
  // against a category it was never meant for.
  useEffect(() => {
    if (!isHydrated) return;
    if (!appliedCoupon) return;
    if (!Array.isArray(appliedCoupon.applicableOn)) return;
    const relevantTotal = appliedCoupon.applicableOn.reduce(
      (s, cat) => s + Number(categoryTotals[cat] || 0),
      0,
    );
    const minOrderValue = Number(appliedCoupon.minOrderValue || 0);
    if (relevantTotal <= 0 || relevantTotal < minOrderValue) {
      dispatch(clearAppliedCoupon());
      pushToast(
        `"${appliedCoupon.code}" removed — no longer eligible`,
        'error',
      );
    }
  }, [categoryTotals, appliedCoupon, isHydrated, dispatch, pushToast]);

  const refundableDepositTotal = useMemo(() => {
    return items.reduce((sum, i) => {
      if (!isRentalItem(i)) return sum;
      const deposit = Number(i.refundableDeposit || 0);
      return sum + deposit * Number(i.quantity || 0);
    }, 0);
  }, [items]);

  const hasRentalItems = useMemo(
    () => items.some((i) => isRentalItem(i)),
    [items],
  );

  const primaryRentalItem = useMemo(() => {
    return items.find((i) => isRentalItem(i)) || null;
  }, [items]);

  const getRentalTenureLabel = (item) => {
    const n = Number(item?.rentalMonths || 1);
    return String(item?.tenureUnit || 'month') === 'day'
      ? `${n} Day${n === 1 ? '' : 's'}`
      : `${n} Month${n === 1 ? '' : 's'}`;
  };

  const getRentalPriceLabel = (item) => {
    const n = Number(item?.rentalMonths || 1);
    return String(item?.tenureUnit || 'month') === 'day'
      ? `Rental Price `
      : `Rental Price  `;
  };

  const handleTenureChange = (productId, cfg) => {
    dispatch(
      updateQuantity({
        productId,
        quantity: items.find((i) => i.productId === productId)?.quantity || 1,
        rentalMonths: Number(cfg.months) || 1,
        pricePerDay: Number(cfg.customerRent || cfg.pricePerDay || 0),
      }),
    );
  };

  const deliveryFee = 0;
  // const gst = useMemo(() => {
  //   return Math.round(total * 0.06);
  // }, [total]);
  // const gst = useMemo(() => {
  //   console.log('=== GST DEBUG ===');
  //   console.log('globalTax:', globalTax);
  //   console.log('items:', items);
  //   console.log('items[0].condition:', items[0]?.condition);
  //   console.log('items[0].productType:', items[0]?.productType);
  const gst = useMemo(() => {
    if (!items.length) {
      return 0;
    }

    // return items.reduce((sum, item) => {
    //   const qty = Number(item.quantity || 1);
    //   const price = Number(item.pricePerDay || 0);
    //   const itemTotal = price * qty;

    //   let gstRate = 0;

    //   if (isRentalItem(item)) {
    //     // Rental → use rental GST rate
    //     gstRate = (globalTax.rental?.gst ?? 0) / 100;
    //   } else {
    //     // Sell → check product condition
    //     const condition = String(item.condition || '').toLowerCase();
    //     if (condition === 'refurbished') {
    //       gstRate = (globalTax.buying_refurbished?.gst ?? 0) / 100;
    //     } else {
    //       // Brand New, Like New, Good, Fair → buying_new
    //       gstRate = (globalTax.buying_new?.gst ?? 0) / 100;
    //     }
    //   }

    //   return sum + Math.round(itemTotal * gstRate);
    // }, 0);
    return items.reduce((sum, item) => {
      // const qty = Number(item.quantity || 1);
      const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
      const price = Number(item.pricePerDay || 0);
      const itemTotal = price * qty;
      if (item.taxBlocked) return sum;

      let gstRate = 0;
      if (hasPositiveTaxOverride(item.defaultGst)) {
        gstRate = Number(item.defaultGst) / 100;
      } else if (isRentalItem(item)) {
        gstRate = (globalTax?.rental?.gst ?? 0) / 100;
        // } else {
        //   const condition = String(item.condition || '').toLowerCase();
        //   gstRate =
        //     condition === 'refurbished'
        //       ? (globalTax?.buying_refurbished?.gst ?? 0) / 100
        //       : (globalTax?.buying_new?.gst ?? 0) / 100;
        // }
      } else {
        const condition = String(item.condition || '').toLowerCase();
        if (condition === 'refurbished') {
          gstRate = (globalTax?.buying_refurbished?.gst ?? 0) / 100;
        } else if (condition === 'mint condition' || condition === 'mint') {
          gstRate = (globalTax?.buying_mint?.gst ?? 0) / 100;
        } else {
          gstRate = (globalTax?.buying_new?.gst ?? 0) / 100;
        }
      }

      return sum + Math.round(itemTotal * gstRate);
    }, 0);
  }, [total, items, globalTax]);

  // const careProtection = useMemo(() => {
  //   return items.length ? 30 : 0;
  // }, [items.length]);
  const careProtection = useMemo(() => {
    console.log('=== CARE TAX DEBUG ===');
    console.log('isCareProtectionEnabled:', isCareProtectionEnabled);
    console.log('globalTax:', globalTax);
    console.log('items.length:', items.length);
    if (!isCareProtectionEnabled || !items.length) {
      return 0;
    }

    // return items.reduce((sum, item) => {
    //   const qty = Number(item.quantity || 1);
    //   const price = Number(item.pricePerDay || 0);
    //   const itemTotal = price * qty;

    //   let careTaxRate = 0;

    //   if (isRentalItem(item)) {
    //     careTaxRate = (globalTax.rental?.careTax ?? 0) / 100;
    //   } else {
    //     const condition = String(item.condition || '').toLowerCase();
    //     if (condition === 'refurbished') {
    //       careTaxRate = (globalTax.buying_refurbished?.careTax ?? 0) / 100;
    //     } else {
    //       careTaxRate = (globalTax.buying_new?.careTax ?? 0) / 100;
    //     }
    //   }

    //   return sum + Math.round(itemTotal * careTaxRate);
    // }, 0);
    return items.reduce((sum, item) => {
      // const qty = Number(item.quantity || 1);
      const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
      const price = Number(item.pricePerDay || 0);
      const itemTotal = price * qty;
      if (item.taxBlocked) return sum;

      let careTaxRate = 0;
      if (hasPositiveTaxOverride(item.defaultCareTax)) {
        careTaxRate = Number(item.defaultCareTax) / 100;
      } else if (isRentalItem(item)) {
        careTaxRate = (globalTax?.rental?.careTax ?? 0) / 100;
        // } else {
        //   const condition = String(item.condition || '').toLowerCase();
        //   careTaxRate =
        //     condition === 'refurbished'
        //       ? (globalTax?.buying_refurbished?.careTax ?? 0) / 100
        //       : (globalTax?.buying_new?.careTax ?? 0) / 100;
        // }
      } else {
        const condition = String(item.condition || '').toLowerCase();
        if (condition === 'refurbished') {
          careTaxRate = (globalTax?.buying_refurbished?.careTax ?? 0) / 100;
        } else if (condition === 'mint condition' || condition === 'mint') {
          careTaxRate = (globalTax?.buying_mint?.careTax ?? 0) / 100;
        } else {
          careTaxRate = (globalTax?.buying_new?.careTax ?? 0) / 100;
        }
      }

      return sum + Math.round(itemTotal * careTaxRate);
    }, 0);
  }, [items, isCareProtectionEnabled, globalTax]);

  // const discountAmount = appliedCoupon?.discountAmount || 0;
  const repairWarranty = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const qty = Number(item.quantity || 1);
      const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
      const price = Number(item.pricePerDay || 0);
      const itemTotal = price * qty;
      let rate = 0;
      // if (isRentalItem(item)) {
      //   rate = (globalTax.rental?.repairWarranty ?? 0) / 100;
      // } else {
      //   const condition = String(item.condition || '').toLowerCase();
      //   rate =
      //     condition === 'refurbished'
      //       ? (globalTax.buying_refurbished?.repairWarranty ?? 0) / 100
      //       : (globalTax.buying_new?.repairWarranty ?? 0) / 100;
      // }
      if (item.taxBlocked) return sum;
      if (hasPositiveTaxOverride(item.defaultRepairWarranty)) {
        rate = Number(item.defaultRepairWarranty) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.repairWarranty ?? 0) / 100;
        //     } else {
        //       const condition = String(item.condition || '').toLowerCase();
        //       rate =
        //         condition === 'refurbished'
        //           ? (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100
        //           : (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
        //     }
        //     return sum + Math.round(itemTotal * rate);
        //   }, 0);
        // }, [items, globalTax]);

        // const relocationWarranty = useMemo(() => {
      } else {
        const condition = String(item.condition || '').toLowerCase();
        if (condition === 'refurbished') {
          rate = (globalTax?.buying_refurbished?.repairWarranty ?? 0) / 100;
        } else if (condition === 'mint condition' || condition === 'mint') {
          rate = (globalTax?.buying_mint?.repairWarranty ?? 0) / 100;
        } else {
          rate = (globalTax?.buying_new?.repairWarranty ?? 0) / 100;
        }
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  const relocationWarranty = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const qty = Number(item.quantity || 1);
      const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
      const price = Number(item.pricePerDay || 0);
      const itemTotal = price * qty;
      let rate = 0;
      // if (isRentalItem(item)) {
      //   rate = (globalTax.rental?.relocationWarranty ?? 0) / 100;
      // } else {
      //   const condition = String(item.condition || '').toLowerCase();
      //   rate =
      //     condition === 'refurbished'
      //       ? (globalTax.buying_refurbished?.relocationWarranty ?? 0) / 100
      //       : (globalTax.buying_new?.relocationWarranty ?? 0) / 100;
      // }
      if (item.taxBlocked) return sum;
      if (hasPositiveTaxOverride(item.defaultRelocationWarranty)) {
        rate = Number(item.defaultRelocationWarranty) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.relocationWarranty ?? 0) / 100;
        //     } else {
        //       const condition = String(item.condition || '').toLowerCase();
        //       rate =
        //         condition === 'refurbished'
        //           ? (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100
        //           : (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
        //     }
        //     return sum + Math.round(itemTotal * rate);
        //   }, 0);
        // }, [items, globalTax]);

        // const deliveryPackaging = useMemo(() => {
      } else {
        const condition = String(item.condition || '').toLowerCase();
        if (condition === 'refurbished') {
          rate = (globalTax?.buying_refurbished?.relocationWarranty ?? 0) / 100;
        } else if (condition === 'mint condition' || condition === 'mint') {
          rate = (globalTax?.buying_mint?.relocationWarranty ?? 0) / 100;
        } else {
          rate = (globalTax?.buying_new?.relocationWarranty ?? 0) / 100;
        }
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  const deliveryPackaging = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const qty = Number(item.quantity || 1);
      const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
      const price = Number(item.pricePerDay || 0);
      const itemTotal = price * qty;
      let rate = 0;
      // if (isRentalItem(item)) {
      //   rate = (globalTax.rental?.deliveryPackaging ?? 0) / 100;
      // } else {
      //   const condition = String(item.condition || '').toLowerCase();
      //   rate =
      //     condition === 'refurbished'
      //       ? (globalTax.buying_refurbished?.deliveryPackaging ?? 0) / 100
      //       : (globalTax.buying_new?.deliveryPackaging ?? 0) / 100;
      // }
      if (item.taxBlocked) return sum;
      if (hasPositiveTaxOverride(item.defaultDeliveryPackaging)) {
        rate = Number(item.defaultDeliveryPackaging) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.deliveryPackaging ?? 0) / 100;
        //     } else {
        //       const condition = String(item.condition || '').toLowerCase();
        //       rate =
        //         condition === 'refurbished'
        //           ? (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100
        //           : (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
        //     }
        //     return sum + Math.round(itemTotal * rate);
        //   }, 0);
        // }, [items, globalTax]);
        // const installationFee = useMemo(() => {
      } else {
        const condition = String(item.condition || '').toLowerCase();
        if (condition === 'refurbished') {
          rate = (globalTax?.buying_refurbished?.deliveryPackaging ?? 0) / 100;
        } else if (condition === 'mint condition' || condition === 'mint') {
          rate = (globalTax?.buying_mint?.deliveryPackaging ?? 0) / 100;
        } else {
          rate = (globalTax?.buying_new?.deliveryPackaging ?? 0) / 100;
        }
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);
  const installationFee = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const qty = Number(item.quantity || 1);
      const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
      const price = Number(item.pricePerDay || 0);
      const itemTotal = price * qty;
      let rate = 0;
      // if (isRentalItem(item)) {
      //   rate = (globalTax.rental?.installationFee ?? 0) / 100;
      // } else {
      //   const condition = String(item.condition || '').toLowerCase();
      //   rate =
      //     condition === 'refurbished'
      //       ? (globalTax.buying_refurbished?.installationFee ?? 0) / 100
      //       : (globalTax.buying_new?.installationFee ?? 0) / 100;
      // }
      if (item.taxBlocked) return sum;
      if (hasPositiveTaxOverride(item.defaultInstallationFee)) {
        rate = Number(item.defaultInstallationFee) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.installationFee ?? 0) / 100;
        //     } else {
        //       const condition = String(item.condition || '').toLowerCase();
        //       rate =
        //         condition === 'refurbished'
        //           ? (globalTax?.buying_refurbished?.installationFee ?? 0) / 100
        //           : (globalTax?.buying_new?.installationFee ?? 0) / 100;
        //     }
        //     return sum + Math.round(itemTotal * rate);
        //   }, 0);
        // }, [items, globalTax]);

        // const platformFee = useMemo(() => {
      } else {
        const condition = String(item.condition || '').toLowerCase();
        if (condition === 'refurbished') {
          rate = (globalTax?.buying_refurbished?.installationFee ?? 0) / 100;
        } else if (condition === 'mint condition' || condition === 'mint') {
          rate = (globalTax?.buying_mint?.installationFee ?? 0) / 100;
        } else {
          rate = (globalTax?.buying_new?.installationFee ?? 0) / 100;
        }
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  const platformFee = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      // const qty = Number(item.quantity || 1);
      const qty = isDailyRentalItem(item) ? 1 : Number(item.quantity || 1);
      const price = Number(item.pricePerDay || 0);
      const itemTotal = price * qty;
      let rate = 0;
      // if (isRentalItem(item)) {
      //   rate = (globalTax.rental?.platformFee ?? 0) / 100;
      // } else {
      //   const condition = String(item.condition || '').toLowerCase();
      //   rate =
      //     condition === 'refurbished'
      //       ? (globalTax.buying_refurbished?.platformFee ?? 0) / 100
      //       : (globalTax.buying_new?.platformFee ?? 0) / 100;
      // }
      if (item.taxBlocked) return sum;
      if (hasPositiveTaxOverride(item.defaultPlatformFee)) {
        rate = Number(item.defaultPlatformFee) / 100;
      } else if (isRentalItem(item)) {
        rate = (globalTax?.rental?.platformFee ?? 0) / 100;
        //     } else {
        //       const condition = String(item.condition || '').toLowerCase();
        //       rate =
        //         condition === 'refurbished'
        //           ? (globalTax?.buying_refurbished?.platformFee ?? 0) / 100
        //           : (globalTax?.buying_new?.platformFee ?? 0) / 100;
        //     }
        //     return sum + Math.round(itemTotal * rate);
        //   }, 0);
        // }, [items, globalTax]);

        // const buyingBreakdown = useMemo(
      } else {
        const condition = String(item.condition || '').toLowerCase();
        if (condition === 'refurbished') {
          rate = (globalTax?.buying_refurbished?.platformFee ?? 0) / 100;
        } else if (condition === 'mint condition' || condition === 'mint') {
          rate = (globalTax?.buying_mint?.platformFee ?? 0) / 100;
        } else {
          rate = (globalTax?.buying_new?.platformFee ?? 0) / 100;
        }
      }
      return sum + Math.round(itemTotal * rate);
    }, 0);
  }, [items, globalTax]);

  const buyingBreakdown = useMemo(
    () =>
      computeGroupBreakdown(
        sellItems,
        globalTax,
        isCareProtectionEnabled,
        isRentalItem,
      ),
    [sellItems, globalTax, isCareProtectionEnabled],
  );
  const dailyRentalBreakdown = useMemo(
    () =>
      computeGroupBreakdown(
        dailyRentalItems,
        globalTax,
        isCareProtectionEnabled,
        isRentalItem,
      ),
    [dailyRentalItems, globalTax, isCareProtectionEnabled],
  );
  const monthlyRentalBreakdown = useMemo(
    () =>
      computeGroupBreakdown(
        monthlyRentalItems,
        globalTax,
        isCareProtectionEnabled,
        isRentalItem,
      ),
    [monthlyRentalItems, globalTax, isCareProtectionEnabled],
  );

  const rentalItems = useMemo(
    () => [...dailyRentalItems, ...monthlyRentalItems],
    [dailyRentalItems, monthlyRentalItems],
  );
  const rentalBreakdown = useMemo(
    () =>
      computeGroupBreakdown(
        rentalItems,
        globalTax,
        isCareProtectionEnabled,
        isRentalItem,
      ),
    [rentalItems, globalTax, isCareProtectionEnabled],
  );

  // const discountAmount = appliedCoupon?.discountAmount || 0;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  // const serviceBookingTotal = useMemo(
  //   () => Number(pendingServiceBooking?.totalAmount || 0),
  //   [pendingServiceBooking],
  // );
  const serviceBookingTotal = useMemo(() => {
    return pendingServiceBookings.reduce((sum, booking) => {
      const base = Number(booking?.totalAmount || 0);
      if (!globalTax) return sum + base;
      const tax = booking?.subCategoryTax || {};
      const isBlocked =
        booking?.taxBlocked === true || tax?.taxBlocked === true;
      if (isBlocked) return sum + base;
      const calc = (subKey, globalKey) => {
        const rate =
          tax[subKey] != null
            ? Number(tax[subKey])
            : (globalTax?.services?.[globalKey] ?? 0);
        return Math.round((base * rate) / 100);
      };
      const feesSum =
        calc('defaultGst', 'gst') +
        (isCareProtectionEnabled ? calc('defaultCareTax', 'careTax') : 0) +
        calc('defaultRepairWarranty', 'repairWarranty') +
        calc('defaultRelocationWarranty', 'relocationWarranty') +
        calc('defaultDeliveryPackaging', 'deliveryPackaging') +
        calc('defaultInstallationFee', 'installationFee') +
        calc('defaultPlatformFee', 'platformFee');
      return sum + base + feesSum;
    }, 0);
  }, [pendingServiceBookings, globalTax, isCareProtectionEnabled]);

  // const totalPayToday = useMemo(() => {
  //   return (
  //     total +
  //     refundableDepositTotal +
  //     deliveryFee +
  //     gst +
  //     careProtection -
  //     discountAmount
  //   );
  // }, [
  //   total,
  //   refundableDepositTotal,
  //   deliveryFee,
  //   gst,
  //   careProtection,
  //   discountAmount,
  // ]);

  // const totalPayToday = useMemo(() => {
  //   return (
  //     total +
  //     refundableDepositTotal +
  //     deliveryFee +
  //     gst +
  //     careProtection +
  //     repairWarranty +
  //     relocationWarranty +
  //     deliveryPackaging +
  //     installationFee +
  //     platformFee -
  //     discountAmount
  //   );
  // }, [
  //   total,
  //   refundableDepositTotal,
  //   deliveryFee,
  //   gst,
  //   careProtection,
  //   repairWarranty,
  //   relocationWarranty,
  //   deliveryPackaging,
  //   installationFee,
  //   platformFee,
  //   discountAmount,
  // ]);

  const totalPayToday = useMemo(() => {
    return (
      total +
      refundableDepositTotal +
      deliveryFee +
      gst +
      careProtection +
      repairWarranty +
      relocationWarranty +
      deliveryPackaging +
      installationFee +
      platformFee +
      serviceBookingTotal -
      discountAmount
    );
  }, [
    total,
    refundableDepositTotal,
    deliveryFee,
    gst,
    careProtection,
    repairWarranty,
    relocationWarranty,
    deliveryPackaging,
    installationFee,
    platformFee,
    serviceBookingTotal,
    discountAmount,
  ]);

  const imgSrc = (src) => {
    if (!src) return 'https://via.placeholder.com/100?text=No+Image';
    return src.startsWith('http')
      ? src
      : `${BACKEND_URL}${src}`;
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // If a guest clicked "Proceed to Checkout", we open the login modal.
  // Once that modal closes AND the user is now authenticated, we resume
  // checkout automatically instead of leaving them stuck on the cart page.
  useEffect(() => {
    const wasOpen = prevAuthModalOpenRef.current;
    prevAuthModalOpenRef.current = authModalOpen;
    if (
      wasOpen &&
      !authModalOpen &&
      isAuthenticated &&
      pendingCheckoutRef.current
    ) {
      pendingCheckoutRef.current = false;
      try {
        localStorage.setItem(
          'rentpay_checkout_total',
          String(Math.round(totalPayToday)),
        );
      } catch {}
      router.push('/checkout');
    }
  }, [authModalOpen, isAuthenticated, totalPayToday, router]);

  useEffect(() => {
    if (!isHydrated) return;
    const readBookings = () => {
      try {
        const raw = localStorage.getItem('rentpay_pending_service_bookings');
        const list = raw ? JSON.parse(raw) : [];
        setPendingServiceBookings(Array.isArray(list) ? list : []);
      } catch {
        setPendingServiceBookings([]);
      }
    };
    readBookings();
    window.addEventListener('rn_service_cart_changed', readBookings);
    return () =>
      window.removeEventListener('rn_service_cart_changed', readBookings);
  }, [isHydrated]);

  // useEffect(() => {
  //   if (!pendingServiceBooking?.productId) {
  //     setServiceOffer(null);
  //     return;
  //   }
  //   let cancelled = false;
  //   apiGetPublicActiveOffers()
  //     .then((res) => {
  //       if (cancelled) return;
  //       const offers = res.data?.offers || [];
  //       const match = offers.find(
  //         (o) =>
  //           String(o.productId?._id || o.productId) ===
  //           String(pendingServiceBooking.productId),
  //       );
  //       setServiceOffer(match || null);
  //     })
  //     .catch(() => {
  //       if (!cancelled) setServiceOffer(null);
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [pendingServiceBooking?.productId]);
  // Note: pendingServiceBooking.totalAmount is already the final, discounted
  // price (set once by the booking modal). We must NOT re-fetch and re-apply
  // the offer here, or the discount gets applied twice.

  useEffect(() => {
    localStorage.setItem(
      'rentpay_care_protection_enabled',
      String(isCareProtectionEnabled),
    );
  }, [isCareProtectionEnabled]);

  useEffect(() => {
    apiGetActiveCoupons()
      .then((res) => setActiveCoupons(res.data?.data || []))
      .catch(() => {});
  }, []);

  // useEffect(() => {
  //   const fetchTax = async () => {
  //     try {
  //       const { apiGetGlobalTax } = await import('@/lib/api');
  //       const res = await apiGetGlobalTax();
  //       setGlobalTax(res.data?.data?.config || null);
  //     } catch (e) {
  //       console.error('Failed to load global tax', e);
  //     }
  //   };
  //   fetchTax();
  // }, []);

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
  useEffect(() => {
    if (!isHydrated) return;
    dispatch(syncCart());
  }, [dispatch, user, isAuthenticated, isHydrated]);

  useEffect(() => {
    let cancelled = false;
    const ids = Array.from(new Set(items.map((i) => i.productId))).filter(
      Boolean,
    );
    if (!ids.length) {
      setStockByProductId({});
      setDeliveryByProductId({});
      return;
    }

    Promise.all(
      ids.map((id) =>
        apiGetProductById(id)
          .then((res) => ({
            id,
            stock:
              res.data?.product?.stock != null
                ? Number(res.data.product.stock)
                : 0,
            deliveryLabel: getDeliveryTimelineLabel(res.data?.product),
          }))
          .catch(() => ({ id, stock: 0, deliveryLabel: '' })),
      ),
    ).then((pairs) => {
      if (cancelled) return;
      const nextStock = {};
      const nextDelivery = {};
      pairs.forEach((p) => {
        nextStock[p.id] = p.stock;
        nextDelivery[p.id] = p.deliveryLabel;
      });
      setStockByProductId(nextStock);
      setDeliveryByProductId(nextDelivery);
    });

    return () => {
      cancelled = true;
    };
  }, [stockMapKey]);

  const getStockAndCheck = async (productId, nextQty) => {
    const id = productId;
    const res = await apiGetProductById(id);
    const stock = res.data?.product?.stock ?? stockByProductId[id] ?? 0;
    return {
      ok: Number(nextQty) <= Number(stock || 0),
      stock: Number(stock || 0),
    };
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      // const res = await apiValidateCoupon({ code, orderAmount: total });
      // const res = await apiValidateCoupon({
      //   code,
      //   orderAmount: rentalOnlyTotal,
      // });
      // const res = await apiValidateCoupon({
      //   code,
      //   orderAmount: rentalOnlyTotal,
      //   category: 'Rental',
      // });
      const res = await apiValidateCoupon({ code, categoryTotals });
      dispatch(setAppliedCoupon(res.data.data)); // 👈 Redux mein store
      pushToast(
        `"${code}" applied! ₹${res.data.data.discountAmount} saved`,
        'success',
      );
    } catch (err) {
      setCouponError(err?.response?.data?.message || 'Invalid coupon');
      dispatch(clearAppliedCoupon());
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
    setCouponCode('');
    setCouponError('');
  };

  // const removeServiceBooking = (productId) => {
  //   setPendingServiceBookings((prev) => {
  //     const updated = prev.filter(
  //       (b) => String(b.productId) !== String(productId),
  //     );
  //     localStorage.setItem(
  //       'rentpay_pending_service_bookings',
  //       JSON.stringify(updated),
  //     );
  //     return updated;
  //   });
  // };
  const removeServiceBooking = (productId) => {
    setPendingServiceBookings((prev) => {
      const updated = prev.filter(
        (b) => String(b.productId) !== String(productId),
      );
      localStorage.setItem(
        'rentpay_pending_service_bookings',
        JSON.stringify(updated),
      );

      // Mirror the removal to the server so admin's live cart table
      // drops this service booking too, same pattern as product cart sync.
      const userToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('userToken')
          : null;
      if (userToken) {
        api
          .post('/live-cart/sync-services', { bookings: updated })
          .catch(() => {
            // Silent fail — never disrupt the user's cart UI.
          });
      }

      return updated;
    });
  };

  if (!isHydrated) {
    return <div className="w-full mx-auto px-4 py-8" />;
  }

  if (items.length === 0 && pendingServiceBookings.length === 0) {
    return (
      <div className="w-full mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-black mb-4">
          Your cart is empty
        </h1>
        <Link
          href="/products"
          className="text-primary font-medium hover:underline"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] min-h-[calc(100vh-64px)]">
      <div className="max-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            {/* <ShoppingCart className="w-7 h-7 text-blue-600" /> */}
            Shopping Cart
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">
            {items.length + pendingServiceBookings.length} item
            {items.length + pendingServiceBookings.length !== 1 ? 's' : ''} in
            your cart
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-4">
            {/* {pendingServiceBooking && (
              <div className="p-4 bg-white border border-gray-200 rounded-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <img
                      src={
                        pendingServiceBooking.image ||
                        'https://via.placeholder.com/100?text=Service'
                      }
                      alt=""
                      className="w-full sm:w-28 h-28 object-cover rounded-xl"
                    />
                    <span className="absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white bg-red-500">
                      Service
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-2xl text-black truncate">
                      {pendingServiceBooking.serviceName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pendingServiceBooking.bookingDate} ·{' '}
                      {pendingServiceBooking.timeSlot?.label}
                    </p>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md">
                      <div className="rounded-xl border border-[#FFD6A8] bg-white px-3 py-2">
                        <p className="text-3xl text-center font-semibold text-[#F97316]">
                          ₹{formatINR(pendingServiceBooking.totalAmount)}
                        </p>
                        <p className="text-xs text-center text-gray-500">
                          Service Fee
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <div className="inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden">
                        <button
                          onClick={() => {
                            localStorage.removeItem(
                              'rentpay_pending_service_booking',
                            );
                            setPendingServiceBooking(null);
                            window.dispatchEvent(
                              new CustomEvent('rn_service_cart_changed'),
                            );
                          }}
                          className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            localStorage.removeItem(
                              'rentpay_pending_service_booking',
                            );
                            setPendingServiceBooking(null);
                            window.dispatchEvent(
                              new CustomEvent('rn_service_cart_changed'),
                            );
                          }}
                          className="px-3 h-9 flex items-center text-sm text-red-600 font-medium hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {pendingServiceBookings.map((booking) => {
              const hasOffer =
                Number(booking.originalAmount || 0) >
                Number(booking.totalAmount || 0);
              return (
                <div
                  key={booking.bookingId || booking.productId}
                  //   className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                  // >
                  //   <div className="flex flex-row gap-3 sm:gap-4 p-3 sm:p-4">
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <div className="flex flex-row gap-3 sm:gap-4 p-3 sm:p-4 pb-4 sm:pb-4">
                    {/* Image */}
                    <div className="relative shrink-0 w-1/4 sm:w-auto">
                      <img
                        src={
                          booking.image ||
                          'https://via.placeholder.com/100?text=Service'
                        }
                        alt=""
                        className="w-full sm:w-28 h-24 sm:h-28 object-cover rounded-xl"
                      />
                      <span className="absolute top-1 left-1 sm:top-2 sm:left-2 text-[8px] sm:text-[10px] uppercase px-1.5 py-0.5 sm:px-2 rounded-full text-white bg-[#8B5CF6] font-semibold">
                        Service
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 sm:block">
                        <p className="font-semibold text-sm sm:text-2xl text-black truncate">
                          {booking.serviceName}
                        </p>
                        <div className="flex sm:hidden items-center gap-1 shrink-0">
                          {/* <button
                            onClick={() =>
                              removeServiceBooking(booking.productId)
                            }
                            className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border border-[#D1D5DC] rounded-md shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button> */}
                          <button
                            onClick={() =>
                              removeServiceBooking(booking.productId)
                            }
                            className="w-6 h-6 sm:w-6 sm:h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
                          >
                            <Trash2 className="w-3 h-3 sm:w-3 sm:h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={changeSlotLoading}
                            onClick={async () => {
                              if (changeSlotLoading) return;
                              setChangeSlotLoading(true);
                              try {
                                setChangeSlotBookingProductId(
                                  booking.productId,
                                );
                                const res = await apiGetServiceById(
                                  booking.productId,
                                );
                                setChangeSlotProduct(
                                  res.data?.product || res.data,
                                );
                                setChangeSlotOpen(true);
                              } catch {
                                setChangeSlotProduct(null);
                                setChangeSlotOpen(true);
                              } finally {
                                setChangeSlotLoading(false);
                              }
                            }}
                            className="flex items-center gap-0.5 px-1.5 py-1 rounded-md border-2 border-orange-400 text-orange-600 text-[9px] font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
                          >
                            <Calendar className="w-3 h-3" />
                            {changeSlotLoading ? '...' : 'Change'}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm sm:text-2xl font-bold text-[#F97316] mt-1 flex items-center gap-2 flex-wrap">
                        ₹{formatINR(booking.totalAmount)}
                        {hasOffer ? (
                          <>
                            <span className="text-xs sm:text-sm font-normal text-gray-400 line-through">
                              ₹{formatINR(booking.originalAmount)}
                            </span>
                            {/* <span className="inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-medium text-[#F97316] border-[#F97316] bg-orange-50 whitespace-nowrap">
                            {serviceDiscountPercent}% Off
                          </span> */}
                          </>
                        ) : null}
                      </p>

                      {/* Scheduled Slot row */}
                      {/* <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-sm text-gray-500 flex-wrap">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-400" />
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            Scheduled Slot:
                          </span>
                          <span className="text-[10px] sm:text-xs font-semibold text-[#8B5CF6]">
                            {booking.bookingDate} @ {booking.timeSlot?.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 mb-1 hidden sm:flex justify-end">
                        <div className="inline-flex items-center gap-2"> */}
                      <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-sm text-gray-500 flex-wrap">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gray-400" />
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            Scheduled Slot:
                          </span>
                          <span className="text-[10px] sm:text-xs font-semibold text-[#8B5CF6]">
                            {booking.bookingDate} @ {booking.timeSlot?.label}
                          </span>
                        </div>
                        <div className="hidden sm:inline-flex items-center gap-2 shrink-0">
                          {/* <button
                            onClick={() =>
                              removeServiceBooking(booking.productId)
                            }
                            className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button> */}
                          .
                          <button
                            onClick={() =>
                              removeServiceBooking(booking.productId)
                            }
                            className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={changeSlotLoading}
                            onClick={async () => {
                              if (changeSlotLoading) return;
                              setChangeSlotLoading(true);
                              try {
                                setChangeSlotBookingProductId(
                                  booking.productId,
                                );
                                const res = await apiGetServiceById(
                                  booking.productId,
                                );
                                setChangeSlotProduct(
                                  res.data?.product || res.data,
                                );
                                setChangeSlotOpen(true);
                              } catch {
                                setChangeSlotProduct(null);
                                setChangeSlotOpen(true);
                              } finally {
                                setChangeSlotLoading(false);
                              }
                            }}
                            //   className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-sm font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
                            // >
                            //   <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            //   {changeSlotLoading ? 'Loading...' : 'Change Slot'}
                            // </button>
                            className="flex items-center gap-1 sm:gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-xs font-semibold hover:bg-orange-50 disabled:opacity-50 whitespace-nowrap"
                          >
                            {/* <Calendar className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                            {changeSlotLoading ? 'Loading...' : 'Change Slot'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })} */}
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {changeSlotLoading ? 'Loading...' : 'Change Slot'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.map((item) => (
              <div
                key={item.productId}
                className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl sm:rounded-2xl"
              >
                <div className="flex flex-row gap-3 sm:gap-4">
                  {/* <div className="relative">
                    <img
                      src={imgSrc(item.image)}
                      alt=""
                      className="w-full sm:w-28 h-28 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100';
                      }}
                    />
                    <span
                      className={`absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white ${
                        isRentalItem(item) ? 'bg-orange-500' : 'bg-blue-600'
                      }`}
                    >
                      {isRentalItem(item) ? 'Rental' : 'Buy'}
                    </span>
                  </div> */}
                  <div
                    className="relative cursor-pointer shrink-0 w-1/4 sm:w-auto"
                    onClick={() => {
                      const isSell =
                        String(item.productType || 'Rental') === 'Sell';
                      router.push(
                        isSell
                          ? `/buy-product-details/${item.productId}`
                          : `/rent-product-details/${item.productId}`,
                      );
                    }}
                  >
                    <img
                      src={imgSrc(item.image)}
                      alt=""
                      className="w-full sm:w-28 h-24 sm:h-28 object-cover rounded-xl hover:opacity-90 transition"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100';
                      }}
                    />
                    <span
                      className={`absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full text-white ${
                        isRentalItem(item) ? 'bg-orange-500' : 'bg-blue-600'
                      }`}
                    >
                      {isRentalItem(item) ? 'Rental' : 'Buy'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-row items-center sm:items-start sm:justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <p className="font-semibold text-sm sm:text-2xl text-black truncate flex-1 min-w-0 sm:flex-initial">
                        {item.title}
                      </p>
                      {/* {isRentalItem(item) ? (
                        <div className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                          {getRentalTenureLabel(item)}
                        </div>
                      ) : null} */}
                      <div
                        className={
                          isDailyRentalItem(item) ? 'hidden sm:block' : ''
                        }
                      >
                        {isRentalItem(item) ? (
                          Array.isArray(item.rentalConfigurations) &&
                          item.rentalConfigurations.length > 1 ? (
                            <CartTenureButton
                              item={item}
                              offer={item.offer || null}
                              // onTenureChange={(
                              //   selected,
                              //   discountedPerUnit,
                              //   discountedTotal,
                              // ) => {
                              //   const isDayUnit =
                              //     selected?.periodUnit === 'day' ||
                              //     (Number(selected?.days) > 0 &&
                              //       !Number(selected?.months));
                              //   dispatch(
                              //     updateTenure({
                              //       productId: item.productId,
                              //       rentalMonths: isDayUnit
                              //         ? Number(selected.days) || 1
                              //         : Number(selected.months) || 1,
                              //       pricePerDay: discountedTotal,
                              //       tenureUnit: isDayUnit ? 'day' : 'month',
                              //     }),
                              //   );
                              // }}
                              onTenureChange={(
                                selected,
                                discountedPerUnit,
                                discountedTotal,
                              ) => {
                                const isDayUnit =
                                  selected?.periodUnit === 'day' ||
                                  (Number(selected?.days) > 0 &&
                                    !Number(selected?.months));
                                dispatch(
                                  updateTenure({
                                    productId: item.productId,
                                    rentalMonths: isDayUnit
                                      ? Number(selected.days) || 1
                                      : Number(selected.months) || 1,
                                    pricePerDay: isDayUnit
                                      ? discountedTotal
                                      : discountedPerUnit,
                                    tenureUnit: isDayUnit ? 'day' : 'month',
                                  }),
                                );
                              }}
                            />
                          ) : (
                            <div
                              className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 border rounded-md sm:rounded-lg text-[10px] sm:text-sm bg-white shrink-0 whitespace-nowrap border-gray-200 ${
                                isDailyRentalItem(item)
                                  ? 'sm:!border-orange-400 sm:!text-orange-600'
                                  : ''
                              }`}
                            >
                              {getRentalTenureLabel(item)}
                            </div>
                          )
                        ) : null}
                      </div>
                      {isDailyRentalItem(item) ? (
                        <div className="flex sm:hidden items-center gap-1 shrink-0">
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.productId))
                            }
                            className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-md shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDateModalItem(item)}
                            className="flex items-center gap-0.5 px-1.5 py-1 rounded-md border-2 border-orange-400 text-orange-600 text-[9px] font-semibold hover:bg-orange-50 whitespace-nowrap"
                          >
                            <Calendar className="w-3 h-3" />
                            Change
                          </button>
                        </div>
                      ) : null}
                      {/* {isRentalItem(item) && !isDailyRentalItem(item) ? (
                        <div className="flex sm:hidden items-center border border-[#D1D5DC] rounded-md overflow-hidden shrink-0">
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.productId))
                            }
                            className="w-5 h-5 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId,
                                  quantity: item.quantity - 1,
                                }),
                              )
                            }
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-4 text-center text-[9px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={async () => {
                              const productId = item.productId;
                              const nextQty = item.quantity + 1;
                              const { ok, stock } = await getStockAndCheck(
                                productId,
                                nextQty,
                              );
                              if (!ok) {
                                pushToast(
                                  `Only ${stock} available in stock for this product.`,
                                  'error',
                                );
                                return;
                              }
                              dispatch(
                                updateQuantity({
                                  productId,
                                  quantity: nextQty,
                                }),
                              );
                            }}
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : null} */}
                      {!isRentalItem(item) ? (
                        <div className="flex sm:hidden items-center border-2 border-[#D1D5DC] rounded-md overflow-hidden shrink-0">
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.productId))
                            }
                            className="w-5 h-5 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId,
                                  quantity: item.quantity - 1,
                                }),
                              )
                            }
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-4 text-center text-[9px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={async () => {
                              const productId = item.productId;
                              const nextQty = item.quantity + 1;
                              const { ok, stock } = await getStockAndCheck(
                                productId,
                                nextQty,
                              );
                              if (!ok) {
                                pushToast(
                                  `Only ${stock} available in stock for this product.`,
                                  'error',
                                );
                                return;
                              }
                              dispatch(
                                updateQuantity({
                                  productId,
                                  quantity: nextQty,
                                }),
                              );
                            }}
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {/* <div
                      className={`mt-1.5 sm:mt-3 grid ${
                        isDailyRentalItem(item)
                          ? 'grid-cols-3'
                          : 'grid-cols-2 sm:grid-cols-3'
                      } gap-1 sm:gap-2 max-w-md`}
                    > */}
                    <div
                      className={`mt-1.5 sm:mt-0.5 grid ${
                        isDailyRentalItem(item)
                          ? 'grid-cols-3'
                          : 'grid-cols-2 sm:grid-cols-3'
                      } gap-1 sm:gap-2 max-w-md`}
                    >
                      {isDailyRentalItem(item) ? (
                        <div className="flex sm:hidden flex-col items-center justify-center rounded-md border border-[#FFD6A8] bg-white px-1 py-0.5">
                          <p className="text-xs font-semibold text-[#F97316] text-center leading-tight">
                            {getRentalTenureLabel(item)}
                          </p>
                        </div>
                      ) : null}
                      {/* <div className="rounded-md sm:rounded-xl border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-3 sm:py-2">
                        <p className="text-xs sm:text-3xl text-center font-semibold text-[#F97316]">
                          ₹{formatINR(item.pricePerDay)}
                        </p>
                        <p className="text-[8px] sm:text-xs text-center text-gray-500 truncate">
                          {isRentalItem(item)
                            ? getRentalPriceLabel(item)
                            : 'Sale Price'}
                        </p>
                      </div>
                      {isRentalItem(item) ? (
                        <div className="rounded-md sm:rounded-xl border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-3 sm:py-2">
                          <p className="text-xs sm:text-3xl text-center font-semibold text-[#F97316]">
                            ₹{formatINR(item.refundableDeposit)}
                          </p>
                          <p className="text-[8px] sm:text-xs text-center text-gray-500">
                            Deposit
                          </p>
                        </div>
                      ) : null} */}
                      <div className="rounded-md sm:rounded-lg border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-2.5 sm:py-1">
                        <p className="text-xs sm:text-xl text-center font-semibold text-[#F97316]">
                          ₹{formatINR(item.pricePerDay)}
                        </p>
                        <p className="text-[8px] sm:text-xs text-center text-gray-500 truncate">
                          {isRentalItem(item)
                            ? getRentalPriceLabel(item)
                            : 'Sale Price'}
                        </p>
                      </div>
                      {isRentalItem(item) ? (
                        <div className="rounded-md sm:rounded-lg border border-[#FFD6A8] bg-white px-1.5 py-0.5 sm:px-2.5 sm:py-1">
                          <p className="text-xs sm:text-xl text-center font-semibold text-[#F97316]">
                            ₹{formatINR(item.refundableDeposit)}
                          </p>
                          <p className="text-[8px] sm:text-xs text-center text-gray-500">
                            Deposit
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* <p className="text-xs text-gray-500 mt-2">
                      {deliveryByProductId[item.productId] ||
                        'Delivery in 2-3 days'}
                    </p> */}
                    {/* {isDailyRentalItem(item) &&
                    item.startDate &&
                    item.endDate ? (
                      <p className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 flex items-center gap-1 flex-wrap">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
                        <span>
                          {formatRangeLine(item.startDate)}{' '}
                          <span className="text-orange-500 font-semibold">
                            to
                          </span>{' '}
                          {formatRangeLine(item.endDate)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {deliveryByProductId[item.productId] ||
                          'Delivery in 2-3 days'}
                      </p>
                    )}

                    <div className="mt-1 sm:mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-500 mt-2"></p> */}
                    {/* <div className="mt-1 sm:mt-3 flex items-center justify-between gap-2">
                      {isDailyRentalItem(item) && */}
                    <div className="mt-0.5 sm:mt-0.5 flex items-center justify-between gap-2">
                      {isDailyRentalItem(item) &&
                      item.startDate &&
                      item.endDate ? (
                        <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 flex-wrap">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
                          <span>
                            {formatRangeLine(item.startDate)}{' '}
                            <span className="text-orange-500 font-semibold">
                              to
                            </span>{' '}
                            {formatRangeLine(item.endDate)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {deliveryByProductId[item.productId] ||
                            'Delivery in 2-3 days'}
                        </p>
                      )}
                      {/* 
                      <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            dispatch(removeFromCart(item.productId))
                          }
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                quantity: item.quantity - 1,
                              }),
                            )
                          }
                          className="w-9 h-9 inline-flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={async () => {
                            const productId = item.productId;
                            const nextQty = item.quantity + 1;
                            const { ok, stock } = await getStockAndCheck(
                              productId,
                              nextQty,
                            );
                            if (!ok) {
                              pushToast(
                                `Only ${stock} available in stock for this product.`,
                                'error',
                              );
                              return;
                            }
                            dispatch(
                              updateQuantity({
                                productId,
                                quantity: nextQty,
                              }),
                            );
                          }}
                          className="w-9 h-9 inline-flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div> */}
                      {/* <div className="inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden">
                       
                        <button
                          onClick={() =>
                            dispatch(removeFromCart(item.productId))
                          }
                          className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                       
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                quantity: item.quantity - 1,
                              }),
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 "
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                      
                        <span className="w-10 text-center text-sm ">
                          {item.quantity}
                        </span>

                       
                        <button
                          onClick={async () => {
                            const productId = item.productId;
                            const nextQty = item.quantity + 1;
                            const { ok, stock } = await getStockAndCheck(
                              productId,
                              nextQty,
                            );

                            if (!ok) {
                              pushToast(
                                `Only ${stock} available in stock for this product.`,
                                'error',
                              );
                              return;
                            }

                            dispatch(
                              updateQuantity({
                                productId,
                                quantity: nextQty,
                              }),
                            );
                          }}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div> */}
                      {/* {isDailyRentalItem(item) ? (
                        <div className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.productId))
                            }
                            className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDateModalItem(item)}
                            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-sm font-semibold hover:bg-orange-50 whitespace-nowrap"
                          >
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Change Date
                          </button>
                        </div>
                      ) : ( */}
                      {isDailyRentalItem(item) ? (
                        <div className="hidden sm:inline-flex items-center gap-1.5 sm:gap-1.5">
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.productId))
                            }
                            className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-red-600 hover:bg-gray-50 border-2 border-[#D1D5DC] rounded-lg shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDateModalItem(item)}
                            className="flex items-center gap-1 sm:gap-1 px-2  py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border-2 border-orange-400 text-orange-600 text-[11px] sm:text-xs font-semibold hover:bg-orange-50 whitespace-nowrap"
                          >
                            <Calendar className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                            Change Date
                          </button>
                        </div>
                      ) : (
                        // <div className="hidden sm:inline-flex items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden shrink-0">
                        // <div
                        //   className={`${
                        //     !isRentalItem(item)
                        //       ? 'hidden sm:inline-flex'
                        //       : 'inline-flex'
                        //   } items-center border-2 border-[#D1D5DC] rounded-lg overflow-hidden shrink-0`}
                        // >
                        //   {/* Trash */}
                        //   <button
                        //     onClick={() =>
                        //       dispatch(removeFromCart(item.productId))
                        //     }
                        //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
                        //   >
                        //     <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        //   </button>

                        //   {/* Minus */}
                        //   <button
                        //     onClick={() =>
                        //       dispatch(
                        //         updateQuantity({
                        //           productId: item.productId,
                        //           quantity: item.quantity - 1,
                        //         }),
                        //       )
                        //     }
                        //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 "
                        //   >
                        //     <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        //   </button>

                        //   {/* Quantity */}
                        //   <span className="w-7 sm:w-10 text-center text-xs sm:text-sm ">
                        //     {item.quantity}
                        //   </span>

                        //   {/* Plus */}
                        //   <button
                        //     onClick={async () => {
                        //       const productId = item.productId;
                        //       const nextQty = item.quantity + 1;
                        //       const { ok, stock } = await getStockAndCheck(
                        //         productId,
                        //         nextQty,
                        //       );

                        //       if (!ok) {
                        //         pushToast(
                        //           `Only ${stock} available in stock for this product.`,
                        //           'error',
                        //         );
                        //         return;
                        //       }

                        //       dispatch(
                        //         updateQuantity({
                        //           productId,
                        //           quantity: nextQty,
                        //         }),
                        //       );
                        //     }}
                        //     className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50"
                        //   >
                        //     <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        //   </button>
                        // </div>
                        // <div
                        //   className={`${
                        //     !isRentalItem(item)
                        //       ? 'hidden sm:inline-flex'
                        //       : 'inline-flex'
                        //   } items-center border sm:border-2 border-[#D1D5DC] rounded-md sm:rounded-lg overflow-hidden shrink-0`}
                        // >

                        //   <button
                        //     onClick={() =>
                        //       dispatch(removeFromCart(item.productId))
                        //     }
                        //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
                        //   >
                        //     <Trash2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                        //   </button>

                        //   <button
                        //     onClick={() =>
                        //       dispatch(
                        //         updateQuantity({
                        //           productId: item.productId,
                        //           quantity: item.quantity - 1,
                        //         }),
                        //       )
                        //     }
                        //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 "
                        //   >
                        //     <Minus className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                        //   </button>

                        //   <span className="w-4 sm:w-10 text-center text-[9px] sm:text-sm ">
                        //     {item.quantity}
                        //   </span>

                        //   <button
                        //     onClick={async () => {
                        //       const productId = item.productId;
                        //       const nextQty = item.quantity + 1;
                        //       const { ok, stock } = await getStockAndCheck(
                        //         productId,
                        //         nextQty,
                        //       );

                        //       if (!ok) {
                        //         pushToast(
                        //           `Only ${stock} available in stock for this product.`,
                        //           'error',
                        //         );
                        //         return;
                        //       }

                        //       dispatch(
                        //         updateQuantity({
                        //           productId,
                        //           quantity: nextQty,
                        //         }),
                        //       );
                        //     }}
                        //     className="w-5 h-5 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50"
                        //   >
                        //     <Plus className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                        //   </button>
                        // </div>
                        <div
                          className={`${
                            !isRentalItem(item)
                              ? 'hidden sm:inline-flex'
                              : 'inline-flex'
                          } items-center border sm:border-2 border-[#D1D5DC] rounded-md sm:rounded-lg overflow-hidden shrink-0`}
                        >
                          {/* Trash */}
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.productId))
                            }
                            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-red-600 hover:bg-gray-50 border-r border-gray-300"
                          >
                            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>

                          {/* Minus */}
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId,
                                  quantity: item.quantity - 1,
                                }),
                              )
                            }
                            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-50 "
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>

                          {/* Quantity */}
                          <span className="w-4 sm:w-7 text-center text-[9px] sm:text-xs ">
                            {item.quantity}
                          </span>

                          {/* Plus */}
                          <button
                            onClick={async () => {
                              const productId = item.productId;
                              const nextQty = item.quantity + 1;
                              const { ok, stock } = await getStockAndCheck(
                                productId,
                                nextQty,
                              );

                              if (!ok) {
                                pushToast(
                                  `Only ${stock} available in stock for this product.`,
                                  'error',
                                );
                                return;
                              }

                              dispatch(
                                updateQuantity({
                                  productId,
                                  quantity: nextQty,
                                }),
                              );
                            }}
                            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* <p className="text-xs text-gray-500 mt-2">
                      Available stock: {stockByProductId[item.productId] ?? '—'}
                    </p> */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="xl:col-span-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-5 sticky top-24">
              {/* <button
                type="button"
                onClick={() => setIsSummaryOpen((p) => !p)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h2 className="text-2xl font-semibold text-black">
                  Order Summary
                </h2>
                <ChevronRight
                  className={`w-5 h-5 text-gray-500 transition-transform ${isSummaryOpen ? 'rotate-90' : ''}`}
                />
              </button>
              <div
                className={`space-y-3 text-sm overflow-hidden transition-all duration-300 ${isSummaryOpen ? 'max-h-[1200px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}
              > */}

              <h2 className="text-xl font-semibold text-black mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm mb-4">
                {/* {pendingServiceBooking && (
                  <div className="border border-orange-100 bg-orange-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        Service Summary
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem(
                            'rentpay_pending_service_booking',
                          );
                          setPendingServiceBooking(null);
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      {pendingServiceBooking.image ? (
                        <img
                          src={pendingServiceBooking.image}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {pendingServiceBooking.serviceName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {pendingServiceBooking.bookingDate} ·{' '}
                          {pendingServiceBooking.timeSlot?.label}
                        </p>
                      </div>
                      <span className="font-medium text-gray-900 shrink-0">
                        ₹{formatINR(serviceBookingTotal)}
                      </span>
                    </div>
                  </div>
                )} */}
                {[
                  {
                    key: 'buying',
                    title: `Buying Summary (${sellItems.length} item${sellItems.length === 1 ? '' : 's'})`,
                    items: sellItems,
                    breakdown: buyingBreakdown,
                    show: sellItems.length > 0,
                  },
                  // {
                  //   key: 'rental',
                  //   title: `Rental Summary (${rentalItems.length} item${rentalItems.length === 1 ? '' : 's'})`,
                  //   items: rentalItems,
                  //   breakdown: rentalBreakdown,
                  //   show: rentalItems.length > 0,
                  // },
                  {
                    key: 'rental',
                    title: `Rental Summary (${rentalItems.length} item${rentalItems.length === 1 ? '' : 's'})`,
                    items: rentalItems,
                    breakdown: rentalBreakdown,
                    show: rentalItems.length > 0,
                    showAllTaxes: true,
                  },
                  // ]
                  //   .filter((g) => g.show)
                  //   .map((group) => (
                ]
                  .concat(
                    pendingServiceBookings.length > 0
                      ? [
                          {
                            key: 'service',
                            title: `Service Summary (${pendingServiceBookings.length} item${pendingServiceBookings.length === 1 ? '' : 's'})`,
                            isService: true,
                            breakdown: {
                              itemsTotal: serviceBookingsWithMeta.reduce(
                                (s, m) => s + m.breakdown.itemsTotal,
                                0,
                              ),
                              fees: serviceBookingsWithMeta.reduce((acc, m) => {
                                Object.keys(m.breakdown.fees).forEach((k) => {
                                  acc[k] = (acc[k] || 0) + m.breakdown.fees[k];
                                });
                                return acc;
                              }, {}),
                            },
                            show: true,
                          },
                        ]
                      : [],
                  )
                  .filter((g) => g.show)
                  .map((group) => (
                    <div
                      key={group.key}
                      className="border border-gray-100 rounded-xl"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(group.key)}
                        className="w-full flex items-center justify-between px-3 py-2"
                      >
                        <span className="font-medium text-gray-800">
                          {group.title}
                        </span>
                        {/* <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            ₹{formatINR(Math.round(group.breakdown.itemsTotal))}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-gray-500 transition-transform ${openSection[group.key] ? 'rotate-90' : ''}`}
                          />
                        </div> */}
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            ₹
                            {formatINR(
                              Math.round(
                                group.breakdown.itemsTotal +
                                  Object.values(group.breakdown.fees).reduce(
                                    (s, v) => s + v,
                                    0,
                                  ),
                              ),
                            )}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-gray-500 transition-transform ${openSection[group.key] ? 'rotate-90' : ''}`}
                          />
                        </div>
                      </button>
                      {openSection[group.key] && (
                        <div className="px-3 pb-3 space-y-1.5">
                          {group.isService ? (
                            // <div className="text-xs text-gray-500 flex items-center justify-between">
                            //   <span className="truncate pr-2">
                            //     {pendingServiceBooking.serviceName} (
                            //     {pendingServiceBooking.bookingDate} ·{' '}
                            //     {pendingServiceBooking.timeSlot?.label})
                            //   </span>
                            //   <div className="flex items-center gap-2">
                            //     <span>
                            //       ₹{formatINR(group.breakdown.itemsTotal)}
                            //     </span>
                            //     <button
                            //       onClick={() => {
                            //         localStorage.removeItem(
                            //           'rentpay_pending_service_booking',
                            //         );
                            //         setPendingServiceBooking(null);
                            //       }}
                            //       className="text-[10px] text-red-500 hover:underline"
                            //     >
                            //       Remove
                            //     </button>
                            //   </div>
                            // </div>
                            // <div className="text-xs text-gray-500 flex items-center justify-between">
                            //   <span className="truncate pr-2">
                            //     {pendingServiceBooking.serviceName} (
                            //     {pendingServiceBooking.bookingDate} ·{' '}
                            //     {pendingServiceBooking.timeSlot?.label})
                            //   </span>
                            //   <span className="flex items-center gap-1.5 shrink-0">
                            <div className="space-y-1">
                              {serviceBookingsWithMeta.map((m) => (
                                <div
                                  key={
                                    m.booking.bookingId || m.booking.productId
                                  }
                                  className="text-xs text-gray-600 flex items-center justify-between"
                                >
                                  <span className="truncate pr-2 flex items-center gap-1">
                                    <span className="shrink-0">•</span>
                                    {m.booking.serviceName} (
                                    {m.booking.bookingDate})
                                  </span>
                                  <span className="flex items-center gap-1.5 shrink-0">
                                    {m.hasOffer ? (
                                      <span className="text-gray-400 line-through">
                                        ₹{formatINR(m.booking.originalAmount)}
                                      </span>
                                    ) : null}
                                    <span>
                                      ₹{formatINR(m.breakdown.itemsTotal)}
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // ) : (
                            //   group.items.map((it) => (
                            //     <div
                            //       key={it.productId}
                            //       className="text-xs text-gray-500 flex items-center justify-between"
                            //     >
                            //       <span className="truncate pr-2">
                            //         {it.title}
                            //       </span>
                            //       <span>
                            //         {isDailyRentalItem(it)
                            //           ? `₹${formatINR(it.pricePerDay)}`
                            //           : `₹${formatINR(it.pricePerDay)} × ${it.quantity}`}
                            //       </span>
                            //     </div>
                            //   ))
                            // )}
                            // <div className="pt-1 mt-1 border-t border-gray-100 space-y-1">
                            //   {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
                            //     (field) =>
                            //       group.breakdown.fees[field.key] > 0 ? (
                            //         <div
                            //           key={field.key}
                            //           className="flex items-center justify-between"
                            //         >
                            //           <span className="text-gray-600">
                            //             {field.label}
                            //           </span>
                            //           <span className="font-medium">
                            //             ₹
                            //             {formatINR(
                            //               group.breakdown.fees[field.key],
                            //             )}
                            //           </span>
                            //         </div>
                            //       ) : null,
                            //   )}
                            //   {group.breakdown.fees.careTax > 0 && (
                            //     <div className="flex items-center justify-between">
                            //       <span className="text-gray-600">Care Tax</span>
                            //       <span className="font-medium">
                            //         ₹{formatINR(group.breakdown.fees.careTax)}
                            //       </span>
                            //     </div>
                            //   )}
                            // </div>

                            group.items.map((it) => (
                              <div
                                key={it.productId}
                                className="text-xs text-gray-600 flex items-center justify-between"
                              >
                                <span className="truncate pr-2 flex items-center gap-1">
                                  <span className="shrink-0">•</span>
                                  {it.title}
                                </span>
                                <span>
                                  {isDailyRentalItem(it)
                                    ? `₹${formatINR(it.pricePerDay)}`
                                    : `₹${formatINR(it.pricePerDay)} × ${it.quantity}`}
                                </span>
                              </div>
                            ))
                          )}
                          {/* <div className="pt-1 mt-1 border-t border-gray-100 space-y-1 text-xs">
                            {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
                              (field) =>
                                group.breakdown.fees[field.key] > 0 ? (
                                  <div
                                    key={field.key}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-gray-600">
                                      {field.label}
                                    </span>
                                    <span className="font-medium">
                                      ₹
                                      {formatINR(
                                        group.breakdown.fees[field.key],
                                      )}
                                    </span>
                                  </div>
                                ) : null,
                            )}
                            {group.breakdown.fees.careTax > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Care Tax</span>
                                <span className="font-medium">
                                  ₹{formatINR(group.breakdown.fees.careTax)}
                                </span>
                              </div>
                            )}
                          </div> */}
                          <div className="pt-1 mt-1 border-t border-gray-100 space-y-1 text-xs">
                            {TAX_FIELDS.filter((f) => f.key !== 'careTax').map(
                              (field) =>
                                group.breakdown.fees[field.key] > 0 ||
                                group.showAllTaxes ? (
                                  <div
                                    key={field.key}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-gray-600">
                                      {field.label}
                                    </span>
                                    <span className="font-medium">
                                      ₹
                                      {formatINR(
                                        group.breakdown.fees[field.key],
                                      )}
                                    </span>
                                  </div>
                                ) : null,
                            )}
                            {/* {(group.breakdown.fees.careTax > 0 ||
                              group.showAllTaxes) && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Care Tax</span>
                                <span className="font-medium">
                                  ₹{formatINR(group.breakdown.fees.careTax)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))} */}
                            {(group.breakdown.fees.careTax > 0 ||
                              group.showAllTaxes) && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Care Tax</span>
                                <span className="font-medium">
                                  ₹{formatINR(group.breakdown.fees.careTax)}
                                </span>
                              </div>
                            )}
                            {appliedCoupon &&
                              discountAmount > 0 &&
                              Array.isArray(appliedCoupon.applicableOn) &&
                              ((group.key === 'rental' &&
                                appliedCoupon.applicableOn.includes(
                                  'rentals',
                                )) ||
                                (group.key === 'buying' &&
                                  appliedCoupon.applicableOn.includes(
                                    'selling',
                                  )) ||
                                (group.key === 'service' &&
                                  appliedCoupon.applicableOn.includes(
                                    'services',
                                  ))) && (
                                <div className="flex items-center justify-between text-green-600">
                                  <span>Coupon ({appliedCoupon.code})</span>
                                  <span className="font-medium">
                                    − ₹{formatINR(discountAmount)}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {refundableDepositTotal > 0 && (
                  <div className="border border-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => toggleSection('deposit')}
                      className="w-full flex items-center justify-between px-3 py-2"
                    >
                      <span className="font-medium text-gray-800 flex items-center gap-1 relative group">
                        Refundable Deposits
                        <AlertCircle className="w-4 h-4 text-gray-400 cursor-pointer peer" />
                        <span className="pointer-events-none absolute left-0 top-full mt-1 w-56 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
                          This deposit is fully refundable. It is returned once
                          the rented product is collected back in good
                          condition, with no damage or missing accessories.
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          ₹{formatINR(Math.round(refundableDepositTotal))}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-500 transition-transform ${openSection.deposit ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>
                    {openSection.deposit && (
                      <div className="px-3 pb-3 space-y-1.5">
                        {items
                          .filter((i) => isRentalItem(i))
                          .map((it) => (
                            <div
                              key={it.productId}
                              className="text-xs text-gray-600 flex items-center justify-between"
                            >
                              <span className="truncate pr-2">
                                {it.title}{' '}
                                {/* <span className="text-gray-400">
                                  (
                                  {String(it.tenureUnit || 'month') === 'day'
                                    ? 'Daily'
                                    : 'Monthly'}
                                  )
                                </span> */}
                              </span>
                              <span className="font-medium">
                                ₹
                                {formatINR(
                                  Number(it.refundableDeposit || 0) *
                                    Number(it.quantity || 1),
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* {(hasRentalItems || items.some((i) => !isRentalItem(i))) &&
              isCareProtectionEnabled &&
              careProtection > 0 ? ( */}
              {/* {isCareProtectionEnabled &&
              (careProtection > 0 ||
                (pendingServiceBooking &&
                  serviceBreakdown?.fees?.careTax > 0)) &&
              (items.length > 0 || pendingServiceBooking) ? (
                <div className="mt-4 rounded-xl border-2 border-[#BEDBFF] bg-blue-50 px-4 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-black flex items-center gap-1.5 relative group">
                      <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
                      Rentnpay Care Protection
                      <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
                      <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
                        Covers accidental damage and breakdowns during use, plus
                        priority customer support if anything goes wrong with
                        your rented or purchased product.
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {hasRentalItems
                        ? 'Damage protection & priority support'
                        : 'Buyer protection & priority support'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCareProtectionEnabled(false)}
                    className="text-xs text-gray-500 whitespace-nowrap self-center"
                  >
                    Dont Want? <span className="text-blue-600">Remove</span>
                  </button>
                </div>
              ) : null} */}

              {items.length > 0 || pendingServiceBookings.length > 0 ? (
                <div className="mt-4 rounded-xl border-2 border-[#BEDBFF] bg-blue-50 px-4 py-4">
                  <div className="flex-1">
                    {/* <p className="text-sm font-semibold text-black flex items-center gap-1.5 relative group">
                      <Shield className="w-4 h-4 text-[#2563EB] shrink-0" />
                      Rentnpay Care Protection
                      <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
                      <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
                        Covers accidental damage and breakdowns during use, plus
                        priority customer support if anything goes wrong with
                        your rented or purchased product.
                      </span>
                    </p> */}
                    <p className="text-sm font-semibold text-black flex items-center gap-0.5 relative group">
                      <style>{`
                        @keyframes careProtectionStop1 {
                          0%, 100% { stop-color: #3B82F6; }
                          50% { stop-color: #1D4ED8; }
                        }
                        @keyframes careProtectionStop2 {
                          0%, 100% { stop-color: #1D4ED8; }
                          50% { stop-color: #3B82F6; }
                        }
                        .care-protection-stop-1 {
                          animation: careProtectionStop1 3s ease-in-out infinite;
                        }
                        .care-protection-stop-2 {
                          animation: careProtectionStop2 3s ease-in-out infinite;
                        }
                      `}</style>
                      <span className="relative inline-flex items-center justify-center w-5 h-5 shrink-0">
                        <svg
                          className="relative w-7 h-7"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <defs>
                            <linearGradient
                              id="careProtectionGradient"
                              x1="0"
                              y1="0"
                              x2="24"
                              y2="24"
                            >
                              <stop
                                offset="0%"
                                className="care-protection-stop-1"
                                stopColor="#3B82F6"
                              />
                              <stop
                                offset="100%"
                                className="care-protection-stop-2"
                                stopColor="#1D4ED8"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                            fill="url(#careProtectionGradient)"
                          />
                          <path
                            d="M9 12l2 2 4-4"
                            stroke="white"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      Rentnpay Care Protection
                      <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 cursor-pointer peer" />
                      <span className="pointer-events-none absolute left-0 top-full mt-1 w-60 z-20 hidden group-hover:block peer-hover:block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg">
                        Covers accidental damage and breakdowns during use, plus
                        priority customer support if anything goes wrong with
                        your rented or purchased product.
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {hasRentalItems
                        ? 'Damage protection & priority support'
                        : 'Buyer protection & priority support'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCareProtectionEnabled((prev) => !prev)}
                    className="text-xs text-gray-500 whitespace-nowrap self-center"
                  >
                    {isCareProtectionEnabled ? (
                      <>
                        Dont Want?{' '}
                        <span className="font-semibold text-blue-600">
                          Remove
                        </span>
                      </>
                    ) : (
                      <>
                        Want it back?{' '}
                        <span className="font-semibold text-blue-600">Add</span>
                      </>
                    )}
                  </button>
                </div>
              ) : null}

              {/* {appliedCoupon && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    Discount ({appliedCoupon.code})
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-400 text-xs ml-1"
                    >
                      Remove
                    </button>
                  </span>
                  <span className="font-medium">
                    - ₹{formatINR(appliedCoupon.discountAmount)}
                  </span>
                </div>
              )} */}

              <div className="mt-4 rounded-xl bg-blue-50 px-3 py-3 flex items-center justify-between">
                <span className="font-semibold text-black">Total Payable</span>
                <span className="text-4xl font-bold text-blue-700">
                  ₹{formatINR(Math.round(totalPayToday))}
                </span>
              </div>

              <div className="mt-5">
                {/* <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <BadgePercent className="w-4 h-4" />
                  Rental Offers and Discounts
                </p> */}
                <p className="font-semibold text-black flex items-center gap-1">
                  <img
                    src={offerCartIcon.src}
                    alt="Offers"
                    className="w-5 h-5 shrink-0"
                  />
                  Offers and Discounts
                </p>
                <div className="mt-3 overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {activeCoupons.length > 0 && (
                      <div className="mt-3 overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                          {/* {activeCoupons.map((c) => {
                            const progress = Math.min(
                              (total / c.minOrderValue) * 100,
                              100,
                            );
                            const isEligible = total >= c.minOrderValue;
                            const remaining = c.minOrderValue - total; */}
                          {activeCoupons.map((c) => {
                            const couponRelevantTotal = Array.isArray(
                              c.applicableOn,
                            )
                              ? c.applicableOn.reduce(
                                  (s, cat) =>
                                    s + Number(categoryTotals[cat] || 0),
                                  0,
                                )
                              : 0;
                            const progress = Math.min(
                              (couponRelevantTotal / c.minOrderValue) * 100,
                              100,
                            );
                            const isEligible =
                              couponRelevantTotal >= c.minOrderValue;
                            const remaining =
                              c.minOrderValue - couponRelevantTotal;

                            return (
                              <div
                                key={c.code}
                                className="w-56 rounded-xl border border-gray-200 bg-white p-3"
                              >
                                {/* Discount label */}
                                <p className="text-xs text-orange-600 font-medium">
                                  {c.discountType === 'percentage'
                                    ? `${c.discountValue}% Discount${c.maxDiscountCap ? ` Upto ₹${c.maxDiscountCap}` : ''}`
                                    : `Flat ₹${c.discountValue} Off`}
                                </p>

                                {/* Eligible or not text */}
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {isEligible
                                    ? `On items above ₹${c.minOrderValue}`
                                    : `Add ₹${remaining} more to unlock`}{' '}
                                  {/* 👈 dynamic hint */}
                                </p>

                                {/* Progress bar */}
                                <div className="mt-2 h-1.5 rounded-full bg-orange-200">
                                  <div
                                    className="h-1.5 rounded-full bg-orange-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }} // 👈 dynamic width
                                  />
                                </div>

                                {/* Code + Apply button */}
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-orange-300 text-orange-600">
                                    {c.code}
                                  </span>
                                  <button
                                    onClick={() =>
                                      isEligible && handleApplyCoupon(c.code)
                                    } // 👈 eligible tabhi click
                                    disabled={!isEligible}
                                    className={`text-xs font-semibold transition-colors ${
                                      isEligible
                                        ? 'text-orange-600 cursor-pointer' // enabled — dark
                                        : 'text-orange-300 cursor-not-allowed' // disabled — faded
                                    }`}
                                  >
                                    APPLY
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">Have a Coupon?</p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-700 font-medium">
                      {appliedCoupon.code} applied
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 mt-1">{couponError}</p>
                    )}
                  </>
                )}
              </div>

              {/* <Link
                href="/checkout"
                className="mt-5 block w-full py-3 bg-[#2563EB] text-white text-center font-medium rounded-xl hover:bg-blue-700"
              >
                Proceed to Checkout
              </Link> */}
              {/* <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(
                      'rentpay_checkout_total',
                      String(Math.round(totalPayToday)),
                    );
                  } catch {}
                  router.push('/checkout');
                }}
                className="mt-5 block w-full py-3 bg-[#2563EB] text-white text-center font-medium rounded-xl hover:bg-blue-700"
              >
                Proceed to Checkout
              </button> */}

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    pendingCheckoutRef.current = true;
                    openAuth('login');
                    return;
                  }
                  try {
                    localStorage.setItem(
                      'rentpay_checkout_total',
                      String(Math.round(totalPayToday)),
                    );
                  } catch {}
                  router.push('/checkout');
                }}
                className="mt-5 block w-full py-3 bg-[#2563EB] text-white text-center font-medium rounded-xl hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>

              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p className="flex items-center justify-center gap-1 ">
                  <Lock className="w-3 h-3 text-[#10B981]" />
                  100% Secure Payments
                </p>
                <p className="flex items-center justify-center gap-1 ">
                  <Shield className="w-3 h-3 text-[#2563EB]" />
                  Deposits are Refundable
                </p>
                {/* <p>◎ Deposits are Refundable</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {changeSlotOpen && changeSlotProduct && (
        <BookingModal */}
      {dateModalItem && (
        <ChangeDailyDateModal
          item={dateModalItem}
          onClose={() => setDateModalItem(null)}
          onSave={({ startDate, endDate, days, total }) => {
            dispatch(
              updateRentalDates({
                productId: dateModalItem.productId,
                startDate,
                endDate,
                rentalMonths: days,
                pricePerDay: total,
              }),
            );
            setDateModalItem(null);
          }}
        />
      )}

      {changeSlotOpen && changeSlotProduct && (
        <BookingModal
          isOpen={changeSlotOpen}
          product={changeSlotProduct}
          mode="create"
          onClose={() => {
            setChangeSlotOpen(false);
            setChangeSlotProduct(null);
            setChangeSlotBookingProductId(null);
            // Re-read updated bookings from localStorage
            try {
              const raw = localStorage.getItem(
                'rentpay_pending_service_bookings',
              );
              const list = raw ? JSON.parse(raw) : [];
              setPendingServiceBookings(Array.isArray(list) ? list : []);
            } catch {
              setPendingServiceBookings([]);
            }
          }}
        />
      )}
    </div>
  );
};

export default Cart;
