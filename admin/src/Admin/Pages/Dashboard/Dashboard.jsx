// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   apiGetAllAdminProducts,
//   apiGetAllOrders,
//   apiGetProductApprovalQueue,
//   apiGetAllUsers,
//   apiGetAllVendors,
//   apiGetAdminStores,
// } from '@/service/api';
// import {
//   buildActivityFeed,
//   formatRelativeTime,
// } from '@/Admin/utils/activityFeed';
// import { useRouter } from 'next/navigation';
// import LiveOrderActivitySection from './LiveOrderActivitySection';
// import CityDashboardSection from './CityDashboardSection';
// // import CityDashboardSection from './CityDashboardSection';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import { Download } from 'lucide-react';

// import revenueIcon from '@/assets/icons/doller-vndr.png';
// import revenueHighIcon from '@/assets/icons/revenue-high.png';
// import vendorStatusIcon from '@/assets/icons/vendor-status.png';
// import liveListingIcon from '@/assets/icons/live-listing.png';
// import criticalIcon from '@/assets/icons/critical.png';

// const Dashboard = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [stats, setStats] = useState({
//     revenue: 0,
//     revenueGrowth: 23,
//     vendorsActive: 0,
//     vendorsPending: 0,
//     listingsRent: 0,
//     listingsBuy: 0,
//     listingsService: 0,
//     delayedOrders: 0,
//   });
//   const [feed, setFeed] = useState([]);
//   const [showAllFeed, setShowAllFeed] = useState(false);
//   const [vendors, setVendors] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [stores, setStores] = useState([]);
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) {
//       setError('Please login again to continue.');
//       setLoading(false);
//       return;
//     }

//     Promise.all([
//       apiGetAllUsers(token)
//         .then((r) => r.data.users || [])
//         .catch(() => []),
//       apiGetAllVendors(token)
//         .then((r) => r.data.vendors || [])
//         .catch(() => []),
//       apiGetAllAdminProducts(token, 'limit=300')
//         .then((r) => ({
//           products: r.data.products || [],
//           serviceCount: r.data.serviceCount || 0,
//         }))
//         .catch(() => []),
//       apiGetAllOrders(token)
//         .then((r) => r.data || [])
//         .catch(() => []),
//       apiGetProductApprovalQueue(token, { status: 'pending' })
//         .then((r) => r.data.queue || [])
//         .catch(() => []),

//       apiGetAdminStores(token)
//         .then((r) => r.data?.stores || [])
//         .catch(() => []),
//     ])
//       // .then(([users, vendors, products, orders, approvalQueue]) => {
//       .then(([users, vendors, productData, orders, approvalQueue, stores]) => {
//         const products = productData.products;
//         console.log('FIRST PRODUCT:', products[0]);
//         console.log(JSON.stringify(products[0], null, 2));
//         const serviceCount = productData.serviceCount;
//         setVendors(vendors);
//         setOrders(orders);
//         setStores(stores);
//         setProducts(products);

//         const listingsRent = products.filter((p) => p.type === 'Rental').length;
//         const listingsBuy = products.filter((p) => p.type === 'Sell').length;
//         const listingsService = serviceCount;
//         if (!mounted) return;

//         console.log('Total orders:', orders.length);

//         console.log(
//           'Pending orders:',
//           orders.filter((o) => String(o.status) === 'pending').length,
//         );

//         console.log('All products:', products);

//         products.forEach((p) => {
//           console.log('Type:', p.type, 'Name:', p.productName);
//         });

//         // const listingsRent = products.filter((p) => p.type === 'Rental').length;
//         // const listingsBuy = products.filter((p) => p.type === 'Sell').length;
//         // const listingsService = data.serviceCount;

//         const grossOrderValue = orders.reduce((sum, o) => {
//           const oneOrder = (o.products || []).reduce(
//             (s, i) =>
//               s +
//               Number(i.pricePerDay || 0) *
//                 Number(i.quantity || 0) *
//                 Number(o.rentalDuration || 0),
//             0,
//           );
//           return sum + oneOrder;
//         }, 0);

//         // For dashboard demo, commission is 10% of gross order value.
//         const revenue = Math.round(grossOrderValue * 0.1);

//         // const delayedOrders = orders.filter((o) => {
//         //   const isOpen = !['delivered', 'cancelled'].includes(String(o.status));
//         //   if (!isOpen) return false;
//         //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
//         //   return ageMs > 24 * 60 * 60 * 1000;
//         // }).length;

//         const delayedOrders = orders.filter((o) => {
//           return (
//             String(o.status) === 'pending' &&
//             Date.now() - new Date(o.createdAt).getTime() > 24 * 60 * 60 * 1000
//           );
//         }).length;

//         const baseFeed = buildActivityFeed({
//           users,
//           vendors,
//           products,
//           orders,
//         });
//         const approvalEvents = [];
//         (products || []).forEach((p) => {
//           const isVendorProduct = Boolean(p?.vendorId);
//           if (!isVendorProduct) return;
//           const vendorLabel =
//             p?.vendorId?.fullName || p?.vendorName || 'Vendor';

//           if (p?.createdAt) {
//             approvalEvents.push({
//               id: `approval_created_${p._id}`,
//               type: 'product_approval_created',
//               createdAt: p.createdAt,
//               title: 'Vendor created a product',
//               subtitle: `${vendorLabel} created product "${p.productName || 'Product'}". Check for approval.`,
//             });
//           }
//           if (p?.isAdminApproved && p?.adminApprovedAt) {
//             approvalEvents.push({
//               id: `approval_live_${p._id}`,
//               type: 'product_approval_live',
//               createdAt: p.adminApprovedAt,
//               title: 'Product approved and live',
//               subtitle: `"${p.productName || 'Product'}" is approved and now live.`,
//             });
//           }
//         });

//         const latestFeed = [...baseFeed, ...approvalEvents]
//           .sort(
//             (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
//           )
//           .slice(0, 10);
//         setFeed(latestFeed);
//         sessionStorage.setItem('admin_last_seen_notif_ts', String(Date.now()));

//         // setStats({
//         //   revenue,
//         //   vendorsActive: vendors.filter((v) => v.isVerified).length,
//         //   vendorsPending: vendors.filter((v) => !v.isVerified).length,
//         //   listingsRent,
//         //   listingsBuy,
//         //   listingsService,
//         //   delayedOrders,
//         // });
//         setStats({
//           revenue,
//           vendorsActive: vendors.filter((v) => v.kycStatus === 'approved')
//             .length,
//           vendorsPending: vendors.filter((v) => v.kycStatus !== 'approved')
//             .length,
//           listingsRent,
//           listingsBuy,
//           listingsService,
//           delayedOrders,
//         });
//       })
//       .catch((err) => {
//         if (!mounted) return;
//         setError(err.response?.data?.message || 'Failed to load dashboard.');
//       })
//       .finally(() => {
//         if (mounted) setLoading(false);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const totalListings = useMemo(
//     () => stats.listingsRent + stats.listingsBuy + stats.listingsService,
//     [stats.listingsRent, stats.listingsBuy, stats.listingsService],
//   );
//   const visibleFeed = useMemo(
//     () => (showAllFeed ? feed : feed.slice(0, 3)),
//     [feed, showAllFeed],
//   );
//   const isPositive = stats.revenueGrowth >= 0;

//   const rentPercent = totalListings
//     ? Math.round((stats.listingsRent / totalListings) * 100)
//     : 0;

//   const buyPercent = totalListings
//     ? Math.round((stats.listingsBuy / totalListings) * 100)
//     : 0;

//   // const servicePercent = totalListings
//   //   ? Math.round((stats.listingsService / totalListings) * 100)
//   //   : 0;
//   const servicePercent = totalListings
//     ? Math.round((stats.listingsService / totalListings) * 100)
//     : 0;

//   const handleExportPdf = () => {
//     const doc = new jsPDF();
//     const now = new Date();

//     doc.setFontSize(18);
//     doc.text('Admin Dashboard Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(120);
//     doc.text(`Generated on ${now.toLocaleString('en-IN')}`, 14, 25);
//     doc.setTextColor(0);

//     autoTable(doc, {
//       startY: 32,
//       head: [['Metric', 'Value']],
//       body: [
//         [
//           'Total Revenue (Commission)',
//           `Rs. ${stats.revenue.toLocaleString('en-IN')}`,
//         ],
//         ['Active Vendors', String(stats.vendorsActive)],
//         ['Pending Vendor Approval', String(stats.vendorsPending)],
//         ['Live Listings (Total)', String(totalListings)],
//         ['Delayed Orders', String(stats.delayedOrders)],
//       ],
//     });

//     autoTable(doc, {
//       startY: doc.lastAutoTable.finalY + 10,
//       head: [['Listing Type', 'Count']],
//       body: [
//         ['Rent', String(stats.listingsRent)],
//         ['Buy (New/Used)', String(stats.listingsBuy)],
//         ['Services', String(stats.listingsService)],
//       ],
//     });

//     autoTable(doc, {
//       startY: doc.lastAutoTable.finalY + 10,
//       head: [['Recent Activity', 'When']],
//       body: feed
//         .slice(0, 10)
//         .map((item) => [
//           `${item.title} - ${item.subtitle}`,
//           formatRelativeTime(item.createdAt),
//         ]),
//       columnStyles: { 0: { cellWidth: 140 } },
//     });

//     doc.save(`dashboard-report-${now.toISOString().slice(0, 10)}.pdf`);
//   };

//   return (
//     <main className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 overflow-auto min-h-full">
//       {loading ? (
//         <div className="flex justify-center py-20">
//           <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
//           {error}
//         </div>
//       ) : (
//         <>
//           {/* <div className="flex items-center justify-end mb-4">
//             <button
//               type="button"
//               onClick={handleExportPdf}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
//             >
//               <Download className="w-4 h-4" />
//               Export as PDF
//             </button>
//           </div> */}
//           <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-5 mb-3">
//             {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               <p className="text-[11px] font-medium text-gray-500 tracking-wide">
//                 TOTAL REVENUE (COMMISSION)
//               </p>
//               <p className="mt-2 text-3xl font-semibold text-gray-900">
//                 ₹{stats.revenue.toLocaleString('en-IN')}
//               </p>
//               <p className="mt-1 text-xs text-gray-400">
//                 Net earnings after vendor payouts
//               </p>
//             </div> */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               {/* Row 1 → Icon + Growth */}
//               <div className="flex items-center justify-between mb-2">
//                 <img src={revenueIcon.src} alt="Revenue" className="w-8 h-8" />

//                 {/* <span
//                   className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border
//   ${
//     isPositive
//       ? 'text-green-700 bg-green-50 border-green-200'
//       : 'text-red-700 bg-red-50 border-red-200'
//   }`}
//                 >
//                   {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}
//                   {stats.revenueGrowth}%
//                 </span> */}
//                 {/* <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border text-green-700 bg-green-50 border-green-200">
//                   ↑ +12%
//                 </span> */}
//                 <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg border text-[#008236] bg-green-50 border-green-200">
//                   <img
//                     src={revenueHighIcon.src}
//                     alt="Revenue Growth"
//                     className="w-3 h-3"
//                   />
//                   +12%
//                 </span>
//               </div>

//               {/* Row 2 → Title */}
//               <p className="text-[11px] font-medium text-gray-500 tracking-wide">
//                 TOTAL REVENUE (COMMISSION)
//               </p>

//               {/* Value */}
//               <p className="mt-2 text-3xl font-bold text-gray-900">
//                 ₹{stats.revenue.toLocaleString('en-IN')}
//               </p>

//               {/* Subtitle */}
//               <p className="mt-1 text-xs text-gray-400">
//                 Net earnings after vendor payouts
//               </p>
//             </div>
//             {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               <p className="text-[11px] font-medium text-gray-500 tracking-wide">
//                 VENDOR STATUS
//               </p>
//               <p className="mt-2 text-3xl font-semibold text-emerald-600">
//                 {stats.vendorsActive} Active
//               </p>
//               <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-block">
//                 {stats.vendorsPending} Pending Approval
//               </p>
//             </div> */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               {/* Icon */}
//               <div className="mb-2">
//                 <img
//                   src={vendorStatusIcon.src}
//                   alt="Vendor Status"
//                   className="w-8 h-8"
//                 />
//               </div>

//               {/* Title */}
//               <p className="text-[11px] font-medium text-gray-500 tracking-wide">
//                 VENDOR STATUS
//               </p>

//               {/* Values */}
//               <p className="mt-2 text-3xl font-bold text-[#00A63E]">
//                 {stats.vendorsActive} Active
//               </p>

//               <p className="mt-1 text-xs text-[#973C00] bg-[#FEF3C6] border border-[#FFB900] rounded-md px-2 py-1 inline-block">
//                 {stats.vendorsPending} Pending Approval
//               </p>
//               {/* Subtitle */}
//               <p className="mt-1 text-xs text-gray-400">
//                 Shops onboarding this week
//               </p>
//             </div>
//             {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               <p className="text-[11px] font-medium text-gray-500 tracking-wide">
//                 LIVE LISTINGS
//               </p>
//               <p className="mt-2 text-3xl font-semibold text-gray-900">
//                 {totalListings.toLocaleString('en-IN')}
//               </p>
//               <div className="mt-3 space-y-1.5 text-xs">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Rent</span>
//                   <span className="font-medium">{stats.listingsRent}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Buy (New/Used)</span>
//                   <span className="font-medium">{stats.listingsBuy}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Services</span>
//                   <span className="font-medium">{stats.listingsService}</span>
//                 </div>
//               </div>
//             </div> */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5">
//               {/* Icon */}
//               <div className="mb-2">
//                 <img
//                   src={liveListingIcon.src}
//                   alt="Live Listings"
//                   className="w-8 h-8"
//                 />
//               </div>

//               {/* Title */}
//               <p className="text-[11px] font-medium text-gray-500 tracking-wide">
//                 LIVE LISTINGS
//               </p>

//               <p className="mt-2 text-3xl font-bold text-gray-900">
//                 {totalListings.toLocaleString('en-IN')}
//               </p>

//               {/* <div className="mt-3 space-y-1.5 text-xs">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Rent</span>
//                   <span className="font-medium">{stats.listingsRent}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Buy (New/Used)</span>
//                   <span className="font-medium">{stats.listingsBuy}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Services</span>
//                   <span className="font-medium">{stats.listingsService}</span>
//                 </div>
//               </div> */}
//               <div className="mt-3 space-y-3 text-xs">
//                 {/* Rent */}
//                 <div>
//                   <div className="flex justify-between text-gray-600 mb-1">
//                     <span>Rent</span>
//                     <span className="font-medium">{stats.listingsRent}</span>
//                   </div>
//                   <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                     <div
//                       className="h-full rounded-full"
//                       style={{
//                         width: `${rentPercent}%`,
//                         backgroundColor: '#3B82F6',
//                       }}
//                     />
//                   </div>
//                 </div>

//                 {/* Buy */}
//                 <div>
//                   <div className="flex justify-between text-gray-600 mb-1">
//                     <span>Buy (New/Used)</span>
//                     <span className="font-medium">{stats.listingsBuy}</span>
//                   </div>
//                   <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                     <div
//                       className="h-full rounded-full"
//                       style={{
//                         width: `${buyPercent}%`,
//                         backgroundColor: '#8B5CF6',
//                       }}
//                     />
//                   </div>
//                 </div>

//                 {/* Services */}
//                 <div>
//                   <div className="flex justify-between text-gray-600 mb-1">
//                     <span>Services</span>
//                     <span className="font-medium">{stats.listingsService}</span>
//                   </div>
//                   <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                     <div
//                       className="h-full rounded-full"
//                       style={{
//                         width: `${servicePercent}%`,
//                         backgroundColor: '#F97316',
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white rounded-2xl border border-rose-200 p-5">
//               <div className="flex items-center justify-between">
//                 {/* Left → Icon */}
//                 <img
//                   src={criticalIcon.src}
//                   alt="Critical"
//                   className="w-8 h-8"
//                 />

//                 {/* Right → Badge */}
//                 <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white">
//                   CRITICAL
//                 </span>
//               </div>
//               <p className="mt-3 text-4xl font-bold text-rose-600">
//                 {stats.delayedOrders}
//               </p>
//               <div className="mt-3 flex justify-center">
//                 <button
//                   onClick={() => router.push('/orders')}
//                   className="px-4 py-2 rounded-lg bg-rose-500 text-white text-base font-medium"
//                 >
//                   Approve now
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
//             {/* <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 min-h-[300px]">
//               <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Live Order Activity (Pune)
//                   </h2>
//                   <p className="text-xs text-gray-500">
//                     Geographic distribution &amp; hotspots
//                   </p>
//                 </div>
//                 <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
//                   Top: Wakad (45 Orders)
//                 </span>
//               </div>
//               <div className="h-[240px] sm:h-[300px] rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-orange-50 relative overflow-hidden">
//                 <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,#f97316_0,transparent_20%),radial-gradient(circle_at_65%_40%,#3b82f6_0,transparent_22%),radial-gradient(circle_at_45%_70%,#ef4444_0,transparent_18%)]" />
//                 <div className="absolute top-8 left-10 w-7 h-7 rounded-full bg-rose-500/80 border-4 border-white shadow" />
//                 <div className="absolute top-20 left-1/3 w-8 h-8 rounded-full bg-orange-500/80 border-4 border-white shadow" />
//                 <div className="absolute top-1/2 right-1/4 w-7 h-7 rounded-full bg-blue-500/80 border-4 border-white shadow" />
//                 <div className="absolute bottom-10 left-1/2 w-9 h-9 rounded-full bg-red-500/80 border-4 border-white shadow" />
//                 <div className="absolute bottom-3 right-3 text-[11px] text-gray-500 bg-white/90 border rounded-lg px-2 py-1">
//                   Dummy map preview
//                 </div>
//               </div>
//             </div> */}

//             <LiveOrderActivitySection
//               vendors={vendors}
//               orders={orders}
//               stores={stores}
//               products={products}
//             />

//             <div
//               id="live-feed"
//               className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5"
//             >
//               {/* <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Live Feed
//                   </h2>
//                   <p className="text-xs text-gray-500">
//                     Recent platform events
//                   </p>
//                 </div>
//                 <span className="w-2 h-2 rounded-full bg-green-500" />
//               </div> */}
//               <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       Live Feed
//                     </h2>
//                     <span className="relative flex h-2.5 w-2.5">
//                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Recent platform events
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleExportPdf}
//                   className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 whitespace-nowrap"
//                 >
//                   <Download className="w-3.5 h-3.5" />
//                   Export
//                 </button>
//               </div>
//               <ul className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
//                 {visibleFeed.map((item) => (
//                   <li
//                     key={item.id}
//                     className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
//                   >
//                     <p className="text-sm text-gray-800 font-medium">
//                       {item.title}
//                     </p>
//                     <p className="text-xs text-gray-600">{item.subtitle}</p>
//                     <p className="text-[11px] text-gray-400 mt-1">
//                       {formatRelativeTime(item.createdAt)}
//                     </p>
//                   </li>
//                 ))}
//               </ul>
//               <button
//                 type="button"
//                 onClick={() => setShowAllFeed((v) => !v)}
//                 className="mt-4 w-full text-sm rounded-lg border border-orange-300 text-orange-600 py-2 hover:bg-orange-50"
//               >
//                 {showAllFeed ? 'Show Less Activity' : 'View All Activity'}
//               </button>
//             </div>
//           </div>
//           <CityDashboardSection />
//         </>
//       )}
//     </main>
//   );
// };

