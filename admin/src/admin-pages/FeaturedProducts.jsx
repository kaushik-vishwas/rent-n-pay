// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import API from '@/service/api';
// import { SearchIcon } from 'lucide-react';

// // ── API helpers ───────────────────────────────────────────────────────────────
// const getToken = () =>
//   typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

// const apiFeaturedList = (tab, search = '') =>
//   API.get(`/admin/featured`, {
//     params: { tab, ...(search ? { search } : {}) },
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });

// const apiFeaturedAvailable = (tab, search = '') =>
//   API.get(`/admin/featured/available`, {
//     params: { tab, ...(search ? { search } : {}) },
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });

// const apiFeaturedAdd = (listingId, listingType, tab) =>
//   API.post(
//     `/admin/featured`,
//     { listingId, listingType, tab },
//     { headers: { Authorization: `Bearer ${getToken()}` } },
//   );

// const apiFeaturedUpdatePriority = (listingType, listingId, priorityRank) =>
//   API.patch(
//     `/admin/featured/${listingType}/${listingId}/priority`,
//     { priorityRank },
//     { headers: { Authorization: `Bearer ${getToken()}` } },
//   );

// const apiFeaturedToggleStatus = (listingType, listingId) =>
//   API.patch(
//     `/admin/featured/${listingType}/${listingId}/status`,
//     {},
//     { headers: { Authorization: `Bearer ${getToken()}` } },
//   );

// const apiFeaturedRemove = (listingType, listingId) =>
//   API.delete(`/admin/featured/${listingType}/${listingId}`, {
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });

// // ── Tab config ────────────────────────────────────────────────────────────────
// const TABS = [
//   { label: 'Monthly Rentals', value: 'monthly_rental', listingType: 'product' },
//   {
//     label: 'Service Packages',
//     value: 'service_package',
//     listingType: 'service',
//   },
//   { label: 'Buying (New/Used)', value: 'buying', listingType: 'product' },
// ];

// function getListingType(tabValue) {
//   return TABS.find((t) => t.value === tabValue)?.listingType ?? 'product';
// }

// // ── Toast ─────────────────────────────────────────────────────────────────────
// function Toast({ toasts }) {
//   return (
//     <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
//       {toasts.map((t) => (
//         <div
//           key={t.id}
//           className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white transition-all duration-300 ${
//             t.type === 'error' ? 'bg-red-500' : 'bg-green-600'
//           }`}
//         >
//           {t.message}
//         </div>
//       ))}
//     </div>
//   );
// }

// function useToast() {
//   const [toasts, setToasts] = useState([]);
//   const push = useCallback((message, type = 'success') => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, message, type }]);
//     setTimeout(
//       () => setToasts((prev) => prev.filter((t) => t.id !== id)),
//       3000,
//     );
//   }, []);
//   return { toasts, push };
// }

// // ── Skeleton row ──────────────────────────────────────────────────────────────
// function SkeletonRow() {
//   return (
//     <tr className="border-b border-gray-100">
//       {[1, 2, 3, 4, 5, 6, 7].map((i) => (
//         <td key={i} className="px-5 py-4">
//           <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
//         </td>
//       ))}
//     </tr>
//   );
// }

// // ── Product image with fallback ───────────────────────────────────────────────
// function ProductImage({ src, alt }) {
//   const [err, setErr] = useState(false);
//   return err || !src ? (
//     <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
//       <svg
//         className="w-5 h-5 text-gray-400"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
//         <path d="M3 9l4-4 4 4 4-4 4 4" strokeWidth="1.5" />
//       </svg>
//     </div>
//   ) : (
//     <img
//       src={src}
//       alt={alt}
//       onError={() => setErr(true)}
//       className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
//       loading="lazy"
//     />
//   );
// }

// // ── Badges ────────────────────────────────────────────────────────────────────
// function StatusBadge({ status }) {
//   const isLive = status === 'live';
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
//         isLive
//           ? 'bg-green-50 text-green-700 border border-green-100'
//           : 'bg-gray-100 text-gray-500 border border-gray-200'
//       }`}
//     >
//       <span
//         className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}
//       />
//       {isLive ? 'Live' : 'Inactive'}
//     </span>
//   );
// }

// function CategoryBadge({ category }) {
//   return (
//     <span className="inline-block text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
//       {category || '—'}
//     </span>
//   );
// }

// // ── Toggle switch ─────────────────────────────────────────────────────────────
// function ToggleSwitch({ enabled, onChange, loading }) {
//   return (
//     <button
//       onClick={onChange}
//       disabled={loading}
//       aria-label="Toggle feature status"
//       className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#F97316] ${
//         enabled ? 'bg-[#F97316]' : 'bg-gray-200'
//       } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//     >
//       <span
//         className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
//           enabled ? 'translate-x-6' : 'translate-x-1'
//         }`}
//       />
//     </button>
//   );
// }

// // ── Action menu ───────────────────────────────────────────────────────────────
// function ActionMenu({ onRemove }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const close = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener('mousedown', close);
//     return () => document.removeEventListener('mousedown', close);
//   }, []);

//   return (
//     <div ref={ref} className="relative">
//       <button
//         onClick={() => setOpen((p) => !p)}
//         aria-label="More actions"
//         className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
//       >
//         <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//           <circle cx="8" cy="3" r="1.2" />
//           <circle cx="8" cy="8" r="1.2" />
//           <circle cx="8" cy="13" r="1.2" />
//         </svg>
//       </button>
//       {open && (
//         <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 w-36 py-1 text-sm">
//           <button
//             onClick={() => {
//               setOpen(false);
//               onRemove();
//             }}
//             className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition"
//           >
//             Remove
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Drag handle icon ──────────────────────────────────────────────────────────
// function DragHandle({ listeners, attributes }) {
//   return (
//     <button
//       {...listeners}
//       {...attributes}
//       className="cursor-grab active:cursor-grabbing p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition touch-none"
//       aria-label="Drag to reorder"
//       tabIndex={-1}
//     >
//       <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//         <circle cx="9" cy="5" r="1.5" />
//         <circle cx="15" cy="5" r="1.5" />
//         <circle cx="9" cy="12" r="1.5" />
//         <circle cx="15" cy="12" r="1.5" />
//         <circle cx="9" cy="19" r="1.5" />
//         <circle cx="15" cy="19" r="1.5" />
//       </svg>
//     </button>
//   );
// }

// // ── Sortable table row ────────────────────────────────────────────────────────
// function SortableRow({ item, activeTab, toggleLoading, onToggle, onRemove }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: item._id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 10 : 'auto',
//     position: 'relative',
//   };

//   return (
//     <tr
//       ref={setNodeRef}
//       style={style}
//       className={`border-b border-gray-50 last:border-0 ${
//         isDragging ? 'bg-orange-50/60 shadow-md' : 'hover:bg-gray-50/40'
//       } transition`}
//     >
//       {/* Product ID */}
//       <td className="px-5 py-4">
//         <span className="text-xs font-mono text-gray-400">
//           {item._id?.slice(-6).toUpperCase()}
//         </span>
//       </td>

//       {/* Product Info */}
//       <td className="px-5 py-4">
//         <div className="flex items-center gap-3">
//           <ProductImage src={item.image} alt={item.productName} />
//           <div className="min-w-0">
//             <p className="font-semibold text-gray-900 truncate max-w-[180px]">
//               {item.productName}
//             </p>
//             {item.price && (
//               <p className="text-xs text-gray-400 mt-0.5">{item.price}</p>
//             )}
//           </div>
//         </div>
//       </td>

