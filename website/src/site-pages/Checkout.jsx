// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   MapPin,
//   Store,
//   Star,
//   Navigation,
//   Phone,
//   Pencil,
//   Trash2,
//   ShieldCheck,
//   ArrowBigRight,
//   ArrowUpRight,
//   ChevronRight,
// } from 'lucide-react';
// import { apiCreateRazorpayOrder, apiVerifyRazorpayPayment } from '@/lib/api';
// import { apiCreateBooking, apiSendBookingConfirmationEmail } from '@/lib/api';
// import ServiceReceiptModal from '@/components/ServiceReceiptModal';
// import PaymentMain from '@/components/PaymentSuccessPage/PaymentMain';
// import {
//   syncCart,
//   clearCart,
//   clearAppliedCoupon,
// } from '../store/slices/cartSlice';
// import { apiCreateOrder } from '@/lib/api';
// import {
//   apiGetMyAddresses,
//   apiGetCheckoutPickupStores,
//   apiCreateAddress,
//   apiUpdateAddress,
//   apiDeleteAddress,
// } from '@/lib/api';
// import {
//   useAuthModal,
//   AUTH_REDIRECT_SESSION_KEY,
// } from '@/contexts/AuthModalContext';

// function getUserId(user) {
//   return user?.id || user?._id || null;
// }

// function toRad(v) {
//   return (Number(v) * Math.PI) / 180;
// }

// // function distanceKm(aLat, aLon, bLat, bLon) {
// //   const R = 6371;
// //   const dLat = toRad(Number(bLat) - Number(aLat));
// //   const dLon = toRad(Number(bLon) - Number(aLon));
// //   const lat1 = toRad(aLat);
// //   const lat2 = toRad(bLat);
// //   const s1 = Math.sin(dLat / 2);
// //   const s2 = Math.sin(dLon / 2);
// //   const x = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
// //   const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
// //   return R * c;
// // }

// function distanceKm(aLat, aLon, bLat, bLon) {
//   const R = 6371;
//   const dLat = toRad(Number(bLat) - Number(aLat));
//   const dLon = toRad(Number(bLon) - Number(aLon));
//   const lat1 = toRad(aLat);
//   const lat2 = toRad(bLat);
//   const s1 = Math.sin(dLat / 2);
//   const s2 = Math.sin(dLon / 2);
//   const x = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
//   const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
//   return R * c;
// }

// function safeParseLocation(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// function getNavbarOrderLocation() {
//   if (typeof window === 'undefined') return null;
//   const parsed = safeParseLocation(
//     localStorage.getItem('rn_delivery_location'),
//   );
//   const lat = Number(parsed?.lat);
//   const lng = Number(parsed?.lon);
//   if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
//   return { lat, lng, label: String(parsed?.label || '') };
// }

// export default function Checkout() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { openAuth } = useAuthModal();

//   // const { items, appliedCoupon } = useSelector((s) => s.cart);
//   // const [pendingServiceBooking, setPendingServiceBooking] = useState(null);

//   // useEffect(() => {
//   //   try {
//   //     const raw = localStorage.getItem('rentpay_pending_service_booking');
//   //     setPendingServiceBooking(raw ? JSON.parse(raw) : null);
//   //   } catch {
//   //     setPendingServiceBooking(null);
//   //   }
//   // }, []);

//   const { items, appliedCoupon } = useSelector((s) => s.cart);
//   const [pendingServiceBookings, setPendingServiceBookings] = useState([]);
//   const [isServiceHydrated, setIsServiceHydrated] = useState(false);

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem('rentpay_pending_service_bookings');
//       const list = raw ? JSON.parse(raw) : [];
//       setPendingServiceBookings(Array.isArray(list) ? list : []);
//     } catch {
//       setPendingServiceBookings([]);
//     } finally {
//       setIsServiceHydrated(true);
//     }
//   }, []);
//   const { user } = useSelector((s) => s.auth);
//   const userId = useMemo(() => getUserId(user), [user]);

//   const [addresses, setAddresses] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const selectedAddress = useMemo(
//     () => addresses.find((a) => a._id === selectedId) || null,
//     [addresses, selectedId],
//   );

//   const [deliveryInstructions, setDeliveryInstructions] = useState('');
//   const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
//   const [billingGstin, setBillingGstin] = useState('');
//   const [error, setError] = useState('');
//   const [payLoading, setPayLoading] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState('add');
//   const [editingId, setEditingId] = useState(null);
//   const [pickupLoading, setPickupLoading] = useState(false);
//   const [pickupError, setPickupError] = useState('');
//   const [pickupStores, setPickupStores] = useState([]);
//   const [mapPreviewOpen, setMapPreviewOpen] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [successOrderId, setSuccessOrderId] = useState('');
//   const [successOrderData, setSuccessOrderData] = useState(null);
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [serviceReceiptData, setServiceReceiptData] = useState(null);
//   const [checkoutFocusProductId, setCheckoutFocusProductId] = useState('');
//   const [hasMounted, setHasMounted] = useState(false);

//   useEffect(() => {
//     setHasMounted(true);
//   }, []);
//   const [form, setForm] = useState({
//     label: 'Home',
//     fullName: user?.fullName || '',
//     phone: '',
//     area: '',
//     addressLine: '',
//     city: '',
//     cityKey: '',
//     pincode: '',
//   });

//   const total = useMemo(() => {
//     const isDailyRental = (i) =>
//       String(i?.productType || 'Rental') === 'Rental' &&
//       String(i?.tenureUnit || 'month') === 'day';
//     const isRental = (i) => String(i?.productType || 'Rental') === 'Rental';

//     const baseCost = items.reduce((sum, i) => {
//       const qty = isDailyRental(i) ? 1 : Number(i.quantity || 1);
//       return sum + Number(i.pricePerDay || 0) * qty;
//     }, 0);

//     const pendingBookings = (() => {
//       try {
//         const raw = localStorage.getItem('rentpay_pending_service_bookings');
//         const list = raw ? JSON.parse(raw) : [];
//         return Array.isArray(list) ? list : [];
//       } catch {
//         return [];
//       }
//     })();

//     return (
//       baseCost +
//       (appliedCoupon?.discountAmount ? -appliedCoupon.discountAmount : 0)
//     );
//   }, [items, appliedCoupon]);

//   const locationCoords = useMemo(() => {
//     if (typeof window === 'undefined') return null;
//     try {
//       const raw = localStorage.getItem('rn_delivery_location');
//       const parsed = raw ? JSON.parse(raw) : null;
//       const lat = Number(parsed?.lat);
//       const lon = Number(parsed?.lon);
//       if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
//       return { lat, lon };
//     } catch {
//       return null;
//     }
//   }, [selectedId, addresses.length]);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const saved =
//       sessionStorage.getItem('rentpay_checkout_focus_product_id') || '';
//     setCheckoutFocusProductId(saved);
//   }, []);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     if (!checkoutFocusProductId) return;
//     const existsInCart = items.some(
//       (item) =>
//         String(item?.productId || '') === String(checkoutFocusProductId),
//     );
//     if (existsInCart) return;
//     sessionStorage.removeItem('rentpay_checkout_focus_product_id');
//     setCheckoutFocusProductId('');
//   }, [checkoutFocusProductId, items]);

//   const primaryPickupStore = useMemo(() => {
//     if (!pickupStores.length) return null;
//     const primaryProductId = String(
//       checkoutFocusProductId ||
//         items?.[items.length - 1]?.productId ||
//         items?.[0]?.productId ||
//         '',
//     );
//     if (!primaryProductId) return pickupStores[0] || null;
//     const matched = pickupStores.find((s) =>
//       Array.isArray(s?.products)
//         ? s.products.some(
//             (p) => String(p?.productId || '') === primaryProductId,
//           )
//         : false,
//     );
//     return matched || pickupStores[0] || null;
//   }, [pickupStores, items, checkoutFocusProductId]);
//   const pickupDistanceText = useMemo(() => {
//     if (!primaryPickupStore || !locationCoords) return '';
//     const sLat = Number(primaryPickupStore.mapLat);
//     const sLng = Number(primaryPickupStore.mapLng);
//     if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) return '';
//     const d = distanceKm(locationCoords.lat, locationCoords.lon, sLat, sLng);
//     if (!Number.isFinite(d)) return '';
//     return `${d < 10 ? d.toFixed(1) : Math.round(d)} km away from your location`;
//   }, [primaryPickupStore, locationCoords]);

//   // useEffect(() => {
//   //   if (items.length === 0) {
//   //     router.replace('/cart');
//   //     return;
//   //   }
//   // useEffect(() => {
//   //   if (items.length === 0 && !pendingServiceBooking) {
//   //     router.replace('/cart');
//   //     return;
//   //   }
//   //   if (!userId) {
//   //     sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
//   //     openAuth('login');
//   //     return;
//   //   }
//   // }, [items.length, router, userId, dispatch, openAuth]);
//   // useEffect(() => {
//   //   if (!isServiceHydrated) return; // wait until we actually know if a service booking is pending
//   //   if (showSuccessModal) return; // don't redirect away once payment succeeded and cart was cleared
//   //   if (items.length === 0 && pendingServiceBookings.length === 0) {
//   //     router.replace('/cart');
//   //     return;
//   //   }
//   //   if (!userId) {
//   //     sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
//   //     openAuth('login');
//   //     return;
//   //   }
//   // }, [
//   //   items.length,
//   //   router,
//   //   userId,
//   //   dispatch,
//   //   openAuth,
//   //   isServiceHydrated,
//   //   pendingServiceBookings.length,
//   //   showSuccessModal,
//   // ]);

//   useEffect(() => {
//     if (!isServiceHydrated) return; // wait until we actually know if a service booking is pending
//     if (showSuccessModal || showReceiptModal) return; // don't redirect away once payment succeeded / receipt is showing
//     if (items.length === 0 && pendingServiceBookings.length === 0) {
//       router.replace('/cart');
//       return;
//     }
//     if (!userId) {
//       sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
//       openAuth('login');
//       return;
//     }
//   }, [
//     items.length,
//     router,
//     userId,
//     dispatch,
//     openAuth,
//     isServiceHydrated,
//     pendingServiceBookings.length,
//     showSuccessModal,
//     showReceiptModal,
//   ]);

//   useEffect(() => {
//     if (!userId) return;
//     dispatch(syncCart());
//     apiGetMyAddresses()
//       .then((res) => {
//         const list = res.data?.addresses || [];
//         setAddresses(list);
//         if (list.length > 0) setSelectedId((prev) => prev || list[0]._id);
//       })
//       .catch(() => setAddresses([]));
//   }, [userId]);

//   useEffect(() => {
//     if (!addresses.length) setSelectedId(null);
//   }, [addresses]);

//   useEffect(() => {
//     if (!userId || !items.length) {
//       setPickupStores([]);
//       setPickupError('');
//       setPickupLoading(false);
//       return;
//     }
//     setPickupLoading(true);
//     setPickupError('');
//     setPickupStores([]);
//     const ids = items.map((x) => x.productId).filter(Boolean);
//     apiGetCheckoutPickupStores(ids)
//       .then((res) => {
//         setPickupStores(Array.isArray(res.data?.stores) ? res.data.stores : []);
//       })
//       .catch((err) => {
//         setPickupStores([]);
//         setPickupError(
//           err.response?.data?.message || 'Could not load pickup store details.',
//         );
//       })
//       .finally(() => setPickupLoading(false));
//   }, [userId, items]);

//   const openAddModal = () => {
//     setModalMode('add');
//     setEditingId(null);
//     setForm({
//       label: 'Home',
//       fullName: user?.fullName || '',
//       phone: '',
//       area: '',
//       addressLine: '',
//       city: '',
//       cityKey: '',
//       pincode: '',
//     });
//     setError('');
//     setModalOpen(true);
//   };

//   const openEditModal = (addr) => {
//     setModalMode('edit');
//     setEditingId(addr._id);
//     setForm({
//       label: addr.label || 'Home',
//       fullName: addr.fullName || user?.fullName || '',
//       phone: addr.phone || '',
//       area: addr.area || '',
//       addressLine: addr.addressLine || '',
//       city: addr.city || '',
//       cityKey: addr.cityKey || (addr.city || '').trim().toLowerCase(),
//       pincode: addr.pincode || '',
//     });
//     setError('');
//     setModalOpen(true);
//   };

