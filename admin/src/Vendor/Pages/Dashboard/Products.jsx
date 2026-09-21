// 'use client';

// import React, { useEffect, useMemo, useState, useRef } from 'react';
// import { createPortal } from 'react-dom';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   Pencil,
//   Trash2,
//   Package,
//   AlertTriangle,
//   CircleX,
//   RefreshCcw,
//   Search,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import {
//   createProduct,
//   deleteProduct,
//   getMyProducts,
//   patchVendorListingVisibility,
//   updateProduct,
// } from '../../../redux/slices/productSlice';
// import VendorProductAddModal from '../../Components/Modals/VendorProductAddModal';
// import VendorAutoServices from '../../Components/Modals/VendorAutoServices';
// import VendorManualProductModal from '../../Components/Modals/VendorManualProductModal';
// import {
//   createServiceProduct,
//   deleteServiceProduct,
//   getMyServiceProducts,
//   patchVendorServiceListingVisibility,
//   updateServiceProduct,
// } from '../../../redux/slices/vendorServiceProductSlice';
// import { apiGetMyVendorKyc } from '@/service/api';
// import VendorManualServices from '@/Vendor/Components/Modals/VendorManualServices';

// function formatInrAmount(n) {
//   if (!Number.isFinite(n) || n <= 0) return '';
//   return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
// }

// // function pickProductRentalConfigurations(product) {
// //   const top = product?.rentalConfigurations;
// //   if (Array.isArray(top) && top.length) return top;
// //   const v0 = product?.variants?.[0];
// //   if (
// //     Array.isArray(v0?.rentalConfigurations) &&
// //     v0.rentalConfigurations.length
// //   ) {
// //     return v0.rentalConfigurations;
// //   }
// //   return [];
// // }

// function pickProductRentalConfigurations(product) {
//   const top = Array.isArray(product?.rentalConfigurations)
//     ? product.rentalConfigurations
//     : [];
//   const topHasPrice = top.some(
//     (c) => Number(c?.vendorRent || c?.customerRent || c?.pricePerDay || 0) > 0,
//   );
//   if (topHasPrice) return top;
//   // Custom/manual listings store tenure pricing per variant (the top-level
//   // array is often just a zero-priced default ladder in that case). Gather
//   // tiers from every variant so the table shows the correct day/month rate.
//   const variants = Array.isArray(product?.variants) ? product.variants : [];
//   const fromAllVariants = variants.flatMap((v) =>
//     Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
//   );
//   if (fromAllVariants.length) return fromAllVariants;
//   return top;
// }

// function tierRentAmount(tier) {
//   const n = (k) => {
//     const v = Number(String(tier?.[k] ?? '').replace(/,/g, ''));
//     return Number.isFinite(v) && v > 0 ? v : 0;
//   };
//   // Vendor's own table must show the VENDOR's price, not the customer's.
//   // Fall back to the older fields for listings saved before this fix.
//   return n('vendorRent') || n('customerRent') || n('pricePerDay') || 0;
// }

// // function isProductLiveOnStorefront(p) {
// //   if (!p || p.isAdminApproved === false) return false;
// //   if (String(p.submissionStatus || '').trim() !== 'published') return false;
// //   if (p.adminListingEnabled === false) return false;
// //   if (p.vendorListingEnabled === false) return false;
// //   return true;
// // }

// //for admin side catgory section active prodcuts
// function isProductLiveOnStorefront(p) {
//   if (!p) return false;
//   if (p.isAdminApproved === false) return false;
//   if (String(p.submissionStatus || '').trim() !== 'published') return false;
//   if (p.adminListingEnabled === false) return false;
//   if (p.vendorListingEnabled === false) return false;
//   if (Number(p.stock || 0) <= 0) return false;

//   return true;
// }

// // function getInventoryPriceLabel(product) {
// //   if (product?.type && String(product.type) !== 'Rental') {
// //     const raw = product?.price;
// //     if (
// //       raw != null &&
// //       String(raw).trim() !== '' &&
// //       String(raw).trim() !== '0'
// //     ) {
// //       return String(raw).trim();
// //     }
// //     return '—';
// //   }

// //   const configs = pickProductRentalConfigurations(product);
// //   if (configs.length) {
// //     const isDay = configs.some((c) => c?.periodUnit === 'day');
// //     if (isDay) {
// //       const tier =
// //         configs.find((c) => c?.periodUnit === 'day' && Number(c?.days) === 3) ||
// //         configs.find((c) => c?.periodUnit === 'day');
// //       if (tier) {
// //         const amt = tierRentAmount(tier);
// //         const d = Number(tier?.days) > 0 ? Number(tier.days) : 3;
// //         const f = formatInrAmount(amt);
// //         if (f) return d === 3 ? `₹${f} / 3d` : `₹${f} / ${d}d`;
// //       }
// //     } else {
// //       const tier =
// //         configs.find(
// //           (c) => c?.periodUnit !== 'day' && Number(c?.months) === 3,
// //         ) ||
// //         configs.find(
// //           (c) =>
// //             c?.periodUnit === 'month' ||
// //             (!c?.periodUnit && Number(c?.months) > 0),
// //         ) ||
// //         configs.find((c) => Number(c?.months) > 0);
// //       if (tier) {
// //         const amt = tierRentAmount(tier);
// //         const m = Number(tier?.months) > 0 ? Number(tier.months) : 3;
// //         const f = formatInrAmount(amt);
// //         if (f) return m === 3 ? `₹${f} / 3mo` : `₹${f} / ${m}mo`;
// //       }
// //     }
// //   }

// //   const raw = product?.price;
// //   const s = raw != null ? String(raw).trim() : '';
// //   if (s && s !== '0') {
// //     if (/[₹]|rs\.?|\/mo|\/month|\/d|\/day/i.test(s)) return s;
// //     return `₹${s}/mo`;
// //   }
// //   return '—';
// // }

// function getInventoryPriceLabel(product) {
//   // if (product?.type && String(product.type) !== 'Rental') {
//   //   const raw = product?.price;
//   //   if (
//   //     raw != null &&
//   //     String(raw).trim() !== '' &&
//   //     String(raw).trim() !== '0'
//   //   ) {
//   //     return String(raw).trim();
//   //   }
//   if (product?.type && String(product.type) !== 'Rental') {
//     const raw = product?.price;
//     if (
//       raw != null &&
//       String(raw).trim() !== '' &&
//       String(raw).trim() !== '0'
//     ) {
//       const rawStr = String(raw).trim();
//       return /[₹]|rs\.?/i.test(rawStr) ? rawStr : `₹${rawStr}`;
//     }
//     // Custom/manual multi-variant sell listings may leave the top-level
//     // `price` empty (each variant carries its own sellPrice instead).
//     // Fall back to the first variant that actually has a sell price.
//     const variants = Array.isArray(product?.variants) ? product.variants : [];
//     const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
//     if (firstWithPrice) {
//       return `₹${Number(firstWithPrice.sellPrice).toLocaleString('en-IN')}`;
//     }
//     return '—';
//   }

//   const configs = pickProductRentalConfigurations(product);
//   if (configs.length) {
//     // Pick the shortest tenure tier — sorted by its real length (days for
//     // day-wise plans, months for month-wise plans), not by raw `months`
//     // alone (which is always 0 on day-wise tiers and breaks the sort).
//     const usable = configs.filter(
//       (c) =>
//         Number(c?.vendorRent || c?.customerRent || c?.pricePerDay || 0) > 0,
//     );
//     const tier = usable.sort((a, b) => {
//       const lenA =
//         a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
//       const lenB =
//         b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
//       return lenA - lenB;
//     })[0];

//     // if (tier) {
//     //   const isDay = tier.periodUnit === 'day';
//     //   const len = isDay
//     //     ? Number(tier.days) > 0
//     //       ? Number(tier.days)
//     //       : 1
//     //     : Number(tier.months) > 0
//     //       ? Number(tier.months)
//     //       : 1;
//     //   const totalAmt = tierRentAmount(tier);
//     //   // Show the per-unit rate (total ÷ tenure length), never the raw
//     //   // total for the whole tenure — e.g. ₹111 over 3 months → ₹37/month.
//     //   const perUnit = Math.round(totalAmt / len);
//     //   const f = formatInrAmount(perUnit);
//     //   if (f) return isDay ? `₹${f}/day` : `₹${f}/month`;
//     // }

//     if (tier) {
//       const isDay = tier.periodUnit === 'day';
//       const totalAmt = tierRentAmount(tier);
//       // Day-wise tiers store a total for the tenure, so divide by day
//       // count to get the per-day rate — e.g. ₹300 over 3 days → ₹100/day.
//       // Month-wise tiers store customerRent as the ALREADY per-month rate,
//       // so it must be used as-is, never divided by the months count —
//       // e.g. ₹150/month tenure must show ₹150/month, not ₹150/3=₹50/month.
//       const perUnit = isDay
//         ? Math.round(totalAmt / (Number(tier.days) > 0 ? Number(tier.days) : 1))
//         : Math.round(totalAmt);
//       const f = formatInrAmount(perUnit);
//       if (f) return isDay ? `₹${f}/day` : `₹${f}/month`;
//     }
//   }

//   const raw = product?.price;
//   const s = raw != null ? String(raw).trim() : '';
//   if (s && s !== '0') {
//     if (/[₹]|rs\.?|\/mo|\/month|\/d|\/day/i.test(s)) return s;
//     return `₹${s}/mo`;
//   }
//   return '—';
// }

// const Products = () => {
//   const dispatch = useDispatch();
//   const { products, loading, error } = useSelector((state) => state.product);
//   const {
//     serviceProducts,
//     loading: serviceLoading,
//     error: serviceError,
//   } = useSelector((state) => state.vendorServiceProduct);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
//   const [isManualModalOpen, setIsManualModalOpen] = useState(false);
//   const [manualModalDesign, setManualModalDesign] = useState('vendor');
//   const [manualListingKind, setManualListingKind] = useState('rental');
//   const [isManualServiceModalOpen, setIsManualServiceModalOpen] =
//     useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [editingServiceProduct, setEditingServiceProduct] = useState(null);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [query, setQuery] = useState('');
//   const [kycStatus, setKycStatus] = useState('');
//   const [kycLoading, setKycLoading] = useState(true);
//   const [stockFilter, setStockFilter] = useState('all');
//   const [typeFilter, setTypeFilter] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [subCategoryFilter, setSubCategoryFilter] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
//   const menuBtnRefs = useRef({});

//   useEffect(() => {
//     if (!openMenuId) return;
//     const handleClickOutside = () => setOpenMenuId(null);
//     const handleScrollOrResize = () => setOpenMenuId(null);
//     document.addEventListener('click', handleClickOutside);
//     window.addEventListener('scroll', handleScrollOrResize, true);
//     window.addEventListener('resize', handleScrollOrResize);
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//       window.removeEventListener('scroll', handleScrollOrResize, true);
//       window.removeEventListener('resize', handleScrollOrResize);
//     };
//   }, [openMenuId]);

//   const openActionMenu = (id) => {
//     if (openMenuId === id) {
//       setOpenMenuId(null);
//       return;
//     }
//     const btn = menuBtnRefs.current[id];
//     if (btn) {
//       const rect = btn.getBoundingClientRect();
//       setMenuPos({
//         top: rect.bottom + 4,
//         left: rect.right - 128, // 128px = w-32 menu width, right-aligned to button
//       });
//     }
//     setOpenMenuId(id);
//   };
//   const itemsPerPage = 10;