//       {/* Vendor */}
//       <td className="px-5 py-4">
//         <div className="flex items-center gap-2">
//           <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
//           <span className="text-gray-700 font-medium whitespace-nowrap">
//             {item.vendor?.name || item.vendorName || '—'}
//           </span>
//         </div>
//       </td>

//       {/* Priority Rank — drag handle + read-only rank number */}
//       <td className="px-5 py-4">
//         <div className="flex items-center gap-2">
//           <DragHandle listeners={listeners} attributes={attributes} />
//           <span className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-gray-50 select-none">
//             {item.featured?.priorityRank}
//           </span>
//         </div>
//       </td>

//       {/* Category */}
//       <td className="px-5 py-4">
//         <CategoryBadge category={item.category} />
//       </td>

//       {/* Status */}
//       <td className="px-5 py-4">
//         <div className="flex items-center gap-2.5">
//           <ToggleSwitch
//             enabled={item.featured?.enabled}
//             onChange={() => onToggle(item)}
//             loading={!!toggleLoading[item._id]}
//           />
//           <StatusBadge status={item.featured?.status} />
//         </div>
//       </td>

//       {/* Actions */}
//       <td className="px-5 py-4">
//         <ActionMenu onRemove={() => onRemove(item)} />
//       </td>
//     </tr>
//   );
// }

// // ── Add to Featured Modal ─────────────────────────────────────────────────────
// function AddFeaturedModal({ activeTab, onClose, onAdded, toast }) {
//   const [modalTab, setModalTab] = useState(activeTab);
//   const [search, setSearch] = useState('');
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [adding, setAdding] = useState(false);
//   const searchTimerRef = useRef(null);

//   const fetchAvailable = useCallback(async (tab, q = '') => {
//     setLoading(true);
//     setSelected(null);
//     try {
//       const { data } = await apiFeaturedAvailable(tab, q);
//       setProducts(data?.data || []);
//     } catch {
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAvailable(modalTab, '');
//   }, [modalTab]);

//   const handleSearch = (val) => {
//     setSearch(val);
//     clearTimeout(searchTimerRef.current);
//     searchTimerRef.current = setTimeout(
//       () => fetchAvailable(modalTab, val),
//       400,
//     );
//   };

//   const handleAdd = async () => {
//     if (!selected) return;
//     setAdding(true);
//     try {
//       await apiFeaturedAdd(selected._id, getListingType(modalTab), modalTab);
//       toast('Added to featured successfully');
//       onAdded();
//       onClose();
//     } catch (e) {
//       toast(e?.response?.data?.message || 'Failed to add', 'error');
//     } finally {
//       setAdding(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
//         onClick={onClose}
//       />
//       <div
//         className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
//         style={{ maxHeight: '90vh' }}
//       >
//         {/* Header */}
//         <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
//           <div>
//             <h2 className="text-base font-semibold text-gray-900">
//               Promote to Featured
//             </h2>
//             <p className="text-sm text-gray-500 mt-0.5">
//               Select a product or service to highlight on your platform
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition"
//           >
//             <svg
//               width="16"
//               height="16"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               strokeWidth="2"
//             >
//               <path d="M18 6L6 18M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Category tabs */}
//         <div className="px-6 pt-4 flex-shrink-0">
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//             Select Category
//           </p>
//           <div className="flex gap-2 flex-wrap">
//             {TABS.map((t) => (
//               <button
//                 key={t.value}
//                 onClick={() => {
//                   setModalTab(t.value);
//                   setSearch('');
//                 }}
//                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
//                   modalTab === t.value
//                     ? 'bg-[#F97316] text-white border-[#F97316]'
//                     : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
//                 }`}
//               >
//                 {t.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Search */}
//         <div className="px-6 pt-4 flex gap-3 flex-shrink-0">
//           <div className="relative flex-1">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => handleSearch(e.target.value)}
//               placeholder="Search by Product Name, ID, or Vendor..."
//               className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50"
//             />
//           </div>
//           <select className="border border-gray-200 rounded-xl text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300">
//             <option>All Products</option>
//             <option>Furniture</option>
//             <option>Electronics</option>
//             <option>Appliances</option>
//           </select>
//         </div>

//         {/* Product list */}
//         <div className="px-6 pt-4 overflow-y-auto flex-1 min-h-0">
//           <p className="text-sm font-medium text-gray-700 mb-3">
//             Select Product ({products.length} available)
//           </p>
//           {loading ? (
//             <div className="space-y-3 pb-4">
//               {[1, 2, 3].map((i) => (
//                 <div
//                   key={i}
//                   className="h-20 bg-gray-100 rounded-xl animate-pulse"
//                 />
//               ))}
//             </div>
//           ) : products.length === 0 ? (
//             <div className="flex flex-col items-center text-center py-10">
//               <svg
//                 className="w-10 h-10 mb-2 text-gray-200"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <p className="text-sm text-gray-400">
//                 No products available to feature
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-2.5 pb-4">
//               {products.map((p) => (
//                 <label
//                   key={p._id}
//                   className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition ${
//                     selected?._id === p._id
//                       ? 'border-[#F97316] bg-orange-50'
//                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="modal-product"
//                     value={p._id}
//                     checked={selected?._id === p._id}
//                     onChange={() => setSelected(p)}
//                     className="accent-[#F97316]"
//                   />
//                   <ProductImage src={p.image} alt={p.productName} />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-gray-900 truncate">
//                       {p.productName}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       {p.vendor?.name || '—'}
//                       <span className="text-gray-300 mx-1">·</span>
//                       <span className="text-gray-400 font-mono">
//                         {p._id?.slice(-6)}
//                       </span>
//                     </p>
//                   </div>
//                   <span className="text-sm font-semibold text-[#F97316] whitespace-nowrap">
//                     {p.price || '—'}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleAdd}
//             disabled={!selected || adding}
//             className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
//           >
//             {adding ? 'Adding...' : 'Add to Featured'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Confirm dialog ────────────────────────────────────────────────────────────
// function ConfirmDialog({ message, onConfirm, onCancel }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
//         onClick={onCancel}
//       />
//       <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
//         <h3 className="text-base font-semibold text-gray-900 mb-2">
//           Remove from Featured?
//         </h3>
//         <p className="text-sm text-gray-500 mb-5">{message}</p>
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
//           >
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────────────────────
// export default function FeaturedProductsPage() {
//   const [activeTab, setActiveTab] = useState('monthly_rental');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [toggleLoading, setToggleLoading] = useState({});
//   const [confirmRemove, setConfirmRemove] = useState(null);
//   const searchTimerRef = useRef(null);
//   const { toasts, push: toast } = useToast();

//   // dnd-kit sensors — only start drag after 8px movement (prevents accidental drags)
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
//   );

//   // ── Fetch ──────────────────────────────────────────────────────────────────
//   const fetchListings = useCallback(async (tab, q = '') => {
//     setLoading(true);
//     try {
//       const { data } = await apiFeaturedList(tab, q);
//       setListings(data?.data || []);
//     } catch {
//       setListings([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchListings(activeTab, '');
//   }, [activeTab]);

//   // ── Search ─────────────────────────────────────────────────────────────────
//   const handleSearch = (val) => {
//     setSearchQuery(val);
//     clearTimeout(searchTimerRef.current);
//     searchTimerRef.current = setTimeout(
//       () => fetchListings(activeTab, val),
//       400,
//     );
//   };

