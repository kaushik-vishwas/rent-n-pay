// 'use client';

// import React, { useEffect, useState } from 'react';
// import { CheckCircle, RefreshCw, Search, X } from 'lucide-react';
// import {
//   apiAdminGetPendingSubAdmins,
//   apiAdminGetAllSubAdmins,
//   apiAdminDecideSubAdminApproval,
// } from '@/service/api';

// const SubAdminApproval = () => {
//   const [subAdmins, setSubAdmins] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoadingId, setActionLoadingId] = useState(null);
//   const [filter, setFilter] = useState('all'); // 'pending' | 'all'
//   const [error, setError] = useState('');
//   const [confirmTarget, setConfirmTarget] = useState(null); // subadmin pending approval confirmation
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 10;
//   const getToken = () =>
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   const fetchSubAdmins = () => {
//     setLoading(true);
//     setError('');
//     const call =
//       filter === 'pending'
//         ? apiAdminGetPendingSubAdmins(getToken())
//         : apiAdminGetAllSubAdmins(getToken());

//     call
//       .then((res) => setSubAdmins(res.data.pending || res.data.subAdmins || []))
//       .catch((err) =>
//         setError(err?.response?.data?.message || 'Failed to fetch subadmins'),
//       )
//       .finally(() => setLoading(false));
//   };
//   useEffect(() => {
//     fetchSubAdmins();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter]);

//   useEffect(() => {
//     setPage(1);
//   }, [search, filter]);

//   const filteredSubAdmins = subAdmins.filter((sa) => {
//     const q = search.trim().toLowerCase();
//     if (!q) return true;
//     return (
//       String(sa.name || '')
//         .toLowerCase()
//         .includes(q) ||
//       String(sa.email || '')
//         .toLowerCase()
//         .includes(q) ||
//       String(sa.phone || '')
//         .toLowerCase()
//         .includes(q) ||
//       String(sa.location || '')
//         .toLowerCase()
//         .includes(q)
//     );
//   });

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredSubAdmins.length / PAGE_SIZE),
//   );
//   const currentPage = Math.min(page, totalPages);
//   const pagedSubAdmins = filteredSubAdmins.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE,
//   );

//   const handleAction = async (subAdminId, status) => {
//     setActionLoadingId(subAdminId);
//     try {
//       await apiAdminDecideSubAdminApproval(subAdminId, status, getToken());
//       fetchSubAdmins();
//     } catch (err) {
//       alert(err?.response?.data?.message || 'Action failed');
//     } finally {
//       setActionLoadingId(null);
//       setConfirmTarget(null);
//     }
//   };

//   const statusBadge = (status) => {
//     const map = {
//       pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
//       approved: 'bg-green-100 text-green-700 border-green-300',
//       rejected: 'bg-red-100 text-red-700 border-red-300',
//     };
//     return (
//       <span
//         className={`px-3 py-1 rounded-full text-xs font-medium border ${map[status] || ''}`}
//       >
//         {status}
//       </span>
//     );
//   };

//   return (
//     <div className="p-3 max-w-6xl mx-auto">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
//         <div className="relative w-full sm:max-w-xs">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by name, email, phone, location..."
//             className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-4 py-2 rounded-lg text-sm font-medium ${
//               filter === 'all'
//                 ? 'bg-orange-600 text-white'
//                 : 'bg-gray-100 text-gray-600'
//             }`}
//           >
//             All SubAdmins
//           </button>
//           <button
//             onClick={() => setFilter('pending')}
//             className={`px-4 py-2 rounded-lg text-sm font-medium ${
//               filter === 'pending'
//                 ? 'bg-orange-600 text-white'
//                 : 'bg-gray-100 text-gray-600'
//             }`}
//           >
//             Pending
//           </button>
//           <button
//             onClick={fetchSubAdmins}
//             className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
//             title="Refresh"
//           >
//             <RefreshCw className="w-4 h-4 text-gray-600" />
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
//           {error}
//         </div>
//       )}

