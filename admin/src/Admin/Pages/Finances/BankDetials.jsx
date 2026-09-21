// 'use client';

// import { useEffect, useState } from 'react';
// import {
//   apiGetAdminBankVerifications,
//   apiVerifyVendorBank,
//   apiRejectVendorBank,
// } from '@/service/api';
// import {
//   CheckCircle2,
//   XCircle,
//   BadgeCheck,
//   X,
//   Upload,
//   Search,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';

// const StatusPill = ({ status }) => {
//   const map = {
//     Pending: 'bg-amber-50 text-amber-700',
//     Verified: 'bg-emerald-50 text-emerald-700',
//     Rejected: 'bg-rose-50 text-rose-700',
//   };
//   return (
//     <span
//       className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${map[status] || 'bg-gray-50 text-gray-600'}`}
//     >
//       {status}
//     </span>
//   );
// };

// export default function BankDetials() {
//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState(null);
//   const [rejectMode, setRejectMode] = useState(false);
//   const [rejectReason, setRejectReason] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 10;

//   const load = () => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) return;
//     setLoading(true);
//     apiGetAdminBankVerifications(token)
//       .then((res) => setVendors(res?.data?.vendors || []))
//       .catch(() => setVendors([]))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     load();
//   }, []);
//   const filteredVendors = vendors.filter((v) => {
//     const matchesSearch =
//       String(v.fullName || '')
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       String(v.emailAddress || '')
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       statusFilter === 'All' || v.bankDetails?.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const totalPages = Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
//   const safePage = Math.min(page, totalPages);
//   const paginatedVendors = filteredVendors.slice(
//     (safePage - 1) * PAGE_SIZE,
//     safePage * PAGE_SIZE,
//   );

//   useEffect(() => {
//     setPage(1);
//   }, [searchTerm, statusFilter]);

//   useEffect(() => {
//     if (page > totalPages) setPage(totalPages);
//   }, [page, totalPages]);

//   const openVendor = (v) => {
//     setSelected(v);
//     setRejectMode(false);
//     setRejectReason('');
//   };

//   const handleVerify = async () => {
//     const token = localStorage.getItem('adminToken');
//     setSubmitting(true);
//     try {
//       await apiVerifyVendorBank(token, selected._id);
//       setSelected(null);
//       load();
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectReason.trim()) return;
//     const token = localStorage.getItem('adminToken');
//     setSubmitting(true);
//     try {
//       await apiRejectVendorBank(token, selected._id, rejectReason);
//       setSelected(null);
//       load();
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6 pt-2 space-y-6">
//       {/* <div>
//         <h1 className="text-2xl font-semibold text-gray-900">
//           Vendor Bank Verification
//         </h1>
//         <p className="mt-1 text-sm text-gray-500">
//           Review and approve or reject vendor bank account submissions.
//         </p>
//       </div> */}

//       <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//         <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
//           <div className="relative w-full sm:max-w-xs">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by vendor name or email..."
//               className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-400 focus:outline-none"
//             />
//           </div>