//   // ── Toggle ─────────────────────────────────────────────────────────────────
//   const handleToggle = async (item) => {
//     setToggleLoading((p) => ({ ...p, [item._id]: true }));
//     try {
//       const { data } = await apiFeaturedToggleStatus(
//         getListingType(activeTab),
//         item._id,
//       );
//       setListings((prev) =>
//         prev.map((i) =>
//           i._id === item._id
//             ? { ...i, featured: { ...i.featured, ...data?.data?.featured } }
//             : i,
//         ),
//       );
//       toast('Status updated successfully');
//     } catch {
//       toast('Failed to update status', 'error');
//     } finally {
//       setToggleLoading((p) => ({ ...p, [item._id]: false }));
//     }
//   };

//   // ── Remove ─────────────────────────────────────────────────────────────────
//   const handleRemove = async () => {
//     if (!confirmRemove) return;
//     const { id, type, name } = confirmRemove;
//     setConfirmRemove(null);
//     try {
//       await apiFeaturedRemove(type, id);
//       setListings((prev) => prev.filter((i) => i._id !== id));
//       toast(`"${name}" removed from featured`);
//     } catch {
//       toast('Failed to remove listing', 'error');
//     }
//   };

//   // ── Drag end — reorder locally then persist each updated rank ─────────────
//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const listingType = getListingType(activeTab);
//     const oldIndex = listings.findIndex((i) => i._id === active.id);
//     const newIndex = listings.findIndex((i) => i._id === over.id);

//     // 1. Optimistic reorder in UI
//     const reordered = arrayMove(listings, oldIndex, newIndex);

//     // 2. Reassign priorityRank = position index + 1
//     const updated = reordered.map((item, idx) => ({
//       ...item,
//       featured: { ...item.featured, priorityRank: idx + 1 },
//     }));
//     setListings(updated);

//     // 3. Persist only the items whose rank actually changed
//     const changedItems = updated.filter(
//       (item, idx) => listings[idx]?._id !== item._id,
//     );

//     await Promise.allSettled(
//       changedItems.map((item) =>
//         apiFeaturedUpdatePriority(
//           listingType,
//           item._id,
//           item.featured.priorityRank,
//         ),
//       ),
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-6 pt-2 max-w-[1200px] mx-auto">
//         {/* Page header */}
//         {/* <div className="mb-6">
//           <h1 className="text-xl font-bold text-gray-900">Featured Products</h1>
//           <p className="text-sm text-gray-500 mt-0.5">
//             Manage priority rankings and visibility of featured products and services
//           </p>
//         </div> */}

//         {/* Tab bar */}
//         {/* <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 mb-5 shadow-sm">
//           {TABS.map((t) => (
//             <button
//               key={t.value}
//               onClick={() => {
//                 setActiveTab(t.value);
//                 setSearchQuery('');
//               }}
//               className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
//                 activeTab === t.value
//                   ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         <div className="flex items-center justify-between gap-3 mb-5">
//           <div className="relative flex-1 max-w-sm">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//               placeholder="Search featured products..."
//               className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
//             />
//           </div>
//           <button
//             onClick={() => setShowModal(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition shadow-sm"
//           >
//             <svg
//               width="16"
//               height="16"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               strokeWidth="2.5"
//             >
//               <path d="M12 5v14M5 12h14" strokeLinecap="round" />
//             </svg>
//             Add to Featured
//           </button>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto"> */}
//         {/* Unified card: tabs + toolbar + table */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           {/* Tab bar */}
//           <div className="p-1.5 flex gap-1 border-b border-gray-100">
//             {TABS.map((t) => (
//               <button
//                 key={t.value}
//                 onClick={() => {
//                   setActiveTab(t.value);
//                   setSearchQuery('');
//                 }}
//                 className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
//                   activeTab === t.value
//                     ? 'bg-gray-50 text-gray-900 border border-gray-100'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {t.label}
//               </button>
//             ))}
//           </div>

//           {/* Toolbar */}
//           <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
//             <div className="relative flex-1 max-w-sm">
//               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 placeholder="Search featured products..."
//                 className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
//               />
//             </div>
//             <button
//               onClick={() => setShowModal(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition shadow-sm"
//             >
//               <svg
//                 width="16"
//                 height="16"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 strokeWidth="2.5"
//               >
//                 <path d="M12 5v14M5 12h14" strokeLinecap="round" />
//               </svg>
//               Add to Featured
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-100 bg-gray-50/60">
//                   {[
//                     'Product ID',
//                     'Product Info',
//                     'Vendor',
//                     'Priority Rank',
//                     'Category',
//                     'Status',
//                     'Actions',
//                   ].map((h) => (
//                     <th
//                       key={h}
//                       className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               {/* DndContext wraps only tbody */}
//               <DndContext
//                 sensors={sensors}
//                 collisionDetection={closestCenter}
//                 onDragEnd={handleDragEnd}
//               >
//                 <SortableContext
//                   items={listings.map((i) => i._id)}
//                   strategy={verticalListSortingStrategy}
//                 >
//                   <tbody>
//                     {loading ? (
//                       Array.from({ length: 4 }).map((_, i) => (
//                         <SkeletonRow key={i} />
//                       ))
//                     ) : listings.length === 0 ? (
//                       <tr>
//                         <td colSpan={7} className="px-5 py-16 text-center">
//                           <div className="flex flex-col items-center gap-3">
//                             <svg
//                               className="w-12 h-12 text-gray-200"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             </svg>
//                             <p className="text-sm font-medium text-gray-500">
//                               No featured products yet
//                             </p>
//                             <p className="text-xs text-gray-400">
//                               Click &quot;Add to Featured&quot; to promote a
//                               product
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       listings.map((item) => (
//                         <SortableRow
//                           key={item._id}
//                           item={item}
//                           activeTab={activeTab}
//                           toggleLoading={toggleLoading}
//                           onToggle={handleToggle}
//                           onRemove={(item) =>
//                             setConfirmRemove({
//                               id: item._id,
//                               type: getListingType(activeTab),
//                               name: item.productName,
//                             })
//                           }
//                         />
//                       ))
//                     )}
//                   </tbody>
//                 </SortableContext>
//               </DndContext>
//             </table>
//           </div>
//         </div>
//       </div>

//       {showModal && (
//         <AddFeaturedModal
//           activeTab={activeTab}
//           onClose={() => setShowModal(false)}
//           onAdded={() => fetchListings(activeTab, searchQuery)}
//           toast={toast}
//         />
//       )}

//       {confirmRemove && (
//         <ConfirmDialog
//           message={`Remove "${confirmRemove.name}" from featured listings? This action cannot be undone.`}
//           onConfirm={handleRemove}
//           onCancel={() => setConfirmRemove(null)}
//         />
//       )}

//       <Toast toasts={toasts} />
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import API from '@/service/api';
// import { SearchIcon } from 'lucide-react';

// // ── API helpers ───────────────────────────────────────────────────────────────
// const getToken = () =>
//   typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

// const apiFeaturedList = (tab, search = '') =>
//   API.get(`/admin/featured`, {
//     params: { tab, ...(search ? { search } : {}) },
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });

// const apiFeaturedAvailable = (tab, search = '') =>
//   API.get(`/admin/featured/available`, {
//     params: { tab, ...(search ? { search } : {}) },
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });

