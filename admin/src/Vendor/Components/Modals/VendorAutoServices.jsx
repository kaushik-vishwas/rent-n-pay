// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';

// import { toast } from 'react-toastify';
// import {
//   Calendar,
//   Search,
//   X,
//   Package,
//   Tag,
//   Lock,
//   Bell,
//   Send,
//   Save,
//   Wrench,
//   Key,
// } from 'lucide-react';
// import { apiGetVendorServiceListingTemplates } from '@/service/api';
// import VendorManualServices from './VendorManualServices';
// import { useDispatch, useSelector } from 'react-redux';
// import { getCategories, getSubCategories } from '@/redux/slices/categorySlice';
// import checkWhiteIcon from '@/assets/icons/check-white.png';

// const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// function categoryOrSubAssetUrl(item) {
//   const icon = String(item?.icon || '').trim();
//   if (icon) return icon;
//   const img = String(item?.image || '').trim();
//   return img || '';
// }

// function defaultSchedule() {
//   return DAYS.map((d) => {
//     const isSun = d === 'Sun';
//     return {
//       day: d,
//       startTime: '09:00',
//       endTime: '18:00',
//       isAvailable: !isSun,
//     };
//   });
// }

// function parseNumberFromText(raw) {
//   const s = String(raw ?? '')
//     .replace(/,/g, '')
//     .replace(/[^\d.]/g, '');
//   const n = Number(s);
//   return Number.isFinite(n) ? n : 0;
// }

// function formatPriceLabel(n) {
//   if (!Number.isFinite(n) || n <= 0) return '';
//   return `₹${Math.round(n).toString()}`;
// }

// function joinList(items) {
//   if (!Array.isArray(items)) return [];
//   return items.map((x) => String(x || '').trim()).filter(Boolean);
// }

// function defaultAmc() {
//   return {
//     serviceCount: '',
//     automatedServiceReminders: false,
//     totalAmcFees: '',
//   };
// }

// export default function VendorAutoServices({
//   isOpen,
//   mode = 'create', // 'create' | 'edit'
//   initialData = null,
//   onClose,
//   onSubmit, // expects FormData
//   setIsManualServiceModalOpen,
// }) {
//   const token = useSelector((s) => s.vendor?.token);
//   const { categories, subCategories } = useSelector((s) => s.category);
//   const dispatch = useDispatch();

//   const [loading, setLoading] = useState(false);
//   const [templates, setTemplates] = useState([]);
//   const [templatesError, setTemplatesError] = useState(null);

//   const [stepCategoryId, setStepCategoryId] = useState('');
//   const [stepSubCategoryId, setStepSubCategoryId] = useState('');
//   const [templateSearch, setTemplateSearch] = useState('');
//   const [selectedTemplateId, setSelectedTemplateId] = useState(null);
//   const [isManualOpen, setIsManualOpen] = useState(false);

//   const [form, setForm] = useState({
//     productName: '',
//     category: '',
//     subCategory: '',
//     images: [], // new uploads
//     existingImages: [],
//     serviceType: '',
//     amc: defaultAmc(),
//     included: [],
//     excluded: [],
//     sellingPrice: '',
//     allowVendorEditSalePrice: false,
//     schedule: defaultSchedule(),
//     availabilitySchedule: defaultSchedule(),

//     // add this
//     sameHoursForAllDays: false,
//     serviceStartTime: '09:00',
//     serviceEndTime: '18:00',
//     breakStart: '',
//     breakEnd: '',
//     workDuration: '',
//   });

//   const availableCategories = useMemo(() => {
//     return (categories || []).filter((c) => c.availableInServices);
//   }, [categories]);

//   const filteredSubCats = useMemo(() => {
//     const catId = String(stepCategoryId || '');
//     const list = subCategories || [];
//     return list.filter(
//       (s) => String(s?.category || '') === catId && s.availableInServices,
//     );
//   }, [subCategories, stepCategoryId]);

//   const selectedTemplate = useMemo(() => {
//     if (!selectedTemplateId) return null;
//     return (
//       templates.find((t) => String(t._id) === String(selectedTemplateId)) ||
//       null
//     );
//   }, [templates, selectedTemplateId]);

//   // const filteredTemplates = useMemo(() => {
//   //   const term = templateSearch.trim().toLowerCase();
//   //   const catName = form.category;
//   //   const subName = form.subCategory;
//   //   return templates.filter((t) => {
//   //     if (catName && String(t.category) !== catName) return false;
//   //     if (subName && String(t.subCategory) !== subName) return false;
//   //     if (!term) return true;
//   //     return (
//   //       String(t.productName || '')
//   //         .toLowerCase()
//   //         .includes(term) ||
//   //       String(t.category || '')
//   //         .toLowerCase()
//   //         .includes(term) ||
//   //       String(t.subCategory || '')
//   //         .toLowerCase()
//   //         .includes(term)
//   //     );
//   //   });
//   // }, [templates, templateSearch, form.category, form.subCategory]);
//   const filteredTemplates = useMemo(() => {
//     const term = templateSearch.trim().toLowerCase();
//     return templates.filter((t) => {
//       if (!term) return true;
//       return (
//         String(t.productName || '')
//           .toLowerCase()
//           .includes(term) ||
//         String(t.category || '')
//           .toLowerCase()
//           .includes(term) ||
//         String(t.subCategory || '')
//           .toLowerCase()
//           .includes(term)
//       );
//     });
//   }, [templates, templateSearch]);

//   useEffect(() => {
//     if (!isOpen) return;
//     dispatch(getCategories());

//     setStepCategoryId('');
//     setStepSubCategoryId('');
//     setTemplateSearch('');
//     setSelectedTemplateId(null);
//     setTemplatesError(null);
//     setLoading(false);
//     setTemplates([]);

//     const nextSchedule = defaultSchedule();
//     setForm({
//       productName: '',
//       category: '',
//       subCategory: '',
//       images: [],
//       existingImages: [],
//       serviceType: '',
//       amc: defaultAmc(),
//       included: [],
//       excluded: [],
//       sellingPrice: '',
//       allowVendorEditSalePrice: false,
//       schedule: nextSchedule,
//       availabilitySchedule: nextSchedule,

//       sameHoursForAllDays: false,
//       serviceStartTime: '09:00',
//       serviceEndTime: '18:00',
//       breakStart: '',
//       breakEnd: '',
//       workDuration: '',
//     });

//     // Load admin templates (active only)
//     if (token) {
//       setLoading(true);
//       apiGetVendorServiceListingTemplates(token)
//         .then((res) => {
//           setTemplates(res.data?.serviceListingTemplates || []);
//         })
//         .catch((e) => {
//           setTemplatesError(
//             e?.response?.data?.message || 'Failed to load services',
//           );
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [isOpen, token]);

//   // useEffect(() => {
//   //   if (!isOpen || mode !== 'edit' || !initialData) return;
//   //   // Prefill for edit mode from vendor service product
//   //   const existingImages = Array.isArray(initialData.images)
//   //     ? initialData.images
//   //     : initialData.image
//   //       ? [initialData.image]
//   //       : [];

//   //   const sched = Array.isArray(initialData.availabilitySchedule)
//   //     ? initialData.availabilitySchedule
//   //     : defaultSchedule();

//   //   const meta = initialData.serviceMeta || {};
//   //   const included = joinList(meta.included);
//   //   const excluded = joinList(meta.excluded);
//   //   const amc = {
//   //     serviceCount: String(meta?.amc?.serviceCount ?? ''),
//   //     automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
//   //     totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
//   //   };
//   //   const firstAvailable = sched.find((s) => s.isAvailable) || sched[0];

//   //   setSelectedTemplateId(null);
//   //   setStepCategoryId(''); // not used in edit mode UI
//   //   setStepSubCategoryId('');
//   //   setForm({
//   //     productName: initialData.productName || '',
//   //     category: initialData.category || '',
//   //     subCategory: initialData.subCategory || '',
//   //     images: [],
//   //     existingImages,
//   //     serviceType: meta.serviceType || initialData.serviceType || '',
//   //     amc,
//   //     included,
//   //     excluded,
//   //     sellingPrice: initialData.price || '',
//   //     allowVendorEditSalePrice:
//   //       initialData?.salesConfiguration?.allowVendorEditSalePrice !== false,
//   //     schedule: sched,
//   //     availabilitySchedule: sched,
//   //     sameHoursForAllDays: false,
//   //     serviceStartTime: firstAvailable?.startTime || '09:00',
//   //     serviceEndTime: firstAvailable?.endTime || '18:00',
//   //     breakStart: firstAvailable?.breakStart || '',
//   //     breakEnd: firstAvailable?.breakEnd || '',
//   //     workDuration: firstAvailable?.workDuration || '',
//   //   });
//   // }, [isOpen, mode, initialData]);

//   useEffect(() => {
//     if (!isOpen || mode !== 'edit' || !initialData) return;

//     const existingImages = Array.isArray(initialData.images)
//       ? initialData.images
//       : initialData.image
//         ? [initialData.image]
//         : [];

//     const sched = Array.isArray(initialData.availabilitySchedule)
//       ? initialData.availabilitySchedule
//       : defaultSchedule();

//     const meta = initialData.serviceMeta || {};
//     const included = joinList(meta.included);
//     const excluded = joinList(meta.excluded);
//     const amc = {
//       serviceCount: String(meta?.amc?.serviceCount ?? ''),
//       automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
//       totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
//     };
//     const firstAvailable = sched.find((s) => s.isAvailable) || sched[0];

//     setSelectedTemplateId(null);

//     // Find and set matching category
//     const matchedCat = (categories || []).find(
//       (c) =>
//         String(c.name).toLowerCase() ===
//         String(initialData.category || '').toLowerCase(),
//     );
//     if (matchedCat) {
//       setStepCategoryId(matchedCat._id);
//       dispatch(getSubCategories(matchedCat._id));
//     } else {
//       setStepCategoryId('');
//     }

//     // Find and set matching subcategory after subcategories load
//     setTimeout(() => {
//       const matchedSub = (subCategories || []).find(
//         (s) =>
//           String(s.name).toLowerCase() ===
//           String(initialData.subCategory || '').toLowerCase(),
//       );
//       if (matchedSub) setStepSubCategoryId(matchedSub._id);
//       else setStepSubCategoryId('');
//     }, 400);

//     setForm({
//       productName: initialData.productName || '',
//       category: initialData.category || '',
//       subCategory: initialData.subCategory || '',
//       images: [],
//       existingImages,
//       serviceType: meta.serviceType || initialData.serviceType || '',
//       amc,
//       included,
//       excluded,
//       sellingPrice: initialData.price || '',
//       allowVendorEditSalePrice:
//         initialData?.salesConfiguration?.allowVendorEditSalePrice !== false,
//       schedule: sched,
//       availabilitySchedule: sched,
//       sameHoursForAllDays: false,
//       serviceStartTime: firstAvailable?.startTime || '09:00',
//       serviceEndTime: firstAvailable?.endTime || '18:00',
//       breakStart: firstAvailable?.breakStart || '',
//       breakEnd: firstAvailable?.breakEnd || '',
//       workDuration: firstAvailable?.workDuration || '',
//     });
//   }, [isOpen, mode, initialData, categories]);

//   // const applyCategory = (catId) => {
//   //   setStepCategoryId(catId);
//   //   const cat = (categories || []).find((c) => String(c._id) === String(catId));
//   //   setStepSubCategoryId('');
//   //   setForm((p) => ({
//   //     ...p,
//   //     category: cat?.name || '',
//   //     subCategory: '',
//   //     productName: '',
//   //     existingImages: [],
//   //     included: [],
//   //     excluded: [],
//   //     sellingPrice: '',
//   //     serviceType: '',
//   //     amc: defaultAmc(),
//   //   }));
//   // };
//   const applyCategory = (catId) => {
//     setStepCategoryId(catId);
//     const cat = (categories || []).find((c) => String(c._id) === String(catId));
//     setStepSubCategoryId('');
//     setForm((p) => ({
//       ...p,
//       category: cat?.name || '',
//       subCategory: '',
//       productName: '',
//       existingImages: [],
//       included: [],
//       excluded: [],
//       sellingPrice: '',
//       serviceType: '',
//       amc: defaultAmc(),
//     }));
//     if (catId) dispatch(getSubCategories(catId));
//   };

//   const applySubCategory = (subId) => {
//     setStepSubCategoryId(subId);
//     const sub = (subCategories || []).find(
//       (s) => String(s._id) === String(subId),
//     );
//     setForm((p) => ({
//       ...p,
//       subCategory: sub?.name || '',
//     }));
//   };