//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
//           >
//             <option value="All">All Statuses</option>
//             <option value="Pending">Pending</option>
//             <option value="Verified">Verified</option>
//             <option value="Rejected">Rejected</option>
//           </select>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[700px] text-sm">
//             <thead>
//               <tr className="text-center text-xs font-medium text-gray-500 border-b border-gray-100">
//                 <th className="px-6 py-3">Vendor</th>
//                 <th className="px-6 py-3">Bank</th>
//                 <th className="px-6 py-3">Account No.</th>
//                 <th className="px-6 py-3">Status</th>
//                 <th className="px-6 py-3">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="px-6 py-8 text-center text-gray-500"
//                   >
//                     Loading…
//                   </td>
//                 </tr>
//               ) : filteredVendors.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="px-6 py-8 text-center text-gray-500"
//                   >
//                     No matching submissions found.
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedVendors.map((v) => (
//                   <tr key={v._id} className="border-t border-gray-100">
//                     <td className="px-6 py-4 text-center">
//                       <p className="font-medium text-gray-900">{v.fullName}</p>
//                       {/* <p className="text-xs text-gray-500">{v.emailAddress}</p> */}
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       {v.bankDetails?.bankName || '—'}
//                     </td>
//                     <td className="px-6 py-4 text-center font-mono text-xs">
//                       ••••{' '}
//                       {String(v.bankDetails?.accountNumber || '').slice(-4)}
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <StatusPill status={v.bankDetails?.status} />
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <button
//                         type="button"
//                         onClick={() => openVendor(v)}
//                         className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {!loading && filteredVendors.length > 0 ? (
//           <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
//             <p className="text-xs text-gray-500">
//               Page {safePage} of {totalPages} · {filteredVendors.length} results
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 disabled={safePage <= 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>
//               <span className="min-w-[2rem] h-9 px-3 rounded-lg text-sm font-semibold flex items-center justify-center bg-orange-500 text-white">
//                 {safePage}
//               </span>
//               <button
//                 type="button"
//                 disabled={safePage >= totalPages}
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         ) : null}
//       </div>

//       {selected ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="flex w-full max-w-md max-h-[80vh] flex-col rounded-2xl bg-white shadow-xl">
//             <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
//               <h3 className="text-base font-semibold text-gray-900">
//                 Bank Details Review
//               </h3>
//               <button
//                 type="button"
//                 onClick={() => setSelected(null)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="overflow-y-auto px-6 py-5 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
//               <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
//                 <div className="flex items-center justify-between">
//                   <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium">
//                     {selected.bankDetails?.bankName || 'Bank Account'}
//                   </span>
//                   <StatusPill status={selected.bankDetails?.status} />
//                 </div>
//                 <p className="mt-6 text-xs text-white/60">Account Number</p>
//                 <p className="mt-1 text-lg font-mono tracking-widest">
//                   {selected.bankDetails?.accountNumber}
//                 </p>
//                 <div className="mt-5 flex items-end justify-between">
//                   <div>
//                     <p className="text-xs text-white/60">Account Holder</p>
//                     <p className="text-sm font-semibold">
//                       {selected.bankDetails?.accountHolderName}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xs text-white/60">IFSC Code</p>
//                     <p className="text-sm font-semibold">
//                       {selected.bankDetails?.ifscCode}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* <p className="text-xs text-gray-500">
//                 Vendor:{' '}
//                 <span className="font-medium text-gray-700">
//                   {selected.fullName}
//                 </span>{' '}
//                 · {selected.emailAddress}
//               </p> */}
//               <p className="text-xs text-gray-500">
//                 Vendor:{' '}
//                 <span className="font-medium text-gray-700">
//                   {selected.fullName}
//                 </span>{' '}
//                 · {selected.emailAddress}
//               </p>

//               {selected.bankDetails?.chequeImage ? (
//                 <div>
//                   <p className="mb-1 text-xs font-medium text-gray-700">
//                     Cancelled Cheque / Passbook
//                   </p>

//                   <a
//                     href={selected.bankDetails.chequeImage}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="block overflow-hidden rounded-lg border border-gray-200"
//                   >
//                     <img
//                       src={selected.bankDetails.chequeImage}
//                       alt="Cancelled cheque"
//                       className="max-h-48 w-full object-contain bg-gray-50"
//                     />
//                   </a>
//                 </div>
//               ) : (
//                 <p className="text-xs text-rose-500">
//                   No cancelled cheque / passbook uploaded.
//                 </p>
//               )}

//               {selected.bankDetails?.status === 'Rejected' &&
//               selected.bankDetails?.rejectionReason ? (
//                 <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
//                   Previously rejected: {selected.bankDetails.rejectionReason}
//                 </div>
//               ) : null}

//               {rejectMode ? (
//                 <div>
//                   <label className="mb-1 block text-xs font-medium text-gray-700">
//                     Rejection reason *
//                   </label>
//                   <textarea
//                     value={rejectReason}
//                     onChange={(e) => setRejectReason(e.target.value)}
//                     rows={3}
//                     placeholder="E.g. IFSC code invalid, name mismatch with PAN, etc."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
//                   />
//                   <div className="mt-3 flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setRejectMode(false)}
//                       className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       disabled={submitting || !rejectReason.trim()}
//                       onClick={handleReject}
//                       className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
//                     >
//                       {submitting ? 'Rejecting…' : 'Confirm Reject'}
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex gap-2 pt-2">
//                   <button
//                     type="button"
//                     onClick={() => setRejectMode(true)}
//                     className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
//                   >
//                     <XCircle className="h-4 w-4" />
//                     Reject
//                   </button>
//                   <button
//                     type="button"
//                     disabled={submitting}
//                     onClick={handleVerify}
//                     className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
//                   >
//                     <CheckCircle2 className="h-4 w-4" />
//                     {submitting ? 'Verifying…' : 'Approve'}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import {
  apiGetAdminBankVerifications,
  apiVerifyVendorBank,
  apiRejectVendorBank,
} from '@/service/api';
import { toast } from 'react-toastify';
import {
  CheckCircle2,
  XCircle,
  BadgeCheck,
  X,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const StatusPill = ({ status }) => {
  const map = {
    Pending: 'bg-amber-50 text-amber-700',
    Verified: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-rose-50 text-rose-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${map[status] || 'bg-gray-50 text-gray-600'}`}
    >
      {status}
    </span>
  );
};

export default function BankDetials() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  // const [rejectMode, setRejectMode] = useState(false);
  // const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) return;
    setLoading(true);
    apiGetAdminBankVerifications(token)
      .then((res) => setVendors(res?.data?.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      String(v.fullName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(v.emailAddress || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || v.bankDetails?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedVendors = filteredVendors.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openVendor = (v) => {
    setSelected(v);
  };

  const handleVerify = async () => {
    const token = localStorage.getItem('adminToken');
    setSubmitting(true);
    try {
      await apiVerifyVendorBank(token, selected._id);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to verify bank details.',
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const token = localStorage.getItem('adminToken');
    setSubmitting(true);
    try {
      await apiRejectVendorBank(token, selected._id, 'Rejected by admin');
      setSelected(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 pt-2 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vendor name or email..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="text-center text-xs font-medium text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Account Holder</th>
                <th className="px-6 py-3">Account No.</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading…
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No matching submissions found.
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((v) => (
                  <tr key={v._id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-center">
                      <p className="font-medium text-gray-900">{v.fullName}</p>
                      {/* <p className="text-xs text-gray-500">{v.emailAddress}</p> */}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {v.bankDetails?.bankName || '—'}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs">
                      ••••{' '}
                      {String(v.bankDetails?.accountNumber || '').slice(-4)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusPill status={v.bankDetails?.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => openVendor(v)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredVendors.length > 0 ? (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {safePage} of {totalPages} · {filteredVendors.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="min-w-[2rem] h-9 px-3 rounded-lg text-sm font-semibold flex items-center justify-center bg-orange-500 text-white">
                {safePage}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-md max-h-[80vh] flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
              <h3 className="text-base font-semibold text-gray-900">
                Bank Details Review
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium">
                    {selected.bankDetails?.bankName || 'Bank Account'}
                  </span>
                  <StatusPill status={selected.bankDetails?.status} />
                </div>
                <p className="mt-6 text-xs text-white/60">Account Number</p>
                <p className="mt-1 text-lg font-mono tracking-widest">
                  {String(selected.bankDetails?.accountNumber || '')
                    .replace(/\D/g, '')
                    .replace(/(.{4})/g, '$1 ')
                    .trim()}
                </p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/60">Account Holder</p>
                    <p className="text-sm font-semibold">
                      {selected.bankDetails?.accountHolderName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">IFSC Code</p>
                    <p className="text-sm font-semibold">
                      {selected.bankDetails?.ifscCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* <p className="text-xs text-gray-500">
                Vendor:{' '}
                <span className="font-medium text-gray-700">
                  {selected.fullName}
                </span>{' '}
                · {selected.emailAddress}
              </p> */}
              <p className="text-xs text-gray-500">
                Vendor:{' '}
                <span className="font-medium text-gray-700">
                  {selected.fullName}
                </span>{' '}
                · {selected.emailAddress}
              </p>

              {selected.bankDetails?.chequeImage ? (
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-700">
                    Cancelled Cheque / Passbook
                  </p>

                  <a
                    href={selected.bankDetails.chequeImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img
                      src={selected.bankDetails.chequeImage}
                      alt="Cancelled cheque"
                      className="max-h-48 w-full object-contain bg-gray-50"
                    />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-rose-500">
                  No cancelled cheque / passbook uploaded.
                </p>
              )}

              {/* {selected.bankDetails?.status === 'Rejected' &&
              selected.bankDetails?.rejectionReason ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  Previously rejected: {selected.bankDetails.rejectionReason}
                </div>
              ) : null} */}

              {/* {rejectMode ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Rejection reason *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="E.g. IFSC code invalid, name mismatch with PAN, etc."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectMode(false)}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting || !rejectReason.trim()}
                      onClick={handleReject}
                      className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      {submitting ? 'Rejecting…' : 'Confirm Reject'}
                    </button>
                  </div>
                </div>
              ) : selected.bankDetails?.status === 'Verified' ? null : (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectMode(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleVerify}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {submitting ? 'Verifying…' : 'Approve'}
                  </button>
                </div>
              )} */}

              {selected.bankDetails?.status === 'Verified' ? null : (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleReject}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    {submitting ? 'Rejecting…' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleVerify}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {submitting ? 'Verifying…' : 'Approve'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
