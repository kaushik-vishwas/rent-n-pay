// import React, { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   Calendar,
//   Plus,
//   Upload,
//   X,
//   Tag,
//   Clock,
//   ShoppingBag,
//   RefreshCw,
//   Wrench,
//   Bell,
//   Send,
//   Save,
//   Key,
//   Package,
//   Check,
//   Image as ImageIcon,
// } from 'lucide-react';
// import {
//   getCategories,
//   getSubCategories,
// } from '../../../redux/slices/categorySlice';
// import { apiVendorCreateSubCategory } from '@/service/api';

// const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// const SERVICE_TYPE_OPTIONS = [
//   'Regular',
//   'AMC (Annual Maintenance Cost)',
//   'Installation',
//   'Repair',
// ];

// const CATEGORY_ICONS = {
//   Appliances: '🔧',
//   Furniture: '🛋️',
//   Electronics: '📺',
//   Vehicle: '🚗',
//   Fashion: '👗',
//   Jewelry: '💎',
//   Events: '🎉',
//   Fitness: '🏋️',
//   Tools: '🔨',
//   Kids: '🧸',
// };

// const FALLBACK_CATEGORIES = [
//   { _id: '1', name: 'Appliances' },
//   { _id: '2', name: 'Furniture' },
//   { _id: '3', name: 'Electronics' },
//   { _id: '4', name: 'Vehicle' },
//   { _id: '5', name: 'Fashion' },
//   { _id: '6', name: 'Jewelry' },
//   { _id: '7', name: 'Events' },
//   { _id: '8', name: 'Fitness' },
//   { _id: '9', name: 'Tools' },
//   { _id: '10', name: 'Kids' },
// ];

// const emptySpecRow = () => ({ label: '', value: '' });
// const emptyTextRow = () => '';

// function defaultSchedule() {
//   return DAYS.map((day) => ({
//     day,
//     startTime: '09:00',
//     endTime: '18:00',
//     breakStart: '',
//     breakEnd: '',
//     workDuration: '',
//     isAvailable: day !== 'Sat' && day !== 'Sun',
//   }));
// }

// function defaultFormState() {
//   return {
//     categoryId: '',
//     subCategoryId: '',
//     category: '',
//     subCategory: '',
//     productName: '',
//     included: [emptyTextRow()],
//     excluded: [emptyTextRow()],
//     images: [],
//     existingImageUrls: [],
//     serviceType: SERVICE_TYPE_OPTIONS[1],
//     sellingPrice: '',
//     sameHoursAllDays: true,
//     amc: {
//       serviceCount: '4',
//       autoScheduleServices: false,
//       automatedServiceReminders: true,
//       totalAmcFees: '',
//     },
//     availabilitySchedule: defaultSchedule(),
//     productCustomSpecs: [emptySpecRow()],
//   };
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

// export default function VendorManualServices({
//   isOpen,
//   onClose,
//   onSubmit,
//   lowestServicePrice = 0,
//   mode = 'create',
//   initialData = null,
//   prefillCategoryId = '',
//   prefillCategoryName = '',
//   prefillSubCategoryId = '',
//   prefillSubCategoryName = '',
// }) {
//   const dispatch = useDispatch();
//   const token = useSelector((state) => state.vendor?.token);
//   const { categories, subCategories } = useSelector((state) => state.category);
//   const [form, setForm] = useState(defaultFormState);
//   // const [activeTab, setActiveTab] = useState('offer');
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);

//   // Inline "vendor can't find sub-category" quick-create flow
//   const [subCatCreateOpen, setSubCatCreateOpen] = useState(false);
//   const [newSubCatName, setNewSubCatName] = useState('');
//   const [newSubCatImage, setNewSubCatImage] = useState(null);
//   const [newSubCatCommissionRate, setNewSubCatCommissionRate] = useState(15);
//   const [creatingSubCat, setCreatingSubCat] = useState(false);

//   // useEffect(() => {
//   //   if (!isOpen) return;
//   //   dispatch(getCategories());
//   //   if (mode !== 'edit') {
//   //     setForm(defaultFormState());
//   //     setUploadedFiles([]);
//   //     setPreviewUrls([]);
//   //   }
//   // }, [dispatch, isOpen, mode]);

//   // Revoke old object URLs on cleanup
//   useEffect(() => {
//     return () => {
//       previewUrls.forEach((url) => URL.revokeObjectURL(url));
//     };
//   }, [previewUrls]);

//   useEffect(() => {
//     if (!isOpen) return;
//     dispatch(getCategories());
//     if (mode !== 'edit') {
//       setForm({
//         ...defaultFormState(),
//         categoryId: prefillCategoryId || '',
//         category: prefillCategoryName || '',
//         subCategoryId: prefillSubCategoryId || '',
//         subCategory: prefillSubCategoryName || '',
//       });
//       if (prefillCategoryId) dispatch(getSubCategories(prefillCategoryId));
//       setUploadedFiles([]);
//       setPreviewUrls([]);
//     } else {
//       setUploadedFiles([]);
//       setPreviewUrls([]);
//     }
//   }, [
//     dispatch,
//     isOpen,
//     mode,
//     prefillCategoryId,
//     prefillCategoryName,
//     prefillSubCategoryId,
//     prefillSubCategoryName,
//   ]);

//   useEffect(() => {
//     if (!isOpen || mode !== 'edit' || !initialData) return;
//     if (!categories?.length) return;

//     const meta = initialData.serviceMeta || {};
//     const existingSchedule = Array.isArray(initialData.availabilitySchedule)
//       ? initialData.availabilitySchedule
//       : defaultSchedule();

//     const matchedCat = (categories || []).find(
//       (c) =>
//         String(c.name).toLowerCase() ===
//         String(initialData.category || '').toLowerCase(),
//     );

//     if (matchedCat) {
//       dispatch(getSubCategories(matchedCat._id));
//     }

//     setForm((p) => ({
//       ...p,
//       categoryId: matchedCat?._id || '',
//       subCategoryId: '',
//       category: initialData.category || '',
//       subCategory: initialData.subCategory || '',
//       productName: initialData.productName || '',
//       serviceType: meta.serviceType || '',
//       sellingPrice: String(initialData.price || ''),
//       included:
//         Array.isArray(meta.included) && meta.included.length
//           ? meta.included
//           : [''],
//       excluded:
//         Array.isArray(meta.excluded) && meta.excluded.length
//           ? meta.excluded
//           : [''],
//       images: [],
//       existingImageUrls: Array.isArray(initialData.images)
//         ? initialData.images.filter(Boolean)
//         : initialData.image
//           ? [initialData.image]
//           : [],
//       amc: {
//         serviceCount: String(meta?.amc?.serviceCount ?? '4'),
//         autoScheduleServices: !!meta?.amc?.autoScheduleServices,
//         automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
//         totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
//       },
//       availabilitySchedule: existingSchedule,
//     }));
//   }, [isOpen, mode, initialData, categories, dispatch]);

//   useEffect(() => {
//     if (!isOpen || mode !== 'edit' || !initialData) return;
//     if (!subCategories?.length) return;

//     const matchedSub = subCategories.find(
//       (s) =>
//         String(s.name).toLowerCase() ===
//         String(initialData.subCategory || '').toLowerCase(),
//     );
//     if (matchedSub) {
//       setForm((p) => ({
//         ...p,
//         subCategoryId: matchedSub._id,
//       }));
//     }
//   }, [isOpen, mode, initialData, subCategories]);

//   // const availableCategories = useMemo(
//   //   () =>
//   //     (categories || []).filter((c) => c.availableInRent || c.availableInBuy),
//   //   [categories],
//   // );

//   const availableCategories = useMemo(
//     () => (categories || []).filter((c) => c.availableInServices),
//     [categories],
//   );

//   const availableSubCategories = useMemo(
//     () =>
//       (subCategories || []).filter(
//         (s) =>
//           String(s.category || '') === String(form.categoryId || '') &&
//           s.availableInServices,
//       ),
//     [subCategories, form.categoryId],
//   );

//   const categoryList = availableCategories;

//   const applyCategory = (id) => {
//     const cat = categoryList.find((c) => String(c._id) === String(id));
//     setForm((prev) => ({
//       ...prev,
//       categoryId: String(id || ''),
//       subCategoryId: '',
//       category: cat?.name || '',
//       subCategory: '',
//     }));
//     if (id) dispatch(getSubCategories(id));
//   };
//   const applySubCategory = (id) => {
//     const sub = availableSubCategories.find(
//       (s) => String(s._id) === String(id),
//     );
//     setForm((prev) => ({
//       ...prev,
//       subCategoryId: String(id || ''),
//       subCategory: sub?.name || '',
//     }));
//   };

//   const handleCreateSubCategory = async () => {
//     if (!newSubCatName.trim()) {
//       toast.error('Enter a sub-category name.');
//       return;
//     }
//     if (!form.categoryId) {
//       toast.error('Select a main category first.');
//       return;
//     }
//     if (!newSubCatImage) {
//       toast.error('Add a sub-category image.');
//       return;
//     }
//     setCreatingSubCat(true);
//     try {
//       const fd = new FormData();
//       fd.append('name', newSubCatName.trim());
//       fd.append('categoryId', form.categoryId);
//       fd.append('image', newSubCatImage);
//       fd.append('commissionRate', String(newSubCatCommissionRate || 0));
//       fd.append('availableInServices', 'true');
//       const res = await apiVendorCreateSubCategory(fd, token);
//       const created = res?.data?.subCategory;
//       toast.success('Sub-category created.');
//       await dispatch(getSubCategories(form.categoryId));
//       if (created?._id) {
//         applySubCategory(created._id);
//       }
//       setSubCatCreateOpen(false);
//       setNewSubCatName('');
//       setNewSubCatImage(null);
//       setNewSubCatCommissionRate(15);
//     } catch (e) {
//       toast.error(
//         e?.response?.data?.message || 'Failed to create sub-category.',
//       );
//     } finally {
//       setCreatingSubCat(false);
//     }
//   };

//   const handleMatchLowestPrice = () => {
//     if (!lowestServicePrice) return;
//     setForm((p) => ({
//       ...p,
//       sellingPrice: String(lowestServicePrice),
//     }));
//   };

//   const updateRow = (key, index, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [key]: prev[key].map((x, i) => (i === index ? value : x)),
//     }));
//   };

//   const addRow = (key, factory) => {
//     setForm((prev) => ({ ...prev, [key]: [...prev[key], factory()] }));
//   };

//   const removeRow = (key, index, fallbackFactory) => {
//     setForm((prev) => {
//       const next = prev[key].filter((_, i) => i !== index);
//       return { ...prev, [key]: next.length ? next : [fallbackFactory()] };
//     });
//   };

//   const updateSpec = (index, field, value) => {
//     setForm((prev) => ({
//       ...prev,
//       productCustomSpecs: prev.productCustomSpecs.map((row, i) =>
//         i === index ? { ...row, [field]: value } : row,
//       ),
//     }));
//   };

