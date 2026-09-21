// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import {
//   ChevronLeft,
//   ChevronRight,
//   Info,
//   Shield,
//   ShieldCheck,
//   ShoppingCart,
//   Truck,
//   Heart,
//   Calendar,
// } from 'lucide-react';
// import { addToCart } from '@/store/slices/cartSlice';
// import {
//   useAuthModal,
//   AUTH_REDIRECT_SESSION_KEY,
// } from '@/contexts/AuthModalContext';
// import {
//   apiGetProductById,
//   apiGetMyWishlist,
//   apiToggleWishlist,
// } from '@/lib/api';
// import { useToast } from '@/contexts/ToastContext';

// // ─── Static fallback data (shown when API field is missing) ──────────────────
// const FALLBACK_IMAGES = [
//   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
//   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
//   'https://images.unsplash.com/photo-1616628182509-6c6c4c4f8d2d',
//   'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
// ];

// const STATIC_PLANS = [
//   {
//     id: 'm-3',
//     tenureLabel: '3 Months',
//     rentalMonths: 3,
//     rawDays: 0,
//     periodUnit: 'month',
//     price: 799,
//     displayPrice: Math.round(799 / 3),
//     label: '',
//     priceSuffix: '/month',
//   },
//   {
//     id: 'm-6',
//     tenureLabel: '6 Months',
//     rentalMonths: 6,
//     rawDays: 0,
//     periodUnit: 'month',
//     price: 699,
//     displayPrice: Math.round(699 / 6),
//     label: '',
//     priceSuffix: '/month',
//   },
//   {
//     id: 'm-12',
//     tenureLabel: '9 Months',
//     rentalMonths: 9,
//     rawDays: 0,
//     periodUnit: 'month',
//     price: 499,
//     displayPrice: Math.round(499 / 9),
//     label: '',
//     priceSuffix: '/month',
//   },
// ];

// // ─── Parse price string like "1599/month" or "20000" → number ───────────────
// function parsePrice(raw) {
//   if (!raw) return null;
//   const num = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
//   return isNaN(num) ? null : num;
// }

// function tierRentAmount(cfg) {
//   const cr = Number(cfg?.customerRent);
//   if (Number.isFinite(cr) && cr > 0) return cr;
//   const pd = Number(cfg?.pricePerDay);
//   if (Number.isFinite(pd) && pd > 0) return pd;
//   return 0;
// }

// // ─── Build 3 rental plans from a base price (fallback) ─────────────────────
// function buildPlans(basePrice) {
//   const p3 = Math.round(basePrice * 1.15);
//   const p6 = basePrice;
//   const p12 = Math.round(basePrice * 0.75);
//   return [
//     {
//       id: 'm-3',
//       tenureLabel: '3 Months',
//       rentalMonths: 3,
//       rawDays: 0,
//       periodUnit: 'month',
//       price: p3,
//       displayPrice: Math.round(p3 / 3),
//       label: '',
//       priceSuffix: '/month',
//     },
//     {
//       id: 'm-6',
//       tenureLabel: '6 Months',
//       rentalMonths: 6,
//       rawDays: 0,
//       periodUnit: 'month',
//       price: p6,
//       displayPrice: Math.round(p6 / 6),
//       label: '',
//       priceSuffix: '/month',
//     },
//     {
//       id: 'm-12',
//       tenureLabel: '12 Months',
//       rentalMonths: 12,
//       rawDays: 0,
//       periodUnit: 'month',
//       price: p12,
//       displayPrice: Math.round(p12 / 12),
//       label: '',
//       priceSuffix: '/month',
//     },
//   ];
// }

// /** Maps vendor `rentalConfigurations` (customerRent + months/days) → UI plans.
//  * Prefers the selected variant's own rentalConfigurations (custom/manual
//  * per-variant rent listings); falls back to the product-level array for
//  * template-based / legacy single-price rent listings. */
// function normalizeRentalPlansFromProduct(product, variant) {
//   const variantArr = Array.isArray(variant?.rentalConfigurations)
//     ? variant.rentalConfigurations
//     : [];
//   const arr = variantArr.length
//     ? variantArr
//     : Array.isArray(product?.rentalConfigurations)
//       ? product.rentalConfigurations
//       : [];
//   const out = [];
//   arr.forEach((cfg, idx) => {
//     const periodUnit = cfg?.periodUnit === 'day' ? 'day' : 'month';
//     const months = Number(cfg?.months) || 0;
//     const days = Number(cfg?.days) || 0;
//     // const price = tierRentAmount(cfg);
//     // if (!Number.isFinite(price) || price <= 0) return;

//     // const id =
//     //   periodUnit === 'day' && days > 0
//     //     ? `d-${days}-${idx}`
//     //     : months > 0
//     //       ? `m-${months}-${idx}`
//     //       : `tier-${idx}`;

//     // const tenureLabel =
//     //   periodUnit === 'day' && days > 0
//     //     ? `${days} Days`
//     //     : months > 0
//     //       ? `${months} Months`
//     //       : `Option ${idx + 1}`;

//     // const perUnitPrice =
//     //   periodUnit === 'day' && days > 0
//     //     ? Math.round(price / days)
//     //     : months > 0
//     //       ? Math.round(price / months)
//     //       : price;

//     // out.push({
//     //   id,
//     //   tenureLabel,
//     //   rentalMonths: months > 0 ? months : Math.max(1, Math.ceil(days / 30)),
//     //   rawDays: days,
//     //   periodUnit,
//     //   price, // total tenure price (used for cart/checkout)
//     //   displayPrice: perUnitPrice, // per month / per day (shown in UI)
//     //   label: String(cfg?.label || '').trim(),
//     //   priceSuffix: periodUnit === 'day' && days > 0 ? '/day' : '/month',
//     // });

//     const rate = tierRentAmount(cfg);
//     if (!Number.isFinite(rate) || rate <= 0) return;

//     const id =
//       periodUnit === 'day' && days > 0
//         ? `d-${days}-${idx}`
//         : months > 0
//           ? `m-${months}-${idx}`
//           : `tier-${idx}`;

//     const tenureLabel =
//       periodUnit === 'day' && days > 0
//         ? `${days} Days`
//         : months > 0
//           ? `${months} Months`
//           : `Option ${idx + 1}`;

//     // customerRent / pricePerDay is stored as the PER-UNIT rate (per month or
//     // per day), not the total tenure price — so multiply to get the total.
//     const totalPrice =
//       periodUnit === 'day' && days > 0
//         ? Math.round(rate * days)
//         : months > 0
//           ? Math.round(rate * months)
//           : rate;

//     out.push({
//       id,
//       tenureLabel,
//       rentalMonths: months > 0 ? months : Math.max(1, Math.ceil(days / 30)),
//       rawDays: days,
//       periodUnit,
//       price: totalPrice, // total tenure price (used for cart/checkout)
//       displayPrice: rate, // per month / per day (shown in UI)
//       label: String(cfg?.label || '').trim(),
//       priceSuffix: periodUnit === 'day' && days > 0 ? '/day' : '/month',
//     });
//   });
//   return out;
// }

// // ─── Calendar helpers (daily rental date picker) ─────────────────────────────
// const ORANGE = '#FF7000';

// function localTodayIso() {
//   const t = new Date();
//   const y = t.getFullYear();
//   const m = String(t.getMonth() + 1).padStart(2, '0');
//   const d = String(t.getDate()).padStart(2, '0');
//   return `${y}-${m}-${d}`;
// }

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

// // ────────────────────────────────────────────────────────────────────────────
// const RentPrdctMain = ({
//   product,
//   offer,
//   selectedVariantIdx,
//   setSelectedVariantIdx,
// }) => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { openAuth } = useAuthModal();
//   const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
//   const [wishedIds, setWishedIds] = useState([]);
//   const [togglingId, setTogglingId] = useState('');
//   const { items } = useSelector((s) => s.cart);
//   // const { items } = useSelector((s) => s.cart || { items: [] });
//   const { pushToast } = useToast();
//   const [selectedPlanId, setSelectedPlanId] = useState('');
//   const [isTenureModalOpen, setIsTenureModalOpen] = useState(false);
//   const [customMonths, setCustomMonths] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   // Only used for the new flexible daily product: tracks whether the next
//   // calendar tap should set the Delivery Date or the Pickup Date.
//   const [selectingDate, setSelectingDate] = useState('start');
//   const [calendarMonth, setCalendarMonth] = useState(() => {
//     const n = new Date();
//     return new Date(n.getFullYear(), n.getMonth(), 1);
//   });

//   // ── Real data first, static fallback second ──────────────────────────────
//   const productName = product?.productName || 'Rental product';
//   const category = product?.category || '—';
//   const subCategory = product?.subCategory || '—';

//   const vendorDisplayName = useMemo(() => {
//     const v = product?.vendorId;
//     if (v && typeof v === 'object' && String(v.fullName || '').trim()) {
//       return String(v.fullName).trim();
//     }
//     const owner = String(
//       product?.logisticsVerification?.inventoryOwnerName || '',
//     ).trim();
//     if (owner) return owner;
//     return 'Verified partner';
//   }, [product?.vendorId, product?.logisticsVerification?.inventoryOwnerName]);

//   // Images: use vendor uploaded images[] first, fallback to image field and static samples.
//   // const images = useMemo(() => {
//   //   const fromDb = Array.isArray(product?.images)
//   //     ? product.images.filter(Boolean)
//   //     : [];
//   //   if (fromDb.length > 0) return fromDb.slice(0, 10);
//   //   if (product?.image) return [product.image, ...FALLBACK_IMAGES.slice(0, 3)];
//   //   return FALLBACK_IMAGES;
//   // }, [product?.images, product?.image]);
//   // const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
//   const [thumbStart, setThumbStart] = useState(0);
//   const variants = useMemo(
//     () => (Array.isArray(product?.variants) ? product.variants : []),
//     [product?.variants],
//   );

//   const images = useMemo(() => {
//     const fromDb = Array.isArray(product?.images)
//       ? product.images.filter(Boolean)
//       : [];
//     const allImgs =
//       fromDb.length > 0
//         ? fromDb
//         : product?.image
//           ? [product.image, ...FALLBACK_IMAGES.slice(0, 3)]
//           : FALLBACK_IMAGES;

//     // If multiple variants exist, split images per variant
//     if (variants.length > 1 && allImgs.length > 1) {
//       const perVariant = Math.ceil(allImgs.length / variants.length);
//       const start = selectedVariantIdx * perVariant;
//       const slice = allImgs.slice(start, start + perVariant);
//       return slice.length > 0 ? slice : allImgs.slice(0, perVariant);
//     }

//     return allImgs.slice(0, 10);
//   }, [product?.images, product?.image, variants, selectedVariantIdx]);

//   // const [mainImg, setMainImg] = useState(images[0]);
//   // const [thumbStart, setThumbStart] = useState(0);
//   // const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);\
//   const [mainImg, setMainImg] = useState(images[0]);
//   const THUMBS_PER_VIEW = 5;
//   useEffect(() => {
//     setMainImg(images[0]);
//   }, [images]);

//   useEffect(() => {
//     setThumbStart(0);
//   }, [selectedVariantIdx]);
//   useEffect(() => {
//     setThumbStart(0);
//   }, [images]);

//   const maxThumbStart = Math.max(0, images.length - THUMBS_PER_VIEW);
//   const visibleThumbs = images.slice(thumbStart, thumbStart + THUMBS_PER_VIEW);

//   const plans = useMemo(() => {
//     const fromVendor = normalizeRentalPlansFromProduct(
//       product,
//       variants[selectedVariantIdx],
//     );
//     if (fromVendor.length) return fromVendor;
//     const realPrice = parsePrice(product?.price);
//     if (realPrice) return buildPlans(realPrice);
//     return STATIC_PLANS;
//   }, [product, variants, selectedVariantIdx]);

//   const maxCustomMonths = useMemo(() => {
//     const sorted = [...plans]
//       .filter((p) => p.periodUnit !== 'day')
//       .sort((a, b) => a.rentalMonths - b.rentalMonths);
//     return sorted.length ? sorted[sorted.length - 1].rentalMonths : 0;
//   }, [plans]);

//   const minCustomMonths = useMemo(() => {
//     const sorted = [...plans]
//       .filter((p) => p.periodUnit !== 'day')
//       .sort((a, b) => a.rentalMonths - b.rentalMonths);
//     return sorted.length ? sorted[0].rentalMonths : 0;
//   }, [plans]);

//   const customPlan = useMemo(() => {
//     const m = parseInt(customMonths, 10);
//     if (!m || m <= 0) return null;
//     if (minCustomMonths && m < minCustomMonths) return null;
//     if (maxCustomMonths && m > maxCustomMonths) return null;
//     const sorted = [...plans]
//       .filter((p) => p.periodUnit !== 'day')
//       .sort((a, b) => a.rentalMonths - b.rentalMonths);
//     if (sorted.length < 2) return null;

//     let lower = sorted[0];
//     let upper = sorted[sorted.length - 1];
//     for (let i = 0; i < sorted.length - 1; i++) {
//       if (m >= sorted[i].rentalMonths && m <= sorted[i + 1].rentalMonths) {
//         lower = sorted[i];
//         upper = sorted[i + 1];
//         break;
//       }
//     }
//     if (m < sorted[0].rentalMonths) {
//       lower = sorted[0];
//       upper = sorted[1];
//     }
//     if (m > sorted[sorted.length - 1].rentalMonths) {
//       lower = sorted[sorted.length - 2];
//       upper = sorted[sorted.length - 1];
//     }

//     const slope =
//       (upper.displayPrice - lower.displayPrice) /
//       (upper.rentalMonths - lower.rentalMonths || 1);
//     const perMonth = Math.max(
//       1,
//       Math.round(lower.displayPrice + slope * (m - lower.rentalMonths)),
//     );

//     return {
//       id: 'custom',
//       tenureLabel: `${m} Months`,
//       rentalMonths: m,
//       rawDays: 0,
//       periodUnit: 'month',
//       price: perMonth * m,
//       displayPrice: perMonth,
//       label: 'Custom',
//       priceSuffix: '/month',
//     };
//   }, [customMonths, plans]);

//   // const defaultPlanId = plans[0]?.id || '';
//   // useEffect(() => {
//   //   setSelectedPlanId((prev) =>
//   //     plans.some((p) => p.id === prev) ? prev : defaultPlanId,
//   //   );
//   // }, [defaultPlanId, plans]);

//   /** Default to the longest tenure (best value) rather than the shortest,
//    * so the price shown on load matches the vendor's "POPULAR"/best-value
//    * tier instead of the first (often shortest) saved tenure. */
//   const longestPlan = useMemo(() => {
//     if (!plans.length) return null;
//     return [...plans].sort((a, b) => {
//       const lenA =
//         a.periodUnit === 'day' ? a.rawDays || 0 : a.rentalMonths || 0;
//       const lenB =
//         b.periodUnit === 'day' ? b.rawDays || 0 : b.rentalMonths || 0;
//       return lenB - lenA;
//     })[0];
//   }, [plans]);
//   const defaultPlanId = longestPlan?.id || plans[0]?.id || '';
//   useEffect(() => {
//     setSelectedPlanId((prev) =>
//       plans.some((p) => p.id === prev) ? prev : defaultPlanId,
//     );
//   }, [defaultPlanId, plans]);
//   // const plan = useMemo(() => {
//   //   if (selectedPlanId === 'custom' && customPlan) return customPlan;
//   //   return plans.find((p) => p.id === selectedPlanId) || plans[0];
//   // }, [plans, selectedPlanId, customPlan]);
//   const plan = useMemo(() => {
//     if (selectedPlanId === 'custom' && customPlan) return customPlan;
//     return (
//       plans.find((p) => p.id === selectedPlanId) || longestPlan || plans[0]
//     );
//   }, [plans, selectedPlanId, customPlan, longestPlan]);
//   const isDailyProduct = useMemo(
//     () => plans.some((p) => p.periodUnit === 'day'),
//     [plans],
//   );

//   // const requiredDaysForPlan = useMemo(() => {
//   //   if (!plan || plan.periodUnit !== 'day') return 0;
//   //   return plan.rawDays || 0;
//   // }, [plan]);
//   // const requiredDaysForPlan = useMemo(() => {
//   //   if (!plan || plan.periodUnit !== 'day') return 0;
//   //   return plan.rawDays || 0;
//   // }, [plan]);

//   // // True only for products created with the NEW single day-rate custom
//   // // listing (exactly one day-wise plan). Monthly & old multi-tenure daily
//   // // products are untouched and keep the old fixed-tenure calendar.
//   // const isFlexibleDailyProduct = useMemo(
//   //   () => isDailyProduct && plans.length === 1 && plan?.periodUnit === 'day',
//   //   [isDailyProduct, plans, plan],
//   // );

//   // const selectedDaysCount = useMemo(() => {
//   //   if (!startDate || !endDate) return 0;
//   //   const s = parseLocalIso(startDate);
//   //   const e = parseLocalIso(endDate);
//   //   if (!s || !e) return 0;
//   //   const diff =
//   //     Math.round(
//   //       (startOfLocalDay(e).getTime() - startOfLocalDay(s).getTime()) /
//   //         (1000 * 60 * 60 * 24),
//   //     ) + 1;
//   //   return diff > 0 ? diff : 0;
//   // }, [startDate, endDate]);

//   const requiredDaysForPlan = useMemo(() => {
//     if (!plan || plan.periodUnit !== 'day') return 0;
//     return plan.rawDays || 0;
//   }, [plan]);

//   // True only for products created with the NEW single day-rate custom
//   // listing (exactly one day-wise plan). Monthly & old multi-tenure daily
//   // products are untouched and keep the old fixed-tenure calendar.
//   const isFlexibleDailyProduct = useMemo(
//     () => isDailyProduct && plans.length === 1 && plan?.periodUnit === 'day',
//     [isDailyProduct, plans, plan],
//   );

//   // Chargeable window excludes the delivery day and the pickup day — only
//   // the days strictly in between are billed.
//   const chargeableStartDate = useMemo(() => {
//     if (!isFlexibleDailyProduct || !startDate) return '';
//     return toLocalIso(addLocalDays(parseLocalIso(startDate), 1));
//   }, [isFlexibleDailyProduct, startDate]);

//   const chargeableEndDate = useMemo(() => {
//     if (!isFlexibleDailyProduct || !endDate) return '';
//     return toLocalIso(addLocalDays(parseLocalIso(endDate), -1));
//   }, [isFlexibleDailyProduct, endDate]);

//   const selectedDaysCount = useMemo(() => {
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
//     if (isFlexibleDailyProduct) {
//       // Delivery day and pickup day are free — only days in between count.
//       const chargeable = fullDays - 2;
//       return chargeable > 0 ? chargeable : 0;
//     }
//     return fullDays;
//   }, [startDate, endDate, isFlexibleDailyProduct]);

//   const todayIso = useMemo(() => localTodayIso(), []);

//   const maxDateIso = useMemo(() => {
//     const d = new Date();
//     d.setMonth(d.getMonth() + 3);
//     return toLocalIso(d);
//   }, []);

//   const deliveryDaysCount = useMemo(() => {
//     const lv = product?.logisticsVerification || {};
//     const n = Number(lv.deliveryTimelineValue);
//     const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
//     return Number.isFinite(n) && n > 0
//       ? unit === 'hours'
//         ? Math.ceil(n / 24)
//         : n
//       : 0;
//   }, [product?.logisticsVerification]);

//   // const earliestSelectableDate = useMemo(
//   //   () => startOfLocalDay(addLocalDays(new Date(), deliveryDaysCount)),
//   //   [deliveryDaysCount],
//   // );
//   const earliestSelectableDate = useMemo(() => {
//     const n = Number(deliveryDaysCount);
//     const safeDays = Number.isFinite(n) && n > 0 ? n : 0;
//     return startOfLocalDay(addLocalDays(new Date(), safeDays));
//   }, [deliveryDaysCount]);

