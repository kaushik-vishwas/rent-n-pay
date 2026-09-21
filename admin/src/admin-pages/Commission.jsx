// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import {
//   RefreshCcw,
//   ShoppingBag,
//   Wrench,
//   Package,
//   ChevronDown,
//   ChevronRight,
//   Search,
//   Tag,
//   Box,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { apiGetMasterCategories } from '@/service/api';

// const TABS = [
//   { id: 'rentals', label: 'Rentals', platform: 'rent', icon: RefreshCcw },
//   { id: 'selling', label: 'Sales', platform: 'buy', icon: ShoppingBag },
//   { id: 'services', label: 'Services', platform: 'services', icon: Wrench },
// ];

// export default function Commission() {
//   const [activeTab, setActiveTab] = useState('rentals');
//   const [tree, setTree] = useState([]);
//   const [stats, setStats] = useState({ totalMain: 0, totalSubs: 0 });
//   const [loading, setLoading] = useState(true);
//   const [expanded, setExpanded] = useState(() => new Set());
//   const [search, setSearch] = useState('');
//   const [globalTax, setGlobalTax] = useState(null);
//   const [activeToggles, setActiveToggles] = useState({});

//   const toggleActive = async (id, type, currentBlocked) => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     const newBlocked = !currentBlocked;
//     // optimistic update
//     setActiveToggles((prev) => ({ ...prev, [id]: !newBlocked }));
//     try {
//       const { apiToggleCategoryStatus } = await import('@/service/api');
//       await apiToggleCategoryStatus(id, type, newBlocked, token);
//       loadTree();
//     } catch (e) {
//       // revert on error
//       setActiveToggles((prev) => ({ ...prev, [id]: currentBlocked }));
//       toast.error('Failed to update status');
//     }
//   };

//   const isActive = (item) => {
//     if (activeToggles[item._id] !== undefined) return activeToggles[item._id];
//     return !item.taxBlocked;
//   };

//   const [editValues, setEditValues] = useState({});
//   const [savingRow, setSavingRow] = useState({});

//   const TAX_KEYS = [
//     { key: 'defaultGst', label: 'GST' },
//     { key: 'defaultCareTax', label: 'Care Tax' },
//     { key: 'defaultRepairWarranty', label: 'Repair & Warranty' },
//     { key: 'defaultRelocationWarranty', label: 'Relocation Warranty' },
//     { key: 'defaultDeliveryPackaging', label: 'Delivery & Packaging' },
//     { key: 'defaultInstallationFee', label: 'Installation Fee' },
//     { key: 'defaultPlatformFee', label: 'Platform Fee' },
//   ];

//   const getEditVal = (id, key, fallback) => {
//     return editValues[id]?.[key] !== undefined
//       ? editValues[id][key]
//       : (fallback ?? 0);
//   };

//   const handleEditChange = (id, key, value) => {
//     setEditValues((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], [key]: value },
//     }));
//   };

//   const handleSaveRow = async (id, type, currentData) => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     const changes = editValues[id] || {};
//     if (!Object.keys(changes).length) {
//       toast.info('No changes to save');
//       return;
//     }
//     const payload = {};
//     TAX_KEYS.forEach(({ key }) => {
//       payload[key] =
//         changes[key] !== undefined
//           ? Number(changes[key])
//           : Number(currentData[key] ?? 0);
//     });
//     setSavingRow((prev) => ({ ...prev, [id]: true }));
//     try {
//       const { apiUpdateCategoryTax } = await import('@/service/api');
//       await apiUpdateCategoryTax(
//         id,
//         type === 'subcategory' ? 'subcategory' : 'category',
//         payload,
//         token,
//       );
//       toast.success('Saved successfully!');
//       setEditValues((prev) => {
//         const next = { ...prev };
//         delete next[id];
//         return next;
//       });
//       loadTree();
//     } catch (e) {
//       toast.error(e?.response?.data?.message || 'Failed to save');
//     } finally {
//       setSavingRow((prev) => ({ ...prev, [id]: false }));
//     }
//   };

//   const platformParam =
//     TABS.find((t) => t.id === activeTab)?.platform || 'rent';

//   const loadTree = useCallback(async () => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) return;
//     setLoading(true);
//     try {
//       const res = await apiGetMasterCategories(token, platformParam);
//       const nextTree = res.data?.tree || [];
//       setTree(nextTree);
//       setStats(res.data?.stats || { totalMain: 0, totalSubs: 0 });
//       setExpanded(() => {
//         const next = new Set();
//         nextTree.forEach((c) => next.add(c._id));
//         return next;
//       });
//     } catch (e) {
//       toast.error(e.response?.data?.message || 'Failed to load categories');
//       setTree([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [platformParam]);

//   useEffect(() => {
//     loadTree();
//   }, [loadTree]);

//   useEffect(() => {
//     const fetchGlobalTax = async () => {
//       try {
//         const token =
//           typeof window !== 'undefined'
//             ? localStorage.getItem('adminToken')
//             : null;
//         const { apiGetGlobalTax } = await import('@/service/api');
//         const res = await apiGetGlobalTax(token);
//         setGlobalTax(res.data?.data?.config || null);
//       } catch (e) {
//         console.error('Failed to load global tax', e);
//       }
//     };
//     if (activeTab === 'selling') fetchGlobalTax();
//   }, [activeTab]);

//   const toggleExpand = (id) => {
//     setExpanded((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   const filteredTree = tree.filter(
//     (cat) =>
//       cat.name.toLowerCase().includes(search.toLowerCase()) ||
//       (cat.subCategories || []).some((s) =>
//         s.name.toLowerCase().includes(search.toLowerCase()),
//       ),
//   );

//   const tabLabel = TABS.find((t) => t.id === activeTab)?.label || '';

//   return (
//     <div className="p-4 md:p-6 pt-0 bg-slate-50 min-h-screen">
//       {/* Header */}
//       {/* <div className="mb-6">
//         <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
//           Master Category: Commission & GST Setup
//         </h1>

//         <p className="text-slate-500 mt-2">
//           Configure platform commission rates and GST for each tenure slot
//         </p>
//       </div> */}

//       {/* Tabs */}
//       {/* <div className="bg-white border rounded-2xl p-2 flex flex-wrap gap-2 mb-6">
//         {TABS.map((tab) => {
//           const Icon = tab.icon;
//           const active = activeTab === tab.id;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-5 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors ${
//                 active
//                   ? 'bg-blue-50 border border-blue-500 text-blue-600'
//                   : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
//               }`}
//             >
//               <Icon size={18} />
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>

//       <div className="mb-6">
//         <div className="relative">
//           <Search
//             size={18}
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//           />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search category or sub-category..."
//             className="w-full border rounded-xl py-3 pl-11 pr-4"
//           />
//         </div>
//       </div> */}

