// 'use client';

// import { useEffect, useState } from 'react';
// import {
//   Shield,
//   FileText,
//   Package,
//   Tag,
//   Box,
//   Settings,
//   Save,
//   RefreshCw,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { apiGetGlobalTax, apiUpdateGlobalTax } from '@/service/api';

// const TAX_TYPES = [
//   {
//     key: 'rental',
//     icon: Package,
//     name: 'Rental',
//     bg: 'bg-blue-100',
//     color: 'text-blue-600',
//   },
//   {
//     key: 'buying_new',
//     icon: Tag,
//     name: 'Buying (New)',
//     bg: 'bg-green-100',
//     color: 'text-green-600',
//   },
//   {
//     key: 'buying_refurbished',
//     icon: Box,
//     name: 'Buying (Refurbished)',
//     bg: 'bg-purple-100',
//     color: 'text-purple-600',
//   },
//   {
//     key: 'services',
//     icon: Settings,
//     name: 'Services',
//     bg: 'bg-orange-100',
//     color: 'text-orange-600',
//   },
// ];

// const TAX_FIELDS = [
//   { key: 'gst', label: 'GST (%)' },
//   { key: 'careTax', label: 'Care Tax (%)' },
//   { key: 'repairWarranty', label: 'Repair & Warranty (%)' },
//   { key: 'relocationWarranty', label: 'Relocation Warranty (%)' },
//   { key: 'deliveryPackaging', label: 'Delivery & Packaging (%)' },
//   { key: 'installationFee', label: 'Installation Fee (%)' },
//   { key: 'platformFee', label: 'Platform Fee (%)' },
// ];

// const emptyRow = () => ({
//   gst: '',
//   careTax: '',
//   repairWarranty: '',
//   relocationWarranty: '',
//   deliveryPackaging: '',
//   installationFee: '',
//   platformFee: '',
//   lastUpdated: null,
// });

