// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import {
//   Bell,
//   Box,
//   Calendar,
//   Package,
//   Search,
//   Tag,
//   Upload,
//   X,
//   Send,
//   Plus,
//   Wrench,
// } from 'lucide-react';
// import {
//   getCategories,
//   getSubCategories,
// } from '../../../redux/slices/categorySlice';
// import { apiCreateSubCategory } from '@/service/api';

// const emptySpecRow = () => ({ label: '', value: '' });

// const emptyTextRow = () => '';

// const SERVICE_TYPE_OPTIONS = [
//   'Regular',
//   'AMC (Annual Maintenance Cost)',
//   'Installation',
//   'Repair',
// ];

// const defaultAmcConfig = {
//   serviceCount: '',
//   autoScheduleServices: false,
//   automatedServiceReminders: true,
//   totalAmcFees: '',
// };

// /** Prefer icon URL, then image, for category / subcategory picker cards. */
// function categoryOrSubAssetUrl(item) {
//   const icon = String(item?.icon || '').trim();
//   if (icon) return icon;
//   const img = String(item?.image || '').trim();
//   return img || '';
// }

// const defaultFormState = () => ({
//   category: '',
//   subCategory: '',
//   productName: '',
//   included: [emptyTextRow()],
//   excluded: [emptyTextRow()],
//   images: [],
//   existingImages: [],
//   productCustomSpecs: [emptySpecRow()],
//   serviceType: SERVICE_TYPE_OPTIONS[1],
//   sellingPrice: '',
//   allowVendorEditSalePrice: true,
//   amc: { ...defaultAmcConfig },
// });

// function parseIncludedExcluded(meta, description = '') {
//   const fromMetaIncluded = Array.isArray(meta?.included) ? meta.included : [];
//   const fromMetaExcluded = Array.isArray(meta?.excluded) ? meta.excluded : [];
//   if (fromMetaIncluded.length || fromMetaExcluded.length) {
//     return {
//       included: fromMetaIncluded.length ? fromMetaIncluded : [emptyTextRow()],
//       excluded: fromMetaExcluded.length ? fromMetaExcluded : [emptyTextRow()],
//     };
//   }

//   const lines = String(description || '').split('\n');
//   const included = [];
//   const excluded = [];
//   let mode = '';
//   for (const raw of lines) {
//     const line = raw.trim();
//     if (!line) continue;
//     const lower = line.toLowerCase();
//     if (lower.startsWith('what is included')) {
//       mode = 'included';
//       continue;
//     }
//     if (lower.startsWith('what is excluded')) {
//       mode = 'excluded';
//       continue;
//     }
//     if (line.startsWith('-')) {
//       const value = line.slice(1).trim();
//       if (!value) continue;
//       if (mode === 'included') included.push(value);
//       if (mode === 'excluded') excluded.push(value);
//     }
//   }
//   return {
//     included: included.length ? included : [emptyTextRow()],
//     excluded: excluded.length ? excluded : [emptyTextRow()],
//   };
// }

// export default function AdminServiceAddModal({
//   isOpen,
//   onClose,
//   onSubmit,
//   mode = 'create',
//   initialData = null,
//   existingProducts = [],
// }) {
//   const dispatch = useDispatch();
//   const { categories, subCategories } = useSelector((state) => state.category);

//   const [selectedCategoryId, setSelectedCategoryId] = useState('');
//   const [searchText, setSearchText] = useState('');
//   const [form, setForm] = useState(defaultFormState);

//   // Inline "Add New Sub-category" quick-create modal
//   const [subCatCreateOpen, setSubCatCreateOpen] = useState(false);
//   const [newSubCatName, setNewSubCatName] = useState('');
//   const [newSubCatImage, setNewSubCatImage] = useState(null);
//   const [newSubCatCommissionRate, setNewSubCatCommissionRate] = useState(15);
//   const [creatingSubCat, setCreatingSubCat] = useState(false);
//   useEffect(() => {
//     if (!isOpen) return;
//     dispatch(getCategories());
//   }, [isOpen, dispatch]);

//   useEffect(() => {
//     if (!isOpen) return;
//     setSearchText('');
//     if (!initialData) {
//       setSelectedCategoryId('');
//       setForm(defaultFormState());
//       return;
//     }
//     // Restore selectedCategoryId so subcategory filter works in edit mode
//     const matchedCat = (categories || []).find(
//       (c) =>
//         String(c.name).toLowerCase() ===
//         String(initialData.category || '').toLowerCase(),
//     );
//     if (matchedCat) {
//       setSelectedCategoryId(matchedCat._id);
//       dispatch(getSubCategories(matchedCat._id));
//     } else {
//       setSelectedCategoryId('');
//     }
//     const meta = initialData.serviceMeta || {};
//     const parsed = parseIncludedExcluded(meta, initialData.description);
//     const firstVariant = Array.isArray(initialData.variants)
//       ? initialData.variants[0] || {}
//       : {};
//     setForm({
//       category: initialData.category || '',
//       subCategory: initialData.subCategory || '',
//       productName: initialData.productName || '',
//       included: parsed.included,
//       excluded: parsed.excluded,
//       images: [],
//       existingImages: Array.isArray(initialData.images)
//         ? initialData.images.filter(Boolean)
//         : initialData.image
//           ? [initialData.image]
//           : [],
//       productCustomSpecs:
//         Array.isArray(initialData.productCustomSpecs) &&
//         initialData.productCustomSpecs.length
//           ? initialData.productCustomSpecs
//           : [emptySpecRow()],
//       serviceType: String(meta.serviceType || SERVICE_TYPE_OPTIONS[1]),
//       sellingPrice: String(
//         initialData.salesConfiguration?.salePrice ||
//           firstVariant?.price ||
//           initialData.price ||
//           '',
//       ).trim(),
//       allowVendorEditSalePrice:
//         initialData.salesConfiguration?.allowVendorEditSalePrice !== false,
//       amc: {
//         ...defaultAmcConfig,
//         ...(meta.amc || {}),
//       },
//     });
//   }, [isOpen, initialData]);

//   const availableCategories = useMemo(
//     () => (categories || []).filter((c) => c.availableInServices),
//     [categories],
//   );

//   const availableSubCategories = useMemo(
//     () =>
//       (subCategories || []).filter(
//         (s) =>
//           String(s.category || '') === String(selectedCategoryId || '') &&
//           s.availableInServices,
//       ),
//     [subCategories, selectedCategoryId],
//   );

//   const newImagePreviews = useMemo(
//     () => (form.images || []).map((file) => URL.createObjectURL(file)),
//     [form.images],
//   );

//   useEffect(() => {
//     return () => {
//       newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
//     };
//   }, [newImagePreviews]);

//   // const filteredExistingProducts = useMemo(() => {
//   //   const term = String(searchText || '')
//   //     .trim()
//   //     .toLowerCase();
//   //   const list = Array.isArray(existingProducts) ? existingProducts : [];
//   //   const base = list.filter((p) => p?._id && p._id !== initialData?._id);
//   //   if (!term) return base;
//   //   return base.filter((p) => {
//   //     const name = String(p?.productName || '').toLowerCase();
//   //     const category = String(p?.category || '').toLowerCase();
//   //     const subCategory = String(p?.subCategory || '').toLowerCase();
//   //     return (
//   //       name.includes(term) ||
//   //       category.includes(term) ||
//   //       subCategory.includes(term)
//   //     );
//   //   });
//   // }, [existingProducts, initialData?._id, searchText]);

//   const filteredExistingProducts = useMemo(() => {
//     const term = String(searchText || '')
//       .trim()
//       .toLowerCase();
//     const list = Array.isArray(existingProducts) ? existingProducts : [];
//     const selectedCat = String(form.category || '')
//       .trim()
//       .toLowerCase();
//     const selectedSub = String(form.subCategory || '')
//       .trim()
//       .toLowerCase();
//     const base = list
//       .filter((p) => p?._id && p._id !== initialData?._id)
//       .filter((p) => {
//         if (
//           selectedCat &&
//           String(p?.category || '')
//             .trim()
//             .toLowerCase() !== selectedCat
//         ) {
//           return false;
//         }
//         if (
//           selectedSub &&
//           String(p?.subCategory || '')
//             .trim()
//             .toLowerCase() !== selectedSub
//         ) {
//           return false;
//         }
//         return true;
//       });
//     if (!term) return base;
//     return base.filter((p) => {
//       const name = String(p?.productName || '').toLowerCase();
//       const category = String(p?.category || '').toLowerCase();
//       const subCategory = String(p?.subCategory || '').toLowerCase();
//       return (
//         name.includes(term) ||
//         category.includes(term) ||
//         subCategory.includes(term)
//       );
//     });
//   }, [
//     existingProducts,
//     initialData?._id,
//     searchText,
//     form.category,
//     form.subCategory,
//   ]);