//   // useEffect(() => {
//   //   // Reset date range whenever plan changes (for daily products)
//   //   setStartDate('');
//   //   setEndDate('');
//   //   const n = new Date();
//   //   setCalendarMonth(new Date(n.getFullYear(), n.getMonth(), 1));
//   // }, [plan?.id]);
//   useEffect(() => {
//     // Reset date range whenever plan changes (for daily products)
//     setStartDate('');
//     setEndDate('');
//     setSelectingDate('start');
//     const lv = product?.logisticsVerification || {};
//     const deliveryN = Number(lv.deliveryTimelineValue);
//     const deliveryUnit = String(
//       lv.deliveryTimelineUnit || 'Days',
//     ).toLowerCase();
//     const deliveryDays =
//       Number.isFinite(deliveryN) && deliveryN > 0
//         ? deliveryUnit === 'hours'
//           ? Math.ceil(deliveryN / 24)
//           : deliveryN
//         : 0;
//     const earliest = addLocalDays(new Date(), deliveryDays);
//     // Open calendar on the month that actually has selectable dates
//     setCalendarMonth(new Date(earliest.getFullYear(), earliest.getMonth(), 1));
//   }, [plan?.id, product?.logisticsVerification]);

//   const discountPercent = Number(offer?.discountPercent || 0);
//   const hasOffer = discountPercent > 0;
//   const effectivePlanPrice = useMemo(() => {
//     if (!plan) return 0;
//     const base = plan.displayPrice ?? plan.price;
//     return hasOffer
//       ? Math.max(0, Math.round(base - (base * discountPercent) / 100))
//       : base;
//   }, [plan, hasOffer, discountPercent]);

//   // Total for the full tenure (used in cart & "Total Payable Now")
//   // const effectivePlanTotalPrice = useMemo(() => {
//   //   if (!plan) return 0;
//   //   return hasOffer
//   //     ? Math.max(
//   //         0,
//   //         Math.round(plan.price - (plan.price * discountPercent) / 100),
//   //       )
//   //     : plan.price;
//   // }, [plan, hasOffer, discountPercent]);

//   // const effectivePlanTotalPrice = useMemo(() => {
//   //   if (!plan) return 0;
//   //   if (isFlexibleDailyProduct) {
//   //     const days = selectedDaysCount || 1;
//   //     const base = (plan.displayPrice || plan.price || 0) * days;
//   //     return hasOffer
//   //       ? Math.max(0, Math.round(base - (base * discountPercent) / 100))
//   //       : base;
//   //   }
//   //   return hasOffer
//   //     ? Math.max(
//   //         0,
//   //         Math.round(plan.price - (plan.price * discountPercent) / 100),
//   //       )
//   //     : plan.price;
//   // }, [
//   //   plan,
//   //   hasOffer,
//   //   discountPercent,
//   //   isFlexibleDailyProduct,
//   //   selectedDaysCount,
//   // ]);

//   const effectivePlanTotalPrice = useMemo(() => {
//     if (!plan) return 0;
//     if (isFlexibleDailyProduct) {
//       const days = selectedDaysCount || 1;
//       // Derive total from the already-rounded per-day price so it always
//       // matches what's shown in the ₹/day box.
//       return effectivePlanPrice * days;
//     }
//     // Derive total from the already-rounded per-month price (effectivePlanPrice)
//     // instead of rounding the discounted total independently — keeps the
//     // "Total Payable Now" box perfectly consistent with the ₹/mo price shown.
//     const units =
//       plan.periodUnit === 'day' && plan.rawDays > 0
//         ? plan.rawDays
//         : plan.rentalMonths || 1;
//     return effectivePlanPrice * units;
//   }, [plan, effectivePlanPrice, isFlexibleDailyProduct, selectedDaysCount]);

//   const strikePrice = useMemo(() => {
//     if (!plans.length) return 0;
//     return Math.max(...plans.map((p) => p.price));
//   }, [plans]);

//   // const rentLineLabel =
//   //   plan?.periodUnit === 'day' ? 'Rental rate' : 'Monthly rent';
//   const rentLineLabel =
//     plan?.periodUnit === 'day' ? 'Rental rate' : 'Monthly rent';

//   useEffect(() => {
//     if (isTenureModalOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [isTenureModalOpen]);

//   const [currentStock, setCurrentStock] = useState(
//     typeof product?.stock === 'number' ? product.stock : 0,
//   );

//   useEffect(() => {
//     let isMounted = true;
//     const id = product?._id;
//     if (!id) return;

//     // Refresh stock dynamically when opening product details.
//     apiGetProductById(id)
//       .then((res) => {
//         const stock = res.data?.product?.stock;
//         if (!isMounted) return;
//         setCurrentStock(typeof stock === 'number' ? stock : 0);
//       })
//       .catch(() => {
//         if (!isMounted) return;
//         setCurrentStock(typeof product?.stock === 'number' ? product.stock : 0);
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, [product?._id]);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       setWishedIds([]);
//       return;
//     }

//     let mounted = true;

//     apiGetMyWishlist()
//       .then((res) => {
//         if (!mounted) return;

//         setWishedIds(
//           Array.isArray(res.data?.wishedProductIds)
//             ? res.data.wishedProductIds
//             : [],
//         );
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setWishedIds([]);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, [isAuthenticated]);

//   const isWished = (id) => wishedIds.includes(String(id));

//   const onToggleWishlist = async () => {
//     if (!isAuthenticated || !product?._id) return;

//     setTogglingId(String(product._id));

//     try {
//       const res = await apiToggleWishlist(product._id);
//       const wished = !!res.data?.wished;

//       setWishedIds((prev) => {
//         const pid = String(product._id);

//         if (wished) {
//           return prev.includes(pid) ? prev : [...prev, pid];
//         }

//         return prev.filter((x) => x !== pid);
//       });
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setTogglingId('');
//     }
//   };

//   /** Cart / checkout tenure: months for month-plans; day count for day-plans. */
//   // const activeRentalMonths = useMemo(() => {
//   //   if (!plan) return 1;
//   //   if (plan.periodUnit === 'day' && plan.rawDays > 0) return plan.rawDays;
//   //   return plan.rentalMonths || 1;
//   // }, [plan]);

//   const activeRentalMonths = useMemo(() => {
//     if (!plan) return 1;
//     if (isFlexibleDailyProduct) return selectedDaysCount || 1;
//     if (plan.periodUnit === 'day' && plan.rawDays > 0) return plan.rawDays;
//     return plan.rentalMonths || 1;
//   }, [plan, isFlexibleDailyProduct, selectedDaysCount]);
//   const totalRentalForTenure = useMemo(() => {
//     if (!plan) return 0;
//     return effectivePlanTotalPrice;
//   }, [plan, effectivePlanTotalPrice]);

//   // const tenureSummaryText = useMemo(() => {
//   //   if (!plan) return '';
//   //   if (plan.periodUnit === 'day' && plan.rawDays > 0) {
//   //     return `${plan.rawDays} days`;
//   //   }
//   //   return `${plan.rentalMonths || 1} months`;
//   // }, [plan]);
//   const tenureSummaryText = useMemo(() => {
//     if (!plan) return '';
//     if (isFlexibleDailyProduct) {
//       return selectedDaysCount ? `${selectedDaysCount} days` : 'select dates';
//     }
//     if (plan.periodUnit === 'day' && plan.rawDays > 0) {
//       return `${plan.rawDays} days`;
//     }
//     return `${plan.rentalMonths || 1} months`;
//   }, [plan, isFlexibleDailyProduct, selectedDaysCount]);

//   // const isValidDailyRange = useMemo(() => {
//   //   if (!isDailyProduct || !requiredDaysForPlan) return true;
//   //   if (!startDate || !endDate) return false;
//   //   const start = parseLocalIso(startDate);
//   //   const end = parseLocalIso(endDate);
//   //   if (!start || !end) return false;
//   //   if (startOfLocalDay(end) < startOfLocalDay(start)) return false;
//   //   const diffDays =
//   //     Math.round(
//   //       (startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime()) /
//   //         (1000 * 60 * 60 * 24),
//   //     ) + 1;
//   //   return diffDays === requiredDaysForPlan;
//   // }, [isDailyProduct, requiredDaysForPlan, startDate, endDate]);
//   const isValidDailyRange = useMemo(() => {
//     if (!isDailyProduct) return true;
//     if (isFlexibleDailyProduct) {
//       if (!startDate || !endDate) return false;
//       const start = parseLocalIso(startDate);
//       const end = parseLocalIso(endDate);
//       if (!start || !end) return false;
//       const minPickup = addLocalDays(start, 2);
//       return startOfLocalDay(end) >= startOfLocalDay(minPickup);
//     }
//     if (!requiredDaysForPlan) return true;
//     if (!startDate || !endDate) return false;
//     const start = parseLocalIso(startDate);
//     const end = parseLocalIso(endDate);
//     if (!start || !end) return false;
//     if (startOfLocalDay(end) < startOfLocalDay(start)) return false;
//     const diffDays =
//       Math.round(
//         (startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime()) /
//           (1000 * 60 * 60 * 24),
//       ) + 1;
//     return diffDays === requiredDaysForPlan;
//   }, [
//     isDailyProduct,
//     isFlexibleDailyProduct,
//     requiredDaysForPlan,
//     startDate,
//     endDate,
//   ]);

//   const calendarCells = useMemo(
//     () => buildMonthGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
//     [calendarMonth],
//   );

//   const canPrevCalendarMonth = useMemo(() => {
//     const today = new Date();
//     const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     return calendarMonth.getTime() > firstThisMonth.getTime();
//   }, [calendarMonth]);

//   const canNextCalendarMonth = useMemo(() => {
//     const max = parseLocalIso(maxDateIso);
//     if (!max) return true;
//     const nextCal = new Date(
//       calendarMonth.getFullYear(),
//       calendarMonth.getMonth() + 1,
//       1,
//     );
//     if (nextCal.getFullYear() > max.getFullYear()) return false;
//     if (
//       nextCal.getFullYear() === max.getFullYear() &&
//       nextCal.getMonth() > max.getMonth()
//     )
//       return false;
//     return true;
//   }, [calendarMonth, maxDateIso]);

//   const ratingStats = useMemo(() => {
//     const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

//     if (!reviews.length) {
//       return {
//         average: 0,
//         total: 0,
//       };
//     }

//     const totalRating = reviews.reduce(
//       (sum, r) => sum + Number(r.rating || 0),
//       0,
//     );

//     return {
//       average: (totalRating / reviews.length).toFixed(1),
//       total: reviews.length,
//     };
//   }, [product?.reviews]);

//   // const handleCalendarDayClick = (day) => {
//   //   if (!requiredDaysForPlan) return;
//   //   const start = startOfLocalDay(day);
//   //   const today = startOfLocalDay(new Date());
//   //   if (start.getTime() < today.getTime()) {
//   //     pushToast('You can only select today or future dates.', 'error');
//   //     return;
//   //   }
//   //   const end = addLocalDays(start, requiredDaysForPlan - 1);
//   //   const maxD = parseLocalIso(maxDateIso);
//   //   if (
//   //     !maxD ||
//   //     startOfLocalDay(end).getTime() > startOfLocalDay(maxD).getTime()
//   //   ) {
//   //     pushToast(
//   //       'Choose an earlier start date so the full rental fits within the booking window.',
//   //       'error',
//   //     );
//   //     return;
//   //   }
//   //   setStartDate(toLocalIso(start));
//   //   setEndDate(toLocalIso(end));
//   // };
//   const handleCalendarDayClick = (day) => {
//     const start = startOfLocalDay(day);
//     const today = startOfLocalDay(new Date());
//     if (start.getTime() < today.getTime()) {
//       pushToast('You can only select today or future dates.', 'error');
//       return;
//     }
//     const maxD = parseLocalIso(maxDateIso);
//     if (maxD && start.getTime() > startOfLocalDay(maxD).getTime()) {
//       pushToast('Selected date is beyond the allowed booking window.', 'error');
//       return;
//     }

//     if (isFlexibleDailyProduct) {
//       if (selectingDate === 'start') {
//         setStartDate(toLocalIso(start));
//         // If a pickup date was already chosen but is now before the new
//         // delivery date, clear it so the user re-picks a valid pickup date.
//         setEndDate((prevEnd) => {
//           if (!prevEnd) return prevEnd;
//           const e = parseLocalIso(prevEnd);
//           if (e && startOfLocalDay(e).getTime() < start.getTime()) return '';
//           return prevEnd;
//         });
//         setSelectingDate('end');
//         return;
//       }
//       // selectingDate === 'end'
//       // selectingDate === 'end'
//       const s = startDate ? parseLocalIso(startDate) : null;
//       if (s && start.getTime() < startOfLocalDay(s).getTime()) {
//         // Tapped a date before the delivery date — treat it as a new
//         // delivery date instead of a pickup date.
//         setStartDate(toLocalIso(start));
//         setEndDate('');
//         setSelectingDate('end');
//         return;
//       }
//       if (s) {
//         const minPickup = startOfLocalDay(addLocalDays(s, 2));
//         if (start.getTime() < minPickup.getTime()) {
//           pushToast(
//             'Pickup date must be at least 2 days after the delivery date.',
//             'error',
//           );
//           return;
//         }
//       }
//       setEndDate(toLocalIso(start));
//       return;
//     }

//     // if (!requiredDaysForPlan) return;
//     // const end = addLocalDays(start, requiredDaysForPlan - 1);
//     const safeRequiredDays =
//       Number.isFinite(requiredDaysForPlan) && requiredDaysForPlan > 0
//         ? requiredDaysForPlan
//         : 1;
//     const end = addLocalDays(start, safeRequiredDays - 1);
//     if (
//       !maxD ||
//       startOfLocalDay(end).getTime() > startOfLocalDay(maxD).getTime()
//     ) {
//       pushToast(
//         'Choose an earlier start date so the full rental fits within the booking window.',
//         'error',
//       );
//       return;
//     }
//     setStartDate(toLocalIso(start));
//     setEndDate(toLocalIso(end));
//   };

//   const handleAddToCart = () => {
//     (async () => {
//       const productId = product?._id;
//       if (!productId) return;

//       // if (isDailyProduct && !isValidDailyRange) {
//       //   pushToast(
//       //     `Please select exactly ${requiredDaysForPlan} day${
//       //       requiredDaysForPlan > 1 ? 's' : ''
//       //     } on the calendar.`,
//       //     'error',
//       //   );
//       //   return;
//       // }

//       // const existingQty =
//       //   items.find((i) => i.productId === productId)?.quantity || 0;
//       // const res = await apiGetProductById(productId);
//       // const stock = res.data?.product?.stock ?? currentStock ?? 0;

//       // if (!stock || stock <= 0) {
//       //   pushToast('Sorry, this product is out of stock.', 'error');
//       //   return;
//       // }

//       // if (existingQty + 1 > stock) {
//       //   pushToast(
//       //     `Only ${stock} available in stock for this product.`,
//       //     'error',
//       //   );
//       //   return;
//       // }

//       if (isDailyProduct && !isValidDailyRange) {
//         pushToast(
//           isFlexibleDailyProduct
//             ? 'Please select a delivery date and pickup date on the calendar.'
//             : `Please select exactly ${requiredDaysForPlan} day${
//                 requiredDaysForPlan > 1 ? 's' : ''
//               } on the calendar.`,
//           'error',
//         );
//         return;
//       }

//       const existingQty =
//         items.find((i) => i.productId === productId)?.quantity || 0;
//       const res = await apiGetProductById(productId);
//       const stock = res.data?.product?.stock ?? currentStock ?? 0;

//       if (!stock || stock <= 0) {
//         pushToast('Sorry, this product is out of stock.', 'error');
//         return;
//       }

//       if (existingQty + 1 > stock) {
//         pushToast(
//           `Only ${stock} available in stock for this product.`,
//           'error',
//         );
//         return;
//       }

//       // console.log('VARIANT DEBUG:', {
//       //   selectedVariantIdx,
//       //   variant: variants[selectedVariantIdx],
//       //   variantId: variants[selectedVariantIdx]?._id,
//       // });
//       console.log('VARIANT DEBUG:', {
//         selectedVariantIdx,
//         variant: variants[selectedVariantIdx],
//         variantId: variants[selectedVariantIdx]?._id,
//       });
//       console.log('=== ADD TO CART TAX DEBUG ===');
//       console.log('product.subCategoryTax:', product?.subCategoryTax);
//       console.log(
//         'defaultGst being sent:',
//         product?.subCategoryTax?.defaultGst ?? null,
//       );
//       console.log(
//         'defaultCareTax being sent:',
//         product?.subCategoryTax?.defaultCareTax ?? null,
//       );
//       // dispatch(
//       //   addToCart({
//       //     productId,
//       //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//       //     variantName: variants[selectedVariantIdx]?.variantName || '',
//       //     quantity: 1,
//       //     rentalMonths: activeRentalMonths,
//       //     pricePerDay: effectivePlanTotalPrice,
//       //     title: productName,
//       //     image: images?.[0] || '',
//       //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
//       //     refundableDeposit: Number(product?.refundableDeposit || 0),
//       //     rentalConfigurations: product?.rentalConfigurations || [],
//       //   }),
//       // );

//       // if (!isAuthenticated) {
//       //   sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
//       //   openAuth('login');
//       // }

//       // router.push('/cart');

//       // dispatch(
//       //   addToCart({
//       //     productId,
//       //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//       //     variantName: variants[selectedVariantIdx]?.variantName || '',
//       //     quantity: 1,
//       //     rentalMonths: activeRentalMonths,
//       //     pricePerDay: effectivePlanTotalPrice,
//       //     title: productName,
//       //     image: images?.[0] || '',
//       //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
//       //     refundableDeposit: Number(product?.refundableDeposit || 0),
//       //     rentalConfigurations: product?.rentalConfigurations || [],
//       //     // condition: product?.condition || '',
//       //     // productType: 'Rental',
//       //     condition: product?.condition || '',
//       //     productType: 'Rental',
//       //     offer: offer || null,
//       //   }),
//       // );

//       // if (!isAuthenticated) {
//       //   sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
//       //   openAuth('login');
//       // }

//       // router.push('/cart');
//       dispatch(
//         addToCart({
//           productId,
//           variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//           variantName: variants[selectedVariantIdx]?.variantName || '',
//           quantity: 1,
//           rentalMonths: activeRentalMonths,
//           pricePerDay: effectivePlanTotalPrice,
//           title: productName,
//           image: images?.[0] || '',
//           tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
//           // refundableDeposit: Number(product?.refundableDeposit || 0),
//           // rentalConfigurations: product?.rentalConfigurations || [],
//           // condition: product?.condition || '',
//           // productType: 'Rental',
//           // offer: offer || null,
//           // defaultGst: product?.subCategoryTax?.defaultGst ?? null,
//           refundableDeposit: Number(product?.refundableDeposit || 0),
//           rentalConfigurations:
//             Array.isArray(variants[selectedVariantIdx]?.rentalConfigurations) &&
//             variants[selectedVariantIdx].rentalConfigurations.length
//               ? variants[selectedVariantIdx].rentalConfigurations
//               : product?.rentalConfigurations || [],
//           condition: product?.condition || '',
//           productType: 'Rental',
//           offer: offer || null,
//           defaultGst: product?.subCategoryTax?.defaultGst ?? null,
//           defaultCareTax: product?.subCategoryTax?.defaultCareTax ?? null,
//           defaultRepairWarranty:
//             product?.subCategoryTax?.defaultRepairWarranty ?? null,
//           defaultRelocationWarranty:
//             product?.subCategoryTax?.defaultRelocationWarranty ?? null,
//           defaultDeliveryPackaging:
//             product?.subCategoryTax?.defaultDeliveryPackaging ?? null,
//           defaultInstallationFee:
//             product?.subCategoryTax?.defaultInstallationFee ?? null,
//           defaultPlatformFee:
//             product?.subCategoryTax?.defaultPlatformFee ?? null,
//           taxBlocked: product?.subCategoryTax?.taxBlocked ?? false,
//           startDate: isFlexibleDailyProduct ? startDate : null,
//           endDate: isFlexibleDailyProduct ? endDate : null,
//           dailyRate: isFlexibleDailyProduct
//             ? (plan?.displayPrice ?? plan?.price ?? 0)
//             : null,
//         }),
//       );

