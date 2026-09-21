// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSearchParams } from 'next/navigation';
// import { toast } from 'react-toastify';
// import {
//   apiCreateCoupon,
//   apiGetCouponById,
//   apiUpdateCoupon,
// } from '@/service/api';

// const SEGMENTS = [
//   { value: 'all', label: 'All Users' },
//   { value: 'new_customers', label: 'New Customers' },
//   { value: 'existing_customers', label: 'Existing Customers' },
// ];

// export default function CouponGeneratorPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const editId = searchParams.get('edit') || null;
//   const isEdit = Boolean(editId);

//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

//   // ── Form state ──────────────────────────────────────────────
//   const [code, setCode] = useState('');
//   const [promotionName, setName] = useState('');
//   const [discountType, setDType] = useState('percentage');
//   const [discountValue, setDValue] = useState('');
//   const [applicableOn, setApply] = useState(['rentals']);
//   const [minOrderValue, setMin] = useState('');
//   const [maxDiscountCap, setCap] = useState('');
//   const [userSegment, setSegment] = useState('new_customers');
//   const [validFrom, setFrom] = useState('');
//   const [validUntil, setUntil] = useState('');
//   const [totalUsageLimit, setTotal] = useState('');
//   const [usageLimitPerUser, setPerUser] = useState('1');
//   const [publishing, setPublishing] = useState(false);
//   const [loadingEdit, setLoadingEdit] = useState(false);

//   // ── Load edit data ───────────────────────────────────────────
//   useEffect(() => {
//     if (!editId) return;
//     (async () => {
//       try {
//         setLoadingEdit(true);
//         const res = await apiGetCouponById(editId, token);
//         const c = res.data.data;
//         setCode(c.code);
//         setName(c.promotionName);
//         setDType(c.discountType);
//         setDValue(String(c.discountValue));
//         setApply(c.applicableOn || ['rentals']);
//         setMin(String(c.minOrderValue || ''));
//         setCap(String(c.maxDiscountCap || ''));
//         setSegment(c.userSegment || 'all');
//         setFrom(c.validFrom?.slice(0, 10) || '');
//         setUntil(c.validUntil?.slice(0, 10) || '');
//         setTotal(String(c.totalUsageLimit || ''));
//         setPerUser(String(c.usageLimitPerUser || 1));
//       } catch {
//         toast.error('Failed to load coupon');
//       } finally {
//         setLoadingEdit(false);
//       }
//     })();
//   }, [editId]);

//   // ── Applicability toggle ──────────────────────────────────────
//   const toggleApply = (val) => {
//     setApply((prev) =>
//       prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
//     );
//   };

//   const applyChipStyle = (val) => {
//     if (!applicableOn.includes(val)) {
//       return 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50';
//     }
//     if (val === 'services') return 'border-purple-600 bg-purple-600 text-white';
//     return 'border-blue-500 bg-blue-500 text-white';
//   };

//   // ── Generate random code ──────────────────────────────────────
//   const generateCode = () => {
//     const p = ['SALE', 'DEAL', 'FEST', 'SAVE', 'PROMO', 'FLASH', 'MEGA'];
//     const prefix = p[Math.floor(Math.random() * p.length)];
//     setCode(prefix + Math.floor(100 + Math.random() * 900));
//   };

//   // ── Preview values ────────────────────────────────────────────
//   const previewDiscount =
//     discountType === 'percentage'
//       ? `${discountValue || '0'}% OFF`
//       : `₹${discountValue || '0'} OFF`;

//   const previewValid =
//     validFrom && validUntil
//       ? `Valid: ${new Date(validFrom).toLocaleDateString('en-IN')} – ${new Date(validUntil).toLocaleDateString('en-IN')}`
//       : 'Valid: Set dates below';

//   // ── Submit ────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!code.trim()) return toast.error('Enter a coupon code');
//     if (!promotionName.trim()) return toast.error('Enter a promotion name');
//     if (!discountValue || Number(discountValue) <= 0)
//       return toast.error('Enter a valid discount value');
//     if (!validFrom || !validUntil) return toast.error('Set validity dates');
//     if (!totalUsageLimit || Number(totalUsageLimit) <= 0)
//       return toast.error('Enter total usage limit');