//   const updateScheduleDay = (day, patch) => {
//     setForm((prev) => ({
//       ...prev,
//       availabilitySchedule: prev.availabilitySchedule.map((slot) =>
//         slot.day === day ? { ...slot, ...patch } : slot,
//       ),
//     }));
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files || []).slice(0, 5);
//     // Revoke previous URLs
//     previewUrls.forEach((url) => URL.revokeObjectURL(url));
//     const newUrls = files.map((file) => URL.createObjectURL(file));
//     setForm((prev) => ({ ...prev, images: files }));
//     setUploadedFiles(files);
//     setPreviewUrls(newUrls);
//   };

//   const removeImage = (index) => {
//     URL.revokeObjectURL(previewUrls[index]);
//     const newFiles = uploadedFiles.filter((_, i) => i !== index);
//     const newUrls = previewUrls.filter((_, i) => i !== index);
//     setUploadedFiles(newFiles);
//     setPreviewUrls(newUrls);
//     setForm((prev) => ({ ...prev, images: newFiles }));
//   };

//   const submit = async (submissionStatus) => {
//     if (!form.category.trim()) return toast.error('Please select a category.');
//     if (!form.subCategory.trim())
//       return toast.error('Please select a sub-category.');
//     if (!form.productName.trim())
//       return toast.error('Please enter service title.');
//     if (!form.sellingPrice.trim())
//       return toast.error('Please enter selling price.');
//     if (!form.images.length && !form.existingImageUrls?.length) {
//       return toast.error('Please upload service media.');
//     }

//     const included = form.included.map((x) => x.trim()).filter(Boolean);
//     const excluded = form.excluded.map((x) => x.trim()).filter(Boolean);
//     const cleanSpecs = form.productCustomSpecs
//       .map((row) => ({
//         label: String(row.label || '').trim(),
//         value: String(row.value || '').trim(),
//       }))
//       .filter((row) => row.label && row.value);
//     const priceNum =
//       Number(String(form.sellingPrice).replace(/[^\d.]/g, '')) || 0;

//     const fd = new FormData();
//     fd.append('productName', form.productName.trim());
//     fd.append('type', 'Service');
//     fd.append('category', form.category.trim());
//     fd.append('subCategory', form.subCategory.trim());
//     fd.append('brand', '');
//     fd.append('condition', 'Brand New');
//     fd.append('shortDescription', '');
//     fd.append('description', '');
//     fd.append('specifications', JSON.stringify({}));
//     fd.append('productCustomSpecs', JSON.stringify(cleanSpecs));
//     fd.append(
//       'salesConfiguration',
//       JSON.stringify({
//         allowVendorEditSalePrice: true,
//         salePrice: priceNum,
//         mrpPrice: priceNum,
//       }),
//     );
//     fd.append(
//       'serviceMeta',
//       JSON.stringify({
//         serviceType: form.serviceType || '',
//         included,
//         excluded,
//         amc: {
//           serviceCount: Number(form.amc.serviceCount || 0),
//           autoScheduleServices: !!form.amc.autoScheduleServices,
//           automatedServiceReminders: !!form.amc.automatedServiceReminders,
//           totalAmcFees: Number(form.amc.totalAmcFees || 0),
//         },
//       }),
//     );
//     fd.append(
//       'availabilitySchedule',
//       JSON.stringify(form.availabilitySchedule || []),
//     );
//     fd.append(
//       'logisticsVerification',
//       JSON.stringify({ inventoryOwnerName: '', city: '' }),
//     );
//     fd.append('refundableDeposit', '0');
//     fd.append('existingImages', JSON.stringify(form.existingImageUrls || []));
//     fd.append('price', String(form.sellingPrice).trim());
//     fd.append('stock', '1');
//     fd.append('submissionStatus', submissionStatus);
//     fd.append('createdVia', 'manual');
//     form.images.forEach((img) => fd.append('images', img));
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

//   if (!isOpen) return null;

//   const availableDays = form.availabilitySchedule.filter((s) => s.isAvailable);

//   return (
//     /* ── Overlay ── */
//     <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3">
//       {/* ── Modal Shell — same large size as before ── */}
//       <div
//         className="flex min-h-0 w-full max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* ════════════════════════════════
//             STICKY HEADER
//         ════════════════════════════════ */}
//         <div className="shrink-0 bg-white border-b border-gray-100">
//           {/* Title row */}
//           <div className="flex items-center justify-between px-6 pt-4 pb-3">
//             <div>
//               <h2 className="text-base font-semibold text-gray-900">
//                 Add New Listing
//               </h2>
//               {/* <p className="text-[11px] text-gray-400 mt-0.5">
//                 Edit your product, rental or service
//               </p> */}
//             </div>
//             {/* ── X Close Button ── */}
//             <button
//               type="button"
//               onClick={onClose}
//               aria-label="Close modal"
//               className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>

//           {/* Tab row */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 pb-4">
//             {/* <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//               <div className="min-w-0 text-left">
//                 <p className="text-sm font-semibold text-gray-900">
//                   Sell Product
//                 </p>
//                 <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                   One-time purchase
//                 </p>
//               </div>
//             </div> */}

//             <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//               <Tag className="h-6 w-6 text-gray-500 flex-shrink-0" />

//               <div className="min-w-0 text-left">
//                 <p className="text-sm font-semibold text-gray-900">
//                   Sell Product
//                 </p>
//                 <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                   One-time purchase
//                 </p>
//               </div>
//             </div>
//             {/* <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//               <div className="min-w-0 text-left">
//                 <p className="text-sm font-semibold text-gray-900">Rent Out</p>
//                 <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                   Monthly rental
//                 </p>
//               </div>
//             </div> */}
//             <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//               <Key className="h-6 w-6 text-gray-500 flex-shrink-0" />

//               <div className="min-w-0 text-left">
//                 <p className="text-sm font-semibold text-gray-900">Rent Out</p>
//                 <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                   Monthly rental
//                 </p>
//               </div>
//             </div>
//             {/* <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-4 text-center ring-1 ring-blue-200">
//               <p className="text-sm font-semibold text-blue-600">
//                 Offer Service
//               </p>
//               <p className="text-[11px] leading-snug text-gray-500">
//                 Hourly / fixed
//               </p>
//             </div> */}
//             <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-blue-500 bg-white px-4 py-3.5 ring-1 ring-blue-200">
//               <Wrench className="h-6 w-6 text-blue-600 flex-shrink-0" />

//               <div className="min-w-0 text-left">
//                 <p className="text-sm font-semibold text-blue-600">
//                   Offer Service
//                 </p>
//                 <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                   Hourly / Fixed
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ════════════════════════════════
//             SCROLLABLE BODY
//         ════════════════════════════════ */}
//         <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-5 py-4 space-y-4">
//           {/* ── What are you Servicing? ── */}
//           <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
//             <div className="flex items-center gap-2.5">
//               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
//                 <Wrench className="h-4 w-4 text-blue-500" />
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900">
//                   What are you Servicing ?
//                 </h3>
//                 <p className="text-[11px] text-gray-400">
//                   Select category to see relevant fields
//                 </p>
//               </div>
//             </div>

//             <div>
//               <p className="mb-2.5 text-[11px] font-semibold text-gray-600">
//                 Step 1 : Main Category <span className="text-red-400">*</span>
//               </p>
//               <div className="grid grid-cols-5 gap-2">
//                 {categoryList.slice(0, 10).map((cat) => {
//                   const selected = form.categoryId === String(cat._id);
//                   const asset = String(cat.icon || cat.image || '').trim();
//                   return (
//                     <button
//                       key={cat._id}
//                       type="button"
//                       onClick={() => applyCategory(cat._id)}
//                       className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all hover:shadow-sm ${
//                         selected
//                           ? 'border-orange-400 bg-orange-50 shadow-sm'
//                           : 'border-gray-200 bg-white hover:border-gray-300'
//                       }`}
//                     >
//                       {asset ? (
//                         <img
//                           src={asset}
//                           alt={cat.name}
//                           className="h-6 w-6 object-contain"
//                         />
//                       ) : (
//                         <Package
//                           className={`h-6 w-6 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
//                           strokeWidth={1.75}
//                         />
//                       )}
//                       <span
//                         className={`text-[10px] font-medium leading-tight ${selected ? 'text-orange-600' : 'text-gray-600'}`}
//                       >
//                         {cat.name}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div>
//               <div className="mb-2.5 flex items-center justify-between flex-wrap gap-2">
//                 <p className="text-[11px] font-semibold text-gray-600">
//                   Step 2 : Sub Category <span className="text-red-400">*</span>
//                 </p>
//                 {form.categoryId ? (
//                   <button
//                     type="button"
//                     onClick={() => setSubCatCreateOpen(true)}
//                     className="inline-flex items-center gap-1 rounded-lg bg-violet-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-violet-600"
//                   >
//                     <Plus className="h-3 w-3" strokeWidth={2} />
//                     Sub Category
//                   </button>
//                 ) : null}
//               </div>
//               <div className="grid grid-cols-5 gap-2">
//                 {/* {(availableSubCategories.length > 0
//                   ? availableSubCategories
//                   : categoryList
//                 )
//                   .slice(0, 10)
//                   .map((cat) => {
//                     const selected = form.subCategoryId === String(cat._id);
//                     const asset = String(cat.icon || cat.image || '').trim();
//                     return (
//                       <button
//                         key={cat._id}
//                         type="button"
//                         onClick={() =>
//                           availableSubCategories.length > 0
//                             ? applySubCategory(cat._id)
//                             : null
//                         } */}
//                 {availableSubCategories.slice(0, 10).map((cat) => {
//                   const selected = form.subCategoryId === String(cat._id);
//                   const asset = String(cat.icon || cat.image || '').trim();
//                   return (
//                     <button
//                       key={cat._id}
//                       type="button"
//                       onClick={() => applySubCategory(cat._id)}
//                       className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all hover:shadow-sm ${
//                         selected
//                           ? 'border-orange-400 bg-orange-50 shadow-sm'
//                           : 'border-gray-200 bg-white hover:border-gray-300'
//                       }`}
//                     >
//                       {asset ? (
//                         <img
//                           src={asset}
//                           alt={cat.name}
//                           className="h-6 w-6 object-contain"
//                         />
//                       ) : (
//                         <Package
//                           className={`h-6 w-6 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
//                           strokeWidth={1.75}
//                         />
//                       )}
//                       <span
//                         className={`text-[10px] font-medium leading-tight ${selected ? 'text-orange-600' : 'text-gray-500'}`}
//                       >
//                         {cat.name}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </section>

//           {/* ── Basic Details ── */}
//           <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
//             <h3 className="text-sm font-semibold text-gray-900">
//               Basic Details
//             </h3>