// const apiFeaturedAdd = (listingId, listingType, tab) =>
//   API.post(
//     `/admin/featured`,
//     { listingId, listingType, tab },
//     { headers: { Authorization: `Bearer ${getToken()}` } },
//   );

// const apiFeaturedUpdatePriority = (listingType, listingId, priorityRank) =>
//   API.patch(
//     `/admin/featured/${listingType}/${listingId}/priority`,
//     { priorityRank },
//     { headers: { Authorization: `Bearer ${getToken()}` } },
//   );

// const apiFeaturedToggleStatus = (listingType, listingId) =>
//   API.patch(
//     `/admin/featured/${listingType}/${listingId}/status`,
//     {},
//     { headers: { Authorization: `Bearer ${getToken()}` } },
//   );

// const apiFeaturedRemove = (listingType, listingId) =>
//   API.delete(`/admin/featured/${listingType}/${listingId}`, {
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });

// // ── Tab config ────────────────────────────────────────────────────────────────
// const TABS = [
//   { label: 'Rentals', value: 'monthly_rental', listingType: 'product' },
//   {
//     label: 'Service',
//     value: 'service_package',
//     listingType: 'service',
//   },
//   { label: 'Buy', value: 'buying', listingType: 'product' },
// ];

// function getListingType(tabValue) {
//   return TABS.find((t) => t.value === tabValue)?.listingType ?? 'product';
// }

// // ── Toast ─────────────────────────────────────────────────────────────────────
// function Toast({ toasts }) {
//   return (
//     <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
//       {toasts.map((t) => (
//         <div
//           key={t.id}
//           className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white transition-all duration-300 ${
//             t.type === 'error' ? 'bg-red-500' : 'bg-green-600'
//           }`}
//         >
//           {t.message}
//         </div>
//       ))}
//     </div>
//   );
// }

// function useToast() {
//   const [toasts, setToasts] = useState([]);
//   const push = useCallback((message, type = 'success') => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, message, type }]);
//     setTimeout(
//       () => setToasts((prev) => prev.filter((t) => t.id !== id)),
//       3000,
//     );
//   }, []);
//   return { toasts, push };
// }

// // ── Skeleton row ──────────────────────────────────────────────────────────────
// function SkeletonRow() {
//   return (
//     <tr className="border-b border-gray-100">
//       {[1, 2, 3, 4, 5, 6, 7].map((i) => (
//         <td key={i} className="px-5 py-4">
//           <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
//         </td>
//       ))}
//     </tr>
//   );
// }

// // ── Product image with fallback ───────────────────────────────────────────────
// function ProductImage({ src, alt }) {
//   const [err, setErr] = useState(false);
//   return err || !src ? (
//     <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
//       <svg
//         className="w-5 h-5 text-gray-400"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
//         <path d="M3 9l4-4 4 4 4-4 4 4" strokeWidth="1.5" />
//       </svg>
//     </div>
//   ) : (
//     <img
//       src={src}
//       alt={alt}
//       onError={() => setErr(true)}
//       className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
//       loading="lazy"
//     />
//   );
// }

// // ── Badges ────────────────────────────────────────────────────────────────────
// function StatusBadge({ status }) {
//   const isLive = status === 'live';
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
//         isLive
//           ? 'bg-green-50 text-green-700 border border-green-100'
//           : 'bg-gray-100 text-gray-500 border border-gray-200'
//       }`}
//     >
//       <span
//         className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}
//       />
//       {isLive ? 'Live' : 'Inactive'}
//     </span>
//   );
// }

// function CategoryBadge({ category }) {
//   return (
//     <span className="inline-block text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
//       {category || '—'}
//     </span>
//   );
// }

// // ── Toggle switch ─────────────────────────────────────────────────────────────
// function ToggleSwitch({ enabled, onChange, loading }) {
//   return (
//     <button
//       onClick={onChange}
//       disabled={loading}
//       aria-label="Toggle feature status"
//       className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#F97316] ${
//         enabled ? 'bg-[#F97316]' : 'bg-gray-200'
//       } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
//     >
//       <span
//         className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
//           enabled ? 'translate-x-6' : 'translate-x-1'
//         }`}
//       />
//     </button>
//   );
// }

// // ── Action menu ───────────────────────────────────────────────────────────────
// function ActionMenu({ onRemove }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const close = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener('mousedown', close);
//     return () => document.removeEventListener('mousedown', close);
//   }, []);

//   return (
//     <div ref={ref} className="relative">
//       <button
//         onClick={() => setOpen((p) => !p)}
//         aria-label="More actions"
//         className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
//       >
//         <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//           <circle cx="8" cy="3" r="1.2" />
//           <circle cx="8" cy="8" r="1.2" />
//           <circle cx="8" cy="13" r="1.2" />
//         </svg>
//       </button>
//       {open && (
//         <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 w-36 py-1 text-sm">
//           <button
//             onClick={() => {
//               setOpen(false);
//               onRemove();
//             }}
//             className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition"
//           >
//             Remove
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Drag handle icon ──────────────────────────────────────────────────────────
// function DragHandle({ listeners, attributes }) {
//   return (
//     <button
//       {...listeners}
//       {...attributes}
//       className="cursor-grab active:cursor-grabbing p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition touch-none"
//       aria-label="Drag to reorder"
//       tabIndex={-1}
//     >
//       <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//         <circle cx="9" cy="5" r="1.5" />
//         <circle cx="15" cy="5" r="1.5" />
//         <circle cx="9" cy="12" r="1.5" />
//         <circle cx="15" cy="12" r="1.5" />
//         <circle cx="9" cy="19" r="1.5" />
//         <circle cx="15" cy="19" r="1.5" />
//       </svg>
//     </button>
//   );
// }

// // ── Sortable table row ────────────────────────────────────────────────────────
// function SortableRow({ item, activeTab, toggleLoading, onToggle, onRemove }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: item._id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     zIndex: isDragging ? 10 : 'auto',
//     position: 'relative',
//   };

//   return (
//     <tr
//       ref={setNodeRef}
//       style={style}
//       className={`border-b border-gray-50 last:border-0 ${
//         isDragging ? 'bg-orange-50/60 shadow-md' : 'hover:bg-gray-50/40'
//       } transition`}
//     >
//       {/* Product ID */}
//       <td className="px-5 py-4 text-center">
//         <span className="text-xs font-mono text-gray-400">
//           {item._id?.slice(-6).toUpperCase()}
//         </span>
//       </td>

//       {/* Product Info */}
//       <td className="px-5 py-4 text-center">
//         <div className="flex items-center justify-start gap-3">
//           <ProductImage src={item.image} alt={item.productName} />
//           <div className="min-w-0 text-left">
//             <p className="font-semibold text-gray-900 truncate max-w-[180px]">
//               {item.productName}
//             </p>
//             {item.price && (
//               <p className="text-xs text-gray-400 mt-0.5">{item.price}</p>
//             )}
//           </div>
//         </div>
//       </td>

//       {/* Vendor */}
//       <td className="px-5 py-4 text-center">
//         <div className="flex items-center justify-center gap-2">
//           <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
//           <span className="text-gray-700 font-medium whitespace-nowrap">
//             {item.vendor?.name || item.vendorName || '—'}
//           </span>
//         </div>
//       </td>
//       {/* Priority Rank — drag handle + read-only rank number */}
//       <td className="px-5 py-4 text-center">
//         <div className="flex items-center justify-center gap-2">
//           <DragHandle listeners={listeners} attributes={attributes} />
//           <span className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-gray-50 select-none">
//             {item.featured?.priorityRank}
//           </span>
//         </div>
//       </td>

