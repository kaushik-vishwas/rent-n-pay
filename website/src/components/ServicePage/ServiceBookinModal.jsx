// 'use client';
// import React, { useState, useEffect, useRef } from 'react';
// import { createPortal } from 'react-dom';
// import { useRouter } from 'next/navigation';
// import {
//   X,
//   Clock,
//   Calendar,
//   Zap,
//   AlertCircle,
//   CheckCircle2,
//   Loader2,
//   MapPin,
//   AlertTriangle,
// } from 'lucide-react';
// import {
//   apiGetMyAddresses,
//   apiGetServiceAvailability,
//   apiRescheduleServiceBooking,
//   apiGetPublicActiveOffers,
// } from '@/lib/api';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import {
//   AUTH_REDIRECT_SESSION_KEY,
//   useAuthModal,
// } from '@/contexts/AuthModalContext';

// // ─────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────

// const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// const MONTH_NAMES = [
//   'Jan',
//   'Feb',
//   'Mar',
//   'Apr',
//   'May',
//   'Jun',
//   'Jul',
//   'Aug',
//   'Sep',
//   'Oct',
//   'Nov',
//   'Dec',
// ];

// // Generate next 30 days from today
// const generateDates = () => {
//   const dates = [];
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   for (let i = 0; i < 30; i++) {
//     const d = new Date(today);
//     d.setDate(today.getDate() + i);
//     dates.push(d);
//   }
//   return dates;
// };

// const formatDateForApi = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');

//   return `${year}-${month}-${day}`;
// };

// // Generate time slots per session based on availability schedule
// // availabilitySchedule: [{ day: 'Mon', startTime: '09:00', endTime: '18:00', isAvailable: true }]
// const generateSlots = (date, availabilitySchedule = []) => {
//   const dayName = DAY_NAMES[date.getDay()]; // 'Mon', 'Tue' etc
//   const schedule = availabilitySchedule.find((s) => s.day === dayName);

//   if (!schedule || !schedule.isAvailable) return null; // day off

//   // Parse vendor's working hours
//   const [startH] = schedule.startTime.split(':').map(Number);
//   const [endH] = schedule.endTime.split(':').map(Number);

//   const allSlots = [];

//   // Build 1-hour slots within working hours
//   for (let h = startH; h < endH; h++) {
//     const from = `${String(h).padStart(2, '0')}:00`;
//     const to = `${String(h + 1).padStart(2, '0')}:00`;
//     const fromAmPm = formatTime(h, 0);
//     const toAmPm = formatTime(h + 1, 0);
//     allSlots.push({
//       id: `${from}-${to}`,
//       label: `${fromAmPm} - ${toAmPm}`,
//       from,
//       to,
//       hour: h,
//       full: false, // extend with real booking data if needed
//     });
//   }

//   // Group into Morning / Afternoon / Evening
//   const morning = allSlots.filter((s) => s.hour >= 6 && s.hour < 12);
//   const afternoon = allSlots.filter((s) => s.hour >= 12 && s.hour < 17);
//   const evening = allSlots.filter((s) => s.hour >= 17 && s.hour < 21);

//   return { morning, afternoon, evening };
// };

// const filterPastSlots = (slotGroups, selectedDate) => {
//   if (!slotGroups) return slotGroups;
//   const now = new Date();
//   const isToday = selectedDate.toDateString() === now.toDateString();
//   if (!isToday) return slotGroups; // future date — show all slots

//   const currentHour = now.getHours();
//   const currentMinute = now.getMinutes();

//   const filterSlot = (slots = []) =>
//     slots.map((slot) => {
//       const [slotHour] = slot.from.split(':').map(Number);
//       // Mark slot as full/past if its hour has already started
//       // e.g. at 5:45pm, slots starting at 17:00 or earlier are past
//       const isPast =
//         slotHour < currentHour ||
//         (slotHour === currentHour && currentMinute > 0);
//       return isPast ? { ...slot, full: true, past: true } : slot;
//     });

//   return {
//     morning: filterSlot(slotGroups.morning),
//     afternoon: filterSlot(slotGroups.afternoon),
//     evening: filterSlot(slotGroups.evening),
//   };
// };

// const applyBookedSlots = (slotGroups, availability) => {
//   if (!slotGroups) return slotGroups;
//   const booked = new Map(
//     (availability?.bookedSlots || []).map((slot) => [
//       `${slot.from}-${slot.to}`,
//       slot,
//     ]),
//   );
//   const mark = (slots = []) =>
//     slots.map((slot) => {
//       const row = booked.get(`${slot.from}-${slot.to}`);
//       return {
//         ...slot,
//         bookedCount: Number(row?.count || 0),
//         full: Boolean(row?.full || availability?.unavailable),
//       };
//     });
//   return {
//     morning: mark(slotGroups.morning),
//     afternoon: mark(slotGroups.afternoon),
//     evening: mark(slotGroups.evening),
//   };
// };

// const formatTime = (h, m) => {
//   const period = h >= 12 ? 'PM' : 'AM';
//   const hour = h % 12 === 0 ? 12 : h % 12;
//   return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
// };

// const URGENT_FEE = 150;
// const parseMoney = (value) => {
//   const cleaned = String(value || '').replace(/[^\d.]/g, '');
//   const n = Number(cleaned);
//   return Number.isFinite(n) ? n : 0;
// };

// // ─────────────────────────────────────────────
// // MODAL COMPONENT
// // ─────────────────────────────────────────────

// const BookingModal = ({
//   isOpen,
//   onClose,
//   product,
//   existingBooking,
//   mode = 'create',
// }) => {
//   const router = useRouter();
//   const { openAuth } = useAuthModal();
//   const scrollRef = useRef(null);

//   const [dates] = useState(generateDates);
//   const [selectedDate, setSelectedDate] = useState(dates[0]);
//   const [slots, setSlots] = useState(null); // { morning, afternoon, evening } | null
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [isUrgent, setIsUrgent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [submitError, setSubmitError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [validationError, setValidationError] = useState('');
//   const [availabilityLoading, setAvailabilityLoading] = useState(false);
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState('');
//   const [serviceOffer, setServiceOffer] = useState(null);
//   const selectedAddress =
//     addresses.find((addr) => addr._id === selectedAddressId) || null;

//   // Recalculate slots whenever date changes
//   useEffect(() => {
//     if (!selectedDate) return;
//     let ignore = false;
//     setSelectedSlot(null);
//     setValidationError('');
//     const generated = generateSlots(
//       selectedDate,
//       product?.availabilitySchedule || [],
//     );

//     if (!generated) {
//       setSlots(null);
//       return;
//     }

//     const dateKey = formatDateForApi(selectedDate);
//     setAvailabilityLoading(true);
//     apiGetServiceAvailability(product._id, dateKey)
//       .then((res) => {
//         if (!ignore)
//           setSlots(
//             filterPastSlots(
//               applyBookedSlots(generated, res.data),
//               selectedDate,
//             ),
//           );
//       })
//       .catch(() => {
//         if (!ignore) setSlots(filterPastSlots(generated, selectedDate));
//       })
//       .finally(() => {
//         if (!ignore) setAvailabilityLoading(false);
//       });
//     return () => {
//       ignore = true;
//     };
//   }, [selectedDate, product]);

//   // Reset on open
//   useEffect(() => {
//     if (!isOpen) return;

//     if (mode === 'reschedule' && existingBooking) {
//       const bookingDate = new Date(existingBooking.bookingDate);
//       bookingDate.setHours(0, 0, 0, 0);
//       setSelectedDate(bookingDate);
//       setIsUrgent(existingBooking.isUrgent || false);
//     } else {
//       setSelectedDate(dates[0]); // only for create mode
//       setIsUrgent(false);
//     }

//     setSelectedSlot(null);
//     setSubmitError('');
//     setSuccess(false);
//     setValidationError('');
//     setAvailabilityLoading(false);
//     setAddresses([]);
//     setSelectedAddressId('');
//   }, [isOpen, mode, existingBooking, dates]);

//   // useEffect(() => {
//   //   if (!isOpen) return;
//   //   const token =
//   //     typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
//   //   if (!token) return;
//   //   apiGetMyAddresses()
//   //     .then((res) => {
//   //       const list = Array.isArray(res.data?.addresses)
//   //         ? res.data.addresses
//   //         : [];
//   //       setAddresses(list);
//   //       setSelectedAddressId((prev) => prev || list?.[0]?._id || '');
//   //     })
//   //     .catch(() => {
//   //       setAddresses([]);
//   //       setSelectedAddressId('');
//   //     });
//   // }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
//     if (!token) return;
//     apiGetMyAddresses()
//       .then((res) => {
//         const list = Array.isArray(res.data?.addresses)
//           ? res.data.addresses
//           : [];
//         setAddresses(list);
//         setSelectedAddressId((prev) => prev || list?.[0]?._id || '');
//       })
//       .catch(() => {
//         setAddresses([]);
//         setSelectedAddressId('');
//       });
//   }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen || !product?._id) {
//       setServiceOffer(null);
//       return;
//     }
//     let cancelled = false;
//     apiGetPublicActiveOffers()
//       .then((res) => {
//         if (cancelled) return;
//         const offers = res.data?.offers || [];
//         const match = offers.find(
//           (o) =>
//             String(o.productId?._id || o.productId) === String(product._id),
//         );
//         setServiceOffer(match || null);
//       })
//       .catch(() => {
//         if (!cancelled) setServiceOffer(null);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen, product?._id]);

//   // Lock body scroll when modal open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isOpen]);

//   // useEffect(() => {
//   //   if (!existingBooking || mode !== 'reschedule') return;

//   //   // prefill date
//   //   const bookingDate = new Date(existingBooking.bookingDate);
//   //   setSelectedDate(bookingDate);

//   //   // prefill urgent
//   //   setIsUrgent(existingBooking.isUrgent);

//   //   // prefill slot (after slots load)
//   // }, [existingBooking, mode]);

//   useEffect(() => {
//     if (!slots || !existingBooking || mode !== 'reschedule') return;

//     const old = existingBooking.timeSlot;

//     const findSlot = (list) =>
//       list?.find((s) => s.from === old.from && s.to === old.to);

//     const matched =
//       findSlot(slots.morning) ||
//       findSlot(slots.afternoon) ||
//       findSlot(slots.evening);

//     if (matched) {
//       setSelectedSlot(matched);
//     }
//   }, [slots, existingBooking, mode]);

//   if (!isOpen || !product) return null;

//   // ── Derived values
//   // const basePrice =
//   //   (mode === 'reschedule' && existingBooking?.baseAmount
//   //     ? Number(existingBooking.baseAmount)
//   //     : 0) ||
//   //   Number(product?.salesConfiguration?.salePrice || 0) ||
//   //   parseMoney(product?.price);
//   // const totalPrice = basePrice + (isUrgent ? URGENT_FEE : 0);
//   const rawBasePrice =
//     (mode === 'reschedule' && existingBooking?.baseAmount
//       ? Number(existingBooking.baseAmount)
//       : 0) ||
//     Number(product?.salesConfiguration?.salePrice || 0) ||
//     parseMoney(product?.price);

//   const serviceDiscountPercent = Number(serviceOffer?.discountPercent || 0);
//   const hasServiceOffer =
//     mode !== 'reschedule' && !!serviceOffer && serviceDiscountPercent > 0;

//   const basePrice = hasServiceOffer
//     ? Math.max(
//         0,
//         Math.round(
//           rawBasePrice - (rawBasePrice * serviceDiscountPercent) / 100,
//         ),
//       )
//     : rawBasePrice;

//   const totalPrice = basePrice + (isUrgent ? URGENT_FEE : 0);
//   const isDayOff = slots === null;
//   const hasNoSlots =
//     slots &&
//     slots.morning.length === 0 &&
//     slots.afternoon.length === 0 &&
//     slots.evening.length === 0;

//   // ── Validate & Submit
//   // const handleConfirm = async () => {
//   //   setValidationError('');
//   //   setSubmitError('');

//   //   if (!selectedSlot) {
//   //     setValidationError('Please select a time slot to continue');
//   //     return;
//   //   }

//   //   const token =
//   //     typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
//   //   if (!token) {
//   //     sessionStorage.setItem(
//   //       AUTH_REDIRECT_SESSION_KEY,
//   //       `/service/${product._id}`,
//   //     );
//   //     openAuth('login');
//   //     return;
//   //   }

//   // if (mode !== 'reschedule' && !selectedAddress) {
//   //   setValidationError('Please select a service address to continue');
//   //   return;
//   // }

//   //   const payload = {
//   //     productId: product._id,
//   //     vendorId: product.vendorId,
//   //     bookingDate: formatDateForApi(selectedDate), // "YYYY-MM-DD"
//   //     timeSlot: {
//   //       from: selectedSlot.from,
//   //       to: selectedSlot.to,
//   //       label: selectedSlot.label,
//   //     },
//   //     isUrgent,
//   //     totalAmount: totalPrice,
//   //     selectedAddress,
//   //     serviceName: product.productName,
//   //     image: product.image,
//   //   };

//   //   try {
//   //     setLoading(true);
//   //     localStorage.setItem(
//   //       'rentpay_pending_service_booking',
//   //       JSON.stringify(payload),
//   //     );
//   //     localStorage.setItem(
//   //       'rentpay_checkout_selectedAddress',
//   //       JSON.stringify(selectedAddress),
//   //     );
//   //     // router.push('/payment?mode=service');
//   //     if (mode === 'create') {
//   //       localStorage.setItem(
//   //         'rentpay_pending_service_booking',
//   //         JSON.stringify(payload),
//   //       );
//   //       router.push('/payment?mode=service');
//   //     }
//   //   } catch (err) {
//   //     const msg =
//   //       err?.response?.data?.message || 'Booking failed. Please try again.';
//   //     setSubmitError(msg);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleConfirm = async () => {
//     setValidationError('');
//     setSubmitError('');

//     if (!selectedSlot) {
//       setValidationError('Please select a time slot to continue');
//       return;
//     }

//     // if (mode !== 'reschedule' && !selectedAddress) {
//     //   setValidationError('Please select a service address to continue');
//     //   return;
//     // }

//     try {
//       setLoading(true);

//       if (mode === 'create') {
//         // const payload = {
//         //   productId: product._id,
//         //   vendorId: product.vendorId,
//         //   bookingDate: formatDateForApi(selectedDate),
//         //   timeSlot: {
//         //     from: selectedSlot.from,
//         //     to: selectedSlot.to,
//         //     label: selectedSlot.label,
//         //   },
//         //   isUrgent,
//         //   totalAmount: totalPrice,
//         //   selectedAddress,
//         //   serviceName: product.productName,
//         //   image: product.image,
//         // };
//         const payload = {
//           productId: product._id,
//           vendorId: product.vendorId,
//           bookingDate: formatDateForApi(selectedDate),
//           timeSlot: {
//             from: selectedSlot.from,
//             to: selectedSlot.to,
//             label: selectedSlot.label,
//           },
//           isUrgent,
//           totalAmount: totalPrice,
//           originalAmount: rawBasePrice + (isUrgent ? URGENT_FEE : 0),
//           selectedAddress: null, // filled in later on the Checkout page
//           serviceName: product.productName,
//           image: product.image,
//           // pass subcategory tax fields for order summary
//           // subCategoryTax: product?.subCategoryTax || {},
//           // category: product?.category || '',
//           // subCategory: product?.subCategory || '',
//           subCategoryTax: product?.subCategoryTax || {},
//           category: product?.category || '',
//           subCategory: product?.subCategory || '',
//           // taxBlocked: product?.subCategoryTax?.taxBlocked ?? false,
//           taxBlocked: product?.taxBlocked ?? false,
//         };

//         // localStorage.setItem(
//         //   'rentpay_pending_service_booking',
//         //   JSON.stringify(payload),
//         // );
//         // window.dispatchEvent(new CustomEvent('rn_service_cart_changed'));

//         // router.push('/cart');
//         const existingRaw = localStorage.getItem(
//           'rentpay_pending_service_bookings',
//         );
//         let existingList = [];
//         try {
//           existingList = existingRaw ? JSON.parse(existingRaw) : [];
//           if (!Array.isArray(existingList)) existingList = [];
//         } catch {
//           existingList = [];
//         }
//         const bookingId = `${payload.productId}_${Date.now()}`;
//         const newEntry = { ...payload, bookingId };
//         // Same product re-booked → replace its old slot instead of duplicating
//         const updatedList = [
//           ...existingList.filter(
//             (b) => String(b.productId) !== String(payload.productId),
//           ),
//           newEntry,
//         ];
//         //   localStorage.setItem(
//         //     'rentpay_pending_service_bookings',
//         //     JSON.stringify(updatedList),
//         //   );
//         //   window.dispatchEvent(new CustomEvent('rn_service_cart_changed'));

//         //   onClose();
//         // }
//         localStorage.setItem(
//           'rentpay_pending_service_bookings',
//           JSON.stringify(updatedList),
//         );
//         window.dispatchEvent(new CustomEvent('rn_service_cart_changed'));

//         toast.success('Service added to cart', {
//           position: 'top-right',
//           autoClose: 2000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: 'light',
//         });

//         onClose();
//       }

//       //   localStorage.setItem(
//       //     'rentpay_pending_service_booking',
//       //     JSON.stringify(payload),
//       //   );

//       //   router.push('/payment?mode=service');
//       // }

//       // ─────────────────────────────
//       //  RESCHEDULE MODE
//       // ─────────────────────────────
//       if (mode === 'reschedule') {
//         await apiRescheduleServiceBooking(existingBooking._id, {
//           bookingDate: formatDateForApi(selectedDate),
//           timeSlot: {
//             from: selectedSlot.from,
//             to: selectedSlot.to,
//             label: selectedSlot.label,
//           },
//           isUrgent,
//         });

//         setSuccess(true);
//       }
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message ||
//         'Something went wrong. Please try again.';
//       setSubmitError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ─────────────────────────────────────────────
//   // SUCCESS STATE
//   // ─────────────────────────────────────────────
//   if (success) {
//     return (
//       <ModalOverlay onClose={onClose}>
//         <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
//           <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
//             <CheckCircle2 className="w-8 h-8 text-emerald-500" />
//           </div>
//           {/* <h2 className="text-xl font-semibold text-black mb-2">
//             Booking Confirmed!
//           </h2> */}

//           <h2 className="text-base font-medium text-gray-500 mb-1 ">
//             {mode === 'reschedule'
//               ? 'Booking Rescheduled!'
//               : 'Booking Confirmed!'}
//           </h2>
//           <p className="text-lg  text-gray-500 mb-1">
//             <p className="text-lg text-gray-500 mb-1">
//               <span className="font-semibold text-black">
//                 {product.productName} Service
//               </span>
//             </p>
//           </p>
//           <p className="text-sm text-gray-500 mb-6">
//             {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()}{' '}
//             {MONTH_NAMES[selectedDate.getMonth()]} · {selectedSlot?.label}
//           </p>
//           {/* <p className="text-2xl font-bold text-black mb-6">₹{totalPrice}</p> */}
//           <button
//             onClick={onClose}
//             className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
//           >
//             Done
//           </button>
//         </div>
//       </ModalOverlay>
//     );
//   }

//   // ─────────────────────────────────────────────
//   // MAIN MODAL
//   // ─────────────────────────────────────────────
//   return (
//     <ModalOverlay onClose={onClose}>
//       {/* Header */}
//       <div className="flex items-start justify-between p-4 sm:p-5 border-b border-gray-100">
//         <div>
//           <h2 className="text-lg sm:text-xl font-bold text-black">
//             Select a Time Slot
//           </h2>
//           <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
//             For{' '}
//             <span className="font-semibold text-gray-700 capitalize">
//               {product.productName}
//             </span>
//           </p>
//           {(() => {
//             const slot = product?.availabilitySchedule?.find(
//               (s) => s.isAvailable,
//             );

//             const workDuration = slot?.workDuration;

//             return workDuration ? (
//               <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
//                 <Clock className="w-3 h-3" />
//                 Estimated Duration:
//                 <span className="text-black font-medium">
//                   {workDuration} hours
//                 </span>
//               </p>
//             ) : null;
//           })()}
//         </div>
//         <button
//           onClick={onClose}
//           className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
//           aria-label="Close"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Scrollable body */}
//       <div
//         ref={scrollRef}
//         className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 sm:px-5 py-4 space-y-6"
//       >
//         {/* ── DATE PICKER */}
//         <div>
//           <h3 className="text-sm font-semibold text-black mb-3">Select Date</h3>

//           {/* Horizontal scrollable date strip */}
//           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//             {dates.map((date) => {
//               const dayName = DAY_NAMES[date.getDay()];
//               const schedule = product?.availabilitySchedule?.find(
//                 (s) => s.day === dayName,
//               );
//               const isOff = !schedule || !schedule.isAvailable;
//               const isSelected =
//                 selectedDate?.toDateString() === date.toDateString();
//               const isToday = date.toDateString() === new Date().toDateString();

//               return (
//                 <button
//                   key={date.toISOString()}
//                   onClick={() => !isOff && setSelectedDate(date)}
//                   disabled={isOff}
//                   className={`flex flex-col items-center justify-center w-[72px] h-[72px] rounded-full border text-center transition-all flex-shrink-0
//                     ${
//                       isSelected
//                         ? 'bg-orange-500 border-orange-500 text-white shadow-md'
//                         : isOff
//                           ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
//                           : 'bg-white border-gray-200 text-gray-700 hover:border-orange-400'
//                     }`}
//                 >
//                   <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">
//                     {dayName}
//                   </span>
//                   <span className="text-xl font-bold leading-tight">
//                     {date.getDate()}
//                   </span>
//                   <span className="text-[10px] opacity-75">
//                     {MONTH_NAMES[date.getMonth()]}
//                   </span>
//                   {isOff && (
//                     <span className="text-[9px] font-bold text-red-400 mt-0.5 uppercase tracking-wide">
//                       OFF
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//           <p className="text-[10px] text-gray-400 text-center mt-2">
//             ← Swipe to see more dates →
//           </p>
//         </div>

//         {/* Service Address */}
//         {/* {mode !== 'reschedule' && (
//           <div>
//             <h3 className="text-sm font-semibold text-black mb-3">
//               Service Address
//             </h3>
//             {addresses.length === 0 ? (
//               <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
//                 <p className="text-xs text-amber-800">
//                   Add a saved address before booking this service.
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => router.push('/my-address')}
//                   className="mt-2 text-xs font-semibold text-orange-600 hover:underline"
//                 >
//                   Add address
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {addresses.map((addr) => {
//                   const active = addr._id === selectedAddressId;
//                   const line = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;
//                   return (
//                     <button
//                       key={addr._id}
//                       type="button"
//                       onClick={() => {
//                         setSelectedAddressId(addr._id);
//                         setValidationError('');
//                       }}
//                       className={`w-full rounded-xl border p-3 text-left transition-colors ${
//                         active
//                           ? 'border-orange-400 bg-orange-50'
//                           : 'border-gray-200 bg-white hover:border-orange-300'
//                       }`}
//                     >
//                       <span className="flex items-start gap-2">
//                         <MapPin className="mt-0.5 h-4 w-4 text-gray-500 shrink-0" />
//                         <span className="min-w-0">
//                           <span className="block text-sm font-semibold text-black">
//                             {addr.fullName} · {addr.phone}
//                           </span>
//                           <span className="mt-0.5 block text-xs text-gray-500">
//                             {line}
//                           </span>
//                         </span>
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )} */}

//         {/* Service Address */}
//         {/* {mode === 'reschedule' ? (
//           <div>
//             <h3 className="text-sm font-semibold text-black mb-3">
//               Service Address
//             </h3>
//             <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 flex items-start gap-2">
//               <MapPin className="mt-0.5 h-4 w-4 text-orange-400 shrink-0" />
//               <div>
//                 <p className="text-sm font-semibold text-black">
//                   {existingBooking?.name} · {existingBooking?.phone}
//                 </p>
//                 <p className="mt-0.5 text-xs text-gray-500">
//                   {existingBooking?.address}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div>
//             <h3 className="text-sm font-semibold text-black mb-3">
//               Service Address
//             </h3>
//             {addresses.length === 0 ? (
//               <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
//                 <p className="text-xs text-amber-800">
//                   Add a saved address before booking this service.
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => router.push('/my-address')}
//                   className="mt-2 text-xs font-semibold text-orange-600 hover:underline"
//                 >
//                   Add address
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {addresses.map((addr) => {
//                   const active = addr._id === selectedAddressId;
//                   const line = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;
//                   return (
//                     <button
//                       key={addr._id}
//                       type="button"
//                       onClick={() => {
//                         setSelectedAddressId(addr._id);
//                         setValidationError('');
//                       }}
//                       className={`w-full rounded-xl border p-3 text-left transition-colors ${
//                         active
//                           ? 'border-orange-400 bg-orange-50'
//                           : 'border-gray-200 bg-white hover:border-orange-300'
//                       }`}
//                     >
//                       <span className="flex items-start gap-2">
//                         <MapPin className="mt-0.5 h-4 w-4 text-gray-500 shrink-0" />
//                         <span className="min-w-0">
//                           <span className="block text-sm font-semibold text-black">
//                             {addr.fullName} · {addr.phone}
//                           </span>
//                           <span className="mt-0.5 block text-xs text-gray-500">
//                             {line}
//                           </span>
//                         </span>
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )} */}

//         {/* Service Address — reschedule only (create mode picks address at checkout) */}
//         {mode === 'reschedule' && (
//           <div>
//             <h3 className="text-sm font-semibold text-black mb-3">
//               Service Address
//             </h3>
//             <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 flex items-start gap-2">
//               <MapPin className="mt-0.5 h-4 w-4 text-orange-400 shrink-0" />
//               <div>
//                 <p className="text-sm font-semibold text-black">
//                   {existingBooking?.name} · {existingBooking?.phone}
//                 </p>
//                 <p className="mt-0.5 text-xs text-gray-500">
//                   {existingBooking?.address}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── SLOTS */}
//         <div>
//           <h3 className="text-sm font-semibold text-black mb-3">
//             Available Slots
//           </h3>
//           {availabilityLoading && (
//             <p className="text-xs text-gray-500 mb-2">
//               Checking latest slot availability...
//             </p>
//           )}

//           {/* Day off */}
//           {isDayOff && (
//             <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
//               <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
//               <span>
//                 No service available on this day. Please select another date.
//               </span>
//             </div>
//           )}

//           {/* Has schedule but no generated slots (edge case) */}
//           {!isDayOff && hasNoSlots && (
//             <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
//               <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
//               <span>No slots available for this date.</span>
//             </div>
//           )}

//           {/* Slot groups */}
//           {!isDayOff && !hasNoSlots && (
//             <div className="space-y-4">
//               {[
//                 { key: 'morning', label: 'MORNING', color: 'bg-amber-400' },
//                 {
//                   key: 'afternoon',
//                   label: 'AFTERNOON',
//                   color: 'bg-orange-400',
//                 },
//                 { key: 'evening', label: 'EVENING', color: 'bg-blue-400' },
//               ].map(({ key, label, color }) => {
//                 const group = slots?.[key] || [];
//                 if (group.length === 0) return null;
//                 return (
//                   <div key={key}>
//                     <div className="flex items-center gap-1.5 mb-2">
//                       <span className={`w-2 h-2 rounded-full ${color}`} />
//                       <span className="text-[10px] font-semibold text-gray-500 tracking-wider">
//                         {label}
//                       </span>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {group.map((slot) => {
//                         const isSelected = selectedSlot?.id === slot.id;
//                         return (
//                           <button
//                             key={slot.id}
//                             onClick={() => {
//                               if (slot.full) return;
//                               setSelectedSlot(slot);
//                               setValidationError('');
//                             }}
//                             disabled={slot.full}
//                             className={`relative px-3 py-2 rounded-full border text-xs sm:text-sm transition-all
//                               ${
//                                 slot.full
//                                   ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
//                                   : isSelected
//                                     ? 'border-orange-500 bg-orange-50 text-orange-600 font-semibold shadow-sm'
//                                     : 'border-gray-200 text-gray-700 bg-white hover:border-orange-400'
//                               }`}
//                           >
//                             {slot.label}
//                             {slot.full && (
//                               <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
//                                 {slot.past ? 'PAST' : 'FULL'}
//                               </span>
//                             )}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* ── URGENT BOOKING CARD */}
//         {!isDayOff && mode !== 'reschedule' && (
//           <div
//             className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
//               isUrgent
//                 ? 'border-amber-400 bg-amber-50'
//                 : 'border-amber-200 bg-amber-50/50'
//             }`}
//             onClick={() => setIsUrgent((prev) => !prev)}
//           >
//             <div className="flex items-start justify-between gap-3">
//               <div className="flex items-start gap-2">
//                 <Zap className="w-4 h-4 text-[#E17100]  shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-sm font-semibold text-[#7B3306]">
//                     Need it urgently? (Within 2 Hours)
//                   </p>
//                   <p className="text-xs text-[#973C00] mt-0.5">
//                     Convenience Fee:{' '}
//                     <span className="font-bold text-[#7B3306]">
//                       + ₹{URGENT_FEE}
//                     </span>
//                   </p>
//                 </div>
//               </div>
//               {/* Toggle */}
//               <div
//                 className={`w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${
//                   isUrgent ? 'bg-amber-500' : 'bg-gray-300'
//                 }`}
//               >
//                 <div
//                   className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${
//                     isUrgent ? 'translate-x-5' : 'translate-x-0.5'
//                   }`}
//                 />
//               </div>
//             </div>

//             {isUrgent && (
//               <div className="mt-3 flex items-start gap-2 bg-white rounded-xl p-3 border border-amber-200">
//                 <AlertCircle className="w-3.5 h-3.5 text-[#973C00] shrink-0 mt-0.5" />
//                 <p className="text-[11px] sm:text-xs text-[#973C00]">
//                   Technician will arrive within 2 hours. Subject to availability
//                   in your area.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── API error */}
//         {submitError && (
//           <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
//             <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
//             <p className="text-xs text-red-600">{submitError}</p>
//           </div>
//         )}
//       </div>

//       {/* ── STICKY FOOTER */}
//       <div className="border-t border-gray-100 p-4 sm:p-5 bg-white rounded-b-2xl">
//         {/* <div className="flex items-center justify-between mb-3">
//           <span className="text-sm text-gray-500">Service Total:</span>
//           <span className="text-xl font-bold text-black">
//             ₹{totalPrice}
//             {isUrgent && (
//               <span className="text-xs text-[#F97316] font-normal ml-1">
//                 (incl. ₹{URGENT_FEE} urgent fee)
//               </span>
//             )}
//           </span>
//         </div> */}
//         {/* <div className="flex items-center justify-between mb-3">
//           <span className="text-sm text-gray-500">Service Total:</span>
//           <span className="text-xl font-bold text-black flex items-center gap-2 flex-wrap justify-end">
//             ₹{totalPrice}
//             {isUrgent && (
//               <span className="text-xs text-[#F97316] font-normal ml-1">
//                 (incl. ₹{URGENT_FEE} urgent fee)
//               </span>
//             )}
//             {hasServiceOffer ? (
//               <>
//                 <span className="text-sm font-normal text-gray-400 line-through">
//                   ₹{rawBasePrice + (isUrgent ? URGENT_FEE : 0)}
//                 </span>
//               </>
//             ) : null}
//           </span>
//         </div> */}

//         <div className="flex items-center justify-between mb-3">
//           <span className="text-sm text-gray-500">Service Total:</span>
//           <span className="text-xl font-bold text-black flex items-center gap-2 flex-wrap justify-end">
//             ₹{totalPrice.toLocaleString('en-IN')}
//             {isUrgent && (
//               <span className="text-xs text-[#F97316] font-normal ml-1">
//                 (incl. ₹{URGENT_FEE.toLocaleString('en-IN')} urgent fee)
//               </span>
//             )}
//             {hasServiceOffer ? (
//               <>
//                 <span className="text-sm font-normal text-gray-400 line-through">
//                   ₹
//                   {(rawBasePrice + (isUrgent ? URGENT_FEE : 0)).toLocaleString(
//                     'en-IN',
//                   )}
//                 </span>
//               </>
//             ) : null}
//           </span>
//         </div>

//         <button
//           onClick={handleConfirm}
//           disabled={loading || availabilityLoading || isDayOff || !selectedSlot}
//           className={`w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all
//             ${
//               loading || availabilityLoading || isDayOff || !selectedSlot
//                 ? 'bg-orange-300 cursor-not-allowed'
//                 : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98]'
//             }`}
//         >
//           {loading ? (
//             <Loader2 className="w-4 h-4 animate-spin" />
//           ) : (
//             <Calendar className="w-4 h-4" />
//           )}

//           {loading
//             ? 'Confirming...'
//             : mode === 'reschedule'
//               ? 'Confirm Reschedule'
//               : 'Confirm Slot & Pay'}
//         </button>
//         <p className="text-center mt-1 text-xs text-[#E17100] flex items-center justify-center gap-1">
//           <AlertTriangle className="w-3 h-3" />
//           Please select a time slot to continue
//         </p>

//         {/* Validation error */}
//         {validationError && (
//           <p className="mt-2 text-center text-xs text-amber-600 flex items-center justify-center gap-1">
//             <AlertCircle className="w-3 h-3" />
//             {validationError}
//           </p>
//         )}
//       </div>
//     </ModalOverlay>
//   );
// };

// // ─────────────────────────────────────────────
// // OVERLAY WRAPPER
// // ─────────────────────────────────────────────

// const ModalOverlay = ({ children, onClose }) => {
//   if (typeof document === 'undefined') return null;
//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh]">
//         {children}
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default BookingModal;

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  X,
  Clock,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import {
  apiGetMyAddresses,
  apiGetServiceAvailability,
  apiRescheduleServiceBooking,
  apiGetPublicActiveOffers,
} from '@/lib/api';
import { api } from '@/lib/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  AUTH_REDIRECT_SESSION_KEY,
  useAuthModal,
} from '@/contexts/AuthModalContext';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Generate next 30 days from today
const generateDates = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// Generate time slots per session based on availability schedule
// availabilitySchedule: [{ day: 'Mon', startTime: '09:00', endTime: '18:00', isAvailable: true }]
const generateSlots = (date, availabilitySchedule = []) => {
  const dayName = DAY_NAMES[date.getDay()]; // 'Mon', 'Tue' etc
  const schedule = availabilitySchedule.find((s) => s.day === dayName);

  if (!schedule || !schedule.isAvailable) return null; // day off

  // Parse vendor's working hours
  const [startH] = schedule.startTime.split(':').map(Number);
  const [endH] = schedule.endTime.split(':').map(Number);

  const allSlots = [];

  // Build 1-hour slots within working hours
  for (let h = startH; h < endH; h++) {
    const from = `${String(h).padStart(2, '0')}:00`;
    const to = `${String(h + 1).padStart(2, '0')}:00`;
    const fromAmPm = formatTime(h, 0);
    const toAmPm = formatTime(h + 1, 0);
    allSlots.push({
      id: `${from}-${to}`,
      label: `${fromAmPm} - ${toAmPm}`,
      from,
      to,
      hour: h,
      full: false, // extend with real booking data if needed
    });
  }

  // Group into Morning / Afternoon / Evening
  const morning = allSlots.filter((s) => s.hour >= 6 && s.hour < 12);
  const afternoon = allSlots.filter((s) => s.hour >= 12 && s.hour < 17);
  const evening = allSlots.filter((s) => s.hour >= 17 && s.hour < 21);

  return { morning, afternoon, evening };
};

