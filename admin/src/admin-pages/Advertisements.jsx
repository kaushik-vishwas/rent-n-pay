// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import {
//   apiGetAllAdvertisements,
//   apiCreateAdvertisement,
//   apiUpdateAdvertisement,
//   apiDeleteAdvertisement,
//   apiToggleAdvertisementStatus,
// } from '@/service/api';

// const emptyForm = {
//   title: '',
//   subtitle: '',
//   clickableUrl: '',
//   isActive: true,
//   image: null,
// };

// export default function AdvertisementsPage() {
//   const [advertisements, setAdvertisements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [formOpen, setFormOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(emptyForm);
//   const [preview, setPreview] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [deletingId, setDeletingId] = useState('');
//   const [togglingId, setTogglingId] = useState('');
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const fileRef = useRef();
//   const [search, setSearch] = useState('');

//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

//   const filteredAdvertisements = advertisements.filter((a) => {
//     const q = search.toLowerCase();
//     return (
//       a.title?.toLowerCase().includes(q) ||
//       a.subtitle?.toLowerCase().includes(q) ||
//       a.clickableUrl?.toLowerCase().includes(q)
//     );
//   });

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await apiGetAllAdvertisements(token);
//       setAdvertisements(res.data?.advertisements || []);
//     } catch {
//       setAdvertisements([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(emptyForm);
//     setPreview('');
//     setFormOpen(true);
//   };

//   const openEdit = (a) => {
//     setEditing(a);
//     setForm({
//       title: a.title || '',
//       subtitle: a.subtitle || '',
//       clickableUrl: a.clickableUrl || '',
//       isActive: a.isActive,
//       image: null,
//     });
//     setPreview(a.image || '');
//     setFormOpen(true);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setForm((p) => ({ ...p, image: file }));
//     setPreview(URL.createObjectURL(file));
//   };

//   const handleSave = async () => {
//     if (!form.image && !editing) {
//       alert('Please select an image');
//       return;
//     }
//     setSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append('title', form.title);
//       fd.append('subtitle', form.subtitle);
//       fd.append('clickableUrl', form.clickableUrl);
//       fd.append('isActive', form.isActive);
//       if (form.image) fd.append('image', form.image);

//       if (editing) {
//         await apiUpdateAdvertisement(editing._id, fd, token);
//       } else {
//         await apiCreateAdvertisement(fd, token);
//       }
//       setFormOpen(false);
//       load();
//     } catch {
//       alert('Something went wrong');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = (a) => {
//     setDeleteTarget(a);
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     const id = deleteTarget._id;
//     setDeletingId(id);
//     try {
//       await apiDeleteAdvertisement(id, token);
//       setAdvertisements((p) => p.filter((a) => a._id !== id));
//     } catch {
//       alert('Delete failed');
//     } finally {
//       setDeletingId('');
//       setDeleteTarget(null);
//     }
//   };

//   const handleToggle = async (id) => {
//     setTogglingId(id);
//     try {
//       const res = await apiToggleAdvertisementStatus(id, token);
//       setAdvertisements((p) =>
//         p.map((a) => (a._id === id ? res.data.advertisement : a)),
//       );
//     } catch {
//       alert('Toggle failed');
//     } finally {
//       setTogglingId('');
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6 max-w-5xl mx-auto">
//       <div className="border border-gray-200 rounded-xl p-4">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between mb-6">
//           <div className="flex flex-1 border border-gray-200 rounded-lg overflow-hidden focus-within:border-orange-400">
//             <div className="relative flex-1">
//               <svg
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
//                 />
//               </svg>
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search advertisements..."
//                 className="w-full pl-9 pr-3 py-2 text-sm focus:outline-none"
//               />
//             </div>
//             <button
//               onClick={openCreate}
//               className="bg-[#FF7020] text-white px-4 py-2 text-sm font-medium hover:bg-orange-600 transition shrink-0"
//             >
//               + Add Advertisement
//             </button>
//           </div>
//         </div>

