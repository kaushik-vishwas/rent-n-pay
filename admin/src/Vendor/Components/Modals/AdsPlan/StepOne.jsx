// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { X, Search, Filter as FilterIcon, Upload, Plus } from 'lucide-react';
// import { getMyProducts } from '../../../../redux/slices/productSlice';

// function mapVendorProductToRow(p) {
//   const stockNum = Number(p.stock || 0);
//   const stockColor =
//     stockNum === 0
//       ? 'text-red-500'
//       : stockNum <= 5
//         ? 'text-orange-500'
//         : 'text-slate-700';

//   return {
//     id: p._id,
//     name: p.productName || 'Untitled Product',
//     price: p.price || '',
//     type: p.type === 'Sell' ? 'Sell' : 'Rental',
//     category: p.category || '-',
//     subCategory: p.subCategory || '-',
//     condition: p.condition || (p.type === 'Sell' ? 'Brand New' : 'For Rent'),
//     stockNum,
//     stock: `${stockNum} Units`,
//     stockColor,
//     averageRating: Number(p.averageRating || 0),
//     numReviews: Number(p.numReviews || 0),
//     discountPercent: Number(p.activeOfferDiscountPercent || 0),
//     deliveryEta: p.deliveryEta || (stockNum > 0 ? 'Ships soon' : ''),
//     image:
//       p.images?.[0] ||
//       p.image ||
//       'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG',
//   };
// }

// /**
//  * StepOne — "Choose 2 Products" modal.
//  *
//  * Props:
//  *  - open: boolean, whether the modal is visible
//  *  - onClose: () => void, called on Cancel / X
//  *  - onNext: (selectedProducts: Array) => void, called with the 2 chosen products
//  *            when "Next: Set Duration →" is clicked
//  */
// export default function StepOne({ open, onClose, onNext }) {
//   const dispatch = useDispatch();
//   const { products, loading } = useSelector((state) => state.product);

//   const [query, setQuery] = useState('');
//   const [selected, setSelected] = useState([]);

//   useEffect(() => {
//     if (open) {
//       dispatch(getMyProducts());
//     }
//   }, [open, dispatch]);

//   const rows = useMemo(
//     () => (products || []).map(mapVendorProductToRow),
//     [products],
//   );

//   const filtered = useMemo(
//     () =>
//       rows.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
//     [rows, query],
//   );

//   if (!open) return null;

//   const toggleProduct = (product) => {
//     setSelected((prev) => {
//       const exists = prev.some((p) => p.id === product.id);
//       if (exists) return prev.filter((p) => p.id !== product.id);
//       if (prev.length >= 2) return prev;
//       return [...prev, product];
//     });
//   };

//   const handleNext = () => {
//     if (selected.length !== 2) return;
//     onNext(selected);
//     setSelected([]);
//     setQuery('');
//   };

//   const handleClose = () => {
//     setSelected([]);
//     setQuery('');
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
//       <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
//         {/* Header */}
//         <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
//           <div>
//             <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
//               Category Hero Boost
//             </h2>
//             <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
//               Get your products featured at #1 position
//             </p>
//           </div>

//           <div className="flex items-center gap-4">
//             <StepDots step={1} />
//             <button
//               onClick={handleClose}
//               className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
//               aria-label="Close"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
//           <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
//             Step 1: Choose 2 Products for Category Hero Boost
//           </h3>
//           <p className="mt-1 text-xs text-gray-500 sm:text-sm">
//             Select exactly 2 products to feature at the #1 position in their
//             category
//           </p>

//           {/* Toolbar */}
//           <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
//             <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
//               <div className="relative flex-1 sm:max-w-xs">
//                 <Search
//                   size={15}
//                   className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 />
//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search by Product Name or SKU..."
//                   className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-gray-400 focus:border-blue-400"
//                 />
//               </div>
//               <button className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-gray-50">
//                 <FilterIcon size={14} /> Filter
//               </button>
//               <button className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-gray-50">
//                 <Upload size={14} /> Bulk Update
//               </button>
//             </div>

//             <button className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
//               <Plus size={15} /> Add New Product
//             </button>
//           </div>

