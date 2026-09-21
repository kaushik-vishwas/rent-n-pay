'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  X,
  Send,
  IndianRupee,
  MessagesSquare,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  apiAdminGetInvestorEnquiry,
  apiAdminListInvestorEnquiries,
  apiAdminMarkInvestorEnquiryRead,
} from '@/service/api';
import investmentIcon from '@/assets/icons/inverstment.png';

function cls(...p) {
  return p.filter(Boolean).join(' ');
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function moneyLabel(raw) {
  const s = String(raw || '').trim();
  return s || '—';
}

export default function InvestmentProposals() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [activeLoading, setActiveLoading] = useState(false);
  const [active, setActive] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const load = async (opts = {}) => {
    if (!token) {
      setError('Please login again to continue.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiAdminListInvestorEnquiries(token, opts);
      setRows(Array.isArray(res.data?.enquiries) ? res.data.enquiries : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load enquiries.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      return (
        String(r.fullName || '')
          .toLowerCase()
          .includes(q) ||
        String(r.companyName || '')
          .toLowerCase()
          .includes(q) ||
        String(r.subject || '')
          .toLowerCase()
          .includes(q)
      );
    });
  }, [rows, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const openDrawer = async (id) => {
    if (!token) return;
    setDrawerOpen(true);
    setActiveId(id);
    setActiveLoading(true);
    setActive(null);
    try {
      const res = await apiAdminGetInvestorEnquiry(id, token);
      const enquiry = res.data?.enquiry || null;
      setActive(enquiry);
      if (enquiry && enquiry.isRead !== true) {
        await apiAdminMarkInvestorEnquiryRead(id, true, token);
        setRows((prev) =>
          prev.map((x) => (x._id === id ? { ...x, isRead: true } : x)),
        );
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load enquiry details.');
    } finally {
      setActiveLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveId('');
    setActive(null);
  };

  return (
    <div className="min-h-full bg-[#f2f4f8] -m-3 sm:-m-4 md:-m-6 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center mt-1 justify-center rounded-lg bg-[#9810FA] text-white">
              <Send className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-black">
                Investment Proposals
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage incoming investment enquiries and capital proposals
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by investor, company, or subject..."
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#64748B]">
              Showing {filtered.length} of {rows.length} enquiries
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading enquiries…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No enquiries found.
              </div>
            ) : (
              // filtered.map((r) => (
              //   <button
              //     key={r._id}
              //     type="button"
              //     onClick={() => openDrawer(r._id)}
              //     className="w-full text-left px-4 sm:px-5 py-4 hover:bg-slate-50 transition"
              //   >
              //     <div className="flex items-center justify-between gap-4">
              //       <div className="flex items-start gap-3 min-w-0">
              //         <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              //           <User className="h-4 w-4" />
              //         </div>
              //         <div className="min-w-0">
              //           <div className="flex items-center gap-2">
              //             <p className="font-semibold text-black truncate">
              //               {r.fullName}
              //             </p>
              //             {r.isRead ? null : (
              //               <span className="inline-flex rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              //                 Unread
              //               </span>
              //             )}
              //           </div>
              //           <p className="text-xs text-slate-500 truncate">
              //             {r.companyName || r.subject || '—'}
              //           </p>
              //         </div>
              //       </div>

              //       <div className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
              //         <div className="flex items-center gap-2">
              //           <Calendar className="h-4 w-4 text-slate-400" />
              //           <div>
              //             <p className="text-black font-medium">
              //               {fmtDate(r.createdAt)}
              //             </p>
              //             <p className="text-xs text-slate-500">
              //               {fmtTime(r.createdAt)}
              //             </p>
              //           </div>
              //         </div>
              //         <p className="font-semibold text-black">
              //           {moneyLabel(r.investmentRange)}
              //         </p>
              //       </div>

              //       <div className="sm:hidden text-right">
              //         <p className="text-xs text-slate-500">
              //           {fmtDate(r.createdAt)}
              //         </p>
              //         <p className="text-sm font-semibold text-black">
              //           {moneyLabel(r.investmentRange)}
              //         </p>
              //       </div>
              //     </div>
              //   </button>
              // ))
              paginatedData.map((r) => (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => openDrawer(r._id)}
                  className="w-full text-left px-4 sm:px-5 py-4 hover:bg-slate-50 transition"
                >
                  <div className="grid grid-cols-12 items-center gap-4">
                    {/* Date */}
                    <div className="col-span-3 sm:col-span-2">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-black">
                            {fmtDate(r.createdAt)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {fmtTime(r.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Name + company */}
                    <div className="col-span-5 sm:col-span-4 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex mt-1 h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF5FF] text-[#9810FA]">
                          <User className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-black truncate">
                              {r.fullName}
                            </p>

                            {/* {!r.isRead && (
                              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                                Unread
                              </span>
                            )} */}
                          </div>

                          {/* <p className="text-xs text-slate-500 truncate">
                            {r.companyName || '—'}
                          </p> */}
                          <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                            <img
                              src={investmentIcon.src}
                              alt="Investment"
                              className="w-3.5 h-3.5 shrink-0"
                            />
                            <p className="truncate">{r.companyName || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price moved near name */}
                    {/* <div className="col-span-4 sm:col-span-3">
                      <p className="text-sm font-semibold text-black">
                        {moneyLabel(r.investmentRange)}
                      </p>
                    </div> */}
                    {/* Price moved near name */}
                    <div className="col-span-4 sm:col-span-3">
                      <p className="text-sm font-semibold text-black flex items-center gap-0.5">
                        <IndianRupee size={12} className="mt-1" />
                        {moneyLabel(r.investmentRange)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        {/* {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-lg border border-slate-200 disabled:opacity-40"
            >
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cls(
                    'px-3 py-1 text-sm rounded-lg border',
                    currentPage === i + 1
                      ? 'bg-[#9810FA] text-white border-[#9810FA]'
                      : 'border-slate-200',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-lg border border-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )} */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Current Page Only */}
            <div className="px-3 py-1 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50">
              {currentPage}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-start justify-between gap-3">
              {/* <div>
                <h2 className="text-xl font-bold text-black">
                  Investment Enquiry Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ENQ-
                  {String(activeId || '')
                    .slice(-4)
                    .toUpperCase()}
                </p>
              </div> */}
              <div>
                <h2 className="text-xl font-bold text-black">
                  Investment Enquiry Details
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  ENQ-
                  {String(activeId || '')
                    .slice(-4)
                    .toUpperCase()}
                </p>

                {/* Unread badge moved here */}
                {!active?.isRead && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#E9D4FF] bg-[#FAF5FF] px-2 py-1 text-[11px] font-semibold text-[#8200DB]">
                    <Mail size={12} className="text-[#8200DB]" />
                    Unread
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-[#F3F4F6] text-[#64748B] "
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {activeLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  Loading details…
                </div>
              ) : !active ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  Select an enquiry to view details.
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-[#F3E8FF] bg-[#FAF5FF] p-4">
                    <p className="text-sm font-semibold text-black">
                      Investor Information
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#9810FA]" />
                        <div>
                          <p className="text-xs text-slate-500">Full Name</p>
                          <p className="font-semibold text-black">
                            {active.fullName || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#9810FA]" />
                        <div>
                          <p className="text-xs text-slate-500">
                            Company / Firm Name
                          </p>
                          <p className="font-semibold text-black">
                            {active.companyName || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
                    <p className="text-sm font-semibold text-black">
                      Full Contact Details
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#155DFC]" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">
                            Email Address
                          </p>
                          <p className="font-semibold text-[#155DFC] break-all">
                            {active.emailAddress || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#155DFC]" />
                        <div>
                          <p className="text-xs text-slate-500">Phone Number</p>
                          <p className="font-semibold  text-[#155DFC]">
                            {active.phoneNumber || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#DCFCE7] bg-[#F0FDF4] p-4">
                    <p className="text-sm font-semibold text-black">
                      Investment Details
                    </p>

                    <div className="mt-3 space-y-4 text-sm">
                      {/* Investment Range */}
                      <div className="flex gap-2">
                        {/* Icon centered */}
                        <div className="flex items-center">
                          <TrendingUp size={16} className="text-[#00A63E]" />
                        </div>

                        {/* Text block */}
                        <div>
                          <p className="text-slate-600 text-xs">
                            Investment Range
                          </p>

                          <p className="font-bold  text-black">
                            {moneyLabel(active.investmentRange)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* Icon centered between both lines */}
                        <div className="flex items-center">
                          <MessageSquare size={16} className="text-[#00A63E]" />
                        </div>

                        {/* Text block */}
                        <div>
                          <p className="text-slate-600 text-xs">
                            Subject / Topic of Interest
                          </p>

                          <p className="font-semibold  text-black ">
                            {active.subject || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex gap-2">
                        {/* Icon centered between both lines */}
                        <div className="flex items-center">
                          <Calendar size={16} className="text-[#00A63E]" />
                        </div>

                        {/* Text block */}
                        <div>
                          <p className="text-slate-600 text-xs">
                            Submission Date
                          </p>

                          <p className="font-semibold  text-black ">
                            {fmtDate(active.createdAt)}{' '}
                            {fmtTime(active.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                    <p className="text-sm font-semibold text-black">
                      Complete Message / Investment Thesis
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-[#0F172A]">
                      {active.message || '—'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
