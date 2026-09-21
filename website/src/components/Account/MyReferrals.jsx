'use client';
import { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { fetchReferralDashboard } from '@/lib/api';

const PAGE_SIZE = 10;

export default function MyReferrals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchReferralDashboard();
        setData(res.data);
      } catch (err) {
        setError('Failed to load referral data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';

  const referees = data?.referees || [];
  const totalPages = Math.ceil(referees.length / PAGE_SIZE);
  const paginated = referees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="p-4 border-b">
        <p className="text-base font-bold flex items-center gap-2">
          My Referral Activity
        </p>
      </div>
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-w-[1300px]">
          <div className="grid grid-cols-7 bg-gray-50 text-xs text-gray-500 font-medium p-4 gap-4">
            <div>REFEREE (B)</div>
            <div>JOIN DATE</div>
            <div>EARNING AMOUNT</div>
            <div>EARNED DATE</div>
            <div>PAYMENT DATE</div>
            <div>TRANSACTION ID</div>
            <div>PAYMENT STATUS</div>
          </div>

          {referees.length === 0 && (
            <div className="p-8 text-center text-[#64748B] text-sm">
              You haven&apos;t referred anyone yet.
            </div>
          )}

          {paginated.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-7 items-center p-4 border-t hover:bg-gray-50 text-sm gap-4"
            >
              <div className="flex items-center gap-3">
                {/* <div className="w-8 h-8 uppercase rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white flex items-center justify-center text-xs font-bold">
                  {r.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div> */}
                <p className="text-sm font-medium">{r.name}</p>
              </div>

              <div className="text-sm text-gray-500">{fmtDate(r.joinedAt)}</div>

              <div>
                {r.status === 'Order Placed' ? (
                  <>
                    <p className="text-sm font-semibold text-[#00A63E]">
                      ₹{r.commissionEarned}
                    </p>
                    {/* <p className="text-xs font-medium text-[#64748B]">
                      After ₹1,000 cap
                    </p> */}
                  </>
                ) : (
                  <p className="text-xs text-yellow-600 font-medium">
                    No commission yet
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-500">
                {fmtDate(r.commissionEarnedAt)}
              </div>

              <div className="text-sm text-gray-500">{fmtDate(r.paidAt)}</div>

              <div className="text-xs text-gray-600 break-all">
                {r.transactionId || '—'}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    r.paymentStatus === 'paid'
                      ? 'bg-[#F0FDF4] text-[#00A63E] font-semibold border border-[#B9F8CF]'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {r.paymentStatus === 'paid' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  {r.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {referees.length > 0 && (
        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {referees.length} referee{referees.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 rounded bg-orange-500 text-white text-xs font-semibold">
              {page}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