//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-gray-700">
//                 Service Title <span className="text-red-400">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={form.productName}
//                 onChange={(e) =>
//                   setForm((prev) => ({ ...prev, productName: e.target.value }))
//                 }
//                 placeholder="e.g. Home Cleaning"
//                 className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-gray-700">
//                 What will be Included <span className="text-red-400">*</span>
//               </label>
//               <div className="space-y-2">
//                 {form.included.map((row, idx) => (
//                   <div key={`inc-${idx}`} className="flex gap-2">
//                     <input
//                       value={row}
//                       onChange={(e) =>
//                         updateRow('included', idx, e.target.value)
//                       }
//                       placeholder="e.g. Drain,pipe-cleaning"
//                       className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                     />
//                     {idx === 0 ? (
//                       <button
//                         type="button"
//                         onClick={() => addRow('included', emptyTextRow)}
//                         className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors"
//                       >
//                         <Plus className="h-4 w-4" />
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => removeRow('included', idx, emptyTextRow)}
//                         className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
//                       >
//                         <X className="h-4 w-4" />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-gray-700">
//                 What will be Excluded <span className="text-red-400">*</span>
//               </label>
//               <div className="space-y-2">
//                 {form.excluded.map((row, idx) => (
//                   <div key={`exc-${idx}`} className="flex gap-2">
//                     <input
//                       value={row}
//                       onChange={(e) =>
//                         updateRow('excluded', idx, e.target.value)
//                       }
//                       placeholder="e.g. Spare parts cost (charged separately if needed)"
//                       className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                     />
//                     {idx === 0 ? (
//                       <button
//                         type="button"
//                         onClick={() => addRow('excluded', emptyTextRow)}
//                         className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors"
//                       >
//                         <Plus className="h-4 w-4" />
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={() => removeRow('excluded', idx, emptyTextRow)}
//                         className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
//                       >
//                         <X className="h-4 w-4" />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* <div>
//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 Service Media <span className="text-red-400">*</span>
//               </label>
//               <p className="mb-2 text-[11px] text-gray-400">
//                 Upload up to 5 high quality Media. First Image will be the cover
//                 photo.
//               </p>

//               {previewUrls.length > 0 && (
//                 <div className="mb-3 grid grid-cols-5 gap-2">
//                   {previewUrls.map((url, idx) => (
//                     <div
//                       key={idx}
//                       className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
//                     >
//                       <img
//                         src={url}
//                         alt={`Preview ${idx + 1}`}
//                         className="h-full w-full object-cover"
//                       />

//                       {idx === 0 && (
//                         <span className="absolute bottom-1 left-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
//                           COVER
//                         </span>
//                       )}

//                       <button
//                         type="button"
//                         onClick={() => removeImage(idx)}
//                         className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </div>
//                   ))}

//                   {previewUrls.length < 5 && (
//                     <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40 transition-all">
//                       <Plus className="h-5 w-5 text-gray-400" />
//                       <span className="mt-1 text-[10px] text-gray-400">
//                         Add more
//                       </span>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*"
//                         className="hidden"
//                         onChange={handleImageUpload}
//                       />
//                     </label>
//                   )}
//                 </div>
//               )}

//               {previewUrls.length === 0 && (
//                 <label className="group flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center hover:border-blue-300 hover:bg-blue-50/40 transition-all">
//                   <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-[#DBEAFE] shadow-sm group-hover:border-blue-200 transition-colors">
//                     <Upload className="h-5 w-5 text-blue-500" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-700">
//                       Click to upload or drag and drop
//                     </p>
//                     <p className="text-[11px] text-gray-400">
//                       PNG, JPG up to 10MB &bull; {uploadedFiles.length}/5
//                       uploaded
//                     </p>
//                   </div>
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleImageUpload}
//                   />
//                 </label>
//               )}
//             </div> */}

//             <div>
//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 Service Media <span className="text-red-400">*</span>
//               </label>
//               <p className="mb-2 text-[11px] text-gray-400">
//                 Upload up to 5 high quality Media. First Image will be the cover
//                 photo.
//               </p>

//               {/* Existing images from server (edit mode) */}
//               {form.existingImageUrls?.length > 0 &&
//                 previewUrls.length === 0 && (
//                   <div className="mb-3 grid grid-cols-5 gap-2">
//                     {form.existingImageUrls.map((url, idx) => (
//                       <div
//                         key={`existing-${idx}`}
//                         className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
//                       >
//                         <img
//                           src={url}
//                           alt={`Existing ${idx + 1}`}
//                           className="h-full w-full object-cover"
//                         />
//                         {idx === 0 && (
//                           <span className="absolute bottom-1 left-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
//                             COVER
//                           </span>
//                         )}
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setForm((p) => ({
//                               ...p,
//                               existingImageUrls: p.existingImageUrls.filter(
//                                 (_, i) => i !== idx,
//                               ),
//                             }))
//                           }
//                           className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </div>
//                     ))}
//                     {/* Allow replacing with new upload */}
//                     <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40 transition-all">
//                       <Plus className="h-5 w-5 text-gray-400" />
//                       <span className="mt-1 text-[10px] text-gray-400">
//                         Replace
//                       </span>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*"
//                         className="hidden"
//                         onChange={handleImageUpload}
//                       />
//                     </label>
//                   </div>
//                 )}

//               {/* New uploaded previews */}
//               {previewUrls.length > 0 && (
//                 <div className="mb-3 grid grid-cols-5 gap-2">
//                   {previewUrls.map((url, idx) => (
//                     <div
//                       key={idx}
//                       className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
//                     >
//                       <img
//                         src={url}
//                         alt={`Preview ${idx + 1}`}
//                         className="h-full w-full object-cover"
//                       />
//                       {idx === 0 && (
//                         <span className="absolute bottom-1 left-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
//                           COVER
//                         </span>
//                       )}
//                       <button
//                         type="button"
//                         onClick={() => removeImage(idx)}
//                         className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </div>
//                   ))}
//                   {previewUrls.length < 5 && (
//                     <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40 transition-all">
//                       <Plus className="h-5 w-5 text-gray-400" />
//                       <span className="mt-1 text-[10px] text-gray-400">
//                         Add more
//                       </span>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*"
//                         className="hidden"
//                         onChange={handleImageUpload}
//                       />
//                     </label>
//                   )}
//                 </div>
//               )}

//               {/* Upload area — only show when no images at all */}
//               {previewUrls.length === 0 && !form.existingImageUrls?.length && (
//                 <label className="group flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center hover:border-blue-300 hover:bg-blue-50/40 transition-all">
//                   <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-[#DBEAFE] shadow-sm group-hover:border-blue-200 transition-colors">
//                     <Upload className="h-5 w-5 text-blue-500" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-700">
//                       Click to upload or drag and drop
//                     </p>
//                     <p className="text-[11px] text-gray-400">
//                       PNG, JPG up to 10MB &bull; {uploadedFiles.length}/5
//                       uploaded
//                     </p>
//                   </div>
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleImageUpload}
//                   />
//                 </label>
//               )}
//             </div>
//           </section>

//           {/* ── Sales Configuration ── */}
//           <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
//             <div className="flex items-center gap-2.5">
//               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] ">
//                 <Tag className="h-4 w-4 text-[#2563EB]" />
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900">
//                   Service Configuration
//                 </h3>
//                 <p className="text-[11px] text-gray-400">
//                   Set pricing and inventory details
//                 </p>
//               </div>
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-gray-700">
//                 Specific Service Type <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <select
//                   value={form.serviceType}
//                   onChange={(e) =>
//                     setForm((prev) => ({
//                       ...prev,
//                       serviceType: e.target.value,
//                     }))
//                   }
//                   className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                 >
//                   {SERVICE_TYPE_OPTIONS.map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>
//                 <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
//                   ▾
//                 </span>
//               </div>
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-medium text-gray-700">
//                 Service Price <span className="text-red-400">*</span>
//               </label>
//               {/* <div className="relative">
//                 <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#2563EB]">
//                   ₹
//                 </span>
//                 <input
//                   type="number"
//                   min="0"
//                   value={form.sellingPrice}
//                   onChange={(e) =>
//                     setForm((prev) => ({
//                       ...prev,
//                       sellingPrice: e.target.value,
//                     }))
//                   }
//                   placeholder="Enter your price"
//                   className="w-full rounded-xl border border-gray-200 py-2.5 pl-8 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                 />
//               </div> */}
//               <div className="relative">
//                 <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#2563EB] pointer-events-none">
//                   ₹
//                 </span>
//                 <input
//                   type="number"
//                   min="0"
//                   value={form.sellingPrice}
//                   onChange={(e) =>
//                     setForm((prev) => ({
//                       ...prev,
//                       sellingPrice: e.target.value,
//                     }))
//                   }
//                   // placeholder="Enter your price"
//                   // className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   placeholder="0"
//                   className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                 />
//               </div>
//             </div>
//             {/* Market Insights */}
//             <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 space-y-4">
//               <div className="flex items-center justify-between">
//                 <h4 className="text-sm font-semibold text-gray-900">
//                   Market Insights
//                 </h4>
//                 <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-medium text-emerald-700">
//                   LIVE DATA
//                 </span>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className="rounded-xl border bg-white p-3">
//                   <p className="text-xs text-gray-500 mb-1">
//                     MRP / Market Price
//                   </p>
//                   <p className="text-xl font-bold text-gray-900">
//                     {form.sellingPrice
//                       ? `₹${String(form.sellingPrice).replace(/[^\d.]/g, '')}`
//                       : '₹0'}
//                   </p>
//                 </div>

//                 <div className="rounded-xl border bg-white p-3">
//                   <p className="text-xs text-gray-500 mb-1">
//                     Lowest Price Online
//                   </p>
//                   <p className="text-xl font-bold text-emerald-600">
//                     {formatPriceLabel(lowestServicePrice) || '₹0'}
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleMatchLowestPrice}
//                 disabled={!lowestServicePrice}
//                 className={`w-full rounded-xl py-3 text-sm font-semibold ${
//                   lowestServicePrice
//                     ? 'bg-orange-500 text-white hover:bg-orange-600'
//                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 }`}
//               >
//                 Match Lowest Price
//               </button>

//               <p className="text-center text-xs text-gray-500">
//                 Auto-fill with the most competitive price online
//               </p>
//             </div>
//             {/* AMC Box */}
//             {/* <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 space-y-3.5">
//               <h4 className="text-xs font-bold text-gray-800">
//                 AMC ( Annual Maintaince Cost )
//               </h4>

//               <div>
//                 <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
//                   Service Count
//                 </label>
//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...p.amc,
//                           serviceCount: String(
//                             Math.max(0, Number(p.amc.serviceCount) - 1),
//                           ),
//                         },
//                       }))
//                     }
//                     className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors"
//                   >
//                     −
//                   </button>
//                   <input
//                     type="number"
//                     min="0"
//                     value={form.amc.serviceCount}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: { ...p.amc, serviceCount: e.target.value },
//                       }))
//                     }
//                     className="w-14 rounded-lg border border-gray-200 py-1.5 text-center text-sm font-semibold outline-none"
//                   />
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...p.amc,
//                           serviceCount: String(Number(p.amc.serviceCount) + 1),
//                         },
//                       }))
//                     }
//                     className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors"
//                   >
//                     +
//                   </button>
//                   <span className="text-[11px] text-gray-400">
//                     services/year
//                   </span>
//                 </div>
//                 <p className="mt-1 text-[10px] text-gray-400">
//                   Number of scheduled maintenance services per year
//                 </p>
//               </div>

//               <div>
//                 <label className="flex cursor-pointer items-start gap-2.5">
//                   <input
//                     type="checkbox"
//                     checked={!!form.amc.autoScheduleServices}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...p.amc,
//                           autoScheduleServices: e.target.checked,
//                         },
//                       }))
//                     }
//                     className="mt-0.5 h-3.5 w-3.5 accent-orange-500"
//                   />
//                   <div>
//                     <p className="text-xs font-medium text-gray-800">
//                       Auto-Schedule Services
//                     </p>
//                     <p className="text-[10px] text-gray-400">
//                       Divide service visits equally across months (e.g., 4
//                       services ÷ every 3 months)
//                     </p>
//                   </div>
//                 </label>
//               </div>

//               <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-white px-3.5 py-2.5">
//                 <div className="flex items-center gap-2.5">
//                   <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100">
//                     <Calendar className="h-3.5 w-3.5 text-orange-500" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-semibold text-gray-800">
//                       Automated Service Reminders
//                     </p>
//                     <p className="text-[10px] text-gray-400">
//                       Send automated reminders to customers before scheduled
//                       service dates
//                     </p>
//                   </div>
//                 </div>
//                 <label className="relative ml-3 inline-flex shrink-0 cursor-pointer items-center">
//                   <input
//                     type="checkbox"
//                     className="peer sr-only"
//                     checked={!!form.amc.automatedServiceReminders}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...p.amc,
//                           automatedServiceReminders: e.target.checked,
//                         },
//                       }))
//                     }
//                   />
//                   <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-orange-500 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-4" />
//                 </label>
//               </div>

//               <div>
//                 <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
//                   AMC Fee (Monthly)
//                 </label>
//                 <div className="relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
//                     ₹
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={form.amc.totalAmcFees}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: { ...p.amc, totalAmcFees: e.target.value },
//                       }))
//                     }
//                     placeholder="100"
//                     className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
//               >
//                 💾 Save AMC
//               </button>
//             </div> */}
//             .
//             <div className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-5">
//               <div>
//                 <h4 className="text-sm font-semibold text-gray-900">
//                   AMC ( Annual Maintenance Cost )
//                 </h4>
//               </div>

//               {/* Service Count */}
//               <div className="w-full sm:w-[25%]">
//                 <p className="text-xs font-medium text-gray-700 mb-1.5">
//                   Service Count <span className="text-red-500">*</span>
//                 </p>
//                 <input
//                   type="number"
//                   min="0"
//                   value={form?.amc?.serviceCount ?? ''}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       amc: { ...p.amc, serviceCount: e.target.value },
//                     }))
//                   }
//                   placeholder="Services / Year"
//                   className="w-full rounded-xl border border-[#DAB2FF] px-3 py-2.5 text-sm outline-none bg-white"
//                 />
//               </div>

//               {/* Auto Schedule */}
//               <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-200 p-4">
//                 <div className="flex items-start gap-3">
//                   <input
//                     type="checkbox"
//                     checked={!!form?.amc?.autoScheduleServices}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...p.amc,
//                           autoScheduleServices: e.target.checked,
//                         },
//                       }))
//                     }
//                     className="mt-0.5 h-4 w-4 accent-orange-500"
//                   />
//                   <div>
//                     <h5 className="text-sm font-semibold text-gray-900">
//                       Auto-Schedule Services
//                     </h5>
//                     <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                       Divide service visits equally across months (e.g., 4
//                       services = every 3 months)
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Automated Reminders */}
//               <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-200 p-4">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <Bell className="h-4 w-4 text-[#8B5CF6]" />
//                     <h5 className="text-sm font-semibold text-gray-900">
//                       Automated Service Reminders
//                     </h5>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                     Send automated reminders to customers before scheduled
//                     service dates
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   role="switch"
//                   aria-checked={!!form?.amc?.automatedServiceReminders}
//                   onClick={() =>
//                     setForm((p) => ({
//                       ...p,
//                       amc: {
//                         ...p.amc,
//                         automatedServiceReminders:
//                           !p?.amc?.automatedServiceReminders,
//                       },
//                     }))
//                   }
//                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                     form?.amc?.automatedServiceReminders
//                       ? 'bg-orange-500'
//                       : 'bg-orange-200'
//                   }`}
//                 >
//                   <span
//                     className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                       form?.amc?.automatedServiceReminders
//                         ? 'translate-x-5'
//                         : 'translate-x-0.5'
//                     }`}
//                   />
//                 </button>
//               </div>