//   const rowThumb = (p) =>
//     p?.images?.[0] ||
//     p?.image ||
//     'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG';

//   const applyCategory = (id) => {
//     setSelectedCategoryId(id);
//     const cat = availableCategories.find((c) => c._id === id);
//     setForm((prev) => ({
//       ...prev,
//       category: cat?.name || '',
//       subCategory: '',
//     }));
//     if (id) dispatch(getSubCategories(id));
//   };

//   const applySubCategory = (id) => {
//     const sub = (subCategories || []).find((s) => s._id === id);
//     setForm((prev) => ({ ...prev, subCategory: sub?.name || '' }));
//   };

//   const handleCreateSubCategory = async () => {
//     const adminToken =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
//     if (!newSubCatName.trim()) {
//       toast.error('Enter a sub-category name.');
//       return;
//     }
//     if (!selectedCategoryId) {
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
//       fd.append('categoryId', selectedCategoryId);
//       fd.append('image', newSubCatImage);
//       fd.append('commissionRate', String(newSubCatCommissionRate || 0));
//       // This modal only lists Services categories, so the created
//       // sub-category must be flagged for Services to show up as a tile.
//       fd.append('availableInServices', 'true');
//       const res = await apiCreateSubCategory(fd, adminToken);
//       const created = res?.data?.subCategory;
//       toast.success('Sub-category created.');
//       await dispatch(getSubCategories(selectedCategoryId));
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

//   const submit = (e) => {
//     e.preventDefault();
//     if (!form.category.trim())
//       return toast.error('Please select a main category.');
//     if (!form.subCategory.trim())
//       return toast.error('Please select a sub-category.');
//     if (!form.productName.trim())
//       return toast.error('Please enter a service title.');
//     if (!form.images.length && !form.existingImages.length) {
//       return toast.error('Please upload at least one service image.');
//     }

//     const included = form.included.map((x) => x.trim()).filter(Boolean);
//     const excluded = form.excluded.map((x) => x.trim()).filter(Boolean);
//     const specs = form.productCustomSpecs.filter(
//       (row) => String(row.label || '').trim() || String(row.value || '').trim(),
//     );
//     const servicePrice = String(form.sellingPrice || '').trim();
//     const amcPrice = String(form.amc.totalAmcFees || '').trim();

//     const variantRentalConfigurations =
//       form.serviceType.includes('AMC') && amcPrice
//         ? [
//             {
//               periodUnit: 'month',
//               months: 12,
//               label: 'Annual Plan',
//               tierLabel: 'AMC',
//               pricePerDay: Math.max(0, Number(amcPrice) / 365),
//               customerRent: Number(amcPrice) || 0,
//               customerShipping: 0,
//               vendorRent: Number(amcPrice) || 0,
//               vendorShipping: 0,
//             },
//           ]
//         : [];

//     const description = [
//       included.length ? `What is Included:\n- ${included.join('\n- ')}` : '',
//       excluded.length ? `What is Excluded:\n- ${excluded.join('\n- ')}` : '',
//     ]
//       .filter(Boolean)
//       .join('\n\n');

//     onSubmit?.({
//       sku: '',
//       productName: form.productName.trim(),
//       type: 'Service',
//       category: form.category,
//       subCategory: form.subCategory,
//       brand: '',
//       condition: 'Brand New',
//       description,
//       productCustomSpecs: specs,
//       specifications: {},
//       variants: [
//         {
//           variantName: form.productName.trim(),
//           price: servicePrice || amcPrice || '0',
//           stock: '1',
//           images: [],
//           existingVariantImages: [],
//           specRows: specs,
//           rentalPricingModel: 'month',
//           allowVendorEditRentalPrices: true,
//           rentalConfigurations: variantRentalConfigurations,
//           refundableDeposit: '0',
//         },
//       ],
//       rentalConfigurations: [],
//       refundableDeposit: '0',
//       logisticsVerification: { inventoryOwnerName: '', city: '' },
//       salesConfiguration: {
//         allowVendorEditSalePrice: !!form.allowVendorEditSalePrice,
//         salePrice: servicePrice || amcPrice || '0',
//         mrpPrice: servicePrice || amcPrice || '0',
//       },
//       price: servicePrice || amcPrice || '0',
//       stock: '1',
//       status: 'Active',
//       isActive: true,
//       images: form.images,
//       existingImages: form.existingImages,
//       serviceMeta: {
//         serviceType: form.serviceType,
//         included,
//         excluded,
//         amc: form.amc,
//       },
//     });
//   };

//   if (!isOpen) return null;

//   return (
//     // <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3">
//     <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 p-3">
//       <div className="flex min-h-0 w-full max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
//         <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900">
//               {mode === 'edit' ? 'Edit Service Listing' : 'Add New Listing'}
//             </h2>
//             <p className="text-xs text-gray-500 mt-0.5">
//               List your product, rental, or service.
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
//             aria-label="Close"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form
//           onSubmit={submit}
//           className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//             <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
//               <div className="min-w-0 text-left">
//                 <p className="text-sm font-semibold text-gray-900">
//                   Sell Product
//                 </p>
//                 <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
//                   One-time purchase
//                 </p>
//               </div>
//             </div>
//             <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
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

//             <div className="flex items-center justify-center gap-3 rounded-xl border-2 border-blue-500 bg-white px-4 py-3.5 ring-1 ring-blue-200">
//               <Wrench size={24} className="text-[#2563EB]" />