//       <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
//         {/* <table className="w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600 text-left">
//             <tr>
//               <th className="px-4 py-3 font-medium">Name</th>
//               <th className="px-4 py-3 font-medium">Email</th>
//               <th className="px-4 py-3 font-medium">Phone</th>
//               <th className="px-4 py-3 font-medium">Location</th>
//               <th className="px-4 py-3 font-medium">Status</th>
//               <th className="px-4 py-3 font-medium">Registered</th>
//               <th className="px-4 py-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead> */}
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600 text-center">
//             <tr>
//               <th className="px-4 py-3 font-medium">Name</th>
//               <th className="px-4 py-3 font-medium">Email</th>
//               <th className="px-4 py-3 font-medium">Phone</th>
//               <th className="px-4 py-3 font-medium">Location</th>
//               <th className="px-4 py-3 font-medium">Status</th>
//               <th className="px-4 py-3 font-medium">Registered</th>
//               <th className="px-4 py-3 font-medium">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
//                   Loading...
//                 </td>
//               </tr>
//             ) : pagedSubAdmins.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
//                   No subadmins found
//                 </td>
//               </tr>
//             ) : (
//               pagedSubAdmins.map((sa) => (
//                 // <tr key={sa._id} className="border-t border-gray-100">
//                 //   <td className="px-4 py-3 font-medium text-gray-800">
//                 //     {sa.name}
//                 //   </td>
//                 //   <td className="px-4 py-3 text-gray-600">{sa.email}</td>
//                 //   <td className="px-4 py-3 text-gray-600">{sa.phone}</td>
//                 //   <td className="px-4 py-3 text-gray-600">{sa.location}</td>
//                 //   <td className="px-4 py-3">
//                 //     {statusBadge(sa.approvalStatus)}
//                 //   </td>
//                 //   <td className="px-4 py-3 text-gray-500 text-xs">
//                 //     {sa.createdAt
//                 //       ? new Date(sa.createdAt).toLocaleDateString()
//                 //       : '-'}
//                 //   </td>
//                 //   <td className="px-4 py-3">
//                 //     <div className="flex justify-end gap-2">
//                 <tr key={sa._id} className="border-t border-gray-100">
//                   <td className="px-4 py-3 text-center font-medium text-gray-800">
//                     {sa.name}
//                   </td>
//                   <td className="px-4 py-3 text-center text-gray-600">
//                     {sa.email}
//                   </td>
//                   <td className="px-4 py-3 text-center text-gray-600">
//                     {sa.phone}
//                   </td>
//                   <td className="px-4 py-3 text-center text-gray-600">
//                     {sa.location}
//                   </td>
//                   <td className="px-4 py-3 text-center">
//                     {statusBadge(sa.approvalStatus)}
//                   </td>
//                   <td className="px-4 py-3 text-center text-gray-500 text-xs">
//                     {sa.createdAt
//                       ? new Date(sa.createdAt).toLocaleDateString()
//                       : '-'}
//                   </td>
//                   <td className="px-4 py-3 text-center">
//                     <div className="flex justify-center gap-2">
//                       {sa.approvalStatus !== 'approved' && (
//                         <button
//                           disabled={actionLoadingId === sa._id}
//                           onClick={() => setConfirmTarget(sa)}
//                           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
//                         >
//                           <CheckCircle className="w-3.5 h-3.5" />
//                           Approve
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>

//         {!loading && filteredSubAdmins.length > 0 ? (
//           <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
//             <span className="text-gray-500">
//               Showing {(currentPage - 1) * PAGE_SIZE + 1}-
//               {Math.min(currentPage * PAGE_SIZE, filteredSubAdmins.length)} of{' '}
//               {filteredSubAdmins.length}
//             </span>
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
//               >
//                 Prev
//               </button>
//               <span className="px-3 py-1.5 rounded-lg bg-orange-600 text-white">
//                 {currentPage}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         ) : null}
//       </div>

//       {confirmTarget && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
//           onClick={() => setConfirmTarget(null)}
//         >
//           <div
//             className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-start justify-between">
//               <h2 className="text-lg font-bold text-gray-900">
//                 Approve SubAdmin
//               </h2>
//               <button
//                 type="button"
//                 onClick={() => setConfirmTarget(null)}
//                 className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <p className="text-sm text-gray-600 mt-2">
//               Are you sure you want to approve{' '}
//               <span className="font-semibold text-gray-800">
//                 {confirmTarget.name}
//               </span>{' '}
//               ({confirmTarget.email})? They will be able to log in immediately
//               after approval.
//             </p>
//             <div className="mt-5 flex gap-3">
//               <button
//                 type="button"
//                 disabled={actionLoadingId === confirmTarget._id}
//                 onClick={() => setConfirmTarget(null)}
//                 className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={actionLoadingId === confirmTarget._id}
//                 onClick={() => handleAction(confirmTarget._id, 'approved')}
//                 className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50"
//               >
//                 <CheckCircle className="w-4 h-4" />
//                 {actionLoadingId === confirmTarget._id
//                   ? 'Approving...'
//                   : 'Yes, Approve'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubAdminApproval;

