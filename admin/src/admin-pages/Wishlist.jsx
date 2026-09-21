// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   Check,
//   CircleCheckBig,
//   CircleX,
//   Download,
//   Heart,
//   Search,
//   Users,
//   X,
// } from 'lucide-react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { apiGetWishlistAnalytics } from '@/service/api';
// const stockBadgeClass = (stock) =>
//   Number(stock || 0) > 0
//     ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//     : 'bg-rose-50 text-rose-700 border-rose-200';

// export default function Wishlist() {
//   const [data, setData] = useState({
//     summary: {
//       totalWishlistedItems: 0,
//       mostWishlistedCategory: '—',
//       mostWishlistedCategoryCount: 0,
//       topWishlistUsers: 0,
//     },
//     topProducts: [],
//     topUsers: [],
//   });
//   const [query, setQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showAllUsers, setShowAllUsers] = useState(false);

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       setError('Please login again to continue.');
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     apiGetWishlistAnalytics(token)
//       .then((res) => {
//         setData(res.data || data);
//       })
//       .catch((err) => {
//         setError(
//           err?.response?.data?.message || 'Failed to load wishlist analytics.',
//         );
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const filteredProducts = useMemo(() => {
//     const term = query.trim().toLowerCase();
//     if (!term) return data.topProducts || [];
//     return (data.topProducts || []).filter((p) => {
//       return (
//         String(p.productName || '')
//           .toLowerCase()
//           .includes(term) ||
//         String(p.vendorName || '')
//           .toLowerCase()
//           .includes(term)
//       );
//     });
//   }, [query, data.topProducts]);

//   const handleExportPDF = () => {
//     const doc = new jsPDF({ orientation: 'landscape' });

//     doc.setFontSize(16);
//     doc.text('Trending Wishlisted Products Report', 14, 15);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(
//       `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
//       14,
//       22,
//     );

//     doc.setFontSize(11);
//     doc.setTextColor(0);
//     doc.text(
//       `Total Wishlisted Items: ${data.summary.totalWishlistedItems || 0}   |   Most Wishlisted Category: ${data.summary.mostWishlistedCategory || '—'}   |   Top Wishlist Users: ${data.summary.topWishlistUsers || 0}`,
//       14,
//       30,
//     );

//     const rows = filteredProducts.map((p) => [
//       p.productName || '—',
//       p.totalWishlists ?? 0,
//       p.category || '—',
//       p.price || '—',
//       p.vendorName || 'Vendor',
//       Number(p.stock || 0) > 0 ? 'In Stock' : 'Out of Stock',
//     ]);

//     autoTable(doc, {
//       startY: 36,
//       head: [
//         [
//           'Product Details',
//           'Total Wishlists',
//           'Category',
//           'Price/Rent',
//           'Vendor',
//           'Status',
//         ],
//       ],
//       body: rows,
//       styles: { fontSize: 8, cellPadding: 3 },
//       headStyles: {
//         fillColor: [249, 115, 22],
//         textColor: 255,
//         fontStyle: 'bold',
//       },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//     });

//     doc.save(`wishlist-analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   return (
//     <main className="space-y-4">
//       {/* <div>
//         <h1 className="text-3xl font-semibold text-gray-900">Global Wishlist Analytics</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Track trending products, customer preferences, and conversion opportunities
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
//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
//           <div className="xl:col-span-9 space-y-4">
//             {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-white rounded-2xl border border-gray-200 p-4">
//                 <p className="text-sm font-bold text-gray-500">
//                   Total Wishlisted
//                 </p>
//                 <p className="text-4xl font-semibold text-gray-900 mt-1">
//                   {Number(
//                     data.summary.totalWishlistedItems || 0,
//                   ).toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-xs font-semibold text-gray-400 mt-1">
//                   Across all products
//                 </p>
//               </div>
//               <div className="bg-white rounded-2xl border border-gray-200 p-4">
//                 <p className="text-sm font-bold text-gray-500">
//                   Most Wishlisted
//                 </p>
//                 <p className="text-4xl font-semibold text-gray-900 mt-1">
//                   {data.summary.mostWishlistedCategory || '—'}
//                 </p>
//                 <p className="text-xs font-semibold text-gray-400 mt-1">
//                   {data.summary.mostWishlistedCategoryCount || 0} wishlist
//                   entries
//                 </p>
//               </div>
//               <div className="bg-white rounded-2xl border border-gray-200 p-4">
//                 <p className="text-sm font-bold text-gray-500">Top Users</p>
//                 <p className="text-4xl font-semibold text-gray-900 mt-1">
//                   {Number(data.summary.topWishlistUsers || 0).toLocaleString(
//                     'en-IN',
//                   )}
//                 </p>
//                 <p className="text-xs font-semibold text-gray-400 mt-1">
//                   Most active wishlist customers
//                 </p>
//               </div>
//             </div> */}

//             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//               <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Trending Wishlisted Products
//                 </h2>
//                 <button
//                   type="button"
//                   onClick={handleExportPDF}
//                   disabled={loading || filteredProducts.length === 0}
//                   className="px-3 py-1.5 rounded-lg border text-sm text-gray-600 disabled:opacity-40 flex items-center gap-1.5"
//                 >
//                   <Download size={14} />
//                   Export
//                 </button>
//               </div>
//               {/* <div className="p-4 border-b border-gray-100">
//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search products or vendors..."
//                   className="w-full sm:max-w-md px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                 />
//               </div> */}
//               <div className="p-4 border-b border-gray-100">
//                 <div className="relative w-full sm:max-w-md">
//                   <Search
//                     size={16}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   />
//                   <input
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     placeholder="Search products or vendors..."
//                     className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
//                   />
//                 </div>
//               </div>
//               <div className="overflow-x-auto">
//                 {/* <table className="min-w-[980px] w-full text-sm">
//                   <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
//                     <tr>
//                       <th className="px-4 py-3 text-left font-medium">
//                         PRODUCT DETAILS
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         TOTAL WISHLISTS
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         CATEGORY
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">PRICE</th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         VENDOR
//                       </th>
//                       <th className="px-4 py-3 text-left font-medium">
//                         STATUS
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProducts.map((p) => (
//                       <tr
//                         key={String(p.productId)}
//                         className="border-t border-gray-100"
//                       >
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-3">
//                             <img
//                               src={
//                                 p.productImage ||
//                                 'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
//                               }
//                               alt={p.productName}
//                               className="w-10 h-10 rounded-lg object-cover"
//                             />
//                             <div>
//                               <p className="font-medium text-gray-900">
//                                 {p.productName}
//                               </p>
//                               <p className="text-xs text-gray-500">Monthly</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className="inline-flex items-center gap-1 text-gray-900 font-semibold">
//                             <Heart
//                               size={14}
//                               className="text-rose-500 fill-rose-500"
//                             />
//                             {p.totalWishlists}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">{p.category || '—'}</td>
//                         <td className="px-4 py-3">{p.price || '—'}</td>
//                         <td className="px-4 py-3">
//                           {p.vendorName || 'Vendor'}
//                         </td>
//                         <td className="px-4 py-3">
//                           <span
//                             className={`inline-flex items-center gap-1 px-2.5 py-1 font-semibold rounded-full border text-xs ${stockBadgeClass(
//                               p.stock,
//                             )}`}
//                           >
//                             {Number(p.stock || 0) > 0 ? (
//                               <CircleCheckBig size={12} />
//                             ) : (
//                               <CircleX size={12} />
//                             )}
//                             {Number(p.stock || 0) > 0
//                               ? 'In Stock'
//                               : 'Out of Stock'}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                     {filteredProducts.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan={6}
//                           className="px-4 py-8 text-center text-gray-500"
//                         >
//                           No wishlist products found.
//                         </td>
//                       </tr>
//                     ) : null}
//                   </tbody>
//                 </table> */}
//                 <table className="min-w-[980px] w-full text-sm">
//                   <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
//                     <tr>
//                       <th className="px-4 py-3 text-center font-medium">
//                         PRODUCT DETAILS
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         TOTAL WISHLISTS
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         CATEGORY
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         PRICE
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         VENDOR
//                       </th>
//                       <th className="px-4 py-3 text-center font-medium">
//                         STATUS
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredProducts.map((p) => (
//                       <tr
//                         key={String(p.productId)}
//                         className="border-t border-gray-100"
//                       >
//                         <td className="px-4 py-3 text-center">
//                           <div className="flex items-center justify-center gap-3">
//                             <img
//                               src={
//                                 p.productImage ||
//                                 'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
//                               }
//                               alt={p.productName}
//                               className="w-10 h-10 rounded-lg object-cover"
//                             />
//                             <div className="text-left">
//                               <p className="font-medium text-gray-900">
//                                 {p.productName}
//                               </p>
//                               <p className="text-xs text-gray-500">Monthly</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <span className="inline-flex items-center justify-center gap-1 text-gray-900 font-semibold">
//                             <Heart
//                               size={14}
//                               className="text-rose-500 fill-rose-500"
//                             />
//                             {p.totalWishlists}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           {p.category || '—'}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           {p.price || '—'}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           {p.vendorName || 'Vendor'}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           <span
//                             className={`inline-flex items-center gap-1 px-2.5 py-1 font-semibold rounded-full border text-xs ${stockBadgeClass(
//                               p.stock,
//                             )}`}
//                           >
//                             {Number(p.stock || 0) > 0 ? (
//                               <CircleCheckBig size={12} />
//                             ) : (
//                               <CircleX size={12} />
//                             )}
//                             {Number(p.stock || 0) > 0
//                               ? 'In Stock'
//                               : 'Out of Stock'}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                     {filteredProducts.length === 0 ? (
//                       <tr>
//                         <td
//                           colSpan={6}
//                           className="px-4 py-8 text-center text-gray-500"
//                         >
//                           No wishlist products found.
//                         </td>
//                       </tr>
//                     ) : null}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           <div className="xl:col-span-3 space-y-4">
//             <div className="bg-white rounded-2xl border border-gray-200 p-4">
//               <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
//                 <Users size={18} className="font-bold" color="#F97316" />
//                 Top Wishlist Users
//               </h3>
//               <p className="text-xs text-gray-500 mb-3">
//                 Most active wishlist customers
//               </p>
//               {/* <div className="space-y-2">
//                 {(data.topUsers || []).slice(0, 5).map((u, idx) => (
//                   <div
//                     key={String(u.userId)}
//                     className="border rounded-xl px-3 py-2"
//                   >
//                     <div className="flex items-center justify-between gap-2">
//                       <p className="font-medium text-sm text-gray-900">
//                         #{idx + 1} {u.fullName}
//                       </p>
//                       <span className="text-xs text-gray-500 inline-flex items-center gap-1">
//                         <Heart
//                           size={12}
//                           className="text-gray-400 fill-gray-400"
//                         />
//                         {u.totalWishlists}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-500">{u.emailAddress}</p>
//                   </div>
//                 ))}
//               </div> */}

//               <div
//                 className={`space-y-2 ${
//                   showAllUsers ? 'max-h-72 overflow-y-auto pr-1' : ''
//                 }`}
//               >
//                 {(data.topUsers || [])
//                   .slice(0, showAllUsers ? data.topUsers.length : 5)
//                   .map((u, idx) => (
//                     <div
//                       key={String(u.userId)}
//                       className="border rounded-xl px-3 py-2"
//                     >
//                       <div className="flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-2 min-w-0">
//                           <span
//                             className="flex-shrink-0 text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center"
//                             style={{
//                               backgroundColor: '#FFEDD4',
//                               color: '#F97316',
//                             }}
//                           >
//                             #{idx + 1}
//                           </span>
//                           <span
//                             className="flex-shrink-0 w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center"
//                             style={{
//                               background:
//                                 'linear-gradient(135deg, #3B82F6, #2563EB)',
//                             }}
//                           >
//                             {String(u.fullName || '?')
//                               .trim()
//                               .charAt(0)
//                               .toUpperCase()}
//                           </span>
//                           <p className="font-medium text-sm text-gray-900 truncate">
//                             {u.fullName}
//                           </p>
//                         </div>
//                         <span className="text-xs text-gray-500 inline-flex items-center gap-1 flex-shrink-0">
//                           <Heart
//                             size={12}
//                             className="text-gray-400 fill-gray-400"
//                           />
//                           {u.totalWishlists}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500 ml-9">
//                         {u.emailAddress}
//                       </p>
//                     </div>
//                   ))}
//               </div>
//               {(data.topUsers || []).length > 2 ? (
//                 <button
//                   type="button"
//                   onClick={() => setShowAllUsers((prev) => !prev)}
//                   className="w-full mt-3 text-xs font-medium text-[#2563EB] border-2 border-[#2563EB] rounded-lg py-1.5"
//                 >
//                   {showAllUsers ? 'Hide' : 'View All Users'}
//                 </button>
//               ) : null}
//             </div>

//             {/* <div className="bg-white rounded-2xl border border-orange-300 p-4">
//               <h3 className="text-base font-semibold text-gray-900">
//                 Campaign Actions
//               </h3>
//               <p className="text-xs text-gray-500 mb-3">Drive conversions</p>
//               <div className="space-y-2">
//                 <button className="w-full rounded-xl bg-orange-500 text-white px-3 py-2.5 text-sm font-medium">
//                   Create Discount for Wishlisted Items
//                 </button>
//                 <button className="w-full rounded-xl border border-orange-200 text-orange-700 px-3 py-2.5 text-sm font-medium">
//                   Create Flash Sale
//                 </button>
//                 <button className="w-full rounded-xl border border-orange-200 text-orange-700 px-3 py-2.5 text-sm font-medium">
//                   Send Push Notifications
//                 </button>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CircleCheckBig,
  CircleX,
  Download,
  Heart,
  Search,
  Users,
  X,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiGetWishlistAnalytics } from '@/service/api';
const stockBadgeClass = (stock) =>
  Number(stock || 0) > 0
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-rose-50 text-rose-700 border-rose-200';

export default function Wishlist() {
  const [data, setData] = useState({
    summary: {
      totalWishlistedItems: 0,
      mostWishlistedCategory: '—',
      mostWishlistedCategoryCount: 0,
      topWishlistUsers: 0,
    },
    topProducts: [],
    topUsers: [],
  });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setError('Please login again to continue.');
      setLoading(false);
      return;
    }
    setLoading(true);
    apiGetWishlistAnalytics(token)
      .then((res) => {
        setData(res.data || data);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || 'Failed to load wishlist analytics.',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data.topProducts || [];
    return (data.topProducts || []).filter((p) => {
      return (
        String(p.productName || '')
          .toLowerCase()
          .includes(term) ||
        String(p.vendorName || '')
          .toLowerCase()
          .includes(term)
      );
    });
  }, [query, data.topProducts]);

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('Trending Wishlisted Products Report', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      14,
      22,
    );

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(
      `Total Wishlisted Items: ${data.summary.totalWishlistedItems || 0}   |   Most Wishlisted Category: ${data.summary.mostWishlistedCategory || '—'}   |   Top Wishlist Users: ${data.summary.topWishlistUsers || 0}`,
      14,
      30,
    );

    const rows = filteredProducts.map((p) => [
      p.productName || '—',
      p.totalWishlists ?? 0,
      p.category || '—',
      p.price || '—',
      p.vendorName || 'Vendor',
      Number(p.stock || 0) > 0 ? 'In Stock' : 'Out of Stock',
    ]);

    autoTable(doc, {
      startY: 36,
      head: [
        [
          'Product Details',
          'Total Wishlists',
          'Category',
          'Price/Rent',
          'Vendor',
          'Status',
        ],
      ],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`wishlist-analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <main className="space-y-4">
      {/* <div>
        <h1 className="text-3xl font-semibold text-gray-900">Global Wishlist Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track trending products, customer preferences, and conversion opportunities
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-9 space-y-4">
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-gray-500">
                  Total Wishlisted
                </p>
                <p className="text-4xl font-semibold text-gray-900 mt-1">
                  {Number(
                    data.summary.totalWishlistedItems || 0,
                  ).toLocaleString('en-IN')}
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  Across all products
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-gray-500">
                  Most Wishlisted
                </p>
                <p className="text-4xl font-semibold text-gray-900 mt-1">
                  {data.summary.mostWishlistedCategory || '—'}
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  {data.summary.mostWishlistedCategoryCount || 0} wishlist
                  entries
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-gray-500">Top Users</p>
                <p className="text-4xl font-semibold text-gray-900 mt-1">
                  {Number(data.summary.topWishlistUsers || 0).toLocaleString(
                    'en-IN',
                  )}
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  Most active wishlist customers
                </p>
              </div>
            </div> */}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Trending Wishlisted Products
                </h2>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={loading || filteredProducts.length === 0}
                  className="px-3 py-1.5 rounded-lg border text-sm text-gray-600 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
              {/* <div className="p-4 border-b border-gray-100">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products or vendors..."
                  className="w-full sm:max-w-md px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
                />
              </div> */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative w-full sm:max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products or vendors..."
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                {/* <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        PRODUCT DETAILS
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        TOTAL WISHLISTS
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        CATEGORY
                      </th>
                      <th className="px-4 py-3 text-left font-medium">PRICE</th>
                      <th className="px-4 py-3 text-left font-medium">
                        VENDOR
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr
                        key={String(p.productId)}
                        className="border-t border-gray-100"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                p.productImage ||
                                'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
                              }
                              alt={p.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {p.productName}
                              </p>
                              <p className="text-xs text-gray-500">Monthly</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-gray-900 font-semibold">
                            <Heart
                              size={14}
                              className="text-rose-500 fill-rose-500"
                            />
                            {p.totalWishlists}
                          </span>
                        </td>
                        <td className="px-4 py-3">{p.category || '—'}</td>
                        <td className="px-4 py-3">{p.price || '—'}</td>
                        <td className="px-4 py-3">
                          {p.vendorName || 'Vendor'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 font-semibold rounded-full border text-xs ${stockBadgeClass(
                              p.stock,
                            )}`}
                          >
                            {Number(p.stock || 0) > 0 ? (
                              <CircleCheckBig size={12} />
                            ) : (
                              <CircleX size={12} />
                            )}
                            {Number(p.stock || 0) > 0
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No wishlist products found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table> */}
                <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        PRODUCT
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        TOTAL WISHLISTS
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        CATEGORY
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        PRICE
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        VENDOR
                      </th>
                      <th className="px-4 py-3 text-center font-medium">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr
                        key={String(p.productId)}
                        className="border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-start gap-3">
                            <img
                              src={
                                p.productImage ||
                                'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'
                              }
                              alt={p.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="text-left">
                              <p className="font-medium text-gray-900">
                                {p.productName}
                              </p>
                              {/* <p className="text-xs text-gray-500">Monthly</p> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center gap-1 text-gray-900 font-semibold">
                            <Heart
                              size={14}
                              className="text-rose-500 fill-rose-500"
                            />
                            {p.totalWishlists}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.category || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {(() => {
                            const raw = String(p.price || '');
                            if (!raw || raw === '—') return '—';
                            const match = raw.match(/[\d.]+/);
                            if (!match) return raw;
                            const num = Number(match[0]);
                            if (!Number.isFinite(num)) return raw;
                            const formatted = num.toLocaleString('en-IN');
                            return raw.replace(match[0], formatted);
                          })()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.vendorName || 'Vendor'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 font-semibold rounded-full border text-xs ${stockBadgeClass(
                              p.stock,
                            )}`}
                          >
                            {Number(p.stock || 0) > 0 ? (
                              <CircleCheckBig size={12} />
                            ) : (
                              <CircleX size={12} />
                            )}
                            {Number(p.stock || 0) > 0
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No wishlist products found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Users size={18} className="font-bold" color="#F97316" />
                Top Wishlist Users
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Most active wishlist customers
              </p>
              {/* <div className="space-y-2">
                {(data.topUsers || []).slice(0, 5).map((u, idx) => (
                  <div
                    key={String(u.userId)}
                    className="border rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-gray-900">
                        #{idx + 1} {u.fullName}
                      </p>
                      <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                        <Heart
                          size={12}
                          className="text-gray-400 fill-gray-400"
                        />
                        {u.totalWishlists}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{u.emailAddress}</p>
                  </div>
                ))}
              </div> */}

              <div
                className={`space-y-2 ${
                  showAllUsers ? 'max-h-72 overflow-y-auto pr-1' : ''
                }`}
              >
                {(data.topUsers || [])
                  .slice(0, showAllUsers ? data.topUsers.length : 5)
                  .map((u, idx) => (
                    <div
                      key={String(u.userId)}
                      className="border rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="flex-shrink-0 text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center"
                            style={{
                              backgroundColor: '#FFEDD4',
                              color: '#F97316',
                            }}
                          >
                            #{idx + 1}
                          </span>
                          <span
                            className="flex-shrink-0 w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-center"
                            style={{
                              background:
                                'linear-gradient(135deg, #3B82F6, #2563EB)',
                            }}
                          >
                            {String(u.fullName || '?')
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {u.fullName}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 inline-flex items-center gap-1 flex-shrink-0">
                          <Heart
                            size={12}
                            className="text-gray-400 fill-gray-400"
                          />
                          {u.totalWishlists}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 ml-9">
                        {u.emailAddress}
                      </p>
                    </div>
                  ))}
              </div>
              {(data.topUsers || []).length > 2 ? (
                <button
                  type="button"
                  onClick={() => setShowAllUsers((prev) => !prev)}
                  className="w-full mt-3 text-xs font-medium text-[#2563EB] border-2 border-[#2563EB] rounded-lg py-1.5"
                >
                  {showAllUsers ? 'Hide' : 'View All Users'}
                </button>
              ) : null}
            </div>

            {/* <div className="bg-white rounded-2xl border border-orange-300 p-4">
              <h3 className="text-base font-semibold text-gray-900">
                Campaign Actions
              </h3>
              <p className="text-xs text-gray-500 mb-3">Drive conversions</p>
              <div className="space-y-2">
                <button className="w-full rounded-xl bg-orange-500 text-white px-3 py-2.5 text-sm font-medium">
                  Create Discount for Wishlisted Items
                </button>
                <button className="w-full rounded-xl border border-orange-200 text-orange-700 px-3 py-2.5 text-sm font-medium">
                  Create Flash Sale
                </button>
                <button className="w-full rounded-xl border border-orange-200 text-orange-700 px-3 py-2.5 text-sm font-medium">
                  Send Push Notifications
                </button>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </main>
  );
}
