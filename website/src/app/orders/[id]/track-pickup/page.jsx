'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  MapPin,
  CreditCard,
  Package,
  CheckCircle2,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { apiGetMyOrderById } from '@/lib/api';
import {
  formatMoney,
  formatOrderDate,
  orderDisplayId,
  orderGrandTotal,
  orderProductLines,
  lineIsPurchase,
  productImageUrl,
} from '@/lib/orderRentalUtils';
import { downloadOrderInvoicePDF } from '@/lib/orderInvoicePdf';

const ORANGE_TEXT = 'text-[#FF6F00]';
const BLUE_LINK = 'text-sky-600 hover:text-sky-700';
const BLUE_BTN =
  'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-sky-600 text-sky-600 text-sm font-semibold hover:bg-sky-50 transition-colors';

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

// Two-stage stepper: Requested -> Pickup Scheduled
function PickupStepper({ isScheduled }) {
  const labels = ['Requested', 'Pickup Scheduled'];
  const stepComplete = [true, isScheduled];

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-start min-w-[240px] sm:min-w-0">
        {labels.flatMap((label, i) => {
          const done = stepComplete[i];
          const circleClass = done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-blue-50 border-blue-400 text-blue-500';

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
                ) : (
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <p
                className={`mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight px-0.5 ${
                  done ? 'text-gray-800' : 'text-blue-600'
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
                  className={`h-full rounded-full ${isScheduled ? 'w-full bg-emerald-500' : 'w-0'}`}
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

export default function PickupOrderTrackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const lineIdx = Number(searchParams?.get('lineIdx') ?? 0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const rr = selectedLine?.returnRequest || null;
  const isScheduled = Boolean(rr?.pickupScheduledAt);

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
              // onClick={() => downloadInvoiceStub(order, displayRef, grandTotal)}
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
          <h2 className="text-base font-bold text-black">Pickup Status</h2>
          <div className="mt-6">
            <PickupStepper isScheduled={isScheduled} />
          </div>
          <div
            className={`mt-6 inline-flex w-auto max-w-full items-center gap-1 rounded-lg border-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-black ${
              isScheduled
                ? 'bg-[#F0FDF4] border-[#B9F8CF]'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            {isScheduled ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <Calendar className="w-4 h-4 shrink-0 text-blue-600" />
            )}
            <p
              className={`text-xs sm:text-sm font-semibold whitespace-nowrap sm:whitespace-normal ${
                isScheduled ? 'text-emerald-700' : 'text-blue-700'
              }`}
            >
              {isScheduled
                ? `Pickup scheduled on ${formatOrderDate(rr.pickupScheduledAt)}`
                : "We've received your return request."}
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
      </div>
    </div>
  );
}