//   // const handleSaveAddress = () => {
//   //   if (
//   //     !form.fullName.trim() ||
//   //     !form.phone.trim() ||
//   //     !form.addressLine.trim()
//   //   ) {
//   //     setError('Please fill name, phone and address line.');
//   //     return;
//   //   }
//   const handleSaveAddress = () => {
//     if (
//       !form.label.trim() ||
//       !form.fullName.trim() ||
//       !form.phone.trim() ||
//       !form.addressLine.trim() ||
//       !form.area.trim() ||
//       !form.pincode.trim()
//     ) {
//       setError('Please fill all required fields.');
//       return;
//     }

//     if (!/^\d{10}$/.test(form.phone.trim())) {
//       setError('Please enter a valid 10-digit phone number.');
//       return;
//     }

//     const payload = {
//       label: form.label,
//       fullName: form.fullName.trim(),
//       phone: form.phone.trim(),
//       area: form.area.trim(),
//       addressLine: form.addressLine.trim(),
//       city: form.city.trim(),
//       cityKey: form.city.trim().toLowerCase(),
//       pincode: form.pincode.trim(),
//     };

//     setError('');
//     if (modalMode === 'edit' && editingId) {
//       apiUpdateAddress(editingId, payload)
//         .then((res) => {
//           const updated = res.data?.address;
//           if (!updated) return;
//           setAddresses((prev) =>
//             prev.map((a) => (a._id === updated._id ? updated : a)),
//           );
//           setSelectedId(updated._id);
//           setModalOpen(false);
//         })
//         .catch((err) =>
//           setError(err.response?.data?.message || 'Could not update address.'),
//         );
//       return;
//     }

//     apiCreateAddress(payload)
//       .then((res) => {
//         const created = res.data?.address;
//         if (!created) return;
//         setAddresses((prev) => [created, ...prev]);
//         setSelectedId(created._id);
//         setModalOpen(false);
//       })
//       .catch((err) =>
//         setError(err.response?.data?.message || 'Could not save address.'),
//       );
//   };

//   const handleDeleteAddress = (id) => {
//     apiDeleteAddress(id)
//       .then(() => {
//         setAddresses((prev) => prev.filter((a) => a._id !== id));
//         if (selectedId === id) setSelectedId(null);
//       })
//       .catch((err) =>
//         setError(err.response?.data?.message || 'Could not delete address.'),
//       );
//   };

//   // const proceedToPayment = () => {
//   //   const rentalMonthsValues = items
//   //     .filter((i) => String(i.productType || 'Rental') === 'Rental')
//   //     .map((i) => i.rentalMonths || 1);
//   //   const first = rentalMonthsValues[0];
//   //   const allSame = rentalMonthsValues.every((v) => v === first);
//   //   if (!allSame) {
//   //     setError(
//   //       'Please keep the same rental duration for all items in your cart.',
//   //     );
//   //     return;
//   //   }
//   // const proceedToPayment = () => {
//   //   // Daily-rental items use flexible date ranges, so their day counts are
//   //   // expected to differ between items — only monthly-tenure items need to
//   //   // share the same rental duration.
//   //   const monthlyRentalValues = items
//   //     .filter(
//   //       (i) =>
//   //         String(i.productType || 'Rental') === 'Rental' &&
//   //         String(i.tenureUnit || 'month') !== 'day',
//   //     )
//   //     .map((i) => i.rentalMonths || 1);
//   //   const firstMonthly = monthlyRentalValues[0];
//   //   const allMonthlySame = monthlyRentalValues.every((v) => v === firstMonthly);
//   //   if (!allMonthlySame) {
//   //     setError(
//   //       'Please keep the same rental duration for all monthly-rental items in your cart.',
//   //     );
//   //     return;
//   //   }

//   //   if (!selectedAddress) {
//   const [showServicePayChoice, setShowServicePayChoice] = useState(false);

//   const handleProceedClick = () => {
//     if (!selectedAddress) {
//       setError('Please select or add a delivery address.');
//       return;
//     }
//     if (pendingServiceBookings.length > 0) {
//       setShowServicePayChoice(true);
//       return;
//     }
//     proceedToPayment();
//   };

//   const proceedToPayment = async (opts = {}) => {
//     const payAfterService = Boolean(opts.payAfterService);
//     // Each rental item (monthly or daily) can have its own independent
//     // tenure/date range, so no cross-item duration matching is required.

//     if (!selectedAddress) {
//       setError('Please select or add a delivery address.');
//       return;
//     }

//     localStorage.setItem(
//       'rentpay_checkout_selectedAddress',
//       JSON.stringify({
//         ...selectedAddress,
//         cityKey:
//           selectedAddress.cityKey ||
//           (selectedAddress.city || '').trim().toLowerCase(),
//       }),
//     );
//     localStorage.setItem(
//       'rentpay_checkout_instructions',
//       JSON.stringify(deliveryInstructions),
//     );
//     localStorage.setItem(
//       'rentpay_checkout_billing',
//       JSON.stringify({
//         billingSameAsDelivery,
//         gstin: billingGstin,
//       }),
//     );

//     if (pendingServiceBookings.length > 0) {
//       const updatedBookings = pendingServiceBookings.map((b) => ({
//         ...b,
//         selectedAddress,
//       }));
//       localStorage.setItem(
//         'rentpay_pending_service_bookings',
//         JSON.stringify(updatedBookings),
//       );
//     }

//     // ── Razorpay popup ─────────────────────────────────────────────
//     setError('');
//     setPayLoading(true);
//     try {
//       const savedTotal = (() => {
//         try {
//           const raw = localStorage.getItem('rentpay_checkout_total');
//           const parsed = Number(raw);
//           return parsed > 0 ? parsed : total;
//         } catch {
//           return total;
//         }
//       })();

//       // Loaded early so we can compute each pending service booking's
//       // true payable total, needed to work out how much (if anything)
//       // still needs to go through Razorpay for "Pay After Service".
//       let checkoutGlobalTax = null;
//       try {
//         const { apiGetGlobalTax } = await import('@/lib/api');
//         const taxRes = await apiGetGlobalTax();
//         checkoutGlobalTax = taxRes.data?.data?.config || null;
//       } catch (e) {
//         console.error('Failed to load global tax for checkout', e);
//       }

//       const careProtectionEnabled = (() => {
//         try {
//           const saved = localStorage.getItem('rentpay_care_protection_enabled');
//           return saved === null ? true : saved === 'true';
//         } catch {
//           return true;
//         }
//       })();

//       const computeBookingTotal = (booking) => {
//         const bTax = booking?.subCategoryTax || {};
//         const isBlocked =
//           booking?.taxBlocked === true || bTax?.taxBlocked === true;
//         const base = Number(booking?.totalAmount || 0);
//         if (isBlocked || !checkoutGlobalTax)
//           return { base, taxLines: [], total: base };
//         const calc = (subKey, globalKey) => {
//           const rate =
//             bTax[subKey] != null
//               ? Number(bTax[subKey])
//               : (checkoutGlobalTax?.services?.[globalKey] ?? 0);
//           return Math.round((base * rate) / 100);
//         };
//         const taxLines = [
//           { label: 'GST', value: calc('defaultGst', 'gst') },
//           {
//             label: 'Care Tax',
//             value: careProtectionEnabled
//               ? calc('defaultCareTax', 'careTax')
//               : 0,
//           },
//           {
//             label: 'Repair & Warranty',
//             value: calc('defaultRepairWarranty', 'repairWarranty'),
//           },
//           {
//             label: 'Relocation Warranty',
//             value: calc('defaultRelocationWarranty', 'relocationWarranty'),
//           },
//           {
//             label: 'Delivery & Packaging',
//             value: calc('defaultDeliveryPackaging', 'deliveryPackaging'),
//           },
//           {
//             label: 'Installation Fee',
//             value: calc('defaultInstallationFee', 'installationFee'),
//           },
//           {
//             label: 'Platform Fee',
//             value: calc('defaultPlatformFee', 'platformFee'),
//           },
//         ].filter((t) => t.value > 0);
//         const total = base + taxLines.reduce((s, t) => s + t.value, 0);
//         return { base, taxLines, total };
//       };

//       const serviceBookingsTotal = pendingServiceBookings.reduce(
//         (sum, b) => sum + computeBookingTotal(b).total,
//         0,
//       );
//       const razorAmount = payAfterService
//         ? Math.max(0, Math.round(savedTotal - serviceBookingsTotal))
//         : savedTotal;

//       let capturedPaymentId = '';
//       if (razorAmount > 0) {
//         const rzpRes = await apiCreateRazorpayOrder(razorAmount);
//         const { orderId: razorpayOrderId, amount } = rzpRes.data;

//         await new Promise((resolve, reject) => {
//           const options = {
//             key:
//               process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
//               'rzp_test_TF4N39zZPzWuGw',
//             amount,
//             currency: 'INR',
//             name: 'RentNPay',
//             description: 'Order Payment',
//             order_id: razorpayOrderId,
//             handler: async (response) => {
//               try {
//                 await apiVerifyRazorpayPayment({
//                   razorpay_order_id: response.razorpay_order_id,
//                   razorpay_payment_id: response.razorpay_payment_id,
//                   razorpay_signature: response.razorpay_signature,
//                 });
//                 capturedPaymentId = response.razorpay_payment_id || '';
//                 resolve();
//               } catch (e) {
//                 reject(e);
//               }
//             },
//             modal: {
//               ondismiss: () => reject(new Error('Payment cancelled')),
//             },
//             theme: { color: '#F97316' },
//           };
//           const rzp = new window.Razorpay(options);
//           rzp.open();
//         });
//       }
//       // // Payment verified — for pure service bookings we show the Service
//       // // Receipt modal instead of the rental PaymentMain modal, so hold off
//       // // showing PaymentMain until we know which flow this is.
//       // if (pendingServiceBookings.length === 0) {
//       //   setShowSuccessModal(true);
//       // }

//       // const addr = {
//       // Payment verified — show PaymentMain immediately for instant
//       // feedback. It will show a small loading state internally until
//       // `successOrderId` (passed as a prop below) is set with the real,
//       // freshly-created order id — never falling back to localStorage's
//       // possibly-stale previous order id.
//       if (pendingServiceBookings.length === 0) {
//         setSuccessOrderId('');
//         setShowSuccessModal(true);
//       }

//       const addr = {
//         ...selectedAddress,
//         cityKey:
//           selectedAddress.cityKey ||
//           (selectedAddress.city || '').trim().toLowerCase(),
//       };
//       const addressLine = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;

//       const rentalItems = items.filter(
//         (i) => String(i.productType || 'Rental') === 'Rental',
//       );
//       const rentalDuration = Number(rentalItems?.[0]?.rentalMonths || 1);
//       const tenureUnit =
//         rentalItems?.[0]?.tenureUnit === 'day' ? 'day' : 'month';

//       // const orderRes = await apiCreateOrder({
//       //   products: items.map((i) => ({
//       //     product: i.productId,
//       //     variantId: i.variantId || null,
//       //     quantity: Number(i.quantity),
//       //     pricePerDay: Number(i.pricePerDay),
//       //   })),
//       //   rentalDuration,
//       //   tenureUnit,
//       //   address: addressLine,
//       //   phone: addr.phone,
//       //   name: addr.fullName,
//       //   deliveryInstructions,
//       //   couponId: appliedCoupon?.couponId || null,
//       //   discountAmount: appliedCoupon?.discountAmount || 0,
//       //   totalAmount: savedTotal,
//       //   baseRentalCost: total,
//       //   deliveryFee: 0,
//       //   gst: 0,
//       //   refundableDeposit: 0,
//       //   careProtection: 0,
//       //   repairWarranty: 0,
//       //   relocationWarranty: 0,
//       //   deliveryPackaging: 0,
//       //   installationFee: 0,
//       //   platformFee: 0,
//       // });
//       // Compute taxes the same way payment.jsx does
//       const isDailyRentalItem = (i) =>
//         String(i?.productType || 'Rental') === 'Rental' &&
//         String(i?.tenureUnit || 'month') === 'day';
//       const isRentalItem2 = (i) =>
//         String(i?.productType || 'Rental') === 'Rental';
//       const getItemQty2 = (i) =>
//         isDailyRentalItem(i) ? 1 : Number(i.quantity || 1);

//       // const calcTaxField = (
//       //   item,
//       //   itemTotal,
//       //   subKey,
//       //   globalRentalKey,
//       //   globalNewKey,
//       //   globalRefurbKey,
//       // ) => {
//       //   if (item.taxBlocked) return 0;
//       //   let rate = 0;
//       //   if (item[subKey] != null) {
//       //     rate = Number(item[subKey]) / 100;
//       //   } else if (isRentalItem2(item)) {
//       //     rate = (checkoutGlobalTax?.rental?.[globalRentalKey] ?? 0) / 100;
//       //   } else {
//       //     const cond = String(item.condition || '').toLowerCase();
//       //     rate =
//       //       cond === 'refurbished'
//       //         ? (checkoutGlobalTax?.buying_refurbished?.[globalNewKey] ?? 0) /
//       //           100
//       //         : (checkoutGlobalTax?.buying_new?.[globalRefurbKey] ?? 0) / 100;
//       //   }
//       //   return Math.round(itemTotal * rate);
//       // };