//       {/* Category */}
//       <td className="px-5 py-4 text-center">
//         <CategoryBadge category={item.category} />
//       </td>

//       {/* Status */}
//       <td className="px-5 py-4 text-center">
//         <div className="flex items-center justify-center gap-2.5">
//           <ToggleSwitch
//             enabled={item.featured?.enabled}
//             onChange={() => onToggle(item)}
//             loading={!!toggleLoading[item._id]}
//           />
//           <StatusBadge status={item.featured?.status} />
//         </div>
//       </td>

//       {/* Actions */}
//       <td className="px-5 py-4 text-center">
//         <ActionMenu onRemove={() => onRemove(item)} />
//       </td>
//     </tr>
//   );
// }

// // ── Add to Featured Modal ─────────────────────────────────────────────────────
// function AddFeaturedModal({ activeTab, onClose, onAdded, toast }) {
//   const [modalTab, setModalTab] = useState(activeTab);
//   const [search, setSearch] = useState('');
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [adding, setAdding] = useState(false);
//   const searchTimerRef = useRef(null);

//   const fetchAvailable = useCallback(async (tab, q = '') => {
//     setLoading(true);
//     setSelected(null);
//     try {
//       const { data } = await apiFeaturedAvailable(tab, q);
//       setProducts(data?.data || []);
//     } catch {
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAvailable(modalTab, '');
//   }, [modalTab]);

//   const handleSearch = (val) => {
//     setSearch(val);
//     clearTimeout(searchTimerRef.current);
//     searchTimerRef.current = setTimeout(
//       () => fetchAvailable(modalTab, val),
//       400,
//     );
//   };

//   const handleAdd = async () => {
//     if (!selected) return;
//     setAdding(true);
//     try {
//       await apiFeaturedAdd(selected._id, getListingType(modalTab), modalTab);
//       toast('Added to featured successfully');
//       onAdded();
//       onClose();
//     } catch (e) {
//       toast(e?.response?.data?.message || 'Failed to add', 'error');
//     } finally {
//       setAdding(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
//         onClick={onClose}
//       />
//       <div
//         className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
//         style={{ maxHeight: '90vh' }}
//       >
//         {/* Header */}
//         <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
//           <div>
//             <h2 className="text-base font-semibold text-gray-900">
//               Promote to Featured
//             </h2>
//             <p className="text-sm text-gray-500 mt-0.5">
//               Select a product or service to highlight on your platform
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition"
//           >
//             <svg
//               width="16"
//               height="16"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               strokeWidth="2"
//             >
//               <path d="M18 6L6 18M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Category tabs */}
//         <div className="px-6 pt-4 flex-shrink-0">
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//             Select Category
//           </p>
//           <div className="flex gap-2 flex-wrap">
//             {TABS.map((t) => (
//               <button
//                 key={t.value}
//                 onClick={() => {
//                   setModalTab(t.value);
//                   setSearch('');
//                 }}
//                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
//                   modalTab === t.value
//                     ? 'bg-[#F97316] text-white border-[#F97316]'
//                     : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
//                 }`}
//               >
//                 {t.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Search */}
//         <div className="px-6 pt-4 flex gap-3 flex-shrink-0">
//           <div className="relative flex-1">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => handleSearch(e.target.value)}
//               placeholder="Search by Product Name, ID, or Vendor..."
//               className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50"
//             />
//           </div>
//           <select className="border border-gray-200 rounded-xl text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300">
//             <option>All Products</option>
//             <option>Furniture</option>
//             <option>Electronics</option>
//             <option>Appliances</option>
//           </select>
//         </div>

//         {/* Product list */}
//         <div className="px-6 pt-4 overflow-y-auto flex-1 min-h-0">
//           <p className="text-sm font-medium text-gray-700 mb-3">
//             Select Product ({products.length} available)
//           </p>
//           {loading ? (
//             <div className="space-y-3 pb-4">
//               {[1, 2, 3].map((i) => (
//                 <div
//                   key={i}
//                   className="h-20 bg-gray-100 rounded-xl animate-pulse"
//                 />
//               ))}
//             </div>
//           ) : products.length === 0 ? (
//             <div className="flex flex-col items-center text-center py-10">
//               <svg
//                 className="w-10 h-10 mb-2 text-gray-200"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <p className="text-sm text-gray-400">
//                 No products available to feature
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-2.5 pb-4">
//               {products.map((p) => (
//                 <label
//                   key={p._id}
//                   className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition ${
//                     selected?._id === p._id
//                       ? 'border-[#F97316] bg-orange-50'
//                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="modal-product"
//                     value={p._id}
//                     checked={selected?._id === p._id}
//                     onChange={() => setSelected(p)}
//                     className="accent-[#F97316]"
//                   />
//                   <ProductImage src={p.image} alt={p.productName} />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-gray-900 truncate">
//                       {p.productName}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       {p.vendor?.name || '—'}
//                       <span className="text-gray-300 mx-1">·</span>
//                       <span className="text-gray-400 font-mono">
//                         {p._id?.slice(-6)}
//                       </span>
//                     </p>
//                   </div>
//                   <span className="text-sm font-semibold text-[#F97316] whitespace-nowrap">
//                     {p.price || '—'}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleAdd}
//             disabled={!selected || adding}
//             className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
//           >
//             {adding ? 'Adding...' : 'Add to Featured'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Confirm dialog ────────────────────────────────────────────────────────────
// function ConfirmDialog({ message, onConfirm, onCancel }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
//         onClick={onCancel}
//       />
//       <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
//         <h3 className="text-base font-semibold text-gray-900 mb-2">
//           Remove from Featured?
//         </h3>
//         <p className="text-sm text-gray-500 mb-5">{message}</p>
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
//           >
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────────────────────
// export default function FeaturedProductsPage() {
//   const [activeTab, setActiveTab] = useState('monthly_rental');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [toggleLoading, setToggleLoading] = useState({});
//   const [confirmRemove, setConfirmRemove] = useState(null);
//   const searchTimerRef = useRef(null);
//   const { toasts, push: toast } = useToast();

//   // dnd-kit sensors — only start drag after 8px movement (prevents accidental drags)
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
//   );

//   // ── Fetch ──────────────────────────────────────────────────────────────────
//   const fetchListings = useCallback(async (tab, q = '') => {
//     setLoading(true);
//     try {
//       const { data } = await apiFeaturedList(tab, q);
//       setListings(data?.data || []);
//     } catch {
//       setListings([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchListings(activeTab, '');
//   }, [activeTab]);

//   // ── Search ─────────────────────────────────────────────────────────────────
//   const handleSearch = (val) => {
//     setSearchQuery(val);
//     clearTimeout(searchTimerRef.current);
//     searchTimerRef.current = setTimeout(
//       () => fetchListings(activeTab, val),
//       400,
//     );
//   };

//   // ── Toggle ─────────────────────────────────────────────────────────────────
//   const handleToggle = async (item) => {
//     setToggleLoading((p) => ({ ...p, [item._id]: true }));
//     try {
//       const { data } = await apiFeaturedToggleStatus(
//         getListingType(activeTab),
//         item._id,
//       );
//       setListings((prev) =>
//         prev.map((i) =>
//           i._id === item._id
//             ? { ...i, featured: { ...i.featured, ...data?.data?.featured } }
//             : i,
//         ),
//       );
//       toast('Status updated successfully');
//     } catch {
//       toast('Failed to update status', 'error');
//     } finally {
//       setToggleLoading((p) => ({ ...p, [item._id]: false }));
//     }
//   };