//           {/* Table */}
//           <div className="mt-5 overflow-x-auto rounded-xl border border-gray-100">
//             <table className="w-full min-w-[640px] text-left text-sm">
//               <thead>
//                 <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] uppercase tracking-wide text-gray-400">
//                   <th className="px-4 py-3 font-semibold">Product</th>
//                   <th className="px-4 py-3 font-semibold">Type</th>
//                   <th className="px-4 py-3 font-semibold">Category</th>
//                   <th className="px-4 py-3 font-semibold">Sub-Category</th>
//                   <th className="px-4 py-3 font-semibold">Stock Level</th>
//                   <th className="px-4 py-3 text-right font-semibold">Select</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading && (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-4 py-8 text-center text-gray-400"
//                     >
//                       Loading products...
//                     </td>
//                   </tr>
//                 )}
//                 {!loading && filtered.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-4 py-8 text-center text-gray-400"
//                     >
//                       No products found.
//                     </td>
//                   </tr>
//                 )}
//                 {!loading &&
//                   filtered.map((p) => {
//                     const isSelected = selected.some((s) => s.id === p.id);
//                     const isOutOfStock = p.stockNum === 0;
//                     const disabled =
//                       isOutOfStock || (!isSelected && selected.length >= 2);
//                     return (
//                       <tr
//                         key={p.id}
//                         className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${
//                           isOutOfStock ? 'opacity-60' : ''
//                         }`}
//                       >
//                         <td className="flex items-center gap-3 px-4 py-3">
//                           <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
//                             <img
//                               src={p.image}
//                               alt=""
//                               className="h-full w-full object-cover"
//                               onError={(e) =>
//                                 (e.currentTarget.style.opacity = 0)
//                               }
//                             />
//                           </div>
//                           <div>
//                             <p className="font-medium text-slate-800">
//                               {p.name}
//                             </p>
//                             <p className="text-xs text-gray-400">{p.price}</p>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-slate-600">{p.type}</td>
//                         <td className="px-4 py-3 text-slate-600">
//                           {p.category}
//                         </td>
//                         <td className="px-4 py-3 text-slate-600">
//                           {p.subCategory}
//                         </td>
//                         <td className={`px-4 py-3 font-medium ${p.stockColor}`}>
//                           {p.stock}
//                         </td>
//                         <td className="px-4 py-3 text-right">
//                           <button
//                             disabled={disabled}
//                             onClick={() => toggleProduct(p)}
//                             title={
//                               isOutOfStock
//                                 ? 'Out of stock — cannot boost this product'
//                                 : undefined
//                             }
//                             className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
//                               isSelected
//                                 ? 'border-green-300 bg-green-50 text-green-600'
//                                 : isOutOfStock
//                                   ? 'cursor-not-allowed border-red-100 bg-red-50 text-red-400'
//                                   : disabled
//                                     ? 'cursor-not-allowed border-gray-100 text-gray-300'
//                                     : 'border-gray-200 text-slate-600 hover:bg-gray-50'
//                             }`}
//                           >
//                             {isSelected
//                               ? 'Selected'
//                               : isOutOfStock
//                                 ? 'Out of Stock'
//                                 : 'Select'}
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer */}
//           <div className="mt-5 flex items-center justify-between">
//             <p className="text-xs text-gray-400">
//               {selected.length}/2 products selected
//             </p>
//             <div className="flex gap-2">
//               <button
//                 onClick={handleClose}
//                 className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 disabled={selected.length !== 2}
//                 onClick={handleNext}
//                 className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
//                   selected.length === 2
//                     ? 'bg-blue-500 hover:bg-blue-600'
//                     : 'cursor-not-allowed bg-gray-300'
//                 }`}
//               >
//                 Next: Set Duration →
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function StepDots({ step }) {
//   return (
//     <div className="hidden items-center gap-1.5 sm:flex">
//       {[1, 2, 3].map((n) => (
//         <React.Fragment key={n}>
//           <div
//             className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
//               n < step
//                 ? 'bg-blue-500 text-white'
//                 : n === step
//                   ? 'bg-blue-600 text-white ring-4 ring-blue-100'
//                   : 'bg-gray-100 text-gray-400'
//             }`}
//           >
//             {n}
//           </div>
//           {n < 3 && (
//             <div
//               className={`h-0.5 w-6 rounded ${
//                 n < step ? 'bg-blue-400' : 'bg-gray-200'
//               }`}
//             />
//           )}
//         </React.Fragment>
//       ))}
//     </div>
//   );
// }

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  X,
  Search,
  Filter as FilterIcon,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { getMyProducts } from '../../../../redux/slices/productSlice';

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
  const basePrice = parsePrice(product?.price);
  if (basePrice > 0) return { amount: basePrice, suffix: '' };
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
  if (firstWithPrice) {
    return { amount: parsePrice(firstWithPrice.sellPrice), suffix: '' };
  }
  return { amount: 0, suffix: '' };
};

const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const typeLabel = (type) => (type === 'Sell' ? 'Buy' : 'Rent');

function mapVendorProductToRow(p) {
  const stockNum = Number(p.stock || 0);
  const stockColor =
    stockNum === 0
      ? 'text-red-500'
      : stockNum <= 5
        ? 'text-orange-500'
        : 'text-slate-700';

  const { amount: basePrice, suffix: baseSuffix } = getBasePriceInfo(p);

  return {
    id: p._id,
    name: p.productName || 'Untitled Product',
    price: basePrice > 0 ? `${rupee(basePrice)}${baseSuffix}` : '',
    type: p.type === 'Sell' ? 'Sell' : 'Rental',
    category: p.category || '-',
    subCategory: p.subCategory || '-',
    condition: p.condition || (p.type === 'Sell' ? 'Brand New' : 'For Rent'),
    stockNum,
    stock: `${stockNum} Units`,
    stockColor,
    averageRating: Number(p.averageRating || 0),
    numReviews: Number(p.numReviews || 0),
    discountPercent: Number(p.activeOfferDiscountPercent || 0),
    deliveryEta: p.deliveryEta || (stockNum > 0 ? 'Ships soon' : ''),
    image:
      p.images?.[0] ||
      p.image ||
      'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG',
  };
}