//   // Fetch products
//   useEffect(() => {
//     dispatch(getMyProducts());
//   }, [dispatch]);

//   useEffect(() => {
//     dispatch(getMyServiceProducts());
//   }, [dispatch]);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) {
//       setKycLoading(false);
//       return;
//     }
//     apiGetMyVendorKyc(token)
//       .then((res) => {
//         setKycStatus(res.data?.kyc?.status || '');
//       })
//       .catch(() => {
//         setKycStatus('');
//       })
//       .finally(() => setKycLoading(false));
//   }, []);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [query, stockFilter, typeFilter, categoryFilter, subCategoryFilter]);

//   const deriveStatusFromStock = (stock) => {
//     const s = Number(stock || 0);
//     if (s <= 0) return 'Out of Stock';
//     if (s <= 5) return 'Low Stock';
//     return 'Active';
//   };

//   // Dynamic stats (prefer saved status; fallback to stock-derived status)
//   const getProductStatus = (p) => {
//     if (p.status) return p.status;
//     if (p.stock === 0) return 'Out of Stock';
//     if (p.stock <= 5) return 'Low Stock';
//     return 'Active';
//   };

//   const allListings = [...(products || []), ...(serviceProducts || [])];

//   const totalProducts = allListings.length;

//   // const lowStock = allListings.filter(
//   //   (p) => deriveStatusFromStock(p.stock) === 'Low Stock',
//   // ).length;
//   const lowStock = allListings.filter(
//     (p) =>
//       String(p.type) !== 'Service' &&
//       deriveStatusFromStock(p.stock) === 'Low Stock',
//   ).length;

//   const outOfStock = allListings.filter(
//     (p) =>
//       String(p.type) !== 'Service' &&
//       deriveStatusFromStock(p.stock) === 'Out of Stock',
//   ).length;

//   // const filteredProducts = useMemo(() => {
//   //   const term = query.trim().toLowerCase();

//   //   let list = allListings;

//   //   // optional stock filter support
//   //   if (stockFilter === 'low') {
//   //     list = list.filter((p) => deriveStatusFromStock(p.stock) === 'Low Stock');
//   //   } else if (stockFilter === 'out') {
//   //     list = list.filter(
//   //       (p) => deriveStatusFromStock(p.stock) === 'Out of Stock',
//   //     );
//   //   }

//   //   if (!term) return list;

//   //   return list.filter((p) => {
//   //     const name = p.productName?.toLowerCase() || '';
//   //     const category = p.category?.toLowerCase() || '';
//   //     const subCategory = p.subCategory?.toLowerCase() || '';

//   //     return (
//   //       name.includes(term) ||
//   //       category.includes(term) ||
//   //       subCategory.includes(term)
//   //     );
//   //   });
//   // }, [allListings, query, stockFilter]);

//   const uniqueTypes = useMemo(() => {
//     const types = allListings.map((p) => p.type).filter(Boolean);
//     return ['all', ...new Set(types)];
//   }, [allListings]);

//   const uniqueCategories = useMemo(() => {
//     let list = allListings;
//     if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter);
//     const cats = list.map((p) => p.category).filter(Boolean);
//     return ['all', ...new Set(cats)];
//   }, [allListings, typeFilter]);

//   const uniqueSubCategories = useMemo(() => {
//     let list = allListings;
//     if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter);
//     if (categoryFilter !== 'all')
//       list = list.filter((p) => p.category === categoryFilter);
//     const subs = list.map((p) => p.subCategory).filter(Boolean);
//     return ['all', ...new Set(subs)];
//   }, [allListings, typeFilter, categoryFilter]);

//   const filteredProducts = useMemo(() => {
//     const term = query.trim().toLowerCase();

//     let list = allListings;

//     // if (stockFilter === 'low') {
//     //   list = list.filter((p) => deriveStatusFromStock(p.stock) === 'Low Stock');
//     // } else if (stockFilter === 'out') {
//     //   list = list.filter(
//     //     (p) => deriveStatusFromStock(p.stock) === 'Out of Stock',
//     //   );
//     // }

//     if (stockFilter === 'low') {
//       list = list.filter(
//         (p) =>
//           String(p.type) !== 'Service' &&
//           deriveStatusFromStock(p.stock) === 'Low Stock',
//       );
//     } else if (stockFilter === 'out') {
//       list = list.filter(
//         (p) =>
//           String(p.type) !== 'Service' &&
//           deriveStatusFromStock(p.stock) === 'Out of Stock',
//       );
//     }

//     if (typeFilter !== 'all') {
//       list = list.filter((p) => p.type === typeFilter);
//     }

//     if (categoryFilter !== 'all') {
//       list = list.filter((p) => p.category === categoryFilter);
//     }

//     if (subCategoryFilter !== 'all') {
//       list = list.filter((p) => p.subCategory === subCategoryFilter);
//     }

//     if (!term) return list;

//     return list.filter((p) => {
//       const name = p.productName?.toLowerCase() || '';
//       const category = p.category?.toLowerCase() || '';
//       const subCategory = p.subCategory?.toLowerCase() || '';
//       return (
//         name.includes(term) ||
//         category.includes(term) ||
//         subCategory.includes(term)
//       );
//     });
//   }, [
//     allListings,
//     query,
//     stockFilter,
//     typeFilter,
//     categoryFilter,
//     subCategoryFilter,
//   ]);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredProducts.slice(start, start + itemsPerPage);
//   }, [filteredProducts, currentPage]);

//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

//   const buildProductFormData = (product, overrides = {}) => {
//     const next = { ...product, ...overrides };
//     const stockNum = Number(next.stock || 0);
//     const status = deriveStatusFromStock(stockNum);

//     const payload = new FormData();
//     payload.append('productName', next.productName || '');
//     payload.append('type', next.type || 'Rental');
//     payload.append('category', next.category || '');
//     payload.append('subCategory', next.subCategory || '');
//     payload.append('brand', next.brand || '');
//     payload.append('condition', next.condition || 'Brand New');
//     payload.append('shortDescription', next.shortDescription || '');
//     payload.append('description', next.description || '');
//     payload.append('specifications', JSON.stringify(next.specifications || {}));
//     payload.append('variants', JSON.stringify(next.variants || []));
//     payload.append(
//       'rentalConfigurations',
//       JSON.stringify(next.rentalConfigurations || []),
//     );
//     payload.append(
//       'salesConfiguration',
//       JSON.stringify(next.salesConfiguration || {}),
//     );
//     payload.append('refundableDeposit', String(next.refundableDeposit || 0));
//     payload.append(
//       'logisticsVerification',
//       JSON.stringify(next.logisticsVerification || {}),
//     );
//     payload.append(
//       'existingImages',
//       JSON.stringify(next.images || [next.image].filter(Boolean)),
//     );
//     payload.append('price', next.price || '');
//     payload.append('stock', String(stockNum));
//     payload.append('status', status);
//     payload.append('submissionStatus', next.submissionStatus || 'draft');
//     return payload;
//   };

//   const handleCreateProduct = async (form) => {
//     const autoStatus =
//       Number(form.stock) === 0
//         ? 'Out of Stock'
//         : Number(form.stock) <= 5
//           ? 'Low Stock'
//           : 'Active';
//     const status = form.status || autoStatus;

//     const payload = new FormData();
//     payload.append('productName', form.productName);
//     payload.append('type', form.type);
//     payload.append('category', form.category);
//     payload.append('subCategory', form.subCategory);
//     payload.append('brand', form.brand || '');
//     payload.append('condition', form.condition || 'Brand New');
//     payload.append('shortDescription', form.shortDescription || '');
//     payload.append('description', form.description || '');
//     payload.append('specifications', JSON.stringify(form.specifications || {}));
//     payload.append('variants', JSON.stringify(form.variants || []));
//     payload.append(
//       'rentalConfigurations',
//       JSON.stringify(form.rentalConfigurations || []),
//     );
//     payload.append(
//       'salesConfiguration',
//       JSON.stringify(form.salesConfiguration || {}),
//     );
//     payload.append('refundableDeposit', String(form.refundableDeposit || 0));
//     payload.append(
//       'logisticsVerification',
//       JSON.stringify(form.logisticsVerification || {}),
//     );
//     payload.append('existingImages', JSON.stringify(form.existingImages || []));
//     payload.append('price', form.price);
//     payload.append('stock', String(form.stock));
//     payload.append('status', status);
//     payload.append('submissionStatus', form.submissionStatus || 'draft');
//     if (form.createdVia) {
//       payload.append('createdVia', form.createdVia);
//     }
//     if (form.allowVendorEditRentalPrices !== undefined) {
//       payload.append(
//         'allowVendorEditRentalPrices',
//         String(form.allowVendorEditRentalPrices),
//       );
//     }
//     if (Array.isArray(form.images) && form.images.length) {
//       const owners = Array.isArray(form.newImageOwners)
//         ? form.newImageOwners
//         : [];
//       if (owners.length === form.images.length) {
//         form.images.slice(0, 10).forEach((img, i) => {
//           payload.append(`variantImages_${owners[i]}`, img);
//         });
//       } else {
//         form.images.slice(0, 5).forEach((img) => payload.append('images', img));
//       }
//     }

//     const resultAction = await dispatch(createProduct(payload));
//     if (createProduct.fulfilled.match(resultAction)) {
//       const sub = form.submissionStatus || 'published';
//       toast.success(
//         sub === 'draft'
//           ? 'Draft saved'
//           : 'Product submitted for admin approval',
//       );
//       setIsAddModalOpen(false);
//       return true;
//     } else {
//       toast.error(resultAction.payload || 'Failed to add product');
//       return false;
//     }
//   };

//   // const handleEditClick = (product) => {
//   //   if (String(product.type) === 'Service') {
//   //     setEditingServiceProduct(product);
//   //     setIsServiceModalOpen(true);
//   //     return;
//   //   }
//   //   setEditingProduct(product);
//   //   setIsAddModalOpen(true);
//   // };

//   const handleEditClick = (product) => {
//     if (String(product.type) === 'Service') {
//       setEditingServiceProduct(product);

//       if (product.createdVia === 'manual') {
//         setIsManualServiceModalOpen(true);
//       } else {
//         setIsServiceModalOpen(true);
//       }

//       return;
//     }

//     setEditingProduct(product);
//     setIsAddModalOpen(true);
//   };

//   const handleUpdateProduct = async (form) => {
//     if (!editingProduct?._id) return;
//     const autoStatus =
//       Number(form.stock) === 0
//         ? 'Out of Stock'
//         : Number(form.stock) <= 5
//           ? 'Low Stock'
//           : 'Active';
//     const status = form.status || autoStatus;