//   // ── Remove ─────────────────────────────────────────────────────────────────
//   const handleRemove = async () => {
//     if (!confirmRemove) return;
//     const { id, type, name } = confirmRemove;
//     setConfirmRemove(null);
//     try {
//       await apiFeaturedRemove(type, id);
//       setListings((prev) => prev.filter((i) => i._id !== id));
//       toast(`"${name}" removed from featured`);
//     } catch {
//       toast('Failed to remove listing', 'error');
//     }
//   };

//   // ── Drag end — reorder locally then persist each updated rank ─────────────
//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const listingType = getListingType(activeTab);
//     const oldIndex = listings.findIndex((i) => i._id === active.id);
//     const newIndex = listings.findIndex((i) => i._id === over.id);

//     // 1. Optimistic reorder in UI
//     const reordered = arrayMove(listings, oldIndex, newIndex);

//     // 2. Reassign priorityRank = position index + 1
//     const updated = reordered.map((item, idx) => ({
//       ...item,
//       featured: { ...item.featured, priorityRank: idx + 1 },
//     }));
//     setListings(updated);

//     // 3. Persist only the items whose rank actually changed
//     const changedItems = updated.filter(
//       (item, idx) => listings[idx]?._id !== item._id,
//     );

//     await Promise.allSettled(
//       changedItems.map((item) =>
//         apiFeaturedUpdatePriority(
//           listingType,
//           item._id,
//           item.featured.priorityRank,
//         ),
//       ),
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-6 pt-2 max-w-[1200px] mx-auto">
//         {/* Page header */}
//         {/* <div className="mb-6">
//           <h1 className="text-xl font-bold text-gray-900">Featured Products</h1>
//           <p className="text-sm text-gray-500 mt-0.5">
//             Manage priority rankings and visibility of featured products and services
//           </p>
//         </div> */}

//         {/* Tab bar */}
//         {/* <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 mb-5 shadow-sm">
//           {TABS.map((t) => (
//             <button
//               key={t.value}
//               onClick={() => {
//                 setActiveTab(t.value);
//                 setSearchQuery('');
//               }}
//               className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
//                 activeTab === t.value
//                   ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         <div className="flex items-center justify-between gap-3 mb-5">
//           <div className="relative flex-1 max-w-sm">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//               placeholder="Search featured products..."
//               className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
//             />
//           </div>
//           <button
//             onClick={() => setShowModal(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition shadow-sm"
//           >
//             <svg
//               width="16"
//               height="16"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               strokeWidth="2.5"
//             >
//               <path d="M12 5v14M5 12h14" strokeLinecap="round" />
//             </svg>
//             Add to Featured
//           </button>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto"> */}
//         {/* Unified card: tabs + toolbar + table */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           {/* Tab bar */}
//           <div className="p-1.5 flex gap-1 border-b border-gray-100">
//             {TABS.map((t) => (
//               <button
//                 key={t.value}
//                 onClick={() => {
//                   setActiveTab(t.value);
//                   setSearchQuery('');
//                 }}
//                 className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
//                   activeTab === t.value
//                     ? 'bg-gray-50 text-gray-900 border border-gray-100'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {t.label}
//               </button>
//             ))}
//           </div>