//               <div className="text-start">
//                 <p className="text-sm font-semibold text-[#2563EB]">
//                   Offer Service
//                 </p>
//                 <p className=" text-[11px] text-gray-500">Hourly/Fixed rate</p>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//             <div className="px-4 py-4 border-b border-gray-100 bg-white">
//               <div className="flex items-start gap-3">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                   <Tag className="h-5 w-5" strokeWidth={2} />
//                 </div>
//                 <div className="min-w-0">
//                   <h2 className="text-base font-semibold text-gray-900">
//                     What are you servicing?
//                   </h2>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Select category to see relevant fields
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className="p-4 sm:p-5 space-y-5">
//               <div>
//                 <p className="text-sm font-semibold text-gray-900 mb-3">
//                   Step 1: Main Category <span className="text-red-500">*</span>
//                 </p>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
//                   {availableCategories.map((c) => {
//                     const selected = form.category === c.name;
//                     const asset = categoryOrSubAssetUrl(c);
//                     return (
//                       <button
//                         key={c._id}
//                         type="button"
//                         onClick={() => applyCategory(c._id)}
//                         className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
//                           selected
//                             ? 'border-orange-500 bg-orange-50/50 shadow-sm'
//                             : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
//                         }`}
//                       >
//                         {asset ? (
//                           <img
//                             src={asset}
//                             alt=""
//                             className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
//                               selected ? '' : 'opacity-90'
//                             }`}
//                           />
//                         ) : (
//                           <Package
//                             className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
//                               selected ? 'text-orange-500' : 'text-gray-400'
//                             }`}
//                             strokeWidth={1.75}
//                           />
//                         )}
//                         <span
//                           className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
//                             selected ? 'text-orange-600' : 'text-gray-600'
//                           }`}
//                         >
//                           {c.name}
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
//                   <p className="text-sm font-semibold text-gray-900">
//                     Step 2: Sub Category <span className="text-red-500">*</span>
//                   </p>
//                   {selectedCategoryId ? (
//                     <button
//                       type="button"
//                       onClick={() => setSubCatCreateOpen(true)}
//                       className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
//                     >
//                       + Add New
//                     </button>
//                   ) : null}
//                 </div>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-3">
//                   {availableSubCategories.map((s) => {
//                     const selected = form.subCategory === s.name;
//                     const asset = categoryOrSubAssetUrl(s);
//                     return (
//                       <button
//                         key={s._id}
//                         type="button"
//                         onClick={() => applySubCategory(s._id)}
//                         className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 min-h-[5.5rem] text-center transition ${
//                           selected
//                             ? 'border-orange-500 bg-orange-50/50 shadow-sm'
//                             : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
//                         }`}
//                       >
//                         {asset ? (
//                           <img
//                             src={asset}
//                             alt=""
//                             className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
//                               selected ? '' : 'opacity-90'
//                             }`}
//                           />
//                         ) : (
//                           <Package
//                             className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
//                               selected ? 'text-orange-500' : 'text-gray-400'
//                             }`}
//                             strokeWidth={1.75}
//                           />
//                         )}
//                         <span
//                           className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
//                             selected ? 'text-orange-600' : 'text-gray-600'
//                           }`}
//                         >
//                           {s.name}
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                   <input
//                     type="text"
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     placeholder="Search your listed service"
//                     className="w-full rounded-lg border border-gray-200 bg-white px-9 py-2 text-sm"
//                   />
//                 </div>
//                 <div className="mt-3 max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
//                   {filteredExistingProducts.length === 0 ? (
//                     <p className="p-8 text-center text-sm text-gray-500">
//                       No products match your search.
//                     </p>
//                   ) : (
//                     <table className="min-w-full text-sm">
//                       <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
//                         <tr>
//                           <th className="px-3 py-2 font-medium">Product</th>
//                           <th className="px-3 py-2 font-medium">Category</th>
//                           <th className="px-3 py-2 font-medium">
//                             Sub-category
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {filteredExistingProducts.map((p) => (
//                           <tr key={p._id} className="hover:bg-gray-50/80">
//                             <td className="px-3 py-2">
//                               <div className="flex items-center gap-2">
//                                 <img
//                                   src={rowThumb(p)}
//                                   alt=""
//                                   className="h-11 w-11 rounded-lg object-cover border border-gray-100"
//                                 />
//                                 <div className="min-w-0">
//                                   <p className="font-medium text-gray-900 truncate max-w-[220px]">
//                                     {p.productName || '—'}
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-3 py-2 text-gray-600">
//                               {p.category || '—'}
//                             </td>
//                             <td className="px-3 py-2 text-gray-600">
//                               {p.subCategory || '—'}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//           <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-5">
//             <h3 className="text-base font-semibold text-gray-900">
//               Basic Details
//             </h3>

//             {/* Service Title */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium text-black">
//                 Service Title <span className="text-red-500">*</span>
//               </label>

//               <input
//                 type="text"
//                 value={form.productName}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, productName: e.target.value }))
//                 }
//                 placeholder="e.g. Home Cleaning"
//                 className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//               />
//             </div>

//             {/* Included */}
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <h4 className="text-sm font-semibold text-gray-900">
//                   What will Be Included <span className="text-red-500">*</span>
//                 </h4>

//                 <button
//                   type="button"
//                   disabled={form.included.length >= 10}
//                   onClick={() => {
//                     if (form.included.length < 10) {
//                       addRow('included', emptyTextRow);
//                     }
//                   }}
//                   className={`h-8 w-8 rounded-lg text-white text-lg leading-none flex items-center justify-center ${
//                     form.included.length >= 10
//                       ? 'bg-gray-300 cursor-not-allowed'
//                       : 'bg-purple-500'
//                   }`}
//                 >
//                   +
//                 </button>
//               </div>

//               {form.included.map((row, idx) => (
//                 <div className="flex gap-2" key={`included-${idx}`}>
//                   <input
//                     type="text"
//                     value={row}
//                     onChange={(e) => updateRow('included', idx, e.target.value)}
//                     placeholder="e.g   - Drain pipe cleaning"
//                     className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                   />

//                   {form.included.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeRow('included', idx, emptyTextRow)}
//                       className="h-10 w-10 rounded-lg border border-red-200 text-red-500 flex items-center justify-center"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Excluded */}
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <h4 className="text-sm font-semibold text-gray-900">
//                   What will Be Excluded <span className="text-red-500">*</span>
//                 </h4>

//                 <button
//                   type="button"
//                   disabled={form.excluded.length >= 10}
//                   onClick={() => {
//                     if (form.excluded.length < 10) {
//                       addRow('excluded', emptyTextRow);
//                     }
//                   }}
//                   className={`h-8 w-8 rounded-lg text-white text-lg leading-none flex items-center justify-center ${
//                     form.excluded.length >= 10
//                       ? 'bg-gray-300 cursor-not-allowed'
//                       : 'bg-purple-500'
//                   }`}
//                 >
//                   +
//                 </button>
//               </div>

//               {form.excluded.map((row, idx) => (
//                 <div className="flex gap-2" key={`excluded-${idx}`}>
//                   <input
//                     type="text"
//                     value={row}
//                     onChange={(e) => updateRow('excluded', idx, e.target.value)}
//                     placeholder="e.g  - Spare parts cost (charged separately if needed)"
//                     className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                   />

//                   {form.excluded.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeRow('excluded', idx, emptyTextRow)}
//                       className="h-10 w-10 rounded-lg border border-red-200 text-red-500 flex items-center justify-center"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </section>

//           <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
//             <h3 className="text-base font-semibold text-gray-900">
//               Service Media <span className="text-red-500">*</span>
//             </h3>
//             <p className="text-xs text-gray-500 leading-relaxed">
//               Upload up to 10 high-quality media. The first image will be the
//               cover photo.
//             </p>
//             <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DBEAFE]">
//                 <Upload className="h-6 w-6 text-[#2563EB]" />
//               </div>
//               <p className="mt-2 text-sm text-gray-700">
//                 Click to upload or drag and drop
//               </p>
//               {/* <p className="text-xs text-gray-500">
//                 PNG, JPG up to 10MB • 0/10 uploaded
//               </p> */}
//               <p className="text-xs text-gray-500">
//                 PNG, JPG up to 10MB •{' '}
//                 {form.images.length + form.existingImages.length}/10 uploaded
//               </p>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(e) =>
//                   setForm((prev) => ({
//                     ...prev,
//                     images: [
//                       ...prev.images,
//                       ...Array.from(e.target.files || []),
//                     ].slice(0, 10),
//                   }))
//                 }
//               />
//             </label>
//             {(form.existingImages.length || form.images.length) > 0 ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
//                 {form.existingImages.map((src, idx) => (
//                   <div
//                     key={`existing-${idx}`}
//                     className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
//                   >
//                     <img
//                       src={src}
//                       alt=""
//                       className="h-24 w-full object-cover"
//                     />
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setForm((prev) => ({
//                           ...prev,
//                           existingImages: prev.existingImages.filter(
//                             (_, i) => i !== idx,
//                           ),
//                         }))
//                       }
//                       className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white text-xs"
//                       aria-label="Remove existing image"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//                 {newImagePreviews.map((src, idx) => (
//                   <div
//                     key={`new-${idx}`}
//                     className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
//                   >
//                     <img
//                       src={src}
//                       alt=""
//                       className="h-24 w-full object-cover"
//                     />
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setForm((prev) => ({
//                           ...prev,
//                           images: prev.images.filter((_, i) => i !== idx),
//                         }))
//                       }
//                       className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white text-xs"
//                       aria-label="Remove new image"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ) : null}
//             {form.images.length ? (
//               <p className="text-xs text-gray-600">
//                 {form.images.length} new image(s) selected
//               </p>
//             ) : null}
//             {form.existingImages.length ? (
//               <p className="text-xs text-gray-600">
//                 {form.existingImages.length} existing image(s) retained
//               </p>
//             ) : null}
//           </section>

//           {/* <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
//             <div className="flex items-start justify-between">
//               <div className="flex items-start gap-2">
//                 <Box className="h-5 w-5 text-violet-600 mt-0.5" />
//                 <div>
//                   <h3 className="text-base font-semibold text-gray-900">
//                     Product Specifications
//                   </h3>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     Add custom fields for this service (e.g. material,
//                     dimensions).
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => addRow('productCustomSpecs', emptySpecRow)}
//                 className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
//               >
//                 + Add Custom Specification
//               </button>
//             </div>

//             <p className="text-sm text-gray-600">Custom Specifications</p>

//             <div className="bg-[#F7F5FF] border border-violet-200 rounded-2xl p-4 space-y-3">
//               {form.productCustomSpecs.map((row, idx) => (
//                 <div key={`spec-${idx}`} className="flex items-center gap-3">
//                   <div className="flex-1">
//                     <p className="text-xs text-gray-500 mb-1">Label</p>
//                     <input
//                       type="text"
//                       value={row.label}
//                       onChange={(e) => updateSpec(idx, 'label', e.target.value)}
//                       placeholder="e.g., Fabric Material"
//                       className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm outline-none"
//                     />
//                   </div>

//                   <div className="flex-1">
//                     <p className="text-xs text-gray-500 mb-1">Value</p>
//                     <input
//                       type="text"
//                       value={row.value}
//                       onChange={(e) => updateSpec(idx, 'value', e.target.value)}
//                       placeholder="e.g., Velvet"
//                       className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm outline-none"
//                     />
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       removeRow('productCustomSpecs', idx, emptySpecRow)
//                     }
//                     className="mt-5 h-10 w-10 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </section> */}
//           {/*
//           <section className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-4">
//             <div className="flex items-start justify-between gap-3">
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">
//                   Service Configuration
//                 </h3>
//                 <p className="text-xs text-gray-500 mt-0.5">
//                   Set pricing and inventory details
//                 </p>
//               </div>
//               <label className="flex items-center gap-2 text-xs font-medium text-gray-700 whitespace-nowrap">
//                 <span>Allow Vendors to Edit Prices</span>
//                 <button
//                   type="button"
//                   role="switch"
//                   aria-checked={form.allowVendorEditSalePrice}
//                   onClick={() =>
//                     setForm((p) => ({
//                       ...p,
//                       allowVendorEditSalePrice: !p.allowVendorEditSalePrice,
//                     }))
//                   }
//                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                     form.allowVendorEditSalePrice
//                       ? 'bg-emerald-500'
//                       : 'bg-gray-300'
//                   }`}
//                 >
//                   <span
//                     className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                       form.allowVendorEditSalePrice
//                         ? 'translate-x-5'
//                         : 'translate-x-0.5'
//                     }`}
//                   />
//                 </button>
//               </label>
//             </div>
//             <div>
//               <p className="text-xs font-medium text-gray-600 mb-1.5">
//                 Specific Service Type <span className="text-red-500">*</span>
//               </p>
//               <select
//                 value={form.serviceType}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, serviceType: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//               >
//                 {SERVICE_TYPE_OPTIONS.map((opt) => (
//                   <option key={opt} value={opt}>
//                     {opt}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <p className="text-xs font-medium text-gray-600 mb-1.5">
//                 Selling Price <span className="text-red-500">*</span>
//               </p>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.sellingPrice}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, sellingPrice: e.target.value }))
//                 }
//                 placeholder="Selling Price"
//                 className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//               />
//             </div>

//             <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 space-y-3">
//               <h4 className="text-sm font-semibold text-gray-900">
//                 AMC / Annual Maintenance Cost
//               </h4>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.amc.serviceCount}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     amc: { ...p.amc, serviceCount: e.target.value },
//                   }))
//                 }
//                 placeholder="Service Count"
//                 className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//               />
//               <label className="flex items-center justify-between text-sm text-gray-700">
//                 <span className="inline-flex items-center gap-2">
//                   <Calendar className="h-4 w-4 text-orange-500" />
//                   Automated Service Reminders
//                 </span>
//                 <input
//                   type="checkbox"
//                   checked={form.amc.automatedServiceReminders}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       amc: {
//                         ...p.amc,
//                         automatedServiceReminders: e.target.checked,
//                       },
//                     }))
//                   }
//                 />
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.amc.totalAmcFees}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     amc: { ...p.amc, totalAmcFees: e.target.value },
//                   }))
//                 }
//                 placeholder="Total AMC Fees"
//                 className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//               />
//             </div>
//           </section> */}
//           <section className="space-y-4">
//             {/* Top Section */}
//             <div className="rounded-2xl p-4 sm:p-5 space-y-4">
//               <div className="flex items-start justify-between gap-3">
//                 <div className="flex items-start gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] shrink-0">
//                     <Tag className="h-5 w-5 text-[#2563EB]" />
//                   </div>

//                   <div>
//                     <h3 className="text-base font-semibold text-gray-900">
//                       Service Configuration
//                     </h3>

//                     <p className="text-xs text-gray-500 mt-0.5">
//                       Set pricing and inventory details
//                     </p>
//                   </div>
//                 </div>

//                 <label className="flex items-center gap-2 text-xs font-medium text-gray-700 whitespace-nowrap">
//                   <span>Allow Vendors to Edit Prices</span>

//                   <button
//                     type="button"
//                     role="switch"
//                     aria-checked={form.allowVendorEditSalePrice}
//                     onClick={() =>
//                       setForm((p) => ({
//                         ...p,
//                         allowVendorEditSalePrice: !p.allowVendorEditSalePrice,
//                       }))
//                     }
//                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                       form.allowVendorEditSalePrice
//                         ? 'bg-emerald-500'
//                         : 'bg-gray-300'
//                     }`}
//                   >
//                     <span
//                       className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                         form.allowVendorEditSalePrice
//                           ? 'translate-x-5'
//                           : 'translate-x-0.5'
//                       }`}
//                     />
//                   </button>
//                 </label>
//               </div>

//               {/* Service Type */}
//               <div>
//                 <p className="text-xs font-medium text-gray-600 mb-1.5">
//                   Specific Service Type <span className="text-red-500">*</span>
//                 </p>

//                 <select
//                   value={form.serviceType}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       serviceType: e.target.value,
//                     }))
//                   }
//                   className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                 >
//                   {SERVICE_TYPE_OPTIONS.map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Selling Price */}
//               <div>
//                 <p className="text-xs font-medium text-gray-600 mb-1.5">
//                   Service Price <span className="text-red-500">*</span>
//                 </p>

//                 <div className="relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#2563EB] font-medium">
//                     ₹
//                   </span>
//                   {/*
//                   <input
//                     type="number"
//                     min="0"
//                     value={form.sellingPrice}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         sellingPrice: e.target.value,
//                       }))
//                     }
//                     placeholder="Enter your price"
//                     className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm"
//                   /> */}
//                   <input
//                     type="number"
//                     min="0"
//                     value={form.sellingPrice}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         sellingPrice: e.target.value,
//                       }))
//                     }
//                     placeholder="Enter your price"
//                     className="w-1/2 rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* AMC Box */}
//             {/* <div className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-3">
//               <h4 className="text-sm font-semibold text-gray-900">
//                 AMC / Annual Maintenance Cost
//               </h4>

//               <input
//                 type="number"
//                 min="0"
//                 value={form.amc.serviceCount}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     amc: {
//                       ...p.amc,
//                       serviceCount: e.target.value,
//                     },
//                   }))
//                 }
//                 placeholder="Service Count"
//                 className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//               />

//               <label className="flex items-center justify-between text-sm text-gray-700">
//                 <span className="inline-flex items-center gap-2">
//                   <Calendar className="h-4 w-4 text-orange-500" />
//                   Automated Service Reminders
//                 </span>

//                 <input
//                   type="checkbox"
//                   checked={form.amc.automatedServiceReminders}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       amc: {
//                         ...p.amc,
//                         automatedServiceReminders: e.target.checked,
//                       },
//                     }))
//                   }
//                 />
//               </label>

//               <input
//                 type="number"
//                 min="0"
//                 value={form.amc.totalAmcFees}
//                 onChange={(e) =>
//                   setForm((p) => ({
//                     ...p,
//                     amc: {
//                       ...p.amc,
//                       totalAmcFees: e.target.value,
//                     },
//                   }))
//                 }
//                 placeholder="Total AMC Fees"
//                 className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//               />
//             </div> */}
//             {/* AMC Box */}
//             <div className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-5">
//               <div>
//                 <h4 className="text-sm font-semibold text-gray-900">
//                   AMC ( Annual Maintenance Cost){' '}
//                 </h4>

//                 {/* <p className="text-xs text-gray-500 mt-1">
//                   Configure yearly maintenance scheduling and pricing.
//                 </p> */}
//               </div>

//               {/* Service Count */}
//               <div className="w-full sm:w-[25%]">
//                 <p className="text-xs font-medium text-black mb-1.5">
//                   Service Count <span className="text-red-500">*</span>
//                 </p>

//                 <input
//                   type="number"
//                   min="0"
//                   value={form.amc.serviceCount}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       amc: {
//                         ...p.amc,
//                         serviceCount: e.target.value,
//                       },
//                     }))
//                   }
//                   placeholder="Services / Year"
//                   className="w-full rounded-xl border border-[#DAB2FF] bg-[#FFF7ED]  px-3 py-2.5 text-sm outline-none"
//                 />
//                 <p className="text-[#64748B] text-xs flex flex-row">
//                   Number of scheduled maintenance services per year
//                 </p>
//               </div>

//               {/* Auto Schedule */}
//               <div className="flex items-start justify-between gap-4 rounded-xl   p-4">
//                 <div className="flex items-start gap-3">
//                   <input
//                     type="checkbox"
//                     checked={form.amc.autoScheduleServices}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...p.amc,
//                           autoScheduleServices: e.target.checked,
//                         },
//                       }))
//                     }
//                     className="mt-0.5 h-4 w-4 accent-orange-500 rounded-full"
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
//               <div className="flex items-start justify-between gap-4 rounded-xl   p-4">
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

//                 {/* Orange Toggle */}
//                 <button
//                   type="button"
//                   role="switch"
//                   aria-checked={form.amc.automatedServiceReminders}
//                   onClick={() =>
//                     setForm((p) => ({
//                       ...p,
//                       amc: {
//                         ...p.amc,
//                         automatedServiceReminders:
//                           !p.amc.automatedServiceReminders,
//                       },
//                     }))
//                   }
//                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
//                     form.amc.automatedServiceReminders
//                       ? 'bg-orange-500'
//                       : 'bg-orange-200'
//                   }`}
//                 >
//                   <span
//                     className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
//                       form.amc.automatedServiceReminders
//                         ? 'translate-x-5'
//                         : 'translate-x-0.5'
//                     }`}
//                   />
//                 </button>
//               </div>

//               {/* Total AMC Fees */}
//               <div className="w-full sm:w-[25%]">
//                 <p className="text-xs font-medium text-black mb-1.5">
//                   Total AMC Fees <span className="text-red-500">*</span>
//                 </p>

//                 <div className="relative">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
//                     ₹
//                   </span>

//                   <input
//                     type="number"
//                     min="0"
//                     value={form.amc.totalAmcFees}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         amc: {
//                           ...p.amc,
//                           totalAmcFees: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="199/-"
//                     className="w-full rounded-xl border border-[#DAB2FF] bg-[#FFF7ED]  pl-8 pr-3 py-2.5 text-sm outline-none"
//                   />
//                 </div>
//               </div>

//               {/* Save AMC Button */}
//               {/* <button
//                 type="button"
//                 onClick={() =>
//                   setForm((p) => ({
//                     ...p,
//                     amc: {
//                       ...p.amc,
//                       saved: !p.amc.saved,
//                     },
//                   }))
//                 }
//                 className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
//                   form.amc.saved
//                     ? 'bg-emerald-500 hover:bg-orange-600'
//                     : 'bg-orange-500 hover:bg-orange-600'
//                 }`}
//               >
//                 {form.amc.saved ? 'Saved' : ' Save AMC'}
//               </button> */}
//               <button
//                 type="button"
//                 onClick={() =>
//                   setForm((p) => ({
//                     ...p,
//                     amc: {
//                       ...p.amc,
//                       saved: !p.amc.saved,
//                     },
//                   }))
//                 }
//                 className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition flex items-center gap-2 ${
//                   form.amc.saved
//                     ? 'bg-orange-500 hover:bg-orange-600'
//                     : 'bg-orange-500 hover:bg-orange-600'
//                 }`}
//               >
//                 {!form.amc.saved && <Plus size={14} />}
//                 {form.amc.saved ? 'Saved' : 'Save AMC'}
//               </button>
//             </div>
//           </section>

//           <div className=" -mx-4 sm:-mx-5 mt-2 border-t border-gray-200 bg-white px-4 sm:px-5 py-3 flex justify-between">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//             >
//               Save as Draft
//             </button>
//             {/* <button
//               type="submit"
//               className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//             >
//               {mode === 'edit' ? 'Update Service' : 'Submit for Approval'}
//             </button> */}
//             <button
//               type="submit"
//               className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
//             >
//               <Send size={14} />
//               {mode === 'edit' ? 'Update Service' : 'Submit for Approval'}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Inline "Add New Sub-category" quick-create modal */}
//       {subCatCreateOpen ? (
//         <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 sm:p-6 bg-black/40">
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
//                   Configure category details, assets, and operational rules
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
//                   Category Image (1:1) <span className="text-red-500">*</span>
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
//                 {creatingSubCat ? 'Creating…' : 'Create Category & Sync'}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Bell,
  Box,
  Calendar,
  Package,
  Search,
  Tag,
  Upload,
  X,
  Send,
  Plus,
  Wrench,
} from 'lucide-react';
import {
  getCategories,
  getSubCategories,
} from '../../../redux/slices/categorySlice';
import { apiCreateSubCategory } from '@/service/api';

const emptySpecRow = () => ({ label: '', value: '' });

const emptyTextRow = () => '';

const SERVICE_TYPE_OPTIONS = [
  'Regular',
  'AMC (Annual Maintenance Cost)',
  'Installation',
  'Repair',
];

const defaultAmcConfig = {
  serviceCount: '',
  autoScheduleServices: false,
  automatedServiceReminders: true,
  totalAmcFees: '',
};

/** Prefer icon URL, then image, for category / subcategory picker cards. */
function categoryOrSubAssetUrl(item) {
  const icon = String(item?.icon || '').trim();
  if (icon) return icon;
  const img = String(item?.image || '').trim();
  return img || '';
}

const defaultFormState = () => ({
  category: '',
  subCategory: '',
  productName: '',
  included: [emptyTextRow()],
  excluded: [emptyTextRow()],
  images: [],
  existingImages: [],
  productCustomSpecs: [emptySpecRow()],
  serviceType: SERVICE_TYPE_OPTIONS[1],
  sellingPrice: '',
  allowVendorEditSalePrice: true,
  amc: { ...defaultAmcConfig },
});

function parseIncludedExcluded(meta, description = '') {
  const fromMetaIncluded = Array.isArray(meta?.included) ? meta.included : [];
  const fromMetaExcluded = Array.isArray(meta?.excluded) ? meta.excluded : [];
  if (fromMetaIncluded.length || fromMetaExcluded.length) {
    return {
      included: fromMetaIncluded.length ? fromMetaIncluded : [emptyTextRow()],
      excluded: fromMetaExcluded.length ? fromMetaExcluded : [emptyTextRow()],
    };
  }

  const lines = String(description || '').split('\n');
  const included = [];
  const excluded = [];
  let mode = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const lower = line.toLowerCase();
    if (lower.startsWith('what is included')) {
      mode = 'included';
      continue;
    }
    if (lower.startsWith('what is excluded')) {
      mode = 'excluded';
      continue;
    }
    if (line.startsWith('-')) {
      const value = line.slice(1).trim();
      if (!value) continue;
      if (mode === 'included') included.push(value);
      if (mode === 'excluded') excluded.push(value);
    }
  }
  return {
    included: included.length ? included : [emptyTextRow()],
    excluded: excluded.length ? excluded : [emptyTextRow()],
  };
}

export default function AdminServiceAddModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialData = null,
  existingProducts = [],
}) {
  const dispatch = useDispatch();
  const { categories, subCategories } = useSelector((state) => state.category);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [form, setForm] = useState(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Synchronous guard — refs update instantly (unlike state), blocking
   * rapid double-clicks that fire before React re-renders the disabled
   * button from `isSubmitting` state. */
  const submitInFlightRef = useRef(false);

  // Inline "Add New Sub-category" quick-create modal
  const [subCatCreateOpen, setSubCatCreateOpen] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatImage, setNewSubCatImage] = useState(null);
  const [newSubCatCommissionRate, setNewSubCatCommissionRate] = useState(15);
  const [creatingSubCat, setCreatingSubCat] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    dispatch(getCategories());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    setSearchText('');
    if (!initialData) {
      setSelectedCategoryId('');
      setForm(defaultFormState());
      return;
    }
    // Restore selectedCategoryId so subcategory filter works in edit mode
    const matchedCat = (categories || []).find(
      (c) =>
        String(c.name).toLowerCase() ===
        String(initialData.category || '').toLowerCase(),
    );
    if (matchedCat) {
      setSelectedCategoryId(matchedCat._id);
      dispatch(getSubCategories(matchedCat._id));
    } else {
      setSelectedCategoryId('');
    }
    const meta = initialData.serviceMeta || {};
    const parsed = parseIncludedExcluded(meta, initialData.description);
    const firstVariant = Array.isArray(initialData.variants)
      ? initialData.variants[0] || {}
      : {};
    setForm({
      category: initialData.category || '',
      subCategory: initialData.subCategory || '',
      productName: initialData.productName || '',
      included: parsed.included,
      excluded: parsed.excluded,
      images: [],
      existingImages: Array.isArray(initialData.images)
        ? initialData.images.filter(Boolean)
        : initialData.image
          ? [initialData.image]
          : [],
      productCustomSpecs:
        Array.isArray(initialData.productCustomSpecs) &&
        initialData.productCustomSpecs.length
          ? initialData.productCustomSpecs
          : [emptySpecRow()],
      serviceType: String(meta.serviceType || SERVICE_TYPE_OPTIONS[1]),
      sellingPrice: String(
        initialData.salesConfiguration?.salePrice ||
          firstVariant?.price ||
          initialData.price ||
          '',
      ).trim(),
      allowVendorEditSalePrice:
        initialData.salesConfiguration?.allowVendorEditSalePrice !== false,
      amc: {
        ...defaultAmcConfig,
        ...(meta.amc || {}),
      },
    });
  }, [isOpen, initialData]);

  const availableCategories = useMemo(
    () => (categories || []).filter((c) => c.availableInServices),
    [categories],
  );

  const availableSubCategories = useMemo(
    () =>
      (subCategories || []).filter(
        (s) =>
          String(s.category || '') === String(selectedCategoryId || '') &&
          s.availableInServices,
      ),
    [subCategories, selectedCategoryId],
  );

  const newImagePreviews = useMemo(
    () => (form.images || []).map((file) => URL.createObjectURL(file)),
    [form.images],
  );

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  // const filteredExistingProducts = useMemo(() => {
  //   const term = String(searchText || '')
  //     .trim()
  //     .toLowerCase();
  //   const list = Array.isArray(existingProducts) ? existingProducts : [];
  //   const base = list.filter((p) => p?._id && p._id !== initialData?._id);
  //   if (!term) return base;
  //   return base.filter((p) => {
  //     const name = String(p?.productName || '').toLowerCase();
  //     const category = String(p?.category || '').toLowerCase();
  //     const subCategory = String(p?.subCategory || '').toLowerCase();
  //     return (
  //       name.includes(term) ||
  //       category.includes(term) ||
  //       subCategory.includes(term)
  //     );
  //   });
  // }, [existingProducts, initialData?._id, searchText]);

  const filteredExistingProducts = useMemo(() => {
    const term = String(searchText || '')
      .trim()
      .toLowerCase();
    const list = Array.isArray(existingProducts) ? existingProducts : [];
    const selectedCat = String(form.category || '')
      .trim()
      .toLowerCase();
    const selectedSub = String(form.subCategory || '')
      .trim()
      .toLowerCase();
    const base = list
      .filter((p) => p?._id && p._id !== initialData?._id)
      .filter((p) => {
        if (
          selectedCat &&
          String(p?.category || '')
            .trim()
            .toLowerCase() !== selectedCat
        ) {
          return false;
        }
        if (
          selectedSub &&
          String(p?.subCategory || '')
            .trim()
            .toLowerCase() !== selectedSub
        ) {
          return false;
        }
        return true;
      });
    if (!term) return base;
    return base.filter((p) => {
      const name = String(p?.productName || '').toLowerCase();
      const category = String(p?.category || '').toLowerCase();
      const subCategory = String(p?.subCategory || '').toLowerCase();
      return (
        name.includes(term) ||
        category.includes(term) ||
        subCategory.includes(term)
      );
    });
  }, [
    existingProducts,
    initialData?._id,
    searchText,
    form.category,
    form.subCategory,
  ]);

  const rowThumb = (p) =>
    p?.images?.[0] ||
    p?.image ||
    'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG';

  const applyCategory = (id) => {
    setSelectedCategoryId(id);
    const cat = availableCategories.find((c) => c._id === id);
    setForm((prev) => ({
      ...prev,
      category: cat?.name || '',
      subCategory: '',
    }));
    if (id) dispatch(getSubCategories(id));
  };

  const applySubCategory = (id) => {
    const sub = (subCategories || []).find((s) => s._id === id);
    setForm((prev) => ({ ...prev, subCategory: sub?.name || '' }));
  };

  const handleCreateSubCategory = async () => {
    const adminToken =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
    if (!newSubCatName.trim()) {
      toast.error('Enter a sub-category name.');
      return;
    }
    if (!selectedCategoryId) {
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
      fd.append('categoryId', selectedCategoryId);
      fd.append('image', newSubCatImage);
      fd.append('commissionRate', String(newSubCatCommissionRate || 0));
      // This modal only lists Services categories, so the created
      // sub-category must be flagged for Services to show up as a tile.
      fd.append('availableInServices', 'true');
      const res = await apiCreateSubCategory(fd, adminToken);
      const created = res?.data?.subCategory;
      toast.success('Sub-category created.');
      await dispatch(getSubCategories(selectedCategoryId));
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

  const submit = (e) => {
    e.preventDefault();
    if (submitInFlightRef.current) return;
    if (!form.category.trim())
      return toast.error('Please select a main category.');
    if (!form.subCategory.trim())
      return toast.error('Please select a sub-category.');
    if (!form.productName.trim())
      return toast.error('Please enter a service title.');
    if (!form.images.length && !form.existingImages.length) {
      return toast.error('Please upload at least one service image.');
    }

    const included = form.included.map((x) => x.trim()).filter(Boolean);
    const excluded = form.excluded.map((x) => x.trim()).filter(Boolean);
    const specs = form.productCustomSpecs.filter(
      (row) => String(row.label || '').trim() || String(row.value || '').trim(),
    );
    const servicePrice = String(form.sellingPrice || '').trim();
    const amcPrice = String(form.amc.totalAmcFees || '').trim();

    const variantRentalConfigurations =
      form.serviceType.includes('AMC') && amcPrice
        ? [
            {
              periodUnit: 'month',
              months: 12,
              label: 'Annual Plan',
              tierLabel: 'AMC',
              pricePerDay: Math.max(0, Number(amcPrice) / 365),
              customerRent: Number(amcPrice) || 0,
              customerShipping: 0,
              vendorRent: Number(amcPrice) || 0,
              vendorShipping: 0,
            },
          ]
        : [];

    const description = [
      included.length ? `What is Included:\n- ${included.join('\n- ')}` : '',
      excluded.length ? `What is Excluded:\n- ${excluded.join('\n- ')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    //   onSubmit?.({
    //     sku: '',
    //     productName: form.productName.trim(),
    //     type: 'Service',
    //     category: form.category,
    //     subCategory: form.subCategory,
    //     brand: '',
    //     condition: 'Brand New',
    //     description,
    //     productCustomSpecs: specs,
    //     specifications: {},
    //     variants: [
    //       {
    //         variantName: form.productName.trim(),
    //         price: servicePrice || amcPrice || '0',
    //         stock: '1',
    //         images: [],
    //         existingVariantImages: [],
    //         specRows: specs,
    //         rentalPricingModel: 'month',
    //         allowVendorEditRentalPrices: true,
    //         rentalConfigurations: variantRentalConfigurations,
    //         refundableDeposit: '0',
    //       },
    //     ],
    //     rentalConfigurations: [],
    //     refundableDeposit: '0',
    //     logisticsVerification: { inventoryOwnerName: '', city: '' },
    //     salesConfiguration: {
    //       allowVendorEditSalePrice: !!form.allowVendorEditSalePrice,
    //       salePrice: servicePrice || amcPrice || '0',
    //       mrpPrice: servicePrice || amcPrice || '0',
    //     },
    //     price: servicePrice || amcPrice || '0',
    //     stock: '1',
    //     status: 'Active',
    //     isActive: true,
    //     images: form.images,
    //     existingImages: form.existingImages,
    //     serviceMeta: {
    //       serviceType: form.serviceType,
    //       included,
    //       excluded,
    //       amc: form.amc,
    //     },
    //   });
    // };

    submitInFlightRef.current = true;
    setIsSubmitting(true);
    Promise.resolve(
      onSubmit?.({
        sku: '',
        productName: form.productName.trim(),
        type: 'Service',
        category: form.category,
        subCategory: form.subCategory,
        brand: '',
        condition: 'Brand New',
        description,
        productCustomSpecs: specs,
        specifications: {},
        variants: [
          {
            variantName: form.productName.trim(),
            price: servicePrice || amcPrice || '0',
            stock: '1',
            images: [],
            existingVariantImages: [],
            specRows: specs,
            rentalPricingModel: 'month',
            allowVendorEditRentalPrices: true,
            rentalConfigurations: variantRentalConfigurations,
            refundableDeposit: '0',
          },
        ],
        rentalConfigurations: [],
        refundableDeposit: '0',
        logisticsVerification: { inventoryOwnerName: '', city: '' },
        salesConfiguration: {
          allowVendorEditSalePrice: !!form.allowVendorEditSalePrice,
          salePrice: servicePrice || amcPrice || '0',
          mrpPrice: servicePrice || amcPrice || '0',
        },
        price: servicePrice || amcPrice || '0',
        stock: '1',
        status: 'Active',
        isActive: true,
        images: form.images,
        existingImages: form.existingImages,
        serviceMeta: {
          serviceType: form.serviceType,
          included,
          excluded,
          amc: form.amc,
        },
      }),
    ).finally(() => {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    });
  };

  if (!isOpen) return null;

  return (
    // <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3">
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 p-3">
      <div className="flex min-h-0 w-full max-w-5xl max-h-[95vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit Service Listing' : 'Add New Listing'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              List your product, rental, or service.
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

        <form
          onSubmit={submit}
          className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900">
                  Sell Product
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                  One-time purchase
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white opacity-60 px-4 py-3.5">
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

            <div className="flex items-center justify-center gap-3 rounded-xl border-2 border-blue-500 bg-white px-4 py-3.5 ring-1 ring-blue-200">
              <Wrench size={24} className="text-[#2563EB]" />

              <div className="text-start">
                <p className="text-sm font-semibold text-[#2563EB]">
                  Offer Service
                </p>
                <p className=" text-[11px] text-gray-500">Hourly/Fixed rate</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Tag className="h-5 w-5" strokeWidth={2} />
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
            <div className="p-4 sm:p-5 space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Step 1: Main Category <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {availableCategories.map((c) => {
                    const selected = form.category === c.name;
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
                            className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
                              selected ? '' : 'opacity-90'
                            }`}
                          />
                        ) : (
                          <Package
                            className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
                              selected ? 'text-orange-500' : 'text-gray-400'
                            }`}
                            strokeWidth={1.75}
                          />
                        )}
                        <span
                          className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
                            selected ? 'text-orange-600' : 'text-gray-600'
                          }`}
                        >
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Step 2: Sub Category <span className="text-red-500">*</span>
                  </p>
                  {selectedCategoryId ? (
                    <button
                      type="button"
                      onClick={() => setSubCatCreateOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                    >
                      + Add New
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-3">
                  {availableSubCategories.map((s) => {
                    const selected = form.subCategory === s.name;
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
                            className={`h-10 w-10 sm:h-11 sm:w-11 object-contain ${
                              selected ? '' : 'opacity-90'
                            }`}
                          />
                        ) : (
                          <Package
                            className={`h-10 w-10 sm:h-11 sm:w-11 shrink-0 ${
                              selected ? 'text-orange-500' : 'text-gray-400'
                            }`}
                            strokeWidth={1.75}
                          />
                        )}
                        <span
                          className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 w-full ${
                            selected ? 'text-orange-600' : 'text-gray-600'
                          }`}
                        >
                          {s.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search your listed service"
                    className="w-full rounded-lg border border-gray-200 bg-white px-9 py-2 text-sm"
                  />
                </div>
                <div className="mt-3 max-h-[min(280px,40vh)] overflow-y-auto rounded-xl border border-gray-100">
                  {filteredExistingProducts.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-500">
                      No products match your search.
                    </p>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0 text-left text-gray-600">
                        <tr>
                          <th className="px-3 py-2 font-medium">Product</th>
                          <th className="px-3 py-2 font-medium">Category</th>
                          <th className="px-3 py-2 font-medium">
                            Sub-category
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredExistingProducts.map((p) => (
                          <tr key={p._id} className="hover:bg-gray-50/80">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={rowThumb(p)}
                                  alt=""
                                  className="h-11 w-11 rounded-lg object-cover border border-gray-100"
                                />
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate max-w-[220px]">
                                    {p.productName || '—'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {p.category || '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {p.subCategory || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-5">
            <h3 className="text-base font-semibold text-gray-900">
              Basic Details
            </h3>

            {/* Service Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black">
                Service Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={form.productName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, productName: e.target.value }))
                }
                placeholder="e.g. Home Cleaning"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            {/* Included */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  What will Be Included <span className="text-red-500">*</span>
                </h4>

                <button
                  type="button"
                  disabled={form.included.length >= 10}
                  onClick={() => {
                    if (form.included.length < 10) {
                      addRow('included', emptyTextRow);
                    }
                  }}
                  className={`h-8 w-8 rounded-lg text-white text-lg leading-none flex items-center justify-center ${
                    form.included.length >= 10
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-purple-500'
                  }`}
                >
                  +
                </button>
              </div>

              {form.included.map((row, idx) => (
                <div className="flex gap-2" key={`included-${idx}`}>
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => updateRow('included', idx, e.target.value)}
                    placeholder="e.g   - Drain pipe cleaning"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />

                  {form.included.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow('included', idx, emptyTextRow)}
                      className="h-10 w-10 rounded-lg border border-red-200 text-red-500 flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Excluded */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  What will Be Excluded <span className="text-red-500">*</span>
                </h4>

                <button
                  type="button"
                  disabled={form.excluded.length >= 10}
                  onClick={() => {
                    if (form.excluded.length < 10) {
                      addRow('excluded', emptyTextRow);
                    }
                  }}
                  className={`h-8 w-8 rounded-lg text-white text-lg leading-none flex items-center justify-center ${
                    form.excluded.length >= 10
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-purple-500'
                  }`}
                >
                  +
                </button>
              </div>

              {form.excluded.map((row, idx) => (
                <div className="flex gap-2" key={`excluded-${idx}`}>
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => updateRow('excluded', idx, e.target.value)}
                    placeholder="e.g  - Spare parts cost (charged separately if needed)"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />

                  {form.excluded.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow('excluded', idx, emptyTextRow)}
                      className="h-10 w-10 rounded-lg border border-red-200 text-red-500 flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
            <h3 className="text-base font-semibold text-gray-900">
              Service Media <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upload up to 10 high-quality media. The first image will be the
              cover photo.
            </p>
            <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DBEAFE]">
                <Upload className="h-6 w-6 text-[#2563EB]" />
              </div>
              <p className="mt-2 text-sm text-gray-700">
                Click to upload or drag and drop
              </p>
              {/* <p className="text-xs text-gray-500">
                PNG, JPG up to 10MB • 0/10 uploaded
              </p> */}
              <p className="text-xs text-gray-500">
                PNG, JPG up to 10MB •{' '}
                {form.images.length + form.existingImages.length}/10 uploaded
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    images: [
                      ...prev.images,
                      ...Array.from(e.target.files || []),
                    ].slice(0, 10),
                  }))
                }
              />
            </label>
            {(form.existingImages.length || form.images.length) > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {form.existingImages.map((src, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          existingImages: prev.existingImages.filter(
                            (_, i) => i !== idx,
                          ),
                        }))
                      }
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white text-xs"
                      aria-label="Remove existing image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((src, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white text-xs"
                      aria-label="Remove new image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {form.images.length ? (
              <p className="text-xs text-gray-600">
                {form.images.length} new image(s) selected
              </p>
            ) : null}
            {form.existingImages.length ? (
              <p className="text-xs text-gray-600">
                {form.existingImages.length} existing image(s) retained
              </p>
            ) : null}
          </section>

          {/* <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <Box className="h-5 w-5 text-violet-600 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Product Specifications
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add custom fields for this service (e.g. material,
                    dimensions).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => addRow('productCustomSpecs', emptySpecRow)}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
              >
                + Add Custom Specification
              </button>
            </div>

            <p className="text-sm text-gray-600">Custom Specifications</p>

            <div className="bg-[#F7F5FF] border border-violet-200 rounded-2xl p-4 space-y-3">
              {form.productCustomSpecs.map((row, idx) => (
                <div key={`spec-${idx}`} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Label</p>
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateSpec(idx, 'label', e.target.value)}
                      placeholder="e.g., Fabric Material"
                      className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Value</p>
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                      placeholder="e.g., Velvet"
                      className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeRow('productCustomSpecs', idx, emptySpecRow)
                    }
                    className="mt-5 h-10 w-10 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section> */}
          {/* 
          <section className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Service Configuration
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set pricing and inventory details
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                <span>Allow Vendors to Edit Prices</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.allowVendorEditSalePrice}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      allowVendorEditSalePrice: !p.allowVendorEditSalePrice,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.allowVendorEditSalePrice
                      ? 'bg-emerald-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      form.allowVendorEditSalePrice
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">
                Specific Service Type <span className="text-red-500">*</span>
              </p>
              <select
                value={form.serviceType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, serviceType: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">
                Selling Price <span className="text-red-500">*</span>
              </p>
              <input
                type="number"
                min="0"
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sellingPrice: e.target.value }))
                }
                placeholder="Selling Price"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">
                AMC / Annual Maintenance Cost
              </h4>
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
                placeholder="Service Count"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <label className="flex items-center justify-between text-sm text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Automated Service Reminders
                </span>
                <input
                  type="checkbox"
                  checked={form.amc.automatedServiceReminders}
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
              </label>
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
                placeholder="Total AMC Fees"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </section> */}
          <section className="space-y-4">
            {/* Top Section */}
            <div className="rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] shrink-0">
                    <Tag className="h-5 w-5 text-[#2563EB]" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Service Configuration
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Set pricing and inventory details
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                  <span>Allow Vendors to Edit Prices</span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.allowVendorEditSalePrice}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        allowVendorEditSalePrice: !p.allowVendorEditSalePrice,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      form.allowVendorEditSalePrice
                        ? 'bg-emerald-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        form.allowVendorEditSalePrice
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Service Type */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">
                  Specific Service Type <span className="text-red-500">*</span>
                </p>

                <select
                  value={form.serviceType}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      serviceType: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {SERVICE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selling Price */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">
                  Service Price <span className="text-red-500">*</span>
                </p>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#2563EB] font-medium">
                    ₹
                  </span>
                  {/* 
                  <input
                    type="number"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        sellingPrice: e.target.value,
                      }))
                    }
                    placeholder="Enter your price"
                    className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm"
                  /> */}
                  <input
                    type="number"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        sellingPrice: e.target.value,
                      }))
                    }
                    placeholder="Enter your price"
                    className="w-1/2 rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* AMC Box */}
            {/* <div className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">
                AMC / Annual Maintenance Cost
              </h4>

              <input
                type="number"
                min="0"
                value={form.amc.serviceCount}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    amc: {
                      ...p.amc,
                      serviceCount: e.target.value,
                    },
                  }))
                }
                placeholder="Service Count"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />

              <label className="flex items-center justify-between text-sm text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Automated Service Reminders
                </span>

                <input
                  type="checkbox"
                  checked={form.amc.automatedServiceReminders}
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
              </label>

              <input
                type="number"
                min="0"
                value={form.amc.totalAmcFees}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    amc: {
                      ...p.amc,
                      totalAmcFees: e.target.value,
                    },
                  }))
                }
                placeholder="Total AMC Fees"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div> */}
            {/* AMC Box */}
            <div className="rounded-2xl border border-[#F97316] bg-[#FFF7ED] p-4 sm:p-5 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  AMC ( Annual Maintenance Cost){' '}
                </h4>

                {/* <p className="text-xs text-gray-500 mt-1">
                  Configure yearly maintenance scheduling and pricing.
                </p> */}
              </div>

              {/* Service Count */}
              <div className="w-full sm:w-[25%]">
                <p className="text-xs font-medium text-black mb-1.5">
                  Service Count <span className="text-red-500">*</span>
                </p>

                <input
                  type="number"
                  min="0"
                  value={form.amc.serviceCount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      amc: {
                        ...p.amc,
                        serviceCount: e.target.value,
                      },
                    }))
                  }
                  placeholder="Services / Year"
                  className="w-full rounded-xl border border-[#DAB2FF] bg-[#FFF7ED]  px-3 py-2.5 text-sm outline-none"
                />
                <p className="text-[#64748B] text-xs flex flex-row">
                  Number of scheduled maintenance services per year
                </p>
              </div>

              {/* Auto Schedule */}
              <div className="flex items-start justify-between gap-4 rounded-xl   p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.amc.autoScheduleServices}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...p.amc,
                          autoScheduleServices: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 accent-orange-500 rounded-full"
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
              <div className="flex items-start justify-between gap-4 rounded-xl   p-4">
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

                {/* Orange Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.amc.automatedServiceReminders}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      amc: {
                        ...p.amc,
                        automatedServiceReminders:
                          !p.amc.automatedServiceReminders,
                      },
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.amc.automatedServiceReminders
                      ? 'bg-orange-500'
                      : 'bg-orange-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      form.amc.automatedServiceReminders
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Total AMC Fees */}
              <div className="w-full sm:w-[25%]">
                <p className="text-xs font-medium text-black mb-1.5">
                  Total AMC Fees <span className="text-red-500">*</span>
                </p>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={form.amc.totalAmcFees}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amc: {
                          ...p.amc,
                          totalAmcFees: e.target.value,
                        },
                      }))
                    }
                    placeholder="199/-"
                    className="w-full rounded-xl border border-[#DAB2FF] bg-[#FFF7ED]  pl-8 pr-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Save AMC Button */}
              {/* <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    amc: {
                      ...p.amc,
                      saved: !p.amc.saved,
                    },
                  }))
                }
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                  form.amc.saved
                    ? 'bg-emerald-500 hover:bg-orange-600'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {form.amc.saved ? 'Saved' : ' Save AMC'}
              </button> */}
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    amc: {
                      ...p.amc,
                      saved: !p.amc.saved,
                    },
                  }))
                }
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition flex items-center gap-2 ${
                  form.amc.saved
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {!form.amc.saved && <Plus size={14} />}
                {form.amc.saved ? 'Saved' : 'Save AMC'}
              </button>
            </div>
          </section>

          {/* <div className=" -mx-4 sm:-mx-5 mt-2 border-t border-gray-200 bg-white px-4 sm:px-5 py-3 flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Send size={14} />
              {mode === 'edit' ? 'Update Service' : 'Submit for Approval'}
            </button>
          </div> */}
          <div className=" -mx-4 sm:-mx-5 mt-2 border-t border-gray-200 bg-white px-4 sm:px-5 py-3 flex justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {isSubmitting
                ? 'Submitting…'
                : mode === 'edit'
                  ? 'Update Service'
                  : 'Publish'}
            </button>
          </div>
        </form>
      </div>

      {/* Inline "Add New Sub-category" quick-create modal */}
      {subCatCreateOpen ? (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 sm:p-6 bg-black/40">
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
                  Configure category details, assets, and operational rules
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
                  Category Image (1:1) <span className="text-red-500">*</span>
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
                {creatingSubCat ? 'Creating…' : 'Create Category & Sync'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