//     const payload = new FormData();
//     payload.append('productName', form.productName);
//     payload.append('type', form.type);
//     payload.append('category', form.category);
//     payload.append('subCategory', form.subCategory);
//     payload.append('brand', form.brand || '');
//     payload.append('condition', form.condition || 'Brand New');
//     payload.append('shortDescription', form.shortDescription || '');
//     payload.append('description', form.description || '');
//     payload.append('specifications', JSON.stringify(form.specifications || {}));
//     payload.append('variants', JSON.stringify(form.variants || []));
//     payload.append(
//       'rentalConfigurations',
//       JSON.stringify(form.rentalConfigurations || []),
//     );
//     payload.append(
//       'salesConfiguration',
//       JSON.stringify(form.salesConfiguration || {}),
//     );
//     payload.append('refundableDeposit', String(form.refundableDeposit || 0));
//     payload.append(
//       'logisticsVerification',
//       JSON.stringify(form.logisticsVerification || {}),
//     );
//     payload.append('existingImages', JSON.stringify(form.existingImages || []));
//     payload.append('price', form.price);
//     payload.append('stock', String(form.stock));
//     payload.append('status', status);
//     payload.append('submissionStatus', form.submissionStatus || 'draft');
//     if (form.createdVia) {
//       payload.append('createdVia', form.createdVia);
//     }
//     if (form.allowVendorEditRentalPrices !== undefined) {
//       payload.append(
//         'allowVendorEditRentalPrices',
//         String(form.allowVendorEditRentalPrices),
//       );
//     }
//     // New images from custom/manual listings are tagged with the variant
//     // index they were added to (form.newImageOwners, parallel to
//     // form.images) — send each under its own `variantImages_<idx>` field so
//     // the backend can attach it to the correct variant only, instead of
//     // splitting new uploads evenly across all variants.
//     if (Array.isArray(form.images) && form.images.length) {
//       const owners = Array.isArray(form.newImageOwners)
//         ? form.newImageOwners
//         : [];
//       if (owners.length === form.images.length) {
//         form.images.slice(0, 10).forEach((img, i) => {
//           payload.append(`variantImages_${owners[i]}`, img);
//         });
//       } else {
//         // Fallback for non-variant / template flows that still send a flat
//         // images array with no owner info — unchanged legacy behaviour.
//         form.images.slice(0, 5).forEach((img) => payload.append('images', img));
//       }
//     }

//     const resultAction = await dispatch(
//       updateProduct({ id: editingProduct._id, formData: payload }),
//     );
//     if (updateProduct.fulfilled.match(resultAction)) {
//       toast.success('Product updated successfully');
//       setIsAddModalOpen(false);
//       setEditingProduct(null);
//     } else {
//       toast.error(resultAction.payload || 'Failed to update product');
//     }
//   };
//   const handleCreateServiceProduct = async (fd) => {
//     const resultAction = await dispatch(createServiceProduct(fd));
//     if (createServiceProduct.fulfilled.match(resultAction)) {
//       setIsServiceModalOpen(false);
//       setIsManualServiceModalOpen(false);
//       setEditingServiceProduct(null);
//       dispatch(getMyServiceProducts());
//       return true;
//     }
//     toast.error(resultAction.payload || 'Failed to add service', {
//       position: 'top-right',
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'light',
//     });
//     return false;
//   };

//   const handleUpdateServiceProduct = async (fd) => {
//     if (!editingServiceProduct?._id) return false;
//     const resultAction = await dispatch(
//       updateServiceProduct({ id: editingServiceProduct._id, formData: fd }),
//     );
//     if (updateServiceProduct.fulfilled.match(resultAction)) {
//       setIsServiceModalOpen(false);
//       setIsManualServiceModalOpen(false);
//       setEditingServiceProduct(null);
//       dispatch(getMyServiceProducts());
//       return true;
//     }
//     toast.error(resultAction.payload || 'Failed to update service', {
//       position: 'top-right',
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'light',
//     });
//     return false;
//   };

//   const handleCloseModal = () => {
//     setIsAddModalOpen(false);
//     setEditingProduct(null);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!deleteTarget?._id) return;
//     const isService = String(deleteTarget.type) === 'Service';
//     const resultAction = isService
//       ? await dispatch(deleteServiceProduct(deleteTarget._id))
//       : await dispatch(deleteProduct(deleteTarget._id));

//     if (
//       (isService && deleteServiceProduct.fulfilled.match(resultAction)) ||
//       (!isService && deleteProduct.fulfilled.match(resultAction))
//     ) {
//       toast.success('Listing deleted successfully');
//     } else {
//       toast.error(resultAction.payload || 'Failed to delete listing');
//     }
//     setDeleteTarget(null);
//   };

//   const handleToggleActive = async (product) => {
//     if (!product.isAdminApproved) {
//       toast.info('This listing is pending admin approval.');
//       return;
//     }
//     if (String(product.submissionStatus || '').trim() !== 'published') {
//       toast.info('Only published listings can be shown on the website.');
//       return;
//     }
//     const adminOn = product.adminListingEnabled !== false;
//     if (!adminOn) {
//       toast.info('Admin has turned off this listing on the storefront.');
//       return;
//     }
//     const live = isProductLiveOnStorefront(product);
//     const nextVendor = !live;

//     const isService = String(product.type) === 'Service';
//     const resultAction = isService
//       ? await dispatch(
//           patchVendorServiceListingVisibility({
//             id: product._id,
//             vendorListingEnabled: nextVendor,
//           }),
//         )
//       : await dispatch(
//           patchVendorListingVisibility({
//             id: product._id,
//             vendorListingEnabled: nextVendor,
//           }),
//         );

//     if (
//       (isService &&
//         patchVendorServiceListingVisibility.fulfilled.match(resultAction)) ||
//       (!isService && patchVendorListingVisibility.fulfilled.match(resultAction))
//     ) {
//       toast.success(
//         nextVendor
//           ? 'Listing visible on website'
//           : 'Listing hidden from website',
//       );
//     } else {
//       toast.error(resultAction.payload || 'Failed to update visibility');
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <VendorSidebar />

//       {/* Main content */}
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         {/* Top bar */}
//         <VendorTopBar />

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
//           <div className="space-y-2">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//               {/* <div className="flex items-start gap-3">
//                 <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1E40AF]">
//                   <Package className="w-6 h-6 text-white" strokeWidth={1.75} />
//                 </div>
//                 <h1 className="text-base md:text-lg font-semibold text-gray-900">
//                   Inventory Overview
//                 </h1>
//                 <p className="text-xs text-gray-500">
//                   Manage your product stock and availability
//                 </p>
//               </div> */}
//               <div className="flex items-start gap-3">
//                 {/* <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1E40AF]">
//                   <Package className="w-6 h-6 text-white" strokeWidth={1.75} />
//                 </div> */}
//                 {/*
//           <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
//             <Image
//               src={adminCustome}
//               alt="admin"
//               className="w-6 h-6 object-contain"
//             />
//           </div> */}
//                 {/* <div>
//                   <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
//                     Inventory Overview
//                   </h1>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Manage your product stock and availability
//                   </p>
//                 </div> */}
//               </div>

//               {/* <div className="flex flex-wrap gap-2">
//                 <button
//                   onClick={() => {
//                     if (kycStatus !== 'approved') {
//                       toast.error(
//                         'KYC not approved yet. Complete KYC and wait for admin approval.',
//                       );
//                       return;
//                     }
//                     setEditingProduct(null);
//                     setIsAddModalOpen(true);
//                   }}
//                   disabled={kycLoading || kycStatus !== 'approved'}
//                   className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   + Add New Product
//                 </button>

//               </div> */}
//             </div>

//             {!kycLoading && kycStatus !== 'approved' ? (
//               <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
//                 Product creation is locked until KYC is approved by admin.
//                 Please submit your KYC from{' '}
//                 <a
//                   href="/vendor-kyc-verification"
//                   className="font-semibold underline"
//                 >
//                   Vendor KYC Verification
//                 </a>
//                 .
//               </div>
//             ) : null}

//             {/* Stats */}
//             {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-white rounded-2xl border p-4">
//                 <p className="text-xs text-gray-500">Total Products</p>
//                 <p className="text-2xl font-semibold">{totalProducts}</p>
//               </div>

//               <div className="bg-white rounded-2xl border p-4">
//                 <p className="text-xs text-gray-500">Low Stock</p>
//                 <p className="text-2xl text-amber-500">{lowStock}</p>
//               </div>

//               <div className="bg-white rounded-2xl border p-4">
//                 <p className="text-xs text-gray-500">Out of Stock</p>
//                 <p className="text-2xl text-red-500">{outOfStock}</p>
//               </div>
//             </div> */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {/* Total Products */}
//               <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <p className="text-sm font-medium text-gray-600">
//                     Total Products
//                   </p>
//                   <div className="p-1.5 bg-[#EFF6FF] rounded-lg">
//                     <Package className="w-5 h-5 text-blue-500" />
//                   </div>
//                 </div>

//                 <p className="text-3xl font-semibold mt-2 tabular-nums">
//                   {totalProducts}
//                 </p>
//               </div>

//               {/* Low Stock */}
//               <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <p className="text-sm font-medium text-gray-600">Low Stock</p>
//                   <div className="p-1.5 bg-[#FFF7ED] rounded-lg">
//                     <AlertTriangle className="w-5 h-5 text-amber-500" />
//                   </div>
//                 </div>

//                 <p className="text-2xl font-semibold mt-2 text-[#F97316] tabular-nums">
//                   {lowStock}
//                 </p>

//                 <p className="text-sm mt-2 text-gray-600">items</p>
//                 <button
//                   type="button"
//                   className="mt-2 text-xs font-medium text-[#F97316] hover:underline"
//                   onClick={() => setStockFilter('low')}
//                 >
//                   View list →
//                 </button>
//               </div>

//               {/* Out of Stock */}
//               <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <p className="text-sm font-medium text-gray-600">
//                     Out of Stock
//                   </p>
//                   <div className="p-1.5 bg-[#FEF2F2] rounded-lg">
//                     <CircleX className="w-5 h-5 text-red-500" />
//                   </div>
//                 </div>

//                 <p className="text-2xl font-semibold mt-2 text-[#E7000B] tabular-nums">
//                   {outOfStock}
//                 </p>

//                 <p className="text-sm mt-2 text-gray-600">items</p>
//                 <button
//                   type="button"
//                   className="mt-2 text-xs font-medium text-[#E7000B] hover:underline"
//                   onClick={() => setStockFilter('out')}
//                 >
//                   View list →
//                 </button>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-2xl border overflow-hidden">
//               {/* <div className="px-4 pt-4 flex mb-4 flex-col md:flex-row md:items-center gap-2 md:justify-between">

//                 <div className="relative w-full md:max-w-md">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

//                   <input
//                     type="text"
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     placeholder="Search by product, category, sub-category..."
//                     className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200"
//                   />
//                 </div>

//                 {stockFilter !== 'all' && (
//                   <button
//                     onClick={() => setStockFilter('all')}
//                     className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
//                   >
//                     <RefreshCcw className="w-3.5 h-3.5" />
//                     Reset filter
//                   </button>
//                 )}
//               </div> */}
//               <div className="px-4 pt-4 mb-4 flex flex-col gap-3">
//                 {/* Search + Filters + Reset — all in one row */}
//                 <div className="flex flex-wrap items-center gap-2">
//                   <div className="relative w-full md:max-w-xs mr-auto">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <input
//                       type="text"
//                       value={query}
//                       onChange={(e) => setQuery(e.target.value)}
//                       placeholder="Search by product, category, sub-category..."
//                       className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200"
//                     />
//                   </div>

//                   {/* Type filter */}
//                   <select
//                     value={typeFilter}
//                     onChange={(e) => {
//                       setTypeFilter(e.target.value);
//                       setCategoryFilter('all');
//                       setSubCategoryFilter('all');
//                     }}
//                     className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 bg-white"
//                   >
//                     {/* {uniqueTypes.map((t) => (
//                       <option key={t} value={t}>
//                         {t === 'all' ? 'All Types' : t}
//                       </option>
//                     ))} */}
//                     {uniqueTypes.map((t) => (
//                       <option key={t} value={t}>
//                         {t === 'all'
//                           ? 'All Types'
//                           : t === 'Rental'
//                             ? 'Rent'
//                             : t === 'Sell'
//                               ? 'Buy'
//                               : t}
//                       </option>
//                     ))}
//                   </select>