//           {/* Toolbar */}
//           <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
//             <div className="relative flex-1 max-w-sm">
//               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 placeholder="Search featured products..."
//                 className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
//               />
//             </div>
//             <button
//               onClick={() => setShowModal(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition shadow-sm"
//             >
//               <svg
//                 width="16"
//                 height="16"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 strokeWidth="2.5"
//               >
//                 <path d="M12 5v14M5 12h14" strokeLinecap="round" />
//               </svg>
//               Add to Featured
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               {[
//                 'Product ID',
//                 'Product Info',
//                 'Vendor',
//                 'Priority Rank',
//                 'Category',
//                 'Status',
//                 'Actions',
//               ].map((h) => (
//                 <th
//                   key={h}
//                   className={`px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
//                     h === 'Product Info' ? 'text-left' : 'text-center'
//                   }`}
//                 >
//                   {h}
//                 </th>
//               ))}

//               {/* DndContext wraps only tbody */}
//               <DndContext
//                 sensors={sensors}
//                 collisionDetection={closestCenter}
//                 onDragEnd={handleDragEnd}
//               >
//                 <SortableContext
//                   items={listings.map((i) => i._id)}
//                   strategy={verticalListSortingStrategy}
//                 >
//                   <tbody>
//                     {loading ? (
//                       Array.from({ length: 4 }).map((_, i) => (
//                         <SkeletonRow key={i} />
//                       ))
//                     ) : listings.length === 0 ? (
//                       <tr>
//                         <td colSpan={7} className="px-5 py-16 text-center">
//                           <div className="flex flex-col items-center gap-3">
//                             <svg
//                               className="w-12 h-12 text-gray-200"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
//                                 strokeWidth="1.5"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             </svg>
//                             <p className="text-sm font-medium text-gray-500">
//                               No featured products yet
//                             </p>
//                             <p className="text-xs text-gray-400">
//                               Click &quot;Add to Featured&quot; to promote a
//                               product
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       listings.map((item) => (
//                         <SortableRow
//                           key={item._id}
//                           item={item}
//                           activeTab={activeTab}
//                           toggleLoading={toggleLoading}
//                           onToggle={handleToggle}
//                           onRemove={(item) =>
//                             setConfirmRemove({
//                               id: item._id,
//                               type: getListingType(activeTab),
//                               name: item.productName,
//                             })
//                           }
//                         />
//                       ))
//                     )}
//                   </tbody>
//                 </SortableContext>
//               </DndContext>
//             </table>
//           </div>
//         </div>
//       </div>

//       {showModal && (
//         <AddFeaturedModal
//           activeTab={activeTab}
//           onClose={() => setShowModal(false)}
//           onAdded={() => fetchListings(activeTab, searchQuery)}
//           toast={toast}
//         />
//       )}

//       {confirmRemove && (
//         <ConfirmDialog
//           message={`Remove "${confirmRemove.name}" from featured listings? This action cannot be undone.`}
//           onConfirm={handleRemove}
//           onCancel={() => setConfirmRemove(null)}
//         />
//       )}

//       <Toast toasts={toasts} />
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import API from '@/service/api';
import { SearchIcon } from 'lucide-react';
import { toast } from 'react-toastify';

// ── API helpers ───────────────────────────────────────────────────────────────
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

const apiFeaturedList = (tab, search = '') =>
  API.get(`/admin/featured`, {
    params: { tab, ...(search ? { search } : {}) },
    headers: { Authorization: `Bearer ${getToken()}` },
  });

const apiFeaturedAvailable = (tab, search = '') =>
  API.get(`/admin/featured/available`, {
    params: { tab, ...(search ? { search } : {}) },
    headers: { Authorization: `Bearer ${getToken()}` },
  });

const apiFeaturedAdd = (listingId, listingType, tab) =>
  API.post(
    `/admin/featured`,
    { listingId, listingType, tab },
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );

const apiFeaturedUpdatePriority = (listingType, listingId, priorityRank) =>
  API.patch(
    `/admin/featured/${listingType}/${listingId}/priority`,
    { priorityRank },
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );

const apiFeaturedToggleStatus = (listingType, listingId) =>
  API.patch(
    `/admin/featured/${listingType}/${listingId}/status`,
    {},
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );

const apiFeaturedRemove = (listingType, listingId) =>
  API.delete(`/admin/featured/${listingType}/${listingId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

// ── Price helpers (mirrors ProductsOffers getBasePriceInfo) ───────────────────
const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const parsePrice = (raw) => {
  const n = parseInt(String(raw || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

const tierRentAmount = (tier) => {
  const n = (k) => {
    const v = Number(String(tier?.[k] ?? '').replace(/,/g, ''));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  return n('customerRent') || n('pricePerDay') || n('vendorRent') || 0;
};

const getBasePriceInfo = (product) => {
  if (product?.type === 'Rental') {
    const top = Array.isArray(product?.rentalConfigurations)
      ? product.rentalConfigurations
      : [];
    const topHasPrice = top.some(
      (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
    );
    let configs = top;
    if (!topHasPrice) {
      const variants = Array.isArray(product?.variants) ? product.variants : [];
      const fromVariants = variants.flatMap((v) =>
        Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
      );
      if (fromVariants.length) configs = fromVariants;
    }
    const usable = configs.filter(
      (c) => Number(c?.customerRent || c?.pricePerDay || 0) > 0,
    );
    const tier = usable.sort((a, b) => {
      const lenA =
        a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
      const lenB =
        b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
      return lenA - lenB;
    })[0];
    if (tier) {
      const isDay = tier.periodUnit === 'day';
      const totalAmt = tierRentAmount(tier);
      const perUnit = isDay
        ? Math.round(totalAmt / (Number(tier.days) > 0 ? Number(tier.days) : 1))
        : Math.round(totalAmt);
      return { amount: perUnit, suffix: isDay ? '/d' : '/mo' };
    }
  }
  //   const basePrice = parsePrice(product?.price);
  //   if (basePrice > 0) return { amount: basePrice, suffix: '' };
  //   const variants = Array.isArray(product?.variants) ? product.variants : [];
  //   const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
  //   if (firstWithPrice) {
  //     return { amount: parsePrice(firstWithPrice.sellPrice), suffix: '' };
  //   }
  //   return { amount: 0, suffix: '' };
  // };
  const basePrice = parsePrice(
    product?.price ??
      product?.sellPrice ??
      product?.basePrice ??
      product?.rentPrice,
  );
  if (basePrice > 0) return { amount: basePrice, suffix: '' };
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const firstWithPrice = variants.find(
    (v) => Number(v?.sellPrice || v?.price || v?.basePrice) > 0,
  );
  if (firstWithPrice) {
    return {
      amount: parsePrice(
        firstWithPrice.sellPrice ??
          firstWithPrice.price ??
          firstWithPrice.basePrice,
      ),
      suffix: '',
    };
  }
  return { amount: 0, suffix: '' };
};

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Rent', value: 'monthly_rental', listingType: 'product' },
  { label: 'Buy', value: 'buying', listingType: 'product' },
  {
    label: 'Service',
    value: 'service_package',
    listingType: 'service',
  },
];

function getListingType(tabValue) {
  return TABS.find((t) => t.value === tabValue)?.listingType ?? 'product';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white transition-all duration-300 ${
            t.type === 'error' ? 'bg-red-500' : 'bg-green-600'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  }, []);
  return { toasts, push };
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
        </td>
      ))}
    </tr>
  );
}

// ── Product image with fallback ───────────────────────────────────────────────
function ProductImage({ src, alt }) {
  const [err, setErr] = useState(false);
  return err || !src ? (
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <path d="M3 9l4-4 4 4 4-4 4 4" strokeWidth="1.5" />
      </svg>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
      loading="lazy"
    />
  );
}

// ── Badges ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isLive = status === 'live';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
        isLive
          ? 'bg-green-50 text-green-700 border border-green-100'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}
      />
      {isLive ? 'Active' : 'Inactive'}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className="inline-block text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
      {category || '—'}
    </span>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ enabled, onChange, loading }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      aria-label="Toggle feature status"
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#F97316] ${
        enabled ? 'bg-[#F97316]' : 'bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ── Action menu ───────────────────────────────────────────────────────────────
function ActionMenu({ onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="More actions"
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-30 w-36 py-1 text-sm">
          <button
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
            className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── Drag handle icon ──────────────────────────────────────────────────────────
function DragHandle({ listeners, attributes }) {
  return (
    <button
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition touch-none"
      aria-label="Drag to reorder"
      tabIndex={-1}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="15" cy="19" r="1.5" />
      </svg>
    </button>
  );
}

// ── Sortable table row ────────────────────────────────────────────────────────
function SortableRow({ item, activeTab, toggleLoading, onToggle, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-50 last:border-0 ${
        isDragging ? 'bg-orange-50/60 shadow-md' : 'hover:bg-gray-50/40'
      } transition`}
    >
      {/* Product ID */}
      {/* <td className="px-5 py-4 text-center">
        <span className="text-xs font-mono text-gray-400">
          {item._id?.slice(-6).toUpperCase()}
        </span>
      </td> */}
      <td className="px-5 py-4 text-center">
        <span className="inline-block text-sm font-semibold text-black  px-2.5 py-1 rounded-md">
          PRD-{item._id?.slice(-3).toUpperCase()}
        </span>
      </td>

      {/* Product Info */}
      <td className="px-5 py-4 text-center">
        <div className="flex items-center justify-start gap-3">
          <ProductImage src={item.image} alt={item.productName} />
          <div className="min-w-0 text-left">
            <p className="font-semibold text-gray-900 truncate max-w-[180px]">
              {item.productName}
            </p>
            {(() => {
              const { amount, suffix } = getBasePriceInfo(item);
              return amount > 0 ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  {rupee(amount)}
                  {suffix}
                </p>
              ) : null;
            })()}
          </div>
        </div>
      </td>

      {/* Vendor */}
      <td className="px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {/* <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" /> */}
          <span className="text-gray-700 font-medium whitespace-nowrap">
            {item.vendor?.name || item.vendorName || '—'}
          </span>
        </div>
      </td>
      {/* Priority Rank — drag handle + read-only rank number */}
      <td className="px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <DragHandle listeners={listeners} attributes={attributes} />
          <span className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-gray-50 select-none">
            {item.featured?.priorityRank}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="px-5 py-4 text-center">
        <CategoryBadge category={item.category} />
      </td>

      {/* Status */}
      <td className="px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <ToggleSwitch
            enabled={item.featured?.status === 'live'}
            onChange={() => onToggle(item)}
            loading={!!toggleLoading[item._id]}
          />
          <StatusBadge status={item.featured?.status} />
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-center">
        <ActionMenu onRemove={() => onRemove(item)} />
      </td>
    </tr>
  );
}

