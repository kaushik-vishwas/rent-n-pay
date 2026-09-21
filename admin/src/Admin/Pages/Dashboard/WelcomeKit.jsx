'use client';

import { useEffect, useMemo, useState } from 'react';
import { Gift, Search } from 'lucide-react';
import { apiGetWelcomeKitList } from '@/service/api';

const statusBadgeClass = (status) => {
  if (status === 'approved')
    return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  if (status === 'rejected')
    return 'bg-rose-50 text-rose-600 border border-rose-200';
  return 'bg-amber-50 text-amber-600 border border-amber-200';
};

const WelcomeKit = () => {
  const [kit, setKit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setError('Not authenticated.');
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGetWelcomeKitList(token)
      .then((res) => setKit(res.data?.kit ?? []))
      .catch((err) =>
        setError(
          err.response?.data?.message || 'Failed to load welcome kit data',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredKit = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return kit;
    return kit.filter((v) => v.vendorName?.toLowerCase().includes(q));
  }, [kit, query]);

  const totalPages = Math.max(1, Math.ceil(filteredKit.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedKit = filteredKit.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="min-h-full bg-[#f2f4f8] -m-3 sm:-m-4 md:-m-6 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {loading && (
          <p className="text-sm text-gray-400">Loading welcome kit data…</p>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Vendor Sizing Details
            </h2>
            <div className="relative w-full md:max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by vendor name..."
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-center px-4 py-3">Vendor Name</th>
                  <th className="text-center px-4 py-3">T-Shirt Size</th>
                  <th className="text-center px-4 py-3">Jeans/Waist Size</th>
                  <th className="text-center px-4 py-3">Shoe Size</th>
                  <th className="text-center px-4 py-3">KYC Status</th>
                </tr>
              </thead>
              <tbody>
                {pagedKit.map((v) => (
                  <tr key={v.vendorId} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {v.vendorName}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {v.tshirtSize}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {v.jeansWaistSize}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {v.shoeSize}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadgeClass(v.kycStatus)}`}
                      >
                        {v.kycStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredKit.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 border-t border-gray-100">
              No vendor welcome kit data found.
            </div>
          )}
          {filteredKit.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm">
              <p className="text-gray-500">
                Showing{' '}
                {(currentPage - 1) * pageSize + (pagedKit.length ? 1 : 0)}-
                {(currentPage - 1) * pageSize + pagedKit.length} of{' '}
                {filteredKit.length.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeKit;