//         {/* List */}
//         {loading ? (
//           <div className="flex justify-center py-20">
//             <div className="w-8 h-8 border-4 border-[#FF7020] border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : filteredAdvertisements.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-24 text-center">
//             <p className="text-gray-400 text-lg">
//               {search ? 'No matching advertisements' : 'No advertisements yet'}
//             </p>
//             <p className="text-gray-400 text-sm mt-1">
//               {search
//                 ? 'Try a different search term'
//                 : 'Click "Add Advertisement" to create your first advertisement'}
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//             {filteredAdvertisements.map((a) => (
//               <div
//                 key={a._id}
//                 className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden"
//               >
//                 <img
//                   src={a.image}
//                   alt={a.title}
//                   className="w-full h-36 object-cover"
//                 />
//                 <div className="p-3 flex-1 min-w-0">
//                   {/* <p className="font-medium text-gray-900 truncate text-sm">
//                     {a.title || 'No title'}
//                   </p> */}
//                   {/* <p className="text-xs text-gray-500 truncate mt-0.5">
//                     {a.subtitle || 'No subtitle'}
//                   </p> */}
//                   {a.clickableUrl && (
//                     <p className="text-xs text-blue-500 truncate mt-0.5">
//                       {a.clickableUrl}
//                     </p>
//                   )}
//                 </div>
//                 <div className="px-3 pb-3 flex flex-wrap items-center justify-between gap-2">
//                   <div className="flex items-center gap-1.5">
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input
//                         type="checkbox"
//                         className="sr-only peer"
//                         checked={a.isActive}
//                         onChange={() => handleToggle(a._id)}
//                         disabled={togglingId === a._id}
//                       />
//                       <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#FF7020] rounded-full transition-colors" />
//                       <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
//                     </label>
//                     <span
//                       className={`text-xs font-medium ${
//                         a.isActive ? 'text-green-600' : 'text-gray-400'
//                       }`}
//                     >
//                       {a.isActive ? 'Active' : 'Inactive'}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => openEdit(a)}
//                       className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(a)}
//                       disabled={deletingId === a._id}
//                       className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
//                     >
//                       {deletingId === a._id ? 'Deleting...' : 'Delete'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {formOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
//             {/* Modal Header */}
//             <div className="p-6 pb-4 shrink-0 border-b border-gray-100">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 {editing ? 'Edit Advertisement' : 'Add Advertisement'}
//               </h2>
//             </div>

//             {/* Scrollable body */}
//             <div
//               className="overflow-y-auto flex-1 px-6 py-4 space-y-4"
//               style={{ scrollbarWidth: 'none' }}
//             >
//               {/* Image upload */}
//               <div>
//                 <p className="text-sm font-medium text-gray-700 mb-1">
//                   Advertisement Image
//                 </p>
//                 {preview && (
//                   <img
//                     src={preview}
//                     alt="preview"
//                     className="w-full h-40 object-cover rounded-xl mb-2 border border-gray-200"
//                   />
//                 )}
//                 <input
//                   ref={fileRef}
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleImageChange}
//                 />
//                 <button
//                   onClick={() => fileRef.current.click()}
//                   className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition"
//                 >
//                   {preview ? 'Change Image' : 'Click to upload image'}
//                 </button>
//               </div>

//               {/* Title */}
//               {/* <div>
//                 <p className="text-sm font-medium text-gray-700 mb-1">
//                   Title{' '}
//                   <span className="text-gray-400 font-normal">(optional)</span>
//                 </p>
//                 <input
//                   type="text"
//                   value={form.title}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, title: e.target.value }))
//                   }
//                   placeholder="Summer Sale, Limited Offer..."
//                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
//                 />
//               </div> */}

//               {/* Subtitle */}
//               {/* <div>
//                 <p className="text-sm font-medium text-gray-700 mb-1">
//                   Subtitle{' '}
//                   <span className="text-gray-400 font-normal">(optional)</span>
//                 </p>
//                 <input
//                   type="text"
//                   value={form.subtitle}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, subtitle: e.target.value }))
//                   }
//                   placeholder="Get up to 50% off..."
//                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
//                 />
//               </div> */}

//               {/* Clickable URL */}
//               <div>
//                 <p className="text-sm font-medium text-gray-700 mb-1">
//                   Clickable URL
//                 </p>
//                 <input
//                   type="text"
//                   value={form.clickableUrl}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, clickableUrl: e.target.value }))
//                   }
//                   placeholder="https://example.com"
//                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
//                 />
//                 <p className="text-xs text-gray-400 mt-1">
//                   When set, clicking the advertisement image will redirect to
//                   this URL
//                 </p>
//               </div>

