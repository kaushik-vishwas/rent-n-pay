'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

  const hoursUntilService = (bookingDateTime - now) / (1000 * 60 * 60);
  const isLate = hoursUntilService < 1.5;
  const total = Number(booking.totalAmount || 0);
  const fee = isLate ? Math.round(total * 0.1) : 0;
  const refund = total - fee;

  return (
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
              ₹{formatMoney(total)}
            </span>
          </div>
          {isLate ? (
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
    </div>
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

  const start = order.createdAt ? new Date(order.createdAt) : new Date();
  const unit = product
    ? resolveTenureUnit(order, product, order.rentalDuration)
    : order.tenureUnit === 'day'
      ? 'day'
      : 'month';
  const leaseEnd = computeLeaseEnd(start, order.rentalDuration, unit);
  const daysLeft = Math.ceil(
    (startOfDay(leaseEnd).getTime() - startOfDay(new Date()).getTime()) /
      86400000,
  );

  const isSell = line ? lineIsPurchase(line) : orderIsPurchase(order);

  if (st === 'cancelled') {
    return { kind: 'cancelled', leaseEnd, daysLeft, unit, product };
  }
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
      return { kind: 'cancelled', leaseEnd, daysLeft, unit, product };
    }
    if (!lineProduct) {
      return {
        kind: 'rental_missing_catalog',
        leaseEnd,
        daysLeft,
        unit,
        product,
      };
    }
    if (daysLeft > 0) {
      return { kind: 'active_rental', leaseEnd, daysLeft, unit, product };
    }
    return { kind: 'tenure_ended', leaseEnd, daysLeft, unit, product };
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

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      // const meta = classifyOrderLine(order, line);
      const meta = classifyOrderLine(order, line);
      console.log('LINE FIELDS:', JSON.stringify(line, null, 2));
      console.log('FULL ORDER:', JSON.stringify(order, null, 2));

      // Tab membership per line
      const inTab = (() => {
        if (tab === 'all') return true;
        if (tab === 'cancelled') return meta.kind === 'cancelled';
        if (tab === 'delivered')
          return (
            meta.kind === 'completed_done' || meta.kind === 'delivered_purchase'
          );
        if (tab === 'active_rentals') return meta.kind === 'active_rental';
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

function tabCounts(orders) {
  const c = {
    all: 0,
    active_rentals: 0,
    delivered: 0,
    services: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    const lines = orderProductLines(o);
    if (!lines.length) {
      c.all += 1;
      continue;
    }
    for (const line of lines) {
      const meta = classifyOrderLine(o, line);
      c.all += 1;
      if (meta.kind === 'cancelled') c.cancelled += 1;
      if (meta.kind === 'completed_done' || meta.kind === 'delivered_purchase')
        c.delivered += 1;
      if (meta.kind === 'active_rental') c.active_rentals += 1;
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
  const [tab, setTab] = useState('all');
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

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    {
      id: 'active_rentals',
      label: 'Active Rentals',
      count: counts.active_rentals,
    },
    { id: 'delivered', label: 'Delivered', count: counts.delivered },
    { id: 'services', label: 'Services', count: counts.services },
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
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 pb-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
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

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
        {returnPrompt.open ? (
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
                    <span>Monthly Rent:</span>
                    <span className="font-medium">
                      ₹{formatMoney(returnPrompt.cycleRent)}/
                      {returnPrompt.cycleUnit === 'day' ? 'day' : 'month'}
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
                  const next = `/my-rentals?openReturn=1&orderId=${encodeURIComponent(returnPrompt.orderId)}&productId=${encodeURIComponent(returnPrompt.productId)}`;
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
          </div>
        ) : null}

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

  const delivery = Number(order.deliveryFee || 0);
  const gst = Number(order.gst || 0);
  const deposit = Number(order.refundableDeposit || 0);
  const care = Number(order.careProtection || 0);
  const discount = Number(order.discountAmount || 0);
  const total = Number(order.totalAmount || 0);

  // Build per-product lines from order.products
  const productLines = (order.products || []).map((line) => {
    const p = line?.product;
    const name =
      (p && typeof p === 'object' ? p.productName || p.title : null) ||
      line?.variantName ||
      'Product';
    const unitPrice = Number(line?.pricePerDay || line?.price || 0);
    const qty = Number(line?.quantity || 1);
    const lineTotal = unitPrice * qty;
    const isSell = String(line?.productType || '').toLowerCase() === 'sell';
    return {
      name,
      unitPrice,
      qty,
      lineTotal,
      isSell,
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

  const feeRows = [
    delivery > 0 && { label: 'Delivery Fee', value: delivery, color: '' },
    gst > 0 && { label: 'GST', value: gst, color: '' },
    care > 0 && { label: 'Care & Protection', value: care, color: '' },
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
                  <span className="font-semibold text-gray-800 shrink-0">
                    ₹{formatMoney(line.lineTotal)}
                  </span>
                </div>
              ))}

              {/* Products subtotal — only show if there are fees below */}
              {feeRows.length > 0 && (
                <div className="flex justify-between items-center pt-1.5 mt-1 border-t border-gray-200">
                  <span className="text-gray-500">Products Total</span>
                  <span className="font-semibold text-gray-800">
                    ₹{formatMoney(productsSubtotal)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Fee rows ── */}
          {feeRows.map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500">{label}</span>
              <span className={`font-semibold ${color || 'text-gray-800'}`}>
                {value < 0 ? '− ' : ''}₹{formatMoney(Math.abs(value))}
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
                    <span className="font-semibold text-blue-600 shrink-0">
                      ₹{formatMoney(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ── Grand total ── */}
          <div className="pt-2 mt-1 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-black">Total Paid</span>
            <span className="font-bold text-[#FF6F00] text-base">
              ₹{formatMoney(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
function LineCard({ order, line, onOpenReturnPrompt, onOpenReview }) {
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

  console.log('ORDER FIELDS:', {
    totalAmount: order?.totalAmount,
    grandTotal: order?.grandTotal,
    total: order?.total,
    paidAmount: order?.paidAmount,
    orderTotal: order?.orderTotal,
    allKeys: Object.keys(order || {}),
  });
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
  const displayPrice =
    Number(line?.pricePerDay || 0) * Number(line?.quantity || 1);

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

  if (!p && meta.kind !== 'cancelled') {
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
  if (meta.kind === 'cancelled') {
    const rrLine = line ?? orderReturnLine(order);
    const rr = rrLine?.returnRequest;
    const hasReturnTracking = Boolean(rr?.requestedAt);
    const refundShown = hasReturnTracking
      ? lineRefundableDeposit(rrLine)
      : linePrice;
    const cancelledDetailDate = hasReturnTracking
      ? formatOrderDate(rr.requestedAt)
      : placed;
    return (
      <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
            price={displayPrice}
            priceSuffix={priceSuffix}
            variantName={variantName}
            href={detailHref}
          />
        </div>

        <div className="px-4 pb-2">
          <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Refund Processed: ₹{formatMoney(refundShown)} to Source
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hasReturnTracking
              ? `Cancelled by you on ${cancelledDetailDate}`
              : `Cancelled on ${cancelledDetailDate}`}
          </p>
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
  if (meta.kind === 'delivered_purchase') {
    const phase = meta.purchasePhase || 'delivered';
    const milestoneDate = formatOrderDate(order.updatedAt || order.createdAt);
    const headerDateLabel =
      phase === 'completed'
        ? `Completed on: ${milestoneDate}`
        : `Delivered on: ${milestoneDate}`;
    const badgeLabel = phase === 'completed' ? 'Completed' : 'Delivered';

    // track per-line whether user already reviewed
    // const [hasReview, setHasReview] = useState(false);
    // const [reviewChecked, setReviewChecked] = useState(false);

    // useEffect(() => {
    //   if (!p?._id || !order._id) return;
    //   apiGetMyReview(String(p._id), String(order._id))
    //     .then((res) => {
    //       setHasReview(res.data?.exists === true);
    //     })
    //     .catch(() => setHasReview(false))
    //     .finally(() => setReviewChecked(true));
    // }, [p?._id, order._id]);

    return (
      <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-black">Order #{oid}</p>
            <p className="text-sm text-gray-500 mt-0.5">{headerDateLabel}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {badgeLabel}
          </span>
        </div>
        <div className="p-4">
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
        <OrderSummaryAccordion order={order} />
      </li>
    );
  }

  // ── completed rental

  // ── completed rental ──────────────────────────────────────────────────────
  if (meta.kind === 'completed_done') {
    return (
      <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-black">Order #{oid}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Completed on:{' '}
              {formatOrderDate(order.updatedAt || order.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        </div>
        <div className="p-4">
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
          <p className="text-sm text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Thank you — rental closed
          </p>
        </div>
        <OrderSummaryAccordion order={order} />
        {/* <div className="px-4 pb-4">
          <button
            type="button"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 text-sm font-semibold hover:bg-gray-50 inline-flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            Rate &amp; review
          </button>
        </div> */}
      </li>
    );
  }

  // ── active rental ─────────────────────────────────────────────────────────
  if (meta.kind === 'active_rental') {
    const paymentDueClass =
      meta.daysLeft < 5
        ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FFC9C9]'
        : meta.daysLeft <= 15
          ? 'bg-[#FFFBEB] text-[#BB4D00] border border-[#FEE685]'
          : 'bg-[#DCFCE7] text-[#16A34A] border border-[#B9F8CF]';

    return (
      <li className="bg-white rounded-xl border-2 border-[#B9F8CF] shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <div>
            <p className="font-bold text-black">Order #{oid}</p>
            <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
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
                  <p className="font-semibold text-black hover:text-[#FF6F00] transition-colors leading-snug text-sm">
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
            )}
            <Link
              href="/my-rentals"
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#F97316] border-2 border-[#F97316] text-sm font-semibold hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              <Wallet className="w-4 h-4" />
              Pay Rent
            </Link>
          </div>
        </div>

        <div className="px-4 pb-3">
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
                Payment due in {meta.daysLeft} day
                {meta.daysLeft === 1 ? '' : 's'}
              </span>
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
        <CardHeader oid={oid} placed={placed} isSell={isSell}>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
            <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
            Shipped
          </span>
        </CardHeader>

        <div className="p-4">
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
          <p className="text-sm text-gray-500 mt-3">
            Expected delivery: {expectedDeliveryDate(order, p)}
          </p>
        </div>

        <OrderSummaryAccordion order={order} />
        <div className="px-4 pb-4">
          <Link
            // href={`/orders/${String(order._id)}/track`}
            href={`/orders/${String(order._id)}/track?lineIdx=${orderProductLines(
              order,
            ).indexOf(line)}`}
            className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white text-sm font-semibold ${ORANGE}`}
          >
            <MapPin className="w-4 h-4" />
            Track Order
          </Link>
        </div>
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

  return (
    <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
          price={displayPrice}
          priceSuffix={priceSuffix}
          variantName={variantName}
          href={detailHref}
        />
      </div>

      <div className="px-4 pb-2 pt-0">
        <p className="text-sm text-gray-500">
          We&apos;ll notify you when your product ships.
        </p>
      </div>
      <OrderSummaryAccordion order={order} />
    </li>
  );
}

// ─── shared sub-components ───────────────────────────────────────────────────

function CardHeader({ oid, placed, isSell, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
      <div>
        <p className="font-bold text-black">Order #{oid}</p>
        <p className="text-sm text-gray-500 mt-0.5">Placed on: {placed}</p>
      </div>
      {children}
    </div>
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

function ServiceBookingCard({
  booking,
  onReschedule,
  onCancel,
  onOpenServiceReview,
}) {
  console.log('booking.serviceProduct:', booking?.serviceProduct);
  console.log('booking.serviceSnapshot:', booking?.serviceSnapshot);
  const title =
    booking?.serviceSnapshot?.productName ||
    booking?.serviceProduct?.productName ||
    'Service booking';
  const img =
    booking?.serviceSnapshot?.image || booking?.serviceProduct?.image || '';
  const oid = `SRV-${String(booking?._id || '')
    .slice(-3)
    .toUpperCase()}`;
  const rawStatus = String(booking?.status || 'pending');

  const status =
    booking?.status === 'completed'
      ? 'Completed'
      : booking?.status === 'cancelled'
        ? 'Cancelled'
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
    console.log('resolved productId for review check:', productId, booking);
    if (!productId) return;
    apiGetMyServiceReview(String(productId))
      .then((res) => setHasReview(res.data?.exists === true))
      .catch(() => setHasReview(false))
      .finally(() => setReviewChecked(true));
  }, [booking?.status, booking?.serviceProduct]);

  return (
    <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100">
        <div>
          <p className="font-bold text-black">Order #{oid}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Booked on: {formatOrderDate(booking?.createdAt)}
          </p>
        </div>
        {/* <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${statusClass}`}
        >
          {status}
        </span> */}
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
            {serviceDetailHref ? (
              <Link
                href={serviceDetailHref}
                className="font-semibold text-black hover:text-[#FF6F00] transition-colors"
              >
                {title}
              </Link>
            ) : (
              <p className="font-semibold text-black">{title}</p>
            )}
            <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
              ₹{formatMoney(booking?.totalAmount || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
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
                    // onOpenServiceReview?.({
                    //   serviceProductId:
                    //     booking?.serviceProduct?._id ||
                    //     booking?.serviceProduct ||
                    //     booking?.serviceSnapshot?.serviceProductId,
                    //   serviceName: title,
                    //   image: img,
                    //   vendorName:
                    //     booking.serviceSnapshot?.vendorName ||
                    //     booking.vendor?.fullName ||
                    //     'Service Provider',
                    // })

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
                  <RescheduleButton
                    booking={booking}
                    onReschedule={onReschedule}
                  />
                  <button
                    type="button"
                    className="flex-[3] py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
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
                    Cancelled on{' '}
                    {formatOrderDate(booking.cancelledAt || booking.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
      <div className="min-w-0 flex-1">
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
        </div>
        {qty > 1 ? (
          <p className="text-sm text-gray-500 mt-0.5">Qty: {qty}</p>
        ) : null}
        <p className={`text-base font-bold ${ORANGE_TEXT} mt-1`}>
          ₹{formatMoney(price)}
          {priceSuffix ? (
            <span className="text-sm font-medium text-gray-500 ml-1">
              {priceSuffix}
            </span>
          ) : null}
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