//   // const selectTemplate = (t) => {
//   //   setSelectedTemplateId(t._id);
//   //   setForm((prev) => {
//   //     const meta = t.serviceMeta || {};
//   //     const included = joinList(meta.included);
//   //     const excluded = joinList(meta.excluded);
//   //     const amc = {
//   //       serviceCount: String(meta?.amc?.serviceCount ?? ''),
//   //       automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
//   //       totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
//   //     };

//   //     const salePrice = parseNumberFromText(
//   //       t?.salesConfiguration?.salePrice || '',
//   //     );

//   //     const fallbackPrice =
//   //       salePrice > 0
//   //         ? salePrice
//   //         : parseNumberFromText(t?.variants?.[0]?.price || '');
//   //     const priceLabel = formatPriceLabel(fallbackPrice) || '';

//   //     const schedule = defaultSchedule();
//   //     return {
//   //       ...prev,
//   //       productName: t.productName || '',
//   //       category: t.category || '',
//   //       subCategory: t.subCategory || '',
//   //       existingImages: Array.isArray(t.images) ? t.images.filter(Boolean) : [],
//   //       images: [],
//   //       serviceType: meta.serviceType || '',
//   //       amc,
//   //       included: included.length ? included : prev.included,
//   //       excluded: excluded.length ? excluded : prev.excluded,
//   //       sellingPrice: priceLabel,
//   //       allowVendorEditSalePrice:
//   //         t?.salesConfiguration?.allowVendorEditSalePrice !== false,
//   //       schedule,
//   //       availabilitySchedule: schedule,
//   //     };
//   //   });
//   // };

//   const selectTemplate = (t) => {
//     setSelectedTemplateId(t._id);

//     // Auto-select the matching category
//     const matchedCat = (categories || []).find(
//       (c) =>
//         String(c.name).toLowerCase() === String(t.category || '').toLowerCase(),
//     );
//     if (matchedCat) {
//       setStepCategoryId(matchedCat._id);
//       dispatch(getSubCategories(matchedCat._id));
//     }

//     // Auto-select the matching subCategory after a tick
//     setTimeout(() => {
//       const matchedSub = (subCategories || []).find(
//         (s) =>
//           String(s.name).toLowerCase() ===
//           String(t.subCategory || '').toLowerCase(),
//       );
//       if (matchedSub) setStepSubCategoryId(matchedSub._id);
//     }, 300);

//     setForm((prev) => {
//       const meta = t.serviceMeta || {};
//       const included = joinList(meta.included);
//       const excluded = joinList(meta.excluded);
//       const amc = {
//         serviceCount: String(meta?.amc?.serviceCount ?? ''),
//         automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
//         totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
//       };

//       const salePrice = parseNumberFromText(
//         t?.salesConfiguration?.salePrice || '',
//       );
//       const fallbackPrice =
//         salePrice > 0
//           ? salePrice
//           : parseNumberFromText(t?.variants?.[0]?.price || '');
//       const priceLabel = formatPriceLabel(fallbackPrice) || '';

//       const schedule = defaultSchedule();
//       return {
//         ...prev,
//         productName: t.productName || '',
//         category: t.category || '',
//         subCategory: t.subCategory || '',
//         existingImages: Array.isArray(t.images) ? t.images.filter(Boolean) : [],
//         images: [],
//         serviceType: meta.serviceType || '',
//         amc,
//         included: included.length ? included : prev.included,
//         excluded: excluded.length ? excluded : prev.excluded,
//         sellingPrice: priceLabel,
//         allowVendorEditSalePrice:
//           t?.salesConfiguration?.allowVendorEditSalePrice !== false,
//         schedule,
//         availabilitySchedule: schedule,
//       };
//     });
//   };

//   const updateScheduleDay = (day, patch) => {
//     setForm((p) => {
//       const next = (p.availabilitySchedule || []).map((x) =>
//         x.day === day ? { ...x, ...patch } : x,
//       );
//       return { ...p, availabilitySchedule: next, schedule: next };
//     });
//   };

//   const updateScheduleTime = (day, key, value) => {
//     updateScheduleDay(day, { [key]: value });
//   };

//   const submit = async (submissionStatus) => {
//     if (!form.category.trim()) return toast.error('Select category');
//     if (!form.subCategory.trim()) return toast.error('Select sub-category');
//     if (!form.productName.trim()) return toast.error('Select service');
//     if (!form.existingImages?.length && !form.images?.length) {
//       return toast.error('Service media is missing');
//     }
//     if (!form.sellingPrice.trim()) return toast.error('Service fees missing');
//     if (mode === 'create' && !selectedTemplate?._id) {
//       return toast.error('Select service using Add button');
//     }

//     const priceNum = parseNumberFromText(form.sellingPrice);

//     const fd = new FormData();
//     fd.append('productName', form.productName);
//     fd.append('type', 'Service');
//     fd.append('category', form.category);
//     fd.append('subCategory', form.subCategory);
//     fd.append('brand', '');
//     fd.append('condition', 'Brand New');
//     fd.append('shortDescription', '');
//     fd.append('description', '');
//     fd.append('specifications', JSON.stringify({}));
//     fd.append('productCustomSpecs', JSON.stringify([]));

//     fd.append(
//       'salesConfiguration',
//       JSON.stringify({
//         allowVendorEditSalePrice: !!form.allowVendorEditSalePrice,
//         salePrice: priceNum,
//         mrpPrice: priceNum,
//       }),
//     );
//     fd.append(
//       'serviceMeta',
//       JSON.stringify({
//         serviceType: form.serviceType || '',
//         amc: {
//           serviceCount: Number(form?.amc?.serviceCount || 0),
//           automatedServiceReminders: !!form?.amc?.automatedServiceReminders,
//           totalAmcFees: Number(form?.amc?.totalAmcFees || 0),
//         },
//         included: form.included || [],
//         excluded: form.excluded || [],
//       }),
//     );
//     // fd.append(
//     //   'availabilitySchedule',
//     //   JSON.stringify(form.availabilitySchedule || []),
//     // );

//     const finalSchedule = (form.availabilitySchedule || []).map((slot) => ({
//       ...slot,
//       startTime: slot.isAvailable
//         ? form.serviceStartTime || slot.startTime
//         : slot.startTime,
//       endTime: slot.isAvailable
//         ? form.serviceEndTime || slot.endTime
//         : slot.endTime,
//       breakStart: form.breakStart || '',
//       breakEnd: form.breakEnd || '',
//       workDuration: form.workDuration || '',
//     }));

//     fd.append('availabilitySchedule', JSON.stringify(finalSchedule));

//     fd.append(
//       'logisticsVerification',
//       JSON.stringify({ inventoryOwnerName: '', city: '' }),
//     );
//     fd.append('refundableDeposit', '0');

//     fd.append('existingImages', JSON.stringify(form.existingImages || []));
//     fd.append('price', form.sellingPrice);
//     fd.append('stock', '1');
//     fd.append('submissionStatus', submissionStatus);
//     fd.append('createdVia', 'template');
//     if (selectedTemplate?._id) {
//       fd.append('serviceTemplateId', selectedTemplate._id);
//     }

//     await onSubmit?.(fd);
//     toast.success(
//       mode === 'edit'
//         ? 'Service updated successfully'
//         : submissionStatus === 'draft'
//           ? 'Draft saved successfully'
//           : 'Service submitted for approval',
//       {
//         position: 'top-right',
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: 'light',
//       },
//     );
//   };

//   const serviceConfigEditable = !!form.allowVendorEditSalePrice;

//   const lowestServicePrice = useMemo(() => {
//     if (!templates?.length) return 0;

//     const prices = templates
//       .map((t) =>
//         parseNumberFromText(
//           t?.salesConfiguration?.salePrice || t?.variants?.[0]?.price || 0,
//         ),
//       )
//       .filter((p) => p > 0);

//     return prices.length ? Math.min(...prices) : 0;
//   }, [templates]);

//   const handleMatchLowestPrice = () => {
//     if (!serviceConfigEditable) return;

//     setForm((prev) => ({
//       ...prev,
//       sellingPrice: formatPriceLabel(lowestServicePrice),
//     }));
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <div
//         className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 ${isManualOpen ? 'hidden' : ''}`}
//       >
//         <div className="flex min-h-0 w-full max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl  bg-white shadow-2xl">
//           <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">
//                 {mode === 'edit' ? 'Edit Service' : 'Add New Service'}
//               </h2>
//               <p className="text-xs text-gray-500 mt-0.5">
//                 Select an admin-created service and set your availability.
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
//               aria-label="Close"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-5">
//             <div className="space-y-4">
//               {/* Service type selector cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                 {/* <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//                   <div className="min-w-0 text-left">
//                     <p className="text-sm font-semibold text-gray-900">
//                       Sell Product
//                     </p>
//                     <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                       One-time purchase
//                     </p>
//                   </div>
//                 </div> */}

//                 <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//                   <Tag className="h-6 w-6 text-gray-500 flex-shrink-0" />

//                   <div className="min-w-0 text-left">
//                     <p className="text-sm font-semibold text-gray-900">
//                       Sell Product
//                     </p>
//                     <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                       One-time purchase
//                     </p>
//                   </div>
//                 </div>

//                 {/*
//                 <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//                   <div className="min-w-0 text-left">
//                     <p className="text-sm font-semibold text-gray-900">
//                       Rent Out
//                     </p>
//                     <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                       Monthly rental
//                     </p>
//                   </div>
//                 </div> */}
//                 <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//                   <Key className="h-6 w-6 text-gray-500 flex-shrink-0" />

//                   <div className="min-w-0 text-left">
//                     <p className="text-sm font-semibold text-gray-900">
//                       Rent Out
//                     </p>
//                     <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                       Monthly rental
//                     </p>
//                   </div>
//                 </div>

//                 {/* <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-4 text-center ring-1 ring-blue-200">
//                   <p className="text-sm font-semibold text-blue-600">
//                     Offer Service
//                   </p>
//                   <p className="text-[11px] leading-snug text-gray-500">
//                     Hourly / fixed
//                   </p>
//                 </div> */}

//                 <div className="flex items-center justify-center gap-4 rounded-xl border-2 border-blue-500 bg-white px-6 py-6 shadow-md">
//                   <Wrench className="h-6 w-6 text-gray-600" strokeWidth={2.2} />

