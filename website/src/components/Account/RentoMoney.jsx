'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import Rentomoney from '@/assets/icons/Rentomoney.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGetMyOrders } from '@/lib/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const statusBadge = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'delivered' || v === 'completed' || v === 'confirmed')
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (v === 'cancelled') return 'bg-rose-50 text-rose-800 border-rose-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

export default function RentoMoney() {
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const TRANSACTIONS_PER_PAGE = 10;

  // useEffect(() => {
  //   const token = localStorage.getItem('userToken');
  //   if (!token) {
  //     setError('Please login again.');
  //     setLoading(false);
  //     return;
  //   }
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((r) => r.json())
  //     .then((data) => {
  //       // backend returns an array directly
  //       setOrders(Array.isArray(data) ? data : []);
  //     })
  //     .catch(() => setError('Failed to load transactions.'))
  //     .finally(() => setLoading(false));
  // }, []);
  useEffect(() => {
    apiGetMyOrders()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  const totalDepositPaid = orders.reduce((sum, order) => {
    return (
      sum +
      (order.products || []).reduce((s, line) => {
        const active = [
          'delivered',
          'confirmed',
          'shipped',
          'pending',
        ].includes(String(line.lineStatus || order.status).toLowerCase());
        if (!active) return s;
        return s + Number(line.refundableDeposit || 0);
      }, 0)
    );
  }, 0);

  const depositRefunded = orders.reduce((sum, order) => {
    return (
      sum +
      (order.products || []).reduce((s, line) => {
        const isCancelled =
          String(line.lineStatus || order.status).toLowerCase() === 'cancelled';
        if (!isCancelled) return s;

        const rr = line?.returnRequest;
        const hasReturnTracking = Boolean(rr?.requestedAt);

        const refundAmt = hasReturnTracking
          ? Number(rr?.finalRefundAmount || line.refundableDeposit || 0)
          : Number(line.pricePerDay || 0) * Number(line.quantity || 1);

        return s + refundAmt;
      }, 0)
    );
  }, 0);

  const refundableBalance = totalDepositPaid - depositRefunded;

  const transactions = orders.flatMap((order) =>
    (order.products || []).map((line) => ({
      _id: `${order._id}-${line._id}`,
      orderId: order._id,
      date: order.createdAt,
      amount:
        Number(line.pricePerDay || 0) *
        Number(order.rentalDuration || 1) *
        Number(line.quantity || 1),
      status: line.lineStatus || order.status,
      description: line.product?.productName || '—',
      deposit: Number(line.refundableDeposit || 0),
    })),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE),
  );
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * TRANSACTIONS_PER_PAGE,
    currentPage * TRANSACTIONS_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        {/* <h2 className="text-lg font-semibold text-gray-900">Rent Money</h2> */}
        {/* <p className="mt-0.5 text-sm text-gray-500">
          View your rental orders, paid amounts, and transaction history.
        </p> */}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-emerald-100">
                Total Refundable Balance
              </p>
              <p className="mt-1 text-4xl text-yellow-400 font-bold">
                {money(refundableBalance)}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={Rentomoney.src}
                alt="Rento Money"
                className="w-48 h-48 shrink-0"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-500">
            Deposit Balance (Item Level)
          </p>
          <p className="text-3xl font-bold text-gray-900">
            {money(refundableBalance)}
          </p>
          <div className="space-y-1.5 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Deposit Paid</span>
              <span className="font-medium text-gray-800">
                {money(totalDepositPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-rose-500">Deposit Refunded</span>
              <span className="font-medium text-rose-600">
                -{money(depositRefunded)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-1.5">
              <span className="text-gray-500">Refundable Balance</span>
              <span className="font-semibold text-emerald-700">
                {money(refundableBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="font-semibold text-gray-900">Transaction History</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">
                  Product Name
                </th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length ? (
                paginatedTransactions.map((o) => (
                  <tr
                    key={o._id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                      TXN-{String(o.orderId).slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {formatDate(o.date)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {o.description || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                      {money(o.amount)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${statusBadge(o.status)}`}
                      >
                        {o.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {transactions.length > TRANSACTIONS_PER_PAGE && (
          <div className="flex items-center justify-center border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6F00] text-sm font-semibold text-white">
                {currentPage}
              </span>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
}