//                   {/* Category filter */}
//                   <select
//                     value={categoryFilter}
//                     onChange={(e) => {
//                       setCategoryFilter(e.target.value);
//                       setSubCategoryFilter('all');
//                     }}
//                     className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 bg-white"
//                   >
//                     {uniqueCategories.map((c) => (
//                       <option key={c} value={c}>
//                         {c === 'all' ? 'All Categories' : c}
//                       </option>
//                     ))}
//                   </select>

//                   {/* SubCategory filter */}
//                   <select
//                     value={subCategoryFilter}
//                     onChange={(e) => setSubCategoryFilter(e.target.value)}
//                     className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 bg-white"
//                   >
//                     {uniqueSubCategories.map((s) => (
//                       <option key={s} value={s}>
//                         {s === 'all' ? 'All Sub-Categories' : s}
//                       </option>
//                     ))}
//                   </select>

//                   {/* {(stockFilter !== 'all' ||
//                     typeFilter !== 'all' ||
//                     categoryFilter !== 'all' ||
//                     subCategoryFilter !== 'all') && (
//                     <button
//                       onClick={() => {
//                         setStockFilter('all');
//                         setTypeFilter('all');
//                         setCategoryFilter('all');
//                         setSubCategoryFilter('all');
//                       }}
//                       className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
//                     >
//                       <RefreshCcw className="w-3.5 h-3.5" />
//                       Reset
//                     </button>
//                   )}
//                 </div>
//               </div> */}
//                   {(stockFilter !== 'all' ||
//                     typeFilter !== 'all' ||
//                     categoryFilter !== 'all' ||
//                     subCategoryFilter !== 'all') && (
//                     <button
//                       onClick={() => {
//                         setStockFilter('all');
//                         setTypeFilter('all');
//                         setCategoryFilter('all');
//                         setSubCategoryFilter('all');
//                       }}
//                       className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
//                     >
//                       <RefreshCcw className="w-3.5 h-3.5" />
//                     </button>
//                   )}

//                   <button
//                     onClick={() => {
//                       if (kycStatus !== 'approved') {
//                         toast.error(
//                           'KYC not approved yet. Complete KYC and wait for admin approval.',
//                         );
//                         return;
//                       }
//                       setEditingProduct(null);
//                       setIsAddModalOpen(true);
//                     }}
//                     disabled={kycLoading || kycStatus !== 'approved'}
//                     className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     + Add Product
//                   </button>
//                 </div>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left">Product</th>
//                       <th className="px-4 py-3 text-left">Type</th>
//                       <th className="px-4 py-3 text-left">Category</th>
//                       <th className="px-4 py-3 text-left">SubCategory</th>
//                       <th className="px-4 py-3 text-left">Stock</th>
//                       <th className="px-4 py-3 text-left">Status</th>
//                       <th className="px-4 py-3 text-left">Create type</th>
//                       <th className="px-4 py-3 text-left">Active</th>
//                       <th className="px-4 py-3 text-right">Actions</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {paginatedProducts.map((p) => {
//                       const status = deriveStatusFromStock(p.stock);
//                       const statusClass =
//                         status === 'Out of Stock'
//                           ? 'bg-red-100 text-red-600'
//                           : status === 'Low Stock'
//                             ? 'bg-yellow-100 text-yellow-600'
//                             : 'bg-green-100 text-green-600';
//                       const isActiveOnStorefront = isProductLiveOnStorefront(p);
//                       const isApprovalPending = p.isAdminApproved === false;
//                       const adminListingOn = p.adminListingEnabled !== false;
//                       const storefrontToggleDisabled =
//                         isApprovalPending ||
//                         String(p.submissionStatus || '').trim() !==
//                           'published' ||
//                         !adminListingOn;
//                       const createTypeLabel =
//                         p.createdVia === 'template' ? 'automatic' : 'manual';

//                       return (
//                         <tr key={p._id} className="border-t">
//                           {/* Product */}
//                           <td className="px-4 py-3">
//                             <div className="flex items-center gap-3">
//                               <img
//                                 src={
//                                   p.images?.[0] ||
//                                   p.image ||
//                                   'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
//                                 }
//                                 alt={p.productName}
//                                 className="w-10 h-10 rounded-lg object-cover"
//                               />
//                               <div>
//                                 <p className="font-medium">{p.productName}</p>
//                                 <p className="text-xs text-gray-500">
//                                   {getInventoryPriceLabel(p)}
//                                 </p>
//                               </div>
//                             </div>
//                           </td>

//                           {/* Type */}
//                           {/* <td className="px-4 py-3">{p.type}</td> */}
//                           {/* Type */}
//                           <td className="px-4 py-3">
//                             {p.type === 'Rental'
//                               ? 'Rent'
//                               : p.type === 'Sell'
//                                 ? 'Buy'
//                                 : p.type}
//                           </td>

//                           {/* Category */}
//                           <td className="px-4 py-3">{p.category}</td>

//                           {/* SubCategory */}
//                           <td className="px-4 py-3">{p.subCategory}</td>