//                   <div className="flex flex-col">
//                     <p className="text-sm font-semibold text-blue-600">
//                       Offer Service
//                     </p>
//                     <p className="text-[11px]  text-gray-500">
//                       Hourly / Fixed rate
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//                 <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/70">
//                   <div className="flex items-start gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                       <Tag className="h-5 w-5" />
//                     </div>
//                     <div className="min-w-0">
//                       <h2 className="text-base font-semibold text-gray-900">
//                         What are you servicing?
//                       </h2>
//                       <p className="text-xs text-gray-500 mt-0.5">
//                         Select category to see relevant fields
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-4 sm:p-5 space-y-4">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900 mb-3">
//                       Step 1: Main Category{' '}
//                       <span className="text-red-500">*</span>
//                     </p>
//                     {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
//                     {availableCategories.map((c) => {
//                       const selected = String(stepCategoryId) === String(c._id);
//                       return (
//                         <button
//                           key={c._id}
//                           type="button"
//                           onClick={() => applyCategory(c._id)}
//                           className={`rounded-lg border px-3 py-2 text-left transition ${
//                             selected ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
//                           }`}
//                         >
//                           <p className={`text-sm font-medium ${selected ? 'text-orange-600' : 'text-gray-700'}`}>
//                             {c.name}
//                           </p>
//                         </button>
//                       );
//                     })}
//                   </div> */}
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
//                       {availableCategories.map((c) => {
//                         const selected =
//                           String(stepCategoryId) === String(c._id);
//                         const asset = categoryOrSubAssetUrl(c);
//                         return (
//                           <button
//                             key={c._id}
//                             type="button"
//                             onClick={() => applyCategory(c._id)}
//                             className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
//                               selected
//                                 ? 'border-orange-500 bg-orange-50/50 shadow-sm'
//                                 : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
//                             }`}
//                           >
//                             {asset ? (
//                               <img
//                                 src={asset}
//                                 alt=""
//                                 className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${selected ? '' : 'opacity-90'}`}
//                               />
//                             ) : (
//                               <Package
//                                 className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
//                                 strokeWidth={1.75}
//                               />
//                             )}
//                             <span
//                               className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${selected ? 'text-orange-600' : 'text-gray-600'}`}
//                             >
//                               {c.name}
//                             </span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <div>
//                     <p className="text-sm font-semibold text-gray-900 mb-3">
//                       Step 2: Sub Category{' '}
//                       <span className="text-red-500">*</span>
//                     </p>
//                     {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
//                     {filteredSubCats.map((s) => {
//                       const selected =
//                         String(stepSubCategoryId) === String(s._id);
//                       return (
//                         <button
//                           key={s._id}
//                           type="button"
//                           onClick={() => applySubCategory(s._id)}
//                           className={`rounded-lg border px-3 py-2 text-left transition ${
//                             selected
//                               ? 'border-orange-300 bg-orange-50'
//                               : 'border-gray-200 bg-white'
//                           }`}
//                         >
//                           <p
//                             className={`text-sm font-medium ${selected ? 'text-orange-600' : 'text-gray-700'}`}
//                           >
//                             {s.name}
//                           </p>
//                         </button>
//                       );
//                     })}
//                   </div> */}
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-3">
//                       {filteredSubCats.map((s) => {
//                         const selected =
//                           String(stepSubCategoryId) === String(s._id);
//                         const asset = categoryOrSubAssetUrl(s);
//                         return (
//                           <button
//                             key={s._id}
//                             type="button"
//                             onClick={() => applySubCategory(s._id)}
//                             className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
//                               selected
//                                 ? 'border-orange-500 bg-orange-50/50 shadow-sm'
//                                 : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
//                             }`}
//                           >
//                             {asset ? (
//                               <img
//                                 src={asset}
//                                 alt=""
//                                 className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${selected ? '' : 'opacity-90'}`}
//                               />
//                             ) : (
//                               <Package
//                                 className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
//                                 strokeWidth={1.75}
//                               />
//                             )}
//                             <span
//                               className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${selected ? 'text-orange-600' : 'text-gray-600'}`}
//                             >
//                               {s.name}
//                             </span>
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <div className="flex flex-col sm:flex-row gap-2">
//                       <div className="relative flex-1">
//                         <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                         <input
//                           type="search"
//                           value={templateSearch}
//                           onChange={(e) => setTemplateSearch(e.target.value)}
//                           placeholder="Search service by name..."
//                           className="w-full rounded-lg border border-gray-200 bg-white px-9 py-2 text-sm outline-none"
//                         />
//                       </div>
//                       {mode === 'create' ? (
//                         <button
//                           type="button"
//                           // onClick={() => setIsManualServiceModalOpen(true)}.
//                           onClick={() => setIsManualOpen(true)}
//                           className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 shrink-0"
//                         >
//                           + Custom Listing
//                         </button>
//                       ) : null}
//                     </div>
//                   </div>

//                   {templatesError ? (
//                     <p className="text-sm text-red-600">{templatesError}</p>
//                   ) : null}

//                   {loading ? (
//                     <p className="text-sm text-gray-500">Loading services…</p>
//                   ) : null}

//                   <div className="max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
//                     {!loading && filteredTemplates.length === 0 ? (
//                       <p className="p-8 text-center text-sm text-gray-500">
//                         No services found for this selection.
//                       </p>
//                     ) : (
//                       <table className="min-w-full text-sm">
//                         <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
//                           <tr>
//                             <th className="px-3 py-2 font-medium">Service</th>
//                             <th className="px-3 py-2 font-medium hidden sm:table-cell">
//                               Category
//                             </th>
//                             <th className="px-3 py-2 font-medium hidden md:table-cell">
//                               Sub-category
//                             </th>
//                             <th className="px-3 py-2 font-medium w-24 text-right">
//                               Action
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                           {filteredTemplates.map((t) => {
//                             const selected =
//                               String(selectedTemplateId) === String(t._id);
//                             return (
//                               <tr key={t._id} className="hover:bg-gray-50/80">
//                                 <td className="px-3 py-2">
//                                   <div className="flex items-center gap-2">
//                                     <img
//                                       src={
//                                         (t.images && t.images[0]) ||
//                                         t.image ||
//                                         'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
//                                       }
//                                       alt={t.productName}
//                                       className="h-11 w-11 rounded-lg object-cover border border-gray-100"
//                                     />
//                                     <p className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-none">
//                                       {t.productName}
//                                     </p>
//                                   </div>
//                                 </td>
//                                 <td className="px-3 py-2 hidden sm:table-cell text-gray-600">
//                                   {t.category || '—'}
//                                 </td>
//                                 <td className="px-3 py-2 hidden md:table-cell text-gray-600">
//                                   {t.subCategory || '—'}
//                                 </td>
//                                 <td className="px-3 py-2 text-right">
//                                   {selected ? (
//                                     <span className="text-sm font-medium text-emerald-600">
//                                       Added
//                                     </span>
//                                   ) : (
//                                     <button
//                                       type="button"
//                                       onClick={() => selectTemplate(t)}
//                                       className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
//                                     >
//                                       Add
//                                     </button>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Basic details & fees */}

//               <div className="rounded-2xl   shadow-sm overflow-hidden">
//                 {/* <div>
//                   <p className="text-sm font-semibold text-gray-900 mb-2">
//                     Product Media
//                   </p>
//                   <div className="w-full">
//                     {form.existingImages?.length ? (
//                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                         {form.existingImages.slice(0, 6).map((src, i) => (
//                           <img
//                             key={i}
//                             src={src}
//                             alt=""
//                             className="w-full h-36 object-cover rounded-lg border"
//                           />
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-gray-500">
//                         No media selected.
//                       </p>
//                     )}
//                   </div>
//                 </div> */}

//                 {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900 mb-2">
//                       What will be included
//                     </p>
//                     <textarea
//                       className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm min-h-[100px] text-gray-700"
//                       value={(form.included || []).join('\n')}
//                       readOnly
//                       placeholder="Enter included items (one per line)"
//                     />
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-gray-900 mb-2">
//                       What will be excluded
//                     </p>
//                     <textarea
//                       className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm min-h-[100px] text-gray-700"
//                       value={(form.excluded || []).join('\n')}
//                       readOnly
//                       placeholder="Enter excluded items (one per line)"
//                     />
//                   </div>
//                 </div> */}

//                 {/* Product Media */}

//                 <div className="rounded-2xl p-1 sm:p-5">
//                   <div className="flex items-center gap-2">
//                     <p className="text-sm font-semibold text-gray-900">
//                       Product Media
//                     </p>
//                   </div>
//                   <div className="rounded-2xl border border-[#D1D5DC] bg-[#F9FAFB] p-4">
//                     <div className="mb-4 flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-[#64748B] bg-white">
//                           <Lock className="h-3 w-3 text-[#64748B]" />
//                         </div>
//                       </div>
//                       {/*
//                     <span className="rounded-full bg-[#10B981] px-3 py-1 text-xs font-medium text-white">
//                       Catalog Images
//                     </span> */}
//                       <span className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-3 py-1 text-xs font-medium text-white">
//                         <img
//                           src={checkWhiteIcon.src}
//                           alt="Check"
//                           className="w-3.5 h-3.5 shrink-0"
//                         />
//                         Catalog Images
//                       </span>
//                     </div>
//                     {form.existingImages?.length ? (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                         {form.existingImages.slice(0, 6).map((src, i) => (
//                           <div
//                             key={i}
//                             className="relative overflow-hidden rounded-xl border border-gray-200"
//                           >
//                             <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
//                               {i + 1}
//                             </span>

//                             <img
//                               src={src}
//                               alt=""
//                               className="h-72 w-full object-cover"
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-gray-500">
//                         No media selected.
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Included / Excluded */}
//                 <div className="rounded-2xl border border-[#D1D5DC] bg-[#F9FAFB] p-4 sm:p-5">
//                   <div className="mb-4 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-[#64748B] bg-white">
//                         <Lock className="h-3 w-3 text-[#64748B]" />
//                       </div>
//                     </div>
//                     <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
//                       <img
//                         src={checkWhiteIcon.src}
//                         alt="Check"
//                         className="w-3.5 h-3.5 shrink-0"
//                       />
//                       Verified Specs
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl p-4">
//                     <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
//                       <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#364153]">
//                         What is included
//                       </p>

//                       {/* <textarea
//                         readOnly
//                         value={(form.included || []).join('\n')}
//                         className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
//                       />
//                     </div>

//                     <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
//                       <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#364153]">
//                         What is not included
//                       </p>

//                       <textarea
//                         readOnly
//                         value={(form.excluded || []).join('\n')}
//                         className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
//                       /> */}
//                       <textarea
//                         readOnly={!serviceConfigEditable}
//                         value={(form.included || []).join('\n')}
//                         onChange={(e) =>
//                           serviceConfigEditable &&
//                           setForm((p) => ({
//                             ...p,
//                             included: e.target.value.split('\n'),
//                           }))
//                         }
//                         className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
//                       />
//                     </div>

//                     <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
//                       <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#364153]">
//                         What is not included
//                       </p>

//                       <textarea
//                         readOnly={!serviceConfigEditable}
//                         value={(form.excluded || []).join('\n')}
//                         onChange={(e) =>
//                           serviceConfigEditable &&
//                           setForm((p) => ({
//                             ...p,
//                             excluded: e.target.value.split('\n'),
//                           }))
//                         }
//                         className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/70">
//                   <div className="flex items-start gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                       <Calendar className="h-5 w-5" />
//                     </div>
//                     <div className="min-w-0">
//                       <h2 className="text-base font-semibold text-gray-900">
//                         Service Fees Configuration
//                       </h2>
//                       <p className="text-xs text-gray-500 mt-0.5">
//                         Set pricing and inventory details
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

//                 <div>
//                   <p className="text-sm font-semibold text-gray-900 mb-2">
//                     Specific Service Type{' '}
//                     <span className="text-red-500">*</span>
//                   </p>
//                   <input
//                     type="text"
//                     value={form.serviceType}
//                     readOnly
//                     className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
//                     placeholder="Service Type"
//                   />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-gray-900 mb-2">
//                     Service Fees *
//                   </p>
//                   <input
//                     type="text"
//                     value={form.sellingPrice}
//                     readOnly={!serviceConfigEditable}
//                     onChange={(e) =>
//                       setForm((p) => ({ ...p, sellingPrice: e.target.value }))
//                     }
//                     className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
//                       serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                     }`}
//                     placeholder="₹ 145000"
//                   />
//                 </div>
//               </div> */}
//                 <div className="flex flex-col gap-3">
//                   <div className="w-full sm:w-1/2">
//                     <p className="text-sm font-semibold text-gray-900 mb-2">
//                       Specific Service Type{' '}
//                       <span className="text-red-500">*</span>
//                     </p>
//                     {/* <input
//                       type="text"
//                       value={form.serviceType}
//                       readOnly
//                       className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
//                       placeholder="Service Type"
//                     /> */}
//                     <input
//                       type="text"
//                       value={form.serviceType}
//                       readOnly={!serviceConfigEditable}
//                       onChange={(e) =>
//                         serviceConfigEditable &&
//                         setForm((p) => ({ ...p, serviceType: e.target.value }))
//                       }
//                       className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
//                         serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                       }`}
//                       placeholder="Service Type"
//                     />
//                   </div>

//                   {/* <div className="w-full sm:w-1/2">
//                     <p className="text-sm font-semibold text-gray-900 mb-2">
//                       Service Fees <span className="text-red-500">*</span>
//                     </p>
//                     <input
//                       type="text"
//                       value={form.sellingPrice}
//                       readOnly={!serviceConfigEditable}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           sellingPrice: e.target.value,
//                         }))
//                       }
//                       className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
//                         serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                       }`}
//                       placeholder="₹ 145000"
//                     />
//                   </div> */}
//                 </div>

//                 {/* <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-base font-semibold text-gray-900">
//                     Service Configuration
//                   </h3>
//                   <span
//                     className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
//                       serviceConfigEditable
//                         ? 'bg-emerald-100 text-emerald-700'
//                         : 'bg-gray-100 text-gray-600'
//                     }`}
//                   >
//                     {serviceConfigEditable
//                       ? 'Vendor editable'
//                       : 'Locked by admin'}
//                   </span>
//                 </div>

//                 <input
//                   type="text"
//                   value={form.sellingPrice || ''}
//                   readOnly={!serviceConfigEditable}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, sellingPrice: e.target.value }))
//                   }
//                   className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
//                     serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                   }`}
//                   placeholder="Selling Price"
//                 />

//                 <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 space-y-3">
//                   <h4 className="text-sm font-semibold text-gray-900">
//                     AMC / Annual Maintenance Cost
//                   </h4>
//                   <input
//                     type="text"
//                     value={form?.amc?.serviceCount ?? ''}
//                     readOnly={!serviceConfigEditable}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...(p.amc || {}),
//                           serviceCount: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="Service Count"
//                     className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
//                       serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                     }`}
//                   />
//                   <label className="flex items-center justify-between text-sm text-gray-700">
//                     <span className="inline-flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-orange-500" />
//                       Automated Service Reminders
//                     </span>
//                     <input
//                       type="checkbox"
//                       checked={!!form?.amc?.automatedServiceReminders}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           amc: {
//                             ...(p.amc || {}),
//                             automatedServiceReminders: e.target.checked,
//                           },
//                         }))
//                       }
//                       disabled={!serviceConfigEditable}
//                     />
//                   </label>
//                   <input
//                     type="text"
//                     value={form?.amc?.totalAmcFees ?? ''}
//                     readOnly={!serviceConfigEditable}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...(p.amc || {}),
//                           totalAmcFees: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="Total AMC Fees"
//                     className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
//                       serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                     }`}
//                   />
//                 </div>
//               </section> */}
//                 <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-5">
//                   {/* <div className="flex items-center justify-between">
//                   <h3 className="text-base font-semibold text-gray-900">
//                     Service Configuration
//                   </h3>

//                   <span
//                     className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
//                       serviceConfigEditable
//                         ? 'bg-emerald-100 text-emerald-700'
//                         : 'bg-gray-100 text-gray-600'
//                     }`}
//                   >
//                     {serviceConfigEditable
//                       ? 'Vendor editable'
//                       : 'Locked by admin'}
//                   </span>
//                 </div> */}

//                   {/* service fees */}
//                   <div className="space-y-2">
//                     <p className="text-sm font-semibold text-gray-900">
//                       Service Fees <span className="text-red-500">*</span>
//                     </p>

//                     <input
//                       type="text"
//                       value={form.sellingPrice || ''}
//                       readOnly={!serviceConfigEditable}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           sellingPrice: e.target.value,
//                         }))
//                       }
//                       className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-sm ${
//                         serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                       }`}
//                       placeholder="₹ Enter your price"
//                     />
//                   </div>

//                   {/* market insights */}
//                   <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 space-y-4">
//                     <div className="flex items-center justify-between">
//                       <h4 className="text-sm font-semibold text-gray-900">
//                         Market Insights
//                       </h4>

//                       <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-medium text-emerald-700">
//                         LIVE DATA
//                       </span>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div className="rounded-xl border bg-white p-3">
//                         <p className="text-xs text-gray-500 mb-1">
//                           MRP / Market Price
//                         </p>
//                         <p className="text-xl font-bold text-gray-900">
//                           {form.sellingPrice || '₹0'}
//                         </p>
//                       </div>

//                       <div className="rounded-xl border bg-white p-3">
//                         <p className="text-xs text-gray-500 mb-1">
//                           Lowest Price Online
//                         </p>
//                         <p className="text-xl font-bold text-emerald-600">
//                           {formatPriceLabel(lowestServicePrice) || '₹0'}
//                         </p>
//                       </div>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={handleMatchLowestPrice}
//                       disabled={!serviceConfigEditable}
//                       className={`w-full rounded-xl py-3 text-sm font-semibold ${
//                         serviceConfigEditable
//                           ? 'bg-orange-500 text-white hover:bg-orange-600'
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       }`}
//                     >
//                       Match Lowest Price
//                     </button>

//                     <p className="text-center text-xs text-gray-500">
//                       Auto-fill with the most competitive price online
//                     </p>
//                   </div>

//                   {/* AMC */}
//                   {/* <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 space-y-3">
//                   <h4 className="text-sm font-semibold text-gray-900">
//                     AMC / Annual Maintenance Cost
//                   </h4>

//                   <input
//                     type="text"
//                     value={form?.amc?.serviceCount ?? ''}
//                     readOnly={!serviceConfigEditable}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...(p.amc || {}),
//                           serviceCount: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="Service Count"
//                     className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm ${
//                       serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                     }`}
//                   />