// export default function GlobalTaxSetup() {
//   const [config, setConfig] = useState(() =>
//     Object.fromEntries(TAX_TYPES.map((t) => [t.key, emptyRow()])),
//   );
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState({});
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [applied, setApplied] = useState(() =>
//     Object.fromEntries(TAX_TYPES.map((t) => [t.key, false])),
//   );

//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   // ── Fetch current config from backend ──
//   useEffect(() => {
//     const fetchConfig = async () => {
//       setLoading(true);
//       try {
//         const res = await apiGetGlobalTax(token);
//         setConfig((prev) => ({
//           ...prev,
//           ...res.data.data.config,
//         }));
//       } catch (err) {
//         toast.error(
//           err?.response?.data?.message || 'Failed to load tax configuration',
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (token) fetchConfig();
//     else setLoading(false);
//   }, [token]);

//   const handleChange = (key, field, value) => {
//     setConfig((prev) => ({
//       ...prev,
//       [key]: { ...prev[key], [field]: value },
//     }));
//   };

//   // ── Per-row apply ──
//   // const handleApply = async (key, name) => {
//   //   const row = config[key];
//   //   const emptyField = TAX_FIELDS.find((f) => row[f.key] === '');
//   //   if (emptyField) {
//   //     toast.error(`Fill in "${emptyField.label}" for "${name}"`);
//   //     return;
//   //   }
//   //   const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//   const handleApply = async (key, name) => {
//     const row = config[key];
//     const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//     if (negativeField) {
//       toast.error(`"${negativeField.label}" cannot be negative for "${name}"`);
//       return;
//     }
//     // setSaving(true);
//     // try {
//     //   const res = await apiUpdateGlobalTax({ config: { [key]: row } }, token);
//     //   const data = res.data;
//     //   if (data.data?.config) {
//     //     setConfig((prev) => ({ ...prev, ...data.data.config }));
//     //   }
//     //   setApplied((prev) => ({ ...prev, [key]: true }));
//     //   toast.success(`"${name}" tax saved successfully!`);
//     // } catch (err) {
//     //   toast.error(err?.response?.data?.message || 'Failed to save');
//     // } finally {
//     //   setSaving(false);
//     // }
//     setSaving((prev) => ({ ...prev, [key]: true }));
//     try {
//       const res = await apiUpdateGlobalTax({ config: { [key]: row } }, token);
//       const data = res.data;
//       if (data.data?.config) {
//         setConfig((prev) => ({ ...prev, ...data.data.config }));
//       }
//       setApplied((prev) => ({ ...prev, [key]: true }));
//       toast.success(`"${name}" tax saved successfully!`);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to save');
//     } finally {
//       setSaving((prev) => ({ ...prev, [key]: false }));
//     }
//   };

//   // ── Save + propagate to all categories of that type ──
//   const handleSave = async () => {
//     // for (const t of TAX_TYPES) {
//     //   const row = config[t.key];
//     //   const emptyField = TAX_FIELDS.find((f) => row[f.key] === '');
//     //   if (emptyField) {
//     //     toast.error(`Fill in "${emptyField.label}" for "${t.name}"`);
//     //     return;
//     //   }
//     //   const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//     //   if (negativeField) {
//     //     toast.error(
//     //       `"${negativeField.label}" cannot be negative for "${t.name}"`,
//     //     );
//     //     return;
//     //   }
//     // }

//     for (const t of TAX_TYPES) {
//       const row = config[t.key];
//       const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//       if (negativeField) {
//         toast.error(
//           `"${negativeField.label}" cannot be negative for "${t.name}"`,
//         );
//         return;
//       }
//     }

//     // setSaving(true);
//     // try {
//     //   const res = await apiUpdateGlobalTax({ config }, token);
//     //   const data = res.data;

//     //   // Update lastUpdated timestamps from response
//     //   if (data.data?.config) {
//     //     setConfig((prev) => ({ ...prev, ...data.data.config }));
//     //   }

//     //   const { categoriesUpdated = 0, subCategoriesUpdated = 0 } = data.data;
//     //   toast.success(
//     //     `Saved! Updated ${categoriesUpdated} categories and ${subCategoriesUpdated} sub-categories.`,
//     //   );
//     // } catch (err) {
//     //   toast.error(
//     //     err?.response?.data?.message || 'Failed to save configuration',
//     //   );
//     // } finally {
//     //   setSaving(false);
//     // }

//     setConfirmOpen(true);
//   };

//   const performSave = async () => {
//     setConfirmOpen(false);
//     const allKeys = TAX_TYPES.map((t) => t.key);
//     setSaving((prev) => Object.fromEntries(allKeys.map((k) => [k, true])));
//     try {
//       const res = await apiUpdateGlobalTax({ config }, token);
//       const data = res.data;

//       if (data.data?.config) {
//         setConfig((prev) => ({ ...prev, ...data.data.config }));
//       }

//       const { categoriesUpdated = 0, subCategoriesUpdated = 0 } = data.data;
//       toast.success(
//         `Saved! Updated ${categoriesUpdated} categories and ${subCategoriesUpdated} sub-categories.`,
//       );
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Failed to save configuration',
//       );
//     } finally {
//       setSaving({});
//     }
//   };

//   const formatDate = (iso) => {
//     if (!iso) return '—';
//     return new Date(iso).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   return (
//     <div className="w-full p-4 md:p-6 pt-2 md:pt-3">
//       {/* Master Config Banner */}
//       <div className="border border-blue-200 bg-blue-50 rounded-2xl p-5 mb-6">
//         <div className="flex gap-1">
//           <Shield className="text-blue-600 shrink-0 mt-1" />
//           <div>
//             <h3 className="font-semibold text-blue-700">
//               Master Tax Configuration
//             </h3>

//             <p className="text-sm text-slate-600 mt-1">
//               These settings define the default GST and protection fees for all
//               transactions. Changes here will affect commission calculations and
//               customer pricing.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Table Card */}
//       <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <div className="bg-purple-100 p-3 rounded-xl">
//               <FileText className="text-purple-600" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-slate-800">
//                 Global Configuration Table
//               </h2>
//               <p className="text-slate-500">
//                 Set default tax rates and protection fees by category
//               </p>
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-16">
//             <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : (
//           <>
//             {/* Desktop Table */}
//             <div className="hidden lg:block overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-slate-50">
//                   <tr>
//                     <th className="text-left px-6 py-4 text-sm text-slate-600">
//                       CATEGORY / TYPE
//                     </th>
//                     {TAX_FIELDS.map((f) => (
//                       <th
//                         key={f.key}
//                         className="text-left px-6 py-4 text-sm text-slate-600 uppercase"
//                       >
//                         {f.label}
//                       </th>
//                     ))}
//                     <th className="text-left px-6 py-4 text-sm text-slate-600">
//                       LAST UPDATED
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm text-slate-600">
//                       ACTION
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {TAX_TYPES.map((item) => (
//                     <tr key={item.key} className="border-t">
//                       <td className="px-6 py-5">
//                         <div className="flex items-center gap-3">
//                           <div className={`${item.bg} p-3 rounded-xl`}>
//                             <item.icon className={item.color} size={18} />
//                           </div>
//                           <span className="font-medium">{item.name}</span>
//                         </div>
//                       </td>
//                       {TAX_FIELDS.map((f) => (
//                         <td key={f.key} className="px-6 py-5">
//                           <div className="relative w-32">
//                             <input
//                               type="number"
//                               min={0}
//                               value={config[item.key]?.[f.key] ?? ''}
//                               onChange={(e) =>
//                                 handleChange(item.key, f.key, e.target.value)
//                               }
//                               placeholder="0"
//                               className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                             />
//                             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
//                               %
//                             </span>
//                           </div>
//                         </td>
//                       ))}
//                       <td className="px-6 py-5 text-slate-500 text-sm">
//                         {formatDate(config[item.key]?.lastUpdated)}
//                       </td>

//                       <td className="px-6 py-5">
//                         <button
//                           // onClick={() => handleApply(item.key, item.name)}
//                           // disabled={saving}
//                           onClick={() => handleApply(item.key, item.name)}
//                           disabled={!!saving[item.key]}
//                           className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
//                         >
//                           {saving[item.key] ? (
//                             <span className="flex items-center gap-2">
//                               <RefreshCw size={14} className="animate-spin" />
//                               Saving…
//                             </span>
//                           ) : (
//                             'Apply'
//                           )}
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Cards */}
//             <div className="lg:hidden p-4 space-y-4">
//               {TAX_TYPES.map((item) => (
//                 <div key={item.key} className="border rounded-2xl p-4">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className={`${item.bg} p-3 rounded-xl`}>
//                       <item.icon className={item.color} size={18} />
//                     </div>
//                     <h3 className="font-semibold">{item.name}</h3>
//                   </div>
//                   <div className="space-y-3">
//                     {TAX_FIELDS.map((f) => (
//                       <div key={f.key}>
//                         <label className="text-sm text-slate-500">
//                           {f.label}
//                         </label>
//                         <div className="relative mt-1">
//                           <input
//                             type="number"
//                             min={0}
//                             value={config[item.key]?.[f.key] ?? ''}
//                             onChange={(e) =>
//                               handleChange(item.key, f.key, e.target.value)
//                             }
//                             placeholder="0"
//                             className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                           />
//                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
//                             %
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                     <p className="text-sm text-slate-500">
//                       Updated: {formatDate(config[item.key]?.lastUpdated)}
//                     </p>
//                     <button
//                       onClick={() => handleApply(item.key, item.name)}
//                       disabled={!!saving[item.key]}
//                       className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
//                     >
//                       Apply
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* Footer */}
//         <div className="bg-slate-50 border-t p-6">
//           <h3 className="font-semibold text-slate-800">
//             Apply to All Sub-categories
//           </h3>
//           {/* <p className="text-slate-500 text-sm mt-1">
//             Saving this configuration will force these defaults across all
//             existing categories and sub-categories for each platform type.
//           </p> */}
//           <p className="text-slate-500 text-sm mt-1">
//             Force these defaults across all existing product listings in each
//             category
//           </p>
//         </div>
//       </div>

//       {/* Confirm Overwrite Modal */}
//       {confirmOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
//           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
//             <h2 className="text-lg font-bold text-slate-800">
//               Confirm Master Update
//             </h2>
//             <p className="text-sm text-slate-600 mt-2">
//               This will overwrite the tax fields on every matching category and
//               sub-category for each type below. Any field left empty will be
//               saved as <strong>0%</strong>.
//             </p>
//             <div className="mt-3 space-y-1">
//               {TAX_TYPES.map((t) => {
//                 const row = config[t.key];
//                 const zeroFields = TAX_FIELDS.filter(
//                   (f) => row[f.key] === '' || Number(row[f.key]) === 0,
//                 );
//                 if (!zeroFields.length) return null;
//                 return (
//                   <p key={t.key} className="text-xs text-orange-600">
//                     {t.name}: {zeroFields.map((f) => f.label).join(', ')} will
//                     be set to 0%
//                   </p>
//                 );
//               })}
//             </div>
//             <p className="text-xs text-slate-400 mt-3">
//               Note: this may also overwrite custom tax rates you set
//               individually for specific sub-categories.
//             </p>
//             <div className="mt-5 flex justify-end gap-3">
//               <button
//                 onClick={() => setConfirmOpen(false)}
//                 className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={performSave}
//                 className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
//               >
//                 Yes, Apply to All
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// // }

// 'use client';

// import { useEffect, useState } from 'react';
// import {
//   Shield,
//   FileText,
//   Package,
//   Tag,
//   Box,
//   Settings,
//   Save,
//   RefreshCw,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { apiGetGlobalTax, apiUpdateGlobalTax } from '@/service/api';

// const TAX_TYPES = [
//   {
//     key: 'rental',
//     icon: Package,
//     name: 'Rental',
//     bg: 'bg-blue-100',
//     color: 'text-blue-600',
//   },
//   {
//     key: 'buying_new',
//     icon: Tag,
//     name: 'Buying (New)',
//     bg: 'bg-green-100',
//     color: 'text-green-600',
//   },
//   {
//     key: 'buying_refurbished',
//     icon: Box,
//     name: 'Buying (Refurbished)',
//     bg: 'bg-purple-100',
//     color: 'text-purple-600',
//   },
//   {
//     key: 'services',
//     icon: Settings,
//     name: 'Services',
//     bg: 'bg-orange-100',
//     color: 'text-orange-600',
//   },
// ];

// const TAX_FIELDS = [
//   { key: 'gst', label: 'GST (%)' },
//   { key: 'careTax', label: 'Care Tax (%)' },
//   { key: 'repairWarranty', label: 'Repair & Warranty (%)' },
//   { key: 'relocationWarranty', label: 'Relocation Warranty (%)' },
//   { key: 'deliveryPackaging', label: 'Delivery & Packaging (%)' },
//   { key: 'installationFee', label: 'Installation Fee (%)' },
//   { key: 'platformFee', label: 'Platform Fee (%)' },
// ];

// const emptyRow = () => ({
//   gst: '',
//   careTax: '',
//   repairWarranty: '',
//   relocationWarranty: '',
//   deliveryPackaging: '',
//   installationFee: '',
//   platformFee: '',
//   lastUpdated: null,
// });

// export default function GlobalTaxSetup() {
//   const [config, setConfig] = useState(() =>
//     Object.fromEntries(TAX_TYPES.map((t) => [t.key, emptyRow()])),
//   );
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState({});
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [applied, setApplied] = useState(() =>
//     Object.fromEntries(TAX_TYPES.map((t) => [t.key, false])),
//   );
//   const [editing, setEditing] = useState(() =>
//     Object.fromEntries(TAX_TYPES.map((t) => [t.key, false])),
//   );

//   const handleEditToggle = (key) => {
//     setEditing((prev) => ({ ...prev, [key]: true }));
//   };

//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   // ── Fetch current config from backend ──
//   useEffect(() => {
//     const fetchConfig = async () => {
//       setLoading(true);
//       try {
//         const res = await apiGetGlobalTax(token);
//         setConfig((prev) => ({
//           ...prev,
//           ...res.data.data.config,
//         }));
//       } catch (err) {
//         toast.error(
//           err?.response?.data?.message || 'Failed to load tax configuration',
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (token) fetchConfig();
//     else setLoading(false);
//   }, [token]);

//   const handleChange = (key, field, value) => {
//     setConfig((prev) => ({
//       ...prev,
//       [key]: { ...prev[key], [field]: value },
//     }));
//   };

//   // ── Per-row apply ──
//   // const handleApply = async (key, name) => {
//   //   const row = config[key];
//   //   const emptyField = TAX_FIELDS.find((f) => row[f.key] === '');
//   //   if (emptyField) {
//   //     toast.error(`Fill in "${emptyField.label}" for "${name}"`);
//   //     return;
//   //   }
//   //   const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//   const handleApply = async (key, name) => {
//     const row = config[key];
//     const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//     if (negativeField) {
//       toast.error(`"${negativeField.label}" cannot be negative for "${name}"`);
//       return;
//     }
//     // setSaving(true);
//     // try {
//     //   const res = await apiUpdateGlobalTax({ config: { [key]: row } }, token);
//     //   const data = res.data;
//     //   if (data.data?.config) {
//     //     setConfig((prev) => ({ ...prev, ...data.data.config }));
//     //   }
//     //   setApplied((prev) => ({ ...prev, [key]: true }));
//     //   toast.success(`"${name}" tax saved successfully!`);
//     // } catch (err) {
//     //   toast.error(err?.response?.data?.message || 'Failed to save');
//     // } finally {
//     //   setSaving(false);
//     // }
//     setSaving((prev) => ({ ...prev, [key]: true }));
//     try {
//       const res = await apiUpdateGlobalTax({ config: { [key]: row } }, token);
//       const data = res.data;
//       if (data.data?.config) {
//         setConfig((prev) => ({ ...prev, ...data.data.config }));
//       }
//       setApplied((prev) => ({ ...prev, [key]: true }));
//       setEditing((prev) => ({ ...prev, [key]: false }));
//       toast.success(`"${name}" tax saved successfully!`);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to save');
//     } finally {
//       setSaving((prev) => ({ ...prev, [key]: false }));
//     }
//   };

//   // ── Save + propagate to all categories of that type ──
//   const handleSave = async () => {
//     // for (const t of TAX_TYPES) {
//     //   const row = config[t.key];
//     //   const emptyField = TAX_FIELDS.find((f) => row[f.key] === '');
//     //   if (emptyField) {
//     //     toast.error(`Fill in "${emptyField.label}" for "${t.name}"`);
//     //     return;
//     //   }
//     //   const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//     //   if (negativeField) {
//     //     toast.error(
//     //       `"${negativeField.label}" cannot be negative for "${t.name}"`,
//     //     );
//     //     return;
//     //   }
//     // }

//     for (const t of TAX_TYPES) {
//       const row = config[t.key];
//       const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
//       if (negativeField) {
//         toast.error(
//           `"${negativeField.label}" cannot be negative for "${t.name}"`,
//         );
//         return;
//       }
//     }

//     // setSaving(true);
//     // try {
//     //   const res = await apiUpdateGlobalTax({ config }, token);
//     //   const data = res.data;

//     //   // Update lastUpdated timestamps from response
//     //   if (data.data?.config) {
//     //     setConfig((prev) => ({ ...prev, ...data.data.config }));
//     //   }

//     //   const { categoriesUpdated = 0, subCategoriesUpdated = 0 } = data.data;
//     //   toast.success(
//     //     `Saved! Updated ${categoriesUpdated} categories and ${subCategoriesUpdated} sub-categories.`,
//     //   );
//     // } catch (err) {
//     //   toast.error(
//     //     err?.response?.data?.message || 'Failed to save configuration',
//     //   );
//     // } finally {
//     //   setSaving(false);
//     // }

//     setConfirmOpen(true);
//   };

//   const performSave = async () => {
//     setConfirmOpen(false);
//     const allKeys = TAX_TYPES.map((t) => t.key);
//     setSaving((prev) => Object.fromEntries(allKeys.map((k) => [k, true])));
//     try {
//       const res = await apiUpdateGlobalTax({ config }, token);
//       const data = res.data;

//       if (data.data?.config) {
//         setConfig((prev) => ({ ...prev, ...data.data.config }));
//       }

//       const { categoriesUpdated = 0, subCategoriesUpdated = 0 } = data.data;
//       toast.success(
//         `Saved! Updated ${categoriesUpdated} categories and ${subCategoriesUpdated} sub-categories.`,
//       );
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Failed to save configuration',
//       );
//     } finally {
//       setSaving({});
//     }
//   };

//   const formatDate = (iso) => {
//     if (!iso) return '—';
//     return new Date(iso).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   return (
//     <div className="w-full p-4 md:p-6 pt-2 md:pt-3">
//       {/* Master Config Banner */}
//       <div className="border border-blue-200 bg-blue-50 rounded-2xl p-5 mb-6">
//         <div className="flex gap-1">
//           <Shield className="text-blue-600 shrink-0 mt-1" />
//           <div>
//             <h3 className="font-semibold text-blue-700">
//               Master Tax Configuration
//             </h3>

//             <p className="text-sm text-slate-600 mt-1">
//               These settings define the default GST and protection fees for all
//               transactions. Changes here will affect commission calculations and
//               customer pricing.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Table Card */}
//       <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <div className="bg-purple-100 p-3 rounded-xl">
//               <FileText className="text-purple-600" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-slate-800">
//                 Global Configuration Table
//               </h2>
//               <p className="text-slate-500">
//                 Set default tax rates and protection fees by category
//               </p>
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-16">
//             <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : (
//           <>
//             {/* Desktop Table */}
//             <div className="hidden lg:block overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-slate-50">
//                   <tr>
//                     <th className="text-left px-6 py-4 text-sm text-slate-600">
//                       CATEGORY / TYPE
//                     </th>
//                     {TAX_FIELDS.map((f) => (
//                       <th
//                         key={f.key}
//                         className="text-center px-6 py-4 text-sm text-slate-600 uppercase"
//                       >
//                         {f.label}
//                       </th>
//                     ))}
//                     <th className="text-center px-6 py-4 text-sm text-slate-600">
//                       LAST UPDATED
//                     </th>
//                     <th className="text-center px-6 py-4 text-sm text-slate-600">
//                       ACTION
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {TAX_TYPES.map((item) => (
//                     <tr key={item.key} className="border-t">
//                       <td className="px-6 py-5 text-left">
//                         <div className="flex items-center justify-start gap-3">
//                           <div className={`${item.bg} p-3 rounded-xl`}>
//                             <item.icon className={item.color} size={18} />
//                           </div>
//                           <span className="font-medium">{item.name}</span>
//                         </div>
//                       </td>
//                       {TAX_FIELDS.map((f) => (
//                         <td key={f.key} className="px-6 py-5 text-center">
//                           <div className="relative w-32 mx-auto">
//                             {/* <input
//                               type="number"
//                               min={0}
//                               value={config[item.key]?.[f.key] ?? ''}
//                               onChange={(e) =>
//                                 handleChange(item.key, f.key, e.target.value)
//                               }
//                               placeholder="0"
//                               className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                             /> */}
//                             <input
//                               type="number"
//                               min={0}
//                               value={config[item.key]?.[f.key] ?? ''}
//                               onChange={(e) =>
//                                 handleChange(item.key, f.key, e.target.value)
//                               }
//                               placeholder="0"
//                               disabled={!editing[item.key]}
//                               className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
//                             />
//                             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
//                               %
//                             </span>
//                           </div>
//                         </td>
//                       ))}
//                       <td className="px-6 py-5 text-center text-slate-500 text-sm">
//                         {formatDate(config[item.key]?.lastUpdated)}
//                       </td>

//                       <td className="px-6 py-5 text-center">
//                         {/* <button
//                           // onClick={() => handleApply(item.key, item.name)}
//                           // disabled={saving}
//                           onClick={() => handleApply(item.key, item.name)}
//                           disabled={!!saving[item.key]}
//                           className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
//                         >
//                           {saving[item.key] ? (
//                             <span className="flex items-center gap-2">
//                               <RefreshCw size={14} className="animate-spin" />
//                               Saving…
//                             </span>
//                           ) : (
//                             'Apply'
//                           )}
//                         </button> */}
//                         <button
//                           onClick={() =>
//                             editing[item.key]
//                               ? handleApply(item.key, item.name)
//                               : handleEditToggle(item.key)
//                           }
//                           disabled={!!saving[item.key]}
//                           className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
//                         >
//                           {saving[item.key] ? (
//                             <span className="flex items-center gap-2">
//                               <RefreshCw size={14} className="animate-spin" />
//                               Saving…
//                             </span>
//                           ) : editing[item.key] ? (
//                             'Apply'
//                           ) : (
//                             'Edit'
//                           )}
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Cards */}
//             <div className="lg:hidden p-4 space-y-4">
//               {TAX_TYPES.map((item) => (
//                 <div key={item.key} className="border rounded-2xl p-4">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className={`${item.bg} p-3 rounded-xl`}>
//                       <item.icon className={item.color} size={18} />
//                     </div>
//                     <h3 className="font-semibold">{item.name}</h3>
//                   </div>
//                   <div className="space-y-3">
//                     {TAX_FIELDS.map((f) => (
//                       <div key={f.key}>
//                         <label className="text-sm text-slate-500">
//                           {f.label}
//                         </label>
//                         <div className="relative mt-1">
//                           {/* <input
//                             type="number"
//                             min={0}
//                             value={config[item.key]?.[f.key] ?? ''}
//                             onChange={(e) =>
//                               handleChange(item.key, f.key, e.target.value)
//                             }
//                             placeholder="0"
//                             className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                           /> */}
//                           <input
//                             type="number"
//                             min={0}
//                             value={config[item.key]?.[f.key] ?? ''}
//                             onChange={(e) =>
//                               handleChange(item.key, f.key, e.target.value)
//                             }
//                             placeholder="0"
//                             disabled={!editing[item.key]}
//                             className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
//                           />
//                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
//                             %
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                     <p className="text-sm text-slate-500">
//                       Updated: {formatDate(config[item.key]?.lastUpdated)}
//                     </p>
//                     {/* <button
//                       onClick={() => handleApply(item.key, item.name)}
//                       disabled={!!saving[item.key]}
//                       className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
//                     >
//                       Apply
//                     </button> */}
//                     <button
//                       onClick={() =>
//                         editing[item.key]
//                           ? handleApply(item.key, item.name)
//                           : handleEditToggle(item.key)
//                       }
//                       disabled={!!saving[item.key]}
//                       className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
//                     >
//                       {saving[item.key]
//                         ? 'Saving…'
//                         : editing[item.key]
//                           ? 'Apply'
//                           : 'Edit'}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* Footer */}
//         {/* <div className="bg-slate-50 border-t p-6">
//           <h3 className="font-semibold text-slate-800">
//             Apply to All Sub-categories
//           </h3>
//           <p className="text-slate-500 text-sm mt-1">
//             Saving this configuration will force these defaults across all
//             existing categories and sub-categories for each platform type.
//           </p>
//           <p className="text-slate-500 text-sm mt-1">
//             Force these defaults across all existing product listings in each
//             category
//           </p>
//         </div> */}
//       </div>

//       {/* Confirm Overwrite Modal */}
//       {confirmOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
//           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
//             <h2 className="text-lg font-bold text-slate-800">
//               Confirm Master Update
//             </h2>
//             <p className="text-sm text-slate-600 mt-2">
//               This will overwrite the tax fields on every matching category and
//               sub-category for each type below. Any field left empty will be
//               saved as <strong>0%</strong>.
//             </p>
//             <div className="mt-3 space-y-1">
//               {TAX_TYPES.map((t) => {
//                 const row = config[t.key];
//                 const zeroFields = TAX_FIELDS.filter(
//                   (f) => row[f.key] === '' || Number(row[f.key]) === 0,
//                 );
//                 if (!zeroFields.length) return null;
//                 return (
//                   <p key={t.key} className="text-xs text-orange-600">
//                     {t.name}: {zeroFields.map((f) => f.label).join(', ')} will
//                     be set to 0%
//                   </p>
//                 );
//               })}
//             </div>
//             <p className="text-xs text-slate-400 mt-3">
//               Note: this may also overwrite custom tax rates you set
//               individually for specific sub-categories.
//             </p>
//             <div className="mt-5 flex justify-end gap-3">
//               <button
//                 onClick={() => setConfirmOpen(false)}
//                 className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={performSave}
//                 className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
//               >
//                 Yes, Apply to All
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  FileText,
  Package,
  Tag,
  Box,
  Settings,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiGetGlobalTax, apiUpdateGlobalTax } from '@/service/api';

const TAX_TYPES = [
  {
    key: 'rental',
    icon: Package,
    name: 'Rent',
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
  {
    key: 'buying_new',
    icon: Tag,
    name: 'Buy (New)',
    bg: 'bg-green-100',
    color: 'text-green-600',
  },
  {
    key: 'buying_refurbished',
    icon: Box,
    name: 'Buy (Refurbished)',
    bg: 'bg-purple-100',
    color: 'text-purple-600',
  },
  {
    key: 'buying_mint',
    icon: Box,
    name: 'Buy (Mint)',
    bg: 'bg-teal-100',
    color: 'text-teal-600',
  },
  {
    key: 'services',
    icon: Settings,
    name: 'Services',
    bg: 'bg-orange-100',
    color: 'text-orange-600',
  },
];

const TAX_FIELDS = [
  { key: 'gst', label: 'GST (%)' },
  { key: 'careTax', label: 'Care Tax (%)' },
  { key: 'repairWarranty', label: 'Repair & Warranty (%)' },
  { key: 'relocationWarranty', label: 'Relocation Warranty (%)' },
  { key: 'deliveryPackaging', label: 'Delivery & Packaging (%)' },
  { key: 'installationFee', label: 'Installation Fee (%)' },
  { key: 'platformFee', label: 'Platform Fee (%)' },
];

const emptyRow = () => ({
  gst: '',
  careTax: '',
  repairWarranty: '',
  relocationWarranty: '',
  deliveryPackaging: '',
  installationFee: '',
  platformFee: '',
  lastUpdated: null,
});

export default function GlobalTaxSetup() {
  const [config, setConfig] = useState(() =>
    Object.fromEntries(TAX_TYPES.map((t) => [t.key, emptyRow()])),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applied, setApplied] = useState(() =>
    Object.fromEntries(TAX_TYPES.map((t) => [t.key, false])),
  );
  const [editing, setEditing] = useState(() =>
    Object.fromEntries(TAX_TYPES.map((t) => [t.key, false])),
  );

  const handleEditToggle = (key) => {
    setEditing((prev) => ({ ...prev, [key]: true }));
  };

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // ── Fetch current config from backend ──
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await apiGetGlobalTax(token);
        setConfig((prev) => ({
          ...prev,
          ...res.data.data.config,
        }));
      } catch (err) {
        toast.error(
          err?.response?.data?.message || 'Failed to load tax configuration',
        );
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConfig();
    else setLoading(false);
  }, [token]);

  const handleChange = (key, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // ── Per-row apply ──
  // const handleApply = async (key, name) => {
  //   const row = config[key];
  //   const emptyField = TAX_FIELDS.find((f) => row[f.key] === '');
  //   if (emptyField) {
  //     toast.error(`Fill in "${emptyField.label}" for "${name}"`);
  //     return;
  //   }
  //   const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
  const handleApply = async (key, name) => {
    const row = config[key];
    const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
    if (negativeField) {
      toast.error(`"${negativeField.label}" cannot be negative for "${name}"`);
      return;
    }
    // setSaving(true);
    // try {
    //   const res = await apiUpdateGlobalTax({ config: { [key]: row } }, token);
    //   const data = res.data;
    //   if (data.data?.config) {
    //     setConfig((prev) => ({ ...prev, ...data.data.config }));
    //   }
    //   setApplied((prev) => ({ ...prev, [key]: true }));
    //   toast.success(`"${name}" tax saved successfully!`);
    // } catch (err) {
    //   toast.error(err?.response?.data?.message || 'Failed to save');
    // } finally {
    //   setSaving(false);
    // }
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await apiUpdateGlobalTax({ config: { [key]: row } }, token);
      const data = res.data;
      if (data.data?.config) {
        setConfig((prev) => ({ ...prev, ...data.data.config }));
      }
      setApplied((prev) => ({ ...prev, [key]: true }));
      setEditing((prev) => ({ ...prev, [key]: false }));
      toast.success(`"${name}" tax saved successfully!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ── Save + propagate to all categories of that type ──
  const handleSave = async () => {
    // for (const t of TAX_TYPES) {
    //   const row = config[t.key];
    //   const emptyField = TAX_FIELDS.find((f) => row[f.key] === '');
    //   if (emptyField) {
    //     toast.error(`Fill in "${emptyField.label}" for "${t.name}"`);
    //     return;
    //   }
    //   const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
    //   if (negativeField) {
    //     toast.error(
    //       `"${negativeField.label}" cannot be negative for "${t.name}"`,
    //     );
    //     return;
    //   }
    // }

    for (const t of TAX_TYPES) {
      const row = config[t.key];
      const negativeField = TAX_FIELDS.find((f) => Number(row[f.key]) < 0);
      if (negativeField) {
        toast.error(
          `"${negativeField.label}" cannot be negative for "${t.name}"`,
        );
        return;
      }
    }

    // setSaving(true);
    // try {
    //   const res = await apiUpdateGlobalTax({ config }, token);
    //   const data = res.data;

    //   // Update lastUpdated timestamps from response
    //   if (data.data?.config) {
    //     setConfig((prev) => ({ ...prev, ...data.data.config }));
    //   }

    //   const { categoriesUpdated = 0, subCategoriesUpdated = 0 } = data.data;
    //   toast.success(
    //     `Saved! Updated ${categoriesUpdated} categories and ${subCategoriesUpdated} sub-categories.`,
    //   );
    // } catch (err) {
    //   toast.error(
    //     err?.response?.data?.message || 'Failed to save configuration',
    //   );
    // } finally {
    //   setSaving(false);
    // }

    setConfirmOpen(true);
  };

  const performSave = async () => {
    setConfirmOpen(false);
    const allKeys = TAX_TYPES.map((t) => t.key);
    setSaving((prev) => Object.fromEntries(allKeys.map((k) => [k, true])));
    try {
      const res = await apiUpdateGlobalTax({ config }, token);
      const data = res.data;

      if (data.data?.config) {
        setConfig((prev) => ({ ...prev, ...data.data.config }));
      }

      const { categoriesUpdated = 0, subCategoriesUpdated = 0 } = data.data;
      toast.success(
        `Saved! Updated ${categoriesUpdated} categories and ${subCategoriesUpdated} sub-categories.`,
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to save configuration',
      );
    } finally {
      setSaving({});
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full p-4 md:p-6 pt-2 md:pt-3">
      {/* Master Config Banner */}
      <div className="border border-blue-200 bg-blue-50 rounded-2xl p-5 mb-6">
        <div className="flex gap-1">
          <Shield className="text-blue-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-700">
              Master Tax Configuration
            </h3>

            <p className="text-sm text-slate-600 mt-1">
              These settings define the default GST and protection fees for all
              transactions. Changes here will affect commission calculations and
              customer pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <FileText className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Global Configuration Table
              </h2>
              <p className="text-slate-500">
                Set default tax rates and protection fees by category
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm text-slate-600">
                      CATEGORY / TYPE
                    </th>
                    {TAX_FIELDS.map((f) => (
                      <th
                        key={f.key}
                        className="text-center px-6 py-4 text-sm text-slate-600 uppercase"
                      >
                        {f.label}
                      </th>
                    ))}
                    <th className="text-center px-6 py-4 text-sm text-slate-600">
                      LAST UPDATED
                    </th>
                    <th className="text-center px-6 py-4 text-sm text-slate-600">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TAX_TYPES.map((item) => (
                    <tr key={item.key} className="border-t">
                      <td className="px-6 py-5 text-left">
                        <div className="flex items-center justify-start gap-3">
                          <div className={`${item.bg} p-3 rounded-xl`}>
                            <item.icon className={item.color} size={18} />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      {TAX_FIELDS.map((f) => (
                        <td key={f.key} className="px-6 py-5 text-center">
                          <div className="relative w-32 mx-auto">
                            {/* <input
                              type="number"
                              min={0}
                              value={config[item.key]?.[f.key] ?? ''}
                              onChange={(e) =>
                                handleChange(item.key, f.key, e.target.value)
                              }
                              placeholder="0"
                              className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                            /> */}
                            <input
                              type="number"
                              min={0}
                              value={config[item.key]?.[f.key] ?? ''}
                              onChange={(e) =>
                                handleChange(item.key, f.key, e.target.value)
                              }
                              placeholder="0"
                              disabled={!editing[item.key]}
                              className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                              %
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-5 text-center text-slate-500 text-sm">
                        {formatDate(config[item.key]?.lastUpdated)}
                      </td>

                      <td className="px-6 py-5 text-center">
                        {/* <button
                          // onClick={() => handleApply(item.key, item.name)}
                          // disabled={saving}
                          onClick={() => handleApply(item.key, item.name)}
                          disabled={!!saving[item.key]}
                          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          {saving[item.key] ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw size={14} className="animate-spin" />
                              Saving…
                            </span>
                          ) : (
                            'Apply'
                          )}
                        </button> */}
                        <button
                          onClick={() =>
                            editing[item.key]
                              ? handleApply(item.key, item.name)
                              : handleEditToggle(item.key)
                          }
                          disabled={!!saving[item.key]}
                          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          {saving[item.key] ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw size={14} className="animate-spin" />
                              Saving…
                            </span>
                          ) : editing[item.key] ? (
                            'Apply'
                          ) : (
                            'Edit'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {TAX_TYPES.map((item) => (
                <div key={item.key} className="border rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${item.bg} p-3 rounded-xl`}>
                      <item.icon className={item.color} size={18} />
                    </div>
                    <h3 className="font-semibold">{item.name}</h3>
                  </div>
                  <div className="space-y-3">
                    {TAX_FIELDS.map((f) => (
                      <div key={f.key}>
                        <label className="text-sm text-slate-500">
                          {f.label}
                        </label>
                        <div className="relative mt-1">
                          {/* <input
                            type="number"
                            min={0}
                            value={config[item.key]?.[f.key] ?? ''}
                            onChange={(e) =>
                              handleChange(item.key, f.key, e.target.value)
                            }
                            placeholder="0"
                            className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                          /> */}
                          <input
                            type="number"
                            min={0}
                            value={config[item.key]?.[f.key] ?? ''}
                            onChange={(e) =>
                              handleChange(item.key, f.key, e.target.value)
                            }
                            placeholder="0"
                            disabled={!editing[item.key]}
                            className="w-full border rounded-xl px-3 py-2 pr-8 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-slate-500">
                      Updated: {formatDate(config[item.key]?.lastUpdated)}
                    </p>
                    {/* <button
                      onClick={() => handleApply(item.key, item.name)}
                      disabled={!!saving[item.key]}
                      className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Apply
                    </button> */}
                    <button
                      onClick={() =>
                        editing[item.key]
                          ? handleApply(item.key, item.name)
                          : handleEditToggle(item.key)
                      }
                      disabled={!!saving[item.key]}
                      className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      {saving[item.key]
                        ? 'Saving…'
                        : editing[item.key]
                          ? 'Apply'
                          : 'Edit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        {/* <div className="bg-slate-50 border-t p-6">
          <h3 className="font-semibold text-slate-800">
            Apply to All Sub-categories
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Saving this configuration will force these defaults across all
            existing categories and sub-categories for each platform type.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Force these defaults across all existing product listings in each
            category
          </p>
        </div> */}
      </div>

      {/* Confirm Overwrite Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800">
              Confirm Master Update
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              This will overwrite the tax fields on every matching category and
              sub-category for each type below. Any field left empty will be
              saved as <strong>0%</strong>.
            </p>
            <div className="mt-3 space-y-1">
              {TAX_TYPES.map((t) => {
                const row = config[t.key];
                const zeroFields = TAX_FIELDS.filter(
                  (f) => row[f.key] === '' || Number(row[f.key]) === 0,
                );
                if (!zeroFields.length) return null;
                return (
                  <p key={t.key} className="text-xs text-orange-600">
                    {t.name}: {zeroFields.map((f) => f.label).join(', ')} will
                    be set to 0%
                  </p>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Note: this may also overwrite custom tax rates you set
              individually for specific sub-categories.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={performSave}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
              >
                Yes, Apply to All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