//       if (!isAuthenticated) {
//         sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
//         openAuth('login');
//       }

//       router.push('/cart');
//     })();
//   };

//   const handleRentNow = () => {
//     (async () => {
//       const productId = product?._id;
//       if (!productId) return;

//       // if (isDailyProduct && !isValidDailyRange) {
//       //   pushToast(
//       //     `Please select exactly ${requiredDaysForPlan} day${
//       //       requiredDaysForPlan > 1 ? 's' : ''
//       //     } on the calendar.`,
//       //     'error',
//       //   );
//       //   return;
//       // }

//       // const existingQty =
//       //   items.find((i) => i.productId === productId)?.quantity || 0;
//       // const res = await apiGetProductById(productId);
//       // const stock = res.data?.product?.stock ?? currentStock ?? 0;

//       // if (!stock || stock <= 0) {
//       //   pushToast('Sorry, this product is out of stock.', 'error');
//       //   return;
//       // }

//       // if (existingQty + 1 > stock) {
//       //   pushToast(
//       //     `Only ${stock} available in stock for this product.`,
//       //     'error',
//       //   );
//       //   return;
//       // }

//       if (isDailyProduct && !isValidDailyRange) {
//         pushToast(
//           isFlexibleDailyProduct
//             ? 'Please select a delivery date and pickup date on the calendar.'
//             : `Please select exactly ${requiredDaysForPlan} day${
//                 requiredDaysForPlan > 1 ? 's' : ''
//               } on the calendar.`,
//           'error',
//         );
//         return;
//       }

//       const existingQty =
//         items.find((i) => i.productId === productId)?.quantity || 0;
//       const res = await apiGetProductById(productId);
//       const stock = res.data?.product?.stock ?? currentStock ?? 0;

//       if (!stock || stock <= 0) {
//         pushToast('Sorry, this product is out of stock.', 'error');
//         return;
//       }

//       if (existingQty + 1 > stock) {
//         pushToast(
//           `Only ${stock} available in stock for this product.`,
//           'error',
//         );
//         return;
//       }

//       // dispatch(
//       //   addToCart({
//       //     productId,
//       //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//       //     variantName: variants[selectedVariantIdx]?.variantName || '',
//       //     quantity: 1,
//       //     rentalMonths: activeRentalMonths,
//       //     pricePerDay: effectivePlanTotalPrice,
//       //     title: productName,
//       //     image: images?.[0] || '',
//       //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
//       //     refundableDeposit: Number(product?.refundableDeposit || 0),
//       //     rentalConfigurations: product?.rentalConfigurations || [],
//       //   }),
//       // );

//       // if (typeof window !== 'undefined' && productId) {
//       // dispatch(
//       //   addToCart({
//       //     productId,
//       //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//       //     variantName: variants[selectedVariantIdx]?.variantName || '',
//       //     quantity: 1,
//       //     rentalMonths: activeRentalMonths,
//       //     pricePerDay: effectivePlanTotalPrice,
//       //     title: productName,
//       //     image: images?.[0] || '',
//       //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
//       //     refundableDeposit: Number(product?.refundableDeposit || 0),
//       //     rentalConfigurations: product?.rentalConfigurations || [],
//       //     // condition: product?.condition || '',
//       //     // productType: 'Rental',
//       //     condition: product?.condition || '',
//       //     productType: 'Rental',
//       //     offer: offer || null,
//       //   }),
//       // );

//       // if (typeof window !== 'undefined' && productId) {

//       dispatch(
//         addToCart({
//           productId,
//           variantId: variants[selectedVariantIdx]?._id?.toString() || null,
//           variantName: variants[selectedVariantIdx]?.variantName || '',
//           quantity: 1,
//           rentalMonths: activeRentalMonths,
//           pricePerDay: effectivePlanTotalPrice,
//           title: productName,
//           image: images?.[0] || '',
//           tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
//           // refundableDeposit: Number(product?.refundableDeposit || 0),
//           // rentalConfigurations: product?.rentalConfigurations || [],
//           // condition: product?.condition || '',
//           // productType: 'Rental',
//           // offer: offer || null,
//           // defaultGst: product?.subCategoryTax?.defaultGst ?? null,
//           refundableDeposit: Number(product?.refundableDeposit || 0),
//           rentalConfigurations:
//             Array.isArray(variants[selectedVariantIdx]?.rentalConfigurations) &&
//             variants[selectedVariantIdx].rentalConfigurations.length
//               ? variants[selectedVariantIdx].rentalConfigurations
//               : product?.rentalConfigurations || [],
//           condition: product?.condition || '',
//           productType: 'Rental',
//           offer: offer || null,
//           defaultGst: product?.subCategoryTax?.defaultGst ?? null,
//           defaultCareTax: product?.subCategoryTax?.defaultCareTax ?? null,
//           defaultRepairWarranty:
//             product?.subCategoryTax?.defaultRepairWarranty ?? null,
//           defaultRelocationWarranty:
//             product?.subCategoryTax?.defaultRelocationWarranty ?? null,
//           defaultDeliveryPackaging:
//             product?.subCategoryTax?.defaultDeliveryPackaging ?? null,
//           defaultInstallationFee:
//             product?.subCategoryTax?.defaultInstallationFee ?? null,
//           defaultPlatformFee:
//             product?.subCategoryTax?.defaultPlatformFee ?? null,
//           taxBlocked: product?.subCategoryTax?.taxBlocked ?? false,
//           startDate: isFlexibleDailyProduct ? startDate : null,
//           endDate: isFlexibleDailyProduct ? endDate : null,
//           dailyRate: isFlexibleDailyProduct
//             ? (plan?.displayPrice ?? plan?.price ?? 0)
//             : null,
//         }),
//       );

//       if (typeof window !== 'undefined' && productId) {
//         sessionStorage.setItem(
//           'rentpay_checkout_focus_product_id',
//           String(productId),
//         );
//       }

//       if (!isAuthenticated) {
//         sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
//         openAuth('login');
//       }

//       router.push('/checkout');
//     })();
//   };

//   return (
//     <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
//       {/* ── LEFT: Images ──────────────────────────────────────────────────── */}
//       {/* <div className="min-w-0">
//         <div className="rounded-lg sm:rounded-xl overflow-hidden border">
//           <img
//             src={mainImg}
//             alt={productName}
//             className="w-full h-56 sm:h-72 md:h-80 lg:h-[420px] object-cover"
//           />
//         </div>

//         <div className="mt-3 sm:mt-4 flex items-center gap-2">
//           <button
//             type="button"
//             onClick={() => setThumbStart((p) => Math.max(0, p - 1))}
//             disabled={thumbStart === 0}
//             className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
//             aria-label="Previous images"
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </button>
//           <div className="grid flex-1 grid-cols-5 gap-2 sm:gap-4">
//             {visibleThumbs.map((img, i) => (
//               <img
//                 key={`${img}-${thumbStart + i}`}
//                 src={img}
//                 alt={`view-${thumbStart + i + 1}`}
//                 onClick={() => setMainImg(img)}
//                 className={`w-full h-14 sm:h-20 object-cover rounded-lg border cursor-pointer transition-all ${
//                   mainImg === img
//                     ? 'border-orange-500 ring-1 ring-orange-400'
//                     : 'hover:border-orange-400'
//                 }`}
//               />
//             ))}
//           </div>
//           <button
//             type="button"
//             onClick={() => setThumbStart((p) => Math.min(maxThumbStart, p + 1))}
//             disabled={thumbStart >= maxThumbStart}
//             className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
//             aria-label="Next images"
//           >
//             <ChevronRight className="h-4 w-4" />
//           </button>
//         </div>
//       </div> */}
//       <div className="min-w-0">
//         {/* Main Image Wrapper */}
//         <div className="relative rounded-lg sm:rounded-xl overflow-hidden border">
//           {/* Top Left Badge */}
//           <div className="absolute top-3 left-3 z-10">
//             <span className="bg-orange-500 text-white uppercase text-xs sm:text-xs px-3 py-1 rounded-full font-semibold shadow">
//               Rent
//             </span>
//           </div>
//           <div className="absolute top-3 right-3 z-10">
//             <button
//               type="button"
//               onClick={onToggleWishlist}
//               disabled={togglingId === String(product?._id)}
//               className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition disabled:opacity-60"
//             >
//               <Heart
//                 className={`h-4 w-4 ${
//                   isWished(product?._id)
//                     ? 'text-red-500 fill-red-500'
//                     : 'text-gray-500'
//                 }`}
//               />
//             </button>
//           </div>

//           <img
//             src={mainImg}
//             alt={productName}
//             className="w-full h-56 sm:h-72 md:h-80 lg:h-[420px] object-cover"
//           />

//           {/* Bottom Right Verified Text */}
//           <div className="absolute bottom-3 right-3 z-10">
//             <span className="bg-white backdrop-blur-sm text-[#10B981] text-[10px] sm:text-xs px-3 py-1.5 rounded-lg font-medium shadow border-2 border-[#10B981] flex items-center gap-1.5">
//               <ShieldCheck className="w-3.5 h-3.5" />
//               Physically Verified
//             </span>
//           </div>
//         </div>

//         {/* Thumbnails */}
//         <div className="mt-3 sm:mt-4 flex items-center gap-2">
//           <button
//             type="button"
//             onClick={() => setThumbStart((p) => Math.max(0, p - 1))}
//             disabled={thumbStart === 0}
//             className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
//             aria-label="Previous images"
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </button>

//           <div className="grid flex-1 grid-cols-5 gap-2 sm:gap-4">
//             {visibleThumbs.map((img, i) => (
//               <img
//                 key={`${img}-${thumbStart + i}`}
//                 src={img}
//                 alt={`view-${thumbStart + i + 1}`}
//                 onClick={() => setMainImg(img)}
//                 className={`w-full h-14 sm:h-20 object-cover rounded-lg border cursor-pointer transition-all ${
//                   mainImg === img
//                     ? 'border-orange-500 ring-1 ring-orange-400'
//                     : 'hover:border-orange-400'
//                 }`}
//               />
//             ))}
//           </div>

//           <button
//             type="button"
//             onClick={() => setThumbStart((p) => Math.min(maxThumbStart, p + 1))}
//             disabled={thumbStart >= maxThumbStart}
//             className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
//             aria-label="Next images"
//           >
//             <ChevronRight className="h-4 w-4" />
//           </button>
//         </div>
//         {/* ── Variant Selector ── */}
//         {variants.length > 1 && (
//           <div className="mt-3 sm:mt-4">
//             <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
//               Select Variant
//             </p>
//             <div className="flex flex-wrap gap-2">
//               {variants.map((v, idx) => {
//                 const isSelected = selectedVariantIdx === idx;
//                 const variantImages = (() => {
//                   const fromDb = Array.isArray(product?.images)
//                     ? product.images.filter(Boolean)
//                     : [];
//                   const allImgs = fromDb.length > 0 ? fromDb : FALLBACK_IMAGES;
//                   const perVariant = Math.ceil(
//                     allImgs.length / variants.length,
//                   );
//                   const start = idx * perVariant;
//                   const slice = allImgs.slice(start, start + perVariant);
//                   return slice.length > 0 ? slice : allImgs.slice(0, 1);
//                 })();
//                 return (
//                   <button
//                     key={v.variantName || idx}
//                     type="button"
//                     onClick={() => {
//                       setSelectedVariantIdx(idx);
//                       setMainImg(variantImages[0]);
//                     }}
//                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
//                       isSelected
//                         ? 'border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-400'
//                         : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
//                     }`}
//                   >
//                     <img
//                       src={variantImages[0]}
//                       alt={v.variantName}
//                       className="w-8 h-8 object-cover rounded"
//                     />
//                     <span>{v.variantName}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── RIGHT: Details ────────────────────────────────────────────────── */}
//       <div className="min-w-0">
//         {/* Breadcrumb */}
//         <p className="text-xs sm:text-sm truncate">
//           <a
//             href="/"
//             className="text-gray-400  hover:text-orange-500 font-medium"
//           >
//             Home
//           </a>
//           <span className="text-gray-400 mx-1">&gt;</span>
//           <span className="text-orange-500">Rent Detail</span>
//         </p>

//         {/* Title + Rating */}
//         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mt-2">
//           {/* <h1 className="text-xl sm:text-2xl font-semibold">{productName}</h1> */}
//           <div>
//             <h1 className="text-xl sm:text-2xl font-semibold">{productName}</h1>

//             {Number.isFinite(currentStock) && (
//               <span
//                 className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
//                   currentStock > 0
//                     ? currentStock <= 5
//                       ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
//                       : 'bg-green-100 text-green-700 border border-green-300'
//                     : 'bg-red-100 text-red-700 border border-red-300'
//                 }`}
//               >
//                 {currentStock > 0
//                   ? currentStock <= 3
//                     ? `Only ${currentStock} left`
//                     : `${currentStock} in stock`
//                   : 'Out of stock'}
//               </span>
//             )}
//           </div>

//           {ratingStats.total > 0 && (
//             <div className="flex flex-row items-center gap-1.5 shrink-0 text-right">
//               <span className="bg-[#10B981] text-white text-xs sm:text-sm px-2 py-0.5 rounded flex items-center justify-center">
//                 {ratingStats.average} ★
//               </span>

//               <span className="text-[#4A5565] text-xs sm:text-sm max-w-[10rem] sm:max-w-[14rem] truncate flex items-center">
//                 {ratingStats.total}{' '}
//                 {ratingStats.total === 1 ? 'Rating' : 'Ratings'}
//               </span>
//             </div>
//           )}
//         </div>
//         {/* {hasOffer ? (
//           <p className="mt-1 text-sm font-medium text-emerald-600">
//             ({discountPercent}% off)
//           </p>
//         ) : null} */}

//         {/* Stock badge */}
//         {/* {Number.isFinite(currentStock) && (
//           <span
//             className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full
//             ${
//               currentStock > 0
//                 ? currentStock <= 3
//                   ? 'bg-yellow-100 text-yellow-700'
//                   : 'bg-green-100 text-green-700'
//                 : 'bg-red-100 text-red-700'
//             }`}
//           >
//             {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
//           </span>
//         )} */}

