import Order from '../models/Order.js';
import ServiceBooking from '../models/ServiceBooking.js';

// Builds the SAME global "oldest invoice = 1, next = 2..." map used by the
// Admin Invoices table (mirrors invoiceNumberMap in SystemInvoices.jsx),
// but computed once on the backend so Admin and User sides always agree.
// Key = the invoice's "group key": INV-{last6ofOrderId} for orders
// (matches product-line 0 / month 1), and INV-SVC-{last6ofBookingId} for
// service bookings.
export const buildGlobalInvoiceNumberMap = async () => {
  const orders = await Order.find({}).select('_id createdAt').lean();
  const bookings = await ServiceBooking.find({}).select('_id createdAt').lean();

  const entries = [
    ...orders.map((o) => ({
      key: `INV-${String(o._id).slice(-6).toUpperCase()}`,
      date: o.createdAt,
    })),
    ...bookings.map((b) => ({
      key: `INV-SVC-${String(b._id).slice(-6).toUpperCase()}`,
      date: b.createdAt,
    })),
  ];

  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  const map = {};
  entries.forEach((e, idx) => {
    map[e.key] = idx + 1;
  });
  return map;
};

export const formatDisplayInvoiceNo = (key, numberMap) => {
  const num = numberMap[key];
  if (!num) return key;
  return `INV-${String(num).padStart(4, '0')}`;
};