// export default Dashboard;

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  apiGetAllAdminProducts,
  apiGetAllOrders,
  apiGetProductApprovalQueue,
  apiGetAllUsers,
  apiGetAllVendors,
  apiGetAdminStores,
} from '@/service/api';
import {
  buildActivityFeed,
  formatRelativeTime,
} from '@/Admin/utils/activityFeed';
import { useRouter } from 'next/navigation';
// import LiveOrderActivitySection from './LiveOrderActivitySection';
import CityDashboardSection from './CityDashboardSection';
// import CityDashboardSection from './CityDashboardSection';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

import revenueIcon from '@/assets/icons/doller-vndr.png';
import revenueHighIcon from '@/assets/icons/revenue-high.png';
import vendorStatusIcon from '@/assets/icons/vendor-status.png';
import liveListingIcon from '@/assets/icons/live-listing.png';
import criticalIcon from '@/assets/icons/critical.png';

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    revenue: 0,
    revenueGrowth: 23,
    vendorsActive: 0,
    vendorsPending: 0,
    listingsRent: 0,
    listingsBuy: 0,
    listingsService: 0,
    delayedOrders: 0,
  });
  const [feed, setFeed] = useState([]);
  const [showAllFeed, setShowAllFeed] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setError('Please login again to continue.');
      setLoading(false);
      return;
    }

    Promise.all([
      apiGetAllUsers(token)
        .then((r) => r.data.users || [])
        .catch(() => []),
      apiGetAllVendors(token)
        .then((r) => r.data.vendors || [])
        .catch(() => []),
      apiGetAllAdminProducts(token, 'limit=300')
        .then((r) => ({
          products: r.data.products || [],
          serviceCount: r.data.serviceCount || 0,
        }))
        .catch(() => []),
      apiGetAllOrders(token)
        .then((r) => r.data || [])
        .catch(() => []),
      apiGetProductApprovalQueue(token, { status: 'pending' })
        .then((r) => r.data.queue || [])
        .catch(() => []),

      apiGetAdminStores(token)
        .then((r) => r.data?.stores || [])
        .catch(() => []),
    ])
      // .then(([users, vendors, products, orders, approvalQueue]) => {
      .then(([users, vendors, productData, orders, approvalQueue, stores]) => {
        const products = productData.products;
        console.log('FIRST PRODUCT:', products[0]);
        console.log(JSON.stringify(products[0], null, 2));
        const serviceCount = productData.serviceCount;
        setVendors(vendors);
        setOrders(orders);
        setStores(stores);
        setProducts(products);

        const listingsRent = products.filter((p) => p.type === 'Rental').length;
        const listingsBuy = products.filter((p) => p.type === 'Sell').length;
        const listingsService = serviceCount;
        if (!mounted) return;

        console.log('Total orders:', orders.length);

        console.log(
          'Pending orders:',
          orders.filter((o) => String(o.status) === 'pending').length,
        );

        console.log('All products:', products);

        products.forEach((p) => {
          console.log('Type:', p.type, 'Name:', p.productName);
        });

        // const listingsRent = products.filter((p) => p.type === 'Rental').length;
        // const listingsBuy = products.filter((p) => p.type === 'Sell').length;
        // const listingsService = data.serviceCount;

        const grossOrderValue = orders.reduce((sum, o) => {
          const oneOrder = (o.products || []).reduce(
            (s, i) =>
              s +
              Number(i.pricePerDay || 0) *
                Number(i.quantity || 0) *
                Number(o.rentalDuration || 0),
            0,
          );
          return sum + oneOrder;
        }, 0);

        // For dashboard demo, commission is 10% of gross order value.
        const revenue = Math.round(grossOrderValue * 0.1);

        // const delayedOrders = orders.filter((o) => {
        //   const isOpen = !['delivered', 'cancelled'].includes(String(o.status));
        //   if (!isOpen) return false;
        //   const ageMs = Date.now() - new Date(o.createdAt || 0).getTime();
        //   return ageMs > 24 * 60 * 60 * 1000;
        // }).length;

        const delayedOrders = orders.filter((o) => {
          return (
            String(o.status) === 'pending' &&
            Date.now() - new Date(o.createdAt).getTime() > 24 * 60 * 60 * 1000
          );
        }).length;

        const baseFeed = buildActivityFeed({
          users,
          vendors,
          products,
          orders,
        });
        const approvalEvents = [];
        (products || []).forEach((p) => {
          const isVendorProduct = Boolean(p?.vendorId);
          if (!isVendorProduct) return;
          const vendorLabel =
            p?.vendorId?.fullName || p?.vendorName || 'Vendor';

          if (p?.createdAt) {
            approvalEvents.push({
              id: `approval_created_${p._id}`,
              type: 'product_approval_created',
              createdAt: p.createdAt,
              title: 'Vendor created a product',
              subtitle: `${vendorLabel} created product "${p.productName || 'Product'}". Check for approval.`,
            });
          }
          if (p?.isAdminApproved && p?.adminApprovedAt) {
            approvalEvents.push({
              id: `approval_live_${p._id}`,
              type: 'product_approval_live',
              createdAt: p.adminApprovedAt,
              title: 'Product approved and live',
              subtitle: `"${p.productName || 'Product'}" is approved and now live.`,
            });
          }
        });

        // const latestFeed = [...baseFeed, ...approvalEvents]
        //   .sort(
        //     (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        //   )
        //   .slice(0, 20);
        // setFeed(latestFeed);
        // sessionStorage.setItem('admin_last_seen_notif_ts', String(Date.now()));

        const latestFeed = [...baseFeed, ...approvalEvents]
          .sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          )
          .slice(0, 20);
        setFeed(latestFeed);
        sessionStorage.setItem('admin_last_seen_notif_ts', String(Date.now()));

        // Notify the sidebar immediately if there's an order newer than
        // what the sidebar has already marked as "seen".
        try {
          const lastSeenRaw = localStorage.getItem('adminOrdersLastSeenAt');
          const lastSeenMs = lastSeenRaw
            ? new Date(lastSeenRaw).getTime()
            : null;
          const hasNewOrder = (orders || []).some((o) => {
            const t = new Date(o.createdAt || 0).getTime();
            if (lastSeenMs == null) return true;
            return !Number.isNaN(t) && t > lastSeenMs;
          });
          if (hasNewOrder) {
            window.dispatchEvent(new Event('admin-new-order'));
          }
        } catch {
          /* ignore */
        }

        // setStats({
        //   revenue,
        //   vendorsActive: vendors.filter((v) => v.isVerified).length,
        //   vendorsPending: vendors.filter((v) => !v.isVerified).length,
        //   listingsRent,
        //   listingsBuy,
        //   listingsService,
        //   delayedOrders,
        // });
        setStats({
          revenue,
          vendorsActive: vendors.filter((v) => v.kycStatus === 'approved')
            .length,
          vendorsPending: vendors.filter((v) => v.kycStatus !== 'approved')
            .length,
          listingsRent,
          listingsBuy,
          listingsService,
          delayedOrders,
        });
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalListings = useMemo(
    () => stats.listingsRent + stats.listingsBuy + stats.listingsService,
    [stats.listingsRent, stats.listingsBuy, stats.listingsService],
  );
  // const visibleFeed = useMemo(
  //   () => (showAllFeed ? feed : feed.slice(0, 3)),
  //   [feed, showAllFeed],
  // );
  const visibleFeed = useMemo(
    () => (showAllFeed ? feed : feed.slice(0, 4)),
    [feed, showAllFeed],
  );
  const isPositive = stats.revenueGrowth >= 0;

  const rentPercent = totalListings
    ? Math.round((stats.listingsRent / totalListings) * 100)
    : 0;

  const buyPercent = totalListings
    ? Math.round((stats.listingsBuy / totalListings) * 100)
    : 0;

  // const servicePercent = totalListings
  //   ? Math.round((stats.listingsService / totalListings) * 100)
  //   : 0;
  const servicePercent = totalListings
    ? Math.round((stats.listingsService / totalListings) * 100)
    : 0;

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const now = new Date();

    doc.setFontSize(18);
    doc.text('Admin Dashboard Report', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on ${now.toLocaleString('en-IN')}`, 14, 25);
    doc.setTextColor(0);

    // autoTable(doc, {
    //   startY: 32,
    //   head: [['Metric', 'Value']],
    //   body: [
    //     [
    //       'Total Revenue (Commission)',
    //       `Rs. ${stats.revenue.toLocaleString('en-IN')}`,
    //     ],
    //     ['Active Vendors', String(stats.vendorsActive)],
    //     ['Pending Vendor Approval', String(stats.vendorsPending)],
    //     ['Live Listings (Total)', String(totalListings)],
    //     ['Delayed Orders', String(stats.delayedOrders)],
    //   ],
    // });

    // autoTable(doc, {
    //   startY: doc.lastAutoTable.finalY + 10,
    //   head: [['Listing Type', 'Count']],
    //   body: [
    //     ['Rent', String(stats.listingsRent)],
    //     ['Buy (New/Used)', String(stats.listingsBuy)],
    //     ['Services', String(stats.listingsService)],
    //   ],
    // });

    // autoTable(doc, {
    //   startY: doc.lastAutoTable.finalY + 10,
    //   head: [['Recent Activity', 'When']],
    //   body: feed
    //     .slice(0, 10)
    //     .map((item) => [
    //       `${item.title} - ${item.subtitle}`,
    //       formatRelativeTime(item.createdAt),
    //     ]),
    //   columnStyles: { 0: { cellWidth: 140 } },
    // });

    doc.save(`dashboard-report-${now.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <main className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 overflow-auto min-h-full">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      ) : (
        <>
          {/* <div className="flex items-center justify-end mb-4">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              <Download className="w-4 h-4" />
              Export as PDF
            </button>
          </div> */}
          <div className="hidden grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-5 mb-3">
            {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[11px] font-medium text-gray-500 tracking-wide">
                TOTAL REVENUE (COMMISSION)
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                ₹{stats.revenue.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Net earnings after vendor payouts
              </p>
            </div> */}
            {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
           
              <div className="flex items-center justify-between mb-2">
                <img src={revenueIcon.src} alt="Revenue" className="w-8 h-8" />

       
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg border text-[#008236] bg-green-50 border-green-200">
                  <img
                    src={revenueHighIcon.src}
                    alt="Revenue Growth"
                    className="w-3 h-3"
                  />
                  +12%
                </span>
              </div>

          
              <p className="text-[11px] font-medium text-gray-500 tracking-wide">
                TOTAL REVENUE (COMMISSION)
              </p>

       
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ₹{stats.revenue.toLocaleString('en-IN')}
              </p>

 
              <p className="mt-1 text-xs text-gray-400">
                Net earnings after vendor payouts
              </p>
            </div> */}

            {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
              
              <div className="mb-2">
                <img
                  src={vendorStatusIcon.src}
                  alt="Vendor Status"
                  className="w-8 h-8"
                />
              </div>

              
              <p className="text-[11px] font-medium text-gray-500 tracking-wide">
                VENDOR STATUS
              </p>

          
              <p className="mt-2 text-3xl font-bold text-[#00A63E]">
                {stats.vendorsActive} Active
              </p>

              <p className="mt-1 text-xs text-[#973C00] bg-[#FEF3C6] border border-[#FFB900] rounded-md px-2 py-1 inline-block">
                {stats.vendorsPending} Pending Approval
              </p>
              
              <p className="mt-1 text-xs text-gray-400">
                Shops onboarding this week
              </p>
            </div> */}
            {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[11px] font-medium text-gray-500 tracking-wide">
                LIVE LISTINGS
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {totalListings.toLocaleString('en-IN')}
              </p>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Rent</span>
                  <span className="font-medium">{stats.listingsRent}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Buy (New/Used)</span>
                  <span className="font-medium">{stats.listingsBuy}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Services</span>
                  <span className="font-medium">{stats.listingsService}</span>
                </div>
              </div>
            </div> */}
            {/* <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="mb-2">
                <img
                  src={liveListingIcon.src}
                  alt="Live Listings"
                  className="w-8 h-8"
                />
              </div>

              <p className="text-[11px] font-medium text-gray-500 tracking-wide">
                LIVE LISTINGS
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalListings.toLocaleString('en-IN')}
              </p>

              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Rent</span>
                    <span className="font-medium">{stats.listingsRent}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${rentPercent}%`,
                        backgroundColor: '#3B82F6',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Buy (New/Used)</span>
                    <span className="font-medium">{stats.listingsBuy}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${buyPercent}%`,
                        backgroundColor: '#8B5CF6',
                      }}
                    />
                  </div>
                </div>

            
                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Services</span>
                    <span className="font-medium">{stats.listingsService}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${servicePercent}%`,
                        backgroundColor: '#F97316',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div> */}
            {/* <div className="bg-white rounded-2xl border border-rose-200 p-5">
              <div className="flex items-center justify-between">
               
                <img
                  src={criticalIcon.src}
                  alt="Critical"
                  className="w-8 h-8"
                />

            
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  CRITICAL
                </span>
              </div>
              <p className="mt-3 text-4xl font-bold text-rose-600">
                {stats.delayedOrders}
              </p>
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => router.push('/orders')}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white text-base font-medium"
                >
                  Approve now
                </button>
              </div>
            </div> */}
          </div>

          {/* <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 mb-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Refund Approval
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review and approve refund requests
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/system/refund-approval')}
              className="shrink-0 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              Go to Refund Approval →
            </button>
          </div> */}

          <CityDashboardSection />

          {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5"> */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 mt-4">
            {/* <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 min-h-[300px]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Live Order Activity (Pune)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Geographic distribution &amp; hotspots
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Top: Wakad (45 Orders)
                </span>
              </div>
              <div className="h-[240px] sm:h-[300px] rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-orange-50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,#f97316_0,transparent_20%),radial-gradient(circle_at_65%_40%,#3b82f6_0,transparent_22%),radial-gradient(circle_at_45%_70%,#ef4444_0,transparent_18%)]" />
                <div className="absolute top-8 left-10 w-7 h-7 rounded-full bg-rose-500/80 border-4 border-white shadow" />
                <div className="absolute top-20 left-1/3 w-8 h-8 rounded-full bg-orange-500/80 border-4 border-white shadow" />
                <div className="absolute top-1/2 right-1/4 w-7 h-7 rounded-full bg-blue-500/80 border-4 border-white shadow" />
                <div className="absolute bottom-10 left-1/2 w-9 h-9 rounded-full bg-red-500/80 border-4 border-white shadow" />
                <div className="absolute bottom-3 right-3 text-[11px] text-gray-500 bg-white/90 border rounded-lg px-2 py-1">
                  Dummy map preview
                </div>
              </div>
            </div> */}
            {/* 
            <LiveOrderActivitySection
              vendors={vendors}
              orders={orders}
              stores={stores}
              products={products}
            /> */}

            <div
              id="live-feed"
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5"
            >
              {/* <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Live Feed
                  </h2>
                  <p className="text-xs text-gray-500">
                    Recent platform events
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div> */}
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-black">
                      Live Feed
                    </h2>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Recent platform events
                  </p>
                </div>
                {/* <button
                  type="button"
                  onClick={handleExportPdf}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button> */}
              </div>
              {/* <ul className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
                {visibleFeed.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                  > */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
                {visibleFeed.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition-all duration-200 hover:bg-white hover:border-orange-200 hover:shadow-md cursor-pointer"
                  >
                    <p className="text-base text-black font-medium">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-700">{item.subtitle}</p>
                    <p className="text-xs text-gray-700 mt-1">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowAllFeed((v) => !v)}
                className="mt-4 w-full text-sm font-semibold rounded-lg border-2 border-orange-300 text-orange-600 py-2 hover:bg-orange-50"
              >
                {showAllFeed ? 'Show Less Activity' : 'View All Activity'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Dashboard;