//                   <label className="flex items-center justify-between text-sm text-gray-700">
//                     <span className="inline-flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-orange-500" />
//                       Automated Service Reminders
//                     </span>

//                     <input
//                       type="checkbox"
//                       checked={!!form?.amc?.automatedServiceReminders}
//                       disabled={!serviceConfigEditable}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           amc: {
//                             ...(p.amc || {}),
//                             automatedServiceReminders: e.target.checked,
//                           },
//                         }))
//                       }
//                     />
//                   </label>

//                   <input
//                     type="text"
//                     value={form?.amc?.totalAmcFees ?? ''}
//                     readOnly={!serviceConfigEditable}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...(p.amc || {}),
//                           totalAmcFees: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="Total AMC Fees"
//                     className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm ${
//                       serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                     }`}
//                   />
//                 </div> */}
//                   {/* AMC Box */}
//                   <div className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-5">
//                     <div>
//                       <h4 className="text-sm font-semibold text-gray-900">
//                         AMC ( Annual Maintenance Cost )
//                       </h4>
//                     </div>

//                     {/* Service Count */}
//                     <div className="w-full sm:w-[25%]">
//                       <p className="text-xs font-medium text-gray-700 mb-1.5">
//                         Service Count <span className="text-red-500">*</span>
//                       </p>

//                       <input
//                         type="number"
//                         min="0"
//                         value={form?.amc?.serviceCount ?? ''}
//                         readOnly={!serviceConfigEditable}
//                         onChange={(e) =>
//                           setForm((p) => ({
//                             ...p,
//                             amc: {
//                               ...(p.amc || {}),
//                               serviceCount: e.target.value,
//                             },
//                           }))
//                         }
//                         placeholder="Services / Year"
//                         className={`w-full rounded-xl border border-[#DAB2FF] px-3 py-2.5 text-sm outline-none ${
//                           serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                         }`}
//                       />
//                     </div>

//                     {/* Auto Schedule */}
//                     <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-200 p-4">
//                       <div className="flex items-start gap-3">
//                         <input
//                           type="checkbox"
//                           checked={!!form?.amc?.autoScheduleServices}
//                           disabled={!serviceConfigEditable}
//                           onChange={(e) =>
//                             setForm((p) => ({
//                               ...p,
//                               amc: {
//                                 ...(p.amc || {}),
//                                 autoScheduleServices: e.target.checked,
//                               },
//                             }))
//                           }
//                           className="mt-0.5 h-4 w-4 accent-orange-500"
//                         />

//                         <div>
//                           <h5 className="text-sm font-semibold text-gray-900">
//                             Auto-Schedule Services
//                           </h5>

//                           <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                             Divide service visits equally across months (e.g., 4
//                             services = every 3 months)
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Automated Reminders */}
//                     <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-200 p-4">
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <Bell className="h-4 w-4 text-[#8B5CF6]" />

//                           <h5 className="text-sm font-semibold text-gray-900">
//                             Automated Service Reminders
//                           </h5>
//                         </div>

//                         <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                           Send automated reminders to customers before scheduled
//                           service dates
//                         </p>
//                       </div>

//                       <button
//                         type="button"
//                         role="switch"
//                         aria-checked={!!form?.amc?.automatedServiceReminders}
//                         disabled={!serviceConfigEditable}
//                         onClick={() =>
//                           serviceConfigEditable &&
//                           setForm((p) => ({
//                             ...p,
//                             amc: {
//                               ...(p.amc || {}),
//                               automatedServiceReminders:
//                                 !p?.amc?.automatedServiceReminders,
//                             },
//                           }))
//                         }
//                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                           form?.amc?.automatedServiceReminders
//                             ? 'bg-orange-500'
//                             : 'bg-orange-200'
//                         } ${!serviceConfigEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
//                       >
//                         <span
//                           className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                             form?.amc?.automatedServiceReminders
//                               ? 'translate-x-5'
//                               : 'translate-x-0.5'
//                           }`}
//                         />
//                       </button>
//                     </div>

//                     {/* Total AMC Fees */}
//                     <div className="w-full sm:w-[25%]">
//                       <p className="text-xs font-medium text-gray-700 mb-1.5">
//                         Total AMC Fees <span className="text-red-500">*</span>
//                       </p>

//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
//                           ₹
//                         </span>

//                         <input
//                           type="number"
//                           min="0"
//                           value={form?.amc?.totalAmcFees ?? ''}
//                           readOnly={!serviceConfigEditable}
//                           onChange={(e) =>
//                             setForm((p) => ({
//                               ...p,
//                               amc: {
//                                 ...(p.amc || {}),
//                                 totalAmcFees: e.target.value,
//                               },
//                             }))
//                           }
//                           placeholder="199/-"
//                           className={`w-full rounded-xl border border-[#DAB2FF] pl-8 pr-3 py-2.5 text-sm outline-none ${
//                             serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
//                           }`}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </section>