//       const calcTaxField = (
//         item,
//         itemTotal,
//         subKey,
//         globalRentalKey,
//         globalNewKey,
//         globalRefurbKey,
//       ) => {
//         if (item.taxBlocked) return 0;
//         let rate = 0;
//         if (item[subKey] != null) {
//           rate = Number(item[subKey]) / 100;
//         } else if (isRentalItem2(item)) {
//           rate = (checkoutGlobalTax?.rental?.[globalRentalKey] ?? 0) / 100;
//         } else {
//           const cond = String(item.condition || '').toLowerCase();
//           if (cond === 'refurbished') {
//             rate =
//               (checkoutGlobalTax?.buying_refurbished?.[globalNewKey] ?? 0) /
//               100;
//           } else if (cond === 'mint condition' || cond === 'mint') {
//             rate =
//               (checkoutGlobalTax?.buying_mint?.[globalRefurbKey] ?? 0) / 100;
//           } else {
//             rate =
//               (checkoutGlobalTax?.buying_new?.[globalRefurbKey] ?? 0) / 100;
//           }
//         }
//         return Math.round(itemTotal * rate);
//       };

//       const checkoutGst = items.reduce((sum, item) => {
//         const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
//         return (
//           sum + calcTaxField(item, itemTotal, 'defaultGst', 'gst', 'gst', 'gst')
//         );
//       }, 0);
//       const checkoutCareProtection = !careProtectionEnabled
//         ? 0
//         : items.reduce((sum, item) => {
//             const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
//             return (
//               sum +
//               calcTaxField(
//                 item,
//                 itemTotal,
//                 'defaultCareTax',
//                 'careTax',
//                 'careTax',
//                 'careTax',
//               )
//             );
//           }, 0);
//       const checkoutRepairWarranty = items.reduce((sum, item) => {
//         const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
//         return (
//           sum +
//           calcTaxField(
//             item,
//             itemTotal,
//             'defaultRepairWarranty',
//             'repairWarranty',
//             'repairWarranty',
//             'repairWarranty',
//           )
//         );
//       }, 0);
//       const checkoutRelocationWarranty = items.reduce((sum, item) => {
//         const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
//         return (
//           sum +
//           calcTaxField(
//             item,
//             itemTotal,
//             'defaultRelocationWarranty',
//             'relocationWarranty',
//             'relocationWarranty',
//             'relocationWarranty',
//           )
//         );
//       }, 0);
//       const checkoutDeliveryPackaging = items.reduce((sum, item) => {
//         const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
//         return (
//           sum +
//           calcTaxField(
//             item,
//             itemTotal,
//             'defaultDeliveryPackaging',
//             'deliveryPackaging',
//             'deliveryPackaging',
//             'deliveryPackaging',
//           )
//         );
//       }, 0);
//       const checkoutInstallationFee = items.reduce((sum, item) => {
//         const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
//         return (
//           sum +
//           calcTaxField(
//             item,
//             itemTotal,
//             'defaultInstallationFee',
//             'installationFee',
//             'installationFee',
//             'installationFee',
//           )
//         );
//       }, 0);
//       const checkoutPlatformFee = items.reduce((sum, item) => {
//         const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
//         return (
//           sum +
//           calcTaxField(
//             item,
//             itemTotal,
//             'defaultPlatformFee',
//             'platformFee',
//             'platformFee',
//             'platformFee',
//           )
//         );
//       }, 0);
//       const checkoutRefundableDeposit = items.reduce((sum, i) => {
//         if (!isRentalItem2(i)) return sum;
//         return sum + Number(i.refundableDeposit || 0) * Number(i.quantity || 0);
//       }, 0);
//       const checkoutBaseCost = items.reduce((sum, i) => {
//         return sum + Number(i.pricePerDay || 0) * getItemQty2(i);
//       }, 0);

//       // const orderRes = await apiCreateOrder({
//       //   products: items.map((i) => ({
//       //     product: i.productId,
//       //     variantId: i.variantId || null,
//       //     quantity: Number(i.quantity),
//       //     pricePerDay: Number(i.pricePerDay),
//       //   })),
//       //   rentalDuration,
//       //   tenureUnit,
//       //   address: addressLine,
//       //   phone: addr.phone,
//       //   name: addr.fullName,
//       //   deliveryInstructions,
//       //   couponId: appliedCoupon?.couponId || null,
//       //   discountAmount: appliedCoupon?.discountAmount || 0,
//       //   totalAmount: savedTotal,
//       //   baseRentalCost: checkoutBaseCost,
//       //   deliveryFee: 0,
//       //   gst: checkoutGst,
//       //   refundableDeposit: checkoutRefundableDeposit,
//       //   careProtection: checkoutCareProtection,
//       //   repairWarranty: checkoutRepairWarranty,
//       //   relocationWarranty: checkoutRelocationWarranty,
//       //   deliveryPackaging: checkoutDeliveryPackaging,
//       //   installationFee: checkoutInstallationFee,
//       //   platformFee: checkoutPlatformFee,
//       //   cityKey: addr.cityKey || (addr.city || '').trim().toLowerCase(),
//       //   orderLocation: getNavbarOrderLocation(),
//       // });

//       // // const createdOrderId = orderRes?.data?._id || '';
//       // // if (createdOrderId) {
//       // //   localStorage.setItem('rentpay_last_order_id', createdOrderId);
//       // // }
//       // const createdOrderId = orderRes?.data?._id || '';
//       // if (createdOrderId) {
//       //   localStorage.setItem('rentpay_last_order_id', createdOrderId);
//       // }
//       // setSuccessOrderId(createdOrderId);

//       let createdOrderId = '';
//       if (items.length > 0) {
//         const orderRes = await apiCreateOrder({
//           products: items.map((i) => ({
//             product: i.productId,
//             variantId: i.variantId || null,
//             quantity: Number(i.quantity),
//             pricePerDay: Number(i.pricePerDay),
//             originalPricePerDay: Number(i.originalPricePerDay ?? i.pricePerDay),
//             offerSource: i.offer?.source || null,
//           })),
//           rentalDuration,
//           tenureUnit,
//           address: addressLine,
//           phone: addr.phone,
//           name: addr.fullName,
//           deliveryInstructions,
//           couponId: appliedCoupon?.couponId || null,
//           discountAmount: appliedCoupon?.discountAmount || 0,
//           totalAmount: savedTotal,
//           baseRentalCost: checkoutBaseCost,
//           deliveryFee: 0,
//           gst: checkoutGst,
//           refundableDeposit: checkoutRefundableDeposit,
//           careProtection: checkoutCareProtection,
//           repairWarranty: checkoutRepairWarranty,
//           relocationWarranty: checkoutRelocationWarranty,
//           deliveryPackaging: checkoutDeliveryPackaging,
//           installationFee: checkoutInstallationFee,
//           platformFee: checkoutPlatformFee,
//           cityKey: addr.cityKey || (addr.city || '').trim().toLowerCase(),
//           orderLocation: getNavbarOrderLocation(),
//           paymentId: capturedPaymentId,
//         });
//         //   createdOrderId = orderRes?.data?._id || '';
//         //   if (createdOrderId) {
//         //     localStorage.setItem('rentpay_last_order_id', createdOrderId);
//         //   }
//         // }
//         // setSuccessOrderId(createdOrderId);
//         createdOrderId = orderRes?.data?._id || '';
//         if (createdOrderId) {
//           localStorage.setItem('rentpay_last_order_id', createdOrderId);
//         }
//         // Reuse the order object we already have from apiCreateOrder —
//         // no need to re-fetch it a second time just to show the popup.
//         setSuccessOrderData(orderRes?.data || null);
//       }
//       setSuccessOrderId(createdOrderId);

//       // Book any pending service bookings from this checkout too.
//       const createdBookings = [];
//       for (const oneBooking of pendingServiceBookings) {
//         const {
//           taxLines,
//           total: bTotal,
//           base,
//         } = computeBookingTotal(oneBooking);
//         try {
//           const bookingRes = await apiCreateBooking({
//             ...oneBooking,
//             paymentMethod: payAfterService ? 'pay_after_service' : 'card',
//             address: addressLine,
//             phone: addr.phone,
//             name: addr.fullName,
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
//             booking: oneBooking,
//             bookingId,
//             bookingData: bookingRes?.data || {},
//             taxLines,
//             base,
//             total: bTotal,
//           });
//           // } catch (svcErr) {
//           //   console.error('Service booking failed', svcErr);
//           //   setError(
//           //     'Rent/Buy order placed, but a service booking could not be confirmed. Please retry it from your cart.',
//           //   );
//           // }
//         } catch (svcErr) {
//           console.error(
//             'Service booking failed',
//             svcErr?.response?.data || svcErr,
//           );
//           setError(
//             svcErr?.response?.data?.message ||
//               'Rent/Buy order placed, but a service booking could not be confirmed. Please retry it from your cart.',
//           );
//         }
//       }

//       // Clear everything
//       dispatch(clearCart());
//       localStorage.removeItem('rentpay_checkout_selectedAddress');
//       localStorage.removeItem('rentpay_checkout_instructions');
//       localStorage.removeItem('rentpay_checkout_billing');
//       localStorage.removeItem('rentpay_pending_service_bookings');
//       localStorage.removeItem('rentpay_care_protection_enabled');

//       // if (createdBookings.length > 0) {
//       //   const combinedBase = createdBookings.reduce((s, c) => s + c.base, 0);
//       //   const combinedTotal = createdBookings.reduce((s, c) => s + c.total, 0);
//       //   const combinedTaxLines = [];
//       //   createdBookings.forEach((c) => {
//       //     c.taxLines.forEach((t) => {
//       //       const existing = combinedTaxLines.find((x) => x.label === t.label);
//       //       if (existing) existing.value += t.value;
//       //       else combinedTaxLines.push({ ...t });
//       //     });
//       //   });
//       //   const first = createdBookings[0];

//       //   setServiceReceiptData({
//       //     jobId:
//       //       first.bookingData.jobId ||
//       //       first.bookingId?.slice(-8)?.toUpperCase() ||
//       //       'SRV-0000',
//       //     serviceName:
//       //       createdBookings.length > 1
//       //         ? `${first.booking.serviceName} + ${createdBookings.length - 1} more`
//       //         : first.booking.serviceName,
//       //     technicianName: first.bookingData.technicianName || '—',
//       //     bookingDate: first.booking.bookingDate,
//       //     timeSlot: first.booking.timeSlot?.label,
//       //     serviceCharge: combinedBase,
//       //     taxLines: combinedTaxLines,
//       //     taxAndFees: combinedTaxLines.reduce((s, t) => s + t.value, 0),
//       //     totalPaid: combinedTotal,
//       //     paymentMethod: 'card',
//       //   });
//       //   setShowReceiptModal(true);
//       // } else {
//       //   setShowSuccessModal(true);
//       // }
//       // return;

//       // if (createdBookings.length > 0 && !payAfterService) {
//       if (createdBookings.length > 0) {
//         // Service booking (with or without "pay after service") — skip the
//         // PaymentMain "Order Placed" popup entirely and go straight to the
//         // orders page. That popup nudges for product-delivery KYC, which
//         // doesn't apply to a pure service booking.
//         if (payAfterService) {
//           router.push('/my-account?tab=orders');
//           return;
//         }
//       }

//       if (createdBookings.length > 0 && !payAfterService) {
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
//           paymentMethod: 'card',
//           name: addr.fullName,
//           phone: addr.phone,
//           address: addressLine,
//         });
//         setShowReceiptModal(true);
//       } else {
//         setShowSuccessModal(true);
//       }
//       return;
//     } catch (err) {
//       if (err.message === 'Payment cancelled') {
//         setError('Payment was cancelled. Please try again.');
//       } else {
//         setError(
//           err.response?.data?.message || 'Payment failed. Please try again.',
//         );
//       }
//     } finally {
//       setPayLoading(false);
//     }
//     // ── End Razorpay ───────────────────────────────────────────────
//   };