//               {/* isActive */}
//               <div className="flex items-center justify-between">
//                 <p className="text-sm font-medium text-gray-700">
//                   Active (show on site)
//                 </p>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     className="sr-only peer"
//                     checked={form.isActive}
//                     onChange={(e) =>
//                       setForm((p) => ({ ...p, isActive: e.target.checked }))
//                     }
//                   />
//                   <div className="w-10 h-5 bg-gray-300 peer-checked:bg-[#FF7020] rounded-full transition-colors" />
//                   <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
//                 </label>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-100 shrink-0">
//               <button
//                 onClick={() => setFormOpen(false)}
//                 className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="flex-1 px-4 py-2 bg-[#FF7020] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
//               >
//                 {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirm Modal */}
//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
//           <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
//             <h3 className="text-base font-semibold text-gray-900">
//               Delete Advertisement
//             </h3>
//             <p className="text-sm text-gray-500 mt-2">
//               Are you sure you want to delete{' '}
//               <span className="font-medium text-gray-700">
//                 {deleteTarget.title || 'this advertisement'}
//               </span>
//               ? This action cannot be undone.
//             </p>
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => setDeleteTarget(null)}
//                 disabled={deletingId === deleteTarget._id}
//                 className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 disabled={deletingId === deleteTarget._id}
//                 className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
//               >
//                 {deletingId === deleteTarget._id ? 'Deleting...' : 'Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  apiGetAllRentOffers,
  apiCreateRentOffer,
  apiUpdateRentOffer,
  apiDeleteRentOffer,
  apiToggleRentOfferStatus,
  apiGetAllRentAsBanners,
  apiCreateRentAsBanner,
  apiUpdateRentAsBanner,
  apiDeleteRentAsBanner,
  apiToggleRentAsBannerStatus,
  apiGetAllAdvertisements,
  apiCreateAdvertisement,
  apiUpdateAdvertisement,
  apiDeleteAdvertisement,
  apiToggleAdvertisementStatus,
  apiGetAllBuyAdvertisements,
  apiCreateBuyAdvertisement,
  apiUpdateBuyAdvertisement,
  apiDeleteBuyAdvertisement,
  apiToggleBuyAdvertisementStatus,
  apiGetAllServiceAdvertisements,
  apiCreateServiceAdvertisement,
  apiUpdateServiceAdvertisement,
  apiDeleteServiceAdvertisement,
  apiToggleServiceAdvertisementStatus,
} from '@/service/api';

const emptyForm = {
  title: '',
  subtitle: '',
  clickableUrl: '',
  isActive: true,
  image: null,
};

// Config per tab — maps each tab to its own API calls + response keys.
// This is the ONLY place tying a tab to its backend logic, so nothing else changes.
const TAB_CONFIG = {
  rentOffer: {
    label: 'Rental Offers',
    listKey: 'rentOffers',
    getAll: apiGetAllRentOffers,
    create: apiCreateRentOffer,
    update: apiUpdateRentOffer,
    remove: apiDeleteRentOffer,
    toggle: apiToggleRentOfferStatus,
    toggleResponseKey: 'rentOffer',
    addButtonLabel: '+ Add Rental Offer',
    searchPlaceholder: 'Search rental offers...',
    emptyLabel: 'rental offers',
    activeLabel: 'rent page',
  },
  rentAs: {
    label: 'RentAs Banners',
    listKey: 'banners',
    getAll: apiGetAllRentAsBanners,
    create: apiCreateRentAsBanner,
    update: apiUpdateRentAsBanner,
    remove: apiDeleteRentAsBanner,
    toggle: apiToggleRentAsBannerStatus,
    toggleResponseKey: 'banner',
    addButtonLabel: '+ Add RentAs Banner',
    searchPlaceholder: 'Search RentAs banners...',
    emptyLabel: 'RentAs banners',
    activeLabel: 'home page',
  },
  advertisement: {
    label: 'Advertisements',
    listKey: 'advertisements',
    getAll: apiGetAllAdvertisements,
    create: apiCreateAdvertisement,
    update: apiUpdateAdvertisement,
    remove: apiDeleteAdvertisement,
    toggle: apiToggleAdvertisementStatus,
    toggleResponseKey: 'advertisement',
    addButtonLabel: '+ Add Advertisement',
    searchPlaceholder: 'Search advertisements...',
    emptyLabel: 'advertisements',
    activeLabel: 'rent page',
  },
  buyAdvertisement: {
    label: 'Buy Advertisements',
    listKey: 'buyAdvertisements',
    getAll: apiGetAllBuyAdvertisements,
    create: apiCreateBuyAdvertisement,
    update: apiUpdateBuyAdvertisement,
    remove: apiDeleteBuyAdvertisement,
    toggle: apiToggleBuyAdvertisementStatus,
    toggleResponseKey: 'buyAdvertisement',
    addButtonLabel: '+ Add Advertisement',
    searchPlaceholder: 'Search advertisements...',
    emptyLabel: 'advertisements',
    activeLabel: 'buy page',
  },
  serviceAdvertisement: {
    label: 'Service Advertisements',
    listKey: 'serviceAdvertisements',
    getAll: apiGetAllServiceAdvertisements,
    create: apiCreateServiceAdvertisement,
    update: apiUpdateServiceAdvertisement,
    remove: apiDeleteServiceAdvertisement,
    toggle: apiToggleServiceAdvertisementStatus,
    toggleResponseKey: 'serviceAdvertisement',
    addButtonLabel: '+ Add Advertisement',
    searchPlaceholder: 'Search advertisements...',
    emptyLabel: 'advertisements',
    activeLabel: 'service page',
  },
};