//               {/* Total AMC Fees */}
//               <div className="w-full sm:w-[25%]">
//                 <p className="text-xs font-medium text-gray-700 mb-1.5">
//                   Total AMC Fees <span className="text-red-500">*</span>
//                 </p>
//                 <div className="relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
//                     ₹
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={form?.amc?.totalAmcFees ?? ''}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: { ...p.amc, totalAmcFees: e.target.value },
//                       }))
//                     }
//                     placeholder="199/-"
//                     className="w-full rounded-xl border border-[#DAB2FF] pl-8 pr-3 py-2.5 text-sm outline-none bg-white"
//                   />
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* ── Availability Schedule ── */}
//           {/* <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2.5">
//                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
//                   <Clock className="h-4 w-4 text-blue-500" />
//                 </div>
//                 <h3 className="text-sm font-semibold text-gray-900">
//                   Availability Schedule
//                 </h3>
//               </div>
//               <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 tracking-wide">
//                 YOUR OPERATIONS
//               </span>
//             </div>

//             <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
//               <div>
//                 <p className="text-xs font-semibold text-gray-800">
//                   Same Hours for All Days
//                 </p>
//                 <p className="text-[10px] text-gray-400 mt-0.5">
//                   Apply service hours uniformly across all working days
//                 </p>
//               </div>
//               <label className="relative ml-4 inline-flex shrink-0 cursor-pointer items-center">
//                 <input
//                   type="checkbox"
//                   className="peer sr-only"
//                   checked={form.sameHoursAllDays}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       sameHoursAllDays: e.target.checked,
//                     }))
//                   }
//                 />
//                 <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-blue-500 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-4" />
//               </label>
//             </div>

//             <div>
//               <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                 Working Days
//               </p>
//               <div className="flex items-center gap-2">
//                 {form.availabilitySchedule.map((slot, idx) => (
//                   <button
//                     key={slot.day}
//                     type="button"
//                     onClick={() =>
//                       updateScheduleDay(slot.day, {
//                         isAvailable: !slot.isAvailable,
//                       })
//                     }
//                     className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
//                       slot.isAvailable
//                         ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
//                         : 'border border-gray-200 bg-white text-gray-400 hover:border-gray-300'
//                     }`}
//                   >
//                     {DAY_LABELS[idx]}
//                   </button>
//                 ))}
//               </div>
//               <p className="mt-1.5 text-[10px] text-gray-400">
//                 Select days you provide service
//               </p>
//             </div>

//             <div>
//               <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                 Service Hours
//               </p>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="mb-1 block text-[10px] text-gray-500">
//                     Start Time
//                   </label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.startTime || '09:00'}
//                     onChange={(e) => {
//                       if (form.sameHoursAllDays) {
//                         form.availabilitySchedule
//                           .filter((s) => s.isAvailable)
//                           .forEach((s) =>
//                             updateScheduleDay(s.day, {
//                               startTime: e.target.value,
//                             }),
//                           );
//                       } else {
//                         updateScheduleDay(availableDays[0]?.day, {
//                           startTime: e.target.value,
//                         });
//                       }
//                     }}
//                     className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-[10px] text-gray-500">
//                     End Time
//                   </label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.endTime || '18:00'}
//                     onChange={(e) => {
//                       if (form.sameHoursAllDays) {
//                         form.availabilitySchedule
//                           .filter((s) => s.isAvailable)
//                           .forEach((s) =>
//                             updateScheduleDay(s.day, {
//                               endTime: e.target.value,
//                             }),
//                           );
//                       } else {
//                         updateScheduleDay(availableDays[0]?.day, {
//                           endTime: e.target.value,
//                         });
//                       }
//                     }}
//                     className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                 </div>
//               </div>
//               <p className="mt-1.5 text-[10px] text-gray-400">
//                 Hours you are available for service bookings
//               </p>
//             </div>

//             <div>
//               <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                 Break Time (Optional)
//               </p>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="mb-1 block text-[10px] text-gray-500">
//                     Break Start
//                   </label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.breakStart || ''}
//                     onChange={(e) =>
//                       updateScheduleDay(availableDays[0]?.day, {
//                         breakStart: e.target.value,
//                       })
//                     }
//                     className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-[10px] text-gray-500">
//                     Break End
//                   </label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.breakEnd || ''}
//                     onChange={(e) =>
//                       updateScheduleDay(availableDays[0]?.day, {
//                         breakEnd: e.target.value,
//                       })
//                     }
//                     className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                 </div>
//               </div>
//               <p className="mt-1.5 text-[10px] text-gray-400">
//                 No bookings will be accepted during break time
//               </p>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                 Work Duration <span className="text-red-400">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={availableDays[0]?.workDuration || ''}
//                 onChange={(e) =>
//                   updateScheduleDay(availableDays[0]?.day, {
//                     workDuration: e.target.value,
//                   })
//                 }
//                 placeholder="e.g. 2 hours"
//                 className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//               />
//             </div>

//             <div className="space-y-3 pt-1">
//               <div className="flex items-center justify-between">
//                 <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                   Custom Specifications
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => addRow('productCustomSpecs', emptySpecRow)}
//                   className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-600 transition-colors"
//                 >
//                   <Plus className="h-3 w-3" />
//                   Add Custom Specification
//                 </button>
//               </div>
//               {form.productCustomSpecs.map((row, idx) => (
//                 <div
//                   key={`spec-${idx}`}
//                   className="grid grid-cols-[1fr_1fr_auto] gap-2"
//                 >
//                   <input
//                     type="text"
//                     value={row.label}
//                     onChange={(e) => updateSpec(idx, 'label', e.target.value)}
//                     placeholder="e.g. Fabric Material"
//                     className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                   <input
//                     type="text"
//                     value={row.value}
//                     onChange={(e) => updateSpec(idx, 'value', e.target.value)}
//                     placeholder="e.g. Velvet"
//                     className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                   <button
//                     type="button"
//                     onClick={() =>
//                       removeRow('productCustomSpecs', idx, emptySpecRow)
//                     }
//                     className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </section> */}
//           <section className="rounded-2xl border border-[#D8B4FE] bg-white p-4 sm:p-5 space-y-5">
//             {/* Header */}
//             <div className="flex items-center gap-2">
//               <Calendar className="h-5 w-5 text-[#8B5CF6]" />
//               <h3 className="text-base font-semibold text-gray-900">
//                 Availability Schedule
//               </h3>
//               <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-600">
//                 YOUR OPERATIONS
//               </span>
//             </div>