/**
 * StepOne — "Choose 2 Products" modal.
 *
 * Props:
 *  - open: boolean, whether the modal is visible
 *  - onClose: () => void, called on Cancel / X
 *  - onNext: (selectedProducts: Array) => void, called with the 2 chosen products
 *            when "Next: Set Duration →" is clicked
 */
// export default function StepOne({ open, onClose, onNext }) {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { products, loading } = useSelector((state) => state.product);

//   const [query, setQuery] = useState('');
//   const [typeFilter, setTypeFilter] = useState('All');
//   const [selected, setSelected] = useState([]);

//   useEffect(() => {
//     if (open) {
//       dispatch(getMyProducts());
//     }
//   }, [open, dispatch]);
export default function StepOne({ open, onClose, onNext, initialSelected }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { products, loading } = useSelector((state) => state.product);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState(initialSelected || []);

  useEffect(() => {
    if (open) {
      dispatch(getMyProducts());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (open && initialSelected) {
      setSelected(initialSelected);
    }
  }, [open, initialSelected]);

  const rows = useMemo(
    () => (products || []).map(mapVendorProductToRow),
    [products],
  );

  const filtered = useMemo(
    () =>
      rows
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        .filter((p) => typeFilter === 'All' || p.type === typeFilter),
    [rows, query, typeFilter],
  );

  if (!open) return null;

  const toggleProduct = (product) => {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 2) return prev;
      return [...prev, product];
    });
  };

  // const handleNext = () => {
  //   if (selected.length !== 2) return;
  //   onNext(selected);
  //   setSelected([]);
  //   setQuery('');
  // };
  const handleNext = () => {
    if (selected.length !== 2) return;
    onNext(selected);
  };

  const handleClose = () => {
    setSelected([]);
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Category Hero Boost
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Get your products featured at #1 position
            </p>
          </div>

          <div className="flex items-center gap-4">
            <StepDots step={1} />
            <button
              onClick={handleClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-gray-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">
            Step 1: Choose 2 Products for Category Hero Boost
          </h3>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Select exactly 2 products to feature at the #1 position in their
            category
          </p>

          {/* Toolbar */}
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1 sm:max-w-xs">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Product Name or SKU..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-gray-400 focus:border-blue-400"
                />
              </div>
              <div className="relative">
                <FilterIcon
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 py-2 pl-8 pr-8 text-sm font-normal text-slate-600 outline-none transition hover:bg-gray-50 focus:border-blue-400"
                >
                  <option value="All">All Types</option>

                  <option value="Rental">Rent</option>
                  <option value="Sell">Buy</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <button
              onClick={() => router.push('/vendor-products')}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Plus size={15} /> Add New Product
            </button>
          </div>

          {/* Table */}
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Sub-Category</th>
                  <th className="px-4 py-3 font-semibold">Stock Level</th>
                  <th className="px-4 py-3 text-right font-semibold">Select</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Loading products...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((p) => {
                    const isSelected = selected.some((s) => s.id === p.id);
                    const isOutOfStock = p.stockNum === 0;
                    const disabled =
                      isOutOfStock || (!isSelected && selected.length >= 2);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${
                          isOutOfStock ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="flex items-center gap-3 px-4 py-3">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={p.image}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) =>
                                (e.currentTarget.style.opacity = 0)
                              }
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400">{p.price}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {typeLabel(p.type)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.category}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.subCategory}
                        </td>
                        <td className={`px-4 py-3 font-medium ${p.stockColor}`}>
                          {p.stock}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            disabled={disabled}
                            onClick={() => toggleProduct(p)}
                            title={
                              isOutOfStock
                                ? 'Out of stock — cannot boost this product'
                                : undefined
                            }
                            className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                              isSelected
                                ? 'border-green-300 bg-green-50 text-green-600'
                                : isOutOfStock
                                  ? 'cursor-not-allowed border-red-100 bg-red-50 text-red-400'
                                  : disabled
                                    ? 'cursor-not-allowed border-gray-100 text-gray-300'
                                    : 'border-gray-200 text-slate-600 hover:bg-gray-50'
                            }`}
                          >
                            {isSelected
                              ? 'Selected'
                              : isOutOfStock
                                ? 'Out of Stock'
                                : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {selected.length}/2 products selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={selected.length !== 2}
                onClick={handleNext}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  selected.length === 2
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'cursor-not-allowed bg-gray-300'
                }`}
              >
                Next: Set Duration →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepDots({ step }) {
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {[1, 2, 3].map((n) => (
        <React.Fragment key={n}>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
              n < step
                ? 'bg-blue-500 text-white'
                : n === step
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {n}
          </div>
          {n < 3 && (
            <div
              className={`h-0.5 w-6 rounded ${
                n < step ? 'bg-blue-400' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
