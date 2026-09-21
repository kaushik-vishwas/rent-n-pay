// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { apiGetAllOrders, apiGetLiveCarts } from '@/service/api';
// import totalOrdersIcon from '@/assets/icons/total-cart.png';
// import activeCartsIcon from '@/assets/icons/cart.png';
// import avgCartIcon from '@/assets/icons/avg-cart.png';
// import { Search, Package, Shield, Truck, Phone } from 'lucide-react';

// const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// const iconSrc = (icon) => (typeof icon === 'string' ? icon : icon?.src || '');

// const productTypeLabel = (type) => {
//   const t = String(type || '').toLowerCase();
//   if (t.includes('rent')) return 'Rent';
//   if (t.includes('sell')) return 'Buy';
//   return type || 'Rent';
// };

// const badgeClassByType = (type) => {
//   const t = String(type || '').toLowerCase();
//   if (
//     t.includes('rent') ||
//     t.includes('rental') ||
//     t.includes('sell') ||
//     t.includes('service')
//   ) {
//     return 'bg-blue-50 text-blue-600 border-blue-100';
//   }
//   if (t.includes('used')) {
//     return 'bg-gray-100 text-gray-600 border-gray-200';
//   }
//   return 'bg-amber-50 text-amber-700 border-amber-100';
// };

// export default function Cart() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [query, setQuery] = useState('');
//   const [selectedCart, setSelectedCart] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const ITEMS_PER_PAGE = 10;

//   useEffect(() => {
//     const fetchOrders = async () => {
//       const token =
//         typeof window !== 'undefined'
//           ? localStorage.getItem('adminToken')
//           : null;
//       if (!token) {
//         setError('Please login again to continue.');
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError('');
//       try {
//         const res = await apiGetLiveCarts(token);
//         setOrders(Array.isArray(res.data?.rows) ? res.data.rows : []);
//       } catch (err) {
//         setOrders([]);
//         setError(err?.response?.data?.message || 'Failed to load cart data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);
//   const cartRows = useMemo(() => {
//     return (orders || []).map((row, idx) => {
//       const quantity = Number(row?.quantity || 1);
//       const pricePerDay = Number(row?.pricePerDay || 0);
//       const isDaily = String(row?.tenureUnit || 'month') === 'day';
//       const units = isDaily ? 1 : quantity;
//       const amount = Math.max(0, pricePerDay * units);

//       // For Sell items, use the product's real MRP (mrpPrice) as the
//       // original price, when it's genuinely higher than the current
//       // cart price. Rentals have no MRP concept in this schema, so they
//       // keep showing the current price as-is (unchanged behavior).
//       const mrpPerUnit = Number(row?.mrpPricePerUnit || 0);
//       const originalPerUnit =
//         mrpPerUnit > pricePerDay ? mrpPerUnit : pricePerDay;
//       const originalAmount = Math.max(0, originalPerUnit * units);

//       return {
//         id: `${row?.userId || 'u'}_${row?.productId || idx}`,
//         srNo: idx + 1,
//         customerName: String(row?.customerName || 'Customer'),
//         customerPhone: String(row?.customerPhone || '').trim(),
//         customerEmail: String(row?.customerEmail || '').trim(),
//         cartDate: row?.cartUpdatedAt
//           ? new Date(row.cartUpdatedAt).toLocaleDateString('en-GB')
//           : '-',
//         productType: String(row?.productType || 'For Rent'),
//         productName: String(row?.title || 'Product'),
//         productImage: row?.image || '',
//         originalPrice: originalAmount,
//         deposit: Number(row?.refundableDeposit || 0),
//         shipping: 0,
//         amount,
//       };
//     });
//   }, [orders]);

//   const filteredRows = useMemo(() => {
//     const term = query.trim().toLowerCase();
//     if (!term) return cartRows;
//     return cartRows.filter((r) => {
//       return (
//         r.customerName.toLowerCase().includes(term) ||
//         r.productName.toLowerCase().includes(term) ||
//         r.productType.toLowerCase().includes(term)
//       );
//     });
//   }, [cartRows, query]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [query]);