//             {/* Same Hours Toggle */}
//             <div className="rounded-xl border border-[#D8B4FE] bg-purple-50 p-4 flex items-center justify-between">
//               <div>
//                 <h4 className="text-sm font-semibold text-gray-900">
//                   Same Hours for All Days
//                 </h4>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Apply service hours uniformly across all working days
//                 </p>
//               </div>
//               {/* <button
//                 type="button"
//                 role="switch"
//                 aria-checked={form.sameHoursAllDays}
//                 onClick={() =>
//                   setForm((p) => ({
//                     ...p,
//                     sameHoursAllDays: !p.sameHoursAllDays,
//                   }))
//                 }
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                   form.sameHoursAllDays ? 'bg-purple-500' : 'bg-gray-300'
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                     form.sameHoursAllDays ? 'translate-x-5' : 'translate-x-0.5'
//                   }`}
//                 />
//               </button> */}
//               <button
//                 type="button"
//                 role="switch"
//                 aria-checked={form.sameHoursAllDays}
//                 onClick={() =>
//                   setForm((p) => {
//                     const turningOn = !p.sameHoursAllDays;
//                     if (turningOn) {
//                       const updatedSchedule = (
//                         p.availabilitySchedule || []
//                       ).map((slot) => ({
//                         ...slot,
//                         isAvailable: slot.day !== 'Sun',
//                       }));
//                       return {
//                         ...p,
//                         sameHoursAllDays: true,
//                         availabilitySchedule: updatedSchedule,
//                         schedule: updatedSchedule,
//                       };
//                     }
//                     return { ...p, sameHoursAllDays: false };
//                   })
//                 }
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                   form.sameHoursAllDays ? 'bg-purple-500' : 'bg-gray-300'
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                     form.sameHoursAllDays ? 'translate-x-5' : 'translate-x-0.5'
//                   }`}
//                 />
//               </button>
//             </div>

//             {/* Working Days */}
//             <div>
//               <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
//                 Working Days
//               </p>
//               <div className="grid grid-cols-7 gap-2">
//                 {form.availabilitySchedule.map((slot, idx) => (
//                   <button
//                     key={slot.day}
//                     type="button"
//                     onClick={() =>
//                       updateScheduleDay(slot.day, {
//                         isAvailable: !slot.isAvailable,
//                       })
//                     }
//                     className={`rounded-xl py-3 text-sm font-medium border transition ${
//                       slot.isAvailable
//                         ? 'bg-orange-500 text-white border-orange-500 shadow'
//                         : 'bg-white text-gray-500 border-gray-300'
//                     }`}
//                   >
//                     {DAY_LABELS[idx]}
//                   </button>
//                 ))}
//               </div>
//               <p className="text-xs text-gray-400 mt-2">
//                 Select days you provide service
//               </p>
//             </div>

//             {/* Service Hours */}
//             <div>
//               <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
//                 Service Hours
//               </p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs text-gray-500">Start Time</label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.startTime || '09:00'}
//                     onChange={(e) => {
//                       if (form.sameHoursAllDays) {
//                         form.availabilitySchedule
//                           .filter((s) => s.isAvailable)
//                           .forEach((s) =>
//                             updateScheduleDay(s.day, {
//                               startTime: e.target.value,
//                             }),
//                           );
//                       } else {
//                         updateScheduleDay(availableDays[0]?.day, {
//                           startTime: e.target.value,
//                         });
//                       }
//                     }}
//                     className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-500">End Time</label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.endTime || '18:00'}
//                     onChange={(e) => {
//                       if (form.sameHoursAllDays) {
//                         form.availabilitySchedule
//                           .filter((s) => s.isAvailable)
//                           .forEach((s) =>
//                             updateScheduleDay(s.day, {
//                               endTime: e.target.value,
//                             }),
//                           );
//                       } else {
//                         updateScheduleDay(availableDays[0]?.day, {
//                           endTime: e.target.value,
//                         });
//                       }
//                     }}
//                     className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                   />
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">
//                 Hours you are available for service bookings
//               </p>
//             </div>

//             {/* Break Time */}
//             <div>
//               <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
//                 Break Time (Optional)
//               </p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs text-gray-500">Break Start</label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.breakStart || ''}
//                     onChange={(e) =>
//                       updateScheduleDay(availableDays[0]?.day, {
//                         breakStart: e.target.value,
//                       })
//                     }
//                     className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-500">Break End</label>
//                   <input
//                     type="time"
//                     value={availableDays[0]?.breakEnd || ''}
//                     onChange={(e) =>
//                       updateScheduleDay(availableDays[0]?.day, {
//                         breakEnd: e.target.value,
//                       })
//                     }
//                     className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//                   />
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">
//                 No bookings will be accepted during break time
//               </p>
//             </div>

//             {/* Work Duration */}
//             <div className="w-full sm:w-[45%]">
//               <label className="text-sm font-medium text-gray-700">
//                 Work Duration <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 value={availableDays[0]?.workDuration || ''}
//                 onChange={(e) =>
//                   updateScheduleDay(availableDays[0]?.day, {
//                     workDuration: e.target.value,
//                   })
//                 }
//                 placeholder="60"
//                 className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
//               />
//             </div>

//             {/* Custom Specs */}
//             {/* <div className="space-y-3 pt-1">
//               <div className="flex items-center justify-between">
//                 <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
//                   Custom Specifications
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => addRow('productCustomSpecs', emptySpecRow)}
//                   className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-600 transition-colors"
//                 >
//                   <Plus className="h-3 w-3" />
//                   Add Custom Specification
//                 </button>
//               </div>
//               {form.productCustomSpecs.map((row, idx) => (
//                 <div
//                   key={`spec-${idx}`}
//                   className="grid grid-cols-[1fr_1fr_auto] gap-2"
//                 >
//                   <input
//                     type="text"
//                     value={row.label}
//                     onChange={(e) => updateSpec(idx, 'label', e.target.value)}
//                     placeholder="e.g. Fabric Material"
//                     className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                   <input
//                     type="text"
//                     value={row.value}
//                     onChange={(e) => updateSpec(idx, 'value', e.target.value)}
//                     placeholder="e.g. Velvet"
//                     className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
//                   />
//                   <button
//                     type="button"
//                     onClick={() =>
//                       removeRow('productCustomSpecs', idx, emptySpecRow)
//                     }
//                     className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               ))}
//             </div> */}
//           </section>
//         </div>

//         {/* ════════════════════════════════
//             STICKY FOOTER
//         ════════════════════════════════ */}
//         <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3.5 flex items-center justify-between">
//           <button
//             type="button"
//             onClick={() => submit('draft')}
//             className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
//           >
//             <Save className="h-4 w-4" />
//             Save as Draft
//           </button>
//           <button
//             type="button"
//             onClick={() => submit('published')}
//             className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
//           >
//             <Send className="h-4 w-4" />
//             {mode === 'edit' ? 'Update' : 'Send for Approval'}
//           </button>
//         </div>
//       </div>

//       {/* Vendor quick-create sub-category modal */}
//       {subCatCreateOpen ? (
//         <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/40">
//           <div
//             className="absolute inset-0"
//             role="presentation"
//             onClick={() => !creatingSubCat && setSubCatCreateOpen(false)}
//           />
//           <div
//             className="relative flex w-full max-w-lg flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
//               <div className="min-w-0 pr-2">
//                 <h3 className="text-lg font-semibold tracking-tight text-gray-900">
//                   Add New Sub-category
//                 </h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Can&apos;t find the right sub-category? Add one for your
//                   service.
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 disabled={creatingSubCat}
//                 onClick={() => setSubCatCreateOpen(false)}
//                 className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
//                 aria-label="Close"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-6 space-y-5">
//               <div>
//                 <label className="mb-1.5 block text-sm font-medium text-gray-800">
//                   Subcategory <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={newSubCatName}
//                   onChange={(e) => setNewSubCatName(e.target.value)}
//                   placeholder="e.g., Deep Cleaning"
//                   className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                 />
//               </div>

//               <div>
//                 <label className="mb-1.5 block text-sm font-medium text-gray-800">
//                   Category
//                 </label>
//                 <input
//                   value={form.category}
//                   readOnly
//                   className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 outline-none"
//                 />
//                 <p className="mt-1.5 text-xs text-gray-500">
//                   This sub-category will be added under the main category you
//                   selected above.
//                 </p>
//               </div>

//               <div>
//                 <label className="mb-1.5 block text-sm font-medium text-gray-800">
//                   Commission Rate <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     min={0}
//                     value={newSubCatCommissionRate}
//                     onChange={(e) => setNewSubCatCommissionRate(e.target.value)}
//                     className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
//                   />
//                   <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
//                     %
//                   </span>
//                 </div>
//                 <p className="mt-1.5 text-xs text-gray-500">
//                   Platform&apos;s percentage share for this category
//                 </p>
//               </div>

//               <div>
//                 <p className="mb-2 text-sm font-medium text-gray-800">
//                   Sub-category Image <span className="text-red-500">*</span>
//                 </p>
//                 <label className="flex flex-col items-center justify-center min-h-[168px] rounded-xl border border-gray-200 bg-gray-50/80 hover:border-orange-200 hover:bg-orange-50/20 cursor-pointer transition-colors">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) =>
//                       setNewSubCatImage(e.target.files?.[0] || null)
//                     }
//                   />
//                   {newSubCatImage ? (
//                     <div className="relative p-3 w-full">
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           setNewSubCatImage(null);
//                         }}
//                         className="absolute top-2 right-2 p-1 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:text-red-600"
//                         aria-label="Remove file"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                       <img
//                         src={URL.createObjectURL(newSubCatImage)}
//                         alt=""
//                         className="mx-auto max-h-32 object-contain rounded-lg"
//                       />
//                       <p className="text-xs text-center text-gray-600 mt-2 truncate px-2">
//                         {newSubCatImage.name}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center gap-2 py-10 px-4">
//                       <ImageIcon
//                         className="w-9 h-9 text-orange-500"
//                         strokeWidth={1.75}
//                       />
//                       <span className="text-sm font-medium text-orange-500">
//                         Select from Media Library
//                       </span>
//                       <span className="text-xs text-gray-400">
//                         PNG, JPG, WebP
//                       </span>
//                     </div>
//                   )}
//                 </label>
//                 <p className="mt-2 text-xs text-gray-500">
//                   512x512px recommended for app grids
//                 </p>
//               </div>

//               <p className="text-xs text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
//                 New sub-categories may be reviewed by the admin team before
//                 appearing elsewhere on the platform.
//               </p>
//             </div>

//             <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
//               <button
//                 type="button"
//                 disabled={creatingSubCat}
//                 onClick={() => setSubCatCreateOpen(false)}
//                 className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={creatingSubCat}
//                 onClick={handleCreateSubCategory}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-60"
//               >
//                 {creatingSubCat ? (
//                   'Creating…'
//                 ) : (
//                   <>
//                     <Check className="h-4 w-4" strokeWidth={2.5} />
//                     Create Sub-category
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Calendar,
  Plus,
  Upload,
  X,
  Tag,
  Clock,
  ShoppingBag,
  RefreshCw,
  Wrench,
  Bell,
  Send,
  Save,
  Key,
  Package,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getCategories,
  getSubCategories,
} from '../../../redux/slices/categorySlice';
import { apiVendorCreateSubCategory } from '@/service/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const SERVICE_TYPE_OPTIONS = [
  'Regular',
  'AMC (Annual Maintenance Cost)',
  'Installation',
  'Repair',
];