//                           {/* Stock */}
//                           {/* <td className="px-4 py-3">
//                             <span
//                               className={`${
//                                 p.stock === 0
//                                   ? 'text-red-500'
//                                   : p.stock <= 5
//                                     ? 'text-[#F97316]'
//                                     : 'text-black'
//                               }`}
//                             >
//                               {p.stock} Units
//                             </span>
//                           </td> */}
//                           {/* <td className="px-4 py-3 whitespace-nowrap">
//                             <span
//                               className={`${
//                                 p.stock === 0
//                                   ? 'text-red-500'
//                                   : p.stock <= 5
//                                     ? 'text-[#F97316]'
//                                     : 'text-black'
//                               }`}
//                             >
//                               {p.stock} Units
//                             </span>
//                           </td> */}
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             {String(p.type) === 'Service' ? (
//                               <span>-</span>
//                             ) : (
//                               <span
//                                 className={`${
//                                   p.stock === 0
//                                     ? 'text-red-500'
//                                     : p.stock <= 5
//                                       ? 'text-[#F97316]'
//                                       : 'text-black'
//                                 }`}
//                               >
//                                 {p.stock} Units
//                               </span>
//                             )}
//                           </td>

//                           {/* Status */}

//                           {/* Status */}
//                           {/* <td className="px-4 py-3">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
//                             >
//                               {status}
//                             </span>
//                           </td> */}
//                           {/* <td className="px-4 py-3 whitespace-nowrap">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
//                             >
//                               {status}
//                             </span>
//                           </td> */}
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             {String(p.type) === 'Service' ? (
//                               <span>-</span>
//                             ) : (
//                               <span
//                                 className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
//                               >
//                                 {status}
//                               </span>
//                             )}
//                           </td>

//                           {/* Create type */}
//                           <td className="px-4 py-3">
//                             <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
//                               {createTypeLabel}
//                             </span>
//                           </td>

//                           {/* Active toggle (controls storefront visibility) */}
//                           {/* <td className="px-4 py-3">
//                             <button
//                               type="button"
//                               role="switch"
//                               aria-checked={isActiveOnStorefront}
//                               aria-disabled={storefrontToggleDisabled}
//                               onClick={() => handleToggleActive(p)}
//                               className={`relative inline-flex h-6 w-11 rounded-full transition ${
//                                 isActiveOnStorefront
//                                   ? 'bg-emerald-500'
//                                   : 'bg-red-500'
//                               }`}
//                               disabled={storefrontToggleDisabled}
//                               title={
//                                 isApprovalPending
//                                   ? 'Pending admin approval'
//                                   : String(p.submissionStatus || '').trim() !==
//                                       'published'
//                                     ? 'Publish listing before showing on website'
//                                     : !adminListingOn
//                                       ? 'Admin has disabled this listing on the storefront'
//                                       : isActiveOnStorefront
//                                         ? 'Visible on storefront'
//                                         : 'Hidden from storefront'
//                               }
//                             >
//                               <span
//                                 className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
//                                   isActiveOnStorefront
//                                     ? 'translate-x-5 mt-0.5'
//                                     : 'translate-x-0.5 mt-0.5'
//                                 }`}
//                               />
//                             </button>
//                             {isApprovalPending ? (
//                               <p className="mt-1 text-[11px] text-amber-600">
//                                 Pending approval
//                               </p>
//                             ) : null}
//                           </td> */}
//                           <td className="px-4 py-3">
//                             <button
//                               type="button"
//                               role="switch"
//                               aria-checked={isActiveOnStorefront}
//                               aria-disabled={storefrontToggleDisabled}
//                               onClick={() => handleToggleActive(p)}
//                               className={`relative inline-flex h-6 w-11 rounded-full border border-gray-300 transition ${
//                                 isActiveOnStorefront
//                                   ? 'bg-[#E5E7EB]'
//                                   : 'bg-[#FEF2F2]'
//                               }`}
//                               disabled={storefrontToggleDisabled}
//                               title={
//                                 isApprovalPending
//                                   ? 'Pending admin approval'
//                                   : String(p.submissionStatus || '').trim() !==
//                                       'published'
//                                     ? 'Publish listing before showing on website'
//                                     : !adminListingOn
//                                       ? 'Admin has disabled this listing on the storefront'
//                                       : isActiveOnStorefront
//                                         ? 'Visible on storefront'
//                                         : 'Hidden from storefront'
//                               }
//                             >
//                               <span
//                                 className={`inline-block h-5 w-5 transform rounded-full shadow transition mt-0.5 ${
//                                   isActiveOnStorefront
//                                     ? 'translate-x-5 bg-[#0F8A42]'
//                                     : 'translate-x-0.5 bg-[#FF0000]'
//                                 }`}
//                               />
//                             </button>

//                             {isApprovalPending ? (
//                               <p className="mt-1 text-[11px] text-amber-600">
//                                 Pending approval
//                               </p>
//                             ) : null}
//                           </td>

//                           {/* Actions */}
//                           {/* Actions */}
//                           <td className="px-4 py-3 text-right">
//                             <div className="relative inline-block">
//                               <button
//                                 ref={(el) => {
//                                   menuBtnRefs.current[p._id] = el;
//                                 }}
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   openActionMenu(p._id);
//                                 }}
//                                 className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
//                                 title="More options"
//                               >
//                                 <svg
//                                   xmlns="http://www.w3.org/2000/svg"
//                                   width="16"
//                                   height="16"
//                                   viewBox="0 0 24 24"
//                                   fill="currentColor"
//                                 >
//                                   <circle cx="12" cy="5" r="2" />
//                                   <circle cx="12" cy="12" r="2" />
//                                   <circle cx="12" cy="19" r="2" />
//                                 </svg>
//                               </button>
//                               {openMenuId === p._id &&
//                                 typeof document !== 'undefined' &&
//                                 createPortal(
//                                   <div
//                                     onClick={(e) => e.stopPropagation()}
//                                     style={{
//                                       position: 'fixed',
//                                       top: menuPos.top,
//                                       left: menuPos.left,
//                                     }}
//                                     className="z-[100] w-32 rounded-xl border border-gray-200 bg-white shadow-lg py-1"
//                                   >
//                                     <button
//                                       onClick={() => {
//                                         setOpenMenuId(null);
//                                         handleEditClick(p);
//                                       }}
//                                       className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                                     >
//                                       <Pencil size={14} />
//                                       Edit
//                                     </button>
//                                     <button
//                                       onClick={() => {
//                                         setOpenMenuId(null);
//                                         setDeleteTarget(p);
//                                       }}
//                                       className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
//                                     >
//                                       <Trash2 size={14} />
//                                       Delete
//                                     </button>
//                                   </div>,
//                                   document.body,
//                                 )}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                     {!loading &&
//                       !serviceLoading &&
//                       filteredProducts.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan={9}
//                             className="px-4 py-8 text-center text-gray-500"
//                           >
//                             No products found.
//                           </td>
//                         </tr>
//                       )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Footer */}
//               <div className="p-4 flex items-center justify-between text-xs text-gray-500">
//                 <div>
//                   Showing {paginatedProducts.length} of{' '}
//                   {filteredProducts.length} products
//                 </div>

//                 {/* Pagination controls */}
//                 <div className="flex items-center gap-2 ml-auto">
//                   {/* Prev */}
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                     className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50"
//                   >
//                     <ChevronLeft size={16} />
//                   </button>

//                   {/* current page only */}
//                   <span className="px-3 py-1 rounded border bg-gray-50 text-gray-700 font-medium">
//                     {currentPage}
//                   </span>

//                   {/* Next */}
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(totalPages, p + 1))
//                     }
//                     disabled={currentPage === totalPages || totalPages === 0}
//                     className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50"
//                   >
//                     <ChevronRight size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//             {error && <p className="text-sm text-red-500 px-1">{error}</p>}
//             {serviceError && (
//               <p className="text-sm text-red-500 px-1">{serviceError}</p>
//             )}
//           </div>
//         </main>
//       </div>

//       <VendorProductAddModal
//         isOpen={isAddModalOpen}
//         onClose={handleCloseModal}
//         onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
//         mode={editingProduct ? 'edit' : 'create'}
//         initialData={editingProduct}
//         onOpenServiceProduct={() => {
//           setIsAddModalOpen(false);
//           setEditingProduct(null);
//           setEditingServiceProduct(null);
//           setIsServiceModalOpen(true);
//         }}
//         onOpenManualProduct={() => {
//           setIsAddModalOpen(false);
//           setManualModalDesign('admin');
//           setManualListingKind('rental');
//           setIsManualModalOpen(true);
//         }}
//       />

//       <VendorAutoServices
//         isOpen={isServiceModalOpen}
//         mode={editingServiceProduct ? 'edit' : 'create'}
//         initialData={editingServiceProduct}
//         onClose={() => {
//           setIsServiceModalOpen(false);
//           setEditingServiceProduct(null);
//         }}
//         onSubmit={
//           editingServiceProduct
//             ? handleUpdateServiceProduct
//             : handleCreateServiceProduct
//         }
//         setIsManualServiceModalOpen={setIsManualServiceModalOpen}
//       />

//       {/* <VendorManualServices
//         isOpen={isManualServiceModalOpen}
//         onClose={() => setIsManualServiceModalOpen(false)}
//         onSubmit={async (fd) => {
//           const ok = (await editingServiceProduct)
//             ? handleUpdateServiceProduct(fd)
//             : handleCreateServiceProduct(fd);
//           if (ok) setIsManualServiceModalOpen(false);
//           return ok;
//         }}
//       /> */}

//       <VendorManualServices
//         isOpen={isManualServiceModalOpen}
//         onClose={() => setIsManualServiceModalOpen(false)}
//         onSubmit={async (fd) => {
//           const ok = editingServiceProduct
//             ? await handleUpdateServiceProduct(fd)
//             : await handleCreateServiceProduct(fd);
//           if (ok) setIsManualServiceModalOpen(false);
//           return ok;
//         }}
//         mode={editingServiceProduct ? 'edit' : 'create'}
//         initialData={editingServiceProduct}
//       />

//       <VendorManualProductModal
//         isOpen={isManualModalOpen}
//         onClose={() => {
//           setIsManualModalOpen(false);
//           setManualModalDesign('vendor');
//           setManualListingKind('rental');
//         }}
//         onSubmit={async (form) => {
//           const ok = await handleCreateProduct(form);
//           if (ok) {
//             setIsManualModalOpen(false);
//             setManualListingKind('rental');
//           }
//         }}
//         designMode={manualModalDesign}
//         listingKind={manualListingKind}
//       />

//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
//           <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200">
//             <div className="px-5 py-4 border-b border-gray-100">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Delete Product
//               </h3>
//               <p className="text-sm text-gray-500 mt-1">
//                 Are you sure you want to delete{' '}
//                 <span className="font-medium text-gray-700">
//                   {deleteTarget.productName}
//                 </span>
//                 ?
//               </p>
//             </div>
//             <div className="px-5 py-4 flex items-center justify-end gap-2">
//               <button
//                 onClick={() => setDeleteTarget(null)}
//                 className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
//               >
//                 Yes, Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Products;

'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import VendorSidebar from '../../Components/Common/VendorSidebar';
import VendorTopBar from '../../Components/Common/VendorTopBar';
import { useDispatch, useSelector } from 'react-redux';
import {
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  CircleX,
  RefreshCcw,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  patchVendorListingVisibility,
  updateProduct,
} from '../../../redux/slices/productSlice';
import VendorProductAddModal from '../../Components/Modals/VendorProductAddModal';
import VendorAutoServices from '../../Components/Modals/VendorAutoServices';
import VendorManualProductModal from '../../Components/Modals/VendorManualProductModal';
import {
  createServiceProduct,
  deleteServiceProduct,
  getMyServiceProducts,
  patchVendorServiceListingVisibility,
  updateServiceProduct,
} from '../../../redux/slices/vendorServiceProductSlice';
import { apiGetMyVendorKyc, apiGetCategories } from '@/service/api';
import VendorManualServices from '@/Vendor/Components/Modals/VendorManualServices';
import {
  buildCategoryRateMap,
  FALLBACK_COMMISSION_RATE,
  vendorFacingTierAmount,
} from '../../utils/vendorPayout';

function formatInrAmount(n) {
  if (!Number.isFinite(n) || n <= 0) return '';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

// function pickProductRentalConfigurations(product) {
//   const top = product?.rentalConfigurations;
//   if (Array.isArray(top) && top.length) return top;
//   const v0 = product?.variants?.[0];
//   if (
//     Array.isArray(v0?.rentalConfigurations) &&
//     v0.rentalConfigurations.length
//   ) {
//     return v0.rentalConfigurations;
//   }
//   return [];
// }

function pickProductRentalConfigurations(product) {
  const top = Array.isArray(product?.rentalConfigurations)
    ? product.rentalConfigurations
    : [];
  const topHasPrice = top.some(
    (c) => Number(c?.vendorRent || c?.customerRent || c?.pricePerDay || 0) > 0,
  );
  if (topHasPrice) return top;
  // Custom/manual listings store tenure pricing per variant (the top-level
  // array is often just a zero-priced default ladder in that case). Gather
  // tiers from every variant so the table shows the correct day/month rate.
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const fromAllVariants = variants.flatMap((v) =>
    Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
  );
  if (fromAllVariants.length) return fromAllVariants;
  return top;
}

function tierRentAmount(tier, commissionRatePercent) {
  return vendorFacingTierAmount(tier, commissionRatePercent);
}

// function isProductLiveOnStorefront(p) {
//   if (!p || p.isAdminApproved === false) return false;
//   if (String(p.submissionStatus || '').trim() !== 'published') return false;
//   if (p.adminListingEnabled === false) return false;
//   if (p.vendorListingEnabled === false) return false;
//   return true;
// }

//for admin side catgory section active prodcuts
function isProductLiveOnStorefront(p) {
  if (!p) return false;
  if (p.isAdminApproved === false) return false;
  if (String(p.submissionStatus || '').trim() !== 'published') return false;
  if (p.adminListingEnabled === false) return false;
  if (p.vendorListingEnabled === false) return false;
  if (Number(p.stock || 0) <= 0) return false;

  return true;
}

// function getInventoryPriceLabel(product) {
//   if (product?.type && String(product.type) !== 'Rental') {
//     const raw = product?.price;
//     if (
//       raw != null &&
//       String(raw).trim() !== '' &&
//       String(raw).trim() !== '0'
//     ) {
//       return String(raw).trim();
//     }
//     return '—';
//   }

//   const configs = pickProductRentalConfigurations(product);
//   if (configs.length) {
//     const isDay = configs.some((c) => c?.periodUnit === 'day');
//     if (isDay) {
//       const tier =
//         configs.find((c) => c?.periodUnit === 'day' && Number(c?.days) === 3) ||
//         configs.find((c) => c?.periodUnit === 'day');
//       if (tier) {
//         const amt = tierRentAmount(tier);
//         const d = Number(tier?.days) > 0 ? Number(tier.days) : 3;
//         const f = formatInrAmount(amt);
//         if (f) return d === 3 ? `₹${f} / 3d` : `₹${f} / ${d}d`;
//       }
//     } else {
//       const tier =
//         configs.find(
//           (c) => c?.periodUnit !== 'day' && Number(c?.months) === 3,
//         ) ||
//         configs.find(
//           (c) =>
//             c?.periodUnit === 'month' ||
//             (!c?.periodUnit && Number(c?.months) > 0),
//         ) ||
//         configs.find((c) => Number(c?.months) > 0);
//       if (tier) {
//         const amt = tierRentAmount(tier);
//         const m = Number(tier?.months) > 0 ? Number(tier.months) : 3;
//         const f = formatInrAmount(amt);
//         if (f) return m === 3 ? `₹${f} / 3mo` : `₹${f} / ${m}mo`;
//       }
//     }
//   }

//   const raw = product?.price;
//   const s = raw != null ? String(raw).trim() : '';
//   if (s && s !== '0') {
//     if (/[₹]|rs\.?|\/mo|\/month|\/d|\/day/i.test(s)) return s;
//     return `₹${s}/mo`;
//   }
//   return '—';
// }

function getInventoryPriceLabel(product, commissionRatePercent) {
  // if (product?.type && String(product.type) !== 'Rental') {
  //   const raw = product?.price;
  //   if (
  //     raw != null &&
  //     String(raw).trim() !== '' &&
  //     String(raw).trim() !== '0'
  //   ) {
  //     return String(raw).trim();
  //   }
  if (product?.type && String(product.type) !== 'Rental') {
    const raw = product?.price;
    if (
      raw != null &&
      String(raw).trim() !== '' &&
      String(raw).trim() !== '0'
    ) {
      const rawStr = String(raw).trim();
      return /[₹]|rs\.?/i.test(rawStr) ? rawStr : `₹${rawStr}`;
    }
    // Custom/manual multi-variant sell listings may leave the top-level
    // `price` empty (each variant carries its own sellPrice instead).
    // Fall back to the first variant that actually has a sell price.
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
    if (firstWithPrice) {
      return `₹${Number(firstWithPrice.sellPrice).toLocaleString('en-IN')}`;
    }
    return '—';
  }

  const configs = pickProductRentalConfigurations(product);
  if (configs.length) {
    // Pick the shortest tenure tier — sorted by its real length (days for
    // day-wise plans, months for month-wise plans), not by raw `months`
    // alone (which is always 0 on day-wise tiers and breaks the sort).
    const usable = configs.filter(
      (c) =>
        Number(c?.vendorRent || c?.customerRent || c?.pricePerDay || 0) > 0,
    );
    const tier = usable.sort((a, b) => {
      const lenA =
        a?.periodUnit === 'day' ? Number(a.days || 0) : Number(a.months || 0);
      const lenB =
        b?.periodUnit === 'day' ? Number(b.days || 0) : Number(b.months || 0);
      return lenA - lenB;
    })[0];

    // if (tier) {
    //   const isDay = tier.periodUnit === 'day';
    //   const len = isDay
    //     ? Number(tier.days) > 0
    //       ? Number(tier.days)
    //       : 1
    //     : Number(tier.months) > 0
    //       ? Number(tier.months)
    //       : 1;
    //   const totalAmt = tierRentAmount(tier);
    //   // Show the per-unit rate (total ÷ tenure length), never the raw
    //   // total for the whole tenure — e.g. ₹111 over 3 months → ₹37/month.
    //   const perUnit = Math.round(totalAmt / len);
    //   const f = formatInrAmount(perUnit);
    //   if (f) return isDay ? `₹${f}/day` : `₹${f}/month`;
    // }

    if (tier) {
      const isDay = tier.periodUnit === 'day';
      const totalAmt = tierRentAmount(tier, commissionRatePercent);
      // Day-wise tiers store a total for the tenure, so divide by day
      // count to get the per-day rate — e.g. ₹300 over 3 days → ₹100/day.
      // Month-wise tiers store customerRent as the ALREADY per-month rate,
      // so it must be used as-is, never divided by the months count —
      // e.g. ₹150/month tenure must show ₹150/month, not ₹150/3=₹50/month.
      const perUnit = isDay
        ? Math.round(totalAmt / (Number(tier.days) > 0 ? Number(tier.days) : 1))
        : Math.round(totalAmt);
      const f = formatInrAmount(perUnit);
      if (f) return isDay ? `₹${f}/day` : `₹${f}/month`;
    }
  }

  const raw = product?.price;
  const s = raw != null ? String(raw).trim() : '';
  if (s && s !== '0') {
    if (/[₹]|rs\.?|\/mo|\/month|\/d|\/day/i.test(s)) return s;
    return `₹${s}/mo`;
  }
  return '—';
}

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const {
    serviceProducts,
    loading: serviceLoading,
    error: serviceError,
  } = useSelector((state) => state.vendorServiceProduct);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualModalDesign, setManualModalDesign] = useState('vendor');
  const [manualListingKind, setManualListingKind] = useState('rental');
  const [isManualServiceModalOpen, setIsManualServiceModalOpen] =
    useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingServiceProduct, setEditingServiceProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryRateMap, setCategoryRateMap] = useState({});
  const [kycStatus, setKycStatus] = useState('');
  const [kycLoading, setKycLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuBtnRefs = useRef({});
  /** Synchronous guard against duplicate product creation/update if the
   * modal's onSubmit somehow fires more than once for the same action
   * (rapid clicks, re-render timing, etc). Refs update instantly, unlike
   * state, so this blocks re-entrant calls before any dispatch happens. */
  const productSubmitInFlightRef = useRef(false);
  /** Same guard, dedicated to service product create/update. */
  const serviceSubmitInFlightRef = useRef(false);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = () => setOpenMenuId(null);
    const handleScrollOrResize = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openMenuId]);

  const openActionMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const btn = menuBtnRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.right - 128, // 128px = w-32 menu width, right-aligned to button
      });
    }
    setOpenMenuId(id);
  };
  const itemsPerPage = 10;

  // Fetch products
  useEffect(() => {
    dispatch(getMyProducts());
    apiGetCategories()
      .then((res) => {
        setCategoryRateMap(
          buildCategoryRateMap(Array.isArray(res.data) ? res.data : []),
        );
      })
      .catch(() => setCategoryRateMap({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getMyServiceProducts());
  }, [dispatch]);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) {
      setKycLoading(false);
      return;
    }
    apiGetMyVendorKyc(token)
      .then((res) => {
        setKycStatus(res.data?.kyc?.status || '');
      })
      .catch(() => {
        setKycStatus('');
      })
      .finally(() => setKycLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, stockFilter, typeFilter, categoryFilter, subCategoryFilter]);

  const deriveStatusFromStock = (stock) => {
    const s = Number(stock || 0);
    if (s <= 0) return 'Out of Stock';
    if (s <= 5) return 'Low Stock';
    return 'Active';
  };

  // Dynamic stats (prefer saved status; fallback to stock-derived status)
  const getProductStatus = (p) => {
    if (p.status) return p.status;
    if (p.stock === 0) return 'Out of Stock';
    if (p.stock <= 5) return 'Low Stock';
    return 'Active';
  };

  const allListings = [...(products || []), ...(serviceProducts || [])];

  const totalProducts = allListings.length;

  // const lowStock = allListings.filter(
  //   (p) => deriveStatusFromStock(p.stock) === 'Low Stock',
  // ).length;
  const lowStock = allListings.filter(
    (p) =>
      String(p.type) !== 'Service' &&
      deriveStatusFromStock(p.stock) === 'Low Stock',
  ).length;

  const outOfStock = allListings.filter(
    (p) =>
      String(p.type) !== 'Service' &&
      deriveStatusFromStock(p.stock) === 'Out of Stock',
  ).length;

  // const filteredProducts = useMemo(() => {
  //   const term = query.trim().toLowerCase();

  //   let list = allListings;

  //   // optional stock filter support
  //   if (stockFilter === 'low') {
  //     list = list.filter((p) => deriveStatusFromStock(p.stock) === 'Low Stock');
  //   } else if (stockFilter === 'out') {
  //     list = list.filter(
  //       (p) => deriveStatusFromStock(p.stock) === 'Out of Stock',
  //     );
  //   }

  //   if (!term) return list;

  //   return list.filter((p) => {
  //     const name = p.productName?.toLowerCase() || '';
  //     const category = p.category?.toLowerCase() || '';
  //     const subCategory = p.subCategory?.toLowerCase() || '';

  //     return (
  //       name.includes(term) ||
  //       category.includes(term) ||
  //       subCategory.includes(term)
  //     );
  //   });
  // }, [allListings, query, stockFilter]);

  const uniqueTypes = useMemo(() => {
    const types = allListings.map((p) => p.type).filter(Boolean);
    return ['all', ...new Set(types)];
  }, [allListings]);

  const uniqueCategories = useMemo(() => {
    let list = allListings;
    if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter);
    const cats = list.map((p) => p.category).filter(Boolean);
    return ['all', ...new Set(cats)];
  }, [allListings, typeFilter]);

  const uniqueSubCategories = useMemo(() => {
    let list = allListings;
    if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter);
    if (categoryFilter !== 'all')
      list = list.filter((p) => p.category === categoryFilter);
    const subs = list.map((p) => p.subCategory).filter(Boolean);
    return ['all', ...new Set(subs)];
  }, [allListings, typeFilter, categoryFilter]);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    let list = allListings;

    // if (stockFilter === 'low') {
    //   list = list.filter((p) => deriveStatusFromStock(p.stock) === 'Low Stock');
    // } else if (stockFilter === 'out') {
    //   list = list.filter(
    //     (p) => deriveStatusFromStock(p.stock) === 'Out of Stock',
    //   );
    // }

    if (stockFilter === 'low') {
      list = list.filter(
        (p) =>
          String(p.type) !== 'Service' &&
          deriveStatusFromStock(p.stock) === 'Low Stock',
      );
    } else if (stockFilter === 'out') {
      list = list.filter(
        (p) =>
          String(p.type) !== 'Service' &&
          deriveStatusFromStock(p.stock) === 'Out of Stock',
      );
    }

    if (typeFilter !== 'all') {
      list = list.filter((p) => p.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (subCategoryFilter !== 'all') {
      list = list.filter((p) => p.subCategory === subCategoryFilter);
    }

    if (!term) return list;

    return list.filter((p) => {
      const name = p.productName?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';
      const subCategory = p.subCategory?.toLowerCase() || '';
      return (
        name.includes(term) ||
        category.includes(term) ||
        subCategory.includes(term)
      );
    });
  }, [
    allListings,
    query,
    stockFilter,
    typeFilter,
    categoryFilter,
    subCategoryFilter,
  ]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const buildProductFormData = (product, overrides = {}) => {
    const next = { ...product, ...overrides };
    const stockNum = Number(next.stock || 0);
    const status = deriveStatusFromStock(stockNum);

    const payload = new FormData();
    payload.append('productName', next.productName || '');
    payload.append('type', next.type || 'Rental');
    payload.append('category', next.category || '');
    payload.append('subCategory', next.subCategory || '');
    payload.append('brand', next.brand || '');
    payload.append('condition', next.condition || 'Brand New');
    payload.append('shortDescription', next.shortDescription || '');
    payload.append('description', next.description || '');
    payload.append('specifications', JSON.stringify(next.specifications || {}));
    payload.append('variants', JSON.stringify(next.variants || []));
    payload.append(
      'rentalConfigurations',
      JSON.stringify(next.rentalConfigurations || []),
    );
    payload.append(
      'salesConfiguration',
      JSON.stringify(next.salesConfiguration || {}),
    );
    payload.append('refundableDeposit', String(next.refundableDeposit || 0));
    payload.append(
      'logisticsVerification',
      JSON.stringify(next.logisticsVerification || {}),
    );
    payload.append(
      'existingImages',
      JSON.stringify(next.images || [next.image].filter(Boolean)),
    );
    payload.append('price', next.price || '');
    payload.append('stock', String(stockNum));
    payload.append('status', status);
    payload.append('submissionStatus', next.submissionStatus || 'draft');
    return payload;
  };

  const handleCreateProduct = async (form) => {
    if (productSubmitInFlightRef.current) return false;
    productSubmitInFlightRef.current = true;
    try {
      const autoStatus =
        Number(form.stock) === 0
          ? 'Out of Stock'
          : Number(form.stock) <= 5
            ? 'Low Stock'
            : 'Active';
      const status = form.status || autoStatus;

      const payload = new FormData();
      payload.append('productName', form.productName);
      payload.append('type', form.type);
      payload.append('category', form.category);
      payload.append('subCategory', form.subCategory);
      payload.append('brand', form.brand || '');
      payload.append('condition', form.condition || 'Brand New');
      payload.append('shortDescription', form.shortDescription || '');
      payload.append('description', form.description || '');
      payload.append(
        'specifications',
        JSON.stringify(form.specifications || {}),
      );
      payload.append('variants', JSON.stringify(form.variants || []));
      payload.append(
        'rentalConfigurations',
        JSON.stringify(form.rentalConfigurations || []),
      );
      payload.append(
        'salesConfiguration',
        JSON.stringify(form.salesConfiguration || {}),
      );
      payload.append('refundableDeposit', String(form.refundableDeposit || 0));
      payload.append(
        'logisticsVerification',
        JSON.stringify(form.logisticsVerification || {}),
      );
      payload.append(
        'existingImages',
        JSON.stringify(form.existingImages || []),
      );
      payload.append('price', form.price);
      payload.append('stock', String(form.stock));
      payload.append('status', status);
      payload.append('submissionStatus', form.submissionStatus || 'draft');
      if (form.createdVia) {
        payload.append('createdVia', form.createdVia);
      }
      if (form.allowVendorEditRentalPrices !== undefined) {
        payload.append(
          'allowVendorEditRentalPrices',
          String(form.allowVendorEditRentalPrices),
        );
      }
      if (Array.isArray(form.images) && form.images.length) {
        const owners = Array.isArray(form.newImageOwners)
          ? form.newImageOwners
          : [];
        if (owners.length === form.images.length) {
          form.images.slice(0, 10).forEach((img, i) => {
            payload.append(`variantImages_${owners[i]}`, img);
          });
        } else {
          form.images
            .slice(0, 5)
            .forEach((img) => payload.append('images', img));
        }
      }

      const resultAction = await dispatch(createProduct(payload));
      if (createProduct.fulfilled.match(resultAction)) {
        const sub = form.submissionStatus || 'published';
        toast.success(
          sub === 'draft'
            ? 'Draft saved'
            : 'Product submitted for admin approval',
        );
        setIsAddModalOpen(false);
        return true;
      } else {
        toast.error(resultAction.payload || 'Failed to add product');
        return false;
      }
    } finally {
      productSubmitInFlightRef.current = false;
    }
  };

  // const handleEditClick = (product) => {
  //   if (String(product.type) === 'Service') {
  //     setEditingServiceProduct(product);
  //     setIsServiceModalOpen(true);
  //     return;
  //   }
  //   setEditingProduct(product);
  //   setIsAddModalOpen(true);
  // };

  const handleEditClick = (product) => {
    if (String(product.type) === 'Service') {
      setEditingServiceProduct(product);

      if (product.createdVia === 'manual') {
        setIsManualServiceModalOpen(true);
      } else {
        setIsServiceModalOpen(true);
      }

      return;
    }

    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleUpdateProduct = async (form) => {
    if (!editingProduct?._id) return;
    if (productSubmitInFlightRef.current) return;
    productSubmitInFlightRef.current = true;
    try {
      const autoStatus =
        Number(form.stock) === 0
          ? 'Out of Stock'
          : Number(form.stock) <= 5
            ? 'Low Stock'
            : 'Active';
      const status = form.status || autoStatus;

      const payload = new FormData();
      payload.append('productName', form.productName);
      payload.append('type', form.type);
      payload.append('category', form.category);
      payload.append('subCategory', form.subCategory);
      payload.append('brand', form.brand || '');
      payload.append('condition', form.condition || 'Brand New');
      payload.append('shortDescription', form.shortDescription || '');
      payload.append('description', form.description || '');
      payload.append(
        'specifications',
        JSON.stringify(form.specifications || {}),
      );
      payload.append('variants', JSON.stringify(form.variants || []));
      payload.append(
        'rentalConfigurations',
        JSON.stringify(form.rentalConfigurations || []),
      );
      payload.append(
        'salesConfiguration',
        JSON.stringify(form.salesConfiguration || {}),
      );
      payload.append('refundableDeposit', String(form.refundableDeposit || 0));
      payload.append(
        'logisticsVerification',
        JSON.stringify(form.logisticsVerification || {}),
      );
      payload.append(
        'existingImages',
        JSON.stringify(form.existingImages || []),
      );
      payload.append('price', form.price);
      payload.append('stock', String(form.stock));
      payload.append('status', status);
      payload.append('submissionStatus', form.submissionStatus || 'draft');
      if (form.createdVia) {
        payload.append('createdVia', form.createdVia);
      }
      if (form.allowVendorEditRentalPrices !== undefined) {
        payload.append(
          'allowVendorEditRentalPrices',
          String(form.allowVendorEditRentalPrices),
        );
      }
      // New images from custom/manual listings are tagged with the variant
      // index they were added to (form.newImageOwners, parallel to
      // form.images) — send each under its own `variantImages_<idx>` field so
      // the backend can attach it to the correct variant only, instead of
      // splitting new uploads evenly across all variants.
      if (Array.isArray(form.images) && form.images.length) {
        const owners = Array.isArray(form.newImageOwners)
          ? form.newImageOwners
          : [];
        if (owners.length === form.images.length) {
          form.images.slice(0, 10).forEach((img, i) => {
            payload.append(`variantImages_${owners[i]}`, img);
          });
        } else {
          // Fallback for non-variant / template flows that still send a flat
          // images array with no owner info — unchanged legacy behaviour.
          form.images
            .slice(0, 5)
            .forEach((img) => payload.append('images', img));
        }
      }

      const resultAction = await dispatch(
        updateProduct({ id: editingProduct._id, formData: payload }),
      );
      if (updateProduct.fulfilled.match(resultAction)) {
        toast.success('Product updated successfully');
        setIsAddModalOpen(false);
        setEditingProduct(null);
      } else {
        toast.error(resultAction.payload || 'Failed to update product');
      }
    } finally {
      productSubmitInFlightRef.current = false;
    }
  };
  const handleCreateServiceProduct = async (fd) => {
    if (serviceSubmitInFlightRef.current) return false;
    serviceSubmitInFlightRef.current = true;
    try {
      const resultAction = await dispatch(createServiceProduct(fd));
      if (createServiceProduct.fulfilled.match(resultAction)) {
        setIsServiceModalOpen(false);
        setIsManualServiceModalOpen(false);
        setEditingServiceProduct(null);
        dispatch(getMyServiceProducts());
        return true;
      }
      toast.error(resultAction.payload || 'Failed to add service', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      return false;
    } finally {
      serviceSubmitInFlightRef.current = false;
    }
  };

  const handleUpdateServiceProduct = async (fd) => {
    if (!editingServiceProduct?._id) return false;
    if (serviceSubmitInFlightRef.current) return false;
    serviceSubmitInFlightRef.current = true;
    try {
      const resultAction = await dispatch(
        updateServiceProduct({ id: editingServiceProduct._id, formData: fd }),
      );
      if (updateServiceProduct.fulfilled.match(resultAction)) {
        setIsServiceModalOpen(false);
        setIsManualServiceModalOpen(false);
        setEditingServiceProduct(null);
        dispatch(getMyServiceProducts());
        return true;
      }
      toast.error(resultAction.payload || 'Failed to update service', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      return false;
    } finally {
      serviceSubmitInFlightRef.current = false;
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?._id) return;
    const isService = String(deleteTarget.type) === 'Service';
    const resultAction = isService
      ? await dispatch(deleteServiceProduct(deleteTarget._id))
      : await dispatch(deleteProduct(deleteTarget._id));

    if (
      (isService && deleteServiceProduct.fulfilled.match(resultAction)) ||
      (!isService && deleteProduct.fulfilled.match(resultAction))
    ) {
      toast.success('Listing deleted successfully');
    } else {
      toast.error(resultAction.payload || 'Failed to delete listing');
    }
    setDeleteTarget(null);
  };

  const handleToggleActive = async (product) => {
    if (!product.isAdminApproved) {
      toast.info('This listing is pending admin approval.');
      return;
    }
    if (String(product.submissionStatus || '').trim() !== 'published') {
      toast.info('Only published listings can be shown on the website.');
      return;
    }
    const adminOn = product.adminListingEnabled !== false;
    if (!adminOn) {
      toast.info('Admin has turned off this listing on the storefront.');
      return;
    }
    const live = isProductLiveOnStorefront(product);
    const nextVendor = !live;

    const isService = String(product.type) === 'Service';
    const resultAction = isService
      ? await dispatch(
          patchVendorServiceListingVisibility({
            id: product._id,
            vendorListingEnabled: nextVendor,
          }),
        )
      : await dispatch(
          patchVendorListingVisibility({
            id: product._id,
            vendorListingEnabled: nextVendor,
          }),
        );

    if (
      (isService &&
        patchVendorServiceListingVisibility.fulfilled.match(resultAction)) ||
      (!isService && patchVendorListingVisibility.fulfilled.match(resultAction))
    ) {
      toast.success(
        nextVendor
          ? 'Listing visible on website'
          : 'Listing hidden from website',
      );
    } else {
      toast.error(resultAction.payload || 'Failed to update visibility');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <VendorTopBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          <div className="space-y-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* <div className="flex items-start gap-3">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1E40AF]">
                  <Package className="w-6 h-6 text-white" strokeWidth={1.75} />
                </div>
                <h1 className="text-base md:text-lg font-semibold text-gray-900">
                  Inventory Overview
                </h1>
                <p className="text-xs text-gray-500">
                  Manage your product stock and availability
                </p>
              </div> */}
              <div className="flex items-start gap-3">
                {/* <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1E40AF]">
                  <Package className="w-6 h-6 text-white" strokeWidth={1.75} />
                </div> */}
                {/* 
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <Image
              src={adminCustome}
              alt="admin"
              className="w-6 h-6 object-contain"
            />
          </div> */}
                {/* <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                    Inventory Overview
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your product stock and availability
                  </p>
                </div> */}
              </div>

              {/* <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (kycStatus !== 'approved') {
                      toast.error(
                        'KYC not approved yet. Complete KYC and wait for admin approval.',
                      );
                      return;
                    }
                    setEditingProduct(null);
                    setIsAddModalOpen(true);
                  }}
                  disabled={kycLoading || kycStatus !== 'approved'}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add New Product
                </button>
               
              </div> */}
            </div>

            {!kycLoading && kycStatus !== 'approved' ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                Product creation is locked until KYC is approved by admin.
                Please submit your KYC from{' '}
                <a
                  href="/vendor-kyc-verification"
                  className="font-semibold underline"
                >
                  Vendor KYC Verification
                </a>
                .
              </div>
            ) : null}

            {/* Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border p-4">
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold">{totalProducts}</p>
              </div>

              <div className="bg-white rounded-2xl border p-4">
                <p className="text-xs text-gray-500">Low Stock</p>
                <p className="text-2xl text-amber-500">{lowStock}</p>
              </div>

              <div className="bg-white rounded-2xl border p-4">
                <p className="text-xs text-gray-500">Out of Stock</p>
                <p className="text-2xl text-red-500">{outOfStock}</p>
              </div>
            </div> */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Products */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <div className="p-1.5 bg-[#EFF6FF] rounded-lg">
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                </div>

                <p className="text-3xl font-semibold mt-2 tabular-nums">
                  {totalProducts}
                </p>
              </div>

              {/* Low Stock */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <div className="p-1.5 bg-[#FFF7ED] rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                </div>

                <p className="text-2xl font-semibold mt-2 text-[#F97316] tabular-nums">
                  {lowStock}
                </p>

                <p className="text-sm mt-2 text-gray-600">items</p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-[#F97316] hover:underline"
                  onClick={() => setStockFilter('low')}
                >
                  View list →
                </button>
              </div>

              {/* Out of Stock */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    Out of Stock
                  </p>
                  <div className="p-1.5 bg-[#FEF2F2] rounded-lg">
                    <CircleX className="w-5 h-5 text-red-500" />
                  </div>
                </div>

                <p className="text-2xl font-semibold mt-2 text-[#E7000B] tabular-nums">
                  {outOfStock}
                </p>

                <p className="text-sm mt-2 text-gray-600">items</p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-[#E7000B] hover:underline"
                  onClick={() => setStockFilter('out')}
                >
                  View list →
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border overflow-hidden">
              {/* <div className="px-4 pt-4 flex mb-4 flex-col md:flex-row md:items-center gap-2 md:justify-between">
                
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by product, category, sub-category..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>

              
                {stockFilter !== 'all' && (
                  <button
                    onClick={() => setStockFilter('all')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Reset filter
                  </button>
                )}
              </div> */}
              <div className="px-4 pt-4 mb-4 flex flex-col gap-3">
                {/* Search + Filters + Reset — all in one row */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full md:max-w-xs mr-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by product, category, sub-category..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  {/* Type filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setCategoryFilter('all');
                      setSubCategoryFilter('all');
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                  >
                    {/* {uniqueTypes.map((t) => (
                      <option key={t} value={t}>
                        {t === 'all' ? 'All Types' : t}
                      </option>
                    ))} */}
                    {uniqueTypes.map((t) => (
                      <option key={t} value={t}>
                        {t === 'all'
                          ? 'All Types'
                          : t === 'Rental'
                            ? 'Rent'
                            : t === 'Sell'
                              ? 'Buy'
                              : t}
                      </option>
                    ))}
                  </select>

                  {/* Category filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setSubCategoryFilter('all');
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                  >
                    {uniqueCategories.map((c) => (
                      <option key={c} value={c}>
                        {c === 'all' ? 'All Categories' : c}
                      </option>
                    ))}
                  </select>

                  {/* SubCategory filter */}
                  <select
                    value={subCategoryFilter}
                    onChange={(e) => setSubCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                  >
                    {uniqueSubCategories.map((s) => (
                      <option key={s} value={s}>
                        {s === 'all' ? 'All Sub-Categories' : s}
                      </option>
                    ))}
                  </select>

                  {/* {(stockFilter !== 'all' ||
                    typeFilter !== 'all' ||
                    categoryFilter !== 'all' ||
                    subCategoryFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStockFilter('all');
                        setTypeFilter('all');
                        setCategoryFilter('all');
                        setSubCategoryFilter('all');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>
              </div> */}
                  {(stockFilter !== 'all' ||
                    typeFilter !== 'all' ||
                    categoryFilter !== 'all' ||
                    subCategoryFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStockFilter('all');
                        setTypeFilter('all');
                        setCategoryFilter('all');
                        setSubCategoryFilter('all');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (kycStatus !== 'approved') {
                        toast.error(
                          'KYC not approved yet. Complete KYC and wait for admin approval.',
                        );
                        return;
                      }
                      setEditingProduct(null);
                      setIsAddModalOpen(true);
                    }}
                    disabled={kycLoading || kycStatus !== 'approved'}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Product
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">SubCategory</th>
                      <th className="px-4 py-3 text-left">Stock</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Create type</th>
                      <th className="px-4 py-3 text-left">Active</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedProducts.map((p) => {
                      const status = deriveStatusFromStock(p.stock);
                      const statusClass =
                        status === 'Out of Stock'
                          ? 'bg-red-100 text-red-600'
                          : status === 'Low Stock'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-green-100 text-green-600';
                      const isActiveOnStorefront = isProductLiveOnStorefront(p);
                      const isApprovalPending = p.isAdminApproved === false;
                      const adminListingOn = p.adminListingEnabled !== false;
                      const storefrontToggleDisabled =
                        isApprovalPending ||
                        String(p.submissionStatus || '').trim() !==
                          'published' ||
                        !adminListingOn;
                      const createTypeLabel =
                        p.createdVia === 'template' ? 'automatic' : 'manual';

                      return (
                        <tr key={p._id} className="border-t">
                          {/* Product */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  p.images?.[0] ||
                                  p.image ||
                                  'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
                                }
                                alt={p.productName}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium">{p.productName}</p>
                                <p className="text-xs text-gray-500">
                                  {getInventoryPriceLabel(
                                    p,
                                    Object.prototype.hasOwnProperty.call(
                                      categoryRateMap,
                                      p?.category || '',
                                    )
                                      ? categoryRateMap[p.category]
                                      : FALLBACK_COMMISSION_RATE,
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          {/* <td className="px-4 py-3">{p.type}</td> */}
                          {/* Type */}
                          <td className="px-4 py-3">
                            {p.type === 'Rental'
                              ? 'Rent'
                              : p.type === 'Sell'
                                ? 'Buy'
                                : p.type}
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3">{p.category}</td>

                          {/* SubCategory */}
                          <td className="px-4 py-3">{p.subCategory}</td>

                          {/* Stock */}
                          {/* <td className="px-4 py-3">
                            <span
                              className={`${
                                p.stock === 0
                                  ? 'text-red-500'
                                  : p.stock <= 5
                                    ? 'text-[#F97316]'
                                    : 'text-black'
                              }`}
                            >
                              {p.stock} Units
                            </span>
                          </td> */}
                          {/* <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`${
                                p.stock === 0
                                  ? 'text-red-500'
                                  : p.stock <= 5
                                    ? 'text-[#F97316]'
                                    : 'text-black'
                              }`}
                            >
                              {p.stock} Units
                            </span>
                          </td> */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {String(p.type) === 'Service' ? (
                              <span>-</span>
                            ) : (
                              <span
                                className={`${
                                  p.stock === 0
                                    ? 'text-red-500'
                                    : p.stock <= 5
                                      ? 'text-[#F97316]'
                                      : 'text-black'
                                }`}
                              >
                                {p.stock} Units
                              </span>
                            )}
                          </td>

                          {/* Status */}

                          {/* Status */}
                          {/* <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
                            >
                              {status}
                            </span>
                          </td> */}
                          {/* <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
                            >
                              {status}
                            </span>
                          </td> */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {String(p.type) === 'Service' ? (
                              <span>-</span>
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
                              >
                                {status}
                              </span>
                            )}
                          </td>

                          {/* Create type */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
                              {createTypeLabel}
                            </span>
                          </td>

                          {/* Active toggle (controls storefront visibility) */}
                          {/* <td className="px-4 py-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isActiveOnStorefront}
                              aria-disabled={storefrontToggleDisabled}
                              onClick={() => handleToggleActive(p)}
                              className={`relative inline-flex h-6 w-11 rounded-full transition ${
                                isActiveOnStorefront
                                  ? 'bg-emerald-500'
                                  : 'bg-red-500'
                              }`}
                              disabled={storefrontToggleDisabled}
                              title={
                                isApprovalPending
                                  ? 'Pending admin approval'
                                  : String(p.submissionStatus || '').trim() !==
                                      'published'
                                    ? 'Publish listing before showing on website'
                                    : !adminListingOn
                                      ? 'Admin has disabled this listing on the storefront'
                                      : isActiveOnStorefront
                                        ? 'Visible on storefront'
                                        : 'Hidden from storefront'
                              }
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                  isActiveOnStorefront
                                    ? 'translate-x-5 mt-0.5'
                                    : 'translate-x-0.5 mt-0.5'
                                }`}
                              />
                            </button>
                            {isApprovalPending ? (
                              <p className="mt-1 text-[11px] text-amber-600">
                                Pending approval
                              </p>
                            ) : null}
                          </td> */}
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isActiveOnStorefront}
                              aria-disabled={storefrontToggleDisabled}
                              onClick={() => handleToggleActive(p)}
                              className={`relative inline-flex h-6 w-11 rounded-full border border-gray-300 transition ${
                                isActiveOnStorefront
                                  ? 'bg-[#E5E7EB]'
                                  : 'bg-[#FEF2F2]'
                              }`}
                              disabled={storefrontToggleDisabled}
                              title={
                                isApprovalPending
                                  ? 'Pending admin approval'
                                  : String(p.submissionStatus || '').trim() !==
                                      'published'
                                    ? 'Publish listing before showing on website'
                                    : !adminListingOn
                                      ? 'Admin has disabled this listing on the storefront'
                                      : isActiveOnStorefront
                                        ? 'Visible on storefront'
                                        : 'Hidden from storefront'
                              }
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full shadow transition mt-0.5 ${
                                  isActiveOnStorefront
                                    ? 'translate-x-5 bg-[#0F8A42]'
                                    : 'translate-x-0.5 bg-[#FF0000]'
                                }`}
                              />
                            </button>

                            {isApprovalPending ? (
                              <p className="mt-1 text-[11px] text-amber-600">
                                Pending approval
                              </p>
                            ) : null}
                          </td>

                          {/* Actions */}
                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="relative inline-block">
                              <button
                                ref={(el) => {
                                  menuBtnRefs.current[p._id] = el;
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openActionMenu(p._id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                title="More options"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <circle cx="12" cy="5" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="19" r="2" />
                                </svg>
                              </button>
                              {openMenuId === p._id &&
                                typeof document !== 'undefined' &&
                                createPortal(
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: 'fixed',
                                      top: menuPos.top,
                                      left: menuPos.left,
                                    }}
                                    className="z-[100] w-32 rounded-xl border border-gray-200 bg-white shadow-lg py-1"
                                  >
                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        handleEditClick(p);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Pencil size={14} />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setDeleteTarget(p);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                                    >
                                      <Trash2 size={14} />
                                      Delete
                                    </button>
                                  </div>,
                                  document.body,
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!loading &&
                      !serviceLoading &&
                      filteredProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No products found.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 flex items-center justify-between text-xs text-gray-500">
                <div>
                  Showing {paginatedProducts.length} of{' '}
                  {filteredProducts.length} products
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* current page only */}
                  <span className="px-3 py-1 rounded border bg-gray-50 text-gray-700 font-medium">
                    {currentPage}
                  </span>

                  {/* Next */}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 px-1">{error}</p>}
            {serviceError && (
              <p className="text-sm text-red-500 px-1">{serviceError}</p>
            )}
          </div>
        </main>
      </div>

      <VendorProductAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        mode={editingProduct ? 'edit' : 'create'}
        initialData={editingProduct}
        onOpenServiceProduct={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
          setEditingServiceProduct(null);
          setIsServiceModalOpen(true);
        }}
        onOpenManualProduct={() => {
          setIsAddModalOpen(false);
          setManualModalDesign('admin');
          setManualListingKind('rental');
          setIsManualModalOpen(true);
        }}
      />

      <VendorAutoServices
        isOpen={isServiceModalOpen}
        mode={editingServiceProduct ? 'edit' : 'create'}
        initialData={editingServiceProduct}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingServiceProduct(null);
        }}
        onSubmit={
          editingServiceProduct
            ? handleUpdateServiceProduct
            : handleCreateServiceProduct
        }
        setIsManualServiceModalOpen={setIsManualServiceModalOpen}
      />

      {/* <VendorManualServices
        isOpen={isManualServiceModalOpen}
        onClose={() => setIsManualServiceModalOpen(false)}
        onSubmit={async (fd) => {
          const ok = (await editingServiceProduct)
            ? handleUpdateServiceProduct(fd)
            : handleCreateServiceProduct(fd);
          if (ok) setIsManualServiceModalOpen(false);
          return ok;
        }}
      /> */}

      <VendorManualServices
        isOpen={isManualServiceModalOpen}
        onClose={() => setIsManualServiceModalOpen(false)}
        onSubmit={async (fd) => {
          const ok = editingServiceProduct
            ? await handleUpdateServiceProduct(fd)
            : await handleCreateServiceProduct(fd);
          if (ok) setIsManualServiceModalOpen(false);
          return ok;
        }}
        mode={editingServiceProduct ? 'edit' : 'create'}
        initialData={editingServiceProduct}
      />

      <VendorManualProductModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setManualModalDesign('vendor');
          setManualListingKind('rental');
        }}
        onSubmit={async (form) => {
          const ok = await handleCreateProduct(form);
          if (ok) {
            setIsManualModalOpen(false);
            setManualListingKind('rental');
          }
        }}
        designMode={manualModalDesign}
        listingKind={manualListingKind}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Product
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-700">
                  {deleteTarget.productName}
                </span>
                ?
              </p>
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