//     const payload = {
//       code: code.toUpperCase().trim(),
//       promotionName: promotionName.trim(),
//       discountType,
//       discountValue: Number(discountValue),
//       applicableOn,
//       minOrderValue: Number(minOrderValue) || 0,
//       maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : null,
//       userSegment,
//       validFrom,
//       validUntil,
//       totalUsageLimit: Number(totalUsageLimit),
//       usageLimitPerUser: Number(usageLimitPerUser) || 1,
//     };

//     try {
//       setPublishing(true);
//       if (isEdit) {
//         await apiUpdateCoupon(editId, payload, token);
//         toast.success('Coupon updated!');
//       } else {
//         await apiCreateCoupon(payload, token);
//         toast.success('Coupon published!');
//       }
//       router.push('/system/coupons');
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Something went wrong');
//     } finally {
//       setPublishing(false);
//     }
//   };

//   if (loadingEdit) {
//     return (
//       <div className="p-8 flex items-center justify-center min-h-screen bg-[#F4F6F9]">
//         <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-[#F4F6F9] min-h-screen">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {isEdit ? 'Edit Coupon' : 'Coupon Code Generator'}
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Create promotional codes with custom discounts, targeting, and usage
//             limits
//           </p>
//         </div>
//         <div className="flex gap-3 mt-1">
//           <button
//             onClick={() => router.push('/system/coupons')}
//             className="px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={publishing}
//             className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
//           >
//             {publishing ? (
//               <>
//                 <svg
//                   className="w-4 h-4 animate-spin"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8H4z"
//                   />
//                 </svg>
//                 {isEdit ? 'Updating...' : 'Publishing...'}
//               </>
//             ) : (
//               <>
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                   viewBox="0 0 24 24"
//                 >
//                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//                 </svg>
//                 {isEdit ? 'Update Coupon' : 'Publish Coupon'}
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
//         {/* ── Left: Form ── */}
//         <div className="space-y-4">
//           {/* Section 1: Core Code Details */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
//             <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
//               <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
//                   <line x1="7" y1="7" x2="7.01" y2="7" />
//                 </svg>
//               </div>
//               <div>
//                 <div className="text-sm font-bold text-gray-900">
//                   Core Code Details
//                 </div>
//                 <div className="text-xs text-gray-400">
//                   Set coupon code and internal tracking name
//                 </div>
//               </div>
//             </div>
//             <div className="px-6 py-5 space-y-4">
//               <div>
//                 <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                   Coupon Code
//                 </label>
//                 <div className="flex gap-3">
//                   <div className="relative flex-1">
//                     <svg
//                       className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                       viewBox="0 0 24 24"
//                     >
//                       <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
//                       <line x1="7" y1="7" x2="7.01" y2="7" />
//                     </svg>
//                     <input
//                       type="text"
//                       value={code}
//                       onChange={(e) => setCode(e.target.value.toUpperCase())}
//                       placeholder="DIWALI2026"
//                       className="w-full h-11 pl-9 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-orange-400 transition uppercase"
//                     />
//                   </div>
//                   <button
//                     onClick={generateCode}
//                     className="flex items-center gap-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
//                   >
//                     <svg
//                       className="w-3.5 h-3.5"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                       viewBox="0 0 24 24"
//                     >
//                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//                     </svg>
//                     Generate
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1.5">
//                   This code will be visible to customers
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                   Promotion Name (Internal)
//                 </label>
//                 <input
//                   type="text"
//                   value={promotionName}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Diwali Customer Retention"
//                   className="w-full h-11 px-4 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-orange-400 transition"
//                 />
//                 <p className="text-xs text-gray-400 mt-1.5">
//                   Internal name for tracking and reporting
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Section 2: Logic & Parameters */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
//             <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
//               <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                   viewBox="0 0 24 24"
//                 >
//                   <line x1="19" y1="5" x2="5" y2="19" />
//                   <circle cx="6.5" cy="6.5" r="2.5" />
//                   <circle cx="17.5" cy="17.5" r="2.5" />
//                 </svg>
//               </div>
//               <div>
//                 <div className="text-sm font-bold text-gray-900">
//                   Logic &amp; Parameters
//                 </div>
//                 <div className="text-xs text-gray-400">
//                   Configure discount type, applicability, and constraints
//                 </div>
//               </div>
//             </div>
//             <div className="px-6 py-5">
//               <div className="grid grid-cols-3 gap-6">
//                 {/* Discount Type */}
//                 <div>
//                   <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
//                     Discount Type
//                   </div>
//                   <div className="space-y-2">
//                     {[
//                       { val: 'percentage', label: 'Percentage (%)' },
//                       { val: 'flat', label: 'Flat Amount (₹)' },
//                     ].map(({ val, label }) => (
//                       <button
//                         key={val}
//                         onClick={() => setDType(val)}
//                         className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-[1.5px] text-sm font-semibold transition ${
//                           discountType === val
//                             ? 'border-orange-500 bg-orange-50 text-orange-600'
//                             : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
//                         }`}
//                       >
//                         {label}
//                       </button>
//                     ))}
//                     <div className="mt-3">
//                       <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                         Value
//                       </label>
//                       <input
//                         type="number"
//                         value={discountValue}
//                         onChange={(e) => setDValue(e.target.value)}
//                         placeholder={
//                           discountType === 'percentage' ? '10' : '500'
//                         }
//                         className="w-full h-11 px-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Applicability */}
//                 <div>
//                   <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
//                     Applicability
//                   </div>
//                   <p className="text-[11px] text-gray-400 mb-3">
//                     Multi-select applicable categories
//                   </p>
//                   <div className="space-y-2">
//                     {[
//                       { val: 'rentals', label: 'Rentals' },
//                       { val: 'selling', label: 'Selling' },
//                       { val: 'services', label: 'Services' },
//                     ].map(({ val, label }) => (
//                       <button
//                         key={val}
//                         onClick={() => toggleApply(val)}
//                         className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-[1.5px] text-sm font-medium transition ${applyChipStyle(val)}`}
//                       >
//                         <span>{label}</span>
//                         {applicableOn.includes(val) && (
//                           <svg
//                             className="w-4 h-4"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth={2.5}
//                             viewBox="0 0 24 24"
//                           >
//                             <polyline points="20 6 9 17 4 12" />
//                           </svg>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Constraints */}
//                 <div>
//                   <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
//                     Constraints
//                   </div>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                         Minimum Order Value
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
//                           ₹
//                         </span>
//                         <input
//                           type="number"
//                           value={minOrderValue}
//                           onChange={(e) => setMin(e.target.value)}
//                           placeholder="500"
//                           className="w-full h-11 pl-8 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                         Maximum Discount Cap
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
//                           ₹
//                         </span>
//                         <input
//                           type="number"
//                           value={maxDiscountCap}
//                           onChange={(e) => setCap(e.target.value)}
//                           placeholder="1000"
//                           className="w-full h-11 pl-8 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
//                         />
//                       </div>
//                       <p className="text-[11px] text-gray-400 mt-1">
//                         Crucial for 2% service model
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Section 3: Targeting & Usage Limits */}
//           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
//             <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
//               <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//                   <circle cx="9" cy="7" r="4" />
//                   <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//                   <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//                 </svg>
//               </div>
//               <div>
//                 <div className="text-sm font-bold text-gray-900">
//                   Targeting &amp; Usage Limits
//                 </div>
//                 <div className="text-xs text-gray-400">
//                   Define user segments and usage restrictions
//                 </div>
//               </div>
//             </div>
//             <div className="px-6 py-5 space-y-5">
//               <div className="grid grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                     User Segment
//                   </label>
//                   <select
//                     value={userSegment}
//                     onChange={(e) => setSegment(e.target.value)}
//                     className="w-full h-11 px-4 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-orange-400 bg-white transition cursor-pointer"
//                   >
//                     {SEGMENTS.map((s) => (
//                       <option key={s.value} value={s.value}>
//                         {s.label}
//                       </option>
//                     ))}
//                   </select>
//                   <p className="text-xs text-gray-400 mt-1.5">
//                     Linked to 360° Customer Profile
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                     Validity Period
//                   </label>
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="date"
//                       value={validFrom}
//                       onChange={(e) => setFrom(e.target.value)}
//                       className="flex-1 h-11 px-3 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
//                     />
//                     <span className="text-gray-400 text-xs">→</span>
//                     <input
//                       type="date"
//                       value={validUntil}
//                       onChange={(e) => setUntil(e.target.value)}
//                       className="flex-1 h-11 px-3 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1.5">
//                     Campaign start and end dates
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                     Total Times Coupon Can Be Used
//                   </label>
//                   <div className="relative">
//                     <svg
//                       className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                       viewBox="0 0 24 24"
//                     >
//                       <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
//                     </svg>
//                     <input
//                       type="number"
//                       value={totalUsageLimit}
//                       onChange={(e) => setTotal(e.target.value)}
//                       placeholder="1000"
//                       className="w-full h-11 pl-9 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1.5">
//                     Total redemptions across all users
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
//                     Limit Per User
//                   </label>
//                   <div className="relative">
//                     <svg
//                       className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                       viewBox="0 0 24 24"
//                     >
//                       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                       <circle cx="12" cy="7" r="4" />
//                     </svg>
//                     <input
//                       type="number"
//                       value={usageLimitPerUser}
//                       onChange={(e) => setPerUser(e.target.value)}
//                       placeholder="1"
//                       className="w-full h-11 pl-9 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1.5">
//                     Maximum uses per individual user
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Right: Preview + Info ── */}
//         <div className="sticky top-6 space-y-4">
//           {/* Preview Card */}
//           <div className="rounded-2xl overflow-hidden shadow-lg shadow-orange-200">
//             <div className="bg-orange-500 px-5 py-5">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-[10px] font-bold tracking-widest uppercase text-orange-200 mb-2">
//                     Coupon Preview
//                   </p>
//                   <h3 className="text-3xl font-black text-white tracking-tight leading-none">
//                     {code || 'CODE'}
//                   </h3>
//                   <p className="text-sm text-orange-100 mt-2">
//                     {promotionName || 'Promotion Name'}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     navigator.clipboard.writeText(code);
//                     toast.success('Copied!');
//                   }}
//                   className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
//                 >
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                     viewBox="0 0 24 24"
//                   >
//                     <rect x="9" y="9" width="13" height="13" rx="2" />
//                     <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div className="bg-black/10 px-5 py-3 bg-orange-600">
//               <div className="flex items-center gap-2">
//                 <svg
//                   className="w-4 h-4 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2.5}
//                   viewBox="0 0 24 24"
//                 >
//                   <line x1="19" y1="5" x2="5" y2="19" />
//                   <circle cx="6.5" cy="6.5" r="2.5" />
//                   <circle cx="17.5" cy="17.5" r="2.5" />
//                 </svg>
//                 <span className="text-white font-black text-base">
//                   {previewDiscount}
//                 </span>
//               </div>
//               <p className="text-orange-200 text-xs mt-0.5">{previewValid}</p>
//             </div>
//           </div>

