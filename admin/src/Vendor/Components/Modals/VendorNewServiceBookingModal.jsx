'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Flame,
  MapPin,
  X,
  CircleCheck,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import {
  apiGetVendorServiceBooking,
  apiUpdateVendorServiceBookingStatus,
  apiCancelVendorServiceBooking,
} from '@/service/api';
import { toast } from 'react-toastify';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function VendorNewServiceBookingModal({
  open,
  bookingId,
  getToken,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [acting, setActing] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const load = useCallback(async () => {
    if (!bookingId || !open) return;
    const token = getToken?.();
    if (!token) {
      setError('Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiGetVendorServiceBooking(bookingId, token);
      setBooking(res.data);
    } catch (e) {
      setBooking(null);
      setError(e?.response?.data?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId, open, getToken]);

  useEffect(() => {
    if (open && bookingId) load();
    if (!open) {
      setBooking(null);
      setError('');
      setDeclineOpen(false);
      setDeclineReason('');
    }
  }, [open, bookingId, load]);

  if (!open) return null;

  const title = booking?.serviceSnapshot?.productName || 'Service';
  const customerName = booking?.user?.fullName || booking?.name || 'Customer';
  const address = booking?.address || '';

  const handleAccept = async () => {
    const token = getToken?.();
    if (!token || !bookingId) return;
    setActing(true);
    try {
      await apiUpdateVendorServiceBookingStatus(bookingId, 'confirmed', token);
      toast.success('Booking accepted.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vendor-orders-changed'));
      }
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not accept booking');
    } finally {
      setActing(false);
    }
  };

  // const handleDecline = async () => {
  //   const token = getToken?.();
  //   if (!token || !bookingId) return;
  //   setActing(true);
  //   try {
  //     await apiCancelVendorServiceBooking(
  //       bookingId,
  //       declineReason || 'Vendor unavailable',
  //       token,
  //     );
  const handleDecline = async () => {
    const token = getToken?.();
    if (!token || !bookingId) return;
    setActing(true);
    try {
      await apiCancelVendorServiceBooking(
        bookingId,
        'Vendor unavailable',
        token,
      );
      toast.success('Booking declined.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vendor-orders-changed'));
      }
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not decline booking');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[min(92vh,720px)] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : booking ? (
          <>
            <div className="bg-gradient-to-r from-[#F97316] to-orange-500 text-white px-4 py-3 flex items-center gap-2 rounded-t-2xl">
              <Flame className="w-5 h-5 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold truncate">
                New Service Booking
              </h2>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Customer</p>
                <p className="text-lg font-bold text-gray-900">
                  {customerName}
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                  {address || 'Address on file'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {booking?.bookingDate
                    ? new Date(booking.bookingDate).toLocaleDateString('en-IN')
                    : '-'}{' '}
                  · {booking?.timeSlot?.label || '-'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 inline-flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-[#F97316]" />
                  Booking Amount
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {money(booking?.totalAmount)}
                </p>
              </div>

              {/* {!declineOpen ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={handleAccept}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    <CircleCheck className="w-4 h-4" />
                    Accept Booking
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => setDeclineOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-300 text-red-700 bg-white hover:bg-red-50 text-sm font-semibold disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Reason for declining
                  </p>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="e.g. Not available on this date"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeclineOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={handleDecline}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {acting ? 'Declining...' : 'Confirm Decline'}
                    </button>
                  </div>
                </div>
              )} */}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={acting}
                  onClick={handleAccept}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  <CircleCheck className="w-4 h-4" />
                  Accept Booking
                </button>
                <button
                  type="button"
                  disabled={acting}
                  onClick={handleDecline}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-300 text-red-700 bg-white hover:bg-red-50 text-sm font-semibold disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  {acting ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
