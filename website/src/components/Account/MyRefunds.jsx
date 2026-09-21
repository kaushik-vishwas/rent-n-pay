// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { CheckCircle2, ExternalLink, Package } from 'lucide-react';
// import { apiGetMyOrders } from '@/lib/api';
// import {
//   formatMoney,
//   formatOrderDate,
//   orderDisplayId,
//   normalizeStatus,
//   productImageUrl,
// } from '@/lib/orderRentalUtils';

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

// function lineAmount(line) {
//   const unitPrice = Number(line?.pricePerDay || line?.price || 0);
//   const qty = Number(line?.quantity || 1);
//   return unitPrice * qty;
// }

// function lineImage(line) {
//   const p = line?.product;
//   if (!p || typeof p !== 'object') return '';

//   const variantName = line?.variantName || '';
//   if (variantName) {
//     const variants = Array.isArray(p?.variants) ? p.variants : [];
//     const matchedVariant = variants.find(
//       (v) =>
//         String(v?._id || '') === String(line?.variantId || '') ||
//         String(v?.variantName || '') === variantName,
//     );
//     if (matchedVariant) {
//       const variantIdx = variants.indexOf(matchedVariant);
//       const allImgs = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
//       if (allImgs.length > 1 && variants.length > 1) {
//         const perVariant = Math.ceil(allImgs.length / variants.length);
//         const start = variantIdx * perVariant;
//         const slice = allImgs.slice(start, start + perVariant);
//         if (slice[0]) return productImageUrl(slice[0]);
//       }
//     }
//   }

//   return productImageUrl(p?.image || '');
// }

// export default function MyRefunds() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     apiGetMyOrders()
//       .then((res) => setOrders(res.data || []))
//       .catch((err) =>
//         setError(err.response?.data?.message || 'Failed to load refunds.'),
//       )
//       .finally(() => setLoading(false));
//   }, []);

//   const refundRows = useMemo(() => {
//     const rows = [];
//     for (const order of orders) {
//       const lines = order.products || [];
//       for (const line of lines) {
//         const lineCancelled =
//           normalizeStatus(line?.lineStatus || order.status) === 'cancelled';
//         if (!lineCancelled) continue;

//         const rr = line?.returnRequest;
//         const hasReturnTracking = Boolean(rr?.requestedAt);
//         const refundAmount = hasReturnTracking
//           ? rr?.finalRefundAmount || lineRefundableDeposit(line)
//           : lineAmount(line);

//         const p = line?.product;
//         const title =
//           (p && typeof p === 'object' ? p.productName || p.title : null) ||
//           line?.variantName ||
//           'Product';

//         rows.push({
//           key: `${order._id}-${line._id}`,
//           orderId: order._id,
//           orderRef: orderDisplayId(order),
//           title,
//           image: lineImage(line),
//           refundAmount,
//           date: hasReturnTracking
//             ? rr.requestedAt
//             : order.updatedAt || order.createdAt,
//           hasReturnTracking,
//         });
//       }
//     }
//     return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
//   }, [orders]);

//   const totalRefunded = refundRows.reduce(
//     (sum, r) => sum + Number(r.refundAmount || 0),
//     0,
//   );

//   if (loading) {
//     return (
//       <div className="flex justify-center py-16">
//         <div className="w-8 h-8 border-4 border-[#FF6F00] border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-4">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
//         <h2 className="text-xl font-bold text-black">My Refunds</h2>
//         <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
//           Total: ₹{formatMoney(totalRefunded)}
//         </span>
//       </div>

//       {refundRows.length === 0 ? (
//         <div className="text-center rounded-xl border border-dashed border-gray-300 bg-white/80 py-14 px-4">
//           <p className="text-gray-700 font-medium">No refunds yet</p>
//         </div>
//       ) : (
//         <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {refundRows.map((r) => (
//             <li
//               key={r.key}
//               className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col transition-transform duration-200 hover:scale-[1.03] hover:shadow-md"
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div className="min-w-0 flex-1">
//                   <p className="font-semibold text-black truncate">{r.title}</p>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Order #{r.orderRef}
//                   </p>
//                   <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-[#FF6F00]">
//                     {r.image ? (
//                       <img
//                         src={r.image}
//                         alt={r.title}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-gray-400">
//                         <Package className="w-6 h-6" />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {/* <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
//                   <Package className="w-3.5 h-3.5" />
//                   Cancelled
//                 </span> */}
//               </div>

//               <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium mt-3">
//                 Refund Amount: ₹{formatMoney(r.refundAmount)}
//               </p>
//               <p className="text-xs text-gray-500 mt-1">
//                 {r.hasReturnTracking ? 'Refunded' : 'Cancelled'} on{' '}
//                 {formatOrderDate(r.date)}
//               </p>

//               {r.hasReturnTracking ? (
//                 <Link
//                   href={`/orders/return-status?orderId=${encodeURIComponent(r.orderId)}`}
//                   className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black mt-2"
//                 >
//                   View Refund Details
//                   <ExternalLink className="w-3.5 h-3.5" />
//                 </Link>
//               ) : null}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Package } from 'lucide-react';
import { apiGetMyOrders } from '@/lib/api';
import {
  formatMoney,
  formatOrderDate,
  orderDisplayId,
  normalizeStatus,
  productImageUrl,
} from '@/lib/orderRentalUtils';

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