const CATEGORY_ICONS = {
  Appliances: '🔧',
  Furniture: '🛋️',
  Electronics: '📺',
  Vehicle: '🚗',
  Fashion: '👗',
  Jewelry: '💎',
  Events: '🎉',
  Fitness: '🏋️',
  Tools: '🔨',
  Kids: '🧸',
};

const FALLBACK_CATEGORIES = [
  { _id: '1', name: 'Appliances' },
  { _id: '2', name: 'Furniture' },
  { _id: '3', name: 'Electronics' },
  { _id: '4', name: 'Vehicle' },
  { _id: '5', name: 'Fashion' },
  { _id: '6', name: 'Jewelry' },
  { _id: '7', name: 'Events' },
  { _id: '8', name: 'Fitness' },
  { _id: '9', name: 'Tools' },
  { _id: '10', name: 'Kids' },
];

const emptySpecRow = () => ({ label: '', value: '' });
const emptyTextRow = () => '';

function defaultSchedule() {
  return DAYS.map((day) => ({
    day,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '',
    breakEnd: '',
    workDuration: '',
    isAvailable: day !== 'Sat' && day !== 'Sun',
  }));
}

function defaultFormState() {
  return {
    categoryId: '',
    subCategoryId: '',
    category: '',
    subCategory: '',
    productName: '',
    included: [emptyTextRow()],
    excluded: [emptyTextRow()],
    images: [],
    existingImageUrls: [],
    serviceType: SERVICE_TYPE_OPTIONS[1],
    sellingPrice: '',
    sameHoursAllDays: true,
    amc: {
      serviceCount: '4',
      autoScheduleServices: false,
      automatedServiceReminders: true,
      totalAmcFees: '',
    },
    availabilitySchedule: defaultSchedule(),
    productCustomSpecs: [emptySpecRow()],
  };
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

export default function VendorManualServices({
  isOpen,
  onClose,
  onSubmit,
  lowestServicePrice = 0,
  mode = 'create',
  initialData = null,
  prefillCategoryId = '',
  prefillCategoryName = '',
  prefillSubCategoryId = '',
  prefillSubCategoryName = '',
}) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.vendor?.token);
  const { categories, subCategories } = useSelector((state) => state.category);
  const [form, setForm] = useState(defaultFormState);
  // const [activeTab, setActiveTab] = useState('offer');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Inline "vendor can't find sub-category" quick-create flow
  const [subCatCreateOpen, setSubCatCreateOpen] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatImage, setNewSubCatImage] = useState(null);
  const [newSubCatCommissionRate, setNewSubCatCommissionRate] = useState(15);
  const [creatingSubCat, setCreatingSubCat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Synchronous guard — refs update instantly (unlike state), blocking
   * rapid double-clicks that fire before React re-renders the disabled
   * button from `isSubmitting` state. */
  const submitInFlightRef = useRef(false);

  // useEffect(() => {
  //   if (!isOpen) return;
  //   dispatch(getCategories());
  //   if (mode !== 'edit') {
  //     setForm(defaultFormState());
  //     setUploadedFiles([]);
  //     setPreviewUrls([]);
  //   }
  // }, [dispatch, isOpen, mode]);

  // Revoke old object URLs on cleanup
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(getCategories());
    if (mode !== 'edit') {
      setForm({
        ...defaultFormState(),
        categoryId: prefillCategoryId || '',
        category: prefillCategoryName || '',
        subCategoryId: prefillSubCategoryId || '',
        subCategory: prefillSubCategoryName || '',
      });
      if (prefillCategoryId) dispatch(getSubCategories(prefillCategoryId));
      setUploadedFiles([]);
      setPreviewUrls([]);
    } else {
      setUploadedFiles([]);
      setPreviewUrls([]);
    }
  }, [
    dispatch,
    isOpen,
    mode,
    prefillCategoryId,
    prefillCategoryName,
    prefillSubCategoryId,
    prefillSubCategoryName,
  ]);

  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !initialData) return;
    if (!categories?.length) return;

    const meta = initialData.serviceMeta || {};
    const existingSchedule = Array.isArray(initialData.availabilitySchedule)
      ? initialData.availabilitySchedule
      : defaultSchedule();

    const matchedCat = (categories || []).find(
      (c) =>
        String(c.name).toLowerCase() ===
        String(initialData.category || '').toLowerCase(),
    );

    if (matchedCat) {
      dispatch(getSubCategories(matchedCat._id));
    }

    setForm((p) => ({
      ...p,
      categoryId: matchedCat?._id || '',
      subCategoryId: '',
      category: initialData.category || '',
      subCategory: initialData.subCategory || '',
      productName: initialData.productName || '',
      serviceType: meta.serviceType || '',
      sellingPrice: String(initialData.price || ''),
      included:
        Array.isArray(meta.included) && meta.included.length
          ? meta.included
          : [''],
      excluded:
        Array.isArray(meta.excluded) && meta.excluded.length
          ? meta.excluded
          : [''],
      images: [],
      existingImageUrls: Array.isArray(initialData.images)
        ? initialData.images.filter(Boolean)
        : initialData.image
          ? [initialData.image]
          : [],
      amc: {
        serviceCount: String(meta?.amc?.serviceCount ?? '4'),
        autoScheduleServices: !!meta?.amc?.autoScheduleServices,
        automatedServiceReminders: !!meta?.amc?.automatedServiceReminders,
        totalAmcFees: String(meta?.amc?.totalAmcFees ?? ''),
      },
      availabilitySchedule: existingSchedule,
    }));
  }, [isOpen, mode, initialData, categories, dispatch]);

  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !initialData) return;
    if (!subCategories?.length) return;

    const matchedSub = subCategories.find(
      (s) =>
        String(s.name).toLowerCase() ===
        String(initialData.subCategory || '').toLowerCase(),
    );
    if (matchedSub) {
      setForm((p) => ({
        ...p,
        subCategoryId: matchedSub._id,
      }));
    }
  }, [isOpen, mode, initialData, subCategories]);

  // const availableCategories = useMemo(
  //   () =>
  //     (categories || []).filter((c) => c.availableInRent || c.availableInBuy),
  //   [categories],
  // );

  const availableCategories = useMemo(
    () => (categories || []).filter((c) => c.availableInServices),
    [categories],
  );

  const availableSubCategories = useMemo(
    () =>
      (subCategories || []).filter(
        (s) =>
          String(s.category || '') === String(form.categoryId || '') &&
          s.availableInServices,
      ),
    [subCategories, form.categoryId],
  );

  const categoryList = availableCategories;

  const applyCategory = (id) => {
    const cat = categoryList.find((c) => String(c._id) === String(id));
    setForm((prev) => ({
      ...prev,
      categoryId: String(id || ''),
      subCategoryId: '',
      category: cat?.name || '',
      subCategory: '',
    }));
    if (id) dispatch(getSubCategories(id));
  };
  const applySubCategory = (id) => {
    const sub = availableSubCategories.find(
      (s) => String(s._id) === String(id),
    );
    setForm((prev) => ({
      ...prev,
      subCategoryId: String(id || ''),
      subCategory: sub?.name || '',
    }));
  };

  const handleCreateSubCategory = async () => {
    if (!newSubCatName.trim()) {
      toast.error('Enter a sub-category name.');
      return;
    }
    if (!form.categoryId) {
      toast.error('Select a main category first.');
      return;
    }
    if (!newSubCatImage) {
      toast.error('Add a sub-category image.');
      return;
    }
    setCreatingSubCat(true);
    try {
      const fd = new FormData();
      fd.append('name', newSubCatName.trim());
      fd.append('categoryId', form.categoryId);
      fd.append('image', newSubCatImage);
      fd.append('commissionRate', String(newSubCatCommissionRate || 0));
      fd.append('availableInServices', 'true');
      const res = await apiVendorCreateSubCategory(fd, token);
      const created = res?.data?.subCategory;
      toast.success('Sub-category created.');
      await dispatch(getSubCategories(form.categoryId));
      if (created?._id) {
        applySubCategory(created._id);
      }
      setSubCatCreateOpen(false);
      setNewSubCatName('');
      setNewSubCatImage(null);
      setNewSubCatCommissionRate(15);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || 'Failed to create sub-category.',
      );
    } finally {
      setCreatingSubCat(false);
    }
  };

  const handleMatchLowestPrice = () => {
    if (!lowestServicePrice) return;
    setForm((p) => ({
      ...p,
      sellingPrice: String(lowestServicePrice),
    }));
  };

  const updateRow = (key, index, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((x, i) => (i === index ? value : x)),
    }));
  };

  const addRow = (key, factory) => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], factory()] }));
  };

  const removeRow = (key, index, fallbackFactory) => {
    setForm((prev) => {
      const next = prev[key].filter((_, i) => i !== index);
      return { ...prev, [key]: next.length ? next : [fallbackFactory()] };
    });
  };

  const updateSpec = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      productCustomSpecs: prev.productCustomSpecs.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const updateScheduleDay = (day, patch) => {
    setForm((prev) => ({
      ...prev,
      availabilitySchedule: prev.availabilitySchedule.map((slot) =>
        slot.day === day ? { ...slot, ...patch } : slot,
      ),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    // Revoke previous URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, images: files }));
    setUploadedFiles(files);
    setPreviewUrls(newUrls);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviewUrls(newUrls);
    setForm((prev) => ({ ...prev, images: newFiles }));
  };

  const submit = async (submissionStatus) => {
    if (submitInFlightRef.current) return;
    if (!form.category.trim()) return toast.error('Please select a category.');
    if (!form.subCategory.trim())
      return toast.error('Please select a sub-category.');
    if (!form.productName.trim())
      return toast.error('Please enter service title.');
    if (!form.sellingPrice.trim())
      return toast.error('Please enter selling price.');
    if (!form.images.length && !form.existingImageUrls?.length) {
      return toast.error('Please upload service media.');
    }
    const firstAvailableDay = form.availabilitySchedule.find(
      (s) => s.isAvailable,
    );
    if (!String(firstAvailableDay?.workDuration || '').trim()) {
      return toast.error('Work Duration is required');
    }
    submitInFlightRef.current = true;
    setIsSubmitting(true);

    const included = form.included.map((x) => x.trim()).filter(Boolean);
    const excluded = form.excluded.map((x) => x.trim()).filter(Boolean);
    const cleanSpecs = form.productCustomSpecs
      .map((row) => ({
        label: String(row.label || '').trim(),
        value: String(row.value || '').trim(),
      }))
      .filter((row) => row.label && row.value);
    const priceNum =
      Number(String(form.sellingPrice).replace(/[^\d.]/g, '')) || 0;

    const fd = new FormData();
    fd.append('productName', form.productName.trim());
    fd.append('type', 'Service');
    fd.append('category', form.category.trim());
    fd.append('subCategory', form.subCategory.trim());
    fd.append('brand', '');
    fd.append('condition', 'Brand New');
    fd.append('shortDescription', '');
    fd.append('description', '');
    fd.append('specifications', JSON.stringify({}));
    fd.append('productCustomSpecs', JSON.stringify(cleanSpecs));
    fd.append(
      'salesConfiguration',
      JSON.stringify({
        allowVendorEditSalePrice: true,
        salePrice: priceNum,
        mrpPrice: priceNum,
      }),
    );
    fd.append(
      'serviceMeta',
      JSON.stringify({
        serviceType: form.serviceType || '',
        included,
        excluded,
        amc: {
          serviceCount: Number(form.amc.serviceCount || 0),
          autoScheduleServices: !!form.amc.autoScheduleServices,
          automatedServiceReminders: !!form.amc.automatedServiceReminders,
          totalAmcFees: Number(form.amc.totalAmcFees || 0),
        },
      }),
    );
    fd.append(
      'availabilitySchedule',
      JSON.stringify(form.availabilitySchedule || []),
    );
    fd.append(
      'logisticsVerification',
      JSON.stringify({ inventoryOwnerName: '', city: '' }),
    );
    fd.append('refundableDeposit', '0');
    fd.append('existingImages', JSON.stringify(form.existingImageUrls || []));
    fd.append('price', String(form.sellingPrice).trim());
    fd.append('stock', '1');
    fd.append('submissionStatus', submissionStatus);
    fd.append('createdVia', 'manual');
    form.images.forEach((img) => fd.append('images', img));
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

  if (!isOpen) return null;

  const availableDays = form.availabilitySchedule.filter((s) => s.isAvailable);

  return (
    /* ── Overlay ── */
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3">
      {/* ── Modal Shell — same large size as before ── */}
      <div
        className="flex min-h-0 w-full max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ════════════════════════════════
            STICKY HEADER
        ════════════════════════════════ */}
        <div className="shrink-0 bg-white border-b border-gray-100">
          {/* Title row */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Add New Listing
              </h2>
              {/* <p className="text-[11px] text-gray-400 mt-0.5">
                Edit your product, rental or service
              </p> */}
            </div>
            {/* ── X Close Button ── */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 pb-4">
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
            {/* <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900">Rent Out</p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                  Monthly rental
                </p>
              </div>
            </div> */}
            <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
              <Key className="h-6 w-6 text-gray-500 flex-shrink-0" />

              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900">Rent Out</p>
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
            <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-blue-500 bg-white px-4 py-3.5 ring-1 ring-blue-200">
              <Wrench className="h-6 w-6 text-blue-600 flex-shrink-0" />

              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-blue-600">
                  Offer Service
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                  Hourly / Fixed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            SCROLLABLE BODY
        ════════════════════════════════ */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-5 py-4 space-y-4">
          {/* ── What are you Servicing? ── */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                <Wrench className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  What are you Servicing ?
                </h3>
                <p className="text-[11px] text-gray-400">
                  Select category to see relevant fields
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[11px] font-semibold text-gray-600">
                Step 1 : Main Category <span className="text-red-400">*</span>
              </p>
              <div className="grid grid-cols-5 gap-2">
                {categoryList.slice(0, 10).map((cat) => {
                  const selected = form.categoryId === String(cat._id);
                  const asset = String(cat.icon || cat.image || '').trim();
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => applyCategory(cat._id)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all hover:shadow-sm ${
                        selected
                          ? 'border-orange-400 bg-orange-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {asset ? (
                        <img
                          src={asset}
                          alt={cat.name}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <Package
                          className={`h-6 w-6 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
                          strokeWidth={1.75}
                        />
                      )}
                      <span
                        className={`text-[10px] font-medium leading-tight ${selected ? 'text-orange-600' : 'text-gray-600'}`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between flex-wrap gap-2">
                <p className="text-[11px] font-semibold text-gray-600">
                  Step 2 : Sub Category <span className="text-red-400">*</span>
                </p>
                {form.categoryId ? (
                  <button
                    type="button"
                    onClick={() => setSubCatCreateOpen(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-violet-600"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2} />
                    Sub Category
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {/* {(availableSubCategories.length > 0
                  ? availableSubCategories
                  : categoryList
                )
                  .slice(0, 10)
                  .map((cat) => {
                    const selected = form.subCategoryId === String(cat._id);
                    const asset = String(cat.icon || cat.image || '').trim();
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() =>
                          availableSubCategories.length > 0
                            ? applySubCategory(cat._id)
                            : null
                        } */}
                {availableSubCategories.slice(0, 10).map((cat) => {
                  const selected = form.subCategoryId === String(cat._id);
                  const asset = String(cat.icon || cat.image || '').trim();
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => applySubCategory(cat._id)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all hover:shadow-sm ${
                        selected
                          ? 'border-orange-400 bg-orange-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {asset ? (
                        <img
                          src={asset}
                          alt={cat.name}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <Package
                          className={`h-6 w-6 ${selected ? 'text-orange-500' : 'text-gray-400'}`}
                          strokeWidth={1.75}
                        />
                      )}
                      <span
                        className={`text-[10px] font-medium leading-tight ${selected ? 'text-orange-600' : 'text-gray-500'}`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Basic Details ── */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Basic Details
            </h3>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Service Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, productName: e.target.value }))
                }
                placeholder="e.g. Home Cleaning"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                What will be Included <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {form.included.map((row, idx) => (
                  <div key={`inc-${idx}`} className="flex gap-2">
                    <input
                      value={row}
                      onChange={(e) =>
                        updateRow('included', idx, e.target.value)
                      }
                      placeholder="e.g. Drain,pipe-cleaning"
                      className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    {idx === 0 ? (
                      <button
                        type="button"
                        onClick={() => addRow('included', emptyTextRow)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeRow('included', idx, emptyTextRow)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                What will be Excluded <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {form.excluded.map((row, idx) => (
                  <div key={`exc-${idx}`} className="flex gap-2">
                    <input
                      value={row}
                      onChange={(e) =>
                        updateRow('excluded', idx, e.target.value)
                      }
                      placeholder="e.g. Spare parts cost (charged separately if needed)"
                      className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    {idx === 0 ? (
                      <button
                        type="button"
                        onClick={() => addRow('excluded', emptyTextRow)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeRow('excluded', idx, emptyTextRow)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Service Media <span className="text-red-400">*</span>
              </label>
              <p className="mb-2 text-[11px] text-gray-400">
                Upload up to 5 high quality Media. First Image will be the cover
                photo.
              </p>

              {previewUrls.length > 0 && (
                <div className="mb-3 grid grid-cols-5 gap-2">
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                          COVER
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {previewUrls.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40 transition-all">
                      <Plus className="h-5 w-5 text-gray-400" />
                      <span className="mt-1 text-[10px] text-gray-400">
                        Add more
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              )}

              {previewUrls.length === 0 && (
                <label className="group flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center hover:border-blue-300 hover:bg-blue-50/40 transition-all">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-[#DBEAFE] shadow-sm group-hover:border-blue-200 transition-colors">
                    <Upload className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[11px] text-gray-400">
                      PNG, JPG up to 10MB &bull; {uploadedFiles.length}/5
                      uploaded
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div> */}

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Service Media <span className="text-red-400">*</span>
              </label>
              <p className="mb-2 text-[11px] text-gray-400">
                Upload up to 5 high quality Media. First Image will be the cover
                photo.
              </p>

              {/* Existing images from server (edit mode) */}
              {form.existingImageUrls?.length > 0 &&
                previewUrls.length === 0 && (
                  <div className="mb-3 grid grid-cols-5 gap-2">
                    {form.existingImageUrls.map((url, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                      >
                        <img
                          src={url}
                          alt={`Existing ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                            COVER
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              existingImageUrls: p.existingImageUrls.filter(
                                (_, i) => i !== idx,
                              ),
                            }))
                          }
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Allow replacing with new upload */}
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40 transition-all">
                      <Plus className="h-5 w-5 text-gray-400" />
                      <span className="mt-1 text-[10px] text-gray-400">
                        Replace
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}

              {/* New uploaded previews */}
              {previewUrls.length > 0 && (
                <div className="mb-3 grid grid-cols-5 gap-2">
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                          COVER
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {previewUrls.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40 transition-all">
                      <Plus className="h-5 w-5 text-gray-400" />
                      <span className="mt-1 text-[10px] text-gray-400">
                        Add more
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Upload area — only show when no images at all */}
              {previewUrls.length === 0 && !form.existingImageUrls?.length && (
                <label className="group flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center hover:border-blue-300 hover:bg-blue-50/40 transition-all">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-[#DBEAFE] shadow-sm group-hover:border-blue-200 transition-colors">
                    <Upload className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[11px] text-gray-400">
                      PNG, JPG up to 10MB &bull; {uploadedFiles.length}/5
                      uploaded
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </section>

          {/* ── Sales Configuration ── */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] ">
                <Tag className="h-4 w-4 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Service Configuration
                </h3>
                <p className="text-[11px] text-gray-400">
                  Set pricing and inventory details
                </p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Specific Service Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.serviceType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      serviceType: e.target.value,
                    }))
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                >
                  {SERVICE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  ▾
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Service Price <span className="text-red-400">*</span>
              </label>
              {/* <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#2563EB]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sellingPrice: e.target.value,
                    }))
                  }
                  placeholder="Enter your price"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-8 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div> */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#2563EB] pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sellingPrice: e.target.value,
                    }))
                  }
                  // placeholder="Enter your price"
                  // className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  placeholder="0"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                />
              </div>
            </div>
            {/* Market Insights */}
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
                    {form.sellingPrice
                      ? `₹${String(form.sellingPrice).replace(/[^\d.]/g, '')}`
                      : '₹0'}
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
                disabled={!lowestServicePrice}
                className={`w-full rounded-xl py-3 text-sm font-semibold ${
                  lowestServicePrice
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
            {/* AMC Box */}
            {/* <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 space-y-3.5">
              <h4 className="text-xs font-bold text-gray-800">
                AMC ( Annual Maintaince Cost )
              </h4>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                  Service Count
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...p.amc,
                          serviceCount: String(
                            Math.max(0, Number(p.amc.serviceCount) - 1),
                          ),
                        },
                      }))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={form.amc.serviceCount}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: { ...p.amc, serviceCount: e.target.value },
                      }))
                    }
                    className="w-14 rounded-lg border border-gray-200 py-1.5 text-center text-sm font-semibold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...p.amc,
                          serviceCount: String(Number(p.amc.serviceCount) + 1),
                        },
                      }))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-[11px] text-gray-400">
                    services/year
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-gray-400">
                  Number of scheduled maintenance services per year
                </p>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={!!form.amc.autoScheduleServices}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...p.amc,
                          autoScheduleServices: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-3.5 w-3.5 accent-orange-500"
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-800">
                      Auto-Schedule Services
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Divide service visits equally across months (e.g., 4
                      services ÷ every 3 months)
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-white px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      Automated Service Reminders
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Send automated reminders to customers before scheduled
                      service dates
                    </p>
                  </div>
                </div>
                <label className="relative ml-3 inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={!!form.amc.automatedServiceReminders}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...p.amc,
                          automatedServiceReminders: e.target.checked,
                        },
                      }))
                    }
                  />
                  <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-orange-500 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                  AMC Fee (Monthly)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.amc.totalAmcFees}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: { ...p.amc, totalAmcFees: e.target.value },
                      }))
                    }
                    placeholder="100"
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
              >
                💾 Save AMC
              </button>
            </div> */}
            .
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
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      amc: { ...p.amc, serviceCount: e.target.value },
                    }))
                  }
                  placeholder="Services / Year"
                  className="w-full rounded-xl border border-[#DAB2FF] px-3 py-2.5 text-sm outline-none bg-white"
                />
              </div>

              {/* Auto Schedule */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-orange-200 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!form?.amc?.autoScheduleServices}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...p.amc,
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
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      amc: {
                        ...p.amc,
                        automatedServiceReminders:
                          !p?.amc?.automatedServiceReminders,
                      },
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form?.amc?.automatedServiceReminders
                      ? 'bg-orange-500'
                      : 'bg-orange-200'
                  }`}
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
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: { ...p.amc, totalAmcFees: e.target.value },
                      }))
                    }
                    placeholder="199/-"
                    className="w-full rounded-xl border border-[#DAB2FF] pl-8 pr-3 py-2.5 text-sm outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Availability Schedule ── */}
          {/* <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Availability Schedule
                </h3>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 tracking-wide">
                YOUR OPERATIONS
              </span>
            </div>

         
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Same Hours for All Days
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Apply service hours uniformly across all working days
                </p>
              </div>
              <label className="relative ml-4 inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={form.sameHoursAllDays}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      sameHoursAllDays: e.target.checked,
                    }))
                  }
                />
                <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-blue-500 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>

           
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Working Days
              </p>
              <div className="flex items-center gap-2">
                {form.availabilitySchedule.map((slot, idx) => (
                  <button
                    key={slot.day}
                    type="button"
                    onClick={() =>
                      updateScheduleDay(slot.day, {
                        isAvailable: !slot.isAvailable,
                      })
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      slot.isAvailable
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'border border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {DAY_LABELS[idx]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400">
                Select days you provide service
              </p>
            </div>

           
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Service Hours
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] text-gray-500">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={availableDays[0]?.startTime || '09:00'}
                    onChange={(e) => {
                      if (form.sameHoursAllDays) {
                        form.availabilitySchedule
                          .filter((s) => s.isAvailable)
                          .forEach((s) =>
                            updateScheduleDay(s.day, {
                              startTime: e.target.value,
                            }),
                          );
                      } else {
                        updateScheduleDay(availableDays[0]?.day, {
                          startTime: e.target.value,
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-gray-500">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={availableDays[0]?.endTime || '18:00'}
                    onChange={(e) => {
                      if (form.sameHoursAllDays) {
                        form.availabilitySchedule
                          .filter((s) => s.isAvailable)
                          .forEach((s) =>
                            updateScheduleDay(s.day, {
                              endTime: e.target.value,
                            }),
                          );
                      } else {
                        updateScheduleDay(availableDays[0]?.day, {
                          endTime: e.target.value,
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400">
                Hours you are available for service bookings
              </p>
            </div>

      
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Break Time (Optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] text-gray-500">
                    Break Start
                  </label>
                  <input
                    type="time"
                    value={availableDays[0]?.breakStart || ''}
                    onChange={(e) =>
                      updateScheduleDay(availableDays[0]?.day, {
                        breakStart: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-gray-500">
                    Break End
                  </label>
                  <input
                    type="time"
                    value={availableDays[0]?.breakEnd || ''}
                    onChange={(e) =>
                      updateScheduleDay(availableDays[0]?.day, {
                        breakEnd: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400">
                No bookings will be accepted during break time
              </p>
            </div>

        
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Work Duration <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={availableDays[0]?.workDuration || ''}
                onChange={(e) =>
                  updateScheduleDay(availableDays[0]?.day, {
                    workDuration: e.target.value,
                  })
                }
                placeholder="e.g. 2 hours"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

         
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Custom Specifications
                </p>
                <button
                  type="button"
                  onClick={() => addRow('productCustomSpecs', emptySpecRow)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-600 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Custom Specification
                </button>
              </div>
              {form.productCustomSpecs.map((row, idx) => (
                <div
                  key={`spec-${idx}`}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2"
                >
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateSpec(idx, 'label', e.target.value)}
                    placeholder="e.g. Fabric Material"
                    className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                    placeholder="e.g. Velvet"
                    className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeRow('productCustomSpecs', idx, emptySpecRow)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section> */}
          <section className="rounded-2xl border border-[#D8B4FE] bg-white p-4 sm:p-5 space-y-5">
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
              {/* <button
                type="button"
                role="switch"
                aria-checked={form.sameHoursAllDays}
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    sameHoursAllDays: !p.sameHoursAllDays,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  form.sameHoursAllDays ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    form.sameHoursAllDays ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button> */}
              <button
                type="button"
                role="switch"
                aria-checked={form.sameHoursAllDays}
                onClick={() =>
                  setForm((p) => {
                    const turningOn = !p.sameHoursAllDays;
                    if (turningOn) {
                      const updatedSchedule = (
                        p.availabilitySchedule || []
                      ).map((slot) => ({
                        ...slot,
                        isAvailable: slot.day !== 'Sun',
                      }));
                      return {
                        ...p,
                        sameHoursAllDays: true,
                        availabilitySchedule: updatedSchedule,
                        schedule: updatedSchedule,
                      };
                    }
                    return { ...p, sameHoursAllDays: false };
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  form.sameHoursAllDays ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    form.sameHoursAllDays ? 'translate-x-5' : 'translate-x-0.5'
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
                {form.availabilitySchedule.map((slot, idx) => (
                  <button
                    key={slot.day}
                    type="button"
                    onClick={() =>
                      updateScheduleDay(slot.day, {
                        isAvailable: !slot.isAvailable,
                      })
                    }
                    className={`rounded-xl py-3 text-sm font-medium border transition ${
                      slot.isAvailable
                        ? 'bg-orange-500 text-white border-orange-500 shadow'
                        : 'bg-white text-gray-500 border-gray-300'
                    }`}
                  >
                    {DAY_LABELS[idx]}
                  </button>
                ))}
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
                  <label className="text-xs text-gray-500">Start Time</label>
                  <input
                    type="time"
                    value={availableDays[0]?.startTime || '09:00'}
                    onChange={(e) => {
                      if (form.sameHoursAllDays) {
                        form.availabilitySchedule
                          .filter((s) => s.isAvailable)
                          .forEach((s) =>
                            updateScheduleDay(s.day, {
                              startTime: e.target.value,
                            }),
                          );
                      } else {
                        updateScheduleDay(availableDays[0]?.day, {
                          startTime: e.target.value,
                        });
                      }
                    }}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Time</label>
                  <input
                    type="time"
                    value={availableDays[0]?.endTime || '18:00'}
                    onChange={(e) => {
                      if (form.sameHoursAllDays) {
                        form.availabilitySchedule
                          .filter((s) => s.isAvailable)
                          .forEach((s) =>
                            updateScheduleDay(s.day, {
                              endTime: e.target.value,
                            }),
                          );
                      } else {
                        updateScheduleDay(availableDays[0]?.day, {
                          endTime: e.target.value,
                        });
                      }
                    }}
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
                  <label className="text-xs text-gray-500">Break Start</label>
                  <input
                    type="time"
                    value={availableDays[0]?.breakStart || ''}
                    onChange={(e) =>
                      updateScheduleDay(availableDays[0]?.day, {
                        breakStart: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Break End</label>
                  <input
                    type="time"
                    value={availableDays[0]?.breakEnd || ''}
                    onChange={(e) =>
                      updateScheduleDay(availableDays[0]?.day, {
                        breakEnd: e.target.value,
                      })
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
                value={availableDays[0]?.workDuration || ''}
                onChange={(e) =>
                  updateScheduleDay(availableDays[0]?.day, {
                    workDuration: e.target.value,
                  })
                }
                placeholder="60"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
              />
            </div>

            {/* Custom Specs */}
            {/* <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Custom Specifications
                </p>
                <button
                  type="button"
                  onClick={() => addRow('productCustomSpecs', emptySpecRow)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-600 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Custom Specification
                </button>
              </div>
              {form.productCustomSpecs.map((row, idx) => (
                <div
                  key={`spec-${idx}`}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2"
                >
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateSpec(idx, 'label', e.target.value)}
                    placeholder="e.g. Fabric Material"
                    className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                    placeholder="e.g. Velvet"
                    className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeRow('productCustomSpecs', idx, emptySpecRow)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div> */}
          </section>
        </div>

        {/* ════════════════════════════════
            STICKY FOOTER
        ════════════════════════════════ */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => submit('draft')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => submit('published')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? 'Submitting…'
              : mode === 'edit'
                ? 'Update'
                : 'Send for Approval'}
          </button>
        </div>
      </div>

      {/* Vendor quick-create sub-category modal */}
      {subCatCreateOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/40">
          <div
            className="absolute inset-0"
            role="presentation"
            onClick={() => !creatingSubCat && setSubCatCreateOpen(false)}
          />
          <div
            className="relative flex w-full max-w-lg flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div className="min-w-0 pr-2">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900">
                  Add New Sub-category
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Can&apos;t find the right sub-category? Add one for your
                  service.
                </p>
              </div>
              <button
                type="button"
                disabled={creatingSubCat}
                onClick={() => setSubCatCreateOpen(false)}
                className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <input
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  placeholder="e.g., Deep Cleaning"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Category
                </label>
                <input
                  value={form.category}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 outline-none"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  This sub-category will be added under the main category you
                  selected above.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Commission Rate <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={newSubCatCommissionRate}
                    onChange={(e) => setNewSubCatCommissionRate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    %
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Platform&apos;s percentage share for this category
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-800">
                  Sub-category Image <span className="text-red-500">*</span>
                </p>
                <label className="flex flex-col items-center justify-center min-h-[168px] rounded-xl border border-gray-200 bg-gray-50/80 hover:border-orange-200 hover:bg-orange-50/20 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setNewSubCatImage(e.target.files?.[0] || null)
                    }
                  />
                  {newSubCatImage ? (
                    <div className="relative p-3 w-full">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setNewSubCatImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:text-red-600"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={URL.createObjectURL(newSubCatImage)}
                        alt=""
                        className="mx-auto max-h-32 object-contain rounded-lg"
                      />
                      <p className="text-xs text-center text-gray-600 mt-2 truncate px-2">
                        {newSubCatImage.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-10 px-4">
                      <ImageIcon
                        className="w-9 h-9 text-orange-500"
                        strokeWidth={1.75}
                      />
                      <span className="text-sm font-medium text-orange-500">
                        Select from Media Library
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG, WebP
                      </span>
                    </div>
                  )}
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  512x512px recommended for app grids
                </p>
              </div>

              <p className="text-xs text-gray-500 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                New sub-categories may be reviewed by the admin team before
                appearing elsewhere on the platform.
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <button
                type="button"
                disabled={creatingSubCat}
                onClick={() => setSubCatCreateOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={creatingSubCat}
                onClick={handleCreateSubCategory}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-60"
              >
                {creatingSubCat ? (
                  'Creating…'
                ) : (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    Create Sub-category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