//                 {/* Availability schedule */}
//                 {/* <div className="rounded-2xl border border-gray-200 bg-orange-50/30 p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-base font-semibold text-gray-900">
//                     Availability Schedule
//                   </h3>
//                   <span className="inline-flex items-center gap-2 text-xs text-gray-600">
//                     <span className="h-2 w-2 rounded-full bg-purple-500" />
//                     Vendor-controlled
//                   </span>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="text-left text-xs text-gray-500">
//                         <th className="py-2 pr-2">Day</th>
//                         <th className="py-2 pr-2">Available</th>
//                         <th className="py-2 pr-2">Start</th>
//                         <th className="py-2 pr-2">End</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {form.availabilitySchedule.map((s) => (
//                         <tr key={s.day} className="border-t border-gray-100">
//                           <td className="py-2 pr-2 font-medium">{s.day}</td>
//                           <td className="py-2 pr-2">
//                             <input
//                               type="checkbox"
//                               checked={!!s.isAvailable}
//                               onChange={(e) =>
//                                 updateScheduleDay(s.day, {
//                                   isAvailable: e.target.checked,
//                                 })
//                               }
//                             />
//                           </td>
//                           <td className="py-2 pr-2">
//                             <input
//                               type="time"
//                               value={s.startTime || '09:00'}
//                               onChange={(e) =>
//                                 updateScheduleTime(
//                                   s.day,
//                                   'startTime',
//                                   e.target.value,
//                                 )
//                               }
//                               className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
//                             />
//                           </td>
//                           <td className="py-2 pr-2">
//                             <input
//                               type="time"
//                               value={s.endTime || '18:00'}
//                               onChange={(e) =>
//                                 updateScheduleTime(
//                                   s.day,
//                                   'endTime',
//                                   e.target.value,
//                                 )
//                               }
//                               className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div> */}
//                 {/* Availability Schedule */}
//                 <div className="rounded-2xl border border-[#D8B4FE] bg-white p-4 sm:p-5 space-y-5">
//                   {/* Header */}
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-5 w-5 text-[#8B5CF6]" />
//                     <h3 className="text-base font-semibold text-gray-900">
//                       Availability Schedule
//                     </h3>

//                     <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600">
//                       YOUR OPERATIONS
//                     </span>
//                   </div>

//                   {/* Same Hours Toggle */}
//                   <div className="rounded-xl border border-[#D8B4FE] bg-purple-50 p-4 flex items-center justify-between">
//                     <div>
//                       <h4 className="text-sm font-semibold text-gray-900">
//                         Same Hours for All Days
//                       </h4>
//                       <p className="text-xs text-gray-500 mt-1">
//                         Apply service hours uniformly across all working days
//                       </p>
//                     </div>

//                     <button
//                       type="button"
//                       role="switch"
//                       aria-checked={form.sameHoursForAllDays}
//                       onClick={() =>
//                         setForm((p) => {
//                           const turningOn = !p.sameHoursForAllDays;
//                           if (turningOn) {
//                             const updatedSchedule = (
//                               p.availabilitySchedule || []
//                             ).map((slot) => ({
//                               ...slot,
//                               isAvailable: slot.day !== 'Sun',
//                             }));
//                             return {
//                               ...p,
//                               sameHoursForAllDays: true,
//                               availabilitySchedule: updatedSchedule,
//                               schedule: updatedSchedule,
//                             };
//                           }
//                           return { ...p, sameHoursForAllDays: false };
//                         })
//                       }
//                       className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                         form.sameHoursForAllDays
//                           ? 'bg-purple-500'
//                           : 'bg-gray-300'
//                       }`}
//                     >
//                       <span
//                         className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                           form.sameHoursForAllDays
//                             ? 'translate-x-5'
//                             : 'translate-x-0.5'
//                         }`}
//                       />
//                     </button>
//                   </div>

//                   {/* Working Days */}
//                   <div>
//                     <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
//                       Working Days
//                     </p>

//                     <div className="grid grid-cols-7 gap-2">
//                       {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
//                         (day) => {
//                           const selected = form.availabilitySchedule.find(
//                             (d) => d.day === day,
//                           )?.isAvailable;

//                           return (
//                             <button
//                               key={day}
//                               type="button"
//                               onClick={() =>
//                                 updateScheduleDay(day, {
//                                   isAvailable: !selected,
//                                 })
//                               }
//                               className={`rounded-xl py-3 text-sm font-medium border transition ${
//                                 selected
//                                   ? 'bg-orange-500 text-white border-orange-500 shadow'
//                                   : 'bg-white text-gray-500 border-gray-300'
//                               }`}
//                             >
//                               {day[0]}
//                             </button>
//                           );
//                         },
//                       )}
//                     </div>

//                     <p className="text-xs text-gray-400 mt-2">
//                       Select days you provide service
//                     </p>
//                   </div>

//                   {/* Service Hours */}
//                   <div>
//                     <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
//                       Service Hours
//                     </p>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-gray-500">
//                           Start Time
//                         </label>
//                         <input
//                           type="time"
//                           value={form.serviceStartTime || '09:00'}
//                           onChange={(e) =>
//                             setForm((p) => ({
//                               ...p,
//                               serviceStartTime: e.target.value,
//                             }))
//                           }
//                           className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                         />
//                       </div>

//                       <div>
//                         <label className="text-xs text-gray-500">
//                           End Time
//                         </label>
//                         <input
//                           type="time"
//                           value={form.serviceEndTime || '18:00'}
//                           onChange={(e) =>
//                             setForm((p) => ({
//                               ...p,
//                               serviceEndTime: e.target.value,
//                             }))
//                           }
//                           className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                         />
//                       </div>
//                     </div>

//                     <p className="text-xs text-gray-400 mt-2">
//                       Hours you are available for service bookings
//                     </p>
//                   </div>

//                   {/* Break Time */}
//                   <div>
//                     <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
//                       Break Time (Optional)
//                     </p>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="text-xs text-gray-500">
//                           Break Start
//                         </label>
//                         <input
//                           type="time"
//                           value={form.breakStart || ''}
//                           onChange={(e) =>
//                             setForm((p) => ({
//                               ...p,
//                               breakStart: e.target.value,
//                             }))
//                           }
//                           className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                         />
//                       </div>

//                       <div>
//                         <label className="text-xs text-gray-500">
//                           Break End
//                         </label>
//                         <input
//                           type="time"
//                           value={form.breakEnd || ''}
//                           onChange={(e) =>
//                             setForm((p) => ({
//                               ...p,
//                               breakEnd: e.target.value,
//                             }))
//                           }
//                           className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                         />
//                       </div>
//                     </div>

//                     <p className="text-xs text-gray-400 mt-2">
//                       No bookings will be accepted during break time
//                     </p>
//                   </div>

//                   {/* Work Duration */}
//                   <div className="w-full sm:w-[45%]">
//                     <label className="text-sm font-medium text-gray-700">
//                       Work Duration <span className="text-red-500">*</span>
//                     </label>

//                     <input
//                       type="number"
//                       min="1"
//                       value={form.workDuration || ''}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           workDuration: e.target.value,
//                         }))
//                       }
//                       placeholder="60"
//                       className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-5 mt-2 border-t border-gray-200 bg-white px-4 sm:px-5 py-3 flex justify-between gap-3">
//                   <button
//                     type="button"
//                     onClick={() => submit('draft')}
//                     className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                   >
//                     <Save className="h-4 w-4" />
//                     Save as Draft
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => submit('published')}
//                     className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//                   >
//                     <Send className="h-4 w-4" />
//                     {mode === 'edit' ? 'Update' : 'Submit for Approval'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* <VendorManualServices
//         isOpen={isManualOpen}
//         onClose={() => setIsManualOpen(false)}
//         onSubmit={async (fd) => {
//           const ok = await onSubmit?.(fd);
//           if (ok) setIsManualOpen(false);
//           return ok;
//         }}
//         lowestServicePrice={lowestServicePrice}
//         mode="create"
//         initialData={null}
//       /> */}
//       <VendorManualServices
//         isOpen={isManualOpen}
//         onClose={() => setIsManualOpen(false)}
//         onSubmit={async (fd) => {
//           const ok = await onSubmit?.(fd);
//           if (ok) setIsManualOpen(false);
//           return ok;
//         }}
//         lowestServicePrice={lowestServicePrice}
//         mode="create"
//         initialData={null}
//         prefillCategoryId={stepCategoryId}
//         prefillCategoryName={form.category}
//         prefillSubCategoryId={stepSubCategoryId}
//         prefillSubCategoryName={form.subCategory}
//       />
//     </>
//   );
// }

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { toast } from 'react-toastify';
import {
  Calendar,
  Search,
  X,
  Package,
  Tag,
  Lock,
  Bell,
  Send,
  Save,
  Wrench,
  Key,
} from 'lucide-react';
import { apiGetVendorServiceListingTemplates } from '@/service/api';
import VendorManualServices from './VendorManualServices';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, getSubCategories } from '@/redux/slices/categorySlice';
import checkWhiteIcon from '@/assets/icons/check-white.png';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function categoryOrSubAssetUrl(item) {
  const icon = String(item?.icon || '').trim();
  if (icon) return icon;
  const img = String(item?.image || '').trim();
  return img || '';
}

function defaultSchedule() {
  return DAYS.map((d) => {
    const isSun = d === 'Sun';
    return {
      day: d,
      startTime: '09:00',
      endTime: '18:00',
      isAvailable: !isSun,
    };
  });
}