//   const pagination = useMemo(() => {
//     const totalItems = filteredRows.length;
//     const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
//     const page = Math.min(currentPage, totalPages);
//     const start = (page - 1) * ITEMS_PER_PAGE;
//     const end = start + ITEMS_PER_PAGE;

//     return {
//       page,
//       totalItems,
//       totalPages,
//       rows: filteredRows.slice(start, end),
//       start: totalItems ? start + 1 : 0,
//       end: Math.min(end, totalItems),
//     };
//   }, [filteredRows, currentPage]);

//   useEffect(() => {
//     if (currentPage > pagination.totalPages) {
//       setCurrentPage(pagination.totalPages);
//     }
//   }, [currentPage, pagination.totalPages]);

//   const stats = useMemo(() => {
//     const activeCarts = filteredRows.length;
//     const totalCartValue = filteredRows.reduce(
//       (sum, r) => sum + Number(r.amount || 0),
//       0,
//     );
//     const avgCartValue = activeCarts
//       ? Math.round(totalCartValue / activeCarts)
//       : 0;
//     return { activeCarts, totalCartValue, avgCartValue };
//   }, [filteredRows]);

//   const detail = useMemo(() => {
//     if (!selectedCart) return null;
//     const productAmount = Number(selectedCart.amount || 0);
//     const deposit = Number(selectedCart.deposit || 0);
//     const shipping = Number(selectedCart.shipping || 0);
//     return {
//       ...selectedCart,
//       productAmount,
//       deposit,
//       shipping,
//       totalQuote: productAmount + deposit + shipping,
//       initials:
//         String(selectedCart.customerName || 'U')
//           .trim()
//           .split(/\s+/)
//           .slice(0, 2)
//           .map((x) => x[0]?.toUpperCase() || '')
//           .join('') || 'U',
//     };
//   }, [selectedCart]);

//   return (
//     <main className="space-y-4 sm:space-y-5">
//       {/* <div>
//         <h1 className="text-3xl font-semibold text-black">Shopping Cart</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           View and manage customer shopping carts across the platform
//         </p>
//       </div> */}

//       {loading ? (
//         <div className="flex justify-center py-14">
//           <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
//           {error}
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
//             {/* <div className="bg-white rounded-2xl border border-blue-100 p-4">
//               <p className="text-xs text-gray-500">Active Carts</p>
//               <p className="text-4xl font-semibold text-blue-600 mt-1">
//                 {stats.activeCarts}
//               </p>
//             </div> */}
//             <div className="bg-white rounded-2xl border border-blue-100 p-4">
//               <div className="flex items-center gap-2">
//                 <img
//                   src={iconSrc(activeCartsIcon)}
//                   alt="cart"
//                   className="w-9 h-9 object-contain"
//                 />
//                 <p className="text-xs text-gray-500">Active Carts</p>
//               </div>

//               <p className="text-4xl font-semibold text-blue-600 mt-2">
//                 {stats.activeCarts}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-emerald-100 p-4">
//               <div className="flex items-center gap-2">
//                 <img
//                   src={iconSrc(totalOrdersIcon)}
//                   alt="total cart"
//                   className="w-9 h-9 object-contain"
//                 />
//                 <p className="text-xs text-gray-500">Total Cart Value</p>
//               </div>
//               <p className="text-4xl font-semibold text-emerald-600 mt-1">
//                 {money(stats.totalCartValue)}
//               </p>
//             </div>
//             <div className="bg-white rounded-2xl border border-violet-100 p-4">
//               <div className="flex items-center gap-2">
//                 <img
//                   src={iconSrc(avgCartIcon)}
//                   alt="average cart"
//                   className="w-9 h-9 object-contain"
//                 />
//                 <p className="text-xs text-gray-500">Avg. Cart Value</p>
//               </div>
//               <p className="text-4xl font-semibold text-violet-600 mt-1">
//                 {money(stats.avgCartValue)}
//               </p>
//             </div>
//           </div>