//         {/* ── Rental Tenure ── */}
//         <div className="mt-4 sm:mt-6 border border-orange-300 rounded-lg sm:rounded-xl p-3 sm:p-5 bg-gradient-to-r from-[#FFFBEB] to-[#FFF7ED]">
//           <div className="flex items-center justify-between gap-3">
//             <div className="min-w-0">
//               {/* <p className="text-xs text-gray-500 mb-0.5">Monthly Rent</p> */}
//               {/* <p className="text-2xl sm:text-3xl font-bold text-gray-900">
//                 ₹{effectivePlanPrice}
//                 <span className="text-sm font-semibold text-gray-500 ml-1">
//                   {plan?.priceSuffix || '/mo'}
//                 </span>
//               </p> */}
//               <p className="text-2xl sm:text-3xl font-bold text-gray-900">
//                 ₹{effectivePlanPrice}
//                 <span className="text-sm font-semibold text-gray-500">
//                   {plan?.priceSuffix || '/mo'}
//                 </span>
//               </p>
//               {hasOffer && plan && (
//                 // <p className="text-xs text-gray-400 line-through mt-0.5">
//                 //   ₹{plan.displayPrice ?? plan.price}
//                 //   {plan.priceSuffix || '/mo'}
//                 // </p>
//                 <p className="text-xs text-gray-400 line-through mt-0.5">
//                   ₹{plan.displayPrice ?? plan.price}
//                   {plan.priceSuffix || '/mo'}
//                 </p>
//               )}
//             </div>
//             {/* <button
//               type="button"
//               onClick={() => setIsTenureModalOpen(true)}
//               className="shrink-0 flex items-center gap-2 border-2 border-orange-400 text-orange-600 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 transition-colors"
//             >
//               <span>{plan?.tenureLabel || 'Select'}</span>
//               <ChevronRight className="w-4 h-4" />
//             </button> */}
//             {!isFlexibleDailyProduct ? (
//               <button
//                 type="button"
//                 onClick={() => setIsTenureModalOpen(true)}
//                 className="shrink-0 flex items-center gap-2 border-2 border-orange-400 text-orange-600 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 transition-colors"
//               >
//                 <span>{plan?.tenureLabel || 'Select'}</span>
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             ) : (
//               <span className="shrink-0 inline-flex items-center rounded-xl border-2 border-orange-300 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600">
//                 Per Day
//               </span>
//             )}
//           </div>

//           {/* Tenure Modal */}
//           {isTenureModalOpen && (
//             <div className="fixed inset-0 z-50 flex">
//               {/* Backdrop */}
//               <div className="flex-1 bg-black/40" />
//               {/* Modal Panel — full height, right side */}
//               <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
//                 {/* Header */}
//                 <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//                   <h2 className="text-lg font-bold text-gray-900">
//                     Select Tenure
//                   </h2>
//                   <button
//                     type="button"
//                     onClick={() => setIsTenureModalOpen(false)}
//                     className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-xl font-bold"
//                   >
//                     ✕
//                   </button>
//                 </div>
//                 {/* Options */}
//                 <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
//                   {plans.map((p, index) => {
//                     const perMonth = hasOffer
//                       ? Math.max(
//                           0,
//                           Math.round(
//                             p.displayPrice -
//                               (p.displayPrice * discountPercent) / 100,
//                           ),
//                         )
//                       : p.displayPrice;
//                     const originalPerMonth = p.displayPrice;
//                     const isBestValue = index === plans.length - 1;
//                     const isSelected = selectedPlanId === p.id;
//                     // const lowestPerMonth = Math.max(
//                     //   ...plans.map((pl) => pl.displayPrice),
//                     // );
//                     // const saving = lowestPerMonth - perMonth;
//                     const highestPerUnitPrice = Math.max(
//                       ...plans.map((pl) => pl.displayPrice),
//                     );
//                     const saving = highestPerUnitPrice - perMonth;
//                     return (
//                       <button
//                         key={p.id}
//                         type="button"
//                         onClick={() => {
//                           setSelectedPlanId(p.id);
//                           setIsTenureModalOpen(false);
//                         }}
//                         className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all text-left ${
//                           isSelected
//                             ? 'border-green-500 bg-green-50'
//                             : 'border-gray-200 bg-white hover:border-orange-300'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
//                               isSelected
//                                 ? 'border-green-500'
//                                 : 'border-gray-300'
//                             }`}
//                           >
//                             {isSelected && (
//                               <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
//                             )}
//                           </div>
//                           <div>
//                             <p className="font-semibold text-gray-900 text-sm">
//                               {p.tenureLabel}
//                             </p>
//                             {saving > 0 && (
//                               <span className="inline-block mt-0.5 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
//                                 Save ₹{saving}
//                                 {p.priceSuffix || '/mo'}
//                               </span>
//                             )}
//                             {isBestValue && (
//                               <span className="inline-block mt-0.5 ml-1 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
//                                 Best Value
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         {/* <div className="text-right shrink-0">
//                           <p className="font-bold text-gray-900">
//                             ₹{perMonth}
//                             <span className="text-xs font-normal text-gray-500">
//                               {p.priceSuffix || '/mo'}
//                             </span>
//                           </p> */}
//                         <div className="text-right shrink-0">
//                           <p className="font-bold text-gray-900">
//                             ₹{perMonth}
//                             <span className="text-xs font-normal text-gray-500">
//                               {p.priceSuffix || '/mo'}
//                             </span>
//                           </p>
//                           {/* {hasOffer && originalPerMonth !== perMonth && (
//                             <p className="text-xs text-gray-400 line-through">
//                               ₹{originalPerMonth}
//                               {p.priceSuffix || '/mo'}
//                             </p>
//                           )} */}
//                           {hasOffer && originalPerMonth !== perMonth && (
//                             <p className="text-xs text-gray-400 line-through">
//                               ₹{originalPerMonth}
//                               {p.priceSuffix || '/mo'}
//                             </p>
//                           )}
//                         </div>
//                       </button>
//                     );
//                   })}

//                   {/* Custom tenure option */}
//                   <div
//                     className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all ${
//                       selectedPlanId === 'custom'
//                         ? 'border-green-500 bg-green-50'
//                         : 'border-gray-200 bg-white'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
//                           selectedPlanId === 'custom'
//                             ? 'border-green-500'
//                             : 'border-gray-300'
//                         }`}
//                         onClick={() => {
//                           if (customPlan) setSelectedPlanId('custom');
//                         }}
//                       >
//                         {selectedPlanId === 'custom' && (
//                           <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <p className="font-semibold text-gray-900 text-sm">
//                           Custom
//                         </p>
//                         {/* <input
//                           type="number"
//                           min="1"
//                           max={maxCustomMonths || undefined}
//                           placeholder="e.g. 2"
//                           value={customMonths}
//                           onChange={(e) => {
//                             setCustomMonths(e.target.value);
//                             if (e.target.value) setSelectedPlanId('custom');
//                           }}
//                           className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
//                         />
//                         <span className="text-xs text-gray-500">
//                           months{' '}
//                           {maxCustomMonths ? `(max ${maxCustomMonths})` : ''}
//                         </span> */}
//                         <input
//                           type="number"
//                           min={minCustomMonths || 1}
//                           max={maxCustomMonths || undefined}
//                           placeholder={`e.g. ${minCustomMonths || 2}`}
//                           value={customMonths}
//                           onChange={(e) => {
//                             setCustomMonths(e.target.value);
//                             if (e.target.value) setSelectedPlanId('custom');
//                           }}
//                           className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
//                         />
//                         {/* <span className="text-xs text-gray-500">
//                           months{' '}
//                           {minCustomMonths && maxCustomMonths
//                             ? `(${minCustomMonths}-${maxCustomMonths})`
//                             : ''}
//                         </span> */}
//                       </div>
//                     </div>
//                     <div className="text-right shrink-0">
//                       {/* {customPlan ? (
//                         <p className="font-bold text-gray-900">
//                           ₹{customPlan.displayPrice}
//                           <span className="text-xs font-normal text-gray-500">
//                             /mo
//                           </span>
//                         </p>
//                       ) : customMonths &&
//                         maxCustomMonths &&
//                         parseInt(customMonths, 10) > maxCustomMonths ? (
//                         <p className="text-[10px] text-red-500">
//                           Max {maxCustomMonths} months
//                         </p>
//                       ) : (
//                         <p className="text-xs text-gray-400">Enter months</p>
//                       )} */}
//                       {/* {customPlan ? (
//                         <p className="font-bold text-gray-900">
//                           ₹{customPlan.displayPrice}
//                           <span className="text-xs font-normal text-gray-500">
//                             /mo
//                           </span>
//                         </p>
//                       ) : customMonths && minCustomMonths && maxCustomMonths ? ( */}
//                       {customPlan ? (
//                         <>
//                           {/* <p className="font-bold text-gray-900">
//                             ₹
//                             {hasOffer
//                               ? Math.max(
//                                   0,
//                                   Math.round(
//                                     customPlan.displayPrice -
//                                       (customPlan.displayPrice *
//                                         discountPercent) /
//                                         100,
//                                   ),
//                                 )
//                               : customPlan.displayPrice}
//                             <span className="text-xs font-normal text-gray-500">
//                               /mo
//                             </span>
//                           </p> */}
//                           <p className="font-bold text-gray-900">
//                             ₹
//                             {hasOffer
//                               ? Math.max(
//                                   0,
//                                   Math.round(
//                                     customPlan.displayPrice -
//                                       (customPlan.displayPrice *
//                                         discountPercent) /
//                                         100,
//                                   ),
//                                 )
//                               : customPlan.displayPrice}
//                             <span className="text-xs font-normal text-gray-500">
//                               /mo
//                             </span>
//                           </p>
//                           {hasOffer && (
//                             <p className="text-xs text-gray-400 line-through">
//                               ₹{customPlan.displayPrice}/mo
//                             </p>
//                           )}
//                         </>
//                       ) : customMonths && minCustomMonths && maxCustomMonths ? (
//                         <p className="text-[10px] text-red-500">
//                           Enter a value between {minCustomMonths} and{' '}
//                           {maxCustomMonths} months
//                         </p>
//                       ) : (
//                         <p className="text-xs text-gray-400">
//                           Enter{' '}
//                           {minCustomMonths && maxCustomMonths
//                             ? `${minCustomMonths}-${maxCustomMonths}`
//                             : ''}{' '}
//                           months
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-5 py-4 border-t border-gray-100">
//                   <button
//                     type="button"
//                     disabled={selectedPlanId === 'custom' && !customPlan}
//                     onClick={() => setIsTenureModalOpen(false)}
//                     className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
//                       selectedPlanId === 'custom' && !customPlan
//                         ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                         : 'bg-orange-500 text-white hover:bg-orange-600'
//                     }`}
//                   >
//                     CONTINUE
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {isDailyProduct ? (
//             <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
//               <p className="text-xs sm:text-sm font-medium text-gray-800">
//                 Select dates
//               </p>
//               {/* <p className="text-[11px] sm:text-xs text-gray-500">
//                 Tap the first day of your rental — we&apos;ll reserve exactly{' '}
//                 <span className="font-semibold text-gray-700">
//                   {requiredDaysForPlan || '—'} consecutive day
//                   {requiredDaysForPlan !== 1 ? 's' : ''}
//                 </span>{' '}
//                 for this tenure.
//               </p> */}
//               <p className="text-[11px] sm:text-xs text-gray-500">
//                 {isFlexibleDailyProduct ? (
//                   <>
//                     Pick any{' '}
//                     <span className="font-semibold text-gray-700">
//                       delivery
//                     </span>{' '}
//                     and{' '}
//                     <span className="font-semibold text-gray-700">pickup</span>{' '}
//                     date — rent for as many days as you need.
//                   </>
//                 ) : (
//                   <>
//                     Tap the first day of your rental — we&apos;ll reserve
//                     exactly{' '}
//                     <span className="font-semibold text-gray-700">
//                       {requiredDaysForPlan || '—'} consecutive day
//                       {requiredDaysForPlan !== 1 ? 's' : ''}
//                     </span>{' '}
//                     for this tenure.
//                   </>
//                 )}
//               </p>

//               {isFlexibleDailyProduct ? (
//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setSelectingDate('start')}
//                     className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
//                       selectingDate === 'start'
//                         ? 'border-orange-500 bg-orange-50'
//                         : 'border-gray-200 bg-white'
//                     }`}
//                   >
//                     <p className="text-[10px] font-medium text-gray-500">
//                       Delivery Date
//                     </p>
//                     <p className="text-sm font-semibold text-gray-900">
//                       {startDate ? formatRangeLine(startDate) : 'Select'}
//                     </p>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (!startDate) {
//                         pushToast(
//                           'Please select a delivery date first.',
//                           'error',
//                         );
//                         return;
//                       }
//                       setSelectingDate('end');
//                     }}
//                     className={`text-left rounded-lg border-2 px-3 py-2 transition-colors ${
//                       selectingDate === 'end'
//                         ? 'border-orange-500 bg-orange-50'
//                         : 'border-gray-200 bg-white'
//                     }`}
//                   >
//                     <p className="text-[10px] font-medium text-gray-500">
//                       Pickup Date
//                     </p>
//                     <p className="text-sm font-semibold text-gray-900">
//                       {endDate ? formatRangeLine(endDate) : 'Select'}
//                     </p>
//                   </button>
//                 </div>
//               ) : null}

//               <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
//                 <div
//                   className="flex items-center justify-between px-3 py-2.5 sm:py-3 text-white"
//                   style={{ backgroundColor: ORANGE }}
//                 >
//                   <button
//                     type="button"
//                     aria-label="Previous month"
//                     disabled={!canPrevCalendarMonth}
//                     onClick={() =>
//                       setCalendarMonth(
//                         (prev) =>
//                           new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
//                       )
//                     }
//                     className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>
//                   <span className="text-sm sm:text-base font-semibold tracking-wide">
//                     {calendarMonth.toLocaleDateString('en-IN', {
//                       month: 'long',
//                       year: 'numeric',
//                     })}
//                   </span>
//                   <button
//                     type="button"
//                     aria-label="Next month"
//                     disabled={!canNextCalendarMonth}
//                     onClick={() =>
//                       setCalendarMonth(
//                         (prev) =>
//                           new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
//                       )
//                     }
//                     className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 </div>

//                 <div className="px-2 sm:px-3 pt-3 pb-2">
//                   <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
//                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
//                       (w) => (
//                         <div key={w} className="py-1">
//                           {w}
//                         </div>
//                       ),
//                     )}
//                   </div>
//                   <div className="grid grid-cols-7 gap-y-1 text-center">
//                     {calendarCells.map((day, idx) => {
//                       if (!day) {
//                         return (
//                           <div
//                             key={`empty-${idx}`}
//                             className="h-9 sm:h-10"
//                             aria-hidden
//                           />
//                         );
//                       }
//                       const iso = toLocalIso(day);
//                       // const disabled =
//                       //   startOfLocalDay(day).getTime() <
//                       //   earliestSelectableDate.getTime();
//                       const earliestTime = earliestSelectableDate.getTime();
//                       let disabled = Number.isFinite(earliestTime)
//                         ? startOfLocalDay(day).getTime() < earliestTime
//                         : false;
//                       if (
//                         !disabled &&
//                         isFlexibleDailyProduct &&
//                         selectingDate === 'end' &&
//                         startDate
//                       ) {
//                         const minPickupTime = startOfLocalDay(
//                           addLocalDays(parseLocalIso(startDate), 2),
//                         ).getTime();
//                         if (startOfLocalDay(day).getTime() < minPickupTime) {
//                           disabled = true;
//                         }
//                       }
//                       const inRange = isDateInRangeInclusive(
//                         day,
//                         startDate,
//                         endDate,
//                       );
//                       const isTodayCell = iso === todayIso;
//                       return (
//                         <div
//                           key={iso}
//                           className="flex items-center justify-center p-0.5"
//                         >
//                           <button
//                             type="button"
//                             disabled={disabled}
//                             onClick={() => handleCalendarDayClick(day)}
//                             className={[
//                               'w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center justify-center',
//                               disabled
//                                 ? 'text-gray-300 cursor-not-allowed bg-gray-50'
//                                 : inRange
//                                   ? 'text-white shadow-sm'
//                                   : isTodayCell
//                                     ? 'ring-2 ring-orange-300 bg-orange-50 text-gray-900 hover:bg-orange-100'
//                                     : 'bg-gray-100 text-gray-800 hover:bg-orange-100',
//                             ].join(' ')}
//                             style={
//                               inRange && !disabled
//                                 ? {
//                                     backgroundColor: ORANGE,
//                                     opacity:
//                                       isFlexibleDailyProduct &&
//                                       iso !== startDate &&
//                                       iso !== endDate
//                                         ? 0.45
//                                         : 1,
//                                   }
//                                 : undefined
//                             }
//                           >
//                             {day.getDate()}
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//                 {startDate && endDate ? (
//                   <div className="px-3 pb-2 text-center text-xs sm:text-sm text-gray-800">
//                     {/* <span className="font-medium">
//                       {formatRangeLine(startDate)}
//                     </span>
//                     <span
//                       className="mx-2 font-semibold"
//                       style={{ color: ORANGE }}
//                     >
//                       to
//                     </span>
//                     <span className="font-medium">
//                       {formatRangeLine(endDate)}
//                     </span> */}
//                     {isFlexibleDailyProduct ? (
//                       <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-center gap-4 text-center">
//                         <div className="shrink-0 leading-none">
//                           <span className="text-3xl sm:text-4xl font-bold text-gray-900">
//                             {String(selectedDaysCount).padStart(2, '0')}
//                           </span>
//                           <span className="ml-1 text-xs sm:text-sm text-gray-500 align-super">
//                             Day{selectedDaysCount !== 1 ? 's' : ''}
//                           </span>
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-xs sm:text-sm text-gray-800 font-medium">
//                             Chargeable Period:
//                           </p>
//                           {selectedDaysCount > 0 ? (
//                             <p className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
//                               <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
//                               {formatRangeLine(chargeableStartDate)} -{' '}
//                               {formatRangeLine(chargeableEndDate)}
//                             </p>
//                           ) : (
//                             <p className="text-[11px] text-red-600 mt-0.5">
//                               Pickup date must be at least 2 days after delivery
//                               date.
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>
//                 ) : (
//                   <div className="px-3 pb-2 text-center text-[11px] text-gray-400">
//                     {isFlexibleDailyProduct
//                       ? 'Select delivery and pickup dates to see your total'
//                       : 'Pick a start date to see your rental window'}
//                   </div>
//                 )}

//                 <div className="flex items-start gap-2 px-3 pb-3 text-[10px] sm:text-xs text-gray-500 border-t border-gray-100 pt-2">
//                   <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
//                   <span>
//                     <strong>Same-day delivery</strong> is available between{' '}
//                     <strong>3 PM and 10 PM</strong>. For future dates, you can
//                     select your preferred delivery time slot during checkout.
//                     <strong> Pickup</strong> is scheduled between{' '}
//                     <strong>9 AM and 1 PM</strong>.
//                   </span>
//                 </div>
//               </div>

//               {/* {startDate && endDate && !isValidDailyRange ? (
//                 <p className="text-[11px] sm:text-xs text-red-600">
//                   Please select exactly {requiredDaysForPlan} consecutive day
//                   {requiredDaysForPlan > 1 ? 's' : ''} for this tenure.
//                 </p>
//               ) : null} */}
//               {(() => {
//                 const lv = product?.logisticsVerification || {};
//                 const n = Number(lv.deliveryTimelineValue);
//                 const unit = String(
//                   lv.deliveryTimelineUnit || 'Days',
//                 ).toLowerCase();
//                 const deliveryDays =
//                   Number.isFinite(n) && n > 0
//                     ? unit === 'hours'
//                       ? Math.ceil(n / 24)
//                       : n
//                     : 0;
//                 const earliestDate =
//                   deliveryDays > 0
//                     ? addLocalDays(new Date(), deliveryDays)
//                     : null;
//                 const earliestIso = earliestDate
//                   ? toLocalIso(earliestDate)
//                   : null;
//                 const earliestFormatted = earliestDate
//                   ? earliestDate.toLocaleDateString('en-IN', {
//                       day: 'numeric',
//                       month: 'short',
//                       year: '2-digit',
//                     })
//                   : null;
//                 return deliveryDays > 0 && !startDate ? (
//                   <p className="text-[11px] sm:text-xs text-red-600 mt-1">
//                     This product has a {deliveryDays}-day delivery time.
//                     Earliest available date is{' '}
//                     <span className="font-semibold">{earliestFormatted}</span>.
//                   </p>
//                 ) : !isFlexibleDailyProduct &&
//                   startDate &&
//                   endDate &&
//                   !isValidDailyRange ? (
//                   <p className="text-[11px] sm:text-xs text-red-600">
//                     Please select exactly {requiredDaysForPlan} consecutive day
//                     {requiredDaysForPlan !== 1 ? 's' : ''} for this tenure.
//                   </p>
//                 ) : null;
//               })()}
//             </div>
//           ) : null}
//         </div>

//         {/* ── Price Box ── */}
//         <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-5 space-y-3 sm:space-y-4">
//           {/* <div className="flex justify-between text-xs sm:text-sm text-gray-600">
//             <span>Refundable Deposit</span>
//             <span className="text-green-600 font-medium text-sm sm:text-base">
//               ₹{Number(product?.refundableDeposit || 0).toLocaleString('en-IN')}
//             </span>
//           </div> */}

//           <div className="flex justify-between text-xs sm:text-sm text-gray-600">
//             <span className="flex items-center gap-1.5">
//               <Shield className="w-4 h-4 text-[#10B981]" />
//               Refundable Deposit
//             </span>

//             <span className="text-[#10B981] font-medium text-sm sm:text-base">
//               ₹{Number(product?.refundableDeposit || 0).toLocaleString('en-IN')}
//             </span>
//           </div>

//           <div className="flex justify-between items-center bg-white border border-orange-300 p-3 sm:p-4 rounded-lg gap-2">
//             <div className="min-w-0">
//               <span className="font-semibold text-sm sm:text-base">
//                 Total Payable Now
//               </span>
//               <p className="text-[10px] sm:text-xs text-gray-500 font-normal">
//                 {plan?.periodUnit === 'day'
//                   ? '(Rental period + Deposit)'
//                   : '(Tenure + Refundable Deposit)'}
//               </p>
//             </div>
//             <span className="text-orange-500 font-semibold text-lg shrink-0">
//               ₹
//               {(
//                 totalRentalForTenure + Number(product?.refundableDeposit || 0)
//               ).toLocaleString('en-IN')}
//             </span>
//           </div>
//         </div>

//         {/* ── Delivery ── */}
//         <div className="bg-[#EFF6FF] mt-4 sm:mt-5 border-2 border-[#BEDBFF] p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
//           {(() => {
//             const lv = product?.logisticsVerification || {};
//             const n = Number(lv.deliveryTimelineValue);
//             const unit = String(
//               lv.deliveryTimelineUnit || 'Days',
//             ).toLowerCase();
//             // if (Number.isFinite(n) && n > 0) {
//             //   return (
//             //     <>
//             //       <span className="font-semibold">
//             //         Estimated delivery: {n}{' '}
//             //         {unit === 'hours' ? 'hours' : 'days'}
//             //       </span>
//             //       <p className="text-gray-600 mt-0.5">
//             //         {lv.city
//             //           ? `Service area includes ${lv.city}.`
//             //           : 'Free delivery and setup included'}
//             //       </p>
//             //     </>
//             //   );
//             // }
//             if (Number.isFinite(n) && n > 0) {
//               return (
//                 <div className="flex items-start gap-3">
//                   <div className="w-9 h-9 rounded-lg bg-blue-200 flex items-center justify-center shrink-0">
//                     <Truck className="w-4 h-4 text-[#2563EB]" />
//                   </div>

//                   <div>
//                     <span className="font-semibold block">
//                       Estimated delivery: {n}{' '}
//                       {unit === 'hours' ? 'hours' : 'day'}
//                     </span>

//                     <p className="text-gray-600 mt-0.5">
//                       {lv.city
//                         ? `Service area includes ${lv.city}.`
//                         : 'Free delivery and setup included'}
//                     </p>
//                   </div>
//                 </div>
//               );
//             }
//             return (
//               <>
//                 <span className="font-medium">Delivery</span>
//                 <p className="text-gray-600 mt-0.5">
//                   Contact the renter after checkout for delivery scheduling.
//                 </p>
//               </>
//             );
//           })()}
//         </div>

//         {/* ── CTA Buttons ── */}
//         <button
//           type="button"
//           onClick={handleRentNow}
//           disabled={currentStock <= 0 || (isDailyProduct && !isValidDailyRange)}
//           // className="w-full bg-orange-500 text-white py-2.5 sm:py-3 rounded-lg mt-4 sm:mt-6 font-medium text-sm sm:text-base hover:bg-orange-600 transition-colors"
//           className={`w-full py-2.5 sm:py-3 rounded-lg mt-4 sm:mt-6 font-medium text-sm sm:text-base transition-colors ${
//             currentStock <= 0
//               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               : 'bg-orange-500 text-white hover:bg-orange-600'
//           }`}
//         >
//           Rent Now
//         </button>

//         <button
//           type="button"
//           onClick={handleAddToCart}
//           disabled={currentStock <= 0 || (isDailyProduct && !isValidDailyRange)}
//           // className="w-full border border-orange-500 text-[#F97316] py-2.5 sm:py-3 rounded-lg mt-3 sm:mt-4 font-medium text-sm sm:text-base hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
//           className={`w-full py-2.5 sm:py-3 rounded-lg mt-3 sm:mt-4 font-medium text-sm sm:text-base transition-colors flex items-center justify-center gap-2 ${
//             currentStock <= 0
//               ? 'border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
//               : 'border border-orange-500 text-[#F97316] hover:bg-orange-50'
//           }`}
//         >
//           {/* <ShoppingCart
//             className={`w-4 h-4 ${
//               currentStock <= 0 ? 'text-gray-500' : 'text-[#F97316]'
//             }`}
//           /> */}
//           Add to Cart
//         </button>

//         {/* Total cost summary */}
//         {/* <div className="bg-blue-50 mt-4 sm:mt-5 p-3 sm:p-4 text-center rounded-lg text-xs sm:text-sm">
//           <p className="text-gray-500">
//             Total rental for {tenureSummaryText}:{' '}
//             <span className="font-semibold text-black">
//               ₹{totalRentalForTenure.toLocaleString('en-IN')}
//             </span>
//             {plan?.periodUnit === 'day' ? (
//               <span className="block text-[10px] text-gray-400 mt-1">
//                 Exact vendor price for {plan.rawDays} day
//                 {plan.rawDays > 1 ? 's' : ''}
//               </span>
//             ) : null}
//           </p>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default RentPrdctMain;

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Heart,
  Calendar,
  Package,
} from 'lucide-react';
import { addToCart } from '@/store/slices/cartSlice';
import {
  useAuthModal,
  AUTH_REDIRECT_SESSION_KEY,
} from '@/contexts/AuthModalContext';
import {
  apiGetProductById,
  apiGetMyWishlist,
  apiToggleWishlist,
} from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ─── Static fallback data (shown when API field is missing) ──────────────────
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
  'https://images.unsplash.com/photo-1616628182509-6c6c4c4f8d2d',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
];

const STATIC_PLANS = [
  {
    id: 'm-3',
    tenureLabel: '3 Months',
    rentalMonths: 3,
    rawDays: 0,
    periodUnit: 'month',
    price: 799,
    displayPrice: Math.round(799 / 3),
    label: '',
    priceSuffix: '/month',
  },
  {
    id: 'm-6',
    tenureLabel: '6 Months',
    rentalMonths: 6,
    rawDays: 0,
    periodUnit: 'month',
    price: 699,
    displayPrice: Math.round(699 / 6),
    label: '',
    priceSuffix: '/month',
  },
  {
    id: 'm-12',
    tenureLabel: '9 Months',
    rentalMonths: 9,
    rawDays: 0,
    periodUnit: 'month',
    price: 499,
    displayPrice: Math.round(499 / 9),
    label: '',
    priceSuffix: '/month',
  },
];

// ─── Parse price string like "1599/month" or "20000" → number ───────────────
function parsePrice(raw) {
  if (!raw) return null;
  const num = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? null : num;
}

function tierRentAmount(cfg) {
  const cr = Number(cfg?.customerRent);
  if (Number.isFinite(cr) && cr > 0) return cr;
  const pd = Number(cfg?.pricePerDay);
  if (Number.isFinite(pd) && pd > 0) return pd;
  return 0;
}

// ─── Build 3 rental plans from a base price (fallback) ─────────────────────
function buildPlans(basePrice) {
  const p3 = Math.round(basePrice * 1.15);
  const p6 = basePrice;
  const p12 = Math.round(basePrice * 0.75);
  return [
    {
      id: 'm-3',
      tenureLabel: '3 Months',
      rentalMonths: 3,
      rawDays: 0,
      periodUnit: 'month',
      price: p3,
      displayPrice: Math.round(p3 / 3),
      label: '',
      priceSuffix: '/month',
    },
    {
      id: 'm-6',
      tenureLabel: '6 Months',
      rentalMonths: 6,
      rawDays: 0,
      periodUnit: 'month',
      price: p6,
      displayPrice: Math.round(p6 / 6),
      label: '',
      priceSuffix: '/month',
    },
    {
      id: 'm-12',
      tenureLabel: '12 Months',
      rentalMonths: 12,
      rawDays: 0,
      periodUnit: 'month',
      price: p12,
      displayPrice: Math.round(p12 / 12),
      label: '',
      priceSuffix: '/month',
    },
  ];
}

/** Maps vendor `rentalConfigurations` (customerRent + months/days) → UI plans.
 * Prefers the selected variant's own rentalConfigurations (custom/manual
 * per-variant rent listings); falls back to the product-level array for
 * template-based / legacy single-price rent listings. */
function normalizeRentalPlansFromProduct(product, variant) {
  const variantArr = Array.isArray(variant?.rentalConfigurations)
    ? variant.rentalConfigurations
    : [];
  const arr = variantArr.length
    ? variantArr
    : Array.isArray(product?.rentalConfigurations)
      ? product.rentalConfigurations
      : [];
  const out = [];
  arr.forEach((cfg, idx) => {
    const periodUnit = cfg?.periodUnit === 'day' ? 'day' : 'month';
    const months = Number(cfg?.months) || 0;
    const days = Number(cfg?.days) || 0;
    // const price = tierRentAmount(cfg);
    // if (!Number.isFinite(price) || price <= 0) return;

    // const id =
    //   periodUnit === 'day' && days > 0
    //     ? `d-${days}-${idx}`
    //     : months > 0
    //       ? `m-${months}-${idx}`
    //       : `tier-${idx}`;

    // const tenureLabel =
    //   periodUnit === 'day' && days > 0
    //     ? `${days} Days`
    //     : months > 0
    //       ? `${months} Months`
    //       : `Option ${idx + 1}`;

    // const perUnitPrice =
    //   periodUnit === 'day' && days > 0
    //     ? Math.round(price / days)
    //     : months > 0
    //       ? Math.round(price / months)
    //       : price;

    // out.push({
    //   id,
    //   tenureLabel,
    //   rentalMonths: months > 0 ? months : Math.max(1, Math.ceil(days / 30)),
    //   rawDays: days,
    //   periodUnit,
    //   price, // total tenure price (used for cart/checkout)
    //   displayPrice: perUnitPrice, // per month / per day (shown in UI)
    //   label: String(cfg?.label || '').trim(),
    //   priceSuffix: periodUnit === 'day' && days > 0 ? '/day' : '/month',
    // });

    const rate = tierRentAmount(cfg);
    if (!Number.isFinite(rate) || rate <= 0) return;

    const id =
      periodUnit === 'day' && days > 0
        ? `d-${days}-${idx}`
        : months > 0
          ? `m-${months}-${idx}`
          : `tier-${idx}`;

    const tenureLabel =
      periodUnit === 'day' && days > 0
        ? `${days} Days`
        : months > 0
          ? `${months} Months`
          : `Option ${idx + 1}`;

    // customerRent / pricePerDay is stored as the PER-UNIT rate (per month or
    // per day), not the total tenure price — so multiply to get the total.
    const totalPrice =
      periodUnit === 'day' && days > 0
        ? Math.round(rate * days)
        : months > 0
          ? Math.round(rate * months)
          : rate;

    out.push({
      id,
      tenureLabel,
      rentalMonths: months > 0 ? months : Math.max(1, Math.ceil(days / 30)),
      rawDays: days,
      periodUnit,
      price: totalPrice, // total tenure price (used for cart/checkout)
      displayPrice: rate, // per month / per day (shown in UI)
      label: String(cfg?.label || '').trim(),
      priceSuffix: periodUnit === 'day' && days > 0 ? '/day' : '/month',
    });
  });
  return out;
}

// ─── Calendar helpers (daily rental date picker) ─────────────────────────────
const ORANGE = '#FF7000';

function localTodayIso() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

// ────────────────────────────────────────────────────────────────────────────
const RentPrdctMain = ({
  product,
  offer,
  selectedVariantIdx,
  setSelectedVariantIdx,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { openAuth } = useAuthModal();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [wishedIds, setWishedIds] = useState([]);
  const [togglingId, setTogglingId] = useState('');
  const { items } = useSelector((s) => s.cart);
  // const { items } = useSelector((s) => s.cart || { items: [] });
  const { pushToast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isTenureModalOpen, setIsTenureModalOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [isAutoExtensionModalOpen, setIsAutoExtensionModalOpen] =
    useState(false);
  const [customMonths, setCustomMonths] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Only used for the new flexible daily product: tracks whether the next
  // calendar tap should set the Delivery Date or the Pickup Date.
  const [selectingDate, setSelectingDate] = useState('start');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  // ── Real data first, static fallback second ──────────────────────────────
  const productName = product?.productName || 'Rental product';
  const category = product?.category || '—';
  const subCategory = product?.subCategory || '—';

  const vendorDisplayName = useMemo(() => {
    const v = product?.vendorId;
    if (v && typeof v === 'object' && String(v.fullName || '').trim()) {
      return String(v.fullName).trim();
    }
    const owner = String(
      product?.logisticsVerification?.inventoryOwnerName || '',
    ).trim();
    if (owner) return owner;
    return 'Verified partner';
  }, [product?.vendorId, product?.logisticsVerification?.inventoryOwnerName]);

  // Images: use vendor uploaded images[] first, fallback to image field and static samples.
  // const images = useMemo(() => {
  //   const fromDb = Array.isArray(product?.images)
  //     ? product.images.filter(Boolean)
  //     : [];
  //   if (fromDb.length > 0) return fromDb.slice(0, 10);
  //   if (product?.image) return [product.image, ...FALLBACK_IMAGES.slice(0, 3)];
  //   return FALLBACK_IMAGES;
  // }, [product?.images, product?.image]);
  // const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants],
  );

  const images = useMemo(() => {
    const fromDb = Array.isArray(product?.images)
      ? product.images.filter(Boolean)
      : [];
    const allImgs =
      fromDb.length > 0
        ? fromDb
        : product?.image
          ? [product.image, ...FALLBACK_IMAGES.slice(0, 3)]
          : FALLBACK_IMAGES;

    // If multiple variants exist, split images per variant
    if (variants.length > 1 && allImgs.length > 1) {
      const perVariant = Math.ceil(allImgs.length / variants.length);
      const start = selectedVariantIdx * perVariant;
      const slice = allImgs.slice(start, start + perVariant);
      return slice.length > 0 ? slice : allImgs.slice(0, perVariant);
    }

    return allImgs.slice(0, 10);
  }, [product?.images, product?.image, variants, selectedVariantIdx]);

  // const [mainImg, setMainImg] = useState(images[0]);
  // const [thumbStart, setThumbStart] = useState(0);
  // const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);\
  const [mainImg, setMainImg] = useState(images[0]);
  const THUMBS_PER_VIEW = 5;
  useEffect(() => {
    setMainImg(images[0]);
  }, [images]);

  useEffect(() => {
    setThumbStart(0);
  }, [selectedVariantIdx]);
  useEffect(() => {
    setThumbStart(0);
  }, [images]);

  const maxThumbStart = Math.max(0, images.length - THUMBS_PER_VIEW);
  const visibleThumbs = images.slice(thumbStart, thumbStart + THUMBS_PER_VIEW);

  // Current index of mainImg within images[] — used for main-image chevrons & swipe
  const currentImgIdx = Math.max(0, images.indexOf(mainImg));

  const goToImage = (idx) => {
    if (!images.length) return;
    const safeIdx = ((idx % images.length) + images.length) % images.length; // wrap around
    setMainImg(images[safeIdx]);
    // Keep thumbnail strip in sync so the active thumb stays visible
    if (safeIdx < thumbStart) {
      setThumbStart(safeIdx);
    } else if (safeIdx >= thumbStart + THUMBS_PER_VIEW) {
      setThumbStart(Math.max(0, safeIdx - THUMBS_PER_VIEW + 1));
    }
  };

  const goPrevImage = () => goToImage(currentImgIdx - 1);
  const goNextImage = () => goToImage(currentImgIdx + 1);

  // Touch swipe support for mobile (finger swipe on main image)
  const touchStartXRef = React.useRef(null);
  const touchDeltaXRef = React.useRef(0);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartXRef.current == null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    const SWIPE_THRESHOLD = 40; // px
    if (Math.abs(touchDeltaXRef.current) > SWIPE_THRESHOLD) {
      if (touchDeltaXRef.current < 0) {
        goNextImage(); // swiped left → next image
      } else {
        goPrevImage(); // swiped right → previous image
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const plans = useMemo(() => {
    const fromVendor = normalizeRentalPlansFromProduct(
      product,
      variants[selectedVariantIdx],
    );
    if (fromVendor.length) return fromVendor;
    const realPrice = parsePrice(product?.price);
    if (realPrice) return buildPlans(realPrice);
    return STATIC_PLANS;
  }, [product, variants, selectedVariantIdx]);

  const maxCustomMonths = useMemo(() => {
    const sorted = [...plans]
      .filter((p) => p.periodUnit !== 'day')
      .sort((a, b) => a.rentalMonths - b.rentalMonths);
    return sorted.length ? sorted[sorted.length - 1].rentalMonths : 0;
  }, [plans]);

  const minCustomMonths = useMemo(() => {
    const sorted = [...plans]
      .filter((p) => p.periodUnit !== 'day')
      .sort((a, b) => a.rentalMonths - b.rentalMonths);
    return sorted.length ? sorted[0].rentalMonths : 0;
  }, [plans]);

  const customPlan = useMemo(() => {
    const m = parseInt(customMonths, 10);
    if (!m || m <= 0) return null;
    if (minCustomMonths && m < minCustomMonths) return null;
    if (maxCustomMonths && m > maxCustomMonths) return null;
    const sorted = [...plans]
      .filter((p) => p.periodUnit !== 'day')
      .sort((a, b) => a.rentalMonths - b.rentalMonths);
    if (sorted.length < 2) return null;

    let lower = sorted[0];
    let upper = sorted[sorted.length - 1];
    for (let i = 0; i < sorted.length - 1; i++) {
      if (m >= sorted[i].rentalMonths && m <= sorted[i + 1].rentalMonths) {
        lower = sorted[i];
        upper = sorted[i + 1];
        break;
      }
    }
    if (m < sorted[0].rentalMonths) {
      lower = sorted[0];
      upper = sorted[1];
    }
    if (m > sorted[sorted.length - 1].rentalMonths) {
      lower = sorted[sorted.length - 2];
      upper = sorted[sorted.length - 1];
    }

    const slope =
      (upper.displayPrice - lower.displayPrice) /
      (upper.rentalMonths - lower.rentalMonths || 1);
    const perMonth = Math.max(
      1,
      Math.round(lower.displayPrice + slope * (m - lower.rentalMonths)),
    );

    return {
      id: 'custom',
      tenureLabel: `${m} Months`,
      rentalMonths: m,
      rawDays: 0,
      periodUnit: 'month',
      price: perMonth * m,
      displayPrice: perMonth,
      label: 'Custom',
      priceSuffix: '/month',
    };
  }, [customMonths, plans]);

  // const defaultPlanId = plans[0]?.id || '';
  // useEffect(() => {
  //   setSelectedPlanId((prev) =>
  //     plans.some((p) => p.id === prev) ? prev : defaultPlanId,
  //   );
  // }, [defaultPlanId, plans]);

  /** Default to the longest tenure (best value) rather than the shortest,
   * so the price shown on load matches the vendor's "POPULAR"/best-value
   * tier instead of the first (often shortest) saved tenure. */
  const longestPlan = useMemo(() => {
    if (!plans.length) return null;
    return [...plans].sort((a, b) => {
      const lenA =
        a.periodUnit === 'day' ? a.rawDays || 0 : a.rentalMonths || 0;
      const lenB =
        b.periodUnit === 'day' ? b.rawDays || 0 : b.rentalMonths || 0;
      return lenB - lenA;
    })[0];
  }, [plans]);
  const defaultPlanId = longestPlan?.id || plans[0]?.id || '';
  useEffect(() => {
    setSelectedPlanId((prev) =>
      plans.some((p) => p.id === prev) ? prev : defaultPlanId,
    );
  }, [defaultPlanId, plans]);
  // const plan = useMemo(() => {
  //   if (selectedPlanId === 'custom' && customPlan) return customPlan;
  //   return plans.find((p) => p.id === selectedPlanId) || plans[0];
  // }, [plans, selectedPlanId, customPlan]);
  const plan = useMemo(() => {
    if (selectedPlanId === 'custom' && customPlan) return customPlan;
    return (
      plans.find((p) => p.id === selectedPlanId) || longestPlan || plans[0]
    );
  }, [plans, selectedPlanId, customPlan, longestPlan]);
  const isDailyProduct = useMemo(
    () => plans.some((p) => p.periodUnit === 'day'),
    [plans],
  );

  // const requiredDaysForPlan = useMemo(() => {
  //   if (!plan || plan.periodUnit !== 'day') return 0;
  //   return plan.rawDays || 0;
  // }, [plan]);
  // const requiredDaysForPlan = useMemo(() => {
  //   if (!plan || plan.periodUnit !== 'day') return 0;
  //   return plan.rawDays || 0;
  // }, [plan]);

  // // True only for products created with the NEW single day-rate custom
  // // listing (exactly one day-wise plan). Monthly & old multi-tenure daily
  // // products are untouched and keep the old fixed-tenure calendar.
  // const isFlexibleDailyProduct = useMemo(
  //   () => isDailyProduct && plans.length === 1 && plan?.periodUnit === 'day',
  //   [isDailyProduct, plans, plan],
  // );

  // const selectedDaysCount = useMemo(() => {
  //   if (!startDate || !endDate) return 0;
  //   const s = parseLocalIso(startDate);
  //   const e = parseLocalIso(endDate);
  //   if (!s || !e) return 0;
  //   const diff =
  //     Math.round(
  //       (startOfLocalDay(e).getTime() - startOfLocalDay(s).getTime()) /
  //         (1000 * 60 * 60 * 24),
  //     ) + 1;
  //   return diff > 0 ? diff : 0;
  // }, [startDate, endDate]);

  const requiredDaysForPlan = useMemo(() => {
    if (!plan || plan.periodUnit !== 'day') return 0;
    return plan.rawDays || 0;
  }, [plan]);

  // True only for products created with the NEW single day-rate custom
  // listing (exactly one day-wise plan). Monthly & old multi-tenure daily
  // products are untouched and keep the old fixed-tenure calendar.
  const isFlexibleDailyProduct = useMemo(
    () => isDailyProduct && plans.length === 1 && plan?.periodUnit === 'day',
    [isDailyProduct, plans, plan],
  );

  // Chargeable window excludes the delivery day and the pickup day — only
  // the days strictly in between are billed.
  const chargeableStartDate = useMemo(() => {
    if (!isFlexibleDailyProduct || !startDate) return '';
    return toLocalIso(addLocalDays(parseLocalIso(startDate), 1));
  }, [isFlexibleDailyProduct, startDate]);

  const chargeableEndDate = useMemo(() => {
    if (!isFlexibleDailyProduct || !endDate) return '';
    return toLocalIso(addLocalDays(parseLocalIso(endDate), -1));
  }, [isFlexibleDailyProduct, endDate]);

  const selectedDaysCount = useMemo(() => {
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
    if (isFlexibleDailyProduct) {
      // Delivery day and pickup day are free — only days in between count.
      const chargeable = fullDays - 2;
      return chargeable > 0 ? chargeable : 0;
    }
    return fullDays;
  }, [startDate, endDate, isFlexibleDailyProduct]);

  const todayIso = useMemo(() => localTodayIso(), []);

  const maxDateIso = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return toLocalIso(d);
  }, []);

  const deliveryDaysCount = useMemo(() => {
    const lv = product?.logisticsVerification || {};
    const n = Number(lv.deliveryTimelineValue);
    const unit = String(lv.deliveryTimelineUnit || 'Days').toLowerCase();
    return Number.isFinite(n) && n > 0
      ? unit === 'hours'
        ? Math.ceil(n / 24)
        : n
      : 0;
  }, [product?.logisticsVerification]);

  // const earliestSelectableDate = useMemo(
  //   () => startOfLocalDay(addLocalDays(new Date(), deliveryDaysCount)),
  //   [deliveryDaysCount],
  // );
  const earliestSelectableDate = useMemo(() => {
    const n = Number(deliveryDaysCount);
    const safeDays = Number.isFinite(n) && n > 0 ? n : 0;
    return startOfLocalDay(addLocalDays(new Date(), safeDays));
  }, [deliveryDaysCount]);

  // useEffect(() => {
  //   // Reset date range whenever plan changes (for daily products)
  //   setStartDate('');
  //   setEndDate('');
  //   const n = new Date();
  //   setCalendarMonth(new Date(n.getFullYear(), n.getMonth(), 1));
  // }, [plan?.id]);
  useEffect(() => {
    // Reset date range whenever plan changes (for daily products)
    setStartDate('');
    setEndDate('');
    setSelectingDate('start');
    const lv = product?.logisticsVerification || {};
    const deliveryN = Number(lv.deliveryTimelineValue);
    const deliveryUnit = String(
      lv.deliveryTimelineUnit || 'Days',
    ).toLowerCase();
    const deliveryDays =
      Number.isFinite(deliveryN) && deliveryN > 0
        ? deliveryUnit === 'hours'
          ? Math.ceil(deliveryN / 24)
          : deliveryN
        : 0;
    const earliest = addLocalDays(new Date(), deliveryDays);
    // Open calendar on the month that actually has selectable dates
    setCalendarMonth(new Date(earliest.getFullYear(), earliest.getMonth(), 1));
  }, [plan?.id, product?.logisticsVerification]);

  // const discountPercent = Number(offer?.discountPercent || 0);
  // const hasOffer = discountPercent > 0;
  // Admin offers reduce the platform's own fee cut and pass that saving
  // straight to the customer as a % of price; vendor offers already store
  // a plain discountPercent. Resolve both into one number so everything
  // downstream keeps working unchanged.
  const PLATFORM_FEE_PERCENT = 15;
  const discountPercent = useMemo(() => {
    if (!offer) return 0;
    if (offer.source === 'admin') {
      return Math.min(
        PLATFORM_FEE_PERCENT,
        Number(offer.platformFeeReductionPercent || 0),
      );
    }
    return Number(offer.discountPercent || 0);
  }, [offer]);
  const hasOffer = discountPercent > 0;
  const effectivePlanPrice = useMemo(() => {
    if (!plan) return 0;
    const base = plan.displayPrice ?? plan.price;
    return hasOffer
      ? Math.max(0, Math.round(base - (base * discountPercent) / 100))
      : base;
  }, [plan, hasOffer, discountPercent]);

  // Total for the full tenure (used in cart & "Total Payable Now")
  // const effectivePlanTotalPrice = useMemo(() => {
  //   if (!plan) return 0;
  //   return hasOffer
  //     ? Math.max(
  //         0,
  //         Math.round(plan.price - (plan.price * discountPercent) / 100),
  //       )
  //     : plan.price;
  // }, [plan, hasOffer, discountPercent]);

  // const effectivePlanTotalPrice = useMemo(() => {
  //   if (!plan) return 0;
  //   if (isFlexibleDailyProduct) {
  //     const days = selectedDaysCount || 1;
  //     const base = (plan.displayPrice || plan.price || 0) * days;
  //     return hasOffer
  //       ? Math.max(0, Math.round(base - (base * discountPercent) / 100))
  //       : base;
  //   }
  //   return hasOffer
  //     ? Math.max(
  //         0,
  //         Math.round(plan.price - (plan.price * discountPercent) / 100),
  //       )
  //     : plan.price;
  // }, [
  //   plan,
  //   hasOffer,
  //   discountPercent,
  //   isFlexibleDailyProduct,
  //   selectedDaysCount,
  // ]);

  const effectivePlanTotalPrice = useMemo(() => {
    if (!plan) return 0;
    if (isFlexibleDailyProduct) {
      const days = selectedDaysCount || 1;
      // Derive total from the already-rounded per-day price so it always
      // matches what's shown in the ₹/day box.
      return effectivePlanPrice * days;
    }
    // Derive total from the already-rounded per-month price (effectivePlanPrice)
    // instead of rounding the discounted total independently — keeps the
    // "Total Payable Now" box perfectly consistent with the ₹/mo price shown.
    const units =
      plan.periodUnit === 'day' && plan.rawDays > 0
        ? plan.rawDays
        : plan.rentalMonths || 1;
    return effectivePlanPrice * units;
  }, [plan, effectivePlanPrice, isFlexibleDailyProduct, selectedDaysCount]);

  const strikePrice = useMemo(() => {
    if (!plans.length) return 0;
    return Math.max(...plans.map((p) => p.price));
  }, [plans]);

  // Pre-offer (original) price — mirrors effectivePlanPrice/effectivePlanTotalPrice
  // logic exactly, minus the discount, so it matches whatever gets stored in
  // pricePerDay for the corresponding branch.
  const originalPricePerDay = useMemo(() => {
    if (!plan) return 0;
    const baseUnit = plan.displayPrice ?? plan.price ?? 0;
    if (plan.periodUnit === 'day') {
      if (isFlexibleDailyProduct) {
        const days = selectedDaysCount || 1;
        return baseUnit * days;
      }
      return plan.price;
    }
    return baseUnit;
  }, [plan, isFlexibleDailyProduct, selectedDaysCount]);

  // const rentLineLabel =
  //   plan?.periodUnit === 'day' ? 'Rental rate' : 'Monthly rent';
  const rentLineLabel =
    plan?.periodUnit === 'day' ? 'Rental rate' : 'Monthly rent';

  useEffect(() => {
    if (
      isTenureModalOpen ||
      isCancellationModalOpen ||
      isAutoExtensionModalOpen
    ) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isTenureModalOpen, isCancellationModalOpen, isAutoExtensionModalOpen]);

  const [currentStock, setCurrentStock] = useState(
    typeof product?.stock === 'number' ? product.stock : 0,
  );

  useEffect(() => {
    let isMounted = true;
    const id = product?._id;
    if (!id) return;

    // Refresh stock dynamically when opening product details.
    apiGetProductById(id)
      .then((res) => {
        const stock = res.data?.product?.stock;
        if (!isMounted) return;
        setCurrentStock(typeof stock === 'number' ? stock : 0);
      })
      .catch(() => {
        if (!isMounted) return;
        setCurrentStock(typeof product?.stock === 'number' ? product.stock : 0);
      });

    return () => {
      isMounted = false;
    };
  }, [product?._id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishedIds([]);
      return;
    }

    let mounted = true;

    apiGetMyWishlist()
      .then((res) => {
        if (!mounted) return;

        setWishedIds(
          Array.isArray(res.data?.wishedProductIds)
            ? res.data.wishedProductIds
            : [],
        );
      })
      .catch(() => {
        if (!mounted) return;
        setWishedIds([]);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const isWished = (id) => wishedIds.includes(String(id));

  const onToggleWishlist = async () => {
    if (!isAuthenticated || !product?._id) return;

    setTogglingId(String(product._id));

    try {
      const res = await apiToggleWishlist(product._id);
      const wished = !!res.data?.wished;

      setWishedIds((prev) => {
        const pid = String(product._id);

        if (wished) {
          return prev.includes(pid) ? prev : [...prev, pid];
        }

        return prev.filter((x) => x !== pid);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setTogglingId('');
    }
  };

  /** Cart / checkout tenure: months for month-plans; day count for day-plans. */
  // const activeRentalMonths = useMemo(() => {
  //   if (!plan) return 1;
  //   if (plan.periodUnit === 'day' && plan.rawDays > 0) return plan.rawDays;
  //   return plan.rentalMonths || 1;
  // }, [plan]);

  const activeRentalMonths = useMemo(() => {
    if (!plan) return 1;
    if (isFlexibleDailyProduct) return selectedDaysCount || 1;
    if (plan.periodUnit === 'day' && plan.rawDays > 0) return plan.rawDays;
    return plan.rentalMonths || 1;
  }, [plan, isFlexibleDailyProduct, selectedDaysCount]);
  const totalRentalForTenure = useMemo(() => {
    if (!plan) return 0;
    return effectivePlanTotalPrice;
  }, [plan, effectivePlanTotalPrice]);

  // const tenureSummaryText = useMemo(() => {
  //   if (!plan) return '';
  //   if (plan.periodUnit === 'day' && plan.rawDays > 0) {
  //     return `${plan.rawDays} days`;
  //   }
  //   return `${plan.rentalMonths || 1} months`;
  // }, [plan]);
  const tenureSummaryText = useMemo(() => {
    if (!plan) return '';
    if (isFlexibleDailyProduct) {
      return selectedDaysCount ? `${selectedDaysCount} days` : 'select dates';
    }
    if (plan.periodUnit === 'day' && plan.rawDays > 0) {
      return `${plan.rawDays} days`;
    }
    return `${plan.rentalMonths || 1} months`;
  }, [plan, isFlexibleDailyProduct, selectedDaysCount]);

  // const isValidDailyRange = useMemo(() => {
  //   if (!isDailyProduct || !requiredDaysForPlan) return true;
  //   if (!startDate || !endDate) return false;
  //   const start = parseLocalIso(startDate);
  //   const end = parseLocalIso(endDate);
  //   if (!start || !end) return false;
  //   if (startOfLocalDay(end) < startOfLocalDay(start)) return false;
  //   const diffDays =
  //     Math.round(
  //       (startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime()) /
  //         (1000 * 60 * 60 * 24),
  //     ) + 1;
  //   return diffDays === requiredDaysForPlan;
  // }, [isDailyProduct, requiredDaysForPlan, startDate, endDate]);
  const isValidDailyRange = useMemo(() => {
    if (!isDailyProduct) return true;
    if (isFlexibleDailyProduct) {
      if (!startDate || !endDate) return false;
      const start = parseLocalIso(startDate);
      const end = parseLocalIso(endDate);
      if (!start || !end) return false;
      const minPickup = addLocalDays(start, 2);
      return startOfLocalDay(end) >= startOfLocalDay(minPickup);
    }
    if (!requiredDaysForPlan) return true;
    if (!startDate || !endDate) return false;
    const start = parseLocalIso(startDate);
    const end = parseLocalIso(endDate);
    if (!start || !end) return false;
    if (startOfLocalDay(end) < startOfLocalDay(start)) return false;
    const diffDays =
      Math.round(
        (startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;
    return diffDays === requiredDaysForPlan;
  }, [
    isDailyProduct,
    isFlexibleDailyProduct,
    requiredDaysForPlan,
    startDate,
    endDate,
  ]);

  const calendarCells = useMemo(
    () => buildMonthGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth],
  );

  const canPrevCalendarMonth = useMemo(() => {
    const today = new Date();
    const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return calendarMonth.getTime() > firstThisMonth.getTime();
  }, [calendarMonth]);

  const canNextCalendarMonth = useMemo(() => {
    const max = parseLocalIso(maxDateIso);
    if (!max) return true;
    const nextCal = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      1,
    );
    if (nextCal.getFullYear() > max.getFullYear()) return false;
    if (
      nextCal.getFullYear() === max.getFullYear() &&
      nextCal.getMonth() > max.getMonth()
    )
      return false;
    return true;
  }, [calendarMonth, maxDateIso]);

  const ratingStats = useMemo(() => {
    const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

    if (!reviews.length) {
      return {
        average: 0,
        total: 0,
      };
    }

    const totalRating = reviews.reduce(
      (sum, r) => sum + Number(r.rating || 0),
      0,
    );

    return {
      average: (totalRating / reviews.length).toFixed(1),
      total: reviews.length,
    };
  }, [product?.reviews]);

  // const handleCalendarDayClick = (day) => {
  //   if (!requiredDaysForPlan) return;
  //   const start = startOfLocalDay(day);
  //   const today = startOfLocalDay(new Date());
  //   if (start.getTime() < today.getTime()) {
  //     pushToast('You can only select today or future dates.', 'error');
  //     return;
  //   }
  //   const end = addLocalDays(start, requiredDaysForPlan - 1);
  //   const maxD = parseLocalIso(maxDateIso);
  //   if (
  //     !maxD ||
  //     startOfLocalDay(end).getTime() > startOfLocalDay(maxD).getTime()
  //   ) {
  //     pushToast(
  //       'Choose an earlier start date so the full rental fits within the booking window.',
  //       'error',
  //     );
  //     return;
  //   }
  //   setStartDate(toLocalIso(start));
  //   setEndDate(toLocalIso(end));
  // };
  const handleCalendarDayClick = (day) => {
    const start = startOfLocalDay(day);
    const today = startOfLocalDay(new Date());
    if (start.getTime() < today.getTime()) {
      pushToast('You can only select today or future dates.', 'error');
      return;
    }
    const maxD = parseLocalIso(maxDateIso);
    if (maxD && start.getTime() > startOfLocalDay(maxD).getTime()) {
      pushToast('Selected date is beyond the allowed booking window.', 'error');
      return;
    }

    if (isFlexibleDailyProduct) {
      if (selectingDate === 'start') {
        setStartDate(toLocalIso(start));
        // If a pickup date was already chosen but is now before the new
        // delivery date, clear it so the user re-picks a valid pickup date.
        setEndDate((prevEnd) => {
          if (!prevEnd) return prevEnd;
          const e = parseLocalIso(prevEnd);
          if (e && startOfLocalDay(e).getTime() < start.getTime()) return '';
          return prevEnd;
        });
        setSelectingDate('end');
        return;
      }
      // selectingDate === 'end'
      // selectingDate === 'end'
      const s = startDate ? parseLocalIso(startDate) : null;
      if (s && start.getTime() < startOfLocalDay(s).getTime()) {
        // Tapped a date before the delivery date — treat it as a new
        // delivery date instead of a pickup date.
        setStartDate(toLocalIso(start));
        setEndDate('');
        setSelectingDate('end');
        return;
      }
      if (s) {
        const minPickup = startOfLocalDay(addLocalDays(s, 2));
        if (start.getTime() < minPickup.getTime()) {
          pushToast(
            'Pickup date must be at least 2 days after the delivery date.',
            'error',
          );
          return;
        }
      }
      setEndDate(toLocalIso(start));
      return;
    }

    // if (!requiredDaysForPlan) return;
    // const end = addLocalDays(start, requiredDaysForPlan - 1);
    const safeRequiredDays =
      Number.isFinite(requiredDaysForPlan) && requiredDaysForPlan > 0
        ? requiredDaysForPlan
        : 1;
    const end = addLocalDays(start, safeRequiredDays - 1);
    if (
      !maxD ||
      startOfLocalDay(end).getTime() > startOfLocalDay(maxD).getTime()
    ) {
      pushToast(
        'Choose an earlier start date so the full rental fits within the booking window.',
        'error',
      );
      return;
    }
    setStartDate(toLocalIso(start));
    setEndDate(toLocalIso(end));
  };

  const handleAddToCart = () => {
    (async () => {
      const productId = product?._id;
      if (!productId) return;

      // if (isDailyProduct && !isValidDailyRange) {
      //   pushToast(
      //     `Please select exactly ${requiredDaysForPlan} day${
      //       requiredDaysForPlan > 1 ? 's' : ''
      //     } on the calendar.`,
      //     'error',
      //   );
      //   return;
      // }

      // const existingQty =
      //   items.find((i) => i.productId === productId)?.quantity || 0;
      // const res = await apiGetProductById(productId);
      // const stock = res.data?.product?.stock ?? currentStock ?? 0;

      // if (!stock || stock <= 0) {
      //   pushToast('Sorry, this product is out of stock.', 'error');
      //   return;
      // }

      // if (existingQty + 1 > stock) {
      //   pushToast(
      //     `Only ${stock} available in stock for this product.`,
      //     'error',
      //   );
      //   return;
      // }

      if (isDailyProduct && !isValidDailyRange) {
        pushToast(
          isFlexibleDailyProduct
            ? 'Please select a delivery date and pickup date on the calendar.'
            : `Please select exactly ${requiredDaysForPlan} day${
                requiredDaysForPlan > 1 ? 's' : ''
              } on the calendar.`,
          'error',
        );
        return;
      }

      const existingQty =
        items.find((i) => i.productId === productId)?.quantity || 0;
      const res = await apiGetProductById(productId);
      const stock = res.data?.product?.stock ?? currentStock ?? 0;

      if (!stock || stock <= 0) {
        pushToast('Sorry, this product is out of stock.', 'error');
        return;
      }

      if (existingQty + 1 > stock) {
        pushToast(
          `Only ${stock} available in stock for this product.`,
          'error',
        );
        return;
      }

      // console.log('VARIANT DEBUG:', {
      //   selectedVariantIdx,
      //   variant: variants[selectedVariantIdx],
      //   variantId: variants[selectedVariantIdx]?._id,
      // });
      console.log('VARIANT DEBUG:', {
        selectedVariantIdx,
        variant: variants[selectedVariantIdx],
        variantId: variants[selectedVariantIdx]?._id,
      });
      console.log('=== ADD TO CART TAX DEBUG ===');
      console.log('product.subCategoryTax:', product?.subCategoryTax);
      console.log(
        'defaultGst being sent:',
        product?.subCategoryTax?.defaultGst ?? null,
      );
      console.log(
        'defaultCareTax being sent:',
        product?.subCategoryTax?.defaultCareTax ?? null,
      );
      // dispatch(
      //   addToCart({
      //     productId,
      //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
      //     variantName: variants[selectedVariantIdx]?.variantName || '',
      //     quantity: 1,
      //     rentalMonths: activeRentalMonths,
      //     pricePerDay: effectivePlanTotalPrice,
      //     title: productName,
      //     image: images?.[0] || '',
      //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
      //     refundableDeposit: Number(product?.refundableDeposit || 0),
      //     rentalConfigurations: product?.rentalConfigurations || [],
      //   }),
      // );

      // if (!isAuthenticated) {
      //   sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
      //   openAuth('login');
      // }

      // router.push('/cart');

      // dispatch(
      //   addToCart({
      //     productId,
      //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
      //     variantName: variants[selectedVariantIdx]?.variantName || '',
      //     quantity: 1,
      //     rentalMonths: activeRentalMonths,
      //     pricePerDay: effectivePlanTotalPrice,
      //     title: productName,
      //     image: images?.[0] || '',
      //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
      //     refundableDeposit: Number(product?.refundableDeposit || 0),
      //     rentalConfigurations: product?.rentalConfigurations || [],
      //     // condition: product?.condition || '',
      //     // productType: 'Rental',
      //     condition: product?.condition || '',
      //     productType: 'Rental',
      //     offer: offer || null,
      //   }),
      // );

      // if (!isAuthenticated) {
      //   sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
      //   openAuth('login');
      // }

      // // router.push('/cart');
      // dispatch(
      //   addToCart({
      //     productId,
      //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
      //     variantName: variants[selectedVariantIdx]?.variantName || '',
      //     quantity: 1,
      //     rentalMonths: activeRentalMonths,
      //     pricePerDay: effectivePlanTotalPrice,
      //     title: productName,
      //     image: images?.[0] || '',
      //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
      //     // refundableDeposit: Number(product?.refundableDeposit || 0),
      // router.push('/cart');
      dispatch(
        addToCart({
          productId,
          variantId: variants[selectedVariantIdx]?._id?.toString() || null,
          variantName: variants[selectedVariantIdx]?.variantName || '',
          quantity: 1,
          rentalMonths: activeRentalMonths,
          // pricePerDay:
          //   plan?.periodUnit === 'day'
          //     ? effectivePlanTotalPrice
          //     : effectivePlanPrice,
          // title: productName,
          pricePerDay:
            plan?.periodUnit === 'day'
              ? effectivePlanTotalPrice
              : effectivePlanPrice,
          originalPricePerDay,
          title: productName,
          image: images?.[0] || '',
          tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
          // refundableDeposit: Number(product?.refundableDeposit || 0),
          // rentalConfigurations: product?.rentalConfigurations || [],
          // condition: product?.condition || '',
          // productType: 'Rental',
          // offer: offer || null,
          // defaultGst: product?.subCategoryTax?.defaultGst ?? null,
          refundableDeposit: Number(product?.refundableDeposit || 0),
          rentalConfigurations:
            Array.isArray(variants[selectedVariantIdx]?.rentalConfigurations) &&
            variants[selectedVariantIdx].rentalConfigurations.length
              ? variants[selectedVariantIdx].rentalConfigurations
              : product?.rentalConfigurations || [],
          condition: product?.condition || '',
          productType: 'Rental',
          offer: offer || null,
          defaultGst: product?.subCategoryTax?.defaultGst ?? null,
          defaultCareTax: product?.subCategoryTax?.defaultCareTax ?? null,
          defaultRepairWarranty:
            product?.subCategoryTax?.defaultRepairWarranty ?? null,
          defaultRelocationWarranty:
            product?.subCategoryTax?.defaultRelocationWarranty ?? null,
          defaultDeliveryPackaging:
            product?.subCategoryTax?.defaultDeliveryPackaging ?? null,
          defaultInstallationFee:
            product?.subCategoryTax?.defaultInstallationFee ?? null,
          defaultPlatformFee:
            product?.subCategoryTax?.defaultPlatformFee ?? null,
          taxBlocked: product?.subCategoryTax?.taxBlocked ?? false,
          startDate: isFlexibleDailyProduct ? startDate : null,
          endDate: isFlexibleDailyProduct ? endDate : null,
          dailyRate: isFlexibleDailyProduct
            ? (plan?.displayPrice ?? plan?.price ?? 0)
            : null,
        }),
      );

      //     //     if (!isAuthenticated) {
      //     //       sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
      //     //       openAuth('login');
      //     //     }

      //     //     router.push('/cart');
      //     //   })();
      //     // };

      //     // const handleRentNow = () => {
      //     if (!isAuthenticated) {
      //       sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
      //       openAuth('login');
      //     }

      //     toast.success('Added to cart successfully', {
      //       position: 'top-right',
      //       autoClose: 2000,
      //       hideProgressBar: false,
      //       closeOnClick: true,
      //       pauseOnHover: true,
      //       draggable: true,
      //       theme: 'light',
      //     });
      //   })();
      // };

      //     if (!isAuthenticated) {
      //       sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/cart');
      //       openAuth('login');
      //     }

      //     router.push('/cart');
      //   })();
      // };

      // const handleRentNow = () => {
      // No login modal here — item is added to cart regardless of auth
      // state. Login is prompted later on the Cart page when the user
      // clicks "Proceed to Checkout" (see Cart.jsx).

      toast.success('Added to cart successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    })();
  };

  const handleRentNow = () => {
    (async () => {
      const productId = product?._id;
      if (!productId) return;

      // if (isDailyProduct && !isValidDailyRange) {
      //   pushToast(
      //     `Please select exactly ${requiredDaysForPlan} day${
      //       requiredDaysForPlan > 1 ? 's' : ''
      //     } on the calendar.`,
      //     'error',
      //   );
      //   return;
      // }

      // const existingQty =
      //   items.find((i) => i.productId === productId)?.quantity || 0;
      // const res = await apiGetProductById(productId);
      // const stock = res.data?.product?.stock ?? currentStock ?? 0;

      // if (!stock || stock <= 0) {
      //   pushToast('Sorry, this product is out of stock.', 'error');
      //   return;
      // }

      // if (existingQty + 1 > stock) {
      //   pushToast(
      //     `Only ${stock} available in stock for this product.`,
      //     'error',
      //   );
      //   return;
      // }

      if (isDailyProduct && !isValidDailyRange) {
        pushToast(
          isFlexibleDailyProduct
            ? 'Please select a delivery date and pickup date on the calendar.'
            : `Please select exactly ${requiredDaysForPlan} day${
                requiredDaysForPlan > 1 ? 's' : ''
              } on the calendar.`,
          'error',
        );
        return;
      }

      const existingQty =
        items.find((i) => i.productId === productId)?.quantity || 0;
      const res = await apiGetProductById(productId);
      const stock = res.data?.product?.stock ?? currentStock ?? 0;

      if (!stock || stock <= 0) {
        pushToast('Sorry, this product is out of stock.', 'error');
        return;
      }

      if (existingQty + 1 > stock) {
        pushToast(
          `Only ${stock} available in stock for this product.`,
          'error',
        );
        return;
      }

      // dispatch(
      //   addToCart({
      //     productId,
      //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
      //     variantName: variants[selectedVariantIdx]?.variantName || '',
      //     quantity: 1,
      //     rentalMonths: activeRentalMonths,
      //     pricePerDay: effectivePlanTotalPrice,
      //     title: productName,
      //     image: images?.[0] || '',
      //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
      //     refundableDeposit: Number(product?.refundableDeposit || 0),
      //     rentalConfigurations: product?.rentalConfigurations || [],
      //   }),
      // );

      // if (typeof window !== 'undefined' && productId) {
      // dispatch(
      //   addToCart({
      //     productId,
      //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
      //     variantName: variants[selectedVariantIdx]?.variantName || '',
      //     quantity: 1,
      //     rentalMonths: activeRentalMonths,
      //     pricePerDay: effectivePlanTotalPrice,
      //     title: productName,
      //     image: images?.[0] || '',
      //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
      //     refundableDeposit: Number(product?.refundableDeposit || 0),
      //     rentalConfigurations: product?.rentalConfigurations || [],
      //     // condition: product?.condition || '',
      //     // productType: 'Rental',
      //     condition: product?.condition || '',
      //     productType: 'Rental',
      //     offer: offer || null,
      //   }),
      // );

      // if (typeof window !== 'undefined' && productId) {

      // dispatch(
      //   addToCart({
      //     productId,
      //     variantId: variants[selectedVariantIdx]?._id?.toString() || null,
      //     variantName: variants[selectedVariantIdx]?.variantName || '',
      //     quantity: 1,
      //     rentalMonths: activeRentalMonths,
      //     pricePerDay: effectivePlanTotalPrice,
      //     title: productName,
      //     image: images?.[0] || '',
      //     tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
      //     // refundableDeposit: Number(product?.refundableDeposit || 0),
      // if (typeof window !== 'undefined' && productId) {

      dispatch(
        addToCart({
          productId,
          variantId: variants[selectedVariantIdx]?._id?.toString() || null,
          variantName: variants[selectedVariantIdx]?.variantName || '',
          quantity: 1,
          rentalMonths: activeRentalMonths,
          // pricePerDay:
          //   plan?.periodUnit === 'day'
          //     ? effectivePlanTotalPrice
          //     : effectivePlanPrice,
          // title: productName,
          pricePerDay:
            plan?.periodUnit === 'day'
              ? effectivePlanTotalPrice
              : effectivePlanPrice,
          originalPricePerDay,
          title: productName,
          image: images?.[0] || '',
          tenureUnit: plan?.periodUnit === 'day' ? 'day' : 'month',
          // refundableDeposit: Number(product?.refundableDeposit || 0),
          // rentalConfigurations: product?.rentalConfigurations || [],
          // condition: product?.condition || '',
          // productType: 'Rental',
          // offer: offer || null,
          // defaultGst: product?.subCategoryTax?.defaultGst ?? null,
          refundableDeposit: Number(product?.refundableDeposit || 0),
          rentalConfigurations:
            Array.isArray(variants[selectedVariantIdx]?.rentalConfigurations) &&
            variants[selectedVariantIdx].rentalConfigurations.length
              ? variants[selectedVariantIdx].rentalConfigurations
              : product?.rentalConfigurations || [],
          condition: product?.condition || '',
          productType: 'Rental',
          offer: offer || null,
          defaultGst: product?.subCategoryTax?.defaultGst ?? null,
          defaultCareTax: product?.subCategoryTax?.defaultCareTax ?? null,
          defaultRepairWarranty:
            product?.subCategoryTax?.defaultRepairWarranty ?? null,
          defaultRelocationWarranty:
            product?.subCategoryTax?.defaultRelocationWarranty ?? null,
          defaultDeliveryPackaging:
            product?.subCategoryTax?.defaultDeliveryPackaging ?? null,
          defaultInstallationFee:
            product?.subCategoryTax?.defaultInstallationFee ?? null,
          defaultPlatformFee:
            product?.subCategoryTax?.defaultPlatformFee ?? null,
          taxBlocked: product?.subCategoryTax?.taxBlocked ?? false,
          startDate: isFlexibleDailyProduct ? startDate : null,
          endDate: isFlexibleDailyProduct ? endDate : null,
          dailyRate: isFlexibleDailyProduct
            ? (plan?.displayPrice ?? plan?.price ?? 0)
            : null,
        }),
      );

      if (typeof window !== 'undefined' && productId) {
        sessionStorage.setItem(
          'rentpay_checkout_focus_product_id',
          String(productId),
        );
      }

      if (!isAuthenticated) {
        sessionStorage.setItem(AUTH_REDIRECT_SESSION_KEY, '/checkout');
        openAuth('login');
      }

      router.push('/checkout');
    })();
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <p className="lg:hidden text-xs sm:text-sm truncate mb-4">
        <a
          href="/"
          className="text-gray-400  hover:text-orange-500 font-medium"
        >
          Home
        </a>
        <span className="text-gray-400 mx-1">&gt;</span>
        <span className="text-orange-500">Rent Detail</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 sm:gap-10">
        {/* ── LEFT: Images ──────────────────────────────────────────────────── */}
        {/* <div className="min-w-0">
        <div className="rounded-lg sm:rounded-xl overflow-hidden border">
          <img
            src={mainImg}
            alt={productName}
            className="w-full h-56 sm:h-72 md:h-80 lg:h-[420px] object-cover"
          />
        </div>

        <div className="mt-3 sm:mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setThumbStart((p) => Math.max(0, p - 1))}
            disabled={thumbStart === 0}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous images"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="grid flex-1 grid-cols-5 gap-2 sm:gap-4">
            {visibleThumbs.map((img, i) => (
              <img
                key={`${img}-${thumbStart + i}`}
                src={img}
                alt={`view-${thumbStart + i + 1}`}
                onClick={() => setMainImg(img)}
                className={`w-full h-14 sm:h-20 object-cover rounded-lg border cursor-pointer transition-all ${
                  mainImg === img
                    ? 'border-orange-500 ring-1 ring-orange-400'
                    : 'hover:border-orange-400'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setThumbStart((p) => Math.min(maxThumbStart, p + 1))}
            disabled={thumbStart >= maxThumbStart}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next images"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div> */}
        <div className="min-w-0">
          {/* Main Image Wrapper */}
          {/* Main Image Wrapper */}
          <div
            className="relative rounded-lg sm:rounded-xl overflow-hidden border"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Left Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-orange-500 text-white uppercase text-xs sm:text-xs px-3 py-1 rounded-full font-semibold shadow">
                Rent
              </span>
            </div>
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={onToggleWishlist}
                disabled={togglingId === String(product?._id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition disabled:opacity-60"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWished(product?._id)
                      ? 'text-red-500 fill-red-500'
                      : 'text-gray-500'
                  }`}
                />
              </button>
            </div>

            <img
              src={mainImg}
              alt={productName}
              className="w-full aspect-square object-cover select-none"
              draggable={false}
            />
            {/* Bottom Right Verified Text */}
            {/* <div className="absolute bottom-3 right-3 z-10">
              <span className="bg-white backdrop-blur-sm text-[#10B981] text-[10px] sm:text-xs px-3 py-1.5 rounded-lg font-medium shadow border-2 border-[#10B981] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Physically Verified
              </span>
            </div> */}
          </div>

          {/* Thumbnails */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevImage}
              disabled={images.length <= 1}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="grid flex-1 grid-cols-5 gap-2 sm:gap-4">
              {visibleThumbs.map((img, i) => (
                <img
                  key={`${img}-${thumbStart + i}`}
                  src={img}
                  alt={`view-${thumbStart + i + 1}`}
                  onClick={() => setMainImg(img)}
                  className={`w-full h-14 sm:h-20 object-cover rounded-lg border cursor-pointer transition-all ${
                    mainImg === img
                      ? 'border-orange-500 ring-1 ring-orange-400'
                      : 'hover:border-orange-400'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNextImage}
              disabled={images.length <= 1}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/* ── Variant Selector ── */}
          {variants.length > 1 && (
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Select Variant
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, idx) => {
                  const isSelected = selectedVariantIdx === idx;
                  const variantImages = (() => {
                    const fromDb = Array.isArray(product?.images)
                      ? product.images.filter(Boolean)
                      : [];
                    const allImgs =
                      fromDb.length > 0 ? fromDb : FALLBACK_IMAGES;
                    const perVariant = Math.ceil(
                      allImgs.length / variants.length,
                    );
                    const start = idx * perVariant;
                    const slice = allImgs.slice(start, start + perVariant);
                    return slice.length > 0 ? slice : allImgs.slice(0, 1);
                  })();
                  return (
                    <button
                      key={v.variantName || idx}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        setMainImg(variantImages[0]);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-400'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                      }`}
                    >
                      <img
                        src={variantImages[0]}
                        alt={v.variantName}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span>{v.variantName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Details ────────────────────────────────────────────────── */}
        <div className="min-w-0">
          {/* Breadcrumb */}
          <p className="hidden lg:block text-xs sm:text-sm truncate">
            <a
              href="/"
              className="text-gray-400  hover:text-[#F97316] font-medium"
            >
              Home
            </a>
            <span className="text-gray-400 mx-1">&gt;</span>
            <span className="text-[#F97316]">Rent Detail</span>
          </p>

          {/* Title + Rating */}
          <div className="flex flex-row items-start justify-between gap-2 mt-2">
            <h1 className="text-xl sm:text-2xl font-semibold">{productName}</h1>

            {Number.isFinite(currentStock) && (
              <span
                className={`inline-block shrink-0 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                  currentStock > 0
                    ? currentStock <= 5
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                {currentStock > 0
                  ? currentStock <= 3
                    ? `Only ${currentStock} left`
                    : `${currentStock} in stock`
                  : 'Out of stock'}
              </span>
            )}
          </div>
          {/* {hasOffer ? (
          <p className="mt-1 text-sm font-medium text-emerald-600">
            ({discountPercent}% off)
          </p>
        ) : null} */}

          {/* Stock badge */}
          {/* {Number.isFinite(currentStock) && (
          <span
            className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full
            ${
              currentStock > 0
                ? currentStock <= 3
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
          </span>
        )} */}

          {/* ── Rental Tenure ── */}
          <div className="mt-4 sm:mt-6 border border-orange-300 rounded-lg sm:rounded-xl p-3 sm:p-5 bg-gradient-to-r from-[#FFFBEB] to-[#FFF7ED]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                {/* <p className="text-xs text-gray-500 mb-0.5">Monthly Rent</p> */}
                {/* <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                ₹{effectivePlanPrice}
                <span className="text-sm font-semibold text-gray-500 ml-1">
                  {plan?.priceSuffix || '/mo'}
                </span>
              </p> */}
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-baseline gap-2 flex-wrap">
                  <span>
                    ₹{effectivePlanPrice}
                    <span className="text-sm font-semibold text-gray-500">
                      {plan?.priceSuffix || '/mo'}
                    </span>
                  </span>
                  {hasOffer && plan && (
                    <span className="text-xs text-gray-400 line-through font-normal">
                      ₹{plan.displayPrice ?? plan.price}
                      {plan.priceSuffix || '/mo'}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  {ratingStats.total > 0 && (
                    <div className="flex flex-row items-center gap-1">
                      <span className="bg-[#F97316] text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-lg flex items-center justify-center">
                        ★ {ratingStats.average}
                      </span>
                      <span className="text-[#4A5565] font-semibold text-[10px] sm:text-xs truncate flex items-center">
                        {ratingStats.total}{' '}
                        {ratingStats.total === 1 ? 'Rating' : 'Ratings'}
                      </span>
                    </div>
                  )}
                  {(() => {
                    const lv = product?.logisticsVerification || {};
                    const n = Number(lv.deliveryTimelineValue);
                    const unit = String(
                      lv.deliveryTimelineUnit || 'Days',
                    ).toLowerCase();
                    if (!Number.isFinite(n) || n <= 0) return null;
                    return (
                      <div className="flex items-center gap-1 font-semibold text-[10px] sm:text-xs text-[#4A5565]">
                        <Truck className="w-5 h-5 text-[#F97316]" />
                        <span>
                          {n}{' '}
                          {unit === 'hours'
                            ? 'hours'
                            : n === 1
                              ? 'day'
                              : 'days'}{' '}
                          delivery
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {/* <button
              type="button"
              onClick={() => setIsTenureModalOpen(true)}
              className="shrink-0 flex items-center gap-2 border-2 border-orange-400 text-orange-600 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 transition-colors"
            >
              <span>{plan?.tenureLabel || 'Select'}</span>
              <ChevronRight className="w-4 h-4" />
            </button> */}
              {!isFlexibleDailyProduct ? (
                <button
                  type="button"
                  onClick={() => setIsTenureModalOpen(true)}
                  className="shrink-0 flex items-center gap-2 border-2 border-orange-400 text-orange-600 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 transition-colors"
                >
                  <span>{plan?.tenureLabel || 'Select'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="shrink-0 inline-flex items-center rounded-xl border-2 border-orange-300 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600">
                  Per Day
                </span>
              )}
            </div>

            {/* Tenure Modal */}
            {isTenureModalOpen && (
              <div className="fixed inset-0 z-50 flex">
                {/* Backdrop */}
                <div className="flex-1 bg-black/40" />
                {/* Modal Panel — full height, right side */}
                <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                      Select Tenure
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsTenureModalOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-xl font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Options */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {plans.map((p, index) => {
                      const perMonth = hasOffer
                        ? Math.max(
                            0,
                            Math.round(
                              p.displayPrice -
                                (p.displayPrice * discountPercent) / 100,
                            ),
                          )
                        : p.displayPrice;
                      const originalPerMonth = p.displayPrice;
                      const isBestValue = index === plans.length - 1;
                      const isSelected = selectedPlanId === p.id;
                      // const lowestPerMonth = Math.max(
                      //   ...plans.map((pl) => pl.displayPrice),
                      // );
                      // const saving = lowestPerMonth - perMonth;
                      const highestPerUnitPrice = Math.max(
                        ...plans.map((pl) => pl.displayPrice),
                      );
                      const saving = highestPerUnitPrice - perMonth;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPlanId(p.id);
                            setIsTenureModalOpen(false);
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
                                isSelected
                                  ? 'border-green-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {p.tenureLabel}
                              </p>
                              {saving > 0 && (
                                <span className="inline-block mt-0.5 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  Save ₹{saving}
                                  {p.priceSuffix || '/mo'}
                                </span>
                              )}
                              {isBestValue && (
                                <span className="inline-block mt-0.5 ml-1 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                                  Best Value
                                </span>
                              )}
                            </div>
                          </div>
                          {/* <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900">
                            ₹{perMonth}
                            <span className="text-xs font-normal text-gray-500">
                              {p.priceSuffix || '/mo'}
                            </span>
                          </p> */}
                          <div className="text-right shrink-0">
                            <p className="font-bold text-gray-900">
                              ₹{perMonth}
                              <span className="text-xs font-normal text-gray-500">
                                {p.priceSuffix || '/mo'}
                              </span>
                            </p>
                            {/* {hasOffer && originalPerMonth !== perMonth && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{originalPerMonth}
                              {p.priceSuffix || '/mo'}
                            </p>
                          )} */}
                            {hasOffer && originalPerMonth !== perMonth && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{originalPerMonth}
                                {p.priceSuffix || '/mo'}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Custom tenure option */}
                    <div
                      className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all ${
                        selectedPlanId === 'custom'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedPlanId === 'custom'
                              ? 'border-green-500'
                              : 'border-gray-300'
                          }`}
                          onClick={() => {
                            if (customPlan) setSelectedPlanId('custom');
                          }}
                        >
                          {selectedPlanId === 'custom' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          )}
                        </div>
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
                          onChange={(e) => {
                            setCustomMonths(e.target.value);
                            if (e.target.value) setSelectedPlanId('custom');
                          }}
                          className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
                        />
                        <span className="text-xs text-gray-500">
                          months{' '}
                          {maxCustomMonths ? `(max ${maxCustomMonths})` : ''}
                        </span> */}
                          <input
                            type="number"
                            min={minCustomMonths || 1}
                            max={maxCustomMonths || undefined}
                            placeholder={`e.g. ${minCustomMonths || 2}`}
                            value={customMonths}
                            onChange={(e) => {
                              setCustomMonths(e.target.value);
                              if (e.target.value) setSelectedPlanId('custom');
                            }}
                            className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
                          />
                          {/* <span className="text-xs text-gray-500">
                          months{' '}
                          {minCustomMonths && maxCustomMonths
                            ? `(${minCustomMonths}-${maxCustomMonths})`
                            : ''}
                        </span> */}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {/* {customPlan ? (
                        <p className="font-bold text-gray-900">
                          ₹{customPlan.displayPrice}
                          <span className="text-xs font-normal text-gray-500">
                            /mo
                          </span>
                        </p>
                      ) : customMonths &&
                        maxCustomMonths &&
                        parseInt(customMonths, 10) > maxCustomMonths ? (
                        <p className="text-[10px] text-red-500">
                          Max {maxCustomMonths} months
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Enter months</p>
                      )} */}
                        {/* {customPlan ? (
                        <p className="font-bold text-gray-900">
                          ₹{customPlan.displayPrice}
                          <span className="text-xs font-normal text-gray-500">
                            /mo
                          </span>
                        </p>
                      ) : customMonths && minCustomMonths && maxCustomMonths ? ( */}
                        {customPlan ? (
                          <>
                            {/* <p className="font-bold text-gray-900">
                            ₹
                            {hasOffer
                              ? Math.max(
                                  0,
                                  Math.round(
                                    customPlan.displayPrice -
                                      (customPlan.displayPrice *
                                        discountPercent) /
                                        100,
                                  ),
                                )
                              : customPlan.displayPrice}
                            <span className="text-xs font-normal text-gray-500">
                              /mo
                            </span>
                          </p> */}
                            <p className="font-bold text-gray-900">
                              ₹
                              {hasOffer
                                ? Math.max(
                                    0,
                                    Math.round(
                                      customPlan.displayPrice -
                                        (customPlan.displayPrice *
                                          discountPercent) /
                                          100,
                                    ),
                                  )
                                : customPlan.displayPrice}
                              <span className="text-xs font-normal text-gray-500">
                                /mo
                              </span>
                            </p>
                            {hasOffer && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{customPlan.displayPrice}/mo
                              </p>
                            )}
                          </>
                        ) : customMonths &&
                          minCustomMonths &&
                          maxCustomMonths ? (
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
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100">
                    <button
                      type="button"
                      disabled={selectedPlanId === 'custom' && !customPlan}
                      onClick={() => setIsTenureModalOpen(false)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                        selectedPlanId === 'custom' && !customPlan
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      CONTINUE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isDailyProduct ? (
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                <p className="text-xs sm:text-sm font-medium text-gray-800">
                  Select dates
                </p>
                {/* <p className="text-[11px] sm:text-xs text-gray-500">
                Tap the first day of your rental — we&apos;ll reserve exactly{' '}
                <span className="font-semibold text-gray-700">
                  {requiredDaysForPlan || '—'} consecutive day
                  {requiredDaysForPlan !== 1 ? 's' : ''}
                </span>{' '}
                for this tenure.
              </p> */}
                <p className="text-[11px] sm:text-xs text-gray-500">
                  {isFlexibleDailyProduct ? (
                    <>
                      Pick any{' '}
                      <span className="font-semibold text-gray-700">
                        delivery
                      </span>{' '}
                      and{' '}
                      <span className="font-semibold text-gray-700">
                        pickup
                      </span>{' '}
                      date — rent for as many days as you need.
                    </>
                  ) : (
                    <>
                      Tap the first day of your rental — we&apos;ll reserve
                      exactly{' '}
                      <span className="font-semibold text-gray-700">
                        {requiredDaysForPlan || '—'} consecutive day
                        {requiredDaysForPlan !== 1 ? 's' : ''}
                      </span>{' '}
                      for this tenure.
                    </>
                  )}
                </p>

                {isFlexibleDailyProduct ? (
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
                      onClick={() => {
                        if (!startDate) {
                          pushToast(
                            'Please select a delivery date first.',
                            'error',
                          );
                          return;
                        }
                        setSelectingDate('end');
                      }}
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
                ) : null}

                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                  <div
                    className="flex items-center justify-between px-3 py-2.5 sm:py-3 text-white"
                    style={{ backgroundColor: ORANGE }}
                  >
                    <button
                      type="button"
                      aria-label="Previous month"
                      disabled={!canPrevCalendarMonth}
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(
                              prev.getFullYear(),
                              prev.getMonth() - 1,
                              1,
                            ),
                        )
                      }
                      className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm sm:text-base font-semibold tracking-wide">
                      {calendarMonth.toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      type="button"
                      aria-label="Next month"
                      disabled={!canNextCalendarMonth}
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(
                              prev.getFullYear(),
                              prev.getMonth() + 1,
                              1,
                            ),
                        )
                      }
                      className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="px-2 sm:px-3 pt-3 pb-2">
                    <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        (w) => (
                          <div key={w} className="py-1">
                            {w}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 text-center">
                      {calendarCells.map((day, idx) => {
                        if (!day) {
                          return (
                            <div
                              key={`empty-${idx}`}
                              className="h-9 sm:h-10"
                              aria-hidden
                            />
                          );
                        }
                        const iso = toLocalIso(day);
                        // const disabled =
                        //   startOfLocalDay(day).getTime() <
                        //   earliestSelectableDate.getTime();
                        const earliestTime = earliestSelectableDate.getTime();
                        let disabled = Number.isFinite(earliestTime)
                          ? startOfLocalDay(day).getTime() < earliestTime
                          : false;
                        if (
                          !disabled &&
                          isFlexibleDailyProduct &&
                          selectingDate === 'end' &&
                          startDate
                        ) {
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
                        const isTodayCell = iso === todayIso;
                        return (
                          <div
                            key={iso}
                            className="flex items-center justify-center p-0.5"
                          >
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => handleCalendarDayClick(day)}
                              className={[
                                'w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center justify-center',
                                disabled
                                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                  : inRange
                                    ? 'text-white shadow-sm'
                                    : isTodayCell
                                      ? 'ring-2 ring-orange-300 bg-orange-50 text-gray-900 hover:bg-orange-100'
                                      : 'bg-gray-100 text-gray-800 hover:bg-orange-100',
                              ].join(' ')}
                              style={
                                inRange && !disabled
                                  ? {
                                      backgroundColor: ORANGE,
                                      opacity:
                                        isFlexibleDailyProduct &&
                                        iso !== startDate &&
                                        iso !== endDate
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
                  {startDate && endDate ? (
                    <div className="px-3 pb-2 text-center text-xs sm:text-sm text-gray-800">
                      {/* <span className="font-medium">
                      {formatRangeLine(startDate)}
                    </span>
                    <span
                      className="mx-2 font-semibold"
                      style={{ color: ORANGE }}
                    >
                      to
                    </span>
                    <span className="font-medium">
                      {formatRangeLine(endDate)}
                    </span> */}
                      {isFlexibleDailyProduct ? (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-center gap-4 text-center">
                          <div className="shrink-0 leading-none">
                            <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                              {String(selectedDaysCount).padStart(2, '0')}
                            </span>
                            <span className="ml-1 text-xs sm:text-sm text-gray-500 align-super">
                              Day{selectedDaysCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-800 font-medium">
                              Chargeable Period:
                            </p>
                            {selectedDaysCount > 0 ? (
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                {formatRangeLine(chargeableStartDate)} -{' '}
                                {formatRangeLine(chargeableEndDate)}
                              </p>
                            ) : (
                              <p className="text-[11px] text-red-600 mt-0.5">
                                Pickup date must be at least 2 days after
                                delivery date.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="px-3 pb-2 text-center text-[11px] text-gray-400">
                      {isFlexibleDailyProduct
                        ? 'Select delivery and pickup dates to see your total'
                        : 'Pick a start date to see your rental window'}
                    </div>
                  )}

                  <div className="flex items-start gap-2 px-3 pb-3 text-[10px] sm:text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                    <span>
                      <strong>Same-day delivery</strong> is available between{' '}
                      <strong>3 PM and 10 PM</strong>. For future dates, you can
                      select your preferred delivery time slot during checkout.
                      <strong> Pickup</strong> is scheduled between{' '}
                      <strong>9 AM and 1 PM</strong>.
                    </span>
                  </div>
                </div>

                {/* {startDate && endDate && !isValidDailyRange ? (
                <p className="text-[11px] sm:text-xs text-red-600">
                  Please select exactly {requiredDaysForPlan} consecutive day
                  {requiredDaysForPlan > 1 ? 's' : ''} for this tenure.
                </p>
              ) : null} */}
                {(() => {
                  const lv = product?.logisticsVerification || {};
                  const n = Number(lv.deliveryTimelineValue);
                  const unit = String(
                    lv.deliveryTimelineUnit || 'Days',
                  ).toLowerCase();
                  const deliveryDays =
                    Number.isFinite(n) && n > 0
                      ? unit === 'hours'
                        ? Math.ceil(n / 24)
                        : n
                      : 0;
                  const earliestDate =
                    deliveryDays > 0
                      ? addLocalDays(new Date(), deliveryDays)
                      : null;
                  const earliestIso = earliestDate
                    ? toLocalIso(earliestDate)
                    : null;
                  const earliestFormatted = earliestDate
                    ? earliestDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })
                    : null;
                  return deliveryDays > 0 && !startDate ? (
                    <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                      This product has a {deliveryDays}-day delivery time.
                      Earliest available date is{' '}
                      <span className="font-semibold">{earliestFormatted}</span>
                      .
                    </p>
                  ) : !isFlexibleDailyProduct &&
                    startDate &&
                    endDate &&
                    !isValidDailyRange ? (
                    <p className="text-[11px] sm:text-xs text-red-600">
                      Please select exactly {requiredDaysForPlan} consecutive
                      day
                      {requiredDaysForPlan !== 1 ? 's' : ''} for this tenure.
                    </p>
                  ) : null;
                })()}
              </div>
            ) : null}
          </div>

          {/* ── Price Box ── */}
          <div className="mt-4 sm:mt-6 bg-orange-50  border border-orange-300 rounded-lg sm:rounded-xl p-3 sm:p-5 space-y-3 sm:space-y-4">
            {/* <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>Refundable Deposit</span>
            <span className="text-green-600 font-medium text-sm sm:text-base">
              ₹{Number(product?.refundableDeposit || 0).toLocaleString('en-IN')}
            </span>
          </div> */}
            {/* 
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              <span className="flex items-center font-semibold text-[#F97316] gap-1.5">
                <Shield className="w-4 h-4 text-[#F97316]" />
                Refundable Deposit
              </span>

              <span className="text-[#F97316] font-semibold text-sm sm:text-base">
                ₹
                {Number(product?.refundableDeposit || 0).toLocaleString(
                  'en-IN',
                )}
              </span>
            </div> */}
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              <span className="flex items-center gap-1.5 font-bold text-[#F97316] text-lg sm:text-xl">
                <Shield className="w-6 h-6 text-[#F97316]" />
                Refundable Deposit
              </span>

              <span className="text-[#F97316] font-bold text-lg sm:text-xl">
                ₹
                {Number(product?.refundableDeposit || 0).toLocaleString(
                  'en-IN',
                )}
              </span>
            </div>

            {/* <div className="flex justify-between items-center bg-white border border-orange-300 p-3 sm:p-4 rounded-lg gap-2">
              <div className="min-w-0">
                <span className="font-semibold text-sm sm:text-base">
                  Total Payable Now
                </span>
                <p className="text-[10px] sm:text-xs text-gray-500 font-normal">
                  {plan?.periodUnit === 'day'
                    ? '(Selected days + Deposit)'
                    : '(First month + Refundable Deposit)'}
                </p>
              </div>
              <span className="text-orange-500 font-semibold text-lg shrink-0">
                ₹
                {(
                  (plan?.periodUnit === 'day'
                    ? totalRentalForTenure
                    : effectivePlanPrice) +
                  Number(product?.refundableDeposit || 0)
                ).toLocaleString('en-IN')}
              </span>
            </div> */}
          </div>

          {/* ── Delivery ── */}
          {/* <div className="bg-[#EFF6FF] mt-4 sm:mt-5 border-2 border-[#BEDBFF] p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
          {(() => {
            const lv = product?.logisticsVerification || {};
            const n = Number(lv.deliveryTimelineValue);
            const unit = String(
              lv.deliveryTimelineUnit || 'Days',
            ).toLowerCase();
            if (Number.isFinite(n) && n > 0) {
              return (
                <>
                  <span className="font-semibold">
                    Estimated delivery: {n}{' '}
                    {unit === 'hours' ? 'hours' : 'days'}
                  </span>
                  <p className="text-gray-600 mt-0.5">
                    {lv.city
                      ? `Service area includes ${lv.city}.`
                      : 'Free delivery and setup included'}
                  </p>
                </>
              );
            }
            if (Number.isFinite(n) && n > 0) {
              return (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-200 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-[#2563EB]" />
                  </div>

                  <div>
                    {ratingStats.total > 0 && (
                      <div className="flex flex-row items-center gap-1.5 mb-1">
                        <span className="bg-[#10B981] text-white text-xs px-2 py-0.5 rounded flex items-center justify-center">
                          {ratingStats.average} ★
                        </span>
                        <span className="text-[#4A5565] text-xs truncate flex items-center">
                          {ratingStats.total}{' '}
                          {ratingStats.total === 1 ? 'Rating' : 'Ratings'}
                        </span>
                      </div>
                    )}

                    <span className="font-semibold block">
                      Estimated delivery: {n}{' '}
                      {unit === 'hours' ? 'hours' : 'day'}
                    </span>

                    <p className="text-gray-600 mt-0.5">
                      {lv.city
                        ? `Service area includes ${lv.city}.`
                        : 'Free delivery and setup included'}
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <>
                <span className="font-medium">Delivery</span>
                <p className="text-gray-600 mt-0.5">
                  Contact the renter after checkout for delivery scheduling.
                </p>
              </>
            );
          })()}
        </div> */}

          {/* ── CTA Buttons ── */}
          {/* <button
          type="button"
          onClick={handleRentNow}
          disabled={currentStock <= 0 || (isDailyProduct && !isValidDailyRange)}
          // className="w-full bg-orange-500 text-white py-2.5 sm:py-3 rounded-lg mt-4 sm:mt-6 font-medium text-sm sm:text-base hover:bg-orange-600 transition-colors"
          className={`w-full py-2.5 sm:py-3 rounded-lg mt-4 sm:mt-6 font-medium text-sm sm:text-base transition-colors ${
            currentStock <= 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          Rent Now
        </button> */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              currentStock <= 0 || (isDailyProduct && !isValidDailyRange)
            }
            // className="w-full border border-orange-500 text-[#F97316] py-2.5 sm:py-3 rounded-lg mt-3 sm:mt-4 font-medium text-sm sm:text-base hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            className={`w-full py-2.5 sm:py-3 rounded-lg mt-3 sm:mt-4 font-medium text-sm sm:text-base transition-colors flex items-center justify-center gap-2 ${
              currentStock <= 0
                ? 'border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'border border-orange-500 bg-[#F97316] text-white'
            }`}
          >
            {/* <ShoppingCart
            className={`w-4 h-4 ${
              currentStock <= 0 ? 'text-gray-500' : 'text-[#F97316]'
            }`}
          /> */}
            Add to Cart
          </button>

          {/* ── Cancellation & Returns / Auto-Extension buttons ── */}
          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsCancellationModalOpen(true)}
              className="flex items-center justify-between gap-1 px-3 py-3 rounded-lg border border-orange-200 bg-white hover:border-orange-300 transition-colors text-xs sm:text-sm font-medium text-balck hover:text-[#F97316]"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <Truck className="w-4 h-4 text-balck hover:text-[#F97316] shrink-0" />
                <span className="truncate">Cancellation &amp; Returns</span>
              </span>
              <ChevronRight className="w-4 h-4 text-balck hover:text-[#F97316] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setIsAutoExtensionModalOpen(true)}
              className="flex items-center justify-between gap-1 px-3 py-3 rounded-lg border border-orange-200 bg-white hover:border-orange-300 transition-colors text-xs sm:text-sm font-medium text-balck hover:text-[#F97316]"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-4 h-4 text-balck hover:text-[#F97316] shrink-0" />
                <span className="truncate">Auto-Extension</span>
              </span>
              <ChevronRight className="w-4 h-4 text-balck hover:text-[#F97316] shrink-0" />
            </button>
          </div>

          {/* Cancellation & Returns Modal */}
          {isCancellationModalOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="flex-1 bg-black/40"
                onClick={() => setIsCancellationModalOpen(false)}
              />
              <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    Cancellation and Returns
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsCancellationModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    You can cancel or return the product at any time. However,
                    please note the following terms:
                  </p>

                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-2">
                      1. Cancellation Before Delivery
                    </p>
                    <ul className="list-disc list-outside pl-5 space-y-1.5 text-sm text-gray-600">
                      <li>
                        If you cancel your order before the product is
                        delivered, no additional charges will apply.
                      </li>
                      <li>
                        You can request cancellation through our support team.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-2">
                      2. Return After Delivery (Early Closure)
                    </p>
                    <ul className="list-disc list-outside pl-5 space-y-1.5 text-sm text-gray-600">
                      <li>
                        If you return the product before your rental tenure
                        ends, an early closure fee will be charged.
                      </li>
                      <li>
                        The early closure fee will be equivalent to 1
                        month&apos;s rent for that product.
                      </li>
                      <li>
                        In case you have paid advance rent for a product, you
                        will not be eligible for a refund if you return early.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCancellationModalOpen(false)}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Extension of Tenure Modal */}
          {isAutoExtensionModalOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="flex-1 bg-black/40"
                onClick={() => setIsAutoExtensionModalOpen(false)}
              />
              <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    Auto-Extension of Tenure
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsAutoExtensionModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {/* <p className="text-sm text-gray-600">
                    You can choose any rental tenure without worrying about
                    whether you'll need the product after its tenure is over.
                  </p> */}
                  <p className="text-sm text-gray-600">
                    You can choose any rental tenure without worrying about
                    whether you&apos;ll need the product after its tenure is
                    over.
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-1.5 text-sm text-gray-600">
                    <li>
                      Once your selected tenure is over, we will automatically
                      extend it every month so you can keep using the product
                      hassle-free.
                    </li>
                    <li>
                      If you no longer need the product, you can request a
                      return at any time.
                    </li>
                  </ul>
                </div>

                <div className="px-5 py-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAutoExtensionModalOpen(false)}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Total cost summary */}
          {/* <div className="bg-blue-50 mt-4 sm:mt-5 p-3 sm:p-4 text-center rounded-lg text-xs sm:text-sm">
          <p className="text-gray-500">
            Total rental for {tenureSummaryText}:{' '}
            <span className="font-semibold text-black">
              ₹{totalRentalForTenure.toLocaleString('en-IN')}
            </span>
            {plan?.periodUnit === 'day' ? (
              <span className="block text-[10px] text-gray-400 mt-1">
                Exact vendor price for {plan.rawDays} day
                {plan.rawDays > 1 ? 's' : ''}
              </span>
            ) : null}
          </p>
        </div> */}
        </div>
      </div>
    </div>
  );
};

export default RentPrdctMain;