//   // if (
//   //   items.length === 0 &&
//   //   pendingServiceBookings.length === 0 &&
//   //   !showSuccessModal
//   // )
//   //   return null;
//   if (!hasMounted) {
//     return null;
//   }
//   if (
//     items.length === 0 &&
//     pendingServiceBookings.length === 0 &&
//     !showSuccessModal &&
//     !showReceiptModal
//   )
//     return null;
//   if (!userId) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
//         <div className="flex justify-center">
//           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#eff2f8] min-h-screen">
//       <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
//         <h1 className="text-3xl font-bold text-black">Checkout</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Review your delivery details and complete your order
//         </p>

//         <div className="mt-6 space-y-4">
//           <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
//             <h2 className="text-lg font-semibold text-black">
//               Select Delivery Address
//             </h2>

//             <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//               {addresses.length === 0 && (
//                 <div className="text-center py-8">
//                   <p className="text-sm text-gray-500 mb-3">
//                     No saved addresses yet.
//                   </p>
//                   <button
//                     type="button"
//                     onClick={openAddModal}
//                     className="px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
//                   >
//                     Add New Address
//                   </button>
//                 </div>
//               )}

//               {addresses.map((addr) => {
//                 const active = addr._id === selectedId;
//                 const addressLine = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;
//                 return (
//                   <div
//                     key={addr._id}
//                     className={`rounded-xl border p-3 cursor-pointer ${
//                       active
//                         ? 'border-orange-400 bg-orange-50/20 ring-1 ring-orange-100'
//                         : 'border-gray-200 bg-white'
//                     }`}
//                     onClick={() => setSelectedId(addr._id)}
//                   >
//                     {/* <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 ${active ? 'bg-[#FFF7ED] border-[#F97316]' : 'bg-white border-gray-300'}`}
//                           >
//                             {active ? (
//                               <span className="w-2 h-2 border-4 border-[#F97316] bg-white rounded-full" />
//                             ) : null}
//                           </span>
//                           <div className="min-w-0 flex items-center gap-2">
//                             <p className="font-bold text-base text-black truncate">
//                               {addr.fullName}
//                             </p>
//                             <span className="inline-flex items-center rounded-md  bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#364153]">
//                               {addr.label || 'Home'}
//                             </span>
//                           </div>
//                         </div>

//                         <p className="text-xs sm:text-sm text-[#64748B] mt-1 flex items-center gap-1  ml-6">
//                           <MapPin className="w-3 h-3" />
//                           {addressLine}
//                         </p>

//                         <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1  ml-6">
//                           <Phone className="w-3 h-3" />
//                           {addr.phone}
//                         </p>
//                       </div>