//       {/* Tabs + Search */}
//       <div className="bg-white border border-b-0 rounded-t-3xl p-2 flex flex-col lg:flex-row gap-2">
//         <div className="flex flex-wrap gap-2">
//           {TABS.map((tab) => {
//             const Icon = tab.icon;
//             const active = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`px-5 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors ${
//                   active
//                     ? 'bg-blue-50 border border-blue-500 text-blue-600'
//                     : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
//                 }`}
//               >
//                 <Icon size={18} />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>
//         <div className="relative flex-1 lg:ml-2">
//           <Search
//             size={18}
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//           />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search category or sub-category..."
//             className="w-full h-full border rounded-xl py-3 pl-11 pr-4"
//           />
//         </div>
//       </div>

//       {/* Table Card */}
//       <div className="bg-white border border-t-0 rounded-b-3xl rounded-t-none overflow-hidden">
//         {/* Top */}
//         <div className="p-6 border-b flex flex-col lg:flex-row justify-between gap-4">
//           <div>
//             <h2 className="text-2xl font-bold">{tabLabel} Charges Structure</h2>
//             <p className="text-slate-500 mt-2">
//               Manage category-level and sub-category overrides for services
//               business model
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm">
//               {stats.totalMain} Categories
//             </span>
//             <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm">
//               {stats.totalSubs} Sub-Categories
//             </span>
//           </div>
//         </div>

//         {/* {activeTab === 'selling' && (
//           <div className="mx-6 mt-6 mb-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row gap-4">

//             <div>
//               <p className="font-semibold text-blue-700 mb-2">
//                 Sales tax rates are managed globally — not per category
//               </p>

//               <div className="flex flex-wrap gap-4">
//                 <div className="bg-white border border-green-200 rounded-xl px-4 py-3 space-y-1">
//                   <p className="text-xs text-slate-500 mb-1 font-semibold">
//                     Buying (New)
//                   </p>
//                   <p className="text-sm text-green-700">
//                     GST: <b>{globalTax?.buying_new?.gst ?? '—'}%</b> | Care Tax:{' '}
//                     <b>{globalTax?.buying_new?.careTax ?? '—'}%</b>
//                   </p>
//                   <p className="text-sm text-green-700">
//                     Repair & Warranty:{' '}
//                     <b>{globalTax?.buying_new?.repairWarranty ?? '—'}%</b> |
//                     Relocation Warranty:{' '}
//                     <b>{globalTax?.buying_new?.relocationWarranty ?? '—'}%</b>
//                   </p>
//                   <p className="text-sm text-green-700">
//                     Delivery & Packaging:{' '}
//                     <b>{globalTax?.buying_new?.deliveryPackaging ?? '—'}%</b> |
//                     Installation Fee:{' '}
//                     <b>{globalTax?.buying_new?.installationFee ?? '—'}%</b> |
//                     Platform Fee:{' '}
//                     <b>{globalTax?.buying_new?.platformFee ?? '—'}%</b>
//                   </p>
//                 </div>
//                 <div className="bg-white border border-purple-200 rounded-xl px-4 py-3 space-y-1">
//                   <p className="text-xs text-slate-500 mb-1 font-semibold">
//                     Buying (Refurbished)
//                   </p>
//                   <p className="text-sm text-purple-700">
//                     GST: <b>{globalTax?.buying_refurbished?.gst ?? '—'}%</b> |
//                     Care Tax:{' '}
//                     <b>{globalTax?.buying_refurbished?.careTax ?? '—'}%</b>
//                   </p>
//                   <p className="text-sm text-purple-700">
//                     Repair & Warranty:{' '}
//                     <b>
//                       {globalTax?.buying_refurbished?.repairWarranty ?? '—'}%
//                     </b>{' '}
//                     | Relocation Warranty:{' '}
//                     <b>
//                       {globalTax?.buying_refurbished?.relocationWarranty ?? '—'}
//                       %
//                     </b>
//                   </p>
//                   <p className="text-sm text-purple-700">
//                     Delivery & Packaging:{' '}
//                     <b>
//                       {globalTax?.buying_refurbished?.deliveryPackaging ?? '—'}%
//                     </b>{' '}
//                     | Installation Fee:{' '}
//                     <b>
//                       {globalTax?.buying_refurbished?.installationFee ?? '—'}%
//                     </b>{' '}
//                     | Platform Fee:{' '}
//                     <b>{globalTax?.buying_refurbished?.platformFee ?? '—'}%</b>
//                   </p>
//                 </div>
//               </div>
//               <p className="text-xs text-slate-500 mt-2">
//                 These rates apply at cart/order time based on product condition
//                 (new or refurbished)
//               </p>
//             </div>
//           </div>
//         )} */}
//         {/* Sales Tax Info Banner */}
//         {activeTab === 'selling' && (
//           <div className="mx-6 mt-6 mb-2">
//             <p className="font-semibold text-blue-700 mb-3">
//               Sales tax rates are managed globally — not per category
//             </p>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               {/* Buying (New) */}
//               <div className="rounded-2xl border border-green-200 bg-white overflow-hidden">
//                 <div className="flex items-center gap-2 bg-green-50 px-4 py-3 border-b border-green-100">
//                   <div className="bg-green-100 p-2 rounded-lg">
//                     <Tag size={16} className="text-green-600" />
//                   </div>
//                   <p className="text-sm font-semibold text-green-700">
//                     Buying (New)
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       GST
//                     </p>
//                     <p className="text-base font-bold text-green-700">
//                       {globalTax?.buying_new?.gst ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Care Tax
//                     </p>
//                     <p className="text-base font-bold text-green-700">
//                       {globalTax?.buying_new?.careTax ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Repair
//                     </p>
//                     <p className="text-base font-bold text-green-700">
//                       {globalTax?.buying_new?.repairWarranty ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Relocation
//                     </p>
//                     <p className="text-base font-bold text-green-700">
//                       {globalTax?.buying_new?.relocationWarranty ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Delivery
//                     </p>
//                     <p className="text-base font-bold text-green-700">
//                       {globalTax?.buying_new?.deliveryPackaging ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Install
//                     </p>
//                     <p className="text-base font-bold text-green-700">
//                       {globalTax?.buying_new?.installationFee ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Platform
//                     </p>
//                     <p className="text-base font-bold text-green-700">
//                       {globalTax?.buying_new?.platformFee ?? '—'}%
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Buying (Refurbished) */}
//               <div className="rounded-2xl border border-purple-200 bg-white overflow-hidden">
//                 <div className="flex items-center gap-2 bg-purple-50 px-4 py-3 border-b border-purple-100">
//                   <div className="bg-purple-100 p-2 rounded-lg">
//                     <Tag size={16} className="text-purple-600" />
//                   </div>
//                   <p className="text-sm font-semibold text-purple-700">
//                     Buying (Refurbished)
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       GST
//                     </p>
//                     <p className="text-base font-bold text-purple-700">
//                       {globalTax?.buying_refurbished?.gst ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Care Tax
//                     </p>
//                     <p className="text-base font-bold text-purple-700">
//                       {globalTax?.buying_refurbished?.careTax ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Repair
//                     </p>
//                     <p className="text-base font-bold text-purple-700">
//                       {globalTax?.buying_refurbished?.repairWarranty ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Relocation
//                     </p>
//                     <p className="text-base font-bold text-purple-700">
//                       {globalTax?.buying_refurbished?.relocationWarranty ?? '—'}
//                       %
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Delivery
//                     </p>
//                     <p className="text-base font-bold text-purple-700">
//                       {globalTax?.buying_refurbished?.deliveryPackaging ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Install
//                     </p>
//                     <p className="text-base font-bold text-purple-700">
//                       {globalTax?.buying_refurbished?.installationFee ?? '—'}%
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[11px] uppercase tracking-wide text-slate-400">
//                       Platform
//                     </p>
//                     <p className="text-base font-bold text-purple-700">
//                       {globalTax?.buying_refurbished?.platformFee ?? '—'}%
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <p className="text-xs text-slate-500 mt-3">
//               These rates apply at cart/order time based on product condition
//               (new or refurbished)
//             </p>
//           </div>
//         )}
//         {/* Table (all screens) */}
//         <div className="block overflow-x-auto">
//           <table className="w-full min-w-[1000px]">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500 sticky left-0 bg-slate-50 z-10 min-w-[180px]">
//                   CATEGORY / SUB-CATEGORY
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500 min-w-[130px]">
//                   COMMISSION (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   GST (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   CARE TAX (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   REPAIR & WARRANTY (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   RELOCATION (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   DELIVERY (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   INSTALLATION (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   PLATFORM FEE (%)
//                 </th>
//                 <th className="text-left px-4 py-3 text-xs text-slate-500">
//                   STATUS
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={5} className="py-16 text-center">
//                     <div className="flex justify-center">
//                       <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredTree.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="py-12 text-center text-slate-400">
//                     No categories found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredTree.map((cat) => {
//                   const isOpen = expanded.has(cat._id);
//                   const subs = cat.subCategories || [];
//                   return (
//                     <>
//                       <tr key={cat._id} className="border-t">
//                         <td className="px-4 py-3 sticky left-0 bg-white z-10 min-w-[180px]">
//                           <button
//                             onClick={() => toggleExpand(cat._id)}
//                             className="flex items-center gap-3"
//                           >
//                             {subs.length > 0 ? (
//                               isOpen ? (
//                                 <ChevronDown size={18} />
//                               ) : (
//                                 <ChevronRight size={18} />
//                               )
//                             ) : (
//                               <span className="w-[18px]" />
//                             )}
//                             <div className="text-left">
//                               <p className="text-sm font-semibold">
//                                 {cat.name}
//                               </p>
//                               {subs.length > 0 && (
//                                 <p className="text-xs text-slate-500">
//                                   {subs.length} sub-categories
//                                 </p>
//                               )}
//                             </div>
//                           </button>
//                         </td>
//                         {/* <td className="p-5">10%</td>