function parseNumberFromText(raw) {
  const s = String(raw ?? '')
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function formatPriceLabel(n) {
  if (!Number.isFinite(n) || n <= 0) return '';
  return `₹${Math.round(n).toString()}`;
}

function joinList(items) {
  if (!Array.isArray(items)) return [];
  return items.map((x) => String(x || '').trim()).filter(Boolean);
}

function defaultAmc() {
  return {
    serviceCount: '',
    automatedServiceReminders: false,
    totalAmcFees: '',
  };
}

export default function VendorAutoServices({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  initialData = null,
  onClose,
  onSubmit, // expects FormData
  setIsManualServiceModalOpen,
}) {
  // const token = useSelector((s) => s.vendor?.token);
  // const { categories, subCategories } = useSelector((s) => s.category);
  // const dispatch = useDispatch();
  const token = useSelector((s) => s.vendor?.token);
  const { categories, subCategories } = useSelector((s) => s.category);
  const { serviceProducts: vendorServiceProducts } = useSelector(
    (s) => s.vendorServiceProduct,
  );
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesError, setTemplatesError] = useState(null);

  const [stepCategoryId, setStepCategoryId] = useState('');
  const [stepSubCategoryId, setStepSubCategoryId] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Synchronous guard — refs update instantly (unlike state), blocking
   * rapid double-clicks that fire before React re-renders the disabled
   * button from `isSubmitting` state. */
  const submitInFlightRef = useRef(false);

  const [form, setForm] = useState({
    productName: '',
    category: '',
    subCategory: '',
    images: [], // new uploads
    existingImages: [],
    serviceType: '',
    amc: defaultAmc(),
    included: [],
    excluded: [],
    sellingPrice: '',
    allowVendorEditSalePrice: false,
    schedule: defaultSchedule(),
    availabilitySchedule: defaultSchedule(),

    // add this
    sameHoursForAllDays: false,
    serviceStartTime: '09:00',
    serviceEndTime: '18:00',
    breakStart: '',
    breakEnd: '',
    workDuration: '',
  });

  const availableCategories = useMemo(() => {
    return (categories || []).filter((c) => c.availableInServices);
  }, [categories]);

  const filteredSubCats = useMemo(() => {
    const catId = String(stepCategoryId || '');
    const list = subCategories || [];
    return list.filter(
      (s) => String(s?.category || '') === catId && s.availableInServices,
    );
  }, [subCategories, stepCategoryId]);

  // const selectedTemplate = useMemo(() => {
  //   if (!selectedTemplateId) return null;
  //   return (
  //     templates.find((t) => String(t._id) === String(selectedTemplateId)) ||
  //     null
  //   );
  // }, [templates, selectedTemplateId]);

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return (
      templates.find((t) => String(t._id) === String(selectedTemplateId)) ||
      null
    );
  }, [templates, selectedTemplateId]);

  /**
   * Services the vendor has already added (in a previous session/visit),
   * keyed by name+category+sub-category since saved service products don't
   * store the source template id. Used to keep "Add" disabled/"Added"
   * across modal re-opens, not just for the current session's selection.
   */
  const alreadyAddedServiceKeys = useMemo(() => {
    const set = new Set();
    const list = Array.isArray(vendorServiceProducts)
      ? vendorServiceProducts
      : [];
    for (const p of list) {
      if (p?.createdVia !== 'template') continue;
      const key = `${String(p.productName || '')
        .trim()
        .toLowerCase()}|${String(p.category || '')
        .trim()
        .toLowerCase()}|${String(p.subCategory || '')
        .trim()
        .toLowerCase()}`;
      set.add(key);
    }
    return set;
  }, [vendorServiceProducts]);

  // const filteredTemplates = useMemo(() => {
  //   const term = templateSearch.trim().toLowerCase();
  //   const catName = form.category;
  //   const subName = form.subCategory;
  //   return templates.filter((t) => {
  //     if (catName && String(t.category) !== catName) return false;
  //     if (subName && String(t.subCategory) !== subName) return false;
  //     if (!term) return true;
  //     return (
  //       String(t.productName || '')
  //         .toLowerCase()
  //         .includes(term) ||
  //       String(t.category || '')
  //         .toLowerCase()
  //         .includes(term) ||
  //       String(t.subCategory || '')
  //         .toLowerCase()
  //         .includes(term)
  //     );
  //   });
  // }, [templates, templateSearch, form.category, form.subCategory]);
  // const filteredTemplates = useMemo(() => {
  //   const term = templateSearch.trim().toLowerCase();
  //   return templates.filter((t) => {
  //     if (!term) return true;
  //     return (
  //       String(t.productName || '')
  //         .toLowerCase()
  //         .includes(term) ||
  //       String(t.category || '')
  //         .toLowerCase()
  //         .includes(term) ||
  //       String(t.subCategory || '')
  //         .toLowerCase()
  //         .includes(term)
  //     );
  //   });
  // }, [templates, templateSearch]);

  const filteredTemplates = useMemo(() => {
    const term = templateSearch.trim().toLowerCase();
    const catName = String(form.category || '')
      .trim()
      .toLowerCase();
    const subName = String(form.subCategory || '')
      .trim()
      .toLowerCase();
    return templates
      .filter((t) => {
        if (catName) {
          const tCat = String(t.category || '')
            .trim()
            .toLowerCase();
          if (tCat !== catName) return false;
        }
        if (subName) {
          const tSub = String(t.subCategory || '')
            .trim()
            .toLowerCase();
          if (tSub !== subName) return false;
        }
        return true;
      })
      .filter((t) => {
        if (!term) return true;
        return (
          String(t.productName || '')
            .toLowerCase()
            .includes(term) ||
          String(t.category || '')
            .toLowerCase()
            .includes(term) ||
          String(t.subCategory || '')
            .toLowerCase()
            .includes(term)
        );
      });
  }, [templates, templateSearch, form.category, form.subCategory]);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(getCategories());

    setStepCategoryId('');
    setStepSubCategoryId('');
    setTemplateSearch('');
    setSelectedTemplateId(null);
    setTemplatesError(null);
    setLoading(false);
    setTemplates([]);

    const nextSchedule = defaultSchedule();
    setForm({
      productName: '',
      category: '',
      subCategory: '',
      images: [],
      existingImages: [],
      serviceType: '',
      amc: defaultAmc(),
      included: [],
      excluded: [],
      sellingPrice: '',
      allowVendorEditSalePrice: false,
      schedule: nextSchedule,
      availabilitySchedule: nextSchedule,

      sameHoursForAllDays: false,
      serviceStartTime: '09:00',
      serviceEndTime: '18:00',
      breakStart: '',
      breakEnd: '',
      workDuration: '',
    });

    // Load admin templates (active only)
    if (token) {
      setLoading(true);
      apiGetVendorServiceListingTemplates(token)
        .then((res) => {
          setTemplates(res.data?.serviceListingTemplates || []);
        })
        .catch((e) => {
          setTemplatesError(
            e?.response?.data?.message || 'Failed to load services',
          );
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, token]);

  // useEffect(() => {
  //   if (!isOpen || mode !== 'edit' || !initialData) return;
  //   // Prefill for edit mode from vendor service product
  //   const existingImages = Array.isArray(initialData.images)
  //     ? initialData.images
  //     : initialData.image
  //       ? [initialData.image]
  //       : [];

  //   const sched = Array.isArray(initialData.availabilitySchedule)
  //     ? initialData.availabilitySchedule
  //     : defaultSchedule();

  //   const meta = initialData.serviceMeta || {};
  //   const included = joinList(meta.included);
  //   const excluded = joinList(meta.excluded);
  //   const amc = {
  //     serviceCount: String(meta?.amc?.serviceCount ?? ''),
  //     automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
  //     totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
  //   };
  //   const firstAvailable = sched.find((s) => s.isAvailable) || sched[0];

  //   setSelectedTemplateId(null);
  //   setStepCategoryId(''); // not used in edit mode UI
  //   setStepSubCategoryId('');
  //   setForm({
  //     productName: initialData.productName || '',
  //     category: initialData.category || '',
  //     subCategory: initialData.subCategory || '',
  //     images: [],
  //     existingImages,
  //     serviceType: meta.serviceType || initialData.serviceType || '',
  //     amc,
  //     included,
  //     excluded,
  //     sellingPrice: initialData.price || '',
  //     allowVendorEditSalePrice:
  //       initialData?.salesConfiguration?.allowVendorEditSalePrice !== false,
  //     schedule: sched,
  //     availabilitySchedule: sched,
  //     sameHoursForAllDays: false,
  //     serviceStartTime: firstAvailable?.startTime || '09:00',
  //     serviceEndTime: firstAvailable?.endTime || '18:00',
  //     breakStart: firstAvailable?.breakStart || '',
  //     breakEnd: firstAvailable?.breakEnd || '',
  //     workDuration: firstAvailable?.workDuration || '',
  //   });
  // }, [isOpen, mode, initialData]);

  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !initialData) return;

    const existingImages = Array.isArray(initialData.images)
      ? initialData.images
      : initialData.image
        ? [initialData.image]
        : [];

    const sched = Array.isArray(initialData.availabilitySchedule)
      ? initialData.availabilitySchedule
      : defaultSchedule();

    const meta = initialData.serviceMeta || {};
    const included = joinList(meta.included);
    const excluded = joinList(meta.excluded);
    const amc = {
      serviceCount: String(meta?.amc?.serviceCount ?? ''),
      automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
      totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
    };
    const firstAvailable = sched.find((s) => s.isAvailable) || sched[0];

    setSelectedTemplateId(null);

    // Find and set matching category
    const matchedCat = (categories || []).find(
      (c) =>
        String(c.name).toLowerCase() ===
        String(initialData.category || '').toLowerCase(),
    );
    if (matchedCat) {
      setStepCategoryId(matchedCat._id);
      dispatch(getSubCategories(matchedCat._id));
    } else {
      setStepCategoryId('');
    }

    // Find and set matching subcategory after subcategories load
    setTimeout(() => {
      const matchedSub = (subCategories || []).find(
        (s) =>
          String(s.name).toLowerCase() ===
          String(initialData.subCategory || '').toLowerCase(),
      );
      if (matchedSub) setStepSubCategoryId(matchedSub._id);
      else setStepSubCategoryId('');
    }, 400);

    setForm({
      productName: initialData.productName || '',
      category: initialData.category || '',
      subCategory: initialData.subCategory || '',
      images: [],
      existingImages,
      serviceType: meta.serviceType || initialData.serviceType || '',
      amc,
      included,
      excluded,
      sellingPrice: initialData.price || '',
      allowVendorEditSalePrice:
        initialData?.salesConfiguration?.allowVendorEditSalePrice !== false,
      schedule: sched,
      availabilitySchedule: sched,
      sameHoursForAllDays: false,
      serviceStartTime: firstAvailable?.startTime || '09:00',
      serviceEndTime: firstAvailable?.endTime || '18:00',
      breakStart: firstAvailable?.breakStart || '',
      breakEnd: firstAvailable?.breakEnd || '',
      workDuration: firstAvailable?.workDuration || '',
    });
  }, [isOpen, mode, initialData, categories]);

  // const applyCategory = (catId) => {
  //   setStepCategoryId(catId);
  //   const cat = (categories || []).find((c) => String(c._id) === String(catId));
  //   setStepSubCategoryId('');
  //   setForm((p) => ({
  //     ...p,
  //     category: cat?.name || '',
  //     subCategory: '',
  //     productName: '',
  //     existingImages: [],
  //     included: [],
  //     excluded: [],
  //     sellingPrice: '',
  //     serviceType: '',
  //     amc: defaultAmc(),
  //   }));
  // };
  const applyCategory = (catId) => {
    setStepCategoryId(catId);
    const cat = (categories || []).find((c) => String(c._id) === String(catId));
    setStepSubCategoryId('');
    setForm((p) => ({
      ...p,
      category: cat?.name || '',
      subCategory: '',
      productName: '',
      existingImages: [],
      included: [],
      excluded: [],
      sellingPrice: '',
      serviceType: '',
      amc: defaultAmc(),
    }));
    if (catId) dispatch(getSubCategories(catId));
  };

  const applySubCategory = (subId) => {
    setStepSubCategoryId(subId);
    const sub = (subCategories || []).find(
      (s) => String(s._id) === String(subId),
    );
    setForm((p) => ({
      ...p,
      subCategory: sub?.name || '',
    }));
  };

  // const selectTemplate = (t) => {
  //   setSelectedTemplateId(t._id);
  //   setForm((prev) => {
  //     const meta = t.serviceMeta || {};
  //     const included = joinList(meta.included);
  //     const excluded = joinList(meta.excluded);
  //     const amc = {
  //       serviceCount: String(meta?.amc?.serviceCount ?? ''),
  //       automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
  //       totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
  //     };

  //     const salePrice = parseNumberFromText(
  //       t?.salesConfiguration?.salePrice || '',
  //     );

  //     const fallbackPrice =
  //       salePrice > 0
  //         ? salePrice
  //         : parseNumberFromText(t?.variants?.[0]?.price || '');
  //     const priceLabel = formatPriceLabel(fallbackPrice) || '';

  //     const schedule = defaultSchedule();
  //     return {
  //       ...prev,
  //       productName: t.productName || '',
  //       category: t.category || '',
  //       subCategory: t.subCategory || '',
  //       existingImages: Array.isArray(t.images) ? t.images.filter(Boolean) : [],
  //       images: [],
  //       serviceType: meta.serviceType || '',
  //       amc,
  //       included: included.length ? included : prev.included,
  //       excluded: excluded.length ? excluded : prev.excluded,
  //       sellingPrice: priceLabel,
  //       allowVendorEditSalePrice:
  //         t?.salesConfiguration?.allowVendorEditSalePrice !== false,
  //       schedule,
  //       availabilitySchedule: schedule,
  //     };
  //   });
  // };

  const selectTemplate = (t) => {
    setSelectedTemplateId(t._id);

    // Auto-select the matching category
    const matchedCat = (categories || []).find(
      (c) =>
        String(c.name).toLowerCase() === String(t.category || '').toLowerCase(),
    );
    if (matchedCat) {
      setStepCategoryId(matchedCat._id);
      dispatch(getSubCategories(matchedCat._id));
    }

    // Auto-select the matching subCategory after a tick
    setTimeout(() => {
      const matchedSub = (subCategories || []).find(
        (s) =>
          String(s.name).toLowerCase() ===
          String(t.subCategory || '').toLowerCase(),
      );
      if (matchedSub) setStepSubCategoryId(matchedSub._id);
    }, 300);

    setForm((prev) => {
      const meta = t.serviceMeta || {};
      const included = joinList(meta.included);
      const excluded = joinList(meta.excluded);
      const amc = {
        serviceCount: String(meta?.amc?.serviceCount ?? ''),
        automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
        totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
      };

      const salePrice = parseNumberFromText(
        t?.salesConfiguration?.salePrice || '',
      );
      const fallbackPrice =
        salePrice > 0
          ? salePrice
          : parseNumberFromText(t?.variants?.[0]?.price || '');
      const priceLabel = formatPriceLabel(fallbackPrice) || '';

      const schedule = defaultSchedule();
      return {
        ...prev,
        productName: t.productName || '',
        category: t.category || '',
        subCategory: t.subCategory || '',
        existingImages: Array.isArray(t.images) ? t.images.filter(Boolean) : [],
        images: [],
        serviceType: meta.serviceType || '',
        amc,
        included: included.length ? included : prev.included,
        excluded: excluded.length ? excluded : prev.excluded,
        sellingPrice: priceLabel,
        allowVendorEditSalePrice:
          t?.salesConfiguration?.allowVendorEditSalePrice !== false,
        schedule,
        availabilitySchedule: schedule,
      };
    });
  };

  const updateScheduleDay = (day, patch) => {
    setForm((p) => {
      const next = (p.availabilitySchedule || []).map((x) =>
        x.day === day ? { ...x, ...patch } : x,
      );
      return { ...p, availabilitySchedule: next, schedule: next };
    });
  };

  const updateScheduleTime = (day, key, value) => {
    updateScheduleDay(day, { [key]: value });
  };

  const submit = async (submissionStatus) => {
    if (submitInFlightRef.current) return;
    if (!form.category.trim()) return toast.error('Select category');
    if (!form.subCategory.trim()) return toast.error('Select sub-category');
    if (!form.productName.trim()) return toast.error('Select service');
    if (!form.existingImages?.length && !form.images?.length) {
      return toast.error('Service media is missing');
    }
    if (!form.sellingPrice.trim()) return toast.error('Service fees missing');
    if (!String(form.workDuration || '').trim()) {
      return toast.error('Work Duration is required');
    }
    if (mode === 'create' && !selectedTemplate?._id) {
      return toast.error('Select service using Add button');
    }
    submitInFlightRef.current = true;
    setIsSubmitting(true);

    const priceNum = parseNumberFromText(form.sellingPrice);

    const fd = new FormData();
    fd.append('productName', form.productName);
    fd.append('type', 'Service');
    fd.append('category', form.category);
    fd.append('subCategory', form.subCategory);
    fd.append('brand', '');
    fd.append('condition', 'Brand New');
    fd.append('shortDescription', '');
    fd.append('description', '');
    fd.append('specifications', JSON.stringify({}));
    fd.append('productCustomSpecs', JSON.stringify([]));

    fd.append(
      'salesConfiguration',
      JSON.stringify({
        allowVendorEditSalePrice: !!form.allowVendorEditSalePrice,
        salePrice: priceNum,
        mrpPrice: priceNum,
      }),
    );
    fd.append(
      'serviceMeta',
      JSON.stringify({
        serviceType: form.serviceType || '',
        amc: {
          serviceCount: Number(form?.amc?.serviceCount || 0),
          automatedServiceReminders: !!form?.amc?.automatedServiceReminders,
          totalAmcFees: Number(form?.amc?.totalAmcFees || 0),
        },
        included: form.included || [],
        excluded: form.excluded || [],
      }),
    );
    // fd.append(
    //   'availabilitySchedule',
    //   JSON.stringify(form.availabilitySchedule || []),
    // );

    const finalSchedule = (form.availabilitySchedule || []).map((slot) => ({
      ...slot,
      startTime: slot.isAvailable
        ? form.serviceStartTime || slot.startTime
        : slot.startTime,
      endTime: slot.isAvailable
        ? form.serviceEndTime || slot.endTime
        : slot.endTime,
      breakStart: form.breakStart || '',
      breakEnd: form.breakEnd || '',
      workDuration: form.workDuration || '',
    }));

    fd.append('availabilitySchedule', JSON.stringify(finalSchedule));

    fd.append(
      'logisticsVerification',
      JSON.stringify({ inventoryOwnerName: '', city: '' }),
    );
    fd.append('refundableDeposit', '0');

    fd.append('existingImages', JSON.stringify(form.existingImages || []));
    fd.append('price', form.sellingPrice);
    fd.append('stock', '1');
    fd.append('submissionStatus', submissionStatus);
    fd.append('createdVia', 'template');
    if (selectedTemplate?._id) {
      fd.append('serviceTemplateId', selectedTemplate._id);
    }

    try {
      await onSubmit?.(fd);
      toast.success(
        mode === 'edit'
          ? 'Service updated successfully'
          : submissionStatus === 'draft'
            ? 'Draft saved successfully'
            : 'Service submitted for approval',
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
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const serviceConfigEditable = !!form.allowVendorEditSalePrice;
  const lowestServicePrice = useMemo(() => {
    if (!templates?.length) return 0;

    const prices = templates
      .map((t) =>
        parseNumberFromText(
          t?.salesConfiguration?.salePrice || t?.variants?.[0]?.price || 0,
        ),
      )
      .filter((p) => p > 0);

    return prices.length ? Math.min(...prices) : 0;
  }, [templates]);

  const handleMatchLowestPrice = () => {
    if (!serviceConfigEditable) return;

    setForm((prev) => ({
      ...prev,
      sellingPrice: formatPriceLabel(lowestServicePrice),
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 ${isManualOpen ? 'hidden' : ''}`}
      >
        <div className="flex min-h-0 w-full max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl  bg-white shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'edit' ? 'Edit Service' : 'Add New Service'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select an admin-created service and set your availability.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-5">
            <div className="space-y-4">
              {/* Service type selector cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      Sell Product
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                      One-time purchase
                    </p>
                  </div>
                </div> */}

                <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
                  <Tag className="h-6 w-6 text-gray-500 flex-shrink-0" />

                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      Sell Product
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                      One-time purchase
                    </p>
                  </div>
                </div>

                {/* 
                <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      Rent Out
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                      Monthly rental
                    </p>
                  </div>
                </div> */}
                <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
                  <Key className="h-6 w-6 text-gray-500 flex-shrink-0" />

                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      Rent Out
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                      Monthly rental
                    </p>
                  </div>
                </div>

                {/* <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-4 text-center ring-1 ring-blue-200">
                  <p className="text-sm font-semibold text-blue-600">
                    Offer Service
                  </p>
                  <p className="text-[11px] leading-snug text-gray-500">
                    Hourly / fixed
                  </p>
                </div> */}

                <div className="flex items-center justify-center gap-4 rounded-xl border-2 border-blue-500 bg-white px-6 py-6 shadow-md">
                  <Wrench className="h-6 w-6 text-gray-600" strokeWidth={2.2} />

                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-blue-600">
                      Offer Service
                    </p>
                    <p className="text-[11px]  text-gray-500">
                      Hourly / Fixed rate
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/70">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-gray-900">
                        What are you servicing?
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select category to see relevant fields
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Step 1: Main Category{' '}
                      <span className="text-red-500">*</span>
                    </p>
                    {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {availableCategories.map((c) => {
                      const selected = String(stepCategoryId) === String(c._id);
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => applyCategory(c._id)}
                          className={`rounded-lg border px-3 py-2 text-left transition ${
                            selected ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <p className={`text-sm font-medium ${selected ? 'text-orange-600' : 'text-gray-700'}`}>
                            {c.name}
                          </p>
                        </button>
                      );
                    })}
                  </div> */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                      {availableCategories.map((c) => {
                        const selected =
                          String(stepCategoryId) === String(c._id);
                        const asset = categoryOrSubAssetUrl(c);
                        return (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => applyCategory(c._id)}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
                              selected
                                ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
                            }`}
                          >
                            {asset ? (
                              <img
                                src={asset}
                                alt=""
                                className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${selected ? '' : 'opacity-90'}`}
                              />
                            ) : (
                              <Package
                                className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
                                strokeWidth={1.75}
                              />
                            )}
                            <span
                              className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${selected ? 'text-orange-600' : 'text-gray-600'}`}
                            >
                              {c.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Step 2: Sub Category{' '}
                      <span className="text-red-500">*</span>
                    </p>
                    {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                    {filteredSubCats.map((s) => {
                      const selected =
                        String(stepSubCategoryId) === String(s._id);
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => applySubCategory(s._id)}
                          className={`rounded-lg border px-3 py-2 text-left transition ${
                            selected
                              ? 'border-orange-300 bg-orange-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${selected ? 'text-orange-600' : 'text-gray-700'}`}
                          >
                            {s.name}
                          </p>
                        </button>
                      );
                    })}
                  </div> */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-3">
                      {filteredSubCats.map((s) => {
                        const selected =
                          String(stepSubCategoryId) === String(s._id);
                        const asset = categoryOrSubAssetUrl(s);
                        return (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => applySubCategory(s._id)}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
                              selected
                                ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
                            }`}
                          >
                            {asset ? (
                              <img
                                src={asset}
                                alt=""
                                className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${selected ? '' : 'opacity-90'}`}
                              />
                            ) : (
                              <Package
                                className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
                                strokeWidth={1.75}
                              />
                            )}
                            <span
                              className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${selected ? 'text-orange-600' : 'text-gray-600'}`}
                            >
                              {s.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="search"
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          placeholder="Search service by name..."
                          className="w-full rounded-lg border border-gray-200 bg-white px-9 py-2 text-sm outline-none"
                        />
                      </div>
                      {mode === 'create' ? (
                        <button
                          type="button"
                          // onClick={() => setIsManualServiceModalOpen(true)}.
                          onClick={() => setIsManualOpen(true)}
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 shrink-0"
                        >
                          + Custom Listing
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {templatesError ? (
                    <p className="text-sm text-red-600">{templatesError}</p>
                  ) : null}

                  {loading ? (
                    <p className="text-sm text-gray-500">Loading services…</p>
                  ) : null}

                  <div className="max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
                    {!loading && filteredTemplates.length === 0 ? (
                      <p className="p-8 text-center text-sm text-gray-500">
                        No services found for this selection.
                      </p>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
                          <tr>
                            <th className="px-3 py-2 font-medium">Service</th>
                            <th className="px-3 py-2 font-medium hidden sm:table-cell">
                              Category
                            </th>
                            <th className="px-3 py-2 font-medium hidden md:table-cell">
                              Sub-category
                            </th>
                            <th className="px-3 py-2 font-medium w-24 text-right">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {/* {filteredTemplates.map((t) => {
                            const selected =
                              String(selectedTemplateId) === String(t._id);
                            return (
                              <tr key={t._id} className="hover:bg-gray-50/80"> */}
                          {filteredTemplates.map((t) => {
                            const templateKey = `${String(t.productName || '')
                              .trim()
                              .toLowerCase()}|${String(t.category || '')
                              .trim()
                              .toLowerCase()}|${String(t.subCategory || '')
                              .trim()
                              .toLowerCase()}`;
                            const selected =
                              String(selectedTemplateId) === String(t._id) ||
                              alreadyAddedServiceKeys.has(templateKey);
                            return (
                              <tr key={t._id} className="hover:bg-gray-50/80">
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={
                                        (t.images && t.images[0]) ||
                                        t.image ||
                                        'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
                                      }
                                      alt={t.productName}
                                      className="h-11 w-11 rounded-lg object-cover border border-gray-100"
                                    />
                                    <p className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-none">
                                      {t.productName}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-3 py-2 hidden sm:table-cell text-gray-600">
                                  {t.category || '—'}
                                </td>
                                <td className="px-3 py-2 hidden md:table-cell text-gray-600">
                                  {t.subCategory || '—'}
                                </td>
                                {/* <td className="px-3 py-2 text-right">
                                  {selected ? (
                                    <span className="text-sm font-medium text-emerald-600">
                                      Added
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => selectTemplate(t)}
                                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                      Add
                                    </button>
                                  )}
                                </td> */}

                                <td className="px-3 py-2 text-right">
                                  {selected ? (
                                    <button
                                      type="button"
                                      disabled
                                      title="You have already added this service"
                                      className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 cursor-not-allowed"
                                    >
                                      Added
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => selectTemplate(t)}
                                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                      Add
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic details & fees */}

              <div className="rounded-2xl   shadow-sm overflow-hidden">
                {/* <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Product Media
                  </p>
                  <div className="w-full">
                    {form.existingImages?.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {form.existingImages.slice(0, 6).map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt=""
                            className="w-full h-36 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No media selected.
                      </p>
                    )}
                  </div>
                </div> */}

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      What will be included
                    </p>
                    <textarea
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm min-h-[100px] text-gray-700"
                      value={(form.included || []).join('\n')}
                      readOnly
                      placeholder="Enter included items (one per line)"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      What will be excluded
                    </p>
                    <textarea
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm min-h-[100px] text-gray-700"
                      value={(form.excluded || []).join('\n')}
                      readOnly
                      placeholder="Enter excluded items (one per line)"
                    />
                  </div>
                </div> */}

                {/* Product Media */}

                <div className="rounded-2xl p-1 sm:p-5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Product Media
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#D1D5DC] bg-[#F9FAFB] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-[#64748B] bg-white">
                          <Lock className="h-3 w-3 text-[#64748B]" />
                        </div>
                      </div>
                      {/* 
                    <span className="rounded-full bg-[#10B981] px-3 py-1 text-xs font-medium text-white">
                      Catalog Images
                    </span> */}
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-3 py-1 text-xs font-medium text-white">
                        <img
                          src={checkWhiteIcon.src}
                          alt="Check"
                          className="w-3.5 h-3.5 shrink-0"
                        />
                        Catalog Images
                      </span>
                    </div>
                    {form.existingImages?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {form.existingImages.slice(0, 6).map((src, i) => (
                          <div
                            key={i}
                            className="relative overflow-hidden rounded-xl border border-gray-200"
                          >
                            <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                              {i + 1}
                            </span>

                            <img
                              src={src}
                              alt=""
                              className="h-72 w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No media selected.
                      </p>
                    )}
                  </div>
                </div>

                {/* Included / Excluded */}
                <div className="rounded-2xl border border-[#D1D5DC] bg-[#F9FAFB] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-[#64748B] bg-white">
                        <Lock className="h-3 w-3 text-[#64748B]" />
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                      <img
                        src={checkWhiteIcon.src}
                        alt="Check"
                        className="w-3.5 h-3.5 shrink-0"
                      />
                      Verified Specs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl p-4">
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#364153]">
                        What is included
                      </p>

                      {/* <textarea
                        readOnly
                        value={(form.included || []).join('\n')}
                        className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
                      />
                    </div>

                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#364153]">
                        What is not included
                      </p>

                      <textarea
                        readOnly
                        value={(form.excluded || []).join('\n')}
                        className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
                      /> */}
                      <textarea
                        readOnly={!serviceConfigEditable}
                        value={(form.included || []).join('\n')}
                        onChange={(e) =>
                          serviceConfigEditable &&
                          setForm((p) => ({
                            ...p,
                            included: e.target.value.split('\n'),
                          }))
                        }
                        className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
                      />
                    </div>

                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#364153]">
                        What is not included
                      </p>

                      <textarea
                        readOnly={!serviceConfigEditable}
                        value={(form.excluded || []).join('\n')}
                        onChange={(e) =>
                          serviceConfigEditable &&
                          setForm((p) => ({
                            ...p,
                            excluded: e.target.value.split('\n'),
                          }))
                        }
                        className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-[#364153] outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/70">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-gray-900">
                        Service Fees Configuration
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Set pricing and inventory details
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Specific Service Type{' '}
                    <span className="text-red-500">*</span>
                  </p>
                  <input
                    type="text"
                    value={form.serviceType}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    placeholder="Service Type"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Service Fees *
                  </p>
                  <input
                    type="text"
                    value={form.sellingPrice}
                    readOnly={!serviceConfigEditable}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sellingPrice: e.target.value }))
                    }
                    className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
                      serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                    }`}
                    placeholder="₹ 145000"
                  />
                </div>
              </div> */}
                <div className="flex flex-col gap-3">
                  <div className="w-full sm:w-1/2">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Specific Service Type{' '}
                      <span className="text-red-500">*</span>
                    </p>
                    {/* <input
                      type="text"
                      value={form.serviceType}
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                      placeholder="Service Type"
                    /> */}
                    <input
                      type="text"
                      value={form.serviceType}
                      readOnly={!serviceConfigEditable}
                      onChange={(e) =>
                        serviceConfigEditable &&
                        setForm((p) => ({ ...p, serviceType: e.target.value }))
                      }
                      className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
                        serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                      }`}
                      placeholder="Service Type"
                    />
                  </div>

                  {/* <div className="w-full sm:w-1/2">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Service Fees <span className="text-red-500">*</span>
                    </p>
                    <input
                      type="text"
                      value={form.sellingPrice}
                      readOnly={!serviceConfigEditable}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          sellingPrice: e.target.value,
                        }))
                      }
                      className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
                        serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                      }`}
                      placeholder="₹ 145000"
                    />
                  </div> */}
                </div>

                {/* <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Service Configuration
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      serviceConfigEditable
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {serviceConfigEditable
                      ? 'Vendor editable'
                      : 'Locked by admin'}
                  </span>
                </div>

                <input
                  type="text"
                  value={form.sellingPrice || ''}
                  readOnly={!serviceConfigEditable}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sellingPrice: e.target.value }))
                  }
                  className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
                    serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                  }`}
                  placeholder="Selling Price"
                />

                <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    AMC / Annual Maintenance Cost
                  </h4>
                  <input
                    type="text"
                    value={form?.amc?.serviceCount ?? ''}
                    readOnly={!serviceConfigEditable}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...(p.amc || {}),
                          serviceCount: e.target.value,
                        },
                      }))
                    }
                    placeholder="Service Count"
                    className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
                      serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                  <label className="flex items-center justify-between text-sm text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Automated Service Reminders
                    </span>
                    <input
                      type="checkbox"
                      checked={!!form?.amc?.automatedServiceReminders}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          amc: {
                            ...(p.amc || {}),
                            automatedServiceReminders: e.target.checked,
                          },
                        }))
                      }
                      disabled={!serviceConfigEditable}
                    />
                  </label>
                  <input
                    type="text"
                    value={form?.amc?.totalAmcFees ?? ''}
                    readOnly={!serviceConfigEditable}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...(p.amc || {}),
                          totalAmcFees: e.target.value,
                        },
                      }))
                    }
                    placeholder="Total AMC Fees"
                    className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 ${
                      serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
              </section> */}
                <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-5">
                  {/* <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Service Configuration
                  </h3>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      serviceConfigEditable
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {serviceConfigEditable
                      ? 'Vendor editable'
                      : 'Locked by admin'}
                  </span>
                </div> */}

                  {/* service fees */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Service Fees <span className="text-red-500">*</span>
                    </p>

                    <input
                      type="text"
                      value={form.sellingPrice || ''}
                      readOnly={!serviceConfigEditable}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          sellingPrice: e.target.value,
                        }))
                      }
                      className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-sm ${
                        serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                      }`}
                      placeholder="₹ Enter your price"
                    />
                  </div>

                  {/* market insights */}
                  <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Market Insights
                      </h4>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-medium text-emerald-700">
                        LIVE DATA
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border bg-white p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          MRP / Market Price
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {form.sellingPrice || '₹0'}
                        </p>
                      </div>

                      <div className="rounded-xl border bg-white p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          Lowest Price Online
                        </p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatPriceLabel(lowestServicePrice) || '₹0'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleMatchLowestPrice}
                      disabled={!serviceConfigEditable}
                      className={`w-full rounded-xl py-3 text-sm font-semibold ${
                        serviceConfigEditable
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Match Lowest Price
                    </button>

                    <p className="text-center text-xs text-gray-500">
                      Auto-fill with the most competitive price online
                    </p>
                  </div>

                  {/* AMC */}
                  {/* <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    AMC / Annual Maintenance Cost
                  </h4>

                  <input
                    type="text"
                    value={form?.amc?.serviceCount ?? ''}
                    readOnly={!serviceConfigEditable}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...(p.amc || {}),
                          serviceCount: e.target.value,
                        },
                      }))
                    }
                    placeholder="Service Count"
                    className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm ${
                      serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />

                  <label className="flex items-center justify-between text-sm text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Automated Service Reminders
                    </span>

                    <input
                      type="checkbox"
                      checked={!!form?.amc?.automatedServiceReminders}
                      disabled={!serviceConfigEditable}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          amc: {
                            ...(p.amc || {}),
                            automatedServiceReminders: e.target.checked,
                          },
                        }))
                      }
                    />
                  </label>

                  <input
                    type="text"
                    value={form?.amc?.totalAmcFees ?? ''}
                    readOnly={!serviceConfigEditable}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...(p.amc || {}),
                          totalAmcFees: e.target.value,
                        },
                      }))
                    }
                    placeholder="Total AMC Fees"
                    className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm ${
                      serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div> */}
                  {/* AMC Box */}
                  <div className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        AMC ( Annual Maintenance Cost )
                      </h4>
                    </div>

                    {/* Service Count */}
                    <div className="w-full sm:w-[25%]">
                      <p className="text-xs font-medium text-gray-700 mb-1.5">
                        Service Count <span className="text-red-500">*</span>
                      </p>

                      <input
                        type="number"
                        min="0"
                        value={form?.amc?.serviceCount ?? ''}
                        readOnly={!serviceConfigEditable}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            amc: {
                              ...(p.amc || {}),
                              serviceCount: e.target.value,
                            },
                          }))
                        }
                        placeholder="Services / Year"
                        className={`w-full rounded-xl border border-[#DAB2FF] px-3 py-2.5 text-sm outline-none ${
                          serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                        }`}
                      />
                    </div>

                    {/* Auto Schedule */}
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-200 p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!!form?.amc?.autoScheduleServices}
                          disabled={!serviceConfigEditable}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              amc: {
                                ...(p.amc || {}),
                                autoScheduleServices: e.target.checked,
                              },
                            }))
                          }
                          className="mt-0.5 h-4 w-4 accent-orange-500"
                        />

                        <div>
                          <h5 className="text-sm font-semibold text-gray-900">
                            Auto-Schedule Services
                          </h5>

                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Divide service visits equally across months (e.g., 4
                            services = every 3 months)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Automated Reminders */}
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-200 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-[#8B5CF6]" />

                          <h5 className="text-sm font-semibold text-gray-900">
                            Automated Service Reminders
                          </h5>
                        </div>

                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Send automated reminders to customers before scheduled
                          service dates
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={!!form?.amc?.automatedServiceReminders}
                        disabled={!serviceConfigEditable}
                        onClick={() =>
                          serviceConfigEditable &&
                          setForm((p) => ({
                            ...p,
                            amc: {
                              ...(p.amc || {}),
                              automatedServiceReminders:
                                !p?.amc?.automatedServiceReminders,
                            },
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          form?.amc?.automatedServiceReminders
                            ? 'bg-orange-500'
                            : 'bg-orange-200'
                        } ${!serviceConfigEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                            form?.amc?.automatedServiceReminders
                              ? 'translate-x-5'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Total AMC Fees */}
                    <div className="w-full sm:w-[25%]">
                      <p className="text-xs font-medium text-gray-700 mb-1.5">
                        Total AMC Fees <span className="text-red-500">*</span>
                      </p>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={form?.amc?.totalAmcFees ?? ''}
                          readOnly={!serviceConfigEditable}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              amc: {
                                ...(p.amc || {}),
                                totalAmcFees: e.target.value,
                              },
                            }))
                          }
                          placeholder="199/-"
                          className={`w-full rounded-xl border border-[#DAB2FF] pl-8 pr-3 py-2.5 text-sm outline-none ${
                            serviceConfigEditable ? 'bg-white' : 'bg-gray-50'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Availability schedule */}
                {/* <div className="rounded-2xl border border-gray-200 bg-orange-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Availability Schedule
                  </h3>
                  <span className="inline-flex items-center gap-2 text-xs text-gray-600">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Vendor-controlled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th className="py-2 pr-2">Day</th>
                        <th className="py-2 pr-2">Available</th>
                        <th className="py-2 pr-2">Start</th>
                        <th className="py-2 pr-2">End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.availabilitySchedule.map((s) => (
                        <tr key={s.day} className="border-t border-gray-100">
                          <td className="py-2 pr-2 font-medium">{s.day}</td>
                          <td className="py-2 pr-2">
                            <input
                              type="checkbox"
                              checked={!!s.isAvailable}
                              onChange={(e) =>
                                updateScheduleDay(s.day, {
                                  isAvailable: e.target.checked,
                                })
                              }
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="time"
                              value={s.startTime || '09:00'}
                              onChange={(e) =>
                                updateScheduleTime(
                                  s.day,
                                  'startTime',
                                  e.target.value,
                                )
                              }
                              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="time"
                              value={s.endTime || '18:00'}
                              onChange={(e) =>
                                updateScheduleTime(
                                  s.day,
                                  'endTime',
                                  e.target.value,
                                )
                              }
                              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div> */}
                {/* Availability Schedule */}
                <div className="rounded-2xl border border-[#D8B4FE] bg-white p-4 sm:p-5 space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#8B5CF6]" />
                    <h3 className="text-base font-semibold text-gray-900">
                      Availability Schedule
                    </h3>

                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                      YOUR OPERATIONS
                    </span>
                  </div>

                  {/* Same Hours Toggle */}
                  <div className="rounded-xl border border-[#D8B4FE] bg-purple-50 p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Same Hours for All Days
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Apply service hours uniformly across all working days
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.sameHoursForAllDays}
                      onClick={() =>
                        setForm((p) => {
                          const turningOn = !p.sameHoursForAllDays;
                          if (turningOn) {
                            const updatedSchedule = (
                              p.availabilitySchedule || []
                            ).map((slot) => ({
                              ...slot,
                              isAvailable: slot.day !== 'Sun',
                            }));
                            return {
                              ...p,
                              sameHoursForAllDays: true,
                              availabilitySchedule: updatedSchedule,
                              schedule: updatedSchedule,
                            };
                          }
                          return { ...p, sameHoursForAllDays: false };
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        form.sameHoursForAllDays
                          ? 'bg-purple-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          form.sameHoursForAllDays
                            ? 'translate-x-5'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Working Days */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                      Working Days
                    </p>

                    <div className="grid grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                        (day) => {
                          const selected = form.availabilitySchedule.find(
                            (d) => d.day === day,
                          )?.isAvailable;

                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() =>
                                updateScheduleDay(day, {
                                  isAvailable: !selected,
                                })
                              }
                              className={`rounded-xl py-3 text-sm font-medium border transition ${
                                selected
                                  ? 'bg-orange-500 text-white border-orange-500 shadow'
                                  : 'bg-white text-gray-500 border-gray-300'
                              }`}
                            >
                              {day[0]}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Select days you provide service
                    </p>
                  </div>

                  {/* Service Hours */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                      Service Hours
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={form.serviceStartTime || '09:00'}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              serviceStartTime: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={form.serviceEndTime || '18:00'}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              serviceEndTime: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Hours you are available for service bookings
                    </p>
                  </div>

                  {/* Break Time */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                      Break Time (Optional)
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">
                          Break Start
                        </label>
                        <input
                          type="time"
                          value={form.breakStart || ''}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              breakStart: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">
                          Break End
                        </label>
                        <input
                          type="time"
                          value={form.breakEnd || ''}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              breakEnd: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      No bookings will be accepted during break time
                    </p>
                  </div>

                  {/* Work Duration */}
                  <div className="w-full sm:w-[45%]">
                    <label className="text-sm font-medium text-gray-700">
                      Work Duration <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={form.workDuration || ''}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          workDuration: e.target.value,
                        }))
                      }
                      placeholder="60"
                      className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-5 mt-2 border-t border-gray-200 bg-white px-4 sm:px-5 py-3 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => submit('draft')}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Saving…' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => submit('published')}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting
                      ? 'Submitting…'
                      : mode === 'edit'
                        ? 'Update'
                        : 'Submit for Approval'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <VendorManualServices
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSubmit={async (fd) => {
          const ok = await onSubmit?.(fd);
          if (ok) setIsManualOpen(false);
          return ok;
        }}
        lowestServicePrice={lowestServicePrice}
        mode="create"
        initialData={null}
      /> */}
      <VendorManualServices
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSubmit={async (fd) => {
          const ok = await onSubmit?.(fd);
          if (ok) setIsManualOpen(false);
          return ok;
        }}
        lowestServicePrice={lowestServicePrice}
        mode="create"
        initialData={null}
        prefillCategoryId={stepCategoryId}
        prefillCategoryName={form.category}
        prefillSubCategoryId={stepSubCategoryId}
        prefillSubCategoryName={form.subCategory}
      />
    </>
  );
}