'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  RefreshCw,
  Search,
  X,
  Plus,
  Edit2,
  MapPin,
  User,
  Mail,
  Lock,
  Phone,
  LocateIcon,
  Copy,
  Check,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  apiAdminGetPendingSubAdmins,
  apiAdminGetAllSubAdmins,
  apiAdminDecideSubAdminApproval,
  apiAdminCreateSubAdmin,
  apiAdminUpdateSubAdmin,
} from '@/service/api';

const LocationPicker = dynamic(
  () => import('@/Admin/Pages/AdminAuth/LocationPicker'),
  {
    ssr: false,
  },
);

function slugifyCityName(cityName) {
  const slug = String(cityName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'city';
}

function previewCityUsername(cityName) {
  const slug = slugifyCityName(cityName);
  return cityName.trim() ? `rnpadm-${slug}` : '';
}

function previewCityPassword(cityName) {
  const compact = slugifyCityName(cityName).replace(/-/g, '');
  return cityName.trim() ? `rnp@${compact}123` : '';
}

const SubAdminApproval = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'pending' | 'all'
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null); // subadmin pending approval confirmation
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // ---- NEW: create subadmin (by admin) ----
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateMapPicker, setShowCreateMapPicker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    locationPlace: null,
  });
  const [createErrors, setCreateErrors] = useState({});
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // ---- NEW: edit subadmin ----
  const [editTarget, setEditTarget] = useState(null);
  const [editStatus, setEditStatus] = useState('pending');
  const [showEditMapPicker, setShowEditMapPicker] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    locationPlace: null,
  });
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const fetchSubAdmins = () => {
    setLoading(true);
    setError('');
    const call =
      filter === 'pending'
        ? apiAdminGetPendingSubAdmins(getToken())
        : apiAdminGetAllSubAdmins(getToken());

    call
      .then((res) => setSubAdmins(res.data.pending || res.data.subAdmins || []))
      .catch((err) =>
        setError(err?.response?.data?.message || 'Failed to fetch subadmins'),
      )
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchSubAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const filteredSubAdmins = subAdmins.filter((sa) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(sa.name || '')
        .toLowerCase()
        .includes(q) ||
      String(sa.email || '')
        .toLowerCase()
        .includes(q) ||
      String(sa.phone || '')
        .toLowerCase()
        .includes(q) ||
      String(sa.location || '')
        .toLowerCase()
        .includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubAdmins.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedSubAdmins = filteredSubAdmins.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleAction = async (subAdminId, status) => {
    setActionLoadingId(subAdminId);
    try {
      await apiAdminDecideSubAdminApproval(subAdminId, status, getToken());
      fetchSubAdmins();
    } catch (err) {
      alert(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
      setConfirmTarget(null);
    }
  };

  const openCreateModal = () => {
    setUsernameTouched(false);
    setPasswordTouched(false);
    setCreateData({
      name: '',
      email: '',
      phone: '',
      password: '',
      location: '',
      locationPlace: null,
    });
    setCreateErrors({});
    setShowCreateModal(true);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setUsernameTouched(true);
    if (name === 'password') setPasswordTouched(true);

    setCreateData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name') {
        if (!usernameTouched) next.email = previewCityUsername(value);
        if (!passwordTouched) next.password = previewCityPassword(value);
      }
      return next;
    });
    setCreateErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!createData.name.trim()) errors.name = 'City name is required';
    if (!createData.email.trim()) errors.email = 'Username is required';
    if (!createData.password.trim()) errors.password = 'Password is required';
    else if (createData.password.length < 6)
      errors.password = 'Password must be at least 6 characters';
    if (!createData.location)
      errors.location = 'Please select a location on the map';
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const copyCredential = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(''), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;
    setCreating(true);
    try {
      const res = await apiAdminCreateSubAdmin(
        {
          name: createData.name.trim(),
          email: createData.email.trim().toLowerCase(),
          password: createData.password,
          location: createData.location,
          phone: createData.phone || '',
        },
        getToken(),
      );
      setShowCreateModal(false);
      setUsernameTouched(false);
      setPasswordTouched(false);
      setCreateData({
        name: '',
        email: '',
        phone: '',
        password: '',
        location: '',
        locationPlace: null,
      });
      setCreateErrors({});
      setCreatedCredentials(res.data?.credentials || null);
      fetchSubAdmins();
    } catch (err) {
      setCreateErrors({
        form: err?.response?.data?.message || 'Failed to create city admin',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditStatus = async () => {
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      await apiAdminUpdateSubAdmin(
        editTarget._id,
        { ...editData, approvalStatus: editStatus },
        getToken(),
      );
      fetchSubAdmins();
      setEditTarget(null);
    } catch (err) {
      setEditErrors({
        form: err?.response?.data?.message || 'Failed to update subadmin',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${map[status] || ''}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <div className="flex flex-row items-center justify-between gap-2 mb-3">
        <div className="relative flex-1 min-w-0 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search here..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 text-white text-xs sm:text-sm font-medium hover:bg-orange-700 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create SubAdmin</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {/* <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead> */}
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-gray-600 text-center">
              <tr>
                <th className="px-4 py-3 font-medium">Sl. No.</th>
                {/* <th className="px-4 py-3 font-medium">Location</th> */}
                <th className="px-4 py-3 font-medium">City Name</th>
                <th className="px-4 py-3 font-medium">City User Name</th>
                <th className="px-4 py-3 font-medium">Password</th>
                <th className="px-4 py-3 font-medium">Last Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : pagedSubAdmins.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No subadmins found
                  </td>
                </tr>
              ) : (
                pagedSubAdmins.map((sa, idx) => (
                  <tr key={sa._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-center text-gray-600">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    {/* <td className="px-4 py-3 text-center text-gray-600">
                    {sa.location}
                  </td> */}
                    <td className="px-4 py-3 text-center font-medium text-gray-800">
                      {sa.name}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {sa.email}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 font-mono text-xs">
                      {sa.plainPassword || '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {sa.updatedAt
                        ? new Date(sa.updatedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {sa.approvalStatus !== 'approved' && (
                          <button
                            disabled={actionLoadingId === sa._id}
                            onClick={() => setConfirmTarget(sa)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        )}
                        <button
                          disabled={actionLoadingId === sa._id}
                          onClick={() => {
                            setEditTarget(sa);
                            setEditStatus(sa.approvalStatus || 'pending');
                            setEditData({
                              name: sa.name || '',
                              email: sa.email || '',
                              password: '',
                              location: sa.location || '',
                              locationPlace: null,
                            });
                            setEditErrors({});
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredSubAdmins.length > 0 ? (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <span className="text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, filteredSubAdmins.length)} of{' '}
              {filteredSubAdmins.length}
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

      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Approve SubAdmin
              </h2>
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to approve{' '}
              <span className="font-semibold text-gray-800">
                {confirmTarget.name}
              </span>{' '}
              ({confirmTarget.email})? They will be able to log in immediately
              after approval.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={actionLoadingId === confirmTarget._id}
                onClick={() => setConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === confirmTarget._id}
                onClick={() => handleAction(confirmTarget._id, 'approved')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoadingId === confirmTarget._id
                  ? 'Approving...'
                  : 'Yes, Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => !creating && setShowCreateModal(false)}
        >
          <div
            className="create-subadmin-scroll w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <style jsx>{`
              .create-subadmin-scroll::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Create SubAdmin
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createErrors.form && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {createErrors.form}
              </div>
            )}

            <form onSubmit={handleCreateSubAdmin} className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City Name *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <LocateIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter city name"
                    value={createData.name}
                    onChange={handleCreateChange}
                    disabled={creating}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                      createErrors.name ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {createErrors.name && (
                  <p className="text-red-600 text-xs mt-1">
                    {createErrors.name}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login username *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <input
                    name="email"
                    type="text"
                    placeholder="rnpadm-bangalore"
                    value={createData.email}
                    onChange={handleCreateChange}
                    disabled={creating}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-mono text-sm disabled:bg-gray-100 ${
                      createErrors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {createErrors.email && (
                  <p className="text-red-600 text-xs mt-1">
                    {createErrors.email}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Suggested as rnpadm-&lt;city&gt;. You can edit before saving.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                  <input
                    name="password"
                    type="text"
                    placeholder="rnp@bangalore123"
                    value={createData.password}
                    onChange={handleCreateChange}
                    disabled={creating}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-mono text-sm disabled:bg-gray-100 ${
                      createErrors.password
                        ? 'border-red-400'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                {createErrors.password && (
                  <p className="text-red-600 text-xs mt-1">
                    {createErrors.password}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Suggested as rnp@&lt;city&gt;123. You can edit before saving.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                {createData.location ? (
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-700 font-medium">
                        {createData.location}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateMapPicker(true)}
                      className="text-xs text-orange-600 font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCreateMapPicker(true)}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    Select Location on Map
                  </button>
                )}
                {createErrors.location && (
                  <p className="text-red-600 text-xs mt-1">
                    {createErrors.location}
                  </p>
                )}
              </div>

              {showCreateMapPicker && (
                <LocationPicker
                  onClose={() => setShowCreateMapPicker(false)}
                  onConfirm={({ state, place }) => {
                    setCreateData((prev) => ({
                      ...prev,
                      location: state,
                      locationPlace: place,
                    }));
                    setShowCreateMapPicker(false);
                    setCreateErrors((prev) => ({ ...prev, location: '' }));
                  }}
                />
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create City Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5">
            <h2 className="text-lg font-bold text-gray-900">
              City admin login details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Copy these now and share them with the city admin. The password
              will not be shown again in this popup.
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p className="text-xs font-medium text-gray-500">Username</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-gray-900 break-all">
                    {createdCredentials.username}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyCredential('username', createdCredentials.username)
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    {copiedField === 'username' ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p className="text-xs font-medium text-gray-500">Password</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-gray-900 break-all">
                    {createdCredentials.password}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyCredential('password', createdCredentials.password)
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    {copiedField === 'password' ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreatedCredentials(null)}
              className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              I&apos;ve saved these details
            </button>
          </div>
        </div>
      )}

      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => !savingEdit && setEditTarget(null)}
        >
          <div
            className="edit-subadmin-scroll w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <style jsx>{`
              .edit-subadmin-scroll::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">Edit SubAdmin</h2>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editErrors.form && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {editErrors.form}
              </div>
            )}

            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City Name *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <LocateIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter city name"
                    value={editData.name}
                    onChange={handleEditChange}
                    disabled={savingEdit}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                      editErrors.name ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {editErrors.name && (
                  <p className="text-red-600 text-xs mt-1">{editErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City User Name *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter city user name"
                    value={editData.email}
                    onChange={handleEditChange}
                    disabled={savingEdit}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                      editErrors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {editErrors.email && (
                  <p className="text-red-600 text-xs mt-1">
                    {editErrors.email}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                  <input
                    name="password"
                    type="text"
                    placeholder="Leave blank to keep current password"
                    value={editData.password}
                    onChange={handleEditChange}
                    disabled={savingEdit}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 disabled:bg-gray-100 ${
                      editErrors.password ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {editErrors.password && (
                  <p className="text-red-600 text-xs mt-1">
                    {editErrors.password}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                {editData.location ? (
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-700 font-medium">
                        {editData.location}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditMapPicker(true)}
                      className="text-xs text-orange-600 font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowEditMapPicker(true)}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    Select Location on Map
                  </button>
                )}
                {editErrors.location && (
                  <p className="text-red-600 text-xs mt-1">
                    {editErrors.location}
                  </p>
                )}
              </div>

              {showEditMapPicker && (
                <LocationPicker
                  onClose={() => setShowEditMapPicker(false)}
                  onConfirm={({ state, place }) => {
                    setEditData((prev) => ({
                      ...prev,
                      location: state,
                      locationPlace: place,
                    }));
                    setShowEditMapPicker(false);
                    setEditErrors((prev) => ({ ...prev, location: '' }));
                  }}
                />
              )}

              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={savingEdit}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div> */}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleEditStatus}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminApproval;