//           {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search by customer name or product..."
//               className="w-full sm:max-w-md px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//             />
//           </div> */}
//           <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
//             <div className="relative w-full sm:max-w-md">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search by customer name or product..."
//                 className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-[980px] w-full text-sm">
//                 <thead className="bg-gray-50 border-b border-gray-100">
//                   <tr className="text-gray-500">
//                     <th className="px-4 py-3 text-center font-medium">
//                       SR. NO.
//                     </th>
//                     <th className="px-4 py-3 text-center font-medium">
//                       CUSTOMER INFO
//                     </th>
//                     <th className="px-4 py-3 text-center font-medium">
//                       CART DATE
//                     </th>
//                     <th className="px-4 py-3 text-center font-medium">
//                       PRODUCT TYPE
//                     </th>
//                     <th className="px-4 py-3 text-center font-medium">
//                       PRODUCT NAME
//                     </th>
//                     <th className="px-4 py-3 text-center font-medium">
//                       CART AMOUNT
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {pagination.rows.map((row) => (
//                     <tr
//                       key={row.id}
//                       className="border-t border-gray-100 cursor-pointer hover:bg-gray-50/80"
//                       onClick={() => setSelectedCart(row)}
//                     >
//                       <td className="px-4 py-3 text-center text-gray-700">
//                         {row.srNo}
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <p className="font-semibold text-black">
//                           {row.customerName}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-0.5">
//                           {row.customerPhone || '—'}
//                         </p>
//                       </td>
//                       <td className="px-4 py-3 text-center text-gray-600">
//                         {row.cartDate}
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <span
//                           className={`inline-flex px-2.5 py-1 text-xs rounded-full border ${badgeClassByType(
//                             row.productType,
//                           )}`}
//                         >
//                           {productTypeLabel(row.productType)}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           {row.productImage ? (
//                             <img
//                               src={row.productImage}
//                               alt=""
//                               className="w-8 h-8 rounded-md object-cover border border-gray-100"
//                             />
//                           ) : (
//                             <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200" />
//                           )}
//                           <span className="text-gray-800">
//                             {row.productName}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-center font-semibold text-black">
//                         {money(row.amount)}
//                       </td>
//                     </tr>
//                   ))}
//                   {pagination.totalItems === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={6}
//                         className="px-4 py-8 text-center text-gray-500"
//                       >
//                         No cart records found.
//                       </td>
//                     </tr>
//                   ) : null}
//                   {pagination.totalItems > 0 ? (
//                     <tr className="bg-orange-500 text-white text-sm font-semibold">
//                       <td colSpan={5} className="px-4 py-3 text-left">
//                         GRAND TOTAL
//                       </td>
//                       <td className="px-4 py-3 text-center">
//                         {money(stats.totalCartValue)}
//                       </td>
//                     </tr>
//                   ) : null}
//                 </tbody>
//               </table>
//             </div>
//             {pagination.totalItems > 0 ? (
//               <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                 <p className="text-xs text-gray-500">
//                   Showing {pagination.start}-{pagination.end} of{' '}
//                   {pagination.totalItems} products
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                     disabled={pagination.page === 1}
//                     className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                   >
//                     Prev
//                   </button>
//                   <span className="min-w-8 text-center px-2.5 py-1.5 text-xs border border-orange-500 bg-orange-500 text-white rounded-lg">
//                     {pagination.page}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setCurrentPage((p) =>
//                         Math.min(pagination.totalPages, p + 1),
//                       )
//                     }
//                     disabled={pagination.page === pagination.totalPages}
//                     className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             ) : null}
//           </div>
//         </>
//       )}

//       {detail ? (
//         <div className="fixed inset-0 z-50">
//           <button
//             type="button"
//             className="absolute inset-0 bg-black/45"
//             onClick={() => setSelectedCart(null)}
//             aria-label="Close cart detail"
//           />
//           <aside className="absolute right-0 top-0 h-full w-full sm:w-[540px] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
//             <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between">
//               <div>
//                 <h3 className="text-2xl font-semibold text-black">
//                   Cart Detail
//                 </h3>
//                 <p className="text-sm font-semibold text-gray-500">
//                   Review and manage abandoned cart recovery
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setSelectedCart(null)}
//                 className="text-gray-500 hover:text-gray-700 text-xl leading-none"
//                 aria-label="Close"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-5 space-y-4">
//               <section className="rounded-2xl border border-[#BEDBFF] bg-blue-50/80 p-4">
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                   Customer Overview
//                 </p>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
//                     {detail.initials}
//                   </div>
//                   <div>
//                     <p className="text-lg font-semibold text-black">
//                       {detail.customerName}
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       {detail.customerPhone || '—'}
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       {detail.customerEmail || 'no-email@rentnpay.com'}
//                     </p>
//                   </div>
//                 </div>
//                 <a
//                   href={
//                     detail.customerPhone ? `tel:${detail.customerPhone}` : '#'
//                   }
//                   onClick={(e) => {
//                     if (!detail.customerPhone) e.preventDefault();
//                   }}
//                   className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 text-sm font-medium"
//                 >
//                   <Phone className="w-4 h-4" />
//                   Call Customer
//                 </a>
//               </section>

//               <section className="rounded-2xl border border-gray-200 bg-white p-4">
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                   Item Deep Dive
//                 </p>
//                 <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
//                   {detail.productImage ? (
//                     <img
//                       src={detail.productImage}
//                       alt={detail.productName}
//                       className="w-full h-48 object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-48 bg-gray-100" />
//                   )}
//                 </div>
//                 <p className="mt-3 text-2xl font-semibold text-black">
//                   {detail.productName}
//                 </p>
//                 {/* <span
//                   className={`mt-2 inline-flex px-2.5 py-1 text-xs rounded-full border ${badgeClassByType(
//                     detail.productType,
//                   )}`}
//                 >
//                   {detail.productType || 'For Rent'}
//                 </span> */}

//                 <div className="mt-4 grid grid-cols-2 gap-2">
//                   <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
//                     <p className="text-[11px] text-gray-500 uppercase">
//                       Original Price
//                     </p>
//                     <p className="text-xl font-semibold text-black mt-1">
//                       {money(detail.originalPrice || detail.productAmount)}
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
//                     <p className="text-[11px] text-gray-500 uppercase">
//                       Current Cart Price
//                     </p>
//                     <p className="text-xl font-semibold text-emerald-700 mt-1">
//                       {money(detail.productAmount)}
//                     </p>
//                   </div>
//                 </div>
//               </section>

//               <section className="rounded-2xl border border-gray-200 bg-white p-4">
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                   Financial Breakdown
//                 </p>
//                 <div className="rounded-xl border border-gray-200 overflow-hidden divide-y">
//                   <div className="px-3 py-2.5 flex items-center justify-between text-sm">
//                     <span className="text-gray-600 flex items-center gap-1.5">
//                       <Package className="w-4 h-4 text-gray-500" />
//                       {String(detail.productType || '').toLowerCase() ===
//                       'service'
//                         ? 'Service Amount'
//                         : 'Product Amount'}
//                     </span>
//                     <span className="font-semibold text-gray-900">
//                       {money(detail.productAmount)}
//                     </span>
//                   </div>

//                   {!['sell', 'service'].includes(
//                     String(detail.productType || '').toLowerCase(),
//                   ) && (
//                     <div className="px-3 py-2.5 flex items-center justify-between text-sm bg-orange-50">
//                       <span className="text-orange-700 flex items-center gap-1.5">
//                         <Shield className="w-4 h-4 text-orange-600" />
//                         Security Deposit (Refundable)
//                       </span>
//                       <span className="font-semibold text-orange-700">
//                         {money(detail.deposit)}
//                       </span>
//                     </div>
//                   )}
//                   <div className="px-3 py-2.5 flex items-center justify-between text-sm">
//                     <span className="text-gray-600 flex items-center gap-1.5">
//                       <Truck className="w-4 h-4 text-gray-500" />
//                       Estimated Shipping
//                     </span>
//                     <span className="font-semibold text-gray-900">
//                       {detail.shipping > 0 ? money(detail.shipping) : 'FREE'}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 flex items-center justify-between">
//                   <span className="font-semibold text-black">
//                     Total Full Quote
//                   </span>
//                   <span className="text-2xl font-bold text-emerald-700">
//                     {money(detail.totalQuote)}
//                   </span>
//                 </div>
//               </section>
//             </div>
//           </aside>
//         </div>
//       ) : null}
//     </main>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGetAllOrders, apiGetLiveCarts } from '@/service/api';
import totalOrdersIcon from '@/assets/icons/total-cart.png';
import activeCartsIcon from '@/assets/icons/cart.png';
import avgCartIcon from '@/assets/icons/avg-cart.png';
import { Search, Package, Shield, Truck, Phone } from 'lucide-react';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const iconSrc = (icon) => (typeof icon === 'string' ? icon : icon?.src || '');

const productTypeLabel = (type) => {
  const t = String(type || '').toLowerCase();
  if (t.includes('rent')) return 'Rent';
  if (t.includes('sell')) return 'Buy';
  return type || 'Rent';
};

const badgeClassByType = (type) => {
  const t = String(type || '').toLowerCase();
  if (
    t.includes('rent') ||
    t.includes('rental') ||
    t.includes('sell') ||
    t.includes('service')
  ) {
    return 'bg-blue-50 text-blue-600 border-blue-100';
  }
  if (t.includes('used')) {
    return 'bg-gray-100 text-gray-600 border-gray-200';
  }
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

export default function Cart() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCart, setSelectedCart] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('adminToken')
          : null;
      if (!token) {
        setError('Please login again to continue.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await apiGetLiveCarts(token);
        setOrders(Array.isArray(res.data?.rows) ? res.data.rows : []);
      } catch (err) {
        setOrders([]);
        setError(err?.response?.data?.message || 'Failed to load cart data.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  const cartRows = useMemo(() => {
    return (orders || []).map((row, idx) => {
      const quantity = Number(row?.quantity || 1);
      const pricePerDay = Number(row?.pricePerDay || 0);
      const isDaily = String(row?.tenureUnit || 'month') === 'day';
      const units = isDaily ? 1 : quantity;
      const amount = Math.max(0, pricePerDay * units);

      // For Sell items, use the product's real MRP (mrpPrice) as the
      // original price, when it's genuinely higher than the current
      // cart price. Rentals have no MRP concept in this schema, so they
      // keep showing the current price as-is (unchanged behavior).
      const mrpPerUnit = Number(row?.mrpPricePerUnit || 0);
      const originalPerUnit =
        mrpPerUnit > pricePerDay ? mrpPerUnit : pricePerDay;
      const originalAmount = Math.max(0, originalPerUnit * units);

      return {
        id: `${row?.userId || 'u'}_${row?.productId || idx}`,
        srNo: idx + 1,
        customerName: String(row?.customerName || 'Customer'),
        customerPhone: String(row?.customerPhone || '').trim(),
        customerEmail: String(row?.customerEmail || '').trim(),
        cartDate: row?.cartUpdatedAt
          ? new Date(row.cartUpdatedAt).toLocaleDateString('en-GB')
          : '-',
        productType: String(row?.productType || 'For Rent'),
        productName: String(row?.title || 'Product'),
        productImage: row?.image || '',
        originalPrice: originalAmount,
        deposit: Number(row?.refundableDeposit || 0),
        shipping: 0,
        amount,
      };
    });
  }, [orders]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return cartRows;
    return cartRows.filter((r) => {
      return (
        r.customerName.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term) ||
        r.productType.toLowerCase().includes(term)
      );
    });
  }, [cartRows, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const pagination = useMemo(() => {
    const totalItems = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const page = Math.min(currentPage, totalPages);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return {
      page,
      totalItems,
      totalPages,
      rows: filteredRows.slice(start, end),
      start: totalItems ? start + 1 : 0,
      end: Math.min(end, totalItems),
    };
  }, [filteredRows, currentPage]);

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const stats = useMemo(() => {
    const activeCarts = filteredRows.length;
    const totalCartValue = filteredRows.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0,
    );
    const avgCartValue = activeCarts
      ? Math.round(totalCartValue / activeCarts)
      : 0;
    return { activeCarts, totalCartValue, avgCartValue };
  }, [filteredRows]);

  const detail = useMemo(() => {
    if (!selectedCart) return null;
    const productAmount = Number(selectedCart.amount || 0);
    const deposit = Number(selectedCart.deposit || 0);
    const shipping = Number(selectedCart.shipping || 0);
    return {
      ...selectedCart,
      productAmount,
      deposit,
      shipping,
      totalQuote: productAmount + deposit + shipping,
      initials:
        String(selectedCart.customerName || 'U')
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((x) => x[0]?.toUpperCase() || '')
          .join('') || 'U',
    };
  }, [selectedCart]);

  return (
    <main className="space-y-4 sm:space-y-5">
      {/* <div>
        <h1 className="text-3xl font-semibold text-black">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage customer shopping carts across the platform
        </p>
      </div> */}

      {loading ? (
        <div className="flex justify-center py-14">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* <div className="bg-white rounded-2xl border border-blue-100 p-4">
              <p className="text-xs text-gray-500">Active Carts</p>
              <p className="text-4xl font-semibold text-blue-600 mt-1">
                {stats.activeCarts}
              </p>
            </div> */}
            <div className="bg-white rounded-2xl border border-blue-100 p-4">
              <div className="flex items-center gap-2">
                <img
                  src={iconSrc(activeCartsIcon)}
                  alt="cart"
                  className="w-9 h-9 object-contain"
                />
                <p className="text-xs text-gray-500">Active Carts</p>
              </div>

              <p className="text-4xl font-semibold text-blue-600 mt-2">
                {stats.activeCarts}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-4">
              <div className="flex items-center gap-2">
                <img
                  src={iconSrc(totalOrdersIcon)}
                  alt="total cart"
                  className="w-9 h-9 object-contain"
                />
                <p className="text-xs text-gray-500">Total Cart Value</p>
              </div>
              <p className="text-4xl font-semibold text-emerald-600 mt-1">
                {money(stats.totalCartValue)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-violet-100 p-4">
              <div className="flex items-center gap-2">
                <img
                  src={iconSrc(avgCartIcon)}
                  alt="average cart"
                  className="w-9 h-9 object-contain"
                />
                <p className="text-xs text-gray-500">Avg. Cart Value</p>
              </div>
              <p className="text-4xl font-semibold text-violet-600 mt-1">
                {money(stats.avgCartValue)}
              </p>
            </div>
          </div>

          {/* <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer name or product..."
              className="w-full sm:max-w-md px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div> */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by customer name or product..."
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-gray-500">
                    <th className="px-4 py-3 text-center font-medium">
                      SR. NO.
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      CUSTOMER INFO
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      CART DATE
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      PRODUCT TYPE
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      PRODUCT NAME
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      CART AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 cursor-pointer hover:bg-gray-50/80"
                      onClick={() => setSelectedCart(row)}
                    >
                      <td className="px-4 py-3 text-center text-gray-700">
                        {row.srNo}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="font-semibold text-black">
                          {row.customerName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {row.customerPhone || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {row.cartDate}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs rounded-full border ${badgeClassByType(
                            row.productType,
                          )}`}
                        >
                          {productTypeLabel(row.productType)}
                        </span>
                      </td>
                      {/* <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {row.productImage ? (
                            <img
                              src={row.productImage}
                              alt=""
                              className="w-8 h-8 rounded-md object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200" />
                          )}
                          <span className="text-gray-800">
                            {row.productName}
                          </span>
                        </div>
                      </td> */}

                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-start gap-2 max-w-[260px]">
                          {row.productImage ? (
                            <img
                              src={row.productImage}
                              alt=""
                              className="w-8 h-8 rounded-md object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200 shrink-0" />
                          )}
                          <span
                            className="text-gray-800 truncate"
                            title={row.productName}
                          >
                            {row.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-black">
                        {money(row.amount)}
                      </td>
                    </tr>
                  ))}
                  {pagination.totalItems === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No cart records found.
                      </td>
                    </tr>
                  ) : null}
                  {pagination.totalItems > 0 ? (
                    <tr className="bg-orange-500 text-white text-sm font-semibold">
                      <td colSpan={5} className="px-4 py-3 text-left">
                        GRAND TOTAL
                      </td>
                      <td className="px-4 py-3 text-center">
                        {money(stats.totalCartValue)}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {pagination.totalItems > 0 ? (
              <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Showing {pagination.start}-{pagination.end} of{' '}
                  {pagination.totalItems} products
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <span className="min-w-8 text-center px-2.5 py-1.5 text-xs border border-orange-500 bg-orange-500 text-white rounded-lg">
                    {pagination.page}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1),
                      )
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}

      {detail ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setSelectedCart(null)}
            aria-label="Close cart detail"
          />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[540px] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-black">
                  Cart Detail
                </h3>
                <p className="text-sm font-semibold text-gray-500">
                  Review and manage abandoned cart recovery
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCart(null)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <section className="rounded-2xl border border-[#BEDBFF] bg-blue-50/80 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Customer Overview
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                    {detail.initials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-black">
                      {detail.customerName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {detail.customerPhone || '—'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {detail.customerEmail || 'no-email@rentnpay.com'}
                    </p>
                  </div>
                </div>
                <a
                  href={
                    detail.customerPhone ? `tel:${detail.customerPhone}` : '#'
                  }
                  onClick={(e) => {
                    if (!detail.customerPhone) e.preventDefault();
                  }}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 text-sm font-medium"
                >
                  <Phone className="w-4 h-4" />
                  Call Customer
                </a>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Item Deep Dive
                </p>
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  {detail.productImage ? (
                    <img
                      src={detail.productImage}
                      alt={detail.productName}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100" />
                  )}
                </div>
                <p className="mt-3 text-2xl font-semibold text-black">
                  {detail.productName}
                </p>
                {/* <span
                  className={`mt-2 inline-flex px-2.5 py-1 text-xs rounded-full border ${badgeClassByType(
                    detail.productType,
                  )}`}
                >
                  {detail.productType || 'For Rent'}
                </span> */}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                    <p className="text-[11px] text-gray-500 uppercase">
                      Original Price
                    </p>
                    <p className="text-xl font-semibold text-black mt-1">
                      {money(detail.originalPrice || detail.productAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                    <p className="text-[11px] text-gray-500 uppercase">
                      Current Cart Price
                    </p>
                    <p className="text-xl font-semibold text-emerald-700 mt-1">
                      {money(detail.productAmount)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Financial Breakdown
                </p>
                <div className="rounded-xl border border-gray-200 overflow-hidden divide-y">
                  <div className="px-3 py-2.5 flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-gray-500" />
                      {String(detail.productType || '').toLowerCase() ===
                      'service'
                        ? 'Service Amount'
                        : 'Product Amount'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {money(detail.productAmount)}
                    </span>
                  </div>

                  {!['sell', 'service'].includes(
                    String(detail.productType || '').toLowerCase(),
                  ) && (
                    <div className="px-3 py-2.5 flex items-center justify-between text-sm bg-orange-50">
                      <span className="text-orange-700 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-orange-600" />
                        Security Deposit (Refundable)
                      </span>
                      <span className="font-semibold text-orange-700">
                        {money(detail.deposit)}
                      </span>
                    </div>
                  )}
                  <div className="px-3 py-2.5 flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-gray-500" />
                      Estimated Shipping
                    </span>
                    <span className="font-semibold text-gray-900">
                      {detail.shipping > 0 ? money(detail.shipping) : 'FREE'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-black">
                    Total Full Quote
                  </span>
                  <span className="text-2xl font-bold text-emerald-700">
                    {money(detail.totalQuote)}
                  </span>
                </div>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