//                       <div className="flex gap-2 flex-shrink-0">
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             openEditModal(addr);
//                           }}
//                           className="text-xs text-gray-700 hover:text-orange-500"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteAddress(addr._id);
//                           }}
//                           className="text-xs text-red-600 hover:underline"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div> */}
//                     <div className="flex items-start gap-3">
//                       <div className="min-w-0 w-full">
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 ${
//                               active
//                                 ? 'bg-[#FFF7ED] border-2 border-[#F97316]'
//                                 : 'bg-white border-2 border-[#E5E7EB]'
//                             }`}
//                           >
//                             {active ? (
//                               <span className="w-2 h-2 border-4 border-[#F97316] bg-white rounded-full" />
//                             ) : null}
//                           </span>

//                           <div className="min-w-0 flex items-center gap-2">
//                             <p className="font-bold text-base text-black truncate">
//                               {addr.fullName}
//                             </p>
//                             <span className="inline-flex items-center rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#364153]">
//                               {addr.label || 'Home'}
//                             </span>
//                           </div>
//                         </div>

//                         {/* Address */}
//                         <p className="text-xs sm:text-sm text-[#64748B] mt-2 flex items-center gap-1 ml-6">
//                           <MapPin className="w-3 h-3" />
//                           {addressLine}
//                         </p>

//                         {/* Phone */}
//                         <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1 ml-6">
//                           <Phone className="w-3 h-3" />
//                           {addr.phone}
//                         </p>

//                         {/* Buttons (FIXED POSITION BELOW PHONE) */}
//                         <div className="flex gap-3 mt-2 ml-6">
//                           {/* <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               openEditModal(addr);
//                             }}
//                             className="text-xs text-gray-700 hover:text-orange-500"
//                           >
//                             Edit
//                           </button> */}
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               openEditModal(addr);
//                             }}
//                             className="text-xs text-[#155DFC] hover:underline inline-flex items-center gap-1"
//                           >
//                             <Pencil className="w-3 h-3 text-[#155DFC]" />
//                             Edit
//                           </button>

//                           {/* <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleDeleteAddress(addr._id);
//                             }}
//                             className="text-xs text-red-600 hover:underline"
//                           >
//                             Delete
//                           </button> */}
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleDeleteAddress(addr._id);
//                             }}
//                             className="text-xs text-[#E7000B] hover:underline inline-flex items-center gap-1"
//                           >
//                             <Trash2 className="w-3 h-3 text-[#E7000B]" />
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="mt-3">
//               <button
//                 type="button"
//                 onClick={openAddModal}
//                 className="w-full px-4 py-2.5 text-sm rounded-xl bg-[#F9FAFB] border-2 border-[#D1D5DC] hover:bg-gray-50 text-[#64748B]"
//               >
//                 + Add New Address
//               </button>
//             </div>
//           </section>

//           {/* <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Pick-up Store
//             </h2>
//             {pickupLoading ? (
//               <p className="mt-3 text-sm text-gray-500">
//                 Loading pickup details...
//               </p>
//             ) : pickupError ? (
//               <p className="mt-3 text-sm text-red-600">{pickupError}</p>
//             ) : !primaryPickupStore ? (
//               <p className="mt-3 text-sm text-gray-500">
//                 Pickup details unavailable.
//               </p>
//             ) : (
//               <div className="mt-3 space-y-3">
//                 <div className="rounded-xl border border-gray-200 px-3 py-2.5">
//                   <div className="flex items-start gap-3">
//                     <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#DCFCE7]">
//                       <Store className="w-5 h-5 text-[#10B981]" />
//                     </span>

//                     <div>
//                       <p className="text-sm font-bold text-black">
//                         Pick up from Partner Store
//                       </p>

//                       <p className="mt-1 text-xs flex items-center gap-2 text-amber-600">
//                         <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FFFBEB] border border-[#FEE685]">
//                           <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
//                           {primaryPickupStore.rating || 4.9 / 5}
//                         </span>
//                         <span className="text-gray-500">(Store Rating)</span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="rounded-xl border border-[#B9F8CF] bg-[#ECFDF5] px-3 py-3">
//                   <p className="text-xs text-[#64748B]  font-semibold inline-flex items-center gap-1.5">
//                     <MapPin className="w-3.5 h-3.5 text-emerald-600" />
//                     Pickup Location
//                   </p>
//                   <p className="mt-1 ml-5 text-base font-bold text-black">
//                     {primaryPickupStore.mapAddress ||
//                       primaryPickupStore.storeName}
//                   </p>
//                   {pickupDistanceText ? (
//                     <p className="text-xs ml-5 font-bold text-[#10B981] mt-0.5">
//                       {pickupDistanceText}
//                     </p>
//                   ) : null}

//                   <div className="mt-2 ml-5 w-1/2 inline-flex items-center gap-1.5 px-2 py-1.5 text-[11px] border border-[#7BF1A8] bg-white rounded-md">
//                     <ShieldCheck className="w-3.5 h-3.5 text-[#00A63E]" />
//                     <span className="text-[#64748B] font-semibold text-xs">
//                       Exact address shared after payment
//                     </span>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => setMapPreviewOpen(true)}
//                     className="mt-2 ml-5 w-1/2 rounded-lg border border-[#10B981] text-[#10B981] text-sm font-medium py-2 hover:bg-emerald-50 inline-flex items-center justify-center gap-1.5"
//                   >
//                     View on Map
//                     <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </section> */}

//           <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
//             <h2 className="text-lg font-semibold text-black">
//               Billing Address
//             </h2>
//             <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
//               <input
//                 type="checkbox"
//                 checked={billingSameAsDelivery}
//                 onChange={(e) => setBillingSameAsDelivery(e.target.checked)}
//                 className="rounded border-gray-300"
//               />
//               My Billing address is the same as Delivery address
//             </label>
//             <div className="mt-3">
//               <label className="text-xs ml-5 text-gray-500">
//                 Use GSTIN for Business Invoice
//               </label>
//               {/* <input
//                 type="text"
//                 value={billingGstin}
//                 onChange={(e) => setBillingGstin(e.target.value.toUpperCase())}
//                 placeholder="Optional GSTIN"
//                 className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
//               /> */}
//             </div>
//           </section>

//           <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
//             <h3 className="font-semibold text-black">Delivery Instructions</h3>
//             <p className="text-xs text-gray-500 mt-1">
//               Delivery instructions (Optional)
//             </p>
//             <textarea
//               value={deliveryInstructions}
//               onChange={(e) => setDeliveryInstructions(e.target.value)}
//               rows={3}
//               className="mt-3 text-sm w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100"
//               placeholder="e.g., Leave at security gate. Call before arriving"
//             />
//           </section>

//           {error && <p className="text-red-600 text-sm">{error}</p>}

//           <button
//             type="button"
//             onClick={handleProceedClick}
//             disabled={payLoading}
//             className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
//           >
//             {payLoading ? 'Opening Payment…' : 'Proceed for Payment'}
//           </button>
//         </div>
//       </div>
//       {showServicePayChoice ? (
//         <div
//           className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4"
//           onClick={() => setShowServicePayChoice(false)}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <p className="text-lg font-bold text-black">
//               Choose Payment Option
//             </p>
//             <p className="text-sm text-gray-500 mt-1">
//               How would you like to pay for your service?
//             </p>
//             <div className="mt-5 flex flex-col gap-3">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowServicePayChoice(false);
//                   proceedToPayment({ payAfterService: true });
//                 }}
//                 className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold hover:bg-orange-50"
//               >
//                 Pay After Service
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowServicePayChoice(false);
//                   proceedToPayment({ payAfterService: false });
//                 }}
//                 className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
//               >
//                 Pay Now
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//       {mapPreviewOpen && primaryPickupStore ? (
//         <div
//           className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4"
//           onClick={() => setMapPreviewOpen(false)}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="px-4 py-3 border-b flex items-center justify-between">
//               <p className="font-semibold text-black">Store Location Preview</p>
//               <button
//                 type="button"
//                 className="text-gray-500 hover:text-gray-700 text-xl"
//                 onClick={() => setMapPreviewOpen(false)}
//               >
//                 ×
//               </button>
//             </div>
//             <div className="h-[420px] w-full">
//               <iframe
//                 title="Store map preview"
//                 src={
//                   Number.isFinite(Number(primaryPickupStore?.mapLat)) &&
//                   Number.isFinite(Number(primaryPickupStore?.mapLng))
//                     ? `https://www.google.com/maps?q=${encodeURIComponent(
//                         `${primaryPickupStore.mapLat},${primaryPickupStore.mapLng}`,
//                       )}&z=15&output=embed`
//                     : `https://www.google.com/maps?q=${encodeURIComponent(
//                         primaryPickupStore?.mapAddress ||
//                           primaryPickupStore?.storeName ||
//                           '',
//                       )}&z=15&output=embed`
//                 }
//                 className="h-full w-full border-0"
//                 loading="lazy"
//                 referrerPolicy="no-referrer-when-downgrade"
//               />
//             </div>
//           </div>
//         </div>
//       ) : null}
//       {/* {showReceiptModal && serviceReceiptData && (
//         <ServiceReceiptModal
//           data={serviceReceiptData}
//           onClose={() => {
//             setShowReceiptModal(false);
//             setShowSuccessModal(true);
//           }}
//         />
//       )} */}

//       {showReceiptModal && serviceReceiptData && (
//         <ServiceReceiptModal
//           data={serviceReceiptData}
//           onClose={() => {
//             setShowReceiptModal(false);
//             router.push('/my-account?tab=orders');
//           }}
//         />
//       )}

//       {showSuccessModal && (
//         <div className="fixed inset-0 z-[130]">
//           {/* Backdrop layer — kept separate so `filter` here doesn't trap the KYC modal's fixed positioning */}
//           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

//           {/* Content layer — no filter on this or any ancestor */}
//           <div className="relative h-full flex items-start sm:items-center justify-center px-4 py-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//             <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 my-auto max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//               <PaymentMain
//                 orderIdOverride={successOrderId}
//                 orderDataOverride={successOrderData}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {modalOpen && (
//         <div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
//           onClick={() => setModalOpen(false)}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="p-5 border-b flex items-start justify-between gap-4">
//               <div>
//                 <h3 className="text-lg font-semibold text-black">
//                   {modalMode === 'edit' ? 'Edit Address' : 'Add New Address'}
//                 </h3>
//                 <p className="text-xs text-gray-500 mt-1">
//                   This address is saved for your account.
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-600 text-xl leading-none"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-5 space-y-3">
//               <div className="grid grid-cols-2 gap-3">
//                 <label className="text-xs font-medium text-gray-700">
//                   Label <span className="text-red-500">*</span>
//                   <input
//                     type="text"
//                     value={form.label}
//                     onChange={(e) =>
//                       setForm((p) => ({ ...p, label: e.target.value }))
//                     }
//                     className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                   />
//                 </label>
//                 {/* <label className="text-xs font-medium text-gray-700">
//                   Phone
//                   <input
//                     type="tel"
//                     value={form.phone}
//                     onChange={(e) =>
//                       setForm((p) => ({ ...p, phone: e.target.value }))
//                     }
//                     className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                     placeholder="e.g., 9876543210"
//                   />
//                 </label> */}
//                 <label className="text-xs font-medium text-gray-700">
//                   Phone <span className="text-red-500">*</span>
//                   <input
//                     type="tel"
//                     inputMode="numeric"
//                     maxLength={10}
//                     value={form.phone}
//                     onChange={(e) => {
//                       const digitsOnly = e.target.value
//                         .replace(/\D/g, '')
//                         .slice(0, 10);
//                       setForm((p) => ({ ...p, phone: digitsOnly }));
//                     }}
//                     className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                     // placeholder="e.g., 9876543210"
//                   />
//                 </label>
//               </div>

//               <label className="text-xs font-medium text-gray-700 block">
//                 Full name <span className="text-red-500">*</span>
//                 <input
//                   type="text"
//                   value={form.fullName}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, fullName: e.target.value }))
//                   }
//                   className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                 />
//               </label>

//               <label className="text-xs font-medium text-gray-700 block">
//                 Address <span className="text-red-500">*</span>
//                 <input
//                   type="text"
//                   value={form.addressLine}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, addressLine: e.target.value }))
//                   }
//                   className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                   placeholder="House no., street name"
//                 />
//               </label>

//               <div className="grid grid-cols-2 gap-3">
//                 <label className="text-xs font-medium text-gray-700 block">
//                   Area <span className="text-red-500">*</span>
//                   <input
//                     type="text"
//                     value={form.area}
//                     onChange={(e) =>
//                       setForm((p) => ({ ...p, area: e.target.value }))
//                     }
//                     className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                     placeholder="Area / locality"
//                   />
//                 </label>
//                 <label className="text-xs font-medium text-gray-700 block">
//                   Pincode <span className="text-red-500">*</span>
//                   <input
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={6}
//                     value={form.pincode}
//                     onChange={(e) => {
//                       const digitsOnly = e.target.value
//                         .replace(/\D/g, '')
//                         .slice(0, 6);
//                       setForm((p) => ({ ...p, pincode: digitsOnly }));
//                     }}
//                     className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                     placeholder="411057"
//                   />
//                 </label>
//               </div>

//               {/* <label className="text-xs font-medium text-gray-700 block">
//                 City
//                 <input
//                   type="text"
//                   value={form.city}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, city: e.target.value }))
//                   }
//                   className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
//                   placeholder="Pune"
//                 />
//               </label> */}

//               {error && <p className="text-red-600 text-sm">{error}</p>}

//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setModalOpen(false)}
//                   className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSaveAddress}
//                   className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  MapPin,
  Store,
  Star,
  Navigation,
  Phone,
  Pencil,
  Trash2,
  ShieldCheck,
  ArrowBigRight,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { apiCreateRazorpayOrder, apiVerifyRazorpayPayment } from '@/lib/api';
import { apiCreateBooking, apiSendBookingConfirmationEmail } from '@/lib/api';
import ServiceReceiptModal from '@/components/ServiceReceiptModal';
import PaymentMain from '@/components/PaymentSuccessPage/PaymentMain';
import {
  syncCart,
  clearCart,
  clearAppliedCoupon,
} from '../store/slices/cartSlice';
import { apiCreateOrder } from '@/lib/api';
import {
  apiGetMyAddresses,
  apiGetCheckoutPickupStores,
  apiCreateAddress,
  apiUpdateAddress,
  apiDeleteAddress,
} from '@/lib/api';
import {
  useAuthModal,
  AUTH_REDIRECT_SESSION_KEY,
} from '@/contexts/AuthModalContext';

function getUserId(user) {
  return user?.id || user?._id || null;
}

function toRad(v) {
  return (Number(v) * Math.PI) / 180;
}

// function distanceKm(aLat, aLon, bLat, bLon) {
//   const R = 6371;
//   const dLat = toRad(Number(bLat) - Number(aLat));
//   const dLon = toRad(Number(bLon) - Number(aLon));
//   const lat1 = toRad(aLat);
//   const lat2 = toRad(bLat);
//   const s1 = Math.sin(dLat / 2);
//   const s2 = Math.sin(dLon / 2);
//   const x = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
//   const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
//   return R * c;
// }

function distanceKm(aLat, aLon, bLat, bLon) {
  const R = 6371;
  const dLat = toRad(Number(bLat) - Number(aLat));
  const dLon = toRad(Number(bLon) - Number(aLon));
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const x = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function safeParseLocation(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getNavbarOrderLocation() {
  if (typeof window === 'undefined') return null;
  const parsed = safeParseLocation(
    localStorage.getItem('rn_delivery_location'),
  );
  const lat = Number(parsed?.lat);
  const lng = Number(parsed?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: String(parsed?.label || '') };
}

export default function Checkout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { openAuth } = useAuthModal();

  // const { items, appliedCoupon } = useSelector((s) => s.cart);
  // const [pendingServiceBooking, setPendingServiceBooking] = useState(null);

  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem('rentpay_pending_service_booking');
  //     setPendingServiceBooking(raw ? JSON.parse(raw) : null);
  //   } catch {
  //     setPendingServiceBooking(null);
  //   }
  // }, []);

  const { items, appliedCoupon } = useSelector((s) => s.cart);
  const [pendingServiceBookings, setPendingServiceBookings] = useState([]);
  const [isServiceHydrated, setIsServiceHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rentpay_pending_service_bookings');
      const list = raw ? JSON.parse(raw) : [];
      setPendingServiceBookings(Array.isArray(list) ? list : []);
    } catch {
      setPendingServiceBookings([]);
    } finally {
      setIsServiceHydrated(true);
    }
  }, []);
  const { user } = useSelector((s) => s.auth);
  const userId = useMemo(() => getUserId(user), [user]);

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedId) || null,
    [addresses, selectedId],
  );

  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [billingGstin, setBillingGstin] = useState('');
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupError, setPickupError] = useState('');
  const [pickupStores, setPickupStores] = useState([]);
  const [mapPreviewOpen, setMapPreviewOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [successOrderData, setSuccessOrderData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [serviceReceiptData, setServiceReceiptData] = useState(null);
  const [checkoutFocusProductId, setCheckoutFocusProductId] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  const [form, setForm] = useState({
    label: 'Home',
    fullName: user?.fullName || '',
    phone: '',
    area: '',
    addressLine: '',
    city: '',
    cityKey: '',
    pincode: '',
  });

  const total = useMemo(() => {
    const isDailyRental = (i) =>
      String(i?.productType || 'Rental') === 'Rental' &&
      String(i?.tenureUnit || 'month') === 'day';
    const isRental = (i) => String(i?.productType || 'Rental') === 'Rental';

    const baseCost = items.reduce((sum, i) => {
      const qty = isDailyRental(i) ? 1 : Number(i.quantity || 1);
      return sum + Number(i.pricePerDay || 0) * qty;
    }, 0);

    const pendingBookings = (() => {
      try {
        const raw = localStorage.getItem('rentpay_pending_service_bookings');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    })();

    return (
      baseCost +
      (appliedCoupon?.discountAmount ? -appliedCoupon.discountAmount : 0)
    );
  }, [items, appliedCoupon]);

  const locationCoords = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('rn_delivery_location');
      const parsed = raw ? JSON.parse(raw) : null;
      const lat = Number(parsed?.lat);
      const lon = Number(parsed?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      return { lat, lon };
    } catch {
      return null;
    }
  }, [selectedId, addresses.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved =
      sessionStorage.getItem('rentpay_checkout_focus_product_id') || '';
    setCheckoutFocusProductId(saved);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!checkoutFocusProductId) return;
    const existsInCart = items.some(
      (item) =>
        String(item?.productId || '') === String(checkoutFocusProductId),
    );
    if (existsInCart) return;
    sessionStorage.removeItem('rentpay_checkout_focus_product_id');
    setCheckoutFocusProductId('');
  }, [checkoutFocusProductId, items]);

  const primaryPickupStore = useMemo(() => {
    if (!pickupStores.length) return null;
    const primaryProductId = String(
      checkoutFocusProductId ||
        items?.[items.length - 1]?.productId ||
        items?.[0]?.productId ||
        '',
    );
    if (!primaryProductId) return pickupStores[0] || null;
    const matched = pickupStores.find((s) =>
      Array.isArray(s?.products)
        ? s.products.some(
            (p) => String(p?.productId || '') === primaryProductId,
          )
        : false,
    );
    return matched || pickupStores[0] || null;
  }, [pickupStores, items, checkoutFocusProductId]);
  const pickupDistanceText = useMemo(() => {
    if (!primaryPickupStore || !locationCoords) return '';
    const sLat = Number(primaryPickupStore.mapLat);
    const sLng = Number(primaryPickupStore.mapLng);
    if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) return '';
    const d = distanceKm(locationCoords.lat, locationCoords.lon, sLat, sLng);
    if (!Number.isFinite(d)) return '';
    return `${d < 10 ? d.toFixed(1) : Math.round(d)} km away from your location`;
  }, [primaryPickupStore, locationCoords]);

  // useEffect(() => {
  //   if (items.length === 0) {
  //     router.replace('/cart');
  //     return;
  //   }
  // useEffect(() => {
  //   if (items.length === 0 && !pendingServiceBooking) {
  //     router.replace('/cart');
  //     return;
  //   }
  //   if (!userId) {
  //     sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
  //     openAuth('login');
  //     return;
  //   }
  // }, [items.length, router, userId, dispatch, openAuth]);
  // useEffect(() => {
  //   if (!isServiceHydrated) return; // wait until we actually know if a service booking is pending
  //   if (showSuccessModal) return; // don't redirect away once payment succeeded and cart was cleared
  //   if (items.length === 0 && pendingServiceBookings.length === 0) {
  //     router.replace('/cart');
  //     return;
  //   }
  //   if (!userId) {
  //     sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
  //     openAuth('login');
  //     return;
  //   }
  // }, [
  //   items.length,
  //   router,
  //   userId,
  //   dispatch,
  //   openAuth,
  //   isServiceHydrated,
  //   pendingServiceBookings.length,
  //   showSuccessModal,
  // ]);

  useEffect(() => {
    if (!isServiceHydrated) return; // wait until we actually know if a service booking is pending
    if (showSuccessModal || showReceiptModal) return; // don't redirect away once payment succeeded / receipt is showing
    if (items.length === 0 && pendingServiceBookings.length === 0) {
      router.replace('/cart');
      return;
    }
    if (!userId) {
      sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
      openAuth('login');
      return;
    }
  }, [
    items.length,
    router,
    userId,
    dispatch,
    openAuth,
    isServiceHydrated,
    pendingServiceBookings.length,
    showSuccessModal,
    showReceiptModal,
  ]);

  useEffect(() => {
    if (!userId) return;
    dispatch(syncCart());
    apiGetMyAddresses()
      .then((res) => {
        const list = res.data?.addresses || [];
        setAddresses(list);
        if (list.length > 0) setSelectedId((prev) => prev || list[0]._id);
      })
      .catch(() => setAddresses([]));
  }, [userId]);

  useEffect(() => {
    if (!addresses.length) setSelectedId(null);
  }, [addresses]);

  useEffect(() => {
    if (!userId || !items.length) {
      setPickupStores([]);
      setPickupError('');
      setPickupLoading(false);
      return;
    }
    setPickupLoading(true);
    setPickupError('');
    setPickupStores([]);
    const ids = items.map((x) => x.productId).filter(Boolean);
    apiGetCheckoutPickupStores(ids)
      .then((res) => {
        setPickupStores(Array.isArray(res.data?.stores) ? res.data.stores : []);
      })
      .catch((err) => {
        setPickupStores([]);
        setPickupError(
          err.response?.data?.message || 'Could not load pickup store details.',
        );
      })
      .finally(() => setPickupLoading(false));
  }, [userId, items]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setForm({
      label: 'Home',
      fullName: user?.fullName || '',
      phone: '',
      area: '',
      addressLine: '',
      city: '',
      cityKey: '',
      pincode: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setModalMode('edit');
    setEditingId(addr._id);
    setForm({
      label: addr.label || 'Home',
      fullName: addr.fullName || user?.fullName || '',
      phone: addr.phone || '',
      area: addr.area || '',
      addressLine: addr.addressLine || '',
      city: addr.city || '',
      cityKey: addr.cityKey || (addr.city || '').trim().toLowerCase(),
      pincode: addr.pincode || '',
    });
    setError('');
    setModalOpen(true);
  };

  // const handleSaveAddress = () => {
  //   if (
  //     !form.fullName.trim() ||
  //     !form.phone.trim() ||
  //     !form.addressLine.trim()
  //   ) {
  //     setError('Please fill name, phone and address line.');
  //     return;
  //   }
  const handleSaveAddress = () => {
    if (
      !form.label.trim() ||
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.addressLine.trim() ||
      !form.area.trim() ||
      !form.pincode.trim()
    ) {
      setError('Please fill all required fields.');
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    const payload = {
      label: form.label,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      area: form.area.trim(),
      addressLine: form.addressLine.trim(),
      city: form.city.trim(),
      cityKey: form.city.trim().toLowerCase(),
      pincode: form.pincode.trim(),
    };

    setError('');
    if (modalMode === 'edit' && editingId) {
      apiUpdateAddress(editingId, payload)
        .then((res) => {
          const updated = res.data?.address;
          if (!updated) return;
          setAddresses((prev) =>
            prev.map((a) => (a._id === updated._id ? updated : a)),
          );
          setSelectedId(updated._id);
          setModalOpen(false);
        })
        .catch((err) =>
          setError(err.response?.data?.message || 'Could not update address.'),
        );
      return;
    }

    apiCreateAddress(payload)
      .then((res) => {
        const created = res.data?.address;
        if (!created) return;
        setAddresses((prev) => [created, ...prev]);
        setSelectedId(created._id);
        setModalOpen(false);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not save address.'),
      );
  };

  const handleDeleteAddress = (id) => {
    apiDeleteAddress(id)
      .then(() => {
        setAddresses((prev) => prev.filter((a) => a._id !== id));
        if (selectedId === id) setSelectedId(null);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not delete address.'),
      );
  };

  // const proceedToPayment = () => {
  //   const rentalMonthsValues = items
  //     .filter((i) => String(i.productType || 'Rental') === 'Rental')
  //     .map((i) => i.rentalMonths || 1);
  //   const first = rentalMonthsValues[0];
  //   const allSame = rentalMonthsValues.every((v) => v === first);
  //   if (!allSame) {
  //     setError(
  //       'Please keep the same rental duration for all items in your cart.',
  //     );
  //     return;
  //   }
  // const proceedToPayment = () => {
  //   // Daily-rental items use flexible date ranges, so their day counts are
  //   // expected to differ between items — only monthly-tenure items need to
  //   // share the same rental duration.
  //   const monthlyRentalValues = items
  //     .filter(
  //       (i) =>
  //         String(i.productType || 'Rental') === 'Rental' &&
  //         String(i.tenureUnit || 'month') !== 'day',
  //     )
  //     .map((i) => i.rentalMonths || 1);
  //   const firstMonthly = monthlyRentalValues[0];
  //   const allMonthlySame = monthlyRentalValues.every((v) => v === firstMonthly);
  //   if (!allMonthlySame) {
  //     setError(
  //       'Please keep the same rental duration for all monthly-rental items in your cart.',
  //     );
  //     return;
  //   }

  //   if (!selectedAddress) {
  const [showServicePayChoice, setShowServicePayChoice] = useState(false);

  const handleProceedClick = () => {
    if (!selectedAddress) {
      setError('Please select or add a delivery address.');
      return;
    }
    if (pendingServiceBookings.length > 0) {
      setShowServicePayChoice(true);
      return;
    }
    proceedToPayment();
  };

  const proceedToPayment = async (opts = {}) => {
    const payAfterService = Boolean(opts.payAfterService);
    // Each rental item (monthly or daily) can have its own independent
    // tenure/date range, so no cross-item duration matching is required.

    if (!selectedAddress) {
      setError('Please select or add a delivery address.');
      return;
    }

    localStorage.setItem(
      'rentpay_checkout_selectedAddress',
      JSON.stringify({
        ...selectedAddress,
        cityKey:
          selectedAddress.cityKey ||
          (selectedAddress.city || '').trim().toLowerCase(),
      }),
    );
    localStorage.setItem(
      'rentpay_checkout_instructions',
      JSON.stringify(deliveryInstructions),
    );
    localStorage.setItem(
      'rentpay_checkout_billing',
      JSON.stringify({
        billingSameAsDelivery,
        gstin: billingGstin,
      }),
    );

    if (pendingServiceBookings.length > 0) {
      const updatedBookings = pendingServiceBookings.map((b) => ({
        ...b,
        selectedAddress,
      }));
      localStorage.setItem(
        'rentpay_pending_service_bookings',
        JSON.stringify(updatedBookings),
      );
    }

    // ── Razorpay popup ─────────────────────────────────────────────
    setError('');
    setPayLoading(true);
    try {
      const savedTotal = (() => {
        try {
          const raw = localStorage.getItem('rentpay_checkout_total');
          const parsed = Number(raw);
          return parsed > 0 ? parsed : total;
        } catch {
          return total;
        }
      })();

      // Loaded early so we can compute each pending service booking's
      // true payable total, needed to work out how much (if anything)
      // still needs to go through Razorpay for "Pay After Service".
      let checkoutGlobalTax = null;
      try {
        const { apiGetGlobalTax } = await import('@/lib/api');
        const taxRes = await apiGetGlobalTax();
        checkoutGlobalTax = taxRes.data?.data?.config || null;
      } catch (e) {
        console.error('Failed to load global tax for checkout', e);
      }

      const careProtectionEnabled = (() => {
        try {
          const saved = localStorage.getItem('rentpay_care_protection_enabled');
          return saved === null ? true : saved === 'true';
        } catch {
          return true;
        }
      })();

      const computeBookingTotal = (booking) => {
        const bTax = booking?.subCategoryTax || {};
        const isBlocked =
          booking?.taxBlocked === true || bTax?.taxBlocked === true;
        const base = Number(booking?.totalAmount || 0);
        if (isBlocked || !checkoutGlobalTax)
          return { base, taxLines: [], total: base };
        const calc = (subKey, globalKey) => {
          const rate =
            bTax[subKey] != null
              ? Number(bTax[subKey])
              : (checkoutGlobalTax?.services?.[globalKey] ?? 0);
          return Math.round((base * rate) / 100);
        };
        const taxLines = [
          { label: 'GST', value: calc('defaultGst', 'gst') },
          {
            label: 'Care Tax',
            value: careProtectionEnabled
              ? calc('defaultCareTax', 'careTax')
              : 0,
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
          {
            label: 'Platform Fee',
            value: calc('defaultPlatformFee', 'platformFee'),
          },
        ].filter((t) => t.value > 0);
        const total = base + taxLines.reduce((s, t) => s + t.value, 0);
        return { base, taxLines, total };
      };

      const serviceBookingsTotal = pendingServiceBookings.reduce(
        (sum, b) => sum + computeBookingTotal(b).total,
        0,
      );
      const razorAmount = payAfterService
        ? Math.max(0, Math.round(savedTotal - serviceBookingsTotal))
        : savedTotal;

      // let capturedPaymentId = '';
      // if (razorAmount > 0) {
      //   const rzpRes = await apiCreateRazorpayOrder(razorAmount);
      //   const { orderId: razorpayOrderId, amount } = rzpRes.data;

      //   await new Promise((resolve, reject) => {
      //     const options = {
      //       key:
      //         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      //         'rzp_test_TF4N39zZPzWuGw',
      //       amount,
      //       currency: 'INR',
      //       name: 'RentNPay',
      //       description: 'Order Payment',
      //       order_id: razorpayOrderId,
      //       handler: async (response) => {
      //         try {
      //           await apiVerifyRazorpayPayment({
      //             razorpay_order_id: response.razorpay_order_id,
      //             razorpay_payment_id: response.razorpay_payment_id,
      //             razorpay_signature: response.razorpay_signature,
      //           });
      //           capturedPaymentId = response.razorpay_payment_id || '';
      //           resolve();
      //         } catch (e) {
      //           reject(e);
      //         }
      //       },
      //       modal: {
      //         ondismiss: () => reject(new Error('Payment cancelled')),
      //       },
      //       theme: { color: '#F97316' },
      //     };
      //     const rzp = new window.Razorpay(options);
      //     rzp.open();
      //   });
      // }

      // let capturedPaymentId = '';
      // let capturedPaymentMethod = '';
      let capturedPaymentId = '';
      let capturedPaymentMethod = '';
      let capturedPaymentMethodDetail = '';
      if (razorAmount > 0) {
        const rzpRes = await apiCreateRazorpayOrder(razorAmount);
        const { orderId: razorpayOrderId, amount } = rzpRes.data;

        await new Promise((resolve, reject) => {
          const options = {
            key:
              process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
              'rzp_test_TF4N39zZPzWuGw',
            amount,
            currency: 'INR',
            name: 'Rentnpay',
            description: 'Order Payment',
            order_id: razorpayOrderId,
            handler: async (response) => {
              try {
                const verifyRes = await apiVerifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                // capturedPaymentId = response.razorpay_payment_id || '';
                // capturedPaymentMethod = verifyRes?.data?.paymentMethod || '';
                capturedPaymentId = response.razorpay_payment_id || '';
                capturedPaymentMethod = verifyRes?.data?.paymentMethod || '';
                capturedPaymentMethodDetail =
                  verifyRes?.data?.paymentMethodDetail || '';
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
      }
      // // Payment verified — for pure service bookings we show the Service
      // // Receipt modal instead of the rental PaymentMain modal, so hold off
      // // showing PaymentMain until we know which flow this is.
      // if (pendingServiceBookings.length === 0) {
      //   setShowSuccessModal(true);
      // }

      // const addr = {
      // Payment verified — show PaymentMain immediately for instant
      // feedback. It will show a small loading state internally until
      // `successOrderId` (passed as a prop below) is set with the real,
      // freshly-created order id — never falling back to localStorage's
      // possibly-stale previous order id.
      if (pendingServiceBookings.length === 0) {
        setSuccessOrderId('');
        setShowSuccessModal(true);
      }

      const addr = {
        ...selectedAddress,
        cityKey:
          selectedAddress.cityKey ||
          (selectedAddress.city || '').trim().toLowerCase(),
      };
      const addressLine = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;

      const rentalItems = items.filter(
        (i) => String(i.productType || 'Rental') === 'Rental',
      );
      const rentalDuration = Number(rentalItems?.[0]?.rentalMonths || 1);
      const tenureUnit =
        rentalItems?.[0]?.tenureUnit === 'day' ? 'day' : 'month';

      // const orderRes = await apiCreateOrder({
      //   products: items.map((i) => ({
      //     product: i.productId,
      //     variantId: i.variantId || null,
      //     quantity: Number(i.quantity),
      //     pricePerDay: Number(i.pricePerDay),
      //   })),
      //   rentalDuration,
      //   tenureUnit,
      //   address: addressLine,
      //   phone: addr.phone,
      //   name: addr.fullName,
      //   deliveryInstructions,
      //   couponId: appliedCoupon?.couponId || null,
      //   discountAmount: appliedCoupon?.discountAmount || 0,
      //   totalAmount: savedTotal,
      //   baseRentalCost: total,
      //   deliveryFee: 0,
      //   gst: 0,
      //   refundableDeposit: 0,
      //   careProtection: 0,
      //   repairWarranty: 0,
      //   relocationWarranty: 0,
      //   deliveryPackaging: 0,
      //   installationFee: 0,
      //   platformFee: 0,
      // });
      // Compute taxes the same way payment.jsx does
      const isDailyRentalItem = (i) =>
        String(i?.productType || 'Rental') === 'Rental' &&
        String(i?.tenureUnit || 'month') === 'day';
      const isRentalItem2 = (i) =>
        String(i?.productType || 'Rental') === 'Rental';
      const getItemQty2 = (i) =>
        isDailyRentalItem(i) ? 1 : Number(i.quantity || 1);

      // const calcTaxField = (
      //   item,
      //   itemTotal,
      //   subKey,
      //   globalRentalKey,
      //   globalNewKey,
      //   globalRefurbKey,
      // ) => {
      //   if (item.taxBlocked) return 0;
      //   let rate = 0;
      //   if (item[subKey] != null) {
      //     rate = Number(item[subKey]) / 100;
      //   } else if (isRentalItem2(item)) {
      //     rate = (checkoutGlobalTax?.rental?.[globalRentalKey] ?? 0) / 100;
      //   } else {
      //     const cond = String(item.condition || '').toLowerCase();
      //     rate =
      //       cond === 'refurbished'
      //         ? (checkoutGlobalTax?.buying_refurbished?.[globalNewKey] ?? 0) /
      //           100
      //         : (checkoutGlobalTax?.buying_new?.[globalRefurbKey] ?? 0) / 100;
      //   }
      //   return Math.round(itemTotal * rate);
      // };

      // const calcTaxField = (
      //   item,
      //   itemTotal,
      //   subKey,
      //   globalRentalKey,
      //   globalNewKey,
      //   globalRefurbKey,
      // ) => {
      //   if (item.taxBlocked) return 0;
      //   let rate = 0;
      //   if (item[subKey] != null) {
      //     rate = Number(item[subKey]) / 100;
      //   } else if (isRentalItem2(item)) {
      //     rate = (checkoutGlobalTax?.rental?.[globalRentalKey] ?? 0) / 100;
      //   } else {
      //     const cond = String(item.condition || '').toLowerCase();
      //     if (cond === 'refurbished') {
      //       rate =
      //         (checkoutGlobalTax?.buying_refurbished?.[globalNewKey] ?? 0) /
      //         100;
      //     } else if (cond === 'mint condition' || cond === 'mint') {
      //       rate =
      //         (checkoutGlobalTax?.buying_mint?.[globalRefurbKey] ?? 0) / 100;
      //     } else {
      //       rate =
      //         (checkoutGlobalTax?.buying_new?.[globalRefurbKey] ?? 0) / 100;
      //     }
      //   }
      //   return Math.round(itemTotal * rate);
      // };

      const getTaxRateOnly = (
        item,
        subKey,
        globalRentalKey,
        globalNewKey,
        globalRefurbKey,
      ) => {
        if (item.taxBlocked) return 0;
        let rate = 0;
        if (item[subKey] != null) {
          rate = Number(item[subKey]) / 100;
        } else if (isRentalItem2(item)) {
          rate = (checkoutGlobalTax?.rental?.[globalRentalKey] ?? 0) / 100;
        } else {
          const cond = String(item.condition || '').toLowerCase();
          if (cond === 'refurbished') {
            rate =
              (checkoutGlobalTax?.buying_refurbished?.[globalNewKey] ?? 0) /
              100;
          } else if (cond === 'mint condition' || cond === 'mint') {
            rate =
              (checkoutGlobalTax?.buying_mint?.[globalRefurbKey] ?? 0) / 100;
          } else {
            rate =
              (checkoutGlobalTax?.buying_new?.[globalRefurbKey] ?? 0) / 100;
          }
        }
        return rate;
      };

      const calcTaxField = (
        item,
        itemTotal,
        subKey,
        globalRentalKey,
        globalNewKey,
        globalRefurbKey,
      ) => {
        const rate = getTaxRateOnly(
          item,
          subKey,
          globalRentalKey,
          globalNewKey,
          globalRefurbKey,
        );
        return Math.round(itemTotal * rate);
      };
      const checkoutGst = items.reduce((sum, item) => {
        const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
        return (
          sum + calcTaxField(item, itemTotal, 'defaultGst', 'gst', 'gst', 'gst')
        );
      }, 0);
      const checkoutCareProtection = !careProtectionEnabled
        ? 0
        : items.reduce((sum, item) => {
            const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
            return (
              sum +
              calcTaxField(
                item,
                itemTotal,
                'defaultCareTax',
                'careTax',
                'careTax',
                'careTax',
              )
            );
          }, 0);
      const checkoutRepairWarranty = items.reduce((sum, item) => {
        const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
        return (
          sum +
          calcTaxField(
            item,
            itemTotal,
            'defaultRepairWarranty',
            'repairWarranty',
            'repairWarranty',
            'repairWarranty',
          )
        );
      }, 0);
      const checkoutRelocationWarranty = items.reduce((sum, item) => {
        const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
        return (
          sum +
          calcTaxField(
            item,
            itemTotal,
            'defaultRelocationWarranty',
            'relocationWarranty',
            'relocationWarranty',
            'relocationWarranty',
          )
        );
      }, 0);
      const checkoutDeliveryPackaging = items.reduce((sum, item) => {
        const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
        return (
          sum +
          calcTaxField(
            item,
            itemTotal,
            'defaultDeliveryPackaging',
            'deliveryPackaging',
            'deliveryPackaging',
            'deliveryPackaging',
          )
        );
      }, 0);
      const checkoutInstallationFee = items.reduce((sum, item) => {
        const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
        return (
          sum +
          calcTaxField(
            item,
            itemTotal,
            'defaultInstallationFee',
            'installationFee',
            'installationFee',
            'installationFee',
          )
        );
      }, 0);
      const checkoutPlatformFee = items.reduce((sum, item) => {
        const itemTotal = Number(item.pricePerDay || 0) * getItemQty2(item);
        return (
          sum +
          calcTaxField(
            item,
            itemTotal,
            'defaultPlatformFee',
            'platformFee',
            'platformFee',
            'platformFee',
          )
        );
      }, 0);
      const checkoutRefundableDeposit = items.reduce((sum, i) => {
        if (!isRentalItem2(i)) return sum;
        return sum + Number(i.refundableDeposit || 0) * Number(i.quantity || 0);
      }, 0);
      const checkoutBaseCost = items.reduce((sum, i) => {
        return sum + Number(i.pricePerDay || 0) * getItemQty2(i);
      }, 0);

      // const orderRes = await apiCreateOrder({
      //   products: items.map((i) => ({
      //     product: i.productId,
      //     variantId: i.variantId || null,
      //     quantity: Number(i.quantity),
      //     pricePerDay: Number(i.pricePerDay),
      //   })),
      //   rentalDuration,
      //   tenureUnit,
      //   address: addressLine,
      //   phone: addr.phone,
      //   name: addr.fullName,
      //   deliveryInstructions,
      //   couponId: appliedCoupon?.couponId || null,
      //   discountAmount: appliedCoupon?.discountAmount || 0,
      //   totalAmount: savedTotal,
      //   baseRentalCost: checkoutBaseCost,
      //   deliveryFee: 0,
      //   gst: checkoutGst,
      //   refundableDeposit: checkoutRefundableDeposit,
      //   careProtection: checkoutCareProtection,
      //   repairWarranty: checkoutRepairWarranty,
      //   relocationWarranty: checkoutRelocationWarranty,
      //   deliveryPackaging: checkoutDeliveryPackaging,
      //   installationFee: checkoutInstallationFee,
      //   platformFee: checkoutPlatformFee,
      //   cityKey: addr.cityKey || (addr.city || '').trim().toLowerCase(),
      //   orderLocation: getNavbarOrderLocation(),
      // });

      // // const createdOrderId = orderRes?.data?._id || '';
      // // if (createdOrderId) {
      // //   localStorage.setItem('rentpay_last_order_id', createdOrderId);
      // // }
      // const createdOrderId = orderRes?.data?._id || '';
      // if (createdOrderId) {
      //   localStorage.setItem('rentpay_last_order_id', createdOrderId);
      // }
      // setSuccessOrderId(createdOrderId);

      let createdOrderId = '';
      if (items.length > 0) {
        // const orderRes = await apiCreateOrder({
        //   products: items.map((i) => ({
        //     product: i.productId,
        //     variantId: i.variantId || null,
        //     quantity: Number(i.quantity),
        //     pricePerDay: Number(i.pricePerDay),
        //     originalPricePerDay: Number(i.originalPricePerDay ?? i.pricePerDay),
        //     offerSource: i.offer?.source || null,
        //   })),
        const orderRes = await apiCreateOrder({
          products: items.map((i) => ({
            product: i.productId,
            variantId: i.variantId || null,
            quantity: Number(i.quantity),
            pricePerDay: Number(i.pricePerDay),
            originalPricePerDay: Number(i.originalPricePerDay ?? i.pricePerDay),
            offerSource: i.offer?.source || null,
            // Real GST/Care Tax % actually applied to THIS line at
            // checkout (not a flat order-level guess) — needed so later
            // tenure extensions can bill tax on the new segment at the
            // exact same rate this line was originally sold at.
            gstRatePercent: Math.round(
              getTaxRateOnly(i, 'defaultGst', 'gst', 'gst', 'gst') * 100,
            ),
            careTaxRatePercent: !careProtectionEnabled
              ? 0
              : Math.round(
                  getTaxRateOnly(
                    i,
                    'defaultCareTax',
                    'careTax',
                    'careTax',
                    'careTax',
                  ) * 100,
                ),
          })),
          rentalDuration,
          tenureUnit,
          address: addressLine,
          phone: addr.phone,
          name: addr.fullName,
          deliveryInstructions,
          couponId: appliedCoupon?.couponId || null,
          discountAmount: appliedCoupon?.discountAmount || 0,
          totalAmount: savedTotal,
          baseRentalCost: checkoutBaseCost,
          deliveryFee: 0,
          gst: checkoutGst,
          refundableDeposit: checkoutRefundableDeposit,
          careProtection: checkoutCareProtection,
          repairWarranty: checkoutRepairWarranty,
          relocationWarranty: checkoutRelocationWarranty,
          deliveryPackaging: checkoutDeliveryPackaging,
          installationFee: checkoutInstallationFee,
          platformFee: checkoutPlatformFee,
          //   cityKey: addr.cityKey || (addr.city || '').trim().toLowerCase(),
          //   orderLocation: getNavbarOrderLocation(),
          //   paymentId: capturedPaymentId,
          // });
          cityKey: addr.cityKey || (addr.city || '').trim().toLowerCase(),
          orderLocation: getNavbarOrderLocation(),
          paymentId: capturedPaymentId,
          paymentMethod: capturedPaymentMethod,
          paymentMethodDetail: capturedPaymentMethodDetail,
        });
        //   createdOrderId = orderRes?.data?._id || '';
        //   if (createdOrderId) {
        //     localStorage.setItem('rentpay_last_order_id', createdOrderId);
        //   }
        // }
        // setSuccessOrderId(createdOrderId);
        createdOrderId = orderRes?.data?._id || '';
        if (createdOrderId) {
          localStorage.setItem('rentpay_last_order_id', createdOrderId);
        }
        // Reuse the order object we already have from apiCreateOrder —
        // no need to re-fetch it a second time just to show the popup.
        setSuccessOrderData(orderRes?.data || null);
      }
      setSuccessOrderId(createdOrderId);

      // Book any pending service bookings from this checkout too.
      const createdBookings = [];
      for (const oneBooking of pendingServiceBookings) {
        const {
          taxLines,
          total: bTotal,
          base,
        } = computeBookingTotal(oneBooking);
        try {
          const bookingRes = await apiCreateBooking({
            ...oneBooking,
            paymentMethod: payAfterService ? 'pay_after_service' : 'card',
            address: addressLine,
            phone: addr.phone,
            name: addr.fullName,
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
            booking: oneBooking,
            bookingId,
            bookingData: bookingRes?.data || {},
            taxLines,
            base,
            total: bTotal,
          });
          // } catch (svcErr) {
          //   console.error('Service booking failed', svcErr);
          //   setError(
          //     'Rent/Buy order placed, but a service booking could not be confirmed. Please retry it from your cart.',
          //   );
          // }
        } catch (svcErr) {
          console.error(
            'Service booking failed',
            svcErr?.response?.data || svcErr,
          );
          setError(
            svcErr?.response?.data?.message ||
              'Rent/Buy order placed, but a service booking could not be confirmed. Please retry it from your cart.',
          );
        }
      }

      // Clear everything
      dispatch(clearCart());
      localStorage.removeItem('rentpay_checkout_selectedAddress');
      localStorage.removeItem('rentpay_checkout_instructions');
      localStorage.removeItem('rentpay_checkout_billing');
      localStorage.removeItem('rentpay_pending_service_bookings');
      localStorage.removeItem('rentpay_care_protection_enabled');

      // if (createdBookings.length > 0) {
      //   const combinedBase = createdBookings.reduce((s, c) => s + c.base, 0);
      //   const combinedTotal = createdBookings.reduce((s, c) => s + c.total, 0);
      //   const combinedTaxLines = [];
      //   createdBookings.forEach((c) => {
      //     c.taxLines.forEach((t) => {
      //       const existing = combinedTaxLines.find((x) => x.label === t.label);
      //       if (existing) existing.value += t.value;
      //       else combinedTaxLines.push({ ...t });
      //     });
      //   });
      //   const first = createdBookings[0];

      //   setServiceReceiptData({
      //     jobId:
      //       first.bookingData.jobId ||
      //       first.bookingId?.slice(-8)?.toUpperCase() ||
      //       'SRV-0000',
      //     serviceName:
      //       createdBookings.length > 1
      //         ? `${first.booking.serviceName} + ${createdBookings.length - 1} more`
      //         : first.booking.serviceName,
      //     technicianName: first.bookingData.technicianName || '—',
      //     bookingDate: first.booking.bookingDate,
      //     timeSlot: first.booking.timeSlot?.label,
      //     serviceCharge: combinedBase,
      //     taxLines: combinedTaxLines,
      //     taxAndFees: combinedTaxLines.reduce((s, t) => s + t.value, 0),
      //     totalPaid: combinedTotal,
      //     paymentMethod: 'card',
      //   });
      //   setShowReceiptModal(true);
      // } else {
      //   setShowSuccessModal(true);
      // }
      // return;

      // if (createdBookings.length > 0 && !payAfterService) {
      if (createdBookings.length > 0) {
        // Service booking (with or without "pay after service") — skip the
        // PaymentMain "Order Placed" popup entirely and go straight to the
        // orders page. That popup nudges for product-delivery KYC, which
        // doesn't apply to a pure service booking.
        if (payAfterService) {
          router.push('/my-account?tab=orders');
          return;
        }
      }

      if (createdBookings.length > 0 && !payAfterService) {
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
          paymentMethod: 'card',
          name: addr.fullName,
          phone: addr.phone,
          address: addressLine,
        });
        setShowReceiptModal(true);
      } else {
        setShowSuccessModal(true);
      }
      return;
    } catch (err) {
      if (err.message === 'Payment cancelled') {
        setError('Payment was cancelled. Please try again.');
      } else {
        setError(
          err.response?.data?.message || 'Payment failed. Please try again.',
        );
      }
    } finally {
      setPayLoading(false);
    }
    // ── End Razorpay ───────────────────────────────────────────────
  };

  // if (
  //   items.length === 0 &&
  //   pendingServiceBookings.length === 0 &&
  //   !showSuccessModal
  // )
  //   return null;
  if (!hasMounted) {
    return null;
  }
  if (
    items.length === 0 &&
    pendingServiceBookings.length === 0 &&
    !showSuccessModal &&
    !showReceiptModal
  )
    return null;
  if (!userId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#eff2f8] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-black">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your delivery details and complete your order
        </p>

        <div className="mt-6 space-y-4">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-black">
              Select Delivery Address
            </h2>

            <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {addresses.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-3">
                    No saved addresses yet.
                  </p>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
                  >
                    Add New Address
                  </button>
                </div>
              )}

              {addresses.map((addr) => {
                const active = addr._id === selectedId;
                const addressLine = `${addr.addressLine}${addr.area ? `, ${addr.area}` : ''}${addr.city ? `, ${addr.city}` : ''}${addr.pincode ? ` - ${addr.pincode}` : ''}`;
                return (
                  <div
                    key={addr._id}
                    className={`rounded-xl border p-3 cursor-pointer ${
                      active
                        ? 'border-orange-400 bg-orange-50/20 ring-1 ring-orange-100'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => setSelectedId(addr._id)}
                  >
                    {/* <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 ${active ? 'bg-[#FFF7ED] border-[#F97316]' : 'bg-white border-gray-300'}`}
                          >
                            {active ? (
                              <span className="w-2 h-2 border-4 border-[#F97316] bg-white rounded-full" />
                            ) : null}
                          </span>
                          <div className="min-w-0 flex items-center gap-2">
                            <p className="font-bold text-base text-black truncate">
                              {addr.fullName}
                            </p>
                            <span className="inline-flex items-center rounded-md  bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#364153]">
                              {addr.label || 'Home'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#64748B] mt-1 flex items-center gap-1  ml-6">
                          <MapPin className="w-3 h-3" />
                          {addressLine}
                        </p>

                        <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1  ml-6">
                          <Phone className="w-3 h-3" />
                          {addr.phone}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(addr);
                          }}
                          className="text-xs text-gray-700 hover:text-orange-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(addr._id);
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div> */}
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                              active
                                ? 'bg-[#FFF7ED] border-2 border-[#F97316]'
                                : 'bg-white border-2 border-[#E5E7EB]'
                            }`}
                          >
                            {active ? (
                              <span className="w-2 h-2 border-4 border-[#F97316] bg-white rounded-full" />
                            ) : null}
                          </span>

                          <div className="min-w-0 flex items-center gap-2">
                            <p className="font-bold text-base text-black truncate">
                              {addr.fullName}
                            </p>
                            <span className="inline-flex items-center rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#364153]">
                              {addr.label || 'Home'}
                            </span>
                          </div>
                        </div>

                        {/* Address */}
                        <p className="text-xs sm:text-sm text-[#64748B] mt-2 flex items-center gap-1 ml-6">
                          <MapPin className="w-3 h-3" />
                          {addressLine}
                        </p>

                        {/* Phone */}
                        <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1 ml-6">
                          <Phone className="w-3 h-3" />
                          {addr.phone}
                        </p>

                        {/* Buttons (FIXED POSITION BELOW PHONE) */}
                        <div className="flex gap-3 mt-2 ml-6">
                          {/* <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(addr);
                            }}
                            className="text-xs text-gray-700 hover:text-orange-500"
                          >
                            Edit
                          </button> */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(addr);
                            }}
                            className="text-xs text-[#155DFC] hover:underline inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3 text-[#155DFC]" />
                            Edit
                          </button>

                          {/* <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr._id);
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button> */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr._id);
                            }}
                            className="text-xs text-[#E7000B] hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3 text-[#E7000B]" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={openAddModal}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-[#F9FAFB] border-2 border-[#D1D5DC] hover:bg-gray-50 text-[#64748B]"
              >
                + Add New Address
              </button>
            </div>
          </section>

          {/* <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Pick-up Store
            </h2>
            {pickupLoading ? (
              <p className="mt-3 text-sm text-gray-500">
                Loading pickup details...
              </p>
            ) : pickupError ? (
              <p className="mt-3 text-sm text-red-600">{pickupError}</p>
            ) : !primaryPickupStore ? (
              <p className="mt-3 text-sm text-gray-500">
                Pickup details unavailable.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-gray-200 px-3 py-2.5">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#DCFCE7]">
                      <Store className="w-5 h-5 text-[#10B981]" />
                    </span>

                    <div>
                      <p className="text-sm font-bold text-black">
                        Pick up from Partner Store
                      </p>

                      <p className="mt-1 text-xs flex items-center gap-2 text-amber-600">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FFFBEB] border border-[#FEE685]">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          {primaryPickupStore.rating || 4.9 / 5}
                        </span>
                        <span className="text-gray-500">(Store Rating)</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#B9F8CF] bg-[#ECFDF5] px-3 py-3">
                  <p className="text-xs text-[#64748B]  font-semibold inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Pickup Location
                  </p>
                  <p className="mt-1 ml-5 text-base font-bold text-black">
                    {primaryPickupStore.mapAddress ||
                      primaryPickupStore.storeName}
                  </p>
                  {pickupDistanceText ? (
                    <p className="text-xs ml-5 font-bold text-[#10B981] mt-0.5">
                      {pickupDistanceText}
                    </p>
                  ) : null}

                  <div className="mt-2 ml-5 w-1/2 inline-flex items-center gap-1.5 px-2 py-1.5 text-[11px] border border-[#7BF1A8] bg-white rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00A63E]" />
                    <span className="text-[#64748B] font-semibold text-xs">
                      Exact address shared after payment
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMapPreviewOpen(true)}
                    className="mt-2 ml-5 w-1/2 rounded-lg border border-[#10B981] text-[#10B981] text-sm font-medium py-2 hover:bg-emerald-50 inline-flex items-center justify-center gap-1.5"
                  >
                    View on Map
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section> */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-black">
              Billing Address
            </h2>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={billingSameAsDelivery}
                onChange={(e) => setBillingSameAsDelivery(e.target.checked)}
                className="rounded border-gray-300"
              />
              My Billing address is the same as Delivery address
            </label>
            <div className="mt-3">
              <label className="text-xs ml-5 text-gray-500">
                Use GSTIN for Business Invoice
              </label>
              {/* <input
                type="text"
                value={billingGstin}
                onChange={(e) => setBillingGstin(e.target.value.toUpperCase())}
                placeholder="Optional GSTIN"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
              /> */}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <h3 className="font-semibold text-black">Delivery Instructions</h3>
            <p className="text-xs text-gray-500 mt-1">
              Delivery instructions (Optional)
            </p>
            <textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={3}
              className="mt-3 text-sm w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="e.g., Leave at security gate. Call before arriving"
            />
          </section>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleProceedClick}
            disabled={payLoading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {payLoading ? 'Opening Payment…' : 'Proceed for Payment'}
          </button>
        </div>
      </div>
      {showServicePayChoice ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowServicePayChoice(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-black">
              Choose Payment Option
            </p>
            <p className="text-sm text-gray-500 mt-1">
              How would you like to pay for your service?
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowServicePayChoice(false);
                  proceedToPayment({ payAfterService: true });
                }}
                className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-600 font-semibold hover:bg-orange-50"
              >
                Pay After Service
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowServicePayChoice(false);
                  proceedToPayment({ payAfterService: false });
                }}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {mapPreviewOpen && primaryPickupStore ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setMapPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <p className="font-semibold text-black">Store Location Preview</p>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setMapPreviewOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="h-[420px] w-full">
              <iframe
                title="Store map preview"
                src={
                  Number.isFinite(Number(primaryPickupStore?.mapLat)) &&
                  Number.isFinite(Number(primaryPickupStore?.mapLng))
                    ? `https://www.google.com/maps?q=${encodeURIComponent(
                        `${primaryPickupStore.mapLat},${primaryPickupStore.mapLng}`,
                      )}&z=15&output=embed`
                    : `https://www.google.com/maps?q=${encodeURIComponent(
                        primaryPickupStore?.mapAddress ||
                          primaryPickupStore?.storeName ||
                          '',
                      )}&z=15&output=embed`
                }
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      ) : null}
      {/* {showReceiptModal && serviceReceiptData && (
        <ServiceReceiptModal
          data={serviceReceiptData}
          onClose={() => {
            setShowReceiptModal(false);
            setShowSuccessModal(true);
          }}
        />
      )} */}

      {showReceiptModal && serviceReceiptData && (
        <ServiceReceiptModal
          data={serviceReceiptData}
          onClose={() => {
            setShowReceiptModal(false);
            router.push('/my-account?tab=orders');
          }}
        />
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[130]">
          {/* Backdrop layer — kept separate so `filter` here doesn't trap the KYC modal's fixed positioning */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          {/* Content layer — no filter on this or any ancestor */}
          <div className="relative h-full flex items-start sm:items-center justify-center px-4 py-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 my-auto max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <PaymentMain
                orderIdOverride={successOrderId}
                orderDataOverride={successOrderData}
              />
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-black">
                  {modalMode === 'edit' ? 'Edit Address' : 'Add New Address'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  This address is saved for your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-gray-700">
                  Label <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, label: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>
                {/* <label className="text-xs font-medium text-gray-700">
                  Phone
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="e.g., 9876543210"
                  />
                </label> */}
                <label className="text-xs font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);
                      setForm((p) => ({ ...p, phone: digitsOnly }));
                    }}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                    // placeholder="e.g., 9876543210"
                  />
                </label>
              </div>

              <label className="text-xs font-medium text-gray-700 block">
                Full name <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fullName: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="text-xs font-medium text-gray-700 block">
                Address <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={form.addressLine}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, addressLine: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="House no., street name"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-gray-700 block">
                  Area <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, area: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="Area / locality"
                  />
                </label>
                <label className="text-xs font-medium text-gray-700 block">
                  Pincode <span className="text-red-500">*</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => {
                      const digitsOnly = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6);
                      setForm((p) => ({ ...p, pincode: digitsOnly }));
                    }}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="411057"
                  />
                </label>
              </div>

              {/* <label className="text-xs font-medium text-gray-700 block">
                City
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Pune"
                />
              </label> */}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