const filterPastSlots = (slotGroups, selectedDate) => {
  if (!slotGroups) return slotGroups;
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();
  if (!isToday) return slotGroups; // future date — show all slots

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const filterSlot = (slots = []) =>
    slots.map((slot) => {
      const [slotHour] = slot.from.split(':').map(Number);
      // Mark slot as full/past if its hour has already started
      // e.g. at 5:45pm, slots starting at 17:00 or earlier are past
      const isPast =
        slotHour < currentHour ||
        (slotHour === currentHour && currentMinute > 0);
      return isPast ? { ...slot, full: true, past: true } : slot;
    });

  return {
    morning: filterSlot(slotGroups.morning),
    afternoon: filterSlot(slotGroups.afternoon),
    evening: filterSlot(slotGroups.evening),
  };
};

const applyBookedSlots = (slotGroups, availability) => {
  if (!slotGroups) return slotGroups;
  const booked = new Map(
    (availability?.bookedSlots || []).map((slot) => [
      `${slot.from}-${slot.to}`,
      slot,
    ]),
  );
  const mark = (slots = []) =>
    slots.map((slot) => {
      const row = booked.get(`${slot.from}-${slot.to}`);
      return {
        ...slot,
        bookedCount: Number(row?.count || 0),
        full: Boolean(row?.full || availability?.unavailable),
      };
    });
  return {
    morning: mark(slotGroups.morning),
    afternoon: mark(slotGroups.afternoon),
    evening: mark(slotGroups.evening),
  };
};