//           {/* Info Note */}
//           <div className="bg-blue-50 border-[1.5px] border-blue-200 rounded-2xl p-4">
//             <div className="flex items-center gap-2 mb-2">
//               <svg
//                 className="w-4 h-4 text-blue-600 flex-shrink-0"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2}
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="12" y1="8" x2="12" y2="12" />
//                 <line x1="12" y1="16" x2="12.01" y2="16" />
//               </svg>
//               <span className="text-sm font-bold text-blue-700">
//                 Important Note
//               </span>
//             </div>
//             <p className="text-xs text-blue-600 leading-relaxed">
//               Coupon discounts are deducted from the platform &apos; admin
//               share, not from vendor payouts. This ensures vendor earnings
//               remain protected.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  apiCreateCoupon,
  apiGetCouponById,
  apiUpdateCoupon,
} from '@/service/api';

const SEGMENTS = [
  { value: 'all', label: 'All Users' },
  { value: 'new_customers', label: 'New Customers' },
  { value: 'existing_customers', label: 'Existing Customers' },
];

export default function CouponGeneratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') || null;
  const isEdit = Boolean(editId);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // ── Form state ──────────────────────────────────────────────
  const [code, setCode] = useState('');
  const [promotionName, setName] = useState('');
  const [discountType, setDType] = useState('percentage');
  const [discountValue, setDValue] = useState('');
  const [applicableOn, setApply] = useState(['rentals']);
  const [minOrderValue, setMin] = useState('');
  const [maxDiscountCap, setCap] = useState('');
  const [userSegment, setSegment] = useState('new_customers');
  const [validFrom, setFrom] = useState('');
  const [validUntil, setUntil] = useState('');
  const [totalUsageLimit, setTotal] = useState('');
  const [usageLimitPerUser, setPerUser] = useState('1');
  const [publishing, setPublishing] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // ── Load edit data ───────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        setLoadingEdit(true);
        const res = await apiGetCouponById(editId, token);
        const c = res.data.data;
        setCode(c.code);
        setName(c.promotionName);
        setDType(c.discountType);
        setDValue(String(c.discountValue));
        setApply(c.applicableOn || ['rentals']);
        setMin(String(c.minOrderValue || ''));
        setCap(String(c.maxDiscountCap || ''));
        setSegment(c.userSegment || 'all');
        setFrom(c.validFrom?.slice(0, 10) || '');
        setUntil(c.validUntil?.slice(0, 10) || '');
        setTotal(String(c.totalUsageLimit || ''));
        setPerUser(String(c.usageLimitPerUser || 1));
      } catch {
        toast.error('Failed to load coupon');
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [editId]);

  // ── Applicability toggle ──────────────────────────────────────
  const toggleApply = (val) => {
    setApply((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  const applyChipStyle = (val) => {
    if (!applicableOn.includes(val)) {
      return 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50';
    }
    if (val === 'services') return 'border-purple-600 bg-purple-600 text-white';
    return 'border-blue-500 bg-blue-500 text-white';
  };

  // ── Generate random code ──────────────────────────────────────
  const generateCode = () => {
    const p = ['SALE', 'DEAL', 'FEST', 'SAVE', 'PROMO', 'FLASH', 'MEGA'];
    const prefix = p[Math.floor(Math.random() * p.length)];
    setCode(prefix + Math.floor(100 + Math.random() * 900));
  };

  // ── Preview values ────────────────────────────────────────────
  const previewDiscount =
    discountType === 'percentage'
      ? `${discountValue || '0'}% OFF`
      : `₹${discountValue || '0'} OFF`;

  const previewValid =
    validFrom && validUntil
      ? `Valid: ${new Date(validFrom).toLocaleDateString('en-IN')} – ${new Date(validUntil).toLocaleDateString('en-IN')}`
      : 'Valid: Set dates below';

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Enter a coupon code');
    if (!promotionName.trim()) return toast.error('Enter a promotion name');
    if (!discountValue || Number(discountValue) <= 0)
      return toast.error('Enter a valid discount value');
    if (!validFrom || !validUntil) return toast.error('Set validity dates');
    if (!totalUsageLimit || Number(totalUsageLimit) <= 0)
      return toast.error('Enter total usage limit');

    const payload = {
      code: code.toUpperCase().trim(),
      promotionName: promotionName.trim(),
      discountType,
      discountValue: Number(discountValue),
      applicableOn,
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : null,
      userSegment,
      validFrom,
      validUntil,
      totalUsageLimit: Number(totalUsageLimit),
      usageLimitPerUser: Number(usageLimitPerUser) || 1,
    };

    try {
      setPublishing(true);
      if (isEdit) {
        await apiUpdateCoupon(editId, payload, token);
        toast.success('Coupon updated!');
      } else {
        await apiCreateCoupon(payload, token);
        toast.success('Coupon published!');
      }
      router.push('/system/coupons');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setPublishing(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#F4F6F9]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#F4F6F9] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Coupon' : 'Coupon Code Generator'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create promotional codes with custom discounts, targeting, and usage
            limits
          </p>
        </div>
        <div className="flex gap-3 mt-1 w-full sm:w-auto">
          <button
            onClick={() => router.push('/system/coupons')}
            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={publishing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            {publishing ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                {isEdit ? 'Updating...' : 'Publishing...'}
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {isEdit ? 'Update Coupon' : 'Publish Coupon'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* ── Left: Form ── */}
        <div className="space-y-4">
          {/* Section 1: Core Code Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  Core Code Details
                </div>
                <div className="text-xs text-gray-400">
                  Set coupon code and internal tracking name
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Coupon Code
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="DIWALI2026"
                      className="w-full h-11 pl-9 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-orange-400 transition uppercase"
                    />
                  </div>
                  <button
                    onClick={generateCode}
                    className="flex items-center gap-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  This code will be visible to customers
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Promotion Name (Internal)
                </label>
                <input
                  type="text"
                  value={promotionName}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Diwali Customer Retention"
                  className="w-full h-11 px-4 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-orange-400 transition"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Internal name for tracking and reporting
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Logic & Parameters */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <line x1="19" y1="5" x2="5" y2="19" />
                  <circle cx="6.5" cy="6.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  Logic &amp; Parameters
                </div>
                <div className="text-xs text-gray-400">
                  Configure discount type, applicability, and constraints
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Discount Type */}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Discount Type
                  </div>
                  <div className="space-y-2">
                    {[
                      { val: 'percentage', label: 'Percentage (%)' },
                      { val: 'flat', label: 'Flat Amount (₹)' },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        onClick={() => setDType(val)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-[1.5px] text-sm font-semibold transition ${
                          discountType === val
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <div className="mt-3">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Value
                      </label>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDValue(e.target.value)}
                        placeholder={
                          discountType === 'percentage' ? '10' : '500'
                        }
                        className="w-full h-11 px-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Applicability */}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Applicability
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Multi-select applicable categories
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: 'rentals', label: 'Rent' },
                      { val: 'selling', label: 'Buy' },
                      { val: 'services', label: 'Services' },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        onClick={() => toggleApply(val)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-[1.5px] text-sm font-medium transition ${applyChipStyle(val)}`}
                      >
                        <span>{label}</span>
                        {applicableOn.includes(val) && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Constraints
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Minimum Order Value
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={minOrderValue}
                          onChange={(e) => setMin(e.target.value)}
                          placeholder="500"
                          className="w-full h-11 pl-8 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Maximum Discount Cap
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={maxDiscountCap}
                          onChange={(e) => setCap(e.target.value)}
                          placeholder="1000"
                          className="w-full h-11 pl-8 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Crucial for 2% service model
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Targeting & Usage Limits */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  Targeting &amp; Usage Limits
                </div>
                <div className="text-xs text-gray-400">
                  Define user segments and usage restrictions
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    User Segment
                  </label>
                  <select
                    value={userSegment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full h-11 px-4 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-orange-400 bg-white transition cursor-pointer"
                  >
                    {SEGMENTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Linked to 360° Customer Profile
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Validity Period
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setFrom(e.target.value)}
                      className="flex-1 h-11 px-3 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
                    />
                    <span className="text-gray-400 text-xs">→</span>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setUntil(e.target.value)}
                      className="flex-1 h-11 px-3 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Campaign start and end dates
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Total Times Coupon Can Be Used
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <input
                      type="number"
                      value={totalUsageLimit}
                      onChange={(e) => setTotal(e.target.value)}
                      placeholder="1000"
                      className="w-full h-11 pl-9 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Total redemptions across all users
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Limit Per User
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="number"
                      value={usageLimitPerUser}
                      onChange={(e) => setPerUser(e.target.value)}
                      placeholder="1"
                      className="w-full h-11 pl-9 pr-4 border-[1.5px] border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Maximum uses per individual user
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Preview + Info ── */}
        <div className="lg:sticky lg:top-6 space-y-4">
          {/* Preview Card */}
          <div className="rounded-2xl overflow-hidden shadow-lg shadow-orange-200">
            <div className="bg-orange-500 px-5 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-orange-200 mb-2">
                    Coupon Preview
                  </p>
                  <h3 className="text-3xl font-black text-white tracking-tight leading-none">
                    {code || 'CODE'}
                  </h3>
                  <p className="text-sm text-orange-100 mt-2">
                    {promotionName || 'Promotion Name'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    toast.success('Copied!');
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="bg-black/10 px-5 py-3 bg-orange-600">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <line x1="19" y1="5" x2="5" y2="19" />
                  <circle cx="6.5" cy="6.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
                <span className="text-white font-black text-base">
                  {previewDiscount}
                </span>
              </div>
              <p className="text-orange-200 text-xs mt-0.5">{previewValid}</p>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border-[1.5px] border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-blue-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm font-bold text-blue-700">
                Important Note
              </span>
            </div>
            <p className="text-xs text-blue-600 leading-relaxed">
              Coupon discounts are deducted from the platform &apos; admin
              share, not from vendor payouts. This ensures vendor earnings
              remain protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
