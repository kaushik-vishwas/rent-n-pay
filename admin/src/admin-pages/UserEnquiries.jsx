'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Eye, X } from 'lucide-react';
import { apiAdminGetContactEnquiries } from '@/service/api';

const truncateWords = (text, limit = 3) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '...';
};

const UserEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewTarget, setViewTarget] = useState(null);
  const PAGE_SIZE = 10;

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const fetchEnquiries = () => {
    setLoading(true);
    setError('');
    apiAdminGetContactEnquiries(getToken())
      .then((res) => setEnquiries(res.data.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || 'Failed to fetch enquiries'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredEnquiries = enquiries.filter((en) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(en.fullName || '')
        .toLowerCase()
        .includes(q) ||
      String(en.email || '')
        .toLowerCase()
        .includes(q) ||
      String(en.phone || '')
        .toLowerCase()
        .includes(q) ||
      String(en.subject || '')
        .toLowerCase()
        .includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEnquiries.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 mb-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, subject..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <button
          onClick={fetchEnquiries}
          className="p-2 rounded-lg bg-orange-400 hover:bg-orange-500 shrink-0"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-orange-100" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-gray-50 text-gray-600 text-center">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">
                  Submitted
                </th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">
                  Subject
                </th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">
                  Full Name
                </th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">
                  Email
                </th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">
                  Phone
                </th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : pagedEnquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No enquiries found
                  </td>
                </tr>
              ) : (
                pagedEnquiries.map((en) => (
                  <tr key={en._id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-center text-gray-500 text-xs whitespace-nowrap">
                      {en.createdAt
                        ? new Date(en.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-800">
                      {truncateWords(en.subject, 3)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 whitespace-nowrap">
                      {en.fullName}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 whitespace-nowrap">
                      {en.email}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 whitespace-nowrap">
                      {en.phone}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 max-w-sm">
                      {truncateWords(en.message, 3)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewTarget(en)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredEnquiries.length > 0 ? (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <span className="text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, filteredEnquiries.length)} of{' '}
              {filteredEnquiries.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-orange-600 text-white">
                {currentPage}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {viewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewTarget(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <p className="text-base font-semibold text-gray-900">
                Enquiry Details
              </p>
            </div>

            <div className="px-5 py-5 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Submitted
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewTarget.createdAt
                      ? new Date(viewTarget.createdAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {viewTarget.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {viewTarget.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {viewTarget.phone}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Subject
                </p>
                <div className="max-h-24 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900 break-words whitespace-pre-wrap">
                    {viewTarget.subject}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Message
                </p>
                <div className="max-h-60 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 px-3 py-3">
                  <p className="text-sm text-gray-800 break-words whitespace-pre-wrap leading-relaxed">
                    {viewTarget.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setViewTarget(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEnquiries;