const formatTime = (h, m) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

const URGENT_FEE = 150;
const parseMoney = (value) => {
  const cleaned = String(value || '').replace(/[^\d.]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

// ─────────────────────────────────────────────
// MODAL COMPONENT
// ─────────────────────────────────────────────

const BookingModal = ({
  isOpen,
  onClose,
  product,
  existingBooking,
  mode = 'create',
}) => {
  const router = useRouter();
  const { openAuth } = useAuthModal();
  const scrollRef = useRef(null);

  const [dates] = useState(generateDates);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [slots, setSlots] = useState(null); // { morning, afternoon, evening } | null
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [serviceOffer, setServiceOffer] = useState(null);
  const selectedAddress =
    addresses.find((addr) => addr._id === selectedAddressId) || null;

  // Recalculate slots whenever date changes
  useEffect(() => {
    if (!selectedDate) return;
    let ignore = false;
    setSelectedSlot(null);
    setValidationError('');
    const generated = generateSlots(
      selectedDate,
      product?.availabilitySchedule || [],
    );

    if (!generated) {
      setSlots(null);
      return;
    }

    const dateKey = formatDateForApi(selectedDate);
    setAvailabilityLoading(true);
    apiGetServiceAvailability(product._id, dateKey)
      .then((res) => {
        if (!ignore)
          setSlots(
            filterPastSlots(
              applyBookedSlots(generated, res.data),
              selectedDate,
            ),
          );
      })
      .catch(() => {
        if (!ignore) setSlots(filterPastSlots(generated, selectedDate));
      })
      .finally(() => {
        if (!ignore) setAvailabilityLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedDate, product]);

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'reschedule' && existingBooking) {
      const bookingDate = new Date(existingBooking.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      setSelectedDate(bookingDate);
      setIsUrgent(existingBooking.isUrgent || false);
    } else {
      setSelectedDate(dates[0]); // only for create mode
      setIsUrgent(false);
    }

    setSelectedSlot(null);
    setSubmitError('');
    setSuccess(false);
    setValidationError('');
    setAvailabilityLoading(false);
    setAddresses([]);
    setSelectedAddressId('');
  }, [isOpen, mode, existingBooking, dates]);

  // useEffect(() => {
  //   if (!isOpen) return;
  //   const token =
  //     typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
  //   if (!token) return;
  //   apiGetMyAddresses()
  //     .then((res) => {
  //       const list = Array.isArray(res.data?.addresses)
  //         ? res.data.addresses
  //         : [];
  //       setAddresses(list);
  //       setSelectedAddressId((prev) => prev || list?.[0]?._id || '');
  //     })
  //     .catch(() => {
  //       setAddresses([]);
  //       setSelectedAddressId('');
  //     });
  // }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) return;
    apiGetMyAddresses()
      .then((res) => {
        const list = Array.isArray(res.data?.addresses)
          ? res.data.addresses
          : [];
        setAddresses(list);
        setSelectedAddressId((prev) => prev || list?.[0]?._id || '');
      })
      .catch(() => {
        setAddresses([]);
        setSelectedAddressId('');
      });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !product?._id) {
      setServiceOffer(null);
      return;
    }
    let cancelled = false;
    apiGetPublicActiveOffers()
      .then((res) => {
        if (cancelled) return;
        const offers = res.data?.offers || [];
        const match = offers.find(
          (o) =>
            String(o.productId?._id || o.productId) === String(product._id),
        );
        setServiceOffer(match || null);
      })
      .catch(() => {
        if (!cancelled) setServiceOffer(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, product?._id]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // useEffect(() => {
  //   if (!existingBooking || mode !== 'reschedule') return;

  //   // prefill date
  //   const bookingDate = new Date(existingBooking.bookingDate);
  //   setSelectedDate(bookingDate);

  //   // prefill urgent
  //   setIsUrgent(existingBooking.isUrgent);

  //   // prefill slot (after slots load)
  // }, [existingBooking, mode]);

  useEffect(() => {
    if (!slots || !existingBooking || mode !== 'reschedule') return;

    const old = existingBooking.timeSlot;

    const findSlot = (list) =>
      list?.find((s) => s.from === old.from && s.to === old.to);

    const matched =
      findSlot(slots.morning) ||
      findSlot(slots.afternoon) ||
      findSlot(slots.evening);

    if (matched) {
      setSelectedSlot(matched);
    }
  }, [slots, existingBooking, mode]);

  if (!isOpen || !product) return null;

  // ── Derived values
  // const basePrice =
  //   (mode === 'reschedule' && existingBooking?.baseAmount
  //     ? Number(existingBooking.baseAmount)
  //     : 0) ||
  //   Number(product?.salesConfiguration?.salePrice || 0) ||
  //   parseMoney(product?.price);
  // const totalPrice = basePrice + (isUrgent ? URGENT_FEE : 0);
  const rawBasePrice =
    (mode === 'reschedule' && existingBooking?.baseAmount
      ? Number(existingBooking.baseAmount)
      : 0) ||
    Number(product?.salesConfiguration?.salePrice || 0) ||
    parseMoney(product?.price);

  const serviceDiscountPercent = Number(serviceOffer?.discountPercent || 0);
  const hasServiceOffer =
    mode !== 'reschedule' && !!serviceOffer && serviceDiscountPercent > 0;

  const basePrice = hasServiceOffer
    ? Math.max(
        0,
        Math.round(
          rawBasePrice - (rawBasePrice * serviceDiscountPercent) / 100,
        ),
      )
    : rawBasePrice;

  const totalPrice = basePrice + (isUrgent ? URGENT_FEE : 0);
  const isDayOff = slots === null;
  const hasNoSlots =
    slots &&
    slots.morning.length === 0 &&
    slots.afternoon.length === 0 &&
    slots.evening.length === 0;

  // ── Validate & Submit
  // const handleConfirm = async () => {
  //   setValidationError('');
  //   setSubmitError('');

  //   if (!selectedSlot) {
  //     setValidationError('Please select a time slot to continue');
  //     return;
  //   }

  //   const token =
  //     typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
  //   if (!token) {
  //     sessionStorage.setItem(
  //       AUTH_REDIRECT_SESSION_KEY,
  //       `/service/${product._id}`,
  //     );
  //     openAuth('login');
  //     return;
  //   }

  // if (mode !== 'reschedule' && !selectedAddress) {
  //   setValidationError('Please select a service address to continue');
  //   return;
  // }

  //   const payload = {
  //     productId: product._id,
  //     vendorId: product.vendorId,
  //     bookingDate: formatDateForApi(selectedDate), // "YYYY-MM-DD"
  //     timeSlot: {
  //       from: selectedSlot.from,
  //       to: selectedSlot.to,
  //       label: selectedSlot.label,
  //     },
  //     isUrgent,
  //     totalAmount: totalPrice,
  //     selectedAddress,
  //     serviceName: product.productName,
  //     image: product.image,
  //   };

  //   try {
  //     setLoading(true);
  //     localStorage.setItem(
  //       'rentpay_pending_service_booking',
  //       JSON.stringify(payload),
  //     );
  //     localStorage.setItem(
  //       'rentpay_checkout_selectedAddress',
  //       JSON.stringify(selectedAddress),
  //     );
  //     // router.push('/payment?mode=service');
  //     if (mode === 'create') {
  //       localStorage.setItem(
  //         'rentpay_pending_service_booking',
  //         JSON.stringify(payload),
  //       );
  //       router.push('/payment?mode=service');
  //     }
  //   } catch (err) {
  //     const msg =
  //       err?.response?.data?.message || 'Booking failed. Please try again.';
  //     setSubmitError(msg);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleConfirm = async () => {
    setValidationError('');
    setSubmitError('');

    if (!selectedSlot) {
      setValidationError('Please select a time slot to continue');
      return;
    }

    // if (mode !== 'reschedule' && !selectedAddress) {
    //   setValidationError('Please select a service address to continue');
    //   return;
    // }

    try {
      setLoading(true);

      if (mode === 'create') {
        // const payload = {
        //   productId: product._id,
        //   vendorId: product.vendorId,
        //   bookingDate: formatDateForApi(selectedDate),
        //   timeSlot: {
        //     from: selectedSlot.from,
        //     to: selectedSlot.to,
        //     label: selectedSlot.label,
        //   },
        //   isUrgent,
        //   totalAmount: totalPrice,
        //   selectedAddress,
        //   serviceName: product.productName,
        //   image: product.image,
        // };
        const payload = {
          productId: product._id,
          vendorId: product.vendorId,
          bookingDate: formatDateForApi(selectedDate),
          timeSlot: {
            from: selectedSlot.from,
            to: selectedSlot.to,
            label: selectedSlot.label,
          },
          isUrgent,
          totalAmount: totalPrice,
          originalAmount: rawBasePrice + (isUrgent ? URGENT_FEE : 0),
          selectedAddress: null, // filled in later on the Checkout page
          serviceName: product.productName,
          image: product.image,
          // pass subcategory tax fields for order summary
          // subCategoryTax: product?.subCategoryTax || {},
          // category: product?.category || '',
          // subCategory: product?.subCategory || '',
          subCategoryTax: product?.subCategoryTax || {},
          category: product?.category || '',
          subCategory: product?.subCategory || '',
          // taxBlocked: product?.subCategoryTax?.taxBlocked ?? false,
          taxBlocked: product?.taxBlocked ?? false,
        };

        // localStorage.setItem(
        //   'rentpay_pending_service_booking',
        //   JSON.stringify(payload),
        // );
        // window.dispatchEvent(new CustomEvent('rn_service_cart_changed'));

        // router.push('/cart');
        const existingRaw = localStorage.getItem(
          'rentpay_pending_service_bookings',
        );
        let existingList = [];
        try {
          existingList = existingRaw ? JSON.parse(existingRaw) : [];
          if (!Array.isArray(existingList)) existingList = [];
        } catch {
          existingList = [];
        }
        const bookingId = `${payload.productId}_${Date.now()}`;
        const newEntry = { ...payload, bookingId };
        // Same product re-booked → replace its old slot instead of duplicating
        const updatedList = [
          ...existingList.filter(
            (b) => String(b.productId) !== String(payload.productId),
          ),
          newEntry,
        ];
        //   localStorage.setItem(
        //     'rentpay_pending_service_bookings',
        //     JSON.stringify(updatedList),
        //   );
        //   window.dispatchEvent(new CustomEvent('rn_service_cart_changed'));

        //   onClose();
        // }
        localStorage.setItem(
          'rentpay_pending_service_bookings',
          JSON.stringify(updatedList),
        );
        window.dispatchEvent(new CustomEvent('rn_service_cart_changed'));

        // Silently mirror to server so admin can see live service bookings,
        // same as the Redux cart middleware does for product cart items.
        const userToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('userToken')
            : null;
        if (userToken) {
          api
            .post('/live-cart/sync-services', { bookings: updatedList })
            .catch(() => {
              // Silent fail — never disrupt the user's booking flow.
            });
        }

        toast.success('Service added to cart', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });

        onClose();
      }

      //   localStorage.setItem(
      //     'rentpay_pending_service_booking',
      //     JSON.stringify(payload),
      //   );

      //   router.push('/payment?mode=service');
      // }

      // ─────────────────────────────
      //  RESCHEDULE MODE
      // ─────────────────────────────
      if (mode === 'reschedule') {
        await apiRescheduleServiceBooking(existingBooking._id, {
          bookingDate: formatDateForApi(selectedDate),
          timeSlot: {
            from: selectedSlot.from,
            to: selectedSlot.to,
            label: selectedSlot.label,
          },
          isUrgent,
        });

        setSuccess(true);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // SUCCESS STATE
  // ─────────────────────────────────────────────
  if (success) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          {/* <h2 className="text-xl font-semibold text-black mb-2">
            Booking Confirmed!
          </h2> */}

          <h2 className="text-base font-medium text-gray-500 mb-1 ">
            {mode === 'reschedule'
              ? 'Booking Rescheduled!'
              : 'Booking Confirmed!'}
          </h2>
          <p className="text-lg  text-gray-500 mb-1">
            <p className="text-lg text-gray-500 mb-1">
              <span className="font-semibold text-black">
                {product.productName} Service
              </span>
            </p>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()}{' '}
            {MONTH_NAMES[selectedDate.getMonth()]} · {selectedSlot?.label}
          </p>
          {/* <p className="text-2xl font-bold text-black mb-6">₹{totalPrice}</p> */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Done
          </button>
        </div>
      </ModalOverlay>
    );
  }

  // ─────────────────────────────────────────────
  // MAIN MODAL
  // ─────────────────────────────────────────────
  return (
    <ModalOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between p-4 sm:p-5 border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-black">
            Select a Time Slot
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            For{' '}
            <span className="font-semibold text-gray-700 capitalize">
              {product.productName}
            </span>
          </p>
          {(() => {
            const slot = product?.availabilitySchedule?.find(
              (s) => s.isAvailable,
            );

            const workDuration = slot?.workDuration;

            return workDuration ? (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Clock className="w-3 h-3" />
                Estimated Duration:
                <span className="text-black font-medium">
                  {workDuration} hours
                </span>
              </p>
            ) : null;
          })()}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 sm:px-5 py-4 space-y-6"
      >
        {/* ── DATE PICKER */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">Select Date</h3>

          {/* Horizontal scrollable date strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {dates.map((date) => {
              const dayName = DAY_NAMES[date.getDay()];
              const schedule = product?.availabilitySchedule?.find(
                (s) => s.day === dayName,
              );
              const isOff = !schedule || !schedule.isAvailable;
              const isSelected =
                selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isOff && setSelectedDate(date)}
                  disabled={isOff}
                  className={`flex flex-col items-center justify-center w-[72px] h-[72px] rounded-full border text-center transition-all flex-shrink-0
                    ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                        : isOff
                          ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-orange-400'
                    }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                    {dayName}
                  </span>
                  <span className="text-xl font-bold leading-tight">
                    {date.getDate()}
                  </span>
                  <span className="text-[10px] opacity-75">
                    {MONTH_NAMES[date.getMonth()]}
                  </span>
                  {isOff && (
                    <span className="text-[9px] font-bold text-red-400 mt-0.5 uppercase tracking-wide">
                      OFF
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            ← Swipe to see more dates →
          </p>
        </div>

        {/* Service Address */}
        {/* {mode !== 'reschedule' && (
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">
              Service Address
            </h3>
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  Add a saved address before booking this service.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/my-address')}
                  className="mt-2 text-xs font-semibold text-orange-600 hover:underline"
                >
                  Add address
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const active = addr._id === selectedAddressId;
                  const line = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;
                  return (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr._id);
                        setValidationError('');
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        active
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-gray-500 shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-black">
                            {addr.fullName} · {addr.phone}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {line}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )} */}

        {/* Service Address */}
        {/* {mode === 'reschedule' ? (
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">
              Service Address
            </h3>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-orange-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-black">
                  {existingBooking?.name} · {existingBooking?.phone}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {existingBooking?.address}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">
              Service Address
            </h3>
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  Add a saved address before booking this service.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/my-address')}
                  className="mt-2 text-xs font-semibold text-orange-600 hover:underline"
                >
                  Add address
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const active = addr._id === selectedAddressId;
                  const line = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;
                  return (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr._id);
                        setValidationError('');
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        active
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-gray-500 shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-black">
                            {addr.fullName} · {addr.phone}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {line}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )} */}

        {/* Service Address — reschedule only (create mode picks address at checkout) */}
        {mode === 'reschedule' && (
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">
              Service Address
            </h3>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-orange-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-black">
                  {existingBooking?.name} · {existingBooking?.phone}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {existingBooking?.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SLOTS */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">
            Available Slots
          </h3>
          {availabilityLoading && (
            <p className="text-xs text-gray-500 mb-2">
              Checking latest slot availability...
            </p>
          )}

          {/* Day off */}
          {isDayOff && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                No service available on this day. Please select another date.
              </span>
            </div>
          )}

          {/* Has schedule but no generated slots (edge case) */}
          {!isDayOff && hasNoSlots && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
              <span>No slots available for this date.</span>
            </div>
          )}

          {/* Slot groups */}
          {!isDayOff && !hasNoSlots && (
            <div className="space-y-4">
              {[
                { key: 'morning', label: 'MORNING', color: 'bg-amber-400' },
                {
                  key: 'afternoon',
                  label: 'AFTERNOON',
                  color: 'bg-orange-400',
                },
                { key: 'evening', label: 'EVENING', color: 'bg-blue-400' },
              ].map(({ key, label, color }) => {
                const group = slots?.[key] || [];
                if (group.length === 0) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-[10px] font-semibold text-gray-500 tracking-wider">
                        {label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => {
                              if (slot.full) return;
                              setSelectedSlot(slot);
                              setValidationError('');
                            }}
                            disabled={slot.full}
                            className={`relative px-3 py-2 rounded-full border text-xs sm:text-sm transition-all
                              ${
                                slot.full
                                  ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'border-orange-500 bg-orange-50 text-orange-600 font-semibold shadow-sm'
                                    : 'border-gray-200 text-gray-700 bg-white hover:border-orange-400'
                              }`}
                          >
                            {slot.label}
                            {slot.full && (
                              <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {slot.past ? 'PAST' : 'FULL'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── URGENT BOOKING CARD */}
        {!isDayOff && mode !== 'reschedule' && (
          <div
            className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
              isUrgent
                ? 'border-amber-400 bg-amber-50'
                : 'border-amber-200 bg-amber-50/50'
            }`}
            onClick={() => setIsUrgent((prev) => !prev)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#E17100]  shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#7B3306]">
                    Need it urgently? (Within 2 Hours)
                  </p>
                  <p className="text-xs text-[#973C00] mt-0.5">
                    Convenience Fee:{' '}
                    <span className="font-bold text-[#7B3306]">
                      + ₹{URGENT_FEE}
                    </span>
                  </p>
                </div>
              </div>
              {/* Toggle */}
              <div
                className={`w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${
                  isUrgent ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${
                    isUrgent ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>

            {isUrgent && (
              <div className="mt-3 flex items-start gap-2 bg-white rounded-xl p-3 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-[#973C00] shrink-0 mt-0.5" />
                <p className="text-[11px] sm:text-xs text-[#973C00]">
                  Technician will arrive within 2 hours. Subject to availability
                  in your area.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── API error */}
        {submitError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{submitError}</p>
          </div>
        )}
      </div>

      {/* ── STICKY FOOTER */}
      <div className="border-t border-gray-100 p-4 sm:p-5 bg-white rounded-b-2xl">
        {/* <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Service Total:</span>
          <span className="text-xl font-bold text-black">
            ₹{totalPrice}
            {isUrgent && (
              <span className="text-xs text-[#F97316] font-normal ml-1">
                (incl. ₹{URGENT_FEE} urgent fee)
              </span>
            )}
          </span>
        </div> */}
        {/* <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Service Total:</span>
          <span className="text-xl font-bold text-black flex items-center gap-2 flex-wrap justify-end">
            ₹{totalPrice}
            {isUrgent && (
              <span className="text-xs text-[#F97316] font-normal ml-1">
                (incl. ₹{URGENT_FEE} urgent fee)
              </span>
            )}
            {hasServiceOffer ? (
              <>
                <span className="text-sm font-normal text-gray-400 line-through">
                  ₹{rawBasePrice + (isUrgent ? URGENT_FEE : 0)}
                </span>
              </>
            ) : null}
          </span>
        </div> */}

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Service Total:</span>
          <span className="text-xl font-bold text-black flex items-center gap-2 flex-wrap justify-end">
            ₹{totalPrice.toLocaleString('en-IN')}
            {isUrgent && (
              <span className="text-xs text-[#F97316] font-normal ml-1">
                (incl. ₹{URGENT_FEE.toLocaleString('en-IN')} urgent fee)
              </span>
            )}
            {hasServiceOffer ? (
              <>
                <span className="text-sm font-normal text-gray-400 line-through">
                  ₹
                  {(rawBasePrice + (isUrgent ? URGENT_FEE : 0)).toLocaleString(
                    'en-IN',
                  )}
                </span>
              </>
            ) : null}
          </span>
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading || availabilityLoading || isDayOff || !selectedSlot}
          className={`w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all
            ${
              loading || availabilityLoading || isDayOff || !selectedSlot
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98]'
            }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}

          {loading
            ? 'Confirming...'
            : mode === 'reschedule'
              ? 'Confirm Reschedule'
              : 'Confirm Slot & Pay'}
        </button>
        <p className="text-center mt-1 text-xs text-[#E17100] flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Please select a time slot to continue
        </p>

        {/* Validation error */}
        {validationError && (
          <p className="mt-2 text-center text-xs text-amber-600 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {validationError}
          </p>
        )}
      </div>
    </ModalOverlay>
  );
};

// ─────────────────────────────────────────────
// OVERLAY WRAPPER
// ─────────────────────────────────────────────

const ModalOverlay = ({ children, onClose }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh]">
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default BookingModal;