//                         <td className="p-5">
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400 text-sm">—</span>
//                           ) : cat.defaultGst != null ? (
//                             `${cat.defaultGst}%`
//                           ) : (
//                             '—'
//                           )}
//                         </td> */}
//                         <td className="px-4 py-3 text-sm min-w-[130px]">
//                           <span className="font-medium">
//                             {cat.commissionRate != null
//                               ? `${cat.commissionRate}%`
//                               : '10%'}
//                           </span>
//                         </td>
//                         {/* {TAX_KEYS.map(({ key }) => (
//                           <td key={key} className="px-2 py-3">
//                             <div className="relative w-20">
//                               <input
//                                 type="number"
//                                 min={0}
//                                 value={getEditVal(cat._id, key, cat[key])}
//                                 onChange={(e) =>
//                                   handleEditChange(cat._id, key, e.target.value)
//                                 }
//                                 className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
//                               />
//                               <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
//                                 %
//                               </span>
//                             </div>
//                           </td>
//                         ))} */}
//                         {TAX_KEYS.map(({ key }) =>
//                           activeTab === 'selling' ? (
//                             <td key={key} className="px-2 py-3">
//                               <div className="w-20 text-center text-xs text-slate-400 bg-slate-50 border rounded-lg px-2 py-1.5">
//                                 0%
//                               </div>
//                             </td>
//                           ) : (
//                             <td key={key} className="px-2 py-3">
//                               <div className="relative w-20">
//                                 <input
//                                   type="number"
//                                   min={0}
//                                   value={getEditVal(cat._id, key, cat[key])}
//                                   onChange={(e) =>
//                                     handleEditChange(
//                                       cat._id,
//                                       key,
//                                       e.target.value,
//                                     )
//                                   }
//                                   className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
//                                 />
//                                 <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
//                                   %
//                                 </span>
//                               </div>
//                             </td>
//                           ),
//                         )}
//                         <td className="px-4 py-3">
//                           <div className="flex flex-col gap-2 items-start">
//                             <button
//                               onClick={() =>
//                                 toggleActive(
//                                   cat._id,
//                                   'category',
//                                   cat.taxBlocked,
//                                 )
//                               }
//                               className={`w-10 h-6 rounded-full relative transition-colors ${isActive(cat) ? 'bg-green-500' : 'bg-slate-300'}`}
//                             >
//                               <div
//                                 className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(cat) ? 'right-1' : 'left-1'}`}
//                               />
//                             </button>
//                             <button
//                               onClick={() =>
//                                 handleSaveRow(cat._id, 'category', cat)
//                               }
//                               disabled={!!savingRow[cat._id]}
//                               className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
//                             >
//                               {savingRow[cat._id] ? '...' : 'Apply'}
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                       {isOpen &&
//                         subs.map((sub) => (
//                           <tr key={sub._id} className="border-t bg-slate-50">
//                             <td className="px-4 py-3 sticky left-0 bg-slate-50 z-10 min-w-[180px]">
//                               <span className="pl-10 block text-sm text-slate-600">
//                                 {sub.name}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-sm">
//                               <span className="font-medium">
//                                 {sub.commissionRate != null
//                                   ? `${sub.commissionRate}%`
//                                   : '10%'}
//                               </span>
//                             </td>
//                             {/* <td className="px-4 py-3 text-sm">
//                               {activeTab === 'selling' ? (
//                                 <span className="text-slate-400 text-xs">
//                                   —
//                                 </span>
//                               ) : sub.defaultGst != null ? (
//                                 `${sub.defaultGst}%`
//                               ) : (
//                                 '—'
//                               )}
//                             </td> */}
//                             {/* <td className="px-4 py-3 text-sm">
//                               {activeTab === 'selling' ? (
//                                 <span className="text-slate-400 text-xs">
//                                   —
//                                 </span>
//                               ) : sub.defaultCareTax != null ? (
//                                 `${sub.defaultCareTax}%`
//                               ) : (
//                                 '—'
//                               )}
//                             </td> */}
//                             {/* {TAX_KEYS.map(({ key }) => (
//                               <td key={key} className="px-2 py-3">
//                                 <div className="relative w-20">
//                                   <input
//                                     type="number"
//                                     min={0}
//                                     value={getEditVal(sub._id, key, sub[key])}
//                                     onChange={(e) =>
//                                       handleEditChange(
//                                         sub._id,
//                                         key,
//                                         e.target.value,
//                                       )
//                                     }
//                                     className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
//                                   />
//                                   <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
//                                     %
//                                   </span>
//                                 </div>
//                               </td>
//                             ))} */}
//                             {TAX_KEYS.map(({ key }) =>
//                               activeTab === 'selling' ? (
//                                 <td key={key} className="px-2 py-3">
//                                   <div className="w-20 text-center text-xs text-slate-400 bg-slate-50 border rounded-lg px-2 py-1.5">
//                                     0%
//                                   </div>
//                                 </td>
//                               ) : (
//                                 <td key={key} className="px-2 py-3">
//                                   <div className="relative w-20">
//                                     <input
//                                       type="number"
//                                       min={0}
//                                       value={getEditVal(sub._id, key, sub[key])}
//                                       onChange={(e) =>
//                                         handleEditChange(
//                                           sub._id,
//                                           key,
//                                           e.target.value,
//                                         )
//                                       }
//                                       className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
//                                     />
//                                     <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
//                                       %
//                                     </span>
//                                   </div>
//                                 </td>
//                               ),
//                             )}
//                             {/* <td className="px-4 py-3">
//                               <div className="flex flex-col gap-2 items-start">
//                                 <button
//                                   onClick={() =>
//                                     toggleActive(
//                                       sub._id,
//                                       'subcategory',
//                                       sub.taxBlocked,
//                                     )
//                                   }
//                                   className={`mt-1 w-10 h-6 rounded-full relative transition-colors ${isActive(sub) ? 'bg-green-500' : 'bg-slate-300'}`}
//                                 >
//                                   <div
//                                     className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(sub) ? 'right-1' : 'left-1'}`}
//                                   />
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleSaveRow(sub._id, 'subcategory', sub)
//                                   }
//                                   disabled={!!savingRow[sub._id]}
//                                   className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
//                                 >
//                                   {savingRow[sub._id] ? '...' : 'Apply'}
//                                 </button>
//                               </div>
//                             </td> */}
//                             <td className="px-4 py-3">
//                               <div className="flex flex-col gap-2 items-start">
//                                 <button
//                                   onClick={() =>
//                                     toggleActive(
//                                       sub._id,
//                                       'subcategory',
//                                       sub.taxBlocked,
//                                     )
//                                   }
//                                   className={`w-10 h-6 rounded-full relative transition-colors ${isActive(sub) ? 'bg-green-500' : 'bg-slate-300'}`}
//                                 >
//                                   <div
//                                     className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(sub) ? 'right-1' : 'left-1'}`}
//                                   />
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleSaveRow(sub._id, 'subcategory', sub)
//                                   }
//                                   disabled={!!savingRow[sub._id]}
//                                   className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
//                                 >
//                                   {savingRow[sub._id] ? '...' : 'Apply'}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                     </>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile Cards (disabled — table used on all screens now) */}
//         <div className="hidden p-4 space-y-4">
//           {loading ? (
//             <div className="flex justify-center py-10">
//               <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           ) : (
//             filteredTree.map((cat) => (
//               <div key={cat._id}>
//                 <div className="border rounded-2xl p-4 bg-white">
//                   <div className="flex items-center gap-3 mb-1">
//                     {cat.icon ? (
//                       <img
//                         src={cat.icon}
//                         alt={cat.name}
//                         className="h-10 w-10 rounded-xl object-cover border border-gray-200 shrink-0"
//                       />
//                     ) : cat.image ? (
//                       <img
//                         src={cat.image}
//                         alt={cat.name}
//                         className="h-10 w-10 rounded-xl object-cover border border-gray-200 shrink-0"
//                       />
//                     ) : (
//                       <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
//                         <Package size={18} className="text-slate-400" />
//                       </div>
//                     )}
//                     <h3 className="font-semibold text-lg">{cat.name}</h3>
//                   </div>
//                   {/* <div className="grid grid-cols-2 gap-3 mt-4">
//                     <div>
//                       <p className="text-xs text-slate-500">Commission</p>
//                       <p>10%</p>
//                     </div> */}
//                   <div className="grid grid-cols-2 gap-3 mt-4">
//                     <div>
//                       <p className="text-xs text-slate-500">Commission</p>
//                       <p>
//                         {cat.commissionRate != null
//                           ? `${cat.commissionRate}%`
//                           : '10%'}
//                       </p>
//                     </div>
//                     {/* <div>
//                       <p className="text-xs text-slate-500">GST</p>
//                       <p>
//                         {cat.defaultGst != null ? `${cat.defaultGst}%` : '—'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Care Tax</p>
//                       <p>
//                         {cat.defaultCareTax != null
//                           ? `${cat.defaultCareTax}%`
//                           : '—'}
//                       </p>
//                     </div> */}
//                     <div>
//                       <p className="text-xs text-slate-500">GST</p>
//                       <p>
//                         {activeTab === 'selling' ? (
//                           <span className="text-slate-400">—</span>
//                         ) : cat.defaultGst != null ? (
//                           `${cat.defaultGst}%`
//                         ) : (
//                           '—'
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Care Tax</p>
//                       <p>
//                         {activeTab === 'selling' ? (
//                           <span className="text-slate-400">—</span>
//                         ) : cat.defaultCareTax != null ? (
//                           `${cat.defaultCareTax}%`
//                         ) : (
//                           '—'
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">
//                         Repair & Warranty
//                       </p>
//                       <p>
//                         {activeTab === 'selling' ? (
//                           <span className="text-slate-400">—</span>
//                         ) : cat.defaultRepairWarranty != null ? (
//                           `${cat.defaultRepairWarranty}%`
//                         ) : (
//                           '—'
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">
//                         Relocation Warranty
//                       </p>
//                       <p>
//                         {activeTab === 'selling' ? (
//                           <span className="text-slate-400">—</span>
//                         ) : cat.defaultRelocationWarranty != null ? (
//                           `${cat.defaultRelocationWarranty}%`
//                         ) : (
//                           '—'
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">
//                         Delivery & Packaging
//                       </p>
//                       <p>
//                         {activeTab === 'selling' ? (
//                           <span className="text-slate-400">—</span>
//                         ) : cat.defaultDeliveryPackaging != null ? (
//                           `${cat.defaultDeliveryPackaging}%`
//                         ) : (
//                           '—'
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Installation Fee</p>
//                       <p>
//                         {activeTab === 'selling' ? (
//                           <span className="text-slate-400">—</span>
//                         ) : cat.defaultInstallationFee != null ? (
//                           `${cat.defaultInstallationFee}%`
//                         ) : (
//                           '—'
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Platform Fee</p>
//                       <p>
//                         {activeTab === 'selling' ? (
//                           <span className="text-slate-400">—</span>
//                         ) : cat.defaultPlatformFee != null ? (
//                           `${cat.defaultPlatformFee}%`
//                         ) : (
//                           '—'
//                         )}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Status</p>
//                       <button
//                         onClick={() =>
//                           toggleActive(cat._id, 'category', cat.taxBlocked)
//                         }
//                         className={`mt-1 w-10 h-6 rounded-full relative transition-colors ${isActive(cat) ? 'bg-green-500' : 'bg-slate-300'}`}
//                       >
//                         <div
//                           className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(cat) ? 'right-1' : 'left-1'}`}
//                         />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//                 {(cat.subCategories || []).map((sub) => (
//                   <div
//                     key={sub._id}
//                     className="border rounded-2xl p-4 ml-4 mt-2 bg-slate-50"
//                   >
//                     <h3 className="font-medium text-base">{sub.name}</h3>
//                     <div className="grid grid-cols-2 gap-3 mt-3">
//                       {/* <div>
//                         <p className="text-xs text-slate-500">Commission</p>
//                         <p>10%</p>
//                       </div> */}
//                       <div>
//                         <p className="text-xs text-slate-500">Commission</p>
//                         <p>
//                           {sub.commissionRate != null
//                             ? `${sub.commissionRate}%`
//                             : '10%'}
//                         </p>
//                       </div>
//                       {/* <div>
//                         <p className="text-xs text-slate-500">GST</p>
//                         <p>
//                           {sub.defaultGst != null ? `${sub.defaultGst}%` : '—'}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">Care Tax</p>
//                         <p>
//                           {sub.defaultCareTax != null
//                             ? `${sub.defaultCareTax}%`
//                             : '—'}
//                         </p>
//                       </div> */}
//                       <div>
//                         <p className="text-xs text-slate-500">GST</p>
//                         <p>
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400">—</span>
//                           ) : sub.defaultGst != null ? (
//                             `${sub.defaultGst}%`
//                           ) : (
//                             '—'
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">Care Tax</p>
//                         <p>
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400">—</span>
//                           ) : sub.defaultCareTax != null ? (
//                             `${sub.defaultCareTax}%`
//                           ) : (
//                             '—'
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">
//                           Repair & Warranty
//                         </p>
//                         <p>
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400">—</span>
//                           ) : sub.defaultRepairWarranty != null ? (
//                             `${sub.defaultRepairWarranty}%`
//                           ) : (
//                             '—'
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">
//                           Relocation Warranty
//                         </p>
//                         <p>
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400">—</span>
//                           ) : sub.defaultRelocationWarranty != null ? (
//                             `${sub.defaultRelocationWarranty}%`
//                           ) : (
//                             '—'
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">
//                           Delivery & Packaging
//                         </p>
//                         <p>
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400">—</span>
//                           ) : sub.defaultDeliveryPackaging != null ? (
//                             `${sub.defaultDeliveryPackaging}%`
//                           ) : (
//                             '—'
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">
//                           Installation Fee
//                         </p>
//                         <p>
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400">—</span>
//                           ) : sub.defaultInstallationFee != null ? (
//                             `${sub.defaultInstallationFee}%`
//                           ) : (
//                             '—'
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">Platform Fee</p>
//                         <p>
//                           {activeTab === 'selling' ? (
//                             <span className="text-slate-400">—</span>
//                           ) : sub.defaultPlatformFee != null ? (
//                             `${sub.defaultPlatformFee}%`
//                           ) : (
//                             '—'
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500">Status</p>
//                         <button
//                           onClick={() =>
//                             toggleActive(sub._id, 'subcategory', sub.taxBlocked)
//                           }
//                           className={`w-10 h-6 rounded-full relative transition-colors ${isActive(sub) ? 'bg-green-500' : 'bg-slate-300'}`}
//                         >
//                           <div
//                             className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(sub) ? 'right-1' : 'left-1'}`}
//                           />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCcw,
  ShoppingBag,
  Wrench,
  Package,
  ChevronDown,
  ChevronRight,
  Search,
  Tag,
  Box,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiGetMasterCategories } from '@/service/api';