// ── Add to Featured Modal ─────────────────────────────────────────────────────
// function AddFeaturedModal({ activeTab, onClose, onAdded, toast }) {
//   const [modalTab, setModalTab] = useState(activeTab);
//   const [search, setSearch] = useState('');
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [adding, setAdding] = useState(false);
//   const searchTimerRef = useRef(null);
function AddFeaturedModal({ activeTab, onClose, onAdded }) {
  const [modalTab, setModalTab] = useState(activeTab);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All Products');
  const searchTimerRef = useRef(null);

  const categoryOptions = [
    'All Products',
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts =
    categoryFilter === 'All Products'
      ? products
      : products.filter((p) => p.category === categoryFilter);

  const fetchAvailable = useCallback(async (tab, q = '') => {
    setLoading(true);
    setSelected(null);
    try {
      const { data } = await apiFeaturedAvailable(tab, q);
      setProducts(data?.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailable(modalTab, '');
  }, [modalTab]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(
      () => fetchAvailable(modalTab, val),
      400,
    );
  };

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      await apiFeaturedAdd(selected._id, getListingType(modalTab), modalTab);
      toast.success('Added to featured successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      onAdded();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Promote to Featured
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Select a product or service to highlight on your platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="px-6 pt-4 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Select Category
          </p>
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setModalTab(t.value);
                  setSearch('');
                  setCategoryFilter('All Products');
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                  modalTab === t.value
                    ? 'bg-[#F97316] text-white border-[#F97316]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 flex gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by Product Name, ID, or Vendor..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Product list */}
        <div className="px-6 pt-4 overflow-y-auto flex-1 min-h-0">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Select Product ({filteredProducts.length} available)
          </p>
          {loading ? (
            <div className="space-y-3 pb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center text-center py-10">
              <svg
                className="w-10 h-10 mb-2 text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-sm text-gray-400">
                No products available to feature
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 pb-4">
              {filteredProducts.map((p) => (
                <label
                  key={p._id}
                  className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition ${
                    selected?._id === p._id
                      ? 'border-[#F97316] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="modal-product"
                    value={p._id}
                    checked={selected?._id === p._id}
                    onChange={() => setSelected(p)}
                    className="accent-[#F97316]"
                  />
                  <ProductImage src={p.image} alt={p.productName} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {p.productName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.vendor?.name || '—'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#F97316] whitespace-nowrap">
                    {(() => {
                      const { amount, suffix } = getBasePriceInfo(p);
                      return amount > 0 ? `${rupee(amount)}${suffix}` : '—';
                    })()}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selected || adding}
            className="px-5 py-2 rounded-xl bg-[#F97316] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {adding ? 'Adding...' : 'Add to Featured'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          Remove from Featured?
        </h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FeaturedProductsPage() {
  const [activeTab, setActiveTab] = useState('monthly_rental');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({});
  const [confirmRemove, setConfirmRemove] = useState(null);
  const searchTimerRef = useRef(null);
  // const { toasts, push: toast } = useToast();

  // dnd-kit sensors — only start drag after 8px movement (prevents accidental drags)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchListings = useCallback(async (tab, q = '') => {
    setLoading(true);
    try {
      const { data } = await apiFeaturedList(tab, q);
      setListings(data?.data || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(activeTab, '');
  }, [activeTab]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearchQuery(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(
      () => fetchListings(activeTab, val),
      400,
    );
  };

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const handleToggle = async (item) => {
    setToggleLoading((p) => ({ ...p, [item._id]: true }));
    try {
      const { data } = await apiFeaturedToggleStatus(
        getListingType(activeTab),
        item._id,
      );
      setListings((prev) =>
        prev.map((i) =>
          i._id === item._id
            ? { ...i, featured: { ...i.featured, ...data?.data?.featured } }
            : i,
        ),
      );
      toast.success('Status updated successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } catch {
      toast.error('Failed to update status', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setToggleLoading((p) => ({ ...p, [item._id]: false }));
    }
  };

  // ── Remove ─────────────────────────────────────────────────────────────────
  const handleRemove = async () => {
    if (!confirmRemove) return;
    const { id, type, name } = confirmRemove;
    setConfirmRemove(null);
    try {
      await apiFeaturedRemove(type, id);

      // Remove locally, then re-sequence priorityRank so no gaps remain
      const remaining = listings.filter((i) => i._id !== id);
      const resequenced = remaining.map((item, idx) => ({
        ...item,
        featured: { ...item.featured, priorityRank: idx + 1 },
      }));
      setListings(resequenced);

      // Persist only the items whose rank actually changed
      const changedItems = resequenced.filter(
        (item, idx) =>
          remaining[idx]?.featured?.priorityRank !== item.featured.priorityRank,
      );
      await Promise.allSettled(
        changedItems.map((item) =>
          apiFeaturedUpdatePriority(type, item._id, item.featured.priorityRank),
        ),
      );

      toast.success(`"${name}" removed from featured`, {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } catch {
      toast.error('Failed to remove listing', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    }
  };

  // ── Drag end — reorder locally then persist each updated rank ─────────────
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const listingType = getListingType(activeTab);
    const oldIndex = listings.findIndex((i) => i._id === active.id);
    const newIndex = listings.findIndex((i) => i._id === over.id);

    // 1. Optimistic reorder in UI
    const reordered = arrayMove(listings, oldIndex, newIndex);

    // 2. Reassign priorityRank = position index + 1
    const updated = reordered.map((item, idx) => ({
      ...item,
      featured: { ...item.featured, priorityRank: idx + 1 },
    }));
    setListings(updated);

    // 3. Persist only the items whose rank actually changed
    const changedItems = updated.filter(
      (item, idx) => listings[idx]?._id !== item._id,
    );

    await Promise.allSettled(
      changedItems.map((item) =>
        apiFeaturedUpdatePriority(
          listingType,
          item._id,
          item.featured.priorityRank,
        ),
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 pt-2 max-w-[1200px] mx-auto">
        {/* Page header */}
        {/* <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Featured Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage priority rankings and visibility of featured products and services
          </p>
        </div> */}

        {/* Tab bar */}
        {/* <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 mb-5 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setActiveTab(t.value);
                setSearchQuery('');
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                activeTab === t.value
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search featured products..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition shadow-sm"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add to Featured
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto"> */}
        {/* Unified card: tabs + toolbar + table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="p-1.5 flex gap-1 border-b border-gray-100">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setActiveTab(t.value);
                  setSearchQuery('');
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                  activeTab === t.value
                    ? 'bg-gray-50 text-gray-900 border border-gray-100'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search featured products..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition shadow-sm"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Add to Featured
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {[
                'Product ID',
                'Product Info',
                'Vendor',
                'Priority Rank',
                'Category',
                'Status',
                'Actions',
              ].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                    h === 'Product Info' ? 'text-left' : 'text-center'
                  }`}
                >
                  {h}
                </th>
              ))}

              {/* DndContext wraps only tbody */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={listings.map((i) => i._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))
                    ) : listings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <svg
                              className="w-12 h-12 text-gray-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">
                              No featured products yet
                            </p>
                            <p className="text-xs text-gray-400">
                              Click &quot;Add to Featured&quot; to promote a
                              product
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      listings.map((item) => (
                        <SortableRow
                          key={item._id}
                          item={item}
                          activeTab={activeTab}
                          toggleLoading={toggleLoading}
                          onToggle={handleToggle}
                          onRemove={(item) =>
                            setConfirmRemove({
                              id: item._id,
                              type: getListingType(activeTab),
                              name: item.productName,
                            })
                          }
                        />
                      ))
                    )}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <AddFeaturedModal
          activeTab={activeTab}
          onClose={() => setShowModal(false)}
          onAdded={() => fetchListings(activeTab, searchQuery)}
        />
      )}

      {confirmRemove && (
        <ConfirmDialog
          message={`Remove "${confirmRemove.name}" from featured listings? This action cannot be undone.`}
          onConfirm={handleRemove}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {/* <Toast toasts={toasts} /> */}
    </div>
  );
}