function lineAmount(line) {
  const unitPrice = Number(line?.pricePerDay || line?.price || 0);
  const qty = Number(line?.quantity || 1);
  return unitPrice * qty;
}

function lineCancelRefundAmount(line, order) {
  const rb = line?.refundBreakdown || {};
  const otherTaxes =
    Number(order?.gst || 0) +
    Number(order?.careProtection || 0) +
    Number(order?.repairWarranty || 0) +
    Number(order?.relocationWarranty || 0) +
    Number(order?.deliveryPackaging || 0) +
    Number(order?.installationFee || 0) +
    Number(order?.platformFee || 0) +
    Number(order?.deliveryFee || 0);

  const totalPaidAmount =
    Number(rb.productPrice || 0) + Number(rb.deposit || 0) + otherTaxes;

  const isVendorCancelled = line?.cancelledBy === 'vendor';
  const feePct = isVendorCancelled ? 0 : Number(rb.feePct || 10);
  const deduction = isVendorCancelled
    ? 0
    : totalPaidAmount > 0
      ? Math.round((totalPaidAmount * feePct) / 100)
      : 0;

  return isVendorCancelled
    ? totalPaidAmount
    : Math.max(0, totalPaidAmount - deduction);
}

function lineImage(line) {
  const p = line?.product;
  if (!p || typeof p !== 'object') return '';

  const variantName = line?.variantName || '';
  if (variantName) {
    const variants = Array.isArray(p?.variants) ? p.variants : [];
    const matchedVariant = variants.find(
      (v) =>
        String(v?._id || '') === String(line?.variantId || '') ||
        String(v?.variantName || '') === variantName,
    );
    if (matchedVariant) {
      const variantIdx = variants.indexOf(matchedVariant);
      const allImgs = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
      if (allImgs.length > 1 && variants.length > 1) {
        const perVariant = Math.ceil(allImgs.length / variants.length);
        const start = variantIdx * perVariant;
        const slice = allImgs.slice(start, start + perVariant);
        if (slice[0]) return productImageUrl(slice[0]);
      }
    }
  }

  return productImageUrl(p?.image || '');
}

const PAGE_SIZE = 9;

export default function MyRefunds() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiGetMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load refunds.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const refundRows = useMemo(() => {
    const rows = [];
    for (const order of orders) {
      const lines = order.products || [];
      for (const line of lines) {
        const lineCancelled =
          normalizeStatus(line?.lineStatus || order.status) === 'cancelled';
        if (!lineCancelled) continue;

        const rr = line?.returnRequest;
        const hasReturnTracking = Boolean(rr?.requestedAt);
        const refundAmount = hasReturnTracking
          ? rr?.finalRefundAmount || lineRefundableDeposit(line)
          : lineCancelRefundAmount(line, order);

        const p = line?.product;
        const title =
          (p && typeof p === 'object' ? p.productName || p.title : null) ||
          line?.variantName ||
          'Product';

        rows.push({
          key: `${order._id}-${line._id}`,
          orderId: order._id,
          orderRef: orderDisplayId(order),
          title,
          image: lineImage(line),
          refundAmount,
          date: hasReturnTracking
            ? rr.requestedAt
            : order.updatedAt || order.createdAt,
          hasReturnTracking,
          cancelledByVendor: line?.cancelledBy === 'vendor',
        });
      }
    }
    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders]);

  const totalRefunded = refundRows.reduce(
    (sum, r) => sum + Number(r.refundAmount || 0),
    0,
  );

  const totalPages = Math.max(1, Math.ceil(refundRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [orders]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = refundRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#FF6F00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-black">My Refunds</h2>
        <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          Total: ₹{formatMoney(totalRefunded)}
        </span>
      </div>

      {refundRows.length === 0 ? (
        <div className="text-center rounded-xl border border-dashed border-gray-300 bg-white/80 py-14 px-4">
          <p className="text-gray-700 font-medium">No refunds yet</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageRows.map((r) => (
            <li
              key={r.key}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col transition-transform duration-200 hover:scale-[1.03] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-black truncate">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Order #{r.orderRef}
                  </p>
                  <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-[#FF6F00]">
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>
                {/* <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <Package className="w-3.5 h-3.5" />
                  Cancelled
                </span> */}
              </div>

              <p className="text-sm flex items-center gap-1.5 text-emerald-600 font-medium mt-3">
                Refund Amount: ₹{formatMoney(r.refundAmount)}
              </p>
              {/* <p className="text-xs text-gray-500 mt-1">
                {r.hasReturnTracking ? 'Refunded' : 'Cancelled'} on{' '}
                {formatOrderDate(r.date)}
              </p> */}
              <p className="text-xs text-gray-500 mt-1">
                {r.hasReturnTracking
                  ? 'Refunded'
                  : r.cancelledByVendor
                    ? 'Cancelled by vendor'
                    : 'Cancelled'}{' '}
                on {formatOrderDate(r.date)}
              </p>

              {r.hasReturnTracking ? (
                <Link
                  href={`/orders/return-status?orderId=${encodeURIComponent(r.orderId)}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black mt-2"
                >
                  View Refund Details
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {refundRows.length > 0 && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 mt-6">
          <p className="text-xs text-gray-500">
            Page {safePage} of {totalPages} · {refundRows.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <span className="min-w-[2rem] h-9 px-3 rounded-lg text-sm font-semibold flex items-center justify-center bg-[#FF6F00] text-white">
              {safePage}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