const TABS = [
  { id: 'rentals', label: 'Rent', platform: 'rent', icon: RefreshCcw },
  { id: 'selling', label: 'Buy', platform: 'buy', icon: ShoppingBag },
  { id: 'services', label: 'Services', platform: 'services', icon: Wrench },
];

export default function Commission() {
  const [activeTab, setActiveTab] = useState('rentals');
  const [tree, setTree] = useState([]);
  const [stats, setStats] = useState({ totalMain: 0, totalSubs: 0 });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const [globalTax, setGlobalTax] = useState(null);
  const [activeToggles, setActiveToggles] = useState({});

  const toggleActive = async (id, type, currentBlocked) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const newBlocked = !currentBlocked;
    // optimistic update
    setActiveToggles((prev) => ({ ...prev, [id]: !newBlocked }));
    try {
      const { apiToggleCategoryStatus } = await import('@/service/api');
      await apiToggleCategoryStatus(id, type, newBlocked, token);
      loadTree();
    } catch (e) {
      // revert on error
      setActiveToggles((prev) => ({ ...prev, [id]: currentBlocked }));
      toast.error('Failed to update status');
    }
  };

  const isActive = (item) => {
    if (activeToggles[item._id] !== undefined) return activeToggles[item._id];
    return !item.taxBlocked;
  };

  const [editValues, setEditValues] = useState({});
  const [savingRow, setSavingRow] = useState({});

  const TAX_KEYS = [
    { key: 'defaultGst', label: 'GST' },
    { key: 'defaultCareTax', label: 'Care Tax' },
    { key: 'defaultRepairWarranty', label: 'Repair & Warranty' },
    { key: 'defaultRelocationWarranty', label: 'Relocation Warranty' },
    { key: 'defaultDeliveryPackaging', label: 'Delivery & Packaging' },
    { key: 'defaultInstallationFee', label: 'Installation Fee' },
    { key: 'defaultPlatformFee', label: 'Platform Fee' },
  ];

  const getEditVal = (id, key, fallback) => {
    return editValues[id]?.[key] !== undefined
      ? editValues[id][key]
      : (fallback ?? 0);
  };

  const handleEditChange = (id, key, value) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  };

  const handleSaveRow = async (id, type, currentData) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const changes = editValues[id] || {};
    if (!Object.keys(changes).length) {
      toast.info('No changes to save');
      return;
    }
    const payload = {};
    TAX_KEYS.forEach(({ key }) => {
      payload[key] =
        changes[key] !== undefined
          ? Number(changes[key])
          : Number(currentData[key] ?? 0);
    });
    setSavingRow((prev) => ({ ...prev, [id]: true }));
    try {
      const { apiUpdateCategoryTax } = await import('@/service/api');
      await apiUpdateCategoryTax(
        id,
        type === 'subcategory' ? 'subcategory' : 'category',
        payload,
        token,
      );
      toast.success('Saved successfully!');
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      loadTree();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSavingRow((prev) => ({ ...prev, [id]: false }));
    }
  };

  const platformParam =
    TABS.find((t) => t.id === activeTab)?.platform || 'rent';

  const loadTree = useCallback(async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiGetMasterCategories(token, platformParam);
      const nextTree = res.data?.tree || [];
      setTree(nextTree);
      setStats(res.data?.stats || { totalMain: 0, totalSubs: 0 });
      setExpanded(() => {
        const next = new Set();
        nextTree.forEach((c) => next.add(c._id));
        return next;
      });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load categories');
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, [platformParam]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    const fetchGlobalTax = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('adminToken')
            : null;
        const { apiGetGlobalTax } = await import('@/service/api');
        const res = await apiGetGlobalTax(token);
        setGlobalTax(res.data?.data?.config || null);
      } catch (e) {
        console.error('Failed to load global tax', e);
      }
    };
    if (activeTab === 'selling') fetchGlobalTax();
  }, [activeTab]);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTree = tree.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.subCategories || []).some((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const tabLabel = TABS.find((t) => t.id === activeTab)?.label || '';

  return (
    <div className="p-4 md:p-6 pt-0 bg-slate-50 min-h-screen">
      {/* Header */}
      {/* <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Master Category: Commission & GST Setup
        </h1>

        <p className="text-slate-500 mt-2">
          Configure platform commission rates and GST for each tenure slot
        </p>
      </div> */}

      {/* Tabs */}
      {/* <div className="bg-white border rounded-2xl p-2 flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors ${
                active
                  ? 'bg-blue-50 border border-blue-500 text-blue-600'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category or sub-category..."
            className="w-full border rounded-xl py-3 pl-11 pr-4"
          />
        </div>
      </div> */}

      {/* Tabs + Search */}
      <div className="bg-white border border-b-0 rounded-t-3xl p-2 flex flex-col lg:flex-row gap-2">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl flex items-center gap-2 font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 border border-blue-500 text-blue-600'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 lg:ml-2">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category or sub-category..."
            className="w-full h-full border rounded-xl py-3 pl-11 pr-4"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-t-0 rounded-b-3xl rounded-t-none overflow-hidden">
        {/* Top */}
        <div className="p-6 border-b flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{tabLabel} Charges Structure</h2>
            {/* <p className="text-slate-500 mt-2">
              Manage category-level and sub-category overrides for services
              business model
            </p> */}
          </div>
          <div className="flex gap-3">
            <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm">
              {stats.totalMain} Categories
            </span>
            <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm">
              {stats.totalSubs} Sub-Categories
            </span>
          </div>
        </div>

        {/* {activeTab === 'selling' && (
          <div className="mx-6 mt-6 mb-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row gap-4">
          
            <div>
              <p className="font-semibold text-blue-700 mb-2">
                Sales tax rates are managed globally — not per category
              </p>
         
              <div className="flex flex-wrap gap-4">
                <div className="bg-white border border-green-200 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-xs text-slate-500 mb-1 font-semibold">
                    Buying (New)
                  </p>
                  <p className="text-sm text-green-700">
                    GST: <b>{globalTax?.buying_new?.gst ?? '—'}%</b> | Care Tax:{' '}
                    <b>{globalTax?.buying_new?.careTax ?? '—'}%</b>
                  </p>
                  <p className="text-sm text-green-700">
                    Repair & Warranty:{' '}
                    <b>{globalTax?.buying_new?.repairWarranty ?? '—'}%</b> |
                    Relocation Warranty:{' '}
                    <b>{globalTax?.buying_new?.relocationWarranty ?? '—'}%</b>
                  </p>
                  <p className="text-sm text-green-700">
                    Delivery & Packaging:{' '}
                    <b>{globalTax?.buying_new?.deliveryPackaging ?? '—'}%</b> |
                    Installation Fee:{' '}
                    <b>{globalTax?.buying_new?.installationFee ?? '—'}%</b> |
                    Platform Fee:{' '}
                    <b>{globalTax?.buying_new?.platformFee ?? '—'}%</b>
                  </p>
                </div>
                <div className="bg-white border border-purple-200 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-xs text-slate-500 mb-1 font-semibold">
                    Buying (Refurbished)
                  </p>
                  <p className="text-sm text-purple-700">
                    GST: <b>{globalTax?.buying_refurbished?.gst ?? '—'}%</b> |
                    Care Tax:{' '}
                    <b>{globalTax?.buying_refurbished?.careTax ?? '—'}%</b>
                  </p>
                  <p className="text-sm text-purple-700">
                    Repair & Warranty:{' '}
                    <b>
                      {globalTax?.buying_refurbished?.repairWarranty ?? '—'}%
                    </b>{' '}
                    | Relocation Warranty:{' '}
                    <b>
                      {globalTax?.buying_refurbished?.relocationWarranty ?? '—'}
                      %
                    </b>
                  </p>
                  <p className="text-sm text-purple-700">
                    Delivery & Packaging:{' '}
                    <b>
                      {globalTax?.buying_refurbished?.deliveryPackaging ?? '—'}%
                    </b>{' '}
                    | Installation Fee:{' '}
                    <b>
                      {globalTax?.buying_refurbished?.installationFee ?? '—'}%
                    </b>{' '}
                    | Platform Fee:{' '}
                    <b>{globalTax?.buying_refurbished?.platformFee ?? '—'}%</b>
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                These rates apply at cart/order time based on product condition
                (new or refurbished)
              </p>
            </div>
          </div>
        )} */}
        {/* Sales Tax Info Banner */}
        {activeTab === 'selling' && (
          <div className="mx-6 mt-6 mb-2">
            <p className="font-semibold text-blue-700 mb-3">
              Buy tax rates are managed globally — not per category
            </p>
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Buying (New) */}
              <div className="rounded-2xl border border-green-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2 bg-green-50 px-4 py-3 border-b border-green-100">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Tag size={16} className="text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-green-700">
                    Buy (New)
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      GST
                    </p>
                    <p className="text-base font-bold text-green-700">
                      {globalTax?.buying_new?.gst ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Care Tax
                    </p>
                    <p className="text-base font-bold text-green-700">
                      {globalTax?.buying_new?.careTax ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Repair
                    </p>
                    <p className="text-base font-bold text-green-700">
                      {globalTax?.buying_new?.repairWarranty ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Relocation
                    </p>
                    <p className="text-base font-bold text-green-700">
                      {globalTax?.buying_new?.relocationWarranty ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Delivery
                    </p>
                    <p className="text-base font-bold text-green-700">
                      {globalTax?.buying_new?.deliveryPackaging ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Install
                    </p>
                    <p className="text-base font-bold text-green-700">
                      {globalTax?.buying_new?.installationFee ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Platform
                    </p>
                    <p className="text-base font-bold text-green-700">
                      {globalTax?.buying_new?.platformFee ?? '—'}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Buying (Refurbished) */}
              {/* <div className="rounded-2xl border border-purple-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-3 border-b border-purple-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Tag size={16} className="text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-purple-700">
                    Buying (Refurbished)
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      GST
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.gst ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Care Tax
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.careTax ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Repair
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.repairWarranty ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Relocation
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.relocationWarranty ?? '—'}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Delivery
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.deliveryPackaging ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Install
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.installationFee ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Platform
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.platformFee ?? '—'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              These rates apply at cart/order time based on product condition
              (new or refurbished)
            </p>
          </div>
        )} */}

              {/* Buying (Refurbished) */}
              <div className="rounded-2xl border border-purple-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-3 border-b border-purple-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Tag size={16} className="text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-purple-700">
                    Buy (Refurbished)
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      GST
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.gst ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Care Tax
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.careTax ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Repair
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.repairWarranty ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Relocation
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.relocationWarranty ?? '—'}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Delivery
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.deliveryPackaging ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Install
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.installationFee ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Platform
                    </p>
                    <p className="text-base font-bold text-purple-700">
                      {globalTax?.buying_refurbished?.platformFee ?? '—'}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Buying (Mint Condition) */}
              <div className="rounded-2xl border border-teal-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2 bg-teal-50 px-4 py-3 border-b border-teal-100">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Tag size={16} className="text-teal-600" />
                  </div>
                  <p className="text-sm font-semibold text-teal-700">
                    Buy (Mint)
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      GST
                    </p>
                    <p className="text-base font-bold text-teal-700">
                      {globalTax?.buying_mint?.gst ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Care Tax
                    </p>
                    <p className="text-base font-bold text-teal-700">
                      {globalTax?.buying_mint?.careTax ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Repair
                    </p>
                    <p className="text-base font-bold text-teal-700">
                      {globalTax?.buying_mint?.repairWarranty ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Relocation
                    </p>
                    <p className="text-base font-bold text-teal-700">
                      {globalTax?.buying_mint?.relocationWarranty ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Delivery
                    </p>
                    <p className="text-base font-bold text-teal-700">
                      {globalTax?.buying_mint?.deliveryPackaging ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Install
                    </p>
                    <p className="text-base font-bold text-teal-700">
                      {globalTax?.buying_mint?.installationFee ?? '—'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Platform
                    </p>
                    <p className="text-base font-bold text-teal-700">
                      {globalTax?.buying_mint?.platformFee ?? '—'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              These rates apply at cart/order time based on product condition
              (new, refurbished, or mint)
            </p>
          </div>
        )}
        {/* Table (all screens) */}
        <div className="block overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-slate-500 sticky left-0 bg-slate-50 z-10 min-w-[180px]">
                  CATEGORY / SUB-CATEGORY
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 min-w-[130px]">
                  COMMISSION (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  GST (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  CARE TAX (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  REPAIR & WARRANTY (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  RELOCATION (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  DELIVERY (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  INSTALLATION (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  PLATFORM FEE (%)
                </th>
                <th className="text-left px-4 py-3 text-xs text-slate-500">
                  STATUS
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex justify-center">
                      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : filteredTree.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredTree.map((cat) => {
                  const isOpen = expanded.has(cat._id);
                  const subs = cat.subCategories || [];
                  return (
                    <>
                      <tr key={cat._id} className="border-t">
                        <td className="px-4 py-3 sticky left-0 bg-white z-10 min-w-[180px]">
                          <button
                            onClick={() => toggleExpand(cat._id)}
                            className="flex items-center gap-3"
                          >
                            {subs.length > 0 ? (
                              isOpen ? (
                                <ChevronDown size={18} />
                              ) : (
                                <ChevronRight size={18} />
                              )
                            ) : (
                              <span className="w-[18px]" />
                            )}
                            <div className="text-left">
                              <p className="text-sm font-semibold">
                                {cat.name}
                              </p>
                              {subs.length > 0 && (
                                <p className="text-xs text-slate-500">
                                  {subs.length} sub-categories
                                </p>
                              )}
                            </div>
                          </button>
                        </td>
                        {/* <td className="p-5">10%</td>

                        <td className="p-5">
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400 text-sm">—</span>
                          ) : cat.defaultGst != null ? (
                            `${cat.defaultGst}%`
                          ) : (
                            '—'
                          )}
                        </td> */}
                        <td className="px-4 py-3 text-sm min-w-[130px]">
                          <span className="font-medium">
                            {cat.commissionRate != null
                              ? `${cat.commissionRate}%`
                              : '10%'}
                          </span>
                        </td>
                        {/* {TAX_KEYS.map(({ key }) => (
                          <td key={key} className="px-2 py-3">
                            <div className="relative w-20">
                              <input
                                type="number"
                                min={0}
                                value={getEditVal(cat._id, key, cat[key])}
                                onChange={(e) =>
                                  handleEditChange(cat._id, key, e.target.value)
                                }
                                className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
                              />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                %
                              </span>
                            </div>
                          </td>
                        ))} */}
                        {TAX_KEYS.map(({ key }) =>
                          activeTab === 'selling' ? (
                            <td key={key} className="px-2 py-3">
                              <div className="w-20 text-center text-xs text-slate-400 bg-slate-50 border rounded-lg px-2 py-1.5">
                                0%
                              </div>
                            </td>
                          ) : (
                            <td key={key} className="px-2 py-3">
                              <div className="relative w-20">
                                <input
                                  type="number"
                                  min={0}
                                  value={getEditVal(cat._id, key, cat[key])}
                                  onChange={(e) =>
                                    handleEditChange(
                                      cat._id,
                                      key,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
                                />
                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                  %
                                </span>
                              </div>
                            </td>
                          ),
                        )}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2 items-start">
                            <button
                              onClick={() =>
                                toggleActive(
                                  cat._id,
                                  'category',
                                  cat.taxBlocked,
                                )
                              }
                              className={`w-10 h-6 rounded-full relative transition-colors ${isActive(cat) ? 'bg-green-500' : 'bg-slate-300'}`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(cat) ? 'right-1' : 'left-1'}`}
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleSaveRow(cat._id, 'category', cat)
                              }
                              disabled={!!savingRow[cat._id]}
                              className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                            >
                              {savingRow[cat._id] ? '...' : 'Apply'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen &&
                        subs.map((sub) => (
                          <tr key={sub._id} className="border-t bg-slate-50">
                            <td className="px-4 py-3 sticky left-0 bg-slate-50 z-10 min-w-[180px]">
                              <span className="pl-10 block text-sm text-slate-600">
                                {sub.name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium">
                                {sub.commissionRate != null
                                  ? `${sub.commissionRate}%`
                                  : '10%'}
                              </span>
                            </td>
                            {/* <td className="px-4 py-3 text-sm">
                              {activeTab === 'selling' ? (
                                <span className="text-slate-400 text-xs">
                                  —
                                </span>
                              ) : sub.defaultGst != null ? (
                                `${sub.defaultGst}%`
                              ) : (
                                '—'
                              )}
                            </td> */}
                            {/* <td className="px-4 py-3 text-sm">
                              {activeTab === 'selling' ? (
                                <span className="text-slate-400 text-xs">
                                  —
                                </span>
                              ) : sub.defaultCareTax != null ? (
                                `${sub.defaultCareTax}%`
                              ) : (
                                '—'
                              )}
                            </td> */}
                            {/* {TAX_KEYS.map(({ key }) => (
                              <td key={key} className="px-2 py-3">
                                <div className="relative w-20">
                                  <input
                                    type="number"
                                    min={0}
                                    value={getEditVal(sub._id, key, sub[key])}
                                    onChange={(e) =>
                                      handleEditChange(
                                        sub._id,
                                        key,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
                                  />
                                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                    %
                                  </span>
                                </div>
                              </td>
                            ))} */}
                            {TAX_KEYS.map(({ key }) =>
                              activeTab === 'selling' ? (
                                <td key={key} className="px-2 py-3">
                                  <div className="w-20 text-center text-xs text-slate-400 bg-slate-50 border rounded-lg px-2 py-1.5">
                                    0%
                                  </div>
                                </td>
                              ) : (
                                <td key={key} className="px-2 py-3">
                                  <div className="relative w-20">
                                    <input
                                      type="number"
                                      min={0}
                                      value={getEditVal(sub._id, key, sub[key])}
                                      onChange={(e) =>
                                        handleEditChange(
                                          sub._id,
                                          key,
                                          e.target.value,
                                        )
                                      }
                                      className="w-full border rounded-lg px-2 py-1 pr-5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/25"
                                    />
                                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                      %
                                    </span>
                                  </div>
                                </td>
                              ),
                            )}
                            {/* <td className="px-4 py-3">
                              <div className="flex flex-col gap-2 items-start">
                                <button
                                  onClick={() =>
                                    toggleActive(
                                      sub._id,
                                      'subcategory',
                                      sub.taxBlocked,
                                    )
                                  }
                                  className={`mt-1 w-10 h-6 rounded-full relative transition-colors ${isActive(sub) ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                  <div
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(sub) ? 'right-1' : 'left-1'}`}
                                  />
                                </button>
                                <button
                                  onClick={() =>
                                    handleSaveRow(sub._id, 'subcategory', sub)
                                  }
                                  disabled={!!savingRow[sub._id]}
                                  className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                                >
                                  {savingRow[sub._id] ? '...' : 'Apply'}
                                </button>
                              </div>
                            </td> */}
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-2 items-start">
                                <button
                                  onClick={() =>
                                    toggleActive(
                                      sub._id,
                                      'subcategory',
                                      sub.taxBlocked,
                                    )
                                  }
                                  className={`w-10 h-6 rounded-full relative transition-colors ${isActive(sub) ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                  <div
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(sub) ? 'right-1' : 'left-1'}`}
                                  />
                                </button>
                                <button
                                  onClick={() =>
                                    handleSaveRow(sub._id, 'subcategory', sub)
                                  }
                                  disabled={!!savingRow[sub._id]}
                                  className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                                >
                                  {savingRow[sub._id] ? '...' : 'Apply'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (disabled — table used on all screens now) */}
        <div className="hidden p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            filteredTree.map((cat) => (
              <div key={cat._id}>
                <div className="border rounded-2xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-1">
                    {cat.icon ? (
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        className="h-10 w-10 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    ) : cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-10 w-10 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Package size={18} className="text-slate-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                  </div>
                  {/* <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-slate-500">Commission</p>
                      <p>10%</p>
                    </div> */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-slate-500">Commission</p>
                      <p>
                        {cat.commissionRate != null
                          ? `${cat.commissionRate}%`
                          : '10%'}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-xs text-slate-500">GST</p>
                      <p>
                        {cat.defaultGst != null ? `${cat.defaultGst}%` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Care Tax</p>
                      <p>
                        {cat.defaultCareTax != null
                          ? `${cat.defaultCareTax}%`
                          : '—'}
                      </p>
                    </div> */}
                    <div>
                      <p className="text-xs text-slate-500">GST</p>
                      <p>
                        {activeTab === 'selling' ? (
                          <span className="text-slate-400">—</span>
                        ) : cat.defaultGst != null ? (
                          `${cat.defaultGst}%`
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Care Tax</p>
                      <p>
                        {activeTab === 'selling' ? (
                          <span className="text-slate-400">—</span>
                        ) : cat.defaultCareTax != null ? (
                          `${cat.defaultCareTax}%`
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Repair & Warranty
                      </p>
                      <p>
                        {activeTab === 'selling' ? (
                          <span className="text-slate-400">—</span>
                        ) : cat.defaultRepairWarranty != null ? (
                          `${cat.defaultRepairWarranty}%`
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Relocation Warranty
                      </p>
                      <p>
                        {activeTab === 'selling' ? (
                          <span className="text-slate-400">—</span>
                        ) : cat.defaultRelocationWarranty != null ? (
                          `${cat.defaultRelocationWarranty}%`
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Delivery & Packaging
                      </p>
                      <p>
                        {activeTab === 'selling' ? (
                          <span className="text-slate-400">—</span>
                        ) : cat.defaultDeliveryPackaging != null ? (
                          `${cat.defaultDeliveryPackaging}%`
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Installation Fee</p>
                      <p>
                        {activeTab === 'selling' ? (
                          <span className="text-slate-400">—</span>
                        ) : cat.defaultInstallationFee != null ? (
                          `${cat.defaultInstallationFee}%`
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Platform Fee</p>
                      <p>
                        {activeTab === 'selling' ? (
                          <span className="text-slate-400">—</span>
                        ) : cat.defaultPlatformFee != null ? (
                          `${cat.defaultPlatformFee}%`
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      <button
                        onClick={() =>
                          toggleActive(cat._id, 'category', cat.taxBlocked)
                        }
                        className={`mt-1 w-10 h-6 rounded-full relative transition-colors ${isActive(cat) ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(cat) ? 'right-1' : 'left-1'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                {(cat.subCategories || []).map((sub) => (
                  <div
                    key={sub._id}
                    className="border rounded-2xl p-4 ml-4 mt-2 bg-slate-50"
                  >
                    <h3 className="font-medium text-base">{sub.name}</h3>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {/* <div>
                        <p className="text-xs text-slate-500">Commission</p>
                        <p>10%</p>
                      </div> */}
                      <div>
                        <p className="text-xs text-slate-500">Commission</p>
                        <p>
                          {sub.commissionRate != null
                            ? `${sub.commissionRate}%`
                            : '10%'}
                        </p>
                      </div>
                      {/* <div>
                        <p className="text-xs text-slate-500">GST</p>
                        <p>
                          {sub.defaultGst != null ? `${sub.defaultGst}%` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Care Tax</p>
                        <p>
                          {sub.defaultCareTax != null
                            ? `${sub.defaultCareTax}%`
                            : '—'}
                        </p>
                      </div> */}
                      <div>
                        <p className="text-xs text-slate-500">GST</p>
                        <p>
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400">—</span>
                          ) : sub.defaultGst != null ? (
                            `${sub.defaultGst}%`
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Care Tax</p>
                        <p>
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400">—</span>
                          ) : sub.defaultCareTax != null ? (
                            `${sub.defaultCareTax}%`
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          Repair & Warranty
                        </p>
                        <p>
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400">—</span>
                          ) : sub.defaultRepairWarranty != null ? (
                            `${sub.defaultRepairWarranty}%`
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          Relocation Warranty
                        </p>
                        <p>
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400">—</span>
                          ) : sub.defaultRelocationWarranty != null ? (
                            `${sub.defaultRelocationWarranty}%`
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          Delivery & Packaging
                        </p>
                        <p>
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400">—</span>
                          ) : sub.defaultDeliveryPackaging != null ? (
                            `${sub.defaultDeliveryPackaging}%`
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          Installation Fee
                        </p>
                        <p>
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400">—</span>
                          ) : sub.defaultInstallationFee != null ? (
                            `${sub.defaultInstallationFee}%`
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Platform Fee</p>
                        <p>
                          {activeTab === 'selling' ? (
                            <span className="text-slate-400">—</span>
                          ) : sub.defaultPlatformFee != null ? (
                            `${sub.defaultPlatformFee}%`
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <button
                          onClick={() =>
                            toggleActive(sub._id, 'subcategory', sub.taxBlocked)
                          }
                          className={`w-10 h-6 rounded-full relative transition-colors ${isActive(sub) ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive(sub) ? 'right-1' : 'left-1'}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