export default function AdvertisementBannerPage() {
  const [activeTab, setActiveTab] = useState('rentOffer');
  const cfg = TAB_CONFIG[activeTab];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [togglingId, setTogglingId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef();
  const [search, setSearch] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const filteredItems = items.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.subtitle?.toLowerCase().includes(q) ||
      a.clickableUrl?.toLowerCase().includes(q)
    );
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await cfg.getAll(token);
      setItems(res.data?.[cfg.listKey] || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-load whenever the active tab changes, and reset any open form/search state
  useEffect(() => {
    setSearch('');
    setFormOpen(false);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPreview('');
    setFormOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title || '',
      subtitle: a.subtitle || '',
      clickableUrl: a.clickableUrl || '',
      isActive: a.isActive,
      image: null,
    });
    setPreview(a.image || '');
    setFormOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.image && !editing) {
      alert('Please select an image');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subtitle', form.subtitle);
      fd.append('clickableUrl', form.clickableUrl);
      fd.append('isActive', form.isActive);
      if (form.image) fd.append('image', form.image);

      if (editing) {
        await cfg.update(editing._id, fd, token);
      } else {
        await cfg.create(fd, token);
      }
      setFormOpen(false);
      load();
    } catch {
      alert('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (a) => {
    setDeleteTarget(a);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id;
    setDeletingId(id);
    try {
      await cfg.remove(id, token);
      setItems((p) => p.filter((a) => a._id !== id));
    } catch {
      alert('Delete failed');
    } finally {
      setDeletingId('');
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await cfg.toggle(id, token);
      setItems((p) =>
        p.map((a) => (a._id === id ? res.data[cfg.toggleResponseKey] : a)),
      );
    } catch {
      alert('Toggle failed');
    } finally {
      setTogglingId('');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="border border-gray-200 rounded-xl p-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {Object.entries(TAB_CONFIG).map(([key, tabCfg]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === key
                  ? 'bg-[#FF7020] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tabCfg.label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between mb-6">
          <div className="flex flex-1 border border-gray-200 rounded-lg overflow-hidden focus-within:border-orange-400">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={cfg.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={openCreate}
              className="bg-[#FF7020] text-white px-4 py-2 text-sm font-medium hover:bg-orange-600 transition shrink-0"
            >
              {cfg.addButtonLabel}
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#FF7020] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 text-lg">
              {search
                ? `No matching ${cfg.emptyLabel}`
                : `No ${cfg.emptyLabel} yet`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search
                ? 'Try a different search term'
                : `Click "${cfg.addButtonLabel.replace('+ ', '')}" to create your first one`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((a) => (
              <div
                key={a._id}
                className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-36 object-cover"
                />
                <div className="p-3 flex-1 min-w-0">
                  {a.clickableUrl && (
                    <p className="text-xs text-blue-500 truncate mt-0.5">
                      {a.clickableUrl}
                    </p>
                  )}
                </div>
                <div className="px-3 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={a.isActive}
                        onChange={() => handleToggle(a._id)}
                        disabled={togglingId === a._id}
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#FF7020] rounded-full transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                    </label>
                    <span
                      className={`text-xs font-medium ${
                        a.isActive ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      disabled={deletingId === a._id}
                      className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === a._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 pb-4 shrink-0 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? `Edit ${cfg.label}` : `Add ${cfg.label}`}
              </h2>
            </div>

            <div
              className="overflow-y-auto flex-1 px-6 py-4 space-y-4"
              style={{ scrollbarWidth: 'none' }}
            >
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {cfg.label} Image
                </p>
                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-xl mb-2 border border-gray-200"
                  />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition"
                >
                  {preview ? 'Change Image' : 'Click to upload image'}
                </button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Clickable URL
                </p>
                <input
                  type="text"
                  value={form.clickableUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, clickableUrl: e.target.value }))
                  }
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  When set, clicking the image will redirect to this URL
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Active (show on {cfg.activeLabel})
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                  <div className="w-10 h-5 bg-gray-300 peer-checked:bg-[#FF7020] rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setFormOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#FF7020] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
            <h3 className="text-base font-semibold text-gray-900">
              Delete {cfg.label}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this item? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget._id}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget._id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {deletingId === deleteTarget._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
